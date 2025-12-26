const FormData = require('form-data');
const Mailgun = require('mailgun.js');
const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

// Email templates
const templates = {
  welcome_email: {
    subject: 'Welcome to {{site_name}}!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to {{site_name}}!</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>Hi {{user_name}},</p>
          <p>Thank you for creating an account with us. We're excited to have you on board!</p>
          <p>You can now:</p>
          <ul>
            <li>Browse our hosting plans and services</li>
            <li>Register domain names</li>
            <li>Manage your account and billing</li>
            <li>Get 24/7 support from our team</li>
          </ul>
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{site_url}}/dashboard" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Go to Dashboard</a>
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  password_reset: {
    subject: 'Reset Your Password - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>Hi {{user_name}},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="{{reset_link}}" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  order_placed: {
    subject: 'Order Confirmation #{{order_id}} - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Received!</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>Hi {{user_name}},</p>
          <p>Thank you for your order! We've received your order and it's being processed.</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> #{{order_id}}</p>
            <p><strong>Date:</strong> {{order_date}}</p>
            <p><strong>Total:</strong> {{order_total}}</p>
            <p><strong>Payment Status:</strong> {{payment_status}}</p>
          </div>
          <h3>Items:</h3>
          {{order_items}}
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{site_url}}/dashboard/orders" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">View Order</a>
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  order_confirmed: {
    subject: 'Payment Confirmed - Order #{{order_id}} - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">✓ Payment Confirmed</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>Hi {{user_name}},</p>
          <p>Great news! Your payment for order #{{order_id}} has been confirmed.</p>
          <p>We're now processing your order and will notify you once your services are active.</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Order ID:</strong> #{{order_id}}</p>
            <p><strong>Amount Paid:</strong> {{order_total}}</p>
          </div>
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{site_url}}/dashboard/orders" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">View Order</a>
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  order_completed: {
    subject: 'Your Service is Active - Order #{{order_id}} - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Service Activated!</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>Hi {{user_name}},</p>
          <p>Your order #{{order_id}} has been completed and your services are now active!</p>
          <p>You can access and manage your services from your dashboard.</p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{site_url}}/dashboard/services" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Manage Services</a>
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  order_cancelled: {
    subject: 'Order Cancelled - #{{order_id}} - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Cancelled</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>Hi {{user_name}},</p>
          <p>Your order #{{order_id}} has been cancelled.</p>
          <p>If you have any questions or need assistance, please contact our support team.</p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{site_url}}/support" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Contact Support</a>
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  ticket_created: {
    subject: 'Ticket Created #{{ticket_id}} - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Support Ticket Created</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>Hi {{user_name}},</p>
          <p>Your support ticket has been created successfully. Our team will respond as soon as possible.</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Ticket ID:</strong> #{{ticket_id}}</p>
            <p><strong>Subject:</strong> {{ticket_subject}}</p>
            <p><strong>Priority:</strong> {{ticket_priority}}</p>
          </div>
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{site_url}}/dashboard/tickets" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">View Ticket</a>
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  ticket_replied: {
    subject: 'New Reply on Ticket #{{ticket_id}} - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Ticket Reply</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>Hi {{user_name}},</p>
          <p>There's a new reply on your support ticket.</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Ticket ID:</strong> #{{ticket_id}}</p>
            <p><strong>Subject:</strong> {{ticket_subject}}</p>
            <p><strong>Reply from:</strong> {{reply_from}}</p>
            <div style="border-left: 3px solid #6366f1; padding-left: 15px; margin-top: 15px;">
              {{reply_message}}
            </div>
          </div>
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{site_url}}/dashboard/tickets" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">View & Reply</a>
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  ticket_closed: {
    subject: 'Ticket Closed #{{ticket_id}} - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Ticket Resolved</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>Hi {{user_name}},</p>
          <p>Your support ticket #{{ticket_id}} has been marked as resolved and closed.</p>
          <p>If you need further assistance, you can reopen this ticket or create a new one.</p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{site_url}}/dashboard/tickets" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">View Tickets</a>
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  invoice_generated: {
    subject: 'New Invoice #{{invoice_id}} - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Invoice</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>Hi {{user_name}},</p>
          <p>A new invoice has been generated for your account.</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Invoice ID:</strong> #{{invoice_id}}</p>
            <p><strong>Amount Due:</strong> {{invoice_amount}}</p>
            <p><strong>Due Date:</strong> {{due_date}}</p>
          </div>
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{site_url}}/dashboard/invoices" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Pay Now</a>
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  payment_received: {
    subject: 'Payment Received - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">✓ Payment Received</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>Hi {{user_name}},</p>
          <p>We've received your payment. Thank you!</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Amount:</strong> {{payment_amount}}</p>
            <p><strong>Invoice:</strong> #{{invoice_id}}</p>
            <p><strong>Date:</strong> {{payment_date}}</p>
          </div>
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{site_url}}/dashboard/invoices" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">View Invoices</a>
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  service_expiring: {
    subject: 'Service Expiring Soon - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">⚠️ Service Expiring</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>Hi {{user_name}},</p>
          <p>Your service <strong>{{service_name}}</strong> will expire on <strong>{{expiry_date}}</strong>.</p>
          <p>To avoid any interruption, please renew your service before the expiration date.</p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{site_url}}/dashboard/services" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Renew Now</a>
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  service_suspended: {
    subject: 'Service Suspended - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Service Suspended</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>Hi {{user_name}},</p>
          <p>Your service <strong>{{service_name}}</strong> has been suspended due to non-payment.</p>
          <p>To reactivate your service, please complete the pending payment.</p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{site_url}}/dashboard/invoices" style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Pay Now</a>
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  admin_new_order: {
    subject: 'New Order Received #{{order_id}} - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Order Received</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>A new order has been placed:</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Order ID:</strong> #{{order_id}}</p>
            <p><strong>Customer:</strong> {{user_name}} ({{user_email}})</p>
            <p><strong>Total:</strong> {{order_total}}</p>
            <p><strong>Payment Method:</strong> {{payment_method}}</p>
          </div>
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{site_url}}/admin/orders" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">View Order</a>
          </p>
        </div>
      </div>
    `
  },

  admin_new_ticket: {
    subject: 'New Support Ticket #{{ticket_id}} - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Support Ticket</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>A new support ticket has been created:</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Ticket ID:</strong> #{{ticket_id}}</p>
            <p><strong>Customer:</strong> {{user_name}} ({{user_email}})</p>
            <p><strong>Subject:</strong> {{ticket_subject}}</p>
            <p><strong>Priority:</strong> {{ticket_priority}}</p>
          </div>
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{site_url}}/admin/tickets" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">View Ticket</a>
          </p>
        </div>
      </div>
    `
  },

  proposal_sent: {
    subject: 'New Proposal: {{proposal_title}} - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Proposal</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>Hi {{user_name}},</p>
          <p>You have received a new business proposal from {{site_name}}.</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Proposal:</strong> {{proposal_title}}</p>
            <p><strong>Total:</strong> {{proposal_total}}</p>
          </div>
          <p>Please review the proposal and accept or reject it at your earliest convenience.</p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="{{proposal_link}}" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">View Proposal</a>
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
  },

  newsletter_subscribe: {
    subject: 'Welcome to {{site_name}} Newsletter! 🎉',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 50px 40px; text-align: center; border-radius: 0 0 50px 50px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; line-height: 80px;">
                  <span style="font-size: 40px;">📧</span>
                </div>
              </td>
            </tr>
            <tr>
              <td align="center">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">You're Subscribed!</h1>
                <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">Welcome to the {{site_name}} newsletter</p>
              </td>
            </tr>
          </table>
        </div>
        <div style="padding: 40px; background: #ffffff; margin: 0 20px; border-radius: 20px; transform: translateY(-30px); box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi there! 👋</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Thank you for subscribing to our newsletter. You'll now receive:</p>
          <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 12px; padding: 20px; margin: 25px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding: 8px 0;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="width: 32px; vertical-align: middle;">
                        <div style="width: 24px; height: 24px; background: #10b981; border-radius: 50%; text-align: center; line-height: 24px;"><span style="color: white; font-size: 14px;">✓</span></div>
                      </td>
                      <td style="vertical-align: middle; color: #374151;">Exclusive deals & promotions</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="width: 32px; vertical-align: middle;">
                        <div style="width: 24px; height: 24px; background: #10b981; border-radius: 50%; text-align: center; line-height: 24px;"><span style="color: white; font-size: 14px;">✓</span></div>
                      </td>
                      <td style="vertical-align: middle; color: #374151;">New product announcements</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="width: 32px; vertical-align: middle;">
                        <div style="width: 24px; height: 24px; background: #10b981; border-radius: 50%; text-align: center; line-height: 24px;"><span style="color: white; font-size: 14px;">✓</span></div>
                      </td>
                      <td style="vertical-align: middle; color: #374151;">Tips & tutorials</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="width: 32px; vertical-align: middle;">
                        <div style="width: 24px; height: 24px; background: #10b981; border-radius: 50%; text-align: center; line-height: 24px;"><span style="color: white; font-size: 14px;">✓</span></div>
                      </td>
                      <td style="vertical-align: middle; color: #374151;">Industry news & updates</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding-top: 20px;">
                <a href="{{site_url}}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 40px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: 600;">Explore Our Services</a>
              </td>
            </tr>
          </table>
        </div>
        <div style="padding: 30px; text-align: center; color: #9ca3af;">
          <p style="font-size: 12px; margin: 0;">© {{year}} {{site_name}}. All rights reserved.</p>
          <p style="font-size: 11px; margin-top: 10px;">
            Don't want to receive these emails? <a href="{{site_url}}/unsubscribe?email={{email}}" style="color: #6366f1;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `
  },

  test_email: {
    subject: 'Test Email - {{site_name}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Test Email</h1>
        </div>
        <div style="padding: 40px; background: #f9fafb;">
          <p>If you're receiving this email, your Mailgun configuration is working correctly!</p>
          <p>Email sent at: {{timestamp}}</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© {{year}} {{site_name}}. All rights reserved.</p>
        </div>
      </div>
    `
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
      'welcome_email', 'password_reset', 'newsletter_subscribe', 'order_placed', 'order_confirmed',
      'order_processing', 'order_completed', 'order_cancelled',
      'ticket_created', 'ticket_replied', 'ticket_closed',
      'invoice_generated', 'payment_received', 'service_expiring', 'service_suspended',
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
          // Convert boolean strings to actual booleans
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
    return settings.mailgun_enabled && settings[eventType] !== false;
  }

  replaceVariables(template, variables) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
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

        // Get email logo
        const logoResult = await db.query(
          "SELECT setting_value FROM settings WHERE setting_key = 'email_logo'"
        );
        if (logoResult && logoResult.length > 0) {
          emailLogo = logoResult[0].setting_value;
        }
      } catch (dbErr) {
        console.log('Could not load custom template or logo:', dbErr.message);
      }

      // Use custom template if exists, otherwise use default
      const templateSubject = customTemplate?.subject || defaultTemplate.subject;
      const templateHtml = customTemplate?.html_content || defaultTemplate.html;

      // Add default variables + logo
      const settings = await this.getSettings();
      const allVariables = {
        site_name: settings.site_name || 'Magnetic Clouds',
        site_url: settings.site_url || 'https://magnetic-clouds.com',
        year: new Date().getFullYear(),
        email_logo: emailLogo || '',
        ...variables
      };

      subject = this.replaceVariables(templateSubject, allVariables);
      html = this.replaceVariables(templateHtml, allVariables);

      // If logo exists, add it INSIDE the first gradient header div (after the opening tag)
      if (emailLogo) {
        const logoHtml = `<div style="margin-bottom: 15px;"><img src="${emailLogo}" alt="${allVariables.site_name}" style="max-width: 150px; max-height: 45px; object-fit: contain;" /></div>`;

        // Find the gradient div and insert logo inside it at the beginning
        const gradientMatch = html.match(/(<div[^>]*background:\s*linear-gradient[^>]*>)/i);
        if (gradientMatch) {
          html = html.replace(gradientMatch[0], gradientMatch[0] + logoHtml);
        }
      }

      // Always log email attempt first
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
        console.log(`Email ${templateName} is disabled or Mailgun not configured - logged only`);
        await this.updateEmailLog(emailUuid, 'failed', 'Mailgun not configured or email type disabled');
        return false;
      }

      // Initialize if needed
      if (!this.mg) {
        const initialized = await this.init();
        if (!initialized) {
          console.log('Mailgun not initialized - email logged');
          await this.updateEmailLog(emailUuid, 'failed', 'Mailgun initialization failed');
          return false;
        }
      }

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
      // Update log to failed
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
      // Silently fail if table doesn't exist
      console.error('Email log error:', error.message);
    }
  }

  async updateEmailLog(uuid, status, errorMessage = null) {
    try {
      if (status === 'sent') {
        await db.query(
          'UPDATE email_logs SET status = ?, sent_at = NOW() WHERE uuid = ?',
          [status, uuid]
        );
      } else {
        await db.query(
          'UPDATE email_logs SET status = ?, error_message = ? WHERE uuid = ?',
          [status, errorMessage, uuid]
        );
      }
    } catch (error) {
      // Silently fail if table doesn't exist
      console.error('Email log update error:', error.message);
    }
  }

  // Convenience methods for different events
  async sendWelcome(user) {
    return this.send(user.email, 'welcome_email', {
      user_name: user.first_name || user.email
    }, user.id);
  }

  async sendPasswordReset(user, resetLink) {
    return this.send(user.email, 'password_reset', {
      user_name: user.first_name || user.email,
      reset_link: resetLink
    }, user.id);
  }

  async sendOrderPlaced(order, user) {
    const itemsHtml = order.items?.map(item =>
      `<p style="margin: 5px 0;">• ${item.name || item.product_type} - $${item.price}</p>`
    ).join('') || '';

    return this.send(user.email, 'order_placed', {
      user_name: user.first_name || user.email,
      order_id: order.uuid || order.id,
      order_date: new Date().toLocaleDateString(),
      order_total: `$${order.total?.toFixed(2) || '0.00'}`,
      payment_status: order.payment_status || 'Pending',
      order_items: itemsHtml
    }, user.id);
  }

  async sendOrderConfirmed(order, user) {
    return this.send(user.email, 'order_confirmed', {
      user_name: user.first_name || user.email,
      order_id: order.uuid || order.id,
      order_total: `$${order.total?.toFixed(2) || '0.00'}`
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
      ticket_priority: ticket.priority
    }, user.id);
  }

  async sendTicketReplied(ticket, user, reply, replyFrom) {
    return this.send(user.email, 'ticket_replied', {
      user_name: user.first_name || user.email,
      ticket_id: ticket.id,
      ticket_subject: ticket.subject,
      reply_from: replyFrom,
      reply_message: reply.message?.substring(0, 500) || ''
    }, user.id);
  }

  async sendTicketClosed(ticket, user) {
    return this.send(user.email, 'ticket_closed', {
      user_name: user.first_name || user.email,
      ticket_id: ticket.id
    }, user.id);
  }

  async sendTestEmail(to) {
    // Force init for test
    await this.init();
    if (!this.mg) {
      throw new Error('Mailgun not configured');
    }

    const emailUuid = uuidv4();
    const settings = await this.getSettings();
    const template = templates.test_email;
    const variables = {
      site_name: settings.site_name || 'Magnetic Clouds',
      timestamp: new Date().toISOString(),
      year: new Date().getFullYear()
    };

    const subject = this.replaceVariables(template.subject, variables);
    const html = this.replaceVariables(template.html, variables);

    // Log before sending
    await this.logEmail({
      uuid: emailUuid,
      user_id: null,
      recipient_email: to,
      recipient_name: null,
      subject,
      template: 'test_email',
      html_content: html,
      status: 'pending',
      metadata: JSON.stringify(variables)
    });

    try {
      const result = await this.mg.messages.create(this.settings.mailgun_domain, {
        from: `${this.settings.mailgun_from_name} <${this.settings.mailgun_from_email}>`,
        to: [to],
        subject: subject,
        html: html
      });

      await this.updateEmailLog(emailUuid, 'sent');
      return result;
    } catch (error) {
      await this.updateEmailLog(emailUuid, 'failed', error.message);
      throw error;
    }
  }

  // Admin notifications
  async notifyAdminNewOrder(order, user) {
    const admins = await db.query("SELECT email FROM users WHERE role = 'admin'");
    for (const admin of admins) {
      await this.send(admin.email, 'admin_new_order', {
        order_id: order.uuid || order.id,
        user_name: `${user.first_name} ${user.last_name}`,
        user_email: user.email,
        order_total: `$${order.total?.toFixed(2) || '0.00'}`,
        payment_method: order.payment_method
      });
    }
  }

  async notifyAdminNewTicket(ticket, user) {
    const admins = await db.query("SELECT email FROM users WHERE role = 'admin'");
    for (const admin of admins) {
      await this.send(admin.email, 'admin_new_ticket', {
        ticket_id: ticket.id,
        user_name: `${user.first_name} ${user.last_name}`,
        user_email: user.email,
        ticket_subject: ticket.subject,
        ticket_priority: ticket.priority
      });
    }
  }

  // Newsletter subscription confirmation
  async sendNewsletterConfirmation(email) {
    return this.send(email, 'newsletter_subscribe', {
      email: encodeURIComponent(email)
    });
  }

  // Get default template HTML by key (for admin editor)
  getDefaultTemplate(key) {
    const template = templates[key];
    return template?.html || null;
  }

  // Get all template keys
  getTemplateKeys() {
    return Object.keys(templates);
  }
}

module.exports = new EmailService();

