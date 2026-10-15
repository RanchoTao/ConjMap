# ConjMap V0.1 acceptance report

Date: **2026-10-15, Asia/Shanghai**. This is an engineering acceptance report. It is not independent mathematical certification, proof verification, or a current-literature audit.

## Module status

| Module | Status | Evidence / limit |
| --- | --- | --- |
| Repository inspection & feature branch | DONE | Local directory and remote were empty. Empty baseline commit created for PR comparison; implementation is on `feature/conjmap-v0.1`. |
| Eight-source audit | DONE | `source-audit.md`, `source-access.json`, `data/sources.json`; exact URLs, access differences, maintenance, cadence, formats, rights and risks recorded. |
| Next.js / TypeScript / local runtime | DONE | Requested architecture implemented; `npm run dev -- --port 3101` started in 610 ms and homepage returned HTTP 200. Fresh dependencies are bootstrapped by the launcher; npm lockfile retained. |
| Home | DONE | Brand, mission, actual catalog stats, field entry points, interactive preview; desktop/mobile screenshots. |
| Atlas | DONE | 120 actual nodes, 82 documented discovery links, real canvas node clicks, zoom buttons, drag-pan, fit, search, field/status filters, link toggle, keyboard-accessible index. Chromium exercised these interactions. |
| Problems | DONE | Search titles/statements/IDs/aliases/MSC; field/status filters, title sorting, pagination, URL persistence and empty state exercised. |
| Problem detail | DONE | Math rendered in KaTeX, exact formal signature, references, pinned source evidence, unknown/unverified labels, passport, relations and local mock records. |
| Sources / About | DONE | License/attribution decisions, all eight source summaries, contribution and architecture boundaries. |
| Responsive / themes | DONE | Actual 390×844 mobile browser visits on all six page types with no horizontal overflow; dark/light persistence exercised. Basic semantics and ESLint accessibility rules; no claim of a comprehensive accessibility certification. |
| ≥100 sourced records / ≥3 fields | DONE | 120 source transcriptions from one Apache-2.0 repository, across six fields. Every record has hash-checked original source span. |
| Independent mathematical review | PARTIAL | **0** independently verified. All 120 automatic imports unverified, mathematical status unknown, retrieval distinct from verification. Source-reported open labels retained separately. |
| Canonical IDs / duplicate controls | DONE | Canonical IDs, aliases, unique source mappings; ID/normalized-text/source-map duplicates and dangling/symmetric duplicate edges rejected. Semantic equivalence review remains incomplete. |
| Reviewed mathematical relationships | PARTIAL | Only unverified shared-tag `related_to` navigation associations ship. All six relationship types supported; no proved implication/equivalence/dependency asserted. |
| Research Task API v1 / mock adapter | DONE | Submit/query/result/fixture endpoints, strict mock-only contracts, disk persistence across a fresh Node process, concurrent/replayed callback rejection, failed/candidate display. |
| Real MathForge integration | PARTIAL | Mock boundary completed as allowed for V0.1. No private engine accessed, no real research run or proof progress claimed. |
| Persistence evolution | DONE | Replaceable adapter, atomic local JSON journal and lock; PostgreSQL schema design recorded. SQL has not been executed; no database connected. |
| Docs / license / contribution / environment | DONE | README, Apache-2.0 LICENSE and NOTICE, CONTRIBUTING, architecture ADRs, source audit, data contract, API docs, credential-free `.env.example`, manual E2E steps. |
| Local checks and screenshots | DONE | Results below; screenshots committed under `docs/screenshots/`. |
| GitHub Actions / push / PR | Pending remote confirmation | Workflow is implemented. The PR checks are the authority for the current remote head; this row will be updated after observing a completed run. |
| Public deployment / paid services | Not requested | No deployment, production credentials, paid resource or automatic merge performed. |

## Executed local checks

Environment: Windows, Node **25.2.1**, npm **11.6.2**, Python **3.13**, Next.js **16.4.1**. CI targets Ubuntu / Node 24 / Python 3.13.

