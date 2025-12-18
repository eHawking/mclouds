-- =============================================================
-- Magnetic Clouds - Migration: Logo Settings & Email Logs
-- Run this in your MariaDB/MySQL database
-- =============================================================

-- 1. Email Logs Table (for tracking all sent emails)
-- =============================================================
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

-- 2. Settings table adjustment (add value_type column if missing)
-- =============================================================
ALTER TABLE settings ADD COLUMN IF NOT EXISTS value_type VARCHAR(50) DEFAULT 'string';

-- 3. Insert default logo height settings (optional - these get created automatically)
-- =============================================================
INSERT INTO settings (setting_key, setting_value, setting_type, category, is_public)
VALUES 
  ('header_logo_height', '40', 'string', 'branding', TRUE),
  ('footer_logo_height', '40', 'string', 'branding', TRUE)
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- 4. Insert default Mailgun settings (empty - admin needs to configure)
-- =============================================================
INSERT INTO settings (setting_key, setting_value, setting_type, category, is_public)
VALUES 
  ('mailgun_enabled', 'false', 'boolean', 'email', FALSE),
  ('mailgun_api_key', '', 'string', 'email', FALSE),
  ('mailgun_domain', '', 'string', 'email', FALSE),
  ('mailgun_from_email', '', 'string', 'email', FALSE),
  ('mailgun_from_name', 'Magnetic Clouds', 'string', 'email', FALSE),
  ('mailgun_region', 'us', 'string', 'email', FALSE)
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- 5. Email notification toggles (enabled by default)
-- =============================================================
INSERT INTO settings (setting_key, setting_value, value_type, category, is_public)
VALUES 
  ('welcome_email', 'true', 'boolean', 'email', FALSE),
  ('password_reset', 'true', 'boolean', 'email', FALSE),
  ('order_placed', 'true', 'boolean', 'email', FALSE),
  ('order_confirmed', 'true', 'boolean', 'email', FALSE),
  ('order_completed', 'true', 'boolean', 'email', FALSE),
  ('order_cancelled', 'true', 'boolean', 'email', FALSE),
  ('ticket_created', 'true', 'boolean', 'email', FALSE),
  ('ticket_replied', 'true', 'boolean', 'email', FALSE),
  ('ticket_closed', 'true', 'boolean', 'email', FALSE),
  ('invoice_generated', 'true', 'boolean', 'email', FALSE),
  ('payment_received', 'true', 'boolean', 'email', FALSE),
  ('service_expiring', 'true', 'boolean', 'email', FALSE),
  ('service_suspended', 'true', 'boolean', 'email', FALSE)
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- =============================================================
-- Done! All new tables and settings are now in place.
-- =============================================================
