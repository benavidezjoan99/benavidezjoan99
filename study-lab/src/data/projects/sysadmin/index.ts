import type { ProjectDoc } from '@/types/project'
import { labMilestones, standardDeliverables, sysadminProject } from '../helpers'

export const sa01: ProjectDoc = sysadminProject({
  id: 'sa-01-windows-server-install',
  slug: 'windows-server-install-baseline',
  title: 'Windows Server Install & Baseline',
  curriculumOrder: 1,
  difficulty: 'beginner',
  category: 'Windows Server',
  estimatedHours: 5,
  technologies: ['Windows Server', 'Hypervisor', 'Baseline Hardening'],
  requiredSoftware: ['Windows Server (evaluation ISO)', 'Hyper-V or VirtualBox (host hypervisor)', 'Draw.io'],
  priorKnowledge: ['Basic PC hardware', 'ISO boot / VM creation', 'IPv4 addressing'],
  outcomes: ['Install Windows Server evaluation in a local VM', 'Apply a documented baseline (hostname, updates, firewall, remote admin decision)', 'Produce install + baseline evidence without using Study Lab as a hypervisor'],
  careerTracks: ['system-administrator', 'platform-engineer'],
  certObjectives: ['SY0-701 3.2', 'SY0-701 4.1'],
  examDomains: ['Security Architecture', 'Security Operations'],
  overview: 'Stand up a disposable Windows Server evaluation VM on your own hypervisor, document the install choices, and apply a beginner baseline. Study Lab only stores your plan and evidence — it does not run Windows or provision VMs.',
  businessScenario: 'A training company needs a repeatable Windows Server lab image for weekend classes. You must document a clean install and baseline so every student starts from the same hardened-enough template — not a random GUI click-path.',
  technicalRequirements: ['Local VM with evaluation Windows Server installed (GUI or Server Core — state which)', 'Hostname, timezone, and static or documented DHCP addressing recorded', 'Windows Update status noted; unnecessary roles not installed yet', 'Local Administrator password policy and firewall profile documented', 'Diagram of host hypervisor → VM → management NIC'],
  architectureNotes: 'Host PC/hypervisor runs a single Windows Server guest. Management access via console or RDP only inside your lab network. Label the virtual NIC and whether it is NAT or bridged.',
  addressingPlan: [
    { name: 'Lab host', network: 'Host-only / NAT', mask: 'N/A', notes: 'Hypervisor management' },
    { name: 'WS-DC01 (future DC)', network: '10.50.10.10', mask: '255.255.255.0', gateway: '10.50.10.1', notes: 'Static preferred for later AD labs' }
  ],
  milestones: labMilestones(
    ['Choose GUI vs Core', 'Draw hypervisor diagram', 'Write baseline checklist'],
    ['Create VM and attach ISO', 'Complete OS install', 'Set hostname/IP and apply baseline'],
    ['Screenshot System properties + IP config', 'Document firewall profile', 'Capture update status'],
    { design: 'Plan install', build: 'Install in hypervisor', verify: 'Baseline evidence' },
  ),
  verificationSteps: ['OS boots to login without setup wizards pending', 'ipconfig / ifconfig equivalent matches plan', 'Baseline checklist items checked with screenshots', 'Document failure when wrong ISO edition was selected'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'VM boots to UEFI shell or loops on ISO.', hint: 'Check boot order, Secure Boot, and generation/firmware settings.' },
    { id: 't2', symptom: 'Cannot reach gateway after static IP.', hint: 'Verify virtual NIC mode (NAT vs bridged) and host firewall.' }
  ],
  solutionGuide: 'Use evaluation media, allocate enough RAM/disk, set a memorable lab hostname (e.g. WS-DC01), prefer static IP for later AD. Keep evidence: install summary, ipconfig, firewall, updates. Never expose RDP to the public Internet.',
  portfolioDeliverables: standardDeliverables(),
})

