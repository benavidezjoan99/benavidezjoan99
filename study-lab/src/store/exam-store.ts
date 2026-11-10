import { create } from 'zustand'
import { BANK } from '@/data/banks'
import {
  createExam,
  domainMetrics,
  getAnswer,
  hasAnswer,
  HISTORY_CAP,
  metrics,
} from '@/lib/exam-engine'
import { exportStore, validateImport } from '@/lib/import-export'
import { createDefaultStore, loadStudyStore, saveStudyStore } from '@/db'
import { normalAnswer } from '@/lib/utils'
import type {
  DomainMetric,
  ExamMode,
  ExamPage,
  ExamRun,
  SessionMetrics,
  StudyStoreV2,
  TrackId,
} from '@/types/exam'

interface ExamStoreState {
  ready: boolean
  saving: boolean
  lastSavedAt: string | null
  store: StudyStoreV2
  currentSim: number
  hydrate: () => Promise<void>
  persist: () => Promise<void>
  setTrack: (track: TrackId) => void
  setPage: (page: ExamPage) => void
  go: (index: number) => void
  answer: (optionIndex: number) => void
  nextUnanswered: () => void
  startNew: (count: number, mode: ExamMode, includeSims: boolean) => void
  setSimIndex: (index: number) => void
  setSimField: (simId: string, fieldId: string, value: string) => void
  gradeSim: (simId: string) => void
  reopenHistory: (runId: string) => void
  doExport: () => void
  doImport: (file: File) => Promise<void>
  activeRun: () => ExamRun | null
  sessionMetrics: () => SessionMetrics | null
  domains: () => DomainMetric[]
}

async function write(get: () => ExamStoreState, set: (partial: Partial<ExamStoreState>) => void) {
  set({ saving: true })
  await saveStudyStore(get().store)
  set({ saving: false, lastSavedAt: new Date().toISOString() })
}

export const useExamStore = create<ExamStoreState>((set, get) => ({
  ready: false,
  saving: false,
  lastSavedAt: null,
  store: createDefaultStore(),
  currentSim: 0,

  hydrate: async () => {
    const store = await loadStudyStore()
    set({ store, ready: true, lastSavedAt: new Date().toISOString(), currentSim: 0 })
  },

  persist: async () => {
    await write(get, set)
  },

  setTrack: (track) => {
    set((state) => ({
      store: { ...state.store, active: track },
      currentSim: 0,
    }))
    void write(get, set)
  },

  setPage: (page) => {
    const { store } = get()
    const track = store.tracks[store.active]
    if (!track.run) return
    track.run.page = page
    set({ store: { ...store, tracks: { ...store.tracks, [store.active]: { ...track } } } })
    void write(get, set)
  },

  go: (index) => {
    const { store } = get()
    const track = store.tracks[store.active]
    if (!track.run) return
    const max = track.run.questions.length - 1
    track.run.index = Math.max(0, Math.min(max, index))
    track.run.page = 'questions'
    set({ store: { ...store } })
    void write(get, set)
  },

  answer: (optionIndex) => {
    const { store } = get()
    const track = store.tracks[store.active]
    const run = track.run
    if (!run || hasAnswer(run, run.index)) return
    run.answers[String(run.index)] = optionIndex
    set({ store: { ...store } })
    void write(get, set)
  },

  nextUnanswered: () => {
    const run = get().activeRun()
    if (!run) return
    let i = run.questions.findIndex((_, j) => j > run.index && !hasAnswer(run, j))
    if (i < 0) i = run.questions.findIndex((_, j) => !hasAnswer(run, j))
    if (i >= 0) get().go(i)
    else get().setPage('results')
  },

  startNew: (count, mode, includeSims) => {
    const { store } = get()
    const track = store.tracks[store.active]
    const old = track.run
    const prior = new Set(old?.questions.map((q) => q.id) || [])
    const fresh = createExam(store.active, count, mode, includeSims, prior)
    if (old) {
      track.history.push(old)
      if (track.history.length > HISTORY_CAP) track.history.shift()
    }
    track.run = fresh
    set({ store: { ...store }, currentSim: 0 })
    void write(get, set)
  },

  setSimIndex: (index) => set({ currentSim: index }),

  setSimField: (simId, fieldId, value) => {
    const { store } = get()
    const run = store.tracks[store.active].run
    if (!run || run.simGraded[simId]) return
    if (!run.simData[simId]) run.simData[simId] = {}
    run.simData[simId][fieldId] = value
    set({ store: { ...store } })
    void write(get, set)
  },

  gradeSim: (simId) => {
    const { store } = get()
    const run = store.tracks[store.active].run
    if (!run) return
    const sim = run.sims.find((s) => s.id === simId)
    if (!sim || run.simGraded[simId]) return
    const answers = run.simData[simId] || {}
    const missing = sim.fields.filter((f) => !String(answers[f.id] || '').trim())
    if (missing.length) {
      throw new Error(`Answer all fields before grading (${missing.length} remaining).`)
    }
    let correct = 0
    for (const field of sim.fields) {
      if (normalAnswer(answers[field.id] || '') === normalAnswer(field.correct)) correct += 1
    }
    run.simGraded[simId] = { correct, total: sim.fields.length }
    set({ store: { ...store } })
    void write(get, set)
  },

  reopenHistory: (runId) => {
    const { store } = get()
    const track = store.tracks[store.active]
    const idx = track.history.findIndex((r) => r.id === runId)
    if (idx < 0 || !track.run) return
    const [selected] = track.history.splice(idx, 1)
    track.history.push(track.run)
    track.run = selected
    track.run.page = 'questions'
    set({ store: { ...store }, currentSim: 0 })
    void write(get, set)
  },

  doExport: () => {
    exportStore(get().store)
  },

  doImport: async (file) => {
    const raw = JSON.parse(await file.text()) as unknown
    const candidate = validateImport(raw)
    set({ store: candidate, currentSim: 0 })
    await write(get, set)
  },

  activeRun: () => get().store.tracks[get().store.active].run,

  sessionMetrics: () => {
    const run = get().activeRun()
    return run ? metrics(run) : null
  },

  domains: () => {
    const { store } = get()
    const run = store.tracks[store.active].run
    if (!run) return []
    return domainMetrics(run, BANK[store.active].topics)
  },
}))

export { getAnswer, hasAnswer, metrics }
