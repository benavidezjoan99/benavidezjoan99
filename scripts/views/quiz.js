import { loadQuizDomain, loadAllQuizDomains } from '../services/data-loader.js';
import * as quizEngine from '../services/quiz-engine.js';
import { recordQuizSession } from '../services/progress-tracker.js';
import { navigate } from '../router.js';

const DOMAINS = [
  { label: 'All Domains', value: 'all', file: null },
  { label: '1.0 Networking Concepts',      value: 'domain1', file: 'domain1-networking-concepts.json' },
  { label: '2.0 Network Infrastructure',   value: 'domain2', file: 'domain2-infrastructure.json' },
  { label: '3.0 Network Operations',       value: 'domain3', file: 'domain3-network-ops.json' },
  { label: '4.0 Network Security',         value: 'domain4', file: 'domain4-security.json' },
  { label: '5.0 Network Troubleshooting',  value: 'domain5', file: 'domain5-troubleshooting.json' }
];

let _selectedDomain = 'all';
let _selectedCount = 10;

export function render(container) {
  renderSetup(container);
}

function renderSetup(container) {
  const domainsHtml = DOMAINS.map(d => `
    <button class="quiz-domain-btn ${_selectedDomain === d.value ? 'quiz-domain-btn--selected' : ''}"
            data-domain="${d.value}">${d.label}</button>
  `).join('');

  container.innerHTML = `
    <div class="view-container">
      <div class="quiz-setup">
        <h1 class="quiz-setup__title">Practice Quiz</h1>
        <p class="quiz-setup__sub">Test your Network+ knowledge with targeted questions.</p>

        <div class="quiz-option-group">
          <div class="quiz-option-group__label">Select Domain</div>
          <div class="quiz-domain-grid">${domainsHtml}</div>
        </div>

        <div class="quiz-option-group">
          <div class="quiz-option-group__label">Number of Questions</div>
          <div class="quiz-count-row">
            ${[5, 10, 25, 50].map(n => `
              <button class="quiz-count-btn ${_selectedCount === n ? 'quiz-count-btn--selected' : ''}"
                      data-count="${n}">${n}</button>
            `).join('')}
          </div>
        </div>

        <button class="btn btn--primary btn--lg" id="start-quiz-btn" style="width:100%; margin-top:8px;">
          Start Quiz
        </button>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-domain]').forEach(btn => {
    btn.addEventListener('click', () => {
      _selectedDomain = btn.dataset.domain;
      container.querySelectorAll('[data-domain]').forEach(b =>
        b.classList.toggle('quiz-domain-btn--selected', b.dataset.domain === _selectedDomain));
    });
  });

  container.querySelectorAll('[data-count]').forEach(btn => {
    btn.addEventListener('click', () => {
      _selectedCount = parseInt(btn.dataset.count, 10);
      container.querySelectorAll('[data-count]').forEach(b =>
        b.classList.toggle('quiz-count-btn--selected', parseInt(b.dataset.count) === _selectedCount));
    });
  });

  container.querySelector('#start-quiz-btn')?.addEventListener('click', async () => {
    const btn = container.querySelector('#start-quiz-btn');
    btn.textContent = 'Loading...';
    btn.disabled = true;
    try {
      let questions;
      const domain = DOMAINS.find(d => d.value === _selectedDomain);
      if (_selectedDomain === 'all' || !domain?.file) {
        questions = await loadAllQuizDomains();
      } else {
        const data = await loadQuizDomain(domain.file);
        questions = data.questions || [];
      }
      if (!questions.length) {
        questions = getFallbackQuestions();
      }
      quizEngine.startSession(questions, _selectedCount);
      renderQuiz(container);
    } catch (err) {
      quizEngine.startSession(getFallbackQuestions(), _selectedCount);
      renderQuiz(container);
    }
  });
}

function renderQuiz(container) {
  const session = quizEngine.getSession();
  const q = quizEngine.getCurrentQuestion();
  if (!q || !session) { renderSetup(container); return; }

  const idx = session.currentIndex;
  const total = session.questions.length;
  const pct = Math.round((idx / total) * 100);
  const answered = session.submitted[idx];
  const selectedIdx = session.answers[idx];

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const optionsHtml = q.options.map((opt, i) => {
    let cls = 'quiz-option';
    if (answered) {
      if (i === q.correctIndex) cls += ' quiz-option--correct';
      else if (i === selectedIdx && i !== q.correctIndex) cls += ' quiz-option--incorrect';
    } else if (i === selectedIdx) {
      cls += ' quiz-option--selected';
    }
    return `
      <button class="${cls}" data-option="${i}" ${answered ? 'disabled' : ''}>
        <span class="quiz-option__letter">${letters[i]}</span>
        <span>${opt}</span>
      </button>
    `;
  }).join('');

  const explanationHtml = answered ? `
    <div class="quiz-explanation">
      <div class="quiz-explanation__label">
        ${selectedIdx === q.correctIndex ? '✓ Correct!' : '✕ Incorrect'}
      </div>
      <div class="quiz-explanation__text">${q.explanation}</div>
    </div>
  ` : '';

  container.innerHTML = `
    <div class="view-container">
      <div class="quiz-container">
        <div class="quiz-header">
          <span class="quiz-counter">Question ${idx + 1} of ${total}</span>
          <div class="quiz-progress">
            <div class="progress-bar">
              <div class="progress-bar__fill" style="width:${pct}%"></div>
            </div>
          </div>
          <span class="badge badge--blue">${q.domain || 'General'}</span>
        </div>

        <div class="quiz-question-card">
          <div class="quiz-question__text">${q.text}</div>
          <div class="quiz-options">${optionsHtml}</div>
        </div>

        ${explanationHtml}

        <div class="quiz-nav">
          <button class="btn btn--ghost" id="quiz-prev" ${idx === 0 ? 'disabled' : ''}>← Previous</button>
          <div style="display:flex; gap:8px;">
            ${answered ? `
              ${!quizEngine.isComplete()
                ? `<button class="btn btn--primary" id="quiz-next">Next →</button>`
                : `<button class="btn btn--success" id="quiz-finish">View Results</button>`}
            ` : `
              <span class="text-sm text-muted" style="align-self:center;">Select an answer</span>
            `}
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-option]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (session.submitted[idx]) return;
      quizEngine.submitAnswer(parseInt(btn.dataset.option, 10));
      renderQuiz(container);
    });
  });

  container.querySelector('#quiz-next')?.addEventListener('click', () => {
    quizEngine.nextQuestion();
    renderQuiz(container);
  });

  container.querySelector('#quiz-prev')?.addEventListener('click', () => {
    quizEngine.prevQuestion();
    renderQuiz(container);
  });

  container.querySelector('#quiz-finish')?.addEventListener('click', () => {
    const results = quizEngine.getSessionResults();
    recordQuizSession(_selectedDomain, results.score, results.total);
    renderResults(container, results);
  });
}

