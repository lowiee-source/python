// ====================================
// CALAMBA MEDICAL CENTER - ITAMS UTILS
// Utility Functions and Helpers
// ====================================

const Utils = {
    // ================================
    // API UTILITIES
    // ================================
    
    /**
     * Make an API request with proper error handling
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} API response
     */
    async apiRequest(endpoint, options = {}) {
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin',
            ...options
        };

        try {
            const url = CONFIG.API.BASE_URL + endpoint;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // Check if response is ok
            if (!response.ok) {
                if (response.status === 401) {
                    this.handleSessionExpired();
                    throw new Error(CONFIG.MESSAGES.ERROR.SESSION_EXPIRED);
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Handle API error responses
            if (data.success === false) {
                throw new Error(data.message || CONFIG.MESSAGES.ERROR.GENERIC);
            }
            
            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    },

    /**
     * Handle session expiration
     */
    handleSessionExpired() {
        localStorage.clear();
        sessionStorage.clear();
        
        // Show login screen
        this.showSection('login');
        this.showNotification('error', CONFIG.MESSAGES.ERROR.SESSION_EXPIRED);
    },

    // ================================
    // DATE AND TIME UTILITIES
    // ================================
    
    /**
     * Format date for display
     * @param {string|Date} date - Date to format
     * @param {string} format - Format type
     * @returns {string} Formatted date
     */
    formatDate(date, format = 'DISPLAY') {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const options = {
            'DISPLAY': { 
                year: 'numeric', 
                month: 'short', 
                day: '2-digit' 
            },
            'DATETIME_DISPLAY': { 
                year: 'numeric', 
                month: 'short', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            },
            'INPUT': { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            }
        };
        
        if (format === 'INPUT') {
            return d.toISOString().split('T')[0];
        }
        
        return d.toLocaleDateString('en-US', options[format] || options.DISPLAY);
    },

    /**
     * Get relative time (e.g., "2 hours ago")
     * @param {string|Date} date - Date to compare
     * @returns {string} Relative time string
     */
    getRelativeTime(date) {
        if (!date) return '';
        
        const now = new Date();
        const d = new Date(date);
        const diffMs = now - d;
        const diffSecs = Math.round(diffMs / 1000);
        const diffMins = Math.round(diffSecs / 60);
        const diffHours = Math.round(diffMins / 60);
        const diffDays = Math.round(diffHours / 24);
        
        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return this.formatDate(date);
    },

    // ================================
    // VALIDATION UTILITIES
    // ================================
    
    /**
     * Validate form data
     * @param {Object} data - Data to validate
     * @param {Object} rules - Validation rules
     * @returns {Object} Validation result
     */
    validateForm(data, rules) {
        const errors = {};
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = data[field];
            
            // Required field check
            if (rule.required && (!value || value.trim() === '')) {
                errors[field] = `${this.capitalize(field)} is required`;
                continue;
            }
            
            // Skip further validation if field is empty and not required
            if (!value || value.trim() === '') continue;
            
            // Length validation
            if (rule.minLength && value.length < rule.minLength) {
                errors[field] = `${this.capitalize(field)} must be at least ${rule.minLength} characters`;
                continue;
            }
            
            if (rule.maxLength && value.length > rule.maxLength) {
                errors[field] = `${this.capitalize(field)} cannot exceed ${rule.maxLength} characters`;
                continue;
            }
            
            // Pattern validation
            if (rule.pattern && !rule.pattern.test(value)) {
                errors[field] = rule.patternMessage || `${this.capitalize(field)} has invalid format`;
                continue;
            }
            
            // Email validation
            if (rule.email && !this.isValidEmail(value)) {
                errors[field] = 'Please enter a valid email address';
                continue;
            }
            
            // Custom validation function
            if (rule.custom && typeof rule.custom === 'function') {
                const customResult = rule.custom(value);
                if (customResult !== true) {
                    errors[field] = customResult;
                }
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    /**
     * Check if email is valid
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // ================================
    // STRING UTILITIES
    // ================================
    
    /**
     * Capitalize first letter of string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Convert string to title case
     * @param {string} str - String to convert
     * @returns {string} Title case string
     */
    toTitleCase(str) {
        if (!str) return '';
        return str.replace(/\w\S*/g, txt => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },

    /**
     * Generate random ID
     * @param {number} length - Length of ID
     * @returns {string} Random ID
     */
    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * Sanitize string for display
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeString(str) {
        if (!str) return '';
        return str.replace(/[<>&"']/g, function(match) {
            const escapeMap = {
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            return escapeMap[match];
        });
    },

    // ================================
    // UI UTILITIES
    // ================================
    
    /**
     * Show/hide sections of the application
     * @param {string} sectionId - Section to show
     */
    showSection(sectionId) {
        // Hide all containers first
        const containers = ['welcomeContainer', 'loginContainer', 'dashboardContainer'];
        containers.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });

        // Show target container
        const targetContainer = sectionId.includes('Container') ? sectionId : sectionId + 'Container';
        const element = document.getElementById(targetContainer);
        if (element) {
            element.style.display = 'flex';
        }

        // Handle content sections within dashboard
        if (!containers.includes(targetContainer)) {
            const dashboardContainer = document.getElementById('dashboardContainer');
            if (dashboardContainer) {
                dashboardContainer.style.display = 'flex';
            }

            // Hide all content sections
            const contentSections = document.querySelectorAll('.content-section');
            contentSections.forEach(section => {
                section.style.display = 'none';
            });

            // Show target content section
            const contentSection = document.getElementById(sectionId + 'Content');
            if (contentSection) {
                contentSection.style.display = 'block';
            }

            // Update navigation
            this.updateNavigation(sectionId);
        }
    },

    /**
     * Update navigation active state
     * @param {string} activeSection - Currently active section
     */
    updateNavigation(activeSection) {
        const navItems = document.querySelectorAll('.nav-menu li');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === activeSection) {
                item.classList.add('active');
            }
        });
    },

    /**
     * Show notification toast
     * @param {string} type - Notification type (success, error, warning, info)
     * @param {string} message - Message to display
     * @param {number} duration - Duration in milliseconds
     */
    showNotification(type, message, duration = CONFIG.UI.NOTIFICATION_DURATION) {
        const toast = document.getElementById('notificationToast');
        const icon = document.getElementById('toastIcon');
        const messageEl = document.getElementById('toastMessage');
        
        if (!toast || !icon || !messageEl) return;

        // Set icon based on type
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        icon.textContent = icons[type] || icons.info;
        icon.className = `toast-icon ${type}`;
        messageEl.textContent = message;

        // Show toast
        toast.classList.add('show');

        // Auto hide
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },

    /**
     * Hide notification toast
     */
    hideNotification() {
        const toast = document.getElementById('notificationToast');
        if (toast) {
            toast.classList.remove('show');
        }
    },

    /**
     * Show/hide loading screen
     * @param {boolean} show - Whether to show loading screen
     */
    showLoading(show = true) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            if (show) {
                loadingScreen.style.opacity = '1';
                loadingScreen.style.visibility = 'visible';
            } else {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.visibility = 'hidden';
            }
        }
    },

    /**
     * Show/hide modal
     * @param {string} modalId - Modal ID
     * @param {boolean} show - Whether to show modal
     */
    showModal(modalId, show = true) {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (show) {
                modal.classList.add('show');
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                // Focus first input
                setTimeout(() => {
                    const firstInput = modal.querySelector('input, select, textarea');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }, 100);
            } else {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
                document.body.style.overflow = '';
            }
        }
    },

    /**
     * Confirm dialog
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Callback on confirmation
     * @param {Function} onCancel - Callback on cancel
     */
    confirm(message, onConfirm, onCancel = null) {
        if (window.confirm(message)) {
            if (onConfirm) onConfirm();
        } else {
            if (onCancel) onCancel();
        }
    },

    // ================================
    // DATA UTILITIES
    // ================================
    
    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * Filter array of objects by search term
     * @param {Array} items - Items to filter
     * @param {string} searchTerm - Search term
     * @param {Array} searchFields - Fields to search in
     * @returns {Array} Filtered items
     */
    filterItems(items, searchTerm, searchFields = []) {
        if (!searchTerm || searchTerm.trim() === '') return items;
        
        const term = searchTerm.toLowerCase().trim();
        
        return items.filter(item => {
            // If no specific fields provided, search all string values
            if (searchFields.length === 0) {
                return Object.values(item).some(value => 
                    value && value.toString().toLowerCase().includes(term)
                );
            }
            
            // Search specific fields
            return searchFields.some(field => {
                const value = this.getNestedValue(item, field);
                return value && value.toString().toLowerCase().includes(term);
            });
        });
    },

    /**
     * Get nested object value using dot notation
     * @param {Object} obj - Object to search
     * @param {string} path - Dot notation path
     * @returns {*} Value at path
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : null, obj
        );
    },

    /**
     * Sort array of objects by field
     * @param {Array} items - Items to sort
     * @param {string} field - Field to sort by
     * @param {string} direction - Sort direction (asc/desc)
     * @returns {Array} Sorted items
     */
    sortItems(items, field, direction = 'asc') {
        return [...items].sort((a, b) => {
            const aVal = this.getNestedValue(a, field);
            const bVal = this.getNestedValue(b, field);
            
            // Handle null/undefined values
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;
            
            // Handle different data types
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                const result = aVal.localeCompare(bVal);
                return direction === 'asc' ? result : -result;
            }
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    },

    // ================================
    // FILE UTILITIES
    // ================================
    
    /**
     * Download data as file
     * @param {string} data - Data to download
     * @param {string} filename - File name
     * @param {string} type - MIME type
     */
    downloadFile(data, filename, type = 'text/csv') {
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },

    /**
     * Convert array of objects to CSV
     * @param {Array} data - Data to convert
     * @param {Array} columns - Column definitions
     * @returns {string} CSV string
     */
    arrayToCSV(data, columns = null) {
        if (!data || data.length === 0) return '';
        
        // If no columns specified, use all keys from first object
        if (!columns) {
            columns = Object.keys(data[0]).map(key => ({ key, label: key }));
        }
        
        // Create header row
        const headers = columns.map(col => `"${col.label}"`).join(',');
        
        // Create data rows
        const rows = data.map(item => 
            columns.map(col => {
                const value = this.getNestedValue(item, col.key) || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            }).join(',')
        );
        
        return [headers, ...rows].join('\n');
    },

    // ================================
    // LOCAL STORAGE UTILITIES
    // ================================
    
    /**
     * Save data to localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} data - Data to store
     */
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    },

    /**
     * Load data from localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Stored data or default value
     */
    loadFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
        }
    }
};

// Make Utils available globally
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}