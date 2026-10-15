import { TaskRequestSchema } from '@/lib/research-contract';
import { mockResearch } from '@/lib/mock-research';
import { getProblem } from '@/lib/catalog';
import { api, body, HttpError, json, localOnly } from '@/lib/api';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  return api(async () => {
    localOnly(request);
    return json(await mockResearch.submit(TaskRequestSchema.parse(await body(request))), 201);
  });
}
export async function GET(request: Request) {
  return api(async () => {
    localOnly(request);
    const id = new URL(request.url).searchParams.get('problem_id');
    if (!id) throw new HttpError(400, 'problem_id is required');
    const p = getProblem(id);
    if (!p) throw new HttpError(404, 'Unknown problem');
    return json({ api_version: 'v1', is_mock: true, tasks: await mockResearch.list(p.id) });
  });
}
