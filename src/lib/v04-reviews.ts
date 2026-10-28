import { createHash } from 'node:crypto';
import { z } from 'zod';
import rawDossiers from '../../data/v04/dossier-reviews.json';
import rawRelations from '../../data/v04/relation-reviews.json';
import { getProblem } from './catalog';
import { safeUrl } from './schema';
import { substantiveRelations } from './v02-data';

const text = z.string().min(1);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const revision = z.string().regex(/^[a-f0-9]{40}$/);
const texts = z.array(text);
const dimension = (status: 'DONE' | 'PARTIAL' | 'NOT_RUN') =>
  z.object({ status: z.literal(status), scope: text }).strict();

export const DossierReviewSchema = z
  .object({
    id: text,
    problem_id: z.string().regex(/^cm-\d{6}$/),
    title: text,
    version: z.literal(2),
    supersedes: text,
    completion: z.literal('PARTIAL'),
    catalog_status_recommendation: z.literal('unknown'),
    original_statement_sha256: hash,
    source: z
      .object({
        repository: safeUrl,
        revision,
        path: text,
        raw_url: safeUrl,
        sha256: hash,
        license: z.literal('Apache-2.0'),
        http_status: z.literal(200),
        retrieved_byte_count: z.number().int().positive(),
        exact_local_match: z.literal(true),
        spans: z.array(z.tuple([z.number().int().positive(), z.number().int().positive()])).min(1),
      })
      .strict(),
    statement_card: z
      .object({
        domain: text,
        quantifiers: text,
        assumptions: texts.min(1),
        conclusion: text,
        parameters: text,
        failure_conditions: texts.min(1),
        formal_correspondence: text,
        proof_body: z.string().regex(/^sorry at line \d+$/),
      })
      .strict(),
    dimensions: z
      .object({
        SOURCE_VERIFIED: dimension('DONE'),
        STATEMENT_VERIFIED: dimension('DONE'),
        LITERATURE_REVIEWED: dimension('PARTIAL'),
        FORMAL_STATEMENT_CHECKED: dimension('PARTIAL'),
        PROOF_KERNEL_VERIFIED: dimension('NOT_RUN'),
        HUMAN_REVIEWED: dimension('NOT_RUN'),
        MATHEMATICALLY_VERIFIED: dimension('NOT_RUN'),
      })
      .strict(),
    primary_literature: z
      .array(
        z
          .object({
            url: safeUrl,
            version: text,
            access: text,
            locator: text,
            sha256: hash,
            http_status: z.literal(200),
            license: text.optional(),
            finding: text,
          })
          .strict(),
      )
      .min(1),
    failed_acquisitions: z
      .array(
        z
          .object({
            url: safeUrl,
            http_status: z.number().int().min(400).max(599),
            consequence: text,
          })
          .strict(),
      )
      .optional(),
    searches: texts.min(1),
    closed_obligations: texts.min(1),
    open_obligations: texts.min(1),
    agent_reasoning: z
      .object({
        kind: text,
        not_a_kernel_receipt: z.literal(true),
        steps: texts.min(1),
      })
      .strict()
      .optional(),
    source_risks: z
      .array(
        z
          .object({
            locator: text,
            issue: text,
            classification: text,
            required_action: text,
          })
          .strict(),
      )
      .optional(),
  })
  .strict()
  .superRefine((row, ctx) => {
    for (const [start, end] of row.source.spans) {
      if (end < start) ctx.addIssue({ code: 'custom', message: 'Reversed source span' });
    }
    const problem = getProblem(row.problem_id);
    if (
      !problem ||
      createHash('sha256').update(problem.statement).digest('hex') !== row.original_statement_sha256
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Dossier must bind the unchanged catalog statement',
      });
    }
  });

