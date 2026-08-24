-- ====================================================
-- ServEase Database Full Export (Schema + Data)
-- Database: auth_db
-- Generated At: 2026-08-22T07:02:48.139Z
-- ====================================================

CREATE DATABASE IF NOT EXISTS `auth_db`;
USE `auth_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------
-- Table structure for `admin_logs`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `admin_logs`;
CREATE TABLE `admin_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action` varchar(255) DEFAULT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------
-- Table structure for `app_settings`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `app_settings`;
CREATE TABLE `app_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `commission_rate` decimal(5,2) DEFAULT '10.00',
  `security_deposit_amount` decimal(10,2) DEFAULT '2000.00',
  `security_deposit_required` tinyint(1) DEFAULT '1',
  `app_name` varchar(100) DEFAULT 'ServEase',
  `support_email` varchar(255) DEFAULT 'adminservease@gmail.com',
  `support_phone` varchar(20) DEFAULT '',
  `terms_and_conditions` text,
  `notify_new_booking` tinyint(1) DEFAULT '1',
  `notify_new_registration` tinyint(1) DEFAULT '1',
  `notify_complaint` tinyint(1) DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `app_settings` (1 rows)
INSERT INTO `app_settings` (`id`, `commission_rate`, `security_deposit_amount`, `security_deposit_required`, `app_name`, `support_email`, `support_phone`, `terms_and_conditions`, `notify_new_booking`, `notify_new_registration`, `notify_complaint`, `updated_at`) VALUES (1, '10.00', '500.00', 1, 'ServEase', 'adminservease@gmail.com', '03147549904', '', 1, 1, 1, '2026-08-19 23:23:51');

-- ----------------------------------------------------
-- Table structure for `bookings`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `provider_id` int NOT NULL,
  `service_id` int NOT NULL,
  `booking_date` datetime DEFAULT NULL,
  `status` enum('pending','accepted','declined','on_the_way','in_progress','completed') DEFAULT 'pending',
  `total_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `scheduled_date` date DEFAULT NULL,
  `scheduled_time` time DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `provider_id` (`provider_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `bookings` (2 rows)
INSERT INTO `bookings` (`id`, `customer_id`, `provider_id`, `service_id`, `booking_date`, `status`, `total_price`, `created_at`, `scheduled_date`, `scheduled_time`, `location`) VALUES (52, 72, 71, 19, NULL, 'pending', '250.00', '2026-07-02 11:42:48', '2026-07-03 00:00:00', '09:00:00', 'kamoki');
INSERT INTO `bookings` (`id`, `customer_id`, `provider_id`, `service_id`, `booking_date`, `status`, `total_price`, `created_at`, `scheduled_date`, `scheduled_time`, `location`) VALUES (53, 73, 71, 19, NULL, 'pending', '250.00', '2026-07-02 11:53:32', '2026-07-03 00:00:00', '09:00:00', 'kamoki');

-- ----------------------------------------------------
-- Table structure for `commission_payments`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `commission_payments`;
CREATE TABLE `commission_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `screenshot` varchar(255) DEFAULT NULL,
  `status` enum('pending','verified','rejected') DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `provider_id` (`provider_id`),
  CONSTRAINT `commission_payments_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------
-- Table structure for `complaints`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `complaints`;
CREATE TABLE `complaints` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `booking_id` int DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `message` text,
  `status` enum('pending','in_progress','resolved','warned','blocked','dismissed') DEFAULT 'pending',
  `admin_response` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `against_user_id` int DEFAULT NULL,
  `complainant_role` enum('customer','provider') NOT NULL DEFAULT 'customer',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `complaints_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------
-- Table structure for `customers`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `cnic` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'customer',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `cnic` (`cnic`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------
-- Table structure for `email_otps`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `email_otps`;
CREATE TABLE `email_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `email_otps` (3 rows)
INSERT INTO `email_otps` (`id`, `email`, `otp`, `expires_at`, `created_at`) VALUES (65, 'insaseemab212@gmail.com', '872734', '2026-07-02 07:44:01', '2026-07-02 12:34:00');
INSERT INTO `email_otps` (`id`, `email`, `otp`, `expires_at`, `created_at`) VALUES (72, 'benish87@gmail.com', '899914', '2026-07-03 12:49:43', '2026-07-03 17:39:42');
INSERT INTO `email_otps` (`id`, `email`, `otp`, `expires_at`, `created_at`) VALUES (76, 'zoha51013@gmail.com', '212781', '2026-07-03 14:42:33', '2026-07-03 19:32:32');

