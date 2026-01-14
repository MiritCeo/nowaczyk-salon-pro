<?php
// ============================================
// TRYB TESTOWY - WYŁĄCZ WERYFIKACJĘ TOKENÓW
// ============================================
// ⚠️ UWAGA: Ustaw na true tylko do testowania!
// Po testach ZMIEŃ NA false dla bezpieczeństwa!
define('TEST_MODE_NO_AUTH', false); // ⚠️ ZMIEŃ NA false PO TESTOWANIU!
// ============================================

// Konfiguracja bazy danych
define('DB_HOST', 'localhost');
define('DB_NAME', 'nowaczyk_salon_pro');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// JWT Secret Key (zmień na produkcji!)
define('JWT_SECRET', 'your-secret-key-change-in-production-2024');
define('JWT_EXPIRATION', 86400 * 7); // 7 dni

// CORS
define('ALLOWED_ORIGINS', ['http://localhost:5173', 'http://localhost:3000']);

// Timezone
date_default_timezone_set('Europe/Warsaw');

// Error reporting (wyłącz na produkcji)
error_reporting(E_ALL);
ini_set('display_errors', 1);
