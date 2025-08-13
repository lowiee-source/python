<?php
/**
 * ====================================
 * CALAMBA MEDICAL CENTER - ITAMS DATABASE SETUP
 * Database Initialization Script
 * ====================================
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simple authentication for setup
$setup_password = 'calamba_setup_2024';
$provided_password = $_GET['password'] ?? '';

if ($provided_password !== $setup_password) {
    die('Access denied. Please provide the correct setup password in the URL: ?password=your_password');
}

echo "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Calamba Medical Center - ITAMS Database Setup</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; color: #0d9488; }
        .status { padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d1fae5; border: 1px solid #10b981; color: #047857; }
        .error { background: #fee2e2; border: 1px solid #ef4444; color: #dc2626; }
        .info { background: #dbeafe; border: 1px solid #3b82f6; color: #1d4ed8; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; color: #d97706; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .btn { display: inline-block; padding: 10px 20px; background: #0d9488; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .btn:hover { background: #0f766e; }
        .credentials { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .credentials h3 { margin-top: 0; color: #0d9488; }
        .cred-item { margin: 10px 0; font-family: monospace; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🏥 Calamba Medical Center</h1>
            <h2>IT Asset Management System - Database Setup</h2>
        </div>";

try {
    require_once 'api/config/database.php';
    
    echo "<div class='status info'>Starting database setup process...</div>";
    
    // Test database connection
    echo "<h3>1. Testing Database Connection</h3>";
    $conn = $database->getConnection();
    echo "<div class='status success'>✓ Database connection successful!</div>";
    
    // Get database info
    $dbInfo = $database->getDatabaseInfo();
    echo "<div class='status info'>";
    echo "Database: {$dbInfo['database']}<br>";
    echo "Host: {$dbInfo['host']}<br>";
    echo "MySQL Version: {$dbInfo['version']}<br>";
    echo "Current Size: {$dbInfo['size_mb']} MB<br>";
    echo "Tables: {$dbInfo['table_count']}";
    echo "</div>";
    
    // Initialize database
    echo "<h3>2. Creating Tables and Initial Data</h3>";
    $database->initializeDatabase();
    echo "<div class='status success'>✓ Database tables created successfully!</div>";
    echo "<div class='status success'>✓ Default data inserted successfully!</div>";
    
    // Verify installation
    echo "<h3>3. Verifying Installation</h3>";
    
    // Check users table
    $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
    $userCount = $stmt->fetch()['count'];
    echo "<div class='status success'>✓ Users table: {$userCount} users created</div>";
    
    // Check departments table
    $stmt = $conn->query("SELECT COUNT(*) as count FROM departments");
    $deptCount = $stmt->fetch()['count'];
    echo "<div class='status success'>✓ Departments table: {$deptCount} departments created</div>";
    
    // Check asset categories table
    $stmt = $conn->query("SELECT COUNT(*) as count FROM asset_categories");
    $catCount = $stmt->fetch()['count'];
    echo "<div class='status success'>✓ Asset categories table: {$catCount} categories created</div>";
    
    // Display default credentials
    echo "<div class='credentials'>
        <h3>🔐 Default Login Credentials</h3>
        <p><strong>Important:</strong> Please change these passwords after first login!</p>
        
        <div class='cred-item'>
            <strong>Administrator Account:</strong><br>
            Username: admin<br>
            Password: admin123<br>
            Email: admin@calamba-mc.com
        </div>
        
        <div class='cred-item'>
            <strong>Manager Account:</strong><br>
            Username: manager<br>
            Password: manager123<br>
            Email: manager@calamba-mc.com
        </div>
        
        <div class='cred-item'>
            <strong>User Account:</strong><br>
            Username: user<br>
            Password: user123<br>
            Email: user@calamba-mc.com
        </div>
    </div>";
    
    echo "<h3>4. Next Steps</h3>";
    echo "<div class='status info'>";
    echo "1. <strong>Security:</strong> Delete this setup file (setup_database.php) for security<br>";
    echo "2. <strong>Access:</strong> Go to your main application (index.html)<br>";
    echo "3. <strong>Login:</strong> Use the credentials above to access the system<br>";
    echo "4. <strong>Configuration:</strong> Update database credentials in api/config/database.php if needed<br>";
    echo "5. <strong>SSL:</strong> Enable HTTPS for production use";
    echo "</div>";
    
    echo "<div style='text-align: center; margin-top: 30px;'>";
    echo "<a href='index.html' class='btn'>🚀 Go to Application</a>";
    echo "<a href='#' onclick='window.location.reload()' class='btn'>🔄 Run Setup Again</a>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div class='status error'>";
    echo "<strong>Setup Failed!</strong><br>";
    echo "Error: " . htmlspecialchars($e->getMessage()) . "<br><br>";
    echo "<strong>Common Solutions:</strong><br>";
    echo "1. Check your database credentials in api/config/database.php<br>";
    echo "2. Make sure MySQL server is running<br>";
    echo "3. Ensure the database 'calamba_itams' exists<br>";
    echo "4. Check that the web server has permission to connect to MySQL<br>";
    echo "5. Verify MySQL version is 5.7+ (required for JSON support)";
    echo "</div>";
    
    echo "<h3>🛠️ Database Configuration</h3>";
    echo "<p>Current configuration from api/config/database.php:</p>";
    echo "<pre>";
    echo "Host: " . ($_ENV['DB_HOST'] ?? 'localhost') . "\n";
    echo "Database: " . ($_ENV['DB_NAME'] ?? 'calamba_itams') . "\n";
    echo "Username: " . ($_ENV['DB_USERNAME'] ?? 'root') . "\n";
    echo "Password: " . (empty($_ENV['DB_PASSWORD'] ?? '') ? '[empty]' : '[hidden]') . "\n";
    echo "</pre>";
    
    echo "<h3>📋 Manual Database Creation</h3>";
    echo "<p>If the database doesn't exist, create it manually:</p>";
    echo "<pre>CREATE DATABASE calamba_itams CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;</pre>";
}

echo "
        <div style='margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;'>
            <p>Calamba Medical Center - IT Asset Management System v1.0</p>
            <p>For support, contact your IT Administrator</p>
        </div>
    </div>
</body>
</html>";
?>