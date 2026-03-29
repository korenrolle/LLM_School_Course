import { courseRepository } from '@/lib/repositories/courseRepository';
import { id, db } from '@/lib/repositories/inMemoryStore';
import { runtimeRepository } from '@/lib/repositories/runtimeRepository';
import type { PublishJob, RuntimeManifest, RuntimePackage } from '@/types/domain';

function validateDraft(versionId: string) {
  const { modules, lessons, nodes } = courseRepository.getDraftTree(versionId);
  if (modules.length === 0) throw new Error('At least one module is required');
  if (lessons.length === 0) throw new Error('At least one lesson is required');
  if (nodes.length === 0) throw new Error('At least one lesson node is required');
  for (const node of nodes) {
    if (!node.config || typeof node.config !== 'object') throw new Error(`Node ${node.id} has invalid config`);
  }
  return { modules, lessons, nodes };
}

export const publishService = {
  publishCourseVersion(courseVersionId: string) {
    const version = courseRepository.getVersion(courseVersionId);
    if (!version) throw new Error('Version not found');
    if (version.status !== 'approved') throw new Error('Only approved version can be published');

    const publishJob: PublishJob = { id: id(), courseVersionId, status: 'building' };
    db.publishJobs.set(publishJob.id, publishJob);

    const { modules, lessons, nodes } = validateDraft(courseVersionId);
    const course = courseRepository.getCourse(version.courseId);
    if (!course) throw new Error('Course not found');

    const existingPackages = [...db.runtimePackages.values()].filter((p) => p.courseId === course.id);
    const nextPackageVersion = existingPackages.length + 1;

    const manifest: RuntimeManifest = {
      schemaVersion: 1,
      courseId: course.id,
      modules: [],
    };

    const pkg: RuntimePackage = {
      id: id(),
      courseId: course.id,
      courseVersionId,
      packageVersion: nextPackageVersion,
      isCurrent: true,
      manifest,
    };

    runtimeRepository.createRuntimePackage(pkg);

    for (const module of modules) {
      const moduleLessons = lessons.filter((l) => l.moduleId === module.id);
      const manifestLessons: RuntimeManifest['modules'][number]['lessons'] = [];

      for (const lesson of moduleLessons) {
        const runtimeLesson = runtimeRepository.createRuntimeLesson({
          id: id(),
          runtimePackageId: pkg.id,
          title: lesson.title,
          slug: lesson.slug,
          lessonOrder: lesson.orderIndex,
          completionRule: lesson.completionRule,
        });

        const lessonNodes = nodes.filter((n) => n.lessonId === lesson.id);
        for (const node of lessonNodes) {
          runtimeRepository.createRuntimeNode({
            id: id(),
            runtimeLessonId: runtimeLesson.id,
            nodeType: node.nodeType,
            orderIndex: node.orderIndex,
            render: node.config,
            completion: { required: node.required },
          });
        }

        manifestLessons.push({ runtimeLessonId: runtimeLesson.id, title: runtimeLesson.title, slug: runtimeLesson.slug });
      }

      manifest.modules.push({ moduleTitle: module.title, lessons: manifestLessons });
    }

    version.status = 'published';
    courseRepository.updateVersion(version);

    publishJob.status = 'published';
    db.publishJobs.set(publishJob.id, publishJob);

    return { publishJob, runtimePackage: pkg };
  },
};
