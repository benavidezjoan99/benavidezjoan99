let _session = null;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function startSession(questions, count) {
  const pool = shuffle(questions).slice(0, Math.min(count, questions.length));
  _session = {
    questions: pool,
    currentIndex: 0,
    answers: new Array(pool.length).fill(null),
    submitted: new Array(pool.length).fill(false)
  };
  return _session;
}

export function getSession() {
  return _session;
}

export function getCurrentQuestion() {
  if (!_session) return null;
  return _session.questions[_session.currentIndex] || null;
}

export function submitAnswer(optionIndex) {
  if (!_session) return null;
  const q = _session.questions[_session.currentIndex];
  _session.answers[_session.currentIndex] = optionIndex;
  _session.submitted[_session.currentIndex] = true;
  return optionIndex === q.correctIndex;
}

export function nextQuestion() {
  if (!_session) return false;
  if (_session.currentIndex < _session.questions.length - 1) {
    _session.currentIndex++;
    return true;
  }
  return false;
}

export function prevQuestion() {
  if (!_session || _session.currentIndex === 0) return false;
  _session.currentIndex--;
  return true;
}

export function isComplete() {
  if (!_session) return false;
  return _session.currentIndex >= _session.questions.length - 1
      && _session.submitted[_session.currentIndex];
}

export function getSessionResults() {
  if (!_session) return null;
  const { questions, answers } = _session;
  let correct = 0;
  const missed = [];
  const domainMap = {};

  questions.forEach((q, i) => {
    const isCorrect = answers[i] === q.correctIndex;
    if (isCorrect) {
      correct++;
    } else {
      missed.push({ question: q, selectedIndex: answers[i] });
    }
    const dom = q.domain || 'Unknown';
    if (!domainMap[dom]) domainMap[dom] = { correct: 0, total: 0 };
    domainMap[dom].total++;
    if (isCorrect) domainMap[dom].correct++;
  });

  return {
    score: correct,
    total: questions.length,
    percentage: Math.round((correct / questions.length) * 100),
    missed,
    domainBreakdown: domainMap
  };
}

export function clearSession() {
  _session = null;
}
