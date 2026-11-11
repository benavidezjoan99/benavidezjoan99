import type {
  ArchitectureDiagram,
  Milestone,
  ProjectDoc,
  TroubleshootingChallenge,
} from '@/types/project'
import {
  defaultSeverityForIndex,
  evidenceRubricFor,
  mermaidDiagram,
  placeholderDiagram,
} from './helpers'

/** Ensure every project has UX fields needed by Project Library polish. */
export function enrichProject(project: ProjectDoc): ProjectDoc {
  const milestones = strengthenMilestones(project.milestones)
  const troubleshootingChallenges = withSeverities(project.troubleshootingChallenges)
  const evidenceRubric = project.evidenceRubric?.length
    ? project.evidenceRubric
    : evidenceRubricFor(project)
  const architectureDiagrams = project.architectureDiagrams?.length
    ? project.architectureDiagrams
    : defaultDiagrams(project)

  return {
    ...project,
    milestones,
    troubleshootingChallenges,
    evidenceRubric,
    architectureDiagrams,
  }
}

export function enrichProjects(projects: ProjectDoc[]): ProjectDoc[] {
  return projects.map(enrichProject)
}

function withSeverities(items: TroubleshootingChallenge[]): TroubleshootingChallenge[] {
  return items.map((item, i) => ({
    ...item,
    severity: item.severity ?? defaultSeverityForIndex(i),
  }))
}

function strengthenMilestones(milestones: Milestone[]): Milestone[] {
  return milestones.map((m) => {
    const acceptanceCriteria = ensureMeasurableAcceptance(m)
    const hint = m.hint ?? defaultMilestoneHint(m)
    return { ...m, acceptanceCriteria, hint }
  })
}

function ensureMeasurableAcceptance(m: Milestone): string[] {
  const criteria = [...m.acceptanceCriteria]
  const joined = criteria.join(' ').toLowerCase()
  const thin =
    criteria.length < 2 ||
    criteria.every((c) => c.split(/\s+/).length < 6) ||
    (!joined.includes('screenshot') &&
      !joined.includes('evidence') &&
      !joined.includes('document') &&
      !joined.includes('pass') &&
      !joined.includes('fail') &&
      !joined.includes('export') &&
      !joined.includes('verify'))

  if (!thin) return criteria

  const extras = [
    `Observable check for “${m.title}”: record the exact command/UI state that proves success`,
    'Attach at least one screenshot, config export, or log filename in the evidence note',
    'Document one intentional failure or edge case related to this milestone',
  ]
  for (const extra of extras) {
    if (!criteria.some((c) => c.toLowerCase() === extra.toLowerCase())) {
      criteria.push(extra)
    }
  }
  return criteria
}

function defaultMilestoneHint(m: Milestone): string {
  const title = m.title.toLowerCase()
  if (title.includes('design') || title.includes('scope') || title.includes('ethic')) {
    return 'Freeze the written plan and success criteria before changing the lab — prevent scope drift.'
  }
  if (title.includes('build') || title.includes('implement') || title.includes('lab')) {
    return 'Work only in the listed external tools. Capture evidence as you configure, not after teardown.'
  }
  if (title.includes('verif') || title.includes('evidence') || title.includes('retest')) {
    return 'Mark each acceptance criterion pass/fail with an artifact name — avoid unchecked self-report.'
  }
  return 'Keep hints high-level: isolate layer/domain first, then gather evidence before changing many settings.'
}

function defaultDiagrams(project: ProjectDoc): ArchitectureDiagram[] {
  const cert = project.certification
  const order = project.curriculumOrder ?? 0
  const idBase = `${project.id}-arch`

  if (cert === 'Network+') {
    if (order <= 2) {
      return [
        mermaidDiagram(
          `${idBase}-lan`,
          'Logical star LAN (documentation)',
          `flowchart LR
  PC1[PC-1] --> SW[Access Switch]
  PC2[PC-2] --> SW
  PRT[Printer] --> SW
  SW --> RTR[Edge Gateway]
  RTR --> ISP((ISP))`,
          'Documentation-only Mermaid — rebuild in Packet Tracer / Draw.io externally.',
        ),
      ]
    }
    if (order <= 8) {
      return [
        mermaidDiagram(
          `${idBase}-vlan`,
          'VLAN segmentation sketch',
          `flowchart TB
  subgraph Access
    U[Users VLAN] --- S[Access Switch]
    V[Servers VLAN] --- S
    M[Mgmt VLAN] --- S
  end
  S -->|802.1Q trunk| L3[Router / L3 hop]
  L3 --> UGW[Users GW]
  L3 --> SGW[Servers GW]`,
          'Replace labels with your Section E addressing; export a real Draw.io for the portfolio.',
        ),
      ]
    }
    if (order <= 20) {
      return [
        mermaidDiagram(
          `${idBase}-campus`,
          'Campus / routed sketch',
          `flowchart LR
  Access[Access Layer] --> Dist[Distribution]
  Dist --> Core[Core / Edge]
  Core --> WAN((WAN / ISP))
  Dist --> Svc[Services VLAN]`,
          'High-level documentation placeholder — flesh out device hostnames in Draw.io.',
        ),
      ]
    }
    return [
      mermaidDiagram(
        `${idBase}-enterprise`,
        'Enterprise zones (docs only)',
        `flowchart TB
  Users[User Zone] --> FW[Firewall / Edge]
  Servers[Server Zone] --> FW
  Mgmt[Mgmt / Jump] --> FW
  FW --> Ext((External))`,
        'Use as a starting outline; advanced labs should attach a detailed Draw.io.',
      ),
    ]
  }

  if (cert === 'System Administration') {
    return [
      mermaidDiagram(
        `${idBase}-ad`,
        'Identity / host roles',
        `flowchart LR
  Admin[Admin Workstation] --> DC[Domain Controller]
  DC --> File[File / DNS / DHCP roles]
  Client[Domain Client] --> DC
  Hyper[Hypervisor host] --> DC
  Hyper --> Guest[Guest VMs]`,
        'Documentation sketch — implement only on evaluation VMs you control.',
      ),
    ]
  }

  if (cert === 'Python') {
    return [
      mermaidDiagram(
        `${idBase}-py`,
        'External Python workflow',
        `flowchart LR
  VS[VS Code] --> Py[Python 3.x]
  Py --> Lib[Libs / Netmiko / FastAPI]
  Lib --> Target[Lab devices / local API / DB]
  Py --> Out[Logs / reports]`,
        'No in-app runner — execute only in your local toolchain.',
      ),
    ]
  }

  if (cert === 'SQL / Database') {
    return [
      mermaidDiagram(
        `${idBase}-sql`,
        'Schema documentation sketch',
        `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT ||--o{ LINE_ITEM : listed`,
        'Replace entities with your project schema; create the real DB in Postgres/MySQL/SQLite externally.',
      ),
    ]
  }

  if (cert === 'Security+') {
    return [
      mermaidDiagram(
        `${idBase}-sec`,
        'Authorized lab trust boundary',
        `flowchart LR
  Learner[Learner browser] --> JS[Juice Shop localhost]
  JS --> DB[(Embedded DB)]
  Forbidden[Production / unauthorized] -.->|FORBIDDEN| Learner`,
        'AUTHORIZED LAB ONLY — never point tooling at systems you do not own.',
      ),
    ]
  }

  return [
    placeholderDiagram(
      `${idBase}-placeholder`,
      'Architecture diagram placeholder',
      project.architectureNotes ||
        'Add a Draw.io export covering devices, trust boundaries, and data flows for this project.',
    ),
  ]
}
