import { courseRepository } from '@/lib/repositories/courseRepository';
import { db, id } from '@/lib/repositories/inMemoryStore';
import type { ReviewCycle } from '@/types/domain';

export const reviewService = {
  submitForReview(courseVersionId: string): ReviewCycle {
    const version = courseRepository.getVersion(courseVersionId);
    if (!version) throw new Error('Course version not found');
    if (version.status !== 'draft' && version.status !== 'changes_requested') {
      throw new Error(`Invalid status transition from ${version.status}`);
    }
    version.status = 'in_review';
    courseRepository.updateVersion(version);

    const review: ReviewCycle = { id: id(), courseVersionId, status: 'open' };
    db.reviews.set(review.id, review);
    return review;
  },
  approveReview(reviewId: string) {
    const review = db.reviews.get(reviewId);
    if (!review) throw new Error('Review not found');
    review.status = 'approved';
    const version = courseRepository.getVersion(review.courseVersionId);
    if (!version) throw new Error('Course version not found');
    version.status = 'approved';
    courseRepository.updateVersion(version);
    return review;
  },
  requestChanges(reviewId: string) {
    const review = db.reviews.get(reviewId);
    if (!review) throw new Error('Review not found');
    review.status = 'changes_requested';
    const version = courseRepository.getVersion(review.courseVersionId);
    if (!version) throw new Error('Course version not found');
    version.status = 'changes_requested';
    courseRepository.updateVersion(version);
    return review;
  },
};
