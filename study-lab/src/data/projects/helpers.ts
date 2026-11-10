import type {
  ArchitectureDiagram,
  ChallengeSeverity,
  Deliverable,
  EvidenceRubricItem,
  Milestone,
  ProjectDoc,
  TroubleshootingChallenge,
} from '@/types/project'

/** Shared external-tool callouts used across project docs. */
export const TOOLS = {
  packetTracer: 'Cisco Packet Tracer',
  gns3: 'GNS3',
  eveNg: 'EVE-NG (optional)',
  drawio: 'Draw.io',
  wireshark: 'Wireshark',
  spreadsheet: 'Spreadsheet (Excel / Google Sheets)',
  notepad: 'Text editor / notes app',
  proxmox: 'Proxmox VE',
  windowsServer: 'Windows Server (evaluation ISO)',
  hyperV: 'Hyper-V or VirtualBox (host hypervisor)',
  ubuntu: 'Ubuntu Server',
  debian: 'Debian',
  vscode: 'Visual Studio Code',
  python: 'Python 3.x',
  git: 'Git',
  postgres: 'PostgreSQL',
  mysql: 'MySQL / MariaDB',
  sqlite: 'SQLite',
  dbeaver: 'DBeaver or psql / mysql CLI',
  juiceShop: 'OWASP Juice Shop (local disposable lab only)',
  burp: 'Burp Suite Community or browser DevTools (authorized lab only)',
  netmiko: 'Netmiko (pip) + lab network devices / CML / GNS3',
  fastapi: 'FastAPI + Uvicorn (local)',
} as const

const MEASURABLE_NETWORK_ACCEPTANCE = [
  'Topology diagram matches the written scope (device count, links, labels)',
  'Addressing plan has no overlapping networks; usable ranges documented',
  'At least one success and one intentional-failure case captured with screenshots',
]

const MEASURABLE_LAB_ACCEPTANCE = [
  'Written plan matches every technical requirement (checkbox against section C)',
  'External tools and versions listed in the evidence pack',
  'Verification checklist completed with dated notes',
  'At least one failure/edge case documented with root-cause notes (not just “fixed”)',
]

export function standardMilestones(
  designTasks: string[],
  buildTasks: string[],
  verifyTasks: string[],
  hints?: { design?: string; build?: string; verify?: string },
): Milestone[] {
  return [
    {
      id: 'm1',
      title: 'Design & documentation',
      tasks: designTasks,
      acceptanceCriteria: [
        ...MEASURABLE_NETWORK_ACCEPTANCE.slice(0, 2),
        'Port/device role table complete before lab build starts',
      ],
      hint:
        hints?.design ??
        'Name devices and links before opening Packet Tracer; mismatches usually start in the diagram.',
    },
    {
      id: 'm2',
      title: 'External lab build',
      tasks: buildTasks,
      acceptanceCriteria: [
        'Lab built only in listed external tools (no in-app simulator)',
        'Running-config / topology export or equivalent screenshots saved with filenames',
        'Host and gateway addressing match the Section E worksheet exactly',
      ],
      hint:
        hints?.build ??
        'Configure L2 before L3. Capture show/ipconfig outputs as you go — do not wait until the end.',
    },
    {
      id: 'm3',
      title: 'Verification & evidence',
      tasks: verifyTasks,
      acceptanceCriteria: [
        ...MEASURABLE_NETWORK_ACCEPTANCE.slice(2),
        'Ping/traceroute (or track-equivalent) matrix filled with pass/fail marks',
        'Evidence filenames referenced in milestone notes',
      ],
      hint:
        hints?.verify ??
        'Prove both success and a controlled failure. A green ping alone is thin evidence.',
    },
  ]
}

