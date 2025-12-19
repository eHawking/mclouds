const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../database/connection');
const { authenticate, requirePermission, requireSuperAdmin, clearPermissionCache } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Helper to check if tables exist
async function checkTablesExist() {
    try {
        const result = await db.query(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name IN ('roles', 'permissions', 'role_permissions')
        `);
        return result[0].count >= 3;
    } catch (error) {
        console.error('Check tables error:', error);
        return false;
    }
}

// Get all roles
router.get('/', async (req, res) => {
    try {
        // Check if user has permission (isSuperAdmin or has roles.view)
        if (!req.user.isSuperAdmin && !(req.user.permissions && req.user.permissions.includes('roles.view'))) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Check if tables exist
        const tablesExist = await checkTablesExist();
        if (!tablesExist) {
            console.error('RBAC tables do not exist - please run the migration');
            return res.status(500).json({ error: 'RBAC tables not found. Please run the database migration: server/database/migrations/add_rbac_system.sql' });
        }

        const roles = await db.query(`
      SELECT r.*, 
             (SELECT COUNT(*) FROM users WHERE role_id = r.id) as user_count,
             u.first_name as created_by_name, u.last_name as created_by_lastname
      FROM roles r
      LEFT JOIN users u ON r.created_by = u.id
      ORDER BY r.is_system DESC, r.name ASC
    `);

        // Get permissions for each role
        for (const role of roles) {
            const perms = await db.query(`
        SELECT p.slug, p.name, p.department
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ?
      `, [role.id]);
            role.permissions = perms;
        }

        res.json({ roles });
    } catch (error) {
        console.error('Get roles error:', error);
        console.error('Error details:', error.message, error.sql);
        res.status(500).json({ error: 'Failed to fetch roles: ' + error.message });
    }
});

// Get all available permissions (grouped by department)
// IMPORTANT: This route MUST come before /:uuid
router.get('/permissions', requirePermission('roles.view'), async (req, res) => {
    try {
        const permissions = await db.query(`
      SELECT id, name, slug, department, description
      FROM permissions
      ORDER BY department, name
    `);

        // Group by department
        const grouped = {};
        for (const perm of permissions) {
            if (!grouped[perm.department]) {
                grouped[perm.department] = [];
            }
            grouped[perm.department].push(perm);
        }

        res.json({ permissions, grouped });
    } catch (error) {
        console.error('Get permissions error:', error);
        res.status(500).json({ error: 'Failed to fetch permissions' });
    }
});

// Get admin users (users with role_id set)
// IMPORTANT: This route MUST come before /:uuid
router.get('/admin-users/list', requirePermission('users.view'), async (req, res) => {
    try {
        const users = await db.query(`
      SELECT u.id, u.uuid, u.email, u.first_name, u.last_name, u.status, u.created_at, u.role_id,
             r.name as role_name, r.slug as role_slug, r.uuid as role_uuid
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.role = 'admin' OR u.role_id IS NOT NULL
      ORDER BY u.created_at DESC
    `);

        res.json({ users });
    } catch (error) {
        console.error('Get admin users error:', error);
        res.status(500).json({ error: 'Failed to fetch admin users' });
    }
});

// Get single role
// IMPORTANT: This wildcard route must come AFTER specific routes like /permissions and /admin-users/list
router.get('/:uuid', requirePermission('roles.view'), async (req, res) => {
    try {
        const roles = await db.query(`
      SELECT r.*, u.first_name as created_by_name, u.last_name as created_by_lastname
      FROM roles r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.uuid = ?
    `, [req.params.uuid]);

        if (!roles.length) {
            return res.status(404).json({ error: 'Role not found' });
        }

        const role = roles[0];

        // Get permissions
        const permissions = await db.query(`
      SELECT p.id, p.slug, p.name, p.department
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ?
    `, [role.id]);

        role.permissions = permissions;
        role.permission_ids = permissions.map(p => p.id);

        res.json({ role });
    } catch (error) {
        console.error('Get role error:', error);
        res.status(500).json({ error: 'Failed to fetch role' });
    }
});

// Create role
router.post('/', [
    body('name').trim().notEmpty().withMessage('Role name is required'),
    body('description').optional().trim(),
    body('department').optional().trim(),
    body('can_create_roles').optional().isBoolean(),
    body('permissions').isArray().withMessage('Permissions must be an array')
], async (req, res) => {
    try {
        // Check if user can create roles
        if (!req.user.canCreateRoles && !req.user.isSuperAdmin) {
            return res.status(403).json({ error: 'You do not have permission to create roles' });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, department, can_create_roles, permissions } = req.body;

        // Generate slug from name
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

        // Check if slug already exists
        const existing = await db.query('SELECT id FROM roles WHERE slug = ?', [slug]);
        if (existing.length) {
            return res.status(400).json({ error: 'A role with this name already exists' });
        }

        const uuid = uuidv4();

        // Only super admin can grant can_create_roles permission
        const canCreateRolesValue = req.user.isSuperAdmin ? (can_create_roles || false) : false;

        await db.query(`
      INSERT INTO roles (uuid, name, slug, description, department, can_create_roles, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [uuid, name, slug, description, department, canCreateRolesValue, req.user.id]);

        // Get the new role's ID
        const newRole = await db.query('SELECT id FROM roles WHERE uuid = ?', [uuid]);
        const roleId = newRole[0].id;

        // Insert permissions (filter out roles.* permissions if not super admin)
        if (permissions && permissions.length > 0) {
            let permissionFilter = '';
            if (!req.user.isSuperAdmin) {
                permissionFilter = " AND slug NOT LIKE 'roles.%'";
            }

            const validPerms = await db.query(
                `SELECT id FROM permissions WHERE id IN (?)${permissionFilter}`,
                [permissions]
            );

            for (const perm of validPerms) {
                await db.query(
                    'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
                    [roleId, perm.id]
                );
            }
        }

        // Clear permission cache
        clearPermissionCache();

        res.status(201).json({
            message: 'Role created successfully',
            role: { uuid, name, slug }
        });
    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({ error: 'Failed to create role' });
    }
});

