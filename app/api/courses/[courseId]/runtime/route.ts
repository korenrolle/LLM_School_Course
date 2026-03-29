import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { createUserScopedClient } from '@/lib/supabase';
import { runtimeRepository } from '@/lib/repositories/runtimeRepository';

export async function GET(req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  try {
    const session = await requireSession(req);
    const client = createUserScopedClient(session.accessToken);
    const { courseId } = await context.params;
    const runtimePackage = await runtimeRepository.getCurrentPackageByCourse(client, courseId);
    if (!runtimePackage) return NextResponse.json({ data: null, error: 'No published package' }, { status: 404 });

    const lessons = (await runtimeRepository.getRuntimeLessons(client, runtimePackage.id));
    const lessonsWithNodes = await Promise.all(lessons.map(async (lesson) => ({ ...lesson, nodes: await runtimeRepository.getRuntimeNodes(client, lesson.id) })));
    return NextResponse.json({ data: { runtimePackage, lessons: lessonsWithNodes }, error: null });
  } catch (e) {
    return NextResponse.json({ data: null, error: (e as Error).message }, { status: 401 });
  }
}