export const sa02: ProjectDoc = sysadminProject({
  id: 'sa-02-ad-ds-domain-controller',
  slug: 'ad-ds-domain-controller',
  title: 'AD DS Domain Controller Promotion',
  curriculumOrder: 2,
  difficulty: 'beginner',
  category: 'Active Directory',
  estimatedHours: 5,
  technologies: ['AD DS', 'DNS', 'Domain Controllers'],
  requiredSoftware: ['Windows Server (evaluation ISO)', 'Hyper-V or VirtualBox (host hypervisor)', 'Draw.io'],
  priorKnowledge: ['Windows Server install baseline', 'DNS basics', 'Domain vs workgroup concept'],
  outcomes: ['Promote a member/standalone server to a domain controller for a lab forest', 'Document forest/domain names, NetBIOS, and DNS integration', 'Verify domain join readiness from a second lab machine plan'],
  careerTracks: ['system-administrator'],
  certObjectives: ['SY0-701 3.2', 'SY0-701 4.5'],
  examDomains: ['Security Architecture', 'Security Operations'],
  overview: 'Create a single-forest single-domain Active Directory lab by installing AD DS and promoting the server. All work happens in your Windows Server VM; Study Lab holds the design packet.',
  businessScenario: 'The training company wants a domain called study.lab so future GPO and file-share labs share identity. You must promote the first DC carefully and document DNS so clients do not fall back to public resolvers for AD records.',
  technicalRequirements: ['AD DS role installed and server promoted to DC', 'Forest/domain FQDN and NetBIOS documented (e.g. study.lab / STUDY)', 'DNS integrated with AD; DC points to itself for DNS', 'Directory Services Restore Mode (DSRM) password stored offline securely', 'Evidence: dcdiag / Get-ADDomain equivalent screenshots'],
  architectureNotes: 'One DC VM (WS-DC01) holding AD DS + DNS. Optional second Windows client for join tests in later projects. Draw forest root and DNS zone.',
  addressingPlan: [
    { name: 'WS-DC01', network: '10.50.10.10', mask: '255.255.255.0', gateway: '10.50.10.1', notes: 'AD DS + DNS' },
    { name: 'Domain', network: 'study.lab', mask: 'FQDN', notes: 'Lab-only; do not collide with production DNS' }
  ],
  milestones: labMilestones(
    ['Pick forest/domain names', 'Confirm static IP + DNS plan', 'Write promotion checklist'],
    ['Install AD DS role', 'Promote to DC', 'Verify DNS zone created'],
    ['dcdiag / equivalent', 'nltest or Get-ADDomain', 'Document SRV record presence'],
    { design: 'Design & documentation', build: 'External implementation', verify: 'Verification & evidence' },
  ),
  verificationSteps: ['Domain Controllers container shows the new DC', 'DNS zone for the domain exists on the DC', 'DC DNS client settings point to 127.0.0.1 or its static IP', 'Document a failed promotion caused by wrong DNS and the fix'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Promotion fails looking up domain DNS.', hint: 'Set preferred DNS to the DC IP before promotion; avoid public DNS as primary for AD.' },
    { id: 't2', symptom: 'Clients cannot find domain later.', hint: 'Check SRV records under _msdcs and time sync.' }
  ],
  solutionGuide: 'Static IP first, DNS to self, unique lab FQDN, document DSRM offline. Capture Active Directory Users and Computers + DNS Manager evidence.',
  portfolioDeliverables: standardDeliverables(),
})

export const sa03: ProjectDoc = sysadminProject({
  id: 'sa-03-dns-dhcp-windows',
  slug: 'dns-dhcp-windows-domain',
  title: 'DNS & DHCP for the Domain',
  curriculumOrder: 3,
  difficulty: 'beginner',
  category: 'Windows Network Services',
  estimatedHours: 4,
  technologies: ['DNS', 'DHCP', 'AD integration'],
  requiredSoftware: ['Windows Server (evaluation ISO)', 'Draw.io', 'Spreadsheet (Excel / Google Sheets)'],
  priorKnowledge: ['AD DS domain controller', 'DHCP lease concepts', 'Forward/reverse lookup basics'],
  outcomes: ['Configure AD-integrated DNS records needed for clients', 'Stand up a DHCP scope with options (router, DNS, domain)', 'Document dynamic DNS update expectations for domain clients'],
  careerTracks: ['system-administrator', 'network-engineer'],
  certObjectives: ['SY0-701 3.2', 'N10-009 3.4'],
  examDomains: ['Security Operations'],
  overview: 'Extend the Windows lab with DHCP and clean DNS so domain clients receive correct options. Implement only on your Windows Server VM.',
  businessScenario: 'Manual static IPs on class laptops are causing AD join failures. Leadership wants a DHCP scope that hands out the DC as DNS and study.lab as the connection-specific DNS suffix.',
  technicalRequirements: ['DHCP scope covering the lab subnet with exclusion for servers', 'Scope options: router, DNS server, DNS domain name', 'DNS forward lookup zone healthy; optional reverse zone', 'Test client receives lease and can resolve DC name', 'Worksheet of reservations for printers/servers'],
  architectureNotes: 'WS-DC01 runs DNS + DHCP (acceptable for small lab; note production split). Clients on same L2 segment. Diagram DHCP Discover→Offer→Request→Ack path at a high level.',
  addressingPlan: [
    { name: 'Scope', network: '10.50.10.0/24', mask: '255.255.255.0', gateway: '10.50.10.1', notes: 'Exclude .1–.20 for infra' },
    { name: 'DHCP pool', network: '10.50.10.100-199', mask: '255.255.255.0', notes: 'Lease 8h lab default' },
    { name: 'DNS option', network: '10.50.10.10', mask: 'N/A', notes: 'DC address' }
  ],
  milestones: labMilestones(
    ['Scope & exclusion table', 'Option list', 'Reservation plan'],
    ['Authorize DHCP if required', 'Create scope + options', 'Create reverse zone optional'],
    ['ipconfig /renew on client', 'nslookup DC name', 'DHCP lease console screenshot'],
    { design: 'Design & documentation', build: 'External implementation', verify: 'Verification & evidence' },
  ),
  verificationSteps: ['Client lease shows correct gateway and DNS', 'nslookup study.lab / DC FQDN succeeds using DC DNS', 'Document failure when DNS option pointed to public resolver'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'DHCP role installed but clients get APIPA.', hint: 'Check scope active, authorized, and L2 connectivity / VLAN.' },
    { id: 't2', symptom: 'Lease OK but domain join fails.', hint: 'Verify DNS option is the DC, not 8.8.8.8.' }
  ],
  solutionGuide: 'Exclude server IPs, set options carefully, keep DNS AD-focused. Attach scope properties + client ipconfig /all.',
  portfolioDeliverables: standardDeliverables(),
})

