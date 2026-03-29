import { db, id } from '@/lib/repositories/inMemoryStore';
import type { Course, CourseVersion, LessonDraft, LessonNodeDraft, ModuleDraft, NodePayload, NodeType } from '@/types/domain';

export const courseAuthoringService = {
  createCourse(input: { slug: string; title: string; summary?: string | null }): Course {
    const course: Course = { id: id(), slug: input.slug, title: input.title, summary: input.summary ?? null };
    db.courses.set(course.id, course);
    return course;
  },
  createCourseVersion(courseId: string): CourseVersion {
    const versionNo = [...db.versions.values()].filter((v) => v.courseId === courseId).length + 1;
    const version: CourseVersion = { id: id(), courseId, versionNo, status: 'draft' };
    db.versions.set(version.id, version);
    return version;
  },
  createModule(courseVersionId: string, title: string): ModuleDraft {
    const orderIndex = [...db.modules.values()].filter((m) => m.courseVersionId === courseVersionId).length + 1;
    const module: ModuleDraft = { id: id(), courseVersionId, title, orderIndex };
    db.modules.set(module.id, module);
    return module;
  },
  createLesson(moduleId: string, title: string, slug: string): LessonDraft {
    const orderIndex = [...db.lessons.values()].filter((l) => l.moduleId === moduleId).length + 1;
    const lesson: LessonDraft = { id: id(), moduleId, title, slug, orderIndex, completionRule: { minRequiredNodes: 1 } };
    db.lessons.set(lesson.id, lesson);
    return lesson;
  },
  createLessonNode(lessonId: string, nodeType: NodeType, config: NodePayload, required = true): LessonNodeDraft {
    const orderIndex = [...db.nodes.values()].filter((n) => n.lessonId === lessonId).length + 1;
    const node: LessonNodeDraft = { id: id(), lessonId, nodeType, orderIndex, config, required };
    db.nodes.set(node.id, node);
    return node;
  },
};
