const express = require('express');
const https = require('https');
const db = require('../database/connection');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();

// Helper function to make HTTPS POST requests
function httpsPost(url, data) {
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
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
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
}

// Knowledge base for the AI agent
const knowledgeBase = `
You are a REAL HUMAN customer support representative working at Magnetic Clouds.

CRITICAL IDENTITY RULES:
- You are a REAL PERSON, NOT an AI or chatbot
- Your name will be provided in each request - use it consistently
- If asked "are you a bot?" or "are you AI?", always respond that you are a real human support agent
- NEVER use emojis in your responses
- Write naturally like a human would in a chat conversation
- Keep responses concise (2-3 sentences max unless more detail is needed)

SCOPE LIMITATION:
- You ONLY help with Magnetic Clouds services and products
- If asked about unrelated topics, politely redirect to Magnetic Clouds services
- Example: "I appreciate the question, but I can only help with Magnetic Clouds services. Is there anything about our hosting, domains, or cloud solutions I can help you with?"

COMPANY INFORMATION:
- Company Name: Magnetic Clouds
- Tagline: Premium Cloud Hosting Built for Speed
- Location: Operating globally with datacenters worldwide
- Support: 24/7 customer support
- Contact Email: support@magneticclouds.com
- Website: magneticclouds.com

SERVICES AND PRICING:

1. Web Hosting:
   - Starter: $2.99/month - 10GB SSD, 1 Website, Free SSL
   - Professional: $5.99/month - 50GB SSD, Unlimited Websites, Free SSL, Daily Backups
   - Business: $9.99/month - 100GB SSD, Unlimited Everything, Priority Support

2. VPS Servers:
   - VPS-1: $14.99/month - 2 vCPU, 4GB RAM, 80GB SSD
   - VPS-2: $29.99/month - 4 vCPU, 8GB RAM, 160GB SSD
   - VPS-4: $59.99/month - 8 vCPU, 16GB RAM, 320GB SSD

3. Cloud Servers:
   - Cloud Basic: $19.99/month - 2 vCPU, 4GB RAM, 100GB SSD
   - Cloud Pro: $49.99/month - 4 vCPU, 8GB RAM, 200GB SSD
   - Cloud Enterprise: $99.99/month - 8 vCPU, 32GB RAM, 500GB SSD

4. Dedicated Servers:
   - Entry: $99/month - Intel Xeon, 32GB RAM, 1TB SSD
   - Professional: $199/month - Intel Xeon, 64GB RAM, 2TB SSD
   - Enterprise: $399/month - Dual Intel Xeon, 128GB RAM, 4TB SSD

5. Domains:
   - .com: $9.99/year
   - .net: $12.99/year
   - .org: $11.99/year
   - .io: $39.99/year
   - .ai: $79.99/year
   - Free WHOIS privacy included

6. SSL Certificates:
   - Basic SSL: Free with all hosting plans
   - Wildcard SSL: $49.99/year
   - EV SSL: $149.99/year

7. Email Hosting:
   - Business Email: $2.99/user/month
   - Email Suite: $5.99/user/month with calendar and storage

8. Website Backup:
   - Daily Backup: $2.99/month
   - Real-time Backup: $9.99/month

POLICIES:
- 45-day money-back guarantee on all hosting plans
- Free migration assistance from other hosts
- 99.99% uptime guarantee
- Instant activation for most services
- Multiple payment methods accepted (Credit Card, PayPal, Crypto)

RESPONSE STYLE:
- Be friendly but professional
- Keep responses short and to the point
- Always offer to help with specific needs
- If you don't know something specific, offer to connect them with a specialist
- Mention relevant prices when discussing services
- Never make up information about services we don't offer
`;

// Validate API key endpoint
router.post('/validate', async (req, res) => {
  console.log('AI Agent validation request received');
  const { apiKey } = req.body;

  if (!apiKey) {
    console.log('No API key provided');
    return res.status(400).json({ valid: false, message: 'API key is required' });
  }

  console.log('Validating API key (first 10 chars):', apiKey.substring(0, 10) + '...');

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    console.log('Making request to Gemini API...');
    
    const response = await httpsPost(url, {
      contents: [{ parts: [{ text: 'Hello' }] }]
    });

    console.log('Gemini response status:', response.status);
    console.log('Gemini response data:', JSON.stringify(response.data).substring(0, 300));
    
    if (response.status === 200 && response.data && response.data.candidates) {
      console.log('API key validation successful');
      return res.json({ valid: true, message: 'API key is valid' });
    } else if (response.data?.error) {
      console.log('API error:', response.data.error.message);
      return res.json({ valid: false, message: response.data.error.message });
    } else {
      console.log('Unexpected response');
      return res.json({ valid: false, message: 'Unexpected response from API' });
    }
  } catch (error) {
    console.error('API validation error:', error.message);
    return res.json({ valid: false, message: error.message || 'Failed to validate API key' });
  }
});

// Test connection endpoint - tries multiple models
router.post('/test', async (req, res) => {
  console.log('AI Agent test connection request received');
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ success: false, message: 'API key is required' });
  }

  // Models to try in order of preference
  const modelsToTry = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-pro'
  ];

  for (const model of modelsToTry) {
    console.log(`Testing model: ${model}`);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const response = await httpsPost(url, {
        contents: [{ parts: [{ text: 'Say "OK" only.' }] }]
      });

      console.log(`Model ${model} response status:`, response.status);
      
      if (response.status === 200 && response.data && response.data.candidates) {
        const responseText = response.data.candidates[0]?.content?.parts?.[0]?.text || '';
        console.log(`Model ${model} SUCCESS! Response: ${responseText}`);
        return res.json({ 
          success: true, 
          model: model,
          message: `Successfully connected using ${model}`,
          response: responseText.substring(0, 100)
        });
      } else if (response.data?.error) {
        console.log(`Model ${model} error:`, response.data.error.message);
        // Continue to next model
      }
    } catch (error) {
      console.log(`Model ${model} failed:`, error.message);
      // Continue to next model
    }
  }

  // If all models failed
  return res.json({ 
    success: false, 
    message: 'All models failed. Please check your API key is valid and has proper permissions.',
    modelsAttempted: modelsToTry
  });
});

