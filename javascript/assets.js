import { API, safeCall } from './api.js';
import { qs, qsa, openModal, closeModal, toast } from './utils.js';
import { getCurrentUser } from './auth.js';

let allAssets = [];
let assetFilters = { search: '', building: '', department: '', status: '' };

function matchesFilters(asset) {
  const s = assetFilters.search?.toLowerCase() || '';
  const txt = Object.values(asset).join(' ').toLowerCase();
  const building = (asset.building || asset.Building || '').toLowerCase();
  const dept = (asset.department || asset.Department || '').toLowerCase();
  const status = (asset.status || asset.Status || '').toLowerCase();
  return (!s || txt.includes(s)) && (!assetFilters.building || building === assetFilters.building.toLowerCase()) && (!assetFilters.department || dept === assetFilters.department.toLowerCase()) && (!assetFilters.status || status.includes(assetFilters.status.toLowerCase()));
}

function renderAssets(list) {
  const tbody = qs('#assetsTableBody'); if (!tbody) return;
  tbody.innerHTML = '';
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="17" class="table-loading">No assets found.</td></tr>'; return; }
  const canCrud = (getCurrentUser()?.role || '').toLowerCase() !== 'user';
  list.forEach(a => {
    const tr = document.createElement('tr');
    const status = (a.status || a.Status || '').toLowerCase();
    const statusClass = status.includes('use') ? 'in-use' : status.includes('stock') ? 'in-stock' : status.includes('maint') ? 'maintenance' : status.includes('retired') ? 'retired' : 'unknown';
    tr.innerHTML = `
      <td>${a.cmcCode || a.CMCCode || ''}</td>
      <td>${a.brand || a.Brand || ''}</td>
      <td>${a.classification || a.Classification || ''}</td>
      <td>${a.serialNumber || a.SerialNumber || ''}</td>
      <td>${a.datePurchased || a.DatePurchased || ''}</td>
      <td>${a.hostName || a.HostName || ''}</td>
      <td>${a.operatingSystem || a.OperatingSystem || a.OS || ''}</td>
      <td><span class="status-indicator ${statusClass}">${a.status || a.Status || ''}</span></td>
      <td>${a.ram || a.RAM || ''}</td>
      <td>${a.processor || a.Processor || ''}</td>
      <td>${a.ipAddress || a.IP || ''}</td>
      <td>${a.macAddress || a.MAC || ''}</td>
      <td>${a.user || a.User || ''}</td>
      <td>${a.department || a.Department || ''}</td>
      <td>${a.building || a.Building || ''}</td>
      <td title="${a.remarks || a.Remarks || ''}">${a.remarks || a.Remarks || ''}</td>
      <td class="actions-cell">
        <button class="action-btn view-btn" title="View" data-id="${a.id || a.SerialNumber}">👁️</button>
        <button class="action-btn edit-btn" title="Edit" data-id="${a.id || a.SerialNumber}" ${canCrud ? '' : 'disabled'}>✏️</button>
        <button class="action-btn delete-btn" title="Delete" data-id="${a.id || a.SerialNumber}" ${canCrud ? '' : 'disabled'}>🗑️</button>
      </td>`;
    tbody.appendChild(tr);
  });

  // Actions
  qsa('.view-btn', tbody).forEach(btn => btn.onclick = () => showAssetDetails(btn.dataset.id));
  qsa('.edit-btn', tbody).forEach(btn => btn.onclick = () => editAsset(btn.dataset.id));
  qsa('.delete-btn', tbody).forEach(btn => btn.onclick = () => deleteAsset(btn.dataset.id));
}

export async function loadAssets() {
  const res = await safeCall(API.listAssets(), []);
  allAssets = Array.isArray(res) ? res : (res.items || []);
  applyAssetFilters();
  updateAssetSummaryCards();
}

function applyAssetFilters() {
  const filtered = allAssets.filter(matchesFilters);
  renderAssets(filtered);
}

