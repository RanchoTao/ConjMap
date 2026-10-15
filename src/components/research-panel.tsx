'use client';
import { useCallback, useEffect, useState } from 'react';
import { FlaskConical, RefreshCw } from 'lucide-react';
import type { ResearchTask } from '@/lib/research-contract';
import { Badge } from './status';
async function request(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'Request failed');
  return data;
}
export function ResearchPanel({ problemId }: { problemId: string }) {
  const [tasks, setTasks] = useState<ResearchTask[]>([]),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [objective, setObjective] = useState('Test the local research task contract.');
  const load = useCallback(async () => {
    const data = await request(
      `/api/v1/research-tasks?problem_id=${encodeURIComponent(problemId)}`,
    );
    setTasks(data.tasks);
  }, [problemId]);
  useEffect(() => {
    let active = true;
    request(`/api/v1/research-tasks?problem_id=${encodeURIComponent(problemId)}`)
      .then((data) => {
        if (active) setTasks(data.tasks);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [problemId]);
  async function act(action: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    try {
      await action();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="research-panel">
      <div className="mock-banner">
        <FlaskConical size={18} />
        <strong>MOCK ADAPTER</strong>
        <span>Local demonstration · No research engine connected</span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void act(() =>
            request('/api/v1/research-tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                api_version: 'v1',
                engine: 'mock-mathforge',
                problem_id: problemId,
                objective,
              }),
            }),
          );
        }}
      >
        <label htmlFor="objective">Research request objective</label>
        <textarea
          id="objective"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          minLength={5}
          maxLength={2000}
          required
          rows={2}
        />
        <div className="research-actions">
          <button className="button secondary" disabled={busy} type="submit">
            Create mock request
          </button>
          <button
            type="button"
            aria-label="Refresh research tasks"
            className="icon-button"
            disabled={busy}
            onClick={() => void act(load)}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </form>
      {error ? (
        <p role="alert" className="error-message">
          {error}
        </p>
      ) : null}
      <div className="research-tasks" aria-live="polite">
        {!tasks.length ? (
          <p className="muted small">No local mock requests yet.</p>
        ) : (
          tasks.map((task) => (
            <article className="task-record" key={task.id}>
              <div className="task-head">
                <Badge tone="amber">MOCK · {task.status}</Badge>
                <time>{new Date(task.created_at).toISOString().slice(0, 19)} UTC</time>
              </div>
              <p>{task.objective}</p>
              <code>{task.id}</code>
              {task.status === 'queued' ? (
                <button
                  className="simulate-button"
                  disabled={busy}
                  onClick={() =>
                    void act(() =>
                      request(`/api/v1/research-tasks/${task.id}/simulate`, { method: 'POST' }),
                    )
                  }
                >
                  Simulate result (mock)
                </button>
              ) : (
                task.attempts.map((a, i) => (
                  <div className="attempt" key={i}>
                    <strong>
                      {a.kind === 'failed_route' ? 'Failed route' : 'Candidate proof'} · MOCK
                    </strong>
                    <Badge tone="amber">{a.verification_status}</Badge>
                    <p>{a.result}</p>
                    <details>
                      <summary>Method & hypothesis</summary>
                      <p>{a.hypothesis}</p>
                      <p>{a.method}</p>
                    </details>
                    {a.artifact_urls.length ? (
                      <ul>
                        {a.artifact_urls.map((url) => (
                          <li key={url}>
                            <a href={url} target="_blank" rel="noreferrer">
                              Evidence artifact (unverified)
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <small>No evidence artifacts. No mathematical verification.</small>
                    )}
                  </div>
                ))
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
