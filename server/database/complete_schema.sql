-- Magnetic Clouds Complete Database Schema
-- Run this SQL script to create the entire database from scratch
-- Compatible with MySQL/MariaDB

-- Create database
CREATE DATABASE IF NOT EXISTS magnetic_clouds CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE magnetic_clouds;

-- ============================================
-- ADMIN ROLES & PERMISSIONS
-- ============================================

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

-- ============================================
-- USERS
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  company VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Bangladesh',
  postal_code VARCHAR(20),
  avatar VARCHAR(500),
  role ENUM('user', 'admin', 'support') DEFAULT 'user',
  role_id INT DEFAULT NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires DATETIME,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  preferred_language VARCHAR(10) DEFAULT 'en',
  preferred_currency VARCHAR(10) DEFAULT 'USD',
  last_login DATETIME,
  google_id VARCHAR(255) DEFAULT NULL,
  github_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_uuid (uuid),
  INDEX idx_role (role),
  INDEX idx_google_id (google_id),
  INDEX idx_github_id (github_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- ============================================
-- PRODUCTS & CATEGORIES
-- ============================================

CREATE TABLE IF NOT EXISTS product_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  parent_id INT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  category_id INT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  features JSON,
  specifications JSON,
  price_monthly DECIMAL(10,2),
  price_quarterly DECIMAL(10,2),
  price_semiannual DECIMAL(10,2),
  price_annual DECIMAL(10,2),
  price_biennial DECIMAL(10,2),
  price_triennial DECIMAL(10,2),
  setup_fee DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  stock INT DEFAULT -1,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
  INDEX idx_category (category_id),
  INDEX idx_slug (slug),
  INDEX idx_active (is_active)
);

-- ============================================
-- DOMAINS
-- ============================================

CREATE TABLE IF NOT EXISTS domain_tlds (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tld VARCHAR(50) UNIQUE NOT NULL,
  price_register DECIMAL(10,2) NOT NULL,
  price_renew DECIMAL(10,2) NOT NULL,
  price_transfer DECIMAL(10,2) NOT NULL,
  min_years INT DEFAULT 1,
  max_years INT DEFAULT 10,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  promo_price DECIMAL(10,2),
  promo_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending', 'processing', 'active', 'completed', 'cancelled', 'refunded', 'fraud') DEFAULT 'pending',
  payment_status ENUM('pending', 'unpaid', 'paid', 'partial', 'refunded') DEFAULT 'unpaid',
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  payment_proof VARCHAR(500),
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  billing_address JSON,
  notes TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_order_number (order_number)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(255) NOT NULL,
  product_type ENUM('hosting', 'domain', 'ssl', 'email', 'backup', 'addon') NOT NULL,
  domain_name VARCHAR(255),
  billing_cycle VARCHAR(50),
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'active', 'suspended', 'cancelled', 'terminated') DEFAULT 'pending',
  expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ============================================
-- SERVICES
-- ============================================

CREATE TABLE IF NOT EXISTS services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  order_item_id INT,
  product_id INT,
  service_type ENUM('hosting', 'domain', 'ssl', 'email', 'backup', 'vps', 'dedicated') NOT NULL,
  name VARCHAR(255) NOT NULL,
  domain_name VARCHAR(255),
  username VARCHAR(100),
  password_encrypted VARCHAR(255),
  server_id INT,
  ip_address VARCHAR(45),
  status ENUM('pending', 'active', 'suspended', 'cancelled', 'terminated') DEFAULT 'pending',
  billing_cycle VARCHAR(50),
  amount DECIMAL(10,2),
  next_due_date DATE,
  registration_date DATE,
  expires_at DATE,
  auto_renew BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_type (service_type)
);

-- ============================================
-- PROPOSALS
-- ============================================

CREATE TABLE IF NOT EXISTS proposals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  proposal_number VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  items JSON NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
  tax DECIMAL(5,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  terms TEXT,
  valid_until DATE NOT NULL,
  template VARCHAR(50) DEFAULT 'modern',
  bank_method VARCHAR(50) DEFAULT 'bank_transfer',
  status ENUM('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired') DEFAULT 'draft',
  sent_at DATETIME,
  viewed_at DATETIME,
  accepted_at DATETIME,
  rejected_at DATETIME,
  reject_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- SUPPORT TICKETS
-- ============================================

CREATE TABLE IF NOT EXISTS tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  service_id INT,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  department ENUM('sales', 'billing', 'technical', 'general') DEFAULT 'general',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  subject VARCHAR(255) NOT NULL,
  status ENUM('open', 'answered', 'customer-reply', 'on-hold', 'in-progress', 'closed') DEFAULT 'open',
  assigned_to INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS ticket_replies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT NOT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  attachments JSON,
  is_staff_reply BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- INVOICES & TRANSACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  order_id INT,
  proposal_id INT,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('draft', 'unpaid', 'paid', 'cancelled', 'refunded') DEFAULT 'unpaid',
  due_date DATE NOT NULL,
  paid_date DATE,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  invoice_id INT,
  order_id INT,
  type ENUM('payment', 'refund', 'credit', 'debit') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_method VARCHAR(50),
  gateway_reference VARCHAR(255),
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- ============================================
-- COUPONS
-- ============================================

CREATE TABLE IF NOT EXISTS coupons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('percentage', 'fixed') NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  applicable_products JSON,
  applicable_categories JSON,
  starts_at DATETIME,
  expires_at DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  category VARCHAR(50) DEFAULT 'general',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- PAGES (CMS)
-- ============================================

CREATE TABLE IF NOT EXISTS pages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TRANSLATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS translations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  locale VARCHAR(10) NOT NULL,
  translation_key VARCHAR(255) NOT NULL,
  translation_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_translation (locale, translation_key),
  INDEX idx_locale (locale)
);

