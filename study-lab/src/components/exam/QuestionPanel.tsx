import { BANK } from '@/data/banks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getAnswer, hasAnswer, useExamStore } from '@/store/exam-store'
import { cn } from '@/lib/utils'

const LETTERS = ['A', 'B', 'C', 'D']

export function QuestionPanel() {
  const run = useExamStore((s) => s.activeRun())
  const active = useExamStore((s) => s.store.active)
  const answer = useExamStore((s) => s.answer)
  const go = useExamStore((s) => s.go)
  const nextUnanswered = useExamStore((s) => s.nextUnanswered)

  if (!run) return null
  const q = run.questions[run.index]
  const chosen = getAnswer(run, run.index)
  const answered = hasAnswer(run, run.index)
  const topicLabel = BANK[active].topics[q.topic]
  const challenge = q.level === 'challenge'

  return (
    <Card className="min-h-[480px]">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-bold uppercase tracking-wide text-primary">
            {topicLabel}
            {challenge ? ' · Scenario Challenge' : ' · Fundamentals'}
          </span>
          <span className="text-muted-foreground">
            Question {run.index + 1} of {run.questions.length}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {challenge
            ? 'Choose the BEST answer. Multiple choices may sound reasonable, but only one fits every detail. Feedback appears after you answer.'
            : 'Select one answer. Immediate feedback and explanation.'}
        </p>
        <h2 className="text-[clamp(1.2rem,2.35vw,1.65rem)] font-extrabold leading-snug">
          {q.question}
        </h2>
        <div className="grid gap-2.5">
          {q.options.map((label, i) => {
            const isChosen = answered && chosen === i
            const isCorrect = answered && i === q.answer
            const isWrong = answered && isChosen && chosen !== q.answer
            return (
              <button
                key={`${q.id}-${i}`}
                type="button"
                disabled={answered}
                onClick={() => answer(i)}
                className={cn(
                  'flex min-h-14 w-full items-center gap-3 rounded-[11px] border border-border bg-[#182942] px-3 py-3 text-left',
                  !answered && 'hover:border-primary',
                  isCorrect && 'border-[#3b956e] bg-[#133a32]',
                  isWrong && 'border-[#a35c77] bg-[#432b34]',
                )}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#29415c] font-extrabold">
                  {LETTERS[i]}
                </span>
                <span className="flex-1">{label}</span>
              </button>
            )
          })}
        </div>

        {answered && (
          <div
            className={cn(
              'rounded-[11px] border px-3.5 py-3.5 leading-relaxed',
              chosen === q.answer
                ? 'border-[#3e866c] bg-[#10382f]'
                : 'border-[#a45770] bg-[#36232e]',
            )}
          >
            <strong className="mb-1.5 block">
              {chosen === q.answer ? 'Correct' : 'Not quite'}
            </strong>
            {q.explanation}
          </div>
        )}

        <div className="border-t border-border pt-3 text-xs text-muted-foreground">
          Source: {q.source}
        </div>

        <div className="flex flex-wrap justify-between gap-2 pt-2">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => go(run.index - 1)} disabled={run.index === 0}>
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => go(run.index + 1)}
              disabled={run.index >= run.questions.length - 1}
            >
              Next
            </Button>
          </div>
          <Button onClick={nextUnanswered}>Next unanswered</Button>
        </div>
      </CardContent>
    </Card>
  )
}
