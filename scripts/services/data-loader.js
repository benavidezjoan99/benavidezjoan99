const _cache = new Map();

async function loadJSON(url) {
  if (_cache.has(url)) return _cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  const data = await res.json();
  _cache.set(url, data);
  return data;
}

export function loadTheoryIndex() {
  return loadJSON('./data/theory/index.json');
}

export function loadChapter(id) {
  return loadJSON(`./data/theory/${id}.json`);
}

export function loadLabIndex() {
  return loadJSON('./data/labs/index.json');
}

export function loadLab(id) {
  return loadJSON(`./data/labs/${id}.json`);
}

export function loadFlashcardIndex() {
  return loadJSON('./data/flashcards/index.json');
}

export function loadDeck(id) {
  return loadJSON(`./data/flashcards/${id}.json`);
}

export function loadQuizDomain(filename) {
  return loadJSON(`./data/quiz/${filename}`);
}

export async function loadAllQuizDomains() {
  const index = await loadJSON('./data/quiz/index.json');
  const files = index.files || [];
  const results = await Promise.all(files.map(f => loadQuizDomain(f)));
  return results.flatMap(r => r.questions || []);
}

export function clearCache() {
  _cache.clear();
}
