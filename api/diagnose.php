<?php
/**
 * Skrypt diagnostyczny - pomaga zidentyfikować problemy na serwerze produkcyjnym
 * 
 * INSTRUKCJA:
 * 1. Prześlij ten plik na serwer do folderu api/
 * 2. Otwórz w przeglądarce: https://twoja-domena.pl/api/diagnose.php
 * 3. Skopiuj wyniki i wyślij do dewelopera
 * 4. USUŃ ten plik po diagnozie!
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Diagnostyka API - Nowaczyk Salon Pro</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .section { background: white; padding: 20px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .ok { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        pre { background: #f0f0f0; padding: 10px; border-radius: 3px; overflow-x: auto; }
        h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
    </style>
</head>
<body>
    <h1>🔍 Diagnostyka API - Nowaczyk Salon Pro</h1>
    
    <?php
    $errors = [];
    $warnings = [];
    $info = [];
    
    // 1. Sprawdź wersję PHP
    echo '<div class="section">';
    echo '<h2>1. Wersja PHP</h2>';
    $phpVersion = phpversion();
    if (version_compare($phpVersion, '7.4.0', '>=')) {
        echo '<p class="ok">✅ PHP ' . $phpVersion . ' - OK</p>';
    } else {
        echo '<p class="error">❌ PHP ' . $phpVersion . ' - Wymagane PHP 7.4+</p>';
        $errors[] = 'PHP version too old';
    }
    echo '</div>';
    
    // 2. Sprawdź wymagane rozszerzenia
    echo '<div class="section">';
    echo '<h2>2. Rozszerzenia PHP</h2>';
    $required = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'openssl'];
    foreach ($required as $ext) {
        if (extension_loaded($ext)) {
            echo '<p class="ok">✅ ' . $ext . ' - zainstalowane</p>';
        } else {
            echo '<p class="error">❌ ' . $ext . ' - BRAK!</p>';
            $errors[] = "Missing extension: $ext";
        }
    }
    echo '</div>';
    
    // 3. Sprawdź pliki
    echo '<div class="section">';
    echo '<h2>3. Pliki API</h2>';
    $requiredFiles = [
        'config.php',
        'cors.php',
        'database.php',
        'auth.php',
        'helpers.php',
        'index.php',
        'routes/auth.php',
        'routes/clients.php',
        'routes/appointments.php',
    ];
    foreach ($requiredFiles as $file) {
        if (file_exists(__DIR__ . '/' . $file)) {
            echo '<p class="ok">✅ ' . $file . '</p>';
        } else {
            echo '<p class="error">❌ ' . $file . ' - BRAK!</p>';
            $errors[] = "Missing file: $file";
        }
    }
    echo '</div>';
    
    // 4. Sprawdź config.php
    echo '<div class="section">';
    echo '<h2>4. Konfiguracja (config.php)</h2>';
    if (file_exists(__DIR__ . '/config.php')) {
        require_once __DIR__ . '/config.php';
        
        if (defined('DB_HOST')) {
            echo '<p class="ok">✅ DB_HOST: ' . DB_HOST . '</p>';
        } else {
            echo '<p class="error">❌ DB_HOST - nie zdefiniowane</p>';
            $errors[] = 'DB_HOST not defined';
        }
        
        if (defined('DB_NAME')) {
            echo '<p class="ok">✅ DB_NAME: ' . DB_NAME . '</p>';
        } else {
            echo '<p class="error">❌ DB_NAME - nie zdefiniowane</p>';
            $errors[] = 'DB_NAME not defined';
        }
        
        if (defined('DB_USER')) {
            echo '<p class="ok">✅ DB_USER: ' . DB_USER . '</p>';
        } else {
            echo '<p class="error">❌ DB_USER - nie zdefiniowane</p>';
            $errors[] = 'DB_USER not defined';
        }
        
        if (defined('JWT_SECRET')) {
            if (JWT_SECRET === 'your-secret-key-change-in-production-2024') {
                echo '<p class="warning">⚠️ JWT_SECRET - używasz domyślnego klucza! Zmień na produkcji!</p>';
                $warnings[] = 'Default JWT_SECRET';
            } else {
                echo '<p class="ok">✅ JWT_SECRET - ustawiony</p>';
            }
        } else {
            echo '<p class="error">❌ JWT_SECRET - nie zdefiniowane</p>';
            $errors[] = 'JWT_SECRET not defined';
        }
        
        if (defined('ALLOWED_ORIGINS')) {
            echo '<p class="ok">✅ ALLOWED_ORIGINS: ' . implode(', ', ALLOWED_ORIGINS) . '</p>';
        } else {
            echo '<p class="error">❌ ALLOWED_ORIGINS - nie zdefiniowane</p>';
            $errors[] = 'ALLOWED_ORIGINS not defined';
        }
    } else {
        echo '<p class="error">❌ config.php - BRAK PLIKU!</p>';
        $errors[] = 'config.php missing';
    }
    echo '</div>';
    
    // 5. Test połączenia z bazą danych
    echo '<div class="section">';
    echo '<h2>5. Połączenie z bazą danych</h2>';
    if (file_exists(__DIR__ . '/config.php')) {
        try {
            require_once __DIR__ . '/config.php';
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
            echo '<p class="ok">✅ Połączenie z bazą danych - SUKCES</p>';
            
            // Sprawdź tabele
            $tables = ['employees', 'clients', 'cars', 'services', 'appointments'];
            foreach ($tables as $table) {
                try {
                    $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
                    $count = $stmt->fetchColumn();
                    echo '<p class="ok">✅ Tabela ' . $table . ': ' . $count . ' rekordów</p>';
                } catch (Exception $e) {
                    echo '<p class="error">❌ Tabela ' . $table . ': ' . $e->getMessage() . '</p>';
                    $errors[] = "Table $table error: " . $e->getMessage();
                }
            }
            
            // Sprawdź użytkowników
            try {
                $stmt = $pdo->query("SELECT id, name, email, is_active FROM employees WHERE deleted_at IS NULL LIMIT 5");
                $users = $stmt->fetchAll();
                if (count($users) > 0) {
                    echo '<p class="ok">✅ Znaleziono ' . count($users) . ' użytkowników:</p>';
                    echo '<ul>';
                    foreach ($users as $user) {
                        echo '<li>' . htmlspecialchars($user['name']) . ' (' . htmlspecialchars($user['email']) . ')</li>';
                    }
                    echo '</ul>';
                } else {
                    echo '<p class="warning">⚠️ Brak użytkowników w bazie</p>';
                    $warnings[] = 'No users in database';
                }
            } catch (Exception $e) {
                echo '<p class="error">❌ Błąd sprawdzania użytkowników: ' . $e->getMessage() . '</p>';
                $errors[] = "Users check error: " . $e->getMessage();
            }
            
        } catch (PDOException $e) {
            echo '<p class="error">❌ Błąd połączenia z bazą: ' . $e->getMessage() . '</p>';
            $errors[] = "Database connection error: " . $e->getMessage();
        }
    }
    echo '</div>';
    
    // 6. Sprawdź uprawnienia
    echo '<div class="section">';
    echo '<h2>6. Uprawnienia plików</h2>';
    $files = ['config.php', 'index.php', '.htaccess'];
    foreach ($files as $file) {
        $path = __DIR__ . '/' . $file;
        if (file_exists($path)) {
            $perms = substr(sprintf('%o', fileperms($path)), -4);
            echo '<p>' . $file . ': ' . $perms . '</p>';
        }
    }
    echo '</div>';
    
    // 7. Test logowania (bez hasła)
    echo '<div class="section">';
    echo '<h2>7. Test endpointu login</h2>';
    if (file_exists(__DIR__ . '/config.php') && file_exists(__DIR__ . '/database.php')) {
        try {
            require_once __DIR__ . '/config.php';
            require_once __DIR__ . '/database.php';
            require_once __DIR__ . '/auth.php';
            require_once __DIR__ . '/helpers.php';
            
            $db = new Database();
            
            // Sprawdź czy istnieje użytkownik testowy
            $testUser = $db->fetchOne(
                "SELECT * FROM employees WHERE email = ? AND is_active = 1 AND deleted_at IS NULL",
                ['michal@nowaczyk.pl']
            );
            
            if ($testUser) {
                echo '<p class="ok">✅ Użytkownik testowy znaleziony: ' . htmlspecialchars($testUser['email']) . '</p>';
                echo '<p>Hash hasła: ' . substr($testUser['password'], 0, 30) . '...</p>';
            } else {
                echo '<p class="warning">⚠️ Użytkownik testowy nie znaleziony</p>';
                $warnings[] = 'Test user not found';
            }
            
        } catch (Exception $e) {
            echo '<p class="error">❌ Błąd testu: ' . $e->getMessage() . '</p>';
            echo '<pre>' . $e->getTraceAsString() . '</pre>';
            $errors[] = "Test error: " . $e->getMessage();
        }
    }
    echo '</div>';
    
    // 8. Sprawdź logi błędów
    echo '<div class="section">';
    echo '<h2>8. Informacje o serwerze</h2>';
    echo '<p>Server Software: ' . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . '</p>';
    echo '<p>Document Root: ' . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . '</p>';
    echo '<p>Script Filename: ' . ($_SERVER['SCRIPT_FILENAME'] ?? 'Unknown') . '</p>';
    echo '<p>Current Directory: ' . __DIR__ . '</p>';
    echo '<p>Error Log: ' . ini_get('error_log') . '</p>';
    echo '</div>';
    
    // Podsumowanie
    echo '<div class="section">';
    echo '<h2>📊 Podsumowanie</h2>';
    if (empty($errors)) {
        echo '<p class="ok">✅ Brak krytycznych błędów!</p>';
    } else {
        echo '<p class="error">❌ Znaleziono ' . count($errors) . ' błędów:</p>';
        echo '<ul>';
        foreach ($errors as $error) {
            echo '<li class="error">' . htmlspecialchars($error) . '</li>';
        }
        echo '</ul>';
    }
    
    if (!empty($warnings)) {
        echo '<p class="warning">⚠️ Ostrzeżenia:</p>';
        echo '<ul>';
        foreach ($warnings as $warning) {
            echo '<li class="warning">' . htmlspecialchars($warning) . '</li>';
        }
        echo '</ul>';
    }
    echo '</div>';
    
    // Instrukcje
    echo '<div class="section">';
    echo '<h2>🔧 Co dalej?</h2>';
    if (!empty($errors)) {
        echo '<ol>';
        if (in_array('Database connection error', array_map(function($e) { return strpos($e, 'Database connection') !== false; }, $errors))) {
            echo '<li>Sprawdź dane dostępowe do bazy w <code>api/config.php</code></li>';
            echo '<li>Sprawdź czy baza danych istnieje</li>';
            echo '<li>Sprawdź czy użytkownik bazy ma odpowiednie uprawnienia</li>';
        }
        if (in_array('Missing extension', array_map(function($e) { return strpos($e, 'Missing extension') !== false; }, $errors))) {
            echo '<li>Skontaktuj się z hostingiem - brakuje wymaganych rozszerzeń PHP</li>';
        }
        if (in_array('Missing file', array_map(function($e) { return strpos($e, 'Missing file') !== false; }, $errors))) {
            echo '<li>Prześlij brakujące pliki na serwer</li>';
        }
        echo '</ol>';
    } else {
        echo '<p class="ok">Wszystko wygląda dobrze! Sprawdź logi błędów serwera dla szczegółów błędu 500.</p>';
        echo '<p>Możliwe przyczyny błędu 500:</p>';
        echo '<ul>';
        echo '<li>Błąd w logice PHP (sprawdź logi błędów serwera)</li>';
        echo '<li>Problem z uprawnieniami do plików</li>';
        echo '<li>Błąd w .htaccess</li>';
        echo '<li>Problem z pamięcią PHP</li>';
        echo '</ul>';
    }
    echo '</div>';
    
    echo '<div class="section">';
    echo '<p><strong>⚠️ WAŻNE: Usuń ten plik po diagnozie ze względów bezpieczeństwa!</strong></p>';
    echo '</div>';
    ?>
</body>
</html>
