import { mkdir, readFile, readdir, rename, writeFile, open, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { z } from 'zod';
import { getProblem } from './catalog';
import {
  TaskSchema,
  TaskRequestSchema,
  ResultSchema,
  type ResearchAdapter,
  type ResearchTask,
} from './research-contract';

// Runtime journals are workspace-local state, never files to include in a build trace.
function directory() {
  return path.resolve(/* turbopackIgnore: true */ process.env.CONJMAP_TASK_DIR ?? '.local/tasks');
}
function file(id: string) {
  return path.join(directory(), `${z.uuid().parse(id)}.json`);
}
const missing = (error: unknown) => (error as NodeJS.ErrnoException).code === 'ENOENT';
export class ConflictError extends Error {}
async function save(task: ResearchTask) {
  const temporary = `${file(task.id)}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(TaskSchema.parse(task), null, 2), 'utf8');
  await rename(temporary, file(task.id));
}
// Filesystem lock serializes callbacks across Next.js workers and processes.
// Crash leaves a lock for explicit operator review; never silently overwrite evidence.
async function withLock<T>(id: string, fn: () => Promise<T>): Promise<T> {
  const lock = `${file(id)}.lock`;
  let handle;
  try {
    handle = await open(lock, 'wx');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST')
      throw new ConflictError('Task is being updated; retry later');
    throw error;
  }
  try {
    return await fn();
  } finally {
    await handle.close();
    await unlink(lock);
  }
}
export const mockResearch: ResearchAdapter = {
  async submit(input) {
    const data = TaskRequestSchema.parse(input);
    if (!getProblem(data.problem_id)) throw new RangeError('Unknown problem');
    const now = new Date().toISOString();
    const task: ResearchTask = {
      ...data,
      id: randomUUID(),
      problem_id: getProblem(data.problem_id)!.id,
      is_mock: true,
      status: 'queued',
      created_at: now,
      updated_at: now,
      attempts: [],
    };
    await mkdir(directory(), { recursive: true });
    await save(task);
    return task;
  },
  async get(id) {
    try {
      return TaskSchema.parse(JSON.parse(await readFile(file(id), 'utf8')));
    } catch (error) {
      if (missing(error)) return null;
      throw error;
    }
  },
  async list(problemId) {
    let names: string[];
    try {
      names = await readdir(/* turbopackIgnore: true */ directory());
    } catch (error) {
      if (missing(error)) return [];
      throw error;
    }
    const tasks = await Promise.all(
      names
        .filter((n) => /^[0-9a-f-]{36}\.json$/.test(n))
        .map((n) => mockResearch.get(n.slice(0, -5))),
    );
    return tasks
      .filter(
        (t): t is ResearchTask =>
          t !== null && (getProblem(t.problem_id)?.id ?? t.problem_id) === problemId,
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async receive(id, input) {
    const data = ResultSchema.parse(input);
    // Check existence before acquiring a lock (the journal may not exist yet).
    if (!(await mockResearch.get(id))) return null;
    return withLock(id, async () => {
      const task = await mockResearch.get(id);
      if (!task) return null;
      if (task.status !== 'queued')
        throw new ConflictError('Task is already completed; evidence cannot be overwritten');
      const now = new Date().toISOString();
      const next: ResearchTask = {
        ...task,
        status: 'completed',
        updated_at: now,
        attempts: data.attempts.map((a) => ({
          ...a,
          problem_id: task.problem_id,
          run_id: task.id,
          timestamp: now,
        })),
      };
      await save(next);
      return next;
    });
  },
};
export const demoResult = {
  api_version: 'v1' as const,
  engine: 'mock-mathforge' as const,
  is_mock: true as const,
  attempts: [
    {
      engine: 'mock-mathforge' as const,
      is_mock: true as const,
      kind: 'failed_route' as const,
      verification_status: 'unverified' as const,
      hypothesis: '[MOCK] Exercise the failure-record contract.',
      method: '[MOCK] Deterministic adapter fixture; no mathematical computation.',
      result: '[MOCK] This route is a demonstration dead end. No research was performed.',
      artifact_urls: [],
    },
    {
      engine: 'mock-mathforge' as const,
      is_mock: true as const,
      kind: 'candidate_proof' as const,
      verification_status: 'unverified' as const,
      hypothesis: '[MOCK] Exercise the candidate-proof display contract.',
      method: '[MOCK] Placeholder candidate, with no mathematical argument.',
      result:
        '[MOCK] Unverified candidate placeholder. This is not a proof or mathematical progress.',
      artifact_urls: [],
    },
  ],
};
