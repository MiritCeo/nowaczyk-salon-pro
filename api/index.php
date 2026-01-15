<?php
// Włącz logowanie błędów dla produkcji (sprawdź logi serwera)
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

try {
    require_once 'config.php';
    require_once 'cors.php';
    require_once 'helpers.php';
    require_once 'database.php';
    require_once 'auth.php';
} catch (Exception $e) {
    error_log("API Error loading files: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Internal server error', 'message' => 'Failed to load required files']);
    exit;
}

try {
    $db = new Database();
} catch (Exception $e) {
    error_log("API Error creating database: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
    exit;
}

$segments = getPathSegments();
$method = getRequestMethod();

// Router
try {
    // PUBLIC ROUTES
    if (isset($segments[0]) && $segments[0] === 'login' && $method === 'POST') {
        require 'routes/auth.php';
        handleLogin($db);
    }
    
    // PROTECTED ROUTES - wymagają autoryzacji
    $user = Auth::requireAuth();
    
    // Auth routes
    if ($segments[0] === 'logout' && $method === 'POST') {
        require 'routes/auth.php';
        handleLogout($db);
    }
    
    if ($segments[0] === 'me' && $method === 'GET') {
        require 'routes/auth.php';
        handleMe($db, $user);
    }
    
    // Dashboard
    if ($segments[0] === 'dashboard' && $method === 'GET') {
        require 'routes/dashboard.php';
        handleDashboard($db, $user);
    }
    
    // Clients routes
    if ($segments[0] === 'clients') {
        require 'routes/clients.php';
        
        if ($method === 'GET' && !isset($segments[1])) {
            handleGetClients($db);
        } elseif ($method === 'GET' && isset($segments[1])) {
            handleGetClient($db, $segments[1]);
        } elseif ($method === 'POST') {
            handleCreateClient($db);
        } elseif ($method === 'PUT' && isset($segments[1])) {
            handleUpdateClient($db, $segments[1]);
        } elseif ($method === 'DELETE' && isset($segments[1])) {
            handleDeleteClient($db, $segments[1]);
        }
    }
    
    // Cars routes
    if ($segments[0] === 'cars') {
        require 'routes/cars.php';
        
        if ($method === 'GET' && !isset($segments[1])) {
            handleGetCars($db);
        } elseif ($method === 'GET' && isset($segments[1])) {
            handleGetCar($db, $segments[1]);
        } elseif ($method === 'POST') {
            handleCreateCar($db);
        } elseif ($method === 'PUT' && isset($segments[1])) {
            handleUpdateCar($db, $segments[1]);
        } elseif ($method === 'DELETE' && isset($segments[1])) {
            handleDeleteCar($db, $segments[1]);
        }
    }
    
    // Services routes
    if ($segments[0] === 'services') {
        require 'routes/services.php';
        
        if ($method === 'GET' && !isset($segments[1])) {
            handleGetServices($db, $user);
        } elseif ($method === 'GET' && isset($segments[1])) {
            handleGetService($db, $segments[1], $user);
        } elseif ($method === 'POST') {
            handleCreateService($db);
        } elseif ($method === 'PUT' && isset($segments[1])) {
            handleUpdateService($db, $segments[1]);
        } elseif ($method === 'DELETE' && isset($segments[1])) {
            handleDeleteService($db, $segments[1]);
        }
    }
    
    // Employees routes
    if ($segments[0] === 'employees') {
        require 'routes/employees.php';
        if ($method === 'GET') {
            handleGetEmployees($db);
        } elseif ($method === 'POST') {
            handleCreateEmployee($db);
        } elseif ($method === 'PUT' && isset($segments[1])) {
            handleUpdateEmployee($db, $segments[1]);
        } elseif ($method === 'DELETE' && isset($segments[1])) {
            handleDeleteEmployee($db, $segments[1]);
        }
    }
    
    // Appointments routes
    if ($segments[0] === 'appointments') {
        require 'routes/appointments.php';
        
        if ($method === 'GET' && isset($segments[1]) && $segments[1] === 'stats') {
            handleGetAppointmentStats($db);
        } elseif ($method === 'GET' && isset($segments[1]) && isset($segments[2]) && $segments[2] === 'protocol') {
            require 'routes/appointment_protocols.php';
            handleGetAppointmentProtocol($db, $segments[1]);
        } elseif ($method === 'PUT' && isset($segments[1]) && isset($segments[2]) && $segments[2] === 'protocol') {
            require 'routes/appointment_protocols.php';
            handleUpsertAppointmentProtocol($db, $segments[1], $user);
        } elseif ($method === 'GET' && !isset($segments[1])) {
            handleGetAppointments($db, $user);
        } elseif ($method === 'GET' && isset($segments[1])) {
            handleGetAppointment($db, $segments[1], $user);
        } elseif ($method === 'POST') {
            handleCreateAppointment($db);
        } elseif ($method === 'PUT' && isset($segments[1])) {
            handleUpdateAppointment($db, $segments[1]);
        } elseif ($method === 'PATCH' && isset($segments[1]) && isset($segments[2]) && $segments[2] === 'status') {
            handleUpdateAppointmentStatus($db, $segments[1]);
        } elseif ($method === 'PATCH' && isset($segments[1]) && isset($segments[2]) && $segments[2] === 'payment') {
            handleUpdateAppointmentPayment($db, $segments[1], $user);
        } elseif ($method === 'DELETE' && isset($segments[1])) {
            handleDeleteAppointment($db, $segments[1]);
        }
    }
    
    // 404 Not Found
    errorResponse('Endpoint not found', 404);
    
} catch (Exception $e) {
    // Loguj szczegóły błędu
    error_log("API Error: " . $e->getMessage());
    error_log("API Error Trace: " . $e->getTraceAsString());
    
    // W produkcji nie pokazuj szczegółów błędu
    if (ini_get('display_errors')) {
        errorResponse($e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine(), 500);
    } else {
        errorResponse('Internal server error', 500);
    }
}
