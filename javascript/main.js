import { loadDashboard } from './dashboard.js';
import { loadAssets } from './assets.js';
import { loadAccounts } from './accounts.js';
import { loadHistoryData } from './history.js';
import { loadActivityLogs, initLogs } from './logs.js';
import { loadNotifications } from './notifications.js';
import { showSection, getCurrentUser, enforceRoleRestrictions } from './auth.js';
import { openModal } from './utils.js';

function hideLoading() {
  const ls = document.getElementById('loadingScreen');
  if (ls) { ls.style.opacity = '0'; ls.style.visibility = 'hidden'; setTimeout(()=> ls.remove(), 400); }
}

async function init() {
  // Show welcome or dashboard based on remembered user
  const remembered = localStorage.getItem('rememberMe') === '1';
  const user = getCurrentUser();
  if (remembered && user) {
    document.getElementById('welcomeContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';
  }
  hideLoading();
  enforceRoleRestrictions();
  await loadNotifications();

  // Load initial data when dashboard visible
  window.loadInitialData = async () => {
    await Promise.allSettled([
      loadDashboard(),
      loadAssets(),
      loadAccounts(),
      loadHistoryData(),
      loadActivityLogs()
    ]);
    initLogs();
  };
  if (document.getElementById('dashboardContainer').style.display === 'block') {
    await window.loadInitialData();
  }
}

// Help/About/Profile modals
function showHelp() {
  const body = document.getElementById('genericModalBody');
  const title = document.getElementById('genericModalTitle');
  title.textContent = 'Help & FAQ';
  body.innerHTML = `
    <div class="help-content">
      <input type="text" id="faqSearch" class="search-input" placeholder="Search FAQs..." style="width:100%; margin-bottom:12px;">
      <div id="faqList">
        <div class="faq-item"><div class="faq-question">How to add a new asset?</div><div class="faq-answer">Go to Inventory and click "+ Add Asset". Fill in required fields and submit.</div></div>
        <div class="faq-item"><div class="faq-question">Why can't I edit assets?</div><div class="faq-answer">Your role may be User. Only Admins can edit/delete/import assets.</div></div>
        <div class="faq-item"><div class="faq-question">How to export logs?</div><div class="faq-answer">Go to Activity Logs and click Export in the table header.</div></div>
      </div>
    </div>`;
  const search = document.getElementById('faqSearch');
  search.oninput = () => {
    const q = search.value.toLowerCase();
    document.querySelectorAll('#faqList .faq-item').forEach(item => {
      const text = item.querySelector('.faq-question').textContent.toLowerCase();
      item.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
  };
  document.querySelectorAll('#faqList .faq-question').forEach(q => {
    q.onclick = () => {
      const ans = q.nextElementSibling; ans.classList.toggle('show'); q.classList.toggle('active');
    };
  });
  openModal('genericModal');
}

function showAbout() {
  const body = document.getElementById('genericModalBody');
  const title = document.getElementById('genericModalTitle');
  title.textContent = 'About';
  body.innerHTML = `
    <div class="about-content">
      <div class="about-section">
        <h4>Calamba Medical Center - ITAMS</h4>
        <p>A professional, secure, and efficient IT Asset Management System.</p>
      </div>
      <div class="about-section">
        <p>Version: 1.0.0</p>
        <p>Theme: Light Green Glassmorphism</p>
      </div>
      <div class="copyright">© ${new Date().getFullYear()} Calamba Medical Center</div>
    </div>`;
  openModal('genericModal');
}

function showProfile() {
  const user = getCurrentUser() || { username: 'Guest', role: 'User' };
  const body = document.getElementById('genericModalBody');
  const title = document.getElementById('genericModalTitle');
  title.textContent = 'Profile Details';
  body.innerHTML = `
    <div class="profile-details">
      <div class="profile-header">
        <div class="profile-avatar">${(user.name||user.username||'U').slice(0,1).toUpperCase()}</div>
        <h3>${user.name || user.username}</h3>
        <div class="role-badge ${(user.role||'').toLowerCase().replace(' ','-')}">${user.role||''}</div>
      </div>
      <div class="detail-grid">
        <div class="detail-item"><label>Username</label><span>${user.username||''}</span></div>
        <div class="detail-item"><label>Role</label><span>${user.role||''}</span></div>
      </div>
    </div>`;
  openModal('genericModal');
}

window.showHelp = showHelp;
window.showAbout = showAbout;
window.showProfile = showProfile;

window.addEventListener('DOMContentLoaded', init);