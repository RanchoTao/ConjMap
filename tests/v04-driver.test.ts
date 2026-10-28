import { describe, expect, it } from 'vitest';
import {
  assertPublicEvidence,
  assertPreSubmissionRecovery,
} from '../scripts/run-real-integration-v04.mjs';

describe('opt-in real-driver distribution boundary (does not launch a task)', () => {
  it('permits public source/provenance evidence', () => {
    expect(() =>
      assertPublicEvidence(
        Buffer.from(
          JSON.stringify({
            source: 'https://github.com/google-deepmind/formal-conjectures',
            scientific_status: 'unverified',
          }),
        ),
      ),
    ).not.toThrow();
  });
  it('holds potential private paths and credentials before publication', () => {
    for (const value of [
      ['C:', 'Users', 'demo', 'private'].join('\\'),
      ['ghp', 'x'.repeat(40)].join('_'),
      ['-----BEGIN', 'RSA PRIVATE KEY-----'].join(' '),
    ])
      expect(() => assertPublicEvidence(Buffer.from(value))).toThrow('retain locally');
  });
  it('only permits same-key startup recovery when no request was written or submitted', () => {
    expect(() =>
      assertPreSubmissionRecovery({ task_id: null, transcript: [] }, false),
    ).not.toThrow();
    for (const [failure, written] of [
      [{ task_id: null, transcript: [] }, true],
      [{ task_id: 'issued', transcript: [] }, false],
      [{ task_id: null, transcript: [{ method: 'POST' }] }, false],
    ] as const)
      expect(() => assertPreSubmissionRecovery(failure, written)).toThrow('lookup-only');
  });
});
