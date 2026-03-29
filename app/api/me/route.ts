import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    return NextResponse.json({ data: session, error: null });
  } catch (e) {
    return NextResponse.json({ data: null, error: (e as Error).message }, { status: 401 });
  }
}
