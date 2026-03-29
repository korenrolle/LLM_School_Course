import { NextRequest, NextResponse } from 'next/server';
import { publishService } from '@/lib/services/publishService';

export async function POST(_: NextRequest, context: { params: Promise<{ versionId: string }> }) {
  try {
    const { versionId } = await context.params;
    const data = publishService.publishCourseVersion(versionId);
    return NextResponse.json({ data, error: null });
  } catch (e) {
    return NextResponse.json({ data: null, error: (e as Error).message }, { status: 400 });
  }
}
