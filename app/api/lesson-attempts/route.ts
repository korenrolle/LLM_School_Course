import { NextRequest, NextResponse } from 'next/server';
import { requireRole, requireSession } from '@/lib/auth';
import { createUserScopedClient } from '@/lib/supabase';
import { learningRepository } from '@/lib/repositories/learningRepository';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireRole(session.role, ['learner', 'admin']);
    const body = await req.json();
    const client = createUserScopedClient(session.accessToken);
    const enrollment = await learningRepository.ensureEnrollment(client, body.courseId as string, session.userId);
    const attempt = await learningRepository.startLessonAttempt(client, enrollment.id, body.runtimeLessonId as string);
    await learningRepository.logEvent(client, { eventName: 'lesson_started', enrollmentId: enrollment.id, runtimeLessonId: body.runtimeLessonId, payload: {} });
    return NextResponse.json({ data: { enrollment, attempt }, error: null });
  } catch (e) {
    return NextResponse.json({ data: null, error: (e as Error).message }, { status: 401 });
  }
}
