const ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
const COLORS = {
  success: 'var(--color-accent-green)',
  error:   'var(--color-accent-red)',
  info:    'var(--color-accent-blue)',
  warning: 'var(--color-accent-yellow)'
};

export function show(message, type = 'info', duration = 3500) {
  const root = document.getElementById('toast-root');
  if (!root) return;

  const toast = document.createElement('div');
  toast.style.cssText = `
    display: flex; align-items: center; gap: 10px;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border);
    border-left: 3px solid ${COLORS[type]};
    border-radius: var(--border-radius-sm);
    padding: 10px 14px;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    box-shadow: var(--shadow-lg);
    pointer-events: all;
    min-width: 240px;
    max-width: 360px;
    animation: toastIn 200ms ease;
  `;

  const icon = document.createElement('span');
  icon.textContent = ICONS[type];
  icon.style.cssText = `color: ${COLORS[type]}; font-weight: bold; flex-shrink: 0;`;

  const msg = document.createElement('span');
  msg.style.flex = '1';
  msg.textContent = message;

  const close = document.createElement('button');
  close.textContent = '×';
  close.style.cssText = `
    background: none; border: none; cursor: pointer;
    color: var(--color-text-muted); font-size: 18px; line-height: 1;
    flex-shrink: 0; padding: 0;
  `;
  close.onclick = () => remove(toast);

  toast.append(icon, msg, close);
  root.appendChild(toast);

  const timer = setTimeout(() => remove(toast), duration);
  toast._timer = timer;
}

function remove(toast) {
  clearTimeout(toast._timer);
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(20px)';
  toast.style.transition = 'all 200ms ease';
  setTimeout(() => toast.remove(), 220);
}

if (!document.getElementById('toast-style')) {
  const style = document.createElement('style');
  style.id = 'toast-style';
  style.textContent = `
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
}
