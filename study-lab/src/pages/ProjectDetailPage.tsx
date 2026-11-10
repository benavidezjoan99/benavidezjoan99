import { Link, useParams } from 'react-router-dom'
import { ProjectDocument } from '@/components/projects/ProjectDocument'
import { Button } from '@/components/ui/button'
import { getProjectBySlug } from '@/data/projects'

export function ProjectDetailPage() {
  const { slug } = useParams()
  const project = slug ? getProjectBySlug(slug) : undefined

  if (!project) {
    return (
      <div className="space-y-3">
        <p>Project not found.</p>
        <Button asChild variant="secondary">
          <Link to="/projects">Back to library</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button asChild variant="secondary" size="sm">
        <Link to="/projects">← Project Library</Link>
      </Button>
      <ProjectDocument project={project} />
    </div>
  )
}
