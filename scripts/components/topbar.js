import { toggle as toggleAI } from './ai-panel.js';
import { getUser } from '../auth.js';

const ROUTE_LABELS = {
  '#home':        'Dashboard',
  '#study-plan':  'Study Plan',
  '#theory':      'Theory',
  '#labs':        'Labs',
  '#quiz':        'Quiz',
  '#exam':        'Exam Mode',
  '#flashcards':  'Flashcards',
  '#progress':    'Progress',
  '#settings':    'Settings'
};

export function render(container) {
  const username = getUser();
  const initial = username.charAt(0).toUpperCase();

  container.innerHTML = `
    <header class="topbar">
      <div class="topbar__breadcrumb">
        <span class="topbar__breadcrumb-home">NetAdmin Academy</span>
        <span class="topbar__breadcrumb-sep">›</span>
        <span class="topbar__breadcrumb-current" id="topbar-breadcrumb">Dashboard</span>
      </div>
      <div class="topbar__actions">
        <button class="topbar__icon-btn" id="topbar-ai-btn" title="AI Assistant">🤖</button>
        <div class="topbar__user">
          <div class="topbar__user-avatar">${initial}</div>
          <span class="topbar__username">${username}</span>
        </div>
      </div>
    </header>
  `;

  container.querySelector('#topbar-ai-btn')?.addEventListener('click', toggleAI);
}

export function setBreadcrumb(hash) {
  const el = document.getElementById('topbar-breadcrumb');
  if (el) {
    const base = '#' + hash.replace('#', '').split('/')[0];
    el.textContent = ROUTE_LABELS[base] || 'NetAdmin Academy';
  }
}
