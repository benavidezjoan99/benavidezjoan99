import type { ProjectDoc } from '@/types/project'
import { enrichProjects } from './enrich'
import { compareProjects } from './helpers'
import { beginnerProjects } from './network-plus/beginner'
import { intermediateProjects } from './network-plus/intermediate'
import { advancedProjects } from './network-plus/advanced'
import { sysadminProjects } from './sysadmin'
import { pythonProjects } from './python'
import { sqlProjects } from './sql'
import { securityProjects } from './security'

/** Full Network+ progressive curriculum (projects 1–30). */
export const NETWORK_PLUS_PROJECTS: ProjectDoc[] = enrichProjects(
  [...beginnerProjects, ...intermediateProjects, ...advancedProjects].sort(
    (a, b) => (a.curriculumOrder ?? 0) - (b.curriculumOrder ?? 0),
  ),
)

export const SYSADMIN_PROJECTS: ProjectDoc[] = enrichProjects(
  [...sysadminProjects].sort((a, b) => (a.curriculumOrder ?? 0) - (b.curriculumOrder ?? 0)),
)

export const PYTHON_PROJECTS: ProjectDoc[] = enrichProjects(
  [...pythonProjects].sort((a, b) => (a.curriculumOrder ?? 0) - (b.curriculumOrder ?? 0)),
)

export const SQL_PROJECTS: ProjectDoc[] = enrichProjects(
  [...sqlProjects].sort((a, b) => (a.curriculumOrder ?? 0) - (b.curriculumOrder ?? 0)),
)

export const SECURITY_PLUS_PROJECTS: ProjectDoc[] = enrichProjects(
  [...securityProjects].sort((a, b) => (a.curriculumOrder ?? 0) - (b.curriculumOrder ?? 0)),
)

/** All instructional projects available in Project Library. */
export const SAMPLE_PROJECTS: ProjectDoc[] = [
  ...NETWORK_PLUS_PROJECTS,
  ...SECURITY_PLUS_PROJECTS,
  ...SYSADMIN_PROJECTS,
  ...PYTHON_PROJECTS,
  ...SQL_PROJECTS,
].sort(compareProjects)

export function getProjectBySlug(slug: string): ProjectDoc | undefined {
  return SAMPLE_PROJECTS.find((p) => p.slug === slug)
}

export function getProjectById(id: string): ProjectDoc | undefined {
  return SAMPLE_PROJECTS.find((p) => p.id === id)
}

export function getProjectsByCertification(certification: string): ProjectDoc[] {
  return SAMPLE_PROJECTS.filter((p) => p.certification === certification)
}

export function getProjectsForObjective(objectiveCode: string): ProjectDoc[] {
  const needle = objectiveCode.trim().toLowerCase()
  return SAMPLE_PROJECTS.filter((p) =>
    p.certObjectives.some((o) => o.toLowerCase().includes(needle)),
  )
}

export function getProjectsForExamDomain(domainLabel: string): ProjectDoc[] {
  const needle = domainLabel.trim().toLowerCase()
  return SAMPLE_PROJECTS.filter((p) =>
    p.examDomains.some((d) => d.toLowerCase() === needle),
  )
}

export function projectTrackCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const p of SAMPLE_PROJECTS) {
    counts[p.certification] = (counts[p.certification] ?? 0) + 1
  }
  return counts
}
