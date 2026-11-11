import type { ProjectDoc } from '@/types/project'
import {
  labMilestones,
  mermaidDiagram,
  securityDeliverables,
  securityProject,
} from '../helpers'

export const sec01: ProjectDoc = securityProject({
  id: 'sec-01-sqli-fundamentals',
  slug: 'sqli-fundamentals-juice-shop',
  title: 'SQLi Fundamentals (Juice Shop)',
  curriculumOrder: 1,
  difficulty: 'beginner',
  category: 'AppSec Education',
  estimatedHours: 4,
  technologies: ['SQLi', 'OWASP', 'Juice Shop'],
  requiredSoftware: ['OWASP Juice Shop (local disposable lab only)', 'Burp Suite Community or browser DevTools (authorized lab only)', 'Draw.io'],
  priorKnowledge: ['HTTP basics', 'SQL SELECT mental model', 'Ethics: authorized labs only'],
  outcomes: ['Explain SQLi classes at a high level using Juice Shop only', 'Document request/response evidence from a disposable local lab', 'Write an ethics/scope statement forbidding unauthorized testing'],
  careerTracks: ['cybersecurity-engineer'],
  certObjectives: ['SY0-701 2.3', 'SY0-701 4.1', 'SY0-701 1.2'],
  examDomains: ['Threats, Vulnerabilities & Mitigations', 'General Security Concepts', 'Security Operations'],
  overview: 'Learn SQL injection fundamentals exclusively against OWASP Juice Shop (or another disposable lab you own). Study Lab provides instruction only — no exploit runner.',
  businessScenario: 'Your mentor assigns Juice Shop challenges for education. You must capture learning notes and never reuse techniques against systems without written authorization.',
  technicalRequirements: ['Written scope: Juice Shop local instance URL only', 'Diagram of browser → app → DB trust boundary', 'Notes on at least one SQLi learning challenge completed in Juice Shop', 'Evidence screenshots redacting session secrets if needed', 'Ethics acknowledgment in portfolio'],
  architectureNotes: 'Attacker-learner browser → Juice Shop container/app → embedded DB. Label "AUTHORIZED LAB ONLY" on diagram.',
  architectureDiagrams: [
    mermaidDiagram(
      'sec-01-boundary',
      'Authorized lab trust boundary',
      `flowchart LR
  Learner[Learner browser] --> JS[Juice Shop localhost]
  JS --> DB[(Embedded DB)]
  Prod[Production systems] -.->|FORBIDDEN| Learner`,
      'AUTHORIZED LAB ONLY — never point tooling at systems you do not own.',
    ),
  ],
  addressingPlan: [
    { name: 'Juice Shop', network: 'http://127.0.0.1:3000', mask: 'local', notes: 'Default local; confirm yours' },
    { name: 'Out of scope', network: 'Any non-owned system', mask: 'FORBIDDEN', notes: 'Hard rule' }
  ],
  milestones: labMilestones(
    ['Scope statement', 'Trust boundary diagram', 'Learning goals'],
    ['Run Juice Shop locally', 'Complete fundamentals challenge path', 'Capture notes'],
    ['Ethics file present', 'Evidence from localhost only', 'Reflection on impact'],
    { design: 'Scope & ethics', build: 'Lab in Juice Shop / local app', verify: 'Defensive retest' },
  ),
  verificationSteps: ['Scope statement signed in notes', 'Screenshots show local Juice Shop', 'No credentials from real employers used'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Juice Shop not starting.', hint: 'Follow official install; Docker/Node per docs; do not port-forward to Internet casually.', severity: 'medium' },
    { id: 't2', symptom: 'Tempted to test a live site.', hint: 'STOP — out of scope; only disposable labs.', severity: 'critical' },
  ],
  solutionGuide: 'Keep learning inside Juice Shop; focus on understanding impact and reporting. Attach scope + evidence + reflection.',
  portfolioDeliverables: securityDeliverables(),
})

