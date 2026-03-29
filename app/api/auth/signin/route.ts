import { NextRequest, NextResponse } from 'next/server';
import { createAnonClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const anon = createAnonClient();
  const { data, error } = await anon.auth.signInWithPassword({ email: body.email, password: body.password });
  if (error || !data.session) return NextResponse.json({ data: null, error: error?.message ?? 'signin_failed' }, { status: 400 });
  return NextResponse.json({ data: { accessToken: data.session.access_token, refreshToken: data.session.refresh_token, user: data.user }, error: null });
}
