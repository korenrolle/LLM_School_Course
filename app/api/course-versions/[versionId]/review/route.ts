import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/services/reviewService';

export async function POST(_: NextRequest, context: { params: Promise<{ versionId: string }> }) {
  try {
    const { versionId } = await context.params;
    const review = reviewService.submitForReview(versionId);
    return NextResponse.json({ data: review, error: null });
  } catch (e) {
    return NextResponse.json({ data: null, error: (e as Error).message }, { status: 400 });
  }
}