-- ============================================
-- DATACENTERS
-- ============================================

CREATE TABLE IF NOT EXISTS datacenters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  country_code VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  features JSON,
  image VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- ACTIVITY LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
);

-- ============================================
-- MEDIA LIBRARY
-- ============================================

CREATE TABLE IF NOT EXISTS media (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  path VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  title VARCHAR(255),
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- ANNOUNCEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
  is_active BOOLEAN DEFAULT TRUE,
  show_on_dashboard BOOLEAN DEFAULT TRUE,
  show_on_home BOOLEAN DEFAULT FALSE,
  starts_at DATETIME,
  expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- KNOWLEDGE BASE
-- ============================================

CREATE TABLE IF NOT EXISTS kb_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  parent_id INT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES kb_categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS kb_articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content LONGTEXT NOT NULL,
  views INT DEFAULT 0,
  helpful_yes INT DEFAULT 0,
  helpful_no INT DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES kb_categories(id) ON DELETE SET NULL
);

-- ============================================
-- NOBOT (AI CHATBOT)
-- ============================================

CREATE TABLE IF NOT EXISTS nobot_services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  service_id INT,
  bot_type ENUM('whatsapp', 'messenger', 'instagram', 'all') NOT NULL,
  plan_name VARCHAR(255),
  domain VARCHAR(255),
  website_url VARCHAR(500),
  status ENUM('pending_setup', 'training', 'trained', 'active', 'suspended', 'cancelled') DEFAULT 'pending_setup',
  setup_step INT DEFAULT 1,
  training_data LONGTEXT,
  training_method ENUM('website', 'file', 'manual') DEFAULT 'website',
  training_status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
  trained_at DATETIME,
  gemini_model VARCHAR(100) DEFAULT 'gemini-pro',
  widget_installed BOOLEAN DEFAULT FALSE,
  widget_verified BOOLEAN DEFAULT FALSE,
  widget_platform VARCHAR(50),
  whatsapp_connected BOOLEAN DEFAULT FALSE,
  whatsapp_phone VARCHAR(50),
  messenger_connected BOOLEAN DEFAULT FALSE,
  messenger_page_id VARCHAR(100),
  instagram_connected BOOLEAN DEFAULT FALSE,
  instagram_account_id VARCHAR(100),
  custom_settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_bot_type (bot_type)
);

CREATE TABLE IF NOT EXISTS nobot_conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  nobot_service_id INT NOT NULL,
  platform ENUM('website', 'whatsapp', 'messenger', 'instagram') NOT NULL,
  visitor_id VARCHAR(100),
  visitor_name VARCHAR(255),
  visitor_email VARCHAR(255),
  visitor_phone VARCHAR(50),
  status ENUM('active', 'closed', 'archived') DEFAULT 'active',
  unread_count INT DEFAULT 0,
  last_message_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (nobot_service_id) REFERENCES nobot_services(id) ON DELETE CASCADE,
  INDEX idx_nobot_service (nobot_service_id),
  INDEX idx_status (status),
  INDEX idx_last_message (last_message_at)
);

CREATE TABLE IF NOT EXISTS nobot_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_type ENUM('visitor', 'bot', 'human') NOT NULL,
  message TEXT NOT NULL,
  attachments JSON,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES nobot_conversations(id) ON DELETE CASCADE,
  INDEX idx_conversation (conversation_id),
  INDEX idx_created (created_at)
);

CREATE TABLE IF NOT EXISTS nobot_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'string',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- EMAIL LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS email_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  user_id INT,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  template VARCHAR(100),
  html_content LONGTEXT NOT NULL,
  text_content TEXT,
  status ENUM('pending', 'sent', 'failed', 'bounced') DEFAULT 'pending',
  error_message TEXT,
  opened_at DATETIME,
  clicked_at DATETIME,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_recipient (recipient_email),
  INDEX idx_status (status),
  INDEX idx_created (created_at),
  INDEX idx_user (user_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS admin_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  type ENUM('order', 'payment', 'ticket', 'user', 'service', 'proposal', 'invoice', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(50),
  link VARCHAR(500),
  metadata JSON,
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS user_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  type ENUM('order', 'payment', 'ticket', 'service', 'proposal', 'invoice', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(50),
  link VARCHAR(500),
  metadata JSON,
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- INSERT DEFAULT ROLES
-- ============================================

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

-- ============================================
-- INSERT DEFAULT ADMIN USER
-- ============================================

-- Password: Admin@123 (bcrypt hashed)
INSERT INTO users (uuid, email, password, first_name, last_name, role, status) VALUES
('admin-001', 'admin@magnetic-clouds.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4o/YxMzVn5MRvtXe', 'Admin', 'User', 'admin', 'active');
