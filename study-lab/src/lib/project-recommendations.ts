import { SAMPLE_PROJECTS } from '@/data/projects'
import type { DomainMetric } from '@/types/exam'
import type { ProjectDoc } from '@/types/project'

export interface WeakDomainRecommendation {
  domain: string
  accuracy: number | null
  answered: number
  total: number
  projects: ProjectDoc[]
}

function domainAccuracy(d: DomainMetric): number | null {
  if (!d.answered) return null
  return Math.round((100 * d.correct) / d.answered)
}

/**
 * Recommend Network+ projects from weak exam domains.
 * Weak = answered domains with accuracy below `threshold`, or the lowest
 * accuracy domains when none fall under the threshold (still answered).
 * Never marks projects complete — recommendations are study guidance only.
 */
export function recommendProjectsFromWeakDomains(
  domains: DomainMetric[],
  options?: { threshold?: number; limitPerDomain?: number; maxDomains?: number },
): WeakDomainRecommendation[] {
  const threshold = options?.threshold ?? 70
  const limitPerDomain = options?.limitPerDomain ?? 3
  const maxDomains = options?.maxDomains ?? 3

  const answered = domains.filter((d) => d.answered > 0)
  if (!answered.length) return []

  const scored = answered
    .map((d) => ({ domain: d, accuracy: domainAccuracy(d) }))
    .filter((x) => x.accuracy != null) as Array<{ domain: DomainMetric; accuracy: number }>

  if (!scored.length) return []

  let weak = scored.filter((x) => x.accuracy < threshold)
  if (!weak.length) {
    const min = Math.min(...scored.map((x) => x.accuracy))
    weak = scored.filter((x) => x.accuracy === min)
  }

  weak.sort((a, b) => a.accuracy - b.accuracy)

  return weak.slice(0, maxDomains).map(({ domain, accuracy }) => {
    const matches = SAMPLE_PROJECTS.filter((p) =>
      p.examDomains.some((label) => label === domain.label),
    )
      .slice()
      .sort((a, b) => (a.curriculumOrder ?? 999) - (b.curriculumOrder ?? 999))
      .slice(0, limitPerDomain)

    return {
      domain: domain.label,
      accuracy,
      answered: domain.answered,
      total: domain.total,
      projects: matches,
    }
  })
}

/** Map a CompTIA objective code fragment to curriculum projects. */
export function recommendProjectsForObjectives(
  objectiveCodes: string[],
  limit = 6,
): ProjectDoc[] {
  const needles = objectiveCodes.map((c) => c.trim().toLowerCase()).filter(Boolean)
  if (!needles.length) return []
  const scored = SAMPLE_PROJECTS.map((p) => {
    const hits = p.certObjectives.filter((o) =>
      needles.some((n) => o.toLowerCase().includes(n)),
    ).length
    return { p, hits }
  })
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits || (a.p.curriculumOrder ?? 0) - (b.p.curriculumOrder ?? 0))
  return scored.slice(0, limit).map((x) => x.p)
}
