import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHash, createHmac } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { getProblem } from '../src/lib/catalog';
import {
  cancelRealTask,
  fetchRealArtifact,
  getRealTask,
  pollRealTask,
  receiveRealResult,
  reconcileRealTask,
  submitRealTask,
  type RealTask,
} from '../src/lib/real-research';
import { POST as reconcileRoute } from '../src/app/api/v2/research-tasks/[id]/reconcile/route';
import { POST as cancelRoute } from '../src/app/api/v2/research-tasks/[id]/cancel/route';
import { GET as artifactRoute } from '../src/app/api/v2/research-tasks/[id]/artifacts/[name]/route';

// All transports in this file are CONTRACT_TEST fixtures. None executes MathForge.
const keys = [
  'CONJMAP_REAL_TASK_DIR',
  'CONJMAP_MATHFORGE_URL',
  'CONJMAP_MATHFORGE_TOKEN',
  'CONJMAP_CALLBACK_SECRET',
  'CONJMAP_RESEARCH_ACCESS_TOKEN',
];
let previous: Record<string, string | undefined>;
let directory: string;
const bytes = Buffer.from('CONTRACT_TEST only; no real research executed.');
const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const input = {
  problem_id: 'cm-000118',
  objective: 'CONTRACT_TEST finite admission transport only.',
  admission_id: 'cm-v04-union-closed-fin2-v1',
  budget: { wall_seconds: 60, max_tasks: 1, network: false },
};
beforeEach(async () => {
  previous = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  directory = await mkdtemp(path.join(tmpdir(), 'conjmap-v04-contract-'));
  process.env.CONJMAP_REAL_TASK_DIR = directory;
  process.env.CONJMAP_MATHFORGE_URL = 'http://127.0.0.1:9444/v2/';
  for (const key of keys.slice(2)) process.env[key] = `CONTRACT-TEST-${key}`.padEnd(64, 'x');
});
afterEach(async () => {
  for (const key of keys) {
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
  }
  await rm(directory, { recursive: true, force: true });
});
function result(
  task: Pick<RealTask, 'id' | 'problem_id' | 'input' | 'context'>,
  status = 'queued',
  mode = 'CONTRACT_TEST',
  overrides: Record<string, unknown> = {},
) {
  const source = (task.context as { source_binding: { sha256: string; statement_sha256: string } })
    .source_binding;
  const payload = JSON.stringify({
    protocol: 'mathforge-conjmap-receipt-v1',
    engine_task_id: 'contract-test-engine-id',
    conjmap_task_id: task.id,
    problem_id: task.problem_id,
    admission_id: task.input.admission_id,
    admission_sha256: sha('CONTRACT_TEST admission'),
    execution_mode: mode,
    status,
    source_sha256: source.sha256,
    statement_sha256: source.statement_sha256,
    engine_commit: 'contract-test-commit',
    worker_sha256: sha('CONTRACT_TEST worker'),
    artifact_index: [{ name: 'execution.txt', sha256: sha(bytes), bytes: bytes.length }],
    resources: { wall_seconds: 0, cpu_seconds: 0, peak_job_bytes: 0 },
    scientific_status: 'unverified',
    attempts: [],
    ...overrides,
  });
  return {
    engine: 'mathforge',
    is_mock: false,
    engine_task_id: 'contract-test-engine-id',
    status,
    execution_mode: mode,
    attempts: [],
    receipt: {
      payload,
      signature:
        'sha256=' +
        createHmac('sha256', process.env.CONJMAP_CALLBACK_SECRET!).update(payload).digest('hex'),
    },
  };
}
async function submit(mode = 'CONTRACT_TEST') {
  return submitRealTask(input, 'v04-contract-idempotency-001', async (_url, init) => {
    const body = JSON.parse(init!.body as string);
    return Response.json(
      result(
        {
          id: body.conjmap_task_id,
          problem_id: body.context.problem_id,
          input: body,
          context: body.context,
        },
        'queued',
        mode,
      ),
    );
  });
}
describe('V0.4 bounded authenticated transport contract (no real engine runs)', () => {
  it('pins UTF8 statement and upstream revision/hash without changing mathematical status', async () => {
    const task = await submit();
    const problem = getProblem(input.problem_id)!;
    expect(task.execution_mode).toBe('CONTRACT_TEST');
    expect(task.context).toMatchObject({
      source_binding: {
        source_id: problem.provenance.source_id,
        revision: problem.provenance.revision,
        path: problem.provenance.path,
        sha256: problem.provenance.sha256,
        statement_sha256: sha(problem.statement),
      },
    });
    expect(problem.status).toBe('unknown');
  });
  it('fails closed on unsigned claimed real runs and preserves uncertain admission for lookup', async () => {
    const task = await submitRealTask(input, 'v04-unsigned-real-0001', async () =>
      Response.json({
        engine: 'mathforge',
        is_mock: false,
        engine_task_id: 'fake',
        status: 'completed',
        execution_mode: 'REAL_RUN',
        attempts: [],
      }),
    );
    expect(task.status).toBe('blocked');
    expect(task.engine_task_id).toBeNull();
    expect(task.events.at(-1)?.kind).toBe('submission_uncertain');
  });
  it('rejects signed wrong source, wrong task, wrong status and over-budget receipts', async () => {
    const task = await submit();
    for (const overrides of [
      { source_sha256: sha('wrong') },
      { conjmap_task_id: crypto.randomUUID() },
      { status: 'completed' },
      { resources: { wall_seconds: 66, cpu_seconds: 0, peak_job_bytes: 0 } },
    ])
      await expect(
        receiveRealResult(task.id, result(task, 'running', 'CONTRACT_TEST', overrides)),
      ).rejects.toThrow();
    const forged = result(task, 'running');
    forged.receipt.signature = 'sha256=' + '0'.repeat(64);
    await expect(receiveRealResult(task.id, forged)).rejects.toThrow('signature');
    expect((await getRealTask(task.id))?.status).toBe('queued');
  });
  it('reconciles an uncertain POST using only by-key GET and retains immutable history', async () => {
    const task = await submitRealTask(input, 'v04-uncertain-lookup-0001', async () => {
      throw new Error('contract timeout');
    });
    let lookups = 0;
    const restored = await reconcileRealTask(task.id, async (url, init) => {
      lookups++;
      expect(String(url)).toContain('/by-key/v04-uncertain-lookup-0001');
      expect(init?.method).toBeUndefined();
      return Response.json(result(task));
    });
    expect(restored.status).toBe('queued');
    expect(lookups).toBe(1);
    expect(restored.blocker).toBeNull();
    expect(
      JSON.parse(await readFile(path.join(directory, 'history', task.id, '000002.json'), 'utf8'))
        .status,
    ).toBe('blocked');
    await reconcileRealTask(task.id, async () => {
      throw new Error('must not query twice');
    });
  });
  it('does not resubmit when lookup finds no task', async () => {
    const task = await submitRealTask(input, 'v04-missing-lookup-0001', async () => {
      throw new Error('timeout');
    });
    await expect(
      reconcileRealTask(task.id, async (_url, init) => {
        expect(init?.method).toBeUndefined();
        return Response.json({}, { status: 404 });
      }),
    ).rejects.toThrow('no resubmission');
    expect((await getRealTask(task.id))?.status).toBe('blocked');
  });
  it.each(['rejected', 'interrupted', 'cancelled', 'failed'])(
    'accepts %s execution outcome without mathematical verification',
    async (status) => {
      const task = await submit();
      const changed = await receiveRealResult(task.id, result(task, status));
      expect(changed.status).toBe(status);
      await expect(receiveRealResult(task.id, result(task, 'completed'))).rejects.toThrow(
        'overwritten',
      );
      expect(getProblem(input.problem_id)?.status).toBe('unknown');
    },
  );
  it('forwards cancellation once and never restarts terminal execution', async () => {
    const task = await submit();
    let called = 0;
    const stopped = await cancelRealTask(task.id, async (url, init) => {
      called++;
      expect(String(url)).toMatch(/\/cancel$/);
      expect(init?.method).toBe('POST');
      return Response.json(result(task, 'cancelled'));
    });
    expect(stopped.status).toBe('cancelled');
    await cancelRealTask(task.id, async () => {
      throw new Error('no retry');
    });
    expect(called).toBe(1);
  });
  it('rejects contract fixtures as real downloadable evidence', async () => {
    const task = await submit();
    await expect(
      fetchRealArtifact(task.id, 'execution.txt', async () => Response.json({})),
    ).rejects.toThrow('Signed real receipt');
  });
  it('requires authentication on recovery/cancellation/artifact route boundaries', async () => {
    const task = await submit();
    const request = new Request('http://127.0.0.1/api/v2/research-tasks', {
      method: 'POST',
      headers: { host: '127.0.0.1' },
    });
    const params = { params: Promise.resolve({ id: task.id }) };
    expect((await reconcileRoute(request, params)).status).toBe(401);
    expect((await cancelRoute(request, params)).status).toBe(401);
    expect(
      (
        await artifactRoute(request, {
          params: Promise.resolve({ id: task.id, name: 'execution.txt' }),
        })
      ).status,
    ).toBe(401);
  });
  it('validates every real poll receipt and rejects mode downgrade (signed contract fixtures simulate envelopes only)', async () => {
    const task = await submit('REAL_RUN');
    const running = await pollRealTask(task.id, async () =>
      Response.json(result(task, 'running', 'REAL_RUN')),
    );
    expect(running.status).toBe('running');
    await expect(receiveRealResult(task.id, result(task, 'completed'))).rejects.toThrow(
      'downgrade',
    );
    const evidence = await fetchRealArtifact(task.id, 'execution.txt', async (url) => {
      expect(String(url)).toMatch(/\/artifacts\/execution.txt$/);
      return new Response(bytes);
    });
    expect(evidence.bytes).toEqual(bytes);
    expect((await getRealTask(task.id))?.evidence?.[0].sha256).toBe(sha(bytes));
    await expect(
      fetchRealArtifact(task.id, '../secret', async () => new Response(bytes)),
    ).rejects.toThrow('signed index');
  });
  it('rejects corrupted/oversized artifacts before persistence', async () => {
    const task = await submit('REAL_RUN');
    await expect(
      fetchRealArtifact(task.id, 'execution.txt', async () => new Response('corruption')),
    ).rejects.toThrow('mismatch');
    await expect(
      fetchRealArtifact(
        task.id,
        'execution.txt',
        async () => new Response(Buffer.alloc(bytes.length + 1)),
      ),
    ).rejects.toThrow('signed size');
    expect((await getRealTask(task.id))?.evidence).toBeUndefined();
  });
  it('preserves authentic interrupted receipt elapsed and records cleanup accounting caution', async () => {
    const task = await submit('REAL_RUN');
    const stopped = await receiveRealResult(
      task.id,
      result(task, 'interrupted', 'REAL_RUN', {
        resources: { wall_seconds: 62.25, cpu_seconds: 59.7, peak_job_bytes: 1000 },
      }),
    );
    expect(stopped.status).toBe('interrupted');
    expect(JSON.parse(stopped.receipt!.payload).resources.wall_seconds).toBe(62.25);
    expect(stopped.execution_warnings?.[0]).toContain(
      'does not establish successful in-budget execution',
    );
    expect((await getRealTask(task.id))?.execution_warnings).toEqual(stopped.execution_warnings);
  });
  it('rejects over-budget completion while admitting only five seconds of noncompleted cleanup', async () => {
    const task = await submit('REAL_RUN');
    await expect(
      receiveRealResult(
        task.id,
        result(task, 'completed', 'REAL_RUN', {
          resources: { wall_seconds: 60.01, cpu_seconds: 0, peak_job_bytes: 0 },
        }),
      ),
    ).rejects.toThrow('budget');
    await expect(
      receiveRealResult(
        task.id,
        result(task, 'interrupted', 'REAL_RUN', {
          resources: { wall_seconds: 65.01, cpu_seconds: 0, peak_job_bytes: 0 },
        }),
      ),
    ).rejects.toThrow();
    expect((await getRealTask(task.id))?.status).toBe('queued');
  });
  it('persists cancellation intent and uncertainty without claiming cancellation or starting another task', async () => {
    const task = await submit();
    await expect(
      cancelRealTask(task.id, async () => {
        throw new Error('contract timeout');
      }),
    ).rejects.toThrow('Cancellation outcome uncertain');
    const current = await getRealTask(task.id);
    expect(current?.status).toBe('queued');
    expect(current?.events.slice(-2).map((e) => e.kind)).toEqual([
      'cancellation_requested',
      'cancellation_outcome_uncertain',
    ]);
  });
  it('keeps concurrent terminal receipt when cancellation returns stale running state', async () => {
    const task = await submit('REAL_RUN');
    const current = await cancelRealTask(task.id, async () => {
      await receiveRealResult(task.id, result(task, 'completed', 'REAL_RUN'));
      return Response.json(result(task, 'running', 'REAL_RUN'));
    });
    expect(current.status).toBe('completed');
    expect(current.events.some((e) => e.kind === 'cancellation_requested')).toBe(true);
    expect((await getRealTask(task.id))?.status).toBe('completed');
  });
  it('recovers legacy problem alias input with canonical engine task and unchanged pinned context', async () => {
    const problem = getProblem(input.problem_id)!;
    const legacy = problem.aliases.find((alias) => alias.startsWith('fc-'))!;
    const task = await submitRealTask(
      { ...input, problem_id: legacy },
      'v04-alias-recovery-0001',
      async () => {
        throw new Error('unknown submission');
      },
    );
    expect(task.problem_id).toBe(problem.id);
    expect(task.input.problem_id).toBe(legacy);
    const context = JSON.stringify(task.context);
    const recovered = await reconcileRealTask(task.id, async () => Response.json(result(task)));
    expect(recovered.problem_id).toBe(problem.id);
    expect(JSON.stringify(recovered.context)).toBe(context);
  });
  it('rejects changed narrative, kind or URLs outside the authentic signed receipt', async () => {
    const task = await submit('REAL_RUN');
    const signed = result(task, 'completed', 'REAL_RUN', {
      attempts: [
        {
          kind: 'partial_result',
          result: 'CONTRACT_TEST authentic narrative',
          verification_status: 'unverified',
          artifact_urls: [],
        },
      ],
    });
    const authentic = {
      kind: 'partial_result',
      result: 'CONTRACT_TEST authentic narrative',
      verification_status: 'unverified',
      artifact_urls: [] as string[],
    };
    for (const changed of [
      { ...authentic, result: 'FORGED claim of proof' },
      { ...authentic, kind: 'candidate_proof' },
      { ...authentic, artifact_urls: ['https://example.com/forged'] },
    ])
      await expect(receiveRealResult(task.id, { ...signed, attempts: [changed] })).rejects.toThrow(
        'narrative binding',
      );
    const reordered = {
      artifact_urls: [],
      verification_status: 'unverified',
      result: authentic.result,
      kind: 'partial_result',
    };
    const accepted = await receiveRealResult(task.id, { ...signed, attempts: [reordered] });
    expect(accepted.status).toBe('completed');
    expect(accepted.attempts[0].result).toBe(authentic.result);
  });
});
