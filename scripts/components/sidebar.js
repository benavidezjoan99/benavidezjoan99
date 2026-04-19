import { logout } from '../auth.js';
import { navigate } from '../router.js';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { id: 'home',       label: 'Dashboard',    icon: '⊞', hash: '#home' },
      { id: 'study-plan', label: 'Study Plan',   icon: '📋', hash: '#study-plan' },
      { id: 'progress',   label: 'Progress',     icon: '📊', hash: '#progress' }
    ]
  },
  {
    label: 'Learn',
    items: [
      { id: 'theory',     label: 'Theory',       icon: '📖', hash: '#theory' },
      { id: 'labs',       label: 'Labs',         icon: '🖥', hash: '#labs' },
      { id: 'flashcards', label: 'Flashcards',   icon: '🗂', hash: '#flashcards' }
    ]
  },
  {
    label: 'Practice',
    items: [
      { id: 'quiz',       label: 'Quiz',         icon: '❓', hash: '#quiz' },
      { id: 'exam',       label: 'Exam Mode',    icon: '🎯', hash: '#exam' }
    ]
  },
  {
    label: 'Account',
    items: [
      { id: 'settings',   label: 'Settings',     icon: '⚙', hash: '#settings' }
    ]
  }
];

export function render(container, username) {
  const sectionsHtml = NAV_SECTIONS.map(section => `
    <div class="sidebar__section-label">${section.label}</div>
    ${section.items.map(item => `
      <a class="sidebar__nav-item" id="nav-${item.id}" href="${item.hash}"
         data-hash="${item.hash}" role="button">
        <span class="sidebar__nav-icon">${item.icon}</span>
        <span class="sidebar__nav-label">${item.label}</span>
      </a>
    `).join('')}
  `).join('');

  const initial = (username || 'A').charAt(0).toUpperCase();

  container.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar__logo">
        <div class="sidebar__logo-icon">🌐</div>
        <div class="sidebar__logo-text">
          <span class="sidebar__logo-name">NetAdmin Academy</span>
          <span class="sidebar__logo-tagline">N10-009 Platform</span>
        </div>
      </div>
      <nav class="sidebar__nav">${sectionsHtml}</nav>
      <div class="sidebar__footer">
        <div class="sidebar__user">
          <div class="sidebar__avatar">${initial}</div>
          <div class="sidebar__user-info">
            <div class="sidebar__username">${username || 'admin'}</div>
            <div class="sidebar__user-role">Administrator</div>
          </div>
          <button class="sidebar__logout-btn" id="sidebar-logout" title="Sign out">⏻</button>
        </div>
      </div>
    </aside>
  `;

  container.querySelectorAll('.sidebar__nav-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigate(el.dataset.hash);
    });
  });

  container.querySelector('#sidebar-logout')?.addEventListener('click', logout);
}

export function setActiveItem(hash) {
  const baseHash = '#' + hash.replace('#', '').split('/')[0];
  document.querySelectorAll('.sidebar__nav-item').forEach(el => {
    el.classList.toggle('sidebar__nav-item--active', el.dataset.hash === baseHash);
  });
}
