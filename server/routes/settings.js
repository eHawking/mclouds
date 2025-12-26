const express = require('express');
const db = require('../database/connection');
const { authenticate, requireRole } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Get public settings (no auth required)
router.get('/public', async (req, res) => {
  try {
    const settings = await db.query('SELECT setting_key, setting_value, setting_type FROM settings WHERE is_public = TRUE');

    const result = {};
    for (const s of settings) {
      if (s.setting_type === 'json') {
        try {
          result[s.setting_key] = JSON.parse(s.setting_value);
        } catch {
          result[s.setting_key] = s.setting_value;
        }
      } else if (s.setting_type === 'number') {
        result[s.setting_key] = parseFloat(s.setting_value);
      } else if (s.setting_type === 'boolean') {
        result[s.setting_key] = s.setting_value === 'true';
      } else {
        result[s.setting_key] = s.setting_value;
      }
    }

    res.json({ settings: result });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// Get all settings (admin only)
router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { category } = req.query;

    let query = 'SELECT * FROM settings';
    const params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY category, setting_key';

    const settings = await db.query(query, params);

    res.json({
      settings: settings.map(s => ({
        ...s,
        setting_value: s.setting_type === 'json' ? JSON.parse(s.setting_value || '{}') : s.setting_value
      }))
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// Update settings (admin only)
router.put('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { settings } = req.body;

    // Define which settings should be public
    const publicSettings = [
      'site_name', 'site_tagline', 'site_logo', 'site_favicon',
      'contact_email', 'contact_phone',
      'header_logo_dark', 'header_logo_height',
      'footer_logo', 'footer_logo_dark', 'footer_logo_height',
      'partner_logos'
    ];

    for (const [key, value] of Object.entries(settings)) {
      const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
      const isPublic = publicSettings.includes(key);

      // Check if setting exists
      const existing = await db.query('SELECT id FROM settings WHERE setting_key = ?', [key]);

      if (existing && existing.length > 0) {
        await db.query(
          'UPDATE settings SET setting_value = ?, is_public = ? WHERE setting_key = ?',
          [settingValue, isPublic, key]
        );
      } else {
        await db.query(
          'INSERT INTO settings (setting_key, setting_value, is_public) VALUES (?, ?, ?)',
          [key, settingValue, isPublic]
        );
      }
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// NOTE: Wildcard routes (/:key) moved to end of file to prevent route conflicts

// Get datacenters (public)
router.get('/datacenters', async (req, res) => {
  try {
    const datacenters = await db.query('SELECT * FROM datacenters WHERE is_active = TRUE ORDER BY name');
    res.json({ datacenters });
  } catch (error) {
    console.error('Get datacenters error:', error);
    res.status(500).json({ error: 'Failed to load datacenters' });
  }
});

// Get announcements (public)
router.get('/announcements', async (req, res) => {
  try {
    const { location } = req.query;

    let query = `
      SELECT * FROM announcements 
      WHERE is_active = TRUE
      AND (starts_at IS NULL OR starts_at <= NOW())
      AND (expires_at IS NULL OR expires_at > NOW())
    `;

    if (location === 'home') {
      query += ' AND show_on_home = TRUE';
    } else if (location === 'dashboard') {
      query += ' AND show_on_dashboard = TRUE';
    }

    query += ' ORDER BY created_at DESC';

    const announcements = await db.query(query);
    res.json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to load announcements' });
  }
});

// Get translations
router.get('/translations/:locale', async (req, res) => {
  try {
    const translations = await db.query('SELECT translation_key, translation_value FROM translations WHERE locale = ?', [req.params.locale]);

    const result = {};
    for (const t of translations) {
      result[t.translation_key] = t.translation_value;
    }

    res.json({ translations: result });
  } catch (error) {
    console.error('Get translations error:', error);
    res.status(500).json({ error: 'Failed to load translations' });
  }
});

// Get pricing data (public)
router.get('/pricing', async (req, res) => {
  try {
    const settings = await db.query(
      "SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE 'pricing_%'"
    );

    const pricing = {};
    for (const s of settings) {
      const key = s.setting_key.replace('pricing_', '');
      try {
        pricing[key] = JSON.parse(s.setting_value);
      } catch {
        pricing[key] = s.setting_value;
      }
    }

    // Default pricing if not set
    if (!pricing.hosting) {
      pricing.hosting = [
        { name: 'Starter Hosting', price: 2.99, features: ['1 Website', '10 GB SSD Storage', 'Free SSL Certificate', 'Weekly Backups', '24/7 Support', 'cPanel Access'], color: 'from-blue-500 to-cyan-500' },
        { name: 'Professional Hosting', price: 5.99, popular: true, features: ['Unlimited Websites', '50 GB SSD Storage', 'Free SSL Certificate', 'Daily Backups', 'Priority Support', 'cPanel Access', 'Free Domain'], color: 'from-primary-500 to-purple-500' },
        { name: 'Business Hosting', price: 9.99, features: ['Unlimited Websites', '100 GB NVMe Storage', 'Free SSL Certificate', 'Real-time Backups', 'Dedicated Support', 'cPanel Access', 'Free Domain', 'Staging Environment'], color: 'from-purple-500 to-pink-500' }
      ];
    }
    if (!pricing.ssl) {
      pricing.ssl = [
        { name: 'Domain Validation', description: 'Basic encryption for personal sites', price: 9.99, features: ['Single Domain', '256-bit Encryption', 'Browser Trust', '10 Min Issuance', '$10K Warranty'], color: 'from-green-500 to-emerald-500' },
        { name: 'Organization Validation', description: 'Business identity verification', price: 49.99, popular: true, features: ['Single Domain', 'Company Verification', 'Site Seal', '1-3 Day Issuance', '$250K Warranty'], color: 'from-blue-500 to-cyan-500' },
        { name: 'Extended Validation', description: 'Maximum trust & green bar', price: 149.99, features: ['Single Domain', 'Green Address Bar', 'Full Verification', '3-5 Day Issuance', '$1M Warranty'], color: 'from-purple-500 to-pink-500' },
        { name: 'Wildcard SSL', description: 'Secure unlimited subdomains', price: 99.99, features: ['Unlimited Subdomains', '256-bit Encryption', 'Browser Trust', '10 Min Issuance', '$500K Warranty'], color: 'from-orange-500 to-red-500' }
      ];
    }
    if (!pricing.vps) {
      pricing.vps = [
        { name: 'VPS Starter', price: 5.99, cpu: '1 vCPU', ram: '1 GB', storage: '25 GB SSD', bandwidth: '1 TB', color: 'from-blue-500 to-cyan-500' },
        { name: 'VPS Professional', price: 12.99, popular: true, cpu: '2 vCPU', ram: '4 GB', storage: '80 GB SSD', bandwidth: '3 TB', color: 'from-primary-500 to-purple-500' },
        { name: 'VPS Business', price: 24.99, cpu: '4 vCPU', ram: '8 GB', storage: '160 GB SSD', bandwidth: '5 TB', color: 'from-purple-500 to-pink-500' }
      ];
    }
    if (!pricing.dedicated) {
      pricing.dedicated = [
        { name: 'Entry Server', price: 79.99, cpu: 'Intel Xeon E3', ram: '16 GB DDR4', storage: '500 GB SSD', bandwidth: '10 TB', color: 'from-blue-500 to-cyan-500' },
        { name: 'Business Server', price: 149.99, popular: true, cpu: 'Intel Xeon E5', ram: '32 GB DDR4', storage: '1 TB SSD', bandwidth: '20 TB', color: 'from-primary-500 to-purple-500' },
        { name: 'Enterprise Server', price: 299.99, cpu: 'Dual Xeon Gold', ram: '64 GB DDR4', storage: '2 TB NVMe', bandwidth: 'Unlimited', color: 'from-purple-500 to-pink-500' }
      ];
    }

    res.json({ pricing });
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ error: 'Failed to load pricing' });
  }
});

// Update pricing (admin only)
router.put('/pricing', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { category, plans } = req.body;
    const key = `pricing_${category}`;
    const value = JSON.stringify(plans);

    const existing = await db.query('SELECT id FROM settings WHERE setting_key = ?', [key]);

    if (existing && existing.length > 0) {
      await db.query(
        'UPDATE settings SET setting_value = ?, setting_type = ?, is_public = TRUE WHERE setting_key = ?',
        [value, 'json', key]
      );
    } else {
      await db.query(
        'INSERT INTO settings (setting_key, setting_value, setting_type, is_public, category) VALUES (?, ?, ?, TRUE, ?)',
        [key, value, 'json', 'pricing']
      );
    }

    res.json({ message: 'Pricing updated successfully' });
  } catch (error) {
    console.error('Update pricing error:', error);
    res.status(500).json({ error: 'Failed to update pricing' });
  }
});

// Currency conversion rates (mock - in production, use real API)
router.get('/currencies', async (req, res) => {
  try {
    const rates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      BDT: 110,
      INR: 83,
      SGD: 1.35,
      AUD: 1.53
    };

    res.json({ base: 'USD', rates });
  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(500).json({ error: 'Failed to load currencies' });
  }
});

// Get payment gateway settings (admin only)
router.get('/payment-gateway', authenticate, requireRole('admin'), async (req, res) => {
  try {
    // Query all payment gateway settings
    const results = await db.query(
      `SELECT setting_key, setting_value FROM settings WHERE setting_key IN (
        'stripe_enabled', 'stripe_mode', 
        'stripe_publishable_key_test', 'stripe_secret_key_test',
        'stripe_publishable_key_live', 'stripe_secret_key_live',
        'stripe_webhook_secret',
        'paypal_enabled', 'paypal_mode',
        'paypal_client_id_sandbox', 'paypal_secret_sandbox',
        'paypal_client_id_live', 'paypal_secret_live',
        'bkash_enabled', 'bkash_number', 'bkash_account_type', 'bkash_instructions',
        'rocket_enabled', 'rocket_number', 'rocket_account_type', 'rocket_instructions',
        'bank_transfer_enabled', 'bank_name', 'bank_account_number',
        'bank_account_holder', 'bank_additional_info',
        'cash_payment_enabled', 'cash_payment_instructions'
      )`
    );

    // Build settings object
    const settings = {};
    const booleanKeys = [
      'stripe_enabled', 'paypal_enabled', 'bkash_enabled',
      'rocket_enabled', 'bank_transfer_enabled', 'cash_payment_enabled'
    ];

    if (results && Array.isArray(results)) {
      results.forEach(row => {
        if (row && row.setting_key) {
          // Convert boolean string values to actual booleans
          if (booleanKeys.includes(row.setting_key)) {
            settings[row.setting_key] = row.setting_value === 'true' || row.setting_value === '1';
          } else {
            settings[row.setting_key] = row.setting_value || '';
          }
        }
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Get payment gateway error:', error);
    res.status(500).json({ error: 'Failed to load payment gateway settings' });
  }
});

// Update payment gateway settings (admin only)
router.put('/payment-gateway', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const settings = req.body;

    // List of boolean keys that should be stored as 'true' or 'false'
    const booleanKeys = [
      'stripe_enabled', 'paypal_enabled', 'bkash_enabled',
      'rocket_enabled', 'bank_transfer_enabled', 'cash_payment_enabled'
    ];

    for (const [key, value] of Object.entries(settings)) {
      let dbValue;
      let settingType;

      // Handle boolean fields - convert to 'true' or 'false' string
      if (booleanKeys.includes(key)) {
        dbValue = value === true || value === 'true' ? 'true' : 'false';
        settingType = 'boolean';
      } else {
        dbValue = value !== null && value !== undefined ? String(value) : '';
        settingType = 'string';
      }

      // Check if setting exists
      const existing = await db.query('SELECT id FROM settings WHERE setting_key = ?', [key]);

      if (existing && existing.length > 0) {
        // Update existing setting
        await db.query(
          `UPDATE settings SET setting_value = ?, setting_type = ? WHERE setting_key = ?`,
          [dbValue, settingType, key]
        );
      } else {
        // Insert new setting
        await db.query(
          `INSERT INTO settings (setting_key, setting_value, setting_type, category)
           VALUES (?, ?, ?, 'payment')`,
          [key, dbValue, settingType]
        );
      }
    }

    res.json({ message: 'Payment gateway settings saved' });
  } catch (error) {
    console.error('Update payment gateway error:', error);
    res.status(500).json({ error: 'Failed to save payment gateway settings' });
  }
});

// Test payment gateway connection
router.post('/payment-gateway/test', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { gateway } = req.body;

    if (gateway === 'stripe') {
      // Get Stripe keys from settings
      const modeResult = await db.query("SELECT setting_value FROM settings WHERE setting_key = 'stripe_mode'");
      const mode = modeResult[0]?.setting_value || 'test';

      const keyName = mode === 'live' ? 'stripe_secret_key_live' : 'stripe_secret_key_test';
      const keyResult = await db.query("SELECT setting_value FROM settings WHERE setting_key = ?", [keyName]);
      const secretKey = keyResult[0]?.setting_value;

      if (!secretKey) {
        return res.json({ success: false, error: 'Secret key not configured' });
      }

      // Test connection by checking account
      const stripe = require('stripe')(secretKey);
      await stripe.accounts.retrieve();

      res.json({ success: true, message: 'Stripe connection successful' });
    } else {
      res.json({ success: false, error: 'Unknown gateway' });
    }
  } catch (error) {
    console.error('Test payment gateway error:', error);
    res.json({ success: false, error: error.message });
  }
});

// Get payment methods and bank details (public)
router.get('/payment-methods', async (req, res) => {
  try {
    // Query all payment-related settings directly
    const results = await db.query(
      `SELECT setting_key, setting_value FROM settings WHERE setting_key IN (
        'stripe_enabled', 'paypal_enabled', 'bkash_enabled', 'rocket_enabled',
        'bank_transfer_enabled', 'cash_payment_enabled',
        'bank_name', 'bank_account_number', 'bank_account_holder', 'bank_additional_info',
        'bkash_number', 'bkash_account_type', 'bkash_instructions',
        'rocket_number', 'rocket_account_type', 'rocket_instructions',
        'cash_payment_instructions'
      )`
    );

    // Build settings object from database results
    const settings = {};
    if (results && Array.isArray(results)) {
      results.forEach(row => {
        if (row && row.setting_key) {
          settings[row.setting_key] = row.setting_value;
        }
      });
    }

    // Helper to parse boolean from DB value
    const parseBool = (val) => val === 'true' || val === '1' || val === true;

    // Return payment settings with explicit boolean conversion
    res.json({
      stripe_enabled: parseBool(settings.stripe_enabled),
      paypal_enabled: parseBool(settings.paypal_enabled),
      bkash_enabled: parseBool(settings.bkash_enabled),
      rocket_enabled: parseBool(settings.rocket_enabled),
      bank_transfer_enabled: parseBool(settings.bank_transfer_enabled),
      cash_payment_enabled: parseBool(settings.cash_payment_enabled),
      bank_details: {
        bank_name: settings.bank_name || '',
        account_number: settings.bank_account_number || '',
        account_holder: settings.bank_account_holder || '',
        additional_info: settings.bank_additional_info || ''
      },
      bkash_details: {
        number: settings.bkash_number || '',
        account_type: settings.bkash_account_type || 'personal',
        instructions: settings.bkash_instructions || ''
      },
      rocket_details: {
        number: settings.rocket_number || '',
        account_type: settings.rocket_account_type || 'personal',
        instructions: settings.rocket_instructions || ''
      },
      cash_instructions: settings.cash_payment_instructions || ''
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    // Return default values instead of error
    res.json({
      stripe_enabled: false,
      paypal_enabled: false,
      bkash_enabled: false,
      rocket_enabled: false,
      bank_transfer_enabled: false,
      cash_payment_enabled: false,
      bank_details: { bank_name: '', account_number: '', account_holder: '', additional_info: '' },
      bkash_details: { number: '', account_type: 'personal', instructions: '' },
      rocket_details: { number: '', account_type: 'personal', instructions: '' },
      cash_instructions: 'Contact us to arrange payment.'
    });
  }
});

// Get email settings (admin only)
router.get('/email', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const keys = [
      'mailgun_enabled', 'mailgun_api_key', 'mailgun_domain',
      'mailgun_from_email', 'mailgun_from_name', 'mailgun_region',
      'welcome_email', 'password_reset', 'order_placed', 'order_confirmed',
      'order_processing', 'order_completed', 'order_cancelled',
      'ticket_created', 'ticket_replied', 'ticket_closed',
      'invoice_generated', 'payment_received', 'service_expiring', 'service_suspended'
    ];

    // Build placeholders: (?, ?, ?, ...)
    const placeholders = keys.map(() => '?').join(', ');

    const results = await db.query(
      `SELECT setting_key, setting_value, setting_type FROM settings WHERE setting_key IN (${placeholders})`,
      keys
    );

    // Start with defaults
    const settings = {
      mailgun_enabled: false,
      mailgun_api_key: '',
      mailgun_domain: '',
      mailgun_from_email: '',
      mailgun_from_name: 'Magnetic Clouds',
      mailgun_region: 'us',
      welcome_email: true,
      password_reset: true,
      order_placed: true,
      order_confirmed: true,
      order_processing: true,
      order_completed: true,
      order_cancelled: true,
      ticket_created: true,
      ticket_replied: true,
      ticket_closed: true,
      invoice_generated: true,
      payment_received: true,
      service_expiring: true,
      service_suspended: true
    };

    // Override with database values
    if (results && Array.isArray(results)) {
      results.forEach(row => {
        if (row && row.setting_key) {
          let value = row.setting_value;
          if (row.setting_type === 'boolean') {
            value = value === 'true' || value === '1';
          }
          settings[row.setting_key] = value;
        }
      });
    }

    console.log('Loaded email settings:', Object.keys(settings).length, 'keys');

    res.json({ settings });
  } catch (error) {
    console.error('Get email settings error:', error);
    res.status(500).json({ error: 'Failed to load email settings' });
  }
});

// Update email settings (admin only)
router.put('/email', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const settings = req.body;

    console.log('=== SAVING EMAIL SETTINGS ===');
    console.log('Settings keys:', Object.keys(settings));
    console.log('Settings count:', Object.keys(settings).length);

    let savedCount = 0;
    const errors = [];

    for (const [key, value] of Object.entries(settings)) {
      try {
        // Determine setting type based on value
        let settingType = 'string';
        let dbValue = '';

        if (typeof value === 'boolean') {
          settingType = 'boolean';
          dbValue = value ? 'true' : 'false';
        } else if (value === null || value === undefined) {
          dbValue = '';
        } else {
          dbValue = String(value);
        }

        console.log(`Saving: ${key} = "${dbValue}" (type: ${settingType})`);

        const result = await db.query(
          `INSERT INTO settings (setting_key, setting_value, setting_type, category, is_public)
           VALUES (?, ?, ?, 'email', FALSE)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), setting_type = VALUES(setting_type)`,
          [key, dbValue, settingType]
        );

        console.log(`Result for ${key}:`, result.affectedRows ? 'success' : 'no change');
        savedCount++;
      } catch (settingError) {
        console.error(`Error saving ${key}:`, settingError.message);
        errors.push({ key, error: settingError.message });
      }
    }

    // Verify settings were saved by reading them back
    const verifyResult = await db.query(
      "SELECT COUNT(*) as count FROM settings WHERE category = 'email'"
    );
    console.log('Email settings in database:', verifyResult[0]?.count);

    console.log(`=== SAVE COMPLETE: ${savedCount}/${Object.keys(settings).length} settings saved ===`);

    if (errors.length > 0) {
      console.error('Some settings failed to save:', errors);
      return res.status(500).json({
        error: 'Some settings failed to save',
        details: errors,
        savedCount
      });
    }

    res.json({ message: 'Email settings saved', savedCount });
  } catch (error) {
    console.error('Update email settings error:', error);
    res.status(500).json({ error: 'Failed to save email settings: ' + error.message });
  }
});

