import { NextRequest, NextResponse } from 'next/server';
import { createUserScopedClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  const client = createUserScopedClient(token);
  const { error } = await client.auth.signOut();
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 400 });
  return NextResponse.json({ data: { ok: true }, error: null });
}
