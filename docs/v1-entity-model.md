# V1 Entity Model (Implementation-Grade)

## Purpose
Define **what we will actually implement now** in Postgres/Supabase for a Next.js + Stripe stack, while preserving clean extension paths for LearnWorlds/Articulate-level depth.

## 1) V1 vs Later Entity Cut

### V1 Core (implement now)

#### Identity / Access / Organization
- `org`
- `user_profile` (maps to Supabase `auth.users`)
- `org_member`
- `role` (enum-backed)

#### Academy / Commerce / Enrollment
- `academy_site`
- `catalog_course`
- `price_plan`
- `checkout_session` (Stripe linkage)
- `enrollment`
- `entitlement`
- `certificate`

#### Authoring (Draft Data)
- `course`
- `course_version` (draft/review/published states)
- `module_draft`
- `lesson_draft`
- `lesson_node_draft`
- `interaction_draft` (scenes/states/triggers/actions in JSONB)
- `asset`
- `review_cycle`
- `review_comment`

#### Publishing / Runtime (Published Data)
- `publish_job`
- `runtime_package`
- `runtime_lesson`
- `runtime_node`

#### Learner Runtime / Assessment / Progress
- `lesson_attempt`
- `node_attempt`
- `assessment_attempt`
- `assessment_response`
- `progress_record`
- `completion_record`

#### Analytics (Day-1 event sink)
- `event_log` (append-only JSONB payload with typed columns)

#### AI Hooks (placeholder)
- `ai_task`

### Later (defer)
- Full bundles/multi-course tracks
- Affiliate payout ledger
- Advanced ABAC policy engine
- Translation memory with segment-level QA
- Complex template marketplace
- Psychometric calibration & adaptive sequencing
- External package targets (SCORM/xAPI export)

## 2) Ownership by Domain Service (V1)

- **Identity Service**: `org`, `user_profile`, `org_member`
- **Academy Service**: `academy_site`, `catalog_course`, `enrollment`, `entitlement`
- **Commerce Service**: `price_plan`, `checkout_session` (+ Stripe webhooks)
- **Authoring Service**: `course`, `course_version`, draft module/lesson/node, `interaction_draft`, `asset`
- **Review Service**: `review_cycle`, `review_comment`
- **Publishing Service**: `publish_job`, `runtime_package`, `runtime_lesson`, `runtime_node`
- **Learning Service**: attempts/progress/completion/certificate
- **Analytics Service**: `event_log`
- **AI Orchestration**: `ai_task`

## 3) Key Data Modeling Decisions

1. **Hard split between draft and runtime models**
   - Draft: normalized authoring entities + flexible JSONB for fast iteration.
   - Runtime: immutable, render-ready records referencing a published package.

2. **JSONB where shape changes rapidly**
   - Interaction graph (`interaction_draft.graph_json`)
   - Node config payloads (`lesson_node_draft.config_json`)
   - Runtime render payload (`runtime_node.render_json`)
   - Event payload (`event_log.payload_json`)

3. **Dedicated tables where query integrity matters**
   - Enrollment/entitlement/completion/certificates
   - Assessment attempts/responses
   - Review cycle states
   - Publish jobs and package lineage

4. **Stripe as source of payment truth**
   - Keep internal mapping + status mirrors.
   - Use idempotent webhook handling for checkout completion.

## 4) State Machines (V1)

### `course_version.status`
- `draft` -> `in_review` -> `approved` -> `published`
- `in_review` -> `changes_requested` -> `draft`
- `published` -> `retired`

### `review_cycle.status`
- `open` -> `approved`
- `open` -> `changes_requested`
- `changes_requested` -> `resolved`

### `publish_job.status`
- `queued` -> `building` -> `published`
- `queued|building` -> `failed`
- `published` -> `rolled_back`

### `lesson_attempt.status`
- `in_progress` -> `completed`
- `in_progress` -> `abandoned`

## 5) Renderability Constraint

A published lesson is renderable if:
- `runtime_lesson` exists for `runtime_package_id`
- every `runtime_node` has `node_type`, `order_index`, and valid `render_json`
- completion rules exist either at node level or lesson level

## 6) Migration Strategy

- Add future entities without breaking core IDs (`uuid` everywhere).
- Maintain compatibility via `schema_version` in runtime payloads.
- Keep event contracts append-only and versioned.
