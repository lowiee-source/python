import { API, safeCall } from './api.js';
import { qs, qsa } from './utils.js';

export async function loadNotifications() {
  const data = await safeCall(API.listNotifications(), { items: [] });
  const items = Array.isArray(data) ? data : (data.items || []);
  const panels = qsa('#notificationPanel');
  const countEl = qs('#notificationCount');
  const count = items.length;
  if (countEl) countEl.textContent = count ? String(count) : '';

  panels.forEach(panel => {
    let list = panel.querySelector('.notification-list');
    if (!list) { list = document.createElement('div'); list.className = 'notification-list'; panel.appendChild(list); }
    list.innerHTML = '';
    if (!count) {
      const empty = document.createElement('div');
      empty.className = 'empty-notifications';
      empty.textContent = 'No new notifications.';
      list.appendChild(empty);
      return;
    }
    items.forEach(n => {
      const item = document.createElement('div');
      item.className = 'notification-item';
      item.innerHTML = `<div class="notification-type ${n.type||'info'}"></div>
                        <div class="notification-content">
                          <strong>${n.title || 'Notification'}</strong>
                          <p>${n.message || ''}</p>
                          <small>${n.time || ''}</small>
                        </div>`;
      list.appendChild(item);
    });
  });
}

export function toggleNotifications() {
  const panels = qsa('#notificationPanel, .notification-panel');
  panels.forEach(p => p.classList.toggle('show'));
}

export async function clearNotifications() {
  await safeCall(API.clearNotifications(), null);
  await loadNotifications();
}

window.toggleNotifications = toggleNotifications;
window.clearNotifications = clearNotifications;