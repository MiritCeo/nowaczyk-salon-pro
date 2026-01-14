<?php
class Auth {
    // Prosty JWT encode (bez biblioteki)
    public static function generateToken($userId, $email, $role) {
        if (!defined('JWT_SECRET') || empty(JWT_SECRET)) {
            throw new Exception('JWT_SECRET is not defined in config.php');
        }
        
        $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        
        $payload = base64_encode(json_encode([
            'user_id' => $userId,
            'email' => $email,
            'role' => $role,
            'exp' => time() + JWT_EXPIRATION,
            'iat' => time()
        ]));
        
        $signature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
        
        return "$header.$payload.$signature";
    }
    
    // Walidacja tokena
    public static function validateToken($token) {
        if (!$token) {
            return false;
        }
        
        // Usuń "Bearer " jeśli istnieje
        $token = str_replace('Bearer ', '', $token);
        
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        
        list($header, $payload, $signature) = $parts;
        
        // Sprawdź sygnaturę
        $validSignature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
        if ($signature !== $validSignature) {
            return false;
        }
        
        // Sprawdź expiration
        $data = json_decode(base64_decode($payload), true);
        if ($data['exp'] < time()) {
            return false; // Token wygasł
        }
        
        return $data;
    }
    
    // Pobierz token z headera
    public static function getToken() {
        $headers = getallheaders();
        return $headers['Authorization'] ?? $headers['authorization'] ?? null;
    }
    
    // Middleware - wymaga autoryzacji
    public static function requireAuth() {
        // TRYB TESTOWY - pomiń weryfikację tokenów
        if (defined('TEST_MODE_NO_AUTH') && TEST_MODE_NO_AUTH) {
            error_log("🧪 TRYB TESTOWY API: Pomijam weryfikację tokenów");
            // Zwróć mock user dla trybu testowego
            return [
                'user_id' => 1,
                'email' => 'test@nowaczyk.pl',
                'role' => 'admin'
            ];
        }
        
        $token = self::getToken();
        $user = self::validateToken($token);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }
        
        return $user;
    }
    
    // Hash hasła
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT);
    }
    
    // Weryfikuj hasło
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
}