-- ----------------------------------------------------
-- Table structure for `notifications`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `message` text,
  `type` enum('verification','complaint','system','booking','admin') DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role` enum('customer','provider') NOT NULL DEFAULT 'customer',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=167 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `notifications` (8 rows)
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`, `role`) VALUES (159, 70, 'Security Deposit Verified', 'Your security deposit has been verified. You can now accept jobs!', 'admin', 1, '2026-07-02 11:32:50', 'provider');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`, `role`) VALUES (160, 72, 'Booking Submitted', 'Your booking request has been sent to the provider.', 'booking', 0, '2026-07-02 11:42:48', 'customer');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`, `role`) VALUES (161, 71, 'New Booking Request', 'You have a new booking request. Check your jobs.', 'booking', 0, '2026-07-02 11:42:48', 'provider');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`, `role`) VALUES (162, 73, 'Booking Submitted', 'Your booking request has been sent to the provider.', 'booking', 0, '2026-07-02 11:53:32', 'customer');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`, `role`) VALUES (163, 71, 'New Booking Request', 'You have a new booking request. Check your jobs.', 'booking', 0, '2026-07-02 11:53:32', 'provider');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`, `role`) VALUES (164, 79, 'Security Deposit Verified', 'Your security deposit has been verified. You can now accept jobs!', 'admin', 0, '2026-07-02 21:36:38', 'provider');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`, `role`) VALUES (165, NULL, 'wellcome', 'wellcome new provides', 'admin', 1, '2026-07-04 16:55:49', 'provider');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`, `role`) VALUES (166, NULL, 'wellcome', 'wellcome provider in our plateform servease', 'admin', 0, '2026-07-04 16:58:58', 'provider');

-- ----------------------------------------------------
-- Table structure for `password_resets`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_token` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `password_resets` (2 rows)
INSERT INTO `password_resets` (`id`, `email`, `token`, `expires_at`, `created_at`) VALUES (17, 'benishbatoolkmk@gmail.com', '154faad2171b09b4d63d99bc8fcbbb31e72ae938c1989f89c08b1330f8ccc705', '2026-07-03 13:27:02', '2026-07-03 17:57:01');
INSERT INTO `password_resets` (`id`, `email`, `token`, `expires_at`, `created_at`) VALUES (20, 'ayeshaliaquatali37@gmail.com', '7e8cf1f82959b258e24768a8ea8fe201858bf1d70c8583393b1e463f4353077b', '2026-08-12 17:26:27', '2026-08-12 16:56:27');

-- ----------------------------------------------------
-- Table structure for `payment`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `payment`;
CREATE TABLE `payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `status` enum('pending','paid','failed') DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `payment_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------
-- Table structure for `provider_profiles`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `provider_profiles`;
CREATE TABLE `provider_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `service_id` int DEFAULT NULL,
  `years_of_experience` int DEFAULT '0',
  `bio` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `cnic_image` varchar(255) DEFAULT NULL,
  `rating` decimal(3,2) NOT NULL DEFAULT '0.00',
  `hourly_rate` decimal(10,2) DEFAULT '0.00',
  `commission_rate` decimal(5,2) NOT NULL DEFAULT '10.00',
  `pending_commission` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cnic_front_image` varchar(255) DEFAULT NULL,
  `cnic_back_image` varchar(255) DEFAULT NULL,
  `security_deposit_status` enum('pending','submitted','verified','rejected') DEFAULT 'pending',
  `security_deposit_screenshot` varchar(255) DEFAULT NULL,
  `security_deposit_method` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `provider_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `provider_profiles_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `provider_profiles` (10 rows)
