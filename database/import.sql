-- ============================================
-- NOWACZYK SALON PRO - Kompletny import bazy danych
-- ============================================
-- Instrukcja:
-- 1. Utwórz bazę danych w panelu hostingu
-- 2. Wybierz utworzoną bazę w phpMyAdmin
-- 3. Przejdź do zakładki "Import"
-- 4. Wybierz ten plik i kliknij "Wykonaj"
-- ============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ============================================
-- 1. Tabele
-- ============================================

-- Tabela: employees (Pracownicy)
CREATE TABLE IF NOT EXISTS `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `notification_email` varchar(255) DEFAULT NULL,
  `notification_phone` varchar(30) DEFAULT NULL,
  `role` enum('admin','employee') NOT NULL DEFAULT 'employee',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_active` (`is_active`, `deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: clients (Klienci)
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_phone` (`phone`),
  KEY `idx_email` (`email`),
  KEY `idx_active` (`is_active`, `deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: cars (Pojazdy)
CREATE TABLE IF NOT EXISTS `cars` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `plate_number` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_plate` (`plate_number`),
  CONSTRAINT `fk_cars_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: services (Usługi)
CREATE TABLE IF NOT EXISTS `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `duration` int(11) NOT NULL COMMENT 'Czas trwania w minutach',
  `price` decimal(10,2) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_active` (`is_active`, `deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: appointments (Wizyty)
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `status` enum('scheduled','in-progress','completed','cancelled','no-show') NOT NULL DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `extra_cost` decimal(10,2) DEFAULT NULL,
  `paid_amount` decimal(10,2) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_car_id` (`car_id`),
  KEY `idx_service_id` (`service_id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_date` (`date`),
  KEY `idx_status` (`status`),
  KEY `idx_date_status` (`date`, `status`),
  CONSTRAINT `fk_appointments_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_appointments_car` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_appointments_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_appointments_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: appointment_services (Usługi wizyt)
CREATE TABLE IF NOT EXISTS `appointment_services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appointment_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_appointment_service` (`appointment_id`, `service_id`),
  KEY `idx_appointment_id` (`appointment_id`),
  KEY `idx_service_id` (`service_id`),
  CONSTRAINT `fk_appointment_services_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appointment_services_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: notifications (Powiadomienia)
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appointment_id` int(11) NOT NULL,
  `type` enum('reminder-24h','reminder-2h','reschedule','custom') NOT NULL,
  `channel` enum('sms','email') NOT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_appointment_id` (`appointment_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_notifications_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Dane testowe (opcjonalne)
-- ============================================

-- Pracownicy
-- Hasło dla wszystkich: password123
-- Hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO `employees` (`id`, `name`, `email`, `password`, `role`, `is_active`, `notification_email`, `notification_phone`, `created_at`) VALUES
(1, 'Michał Nowaczyk', 'michal@nowaczyk.pl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, 'michal@nowaczyk.pl', NULL, NOW()),
(2, 'Jan Kowalski', 'jan.kowalski@nowaczyk.pl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 1, 'jan.kowalski@nowaczyk.pl', NULL, NOW()),
(3, 'Anna Nowak', 'anna.nowak@nowaczyk.pl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 1, 'anna.nowak@nowaczyk.pl', NULL, NOW());

-- Klienci
INSERT INTO `clients` (`id`, `first_name`, `last_name`, `phone`, `email`, `notes`, `is_active`, `created_at`) VALUES
(1, 'Piotr', 'Wiśniewski', '123456789', 'piotr.wisniewski@example.com', 'Stały klient', 1, NOW()),
(2, 'Katarzyna', 'Wójcik', '987654321', 'katarzyna.wojcik@example.com', NULL, 1, NOW()),
(3, 'Tomasz', 'Kowalczyk', '555123456', 'tomasz.kowalczyk@example.com', 'Preferuje wizyty poranne', 1, NOW()),
(4, 'Magdalena', 'Kamińska', '555987654', 'magdalena.kaminska@example.com', NULL, 1, NOW()),
(5, 'Marcin', 'Lewandowski', '111222333', 'marcin.lewandowski@example.com', NULL, 1, NOW());

-- Pojazdy
INSERT INTO `cars` (`id`, `client_id`, `brand`, `model`, `color`, `plate_number`, `notes`, `created_at`) VALUES
(1, 1, 'Toyota', 'Corolla', 'Biały', 'WA12345', NULL, NOW()),
(2, 1, 'BMW', 'Seria 3', 'Czarny', 'WA67890', 'Drugi pojazd klienta', NOW()),
(3, 2, 'Audi', 'A4', 'Srebrny', 'KR11111', NULL, NOW()),
(4, 3, 'Mercedes', 'Klasa C', 'Czarny', 'PO22222', NULL, NOW()),
(5, 4, 'Volkswagen', 'Golf', 'Czerwony', 'GD33333', NULL, NOW()),
(6, 5, 'Ford', 'Focus', 'Niebieski', 'WX44444', NULL, NOW());

-- Usługi
INSERT INTO `services` (`id`, `name`, `description`, `duration`, `price`, `category`, `is_active`, `created_at`) VALUES
(1, 'Mycie podstawowe', 'Mycie zewnętrzne pojazdu', 30, 50.00, 'Mycie', 1, NOW()),
(2, 'Mycie premium', 'Mycie zewnętrzne i wewnętrzne z woskowaniem', 90, 150.00, 'Mycie', 1, NOW()),
(3, 'Detailing zewnętrzny', 'Kompleksowe czyszczenie i polerowanie karoserii', 180, 400.00, 'Detailing', 1, NOW()),
(4, 'Detailing wewnętrzny', 'Kompleksowe czyszczenie wnętrza pojazdu', 120, 300.00, 'Detailing', 1, NOW()),
(5, 'Konserwacja skóry', 'Czyszczenie i konserwacja elementów skórzanych', 60, 200.00, 'Konserwacja', 1, NOW()),
(6, 'Polerowanie reflektorów', 'Przywracanie przejrzystości reflektorów', 45, 120.00, 'Detailing', 1, NOW()),
(7, 'Zabezpieczenie lakieru', 'Nakładanie powłoki ceramicznej', 240, 800.00, 'Detailing', 1, NOW()),
(8, 'Czyszczenie silnika', 'Mycie i konserwacja komory silnika', 45, 100.00, 'Konserwacja', 1, NOW());

-- Wizyty (przykładowe)
INSERT INTO `appointments` (`id`, `client_id`, `car_id`, `service_id`, `employee_id`, `date`, `start_time`, `status`, `notes`, `price`, `extra_cost`, `created_at`) VALUES
(1, 1, 1, 1, 2, CURDATE(), '09:00:00', 'scheduled', NULL, 50.00, NULL, NOW()),
(2, 2, 3, 2, 3, CURDATE(), '10:30:00', 'scheduled', 'Klient preferuje delikatne środki', 150.00, 30.00, NOW()),
(3, 3, 4, 3, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', 'scheduled', NULL, 400.00, NULL, NOW()),
(4, 1, 2, 4, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '11:00:00', 'scheduled', NULL, 300.00, NULL, NOW()),
(5, 4, 5, 1, 2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '09:30:00', 'scheduled', NULL, 50.00, NULL, NOW());

-- Mapowanie usług do wizyt
INSERT INTO `appointment_services` (`appointment_id`, `service_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 1);

-- ============================================
-- 3. Indeksy i optymalizacja
-- ============================================

-- Dodatkowe indeksy dla lepszej wydajności
ALTER TABLE `appointments` ADD INDEX `idx_date_time` (`date`, `start_time`);
ALTER TABLE `clients` ADD INDEX `idx_name` (`first_name`, `last_name`);

-- ============================================
-- 4. Widoki (opcjonalne - dla raportów)
-- ============================================

-- Widok: dzisiejsze wizyty
CREATE OR REPLACE VIEW `v_today_appointments` AS
SELECT 
    a.id,
    a.date,
    a.start_time,
    a.status,
    c.first_name,
    c.last_name,
    c.phone,
    car.brand,
    car.model,
    s.name as service_name,
    s.duration,
    e.name as employee_name
FROM appointments a
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN cars car ON a.car_id = car.id
LEFT JOIN services s ON a.service_id = s.id
LEFT JOIN employees e ON a.employee_id = e.id
WHERE a.date = CURDATE() 
  AND a.deleted_at IS NULL
ORDER BY a.start_time;

-- ============================================
-- KONIEC IMPORTOWANIA
-- ============================================
-- 
-- Po zaimportowaniu:
-- 1. Sprawdź czy wszystkie tabele zostały utworzone
-- 2. Sprawdź czy dane testowe zostały dodane
-- 3. Zaloguj się używając:
--    Email: michal@nowaczyk.pl
--    Hasło: password123
-- 4. ZMIEŃ HASŁA po pierwszym logowaniu!
-- ============================================
