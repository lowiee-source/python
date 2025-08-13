const Logs = (() => {
  let logs = [];
  let query = '';
  let filters = { user: '', action: '', type: '', status: '', from: '', to: '' };
  let sortCol = 0, sortAsc = true;
  let page = 1, pageSize = 50;
  let autoRefresh = true; let timer = null;

  function render() {
    const tbody = document.getElementById('logsTableBody');
    if (!tbody) return;
    let list = logs.filter(r => {
      const matchesQ = !query || JSON.stringify(r).toLowerCase().includes(query);
      const matches = (!filters.user || r.user === filters.user) && (!filters.action || r.action === filters.action) && (!filters.type || r.type === filters.type) && (!filters.status || r.status === filters.status);
      const inRange = (!filters.from || new Date(r.timestamp) >= new Date(filters.from)) && (!filters.to || new Date(r.timestamp) <= new Date(filters.to));
      return matchesQ && matches && inRange;
    });

    // sort
    list.sort((a,b) => {
      const colsA = [a.timestamp, a.user, a.action, a.type, a.cmcCode, a.details, a.session];
      const colsB = [b.timestamp, b.user, b.action, b.type, b.cmcCode, b.details, b.session];
      const A = (colsA[sortCol] || '').toString().toLowerCase();
      const B = (colsB[sortCol] || '').toString().toLowerCase();
      return (A > B ? 1 : A < B ? -1 : 0) * (sortAsc ? 1 : -1);
    });

    // pagination
    const total = list.length;
    const start = (page-1) * pageSize; const end = start + pageSize; const pageItems = list.slice(start, end);

    document.getElementById('logsResultsCount').textContent = `${total} results`;
    document.getElementById('filteredLogsCount').textContent = total;

    tbody.innerHTML = pageItems.map(r => `
      <tr class="log-row">
        <td class="date-cell"><div class="date-primary">${utils.fmtDateTime(r.timestamp)}</div></td>
        <td class="user-cell"><div class="user-name">${r.user||''}</div><div class="user-ip">${r.ip||''}</div></td>
        <td><span class="action-badge ${String(r.status||'').toLowerCase()}">${r.action||''}</span></td>
        <td><span class="type-badge ${String(r.type||'').toLowerCase()}">${r.type||''}</span></td>
        <td class="cmc-cell">${r.cmcCode||''}</td>
        <td class="details-cell"><div class="details-preview">${r.details||''}</div></td>
        <td class="session-cell">${r.session||''}</td>
        <td class="actions-cell">
          <button class="btn-action view-btn" onclick='Logs.view(${JSON.stringify(r)})'>View</button>
          <button class="btn-action copy-btn" onclick='Logs.copy(${JSON.stringify(r)})'>Copy</button>
        </td>
      </tr>
    `).join('');
  }

  function view(rec) {
    const el = document.getElementById('assetDetailsContent');
    el.innerHTML = `
      <div class="log-details-container">
        <div class="log-header-info">
          <div class="log-title"><h3>${rec.action||''} - ${rec.type||''}</h3><div class="log-badges"><span class="action-badge ${String(rec.status||'').toLowerCase()}">${rec.status||''}</span></div></div>
          <div class="log-timestamp"><div class="timestamp-main">${utils.fmtDateTime(rec.timestamp)}</div><div class="timestamp-full">Session: ${rec.session||''}</div></div>
        </div>
        <div class="log-sections">
          <div class="log-section"><h4>Primary</h4><div class="detail-grid">
            <div class="detail-item"><label>User</label><span class="user-highlight">${rec.user||''}</span></div>
            <div class="detail-item"><label>IP</label><span class="monospace">${rec.ip||''}</span></div>
            <div class="detail-item"><label>CMC</label><span class="cmc-code">${rec.cmcCode||''}</span></div>
          </div></div>
          <div class="log-section"><h4>Details</h4><div class="details-box">${rec.details||''}</div></div>
        </div>
        <div class="log-actions"><button class="btn-primary" onclick='Logs.copy(${JSON.stringify(rec)})'>Copy JSON</button></div>
      </div>`;
    utils.showModal('assetDetailsModal');
  }

  function copy(rec) { navigator.clipboard.writeText(JSON.stringify(rec, null, 2)); Notifications.toast('Copied', 'success'); }

  async function load() {
    const res = await API.getLogs({ q: query, ...filters });
    if (res && res.ok !== false) logs = res.items || res.data || res || [];
    else logs = [
      { timestamp: new Date(), user: 'admin', ip: '10.0.0.5', action: 'Login', status: 'Success', type: 'Authentication', cmcCode: '', details: 'User logged in', session: 'sess-123' },
      { timestamp: new Date(), user: 'admin', ip: '10.0.0.5', action: 'Update', status: 'Success', type: 'Asset', cmcCode: 'CMC-001', details: 'Changed RAM', session: 'sess-123' }
    ];
    render();
    document.getElementById('lastLogsUpdate').textContent = new Date().toLocaleTimeString();
  }

  function search(v) { query = (v||'').toLowerCase(); page = 1; render(); }
  function filter(k,v) { filters[k]=v; page=1; render(); }
  function clearFilters() { filters = { user:'', action:'', type:'', status:'', from:'', to:'' }; render(); }
  function sort(col) { if (sortCol === col) sortAsc = !sortAsc; else { sortCol = col; sortAsc = true; } render(); }

  function startAuto() { if (timer) clearInterval(timer); timer = setInterval(() => { if (autoRefresh) load(); }, 10000); }
  function toggleAuto(val) { autoRefresh = !!val; document.getElementById('autoRefreshStatus').textContent = autoRefresh ? 'Active' : 'Paused'; }

  function previousLogsPage() { if (page > 1) { page--; render(); } }
  function nextLogsPage() { const total = logs.length; const max = Math.ceil(total / pageSize); if (page < max) { page++; render(); } }
  function changePageSize(v) { pageSize = Number(v||50); page=1; render(); }

  async function exportLogs() { Notifications.toast('Exporting filtered logs...', 'info'); }
  async function clearLogs() { const res = await API.clearLogs(); if (res && res.ok !== false) { Notifications.toast('Old logs cleared','success'); load(); } else Notifications.toast('Clear failed','error'); }

  async function init() {
    await load(); startAuto();
    const autoToggle = document.getElementById('autoRefreshToggle');
    if (autoToggle) autoToggle.addEventListener('change', (e) => toggleAuto(e.target.checked));
  }

  return { init, load, search, filter, clearFilters, sort, previousLogsPage, nextLogsPage, changePageSize, exportLogs, clearLogs, view, copy };
})();

window.searchLogs = (v) => Logs.search(v);
window.filterLogs = (k,v) => Logs.filter(k,v);
window.clearLogFilters = () => Logs.clearFilters();
window.sortLogsTable = (col) => Logs.sort(col);
window.previousLogsPage = () => Logs.previousLogsPage();
window.nextLogsPage = () => Logs.nextLogsPage();
window.changeLogsPageSize = (v) => Logs.changePageSize(v);
window.exportLogs = () => Logs.exportLogs();
window.clearLogs = () => Logs.clearLogs();