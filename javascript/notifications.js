const Notifications = (() => {
  function updateBell(count) {
    const el = document.getElementById('notificationCount');
    if (!el) return;
    el.textContent = count > 0 ? String(count) : '';
  }

  function renderList(items) {
    // Use the drawer panel (not the nav-scoped container) to avoid ID collision
    const drawer = document.querySelector('.notification-panel');
    const listEl = drawer?.querySelector('#notificationList');
    if (!listEl) return;
    if (!items || items.length === 0) { listEl.innerHTML = '<div class="empty-notifications">No notifications</div>'; return; }
    listEl.innerHTML = items.map(n => `
      <div class="notification-item">
        <h4>${n.title || ''}</h4>
        <p>${n.message || ''}</p>
        <div class="notification-time">${utils.fmtDateTime(n.createdAt || n.time)}</div>
      </div>
    `).join('');
  }

  async function load() {
    const res = await API.getNotifications();
    const items = (res && res.ok !== false) ? (res.items || res.data || res || []) : [];
    updateBell(items.length);
    renderList(items);
  }

  function toggle() {
    const panel = document.querySelector('.notification-panel');
    if (!panel) return;
    panel.classList.toggle('show');
  }

  async function clearAll() { await API.clearNotifications(); await load(); }

  function show(title, message, type = 'info') {
    const box = document.createElement('div');
    box.className = `notification notification-${type}`;
    box.innerHTML = `<button class="notification-close" onclick="this.parentElement.remove()">×</button><div class="notification-content"><strong>${title}</strong><p>${message}</p></div>`;
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3500);
  }

  function toast(message, type = 'success') { show(message, '', type); }

  async function init() { await load(); }

  return { init, load, toggle, clearAll, show, toast };
})();

window.toggleNotifications = () => Notifications.toggle();
window.clearNotifications = () => Notifications.clearAll();