# Phased Roadmap (Architecture-First)

## Phase 0 — Foundations (Now)

**Objective:** establish architecture skeleton and system contracts before UI-heavy feature expansion.

- Define domain boundaries and service contracts.
- Implement identity/tenant/workspace model.
- Implement core content model (course versioning + node types + interaction graph primitives).
- Implement review workflow skeleton and publish pipeline scaffolding.
- Implement runtime event instrumentation contracts.
- Stand up baseline analytics ingestion and KPI models.

## Phase 1 — MVP Platform Core

- Academy/catalog basics with branded shell and entitlements.
- Authoring studio v1 with node editor and interaction primitives.
- Review annotations + approval gates.
- Publish pipeline to runtime packages.
- Learner runtime for all core node types.
- Assessment basics + completion + certificates.

## Phase 2 — Business & Growth Expansion

- Checkout hardening, subscriptions/bundles, coupons.
- Affiliate tracking and payout-ready reporting.
- Deeper admin business dashboards.
- CRM/email/webhook integrations.

## Phase 3 — AI Maturity Layer

- AI authoring copilot (outline, rewrite, question gen).
- AI reflection feedback and tutor/practice mode.
- Captions/transcripts automation.
- Translation/localization pipeline with human QA loop.
- AI policy controls, quality scoring, and governance reports.

## Phase 4 — Advanced Authoring and Intelligence

- Advanced interaction template marketplace.
- Adaptive learning logic (rule/competency-based).
- Scenario authoring enhancements and simulation depth.
- Predictive analytics and content effectiveness scoring.

## Phase 5 — Enterprise & Ecosystem

- External packaging/export modes (e.g., interoperable package targets).
- Compliance automation toolkits and extended audit exports.
- Integration marketplace and partner ecosystem.
- Multi-region deployment controls and data residency options.

## Layer Summary (Delivery-Oriented)

1. **Experience Layer**: learner, author, reviewer, admin, marketing surfaces.
2. **Domain Services Layer**: academy, authoring, review, publish, runtime, analytics, commerce, AI.
3. **Platform Services Layer**: workflows, media, events, localization, search, feature flags.
4. **Data Layer**: transactional, object, telemetry, warehouse, vector indexes.
5. **Governance Layer**: security, auditing, compliance, operations.

## Build Strategy Principles

- Vertical slices per subsystem with stable APIs.
- Feature flags to release safely.
- Event-first telemetry from day one.
- Strict separation of draft authoring models and immutable runtime releases.
- AI assistance is opt-in and always auditable.
