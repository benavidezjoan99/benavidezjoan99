const EXAM_DURATION = 90 * 60; // 90 minutes in seconds
const PASSING_SCALED = 720;
const MAX_SCALED = 900;

let _session = null;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function startSession(questions) {
  const pool = shuffle(questions).slice(0, Math.min(90, questions.length));
  _session = {
    questions: pool,
    currentIndex: 0,
    answers: new Array(pool.length).fill(null),
    flags: new Array(pool.length).fill(false),
    secondsLeft: EXAM_DURATION,
    started: true,
    finished: false
  };
  return _session;
}

export function getSession() {
  return _session;
}

export function tick() {
  if (!_session || !_session.started || _session.finished) return _session?.secondsLeft ?? 0;
  if (_session.secondsLeft > 0) {
    _session.secondsLeft--;
  }
  return _session.secondsLeft;
}

export function isTimeUp() {
  return _session ? _session.secondsLeft <= 0 : false;
}

export function getTimeLeft() {
  return _session ? _session.secondsLeft : 0;
}

export function goToQuestion(index) {
  if (!_session) return;
  _session.currentIndex = Math.max(0, Math.min(index, _session.questions.length - 1));
}

export function submitAnswer(index, optionIndex) {
  if (!_session) return;
  _session.answers[index] = optionIndex;
}

export function toggleFlag(index) {
  if (!_session) return;
  _session.flags[index] = !_session.flags[index];
}

export function calculateResults() {
  if (!_session) return null;
  const { questions, answers } = _session;
  _session.finished = true;

  let correct = 0;
  const domainMap = {};

  questions.forEach((q, i) => {
    const isCorrect = answers[i] === q.correctIndex;
    if (isCorrect) correct++;
    const dom = q.domain || 'Unknown';
    if (!domainMap[dom]) domainMap[dom] = { correct: 0, total: 0 };
    domainMap[dom].total++;
    if (isCorrect) domainMap[dom].correct++;
  });

  const rawPct = correct / questions.length;
  const scaledScore = Math.round(rawPct * MAX_SCALED);
  const passed = scaledScore >= PASSING_SCALED;

  return {
    correct,
    total: questions.length,
    scaledScore,
    passed,
    passingScore: PASSING_SCALED,
    domainBreakdown: domainMap
  };
}

export function clearSession() {
  _session = null;
}
