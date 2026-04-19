import { changePassword, getUser } from '../auth.js';
import { get, set, clear } from '../services/storage.js';
import { setState, getState } from '../state.js';
import { open as openModal } from '../components/modal.js';
import { show as showToast } from '../components/toast.js';
import { resetDurations } from '../components/pomodoro.js';

export function render(container) {
  const settings = getState().settings;

  container.innerHTML = `
    <div class="view-container">
      <div class="section-header">
        <h1>Settings</h1>
        <p>Customize your learning experience</p>
      </div>

      <div class="settings-layout">

        <div class="settings-section">
          <div class="settings-section__header">
            <div class="settings-section__title">Account</div>
            <div class="settings-section__sub">Manage your login credentials</div>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row__label">Username</div>
              <div class="settings-row__desc">${getUser()}</div>
            </div>
          </div>
          <div class="settings-form-group" id="pw-form">
            <div class="settings-form-input-wrap">
              <label class="settings-form-label">Current Password</label>
              <input class="settings-input" type="password" id="old-pw" placeholder="Current password" autocomplete="current-password">
            </div>
            <div class="settings-form-input-wrap">
              <label class="settings-form-label">New Password</label>
              <input class="settings-input" type="password" id="new-pw" placeholder="New password" autocomplete="new-password">
            </div>
            <div class="settings-form-input-wrap">
              <label class="settings-form-label">Confirm New Password</label>
              <input class="settings-input" type="password" id="confirm-pw" placeholder="Confirm new password" autocomplete="new-password">
            </div>
          </div>
          <div class="settings-form-actions">
            <button class="btn btn--primary" id="change-pw-btn">Change Password</button>
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section__header">
            <div class="settings-section__title">Pomodoro Timer</div>
            <div class="settings-section__sub">Customize study session durations</div>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row__label">Focus Duration</div>
              <div class="settings-row__desc">Minutes per work session</div>
            </div>
            <input class="settings-input settings-input--sm" type="number"
                   id="pomo-work" min="5" max="90" value="${settings.pomodoroWork}">
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row__label">Short Break</div>
              <div class="settings-row__desc">Minutes for short breaks</div>
            </div>
            <input class="settings-input settings-input--sm" type="number"
                   id="pomo-short" min="1" max="30" value="${settings.pomodoroShortBreak}">
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row__label">Long Break</div>
              <div class="settings-row__desc">Minutes after 4 sessions</div>
            </div>
            <input class="settings-input settings-input--sm" type="number"
                   id="pomo-long" min="5" max="60" value="${settings.pomodoroLongBreak}">
          </div>
          <div class="settings-form-actions">
            <button class="btn btn--primary" id="save-pomo-btn">Save Timer Settings</button>
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section__header">
            <div class="settings-section__title">Data Management</div>
            <div class="settings-section__sub">Export or reset your progress data</div>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row__label">Export Progress</div>
              <div class="settings-row__desc">Download your data as JSON</div>
            </div>
            <button class="btn btn--secondary" id="export-btn">Export</button>
          </div>
        </div>

        <div class="settings-section danger-zone">
          <div class="settings-section__header">
            <div class="settings-section__title">Danger Zone</div>
            <div class="settings-section__sub">Irreversible actions</div>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row__label">Reset All Progress</div>
              <div class="settings-row__desc">Clears all study data, quiz history, and progress tracking</div>
            </div>
            <button class="btn btn--danger" id="reset-btn">Reset Data</button>
          </div>
        </div>

      </div>
    </div>
  `;

  container.querySelector('#change-pw-btn')?.addEventListener('click', () => {
    const oldPw = document.getElementById('old-pw')?.value;
    const newPw = document.getElementById('new-pw')?.value;
    const confirmPw = document.getElementById('confirm-pw')?.value;

    if (!oldPw || !newPw || !confirmPw) {
      showToast('Please fill in all password fields.', 'warning'); return;
    }
    if (newPw !== confirmPw) {
      showToast('New passwords do not match.', 'error'); return;
    }
    if (newPw.length < 4) {
      showToast('Password must be at least 4 characters.', 'warning'); return;
    }
    if (changePassword(oldPw, newPw)) {
      showToast('Password changed successfully!', 'success');
      ['old-pw', 'new-pw', 'confirm-pw'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    } else {
      showToast('Current password is incorrect.', 'error');
    }
  });

  container.querySelector('#save-pomo-btn')?.addEventListener('click', () => {
    const work  = parseInt(document.getElementById('pomo-work')?.value, 10) || 25;
    const short = parseInt(document.getElementById('pomo-short')?.value, 10) || 5;
    const long  = parseInt(document.getElementById('pomo-long')?.value, 10) || 15;

    setState({ settings: { pomodoroWork: work, pomodoroShortBreak: short, pomodoroLongBreak: long } });
    set('settings', { pomodoroWork: work, pomodoroShortBreak: short, pomodoroLongBreak: long });
    resetDurations();
    showToast('Pomodoro settings saved!', 'success');
  });

  container.querySelector('#export-btn')?.addEventListener('click', () => {
    const data = {
      exportedAt: new Date().toISOString(),
      chapters: get('progress_chapters') || {},
      labs: get('progress_labs') || {},
      quizSessions: get('progress_quiz') || [],
      examSessions: get('progress_exam') || [],
      activityLog: get('activity_log') || []
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netadmin-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Progress exported!', 'success');
  });

  container.querySelector('#reset-btn')?.addEventListener('click', () => {
    openModal({
      title: 'Reset All Progress',
      body: 'This will permanently delete all your study progress, quiz history, and activity logs. This action cannot be undone.',
      confirmLabel: 'Yes, Reset Everything',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        clear('progress_');
        clear('activity_');
        clear('pomodoro_');
        showToast('All progress data has been reset.', 'info');
      }
    });
  });
}
