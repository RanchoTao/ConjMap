# MathForge discovery · 2026-10-15

**REAL_INTEGRATION: BLOCKED / REAL_RESEARCH_RUNS: 0.** Actual local source was found and read; a compatible generic task submission API and approved admission mapping were not found. No mock response is reported as an engine run.

Discovery first enumerated available local project directories, then inspected the discovered MathForge checkout's agent guidance, research charter, scientific contract, state documents and existing controller entry points. A GitHub CLI lookup of the named MathForge repository was inaccessible in this session; that does not establish that no repository exists. No private source, credentials, configuration or research artifacts are redistributed here.

The bootstrap entry point maps and validates intake and explicitly refuses research execution. The actual counterexample controller is source-bound: target whitelist, source/hash/hypothesis admission, bounded budgets and replay clearance are part of its scientific contract. Existing campaign entry points target historical work and are not generic ConjMap submission adapters. The inspected controller was waiting for audited queue entries with no active workers at the observation time; a waiting queue does not authorize unrelated admission or replay. The checkout also contained unrelated dirty work, which was preserved.

No controller was started/stopped, no target was admitted, no campaign was replayed, and no files in MathForge were changed. The user authorized a bounded research run, but arbitrarily adapting an existing historical campaign would bypass its statement-specific admission and could produce unrelated evidence. The missing prerequisite is capability/admission compatibility, not merely possession of source code.

## Minimum unblock requirements

1. An engine-owned loopback gateway implementing `POST research-tasks` and `GET research-tasks/<engine_task_id>` as specified in `research-api.md`, including persistent idempotency reconciliation.
2. A legitimate admission mapping for one exact ConjMap statement/source hash, with all hypotheses, literature/replay clearance and engine-enforced task budget (one task, ≤60 seconds, no network).
3. Three local secrets: inbound access token, outbound engine token and callback HMAC secret, each ≥32 characters. No secret is requested for ordinary browsing or mock tests.
4. Engine-issued task identity, actual bounded log/result/artifact references and signed result or authenticated status response. Failed routes are valid results; scientific status remains unverified pending independent review.

ConjMap now implements that guarded client boundary and UI persistence, with injected contract-fixture transports in tests. This is not a new research engine or an authenticated production deployment. Compatibility and an actual round trip remain required before reporting real integration DONE.
