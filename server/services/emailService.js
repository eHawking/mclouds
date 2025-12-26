const FormData = require('form-data');
const Mailgun = require('mailgun.js');
const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

/**
 * Premium Email Template Wrapper
 * Wraps content in a responsive, dark-themed structure with gradient header and footer.
 */
const getPremiumTemplateWrapper = (content, title, category = 'General') => {
  // Category colors mapping (Tailwind-ish palette)
  const categoryColors = {
    'Authentication': '#3b82f6', // blue-500
    'Billing': '#10b981',       // emerald-500
    'Support': '#8b5cf6',       // violet-500
    'Services': '#f59e0b',      // amber-500
    'Marketing': '#ec4899',     // pink-500
    'System': '#6366f1',        // indigo-500
    'General': '#64748b'        // slate-500
  };

  const accentColor = categoryColors[category] || categoryColors['General'];

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* Reset & Base Styles */
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; color: #1e293b; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; max-width: 100%; }
        table { border-collapse: collapse !important; width: 100%; }
        a { color: ${accentColor}; text-decoration: none; }
        a:hover { text-decoration: underline; }
        
        /* Mobile Responsive */
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 0 !important; }
            .content-padding { padding: 24px 20px !important; }
            .header-padding { padding: 32px 20px !important; }
            .mobile-stack { display: block !important; width: 100% !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                
                <!-- Email Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); width: 600px; max-width: 600px;">
                    
                    <!-- Header -->
                    <tr>
                        <td class="header-padding" align="center" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 48px 40px; position: relative;">
                            <!-- Accent Line -->
                            <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${accentColor}, #a855f7);"></div>
                            
                            <!-- Logo Placeholder -->
                            <div style="margin-bottom: 0;">
                                {{email_logo}}
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td class="content-padding" style="padding: 40px; background-color: #ffffff;">
                            ${content}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 32px 40px; border-top: 1px solid #e2e8f0;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="color: #64748b; font-size: 13px; line-height: 20px;">
                                        <p style="margin: 0 0 12px 0; font-weight: 600; color: #475569;">{{site_name}}</p>
                                        <p style="margin: 0 0 12px 0;">Need help? <a href="{{site_url}}/support" style="color: ${accentColor}; text-decoration: none; font-weight: 500;">Contact Support</a></p>
                                        <p style="margin: 0;">&copy; {{year}} {{site_name}}. All rights reserved.</p>
                                        <p style="margin: 8px 0 0 0; font-size: 11px; opacity: 0.7;">This email was sent to {{email}}. If you didn't request this, please ignore it.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

// Styling Constants for consistency
const s = {
  h1: 'margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; line-height: 1.3;',
  p: 'margin: 0 0 16px 0; font-size: 16px; line-height: 26px; color: #334155;',
  btn: 'display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff !important; text-decoration: none !important; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; text-align: center; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); transition: all 0.2s;',
  btnRed: 'display: inline-block; padding: 14px 32px; background: #ef4444; color: #ffffff !important; text-decoration: none !important; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; text-align: center; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2); transition: all 0.2s;',
  code: 'background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 20px; color: #0f172a; letter-spacing: 2px; text-align: center; margin: 24px 0; font-weight: 600;',
  card: 'background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;',
  table: 'width: 100%; border-collapse: collapse; margin: 16px 0;',
  th: 'text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;',
  td: 'padding: 12px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 15px;',
  badge: 'display: inline-block; padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; text-transform: uppercase;'
};

