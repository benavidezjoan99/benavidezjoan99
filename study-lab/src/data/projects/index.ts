import type { ProjectDoc } from '@/types/project'
import { projectCampusCore } from './campus-core'
import { projectBranchSase } from './branch-sase'
import { projectLabVlan } from './lab-vlan'

export const SAMPLE_PROJECTS: ProjectDoc[] = [
  projectLabVlan,
  projectCampusCore,
  projectBranchSase,
]

export function getProjectBySlug(slug: string): ProjectDoc | undefined {
  return SAMPLE_PROJECTS.find((p) => p.slug === slug)
}