// Update role
router.put('/:uuid', requirePermission('roles.edit'), [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('department').optional().trim(),
    body('can_create_roles').optional().isBoolean(),
    body('permissions').optional().isArray()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Get the role
        const roles = await db.query('SELECT * FROM roles WHERE uuid = ?', [req.params.uuid]);
        if (!roles.length) {
            return res.status(404).json({ error: 'Role not found' });
        }

        const role = roles[0];

        // Cannot edit system roles unless super admin
        if (role.is_system && !req.user.isSuperAdmin) {
            return res.status(403).json({ error: 'Cannot modify system roles' });
        }

        const { name, description, department, can_create_roles, permissions } = req.body;

        // Build update query
        const updates = [];
        const params = [];

        if (name) {
            updates.push('name = ?');
            params.push(name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (department !== undefined) {
            updates.push('department = ?');
            params.push(department);
        }
        if (can_create_roles !== undefined && req.user.isSuperAdmin) {
            updates.push('can_create_roles = ?');
            params.push(can_create_roles);
        }

        if (updates.length > 0) {
            params.push(req.params.uuid);
            await db.query(
                `UPDATE roles SET ${updates.join(', ')}, updated_at = NOW() WHERE uuid = ?`,
                params
            );
        }

        // Update permissions
        if (permissions !== undefined) {
            // Remove existing permissions
            await db.query('DELETE FROM role_permissions WHERE role_id = ?', [role.id]);

            // Add new permissions
            if (permissions.length > 0) {
                let permissionFilter = '';
                if (!req.user.isSuperAdmin) {
                    permissionFilter = " AND slug NOT LIKE 'roles.%'";
                }

                const validPerms = await db.query(
                    `SELECT id FROM permissions WHERE id IN (?)${permissionFilter}`,
                    [permissions]
                );

                for (const perm of validPerms) {
                    await db.query(
                        'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
                        [role.id, perm.id]
                    );
                }
            }
        }

        // Clear permission cache
        clearPermissionCache();

        res.json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

// Delete role (Super Admin only)
router.delete('/:uuid', requireSuperAdmin(), async (req, res) => {
    try {
        const roles = await db.query('SELECT * FROM roles WHERE uuid = ?', [req.params.uuid]);
        if (!roles.length) {
            return res.status(404).json({ error: 'Role not found' });
        }

        const role = roles[0];

        // Cannot delete system roles
        if (role.is_system) {
            return res.status(403).json({ error: 'Cannot delete system roles' });
        }

        // Check if any users have this role
        const users = await db.query('SELECT COUNT(*) as count FROM users WHERE role_id = ?', [role.id]);
        if (users[0].count > 0) {
            return res.status(400).json({
                error: `Cannot delete role. ${users[0].count} user(s) are assigned to this role.`
            });
        }

        // Delete role (permissions will cascade)
        await db.query('DELETE FROM roles WHERE id = ?', [role.id]);

        // Clear permission cache
        clearPermissionCache();

        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({ error: 'Failed to delete role' });
    }
});

// Assign role to user
router.put('/assign/:userUuid', requirePermission('users.edit'), async (req, res) => {
    try {
        const { role_id } = req.body;

        // Get user
        const users = await db.query('SELECT * FROM users WHERE uuid = ?', [req.params.userUuid]);
        if (!users.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        // If assigning a role, verify it exists and check permission
        if (role_id) {
            const roles = await db.query('SELECT * FROM roles WHERE id = ?', [role_id]);
            if (!roles.length) {
                return res.status(404).json({ error: 'Role not found' });
            }

            // Only super admin can assign system roles
            if (roles[0].is_system && !req.user.isSuperAdmin) {
                return res.status(403).json({ error: 'Cannot assign system roles' });
            }

            // Update user
            await db.query("UPDATE users SET role_id = ?, role = 'admin' WHERE id = ?", [role_id, user.id]);
        } else {
            // Remove role (make regular user)
            await db.query("UPDATE users SET role_id = NULL, role = 'user' WHERE id = ?", [user.id]);
        }

        res.json({ message: 'Role assigned successfully' });
    } catch (error) {
        console.error('Assign role error:', error);
        res.status(500).json({ error: 'Failed to assign role' });
    }
});

module.exports = router;

