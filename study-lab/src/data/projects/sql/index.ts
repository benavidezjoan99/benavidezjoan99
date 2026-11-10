import type { ProjectDoc } from '@/types/project'
import { labMilestones, sqlDeliverables, sqlProject } from '../helpers'

export const sql01: ProjectDoc = sqlProject({
  id: 'sql-01-relational-design',
  slug: 'relational-database-design',
  title: 'Relational Database Design',
  curriculumOrder: 1,
  difficulty: 'beginner',
  category: 'Database Design',
  estimatedHours: 4,
  technologies: ['ER modeling', 'Relational design', 'Keys'],
  requiredSoftware: ['Draw.io', 'PostgreSQL', 'DBeaver or psql / mysql CLI'],
  priorKnowledge: ['Tables as relations concept', 'Primary vs foreign keys intro'],
  outcomes: ['Produce an ERD for a small business domain', 'Define entities, attributes, and relationships', 'Translate ERD into a draft table list'],
  careerTracks: ['platform-engineer', 'devops-engineer', 'system-administrator'],
  certObjectives: [],
  examDomains: [],
  overview: 'Design a relational model for a lab ticket-tracking domain before writing SQL. Implement the schema later in PostgreSQL/MySQL/SQLite externally.',
  businessScenario: 'A campus IT club needs a database for tickets, assets, and technicians. You must design first so coding does not paint them into a corner.',
  technicalRequirements: ['ERD with at least four entities', 'Cardinality labels (1:1, 1:N, N:M)', 'List of candidate primary keys', 'N:M resolved with associative entity note', 'Assumptions document (one page)'],
  architectureNotes: 'Entities: Technician, Ticket, Asset, Category (example). Diagram crow\'s foot in Draw.io. No Study Lab database.',
  addressingPlan: [
    { name: 'Technician', network: 'tech_id PK', mask: 'entity', notes: 'name, email' },
    { name: 'Ticket', network: 'ticket_id PK', mask: 'entity', notes: 'tech_id FK, asset_id FK' },
    { name: 'TicketTag', network: 'ticket_id+tag_id', mask: 'assoc', notes: 'Resolves N:M tags' }
  ],
  milestones: labMilestones(
    ['Domain scope', 'ERD draft', 'Key decisions'],
    ['Finalize ERD', 'Write assumptions', 'Draft CREATE outline (not required executed yet)'],
    ['Peer review ERD', 'Check every relationship has keys', 'N:M handled'],
    { design: 'Model & sample data', build: 'Run SQL externally', verify: 'Compare expected results' },
  ),
  verificationSteps: ['ERD readable without tribal knowledge', 'Every 1:N has FK direction clear', 'Assumptions list edge cases'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Everything linked N:M casually.', hint: 'Challenge whether a real associative entity is needed.' },
    { id: 't2', symptom: 'Using names as PKs.', hint: 'Prefer stable surrogate or natural keys with uniqueness analysis.' }
  ],
  solutionGuide: 'Model verbs as relationships; keep attributes atomic. Attach ERD + assumptions.',
  portfolioDeliverables: sqlDeliverables(),
})

