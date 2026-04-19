import { get, set, remove } from './services/storage.js';
import { setState } from './state.js';

const SESSION_KEY = 'session';
const CREDS_KEY = 'credentials';
const SESSION_TTL = 24 * 60 * 60 * 1000;

function encode(obj) {
  return btoa(JSON.stringify(obj));
}

function decode(str) {
  try { return JSON.parse(atob(str)); } catch { return null; }
}

function seedCredentials() {
  if (!get(CREDS_KEY)) {
    set(CREDS_KEY, encode({ username: 'admin', password: 'admin' }));
  }
}

export function init() {
  seedCredentials();
  const session = get(SESSION_KEY);
  if (session && session.token && session.ts) {
    if (Date.now() - session.ts < SESSION_TTL) {
      setState({ user: { username: session.username, loggedIn: true } });
      hideOverlay();
      return true;
    }
  }
  showOverlay();
  return false;
}

export function login(username, password) {
  const encoded = get(CREDS_KEY);
  if (!encoded) return false;
  const creds = decode(encoded);
  if (!creds) return false;
  if (creds.username === username && creds.password === password) {
    set(SESSION_KEY, {
      username,
      token: btoa(username + ':' + Date.now()),
      ts: Date.now()
    });
    setState({ user: { username, loggedIn: true } });
    hideOverlay();
    return true;
  }
  return false;
}

export function logout() {
  remove(SESSION_KEY);
  setState({ user: { username: '', loggedIn: false } });
  showOverlay();
}

export function isAuthenticated() {
  const session = get(SESSION_KEY);
  return !!(session && session.token && Date.now() - session.ts < SESSION_TTL);
}

export function getUser() {
  const session = get(SESSION_KEY);
  return session ? session.username : 'Guest';
}

export function changePassword(oldPassword, newPassword) {
  const encoded = get(CREDS_KEY);
  if (!encoded) return false;
  const creds = decode(encoded);
  if (!creds || creds.password !== oldPassword) return false;
  creds.password = newPassword;
  set(CREDS_KEY, encode(creds));
  return true;
}

function showOverlay() {
  document.getElementById('auth-overlay')?.classList.remove('auth-overlay--hidden');
}

function hideOverlay() {
  document.getElementById('auth-overlay')?.classList.add('auth-overlay--hidden');
}
