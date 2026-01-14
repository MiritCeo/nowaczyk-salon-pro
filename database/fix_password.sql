-- ============================================
-- Naprawa hasła - SQL do wykonania w phpMyAdmin
-- ============================================
-- 
-- INSTRUKCJA:
-- 1. Otwórz phpMyAdmin
-- 2. Wybierz bazę danych
-- 3. Kliknij zakładkę "SQL"
-- 4. Skopiuj i wklej poniższe zapytanie
-- 5. Kliknij "Wykonaj"
-- ============================================

-- Napraw hasło dla michal@nowaczyk.pl
-- Hasło: password123
UPDATE `employees` 
SET `password` = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE `email` = 'michal@nowaczyk.pl';

-- Napraw hasło dla admin@nowaczyk.pl (jeśli użyłeś import_empty.sql)
-- Hasło: password123
UPDATE `employees` 
SET `password` = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE `email` = 'admin@nowaczyk.pl';

-- Sprawdź czy hasło zostało zaktualizowane
SELECT id, name, email, role, 
       SUBSTRING(password, 1, 30) as password_hash_preview 
FROM `employees` 
WHERE `email` IN ('michal@nowaczyk.pl', 'admin@nowaczyk.pl');

-- ============================================
-- Po wykonaniu:
-- 1. Spróbuj się zalogować używając:
--    Email: michal@nowaczyk.pl (lub admin@nowaczyk.pl)
--    Hasło: password123
-- 2. ZMIEŃ HASŁO po pierwszym logowaniu!
-- ============================================
