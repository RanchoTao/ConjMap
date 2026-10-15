import { z } from 'zod';
import raw from '../../data/v03/erdos-open-index.json';
import { problems } from './catalog';

export const FrontierRecordSchema = z.object({
  id: z.string().regex(/^erdos-\d+$/),
  title: z.string().min(5),
  source_id: z.literal('erdos-community'),
  external_id: z.string().regex(/^\d+$/),
  field: z.string().min(2),
  tags: z.array(z.string()),
  source_reported_status: z.literal('open'),
  source_status_updated: z.iso.date().nullable(),
  review_status: z.literal('unverified'),
  mathematical_status: z.literal('unknown'),
  record_type: z.literal('metadata_only'),
  source_url: z.url(),
  source_metadata_url: z.url(),
  source_revision: z.literal('86c3dc3e47dbdfb933c57df46705f3fe78e65cc3'),
  matched_problem_id: z.string().regex(/^cm-\d{6}$/).nullable(),
}).strict();
export type FrontierRecord = z.infer<typeof FrontierRecordSchema>;

export const frontierIndex = z.array(FrontierRecordSchema).parse(raw);
const ids = new Set<string>();
const canonical = new Set(problems.map((p) => p.id));
for (const row of frontierIndex) {
  if (ids.has(row.id)) throw new Error(`Duplicate external problem ID: ${row.id}`);
  ids.add(row.id);
  if (row.id !== `erdos-${row.external_id}`) throw new Error('Source ID mismatch');
  if (row.source_url !== `https://www.erdosproblems.com/${row.external_id}`)
    throw new Error('Source link mismatch');
  if (row.matched_problem_id && !canonical.has(row.matched_problem_id))
    throw new Error('Dangling canonical match');
}
export const frontierStats = {
  catalogProblems: problems.length,
  sourceReportedOpen: frontierIndex.length,
  matchedCanonical: frontierIndex.filter((p) => p.matched_problem_id).length,
  unmatchedCandidates: frontierIndex.filter((p) => !p.matched_problem_id).length,
  mathematicallyVerified: 0,
};
