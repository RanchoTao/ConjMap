# Mathematical dossier review — V0.4

Review date: **2026-10-24**, day precision. Outcome: **PARTIAL**. Three existing dossiers received a deeper, scoped review; zero dossiers are fully cleared and zero conjectures are mathematically verified. The original thirty V0.2 dossiers remain unchanged.

Reviewer: `codex-v04-dossier-review`, a separate agent reviewing the pinned source and primary literature. This is an additional automated review, with shared tools and context; it is neither independent human review nor expert approval. No Lean, solver, or research job was run for this review. The integration owner's single real-run budget is separate.

The machine-readable companion is [dossier-reviews.json](../data/v04/dossier-reviews.json). `DONE` below has a precisely bounded meaning: a provenance or statement-inspection obligation was discharged by the named agent. It never means that an open conjecture was proved. `PARTIAL` identifies unfinished obligations; `NOT_RUN` identifies work not performed. No review artifact writes a problem's mathematical status.

| Dimension                | Beal    | Büchi M5 | Union-closed | Scope of a positive result                                                                                                  |
| ------------------------ | ------- | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| SOURCE_VERIFIED          | DONE    | DONE     | DONE         | Licensed pinned Lean bytes fetched again and matched byte-for-byte, with declaration locators                               |
| STATEMENT_VERIFIED       | DONE    | DONE     | DONE         | Explicit domains, quantifiers and boundary cases of the imported formulation inspected by the agent                         |
| LITERATURE_REVIEWED      | PARTIAL | PARTIAL  | PARTIAL      | Identified primary versions and exact result scope; full proof/dependency and current-literature coverage remain incomplete |
| FORMAL_STATEMENT_CHECKED | PARTIAL | PARTIAL  | PARTIAL      | Source-level signature and local definitions inspected; transitive imports/elaboration not executed                         |
| PROOF_KERNEL_VERIFIED    | NOT_RUN | NOT_RUN  | NOT_RUN      | No kernel invocation and no axiom audit                                                                                     |
| HUMAN_REVIEWED           | NOT_RUN | NOT_RUN  | NOT_RUN      | No human or expert signed receipt                                                                                           |
| MATHEMATICALLY_VERIFIED  | NOT_RUN | NOT_RUN  | NOT_RUN      | The conjectures are not certified by this work                                                                              |

## Source provenance and review method

All three selected source files belong to Google DeepMind's Apache-2.0 Formal Conjectures revision `2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6`. A fresh HTTP 200 retrieval from the revision-specific raw GitHub URL matched the bundled bytes on the review date:

| Problem     | File                            | SHA-256                                                            | Reviewed locators                                                                       |
| ----------- | ------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `cm-000008` | `Wikipedia/BealConjecture.lean` | `eb7bd938b23049783832bc95c239115960d05e4a5d3f0e4c3d13547af9b6b614` | Definition 30–32; selected declaration 34–40; conditional FLT argument 42–69            |
| `cm-000028` | `Wikipedia/Buchi.lean`          | `71716cb13181d43db271bdcab062a3844cea3fda157438b452b897d5d865b2ce` | Definition 30–34; general problem 36–44; selected declaration 47–56; small cases 58–111 |
| `cm-000118` | `Wikipedia/UnionClosed.lean`    | `2eed6f767e60e2103c3edb55d74416ab58961129cf89edcb0f9861b47698a265` | Family/closure 36–41; selected declaration 54–64; variants 66–149                       |

The historical input `data/v02/dossiers.json` has SHA-256 `fdb5a53ad6c897fe8b008e323bed8c21ded6ed9c490f8ffc7b866a494c581d78`. Each new record links its previous dossier and records the original statement hash. The review closes only the listed obligations, preserving every unresolved obligation and the historical `unknown` catalog status.

Only a few primary pages were retrieved. Full HTML was accessed for the two identified arXiv versions, but the reading scope was selected statements, definitions and proof-outline passages, **not a complete proof audit**. The external response hashes in the companion JSON identify fetched bytes; response bodies were not redistributed. Dynamic HTML can change even at a versioned URL, so these are acquisition receipts, not promises of byte-identical future rendering. No search result absence is treated as an open-status or novelty proof.

## 1. Beal conjecture — `cm-000008`

**Precise imported target.** For every six naturals `A,B,C,x,y,z`, if `A,B,C` are nonzero, `x,y,z>2`, and `A^x+B^y=C^z`, then the gcd of the three bases is greater than one. Nonzero naturals are positive integers. The exponents need not be equal, prime, or coprime. The conclusion requires a factor common to all three bases, rather than a factor for merely one pair. By prime factorization, gcd greater than one is equivalent to a common prime divisor.

