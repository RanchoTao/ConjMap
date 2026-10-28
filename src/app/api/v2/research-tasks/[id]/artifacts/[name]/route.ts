import { api, localOnly } from '@/lib/api';
import { authenticate, fetchRealArtifact } from '@/lib/real-research';
export const runtime = 'nodejs';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; name: string }> },
) {
  return api(async () => {
    localOnly(request);
    authenticate(request);
    const { id, name } = await params;
    const evidence = await fetchRealArtifact(id, name);
    return new Response(new Uint8Array(evidence.bytes), {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${evidence.artifact.name}"`,
        'X-Content-Type-Options': 'nosniff',
        'X-Evidence-Sha256': evidence.artifact.sha256,
      },
    });
  });
}
