import { loadFlashcardIndex, loadDeck } from '../services/data-loader.js';
import * as flashcardEngine from '../services/flashcard-engine.js';

let _currentDeckId = null;

export async function render(container) {
  container.innerHTML = `
    <div class="view-container">
      <div class="section-header">
        <h1>Flashcards</h1>
        <p>Review key concepts with interactive flip cards</p>
      </div>
      <div class="flashcard-view">
        <div class="deck-selector" id="deck-selector">
          <div class="skeleton" style="width:160px;height:36px;border-radius:999px"></div>
          <div class="skeleton" style="width:160px;height:36px;border-radius:999px"></div>
        </div>
        <div id="flashcard-area"></div>
      </div>
    </div>
  `;

  try {
    const index = await loadFlashcardIndex();
    renderDeckSelector(index.decks, container);
    if (index.decks.length > 0) {
      await selectDeck(index.decks[0].id, container);
    }
  } catch (err) {
    document.getElementById('flashcard-area').innerHTML =
      `<p class="text-sm" style="color:var(--color-accent-red)">Failed to load flashcards: ${err.message}</p>`;
  }

  document.addEventListener('keydown', _keyHandler);
  container._cleanupFlashcards = () => document.removeEventListener('keydown', _keyHandler);
}

function _keyHandler(e) {
  if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); flipCard(); }
  if (e.key === 'ArrowRight') nextCard();
  if (e.key === 'ArrowLeft')  prevCard();
}

function renderDeckSelector(decks, container) {
  const el = document.getElementById('deck-selector');
  if (!el) return;
  el.innerHTML = decks.map(d => `
    <button class="deck-btn ${d.id === _currentDeckId ? 'deck-btn--active' : ''}" data-deck="${d.id}">
      ${d.title}
    </button>
  `).join('');

  el.querySelectorAll('[data-deck]').forEach(btn => {
    btn.addEventListener('click', () => selectDeck(btn.dataset.deck, container));
  });
}

async function selectDeck(deckId, container) {
  _currentDeckId = deckId;
  document.querySelectorAll('.deck-btn').forEach(b =>
    b.classList.toggle('deck-btn--active', b.dataset.deck === deckId));

  const area = document.getElementById('flashcard-area');
  if (area) area.innerHTML = `<div class="skeleton" style="height:320px; border-radius:16px"></div>`;

  const deck = await loadDeck(deckId);
  flashcardEngine.loadDeck(deck);
  renderCard(container);
}

function renderCard(container) {
  const card = flashcardEngine.getCurrentCard();
  const { current, total } = flashcardEngine.getProgress();
  const isFlipped = flashcardEngine.isFlipped();
  const area = document.getElementById('flashcard-area');
  if (!area || !card) return;

  const pct = Math.round(((current - 1) / Math.max(total - 1, 1)) * 100);

  area.innerHTML = `
    <div class="flashcard-progress-bar">
      <span class="flashcard-progress-bar__label">Card ${current} of ${total}</span>
      <div class="progress-bar" style="flex:1">
        <div class="progress-bar__fill" style="width:${pct}%"></div>
      </div>
    </div>

    <div class="flashcard-container" id="fc-container">
      <div class="flashcard ${isFlipped ? 'flashcard--flipped' : ''}" id="flashcard">
        <div class="flashcard__face flashcard__front">
          <div class="flashcard__label">Question</div>
          <div class="flashcard__text">${card.front}</div>
          <div class="flashcard__hint">Click or press Space to reveal answer</div>
        </div>
        <div class="flashcard__face flashcard__back">
          <div class="flashcard__label">Answer</div>
          <div class="flashcard__text">${card.back}</div>
        </div>
      </div>
    </div>

    <div class="flashcard-controls">
      <button class="flashcard-ctrl-btn" id="fc-prev" ${current <= 1 ? 'disabled' : ''}>←</button>
      <button class="flashcard-ctrl-btn flashcard-ctrl-btn--primary" id="fc-flip">↺</button>
      <button class="flashcard-ctrl-btn" id="fc-next" ${current >= total ? 'disabled' : ''}>→</button>
    </div>

    <div class="flashcard-extras">
      <button class="btn btn--secondary btn--sm" id="fc-shuffle">🔀 Shuffle</button>
      ${card.tags?.length ? `
        <div class="flashcard-tags">
          ${card.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `;

  document.getElementById('flashcard')?.addEventListener('click', () => flipCard(container));
  document.getElementById('fc-flip')?.addEventListener('click', () => flipCard(container));
  document.getElementById('fc-prev')?.addEventListener('click', () => prevCard(container));
  document.getElementById('fc-next')?.addEventListener('click', () => nextCard(container));
  document.getElementById('fc-shuffle')?.addEventListener('click', () => {
    flashcardEngine.shuffleDeck();
    renderCard(container);
  });
}

function flipCard(container) {
  flashcardEngine.flip();
  const card = document.getElementById('flashcard');
  if (card) card.classList.toggle('flashcard--flipped', flashcardEngine.isFlipped());
}

function nextCard(container) {
  if (flashcardEngine.next()) renderCard(container);
}

function prevCard(container) {
  if (flashcardEngine.prev()) renderCard(container);
}
