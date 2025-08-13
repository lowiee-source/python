const Main = (() => {
  function populateNav() {
    const user = Auth.getUser();
    const role = (user && user.role) || 'User';
    const isUser = role.toLowerCase() === 'user';
    const menu = document.getElementById('navMenu');
    const items = [
      { id: 'dashboardContent', label: 'Dashboard' },
      { id: 'assetsContent', label: 'Inventory' },
      { id: 'historyContent', label: 'History' },
      { id: 'logsContent', label: 'Activity Logs' },
    ];
    if (!isUser) items.push({ id: 'accountsContent', label: 'Accounts' });
    menu.innerHTML = items.map((it, idx) => `<li data-target="${it.id}" class="${idx===0?'active':''}">${it.label}</li>`).join('');
    menu.querySelectorAll('li').forEach(li => li.addEventListener('click', () => showSection(li.getAttribute('data-target'), li)));
    showSection(items[0].id, menu.querySelector('li'));
  }

  function showSection(id, li) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    document.querySelectorAll('#navMenu li').forEach(n => n.classList.remove('active'));
    if (li) li.classList.add('active');
  }

  function bindProfile() {
    const trigger = document.querySelector('.profile-trigger');
    const menu = document.getElementById('profileMenu');
    if (trigger) trigger.addEventListener('click', () => menu.classList.toggle('show'));
    document.addEventListener('click', (e) => { if (!trigger.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('show'); });
  }

  function hideLoader() { const ls = document.getElementById('loadingScreen'); if (ls) { ls.style.opacity = '0'; ls.style.visibility = 'hidden'; setTimeout(()=>ls.remove(), 400); } }

  function initHelpAbout() {
    document.getElementById('copyrightYear').textContent = new Date().getFullYear();
    // FAQs expand/collapse
    utils.$$('.faq-question').forEach(q => q.addEventListener('click', () => {
      q.classList.toggle('active');
      const ans = q.nextElementSibling; ans.classList.toggle('show');
    }));
  }

  return { populateNav, showSection, bindProfile, hideLoader, initHelpAbout };
})();

// Global handlers expected by HTML
function animateCard(el) { el.classList.add('wave-effect'); setTimeout(()=>el.classList.remove('wave-effect'), 600); }
function showProfile() { Notifications.toast('Profile coming soon', 'info'); }
function showHelp() { utils.showModal('helpModal'); }
function showAbout() { utils.showModal('aboutModal'); }
function toggleProfile() { const menu = document.getElementById('profileMenu'); if (menu) menu.classList.toggle('show'); }
function filterFaqs(q='') { q = q.toLowerCase(); utils.$$('#faqList .faq-item').forEach(it => { const text = it.textContent.toLowerCase(); it.style.display = text.includes(q) ? '' : 'none'; }); }

window.downloadChart = downloadChart;
window.animateCard = animateCard;
window.showHelp = showHelp;
window.showAbout = showAbout;
window.toggleProfile = toggleProfile;
window.filterFaqs = filterFaqs;
window.exportData = (type) => { Notifications.toast(`Exporting ${type?.toUpperCase?.()||'data'}...`, 'info'); };

// Boot
window.addEventListener('DOMContentLoaded', async () => {
  // form handler binding
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', Auth.handleLogin);

  Notifications.init();
  Main.bindProfile();
  Main.initHelpAbout();
  Auth.applyRoleGates();
  setTimeout(Main.hideLoader, 500);
});