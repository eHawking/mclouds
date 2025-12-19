const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');
const { authenticate, requireRole, requirePermission } = require('../middleware/auth');

const router = express.Router();

// Get all roles
router.get('/', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const roles = await db.query(`
      SELECT r.*, 
        (SELECT COUNT(*) FROM users WHERE role_id = r.id) as user_count
      FROM roles r
      ORDER BY r.is_system DESC, r.name ASC
    `);

        // Parse permissions JSON
        const parsedRoles = roles.map(role => ({
            ...role,
            permissions: typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions
        }));

        res.json({ roles: parsedRoles });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({ error: 'Failed to get roles' });
    }
});

// Get single role
router.get('/:uuid', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const roles = await db.query('SELECT * FROM roles WHERE uuid = ?', [req.params.uuid]);
        if (!roles.length) {
            return res.status(404).json({ error: 'Role not found' });
        }

        const role = roles[0];
        role.permissions = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions;

        res.json({ role });
    } catch (error) {
        console.error('Get role error:', error);
        res.status(500).json({ error: 'Failed to get role' });
    }
});

// Create role
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
    try {
        // Check for manage_roles permission
        if (!req.user.permissions?.settings?.includes('manage_roles')) {
            // Allow if user is Super Admin or no role system set up yet
            const hasRoles = await db.query('SELECT COUNT(*) as count FROM roles');
            if (hasRoles[0]?.count > 0 && req.user.role_id) {
                const userRole = await db.query('SELECT permissions FROM roles WHERE id = ?', [req.user.role_id]);
                if (userRole.length) {
                    const perms = typeof userRole[0].permissions === 'string' ?
                        JSON.parse(userRole[0].permissions) : userRole[0].permissions;
                    if (!perms?.settings?.includes('manage_roles')) {
                        return res.status(403).json({ error: 'Permission denied' });
                    }
                }
            }
        }

        const { name, description, permissions } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Role name is required' });
        }

        // Check if name already exists
        const existing = await db.query('SELECT id FROM roles WHERE name = ?', [name]);
        if (existing.length) {
            return res.status(400).json({ error: 'Role name already exists' });
        }

        const uuid = uuidv4();
        await db.query(`
      INSERT INTO roles (uuid, name, description, permissions, is_system)
      VALUES (?, ?, ?, ?, FALSE)
    `, [uuid, name, description || null, JSON.stringify(permissions || {})]);

        res.status(201).json({
            message: 'Role created successfully',
            uuid
        });
    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({ error: 'Failed to create role' });
    }
});

// Update role
router.put('/:uuid', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const { name, description, permissions } = req.body;

        // Check if role exists
        const roles = await db.query('SELECT * FROM roles WHERE uuid = ?', [req.params.uuid]);
        if (!roles.length) {
            return res.status(404).json({ error: 'Role not found' });
        }

        const role = roles[0];

        // Prevent editing system role name
        if (role.is_system && name && name !== role.name) {
            return res.status(400).json({ error: 'Cannot rename system roles' });
        }

        // Check name uniqueness if changing
        if (name && name !== role.name) {
            const existing = await db.query('SELECT id FROM roles WHERE name = ? AND id != ?', [name, role.id]);
            if (existing.length) {
                return res.status(400).json({ error: 'Role name already exists' });
            }
        }

        await db.query(`
      UPDATE roles SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        permissions = COALESCE(?, permissions)
      WHERE uuid = ?
    `, [name, description, permissions ? JSON.stringify(permissions) : null, req.params.uuid]);

        res.json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

// Delete role
router.delete('/:uuid', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const roles = await db.query('SELECT * FROM roles WHERE uuid = ?', [req.params.uuid]);
        if (!roles.length) {
            return res.status(404).json({ error: 'Role not found' });
        }

        if (roles[0].is_system) {
            return res.status(400).json({ error: 'Cannot delete system roles' });
        }

        // Set users with this role to null
        await db.query('UPDATE users SET role_id = NULL WHERE role_id = ?', [roles[0].id]);

        await db.query('DELETE FROM roles WHERE uuid = ?', [req.params.uuid]);

        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({ error: 'Failed to delete role' });
    }
});

// Get users by role
router.get('/:uuid/users', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const roles = await db.query('SELECT id FROM roles WHERE uuid = ?', [req.params.uuid]);
        if (!roles.length) {
            return res.status(404).json({ error: 'Role not found' });
        }

        const users = await db.query(`
      SELECT uuid, email, first_name, last_name, avatar, status, created_at
      FROM users 
      WHERE role_id = ?
      ORDER BY first_name, last_name
    `, [roles[0].id]);

        res.json({ users });
    } catch (error) {
        console.error('Get role users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Assign role to user
router.post('/assign', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const { user_uuid, role_uuid } = req.body;

        if (!user_uuid) {
            return res.status(400).json({ error: 'User UUID is required' });
        }

        // Get user
        const users = await db.query('SELECT id, role FROM users WHERE uuid = ?', [user_uuid]);
        if (!users.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Only allow assigning roles to admin users
        if (users[0].role !== 'admin') {
            return res.status(400).json({ error: 'Can only assign roles to admin users' });
        }

        let roleId = null;
        if (role_uuid) {
            const roles = await db.query('SELECT id FROM roles WHERE uuid = ?', [role_uuid]);
            if (!roles.length) {
                return res.status(404).json({ error: 'Role not found' });
            }
            roleId = roles[0].id;
        }

        await db.query('UPDATE users SET role_id = ? WHERE uuid = ?', [roleId, user_uuid]);

        res.json({ message: 'Role assigned successfully' });
    } catch (error) {
        console.error('Assign role error:', error);
        res.status(500).json({ error: 'Failed to assign role' });
    }
});

// Get all permissions (meta info)
router.get('/meta/permissions', authenticate, requireRole('admin'), async (req, res) => {
    const permissions = {
        users: {
            label: 'Users',
            actions: ['view', 'create', 'edit', 'delete']
        },
        orders: {
            label: 'Orders',
            actions: ['view', 'create', 'edit', 'delete']
        },
        tickets: {
            label: 'Support Tickets',
            actions: ['view', 'reply', 'close', 'delete']
        },
        settings: {
            label: 'Settings',
            actions: ['view', 'edit', 'manage_roles']
        },
        pricing: {
            label: 'Pricing & Plans',
            actions: ['view', 'edit']
        },
        content: {
            label: 'Pages & Content',
            actions: ['view', 'edit', 'delete']
        },
        invoices: {
            label: 'Invoices',
            actions: ['view', 'create', 'edit', 'delete']
        },
        proposals: {
            label: 'Proposals',
            actions: ['view', 'create', 'edit', 'delete']
        },
        domains: {
            label: 'Domains',
            actions: ['view', 'edit']
        },
        email: {
            label: 'Email',
            actions: ['view', 'send']
        },
        server: {
            label: 'Server Management',
            actions: ['view', 'manage']
        }
    };

    res.json({ permissions });
});

module.exports = router;
