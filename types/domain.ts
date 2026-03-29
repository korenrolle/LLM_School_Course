export type NodeType = 'reading' | 'video' | 'quiz' | 'reflection' | 'resource';
export type CourseVersionStatus = 'draft' | 'in_review' | 'changes_requested' | 'approved' | 'published';
export type ReviewStatus = 'open' | 'changes_requested' | 'approved';
export type PublishStatus = 'queued' | 'building' | 'published' | 'failed';

export interface Course {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
}

export interface CourseVersion {
  id: string;
  courseId: string;
  versionNo: number;
  status: CourseVersionStatus;
}

export interface ModuleDraft {
  id: string;
  courseVersionId: string;
  title: string;
  orderIndex: number;
}

export interface LessonDraft {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  orderIndex: number;
  completionRule: Record<string, unknown>;
}

export interface ReadingPayload { markdown: string; }
export interface VideoPayload { videoUrl: string; durationSec: number; }
export interface QuizQuestion { key: string; prompt: string; choices: string[]; answerIndex: number; }
export interface QuizPayload { questions: QuizQuestion[]; passScore: number; }
export interface ReflectionPayload { prompt: string; minChars: number; }
export interface ResourcePayload { label: string; url: string; }

export type NodePayload = ReadingPayload | VideoPayload | QuizPayload | ReflectionPayload | ResourcePayload;

export interface LessonNodeDraft {
  id: string;
  lessonId: string;
  nodeType: NodeType;
  orderIndex: number;
  config: NodePayload;
  required: boolean;
}

export interface ReviewCycle {
  id: string;
  courseVersionId: string;
  status: ReviewStatus;
}

export interface PublishJob {
  id: string;
  courseVersionId: string;
  status: PublishStatus;
}

export interface RuntimePackage {
  id: string;
  courseId: string;
  courseVersionId: string;
  packageVersion: number;
  isCurrent: boolean;
  manifest: RuntimeManifest;
}

export interface RuntimeManifest {
  schemaVersion: number;
  courseId: string;
  modules: Array<{
    moduleTitle: string;
    lessons: Array<{ runtimeLessonId: string; title: string; slug: string }>;
  }>;
}

export interface RuntimeLesson {
  id: string;
  runtimePackageId: string;
  title: string;
  slug: string;
  lessonOrder: number;
  completionRule: Record<string, unknown>;
}

export interface RuntimeNode {
  id: string;
  runtimeLessonId: string;
  nodeType: NodeType;
  orderIndex: number;
  render: NodePayload;
  completion: Record<string, unknown>;
}

export interface LessonAttempt {
  id: string;
  enrollmentId: string;
  runtimeLessonId: string;
  status: 'in_progress' | 'completed';
}

export interface ProgressRecord {
  id: string;
  enrollmentId: string;
  runtimePackageId: string;
  percentComplete: number;
  lastLessonId: string | null;
}

export interface AnalyticsEvent {
  eventName: 'lesson_started' | 'node_viewed' | 'quiz_submitted' | 'reflection_submitted' | 'lesson_completed';
  enrollmentId: string;
  runtimeLessonId?: string;
  runtimeNodeId?: string;
  payload: Record<string, unknown>;
}
