# ConjMap V0.4 acceptance · 2026-10-28

**Overall: PARTIAL. P0: REAL_INTEGRATION_DONE for one admitted finite calibration.**
The real ConjMap → MathForge → worker → authenticated receipt → durable evidence →
browser reload chain completed. This establishes a bounded integration, not a new
mathematical result or a general research execution service. No PR is auto-merged
and no production deployment is performed.

## Restored baseline and ownership

- ConjMap main baseline: `cf2e830b9f22bf5eaf5625d0343c5e2e0e077c62`.
  V0.2/V0.3 merged PRs, README, architecture, research API, acceptance, discovery,
  mathematical audit, V0.3 source index/license audit and baseline CI were inspected.
  Development uses `feature/conjmap-v0.4-research-closure`.
- Public MathForge Core baseline: `c9c91a155cc0ebf16a1e06683bbcac109ecf44ad`.
  Its actual queue, scientific policy, evidence guards, budget controller, Windows
  Job implementation and tests were inspected before the compatibility extension.
  Development uses `feature/conjmap-v04-gateway`; executed engine commit:
  `c43ee228c6b7a9e913537b3b19800a7d722c4c03`.
- The separate private/original MathForge research workspace was inspected read-only,
  including its controllers, negative/replay history and scientific admission rules.
  Its unrelated dirty work and stopped legacy controller were preserved. Three
  validators passed. No historical task was replayed; no private research text was
  copied into either public repository. Only the approved finite task's own public
  source, sanitized admission rationale and historical snapshot digest are published.
- The engine extension is an explicit narrow owner-authorized source audit. It
  reuses Core queue/evidence/resource primitives and leaves proof/novelty gates in
  force. A new problem, changed source or changed historical registry is not admitted
  by this execution receipt.

## Module results

| Module | Status | Executed evidence / remaining scope |
| --- | --- | --- |
| Repository, controller and scientific-admission audit | DONE | Actual source/policy/history inspected; exact pinned context and replay-clearance digest retained. |
| Engine-owned compatibility gateway | DONE (scoped) | Engine admission, root-wide one-task reservation, source/hash/variant bindings, durable idempotency, authenticated states/artifacts, cancellation/recovery and independent watchdog. |
| ConjMap real transport and persistence | DONE | Signed identity/narrative verification, rejected/interrupted/cancelled states, lookup-only recovery, immutable artifacts and authenticated reload. |
| First real research experiment | DONE | Exactly one genuine REAL_RUN, engine task `mf-audit-86c955e76307455994ecb1b84c74a81d`; finite Fin2 calibration, 0.164s wall, 0.109s CPU, 9.13MiB peak Job memory. |
| Strict dossier review | PARTIAL | Three of the existing thirty reviewed deeply: Beal, Büchi M5 and union-closed. Source/statement inspection scoped DONE; literature/formal correspondence PARTIAL; no kernel/human/mathematical certification. |
| Existing twelve mathematical relations | PARTIAL | All twelve reviewed; nine remain candidates, three challenged and withheld from active graph. Zero strictly verified relations. |
| Catalog preservation and bilingual/legacy UI | DONE | Original 120 statements, 82 navigation edges, 589 source-index records and old aliases preserved; browser tests cover EN/ZH reload and mobile overflow. |
| Renderer performance | PARTIAL | All 18 measurements passed; reduced-detail 5,000-node pan p50/p95 24.6/142.8ms. Tail latency remains high; no general smoothness clearance. |
| Local engineering regression | DONE | 90 unit, 10 Python, 14 Chromium tests; validators, lint, types, audit and production build pass. |
| Remote CI and PR delivery | DONE | Both feature branches pushed and PRs open; ConjMap implementation and MathForge engine CI passed. Pinned receipts below; no merge/deployment. |
| General research admissions | BLOCKED by design | This one-time admission does not authorize other scientific tasks, network access or replay. A new reviewed engine admission is required. |
| Lean proof execution / human expert review | NOT_RUN | No Lean kernel proof or human approval receipt is claimed. |

## Real receipt and reproducibility

[Real integration report](mathforge-real-integration-v0.4.md) provides the actual
task IDs, source revision, statement/admission/worker hashes, process/exit/resource
record, authentic logs, finite result table and failure/recovery account.
The [public archive](evidence/v04-real-run/mf-audit-86c955e76307455994ecb1b84c74a81d/)
preserves six indexed engine artifacts with exact bytes. The submission implementation
was `96f500cbe2aa620ad867edc27d35c7ef9568f9a3`; archive byte preservation is pinned at
`2d75b06233dc142535695640545c3309fbc6ccf4`.

The actual authenticated transport and later owner-local reload validated the HMAC
receipt. Public offline validation checks byte hashes, bindings and the recorded
finite table; public HMAC revalidation is NOT_RUN because the shared local secret
is intentionally absent. HMAC is transport trust, not proof certification.

The fixed worker enumerated all 16 families of subsets of Fin2 and found half-frequency
witnesses for all 13 applicable families. It cross-checked bitmask and set encodings;
empty-family and excluded `{∅}` cases are explicit. No general conjecture status was
changed. Engine/local journals retain the spent reservation; validation and browser
inspection do not issue another research submission.

## Test results

