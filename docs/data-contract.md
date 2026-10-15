# Data contract · 0.1.0

The executable authority is `src/lib/schema.ts`. JSON imports are parsed at runtime/build; strict schemas reject unknown fields. `data/manifest.json` records schema version, pinned upstream revision, dates, counts, field statistics and source hashes.

## Problem

| Field | V0.1 type / meaning |
| --- | --- |
| id | `fc-<collection>-<file-stem>`, stable lowercase path-derived canonical ID |
| title | source-aware display title for the selected theorem; variants qualified where known |
| source_title | original upstream file heading, preserved even when broader than the selected statement |
| statement | exact selected theorem documentation, not an AI rewrite |
| latex | first source formula if available, otherwise null; full math remains in statement |
| formal_statement | exact Lean theorem name and signature, excluding proof body |
| field | broad display field based on the first upstream AMS subject code |
| MSC | array of upstream two-digit AMS/MSC classes, zero padded; not a claimed five-digit expert classification |
| status | `open`, `partially_resolved`, `solved`, `disputed`, `unknown` |
| status_evidence | URL, exact scope of claim, accessed date, review status |
| source_urls / references | HTTP(S) links, primary pinned source first; upstream-linked references are labeled not independently reviewed |
| proposed_by / proposed_year | string/integer or null when not established by the adapter |
| last_verified | ISO date or null; **not** the retrieval date |
| difficulty_estimate | string or null; all estimates null in this release |
| review_status | `unverified`, `reviewed`, `rejected`; imported statements are unverified |
| aliases | source file stem and selected theorem identifier |
| source_mappings | source ID, external ID (`path::theorem`), pinned URL |
| provenance | source ID, commit, path, LF file SHA-256, retrieval date, license, extractor ID, source-reported status, line span |

All 120 statements are real source transcriptions. None has an independent mathematical review: `status:unknown`, `review_status:unverified`, `last_verified:null`. The source label `research open` only establishes what the pinned repository says. A later independently reviewed status requires a reviewed evidence entry, overall reviewed status, and verification date. Null historical fields do not mean the proposer or date is unknowable; this adapter does not establish them.

Dates use `YYYY-MM-DD`. API instants use ISO UTC timestamps. Unknown data is null or the explicit unknown enum, never a guessed value. Source file hashes cover UTF-8 LF content; `.gitattributes` enforces LF for consistent Windows/Linux validation.

## Relationships

`source_id`, `target_id`, `type`, `evidence_url`, `review_status`, `review_date` are required. V0.1 also requires `evidence_urls` and an explanatory `basis`.

Types: `implies`, `equivalent`, `generalizes`, `special_case_of`, `depends_on`, `related_to`. Direction is source → target for directed types; equivalent/related_to duplicate detection is symmetric. Self edges, missing endpoints, duplicate relations, unsafe evidence URLs and reviewed relations without dates fail validation.

The shipped 82 `related_to` edges are mechanically constructed discovery associations from shared upstream subject tags, not claimed mathematical relationships. Both endpoints' source URLs and a warning are retained. All are `unverified` with null review dates. Future implication/equivalence claims must state hypotheses and reviewed mathematical evidence; they are never inferred from language-model similarity or taxonomy alone.

## ResearchAttempt

Fields: `problem_id`, `engine`, `run_id`, `timestamp`, `hypothesis`, `method`, `result`, `verification_status`, `artifact_urls`. V0.1 adds `kind:failed_route|candidate_proof` and required `is_mock:true`. The mock-only schema accepts only `engine:mock-mathforge` and `verification_status:unverified`. IDs and timestamps are assigned by the adapter; clients cannot override them. Result callbacks cannot update problem data. Artifacts remain links; the server neither fetches nor executes them.

The independent interface and versioned task transport are documented in `research-api.md`. A real engine will require an explicitly versioned schema extension, authentication and verification policy; changing a label in the mock callback is intentionally rejected.

## Canonicalization and duplicate policy

- Canonical IDs are stable within this pinned source import. Filename case changes or upstream renames require an explicit mapping migration; do not silently regenerate IDs.
- Each selected file contributes one documented research-open theorem. This is a bounded problem snapshot, not an inventory of every variant in each file. Surrounding Lean statements preserved for context do not count as additional problems.
- ID uniqueness, NFKC/case/whitespace-normalized statement uniqueness and source-mapping uniqueness are enforced. Alias lookup is case-insensitive; aliases are source names, not asserted equivalences.
- Semantic near-duplicates and relations across independent collections need expert review. Automatic checks do not prove semantic distinctness. No cross-source import has been performed in V0.1.
- Selection is deterministic: source folders in a fixed priority order, lexical file order, first eligible documented theorem per file, balanced round-robin by field until 120 unique statements. The permissive adapter deliberately skips undecidable extraction boundaries, nested comments and nonresearch categories. It is not a general Lean parser.

## Reproduce the import

```sh
git clone https://github.com/google-deepmind/formal-conjectures.git .cache/formal-conjectures
git -C .cache/formal-conjectures checkout 2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6
python adapters/formal_conjectures.py --source .cache/formal-conjectures
npm run validate:data
python -m unittest discover -s adapters -p "test_*.py"
```

The adapter refuses an unpinned checkout or missing license. It performs no web crawling. Offline tests re-extract every shipped record from the preserved files and compare the entire record. `validate:data` independently checks source hashes and exact statement spans. Updating upstream requires a new dated audit and PR; no scheduled refresh runs.
