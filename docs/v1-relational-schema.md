# V1 Relational Schema (Postgres/Supabase)

## Conventions
- Primary keys: `uuid` default `gen_random_uuid()`
- Timestamps: `created_at`, `updated_at` (`timestamptz`)
- Soft-delete where needed: `archived_at` nullable
- All foreign keys use `on delete restrict` unless noted

## 1) Identity / Org

### `org`
- `id uuid pk`
- `name text not null`
- `slug text unique not null`
- `created_by uuid not null` -> `auth.users.id`
- `created_at timestamptz not null default now()`

Indexes:
- `idx_org_slug (slug unique)`

### `user_profile`
- `user_id uuid pk` -> `auth.users.id`
- `display_name text`
- `avatar_url text`
- `default_org_id uuid` -> `org.id`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `org_member`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `user_id uuid not null` -> `auth.users.id`
- `role role_enum not null`
- `status member_status_enum not null default 'active'`
- `created_at timestamptz not null default now()`

Unique:
- `(org_id, user_id)`

Enums:
- `role_enum`: `owner`, `admin`, `author`, `reviewer`, `learner`
- `member_status_enum`: `invited`, `active`, `suspended`

## 2) Academy / Commerce

### `academy_site`
- `id uuid pk`
- `org_id uuid not null unique` -> `org.id`
- `title text not null`
- `domain text unique`
- `theme_json jsonb not null default '{}'::jsonb`
- `published boolean not null default false`

### `course`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `slug text not null`
- `title text not null`
- `summary text`
- `cover_asset_id uuid` -> `asset.id`
- `status course_status_enum not null default 'draft'`
- `created_by uuid not null` -> `auth.users.id`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Unique:
- `(org_id, slug)`

Enum:
- `course_status_enum`: `draft`, `active`, `archived`

### `catalog_course`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `course_id uuid not null` -> `course.id`
- `is_listed boolean not null default true`
- `visibility catalog_visibility_enum not null default 'public'`
- `sort_order int not null default 0`

Enum:
- `catalog_visibility_enum`: `public`, `private`, `unlisted`

### `price_plan`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `course_id uuid not null` -> `course.id`
- `stripe_price_id text not null unique`
- `plan_type plan_type_enum not null`
- `amount_cents int not null`
- `currency text not null default 'usd'`
- `active boolean not null default true`

Enum:
- `plan_type_enum`: `one_time`, `subscription`

### `checkout_session`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `user_id uuid not null` -> `auth.users.id`
- `course_id uuid not null` -> `course.id`
- `price_plan_id uuid not null` -> `price_plan.id`
- `stripe_checkout_session_id text not null unique`
- `status checkout_status_enum not null default 'created'`
- `created_at timestamptz not null default now()`
- `completed_at timestamptz`

Enum:
- `checkout_status_enum`: `created`, `completed`, `expired`, `failed`

### `entitlement`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `user_id uuid not null` -> `auth.users.id`
- `course_id uuid not null` -> `course.id`
- `source entitlement_source_enum not null`
- `starts_at timestamptz not null default now()`
- `ends_at timestamptz`
- `active boolean generated always as (ends_at is null or ends_at > now()) stored`

Unique:
- `(org_id, user_id, course_id, source, starts_at)`

Enum:
- `entitlement_source_enum`: `purchase`, `admin_grant`, `subscription`

### `enrollment`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `user_id uuid not null` -> `auth.users.id`
- `course_id uuid not null` -> `course.id`
- `entitlement_id uuid not null` -> `entitlement.id`
- `status enrollment_status_enum not null default 'active'`
- `enrolled_at timestamptz not null default now()`

Unique:
- `(org_id, user_id, course_id)`

Enum:
- `enrollment_status_enum`: `active`, `completed`, `revoked`

## 3) Authoring Draft Model

### `course_version`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `course_id uuid not null` -> `course.id`
- `version_no int not null`
- `status course_version_status_enum not null default 'draft'`
- `based_on_version_id uuid` -> `course_version.id`
- `created_by uuid not null` -> `auth.users.id`
- `change_note text`
- `created_at timestamptz not null default now()`

Unique:
- `(course_id, version_no)`

Enum:
- `course_version_status_enum`: `draft`, `in_review`, `changes_requested`, `approved`, `published`, `retired`

### `module_draft`
- `id uuid pk`
- `course_version_id uuid not null` -> `course_version.id`
- `title text not null`
- `order_index int not null`

Unique:
- `(course_version_id, order_index)`