| Check | Observed result |
| --- | --- |
| `npm run check` | PASS: catalog/V0.2/V0.4 validators, lint, TypeScript, 90 unit tests in 11 files, production build (249 pages) |
| Python adapter discovery | PASS: 10 tests using `python -m unittest discover -s adapters -p 'test_*.py'` |
| Chromium browser suite | PASS: all 14 tests, including actual archive/no-POST/bilingual reload/mobile, candidate overlay, mock persistence and 18-sample synthetic benchmark |
| `npm audit --audit-level=high` | PASS: 0 vulnerabilities after Vitest 4.1.12 patch update |
| MathForge Core suite | PASS: 44 tests, 43 passed / 1 optional real-Lean test skipped; contract workers are CONTRACT_TEST, not additional real research |
| MathForge exact-head remote CI | PASS: [run 40675099710](https://github.com/RanchoTao/MathForge/actions/runs/40675099710), commit `c43ee228c6b7a9e913537b3b19800a7d722c4c03` |
| ConjMap implementation remote CI | PASS: [run 40678396021](https://github.com/RanchoTao/ConjMap/actions/runs/40678396021), commit `157c883b9b64ed15594ff8f44fd0530ecb3f1676`, all configured checks including Chromium |
| Lean/Coq proof kernel | NOT_RUN; the existing optional Core Lean test was skipped |

The unchanged `validate:v02` prints its historical baseline of zero real runs and
twelve candidates. `validate:v04` reports the appended actual run and reviewed
nine-active/three-challenged projection. These are different versioned ledgers,
not additive independent problem counts or contradictory current claims.

The Core suite uses its source package (`PYTHONPATH=src`), as required by its build
layout. A bare global-Python discovery attempt initially failed imports before any
test executed; the correctly configured full suite then passed43 and skipped1.

Initial ConjMap remote runs [40677857831](https://github.com/RanchoTao/ConjMap/actions/runs/40677857831)
and [40677931140](https://github.com/RanchoTao/ConjMap/actions/runs/40677931140) failed
at `npm ci`, before application tests. The Windows dependency update omitted three
cross-platform optional `@emnapi` entries. Their exact registry-resolved versions,
dependency metadata and integrity digests were added without changing other locked
versions; `npm ci --dry-run --ignore-scripts`, a real clean `npm ci`, the full local
`npm run check` and the zero-vulnerability audit pass.
Full regenerated-lock exploration was isolated and discarded; no installation or
test gate was skipped in CI. The repaired implementation passed the pinned remote
run above. This final report is a documentation-only follow-up; the PR checks bind
subsequent report commits to their own exact-head results.

Delivery: [ConjMap PR6](https://github.com/RanchoTao/ConjMap/pull/6) and
[MathForge PR10](https://github.com/RanchoTao/MathForge/pull/10), both open for review.

Failures were retained and fixed rather than removed from the record: pre-submission
gateway startup race (no research POST), post-run locale-specific inspector timeout,
Windows pinned-source line endings, a mock/review CSS-selector collision and benchmark
selectors. The subsequent benchmark also exposed an actual synthetic-node prefetch
404; synthetic nodes now have no catalog link. Trace/sample evidence remains in
ignored local acceptance directories. A mistaken local Python discovery directory
was corrected to the actual adapter folder; the ten-test suite then passed.

## Scientific counts and limits

| Quantity | V0.4 result |
| --- | ---: |
| Original canonical problems / broad fields | 120 / 6 |
| Separate Erdős metadata index | 589 records: 25 numbered matches, 564 not yet matched; not certified distinct problems |
| Historical dossiers / deeply reviewed this round / fully cleared | 30 / 3 / 0 |
| Mathematically verified problems | 0 |
| Historical substantive edges / active candidates / challenged | 12 / 9 / 3 |
| Strictly verified mathematical relations | 0 |
| Real research computations / submissions / automatic replays | 1 / 1 / 0 |

[Dossier review](mathematical-review-v0.4.md) separates all seven dimensions and
records unresolved literature/proof obligations, including the Büchi indexing issue.
[Relation review](relation-verification-v0.4.md) records precise hypotheses, directions,
proof sources and counterexample risks for all twelve edges. Agent review is not
human expert approval. All current independent mathematical states remain unknown.

## Minimal acceptance without another research run

1. `npm run dev` starts the local application; no credentials or external service are
   required for browsing. Search/filter the problem list, interact with `/atlas`,
   and follow an old `fc-*` permalink to its unchanged original statement/source.
2. Open `/problems/cm-000118`; inspect the archived actual engine ID, resources and
   evidence. Switch EN/ZH, reload and inspect mobile width. This starts no task.
3. Open Beal's evidence review. Kernel/human dimensions remain NOT_RUN. Its challenged
   historical edge is visible in history and absent from the active candidate graph.
4. Run `npm run check`, Python discovery and `npm run test:e2e` after installing
   Chromium. These are engineering/contract/offline checks, not research replays.
5. `npm run validate:v04` checks archived bytes and recorded finite rows offline.
   The optional owner-local inspector only reloads the existing journal. Do not
   delete reservations, replace keys or run the real-task flag to repeat this task.

Next phase: obtain separate, explicitly scoped scientific admission for any new
task; resolve selected proof/semantic obligations and obtain qualified independent
review. General execution, proof clearance and large-graph latency are separate
remaining goals. Neither adding source-index rows nor a finite calibration clears them.
