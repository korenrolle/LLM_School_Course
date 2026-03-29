-- Auth, role, org, and RLS hardening for Phase 1 verification

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role_enum') then
    create type app_role_enum as enum ('admin', 'author', 'reviewer', 'learner');
  end if;
end
$$;

create table if not exists organization (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists user_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references organization(id) on delete restrict,
  role app_role_enum not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table course add column if not exists org_id uuid references organization(id) on delete restrict;
alter table course add column if not exists created_by uuid references auth.users(id) on delete set null;

-- backfill org for existing rows
insert into organization (name)
select 'default-org'
where not exists (select 1 from organization where name = 'default-org');

update course
set org_id = (select id from organization where name = 'default-org')
where org_id is null;

alter table course alter column org_id set not null;

create or replace function public.current_org_id()
returns uuid
language sql
stable
as $$
  select org_id from public.user_profile where user_id = auth.uid()
$$;

create or replace function public.current_role()
returns app_role_enum
language sql
stable
as $$
  select role from public.user_profile where user_id = auth.uid()
$$;

-- RLS enable
alter table organization enable row level security;
alter table user_profile enable row level security;
alter table course enable row level security;
alter table course_version enable row level security;
alter table module_draft enable row level security;
alter table lesson_draft enable row level security;
alter table lesson_node_draft enable row level security;
alter table review_cycle enable row level security;
alter table publish_job enable row level security;
alter table runtime_package enable row level security;
alter table runtime_lesson enable row level security;
alter table runtime_node enable row level security;
alter table enrollment enable row level security;
alter table lesson_attempt enable row level security;
alter table progress_record enable row level security;
alter table event_log enable row level security;

-- organization / profile policies
create policy if not exists org_read_own on organization
for select using (id = public.current_org_id());

create policy if not exists profile_read_own on user_profile
for select using (user_id = auth.uid() or org_id = public.current_org_id());

create policy if not exists profile_upsert_admin on user_profile
for all using (public.current_role() = 'admin' and org_id = public.current_org_id())
with check (public.current_role() = 'admin' and org_id = public.current_org_id());

-- course policies
create policy if not exists course_read_same_org on course
for select using (org_id = public.current_org_id());

create policy if not exists course_write_author_admin on course
for all using (org_id = public.current_org_id() and public.current_role() in ('admin','author'))
with check (org_id = public.current_org_id() and public.current_role() in ('admin','author'));

-- draft tree policies
create policy if not exists version_read_same_org on course_version
for select using (exists (select 1 from course c where c.id = course_id and c.org_id = public.current_org_id()));

create policy if not exists version_write_author_admin on course_version
for all using (
  exists (select 1 from course c where c.id = course_id and c.org_id = public.current_org_id())
  and public.current_role() in ('admin','author','reviewer')
)
with check (
  exists (select 1 from course c where c.id = course_id and c.org_id = public.current_org_id())
  and public.current_role() in ('admin','author','reviewer')
);

create policy if not exists module_policy on module_draft
for all using (
  exists (
    select 1 from course_version cv join course c on c.id = cv.course_id
    where cv.id = course_version_id and c.org_id = public.current_org_id()
  ) and public.current_role() in ('admin','author','reviewer')
)
with check (
  exists (
    select 1 from course_version cv join course c on c.id = cv.course_id
    where cv.id = course_version_id and c.org_id = public.current_org_id()
  ) and public.current_role() in ('admin','author','reviewer')
);

create policy if not exists lesson_policy on lesson_draft
for all using (
  exists (
    select 1 from module_draft md
    join course_version cv on cv.id = md.course_version_id
    join course c on c.id = cv.course_id
    where md.id = module_draft_id and c.org_id = public.current_org_id()
  ) and public.current_role() in ('admin','author','reviewer')
)
with check (
  exists (
    select 1 from module_draft md
    join course_version cv on cv.id = md.course_version_id
    join course c on c.id = cv.course_id
    where md.id = module_draft_id and c.org_id = public.current_org_id()
  ) and public.current_role() in ('admin','author','reviewer')
);

create policy if not exists node_policy on lesson_node_draft
for all using (
  exists (
    select 1 from lesson_draft ld
    join module_draft md on md.id = ld.module_draft_id
    join course_version cv on cv.id = md.course_version_id
    join course c on c.id = cv.course_id
    where ld.id = lesson_draft_id and c.org_id = public.current_org_id()
  ) and public.current_role() in ('admin','author','reviewer')
)
with check (
  exists (
    select 1 from lesson_draft ld
    join module_draft md on md.id = ld.module_draft_id
    join course_version cv on cv.id = md.course_version_id
    join course c on c.id = cv.course_id
    where ld.id = lesson_draft_id and c.org_id = public.current_org_id()
  ) and public.current_role() in ('admin','author','reviewer')
);

-- review/publish policies
create policy if not exists review_policy on review_cycle
for all using (
  exists (
    select 1 from course_version cv join course c on c.id = cv.course_id
    where cv.id = course_version_id and c.org_id = public.current_org_id()
  ) and public.current_role() in ('admin','author','reviewer')
)
with check (
  exists (
    select 1 from course_version cv join course c on c.id = cv.course_id
    where cv.id = course_version_id and c.org_id = public.current_org_id()
  ) and public.current_role() in ('admin','author','reviewer')
);

create policy if not exists publish_policy on publish_job
for all using (
  exists (
    select 1 from course_version cv join course c on c.id = cv.course_id
    where cv.id = course_version_id and c.org_id = public.current_org_id()
  ) and public.current_role() in ('admin','reviewer')
)
with check (
  exists (
    select 1 from course_version cv join course c on c.id = cv.course_id
    where cv.id = course_version_id and c.org_id = public.current_org_id()
  ) and public.current_role() in ('admin','reviewer')
);

-- runtime access: authors/reviewers/admin in same org; learners only if enrolled
create policy if not exists runtime_package_policy on runtime_package
for select using (
  exists (select 1 from course c where c.id = course_id and c.org_id = public.current_org_id())
  and (
    public.current_role() in ('admin','author','reviewer')
    or exists (select 1 from enrollment e where e.course_id = course_id and e.learner_id = auth.uid()::text)
  )
);

create policy if not exists runtime_lesson_policy on runtime_lesson
for select using (
  exists (
    select 1 from runtime_package rp
    join course c on c.id = rp.course_id
    where rp.id = runtime_package_id and c.org_id = public.current_org_id()
  )
);

create policy if not exists runtime_node_policy on runtime_node
for select using (
  exists (
    select 1 from runtime_lesson rl
    join runtime_package rp on rp.id = rl.runtime_package_id
    join course c on c.id = rp.course_id
    where rl.id = runtime_lesson_id and c.org_id = public.current_org_id()
  )
);

-- learner ownership policies
create policy if not exists enrollment_policy on enrollment
for all using (
  learner_id = auth.uid()::text
  or (public.current_role() in ('admin','author','reviewer') and exists (select 1 from course c where c.id = course_id and c.org_id = public.current_org_id()))
)
with check (
  learner_id = auth.uid()::text
  or (public.current_role() in ('admin','author','reviewer') and exists (select 1 from course c where c.id = course_id and c.org_id = public.current_org_id()))
);

create policy if not exists lesson_attempt_policy on lesson_attempt
for all using (
  exists (select 1 from enrollment e where e.id = enrollment_id and e.learner_id = auth.uid()::text)
  or public.current_role() in ('admin','author','reviewer')
)
with check (
  exists (select 1 from enrollment e where e.id = enrollment_id and e.learner_id = auth.uid()::text)
  or public.current_role() in ('admin','author','reviewer')
);

create policy if not exists progress_policy on progress_record
for all using (
  exists (select 1 from enrollment e where e.id = enrollment_id and e.learner_id = auth.uid()::text)
  or public.current_role() in ('admin','author','reviewer')
)
with check (
  exists (select 1 from enrollment e where e.id = enrollment_id and e.learner_id = auth.uid()::text)
  or public.current_role() in ('admin','author','reviewer')
);

create policy if not exists event_policy on event_log
for all using (
  exists (select 1 from enrollment e where e.id = enrollment_id and e.learner_id = auth.uid()::text)
  or public.current_role() in ('admin','author','reviewer')
)
with check (
  exists (select 1 from enrollment e where e.id = enrollment_id and e.learner_id = auth.uid()::text)
  or public.current_role() in ('admin','author','reviewer')
);
