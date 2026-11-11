import { loadAllQuizDomains } from '../services/data-loader.js';
import * as examEngine from '../services/exam-engine.js';
import { recordExamSession } from '../services/progress-tracker.js';
import { navigate } from '../router.js';

let _timerInterval = null;

export function render(container) {
  stopTimer();
  renderSetup(container);
}

function renderSetup(container) {
  container.innerHTML = `
    <div class="view-container">
      <div class="exam-setup">
        <div class="exam-setup__icon">🎯</div>
        <h1 class="exam-setup__title">Exam Mode</h1>
        <p class="exam-setup__sub">
          Simulate the real CompTIA Network+ exam experience.<br>
          90 questions · 90 minutes · Covers all 5 domains
        </p>
        <div class="exam-setup__details">
          ${[
            ['Questions', '90 (from all domains)'],
            ['Time Limit', '90 minutes'],
            ['Passing Score', '720 / 900'],
            ['Question Types', 'Multiple choice'],
            ['Navigation', 'Move freely between questions']
          ].map(([label, value]) => `
            <div class="exam-detail-row">
              <span class="exam-detail-row__label">${label}</span>
              <span class="exam-detail-row__value">${value}</span>
            </div>
          `).join('')}
        </div>
        <button class="btn btn--primary btn--lg" id="start-exam-btn" style="width:100%">
          Start Exam
        </button>
      </div>
    </div>
  `;

  container.querySelector('#start-exam-btn')?.addEventListener('click', async () => {
    const btn = container.querySelector('#start-exam-btn');
    btn.textContent = 'Loading questions...';
    btn.disabled = true;
    try {
      let questions = await loadAllQuizDomains();
      if (questions.length < 10) questions = getFallbackQuestions(90);
      examEngine.startSession(questions);
      renderExam(container);
    } catch {
      const questions = getFallbackQuestions(90);
      examEngine.startSession(questions);
      renderExam(container);
    }
  });
}

function renderExam(container) {
  const session = examEngine.getSession();
  if (!session) { renderSetup(container); return; }
  buildExamUI(container, session);
  startTimer(container, session);
}

function buildExamUI(container, session) {
  const q = session.questions[session.currentIndex];
  const timeLeft = examEngine.getTimeLeft();
  const answered = session.answers.filter(a => a !== null).length;
  const flagged = session.flags.filter(Boolean).length;
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const qNavHtml = session.questions.map((_, i) => {
    let cls = 'exam-q-btn';
    if (session.flags[i]) cls += ' exam-q-btn--flagged';
    else if (session.answers[i] !== null) cls += ' exam-q-btn--answered';
    if (i === session.currentIndex) cls += ' exam-q-btn--current';
    return `<button class="${cls}" data-qi="${i}">${i + 1}</button>`;
  }).join('');

  container.innerHTML = `
    <div class="view-container" style="max-width:1100px">
      <div class="exam-layout">
        <div class="exam-main">
          <div class="exam-header">
            <div class="exam-timer ${getTimerClass(timeLeft)}" id="exam-timer">${formatTime(timeLeft)}</div>
            <div class="exam-progress-info">
              <span>${answered} answered</span>
              <span>·</span>
              <span>${flagged} flagged</span>
              <span>·</span>
              <span>${session.questions.length - answered} remaining</span>
            </div>
          </div>

          <div class="exam-question-card">
            <div class="exam-question__num">QUESTION ${session.currentIndex + 1} OF ${session.questions.length}</div>
            <div class="exam-question__text">${q.text}</div>
            <div class="exam-options">
              ${q.options.map((opt, i) => {
                let cls = 'exam-option';
                if (session.answers[session.currentIndex] === i) cls += ' exam-option--selected';
                return `
                  <button class="${cls}" data-option="${i}">
                    <span class="exam-option__letter">${letters[i]}</span>
                    <span>${opt}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div class="exam-nav">
            <button class="btn btn--secondary" id="exam-prev" ${session.currentIndex === 0 ? 'disabled' : ''}>← Prev</button>
            <div style="display:flex; gap:8px; align-items:center;">
              <button class="exam-flag-btn ${session.flags[session.currentIndex] ? 'exam-flag-btn--flagged' : ''}" id="exam-flag">
                🚩 ${session.flags[session.currentIndex] ? 'Flagged' : 'Flag'}
              </button>
              <button class="btn btn--danger" id="exam-submit">Submit Exam</button>
            </div>
            <button class="btn btn--secondary" id="exam-next"
              ${session.currentIndex === session.questions.length - 1 ? 'disabled' : ''}>Next →</button>
          </div>
        </div>

        <div class="exam-sidebar">
          <div class="exam-question-nav">
            <div class="exam-question-nav__title">Questions</div>
            <div class="exam-q-grid">${qNavHtml}</div>
          </div>
          <div class="exam-legend">
            <div class="exam-legend-item">
              <div class="exam-legend-dot exam-legend-dot--unanswered"></div><span>Unanswered</span>
            </div>
            <div class="exam-legend-item">
              <div class="exam-legend-dot exam-legend-dot--answered"></div><span>Answered</span>
            </div>
            <div class="exam-legend-item">
              <div class="exam-legend-dot exam-legend-dot--flagged"></div><span>Flagged</span>
            </div>
          </div>
          <button class="btn btn--secondary" style="width:100%" id="exam-submit-2">Submit Exam</button>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-option]').forEach(btn => {
    btn.addEventListener('click', () => {
      examEngine.submitAnswer(session.currentIndex, parseInt(btn.dataset.option, 10));
      buildExamUI(container, session);
    });
  });

  container.querySelectorAll('[data-qi]').forEach(btn => {
    btn.addEventListener('click', () => {
      examEngine.goToQuestion(parseInt(btn.dataset.qi, 10));
      buildExamUI(container, session);
    });
  });

  container.querySelector('#exam-prev')?.addEventListener('click', () => {
    examEngine.goToQuestion(session.currentIndex - 1);
    buildExamUI(container, session);
  });

  container.querySelector('#exam-next')?.addEventListener('click', () => {
    examEngine.goToQuestion(session.currentIndex + 1);
    buildExamUI(container, session);
  });

  container.querySelector('#exam-flag')?.addEventListener('click', () => {
    examEngine.toggleFlag(session.currentIndex);
    buildExamUI(container, session);
  });

  const submitHandler = () => {
    if (!confirm('Submit exam? You cannot return to the questions after submitting.')) return;
    stopTimer();
    const results = examEngine.calculateResults();
    recordExamSession(results.correct, results.total, results.domainBreakdown);
    renderResults(container, results);
  };

  container.querySelector('#exam-submit')?.addEventListener('click', submitHandler);
  container.querySelector('#exam-submit-2')?.addEventListener('click', submitHandler);
}