export const sql02: ProjectDoc = sqlProject({
  id: 'sql-02-tables-relationships',
  slug: 'tables-keys-relationships',
  title: 'Tables, Keys & Relationships',
  curriculumOrder: 2,
  difficulty: 'beginner',
  category: 'DDL',
  estimatedHours: 4,
  technologies: ['SQL DDL', 'PK/FK', 'Constraints'],
  requiredSoftware: ['PostgreSQL', 'SQLite', 'DBeaver or psql / mysql CLI'],
  priorKnowledge: ['Relational design project', 'Basic SQL CREATE'],
  outcomes: ['Implement CREATE TABLE with PKs/FKs/NOT NULL/UNIQUE', 'Load synthetic seed data', 'Prove FK rejects orphans'],
  careerTracks: ['platform-engineer', 'devops-engineer'],
  certObjectives: [],
  examDomains: [],
  overview: 'Turn the ERD into real tables in PostgreSQL, MySQL, or SQLite. Study Lab ships schemas as docs only — you run DDL in an external engine.',
  businessScenario: 'The club approved the ERD. Now create the schema and seed enough synthetic rows to support later query labs.',
  technicalRequirements: ['DDL script creating all tables', 'FK constraints enabled', 'Seed script with ≥20 tickets synthetic data', 'Evidence that orphan FK insert fails', 'Dialect noted (Postgres/MySQL/SQLite)'],
  architectureNotes: 'External DB instance locally. Diagram schema creation order (parents before children).',
  addressingPlan: [
    { name: 'DB name', network: 'studylab_tickets', mask: 'database', notes: 'Local only' },
    { name: 'Seed size', network: '>=20 tickets', mask: 'rows', notes: 'Synthetic names' }
  ],
  milestones: labMilestones(
    ['DDL order', 'Constraint list', 'Seed plan'],
    ['Run CREATE scripts', 'Load seeds', 'Attempt orphan insert'],
    ['\\d / SHOW CREATE evidence', 'FK failure screenshot', 'Row counts'],
    { design: 'Model & sample data', build: 'Run SQL externally', verify: 'Compare expected results' },
  ),
  verificationSteps: ['All tables exist', 'FK reject works', 'Seed counts match plan'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Circular FKs.', hint: 'Defer or redesign; create nullable FKs carefully.' },
    { id: 't2', symptom: 'SQLite FK off by default.', hint: 'Enable PRAGMA foreign_keys=ON; document.' }
  ],
  solutionGuide: 'Parents first; explicit names for constraints; keep seed deterministic. Attach DDL + seed + FK error.',
  portfolioDeliverables: sqlDeliverables(),
})

export const sql03: ProjectDoc = sqlProject({
  id: 'sql-03-queries-filters',
  slug: 'sql-queries-filters',
  title: 'Queries & Filters',
  curriculumOrder: 3,
  difficulty: 'beginner',
  category: 'DQL',
  estimatedHours: 3,
  technologies: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT'],
  requiredSoftware: ['PostgreSQL', 'DBeaver or psql / mysql CLI', 'Spreadsheet (Excel / Google Sheets)'],
  priorKnowledge: ['Tables created and seeded'],
  outcomes: ['Write filtered SELECT queries with expected result tables', 'Use ORDER BY/LIMIT thoughtfully', 'Document three business questions answered by SQL'],
  careerTracks: ['platform-engineer', 'system-administrator'],
  certObjectives: [],
  examDomains: [],
  overview: 'Practice precise filtering against your synthetic ticket database in an external SQL client.',
  businessScenario: 'Managers ask: open tickets older than seven days, tickets by technician email domain, and assets in a building. Answer with SQL, not spreadsheets alone.',
  technicalRequirements: ['At least eight queries with comments', 'Expected result row counts/samples documented', 'Use WHERE with AND/OR/IN/BETWEEN/LIKE appropriately', 'Avoid SELECT * in final portfolio queries', 'Export one result set to CSV'],
  architectureNotes: 'Query workbook SQL file. Map each business question → query ID.',
  addressingPlan: [
    { name: 'Q1', network: 'open tickets >7d', mask: 'filter', notes: 'Expected N rows' },
    { name: 'Q2', network: 'LIKE %@campus.edu', mask: 'filter', notes: 'Technicians' }
  ],
  milestones: labMilestones(
    ['Question list', 'Expected results', 'Index thoughts optional'],
    ['Write queries', 'Run in client', 'Capture outputs'],
    ['Compare to expected', 'CSV export', 'Edge empty result'],
    { design: 'Model & sample data', build: 'Run SQL externally', verify: 'Compare expected results' },
  ),
  verificationSteps: ['Each query matches expected sample', 'No silent wrong filters', 'Comments explain intent'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'DATE math dialect differences.', hint: 'Document age computation per engine.' },
    { id: 't2', symptom: 'LIKE without wildcards.', hint: 'Add tests for pattern matching.' }
  ],
  solutionGuide: 'Write expected results first; then SQL. Attach workbook + screenshots.',
  portfolioDeliverables: sqlDeliverables(),
})

