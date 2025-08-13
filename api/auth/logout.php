<?php
/**
 * ====================================
 * CALAMBA MEDICAL CENTER - ITAMS LOGOUT API
 * User Logout Endpoint
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
    
    $userId = $_SESSION['user_id'] ?? null;
    $sessionId = $_SESSION['session_id'] ?? null;
    
    // Get database connection
    $conn = $database->getConnection();
    
    // Remove session from database if it exists
    if ($sessionId) {
        $stmt = $conn->prepare("DELETE FROM user_sessions WHERE id = ?");
        $stmt->execute([$sessionId]);
    }
    
    // Log logout activity
    if ($userId) {
        logActivity($conn, $userId, 'logout', 'user', $userId, [
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
    }
    
    // Destroy session
    session_destroy();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Logout successful'
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
    error_log("Logout API Error: " . $e->getMessage());
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