import { loadTheoryIndex, loadChapter } from '../services/data-loader.js';
import { markChapterRead, getChapterProgress } from '../services/progress-tracker.js';
import { show as showToast } from '../components/toast.js';

let _activeChapterId = null;
let _activeTab = 'simple';

const TAB_LABELS = [
  { key: 'simple',       label: '💡 Simple' },
  { key: 'technical',    label: '⚙ Technical' },
  { key: 'realWorld',    label: '🌍 Real World' },
  { key: 'commands',     label: '💻 Commands' },
  { key: 'commonMistakes', label: '⚠ Exam Traps' }
];

export async function render(container, params = {}) {
  container.innerHTML = `
    <div class="view-container">
      <div class="section-header">
        <h1>Theory</h1>
        <p>Study CompTIA N10-009 concepts with simple, technical, and real-world explanations</p>
      </div>
      <div class="theory-layout" id="theory-layout">
        <div id="chapter-list-col">
          <div class="theory-chapter-list">
            <div class="theory-chapter-list__header">Chapters</div>
            <div id="chapter-list"><div class="skeleton skeleton--text" style="margin:16px;width:80%"></div></div>
          </div>
        </div>
        <div id="reader-col">
          <div class="theory-reader">
            <div class="theory-reader__empty">
              <div style="font-size:3rem;opacity:0.3">📖</div>
              <div style="margin-top:16px; color: var(--color-text-muted); font-size:var(--font-size-sm)">
                Select a chapter to start reading
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    const index = await loadTheoryIndex();
    const progress = getChapterProgress();
    renderChapterList(index.chapters, progress, container);
    if (params.id) {
      loadAndRenderChapter(params.id, container);
    }
  } catch (err) {
    document.getElementById('chapter-list').innerHTML =
      `<p class="text-sm" style="padding:16px;color:var(--color-accent-red)">Failed to load chapters: ${err.message}</p>`;
  }
}

function renderChapterList(chapters, progress, container) {
  const listEl = document.getElementById('chapter-list');
  if (!listEl) return;

  listEl.innerHTML = chapters.map(ch => `
    <div class="theory-chapter-item ${progress[ch.id] ? 'theory-chapter-item--read' : ''} ${_activeChapterId === ch.id ? 'theory-chapter-item--active' : ''}"
         data-id="${ch.id}">
      <div class="theory-chapter-item__check">${progress[ch.id] ? '✓' : ''}</div>
      <div class="theory-chapter-item__info">
        <div class="theory-chapter-item__title">${ch.title}</div>
        <div class="theory-chapter-item__meta">${ch.domain} · ${ch.estimatedMinutes}min</div>
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('.theory-chapter-item').forEach(el => {
    el.addEventListener('click', () => {
      _activeChapterId = el.dataset.id;
      listEl.querySelectorAll('.theory-chapter-item').forEach(x =>
        x.classList.toggle('theory-chapter-item--active', x.dataset.id === _activeChapterId));
      loadAndRenderChapter(el.dataset.id, container);
    });
  });
}

async function loadAndRenderChapter(id, container) {
  const readerCol = document.getElementById('reader-col');
  if (!readerCol) return;
  readerCol.innerHTML = `
    <div class="theory-reader">
      <div style="padding:24px">
        <div class="skeleton skeleton--text" style="width:60%; height:20px; margin-bottom:12px"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text" style="width:80%"></div>
      </div>
    </div>
  `;

  try {
    const chapter = await loadChapter(id);
    _activeChapterId = id;
    renderReader(chapter, readerCol);
    markChapterRead(id);
    const item = document.querySelector(`.theory-chapter-item[data-id="${id}"]`);
    if (item) {
      item.classList.add('theory-chapter-item--read');
      item.querySelector('.theory-chapter-item__check').textContent = '✓';
    }
  } catch (err) {
    readerCol.innerHTML = `
      <div class="theory-reader">
        <div style="padding:24px; color: var(--color-accent-red); font-size:var(--font-size-sm)">
          Failed to load chapter: ${err.message}
        </div>
      </div>
    `;
  }
}

function renderReader(chapter, container) {
  const tabsHtml = TAB_LABELS.map(t =>
    `<button class="theory-tab ${_activeTab === t.key ? 'theory-tab--active' : ''}" data-tab="${t.key}">${t.label}</button>`
  ).join('');

  container.innerHTML = `
    <div class="theory-reader">
      <div class="theory-reader__header">
        <div class="theory-reader__title">${chapter.title}</div>
        <div class="theory-reader__meta">
          <span class="badge badge--blue">${chapter.domain}</span>
          <span class="badge badge--muted">${chapter.version || 'N10-009'}</span>
        </div>
      </div>
      <div class="theory-tabs">${tabsHtml}</div>
      <div class="theory-content" id="theory-content-area"></div>
      <div class="theory-actions">
        <button class="btn btn--primary" id="mark-read-btn">✓ Mark as Read</button>
      </div>
    </div>
  `;

  renderTabContent(chapter, _activeTab);

  container.querySelectorAll('.theory-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      _activeTab = tab.dataset.tab;
      container.querySelectorAll('.theory-tab').forEach(t =>
        t.classList.toggle('theory-tab--active', t.dataset.tab === _activeTab));
      renderTabContent(chapter, _activeTab);
    });
  });

  container.querySelector('#mark-read-btn')?.addEventListener('click', () => {
    markChapterRead(chapter.id);
    showToast(`Chapter marked as read: ${chapter.title}`, 'success');
    const item = document.querySelector(`.theory-chapter-item[data-id="${chapter.id}"]`);
    if (item) {
      item.classList.add('theory-chapter-item--read');
      item.querySelector('.theory-chapter-item__check').textContent = '✓';
    }
  });
}

