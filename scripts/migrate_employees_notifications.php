<?php
require __DIR__ . '/../api/config.php';
require __DIR__ . '/../api/database.php';

$db = new Database();

// Add notification columns if missing
try {
    $db->query('ALTER TABLE employees ADD COLUMN notification_email VARCHAR(255) DEFAULT NULL');
} catch (Exception $e) {
    // ignore if column exists
}

try {
    $db->query('ALTER TABLE employees ADD COLUMN notification_phone VARCHAR(30) DEFAULT NULL');
} catch (Exception $e) {
    // ignore if column exists
}

echo "OK\n";