export const sql04: ProjectDoc = sqlProject({
  id: 'sql-04-joins',
  slug: 'sql-joins-deep-dive',
  title: 'JOINs Deep Dive',
  curriculumOrder: 4,
  difficulty: 'intermediate',
  category: 'DQL',
  estimatedHours: 4,
  technologies: ['INNER JOIN', 'LEFT JOIN', 'Multi-table'],
  requiredSoftware: ['PostgreSQL', 'DBeaver or psql / mysql CLI'],
  priorKnowledge: ['Queries & filters', 'FK relationships'],
  outcomes: ['Write INNER and LEFT joins answering multi-table questions', 'Detect fan-out/duplication from joins', 'Document anti-join pattern for missing matches'],
  careerTracks: ['platform-engineer', 'devops-engineer'],
  certObjectives: [],
  examDomains: [],
  overview: 'Master joins on the ticket schema. Emphasize choosing INNER vs LEFT and validating row multiplication.',
  businessScenario: 'A report double-counted tickets after a bad join to tags. You must produce correct joined reports and an explanation of the bug.',
  technicalRequirements: ['At least six join queries including one three-table join', 'One LEFT JOIN showing tickets without technician', 'One anti-join (NOT EXISTS or LEFT + IS NULL)', 'Note on row multiplication with N:M tags', 'Expected results for each'],
  architectureNotes: 'Same DB. Diagram join paths on ERD.',
  addressingPlan: [
    { name: 'INNER', network: 'ticket⋈technician', mask: 'join', notes: 'Assigned only' },
    { name: 'LEFT', network: 'ticket⟕technician', mask: 'join', notes: 'Include unassigned' }
  ],
  milestones: labMilestones(
    ['Join question list', 'ERD join paths', 'Expected counts'],
    ['Author SQL', 'Run/compare', 'Write fan-out note'],
    ['Counts match hand calculation', 'Anti-join correct', 'Tag join explained'],
    { design: 'Model & sample data', build: 'Run SQL externally', verify: 'Compare expected results' },
  ),
  verificationSteps: ['LEFT vs INNER difference demonstrated', 'Anti-join lists only orphans', 'No unexplained duplicates'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Duplicates after joining tags.', hint: 'Aggregate or join carefully; distinct with caution.' },
    { id: 't2', symptom: 'Wrong FK in ON clause.', hint: 'Always join on keys; review ERD.' }
  ],
  solutionGuide: 'Sketch counts before joining. Attach SQL + before/after duplicate lesson.',
  portfolioDeliverables: sqlDeliverables(),
})

export const sql05: ProjectDoc = sqlProject({
  id: 'sql-05-aggregations',
  slug: 'sql-aggregations-group-by',
  title: 'Aggregations & GROUP BY',
  curriculumOrder: 5,
  difficulty: 'intermediate',
  category: 'DQL',
  estimatedHours: 4,
  technologies: ['GROUP BY', 'HAVING', 'Aggregate functions'],
  requiredSoftware: ['PostgreSQL', 'DBeaver or psql / mysql CLI', 'Spreadsheet (Excel / Google Sheets)'],
  priorKnowledge: ['JOINs', 'Filtering'],
  outcomes: ['Produce grouped metrics (tickets per tech, per category)', 'Filter groups with HAVING', 'Cross-check aggregates in a spreadsheet'],
  careerTracks: ['platform-engineer', 'devops-engineer'],
  certObjectives: [],
  examDomains: [],
  overview: 'Use aggregate queries for operational metrics from synthetic data. Verify with spreadsheet pivots.',
  businessScenario: 'Leadership wants a weekly ops digest: tickets per technician, average age, categories over threshold.',
  technicalRequirements: ['COUNT/AVG/MIN/MAX queries', 'GROUP BY with HAVING example', 'Joined aggregates', 'Spreadsheet cross-check for one metric', 'Null behavior note (COUNT(*) vs COUNT(col))'],
  architectureNotes: 'SQL aggregates → optional CSV → spreadsheet pivot confirmation.',
  addressingPlan: [
    { name: 'Metric A', network: 'tickets per tech', mask: 'COUNT', notes: 'Expected table' },
    { name: 'Metric B', network: 'categories HAVING COUNT>=5', mask: 'HAVING', notes: 'Threshold' }
  ],
  milestones: labMilestones(
    ['Metric dictionary', 'Expected pivots', 'Null cases'],
    ['Write aggregates', 'Export CSV', 'Pivot verify'],
    ['Match spreadsheet', 'HAVING filters groups', 'Null note written'],
    { design: 'Model & sample data', build: 'Run SQL externally', verify: 'Compare expected results' },
  ),
  verificationSteps: ['Aggregates match pivot', 'HAVING ≠ WHERE documented', 'Empty groups handled'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Selected non-grouped columns.', hint: 'Follow only_full_group_by / select aggregates or group keys.' },
    { id: 't2', symptom: 'HAVING vs WHERE confusion.', hint: 'Filter rows pre-group with WHERE; groups with HAVING.' }
  ],
  solutionGuide: 'Define metrics first; validate with pivot. Attach SQL + spreadsheet screenshot.',
  portfolioDeliverables: sqlDeliverables(),
})