function renderResults(container, results) {
  const { score, total, percentage, domainBreakdown } = results;
  const pass = percentage >= 70;

  const breakdownHtml = Object.entries(domainBreakdown).map(([dom, data]) => {
    const pct = Math.round((data.correct / data.total) * 100);
    return `
      <div style="display:flex; justify-content:space-between; padding:8px 0;
                  border-bottom:1px solid var(--color-border-light); font-size:var(--font-size-sm);">
        <span class="text-muted">${dom}</span>
        <span class="fw-semibold ${pct >= 70 ? 'text-green' : 'text-red'}">${data.correct}/${data.total} (${pct}%)</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="view-container">
      <div class="quiz-result">
        <div class="quiz-result__score-ring">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="var(--color-bg-elevated)" stroke-width="10"/>
            <circle cx="70" cy="70" r="60" fill="none"
              stroke="${pass ? 'var(--color-accent-green)' : 'var(--color-accent-red)'}"
              stroke-width="10" stroke-linecap="round"
              stroke-dasharray="${2 * Math.PI * 60}"
              stroke-dashoffset="${2 * Math.PI * 60 * (1 - percentage / 100)}"
              transform="rotate(-90 70 70)"/>
          </svg>
          <div class="quiz-result__score-text">
            <span class="quiz-result__pct" style="color:${pass ? 'var(--color-accent-green)' : 'var(--color-accent-red)'}">
              ${percentage}%
            </span>
            <span class="quiz-result__label">${score}/${total}</span>
          </div>
        </div>

        <h2 class="quiz-result__title">${pass ? '🎉 Well Done!' : '📚 Keep Practicing'}</h2>
        <p class="quiz-result__sub">
          You scored ${score} out of ${total} questions correctly.
          ${pass ? 'Great work — aim for 80%+ on the real exam!' : 'Review the topics and try again.'}
        </p>

        ${Object.keys(domainBreakdown).length > 0 ? `
          <div class="quiz-result__breakdown">
            <h3>Domain Breakdown</h3>
            ${breakdownHtml}
          </div>
        ` : ''}

        <div class="quiz-result__actions">
          <button class="btn btn--primary" id="quiz-retry">Try Again</button>
          <button class="btn btn--secondary" id="quiz-review-theory">Review Theory</button>
          <button class="btn btn--ghost" id="quiz-home">Dashboard</button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#quiz-retry')?.addEventListener('click', () => {
    quizEngine.clearSession();
    renderSetup(container);
  });
  container.querySelector('#quiz-review-theory')?.addEventListener('click', () => navigate('#theory'));
  container.querySelector('#quiz-home')?.addEventListener('click', () => navigate('#home'));
}

function getFallbackQuestions() {
  return [
    {
      id: 'fb001', text: 'Which OSI layer is responsible for converting data into bits?',
      options: ['Data Link', 'Network', 'Physical', 'Transport'],
      correctIndex: 2, explanation: 'Layer 1 (Physical) handles bit transmission.',
      domain: '1.0 Networking Concepts', difficulty: 'easy'
    },
    {
      id: 'fb002', text: 'What does ARP resolve?',
      options: ['IP to hostname', 'IP to MAC', 'MAC to IP', 'Hostname to IP'],
      correctIndex: 1, explanation: 'ARP maps IPv4 addresses to MAC addresses.',
      domain: '1.0 Networking Concepts', difficulty: 'easy'
    },
    {
      id: 'fb003', text: 'What port does HTTPS use?',
      options: ['80', '443', '8080', '22'],
      correctIndex: 1, explanation: 'HTTPS runs on TCP port 443.',
      domain: '1.0 Networking Concepts', difficulty: 'easy'
    },
    {
      id: 'fb004', text: 'Which address range is used for APIPA?',
      options: ['10.0.0.0/8', '169.254.0.0/16', '172.16.0.0/12', '192.168.0.0/16'],
      correctIndex: 1, explanation: 'APIPA uses 169.254.0.0–169.254.255.255.',
      domain: '1.0 Networking Concepts', difficulty: 'easy'
    },
    {
      id: 'fb005', text: 'What is the purpose of a default gateway?',
      options: ['Assigns IP addresses', 'Routes traffic to other networks', 'Resolves DNS', 'Filters packets'],
      correctIndex: 1, explanation: 'The default gateway routes traffic beyond the local subnet.',
      domain: '1.0 Networking Concepts', difficulty: 'easy'
    }
  ];
}