export const sa04: ProjectDoc = sysadminProject({
  id: 'sa-04-ous-users-groups',
  slug: 'ous-users-security-groups',
  title: 'OUs, Users, and Security Groups',
  curriculumOrder: 4,
  difficulty: 'beginner',
  category: 'Active Directory',
  estimatedHours: 4,
  technologies: ['Active Directory', 'OUs', 'Security Groups'],
  requiredSoftware: ['Windows Server (evaluation ISO)', 'Spreadsheet (Excel / Google Sheets)', 'Draw.io'],
  priorKnowledge: ['Domain controller online', 'Authentication vs authorization basics'],
  outcomes: ['Design an OU tree for departments without over-nesting', 'Create users and security groups with a least-privilege naming standard', 'Document group nesting strategy (AGDLP-lite for labs)'],
  careerTracks: ['system-administrator', 'cybersecurity-engineer'],
  certObjectives: ['SY0-701 4.5', 'SY0-701 5.1'],
  examDomains: ['Security Operations', 'Security Program Management'],
  overview: 'Build identity structure: OUs for computer/user placement, security groups for access. Perform changes in ADUC/PowerShell on your lab DC.',
  businessScenario: 'HR, IT, and Students need separate policy targets later. Dumping everyone in Users will make GPOs painful. You must create a clean OU and group model before file shares and GPOs.',
  technicalRequirements: ['OU diagram with at least three department OUs plus an Admins OU', 'At least six user accounts with standard naming (e.g. jdoe)', 'Global/Universal security groups per department + a Domain Admins break-glass note', 'No day-to-day admin with Domain Admin (document a separate admin account)', 'Export or screenshots of OU tree and group membership'],
  architectureNotes: 'study.lab → OUs: Admins, HR, IT, Students (Users and Computers sub-OUs optional). Groups: G_HR, G_IT, G_Students. Keep nesting shallow for the lab.',
  addressingPlan: [
    { name: 'OU Admins', network: 'study.lab/Admins', mask: 'OU', notes: 'Protected admin accounts' },
    { name: 'OU Students', network: 'study.lab/Students', mask: 'OU', notes: 'Lab user accounts' },
    { name: 'Group G_IT', network: 'Security group', mask: 'Global', notes: 'For later share ACLs' }
  ],
  milestones: labMilestones(
    ['OU sketch', 'Naming standard', 'Group matrix'],
    ['Create OUs', 'Create users/groups', 'Nest membership'],
    ['whoami /groups on test user', 'ADUC screenshots', 'Document disabled guest/unused accounts'],
    { design: 'Design & documentation', build: 'External implementation', verify: 'Verification & evidence' },
  ),
  verificationSteps: ['Users appear under correct OUs', 'Group membership matches the matrix', 'Standard user is not in Domain Admins', 'Document accidental OU deletion recovery via recycle bin if enabled — or restore notes'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Cannot create objects.', hint: 'Confirm you are using a domain admin lab account and targeting the domain naming context.' },
    { id: 't2', symptom: 'Users cannot log on to client.', hint: 'Check UPN/domain, password complexity, and account enabled/unlocked.' }
  ],
  solutionGuide: 'Design OUs for policy, groups for access. Separate admin identities. Attach OU tree + membership spreadsheet.',
  portfolioDeliverables: standardDeliverables(),
})

export const sa05: ProjectDoc = sysadminProject({
  id: 'sa-05-group-policy-essentials',
  slug: 'group-policy-essentials',
  title: 'Group Policy Objects Essentials',
  curriculumOrder: 5,
  difficulty: 'intermediate',
  category: 'Group Policy',
  estimatedHours: 5,
  technologies: ['GPO', 'LS Policy', 'Security Baselines'],
  requiredSoftware: ['Windows Server (evaluation ISO)', 'Windows 10/11 lab client', 'Draw.io'],
  priorKnowledge: ['OUs and security groups', 'Domain-joined client', 'LS Policy concepts'],
  outcomes: ['Create and link GPOs to the correct OUs', 'Configure at least password, desktop, and Windows Update related settings', 'Prove inheritance/precedence with gpresult evidence'],
  careerTracks: ['system-administrator', 'cybersecurity-engineer'],
  certObjectives: ['SY0-701 2.5', 'SY0-701 4.1', 'SY0-701 4.5'],
  examDomains: ['Threats, Vulnerabilities & Mitigations', 'Security Operations'],
  overview: 'Use Group Policy to enforce lab security and UX standards. Edit GPOs on the DC and verify on a domain-joined client — not inside Study Lab.',
  businessScenario: 'Students keep setting blank passwords and disabling the firewall on lab PCs. You will enforce password policy (where applicable), lock screen timeout, and a branded wallpaper/message via GPO.',
  technicalRequirements: ['At least two GPOs linked to different OUs', 'Documented settings list with expected effect', 'gpupdate /force and gpresult /r (or HTML report) evidence', 'One blocked inheritance or enforced link experiment documented', 'Rollback plan: unlink/disable GPO'],
  architectureNotes: 'DC holds Group Policy Objects; clients apply at startup/logon. Diagram OU links and order. Note domain password policy vs fine-grained limitations at beginner/intermediate level.',
  addressingPlan: [
    { name: 'GPO Students-Desktop', network: 'Linked to Students OU', mask: 'User+Computer', notes: 'Wallpaper, lock timeout' },
    { name: 'GPO IT-Security', network: 'Linked to IT OU', mask: 'Computer', notes: 'Firewall, audit examples' }
  ],
  milestones: labMilestones(
    ['Settings catalog', 'Link plan', 'Test user list'],
    ['Create/edit GPOs', 'Link to OUs', 'Join/verify client'],
    ['gpresult evidence', 'Setting visible effect', 'Unlink rollback test'],
    { design: 'Design & documentation', build: 'External implementation', verify: 'Verification & evidence' },
  ),
  verificationSteps: ['Targeted user sees GPO effect after gpupdate', 'User outside OU does not get Students GPO', 'gpresult shows winning GPO name', 'Document conflict when two GPOs set the same value'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'GPO not applying.', hint: 'Check link enabled, security filtering, WMI filters, and replication/time.' },
    { id: 't2', symptom: 'Password policy seems ignored on OU GPO.', hint: 'Domain password settings often require Default Domain Policy / FGPP — document the limitation.' }
  ],
  solutionGuide: 'Link narrowly, test with one user, capture gpresult. Prefer small single-purpose GPOs. Attach GPO settings report export.',
  portfolioDeliverables: standardDeliverables(),
})

