import { createHash, createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import { mkdir, open, readFile, readdir, writeFile, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { getProblem } from './catalog';
import { safeUrl } from './schema';

export const RealRequestSchema = z
  .object({
    problem_id: z.string(),
    objective: z.string().trim().min(5).max(2000),
    budget: z
      .object({
        wall_seconds: z.number().int().min(1).max(60),
        max_tasks: z.literal(1),
        network: z.literal(false),
      })
      .strict(),
  })
  .strict();
export const RealResultSchema = z
  .object({
    engine: z.literal('mathforge'),
    is_mock: z.literal(false),
    engine_task_id: z.string().min(1).max(200),
    status: z.enum(['queued', 'running', 'completed', 'failed', 'blocked']),
    attempts: z
      .array(
        z
          .object({
            kind: z.enum(['failed_route', 'candidate_proof', 'counterexample', 'partial_result']),
            result: z.string().max(12000),
            verification_status: z.literal('unverified'),
            artifact_urls: z.array(safeUrl).max(20),
          })
          .strict(),
      )
      .max(10),
  })
  .strict();
export type RealTask = {
  id: string;
  api_version: 'v2';
  engine: 'mathforge';
  is_mock: false;
  problem_id: string;
  status: 'submitted' | 'blocked' | 'queued' | 'running' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  engine_task_id: string | null;
  input: z.infer<typeof RealRequestSchema>;
  context: unknown;
  attempts: z.infer<typeof RealResultSchema>['attempts'];
  events: { at: string; kind: string; digest: string }[];
  blocker: string | null;
  idempotency_key: string;
};
const RealTaskSchema = z
  .object({
    id: z.uuid(),
    api_version: z.literal('v2'),
    engine: z.literal('mathforge'),
    is_mock: z.literal(false),
    problem_id: z.string(),
    status: z.enum(['submitted', 'blocked', 'queued', 'running', 'completed', 'failed']),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
    engine_task_id: z.string().nullable(),
    input: RealRequestSchema,
    context: z.unknown(),
    attempts: RealResultSchema.shape.attempts,
    events: z.array(
      z
        .object({
          at: z.iso.datetime(),
          kind: z.string(),
          digest: z.string().regex(/^[a-f0-9]{64}$/),
        })
        .strict(),
    ),
    blocker: z.string().nullable(),
    idempotency_key: z.string(),
  })
  .strict();
export class RealBoundaryError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
function folder() {
  return path.resolve(
    /* turbopackIgnore: true */ process.env.CONJMAP_REAL_TASK_DIR ?? '.local/real-tasks',
  );
}
const filename = (id: string) => path.join(folder(), `${z.uuid().parse(id)}.json`);
async function save(task: RealTask) {
  RealTaskSchema.parse(task);
  const history = path.join(folder(), 'history', task.id);
  await mkdir(history, { recursive: true });
  await writeFile(
    path.join(history, `${String(task.events.length).padStart(6, '0')}.json`),
    JSON.stringify(task, null, 2),
    { encoding: 'utf8', flag: 'wx' },
  );
  const temp = `${filename(task.id)}.${randomUUID()}.tmp`;
  await writeFile(temp, JSON.stringify(task, null, 2), 'utf8');
  await rename(temp, filename(task.id));
}
async function locked<T>(fn: () => Promise<T>) {
  await mkdir(folder(), { recursive: true });
  const p = path.join(folder(), 'writer.lock');
  const handle = await open(p, 'wx').catch(() => {
    throw new RealBoundaryError(409, 'Journal busy; retry without changing idempotency key');
  });
  try {
    return await fn();
  } finally {
    await handle.close();
    await unlink(p);
  }
}
function digest(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
export function configuration() {
  const endpoint = process.env.CONJMAP_MATHFORGE_URL;
  if (
    !endpoint ||
    !process.env.CONJMAP_MATHFORGE_TOKEN ||
    !process.env.CONJMAP_CALLBACK_SECRET ||
    !process.env.CONJMAP_RESEARCH_ACCESS_TOKEN
  )
    return {
      ready: false as const,
      reason:
        'No authenticated generic MathForge task API configured. Existing local controller is source-bound and is not a generic submission endpoint.',
    };
  if (
    [
      process.env.CONJMAP_MATHFORGE_TOKEN,
      process.env.CONJMAP_CALLBACK_SECRET,
      process.env.CONJMAP_RESEARCH_ACCESS_TOKEN,
    ].some((v) => v.length < 32)
  )
    throw new RealBoundaryError(503, 'Integration secrets must contain at least 32 characters');
  const url = new URL(endpoint);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error('MathForge endpoint must be a credential-free loopback URL');
  return { ready: true as const, url };
}
export function authenticate(request: Request) {
  const token = process.env.CONJMAP_RESEARCH_ACCESS_TOKEN;
  if (!token) throw new RealBoundaryError(503, 'Real research access is not configured');
  const incoming = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${token}`;
  const a = Buffer.from(incoming),
    b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b))
    throw new RealBoundaryError(401, 'Unauthorized research request');
}
export function verifyCallback(
  raw: string,
  timestamp: string,
  signature: string,
  secret: string,
  now = Date.now(),
) {
  if (
    secret.length < 32 ||
    !/^\d{13}$/.test(timestamp) ||
    Math.abs(now - Number(timestamp)) > 300000 ||
    !/^sha256=[a-f0-9]{64}$/.test(signature)
  )
    throw new Error('Invalid callback signature or freshness');
  const expected = createHmac('sha256', secret).update(`${timestamp}.${raw}`).digest('hex');
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature.slice(7))))
    throw new Error('Invalid callback signature');
}
export async function getRealTask(id: string): Promise<RealTask | null> {
  try {
    return RealTaskSchema.parse(JSON.parse(await readFile(filename(id), 'utf8')));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw e;
  }
}
export async function listRealTasks(problemId: string) {
  let files: string[];
  try {
    files = await readdir(/* turbopackIgnore: true */ folder());
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw e;
  }
  return (
    await Promise.all(
      files.filter((n) => /^[a-f0-9-]{36}\.json$/.test(n)).map((n) => getRealTask(n.slice(0, -5))),
    )
  ).filter((r): r is RealTask => !!r && r.problem_id === problemId);
}
export async function submitRealTask(input: unknown, key: string, transport: typeof fetch = fetch) {
  const data = RealRequestSchema.parse(input);
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(key))
    throw new RealBoundaryError(400, 'Valid idempotency key required');
  const problem = getProblem(data.problem_id);
  if (!problem) throw new RealBoundaryError(404, 'Unknown problem');
  return locked(async () => {
    const all = await readdir(/* turbopackIgnore: true */ folder());
    const tasks = (
      await Promise.all(
        all.filter((n) => /^[a-f0-9-]{36}\.json$/.test(n)).map((n) => getRealTask(n.slice(0, -5))),
      )
    ).filter((t) => !!t);
    const existing = tasks.find((t) => t.idempotency_key === key);
    if (existing) {
      if (digest(existing.input) !== digest(data))
        throw new RealBoundaryError(409, 'Idempotency payload conflict');
      return existing;
    }
    if (
      tasks.filter(
        (t) =>
          ['submitted', 'queued', 'running'].includes(t.status) ||
          (t.status === 'blocked' && t.events.some((e) => e.kind === 'submission_uncertain')),
      ).length >= 3
    )
      throw new RealBoundaryError(429, 'Local active-task quota exceeded');
    const now = new Date().toISOString();
    const cfg = configuration();
    const task: RealTask = {
      id: randomUUID(),
      api_version: 'v2',
      engine: 'mathforge',
      is_mock: false,
      problem_id: problem.id,
      status: cfg.ready ? 'submitted' : 'blocked',
      created_at: now,
      updated_at: now,
      engine_task_id: null,
      input: data,
      context: {
        problem_id: problem.id,
        statement: problem.statement,
        formal_statement: problem.formal_statement,
        references: problem.references,
        source_mappings: problem.source_mappings,
        status: problem.status,
        review_status: problem.review_status,
        known_results: [],
        known_results_scope:
          'No independently established results supplied; inspect linked sources.',
      },
      attempts: [],
      events: [],
      blocker: cfg.ready ? null : cfg.reason,
      idempotency_key: key,
    };
    task.events.push({ at: now, kind: 'request_recorded', digest: digest(task.context) });
    await save(task);
    if (!cfg.ready) return task;
    let definitiveRejection: number | null = null;
    try {
      const response = await transport(
        new URL('research-tasks', cfg.url.href.endsWith('/') ? cfg.url.href : cfg.url.href + '/'),
        {
          method: 'POST',
          redirect: 'error',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CONJMAP_MATHFORGE_TOKEN}`,
            'Idempotency-Key': key,
          },
          body: JSON.stringify({
            api_version: 'v2',
            conjmap_task_id: task.id,
            ...data,
            context: task.context,
          }),
          signal: AbortSignal.timeout(5000),
        },
      );
      if (!response.ok) {
        if ([400, 401, 403, 404, 409, 422, 429].includes(response.status))
          definitiveRejection = response.status;
        throw new Error('Engine rejected request; reconcile using idempotency key');
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Empty engine response');
      let raw = '',
        size = 0;
      const decoder = new TextDecoder();
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > 65536) {
          await reader.cancel();
          throw new Error('Oversized engine response');
        }
        raw += decoder.decode(chunk.value, { stream: true });
      }
      raw += decoder.decode();
      const result = RealResultSchema.parse(JSON.parse(raw));
      task.engine_task_id = result.engine_task_id;
      task.status = result.status;
      task.attempts = result.attempts;
      task.events.push({
        at: new Date().toISOString(),
        kind: 'engine_response',
        digest: digest(result),
      });
    } catch {
      task.status = 'blocked';
      if (definitiveRejection !== null) {
        task.blocker = `Engine definitively rejected request (HTTP ${definitiveRejection}); no task admitted.`;
        task.events.push({
          at: new Date().toISOString(),
          kind: 'engine_rejected',
          digest: digest({ key, status: definitiveRejection }),
        });
      } else {
        task.blocker =
          'Submission outcome uncertain. Reconcile with engine by idempotency key; no automatic retry.';
        task.events.push({
          at: new Date().toISOString(),
          kind: 'submission_uncertain',
          digest: digest({ key }),
        });
      }
    }
    task.updated_at = new Date().toISOString();
    await save(task);
    return task;
  });
}
export async function receiveRealResult(
  id: string,
  input: unknown,
  origin: 'signed_callback' | 'engine_poll' = 'signed_callback',
) {
  const data = RealResultSchema.parse(input);
  return locked(async () => {
    const task = await getRealTask(id);
    if (!task) throw new RealBoundaryError(404, 'Unknown task');
    if (!task.engine_task_id || data.engine_task_id !== task.engine_task_id)
      throw new RealBoundaryError(409, 'Engine identity mismatch');
    if (['completed', 'failed', 'blocked'].includes(task.status))
      throw new RealBoundaryError(409, 'Terminal result cannot be overwritten');
    if (task.status === 'running' && data.status === 'queued')
      throw new RealBoundaryError(409, 'State regression rejected');
    if (
      task.events.some(
        (e) => ['signed_callback', 'engine_poll'].includes(e.kind) && e.digest === digest(data),
      )
    )
      throw new RealBoundaryError(409, 'Callback replay rejected');
    task.events.push({
      at: new Date().toISOString(),
      kind: origin,
      digest: digest(data),
    });
    task.status = data.status;
    task.attempts = data.attempts;
    task.updated_at = new Date().toISOString();
    await save(task);
    return task;
  });
}
export async function pollRealTask(id: string, transport: typeof fetch = fetch) {
  const task = await getRealTask(id);
  if (!task) throw new RealBoundaryError(404, 'Unknown task');
  if (['completed', 'failed', 'blocked'].includes(task.status)) return task;
  const cfg = configuration();
  if (!cfg.ready || !task.engine_task_id)
    throw new RealBoundaryError(503, 'No bound engine task to poll');
  const base = cfg.url.href.endsWith('/') ? cfg.url.href : cfg.url.href + '/';
  const response = await transport(
    new URL(`research-tasks/${encodeURIComponent(task.engine_task_id)}`, base),
    {
      redirect: 'error',
      headers: { Authorization: `Bearer ${process.env.CONJMAP_MATHFORGE_TOKEN}` },
      signal: AbortSignal.timeout(5000),
    },
  );
  if (!response.ok)
    throw new RealBoundaryError(502, 'Engine status query failed; no resubmission performed');
  const reader = response.body?.getReader();
  if (!reader) throw new RealBoundaryError(502, 'Empty engine status');
  let raw = '',
    size = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 65536) {
        await reader.cancel();
        throw new RealBoundaryError(502, 'Oversized engine status');
      }
      raw += decoder.decode(part.value, { stream: true });
    }
    raw += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  const value = RealResultSchema.parse(JSON.parse(raw));
  if (
    digest(value) ===
    digest(
      RealResultSchema.parse({
        engine: 'mathforge',
        is_mock: false,
        engine_task_id: task.engine_task_id,
        status: task.status,
        attempts: task.attempts,
      }),
    )
  )
    return task;
  return receiveRealResult(id, value, 'engine_poll');
}
