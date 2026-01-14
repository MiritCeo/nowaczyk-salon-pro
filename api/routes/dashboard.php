<?php
function buildServicesFromRowDashboard($row, $hidePrices) {
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

function handleDashboard($db, $user) {
    $hidePrices = isset($user['role']) && $user['role'] === 'employee';
    $today = date('Y-m-d');
    $tomorrow = date('Y-m-d', strtotime('+1 day'));
    
    // Wizyty dzisiaj
    $todayAppointments = $db->fetchAll("
        SELECT 
            a.*,
            c.first_name, c.last_name, c.phone,
            car.brand, car.model, car.color,
            e.name as employee_name,
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
        WHERE a.date = ? AND a.deleted_at IS NULL
        ORDER BY a.start_time ASC
    ", [$today]);
    
    // Wizyty jutro
    $tomorrowAppointments = $db->fetchAll("
        SELECT 
            a.*,
            c.first_name, c.last_name, c.phone,
            car.brand, car.model, car.color,
            e.name as employee_name,
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
        WHERE a.date = ? AND a.deleted_at IS NULL
        ORDER BY a.start_time ASC
    ", [$tomorrow]);

    $todayAppointments = array_map(function ($row) use ($hidePrices) {
        $row['services'] = buildServicesFromRowDashboard($row, $hidePrices);
        $row['service_ids'] = array_map(function ($service) {
            return $service['id'];
        }, $row['services']);
        if ($hidePrices) {
            $row['price'] = null;
            $row['extra_cost'] = null;
        }
        return $row;
    }, $todayAppointments);

    $tomorrowAppointments = array_map(function ($row) use ($hidePrices) {
        $row['services'] = buildServicesFromRowDashboard($row, $hidePrices);
        $row['service_ids'] = array_map(function ($service) {
            return $service['id'];
        }, $row['services']);
        if ($hidePrices) {
            $row['price'] = null;
            $row['extra_cost'] = null;
        }
        return $row;
    }, $tomorrowAppointments);
    
    // Nowi klienci (ostatnie 30 dni)
    $newClientsCount = $db->fetchOne("
        SELECT COUNT(*) as count 
        FROM clients 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
        AND deleted_at IS NULL
    ")['count'];
    
    // Statystyki
    $todayCompleted = count(array_filter($todayAppointments, fn($a) => $a['status'] === 'completed'));
    $todayInProgress = count(array_filter($todayAppointments, fn($a) => $a['status'] === 'in-progress'));
    
    jsonResponse([
        'data' => [
            'stats' => [
                'today_total' => count($todayAppointments),
                'today_in_progress' => $todayInProgress,
                'today_completed' => $todayCompleted,
                'tomorrow_total' => count($tomorrowAppointments),
                'new_clients_30d' => $newClientsCount
            ],
            'today_appointments' => $todayAppointments,
            'tomorrow_appointments' => $tomorrowAppointments
        ]
    ]);
}
