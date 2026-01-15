<?php

function handleGetEmployees($db) {
    $employees = $db->fetchAll(
        "SELECT id, name, email, role, is_active, notification_email, notification_phone 
         FROM employees 
         WHERE deleted_at IS NULL 
         ORDER BY name"
    );
    
    jsonResponse([
        'data' => $employees
    ]);
}

function handleCreateEmployee($db) {
    $data = getRequestData();
    validateRequired($data, ['name', 'email', 'password']);

    $role = $data['role'] ?? 'employee';
    if (!in_array($role, ['admin', 'employee'])) {
        errorResponse('Invalid role', 400);
    }

    $hashedPassword = Auth::hashPassword($data['password']);

    $db->query("
        INSERT INTO employees (name, email, password, role, is_active, notification_email, notification_phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ", [
        $data['name'],
        $data['email'],
        $hashedPassword,
        $role,
        isset($data['is_active']) ? (int)$data['is_active'] : 1,
        $data['notification_email'] ?? null,
        $data['notification_phone'] ?? null
    ]);

    $employeeId = $db->lastInsertId();
    $employee = $db->fetchOne("
        SELECT id, name, email, role, is_active, notification_email, notification_phone 
        FROM employees WHERE id = ?
    ", [$employeeId]);

    jsonResponse([
        'message' => 'Pracownik został dodany',
        'data' => $employee
    ], 201);
}

function handleUpdateEmployee($db, $id) {
    $data = getRequestData();

    $employee = $db->fetchOne("SELECT * FROM employees WHERE id = ? AND deleted_at IS NULL", [$id]);
    if (!$employee) {
        errorResponse('Employee not found', 404);
    }

    $fields = [];
    $values = [];

    foreach (['name', 'email', 'role', 'is_active', 'notification_email', 'notification_phone'] as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $values[] = $data[$field];
        }
    }

    if (!empty($data['password'])) {
        $fields[] = "password = ?";
        $values[] = Auth::hashPassword($data['password']);
    }

    if (empty($fields)) {
        errorResponse('No fields to update', 400);
    }

    $values[] = $id;
    $db->query("UPDATE employees SET " . implode(', ', $fields) . " WHERE id = ?", $values);

    $employee = $db->fetchOne("
        SELECT id, name, email, role, is_active, notification_email, notification_phone 
        FROM employees WHERE id = ?
    ", [$id]);

    jsonResponse([
        'message' => 'Pracownik został zaktualizowany',
        'data' => $employee
    ]);
}

function handleDeleteEmployee($db, $id) {
    $employee = $db->fetchOne("SELECT * FROM employees WHERE id = ? AND deleted_at IS NULL", [$id]);
    if (!$employee) {
        errorResponse('Employee not found', 404);
    }

    if ($employee['role'] === 'admin') {
        errorResponse('Nie można usunąć konta administratora', 403);
    }

    $db->query("UPDATE employees SET deleted_at = NOW() WHERE id = ?", [$id]);
    jsonResponse(['message' => 'Pracownik został usunięty']);
}
