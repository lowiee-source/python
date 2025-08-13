const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const $ = (sel, ctx = document) => ctx.querySelector(sel);

function fmtNumber(n) { return Number(n || 0).toLocaleString(); }
function fmtDate(d) { try { return new Date(d).toLocaleDateString(); } catch { return d || ''; } }
function fmtDateTime(d) { try { return new Date(d).toLocaleString(); } catch { return d || ''; } }

function showModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('show');
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('show');
}

function downloadCanvasAsImage(canvasId, filename = 'chart.png') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  link.click();
}

function debounce(fn, wait = 250) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

window.utils = { $$, $, fmtNumber, fmtDate, fmtDateTime, showModal, closeModal, downloadCanvasAsImage, debounce };