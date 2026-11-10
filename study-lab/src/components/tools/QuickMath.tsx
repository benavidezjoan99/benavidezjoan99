import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { quickMath } from '@/lib/math'

export function QuickMath() {
  const [expr, setExpr] = useState('256-2')
  const [out, setOut] = useState('254')

  function run() {
    try {
      setOut(String(quickMath(expr)))
    } catch (err) {
      setOut(err instanceof Error ? err.message : 'Error')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick math</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="math-input">Expression (+ − × ÷ and parentheses)</Label>
          <Input
            id="math-input"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
          />
        </div>
        <Button onClick={run}>Evaluate</Button>
        <p className="rounded-md border border-border bg-[#0b1e33] px-3 py-2 font-mono text-sm">
          {out}
        </p>
      </CardContent>
    </Card>
  )
}