export const sec02: ProjectDoc = securityProject({
  id: 'sec-02-unsafe-queries',
  slug: 'unsafe-query-patterns',
  title: 'Unsafe Query Patterns',
  curriculumOrder: 2,
  difficulty: 'beginner',
  category: 'Secure Coding',
  estimatedHours: 3,
  technologies: ['SQLi', 'String concatenation', 'Code review'],
  requiredSoftware: ['Visual Studio Code', 'OWASP Juice Shop (local disposable lab only)', 'Text editor / notes app'],
  priorKnowledge: ['SQLi fundamentals', 'Reading Python/JS SQL examples'],
  outcomes: ['Identify unsafe string-built SQL in sample snippets', 'Map each pattern to a safer alternative', 'Build a personal insecure-pattern checklist'],
  careerTracks: ['cybersecurity-engineer', 'devops-engineer'],
  certObjectives: ['SY0-701 2.3', 'SY0-701 4.1'],
  examDomains: ['Threats, Vulnerabilities & Mitigations', 'Security Operations'],
  overview: 'Study unsafe query construction patterns using intentionally vulnerable examples and Juice Shop learning — not production systems.',
  businessScenario: 'A classmate asks you to review their lab login query built with f-strings. You will catalog anti-patterns for the study group.',
  technicalRequirements: ['Catalog ≥5 unsafe patterns (concat, format, dynamic ORDER BY, etc.)', 'For each: risk and safe replacement', 'Code review of provided synthetic snippets (create your own lab file)', 'Link observations to Juice Shop behavior conceptually', 'No weaponized exploit scripts committed'],
  architectureNotes: 'Document-only analysis + optional local vulnerable toy app you wrote. Prefer review notes over exploits.',
  addressingPlan: [
    { name: 'Anti-pattern', network: 'f"SELECT ... {user}"', mask: 'unsafe', notes: 'Replace with parameters' },
    { name: 'Safe', network: 'EXECUTE ... USING', mask: 'safe', notes: 'Engine-specific' }
  ],
  milestones: labMilestones(
    ['Pattern catalog outline', 'Snippet set', 'Review rubric'],
    ['Author snippets', 'Complete reviews', 'Write safer rewrites (docs)'],
    ['Catalog complete', 'Each has mitigation', 'Ethics reminder included'],
    { design: 'Scope & ethics', build: 'Lab in Juice Shop / local app', verify: 'Defensive retest' },
  ),
  verificationSteps: ['Five patterns documented', 'Rewrites are parameterized', 'No live-target instructions'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Dynamic identifiers (tables/columns).', hint: 'Use allowlists, never raw input.' },
    { id: 't2', symptom: 'ORM raw() misuse.', hint: 'Call out explicitly in catalog.' }
  ],
  solutionGuide: 'Teach recognition + safe defaults. Attach catalog markdown.',
  portfolioDeliverables: securityDeliverables(),
})

