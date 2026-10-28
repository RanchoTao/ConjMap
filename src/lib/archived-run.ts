import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { EngineReceiptSchema } from './real-research';
import { getProblem } from './catalog';

export const realEvidencePath =
  'docs/evidence/v04-real-run/mf-audit-86c955e76307455994ecb1b84c74a81d';
const hash = (value: Uint8Array | string) => createHash('sha256').update(value).digest('hex');

/** Offline archive integrity. HMAC authentication was checked at capture, not claimed here. */
export function validateArchivedRun(root = process.cwd()) {
  const folder = path.join(root, realEvidencePath);
  const load = (name: string) => JSON.parse(readFileSync(path.join(folder, name), 'utf8'));
  const summary = load('SUMMARY.json'),
    envelope = load('ENGINE_RECEIPT.json');
  const receipt = EngineReceiptSchema.parse(JSON.parse(envelope.payload));
  const task = load('CONJMAP_TASK.json'),
    execution = load('EXECUTION.json'),
    browser = load('BROWSER_CHECK.json');
  const p = getProblem(receipt.problem_id);
  if (
    !p ||
    receipt.execution_mode !== 'REAL_RUN' ||
    receipt.status !== 'completed' ||
    receipt.conjmap_task_id !== task.id ||
    receipt.engine_task_id !== summary.real_engine_task_id ||
    receipt.engine_commit !== summary.engine_commit ||
    receipt.worker_sha256 !== execution.code_sha256['source_audit_worker.py'] ||
    receipt.source_sha256 !== p.provenance.sha256 ||
    receipt.statement_sha256 !== hash(p.statement) ||
    hash(envelope.payload) !== summary.engine_receipt_sha256 ||
    summary.actual_research_runs !== 1 ||
    execution.exit_code !== 0 ||
    execution.proof_acceptance_enabled !== false ||
    summary.mathematical_status !== 'unknown' ||
    summary.proof_kernel_verified !== false ||
    browser.new_research_runs !== 0 ||
    browser.persisted_after_reload !== true
  )
    throw new Error('Archived execution/provenance binding mismatch');
  for (const artifact of receipt.artifact_index) {
    const raw = readFileSync(path.join(folder, artifact.name));
    if (raw.byteLength !== artifact.bytes || hash(raw) !== artifact.sha256)
      throw new Error(`Archived artifact mismatch:${artifact.name}`);
  }
  const table = load('RESULT.json');
  if (
    table.execution_mode !== 'REAL_RUN' ||
    table.proof_kernel_verified !== false ||
    table.rows.length !== 16 ||
    new Set(table.rows.map((r: { family_mask: number }) => r.family_mask)).size !== 16
  )
    throw new Error('Finite table completeness mismatch');
  // Independent verification of the recorded table, not a new engine submission.
  for (const row of table.rows) {
    const mask = row.family_mask;
    if (!Number.isInteger(mask) || mask < 0 || mask >= 16)
      throw new Error('Invalid family identity');
    const members = Array.from({ length: 4 }, (_, i) => i).filter((i) => (mask & (1 << i)) !== 0);
    const closed = members.every((x) => members.every((y) => members.includes(x | y)));
    const excluded = members.length === 1 && members[0] === 0;
    const frequencies = [0, 1].map((i) => members.filter((x) => (x & (1 << i)) !== 0).length);
    const witnesses = [0, 1].filter((i) => 2 * frequencies[i] >= members.length);
    if (
      JSON.stringify(row.members) !== JSON.stringify(members) ||
      row.union_closed !== closed ||
      row.excluded_singleton_empty !== excluded ||
      row.applicable !== (closed && !excluded) ||
      JSON.stringify(row.frequencies) !== JSON.stringify(frequencies) ||
      JSON.stringify(row.witnesses) !== JSON.stringify(witnesses) ||
      (row.applicable && !witnesses.length)
    )
      throw new Error('Finite table definition/witness mismatch');
  }
  if (table.rows.filter((r: { applicable: boolean }) => r.applicable).length !== 13)
    throw new Error('Recorded applicability mismatch');
  return {
    summary,
    receipt,
    table,
    browser,
    offline_signature_check:
      'NOT_RUN: owner-local shared secret intentionally absent from public artifacts',
  };
}
