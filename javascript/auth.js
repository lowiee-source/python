const Auth = (() => {
  const STORAGE_KEY = 'itams_user';

  function getUser() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch { return null; }
  }
  function setUser(u) { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); }
  function clearUser() { localStorage.removeItem(STORAGE_KEY); }

  function applyRoleGates() {
    const user = getUser();
    const role = (user && user.role) || 'User';
    const isUser = role.toLowerCase() === 'user';

    // Asset actions
    const addBtn = document.getElementById('addAssetBtn');
    const uploadBtn = document.getElementById('uploadCsvBtn');
    const reportBtn = document.getElementById('reportIssueBtn');
    if (addBtn) addBtn.style.display = isUser ? 'none' : '';
    if (uploadBtn) uploadBtn.style.display = isUser ? 'none' : '';
    if (reportBtn) reportBtn.style.display = isUser ? '' : 'none';

    // Create account button
    const createBtn = document.getElementById('createAccountBtn');
    if (createBtn) createBtn.style.display = isUser ? 'none' : '';

    // Actions columns/buttons within tables can be gated at render time in respective modules
  }

  async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const res = await API.login(username, password);
    if (res && res.ok !== false) {
      const user = res.user || { username, role: res.role || 'User', name: res.name || username };
      setUser(user);
      document.getElementById('profileName').textContent = user.name || user.username;
      showDashboard();
      applyRoleGates();
    } else {
      Notifications.show('Login failed', res.error?.message || 'Invalid credentials', 'error');
    }
  }

  function showDashboard() {
    document.getElementById('welcomeContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';
    Main.populateNav();
    Dashboard.init();
    Assets.init();
    Accounts.init();
    History.init();
    Logs.init();
  }

  function showLogin() {
    document.getElementById('welcomeContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'grid';
  }

  function showWelcome() {
    document.getElementById('welcomeContainer').style.display = 'grid';
    document.getElementById('loginContainer').style.display = 'none';
  }

  async function logout() {
    await API.logout();
    clearUser();
    location.reload();
  }

  return { getUser, applyRoleGates, handleLogin, showLogin, showWelcome, showDashboard, logout };
})();

window.handleLogin = Auth.handleLogin;
window.showLogin = Auth.showLogin;
window.showWelcome = Auth.showWelcome;
window.logout = Auth.logout;