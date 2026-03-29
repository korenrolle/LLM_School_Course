# Implementation Status — Phase 1 Vertical Slice

## Completed in Code

- Initialized Next.js TypeScript/Tailwind app structure (`app`, `components`, `lib`, `db`, `types`, `docs`).
- Added foundational in-memory repositories and services for vertical slice lifecycle.
- Implemented core lifecycle API routes:
  - seed draft course
  - submit review
  - approve review
  - publish approved version
  - fetch published runtime
  - start lesson attempts
  - sync progress
  - ingest events
- Implemented publish transform with minimal shape validation and immutable runtime package materialization.
- Implemented learner runtime renderer for reading/video/quiz/reflection/resource nodes.
- Added progress and analytics event recording for:
  - `lesson_started`
  - `node_viewed`
  - `quiz_submitted`
  - `reflection_submitted`
  - `lesson_completed`
- Added Postgres/Supabase migration SQL and seed SQL for foundational schema.
- Added example seeded course with 1 module, 3 lessons, mixed nodes.

## In Scope and Proven

- Draft -> in_review -> approved -> published lifecycle
- Runtime package immutability and current package pointer behavior
- Learner lesson runtime retrieval and node rendering
- Progress persistence shape and analytics event stream

## Not Yet Implemented (Next Phase)

- Real Supabase-backed repository implementation and RLS policies
- Full auth/role enforcement via Supabase Auth
- Scenario and AI-practice runtime nodes
- Rich assessment attempts and grading tables wired at API level
- Commerce/Stripe integration beyond placeholder contracts
- Production authoring studio UI

## Architecture Fit

The slice is intentionally a monolithic Next.js implementation with service/repository boundaries that map directly to the documented domain architecture. This enables incremental replacement of in-memory adapters with Supabase data adapters without rewriting business flow orchestration.
