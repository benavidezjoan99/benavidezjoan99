import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BANK, CHALLENGE_BANK } from '@/data/banks'
import { SAMPLE_PROJECTS } from '@/data/projects'

export function HomePage() {
  const networkCount =
    BANK.network.core.length + BANK.network.extra.length + CHALLENGE_BANK.network.length
  const securityCount =
    BANK.security.core.length + BANK.security.extra.length + CHALLENGE_BANK.security.length

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Card className="overflow-hidden">
        <CardContent className="relative space-y-5 p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(61,139,253,0.18),transparent_45%)]" />
          <Badge className="relative">Phases 1–4 foundation</Badge>
          <h2 className="relative font-display text-3xl font-bold md:text-4xl">
            Study smarter offline — document labs externally.
          </h2>
          <p className="relative max-w-xl text-muted-foreground">
            Migrated CompTIA Network+ and Security+ exam engines with full question banks, PBQ worksheets,
            subnet tools, history, and analytics. New Project Library shell uses sections A–J with
            self-reported vs evidence-based progress.
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
            <CardTitle>Sample projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {SAMPLE_PROJECTS.map((p) => (
              <Link key={p.id} to={`/projects/${p.slug}`} className="block text-primary hover:underline">
                {p.title}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
