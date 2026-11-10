import type {
  Deliverable,
  Milestone,
  ProjectDoc,
  TroubleshootingChallenge,
} from '@/types/project'

/** Shared external-tool callouts used across Network+ docs. */
export const TOOLS = {
  packetTracer: 'Cisco Packet Tracer',
  gns3: 'GNS3',
  eveNg: 'EVE-NG (optional)',
  drawio: 'Draw.io',
  wireshark: 'Wireshark',
  spreadsheet: 'Spreadsheet (Excel / Google Sheets)',
  notepad: 'Text editor / notes app',
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
      description: 'Completed tables matching the live lab (or explicitly marked N/A for advanced design-only rows).',
    },
    {
      id: 'd3',
      title: 'Verification evidence pack',
      description: 'Commands/screenshots proving success and at least one troubleshooting path.',
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