export const sec03: ProjectDoc = securityProject({
  id: 'sec-03-parameterized-queries',
  slug: 'parameterized-queries-safe-access',
  title: 'Parameterized Queries & Safe Access',
  curriculumOrder: 3,
  difficulty: 'intermediate',
  category: 'Secure Coding',
  estimatedHours: 4,
  technologies: ['Parameterized SQL', 'Prepared statements', 'Python/SQL'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code', 'SQLite', 'PostgreSQL'],
  priorKnowledge: ['Unsafe query patterns', 'Python DB integration'],
  outcomes: ['Implement safe parameterized access in a tiny local app', 'Show defensive verification that malicious input is treated as data', 'Document engine-specific parameter styles'],
  careerTracks: ['cybersecurity-engineer', 'platform-engineer', 'devops-engineer'],
  certObjectives: ['SY0-701 2.3', 'SY0-701 3.2', 'SY0-701 4.1'],
  examDomains: ['Threats, Vulnerabilities & Mitigations', 'Security Architecture', 'Security Operations'],
  overview: 'Build the secure pattern: parameterized queries in VS Code against a local DB. Verify defensively — prove injection strings do not alter SQL structure.',
  businessScenario: 'Replace the insecure lab login lookup with a safe version and prove it with tests.',
  technicalRequirements: ['Local DB with users table synthetic data', 'Secure lookup function using parameters', 'Test vectors including quotes and classic payloads as data', 'Side-by-side doc of unsafe vs safe (unsafe not executed in prod path)', 'Defensive verification evidence required'],
  architectureNotes: 'CLI/web-local → parameterized DAO → SQLite/Postgres. Diagram showing bound parameters.',
  addressingPlan: [
    { name: 'users', network: 'id, email, hash', mask: 'table', notes: 'Synthetic' },
    { name: 'Test vector', network: '\' OR 1=1 --', mask: 'input', notes: 'Must not return all rows' }
  ],
  milestones: labMilestones(
    ['API of lookup', 'Test vectors', 'Success criteria'],
    ['Implement safe DAO', 'Write tests', 'Capture outputs'],
    ['Payload returns no auth bypass', 'Legitimate user still works', 'Code review clean'],
    { design: 'Scope & ethics', build: 'Lab in Juice Shop / local app', verify: 'Defensive retest' },
  ),
  verificationSteps: ['Defensive tests pass', 'Unsafe pattern absent from code path', 'README explains verification'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Still interpolating table names.', hint: 'Allowlist identifiers separately from values.' },
    { id: 't2', symptom: 'Tests too weak.', hint: 'Assert row counts explicitly.' }
  ],
  solutionGuide: 'Parameters + tests + least privilege. Attach code + defensive test transcript.',
  portfolioDeliverables: securityDeliverables(),
})

export const sec04: ProjectDoc = securityProject({
  id: 'sec-04-auth-vulns',
  slug: 'authentication-vulnerabilities-lab',
  title: 'Authentication Vulnerabilities Lab',
  curriculumOrder: 4,
  difficulty: 'intermediate',
  category: 'AppSec Education',
  estimatedHours: 5,
  technologies: ['Auth', 'Sessions', 'Juice Shop'],
  requiredSoftware: ['OWASP Juice Shop (local disposable lab only)', 'Burp Suite Community or browser DevTools (authorized lab only)', 'Draw.io'],
  priorKnowledge: ['SQLi fundamentals', 'HTTP cookies/sessions concept'],
  outcomes: ['Explore authentication flaws only in Juice Shop', 'Document weak password, token, or session issues conceptually', 'Propose secure auth controls mapped to SY0-701'],
  careerTracks: ['cybersecurity-engineer'],
  certObjectives: ['SY0-701 2.1', 'SY0-701 2.3', 'SY0-701 4.5'],
  examDomains: ['Threats, Vulnerabilities & Mitigations', 'Security Architecture', 'Security Operations'],
  overview: 'Study authentication weaknesses using Juice Shop challenges and defensive recommendations. No credential stuffing against real sites.',
  businessScenario: 'Prepare teaching notes on why auth fails open and how MFA/secure session design helps — grounded in Juice Shop learning paths.',
  technicalRequirements: ['Scope remains Juice Shop/local', 'Notes on ≥2 auth-related challenges', 'Control mapping: password policy, MFA, session expiry, lockout', 'Threat model diagram for login', 'Defensive verification ideas (tests) listed'],
  architectureNotes: 'Login form → auth logic → session token → DB. Mark risks at each hop.',
  addressingPlan: [
    { name: 'Lab', network: 'Juice Shop local', mask: 'only', notes: 'Authorized' },
    { name: 'Controls', network: 'MFA, hashing, lockout', mask: 'defense', notes: 'Document' }
  ],
  milestones: labMilestones(
    ['Threat model', 'Challenge plan', 'Control matrix'],
    ['Complete Juice Shop auth learnings', 'Write notes', 'Draft defenses'],
    ['Matrix maps SY0 objectives', 'Evidence local', 'No real-user data'],
    { design: 'Scope & ethics', build: 'Lab in Juice Shop / local app', verify: 'Defensive retest' },
  ),
  verificationSteps: ['Two challenges documented', 'Controls mapped', 'Ethics statement updated'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Challenge spoilers temptation.', hint: 'Focus on learning objectives and defenses, not sharing spoilers publicly.' },
    { id: 't2', symptom: 'Using production passwords.', hint: 'Only synthetic lab credentials.' }
  ],
  solutionGuide: 'Threat model + Juice Shop evidence + defensive control matrix. Attach diagram + notes.',
  portfolioDeliverables: securityDeliverables(),
})

export const sec05: ProjectDoc = securityProject({
  id: 'sec-05-db-permissions',
  slug: 'database-permissions-least-privilege',
  title: 'Database Permissions for Apps',
  curriculumOrder: 5,
  difficulty: 'intermediate',
  category: 'Database Security',
  estimatedHours: 4,
  technologies: ['Least privilege', 'DB roles', 'Defense in depth'],
  requiredSoftware: ['PostgreSQL', 'OWASP Juice Shop (local disposable lab only)', 'DBeaver or psql / mysql CLI'],
  priorKnowledge: ['SQL permissions project', 'Parameterized queries'],
  outcomes: ['Apply least-privilege DB accounts for an app tier', 'Show that DROP/FILE privileges are absent', 'Connect findings to SQLi blast-radius reduction'],
  careerTracks: ['cybersecurity-engineer', 'system-administrator', 'platform-engineer'],
  certObjectives: ['SY0-701 3.2', 'SY0-701 4.5', 'SY0-701 2.5'],
  examDomains: ['Security Architecture', 'Security Operations', 'Threats, Vulnerabilities & Mitigations'],
  overview: 'Reduce blast radius: even if SQLi exists, the DB role should not be superuser. Practice on your lab DB; relate conceptually to Juice Shop architecture.',
  businessScenario: 'After a tabletop SQLi incident, leadership asks what privileges the app role had. You will demonstrate a locked-down role and denied DDL.',
  technicalRequirements: ['Privilege matrix for app role', 'Denied DDL/DCL evidence', 'Comparison: overly privileged vs least privilege impact narrative', 'Link to SY0-701 hardening objectives', 'Defensive verification checklist'],
  architectureNotes: 'App → limited role → schema. Optional read replica role. Diagram.',
  addressingPlan: [
    { name: 'app_role', network: 'DML subset', mask: 'privileges', notes: 'No DROP' },
    { name: 'admin_role', network: 'DDL', mask: 'break-glass', notes: 'Offline use' }
  ],
  milestones: labMilestones(
    ['Matrix', 'Test denials', 'Incident narrative'],
    ['Configure roles', 'Run denial tests', 'Write blast-radius essay'],
    ['Denials work', 'App still functions', 'Checklist complete'],
    { design: 'Scope & ethics', build: 'Lab in Juice Shop / local app', verify: 'Defensive retest' },
  ),
  verificationSteps: ['DROP fails for app role', 'SELECT/INSERT succeed as designed', 'Narrative ties to SQLi impact'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'App needs migrations.', hint: 'Separate migrator role used only in deploy pipelines.' },
    { id: 't2', symptom: 'Default grants too open.', hint: 'Revise PUBLIC/default privileges.' }
  ],
  solutionGuide: 'Least privilege is containment. Attach matrix + denial evidence.',
  portfolioDeliverables: securityDeliverables(),
})

