import { get, set } from '../services/storage.js';
import { show as showToast } from './toast.js';
import { getState } from '../state.js';

const CIRCUMFERENCE = 2 * Math.PI * 54; // radius 54

let _interval = null;
let _expanded = false;
let _state = {
  phase: 'work',
  secondsLeft: 25 * 60,
  isRunning: false,
  sessionsCompleted: get('pomodoro_sessions') || 0
};

function phaseLabel(phase) {
  return phase === 'work' ? 'Focus' : phase === 'short-break' ? 'Short Break' : 'Long Break';
}

function phaseTotal(phase) {
  const s = getState().settings;
  if (phase === 'work') return (s.pomodoroWork || 25) * 60;
  if (phase === 'short-break') return (s.pomodoroShortBreak || 5) * 60;
  return (s.pomodoroLongBreak || 15) * 60;
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function renderMini() {
  const dot = _state.isRunning ? 'pomodoro-mini__dot--running' : 'pomodoro-mini__dot--paused';
  return `
    <div class="pomodoro-mini" id="pomo-mini">
      <span class="pomodoro-mini__dot ${dot}"></span>
      <span class="pomodoro-mini__time">${formatTime(_state.secondsLeft)}</span>
      <span class="pomodoro-mini__phase">${phaseLabel(_state.phase)}</span>
    </div>
  `;
}

function renderSessionDots() {
  const max = 4;
  return Array.from({ length: max }, (_, i) =>
    `<div class="pomodoro-session-dot ${i < (_state.sessionsCompleted % (max + 1)) ? 'pomodoro-session-dot--done' : ''}"></div>`
  ).join('');
}

function renderExpanded() {
  const total = phaseTotal(_state.phase);
  const offset = CIRCUMFERENCE * (1 - _state.secondsLeft / total);
  const ringClass = _state.phase === 'work' ? 'pomodoro-ring-fill--work'
                  : _state.phase === 'short-break' ? 'pomodoro-ring-fill--break'
                  : 'pomodoro-ring-fill--lbreak';
  const isBreak = _state.phase !== 'work';
  const playBtnClass = isBreak ? 'pomodoro-btn--break' : '';

  return `
    <div class="pomodoro-mini" id="pomo-mini" style="cursor:default; pointer-events:none;">
      <span class="pomodoro-mini__dot ${_state.isRunning ? 'pomodoro-mini__dot--running' : 'pomodoro-mini__dot--paused'}"></span>
      <span class="pomodoro-mini__time">${formatTime(_state.secondsLeft)}</span>
      <span class="pomodoro-mini__phase">${phaseLabel(_state.phase)}</span>
      <button class="pomodoro-collapse-btn" id="pomo-collapse" style="margin-left:auto; pointer-events:all;">▲</button>
    </div>
    <div class="pomodoro-expanded">
      <div class="pomodoro-ring-container">
        <svg class="pomodoro-ring-svg" viewBox="0 0 120 120">
          <circle class="pomodoro-ring-bg" cx="60" cy="60" r="54"/>
          <circle class="${ringClass} pomodoro-ring-fill" cx="60" cy="60" r="54"
            stroke-dasharray="${CIRCUMFERENCE}"
            stroke-dashoffset="${offset}"/>
        </svg>
        <div class="pomodoro-time-display">
          <span class="pomodoro-time">${formatTime(_state.secondsLeft)}</span>
          <span class="pomodoro-phase-label">${phaseLabel(_state.phase)}</span>
        </div>
      </div>
      <div class="pomodoro-controls">
        <button class="pomodoro-btn" id="pomo-reset" title="Reset">↺</button>
        <button class="pomodoro-btn pomodoro-btn--play ${playBtnClass}" id="pomo-play">
          ${_state.isRunning ? '⏸' : '▶'}
        </button>
        <button class="pomodoro-btn" id="pomo-skip" title="Skip phase">⏭</button>
      </div>
      <div class="pomodoro-sessions">
        <span>Session ${_state.sessionsCompleted}</span>
        <div class="pomodoro-session-dots">${renderSessionDots()}</div>
      </div>
    </div>
  `;
}

function update() {
  const widget = document.getElementById('pomodoro-widget');
  if (!widget) return;
  if (_expanded) {
    widget.innerHTML = renderExpanded();
    widget.querySelector('#pomo-collapse')?.addEventListener('click', () => {
      _expanded = false; update();
    });
    widget.querySelector('#pomo-play')?.addEventListener('click', togglePlay);
    widget.querySelector('#pomo-reset')?.addEventListener('click', reset);
    widget.querySelector('#pomo-skip')?.addEventListener('click', skipPhase);
  } else {
    widget.innerHTML = renderMini();
    widget.querySelector('#pomo-mini')?.addEventListener('click', () => {
      _expanded = true; update();
    });
  }
}

function togglePlay() {
  _state.isRunning = !_state.isRunning;
  if (_state.isRunning) {
    _interval = setInterval(tick, 1000);
  } else {
    clearInterval(_interval);
    _interval = null;
  }
  update();
}

function tick() {
  if (_state.secondsLeft > 0) {
    _state.secondsLeft--;
    if (_expanded) update();
    else {
      const timeEl = document.querySelector('.pomodoro-mini__time');
      if (timeEl) timeEl.textContent = formatTime(_state.secondsLeft);
    }
  } else {
    clearInterval(_interval);
    _interval = null;
    _state.isRunning = false;
    onPhaseComplete();
  }
}

function onPhaseComplete() {
  if (_state.phase === 'work') {
    _state.sessionsCompleted++;
    set('pomodoro_sessions', _state.sessionsCompleted);
    showToast('Focus session complete! Take a break.', 'success', 5000);
    _state.phase = _state.sessionsCompleted % 4 === 0 ? 'long-break' : 'short-break';
  } else {
    showToast('Break over! Time to focus.', 'info', 4000);
    _state.phase = 'work';
  }
  _state.secondsLeft = phaseTotal(_state.phase);
  update();
}

function reset() {
  clearInterval(_interval);
  _interval = null;
  _state.isRunning = false;
  _state.secondsLeft = phaseTotal(_state.phase);
  update();
}

function skipPhase() {
  clearInterval(_interval);
  _interval = null;
  _state.isRunning = false;
  _state.phase = _state.phase === 'work'
    ? (_state.sessionsCompleted % 4 === 3 ? 'long-break' : 'short-break')
    : 'work';
  _state.secondsLeft = phaseTotal(_state.phase);
  update();
}

export function render(container) {
  update();
}

export function resetDurations() {
  if (!_state.isRunning) {
    _state.secondsLeft = phaseTotal(_state.phase);
    update();
  }
}
