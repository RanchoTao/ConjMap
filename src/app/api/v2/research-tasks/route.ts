import { api, body, json, localOnly } from '@/lib/api';
import { authenticate, configuration, listRealTasks, submitRealTask } from '@/lib/real-research';
import { getProblem } from '@/lib/catalog';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  return api(async () => {
    localOnly(request);
    if (configuration().ready) authenticate(request);
    const task = await submitRealTask(
      await body(request),
      request.headers.get('idempotency-key') ?? '',
    );
    return json(task, task.status === 'blocked' ? 202 : 201);
  });
}
export async function GET(request: Request) {
  return api(async () => {
    localOnly(request);
    if (configuration().ready) authenticate(request);
    const id = new URL(request.url).searchParams.get('problem_id');
    const problem = id ? getProblem(id) : null;
    return problem
      ? json({
          api_version: 'v2',
          engine: 'mathforge',
          is_mock: false,
          configuration: configuration().ready ? 'configured' : 'blocked',
          tasks: await listRealTasks(problem.id),
        })
      : json({ error: 'Known problem_id required' }, 400);
  });
}
