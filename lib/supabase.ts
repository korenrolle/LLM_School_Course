import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireEnv(value: string | undefined, key: string) {
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export function createAnonClient(): SupabaseClient {
  return createClient(
    requireEnv(url, 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv(anonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  );
}

export function createServiceClient(): SupabaseClient {
  return createClient(
    requireEnv(url, 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv(serviceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export function createUserScopedClient(accessToken: string): SupabaseClient {
  return createClient(
    requireEnv(url, 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv(anonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } },
  );
}
