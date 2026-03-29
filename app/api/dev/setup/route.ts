import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

const DEV_ORG_ID = '00000000-0000-0000-0000-000000000001';
const DEV_ADMIN_EMAIL = 'dev-admin@lxp.local';
const DEV_ADMIN_PASSWORD = 'dev-admin-pass-2026!';
const DEV_LEARNER_EMAIL = 'dev-learner@lxp.local';
const DEV_LEARNER_PASSWORD = 'dev-learner-pass-2026!';

export async function POST() {
    try {
          const svc = createServiceClient();

          // 1. Ensure organization exists
          const { data: existingOrg } = await svc
            .from('organization')
            .select('id')
            .eq('id', DEV_ORG_ID)
            .maybeSingle();

          if (!existingOrg) {
                  const { error: orgErr } = await svc.from('organization').insert({
                            id: DEV_ORG_ID,
                            name: 'Dev Org',
                            slug: 'dev-org',
                          });
                  if (orgErr) throw orgErr;
                }

          // 2. Ensure admin user exists
          const admin = await ensureUser(svc, DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD, 'admin', DEV_ORG_ID);

          // 3. Ensure learner user exists
          const learner = await ensureUser(svc, DEV_LEARNER_EMAIL, DEV_LEARNER_PASSWORD, 'learner', DEV_ORG_ID);

          // 4. Sign in admin to get access token
          const { data: signIn, error: signInErr } = await svc.auth.signInWithPassword({
                  email: DEV_ADMIN_EMAIL,
                  password: DEV_ADMIN_PASSWORD,
                });
          if (signInErr) throw signInErr;

          // 5. Sign in learner
          const { data: learnerSignIn, error: learnerSignInErr } = await svc.auth.signInWithPassword({
                  email: DEV_LEARNER_EMAIL,
                  password: DEV_LEARNER_PASSWORD,
                });
          if (learnerSignInErr) throw learnerSignInErr;

          return NextResponse.json({
                  data: {
                            orgId: DEV_ORG_ID,
                            admin: {
                                        userId: admin.id,
                                        email: DEV_ADMIN_EMAIL,
                                        accessToken: signIn.session?.access_token ?? null,
                                      },
                            learner: {
                                        userId: learner.id,
                                        email: DEV_LEARNER_EMAIL,
                                        accessToken: learnerSignIn.session?.access_token ?? null,
                                      },
                          },
                  error: null,
                });
        } catch (e) {
          return NextResponse.json(
                  { data: null, error: (e as Error).message },
                  { status: 500 },
                );
        }
  }

async function ensureUser(
    svc: ReturnType<typeof createServiceClient>,
    email: string,
    password: string,
    role: string,
    orgId: string,
  ) {
    // Check if user exists
    const { data: list } = await svc.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === email);

    if (existing) {
          // Ensure profile exists
          await svc.from('user_profile').upsert({
                  user_id: existing.id,
                  org_id: orgId,
                  role,
                });
          return existing;
        }

    // Create new user
    const { data, error } = await svc.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
    if (error) throw error;
    if (!data.user) throw new Error('User creation failed');

    // Create profile
    const { error: profileErr } = await svc.from('user_profile').upsert({
          user_id: data.user.id,
          org_id: orgId,
          role,
        });
    if (profileErr) throw profileErr;

    return data.user;
  }
