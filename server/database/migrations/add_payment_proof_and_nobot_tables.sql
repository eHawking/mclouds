-- Add payment_proof column to orders table
ALTER TABLE orders ADD COLUMN payment_proof VARCHAR(500) AFTER payment_reference;

-- Update payment_status enum to include 'pending'
ALTER TABLE orders MODIFY COLUMN payment_status ENUM('pending', 'unpaid', 'paid', 'partial', 'refunded') DEFAULT 'unpaid';

-- Create NoBot Settings table
CREATE TABLE IF NOT EXISTS nobot_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'string',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create NoBot Services table (user's bot instances)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create NoBot Conversations table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create NoBot Messages table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Email Logs table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
