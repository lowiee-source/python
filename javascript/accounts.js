import { API, safeCall } from './api.js';
import { qs, qsa, openModal, closeModal, toast, downloadCsv } from './utils.js';
import { getCurrentUser } from './auth.js';

let allAccounts = [];
let accountFilters = { search: '', role: '', status: '' };

function matches(acc) {
  const s = accountFilters.search?.toLowerCase() || '';
  const txt = `${acc.username||''} ${acc.name||''} ${acc.role||''} ${acc.status||''}`.toLowerCase();
  return (!s || txt.includes(s)) && (!accountFilters.role || (acc.role||'') === accountFilters.role) && (!accountFilters.status || (acc.status||'') === accountFilters.status);
}

function renderAccounts(list) {
  const tbody = qs('#accountsTableBody'); if (!tbody) return;
  tbody.innerHTML = '';
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="9" class="table-loading">No accounts found.</td></tr>'; return; }
  list.forEach((a, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx+1}</td>
      <td>${a.username || ''}</td>
      <td>${a.name || ''}</td>
      <td><span class="role-badge ${(a.role||'').toLowerCase().replace(' ','-')}">${a.role || ''}</span></td>
      <td>${a.passwordMasked || '••••••'}</td>
      <td><span class="status-indicator ${(a.status||'').toLowerCase()}">${a.status || ''}</span></td>
      <td>${a.lastLogin || ''}</td>
      <td>${a.createdAt || ''}</td>
      <td class="actions-cell">
        <button class="action-btn small" data-id="${a.id}">View</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

export async function loadAccounts() {
  const res = await safeCall(API.listAccounts(), []);
  allAccounts = Array.isArray(res) ? res : (res.items || []);
  applyFilters();
  // Summary counts
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('totalAccountsCount', allAccounts.length);
  set('activeAccountsCount', allAccounts.filter(a => (a.status||'').toLowerCase()==='active').length);
  set('inactiveAccountsCount', allAccounts.filter(a => (a.status||'').toLowerCase()==='inactive').length);
  set('adminAccountsCount', allAccounts.filter(a => (a.role||'').toLowerCase().includes('admin')).length);
}

function applyFilters() { renderAccounts(allAccounts.filter(matches)); }

export function searchAccounts(v) { accountFilters.search = v; applyFilters(); }
export function filterAccounts(k, v) { accountFilters[k] = v; applyFilters(); }

export function showCreateAccountModal() {
  const role = (getCurrentUser()?.role || '').toLowerCase();
  if (role !== 'admin' && role !== 'super admin') { toast('Only admins can create accounts', 'warning'); return; }
  openModal('createAccountModal');
}

const form = document.getElementById('createAccountForm');
if (form) form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if (data.newPassword !== data.confirmPassword) { toast('Passwords do not match', 'error'); return; }
  const payload = { username: data.newUsername, password: data.newPassword, role: data.userRole };
  await safeCall(API.createAccount(payload), null);
  toast('Account created', 'success');
  closeModal('createAccountModal');
  await loadAccounts();
});

function toCsvRow(values){ return values.map(v => {
  const s = (v ?? '').toString().replace(/"/g,'""');
  return `"${s}"`;
}).join(','); }

export function exportAccounts(){
  const rows = allAccounts.filter(matches);
  const header = ['#','Username','Name','Role','Status','Last Login','Created At'];
  const csv = [toCsvRow(header), ...rows.map((a,i)=> toCsvRow([i+1,a.username||'',a.name||'',a.role||'',a.status||'',a.lastLogin||'',a.createdAt||'']))].join('\n');
  downloadCsv('accounts.csv', csv);
}

// Expose
window.searchAccounts = searchAccounts;
window.filterAccounts = filterAccounts;
window.showCreateAccountModal = showCreateAccountModal;
window.exportAccounts = exportAccounts;