import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useExamStore } from '@/store/exam-store'
import { normalAnswer } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function PbqPanel() {
  const run = useExamStore((s) => s.activeRun())
  const currentSim = useExamStore((s) => s.currentSim)
  const setSimIndex = useExamStore((s) => s.setSimIndex)
  const setSimField = useExamStore((s) => s.setSimField)
  const gradeSim = useExamStore((s) => s.gradeSim)

  if (!run) return null
  if (!run.sims.length) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          This attempt was created without PBQs. Generate a new exam and enable performance-based questions.
        </CardContent>
      </Card>
    )
  }

  const index = Math.min(currentSim, run.sims.length - 1)
  const sim = run.sims[index]
  const done = run.simGraded[sim.id]
  const values = run.simData[sim.id] || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance-based practice</CardTitle>
        <p className="text-sm text-muted-foreground">
          Form-based worksheets only — not Packet Tracer or packet simulation.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {run.sims.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSimIndex(i)}
              className={cn(
                'rounded-md border border-border bg-[#152741] px-3 py-2 text-sm',
                i === index && 'border-primary bg-[#20599c]',
              )}
            >
              {i + 1}. {s.title} {run.simGraded[s.id] ? '✓' : ''}
            </button>
          ))}
        </div>
        <h3 className="text-lg font-semibold">{sim.title}</h3>
        <pre className="whitespace-pre-wrap rounded-md border border-border bg-[#0b1e33] p-3 text-sm leading-relaxed">
          {sim.context}
        </pre>
        <div className="space-y-4">
          {sim.fields.map((field) => {
            const ok = done
              ? normalAnswer(values[field.id] || '') === normalAnswer(field.correct)
              : null
            return (
              <div key={field.id} className="space-y-2">
                <label className="text-sm font-semibold">{field.label}</label>
                {field.choices ? (
                  <select
                    className="h-10 w-full rounded-md border border-border bg-[#10213a] px-2 text-sm"
                    disabled={Boolean(done)}
                    value={values[field.id] || ''}
                    onChange={(e) => setSimField(sim.id, field.id, e.target.value)}
                  >
                    <option value="">Select an answer</option>
                    {field.choices.map((choice) => (
                      <option key={choice} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    disabled={Boolean(done)}
                    placeholder="Enter your answer"
                    value={values[field.id] || ''}
                    onChange={(e) => setSimField(sim.id, field.id, e.target.value)}
                  />
                )}
                {done && (
                  <div
                    className={cn(
                      'rounded-md border px-3 py-2 text-sm',
                      ok ? 'border-[#3e866c] bg-[#10382f]' : 'border-[#a45770] bg-[#36232e]',
                    )}
                  >
                    {ok ? '✓ Correct. ' : `× Correct answer: ${field.correct}. `}
                    {field.why}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {done ? (
          <p className="text-sm text-accent">
            Scored {done.correct}/{done.total} fields correctly.
          </p>
        ) : (
          <Button
            onClick={() => {
              try {
                gradeSim(sim.id)
              } catch (err) {
                alert(err instanceof Error ? err.message : 'Cannot grade yet')
              }
            }}
          >
            Grade simulation
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
