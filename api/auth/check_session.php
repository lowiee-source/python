<?php
/**
 * ====================================
 * CALAMBA MEDICAL CENTER - ITAMS SESSION CHECK API
 * Session Validation Endpoint
 * ====================================
 */

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

require_once '../config/database.php';

try {
    // Start session
    session_start();
    
    // Check if user is logged in
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['session_id'])) {
        throw new Exception('No active session found', 401);
    }
    
    $userId = $_SESSION['user_id'];
    $sessionId = $_SESSION['session_id'];
    
    // Get database connection
    $conn = $database->getConnection();
    
    // Verify session in database
    $stmt = $conn->prepare("
        SELECT s.*, u.*, d.name as department_name 
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE s.id = ? AND s.user_id = ? AND s.expires_at > NOW() AND u.is_active = TRUE
    ");
    $stmt->execute([$sessionId, $userId]);
    $sessionData = $stmt->fetch();
    
    if (!$sessionData) {
        // Clean up invalid session
        session_destroy();
        throw new Exception('Session expired or invalid', 401);
    }
    
    // Update last activity
    $stmt = $conn->prepare("UPDATE user_sessions SET last_activity = NOW() WHERE id = ?");
    $stmt->execute([$sessionId]);
    
    // Prepare user data
    $userData = [
        'id' => $sessionData['user_id'],
        'username' => $sessionData['username'],
        'email' => $sessionData['email'],
        'name' => $sessionData['name'],
        'role' => $sessionData['role'],
        'role_display' => ucfirst($sessionData['role']),
        'department' => $sessionData['department_name'],
        'department_id' => $sessionData['department_id'],
        'avatar' => $sessionData['avatar'],
        'phone' => $sessionData['phone'],
        'last_login' => $sessionData['last_login']
    ];
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Session valid',
        'user' => $userData,
        'session_expires_at' => $sessionData['expires_at']
    ]);
    
} catch (Exception $e) {
    $statusCode = $e->getCode() ?: 500;
    http_response_code($statusCode);
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_code' => $statusCode
    ]);
}
?>