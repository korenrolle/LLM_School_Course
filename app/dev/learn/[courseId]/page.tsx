'use client';

import { useEffect, useMemo, useState } from 'react';
import { LessonNodeRenderer } from '@/components/LessonNodeRenderer';
import type { RuntimeLesson, RuntimeNode } from '@/types/domain';

type RuntimeResponse = { runtimePackage: { id: string }; lessons: Array<RuntimeLesson & { nodes: RuntimeNode[] }> };

export default function LearnerRuntimePage({ params }: { params: Promise<{ courseId: string }> }) {
  const [courseId, setCourseId] = useState<string>('');
  const [runtime, setRuntime] = useState<RuntimeResponse | null>(null);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/courses/${courseId}/runtime`).then(async (r) => {
      const json = await r.json();
      if (json.data) setRuntime(json.data);
    });
  }, [courseId]);

  const currentLesson = useMemo(() => runtime?.lessons[lessonIndex] ?? null, [runtime, lessonIndex]);

  const startLesson = async () => {
    if (!courseId || !currentLesson) return;
    const res = await fetch('/api/lesson-attempts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ courseId, learnerId: 'dev-learner', runtimeLessonId: currentLesson.id }),
    });
    const json = await res.json();
    setEnrollmentId(json.data.enrollment.id);
    setAttemptId(json.data.attempt.id);
  };

  const emitEvent = async (eventName: string, payload: Record<string, unknown> = {}) => {
    if (!enrollmentId || !currentLesson) return;
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventName, enrollmentId, runtimeLessonId: currentLesson.id, payload }),
    });
  };

  const completeLesson = async () => {
    if (!runtime || !enrollmentId || !currentLesson) return;
    const percent = Number((((lessonIndex + 1) / runtime.lessons.length) * 100).toFixed(2));
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ enrollmentId, runtimePackageId: runtime.runtimePackage.id, percentComplete: percent, lastLessonId: currentLesson.id }),
    });
    await emitEvent('lesson_completed', { attemptId, percent });
    if (lessonIndex < runtime.lessons.length - 1) setLessonIndex((p) => p + 1);
  };

  if (!runtime) return <main className="p-8">No runtime package found. Publish first.</main>;
  if (!currentLesson) return <main className="p-8">Lesson not found.</main>;

  return (
    <main className="mx-auto max-w-4xl p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Learner Runtime: {currentLesson.title}</h1>
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
    </main>
  );
}
