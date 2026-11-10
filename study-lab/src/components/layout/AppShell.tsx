import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, Calculator, ChartColumn, FolderKanban, Home, Import, Download } from 'lucide-react'
import { useExamStore } from '@/store/exam-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/exam', label: 'Exam Lab', icon: BookOpen },
  { to: '/projects', label: 'Project Library', icon: FolderKanban },
  { to: '/tools', label: 'Tools', icon: Calculator },
  { to: '/analytics', label: 'Analytics', icon: ChartColumn },
]

export function AppShell() {
  const lastSavedAt = useExamStore((s) => s.lastSavedAt)
  const saving = useExamStore((s) => s.saving)
  const doExport = useExamStore((s) => s.doExport)
  const doImport = useExamStore((s) => s.doImport)

  return (
    <div className="mx-auto flex min-h-screen max-w-[1450px] flex-col px-4 py-6 md:px-6">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
            Offline-first certification prep
          </p>
          <h1 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] font-bold tracking-tight">
            IT Study Lab Pro
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Exam engines, analytics, and a documentation-first Project Library. Hands-on work stays in Packet Tracer, GNS3, Proxmox, and cloud consoles — not inside this app.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('text-xs', saving ? 'text-warning' : 'text-accent')}>
            {saving
              ? '● Saving…'
              : lastSavedAt
                ? `● Saved ${new Date(lastSavedAt).toLocaleTimeString()}`
                : '● Ready'}
          </span>
          <Button variant="secondary" size="sm" onClick={() => doExport()}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <label>
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  void doImport(file).catch((err: Error) => alert(`Cannot import backup: ${err.message}`))
                }
                e.target.value = ''
              }}
            />
            <Button variant="secondary" size="sm" asChild>
              <span className="cursor-pointer">
                <Import className="h-3.5 w-3.5" /> Import
              </span>
            </Button>
          </label>
        </div>
      </header>

      <nav className="mb-5 flex flex-wrap gap-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-[#152741] px-3 text-sm font-semibold',
                isActive && 'border-[#5b9ee8] bg-[#20599c] text-white',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
