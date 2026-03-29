import crypto from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { courseRepository } from '@/lib/repositories/courseRepository';
import { runtimeRepository } from '@/lib/repositories/runtimeRepository';
import type { RuntimeManifest, RuntimePackage } from '@/types/domain';

function id() {
  return crypto.randomUUID();
}

async function validateDraft(client: SupabaseClient, versionId: string) {
  const { modules, lessons, nodes } = await courseRepository.getDraftTree(client, versionId);
  if (modules.length === 0) throw new Error('At least one module is required');
  if (lessons.length === 0) throw new Error('At least one lesson is required');
  if (nodes.length === 0) throw new Error('At least one lesson node is required');
  for (const node of nodes) {
    if (!node.config || typeof node.config !== 'object') throw new Error(`Node ${node.id} has invalid config`);
  }
  return { modules, lessons, nodes };
}

export const publishService = {
  async publishCourseVersion(client: SupabaseClient, courseVersionId: string) {
    const version = await courseRepository.getVersion(client, courseVersionId);
    if (!version) throw new Error('Version not found');
    if (version.status !== 'approved') throw new Error('Only approved version can be published');

    const { data: job, error: jobError } = await client.from('publish_job').insert({ course_version_id: courseVersionId, status: 'building' }).select('id, course_version_id, status').single();
    if (jobError) throw jobError;

    const { modules, lessons, nodes } = await validateDraft(client, courseVersionId);
    const course = await courseRepository.getCourse(client, version.courseId);
    if (!course) throw new Error('Course not found');

    const { data: existing } = await client.from('runtime_package').select('package_version').eq('course_id', course.id).order('package_version', { ascending: false }).limit(1);
    const nextPackageVersion = (existing?.[0]?.package_version ?? 0) + 1;

    const manifest: RuntimeManifest = { schemaVersion: 1, courseId: course.id, modules: [] };
    const pkg: RuntimePackage = {
      id: id(), courseId: course.id, courseVersionId, packageVersion: nextPackageVersion, isCurrent: true, manifest,
    };

    await runtimeRepository.createRuntimePackage(client, pkg);

    for (const module of modules) {
      const moduleLessons = lessons.filter((l) => l.moduleId === module.id);
      const manifestLessons: RuntimeManifest['modules'][number]['lessons'] = [];
      for (const lesson of moduleLessons) {
        const runtimeLesson = await runtimeRepository.createRuntimeLesson(client, {
          id: id(), runtimePackageId: pkg.id, title: lesson.title, slug: lesson.slug, lessonOrder: lesson.orderIndex, completionRule: lesson.completionRule,
        });
        const lessonNodes = nodes.filter((n) => n.lessonId === lesson.id);
        for (const node of lessonNodes) {
          await runtimeRepository.createRuntimeNode(client, {
            id: id(), runtimeLessonId: runtimeLesson.id, nodeType: node.nodeType, orderIndex: node.orderIndex, render: node.config, completion: { required: node.required },
          });
        }
        manifestLessons.push({ runtimeLessonId: runtimeLesson.id, title: runtimeLesson.title, slug: runtimeLesson.slug });
      }
      manifest.modules.push({ moduleTitle: module.title, lessons: manifestLessons });
    }

    const { error: manifestErr } = await client.from('runtime_package').update({ manifest_json: manifest }).eq('id', pkg.id);
    if (manifestErr) throw manifestErr;

    await courseRepository.updateVersionStatus(client, courseVersionId, 'published');
    const { error: finalJobError } = await client.from('publish_job').update({ status: 'published' }).eq('id', job.id);
    if (finalJobError) throw finalJobError;

    return { publishJob: { id: job.id, courseVersionId: job.course_version_id, status: 'published' }, runtimePackage: { ...pkg, manifest } };
  },
};