// Test email (admin only)
router.post('/email/test', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address required' });
    }

    const emailService = require('../services/emailService');
    await emailService.sendTestEmail(email);

    res.json({ success: true, message: 'Test email sent' });
  } catch (error) {
    console.error('Test email error:', error);
    res.json({ success: false, error: error.message });
  }
});

// Get custom VPS pricing (public)
router.get('/custom-vps-pricing', async (req, res) => {
  try {
    const result = await db.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'custom_vps_pricing'"
    );

    const defaultPricing = {
      cpu_price_per_core: 3.00,
      ram_price_per_gb: 1.50,
      storage_price_per_gb: 0.05,
      bandwidth_price_per_tb: 1.00,
      min_cpu: 1, min_ram: 1, min_storage: 20, min_bandwidth: 1,
      max_cpu: 32, max_ram: 128, max_storage: 2000, max_bandwidth: 100,
      cpu_step: 1, ram_step: 1, storage_step: 10, bandwidth_step: 1,
      base_fee: 2.00,
      ddos_protection_price: 5.00,
      backup_price: 3.00,
      managed_support_price: 10.00,
    };

    let pricing = defaultPricing;
    if (result[0]?.setting_value) {
      try {
        pricing = { ...defaultPricing, ...JSON.parse(result[0].setting_value) };
      } catch (e) { }
    }

    res.json({ pricing });
  } catch (error) {
    console.error('Get custom VPS pricing error:', error);
    res.status(500).json({ error: 'Failed to load pricing' });
  }
});

