import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { problems } from '../src/lib/catalog';
import {
  claims,
  dossiers,
  reviews,
  sourceRecords,
  substantiveRelations,
} from '../src/lib/v02-data';
import registry from '../data/v02/id-registry.json';
import dedupReport from '../data/v02/dedup-report.json';
import dedupDecisions from '../data/v02/dedup-decisions.json';
import { duplicateCandidates, validateDecisions } from '../src/lib/dedup';
validateDecisions(dedupDecisions);
const candidates = duplicateCandidates(problems);
if (
  JSON.stringify(candidates) !==
  JSON.stringify(
    dedupReport.candidates.map(({ id, ...rest }) => {
      if (!id.startsWith('dedup-')) throw new Error('Invalid dedup identity');
      return rest;
    }),
  )
)
  throw new Error('Stale dedup report');
const ids = new Set(problems.map((p) => p.id));
if (
  new Set(Object.values(registry)).size !== 120 ||
  problems.length !== 120 ||
  problems.some((p) => !/^cm-\d{6}$/.test(p.id))
)
  throw new Error('Canonical identity migration failed');
for (const record of sourceRecords) {
  if (!problems.some((p) => p.aliases.includes(record.legacy_problem_id)))
    throw new Error('Unmapped source record');
  const raw = readFileSync('data/upstream/erdos-community/problems.yaml');
  if (createHash('sha256').update(raw).digest('hex') !== record.source_sha256)
    throw new Error('Secondary source hash mismatch');
}
if (
  new Set(sourceRecords.map((r) => r.id)).size !== sourceRecords.length ||
  new Set(claims.map((c) => c.id)).size !== claims.length ||
  new Set(dossiers.map((d) => d.id)).size !== dossiers.length ||
  new Set(substantiveRelations.map((r) => r.id)).size !== substantiveRelations.length
)
  throw new Error('Duplicate V0.2 evidence identity');
for (const claim of claims) {
  if (ids.has(claim.id) || !ids.has(claim.parent_id) || claim.is_problem_count)
    throw new Error('Claim incorrectly counted as independent problem');
  const raw = readFileSync(`data/upstream/formal-conjectures/${claim.source_path}`);
  if (createHash('sha256').update(raw).digest('hex') !== claim.source_sha256)
    throw new Error('Claim source hash mismatch');
  const span = raw
    .toString('utf8')
    .split('\n')
    .slice(claim.start_line - 1, claim.end_line)
    .join('\n');
  if (!span.includes(claim.formal_statement)) throw new Error('Claim extraction mismatch');
}
const nodes = new Set([...ids, ...claims.map((c) => c.id)]);
for (const relation of substantiveRelations)
  if (!nodes.has(relation.source_id) || !nodes.has(relation.target_id))
    throw new Error('Dangling substantive relation');
for (const dossier of dossiers) {
  const p = problems.find((p) => p.id === dossier.problem_id);
  if (!p || !reviews.has(p.id)) throw new Error('Unbound dossier');
  if (
    reviews.get(p.id)!.statement_sha256 !== createHash('sha256').update(p.statement).digest('hex')
  )
    throw new Error('Review statement binding mismatch');
}
console.log(
  JSON.stringify(
    {
      problems: problems.length,
      sources_integrated: 2,
      secondary_observations: sourceRecords.length,
      dossiers: dossiers.length,
      fully_cleared_dossiers: 0,
      source_claim_nodes: claims.length,
      substantive_candidates: substantiveRelations.length,
      verified_relations: substantiveRelations.filter((r) => r.review_status === 'verified').length,
      real_research_runs: 0,
    },
    null,
    2,
  ),
);
