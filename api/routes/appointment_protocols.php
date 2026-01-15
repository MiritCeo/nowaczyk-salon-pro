<?php
function fetchAppointmentForProtocol($db, $appointmentId) {
    $appointment = $db->fetchOne("SELECT id FROM appointments WHERE id = ? AND deleted_at IS NULL", [$appointmentId]);
    if (!$appointment) {
        errorResponse('Appointment not found', 404);
    }
}

function mapProtocolRow($row) {
    if (!$row) {
        return null;
    }

    $row['damages'] = [];
    if (!empty($row['damages_json'])) {
        $decoded = json_decode($row['damages_json'], true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $row['damages'] = $decoded;
        }
    }

    return [
        'id' => $row['id'],
        'appointment_id' => $row['appointment_id'],
        'mileage' => $row['mileage'],
        'fuel_level' => $row['fuel_level'],
        'accessories' => $row['accessories'],
        'notes' => $row['notes'],
        'damages' => $row['damages'],
        'client_signature' => $row['client_signature'],
        'employee_signature' => $row['employee_signature'],
        'created_by' => $row['created_by'],
        'updated_by' => $row['updated_by'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
    ];
}

function handleGetAppointmentProtocol($db, $appointmentId) {
    fetchAppointmentForProtocol($db, $appointmentId);

    $protocol = $db->fetchOne("
        SELECT * FROM appointment_protocols
        WHERE appointment_id = ?
        LIMIT 1
    ", [$appointmentId]);

    jsonResponse(['data' => mapProtocolRow($protocol)]);
}

function handleUpsertAppointmentProtocol($db, $appointmentId, $user) {
    fetchAppointmentForProtocol($db, $appointmentId);

    $data = getRequestData();
    $damages = $data['damages'] ?? $data['damages_json'] ?? [];
    if (!is_array($damages)) {
        $damages = [];
    }

    $payload = [
        'mileage' => $data['mileage'] ?? null,
        'fuel_level' => $data['fuel_level'] ?? ($data['fuelLevel'] ?? null),
        'accessories' => $data['accessories'] ?? null,
        'notes' => $data['notes'] ?? null,
        'damages_json' => json_encode($damages, JSON_UNESCAPED_UNICODE),
        'client_signature' => $data['client_signature'] ?? ($data['clientSignature'] ?? null),
        'employee_signature' => $data['employee_signature'] ?? ($data['employeeSignature'] ?? null),
    ];

    $existing = $db->fetchOne("SELECT id FROM appointment_protocols WHERE appointment_id = ? LIMIT 1", [$appointmentId]);
    $userId = $user['user_id'] ?? null;

    if ($existing) {
        $db->query("
            UPDATE appointment_protocols
            SET mileage = ?, fuel_level = ?, accessories = ?, notes = ?, damages_json = ?,
                client_signature = ?, employee_signature = ?, updated_by = ?
            WHERE appointment_id = ?
        ", [
            $payload['mileage'],
            $payload['fuel_level'],
            $payload['accessories'],
            $payload['notes'],
            $payload['damages_json'],
            $payload['client_signature'],
            $payload['employee_signature'],
            $userId,
            $appointmentId
        ]);
    } else {
        $db->query("
            INSERT INTO appointment_protocols (
                appointment_id, mileage, fuel_level, accessories, notes, damages_json,
                client_signature, employee_signature, created_by, updated_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ", [
            $appointmentId,
            $payload['mileage'],
            $payload['fuel_level'],
            $payload['accessories'],
            $payload['notes'],
            $payload['damages_json'],
            $payload['client_signature'],
            $payload['employee_signature'],
            $userId,
            $userId
        ]);
    }

    $protocol = $db->fetchOne("SELECT * FROM appointment_protocols WHERE appointment_id = ? LIMIT 1", [$appointmentId]);
    jsonResponse(['message' => 'Protocol saved', 'data' => mapProtocolRow($protocol)]);
}
