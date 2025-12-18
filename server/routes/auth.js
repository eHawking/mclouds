const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../database/connection');
const { authenticate, generateToken } = require('../middleware/auth');

const router = express.Router();

// Generate 6-digit user ID
function generate6DigitId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const users = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, users[0] || null);
  } catch (error) {
    done(error, null);
  }
});

// Helper function to find or create OAuth user
async function findOrCreateOAuthUser(profile, provider) {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new Error('Email not provided by OAuth provider');
    }

    console.log(`OAuth ${provider} login attempt for: ${email}`);

    // Check if user exists by email
    let users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length) {
      // Update OAuth provider info - try to update provider_id column, ignore if doesn't exist
      try {
        await db.query(
          `UPDATE users SET avatar = COALESCE(avatar, ?) WHERE id = ?`,
          [profile.photos?.[0]?.value || null, users[0].id]
        );
      } catch (updateErr) {
        console.log('Avatar update skipped:', updateErr.message);
      }
      console.log(`Existing user found: ${users[0].uuid}`);
      return users[0];
    }

    // Create new user with 6-digit ID
    let uuid = generate6DigitId();
    let idExists = true;
    let attempts = 0;
    while (idExists && attempts < 10) {
      const check = await db.query('SELECT id FROM users WHERE uuid = ?', [uuid]);
      const checkFiltered = Array.isArray(check) ? check.filter(row => row.id) : [];
      if (checkFiltered.length === 0) {
        idExists = false;
      } else {
        uuid = generate6DigitId();
        attempts++;
      }
    }
    
    const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
    const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
    const avatar = profile.photos?.[0]?.value || null;

    console.log(`Creating new user: ${email}, ${firstName} ${lastName}`);

    await db.query(`
      INSERT INTO users (uuid, email, first_name, last_name, avatar, role, status, password)
      VALUES (?, ?, ?, ?, ?, 'user', 'active', '')
    `, [uuid, email, firstName, lastName, avatar]);

    const newUsers = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log(`New user created: ${newUsers[0]?.uuid}`);
    return newUsers[0];
  } catch (error) {
    console.error(`OAuth ${provider} findOrCreateOAuthUser error:`, error);
    throw error;
  }
}

// Get the base URL for OAuth callbacks (server-side callback URL)
const getBaseUrl = () => {
  return process.env.API_URL || process.env.APP_URL || 'http://localhost:5000';
};

// Get the client URL for redirect after OAuth
const getClientUrl = () => {
  return process.env.CLIENT_URL || process.env.API_URL || process.env.APP_URL || 'http://localhost:5173';
};

// Configure Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${getBaseUrl()}/api/auth/google/callback`,
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateOAuthUser(profile, 'google');
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
}

