let _deck = [];
let _currentIndex = 0;
let _isFlipped = false;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function loadDeck(deckData) {
  _deck = [...(deckData.cards || [])];
  _currentIndex = 0;
  _isFlipped = false;
}

export function getCurrentCard() {
  return _deck[_currentIndex] || null;
}

export function next() {
  if (_currentIndex < _deck.length - 1) {
    _currentIndex++;
    _isFlipped = false;
    return true;
  }
  return false;
}

export function prev() {
  if (_currentIndex > 0) {
    _currentIndex--;
    _isFlipped = false;
    return true;
  }
  return false;
}

export function flip() {
  _isFlipped = !_isFlipped;
  return _isFlipped;
}

export function isFlipped() {
  return _isFlipped;
}

export function shuffleDeck() {
  _deck = shuffle(_deck);
  _currentIndex = 0;
  _isFlipped = false;
}

export function getProgress() {
  return { current: _currentIndex + 1, total: _deck.length };
}

export function getDeckSize() {
  return _deck.length;
}
