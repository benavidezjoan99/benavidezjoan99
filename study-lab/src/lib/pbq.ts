import { ipstr } from '@/lib/subnet'
import type { PbqField, PbqScenario, TrackId } from '@/types/exam'

function makeField(
  id: string,
  label: string,
  correct: string,
  choices: string[] | null,
  why: string,
): PbqField {
  return { id, label, correct: String(correct), choices, why }
}

/** Seeded PBQ worksheets (forms only — not network simulators). */
export function buildSims(track: TrackId): PbqScenario[] {
  const seed = Math.floor(Math.random() * 100000)
  const native = [1, 2, 10][seed % 3]
  const vlan = [3, 20, 30][seed % 3]
  const prefix = [26, 27, 28][seed % 3]
  const block = 2 ** (32 - prefix)
  const start = block * (2 + (seed % 5))
  const last = start + block - 1
  const host = ipstr(0xc0a80100 + start + 3)
  const net = ipstr(0xc0a80100 + start)
  const bc = ipstr(0xc0a80100 + last)
  const first = ipstr(0xc0a80100 + start + 1)
  const lastHost = ipstr(0xc0a80100 + last - 1)

  if (track === 'network') {
    return [
      {
        id: `pbq-vlan-${seed}`,
        title: 'VLAN port configuration',
        context: `Topology: Gateway ↔ managed switch ↔ employee PC.\nThe PC sends untagged Ethernet frames. Assign it only to Servers VLAN ${vlan}. The upstream gateway-to-switch link already permits VLAN ${vlan}.`,
        fields: [
          makeField(
            'native',
            'Native VLAN / Network',
            String(vlan),
            ['1', '2', '3', '10', '20', '30'],
            'Untagged ingress frames are assigned to the native VLAN.',
          ),
          makeField(
            'tags',
            'Tagged VLAN Management',
            'Block All',
            ['Allow All', 'Block All', `Custom: ${vlan}`],
            'A normal PC does not need tagged VLANs. Blocking additional tags creates a single-VLAN access port.',
          ),
          makeField(
            'dhcp',
            'How should the client obtain the correct address?',
            'Renew DHCP',
            ['Renew DHCP', 'Change only its Wi-Fi SSID', 'Delete the default route on the gateway'],
            'A client can hold an old lease after changing its access VLAN. Renewal requests a new lease from the right subnet.',
          ),
        ],
      },
      {
        id: `pbq-cidr-${seed}`,
        title: 'Subnetting worksheet',
        context: `Given the host address ${host}/${prefix}, calculate the network, broadcast, first usable, and last usable addresses. Enter each dotted-decimal address.`,
        fields: [
          makeField('net', 'Network address', net, null, `A /${prefix} has ${block} total addresses per block. The subnet starts at ${net}.`),
          makeField('broadcast', 'Broadcast address', bc, null, `The subnet ends at ${bc}, its broadcast address.`),
          makeField('first', 'First usable host', first, null, 'The first usable IPv4 address is the network address + 1.'),
          makeField('last', 'Last usable host', lastHost, null, 'The last usable IPv4 address is the broadcast address − 1.'),
        ],
      },
      {
        id: `pbq-dhcp-${seed}`,
        title: 'DHCP troubleshooting ticket',
        context: `A laptop was moved from VLAN ${native} to VLAN ${vlan}. Physical link is UP. It retained an old static gateway and now cannot reach the new VLAN gateway. Answer how to diagnose and fix the issue.`,
        fields: [
          makeField('layer', 'Which layer is physically confirmed working?', 'Layer 1', ['Layer 1', 'Layer 4', 'Layer 7'], 'Carrier/link UP is a physical-layer indication.'),
          makeField('renew', 'Best action if laptop uses DHCP and holds an old lease', 'Renew DHCP lease', ['Renew DHCP lease', 'Change monitor refresh rate', 'Reset server RAID'], 'A DHCP renewal can obtain the proper IP and default gateway for the new VLAN.'),
          makeField('static', 'If the laptop uses static addressing, what must change?', 'Update IP, mask and gateway manually', ['Update IP, mask and gateway manually', 'Wait for DHCP renewal', 'Change only its MAC vendor'], 'Statically configured IP settings are not updated automatically by DHCP.'),
        ],
      },
      {
        id: `pbq-routing-${seed}`,
        title: 'Inter-VLAN access policy',
        context: `A management workstation in VLAN ${native} must reach a server in VLAN ${vlan} on TCP 443, but other lateral traffic should remain restricted. The router supports inter-VLAN routing.`,
        fields: [
          makeField(
            'rule',
            'Most appropriate access rule',
            `Allow source VLAN ${native} to server VLAN ${vlan} on TCP 443`,
            [
              `Allow source VLAN ${native} to server VLAN ${vlan} on TCP 443`,
              'Allow all traffic between all VLANs',
              'Disable the firewall for both VLANs',
            ],
            'Limit communication to the necessary source, destination and service.',
          ),
          makeField(
            'default',
            'Default action for other inter-VLAN traffic',
            'Deny',
            ['Permit', 'Deny', 'NAT everything'],
            'Least privilege: deny unintended lateral movement.',
          ),
        ],
      },
      {
        id: `pbq-ports-${seed}`,
        title: 'Ports and protocols triage',
        context: 'Match each service to the standard TCP/UDP port used in Network+ objectives.',
        fields: [
          makeField('https', 'HTTPS', '443', ['80', '443', '22', '53'], 'HTTPS uses TCP 443.'),
          makeField('ssh', 'SSH', '22', ['21', '22', '23', '3389'], 'SSH uses TCP 22.'),
          makeField('dns', 'DNS', '53', ['53', '67', '123', '161'], 'DNS commonly uses UDP/TCP 53.'),
          makeField('rdp', 'RDP', '3389', ['3389', '5900', '445', '139'], 'Remote Desktop Protocol uses TCP 3389.'),
        ],
      },
    ]
  }

  return [
    {
      id: `pbq-identity-${seed}`,
      title: 'Identity and access worksheet',
      context: 'A contractor needs temporary read-only access to a production dashboard for two weeks.',
      fields: [
        makeField('control', 'Best control principle', 'Least privilege with time-bound access', ['Least privilege with time-bound access', 'Shared permanent admin account', 'Disable MFA for convenience'], 'Grant the minimum rights for the shortest required window.'),
        makeField('auth', 'Strongest practical authentication', 'MFA with unique account', ['MFA with unique account', 'Shared password in chat', 'IP allowlist alone'], 'Unique identity plus MFA reduces credential abuse risk.'),
        makeField('review', 'Required follow-up after the engagement', 'Revoke access and review logs', ['Revoke access and review logs', 'Leave access for next project', 'Delete all audit logs'], 'Close the access window and retain evidence of use.'),
      ],
    },
    {
      id: `pbq-incident-${seed}`,
      title: 'Incident response ordering',
      context: 'Suspicious outbound traffic is detected from a workstation after phishing.',
      fields: [
        makeField('first', 'First priority action', 'Contain the host / isolate from network', ['Contain the host / isolate from network', 'Rebuild every server immediately', 'Post details on social media'], 'Containment limits blast radius before eradication.'),
        makeField('evidence', 'Evidence handling', 'Preserve logs and disk evidence', ['Preserve logs and disk evidence', 'Wipe the drive immediately', 'Ignore volatile memory'], 'Preserve forensic value before remediation changes.'),
        makeField('close', 'After recovery', 'Lessons learned and control updates', ['Lessons learned and control updates', 'Disable monitoring permanently', 'Reuse compromised passwords'], 'Improve detection and prevention from the incident.'),
      ],
    },
    {
      id: `pbq-hardening-${seed}`,
      title: 'Baseline hardening checklist',
      context: `A new VLAN ${vlan} hosts jump boxes that manage production. Choose hardening actions.`,
      fields: [
        makeField('patch', 'Patch posture', 'Apply vendor security updates promptly', ['Apply vendor security updates promptly', 'Never patch production', 'Only patch after breach'], 'Timely patching reduces known exploit exposure.'),
        makeField('svc', 'Unnecessary services', 'Disable unused services and ports', ['Disable unused services and ports', 'Open all ports for flexibility', 'Run every demo package'], 'Reducing attack surface is a core hardening step.'),
        makeField('log', 'Visibility', 'Forward auth and admin logs to SIEM', ['Forward auth and admin logs to SIEM', 'Keep logs only on each host forever', 'Turn logging off'], 'Centralized logging supports detection and investigation.'),
      ],
    },
    {
      id: `pbq-crypto-${seed}`,
      title: 'Cryptography application',
      context: 'Select appropriate controls for data in transit and at rest for a customer portal.',
      fields: [
        makeField('transit', 'Data in transit', 'TLS for all public endpoints', ['TLS for all public endpoints', 'Cleartext HTTP only', 'Custom XOR encoding'], 'TLS protects confidentiality and integrity on the wire.'),
        makeField('rest', 'Sensitive data at rest', 'Encrypt with managed keys', ['Encrypt with managed keys', 'Store secrets in source control', 'Email keys to the team'], 'Managed encryption keys protect stored sensitive data.'),
        makeField('hash', 'Password storage', 'Salted adaptive hash (e.g., bcrypt/argon2)', ['Salted adaptive hash (e.g., bcrypt/argon2)', 'Plaintext database column', 'Reversible encryption for support'], 'Passwords should be stored with salted adaptive hashing.'),
      ],
    },
  ]
}
