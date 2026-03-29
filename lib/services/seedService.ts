import type { SupabaseClient } from '@supabase/supabase-js';

export const seedService = {
  async seedExampleData(client: SupabaseClient, orgId: string, authorId: string) {
    const { data: existing } = await client.from('course').select('id').eq('slug', 'product-architecture-101').maybeSingle();
    if (existing) return { seeded: false, reason: 'already_seeded', courseId: existing.id };

    const { data: course, error: courseErr } = await client.from('course').insert({
      slug: 'product-architecture-101',
      title: 'Product Architecture 101',
      summary: 'Vertical slice seed course',
      org_id: orgId,
      created_by: authorId,
    }).select('id').single();
    if (courseErr) throw courseErr;

    const { data: version, error: versionErr } = await client.from('course_version').insert({ course_id: course.id, version_no: 1, status: 'draft' }).select('id').single();
    if (versionErr) throw versionErr;

    const { data: module, error: moduleErr } = await client.from('module_draft').insert({ course_version_id: version.id, title: 'Core Foundations', order_index: 1 }).select('id').single();
    if (moduleErr) throw moduleErr;

    const lessons = await client.from('lesson_draft').insert([
      { module_draft_id: module.id, title: 'What is an LXP?', slug: 'what-is-lxp', order_index: 1, completion_rule_json: { minRequiredNodes: 2 } },
      { module_draft_id: module.id, title: 'Publish Lifecycle', slug: 'publish-lifecycle', order_index: 2, completion_rule_json: { minRequiredNodes: 2 } },
      { module_draft_id: module.id, title: 'Assessment Basics', slug: 'assessment-basics', order_index: 3, completion_rule_json: { minRequiredNodes: 2 } },
    ]).select('id, slug');
    if (lessons.error || !lessons.data) throw lessons.error;

    const get = (slug: string) => lessons.data!.find((l) => l.slug === slug)!.id;

    const { error: nodesErr } = await client.from('lesson_node_draft').insert([
      { lesson_draft_id: get('what-is-lxp'), node_type: 'reading', order_index: 1, required: true, config_json: { markdown: '## LXP\nA multi-layer learning platform.' } },
      { lesson_draft_id: get('what-is-lxp'), node_type: 'video', order_index: 2, required: true, config_json: { videoUrl: 'https://example.com/video.mp4', durationSec: 180 } },
      { lesson_draft_id: get('publish-lifecycle'), node_type: 'reflection', order_index: 1, required: true, config_json: { prompt: 'Why separate draft and runtime?', minChars: 20 } },
      { lesson_draft_id: get('publish-lifecycle'), node_type: 'resource', order_index: 2, required: false, config_json: { label: 'Lifecycle Checklist', url: 'https://example.com/checklist.pdf' } },
      { lesson_draft_id: get('assessment-basics'), node_type: 'quiz', order_index: 1, required: true, config_json: { passScore: 70, questions: [{ key: 'q1', prompt: 'Published artifacts should be?', choices: ['Mutable', 'Immutable'], answerIndex: 1 }] } },
      { lesson_draft_id: get('assessment-basics'), node_type: 'reading', order_index: 2, required: true, config_json: { markdown: 'Use events for measurable learning outcomes.' } },
    ]);
    if (nodesErr) throw nodesErr;

    return { seeded: true, courseId: course.id, courseVersionId: version.id };
  },
};
