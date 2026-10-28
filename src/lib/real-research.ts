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
    admission_id: z
      .string()
      .regex(/^[a-zA-Z0-9-]{1,100}$/)
      .optional(),
    budget: z
      .object({
        wall_seconds: z.number().int().min(1).max(60),
        max_tasks: z.literal(1),
        network: z.literal(false),
      })
      .strict(),
  })
  .strict();
const engineStatus = z.enum([
  'queued',
  'running',
  'completed',
  'failed',
  'blocked',
  'rejected',
  'interrupted',
  'cancelled',
]);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const receiptEnvelope = z
  .object({ payload: z.string().max(48000), signature: z.string().regex(/^sha256=[a-f0-9]{64}$/) })
  .strict();
const engineAttempts = z
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
  .max(10);
export const EngineReceiptSchema = z
  .object({
    protocol: z.literal('mathforge-conjmap-receipt-v1'),
    engine_task_id: z.string().min(1),
    conjmap_task_id: z.uuid(),
    problem_id: z.string(),
    admission_id: z.string(),
    admission_sha256: hash,
    execution_mode: z.enum(['REAL_RUN', 'CONTRACT_TEST']),
    status: engineStatus,
    source_sha256: hash,
    statement_sha256: hash,
    engine_commit: z.string().min(7).max(100),
    worker_sha256: hash,
    artifact_index: z
      .array(
        z
          .object({
            name: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,100}$/),
            sha256: hash,
            bytes: z.number().int().min(0).max(1048576),
          })
          .strict(),
      )
      .max(20),
    resources: z
      .object({
        // Receipt accounting includes bounded termination/cleanup overhead; worker admission remains <=60s.
        wall_seconds: z.number().min(0).max(65),
        cpu_seconds: z.number().min(0),
        peak_job_bytes: z.number().int().min(0),
      })
      .passthrough(),
    scientific_status: z.literal('unverified'),
    attempts: engineAttempts,
  })
  .passthrough();
export const RealResultSchema = z
  .object({
    engine: z.literal('mathforge'),
    is_mock: z.literal(false),
    engine_task_id: z.string().min(1).max(200),
    status: engineStatus,
    execution_mode: z.enum(['REAL_RUN', 'CONTRACT_TEST']).optional(),
    receipt: receiptEnvelope.optional(),
    attempts: engineAttempts,
  })
  .strict();
