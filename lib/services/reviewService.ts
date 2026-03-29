import type { SupabaseClient } from '@supabase/supabase-js';
import { courseRepository } from '@/lib/repositories/courseRepository';

export const reviewService = {
  async submitForReview(client: SupabaseClient, courseVersionId: string) {
    const version = await courseRepository.getVersion(client, courseVersionId);
    if (!version) throw new Error('Course version not found');
    if (version.status !== 'draft' && version.status !== 'changes_requested') {
      throw new Error(`Invalid status transition from ${version.status}`);
    }
    await courseRepository.updateVersionStatus(client, courseVersionId, 'in_review');
    const { data, error } = await client
      .from('review_cycle')
      .insert({ course_version_id: courseVersionId, status: 'open' })
      .select('id, course_version_id, status')
      .single();
    if (error) throw error;
    return { id: data.id, courseVersionId: data.course_version_id, status: data.status };
  },
  async approveReview(client: SupabaseClient, reviewId: string) {
    const { data: review, error: reviewErr } = await client.from('review_cycle').select('id, course_version_id, status').eq('id', reviewId).single();
    if (reviewErr || !review) throw new Error('Review not found');

    const { error: updReviewErr } = await client.from('review_cycle').update({ status: 'approved' }).eq('id', reviewId);
    if (updReviewErr) throw updReviewErr;

    await courseRepository.updateVersionStatus(client, review.course_version_id, 'approved');
    return { id: review.id, courseVersionId: review.course_version_id, status: 'approved' as const };
  },
};
