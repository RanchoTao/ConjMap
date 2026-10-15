import { describe, expect, it } from 'vitest';
import { frontierIndex, frontierStats } from '../src/lib/frontier';
import { problems } from '../src/lib/catalog';

describe('v0.3 expanded open-problem source index', () => {
  it('retains the full 120 original curated source transcriptions', () => {
    expect(problems).toHaveLength(120);
    expect(frontierStats.catalogProblems).toBe(120);
  });
  it('indexes exactly 589 historically source-labelled open Erdős records', () => {
    expect(frontierIndex).toHaveLength(589);
    expect(new Set(frontierIndex.map(x => x.id)).size).toBe(589);
    expect(frontierStats.unmatchedCandidates).toBe(564);
    expect(frontierStats.matchedCanonical).toBe(25);
  });
  it('cannot confuse source metadata with a verified conjecture or proof', () => {
    for (const r of frontierIndex) {
      expect(r.source_reported_status).toBe('open');
      expect(r.mathematical_status).toBe('unknown');
      expect(r.review_status).toBe('unverified');
      expect(r.record_type).toBe('metadata_only');
      expect(r.source_url).toBe(`https://www.erdosproblems.com/${r.external_id}`);
    }
  });
  it('binds known Erdős identifiers without assuming semantic equivalence', () => {
    const withDossiers = frontierIndex.filter(r => r.matched_problem_id !== null);
    for (const record of withDossiers) {
      const p = problems.find(p => p.id === record.matched_problem_id);
      expect(p).toBeDefined();
      expect(p?.aliases).toContain(`fc-erdosproblems-${record.external_id}`);
    }
  });
});
