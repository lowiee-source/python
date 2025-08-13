import { API, safeCall } from './api.js';
import { qs, qsa, openModal, closeModal, toast, canPerformCrud } from './utils.js';

const STORAGE_KEY = 'itam_user';

export function getCurrentUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  const nameEl = qs('#profileName');
  if (nameEl) nameEl.textContent = user?.name || user?.username || 'User';
}

function buildMenu(role) {
  const menu = qs('#navMenu');
  if (!menu) return;
  const entries = [
    { id: 'dashboardContent', label: 'Dashboard' },
    { id: 'assetsContent', label: 'Inventory' },
    { id: 'historyContent', label: 'History' },
    { id: 'logsContent', label: 'Activity Logs' }
  ];
  menu.innerHTML = '';
  entries.forEach((e, idx) => {
    const li = document.createElement('li');
    li.textContent = e.label;
    li.tabIndex = 0;
    li.onclick = () => showSection(e.id);
    if (idx === 0) li.classList.add('active');
    menu.appendChild(li);
  });
}

export async function handleLogin(ev) {
  ev.preventDefault();
  const username = qs('#username').value.trim();
  const password = qs('#password').value;
  const rememberMe = qs('#rememberMe').checked;

  let user = await safeCall(API.login(username, password), null);
  if (!user) {
    // Dev fallback if backend not reachable
    if ((username === 'admin' && password === 'admin') || (username === 'user' && password === 'user')) {
      user = { id: 1, username, role: username === 'admin' ? 'Admin' : 'User', name: username.toUpperCase() };
    }
  }
  if (!user) { toast('Invalid credentials', 'error'); return; }

  setCurrentUser(user);
  if (rememberMe) localStorage.setItem('rememberMe', '1'); else localStorage.removeItem('rememberMe');

  // Switch UI
  qs('#welcomeContainer').style.display = 'none';
  qs('#loginContainer').style.display = 'none';
  qs('#dashboardContainer').style.display = 'block';

  buildMenu(user.role);
  enforceRoleRestrictions();
  window.loadInitialData?.();
}

export async function logout() {
  await safeCall(API.logout(), null);
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

export function showWelcome() {
  qs('#welcomeContainer').style.display = 'flex';
  qs('#loginContainer').style.display = 'none';
}
export function showLogin() {
  qs('#welcomeContainer').style.display = 'none';
  qs('#loginContainer').style.display = 'grid';
}

export function enforceRoleRestrictions() {
  const user = getCurrentUser();
  const role = (user?.role || '').toLowerCase();
  const allowedCrud = canPerformCrud(role);

  // Hide add/edit/delete/import for basic users
  qsa('.add-asset-btn, .upload-csv-btn').forEach(btn => btn.style.display = allowedCrud ? '' : 'none');
  qsa('.action-btn.edit-btn, .action-btn.delete-btn').forEach(btn => btn.disabled = !allowedCrud);
  const createBtn = qs('#createAccountBtn');
  if (createBtn) createBtn.style.display = (role === 'admin' || role === 'super admin') ? '' : 'none';

  // Report Issue visible for all, but especially for users
  const reportBtn = qs('.report-issue-btn');
  if (reportBtn) reportBtn.style.display = '';
}

// Section visibility
export function showSection(id) {
  qsa('.content-section').forEach(sec => sec.style.display = 'none');
  const sec = document.getElementById(id);
  if (sec) sec.style.display = 'block';
  qsa('#navMenu li').forEach(li => li.classList.remove('active'));
  const menu = qs('#navMenu');
  if (menu) {
    const labels = { dashboardContent: 'Dashboard', assetsContent: 'Inventory', historyContent: 'History', logsContent: 'Activity Logs' };
    Array.from(menu.children).forEach(li => { if (li.textContent === labels[id]) li.classList.add('active'); });
  }
}

// Profile menu toggle
export function toggleProfile() {
  const menu = qs('#profileMenu');
  if (!menu) return;
  menu.classList.toggle('show');
  const hide = (e) => { if (!menu.contains(e.target) && !e.target.closest('.profile-trigger')) { menu.classList.remove('show'); document.removeEventListener('click', hide); } };
  setTimeout(() => document.addEventListener('click', hide), 0);
}

// Global
window.handleLogin = handleLogin;
window.logout = logout;
window.showWelcome = showWelcome;
window.showLogin = showLogin;
window.showSection = showSection;
window.toggleProfile = toggleProfile;