### `lesson_draft`
- `id uuid pk`
- `module_draft_id uuid not null` -> `module_draft.id`
- `title text not null`
- `slug text not null`
- `order_index int not null`
- `estimated_minutes int`
- `completion_rule_json jsonb not null default '{}'::jsonb`

Unique:
- `(module_draft_id, order_index)`

### `lesson_node_draft`
- `id uuid pk`
- `lesson_draft_id uuid not null` -> `lesson_draft.id`
- `node_type node_type_enum not null`
- `order_index int not null`
- `title text`
- `config_json jsonb not null default '{}'::jsonb`
- `interaction_draft_id uuid` -> `interaction_draft.id`
- `required boolean not null default true`

Unique:
- `(lesson_draft_id, order_index)`

Enum:
- `node_type_enum`: `video`, `reading`, `quiz`, `reflection`, `scenario`, `ai_practice`, `resource`

### `interaction_draft`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `graph_json jsonb not null`
- `schema_version int not null default 1`
- `validation_status validation_status_enum not null default 'pending'`
- `last_validated_at timestamptz`

Enum:
- `validation_status_enum`: `pending`, `valid`, `invalid`

### `asset`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `storage_path text not null`
- `mime_type text not null`
- `asset_type asset_type_enum not null`
- `metadata_json jsonb not null default '{}'::jsonb`
- `uploaded_by uuid not null` -> `auth.users.id`

Enum:
- `asset_type_enum`: `video`, `image`, `document`, `audio`, `other`

## 4) Review / Publish

### `review_cycle`
- `id uuid pk`
- `course_version_id uuid not null` -> `course_version.id`
- `requested_by uuid not null` -> `auth.users.id`
- `assigned_reviewer_id uuid` -> `auth.users.id`
- `status review_status_enum not null default 'open'`
- `opened_at timestamptz not null default now()`
- `closed_at timestamptz`

Enum:
- `review_status_enum`: `open`, `changes_requested`, `approved`, `resolved`

### `review_comment`
- `id uuid pk`
- `review_cycle_id uuid not null` -> `review_cycle.id`
- `author_id uuid not null` -> `auth.users.id`
- `entity_type review_entity_type_enum not null`
- `entity_id uuid not null`
- `comment_text text not null`
- `status review_comment_status_enum not null default 'open'`
- `created_at timestamptz not null default now()`

Enums:
- `review_entity_type_enum`: `module`, `lesson`, `node`, `interaction`
- `review_comment_status_enum`: `open`, `resolved`

### `publish_job`
- `id uuid pk`
- `course_version_id uuid not null` -> `course_version.id`
- `requested_by uuid not null` -> `auth.users.id`
- `status publish_status_enum not null default 'queued'`
- `error_text text`
- `started_at timestamptz`
- `finished_at timestamptz`

Enum:
- `publish_status_enum`: `queued`, `building`, `published`, `failed`, `rolled_back`

### `runtime_package`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `course_id uuid not null` -> `course.id`
- `course_version_id uuid not null` -> `course_version.id`
- `publish_job_id uuid not null unique` -> `publish_job.id`
- `package_version int not null`
- `is_current boolean not null default false`
- `manifest_json jsonb not null`
- `published_at timestamptz not null default now()`

Unique:
- `(course_id, package_version)`
- partial unique index on `(course_id) where is_current = true`

### `runtime_lesson`
- `id uuid pk`
- `runtime_package_id uuid not null` -> `runtime_package.id`
- `module_order int not null`
- `lesson_order int not null`
- `title text not null`
- `slug text not null`
- `completion_rule_json jsonb not null`

Unique:
- `(runtime_package_id, module_order, lesson_order)`

### `runtime_node`
- `id uuid pk`
- `runtime_lesson_id uuid not null` -> `runtime_lesson.id`
- `node_type node_type_enum not null`
- `order_index int not null`
- `render_json jsonb not null`
- `scoring_json jsonb`
- `completion_json jsonb`

Unique:
- `(runtime_lesson_id, order_index)`

## 5) Learner Runtime / Assessment / Progress

### `lesson_attempt`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `user_id uuid not null` -> `auth.users.id`
- `course_id uuid not null` -> `course.id`
- `runtime_package_id uuid not null` -> `runtime_package.id`
- `runtime_lesson_id uuid not null` -> `runtime_lesson.id`
- `status lesson_attempt_status_enum not null default 'in_progress'`
- `started_at timestamptz not null default now()`
- `completed_at timestamptz`
- `progress_pct numeric(5,2) not null default 0`

Indexes:
- `(user_id, course_id, runtime_package_id)`

