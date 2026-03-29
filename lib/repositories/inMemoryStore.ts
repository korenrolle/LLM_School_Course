import {
  Course,
  CourseVersion,
  LessonAttempt,
  LessonDraft,
  LessonNodeDraft,
  ModuleDraft,
  ProgressRecord,
  PublishJob,
  ReviewCycle,
  RuntimeLesson,
  RuntimeNode,
  RuntimePackage,
} from '@/types/domain';

export const db = {
  courses: new Map<string, Course>(),
  versions: new Map<string, CourseVersion>(),
  modules: new Map<string, ModuleDraft>(),
  lessons: new Map<string, LessonDraft>(),
  nodes: new Map<string, LessonNodeDraft>(),
  reviews: new Map<string, ReviewCycle>(),
  publishJobs: new Map<string, PublishJob>(),
  runtimePackages: new Map<string, RuntimePackage>(),
  runtimeLessons: new Map<string, RuntimeLesson>(),
  runtimeNodes: new Map<string, RuntimeNode>(),
  enrollments: new Map<string, { id: string; courseId: string; learnerId: string }>(),
  lessonAttempts: new Map<string, LessonAttempt>(),
  progressRecords: new Map<string, ProgressRecord>(),
  events: [] as Array<Record<string, unknown>>,
};

export const id = () => crypto.randomUUID();
