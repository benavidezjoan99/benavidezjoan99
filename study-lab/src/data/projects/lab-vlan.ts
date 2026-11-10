import type { ProjectDoc } from '@/types/project'

export const projectLabVlan: ProjectDoc = {
  id: 'net-01-lab-vlan',
  slug: 'home-lab-vlan-segmentation',
  title: 'Home Lab VLAN Segmentation',
  certification: 'Network+',
  difficulty: 'beginner',
  category: 'Switching & VLANs',
  estimatedHours: 4,
  technologies: ['VLANs', 'DHCP', 'IPv4', 'Trunking'],
  requiredSoftware: ['Cisco Packet Tracer', 'Draw.io'],
  priorKnowledge: ['OSI model basics', 'IPv4 addressing', 'Switch vs router roles'],
  outcomes: [
    'Design a three-VLAN access layer for users, servers, and management',
    'Document trunk vs access port intent',
    'Produce a verification checklist for inter-VLAN reachability',
  ],
  careerTracks: ['network-engineer', 'system-administrator'],
  certObjectives: ['N10-009 1.2', 'N10-009 2.1', 'N10-009 2.3'],
  overview:
    'Build documentation for a small home/lab network that separates user, server, and management traffic with VLANs. All hands-on configuration happens in Packet Tracer or your physical lab — this project is instructional documentation only.',
  businessScenario:
    'A freelance IT student is turning a spare switch and router into a practice lab. Mixing management access and user traffic on one flat LAN keeps breaking demos. Leadership (you) wants clear segmentation, a simple addressing plan, and a checklist so future labs do not collide.',
  technicalRequirements: [
    'At least three VLANs with documented IDs and names',
    'One trunk uplink between access switch and L3 gateway',
    'Access ports assigned to a single VLAN each',
    'DHCP scope per user/server VLAN (or documented static plan)',
    'Management VLAN reachable only from designated admin host',
  ],
  architectureNotes:
    'Document a star topology: edge hosts → access switch → gateway router/firewall. Include VLAN IDs on a simple diagram (Draw.io). Do not embed a live simulator here — export your Packet Tracer topology screenshot into your portfolio.',
  addressingPlan: [
    { name: 'Users', network: '10.10.10.0/24', mask: '255.255.255.0', gateway: '10.10.10.1', vlan: '10', notes: 'DHCP pool .50–.200' },
    { name: 'Servers', network: '10.10.20.0/24', mask: '255.255.255.0', gateway: '10.10.20.1', vlan: '20', notes: 'Static preferred for lab servers' },
    { name: 'Management', network: '10.10.99.0/24', mask: '255.255.255.0', gateway: '10.10.99.1', vlan: '99', notes: 'Admin jump host only' },
  ],
  milestones: [
    {
      id: 'm1',
      title: 'Design & diagram',
      tasks: ['Choose VLAN IDs/names', 'Draw topology', 'List required Packet Tracer devices'],
      acceptanceCriteria: ['Diagram shows three VLANs and one trunk', 'Device list matches diagram'],
    },
    {
      id: 'm2',
      title: 'Addressing plan',
      tasks: ['Fill addressing table', 'Decide DHCP vs static per VLAN'],
      acceptanceCriteria: ['No overlapping subnets', 'Gateway documented per VLAN'],
    },
    {
      id: 'm3',
      title: 'External implementation',
      tasks: ['Configure VLANs in Packet Tracer', 'Capture show commands / screenshots'],
      acceptanceCriteria: ['Evidence of trunk and access ports', 'Host in Users VLAN receives expected gateway'],
    },
  ],
  verificationSteps: [
    'Ping gateway from a Users VLAN host',
    'Confirm Servers VLAN host cannot be reached if ACL denies (optional advanced)',
    'Verify trunk allows VLAN 10/20/99',
    'Document failure when access port is left in default VLAN',
  ],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Host has link lights but APIPA address.', hint: 'Check access VLAN and DHCP scope VLAN binding.' },
    { id: 't2', symptom: 'Inter-VLAN ping fails though same-VLAN ping works.', hint: 'Confirm SVI/gateway and routing between VLANs.' },
  ],
  solutionGuide:
    'Typical fix path: confirm access VLAN membership, ensure trunk allows needed VLANs, verify gateway SVIs are up, renew DHCP after VLAN moves. Full configs stay in your Packet Tracer file — attach screenshots as evidence.',
  portfolioDeliverables: [
    { id: 'd1', title: 'Topology diagram', description: 'Draw.io or Packet Tracer export showing VLANs and trunk.' },
    { id: 'd2', title: 'Addressing worksheet', description: 'Completed table matching implementation.' },
    { id: 'd3', title: 'Verification notes', description: 'Commands/screenshots proving reachability and a failed case.' },
  ],
}
