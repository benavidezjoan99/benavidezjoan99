let _dialog = null;

export function open({ title = '', body = '', confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel } = {}) {
  close();

  const root = document.getElementById('modal-root');
  if (!root) return;

  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: fadeIn 180ms ease;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-lg);
    padding: 28px;
    max-width: 460px;
    width: 100%;
    box-shadow: var(--shadow-xl);
    animation: scaleIn 180ms ease;
  `;

  const h = document.createElement('h3');
  h.textContent = title;
  h.style.cssText = `
    font-size: var(--font-size-md); font-weight: var(--font-weight-semibold);
    margin-bottom: 10px; color: var(--color-text-primary);
  `;

  const p = document.createElement('p');
  p.textContent = body;
  p.style.cssText = `
    font-size: var(--font-size-sm); color: var(--color-text-secondary);
    margin-bottom: 24px; line-height: 1.6;
  `;

  const actions = document.createElement('div');
  actions.style.cssText = `display: flex; gap: 10px; justify-content: flex-end;`;

  if (cancelLabel) {
    const cancel = document.createElement('button');
    cancel.textContent = cancelLabel;
    cancel.className = 'btn btn--secondary';
    cancel.onclick = () => { close(); onCancel?.(); };
    actions.appendChild(cancel);
  }

  const confirm = document.createElement('button');
  confirm.textContent = confirmLabel;
  confirm.className = 'btn btn--danger';
  confirm.onclick = () => { close(); onConfirm?.(); };
  actions.appendChild(confirm);

  box.append(h, p, actions);
  backdrop.appendChild(box);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) { close(); onCancel?.(); } });

  root.appendChild(backdrop);
  _dialog = backdrop;

  document.addEventListener('keydown', _escHandler);
}

function _escHandler(e) {
  if (e.key === 'Escape') close();
}

export function close() {
  if (_dialog) {
    _dialog.remove();
    _dialog = null;
    document.removeEventListener('keydown', _escHandler);
  }
}

if (!document.getElementById('modal-style')) {
  const style = document.createElement('style');
  style.id = 'modal-style';
  style.textContent = `
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
}
