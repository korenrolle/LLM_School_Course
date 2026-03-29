import { NextRequest, NextResponse } from 'next/server';
import { requireRole, requireSession } from '@/lib/auth';
import { createUserScopedClient } from '@/lib/supabase';
import { seedService } from '@/lib/services/seedService';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    requireRole(session.role, ['admin', 'author']);
    const client = createUserScopedClient(session.accessToken);
    const result = await seedService.seedExampleData(client, session.orgId, session.userId);
    return NextResponse.json({ data: result, error: null });
  } catch (e) {
    return NextResponse.json({ data: null, error: (e as Error).message }, { status: 401 });
  }
}