// Email templates definition
const templates = {
  // --- AUTHENTICATION ---
  welcome_email: {
    subject: 'Welcome to {{site_name}}! 🚀',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Welcome aboard, {{user_name}}!</h1>
            <p style="${s.p}">Thank you for joining {{site_name}}. We're thrilled to have you with us. Your account is the gateway to powerful cloud solutions tailored for your needs.</p>
            <p style="${s.p}">Get started by verifying your email address to unlock full access to your dashboard.</p>
            <div style="text-align: center;">
                <a href="{{site_url}}/dashboard" style="${s.btn}">Go to Dashboard</a>
            </div>
            <p style="${s.p} font-size: 14px; margin-top: 32px;">Need guidance? Check out our documentation or contact support anytime.</p>
        `, 'Welcome to Magnetic Clouds', 'Authentication')
  },

  password_reset: {
    subject: 'Reset Your Password 🔒',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Password Reset Request</h1>
            <p style="${s.p}">We received a request to reset the password for your account associated with {{email}}.</p>
            <p style="${s.p}">Click the button below to secure your account with a new password. This link expires in 1 hour.</p>
            <div style="text-align: center;">
                <a href="{{reset_link}}" style="${s.btn}">Reset Password</a>
            </div>
            <p style="${s.p} font-size: 14px; opacity: 0.8;">If you didn't ask for this, you can safely ignore this email.</p>
        `, 'Reset Password', 'Authentication')
  },

  verify_email: {
    subject: 'Verify Your Email Address ✅',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Confirm Your Email</h1>
            <p style="${s.p}">Please verify your email address to complete your registration and secure your account.</p>
            <div style="text-align: center;">
                <a href="{{verify_link}}" style="${s.btn}">Verify Email Address</a>
            </div>
        `, 'Verify Email', 'Authentication')
  },

  two_factor_auth: {
    subject: 'Your 2FA Verification Code 🛡️',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Verification Code</h1>
            <p style="${s.p}">Use the code below to sign in to your {{site_name}} account.</p>
            <div style="${s.code}">{{code}}</div>
            <p style="${s.p}">This code is valid for 10 minutes. Do not share it with anyone.</p>
            <div style="${s.card}">
                <p style="margin:0; font-size:13px; color:#64748b;">
                    <strong>Device:</strong> {{browser_name}} on {{operating_system}}<br>
                    <strong>IP Address:</strong> {{ip_address}}
                </p>
            </div>
        `, '2FA Code', 'Authentication')
  },

  login_alert: {
    subject: 'New Login Detected ⚠️',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">New Device Login</h1>
            <p style="${s.p}">We noticed a new login to your account from an unrecognized device.</p>
            <div style="${s.card}">
                <table width="100%">
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding-bottom:8px;">Device</td>
                        <td style="font-weight:500; padding-bottom:8px;">{{browser_name}} on {{operating_system}}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding-bottom:8px;">Location</td>
                        <td style="font-weight:500; padding-bottom:8px;">{{location}}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b; font-size:13px;">IP Address</td>
                        <td style="font-weight:500;">{{ip_address}}</td>
                    </tr>
                </table>
            </div>
            <p style="${s.p}">If this wasn't you, please secure your account immediately.</p>
            <div style="text-align: center;">
                <a href="{{site_url}}/reset-password" style="${s.btnRed}">Secure Account</a>
            </div>
        `, 'Login Alert', 'Authentication')
  },

  // --- BILLING & ORDERS ---
  order_placed: {
    subject: 'Order Confirmation #{{order_id}} 🎉',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Order Received</h1>
            <p style="${s.p}">Thanks for your order, {{user_name}}! We're determining the details now.</p>
            <div style="${s.card}">
                <div style="border-bottom:1px solid #e2e8f0; padding-bottom:16px; margin-bottom:16px;">
                    <span style="color:#64748b; font-size:13px;">Order ID</span><br>
                    <span style="color:#0f172a; font-size:18px; font-weight:700;">#{{order_id}}</span>
                </div>
                <table style="${s.table}">
                    <thead>
                        <tr><th style="${s.th}">Details</th></tr>
                    </thead>
                    <tbody>
                        <tr><td style="${s.td}">{{order_items}}</td></tr>
                    </tbody>
                </table>
                <div style="text-align:right; margin-top:16px;">
                    <span style="color:#64748b; margin-right:12px;">Total</span>
                    <span style="color:#0f172a; font-size:20px; font-weight:700;">{{order_total}}</span>
                </div>
            </div>
            <div style="text-align: center;">
                <a href="{{site_url}}/dashboard/orders" style="${s.btn}">View Order</a>
            </div>
        `, 'Order Placed', 'Billing')
  },

  order_confirmed: {
    subject: 'Payment Confirmed: Order #{{order_id}} ✅',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Payment Successful</h1>
            <p style="${s.p}">Your payment for Order #{{order_id}} has been processed. We are now provisioning your services.</p>
            <div style="${s.card}">
                <table width="100%">
                    <tr>
                        <td style="color:#64748b;">Amount Paid</td>
                        <td style="font-weight:700; text-align:right;">{{order_total}}</td>
                    </tr>
                </table>
            </div>
            <div style="text-align: center;">
                <a href="{{site_url}}/dashboard/orders" style="${s.btn}">Track Order</a>
            </div>
        `, 'Payment Confirmed', 'Billing')
  },

  order_completed: {
    subject: 'Service Activated - Order #{{order_id}} 🚀',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Services Active!</h1>
            <p style="${s.p}">Great news! Your services from Order #{{order_id}} are now fully active and ready to use.</p>
            <p style="${s.p}">Log in to your dashboard to manage your new services.</p>
            <div style="text-align: center;">
                <a href="{{site_url}}/dashboard/services" style="${s.btn}">Manage Services</a>
            </div>
        `, 'Order Completed', 'Services')
  },

  order_cancelled: {
    subject: 'Order Cancelled #{{order_id}}',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Order Cancelled</h1>
            <p style="${s.p}">Your order #{{order_id}} has been cancelled.</p>
            <p style="${s.p}">If you have questions, please reach out to our support team.</p>
            <div style="text-align: center;">
                <a href="{{site_url}}/support" style="${s.btn}">Contact Support</a>
            </div>
        `, 'Order Cancelled', 'Billing')
  },

  invoice_generated: {
    subject: 'New Invoice #{{invoice_id}} 📄',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">New Invoice Generated</h1>
            <p style="${s.p}">An invoice is ready for payment.</p>
            <div style="${s.card} text-align:center;">
                <p style="color:#64748b; font-size:14px; margin-bottom:8px;">Amount Due</p>
                <p style="color:#0f172a; font-size:32px; font-weight:700; margin:0 0 8px 0;">{{invoice_amount}}</p>
                <p style="color:#ef4444; font-weight:500;">Due: {{due_date}}</p>
            </div>
            <div style="text-align: center;">
                <a href="{{site_url}}/dashboard/invoices" style="${s.btn}">View & Pay</a>
            </div>
        `, 'New Invoice', 'Billing')
  },

  payment_received: {
    subject: 'Payment Received for Invoice #{{invoice_id}}',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Payment Received</h1>
            <p style="${s.p}">Thank you! We've received your payment.</p>
            <div style="${s.card}">
                <p><strong>Invoice:</strong> #{{invoice_id}}</p>
                <p><strong>Amount:</strong> {{payment_amount}}</p>
                <p><strong>Date:</strong> {{payment_date}}</p>
            </div>
            <div style="text-align: center;">
                <a href="{{site_url}}/dashboard/invoices" style="${s.btn}">View Invoices</a>
            </div>
        `, 'Payment Confirmation', 'Billing')
  },

  // --- SUPPORT ---
  ticket_created: {
    subject: '[Ticket #{{ticket_id}}] {{ticket_subject}} 🎫',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Ticket Received</h1>
            <p style="${s.p}">Hello {{user_name}}, we've received your request.</p>
            <div style="${s.card}">
                <div style="margin-bottom:12px;">
                    <span style="${s.badge} background:#e0e7ff; color:#4338ca;">#{{ticket_id}}</span>
                </div>
                <h3 style="margin:0 0 8px 0;">{{ticket_subject}}</h3>
                <p style="margin:0; color:#64748b; font-size:14px;">Priority: {{ticket_priority}}</p>
            </div>
            <div style="text-align: center;">
                <a href="{{site_url}}/dashboard/tickets" style="${s.btn}">View Ticket</a>
            </div>
        `, 'Ticket Created', 'Support')
  },

  ticket_replied: {
    subject: 'Reply to Ticket #{{ticket_id}} 💬',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">New Support Reply</h1>
            <p style="${s.p}">A support agent has replied to your ticket.</p>
            <div style="${s.card} border-left:4px solid #6366f1;">
                <p style="margin-bottom:8px; font-weight:600; font-size:14px; color:#475569;">From: {{reply_from}}</p>
                <div style="color:#334155; line-height:1.6;">{{reply_message}}</div>
            </div>
            <div style="text-align: center;">
                <a href="{{site_url}}/dashboard/tickets" style="${s.btn}">View & Reply</a>
            </div>
        `, 'Ticket Reply', 'Support')
  },

  ticket_closed: {
    subject: 'Ticket #{{ticket_id}} Closed',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Ticket Closed</h1>
            <p style="${s.p}">Your ticket <strong>#{{ticket_id}}</strong> has been resolved and closed.</p>
            <p style="${s.p}">We hope we were able to help! Feel free to open a new ticket if you need anything else.</p>
            <div style="text-align: center;">
                <a href="{{site_url}}/dashboard/tickets" style="${s.btn}">Support Dashboard</a>
            </div>
        `, 'Ticket Closed', 'Support')
  },

  // --- SERVICES ---
  service_expiring: {
    subject: 'Use Action Required: Service Expiring ⚠️',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Service Expiring Soon</h1>
            <p style="${s.p}">Your service <strong>{{service_name}}</strong> is expiring on <strong>{{expiry_date}}</strong>.</p>
            <p style="${s.p}">Please renew now to avoid service interruption.</p>
            <div style="text-align: center;">
                <a href="{{site_url}}/dashboard/services" style="${s.btn}">Renew Service</a>
            </div>
        `, 'Service Expiring', 'Services')
  },

  service_suspended: {
    subject: 'Service Suspended: {{service_name}} ⛔',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Service Suspended</h1>
            <p style="${s.p}">Your service <strong>{{service_name}}</strong> has been suspended due to overdue payment.</p>
            <div style="${s.card} border-left:4px solid #ef4444;">
                <p style="color:#b91c1c; margin:0;">Please settle your invoice immediately to reactivate your service.</p>
            </div>
            <div style="text-align: center;">
                <a href="{{site_url}}/dashboard/invoices" style="${s.btnRed}">Pay Invoice</a>
            </div>
        `, 'Service Suspended', 'Services')
  },

  // --- MARKETING ---
  newsletter_subscribe: {
    subject: 'You\'re Subscribed! 🌟',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Welcome to the Newsletter!</h1>
            <p style="${s.p}">Thanks for subscribing! You're now on the list to receive our latest updates, tech tips, and exclusive offers.</p>
            <div style="${s.card}">
                <p style="margin:0; text-align:center; font-weight:500;">Stay tuned for our next issue!</p>
            </div>
            <div style="text-align: center;">
                <a href="{{site_url}}" style="${s.btn}">Explore Site</a>
            </div>
            <p style="text-align:center; font-size:12px; color:#94a3b8; margin-top:20px;">
                <a href="{{site_url}}/unsubscribe?email={{email}}" style="color:#94a3b8; text-decoration:underline;">Unsubscribe</a>
            </p>
        `, 'Subscription Confirmed', 'Marketing')
  },

  proposal_sent: {
    subject: 'New Proposal: {{proposal_title}}',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">New Business Proposal</h1>
            <p style="${s.p}">You have received a new proposal: <strong>{{proposal_title}}</strong>.</p>
            <div style="${s.card}">
                <p><strong>Total Value:</strong> {{proposal_total}}</p>
            </div>
            <div style="text-align: center;">
                <a href="{{proposal_link}}" style="${s.btn}">Review Proposal</a>
            </div>
        `, 'New Proposal', 'Marketing')
  },

  // --- SYSTEM / ADMIN ---
  admin_new_order: {
    subject: '[Admin] New Order #{{order_id}}',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">New Order Received</h1>
            <div style="${s.card}">
                <p><strong>Order ID:</strong> #{{order_id}}</p>
                <p><strong>Customer:</strong> {{user_name}}</p>
                <p><strong>Total:</strong> {{order_total}}</p>
                <p><strong>Payment:</strong> {{payment_method}}</p>
            </div>
            <div style="text-align: center;">
                <a href="{{site_url}}/admin/orders" style="${s.btn}">View Order</a>
            </div>
        `, 'Admin Notification', 'System')
  },

  admin_new_ticket: {
    subject: '[Admin] New Ticket #{{ticket_id}}',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">New Support Ticket</h1>
            <div style="${s.card}">
                <p><strong>Ticket ID:</strong> #{{ticket_id}}</p>
                <p><strong>Customer:</strong> {{user_name}}</p>
                <p><strong>Subject:</strong> {{ticket_subject}}</p>
                <p><strong>Priority:</strong> {{ticket_priority}}</p>
            </div>
            <div style="text-align: center;">
                <a href="{{site_url}}/admin/tickets" style="${s.btn}">Reply to Ticket</a>
            </div>
        `, 'Admin Notification', 'System')
  },

  test_email: {
    subject: 'System Test Email 🧪',
    html: getPremiumTemplateWrapper(`
            <h1 style="${s.h1}">Test Email</h1>
            <p style="${s.p}">If you are reading this, your email configuration is working perfectly! 🎉</p>
            <div style="${s.card}">
                <p><strong>Sent at:</strong> {{timestamp}}</p>
            </div>
        `, 'System Test', 'System')
  }
};

