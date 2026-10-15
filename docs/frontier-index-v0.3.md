# ConjMap V0.3: breadth-first open-problem discovery index

## Data model and verified counts

This first expansion adds **589 source-reported open Erdős numbered records** from the already-preserved Apache-2.0 YAML snapshot. The source file has 1,221 numbered metadata entries, including historical solved and disproved problems; only exact `status.state == "open"` entries are included in this public open index. Open (Lean), unknown, independent, proved and disproved variants are not silently reclassified.

- Original ConjMap full-source dossiers: **120**, unchanged.
- Erdős source records labeled exactly `open`: **589**.
- Existing ConjMap dossiers sharing an explicit Erdős number: **25** of these 589.
- Source-open entries with no exact numbered ConjMap match: **564**.
- Independent semantic deduplications among the 564: **0 performed**.
- Independently verified mathematical status of the 589: **0**.
- New complete mathematical statements transcribed in this sprint: **0**.

Therefore `120 + 564 = 684` is *not* a certified count of mathematically distinct open problems. The 564 are *unmatched source records*; some can have different mathematical variants, duplicate problems under alternative labels, or states changed after the pinned upstream snapshot.

The imported index is intentionally **metadata only**: stable numeric source ID, link to original problem, source-open label and date, topical tags, coarse field, exact snapshot revision and optional numbered link to a full ConjMap dossier. It makes no claim to have imported rights to or validated the full text of the erdosproblems.com website. All mathematical statuses remain `unknown`.

## Authority and source lineage

Source: [teorth/erdosproblems](https://github.com/teorth/erdosproblems), Apache-2.0 community repository.
Revision: `86c3dc3e47dbdfb933c57df46705f3fe78e65cc3`.
Pinned local source: `data/upstream/erdos-community/problems.yaml`.
The source snapshot hash is `f19b2f712cc7a64ebdbdd01ec8e2af32dc5b7ab67bf02c30002af9bb8067b15c` (SHA-256).
No website content has been added. Attribution in original license file is retained.

Rebuild locally:

```bash
python -m pip install -r requirements-adapters.txt
python adapters/erdos_open_index.py
```

The command defaults to **read-only comparison**, fails closed on source hash/license changes and raises if the checked-in index differs. `--write` requires a deliberate update review. A new upstream snapshot must have an explicitly audited pinned revision, new manifest evidence and status reconciliation; do not simply overwrite the existing snapshot.

## How to scale responsibly to more sources

The practical target is breadth-first discovery, not instant mathematically certified coverage:

1. **Expansion of Formal Conjectures:** enumerate all `@[category research open]` statements in a pinned Apache-2.0 checkout (not just the original 120). Keep exact path, declaration, line span, license and source-reported state. Deduplicate at the statement/variant level; retain proof context and Mathlib references; do not treat `sorry` as a proof.
2. **Erdős problem maturation:** supplement these 589 metadata records with correctly licensed, precise statements or audited transcriptions when explicit permissions and independent statement review permit it. Known numbered matches remain documentary links, never automatic theorem equivalence.
3. **UnsolvedMath:** evaluate individually reuse rights for metadata vs problem statements from the CC BY 4.0 curation. The metadata and original texts may have different licenses. Separate AI-estimated open/solved labels from independently checked states, screen archived duplicates, and preserve original references.
4. **AIM and thematic problem lists:** index public source links and stable IDs where allowed; request permission / perform per-document license review before importing full copyrighted statements.
5. **OpenConjecture and arXiv:** ingest only fields with clear reuse rights and record lineage; publication and LLM extraction are not evidence of current open status.
6. **Specialized fields:** group theory (Kourovka Notebook), combinatorics, topology, analysis and number theory each require discipline-specific provenance, periodic status checks and expert review.

An index record is **not** promoted into a full ConjMap problem dossier until its exact mathematical statement, variant, attribution, license and source identities have been examined. Automated status changes and auto-merge remain prohibited. A downstream MathForge task requires a precise admitted source-bound statement and engine-owned gateway.

## Performance and display policy

The public `/frontier` page filters all source metadata in the browser but mounts only **24 cards per page**. It does not attempt to inject thousands of poorly supported nodes into the existing 120-node theorem graph.

Future scaling to 5,000–20,000+ records should use paged or indexed search, by-subfield aggregate visualizations and only local neighborhood subgraphs. Index size and checked/verified status must remain separate metrics.

## Acceptance

- 589 open source metadata entries, 25 known numbered matches, 564 unmatched candidates
- Original 120 detailed ConjMap entries unchanged
- No solved/disproved statuses or unlicensed source statements promoted into the index
- Frozen SHA/revision/attribution, reproducible Python adapter and regression tests
- English/Chinese search, canonical field filtering, pagination and source links
- GitHub Pages read-only build can generate `/frontier/`, with no research API exposed
