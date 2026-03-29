import { db, id } from '@/lib/repositories/inMemoryStore';
import type { Course, CourseVersion, LessonDraft, LessonNodeDraft, ModuleDraft } from '@/types/domain';

export const seedService = {
  seedExampleData() {
    if (db.courses.size > 0) return { seeded: false, reason: 'already_seeded' };

    const course: Course = {
      id: id(),
      slug: 'product-architecture-101',
      title: 'Product Architecture 101',
      summary: 'Vertical slice seed course',
    };
    const version: CourseVersion = { id: id(), courseId: course.id, versionNo: 1, status: 'draft' };
    const module: ModuleDraft = { id: id(), courseVersionId: version.id, title: 'Core Foundations', orderIndex: 1 };

    const lesson1: LessonDraft = { id: id(), moduleId: module.id, title: 'What is an LXP?', slug: 'what-is-lxp', orderIndex: 1, completionRule: { minRequiredNodes: 2 } };
    const lesson2: LessonDraft = { id: id(), moduleId: module.id, title: 'Publish Lifecycle', slug: 'publish-lifecycle', orderIndex: 2, completionRule: { minRequiredNodes: 2 } };
    const lesson3: LessonDraft = { id: id(), moduleId: module.id, title: 'Assessment Basics', slug: 'assessment-basics', orderIndex: 3, completionRule: { minRequiredNodes: 2 } };

    const nodes: LessonNodeDraft[] = [
      { id: id(), lessonId: lesson1.id, nodeType: 'reading', orderIndex: 1, required: true, config: { markdown: '## LXP\nA multi-layer learning platform.' } },
      { id: id(), lessonId: lesson1.id, nodeType: 'video', orderIndex: 2, required: true, config: { videoUrl: 'https://example.com/video.mp4', durationSec: 180 } },
      { id: id(), lessonId: lesson2.id, nodeType: 'reflection', orderIndex: 1, required: true, config: { prompt: 'Why separate draft and runtime?', minChars: 20 } },
      { id: id(), lessonId: lesson2.id, nodeType: 'resource', orderIndex: 2, required: false, config: { label: 'Lifecycle Checklist', url: 'https://example.com/checklist.pdf' } },
      { id: id(), lessonId: lesson3.id, nodeType: 'quiz', orderIndex: 1, required: true, config: { passScore: 70, questions: [{ key: 'q1', prompt: 'Published artifacts should be?', choices: ['Mutable', 'Immutable'], answerIndex: 1 }] } },
      { id: id(), lessonId: lesson3.id, nodeType: 'reading', orderIndex: 2, required: true, config: { markdown: 'Use events for measurable learning outcomes.' } },
    ];

    db.courses.set(course.id, course);
    db.versions.set(version.id, version);
    db.modules.set(module.id, module);
    [lesson1, lesson2, lesson3].forEach((l) => db.lessons.set(l.id, l));
    nodes.forEach((n) => db.nodes.set(n.id, n));

    return { seeded: true, courseId: course.id, courseVersionId: version.id };
  },
};