export const sa06: ProjectDoc = sysadminProject({
  id: 'sa-06-file-services-shares',
  slug: 'file-services-ntfs-shares',
  title: 'File Services, Shares & NTFS',
  curriculumOrder: 6,
  difficulty: 'intermediate',
  category: 'Windows File Services',
  estimatedHours: 5,
  technologies: ['SMB', 'NTFS ACLs', 'Share Permissions'],
  requiredSoftware: ['Windows Server (evaluation ISO)', 'Windows lab client', 'Spreadsheet (Excel / Google Sheets)'],
  priorKnowledge: ['Security groups in AD', 'NTFS vs share permission model'],
  outcomes: ['Create departmental SMB shares with least-privilege ACLs', 'Document share vs NTFS permission interaction', 'Verify effective access for sample users'],
  careerTracks: ['system-administrator'],
  certObjectives: ['SY0-701 3.2', 'SY0-701 4.5'],
  examDomains: ['Security Architecture', 'Security Operations'],
  overview: 'Publish file shares for HR and Students with correct NTFS and share permissions. Test with domain users from a client OS.',
  businessScenario: 'HR files leaked because Everyone:Full Control was left on a share. You must rebuild shares with group-based access and prove effective permissions.',
  technicalRequirements: ['At least two shares (e.g. HR$, Students)', 'Permission matrix: group → share → NTFS rights', 'Hidden admin-style share optional and documented', 'Access-based enumeration optional note', 'Effective Access tool or icacls evidence'],
  architectureNotes: 'File role on WS-DC01 or separate file VM. Clients map drives via \\\\WS-DC01\\Share. Diagram identity → group → ACL.',
  addressingPlan: [
    { name: 'Share HR', network: '\\\\WS-DC01\\HR', mask: 'SMB', notes: 'G_HR Modify; G_IT Read' },
    { name: 'Share Students', network: '\\\\WS-DC01\\Students', mask: 'SMB', notes: 'G_Students Modify on own folder pattern' }
  ],
  milestones: labMilestones(
    ['Permission matrix', 'Folder layout', 'Drive letter plan'],
    ['Create folders/shares', 'Set NTFS+share ACLs', 'Map drives as test users'],
    ['Effective access checks', 'Denied user evidence', 'Success user evidence'],
    { design: 'Design & documentation', build: 'External implementation', verify: 'Verification & evidence' },
  ),
  verificationSteps: ['Authorized user can write; unauthorized gets Access Denied', 'Document combined share+NTFS effective right', 'Remove Everyone if present and retest'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Share works but NTFS denies.', hint: 'Effective permission is most restrictive combination — fix NTFS.' },
    { id: 't2', symptom: 'Offline files / caching surprises.', hint: 'Disable caching on sensitive shares in lab.' }
  ],
  solutionGuide: 'Groups on ACLs, not individual users; share = wide gate, NTFS = real control. Attach matrix + Effective Access screenshots.',
  portfolioDeliverables: standardDeliverables(),
})

