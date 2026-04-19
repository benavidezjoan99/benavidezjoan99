import * as auth from './auth.js';
import * as router from './router.js';
import { render as renderSidebar } from './components/sidebar.js';
import { render as renderTopbar } from './components/topbar.js';
import { render as renderPomodoro } from './components/pomodoro.js';
import { render as renderAIPanel } from './components/ai-panel.js';
import { get } from './services/storage.js';
import { setState } from './state.js';

function startApp() {
  const username = auth.getUser();

  renderSidebar(document.getElementById('sidebar'), username);
  renderTopbar(document.getElementById('topbar'));
  renderPomodoro(document.getElementById('pomodoro-widget'));
  renderAIPanel(document.getElementById('ai-panel'));

  const savedSettings = get('settings');
  if (savedSettings) {
    setState({ settings: savedSettings });
  }

  router.init();
}

function setupAuthForm() {
  const form = document.getElementById('auth-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('auth-username')?.value.trim();
    const password = document.getElementById('auth-password')?.value;
    const errorEl = document.getElementById('auth-error');

    if (!username || !password) {
      errorEl?.classList.add('auth-error--visible');
      if (errorEl) errorEl.textContent = 'Please enter both username and password.';
      return;
    }

    const success = auth.login(username, password);
    if (success) {
      errorEl?.classList.remove('auth-error--visible');
      startApp();
    } else {
      errorEl?.classList.add('auth-error--visible');
      if (errorEl) errorEl.textContent = 'Invalid username or password.';
      document.getElementById('auth-password').value = '';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupAuthForm();
  const authenticated = auth.init();
  if (authenticated) {
    startApp();
  }
});