function updateAssetSummaryCards() {
  const countBy = (k, v) => allAssets.filter(a => (a[k] || a[k?.charAt(0).toUpperCase()+k.slice(1)] || '').toLowerCase() === v).length;
  const monitors = allAssets.filter(a => (a.classification || a.Classification || '').toLowerCase().includes('monitor')).length;
  const systems = allAssets.filter(a => (a.classification || a.Classification || '').toLowerCase().includes('system')).length;
  const laptops = allAssets.filter(a => (a.classification || a.Classification || '').toLowerCase().includes('laptop')).length;
  const synology = allAssets.filter(a => (a.classification || a.Classification || '').toLowerCase().includes('synology')).length;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('monitorCount', monitors); set('systemCount', systems); set('laptopCount', laptops); set('synologyCount', synology);
}

export function searchAssets(val) { assetFilters.search = val; applyAssetFilters(); }
export function filterAssets(key, val) { assetFilters[key] = val; applyAssetFilters(); }

export function showAddAssetModal() { openModal('addAssetModal'); }

export function toggleAssetFields(classification) {
  const show = /system|laptop|synology/i.test(classification || '');
  const ext = document.getElementById('extendedFields'); if (ext) ext.style.display = show ? 'block' : 'none';
}

// Add asset submit
const addForm = document.getElementById('addAssetForm');
if (addForm) addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(addForm);
  const payload = Object.fromEntries(form.entries());
  const user = getCurrentUser();
  if ((user?.role || '').toLowerCase() === 'user') { toast('You do not have permission to add assets.', 'warning'); return; }
  await safeCall(API.addAsset(payload), null);
  toast('Asset added successfully', 'success');
  closeModal('addAssetModal');
  await loadAssets();
});

async function showAssetDetails(id) {
  const a = allAssets.find(x => String(x.id||x.SerialNumber) === String(id));
  if (!a) return;
  const body = document.getElementById('assetDetailsContent');
  body.innerHTML = `
    <div class="asset-details">
      <div class="asset-header"><h2>${a.cmcCode || a.CMCCode || ''}</h2></div>
      <div class="detail-grid">
        <div class="detail-item"><label>Brand</label><span>${a.brand || a.Brand || ''}</span></div>
        <div class="detail-item"><label>Classification</label><span>${a.classification || a.Classification || ''}</span></div>
        <div class="detail-item"><label>Serial Number</label><span>${a.serialNumber || a.SerialNumber || ''}</span></div>
        <div class="detail-item"><label>Date Purchased</label><span>${a.datePurchased || a.DatePurchased || ''}</span></div>
        <div class="detail-item"><label>Host Name</label><span>${a.hostName || a.HostName || ''}</span></div>
        <div class="detail-item"><label>Operating System</label><span>${a.operatingSystem || a.OperatingSystem || a.OS || ''}</span></div>
        <div class="detail-item"><label>Status</label><span>${a.status || a.Status || ''}</span></div>
        <div class="detail-item"><label>RAM</label><span>${a.ram || a.RAM || ''}</span></div>
        <div class="detail-item"><label>Processor</label><span>${a.processor || a.Processor || ''}</span></div>
        <div class="detail-item"><label>IP Address</label><span>${a.ipAddress || a.IP || ''}</span></div>
        <div class="detail-item"><label>MAC Address</label><span>${a.macAddress || a.MAC || ''}</span></div>
        <div class="detail-item"><label>User</label><span>${a.user || a.User || ''}</span></div>
        <div class="detail-item"><label>Department</label><span>${a.department || a.Department || ''}</span></div>
        <div class="detail-item"><label>Building</label><span>${a.building || a.Building || ''}</span></div>
        <div class="detail-item full-width"><label>Remarks</label><span>${a.remarks || a.Remarks || ''}</span></div>
      </div>
    </div>`;
  openModal('assetDetailsModal');
}

