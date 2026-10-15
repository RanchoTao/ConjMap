import { mockResearch } from '@/lib/mock-research';
import { api, json, localOnly } from '@/lib/api';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return api(async () => {
    localOnly(request);
    const { id } = await params;
    const task = await mockResearch.get(id);
    return task ? json(task) : json({ error: 'Task not found' }, 404);
  });
}
