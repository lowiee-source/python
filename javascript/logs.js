import { API, safeCall } from './api.js';
import { qs, qsa, debounce } from './utils.js';

let allLogs = [];
let filtered = [];
let sortIdx = 0, sortAsc = false;
let page = 1, pageSize = 50;
let filters = { search: '', user: '', action: '', type: '', status: '', from: '', to: '' };
let autoRefreshTimer = null;

function applyFilters() {
  filtered = allLogs.filter(l => {
    const txt = `${l.datetime||''} ${l.user||''} ${l.ip||''} ${l.action||''} ${l.type||''} ${l.status||''} ${l.details||''} ${l.cmcCode||''}`.toLowerCase();
    const s = filters.search.toLowerCase();
    const ok = (!s || txt.includes(s)) && (!filters.user || l.user === filters.user) && (!filters.action || (l.action||'').includes(filters.action)) && (!filters.type || l.type === filters.type) && (!filters.status || l.status === filters.status);
    if (!ok) return false;
    if (filters.from && new Date(l.datetime) < new Date(filters.from)) return false;
    if (filters.to && new Date(l.datetime) > new Date(filters.to)) return false;
    return true;
  });
  sortAndRender();
}

function sortAndRender() {
  const keys = ['datetime','user','action','type','cmcCode','details','session'];
  const k = keys[sortIdx] || 'datetime';
  filtered.sort((a,b)=> (String(a[k]||'').localeCompare(String(b[k]||''))) * (sortAsc?1:-1));
  renderPage();
}

function renderPage() {
  const start = (page-1)*pageSize; const end = start+pageSize;
  const rows = filtered.slice(start,end);
  const tbody = qs('#logsTableBody');
  tbody.innerHTML = '';
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No logs</td></tr>'; }
  rows.forEach(l => {
    const tr = document.createElement('tr'); tr.className = 'log-row';
    tr.innerHTML = `
      <td class="date-cell"><div class="date-primary">${l.date||''}</div><div class="date-secondary">${l.time||''}</div></td>
      <td class="user-cell"><div class="user-name">${l.user||''}</div><div class="user-ip">${l.ip||''}</div></td>
      <td><span class="action-badge ${(l.actionClass||'').toLowerCase()||'info'}">${l.action||''}</span></td>
      <td><span class="type-badge ${(l.typeClass||'').toLowerCase()||'default'}">${l.type||''}</span></td>
      <td class="cmc-cell">${l.cmcCode||''}</td>
      <td class="details-cell"><div class="details-preview">${l.details||''}</div></td>
      <td class="session-cell">${l.session||''}</td>
      <td class="actions-cell"><button class="btn-action view-btn">View</button><button class="btn-action copy-btn">Copy</button></td>`;
    tbody.appendChild(tr);
  });
  qs('#logsResultsCount').textContent = `${filtered.length} results`;
  qs('#logsPaginationInfo').textContent = `Showing ${Math.min(end, filtered.length)} of ${filtered.length} records`;
  qs('#logsPrevBtn').disabled = page <= 1;
  qs('#logsNextBtn').disabled = end >= filtered.length;
  qs('#filteredLogsCount').textContent = filtered.length;
  qs('#lastLogsUpdate').textContent = new Date().toLocaleTimeString();
}

export async function loadActivityLogs() {
  const res = await safeCall(API.listLogs(), []);
  allLogs = Array.isArray(res) ? res : (res.items || []);
  // Summary
  const set = (id,val)=>{ const el = document.getElementById(id); if (el) el.textContent = val; };
  set('totalLogsCount', allLogs.length);
  const today = new Date().toDateString();
  set('todayLogsCount', allLogs.filter(l => (new Date(l.datetime||l.date||Date.now())).toDateString() === today).length);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
  set('weekLogsCount', allLogs.filter(l => new Date(l.datetime||l.date||0) >= weekAgo).length);
  const users = Array.from(new Set(allLogs.map(l=>l.user).filter(Boolean))).sort();
  qs('#activeLogUsers').textContent = users.length;
  const userSel = qs('#userFilter'); if (userSel) { userSel.innerHTML = '<option value="">All Users</option>' + users.map(u=>`<option>${u}</option>`).join(''); }
  applyFilters();
}

export const searchLogs = debounce((v) => { filters.search = v; applyFilters(); }, 200);
export function filterLogs(k,v){ filters[k]=v; applyFilters(); }
export function sortLogsTable(idx){ if (sortIdx===idx) sortAsc=!sortAsc; else { sortIdx=idx; sortAsc=true; } sortAndRender(); }
export function changeLogsPageSize(v){ pageSize = Number(v)||50; page=1; renderPage(); }
export function previousLogsPage(){ if (page>1) { page--; renderPage(); } }
export function nextLogsPage(){ const pages = Math.ceil(filtered.length/pageSize); if (page<pages) { page++; renderPage(); } }
export async function exportLogs(){ await API.exportLogs(filters); }
export async function clearLogs(){ await safeCall(API.clearLogs(), null); await loadActivityLogs(); }

function setupAutoRefresh(){
  const toggle = qs('#autoRefreshToggle');
  if (!toggle) return;
  const statusDot = qs('#realTimeStatus');
  const setActive = (active)=>{ if (statusDot) statusDot.classList.toggle('active', !!active); qs('#autoRefreshStatus').textContent = active ? 'Active' : 'Paused'; };
  const start = ()=>{ if (autoRefreshTimer) return; autoRefreshTimer = setInterval(loadActivityLogs, 15000); setActive(true); };
  const stop = ()=>{ if (autoRefreshTimer) clearInterval(autoRefreshTimer); autoRefreshTimer=null; setActive(false); };
  toggle.onchange = () => toggle.checked ? start() : stop();
  start();
}

window.searchLogs = searchLogs;
window.filterLogs = filterLogs;
window.sortLogsTable = sortLogsTable;
window.changeLogsPageSize = changeLogsPageSize;
window.previousLogsPage = previousLogsPage;
window.nextLogsPage = nextLogsPage;
window.exportLogs = exportLogs;
window.clearLogs = clearLogs;

export function initLogs(){ setupAutoRefresh(); }