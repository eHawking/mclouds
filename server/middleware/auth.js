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
    const users = await db.query(`
      SELECT u.id, u.uuid, u.email, u.first_name, u.last_name, u.role, u.status, u.role_id,
             r.permissions as role_permissions, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.uuid = ?
    `, [decoded.uuid]);

    if (!users.length) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (users[0].status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Parse permissions if available
    const user = users[0];
    if (user.role_permissions) {
      user.permissions = typeof user.role_permissions === 'string'
        ? JSON.parse(user.role_permissions)
        : user.role_permissions;
    } else {
      user.permissions = null;
    }
    delete user.role_permissions;

    req.user = user;
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

// Check specific permission (e.g., 'users.view', 'tickets.reply')
function requirePermission(category, action) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super admin check - if user is admin without role_id, allow all (legacy super admin)
    if (req.user.role === 'admin' && !req.user.role_id) {
      return next();
    }

    // Check permissions from role
    if (req.user.permissions) {
      const categoryPerms = req.user.permissions[category];
      if (categoryPerms && categoryPerms.includes(action)) {
        return next();
      }
    }

    return res.status(403).json({ error: 'Permission denied' });
  };
}

// Check if user has any of the specified permissions
function requireAnyPermission(permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super admin check
    if (req.user.role === 'admin' && !req.user.role_id) {
      return next();
    }

    if (req.user.permissions) {
      for (const perm of permissions) {
        const [category, action] = perm.split('.');
        const categoryPerms = req.user.permissions[category];
        if (categoryPerms && categoryPerms.includes(action)) {
          return next();
        }
      }
    }

    return res.status(403).json({ error: 'Permission denied' });
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
  requirePermission,
  requireAnyPermission,
  optionalAuth,
  generateToken
};