export type RealTask = {
  id: string;
  api_version: 'v2';
  engine: 'mathforge';
  is_mock: false;
  problem_id: string;
  status: 'submitted' | z.infer<typeof engineStatus>;
  created_at: string;
  updated_at: string;
  engine_task_id: string | null;
  input: z.infer<typeof RealRequestSchema>;
  context: unknown;
  attempts: z.infer<typeof RealResultSchema>['attempts'];
  events: { at: string; kind: string; digest: string }[];
  blocker: string | null;
  idempotency_key: string;
  execution_mode?: 'REAL_RUN' | 'CONTRACT_TEST';
  receipt?: z.infer<typeof receiptEnvelope>;
  evidence?: { name: string; sha256: string; bytes: number }[];
  execution_warnings?: string[];
};
const RealTaskSchema = z
  .object({
    id: z.uuid(),
    api_version: z.literal('v2'),
    engine: z.literal('mathforge'),
    is_mock: z.literal(false),
    problem_id: z.string(),
    status: z.enum(['submitted', ...engineStatus.options]),
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
    execution_mode: z.enum(['REAL_RUN', 'CONTRACT_TEST']).optional(),
    receipt: receiptEnvelope.optional(),
    evidence: z
      .array(z.object({ name: z.string(), sha256: hash, bytes: z.number().int().min(0) }).strict())
      .optional(),
    execution_warnings: z.array(z.string().max(1000)).max(10).optional(),
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
const terminal = (status: string) =>
  ['completed', 'failed', 'blocked', 'rejected', 'interrupted', 'cancelled'].includes(status);
function baseUrl(url: URL) {
  return url.href.endsWith('/') ? url.href : url.href + '/';
}
async function engineJson(response: Response) {
  if (!response.ok)
    throw new RealBoundaryError(
      response.status === 404 ? 404 : 502,
      'Engine query failed; no resubmission performed',
    );
  const reader = response.body?.getReader();
  if (!reader) throw new RealBoundaryError(502, 'Empty engine response');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 65536) {
        await reader.cancel();
        throw new RealBoundaryError(502, 'Oversized engine response');
      }
      chunks.push(part.value);
    }
  } finally {
    reader.releaseLock();
  }
  return RealResultSchema.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
}
export function verifiedEngineReceipt(task: RealTask, value: z.infer<typeof RealResultSchema>) {
  if (value.execution_mode !== 'REAL_RUN') {
    if (task.execution_mode === 'REAL_RUN')
      throw new RealBoundaryError(409, 'Real execution cannot downgrade to contract evidence');
    if (!value.receipt) {
      if (task.input.admission_id)
        throw new RealBoundaryError(409, 'Admitted research requires signed engine receipt');
      return null;
    }
  }
  const secret = process.env.CONJMAP_CALLBACK_SECRET;
  if (!value.receipt || !secret || secret.length < 32)
    throw new RealBoundaryError(401, 'Signed engine receipt required for REAL_RUN');
  const expected = createHmac('sha256', secret).update(value.receipt.payload).digest('hex');
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(value.receipt.signature.slice(7))))
    throw new RealBoundaryError(401, 'Invalid engine receipt signature');
  const receipt = EngineReceiptSchema.parse(JSON.parse(value.receipt.payload));
  // Both arrays are parsed through the same strict object schema, which normalizes key order.
  if (JSON.stringify(receipt.attempts) !== JSON.stringify(engineAttempts.parse(value.attempts)))
    throw new RealBoundaryError(409, 'Engine receipt narrative binding mismatch');
  const source = (task.context as { source_binding?: { sha256: string; statement_sha256: string } })
    .source_binding;
  if (
    !source ||
    receipt.execution_mode !== value.execution_mode ||
    receipt.engine_task_id !== value.engine_task_id ||
    receipt.conjmap_task_id !== task.id ||
    receipt.problem_id !== task.problem_id ||
    receipt.admission_id !== task.input.admission_id ||
    receipt.status !== value.status ||
    receipt.source_sha256 !== source.sha256 ||
    receipt.statement_sha256 !== source.statement_sha256
  )
    throw new RealBoundaryError(409, 'Engine receipt source or task binding mismatch');
  const allowedOverhead = receipt.status === 'completed' ? 0 : 5;
  if (receipt.resources.wall_seconds > task.input.budget.wall_seconds + allowedOverhead)
    throw new RealBoundaryError(
      409,
      'Engine exceeded admitted wall budget and bounded cleanup allowance',
    );
  if (new Set(receipt.artifact_index.map((a) => a.name)).size !== receipt.artifact_index.length)
    throw new RealBoundaryError(409, 'Duplicate artifact receipt name');
  return receipt;
}
function applyResult(task: RealTask, data: z.infer<typeof RealResultSchema>) {
  const receipt = verifiedEngineReceipt(task, data);
  task.engine_task_id = data.engine_task_id;
  task.status = data.status;
  task.attempts = data.attempts;
  task.execution_mode = data.execution_mode ?? 'CONTRACT_TEST';
  if (data.receipt) task.receipt = data.receipt;
  if (receipt && receipt.resources.wall_seconds > task.input.budget.wall_seconds) {
    task.execution_warnings = [
      ...new Set([
        ...(task.execution_warnings ?? []),
        `Engine reported ${receipt.resources.wall_seconds}s elapsed against ${task.input.budget.wall_seconds}s worker budget. Retained non-completed receipt includes bounded termination/cleanup overhead; it does not establish successful in-budget execution.`,
      ]),
    ];
  }
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
    const task = RealTaskSchema.parse(JSON.parse(await readFile(filename(id), 'utf8')));
    if (task.execution_mode === 'REAL_RUN' || task.receipt) {
      if (!task.engine_task_id || task.status === 'submitted')
        throw new RealBoundaryError(409, 'Invalid persisted engine receipt state');
      verifiedEngineReceipt(task, {
        engine: 'mathforge',
        is_mock: false,
        engine_task_id: task.engine_task_id,
        status: task.status,
        attempts: task.attempts,
        execution_mode: task.execution_mode,
        receipt: task.receipt,
      });
    }
    return task;
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
        source_binding: {
          source_id: problem.provenance.source_id,
          revision: problem.provenance.revision,
          path: problem.provenance.path,
          sha256: problem.provenance.sha256,
          statement_sha256: createHash('sha256').update(problem.statement, 'utf8').digest('hex'),
        },
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
      const result = await engineJson(response);
      applyResult(task, result);
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
    if (terminal(task.status))
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
    applyResult(task, data);
    task.updated_at = new Date().toISOString();
    await save(task);
    return task;
  });
}
export async function pollRealTask(id: string, transport: typeof fetch = fetch) {
  const task = await getRealTask(id);
  if (!task) throw new RealBoundaryError(404, 'Unknown task');
  if (terminal(task.status)) return task;
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
  const value = await engineJson(response);
  if (
    digest(value) ===
    digest(
      RealResultSchema.parse({
        engine: 'mathforge',
        is_mock: false,
        engine_task_id: task.engine_task_id,
        status: task.status,
        attempts: task.attempts,
        ...(task.execution_mode && value.execution_mode
          ? { execution_mode: task.execution_mode }
          : {}),
        ...(task.receipt ? { receipt: task.receipt } : {}),
      }),
    )
  )
    return task;
  return receiveRealResult(id, value, 'engine_poll');
}

