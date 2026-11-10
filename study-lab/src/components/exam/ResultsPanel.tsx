import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAnswer, hasAnswer, useExamStore } from '@/store/exam-store'

export function ResultsPanel() {
  const run = useExamStore((s) => s.activeRun())
  const m = useExamStore((s) => s.sessionMetrics())
  const domains = useExamStore((s) => s.domains())
  const go = useExamStore((s) => s.go)

  if (!run || !m) return null
  const total = run.questions.length

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {m.answered === total
              ? 'Completed multiple-choice section.'
              : `In progress · ${total - m.answered} unanswered question(s).`}
          </p>
          <p className="text-2xl font-bold">
            {m.correct} / {total} correct · {m.accuracy === null ? '—' : `${m.accuracy}%`} accuracy
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Domain breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {domains.map((d) => (
            <div key={d.topic}>
              <div className="mb-1 flex justify-between gap-3 text-sm">
                <span>{d.label}</span>
                <strong>
                  {d.correct}/{d.total} · {d.answered} answered
                </strong>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#243752]">
                <div
                  className="h-full bg-gradient-to-r from-[#4f91ed] to-[#70ddb0]"
                  style={{ width: `${(100 * d.correct) / d.total}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Missed questions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {run.questions.map((q, i) => {
            const ans = getAnswer(run, i)
            if (!hasAnswer(run, i) || ans === q.answer) return null
            return (
              <Button key={q.id} size="sm" variant="secondary" onClick={() => go(i)}>
                {i + 1}
              </Button>
            )
          })}
          {!run.questions.some((q, i) => hasAnswer(run, i) && getAnswer(run, i) !== q.answer) && (
            <p className="text-sm text-muted-foreground">No misses yet.</p>
          )}
        </CardContent>
      </Card>

      {run.sims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>PBQ scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {run.sims.map((sim) => {
              const grade = run.simGraded[sim.id]
              return (
                <div key={sim.id} className="flex justify-between border-b border-border py-2">
                  <span>{sim.title}</span>
                  <strong>{grade ? `${grade.correct}/${grade.total}` : 'Not graded'}</strong>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
