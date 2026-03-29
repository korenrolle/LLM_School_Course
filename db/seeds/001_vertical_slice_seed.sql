-- Example seed for vertical slice manual DB testing

insert into course (id, slug, title, summary)
values ('11111111-1111-1111-1111-111111111111', 'product-architecture-101', 'Product Architecture 101', 'Seed course')
on conflict do nothing;

insert into course_version (id, course_id, version_no, status)
values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 1, 'draft')
on conflict do nothing;
