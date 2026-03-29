import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/services/reviewService';

export async function POST(_: NextRequest, context: { params: Promise<{ reviewId: string }> }) {
  try {
    const { reviewId } = await context.params;
    const review = reviewService.approveReview(reviewId);
    return NextResponse.json({ data: review, error: null });
  } catch (e) {
    return NextResponse.json({ data: null, error: (e as Error).message }, { status: 400 });
  }
}
