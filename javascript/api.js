const DEFAULT_ENDPOINTS = {
  login: 'api/login.php',
  logout: 'api/logout.php',
  me: 'api/me.php',
  assets: 'api/assets.php',
  assetsImport: 'api/assets_import.php',
  assetsExport: 'api/assets_export.php',
  accounts: 'api/accounts.php',
  history: 'api/history.php',
  logs: 'api/logs.php',
  notifications: 'api/notifications.php',
  reportIssue: 'api/report_issue.php'
};

export const API_CONFIG = {
  baseUrl: '',
  endpoints: { ...DEFAULT_ENDPOINTS, ...(window.API_ENDPOINTS || {}) },
  credentials: 'include'
};

async function request(path, { method = 'GET', params, body, headers } = {}) {
  const url = new URL(path, API_CONFIG.baseUrl || window.location.origin + '/');
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  const opts = { method, headers: { 'Accept': 'application/json', ...(headers || {}) }, credentials: API_CONFIG.credentials };
  if (body && !(body instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    opts.body = body; // Let browser set multipart headers
  }
  const res = await fetch(url.toString(), opts);
  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) data = await res.json();
  else data = await res.text();
  if (!res.ok) throw new Error((data && data.message) || res.statusText || 'Request failed');
  return data;
}

export const API = {
  // Auth
  login: (username, password) => request(API_CONFIG.endpoints.login, { method: 'POST', body: { username, password } }),
  logout: () => request(API_CONFIG.endpoints.logout, { method: 'POST' }),
  me: () => request(API_CONFIG.endpoints.me),

  // Assets
  listAssets: (filters={}) => request(API_CONFIG.endpoints.assets, { params: { action: 'list', ...filters } }),
  addAsset: (payload) => request(API_CONFIG.endpoints.assets, { method: 'POST', body: { action: 'create', ...payload } }),
  updateAsset: (idOrSerial, payload) => request(API_CONFIG.endpoints.assets, { method: 'POST', body: { action: 'update', id: idOrSerial, ...payload } }),
  deleteAsset: (idOrSerial) => request(API_CONFIG.endpoints.assets, { method: 'POST', body: { action: 'delete', id: idOrSerial } }),
  importAssets: (file) => {
    const fd = new FormData(); fd.append('file', file); fd.append('action', 'import');
    return request(API_CONFIG.endpoints.assetsImport, { method: 'POST', body: fd });
  },
  exportAssets: (filters={}) => request(API_CONFIG.endpoints.assetsExport, { params: { ...filters } }),

  // Accounts
  listAccounts: (filters={}) => request(API_CONFIG.endpoints.accounts, { params: { action: 'list', ...filters } }),
  createAccount: (payload) => request(API_CONFIG.endpoints.accounts, { method: 'POST', body: { action: 'create', ...payload } }),
  updateAccount: (id, payload) => request(API_CONFIG.endpoints.accounts, { method: 'POST', body: { action: 'update', id, ...payload } }),
  deleteAccount: (id) => request(API_CONFIG.endpoints.accounts, { method: 'POST', body: { action: 'delete', id } }),

  // History
  listHistory: (filters={}) => request(API_CONFIG.endpoints.history, { params: { action: 'list', ...filters } }),
  exportHistory: (filters={}) => request(API_CONFIG.endpoints.history, { params: { action: 'export', ...filters } }),

  // Logs
  listLogs: (filters={}) => request(API_CONFIG.endpoints.logs, { params: { action: 'list', ...filters } }),
  clearLogs: (olderThan) => request(API_CONFIG.endpoints.logs, { method: 'POST', body: { action: 'clear', olderThan } }),
  exportLogs: (filters={}) => request(API_CONFIG.endpoints.logs, { params: { action: 'export', ...filters } }),

  // Notifications
  listNotifications: () => request(API_CONFIG.endpoints.notifications, { params: { action: 'list' } }),
  clearNotifications: () => request(API_CONFIG.endpoints.notifications, { method: 'POST', body: { action: 'clear' } }),

  // Report Issue
  reportIssue: (payload) => request(API_CONFIG.endpoints.reportIssue, { method: 'POST', body: payload })
};

// Fallback shims if backend is not available during development
export async function safeCall(promise, fallback) {
  try { return await promise; } catch { return fallback; }
}