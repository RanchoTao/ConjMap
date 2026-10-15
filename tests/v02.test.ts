import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST as submitRoute } from '../src/app/api/v2/research-tasks/route';
import { POST as callbackRoute } from '../src/app/api/v2/research-tasks/[id]/results/route';
import { POST as pollRoute } from '../src/app/api/v2/research-tasks/[id]/poll/route';
import { createHmac } from 'node:crypto';
import { mkdtemp, rm, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { problems, getProblem } from '../src/lib/catalog';
import {
  sourceRecords,
  claims,
  dossiers,
  reviews,
  substantiveRelations,
} from '../src/lib/v02-data';
import { duplicateCandidates, normalize, validateDecisions } from '../src/lib/dedup';
import { authorizeStatusChange, replayReviews } from '../src/lib/evidence';
import { SubstantiveRelationSchema, selectRelations } from '../src/lib/relations-v02';
import {
  authenticate,
  configuration,
  getRealTask,
  listRealTasks,
  pollRealTask,
  RealResultSchema,
  receiveRealResult,
  submitRealTask,
  verifyCallback,
} from '../src/lib/real-research';

describe('V0.2 catalog and evidence', () => {
  it('keeps all 120 problems and old URLs while integrating 32 observations without duplicate counts', () => {
    expect(problems).toHaveLength(120);
    expect(sourceRecords).toHaveLength(32);
    expect(problems.every((p) => p.id.startsWith('cm-'))).toBe(true);
    expect(getProblem('fc-millennium-riemannhypothesis')?.title).toBe('Riemann hypothesis');
    for (const row of sourceRecords)
      expect(
        getProblem(row.legacy_problem_id)?.source_mappings.some(
          (m) => m.source_id === 'erdos-community' && m.external_id === row.external_id,
        ),
      ).toBe(true);
  });
  it('separates metadata and linked/full-text rights', () => {
    for (const row of sourceRecords) {
      expect(row.rights.metadata).toBe('Apache-2.0');
      expect(row.rights.statement_text).toBe('not_imported');
      expect(row.review_status).toBe('unverified');
    }
  });
  it('preserves 30 partial dossiers and distinct evidence dimensions without fake expert clearance', () => {
    expect(dossiers).toHaveLength(30);
    expect(reviews.size).toBe(30);
    for (const r of reviews.values()) {
      expect(r.human_approval).toBe('pending');
      expect(r.dimensions.PROOF_KERNEL_VERIFIED).toBe('not_run');
      expect(() =>
        authorizeStatusChange({ status: 'solved', origin: 'evidence_review', review: r }),
      ).toThrow();
    }
  });
  it('never permits an unverified AI result or a completed real process to set any mathematical status', () => {
    for (const status of ['solved', 'open', 'disputed'])
      expect(() => authorizeStatusChange({ status, origin: 'research_result' })).toThrow(
        'cannot update',
      );
    expect(
      RealResultSchema.safeParse({
        engine: 'mathforge',
        is_mock: false,
        status: 'solved',
        engine_task_id: 'a',
        attempts: [],
      }).success,
    ).toBe(false);
  });
  it('allows revocation via a new bound review version, not history overwrite', () => {
    const first = [...reviews.values()][0];
    const revoked = {
      ...first,
      id: first.id + '-revoke',
      version: 2,
      supersedes: first.id,
      dimensions: { ...first.dimensions, SOURCE_IMPORTED: 'revoked' as const },
    };
    expect(replayReviews([first, revoked]).get(first.problem_id)?.version).toBe(2);
    expect(() => replayReviews([first, { ...revoked, supersedes: null }])).toThrow();
    expect(() => replayReviews([first, first])).toThrow();
  });
  it('keeps all 12 mathematical candidates out of verified layers', () => {
    expect(claims).toHaveLength(12);
    expect(substantiveRelations).toHaveLength(12);
    for (const layer of ['logic', 'special_cases']) {
      expect(selectRelations(substantiveRelations, layer, false)).toHaveLength(0);
      expect(selectRelations(substantiveRelations, layer, true).length).toBeGreaterThan(0);
    }
    expect(
      SubstantiveRelationSchema.safeParse({ ...substantiveRelations[0], review_status: 'verified' })
        .success,
    ).toBe(false);
  });
  it('distinguishes exact, near and candidate-equivalence records without automatic merge', () => {
    const p = problems[0];
    expect(normalize(' Ａ  b ')).toBe('a b');
    expect(duplicateCandidates([p, { ...p, id: 'cm-999998' }])[0].kind).toBe('exact_duplicate');
    const near = {
      ...p,
      id: 'cm-999998',
      statement: p.statement + ' Another restriction.',
      source_mappings: [],
    };
    expect(duplicateCandidates([p, near])[0].kind).toBe('near_duplicate');
    const a = {
      ...p,
      title: 'First',
      statement: 'alpha beta gamma delta',
      formal_statement: '∀ ∃ ℝ',
      source_mappings: [],
    };
    const b = {
      ...p,
      id: 'cm-999998',
      title: 'Second',
      statement: 'alpha beta epsilon zeta',
      formal_statement: '∀ ∃ ℝ',
      source_mappings: [],
    };
    expect(duplicateCandidates([a, b])[0]).toMatchObject({
      kind: 'candidate_equivalence',
      auto_merge: false,
      review_status: 'unverified',
    });
  });
  it('rejects forked dedup approval chains and permits linear supersession', () => {
    const first = {
      id: 'decision-a',
      candidate_id: 'candidate-1',
      action: 'keep_separate' as const,
      supersedes: null,
      reviewer: 'reviewer',
      reason: 'Hypotheses differ',
      source_ids: ['source-1', 'source-2'],
      differences: ['Different quantifiers'],
    };
    const second = { ...first, id: 'decision-b', supersedes: first.id };
    expect(validateDecisions([first, second])).toHaveLength(2);
    expect(() => validateDecisions([first, { ...second, supersedes: null }])).toThrow();
    expect(() =>
      validateDecisions([first, second, { ...second, id: 'decision-c', supersedes: first.id }]),
    ).toThrow();
  });
  it('requires reversible dedup decisions to preserve source identities and differences', () => {
    expect(() =>
      validateDecisions([
        {
          id: 'a',
          candidate_id: 'x',
          action: 'propose_merge',
          supersedes: null,
          reviewer: 'agent',
          reason: 'same number',
          source_ids: [],
          differences: [],
        },
      ]),
    ).toThrow();
  });
});

const keys = [
  'CONJMAP_REAL_TASK_DIR',
  'CONJMAP_MATHFORGE_URL',
  'CONJMAP_MATHFORGE_TOKEN',
  'CONJMAP_CALLBACK_SECRET',
  'CONJMAP_RESEARCH_ACCESS_TOKEN',
];
let folder: string, saved: Record<string, string | undefined>;
beforeEach(async () => {
  saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  for (const k of keys) delete process.env[k];
  folder = await mkdtemp(path.join(tmpdir(), 'conjmap-v02-'));
  process.env.CONJMAP_REAL_TASK_DIR = folder;
});
afterEach(async () => {
  vi.restoreAllMocks();
  for (const k of keys) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  await rm(folder, { recursive: true, force: true });
});
const input = {
  problem_id: 'fc-millennium-riemannhypothesis',
  objective: 'Contract test only; no mathematics executed.',
  budget: { wall_seconds: 1, max_tasks: 1, network: false },
};
function configured() {
  process.env.CONJMAP_MATHFORGE_URL = 'http://127.0.0.1:9444/v2/';
  for (const k of keys.slice(2)) process.env[k] = 'TEST-ONLY-' + k.padEnd(40, 'x');
}
const result = {
  engine: 'mathforge',
  is_mock: false,
  engine_task_id: 'CONTRACT-FIXTURE-NOT-A-REAL-RUN',
  status: 'queued',
  attempts: [],
} as const;
describe('authenticated real-adapter boundary (all transport responses are test fixtures)', () => {
  it('records blocked requests honestly without credentials or network execution', async () => {
    let called = false;
    const t = await submitRealTask(input, 'idempotency-test-001', async () => {
      called = true;
      return Response.json({});
    });
    expect(called).toBe(false);
    expect(t.status).toBe('blocked');
    expect(t.engine_task_id).toBeNull();
    expect(t.is_mock).toBe(false);
    expect(await getRealTask(t.id)).toEqual(t);
    expect((await listRealTasks(t.problem_id)).length).toBe(1);
  });
  it('packages the original statement, references and review state, and does not resubmit on idempotency replay', async () => {
    configured();
    let calls = 0;
    const transport: typeof fetch = async (_url, init) => {
      calls++;
      expect(init?.headers).toMatchObject({ 'Idempotency-Key': 'idempotency-test-002' });
      const request = JSON.parse(init?.body as string);
      expect(request.context.status).toBe('unknown');
      expect(request.context.statement).toContain('Riemann');
      return Response.json(result);
    };
    const t = await submitRealTask(input, 'idempotency-test-002', transport);
    expect(t.status).toBe('queued');
    expect((await submitRealTask(input, 'idempotency-test-002', transport)).id).toBe(t.id);
    expect(calls).toBe(1);
    await expect(
      submitRealTask(
        { ...input, objective: 'Different request' },
        'idempotency-test-002',
        transport,
      ),
    ).rejects.toThrow('conflict');
  });
  it('does not exhaust active quota on definitive engine rejections', async () => {
    configured();
    let count = 0;
    const rejected: typeof fetch = async () => {
      count++;
      return Response.json({ error: 'Invalid source admission' }, { status: 400 });
    };
    for (let i = 0; i < 4; i++) {
      const task = await submitRealTask(input, `rejected-source-000${i}`, rejected);
      expect(task.status).toBe('blocked');
      expect(task.events.some((e) => e.kind === 'engine_rejected')).toBe(true);
      expect(task.events.some((e) => e.kind === 'submission_uncertain')).toBe(false);
    }
    const accepted = await submitRealTask(input, 'admitted-source-0001', async () =>
      Response.json(result),
    );
    expect(accepted.status).toBe('queued');
    expect(count).toBe(4);
  });
  it('retains uncertain outcomes and never silently retries a possibly accepted task', async () => {
    configured();
    let calls = 0;
    const transport: typeof fetch = async () => {
      calls++;
      throw new Error('timeout');
    };
    const t = await submitRealTask(input, 'idempotency-test-003', transport);
    expect(t.status).toBe('blocked');
    await submitRealTask(input, 'idempotency-test-003', transport);
    expect(calls).toBe(1);
  });
  it('separates mock and real results, rejects forged verification and does not execute artifact URLs', () => {
    expect(RealResultSchema.safeParse({ ...result, is_mock: true }).success).toBe(false);
    expect(
      RealResultSchema.safeParse({
        ...result,
        attempts: [
          {
            kind: 'candidate_proof',
            result: 'claim',
            verification_status: 'verified',
            artifact_urls: [],
          },
        ],
      }).success,
    ).toBe(false);
    expect(
      RealResultSchema.safeParse({
        ...result,
        attempts: [
          {
            kind: 'candidate_proof',
            result: 'claim',
            verification_status: 'unverified',
            artifact_urls: ['file:///private'],
          },
        ],
      }).success,
    ).toBe(false);
  });
  it('checks bearer auth, loopback endpoint, callback signature freshness and tampering', () => {
    configured();
    expect(() => authenticate(new Request('http://localhost'))).toThrow('Unauthorized');
    expect(() =>
      authenticate(
        new Request('http://localhost', {
          headers: { authorization: `Bearer ${process.env.CONJMAP_RESEARCH_ACCESS_TOKEN}` },
        }),
      ),
    ).not.toThrow();
    process.env.CONJMAP_MATHFORGE_URL = 'https://example.com';
    expect(() => configuration()).toThrow('loopback');
    const secret = 'TEST-ONLY-CALLBACK-SECRET'.padEnd(40, 'x'),
      raw = JSON.stringify(result),
      timestamp = String(Date.now());
    const signature =
      'sha256=' + createHmac('sha256', secret).update(`${timestamp}.${raw}`).digest('hex');
    expect(() => verifyCallback(raw, timestamp, signature, secret)).not.toThrow();
    expect(() => verifyCallback(raw + ' ', timestamp, signature, secret)).toThrow();
    expect(() => verifyCallback(raw, timestamp, signature, secret, Date.now() + 400000)).toThrow();
  });
  it('binds callbacks to engine task, rejects overwrite, leaves canonical status unknown', async () => {
    configured();
    const t = await submitRealTask(input, 'idempotency-test-004', async () =>
      Response.json(result),
    );
    await expect(receiveRealResult(t.id, { ...result, engine_task_id: 'wrong' })).rejects.toThrow(
      'identity',
    );
    const updated = await receiveRealResult(t.id, {
      ...result,
      status: 'completed',
      attempts: [
        {
          kind: 'partial_result',
          result: 'TEST FIXTURE ONLY',
          verification_status: 'unverified',
          artifact_urls: [],
        },
      ],
    });
    expect(updated.attempts[0].verification_status).toBe('unverified');
    await expect(receiveRealResult(t.id, { ...result, status: 'completed' })).rejects.toThrow(
      'overwritten',
    );
    expect(getProblem(t.problem_id)?.status).toBe('unknown');
  });
  it('enforces bounded budgets and refuses a fourth active research request', async () => {
    configured();
    await expect(
      submitRealTask(
        { ...input, budget: { wall_seconds: 600, max_tasks: 1, network: false } },
        'idempotency-test-bad',
      ),
    ).rejects.toThrow();
    for (let i = 0; i < 3; i++)
      await submitRealTask(input, `idempotency-quota-${i}`, async () => Response.json(result));
    await expect(
      submitRealTask(input, 'idempotency-quota-4', async () => Response.json(result)),
    ).rejects.toThrow('quota');
  });
  it('polls without resubmission and preserves immutable prior event snapshots', async () => {
    configured();
    const task = await submitRealTask(input, 'idempotency-poll-test', async () =>
      Response.json(result),
    );
    const noChange = await pollRealTask(task.id, async (url, init) => {
      expect(String(url)).toContain(encodeURIComponent(result.engine_task_id));
      expect(init?.method).toBeUndefined();
      return Response.json(result);
    });
    expect(noChange.events).toHaveLength(2);
    const changed = await pollRealTask(task.id, async () =>
      Response.json({ ...result, status: 'running' }),
    );
    expect(changed.status).toBe('running');
    const files = await readdir(path.join(folder, 'history', task.id));
    expect(files).toHaveLength(3);
    const original = JSON.parse(
      await readFile(path.join(folder, 'history', task.id, '000001.json'), 'utf8'),
    );
    expect(original.status).toBe('submitted');
    await expect(receiveRealResult(task.id, { ...result, status: 'running' })).rejects.toThrow(
      'replay',
    );
    await expect(receiveRealResult(task.id, result)).rejects.toThrow('regression');
  });
  it('fails closed on corrupt journal records and globally conflicting idempotency keys', async () => {
    const task = await submitRealTask(input, 'idempotency-global-test');
    await expect(
      submitRealTask({ ...input, problem_id: problems[1].id }, 'idempotency-global-test'),
    ).rejects.toThrow('conflict');
    await writeFile(
      path.join(folder, `${task.id}.json`),
      JSON.stringify({ ...task, is_mock: true }),
    );
    await expect(getRealTask(task.id)).rejects.toThrow();
  });
  it('counts uncertain submissions against the active quota', async () => {
    configured();
    for (let i = 0; i < 3; i++)
      await submitRealTask(input, `uncertain-quota-test-${i}`, async () => {
        throw new Error('timeout');
      });
    await expect(
      submitRealTask(input, 'uncertain-quota-test-4', async () => Response.json(result)),
    ).rejects.toThrow('quota');
  });
  it('walks configured route authentication, engine fixture, polling and signed callback without a real research run', async () => {
    configured();
    const url = 'http://127.0.0.1/api/v2/research-tasks';
    const request = (body: unknown, extra: Record<string, string> = {}) =>
      new Request(url, {
        method: 'POST',
        headers: { host: '127.0.0.1', 'content-type': 'application/json', ...extra },
        body: JSON.stringify(body),
      });
    expect((await submitRoute(request(input))).status).toBe(401);
    const transport = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(result));
    const created = await submitRoute(
      request(input, {
        authorization: `Bearer ${process.env.CONJMAP_RESEARCH_ACCESS_TOKEN}`,
        'idempotency-key': 'route-contract-fixture-only',
      }),
    );
    expect(created.status).toBe(201);
    const task = await created.json();
    const params = { params: Promise.resolve({ id: task.id }) };
    transport.mockResolvedValueOnce(Response.json({ ...result, status: 'running' }));
    const polled = await pollRoute(
      request({}, { authorization: `Bearer ${process.env.CONJMAP_RESEARCH_ACCESS_TOKEN}` }),
      params,
    );
    expect((await polled.json()).status).toBe('running');
    const payload = { ...result, status: 'completed' },
      raw = JSON.stringify(payload),
      timestamp = String(Date.now());
    const signature =
      'sha256=' +
      createHmac('sha256', process.env.CONJMAP_CALLBACK_SECRET!)
        .update(`${timestamp}.${raw}`)
        .digest('hex');
    expect((await callbackRoute(request(payload), params)).status).toBe(401);
    expect(
      (
        await callbackRoute(
          request(payload, { 'x-conjmap-timestamp': timestamp, 'x-conjmap-signature': signature }),
          params,
        )
      ).status,
    ).toBe(200);
    expect((await getRealTask(task.id))?.status).toBe('completed');
    expect(getProblem(task.problem_id)?.status).toBe('unknown');
    expect(
      (
        await callbackRoute(
          request(payload, { 'x-conjmap-timestamp': timestamp, 'x-conjmap-signature': signature }),
          params,
        )
      ).status,
    ).toBe(409);
  });
});
