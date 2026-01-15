<?php
function normalizeServiceIds($data) {
    $serviceIds = [];
    if (isset($data['service_ids'])) {
        if (is_array($data['service_ids'])) {
            $serviceIds = $data['service_ids'];
        } elseif (is_string($data['service_ids'])) {
            $serviceIds = array_filter(array_map('trim', explode(',', $data['service_ids'])));
        }
    } elseif (isset($data['service_id'])) {
        $serviceIds = [$data['service_id']];
    }

    $serviceIds = array_values(array_filter($serviceIds, function ($id) {
        return is_numeric($id);
    }));

    return $serviceIds;
}

function buildServicesFromRow($row, $hidePrices) {
    $services = [];
    if (!empty($row['service_ids'])) {
        $ids = explode('||', $row['service_ids']);
        $names = explode('||', $row['service_names']);
        $durations = explode('||', $row['service_durations']);
        $categories = explode('||', $row['service_categories']);
        $prices = explode('||', $row['service_prices']);

        foreach ($ids as $index => $id) {
            if ($id === '') {
                continue;
            }
            $services[] = [
                'id' => $id,
                'name' => $names[$index] ?? '',
                'duration' => isset($durations[$index]) ? (int)$durations[$index] : null,
                'category' => $categories[$index] ?? '',
                'price' => $hidePrices ? null : (($prices[$index] ?? '') !== '' ? (float)$prices[$index] : null)
            ];
        }
    } elseif (!empty($row['primary_service_id'])) {
        $services[] = [
            'id' => $row['primary_service_id'],
            'name' => $row['primary_service_name'] ?? '',
            'duration' => isset($row['primary_service_duration']) ? (int)$row['primary_service_duration'] : null,
            'category' => $row['primary_service_category'] ?? '',
            'price' => $hidePrices ? null : (isset($row['primary_service_price']) ? (float)$row['primary_service_price'] : null)
        ];
    }

    return $services;
}

