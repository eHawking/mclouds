const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../database/connection');
const { authenticate } = require('../middleware/auth');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Generate order number
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MC-${timestamp}-${random}`;
}

// Get cart (from session/localStorage - handled client-side)
// This endpoint validates cart items and returns pricing
router.post('/validate-cart', async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      if (item.type === 'product') {
        const products = await db.query('SELECT * FROM products WHERE uuid = ? AND is_active = TRUE', [item.product_uuid]);
        if (products.length) {
          const product = products[0];
          const price = item.billing_cycle === 'monthly' ? product.price_monthly :
                       item.billing_cycle === 'quarterly' ? product.price_quarterly :
                       item.billing_cycle === 'semiannual' ? product.price_semiannual :
                       item.billing_cycle === 'annual' ? product.price_annual :
                       item.billing_cycle === 'biennial' ? product.price_biennial :
                       product.price_triennial;
          
          validatedItems.push({
            ...item,
            product_name: product.name,
            unit_price: parseFloat(price || product.price_monthly),
            total_price: parseFloat(price || product.price_monthly) * (item.quantity || 1)
          });
          subtotal += parseFloat(price || product.price_monthly) * (item.quantity || 1);
        }
      } else if (item.type === 'domain') {
        const tlds = await db.query('SELECT * FROM domain_tlds WHERE tld = ? AND is_active = TRUE', [item.tld]);
        if (tlds.length) {
          const tld = tlds[0];
          const price = item.action === 'register' ? tld.price_register :
                       item.action === 'transfer' ? tld.price_transfer :
                       tld.price_renew;
          
          validatedItems.push({
            ...item,
            product_name: `Domain ${item.action}: ${item.domain_name}`,
            unit_price: parseFloat(price) * (item.years || 1),
            total_price: parseFloat(price) * (item.years || 1)
          });
          subtotal += parseFloat(price) * (item.years || 1);
        }
      }
    }

    res.json({
      items: validatedItems,
      subtotal,
      tax: 0,
      total: subtotal
    });
  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({ error: 'Failed to validate cart' });
  }
});

// Apply coupon
router.post('/apply-coupon', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    
    const coupons = await db.query(`
      SELECT * FROM coupons WHERE code = ? AND is_active = TRUE
      AND (starts_at IS NULL OR starts_at <= NOW())
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (usage_limit IS NULL OR used_count < usage_limit)
    `, [code.toUpperCase()]);

    if (!coupons.length) {
      return res.status(400).json({ error: 'Invalid or expired coupon code' });
    }

    const coupon = coupons[0];

    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      return res.status(400).json({ error: `Minimum order amount is $${coupon.min_order_amount}` });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.max_discount) {
        discount = Math.min(discount, coupon.max_discount);
      }
    } else {
      discount = coupon.value;
    }

    res.json({
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value
      },
      discount: Math.round(discount * 100) / 100
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ error: 'Failed to apply coupon' });
  }
});

// Create order
router.post('/', authenticate, [
  body('items').isArray({ min: 1 }),
  body('payment_method').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, coupon_code, payment_method, payment_proof, billing_address, notes } = req.body;

    // Validate and calculate totals
    let subtotal = 0;
    const orderItems = [];

    console.log('Processing order items:', JSON.stringify(items));

    for (const item of items) {
      // Handle product items (type === 'product' or has product_uuid)
      if (item.type === 'product' || item.product_uuid) {
        const products = await db.query('SELECT * FROM products WHERE uuid = ? AND is_active = TRUE', [item.product_uuid]);
        const productsFiltered = Array.isArray(products) ? products.filter(p => p.id) : [];
        
        if (productsFiltered.length) {
          const product = productsFiltered[0];
          const price = item.billing_cycle === 'monthly' ? product.price_monthly :
                       item.billing_cycle === 'quarterly' ? product.price_quarterly :
                       item.billing_cycle === 'semiannual' ? product.price_semiannual :
                       item.billing_cycle === 'annual' ? product.price_annual :
                       item.billing_cycle === 'biennial' ? product.price_biennial :
                       item.billing_cycle === 'triennial' ? product.price_triennial :
                       product.price_monthly;
          
          const unitPrice = parseFloat(price) || 0;
          const quantity = item.quantity || 1;
          
          orderItems.push({
            product_id: product.id,
            product_name: product.name,
            product_type: item.product_type || product.category || 'hosting',
            domain_name: item.domain_name,
            billing_cycle: item.billing_cycle || 'monthly',
            quantity: quantity,
            unit_price: unitPrice,
            total_price: unitPrice * quantity
          });
          subtotal += unitPrice * quantity;
          console.log(`Added product: ${product.name}, price: ${unitPrice}, subtotal: ${subtotal}`);
        } else {
          console.log(`Product not found: ${item.product_uuid}`);
          // Still add item with price from cart if product not found
          if (item.price) {
            const unitPrice = parseFloat(item.price) || 0;
            orderItems.push({
              product_id: null,
              product_name: item.name || item.product_type || 'Service',
              product_type: item.product_type || 'hosting',
              domain_name: item.domain_name,
              billing_cycle: item.billing_cycle || 'monthly',
              quantity: item.quantity || 1,
              unit_price: unitPrice,
              total_price: unitPrice * (item.quantity || 1)
            });
            subtotal += unitPrice * (item.quantity || 1);
          }
        }
      } else if (item.type === 'domain') {
        const tlds = await db.query('SELECT * FROM domain_tlds WHERE tld = ? AND is_active = TRUE', [item.tld]);
        if (tlds.length) {
          const price = item.action === 'register' ? tlds[0].price_register :
                       item.action === 'transfer' ? tlds[0].price_transfer :
                       tlds[0].price_renew;
          
          orderItems.push({
            product_id: null,
            product_name: `Domain ${item.action}: ${item.domain_name}`,
            product_type: 'domain',
            domain_name: item.domain_name,
            billing_cycle: `${item.years || 1} year(s)`,
            quantity: 1,
            unit_price: parseFloat(price) * (item.years || 1),
            total_price: parseFloat(price) * (item.years || 1)
          });
          subtotal += parseFloat(price) * (item.years || 1);
        }
      }
    }

    // Apply coupon if provided
    let discount = 0;
    if (coupon_code) {
      const coupons = await db.query(`
        SELECT * FROM coupons WHERE code = ? AND is_active = TRUE
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (expires_at IS NULL OR expires_at > NOW())
      `, [coupon_code.toUpperCase()]);

      if (coupons.length) {
        const coupon = coupons[0];
        if (coupon.type === 'percentage') {
          discount = (subtotal * coupon.value) / 100;
          if (coupon.max_discount) {
            discount = Math.min(discount, coupon.max_discount);
          }
        } else {
          discount = coupon.value;
        }

        // Increment coupon usage
        await db.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [coupon.id]);
      }
    }

    const total = subtotal - discount;
    const orderUuid = uuidv4();
    const orderNumber = generateOrderNumber();

    // Set payment status based on method (pending for bank/cash, unpaid for card/paypal)
    const initialPaymentStatus = (payment_method === 'bank' || payment_method === 'cash') ? 'pending' : 'unpaid';

    // Create order
    const result = await db.query(`
      INSERT INTO orders (uuid, user_id, order_number, status, payment_status, payment_method, payment_proof, subtotal, discount, total, billing_address, notes, ip_address)
      VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [orderUuid, req.user.id, orderNumber, initialPaymentStatus, payment_method, payment_proof || null, subtotal, discount, total, JSON.stringify(billing_address), notes, req.ip]);

    const orderId = Number(result.insertId);

    // Create order items
    for (const item of orderItems) {
      await db.query(`
        INSERT INTO order_items (order_id, product_id, product_name, product_type, domain_name, billing_cycle, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [orderId, item.product_id, item.product_name, item.product_type, item.domain_name, item.billing_cycle, item.quantity, item.unit_price, item.total_price]);
    }

    // Create invoice
    const invoiceUuid = uuidv4();
    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    await db.query(`
      INSERT INTO invoices (uuid, user_id, order_id, invoice_number, status, due_date, subtotal, discount, total)
      VALUES (?, ?, ?, ?, 'unpaid', ?, ?, ?, ?)
    `, [invoiceUuid, req.user.id, orderId, invoiceNumber, dueDate, subtotal, discount, total]);

    // Send email notifications (async, don't wait)
    const orderData = {
      uuid: orderUuid,
      id: orderId,
      order_number: orderNumber,
      total,
      payment_status: initialPaymentStatus,
      payment_method,
      items: orderItems
    };
    
    // Email to customer
    emailService.sendOrderPlaced(orderData, req.user).catch(err => 
      console.error('Failed to send order email:', err)
    );
    
    // Email to admin
    emailService.notifyAdminNewOrder(orderData, req.user).catch(err => 
      console.error('Failed to notify admin:', err)
    );

    // Create notifications
    notificationService.notifyNewOrder(orderData, req.user).catch(err =>
      console.error('Failed to create order notification:', err)
    );

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        uuid: orderUuid,
        order_number: orderNumber,
        total,
        payment_method
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user orders
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM orders WHERE user_id = ?';
    const params = [req.user.id];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const orders = await db.query(query, params);
    const countResult = await db.query('SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [req.user.id]);

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

// Get order details
router.get('/:uuid', authenticate, async (req, res) => {
  try {
    const orders = await db.query('SELECT * FROM orders WHERE uuid = ? AND user_id = ?', [req.params.uuid, req.user.id]);

    if (!orders.length) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orders[0].id]);

    res.json({
      order: orders[0],
      items
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to load order' });
  }
});

module.exports = router;
