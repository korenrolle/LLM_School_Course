import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { createUserScopedClient } from '@/lib/supabase';
import { learningRepository } from '@/lib/repositories/learningRepository';
import type { AnalyticsEvent } from '@/types/domain';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    const client = createUserScopedClient(session.accessToken);
    const body = (await req.json()) as AnalyticsEvent;
    await learningRepository.logEvent(client, body);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (e) {
    return NextResponse.json({ data: null, error: (e as Error).message }, { status: 401 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    const client = createUserScopedClient(session.accessToken);
    const data = await learningRepository.getEvents(client);
    return NextResponse.json({ data, error: null });
  } catch (e) {
    return NextResponse.json({ data: null, error: (e as Error).message }, { status: 401 });
  }
}
