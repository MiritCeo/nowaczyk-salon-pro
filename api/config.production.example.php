<?php
/**
 * PRZYKŁADOWA KONFIGURACJA PRODUKCYJNA
 * 
 * INSTRUKCJA:
 * 1. Skopiuj ten plik jako config.php
 * 2. Wypełnij dane bazy danych
 * 3. Wygeneruj bezpieczny JWT_SECRET (użyj generate-jwt-secret.php)
 * 4. Zapisz jako config.php
 */

// ============================================
// Baza danych - WYPEŁNIJ SWOJE DANE
// ============================================
define('DB_HOST', 'localhost'); // lub inny host (np. mysql.twoja-domena.pl)
define('DB_NAME', 'twoja_nazwa_bazy');
define('DB_USER', 'twoj_uzytkownik');
define('DB_PASS', 'twoje_haslo');
define('DB_CHARSET', 'utf8mb4');

// ============================================
// JWT Secret - WYGENERUJ BEZPIECZNY KLUCZ!
// ============================================
// Użyj: generate-jwt-secret.php lub online generator
// Minimum: 32 znaki, zalecane: 64+ znaków
define('JWT_SECRET', 'WSTAW_TUTAJ_WYGENEROWANY_BEZPIECZNY_KLUCZ_64_ZNAKI');
define('JWT_EXPIRATION', 86400 * 7); // 7 dni

// ============================================
// CORS - DODAJ SWOJĄ DOMENĘ
// ============================================
define('ALLOWED_ORIGINS', [
    'https://nowaczyk.mirit.pl',
    'https://www.nowaczyk.mirit.pl',
    // Dodaj inne domeny jeśli potrzebujesz
]);

// ============================================
// Timezone
// ============================================
date_default_timezone_set('Europe/Warsaw');

// ============================================
// Error reporting - WYŁĄCZONE NA PRODUKCJI
// ============================================
error_reporting(0);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// ============================================
// KONIEC KONFIGURACJI
// ============================================