export const sa07: ProjectDoc = sysadminProject({
  id: 'sa-07-linux-admin-fundamentals',
  slug: 'linux-admin-fundamentals',
  title: 'Linux Admin Fundamentals',
  curriculumOrder: 7,
  difficulty: 'beginner',
  category: 'Linux Administration',
  estimatedHours: 5,
  technologies: ['Linux', 'Users', 'Permissions', 'systemd'],
  requiredSoftware: ['Ubuntu Server', 'Hyper-V or VirtualBox (host hypervisor)', 'Draw.io'],
  priorKnowledge: ['CLI comfort', 'VM creation', 'Basic networking'],
  outcomes: ['Install Ubuntu Server in a lab VM and perform first-boot hardening basics', 'Manage users, groups, sudo, and file permissions', 'Document essential services with systemctl'],
  careerTracks: ['system-administrator', 'devops-engineer', 'platform-engineer'],
  certObjectives: ['SY0-701 4.1', 'SY0-701 3.2'],
  examDomains: ['Security Operations', 'Security Architecture'],
  overview: 'Build a Linux admin foundation on Ubuntu Server: accounts, permissions, packages, and services. All commands run in your VM/terminal — Study Lab does not provide a shell.',
  businessScenario: 'The team needs a Linux jump box for future automation labs. You must document a repeatable bootstrap: create admin user, disable fragile defaults, and prove basic service control.',
  technicalRequirements: ['Ubuntu Server VM installed with SSH server available', 'Non-root sudo user created; root SSH login decision documented', 'Demonstration of chmod/chown and a sticky-bit or setgid note', 'systemctl status/start/stop for a sample service', 'Package install evidence (apt)'],
  architectureNotes: 'Single Ubuntu VM on lab hypervisor. Optional second NIC later. Diagram host → VM → SSH client path.',
  addressingPlan: [
    { name: 'ubuntu-lab', network: '10.50.20.10', mask: '255.255.255.0', gateway: '10.50.20.1', notes: 'SSH management' }
  ],
  milestones: labMilestones(
    ['Hostname + IP plan', 'User/sudo plan', 'Service inventory'],
    ['Install Ubuntu', 'Create users', 'Configure baseline permissions'],
    ['id / sudo -l', 'systemctl evidence', 'apt install evidence'],
    { design: 'Bootstrap plan', build: 'Configure Linux VM', verify: 'CLI evidence' },
  ),
  verificationSteps: ['SSH as sudo user works', 'Unauthorized user cannot sudo', 'Service restart verified with systemctl', 'Document permission denied case and fix'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Permission denied on shared directory.', hint: 'Check ownership, mode, and group membership.' },
    { id: 't2', symptom: 'Service fails after reboot.', hint: 'Confirm enabled via systemctl enable and review journalctl.' }
  ],
  solutionGuide: 'Prefer sudo users over daily root, keep apt updated in lab, capture command history carefully (redact secrets). Attach terminal screenshots.',
  portfolioDeliverables: standardDeliverables(),
})

export const sa08: ProjectDoc = sysadminProject({
  id: 'sa-08-linux-networking-ssh',
  slug: 'linux-networking-ssh-hardening',
  title: 'Linux Networking, Firewall & SSH',
  curriculumOrder: 8,
  difficulty: 'intermediate',
  category: 'Linux Networking',
  estimatedHours: 5,
  technologies: ['netplan/ip', 'UFW/nftables', 'SSH hardening'],
  requiredSoftware: ['Ubuntu Server', 'Draw.io', 'Text editor / notes app'],
  priorKnowledge: ['Linux admin fundamentals', 'TCP ports', 'SSH key concepts'],
  outcomes: ['Configure static addressing and routing on Linux', 'Apply host firewall rules allowing only required ports', 'Harden SSH (keys, root login, password auth policy) with rollback notes'],
  careerTracks: ['system-administrator', 'cybersecurity-engineer', 'devops-engineer'],
  certObjectives: ['SY0-701 3.2', 'SY0-701 4.4', 'SY0-701 4.5'],
  examDomains: ['Security Architecture', 'Security Operations'],
  overview: 'Turn the Linux VM into a safely reachable admin host: static IP, firewall, and SSH hardening. Test only inside your lab network.',
  businessScenario: 'Someone scanned the lab and found password SSH on root. You must lock SSH down with keys, restrict firewall to management subnet, and document emergency console access.',
  technicalRequirements: ['Static IP config persisted (netplan or distro equivalent)', 'Firewall default deny inbound with allow SSH from lab subnet', 'SSH key auth configured; password/root policy documented', 'sshd_config changes backed up before edit', 'Failure drill: lockout recovery via hypervisor console'],
  architectureNotes: 'Admin workstation → SSH → ubuntu-lab:22. Firewall allows 10.50.0.0/16 to :22 only. Diagram management path vs blocked path.',
  addressingPlan: [
    { name: 'ubuntu-lab', network: '10.50.20.10', mask: '255.255.255.0', gateway: '10.50.20.1', notes: 'SSH :22' },
    { name: 'Mgmt clients', network: '10.50.0.0/16', mask: 'N/A', notes: 'Only source allowed through UFW' }
  ],
  milestones: labMilestones(
    ['Firewall rule table', 'sshd hardening checklist', 'Console recovery plan'],
    ['Set static IP', 'Configure UFW/nftables', 'Deploy SSH keys + sshd_config'],
    ['ssh key login', 'Password login blocked if required', 'Port scan from unauthorized IP fails in lab'],
    { design: 'Design & documentation', build: 'External implementation', verify: 'Verification & evidence' },
  ),
  verificationSteps: ['ip a / route -n matches plan', 'ufw status / nft list ruleset matches table', 'SSH key works; unauthorized method fails as designed', 'Document console recovery after intentional lockout test'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Locked out of SSH after hardening.', hint: 'Use hypervisor console; restore sshd_config backup; keep a session open while testing.' },
    { id: 't2', symptom: 'Firewall blocks updates.', hint: 'Allow established/outbound HTTPS for apt if policy requires.' }
  ],
  solutionGuide: 'Always keep console access, test SSH changes in a second session, restrict by source IP. Attach sshd_config (redacted) + ufw status.',
  portfolioDeliverables: standardDeliverables(),
})