// Update custom VPS pricing (admin only)
router.put('/custom-vps-pricing', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const pricing = req.body;
    const value = JSON.stringify(pricing);

    const existing = await db.query("SELECT id FROM settings WHERE setting_key = 'custom_vps_pricing'");

    if (existing && existing.length > 0) {
      await db.query(
        "UPDATE settings SET setting_value = ?, setting_type = 'json', is_public = TRUE WHERE setting_key = 'custom_vps_pricing'",
        [value]
      );
    } else {
      await db.query(
        "INSERT INTO settings (setting_key, setting_value, setting_type, is_public, category) VALUES ('custom_vps_pricing', ?, 'json', TRUE, 'pricing')",
        [value]
      );
    }

    res.json({ message: 'Custom VPS pricing saved' });
  } catch (error) {
    console.error('Update custom VPS pricing error:', error);
    res.status(500).json({ error: 'Failed to save pricing' });
  }
});

// Get Stripe publishable key (public)
router.get('/stripe-key', async (req, res) => {
  try {
    const modeResult = await db.query("SELECT setting_value FROM settings WHERE setting_key = 'stripe_mode'");
    const enabledResult = await db.query("SELECT setting_value FROM settings WHERE setting_key = 'stripe_enabled'");

    const mode = modeResult[0]?.setting_value || 'test';
    const enabled = enabledResult[0]?.setting_value === 'true';

    if (!enabled) {
      return res.json({ enabled: false });
    }

    const keyName = mode === 'live' ? 'stripe_publishable_key_live' : 'stripe_publishable_key_test';
    const keyResult = await db.query("SELECT setting_value FROM settings WHERE setting_key = ?", [keyName]);

    res.json({
      enabled: true,
      publishableKey: keyResult[0]?.setting_value,
      mode
    });
  } catch (error) {
    console.error('Get Stripe key error:', error);
    res.status(500).json({ error: 'Failed to get Stripe key' });
  }
});

