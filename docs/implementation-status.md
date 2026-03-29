# Implementation Status — Verification-First Phase

## Completed in Code

- Replaced in-memory data paths with Supabase-backed repository operations for course draft tree, review cycle, publish pipeline, runtime reads, enrollment, attempts, progress, and analytics events.
- Added authenticated route enforcement with bearer-token session verification and role checks (`admin`, `author`, `reviewer`, `learner`).
- Added Supabase auth API wrappers for signup/signin/signout and a protected `/api/me` endpoint.
- Added RLS hardening migration with organization + profile model and table policies to block cross-org/cross-user access.
- Preserved existing vertical slice lifecycle (`draft -> review -> approved -> published -> runtime -> progress`).
- Added automated test scaffolding:
  - Vitest integration tests for publish/review services.
  - Playwright E2E flow for auth + role-protected lifecycle + learner progress.

## In Scope and Proven

- Service-level transitions for review and publish are covered by automated tests.
- End-to-end API workflow is covered in Playwright (signup/signin, protected access, seed/review/approve/publish, runtime, progress, permission denial).
- RLS and role boundaries are codified in SQL migration for Supabase execution.

## Not Yet Production-Ready

- Dev pages still assume simplified local workflow and need auth token UX updates.
- CI pipeline is not yet wired to run Supabase test database + Playwright automatically.
- Full tenant lifecycle tooling (org provisioning UX, invite flows) is still minimal.
- Scenario and AI-practice runtime node execution is not yet implemented.
