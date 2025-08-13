<?php
/**
 * ====================================
 * CALAMBA MEDICAL CENTER - ITAMS LOGIN API
 * User Authentication Endpoint
 * ====================================
 */

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

require_once '../config/database.php';

try {
    // Start session
    session_start();
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    if (!isset($input['username']) || !isset($input['password'])) {
        throw new Exception('Username and password are required', 400);
    }
    
    $username = trim($input['username']);
    $password = $input['password'];
    
    if (empty($username) || empty($password)) {
        throw new Exception('Username and password cannot be empty', 400);
    }
    
    // Rate limiting check (basic implementation)
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $rateLimitKey = "login_attempts_{$ip}";
    
    // Check if IP is temporarily blocked
    if (isset($_SESSION[$rateLimitKey]) && $_SESSION[$rateLimitKey]['count'] >= 5) {
        $lastAttempt = $_SESSION[$rateLimitKey]['last_attempt'];
        if (time() - $lastAttempt < 300) { // 5 minutes block
            throw new Exception('Too many failed login attempts. Please try again in 5 minutes.', 429);
        } else {
            // Reset counter after 5 minutes
            unset($_SESSION[$rateLimitKey]);
        }
    }
    
    // Get database connection
    $conn = $database->getConnection();
    
    // Find user by username or email
    $stmt = $conn->prepare("
        SELECT u.*, d.name as department_name 
        FROM users u 
        LEFT JOIN departments d ON u.department_id = d.id 
        WHERE (u.username = ? OR u.email = ?) AND u.is_active = TRUE
    ");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password_hash'])) {
        // Increment failed attempt counter
        if (!isset($_SESSION[$rateLimitKey])) {
            $_SESSION[$rateLimitKey] = ['count' => 0, 'last_attempt' => 0];
        }
        $_SESSION[$rateLimitKey]['count']++;
        $_SESSION[$rateLimitKey]['last_attempt'] = time();
        
        // Log failed login attempt
        logActivity($conn, null, 'login_failed', 'user', null, [
            'username' => $username,
            'ip_address' => $ip,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
        
        throw new Exception('Invalid username or password', 401);
    }
    
    // Reset rate limiting on successful login
    if (isset($_SESSION[$rateLimitKey])) {
        unset($_SESSION[$rateLimitKey]);
    }
    
    // Generate session ID
    $sessionId = bin2hex(random_bytes(32));
    
    // Store session in database
    $expiresAt = date('Y-m-d H:i:s', time() + (24 * 60 * 60)); // 24 hours
    $stmt = $conn->prepare("
        INSERT INTO user_sessions (id, user_id, ip_address, user_agent, expires_at) 
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $sessionId,
        $user['id'],
        $ip,
        $_SERVER['HTTP_USER_AGENT'] ?? '',
        $expiresAt
    ]);
    
    // Update user's last login
    $stmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);
    
    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['session_id'] = $sessionId;
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];
    
    // Log successful login
    logActivity($conn, $user['id'], 'login_success', 'user', $user['id'], [
        'ip_address' => $ip,
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
    ]);
    
    // Prepare user data to return (excluding sensitive information)
    $userData = [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'role_display' => ucfirst($user['role']),
        'department' => $user['department_name'],
        'department_id' => $user['department_id'],
        'avatar' => $user['avatar'],
        'phone' => $user['phone'],
        'last_login' => $user['last_login']
    ];
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => $userData,
        'session_id' => $sessionId
    ]);
    
} catch (Exception $e) {
    $statusCode = $e->getCode() ?: 500;
    http_response_code($statusCode);
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_code' => $statusCode
    ]);
    
    // Log error
    error_log("Login API Error: " . $e->getMessage());
}

/**
 * Log user activity
 */
function logActivity($conn, $userId, $action, $entityType, $entityId, $data = []) {
    try {
        $stmt = $conn->prepare("
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $userId,
            $action,
            $entityType,
            $entityId,
            json_encode($data),
            $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
            $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
    } catch (Exception $e) {
        error_log("Failed to log activity: " . $e->getMessage());
    }
}
?>