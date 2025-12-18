const jwt = require('jsonwebtoken');
const db = require('../database/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Cache for role permissions (refresh every 5 minutes)
let permissionCache = {};
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Load all role permissions into cache
async function loadPermissionCache() {
  if (Date.now() - cacheTimestamp < CACHE_TTL && Object.keys(permissionCache).length > 0) {
    return;
  }

  try {
    const results = await db.query(`
      SELECT r.id as role_id, r.slug as role_slug, r.is_system, r.can_create_roles,
             GROUP_CONCAT(p.slug) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      GROUP BY r.id
    `);

    permissionCache = {};
    for (const row of results) {
      permissionCache[row.role_id] = {
        slug: row.role_slug,
        isSystem: !!row.is_system,
        canCreateRoles: !!row.can_create_roles,
        permissions: row.permissions ? row.permissions.split(',') : []
      };
    }
    cacheTimestamp = Date.now();
  } catch (error) {
    console.error('Failed to load permission cache:', error.message);
  }
}

// Clear cache when roles/permissions are modified
function clearPermissionCache() {
  permissionCache = {};
  cacheTimestamp = 0;
}

async function authenticate(req, res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Try to get user with role info, fall back to simple query if roles table doesn't exist
    let users;
    try {
      users = await db.query(`
        SELECT u.id, u.uuid, u.email, u.first_name, u.last_name, u.role, u.status, u.role_id,
               r.slug as role_slug, r.is_system, r.can_create_roles
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.uuid = ?
      `, [decoded.uuid]);
    } catch (joinError) {
      // Roles table might not exist, try simple query
      users = await db.query(
        'SELECT id, uuid, email, first_name, last_name, role, status FROM users WHERE uuid = ?',
        [decoded.uuid]
      );
    }

    if (!users.length) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (users[0].status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    const user = users[0];

    // Load permissions from cache (will silently fail if tables don't exist)
    await loadPermissionCache();

    // Attach permissions to user
    if (user.role_id && permissionCache[user.role_id]) {
      user.permissions = permissionCache[user.role_id].permissions;
      user.isSuperAdmin = permissionCache[user.role_id].isSystem;
      user.canCreateRoles = permissionCache[user.role_id].canCreateRoles || user.isSuperAdmin;
    } else {
      user.permissions = [];
      user.isSuperAdmin = false;
      user.canCreateRoles = false;
    }

    // Legacy/fallback: if user has role='admin' but no valid permissions loaded
    // (either no role_id, or role_id but roles table doesn't exist), treat as super admin
    if (user.role === 'admin' && (!user.permissions || user.permissions.length === 0)) {
      user.isSuperAdmin = true;
      user.canCreateRoles = true;
      user.permissions = ['*']; // All permissions
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Check if user has required role(s)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super admin bypasses role check
    if (req.user.isSuperAdmin) {
      return next();
    }

    if (!roles.includes(req.user.role) && !roles.includes(req.user.role_slug)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
}

// Check if user has required permission(s)
function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super admin has all permissions
    if (req.user.isSuperAdmin || (req.user.permissions && req.user.permissions.includes('*'))) {
      return next();
    }

    // Check if user has at least one of the required permissions
    const hasPermission = permissions.some(p =>
      req.user.permissions && req.user.permissions.includes(p)
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    next();
  };
}

// Check if user is super admin (for delete operations, role management, etc.)
function requireSuperAdmin() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Super Admin access required' });
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
  requirePermission,
  requireSuperAdmin,
  optionalAuth,
  generateToken,
  clearPermissionCache
};

