import { api, json, localOnly, HttpError } from '@/lib/api';
import { receiveRealResult, verifyCallback } from '@/lib/real-research';
export const runtime = 'nodejs';
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return api(async () => {
    localOnly(request);
    const secret = process.env.CONJMAP_CALLBACK_SECRET;
    if (!secret) throw new HttpError(503, 'Callback not configured');
    if (!request.headers.get('content-type')?.startsWith('application/json'))
      throw new HttpError(415, 'Expected JSON');
    const reader = request.body?.getReader();
    if (!reader) throw new HttpError(400, 'Body required');
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const v = await reader.read();
        if (v.done) break;
        size += v.value.byteLength;
        if (size > 65536) {
          await reader.cancel();
          throw new HttpError(413, 'Body too large');
        }
        chunks.push(v.value);
      }
    } finally {
      reader.releaseLock();
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    try {
      verifyCallback(
        raw,
        request.headers.get('x-conjmap-timestamp') ?? '',
        request.headers.get('x-conjmap-signature') ?? '',
        secret,
      );
    } catch {
      throw new HttpError(401, 'Invalid callback signature');
    }
    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch {
      throw new HttpError(400, 'Malformed JSON');
    }
    return json(await receiveRealResult((await params).id, value));
  });
}
