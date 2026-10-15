import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { problems } from '../src/lib/catalog';
import { sourceRecords } from '../src/lib/v02-data';
import { duplicateCandidates, validateDecisions } from '../src/lib/dedup';
import decisions from '../data/v02/dedup-decisions.json';
validateDecisions(decisions);
const candidates = duplicateCandidates(problems).map((c) => ({
  ...c,
  id:
    'dedup-' +
    createHash('sha256')
      .update(`${c.source_id}:${c.target_id}:${c.kind}`)
      .digest('hex')
      .slice(0, 16),
}));
writeFileSync(
  'data/v02/dedup-report.json',
  JSON.stringify(
    {
      algorithm: 'lexical-symbol-citation-v1',
      date: '2026-10-15',
      canonical_problems: problems.length,
      source_observations: sourceRecords.length,
      new_problems_from_second_source: 0,
      automatic_merges: 0,
      candidates,
      limitations: [
        'Lexical/title/symbol/citation heuristics only; no semantic embedding model used.',
        'candidate_equivalence is a screening hypothesis, never a theorem or merge authority.',
        'A shared original Erdős number does not establish equivalence of a selected variant.',
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify({
    pairs: candidates.length,
    by_kind: Object.fromEntries(
      ['exact_duplicate', 'near_duplicate', 'candidate_equivalence'].map((kind) => [
        kind,
        candidates.filter((c) => c.kind === kind).length,
      ]),
    ),
    automatic_merges: 0,
  }),
);