/** Recover an ambiguous POST by engine lookup only. This function never submits work. */
export async function reconcileRealTask(id: string, transport: typeof fetch = fetch) {
  return locked(async () => {
    const task = await getRealTask(id);
    if (!task) throw new RealBoundaryError(404, 'Unknown task');
    if (task.engine_task_id) return task;
    if (!task.events.some((e) => e.kind === 'submission_uncertain'))
      throw new RealBoundaryError(409, 'No uncertain submission to reconcile');
    const cfg = configuration();
    if (!cfg.ready) throw new RealBoundaryError(503, 'No engine configured for reconciliation');
    const response = await transport(
      new URL(
        `research-tasks/by-key/${encodeURIComponent(task.idempotency_key)}`,
        baseUrl(cfg.url),
      ),
      {
        redirect: 'error',
        headers: { Authorization: `Bearer ${process.env.CONJMAP_MATHFORGE_TOKEN}` },
        signal: AbortSignal.timeout(5000),
      },
    );
    const value = await engineJson(response);
    applyResult(task, value);
    task.blocker = null;
    task.updated_at = new Date().toISOString();
    task.events.push({
      at: task.updated_at,
      kind: 'engine_reconciled_by_key',
      digest: digest(value),
    });
    await save(task);
    return task;
  });
}

