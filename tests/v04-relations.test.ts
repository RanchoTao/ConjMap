import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import bundle from '../data/v04/relation-reviews.json';
import originalRelations from '../data/v02/relations.json';
import originalClaims from '../data/v02/claims.json';
import { getProblem } from '../src/lib/catalog';

describe('V0.4 relation review evidence boundaries', () => {
  it('covers each of the original twelve candidates exactly once without promotion', () => {
    expect(bundle.reviews.map((r) => r.relation_id).sort()).toEqual(
      originalRelations.map((r) => r.id).sort(),
    );
    expect(new Set(bundle.reviews.map((r) => r.id)).size).toBe(12);
    expect(bundle.summary).toEqual({
      reviewed: 12,
      keep_candidate: 9,
      correction_required: 3,
      verified: 0,
      proof_kernel_runs: 0,
      human_reviewed: 0,
    });
    for (const row of bundle.reviews) {
      expect(row.verified).toBe(false);
      expect(row.mathematically_verified).toBe(false);
      expect(row.proof_kernel_status).toBe('NOT_RUN');
      expect(row.proof_receipt).toBeNull();
      expect(row.human_approval).toBe('pending');
      expect(row.candidate_layer).toBe(true);
      expect(row.remaining_obligations.length).toBeGreaterThan(0);
    }
  });

  it('binds reviews to exact inherited problem and claim variants', () => {
    for (const row of bundle.reviews) {
      const original = originalRelations.find((r) => r.id === row.relation_id);
      expect(original).toBeDefined();
      expect(row.original_relation).toEqual({
        source_id: original!.source_id,
        target_id: original!.target_id,
        type: original!.type,
        layer: original!.layer,
      });
      const problem = getProblem(row.endpoint_variants.problem_id);
      const claim = originalClaims.find((c) => c.id === row.endpoint_variants.claim_id);
      expect(problem).toBeDefined();
      expect(claim).toBeDefined();
      expect(row.endpoint_variants.problem_statement).toBe(problem!.statement);
      expect(row.endpoint_variants.problem_formal_statement).toBe(problem!.formal_statement);
      expect(row.endpoint_variants.claim_formal_statement).toBe(claim!.formal_statement);
    }
  });

  it('verifies every quoted source span against byte hash and pinned source revision', () => {
    for (const row of bundle.reviews) {
      for (const evidence of row.evidence) {
        const fullPath = path.join('data/upstream/formal-conjectures', evidence.source_path);
        const bytes = readFileSync(fullPath);
        expect(createHash('sha256').update(bytes).digest('hex')).toBe(evidence.source_sha256);
        expect(evidence.source_revision).toBe(bundle.source_set.revision);
        const lines = bytes.toString('utf8').split(/\r?\n/);
        expect(lines.slice(evidence.start_line - 1, evidence.end_line).join('\n')).toBe(
          evidence.quote,
        );
        expect(evidence.url).toContain(`/blob/${evidence.source_revision}/`);
        expect(evidence.url).toContain(`#L${evidence.start_line}-L${evidence.end_line}`);
      }
    }
  });

  it('retains all eight proof obligation categories with source-backed explanations', () => {
    const categories = [
      'model',
      'parameters',
      'assumptions',
      'quantifiers',
      'topology',
      'rate',
      'constants',
      'limit_exchange',
    ].sort();
    for (const row of bundle.reviews) {
      expect(Object.keys(row.obligations).sort()).toEqual(categories);
      const evidenceIds = new Set(row.evidence.map((e) => e.id));
      for (const obligation of Object.values(row.obligations)) {
        expect(obligation.explanation.length).toBeGreaterThan(20);
        expect(obligation.evidence_ids.length).toBeGreaterThan(0);
        expect(obligation.evidence_ids.every((id) => evidenceIds.has(id))).toBe(true);
        expect(obligation.status).not.toBe('DISCHARGED');
      }
    }
  });

  it('preserves corrections for conditional endpoint, characteristic domain and implication direction', () => {
    const corrected = bundle.reviews.filter((r) => r.disposition === 'CORRECTION_REQUIRED');
    expect(corrected.map((r) => r.relation_id)).toEqual([
      'relation-v02-01',
      'relation-v02-10',
      'relation-v02-11',
    ]);
    const resolution = corrected.find((r) => r.relation_id === 'relation-v02-10')!;
    expect(resolution.obligations.assumptions.status).toBe('CONTRADICTED');
    expect(resolution.proposed_correction!.restriction).toContain('CharP k p');
    const buchi = corrected.find((r) => r.relation_id === 'relation-v02-11')!;
    expect(buchi.proposed_correction).toMatchObject({
      source_id: 'cm-000028',
      target_id: 'claim-v02-11',
      type: 'implies',
    });
    const beal = corrected.find((r) => r.relation_id === 'relation-v02-01')!;
    expect(beal.proposed_correction!.target_id).toContain('conclusion-only');
  });

  it('retains epsilon reparameterization and singleton/empty-family edge cases', () => {
    const abc = bundle.reviews.find((r) => r.relation_id === 'relation-v02-02')!;
    expect(abc.desk_derivation.join(' ')).toContain('epsilon/2');
    expect(abc.summary).toContain('full epsilon schemes');
    const yu = bundle.reviews.find((r) => r.relation_id === 'relation-v02-05')!;
    expect(yu.obligations.assumptions.explanation).toContain('empty A is allowed');
    const singleton = bundle.reviews.find((r) => r.relation_id === 'relation-v02-09')!;
    expect(singleton.obligations.assumptions.explanation).toContain('Nonempty');
    expect(singleton.counterexample_or_variant_risk).toContain('must belong to A');
  });
});
