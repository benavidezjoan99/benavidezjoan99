import type { ProjectDoc } from '@/types/project'
import { beginnerProjects } from './network-plus/beginner'
import { intermediateProjects } from './network-plus/intermediate'
import { advancedProjects } from './network-plus/advanced'

/** Full Network+ progressive curriculum (projects 1–30). */
export const NETWORK_PLUS_PROJECTS: ProjectDoc[] = [
  ...beginnerProjects,
  ...intermediateProjects,
  ...advancedProjects,
].sort((a, b) => (a.curriculumOrder ?? 0) - (b.curriculumOrder ?? 0))

/** All instructional projects available in Project Library. */
export const SAMPLE_PROJECTS: ProjectDoc[] = NETWORK_PLUS_PROJECTS

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
