import { API, safeCall } from './api.js';
import { downloadChartById as downloadChart, toast, downloadCsv } from './utils.js';

let charts = {};

function destroyChart(id) { if (charts[id]) { charts[id].destroy(); delete charts[id]; } }

function buildCounts(assets) {
  const counts = { total: assets.length, inUse: 0, inStock: 0, maintenance: 0 };
  const byDept = {}; const byType = {}; const byOs = {}; const byRam = {};
  assets.forEach(a => {
    const status = (a.status || a.Status || '').toLowerCase();
    if (status.includes('use')) counts.inUse++; else if (status.includes('stock')) counts.inStock++; else if (status.includes('maint')) counts.maintenance++;
    const dept = a.department || a.Department || 'Unknown'; byDept[dept] = (byDept[dept]||0)+1;
    const cls = a.classification || a.Classification || 'Unknown'; byType[cls] = (byType[cls]||0)+1;
    const os = a.operatingSystem || a.OS || a.OperatingSystem || 'Unknown'; byOs[os] = (byOs[os]||0)+1;
    const ram = a.ram || a.RAM || 'Unknown'; byRam[ram] = (byRam[ram]||0)+1;
  });
  return { counts, byDept, byType, byOs, byRam };
}

function renderDoughnut(id, labels, data, colors) {
  destroyChart(id);
  const ctx = document.getElementById(id).getContext('2d');
  charts[id] = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 1 }] },
    options: { plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }
  });
}

function renderBar(id, labels, data, color) {
  destroyChart(id);
  const ctx = document.getElementById(id).getContext('2d');
  charts[id] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ data, backgroundColor: color }] },
    options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } }, maintainAspectRatio: false }
  });
}

export async function loadDashboard() {
  const assets = await safeCall(API.listAssets(), []);
  const { counts, byDept, byType, byOs, byRam } = buildCounts(Array.isArray(assets) ? assets : (assets.items || []));

  // Update cards
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('totalAssets', counts.total);
  setText('inUse', counts.inUse);
  setText('inStock', counts.inStock);
  setText('maintenance', counts.maintenance);

  // Charts
  renderDoughnut('statusChart', ['In Use', 'In Stock', 'Maintenance'], [counts.inUse, counts.inStock, counts.maintenance], ['#66bb6a','#a5d6a7','#ffd54f']);
  const deptLabels = Object.keys(byDept); const deptVals = Object.values(byDept);
  renderBar('departmentChart', deptLabels, deptVals, '#81C784');
  const typeLabels = Object.keys(byType); const typeVals = Object.values(byType);
  renderBar('typeChart', typeLabels, typeVals, '#A5D6A7');
  const ramLabels = Object.keys(byRam); const ramVals = Object.values(byRam);
  renderBar('ramChart', ramLabels, ramVals, '#66BB6A');
  const osLabels = Object.keys(byOs); const osVals = Object.values(byOs);
  renderBar('osChart', osLabels, osVals, '#4CAF50');

  // Growth chart: placeholder last 12 months with simple trend
  const months = Array.from({length: 12}, (_,i)=> new Date(new Date().getFullYear(), new Date().getMonth()-11+i,1).toLocaleString(undefined,{month:'short'}));
  const step = Math.max(1, Math.round(counts.total/12));
  const growth = months.map((_,i)=>Math.min(counts.total, (i+1)*step));
  renderBar('growthChart', months, growth, '#C8E6C9');
}

export function downloadChartHandler(id) { try { downloadChart(id, `${id}.png`); } catch { toast('Unable to download chart', 'error'); } }

// Small UI helpers used inline
export function animateCard(el){ if (!el) return; el.style.transform = 'translateY(-4px)'; setTimeout(()=> el.style.transform = '', 200); }
export async function exportData(kind){
  if (kind === 'csv') {
    const res = await safeCall(API.exportAssets({}), null);
    if (typeof res === 'string') downloadCsv('assets.csv', res);
  } else if (kind === 'pdf') {
    // Assuming backend returns a URL or triggers download
    try { await API.exportAssets({ format: 'pdf' }); } catch { toast('PDF export unavailable', 'warning'); }
  }
}

window.downloadChart = downloadChartHandler;
window.animateCard = animateCard;
window.exportData = exportData;