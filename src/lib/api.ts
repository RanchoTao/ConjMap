import { z } from 'zod';
import { ConflictError } from './mock-research';
import { RealBoundaryError } from './real-research';
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
export function localOnly(request: Request) {
  const host = request.headers.get('host');
  if (!host) throw new HttpError(403, 'Loopback host required');
  let parsed: URL;
  try {
    parsed = new URL(`http://${host}`);
  } catch {
    throw new HttpError(403, 'Invalid host');
  }
  if (!['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname))
    throw new HttpError(403, 'Local adapter accepts loopback requests only');
  const origin = request.headers.get('origin');
  if (origin) {
    let source: URL;
    try {
      source = new URL(origin);
    } catch {
      throw new HttpError(403, 'Invalid origin');
    }
    if (source.host !== host || !['http:', 'https:'].includes(source.protocol))
      throw new HttpError(403, 'Cross-origin access rejected');
  }
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    throw new HttpError(403, 'Cross-site access rejected');
}
export async function body(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new HttpError(415, 'Expected application/json');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'JSON body required');
  const decoder = new TextDecoder();
  let text = '',
    size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 65536) {
        await reader.cancel();
        throw new HttpError(413, 'Body exceeds 64 KiB');
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    try {
      return JSON.parse(text);
    } catch {
      throw new HttpError(400, 'Malformed JSON');
    }
  } finally {
    reader.releaseLock();
  }
}
export async function api(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    if (error instanceof RealBoundaryError) return json({ error: error.message }, error.status);
    if (error instanceof z.ZodError)
      return json(
        {
          error: 'Contract validation failed',
          issues: error.issues.map((i) => ({ path: i.path, message: i.message })),
        },
        400,
      );
    if (error instanceof RangeError) return json({ error: error.message }, 404);
    if (error instanceof ConflictError) return json({ error: error.message }, 409);
    console.error('Local research journal operation failed');
    return json(
      { error: 'Local journal unavailable. Inspect the server and task directory.' },
      500,
    );
  }
}
