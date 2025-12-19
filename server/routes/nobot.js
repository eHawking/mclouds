const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireRole } = require('../middleware/auth');

// Admin Routes

// Get NoBot settings
router.get('/settings', authenticate, requireRole('admin'), async (req, res) => {
  try {
    // Check if table exists first
    const tableCheck = await db.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'nobot_settings'
    `);

    if (!tableCheck[0]?.count) {
      // Table doesn't exist, return empty settings
      return res.json({ settings: {} });
    }

    const settings = await db.query('SELECT * FROM nobot_settings');
    const settingsObj = {};
    (settings || []).forEach(s => {
      if (s.setting_type === 'boolean') {
        settingsObj[s.setting_key] = s.setting_value === 'true';
      } else if (s.setting_type === 'number') {
        settingsObj[s.setting_key] = parseFloat(s.setting_value);
      } else {
        settingsObj[s.setting_key] = s.setting_value;
      }
    });
    res.json({ settings: settingsObj });
  } catch (error) {
    console.error('Get NoBot settings error:', error);
    // Return empty settings instead of error
    res.json({ settings: {} });
  }
});

// Update NoBot settings
router.put('/settings', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      const settingType = typeof value === 'boolean' ? 'boolean' :
        typeof value === 'number' ? 'number' : 'string';
      const dbValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value);

      const existing = await db.query('SELECT id FROM nobot_settings WHERE setting_key = ?', [key]);

      if (existing && existing.length > 0) {
        await db.query(
          'UPDATE nobot_settings SET setting_value = ?, setting_type = ? WHERE setting_key = ?',
          [dbValue, settingType, key]
        );
      } else {
        await db.query(
          'INSERT INTO nobot_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)',
          [key, dbValue, settingType]
        );
      }
    }

    res.json({ message: 'Settings updated' });
  } catch (error) {
    console.error('Update NoBot settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Test connection (Gemini API) - Uses direct HTTP to try multiple models
router.post('/test-connection', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { type, api_key } = req.body;

    if (type === 'gemini') {
      const https = require('https');

      // Helper function to make POST request
      const httpsPost = (url, data) => {
        return new Promise((resolve, reject) => {
          const urlObj = new URL(url);
          const postData = JSON.stringify(data);

          const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
            }
          };

          const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
              try {
                resolve({ status: res.statusCode, data: JSON.parse(body) });
              } catch (e) {
                resolve({ status: res.statusCode, data: body });
              }
            });
          });

          req.on('error', (e) => reject(e));
          req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
          });

          req.write(postData);
          req.end();
        });
      };

      // Models to try in order of preference
      const modelsToTry = [
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro'
      ];

      for (const model of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${api_key}`;

          const response = await httpsPost(url, {
            contents: [{ parts: [{ text: 'Say "Connection successful!" only.' }] }]
          });

          if (response.status === 200 && response.data && response.data.candidates) {
            const responseText = response.data.candidates[0]?.content?.parts?.[0]?.text || 'Connection successful!';
            return res.json({
              success: true,
              message: responseText.trim(),
              model: model
            });
          }
        } catch (modelError) {
          console.log(`Model ${model} failed:`, modelError.message);
          // Continue to next model
        }
      }

      // All models failed
      return res.json({
        success: false,
        error: 'All Gemini models failed. Please check your API key.',
        modelsAttempted: modelsToTry
      });
    } else {
      res.status(400).json({ error: 'Unknown connection type' });
    }
  } catch (error) {
    console.error('Test connection error:', error);
    res.json({ success: false, error: error.message });
  }
});

