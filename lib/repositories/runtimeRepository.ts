import type { SupabaseClient } from '@supabase/supabase-js';
import type { RuntimeLesson, RuntimeNode, RuntimePackage } from '@/types/domain';

export const runtimeRepository = {
  async createRuntimePackage(client: SupabaseClient, pkg: RuntimePackage) {
    await client.from('runtime_package').update({ is_current: false }).eq('course_id', pkg.courseId).eq('is_current', true);
    const { error } = await client.from('runtime_package').insert({
      id: pkg.id,
      course_id: pkg.courseId,
      course_version_id: pkg.courseVersionId,
      package_version: pkg.packageVersion,
      is_current: pkg.isCurrent,
      manifest_json: pkg.manifest,
    });
    if (error) throw error;
    return pkg;
  },
  async createRuntimeLesson(client: SupabaseClient, lesson: RuntimeLesson) {
    const { error } = await client.from('runtime_lesson').insert({
      id: lesson.id,
      runtime_package_id: lesson.runtimePackageId,
      title: lesson.title,
      slug: lesson.slug,
      lesson_order: lesson.lessonOrder,
      completion_rule_json: lesson.completionRule,
    });
    if (error) throw error;
    return lesson;
  },
  async createRuntimeNode(client: SupabaseClient, node: RuntimeNode) {
    const { error } = await client.from('runtime_node').insert({
      id: node.id,
      runtime_lesson_id: node.runtimeLessonId,
      node_type: node.nodeType,
      order_index: node.orderIndex,
      render_json: node.render,
      completion_json: node.completion,
    });
    if (error) throw error;
    return node;
  },
  async getCurrentPackageByCourse(client: SupabaseClient, courseId: string): Promise<RuntimePackage | null> {
    const { data, error } = await client.from('runtime_package').select('id, course_id, course_version_id, package_version, is_current, manifest_json').eq('course_id', courseId).eq('is_current', true).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { id: data.id, courseId: data.course_id, courseVersionId: data.course_version_id, packageVersion: data.package_version, isCurrent: data.is_current, manifest: data.manifest_json };
  },
  async getRuntimeLessons(client: SupabaseClient, runtimePackageId: string): Promise<RuntimeLesson[]> {
    const { data, error } = await client.from('runtime_lesson').select('id, runtime_package_id, title, slug, lesson_order, completion_rule_json').eq('runtime_package_id', runtimePackageId).order('lesson_order');
    if (error) throw error;
    return (data ?? []).map((l) => ({ id: l.id, runtimePackageId: l.runtime_package_id, title: l.title, slug: l.slug, lessonOrder: l.lesson_order, completionRule: l.completion_rule_json }));
  },
  async getRuntimeNodes(client: SupabaseClient, runtimeLessonId: string): Promise<RuntimeNode[]> {
    const { data, error } = await client.from('runtime_node').select('id, runtime_lesson_id, node_type, order_index, render_json, completion_json').eq('runtime_lesson_id', runtimeLessonId).order('order_index');
    if (error) throw error;
    return (data ?? []).map((n) => ({ id: n.id, runtimeLessonId: n.runtime_lesson_id, nodeType: n.node_type, orderIndex: n.order_index, render: n.render_json, completion: n.completion_json }));
  },
};