export const sec06: ProjectDoc = securityProject({
  id: 'sec-06-error-exposure',
  slug: 'error-exposure-information-leakage',
  title: 'Error Exposure & Information Leakage',
  curriculumOrder: 6,
  difficulty: 'intermediate',
  category: 'Secure Coding',
  estimatedHours: 3,
  technologies: ['Error handling', 'Info disclosure', 'Logging'],
  requiredSoftware: ['Visual Studio Code', 'OWASP Juice Shop (local disposable lab only)', 'Python 3.x'],
  priorKnowledge: ['Parameterized queries', 'HTTP status basics'],
  outcomes: ['Demonstrate how verbose SQL/errors help attackers in lab apps', 'Implement generic client errors + detailed server logs', 'Verify no stack traces reach clients'],
  careerTracks: ['cybersecurity-engineer', 'devops-engineer'],
  certObjectives: ['SY0-701 2.3', 'SY0-701 4.1', 'SY0-701 4.4'],
  examDomains: ['Threats, Vulnerabilities & Mitigations', 'Security Operations'],
  overview: 'Fix information leakage via errors in a local demo app and observe Juice Shop/educational examples. Defensive verification required.',
  businessScenario: 'Your lab API returned raw database errors to the browser, revealing table names. Patch it.',
  technicalRequirements: ['Before: screenshot of verbose error (local app)', 'After: generic client message', 'Server-side log retains detail', 'Test suite for error paths', 'Guidance doc for teammates'],
  architectureNotes: 'Client ← generic error; Server log ← detailed. Diagram.',
  addressingPlan: [
    { name: 'Client', network: '500 generic', mask: 'response', notes: 'No SQL text' },
    { name: 'Log', network: 'server.log', mask: 'detail', notes: 'Protected file' }
  ],
  milestones: labMilestones(
    ['Error catalog', 'Logging policy', 'Before/after criteria'],
    ['Create leaky demo', 'Patch handling', 'Add tests'],
    ['Client scrubbed', 'Logs detailed', 'Juice Shop observation notes optional'],
    { design: 'Scope & ethics', build: 'Lab in Juice Shop / local app', verify: 'Defensive retest' },
  ),
  verificationSteps: ['Before/after evidence', 'Tests cover error path', 'No secrets in client errors'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Framework default debug mode.', hint: 'Disable debug in non-dev; document.' },
    { id: 't2', symptom: 'Logs contain passwords.', hint: 'Redact sensitive fields.' }
  ],
  solutionGuide: 'Fail closed on messages to clients; verbose to secured logs. Attach before/after + tests.',
  portfolioDeliverables: securityDeliverables(),
})

