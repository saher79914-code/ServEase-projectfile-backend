-- ═══════════════════════════════════════════════════════
-- ServEase — Complete Database Schema Migration
-- Run these in your MySQL database (e.g., auth_db)
-- ═══════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  cnic VARCHAR(20) UNIQUE,
  address TEXT,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'provider', 'admin') NOT NULL,
  is_blocked TINYINT(1) DEFAULT 0,
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Services Table
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  category VARCHAR(100),
  icon VARCHAR(10) DEFAULT '🔧',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Provider Profiles Table
CREATE TABLE IF NOT EXISTS provider_profiles (
  user_id INT PRIMARY KEY,
  service_id INT,
  years_of_experience INT DEFAULT 0,
  bio TEXT,
  cnic_front_image VARCHAR(255),
  cnic_back_image VARCHAR(255),
  approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rating DECIMAL(3,2) DEFAULT 0.00,
  hourly_rate DECIMAL(10,2) DEFAULT 0.00,
  security_deposit_status ENUM('submitted', 'verified', 'rejected') DEFAULT 'submitted',
  security_deposit_screenshot VARCHAR(255),
  security_deposit_method VARCHAR(50),
  pending_commission DECIMAL(10,2) DEFAULT 0.00,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  provider_id INT NOT NULL,
  service_id INT,
  scheduled_date VARCHAR(50) NOT NULL,
  scheduled_time VARCHAR(50) NOT NULL,
  location TEXT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'accepted', 'declined', 'on_the_way', 'in_progress', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role ENUM('customer', 'provider', 'admin') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('verification', 'complaint', 'system', 'booking', 'admin') DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  booking_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'warned', 'blocked', 'dismissed') DEFAULT 'pending',
  admin_response TEXT,
  against_user_id INT NOT NULL,
  complainant_role ENUM('customer', 'provider') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (against_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  provider_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Commission Payments Table
CREATE TABLE IF NOT EXISTS commission_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  screenshot VARCHAR(255),
  status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Email OTPs Table
CREATE TABLE IF NOT EXISTS email_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- 10. Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_token (token)
);

-- 11. App Settings Table
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

-- 12. Custom Service Requests Table
CREATE TABLE IF NOT EXISTS service_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider_id INT NOT NULL,
  provider_name VARCHAR(255),
  provider_email VARCHAR(255),
  service_name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  custom_category VARCHAR(255),
  description TEXT,
  years_of_experience INT DEFAULT 0,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);
