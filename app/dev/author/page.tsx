'use client';

import Link from 'next/link';
import { useState } from 'react';

type SeedResponse = { seeded: boolean; courseId?: string; courseVersionId?: string; reason?: string };

export default function AuthorDevPage() {
  const [seed, setSeed] = useState<SeedResponse | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const seedData = async () => {
    const res = await fetch('/api/dev/seed', { method: 'POST' });
    const json = await res.json();
    setSeed(json.data);
    setMessage(JSON.stringify(json.data));
  };

  const submitReview = async () => {
    if (!seed?.courseVersionId) return;
    const res = await fetch(`/api/course-versions/${seed.courseVersionId}/review`, { method: 'POST' });
    const json = await res.json();
    if (json.data?.id) setReviewId(json.data.id);
    setMessage(JSON.stringify(json));
  };

  const approve = async () => {
    if (!reviewId) return;
    const res = await fetch(`/api/review-cycles/${reviewId}/approve`, { method: 'POST' });
    setMessage(JSON.stringify(await res.json()));
  };

  const publish = async () => {
    if (!seed?.courseVersionId) return;
    const res = await fetch(`/api/course-versions/${seed.courseVersionId}/publish`, { method: 'POST' });
    const json = await res.json();
    setMessage(JSON.stringify(json));
  };

  return (
    <main className="mx-auto max-w-4xl p-8 space-y-3">
      <h1 className="text-2xl font-semibold">Author Flow Dev Page</h1>
      <p className="text-sm text-slate-600">Seed draft → submit review → approve → publish.</p>
      <div className="flex gap-2 flex-wrap">
        <button className="rounded bg-slate-800 text-white px-3 py-1" onClick={seedData}>1) Seed Example Course</button>
        <button className="rounded bg-blue-700 text-white px-3 py-1" onClick={submitReview}>2) Submit Review</button>
        <button className="rounded bg-indigo-700 text-white px-3 py-1" onClick={approve}>3) Approve</button>
        <button className="rounded bg-emerald-700 text-white px-3 py-1" onClick={publish}>4) Publish</button>
      </div>

      {seed?.courseId ? (
        <Link className="text-blue-700 underline" href={`/dev/learn/${seed.courseId}`}>
          Open Learner Runtime
        </Link>
      ) : null}

      <pre className="rounded border bg-white p-3 text-xs overflow-auto">{message || 'No actions yet'}</pre>
    </main>
  );
}