export const sql06: ProjectDoc = sqlProject({
  id: 'sql-06-normalization',
  slug: 'sql-normalization-workshop',
  title: 'Normalization Workshop',
  curriculumOrder: 6,
  difficulty: 'intermediate',
  category: 'Database Design',
  estimatedHours: 5,
  technologies: ['1NF', '2NF', '3NF', 'Refactoring'],
  requiredSoftware: ['Draw.io', 'PostgreSQL', 'DBeaver or psql / mysql CLI'],
  priorKnowledge: ['Tables & relationships', 'Update anomalies awareness'],
  outcomes: ['Detect anomalies in a denormalized spreadsheet-like table', 'Normalize to 3NF with migration notes', 'Compare query complexity tradeoffs'],
  careerTracks: ['platform-engineer', 'cloud-solutions-architect'],
  certObjectives: [],
  examDomains: [],
  overview: 'Start from a deliberately messy table and normalize it. Perform DDL changes in your external database.',
  businessScenario: 'Someone stored technician phone numbers repeatedly on every ticket row. Updates drift. Normalize without losing history.',
  technicalRequirements: ['Provided messy schema (create it from the brief)', 'Anomaly examples (insert/update/delete)', 'Normalized ERD + DDL', 'Data migration SELECT/INSERT plan', 'Tradeoff paragraph (when denormalize)'],
  architectureNotes: 'Before/after ERDs. Migration scripts offline.',
  addressingPlan: [
    { name: 'Before', network: 'tickets_wide', mask: 'denorm', notes: 'Repeated tech fields' },
    { name: 'After', network: 'tickets+technicians', mask: '3NF', notes: 'FK link' }
  ],
  milestones: labMilestones(
    ['Anomaly list', 'Target 3NF model', 'Migration steps'],
    ['Create messy DB', 'Build normalized tables', 'Migrate data'],
    ['Anomalies gone', 'Row counts conserved', 'Sample queries updated'],
    { design: 'Model & sample data', build: 'Run SQL externally', verify: 'Compare expected results' },
  ),
  verificationSteps: ['Update anomaly demo fails on messy / succeeds conceptually on clean', 'Migration row counts add up', '3NF checklist completed'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Lost data during migration.', hint: 'Use transactional migration; verify counts.' },
    { id: 't2', symptom: 'Over-normalization.', hint: 'Document pragmatic stopping point.' }
  ],
  solutionGuide: 'Prove anomalies with SQL demos; migrate carefully. Attach before/after ERD + scripts.',
  portfolioDeliverables: sqlDeliverables(),
})

