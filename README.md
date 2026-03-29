# LLM School Course — Premium Learning Platform (Phase 1)

## Project Overview
This repository contains the Phase 1 implementation of a production-minded learning experience platform (LXP) inspired by LearnWorlds-style academy delivery and Articulate-style authoring/publishing workflows.

Current milestone: a vertical slice proving the full lifecycle from draft authoring to published runtime delivery.

## Platform Purpose
Build a modular, scalable platform where teams can:
- Author versioned course drafts (modules, lessons, nodes).
- Route drafts through review states.
- Publish immutable runtime packages.
- Deliver learner runtime experiences with progress and analytics tracking.

## Architecture Summary
The current system is intentionally split into:
- **Draft authoring model** (mutable): course versions, draft modules/lessons/nodes.
- **Review and publishing workflow**: submit, approve, publish job execution.
- **Runtime model** (immutable): runtime package manifest + runtime lessons/nodes.
- **Learner telemetry**: attempts, progress records, learning events.

Design docs for full architecture and V1 schema live under `docs/`.

## Tech Stack
- **Frontend/API**: Next.js App Router + TypeScript
- **Styling**: Tailwind CSS
- **Data model target**: Supabase/Postgres (SQL migrations included)
- **Auth/storage target**: Supabase (integration-ready scaffolding)
- **Commerce**: Stripe placeholders only (out of scope for this phase)

## Setup
### Prerequisites
- Node.js 20+
- npm 10+

### Install
```bash
npm install
```

### Run locally
```bash
npm run dev
```

Open:
- Home: `http://localhost:3000`
- Author flow test page: `http://localhost:3000/dev/author`
- Learner runtime page: available from author page after publish

## Environment Variables
Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> Note: the current vertical slice runs with in-memory repositories for local proof-of-flow. Supabase env vars are included for transition readiness.

## Database Assets
- Migration: `db/migrations/001_foundational_schema.sql`
- Seed SQL: `db/seeds/001_vertical_slice_seed.sql`

## Core Folder Structure
```text
app/                # Next.js App Router pages and API routes
components/         # Shared UI/runtime components
lib/                # Services, repositories, utilities
  repositories/     # Data access adapters (in-memory for v1 slice)
  services/         # Authoring/review/publish/runtime workflows
db/                 # SQL migrations and seed files
types/              # TypeScript domain contracts
content/            # Canonical course curriculum and learning object plans
docs/               # Architecture, schema, and phase documentation
```

## Current Implementation Status
Implemented in code:
- Draft → review → approve → publish flow.
- Immutable runtime package materialization.
- Minimal learner renderer for reading/video/quiz/reflection/resource nodes.
- Event tracking (`lesson_started`, `node_viewed`, `quiz_submitted`, `reflection_submitted`, `lesson_completed`).
- Dev pages to exercise end-to-end lifecycle.

Not yet implemented:
- Full Supabase persistence + RLS policies.
- Full no-code visual authoring UI.
- Advanced scenario and AI-practice runtime nodes (content plans prepared).
- Commerce and affiliate systems.

## Phased Roadmap (High-Level)
- **Phase 1 (Current):** lifecycle vertical slice + runtime proof.
- **Phase 2:** Supabase-backed persistence, auth/roles, hardened APIs.
- **Phase 3:** authoring depth (interaction graph, scenario/AI-practice runtime support).
- **Phase 4:** academy business features (subscriptions, bundles, affiliates, dashboards).
- **Phase 5:** adaptive AI, localization workflows, enterprise governance/compliance.

## Related Content Files
Canonical curriculum and instructional design outputs:
- `content/course-source.md`
- `content/course-manifest.json`
- `content/interaction-plan.md`
- `content/assessment-bank.json`
- `content/reflection-prompts.json`
- `content/scenario-outlines.json`
- `content/ai-practice-prompts.json`
- `content/resource-pack-plan.json`