export const DossierReviewBundleSchema = z
  .object({
    schema_version: z.literal('1.0'),
    reviewed_at: z.iso.date(),
    date_precision: z.literal('day'),
    reviewer: z.object({ id: text, kind: z.literal('agent'), independence: text }).strict(),
    historical_input: z.object({ path: text, sha256: hash, modified: z.literal(false) }).strict(),
    scope: z
      .object({
        catalog_status_mutations: z.literal(0),
        research_runs: z.literal(0),
        kernel_runs: z.literal(0),
        human_approval_receipts: z.literal(0),
        fully_cleared: z.literal(0),
        mathematically_verified: z.literal(0),
        external_response_bodies_redistributed: z.literal(false),
        response_hash_semantics: text,
      })
      .strict(),
    reviews: z.array(DossierReviewSchema).length(3),
  })
  .strict()
  .superRefine((bundle, ctx) => {
    if (new Set(bundle.reviews.map((r) => r.problem_id)).size !== bundle.reviews.length)
      ctx.addIssue({ code: 'custom', message: 'Duplicate dossier problem' });
  });

const obligation = z
  .object({
    status: z.enum(['ANALYZED_NOT_CERTIFIED', 'NOT_APPLICABLE', 'MISSING', 'CONTRADICTED']),
    explanation: text,
    evidence_ids: texts.min(1),
  })
  .strict();
export const RelationReviewSchema = z
  .object({
    id: text,
    relation_id: text,
    version: z.literal(1),
    supersedes: z.null(),
    review_date: z.iso.date(),
    reviewer: text,
    reviewer_kind: z.literal('automated_source_and_logic_review'),
    human_approval: z.literal('pending'),
    status: z.literal('PARTIAL'),
    verified: z.literal(false),
    disposition: z.enum(['KEEP_CANDIDATE', 'CORRECTION_REQUIRED']),
    candidate_layer: z.literal(true),
    summary: text,
    original_relation: z
      .object({ source_id: text, target_id: text, type: text, layer: text })
      .strict(),
    endpoint_variants: z
      .object({
        problem_id: text,
        problem_statement: text,
        problem_formal_statement: text,
        claim_id: text,
        claim_formal_statement: text,
      })
      .strict(),
    direction: text,
    hypotheses: texts.min(1),
    evidence: z
      .array(
        z
          .object({
            id: text,
            source_path: text,
            source_sha256: hash,
            source_revision: revision,
            start_line: z.number().int().positive(),
            end_line: z.number().int().positive(),
            url: safeUrl,
            quote: text,
          })
          .strict(),
      )
      .min(1),
    obligations: z
      .object({
        model: obligation,
        parameters: obligation,
        assumptions: obligation,
        quantifiers: obligation,
        topology: obligation,
        rate: obligation,
        constants: obligation,
        limit_exchange: obligation,
      })
      .strict(),
    desk_derivation: texts.min(1),
    proof_basis: text,
    proof_kernel_status: z.literal('NOT_RUN'),
    proof_receipt: z.null(),
    mathematically_verified: z.literal(false),
    counterexample_or_variant_risk: text,
    proposed_correction: z
      .object({
        source_id: text,
        target_id: text,
        type: text,
        restriction: text.nullable(),
      })
      .strict()
      .nullable(),
    remaining_obligations: texts.min(1),
  })
  .strict()
  .superRefine((row, ctx) => {
    const original = substantiveRelations.find((r) => r.id === row.relation_id);
    if (
      !original ||
      ['source_id', 'target_id', 'type', 'layer'].some(
        (key) =>
          original[key as keyof typeof row.original_relation] !==
          row.original_relation[key as keyof typeof row.original_relation],
      )
    )
      ctx.addIssue({ code: 'custom', message: 'Relation review must retain the original edge' });
    if ((row.disposition === 'CORRECTION_REQUIRED') !== (row.proposed_correction !== null))
      ctx.addIssue({
        code: 'custom',
        message: 'Challenged relation requires an explicit correction',
      });
    const evidenceIds = new Set(row.evidence.map((e) => e.id));
    if (
      Object.values(row.obligations).some((o) => o.evidence_ids.some((id) => !evidenceIds.has(id)))
    )
      ctx.addIssue({ code: 'custom', message: 'Unknown obligation evidence ID' });
  });

