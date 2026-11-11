import type { ProjectDoc, ProjectProgress } from '@/types/project'

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function esc(text: string): string {
  return text.replace(/\|/g, '\\|')
}

/** Build a full A–J Markdown document for portfolio / notes export. */
export function projectToMarkdown(
  project: ProjectDoc,
  progress?: ProjectProgress,
): string {
  const lines: string[] = []
  const push = (...parts: string[]) => {
    lines.push(...parts)
  }

  push(
    `# ${project.title}`,
    '',
    `- Certification: ${project.certification}`,
    `- Difficulty: ${project.difficulty}`,
    `- Category: ${project.category}`,
    `- Estimated hours: ${project.estimatedHours}`,
    project.curriculumOrder != null ? `- Curriculum order: #${project.curriculumOrder}` : '',
    `- Required software (external): ${project.requiredSoftware.join(', ')}`,
    `- Technologies: ${project.technologies.join(', ')}`,
    `- Cert objectives: ${project.certObjectives.join(', ') || '—'}`,
    `- Exam domains: ${project.examDomains.join(', ') || '—'}`,
    `- Career tracks: ${project.careerTracks.join(', ')}`,
    '',
    '> Documentation only. Study Lab does not simulate networks, run code/SQL, or provision cloud resources.',
    '',
    '## A. Project Overview',
    '',
    project.overview,
    '',
    `**Prior knowledge:** ${project.priorKnowledge.join('; ')}`,
    '',
    `**Outcomes:** ${project.outcomes.join('; ')}`,
    '',
    '## B. Business Scenario',
    '',
    project.businessScenario,
    '',
    '## C. Technical Requirements',
    '',
    ...project.technicalRequirements.map((r) => `- ${r}`),
    '',
    '## D. Network / System Architecture',
    '',
    project.architectureNotes,
    '',
  )

  for (const diagram of project.architectureDiagrams ?? []) {
    push(`### ${diagram.title}`, '')
    if (diagram.kind === 'mermaid') {
      push('```mermaid', diagram.content, '```', '')
    } else if (diagram.kind === 'svg') {
      push('```svg', diagram.content, '```', '')
    } else {
      push(diagram.content, '')
    }
    if (diagram.caption) push(`_${diagram.caption}_`, '')
  }

  push(
    '## E. Addressing and Configuration Plan',
    '',
    '| Name | Network | Mask | Gateway | VLAN | Notes |',
    '| --- | --- | --- | --- | --- | --- |',
    ...project.addressingPlan.map(
      (row) =>
        `| ${esc(row.name)} | ${esc(row.network)} | ${esc(row.mask)} | ${esc(row.gateway || '—')} | ${esc(row.vlan || '—')} | ${esc(row.notes || '—')} |`,
    ),
    '',
    '## F. Implementation Milestones',
    '',
  )

  for (const m of project.milestones) {
    const state = progress?.milestones.find((x) => x.milestoneId === m.id)
    push(`### ${m.title}`, '')
    push('**Tasks**', ...m.tasks.map((t) => `- ${t}`), '')
    push('**Acceptance criteria**', ...m.acceptanceCriteria.map((c) => `- [ ] ${c}`), '')
    if (m.hint) push(`<details><summary>Optional hint</summary>`, '', m.hint, '', `</details>`, '')
    if (state) {
      push(
        `- Self-reported: ${state.selfReportedComplete ? 'yes' : 'no'}`,
        `- Evidence attached: ${state.evidenceAttached ? 'yes' : 'no'}`,
        state.evidenceNote ? `- Evidence note: ${state.evidenceNote}` : '',
        '',
      )
    }
  }

  push('## G. Verification and Troubleshooting', '', ...project.verificationSteps.map((s) => `- ${s}`), '')

  push('## H. Troubleshooting Challenges', '')
  for (const t of project.troubleshootingChallenges) {
    push(
      `- **[${(t.severity ?? 'medium').toUpperCase()}]** ${t.symptom}${t.hint ? ` _(hint available in app)_` : ''}`,
    )
  }
  push('')

  push(
    '## I. Solution Guide',
    '',
    progress?.solutionRevealed
      ? project.solutionGuide
      : '_Solution guide hidden in export unless revealed in the app. Open the project and reveal intentionally._',
    '',
  )

  push('## J. Portfolio Deliverables', '')
  for (const d of project.portfolioDeliverables) {
    const state = progress?.deliverables.find((x) => x.deliverableId === d.id)
    push(`### ${d.title}`, '', d.description, '')
    if (state) {
      push(
        `- Self-reported: ${state.selfReportedComplete ? 'yes' : 'no'}`,
        `- Evidence on file: ${state.evidenceAttached ? 'yes' : 'no'}`,
        state.fileName ? `- Filename: ${state.fileName}` : '',
        '',
      )
    }
  }

  if (project.evidenceRubric?.length) {
    push('## Evidence Rubric', '')
    push(
      '| Artifact | Counts as evidence? | Accepts | Description |',
      '| --- | --- | --- | --- |',
      ...project.evidenceRubric.map(
        (r) =>
          `| ${esc(r.label)} | ${r.requiredForEvidence ? 'Required for evidence-based' : 'Optional / self-report OK'} | ${r.accepts.join(', ')} | ${esc(r.description)} |`,
      ),
      '',
    )
  }

  if (progress?.notes) {
    push('## Study notes', '', progress.notes, '')
  }

  push(
    '---',
    `Exported from IT Study Lab Pro · ${new Date().toISOString()}`,
    '',
  )

  return lines.filter((line) => line !== undefined).join('\n')
}

export function downloadProjectMarkdown(project: ProjectDoc, progress?: ProjectProgress) {
  const md = projectToMarkdown(project, progress)
  const filename = `${project.slug || project.id}-study-lab.md`
  downloadBlob(filename, new Blob([md], { type: 'text/markdown;charset=utf-8' }))
}

function projectToPrintableHtml(project: ProjectDoc, progress?: ProjectProgress): string {
  const md = projectToMarkdown(project, progress)
  const escaped = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${project.title} — Study Lab export</title>
  <style>
    :root { color-scheme: light; }
    body {
      font-family: "Source Serif 4", Georgia, "Times New Roman", serif;
      margin: 24px auto;
      max-width: 820px;
      line-height: 1.45;
      color: #122033;
    }
    h1 { font-size: 1.8rem; margin-bottom: 0.4rem; }
    pre {
      white-space: pre-wrap;
      word-break: break-word;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 12px;
      background: #f4f7fb;
      border: 1px solid #d5dee8;
      padding: 16px;
      border-radius: 8px;
    }
    .meta { color: #445566; font-size: 0.9rem; margin-bottom: 1rem; }
    @media print {
      body { margin: 12mm; }
      pre { border: none; background: transparent; padding: 0; }
    }
  </style>
</head>
<body>
  <h1>${project.title}</h1>
  <p class="meta">${project.certification} · ${project.difficulty} · ${project.estimatedHours}h · external tools only</p>
  <p class="meta">Use your browser’s Print → Save as PDF. Diagrams appear as Mermaid source in the Markdown block.</p>
  <pre>${escaped}</pre>
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => window.print(), 250);
    });
  </script>
</body>
</html>`
}

/** Opens a print-ready HTML document so the learner can Save as PDF offline. */
export function exportProjectPdf(project: ProjectDoc, progress?: ProjectProgress) {
  const html = projectToPrintableHtml(project, progress)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank', 'noopener,noreferrer')
  if (!win) {
    // Popup blocked — fall back to downloading the HTML for manual print.
    downloadBlob(`${project.slug || project.id}-study-lab-print.html`, blob)
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
