import { BANK } from '@/data/banks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { hasAnswer, useExamStore } from '@/store/exam-store'
import { cn } from '@/lib/utils'

export function ExamSidebar() {
  const run = useExamStore((s) => s.activeRun())
  const active = useExamStore((s) => s.store.active)
  const m = useExamStore((s) => s.sessionMetrics())
  const go = useExamStore((s) => s.go)
  const setPage = useExamStore((s) => s.setPage)

  if (!run || !m) return null
  const total = run.questions.length

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Answered" value={`${m.answered} / ${total}`} />
          <Stat label="Correct" value={String(m.correct)} good />
          <Stat label="Wrong" value={String(m.wrong)} bad />
          <Stat label="Accuracy" value={m.accuracy === null ? '—' : `${m.accuracy}%`} />
          <div className="col-span-2">
            <Progress value={(100 * m.answered) / total} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jump</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="mb-3 h-10 w-full rounded-md border border-border bg-[#10213a] px-2 text-sm"
            defaultValue=""
            onChange={(e) => {
              const topic = Number(e.target.value)
              const i = run.questions.findIndex((q) => q.topic === topic)
              if (i >= 0) go(i)
            }}
          >
            <option value="" disabled>
              Jump to topic…
            </option>
            {BANK[active].topics.map((topic, i) => (
              <option key={topic} value={i}>
                {topic}
              </option>
            ))}
          </select>
          <div className="grid max-h-[230px] grid-cols-7 gap-1.5 overflow-y-auto">
            {run.questions.map((q, i) => {
              const answered = hasAnswer(run, i)
              const correct = answered && run.answers[String(i)] === q.answer
              const wrong = answered && !correct
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => go(i)}
                  className={cn(
                    'min-h-8 rounded-md border border-[#3c4d68] bg-[#1a2d46] text-xs text-muted-foreground',
                    correct && 'border-[#3b956e] bg-[#194636] text-[#c2ffe0]',
                    wrong && 'border-[#a35c77] bg-[#50303e] text-[#ffcad1]',
                    i === run.index && 'outline outline-2 outline-primary',
                  )}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className="mt-3 text-sm text-primary underline"
            onClick={() => setPage('results')}
          >
            View results
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({
  label,
  value,
  good,
  bad,
}: {
  label: string
  value: string
  good?: boolean
  bad?: boolean
}) {
  return (
    <div className="rounded-[13px] border border-border bg-card px-3 py-2">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <strong
        className={cn(
          'text-xl tabular-nums',
          good && 'text-accent',
          bad && 'text-destructive',
        )}
      >
        {value}
      </strong>
    </div>
  )
}
