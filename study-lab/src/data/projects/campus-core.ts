import type { ProjectDoc } from '@/types/project'

export const projectCampusCore: ProjectDoc = {
  id: 'net-09-campus-core',
  slug: 'campus-core-distribution',
  title: 'Campus Core & Distribution Design Doc',
  certification: 'Network+',
  difficulty: 'intermediate',
  category: 'Routing & Switching',
  estimatedHours: 8,
  technologies: ['OSPF', 'HSRP/VRRP', 'EtherChannel', 'VLANs'],
  requiredSoftware: ['Cisco Packet Tracer', 'GNS3', 'Draw.io'],
  priorKnowledge: ['VLANs and trunks', 'Static routing', 'Basic subnetting'],
  outcomes: [
    'Document a collapsed or three-tier campus with redundant distribution',
    'Specify FHRP intent for gateway resiliency',
    'Produce milestone acceptance tests without running a built-in simulator',
  ],
  careerTracks: ['network-engineer', 'platform-engineer'],
  certObjectives: ['N10-009 2.2', 'N10-009 3.1', 'N10-009 3.2'],
  overview:
    'Create an implementation package for a small campus: access, distribution, and optional core. You will implement in Packet Tracer or GNS3 externally; Study Lab stores the plan, checklists, and evidence.',
  businessScenario:
    'A growing training academy needs predictable classroom VLANs, a redundant default gateway, and clear change documentation before weekend labs. The network team must deliver a design packet a junior tech can follow.',
  technicalRequirements: [
    'Document access → distribution uplinks (prefer EtherChannel wording)',
    'At least two distribution nodes with FHRP virtual gateway',
    'Classroom VLANs with summarized routes northbound',
    'Out-of-band or dedicated management path documented',
    'Change window and rollback notes',
  ],
  architectureNotes:
    'Prefer a diagram with dual distribution switches, access stacks, and a firewall/edge. Annotate FHRP VIP and OSPF areas if used. Keep diagrams documentation-only.',
  addressingPlan: [
    { name: 'Classroom A', network: '10.40.10.0/24', mask: '255.255.255.0', gateway: '10.40.10.1 (VIP)', vlan: '110' },
    { name: 'Classroom B', network: '10.40.20.0/24', mask: '255.255.255.0', gateway: '10.40.20.1 (VIP)', vlan: '120' },
    { name: 'Servers', network: '10.40.50.0/24', mask: '255.255.255.0', gateway: '10.40.50.1 (VIP)', vlan: '150' },
    { name: 'Point-to-point Dist', network: '10.255.0.0/30', mask: '255.255.255.252', notes: 'Dist-A ↔ Dist-B' },
  ],
  milestones: [
    {
      id: 'm1',
      title: 'Logical design',
      tasks: ['Select tier model', 'Define VLANs', 'Choose FHRP'],
      acceptanceCriteria: ['VIP per user VLAN documented', 'Uplink redundancy described'],
    },
    {
      id: 'm2',
      title: 'Routing plan',
      tasks: ['Choose OSPF or static', 'Summarize classroom ranges'],
      acceptanceCriteria: ['Northbound summary written', 'Failure domain notes included'],
    },
    {
      id: 'm3',
      title: 'Lab evidence',
      tasks: ['Build in Packet Tracer/GNS3', 'Capture failover test'],
      acceptanceCriteria: ['Screenshot of VIP failover', 'Before/after ping results'],
    },
  ],
  verificationSteps: [
    'Shut active FHRP member and confirm VIP moves',
    'Verify classroom host retains gateway during failover',
    'Confirm EtherChannel both members forwarding (or documented equivalent)',
  ],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Hosts keep gateway but lose east-west classroom traffic after uplink failure.', hint: 'Check redundant path and STP/EtherChannel state.' },
    { id: 't2', symptom: 'Both routers believe they are active for FHRP.', hint: 'Validate hellos, priorities, and VLAN allow lists on trunks.' },
  ],
  solutionGuide:
    'Align trunk allowed VLANs, FHRP group/VIP consistency, and IGP advertisements. Capture `show standby`/`show vrrp` equivalents from your lab tool as evidence — do not rely on this app to execute failover.',
  portfolioDeliverables: [
    { id: 'd1', title: 'Design PDF/Markdown', description: 'Architecture + addressing + change plan.' },
    { id: 'd2', title: 'Failover evidence', description: 'Screenshots/logs from external lab tool.' },
  ],
}
