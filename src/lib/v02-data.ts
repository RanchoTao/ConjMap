import { z } from 'zod';
import dossiers from '../../data/v02/dossiers.json';
import reviewEvents from '../../data/v02/review-events.json';
import rawRelations from '../../data/v02/relations.json';
import claims from '../../data/v02/claims.json';
import rawSources from '../../data/v02/source-records.json';
import { replayReviews, EvidenceReviewSchema } from './evidence';
import { SubstantiveRelationSchema } from './relations-v02';
import { safeUrl } from './schema';

export const reviews = replayReviews(z.array(EvidenceReviewSchema).parse(reviewEvents));
export const substantiveRelations = z.array(SubstantiveRelationSchema).parse(rawRelations);
export const sourceRecords = z
  .array(
    z
      .object({
        id: z.string(),
        legacy_problem_id: z.string(),
        external_id: z.string(),
        source_id: z.literal('erdos-community'),
        revision: z.string().regex(/^[a-f0-9]{40}$/),
        url: safeUrl,
        original_url: safeUrl,
        retrieved_at: z.iso.date(),
        source_sha256: z.string().regex(/^[a-f0-9]{64}$/),
        record_sha256: z.string().regex(/^[a-f0-9]{64}$/),
        rights: z.object({
          metadata: z.literal('Apache-2.0'),
          statement_text: z.literal('not_imported'),
          linked_material: z.literal('original_terms'),
        }),
        attribution: z.string(),
        raw_metadata: z.record(z.string(), z.unknown()),
        review_status: z.literal('unverified'),
        status_scope: z.string(),
      })
      .strict(),
  )
  .parse(rawSources);
export { dossiers, claims };
