# MathForge real integration · V0.4

**REAL_INTEGRATION_DONE for one explicitly admitted source-bound calibration.** The
general research interface remains restricted. This is actual execution evidence,
not a mock, contract fixture, Lean proof or new mathematical result.

## Actual run and immutable evidence

| Field | Observed result |
| --- | --- |
| Capture date | 2026-10-28, UTC10:51:29 (Asia/Shanghai18:51:29) |
| ConjMap problem | `cm-000118`, original union-closed conjecture statement |
| Exact admitted subtask | Known half-frequency statement for families of subsets of `Fin2` |
| Engine admission | `cm-v04-union-closed-fin2-v1` |
| Engine-issued task | `mf-audit-86c955e76307455994ecb1b84c74a81d` |
| ConjMap task | `d5a5b738-1319-475d-bedd-aee114e104f7` |
| Engine commit | `c43ee228c6b7a9e913537b3b19800a7d722c4c03` |
| ConjMap implementation at submission | `96f500cbe2aa620ad867edc27d35c7ef9568f9a3` |
| Process result | REAL_RUN / completed / exit0, worker PID57772 |
| Actual wall / CPU | 0.16381720002391376s / 0.109375s |
| Peak Windows Job memory | 9,572,352bytes, cap268,435,456bytes |
| Budget | one task, ≤30s requested (owner cap60s), no network/GPU/paid API |
| Actual computation | all16 families examined;13 applicable; all13 have a half-frequency witness |
| Mathematical status | unknown; attempts unverified; no kernel or human approval |

[Evidence directory](evidence/v04-real-run/mf-audit-86c955e76307455994ecb1b84c74a81d/)
contains the original source bytes, actual INPUT/RESULT/EXECUTION, stdout, empty stderr,
authenticated receipt envelope, ConjMap journal snapshot, transport observations,
capture summary, browser screenshots and reload check. `SUMMARY.json` indexes the
six original engine artifact byte hashes; `ENGINE_RECEIPT.json` preserves the exact
signed payload. Git attributes preserve original log/JSON CRLF bytes instead of
silently normalizing signed artifacts. No credentials or private research history ship.

Source: Formal Conjectures revision `2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6`,
`FormalConjectures/Wikipedia/UnionClosed.lean`, SHA256
`2eed6f767e60e2103c3edb55d74416ab58961129cf89edcb0f9861b47698a265`.
The admitted Fin2 declaration is at lines115–119. The selected general conjecture
and finite variant remain distinct. Source context, lineages and exact assumptions
are preserved in MathForge's admission card and ConjMap's review artifacts.

## End-to-end boundary observations

1. The real local ConjMap production server accepted one authenticated V2 POST,
   saved its source-bound context/idempotency identity before network submission,
   and transmitted the exact statement, formal signature, source version/hash and budget.
2. The real MathForge Core gateway checked its engine-owned admission, original
   Phase0 integrity policy, explicit replay-clearance snapshot and root-wide one-task
   reservation. The old private workspace's validators were run read-only and its
   source/negative history was preserved. A stopped legacy controller was not restarted.
3. MathForge persisted operational provenance and launched its fixed Python worker
   inside the existing Windows memory Job after a START handshake. Its independent
   watchdog did not depend on SQLite polling. No client code, arbitrary shell command
   or network-enabled research program was accepted.
4. The worker checked the source bytes and declaration context, enumerated exact
   finite families with bitmasks and cross-checked actual set definitions. It recorded
   the genuine table and logs. Empty family is included; exactly `{∅}` is excluded.
5. Authenticated polling returned the engine-issued ID and HMAC receipt binding
   both task IDs, source/statement/admission hashes, immutable mode/commit/worker,
   status, attempts, artifact index and measured resources. ConjMap checked the
   signature/bindings, fetched only signed named artifacts, checked SHA256/size and
   persisted six files and audit events under its separate real journal.
6. The actual browser loaded the persisted completed task. A later separate read-only
   inspector started only ConjMap, loaded the same authenticated record after reload,
   verified English/Chinese display, and made only two GET research API requests.
   It neither started MathForge nor submitted any research task. Public pages now
   show an immutable archived snapshot with an explicit finite-scope warning.

`BROWSER_CHECK.json` records the reload/locale check. Public static browsing verifies
archive integrity; it cannot reverify HMAC without the intentionally unpublished owner
secret. The owner-local authenticated server did revalidate that signature on reload.
This is shared local transport trust, not a public-key signature, authorship certificate
or proof that the mathematics is correct.

## Failures retained and recovery scope

- A first service preflight attempted the engine readiness probe before Python had
  finished startup and returned `fetch failed`. No request file, ConjMap task ID,
  research POST or engine task existed. The failure is retained in
  `PRE_SUBMISSION_FAILURE.json`.
- Readiness waiting was fixed and tested. The explicit pre-submission recovery
  retained the original owner identity/key, verified absence of a request and engine
  task, and performed the **first and only** research submission. It did not retry an
  accepted/unknown research job or grant a second quota slot.
- The first post-run browser reload assertion used an English-only locator after
  language changed; it timed out after successful research, artifact capture and first
  screenshot. The original failure remains in the ignored local execution directory.
  The locale-safe read-only inspector closed this UI obligation without any research replay.
- MathForge's first remote CI rejected CRLF-normalized source bytes on a clean Windows
  checkout. Scoped LF attributes fixed the pinned-source/code distribution; the next
  exact-head remote CI passed. ConjMap similarly retains signed engine CRLF artifacts
  with `-text` attributes. Hash checks were preserved, not relaxed.

Actual engine computations: **1**. Research submissions: **1**. Automatic research
replays: **0**. Service startup recovery and browser inspection are not new research runs.

## Reproduce validation without replaying research

```sh
npm run validate:v04
npx vitest run tests/v04-real-evidence.test.ts
```

These commands validate preserved source/statement/task bindings, every indexed
artifact byte hash, the recorded16-family table and the empty-family boundary. They
do not launch MathForge or claim public HMAC verification. The archived computation
can be inspected using the exact engine commit/worker hash in EXECUTION.json.

Owner-local UI inspection, with the preserved ignored capture/authentication files:

```sh
node scripts/inspect-real-integration-v04.mjs <owner-local-CAPTURE.json>
```

The actual one-time runner is `scripts/run-real-integration-v04.mjs`; without the
explicit `--execute-one-real-task` flag it only checks prerequisites. The owner slot
and engine-root reservation remain spent after execution. Do not delete either or
change the key/journal to replay this task. A new scientific task needs a separate
reviewed admission and authorization; a source or historical-registry change blocks
the current admission. Secrets remain local/process-only or in ignored owner-local
recovery material, never in command arguments, Git or public logs.

## What remains unestablished

No Lean/Coq execution, accepted universal proof, general union-closed solution,
fully cleared dossier, human expert review or new verified graph relation results
from this finite calibration. The gateway is a scoped local single-workspace protocol,
not a generic MathForge execution service, public deployment or hostile-code sandbox.
Three dossiers remain PARTIAL and three relation candidates require correction.
