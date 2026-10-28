import { api, json, localOnly } from '@/lib/api';
import { authenticate, reconcileRealTask } from '@/lib/real-research';
export const runtime = 'nodejs';
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return api(async () => {
    localOnly(request);
    authenticate(request);
    return json(await reconcileRealTask((await params).id));
  });
}
