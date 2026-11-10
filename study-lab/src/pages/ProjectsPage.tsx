import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectFiltersBar } from '@/components/projects/ProjectFiltersBar'
import { WeakDomainRecommendations } from '@/components/projects/WeakDomainRecommendations'
import { NETWORK_PLUS_PROJECTS } from '@/data/projects'
import { useProjectStore } from '@/store/project-store'

export function ProjectsPage() {
  const projects = useProjectStore((s) => s.filteredProjects())

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold">Project Library</h2>
        <p className="text-sm text-muted-foreground">
          Instructional documentation only (sections A–J). Hands-on work runs in Packet Tracer, GNS3, and other
          external tools — never inside Study Lab. Network+ progressive set: {NETWORK_PLUS_PROJECTS.length}{' '}
          projects.
        </p>
      </div>
      <WeakDomainRecommendations />
      <ProjectFiltersBar />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {!projects.length && (
          <p className="text-sm text-muted-foreground">No projects match the current filters.</p>
        )}
      </div>
    </div>
  )
}
