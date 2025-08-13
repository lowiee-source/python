// Simple API layer. Adjust endpoints if your backend uses different paths.
const API = (() => {
  const base = 'php';

  async function request(path, { method = 'GET', params = null, body = null, headers = {} } = {}) {
    try {
      const url = new URL(`${base}/${path}`, window.location.origin);
      if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && v !== null && url.searchParams.append(k, v));
      const init = { method, credentials: 'include', headers: {} };
      if (body instanceof FormData) {
        init.body = body;
      } else if (body) {
        init.headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(body);
      }
      Object.assign(init.headers, headers);
      const res = await fetch(url.toString(), init);
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = { ok: res.ok, status: res.status, text }; }
      if (!res.ok) throw json;
      return json;
    } catch (err) {
      console.warn('API error:', path, err);
      return { ok: false, error: err };
    }
  }

  // Auth
  const login = (username, password) => request('auth.php', { method: 'POST', body: { action: 'login', username, password } });
  const logout = () => request('auth.php', { method: 'POST', body: { action: 'logout' } });

  // Dashboard
  const getDashboardStats = () => request('dashboard_stats.php');

  // Assets
  const getAssets = (q = '', filters = {}) => request('assets.php', { params: { q, ...filters } });
  const addAsset = (asset) => request('assets.php', { method: 'POST', body: { action: 'create', asset } });
  const updateAsset = (id, asset) => request('assets.php', { method: 'POST', body: { action: 'update', id, asset } });
  const deleteAsset = (id) => request('assets.php', { method: 'POST', body: { action: 'delete', id } });
  const importAssetsCSV = (file) => { const fd = new FormData(); fd.append('file', file); fd.append('action', 'import'); return request('assets_import.php', { method: 'POST', body: fd }); };

  // Accounts
  const getAccounts = (q = '', filters = {}) => request('accounts.php', { params: { q, ...filters } });
  const createAccount = (account) => request('accounts.php', { method: 'POST', body: { action: 'create', account } });
  const updateAccount = (id, account) => request('accounts.php', { method: 'POST', body: { action: 'update', id, account } });
  const deleteAccount = (id) => request('accounts.php', { method: 'POST', body: { action: 'delete', id } });

  // History
  const getHistory = (params = {}) => request('history.php', { params });
  const exportHistory = (params = {}) => request('history_export.php', { params });

  // Logs
  const getLogs = (params = {}) => request('logs.php', { params });
  const clearLogs = (params = {}) => request('logs.php', { method: 'POST', body: { action: 'clear', ...params } });

  // Notifications
  const getNotifications = () => request('notifications.php');
  const clearNotifications = () => request('notifications.php', { method: 'POST', body: { action: 'clear' } });

  // Report Issue
  const reportIssue = (payload) => request('report_issue.php', { method: 'POST', body: payload });

  // Activity log (optional)
  const logActivity = (entry) => request('activity_logger.php', { method: 'POST', body: entry });

  return {
    login, logout,
    getDashboardStats,
    getAssets, addAsset, updateAsset, deleteAsset, importAssetsCSV,
    getAccounts, createAccount, updateAccount, deleteAccount,
    getHistory, exportHistory,
    getLogs, clearLogs,
    getNotifications, clearNotifications,
    reportIssue, logActivity,
  };
})();

window.API = API;