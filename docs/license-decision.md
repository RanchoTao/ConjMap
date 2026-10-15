# License decision · V0.1

ConjMap's original code, docs and metadata use **Apache-2.0**. The project is new, the user requested an open project and a license decision, and the initial data source uses the same license. This is a recorded engineering licensing decision, not legal certification of every upstream reference.

The 120 transformed records and 120 preserved Lean source files derive from The Formal Conjectures Authors' Apache-2.0 repository at the revision in `data/manifest.json`. Upstream copyright headers and full license text are retained; `NOTICE` describes attribution and changes. No upstream NOTICE file was present in the selected checkout. Definitions and surrounding statements are retained to preserve context, not counted as additional imported problems.

The repository license does not relicense external papers, website text, discussion posts or datasets referenced by upstream. Those remain links. AIM, Erdős website/forum, UnsolvedMath, OpenConjecture, Open Problem Garden, OpenProblem.ai and Cairn content are not directly imported. Read `docs/source-audit.md` for source-specific constraints. In particular, metadata licenses cannot override third-party text rights, and a permissive license on a scraping pipeline does not license its input papers.

Dependency packages carry their own notices in their npm distributions; the lockfile records actual versions. Screenshots show the local application and the licensed imported material. No remote assets, fonts or stock imagery are redistributed.
