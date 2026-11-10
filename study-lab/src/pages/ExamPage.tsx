import { useEffect } from 'react'
import { GeneratorPanel } from '@/components/exam/GeneratorPanel'
import { ExamSidebar } from '@/components/exam/ExamSidebar'
import { HistoryPanel } from '@/components/exam/HistoryPanel'
import { PbqPanel } from '@/components/exam/PbqPanel'
import { QuestionPanel } from '@/components/exam/QuestionPanel'
import { ResultsPanel } from '@/components/exam/ResultsPanel'
import { TrackSwitcher } from '@/components/exam/TrackSwitcher'
import { Button } from '@/components/ui/button'
import { useExamStore } from '@/store/exam-store'
import type { ExamPage as ExamPageId } from '@/types/exam'
import { cn } from '@/lib/utils'

const pages: { id: ExamPageId; label: string }[] = [
  { id: 'questions', label: 'Questions' },
  { id: 'simulations', label: 'PBQs' },
  { id: 'results', label: 'Results' },
  { id: 'generator', label: 'Generator' },
  { id: 'history', label: 'History' },
]

export function ExamPage() {
  const run = useExamStore((s) => s.activeRun())
  const setPage = useExamStore((s) => s.setPage)
  const go = useExamStore((s) => s.go)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!run || run.page !== 'questions') return
      if (e.altKey && e.key === 'ArrowRight') go(run.index + 1)
      if (e.altKey && e.key === 'ArrowLeft') go(run.index - 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [run, go])

  if (!run) {
    return <p className="text-muted-foreground">Loading exam session…</p>
  }

  return (
    <div className="space-y-4">
      <TrackSwitcher />
      <div className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <Button
            key={p.id}
            size="sm"
            variant={run.page === p.id ? 'default' : 'secondary'}
            className={cn(run.page === p.id && 'ring-1 ring-primary')}
            onClick={() => setPage(p.id)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {run.page === 'questions' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_350px]">
          <QuestionPanel />
          <ExamSidebar />
        </div>
      )}
      {run.page === 'simulations' && <PbqPanel />}
      {run.page === 'results' && <ResultsPanel />}
      {run.page === 'generator' && <GeneratorPanel />}
      {run.page === 'history' && <HistoryPanel />}
    </div>
  )
}
