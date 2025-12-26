const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');
const { authenticate, requireRole } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// ==================== ADMIN ROUTES ====================

// Get all proposals (admin)
router.get('/admin/proposals', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, u.email as user_email, u.first_name, u.last_name,
             CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM proposals p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (p.title LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const proposals = await db.query(query, params);

    // Parse JSON items for each proposal
    const parsedProposals = proposals.map(p => ({
      ...p,
      items: typeof p.items === 'string' ? JSON.parse(p.items) : p.items
    }));

    res.json({ proposals: parsedProposals });
  } catch (error) {
    console.error('Get proposals error:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// Get single proposal (admin)
router.get('/admin/proposals/:uuid', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const proposals = await db.query(`
      SELECT p.*, u.email as user_email, u.first_name, u.last_name,
             CONCAT(u.first_name, ' ', u.last_name) as user_name,
             u.company as user_company
      FROM proposals p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.uuid = ?
    `, [req.params.uuid]);

    if (!proposals.length) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const proposal = proposals[0];
    proposal.items = typeof proposal.items === 'string' ? JSON.parse(proposal.items) : proposal.items;

    res.json({ proposal });
  } catch (error) {
    console.error('Get proposal error:', error);
    res.status(500).json({ error: 'Failed to fetch proposal' });
  }
});

// Create proposal (admin)
router.post('/admin/proposals', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const {
      title, description, user_id, items, discount, discount_type, tax,
      subtotal, discount_amount, tax_amount, total, notes, terms,
      valid_until, template, bank_method
    } = req.body;

    const uuid = uuidv4();
    const proposalNumber = `PROP-${Math.floor(100000 + Math.random() * 900000)}`;

    await db.query(`
      INSERT INTO proposals (
        uuid, proposal_number, user_id, title, description, items,
        discount, discount_type, tax, subtotal, discount_amount, tax_amount, total,
        notes, terms, valid_until, template, bank_method, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `, [
      uuid, proposalNumber, user_id, title, description, JSON.stringify(items),
      discount || 0, discount_type || 'percentage', tax || 0,
      subtotal, discount_amount, tax_amount, total,
      notes, terms, valid_until, template || 'modern', bank_method || 'bank_transfer'
    ]);

    res.status(201).json({
      message: 'Proposal created',
      proposal: { uuid, proposal_number: proposalNumber }
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

// Update proposal (admin)
router.put('/admin/proposals/:uuid', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const {
      title, description, user_id, items, discount, discount_type, tax,
      subtotal, discount_amount, tax_amount, total, notes, terms,
      valid_until, template, bank_method
    } = req.body;

    await db.query(`
      UPDATE proposals SET
        title = ?, description = ?, user_id = ?, items = ?,
        discount = ?, discount_type = ?, tax = ?,
        subtotal = ?, discount_amount = ?, tax_amount = ?, total = ?,
        notes = ?, terms = ?, valid_until = ?, template = ?, bank_method = ?,
        updated_at = NOW()
      WHERE uuid = ?
    `, [
      title, description, user_id, JSON.stringify(items),
      discount || 0, discount_type || 'percentage', tax || 0,
      subtotal, discount_amount, tax_amount, total,
      notes, terms, valid_until, template || 'modern', bank_method || 'bank_transfer',
      req.params.uuid
    ]);

    res.json({ message: 'Proposal updated' });
  } catch (error) {
    console.error('Update proposal error:', error);
    res.status(500).json({ error: 'Failed to update proposal' });
  }
});

// Delete proposal (admin)
router.delete('/admin/proposals/:uuid', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM proposals WHERE uuid = ?', [req.params.uuid]);
    res.json({ message: 'Proposal deleted' });
  } catch (error) {
    console.error('Delete proposal error:', error);
    res.status(500).json({ error: 'Failed to delete proposal' });
  }
});

// Send proposal (admin)
router.post('/admin/proposals/:uuid/send', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const proposals = await db.query(`
      SELECT p.*, u.email as user_email, u.first_name
      FROM proposals p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.uuid = ?
    `, [req.params.uuid]);

    if (!proposals.length) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const proposal = proposals[0];

    // Update status to sent
    await db.query(`
      UPDATE proposals SET status = 'sent', sent_at = NOW() WHERE uuid = ?
    `, [req.params.uuid]);

    // Send email with proposal link
    try {
      const siteUrl = process.env.APP_URL || 'https://magnetic-clouds.com';
      await emailService.send(proposal.user_email, 'proposal_sent', {
        user_name: proposal.first_name || 'Customer',
        proposal_title: proposal.title,
        proposal_total: `$${proposal.total?.toFixed(2)}`,
        proposal_link: `${siteUrl}/proposal/${proposal.uuid}`
      });
    } catch (emailErr) {
      console.error('Failed to send proposal email:', emailErr.message);
    }

    res.json({ message: 'Proposal sent successfully' });
  } catch (error) {
    console.error('Send proposal error:', error);
    res.status(500).json({ error: 'Failed to send proposal' });
  }
});

