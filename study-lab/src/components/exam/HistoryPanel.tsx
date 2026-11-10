import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { metrics, useExamStore } from '@/store/exam-store'

export function HistoryPanel() {
  const active = useExamStore((s) => s.store.active)
  const history = useExamStore((s) => s.store.tracks[s.store.active].history)
  const reopenHistory = useExamStore((s) => s.reopenHistory)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam history · {active === 'network' ? 'Network+' : 'Security+'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!history.length && (
          <p className="text-sm text-muted-foreground">
            No archived sessions yet. Generate a new exam to archive this attempt.
          </p>
        )}
        {[...history].reverse().map((r) => {
          const m = metrics(r)
          return (
            <div key={r.id} className="rounded-md border border-border bg-[#132338] p-3">
              <strong className="block text-sm">
                {new Date(r.date).toLocaleString()} · {r.questions.length} questions ·{' '}
                {r.mode === 'challenge' ? 'Scenario Challenge' : 'Fundamentals'}
              </strong>
              <p className="mt-1 text-xs text-muted-foreground">
                {m.correct}/{m.answered} correct among answered · {m.answered}/{r.questions.length} answered
              </p>
              <Button className="mt-2" size="sm" variant="secondary" onClick={() => reopenHistory(r.id)}>
                Open this session
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