export const RelationReviewBundleSchema = z
  .object({
    schema_version: z.literal('conjmap-relation-reviews/0.4'),
    review_date: z.iso.date(),
    scope: text,
    summary: z
      .object({
        reviewed: z.literal(12),
        keep_candidate: z.literal(9),
        correction_required: z.literal(3),
        verified: z.literal(0),
        proof_kernel_runs: z.literal(0),
        human_reviewed: z.literal(0),
      })
      .strict(),
    boundary: text,
    source_set: z
      .object({
        revision,
        license: z.literal('Apache-2.0'),
        original_data_unchanged: z.literal(true),
      })
      .strict(),
    external_access: z.array(
      z
        .object({
          url: safeUrl,
          accessed_at: z.iso.date(),
          access: text,
          use: text,
          independent_proof_review: z.literal(false),
        })
        .strict(),
    ),
    reviews: z.array(RelationReviewSchema).length(12),
  })
  .strict()
  .superRefine((bundle, ctx) => {
    if (
      new Set(bundle.reviews.map((r) => r.relation_id)).size !== 12 ||
      bundle.reviews.filter((r) => r.disposition === 'CORRECTION_REQUIRED').length !== 3
    )
      ctx.addIssue({ code: 'custom', message: 'Relation coverage/count mismatch' });
  });

export const dossierReviewBundle = DossierReviewBundleSchema.parse(rawDossiers);
export const relationReviewBundle = RelationReviewBundleSchema.parse(rawRelations);
export const dossierReviews = dossierReviewBundle.reviews;
export const relationReviews = relationReviewBundle.reviews;
const challengedIds = new Set(
  relationReviews.filter((r) => r.disposition === 'CORRECTION_REQUIRED').map((r) => r.relation_id),
);
// Original twelve records remain in v02-data; only the current graph projection changes.
export const activeSubstantiveRelations = substantiveRelations.filter(
  (r) => !challengedIds.has(r.id),
);
export const reviewTotals = {
  dossiers: dossierReviews.length,
  fullyCleared: 0,
  verified: 0,
  activeCandidates: activeSubstantiveRelations.length,
  challenged: challengedIds.size,
} as const;

export type PublicDossierReview = Pick<
  z.infer<typeof DossierReviewSchema>,
  'id' | 'problem_id' | 'version' | 'supersedes' | 'completion' | 'dimensions' | 'open_obligations'
>;
export type PublicRelationReview = Pick<
  z.infer<typeof RelationReviewSchema>,
  'id' | 'relation_id' | 'summary' | 'direction' | 'disposition' | 'counterexample_or_variant_risk'
>;
export function reviewPanelData(problemId: string) {
  const selected = dossierReviews.find((r) => r.problem_id === problemId);
  const dossier: PublicDossierReview | null = selected
    ? {
        id: selected.id,
        problem_id: selected.problem_id,
        version: selected.version,
        supersedes: selected.supersedes,
        completion: selected.completion,
        dimensions: selected.dimensions,
        open_obligations: selected.open_obligations,
      }
    : null;
  return {
    dossier,
    scopedProblems: dossierReviews.map((r) => ({
      problem_id: r.problem_id,
      title: getProblem(r.problem_id)!.title,
      completion: r.completion,
    })),
    relations: relationReviews
      .filter((r) => r.endpoint_variants.problem_id === problemId)
      .map((r): PublicRelationReview => ({
        id: r.id,
        relation_id: r.relation_id,
        summary: r.summary,
        direction: r.direction,
        disposition: r.disposition,
        counterexample_or_variant_risk: r.counterexample_or_variant_risk,
      })),
    totals: reviewTotals,
  };
}
export type ReviewPanelData = ReturnType<typeof reviewPanelData>;
