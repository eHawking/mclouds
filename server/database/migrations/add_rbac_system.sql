-- Role-Based Access Control (RBAC) Migration
-- Run this migration to add roles and permissions system

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  department VARCHAR(50),
  is_system BOOLEAN DEFAULT FALSE,
  can_create_roles BOOLEAN DEFAULT FALSE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_is_system (is_system)
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  department VARCHAR(50) NOT NULL,
  description TEXT,
  INDEX idx_department (department),
  INDEX idx_slug (slug)
);

-- Role permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Add role_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INT DEFAULT NULL;
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_role_id (role_id);

-- Insert default permissions by department
INSERT INTO permissions (name, slug, department, description) VALUES
-- Users Department
('View Users', 'users.view', 'users', 'View user list and details'),
('Create Users', 'users.create', 'users', 'Create new users'),
('Edit Users', 'users.edit', 'users', 'Edit user details'),
-- Orders Department
('View Orders', 'orders.view', 'orders', 'View orders list and details'),
('Create Orders', 'orders.create', 'orders', 'Create new orders'),
('Edit Orders', 'orders.edit', 'orders', 'Edit order details'),
-- Tickets Department
('View Tickets', 'tickets.view', 'tickets', 'View support tickets'),
('Create Tickets', 'tickets.create', 'tickets', 'Create tickets'),
('Edit Tickets', 'tickets.edit', 'tickets', 'Edit ticket details'),
('Assign Tickets', 'tickets.assign', 'tickets', 'Assign tickets to staff'),
-- Services Department
('View Services', 'services.view', 'services', 'View services list'),
('Create Services', 'services.create', 'services', 'Create services'),
('Edit Services', 'services.edit', 'services', 'Edit service details'),
-- Billing Department
('View Invoices', 'invoices.view', 'billing', 'View invoices'),
('Create Invoices', 'invoices.create', 'billing', 'Create invoices'),
('Edit Invoices', 'invoices.edit', 'billing', 'Edit invoices'),
('View Payments', 'payments.view', 'billing', 'View payment records'),
('Manage Proposals', 'proposals.manage', 'billing', 'Create and manage proposals'),
-- Settings Department
('View Settings', 'settings.view', 'settings', 'View system settings'),
('Edit Settings', 'settings.edit', 'settings', 'Modify system settings'),
('Edit Pages', 'pages.edit', 'settings', 'Edit CMS pages'),
('Manage Email', 'email.manage', 'settings', 'Manage email settings and logs'),
('Manage Media', 'media.manage', 'settings', 'Upload and manage media files'),
-- Roles Department
('View Roles', 'roles.view', 'roles', 'View roles list'),
('Create Roles', 'roles.create', 'roles', 'Create new roles'),
('Edit Roles', 'roles.edit', 'roles', 'Edit role permissions'),
-- AI/Bots Department
('View AI Agent', 'ai_agent.view', 'ai', 'View AI agent settings'),
('Edit AI Agent', 'ai_agent.edit', 'ai', 'Configure AI agent'),
('View NoBot', 'nobot.view', 'ai', 'View NoBot services'),
('Edit NoBot', 'nobot.edit', 'ai', 'Configure NoBot settings'),
-- Dashboard
('View Dashboard', 'dashboard.view', 'dashboard', 'View admin dashboard and stats'),
-- Domains
('View Domains', 'domains.view', 'domains', 'View domain TLDs'),
('Edit Domains', 'domains.edit', 'domains', 'Edit domain pricing'),
-- Pricing
('View Pricing', 'pricing.view', 'pricing', 'View pricing configuration'),
('Edit Pricing', 'pricing.edit', 'pricing', 'Edit product pricing');

-- Insert Super Admin role (system role with all permissions)
INSERT INTO roles (uuid, name, slug, description, is_system, can_create_roles) 
VALUES (UUID(), 'Super Admin', 'super_admin', 'Full access to all system features. Cannot be deleted.', TRUE, TRUE);

-- Insert default Admin role
INSERT INTO roles (uuid, name, slug, description, can_create_roles) 
VALUES (UUID(), 'Admin', 'admin', 'Standard admin with access to most features except role management.', FALSE);

-- Insert Support Agent role
INSERT INTO roles (uuid, name, slug, description) 
VALUES (UUID(), 'Support Agent', 'support_agent', 'Support staff with access to tickets and user viewing.');

-- Insert Sales role
INSERT INTO roles (uuid, name, slug, description) 
VALUES (UUID(), 'Sales', 'sales', 'Sales team with access to orders, invoices, and proposals.');

-- Assign all permissions to Super Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.slug = 'super_admin';

-- Assign most permissions to Admin (except roles.*)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.slug = 'admin' AND p.department != 'roles';

-- Assign Support Agent permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.slug = 'support_agent' AND (
  p.department = 'tickets' OR 
  p.slug = 'users.view' OR 
  p.slug = 'dashboard.view' OR
  p.slug = 'services.view'
);

-- Assign Sales permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.slug = 'sales' AND (
  p.department IN ('orders', 'billing') OR 
  p.slug IN ('users.view', 'users.create', 'dashboard.view', 'services.view')
);

-- Update existing admin users to Super Admin role
UPDATE users u
SET role_id = (SELECT id FROM roles WHERE slug = 'super_admin')
WHERE u.role = 'admin' AND u.role_id IS NULL;
