// DOM helpers
export const qs = (sel, ctx = document) => ctx.querySelector(sel);
export const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
export const on = (el, type, handler, opts) => el && el.addEventListener(type, handler, opts);

// Debounce
export const debounce = (fn, wait = 300) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
};

// Modal controls (centered flex)
export function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('show');
  modal.style.display = 'flex';
}
export function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('show');
  modal.style.display = 'none';
}

// Download Chart image
export function downloadChartById(canvasId, filename = 'chart.png') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Simple toast
export function toast(message, type = 'info', timeout = 3000) {
  const div = document.createElement('div');
  div.className = `logs-notification ${type}`;
  div.textContent = message;
  const btn = document.createElement('button');
  btn.className = 'notification-close';
  btn.textContent = '×';
  btn.onclick = () => div.remove();
  div.appendChild(btn);
  document.body.appendChild(div);
  setTimeout(() => div.remove(), timeout);
}

// Safe JSON parse
export function safeJson(data, fallback = null) {
  try { return JSON.parse(data); } catch { return fallback; }
}

// Date helpers
export function formatDateTime(d) {
  const dt = (d instanceof Date) ? d : new Date(d);
  return dt.toLocaleString();
}

// Role utils
export function canPerformCrud(role) {
  return role && role.toLowerCase() !== 'user';
}

// Export CSV from text
export function downloadCsv(filename, csvText) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

// Inline helpers used by HTML
window.closeModal = closeModal;