// Update page visibility (admin only)
router.put('/page-visibility', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { key, visible } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const dbValue = visible ? 'true' : 'false';

    // Check if setting exists
    const existing = await db.query('SELECT id FROM settings WHERE setting_key = ?', [key]);

    if (existing && existing.length > 0) {
      await db.query(
        'UPDATE settings SET setting_value = ?, setting_type = ?, is_public = TRUE WHERE setting_key = ?',
        [dbValue, 'boolean', key]
      );
    } else {
      await db.query(
        'INSERT INTO settings (setting_key, setting_value, setting_type, category, is_public) VALUES (?, ?, ?, ?, TRUE)',
        [key, dbValue, 'boolean', 'pages']
      );
    }

    res.json({ message: 'Page visibility updated' });
  } catch (error) {
    console.error('Update page visibility error:', error);
    res.status(500).json({ error: 'Failed to update page visibility' });
  }
});

// Bulk update settings (admin only)
router.put('/bulk', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' });
    }

    for (const [key, value] of Object.entries(settings)) {
      const settingType = typeof value === 'boolean' ? 'boolean' : 'string';
      const dbValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value);

      const existing = await db.query('SELECT id FROM settings WHERE setting_key = ?', [key]);

      if (existing && existing.length > 0) {
        await db.query(
          'UPDATE settings SET setting_value = ?, setting_type = ?, is_public = TRUE WHERE setting_key = ?',
          [dbValue, settingType, key]
        );
      } else {
        await db.query(
          'INSERT INTO settings (setting_key, setting_value, setting_type, category, is_public) VALUES (?, ?, ?, ?, TRUE)',
          [key, dbValue, settingType, 'pages']
        );
      }
    }

    res.json({ message: 'Settings updated' });
  } catch (error) {
    console.error('Bulk update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get server management settings (admin only)
router.get('/server-management', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const keys = [
      'plesk_enabled', 'plesk_hostname', 'plesk_port', 'plesk_username',
      'plesk_password', 'plesk_api_key', 'plesk_auth_method', 'plesk_verify_ssl'
    ];

    const results = await db.query(
      `SELECT setting_key, setting_value FROM settings WHERE setting_key IN (${keys.map(() => '?').join(', ')})`,
      keys
    );

    const settings = {};
    if (results && Array.isArray(results)) {
      results.forEach(row => {
        const key = row.setting_key.replace('plesk_', '');
        let value = row.setting_value;
        if (key === 'enabled' || key === 'verify_ssl') {
          value = value === 'true' || value === '1';
        }
        settings[key] = value;
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Get server management error:', error);
    res.status(500).json({ error: 'Failed to load server management settings' });
  }
});

// Update server management settings (admin only)
router.put('/server-management', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const config = req.body;

    const keyMap = {
      enabled: 'plesk_enabled',
      hostname: 'plesk_hostname',
      port: 'plesk_port',
      username: 'plesk_username',
      password: 'plesk_password',
      api_key: 'plesk_api_key',
      auth_method: 'plesk_auth_method',
      verify_ssl: 'plesk_verify_ssl'
    };

    for (const [key, value] of Object.entries(config)) {
      const dbKey = keyMap[key];
      if (!dbKey) continue;

      const settingType = typeof value === 'boolean' ? 'boolean' : 'string';
      const dbValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value || '');

      const existing = await db.query('SELECT id FROM settings WHERE setting_key = ?', [dbKey]);

      if (existing && existing.length > 0) {
        await db.query(
          'UPDATE settings SET setting_value = ?, setting_type = ? WHERE setting_key = ?',
          [dbValue, settingType, dbKey]
        );
      } else {
        await db.query(
          'INSERT INTO settings (setting_key, setting_value, setting_type, category) VALUES (?, ?, ?, ?)',
          [dbKey, dbValue, settingType, 'server']
        );
      }
    }

    res.json({ message: 'Server management settings saved' });
  } catch (error) {
    console.error('Update server management error:', error);
    res.status(500).json({ error: 'Failed to save server management settings' });
  }
});