function renderTabContent(chapter, tab) {
  const area = document.getElementById('theory-content-area');
  if (!area || !chapter.tabs) return;
  const data = chapter.tabs[tab];
  if (!data) { area.innerHTML = '<p class="text-muted text-sm">Content coming soon.</p>'; return; }

  switch (tab) {
    case 'simple':    renderSimple(area, data); break;
    case 'technical': renderTechnical(area, data); break;
    case 'realWorld': renderRealWorld(area, data); break;
    case 'commands':  renderCommands(area, data); break;
    case 'commonMistakes': renderMistakes(area, data); break;
    default: area.innerHTML = '<p class="text-muted">Unknown tab</p>';
  }
}

function renderSimple(area, data) {
  area.innerHTML = `
    <h3>${data.headline || ''}</h3>
    ${(data.paragraphs || []).map(p => `<p>${p}</p>`).join('')}
  `;
}

function renderTechnical(area, data) {
  const layersHtml = data.layers ? `
    <table class="layers-table">
      <thead>
        <tr>
          <th>#</th><th>Layer / Name</th><th>PDU</th><th>Protocols</th><th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${data.layers.map(l => `
          <tr>
            <td><span class="layer-num">${l.number}</span></td>
            <td class="fw-medium">${l.name}</td>
            <td><span class="tag">${l.pdu}</span></td>
            <td>
              <div class="protocol-tags">
                ${(l.protocols || []).map(p => `<span class="tag">${p}</span>`).join('')}
              </div>
            </td>
            <td class="text-sm text-muted">${l.description}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '';

  const classesHtml = data.ipv4Classes ? `
    <h3 style="margin-top:24px">IPv4 Address Classes</h3>
    <table class="layers-table">
      <thead><tr><th>Class</th><th>Range</th><th>Default Mask</th><th>CIDR</th></tr></thead>
      <tbody>
        ${data.ipv4Classes.map(c => `
          <tr>
            <td class="fw-semibold">${c.class}</td>
            <td class="text-sm"><code>${c.range}</code></td>
            <td><span class="tag">${c.defaultMask}</span></td>
            <td><span class="badge badge--blue">${c.cidr}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '';

  area.innerHTML = `
    <h3>${data.headline || ''}</h3>
    ${(data.paragraphs || []).map(p => `<p>${p}</p>`).join('')}
    ${layersHtml}
    ${classesHtml}
  `;
}

function renderRealWorld(area, data) {
  const stepsHtml = data.steps ? `
    <ol style="list-style:decimal; padding-left:24px; color:var(--color-text-secondary);">
      ${data.steps.map(s => `<li style="margin-bottom:8px; font-size:var(--font-size-sm)">${s}</li>`).join('')}
    </ol>
  ` : '';

  area.innerHTML = `
    <h3>${data.headline || ''}</h3>
    <div class="callout callout--tip">
      <div class="callout__label">Scenario</div>
      ${data.scenario || ''}
    </div>
    ${stepsHtml}
  `;
}

function renderCommands(area, data) {
  const itemsHtml = (data.items || []).map(item => `
    <div class="command-card">
      <div class="command-card__header">
        <span class="command-card__desc">${item.description}</span>
        <span class="badge badge--muted">${item.os}</span>
      </div>
      <div class="command-card__code">${item.command}</div>
      ${item.output ? `<div class="command-card__output">${item.output}</div>` : ''}
    </div>
  `).join('');

  area.innerHTML = `
    <h3>${data.headline || ''}</h3>
    ${itemsHtml}
  `;
}

function renderMistakes(area, data) {
  const mistakesHtml = (data.mistakes || []).map(m => `
    <div class="mistake-card">
      <div class="mistake-card__label mistake-card__mistake">✕ Common Mistake</div>
      <p>${m.mistake}</p>
      <div class="mistake-card__label mistake-card__correction">✓ Correction</div>
      <p>${m.correction}</p>
      ${m.examTip ? `
        <div class="mistake-card__label mistake-card__tip">💡 Exam Tip</div>
        <p>${m.examTip}</p>
      ` : ''}
    </div>
  `).join('');

  area.innerHTML = `
    <h3>${data.headline || ''}</h3>
    ${mistakesHtml}
  `;
}
