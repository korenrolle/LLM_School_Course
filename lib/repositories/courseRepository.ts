import type { SupabaseClient } from '@supabase/supabase-js';
import type { Course, CourseVersion, LessonDraft, LessonNodeDraft, ModuleDraft } from '@/types/domain';

export const courseRepository = {
  async getCourse(client: SupabaseClient, courseId: string): Promise<Course | null> {
    const { data } = await client.from('course').select('id, slug, title, summary').eq('id', courseId).maybeSingle();
    return (data as Course | null) ?? null;
  },
  async listCourseVersions(client: SupabaseClient, courseId: string): Promise<CourseVersion[]> {
    const { data, error } = await client.from('course_version').select('id, course_id, version_no, status').eq('course_id', courseId).order('version_no');
    if (error) throw error;
    return (data ?? []).map((v) => ({ id: v.id, courseId: v.course_id, versionNo: v.version_no, status: v.status }));
  },
  async getVersion(client: SupabaseClient, versionId: string): Promise<CourseVersion | null> {
    const { data, error } = await client.from('course_version').select('id, course_id, version_no, status').eq('id', versionId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { id: data.id, courseId: data.course_id, versionNo: data.version_no, status: data.status };
  },
  async updateVersionStatus(client: SupabaseClient, versionId: string, status: CourseVersion['status']) {
    const { error } = await client.from('course_version').update({ status }).eq('id', versionId);
    if (error) throw error;
  },
  async getDraftTree(client: SupabaseClient, courseVersionId: string): Promise<{ modules: ModuleDraft[]; lessons: LessonDraft[]; nodes: LessonNodeDraft[] }> {
    const { data: modulesData, error: mErr } = await client.from('module_draft').select('id, course_version_id, title, order_index').eq('course_version_id', courseVersionId).order('order_index');
    if (mErr) throw mErr;
    const modules: ModuleDraft[] = (modulesData ?? []).map((m) => ({ id: m.id, courseVersionId: m.course_version_id, title: m.title, orderIndex: m.order_index }));

    const moduleIds = modules.map((m) => m.id);
    if (moduleIds.length === 0) return { modules, lessons: [], nodes: [] };

    const { data: lessonsData, error: lErr } = await client.from('lesson_draft').select('id, module_draft_id, title, slug, order_index, completion_rule_json').in('module_draft_id', moduleIds).order('order_index');
    if (lErr) throw lErr;
    const lessons: LessonDraft[] = (lessonsData ?? []).map((l) => ({ id: l.id, moduleId: l.module_draft_id, title: l.title, slug: l.slug, orderIndex: l.order_index, completionRule: l.completion_rule_json }));

    const lessonIds = lessons.map((l) => l.id);
    if (lessonIds.length === 0) return { modules, lessons, nodes: [] };

    const { data: nodesData, error: nErr } = await client.from('lesson_node_draft').select('id, lesson_draft_id, node_type, order_index, config_json, required').in('lesson_draft_id', lessonIds).order('order_index');
    if (nErr) throw nErr;
    const nodes: LessonNodeDraft[] = (nodesData ?? []).map((n) => ({ id: n.id, lessonId: n.lesson_draft_id, nodeType: n.node_type, orderIndex: n.order_index, config: n.config_json, required: n.required }));

    return { modules, lessons, nodes };
  },
};