export const sa09: ProjectDoc = sysadminProject({
  id: 'sa-09-proxmox-foundation',
  slug: 'proxmox-ve-lab-foundation',
  title: 'Proxmox VE Lab Foundation',
  curriculumOrder: 9,
  difficulty: 'intermediate',
  category: 'Virtualization',
  estimatedHours: 6,
  technologies: ['Proxmox VE', 'KVM', 'Storage', 'Templates'],
  requiredSoftware: ['Proxmox VE', 'Draw.io', 'Ubuntu Server'],
  priorKnowledge: ['Hardware virtualization basics', 'ISO management', 'Linux networking basics'],
  outcomes: ['Install Proxmox VE on lab hardware or nested lab per vendor guidance', 'Create storage, ISO library, and a first guest VM', 'Document cluster-of-one management URL and backup of node config notes'],
  careerTracks: ['platform-engineer', 'system-administrator', 'cloud-engineer'],
  certObjectives: ['SY0-701 3.1', 'SY0-701 3.2'],
  examDomains: ['Security Architecture', 'General Security Concepts'],
  overview: 'Establish Proxmox as the external virtualization platform for multi-VM labs. Study Lab never embeds a hypervisor — you install Proxmox yourself.',
  businessScenario: 'Running separate VirtualBox hosts does not scale for AD + Linux + firewall guests. You will document a Proxmox node that can host the rest of the Phase 6 infrastructure projects.',
  technicalRequirements: ['Proxmox node installed and web UI reachable on lab network', 'Local storage/ZFS/directory storage documented', 'ISO uploaded; one Ubuntu or Windows guest created', 'User/API token for admin vs audit roles noted', 'Network bridge vmbr0 documented'],
  architectureNotes: 'Physical or nested Proxmox host → vmbr0 → guests. Diagram management UI (8006) vs guest traffic. Call out nested virtualization limits if applicable.',
  addressingPlan: [
    { name: 'pve-node', network: '10.50.0.5', mask: '255.255.255.0', gateway: '10.50.0.1', notes: 'UI :8006' },
    { name: 'vmbr0', network: 'Lab LAN bridge', mask: 'N/A', notes: 'Guests share L2 with lab' }
  ],
  milestones: labMilestones(
    ['Hardware/nested decision', 'Storage plan', 'Bridge plan'],
    ['Install Proxmox', 'Configure storage + ISO', 'Create first VM'],
    ['UI screenshot', 'Guest boots', 'Bridge connectivity'],
    { design: 'Design & documentation', build: 'External implementation', verify: 'Verification & evidence' },
  ),
  verificationSteps: ['https://pve-node:8006 reachable in lab', 'Guest gets planned IP/DHCP', 'Document subscription nag / community repo choices honestly'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'No network after install.', hint: 'Check NIC name in /etc/network/interfaces and bridge ports.' },
    { id: 't2', symptom: 'Nested KVM unavailable.', hint: 'Enable nested virt on outer hypervisor or use physical host.' }
  ],
  solutionGuide: 'Treat Proxmox as production-like: static IP, documented root MFA where possible, separate management. Attach interfaces file + VM config summary.',
  portfolioDeliverables: standardDeliverables(),
})

export const sa10: ProjectDoc = sysadminProject({
  id: 'sa-10-proxmox-bridges-vlans',
  slug: 'proxmox-bridges-vlans-guests',
  title: 'Proxmox Bridges, VLANs & Guests',
  curriculumOrder: 10,
  difficulty: 'intermediate',
  category: 'Virtualization Networking',
  estimatedHours: 6,
  technologies: ['Linux bridges', '802.1Q', 'Proxmox VNets'],
  requiredSoftware: ['Proxmox VE', 'Draw.io', 'Ubuntu Server'],
  priorKnowledge: ['Proxmox foundation', 'VLAN concepts', 'Linux networking'],
  outcomes: ['Design management vs server vs user lab segments with bridges/VLANs', 'Attach guests to correct bridges with tagged/untagged ports as designed', 'Verify isolation between VLANs with ping tests'],
  careerTracks: ['platform-engineer', 'network-engineer', 'system-administrator'],
  certObjectives: ['SY0-701 3.1', 'N10-009 2.1'],
  examDomains: ['Security Architecture'],
  overview: 'Segment the Proxmox lab with multiple bridges or VLAN-aware bridges so AD, Linux, and “user” VMs are not a flat trust soup.',
  businessScenario: 'Students accidentally bridged a malware-test VM onto the same L2 as the DC. You must introduce VLAN segmentation on Proxmox and prove isolation.',
  technicalRequirements: ['At least two guest networks (e.g. mgmt VLAN 10, servers VLAN 20)', 'Bridge/VLAN config exported or screenshotted', 'One guest per segment with addressing plan', 'Cross-VLAN traffic requires L3 hop (document router VM or physical router)', 'Isolation evidence: same-VLAN pass / cross-VLAN fail without router'],
  architectureNotes: 'pve → vmbr0 (mgmt) + vmbr1/VLAN trunks → guests. Optional pfSense/OPNsense or Linux router VM for inter-VLAN. Diagram tags clearly.',
  addressingPlan: [
    { name: 'Mgmt VLAN', network: '10.50.10.0/24', mask: '255.255.255.0', gateway: '10.50.10.1', vlan: '10' },
    { name: 'Servers VLAN', network: '10.50.20.0/24', mask: '255.255.255.0', gateway: '10.50.20.1', vlan: '20' }
  ],
  milestones: labMilestones(
    ['VLAN table', 'Bridge map', 'Guest NIC assignments'],
    ['Configure bridges/VLANs', 'Attach NICs', 'Optional router VM'],
    ['Ping matrix', 'tcpdump/vlan evidence optional', 'Isolation proof'],
    { design: 'Design & documentation', build: 'External implementation', verify: 'Verification & evidence' },
  ),
  verificationSteps: ['Guests on VLAN 20 cannot reach VLAN 10 without router', 'With router, inter-VLAN works as designed', 'Mis-tagged NIC failure documented'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Guest has no link.', hint: 'Check bridge port assignment and VLAN tag on Proxmox NIC config.' },
    { id: 't2', symptom: 'Tags stripped unexpectedly.', hint: 'Confirm upstream switch trunk allows VLANs.' }
  ],
  solutionGuide: 'Keep management on a dedicated segment; never put experimental malware VMs on DC VLAN. Attach /etc/network/interfaces and ping matrix.',
  portfolioDeliverables: standardDeliverables(),
})