// ==================== PUBLIC ROUTES ====================

// Get proposal (public - for viewing)
router.get('/proposals/:uuid', async (req, res) => {
  try {
    const proposals = await db.query(`
      SELECT p.*, u.email as user_email, u.first_name, u.last_name,
             CONCAT(u.first_name, ' ', u.last_name) as user_name,
             u.company as user_company
      FROM proposals p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.uuid = ?
    `, [req.params.uuid]);

    if (!proposals.length) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const proposal = proposals[0];
    proposal.items = typeof proposal.items === 'string' ? JSON.parse(proposal.items) : proposal.items;

    // Mark as viewed if sent
    if (proposal.status === 'sent') {
      await db.query(`
        UPDATE proposals SET status = 'viewed', viewed_at = NOW() WHERE uuid = ?
      `, [req.params.uuid]);
      proposal.status = 'viewed';
    }

    res.json({ proposal });
  } catch (error) {
    console.error('Get proposal error:', error);
    res.status(500).json({ error: 'Failed to fetch proposal' });
  }
});

// Accept proposal (public)
router.post('/proposals/:uuid/accept', async (req, res) => {
  try {
    const proposals = await db.query(`
      SELECT p.*, u.id as user_id, u.email as user_email
      FROM proposals p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.uuid = ? AND p.status IN ('sent', 'viewed')
    `, [req.params.uuid]);

    if (!proposals.length) {
      return res.status(404).json({ error: 'Proposal not found or already processed' });
    }

    const proposal = proposals[0];
    const items = typeof proposal.items === 'string' ? JSON.parse(proposal.items) : proposal.items;

    // Create order from proposal
    const orderUuid = uuidv4();
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    await db.query(`
      INSERT INTO orders (uuid, order_number, user_id, items, subtotal, discount, tax, total, status, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [
      orderUuid, orderNumber, proposal.user_id, JSON.stringify(items),
      proposal.subtotal, proposal.discount_amount, proposal.tax_amount, proposal.total,
      proposal.bank_method
    ]);

    // Create services for each item
    for (const item of items) {
      const serviceUuid = uuidv4();
      await db.query(`
        INSERT INTO services (uuid, user_id, order_item_id, product_id, service_type, name, status, billing_cycle, next_due_date)
        VALUES (?, ?, NULL, ?, 'hosting', ?, 'pending', 'monthly', DATE_ADD(NOW(), INTERVAL 1 MONTH))
      `, [serviceUuid, proposal.user_id, item.product_id || null, item.name]);
    }

    // Update proposal status
    await db.query(`
      UPDATE proposals SET status = 'accepted', accepted_at = NOW() WHERE uuid = ?
    `, [req.params.uuid]);

    // Send confirmation email
    try {
      const siteUrl = process.env.APP_URL || 'https://magnetic-clouds.com';
      await emailService.send(proposal.user_email, 'order_placed', {
        user_name: proposal.first_name || 'Customer',
        order_id: orderNumber,
        order_date: new Date().toLocaleDateString(),
        order_total: `$${proposal.total?.toFixed(2)}`,
        payment_status: 'Pending'
      });
    } catch (emailErr) {
      console.error('Failed to send order confirmation email:', emailErr.message);
    }

    res.json({
      message: 'Proposal accepted! You have been enrolled in the services.',
      order_uuid: orderUuid
    });
  } catch (error) {
    console.error('Accept proposal error:', error);
    res.status(500).json({ error: 'Failed to accept proposal' });
  }
});

// Reject proposal (public)
router.post('/proposals/:uuid/reject', async (req, res) => {
  try {
    const { reason } = req.body;

    const result = await db.query(`
      UPDATE proposals SET status = 'rejected', rejected_at = NOW(), reject_reason = ?
      WHERE uuid = ? AND status IN ('sent', 'viewed')
    `, [reason || null, req.params.uuid]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proposal not found or already processed' });
    }

    res.json({ message: 'Proposal rejected' });
  } catch (error) {
    console.error('Reject proposal error:', error);
    res.status(500).json({ error: 'Failed to reject proposal' });
  }
});

module.exports = router;
