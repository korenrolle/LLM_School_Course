import { describe, it, expect, vi, beforeEach } from 'vitest';

import { POST as seedPost } from '../../app/api/dev/seed/route';
import { POST as reviewPost } from '../../app/api/course-versions/[versionId]/review/route';
import { POST as approvePost } from '../../app/api/review-cycles/[reviewId]/approve/route';
import { POST as publishPost } from '../../app/api/course-versions/[versionId]/publish/route';
import { GET as runtimeGet } from '../../app/api/courses/[courseId]/runtime/route';
import { POST as attemptPost } from '../../app/api/lesson-attempts/route';
import { POST as progressPost } from '../../app/api/progress/route';

vi.mock('../../lib/auth', () => ({
  requireSession: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock('../../lib/supabase', () => ({
  createUserScopedClient: vi.fn(() => ({ mocked: true })),
}));

vi.mock('../../lib/services/seedService', () => ({
  seedService: { seedExampleData: vi.fn() },
}));
vi.mock('../../lib/services/reviewService', () => ({
  reviewService: { submitForReview: vi.fn(), approveReview: vi.fn() },
}));
vi.mock('../../lib/services/publishService', () => ({
  publishService: { publishCourseVersion: vi.fn() },
}));
vi.mock('../../lib/repositories/runtimeRepository', () => ({
  runtimeRepository: { getCurrentPackageByCourse: vi.fn(), getRuntimeLessons: vi.fn(), getRuntimeNodes: vi.fn() },
}));
vi.mock('../../lib/repositories/learningRepository', () => ({
  learningRepository: { ensureEnrollment: vi.fn(), startLessonAttempt: vi.fn(), logEvent: vi.fn(), upsertProgress: vi.fn() },
}));

import { requireSession, requireRole } from '../../lib/auth';
import { seedService } from '../../lib/services/seedService';
import { reviewService } from '../../lib/services/reviewService';
import { publishService } from '../../lib/services/publishService';
import { runtimeRepository } from '../../lib/repositories/runtimeRepository';
import { learningRepository } from '../../lib/repositories/learningRepository';

const fakeReq = (body?: unknown) => ({ json: async () => body, headers: new Headers() }) as never;

describe('core auth + lifecycle e2e route flow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('runs seed->review->approve->publish->runtime->progress', async () => {
    vi.mocked(requireSession).mockResolvedValue({ accessToken: 't', userId: 'u1', role: 'author', orgId: 'o1' } as never);
    vi.mocked(seedService.seedExampleData).mockResolvedValue({ seeded: true, courseId: 'c1', courseVersionId: 'v1' });
    const seedRes = await seedPost(fakeReq());
    const seedBody = await seedRes.json();
    expect(seedBody.data.courseVersionId).toBe('v1');

    vi.mocked(reviewService.submitForReview).mockResolvedValue({ id: 'r1', courseVersionId: 'v1', status: 'open' } as never);
    const reviewRes = await reviewPost(fakeReq(), { params: Promise.resolve({ versionId: 'v1' }) });
    expect((await reviewRes.json()).data.id).toBe('r1');

    vi.mocked(requireSession).mockResolvedValue({ accessToken: 't2', userId: 'u2', role: 'reviewer', orgId: 'o1' } as never);
    vi.mocked(reviewService.approveReview).mockResolvedValue({ id: 'r1', courseVersionId: 'v1', status: 'approved' } as never);
    const approveRes = await approvePost(fakeReq(), { params: Promise.resolve({ reviewId: 'r1' }) });
    expect((await approveRes.json()).data.status).toBe('approved');

    vi.mocked(requireSession).mockResolvedValue({ accessToken: 'ta', userId: 'ua', role: 'admin', orgId: 'o1' } as never);
    vi.mocked(publishService.publishCourseVersion).mockResolvedValue({ publishJob: { id: 'pj1', courseVersionId: 'v1', status: 'published' }, runtimePackage: { id: 'rp1' } } as never);
    const publishRes = await publishPost(fakeReq(), { params: Promise.resolve({ versionId: 'v1' }) });
    expect((await publishRes.json()).data.publishJob.status).toBe('published');

    vi.mocked(requireSession).mockResolvedValue({ accessToken: 'tl', userId: 'ul', role: 'learner', orgId: 'o1' } as never);
    vi.mocked(runtimeRepository.getCurrentPackageByCourse).mockResolvedValue({ id: 'rp1', courseId: 'c1', courseVersionId: 'v1', packageVersion: 1, isCurrent: true, manifest: { schemaVersion: 1, courseId: 'c1', modules: [] } });
    vi.mocked(runtimeRepository.getRuntimeLessons).mockResolvedValue([{ id: 'rl1', runtimePackageId: 'rp1', title: 'L1', slug: 'l1', lessonOrder: 1, completionRule: {} }]);
    vi.mocked(runtimeRepository.getRuntimeNodes).mockResolvedValue([{ id: 'rn1', runtimeLessonId: 'rl1', nodeType: 'reading', orderIndex: 1, render: { markdown: 'x' }, completion: {} }]);
    const runtimeRes = await runtimeGet(fakeReq(), { params: Promise.resolve({ courseId: 'c1' }) });
    expect((await runtimeRes.json()).data.lessons.length).toBe(1);

    vi.mocked(learningRepository.ensureEnrollment).mockResolvedValue({ id: 'e1', courseId: 'c1', learnerId: 'ul' });
    vi.mocked(learningRepository.startLessonAttempt).mockResolvedValue({ id: 'a1', enrollmentId: 'e1', runtimeLessonId: 'rl1', status: 'in_progress' } as never);
    const attemptRes = await attemptPost(fakeReq({ courseId: 'c1', runtimeLessonId: 'rl1' }));
    expect((await attemptRes.json()).data.attempt.id).toBe('a1');

    vi.mocked(learningRepository.upsertProgress).mockResolvedValue({ id: 'p1', enrollmentId: 'e1', runtimePackageId: 'rp1', percentComplete: 50, lastLessonId: 'rl1' });
    const progressRes = await progressPost(fakeReq({ enrollmentId: 'e1', runtimePackageId: 'rp1', percentComplete: 50, lastLessonId: 'rl1' }));
    expect((await progressRes.json()).data.percentComplete).toBe(50);

    expect(requireRole).toHaveBeenCalled();
  });

  it('denies unauthorized role action', async () => {
    vi.mocked(requireSession).mockResolvedValue({ accessToken: 't', userId: 'u', role: 'learner', orgId: 'o1' } as never);
    vi.mocked(requireRole).mockImplementation(() => {
      throw new Error('Forbidden');
    });
    const res = await approvePost(fakeReq(), { params: Promise.resolve({ reviewId: 'r1' }) });
    expect(res.status).toBe(400);
  });
});
