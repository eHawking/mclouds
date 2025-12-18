const express = require('express');
const db = require('../database/connection');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user dashboard stats
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const [services, tickets, invoices, orders] = await Promise.all([
      db.query(`SELECT COUNT(*) as total, 
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
        FROM services WHERE user_id = ?`, [req.user.id]),
      db.query(`SELECT COUNT(*) as total,
        SUM(CASE WHEN status IN ('open', 'customer-reply') THEN 1 ELSE 0 END) as open
        FROM tickets WHERE user_id = ?`, [req.user.id]),
      db.query(`SELECT COUNT(*) as total,
        SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) as unpaid
        FROM invoices WHERE user_id = ?`, [req.user.id]),
      db.query(`SELECT COUNT(*) as total FROM orders WHERE user_id = ?`, [req.user.id])
    ]);

    // Recent activity
    const recentServices = await db.query(`
      SELECT uuid, name, service_type, status, next_due_date, created_at
      FROM services WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    `, [req.user.id]);

    const recentInvoices = await db.query(`
      SELECT uuid, invoice_number, total, status, due_date, created_at
      FROM invoices WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    `, [req.user.id]);

    const recentTickets = await db.query(`
      SELECT uuid, ticket_number, subject, status, priority, created_at
      FROM tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    `, [req.user.id]);

    res.json({
      stats: {
        services: { total: Number(services[0].total), active: Number(services[0].active) },
        tickets: { total: Number(tickets[0].total), open: Number(tickets[0].open) },
        invoices: { total: Number(invoices[0].total), unpaid: Number(invoices[0].unpaid) },
        orders: { total: Number(orders[0].total) }
      },
      recent: {
        services: recentServices,
        invoices: recentInvoices,
        tickets: recentTickets
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Get user services
router.get('/services', authenticate, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM services WHERE user_id = ?';
    const params = [req.user.id];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND service_type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const services = await db.query(query, params);
    const countResult = await db.query('SELECT COUNT(*) as total FROM services WHERE user_id = ?', [req.user.id]);

    res.json({
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(countResult[0].total)
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to load services' });
  }
});

// Get user domains
router.get('/domains', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT s.*, 
             oi.unit_price as purchase_price,
             o.order_number, o.created_at as purchase_date
      FROM services s
      LEFT JOIN order_items oi ON s.order_item_id = oi.id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE s.user_id = ? AND s.service_type = 'domain'
    `;
    const params = [req.user.id];

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const domains = await db.query(query, params);
    const countResult = await db.query(
      "SELECT COUNT(*) as total FROM services WHERE user_id = ? AND service_type = 'domain'", 
      [req.user.id]
    );

    res.json({
      domains,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(countResult[0].total)
      }
    });
  } catch (error) {
    console.error('Get domains error:', error);
    res.status(500).json({ error: 'Failed to load domains' });
  }
});

// Get service details
router.get('/services/:uuid', authenticate, async (req, res) => {
  try {
    const services = await db.query(`
      SELECT s.*, p.name as product_name, p.features as product_features
      FROM services s
      LEFT JOIN products p ON s.product_id = p.id
      WHERE s.uuid = ? AND s.user_id = ?
    `, [req.params.uuid, req.user.id]);

    if (!services.length) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ service: services[0] });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to load service' });
  }
});

// Get user invoices
router.get('/invoices', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM invoices WHERE user_id = ?';
    const params = [req.user.id];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const invoices = await db.query(query, params);
    const countResult = await db.query('SELECT COUNT(*) as total FROM invoices WHERE user_id = ?', [req.user.id]);

    res.json({
      invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(countResult[0].total)
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to load invoices' });
  }
});

// Get invoice details with order information
router.get('/invoices/:uuid', authenticate, async (req, res) => {
  try {
    const invoices = await db.query(`
      SELECT i.*, 
             o.uuid as order_uuid, o.order_number, o.status as order_status, o.items as order_items,
             o.subtotal as order_subtotal, o.discount as order_discount, o.total as order_total,
             o.payment_method, o.notes as order_notes, o.created_at as order_date,
             s.uuid as service_uuid, s.name as service_name, s.service_type, s.status as service_status,
             s.billing_cycle, s.next_due_date
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN services s ON i.service_id = s.id
      WHERE i.uuid = ? AND i.user_id = ?
    `, [req.params.uuid, req.user.id]);

    if (!invoices.length) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoices[0];
    
    // Parse order items if exists
    if (invoice.order_items) {
      try {
        invoice.order_items = JSON.parse(invoice.order_items);
      } catch (e) {
        invoice.order_items = [];
      }
    }

    res.json({ invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to load invoice' });
  }
});

// Get user transactions
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const transactions = await db.query(`
      SELECT * FROM transactions WHERE user_id = ?
      ORDER BY created_at DESC LIMIT ? OFFSET ?
    `, [req.user.id, parseInt(limit), parseInt(offset)]);

    const countResult = await db.query('SELECT COUNT(*) as total FROM transactions WHERE user_id = ?', [req.user.id]);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(countResult[0].total)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to load transactions' });
  }
});

// Get Plesk status (check if enabled)
router.get('/plesk/status', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'plesk_enabled'"
    );
    const enabled = result?.[0]?.setting_value === 'true';
    res.json({ enabled });
  } catch (error) {
    console.error('Get Plesk status error:', error);
    res.json({ enabled: false });
  }
});

// Get Plesk login URL for a service
router.post('/services/:uuid/plesk-login', authenticate, async (req, res) => {
  try {
    const { uuid } = req.params;
    
    // Get the service and verify ownership
    const services = await db.query(
      'SELECT * FROM services WHERE uuid = ? AND user_id = ?',
      [uuid, req.user.id]
    );
    
    if (!services || services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    const service = services[0];
    
    if (service.status !== 'active') {
      return res.status(400).json({ error: 'Service is not active' });
    }
    
    // Get Plesk settings
    const pleskSettings = await db.query(
      `SELECT setting_key, setting_value FROM settings WHERE setting_key IN (
        'plesk_enabled', 'plesk_hostname', 'plesk_port', 'plesk_username', 
        'plesk_password', 'plesk_api_key', 'plesk_auth_method'
      )`
    );
    
    const config = {};
    pleskSettings.forEach(row => {
      config[row.setting_key.replace('plesk_', '')] = row.setting_value;
    });
    
    if (config.enabled !== 'true' || !config.hostname) {
      return res.status(400).json({ error: 'Plesk integration is not configured' });
    }
    
    // Build Plesk SSO URL or direct login URL
    const https = require('https');
    const fetch = require('node-fetch');
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (config.auth_method === 'api_key' && config.api_key) {
      headers['X-API-Key'] = config.api_key;
    } else if (config.username && config.password) {
      const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }
    
    const agent = new https.Agent({ rejectUnauthorized: false });
    
    // Try to create SSO session for the user's domain
    const domain = service.domain_name || service.hostname;
    
    if (domain) {
      try {
        // Create one-time login link via Plesk API
        const ssoResponse = await fetch(
          `https://${config.hostname}:${config.port || 8443}/api/v2/cli/server/request-login-link`,
          {
            method: 'POST',
            headers,
            agent,
            body: JSON.stringify({
              login: service.username || 'admin',
              ip: req.ip
            })
          }
        );
        
        if (ssoResponse.ok) {
          const ssoData = await ssoResponse.json();
          if (ssoData.login_link) {
            return res.json({ url: ssoData.login_link });
          }
        }
      } catch (ssoError) {
        console.log('SSO login not available, using direct URL');
      }
    }
    
    // Fallback to direct Plesk URL
    const pleskUrl = `https://${config.hostname}:${config.port || 8443}`;
    res.json({ url: pleskUrl });
    
  } catch (error) {
    console.error('Plesk login error:', error);
    res.status(500).json({ error: 'Failed to generate Plesk login URL' });
  }
});

// ==================== USER NOTIFICATIONS ====================

// Get user notifications
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const { limit = 50, unread_only = false } = req.query;
    
    let query = `
      SELECT * FROM user_notifications 
      WHERE user_id = ?
    `;
    
    if (unread_only === 'true') {
      query += ' AND is_read = 0';
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    
    const notifications = await db.query(query, [req.user.id, parseInt(limit)]);
    
    // Get unread count
    const countResult = await db.query(
      'SELECT COUNT(*) as count FROM user_notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    const unreadCount = countResult?.[0]?.count || 0;
    
    res.json({ notifications: notifications || [], unreadCount });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.json({ notifications: [], unreadCount: 0 });
  }
});

// Get unread count only
router.get('/notifications/count', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM user_notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ count: result?.[0]?.count || 0 });
  } catch (error) {
    res.json({ count: 0 });
  }
});

// Mark notification as read
router.put('/notifications/:uuid/read', authenticate, async (req, res) => {
  try {
    await db.query(
      'UPDATE user_notifications SET is_read = 1 WHERE uuid = ? AND user_id = ?',
      [req.params.uuid, req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticate, async (req, res) => {
  try {
    await db.query(
      'UPDATE user_notifications SET is_read = 1 WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

module.exports = router;
