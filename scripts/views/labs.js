import { loadLabIndex, loadLab } from '../services/data-loader.js';
import * as labEngine from '../services/lab-engine.js';
import { markLabComplete } from '../services/progress-tracker.js';
import { show as showToast } from '../components/toast.js';

let _filter = 'all';

const TYPE_COLORS = { guided: 'blue', 'semi-guided': 'yellow', troubleshooting: 'red' };

export async function render(container, params = {}) {
  container.innerHTML = `
    <div class="view-container">
      <div class="section-header">
        <h1>Labs</h1>
        <p>Hands-on practice labs to reinforce networking concepts</p>
      </div>
      <div id="labs-body">
        <div class="skeleton skeleton--text" style="height:40px; margin-bottom:24px"></div>
        <div class="grid-3">
          ${[1,2,3].map(() => `<div class="skeleton" style="height:160px"></div>`).join('')}
        </div>
      </div>
    </div>
  `;

  try {
    const index = await loadLabIndex();
    if (params.id) {
      const lab = await loadLab(params.id);
      renderWorkspace(container, lab);
    } else {
      renderLabList(container, index.labs);
    }
  } catch (err) {
    document.getElementById('labs-body').innerHTML =
      `<p style="color:var(--color-accent-red); font-size:var(--font-size-sm)">Failed to load labs: ${err.message}</p>`;
  }
}

function renderLabList(container, labs) {
  const body = document.getElementById('labs-body');
  if (!body) return;

  const filtered = _filter === 'all' ? labs : labs.filter(l => l.type === _filter);

  body.innerHTML = `
    <div class="lab-filter-bar">
      ${['all','guided','semi-guided','troubleshooting'].map(f => `
        <button class="lab-filter-btn ${_filter === f ? 'lab-filter-btn--active' : ''}" data-filter="${f}">
          ${f === 'all' ? 'All Labs' : f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      `).join('')}
    </div>
    <div class="labs-grid">
      ${filtered.map(lab => `
        <div class="lab-card" data-lab-id="${lab.id}">
          <div class="lab-card__header">
            <div>
              <div class="lab-card__title">${lab.title}</div>
              <span class="badge badge--${TYPE_COLORS[lab.type] || 'muted'}" style="margin-top:6px">${lab.type}</span>
            </div>
          </div>
          <p class="lab-card__desc">${lab.description}</p>
          <div class="lab-card__meta">
            <span>⏱ ${lab.estimatedMinutes} min</span>
            <span class="badge badge--muted">${lab.difficulty}</span>
          </div>
        </div>
      `).join('')}
    </div>
    ${filtered.length === 0 ? `<div class="empty-state"><div class="empty-state__icon">🔬</div><div class="empty-state__title">No labs in this category yet</div></div>` : ''}
  `;

  body.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      _filter = btn.dataset.filter;
      renderLabList(container, labs);
    });
  });

  body.querySelectorAll('[data-lab-id]').forEach(card => {
    card.addEventListener('click', async () => {
      const labData = await loadLab(card.dataset.labId);
      renderWorkspace(container, labData);
    });
  });
}

function renderWorkspace(container, lab) {
  labEngine.startLab(lab);
  const step = labEngine.getCurrentStep();

  document.getElementById('labs-body').innerHTML = '';

  const mainEl = document.querySelector('.view-container') || container;
  mainEl.innerHTML = `
    <div class="flex-between mb-4">
      <div class="section-header" style="margin-bottom:0">
        <h1>${lab.title}</h1>
        <p>${lab.objective}</p>
      </div>
      <button class="btn btn--secondary" id="back-to-labs">← Back to Labs</button>
    </div>
    <div class="lab-workspace">
      <div class="lab-instructions">
        <div class="lab-instructions__header">
          <div class="lab-instructions__title">Instructions</div>
          <div class="lab-instructions__objective">${lab.objective}</div>
        </div>
        <div class="lab-steps" id="lab-steps"></div>
      </div>
      <div class="lab-workspace-panel">
        <div class="lab-terminal-header">
          <div class="terminal-dot terminal-dot--red"></div>
          <div class="terminal-dot terminal-dot--yellow"></div>
          <div class="terminal-dot terminal-dot--green"></div>
          <span class="terminal-title">Lab Console</span>
        </div>
        <div class="lab-terminal" id="lab-terminal">
          <div class="lab-terminal__line">NetAdmin Academy Lab Environment</div>
          <div class="lab-terminal__line lab-terminal__line--output" style="color:var(--color-text-muted)">
            Lab: ${lab.title}
          </div>
          <div class="lab-terminal__line lab-terminal__line--output" style="color:var(--color-text-muted)">
            ${lab.background || 'Read the instructions and complete each step.'}
          </div>
          <div class="lab-terminal__line lab-terminal__line--output">&nbsp;</div>
          <div class="lab-terminal__line">Ready. Complete step 1 to begin.</div>
        </div>
      </div>
    </div>
  `;

  renderSteps(lab);

  mainEl.querySelector('#back-to-labs')?.addEventListener('click', async () => {
    const index = await loadLabIndex().catch(() => ({ labs: [] }));
    container.innerHTML = `<div class="view-container">
      <div class="section-header"><h1>Labs</h1><p>Hands-on practice labs</p></div>
      <div id="labs-body"></div>
    </div>`;
    renderLabList(container, index.labs);
  });
}

