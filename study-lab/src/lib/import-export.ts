import { STORAGE_APP_KEY, STORAGE_LEGACY_PREFIX } from '@/db/keys'
import { blankTrack, runOriginal } from '@/lib/exam-engine'
import { downloadText } from '@/lib/utils'
import type { ExamRun, StudyStoreV2, TrackId } from '@/types/exam'

function isTrackId(value: string): value is TrackId {
  return value === 'network' || value === 'security'
}

export function validateImport(payload: unknown): StudyStoreV2 {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid backup.')
  }

  const data = payload as Record<string, unknown>

  if (data.app === STORAGE_LEGACY_PREFIX && data.progress && typeof data.progress === 'object') {
    const progress = data.progress as Record<string, { answers?: Record<string, number>; index?: number; page?: string }>
    const store: StudyStoreV2 = {
      version: 2,
      active: 'network',
      tracks: {
        network: blankTrack(),
        security: blankTrack(),
      },
    }
    for (const t of ['network', 'security'] as TrackId[]) {
      const legacy = progress[t]
      const run = runOriginal(t)
      if (legacy?.answers) {
        for (const [k, v] of Object.entries(legacy.answers)) {
          const idx = Number(k)
          if (Number.isInteger(idx) && idx >= 0 && idx < 100 && Number.isInteger(v) && v >= 0 && v < 4) {
            run.answers[String(idx)] = v
          }
        }
        run.index = Math.min(99, Math.max(0, Number(legacy.index) || 0))
        run.page = legacy.page === 'results' ? 'results' : 'questions'
      }
      store.tracks[t].run = run
    }
    return store
  }

  if (data.version === 2 && data.tracks && typeof data.tracks === 'object') {
    const tracks = data.tracks as StudyStoreV2['tracks']
    for (const t of ['network', 'security'] as TrackId[]) {
      const run = tracks[t]?.run
      if (
        !run
        || !Array.isArray(run.questions)
        || !Array.isArray(run.sims)
        || !run.answers
      ) {
        throw new Error(`Backup missing ${t} exam data.`)
      }
    }
    const active = typeof data.active === 'string' && isTrackId(data.active) ? data.active : 'network'
    return {
      version: 2,
      active,
      tracks: {
        network: {
          run: normalizeRun(tracks.network.run!),
          history: (tracks.network.history || []).map(normalizeRun),
        },
        security: {
          run: normalizeRun(tracks.security.run!),
          history: (tracks.security.history || []).map(normalizeRun),
        },
      },
    }
  }

  throw new Error('Unrecognized backup format.')
}

function normalizeRun(run: ExamRun): ExamRun {
  return {
    ...run,
    answers: Object.fromEntries(
      Object.entries(run.answers || {}).map(([k, v]) => [String(k), v]),
    ),
    simData: run.simData || {},
    simGraded: run.simGraded || {},
    sims: run.sims || [],
    questions: run.questions || [],
    page: run.page || 'questions',
    index: run.index || 0,
  }
}

export function exportStore(store: StudyStoreV2) {
  const payload = {
    ...store,
    app: STORAGE_APP_KEY,
    exportedAt: new Date().toISOString(),
  }
  downloadText(
    `comptia-study-backup-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(payload, null, 2),
  )
}
