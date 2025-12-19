const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const slugify = require('slugify');
const db = require('../database/connection');
const { authenticate, requireRole, requireAnyPermission } = require('../middleware/auth');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireRole('admin'));

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [users, orders, revenue, tickets, services] = await Promise.all([
      db.query('SELECT COUNT(*) as total, SUM(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new FROM users WHERE role = "user"'),
      db.query('SELECT COUNT(*) as total, SUM(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new FROM orders'),
      db.query('SELECT COALESCE(SUM(total), 0) as total, COALESCE(SUM(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN total ELSE 0 END), 0) as monthly FROM orders WHERE payment_status = "paid"'),
      db.query('SELECT COUNT(*) as total, SUM(CASE WHEN status IN ("open", "customer-reply") THEN 1 ELSE 0 END) as open FROM tickets'),
      db.query('SELECT COUNT(*) as total, SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active FROM services')
    ]);

    // Recent orders
    const recentOrders = await db.query(`
      SELECT o.*, u.email, u.first_name, u.last_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC LIMIT 10
    `);

    // Recent tickets
    const recentTickets = await db.query(`
      SELECT t.*, u.email, u.first_name, u.last_name
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC LIMIT 10
    `);

    // Revenue chart data (last 12 months)
    const revenueChart = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total) as revenue
      FROM orders WHERE payment_status = 'paid'
      AND created_at > DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);

    res.json({
      stats: {
        users: { total: Number(users[0].total), new: Number(users[0].new) },
        orders: { total: Number(orders[0].total), new: Number(orders[0].new) },
        revenue: { total: parseFloat(revenue[0].total), monthly: parseFloat(revenue[0].monthly) },
        tickets: { total: Number(tickets[0].total), open: Number(tickets[0].open) },
        services: { total: Number(services[0].total), active: Number(services[0].active) }
      },
      recentOrders,
      recentTickets,
      revenueChart
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Users management - requires users.view permission
router.get('/users', requireAnyPermission(['users.view', 'users.edit', 'users.delete']), async (req, res) => {
  try {
    const { search, status, role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, uuid, email, first_name, last_name, phone, company, role, status, created_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const users = await db.query(query, params);
    const countResult = await db.query('SELECT COUNT(*) as total FROM users');

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(countResult[0].total)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

router.get('/users/:uuid', requireAnyPermission(['users.view', 'users.edit']), async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users WHERE uuid = ?', [req.params.uuid]);
    if (!users.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    delete user.password;

    const [orders, services, tickets, invoices, orderStats, serviceStats, ticketStats] = await Promise.all([
      db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [user.id]),
      db.query('SELECT * FROM services WHERE user_id = ? ORDER BY created_at DESC', [user.id]),
      db.query('SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [user.id]),
      db.query('SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [user.id]),
      db.query('SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as spent FROM orders WHERE user_id = ?', [user.id]),
      db.query('SELECT COUNT(*) as total FROM services WHERE user_id = ? AND status = ?', [user.id, 'active']),
      db.query('SELECT COUNT(*) as total FROM tickets WHERE user_id = ?', [user.id])
    ]);

    const stats = {
      totalOrders: Number(orderStats?.[0]?.total || 0),
      activeServices: Number(serviceStats?.[0]?.total || 0),
      supportTickets: Number(ticketStats?.[0]?.total || 0),
      totalSpent: Number(orderStats?.[0]?.spent || 0)
    };

    res.json({ user, orders, services, tickets, invoices, stats });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

router.put('/users/:uuid', requireAnyPermission(['users.edit']), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, company, address, role, status } = req.body;

    await db.query(`
      UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, company = ?, address = ?, role = ?, status = ?
      WHERE uuid = ?
    `, [first_name, last_name, email, phone, company, address, role, status, req.params.uuid]);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get user resource usage (aggregated from all services)
router.get('/users/:uuid/resources', async (req, res) => {
  try {
    // Get user's services
    const user = await db.query('SELECT id FROM users WHERE uuid = ?', [req.params.uuid]);
    if (!user?.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const services = await db.query(
      'SELECT * FROM services WHERE user_id = ? AND status = ?',
      [user[0].id, 'active']
    );

    if (!services?.length) {
      return res.json({ resources: null, message: 'No active services' });
    }

    // Get Plesk settings
    const pleskSettings = await db.query(`
      SELECT setting_key, setting_value FROM settings 
      WHERE setting_key IN ('plesk_enabled', 'plesk_hostname', 'plesk_port', 'plesk_api_key', 'plesk_username', 'plesk_password', 'plesk_auth_method')
    `);

    const config = {};
    pleskSettings?.forEach(row => {
      config[row.setting_key.replace('plesk_', '')] = row.setting_value;
    });

    // Aggregate resources from service names (parse specs)
    let totalRam = 0, totalStorage = 0, totalBandwidth = 0;

    services.forEach(service => {
      const name = service.name || '';
      const ramMatch = name.match(/(\d+)\s*GB\s*RAM/i);
      if (ramMatch) totalRam += parseInt(ramMatch[1]);
      const storageMatch = name.match(/(\d+)\s*GB\s*(SSD|NVMe|HDD)/i);
      if (storageMatch) totalStorage += parseInt(storageMatch[1]);
    });

    // Simulated usage stats (would come from Plesk in production)
    const resources = {
      cpu_usage: Math.floor(Math.random() * 30 + 10),
      ram_used: Math.floor(totalRam * (Math.random() * 0.3 + 0.1)),
      ram_total: totalRam || 128,
      disk_used: Math.floor(totalStorage * (Math.random() * 0.3 + 0.1)),
      disk_total: totalStorage || 500,
      bandwidth_used: Math.floor(Math.random() * 200 + 50),
      bandwidth_total: services.length * 1000
    };

    res.json({ resources, serviceCount: services.length });
  } catch (error) {
    console.error('Get user resources error:', error);
    res.json({ resources: null, error: error.message });
  }
});

// Login as user (admin impersonation)
router.post('/users/:uuid/login-as', async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users WHERE uuid = ?', [req.params.uuid]);
    if (!users.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot impersonate admin users' });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, uuid: user.uuid, email: user.email, role: user.role, impersonated: true },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    delete user.password;
    res.json({ user, token });
  } catch (error) {
    console.error('Login as user error:', error);
    res.status(500).json({ error: 'Failed to login as user' });
  }
});

// Invoices management - requires invoices.view permission
router.get('/invoices', requireAnyPermission(['invoices.view', 'invoices.edit', 'invoices.delete']), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT i.*, u.email, u.first_name, u.last_name, p.title as proposal_title
      FROM invoices i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN proposals p ON i.proposal_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const invoices = await db.query(query, params);
    const countResult = await db.query('SELECT COUNT(*) as total FROM invoices');

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

router.get('/invoices/:uuid', async (req, res) => {
  try {
    const invoices = await db.query(`
      SELECT i.*, u.email, u.first_name, u.last_name, u.phone, u.company, u.address,
             p.title as proposal_title, p.items as proposal_items
      FROM invoices i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN proposals p ON i.proposal_id = p.id
      WHERE i.uuid = ?
    `, [req.params.uuid]);

    if (!invoices.length) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoices[0];
    if (invoice.proposal_items) {
      try {
        invoice.items = JSON.parse(invoice.proposal_items);
      } catch (e) {
        invoice.items = [];
      }
    }

    res.json({ invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to load invoice' });
  }
});

router.put('/invoices/:uuid/status', requireAnyPermission(['invoices.edit']), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['draft', 'unpaid', 'paid', 'cancelled', 'refunded'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const paidDate = status === 'paid' ? 'NOW()' : 'NULL';
    await db.query(`
      UPDATE invoices SET status = ?, paid_date = ${status === 'paid' ? 'NOW()' : 'paid_date'}
      WHERE uuid = ?
    `, [status, req.params.uuid]);

    res.json({ message: 'Invoice status updated' });
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
});

// Products management
router.get('/products', async (req, res) => {
  try {
    const products = await db.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      ORDER BY p.category_id, p.sort_order
    `);

    res.json({
      products: products.map(p => {
        let features = [];
        let specifications = {};
        try { features = p.features ? JSON.parse(p.features) : []; } catch (e) { features = []; }
        try { specifications = p.specifications ? JSON.parse(p.specifications) : {}; } catch (e) { specifications = {}; }
        return { ...p, features, specifications };
      })
    });
  } catch (error) {
    console.error('Get products error:', error.message);
    res.status(500).json({ error: 'Failed to load products', details: error.message });
  }
});

router.post('/products', [
  body('name').trim().notEmpty(),
  body('category_id').isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, category_id, description, features, specifications, price_monthly, price_annually, setup_fee, is_featured, is_active } = req.body;
    const uuid = uuidv4();
    const slug = slugify(name, { lower: true, strict: true });

    await db.query(`
      INSERT INTO products (uuid, category_id, name, slug, description, features, specifications, price_monthly, price_annually, setup_fee, is_featured, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [uuid, category_id, name, slug, description, JSON.stringify(features || []), JSON.stringify(specifications || {}), price_monthly || 0, price_annually || 0, setup_fee || 0, is_featured || false, is_active !== false]);

    res.status(201).json({ message: 'Product created successfully', uuid });
  } catch (error) {
    console.error('Create product error:', error.message);
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

router.put('/products/:uuid', async (req, res) => {
  try {
    const { name, category_id, description, features, specifications, price_monthly, price_annually, setup_fee, is_featured, is_active, sort_order } = req.body;

    await db.query(`
      UPDATE products SET name = ?, category_id = ?, description = ?, features = ?, specifications = ?, price_monthly = ?, price_annually = ?, setup_fee = ?, is_featured = ?, is_active = ?, sort_order = ?
      WHERE uuid = ?
    `, [name, category_id, description, JSON.stringify(features || []), JSON.stringify(specifications || {}), price_monthly || 0, price_annually || 0, setup_fee || 0, is_featured, is_active, sort_order || 0, req.params.uuid]);

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error.message);
    res.status(500).json({ error: 'Failed to update product', details: error.message });
  }
});

router.delete('/products/:uuid', async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE uuid = ?', [req.params.uuid]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Categories management
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM product_categories ORDER BY sort_order');
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, description, icon, is_active } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    await db.query(`
      INSERT INTO product_categories (name, slug, description, icon, is_active)
      VALUES (?, ?, ?, ?, ?)
    `, [name, slug, description, icon, is_active !== false]);

    res.status(201).json({ message: 'Category created successfully' });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Orders management - requires orders.view permission
router.get('/orders', requireAnyPermission(['orders.view', 'orders.edit', 'orders.delete']), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.*, u.email, u.first_name, u.last_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const orders = await db.query(query, params);
    const countResult = await db.query('SELECT COUNT(*) as total FROM orders');

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(countResult[0].total)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

router.put('/orders/:uuid/status', requireAnyPermission(['orders.edit']), async (req, res) => {
  try {
    const { status, payment_status } = req.body;

    // Get order and user info before update
    const orders = await db.query(`
      SELECT o.*, u.email, u.first_name, u.last_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.uuid = ?
    `, [req.params.uuid]);

    if (!orders.length) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];
    const oldPaymentStatus = order.payment_status;
    const oldStatus = order.status;

    await db.query(`
      UPDATE orders SET status = COALESCE(?, status), payment_status = COALESCE(?, payment_status)
      WHERE uuid = ?
    `, [status, payment_status, req.params.uuid]);

    // Send email notifications based on status change
    const user = { email: order.email, first_name: order.first_name, last_name: order.last_name, id: order.user_id };
    const orderData = { uuid: order.uuid, id: order.id, total: order.total };

    // Payment confirmed
    if (payment_status === 'paid' && oldPaymentStatus !== 'paid') {
      emailService.sendOrderConfirmed(orderData, user).catch(err =>
        console.error('Failed to send order confirmed email:', err)
      );
    }

    // Order completed/active - CREATE SERVICES for the user
    const newStatus = status || order.status;
    const newPaymentStatus = payment_status || order.payment_status;

    if (newStatus === 'active' && newPaymentStatus === 'paid') {
      // Check if services already created for this order
      const existingServices = await db.query('SELECT id FROM services WHERE order_item_id IN (SELECT id FROM order_items WHERE order_id = ?)', [order.id]);
      const existingFiltered = Array.isArray(existingServices) ? existingServices.filter(s => s.id) : [];

      if (existingFiltered.length === 0) {
        // Get order items and create services
        const orderItems = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        const itemsFiltered = Array.isArray(orderItems) ? orderItems.filter(i => i.id) : [];

        for (const item of itemsFiltered) {
          const serviceUuid = require('uuid').v4();
          // Map product_type to valid service_type enum values
          const validServiceTypes = ['hosting', 'domain', 'ssl', 'email', 'backup', 'vps', 'dedicated'];
          let serviceType = (item.product_type || 'hosting').toLowerCase();
          if (!validServiceTypes.includes(serviceType)) {
            serviceType = 'hosting'; // Default to hosting for unknown types
          }

          // Calculate next due date based on billing cycle
          const now = new Date();
          let nextDueDate = new Date(now);
          if (item.billing_cycle === 'monthly') {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          } else if (item.billing_cycle === 'quarterly') {
            nextDueDate.setMonth(nextDueDate.getMonth() + 3);
          } else if (item.billing_cycle === 'semiannual') {
            nextDueDate.setMonth(nextDueDate.getMonth() + 6);
          } else if (item.billing_cycle === 'annual' || item.billing_cycle === 'yearly') {
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          } else if (item.billing_cycle === 'biennial') {
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 2);
          } else if (item.billing_cycle === 'triennial') {
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 3);
          } else {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1); // Default monthly
          }

          await db.query(`
            INSERT INTO services (uuid, user_id, order_item_id, product_id, service_type, name, domain_name, status, billing_cycle, amount, next_due_date, registration_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
          `, [
            serviceUuid,
            order.user_id,
            item.id,
            item.product_id,
            serviceType,
            item.product_name,
            item.domain_name,
            item.billing_cycle,
            item.total_price,
            nextDueDate,
            now
          ]);
        }
        console.log(`Created ${itemsFiltered.length} services for order ${order.order_number}`);
      }

      // Send completion email
      if (oldStatus !== 'active') {
        emailService.sendOrderCompleted(orderData, user).catch(err =>
          console.error('Failed to send order completed email:', err)
        );
      }
    }

    // Order cancelled
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      emailService.sendOrderCancelled(orderData, user).catch(err =>
        console.error('Failed to send order cancelled email:', err)
      );
    }

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Sync services for all active/paid orders that don't have services
router.post('/orders/sync-services', async (req, res) => {
  try {
    // Get all active + paid orders
    const orders = await db.query(`
      SELECT o.*, u.email, u.first_name, u.last_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.status = 'active' AND o.payment_status = 'paid'
    `);
    const ordersFiltered = Array.isArray(orders) ? orders.filter(o => o.id) : [];

    let servicesCreated = 0;

    for (const order of ordersFiltered) {
      // Check if services already exist for this order
      const existingServices = await db.query('SELECT id FROM services WHERE order_item_id IN (SELECT id FROM order_items WHERE order_id = ?)', [order.id]);
      const existingFiltered = Array.isArray(existingServices) ? existingServices.filter(s => s.id) : [];

      if (existingFiltered.length === 0) {
        // Get order items
        const orderItems = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        const itemsFiltered = Array.isArray(orderItems) ? orderItems.filter(i => i.id) : [];

        for (const item of itemsFiltered) {
          const serviceUuid = require('uuid').v4();
          const validServiceTypes = ['hosting', 'domain', 'ssl', 'email', 'backup', 'vps', 'dedicated'];
          let serviceType = (item.product_type || 'hosting').toLowerCase();
          if (!validServiceTypes.includes(serviceType)) {
            serviceType = 'hosting';
          }

          const now = new Date();
          let nextDueDate = new Date(now);
          if (item.billing_cycle === 'monthly') {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          } else if (item.billing_cycle === 'quarterly') {
            nextDueDate.setMonth(nextDueDate.getMonth() + 3);
          } else if (item.billing_cycle === 'annual' || item.billing_cycle === 'yearly') {
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          } else {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          }

          await db.query(`
            INSERT INTO services (uuid, user_id, order_item_id, product_id, service_type, name, domain_name, status, billing_cycle, amount, next_due_date, registration_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
          `, [
            serviceUuid,
            order.user_id,
            item.id,
            item.product_id,
            serviceType,
            item.product_name,
            item.domain_name,
            item.billing_cycle,
            item.total_price,
            nextDueDate,
            now
          ]);
          servicesCreated++;
        }
      }
    }

    res.json({ message: `Synced ${servicesCreated} services for ${ordersFiltered.length} orders` });
  } catch (error) {
    console.error('Sync services error:', error);
    res.status(500).json({ error: 'Failed to sync services: ' + error.message });
  }
});

// Tickets management - requires tickets.view permission
router.get('/tickets', requireAnyPermission(['tickets.view', 'tickets.reply', 'tickets.close']), async (req, res) => {
  try {
    const { status, department, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, u.email, u.first_name, u.last_name
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (department) {
      query += ' AND t.department = ?';
      params.push(department);
    }

    query += ' ORDER BY t.updated_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const tickets = await db.query(query, params);
    const countResult = await db.query('SELECT COUNT(*) as total FROM tickets');

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

router.post('/tickets/:uuid/reply', [
  body('message').trim().notEmpty()
], async (req, res) => {
  try {
    const { message } = req.body;

    const tickets = await db.query(`
      SELECT t.*, u.email, u.first_name, u.last_name
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      WHERE t.uuid = ?
    `, [req.params.uuid]);
    if (!tickets.length) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = tickets[0];

    await db.query(`
      INSERT INTO ticket_replies (ticket_id, user_id, message, is_staff_reply)
      VALUES (?, ?, ?, TRUE)
    `, [ticket.id, req.user.id, message]);

    await db.query(`
      UPDATE tickets SET status = 'answered', updated_at = NOW()
      WHERE id = ?
    `, [ticket.id]);

    // Send email notification to customer
    const user = { email: ticket.email, first_name: ticket.first_name, last_name: ticket.last_name };
    const ticketData = { id: ticket.id, subject: ticket.subject };
    const reply = { message };

    emailService.sendTicketReplied(ticketData, user, reply, 'Support Team').catch(err =>
      console.error('Failed to send ticket reply email:', err)
    );

    res.json({ message: 'Reply added successfully' });
  } catch (error) {
    console.error('Reply ticket error:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Domain TLDs management
router.get('/tlds', async (req, res) => {
  try {
    const tlds = await db.query('SELECT * FROM domain_tlds ORDER BY tld');
    res.json({ tlds });
  } catch (error) {
    console.error('Get TLDs error:', error);
    res.status(500).json({ error: 'Failed to load TLDs' });
  }
});

router.post('/tlds', async (req, res) => {
  try {
    const { tld, price_register, price_renew, price_transfer, is_popular, is_active } = req.body;

    await db.query(`
      INSERT INTO domain_tlds (tld, price_register, price_renew, price_transfer, is_popular, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [tld, price_register, price_renew, price_transfer, is_popular || false, is_active !== false]);

    res.status(201).json({ message: 'TLD created successfully' });
  } catch (error) {
    console.error('Create TLD error:', error);
    res.status(500).json({ error: 'Failed to create TLD' });
  }
});

router.put('/tlds/:id', async (req, res) => {
  try {
    const { price_register, price_renew, price_transfer, is_popular, is_active, promo_price } = req.body;

    await db.query(`
      UPDATE domain_tlds SET price_register = ?, price_renew = ?, price_transfer = ?, is_popular = ?, is_active = ?, promo_price = ?
      WHERE id = ?
    `, [price_register, price_renew, price_transfer, is_popular, is_active, promo_price, req.params.id]);

    res.json({ message: 'TLD updated successfully' });
  } catch (error) {
    console.error('Update TLD error:', error);
    res.status(500).json({ error: 'Failed to update TLD' });
  }
});

// Coupons management
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ error: 'Failed to load coupons' });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const { code, type, value, min_order_amount, max_discount, usage_limit, expires_at, is_active } = req.body;

    await db.query(`
      INSERT INTO coupons (code, type, value, min_order_amount, max_discount, usage_limit, expires_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [code.toUpperCase(), type, value, min_order_amount, max_discount, usage_limit, expires_at, is_active !== false]);

    res.status(201).json({ message: 'Coupon created successfully' });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// Datacenters management
router.get('/datacenters', async (req, res) => {
  try {
    const datacenters = await db.query('SELECT * FROM datacenters ORDER BY name');
    res.json({ datacenters });
  } catch (error) {
    console.error('Get datacenters error:', error);
    res.status(500).json({ error: 'Failed to load datacenters' });
  }
});

router.post('/datacenters', async (req, res) => {
  try {
    const { name, location, country, country_code, latitude, longitude, description, features, is_active } = req.body;

    await db.query(`
      INSERT INTO datacenters (name, location, country, country_code, latitude, longitude, description, features, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, location, country, country_code, latitude, longitude, description, JSON.stringify(features || []), is_active !== false]);

    res.status(201).json({ message: 'Datacenter created successfully' });
  } catch (error) {
    console.error('Create datacenter error:', error);
    res.status(500).json({ error: 'Failed to create datacenter' });
  }
});

// Pages management
router.get('/pages', async (req, res) => {
  try {
    const pages = await db.query('SELECT * FROM pages ORDER BY title');
    res.json({ pages });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ error: 'Failed to load pages' });
  }
});

router.post('/pages', async (req, res) => {
  try {
    const { title, slug, content, meta_title, meta_description, is_published } = req.body;

    await db.query(`
      INSERT INTO pages (slug, title, content, meta_title, meta_description, is_published)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [slug || slugify(title, { lower: true, strict: true }), title, content, meta_title, meta_description, is_published !== false]);

    res.status(201).json({ message: 'Page created successfully' });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

router.put('/pages/:id', async (req, res) => {
  try {
    const { title, content, meta_title, meta_description, is_published } = req.body;

    await db.query(`
      UPDATE pages SET title = ?, content = ?, meta_title = ?, meta_description = ?, is_published = ?
      WHERE id = ?
    `, [title, content, meta_title, meta_description, is_published, req.params.id]);

    res.json({ message: 'Page updated successfully' });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

// Activity logs
router.get('/activity', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const logs = await db.query(`
      SELECT al.*, u.email, u.first_name, u.last_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    res.json({ logs });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to load activity' });
  }
});

// Email logs
router.get('/email-logs', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Check if table exists
    const tableCheck = await db.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'email_logs'
    `);

    if (!tableCheck[0]?.count) {
      return res.json({
        logs: [],
        total: 0,
        stats: { total: 0, sent: 0, failed: 0, pending: 0 }
      });
    }

    let whereClause = '';
    const params = [];

    if (search) {
      whereClause = "WHERE (recipient_email LIKE ? OR subject LIKE ? OR recipient_name LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClause = whereClause ? `${whereClause} AND status = ?` : 'WHERE status = ?';
      params.push(status);
    }

    // Get stats
    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM email_logs
    `);

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM email_logs ${whereClause}`,
      params
    );

    // Get logs
    const logs = await db.query(`
      SELECT el.*, u.email as user_email, u.first_name, u.last_name
      FROM email_logs el
      LEFT JOIN users u ON el.user_id = u.id
      ${whereClause}
      ORDER BY el.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    res.json({
      logs,
      total: Number(countResult[0]?.count || 0),
      stats: {
        total: Number(statsResult[0]?.total || 0),
        sent: Number(statsResult[0]?.sent || 0),
        failed: Number(statsResult[0]?.failed || 0),
        pending: Number(statsResult[0]?.pending || 0)
      }
    });
  } catch (error) {
    console.error('Get email logs error:', error);
    res.json({
      logs: [],
      total: 0,
      stats: { total: 0, sent: 0, failed: 0, pending: 0 }
    });
  }
});

// Get single email log
router.get('/email-logs/:uuid', async (req, res) => {
  try {
    const logs = await db.query(
      'SELECT * FROM email_logs WHERE uuid = ?',
      [req.params.uuid]
    );

    if (!logs.length) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json({ log: logs[0] });
  } catch (error) {
    console.error('Get email log error:', error);
    res.status(500).json({ error: 'Failed to load email' });
  }
});

// ==================== SERVICES ====================

// Get all services
router.get('/services', async (req, res) => {
  try {
    const { status, user_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, u.first_name, u.last_name, u.email as user_email
      FROM services s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }
    if (user_id) {
      query += ' AND s.user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const services = await db.query(query, params);
    res.json({ services: services || [] });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to load services' });
  }
});

// Get single service with user info
router.get('/services/:uuid', async (req, res) => {
  try {
    const services = await db.query(`
      SELECT s.*, u.uuid as user_uuid, u.first_name, u.last_name, u.email as user_email
      FROM services s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.uuid = ?
    `, [req.params.uuid]);

    if (!services?.length) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const service = services[0];
    res.json({
      service,
      user: {
        uuid: service.user_uuid,
        first_name: service.first_name,
        last_name: service.last_name,
        email: service.user_email
      }
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to load service' });
  }
});

// Update service
router.put('/services/:uuid', async (req, res) => {
  try {
    const { status, next_due_date, hostname, ip_address, username, password } = req.body;

    await db.query(`
      UPDATE services SET
        status = COALESCE(?, status),
        next_due_date = COALESCE(?, next_due_date),
        hostname = COALESCE(?, hostname),
        ip_address = COALESCE(?, ip_address),
        username = COALESCE(?, username),
        password = COALESCE(?, password),
        updated_at = NOW()
      WHERE uuid = ?
    `, [status, next_due_date || null, hostname, ip_address, username, password, req.params.uuid]);

    res.json({ success: true });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Get Plesk stats for service
router.get('/services/:uuid/plesk-stats', async (req, res) => {
  try {
    // Get service details
    const services = await db.query('SELECT * FROM services WHERE uuid = ?', [req.params.uuid]);
    if (!services?.length) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const service = services[0];

    // Get Plesk settings
    const pleskSettings = await db.query(`
      SELECT setting_key, setting_value FROM settings 
      WHERE setting_key IN ('plesk_enabled', 'plesk_hostname', 'plesk_port', 'plesk_api_key', 'plesk_username', 'plesk_password', 'plesk_auth_method')
    `);

    const config = {};
    pleskSettings?.forEach(row => {
      config[row.setting_key.replace('plesk_', '')] = row.setting_value;
    });

    if (config.enabled !== 'true' || !config.hostname) {
      return res.json({ stats: null, message: 'Plesk not configured' });
    }

    // Try to get real stats from Plesk API
    try {
      const https = require('https');
      const fetch = require('node-fetch');

      const agent = new https.Agent({ rejectUnauthorized: false });
      const pleskUrl = `https://${config.hostname}:${config.port || 8443}`;

      // Set up auth headers
      let headers = { 'Content-Type': 'application/json' };
      if (config.auth_method === 'api_key' && config.api_key) {
        headers['X-API-Key'] = config.api_key;
      } else {
        const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');
        headers['Authorization'] = `Basic ${auth}`;
      }

      // Get server stats
      const statsResponse = await fetch(`${pleskUrl}/api/v2/server/statistics`, {
        method: 'GET',
        headers,
        agent,
        timeout: 10000
      });

      if (statsResponse.ok) {
        const data = await statsResponse.json();

        return res.json({
          stats: {
            cpu_usage: data.cpu?.usage || Math.floor(Math.random() * 30 + 10),
            ram_used: data.memory?.used ? Math.round(data.memory.used / 1024 / 1024 / 1024) : Math.floor(Math.random() * 20 + 5),
            ram_total: data.memory?.total ? Math.round(data.memory.total / 1024 / 1024 / 1024) : 128,
            disk_used: data.disk?.used ? Math.round(data.disk.used / 1024 / 1024 / 1024) : Math.floor(Math.random() * 500 + 100),
            disk_total: data.disk?.total ? Math.round(data.disk.total / 1024 / 1024 / 1024) : 2000,
            bandwidth_used: data.traffic?.used ? Math.round(data.traffic.used / 1024 / 1024 / 1024) : Math.floor(Math.random() * 200 + 50),
            bandwidth_total: 1000
          }
        });
      }
    } catch (pleskError) {
      console.log('Plesk API error, using simulated stats:', pleskError.message);
    }

    // Return simulated stats if Plesk API fails
    res.json({
      stats: {
        cpu_usage: Math.floor(Math.random() * 30 + 10),
        ram_used: Math.floor(Math.random() * 20 + 5),
        ram_total: 128,
        disk_used: Math.floor(Math.random() * 500 + 100),
        disk_total: 2000,
        bandwidth_used: Math.floor(Math.random() * 200 + 50),
        bandwidth_total: 1000
      },
      simulated: true
    });
  } catch (error) {
    console.error('Get Plesk stats error:', error);
    res.json({ stats: null, error: error.message });
  }
});

// ==================== NOTIFICATIONS ====================

// Get admin notifications
router.get('/notifications', async (req, res) => {
  try {
    const { limit = 50, unread_only = false } = req.query;
    const notifications = await notificationService.getAdminNotifications(
      parseInt(limit),
      unread_only === 'true'
    );
    const unreadCount = await notificationService.getAdminUnreadCount();

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.json({ notifications: [], unreadCount: 0 });
  }
});

// Get unread count only
router.get('/notifications/count', async (req, res) => {
  try {
    const count = await notificationService.getAdminUnreadCount();
    res.json({ count });
  } catch (error) {
    res.json({ count: 0 });
  }
});

// Mark notification as read
router.put('/notifications/:uuid/read', async (req, res) => {
  try {
    await notificationService.markAdminNotificationRead(req.params.uuid);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', async (req, res) => {
  try {
    await notificationService.markAllAdminRead();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

module.exports = router;
