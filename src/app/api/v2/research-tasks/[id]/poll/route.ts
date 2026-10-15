import { api, json, localOnly } from '@/lib/api';
import { authenticate, pollRealTask } from '@/lib/real-research';
export const runtime = 'nodejs';
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return api(async () => {
    localOnly(request);
    authenticate(request);
    return json(await pollRealTask((await params).id));
  });
}