export const sa11: ProjectDoc = sysadminProject({
  id: 'sa-11-backup-restore',
  slug: 'backup-restore-playbook',
  title: 'Backup & Restore Playbook',
  curriculumOrder: 11,
  difficulty: 'intermediate',
  category: 'Operations',
  estimatedHours: 5,
  technologies: ['Backup', 'Restore drills', '3-2-1 awareness'],
  requiredSoftware: ['Proxmox VE', 'Windows Server (evaluation ISO)', 'Ubuntu Server'],
  priorKnowledge: ['At least one Windows and one Linux lab VM', 'Storage capacity planning'],
  outcomes: ['Define RPO/RTO targets for lab workloads', 'Configure scheduled backups for critical VMs/configs', 'Perform a restore drill and document gaps'],
  careerTracks: ['system-administrator', 'platform-engineer', 'devops-engineer'],
  certObjectives: ['SY0-701 3.3', 'SY0-701 4.1'],
  examDomains: ['Security Operations', 'Security Architecture'],
  overview: 'Treat backups as a tested process, not a checkbox. Use Proxmox backup jobs and/or OS-level backups externally; record results in Study Lab.',
  businessScenario: 'A student deleted the DC disk snapshot chain. Management asks whether you can restore. You will write a playbook and prove a restore of a non-prod VM.',
  technicalRequirements: ['RPO/RTO table for DC, file share, and Linux jump box', 'Automated or scripted backup job configured externally', 'One successful restore drill with evidence', 'Offline/off-host copy note (even USB lab copy counts)', 'Failure case: corrupt backup detection discussion'],
  architectureNotes: 'Backup storage separate from primary VM disk where possible. Diagram primary → backup target → restore path. Label secrets handling.',
  addressingPlan: [
    { name: 'Backup target', network: '10.50.30.50', mask: 'N/A', notes: 'NFS/SMB/PBS/local USB — state which' },
    { name: 'Protected VM', network: 'WS-DC01', mask: 'N/A', notes: 'Highest priority' }
  ],
  milestones: labMilestones(
    ['RPO/RTO table', 'Backup target choice', 'Restore runbook outline'],
    ['Configure job', 'Run backup', 'Restore to alternate name/IP if needed'],
    ['Backup success log', 'Restore boot evidence', 'Checksum/consistency note'],
    { design: 'Design & documentation', build: 'External implementation', verify: 'Verification & evidence' },
  ),
  verificationSteps: ['Backup job completes without error', 'Restored VM boots and meets smoke tests', 'Document time taken vs RTO target'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Backup job succeeds but restore fails.', hint: 'Test restores regularly; verify storage permissions and format compatibility.' },
    { id: 't2', symptom: 'Backup fills disk.', hint: 'Set retention and alerts; exclude ISO libraries if needed.' }
  ],
  solutionGuide: 'Untested backups are wishes. Keep runbooks short and evidence-heavy. Attach job config + restore screenshots.',
  portfolioDeliverables: standardDeliverables(),
})

export const sa12: ProjectDoc = sysadminProject({
  id: 'sa-12-monitoring-basics',
  slug: 'monitoring-alerting-basics',
  title: 'Monitoring & Alerting Basics',
  curriculumOrder: 12,
  difficulty: 'intermediate',
  category: 'Operations',
  estimatedHours: 5,
  technologies: ['Monitoring', 'Logs', 'Alerting'],
  requiredSoftware: ['Proxmox VE', 'Ubuntu Server', 'Draw.io', 'Text editor / notes app'],
  priorKnowledge: ['Linux admin', 'Windows Event Viewer basics', 'Backup playbook'],
  outcomes: ['Select golden signals for lab infra (CPU, disk, service up, AD auth failures)', 'Configure at least one metrics or log alert path externally', 'Document on-call style response notes for alerts'],
  careerTracks: ['system-administrator', 'devops-engineer', 'platform-engineer'],
  certObjectives: ['SY0-701 4.3', 'SY0-701 4.4'],
  examDomains: ['Security Operations'],
  overview: 'Add lightweight monitoring to the lab using tools you choose (e.g. Proxmox alerts, Netdata, Prometheus node exporter, Windows Performance Monitor). Study Lab does not host monitoring.',
  businessScenario: 'Disk filled overnight and DHCP died unnoticed. You must define alerts that would have woken you and prove a test alert fires.',
  technicalRequirements: ['Service inventory with monitor method per node', 'At least one disk/CPU alert and one auth/security log alert idea', 'Test alert evidence (email/webhook/local notification)', 'Runbook snippet: alert → triage → escalate', 'Noise reduction note (thresholds)'],
  architectureNotes: 'Agents/exporters on VMs → optional local monitor VM → notification channel. Keep everything offline-lab friendly.',
  addressingPlan: [
    { name: 'monitor-vm', network: '10.50.20.50', mask: '255.255.255.0', notes: 'Optional stack' },
    { name: 'Targets', network: 'WS-DC01, ubuntu-lab, pve', mask: 'N/A', notes: 'Golden signals listed' }
  ],
  milestones: labMilestones(
    ['Signal catalog', 'Tool choice', 'Alert routing'],
    ['Deploy monitor/agents', 'Create alert rules', 'Trigger test alert'],
    ['Alert received', 'Dashboards screenshot', 'Silence/ack documented'],
    { design: 'Design & documentation', build: 'External implementation', verify: 'Verification & evidence' },
  ),
  verificationSteps: ['Synthetic failure triggers alert', 'Healthy baseline does not constantly page', 'Document missed alert and fix'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Alerts never fire.', hint: 'Check agent connectivity, time sync, and notification credentials.' },
    { id: 't2', symptom: 'Alert storms.', hint: 'Widen thresholds; alert on rate of change or sustained conditions.' }
  ],
  solutionGuide: 'Start small: disk + service down + failed logons. Attach rule config + notification screenshot.',
  portfolioDeliverables: standardDeliverables(),
})