INSERT INTO `provider_profiles` (`id`, `user_id`, `service_id`, `years_of_experience`, `bio`, `created_at`, `approval_status`, `cnic_image`, `rating`, `hourly_rate`, `commission_rate`, `pending_commission`, `cnic_front_image`, `cnic_back_image`, `security_deposit_status`, `security_deposit_screenshot`, `security_deposit_method`) VALUES (39, 70, NULL, 8, 'Professional Mehndi Artist \nI am a passionate and professional Mehndi Artist dedicated to creating elegant, intricate, and customized henna designs for every occasion. Specializing in bridal, festive, Arabic, Indo-Arabic, and contemporary mehndi styles, I strive to deliver beautiful, long-lasting designs that reflect each client\'s unique personality and celebration.\nWith a strong focus on creativity, precision, and client satisfaction, I use high-quality, natural henna to ensure a rich stain and a safe, enjoyable experience. Whether it\'s a wedding, engagement, Eid, baby shower, or special event, my goal is to make every moment more memorable with timeless henna artistry.\nLet\'s turn your special occasions into beautiful memories one design at a time.', '2026-07-02 11:13:57', 'approved', NULL, '0.00', '0.00', '10.00', '0.00', '/uploads/cnic/1782972837199-269678034.jpg', '/uploads/cnic/1782972837200-685875049.jpg', 'verified', '1782973629239-375751236.png', 'JazzCash');
INSERT INTO `provider_profiles` (`id`, `user_id`, `service_id`, `years_of_experience`, `bio`, `created_at`, `approval_status`, `cnic_image`, `rating`, `hourly_rate`, `commission_rate`, `pending_commission`, `cnic_front_image`, `cnic_back_image`, `security_deposit_status`, `security_deposit_screenshot`, `security_deposit_method`) VALUES (40, 71, 19, 5, 'Handcrafted luxury embroidery for bridal, festive & custom designs. Where tradition meets detail.', '2026-07-02 11:32:23', 'approved', NULL, '0.00', '250.00', '10.00', '0.00', '/uploads/cnic/1782973942803-154569553.jpg', '/uploads/cnic/1782973942804-498535987.jpg', 'pending', NULL, NULL);
INSERT INTO `provider_profiles` (`id`, `user_id`, `service_id`, `years_of_experience`, `bio`, `created_at`, `approval_status`, `cnic_image`, `rating`, `hourly_rate`, `commission_rate`, `pending_commission`, `cnic_front_image`, `cnic_back_image`, `security_deposit_status`, `security_deposit_screenshot`, `security_deposit_method`) VALUES (41, 74, 23, 6, 'I\'m pro teacher with good experience and how to create new content how to manage class students🥰', '2026-07-02 12:11:37', 'approved', NULL, '0.00', '350.00', '10.00', '0.00', '/uploads/cnic/1782976296781-577792216.jpg', '/uploads/cnic/1782976296782-439121863.jpg', 'pending', NULL, NULL);
INSERT INTO `provider_profiles` (`id`, `user_id`, `service_id`, `years_of_experience`, `bio`, `created_at`, `approval_status`, `cnic_image`, `rating`, `hourly_rate`, `commission_rate`, `pending_commission`, `cnic_front_image`, `cnic_back_image`, `security_deposit_status`, `security_deposit_screenshot`, `security_deposit_method`) VALUES (42, 75, 24, 5, 'beautiful Makeup Artist', '2026-07-02 12:36:55', 'approved', NULL, '0.00', '0.00', '10.00', '0.00', '/uploads/cnic/1782977815152-308431928.jpg', '/uploads/cnic/1782977815154-959879694.jpg', 'pending', NULL, NULL);
INSERT INTO `provider_profiles` (`id`, `user_id`, `service_id`, `years_of_experience`, `bio`, `created_at`, `approval_status`, `cnic_image`, `rating`, `hourly_rate`, `commission_rate`, `pending_commission`, `cnic_front_image`, `cnic_back_image`, `security_deposit_status`, `security_deposit_screenshot`, `security_deposit_method`) VALUES (43, 77, 24, 2, 'normal beautician', '2026-07-02 12:56:36', 'approved', NULL, '0.00', '0.00', '10.00', '0.00', '/uploads/cnic/1782978996490-745336316.jpg', '/uploads/cnic/1782978996492-52990862.jpg', 'pending', NULL, NULL);
INSERT INTO `provider_profiles` (`id`, `user_id`, `service_id`, `years_of_experience`, `bio`, `created_at`, `approval_status`, `cnic_image`, `rating`, `hourly_rate`, `commission_rate`, `pending_commission`, `cnic_front_image`, `cnic_back_image`, `security_deposit_status`, `security_deposit_screenshot`, `security_deposit_method`) VALUES (44, 78, 23, 5, 'unique acmdi ma 5 year many courses karya h', '2026-07-02 16:15:02', 'approved', NULL, '0.00', '0.00', '10.00', '0.00', '/uploads/cnic/1782990901975-841955787.jpg', '/uploads/cnic/1782990901983-635552306.jpg', 'pending', NULL, NULL);
INSERT INTO `provider_profiles` (`id`, `user_id`, `service_id`, `years_of_experience`, `bio`, `created_at`, `approval_status`, `cnic_image`, `rating`, `hourly_rate`, `commission_rate`, `pending_commission`, `cnic_front_image`, `cnic_back_image`, `security_deposit_status`, `security_deposit_screenshot`, `security_deposit_method`) VALUES (45, 79, 19, 5, 'I am interested  embroidery and professional in this service', '2026-07-02 21:07:34', 'approved', NULL, '0.00', '0.00', '10.00', '0.00', '/uploads/cnic/1783008454488-481905503.jpg', '/uploads/cnic/1783008454489-541824542.jpg', 'verified', '1783009398219-263587038.jpg', 'JazzCash');
INSERT INTO `provider_profiles` (`id`, `user_id`, `service_id`, `years_of_experience`, `bio`, `created_at`, `approval_status`, `cnic_image`, `rating`, `hourly_rate`, `commission_rate`, `pending_commission`, `cnic_front_image`, `cnic_back_image`, `security_deposit_status`, `security_deposit_screenshot`, `security_deposit_method`) VALUES (46, 80, 23, 1, 'IT', '2026-07-03 17:35:50', 'approved', NULL, '0.00', '0.00', '10.00', '0.00', '/uploads/cnic/1783082150357-342086901.jpg', '/uploads/cnic/1783082150359-551685125.jpg', 'pending', NULL, NULL);
INSERT INTO `provider_profiles` (`id`, `user_id`, `service_id`, `years_of_experience`, `bio`, `created_at`, `approval_status`, `cnic_image`, `rating`, `hourly_rate`, `commission_rate`, `pending_commission`, `cnic_front_image`, `cnic_back_image`, `security_deposit_status`, `security_deposit_screenshot`, `security_deposit_method`) VALUES (48, 82, 23, 2, 'Improveing Understanding', '2026-07-03 19:13:25', 'approved', NULL, '0.00', '0.00', '10.00', '0.00', '/uploads/cnic/1783088005230-685919143.jpg', '/uploads/cnic/1783088005230-311468541.jpg', 'pending', NULL, NULL);
INSERT INTO `provider_profiles` (`id`, `user_id`, `service_id`, `years_of_experience`, `bio`, `created_at`, `approval_status`, `cnic_image`, `rating`, `hourly_rate`, `commission_rate`, `pending_commission`, `cnic_front_image`, `cnic_back_image`, `security_deposit_status`, `security_deposit_screenshot`, `security_deposit_method`) VALUES (49, 83, 25, 5, 'My favorite hobby 😊', '2026-07-04 14:26:44', 'approved', NULL, '0.00', '0.00', '10.00', '0.00', '/uploads/cnic/1783157204245-540664773.jpg', '/uploads/cnic/1783157204247-549757531.jpg', 'pending', NULL, NULL);

