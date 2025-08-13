import { API, safeCall } from './api.js';

export async function logActivity({ action, type, details, cmcCode }) {
  try { await safeCall(API.listLogs({ action: 'log', actionName: action, type, details, cmcCode }), null); } catch {}
}