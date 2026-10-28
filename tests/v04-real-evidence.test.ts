import { describe, expect, it } from 'vitest';
import { validateArchivedRun } from '../src/lib/archived-run';
describe('actual archived REAL_RUN evidence (offline integrity, no engine execution)', () => {
  it('binds actual engine/client/source and every indexed file without claiming public HMAC verification', () => {
    const report = validateArchivedRun();
    expect(report.summary.actual_research_runs).toBe(1);
    expect(report.receipt.resources.wall_seconds).toBeLessThan(30);
    expect(report.receipt.resources.peak_job_bytes).toBeGreaterThan(0);
    expect(report.offline_signature_check).toContain('NOT_RUN');
  });
  it('checks recorded completeness, empty family and excluded singleton-empty boundary', () => {
    const { table } = validateArchivedRun();
    expect(table.rows[0]).toMatchObject({ family_mask: 0, applicable: true, witnesses: [0, 1] });
    expect(table.rows[1]).toMatchObject({
      family_mask: 1,
      applicable: false,
      excluded_singleton_empty: true,
    });
    expect(table.scientific_status).toBe('unverified');
    expect(table.proof_kernel_verified).toBe(false);
  });
});