/** Design → implement externally → verify (sysadmin / coding / SQL tracks). */
export function labMilestones(
  designTasks: string[],
  buildTasks: string[],
  verifyTasks: string[],
  labels?: { design?: string; build?: string; verify?: string },
  hints?: { design?: string; build?: string; verify?: string },
): Milestone[] {
  return [
    {
      id: 'm1',
      title: labels?.design ?? 'Design & documentation',
      tasks: designTasks,
      acceptanceCriteria: MEASURABLE_LAB_ACCEPTANCE.slice(0, 2).concat([
        'Success criteria written as observable outputs (commands, row counts, UI states)',
      ]),
      hint:
        hints?.design ??
        'Write the acceptance tests first — what exact output proves each requirement?',
    },
    {
      id: 'm2',
      title: labels?.build ?? 'External implementation',
      tasks: buildTasks,
      acceptanceCriteria: [
        'Work completed only in listed external tools',
        'Screenshots, exports, or source files captured as evidence with stable filenames',
        'README or notes explain how a peer can reproduce the lab externally',
      ],
      hint:
        hints?.build ??
        'Keep a chronological evidence folder (01-design, 02-build, 03-verify) so artifacts stay auditable.',
    },
    {
      id: 'm3',
      title: labels?.verify ?? 'Verification & evidence',
      tasks: verifyTasks,
      acceptanceCriteria: MEASURABLE_LAB_ACCEPTANCE.slice(2).concat([
        'Each technical requirement marked pass/fail with a linked artifact name',
      ]),
      hint:
        hints?.verify ??
        'Retest after fixes and keep the failed attempt — examiners value the troubleshooting path.',
    },
  ]
}

export function standardDeliverables(extras: Deliverable[] = []): Deliverable[] {
  return [
    {
      id: 'd1',
      title: 'Topology diagram',
      description: 'Draw.io or tool export showing devices, links, and VLAN/zone labels.',
    },
    {
      id: 'd2',
      title: 'Addressing & config worksheet',
      description:
        'Completed tables matching the live lab (or explicitly marked N/A for advanced design-only rows).',
    },
    {
      id: 'd3',
      title: 'Verification evidence pack',
      description: 'Commands/screenshots proving success and at least one troubleshooting path.',
    },
    ...extras,
  ]
}

export function codeDeliverables(extras: Deliverable[] = []): Deliverable[] {
  return [
    {
      id: 'd1',
      title: 'Source project folder',
      description: 'VS Code / Git project with README describing how to run externally.',
    },
    {
      id: 'd2',
      title: 'Sample I/O & test notes',
      description: 'Documented inputs, expected outputs, and manual or unit-test results.',
    },
    {
      id: 'd3',
      title: 'Verification evidence pack',
      description: 'Screenshots/terminal logs proving success and at least one edge-case failure handled.',
    },
    ...extras,
  ]
}

export function sqlDeliverables(extras: Deliverable[] = []): Deliverable[] {
  return [
    {
      id: 'd1',
      title: 'Schema & ER diagram',
      description: 'Draw.io ERD plus CREATE scripts for the external database.',
    },
    {
      id: 'd2',
      title: 'Query workbook',
      description: 'SQL scripts with comments, sample data load, and expected result notes.',
    },
    {
      id: 'd3',
      title: 'Verification evidence pack',
      description: 'Query outputs / screenshots proving results and at least one failure case.',
    },
    ...extras,
  ]
}

export function securityDeliverables(extras: Deliverable[] = []): Deliverable[] {
  return [
    {
      id: 'd1',
      title: 'Authorized lab scope statement',
      description:
        'Written confirmation that testing targets only Juice Shop / disposable local labs you own — never production or unauthorized systems.',
    },
    {
      id: 'd2',
      title: 'Findings & remediation notes',
      description: 'Vulnerability write-ups with unsafe vs safe patterns and fix evidence.',
    },
    {
      id: 'd3',
      title: 'Defensive verification pack',
      description: 'Retest evidence showing the issue is mitigated (parameterized queries, least privilege, etc.).',
    },
    ...extras,
  ]
}

