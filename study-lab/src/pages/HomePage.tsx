import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeakDomainRecommendations } from '@/components/projects/WeakDomainRecommendations'
import { BANK, CHALLENGE_BANK } from '@/data/banks'
import {
  NETWORK_PLUS_PROJECTS,
  PYTHON_PROJECTS,
  SAMPLE_PROJECTS,
  SECURITY_PLUS_PROJECTS,
  SQL_PROJECTS,
  SYSADMIN_PROJECTS,
} from '@/data/projects'

export function HomePage() {
  const networkCount =
    BANK.network.core.length + BANK.network.extra.length + CHALLENGE_BANK.network.length
  const securityCount =
    BANK.security.core.length + BANK.security.extra.length + CHALLENGE_BANK.security.length

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <CardContent className="relative space-y-5 p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(61,139,253,0.18),transparent_45%)]" />
            <Badge className="relative">Phase 6 · Multi-track projects</Badge>
            <h2 className="relative font-display text-3xl font-bold md:text-4xl">
              Study smarter offline — document labs externally.
            </h2>
            <p className="relative max-w-xl text-muted-foreground">
              CompTIA Network+ and Security+ exam engines plus a {SAMPLE_PROJECTS.length}-project
              library (Network+, Security+, System Administration, Python, SQL). Hands-on work stays
              in Packet Tracer, Proxmox, VS Code, PostgreSQL, Juice Shop, and other pro tools.
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
              <CardTitle>Project Library tracks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Network+: {NETWORK_PLUS_PROJECTS.length}</p>
              <p>Security+: {SECURITY_PLUS_PROJECTS.length}</p>
              <p>System Administration: {SYSADMIN_PROJECTS.length}</p>
              <p>Python: {PYTHON_PROJECTS.length}</p>
              <p>SQL / Database: {SQL_PROJECTS.length}</p>
              <Link to="/projects" className="block text-primary hover:underline">
                Open full library ({SAMPLE_PROJECTS.length})
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      <WeakDomainRecommendations title="Study next — weak exam domains" />
    </div>
  )
}
