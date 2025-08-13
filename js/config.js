// ====================================
// CALAMBA MEDICAL CENTER - ITAMS CONFIG
// Configuration and Constants
// ====================================

// Application Configuration
const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'api/',
        ENDPOINTS: {
            // Authentication
            LOGIN: 'auth/login.php',
            LOGOUT: 'auth/logout.php',
            CHECK_SESSION: 'auth/check_session.php',
            
            // Assets
            ASSETS: 'assets/assets.php',
            ASSET_CREATE: 'assets/create.php',
            ASSET_UPDATE: 'assets/update.php',
            ASSET_DELETE: 'assets/delete.php',
            ASSET_IMPORT: 'assets/import.php',
            ASSET_EXPORT: 'assets/export.php',
            
            // Account Management
            ACCOUNTS: 'accounts/accounts.php',
            ACCOUNT_CREATE: 'accounts/create.php',
            ACCOUNT_UPDATE: 'accounts/update.php',
            ACCOUNT_DELETE: 'accounts/delete.php',
            
            // Activity Logs
            ACTIVITY_LOGS: 'logs/activity.php',
            SYSTEM_LOGS: 'logs/system.php',
            
            // History
            HISTORY: 'history/history.php',
            
            // Reports and Analytics
            DASHBOARD_STATS: 'reports/dashboard_stats.php',
            REPORTS: 'reports/reports.php',
            
            // Issue Reporting
            REPORT_ISSUE: 'issues/report.php',
            
            // Notifications
            NOTIFICATIONS: 'notifications/notifications.php',
            MARK_READ: 'notifications/mark_read.php'
        },
        TIMEOUT: 30000 // 30 seconds
    },
    
    // Application Settings
    APP: {
        NAME: 'IT Asset Management System',
        SHORT_NAME: 'ITAMS',
        ORGANIZATION: 'Calamba Medical Center',
        VERSION: '2.0.0',
        LOGO_PATH: 'img/logo.png'
    },
    
    // User Roles and Permissions
    ROLES: {
        SUPER_ADMIN: 'Super Admin',
        ADMIN: 'Admin',
        USER: 'User'
    },
    
    PERMISSIONS: {
        'Super Admin': {
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
            canImport: true,
            canExport: true,
            canManageAccounts: true,
            canViewLogs: true,
            canReportIssues: true
        },
        'Admin': {
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
            canImport: true,
            canExport: true,
            canManageAccounts: false,
            canViewLogs: true,
            canReportIssues: true
        },
        'User': {
            canCreate: false,
            canRead: true,
            canUpdate: false,
            canDelete: false,
            canImport: false,
            canExport: false,
            canManageAccounts: false,
            canViewLogs: true,
            canReportIssues: true
        }
    },
    
    // Asset Types and Categories
    ASSET_TYPES: [
        'Computer',
        'Monitor',
        'Printer',
        'Scanner',
        'Network Device',
        'Mobile Device',
        'Medical Equipment',
        'Other'
    ],
    
    ASSET_STATUS: [
        'Available',
        'In Use',
        'Maintenance',
        'Retired'
    ],
    
    DEPARTMENTS: [
        'IT Department',
        'Emergency',
        'Laboratory',
        'Radiology',
        'Administration',
        'Nursing',
        'Pharmacy',
        'Finance',
        'Human Resources'
    ],
    
    BUILDINGS: [
        'Main Building',
        'Tower 1',
        'Tower 2',
        'Tower 3',
        'Tower 4',
        'Emergency Wing',
        'Laboratory Building'
    ],
    
    // UI Configuration
    UI: {
        ITEMS_PER_PAGE: 25,
        SEARCH_DEBOUNCE: 300, // milliseconds
        NOTIFICATION_DURATION: 5000, // milliseconds
        CHART_COLORS: {
            PRIMARY: '#0d9488',
            SECONDARY: '#14b8a6',
            SUCCESS: '#10b981',
            WARNING: '#f59e0b',
            DANGER: '#ef4444',
            INFO: '#3b82f6',
            LIGHT: '#6ee7b7',
            MUTED: '#9ca3af'
        },
        CHART_ANIMATION_DURATION: 1000
    },
    
    // Validation Rules
    VALIDATION: {
        USERNAME: {
            MIN_LENGTH: 3,
            MAX_LENGTH: 50,
            PATTERN: /^[a-zA-Z0-9_]+$/
        },
        PASSWORD: {
            MIN_LENGTH: 6,
            MAX_LENGTH: 100
        },
        ASSET_ID: {
            MIN_LENGTH: 3,
            MAX_LENGTH: 20,
            PATTERN: /^[A-Z0-9\-]+$/
        },
        SERIAL_NUMBER: {
            MIN_LENGTH: 3,
            MAX_LENGTH: 50
        }
    },
    
    // File Upload Configuration
    UPLOAD: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_TYPES: ['text/csv', 'application/vnd.ms-excel'],
        ALLOWED_EXTENSIONS: ['.csv', '.xls', '.xlsx']
    },
    
    // Date and Time Formats
    DATE_FORMATS: {
        DISPLAY: 'MMM DD, YYYY',
        DATETIME_DISPLAY: 'MMM DD, YYYY HH:mm',
        INPUT: 'YYYY-MM-DD',
        DATETIME_INPUT: 'YYYY-MM-DDTHH:mm'
    },
    
    // FAQ Data for Help Section
    FAQ_DATA: [
        {
            id: 1,
            question: "How do I add a new IT asset?",
            answer: "To add a new asset, go to the Assets section and click the 'Add Asset' button. Fill in the required information including asset type, brand, serial number, and status. Only users with admin privileges can add assets.",
            keywords: ["add", "asset", "new", "create", "admin"]
        },
        {
            id: 2,
            question: "How do I report an issue with an asset?",
            answer: "Click the 'Report Issue' button in the Assets section. Enter the asset ID, select your department, choose the issue type, and provide a detailed description of the problem. The IT team will be notified automatically.",
            keywords: ["report", "issue", "problem", "asset", "malfunction"]
        },
        {
            id: 3,
            question: "What information is tracked for each asset?",
            answer: "We track asset type, brand/model, serial number, purchase date, current status, assigned user, department, location, IP address (for network devices), MAC address, and maintenance history.",
            keywords: ["information", "track", "data", "details", "fields"]
        },
        {
            id: 4,
            question: "How do I search for specific assets?",
            answer: "Use the search bar in the Assets section to find assets by asset ID, serial number, brand, or assigned user. You can also use the filter dropdowns to narrow results by status, department, or location.",
            keywords: ["search", "find", "filter", "locate", "asset"]
        },
        {
            id: 5,
            question: "Can I export asset data?",
            answer: "Yes, users with appropriate permissions can export asset data to CSV format using the Export button in the Assets section. This includes all asset information and current status.",
            keywords: ["export", "download", "csv", "data", "backup"]
        },
        {
            id: 6,
            question: "How do I update asset information?",
            answer: "Click the Edit button next to an asset in the Assets table. Update the necessary fields and click Save. Only admin users can modify asset information.",
            keywords: ["edit", "update", "modify", "change", "admin"]
        },
        {
            id: 7,
            question: "What do the different asset statuses mean?",
            answer: "Available: Ready for deployment. In Use: Currently assigned and active. Maintenance: Under repair or scheduled maintenance. Retired: No longer in service.",
            keywords: ["status", "available", "in use", "maintenance", "retired"]
        },
        {
            id: 8,
            question: "How can I view asset history?",
            answer: "Go to the History section to view all changes made to assets, including status updates, assignments, and maintenance records. This provides a complete audit trail.",
            keywords: ["history", "changes", "audit", "trail", "log"]
        },
        {
            id: 9,
            question: "Who can access the system?",
            answer: "Access is controlled by user roles: Super Admin (full access), Admin (asset management), and User (view and report issues). Contact IT to request access or role changes.",
            keywords: ["access", "roles", "permissions", "user", "admin"]
        },
        {
            id: 10,
            question: "How do I import multiple assets at once?",
            answer: "Use the Import CSV feature in the Assets section. Download the template, fill in your asset data, and upload the file. Duplicate serial numbers will update existing assets.",
            keywords: ["import", "csv", "bulk", "multiple", "upload"]
        }
    ],
    
    // Message Templates
    MESSAGES: {
        SUCCESS: {
            ASSET_CREATED: 'Asset created successfully!',
            ASSET_UPDATED: 'Asset updated successfully!',
            ASSET_DELETED: 'Asset deleted successfully!',
            ISSUE_REPORTED: 'Issue reported successfully! The IT team has been notified.',
            DATA_EXPORTED: 'Data exported successfully!',
            DATA_IMPORTED: 'Data imported successfully!',
            LOGIN_SUCCESS: 'Welcome back!',
            LOGOUT_SUCCESS: 'Logged out successfully!'
        },
        ERROR: {
            GENERIC: 'An unexpected error occurred. Please try again.',
            NETWORK: 'Network error. Please check your connection.',
            UNAUTHORIZED: 'You are not authorized to perform this action.',
            SESSION_EXPIRED: 'Your session has expired. Please log in again.',
            VALIDATION_FAILED: 'Please check your input and try again.',
            FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
            INVALID_FILE_TYPE: 'Invalid file type. Please upload a CSV file.',
            DUPLICATE_ASSET: 'An asset with this serial number already exists.',
            ASSET_NOT_FOUND: 'Asset not found.',
            LOGIN_FAILED: 'Invalid username or password.'
        },
        CONFIRM: {
            DELETE_ASSET: 'Are you sure you want to delete this asset? This action cannot be undone.',
            DELETE_ACCOUNT: 'Are you sure you want to delete this account? This action cannot be undone.',
            LOGOUT: 'Are you sure you want to log out?',
            CLEAR_FILTERS: 'Clear all filters and reset the view?'
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}