export const sql07: ProjectDoc = sqlProject({
  id: 'sql-07-transactions',
  slug: 'sql-transactions-concurrency',
  title: 'Transactions & Concurrency',
  curriculumOrder: 7,
  difficulty: 'intermediate',
  category: 'Transactions',
  estimatedHours: 5,
  technologies: ['BEGIN/COMMIT', 'ROLLBACK', 'Isolation concepts'],
  requiredSoftware: ['PostgreSQL', 'DBeaver or psql / mysql CLI'],
  priorKnowledge: ['DML comfort', 'ACID terminology'],
  outcomes: ['Wrap multi-step writes in transactions', 'Demonstrate ROLLBACK', 'Document isolation phenomena at a conceptual level with a lab experiment'],
  careerTracks: ['platform-engineer', 'devops-engineer'],
  certObjectives: ['SY0-701 3.2'],
  examDomains: ['Security Architecture'],
  overview: 'Practice transactional integrity in PostgreSQL/MySQL. SQLite allowed with documented limitations.',
  businessScenario: 'Transferring an asset between users must update two tables or none. You will prove COMMIT and ROLLBACK paths.',
  technicalRequirements: ['Scripted happy-path transaction', 'Forced error path that ROLLBACKs', 'Observation of dirty read / or document engine protection (lab)', 'Idempotency note for retries', 'Evidence screenshots from two sessions if testing concurrency'],
  architectureNotes: 'Two-table update example (asset ownership + audit log). Diagram transaction boundary.',
  addressingPlan: [
    { name: 'Txn A', network: 'transfer asset', mask: 'BEGIN', notes: 'Update+insert audit' },
    { name: 'Txn B', network: 'fail path', mask: 'ROLLBACK', notes: 'No partial write' }
  ],
  milestones: labMilestones(
    ['Txn scenarios', 'Isolation questions', 'Success criteria'],
    ['Write scripts', 'Run commit/rollback', 'Optional concurrent session test'],
    ['Rollback leaves clean state', 'Commit persists both writes', 'Notes on isolation'],
    { design: 'Model & sample data', build: 'Run SQL externally', verify: 'Compare expected results' },
  ),
  verificationSteps: ['Partial failure leaves no orphan audit', 'Commit visible to new session', 'Written isolation takeaways'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Autocommit surprises.', hint: 'Explicit BEGIN; check client autocommit settings.' },
    { id: 't2', symptom: 'Deadlocks.', hint: 'Document order of locking; keep lab simple.' }
  ],
  solutionGuide: 'Keep transactions short; always handle errors with rollback. Attach scripts + evidence.',
  portfolioDeliverables: sqlDeliverables(),
})

export const sql08: ProjectDoc = sqlProject({
  id: 'sql-08-permissions',
  slug: 'sql-permissions-roles',
  title: 'Permissions & Roles',
  curriculumOrder: 8,
  difficulty: 'intermediate',
  category: 'Database Security',
  estimatedHours: 4,
  technologies: ['GRANT/REVOKE', 'Roles', 'Least privilege'],
  requiredSoftware: ['PostgreSQL', 'MySQL / MariaDB', 'DBeaver or psql / mysql CLI'],
  priorKnowledge: ['Schema exists', 'Auth basics'],
  outcomes: ['Create app vs admin DB roles with least privilege', 'Prove denied operations', 'Document secret handling for DB passwords'],
  careerTracks: ['cybersecurity-engineer', 'platform-engineer', 'system-administrator'],
  certObjectives: ['SY0-701 4.5', 'SY0-701 3.2'],
  examDomains: ['Security Architecture', 'Security Operations'],
  overview: 'Apply least privilege inside PostgreSQL/MySQL for lab roles. Do not use root/superuser for application access.',
  businessScenario: 'The ticket app used the superuser connection string and a SQL injection could have dropped tables. Split roles now.',
  technicalRequirements: ['Roles: app_read, app_write, dba_lab', 'GRANT only needed tables/privileges', 'Evidence: app_read cannot INSERT', 'Evidence: app_write cannot DROP', 'Password storage notes (env, not git)'],
  architectureNotes: 'DB users/roles separate from OS users. Diagram app → app_write role → tables.',
  addressingPlan: [
    { name: 'app_read', network: 'SELECT', mask: 'role', notes: 'Reporting' },
    { name: 'app_write', network: 'SELECT,INSERT,UPDATE', mask: 'role', notes: 'No DDL' }
  ],
  milestones: labMilestones(
    ['Privilege matrix', 'Role list', 'Test cases'],
    ['CREATE ROLE/USER', 'GRANT/REVOKE', 'Connect as each role'],
    ['Denied DROP/INSERT evidence', 'Allowed path works', 'Matrix matches reality'],
    { design: 'Model & sample data', build: 'Run SQL externally', verify: 'Compare expected results' },
  ),
  verificationSteps: ['Least privilege demonstrated', 'Superuser not used by app', 'Revoke tested'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Default public privileges.', hint: 'Revoke PUBLIC as needed; know engine defaults.' },
    { id: 't2', symptom: 'Object ownership issues.', hint: 'Understand owner vs grantee.' }
  ],
  solutionGuide: 'Matrix first, grants second, tests third. Attach SQL role scripts + denial errors.',
  portfolioDeliverables: sqlDeliverables(),
})

