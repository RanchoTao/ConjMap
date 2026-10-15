import { demoResult, mockResearch } from '@/lib/mock-research';
import { api, json, localOnly } from '@/lib/api';
export const runtime = 'nodejs';
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return api(async () => {
    localOnly(request);
    const { id } = await params;
    const task = await mockResearch.receive(id, demoResult);
    return task ? json(task) : json({ error: 'Task not found' }, 404);
  });
}
