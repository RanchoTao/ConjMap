# V0.4 graph performance experiment

Status: **DONE (bounded measurement), PARTIAL (large-graph latency)**. Actual local production-build Chromium test passed on 2026-10-28 at 11:07:54.881 UTC. The [immutable first successful receipt](performance/v04-graph-benchmark.json) contains all 18 graph measurements and 360 raw pan-frame observations. This is an engineering benchmark, separate from the single MathForge research run.

Host: Windows x64, Intel Core i7-14650HX, 24 logical CPUs, 34,070,192,128 bytes system memory; Chromium156.0.8078.4, 1280×900 viewport. No claim is made that the host was otherwise idle or that browser heap represents all memory use.

## Scope and implementation

The normal 120-node Atlas retains its full-detail default. An explicit `renderDetail="reduced"` option hides unselected canvas labels, uses straight edges, and hides edges during viewport gestures. Full names remain in the data, search, node detail and keyboard-accessible index. No canonical problem, statement, language mapping, relationship evidence or old link is changed.

The gated `/bench` route uses the actual Atlas/Cytoscape canvas renderer with isolated synthetic nodes and a sparse chain of `n-1` unverified edges. Synthetic nodes never enter the canonical catalog. The page provides 100 / 1,000 / 5,000-node controls, full / reduced mode, and an explicit repeat button that remounts the graph. The route remains unavailable unless `CONJMAP_ENABLE_BENCHMARK=1`.

## Reproducible measurement protocol

After the production build, run `npx playwright test tests/e2e/performance-v04.spec.ts`. The existing Playwright configuration starts a loopback-only local server with the benchmark route enabled. The complete test has a 180-second timeout; each measurement has a bounded 30-second wait. Running this test is an engineering benchmark, not a MathForge research task.

The test compares both modes at all three sizes, with three consecutive graph remounts per mode/size and 20 pan-to-next-frame measurements per repeat. It records actual initial graph update time, pan p50/p95 (nearest rank), 60-frame pooled p50/p95 per mode/size, renderer event count, and Chromium DevTools JS heap snapshots. It asserts a visible canvas, actual renderer activity, exact node/edge counts, complete samples, no browser errors, and keyboard node selection. It does not assert a speculative performance improvement or impose a fabricated latency threshold.

Every successful test execution emits its own raw JSON Playwright attachment; partial samples are retained as JSONL even if a later assertion fails. The first successful local receipt is additionally written to `docs/performance/v04-graph-benchmark.json` using exclusive creation. Subsequent runs preserve it and produce new attachments. Inspect the dated attachment rather than treating a checked-in historical result as a new run.

The inherited V0.2 E2E test writes `docs/performance/v02-graph-benchmark.json`; it is intentionally not edited by this change. After a full suite, root must restore that generated historical file from the current HEAD, retaining the newly generated run as an attachment if needed. The V0.4 test never overwrites V0.2 evidence.

## Measurement table

Render is the median of three initial render measurements; pan quantiles pool 60 frames; heap is the median of three CDP used-heap snapshots. Times are milliseconds; memory is MiB, rounded for display.

| Nodes | Full detail: render / pan p50 / pan p95 / JS heap | Reduced detail: render / pan p50 / pan p95 / JS heap |
| ----- | ------------------------------------------------- | ---------------------------------------------------- |
| 100   | 53.2 / 16.6 / 18.1 / 12.0                         | 24.1 / 16.5 / 19.0 / 19.4                             |
| 1,000 | 220.9 / 20.5 / 27.0 / 27.4                        | 126.7 / 18.4 / 24.1 / 30.9                            |
| 5,000 | 1042.0 / 102.3 / 151.8 / 146.6                    | 685.7 / 24.6 / 142.8 / 108.2                          |

Reduced detail lowered the measured 5,000-node render median and pan p50, but its pan p95 remained142.8ms; large-graph interaction is not cleared as consistently smooth. At100 nodes, its p95 and measured heap were slightly higher than full detail. This sequential small-sample result supports keeping the option, not a universal speedup claim. The normal120-node Atlas still defaults to full detail.

Two pre-acceptance failures were retained locally: an exact-text locator omitted the accessible-index count; after fixing it, all18 measurements completed but a selected synthetic node prefetched a nonexistent catalog URL. The actual bug was fixed by withholding catalog links for benchmark nodes, and the final run passed with no browser errors and keyboard selection intact. Neither failed run was written as the accepted canonical receipt. Existing V0.2 output was archived locally and restored byte-for-byte from Git, preserving historical evidence.

## Interpretation limits

- Three repeats provide descriptive comparison; they do not establish a statistical guarantee or a production p95 objective.
- Pan timing measures scripted `panBy` to the next animation-frame callback, not physical input-to-photon latency.
- Initial render timing starts before graph element replacement and includes two frames. It excludes HTTP, module download and initial React setup.
- Render events and visible canvases establish renderer activity, not pixel-accurate presentation timing.
- JS heap excludes process RSS, native renderer allocations and GPU memory. Sequential samples share browser caches and garbage-collection history; no forced GC runs.
- Reduced detail deliberately trades presentation detail for cost. A measured speedup is unknown until execution; keyboard and full-name access remain available.
- Programmatic `panBy` may not trigger gesture-only edge hiding. The benchmark does not measure hardware drag gestures or isolate the contribution of each option.
- This sparse synthetic chain does not model a dense mathematical graph, and historical V0.2 measurements on a different host/browser are not a controlled comparison.

Label clipping and viewport edge hiding are implemented as bounded options. Clustering and new layouts remain **NOT_RUN / not implemented** in this release to preserve P0/P1 scope and graph semantics.
