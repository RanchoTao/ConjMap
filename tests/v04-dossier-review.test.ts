import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import bundle from '../data/v04/dossier-reviews.json';
import historicalDossiers from '../data/v02/dossiers.json';
import { getProblem } from '../src/lib/catalog';

const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');

describe('V0.4 scoped dossier review provenance and evidence boundaries', () => {
  it('preserves the exact historical dossiers and binds appended reviews to original statements', () => {
    expect(sha256(readFileSync(bundle.historical_input.path))).toBe(bundle.historical_input.sha256);
    expect(bundle.historical_input.modified).toBe(false);
    expect(bundle.reviews).toHaveLength(3);
    expect(new Set(bundle.reviews.map((review) => review.id)).size).toBe(3);
    for (const review of bundle.reviews) {
      const historical = historicalDossiers.find((entry) => entry.problem_id === review.problem_id);
      expect(historical).toBeDefined();
      expect(review.supersedes).toBe(historical!.id);
      expect(review.version).toBe(2);
      expect(sha256(historical!.statement)).toBe(review.original_statement_sha256);
      expect(getProblem(review.problem_id)?.status).toBe('unknown');
      expect(review.catalog_status_recommendation).toBe('unknown');
    }
  });

  it('verifies pinned licensed source bytes and valid one-based declaration spans', () => {
    for (const review of bundle.reviews) {
      const bytes = readFileSync(review.source.path);
      const lines = bytes.toString('utf8').split('\n');
      expect(sha256(bytes)).toBe(review.source.sha256);
      expect(bytes.byteLength).toBe(review.source.retrieved_byte_count);
      expect(review.source.exact_local_match).toBe(true);
      expect(review.source.license).toBe('Apache-2.0');
      expect(review.source.raw_url).toContain(`/${review.source.revision}/`);
      expect(review.source.http_status).toBe(200);
      for (const [start, end] of review.source.spans) {
        expect(start).toBeGreaterThan(0);
        expect(end).toBeGreaterThanOrEqual(start);
        expect(end).toBeLessThanOrEqual(lines.length);
      }
      expect(review.statement_card.proof_body).toMatch(/^sorry at line \d+$/);
      const sorryLine = Number(review.statement_card.proof_body.match(/\d+/)![0]);
      expect(lines[sorryLine - 1].trim()).toBe('sorry');
    }
  });

  it('does not upgrade source inspection or literature claims into kernel, human or mathematical approval', () => {
    expect(bundle.reviewer.kind).toBe('agent');
    expect(bundle.scope.research_runs).toBe(0);
    expect(bundle.scope.kernel_runs).toBe(0);
    expect(bundle.scope.human_approval_receipts).toBe(0);
    expect(bundle.scope.mathematically_verified).toBe(0);
    expect(bundle.scope.fully_cleared).toBe(0);
    expect(bundle.scope.catalog_status_mutations).toBe(0);
    const requiredDimensions = [
      'SOURCE_VERIFIED',
      'STATEMENT_VERIFIED',
      'LITERATURE_REVIEWED',
      'FORMAL_STATEMENT_CHECKED',
      'PROOF_KERNEL_VERIFIED',
      'HUMAN_REVIEWED',
      'MATHEMATICALLY_VERIFIED',
    ];
    for (const review of bundle.reviews) {
      expect(Object.keys(review.dimensions).sort()).toEqual([...requiredDimensions].sort());
      expect(review.completion).toBe('PARTIAL');
      expect(review.dimensions.SOURCE_VERIFIED.status).toBe('DONE');
      expect(review.dimensions.STATEMENT_VERIFIED.status).toBe('DONE');
      expect(review.dimensions.LITERATURE_REVIEWED.status).toBe('PARTIAL');
      expect(review.dimensions.FORMAL_STATEMENT_CHECKED.status).toBe('PARTIAL');
      for (const dimension of [
        review.dimensions.PROOF_KERNEL_VERIFIED,
        review.dimensions.HUMAN_REVIEWED,
        review.dimensions.MATHEMATICALLY_VERIFIED,
      ]) {
        expect(dimension.status).toBe('NOT_RUN');
      }
      expect(review.open_obligations.length).toBeGreaterThan(0);
      expect(review.closed_obligations.length).toBeGreaterThan(0);
      for (const source of review.primary_literature) {
        expect(new URL(source.url).protocol).toBe('https:');
        expect(source.sha256).toMatch(/^[a-f0-9]{64}$/);
        expect(source.locator.length).toBeGreaterThan(0);
        expect(source.finding.length).toBeGreaterThan(0);
      }
    }
  });
});
