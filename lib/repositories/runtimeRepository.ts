import { db } from './inMemoryStore';
import type { RuntimeLesson, RuntimeNode, RuntimePackage } from '@/types/domain';

export const runtimeRepository = {
  createRuntimePackage(pkg: RuntimePackage) {
    for (const existing of db.runtimePackages.values()) {
      if (existing.courseId === pkg.courseId) existing.isCurrent = false;
    }
    db.runtimePackages.set(pkg.id, pkg);
    return pkg;
  },
  createRuntimeLesson(lesson: RuntimeLesson) {
    db.runtimeLessons.set(lesson.id, lesson);
    return lesson;
  },
  createRuntimeNode(node: RuntimeNode) {
    db.runtimeNodes.set(node.id, node);
    return node;
  },
  getCurrentPackageByCourse(courseId: string): RuntimePackage | null {
    return [...db.runtimePackages.values()].find((pkg) => pkg.courseId === courseId && pkg.isCurrent) ?? null;
  },
  getRuntimeLessons(runtimePackageId: string): RuntimeLesson[] {
    return [...db.runtimeLessons.values()].filter((l) => l.runtimePackageId === runtimePackageId).sort((a, b) => a.lessonOrder - b.lessonOrder);
  },
  getRuntimeNodes(runtimeLessonId: string): RuntimeNode[] {
    return [...db.runtimeNodes.values()].filter((n) => n.runtimeLessonId === runtimeLessonId).sort((a, b) => a.orderIndex - b.orderIndex);
  },
};
