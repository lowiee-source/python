// ====================================
// CALAMBA MEDICAL CENTER - ASSETS MODULE
// Asset Management Functionality
// ====================================

const AssetsModule = {
    currentAssets: [],
    currentFilters: {},
    currentSort: { field: 'name', direction: 'asc' },
    currentPage: 1,
    rowsPerPage: 10,

    // ================================
    // INITIALIZATION
    // ================================
    
    init() {
        this.setupEventListeners();
        this.setupFilters();
        this.loadAssets();
    },

    setupEventListeners() {
        // Add Asset Button
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="add-asset"]')) {
                this.showAddAssetModal();
            }
            
            if (e.target.matches('[data-action="edit-asset"]')) {
                const assetId = e.target.closest('[data-asset-id]').dataset.assetId;
                this.showEditAssetModal(assetId);
            }
            
            if (e.target.matches('[data-action="delete-asset"]')) {
                const assetId = e.target.closest('[data-asset-id]').dataset.assetId;
                this.confirmDeleteAsset(assetId);
            }
            
            if (e.target.matches('[data-action="view-asset"]')) {
                const assetId = e.target.closest('[data-asset-id]').dataset.assetId;
                this.showAssetDetails(assetId);
            }
            
            if (e.target.matches('[data-action="export-assets"]')) {
                this.exportAssets();
            }
            
            if (e.target.matches('[data-action="import-assets"]')) {
                this.showImportModal();
            }
        });

        // Asset Form Submission
        const assetForm = document.getElementById('assetForm');
        if (assetForm) {
            assetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAssetSubmit(assetForm);
            });
        }

        // Import Form Submission
        const importForm = document.getElementById('importForm');
        if (importForm) {
            importForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleImportSubmit(importForm);
            });
        }

        // File Input Change
        const fileInput = document.getElementById('importFile');
        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileInputChange.bind(this));
        }

        // Filter Controls
        document.addEventListener('change', (e) => {
            if (e.target.matches('.asset-filter')) {
                this.handleFilterChange();
            }
        });

        // Search Input
        const searchInput = document.getElementById('assetSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }
    },

    setupFilters() {
        this.loadFilterOptions();
    },

    // ================================
    // DATA OPERATIONS
    // ================================
    
    async loadAssets() {
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.rowsPerPage,
                sort_field: this.currentSort.field,
                sort_direction: this.currentSort.direction,
                ...this.currentFilters
            });

            const response = await Utils.apiRequest(`${CONFIG.API.ENDPOINTS.ASSETS}?${params}`);
            
            if (response.success) {
                this.currentAssets = response.data.assets;
                this.renderAssetsTable();
                this.updatePagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Failed to load assets:', error);
            Utils.showNotification('error', 'Failed to load assets');
        }
    },

    async saveAsset(assetData, assetId = null) {
        try {
            const endpoint = assetId ? 
                CONFIG.API.ENDPOINTS.ASSET_UPDATE : 
                CONFIG.API.ENDPOINTS.ASSET_CREATE;
            
            const method = assetId ? 'PUT' : 'POST';
            const body = assetId ? 
                JSON.stringify({ ...assetData, id: assetId }) : 
                JSON.stringify(assetData);

            const response = await Utils.apiRequest(endpoint, {
                method,
                body
            });

            if (response.success) {
                Utils.showNotification('success', 
                    assetId ? 'Asset updated successfully' : 'Asset created successfully');
                this.loadAssets();
                Utils.showModal('assetModal', false);
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to save asset');
            }
        } catch (error) {
            console.error('Failed to save asset:', error);
            Utils.showNotification('error', error.message || 'Failed to save asset');
            throw error;
        }
    },

    async deleteAsset(assetId) {
        try {
            const response = await Utils.apiRequest(CONFIG.API.ENDPOINTS.ASSET_DELETE, {
                method: 'DELETE',
                body: JSON.stringify({ id: assetId })
            });

            if (response.success) {
                Utils.showNotification('success', 'Asset deleted successfully');
                this.loadAssets();
            } else {
                throw new Error(response.message || 'Failed to delete asset');
            }
        } catch (error) {
            console.error('Failed to delete asset:', error);
            Utils.showNotification('error', error.message || 'Failed to delete asset');
        }
    },

    async getAsset(assetId) {
        try {
            const response = await Utils.apiRequest(`${CONFIG.API.ENDPOINTS.ASSETS}/${assetId}`);
            
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Asset not found');
            }
        } catch (error) {
            console.error('Failed to get asset:', error);
            throw error;
        }
    },

    // ================================
    // UI RENDERING
    // ================================
    
    renderAssetsTable() {
        const tbody = document.querySelector('#assetsTable tbody');
        if (!tbody) return;

        if (this.currentAssets.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="empty-state">
                            <div class="empty-icon">📦</div>
                            <div class="empty-title">No assets found</div>
                            <div class="empty-subtitle">Add your first asset to get started</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.currentAssets.map(asset => `
            <tr data-asset-id="${asset.id}">
                <td>
                    <div class="asset-basic-info">
                        <div class="asset-name">${Utils.sanitizeString(asset.name)}</div>
                        <div class="asset-tag">${Utils.sanitizeString(asset.asset_tag || '')}</div>
                    </div>
                </td>
                <td>
                    <div class="category-badge category-${asset.category.toLowerCase().replace(/\s+/g, '-')}">
                        ${Utils.sanitizeString(asset.category)}
                    </div>
                </td>
                <td>${Utils.sanitizeString(asset.serial_number || 'N/A')}</td>
                <td>${Utils.sanitizeString(asset.department || 'N/A')}</td>
                <td>
                    <div class="status-badge status-${asset.status.toLowerCase().replace(/\s+/g, '-')}">
                        ${Utils.sanitizeString(asset.status)}
                    </div>
                </td>
                <td>${asset.purchase_cost ? '$' + parseFloat(asset.purchase_cost).toLocaleString() : 'N/A'}</td>
                <td>${Utils.formatDate(asset.purchase_date)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon" data-action="view-asset" title="View Details">
                            <i class="icon-eye"></i>
                        </button>
                        ${this.canEditAsset() ? `
                        <button class="btn-icon" data-action="edit-asset" title="Edit Asset">
                            <i class="icon-edit"></i>
                        </button>
                        ` : ''}
                        ${this.canDeleteAsset() ? `
                        <button class="btn-icon btn-danger" data-action="delete-asset" title="Delete Asset">
                            <i class="icon-trash"></i>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    },

    updatePagination(pagination) {
        const paginationContainer = document.querySelector('.pagination-container');
        if (!paginationContainer || !pagination) return;

        const { current_page, total_pages, total_records } = pagination;
        
        // Update records info
        const recordsInfo = paginationContainer.querySelector('.records-info');
        if (recordsInfo) {
            const startRecord = ((current_page - 1) * this.rowsPerPage) + 1;
            const endRecord = Math.min(current_page * this.rowsPerPage, total_records);
            recordsInfo.textContent = `Showing ${startRecord}-${endRecord} of ${total_records} assets`;
        }

        // Update pagination buttons
        const paginationControls = paginationContainer.querySelector('.pagination-controls');
        if (paginationControls) {
            paginationControls.innerHTML = this.generatePaginationHTML(current_page, total_pages);
        }
    },

    generatePaginationHTML(currentPage, totalPages) {
        if (totalPages <= 1) return '';

        let html = '';
        
        // Previous button
        html += `<button class="btn-pagination" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>
            <i class="icon-chevron-left"></i>
        </button>`;
        
        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            html += `<button class="btn-pagination" data-page="1">1</button>`;
            if (startPage > 2) {
                html += `<span class="pagination-dots">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="btn-pagination ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="pagination-dots">...</span>`;
            }
            html += `<button class="btn-pagination" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        // Next button
        html += `<button class="btn-pagination" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>
            <i class="icon-chevron-right"></i>
        </button>`;
        
        return html;
    },

    // ================================
    // MODAL OPERATIONS
    // ================================
    
    showAddAssetModal() {
        this.resetAssetForm();
        document.getElementById('assetModalTitle').textContent = 'Add New Asset';
        document.getElementById('assetForm').dataset.mode = 'create';
        Utils.showModal('assetModal', true);
    },

    async showEditAssetModal(assetId) {
        try {
            const asset = await this.getAsset(assetId);
            this.populateAssetForm(asset);
            document.getElementById('assetModalTitle').textContent = 'Edit Asset';
            document.getElementById('assetForm').dataset.mode = 'edit';
            document.getElementById('assetForm').dataset.assetId = assetId;
            Utils.showModal('assetModal', true);
        } catch (error) {
            Utils.showNotification('error', 'Failed to load asset details');
        }
    },

    async showAssetDetails(assetId) {
        try {
            const asset = await this.getAsset(assetId);
            this.populateAssetDetailsModal(asset);
            Utils.showModal('assetDetailsModal', true);
        } catch (error) {
            Utils.showNotification('error', 'Failed to load asset details');
        }
    },

    showImportModal() {
        this.resetImportForm();
        Utils.showModal('importModal', true);
    },

    // ================================
    // FORM OPERATIONS
    // ================================
    
    resetAssetForm() {
        const form = document.getElementById('assetForm');
        if (form) {
            form.reset();
            form.removeAttribute('data-asset-id');
            
            // Clear validation errors
            form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            form.querySelectorAll('.error-message').forEach(el => el.remove());
        }
    },

    populateAssetForm(asset) {
        const form = document.getElementById('assetForm');
        if (!form || !asset) return;

        // Populate form fields
        Object.entries(asset).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'date' && value) {
                    input.value = Utils.formatDate(value, 'INPUT');
                } else {
                    input.value = value || '';
                }
            }
        });
    },

    populateAssetDetailsModal(asset) {
        const modal = document.getElementById('assetDetailsModal');
        if (!modal || !asset) return;

        // Update modal content with asset details
        const fields = {
            'detailAssetName': asset.name,
            'detailAssetTag': asset.asset_tag,
            'detailCategory': asset.category,
            'detailSerialNumber': asset.serial_number,
            'detailModel': asset.model,
            'detailManufacturer': asset.manufacturer,
            'detailDepartment': asset.department,
            'detailLocation': asset.location,
            'detailStatus': asset.status,
            'detailPurchaseDate': Utils.formatDate(asset.purchase_date),
            'detailPurchaseCost': asset.purchase_cost ? '$' + parseFloat(asset.purchase_cost).toLocaleString() : 'N/A',
            'detailWarrantyExpiry': Utils.formatDate(asset.warranty_expiry),
            'detailNotes': asset.notes || 'No notes available'
        };

        Object.entries(fields).forEach(([elementId, value]) => {
            const element = modal.querySelector(`#${elementId}`);
            if (element) {
                element.textContent = Utils.sanitizeString(value || 'N/A');
            }
        });

        // Update status badge
        const statusBadge = modal.querySelector('.detail-status-badge');
        if (statusBadge) {
            statusBadge.className = `detail-status-badge status-${asset.status.toLowerCase().replace(/\s+/g, '-')}`;
            statusBadge.textContent = asset.status;
        }
    },

    async handleAssetSubmit(form) {
        const formData = new FormData(form);
        const assetData = Object.fromEntries(formData.entries());
        
        // Validate form
        const validation = Utils.validateForm(assetData, {
            name: { required: true, minLength: 2, maxLength: 100 },
            category: { required: true },
            serial_number: { required: true, minLength: 3 },
            department: { required: true },
            status: { required: true },
            purchase_date: { required: true }
        });

        if (!validation.isValid) {
            this.showFormErrors(form, validation.errors);
            return;
        }

        try {
            const mode = form.dataset.mode;
            const assetId = form.dataset.assetId;
            
            // Show loading state
            const submitBtn = form.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = mode === 'create' ? 'Creating...' : 'Updating...';
            submitBtn.disabled = true;

            await this.saveAsset(assetData, mode === 'edit' ? assetId : null);

        } catch (error) {
            // Error handling is done in saveAsset method
        } finally {
            // Reset button state
            const submitBtn = form.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.textContent = form.dataset.mode === 'create' ? 'Create Asset' : 'Update Asset';
                submitBtn.disabled = false;
            }
        }
    },

    resetImportForm() {
        const form = document.getElementById('importForm');
        if (form) {
            form.reset();
            
            // Reset file input display
            const fileLabel = form.querySelector('.file-upload-label');
            if (fileLabel) {
                fileLabel.innerHTML = `
                    <i class="icon-upload"></i>
                    <span>Choose CSV file or drag and drop</span>
                    <small>Supports .csv files up to 10MB</small>
                `;
            }
        }
    },

    handleFileInputChange(e) {
        const file = e.target.files[0];
        const label = e.target.closest('.file-upload').querySelector('.file-upload-label');
        
        if (file) {
            label.innerHTML = `
                <i class="icon-file"></i>
                <span>${file.name}</span>
                <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
            `;
        }
    },

    async handleImportSubmit(form) {
        const formData = new FormData(form);
        const file = formData.get('file');
        
        if (!file) {
            Utils.showNotification('error', 'Please select a file to import');
            return;
        }

        try {
            // Show loading state
            const submitBtn = form.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Importing...';
            submitBtn.disabled = true;

            const response = await Utils.apiRequest(CONFIG.API.ENDPOINTS.ASSET_IMPORT, {
                method: 'POST',
                body: formData
            });

            if (response.success) {
                Utils.showNotification('success', `Successfully imported ${response.data.imported_count} assets`);
                this.loadAssets();
                Utils.showModal('importModal', false);
            } else {
                throw new Error(response.message || 'Import failed');
            }

        } catch (error) {
            console.error('Import error:', error);
            Utils.showNotification('error', error.message || 'Failed to import assets');
        } finally {
            // Reset button state
            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    },

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
    },

    // ================================
    // FILTERING AND SEARCH
    // ================================
    
    async loadFilterOptions() {
        try {
            const response = await Utils.apiRequest(CONFIG.API.ENDPOINTS.ASSET_FILTER_OPTIONS);
            
            if (response.success) {
                this.populateFilterDropdowns(response.data);
            }
        } catch (error) {
            console.error('Failed to load filter options:', error);
        }
    },

    populateFilterDropdowns(options) {
        // Populate category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter && options.categories) {
            categoryFilter.innerHTML = '<option value="">All Categories</option>' +
                options.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }

        // Populate department filter
        const departmentFilter = document.getElementById('departmentFilter');
        if (departmentFilter && options.departments) {
            departmentFilter.innerHTML = '<option value="">All Departments</option>' +
                options.departments.map(dept => `<option value="${dept}">${dept}</option>`).join('');
        }

        // Populate status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter && options.statuses) {
            statusFilter.innerHTML = '<option value="">All Statuses</option>' +
                options.statuses.map(status => `<option value="${status}">${status}</option>`).join('');
        }
    },

    handleFilterChange() {
        const filters = {};
        
        // Collect filter values
        document.querySelectorAll('.asset-filter').forEach(filter => {
            if (filter.value) {
                filters[filter.name] = filter.value;
            }
        });
        
        this.currentFilters = filters;
        this.currentPage = 1; // Reset to first page
        this.loadAssets();
    },

    handleSearch(searchTerm) {
        if (searchTerm.trim()) {
            this.currentFilters.search = searchTerm.trim();
        } else {
            delete this.currentFilters.search;
        }
        
        this.currentPage = 1; // Reset to first page
        this.loadAssets();
    },

    // ================================
    // IMPORT/EXPORT
    // ================================
    
    async exportAssets() {
        try {
            const params = new URLSearchParams({
                format: 'csv',
                ...this.currentFilters
            });

            const response = await Utils.apiRequest(`${CONFIG.API.ENDPOINTS.ASSET_EXPORT}?${params}`);
            
            if (response.success) {
                // Generate filename with current date
                const filename = `assets_export_${new Date().toISOString().split('T')[0]}.csv`;
                Utils.downloadFile(response.data, filename, 'text/csv');
                Utils.showNotification('success', 'Assets exported successfully');
            }
        } catch (error) {
            console.error('Export error:', error);
            Utils.showNotification('error', 'Failed to export assets');
        }
    },

    // ================================
    // PERMISSIONS
    // ================================
    
    canEditAsset() {
        const userRole = window.ITAMSApp?.currentUser?.role;
        return ['admin', 'manager'].includes(userRole);
    },

    canDeleteAsset() {
        const userRole = window.ITAMSApp?.currentUser?.role;
        return userRole === 'admin';
    },

    canImportAssets() {
        const userRole = window.ITAMSApp?.currentUser?.role;
        return ['admin', 'manager'].includes(userRole);
    },

    // ================================
    // UTILITY METHODS
    // ================================
    
    confirmDeleteAsset(assetId) {
        const asset = this.currentAssets.find(a => a.id == assetId);
        const assetName = asset ? asset.name : 'this asset';
        
        Utils.confirm(
            `Are you sure you want to delete "${assetName}"? This action cannot be undone.`,
            () => this.deleteAsset(assetId)
        );
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AssetsModule.init());
} else {
    AssetsModule.init();
}

// Make module available globally
if (typeof window !== 'undefined') {
    window.AssetsModule = AssetsModule;
}