// Test Plesk connection (admin only)
router.post('/server-management/test', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { hostname, port, username, password, api_key, auth_method, verify_ssl } = req.body;

    if (!hostname) {
      return res.status(400).json({ error: 'Hostname is required' });
    }

    const https = require('https');
    const http = require('http');

    // Build Plesk API URL
    const pleskUrl = `https://${hostname}:${port || 8443}/api/v2/server`;

    // Build auth headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (auth_method === 'api_key' && api_key) {
      headers['X-API-Key'] = api_key;
    } else if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    } else {
      return res.status(400).json({ error: 'Authentication credentials required' });
    }

    // Make request to Plesk API
    const fetch = require('node-fetch');
    const agent = new https.Agent({
      rejectUnauthorized: verify_ssl !== false
    });

    const response = await fetch(pleskUrl, {
      method: 'GET',
      headers,
      agent,
      timeout: 10000
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Plesk API error:', response.status, errorText);
      return res.json({
        success: false,
        error: `Connection failed: ${response.status} ${response.statusText}`
      });
    }

    const serverData = await response.json();

    // Get additional stats - domains count
    let domainsCount = 0;
    let clientsCount = 0;

    try {
      const domainsResponse = await fetch(`https://${hostname}:${port || 8443}/api/v2/domains`, {
        method: 'GET',
        headers,
        agent
      });
      if (domainsResponse.ok) {
        const domains = await domainsResponse.json();
        domainsCount = Array.isArray(domains) ? domains.length : 0;
      }
    } catch (e) {
      console.log('Could not fetch domains count');
    }

    try {
      const clientsResponse = await fetch(`https://${hostname}:${port || 8443}/api/v2/clients`, {
        method: 'GET',
        headers,
        agent
      });
      if (clientsResponse.ok) {
        const clients = await clientsResponse.json();
        clientsCount = Array.isArray(clients) ? clients.length : 0;
      }
    } catch (e) {
      console.log('Could not fetch clients count');
    }

    res.json({
      success: true,
      serverInfo: {
        hostname: serverData.hostname || hostname,
        version: serverData.panel_version || serverData.version || 'Unknown',
        os: serverData.platform || serverData.os || 'Unknown',
        domains: domainsCount,
        clients: clientsCount
      }
    });
  } catch (error) {
    console.error('Plesk connection test error:', error);
    res.json({
      success: false,
      error: error.message || 'Failed to connect to Plesk server'
    });
  }
});

