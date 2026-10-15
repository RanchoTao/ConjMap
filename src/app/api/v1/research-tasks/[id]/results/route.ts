import { ResultSchema } from '@/lib/research-contract';
import { mockResearch } from '@/lib/mock-research';
import { api, body, json, localOnly } from '@/lib/api';
export const runtime = 'nodejs';
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return api(async () => {
    localOnly(request);
    const { id } = await params;
    const result = ResultSchema.parse(await body(request));
    const task = await mockResearch.receive(id, result);
    return task ? json(task) : json({ error: 'Task not found' }, 404);
  });
}
