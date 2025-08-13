import { API, safeCall } from './api.js';
import { qs, qsa, debounce } from './utils.js';

let allHistory = [];
let filtered = [];
let sortIdx = 0, sortAsc = false;
let page = 1, pageSize = 50;
let filters = { search: '', type: '', user: '', action: '', from: '', to: '' };

function applyFilters() {
  filtered = allHistory.filter(h => {
    const txt = `${h.date||''} ${h.time||''} ${h.user||''} ${h.cmcCode||''} ${h.action||''} ${h.type||''} ${h.details||''}`.toLowerCase();
    const s = filters.search.toLowerCase();
    const ok = (!s || txt.includes(s)) && (!filters.type || h.type === filters.type) && (!filters.user || h.user === filters.user) && (!filters.action || h.action === filters.action);
    if (!ok) return false;
    if (filters.from) { if (new Date(h.date) < new Date(filters.from)) return false; }
    if (filters.to) { if (new Date(h.date) > new Date(filters.to)) return false; }
    return true;
  });
  sortAndRender();
}

function sortAndRender() {
  filtered.sort((a,b) => {
    const keys = ['date','time','user','cmcCode','action','type','details'];
    const k = keys[sortIdx] || 'date';
    const av = (a[k]||'').toString();
    const bv = (b[k]||'').toString();
    return (av.localeCompare(bv)) * (sortAsc ? 1 : -1);
  });
  renderPage();
}

function renderPage() {
  const start = (page-1)*pageSize; const end = start+pageSize;
  const rows = filtered.slice(start, end);
  const tbody = qs('#historyTableBody');
  tbody.innerHTML = '';
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="8" class="history-loading">No records</td></tr>'; }
  rows.forEach(h => {
    const tr = document.createElement('tr'); tr.className = 'history-row';
    tr.innerHTML = `<td>${h.date||''}</td><td>${h.time||''}</td><td>${h.user||''}</td><td>${h.cmcCode||''}</td><td>${h.action||''}</td><td>${h.type||''}</td><td class="details-cell">${h.details||''}</td><td><button class="btn-action view-btn">View</button></td>`;
    tbody.appendChild(tr);
  });
  qs('#historyResultsCount').textContent = `${filtered.length} results`;
  qs('#historyPaginationInfo').textContent = `Showing ${Math.min(end, filtered.length)} of ${filtered.length} records`;
  qs('#historyPrevBtn').disabled = page <= 1;
  qs('#historyNextBtn').disabled = end >= filtered.length;
  // Page numbers
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const wrap = qs('#historyPageNumbers'); wrap.innerHTML = '';
  for (let i=1;i<=pages;i++) { const a = document.createElement('a'); a.href = '#'; a.className = `page-number ${i===page?'active':''}`; a.textContent = i; a.onclick = (e)=>{e.preventDefault(); page=i; renderPage();}; wrap.appendChild(a); }
}

export async function loadHistoryData() {
  const res = await safeCall(API.listHistory(), []);
  allHistory = Array.isArray(res) ? res : (res.items || []);
  // Populate user filter options
  const users = Array.from(new Set(allHistory.map(h => h.user).filter(Boolean))).sort();
  const userSel = qs('#historyUserFilter'); if (userSel) { userSel.innerHTML = '<option value="">All Users</option>' + users.map(u=>`<option>${u}</option>`).join(''); }
  applyFilters();
}

export const searchHistory = debounce((v) => { filters.search = v; applyFilters(); }, 200);
export function filterHistory(k, v) { filters[k] = v; applyFilters(); }
export function applyDateFilter() { filters.from = qs('#historyDateFrom').value; filters.to = qs('#historyDateTo').value; applyFilters(); }
export function clearHistoryFilters() { filters = { search: '', type: '', user: '', action: '', from: '', to: '' }; qs('#historySearch').value=''; applyFilters(); }
export function sortHistoryTable(idx) { if (sortIdx === idx) sortAsc = !sortAsc; else { sortIdx = idx; sortAsc = true; } sortAndRender(); }
export function previousHistoryPage() { if (page>1) { page--; renderPage(); } }
export function nextHistoryPage() { const pages = Math.ceil(filtered.length/pageSize); if (page<pages) { page++; renderPage(); } }
export async function exportHistory() { await API.exportHistory(filters); }

window.searchHistory = searchHistory;
window.filterHistory = filterHistory;
window.applyDateFilter = applyDateFilter;
window.clearHistoryFilters = clearHistoryFilters;
window.sortHistoryTable = sortHistoryTable;
window.previousHistoryPage = previousHistoryPage;
window.nextHistoryPage = nextHistoryPage;
window.exportHistory = exportHistory;