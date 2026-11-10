# IT Study Lab Pro

Offline-first CompTIA Network+ / Security+ study platform with exam engines, analytics, tools, and a documentation-first Project Library.

This folder is a standalone Vite + React + TypeScript app. It lives beside the existing ObraCalc Next.js app and does not replace it.

## Run locally

```bash
cd study-lab
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Stack

React, TypeScript, Vite, Tailwind CSS, shadcn-style UI primitives, React Router, Zustand, Dexie (IndexedDB), Recharts.

## What is included (Phases 1–4 foundation)

- Migrated Network+ and Security+ banks (core, supplemental, scenario challenge)
- Exam generation with domain weighting and option shuffle
- PBQ worksheets (forms only — not network simulators)
- Subnet calculator and quick math
- Exam history, autosave, JSON import/export (compatible with legacy HTML backups)
- Study analytics charts
- Project Library shell with sections A–J and self-reported vs evidence-based progress
- Three sample Network+ projects

## Non-goals

No Packet Tracer/GNS3 clones, packet engines, embedded VMs, Python/SQL runners, or cloud auto-provisioning.
