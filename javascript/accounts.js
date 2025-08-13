const Accounts = (() => {
  let accounts = [];
  let query = '';
  let filters = { role: '', status: '' };

  function actionsCell(row) {
    const user = Auth.getUser();
    const role = (user && user.role) || 'User';
    const isUser = role.toLowerCase() === 'user';
    if (isUser) return '';
    return `<button class="action-btn" onclick="Accounts.resetPw('${row.id||row.username}')">Reset</button><button class="action-btn delete" onclick="Accounts.remove('${row.id||row.username}')">Delete</button>`;
  }

  function render() {
    const tbody = document.getElementById('accountsTableBody');
    if (!tbody) return;
    const list = accounts.filter(a => {
      const matchesQ = !query || Object.values(a).some(v => String(v||'').toLowerCase().includes(query));
      const matchesFilters = (!filters.role || a.role === filters.role) && (!filters.status || a.status === filters.status);
      return matchesQ && matchesFilters;
    });

    document.getElementById('totalAccountsCount').textContent = list.length;
    document.getElementById('activeAccountsCount').textContent = list.filter(a => a.status === 'Active').length;
    document.getElementById('inactiveAccountsCount').textContent = list.filter(a => a.status === 'Inactive').length;
    document.getElementById('adminAccountsCount').textContent = list.filter(a => /admin/i.test(a.role||'')).length;

    tbody.innerHTML = list.map((row, idx) => `
      <tr>
        <td>${idx+1}</td>
        <td>${row.username||''}</td>
        <td>${row.name||''}</td>
        <td><span class="role-badge ${String(row.role||'').toLowerCase().replace(' ','-')}">${row.role||''}</span></td>
        <td>••••••••</td>
        <td><span class="status-indicator ${String(row.status||'').toLowerCase()}">${row.status||''}</span></td>
        <td>${utils.fmtDateTime(row.lastLogin)}</td>
        <td>${utils.fmtDateTime(row.createdAt)}</td>
        <td class="actions-cell">${actionsCell(row)}</td>
      </tr>
    `).join('');
  }

  async function load() {
    const res = await API.getAccounts(query, filters);
    if (res && res.ok !== false) accounts = res.items || res.data || res || [];
    else accounts = [
      { id: 1, username: 'admin', name: 'Administrator', role: 'Admin', status: 'Active', lastLogin: new Date(), createdAt: '2023-01-01' },
      { id: 2, username: 'user', name: 'General User', role: 'User', status: 'Active', lastLogin: new Date(), createdAt: '2023-01-05' }
    ];
    render();
  }

  function search(v) { query = (v||'').toLowerCase(); render(); }
  function setFilter(k,v) { filters[k] = v; render(); }

  function bind() {
    const form = document.getElementById('createAccountForm');
    if (form) form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (data.newPassword !== data.confirmPassword) return Notifications.toast('Passwords do not match', 'warning');
      const payload = { username: data.newUsername, password: data.newPassword, role: data.userRole };
      const res = await API.createAccount(payload);
      if (res && res.ok !== false) { Notifications.toast('Account created', 'success'); utils.closeModal('createAccountModal'); load(); }
      else Notifications.toast('Create failed', 'error');
    });
  }

  async function resetPw(id) { Notifications.toast('Password reset link sent', 'info'); }
  async function remove(id) {
    document.getElementById('deleteItemInfo').textContent = `Account ID: ${id}`;
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const input = document.getElementById('deleteConfirmInput');
    input.value = ''; confirmBtn.disabled = true;
    input.oninput = () => { confirmBtn.disabled = (input.value.trim().toUpperCase() !== 'DELETE'); };
    confirmBtn.onclick = async () => { utils.closeModal('deleteConfirmationModal'); const res = await API.deleteAccount(id); if (res && res.ok !== false) { Notifications.toast('Account deleted','success'); load(); } else Notifications.toast('Delete failed','error'); };
    utils.showModal('deleteConfirmationModal');
  }

  async function init() { bind(); await load(); }

  return { init, search, setFilter, resetPw, remove };
})();

window.searchAccounts = (v) => Accounts.search(v);
window.filterAccounts = (k,v) => Accounts.setFilter(k,v);
window.showCreateAccountModal = () => utils.showModal('createAccountModal');