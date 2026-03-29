import { NextRequest, NextResponse } from 'next/server';
import { createAnonClient, createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const anon = createAnonClient();
  const { data, error } = await anon.auth.signUp({ email: body.email, password: body.password });
  if (error || !data.user) return NextResponse.json({ data: null, error: error?.message ?? 'signup_failed' }, { status: 400 });

  const role = (body.role ?? 'learner') as 'admin' | 'author' | 'reviewer' | 'learner';
  const orgId = body.orgId as string;
  const admin = createServiceClient();
  const { error: profileError } = await admin.from('user_profile').upsert({ user_id: data.user.id, org_id: orgId, role });
  if (profileError) return NextResponse.json({ data: null, error: profileError.message }, { status: 400 });

  return NextResponse.json({ data: { userId: data.user.id }, error: null });
}
