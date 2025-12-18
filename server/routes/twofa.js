const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const db = require('../database/connection');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Generate 2FA secret and QR code
router.post('/setup', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if 2FA is already enabled
        const users = await db.query('SELECT two_factor_enabled, email FROM users WHERE id = ?', [userId]);
        if (!users.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (users[0].two_factor_enabled) {
            return res.status(400).json({ error: '2FA is already enabled' });
        }

        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `MagneticClouds:${users[0].email}`,
            issuer: 'Magnetic Clouds'
        });

        // Store secret temporarily (not enabled yet)
        await db.query(
            'UPDATE users SET two_factor_secret = ? WHERE id = ?',
            [secret.base32, userId]
        );

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        res.json({
            secret: secret.base32,
            qrCode: qrCodeUrl,
            message: 'Scan the QR code with your authenticator app, then verify with a code'
        });
    } catch (error) {
        console.error('2FA setup error:', error);
        res.status(500).json({ error: 'Failed to setup 2FA' });
    }
});

// Verify and enable 2FA
router.post('/verify', authenticate, async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        if (!code) {
            return res.status(400).json({ error: 'Verification code is required' });
        }

        // Get user's secret
        const users = await db.query('SELECT two_factor_secret, two_factor_enabled FROM users WHERE id = ?', [userId]);
        if (!users.length || !users[0].two_factor_secret) {
            return res.status(400).json({ error: 'Please setup 2FA first' });
        }

        if (users[0].two_factor_enabled) {
            return res.status(400).json({ error: '2FA is already enabled' });
        }

        // Verify the token
        const verified = speakeasy.totp.verify({
            secret: users[0].two_factor_secret,
            encoding: 'base32',
            token: code,
            window: 2 // Allow 2 time steps before/after for clock skew
        });

        if (!verified) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Enable 2FA
        await db.query('UPDATE users SET two_factor_enabled = TRUE WHERE id = ?', [userId]);

        res.json({
            message: '2FA enabled successfully',
            enabled: true
        });
    } catch (error) {
        console.error('2FA verify error:', error);
        res.status(500).json({ error: 'Failed to verify 2FA' });
    }
});

// Disable 2FA
router.post('/disable', authenticate, async (req, res) => {
    try {
        const { code, password } = req.body;
        const userId = req.user.id;

        if (!code) {
            return res.status(400).json({ error: 'Verification code is required' });
        }

        // Get user's secret
        const users = await db.query('SELECT two_factor_secret, two_factor_enabled, password FROM users WHERE id = ?', [userId]);
        if (!users.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!users[0].two_factor_enabled) {
            return res.status(400).json({ error: '2FA is not enabled' });
        }

        // Verify the token
        const verified = speakeasy.totp.verify({
            secret: users[0].two_factor_secret,
            encoding: 'base32',
            token: code,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Disable 2FA
        await db.query('UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = ?', [userId]);

        res.json({
            message: '2FA disabled successfully',
            enabled: false
        });
    } catch (error) {
        console.error('2FA disable error:', error);
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
});

// Validate 2FA code during login (called from login flow)
router.post('/validate', async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }

        // Get user's secret
        const users = await db.query('SELECT id, two_factor_secret, two_factor_enabled FROM users WHERE email = ?', [email]);
        if (!users.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!users[0].two_factor_enabled) {
            return res.status(400).json({ error: '2FA is not enabled for this account' });
        }

        // Verify the token
        const verified = speakeasy.totp.verify({
            secret: users[0].two_factor_secret,
            encoding: 'base32',
            token: code,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({ error: 'Invalid 2FA code' });
        }

        res.json({
            valid: true,
            message: '2FA code verified'
        });
    } catch (error) {
        console.error('2FA validate error:', error);
        res.status(500).json({ error: 'Failed to validate 2FA code' });
    }
});

// Get 2FA status
router.get('/status', authenticate, async (req, res) => {
    try {
        const users = await db.query('SELECT two_factor_enabled FROM users WHERE id = ?', [req.user.id]);
        if (!users.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            enabled: !!users[0].two_factor_enabled
        });
    } catch (error) {
        console.error('2FA status error:', error);
        res.status(500).json({ error: 'Failed to get 2FA status' });
    }
});

module.exports = router;
