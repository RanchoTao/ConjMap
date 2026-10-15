# Data contract · 0.2.0 (immutable 0.1 source snapshot retained)

## V0.2 identity and source overlays

`data/problems.json`, original navigation edges and manifest remain byte-preserved source artifacts. `data/v02/id-registry.json` is the authoritative persisted mapping to neutral `cm-NNNNNN` identities; allocation is append-only, never reassigned after removal. `catalog.ts` overlays canonical identities, appends legacy `fc-*` aliases, remaps edges and adds 32 source mappings. Old problem URLs resolve. Existing mock journals normalize old IDs at read time. No original statement is silently rewritten.

The second-source adapter retains original external number, URL, original website link, immutable revision, retrieval date, source SHA-256, canonicalized raw-record SHA-256 and attribution. Its strict runtime schema separates `rights.metadata`, `rights.statement_text` and `rights.linked_material`. A source observation is not a new problem or an independently checked status. Original numbered Erdős problems can differ from selected variants. The original metadata is retained for comparison rather than silently overriding source text.

## V0.2 evidence, variants and review history

`evidence.ts` validates seven independent dimensions, each `established|pending|not_run|revoked`. Events bind problem ID and statement SHA, date, reviewer/method, source URLs, scope, limitations and proposed status. `replayReviews` requires sequential versions, exact predecessor and unique event IDs. Revocation appends a new version; history remains in Git. `authorizeStatusChange` rejects research-result origins unconditionally. Expert approval and reviewed statement/literature are policy prerequisites, not proof that an arbitrary supplied receipt is authentic. No status update API exists.

Thirty dossier artifacts have exact statements/signatures and scoped notes, all `completion:PARTIAL`, status unknown, human review pending. SOURCE_IMPORTED is established, STATEMENT_CHECKED/LITERATURE_REVIEWED pending, formal/kernel checks not run. `docs/literature-access-v0.2.json` records bounded page observations; unversioned paper links are dated leads, not immutable full-proof review.

`relations-v02.ts` adds `open_case_of` and `counterexample_to` alongside the original six types. Mathematical edges require layer, direction, precise hypotheses, scope, source revision/locator, review date/reviewer and approval/proof fields. A verified edge requires an approved human receipt, proof receipt and `is_candidate:false`. That validator is an integrity/policy check; independent inspection is still necessary. Twelve preserved-source declaration nodes have `is_problem_count:false`, parent ID and exact hashed source span. All 12 actual substantive edges are source-reviewed candidates, not verified results. The research-evidence layer currently has 0 entries.

## V0.2 duplicate screening and reversible decisions

`dedup.ts` screens all unordered catalog pairs using NFKC/case/whitespace normalization, shared source identity, token/title Jaccard, citations and a small mathematical-symbol signature. Exact matches are classified first; text >=0.6 or title >=0.7 gives near duplicates; shared citation plus matching >=3-symbol signature and text >=0.25 yields `candidate_equivalence`. These are lexical proxies, not a semantic theorem prover or embedding model. Every proposal is unverified with `auto_merge:false`. Actual run: 0 exact, 55 near, 0 equivalence candidates; **0 merges**. Short/common statements can produce false positives.

Rebuild via `npx tsx scripts/build-dedup-report.ts`; offline validation rejects stale output. `dedup-decisions.json` is an initially empty append-only decision ledger, with source IDs, formulation differences, reviewer, reason and predecessor required by the contract. A retraction must bind its original candidate. No candidate has been reviewed into a merge; preserve all raw observations when adding future decisions.

```sh
python -m pip install -r requirements-adapters.txt
python adapters/erdos_metadata.py --source data/upstream/erdos-community/problems.yaml --license data/upstream/erdos-community/LICENSE
python scripts/build-v02-evidence.py
npx tsx scripts/build-dedup-report.ts
npm run validate:v02
```

The following field descriptions document the retained 0.1 source snapshot. Runtime canonical IDs and multisource/evidence extensions above take precedence.

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
