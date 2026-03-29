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
    const progress = await learningRepository.upsertProgress(
      client,
      body.enrollmentId as string,
      body.runtimePackageId as string,
      Number(body.percentComplete ?? 0),
      (body.lastLessonId as string | null) ?? null,
    );
    return NextResponse.json({ data: progress, error: null });
  } catch (e) {
    return NextResponse.json({ data: null, error: (e as Error).message }, { status: 401 });
  }
}
