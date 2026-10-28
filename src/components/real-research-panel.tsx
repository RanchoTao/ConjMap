'use client';
import { useRef, useState } from 'react';
import type { RealTask } from '@/lib/real-research';
import { useLanguage } from './i18n';
export function RealResearchPanel({ problemId }: { problemId: string }) {
  const { language } = useLanguage();
  const text = (en: string, zh: string) => (language === 'zh' ? zh : en);
  const [tasks, setTasks] = useState<RealTask[]>([]),
    [token, setToken] = useState(''),
    [artifactText, setArtifactText] = useState<Record<string, string>>({}),
    [admission, setAdmission] = useState(
      problemId === 'cm-000118' ? 'cm-v04-union-closed-fin2-v1' : '',
    ),
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
        ...(admission ? { admission_id: admission } : {}),
        objective:
          'Request the admitted source-bound finite calibration only; preserve hypotheses, no network, no solved-status claim.',
        budget: { wall_seconds: 30, max_tasks: 1, network: false },
      }),
    });
    await load();
  }
  async function inspectArtifact(taskId: string, name: string) {
    const response = await fetch(
      `/api/v2/research-tasks/${taskId}/artifacts/${encodeURIComponent(name)}`,
      {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    if (!response.ok) {
      const failure = await response.json();
      throw new Error(failure.error ?? 'Evidence retrieval failed');
    }
    const raw = await response.text();
    setArtifactText((current) => ({ ...current, [`${taskId}:${name}`]: raw.slice(0, 12000) }));
    await load();
  }
  return (
    <section className="paper-panel">
      <div className="eyebrow">REAL MATHFORGE · SEPARATE FROM MOCK</div>
      <h2>{text('Source-bound research request', '绑定来源的研究请求')}</h2>
      <p className="muted small">
        {text(
          'Only an authenticated MathForge gateway may admit and execute work. Without configuration, requests remain blocked. Signed execution receipts establish process provenance; mathematical claims remain unverified.',
          '只有通过认证的 MathForge 网关可以准入和执行任务。未配置时请求保持阻塞。签名回执记录执行来源；数学结论仍未经核验。',
        )}
      </p>
      <label className="research-access">
        {text(
          'Local research access token (only if configured; kept in this page’s memory)',
          '本地研究访问令牌（仅配置后使用，只保留在当前页面内存）',
        )}
        <input
          type="password"
          autoComplete="off"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </label>
      <label>
        {text(
          'Engine admission ID (issued and enforced by MathForge)',
          '引擎准入 ID（由 MathForge 签发并强制核对）',
        )}
        <input
          value={admission}
          onChange={(e) => {
            setAdmission(e.target.value);
            key.current = null;
          }}
          maxLength={100}
        />
      </label>
      <div className="research-actions">
        <button className="button secondary" disabled={busy} onClick={() => void act(submit)}>
          {text('Request real MathForge audit', '提交真实 MathForge 审查')}
        </button>
        <button className="button secondary" disabled={busy} onClick={() => void act(load)}>
          {text('Load real request history', '加载研究请求历史')}
        </button>
      </div>
      {error ? <p role="alert">{error}</p> : null}
      <div aria-live="polite">
        {tasks.map((task) => (
          <article className="task-record" key={task.id}>
            <strong>REAL ADAPTER · {task.status.toUpperCase()}</strong>
            <p>{task.blocker}</p>
            {task.execution_warnings?.map((warning) => (
              <p role="status" key={warning}>
                {warning}
              </p>
            ))}
            <code>{task.id}</code>
            <p className="muted small">
              {text('Engine task ID', '引擎任务 ID')}:{' '}
              {task.engine_task_id ?? text('Not issued', '未签发')} ·{' '}
              {text('Execution mode', '执行模式')}:{' '}
              {task.execution_mode ?? text('Unconfirmed', '未确认')}
            </p>
            {task.engine_task_id &&
            !['completed', 'failed', 'blocked', 'rejected', 'interrupted', 'cancelled'].includes(
              task.status,
            ) ? (
              <button
                disabled={busy}
                onClick={() =>
                  void act(async () => {
                    await call(`/api/v2/research-tasks/${task.id}/poll`, { method: 'POST' });
                    await load();
                  })
                }
              >
                {text('Query engine status', '查询引擎状态')}
              </button>
            ) : null}
            {!task.engine_task_id && task.events.some((e) => e.kind === 'submission_uncertain') ? (
              <button
                disabled={busy}
                onClick={() =>
                  void act(async () => {
                    await call(`/api/v2/research-tasks/${task.id}/reconcile`, { method: 'POST' });
                    await load();
                  })
                }
              >
                {text(
                  'Recover uncertain submission (lookup only)',
                  '恢复未知提交（只查询，不重提）',
                )}
              </button>
            ) : null}
            {task.engine_task_id && ['queued', 'running'].includes(task.status) ? (
              <button
                disabled={busy}
                onClick={() =>
                  void act(async () => {
                    await call(`/api/v2/research-tasks/${task.id}/cancel`, { method: 'POST' });
                    await load();
                  })
                }
              >
                {text('Request engine cancellation', '请求引擎取消任务')}
              </button>
            ) : null}
            {task.receipt ? (
              <details>
                <summary>
                  {text(
                    'Authenticated engine receipt · claims unverified',
                    '认证引擎回执 · 数学结论未核验',
                  )}
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                  {task.receipt.payload}
                </pre>
                <code>{task.receipt.signature}</code>
              </details>
            ) : null}
            {task.receipt && task.execution_mode === 'REAL_RUN' ? (
              <p className="muted small">
                {text(
                  'Retrieve named evidence through the authenticated local artifact API. Signed hashes are checked before persistence.',
                  '通过本地认证的证据 API 获取具名文件；持久化前会验证签名索引中的哈希。',
                )}
              </p>
            ) : null}
            {task.receipt && task.execution_mode === 'REAL_RUN'
              ? (
                  JSON.parse(task.receipt.payload).artifact_index as {
                    name: string;
                    sha256: string;
                    bytes: number;
                  }[]
                ).map((artifact) => (
                  <details key={artifact.name}>
                    <summary>
                      {artifact.name} · {artifact.bytes} bytes · SHA256 {artifact.sha256}
                    </summary>
                    <button
                      disabled={busy}
                      onClick={() => void act(() => inspectArtifact(task.id, artifact.name))}
                    >
                      {text('Verify, preserve & inspect evidence', '验证、保存并查看证据')}
                    </button>
                    {artifactText[`${task.id}:${artifact.name}`] ? (
                      <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                        {artifactText[`${task.id}:${artifact.name}`]}
                      </pre>
                    ) : null}
                  </details>
                ))
              : null}
            {task.evidence?.map((artifact) => (
              <p key={artifact.name}>
                <code>{artifact.name}</code> · SHA256 <code>{artifact.sha256}</code> ·{' '}
                {artifact.bytes} bytes
              </p>
            ))}
            <details>
              <summary>{text('Request & audit timeline', '请求与审计时间线')}</summary>
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
