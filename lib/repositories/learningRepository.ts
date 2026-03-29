import { db, id } from './inMemoryStore';
import type { AnalyticsEvent, LessonAttempt, ProgressRecord } from '@/types/domain';

export const learningRepository = {
  ensureEnrollment(courseId: string, learnerId: string) {
    const existing = [...db.enrollments.values()].find((e) => e.courseId === courseId && e.learnerId === learnerId);
    if (existing) return existing;
    const enrollment = { id: id(), courseId, learnerId };
    db.enrollments.set(enrollment.id, enrollment);
    return enrollment;
  },
  startLessonAttempt(enrollmentId: string, runtimeLessonId: string): LessonAttempt {
    const attempt = { id: id(), enrollmentId, runtimeLessonId, status: 'in_progress' as const };
    db.lessonAttempts.set(attempt.id, attempt);
    return attempt;
  },
  completeLessonAttempt(attemptId: string) {
    const attempt = db.lessonAttempts.get(attemptId);
    if (!attempt) return null;
    attempt.status = 'completed';
    return attempt;
  },
  upsertProgress(enrollmentId: string, runtimePackageId: string, percentComplete: number, lastLessonId: string | null): ProgressRecord {
    const existing = [...db.progressRecords.values()].find((p) => p.enrollmentId === enrollmentId && p.runtimePackageId === runtimePackageId);
    if (existing) {
      existing.percentComplete = percentComplete;
      existing.lastLessonId = lastLessonId;
      return existing;
    }
    const created = { id: id(), enrollmentId, runtimePackageId, percentComplete, lastLessonId };
    db.progressRecords.set(created.id, created);
    return created;
  },
  logEvent(event: AnalyticsEvent) {
    db.events.push({ id: id(), at: new Date().toISOString(), ...event });
  },
  getEvents() {
    return db.events;
  },
};
