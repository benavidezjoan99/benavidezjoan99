import { setState } from '../state.js';

let _open = false;
let _activeTab = 0;

const TABS = [
  { label: 'Concept Tutor', placeholder: 'Ask about any networking concept...' },
  { label: 'Quiz Helper', placeholder: 'Stuck on a question? Describe it...' },
  { label: 'Troubleshooter', placeholder: 'Describe your network issue...' }
];

const GREETINGS = [
  'Hello! I can help explain any networking concept from the N10-009 exam. What would you like to learn?',
  'Need help with a quiz question? Describe what you\'re seeing and I\'ll guide you through it.',
  'Tell me about the network problem you\'re troubleshooting and I\'ll help you think through it systematically.'
];

const BOT_RESPONSE = 'This AI assistant connects to a backend when configured. In a future update, I\'ll be able to provide real-time explanations, hints, and guided troubleshooting powered by an AI model.';

function buildChat(tabIndex) {
  return `
    <div class="ai-chat" id="ai-chat-${tabIndex}">
      <div class="ai-bubble ai-bubble--bot">
        <div class="ai-bubble__name">NetAdmin AI</div>
        ${GREETINGS[tabIndex]}
      </div>
    </div>
    <div class="ai-status">⚠ AI backend not configured — UI preview mode</div>
    <div class="ai-input-row">
      <textarea class="ai-input" id="ai-input-${tabIndex}"
        placeholder="${TABS[tabIndex].placeholder}" rows="1"></textarea>
      <button class="ai-send-btn" id="ai-send-${tabIndex}">➤</button>
    </div>
  `;
}

function buildPanel() {
  const tabsHtml = TABS.map((t, i) =>
    `<button class="ai-tab ${i === _activeTab ? 'ai-tab--active' : ''}" data-tab="${i}">${t.label}</button>`
  ).join('');

  return `
    <div class="ai-panel ${_open ? 'ai-panel--open' : ''}" id="ai-panel-inner">
      <div class="ai-panel__header">
        <div class="ai-panel__title">
          <div class="ai-panel__title-icon">🤖</div>
          AI Assistant
        </div>
        <button class="ai-panel__close" id="ai-close">✕</button>
      </div>
      <div class="ai-panel__tabs" id="ai-tabs">${tabsHtml}</div>
      <div class="ai-panel__content">${buildChat(_activeTab)}</div>
    </div>
  `;
}

function addMessage(chatEl, text, role) {
  const bubble = document.createElement('div');
  bubble.className = `ai-bubble ai-bubble--${role}`;

  const name = document.createElement('div');
  name.className = 'ai-bubble__name';
  name.textContent = role === 'user' ? 'You' : 'NetAdmin AI';

  bubble.appendChild(name);
  bubble.appendChild(document.createTextNode(text));
  chatEl.appendChild(bubble);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function attachEvents(container) {
  container.querySelector('#ai-close')?.addEventListener('click', close);

  container.querySelector('#ai-tabs')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    _activeTab = parseInt(btn.dataset.tab, 10);
    render(container);
  });

  const sendBtn = container.querySelector(`#ai-send-${_activeTab}`);
  const inputEl = container.querySelector(`#ai-input-${_activeTab}`);

  function send() {
    const text = inputEl?.value.trim();
    if (!text) return;
    const chat = container.querySelector(`#ai-chat-${_activeTab}`);
    addMessage(chat, text, 'user');
    inputEl.value = '';
    setTimeout(() => addMessage(chat, BOT_RESPONSE, 'bot'), 600);
  }

  sendBtn?.addEventListener('click', send);
  inputEl?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
}

export function render(container) {
  container.innerHTML = buildPanel();
  attachEvents(container);
}

export function toggle() {
  _open = !_open;
  const panel = document.getElementById('ai-panel-inner');
  if (panel) {
    panel.classList.toggle('ai-panel--open', _open);
  }
  setState({ aiPanelOpen: _open });

  const btn = document.getElementById('topbar-ai-btn');
  if (btn) btn.classList.toggle('topbar__icon-btn--active', _open);
}

export function open() {
  _open = true;
  document.getElementById('ai-panel-inner')?.classList.add('ai-panel--open');
}

export function close() {
  _open = false;
  const panel = document.getElementById('ai-panel-inner');
  if (panel) panel.classList.remove('ai-panel--open');
  const btn = document.getElementById('topbar-ai-btn');
  if (btn) btn.classList.remove('topbar__icon-btn--active');
}
