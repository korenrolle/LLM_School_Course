import { describe, it, expect, vi } from 'vitest';
import { reviewService } from '../../lib/services/reviewService';
import { courseRepository } from '../../lib/repositories/courseRepository';

describe('reviewService', () => {
  it('transitions draft to in_review', async () => {
    const client = {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: 'r1', course_version_id: 'v1', status: 'open' }, error: null })) })) })),
      })),
    } as any;

    vi.spyOn(courseRepository, 'getVersion').mockResolvedValue({ id: 'v1', courseId: 'c1', versionNo: 1, status: 'draft' });
    vi.spyOn(courseRepository, 'updateVersionStatus').mockResolvedValue();

    const review = await reviewService.submitForReview(client, 'v1');
    expect(review.status).toBe('open');
  });
});
