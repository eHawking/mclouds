const express = require('express');
const db = require('../database/connection');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Helper to get Stripe instance with current keys
async function getStripe() {
  const modeResult = await db.query("SELECT setting_value FROM settings WHERE setting_key = 'stripe_mode'");
  const mode = modeResult[0]?.setting_value || 'test';
  
  const keyName = mode === 'live' ? 'stripe_secret_key_live' : 'stripe_secret_key_test';
  const keyResult = await db.query("SELECT setting_value FROM settings WHERE setting_key = ?", [keyName]);
  const secretKey = keyResult[0]?.setting_value;

  if (!secretKey) {
    throw new Error('Stripe is not configured');
  }

  return require('stripe')(secretKey);
}

// Create payment intent for Stripe
router.post('/stripe/create-intent', authenticate, async (req, res) => {
  try {
    const { amount, currency = 'usd', order_uuid } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const stripe = await getStripe();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_uuid: order_uuid || '',
        user_id: req.user.id.toString(),
        user_email: req.user.email
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment intent' });
  }
});

// Confirm payment and update order
router.post('/stripe/confirm', authenticate, async (req, res) => {
  try {
    const { payment_intent_id, order_uuid } = req.body;

    const stripe = await getStripe();

    // Retrieve payment intent to verify
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status === 'succeeded') {
      // Update order payment status
      if (order_uuid) {
        await db.query(`
          UPDATE orders 
          SET payment_status = 'paid', 
              status = 'active',
              stripe_payment_intent = ?
          WHERE uuid = ? AND user_id = ?
        `, [payment_intent_id, order_uuid, req.user.id]);

        // Update invoice
        await db.query(`
          UPDATE invoices i
          JOIN orders o ON i.order_id = o.id
          SET i.status = 'paid', i.paid_at = NOW()
          WHERE o.uuid = ?
        `, [order_uuid]);
      }

      res.json({ success: true, status: 'paid' });
    } else if (paymentIntent.status === 'processing') {
      res.json({ success: true, status: 'processing' });
    } else {
      res.json({ success: false, status: paymentIntent.status });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Stripe webhook handler
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecretResult = await db.query("SELECT setting_value FROM settings WHERE setting_key = 'stripe_webhook_secret'");
    const webhookSecret = webhookSecretResult[0]?.setting_value;

    const stripe = await getStripe();
    
    let event;
    
    if (webhookSecret) {
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body;
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderUuid = paymentIntent.metadata?.order_uuid;
        
        if (orderUuid) {
          await db.query(`
            UPDATE orders 
            SET payment_status = 'paid', status = 'active'
            WHERE uuid = ?
          `, [orderUuid]);
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        const failedOrderUuid = failedIntent.metadata?.order_uuid;
        
        if (failedOrderUuid) {
          await db.query(`
            UPDATE orders 
            SET payment_status = 'failed'
            WHERE uuid = ?
          `, [failedOrderUuid]);
        }
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

module.exports = router;
