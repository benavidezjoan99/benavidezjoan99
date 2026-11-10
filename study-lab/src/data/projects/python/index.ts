import type { ProjectDoc } from '@/types/project'
import { labMilestones, codeDeliverables, pythonProject } from '../helpers'

export const py01: ProjectDoc = pythonProject({
  id: 'py-01-cli-calculator',
  slug: 'python-cli-calculator',
  title: 'CLI Calculator',
  curriculumOrder: 1,
  difficulty: 'beginner',
  category: 'Python Beginner',
  estimatedHours: 3,
  technologies: ['Python', 'CLI', 'Input validation'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code', 'Git'],
  priorKnowledge: ['Variables and functions', 'Basic terminal usage'],
  outcomes: ['Build a menu-driven calculator in VS Code', 'Validate numeric input and handle divide-by-zero', 'Document sample I/O and manual tests'],
  careerTracks: ['devops-engineer', 'platform-engineer'],
  certObjectives: [],
  examDomains: [],
  overview: 'Write a beginner Python calculator that runs in your local terminal via VS Code. Study Lab does not execute Python — attach code and test notes as evidence.',
  businessScenario: 'A helpdesk intern needs a tiny offline tool to double-check arithmetic while studying subnet math. You will deliver a clean CLI app with clear errors — not a GUI framework.',
  technicalRequirements: ['Support add, subtract, multiply, divide', 'Reject non-numeric input with a friendly message', 'Handle divide-by-zero without crashing', 'README with run instructions (python main.py)', 'Sample I/O transcript for at least five cases'],
  architectureNotes: 'Single-module or main.py + functions. No network. Diagram optional flowchart of menu loop.',
  addressingPlan: [
    { name: 'Entry', network: 'main.py', mask: 'module', notes: 'CLI loop' },
    { name: 'Sample in', network: '12 / 0', mask: 'error path', notes: 'Must not traceback unhandled' }
  ],
  milestones: labMilestones(
    ['Function list', 'Test case table', 'Error message catalog'],
    ['Implement calculator in VS Code', 'Add input validation', 'Write README'],
    ['Run sample I/O', 'Capture divide-by-zero case', 'Peer-check README'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['All four operations produce correct results', 'Invalid input reprompts or exits cleanly', 'Divide-by-zero shows error string'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'float("abc") crashes.', hint: 'Wrap input parsing in try/except ValueError.' },
    { id: 't2', symptom: 'Menu loops forever.', hint: 'Provide quit option and test it.' }
  ],
  solutionGuide: 'Keep functions pure where possible; centralize input parsing. Collapsed example approach: loop → match op → try compute. Attach main.py + transcript.',
  portfolioDeliverables: codeDeliverables(),
})

export const py02: ProjectDoc = pythonProject({
  id: 'py-02-password-generator',
  slug: 'python-password-generator',
  title: 'Password Generator',
  curriculumOrder: 2,
  difficulty: 'beginner',
  category: 'Python Beginner',
  estimatedHours: 3,
  technologies: ['Python', 'secrets', 'CLI'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code'],
  priorKnowledge: ['Strings and loops', 'CLI calculator project'],
  outcomes: ['Generate cryptographically stronger passwords with secrets module', 'Parameterize length and character classes', 'Document threat notes: do not log passwords to Study Lab notes casually'],
  careerTracks: ['cybersecurity-engineer', 'devops-engineer'],
  certObjectives: ['SY0-701 1.4', 'SY0-701 4.5'],
  examDomains: ['General Security Concepts', 'Security Operations'],
  overview: 'Build a local password generator using Python\'s secrets module. Emphasize safe randomness and responsible handling of outputs.',
  businessScenario: 'Students reuse "Password1" across lab accounts. You will ship a generator that creates strong lab passwords and teaches why random.choice(random) is weaker.',
  technicalRequirements: ['Use secrets (not random) for generation', 'Flags or prompts for length, digits, symbols', 'Guarantee at least one char from each selected class', 'Never write passwords to project progress notes in plaintext if avoidable', 'Unit-style tests or manual matrix documented'],
  architectureNotes: 'CLI script; optional argparse. No network calls. Document entropy qualitatively.',
  addressingPlan: [
    { name: 'Default length', network: '16', mask: 'chars', notes: 'Configurable' },
    { name: 'Charset', network: 'alnum+symbols', mask: 'policy', notes: 'Document excluded ambiguous chars optional' }
  ],
  milestones: labMilestones(
    ['CLI flag spec', 'Charset policy', 'Test matrix'],
    ['Implement with secrets', 'Add validation for length minima', 'Write tests/README'],
    ['Generate 10 samples', 'Verify charset constraints', 'Show secrets import evidence'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['Passwords meet length and class rules', 'Two runs differ', 'README warns about storing secrets'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Passwords sometimes miss symbols.', hint: 'Build required characters first, then fill remaining length and shuffle with secrets.' },
    { id: 't2', symptom: 'Used random module.', hint: 'Replace with secrets; document why.' }
  ],
  solutionGuide: 'secrets.choice over a composed alphabet; enforce constraints; shuffle. Attach script + sample outputs (fake lab only).',
  portfolioDeliverables: codeDeliverables(),
})

export const py03: ProjectDoc = pythonProject({
  id: 'py-03-file-organizer',
  slug: 'python-file-organizer',
  title: 'File Organizer Script',
  curriculumOrder: 3,
  difficulty: 'beginner',
  category: 'Python Beginner',
  estimatedHours: 4,
  technologies: ['Python', 'pathlib', 'Filesystem'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code'],
  priorKnowledge: ['pathlib or os basics', 'Dry-run vs apply mindset'],
  outcomes: ['Organize files into folders by extension using pathlib', 'Support dry-run mode', 'Log every move for rollback notes'],
  careerTracks: ['devops-engineer', 'system-administrator'],
  certObjectives: [],
  examDomains: [],
  overview: 'Automate messy download folders with a Python organizer. Run only against a disposable lab directory — never production shares without backup.',
  businessScenario: 'Your Downloads folder has hundreds of mixed files. You need a script that sorts by extension with a dry-run preview before touching anything.',
  technicalRequirements: ['Dry-run prints planned moves without changing files', '--apply performs moves', 'Skip or quarantine unknown extensions per policy', 'Log file of actions', 'Safety: refuse to run on / or home root without explicit flag'],
  architectureNotes: 'Script + lab_sandbox/ sample tree in repo. Diagram extension → destination folder map.',
  addressingPlan: [
    { name: 'Sandbox', network: './lab_sandbox', mask: 'path', notes: 'Only test target' },
    { name: 'Rules', network: '.pdf→docs', mask: 'map', notes: 'Document full map' }
  ],
  milestones: labMilestones(
    ['Extension map', 'CLI flags', 'Safety checks'],
    ['Implement pathlib moves', 'Add dry-run', 'Create sample sandbox'],
    ['Dry-run output', 'Apply on sandbox', 'Log review'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['Dry-run changes nothing', 'Apply sorts correctly', 'Refuses unsafe roots'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'File exists at destination.', hint: 'Define overwrite/rename policy and test it.' },
    { id: 't2', symptom: 'Permission error.', hint: 'Catch OSError and continue with logged failure.' }
  ],
  solutionGuide: 'pathlib.Path.rglob carefully; never follow unintended symlinks without policy. Attach script + before/after tree.',
  portfolioDeliverables: codeDeliverables(),
})

export const py04: ProjectDoc = pythonProject({
  id: 'py-04-ip-validator',
  slug: 'python-ip-validator',
  title: 'IPv4 Address Validator',
  curriculumOrder: 4,
  difficulty: 'beginner',
  category: 'Python Beginner',
  estimatedHours: 3,
  technologies: ['Python', 'IPv4', 'ipaddress'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code'],
  priorKnowledge: ['IPv4 dotted decimal', 'Exceptions'],
  outcomes: ['Validate IPv4 addresses and optionally CIDR strings', 'Classify private vs public vs loopback using ipaddress', 'Provide clear sample I/O table'],
  careerTracks: ['network-engineer', 'devops-engineer'],
  certObjectives: ['N10-009 1.4'],
  examDomains: [],
  overview: 'Practice defensive parsing of IPv4 strings with the ipaddress module. Useful foundation before subnet tools.',
  businessScenario: 'A spreadsheet of host inventories has typos like 10.0.0.256. You need a validator script that flags bad rows and labels RFC1918 addresses.',
  technicalRequirements: ['Accept addresses from CLI args or a text file', 'Use ipaddress (prefer over handmade split logic)', 'Report invalid entries with reasons', 'Label private/loopback/link-local when valid', 'Sample file with mixed good/bad rows'],
  architectureNotes: 'Validator function + CLI. Optional CSV output. No packet operations.',
  addressingPlan: [
    { name: 'Good', network: '192.168.1.10', mask: 'valid', notes: 'private' },
    { name: 'Bad', network: '172.16.0.256', mask: 'invalid', notes: 'octet range' },
    { name: 'CIDR', network: '10.0.0.0/8', mask: 'optional', notes: 'network object' }
  ],
  milestones: labMilestones(
    ['I/O contract', 'Classification rules', 'Fixture file'],
    ['Implement validator', 'Wire CLI', 'Add fixtures'],
    ['Run fixture file', 'Assert labels', 'Document edge cases'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['All fixture rows classified correctly', 'Empty input handled', 'IPv6 explicitly rejected or deferred with message'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Leading zeros confusion.', hint: 'Document ipaddress behavior; add tests for 010.0.0.1 if relevant.' },
    { id: 't2', symptom: 'Treating host bits in CIDR wrongly.', hint: 'Use ip_network with strict=False carefully and document.' }
  ],
  solutionGuide: 'ipaddress.ip_address / ip_network; catch ValueError. Attach script + fixture results table.',
  portfolioDeliverables: codeDeliverables(),
})

export const py05: ProjectDoc = pythonProject({
  id: 'py-05-subnet-calculator',
  slug: 'python-subnet-calculator',
  title: 'Subnet Calculator (CLI)',
  curriculumOrder: 5,
  difficulty: 'beginner',
  category: 'Python Beginner',
  estimatedHours: 4,
  technologies: ['Python', 'IPv4', 'CIDR', 'ipaddress'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code', 'Spreadsheet (Excel / Google Sheets)'],
  priorKnowledge: ['IP validator', 'Subnetting math'],
  outcomes: ['Compute network, broadcast, usable range, and host count from CIDR', 'Cross-check against Study Lab subnet tool manually', 'Export results as text/CSV'],
  careerTracks: ['network-engineer', 'devops-engineer'],
  certObjectives: ['N10-009 1.4', 'N10-009 1.7'],
  examDomains: [],
  overview: 'Implement a local subnet calculator in Python. Use Study Lab\'s subnet tool only as an external cross-check — do not call it from code.',
  businessScenario: 'During Network+ study you want a scriptable calculator for batch prefixes in a lab workbook.',
  technicalRequirements: ['Input: network/CIDR', 'Output: network, mask, broadcast, first/last usable, host count', 'Reject invalid prefixes', 'Batch mode from file', 'Comparison notes vs manual/Study Lab tool for 3 prefixes'],
  architectureNotes: 'Pure functions around ipaddress.ip_network. CLI prints table.',
  addressingPlan: [
    { name: 'Example', network: '172.16.40.0/26', mask: '255.255.255.192', notes: '62 hosts usable typical' },
    { name: 'Example', network: '10.0.0.0/30', mask: '255.255.255.252', notes: 'Point-to-point' }
  ],
  milestones: labMilestones(
    ['Output schema', 'Batch file format', 'Cross-check list'],
    ['Implement calculations', 'CLI + batch', 'README examples'],
    ['Match Study Lab tool for samples', 'Edge /31 /32 notes', 'Invalid CIDR errors'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['Three prefixes match expected table', 'Batch file processes all lines', '/32 and /31 behavior documented'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Off-by-one on usable hosts.', hint: 'Remember network/broadcast reservations for <=/30 traditionally; document special cases.' },
    { id: 't2', symptom: 'String formatting messy.', hint: 'Use consistent tabular output.' }
  ],
  solutionGuide: 'ip_network provides network/broadcast/hosts(); be explicit about usable host policy. Attach script + comparison sheet.',
  portfolioDeliverables: codeDeliverables(),
})

export const py06: ProjectDoc = pythonProject({
  id: 'py-06-config-parser',
  slug: 'python-config-parser',
  title: 'Network Config Parser',
  curriculumOrder: 6,
  difficulty: 'intermediate',
  category: 'Python Intermediate',
  estimatedHours: 5,
  technologies: ['Python', 'Parsing', 'Regex', 'JSON'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code', 'Git'],
  priorKnowledge: ['File I/O', 'Regex or line parsing', 'JSON serialization'],
  outcomes: ['Parse sample router/switch config snippets into structured JSON', 'Extract interfaces, IPs, and VLANs', 'Handle malformed lines gracefully'],
  careerTracks: ['network-engineer', 'devops-engineer', 'platform-engineer'],
  certObjectives: ['N10-009 5.2'],
  examDomains: [],
  overview: 'Parse offline config text exports from lab devices into JSON for documentation. No live device access required for the parser itself.',
  businessScenario: 'You have Packet Tracer/GNS3 running-config exports and want a quick inventory of interfaces without reading 2,000 lines by hand.',
  technicalRequirements: ['Input: text config files in a samples/ folder', 'Output: JSON with hostname, interfaces, ips, vlans when present', 'Unknown lines counted/skipped with warnings', 'At least three sample configs', 'Tests for happy path + malformed file'],
  architectureNotes: 'Parser module + CLI. Do not attempt full IOS grammar — document supported subset.',
  addressingPlan: [
    { name: 'Sample A', network: 'hostname EDGE1', mask: 'parse', notes: 'Two interfaces' },
    { name: 'Output', network: 'edge1.json', mask: 'JSON', notes: 'Structured inventory' }
  ],
  milestones: labMilestones(
    ['Supported syntax list', 'JSON schema', 'Sample configs'],
    ['Implement parser', 'Write samples', 'Add tests'],
    ['Parse all samples', 'Diff JSON to expected', 'Malformed case'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['JSON matches expected fixtures', 'Warning emitted on junk lines', 'README lists unsupported syntax'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Greedy regex eats too much.', hint: 'Anchor patterns; test with indented child lines.' },
    { id: 't2', symptom: 'Hostname missing.', hint: 'Define required vs optional fields.' }
  ],
  solutionGuide: 'Line-oriented state machine beats fragile mega-regex. Attach parser + samples + expected JSON.',
  portfolioDeliverables: codeDeliverables(),
})

export const py07: ProjectDoc = pythonProject({
  id: 'py-07-log-analyzer',
  slug: 'python-log-analyzer',
  title: 'Log Analyzer',
  curriculumOrder: 7,
  difficulty: 'intermediate',
  category: 'Python Intermediate',
  estimatedHours: 5,
  technologies: ['Python', 'Logs', 'Counters', 'Reporting'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code'],
  priorKnowledge: ['File parsing', 'Dictionaries/counters', 'Basic security log awareness'],
  outcomes: ['Analyze synthetic auth/firewall logs for top talkers and failures', 'Produce a summary report markdown/text', 'Flag simple brute-force patterns'],
  careerTracks: ['cybersecurity-engineer', 'devops-engineer', 'system-administrator'],
  certObjectives: ['SY0-701 4.3', 'SY0-701 4.4'],
  examDomains: ['Security Operations', 'Threats, Vulnerabilities & Mitigations'],
  overview: 'Write a log analyzer that runs on synthetic log files you create. Emphasizes detection thinking without attacking live systems.',
  businessScenario: 'SOC-lite for your home lab: you want a script that summarizes failed SSH logins and top source IPs from a day of logs.',
  technicalRequirements: ['Ingest newline log format you define (document schema)', 'Counts: total events, failures, unique IPs', 'Simple threshold alert for failed auth per IP', 'Markdown or text report output', 'Synthetic logs checked into repo'],
  architectureNotes: 'Offline files only. Diagram log → parser → aggregations → report.',
  addressingPlan: [
    { name: 'Log schema', network: 'ts user src_ip result', mask: 'fields', notes: 'Document separators' },
    { name: 'Threshold', network: '>=10 fails/IP', mask: 'alert', notes: 'Configurable' }
  ],
  milestones: labMilestones(
    ['Log schema', 'Metrics list', 'Alert threshold'],
    ['Generate synthetic logs', 'Implement analyzer', 'Emit report'],
    ['Known fixture yields known counts', 'Alert fires on noisy IP', 'Benign log stays quiet'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['Counts match hand tally', 'Report generated', 'Threshold configurable'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Timezone parsing issues.', hint: 'Store UTC timestamps in fixtures; document format.' },
    { id: 't2', symptom: 'Memory blowup on large files.', hint: 'Stream line-by-line; do not read entire file into one string unnecessarily.' }
  ],
  solutionGuide: 'collections.Counter; streaming reads; clear schema docs. Attach analyzer + fixtures + sample report.',
  portfolioDeliverables: codeDeliverables(),
})

export const py08: ProjectDoc = pythonProject({
  id: 'py-08-rest-client',
  slug: 'python-rest-api-client',
  title: 'REST API Client',
  curriculumOrder: 8,
  difficulty: 'intermediate',
  category: 'Python Intermediate',
  estimatedHours: 5,
  technologies: ['Python', 'HTTP', 'JSON', 'requests/httpx'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code'],
  priorKnowledge: ['JSON', 'HTTP verbs', 'Virtualenv/pip'],
  outcomes: ['Build a small client against a public or local mock API', 'Handle timeouts, non-200s, and JSON errors', 'Store no secrets in git'],
  careerTracks: ['devops-engineer', 'platform-engineer', 'cloud-engineer'],
  certObjectives: ['SY0-701 4.1'],
  examDomains: ['Security Operations'],
  overview: 'Create a REST client in VS Code using requests or httpx. Prefer httpbin.org, JSONPlaceholder, or a local mock — never scrape authenticated production systems without authorization.',
  businessScenario: 'You need a teaching client that pulls sample JSON and prints a normalized table, with solid error handling for interviews/portfolio.',
  technicalRequirements: ['GET at least one collection endpoint; optional POST to a mock', 'Timeouts and clear error messages', 'Config via env vars for base URL', 'requirements.txt pinned reasonably', 'Record sample responses (redact secrets)'],
  architectureNotes: 'client.py + config. Diagram request → response → parse → print.',
  addressingPlan: [
    { name: 'Base URL', network: 'ENV API_BASE', mask: 'config', notes: 'Default to public mock' },
    { name: 'Timeout', network: '10s', mask: 'policy', notes: 'Document' }
  ],
  milestones: labMilestones(
    ['Endpoint list', 'Error catalog', 'Env config'],
    ['Implement client', 'Add error handling', 'Freeze requirements'],
    ['Successful GET', 'Forced timeout/404 handling', 'Env override works'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['Happy path prints normalized data', '404 does not traceback raw', 'No API keys committed'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'SSL or network blocked offline.', hint: 'Provide a recorded fixture mode that reads local JSON.' },
    { id: 't2', symptom: 'Secrets in code.', hint: 'Move to env; add .gitignore notes.' }
  ],
  solutionGuide: 'Thin wrapper functions; raise typed errors; fixture mode for offline. Attach client + sample output.',
  portfolioDeliverables: codeDeliverables(),
})

export const py09: ProjectDoc = pythonProject({
  id: 'py-09-inventory-tool',
  slug: 'python-inventory-tool',
  title: 'Host Inventory Tool',
  curriculumOrder: 9,
  difficulty: 'intermediate',
  category: 'Python Intermediate',
  estimatedHours: 5,
  technologies: ['Python', 'CSV/JSON', 'Inventory'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code', 'Spreadsheet (Excel / Google Sheets)'],
  priorKnowledge: ['Config parser or REST client', 'Data modeling'],
  outcomes: ['Maintain a host inventory with CRUD via CLI', 'Validate IPs using prior validator patterns', 'Export CSV for spreadsheet review'],
  careerTracks: ['system-administrator', 'platform-engineer', 'devops-engineer'],
  certObjectives: [],
  examDomains: [],
  overview: 'Build a lightweight CMDB-lite for lab hosts stored in JSON/CSV. All data is local synthetic inventory.',
  businessScenario: 'Your Proxmox lab grew to a dozen VMs and nobody remembers owners. You need an inventory CLI: add, list, search, export.',
  technicalRequirements: ['Fields: hostname, ip, role, owner, tags', 'Commands: add/list/search/delete/export', 'IP validation on add', 'Persist to inventory.json', 'Export CSV'],
  architectureNotes: 'CLI → inventory service → JSON file. Diagram entity fields.',
  addressingPlan: [
    { name: 'Record', network: 'ubuntu-lab', mask: '10.50.20.10', notes: 'role=jump' },
    { name: 'Store', network: 'inventory.json', mask: 'file', notes: 'Local only' }
  ],
  milestones: labMilestones(
    ['Schema', 'CLI UX', 'Validation rules'],
    ['Implement CRUD', 'Add export', 'Seed sample data'],
    ['CRUD operations', 'Bad IP rejected', 'CSV opens in spreadsheet'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['Search by tag works', 'Delete is idempotent/safe', 'File format documented'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Concurrent edits corrupt JSON.', hint: 'Document single-user lab assumption or use atomic write.' },
    { id: 't2', symptom: 'Duplicate hostnames.', hint: 'Enforce unique hostname constraint.' }
  ],
  solutionGuide: 'Atomic replace writes; validate before save. Attach app + sample inventory + CSV.',
  portfolioDeliverables: codeDeliverables(),
})

export const py10: ProjectDoc = pythonProject({
  id: 'py-10-backup-script',
  slug: 'python-backup-script',
  title: 'Backup Script',
  curriculumOrder: 10,
  difficulty: 'intermediate',
  category: 'Python Intermediate',
  estimatedHours: 5,
  technologies: ['Python', 'shutil', 'Tar/zip', 'Scheduling notes'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code'],
  priorKnowledge: ['pathlib', 'File organizer', 'Backup concepts'],
  outcomes: ['Zip/tar selected directories with timestamped artifacts', 'Verify archive integrity', 'Document scheduling via cron/Task Scheduler externally'],
  careerTracks: ['system-administrator', 'devops-engineer'],
  certObjectives: ['SY0-701 3.3'],
  examDomains: ['Security Architecture'],
  overview: 'Automate filesystem backups for lab project folders. Run locally; do not push backups to random cloud buckets from this project.',
  businessScenario: 'You keep losing lab notes. A Python script should archive a source directory to a backup destination with rotation count.',
  technicalRequirements: ['Timestamped archive names', 'Configurable source/dest', 'Retention: keep last N backups', 'Verification: list archive contents or checksum', 'Dry-run mode'],
  architectureNotes: 'backup.py using zipfile or tarfile. Diagram source → archive → dest → retention prune.',
  addressingPlan: [
    { name: 'Source', network: './lab_data', mask: 'dir', notes: 'Synthetic' },
    { name: 'Dest', network: './backups', mask: 'dir', notes: 'Local disk' }
  ],
  milestones: labMilestones(
    ['Retention policy', 'Naming scheme', 'Cron example notes'],
    ['Implement archive + prune', 'Add verify', 'Write scheduler notes'],
    ['Create backup', 'Prune old', 'Verify contents'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['Archive opens and contains expected files', 'Retention deletes older than N', 'Dry-run makes no files'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Open file locked on Windows.', hint: 'Skip/retry policy documented.' },
    { id: 't2', symptom: 'Backup includes secrets accidentally.', hint: 'Add exclude patterns (.env).' }
  ],
  solutionGuide: 'Exclude sensitive patterns; verify after write; document external scheduler. Attach script + sample backup listing.',
  portfolioDeliverables: codeDeliverables(),
})

export const py11: ProjectDoc = pythonProject({
  id: 'py-11-netmiko-automation',
  slug: 'python-netmiko-automation',
  title: 'Netmiko Device Automation',
  curriculumOrder: 11,
  difficulty: 'advanced',
  category: 'Python Advanced',
  estimatedHours: 7,
  technologies: ['Python', 'Netmiko', 'SSH', 'Network automation'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code', 'Netmiko (pip) + lab network devices / CML / GNS3', 'Git'],
  priorKnowledge: ['SSH keys', 'REST client discipline', 'Inventory tool', 'Lab devices you own'],
  outcomes: ['Automate show/config commands against lab devices with Netmiko', 'Store device creds in env/vault not git', 'Capture before/after configs as evidence'],
  careerTracks: ['network-engineer', 'devops-engineer', 'platform-engineer'],
  certObjectives: ['N10-009 5.3', 'SY0-701 4.5'],
  examDomains: ['Security Operations'],
  overview: 'Use Netmiko from VS Code to automate your own lab devices (GNS3/CML/physical). Never target unauthorized networks.',
  businessScenario: 'Collect show ip interface brief from three lab routers nightly inventory-style. Manual SSH is too slow and error-prone.',
  technicalRequirements: ['Inventory file of lab devices (IPs/roles)', 'Netmiko connections with per-device device_type', 'Run read-only show commands; optional safe config in lab only', 'Save outputs to stamped files', 'Ethics note in README: authorized lab only'],
  architectureNotes: 'inventory.yml → Netmiko sessions → outputs/. Diagram control host vs devices.',
  addressingPlan: [
    { name: 'R1', network: '192.168.122.11', mask: 'lab', notes: 'cisco_ios example' },
    { name: 'Control PC', network: 'Your VS Code host', mask: 'N/A', notes: 'Has Netmiko installed' }
  ],
  milestones: labMilestones(
    ['Inventory schema', 'Command set', 'Secret handling plan'],
    ['Implement Netmiko runner', 'Wire inventory', 'Collect outputs'],
    ['Three devices polled or simulated with recorded sessions', 'No secrets in git grep', 'Failure on unreachable host handled'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['Outputs saved per device', 'Connection errors logged cleanly', 'README authorization statement present'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Auth failures.', hint: 'Check device_type, username, enable secret handling, SSH vs telnet lab realities.' },
    { id: 't2', symptom: 'Paging breaks parsing.', hint: 'Disable paging (terminal length 0) in lab commands.' }
  ],
  solutionGuide: 'Start read-only; use env vars; disable paging; catch Netmiko exceptions. Attach redacted outputs.',
  portfolioDeliverables: codeDeliverables(),
})

export const py12: ProjectDoc = pythonProject({
  id: 'py-12-compliance-checker',
  slug: 'python-compliance-checker',
  title: 'Config Compliance Checker',
  curriculumOrder: 12,
  difficulty: 'advanced',
  category: 'Python Advanced',
  estimatedHours: 6,
  technologies: ['Python', 'Policy as code', 'Parsing'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code', 'Git'],
  priorKnowledge: ['Config parser', 'Netmiko automation or static config samples'],
  outcomes: ['Encode security baselines as rules (SSH version, no telnet, banner present)', 'Evaluate configs and emit pass/fail report', 'Map findings to remediation suggestions'],
  careerTracks: ['cybersecurity-engineer', 'network-engineer', 'devops-engineer'],
  certObjectives: ['SY0-701 4.1', 'SY0-701 5.1'],
  examDomains: ['Security Operations', 'Security Program Management'],
  overview: 'Turn parsed configs into compliance results against a documented baseline. Works offline on saved configs.',
  businessScenario: 'Audit week: prove lab routers disable telnet and require SSH. You need an automated checker with a clear report for your portfolio.',
  technicalRequirements: ['Rule pack YAML/JSON (at least five rules)', 'Evaluator producing PASS/FAIL/ERROR per rule per device', 'Remediation text for failures', 'CI-friendly exit code non-zero on fails (document)', 'Sample compliant and non-compliant configs'],
  architectureNotes: 'rules + parser + engine + report. Diagram policy evaluation flow.',
  addressingPlan: [
    { name: 'Rule SSH', network: 'transport input ssh', mask: 'must', notes: 'FAIL if telnet present' },
    { name: 'Report', network: 'compliance.md', mask: 'out', notes: 'Human readable' }
  ],
  milestones: labMilestones(
    ['Rule catalog', 'Severity model', 'Report format'],
    ['Implement engine', 'Author rules', 'Add samples'],
    ['Compliant sample all PASS', 'Non-compliant detects fails', 'Exit code behavior'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['Five rules evaluated', 'Report lists remediation', 'Deterministic results on fixtures'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'False positives on comments.', hint: 'Strip comments or tighten patterns.' },
    { id: 't2', symptom: 'Rule drift undocumented.', hint: 'Version the rule pack.' }
  ],
  solutionGuide: 'Keep rules data-driven; engine stays generic. Attach rules + report samples.',
  portfolioDeliverables: codeDeliverables(),
})

export const py13: ProjectDoc = pythonProject({
  id: 'py-13-fastapi-service',
  slug: 'python-fastapi-service',
  title: 'FastAPI Lab Service',
  curriculumOrder: 13,
  difficulty: 'advanced',
  category: 'Python Advanced',
  estimatedHours: 7,
  technologies: ['Python', 'FastAPI', 'OpenAPI', 'Uvicorn'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code', 'FastAPI + Uvicorn (local)', 'Git'],
  priorKnowledge: ['REST client', 'Type hints', 'Virtualenv'],
  outcomes: ['Expose a small local API (inventory or subnet helper) with FastAPI', 'Document OpenAPI and auth stub notes', 'Never bind dangerously to public interfaces without understanding risk'],
  careerTracks: ['platform-engineer', 'devops-engineer', 'cloud-engineer'],
  certObjectives: ['SY0-701 3.2', 'SY0-701 4.1'],
  examDomains: ['Security Architecture', 'Security Operations'],
  overview: 'Build a local FastAPI service in VS Code/Uvicorn for lab automation helpers. Study Lab does not host your API.',
  businessScenario: 'You want a local HTTP API that returns subnet calculations or inventory records for other tools to call during study.',
  technicalRequirements: ['At least three endpoints (health, get resource, create/validate)', 'Pydantic models for request/response', 'OpenAPI available at /docs locally', 'Bind to 127.0.0.1 by default; document risks of 0.0.0.0', 'Basic test client tests'],
  architectureNotes: 'FastAPI app modules: routers, models, services. Diagram client → localhost:8000 → service.',
  addressingPlan: [
    { name: 'Uvicorn', network: '127.0.0.1:8000', mask: 'bind', notes: 'Default loopback' },
    { name: 'Health', network: 'GET /health', mask: 'route', notes: '200 OK' }
  ],
  milestones: labMilestones(
    ['API contract', 'Models', 'Security bind decision'],
    ['Implement FastAPI app', 'Add tests', 'Write run docs'],
    ['/docs loads', 'Tests pass', 'Health check'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['OpenAPI shows models', 'Invalid payload returns 422', 'README security bind warning present'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'CORS confusion.', hint: 'Only add CORS if a local web UI needs it; keep tight.' },
    { id: 't2', symptom: 'Accidental public bind.', hint: 'Default to 127.0.0.1; firewall notes.' }
  ],
  solutionGuide: 'Small routers; dependency-inject settings; test with TestClient. Attach app + screenshot of /docs.',
  portfolioDeliverables: codeDeliverables(),
})

export const py14: ProjectDoc = pythonProject({
  id: 'py-14-db-integration',
  slug: 'python-database-integration',
  title: 'Python Database Integration',
  curriculumOrder: 14,
  difficulty: 'advanced',
  category: 'Python Advanced',
  estimatedHours: 6,
  technologies: ['Python', 'SQL', 'SQLite/PostgreSQL', 'DB-API'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code', 'SQLite', 'PostgreSQL'],
  priorKnowledge: ['SQL basics', 'FastAPI or inventory tool', 'Parameterized queries awareness'],
  outcomes: ['Connect Python to SQLite or PostgreSQL externally', 'Use parameterized queries only', 'Migrate a small schema and seed synthetic data'],
  careerTracks: ['platform-engineer', 'devops-engineer', 'cybersecurity-engineer'],
  certObjectives: ['SY0-701 2.3', 'SY0-701 4.1'],
  examDomains: ['Threats, Vulnerabilities & Mitigations', 'Security Operations'],
  overview: 'Integrate Python with an external database using safe parameterized queries. No SQL runner inside Study Lab.',
  businessScenario: 'Your inventory JSON outgrew convenience. Move hosts into SQLite/Postgres and query them from Python for reports.',
  technicalRequirements: ['Schema migration script (SQL file or tool)', 'Seed synthetic hosts', 'Python CRUD with parameters (never f-string SQL)', 'Intentionally show a blocked unsafe pattern in docs (not in code path)', 'Connection config via env'],
  architectureNotes: 'DB external → Python data access layer → CLI/API. Diagram trust boundary.',
  addressingPlan: [
    { name: 'DB', network: 'localhost:5432 or file.db', mask: 'conn', notes: 'Lab only' },
    { name: 'Table hosts', network: 'hostname PK', mask: 'schema', notes: 'ip, role, owner' }
  ],
  milestones: labMilestones(
    ['ER for hosts', 'DAO interface', 'Env config'],
    ['Create schema/seed', 'Implement parameterized DAO', 'Demo queries'],
    ['CRUD works', 'SQL injection attempt string does not break query', 'Env-based connect'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['Seed row counts match', 'Search by role works', 'No string-interpolated SQL in code review'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Driver mismatch.', hint: 'Document psycopg/sqlite3 versions.' },
    { id: 't2', symptom: 'Transactions partial writes.', hint: 'Use commit/rollback clearly.' }
  ],
  solutionGuide: 'Always parameterize; wrap transactions; keep credentials out of git. Attach schema + DAO + query results.',
  portfolioDeliverables: codeDeliverables(),
})

export const py15: ProjectDoc = pythonProject({
  id: 'py-15-reporting-pipeline',
  slug: 'python-reporting-pipeline',
  title: 'Automated Reporting Pipeline',
  curriculumOrder: 15,
  difficulty: 'advanced',
  category: 'Python Advanced',
  estimatedHours: 7,
  technologies: ['Python', 'ETL-lite', 'Reports', 'Scheduling notes'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code', 'SQLite', 'Git'],
  priorKnowledge: ['DB integration', 'Log analyzer', 'FastAPI optional'],
  outcomes: ['Build a pipeline: extract lab data → transform → markdown/HTML report', 'Make it idempotent and schedulable', 'Include charts via text/CSV suitable for spreadsheet'],
  careerTracks: ['devops-engineer', 'platform-engineer', 'cybersecurity-engineer'],
  certObjectives: ['SY0-701 4.3', 'SY0-701 5.3'],
  examDomains: ['Security Operations', 'Security Program Management'],
  overview: 'Capstone Python project: schedule-friendly reporting over inventory/compliance/log outputs produced earlier. Runs entirely on your machine.',
  businessScenario: 'Weekly study review: you want a generated report summarizing inventory counts, compliance fails, and auth failures — emailed or saved to disk.',
  technicalRequirements: ['Pipeline stages documented (extract/transform/load-report)', 'Inputs from prior project artifacts or fixtures', 'Markdown report with timestamp', 'Non-zero exit if critical compliance fails (optional flag)', 'Scheduler notes (cron/Task Scheduler)'],
  architectureNotes: 'pipeline.py orchestrates modules; outputs/reports/. Diagram stage graph.',
  addressingPlan: [
    { name: 'Inputs', network: './data', mask: 'dir', notes: 'Fixtures OK' },
    { name: 'Output', network: './reports/weekly.md', mask: 'file', notes: 'Artifact' }
  ],
  milestones: labMilestones(
    ['Stage graph', 'Report outline', 'Failure policy'],
    ['Implement pipeline', 'Wire fixtures', 'Generate sample report'],
    ['Idempotent rerun', 'Report sections complete', 'Scheduler dry notes'],
    { design: 'Spec & test cases', build: 'Code in VS Code', verify: 'Run tests externally' },
  ),
  verificationSteps: ['Report generated from fixtures', 'Rerun does not duplicate corruptly', 'README explains schedule'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Missing input files.', hint: 'Fail fast with clear errors.' },
    { id: 't2', symptom: 'Unstable ordering in outputs.', hint: 'Sort records for deterministic diffs.' }
  ],
  solutionGuide: 'Small pure transforms; deterministic sorts; clear exit codes. Attach pipeline + sample weekly report.',
  portfolioDeliverables: codeDeliverables(),
})

export const pythonProjects: ProjectDoc[] = [py01, py02, py03, py04, py05, py06, py07, py08, py09, py10, py11, py12, py13, py14, py15]
