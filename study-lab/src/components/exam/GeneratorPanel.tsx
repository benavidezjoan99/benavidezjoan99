import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useExamStore } from '@/store/exam-store'
import type { ExamMode } from '@/types/exam'

export function GeneratorPanel() {
  const startNew = useExamStore((s) => s.startNew)
  const run = useExamStore((s) => s.activeRun())
  const [size, setSize] = useState(50)
  const [mode, setMode] = useState<ExamMode>('challenge')
  const [includeSims, setIncludeSims] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate exam</CardTitle>
      </CardHeader>
      <CardContent className="grid max-w-xl gap-4">
        <div>
          <Label htmlFor="exam-size">Question count</Label>
          <select
            id="exam-size"
            className="mt-1 h-10 w-full rounded-md border border-border bg-[#10213a] px-2"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {[25, 50, 75, 90, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="exam-mode">Difficulty</Label>
          <select
            id="exam-mode"
            className="mt-1 h-10 w-full rounded-md border border-border bg-[#10213a] px-2"
            value={mode}
            onChange={(e) => setMode(e.target.value as ExamMode)}
          >
            <option value="challenge">Scenario Challenge</option>
            <option value="fundamentals">Fundamentals</option>
          </select>
        </div>
        <div>
          <Label htmlFor="include-sims">Include PBQs</Label>
          <select
            id="include-sims"
            className="mt-1 h-10 w-full rounded-md border border-border bg-[#10213a] px-2"
            value={includeSims ? 'yes' : 'no'}
            onChange={(e) => setIncludeSims(e.target.value === 'yes')}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <Button
          onClick={() => {
            const answered = run ? Object.keys(run.answers).length : 0
            const simFilled = run ? Object.keys(run.simData).length : 0
            if (answered || simFilled) {
              if (!confirm('Archive your current exam and create a new one? Your answers will be preserved in History.')) {
                return
              }
            }
            try {
              startNew(size, mode, includeSims)
            } catch (err) {
              alert(err instanceof Error ? err.message : 'Failed to generate exam')
            }
          }}
        >
          Generate new exam
        </Button>
      </CardContent>
    </Card>
  )
}
