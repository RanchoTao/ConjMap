import { describe, it, expect } from 'vitest';
import { problems, getProblem } from '../src/lib/catalog';
import {
  sourceRecords,
  claims,
  dossiers,
  reviews,
  substantiveRelations,
} from '../src/lib/v02-data';
import { duplicateCandidates, normalize, validateDecisions } from '../src/lib/dedup';
import { authorizeStatusChange, replayReviews } from '../src/lib/evidence';
import { SubstantiveRelationSchema, selectRelations } from '../src/lib/relations-v02';

describe('V0.2 catalog and evidence', () => {
  it('keeps all 120 problems and old URLs while integrating 32 observations without duplicate counts', () => {
    expect(problems).toHaveLength(120);
    expect(sourceRecords).toHaveLength(32);
    expect(problems.every((p) => p.id.startsWith('cm-'))).toBe(true);
    expect(getProblem('fc-millennium-riemannhypothesis')?.title).toBe('Riemann hypothesis');
    for (const row of sourceRecords)
      expect(
        getProblem(row.legacy_problem_id)?.source_mappings.some(
          (m) => m.source_id === 'erdos-community' && m.external_id === row.external_id,
        ),
      ).toBe(true);
  });
  it('separates metadata and linked/full-text rights', () => {
    for (const row of sourceRecords) {
      expect(row.rights.metadata).toBe('Apache-2.0');
      expect(row.rights.statement_text).toBe('not_imported');
      expect(row.review_status).toBe('unverified');
    }
  });
  it('preserves 30 partial dossiers and distinct evidence dimensions without fake expert clearance', () => {
    expect(dossiers).toHaveLength(30);
    expect(reviews.size).toBe(30);
    for (const r of reviews.values()) {
      expect(r.human_approval).toBe('pending');
      expect(r.dimensions.PROOF_KERNEL_VERIFIED).toBe('not_run');
      expect(() =>
        authorizeStatusChange({ status: 'solved', origin: 'evidence_review', review: r }),
      ).toThrow();
    }
  });
  it('never permits an unverified AI result or a completed real process to set any mathematical status', () => {
    for (const status of ['solved', 'open', 'disputed'])
      expect(() => authorizeStatusChange({ status, origin: 'research_result' })).toThrow(
        'cannot update',
      );
  });
  it('allows revocation via a new bound review version, not history overwrite', () => {
    const first = [...reviews.values()][0];
    const revoked = {
      ...first,
      id: first.id + '-revoke',
      version: 2,
      supersedes: first.id,
      dimensions: { ...first.dimensions, SOURCE_IMPORTED: 'revoked' as const },
    };
    expect(replayReviews([first, revoked]).get(first.problem_id)?.version).toBe(2);
    expect(() => replayReviews([first, { ...revoked, supersedes: null }])).toThrow();
    expect(() => replayReviews([first, first])).toThrow();
  });
  it('keeps all 12 mathematical candidates out of verified layers', () => {
    expect(claims).toHaveLength(12);
    expect(substantiveRelations).toHaveLength(12);
    for (const layer of ['logic', 'special_cases']) {
      expect(selectRelations(substantiveRelations, layer, false)).toHaveLength(0);
      expect(selectRelations(substantiveRelations, layer, true).length).toBeGreaterThan(0);
    }
    expect(
      SubstantiveRelationSchema.safeParse({ ...substantiveRelations[0], review_status: 'verified' })
        .success,
    ).toBe(false);
  });
  it('distinguishes exact, near and candidate-equivalence records without automatic merge', () => {
    const p = problems[0];
    expect(normalize(' Ａ  b ')).toBe('a b');
    expect(duplicateCandidates([p, { ...p, id: 'cm-999998' }])[0].kind).toBe('exact_duplicate');
    const near = {
      ...p,
      id: 'cm-999998',
      statement: p.statement + ' Another restriction.',
      source_mappings: [],
    };
    expect(duplicateCandidates([p, near])[0].kind).toBe('near_duplicate');
    const a = {
      ...p,
      title: 'First',
      statement: 'alpha beta gamma delta',
      formal_statement: '∀ ∃ ℝ',
      source_mappings: [],
    };
    const b = {
      ...p,
      id: 'cm-999998',
      title: 'Second',
      statement: 'alpha beta epsilon zeta',
      formal_statement: '∀ ∃ ℝ',
      source_mappings: [],
    };
    expect(duplicateCandidates([a, b])[0]).toMatchObject({
      kind: 'candidate_equivalence',
      auto_merge: false,
      review_status: 'unverified',
    });
  });
  it('rejects forked dedup approval chains and permits linear supersession', () => {
    const first = {
      id: 'decision-a',
      candidate_id: 'candidate-1',
      action: 'keep_separate' as const,
      supersedes: null,
      reviewer: 'reviewer',
      reason: 'Hypotheses differ',
      source_ids: ['source-1', 'source-2'],
      differences: ['Different quantifiers'],
    };
    const second = { ...first, id: 'decision-b', supersedes: first.id };
    expect(validateDecisions([first, second])).toHaveLength(2);
    expect(() => validateDecisions([first, { ...second, supersedes: null }])).toThrow();
    expect(() =>
      validateDecisions([first, second, { ...second, id: 'decision-c', supersedes: first.id }]),
    ).toThrow();
  });
  it('requires reversible dedup decisions to preserve source identities and differences', () => {
    expect(() =>
      validateDecisions([
        {
          id: 'a',
          candidate_id: 'x',
          action: 'propose_merge',
          supersedes: null,
          reviewer: 'agent',
          reason: 'same number',
          source_ids: [],
          differences: [],
        },
      ]),
    ).toThrow();
  });
});
