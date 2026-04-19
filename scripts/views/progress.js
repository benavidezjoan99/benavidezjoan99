import { getAllProgress, getStudyStreak, getActivityLog } from '../services/progress-tracker.js';

const DOMAIN_COLORS = ['blue', 'green', 'yellow', 'purple', 'red'];
const DOMAINS = [
  '1.0 Networking Concepts',
  '2.0 Network Infrastructure',
  '3.0 Network Operations',
  '4.0 Network Security',
  '5.0 Network Troubleshooting'
];

export function render(container) {
  const progress = getAllProgress();
  const streak = getStudyStreak();
  const activityLog = getActivityLog();

  const chaptersRead = Object.keys(progress.chapters || {}).length;
  const labsDone = Object.keys(progress.labs || {}).length;
  const quizzesTaken = (progress.quizSessions || []).length;
  const examsDone = (progress.examSessions || []).length;

  const domainStats = computeDomainStats(progress.quizSessions || []);

  const quizHistoryHtml = [...(progress.quizSessions || [])].reverse().slice(0, 8).map(s => {
    const pct = Math.round((s.score / s.total) * 100);
    return `
      <div class="history-item">
        <span class="history-item__domain">${s.domain}</span>
        <span class="history-item__score ${pct >= 70 ? 'text-green' : 'text-red'}">${s.score}/${s.total} (${pct}%)</span>
        <span class="history-item__date">${s.date}</span>
      </div>
    `;
  }).join('') || '<div class="history-empty">No quiz sessions yet. Start practicing!</div>';

  const calendarHtml = renderCalendar(activityLog);

  container.innerHTML = `
    <div class="view-container">
      <div class="section-header">
        <h1>Progress</h1>
        <p>Track your learning journey across all domains</p>
      </div>

      <div class="progress-overview">
        <div class="progress-stat">
          <div class="progress-stat__num" style="color:var(--color-accent-blue)">${chaptersRead}</div>
          <div class="progress-stat__label">Chapters Read</div>
        </div>
        <div class="progress-stat">
          <div class="progress-stat__num" style="color:var(--color-accent-green)">${labsDone}</div>
          <div class="progress-stat__label">Labs Completed</div>
        </div>
        <div class="progress-stat">
          <div class="progress-stat__num" style="color:var(--color-accent-yellow)">${quizzesTaken}</div>
          <div class="progress-stat__label">Quizzes Taken</div>
        </div>
      </div>

      <div class="progress-domains">
        <div class="progress-domains__title">Domain Progress (by quiz accuracy)</div>
        ${DOMAINS.map((domain, i) => {
          const stats = domainStats[domain] || { correct: 0, total: 0 };
          const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
          const color = DOMAIN_COLORS[i];
          const fillColor = pct >= 70 ? `var(--color-accent-${color})` : 'var(--color-accent-red)';
          return `
            <div class="domain-row">
              <div class="domain-row__header">
                <span class="domain-row__name">${domain}</span>
                <span class="domain-row__pct" style="color:${fillColor}">${pct}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar__fill" style="width:${pct}%; background:${fillColor}"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="progress-bottom">
        <div class="streak-card">
          <div class="streak-card__title">Study Streak</div>
          <div class="streak-number">
            <span class="streak-number__value">${streak}</span>
            <span class="streak-number__unit">${streak === 1 ? 'day' : 'days'}</span>
          </div>
          <div class="text-xs text-muted">Keep it up! Study every day to maintain your streak.</div>
          <div class="streak-calendar">${calendarHtml}</div>
        </div>

        <div class="quiz-history">
          <div class="quiz-history__title">Recent Quiz History</div>
          ${quizHistoryHtml}
        </div>
      </div>

      ${examsDone > 0 ? `
        <div class="card mt-6">
          <div class="card__title">Exam Attempts</div>
          ${[...(progress.examSessions || [])].reverse().slice(0, 5).map(e => `
            <div class="history-item">
              <span class="history-item__domain">Practice Exam</span>
              <span class="history-item__score ${e.score / e.total >= 0.72 ? 'text-green' : 'text-red'}">
                ${e.score}/${e.total} · ${Math.round((e.score / e.total) * 900)}/900
              </span>
              <span class="history-item__date">${e.date}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function computeDomainStats(sessions) {
  const map = {};
  sessions.forEach(s => {
    if (!map[s.domain]) map[s.domain] = { correct: 0, total: 0 };
    map[s.domain].correct += s.score;
    map[s.domain].total += s.total;
  });
  return map;
}

function renderCalendar(activityLog) {
  const days = 28;
  const today = new Date();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const str = d.toISOString().slice(0, 10);
    const active = activityLog.includes(str);
    const isToday = i === 0;
    result.push(`<div class="streak-day ${active ? 'streak-day--active' : ''} ${isToday ? 'streak-day--today' : ''}" title="${str}"></div>`);
  }
  return result.join('');
}
