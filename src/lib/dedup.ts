import type { Problem } from './schema';
export const normalize = (s: string) =>
  s.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
const words = (s: string) => new Set(normalize(s).match(/[\p{L}\p{N}]+/gu) ?? []);
function similarity(a: string, b: string) {
  const x = words(a),
    y = words(b);
  const intersection = [...x].filter((t) => y.has(t)).length;
  return intersection / (new Set([...x, ...y]).size || 1);
}
export type DuplicateCandidate = {
  source_id: string;
  target_id: string;
  kind: 'exact_duplicate' | 'near_duplicate' | 'candidate_equivalence';
  score: number;
  basis: string[];
  review_status: 'unverified';
  auto_merge: false;
};
export function duplicateCandidates(input: Problem[]): DuplicateCandidate[] {
  const result: DuplicateCandidate[] = [];
  for (let i = 0; i < input.length; i++)
    for (let j = i + 1; j < input.length; j++) {
      const a = input[i],
        b = input[j];
      const sameMapping = a.source_mappings.some((m) =>
        b.source_mappings.some(
          (n) => m.source_id === n.source_id && m.external_id === n.external_id,
        ),
      );
      const exact = normalize(a.statement) === normalize(b.statement);
      const text = similarity(a.statement, b.statement),
        title = similarity(a.title, b.title);
      const refs = a.source_urls.some((u) => b.source_urls.includes(u));
      const symbols = (s: string) => [...new Set(s.match(/[∀∃⇒↔≤≥∈ℕℝℂ∑∏]/g) ?? [])].sort().join('');
      const math = symbols(a.formal_statement);
      const sameSymbols = math.length >= 3 && math === symbols(b.formal_statement);
      const kind =
        exact || sameMapping
          ? 'exact_duplicate'
          : text >= 0.6 || title >= 0.7
            ? 'near_duplicate'
            : sameSymbols && refs && text >= 0.25
              ? 'candidate_equivalence'
              : null;
      if (kind)
        result.push({
          source_id: a.id,
          target_id: b.id,
          kind,
          score: exact || sameMapping ? 1 : Math.max(text, title),
          basis: [
            `normalized-text-jaccard:${text.toFixed(3)}`,
            `title-jaccard:${title.toFixed(3)}`,
            `shared-citation:${refs}`,
            `same-symbol-signature:${sameSymbols}`,
            `same-source-identity:${sameMapping}`,
          ],
          review_status: 'unverified',
          auto_merge: false,
        });
    }
  return result;
}
export type DedupDecision = {
  id: string;
  candidate_id: string;
  action: 'keep_separate' | 'propose_merge' | 'revoke';
  supersedes: string | null;
  reviewer: string;
  reason: string;
  source_ids: string[];
  differences: string[];
};
export function validateDecisions(events: DedupDecision[]) {
  const seen = new Map<string, DedupDecision>();
  const latestByCandidate = new Map<string, DedupDecision>();
  for (const e of events) {
    if (
      seen.has(e.id) ||
      !e.reason ||
      !e.source_ids.length ||
      !e.differences.length ||
      (e.action === 'revoke' && !e.supersedes) ||
      e.supersedes !== (latestByCandidate.get(e.candidate_id)?.id ?? null)
    )
      throw new Error('Invalid append-only dedup decision');
    seen.set(e.id, e);
    latestByCandidate.set(e.candidate_id, e);
  }
  return events;
}
