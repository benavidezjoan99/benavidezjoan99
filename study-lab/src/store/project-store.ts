import { create } from 'zustand'
import { loadAllProjectProgress, saveProjectProgress } from '@/db'
import { SAMPLE_PROJECTS } from '@/data/projects'
import type {
  ProjectDoc,
  ProjectFilters,
  ProjectProgress,
} from '@/types/project'

function emptyProgress(projectId: string, project: ProjectDoc): ProjectProgress {
  return {
    projectId,
    notes: '',
    solutionRevealed: false,
    milestones: project.milestones.map((m) => ({
      milestoneId: m.id,
      selfReportedComplete: false,
      evidenceAttached: false,
    })),
    deliverables: project.portfolioDeliverables.map((d) => ({
      deliverableId: d.id,
      selfReportedComplete: false,
      evidenceAttached: false,
    })),
    updatedAt: new Date().toISOString(),
  }
}

interface ProjectStoreState {
  ready: boolean
  projects: ProjectDoc[]
  progressById: Record<string, ProjectProgress>
  filters: ProjectFilters
  hydrate: () => Promise<void>
  setFilters: (partial: Partial<ProjectFilters>) => void
  filteredProjects: () => ProjectDoc[]
  getProgress: (projectId: string) => ProjectProgress
  updateProgress: (projectId: string, updater: (p: ProjectProgress) => ProjectProgress) => Promise<void>
  completionSummary: (projectId: string) => {
    selfReported: number
    evidenceBased: number
    total: number
  }
}

const defaultFilters: ProjectFilters = {
  query: '',
  certification: 'all',
  difficulty: 'all',
  technology: 'all',
  requiredSoftware: 'all',
  maxHours: null,
  careerTrack: 'all',
}

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  ready: false,
  projects: SAMPLE_PROJECTS,
  progressById: {},
  filters: defaultFilters,

  hydrate: async () => {
    const rows = await loadAllProjectProgress()
    const map: Record<string, ProjectProgress> = {}
    for (const row of rows) map[row.projectId] = row
    set({ progressById: map, ready: true })
  },

  setFilters: (partial) => {
    set((state) => ({ filters: { ...state.filters, ...partial } }))
  },

  filteredProjects: () => {
    const { projects, filters } = get()
    const q = filters.query.trim().toLowerCase()
    return projects.filter((p) => {
      if (q) {
        const hay = [
          p.title,
          p.overview,
          p.category,
          ...p.technologies,
          ...p.requiredSoftware,
        ].join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filters.certification !== 'all' && p.certification !== filters.certification) return false
      if (filters.difficulty !== 'all' && p.difficulty !== filters.difficulty) return false
      if (filters.technology !== 'all' && !p.technologies.includes(filters.technology)) return false
      if (filters.requiredSoftware !== 'all' && !p.requiredSoftware.includes(filters.requiredSoftware)) return false
      if (filters.maxHours != null && p.estimatedHours > filters.maxHours) return false
      if (filters.careerTrack !== 'all' && !p.careerTracks.includes(filters.careerTrack)) return false
      return true
    })
  },

  getProgress: (projectId) => {
    const existing = get().progressById[projectId]
    if (existing) return existing
    const project = get().projects.find((p) => p.id === projectId)
    if (!project) {
      return {
        projectId,
        notes: '',
        solutionRevealed: false,
        milestones: [],
        deliverables: [],
        updatedAt: new Date().toISOString(),
      }
    }
    return emptyProgress(projectId, project)
  },

  updateProgress: async (projectId, updater) => {
    const current = get().getProgress(projectId)
    const next = updater({ ...current })
    next.updatedAt = new Date().toISOString()
    await saveProjectProgress(next)
    set((state) => ({
      progressById: { ...state.progressById, [projectId]: next },
    }))
  },

  completionSummary: (projectId) => {
    const progress = get().getProgress(projectId)
    const items = [...progress.milestones, ...progress.deliverables]
    const total = items.length
    const selfReported = items.filter((i) => i.selfReportedComplete).length
    const evidenceBased = items.filter((i) => i.evidenceAttached).length
    return { selfReported, evidenceBased, total }
  },
}))
