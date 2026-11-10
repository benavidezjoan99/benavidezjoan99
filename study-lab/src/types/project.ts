export type ProjectDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type CareerTrack =
  | 'network-engineer'
  | 'system-administrator'
  | 'cloud-engineer'
  | 'platform-engineer'
  | 'devops-engineer'
  | 'cybersecurity-engineer'
  | 'cloud-solutions-architect'

export interface Milestone {
  id: string
  title: string
  tasks: string[]
  acceptanceCriteria: string[]
}

export interface TroubleshootingChallenge {
  id: string
  symptom: string
  hint?: string
}

export interface Deliverable {
  id: string
  title: string
  description: string
}

export interface AddressingRow {
  name: string
  network: string
  mask: string
  gateway?: string
  vlan?: string
  notes?: string
}

export interface ProjectDoc {
  id: string
  slug: string
  title: string
  /** Progressive curriculum order within a certification track (1–30 for Network+). */
  curriculumOrder?: number
  certification: string
  difficulty: ProjectDifficulty
  category: string
  estimatedHours: number
  technologies: string[]
  requiredSoftware: string[]
  priorKnowledge: string[]
  outcomes: string[]
  careerTracks: CareerTrack[]
  /** CompTIA objective codes, e.g. N10-009 2.1 */
  certObjectives: string[]
  /** Exam bank domain labels used for weak-domain project recommendations. */
  examDomains: string[]
  overview: string
  businessScenario: string
  technicalRequirements: string[]
  architectureNotes: string
  addressingPlan: AddressingRow[]
  milestones: Milestone[]
  verificationSteps: string[]
  troubleshootingChallenges: TroubleshootingChallenge[]
  solutionGuide: string
  portfolioDeliverables: Deliverable[]
}

/** Self-reported checklist vs evidence-backed completion. */
export type CompletionKind = 'self_reported' | 'evidence_based'

export interface MilestoneProgress {
  milestoneId: string
  selfReportedComplete: boolean
  evidenceAttached: boolean
  evidenceNote?: string
  completedAt?: string
}

export interface DeliverableProgress {
  deliverableId: string
  selfReportedComplete: boolean
  evidenceAttached: boolean
  evidenceNote?: string
  fileName?: string
  completedAt?: string
}

export interface ProjectProgress {
  projectId: string
  notes: string
  solutionRevealed: boolean
  milestones: MilestoneProgress[]
  deliverables: DeliverableProgress[]
  updatedAt: string
}

export interface ProjectFilters {
  query: string
  certification: string
  difficulty: ProjectDifficulty | 'all'
  technology: string
  requiredSoftware: string
  maxHours: number | null
  careerTrack: CareerTrack | 'all'
}
