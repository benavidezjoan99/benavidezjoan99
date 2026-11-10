import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectStore } from '@/store/project-store'
import type { ProjectDoc } from '@/types/project'

export function ProjectCard({ project }: { project: ProjectDoc }) {
  const summary = useProjectStore((s) => s.completionSummary(project.id))

  return (
    <Card className="transition hover:border-primary/60">
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge>{project.difficulty}</Badge>
          <Badge>{project.certification}</Badge>
          <Badge>{project.estimatedHours}h</Badge>
        </div>
        <CardTitle className="pt-2">
          <Link to={`/projects/${project.slug}`} className="hover:text-primary">
            {project.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{project.category}</p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground line-clamp-3">{project.overview}</p>
        <p>
          <span className="text-muted-foreground">External tools: </span>
          {project.requiredSoftware.join(', ')}
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          <span>
            Self-reported {summary.selfReported}/{summary.total}
          </span>
          <span className="text-accent">
            Evidence-based {summary.evidenceBased}/{summary.total}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
