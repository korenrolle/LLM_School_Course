import { NextRequest } from 'next/server';
import { createAnonClient, createServiceClient, createUserScopedClient } from '@/lib/supabase';

export type AppRole = 'admin' | 'author' | 'reviewer' | 'learner';

export interface SessionContext {
  accessToken: string;
  userId: string;
  orgId: string;
  role: AppRole;
}

export async function requireSession(req: NextRequest): Promise<SessionContext> {
  const auth = req.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw new Error('Unauthorized: missing bearer token');

  const anon = createAnonClient();
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) throw new Error('Unauthorized: invalid session');

  const userScoped = createUserScopedClient(token);
  const { data: profile, error: profileError } = await userScoped
    .from('user_profile')
    .select('org_id, role')
    .eq('user_id', data.user.id)
    .single();

  if (profileError || !profile) throw new Error('Forbidden: user profile not provisioned');

  return {
    accessToken: token,
    userId: data.user.id,
    orgId: profile.org_id as string,
    role: profile.role as AppRole,
  };
}

export function requireRole(role: AppRole, allowed: AppRole[]) {
  if (!allowed.includes(role)) {
    throw new Error(`Forbidden: requires one of roles [${allowed.join(', ')}]`);
  }
}

export async function createTestUser(email: string, password: string, role: AppRole, orgId: string) {
  const admin = createServiceClient();
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  const user = data.user;
  if (!user) throw new Error('Failed to create user');

  const { error: upsertError } = await admin.from('user_profile').upsert({
    user_id: user.id,
    org_id: orgId,
    role,
  });
  if (upsertError) throw upsertError;
  return user;
}
