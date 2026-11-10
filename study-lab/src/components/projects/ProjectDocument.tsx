import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useProjectStore } from '@/store/project-store'
import type { ProjectDoc } from '@/types/project'

export function ProjectDocument({ project }: { project: ProjectDoc }) {
  const progress = useProjectStore((s) => s.getProgress(project.id))
  const updateProgress = useProjectStore((s) => s.updateProgress)
  const summary = useProjectStore((s) => s.completionSummary(project.id))

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge>{project.difficulty}</Badge>
          <Badge>{project.certification}</Badge>
          <Badge>{project.category}</Badge>
          <Badge>{project.estimatedHours} hours</Badge>
        </div>
        <h2 className="font-display text-3xl font-bold">{project.title}</h2>
        <p className="max-w-3xl text-muted-foreground">{project.overview}</p>
        <div className="rounded-md border border-warning/40 bg-[#2a2112] px-3 py-2 text-sm text-warning">
          Documentation only. Complete labs in: {project.requiredSoftware.join(', ')}. This app does not simulate networks or provision cloud resources.
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <span>Self-reported completion: {summary.selfReported}/{summary.total}</span>
          <span className="text-accent">
            Evidence-based completion: {summary.evidenceBased}/{summary.total}
          </span>
        </div>
      </header>

      <Section title="A. Project Overview">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Prior knowledge: {project.priorKnowledge.join('; ')}</li>
          <li>Technologies: {project.technologies.join(', ')}</li>
          <li>Outcomes: {project.outcomes.join('; ')}</li>
          <li>Cert objectives: {project.certObjectives.join(', ')}</li>
        </ul>
      </Section>

      <Section title="B. Business Scenario">
        <p className="text-sm leading-relaxed">{project.businessScenario}</p>
      </Section>

      <Section title="C. Technical Requirements">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {project.technicalRequirements.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Section>

      <Section title="D. Network / System Architecture">
        <p className="text-sm leading-relaxed">{project.architectureNotes}</p>
      </Section>

      <Section title="E. Addressing and Configuration Plan">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Network</th>
                <th className="py-2 pr-3">Mask</th>
                <th className="py-2 pr-3">Gateway</th>
                <th className="py-2 pr-3">VLAN</th>
                <th className="py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {project.addressingPlan.map((row) => (
                <tr key={row.name} className="border-b border-border/60">
                  <td className="py-2 pr-3">{row.name}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{row.network}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{row.mask}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{row.gateway || '—'}</td>
                  <td className="py-2 pr-3">{row.vlan || '—'}</td>
                  <td className="py-2">{row.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="F. Implementation Milestones">
        <div className="space-y-4">
          {project.milestones.map((m) => {
            const state = progress.milestones.find((x) => x.milestoneId === m.id)
            return (
              <div key={m.id} className="rounded-md border border-border bg-[#0f1c2e] p-3">
                <h4 className="font-semibold">{m.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">Tasks: {m.tasks.join(' · ')}</p>
                <p className="mt-1 text-xs">Acceptance: {m.acceptanceCriteria.join(' · ')}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={Boolean(state?.selfReportedComplete)}
                      onCheckedChange={(checked) => {
                        void updateProgress(project.id, (p) => ({
                          ...p,
                          milestones: p.milestones.map((item) =>
                            item.milestoneId === m.id
                              ? {
                                  ...item,
                                  selfReportedComplete: Boolean(checked),
                                  completedAt: checked ? new Date().toISOString() : item.completedAt,
                                }
                              : item,
                          ),
                        }))
                      }}
                    />
                    Self-reported complete
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={Boolean(state?.evidenceAttached)}
                      onCheckedChange={(checked) => {
                        void updateProgress(project.id, (p) => ({
                          ...p,
                          milestones: p.milestones.map((item) =>
                            item.milestoneId === m.id
                              ? { ...item, evidenceAttached: Boolean(checked) }
                              : item,
                          ),
                        }))
                      }}
                    />
                    Evidence attached
                  </label>
                </div>
                <Input
                  className="mt-2"
                  placeholder="Evidence note (screenshot name, Packet Tracer file, etc.)"
                  value={state?.evidenceNote || ''}
                  onChange={(e) => {
                    void updateProgress(project.id, (p) => ({
                      ...p,
                      milestones: p.milestones.map((item) =>
                        item.milestoneId === m.id
                          ? { ...item, evidenceNote: e.target.value }
                          : item,
                      ),
                    }))
                  }}
                />
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="G. Verification and Troubleshooting">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {project.verificationSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Section>

      <Section title="H. Troubleshooting Challenges">
        <ul className="space-y-2 text-sm">
          {project.troubleshootingChallenges.map((t) => (
            <li key={t.id} className="rounded-md border border-border px-3 py-2">
              <strong>Symptom:</strong> {t.symptom}
              {t.hint && (
                <details className="mt-1 text-muted-foreground">
                  <summary className="cursor-pointer text-primary">Optional hint</summary>
                  {t.hint}
                </details>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="I. Solution Guide">
        {progress.solutionRevealed ? (
          <p className="text-sm leading-relaxed">{project.solutionGuide}</p>
        ) : (
          <Button
            variant="secondary"
            onClick={() => {
              void updateProgress(project.id, (p) => ({ ...p, solutionRevealed: true }))
            }}
          >
            Reveal solution guide
          </Button>
        )}
      </Section>

      <Section title="J. Portfolio Deliverables">
        <div className="space-y-3">
          {project.portfolioDeliverables.map((d) => {
            const state = progress.deliverables.find((x) => x.deliverableId === d.id)
            return (
              <div key={d.id} className="rounded-md border border-border p-3">
                <h4 className="font-semibold">{d.title}</h4>
                <p className="text-sm text-muted-foreground">{d.description}</p>
                <div className="mt-2 flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={Boolean(state?.selfReportedComplete)}
                      onCheckedChange={(checked) => {
                        void updateProgress(project.id, (p) => ({
                          ...p,
                          deliverables: p.deliverables.map((item) =>
                            item.deliverableId === d.id
                              ? { ...item, selfReportedComplete: Boolean(checked) }
                              : item,
                          ),
                        }))
                      }}
                    />
                    Mark done (self-report)
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={Boolean(state?.evidenceAttached)}
                      onCheckedChange={(checked) => {
                        void updateProgress(project.id, (p) => ({
                          ...p,
                          deliverables: p.deliverables.map((item) =>
                            item.deliverableId === d.id
                              ? { ...item, evidenceAttached: Boolean(checked) }
                              : item,
                          ),
                        }))
                      }}
                    />
                    Evidence on file
                  </label>
                </div>
                <Input
                  className="mt-2"
                  placeholder="Evidence filename or URL note"
                  value={state?.fileName || ''}
                  onChange={(e) => {
                    void updateProgress(project.id, (p) => ({
                      ...p,
                      deliverables: p.deliverables.map((item) =>
                        item.deliverableId === d.id
                          ? { ...item, fileName: e.target.value, evidenceAttached: Boolean(e.target.value) }
                          : item,
                      ),
                    }))
                  }}
                />
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Study notes">
        <Textarea
          value={progress.notes}
          placeholder="Personal notes for this project…"
          onChange={(e) => {
            void updateProgress(project.id, (p) => ({ ...p, notes: e.target.value }))
          }}
        />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
        <Separator className="mt-4" />
      </CardContent>
    </Card>
  )
}
