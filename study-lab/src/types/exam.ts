export type TrackId = 'network' | 'security'

export type ExamMode = 'fundamentals' | 'challenge'

export type ExamPage =
  | 'questions'
  | 'simulations'
  | 'results'
  | 'generator'
  | 'history'

export interface Question {
  id: string
  question: string
  options: string[]
  answer: number
  explanation: string
  topic: number
  source: string
  level?: 'challenge' | string
}

export interface TrackBank {
  topics: string[]
  material: string
  core: Question[]
  extra: Question[]
}

export type QuestionBank = Record<TrackId, TrackBank>
export type ChallengeBank = Record<TrackId, Question[]>

export interface PbqField {
  id: string
  label: string
  correct: string
  choices: string[] | null
  why: string
}

export interface PbqScenario {
  id: string
  title: string
  context: string
  fields: PbqField[]
}

export interface SimGrade {
  correct: number
  total: number
}

export interface ExamRun {
  id: string
  date: string
  questions: Question[]
  answers: Record<string, number>
  index: number
  page: ExamPage
  sims: PbqScenario[]
  simData: Record<string, Record<string, string>>
  simGraded: Record<string, SimGrade>
  mode?: ExamMode | string
}

export interface TrackState {
  run: ExamRun | null
  history: ExamRun[]
}

export interface StudyStoreV2 {
  version: 2
  active: TrackId
  tracks: Record<TrackId, TrackState>
  app?: string
  exportedAt?: string
}

export interface SessionMetrics {
  correct: number
  answered: number
  wrong: number
  accuracy: number | null
}

export interface DomainMetric {
  topic: number
  label: string
  correct: number
  answered: number
  total: number
}
