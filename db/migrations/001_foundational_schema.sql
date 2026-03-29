-- Foundational vertical slice schema (Phase 1)

create extension if not exists pgcrypto;

create type course_version_status_enum as enum ('draft', 'in_review', 'changes_requested', 'approved', 'published');
create type review_status_enum as enum ('open', 'changes_requested', 'approved');
create type publish_status_enum as enum ('queued', 'building', 'published', 'failed');
create type node_type_enum as enum ('reading', 'video', 'quiz', 'reflection', 'resource');

create table if not exists course (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists course_version (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references course(id) on delete restrict,
  version_no int not null,
  status course_version_status_enum not null default 'draft',
  created_at timestamptz not null default now(),
  unique(course_id, version_no)
);

create table if not exists module_draft (
  id uuid primary key default gen_random_uuid(),
  course_version_id uuid not null references course_version(id) on delete restrict,
  title text not null,
  order_index int not null,
  unique(course_version_id, order_index)
);

create table if not exists lesson_draft (
  id uuid primary key default gen_random_uuid(),
  module_draft_id uuid not null references module_draft(id) on delete restrict,
  title text not null,
  slug text not null,
  order_index int not null,
  completion_rule_json jsonb not null default '{}'::jsonb,
  unique(module_draft_id, order_index)
);

create table if not exists lesson_node_draft (
  id uuid primary key default gen_random_uuid(),
  lesson_draft_id uuid not null references lesson_draft(id) on delete restrict,
  node_type node_type_enum not null,
  order_index int not null,
  config_json jsonb not null,
  required boolean not null default true,
  unique(lesson_draft_id, order_index)
);

create table if not exists review_cycle (
  id uuid primary key default gen_random_uuid(),
  course_version_id uuid not null references course_version(id) on delete restrict,
  status review_status_enum not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists publish_job (
  id uuid primary key default gen_random_uuid(),
  course_version_id uuid not null references course_version(id) on delete restrict,
  status publish_status_enum not null default 'queued',
  error_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists runtime_package (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references course(id) on delete restrict,
  course_version_id uuid not null references course_version(id) on delete restrict,
  package_version int not null,
  is_current boolean not null default false,
  manifest_json jsonb not null,
  created_at timestamptz not null default now(),
  unique(course_id, package_version)
);
create unique index if not exists uq_runtime_package_current on runtime_package(course_id) where is_current = true;

create table if not exists runtime_lesson (
  id uuid primary key default gen_random_uuid(),
  runtime_package_id uuid not null references runtime_package(id) on delete restrict,
  title text not null,
  slug text not null,
  lesson_order int not null,
  completion_rule_json jsonb not null,
  unique(runtime_package_id, lesson_order)
);

create table if not exists runtime_node (
  id uuid primary key default gen_random_uuid(),
  runtime_lesson_id uuid not null references runtime_lesson(id) on delete restrict,
  node_type node_type_enum not null,
  order_index int not null,
  render_json jsonb not null,
  completion_json jsonb not null default '{}'::jsonb,
  unique(runtime_lesson_id, order_index)
);

create table if not exists enrollment (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references course(id) on delete restrict,
  learner_id text not null,
  created_at timestamptz not null default now(),
  unique(course_id, learner_id)
);

create table if not exists lesson_attempt (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollment(id) on delete restrict,
  runtime_lesson_id uuid not null references runtime_lesson(id) on delete restrict,
  status text not null check (status in ('in_progress', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists progress_record (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollment(id) on delete restrict,
  runtime_package_id uuid not null references runtime_package(id) on delete restrict,
  percent_complete numeric(5,2) not null default 0,
  last_lesson_id uuid references runtime_lesson(id) on delete restrict,
  updated_at timestamptz not null default now(),
  unique(enrollment_id, runtime_package_id)
);

create table if not exists event_log (
  id bigserial primary key,
  event_name text not null,
  enrollment_id uuid references enrollment(id) on delete set null,
  runtime_lesson_id uuid references runtime_lesson(id) on delete set null,
  runtime_node_id uuid references runtime_node(id) on delete set null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_event_log_event_name on event_log(event_name);
create index if not exists idx_event_log_created_at on event_log(created_at desc);
