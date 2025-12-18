const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

class NotificationService {
  // Create admin notification
  async createAdminNotification({ type, title, message, icon, color, link, metadata }) {
    try {
      const uuid = uuidv4();
      await db.query(`
        INSERT INTO admin_notifications (uuid, type, title, message, icon, color, link, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [uuid, type, title, message, icon, color, link, metadata ? JSON.stringify(metadata) : null]);
      return uuid;
    } catch (error) {
      console.error('Create admin notification error:', error.message);
      return null;
    }
  }

  // Create user notification
  async createUserNotification({ userId, type, title, message, icon, color, link, metadata }) {
    try {
      const uuid = uuidv4();
      await db.query(`
        INSERT INTO user_notifications (uuid, user_id, type, title, message, icon, color, link, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [uuid, userId, type, title, message, icon, color, link, metadata ? JSON.stringify(metadata) : null]);
      return uuid;
    } catch (error) {
      console.error('Create user notification error:', error.message);
      return null;
    }
  }

  // Order notifications
  async notifyNewOrder(order, user) {
    // Admin notification
    await this.createAdminNotification({
      type: 'order',
      title: 'New Order Received',
      message: `${user.first_name} ${user.last_name} placed order #${order.uuid?.substring(0, 8) || order.id} for $${Number(order.total || 0).toFixed(2)}`,
      icon: 'shopping-cart',
      color: 'primary',
      link: `/admin/orders`,
      metadata: { order_id: order.id, order_uuid: order.uuid, user_id: user.id }
    });

    // User notification
    await this.createUserNotification({
      userId: user.id,
      type: 'order',
      title: 'Order Placed Successfully',
      message: `Your order #${order.uuid?.substring(0, 8) || order.id} has been received and is being processed.`,
      icon: 'shopping-cart',
      color: 'primary',
      link: `/dashboard/orders`,
      metadata: { order_id: order.id, order_uuid: order.uuid }
    });
  }

  async notifyOrderConfirmed(order, user) {
    await this.createUserNotification({
      userId: user.id,
      type: 'order',
      title: 'Order Confirmed',
      message: `Your order #${order.uuid?.substring(0, 8) || order.id} has been confirmed and is now active.`,
      icon: 'check-circle',
      color: 'success',
      link: `/dashboard/orders`,
      metadata: { order_id: order.id, order_uuid: order.uuid }
    });
  }

  async notifyOrderCancelled(order, user) {
    await this.createUserNotification({
      userId: user.id,
      type: 'order',
      title: 'Order Cancelled',
      message: `Your order #${order.uuid?.substring(0, 8) || order.id} has been cancelled.`,
      icon: 'x-circle',
      color: 'danger',
      link: `/dashboard/orders`,
      metadata: { order_id: order.id, order_uuid: order.uuid }
    });
  }

  // Payment notifications
  async notifyPaymentReceived(order, user, amount) {
    await this.createAdminNotification({
      type: 'payment',
      title: 'Payment Received',
      message: `Payment of $${Number(amount || 0).toFixed(2)} received from ${user.first_name} ${user.last_name} for order #${order.uuid?.substring(0, 8) || order.id}`,
      icon: 'dollar-sign',
      color: 'success',
      link: `/admin/orders`,
      metadata: { order_id: order.id, amount }
    });

    await this.createUserNotification({
      userId: user.id,
      type: 'payment',
      title: 'Payment Confirmed',
      message: `Your payment of $${Number(amount || 0).toFixed(2)} has been confirmed.`,
      icon: 'check-circle',
      color: 'success',
      link: `/dashboard/orders`,
      metadata: { order_id: order.id, amount }
    });
  }

  async notifyPaymentProofSubmitted(order, user) {
    await this.createAdminNotification({
      type: 'payment',
      title: 'Payment Proof Submitted',
      message: `${user.first_name} ${user.last_name} submitted payment proof for order #${order.uuid?.substring(0, 8) || order.id}`,
      icon: 'upload',
      color: 'warning',
      link: `/admin/orders`,
      metadata: { order_id: order.id, order_uuid: order.uuid }
    });
  }

  // Ticket notifications
  async notifyNewTicket(ticket, user) {
    await this.createAdminNotification({
      type: 'ticket',
      title: 'New Support Ticket',
      message: `${user.first_name} ${user.last_name} created ticket: "${ticket.subject}"`,
      icon: 'message-square',
      color: 'primary',
      link: `/admin/tickets`,
      metadata: { ticket_id: ticket.id }
    });
  }

  async notifyTicketReply(ticket, user, isAdminReply) {
    if (isAdminReply) {
      await this.createUserNotification({
        userId: user.id,
        type: 'ticket',
        title: 'Ticket Reply',
        message: `You have a new reply on your ticket: "${ticket.subject}"`,
        icon: 'message-square',
        color: 'primary',
        link: `/dashboard/tickets`,
        metadata: { ticket_id: ticket.id }
      });
    } else {
      await this.createAdminNotification({
        type: 'ticket',
        title: 'New Ticket Reply',
        message: `${user.first_name} ${user.last_name} replied to ticket: "${ticket.subject}"`,
        icon: 'message-square',
        color: 'primary',
        link: `/admin/tickets`,
        metadata: { ticket_id: ticket.id }
      });
    }
  }

  // User notifications
  async notifyNewUser(user) {
    await this.createAdminNotification({
      type: 'user',
      title: 'New User Registration',
      message: `${user.first_name} ${user.last_name} (${user.email}) just registered.`,
      icon: 'user-plus',
      color: 'primary',
      link: `/admin/users`,
      metadata: { user_id: user.id }
    });
  }

  // Service notifications
  async notifyServiceActivated(service, user) {
    await this.createUserNotification({
      userId: user.id,
      type: 'service',
      title: 'Service Activated',
      message: `Your service "${service.name}" is now active.`,
      icon: 'check-circle',
      color: 'success',
      link: `/dashboard/services`,
      metadata: { service_id: service.id }
    });
  }

  async notifyServiceExpiring(service, user, daysLeft) {
    await this.createUserNotification({
      userId: user.id,
      type: 'service',
      title: 'Service Expiring Soon',
      message: `Your service "${service.name}" will expire in ${daysLeft} days.`,
      icon: 'alert-triangle',
      color: 'warning',
      link: `/dashboard/services`,
      metadata: { service_id: service.id }
    });
  }

  // Proposal/Invoice notifications
  async notifyProposalSent(proposal, user) {
    await this.createUserNotification({
      userId: user.id,
      type: 'proposal',
      title: 'New Proposal',
      message: `You have received a new proposal: "${proposal.title}"`,
      icon: 'file-text',
      color: 'primary',
      link: `/proposal/${proposal.uuid}`,
      metadata: { proposal_id: proposal.id, proposal_uuid: proposal.uuid }
    });
  }

  async notifyProposalAccepted(proposal, user) {
    await this.createAdminNotification({
      type: 'proposal',
      title: 'Proposal Accepted',
      message: `${user.first_name} ${user.last_name} accepted proposal: "${proposal.title}"`,
      icon: 'check-circle',
      color: 'success',
      link: `/admin/proposals`,
      metadata: { proposal_id: proposal.id }
    });
  }

  async notifyProposalRejected(proposal, user) {
    await this.createAdminNotification({
      type: 'proposal',
      title: 'Proposal Rejected',
      message: `${user.first_name} ${user.last_name} rejected proposal: "${proposal.title}"`,
      icon: 'x-circle',
      color: 'danger',
      link: `/admin/proposals`,
      metadata: { proposal_id: proposal.id }
    });
  }

  async notifyInvoiceGenerated(invoice, user) {
    await this.createUserNotification({
      userId: user.id,
      type: 'invoice',
      title: 'New Invoice',
      message: `Invoice #${invoice.invoice_number} for $${Number(invoice.total || 0).toFixed(2)} has been generated.`,
      icon: 'file-text',
      color: 'primary',
      link: `/dashboard/invoices`,
      metadata: { invoice_id: invoice.id }
    });
  }

  async notifyInvoicePaid(invoice, user) {
    await this.createAdminNotification({
      type: 'invoice',
      title: 'Invoice Paid',
      message: `Invoice #${invoice.invoice_number} ($${Number(invoice.total || 0).toFixed(2)}) has been paid by ${user.first_name} ${user.last_name}`,
      icon: 'check-circle',
      color: 'success',
      link: `/admin/invoices`,
      metadata: { invoice_id: invoice.id }
    });
  }

  // Get admin notifications
  async getAdminNotifications(limit = 50, unreadOnly = false) {
    try {
      let query = 'SELECT * FROM admin_notifications';
      if (unreadOnly) {
        query += ' WHERE is_read = FALSE';
      }
      query += ' ORDER BY created_at DESC LIMIT ?';
      
      const notifications = await db.query(query, [limit]);
      return notifications;
    } catch (error) {
      console.error('Get admin notifications error:', error.message);
      return [];
    }
  }

  // Get user notifications
  async getUserNotifications(userId, limit = 50, unreadOnly = false) {
    try {
      let query = 'SELECT * FROM user_notifications WHERE user_id = ?';
      if (unreadOnly) {
        query += ' AND is_read = FALSE';
      }
      query += ' ORDER BY created_at DESC LIMIT ?';
      
      const notifications = await db.query(query, [userId, limit]);
      return notifications;
    } catch (error) {
      console.error('Get user notifications error:', error.message);
      return [];
    }
  }

  // Mark as read
  async markAdminNotificationRead(uuid) {
    try {
      await db.query('UPDATE admin_notifications SET is_read = TRUE, read_at = NOW() WHERE uuid = ?', [uuid]);
      return true;
    } catch (error) {
      console.error('Mark admin notification read error:', error.message);
      return false;
    }
  }

  async markUserNotificationRead(uuid, userId) {
    try {
      await db.query('UPDATE user_notifications SET is_read = TRUE, read_at = NOW() WHERE uuid = ? AND user_id = ?', [uuid, userId]);
      return true;
    } catch (error) {
      console.error('Mark user notification read error:', error.message);
      return false;
    }
  }

  async markAllAdminRead() {
    try {
      await db.query('UPDATE admin_notifications SET is_read = TRUE, read_at = NOW() WHERE is_read = FALSE');
      return true;
    } catch (error) {
      console.error('Mark all admin read error:', error.message);
      return false;
    }
  }

  async markAllUserRead(userId) {
    try {
      await db.query('UPDATE user_notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE', [userId]);
      return true;
    } catch (error) {
      console.error('Mark all user read error:', error.message);
      return false;
    }
  }

  // Get unread count
  async getAdminUnreadCount() {
    try {
      const result = await db.query('SELECT COUNT(*) as count FROM admin_notifications WHERE is_read = FALSE');
      return result[0]?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  async getUserUnreadCount(userId) {
    try {
      const result = await db.query('SELECT COUNT(*) as count FROM user_notifications WHERE user_id = ? AND is_read = FALSE', [userId]);
      return result[0]?.count || 0;
    } catch (error) {
      return 0;
    }
  }
}

module.exports = new NotificationService();
