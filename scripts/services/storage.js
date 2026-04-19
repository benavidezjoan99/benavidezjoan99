const PREFIX = 'naa_';

export function get(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function set(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
}

export function clear(prefix = '') {
  const fullPrefix = PREFIX + prefix;
  Object.keys(localStorage)
    .filter(k => k.startsWith(fullPrefix))
    .forEach(k => localStorage.removeItem(k));
}
