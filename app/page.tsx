import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl p-8 space-y-4">
      <h1 className="text-3xl font-semibold">Phase 1 Vertical Slice</h1>
      <p>Use the dev pages to test authoring → review → publish → learner runtime.</p>
      <ul className="list-disc pl-6">
        <li><Link className="text-blue-700 underline" href="/dev/author">Author workflow</Link></li>
      </ul>
    </main>
  );
}
