import { NextRequest, NextResponse } from 'next/server';
import { learningRepository } from '@/lib/repositories/learningRepository';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const enrollment = learningRepository.ensureEnrollment(body.courseId as string, body.learnerId as string);
  const attempt = learningRepository.startLessonAttempt(enrollment.id, body.runtimeLessonId as string);
  learningRepository.logEvent({ eventName: 'lesson_started', enrollmentId: enrollment.id, runtimeLessonId: body.runtimeLessonId, payload: {} });
  return NextResponse.json({ data: { enrollment, attempt }, error: null });
}
