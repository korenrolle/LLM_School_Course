import { NextRequest, NextResponse } from 'next/server';
import { runtimeRepository } from '@/lib/repositories/runtimeRepository';

export async function GET(_: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  const runtimePackage = runtimeRepository.getCurrentPackageByCourse(courseId);
  if (!runtimePackage) return NextResponse.json({ data: null, error: 'No published package' }, { status: 404 });

  const lessons = runtimeRepository.getRuntimeLessons(runtimePackage.id).map((lesson) => ({
    ...lesson,
    nodes: runtimeRepository.getRuntimeNodes(lesson.id),
  }));

  return NextResponse.json({ data: { runtimePackage, lessons }, error: null });
}
