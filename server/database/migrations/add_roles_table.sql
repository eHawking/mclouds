-- Admin Roles System Migration
-- Run this to add roles table and update users table

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  permissions JSON,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add role_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INT DEFAULT NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;

-- Insert default roles
INSERT INTO roles (uuid, name, description, permissions, is_system) VALUES
(UUID(), 'Super Admin', 'Full access to all features', JSON_OBJECT(
  'users', JSON_ARRAY('view', 'create', 'edit', 'delete'),
  'orders', JSON_ARRAY('view', 'create', 'edit', 'delete'),
  'tickets', JSON_ARRAY('view', 'reply', 'close', 'delete'),
  'settings', JSON_ARRAY('view', 'edit', 'manage_roles'),
  'pricing', JSON_ARRAY('view', 'edit'),
  'content', JSON_ARRAY('view', 'edit', 'delete'),
  'invoices', JSON_ARRAY('view', 'create', 'edit', 'delete'),
  'proposals', JSON_ARRAY('view', 'create', 'edit', 'delete'),
  'domains', JSON_ARRAY('view', 'edit'),
  'email', JSON_ARRAY('view', 'send'),
  'server', JSON_ARRAY('view', 'manage')
), TRUE),
(UUID(), 'Support', 'Handle customer tickets and view orders', JSON_OBJECT(
  'users', JSON_ARRAY('view'),
  'orders', JSON_ARRAY('view'),
  'tickets', JSON_ARRAY('view', 'reply', 'close'),
  'invoices', JSON_ARRAY('view')
), TRUE),
(UUID(), 'Sales', 'Manage orders, invoices, and proposals', JSON_OBJECT(
  'users', JSON_ARRAY('view'),
  'orders', JSON_ARRAY('view', 'create', 'edit'),
  'tickets', JSON_ARRAY('view'),
  'invoices', JSON_ARRAY('view', 'create', 'edit'),
  'proposals', JSON_ARRAY('view', 'create', 'edit')
), TRUE);