| Command | Actual outcome |
| --- | --- |
| `npm run validate:data` | PASS: 120 records, 82 relations, six fields, all source hashes and exact source spans match manifest |
| `npm run lint` | PASS: no errors or warnings |
| `npm run typecheck` | PASS: generated Next route types and TypeScript |
| `npm test` | PASS: **25 tests in 3 files**, final run 1.33 s |
| `python -m unittest discover -s adapters -p "test_*.py"` | PASS: **3 tests**, all 120 records roundtrip through extractor |
| `npm run build` | PASS: optimized build; all six page types and four API route patterns generated, no application build warnings |
| `npm run test:e2e` | PASS: **6 Chromium tests**, final run 14.0 s against a real production-mode server |
| `npm audit --json` | PASS: **0 known vulnerabilities**, entire installed dependency tree; see `dependency-audit.json` |
| `npm run dev -- --port 3101` + HTTP probe | PASS: one-command launcher ready; homepage HTTP 200 |

Playwright's inherited FORCE_COLOR/NO_COLOR message is an environment warning, not an application exception. Chromium installation initially hit a headless-shell download timeout and then completed on the installer's retry. The first browser round found single-result node positioning inconsistent with canvas center; implementation was corrected and the expanded six-test suite passed. Initial type errors and dependency audit findings were corrected before final acceptance. The project uses explicit TypeScript, React Hooks and accessibility ESLint plugins, avoiding an unnecessary vulnerable transitive glob chain in the framework lint preset; no runtime framework downgrade was used.

## Browser → API → data → response verification

The user can discover a source statement, inspect its evidence, create a local mock research task, receive a demonstration callback, and inspect persistent mock attempts without changing mathematical status.

| Boundary | Result | Observed evidence |
| --- | --- | --- |
| UI → source catalog | PASS | Search `riemannHypothesis`, actual canvas tap / accessible button → Riemann detail |
| Catalog → rendered math/evidence | PASS | `.katex` renders; pinned revision/line link present; all source spans hash validated |
| UI → submit API | PASS | Create mock request → 201; queued record renders |
| API → local data | PASS | JSON journal persists; independent fresh Node process reads identical record |
| Result → state transition | PASS | Mock callback completes once; simultaneous updates/replays rejected; attempts retain mock/unverified markers |
| Data → response → UI | PASS | Failed route and candidate placeholder display after reload; no source status changes |
| Invalid input boundaries | PASS | Real engine / fake verification / malformed JSON rejected; cross-origin rejected; oversized bodies and unsafe IDs/URLs tested |

## Source statistics and interpretation

| Source | Imported problem records | Independently verified |
| --- | ---: | ---: |
| Formal Conjectures (Apache-2.0, pinned revision) | 120 | 0 |
| Other seven audited resources | 0 | 0 |

Fields: Algebra 10; Analysis 16; Combinatorics 31; Geometry & topology 23; Logic & foundations 10; Number theory 30. The source/extraction target is met; independent-review gap is 120. Do not describe these as 120 certified currently open problems.

## Screenshots

Screenshots are genuine local Chromium captures. Mock records visible in the detail screenshot are local integration fixtures, explicitly labeled. Full traces/reports are produced by Playwright and uploaded by CI.

| Capture | Artifact |
| --- | --- |
| Home, dark desktop | [home-dark.png](screenshots/home-dark.png) |
| Atlas, desktop | [atlas-desktop.png](screenshots/atlas-desktop.png) |
| Problem search, light theme | [problems-light.png](screenshots/problems-light.png) |
| Detail, evidence and mock attempts | [problem-evidence.png](screenshots/problem-evidence.png) |
| Home, mobile 390px | [home-mobile.png](screenshots/home-mobile.png) |

## Known limitations

Imported source whitespace is preserved exactly, including an upstream trailing space. Git's end-of-line whitespace check is scoped out for `data/upstream/**` so provenance is not altered merely to satisfy a style check.

- Source extraction and integrity are checked; Lean proofs, formalization correctness, semantic deduplication and current mathematical status are not independently verified.
- One source is imported; seven are audited without content import. Some statements need surrounding source definitions or source-document review. File titles and theorem variants are distinguished but not a substitute for expert editing.
- The graph's shared-subject associations are not a theorem dependency graph. Large-scale graph performance is unmeasured.
- Local file storage has no multi-user auth, server scheduling, remote signed callbacks, user quotas or production artifact verification. Host/origin guards are not authentication. Crash lock recovery requires operator review.
- SQL storage design is unexecuted. Actual MathForge integration remains outside this mock edition.
- Chromium and a 390px mobile viewport were exercised; Safari, Firefox, real touch hardware and comprehensive accessibility audits were not executed.
- Dependency audit reflects the dated registry response, not a guarantee against undisclosed vulnerabilities.

There is no unresolved blocker to local V0.1 usage. The PARTIAL items above are explicit evidence and integration limits, not silently completed research claims.
