import type {
  Deliverable,
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

export function standardMilestones(
  designTasks: string[],
  buildTasks: string[],
  verifyTasks: string[],
): Milestone[] {
  return [
    {
      id: 'm1',
      title: 'Design & documentation',
      tasks: designTasks,
      acceptanceCriteria: [
        'Topology diagram matches the written scope',
        'Addressing plan has no overlapping networks',
      ],
    },
    {
      id: 'm2',
      title: 'External lab build',
      tasks: buildTasks,
      acceptanceCriteria: [
        'Lab built only in listed external tools',
        'Screenshots or config exports captured as evidence',
      ],
    },
    {
      id: 'm3',
      title: 'Verification & evidence',
      tasks: verifyTasks,
      acceptanceCriteria: [
        'Verification checklist completed',
        'At least one failed case documented with root cause notes',
      ],
    },
  ]
}

/** Design → implement externally → verify (sysadmin / coding / SQL tracks). */
export function labMilestones(
  designTasks: string[],
  buildTasks: string[],
  verifyTasks: string[],
  labels?: { design?: string; build?: string; verify?: string },
): Milestone[] {
  return [
    {
      id: 'm1',
      title: labels?.design ?? 'Design & documentation',
      tasks: designTasks,
      acceptanceCriteria: [
        'Written plan matches the project requirements',
        'External tools and versions listed',
      ],
    },
    {
      id: 'm2',
      title: labels?.build ?? 'External implementation',
      tasks: buildTasks,
      acceptanceCriteria: [
        'Work completed only in listed external tools',
        'Screenshots, exports, or source files captured as evidence',
      ],
    },
    {
      id: 'm3',
      title: labels?.verify ?? 'Verification & evidence',
      tasks: verifyTasks,
      acceptanceCriteria: [
        'Verification checklist completed',
        'At least one failure/edge case documented with root cause notes',
      ],
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
  items: Array<[string, string?]>,
): TroubleshootingChallenge[] {
  return items.map(([symptom, hint], i) => ({
    id: `t${i + 1}`,
    symptom,
    hint,
  }))
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
