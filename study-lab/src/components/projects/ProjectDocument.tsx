import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { downloadProjectMarkdown, exportProjectPdf } from '@/lib/project-export'
import { useProjectStore } from '@/store/project-store'
import type {
  ArchitectureDiagram,
  ChallengeSeverity,
  EvidenceKind,
  ProjectDoc,
} from '@/types/project'

const SEVERITY_STYLES: Record<ChallengeSeverity, string> = {
  low: 'border-border text-muted-foreground',
  medium: 'border-warning/50 text-warning',
  high: 'border-[#c97a3a]/70 text-[#f0b27a]',
  critical: 'border-destructive/60 text-destructive',
}

export function ProjectDocument({ project }: { project: ProjectDoc }) {
  const progress = useProjectStore((s) => s.getProgress(project.id))
  const updateProgress = useProjectStore((s) => s.updateProgress)
  const summary = useProjectStore((s) => s.completionSummary(project.id))

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {project.curriculumOrder != null && <Badge>Project #{project.curriculumOrder}</Badge>}
          <Badge>{project.difficulty}</Badge>
          <Badge>{project.certification}</Badge>
          <Badge>{project.category}</Badge>
          <Badge>{project.estimatedHours} hours</Badge>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-display text-3xl font-bold">{project.title}</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => downloadProjectMarkdown(project, progress)}
            >
              Export Markdown
            </Button>
            <Button variant="secondary" onClick={() => exportProjectPdf(project, progress)}>
              Export PDF
            </Button>
          </div>
        </div>
        <p className="max-w-3xl text-muted-foreground">{project.overview}</p>
        <div className="rounded-md border border-warning/40 bg-[#2a2112] px-3 py-2 text-sm text-warning">
          Documentation only. Recommended external tools:{' '}
          <strong>{project.requiredSoftware.join(', ')}</strong>. This app does not simulate networks,
          run Python/SQL, embed Juice Shop, or provision cloud resources — complete hands-on work
          only in the listed external tools (authorized/disposable labs for security practice).
        </div>
        <div className="grid gap-3 rounded-md border border-border bg-[#0f1c2e] p-3 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Self-reported</p>
            <p className="text-sm">
              {summary.selfReported}/{summary.total} checklist items marked by you
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Useful for pacing — does <em>not</em> prove mastery by itself.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-accent">Evidence-based</p>
            <p className="text-sm text-accent">
              {summary.evidenceBased}/{summary.total} items with attached evidence notes/files
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Prefer screenshots, configs, logs, and diagrams from the rubric below.
            </p>
          </div>
        </div>
      </header>

      <Section title="A. Project Overview">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Prior knowledge: {project.priorKnowledge.join('; ')}</li>
          <li>Technologies: {project.technologies.join(', ')}</li>
          <li>Outcomes: {project.outcomes.join('; ')}</li>
          <li>Cert objectives: {project.certObjectives.join(', ')}</li>
          <li>Exam domains: {project.examDomains.join(', ')}</li>
          <li>Career tracks: {project.careerTracks.join(', ')}</li>
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
        <div className="mt-4 space-y-3">
          {(project.architectureDiagrams ?? []).map((diagram) => (
            <ArchitectureBlock key={diagram.id} diagram={diagram} />
          ))}
        </div>
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

      <Section title="Evidence rubric">
        <p className="mb-3 text-sm text-muted-foreground">
          Self-report checkboxes track study pacing. Evidence-based completion requires artifacts that
          match this rubric — screenshots, configs, logs, or diagrams as listed.
        </p>
        <div className="space-y-2">
          {(project.evidenceRubric ?? []).map((item) => (
            <div
              key={item.id}
              className="rounded-md border border-border bg-[#0f1c2e] px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <strong>{item.label}</strong>
                <Badge className={item.requiredForEvidence ? 'text-accent' : ''}>
                  {item.requiredForEvidence ? 'Required for evidence' : 'Optional / self-report OK'}
                </Badge>
                {item.accepts.map((kind) => (
                  <Badge key={kind}>{evidenceKindLabel(kind)}</Badge>
                ))}
              </div>
              <p className="mt-1 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="F. Implementation Milestones">
        <div className="space-y-4">
          {project.milestones.map((m) => {
            const state = progress.milestones.find((x) => x.milestoneId === m.id)
            return (
              <div key={m.id} className="rounded-md border border-border bg-[#0f1c2e] p-3">
                <h4 className="font-semibold">{m.title}</h4>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Tasks</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-sm">
                      {m.tasks.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Acceptance checklist
                    </p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {m.acceptanceCriteria.map((c) => (
                        <li key={c} className="flex gap-2">
                          <span className="mt-0.5 text-accent">□</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {m.hint && (
                  <details className="mt-3 rounded border border-border/70 px-3 py-2 text-sm text-muted-foreground">
                    <summary className="cursor-pointer text-primary">Optional hint (not a full solution)</summary>
                    <p className="mt-2">{m.hint}</p>
                  </details>
                )}
                <div className="mt-3 grid gap-3 rounded-md border border-dashed border-border/80 p-3 sm:grid-cols-2">
                  <label className="flex items-start gap-2 text-sm">
                    <Checkbox
                      className="mt-0.5"
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
                    <span>
                      <span className="font-medium">Self-reported complete</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Your pacing mark only — not portfolio proof.
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-2 text-sm">
                    <Checkbox
                      className="mt-0.5"
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
                    <span>
                      <span className="font-medium text-accent">Evidence attached</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Mark only when a rubric artifact is named below.
                      </span>
                    </span>
                  </label>
                </div>
                <Input
                  className="mt-2"
                  placeholder="Evidence note (screenshot name, Packet Tracer file, config export…)"
                  value={state?.evidenceNote || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    void updateProgress(project.id, (p) => ({
                      ...p,
                      milestones: p.milestones.map((item) =>
                        item.milestoneId === m.id
                          ? {
                              ...item,
                              evidenceNote: value,
                              evidenceAttached: value.trim().length > 0 ? true : item.evidenceAttached,
                            }
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
          {project.troubleshootingChallenges.map((t) => {
            const severity = t.severity ?? 'medium'
            return (
              <li key={t.id} className={`rounded-md border px-3 py-2 ${SEVERITY_STYLES[severity]}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={SEVERITY_STYLES[severity]}>
                    {severity.toUpperCase()}
                  </Badge>
                  <strong className="text-foreground">Symptom:</strong>
                  <span className="text-foreground">{t.symptom}</span>
                </div>
                {t.hint && (
                  <details className="mt-2 text-muted-foreground">
                    <summary className="cursor-pointer text-primary">Optional hint (no full root cause)</summary>
                    <p className="mt-1">{t.hint}</p>
                  </details>
                )}
              </li>
            )
          })}
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
                <div className="mt-2 grid gap-3 rounded-md border border-dashed border-border/80 p-3 sm:grid-cols-2">
                  <label className="flex items-start gap-2 text-sm">
                    <Checkbox
                      className="mt-0.5"
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
                    <span>
                      <span className="font-medium">Mark done (self-report)</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Pacing only — not evidence-based credit.
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-2 text-sm">
                    <Checkbox
                      className="mt-0.5"
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
                    <span>
                      <span className="font-medium text-accent">Evidence on file</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Requires a filename / URL note that matches the rubric.
                      </span>
                    </span>
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
                          ? {
                              ...item,
                              fileName: e.target.value,
                              evidenceAttached: Boolean(e.target.value.trim()),
                            }
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

function ArchitectureBlock({ diagram }: { diagram: ArchitectureDiagram }) {
  return (
    <div className="rounded-md border border-border/80 bg-[#0b1626] p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-semibold">{diagram.title}</h4>
        <Badge>{diagram.kind}</Badge>
      </div>
      {diagram.kind === 'svg' ? (
        <div
          className="overflow-x-auto text-foreground [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: diagram.content }}
        />
      ) : (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-[#07101c] p-3 font-mono text-xs text-muted-foreground">
          {diagram.content}
        </pre>
      )}
      {diagram.caption && (
        <p className="mt-2 text-xs text-muted-foreground">{diagram.caption}</p>
      )}
      {diagram.kind === 'mermaid' && (
        <p className="mt-1 text-xs text-muted-foreground">
          Mermaid source for docs / Draw.io recreation — not an interactive simulator.
        </p>
      )}
    </div>
  )
}

function evidenceKindLabel(kind: EvidenceKind): string {
  switch (kind) {
    case 'screenshot':
      return 'Screenshot'
    case 'config':
      return 'Config'
    case 'log':
      return 'Log'
    case 'diagram':
      return 'Diagram'
    case 'file':
      return 'File'
    case 'self_report':
      return 'Self-report'
  }
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
