<?php
function maskServicePrices(&$services, $user) {
    if (isset($user['role']) && $user['role'] === 'employee') {
        foreach ($services as &$service) {
            $service['price'] = null;
        }
    }
}

function handleGetServices($db, $user) {
    $params = getQueryParams();
    $where = ["deleted_at IS NULL"];
    $values = [];
    
    if (isset($params['active_only']) && $params['active_only'] === 'true') {
        $where[] = "is_active = 1";
    }
    
    if (isset($params['category'])) {
        $where[] = "category = ?";
        $values[] = $params['category'];
    }
    
    if (isset($params['search']) && !empty($params['search'])) {
        $where[] = "(name LIKE ? OR description LIKE ? OR category LIKE ?)";
        $searchTerm = '%' . $params['search'] . '%';
        $values = array_merge($values, [$searchTerm, $searchTerm, $searchTerm]);
    }
    
    $whereClause = implode(' AND ', $where);
    
    $services = $db->fetchAll("
        SELECT * FROM services 
        WHERE $whereClause
        ORDER BY category, name
    ", $values);
    
    maskServicePrices($services, $user);
    jsonResponse(['data' => $services]);
}

function handleGetService($db, $id, $user) {
    $service = $db->fetchOne(
        "SELECT * FROM services WHERE id = ? AND deleted_at IS NULL",
        [$id]
    );
    
    if (!$service) {
        errorResponse('Service not found', 404);
    }
    
    $services = [$service];
    maskServicePrices($services, $user);
    jsonResponse(['data' => $services[0]]);
}

function handleCreateService($db) {
    $data = getRequestData();
    validateRequired($data, ['name', 'duration', 'category']);
    
    $db->query("
        INSERT INTO services (name, description, duration, price, category, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
    ", [
        $data['name'],
        $data['description'] ?? null,
        $data['duration'],
        $data['price'] ?? null,
        $data['category'],
        $data['is_active'] ?? true
    ]);
    
    $serviceId = $db->lastInsertId();
    $service = $db->fetchOne("SELECT * FROM services WHERE id = ?", [$serviceId]);
    
    jsonResponse([
        'message' => 'Usługa została dodana',
        'data' => $service
    ], 201);
}

function handleUpdateService($db, $id) {
    $data = getRequestData();
    
    $service = $db->fetchOne("SELECT * FROM services WHERE id = ? AND deleted_at IS NULL", [$id]);
    if (!$service) {
        errorResponse('Service not found', 404);
    }
    
    $fields = [];
    $values = [];
    
    foreach (['name', 'description', 'duration', 'price', 'category', 'is_active'] as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $values[] = $data[$field];
        }
    }
    
    if (empty($fields)) {
        errorResponse('No fields to update', 400);
    }
    
    $values[] = $id;
    $db->query("UPDATE services SET " . implode(', ', $fields) . " WHERE id = ?", $values);
    
    $service = $db->fetchOne("SELECT * FROM services WHERE id = ?", [$id]);
    
    jsonResponse([
        'message' => 'Usługa została zaktualizowana',
        'data' => $service
    ]);
}

function handleDeleteService($db, $id) {
    $service = $db->fetchOne("SELECT * FROM services WHERE id = ? AND deleted_at IS NULL", [$id]);
    if (!$service) {
        errorResponse('Service not found', 404);
    }
    
    $db->query("UPDATE services SET deleted_at = NOW() WHERE id = ?", [$id]);
    
    jsonResponse(['message' => 'Usługa została usunięta']);
}
