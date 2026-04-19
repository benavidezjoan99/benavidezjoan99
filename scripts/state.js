const _state = {
  user: { username: '', loggedIn: false },
  currentRoute: '#home',
  theoryProgress: { lastChapterId: null, activeTab: 'simple' },
  quizSession: null,
  examSession: null,
  flashcardSession: { deckId: null, currentIndex: 0, isFlipped: false },
  pomodoroState: { phase: 'work', secondsLeft: 25 * 60, isRunning: false, sessionsCompleted: 0 },
  settings: { pomodoroWork: 25, pomodoroShortBreak: 5, pomodoroLongBreak: 15 }
};

const _subscribers = {};

export function getState() {
  return { ..._state };
}

export function setState(patch) {
  Object.assign(_state, patch);
  Object.keys(patch).forEach(key => {
    if (_subscribers[key]) {
      _subscribers[key].forEach(cb => cb(_state[key]));
    }
  });
}

export function subscribe(key, callback) {
  if (!_subscribers[key]) _subscribers[key] = [];
  _subscribers[key].push(callback);
  return () => {
    _subscribers[key] = _subscribers[key].filter(cb => cb !== callback);
  };
}
