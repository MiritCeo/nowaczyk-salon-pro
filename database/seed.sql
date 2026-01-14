-- Nowaczyk Salon Pro - Dane przykładowe
USE nowaczyk_salon_pro;

-- Wyczyść tabele (opcjonalnie)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE appointment_services;
TRUNCATE TABLE appointments;
TRUNCATE TABLE services;
TRUNCATE TABLE cars;
TRUNCATE TABLE clients;
TRUNCATE TABLE employees;
SET FOREIGN_KEY_CHECKS = 1;

-- Pracownicy (hasło: password123)
INSERT INTO employees (name, email, password, role, is_active, notification_email, notification_phone) VALUES
('Michał Nowaczyk', 'michal@nowaczyk.pl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE, 'michal@nowaczyk.pl', NULL),
('Tomasz Kowalski', 'tomasz@nowaczyk.pl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', TRUE, 'tomasz@nowaczyk.pl', NULL);

-- Klienci
INSERT INTO clients (first_name, last_name, phone, email, notes, total_visits) VALUES
('Jan', 'Kowalski', '+48 600 123 456', 'jan.kowalski@email.pl', 'Stały klient, preferuje poniedziałki', 12),
('Anna', 'Nowak', '+48 601 234 567', 'anna.nowak@email.pl', NULL, 5),
('Piotr', 'Wiśniewski', '+48 602 345 678', NULL, 'Właściciel firmy, flotowe samochody', 8),
('Marek', 'Zieliński', '+48 603 456 789', 'marek.z@email.pl', NULL, 2);

-- Pojazdy
INSERT INTO cars (client_id, brand, model, color, plate_number, notes) VALUES
(1, 'BMW', 'M3 Competition', 'Czarny', 'WPL 12345', NULL),
(1, 'Porsche', '911 GT3', 'Biały', NULL, NULL),
(2, 'Mercedes-Benz', 'AMG GT', 'Srebrny', 'WA 98765', NULL),
(3, 'Audi', 'RS6 Avant', 'Szary Nardo', NULL, NULL),
(4, 'Volkswagen', 'Golf R', 'Niebieski', NULL, NULL);

-- Usługi
INSERT INTO services (name, description, duration, price, category, is_active) VALUES
('Mycie podstawowe', 'Mycie zewnętrzne + odkurzanie', 45, 80.00, 'Mycie', TRUE),
('Mycie premium', 'Pełne mycie wewnętrzne i zewnętrzne', 90, 150.00, 'Mycie', TRUE),
('Detailing wnętrza', 'Kompleksowe czyszczenie wnętrza', 180, 350.00, 'Detailing', TRUE),
('Korekta lakieru', 'Polerowanie + korekta zarysowań', 480, 800.00, 'Detailing', TRUE),
('Powłoka ceramiczna', 'Aplikacja powłoki ochronnej', 300, 1500.00, 'Ochrona', TRUE),
('Pranie tapicerki', 'Ekstrakcyjne pranie siedzeń', 120, 250.00, 'Pranie', TRUE);

-- Wizyty (dzisiaj i jutro)
INSERT INTO appointments (client_id, car_id, service_id, employee_id, date, start_time, status, notes, price, extra_cost) VALUES
(1, 1, 2, 1, CURDATE(), '09:00:00', 'completed', 'Klient prosi o szczególną uwagę na felgi', 150.00, 20.00),
(2, 3, 4, 2, CURDATE(), '10:30:00', 'in-progress', NULL, 800.00, NULL),
(3, 4, 3, 1, CURDATE(), '14:00:00', 'scheduled', NULL, 350.00, NULL),
(4, 5, 1, 2, CURDATE(), '16:00:00', 'scheduled', NULL, 80.00, NULL),
(1, 2, 5, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', 'scheduled', NULL, 1500.00, 100.00),
(2, 3, 6, NULL, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00', 'scheduled', NULL, 250.00, NULL);

-- Usługi przypisane do wizyt
INSERT INTO appointment_services (appointment_id, service_id) VALUES
(1, 2),
(2, 4),
(3, 3),
(4, 1),
(5, 5),
(6, 6);
