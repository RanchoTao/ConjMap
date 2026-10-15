import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { problems, relationships, manifest, getProblem } from '../src/lib/catalog';
import {
  validateCatalog,
  ProblemSchema,
  RelationshipSchema,
  ResearchAttemptSchema,
  safeUrl,
} from '../src/lib/schema';
import { queryProblems } from '../src/lib/query';
describe('source-backed catalog', () => {
  it('has 120 records across at least three fields with matching receipts', () => {
    expect(problems).toHaveLength(120);
    expect(new Set(problems.map((p) => p.field)).size).toBeGreaterThanOrEqual(3);
    expect(manifest.problem_count).toBe(problems.length);
    expect(manifest.relationship_count).toBe(relationships.length);
  });
  it('preserves the exact statement and formal signature within a hash-checked source span for every record', () => {
    for (const p of problems) {
      const raw = readFileSync(`data/upstream/formal-conjectures/${p.provenance.path}`);
      expect(createHash('sha256').update(raw).digest('hex')).toBe(p.provenance.sha256);
      const span = raw
        .toString('utf8')
        .split('\n')
        .slice(p.provenance.start_line - 1, p.provenance.end_line)
        .join('\n');
      expect(span).toContain(p.statement);
      expect(span).toContain(p.formal_statement);
      expect(span).toContain('category research open');
    }
  });
  it('never conflates automatic extraction, source status and independent review', () => {
    for (const p of problems) {
      expect(p.review_status).toBe('unverified');
      expect(p.status).toBe('unknown');
      expect(p.last_verified).toBeNull();
      expect(p.provenance.source_reported_status).toBe('open');
    }
  });
  it('requires evidence and date for a mathematical status claim', () => {
    expect(ProblemSchema.safeParse({ ...problems[0], status: 'solved' }).success).toBe(false);
    expect(ProblemSchema.safeParse({ ...problems[0], last_verified: '2026-10-15' }).success).toBe(
      false,
    );
  });
  it('rejects duplicate IDs', () =>
    expect(() => validateCatalog([...problems, problems[0]], relationships)).toThrow(
      'Duplicate canonical ID',
    ));
  it('rejects normalized duplicate statements under different IDs', () =>
    expect(() =>
      validateCatalog(
        [
          ...problems,
          {
            ...problems[0],
            id: 'fc-another',
            statement: ` ${problems[0].statement.replace(/\s+/g, '  ')} `,
          },
        ],
        relationships,
      ),
    ).toThrow('Duplicate statement'));
  it('rejects reused source mappings', () =>
    expect(() =>
      validateCatalog(
        [
          ...problems,
          {
            ...problems[0],
            id: 'fc-another',
            statement: 'An entirely different mathematical question with enough detail for a test.',
          },
        ],
        relationships,
      ),
    ).toThrow('Duplicate source mapping'));
  it('rejects dangling, self and duplicate undirected edges', () => {
    expect(() =>
      validateCatalog(problems, [{ ...relationships[0], target_id: 'fc-missing' }]),
    ).toThrow('Dangling');
    expect(
      RelationshipSchema.safeParse({ ...relationships[0], target_id: relationships[0].source_id })
        .success,
    ).toBe(false);
    expect(() =>
      validateCatalog(problems, [
        relationships[0],
        {
          ...relationships[0],
          source_id: relationships[0].target_id,
          target_id: relationships[0].source_id,
        },
      ]),
    ).toThrow('Duplicate relationship');
  });
  it('does not infer mathematical relations from the discovery graph', () => {
    for (const r of relationships) {
      expect(r.type).toBe('related_to');
      expect(r.review_status).toBe('unverified');
      expect(r.review_date).toBeNull();
      const a = getProblem(r.source_id)!,
        b = getProblem(r.target_id)!;
      expect(a.MSC.some((c) => b.MSC.includes(c))).toBe(true);
      expect(r.evidence_urls).toContain(a.source_urls[0]);
      expect(r.evidence_urls).toContain(b.source_urls[0]);
    }
  });
  it('rejects script and data evidence URLs', () => {
    expect(safeUrl.safeParse('javascript:alert(1)').success).toBe(false);
    expect(safeUrl.safeParse('data:text/html,test').success).toBe(false);
  });
  it('rejects mock attempts claiming verification or real execution', () => {
    expect(
      ResearchAttemptSchema.safeParse({
        engine: 'MathForge',
        verification_status: 'verified',
        is_mock: false,
      }).success,
    ).toBe(false);
  });
});
describe('search and sorting', () => {
  it('searches aliases, titles, statements, canonical IDs and MSC', () => {
    const p = problems.find((p) => p.aliases[1] === 'riemannHypothesis')!;
    expect(queryProblems(problems, { q: 'riemannHypothesis' })).toContainEqual(p);
    expect(queryProblems(problems, { q: p.id })).toContainEqual(p);
    expect(queryProblems(problems, { q: 'zeta' })).toContainEqual(p);
    expect(queryProblems(problems, { q: '11' })).toContainEqual(p);
  });
  it('combines filters and handles empty results honestly', () => {
    expect(
      queryProblems(problems, { field: 'Analysis' }).every((p) => p.field === 'Analysis'),
    ).toBe(true);
    expect(queryProblems(problems, { status: 'solved' })).toEqual([]);
    expect(queryProblems(problems, { q: 'no-such-statement-xyz' })).toEqual([]);
  });
  it('sorts without mutating source order', () => {
    const original = problems.map((p) => p.id);
    const ascending = queryProblems(problems, {});
    expect(queryProblems(problems, { sort: 'title-desc' })).toEqual([...ascending].reverse());
    expect(problems.map((p) => p.id)).toEqual(original);
  });
});