// Get page content (public)
router.get('/page-content/:slug', async (req, res) => {
  try {
    const slug = decodeURIComponent(req.params.slug);
    const key = `page_content_${slug.replace(/\//g, '_')}`;

    const result = await db.query(
      "SELECT setting_value FROM settings WHERE setting_key = ?",
      [key]
    );

    if (result && result.length > 0) {
      try {
        const pageData = JSON.parse(result[0].setting_value);
        res.json({ pageData });
      } catch (e) {
        res.json({ pageData: null });
      }
    } else {
      res.json({ pageData: null });
    }
  } catch (error) {
    console.error('Get page content error:', error);
    res.status(500).json({ error: 'Failed to load page content' });
  }
});

// Update page content (admin only)
router.put('/page-content/:slug', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const slug = decodeURIComponent(req.params.slug);
    const { pageData } = req.body;
    const key = `page_content_${slug.replace(/\//g, '_')}`;
    const value = JSON.stringify(pageData);

    const existing = await db.query("SELECT id FROM settings WHERE setting_key = ?", [key]);

    if (existing && existing.length > 0) {
      await db.query(
        "UPDATE settings SET setting_value = ?, setting_type = 'json', is_public = TRUE WHERE setting_key = ?",
        [value, key]
      );
    } else {
      await db.query(
        "INSERT INTO settings (setting_key, setting_value, setting_type, category, is_public) VALUES (?, ?, 'json', 'pages', TRUE)",
        [key, value]
      );
    }

    res.json({ message: 'Page content saved successfully' });
  } catch (error) {
    console.error('Update page content error:', error);
    res.status(500).json({ error: 'Failed to save page content' });
  }
});

// Get header/footer settings (public)
router.get('/header-footer', async (req, res) => {
  try {
    const settings = await db.query(
      "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('header_settings', 'footer_settings')"
    );

    let headerSettings = null;
    let footerSettings = null;

    for (const s of settings) {
      try {
        if (s.setting_key === 'header_settings') {
          headerSettings = JSON.parse(s.setting_value);
        } else if (s.setting_key === 'footer_settings') {
          footerSettings = JSON.parse(s.setting_value);
        }
      } catch (e) {
        console.error('Failed to parse setting:', s.setting_key, e);
      }
    }

    res.json({ headerSettings, footerSettings });
  } catch (error) {
    console.error('Get header/footer settings error:', error);
    res.status(500).json({ error: 'Failed to load header/footer settings' });
  }
});

// Update header/footer settings (admin only)
router.put('/header-footer', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { headerSettings, footerSettings } = req.body;

    if (headerSettings) {
      const headerValue = JSON.stringify(headerSettings);
      const existing = await db.query("SELECT id FROM settings WHERE setting_key = 'header_settings'");

      if (existing && existing.length > 0) {
        await db.query(
          "UPDATE settings SET setting_value = ?, setting_type = 'json', is_public = TRUE WHERE setting_key = 'header_settings'",
          [headerValue]
        );
      } else {
        await db.query(
          "INSERT INTO settings (setting_key, setting_value, setting_type, category, is_public) VALUES ('header_settings', ?, 'json', 'appearance', TRUE)",
          [headerValue]
        );
      }
    }

    if (footerSettings) {
      const footerValue = JSON.stringify(footerSettings);
      const existing = await db.query("SELECT id FROM settings WHERE setting_key = 'footer_settings'");

      if (existing && existing.length > 0) {
        await db.query(
          "UPDATE settings SET setting_value = ?, setting_type = 'json', is_public = TRUE WHERE setting_key = 'footer_settings'",
          [footerValue]
        );
      } else {
        await db.query(
          "INSERT INTO settings (setting_key, setting_value, setting_type, category, is_public) VALUES ('footer_settings', ?, 'json', 'appearance', TRUE)",
          [footerValue]
        );
      }
    }

    res.json({ message: 'Header & footer settings updated successfully' });
  } catch (error) {
    console.error('Update header/footer settings error:', error);
    res.status(500).json({ error: 'Failed to update header/footer settings' });
  }
});

// ============================================
// EMAIL TEMPLATES ENDPOINTS
// ============================================

