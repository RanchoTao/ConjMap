import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { problems, relationships, manifest } from '../src/lib/catalog';

for (const p of problems) {
  const content = readFileSync(`data/upstream/formal-conjectures/${p.provenance.path}`);
  const hash = createHash('sha256').update(content).digest('hex');
  if (hash !== p.provenance.sha256) throw new Error(`Source hash mismatch: ${p.id}`);
  const entry = manifest.files.find((f) => f.path === p.provenance.path);
  if (entry?.sha256 !== hash || p.provenance.revision !== manifest.revision)
    throw new Error(`Manifest mismatch: ${p.id}`);
  const span = content
    .toString('utf8')
    .split('\n')
    .slice(p.provenance.start_line - 1, p.provenance.end_line)
    .join('\n');
  if (!span.includes(p.statement) || !span.includes(p.formal_statement))
    throw new Error(`Extraction mismatch: ${p.id}`);
}
if (
  manifest.problem_count !== problems.length ||
  manifest.relationship_count !== relationships.length
)
  throw new Error('Count mismatch');
for (const [field, count] of Object.entries(manifest.fields))
  if (problems.filter((p) => p.field === field).length !== count)
    throw new Error('Field count mismatch');
console.log(
  JSON.stringify(
    {
      problems: problems.length,
      relationships: relationships.length,
      fields: manifest.fields,
      hashes: 'PASS',
      independently_verified: 0,
    },
    null,
    2,
  ),
);
