import { z } from 'zod';
import { safeUrl } from './schema';
export const dimensions = [
  'SOURCE_IMPORTED',
  'STATEMENT_CHECKED',
  'LITERATURE_REVIEWED',
  'MATHEMATICAL_RELATION_VERIFIED',
  'FORMAL_STATEMENT_CHECKED',
  'PROOF_KERNEL_VERIFIED',
  'HUMAN_REVIEW_PENDING',
] as const;
export const EvidenceReviewSchema = z
  .object({
    id: z.string(),
    problem_id: z.string(),
    version: z.number().int().positive(),
    supersedes: z.string().nullable(),
    reviewer: z.string(),
    method: z.enum([
      'source_transcription',
      'agent_source_review',
      'expert_review',
      'kernel_receipt',
    ]),
    human_approval: z.enum(['pending', 'approved', 'rejected']),
    approval_receipt: safeUrl.nullable(),
    reviewed_at: z.iso.date(),
    dimensions: z.record(
      z.enum(dimensions),
      z.enum(['established', 'pending', 'not_run', 'revoked']),
    ),
    source_urls: z.array(safeUrl).min(1),
    scope: z.string().min(20),
    limitations: z.array(z.string()).min(1),
    status_recommendation: z.enum(['unknown', 'open', 'partially_resolved', 'solved', 'disputed']),
    statement_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export type EvidenceReview = z.infer<typeof EvidenceReviewSchema>;
// A research attempt is never an authority for a catalog status transition.
export function authorizeStatusChange(input: {
  status: string;
  origin: 'research_result' | 'evidence_review';
  review?: EvidenceReview;
}) {
  if (input.origin === 'research_result')
    throw new Error('Research results cannot update mathematical status');
  const r = input.review ? EvidenceReviewSchema.parse(input.review) : null;
  if (
    !r ||
    r.method !== 'expert_review' ||
    r.human_approval !== 'approved' ||
    !r.approval_receipt ||
    r.dimensions.STATEMENT_CHECKED !== 'established' ||
    r.dimensions.LITERATURE_REVIEWED !== 'established'
  )
    throw new Error('Independent evidence and explicit expert approval required');
  if (input.status !== r.status_recommendation)
    throw new Error('Review scope does not authorize this status');
  return true;
}
export function replayReviews(events: EvidenceReview[]) {
  const ids = new Set<string>(),
    latest = new Map<string, EvidenceReview>();
  for (const value of events) {
    const row = EvidenceReviewSchema.parse(value);
    if (ids.has(row.id)) throw new Error('Duplicate review event');
    const old = latest.get(row.problem_id);
    if (
      old
        ? row.supersedes !== old.id || row.version !== old.version + 1
        : row.supersedes !== null || row.version !== 1
    )
      throw new Error('Broken review history');
    ids.add(row.id);
    latest.set(row.problem_id, row);
  }
  return latest;
}
