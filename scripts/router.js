import { render as renderHome }        from './views/home.js';
import { render as renderStudyPlan }   from './views/study-plan.js';
import { render as renderTheory }      from './views/theory.js';
import { render as renderLabs }        from './views/labs.js';
import { render as renderQuiz }        from './views/quiz.js';
import { render as renderExam }        from './views/exam.js';
import { render as renderFlashcards }  from './views/flashcards.js';
import { render as renderProgress }    from './views/progress.js';
import { render as renderSettings }    from './views/settings.js';
import { setActiveItem }               from './components/sidebar.js';
import { setBreadcrumb }               from './components/topbar.js';
import { setState }                    from './state.js';
import { isAuthenticated }             from './auth.js';

const ROUTES = {
  '#home':        renderHome,
  '#study-plan':  renderStudyPlan,
  '#theory':      renderTheory,
  '#labs':        renderLabs,
  '#quiz':        renderQuiz,
  '#exam':        renderExam,
  '#flashcards':  renderFlashcards,
  '#progress':    renderProgress,
  '#settings':    renderSettings
};

export function init() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

export function navigate(hash) {
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  } else {
    handleRoute();
  }
}

export function getCurrentRoute() {
  return window.location.hash || '#home';
}

function handleRoute() {
  if (!isAuthenticated()) return;

  const fullHash = window.location.hash || '#home';
  const parts = fullHash.replace('#', '').split('/');
  const baseHash = '#' + parts[0];
  const params = parts.length > 1 ? { id: parts.slice(1).join('/') } : {};

  const handler = ROUTES[baseHash];
  const container = document.getElementById('main-content');

  if (!container) return;

  if (handler) {
    cleanupView(container);
    container.innerHTML = '';
    handler(container, params);
    setActiveItem(fullHash);
    setBreadcrumb(fullHash);
    setState({ currentRoute: fullHash });
    container.scrollTop = 0;
  } else {
    navigate('#home');
  }
}

function cleanupView(container) {
  if (typeof container._cleanupFlashcards === 'function') {
    container._cleanupFlashcards();
    container._cleanupFlashcards = null;
  }
}
