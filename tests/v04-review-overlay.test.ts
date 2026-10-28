import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import originalProblems from '../data/problems.json';
import originalDossiers from '../data/v04/dossier-reviews.json';
import originalReviewRows from '../data/v04/relation-reviews.json';
import { getProblem, problems, relationships } from '../src/lib/catalog';
import { substantiveRelations } from '../src/lib/v02-data';
import { selectRelations } from '../src/lib/relations-v02';
import {
  activeSubstantiveRelations,
  dossierReviews,
  DossierReviewSchema,
  RelationReviewSchema,
  reviewPanelData,
  reviewTotals,
} from '../src/lib/v04-reviews';
import { V04ReviewPanel } from '../src/components/v04-review-panel';

const language = vi.hoisted(() => ({ value: 'en' as 'en' | 'zh' }));
vi.mock('../src/components/i18n', () => ({ useLanguage: () => ({ language: language.value }) }));
afterEach(() => {
  language.value = 'en';
});

describe('V0.4 read-only review overlay', () => {
  it('withholds exactly the challenged edges while preserving original graph records and navigation', () => {
    expect(substantiveRelations).toHaveLength(12);
    expect(activeSubstantiveRelations).toHaveLength(9);
    expect(
      substantiveRelations.filter((r) => !activeSubstantiveRelations.includes(r)).map((r) => r.id),
    ).toEqual(['relation-v02-01', 'relation-v02-10', 'relation-v02-11']);
    expect(relationships).toHaveLength(82);
    expect(
      activeSubstantiveRelations.every((r) => r.is_candidate && r.human_approval === 'pending'),
    ).toBe(true);
    for (const layer of ['logic', 'special_cases', 'research_evidence']) {
      expect(selectRelations(activeSubstantiveRelations, layer, false)).toEqual([]);
    }
    expect(reviewTotals).toEqual({
      dossiers: 3,
      fullyCleared: 0,
      verified: 0,
      activeCandidates: 9,
      challenged: 3,
    });
  });

  it('keeps all original statements, titles, unknown statuses and legacy URLs unchanged', () => {
    expect(problems).toHaveLength(120);
    for (const original of originalProblems) {
      const problem = getProblem(original.id);
      expect(problem).toBeDefined();
      expect(problem!.title).toBe(original.title);
      expect(problem!.statement).toBe(original.statement);
      expect(problem!.formal_statement).toBe(original.formal_statement);
      expect(problem!.status).toBe(original.status);
      expect(problem!.source_urls).toEqual(original.source_urls);
      expect(getProblem(problem!.id)).toBe(problem);
    }
  });

  it('rejects fabricated dossier approvals, status changes and stale statement bindings', () => {
    const row = originalDossiers.reviews[0];
    expect(
      DossierReviewSchema.safeParse({ ...row, catalog_status_recommendation: 'solved' }).success,
    ).toBe(false);
    expect(
      DossierReviewSchema.safeParse({ ...row, original_statement_sha256: '0'.repeat(64) }).success,
    ).toBe(false);
    expect(DossierReviewSchema.safeParse({ ...row, completion: 'DONE' }).success).toBe(false);
    for (const key of ['PROOF_KERNEL_VERIFIED', 'HUMAN_REVIEWED', 'MATHEMATICALLY_VERIFIED']) {
      const dimensions = {
        ...row.dimensions,
        [key]: { status: 'DONE', scope: 'Untrusted promotion' },
      };
      expect(DossierReviewSchema.safeParse({ ...row, dimensions }).success).toBe(false);
    }
  });

  it('rejects relation promotion, lost correction records, and changed original endpoints', () => {
    const row = originalReviewRows.reviews[0];
    expect(RelationReviewSchema.safeParse({ ...row, verified: true }).success).toBe(false);
    expect(RelationReviewSchema.safeParse({ ...row, human_approval: 'approved' }).success).toBe(
      false,
    );
    expect(RelationReviewSchema.safeParse({ ...row, disposition: 'KEEP_CANDIDATE' }).success).toBe(
      false,
    );
    expect(RelationReviewSchema.safeParse({ ...row, proposed_correction: null }).success).toBe(
      false,
    );
    expect(
      RelationReviewSchema.safeParse({
        ...row,
        original_relation: { ...row.original_relation, target_id: 'cm-000001' },
      }).success,
    ).toBe(false);
  });

  it('projects scoped serializable review data with distinct dimensions and challenged history', () => {
    expect(dossierReviews.map((r) => r.problem_id)).toEqual([
      'cm-000008',
      'cm-000028',
      'cm-000118',
    ]);
    for (const row of dossierReviews) {
      const data = reviewPanelData(row.problem_id);
      expect(data.dossier?.completion).toBe('PARTIAL');
      expect(data.dossier?.dimensions.PROOF_KERNEL_VERIFIED.status).toBe('NOT_RUN');
      expect(data.dossier?.dimensions.HUMAN_REVIEWED.status).toBe('NOT_RUN');
      expect(data.dossier?.dimensions.MATHEMATICALLY_VERIFIED.status).toBe('NOT_RUN');
      expect(data.scopedProblems).toHaveLength(3);
      expect(JSON.parse(JSON.stringify(data))).toEqual(data);
      expect(JSON.stringify(data)).not.toContain('source_sha256');
    }
    expect(reviewPanelData('cm-000008').relations[0].disposition).toBe('CORRECTION_REQUIRED');
    expect(reviewPanelData('cm-000103').relations[0].disposition).toBe('CORRECTION_REQUIRED');
    expect(reviewPanelData('cm-000001').dossier).toBeNull();
  });

  it('renders English and Chinese controls while preserving original English review notes', () => {
    const props = reviewPanelData('cm-000008');
    const english = renderToStaticMarkup(createElement(V04ReviewPanel, props));
    expect(english).toContain('3 scoped dossiers remain PARTIAL');
    expect(english).toContain('9 active candidates, 3 challenged');
    expect(english).toContain('Proof kernel verification');
    expect(english).toContain('Human expert review');
    expect(english).toContain('Challenged / withheld from graph');
    expect(english).toContain('NOT_RUN');
    language.value = 'zh';
    const chinese = renderToStaticMarkup(createElement(V04ReviewPanel, props));
    expect(chinese).toContain('3 份限定范围档案均为 PARTIAL');
    expect(chinese).toContain('9 条为活动候选');
    expect(chinese).toContain('证明内核核验');
    expect(chinese).toContain('人工专家审查');
    expect(chinese).toContain('需纠正 / 图谱已暂停展示');
    expect(chinese).toContain('Pinned licensed Lean bytes');
  });
});