-- ----------------------------------------------------
-- Table structure for `provider_services`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `provider_services`;
CREATE TABLE `provider_services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `service_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `provider_services_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `provider_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------
-- Table structure for `ratings`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `ratings`;
CREATE TABLE `ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `provider_id` int NOT NULL,
  `rating` tinyint NOT NULL,
  `note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_booking_rating` (`booking_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------
-- Table structure for `service_requests`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `service_requests`;
CREATE TABLE `service_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider_id` int NOT NULL,
  `provider_name` varchar(255) DEFAULT NULL,
  `provider_email` varchar(255) DEFAULT NULL,
  `service_name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `custom_category` varchar(255) DEFAULT NULL,
  `description` text,
  `years_of_experience` int DEFAULT '0',
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_provider` (`provider_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------
-- Table structure for `services`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `price` int DEFAULT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `services` (12 rows)
INSERT INTO `services` (`id`, `name`, `description`, `price`, `category`, `icon`, `is_active`) VALUES (7, 'teacher', 'computer subject master', 1000, 'Fashion', '📚', 1);
INSERT INTO `services` (`id`, `name`, `description`, `price`, `category`, `icon`, `is_active`) VALUES (19, 'Embroidery', 'kapry seelwa lo', 20, 'Beauty', '🪡', 1);
INSERT INTO `services` (`id`, `name`, `description`, `price`, `category`, `icon`, `is_active`) VALUES (20, 'Tailoring', NULL, 500, 'Home Services', '✂️', 1);
INSERT INTO `services` (`id`, `name`, `description`, `price`, `category`, `icon`, `is_active`) VALUES (21, 'Embroidery', NULL, 0, 'Home Services', '🪡', 1);
INSERT INTO `services` (`id`, `name`, `description`, `price`, `category`, `icon`, `is_active`) VALUES (22, 'Cleaning', NULL, 0, 'Home Services', '🧹', 1);
INSERT INTO `services` (`id`, `name`, `description`, `price`, `category`, `icon`, `is_active`) VALUES (23, 'Tutoring', NULL, 8000, 'Education', '📚', 1);
INSERT INTO `services` (`id`, `name`, `description`, `price`, `category`, `icon`, `is_active`) VALUES (24, 'Beauty', NULL, 0, 'Beauty & Care', '💄', 1);
INSERT INTO `services` (`id`, `name`, `description`, `price`, `category`, `icon`, `is_active`) VALUES (25, 'Mehndi', NULL, 0, 'Beauty & Care', '🌸', 1);
INSERT INTO `services` (`id`, `name`, `description`, `price`, `category`, `icon`, `is_active`) VALUES (26, 'Baby Sitter', NULL, 0, 'Child Care', '👶', 1);
INSERT INTO `services` (`id`, `name`, `description`, `price`, `category`, `icon`, `is_active`) VALUES (27, 'Photography', NULL, 5000, 'Media', '📸', 1);
INSERT INTO `services` (`id`, `name`, `description`, `price`, `category`, `icon`, `is_active`) VALUES (28, 'moter machine', NULL, 500, 'machine', '🔧', 1);
INSERT INTO `services` (`id`, `name`, `description`, `price`, `category`, `icon`, `is_active`) VALUES (29, 'Tailoring', '', 0, 'Fashion', '🧵', 1);

-- ----------------------------------------------------
-- Table structure for `users`
-- ----------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `cnic` varchar(20) DEFAULT NULL,
  `address` text,
  `password` varchar(255) NOT NULL,
  `role` enum('customer','provider','admin') NOT NULL DEFAULT 'customer',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_blocked` tinyint(1) DEFAULT '0',
  `profile_image` varchar(255) DEFAULT NULL,
  `status` enum('active','blocked') DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `cnic` (`cnic`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `users` (14 rows)
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `cnic`, `address`, `password`, `role`, `created_at`, `is_blocked`, `profile_image`, `status`) VALUES (3, 'Malik_AGE', 'adminservease@gmail.com', '03001009904', NULL, NULL, '$2b$10$6ThGvGiUYij14pUhaCS2Y.P6TJErExN2sqiT1Ypl4Gbl8SY3r5y0e', 'admin', '2026-05-18 11:51:35', 0, '/uploads/profile/1782893016183-821966453.jpeg', 'active');
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `cnic`, `address`, `password`, `role`, `created_at`, `is_blocked`, `profile_image`, `status`) VALUES (70, 'Atiya Tariq', 'atiyatariqali@gmail.com', '03279507149', '34102-9826724-6', 'kamoke', '$2b$12$zWcW2HoPzIGhoc2D2tpWPuSbqu3JH3nfKpXP9/hpuW8jD8QuyWzEW', 'provider', '2026-07-02 06:13:57', 0, NULL, 'active');
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `cnic`, `address`, `password`, `role`, `created_at`, `is_blocked`, `profile_image`, `status`) VALUES (71, 'saher', 'saher79914@gmail.com', '03471797382', '34102-6555111-0', 'kamoki', '$2b$12$RJuk3E1rmN154urS/lEUYedDBILC7BicV1S17MmwCTXv9BU9X.OBW', 'provider', '2026-07-02 06:32:23', 0, '/uploads/profile/1782974212659-420813787.jpg', 'active');
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `cnic`, `address`, `password`, `role`, `created_at`, `is_blocked`, `profile_image`, `status`) VALUES (72, 'sonia', 's01645912@gmail.com', '03471797384', '34102-6555222-0', 'kamoki', '$2b$12$uvGKt3Sn62We1SAyqVokcOzypYNAIXig9/abWiA5AHaEOnPYIyT42', 'customer', '2026-07-02 06:40:30', 0, '/uploads/profile/1782974514429-601587562.jpg', 'active');
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `cnic`, `address`, `password`, `role`, `created_at`, `is_blocked`, `profile_image`, `status`) VALUES (73, 'kiran', 's25050098@gmail.com', '03471797352', '34102-6777333-9', 'kamoki', '$2b$12$JxRCevcD1YSm51upNxpWCuPQ9yXvB9BOsAplNOSMEWKqEGFozOdP6', 'customer', '2026-07-02 06:49:59', 0, '/uploads/profile/1782975182923-469704727.jpg', 'active');
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `cnic`, `address`, `password`, `role`, `created_at`, `is_blocked`, `profile_image`, `status`) VALUES (74, 'Ayesha', 'ayeshaliaquatali37@gmail.com', '03471797386', '34102-9205204-0', 'kamoki', '$2b$12$cwrn2T5TxeXcfWQXSeey5.ZzTODmQZWfWWNYwDfY1twIZ51vd0hp6', 'provider', '2026-07-02 07:11:37', 0, '/uploads/profile/1782976391573-697200015.jpg', 'active');
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `cnic`, `address`, `password`, `role`, `created_at`, `is_blocked`, `profile_image`, `status`) VALUES (75, 'insa', 'seemabinsa@gmail.com', '03076408440', '34102-0584605-3', 'kamoke', '$2b$12$ao.VLWpKoZgh3DYFbTYVW.Fhnv7IHWOPZ5FSSnLzKd9X07HHxEPZy', 'provider', '2026-07-02 07:36:55', 0, NULL, 'active');
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `cnic`, `address`, `password`, `role`, `created_at`, `is_blocked`, `profile_image`, `status`) VALUES (76, 'zarmeen', 'zarmeenzainab06@gmail.com', '03267427733', '34102-5555575-0', 'model town', '$2b$12$GKeMiNEMmrdbRhVpQzdDIONcK6ZXgEW47a5qLKn73PNhsZ1oc/6NC', 'customer', '2026-07-02 07:56:35', 0, '/uploads/profile/1782979271254-184243534.jpg', 'active');
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `cnic`, `address`, `password`, `role`, `created_at`, `is_blocked`, `profile_image`, `status`) VALUES (77, 'Maham', 'u4701676@gmail.com', '03208400613', '34102-7805922-0', 'Tibba Muhammad Nagar kamoki', '$2b$12$StMEe/Ehq1hPmiDe8qxm4O7hBMQgftUgTbTgF6tLPXaAj9s01gvSy', 'provider', '2026-07-02 07:56:36', 0, NULL, 'active');
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `cnic`, `address`, `password`, `role`, `created_at`, `is_blocked`, `profile_image`, `status`) VALUES (78, 'Alishba', 'ghaniglassware0@gmail.com', '03223870328', '34102-3073111-8', 'adnan market kamoki', '$2b$12$YS5JhXinAEKKauofKEIgTel5qZk7RY8xEe6vk2B7BZNmxaA7ASS0O', 'provider', '2026-07-02 11:15:02', 0, NULL, 'active');
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `cnic`, `address`, `password`, `role`, `created_at`, `is_blocked`, `profile_image`, `status`) VALUES (79, 'Ayesha Farooq', 'ayesha079881@gmail.com', '03138112227', '34102-3990607-8', 'kamoki', '$2b$12$QziObFT20wzraSb/JWat4eOGKLQBZxKA38KNljCr/3FJ7tXpr0Ad6', 'provider', '2026-07-02 16:07:34', 0, NULL, 'active');
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `cnic`, `address`, `password`, `role`, `created_at`, `is_blocked`, `profile_image`, `status`) VALUES (80, 'maheen Arif', 'maheenarif939@gmail.com', '03037744185', '34102-6679404-8', 'kamoke', '$2b$12$OgkQmk1lg4iIWTJMDVAT4.h7VjyBAfPE9XHJrj89EbA6UamXLuLjK', 'provider', '2026-07-03 12:35:50', 0, NULL, 'active');
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `cnic`, `address`, `password`, `role`, `created_at`, `is_blocked`, `profile_image`, `status`) VALUES (82, 'Samia', 'samiairshad498@gmail.com', '03096740827', '35405-0794111-3', 'Sadhoke', '$2b$12$X1qx6Jv1BSTiEf/jpwVmEelvdNwsf6BmPMdaFaEHznKOTtKq/BQ2S', 'provider', '2026-07-03 14:13:25', 0, NULL, 'active');
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `cnic`, `address`, `password`, `role`, `created_at`, `is_blocked`, `profile_image`, `status`) VALUES (83, 'rukhsar', 'malikrukhsarwaris@gmail.com', '03041868606', '34102-0773697-8', 'mandyala ponich', '$2b$12$v1QOI0IVxPfsM.rQLLstHu3L7zWOJgTwRjnyDTyeeLqdcF6qWmbWu', 'provider', '2026-07-04 09:26:44', 0, NULL, 'active');

SET FOREIGN_KEY_CHECKS = 1;
