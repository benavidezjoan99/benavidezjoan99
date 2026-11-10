import type { ProjectDoc } from '@/types/project'

export const projectBranchSase: ProjectDoc = {
  id: 'net-21-branch-secure-edge',
  slug: 'branch-secure-edge-blueprint',
  title: 'Branch Secure Edge Blueprint',
  certification: 'Network+',
  difficulty: 'advanced',
  category: 'Hybrid Connectivity & Security',
  estimatedHours: 12,
  technologies: ['IPsec', 'SD-WAN concepts', 'DNS filtering', 'Zero Trust'],
  requiredSoftware: ['Draw.io', 'Wireshark', 'Cloud console (read-only diagrams)', 'Packet Tracer or vendor SD-WAN trial'],
  priorKnowledge: ['Site-to-site VPN basics', 'Firewall zones', 'DNS and HTTP proxies'],
  outcomes: [
    'Produce a branch onboarding runbook with explicit external tool boundaries',
    'Map identity-aware access vs network-level VPN',
    'Define verification without auto-provisioning cloud resources',
  ],
  careerTracks: ['network-engineer', 'cybersecurity-engineer', 'cloud-engineer'],
  certObjectives: ['N10-009 3.3', 'N10-009 4.1', 'N10-009 4.3'],
  overview:
    'Document a secure branch edge: local breakout, encrypted backhaul, and DNS security. Implementation uses vendor labs or cloud consoles you operate manually — Study Lab never provisions resources.',
  businessScenario:
    'A company opens a 25-person branch. HQ wants encrypted connectivity, safe local internet breakout, and a checklist for the field tech. Budget forbids standing up unmanaged cloud labs from a study app.',
  technicalRequirements: [
    'Primary IPsec/SD-WAN path to HQ with documented algorithms',
    'Local internet breakout with DNS filtering policy',
    'Guest Wi-Fi isolated from corporate VLANs',
    'Logging destinations and retention stated',
    'Cost/cleanup notes if any cloud trial accounts are used',
  ],
  architectureNotes:
    'Diagram branch firewall/router, guest SSID, corporate SSID, HQ hub, and optional SSE/DNS security service. Label trust zones. No embedded packet engine.',
  addressingPlan: [
    { name: 'Corporate LAN', network: '10.60.10.0/24', mask: '255.255.255.0', gateway: '10.60.10.1', vlan: '60' },
    { name: 'Guest', network: '10.60.40.0/24', mask: '255.255.255.0', gateway: '10.60.40.1', vlan: '64', notes: 'No route to corporate' },
    { name: 'Tunnel overlay', network: '172.16.10.0/30', mask: '255.255.255.252', notes: 'Document only; build in vendor lab' },
  ],
  milestones: [
    {
      id: 'm1',
      title: 'Threat & trust model',
      tasks: ['List assets', 'Define zones', 'Choose breakout policy'],
      acceptanceCriteria: ['Guest isolation stated', 'DNS security control named'],
    },
    {
      id: 'm2',
      title: 'Connectivity blueprint',
      tasks: ['Document VPN/SD-WAN parameters', 'Failover narrative'],
      acceptanceCriteria: ['Crypto proposal listed', 'Secondary path described'],
    },
    {
      id: 'm3',
      title: 'Field verification pack',
      tasks: ['Write tech checklist', 'Attach packet capture samples from Wireshark'],
      acceptanceCriteria: ['Checklist includes rollback', 'Evidence distinguishes self-report vs capture'],
    },
  ],
  verificationSteps: [
    'Confirm guest client cannot reach corporate gateway',
    'Validate tunnel establishment in vendor/lab UI',
    'Capture DNS queries showing filter policy (Wireshark)',
  ],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Tunnel up but corporate apps time out.', hint: 'Check interesting traffic/selectors and return routing.' },
    { id: 't2', symptom: 'Guest users reach printers on corporate VLAN.', hint: 'Revisit ACL/SSID-VLAN mapping and inter-VLAN firewall rules.' },
  ],
  solutionGuide:
    'Keep selectors symmetric, enforce guest ACL deny-to-corporate, and verify DNS policy with captures. Cloud steps remain manual in the provider console with cleanup notes in your deliverable.',
  portfolioDeliverables: [
    { id: 'd1', title: 'Branch runbook', description: 'Markdown/PDF with zones, addressing, and checklist.' },
    { id: 'd2', title: 'Evidence bundle', description: 'Wireshark snippets + lab UI screenshots (no production secrets).' },
    { id: 'd3', title: 'Cleanup log', description: 'If a cloud trial was used, record resources removed.' },
  ],
}
