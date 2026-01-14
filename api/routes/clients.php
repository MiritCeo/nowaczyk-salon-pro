<?php
function handleGetClients($db) {
    $params = getQueryParams();
    $where = ["deleted_at IS NULL"];
    $values = [];
    
    // Wyszukiwanie
    if (isset($params['search']) && !empty($params['search'])) {
        $where[] = "(first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?)";
        $searchTerm = '%' . $params['search'] . '%';
        $values = array_merge($values, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
    }
    
    $whereClause = implode(' AND ', $where);
    
    // Pobierz klientów
    $clients = $db->fetchAll("
        SELECT * FROM clients 
        WHERE $whereClause
        ORDER BY created_at DESC
    ", $values);
    
    // Pobierz samochody dla każdego klienta
    foreach ($clients as &$client) {
        $client['cars'] = $db->fetchAll(
            "SELECT * FROM cars WHERE client_id = ? AND deleted_at IS NULL",
            [$client['id']]
        );
    }
    
    jsonResponse(['data' => $clients]);
}

function handleGetClient($db, $id) {
    $client = $db->fetchOne(
        "SELECT * FROM clients WHERE id = ? AND deleted_at IS NULL",
        [$id]
    );
    
    if (!$client) {
        errorResponse('Client not found', 404);
    }
    
    // Pobierz samochody
    $client['cars'] = $db->fetchAll(
        "SELECT * FROM cars WHERE client_id = ? AND deleted_at IS NULL",
        [$client['id']]
    );
    
    // Pobierz wizyty
    $client['appointments'] = $db->fetchAll("
        SELECT 
            a.*,
            s.name as service_name,
            car.brand, car.model,
            e.name as employee_name
        FROM appointments a
        LEFT JOIN services s ON a.service_id = s.id
        LEFT JOIN cars car ON a.car_id = car.id
        LEFT JOIN employees e ON a.employee_id = e.id
        WHERE a.client_id = ? AND a.deleted_at IS NULL
        ORDER BY a.date DESC, a.start_time DESC
    ", [$client['id']]);
    
    jsonResponse(['data' => $client]);
}

function handleCreateClient($db) {
    $data = getRequestData();
    validateRequired($data, ['first_name', 'last_name', 'phone']);
    
    try {
        $db->beginTransaction();
        
        // Dodaj klienta
        $db->query("
            INSERT INTO clients (first_name, last_name, phone, email, notes)
            VALUES (?, ?, ?, ?, ?)
        ", [
            $data['first_name'],
            $data['last_name'],
            $data['phone'],
            $data['email'] ?? null,
            $data['notes'] ?? null
        ]);
        
        $clientId = $db->lastInsertId();
        
        // Dodaj samochód jeśli podano
        if (isset($data['car']) && !empty($data['car']['brand'])) {
            $db->query("
                INSERT INTO cars (client_id, brand, model, color, plate_number, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            ", [
                $clientId,
                $data['car']['brand'],
                $data['car']['model'],
                $data['car']['color'],
                $data['car']['plate_number'] ?? null,
                $data['car']['notes'] ?? null
            ]);
        }
        
        $db->commit();
        
        // Pobierz utworzonego klienta
        $client = $db->fetchOne("SELECT * FROM clients WHERE id = ?", [$clientId]);
        $client['cars'] = $db->fetchAll("SELECT * FROM cars WHERE client_id = ? AND deleted_at IS NULL", [$clientId]);
        
        jsonResponse([
            'message' => 'Klient został dodany pomyślnie',
            'data' => $client
        ], 201);
        
    } catch (Exception $e) {
        $db->rollback();
        errorResponse($e->getMessage(), 500);
    }
}

function handleUpdateClient($db, $id) {
    $data = getRequestData();
    
    // Sprawdź czy klient istnieje
    $client = $db->fetchOne("SELECT * FROM clients WHERE id = ? AND deleted_at IS NULL", [$id]);
    if (!$client) {
        errorResponse('Client not found', 404);
    }
    
    $fields = [];
    $values = [];
    
    if (isset($data['first_name'])) {
        $fields[] = "first_name = ?";
        $values[] = $data['first_name'];
    }
    if (isset($data['last_name'])) {
        $fields[] = "last_name = ?";
        $values[] = $data['last_name'];
    }
    if (isset($data['phone'])) {
        $fields[] = "phone = ?";
        $values[] = $data['phone'];
    }
    if (isset($data['email'])) {
        $fields[] = "email = ?";
        $values[] = $data['email'];
    }
    if (isset($data['notes'])) {
        $fields[] = "notes = ?";
        $values[] = $data['notes'];
    }
    
    if (empty($fields)) {
        errorResponse('No fields to update', 400);
    }
    
    $values[] = $id;
    
    $db->query(
        "UPDATE clients SET " . implode(', ', $fields) . " WHERE id = ?",
        $values
    );
    
    // Pobierz zaktualizowanego klienta
    $client = $db->fetchOne("SELECT * FROM clients WHERE id = ?", [$id]);
    $client['cars'] = $db->fetchAll("SELECT * FROM cars WHERE client_id = ? AND deleted_at IS NULL", [$id]);
    
    jsonResponse([
        'message' => 'Klient został zaktualizowany',
        'data' => $client
    ]);
}

function handleDeleteClient($db, $id) {
    $client = $db->fetchOne("SELECT * FROM clients WHERE id = ? AND deleted_at IS NULL", [$id]);
    if (!$client) {
        errorResponse('Client not found', 404);
    }
    
    $db->query("UPDATE clients SET deleted_at = NOW() WHERE id = ?", [$id]);
    
    jsonResponse(['message' => 'Klient został usunięty']);
}
