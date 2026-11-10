import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrackSwitcher } from '@/components/exam/TrackSwitcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useExamStore } from '@/store/exam-store'

export function AnalyticsPage() {
  const m = useExamStore((s) => s.sessionMetrics())
  const domains = useExamStore((s) => s.domains())
  const history = useExamStore((s) => s.store.tracks[s.store.active].history)
  const run = useExamStore((s) => s.activeRun())

  const chartData = domains.map((d) => ({
    name: d.label.length > 18 ? `${d.label.slice(0, 16)}…` : d.label,
    correct: d.correct,
    total: d.total,
    answered: d.answered,
  }))

  const historyScores = [...history, ...(run ? [run] : [])].map((r) => {
    const answered = Object.keys(r.answers).length
    const correct = r.questions.filter((q, i) => r.answers[String(i)] === q.answer).length
    return {
      id: r.id,
      label: new Date(r.date).toLocaleDateString(),
      accuracy: answered ? Math.round((correct / answered) * 100) : 0,
      mode: r.mode === 'challenge' ? 'Challenge' : 'Fundamentals',
    }
  })

  return (
    <div className="space-y-4">
      <TrackSwitcher />
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Answered" value={m ? `${m.answered}` : '—'} />
        <Metric title="Correct" value={m ? `${m.correct}` : '—'} />
        <Metric title="Wrong" value={m ? `${m.wrong}` : '—'} />
        <Metric title="Accuracy" value={m?.accuracy == null ? '—' : `${m.accuracy}%`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Domain performance (current session)</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5a" />
                <XAxis dataKey="name" tick={{ fill: '#9db0c9', fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
                <YAxis tick={{ fill: '#9db0c9', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#101c2e', border: '1px solid #2a3f5a' }}
                />
                <Bar dataKey="correct" fill="#3d8bfd" name="Correct" radius={4} />
                <Bar dataKey="answered" fill="#1a9f75" name="Answered" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">No domain data yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attempt accuracy history</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {historyScores.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5a" />
                <XAxis dataKey="label" tick={{ fill: '#9db0c9', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#9db0c9', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#101c2e', border: '1px solid #2a3f5a' }}
                />
                <Bar dataKey="accuracy" fill="#70ddb0" name="Accuracy %" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Generate exams to build history charts.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}