**Source correspondence.** [Mauldin's institutional statement](https://sites.math.unt.edu/~mauldin/beal.html), first paragraph, agrees with these domains and the common-prime conclusion. It also points to the 1997 Notices announcement. Direct retrieval of the [AMS announcement](https://www.ams.org/notices/199711/beal.pdf) and [current prize page](https://www.ams.org/profession/prizes-awards/ams-supported/beal-prize) returned HTTP 403 through the browsing tool. Original-publication priority and current prize status are therefore not independently closed by those inaccessible pages.

**Lean fidelity.** The local definition spells out all six natural variables and guards at lines 30–32. `Finset.gcd {A,B,C} id` is the gcd of a set of base values; collapsing repeated equal values does not change the gcd. The selected declaration ends with `sorry` at line 40. The later `flt_of_beal_conjecture` is a conditional theorem: it assumes Beal, normalizes a hypothetical common-exponent solution by its gcd, and derives a contradiction for a primitive solution. It does not establish Beal. Source-level inspection does not establish the imported definition of `FermatLastTheorem`, compilation success, or an axiom-free proof.

**Literature boundary.** [Zhou, arXiv:2510.05448v1](https://arxiv.org/abs/2510.05448v1), dated 2025-10-06, applies IUT-related assumptions/methods to generalized Fermat equations and explicitly leaves exceptional signatures; its abstract does not provide a complete Beal resolution. [Daras, arXiv:2409.03758v1](https://arxiv.org/abs/2409.03758v1), dated 2024-08-14, makes a proof claim while discussing cryptosystems. Its integer claim and its finite-field congruence applications require separate verification. Neither abstract supplies independent approval or a checked proof. A bounded 2026 search found further claims, which were not accepted or used to update status.

**Closed obligations.** Pinned bytes; exact six-variable domain and quantifier order; nonzero/positive correspondence; gcd/common-prime meaning; conditional versus unconditional FLT direction.

**Remaining obligations.** Obtain the original announcement through a lawful accessible source; inspect current accepted literature and competing methods in full; elaborate the exact dependency closure and inspect axioms; obtain a qualified independent reviewer. Catalog status remains `unknown`.

## 2. Büchi M5 — `cm-000028`

**Precise imported target.** For every pair of integers `x,a`, if `(x+n)^2+a` is an integer square for each natural `n` in `Finset.range 5` (exactly `0,1,2,3,4`), then `a=0`. Neither `a≥0` nor `x≥0` is assumed. `IsSquare` requires a square witness and permits zero. The selected case is universal at length five; the separate `∃ M≥1, IsBuchi M` is a weaker existential question. The selected declaration ends with `sorry` at line 56.

**Formulation correspondence, explicit agent argument.** Write five square values as `q_0,...,q_4` with second difference two, and put `D=q_1−q_0`. If `D` were even, both first squares would have the same parity, so `D≡0 mod 4`; then `q_2≡q_0+2 mod 4`, impossible for a square. Thus `D` is odd. The recurrence gives `q_n=q_0+nD+n(n−1)`. Setting `x=(D−1)/2` and `a=q_0−x²` gives `q_n=(x+n)²+a`. Conversely that polynomial has second difference two. If the squares are also `(t+n)²` at consecutive indices, comparing first differences gives `x=t` and hence `a=0`. This closes the earlier **informal parity/offset explanation**; it is agent reasoning, not a new kernel receipt or proof of the M5 conjecture. Roots themselves may change sign; equality of square values is the relevant condition.

**Current claim and reading scope.** [Xiao, arXiv:2412.16740v3](https://arxiv.org/html/2412.16740v3), dated 2025-06-07, Theorem 1.3, claims that five integer squares with second difference two must be consecutive squares. This is a relevant full-result claim, rather than evidence that ConjMap has verified the result. The review read Theorem 1.3, the proof outline and §2's recurrence setup. The remaining parametrization, rank and determinant arguments were not independently checked.

**Concrete unresolved source risk.** In the retrieved HTML, §2, displayed equation (2.3), the expression indexed as `u_k²` yields `u_2²` at `k=1` despite the surrounding `a_1=u_1²` convention. This appears to be an indexing or rendering discrepancy. Check the versioned PDF/TeX and the downstream index conventions before using that passage as a proof step. This is a local audit concern, not a refutation of the complete preprint. Do not silently repair the author's formula and call the proof verified.

**Closed obligations.** Pinned bytes; exact integer domains and five-index range; source declaration versus a proof; explicit offset/parity comparison with the published theorem's target.

**Remaining obligations.** Resolve the displayed indexing issue against PDF/TeX; audit the full proof and any corrections or independent assessments; formalize or separately review the formulation conversion; run the exact Lean dependency/axiom check if admitted; obtain an expert receipt. The source's historical “first open case” label is not a fresh status certification. Catalog status remains `unknown`.

## 3. Union-closed sets — `cm-000118`

**Precise imported target.** Let `n` be a nonempty type with decidable equality and `A` a finite set of finite subsets of `n`. Assume `A ≠ {∅}` and closure under pairwise union. Then some `i:n` belongs to at least half of `A`, with the inequality interpreted in the rationals. Families have no duplicate members; they are not multisets. `n` need not itself be finite, but the union of members is finite. If `A=∅`, a nonempty ground type supplies a witness and both sides are zero. If `A` is nonempty and differs from `{∅}`, it contains a nonempty member. These boundary cases explain how the formal variant extends the standard nonempty-member formulation.

**Lean fidelity and limits.** The closure definition is at lines 40–41 and the target at 59–64. The target ends with `sorry`. The weaker `0.38234` statement, ground-cardinality-at-most-12 statement and family-cardinality-at-most-50 statement also end with `sorry`; their `research solved` annotations are upstream metadata, not this review's kernel evidence. The Fin-2 and singleton-member variants contain proof terms, but were not executed here.

**Literature scope.** [Costa–Sadhu, arXiv:2610.02295v1](https://arxiv.org/html/2610.02295v1), dated 2026-10-01, §1/Theorem 1.2, asserts a universal lower frequency `0.3828852549667978`. This is below `1/2`, so the claimed advance does not establish the selected conjecture. The review inspected the formulation, theorem scope, dependency criterion and computational-appendix pointer, rather than executing the numerical supplement or auditing the entire entropy proof. The upstream `0.38234` annotation must not be presented as the current best bound. The paper is one bounded source, not a claim that no later or competing work exists.

**Closed obligations.** Pinned bytes; closure and finiteness definitions; distinction between an empty family and `{∅}`; nonempty ground-type requirement; rational half-frequency inequality; finite-support correspondence; separation of weaker bounds and special cases.

**Remaining obligations.** Review Frankl's original attribution and the historical literature in full; audit current proof claims, analytic dependencies and numerical certificates; typecheck and inspect axioms for the exact upstream revision; obtain qualified human review. A finite small-domain computation, if separately admitted by MathForge, would certify only that domain, never all finite families. Catalog status remains `unknown`.

## Reproduction and acceptance boundary

1. Hash the three preserved source files and compare with the table and JSON.
2. Retrieve each revision-specific raw GitHub URL in the JSON and compare the bytes with the bundled source. This was actually done for all three files with HTTP 200 and exact matches.
3. Inspect the listed one-based source spans, compare every domain/guard and verify that each selected conjecture body is `sorry`.
4. Open the exact arXiv versions and the indicated theorem/section locators. External HTML hashes are recorded without committing the full pages.
5. For further formal work, use a separately admitted, version-pinned task and preserve compiler, axioms, logs and resource receipts. That work is **NOT_RUN by this dossier review**.

No new problem, solved status, verified relationship, proof-kernel receipt, human signature or scientific execution is created by these review files. The acceptance result is three deeper scoped reviews with concrete closed obligations, three remaining PARTIAL dossiers, and zero fully cleared dossiers.

## Freshness addendum — 2026-10-28

Four bounded primary landing-page checks succeeded with HTTP 200. The current submission histories still show [Büchi v3](https://arxiv.org/abs/2412.16740), revised 2025-06-07; [Zhou's Beal-related paper v1](https://arxiv.org/abs/2510.05448), submitted 2025-10-06; and [Costa–Sadhu v1](https://arxiv.org/abs/2610.02295), submitted 2026-10-01. No newer version was listed for these three IDs. [Mauldin's institutional statement](https://sites.math.unt.edu/~mauldin/beal.html) remained accessible with the same response hash as the earlier acquisition.

The [dated metadata receipt](../data/v04/freshness-2026-10-28.json) records exact histories, access scope and actual response hashes. The October 24 review JSON is unchanged. This refresh read metadata and abstracts, with no new full-paper audit, experiment or kernel run. All three dossiers remain PARTIAL; the mathematical, human-review and indexing obligations above remain open. The separate real integration run supplies operational evidence within its finite domain and does not clear these conjecture-level obligations.