export const sql09: ProjectDoc = sqlProject({
  id: 'sql-09-backups',
  slug: 'sql-backup-recovery',
  title: 'Database Backups & Recovery',
  curriculumOrder: 9,
  difficulty: 'intermediate',
  category: 'Operations',
  estimatedHours: 4,
  technologies: ['pg_dump/mysqldump', 'Restore drills', 'Retention'],
  requiredSoftware: ['PostgreSQL', 'MySQL / MariaDB', 'SQLite'],
  priorKnowledge: ['Permissions project', 'Filesystem backups awareness'],
  outcomes: ['Perform logical backup and restore of the lab DB', 'Define retention for lab dumps', 'Measure restore time vs RTO target'],
  careerTracks: ['system-administrator', 'platform-engineer', 'devops-engineer'],
  certObjectives: ['SY0-701 3.3'],
  examDomains: ['Security Architecture', 'Security Operations'],
  overview: 'Backup and restore your ticket database with vendor tools (pg_dump, mysqldump, or file copy for SQLite). Test restores.',
  businessScenario: 'Before a risky migration, take a dump and prove you can restore to a different database name.',
  technicalRequirements: ['Backup command documented', 'Restore to alternate DB/name', 'Checksum/size note of dump', 'RTO estimate from drill', 'Secure storage location for dumps (not public git if data sensitive — synthetic OK)'],
  architectureNotes: 'DB → dump file → restore target. Diagram.',
  addressingPlan: [
    { name: 'Dump', network: 'tickets_YYYYMMDD.dump', mask: 'file', notes: 'Local backups dir' },
    { name: 'Restore target', network: 'tickets_restore', mask: 'database', notes: 'Alternate' }
  ],
  milestones: labMilestones(
    ['RTO target', 'Backup tool choice', 'Restore steps'],
    ['Take dump', 'Restore alternate', 'Smoke query'],
    ['Row counts match', 'Time recorded', 'Failure drill note'],
    { design: 'Model & sample data', build: 'Run SQL externally', verify: 'Compare expected results' },
  ),
  verificationSteps: ['Restored DB answers sample query', 'Dump not committed if policy forbids', 'Runbook steps clear'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Version skew on restore.', hint: 'Match major versions; document.' },
    { id: 't2', symptom: 'Partial restore.', hint: 'Prefer transactional-safe tools; verify.' }
  ],
  solutionGuide: 'Always restore-test. Attach commands + timing + count checks.',
  portfolioDeliverables: sqlDeliverables(),
})