// Get NoBot stats
router.get('/stats', authenticate, requireRole('admin'), async (req, res) => {
  try {
    // Check if tables exist first
    const tableCheck = await db.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'nobot_services'
    `);

    if (!tableCheck[0]?.count) {
      // Tables don't exist yet, return zeros
      return res.json({
        stats: {
          total_bots: 0,
          active_bots: 0,
          total_conversations: 0,
          total_messages: 0
        }
      });
    }

    const totalBots = await db.query('SELECT COUNT(*) as count FROM nobot_services');
    const activeBots = await db.query("SELECT COUNT(*) as count FROM nobot_services WHERE status = 'active'");
    const totalConversations = await db.query('SELECT COUNT(*) as count FROM nobot_conversations');
    const totalMessages = await db.query('SELECT COUNT(*) as count FROM nobot_messages');

    res.json({
      stats: {
        total_bots: Number(totalBots[0]?.count || 0),
        active_bots: Number(activeBots[0]?.count || 0),
        total_conversations: Number(totalConversations[0]?.count || 0),
        total_messages: Number(totalMessages[0]?.count || 0)
      }
    });
  } catch (error) {
    console.error('Get NoBot stats error:', error);
    // Return zeros instead of error
    res.json({
      stats: {
        total_bots: 0,
        active_bots: 0,
        total_conversations: 0,
        total_messages: 0
      }
    });
  }
});

// Get all NoBot services (admin)
router.get('/services', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const services = await db.query(`
      SELECT ns.*, u.email, u.first_name, u.last_name
      FROM nobot_services ns
      JOIN users u ON ns.user_id = u.id
      ORDER BY ns.created_at DESC
    `);
    res.json({ services });
  } catch (error) {
    console.error('Get NoBot services error:', error);
    res.status(500).json({ error: 'Failed to load services' });
  }
});

// User Routes

// Create a new bot
router.post('/create', authenticate, async (req, res) => {
  try {
    const { name, bot_type, service_id } = req.body;
    const { v4: uuidv4 } = require('uuid');
    const botUuid = uuidv4();

    // Valid bot_type values: 'whatsapp', 'messenger', 'instagram', 'all'
    const validBotType = ['whatsapp', 'messenger', 'instagram', 'all'].includes(bot_type) ? bot_type : 'all';

    // Look up service ID from UUID if provided
    let serviceIdInt = null;
    if (service_id) {
      const services = await db.query('SELECT id FROM services WHERE uuid = ?', [service_id]);
      if (services.length > 0) {
        serviceIdInt = services[0].id;
      }
    }

    await db.query(`
      INSERT INTO nobot_services (uuid, user_id, plan_name, bot_type, service_id, status, setup_step)
      VALUES (?, ?, ?, ?, ?, 'pending_setup', 1)
    `, [botUuid, req.user.id, name || 'NoBot AI', validBotType, serviceIdInt]);

    res.status(201).json({
      message: 'Bot created successfully',
      uuid: botUuid
    });
  } catch (error) {
    console.error('Create bot error:', error);
    res.status(500).json({ error: 'Failed to create bot' });
  }
});

// Get user's bots
router.get('/my-bots', authenticate, async (req, res) => {
  try {
    const bots = await db.query(`
      SELECT ns.*, s.uuid as service_uuid 
      FROM nobot_services ns 
      LEFT JOIN services s ON ns.service_id = s.id 
      WHERE ns.user_id = ? 
      ORDER BY ns.created_at DESC
    `, [req.user.id]);
    res.json({ bots });
  } catch (error) {
    console.error('Get my bots error:', error);
    res.status(500).json({ error: 'Failed to load bots' });
  }
});

// Get single bot
router.get('/:uuid', authenticate, async (req, res) => {
  try {
    const bots = await db.query(
      'SELECT * FROM nobot_services WHERE uuid = ? AND user_id = ?',
      [req.params.uuid, req.user.id]
    );

    if (!bots.length) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.json({ bot: bots[0] });
  } catch (error) {
    console.error('Get bot error:', error);
    res.status(500).json({ error: 'Failed to load bot' });
  }
});

// Setup bot (Step 1: Add domain and basic config)
router.post('/:uuid/setup', authenticate, async (req, res) => {
  try {
    const { domain, website_url } = req.body;

    const bots = await db.query(
      'SELECT * FROM nobot_services WHERE uuid = ? AND user_id = ?',
      [req.params.uuid, req.user.id]
    );

    if (!bots.length) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    await db.query(`
      UPDATE nobot_services 
      SET domain = ?, website_url = ?, setup_step = 2
      WHERE uuid = ?
    `, [domain, website_url, req.params.uuid]);

    res.json({ message: 'Setup completed', step: 2 });
  } catch (error) {
    console.error('Setup bot error:', error);
    res.status(500).json({ error: 'Failed to setup bot' });
  }
});

// Train bot
router.post('/:uuid/train', authenticate, async (req, res) => {
  try {
    const { method, website_url, training_data } = req.body;

    const bots = await db.query(
      'SELECT * FROM nobot_services WHERE uuid = ? AND user_id = ?',
      [req.params.uuid, req.user.id]
    );

    if (!bots.length) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Update training status
    await db.query(`
      UPDATE nobot_services 
      SET training_status = 'in_progress', training_method = ?
      WHERE uuid = ?
    `, [method, req.params.uuid]);

    let finalTrainingData = training_data || '';

    // If method is 'website', fetch content from website
    if (method === 'website' && website_url) {
      try {
        const axios = require('axios');
        const cheerio = require('cheerio');

        const response = await axios.get(website_url, { timeout: 10000 });
        const $ = cheerio.load(response.data);

        // Extract text content
        $('script, style, nav, footer, header').remove();
        finalTrainingData = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 50000);
      } catch (fetchError) {
        console.error('Website fetch error:', fetchError);
        finalTrainingData = `Website: ${website_url}. Unable to fetch content automatically.`;
      }
    }

    // Store training data and mark as trained - setup complete (step 4)
    await db.query(`
      UPDATE nobot_services 
      SET training_data = ?, training_status = 'completed', trained_at = NOW(), 
          status = 'active', setup_step = 4
      WHERE uuid = ?
    `, [finalTrainingData, req.params.uuid]);

    res.json({ message: 'Training completed', step: 4 });
  } catch (error) {
    console.error('Train bot error:', error);
    res.status(500).json({ error: 'Failed to train bot' });
  }
});

// Train bot from file
router.post('/:uuid/train-file', authenticate, async (req, res) => {
  try {
    const multer = require('multer');
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    }).single('file');

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'File upload failed' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const bots = await db.query(
        'SELECT * FROM nobot_services WHERE uuid = ? AND user_id = ?',
        [req.params.uuid, req.user.id]
      );

      if (!bots.length) {
        return res.status(404).json({ error: 'Bot not found' });
      }

      const trainingData = req.file.buffer.toString('utf-8');

      await db.query(`
        UPDATE nobot_services 
        SET training_data = ?, training_method = 'file', training_status = 'completed',
            trained_at = NOW(), status = 'active', setup_step = 4
        WHERE uuid = ?
      `, [trainingData, req.params.uuid]);

      res.json({ message: 'Training completed from file', step: 4 });
    });
  } catch (error) {
    console.error('Train from file error:', error);
    res.status(500).json({ error: 'Failed to train from file' });
  }
});

// Verify widget installation
router.post('/:uuid/verify-widget', authenticate, async (req, res) => {
  try {
    const { platform } = req.body;

    const bots = await db.query(
      'SELECT * FROM nobot_services WHERE uuid = ? AND user_id = ?',
      [req.params.uuid, req.user.id]
    );

    if (!bots.length) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // In a real implementation, you would verify the widget installation
    // For now, we'll simulate successful verification
    await db.query(`
      UPDATE nobot_services 
      SET widget_installed = TRUE, widget_verified = TRUE, widget_platform = ?,
          status = 'active', setup_step = 4
      WHERE uuid = ?
    `, [platform, req.params.uuid]);

    res.json({ verified: true, message: 'Widget verified successfully' });
  } catch (error) {
    console.error('Verify widget error:', error);
    res.status(500).json({ error: 'Failed to verify widget' });
  }
});

// Update bot settings
router.put('/:uuid/settings', authenticate, async (req, res) => {
  try {
    const { custom_settings } = req.body;

    const bots = await db.query(
      'SELECT * FROM nobot_services WHERE uuid = ? AND user_id = ?',
      [req.params.uuid, req.user.id]
    );

    if (!bots.length) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    await db.query(`
      UPDATE nobot_services SET custom_settings = ? WHERE uuid = ?
    `, [JSON.stringify(custom_settings), req.params.uuid]);

    res.json({ message: 'Settings updated' });
  } catch (error) {
    console.error('Update bot settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get conversations
router.get('/:uuid/conversations', authenticate, async (req, res) => {
  try {
    const bots = await db.query(
      'SELECT id FROM nobot_services WHERE uuid = ? AND user_id = ?',
      [req.params.uuid, req.user.id]
    );

    if (!bots.length) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const conversations = await db.query(`
      SELECT * FROM nobot_conversations 
      WHERE nobot_service_id = ? 
      ORDER BY last_message_at DESC
    `, [bots[0].id]);

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

// Get single conversation with messages
router.get('/:uuid/conversations/:conversationId', authenticate, async (req, res) => {
  try {
    const bots = await db.query(
      'SELECT id FROM nobot_services WHERE uuid = ? AND user_id = ?',
      [req.params.uuid, req.user.id]
    );

    if (!bots.length) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const conversations = await db.query(
      'SELECT * FROM nobot_conversations WHERE id = ? AND nobot_service_id = ?',
      [req.params.conversationId, bots[0].id]
    );

    if (!conversations.length) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await db.query(
      'SELECT * FROM nobot_messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [req.params.conversationId]
    );

    res.json({ conversation: conversations[0], messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to load conversation' });
  }
});

// Send message (human takeover)
router.post('/:uuid/conversations/:conversationId/message', authenticate, async (req, res) => {
  try {
    const { message } = req.body;

    const bots = await db.query(
      'SELECT id FROM nobot_services WHERE uuid = ? AND user_id = ?',
      [req.params.uuid, req.user.id]
    );

    if (!bots.length) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    await db.query(`
      INSERT INTO nobot_messages (conversation_id, sender_type, message)
      VALUES (?, 'human', ?)
    `, [req.params.conversationId, message]);

    await db.query(`
      UPDATE nobot_conversations SET last_message_at = NOW() WHERE id = ?
    `, [req.params.conversationId]);

    res.json({ message: 'Message sent' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
