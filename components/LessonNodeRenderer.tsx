'use client';

import { useState } from 'react';
import type { RuntimeNode } from '@/types/domain';

export function LessonNodeRenderer({ node, onEvent }: { node: RuntimeNode; onEvent: (event: string, payload?: Record<string, unknown>) => void }) {
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [reflection, setReflection] = useState('');

  if (node.nodeType === 'reading') {
    const cfg = node.render as { markdown: string };
    return <article className="rounded border p-4"><pre className="whitespace-pre-wrap">{cfg.markdown}</pre></article>;
  }

  if (node.nodeType === 'video') {
    const cfg = node.render as { videoUrl: string; durationSec: number };
    return (
      <article className="rounded border p-4 space-y-2">
        <p className="text-sm text-slate-500">Video placeholder ({cfg.durationSec}s)</p>
        <a className="text-blue-700 underline" href={cfg.videoUrl} target="_blank">Open video URL</a>
      </article>
    );
  }

  if (node.nodeType === 'quiz') {
    const cfg = node.render as { questions: Array<{ key: string; prompt: string; choices: string[]; answerIndex: number }>; passScore: number };
    const q = cfg.questions[0];
    return (
      <article className="rounded border p-4 space-y-3">
        <p className="font-medium">{q.prompt}</p>
        {q.choices.map((c, idx) => (
          <label className="block" key={c}>
            <input type="radio" name={q.key} className="mr-2" onChange={() => setQuizChoice(idx)} />
            {c}
          </label>
        ))}
        <button
          className="rounded bg-blue-600 px-3 py-1 text-white"
          onClick={() => onEvent('quiz_submitted', { questionKey: q.key, selected: quizChoice, correct: quizChoice === q.answerIndex })}
        >
          Submit Quiz
        </button>
      </article>
    );
  }

  if (node.nodeType === 'reflection') {
    const cfg = node.render as { prompt: string; minChars: number };
    return (
      <article className="rounded border p-4 space-y-2">
        <p>{cfg.prompt}</p>
        <textarea className="w-full rounded border p-2" value={reflection} onChange={(e) => setReflection(e.target.value)} />
        <button
          className="rounded bg-indigo-600 px-3 py-1 text-white"
          onClick={() => onEvent('reflection_submitted', { chars: reflection.length, meetsMin: reflection.length >= cfg.minChars })}
        >
          Submit Reflection
        </button>
      </article>
    );
  }

  const cfg = node.render as { label: string; url: string };
  return (
    <article className="rounded border p-4">
      <a className="text-blue-700 underline" href={cfg.url} target="_blank">Download: {cfg.label}</a>
    </article>
  );
}
