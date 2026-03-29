import { NextRequest, NextResponse } from 'next/server';
import { learningRepository } from '@/lib/repositories/learningRepository';
import type { AnalyticsEvent } from '@/types/domain';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as AnalyticsEvent;
  learningRepository.logEvent(body);
  return NextResponse.json({ data: { ok: true }, error: null });
}

export async function GET() {
  return NextResponse.json({ data: learningRepository.getEvents(), error: null });
}
