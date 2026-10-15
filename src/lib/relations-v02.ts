import { z } from 'zod';
import { safeUrl, relationshipTypes } from './schema';
export const layers = ['navigation', 'logic', 'special_cases', 'research_evidence'] as const;
export const SubstantiveRelationSchema = z
  .object({
    id: z.string(),
    source_id: z.string(),
    target_id: z.string(),
    type: z.enum(relationshipTypes),
    layer: z.enum(layers),
    hypotheses: z.array(z.string()).min(1),
    scope: z.string().min(20),
    evidence_url: safeUrl,
    source_revision: z.string().min(1),
    locator: z.string().min(1),
    review_date: z.iso.date(),
    review_status: z.enum(['unverified', 'source_reviewed', 'verified', 'rejected']),
    reviewer: z.string(),
    proof_receipt: safeUrl.nullable(),
    human_approval: z.enum(['pending', 'approved', 'rejected']),
    is_candidate: z.boolean(),
  })
  .strict()
  .superRefine((r, ctx) => {
    if (r.source_id === r.target_id) ctx.addIssue({ code: 'custom', message: 'Self relation' });
    if (
      r.review_status === 'verified' &&
      (!r.proof_receipt || r.human_approval !== 'approved' || r.is_candidate)
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Verified layer requires scoped proof receipt and approved independent review',
      });
  });
export type SubstantiveRelation = z.infer<typeof SubstantiveRelationSchema>;
export function selectRelations(
  rows: SubstantiveRelation[],
  layer: string,
  showCandidates: boolean,
) {
  return rows.filter(
    (r) =>
      r.layer === layer &&
      (r.review_status === 'verified' || (showCandidates && r.review_status !== 'rejected')),
  );
}