export const sql10: ProjectDoc = sqlProject({
  id: 'sql-10-optimization',
  slug: 'sql-query-optimization',
  title: 'Query Optimization Basics',
  curriculumOrder: 10,
  difficulty: 'advanced',
  category: 'Performance',
  estimatedHours: 5,
  technologies: ['Indexes', 'EXPLAIN', 'Query plans'],
  requiredSoftware: ['PostgreSQL', 'DBeaver or psql / mysql CLI'],
  priorKnowledge: ['Aggregations', 'JOINs', 'Meaningful data volume'],
  outcomes: ['Use EXPLAIN/EXPLAIN ANALYZE to inspect plans', 'Add an index that improves a slow query', 'Document when an index did not help'],
  careerTracks: ['platform-engineer', 'devops-engineer'],
  certObjectives: [],
  examDomains: [],
  overview: 'Learn beginner/advanced-practical optimization: read plans, add indexes carefully, measure. Run only on your lab DB.',
  businessScenario: 'A ticket search by asset tag became slow after seeding thousands of synthetic rows. Fix it with measurement, not guesswork.',
  technicalRequirements: ['Seed or generate larger synthetic volume (document scale)', 'Baseline EXPLAIN for slow query', 'Index DDL + new plan', 'Before/after timing', 'Note write-cost tradeoff'],
  architectureNotes: 'Same schema; focus on query path. Diagram index on search column.',
  addressingPlan: [
    { name: 'Slow query', network: 'WHERE asset_tag = ?', mask: 'seq scan?', notes: 'Baseline' },
    { name: 'Index', network: 'idx_assets_tag', mask: 'btree', notes: 'Candidate' }
  ],
  milestones: labMilestones(
    ['Choose hot query', 'Scale data', 'Success metric'],
    ['Generate data', 'EXPLAIN baseline', 'Create index & remeasure'],
    ['Plan change evidence', 'Timing improved or lesson why not', 'Tradeoff written'],
    { design: 'Model & sample data', build: 'Run SQL externally', verify: 'Compare expected results' },
  ),
  verificationSteps: ['Two EXPLAIN outputs attached', 'Index definition attached', 'Honest results even if improvement small'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'Planner still seq scans tiny tables.', hint: 'Increase scale; understand cost model.' },
    { id: 't2', symptom: 'Wrong column indexed.', hint: 'Match filter/join columns; consider composite carefully.' }
  ],
  solutionGuide: 'Measure → change one thing → measure. Attach plans + timings.',
  portfolioDeliverables: sqlDeliverables(),
})

export const sql11: ProjectDoc = sqlProject({
  id: 'sql-11-python-db',
  slug: 'sql-python-database-app',
  title: 'Python + Database Application',
  curriculumOrder: 11,
  difficulty: 'advanced',
  category: 'Integration',
  estimatedHours: 6,
  technologies: ['Python', 'SQL', 'Parameterized queries', 'Reporting'],
  requiredSoftware: ['Python 3.x', 'Visual Studio Code', 'PostgreSQL', 'SQLite'],
  priorKnowledge: ['Permissions', 'Python DB integration project', 'Transactions'],
  outcomes: ['Build a small Python CLI/API that uses the ticket DB safely', 'Enforce parameterized queries and least-privilege DB role', 'Produce a report query pack with expected results'],
  careerTracks: ['platform-engineer', 'devops-engineer', 'cybersecurity-engineer'],
  certObjectives: ['SY0-701 2.3', 'SY0-701 4.1'],
  examDomains: ['Threats, Vulnerabilities & Mitigations', 'Security Operations'],
  overview: 'Combine SQL and Python tracks: external DB + VS Code app. Reinforces secure data access for Security+ alignment.',
  businessScenario: 'Ship a technician CLI that lists open tickets and adds notes without ever concatenating SQL strings.',
  technicalRequirements: ['Python app with at least list/add note features', 'Connect as app_write role', 'Parameterized SQL only', 'Integration test or scripted demo', 'Security review checklist completed'],
  architectureNotes: 'Python ↔ DB role ↔ tables. Diagram showing no superuser path.',
  addressingPlan: [
    { name: 'App', network: 'tickets_cli.py', mask: 'client', notes: 'VS Code' },
    { name: 'Role', network: 'app_write', mask: 'db', notes: 'Least privilege' }
  ],
  milestones: labMilestones(
    ['Feature list', 'Query catalog', 'Threat notes'],
    ['Implement CLI', 'Wire parameterized DAO', 'Demo script'],
    ['Features work', 'Injection string harmless', 'Role denial if escalate DDL'],
    { design: 'Model & sample data', build: 'Run SQL externally', verify: 'Compare expected results' },
  ),
  verificationSteps: ['Demo transcript attached', 'Code review shows parameters', 'Checklist signed'],
  troubleshootingChallenges: [
    { id: 't1', symptom: 'ORMs hiding SQL.', hint: 'If used, still prove parameterization; prefer explicit SQL for learning.' },
    { id: 't2', symptom: 'Connection leaks.', hint: 'Use context managers.' }
  ],
  solutionGuide: 'Thin DAO; parameters; least privilege. Attach app + SQL + demo.',
  portfolioDeliverables: sqlDeliverables(),
})

export const sqlProjects: ProjectDoc[] = [sql01, sql02, sql03, sql04, sql05, sql06, sql07, sql08, sql09, sql10, sql11]
