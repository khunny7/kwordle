const KEY = 'kwordle:history:v1';

export function getHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendHistory(entry) {
  try {
    const list = getHistory();
    list.push(entry);
    // keep last 100
    const trimmed = list.slice(-100);
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // ignore storage errors
  }
}

export function clearHistory() {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
}