export function challenges(
  items: Array<[string, string?, ChallengeSeverity?]>,
): TroubleshootingChallenge[] {
  return items.map(([symptom, hint, severity], i) => ({
    id: `t${i + 1}`,
    symptom,
    hint,
    severity: severity ?? defaultSeverityForIndex(i),
  }))
}

export function defaultSeverityForIndex(index: number): ChallengeSeverity {
  if (index === 0) return 'medium'
  if (index === 1) return 'high'
  if (index >= 2) return 'low'
  return 'medium'
}

export function networkEvidenceRubric(): EvidenceRubricItem[] {
  return [
    {
      id: 'er-topo',
      label: 'Topology / architecture diagram',
      description: 'Labeled Draw.io or Packet Tracer topology export. Self-report alone does not count.',
      accepts: ['diagram', 'screenshot'],
      requiredForEvidence: true,
    },
    {
      id: 'er-addr',
      label: 'Addressing / config worksheet',
      description: 'Filled Section E table or spreadsheet matching the live lab.',
      accepts: ['file', 'screenshot'],
      requiredForEvidence: true,
    },
    {
      id: 'er-verify',
      label: 'Verification screenshots / CLI',
      description: 'Ping matrix, show commands, or Wireshark snippets proving pass and one fail case.',
      accepts: ['screenshot', 'log', 'config'],
      requiredForEvidence: true,
    },
    {
      id: 'er-notes',
      label: 'Personal study notes',
      description: 'Optional reflections — useful, but counts as self-report unless paired with artifacts.',
      accepts: ['self_report', 'file'],
      requiredForEvidence: false,
    },
  ]
}

export function codeEvidenceRubric(): EvidenceRubricItem[] {
  return [
    {
      id: 'er-src',
      label: 'Source / project folder',
      description: 'External VS Code/Git tree with README. Checkbox without files is self-report only.',
      accepts: ['file'],
      requiredForEvidence: true,
    },
    {
      id: 'er-io',
      label: 'Sample I/O or test transcript',
      description: 'Terminal/log output showing expected results and one edge-case failure.',
      accepts: ['log', 'screenshot', 'file'],
      requiredForEvidence: true,
    },
    {
      id: 'er-diagram',
      label: 'Architecture / flow diagram',
      description: 'Module or data-flow diagram for documentation (not a runtime).',
      accepts: ['diagram', 'screenshot'],
      requiredForEvidence: false,
    },
  ]
}

export function sqlEvidenceRubric(): EvidenceRubricItem[] {
  return [
    {
      id: 'er-erd',
      label: 'ER diagram + CREATE scripts',
      description: 'Diagram plus scripts that recreate the schema in an external engine.',
      accepts: ['diagram', 'file'],
      requiredForEvidence: true,
    },
    {
      id: 'er-queries',
      label: 'Query workbook outputs',
      description: 'Scripts with result screenshots or exported CSV proving correctness.',
      accepts: ['file', 'screenshot', 'log'],
      requiredForEvidence: true,
    },
    {
      id: 'er-fail',
      label: 'Failure / optimization note',
      description: 'At least one broken query or EXPLAIN comparison documented.',
      accepts: ['log', 'screenshot', 'file'],
      requiredForEvidence: true,
    },
  ]
}

export function securityEvidenceRubric(): EvidenceRubricItem[] {
  return [
    {
      id: 'er-scope',
      label: 'Authorized lab scope statement',
      description: 'Written scope limiting work to Juice Shop / disposable labs you own.',
      accepts: ['file', 'self_report'],
      requiredForEvidence: true,
    },
    {
      id: 'er-findings',
      label: 'Findings with redacted screenshots',
      description: 'Localhost evidence only — never production targets.',
      accepts: ['screenshot', 'log', 'file'],
      requiredForEvidence: true,
    },
    {
      id: 'er-defend',
      label: 'Defensive retest pack',
      description: 'Evidence that mitigations work (parameterized queries, least privilege, etc.).',
      accepts: ['screenshot', 'log', 'file'],
      requiredForEvidence: true,
    },
  ]
}