export const sa13: ProjectDoc = sysadminProject({
  id: 'sa-13-enterprise-multi-server',
  slug: 'multi-server-enterprise-lab',
  title: 'Multi-Server Enterprise Lab',
  curriculumOrder: 13,
  difficulty: 'advanced',
  category: 'Enterprise Infrastructure',
  estimatedHours: 10,
  technologies: ['AD DS', 'Linux', 'Proxmox', 'Backup', 'Monitoring'],
  requiredSoftware: ['Proxmox VE', 'Windows Server (evaluation ISO)', 'Ubuntu Server', 'Draw.io'],
  priorKnowledge: ['All prior sysadmin projects', 'VLAN segmentation', 'Backup + monitoring'],
  outcomes: ['Assemble a documented multi-tier lab: identity, file, Linux services, monitoring, backups', 'Produce ops docs: inventory, runbooks, IP plan, restore contacts', 'Demonstrate end-to-end verification and a troubleshooting drill'],
  careerTracks: ['system-administrator', 'platform-engineer', 'cloud-solutions-architect'],
  certObjectives: ['SY0-701 3.2', 'SY0-701 4.1', 'SY0-701 5.1'],
  examDomains: ['Security Architecture', 'Security Operations', 'Security Program Management'],
  overview: 'Capstone for system administration: integrate Windows AD services, Linux, Proxmox networking, backups, and monitoring into one coherent enterprise-style lab — still fully local/external.',
  businessScenario: 'You are handing the lab to another admin for a week. They need a complete packet: diagrams, credentials vault location (not passwords in Study Lab), runbooks, and proof systems are healthy.',
  technicalRequirements: ['Inventory of ≥4 VMs with roles and IPs', 'Working AD authentication to a file share and Linux SSH via documented accounts', 'Backup job + monitoring alert both proven this week', 'Ops doc set: network, identity, restore, escalation', 'Tabletop: DC down scenario written with steps'],
  architectureNotes: 'Proxmox host; VLANs for mgmt/servers/users; WS-DC01; file services; ubuntu jump/monitor; optional router VM. Single diagram with trust boundaries.',
  addressingPlan: [
    { name: 'pve', network: '10.50.0.5/24', mask: '255.255.255.0', gateway: '10.50.0.1', vlan: '5', notes: 'Hypervisor mgmt' },
    { name: 'WS-DC01', network: '10.50.10.10', mask: '255.255.255.0', vlan: '10', notes: 'AD+DNS+DHCP' },
    { name: 'ubuntu-jump', network: '10.50.20.10', mask: '255.255.255.0', vlan: '20', notes: 'SSH bastion' },
    { name: 'monitor', network: '10.50.20.50', mask: '255.255.255.0', vlan: '20', notes: 'Alerts' }
  ],
  milestones: labMilestones(
    ['Enterprise diagram', 'Ops doc outline', 'Test plan'],
    ['Bring all VMs to target state', 'Wire monitoring/backups', 'Validate AD+file+SSH paths'],
    ['E2E checklist', 'Tabletop notes', 'Handoff packet export'],
    { design: 'Design & documentation', build: 'External implementation', verify: 'Verification & evidence' },
  ),
  verificationSteps: ['Domain user maps share successfully', 'SSH key admin path works', 'Backup + alert evidence attached', 'Second person can follow your runbook (peer review note)'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Identity works but name resolution fails across VLANs.', hint: 'Check DNS, conditional forwarders, and firewall between VLANs.' },
    { id: 't2', symptom: 'Restore drill exceeds RTO.', hint: 'Pre-stage restore targets; document cold vs warm options.' }
  ],
  solutionGuide: 'Clarity beats gadget count. Map each requirement to a file in the evidence pack. List known debt honestly.',
  portfolioDeliverables: standardDeliverables(),
})

export const sysadminProjects: ProjectDoc[] = [sa01, sa02, sa03, sa04, sa05, sa06, sa07, sa08, sa09, sa10, sa11, sa12, sa13]
