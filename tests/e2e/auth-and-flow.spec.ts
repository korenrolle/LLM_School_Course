import { test, expect, request } from '@playwright/test';

const ORG_ID = process.env.E2E_ORG_ID ?? '11111111-1111-1111-1111-111111111111';

async function signUpAndSignIn(api: Awaited<ReturnType<typeof request.newContext>>, email: string, role: string) {
  const password = 'Passw0rd!123';
  await api.post('/api/auth/signup', { data: { email, password, role, orgId: ORG_ID } });
  const signIn = await api.post('/api/auth/signin', { data: { email, password } });
  expect(signIn.ok()).toBeTruthy();
  const body = await signIn.json();
  return body.data.accessToken as string;
}

test('full role-based lifecycle and learner progress', async ({ playwright }) => {
  const api = await request.newContext({ baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000' });

  const adminToken = await signUpAndSignIn(api, `admin+${Date.now()}@test.local`, 'admin');
  const authorToken = await signUpAndSignIn(api, `author+${Date.now()}@test.local`, 'author');
  const reviewerToken = await signUpAndSignIn(api, `reviewer+${Date.now()}@test.local`, 'reviewer');
  const learnerToken = await signUpAndSignIn(api, `learner+${Date.now()}@test.local`, 'learner');

  const meUnauthorized = await api.get('/api/me');
  expect(meUnauthorized.status()).toBe(401);

  const seeded = await api.post('/api/dev/seed', { headers: { authorization: `Bearer ${authorToken}` } });
  expect(seeded.ok()).toBeTruthy();
  const seedData = (await seeded.json()).data;

  const submit = await api.post(`/api/course-versions/${seedData.courseVersionId}/review`, { headers: { authorization: `Bearer ${authorToken}` } });
  expect(submit.ok()).toBeTruthy();
  const reviewId = (await submit.json()).data.id;

  const denyApprove = await api.post(`/api/review-cycles/${reviewId}/approve`, { headers: { authorization: `Bearer ${learnerToken}` } });
  expect(denyApprove.status()).toBeGreaterThanOrEqual(400);

  const approve = await api.post(`/api/review-cycles/${reviewId}/approve`, { headers: { authorization: `Bearer ${reviewerToken}` } });
  expect(approve.ok()).toBeTruthy();

  const publish = await api.post(`/api/course-versions/${seedData.courseVersionId}/publish`, { headers: { authorization: `Bearer ${adminToken}` } });
  expect(publish.ok()).toBeTruthy();

  const runtime = await api.get(`/api/courses/${seedData.courseId}/runtime`, { headers: { authorization: `Bearer ${learnerToken}` } });
  expect(runtime.ok()).toBeTruthy();
  const runtimeData = (await runtime.json()).data;

  const attempt = await api.post('/api/lesson-attempts', {
    headers: { authorization: `Bearer ${learnerToken}` },
    data: { courseId: seedData.courseId, runtimeLessonId: runtimeData.lessons[0].id },
  });
  expect(attempt.ok()).toBeTruthy();
  const attemptData = (await attempt.json()).data;

  const progress = await api.post('/api/progress', {
    headers: { authorization: `Bearer ${learnerToken}` },
    data: { enrollmentId: attemptData.enrollment.id, runtimePackageId: runtimeData.runtimePackage.id, percentComplete: 50, lastLessonId: runtimeData.lessons[0].id },
  });
  expect(progress.ok()).toBeTruthy();

  const signout = await api.post('/api/auth/signout', { headers: { authorization: `Bearer ${learnerToken}` } });
  expect(signout.ok()).toBeTruthy();
});
