<?php
require __DIR__ . '/../api/config.php';
require __DIR__ . '/../api/database.php';

$db = new Database();

function tryQuery($db, $sql) {
    try {
        $db->query($sql);
    } catch (Exception $e) {
        // Ignore if already applied
    }
}

// Appointments: extra_cost column
tryQuery($db, "ALTER TABLE appointments ADD COLUMN extra_cost DECIMAL(10,2) DEFAULT NULL");

// Appointment services table
tryQuery($db, "
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
");

// Backfill appointment_services for existing appointments
tryQuery($db, "
    INSERT IGNORE INTO appointment_services (appointment_id, service_id)
    SELECT id, service_id FROM appointments WHERE service_id IS NOT NULL
");

// Employees: notification columns
tryQuery($db, "ALTER TABLE employees ADD COLUMN notification_email VARCHAR(255) DEFAULT NULL");
tryQuery($db, "ALTER TABLE employees ADD COLUMN notification_phone VARCHAR(30) DEFAULT NULL");

echo "OK\n";