function startTimer(container, session) {
  stopTimer();
  _timerInterval = setInterval(() => {
    const left = examEngine.tick();
    const el = document.getElementById('exam-timer');
    if (el) {
      el.textContent = formatTime(left);
      el.className = `exam-timer ${getTimerClass(left)}`;
    }
    if (examEngine.isTimeUp()) {
      stopTimer();
      const results = examEngine.calculateResults();
      recordExamSession(results.correct, results.total, results.domainBreakdown);
      renderResults(container, results);
    }
  }, 1000);
}

function stopTimer() {
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
}

function getTimerClass(seconds) {
  if (seconds <= 300) return 'exam-timer--danger';
  if (seconds <= 600) return 'exam-timer--warning';
  return '';
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function renderResults(container, results) {
  const { correct, total, scaledScore, passed, domainBreakdown } = results;
  const breakdownHtml = Object.entries(domainBreakdown).map(([dom, data]) => {
    const pct = Math.round((data.correct / data.total) * 100);
    return `
      <div class="exam-breakdown-row">
        <div class="exam-breakdown-row__domain">${dom}</div>
        <div class="exam-breakdown-row__bar">
          <div class="progress-bar">
            <div class="progress-bar__fill ${pct >= 70 ? '' : 'progress-bar__fill--red'}" style="width:${pct}%"></div>
          </div>
        </div>
        <div class="exam-breakdown-row__pct ${pct >= 70 ? 'text-green' : 'text-red'}">${pct}%</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="view-container">
      <div class="exam-result">
        <div class="exam-result__hero">
          <div class="exam-result__score ${passed ? 'exam-result__score--pass' : 'exam-result__score--fail'}">
            ${scaledScore} / 900
          </div>
          <div class="exam-result__verdict">${passed ? '🎉 PASS' : '📚 NOT PASS'}</div>
          <div class="exam-result__sub">
            ${correct}/${total} correct · Passing score: 720/900
            ${passed ? '· Congratulations!' : '· Keep studying and try again!'}
          </div>
        </div>

        <div class="exam-result__breakdown">
          <div class="exam-result__breakdown-title">Domain Breakdown</div>
          ${breakdownHtml}
        </div>

        <div class="exam-result__actions">
          <button class="btn btn--primary" id="exam-retry">Retake Exam</button>
          <button class="btn btn--secondary" id="exam-to-quiz">Practice Quiz</button>
          <button class="btn btn--ghost" id="exam-home">Dashboard</button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#exam-retry')?.addEventListener('click', () => {
    examEngine.clearSession();
    renderSetup(container);
  });
  container.querySelector('#exam-to-quiz')?.addEventListener('click', () => navigate('#quiz'));
  container.querySelector('#exam-home')?.addEventListener('click', () => navigate('#home'));
}

function getFallbackQuestions(count) {
  const base = [
    { text: 'Which OSI layer handles bit transmission?', options: ['Data Link','Network','Physical','Transport'], correctIndex: 2, explanation: 'Layer 1 Physical.', domain: '1.0 Networking Concepts', difficulty: 'easy' },
    { text: 'What does ARP resolve?', options: ['IP to hostname','IP to MAC','MAC to IP','Hostname to IP'], correctIndex: 1, explanation: 'ARP maps IP to MAC.', domain: '1.0 Networking Concepts', difficulty: 'easy' },
    { text: 'HTTPS runs on which port?', options: ['80','443','8080','22'], correctIndex: 1, explanation: 'Port 443.', domain: '1.0 Networking Concepts', difficulty: 'easy' },
    { text: 'APIPA uses which range?', options: ['10.0.0.0/8','169.254.0.0/16','172.16.0.0/12','192.168.0.0/16'], correctIndex: 1, explanation: '169.254.0.0/16.', domain: '1.0 Networking Concepts', difficulty: 'easy' },
    { text: 'Default gateway purpose?', options: ['Assign IP','Route to other networks','Resolve DNS','Filter packets'], correctIndex: 1, explanation: 'Routes beyond local subnet.', domain: '1.0 Networking Concepts', difficulty: 'easy' }
  ];
  const result = [];
  while (result.length < count) {
    base.forEach(q => {
      if (result.length < count) result.push({ ...q, id: `fb_${result.length}` });
    });
  }
  return result;
}
