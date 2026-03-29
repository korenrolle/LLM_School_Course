# V1 Scope Cut (Build Fast, Preserve Future)

## 1) Included in V1 (must build)

### Academy Shell
- Single branded academy per org
- Course catalog listing
- Course detail + enroll/purchase flow

### Content Structure
- Course -> module -> lesson hierarchy
- Lesson nodes: `video`, `reading`, `quiz`, `reflection`, `scenario`, `ai_practice`, `resource`

### Interaction Primitives
- Variable store (lesson attempt scope)
- Trigger + condition + action via JSON graph
- Branching for scenario nodes

### Review Skeleton
- Single review cycle per submission
- Assigned reviewer + comments + approve/changes requested

### Publishing Model
- Publish job from approved version
- Immutable runtime package generation
- Current package pointer + rollback

### Learner Runtime
- Lesson renderer by node type
- Attempts/progress persistence
- Completion criteria evaluation

### Assessment Basics
- MCQ / multi-select / short answer
- Attempt count + pass threshold
- Score persistence

### Completion + Certificate
- Completion record by runtime package
- Certificate issue + verification lookup

### AI Hooks (placeholder)
- Queue/store task requests and outputs
- Reflection feedback and quiz generation hooks only (no full tutor orchestration)

## 2) Explicit V1 Simplifications

1. **Commerce**
   - Stripe-hosted checkout only
   - no coupons, bundles, tax engine, affiliate payouts in v1

2. **Authoring**
   - JSON editor for advanced interaction graph (visual builder later)
   - limited template support (copy from existing lesson only)

3. **Review**
   - one reviewer role path
   - no parallel approvals or policy routing

4. **Analytics**
   - event log table + basic dashboards
   - no warehouse modeling/predictive analytics yet

5. **AI**
   - async task model only
   - no streaming chat memory or RAG knowledge base in v1

6. **Localization**
   - data model placeholders only
   - no full locale production workflow in v1

## 3) Deferred to Phase 2+

- Subscriptions/memberships depth
- Bundles/tracks/learning paths
- Affiliates and marketing automation
- Advanced interaction template marketplace
- Adaptive sequencing and competency model
- External LMS export formats

## 4) Highest-Risk Areas in V1

1. **Draft -> Runtime transform correctness**
   - Risk: published artifacts mismatch author intent.
   - Mitigation: schema validation + preview against generated runtime payload before publish.

2. **Interaction graph safety**
   - Risk: broken transitions, infinite loops, invalid conditions.
   - Mitigation: pre-publish validator + max transition guardrails at runtime.

3. **Progress consistency across package versions**
   - Risk: learner progress corruption after republish/rollback.
   - Mitigation: progress/completion always keyed by `runtime_package_id`.

4. **Stripe webhook idempotency**
   - Risk: duplicate entitlements/enrollments.
   - Mitigation: unique constraints + webhook event ID dedupe table (add in implementation).

5. **RLS policy gaps**
   - Risk: cross-org data leakage.
   - Mitigation: enforce `org_id` predicates on every tenant table and server-side org assertion.

## 5) Build Sequence Recommendation

1. Schema + RLS + migrations
2. Authoring CRUD + versioning
3. Publish transform + runtime fetch
4. Learner attempts/progress/completion
5. Review cycle endpoints
6. Stripe checkout + entitlement grant
7. Event ingestion + baseline dashboards
8. AI task hooks
