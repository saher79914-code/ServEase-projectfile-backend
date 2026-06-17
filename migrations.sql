-- ═══════════════════════════════════════════════════════
-- ServEase — New Tables Migration
-- Run these in your MySQL database
-- ═══════════════════════════════════════════════════════

-- 1. OTP Table (Email Verification on Registration)
CREATE TABLE IF NOT EXISTS email_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- 2. Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_token (token)
);

-- 3. App Settings Table (Admin Settings)
CREATE TABLE IF NOT EXISTS app_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  security_deposit_amount DECIMAL(10,2) DEFAULT 2000.00,
  security_deposit_required BOOLEAN DEFAULT TRUE,
  app_name VARCHAR(100) DEFAULT 'ServEase',
  support_email VARCHAR(255) DEFAULT 'adminservease@gmail.com',
  support_phone VARCHAR(20) DEFAULT '',
  terms_and_conditions TEXT,
  notify_new_booking BOOLEAN DEFAULT TRUE,
  notify_new_registration BOOLEAN DEFAULT TRUE,
  notify_complaint BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings row
INSERT IGNORE INTO app_settings (id, commission_rate, security_deposit_amount, security_deposit_required, app_name, support_email)
VALUES (1, 10.00, 2000.00, TRUE, 'ServEase', 'adminservease@gmail.com');
