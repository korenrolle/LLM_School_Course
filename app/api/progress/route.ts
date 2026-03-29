import { NextRequest, NextResponse } from 'next/server';
import { learningRepository } from '@/lib/repositories/learningRepository';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const progress = learningRepository.upsertProgress(
    body.enrollmentId as string,
    body.runtimePackageId as string,
    Number(body.percentComplete ?? 0),
    (body.lastLessonId as string | null) ?? null,
  );
  return NextResponse.json({ data: progress, error: null });
}
