'use client';
import { useRef, useState } from 'react';
import type { RealTask } from '@/lib/real-research';
export function RealResearchPanel({ problemId }: { problemId: string }) {
  const [tasks, setTasks] = useState<RealTask[]>([]),
    [token, setToken] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  // Retain the same key after a timeout. A new objective requires a new explicit request.
  const key = useRef<string | null>(null);
  async function call(url: string, init?: RequestInit) {
    const response = await fetch(url, {
      ...init,
      cache: 'no-store',
      headers: { ...init?.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? 'Request failed');
    return data;
  }
  async function load() {
    const data = await call(`/api/v2/research-tasks?problem_id=${encodeURIComponent(problemId)}`);
    setTasks(data.tasks);
  }
  async function act(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    key.current ??= crypto.randomUUID();
    await call('/api/v2/research-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key.current },
      body: JSON.stringify({
        problem_id: problemId,
        objective:
          'Request a source-bound literature and finite feasibility audit, without a proof or solved-status claim.',
        budget: { wall_seconds: 30, max_tasks: 1, network: false },
      }),
    });
    await load();
  }
  return (
    <section className="paper-panel">
      <div className="eyebrow">REAL MATHFORGE · SEPARATE FROM MOCK</div>
      <h2>Source-bound research request</h2>
      <p className="muted small">
        The inspected MathForge controller has no compatible generic task API. With default
        configuration, requests are recorded as blocked and no research runs. A configured adapter
        requires authentication; engine completion still leaves every mathematical claim unverified.
      </p>
      <label className="research-access">
        Local research access token (only if configured; kept in this page’s memory)
        <input
          type="password"
          autoComplete="off"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </label>
      <div className="research-actions">
        <button className="button secondary" disabled={busy} onClick={() => void act(submit)}>
          Request real MathForge audit
        </button>
        <button className="button secondary" disabled={busy} onClick={() => void act(load)}>
          Load real request history
        </button>
      </div>
      {error ? <p role="alert">{error}</p> : null}
      <div aria-live="polite">
        {tasks.map((task) => (
          <article className="task-record" key={task.id}>
            <strong>REAL ADAPTER · {task.status.toUpperCase()}</strong>
            <p>{task.blocker}</p>
            <code>{task.id}</code>
            <p className="muted small">
              Engine task ID: {task.engine_task_id ?? 'Not issued'} · Actual runs:{' '}
              {task.engine_task_id ? 'Inspect engine evidence' : '0'}
            </p>
            {task.engine_task_id && !['completed', 'failed', 'blocked'].includes(task.status) ? (
              <button
                disabled={busy}
                onClick={() =>
                  void act(async () => {
                    await call(`/api/v2/research-tasks/${task.id}/poll`, { method: 'POST' });
                    await load();
                  })
                }
              >
                Query engine status
              </button>
            ) : null}
            <details>
              <summary>Request & audit timeline</summary>
              <p>
                {task.input.objective} · budget {task.input.budget.wall_seconds}s · network disabled
              </p>
              <ol>
                {task.events.map((event, index) => (
                  <li key={index}>
                    <time>{event.at}</time> · {event.kind}
                    <br />
                    <code>{event.digest}</code>
                  </li>
                ))}
              </ol>
            </details>
            {task.attempts.map((attempt, index) => (
              <div key={index}>
                <h3>{attempt.kind} · UNVERIFIED</h3>
                <p>{attempt.result}</p>
                {attempt.artifact_urls.map((url) => (
                  <p key={url}>
                    <a className="text-link" href={url} target="_blank" rel="noreferrer">
                      External artifact ↗
                    </a>
                  </p>
                ))}
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
