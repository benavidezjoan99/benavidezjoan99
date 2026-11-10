import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { recommendProjectsFromWeakDomains } from '@/lib/project-recommendations'
import { useExamStore } from '@/store/exam-store'

export function WeakDomainRecommendations({
  title = 'Recommended projects from weak domains',
}: {
  title?: string
}) {
  const track = useExamStore((s) => s.store.active)
  const domains = useExamStore((s) => s.domains())
  const recommendations =
    track === 'network' ? recommendProjectsFromWeakDomains(domains) : []

  if (track !== 'network') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Switch the exam track to Network+ and answer questions to unlock project recommendations
          mapped to weak domains. Security+ project mapping arrives in a later phase.
        </CardContent>
      </Card>
    )
  }

  if (!recommendations.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Complete Network+ exam questions to surface weak domains. Recommendations never auto-complete
          projects — attach evidence after you finish labs in Packet Tracer, GNS3, or other external tools.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Guidance only based on current session accuracy. Self-reported checkboxes are not proof of skill.
        </p>
        {recommendations.map((rec) => (
          <div key={rec.domain} className="rounded-md border border-border p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-medium">{rec.domain}</span>
              <Badge>{rec.accuracy}% session accuracy</Badge>
              <span className="text-xs text-muted-foreground">
                {rec.answered}/{rec.total} answered in session
              </span>
            </div>
            {rec.projects.length ? (
              <ul className="space-y-1 text-sm">
                {rec.projects.map((p) => (
                  <li key={p.id}>
                    <Link to={`/projects/${p.slug}`} className="text-primary hover:underline">
                      #{p.curriculumOrder} {p.title}
                    </Link>
                    <span className="text-muted-foreground"> · {p.difficulty} · {p.estimatedHours}h</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No mapped projects for this domain yet.</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
