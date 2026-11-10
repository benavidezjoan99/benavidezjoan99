import bankJson from './bank.json'
import challengeJson from './challenge-bank.json'
import type { ChallengeBank, QuestionBank, TrackId } from '@/types/exam'

export const BANK = bankJson as QuestionBank
export const CHALLENGE_BANK = challengeJson as ChallengeBank

export const TRACK_LABELS: Record<TrackId, string> = {
  network: 'Network+',
  security: 'Security+',
}

export function getTopics(track: TrackId): string[] {
  return BANK[track].topics
}

export function getDomainWeights(track: TrackId): number[] {
  if (track === 'network') return Array(10).fill(10)
  return [12, 22, 18, 28, 20]
}
