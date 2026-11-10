import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeakDomainRecommendations } from '@/components/projects/WeakDomainRecommendations'
import { BANK, CHALLENGE_BANK } from '@/data/banks'
import { NETWORK_PLUS_PROJECTS } from '@/data/projects'

export function HomePage() {
  const networkCount =
    BANK.network.core.length + BANK.network.extra.length + CHALLENGE_BANK.network.length
  const securityCount =
    BANK.security.core.length + BANK.security.extra.length + CHALLENGE_BANK.security.length
  const beginner = NETWORK_PLUS_PROJECTS.filter((p) => p.difficulty === 'beginner').length
  const intermediate = NETWORK_PLUS_PROJECTS.filter((p) => p.difficulty === 'intermediate').length
  const advanced = NETWORK_PLUS_PROJECTS.filter((p) => p.difficulty === 'advanced').length

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <CardContent className="relative space-y-5 p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(61,139,253,0.18),transparent_45%)]" />
            <Badge className="relative">Phase 5 · Network+ curriculum</Badge>
            <h2 className="relative font-display text-3xl font-bold md:text-4xl">
              Study smarter offline — document labs externally.
            </h2>
            <p className="relative max-w-xl text-muted-foreground">
              CompTIA Network+ and Security+ exam engines plus a full {NETWORK_PLUS_PROJECTS.length}-project
              Network+ library (A–J docs). Hands-on work stays in Packet Tracer, GNS3, and other pro tools.
            </p>
            <div className="relative flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/exam">Open Exam Lab</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/projects">Browse projects</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Question banks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Network+: {networkCount} items</p>
              <p>Security+: {securityCount} items</p>
              <p className="text-muted-foreground">Stored as data modules under src/data/</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Network+ Project Library</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                {NETWORK_PLUS_PROJECTS.length} projects · Beginner {beginner} · Intermediate {intermediate} ·
                Advanced {advanced}
              </p>
              <Link to="/projects" className="block text-primary hover:underline">
                Open full progressive set (1–30)
              </Link>
              <div className="space-y-1 pt-1">
                {NETWORK_PLUS_PROJECTS.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.slug}`}
                    className="block text-primary hover:underline"
                  >
                    #{p.curriculumOrder} {p.title}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <WeakDomainRecommendations title="Study next — weak Network+ domains" />
    </div>
  )
}
