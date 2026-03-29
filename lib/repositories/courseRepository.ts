import { db } from './inMemoryStore';
import type { Course, CourseVersion, LessonDraft, LessonNodeDraft, ModuleDraft } from '@/types/domain';

export const courseRepository = {
  getCourse(courseId: string): Course | null {
    return db.courses.get(courseId) ?? null;
  },
  listCourseVersions(courseId: string): CourseVersion[] {
    return [...db.versions.values()].filter((v) => v.courseId === courseId).sort((a, b) => a.versionNo - b.versionNo);
  },
  getVersion(versionId: string): CourseVersion | null {
    return db.versions.get(versionId) ?? null;
  },
  updateVersion(version: CourseVersion) {
    db.versions.set(version.id, version);
    return version;
  },
  getDraftTree(courseVersionId: string): { modules: ModuleDraft[]; lessons: LessonDraft[]; nodes: LessonNodeDraft[] } {
    const modules = [...db.modules.values()].filter((m) => m.courseVersionId === courseVersionId).sort((a, b) => a.orderIndex - b.orderIndex);
    const moduleIds = new Set(modules.map((m) => m.id));
    const lessons = [...db.lessons.values()].filter((l) => moduleIds.has(l.moduleId)).sort((a, b) => a.orderIndex - b.orderIndex);
    const lessonIds = new Set(lessons.map((l) => l.id));
    const nodes = [...db.nodes.values()].filter((n) => lessonIds.has(n.lessonId)).sort((a, b) => a.orderIndex - b.orderIndex);
    return { modules, lessons, nodes };
  },
};
