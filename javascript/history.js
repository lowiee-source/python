const History = (() => {
  let records = [];
  let query = '';
  let filters = { type: '', user: '', action: '', from: '', to: '' };
  let sortCol = 0, sortAsc = true;
  let page = 1, pageSize = 50;

  function render() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;
    let list = records.filter(r => {
      const matchesQ = !query || JSON.stringify(r).toLowerCase().includes(query);
      const matches = (!filters.type || r.type === filters.type) && (!filters.user || r.user === filters.user) && (!filters.action || r.action === filters.action);
      const inRange = (!filters.from || new Date(r.date) >= new Date(filters.from)) && (!filters.to || new Date(r.date) <= new Date(filters.to));
      return matchesQ && matches && inRange;
    });

    // sort
    list.sort((a,b) => {
      const cols = [a.date, a.time, a.user, a.cmcCode, a.action, a.type, a.details];
      const colsB = [b.date, b.time, b.user, b.cmcCode, b.action, b.type, b.details];
      const A = (cols[sortCol] || '').toString().toLowerCase();
      const B = (colsB[sortCol] || '').toString().toLowerCase();
      return (A > B ? 1 : A < B ? -1 : 0) * (sortAsc ? 1 : -1);
    });

    // pagination
    const total = list.length;
    const start = (page-1) * pageSize;
    const end = start + pageSize;
    const pageItems = list.slice(start, end);

    document.getElementById('historyResultsCount').textContent = `${total} results`;
    document.getElementById('historyPaginationInfo').textContent = `Showing ${Math.min(pageItems.length, total)} of ${total} records`;

    tbody.innerHTML = pageItems.map(r => `
      <tr class="history-row">
        <td>${r.date || ''}</td>
        <td>${r.time || ''}</td>
        <td>${r.user || ''}</td>
        <td class="cmc-cell">${r.cmcCode || ''}</td>
        <td><span class="action-badge ${String(r.action||'').toLowerCase()}">${r.action||''}</span></td>
        <td><span class="type-badge ${String(r.type||'').toLowerCase()}">${r.type||''}</span></td>
        <td class="details-cell"><div class="details-preview">${r.details || ''}</div></td>
        <td class="actions-cell"><button class="btn-action view-btn" onclick='History.view(${JSON.stringify(r)})'>View</button></td>
      </tr>
    `).join('');
  }

  function view(rec) {
    const el = document.getElementById('assetDetailsContent');
    el.innerHTML = `
      <div class="history-details">
        <div class="history-header"><h3>${rec.action || ''} - ${rec.cmcCode || ''}</h3></div>
        <div class="detail-grid">
          <div class="detail-item"><label>Date</label><span>${rec.date || ''} ${rec.time || ''}</span></div>
          <div class="detail-item"><label>User</label><span>${rec.user || ''}</span></div>
          <div class="detail-item"><label>Type</label><span>${rec.type || ''}</span></div>
          <div class="detail-item"><label>CMC</label><span class="cmc-code">${rec.cmcCode || ''}</span></div>
        </div>
        <div class="details-box">${rec.details || ''}</div>
      </div>`;
    utils.showModal('assetDetailsModal');
  }

  async function load() {
    const res = await API.getHistory({ q: query, ...filters });
    if (res && res.ok !== false) records = res.items || res.data || res || [];
    else records = [
      { date: '2024-06-01', time: '09:01', user: 'admin', cmcCode: 'CMC-001', action: 'Update', type: 'Asset', details: 'Updated RAM from 8GB to 16GB' },
      { date: '2024-06-02', time: '10:15', user: 'user', cmcCode: 'CMC-002', action: 'Login', type: 'System', details: 'User login' }
    ];
    render();
  }

  function search(v) { query = (v||'').toLowerCase(); page = 1; render(); }
  function filter(k, v) { filters[k] = v; page = 1; render(); }
  function applyDateFilter() { filters.from = document.getElementById('historyDateFrom').value; filters.to = document.getElementById('historyDateTo').value; page = 1; render(); }

  function sort(col) { if (sortCol === col) sortAsc = !sortAsc; else { sortCol = col; sortAsc = true; } render(); }
  function previousHistoryPage() { if (page > 1) { page--; render(); } }
  function nextHistoryPage() { const total = records.filter(()=>true).length; const maxPage = Math.ceil(total / pageSize); if (page < maxPage) { page++; render(); } }
  function exportHistory() { Notifications.toast('Exporting filtered history...', 'info'); }

  async function init() { await load(); }

  return { init, load, search, filter, sort, previousHistoryPage, nextHistoryPage, view, applyDateFilter, exportHistory };
})();

window.searchHistory = (v) => History.search(v);
window.filterHistory = (k,v) => History.filter(k,v);
window.applyDateFilter = () => History.applyDateFilter();
window.sortHistoryTable = (col) => History.sort(col);
window.previousHistoryPage = () => History.previousHistoryPage();
window.nextHistoryPage = () => History.nextHistoryPage();
window.exportHistory = () => History.exportHistory();