// Default templates (used when no custom template exists)
const defaultTemplates = {
  welcome_email: {
    name: 'Welcome Email',
    description: 'Sent when a new user registers',
    subject: 'Welcome to {{site_name}}!',
    variables: ['user_name', 'site_name', 'site_url']
  },
  password_reset: {
    name: 'Password Reset',
    description: 'Sent when user requests password reset',
    subject: 'Reset Your Password - {{site_name}}',
    variables: ['user_name', 'reset_link', 'site_name']
  },
  newsletter_subscribe: {
    name: 'Newsletter Confirmation',
    description: 'Sent when user subscribes to newsletter',
    subject: 'Welcome to {{site_name}} Newsletter! 🎉',
    variables: ['site_name', 'site_url', 'email']
  },
  order_placed: {
    name: 'Order Placed',
    description: 'Sent when order is placed',
    subject: 'Order Confirmation #{{order_id}} - {{site_name}}',
    variables: ['user_name', 'order_id', 'order_date', 'order_total', 'payment_status', 'order_items']
  },
  order_confirmed: {
    name: 'Payment Confirmed',
    description: 'Sent when payment is confirmed',
    subject: 'Payment Confirmed - Order #{{order_id}} - {{site_name}}',
    variables: ['user_name', 'order_id', 'order_total']
  },
  order_completed: {
    name: 'Service Activated',
    description: 'Sent when services are activated',
    subject: 'Your Service is Active - Order #{{order_id}} - {{site_name}}',
    variables: ['user_name', 'order_id']
  },
  order_cancelled: {
    name: 'Order Cancelled',
    description: 'Sent when order is cancelled',
    subject: 'Order Cancelled - #{{order_id}} - {{site_name}}',
    variables: ['user_name', 'order_id']
  },
  ticket_created: {
    name: 'Ticket Created',
    description: 'Sent when support ticket is created',
    subject: 'Ticket Created #{{ticket_id}} - {{site_name}}',
    variables: ['user_name', 'ticket_id', 'ticket_subject', 'ticket_priority']
  },
  ticket_replied: {
    name: 'Ticket Reply',
    description: 'Sent when ticket receives a reply',
    subject: 'New Reply on Ticket #{{ticket_id}} - {{site_name}}',
    variables: ['user_name', 'ticket_id', 'ticket_subject', 'reply_from', 'reply_message']
  },
  ticket_closed: {
    name: 'Ticket Resolved',
    description: 'Sent when ticket is closed',
    subject: 'Ticket Closed #{{ticket_id}} - {{site_name}}',
    variables: ['user_name', 'ticket_id']
  },
  invoice_generated: {
    name: 'New Invoice',
    description: 'Sent when invoice is generated',
    subject: 'New Invoice #{{invoice_id}} - {{site_name}}',
    variables: ['user_name', 'invoice_id', 'invoice_amount', 'due_date']
  },
  payment_received: {
    name: 'Payment Received',
    description: 'Sent when payment is received',
    subject: 'Payment Received - {{site_name}}',
    variables: ['user_name', 'payment_amount', 'invoice_id', 'payment_date']
  },
  service_expiring: {
    name: 'Service Expiring',
    description: 'Sent when service is about to expire',
    subject: 'Service Expiring Soon - {{site_name}}',
    variables: ['user_name', 'service_name', 'expiry_date']
  },
  service_suspended: {
    name: 'Service Suspended',
    description: 'Sent when service is suspended',
    subject: 'Service Suspended - {{site_name}}',
    variables: ['user_name', 'service_name']
  },
  proposal_sent: {
    name: 'Proposal Sent',
    description: 'Sent when admin sends a proposal',
    subject: 'New Proposal: {{proposal_title}} - {{site_name}}',
    variables: ['user_name', 'proposal_title', 'proposal_total', 'proposal_link']
  },
  admin_new_order: {
    name: 'Admin: New Order',
    description: 'Sent to admins when new order is placed',
    subject: 'New Order Received #{{order_id}} - {{site_name}}',
    variables: ['order_id', 'user_name', 'user_email', 'order_total', 'payment_method']
  },
  admin_new_ticket: {
    name: 'Admin: New Ticket',
    description: 'Sent to admins when new ticket is created',
    subject: 'New Support Ticket #{{ticket_id}} - {{site_name}}',
    variables: ['ticket_id', 'user_name', 'user_email', 'ticket_subject', 'ticket_priority']
  },
  test_email: {
    name: 'Test Email',
    description: 'Used for testing email configuration',
    subject: 'Test Email - {{site_name}}',
    variables: ['site_name', 'timestamp']
  }
};

// Get all email templates (admin only)
router.get('/email-templates', authenticate, requireRole('admin'), async (req, res) => {
  try {
    // Get custom templates from database
    const customTemplates = await db.query('SELECT * FROM email_templates ORDER BY name');

    // Merge with defaults
    const templates = Object.entries(defaultTemplates).map(([key, defaults]) => {
      const custom = customTemplates.find(t => t.template_key === key);
      return {
        template_key: key,
        name: defaults.name,
        description: defaults.description,
        subject: custom?.subject || defaults.subject,
        html_content: custom?.html_content || null,
        is_active: custom?.is_active ?? true,
        is_customized: !!custom,
        variables: defaults.variables,
        updated_at: custom?.updated_at || null
      };
    });

    res.json({ templates });
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({ error: 'Failed to load email templates' });
  }
});

// Get single email template (admin only)
router.get('/email-templates/:key', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { key } = req.params;

    // Get default template info
    const defaults = defaultTemplates[key];
    if (!defaults) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Get custom template from database
    const customTemplates = await db.query(
      'SELECT * FROM email_templates WHERE template_key = ?',
      [key]
    );
    const custom = customTemplates[0];

    // Get email logo
    const logoResult = await db.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'email_logo'"
    );
    const emailLogo = logoResult[0]?.setting_value || null;

    // Get the default HTML from emailService
    const emailService = require('../services/emailService');
    const defaultHtml = emailService.getDefaultTemplate(key);

    res.json({
      template: {
        template_key: key,
        name: defaults.name,
        description: defaults.description,
        subject: custom?.subject || defaults.subject,
        html_content: custom?.html_content || defaultHtml,
        is_active: custom?.is_active ?? true,
        is_customized: !!custom,
        variables: defaults.variables,
        email_logo: emailLogo
      },
      defaultSubject: defaults.subject,
      defaultHtml: defaultHtml
    });
  } catch (error) {
    console.error('Get email template error:', error);
    res.status(500).json({ error: 'Failed to load email template' });
  }
});

