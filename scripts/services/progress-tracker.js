import { get, set } from './storage.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function logActivity() {
  const log = get('activity_log') || [];
  const t = today();
  if (!log.includes(t)) {
    log.push(t);
    if (log.length > 365) log.shift();
    set('activity_log', log);
  }
}

export function markChapterRead(chapterId) {
  const chapters = get('progress_chapters') || {};
  chapters[chapterId] = { readAt: new Date().toISOString() };
  set('progress_chapters', chapters);
  logActivity();
}

export function markLabComplete(labId, score) {
  const labs = get('progress_labs') || {};
  labs[labId] = { score, completedAt: new Date().toISOString() };
  set('progress_labs', labs);
  logActivity();
}

export function recordQuizSession(domain, score, total) {
  const sessions = get('progress_quiz') || [];
  sessions.push({ domain, score, total, date: today() });
  if (sessions.length > 200) sessions.shift();
  set('progress_quiz', sessions);
  logActivity();
}

export function recordExamSession(score, total, domainBreakdown) {
  const sessions = get('progress_exam') || [];
  sessions.push({ score, total, domainBreakdown, date: today() });
  set('progress_exam', sessions);
  logActivity();
}

export function getChapterProgress() {
  return get('progress_chapters') || {};
}

export function getLabProgress() {
  return get('progress_labs') || {};
}

export function getQuizSessions(domain) {
  const sessions = get('progress_quiz') || [];
  if (!domain || domain === 'all') return sessions;
  return sessions.filter(s => s.domain === domain);
}

export function getExamSessions() {
  return get('progress_exam') || [];
}

export function getStudyStreak() {
  const log = get('activity_log') || [];
  if (!log.length) return 0;
  let streak = 0;
  const msPerDay = 86400000;
  let check = new Date(today());
  while (true) {
    const dateStr = check.toISOString().slice(0, 10);
    if (log.includes(dateStr)) {
      streak++;
      check = new Date(check.getTime() - msPerDay);
    } else {
      break;
    }
  }
  return streak;
}

export function getActivityLog() {
  return get('activity_log') || [];
}

export function getAllProgress() {
  return {
    chapters: getChapterProgress(),
    labs: getLabProgress(),
    quizSessions: getQuizSessions(),
    examSessions: getExamSessions(),
    streak: getStudyStreak(),
    activityLog: getActivityLog()
  };
}
