# 🏥 Calamba Medical Center - IT Asset Management System

A professional, light green-themed IT Asset Management System designed specifically for hospital environments with glassmorphism UI design.

![License](https://img.shields.io/badge/license-MIT-green.svg)
![PHP](https://img.shields.io/badge/PHP-7.4+-blue.svg)
![MySQL](https://img.shields.io/badge/MySQL-5.7+-orange.svg)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)

## ✨ Features

### 🎨 Professional Light Green Theme
- Medical-appropriate light green color scheme
- Glassmorphism effects with subtle transparencies
- Professional hospital-grade UI design
- Responsive design for all screen sizes

### 🔐 User Management & Security
- Role-based access control (Admin, Manager, User)
- Secure authentication with session management
- Rate limiting for login attempts
- Audit logging for all activities

### 📊 Dashboard & Analytics
- Interactive Chart.js visualizations
- Asset status overview
- Department distribution charts
- Trend analysis and metrics

### 🏗️ Asset Management
- Complete CRUD operations for IT assets
- Asset categorization and tagging
- Advanced search and filtering
- Bulk import/export functionality
- Asset history tracking

### 🔧 Advanced Features
- **Fixed Modal Centering**: Proper modal positioning for all screen sizes
- **Working Notifications**: Real-time notification system
- **Role Restrictions**: User role-based CRUD limitations
- **Searchable Help**: FAQ section with search functionality
- **Report Issue**: Feature for regular users to report problems

## 🚀 Quick Start

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache/Nginx)
- Modern web browser

### Installation

1. **Clone or download the project**
   ```bash
   git clone [repository-url]
   cd calamba-itams
   ```

2. **Configure database connection**
   
   Edit `api/config/database.php` if needed:
   ```php
   // Default configuration
   $this->host = 'localhost';
   $this->db_name = 'calamba_itams';
   $this->username = 'root';
   $this->password = '';
   ```

3. **Create the database**
   ```sql
   CREATE DATABASE calamba_itams CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Run the setup script**
   
   Navigate to: `http://your-domain/setup_database.php?password=calamba_setup_2024`
   
   This will:
   - Create all required tables
   - Insert default departments and categories
   - Create default user accounts

5. **Access the application**
   
   Go to: `http://your-domain/index.html`

### Default Login Credentials

⚠️ **Important**: Change these passwords after first login!

| Role | Username | Password | Email |
|------|----------|----------|-------|
| Administrator | `admin` | `admin123` | admin@calamba-mc.com |
| Manager | `manager` | `manager123` | manager@calamba-mc.com |
| User | `user` | `user123` | user@calamba-mc.com |

## 📁 Project Structure

```
calamba-itams/
├── index.html                 # Main application entry point
├── setup_database.php         # Database setup script
├── README.md                  # This file
├── css/
│   └── style.css             # Main styles with light green theme
├── js/
│   ├── config.js             # Application configuration
│   ├── utils.js              # Utility functions
│   ├── app.js                # Main application controller
│   └── assets.js             # Asset management module
├── api/
│   ├── config/
│   │   └── database.php      # Database configuration
│   └── auth/
│       ├── login.php         # Login endpoint
│       ├── logout.php        # Logout endpoint
│       └── check_session.php # Session validation
└── img/
    └── (application images)
```

## 🎯 User Roles & Permissions

### 👨‍💼 Administrator
- Full system access
- User management
- System settings
- All CRUD operations
- View all reports and analytics

### 👨‍💻 Manager
- Asset management (CRUD)
- View reports
- Department management
- Limited user management

### 👤 User
- View assets
- Report issues
- Basic search functionality
- Personal profile management

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login.php` - User login
- `POST /api/auth/logout.php` - User logout
- `GET /api/auth/check_session.php` - Session validation

### Assets (Coming Soon)
- `GET /api/assets/assets.php` - Get assets list
- `POST /api/assets/create.php` - Create new asset
- `PUT /api/assets/update.php` - Update asset
- `DELETE /api/assets/delete.php` - Delete asset

## 🎨 Theme Customization

The light green medical theme uses these primary colors:

```css
:root {
  --primary-green: #0d9488;        /* Teal-600 */
  --primary-green-light: #14b8a6;  /* Teal-500 */
  --accent-green: #10b981;         /* Emerald-500 */
  --light-green: #6ee7b7;          /* Emerald-300 */
  --very-light-green: #d1fae5;     /* Emerald-100 */
}
```

## 📊 Database Schema

### Core Tables
- **users** - User accounts and authentication
- **departments** - Hospital departments
- **assets** - IT assets and equipment
- **asset_categories** - Asset categorization
- **maintenance_records** - Maintenance history
- **audit_logs** - System activity logs
- **notifications** - User notifications
- **user_sessions** - Active user sessions

## 🔒 Security Features

- **Password Hashing**: PHP password_hash() with strong algorithms
- **Session Management**: Database-backed sessions with expiration
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Prepared statements throughout
- **XSS Protection**: Input sanitization and CSP headers
- **Audit Logging**: Complete activity tracking

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 Mobile Responsiveness

Fully responsive design optimized for:
- Desktop (1920px+)
- Laptop (1366px+)
- Tablet (768px+)
- Mobile (320px+)

## 🛠️ Development

### Adding New Features

1. **Frontend**: Add components to appropriate JS modules
2. **Backend**: Create new API endpoints in `/api/`
3. **Database**: Update schema in `database.php`
4. **Styles**: Follow existing CSS patterns and color scheme

### Code Style

- **PHP**: PSR-12 coding standards
- **JavaScript**: ES6+ with consistent naming
- **CSS**: BEM methodology for classes
- **Database**: Snake_case naming convention

## 📈 Performance Optimization

- **Lazy Loading**: Assets loaded on demand
- **Caching**: Browser caching for static assets
- **Minification**: CSS and JS minification ready
- **Database Indexing**: Optimized database queries
- **Image Optimization**: Compressed images and sprites

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service is running
   - Verify database credentials
   - Ensure database exists

2. **Session Issues**
   - Check PHP session configuration
   - Verify write permissions for session directory
   - Clear browser cookies

3. **Permission Denied**
   - Check file permissions (755 for directories, 644 for files)
   - Verify web server user permissions

### Debug Mode

Enable debug mode by adding to `config.php`:
```php
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

## 📞 Support

For technical support or questions:
- **IT Department**: Contact your system administrator
- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs through the built-in issue reporting system

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏥 About Calamba Medical Center

This IT Asset Management System was specifically designed for Calamba Medical Center to manage their technology infrastructure efficiently and professionally.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready

Made with ❤️ for Calamba Medical Center