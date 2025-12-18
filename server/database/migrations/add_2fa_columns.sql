-- Two-Factor Authentication columns for users table
-- Run this migration to add 2FA support

ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255) DEFAULT NULL;

-- Index for faster 2FA checks during login
CREATE INDEX IF NOT EXISTS idx_users_two_factor ON users (email, two_factor_enabled);