export const sec07: ProjectDoc = securityProject({
  id: 'sec-07-security-logging',
  slug: 'security-logging-detection',
  title: 'Security Logging & Detection',
  curriculumOrder: 7,
  difficulty: 'intermediate',
  category: 'Detection',
  estimatedHours: 4,
  technologies: ['Logging', 'Detection', 'Alerting ideas'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code', 'OWASP Juice Shop (local disposable lab only)'],
  priorKnowledge: ['Log analyzer Python project', 'Error exposure project'],
  outcomes: ['Define security-relevant events for an app (auth fail, access deny, SQLi probe signatures at WAF/app layer)', 'Implement structured logs in a local app', 'Propose detection rules without attacking third parties'],
  careerTracks: ['cybersecurity-engineer', 'devops-engineer'],
  certObjectives: ['SY0-701 4.3', 'SY0-701 4.4', 'SY0-701 5.1'],
  examDomains: ['Security Operations', 'Security Program Management'],
  overview: 'Build defensive logging so suspicious input attempts are visible. Use local apps/Juice Shop traffic you generate in lab only.',
  businessScenario: 'Blue team wants alerts on repeated auth failures and obvious SQLi metacharacter floods against the lab app.',
  technicalRequirements: ['Event taxonomy (auth, authz, input anomaly)', 'Structured log format (JSON lines OK)', 'Detector script or queries on logs', 'False positive discussion', 'Privacy note (no PII sprawl)'],
  architectureNotes: 'App logs → file → detector. Diagram detection loop.',
  addressingPlan: [
    { name: 'Event', network: 'auth_fail', mask: 'type', notes: 'user_id hashed optional' },
    { name: 'Detector', network: 'threshold', mask: 'rule', notes: 'e.g. 10/5min' }
  ],
  milestones: labMilestones(
    ['Taxonomy', 'Thresholds', 'Privacy rules'],
    ['Add logging', 'Generate lab traffic', 'Run detector'],
    ['Alert on synthetic flood', 'Quiet on normal use', 'Sample logs redacted'],
    { design: 'Scope & ethics', build: 'Lab in Juice Shop / local app', verify: 'Defensive retest' },
  ),
  verificationSteps: ['Taxonomy documented', 'Detector evidence', 'FP analysis written'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Log injection via CRLF.', hint: 'Sanitize logged inputs.' },
    { id: 't2', symptom: 'High noise.', hint: 'Tune thresholds; alert on anomalies not single hits.' }
  ],
  solutionGuide: 'Structured logs + tuned detections + privacy. Attach samples + detector output.',
  portfolioDeliverables: securityDeliverables(),
})

export const sec08: ProjectDoc = securityProject({
  id: 'sec-08-secure-coding',
  slug: 'secure-coding-checklist',
  title: 'Secure Coding Checklist',
  curriculumOrder: 8,
  difficulty: 'intermediate',
  category: 'Program Management',
  estimatedHours: 3,
  technologies: ['Secure SDLC', 'Checklists', 'Code review'],
  requiredSoftware: ['Visual Studio Code', 'Git', 'Text editor / notes app'],
  priorKnowledge: ['Parameterized queries', 'Auth lab', 'Error exposure'],
  outcomes: ['Author a practical secure coding checklist for student projects', 'Apply it to one of your Python/SQL apps', 'Track findings to remediation owners (you)'],
  careerTracks: ['cybersecurity-engineer', 'devops-engineer', 'platform-engineer'],
  certObjectives: ['SY0-701 5.1', 'SY0-701 4.1', 'SY0-701 1.2'],
  examDomains: ['Security Program Management', 'Security Operations', 'General Security Concepts'],
  overview: 'Translate technical lessons into a repeatable checklist aligned to Security+ program management ideas — still offline/docs focused.',
  businessScenario: 'The study group ships tiny apps weekly. You will create a Definition of Done security gate before portfolio submission.',
  technicalRequirements: ['Checklist ≥15 items across input, auth, crypto, secrets, logging, deps', 'Apply to one prior project with scorecard', 'At least three findings filed and fixed', 'Map items to SY0-701 domains', 'Keep checklist versioned in git'],
  architectureNotes: 'Process diagram: code → checklist → fix → retest.',
  addressingPlan: [
    { name: 'Gate', network: 'DoD security', mask: 'process', notes: 'Required before evidence mark' },
    { name: 'Scorecard', network: 'pass/fail/NA', mask: 'sheet', notes: 'Per item' }
  ],
  milestones: labMilestones(
    ['Checklist draft', 'Domain mapping', 'Target app choice'],
    ['Finalize checklist', 'Review app', 'Remediate findings'],
    ['Scorecard complete', 'Fixes evidenced', 'Version tagged'],
    { design: 'Scope & ethics', build: 'Lab in Juice Shop / local app', verify: 'Defensive retest' },
  ),
  verificationSteps: ['Checklist mapped to domains', 'Three fixes done', 'Retest notes attached'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Checklist too vague.', hint: 'Make items testable and evidence-based.' },
    { id: 't2', symptom: 'Rubber-stamping.', hint: 'Require artifact links per critical item.' }
  ],
  solutionGuide: 'Specific, testable, mapped. Attach checklist + scorecard + fix commits notes.',
  portfolioDeliverables: securityDeliverables(),
})

export const sec09: ProjectDoc = securityProject({
  id: 'sec-09-hardening-pass',
  slug: 'application-hardening-pass',
  title: 'Application Hardening Pass',
  curriculumOrder: 9,
  difficulty: 'advanced',
  category: 'Hardening',
  estimatedHours: 5,
  technologies: ['Hardening', 'Headers', 'Dependency hygiene', 'Config'],
  requiredSoftware: ['Visual Studio Code', 'OWASP Juice Shop (local disposable lab only)', 'Python 3.x', 'FastAPI + Uvicorn (local)'],
  priorKnowledge: ['FastAPI lab service or similar', 'Secure coding checklist'],
  outcomes: ['Apply a hardening pass to a local app (headers, cookie flags, debug off, dependency audit notes)', 'Compare against Juice Shop intentional weaknesses conceptually', 'Produce before/after config diffs'],
  careerTracks: ['cybersecurity-engineer', 'platform-engineer', 'devops-engineer'],
  certObjectives: ['SY0-701 3.2', 'SY0-701 4.1', 'SY0-701 2.5'],
  examDomains: ['Security Architecture', 'Security Operations', 'Threats, Vulnerabilities & Mitigations'],
  overview: 'Harden your own local application using industry baseline ideas. Do not attack third-party systems; Juice Shop remains the unsafe reference lab.',
  businessScenario: 'Before showing your FastAPI helper in a portfolio demo, run a hardening sprint: disable debug, tighten CORS, add security headers, audit deps.',
  technicalRequirements: ['Hardening backlog (≥8 items)', 'Before/after config evidence', 'Dependency audit notes (pip audit / npm audit or manual)', 'CORS/bind address decisions documented', 'Defensive verification tests'],
  architectureNotes: 'Local app hardening layers: network bind, HTTP headers, app config, dependencies.',
  addressingPlan: [
    { name: 'Bind', network: '127.0.0.1', mask: 'network', notes: 'Default' },
    { name: 'Headers', network: 'CSP/Frame options as applicable', mask: 'HTTP', notes: 'Document choices' }
  ],
  milestones: labMilestones(
    ['Backlog', 'Baseline reference', 'Test plan'],
    ['Apply hardening', 'Audit deps', 'Retest features'],
    ['Diff attached', 'Tests pass', 'Residual risk listed'],
    { design: 'Scope & ethics', build: 'Lab in Juice Shop / local app', verify: 'Defensive retest' },
  ),
  verificationSteps: ['Eight items addressed or waived with reason', 'No debug in demo profile', 'Verification evidence present'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Broken UI after CSP.', hint: 'Tune carefully; start report-only if applicable.' },
    { id: 't2', symptom: 'Audit noise.', hint: 'Triage by severity; document accept risk.' }
  ],
  solutionGuide: 'Incremental hardening with tests. Attach backlog + diffs + audit notes.',
  portfolioDeliverables: securityDeliverables(),
})

export const sec10: ProjectDoc = securityProject({
  id: 'sec-10-remediation-playbook',
  slug: 'remediation-retest-playbook',
  title: 'Remediation & Retest Playbook',
  curriculumOrder: 10,
  difficulty: 'advanced',
  category: 'Remediation',
  estimatedHours: 5,
  technologies: ['Remediation', 'Retesting', 'Reporting'],
  requiredSoftware: ['OWASP Juice Shop (local disposable lab only)', 'Visual Studio Code', 'Draw.io', 'Git'],
  priorKnowledge: ['All prior security projects', 'Secure coding checklist'],
  outcomes: ['Write a remediation playbook from finding → fix → defensive retest', 'Apply it to a local vulnerable pattern you introduced then fixed', 'Produce a management-friendly summary mapped to Security+ domains'],
  careerTracks: ['cybersecurity-engineer', 'cloud-solutions-architect'],
  certObjectives: ['SY0-701 5.1', 'SY0-701 4.1', 'SY0-701 2.3'],
  examDomains: ['Security Program Management', 'Security Operations', 'Threats, Vulnerabilities & Mitigations'],
  overview: 'Capstone security documentation project: prove you can remediate and defensively retest — not just find issues in Juice Shop.',
  businessScenario: 'A fictional audit found SQLi risk and verbose errors in your lab app. Deliver a complete remediation package with retest evidence.',
  technicalRequirements: ['Finding write-up (impact, likelihood, affected component)', 'Root cause analysis', 'Fix description with code/config references', 'Defensive retest plan and results (required)', 'Residual risk + owner + due date fields'],
  architectureNotes: 'Process swimlane: Detect → Triage → Fix → Retest → Close. Juice Shop lessons inform finding quality, but fixes apply to your lab code.',
  addressingPlan: [
    { name: 'Finding', network: 'LAB-001 SQLi risk', mask: 'ID', notes: 'Local app' },
    { name: 'Retest', network: 'payload suite', mask: 'defense', notes: 'Must pass' }
  ],
  milestones: labMilestones(
    ['Playbook template', 'Select finding', 'Retest vectors'],
    ['Implement fix', 'Execute retest', 'Write executive summary'],
    ['Retest pass evidence', 'Checklist gate green', 'Summary maps domains'],
    { design: 'Scope & ethics', build: 'Lab in Juice Shop / local app', verify: 'Defensive retest' },
  ),
  verificationSteps: ['Playbook reusable template included', 'Retest evidence attached', 'No unauthorized testing described'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Fix incomplete.', hint: 'Retest must include regression of original symptom and nearby endpoints.' },
    { id: 't2', symptom: 'Blaming tools only.', hint: 'Root cause should include process gaps.' }
  ],
  solutionGuide: 'Close the loop with evidence. Attach playbook + finding + retest pack.',
  portfolioDeliverables: securityDeliverables(),
})

export const securityProjects: ProjectDoc[] = [sec01, sec02, sec03, sec04, sec05, sec06, sec07, sec08, sec09, sec10]