// Configure GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${getBaseUrl()}/api/auth/github/callback`,
    scope: ['user:email'],
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateOAuthUser(profile, 'github');
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
}

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    const clientUrl = getClientUrl();
    
    if (err) {
      console.error('Google OAuth error:', err);
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(err.message || 'oauth_failed')}`);
    }
    
    if (!user) {
      console.error('Google OAuth: No user returned', info);
      return res.redirect(`${clientUrl}/login?error=oauth_failed`);
    }
    
    try {
      const token = generateToken({ uuid: user.uuid, email: user.email, role: user.role });
      res.redirect(`${clientUrl}/oauth-callback?token=${token}`);
    } catch (tokenErr) {
      console.error('Token generation error:', tokenErr);
      res.redirect(`${clientUrl}/login?error=token_failed`);
    }
  })(req, res, next);
});

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', {
  scope: ['user:email']
}));

router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, (err, user, info) => {
    const clientUrl = getClientUrl();
    
    if (err) {
      console.error('GitHub OAuth error:', err);
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(err.message || 'oauth_failed')}`);
    }
    
    if (!user) {
      console.error('GitHub OAuth: No user returned', info);
      return res.redirect(`${clientUrl}/login?error=oauth_failed`);
    }
    
    try {
      const token = generateToken({ uuid: user.uuid, email: user.email, role: user.role });
      res.redirect(`${clientUrl}/oauth-callback?token=${token}`);
    } catch (tokenErr) {
      console.error('Token generation error:', tokenErr);
      res.redirect(`${clientUrl}/login?error=token_failed`);
    }
  })(req, res, next);
});

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, first_name, last_name, phone, company } = req.body;

    // Check if email exists
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate unique 6-digit ID
    let uuid = generate6DigitId();
    let idExists = true;
    let attempts = 0;
    while (idExists && attempts < 10) {
      const check = await db.query('SELECT id FROM users WHERE uuid = ?', [uuid]);
      const checkFiltered = Array.isArray(check) ? check.filter(row => row.id) : [];
      if (checkFiltered.length === 0) {
        idExists = false;
      } else {
        uuid = generate6DigitId();
        attempts++;
      }
    }

    await db.query(`
      INSERT INTO users (uuid, email, password, first_name, last_name, phone, company, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'user', 'active')
    `, [uuid, email, hashedPassword, first_name, last_name, phone || null, company || null]);

    const token = generateToken({ uuid, email, role: 'user' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Registration successful',
      user: { uuid, email, first_name, last_name, role: 'user' },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Guest Checkout - creates account with auto-generated password
router.post('/guest-checkout', [
  body('email').isEmail().normalizeEmail(),
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Please fill in all required fields correctly', errors: errors.array() });
    }

    const { email, first_name, last_name, address, city, country } = req.body;

    console.log(`Guest checkout attempt for: ${email}`);

    // Check if email exists
    const existing = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log('Existing user query result:', JSON.stringify(existing).substring(0, 200));
    
    // Filter out MariaDB metadata - only keep actual user rows
    let existingUsers = [];
    if (Array.isArray(existing)) {
      existingUsers = existing.filter(row => row && typeof row === 'object' && row.email);
    }
    
    console.log(`Found ${existingUsers.length} existing users`);
    
    if (existingUsers.length > 0) {
      // User exists - return existing user with token
      const user = existingUsers[0];
      const token = generateToken({ uuid: user.uuid, email: user.email, role: user.role });
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        message: 'Logged in with existing account',
        user: { uuid: user.uuid, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role },
        token
      });
    }

    // Generate random password and 6-digit user ID
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + '!';
    const hashedPassword = await bcrypt.hash(randomPassword, 12);
    
    // Generate unique 6-digit ID
    let uuid = generate6DigitId();
    let idExists = true;
    let attempts = 0;
    while (idExists && attempts < 10) {
      const check = await db.query('SELECT id FROM users WHERE uuid = ?', [uuid]);
      const checkFiltered = Array.isArray(check) ? check.filter(row => row.id) : [];
      if (checkFiltered.length === 0) {
        idExists = false;
      } else {
        uuid = generate6DigitId();
        attempts++;
      }
    }

    await db.query(`
      INSERT INTO users (uuid, email, password, first_name, last_name, address, city, country, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'user', 'active')
    `, [uuid, email, hashedPassword, first_name, last_name, address || null, city || null, country || null]);

    const token = generateToken({ uuid, email, role: 'user' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Send welcome email with password
    try {
      const emailService = require('../services/emailService');
      await emailService.send(email, 'welcome_email', {
        user_name: first_name,
        temp_password: randomPassword
      });
    } catch (emailErr) {
      console.error('Failed to send welcome email:', emailErr);
    }

    console.log(`Guest checkout - Email: ${email}, Password: ${randomPassword}`);

    res.status(201).json({
      message: 'Account created successfully',
      user: { uuid, email, first_name, last_name, role: 'user' },
      token
    });
  } catch (error) {
    console.error('Guest checkout error:', error.message, error.stack);
    // Check for duplicate email error
    if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate')) {
      return res.status(400).json({ error: 'Email already exists. Please login instead.' });
    }
    // Return more specific error for debugging
    res.status(500).json({ error: `Account creation failed: ${error.message}` });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login (ignore if column doesn't exist)
    try {
      await db.query('UPDATE users SET updated_at = NOW() WHERE id = ?', [user.id]);
    } catch (e) {
      // Ignore - column might not exist
    }

    const token = generateToken({ uuid: user.uuid, email: user.email, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login successful',
      user: {
        uuid: user.uuid,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const users = await db.query(`
      SELECT uuid, email, first_name, last_name, phone, company, address, city, state, country, postal_code, avatar, role, preferred_language, preferred_currency, created_at
      FROM users WHERE id = ?
    `, [req.user.id]);

    if (!users.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Update profile
router.put('/profile', authenticate, [
  body('first_name').optional().trim().notEmpty(),
  body('last_name').optional().trim().notEmpty(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('postal_code').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, phone, company, address, city, state, country, postal_code, preferred_language, preferred_currency } = req.body;

    await db.query(`
      UPDATE users SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        phone = COALESCE(?, phone),
        company = COALESCE(?, company),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        country = COALESCE(?, country),
        postal_code = COALESCE(?, postal_code),
        preferred_language = COALESCE(?, preferred_language),
        preferred_currency = COALESCE(?, preferred_currency)
      WHERE id = ?
    `, [first_name, last_name, phone, company, address, city, state, country, postal_code, preferred_language, preferred_currency, req.user.id]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', authenticate, [
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { current_password, new_password } = req.body;

    const users = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const validPassword = await bcrypt.compare(current_password, users[0].password);
    
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const { email } = req.body;
    
    const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    
    // Always return success to prevent email enumeration
    if (!users.length) {
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    const resetToken = uuidv4();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await db.query(`
      UPDATE users SET password_reset_token = ?, password_reset_expires = ?
      WHERE id = ?
    `, [resetToken, expires, users[0].id]);

    // TODO: Send email with reset link

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

module.exports = router;
