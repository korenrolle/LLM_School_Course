import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnalyticsEvent, LessonAttempt, ProgressRecord } from '@/types/domain';

export const learningRepository = {
  async ensureEnrollment(client: SupabaseClient, courseId: string, learnerId: string) {
    const { data: existing } = await client.from('enrollment').select('id, course_id, learner_id').eq('course_id', courseId).eq('learner_id', learnerId).maybeSingle();
    if (existing) return { id: existing.id, courseId: existing.course_id, learnerId: existing.learner_id };

    const { data, error } = await client.from('enrollment').insert({ course_id: courseId, learner_id: learnerId }).select('id, course_id, learner_id').single();
    if (error) throw error;
    return { id: data.id, courseId: data.course_id, learnerId: data.learner_id };
  },
  async startLessonAttempt(client: SupabaseClient, enrollmentId: string, runtimeLessonId: string): Promise<LessonAttempt> {
    const { data, error } = await client.from('lesson_attempt').insert({ enrollment_id: enrollmentId, runtime_lesson_id: runtimeLessonId, status: 'in_progress' }).select('id, enrollment_id, runtime_lesson_id, status').single();
    if (error) throw error;
    return { id: data.id, enrollmentId: data.enrollment_id, runtimeLessonId: data.runtime_lesson_id, status: data.status };
  },
  async upsertProgress(client: SupabaseClient, enrollmentId: string, runtimePackageId: string, percentComplete: number, lastLessonId: string | null): Promise<ProgressRecord> {
    const { data, error } = await client.from('progress_record').upsert({
      enrollment_id: enrollmentId,
      runtime_package_id: runtimePackageId,
      percent_complete: percentComplete,
      last_lesson_id: lastLessonId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'enrollment_id,runtime_package_id' }).select('id, enrollment_id, runtime_package_id, percent_complete, last_lesson_id').single();
    if (error) throw error;
    return { id: data.id, enrollmentId: data.enrollment_id, runtimePackageId: data.runtime_package_id, percentComplete: Number(data.percent_complete), lastLessonId: data.last_lesson_id };
  },
  async logEvent(client: SupabaseClient, event: AnalyticsEvent) {
    const { error } = await client.from('event_log').insert({
      event_name: event.eventName,
      enrollment_id: event.enrollmentId,
      runtime_lesson_id: event.runtimeLessonId,
      runtime_node_id: event.runtimeNodeId,
      payload_json: event.payload,
    });
    if (error) throw error;
  },
  async getEvents(client: SupabaseClient) {
    const { data, error } = await client.from('event_log').select('id, event_name, enrollment_id, runtime_lesson_id, runtime_node_id, payload_json, created_at').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    return data ?? [];
  },
};
