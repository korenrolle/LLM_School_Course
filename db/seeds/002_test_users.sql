-- Optional local test seed for Supabase SQL editor.
-- Requires existing users in auth.users.

insert into organization (id, name)
values ('11111111-1111-1111-1111-111111111111', 'test-org')
on conflict (id) do update set name = excluded.name;

-- Map existing auth users by email to app roles.
insert into user_profile (user_id, org_id, role)
select id, '11111111-1111-1111-1111-111111111111', 'admin'::app_role_enum
from auth.users where email = 'admin@test.local'
on conflict (user_id) do update set org_id = excluded.org_id, role = excluded.role;

insert into user_profile (user_id, org_id, role)
select id, '11111111-1111-1111-1111-111111111111', 'author'::app_role_enum
from auth.users where email = 'author@test.local'
on conflict (user_id) do update set org_id = excluded.org_id, role = excluded.role;

insert into user_profile (user_id, org_id, role)
select id, '11111111-1111-1111-1111-111111111111', 'reviewer'::app_role_enum
from auth.users where email = 'reviewer@test.local'
on conflict (user_id) do update set org_id = excluded.org_id, role = excluded.role;

insert into user_profile (user_id, org_id, role)
select id, '11111111-1111-1111-1111-111111111111', 'learner'::app_role_enum
from auth.users where email = 'learner@test.local'
on conflict (user_id) do update set org_id = excluded.org_id, role = excluded.role;
