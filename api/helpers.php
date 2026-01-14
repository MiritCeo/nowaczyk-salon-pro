<?php
// Helper functions

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

function errorResponse($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode(['error' => $message]);
    exit();
}

function getRequestData() {
    $input = file_get_contents('php://input');
    if (empty($input)) {
        // Fallback na $_POST jeśli php://input jest pusty
        return $_POST;
    }
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        // Jeśli nie jest JSON, użyj $_POST
        return $_POST;
    }
    return $data ?? [];
}

function validateRequired($data, $fields) {
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        errorResponse('Missing required fields: ' . implode(', ', $missing), 422);
    }
}

function getPathSegments() {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    // Pobierz ścieżkę do folderu api
    $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
    $scriptDir = rtrim($scriptDir, '/');
    
    // Usuń ścieżkę do api z początku
    if ($scriptDir && strpos($path, $scriptDir) === 0) {
        $path = substr($path, strlen($scriptDir));
    }
    
    // Usuń /api/ jeśli jest w ścieżce
    $path = preg_replace('#^/api/#', '', $path);
    $path = preg_replace('#^api/#', '', $path);
    
    // Usuń leading slash
    $path = ltrim($path, '/');
    
    if (empty($path)) {
        return [];
    }
    
    return explode('/', $path);
}

function getRequestMethod() {
    return $_SERVER['REQUEST_METHOD'];
}

function getQueryParams() {
    return $_GET;
}
