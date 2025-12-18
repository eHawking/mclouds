const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../database/connection');
const { authenticate } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Generate ticket number
function generateTicketNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `TKT-${timestamp}`;
}

// Create ticket
router.post('/', authenticate, [
  body('subject').trim().notEmpty().isLength({ max: 255 }),
  body('message').trim().notEmpty(),
  body('department').isIn(['sales', 'billing', 'technical', 'general']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, message, department, priority = 'medium', service_id } = req.body;
    const ticketUuid = uuidv4();
    const ticketNumber = generateTicketNumber();

    // Create ticket
    const result = await db.query(`
      INSERT INTO tickets (uuid, user_id, service_id, ticket_number, department, priority, subject, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open')
    `, [ticketUuid, req.user.id, service_id || null, ticketNumber, department, priority, subject]);

    const ticketId = Number(result.insertId);

    // Create first reply
    await db.query(`
      INSERT INTO ticket_replies (ticket_id, user_id, message, is_staff_reply)
      VALUES (?, ?, ?, FALSE)
    `, [ticketId, req.user.id, message]);

    // Send email notifications
    const ticketData = {
      id: ticketId,
      uuid: ticketUuid,
      ticket_number: ticketNumber,
      subject,
      priority,
      department
    };
    
    // Email to customer
    emailService.sendTicketCreated(ticketData, req.user).catch(err => 
      console.error('Failed to send ticket email:', err)
    );
    
    // Email to admin
    emailService.notifyAdminNewTicket(ticketData, req.user).catch(err => 
      console.error('Failed to notify admin:', err)
    );

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: {
        uuid: ticketUuid,
        ticket_number: ticketNumber
      }
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get user tickets
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, department, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM tickets WHERE user_id = ?';
    const params = [req.user.id];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const tickets = await db.query(query, params);
    const countResult = await db.query('SELECT COUNT(*) as total FROM tickets WHERE user_id = ?', [req.user.id]);

    res.json({
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(countResult[0].total)
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to load tickets' });
  }
});

// Get ticket details
router.get('/:uuid', authenticate, async (req, res) => {
  try {
    const tickets = await db.query('SELECT * FROM tickets WHERE uuid = ? AND user_id = ?', [req.params.uuid, req.user.id]);

    if (!tickets.length) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const replies = await db.query(`
      SELECT tr.*, u.first_name, u.last_name, u.role, u.avatar
      FROM ticket_replies tr
      JOIN users u ON tr.user_id = u.id
      WHERE tr.ticket_id = ?
      ORDER BY tr.created_at ASC
    `, [tickets[0].id]);

    res.json({
      ticket: tickets[0],
      replies
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to load ticket' });
  }
});

// Reply to ticket
router.post('/:uuid/reply', authenticate, [
  body('message').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    
    const tickets = await db.query('SELECT * FROM tickets WHERE uuid = ? AND user_id = ?', [req.params.uuid, req.user.id]);

    if (!tickets.length) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (tickets[0].status === 'closed') {
      return res.status(400).json({ error: 'Cannot reply to closed ticket' });
    }

    // Add reply
    await db.query(`
      INSERT INTO ticket_replies (ticket_id, user_id, message, is_staff_reply)
      VALUES (?, ?, ?, FALSE)
    `, [tickets[0].id, req.user.id, message]);

    // Update ticket status
    await db.query(`
      UPDATE tickets SET status = 'customer-reply', updated_at = NOW()
      WHERE id = ?
    `, [tickets[0].id]);

    res.json({ message: 'Reply added successfully' });
  } catch (error) {
    console.error('Reply ticket error:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Close ticket
router.post('/:uuid/close', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE tickets SET status = 'closed', closed_at = NOW()
      WHERE uuid = ? AND user_id = ?
    `, [req.params.uuid, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ message: 'Ticket closed successfully' });
  } catch (error) {
    console.error('Close ticket error:', error);
    res.status(500).json({ error: 'Failed to close ticket' });
  }
});

module.exports = router;
