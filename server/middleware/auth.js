const jwt = require('jsonwebtoken');
const db = require('../database/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function authenticate(req, res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await db.query('SELECT id, uuid, email, first_name, last_name, role, status FROM users WHERE uuid = ?', [decoded.uuid]);
    
    if (!users.length) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (users[0].status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  };
}

function optionalAuth(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    db.query('SELECT id, uuid, email, first_name, last_name, role, status FROM users WHERE uuid = ?', [decoded.uuid])
      .then(users => {
        if (users.length && users[0].status === 'active') {
          req.user = users[0];
        }
        next();
      })
      .catch(() => next());
  } catch {
    next();
  }
}

function generateToken(user) {
  return jwt.sign(
    { uuid: user.uuid, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = {
  authenticate,
  requireRole,
  optionalAuth,
  generateToken
};
