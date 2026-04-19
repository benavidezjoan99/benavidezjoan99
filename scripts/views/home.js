import { navigate } from '../router.js';
import { getAllProgress, getStudyStreak } from '../services/progress-tracker.js';
import { getUser } from '../auth.js';

export function render(container) {
  const username = getUser();
  const progress = getAllProgress();
  const streak = getStudyStreak();

  const chaptersRead = Object.keys(progress.chapters || {}).length;
  const labsDone = Object.keys(progress.labs || {}).length;
  const quizzesTaken = (progress.quizSessions || []).length;
  const examsDone = (progress.examSessions || []).length;

  const lastExam = progress.examSessions?.slice(-1)[0];
  const examReady = lastExam
    ? `${Math.round((lastExam.score / lastExam.total) * 100)}%`
    : '—';

  const recentActivity = buildActivityFeed(progress);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  container.innerHTML = `
    <div class="view-container">
      <div class="welcome-banner">
        <h1 class="welcome-banner__title">${greeting}, ${username}! 👋</h1>
        <p class="welcome-banner__sub">
          Continue your CompTIA Network+ (N10-009) journey. You're making great progress.
        </p>
        <div class="welcome-banner__actions">
          <button class="btn btn--primary" data-nav="#quiz">Start Quick Quiz</button>
          <button class="btn btn--secondary" data-nav="#theory">Review Theory</button>
          <button class="btn btn--secondary" data-nav="#exam">Exam Mode</button>
        </div>
      </div>

      <div class="stat-cards-grid">
        <div class="stat-card stat-card--blue">
          <div class="stat-card__label">Chapters Read</div>
          <div class="stat-card__value">${chaptersRead}</div>
          <div class="stat-card__delta">of total chapters</div>
        </div>
        <div class="stat-card stat-card--green">
          <div class="stat-card__label">Study Streak</div>
          <div class="stat-card__value">${streak}</div>
          <div class="stat-card__delta">${streak === 1 ? 'day' : 'days'} in a row</div>
        </div>
        <div class="stat-card stat-card--yellow">
          <div class="stat-card__label">Quizzes Taken</div>
          <div class="stat-card__value">${quizzesTaken}</div>
          <div class="stat-card__delta">practice sessions</div>
        </div>
        <div class="stat-card stat-card--purple">
          <div class="stat-card__label">Exam Attempts</div>
          <div class="stat-card__value">${examsDone}</div>
          <div class="stat-card__delta">latest: ${examReady}</div>
        </div>
      </div>

      <div class="dashboard-bottom">
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="quick-action-grid">
            <button class="quick-action-btn" data-nav="#quiz">
              <div class="quick-action-btn__icon quick-action-btn__icon--blue">❓</div>
              <div>
                <div class="quick-action-btn__label">Start Quiz</div>
                <div class="quick-action-btn__sub">Test your knowledge</div>
              </div>
            </button>
            <button class="quick-action-btn" data-nav="#labs">
              <div class="quick-action-btn__icon quick-action-btn__icon--green">🖥</div>
              <div>
                <div class="quick-action-btn__label">Open Labs</div>
                <div class="quick-action-btn__sub">Hands-on practice</div>
              </div>
            </button>
            <button class="quick-action-btn" data-nav="#flashcards">
              <div class="quick-action-btn__icon quick-action-btn__icon--yellow">🗂</div>
              <div>
                <div class="quick-action-btn__label">Flashcards</div>
                <div class="quick-action-btn__sub">Review key terms</div>
              </div>
            </button>
            <button class="quick-action-btn" data-nav="#exam">
              <div class="quick-action-btn__icon quick-action-btn__icon--purple">🎯</div>
              <div>
                <div class="quick-action-btn__label">Exam Mode</div>
                <div class="quick-action-btn__sub">Full practice exam</div>
              </div>
            </button>
          </div>
        </div>

        <div class="activity-feed card">
          <h2>Recent Activity</h2>
          <div class="activity-feed__list">
            ${recentActivity}
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });
}

function buildActivityFeed(progress) {
  const events = [];

  Object.entries(progress.chapters || {}).forEach(([id, data]) => {
    events.push({ type: 'chapter', text: `Read chapter: ${id}`, time: data.readAt, color: 'blue' });
  });

  Object.entries(progress.labs || {}).forEach(([id, data]) => {
    events.push({ type: 'lab', text: `Completed lab: ${id} (${data.score}%)`, time: data.completedAt, color: 'green' });
  });

  (progress.quizSessions || []).forEach(s => {
    events.push({ type: 'quiz', text: `Quiz: ${s.score}/${s.total} — ${s.domain}`, time: s.date, color: 'yellow' });
  });

  events.sort((a, b) => new Date(b.time) - new Date(a.time));

  if (!events.length) {
    return '<p class="activity-empty">No recent activity. Start studying to track progress!</p>';
  }

  return events.slice(0, 6).map(e => `
    <div class="activity-item">
      <div class="activity-item__dot activity-item__dot--${e.color}"></div>
      <div>
        <div class="activity-item__text">${e.text}</div>
        <div class="activity-item__time">${formatRelativeTime(e.time)}</div>
      </div>
    </div>
  `).join('');
}

function formatRelativeTime(isoStr) {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
