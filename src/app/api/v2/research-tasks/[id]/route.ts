import { api, json, localOnly } from '@/lib/api';
import { authenticate, configuration, getRealTask } from '@/lib/real-research';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return api(async () => {
    localOnly(request);
    if (configuration().ready) authenticate(request);
    const t = await getRealTask((await params).id);
    return t ? json(t) : json({ error: 'Unknown task' }, 404);
  });
}
