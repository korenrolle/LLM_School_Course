'use client';

import { useEffect, useMemo, useState } from 'react';
import { LessonNodeRenderer } from '@/components/LessonNodeRenderer';
import type { RuntimeLesson, RuntimeNode } from '@/types/domain';

type RuntimeResponse = {
  runtimePackage: { id: string };
  lessons: Array<RuntimeLesson & { nodes: RuntimeNode[] }>;
};

export default function LearnerRuntimePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const [courseId, setCourseId] = useState<string>('');
  const [runtime, setRuntime] = useState<RuntimeResponse | null>(null);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return (
      sessionStorage.getItem('dev_learner_token') ||
      sessionStorage.getItem('dev_admin_token')
    );
  };

  const authHeaders = (): HeadersInit => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

  useEffect(() => {
    if (!courseId) return;
    const token = getToken();
    fetch(`/api/courses/${courseId}/runtime`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(async (r) => {
      const json = await r.json();
      if (json.data) {
        setRuntime(json.data);
        setMessage('Runtime loaded. Click Start Lesson to begin.');
      } else {
        setMessage(json.error || 'No runtime package found. Publish first.');
      }
    });
  }, [courseId]);

  const currentLesson = useMemo(
    () => runtime?.lessons[lessonIndex] ?? null,
    [runtime, lessonIndex],
  );

  const startLesson = async () => {
    if (!courseId || !currentLesson) return;
    setMessage('Starting lesson...');
    const res = await fetch('/api/lesson-attempts', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ courseId, runtimeLessonId: currentLesson.id }),
    });
    const json = await res.json();
    if (json.data) {
      setEnrollmentId(json.data.enrollment.id);
      setAttemptId(json.data.attempt.id);
      setMessage('Lesson started! Interact with nodes below.');
    } else {
      setMessage(JSON.stringify(json));
    }
  };

  const emitEvent = async (eventName: string, payload: Record<string, unknown> = {}) => {
    if (!enrollmentId || !currentLesson) return;
    await fetch('/api/events', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ eventName, enrollmentId, runtimeLessonId: currentLesson.id, payload }),
    });
  };

  const completeLesson = async () => {
    if (!runtime || !enrollmentId || !currentLesson) return;
    setMessage('Completing lesson...');
    const percent = Number((((lessonIndex + 1) / runtime.lessons.length) * 100).toFixed(2));
    const progressRes = await fetch('/api/progress', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        enrollmentId,
        runtimePackageId: runtime.runtimePackage.id,
        percentComplete: percent,
        lastLessonId: currentLesson.id,
      }),
    });
    const progressJson = await progressRes.json();
    await emitEvent('lesson_completed', { attemptId, percent });
    if (lessonIndex < runtime.lessons.length - 1) {
      setLessonIndex((p) => p + 1);
      setAttemptId(null);
      setMessage('Lesson complete! Progress: ' + percent + '%. Moving to next lesson.');
    } else {
      setMessage('All lessons complete! Progress: ' + percent + '%. Data: ' + JSON.stringify(progressJson));
    }
  };

  if (!getToken()) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-semibold mb-2">No auth token found</h1>
        <p>Go to <a className="text-blue-700 underline" href="/dev/author">/dev/author</a> and click Dev Setup first.</p>
      </main>
    );
  }

  if (!runtime) return <main className="p-8"><p>{message || 'Loading runtime...'}</p></main>;
  if (!currentLesson) return <main className="p-8"><p>Lesson not found.</p></main>;

  return (
    <main className="mx-auto max-w-4xl p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Learner Runtime: {currentLesson.title}</h1>
      <p className="text-sm text-slate-500">Lesson {lessonIndex + 1} of {runtime.lessons.length}</p>
      <button className="rounded bg-slate-900 text-white px-3 py-1" onClick={startLesson}>Start Lesson</button>
      <div className="space-y-3">
        {currentLesson.nodes.map((node) => (
          <div key={node.id} className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-slate-500">{node.nodeType}</p>
            <LessonNodeRenderer
              node={node}
              onEvent={(eventName, payload) => {
                emitEvent('node_viewed', { nodeId: node.id });
                void emitEvent(eventName, { nodeId: node.id, ...payload });
              }}
            />
          </div>
        ))}
      </div>
      <button className="rounded bg-emerald-700 text-white px-3 py-1" onClick={completeLesson}>Complete Lesson + Next</button>
      <pre className="rounded border bg-white p-3 text-xs overflow-auto max-h-48">{message}</pre>
    </main>
  );
}
