# Contributing to ConjMap

ConjMap welcomes precise corrections, licensed datasets, and reviewable engineering changes. Work in a feature branch and open a PR; do not merge automatically.

## Evidence and data

1. Audit the exact source and its reuse permission before collecting text. Public availability is not permission to copy. Do not scrape an entire website without a clear grant and an approved source-specific plan.
2. Provide an immutable source revision or stable citation, retrieval date, license, attribution, original statement and source mapping. Preserve corrections and negative evidence.
3. Use `unknown` for unestablished mathematical status. Every automatically extracted or AI-authored statement/relationship starts `unverified`; a model's claim is not an expert review or proof.
4. Search canonical IDs, aliases and source mappings before adding a record. Exact duplicates are blocked automatically. Semantic merges require evidence and a reviewed alias/source map; never guess equivalence from similar titles.
5. Keep status review separate from retrieval. To promote a status, add dated independently reviewed evidence and explain the precise formulation and hypotheses. `solved` includes a proved refutation only when the evidence establishes it.
6. Relationships need evidence for their exact direction and hypotheses. Shared MSC tags justify only unverified navigation associations, never logical implications.
7. Do not invent proposing authors, dates, references or difficulty estimates. Null is a deliberate answer.

## Development

Run `npm run dev`. Before a PR run `npm run check`, the Python adapter tests, and `npm run test:e2e` after installing Chromium. Update docs and screenshots when behavior changes. Keep credentials, local research journals, dependency caches and private artifacts out of Git.

The PR should state what changed, what was actually executed, dataset counts/license decisions, scientific limits, and any skipped checks. A build does not certify mathematics. A mock run is never real progress.

## Licensing

Original code and documentation are contributed under Apache-2.0. Retain all upstream copyright/license notices. For third-party data, state the per-source/per-record terms separately; repository licensing cannot override those terms. See `docs/license-decision.md` and `NOTICE`.