// Update email template (admin only)
router.put('/email-templates/:key', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { key } = req.params;
    const { subject, html_content, is_active } = req.body;

    const defaults = defaultTemplates[key];
    if (!defaults) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Upsert template
    await db.query(`
      INSERT INTO email_templates (template_key, name, description, subject, html_content, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        subject = VALUES(subject),
        html_content = VALUES(html_content),
        is_active = VALUES(is_active),
        updated_at = NOW()
    `, [key, defaults.name, defaults.description, subject, html_content, is_active ?? true]);

    res.json({ message: 'Template updated successfully' });
  } catch (error) {
    console.error('Update email template error:', error);
    res.status(500).json({ error: 'Failed to update email template' });
  }
});

// Reset email template to default (admin only)
router.post('/email-templates/:key/reset', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { key } = req.params;

    await db.query('DELETE FROM email_templates WHERE template_key = ?', [key]);

    res.json({ message: 'Template reset to default' });
  } catch (error) {
    console.error('Reset email template error:', error);
    res.status(500).json({ error: 'Failed to reset email template' });
  }
});

// Upload/save email logo (admin only)
router.post('/email-logo', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { logo } = req.body;

    if (!logo) {
      return res.status(400).json({ error: 'Logo is required' });
    }

    // Save to settings
    await db.query(`
      INSERT INTO settings (setting_key, setting_value, setting_type, category, is_public)
      VALUES ('email_logo', ?, 'string', 'email', FALSE)
      ON DUPLICATE KEY UPDATE setting_value = ?
    `, [logo, logo]);

    res.json({ message: 'Email logo saved successfully' });
  } catch (error) {
    console.error('Save email logo error:', error);
    res.status(500).json({ error: 'Failed to save email logo' });
  }
});

// Get email logo (admin only)
router.get('/email-logo', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const result = await db.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'email_logo'"
    );
    res.json({ logo: result[0]?.setting_value || null });
  } catch (error) {
    console.error('Get email logo error:', error);
    res.status(500).json({ error: 'Failed to get email logo' });
  }
});

// ============================================
// NEWSLETTER SUBSCRIPTION ENDPOINTS
// ============================================

// Subscribe to newsletter (public)
router.post('/newsletter/subscribe', async (req, res) => {
  try {
    const { email, source = 'footer' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get IP address
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Check if already subscribed
    const existing = await db.query(
      'SELECT id, status FROM newsletter_subscribers WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existing && existing.length > 0) {
      if (existing[0].status === 'subscribed') {
        return res.json({ message: 'Already subscribed!', alreadySubscribed: true });
      }
      // Re-subscribe
      await db.query(
        'UPDATE newsletter_subscribers SET status = ?, subscribed_at = NOW(), unsubscribed_at = NULL, ip_address = ?, source = ? WHERE email = ?',
        ['subscribed', ipAddress, source, email.toLowerCase()]
      );
    } else {
      // New subscription
      await db.query(
        'INSERT INTO newsletter_subscribers (email, status, ip_address, source) VALUES (?, ?, ?, ?)',
        [email.toLowerCase(), 'subscribed', ipAddress, source]
      );
    }

    // Send confirmation email via Mailgun
    try {
      await emailService.sendNewsletterConfirmation(email.toLowerCase());
    } catch (emailErr) {
      console.error('Newsletter confirmation email failed:', emailErr.message);
      // Don't fail the subscription if email fails
    }

    res.json({ message: 'Successfully subscribed!', success: true });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe from newsletter (public)
router.post('/newsletter/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await db.query(
      'UPDATE newsletter_subscribers SET status = ?, unsubscribed_at = NOW() WHERE email = ?',
      ['unsubscribed', email.toLowerCase()]
    );

    res.json({ message: 'Successfully unsubscribed', success: true });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Get all subscribers (admin only)
router.get('/newsletter/subscribers', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 50, search } = req.query;

    let query = 'SELECT * FROM newsletter_subscribers';
    let countQuery = 'SELECT COUNT(*) as total FROM newsletter_subscribers';
    const params = [];
    const countParams = [];

    const conditions = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
      countParams.push(status);
    }

    if (search) {
      conditions.push('email LIKE ?');
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    // Get total count
    const countResult = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const subscribers = await db.query(query, params);

    res.json({
      subscribers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get newsletter subscribers error:', error);
    res.status(500).json({ error: 'Failed to load subscribers' });
  }
});

// Delete subscriber (admin only)
router.delete('/newsletter/subscribers/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM newsletter_subscribers WHERE id = ?', [id]);
    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({ error: 'Failed to delete subscriber' });
  }
});

// Export subscribers as CSV (admin only)
router.get('/newsletter/export', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.query;

    let query = 'SELECT email, status, subscribed_at, source FROM newsletter_subscribers';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY subscribed_at DESC';

    const subscribers = await db.query(query, params);

    // Generate CSV
    const csvHeader = 'Email,Status,Subscribed At,Source\n';
    const csvRows = subscribers.map(s =>
      `${s.email},${s.status},${s.subscribed_at || ''},${s.source}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=newsletter_subscribers.csv');
    res.send(csvHeader + csvRows);
  } catch (error) {
    console.error('Export subscribers error:', error);
    res.status(500).json({ error: 'Failed to export subscribers' });
  }
});

// ==================== WILDCARD ROUTES (must be last!) ====================
// These routes use /:key which matches ANY path, so they must come after all specific routes

// Create or update single setting (admin only)
router.put('/:key', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { key } = req.params;
    const { value, type = 'string', category = 'general', is_public = false } = req.body;

    const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    await db.query(`
      INSERT INTO settings (setting_key, setting_value, setting_type, category, is_public)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE setting_value = ?, setting_type = ?, category = ?, is_public = ?
    `, [key, settingValue, type, category, is_public, settingValue, type, category, is_public]);

    res.json({ message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Delete setting (admin only)
router.delete('/:key', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM settings WHERE setting_key = ?', [req.params.key]);
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

module.exports = router;

