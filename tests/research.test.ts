import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mockResearch, demoResult } from '../src/lib/mock-research';
import { problems } from '../src/lib/catalog';
import { TaskRequestSchema, ResultSchema } from '../src/lib/research-contract';
import { body, localOnly } from '../src/lib/api';
let directory: string;
const input = {
  api_version: 'v1' as const,
  engine: 'mock-mathforge' as const,
  problem_id: problems[0].id,
  objective: 'Test the independent adapter contract.',
};
beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'conjmap-test-'));
  process.env.CONJMAP_TASK_DIR = directory;
});
afterEach(async () => {
  delete process.env.CONJMAP_TASK_DIR;
  await rm(directory, { recursive: true, force: true });
});
describe('versioned local adapter', () => {
  it('persists queued tasks and reads without implicit progress', async () => {
    const task = await mockResearch.submit(input);
    expect(task.is_mock).toBe(true);
    expect(task.attempts).toEqual([]);
    expect(await mockResearch.get(task.id)).toEqual(task);
    expect(JSON.parse(await readFile(path.join(directory, `${task.id}.json`), 'utf8'))).toEqual(
      task,
    );
    expect(await mockResearch.list(input.problem_id)).toHaveLength(1);
  });
  it('reads saved tasks from a fresh Node process', async () => {
    const task = await mockResearch.submit(input);
    const code =
      "import {mockResearch} from './src/lib/mock-research.ts'; console.log(JSON.stringify(await mockResearch.get(process.env.CONJMAP_CHECK_TASK)));";
    const output = execFileSync(
      process.execPath,
      ['--import', 'tsx', '--input-type=module', '-e', code],
      { encoding: 'utf8', timeout: 10000, env: { ...process.env, CONJMAP_CHECK_TASK: task.id } },
    );
    expect(JSON.parse(output)).toEqual(task);
  });
  it('receives failed routes and candidate proofs as unverified mock evidence only', async () => {
    const task = await mockResearch.submit(input);
    const result = await mockResearch.receive(task.id, demoResult);
    expect(result?.status).toBe('completed');
    expect(result?.attempts.map((a) => a.kind)).toEqual(['failed_route', 'candidate_proof']);
    expect(result?.attempts.every((a) => a.is_mock && a.verification_status === 'unverified')).toBe(
      true,
    );
    expect(await mockResearch.get(task.id)).toEqual(result);
    expect(problems[0].status).toBe('unknown');
  });
  it('does not overwrite completed evidence on replay', async () => {
    const task = await mockResearch.submit(input);
    await mockResearch.receive(task.id, demoResult);
    await expect(mockResearch.receive(task.id, demoResult)).rejects.toThrow('already completed');
  });
  it('serializes competing callbacks; exactly one result is accepted', async () => {
    const task = await mockResearch.submit(input);
    const results = await Promise.allSettled([
      mockResearch.receive(task.id, demoResult),
      mockResearch.receive(task.id, demoResult),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect((await mockResearch.get(task.id))?.attempts).toHaveLength(2);
  });
  it('rejects unknown problems, path traversal, real engines and fake verification', async () => {
    await expect(mockResearch.submit({ ...input, problem_id: 'missing' })).rejects.toThrow(
      'Unknown',
    );
    await expect(mockResearch.get('../secret')).rejects.toThrow();
    expect(TaskRequestSchema.safeParse({ ...input, engine: 'real-mathforge' }).success).toBe(false);
    expect(ResultSchema.safeParse({ ...demoResult, is_mock: false }).success).toBe(false);
    expect(
      ResultSchema.safeParse({
        ...demoResult,
        attempts: [{ ...demoResult.attempts[0], verification_status: 'verified' }],
      }).success,
    ).toBe(false);
  });
  it('reports missing tasks without inventing a run', async () => {
    expect(await mockResearch.get(randomUUID())).toBeNull();
    expect(await mockResearch.list('missing')).toEqual([]);
  });
});
describe('local API boundary', () => {
  it('accepts loopback same-origin callers and refuses cross-site or remote hosts', () => {
    expect(() =>
      localOnly(
        new Request('http://localhost:3000', {
          headers: { host: 'localhost:3000', origin: 'http://localhost:3000' },
        }),
      ),
    ).not.toThrow();
    const cases: Record<string, string>[] = [
      { host: 'evil.example' },
      { host: 'localhost:3000', origin: 'https://evil.example' },
      { host: 'localhost:3000', 'sec-fetch-site': 'cross-site' },
      { host: 'localhost:3000', origin: 'null' },
    ];
    for (const headers of cases)
      expect(() => localOnly(new Request('http://localhost:3000', { headers }))).toThrow();
  });
  it('validates JSON, type and bounded request size', async () => {
    await expect(
      body(new Request('http://localhost', { method: 'POST', body: 'no' })),
    ).rejects.toThrow('application/json');
    await expect(
      body(
        new Request('http://localhost', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '{',
        }),
      ),
    ).rejects.toThrow('Malformed');
    await expect(
      body(
        new Request('http://localhost', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ data: 'x'.repeat(65536) }),
        }),
      ),
    ).rejects.toThrow('64 KiB');
  });
});
