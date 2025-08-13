const Dashboard = (() => {
  let charts = {};

  function renderSummary(stats) {
    document.getElementById('totalAssets').textContent = utils.fmtNumber(stats.totalAssets || 0);
    document.getElementById('inUse').textContent = utils.fmtNumber(stats.inUse || 0);
    document.getElementById('inStock').textContent = utils.fmtNumber(stats.inStock || 0);
    document.getElementById('maintenance').textContent = utils.fmtNumber(stats.maintenance || 0);
  }

  function createChart(id, cfg) {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(ctx, cfg);
  }

  function buildCharts(stats) {
    const palette = ['#2E7D32', '#4CAF50', '#81C784', '#A5D6A7', '#C8E6C9', '#66BB6A'];

    createChart('statusChart', {
      type: 'doughnut',
      data: {
        labels: ['In Use', 'In Stock', 'Maintenance', 'Retired'],
        datasets: [{ data: [stats.inUse||0, stats.inStock||0, stats.maintenance||0, stats.retired||0], backgroundColor: ['#2E7D32','#66BB6A','#FFC107','#9E9E9E'] }]
      }, options: { plugins: { legend: { position: 'bottom' } } }
    });

    const deptLabels = (stats.byDepartment || []).map(d => d.name);
    const deptValues = (stats.byDepartment || []).map(d => d.count);
    createChart('departmentChart', {
      type: 'bar',
      data: { labels: deptLabels, datasets: [{ label: 'Assets', data: deptValues, backgroundColor: palette }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    const months = (stats.growth || []).map(d => d.month);
    const growth = (stats.growth || []).map(d => d.count);
    createChart('growthChart', {
      type: 'line', data: { labels: months, datasets: [{ label: 'Monthly Growth', data: growth, borderColor: '#2E7D32', backgroundColor: 'rgba(76,175,80,.15)', fill: true }] },
      options: { plugins: { legend: { position: 'bottom' } } }
    });

    const types = (stats.byType || []).map(d => d.name);
    const typeCounts = (stats.byType || []).map(d => d.count);
    createChart('typeChart', {
      type: 'polarArea', data: { labels: types, datasets: [{ data: typeCounts, backgroundColor: palette }] }, options: { plugins: { legend: { position: 'bottom' } } }
    });

    const rams = (stats.byRam || []).map(d => d.name);
    const ramCounts = (stats.byRam || []).map(d => d.count);
    createChart('ramChart', {
      type: 'bar', data: { labels: rams, datasets: [{ label: 'Units', data: ramCounts, backgroundColor: '#81C784' }] }, options: { plugins: { legend: { position: 'bottom' } } }
    });

    const osLabels = (stats.byOs || []).map(d => d.name);
    const osCounts = (stats.byOs || []).map(d => d.count);
    createChart('osChart', {
      type: 'doughnut', data: { labels: osLabels, datasets: [{ data: osCounts, backgroundColor: ['#2E7D32','#4CAF50','#81C784','#A5D6A7','#C8E6C9'] }] }, options: { plugins: { legend: { position: 'bottom' } } }
    });
  }

  async function init() {
    const res = await API.getDashboardStats();
    const demo = {
      totalAssets: 0, inUse: 0, inStock: 0, maintenance: 0, retired: 0,
      byDepartment: [{ name: 'IT', count: 12 }, { name: 'HR', count: 6 }, { name: 'Finance', count: 8 }],
      growth: [
        { month: 'Jan', count: 5 }, { month: 'Feb', count: 7 }, { month: 'Mar', count: 9 },
        { month: 'Apr', count: 6 }, { month: 'May', count: 10 }, { month: 'Jun', count: 12 }
      ],
      byType: [{ name: 'Laptop', count: 20 }, { name: 'Desktop', count: 30 }, { name: 'Monitor', count: 25 }],
      byRam: [{ name: '4GB', count: 10 }, { name: '8GB', count: 25 }, { name: '16GB', count: 15 }],
      byOs: [{ name: 'Windows 10', count: 30 }, { name: 'Windows 11', count: 15 }]
    };
    const stats = (res && res.ok !== false) ? res : demo;
    renderSummary(stats);
    buildCharts(stats);
  }

  return { init };
})();

function downloadChart(id) { utils.downloadCanvasAsImage(id, `${id}.png`); }