function renderSteps(lab) {
  const stepsEl = document.getElementById('lab-steps');
  if (!stepsEl) return;

  const currentIdx = labEngine.getCurrentStepIndex();

  stepsEl.innerHTML = lab.steps.map((step, i) => {
    const isDone = i < currentIdx || labEngine.isComplete();
    const isActive = i === currentIdx && !labEngine.isComplete();
    const isLocked = i > currentIdx && !labEngine.isComplete();

    let stateClass = '';
    if (isDone) stateClass = 'lab-step--completed';
    else if (isActive) stateClass = 'lab-step--active';
    else if (isLocked) stateClass = 'lab-step--locked';

    return `
      <div class="lab-step ${stateClass}" id="step-${i}">
        <div class="lab-step__num">${isDone ? '✓' : i + 1}</div>
        <div class="lab-step__body">
          <div class="lab-step__instruction">${step.instruction}</div>
          ${isActive ? `
            <div class="lab-step__input-row">
              <input class="lab-input" type="text" id="step-input-${i}"
                     placeholder="Type your answer..." autocomplete="off">
              <button class="btn btn--primary btn--sm" id="step-submit-${i}">Submit</button>
            </div>
            <div id="step-feedback-${i}"></div>
            <button class="lab-hint-btn" id="hint-btn-${i}">💡 Show hint</button>
            <div id="hint-text-${i}" style="display:none"></div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  if (labEngine.isComplete()) {
    const score = labEngine.getLabScore();
    stepsEl.insertAdjacentHTML('afterend', `
      <div class="lab-completion">
        <div class="lab-completion__score">${score}%</div>
        <div class="fw-semibold mt-2">Lab Complete!</div>
        <div class="text-muted text-sm mt-2">Well done. Score: ${score}/100</div>
      </div>
    `);
    return;
  }

  const currentIdx2 = labEngine.getCurrentStepIndex();
  const submitBtn = document.getElementById(`step-submit-${currentIdx2}`);
  const inputEl = document.getElementById(`step-input-${currentIdx2}`);
  const hintBtn = document.getElementById(`hint-btn-${currentIdx2}`);
  const hintText = document.getElementById(`hint-text-${currentIdx2}`);
  const feedbackEl = document.getElementById(`step-feedback-${currentIdx2}`);

  function trySubmit() {
    const value = inputEl?.value || '';
    const correct = labEngine.validateStep(value);
    const termEl = document.getElementById('lab-terminal');

    if (correct) {
      if (inputEl) {
        inputEl.disabled = true;
        inputEl.classList.add('lab-input--correct');
      }
      feedbackEl.innerHTML = `<div class="lab-step__feedback lab-step__feedback--correct">✓ Correct! ${lab.steps[currentIdx2].explanation}</div>`;
      if (termEl) {
        const line = document.createElement('div');
        line.className = 'lab-terminal__line lab-terminal__line--success';
        line.textContent = `✓ Step ${currentIdx2 + 1} correct: ${value}`;
        termEl.appendChild(line);
        termEl.scrollTop = termEl.scrollHeight;
      }
      setTimeout(() => {
        const more = labEngine.completeStep();
        if (labEngine.isComplete()) {
          const score = labEngine.getLabScore();
          markLabComplete(lab.id, score);
          showToast(`Lab complete! Score: ${score}%`, 'success');
        }
        renderSteps(lab);
      }, 900);
    } else {
      if (inputEl) inputEl.classList.add('lab-input--incorrect');
      feedbackEl.innerHTML = `<div class="lab-step__feedback lab-step__feedback--incorrect">✕ Incorrect. Try again or use a hint.</div>`;
      setTimeout(() => inputEl?.classList.remove('lab-input--incorrect'), 1200);
    }
  }

  submitBtn?.addEventListener('click', trySubmit);
  inputEl?.addEventListener('keydown', e => { if (e.key === 'Enter') trySubmit(); });

  hintBtn?.addEventListener('click', () => {
    const hint = labEngine.getHint(currentIdx2);
    if (hintText) {
      hintText.style.display = 'block';
      hintText.innerHTML = `<div class="lab-hint-text">💡 ${hint}</div>`;
    }
    hintBtn.style.display = 'none';
  });
}
