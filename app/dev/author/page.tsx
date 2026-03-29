'use client';

import Link from 'next/link';
import { useState } from 'react';

type SetupData = {
  orgId: string;
  admin: { userId: string; email: string; accessToken: string | null };
  learner: { userId: string; email: string; accessToken: string | null };
};

type SeedResponse = {
  seeded: boolean;
  courseId?: string;
  courseVersionId?: string;
  reason?: string;
};

export default function AuthorDevPage() {
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [seed, setSeed] = useState<SeedResponse | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const adminToken = setup?.admin?.accessToken;

  const authHeaders = (token?: string | null): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const devSetup = async () => {
    setMessage('Setting up dev environment...');
    const res = await fetch('/api/dev/setup', { method: 'POST' });
    const json = await res.json();
    if (json.data) {
      setSetup(json.data);
      if (json.data.admin?.accessToken) {
        sessionStorage.setItem('dev_admin_token', json.data.admin.accessToken);
      }
      if (json.data.learner?.accessToken) {
        sessionStorage.setItem('dev_learner_token', json.data.learner.accessToken);
      }
    }
    setMessage(JSON.stringify(json, null, 2));
  };

  const seedData = async () => {
    if (!adminToken) return;
    setMessage('Seeding...');
    const res = await fetch('/api/dev/seed', {
      method: 'POST',
      headers: authHeaders(adminToken),
    });
    const json = await res.json();
    if (json.data) setSeed(json.data);
    setMessage(JSON.stringify(json, null, 2));
  };

  const submitReview = async () => {
    if (!seed?.courseVersionId || !adminToken) return;
    setMessage('Submitting review...');
    const res = await fetch(
      `/api/course-versions/${seed.courseVersionId}/review`,
      { method: 'POST', headers: authHeaders(adminToken) },
    );
    const json = await res.json();
    if (json.data?.id) setReviewId(json.data.id);
    setMessage(JSON.stringify(json, null, 2));
  };

  const approve = async () => {
    if (!reviewId || !adminToken) return;
    setMessage('Approving...');
    const res = await fetch(`/api/review-cycles/${reviewId}/approve`, {
      method: 'POST',
      headers: authHeaders(adminToken),
    });
    setMessage(JSON.stringify(await res.json(), null, 2));
  };

  const publish = async () => {
    if (!seed?.courseVersionId || !adminToken) return;
    setMessage('Publishing...');
    const res = await fetch(
      `/api/course-versions/${seed.courseVersionId}/publish`,
      { method: 'POST', headers: authHeaders(adminToken) },
    );
    setMessage(JSON.stringify(await res.json(), null, 2));
  };

  return (
    <main className="mx-auto max-w-4xl p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Author Flow Dev Page</h1>
      <p className="text-sm text-slate-600">
        Setup dev users, Seed draft, Submit review, Approve, Publish.
      </p>

      <div className="flex gap-2 flex-wrap">
        <button className="rounded bg-amber-700 text-white px-3 py-1" onClick={devSetup}>
          0) Dev Setup
        </button>
        <button className="rounded bg-slate-800 text-white px-3 py-1 disabled:opacity-40" onClick={seedData} disabled={!adminToken}>
          1) Seed Example Course
        </button>
        <button className="rounded bg-blue-700 text-white px-3 py-1 disabled:opacity-40" onClick={submitReview} disabled={!seed?.courseVersionId}>
          2) Submit Review
        </button>
        <button className="rounded bg-indigo-700 text-white px-3 py-1 disabled:opacity-40" onClick={approve} disabled={!reviewId}>
          3) Approve
        </button>
        <button className="rounded bg-emerald-700 text-white px-3 py-1 disabled:opacity-40" onClick={publish} disabled={!seed?.courseVersionId}>
          4) Publish
        </button>
      </div>

      {setup && (
        <p className="text-sm text-green-700">
          Logged in as: {setup.admin.email} (admin) | Token: {adminToken ? 'present' : 'missing'}
        </p>
      )}

      {seed?.courseId && (
        <Link className="text-blue-700 underline" href={`/dev/learn/${seed.courseId}`}>
          Open Learner Runtime
        </Link>
      )}

      <pre className="rounded border bg-white p-3 text-xs overflow-auto max-h-96">
        {message || 'Click "0) Dev Setup" first to create test users and sign in.'}
      </pre>
    </main>
  );
}
