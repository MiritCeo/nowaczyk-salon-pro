<?php
require __DIR__ . '/../api/config.php';
require __DIR__ . '/../api/database.php';

$db = new Database();

// Add extra_cost column if missing
try {
    $db->query('ALTER TABLE appointments ADD COLUMN extra_cost DECIMAL(10,2) DEFAULT NULL');
} catch (Exception $e) {
    // Ignore if column already exists
}

// Create appointment_services table if missing
$db->query('
    CREATE TABLE IF NOT EXISTS appointment_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        appointment_id INT NOT NULL,
        service_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_appointment_service (appointment_id, service_id),
        INDEX idx_appointment (appointment_id),
        INDEX idx_service (service_id),
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    )
');

// Backfill mapping for existing appointments
$db->query('
    INSERT IGNORE INTO appointment_services (appointment_id, service_id)
    SELECT id, service_id FROM appointments WHERE service_id IS NOT NULL
');

echo "OK\n";