Enum:
- `lesson_attempt_status_enum`: `in_progress`, `completed`, `abandoned`

### `node_attempt`
- `id uuid pk`
- `lesson_attempt_id uuid not null` -> `lesson_attempt.id`
- `runtime_node_id uuid not null` -> `runtime_node.id`
- `status node_attempt_status_enum not null default 'seen'`
- `score numeric(6,2)`
- `response_json jsonb`
- `updated_at timestamptz not null default now()`

Unique:
- `(lesson_attempt_id, runtime_node_id)`

Enum:
- `node_attempt_status_enum`: `seen`, `completed`, `skipped`

### `assessment_attempt`
- `id uuid pk`
- `lesson_attempt_id uuid not null` -> `lesson_attempt.id`
- `runtime_node_id uuid not null` -> `runtime_node.id`
- `attempt_no int not null`
- `status assessment_status_enum not null default 'in_progress'`
- `score numeric(6,2)`
- `submitted_at timestamptz`

Unique:
- `(lesson_attempt_id, runtime_node_id, attempt_no)`

Enum:
- `assessment_status_enum`: `in_progress`, `submitted`, `graded`

### `assessment_response`
- `id uuid pk`
- `assessment_attempt_id uuid not null` -> `assessment_attempt.id`
- `question_key text not null`
- `response_json jsonb not null`
- `is_correct boolean`
- `points_awarded numeric(6,2)`

Indexes:
- `(assessment_attempt_id, question_key)`

### `progress_record`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `user_id uuid not null` -> `auth.users.id`
- `course_id uuid not null` -> `course.id`
- `runtime_package_id uuid not null` -> `runtime_package.id`
- `percent_complete numeric(5,2) not null default 0`
- `last_lesson_id uuid` -> `runtime_lesson.id`
- `updated_at timestamptz not null default now()`

Unique:
- `(user_id, course_id, runtime_package_id)`

### `completion_record`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `user_id uuid not null` -> `auth.users.id`
- `course_id uuid not null` -> `course.id`
- `runtime_package_id uuid not null` -> `runtime_package.id`
- `completed_at timestamptz not null`
- `criteria_json jsonb not null`

Unique:
- `(user_id, course_id, runtime_package_id)`

### `certificate`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `completion_record_id uuid not null unique` -> `completion_record.id`
- `certificate_no text not null unique`
- `issued_at timestamptz not null default now()`
- `template_json jsonb not null`

## 6) Analytics + AI hooks

### `event_log`
- `id bigserial pk`
- `org_id uuid not null` -> `org.id`
- `user_id uuid` -> `auth.users.id`
- `session_id uuid`
- `event_name text not null`
- `event_ts timestamptz not null default now()`
- `course_id uuid`
- `runtime_package_id uuid`
- `runtime_lesson_id uuid`
- `runtime_node_id uuid`
- `attempt_id uuid`
- `payload_json jsonb not null default '{}'::jsonb`

Indexes:
- `(org_id, event_ts desc)`
- `(event_name, event_ts desc)`
- `(user_id, event_ts desc)`
- `(course_id, event_ts desc)`

### `ai_task`
- `id uuid pk`
- `org_id uuid not null` -> `org.id`
- `requested_by uuid` -> `auth.users.id`
- `context_type ai_context_enum not null`
- `context_id uuid`
- `task_type ai_task_enum not null`
- `status ai_status_enum not null default 'queued'`
- `input_json jsonb not null`
- `output_json jsonb`
- `error_text text`
- `created_at timestamptz not null default now()`
- `completed_at timestamptz`

Enums:
- `ai_context_enum`: `authoring`, `review`, `runtime`, `reflection`
- `ai_task_enum`: `outline`, `rewrite`, `quiz_generate`, `feedback`, `transcript`, `translate`, `tutor`
- `ai_status_enum`: `queued`, `running`, `completed`, `failed`

## 7) JSONB vs Tables in V1

Use **JSONB** for:
- interaction graphs
- node type configs
- runtime render payloads
- assessment question structure inside quiz nodes
- event payload details
- certificate visual template payload

Use **tables** for:
- identity/access and org membership
- course/version/module/lesson ordering
- enrollment/entitlement/completion
- attempts and grading summary rows
- review/publish states and lineage

## 8) Critical Index/FK Notes

- Add composite index `(course_id, status)` on `course_version`
- Add composite index `(course_version_id, status)` on `review_cycle`
- Add partial unique index on `runtime_package(course_id) where is_current`
- Protect delete paths with `restrict`; archive instead of deleting published lineage
