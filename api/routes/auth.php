<?php
function handleLogin($db) {
    $data = getRequestData();
    
    // Fallback na $_POST jeśli php://input jest pusty
    if (empty($data) && !empty($_POST)) {
        $data = $_POST;
    }
    
    if (empty($data)) {
        errorResponse('Brak danych w request', 400);
    }
    
    validateRequired($data, ['email', 'password']);
    
    // Znajdź użytkownika
    $user = $db->fetchOne(
        "SELECT * FROM employees WHERE email = ? AND is_active = 1 AND deleted_at IS NULL",
        [$data['email']]
    );
    
    if (!$user) {
        error_log("Login failed: User not found - " . $data['email']);
        errorResponse('Podane dane logowania są nieprawidłowe', 401);
    }
    
    // Sprawdź hasło
    $passwordValid = Auth::verifyPassword($data['password'], $user['password']);
    if (!$passwordValid) {
        error_log("Login failed: Invalid password for - " . $data['email']);
        error_log("Password hash in DB: " . substr($user['password'], 0, 30) . "...");
        errorResponse('Podane dane logowania są nieprawidłowe', 401);
    }
    
    // Generuj token
    $token = Auth::generateToken($user['id'], $user['email'], $user['role']);
    
    // Usuń hasło z odpowiedzi
    unset($user['password']);
    
    jsonResponse([
        'message' => 'Zalogowano pomyślnie',
        'user' => $user,
        'token' => $token
    ]);
}

function handleLogout($db) {
    jsonResponse(['message' => 'Wylogowano pomyślnie']);
}

function handleMe($db, $user) {
    // Pobierz aktualne dane użytkownika
    $userData = $db->fetchOne(
        "SELECT id, name, email, role, is_active, created_at FROM employees WHERE id = ? AND deleted_at IS NULL",
        [$user['user_id']]
    );
    
    if (!$userData) {
        errorResponse('User not found', 404);
    }
    
    jsonResponse(['user' => $userData]);
}
