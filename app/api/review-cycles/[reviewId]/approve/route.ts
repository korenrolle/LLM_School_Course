import { NextRequest, NextResponse } from 'next/server';
import { requireRole, requireSession } from '@/lib/auth';
import { createUserScopedClient } from '@/lib/supabase';
import { reviewService } from '@/lib/services/reviewService';

export async function POST(req: NextRequest, context: { params: Promise<{ reviewId: string }> }) {
  try {
    const session = await requireSession(req);
    requireRole(session.role, ['admin', 'reviewer']);
    const { reviewId } = await context.params;
    const client = createUserScopedClient(session.accessToken);
    const review = await reviewService.approveReview(client, reviewId);
    return NextResponse.json({ data: review, error: null });
  } catch (e) {
    return NextResponse.json({ data: null, error: (e as Error).message }, { status: 400 });
  }
}
