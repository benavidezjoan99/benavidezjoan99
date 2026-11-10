import { BANK, CHALLENGE_BANK, getDomainWeights } from '@/data/banks'
import { buildSims } from '@/lib/pbq'
import { clone, shuffle } from '@/lib/utils'
import type {
  DomainMetric,
  ExamMode,
  ExamRun,
  Question,
  SessionMetrics,
  TrackId,
  TrackState,
} from '@/types/exam'

export function blankTrack(): TrackState {
  return { run: null, history: [] }
}

export function makeRun(
  items: Question[],
  simulations: ReturnType<typeof buildSims>,
  mode?: ExamMode | string,
): ExamRun {
  return {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString(),
    questions: items,
    answers: {},
    index: 0,
    page: 'questions',
    sims: simulations,
    simData: {},
    simGraded: {},
    mode,
  }
}

function allocateQuotas(weights: number[], count: number): number[] {
  const raw = weights.map((w) => (w * count) / 100)
  const quotas = raw.map(Math.floor)
  let remainder = count - quotas.reduce((a, b) => a + b, 0)
  const order = raw
    .map((n, i) => ({ i, part: n - Math.floor(n) }))
    .sort((a, b) => b.part - a.part)
  for (let j = 0; j < remainder; j += 1) {
    quotas[order[j].i] += 1
  }
  return quotas
}

function shuffleQuestionOptions(original: Question): Question {
  const q = clone(original)
  const shuffled = shuffle(
    q.options.map((label, i) => ({ label, correct: i === q.answer })),
  )
  q.options = shuffled.map((o) => o.label)
  q.answer = shuffled.findIndex((o) => o.correct)
  return q
}

export function takeTopics(
  track: TrackId,
  count: number,
  priorIds: Set<string> = new Set(),
): Question[] {
  const topics = BANK[track].topics.map((_, i) => i)
  const quotas = allocateQuotas(getDomainWeights(track), count)
  const output: Question[] = []

  for (const t of topics) {
    const pool = [...BANK[track].core, ...BANK[track].extra].filter((q) => q.topic === t)
    const fresh = shuffle(pool.filter((q) => !priorIds.has(q.id)))
    const repeat = shuffle(pool.filter((q) => priorIds.has(q.id)))
    const selected = [...fresh, ...repeat].slice(0, quotas[t])
    if (selected.length !== quotas[t]) {
      throw new Error(`Insufficient question pool for topic ${t}`)
    }
    for (const orig of selected) output.push(shuffleQuestionOptions(orig))
  }

  return shuffle(output)
}

export function takeChallengeTopics(
  track: TrackId,
  count: number,
  priorIds: Set<string> = new Set(),
): Question[] {
  const src = CHALLENGE_BANK[track]
  const quotas = allocateQuotas(getDomainWeights(track), count)
  const output: Question[] = []

  for (let t = 0; t < quotas.length; t += 1) {
    const pool = src.filter((q) => q.topic === t)
    if (pool.length < quotas[t]) {
      throw new Error(`Insufficient challenge questions for domain ${t}`)
    }
    const fresh = shuffle(pool.filter((q) => !priorIds.has(q.id)))
    const repeat = shuffle(pool.filter((q) => priorIds.has(q.id)))
    for (const original of [...fresh, ...repeat].slice(0, quotas[t])) {
      output.push(shuffleQuestionOptions(original))
    }
  }

  return shuffle(output)
}

export function runOriginal(track: TrackId): ExamRun {
  return makeRun(clone(BANK[track].core), buildSims(track), 'fundamentals')
}

export function runChallengeInitial(track: TrackId): ExamRun {
  return makeRun(takeChallengeTopics(track, 100), buildSims(track), 'challenge')
}

export function createExam(
  track: TrackId,
  count: number,
  mode: ExamMode,
  includeSims: boolean,
  priorIds: Set<string> = new Set(),
): ExamRun {
  const questions =
    mode === 'challenge'
      ? takeChallengeTopics(track, count, priorIds)
      : takeTopics(track, count, priorIds)
  const sims = includeSims ? buildSims(track) : []
  return makeRun(questions, sims, mode)
}

export function hasAnswer(run: ExamRun, index: number): boolean {
  return Object.prototype.hasOwnProperty.call(run.answers, String(index))
    || Object.prototype.hasOwnProperty.call(run.answers, index)
}

export function getAnswer(run: ExamRun, index: number): number | undefined {
  if (Object.prototype.hasOwnProperty.call(run.answers, String(index))) {
    return run.answers[String(index)]
  }
  if (Object.prototype.hasOwnProperty.call(run.answers, index)) {
    return run.answers[index as unknown as string]
  }
  return undefined
}

export function metrics(run: ExamRun): SessionMetrics {
  let correct = 0
  run.questions.forEach((q, i) => {
    const ans = getAnswer(run, i)
    if (ans !== undefined && q.answer === ans) correct += 1
  })
  const answered = Object.keys(run.answers).filter((k) => {
    const n = Number(k)
    return Number.isInteger(n) && n >= 0 && n < run.questions.length
  }).length
  return {
    correct,
    answered,
    wrong: answered - correct,
    accuracy: answered ? Math.round((correct / answered) * 100) : null,
  }
}

export function domainMetrics(run: ExamRun, topics: string[]): DomainMetric[] {
  return topics.map((label, topic) => {
    const matching = run.questions
      .map((q, i) => (q.topic === topic ? i : -1))
      .filter((i) => i !== -1)
    const answered = matching.filter((i) => hasAnswer(run, i)).length
    const correct = matching.filter((i) => {
      const ans = getAnswer(run, i)
      return ans !== undefined && ans === run.questions[i].answer
    }).length
    return { topic, label, correct, answered, total: matching.length }
  }).filter((d) => d.total > 0)
}

export const HISTORY_CAP = 12
