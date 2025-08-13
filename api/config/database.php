<?php
/**
 * ====================================
 * CALAMBA MEDICAL CENTER - ITAMS DATABASE CONFIG
 * Database Configuration and Connection
 * ====================================
 */

class Database {
    // Database configuration
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $charset;
    private $conn;

    public function __construct() {
        // Load configuration from environment or defaults
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->db_name = $_ENV['DB_NAME'] ?? 'calamba_itams';
        $this->username = $_ENV['DB_USERNAME'] ?? 'root';
        $this->password = $_ENV['DB_PASSWORD'] ?? '';
        $this->charset = 'utf8mb4';
    }

    /**
     * Database connection
     * @return PDO
     */
    public function getConnection() {
        if ($this->conn !== null) {
            return $this->conn;
        }

        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";
            
            $this->conn = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$this->charset} COLLATE {$this->charset}_unicode_ci"
            ]);

        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw new Exception("Database connection failed", 500);
        }

        return $this->conn;
    }

    /**
     * Close database connection
     */
    public function closeConnection() {
        $this->conn = null;
    }

    /**
     * Check if database connection is alive
     * @return bool
     */
    public function isConnected() {
        try {
            if ($this->conn === null) {
                return false;
            }
            
            $this->conn->query('SELECT 1');
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }

    /**
     * Get database information
     * @return array
     */
    public function getDatabaseInfo() {
        try {
            $conn = $this->getConnection();
            
            // Get MySQL version
            $stmt = $conn->query("SELECT VERSION() as version");
            $version = $stmt->fetch()['version'];
            
            // Get database size
            $stmt = $conn->prepare("
                SELECT 
                    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
                FROM information_schema.tables 
                WHERE table_schema = ?
            ");
            $stmt->execute([$this->db_name]);
            $size = $stmt->fetch()['size_mb'] ?? 0;
            
            // Get table count
            $stmt = $conn->prepare("
                SELECT COUNT(*) as table_count 
                FROM information_schema.tables 
                WHERE table_schema = ?
            ");
            $stmt->execute([$this->db_name]);
            $tableCount = $stmt->fetch()['table_count'];
            
            return [
                'host' => $this->host,
                'database' => $this->db_name,
                'version' => $version,
                'size_mb' => $size,
                'table_count' => $tableCount,
                'charset' => $this->charset,
                'status' => 'connected'
            ];
            
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Initialize database with required tables
     * @return bool
     */
    public function initializeDatabase() {
        try {
            $conn = $this->getConnection();
            
            // Create tables if they don't exist
            $this->createUsersTable($conn);
            $this->createDepartmentsTable($conn);
            $this->createAssetsTable($conn);
            $this->createAssetCategoriesTable($conn);
            $this->createMaintenanceRecordsTable($conn);
            $this->createAuditLogsTable($conn);
            $this->createNotificationsTable($conn);
            $this->createUserSessionsTable($conn);
            
            // Insert default data
            $this->insertDefaultData($conn);
            
            return true;
            
        } catch (Exception $e) {
            error_log("Database initialization error: " . $e->getMessage());
            throw $e;
        }
    }

    private function createUsersTable($conn) {
        $sql = "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            name VARCHAR(100) NOT NULL,
            role ENUM('admin', 'manager', 'user') DEFAULT 'user',
            department_id INT,
            avatar VARCHAR(255),
            phone VARCHAR(20),
            is_active BOOLEAN DEFAULT TRUE,
            last_login TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_username (username),
            INDEX idx_email (email),
            INDEX idx_role (role),
            INDEX idx_department (department_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->exec($sql);
    }

    private function createDepartmentsTable($conn) {
        $sql = "CREATE TABLE IF NOT EXISTS departments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            head_user_id INT,
            location VARCHAR(100),
            budget DECIMAL(15,2),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->exec($sql);
    }

    private function createAssetsTable($conn) {
        $sql = "CREATE TABLE IF NOT EXISTS assets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            asset_tag VARCHAR(50) UNIQUE,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            category_id INT,
            manufacturer VARCHAR(100),
            model VARCHAR(100),
            serial_number VARCHAR(100),
            purchase_date DATE,
            purchase_cost DECIMAL(15,2),
            warranty_expiry DATE,
            department_id INT,
            location VARCHAR(100),
            status ENUM('active', 'maintenance', 'retired', 'under_repair', 'disposed') DEFAULT 'active',
            assigned_to_user_id INT,
            notes TEXT,
            image_url VARCHAR(255),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_asset_tag (asset_tag),
            INDEX idx_name (name),
            INDEX idx_category (category_id),
            INDEX idx_department (department_id),
            INDEX idx_status (status),
            INDEX idx_assigned_to (assigned_to_user_id),
            FULLTEXT idx_search (name, description, manufacturer, model, serial_number)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->exec($sql);
    }

    private function createAssetCategoriesTable($conn) {
        $sql = "CREATE TABLE IF NOT EXISTS asset_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            icon VARCHAR(50),
            color VARCHAR(7),
            parent_id INT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_name (name),
            INDEX idx_parent (parent_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->exec($sql);
    }

    private function createMaintenanceRecordsTable($conn) {
        $sql = "CREATE TABLE IF NOT EXISTS maintenance_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            asset_id INT NOT NULL,
            type ENUM('scheduled', 'corrective', 'preventive') NOT NULL,
            description TEXT NOT NULL,
            performed_by_user_id INT,
            vendor VARCHAR(100),
            cost DECIMAL(15,2),
            scheduled_date DATE,
            completed_date DATE,
            status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_asset (asset_id),
            INDEX idx_type (type),
            INDEX idx_status (status),
            INDEX idx_scheduled_date (scheduled_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->exec($sql);
    }

    private function createAuditLogsTable($conn) {
        $sql = "CREATE TABLE IF NOT EXISTS audit_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            action VARCHAR(50) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INT,
            old_values JSON,
            new_values JSON,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user (user_id),
            INDEX idx_action (action),
            INDEX idx_entity (entity_type, entity_id),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->exec($sql);
    }

    private function createNotificationsTable($conn) {
        $sql = "CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            title VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
            is_read BOOLEAN DEFAULT FALSE,
            related_entity_type VARCHAR(50),
            related_entity_id INT,
            action_url VARCHAR(255),
            expires_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user (user_id),
            INDEX idx_type (type),
            INDEX idx_is_read (is_read),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->exec($sql);
    }

    private function createUserSessionsTable($conn) {
        $sql = "CREATE TABLE IF NOT EXISTS user_sessions (
            id VARCHAR(128) PRIMARY KEY,
            user_id INT NOT NULL,
            ip_address VARCHAR(45),
            user_agent TEXT,
            last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user (user_id),
            INDEX idx_expires_at (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->exec($sql);
    }

    private function insertDefaultData($conn) {
        // Insert default departments
        $conn->exec("INSERT IGNORE INTO departments (id, name, description, location) VALUES 
            (1, 'Information Technology', 'IT Department managing hospital technology infrastructure', 'IT Office - 2nd Floor'),
            (2, 'Administration', 'Hospital administration and management', 'Admin Office - 1st Floor'),
            (3, 'Medical Services', 'Patient care and medical equipment', 'Medical Wing'),
            (4, 'Maintenance', 'Facility and equipment maintenance', 'Maintenance Shop - Basement'),
            (5, 'Human Resources', 'Staff management and recruitment', 'HR Office - 1st Floor'),
            (6, 'Finance', 'Financial operations and accounting', 'Finance Office - 1st Floor')");

        // Insert default asset categories
        $conn->exec("INSERT IGNORE INTO asset_categories (id, name, description, icon, color) VALUES 
            (1, 'Computers & Laptops', 'Desktop computers, laptops, and workstations', 'computer', '#3B82F6'),
            (2, 'Servers & Networking', 'Servers, routers, switches, and network equipment', 'server', '#8B5CF6'),
            (3, 'Medical Equipment', 'Medical devices and diagnostic equipment', 'medical', '#EF4444'),
            (4, 'Office Equipment', 'Printers, scanners, and office machines', 'printer', '#F59E0B'),
            (5, 'Furniture', 'Office furniture and fixtures', 'chair', '#84CC16'),
            (6, 'Vehicles', 'Hospital vehicles and transportation', 'car', '#06B6D4'),
            (7, 'Software Licenses', 'Software applications and licenses', 'software', '#8B5CF6'),
            (8, 'Mobile Devices', 'Tablets, smartphones, and mobile equipment', 'mobile', '#10B981')");

        // Check if admin user exists, if not create default admin
        $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin'");
        $stmt->execute();
        
        if ($stmt->fetchColumn() == 0) {
            // Create default admin user (password: admin123)
            $passwordHash = password_hash('admin123', PASSWORD_DEFAULT);
            $conn->prepare("INSERT INTO users (username, email, password_hash, name, role, department_id) VALUES 
                ('admin', 'admin@calamba-mc.com', ?, 'System Administrator', 'admin', 1)")->execute([$passwordHash]);
            
            // Create sample manager user (password: manager123)
            $passwordHash = password_hash('manager123', PASSWORD_DEFAULT);
            $conn->prepare("INSERT INTO users (username, email, password_hash, name, role, department_id) VALUES 
                ('manager', 'manager@calamba-mc.com', ?, 'IT Manager', 'manager', 1)")->execute([$passwordHash]);
            
            // Create sample regular user (password: user123)
            $passwordHash = password_hash('user123', PASSWORD_DEFAULT);
            $conn->prepare("INSERT INTO users (username, email, password_hash, name, role, department_id) VALUES 
                ('user', 'user@calamba-mc.com', ?, 'IT Staff', 'user', 1)")->execute([$passwordHash]);
        }
    }
}

// Global database instance
$database = new Database();
?>