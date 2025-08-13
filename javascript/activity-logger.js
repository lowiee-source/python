const ActivityLogger = {
  async log({ action, type, details, cmcCode, status = 'Success' }) {
    const user = Auth.getUser();
    const entry = { user: user?.username, action, type, details, cmcCode, status, timestamp: new Date().toISOString() };
    try { await API.logActivity(entry); } catch (e) { /* noop */ }
  }
};