export async function cancelRealTask(id: string, transport: typeof fetch = fetch) {
  const task = await locked(async () => {
    const current = await getRealTask(id);
    if (!current) throw new RealBoundaryError(404, 'Unknown task');
    if (terminal(current.status)) return current;
    const cfg = configuration();
    if (!cfg.ready || !current.engine_task_id)
      throw new RealBoundaryError(
        409,
        'Cannot cancel without a bound engine task; reconcile first',
      );
    current.updated_at = new Date().toISOString();
    current.events.push({
      at: current.updated_at,
      kind: 'cancellation_requested',
      digest: digest({ engine_task_id: current.engine_task_id }),
    });
    await save(current);
    return current;
  });
  if (terminal(task.status)) return task;
  const cfg = configuration();
  if (!cfg.ready || !task.engine_task_id)
    throw new RealBoundaryError(409, 'Cannot cancel without a bound engine task; reconcile first');
  let response: Response;
  try {
    response = await transport(
      new URL(`research-tasks/${encodeURIComponent(task.engine_task_id)}/cancel`, baseUrl(cfg.url)),
      {
        method: 'POST',
        redirect: 'error',
        headers: {
          Authorization: `Bearer ${process.env.CONJMAP_MATHFORGE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
        signal: AbortSignal.timeout(5000),
      },
    );
  } catch {
    await locked(async () => {
      const current = await getRealTask(id);
      if (!current) return;
      current.updated_at = new Date().toISOString();
      current.events.push({
        at: current.updated_at,
        kind: 'cancellation_outcome_uncertain',
        digest: digest({ engine_task_id: current.engine_task_id }),
      });
      await save(current);
    });
    throw new RealBoundaryError(
      502,
      'Cancellation outcome uncertain; query engine state without resubmitting research',
    );
  }
  const value = await engineJson(response);
  const current = await getRealTask(id);
  if (current && terminal(current.status)) {
    if (value.engine_task_id !== current.engine_task_id)
      throw new RealBoundaryError(409, 'Engine identity mismatch');
    verifiedEngineReceipt(current, value);
    return current; // A concurrent terminal receipt wins; cancellation cannot promote or regress it.
  }
  if (
    current &&
    value.status === current.status &&
    digest(value.attempts) === digest(current.attempts) &&
    digest(value.receipt) === digest(current.receipt)
  ) {
    verifiedEngineReceipt(current, value);
    return current;
  }
  return receiveRealResult(id, value, 'engine_poll');
}

/** Fetch only a signed, named engine artifact; never follow arbitrary artifact URLs. */
export async function fetchRealArtifact(id: string, name: string, transport: typeof fetch = fetch) {
  return locked(async () => {
    const task = await getRealTask(id);
    if (!task) throw new RealBoundaryError(404, 'Unknown task');
    const cfg = configuration();
    if (!cfg.ready || !task.engine_task_id || !task.receipt || task.execution_mode !== 'REAL_RUN')
      throw new RealBoundaryError(409, 'Signed real receipt required for artifact retrieval');
    const receipt = verifiedEngineReceipt(task, {
      engine: 'mathforge',
      is_mock: false,
      engine_task_id: task.engine_task_id,
      status: task.status as z.infer<typeof engineStatus>,
      attempts: task.attempts,
      execution_mode: task.execution_mode,
      receipt: task.receipt,
    });
    const artifact = receipt?.artifact_index.find((a) => a.name === name);
    if (!artifact) throw new RealBoundaryError(404, 'Artifact absent from signed index');
    const directory = path.join(folder(), 'evidence', task.id);
    const file = path.join(directory, artifact.name);
    let bytes: Buffer;
    try {
      bytes = await readFile(file);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      const response = await transport(
        new URL(
          `research-tasks/${encodeURIComponent(task.engine_task_id)}/artifacts/${encodeURIComponent(name)}`,
          baseUrl(cfg.url),
        ),
        {
          redirect: 'error',
          headers: { Authorization: `Bearer ${process.env.CONJMAP_MATHFORGE_TOKEN}` },
          signal: AbortSignal.timeout(5000),
        },
      );
      if (!response.ok) throw new RealBoundaryError(502, 'Engine artifact unavailable');
      const reader = response.body?.getReader();
      if (!reader) throw new RealBoundaryError(502, 'Empty artifact response');
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.byteLength;
          if (size > artifact.bytes || size > 1048576) {
            await reader.cancel();
            throw new RealBoundaryError(502, 'Artifact exceeds signed size');
          }
          chunks.push(chunk.value);
        }
      } finally {
        reader.releaseLock();
      }
      bytes = Buffer.concat(chunks);
      if (
        bytes.byteLength !== artifact.bytes ||
        createHash('sha256').update(bytes).digest('hex') !== artifact.sha256
      )
        throw new RealBoundaryError(502, 'Artifact hash or size mismatch');
      await mkdir(directory, { recursive: true });
      await writeFile(file, bytes, { flag: 'wx' });
    }
    if (
      bytes.byteLength !== artifact.bytes ||
      createHash('sha256').update(bytes).digest('hex') !== artifact.sha256
    )
      throw new RealBoundaryError(502, 'Stored artifact hash or size mismatch');
    if (!task.evidence?.some((e) => e.name === name)) {
      task.evidence = [...(task.evidence ?? []), artifact];
      task.updated_at = new Date().toISOString();
      task.events.push({
        at: task.updated_at,
        kind: 'artifact_hash_verified',
        digest: digest(artifact),
      });
      await save(task);
    }
    return { bytes, artifact };
  });
}
