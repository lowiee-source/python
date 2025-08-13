const Assets = (() => {
  let assets = [];
  let filters = { building: '', department: '', status: '' };
  let query = '';

  function statusBadge(status) {
    const s = (status || '').toLowerCase();
    const cls = s.includes('use') ? 'in-use' : s.includes('stock') ? 'in-stock' : s.includes('maint') ? 'maintenance' : s.includes('ret') ? 'retired' : 'in-stock';
    return `<span class="status-indicator ${cls}">${status || 'Unknown'}</span>`;
  }

  function actionsCell(row) {
    const user = Auth.getUser();
    const role = (user && user.role) || 'User';
    const isUser = role.toLowerCase() === 'user';
    const viewBtn = `<button class="action-btn view-btn" onclick="Assets.view('${row.serialNumber || ''}')">View</button>`;
    if (isUser) return viewBtn;
    return `${viewBtn}<button class="action-btn" onclick="Assets.edit('${row.serialNumber || ''}')">Edit</button><button class="action-btn delete" onclick="Assets.remove('${row.serialNumber || ''}')">Delete</button>`;
  }

  function render() {
    const tbody = document.getElementById('assetsTableBody');
    if (!tbody) return;
    const filtered = assets.filter(a => {
      const matchesQ = !query || Object.values(a).some(v => String(v||'').toLowerCase().includes(query));
      const matchesFilters = (!filters.building || a.building === filters.building) && (!filters.department || a.department === filters.department) && (!filters.status || a.status === filters.status);
      return matchesQ && matchesFilters;
    });
    tbody.innerHTML = filtered.map(row => `
      <tr>
        <td>${row.cmcCode || ''}</td>
        <td>${row.brand || ''}</td>
        <td>${row.classification || ''}</td>
        <td>${row.serialNumber || ''}</td>
        <td>${utils.fmtDate(row.datePurchased)}</td>
        <td>${row.hostName || ''}</td>
        <td>${row.operatingSystem || ''}</td>
        <td>${statusBadge(row.status)}</td>
        <td>${row.ram || ''}</td>
        <td>${row.processor || ''}</td>
        <td>${row.ipAddress || ''}</td>
        <td>${row.macAddress || ''}</td>
        <td>${row.user || ''}</td>
        <td>${row.department || ''}</td>
        <td>${row.building || ''}</td>
        <td title="${row.remarks || ''}">${row.remarks || ''}</td>
        <td class="actions-cell">${actionsCell(row)}</td>
      </tr>
    `).join('');

    // summary
    document.getElementById('monitorCount').textContent = filtered.filter(a => (a.classification||'').toLowerCase().includes('monitor')).length;
    document.getElementById('systemCount').textContent = filtered.filter(a => (a.classification||'').toLowerCase().includes('system')).length;
    document.getElementById('laptopCount').textContent = filtered.filter(a => (a.classification||'').toLowerCase().includes('laptop')).length;
    document.getElementById('synologyCount').textContent = filtered.filter(a => (a.classification||'').toLowerCase().includes('synology')).length;
  }

  function view(serialNumber) {
    const item = assets.find(a => a.serialNumber === serialNumber);
    if (!item) return;
    const el = document.getElementById('assetDetailsContent');
    el.innerHTML = `
      <div class="asset-details">
        <div class="asset-header"><h2>${item.cmcCode || ''} - ${item.brand || ''}</h2></div>
        <div class="detail-grid">
          ${Object.entries(item).map(([k,v]) => `<div class="detail-item"><label>${k}</label><span>${v||''}</span></div>`).join('')}
        </div>
        <div class="action-buttons">
          <button class="action-btn" onclick="Assets.edit('${item.serialNumber}')">Edit</button>
        </div>
      </div>`;
    utils.showModal('assetDetailsModal');
  }

  function edit(serialNumber) {
    const item = assets.find(a => a.serialNumber === serialNumber);
    if (!item) return;
    // fill edit form
    const form = document.getElementById('editAssetForm');
    Object.entries(item).forEach(([k, v]) => {
      const input = form.querySelector(`[name="${k}"]`);
      if (input) input.value = v ?? '';
    });
    utils.showModal('editAssetModal');
  }

  async function remove(serialNumber) {
    const item = assets.find(a => a.serialNumber === serialNumber);
    if (!item) return;
    document.getElementById('deleteItemInfo').textContent = `${item.cmcCode || ''} (${serialNumber})`;
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const input = document.getElementById('deleteConfirmInput');
    input.value = '';
    confirmBtn.disabled = true;
    input.oninput = () => { confirmBtn.disabled = (input.value.trim().toUpperCase() !== 'DELETE'); };
    confirmBtn.onclick = async () => {
      utils.closeModal('deleteConfirmationModal');
      const res = await API.deleteAsset(item.id || serialNumber);
      if (res && res.ok !== false) { Notifications.toast('Asset deleted', 'success'); load(); } else { Notifications.toast('Delete failed', 'error'); }
    };
    utils.showModal('deleteConfirmationModal');
  }

  async function load() {
    const res = await API.getAssets(query, filters);
    if (res && res.ok !== false) {
      assets = res.items || res.data || res || [];
    } else {
      // demo data fallback
      assets = [
        { cmcCode: 'CMC-001', brand: 'Dell', classification: 'Laptop', serialNumber: 'SN001', datePurchased: '2023-01-10', hostName: 'HOST-01', operatingSystem: 'Windows 10', status: 'In Use', ram: '8GB', processor: 'i5', ipAddress: '10.0.0.10', macAddress: 'AA:BB:CC:DD:EE:01', user: 'John', department: 'IT', building: 'Tower1', remarks: 'OK' },
        { cmcCode: 'CMC-002', brand: 'HP', classification: 'Monitor', serialNumber: 'SN002', datePurchased: '2022-11-05', hostName: '', operatingSystem: '', status: 'In Stock', ram: '', processor: '', ipAddress: '', macAddress: '', user: '', department: 'HR', building: 'Tower2', remarks: '' }
      ];
    }
    render();
  }

  function search(q) { query = (q||'').toLowerCase(); render(); }
  function setFilter(key, value) { filters[key] = value; render(); }

  function bindForms() {
    // Add Asset
    document.getElementById('addAssetForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const data = Object.fromEntries(new FormData(form).entries());
      const res = await API.addAsset(data);
      if (res && res.ok !== false) { Notifications.toast('Asset added', 'success'); utils.closeModal('addAssetModal'); load(); }
      else { Notifications.toast('Add failed', 'error'); }
    });

    // Edit Asset
    document.getElementById('editAssetForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const data = Object.fromEntries(new FormData(form).entries());
      const id = data.serialNumber || data.id;
      const res = await API.updateAsset(id, data);
      if (res && res.ok !== false) { Notifications.toast('Asset updated', 'success'); utils.closeModal('editAssetModal'); load(); }
      else { Notifications.toast('Update failed', 'error'); }
    });

    // Upload CSV
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = document.getElementById('csvFile').files[0];
      if (!file) return;
      const res = await API.importAssetsCSV(file);
      if (res && res.ok !== false) { Notifications.toast('CSV imported', 'success'); utils.closeModal('uploadModal'); load(); }
      else { Notifications.toast('Import failed', 'error'); }
    });

    // Report Issue
    const reportForm = document.getElementById('reportIssueForm');
    if (reportForm) reportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(reportForm).entries());
      const user = Auth.getUser();
      const payload = { ...data, user: user?.username };
      const res = await API.reportIssue(payload);
      if (res && res.ok !== false) { Notifications.toast('Issue submitted', 'success'); utils.closeModal('reportIssueModal'); }
      else { Notifications.toast('Submit failed', 'error'); }
    });
  }

  function toggleAssetFields(value) {
    const show = /system|laptop|synology/i.test(value || '');
    document.getElementById('extendedFields').style.display = show ? 'block' : 'none';
  }

  function showAddAssetModal() { utils.showModal('addAssetModal'); }
  function uploadCSV() { utils.showModal('uploadModal'); }
  function downloadCSV() { Notifications.toast('Exporting CSV...', 'info'); /* Implement server export if needed */ }
  function showReportIssueModal() { utils.showModal('reportIssueModal'); }

  async function init() {
    bindForms();
    await load();
  }

  return { init, load, view, edit, remove, search, setFilter, toggleAssetFields, showAddAssetModal, uploadCSV, downloadCSV, showReportIssueModal };
})();

window.toggleAssetFields = Assets.toggleAssetFields;
window.showAddAssetModal = Assets.showAddAssetModal;
window.uploadCSV = Assets.uploadCSV;
window.downloadCSV = Assets.downloadCSV;
window.searchAssets = (v) => Assets.search(v);
window.filterAssets = (k,v) => Assets.setFilter(k,v);
window.showReportIssueModal = Assets.showReportIssueModal;