// Chat endpoint
router.post('/chat', async (req, res) => {
  const { apiKey, message, agentName, agentNameLocal, language, chatHistory } = req.body;

  if (!apiKey || !message) {
    return res.status(400).json({ error: 'API key and message are required' });
  }

  try {
    // Build conversation history for context
    const conversationContext = chatHistory
      ?.filter(m => m.type === 'user' || m.type === 'agent')
      ?.map(m => ({
        role: m.type === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })) || [];

    // System prompt with agent identity
    const systemPrompt = `
${knowledgeBase}

YOUR IDENTITY FOR THIS CONVERSATION:
- Your name is: ${agentName}
- Respond in: ${language === 'bn' ? 'Bengali (Bangla)' : 'English'}
- Remember: You are a real human, not an AI

Current customer message: ${message}

Respond naturally as ${agentName} would. Keep it brief and helpful.
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    
    const response = await httpsPost(url, {
      contents: [
        ...conversationContext,
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 256,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
      ]
    });

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    // Clean up the response (remove any accidental emoji usage)
    const cleanedResponse = aiResponse
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .trim();

    res.json({ response: cleanedResponse });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Get AI agent settings (public - for chatbot visibility)
router.get('/settings', async (req, res) => {
  try {
    const settings = await db.query(
      "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('ai_agent_enabled', 'ai_agent_api_key')"
    );
    
    const result = {
      enabled: false,
      hasApiKey: false
    };
    
    for (const s of settings) {
      if (s.setting_key === 'ai_agent_enabled') {
        result.enabled = s.setting_value === 'true';
      }
      if (s.setting_key === 'ai_agent_api_key') {
        result.hasApiKey = !!s.setting_value;
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error('Get AI settings error:', error);
    res.json({ enabled: false, hasApiKey: false });
  }
});

// Get AI agent settings (admin - includes API key)
router.get('/settings/admin', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const settings = await db.query(
      "SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE 'ai_agent_%'"
    );
    
    const result = {};
    for (const s of settings) {
      result[s.setting_key] = s.setting_value;
    }
    
    res.json({
      enabled: result.ai_agent_enabled === 'true',
      apiKey: result.ai_agent_api_key || '',
      settings: {
        queueAssignTime: parseInt(result.ai_agent_queue_time) || 12000,
        typingStartDelay: parseInt(result.ai_agent_typing_delay) || 8000,
        replyTimePerWord: parseInt(result.ai_agent_reply_time) || 2500,
        followUpTimeout: parseInt(result.ai_agent_followup_timeout) || 60000,
        endChatTimeout: parseInt(result.ai_agent_end_timeout) || 30000
      }
    });
  } catch (error) {
    console.error('Get AI admin settings error:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// Save AI agent settings (admin only)
router.post('/settings', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { enabled, apiKey, settings } = req.body;
    
    // Save enabled state - use simple INSERT/UPDATE
    if (enabled !== undefined) {
      const existsEnabled = await db.query("SELECT 1 FROM settings WHERE setting_key = 'ai_agent_enabled'");
      if (existsEnabled && existsEnabled.length > 0) {
        await db.query("UPDATE settings SET setting_value = ? WHERE setting_key = 'ai_agent_enabled'", [String(enabled)]);
      } else {
        await db.query("INSERT INTO settings (setting_key, setting_value) VALUES ('ai_agent_enabled', ?)", [String(enabled)]);
      }
    }
    
    // Save API key
    if (apiKey !== undefined) {
      const existsKey = await db.query("SELECT 1 FROM settings WHERE setting_key = 'ai_agent_api_key'");
      if (existsKey && existsKey.length > 0) {
        await db.query("UPDATE settings SET setting_value = ? WHERE setting_key = 'ai_agent_api_key'", [apiKey]);
      } else {
        await db.query("INSERT INTO settings (setting_key, setting_value) VALUES ('ai_agent_api_key', ?)", [apiKey]);
      }
    }
    
    // Save timing settings
    if (settings) {
      const timingSettings = {
        ai_agent_queue_time: settings.queueAssignTime,
        ai_agent_typing_delay: settings.typingStartDelay,
        ai_agent_reply_time: settings.replyTimePerWord,
        ai_agent_followup_timeout: settings.followUpTimeout,
        ai_agent_end_timeout: settings.endChatTimeout
      };
      
      for (const [key, value] of Object.entries(timingSettings)) {
        if (value !== undefined) {
          const exists = await db.query("SELECT 1 FROM settings WHERE setting_key = ?", [key]);
          if (exists && exists.length > 0) {
            await db.query("UPDATE settings SET setting_value = ? WHERE setting_key = ?", [String(value), key]);
          } else {
            await db.query("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)", [key, String(value)]);
          }
        }
      }
    }
    
    console.log('AI agent settings saved successfully');
    res.json({ success: true, message: 'AI agent settings saved' });
  } catch (error) {
    console.error('Save AI settings error:', error);
    res.status(500).json({ error: 'Failed to save settings: ' + error.message });
  }
});

module.exports = router;