function bindEditForm(asset) {
  qs('#editCmcCode').value = asset.cmcCode || asset.CMCCode || '';
  qs('#editBrand').value = asset.brand || asset.Brand || '';
  qs('#editClassification').value = asset.classification || asset.Classification || '';
  qs('#editSerialNumber').value = asset.serialNumber || asset.SerialNumber || '';
  qs('#editDatePurchased').value = asset.datePurchased || asset.DatePurchased || '';
  qs('#editHostName').value = asset.hostName || asset.HostName || '';
  qs('#editOperatingSystem').value = asset.operatingSystem || asset.OperatingSystem || asset.OS || '';
  qs('#editOsStatus').value = asset.osStatus || asset.OSStatus || '';
  qs('#editRam').value = asset.ram || asset.RAM || '';
  qs('#editProcessor').value = asset.processor || asset.Processor || '';
  qs('#editIpAddress').value = asset.ipAddress || asset.IP || '';
  qs('#editMacAddress').value = asset.macAddress || asset.MAC || '';
  qs('#editStatus').value = asset.status || asset.Status || '';
  qs('#editUser').value = asset.user || asset.User || '';
  qs('#editDepartment').value = asset.department || asset.Department || '';
  qs('#editBuilding').value = asset.building || asset.Building || '';
  qs('#editRemarks').value = asset.remarks || asset.Remarks || '';
}

async function editAsset(id) {
  const user = getCurrentUser();
  if ((user?.role || '').toLowerCase() === 'user') { toast('You do not have permission to edit assets.', 'warning'); return; }
  const a = allAssets.find(x => String(x.id||x.SerialNumber) === String(id));
  if (!a) return;
  bindEditForm(a);
  openModal('editAssetModal');
  const form = document.getElementById('editAssetForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    await safeCall(API.updateAsset(a.id || a.SerialNumber, payload), null);
    toast('Asset updated', 'success');
    closeModal('editAssetModal');
    await loadAssets();
  };
}

async function deleteAsset(id) {
  const user = getCurrentUser();
  if ((user?.role || '').toLowerCase() === 'user') { toast('You do not have permission to delete assets.', 'warning'); return; }
  if (!confirm('Are you sure you want to delete this asset?')) return;
  await safeCall(API.deleteAsset(id), null);
  toast('Asset deleted', 'success');
  await loadAssets();
}

export function uploadCSV() { openModal('uploadModal'); }
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = document.getElementById('csvFile').files[0];
  if (!file) return;
  const user = getCurrentUser();
  if ((user?.role || '').toLowerCase() === 'user') { toast('You do not have permission to import.', 'warning'); return; }
  await safeCall(API.importAssets(file), null);
  toast('CSV imported successfully', 'success');
  closeModal('uploadModal');
  await loadAssets();
});

export async function downloadCSV() {
  try {
    const res = await safeCall(API.exportAssets(assetFilters), null);
    if (typeof res === 'string') {
      const blob = new Blob([res], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'assets.csv'; a.click(); URL.revokeObjectURL(url);
    } else if (res?.url) { location.href = res.url; }
    else { toast('No CSV available', 'warning'); }
  } catch { toast('Export failed', 'error'); }
}

// Report Issue
export function showReportIssueModal() { openModal('reportIssueModal'); }
const reportForm = document.getElementById('reportIssueForm');
if (reportForm) reportForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(reportForm).entries());
  await safeCall(API.reportIssue(data), null);
  toast('Issue reported successfully', 'success');
  closeModal('reportIssueModal');
  reportForm.reset();
});

// Expose global for inline attributes
window.showAddAssetModal = showAddAssetModal;
window.toggleAssetFields = toggleAssetFields;
window.uploadCSV = uploadCSV;
window.downloadCSV = downloadCSV;
window.searchAssets = searchAssets;
window.filterAssets = filterAssets;
window.showReportIssueModal = showReportIssueModal;