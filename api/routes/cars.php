<?php
function handleGetCars($db) {
    $params = getQueryParams();
    $where = ["deleted_at IS NULL"];
    $values = [];
    
    if (isset($params['client_id'])) {
        $where[] = "client_id = ?";
        $values[] = $params['client_id'];
    }
    
    $whereClause = implode(' AND ', $where);
    
    $cars = $db->fetchAll("
        SELECT c.*, 
               cl.first_name, cl.last_name
        FROM cars c
        LEFT JOIN clients cl ON c.client_id = cl.id
        WHERE $whereClause
        ORDER BY c.created_at DESC
    ", $values);
    
    jsonResponse(['data' => $cars]);
}

function handleGetCar($db, $id) {
    $car = $db->fetchOne("
        SELECT c.*, 
               cl.first_name, cl.last_name, cl.phone
        FROM cars c
        LEFT JOIN clients cl ON c.client_id = cl.id
        WHERE c.id = ? AND c.deleted_at IS NULL
    ", [$id]);
    
    if (!$car) {
        errorResponse('Car not found', 404);
    }
    
    jsonResponse(['data' => $car]);
}

function handleCreateCar($db) {
    $data = getRequestData();
    validateRequired($data, ['client_id', 'brand', 'model', 'color']);
    
    $db->query("
        INSERT INTO cars (client_id, brand, model, color, plate_number, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    ", [
        $data['client_id'],
        $data['brand'],
        $data['model'],
        $data['color'],
        $data['plate_number'] ?? null,
        $data['notes'] ?? null
    ]);
    
    $carId = $db->lastInsertId();
    $car = $db->fetchOne("SELECT * FROM cars WHERE id = ?", [$carId]);
    
    jsonResponse([
        'message' => 'Pojazd został dodany',
        'data' => $car
    ], 201);
}

function handleUpdateCar($db, $id) {
    $data = getRequestData();
    
    $car = $db->fetchOne("SELECT * FROM cars WHERE id = ? AND deleted_at IS NULL", [$id]);
    if (!$car) {
        errorResponse('Car not found', 404);
    }
    
    $fields = [];
    $values = [];
    
    foreach (['brand', 'model', 'color', 'plate_number', 'notes'] as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $values[] = $data[$field];
        }
    }
    
    if (empty($fields)) {
        errorResponse('No fields to update', 400);
    }
    
    $values[] = $id;
    $db->query("UPDATE cars SET " . implode(', ', $fields) . " WHERE id = ?", $values);
    
    $car = $db->fetchOne("SELECT * FROM cars WHERE id = ?", [$id]);
    
    jsonResponse([
        'message' => 'Pojazd został zaktualizowany',
        'data' => $car
    ]);
}

function handleDeleteCar($db, $id) {
    $car = $db->fetchOne("SELECT * FROM cars WHERE id = ? AND deleted_at IS NULL", [$id]);
    if (!$car) {
        errorResponse('Car not found', 404);
    }
    
    $db->query("UPDATE cars SET deleted_at = NOW() WHERE id = ?", [$id]);
    
    jsonResponse(['message' => 'Pojazd został usunięty']);
}
