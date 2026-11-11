import { navigate } from '../router.js';
import { getChapterProgress, getQuizSessions } from '../services/progress-tracker.js';

const PHASES = [
  {
    id: 'domain1', num: 1, label: '1.0 Networking Concepts', hours: 12,
    color: 'blue', icon: '🌐',
    topics: ['OSI Model', 'TCP/IP Model', 'IP Addressing & Subnetting', 'Ports & Protocols', 'Network Topologies'],
    chapters: ['ch01-osi-model', 'ch02-tcp-ip'],
    quizNav: '#quiz'
  },
  {
    id: 'domain2', num: 2, label: '2.0 Network Infrastructure', hours: 14,
    color: 'green', icon: '🖧',
    topics: ['Routing & Switching', 'VLANs', 'Wireless Standards', 'WAN Technologies', 'Network Devices'],
    chapters: [],
    quizNav: '#quiz'
  },
  {
    id: 'domain3', num: 3, label: '3.0 Network Operations', hours: 10,
    color: 'yellow', icon: '⚙',
    topics: ['Documentation', 'Monitoring Tools', 'Network Policies', 'High Availability', 'Disaster Recovery'],
    chapters: [],
    quizNav: '#quiz'
  },
  {
    id: 'domain4', num: 4, label: '4.0 Network Security', hours: 12,
    color: 'purple', icon: '🔒',
    topics: ['Security Concepts', 'Authentication', 'Access Control', 'Firewalls & IDS/IPS', 'Wireless Security'],
    chapters: [],
    quizNav: '#quiz'
  },
  {
    id: 'domain5', num: 5, label: '5.0 Network Troubleshooting', hours: 10,
    color: 'yellow', icon: '🔧',
    topics: ['Troubleshooting Methodology', 'Connectivity Issues', 'Performance Issues', 'Tool Usage', 'Wireless Problems'],
    chapters: [],
    quizNav: '#quiz'
  }
];

export function render(container) {
  const chapterProgress = getChapterProgress();
  const quizSessions = getQuizSessions();

  const phasesHtml = PHASES.map(phase => {
    const chaptersRead = phase.chapters.filter(id => chapterProgress[id]).length;
    const total = phase.chapters.length;
    const pct = total > 0 ? Math.round((chaptersRead / total) * 100) : 0;

    const topicsHtml = phase.topics.map(t => `
      <div style="display:flex; align-items:center; gap:8px; padding:6px 0;
                  border-bottom: 1px solid var(--color-border-light); font-size:var(--font-size-sm);
                  color: var(--color-text-secondary);">
        <span style="color: var(--color-accent-${phase.color})">○</span>${t}
      </div>
    `).join('');

    return `
      <div class="card" style="margin-bottom:var(--space-4)">
        <div class="flex-between mb-4">
          <div style="display:flex; align-items:center; gap:var(--space-3)">
            <div style="font-size:1.5rem">${phase.icon}</div>
            <div>
              <div class="fw-semibold">${phase.label}</div>
              <div class="text-xs text-muted">≈ ${phase.hours} study hours</div>
            </div>
          </div>
          <div style="text-align:right">
            <span class="badge badge--${phase.color === 'blue' ? 'blue' : phase.color === 'green' ? 'green' : phase.color === 'yellow' ? 'yellow' : phase.color === 'purple' ? 'purple' : 'muted'}">
              Phase ${phase.num}
            </span>
            ${pct > 0 ? `<div class="text-xs text-muted mt-2">${pct}% read</div>` : ''}
          </div>
        </div>

        ${total > 0 ? `
          <div class="progress-bar mb-4">
            <div class="progress-bar__fill" style="width:${pct}%"></div>
          </div>
        ` : ''}

        <div style="margin-bottom:var(--space-4)">${topicsHtml}</div>

        <div style="display:flex; gap:var(--space-2); flex-wrap:wrap;">
          <button class="btn btn--secondary btn--sm" data-nav="#theory">📖 Read Theory</button>
          <button class="btn btn--secondary btn--sm" data-nav="${phase.quizNav}">❓ Practice Quiz</button>
          <button class="btn btn--secondary btn--sm" data-nav="#labs">🖥 Labs</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="view-container">
      <div class="section-header">
        <h1>Study Plan</h1>
        <p>Your structured path through all 5 CompTIA N10-009 domains</p>
      </div>

      <div class="card mb-6" style="background: var(--color-accent-blue-dim); border-color: var(--color-accent-blue);">
        <div class="flex-between">
          <div>
            <div class="fw-semibold" style="color: var(--color-accent-blue)">Exam Weight Overview</div>
            <div class="text-xs text-muted mt-2">
              Domain 1: 23% &nbsp;|&nbsp; Domain 2: 20% &nbsp;|&nbsp;
              Domain 3: 17% &nbsp;|&nbsp; Domain 4: 20% &nbsp;|&nbsp; Domain 5: 20%
            </div>
          </div>
          <button class="btn btn--primary" data-nav="#exam">Take Practice Exam</button>
        </div>
      </div>

      ${phasesHtml}
    </div>
  `;

  container.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });
}
