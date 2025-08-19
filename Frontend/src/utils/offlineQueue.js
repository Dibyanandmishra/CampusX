const STORAGE_KEY = "sosQueue";

function getQueue() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function setQueue(items) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {} }

export function enqueueSOS(payload) {
  const items = getQueue(); items.push({ ...payload, _queuedAt: Date.now() }); setQueue(items); return items.length;
}
export function queuedCount() { return getQueue().length; }
export async function flushQueue(sendFn) {
  let items = getQueue(); let sent = 0; const remaining = [];
  for (const item of items) {
    try { await sendFn(item); sent += 1; } catch { remaining.push(item); }
  }
  setQueue(remaining); return { sent, remaining: remaining.length };
}