class EmailService {
  constructor() {
    this.mailgun = null;
    this.mg = null;
  }

  async init() {
    try {
      const settings = await this.getSettings();
      if (settings.mailgun_enabled && settings.mailgun_api_key) {
        const mailgun = new Mailgun(FormData);
        const baseUrl = settings.mailgun_region === 'eu'
          ? 'https://api.eu.mailgun.net'
          : 'https://api.mailgun.net';

        this.mg = mailgun.client({
          username: 'api',
          key: settings.mailgun_api_key,
          url: baseUrl
        });
        this.settings = settings;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Email service init error:', error);
      return false;
    }
  }

  async getSettings() {
    const keys = [
      'mailgun_enabled', 'mailgun_api_key', 'mailgun_domain',
      'mailgun_from_email', 'mailgun_from_name', 'mailgun_region',
      'email_logo', // Ensure email_logo is fetched
      'site_name', 'site_url'
    ];

    const placeholders = keys.map(() => '?').join(', ');
    const results = await db.query(
      `SELECT setting_key, setting_value, setting_type FROM settings WHERE setting_key IN (${placeholders})`,
      keys
    );

    const settings = {
      site_name: 'Magnetic Clouds',
      site_url: process.env.SITE_URL || 'https://magnetic-clouds.com'
    };

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

    return settings;
  }

  async isEnabled(eventType) {
    const settings = await this.getSettings();
    // Check both global enable and specific event enable if it exists in settings
    // Current implementation assumes enabled if not explicitly disabled
    return settings.mailgun_enabled;
  }

  replaceVariables(template, variables) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value !== undefined && value !== null ? value : '');
    }
    return result;
  }

  async send(to, templateName, variables = {}, userId = null) {
    const emailUuid = uuidv4();
    let subject = '';
    let html = '';

    try {
      // Get default template
      const defaultTemplate = templates[templateName];
      if (!defaultTemplate) {
        console.error(`Template ${templateName} not found`);
        return false;
      }

      // Try to get custom template from database
      let customTemplate = null;
      let emailLogo = null;
      try {
        const customResults = await db.query(
          'SELECT subject, html_content, is_active FROM email_templates WHERE template_key = ?',
          [templateName]
        );
        if (customResults && customResults.length > 0 && customResults[0].is_active) {
          customTemplate = customResults[0];
        }
      } catch (dbErr) {
        console.log('Could not load custom template:', dbErr.message);
      }

      // Use custom template if exists, otherwise use default
      const templateSubject = customTemplate?.subject || defaultTemplate.subject;
      const templateHtml = customTemplate?.html_content || defaultTemplate.html;

      // Get settings for defaults
      const settings = await this.getSettings();

      // Prepare logo HTML if exists
      let logoHtml = '';
      if (settings.email_logo) {
        logoHtml = `<img src="${settings.email_logo}" alt="${settings.site_name}" style="max-height: 48px; max-width: 200px; display: block; border: 0;" />`;
      }

      // Add default variables
      const allVariables = {
        site_name: settings.site_name || 'Magnetic Clouds',
        site_url: settings.site_url || 'https://magnetic-clouds.com',
        year: new Date().getFullYear(),
        email: to, // Add recipient email for cleaner footer
        email_logo: logoHtml, // Standardized variable for wrapper
        ...variables
      };

      subject = this.replaceVariables(templateSubject, allVariables);
      html = this.replaceVariables(templateHtml, allVariables);

      // Log email attempt
      await this.logEmail({
        uuid: emailUuid,
        user_id: userId,
        recipient_email: to,
        recipient_name: variables.user_name || null,
        subject,
        template: templateName,
        html_content: html,
        status: 'pending',
        metadata: JSON.stringify(variables)
      });

      // Check if Mailgun is enabled
      if (!await this.isEnabled(templateName)) {
        console.log(`Email ${templateName} is disabled or Mailgun not configured`);
        await this.updateEmailLog(emailUuid, 'failed', 'Mailgun not configured');
        return false;
      }

      // Initialize Mailgun
      if (!this.mg) {
        const initialized = await this.init();
        if (!initialized) {
          console.log('Mailgun initialization failed');
          await this.updateEmailLog(emailUuid, 'failed', 'Mailgun init failed');
          return false;
        }
      }

      // Send via Mailgun
      const result = await this.mg.messages.create(this.settings.mailgun_domain, {
        from: `${this.settings.mailgun_from_name} <${this.settings.mailgun_from_email}>`,
        to: [to],
        subject: subject,
        html: html
      });

      // Update log to sent
      await this.updateEmailLog(emailUuid, 'sent');
      console.log(`Email sent: ${templateName} to ${to}`, result.id);
      return true;

    } catch (error) {
      console.error('Email send error:', error);
      await this.updateEmailLog(emailUuid, 'failed', error.message);
      return false;
    }
  }

  async logEmail({ uuid, user_id, recipient_email, recipient_name, subject, template, html_content, status, metadata }) {
    try {
      await db.query(`
                INSERT INTO email_logs (uuid, user_id, recipient_email, recipient_name, subject, template, html_content, status, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [uuid, user_id, recipient_email, recipient_name, subject, template, html_content, status, metadata]);
    } catch (error) {
      console.error('Email log error:', error.message);
    }
  }

  async updateEmailLog(uuid, status, errorMessage = null) {
    try {
      if (status === 'sent') {
        await db.query('UPDATE email_logs SET status = ?, sent_at = NOW() WHERE uuid = ?', [status, uuid]);
      } else {
        await db.query('UPDATE email_logs SET status = ?, error_message = ? WHERE uuid = ?', [status, errorMessage, uuid]);
      }
    } catch (error) {
      console.error('Email log update error:', error.message);
    }
  }

  // Convenience methods
  async sendWelcome(user) {
    return this.send(user.email, 'welcome_email', { user_name: user.first_name || user.email }, user.id);
  }

  async sendPasswordReset(user, resetLink) {
    return this.send(user.email, 'password_reset', { user_name: user.first_name || user.email, reset_link: resetLink }, user.id);
  }

  // Add other event helpers matching the previous structure
  async sendOrderPlaced(order, user) {
    // Items html formatting
    let itemsHtml = '';
    if (order.items && Array.isArray(order.items)) {
      itemsHtml = order.items.map(item => `
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span>${item.name || item.product_name}</span>
                    <span>$${item.price}</span>
                </div>
            `).join('');
    }

    return this.send(user.email, 'order_placed', {
      user_name: user.first_name || user.email,
      order_id: order.uuid || order.id,
      order_total: `$${order.total}`,
      order_items: itemsHtml
    }, user.id);
  }

  async sendOrderConfirmed(order, user) {
    return this.send(user.email, 'order_confirmed', {
      user_name: user.first_name || user.email,
      order_id: order.uuid || order.id,
      order_total: `$${order.total}`
    }, user.id);
  }

  async sendOrderCompleted(order, user) {
    return this.send(user.email, 'order_completed', {
      user_name: user.first_name || user.email,
      order_id: order.uuid || order.id
    }, user.id);
  }

  async sendOrderCancelled(order, user) {
    return this.send(user.email, 'order_cancelled', {
      user_name: user.first_name || user.email,
      order_id: order.uuid || order.id
    }, user.id);
  }

  async sendTicketCreated(ticket, user) {
    return this.send(user.email, 'ticket_created', {
      user_name: user.first_name || user.email,
      ticket_id: ticket.id,
      ticket_subject: ticket.subject,
      ticket_priority: ticket.priority || 'Normal'
    }, user.id);
  }

  async sendTicketReplied(ticket, user, reply, replyFrom) {
    return this.send(user.email, 'ticket_replied', {
      user_name: user.first_name || user.email,
      ticket_id: ticket.id,
      reply_from: replyFrom,
      reply_message: reply.message ? reply.message.replace(/\n/g, '<br>') : 'New reply received.'
    }, user.id);
  }

  async sendTicketClosed(ticket, user) {
    return this.send(user.email, 'ticket_closed', {
      user_name: user.first_name || user.email,
      ticket_id: ticket.id
    }, user.id);
  }

  async invoiceGenerated(invoice, user) {
    return this.send(user.email, 'invoice_generated', {
      user_name: user.first_name || user.email,
      invoice_id: invoice.id,
      invoice_amount: `$${invoice.amount}`,
      due_date: new Date(invoice.due_date).toLocaleDateString()
    }, user.id);
  }

  async paymentReceived(payment, user) {
    return this.send(user.email, 'payment_received', {
      user_name: user.first_name || user.email,
      invoice_id: payment.invoice_id,
      payment_amount: `$${payment.amount}`,
      payment_date: new Date().toLocaleDateString()
    }, user.id);
  }

  async sendTestEmail(to) {
    // Force init
    await this.init();
    if (!this.mg) throw new Error('Mailgun not configured');

    return this.send(to, 'test_email', {
      timestamp: new Date().toLocaleString()
    });
  }

  async notifyAdminNewOrder(order, user) {
    const admins = await db.query("SELECT email FROM users WHERE role = 'admin'");
    for (const admin of admins) {
      await this.send(admin.email, 'admin_new_order', {
        order_id: order.uuid || order.id,
        user_name: user.first_name ? `${user.first_name} ${user.last_name}` : user.email,
        order_total: `$${order.total}`,
        payment_method: order.payment_method
      });
    }
  }

  async notifyAdminNewTicket(ticket, user) {
    const admins = await db.query("SELECT email FROM users WHERE role = 'admin'");
    for (const admin of admins) {
      await this.send(admin.email, 'admin_new_ticket', {
        ticket_id: ticket.id,
        user_name: user.first_name ? `${user.first_name} ${user.last_name}` : user.email,
        ticket_subject: ticket.subject,
        ticket_priority: ticket.priority
      });
    }
  }

  async sendNewsletterConfirmation(email) {
    return this.send(email, 'newsletter_subscribe', {
      email: encodeURIComponent(email)
    });
  }

  getDefaultTemplate(key) {
    return templates[key]?.html || null;
  }

  getTemplateKeys() {
    return Object.keys(templates);
  }
}

module.exports = new EmailService();
