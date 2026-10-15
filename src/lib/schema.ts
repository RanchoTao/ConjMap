import { z } from 'zod';

export const safeUrl = z
  .string()
  .url()
  .refine(
    (value) => ['https:', 'http:'].includes(new URL(value).protocol),
    'Only http(s) evidence URLs allowed',
  );
const date = z.iso.date();
export const reviewStatus = z.enum(['unverified', 'reviewed', 'rejected']);
export const problemStatus = z.enum([
  'open',
  'partially_resolved',
  'solved',
  'disputed',
  'unknown',
]);
export const relationshipTypes = [
  'implies',
  'equivalent',
  'generalizes',
  'special_case_of',
  'depends_on',
  'related_to',
  'open_case_of',
  'counterexample_to',
] as const;
export const ProblemSchema = z
  .object({
    id: z.string().regex(/^(?:fc-[a-z0-9-]+|cm-\d{6})$/),
    title: z.string().min(3),
    source_title: z.string(),
    statement: z.string().min(30),
    latex: z.string().nullable(),
    formal_statement: z.string().min(1),
    field: z.string().min(2),
    MSC: z.array(z.string().regex(/^\d{2}(?:[A-Z]\d{2})?$/)).min(1),
    status: problemStatus,
    status_evidence: z
      .array(
        z
          .object({
            url: safeUrl,
            accessed_at: date,
            claim: z.string().min(10),
            review_status: reviewStatus,
          })
          .strict(),
      )
      .min(1),
    source_urls: z.array(safeUrl).min(1),
    references: z.array(z.object({ title: z.string(), url: safeUrl }).strict()).min(1),
    proposed_by: z.string().nullable(),
    proposed_year: z.number().int().min(1).max(2100).nullable(),
    last_verified: date.nullable(),
    difficulty_estimate: z.string().nullable(),
    review_status: reviewStatus,
    aliases: z.array(z.string()),
    source_mappings: z
      .array(z.object({ source_id: z.string(), external_id: z.string(), url: safeUrl }).strict())
      .min(1),
    provenance: z
      .object({
        source_id: z.literal('formal-conjectures'),
        revision: z.string().regex(/^[a-f0-9]{40}$/),
        path: z.string().regex(/^FormalConjectures\/[A-Za-z0-9_/-]+\.lean$/),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
        retrieved_at: date,
        license: z.literal('Apache-2.0'),
        extraction: z.string(),
        source_reported_status: z.literal('open'),
        start_line: z.number().int().positive(),
        end_line: z.number().int().positive(),
      })
      .strict(),
  })
  .strict()
  .superRefine((row, ctx) => {
    if (
      row.status !== 'unknown' &&
      (row.review_status !== 'reviewed' ||
        !row.last_verified ||
        !row.status_evidence.some((e) => e.review_status === 'reviewed'))
    )
      ctx.addIssue({
        code: 'custom',
        message: 'A mathematical status requires a dated independent evidence review',
      });
    if (row.review_status === 'unverified' && row.last_verified !== null)
      ctx.addIssue({ code: 'custom', message: 'Retrieval is not verification' });
    if (row.provenance.end_line < row.provenance.start_line)
      ctx.addIssue({ code: 'custom', message: 'Invalid source span' });
  });
export type Problem = z.infer<typeof ProblemSchema>;
export const RelationshipSchema = z
  .object({
    source_id: z.string(),
    target_id: z.string(),
    type: z.enum(relationshipTypes),
    evidence_url: safeUrl,
    evidence_urls: z.array(safeUrl).min(1),
    review_status: reviewStatus,
    review_date: date.nullable(),
    basis: z.string().min(20),
  })
  .strict()
  .superRefine((row, ctx) => {
    if (row.source_id === row.target_id)
      ctx.addIssue({ code: 'custom', message: 'Self relationships are not allowed' });
    if (row.review_status === 'reviewed' && !row.review_date)
      ctx.addIssue({ code: 'custom', message: 'Reviewed edges require a date' });
  });
export type Relationship = z.infer<typeof RelationshipSchema>;
export const ResearchAttemptSchema = z
  .object({
    problem_id: z.string(),
    engine: z.literal('mock-mathforge'),
    run_id: z.uuid(),
    timestamp: z.iso.datetime(),
    hypothesis: z.string().min(1).max(4000),
    method: z.string().min(1).max(4000),
    result: z.string().min(1).max(12000),
    verification_status: z.literal('unverified'),
    artifact_urls: z.array(safeUrl).max(20),
    kind: z.enum(['failed_route', 'candidate_proof']),
    is_mock: z.literal(true),
  })
  .strict();
export type ResearchAttempt = z.infer<typeof ResearchAttemptSchema>;

export function validateCatalog(input: unknown, edges: unknown) {
  const problems = z.array(ProblemSchema).parse(input);
  const relationships = z.array(RelationshipSchema).parse(edges);
  const ids = new Set<string>(),
    statements = new Set<string>(),
    mappings = new Set<string>();
  for (const p of problems) {
    if (ids.has(p.id)) throw new Error(`Duplicate canonical ID: ${p.id}`);
    ids.add(p.id);
    const fingerprint = p.statement
      .normalize('NFKC')
      .replace(/\s+/g, ' ')
      .trim()
      .toLocaleLowerCase('en');
    if (statements.has(fingerprint)) throw new Error(`Duplicate statement: ${p.id}`);
    statements.add(fingerprint);
    for (const m of p.source_mappings) {
      const key = `${m.source_id}:${m.external_id}`;
      if (mappings.has(key)) throw new Error(`Duplicate source mapping: ${key}`);
      mappings.add(key);
    }
  }
  const uniqueEdges = new Set<string>();
  for (const r of relationships) {
    if (!ids.has(r.source_id) || !ids.has(r.target_id)) throw new Error('Dangling relationship');
    const pair = ['related_to', 'equivalent'].includes(r.type)
      ? [r.source_id, r.target_id].sort()
      : [r.source_id, r.target_id];
    const key = `${pair.join(':')}:${r.type}`;
    if (uniqueEdges.has(key)) throw new Error('Duplicate relationship');
    uniqueEdges.add(key);
  }
  return { problems, relationships };
}
