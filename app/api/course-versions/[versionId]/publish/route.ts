import { NextRequest, NextResponse } from 'next/server';
import { requireRole, requireSession } from '@/lib/auth';
import { createUserScopedClient } from '@/lib/supabase';
import { publishService } from '@/lib/services/publishService';

export async function POST(req: NextRequest, context: { params: Promise<{ versionId: string }> }) {
  try {
    const session = await requireSession(req);
    requireRole(session.role, ['admin']);
    const { versionId } = await context.params;
    const client = createUserScopedClient(session.accessToken);
    const data = await publishService.publishCourseVersion(client, versionId);
    return NextResponse.json({ data, error: null });
  } catch (e) {
    return NextResponse.json({ data: null, error: (e as Error).message }, { status: 400 });
  }
}
