import { api, json, localOnly } from '@/lib/api';
import { authenticate, cancelRealTask } from '@/lib/real-research';
export const runtime = 'nodejs';
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return api(async () => {
    localOnly(request);
    authenticate(request);
    return json(await cancelRealTask((await params).id));
  });
}