export function sysadminEvidenceRubric(): EvidenceRubricItem[] {
  return [
    {
      id: 'er-topo',
      label: 'Lab topology / role diagram',
      description: 'Hosts, roles, and trust boundaries labeled.',
      accepts: ['diagram', 'screenshot'],
      requiredForEvidence: true,
    },
    {
      id: 'er-config',
      label: 'Config exports / MMC / CLI',
      description: 'Screenshots or exported GPOs, DNS zones, user lists, etc.',
      accepts: ['screenshot', 'config', 'log'],
      requiredForEvidence: true,
    },
    {
      id: 'er-verify',
      label: 'Verification checklist evidence',
      description: 'Pass/fail with artifact names; include one intentional failure path.',
      accepts: ['screenshot', 'log', 'file'],
      requiredForEvidence: true,
    },
  ]
}

export function evidenceRubricFor(project: Pick<ProjectDoc, 'certification'>): EvidenceRubricItem[] {
  switch (project.certification) {
    case 'Security+':
      return securityEvidenceRubric()
    case 'Python':
      return codeEvidenceRubric()
    case 'SQL / Database':
      return sqlEvidenceRubric()
    case 'System Administration':
      return sysadminEvidenceRubric()
    default:
      return networkEvidenceRubric()
  }
}

export function mermaidDiagram(
  id: string,
  title: string,
  content: string,
  caption?: string,
): ArchitectureDiagram {
  return { id, title, kind: 'mermaid', content: content.trim(), caption }
}

export function placeholderDiagram(
  id: string,
  title: string,
  description: string,
): ArchitectureDiagram {
  return { id, title, kind: 'placeholder', content: description }
}

export function svgDiagram(
  id: string,
  title: string,
  content: string,
  caption?: string,
): ArchitectureDiagram {
  return { id, title, kind: 'svg', content: content.trim(), caption }
}

export function networkProject(
  doc: Omit<ProjectDoc, 'certification' | 'examDomains'> & {
    certification?: string
    examDomains: string[]
  },
): ProjectDoc {
  return {
    certification: 'Network+',
    ...doc,
  }
}

export function sysadminProject(
  doc: Omit<ProjectDoc, 'certification'> & { certification?: string },
): ProjectDoc {
  return {
    ...doc,
    certification: doc.certification ?? 'System Administration',
    examDomains: doc.examDomains ?? [],
  }
}

export function pythonProject(
  doc: Omit<ProjectDoc, 'certification'> & { certification?: string },
): ProjectDoc {
  return {
    ...doc,
    certification: doc.certification ?? 'Python',
    examDomains: doc.examDomains ?? [],
  }
}

export function sqlProject(
  doc: Omit<ProjectDoc, 'certification'> & { certification?: string },
): ProjectDoc {
  return {
    ...doc,
    certification: doc.certification ?? 'SQL / Database',
    examDomains: doc.examDomains ?? [],
  }
}

export function securityProject(
  doc: Omit<ProjectDoc, 'certification'> & { certification?: string },
): ProjectDoc {
  return {
    ...doc,
    certification: doc.certification ?? 'Security+',
    examDomains: doc.examDomains ?? [],
  }
}

/** Stable sort key so multi-track libraries group by track then curriculum order. */
export const CERT_SORT_ORDER: Record<string, number> = {
  'Network+': 1,
  'Security+': 2,
  'System Administration': 3,
  Python: 4,
  'SQL / Database': 5,
}

export function compareProjects(a: ProjectDoc, b: ProjectDoc): number {
  const ca = CERT_SORT_ORDER[a.certification] ?? 99
  const cb = CERT_SORT_ORDER[b.certification] ?? 99
  if (ca !== cb) return ca - cb
  return (a.curriculumOrder ?? 999) - (b.curriculumOrder ?? 999)
}
