import { NextRequest, NextResponse } from 'next/server';
import { requireRole, requireSession } from '@/lib/auth';
import { createUserScopedClient } from '@/lib/supabase';
import { reviewService } from '@/lib/services/reviewService';

export async function POST(req: NextRequest, context: { params: Promise<{ versionId: string }> }) {
  try {
    const session = await requireSession(req);
    requireRole(session.role, ['admin', 'author']);
    const { versionId } = await context.params;
    const client = createUserScopedClient(session.accessToken);
    const review = await reviewService.submitForReview(client, versionId);
    return NextResponse.json({ data: review, error: null });
  } catch (e) {
    return NextResponse.json({ data: null, error: (e as Error).message }, { status: 400 });
  }
}
