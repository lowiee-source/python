// ====================================
// CALAMBA MEDICAL CENTER - ITAMS MAIN APP
// Main Application Controller
// ====================================

class ITAMSApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'welcome';
        this.isInitialized = false;
        this.charts = {};
        
        // Bind methods to preserve 'this' context
        this.init = this.init.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.handleNavigation = this.handleNavigation.bind(this);
        
        // Initialize app when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.init);
        } else {
            this.init();
        }
    }

    // ================================
    // INITIALIZATION
    // ================================
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('Initializing Calamba Medical Center ITAMS...');
            
            // Show loading screen
            Utils.showLoading(true);
            
            // Initialize components
            await this.initializeComponents();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Check for existing session
            await this.checkSession();
            
            // Hide loading screen
            setTimeout(() => {
                Utils.showLoading(false);
            }, 1000);
            
            this.isInitialized = true;
            console.log('ITAMS initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize ITAMS:', error);
            Utils.showNotification('error', 'Failed to initialize application');
            Utils.showLoading(false);
        }
    }

    async initializeComponents() {
        // Initialize dashboard charts if user is logged in
        if (this.currentUser) {
            this.initializeDashboard();
        }
        
        // Initialize data tables
        this.initializeDataTables();
        
        // Initialize form validation
        this.initializeFormValidation();
        
        // Load user preferences
        this.loadUserPreferences();
    }

    setupEventListeners() {
        // Navigation listeners
        document.addEventListener('click', (e) => {
            // Handle navigation clicks
            if (e.target.matches('[data-section]')) {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.navigateToSection(section);
            }
            
            // Handle modal close
            if (e.target.matches('.modal-overlay') || e.target.matches('.btn-cancel')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    Utils.showModal(modal.id, false);
                }
            }
            
            // Handle form submissions
            if (e.target.matches('.btn-submit')) {
                e.preventDefault();
                const form = e.target.closest('form');
                if (form) {
                    this.handleFormSubmit(form);
                }
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key closes modals
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    Utils.showModal(openModal.id, false);
                }
            }
            
            // Ctrl+/ shows help
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.navigateToSection('help');
            }
        });

        // Form input listeners
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.handleInputChange(e.target);
            }
        });

        // Search functionality
        const searchInputs = document.querySelectorAll('.search-input');
        searchInputs.forEach(input => {
            input.addEventListener('input', Utils.debounce((e) => {
                this.handleSearch(e.target.value, e.target.dataset.target);
            }, 300));
        });

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin);
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout);
        }
    }

    // ================================
    // AUTHENTICATION
    // ================================
    
    async checkSession() {
        try {
            const response = await Utils.apiRequest(CONFIG.API.ENDPOINTS.CHECK_SESSION);
            
            if (response.success && response.user) {
                this.currentUser = response.user;
                this.showDashboard();
            } else {
                this.showWelcome();
            }
        } catch (error) {
            console.log('No active session found');
            this.showWelcome();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        // Validate form
        const validation = Utils.validateForm(credentials, {
            username: { required: true, minLength: 3 },
            password: { required: true, minLength: 6 }
        });

        if (!validation.isValid) {
            this.showFormErrors(form, validation.errors);
            return;
        }

        try {
            // Show loading state
            const submitBtn = form.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Signing in...';
            submitBtn.disabled = true;

            const response = await Utils.apiRequest(CONFIG.API.ENDPOINTS.LOGIN, {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            if (response.success) {
                this.currentUser = response.user;
                Utils.showNotification('success', `Welcome back, ${response.user.name}!`);
                this.showDashboard();
                form.reset();
            } else {
                throw new Error(response.message || 'Login failed');
            }

        } catch (error) {
            console.error('Login error:', error);
            Utils.showNotification('error', error.message || 'Login failed. Please try again.');
        } finally {
            // Reset button state
            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleLogout() {
        try {
            await Utils.apiRequest(CONFIG.API.ENDPOINTS.LOGOUT, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.currentUser = null;
            localStorage.clear();
            sessionStorage.clear();
            Utils.showNotification('info', 'You have been logged out');
            this.showWelcome();
        }
    }

    // ================================
    // NAVIGATION
    // ================================
    
    navigateToSection(section) {
        if (!this.currentUser && section !== 'login' && section !== 'welcome') {
            Utils.showNotification('warning', 'Please log in to access this section');
            this.showLogin();
            return;
        }

        // Check permissions
        if (!this.hasPermission(section)) {
            Utils.showNotification('error', 'You do not have permission to access this section');
            return;
        }

        this.currentSection = section;
        Utils.showSection(section);
        
        // Load section-specific data
        this.loadSectionData(section);
        
        // Update URL without page reload
        if (history.pushState) {
            history.pushState({ section }, '', `#${section}`);
        }
    }

    handleNavigation(e) {
        e.preventDefault();
        const section = e.target.dataset.section;
        if (section) {
            this.navigateToSection(section);
        }
    }

    hasPermission(section) {
        if (!this.currentUser) return false;
        
        const userRole = this.currentUser.role;
        const permissions = CONFIG.USER_ROLES[userRole]?.permissions || [];
        
        // Admin has access to everything
        if (userRole === 'admin') return true;
        
        // Check specific section permissions
        const sectionPermissions = {
            dashboard: ['dashboard.view'],
            assets: ['assets.view'],
            users: ['users.view'],
            departments: ['departments.view'],
            reports: ['reports.view'],
            settings: ['settings.view'],
            help: [] // Everyone can access help
        };
        
        const requiredPerms = sectionPermissions[section] || [];
        return requiredPerms.length === 0 || requiredPerms.some(perm => permissions.includes(perm));
    }

    // ================================
    // UI MANAGEMENT
    // ================================
    
    showWelcome() {
        Utils.showSection('welcome');
        this.currentSection = 'welcome';
    }

    showLogin() {
        Utils.showSection('login');
        this.currentSection = 'login';
        
        // Focus username field
        setTimeout(() => {
            const usernameField = document.querySelector('#loginForm input[name="username"]');
            if (usernameField) {
                usernameField.focus();
            }
        }, 100);
    }

    showDashboard() {
        Utils.showSection('dashboard');
        this.currentSection = 'dashboard';
        this.loadDashboardData();
        this.updateUserInfo();
    }

    updateUserInfo() {
        if (!this.currentUser) return;
        
        // Update user name display
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = this.currentUser.name;
        });
        
        // Update user role display
        const userRoleElements = document.querySelectorAll('.user-role');
        userRoleElements.forEach(el => {
            el.textContent = this.currentUser.role_display || this.currentUser.role;
        });
        
        // Update user avatar
        const userAvatarElements = document.querySelectorAll('.user-avatar');
        userAvatarElements.forEach(el => {
            if (this.currentUser.avatar) {
                el.src = this.currentUser.avatar;
            } else {
                el.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.name)}&background=0d9488&color=fff`;
            }
        });
    }

    // ================================
    // DATA LOADING
    // ================================
    
    async loadSectionData(section) {
        try {
            switch (section) {
                case 'dashboard':
                    await this.loadDashboardData();
                    break;
                case 'assets':
                    await this.loadAssetsData();
                    break;
                case 'users':
                    await this.loadUsersData();
                    break;
                case 'departments':
                    await this.loadDepartmentsData();
                    break;
                case 'reports':
                    await this.loadReportsData();
                    break;
                default:
                    // Section doesn't require data loading
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${section} data:`, error);
            Utils.showNotification('error', `Failed to load ${section} data`);
        }
    }

    async loadDashboardData() {
        try {
            const [statsResponse, recentAssetsResponse, alertsResponse] = await Promise.all([
                Utils.apiRequest(CONFIG.API.ENDPOINTS.DASHBOARD_STATS),
                Utils.apiRequest(CONFIG.API.ENDPOINTS.DASHBOARD_RECENT_ASSETS),
                Utils.apiRequest(CONFIG.API.ENDPOINTS.DASHBOARD_ALERTS)
            ]);

            if (statsResponse.success) {
                this.updateDashboardStats(statsResponse.data);
            }

            if (recentAssetsResponse.success) {
                this.updateRecentAssets(recentAssetsResponse.data);
            }

            if (alertsResponse.success) {
                this.updateDashboardAlerts(alertsResponse.data);
            }

            // Initialize or update charts
            this.initializeDashboard();

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    async loadAssetsData() {
        try {
            const response = await Utils.apiRequest(CONFIG.API.ENDPOINTS.ASSETS);
            
            if (response.success) {
                this.renderAssetsTable(response.data);
            }
        } catch (error) {
            console.error('Failed to load assets data:', error);
        }
    }

    // ================================
    // FORM HANDLING
    // ================================
    
    handleFormSubmit(form) {
        const formType = form.dataset.type;
        
        switch (formType) {
            case 'asset':
                this.handleAssetForm(form);
                break;
            case 'user':
                this.handleUserForm(form);
                break;
            case 'department':
                this.handleDepartmentForm(form);
                break;
            default:
                console.warn('Unknown form type:', formType);
        }
    }

    handleInputChange(input) {
        // Remove error styling when user starts typing
        input.classList.remove('error');
        const errorElement = input.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        
        // Real-time validation for specific inputs
        if (input.type === 'email') {
            this.validateEmailInput(input);
        }
    }

    validateEmailInput(input) {
        const isValid = Utils.isValidEmail(input.value);
        input.classList.toggle('error', !isValid && input.value.length > 0);
    }

    showFormErrors(form, errors) {
        // Clear existing errors
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        
        // Show new errors
        Object.entries(errors).forEach(([field, message]) => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('error');
                
                const errorEl = document.createElement('div');
                errorEl.className = 'error-message';
                errorEl.textContent = message;
                input.parentElement.appendChild(errorEl);
            }
        });
        
        // Focus first error field
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.focus();
        }
    }

    // ================================
    // DASHBOARD COMPONENTS
    // ================================
    
    initializeDashboard() {
        this.initializeAssetStatusChart();
        this.initializeDepartmentChart();
        this.initializeAssetTrendChart();
    }

    initializeAssetStatusChart() {
        const ctx = document.getElementById('assetStatusChart');
        if (!ctx) return;

        if (this.charts.assetStatus) {
            this.charts.assetStatus.destroy();
        }

        this.charts.assetStatus = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'In Maintenance', 'Retired', 'Under Repair'],
                datasets: [{
                    data: [65, 15, 10, 10],
                    backgroundColor: [
                        '#10b981', // Emerald-500
                        '#f59e0b', // Amber-500
                        '#6b7280', // Gray-500
                        '#ef4444'  // Red-500
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: '#374151'
                        }
                    }
                }
            }
        });
    }

    initializeDepartmentChart() {
        const ctx = document.getElementById('departmentChart');
        if (!ctx) return;

        if (this.charts.department) {
            this.charts.department.destroy();
        }

        this.charts.department = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['IT', 'Admin', 'HR', 'Finance', 'Medical', 'Maintenance'],
                datasets: [{
                    label: 'Assets by Department',
                    data: [45, 23, 12, 18, 67, 15],
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f3f4f6'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    }
                }
            }
        });
    }

    initializeAssetTrendChart() {
        const ctx = document.getElementById('assetTrendChart');
        if (!ctx) return;

        if (this.charts.assetTrend) {
            this.charts.assetTrend.destroy();
        }

        this.charts.assetTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'New Assets',
                    data: [12, 19, 8, 15, 25, 22],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f3f4f6'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    }
                }
            }
        });
    }

    updateDashboardStats(stats) {
        // Update stat cards
        const statElements = {
            totalAssets: document.getElementById('totalAssetsCount'),
            activeAssets: document.getElementById('activeAssetsCount'),
            maintenanceAssets: document.getElementById('maintenanceAssetsCount'),
            totalValue: document.getElementById('totalValueCount')
        };

        Object.entries(statElements).forEach(([key, element]) => {
            if (element && stats[key] !== undefined) {
                element.textContent = stats[key];
            }
        });
    }

    updateRecentAssets(assets) {
        const container = document.getElementById('recentAssetsList');
        if (!container) return;

        container.innerHTML = assets.map(asset => `
            <div class="recent-asset-item">
                <div class="asset-icon">
                    <i class="icon-${asset.category.toLowerCase()}"></i>
                </div>
                <div class="asset-info">
                    <div class="asset-name">${Utils.sanitizeString(asset.name)}</div>
                    <div class="asset-meta">${Utils.sanitizeString(asset.category)} • ${Utils.formatDate(asset.created_at)}</div>
                </div>
                <div class="asset-status status-${asset.status.toLowerCase()}">${asset.status}</div>
            </div>
        `).join('');
    }

    updateDashboardAlerts(alerts) {
        const container = document.getElementById('alertsList');
        if (!container) return;

        if (alerts.length === 0) {
            container.innerHTML = '<div class="no-alerts">No active alerts</div>';
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item alert-${alert.type}">
                <div class="alert-icon">
                    <i class="icon-${alert.type}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${Utils.sanitizeString(alert.title)}</div>
                    <div class="alert-time">${Utils.getRelativeTime(alert.created_at)}</div>
                </div>
            </div>
        `).join('');
    }

    // ================================
    // SEARCH AND FILTERING
    // ================================
    
    handleSearch(searchTerm, target) {
        switch (target) {
            case 'assets':
                this.searchAssets(searchTerm);
                break;
            case 'users':
                this.searchUsers(searchTerm);
                break;
            case 'help':
                this.searchHelp(searchTerm);
                break;
            default:
                console.warn('Unknown search target:', target);
        }
    }

    searchAssets(searchTerm) {
        // Implementation would filter the assets table
        console.log('Searching assets for:', searchTerm);
    }

    searchUsers(searchTerm) {
        // Implementation would filter the users table
        console.log('Searching users for:', searchTerm);
    }

    searchHelp(searchTerm) {
        // Implementation would filter the help/FAQ content
        console.log('Searching help for:', searchTerm);
    }

    // ================================
    // DATA TABLE MANAGEMENT
    // ================================
    
    initializeDataTables() {
        // Initialize sortable tables, pagination, etc.
        this.setupTableSorting();
        this.setupTablePagination();
    }

    setupTableSorting() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.sortable th')) {
                this.handleTableSort(e.target);
            }
        });
    }

    setupTablePagination() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.pagination button')) {
                this.handlePagination(e.target);
            }
        });
    }

    handleTableSort(header) {
        const table = header.closest('table');
        const column = header.dataset.column;
        const currentDirection = header.dataset.direction || 'asc';
        const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
        
        // Update header
        table.querySelectorAll('th').forEach(th => {
            th.removeAttribute('data-direction');
            th.classList.remove('sorted-asc', 'sorted-desc');
        });
        
        header.dataset.direction = newDirection;
        header.classList.add(`sorted-${newDirection}`);
        
        // Sort table data (implementation depends on data source)
        this.sortTableData(table, column, newDirection);
    }

    sortTableData(table, column, direction) {
        // Implementation would sort the table data
        console.log('Sorting table by', column, direction);
    }

    // ================================
    // FORM VALIDATION
    // ================================
    
    initializeFormValidation() {
        // Set up form validation rules
        this.validationRules = {
            asset: {
                name: { required: true, minLength: 2, maxLength: 100 },
                category: { required: true },
                serial_number: { required: true, minLength: 3 },
                department: { required: true },
                purchase_date: { required: true },
                purchase_cost: { required: true, pattern: /^\d+(\.\d{2})?$/, patternMessage: 'Please enter a valid amount' }
            },
            user: {
                name: { required: true, minLength: 2, maxLength: 50 },
                email: { required: true, email: true },
                username: { required: true, minLength: 3, maxLength: 20 },
                role: { required: true },
                department: { required: true }
            }
        };
    }

    // ================================
    // USER PREFERENCES
    // ================================
    
    loadUserPreferences() {
        const preferences = Utils.loadFromStorage('userPreferences', {});
        
        // Apply theme
        if (preferences.theme) {
            document.body.dataset.theme = preferences.theme;
        }
        
        // Apply other preferences
        if (preferences.tableRowsPerPage) {
            this.tableRowsPerPage = preferences.tableRowsPerPage;
        }
    }

    saveUserPreferences(preferences) {
        const current = Utils.loadFromStorage('userPreferences', {});
        const updated = { ...current, ...preferences };
        Utils.saveToStorage('userPreferences', updated);
    }
}

// Initialize the application
const app = new ITAMSApp();

// Make app available globally for debugging
if (typeof window !== 'undefined') {
    window.ITAMSApp = app;
}