function handleGetAppointments($db, $user) {
    $params = getQueryParams();
    $where = ["a.deleted_at IS NULL"];
    $values = [];
    
    // Filtruj po statusie
    if (isset($params['status'])) {
        $where[] = "a.status = ?";
        $values[] = $params['status'];
    }
    
    // Filtruj po kliencie
    if (isset($params['client_id'])) {
        $where[] = "a.client_id = ?";
        $values[] = $params['client_id'];
    }
    
    // Filtruj po pracowniku
    if (isset($params['employee_id'])) {
        $where[] = "a.employee_id = ?";
        $values[] = $params['employee_id'];
    }
    
    // Filtruj po dacie
    if (isset($params['date'])) {
        $where[] = "a.date = ?";
        $values[] = $params['date'];
    }
    
    // Zakres dat
    if (isset($params['start_date']) && isset($params['end_date'])) {
        $where[] = "a.date BETWEEN ? AND ?";
        $values[] = $params['start_date'];
        $values[] = $params['end_date'];
    }
    
    // Filtry szybkie
    if (isset($params['filter'])) {
        $today = date('Y-m-d');
        $tomorrow = date('Y-m-d', strtotime('+1 day'));
        
        if ($params['filter'] === 'today') {
            $where[] = "a.date = ?";
            $values[] = $today;
        } elseif ($params['filter'] === 'tomorrow') {
            $where[] = "a.date = ?";
            $values[] = $tomorrow;
        } elseif ($params['filter'] === 'upcoming') {
            $where[] = "a.date >= ?";
            $where[] = "a.status IN ('scheduled', 'in-progress')";
            $values[] = $today;
        }
    }
    
    $whereClause = implode(' AND ', $where);
    
    $appointments = $db->fetchAll("
        SELECT 
            a.*,
            c.first_name, c.last_name, c.phone, c.email,
            car.brand, car.model, car.color, car.plate_number,
            e.name as employee_name, e.role as employee_role,
            ps.id as primary_service_id, ps.name as primary_service_name, ps.duration as primary_service_duration,
            ps.category as primary_service_category, ps.price as primary_service_price,
            svc.service_ids, svc.service_names, svc.service_durations, svc.service_categories, svc.service_prices
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN cars car ON a.car_id = car.id
        LEFT JOIN employees e ON a.employee_id = e.id
        LEFT JOIN services ps ON a.service_id = ps.id
        LEFT JOIN (
            SELECT 
                aps.appointment_id,
                GROUP_CONCAT(s.id ORDER BY s.id SEPARATOR '||') AS service_ids,
                GROUP_CONCAT(s.name ORDER BY s.id SEPARATOR '||') AS service_names,
                GROUP_CONCAT(s.duration ORDER BY s.id SEPARATOR '||') AS service_durations,
                GROUP_CONCAT(s.category ORDER BY s.id SEPARATOR '||') AS service_categories,
                GROUP_CONCAT(IFNULL(s.price, '') ORDER BY s.id SEPARATOR '||') AS service_prices
            FROM appointment_services aps
            INNER JOIN services s ON s.id = aps.service_id
            GROUP BY aps.appointment_id
        ) svc ON svc.appointment_id = a.id
        WHERE $whereClause
        ORDER BY a.date DESC, a.start_time ASC
    ", $values);

    $hidePrices = isset($user['role']) && $user['role'] === 'employee';

    $appointments = array_map(function ($row) use ($hidePrices) {
        $row['services'] = buildServicesFromRow($row, $hidePrices);
        $row['service_ids'] = array_map(function ($service) {
            return $service['id'];
        }, $row['services']);
        if ($hidePrices) {
            $row['price'] = null;
            $row['extra_cost'] = null;
            $row['paid_amount'] = null;
        }
        return $row;
    }, $appointments);
    
    jsonResponse(['data' => $appointments]);
}

function handleGetAppointment($db, $id, $user) {
    $appointment = $db->fetchOne("
        SELECT 
            a.*,
            c.first_name, c.last_name, c.phone, c.email,
            car.brand, car.model, car.color, car.plate_number,
            e.name as employee_name, e.role as employee_role,
            ps.id as primary_service_id, ps.name as primary_service_name, ps.duration as primary_service_duration,
            ps.category as primary_service_category, ps.price as primary_service_price,
            svc.service_ids, svc.service_names, svc.service_durations, svc.service_categories, svc.service_prices
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN cars car ON a.car_id = car.id
        LEFT JOIN employees e ON a.employee_id = e.id
        LEFT JOIN services ps ON a.service_id = ps.id
        LEFT JOIN (
            SELECT 
                aps.appointment_id,
                GROUP_CONCAT(s.id ORDER BY s.id SEPARATOR '||') AS service_ids,
                GROUP_CONCAT(s.name ORDER BY s.id SEPARATOR '||') AS service_names,
                GROUP_CONCAT(s.duration ORDER BY s.id SEPARATOR '||') AS service_durations,
                GROUP_CONCAT(s.category ORDER BY s.id SEPARATOR '||') AS service_categories,
                GROUP_CONCAT(IFNULL(s.price, '') ORDER BY s.id SEPARATOR '||') AS service_prices
            FROM appointment_services aps
            INNER JOIN services s ON s.id = aps.service_id
            GROUP BY aps.appointment_id
        ) svc ON svc.appointment_id = a.id
        WHERE a.id = ? AND a.deleted_at IS NULL
    ", [$id]);
    
    if (!$appointment) {
        errorResponse('Appointment not found', 404);
    }
    
    $hidePrices = isset($user['role']) && $user['role'] === 'employee';
    $appointment['services'] = buildServicesFromRow($appointment, $hidePrices);
    $appointment['service_ids'] = array_map(function ($service) {
        return $service['id'];
    }, $appointment['services']);
    if ($hidePrices) {
        $appointment['price'] = null;
        $appointment['extra_cost'] = null;
        $appointment['paid_amount'] = null;
    }
    
    jsonResponse(['data' => $appointment]);
}

function handleCreateAppointment($db) {
    $data = getRequestData();
    validateRequired($data, ['client_id', 'car_id', 'date', 'start_time']);

    $serviceIds = normalizeServiceIds($data);
    if (empty($serviceIds)) {
        errorResponse('Missing required fields: service_ids', 422);
    }

    $primaryServiceId = $serviceIds[0];

    $db->beginTransaction();
    try {
        $db->query("
            INSERT INTO appointments (client_id, car_id, service_id, employee_id, date, start_time, status, notes, price, extra_cost)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ", [
            $data['client_id'],
            $data['car_id'],
            $primaryServiceId,
            $data['employee_id'] ?? null,
            $data['date'],
            $data['start_time'],
            $data['status'] ?? 'scheduled',
            $data['notes'] ?? null,
            $data['price'] ?? null,
            $data['extra_cost'] ?? null
        ]);

        $appointmentId = $db->lastInsertId();

        foreach ($serviceIds as $serviceId) {
            $db->query("
                INSERT INTO appointment_services (appointment_id, service_id)
                VALUES (?, ?)
            ", [$appointmentId, $serviceId]);
        }

        $db->commit();
    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }
    
    // Pobierz utworzoną wizytę z relacjami
    $appointment = $db->fetchOne("
        SELECT 
            a.*,
            c.first_name, c.last_name,
            car.brand, car.model,
            ps.name as primary_service_name,
            e.name as employee_name
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN cars car ON a.car_id = car.id
        LEFT JOIN services ps ON a.service_id = ps.id
        LEFT JOIN employees e ON a.employee_id = e.id
        WHERE a.id = ?
    ", [$appointmentId]);
    
    jsonResponse([
        'message' => 'Wizyta została zaplanowana',
        'data' => $appointment
    ], 201);
}

function handleUpdateAppointment($db, $id) {
    $data = getRequestData();
    
    $appointment = $db->fetchOne("SELECT * FROM appointments WHERE id = ? AND deleted_at IS NULL", [$id]);
    if (!$appointment) {
        errorResponse('Appointment not found', 404);
    }
    
    $fields = [];
    $values = [];
    
    foreach (['client_id', 'car_id', 'service_id', 'employee_id', 'date', 'start_time', 'status', 'notes', 'price', 'extra_cost'] as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $values[] = $data[$field];
        }
    }
    
    if (empty($fields)) {
        errorResponse('No fields to update', 400);
    }
    
    $values[] = $id;
    $db->beginTransaction();
    try {
        $db->query("UPDATE appointments SET " . implode(', ', $fields) . " WHERE id = ?", $values);

        if (isset($data['service_ids']) || isset($data['service_id'])) {
            $serviceIds = normalizeServiceIds($data);
            if (empty($serviceIds)) {
                errorResponse('Missing required fields: service_ids', 422);
            }

            $primaryServiceId = $serviceIds[0];
            $db->query("UPDATE appointments SET service_id = ? WHERE id = ?", [$primaryServiceId, $id]);

            $db->query("DELETE FROM appointment_services WHERE appointment_id = ?", [$id]);
            foreach ($serviceIds as $serviceId) {
                $db->query("
                    INSERT INTO appointment_services (appointment_id, service_id)
                    VALUES (?, ?)
                ", [$id, $serviceId]);
            }
        }

        $db->commit();
    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }
    
    // Pobierz zaktualizowaną wizytę
    $appointment = $db->fetchOne("
        SELECT 
            a.*,
            c.first_name, c.last_name,
            car.brand, car.model,
            ps.name as primary_service_name,
            e.name as employee_name
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN cars car ON a.car_id = car.id
        LEFT JOIN services ps ON a.service_id = ps.id
        LEFT JOIN employees e ON a.employee_id = e.id
        WHERE a.id = ?
    ", [$id]);
    
    jsonResponse([
        'message' => 'Wizyta została zaktualizowana',
        'data' => $appointment
    ]);
}

function handleUpdateAppointmentPayment($db, $id, $user) {
    if (!isset($user['role']) || $user['role'] !== 'admin') {
        errorResponse('Brak uprawnień', 403);
    }

    $data = getRequestData();
    validateRequired($data, ['paid_amount']);

    $appointment = $db->fetchOne("SELECT * FROM appointments WHERE id = ? AND deleted_at IS NULL", [$id]);
    if (!$appointment) {
        errorResponse('Appointment not found', 404);
    }

    $paidAmount = (float)$data['paid_amount'];
    if ($paidAmount < 0) {
        errorResponse('Invalid paid amount', 400);
    }

    $db->query("UPDATE appointments SET paid_amount = ? WHERE id = ?", [$paidAmount, $id]);

    $updated = $db->fetchOne("SELECT a.* FROM appointments a WHERE a.id = ?", [$id]);

    jsonResponse([
        'message' => 'Płatność została zaktualizowana',
        'data' => $updated
    ]);
}

function handleUpdateAppointmentStatus($db, $id) {
    $data = getRequestData();
    validateRequired($data, ['status']);
    
    $appointment = $db->fetchOne("SELECT * FROM appointments WHERE id = ? AND deleted_at IS NULL", [$id]);
    if (!$appointment) {
        errorResponse('Appointment not found', 404);
    }
    
    $validStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'];
    if (!in_array($data['status'], $validStatuses)) {
        errorResponse('Invalid status', 400);
    }
    
    // Jeśli status = completed, zwiększ total_visits klienta
    if ($data['status'] === 'completed' && $appointment['status'] !== 'completed') {
        $db->query("UPDATE clients SET total_visits = total_visits + 1 WHERE id = ?", [$appointment['client_id']]);
    }
    
    $db->query("UPDATE appointments SET status = ? WHERE id = ?", [$data['status'], $id]);
    
    // Pobierz zaktualizowaną wizytę
    $appointment = $db->fetchOne("
        SELECT 
            a.*,
            c.first_name, c.last_name,
            car.brand, car.model,
            s.name as service_name,
            e.name as employee_name
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN cars car ON a.car_id = car.id
        LEFT JOIN services s ON a.service_id = s.id
        LEFT JOIN employees e ON a.employee_id = e.id
        WHERE a.id = ?
    ", [$id]);
    
    jsonResponse([
        'message' => 'Status wizyty został zmieniony',
        'data' => $appointment
    ]);
}

function handleDeleteAppointment($db, $id) {
    $appointment = $db->fetchOne("SELECT * FROM appointments WHERE id = ? AND deleted_at IS NULL", [$id]);
    if (!$appointment) {
        errorResponse('Appointment not found', 404);
    }
    
    $db->query("UPDATE appointments SET deleted_at = NOW() WHERE id = ?", [$id]);
    
    jsonResponse(['message' => 'Wizyta została usunięta']);
}

function handleGetAppointmentStats($db) {
    $today = date('Y-m-d');
    $tomorrow = date('Y-m-d', strtotime('+1 day'));
    
    $todayStats = $db->fetchOne("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled
        FROM appointments
        WHERE date = ? AND deleted_at IS NULL
    ", [$today]);
    
    $tomorrowCount = $db->fetchOne("
        SELECT COUNT(*) as count FROM appointments 
        WHERE date = ? AND deleted_at IS NULL
    ", [$tomorrow])['count'];
    
    $upcomingCount = $db->fetchOne("
        SELECT COUNT(*) as count FROM appointments 
        WHERE date >= ? AND status IN ('scheduled', 'in-progress') AND deleted_at IS NULL
    ", [$today])['count'];
    
    jsonResponse([
        'data' => [
            'today_count' => (int)$todayStats['total'],
            'today_completed' => (int)$todayStats['completed'],
            'today_in_progress' => (int)$todayStats['in_progress'],
            'today_scheduled' => (int)$todayStats['scheduled'],
            'tomorrow_count' => (int)$tomorrowCount,
            'upcoming_count' => (int)$upcomingCount
        ]
    ]);
}
