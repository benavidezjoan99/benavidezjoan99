import Dexie, { type EntityTable } from 'dexie'
import { DEXIE_DB_NAME, STORAGE_APP_KEY, STORAGE_LEGACY_PREFIX } from '@/db/keys'
import { blankTrack, runChallengeInitial, runOriginal } from '@/lib/exam-engine'
import type { StudyStoreV2, TrackId } from '@/types/exam'
import type { ProjectProgress } from '@/types/project'

export interface StudyMetaRow {
  id: string
  value: StudyStoreV2
}

export interface ProjectProgressRow extends ProjectProgress {
  id: string
}

class StudyLabDB extends Dexie {
  studyStore!: EntityTable<StudyMetaRow, 'id'>
  projectProgress!: EntityTable<ProjectProgressRow, 'id'>

  constructor() {
    super(DEXIE_DB_NAME)
    this.version(1).stores({
      studyStore: 'id',
      projectProgress: 'id, projectId, updatedAt',
    })
  }
}

export const db = new StudyLabDB()

const STUDY_ROW_ID = 'primary'

function readLegacyLocalStorage(): StudyStoreV2 | null {
  try {
    const raw = localStorage.getItem(STORAGE_APP_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StudyStoreV2
      if (parsed?.version === 2 && parsed.tracks?.network && parsed.tracks?.security) {
        return parsed
      }
    }
  } catch {
    // ignore corrupt local payload
  }

  const store: StudyStoreV2 = {
    version: 2,
    active: 'network',
    tracks: {
      network: blankTrack(),
      security: blankTrack(),
    },
  }

  let migrated = false
  for (const track of ['network', 'security'] as TrackId[]) {
    try {
      const legacyRaw = localStorage.getItem(`${STORAGE_LEGACY_PREFIX}-${track}`)
      if (!legacyRaw) continue
      const old = JSON.parse(legacyRaw) as {
        answers?: Record<string, number>
        index?: number
        page?: string
      }
      const run = runOriginal(track)
      for (const [k, v] of Object.entries(old.answers || {})) {
        const idx = Number(k)
        if (Number.isInteger(idx) && idx >= 0 && idx < 100 && Number.isInteger(v) && v >= 0 && v < 4) {
          run.answers[String(idx)] = v
        }
      }
      run.index = Math.min(99, Math.max(0, Number(old.index) || 0))
      run.page = old.page === 'results' ? 'results' : 'questions'
      store.tracks[track].run = run
      migrated = true
    } catch {
      // skip broken legacy track
    }
  }

  return migrated ? store : null
}

export function createDefaultStore(): StudyStoreV2 {
  return {
    version: 2,
    active: 'network',
    tracks: {
      network: { run: runChallengeInitial('network'), history: [] },
      security: { run: runChallengeInitial('security'), history: [] },
    },
  }
}

export async function loadStudyStore(): Promise<StudyStoreV2> {
  const existing = await db.studyStore.get(STUDY_ROW_ID)
  if (existing?.value?.version === 2) return existing.value

  const fromLocal = readLegacyLocalStorage()
  const store = fromLocal ?? createDefaultStore()
  await saveStudyStore(store)
  return store
}

export async function saveStudyStore(store: StudyStoreV2): Promise<void> {
  const payload: StudyStoreV2 = { ...store, version: 2 }
  await db.studyStore.put({ id: STUDY_ROW_ID, value: payload })
  try {
    localStorage.setItem(STORAGE_APP_KEY, JSON.stringify(payload))
  } catch {
    // Dexie remains source of truth if localStorage quota fails
  }
}

export async function loadAllProjectProgress(): Promise<ProjectProgress[]> {
  const rows = await db.projectProgress.toArray()
  return rows.map(({ id: _id, ...rest }) => rest)
}

export async function saveProjectProgress(progress: ProjectProgress): Promise<void> {
  await db.projectProgress.put({
    id: progress.projectId,
    ...progress,
    updatedAt: new Date().toISOString(),
  })
}
