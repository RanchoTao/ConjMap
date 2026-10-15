# Mathematical audit V0.2

**30 scoped dossiers; 0 fully cleared mathematical-status reviews. All 30 remain PARTIAL and HUMAN_REVIEW_PENDING.** This report records actual source-scope inspection and bounded primary-source searches, not independent peer review. Abstracts and source tags are not accepted proofs. No claim is promoted to solved.

The exact statements/signatures, pinned source hashes, search queries, dated findings and individual open obligations are machine-readable in `data/v02/dossiers.json`. Review changes append versioned events; original V0.1 records are retained.

## Evidence dimensions

SOURCE_IMPORTED is established; STATEMENT_CHECKED and LITERATURE_REVIEWED remain pending because hypothesis/definition correspondence and competing full proofs have not been independently cleared. FORMAL_STATEMENT_CHECKED and PROOF_KERNEL_VERIFIED are NOT_RUN. HUMAN_REVIEW_PENDING is explicit. There is no aggregate verified flag.

## 1. Riemann hypothesis · cm-000104

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: All zeros of the meromorphically continued zeta function, excluding s=1 and negative-even trivial zeros; real part exactly 1/2. The Dirichlet-series convergence half-plane is not the domain of the conjecture.

Findings: The current Clay tracker labels RH unsolved. This supports a source-reported status, not a checked proof or exhaustive exclusion of recent claims. The pinned Lean signature aliases Mathlib's definition; its import closure and axioms were not executed.

Original attribution: Riemann 1859 is identified by Clay; original manuscript/full formulation correspondence remains pending.

Search executed: `site.claymath.org riemann hypothesis millennium problem`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Millennium/RiemannHypothesis.lean#L51-L61). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `db04f2f25a73fb0fc473843227fb3a28bca6ef1808e222e2d365f97120c46f67`.

Literature leads inspected at metadata/abstract level: [https://www.claymath.org/millennium/riemann-hypothesis/](https://www.claymath.org/millennium/riemann-hypothesis/)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 2. Weak Birch and Swinnerton-Dyer conjecture over Q · cm-000112

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Weak BSD over Q for elliptic curves: distinguish rank/order-of-vanishing from the refined leading-coefficient formula and from arbitrary number fields. Expand Weak Q before accepting correspondence.

Findings: Clay lists BSD unsolved. General rank statements do not become established because rank-zero/one special cases or numerical evidence exist. The exact Weak Q definition and analytic continuation dependencies need a separate fidelity review.

Original attribution: Birch and Swinnerton-Dyer attribution is source-supported by Clay; original papers and full-method status review pending.

Search executed: `site.claymath.org birch swinnerton dyer conjecture status`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Millennium/BSD.lean#L71-L74). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `cb2ceb3f28bd35d8dabb880dfc929ab1986d239602aeddbe34ac23d1dbd5fa87`.

Literature leads inspected at metadata/abstract level: [https://www.claymath.org/Millennium%20Problems/](https://www.claymath.org/Millennium%20Problems/); [https://www.claymath.org/wp-content/uploads/2022/02/MPPc.pdf](https://www.claymath.org/wp-content/uploads/2022/02/MPPc.pdf)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 3. Smooth four-dimensional Poincaré conjecture · cm-000100

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Smooth dimension four, with the precise manifold/category hypotheses in SmoothConjectureFor 4; not the solved topological dimension-three Poincare problem.

Findings: Clay's solved three-dimensional problem cannot resolve this selected smooth four-dimensional variant. The 2009 paper is historical evidence of the distinct question, not a fresh 2026 open-status certification.

Original attribution: The pinned source cites Wang2017; primary bibliographic and dimension/category correspondence still need checking.

Search executed: `site:arxiv.org four dimensional smooth Poincare conjecture open`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Millennium/Poincare.lean#L107-L110). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `19215b7eb592990765a114d2f5622434dc4a656e379aed31f2b785c57b2e337d`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/0906.5177](https://arxiv.org/abs/0906.5177)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 4. abc conjecture (constant-bound formulation) · cm-000001

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: For every epsilon>0, exists K(epsilon), for all coprime positive triples a+b=c, c<K rad(abc)^(1+epsilon). Pairwise coprimality, strict inequalities and exponent quantifiers must match.

Findings: IUT-related proof claims and competing assessments require full-method review. A retrieved paper announcing a proof does not establish community acceptance or settle the selected constant-bound formulation. Keep unknown.

Original attribution: Original Masser/Oesterle attribution is not independently established by this pass; do not infer it from a modern proof announcement.

Search executed: `site:arxiv.org abc conjecture Mochizuki Scholze Stix`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/ABC.lean#L68-L74). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `e05d9ee80f0e05233958028176323b94341eececc0defd9449b8ddeb11dbca88`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/2403.10430](https://arxiv.org/abs/2403.10430)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 5. Andrica's conjecture · cm-000004

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Every consecutive pair of primes, indexed by Nat.nth; strict difference of square roots below one. Check zero-based versus one-based indexing.

Findings: A heuristic prime-gap paper was found. Heuristics and finite computations do not prove a universal bound. The unrelated Andrica-Tomescu partition result is a name collision and was excluded.

Original attribution: Original 1980s proposal and current definitive status not independently established.

Search executed: `site:arxiv.org Andrica conjecture`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/Andrica.lean#L33-L39). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `06011bf2450863043e06a42228ff1f897f8f779142e4bc248bda21d7af74fc9e`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/1010.3945](https://arxiv.org/abs/1010.3945)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 6. Artin primitive roots: the selected density statement · cm-000005

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: The selected density statement imposes a=a0*b^2, squarefree a0, no perfect-power representation and a0 not congruent to 1 modulo 4. This is not the unqualified all-integer constant-density claim.

Findings: Pinned context explicitly says Hooley's conditional result needs RH for Dedekind zeta functions of Kummer fields, not merely Dirichlet GRH. No GRH-to-Artin edge is inferred from the imported RH problem. Degenerate a=0,+/-1 and perfect-power conventions need audit.

Original attribution: Hooley 1967 and Lenstra et al. are cited in the retained source context; the classical paper was not fully reviewed here.

Search executed: `site:arxiv.org Artin primitive roots Hooley GRH`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/ArtinPrimitiveRootsConjecture.lean#L135-L147). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `91af7725c51d485c59e89e682e5304118e340b55cb7c5d647ee0d964733fd976`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/1112.4816](https://arxiv.org/abs/1112.4816)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 7. Beal conjecture · cm-000008

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Positive natural A,B,C and exponents x,y,z>2, with A^x+B^y=C^z, imply gcd(A,B,C)>1. Real exponents and zeros are excluded.

Findings: Proof-claim titles were located but not accepted. The source also contains a Beal-to-FLT argument using primitive rescaling; FLT being proved does not prove Beal. No claim of a current accepted proof is made.

Original attribution: Proposal attribution and exact original statement need primary-source checking; modern claimed proofs are not original-source evidence.

Search executed: `site:arxiv.org Beal conjecture`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/BealConjecture.lean#L34-L39). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `eb7bd938b23049783832bc95c239115960d05e4a5d3f0e4c3d13547af9b6b614`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/2510.05448](https://arxiv.org/abs/2510.05448); [https://arxiv.org/abs/2409.03758](https://arxiv.org/abs/2409.03758)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 8. Beck–Fiala theorem and conjecture · cm-000010

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: A single universal C>0 works for all finite set systems with each element in at most t sets, with +/-1 coloring discrepancy <=C*sqrt(t). C cannot depend on n,m,t.

Findings: The square-root conjecture must be separated from the classical linear-in-t theorem, logarithmic factors and algorithmic variants. This bounded search did not establish a current sharp universal theorem.

Original attribution: Beck/Fiala original theorem and conjecture citation need full bibliographic recovery and hypothesis comparison.

Search executed: `site:arxiv.org Beck-Fiala conjecture discrepancy`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/BeckFialaConjecture.lean#L78-L91). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `42a2b6238446a4fef998310aacb57519ff26853573c5a13c41685f755600f06a`.

Literature leads inspected at metadata/abstract level: No adequate primary result retained; search did not establish current status.

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 9. Bunyakovsky conjecture · cm-000027

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Integer polynomial with both source-defined Bunyakovsky and Schinzel conditions, infinitely many natural inputs yielding prime absolute value. Expand these definitions before equating with the classical formulation.

Findings: A singleton polynomial and a family of linear polynomials are different scopes. NatAbs primality, positive leading coefficient and fixed-divisor conditions require definition-level matching; no implication from a similarly named prime-pattern conjecture is accepted.

Original attribution: Original statement and current publication status not established by this pass.

Search executed: `site:arxiv.org Bunyakovsky conjecture`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/Bunyakovsky.lean#L31-L39). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `bd6318fdfbe2edd554ff3a7f6698346e47df912e204a92887a4997481dff9565`.

Literature leads inspected at metadata/abstract level: No adequate primary result retained; search did not establish current status.

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 10. Büchi's problem · cm-000028

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Selected IsBuchi 5 concerns integer x,a and five squares (x+n)^2+a. General second-difference-two sequences may require a parity/offset correspondence argument.

Findings: A 2024 preprint claims a five-square solution. Neither its proof nor the equivalence of its general sequence formulation with this integer-offset definition has been checked. The source's first-open-case label therefore cannot be promoted into independent open or solved status.

Original attribution: Buchi problem history and Hensley examples appear in source context; original-paper and parity-scope review pending.

Search executed: `site:arxiv.org Buchi problem five squares nontrivial sequences integers`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/Buchi.lean#L47-L55). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `71716cb13181d43db271bdcab062a3844cea3fda157438b452b897d5d865b2ce`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/2412.16740](https://arxiv.org/abs/2412.16740)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 11. Carmichael's totient function conjecture · cm-000029

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: For every positive n, exists a different natural m with identical Euler totient. Distinguish existence of a partner from claims about exactly k preimages.

Findings: No adequate current primary-status result was retained in this bounded search. The quantified statement and multiplicity variants require separate review; unknown is retained.

Original attribution: Carmichael attribution appears in source title; original publication and modern status not independently checked.

Search executed: `site:arxiv.org Carmichael totient conjecture`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/CarmichaelTotient.lean#L56-L60). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `d821ac4fd6dd735edd31a0d020161b9ab795a843043905c50ff765b6f430160b`.

Literature leads inspected at metadata/abstract level: No adequate primary result retained; search did not establish current status.

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 12. Congruent numbers: the odd converse to Tunnell's criterion · cm-000032

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Odd squarefree natural n satisfying a specific equality of finite integer-solution counts implies n is congruent. The condition is not the unrestricted congruent-number classification.

Findings: Clay's BSD account describes Tunnell's conditional sufficient direction and an unconditional necessary direction. The selected source signature has no BSD hypothesis: it is the open sufficient conjecture, not an unconditional attribution to Tunnell's proved theorem.

Original attribution: Tunnell's original criterion and count conventions must be reviewed against the original paper; Clay provides documentary context only.

Search executed: `Tunnell congruent number site:arxiv.org`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/CongruentNumber.lean#L116-L119). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `276ee0854a91152930f7fbdc862ecb58eec8972af57f3c7f8bc3df8f2e52f5dd`.

Literature leads inspected at metadata/abstract level: [https://www.claymath.org/wp-content/uploads/2022/02/MPPc.pdf](https://www.claymath.org/wp-content/uploads/2022/02/MPPc.pdf)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 13. Four exponentials conjecture · cm-000072

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Two Q-linearly independent complex pairs x and y imply at least one of four exp(x_i*y_j) is transcendental. Complex versus real inputs and both independence assumptions are essential.

Findings: Conditional applications do not prove the conjecture. The source's irrational-t consequence for 2^t and 3^t is recorded as a candidate implication, with the logarithmic independence argument still pending.

Original attribution: Classical attribution and original statement were not recovered sufficiently for a priority claim.

Search executed: `site:arxiv.org four exponentials conjecture`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/Exponentials.lean#L32-L40). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `d66a164acaff7b58e97836fa7cb6d02870098f2484bf035907aaf163c98e8e50`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/2105.03955](https://arxiv.org/abs/2105.03955)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 14. Fuglede's conjecture in dimensions 1 and 2 (dim 2) · cm-000076

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Bounded positive-measure subsets of R^2: spectral iff translational tiling, with exact conventions for spectra and almost-everywhere tilings.

Findings: The July 2026 Zhang preprint announces counterexamples in both directions, and the source comment already flags that claim. Its finite-to-Euclidean transference and proofs were not independently verified; do not keep an unqualified certified-open label or promote a preprint abstract to a certified refutation.

Original attribution: Fuglede's original paper and the dimension-two reduction require a full-method review; no bibliography priority is inferred.

Search executed: `site:arxiv.org Fuglede conjecture dimension two 2026 Zhang`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/Fuglede.lean#L51-L60). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `dc6adc0f52c79bba603a383b03b225071cc1999c68c6e6a3ea22e3647d997b52`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/2607.15632](https://arxiv.org/abs/2607.15632)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 15. Kaplansky's Conjectures · cm-000090

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Torsion-free group algebra K[G] has no nontrivial idempotents, with the source's field/group assumptions. Not the unit conjecture or the zero-divisor conjecture.

Findings: Pinned context distinguishes a zero-divisor refutation from the idempotent problem. A counterexample to a stronger property does not automatically refute a weaker one. Exact group, field characteristic and algebra conventions remain review obligations.

Original attribution: Classical Kaplansky source and contemporary idempotent status not independently cleared.

Search executed: `site:arxiv.org Kaplansky idempotent conjecture`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/Kaplansky.lean#L60-L67). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `1053e7f52d4692d0f63a2de114309901ce49d418016c4c1756a817b27cdd7753`.

Literature leads inspected at metadata/abstract level: No adequate primary result retained; search did not establish current status.

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 16. Köthe conjecture (general matrix) · cm-000092

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: For each nil two-sided ideal I in the source ring R, every finite matrix ideal M_n(I) is nil. Nil versus nilpotent and one-sided versus two-sided formulations require care.

Findings: A September 2026 point-module paper explicitly claims a refutation. The construction and equivalence to this matrix-ideal formulation have not been reviewed, so no automatic status change is permitted.

Original attribution: Original Kothe statement and formulation-equivalence history still require primary source review.

Search executed: `site:arxiv.org Kothe conjecture`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/Koethe.lean#L125-L129). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `4288dafae4f3792105602cad97b7f067f7cc3213b5e4c0a675b269e53b5dcac3`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/2609.15080](https://arxiv.org/abs/2609.15080); [https://arxiv.org/abs/2609.26909](https://arxiv.org/abs/2609.26909)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 17. Lehmer's Mahler measure problem (best) · cm-000094

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Every integer polynomial of Mahler measure >1 has measure at least that of the specified Lehmer polynomial. This sharp-minimum claim is stronger in presentation than merely asking for a gap above one.

Findings: Do not merge a positive universal lower-gap conjecture with the precise optimal Lehmer-polynomial threshold without an equivalence proof. Nonmonic polynomials, cyclotomic factors and normalization must be examined.

Original attribution: Lehmer's original example and subsequent best-bound literature were not fully audited.

Search executed: `site:arxiv.org Lehmer Mahler measure problem`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/LehmerMahlerMeasureProblem.lean#L54-L59). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `8afc411d9916a5ec3b582e10f7aade6e6a6706d6bb22fc86cc5b4651ce9be5ac`.

Literature leads inspected at metadata/abstract level: No adequate primary result retained; search did not establish current status.

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 18. Normality of Irrational Algebraic Numbers · cm-000097

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Every irrational algebraic real is absolutely normal, meaning normal in every relevant integer base. Simple normality, absolute normality and transcendence are different properties.

Findings: The exact IsIrrationalAlgebraic and IsAbsolutelyNormal definitions remain part of the fidelity obligation. Examples of computable normal numbers or finite digit tests cannot establish the algebraic universal claim.

Original attribution: Borel1950 is cited upstream; original text and current partial results require direct examination.

Search executed: `site:arxiv.org normality algebraic Borel conjecture`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/AlgebraicNormality.lean#L72-L75). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `a51cba30e950e5b88ff742b3df0d8e51c471d4907924c0d6d16f53f68e325604`.

Literature leads inspected at metadata/abstract level: No adequate primary result retained; search did not establish current status.

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 19. The Ramsey number R(5,5) · cm-000102

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Determine the exact integer R(5,5); bounds are historical source assertions, not the requested answer or a proof.

Findings: A 2025 paper reports a heuristic/spectral estimate of 45. A probabilistic diagnostic is not a complete coloring certificate or exhaustive upper-bound proof. The source's 43..46 interval needs its own current-source reconciliation.

Original attribution: Classical Ramsey definition is retained in source; authoritative current bound certificates and exact result remain unverified.

Search executed: `site:arxiv.org R(5,5) 2025`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/RamseyNumbers.lean#L92-L99). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `d968e8602e12428644421f6440d9351d11f267862be24990a5d650d93cc70457`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/2508.16699](https://arxiv.org/abs/2508.16699)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 20. Resolution of singularities · cm-000103

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Perfect positive-characteristic field; integral separated finite-type scheme; a proper birational morphism from a smooth integral scheme. Not arbitrary imperfect fields or merely alterations.

Findings: Historical dimension-three results and programs with an unresolved termination step were found. Characteristic-zero resolution is outside the selected positive-characteristic scope. Imperfect-field counterexamples do not refute the perfect-field statement.

Original attribution: Source cites Hironaka/Hausen and dimension-three work; exact bibliographic and theorem-hypothesis checking remains open.

Search executed: `site:arxiv.org resolution of singularities positive characteristic four`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/ResolutionOfSingularities.lean#L95-L108). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `424fe7fcf689b208a6e96fbaeaa2dde74b70ccae372fbe164d24c85044db7795`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/math/0607009](https://arxiv.org/abs/math/0607009); [https://arxiv.org/abs/math/0606530](https://arxiv.org/abs/math/0606530)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 21. Serre's multiplicity conjectures · cm-000105

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Regular local ring, finitely generated modules with finite-length tensor product, and support dimensions summing to the ring dimension; intersection multiplicity strictly positive.

Findings: Positivity, vanishing and nonnegativity are different Serre conjectures. Equicharacteristic and mixed-characteristic results cannot be transferred without matching hypotheses. The bounded search did not establish the full selected case.

Original attribution: Serre's original formulation and exact current mixed-characteristic coverage require primary theorem review.

Search executed: `site:arxiv.org Serre positivity intersection multiplicity conjecture`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/SerreMultiplicityConjectures.lean#L101-L112). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `821633b00443b85927eeb6223139a294f0b2bf89685c3a9e3cb106e5d418d6b1`.

Literature leads inspected at metadata/abstract level: No adequate primary result retained; search did not establish current status.

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 22. Tournament anti-Sidorenko trees conjecture · cm-000106

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: For each finite undirected tree, exists one orientation whose homomorphism density in every finite nonempty tournament is at most 2^(-edge count). Not the undirected Sidorenko conjecture.

Findings: 2025/2026 papers establish particular orientations, paths and spiders and describe progress toward the universal statement. Quantifier order exists-orientation then all-tournaments is essential. No general solution is inferred from the title Sidorenko.

Original attribution: Fox/Himwich/Mani/Zhou conjecture lineage needs exact original paper comparison; newer abstracts provide scoped leads.

Search executed: `site:arxiv.org tournament anti-Sidorenko trees`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/SidorenkoConjecture.lean#L141-L158). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `94e2af445a02e245fd944f569baa276d003fd94adae5d1cf65d04b39f70cc7d3`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/2605.14138](https://arxiv.org/abs/2605.14138); [https://arxiv.org/abs/2512.11222](https://arxiv.org/abs/2512.11222); [https://arxiv.org/abs/2609.14655](https://arxiv.org/abs/2609.14655)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 23. Tarski's exponential function problem · cm-000109

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Decidability of the complete first-order theory of the ordered real exponential field, not just elementary arithmetic or quantifier-free polynomial formulas.

Findings: Conditional decidability under transcendence assumptions must remain conditional. The source's IsDecidable type requires semantic and algorithmic interpretation review; classical choice is not an algorithm.

Original attribution: Original Tarski question and Macintyre-Wilkie conditional theorem not fully retrieved/reviewed in this pass.

Search executed: `site:arxiv.org Tarski exponential decidability Schanuel`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/TarskiExponentialFunctionProblem.lean#L70-L76). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `cee8fb2a2eca8d675d78c2735529904ca56a29f6c8ae0bda374db71a0ae808a3`.

Literature leads inspected at metadata/abstract level: No adequate primary result retained; search did not establish current status.

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 24. The 1/3–2/3 conjecture · cm-000110

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Finite non-total partial order; uniform distribution on actual linear extensions; existence of a pair with probability in [1/3,2/3]. Source OrderHom encoding and bijectivity need correspondence checking.

Findings: A September 2026 preprint announces improvement of a general lower balance bound, not a solution at 1/3. A 2017 paper gives particular poset families. Neither clears all finite nonchains.

Original attribution: Classical proposal and exact linear-extension encoding require original-source and definition review.

Search executed: `site:arxiv.org 1/3 2/3 poset conjecture`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/conjecture_1_3_to_2_3.lean#L30-L43). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `0e0a1fd15009ef21b5aa399a1e27825212039a04972dd341eb88834a1ef22b1d`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/2609.30888](https://arxiv.org/abs/2609.30888); [https://arxiv.org/abs/1706.04985](https://arxiv.org/abs/1706.04985)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 25. The Bing-Borsuk Conjecture · cm-000111

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Metrizable homogeneous ANR of covering dimension n is a topological n-manifold, with the exact ChartedSpace/manifold separation and dimension conventions.

Findings: Historical survey distinguishes Bing-Borsuk from Busemann and from weaker generalized-manifold assertions. A 2008 survey cannot alone certify current 2026 status. Source imports and ANR definitions have not been typechecked here.

Original attribution: Bing and Borsuk attribution needs original text; historical survey is a lineage lead rather than current certification.

Search executed: `site:arxiv.org Bing-Borsuk conjecture`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/BingBorsuk.lean#L44-L52). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `558d33f6c2e322d63ab8c0e78a47774c0c083382e2befa46e120fd6f8aa91bd9`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/0811.0886](https://arxiv.org/abs/0811.0886)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 26. Union-closed sets conjecture · cm-000118

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Finite union-closed family, excluding the singleton family containing only the empty set, on a nonempty ground type; one element occurs in at least half of members. Empty-family case is vacuous under nonempty ground type.

Findings: October 2026 work reports an improved lower frequency strictly below 1/2. This is progress toward, not a proof of, Frankl's half bound. Source's old 0.38234 comment is not a current best-bound claim.

Original attribution: Frankl attribution and original proposal remain a primary-source obligation; recent preprints are bounded literature leads.

Search executed: `site:arxiv.org union closed conjecture 2026 improved bound`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/UnionClosed.lean#L54-L63). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `2eed6f767e60e2103c3edb55d74416ab58961129cf89edcb0f9861b47698a265`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/2610.02295](https://arxiv.org/abs/2610.02295); [https://arxiv.org/abs/2211.11504](https://arxiv.org/abs/2211.11504)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 27. Vizing's conjecture (1968) · cm-000119

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: All finite simple graphs G,H: domination number of Cartesian product at least the product of domination numbers. Not Vizing's edge-coloring theorem or other graph products.

Findings: An old claimed full proof and a later almost-all-pairs result were both found. A proof-title claim is not sufficient acceptance evidence. Exact hypotheses of each paper must be inspected before changing universal status.

Original attribution: Source title gives1968 while a retrieved abstract attributes a1963 conjecture; chronology remains unresolved rather than silently normalized.

Search executed: `site:arxiv.org Vizing conjecture domination Cartesian`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/VizingConjecture.lean#L42-L52). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `f0f1f733408d88b96e1d45aaef318c40b8a563ad55b84755ae01ae4dfd55249e`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/1109.0707](https://arxiv.org/abs/1109.0707); [https://arxiv.org/abs/1502.00708](https://arxiv.org/abs/1502.00708)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 28. Černý Conjecture · cm-000120

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Every synchronizing finite-state DFA with n states has a reset word of length at most (n-1)^2. Existence of a longer bound or examples attaining the lower bound do not prove the conjecture.

Findings: State count, alphabet finiteness and synchronization definitions must match. Current sharp general upper bounds and recent proof claims were not established by this pass; source remains unverified.

Original attribution: Cerny's original examples and proposal, and current universal bounds, require primary-source inspection.

Search executed: `site:arxiv.org Cerny conjecture synchronizing 2025`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/CernyConjecture.lean#L56-L62). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `089ce262e3b57203de914aa2bf6bf8533c8466e0612e7cd54db198c0e1d76d2d`.

Literature leads inspected at metadata/abstract level: No adequate primary result retained; search did not establish current status.

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 29. Gauss circle problem · cm-000078

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Error term for lattice points in a disk as radius tends to infinity; requested O(r^(1/2+o(1))). Radius and squared-radius conventions change exponents.

Findings: No current best exponent is asserted. Big-O constants, radius normalization and equivalence between o(1)-exponent and all-epsilon formulations need an explicit analytic comparison.

Original attribution: Classical Gauss-circle and latest exponent papers were not sufficiently retrieved for an authoritative current-bound claim.

Search executed: `site:arxiv.org Gauss circle problem bound`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/GaussCircleProblem.lean#L81-L93). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `bf125c74acec8a505c2a2d270787c454157d7996a3ac22f6e228e18528cf5f2d`.

Literature leads inspected at metadata/abstract level: No adequate primary result retained; search did not establish current status.

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## 30. Graceful Tree Conjecture (Ringel–Kotzig conjecture) · cm-000079

**Result: PARTIAL / status unknown / human review pending.**

Scope and quantifiers: Every finite simple tree with m edges has an injective labeling in0..m whose absolute edge differences are exactly1..m. Not approximate label ranges or a bounded-order computation.

Findings: A paper reports checking trees up to35 vertices and another proves an approximate asymptotic relaxation. Neither proves the exact all-tree statement. An old full-proof title is not accepted without checking its argument and status.

Original attribution: Rosa1967 attribution is stated in a research abstract; original article and Ringel-Kotzig correspondence need full review.

Search executed: `site:arxiv.org graceful tree conjecture`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.

[Pinned source and exact statement](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/GracefulLabeling.lean#L69-L87). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `d8c05f3bf9e23fd20e2e5a0caba0514e467b95551a270c752a8b69b245e1f896`.

Literature leads inspected at metadata/abstract level: [https://arxiv.org/abs/1003.3045](https://arxiv.org/abs/1003.3045); [https://arxiv.org/abs/1608.01577](https://arxiv.org/abs/1608.01577); [https://arxiv.org/abs/1403.1564](https://arxiv.org/abs/1403.1564)

Unclosed obligations: Current primary literature and all competing proof claims need full-method review. Formalization fidelity, source attribution and original bibliographic priority require independent review.

## Mathematical relations

12 substantive source-bound **candidates**, 0 independently verified. Exact endpoints, direction, hypotheses, source version and locator are in `data/v02/relations.json`; source statement nodes are not counted as new independent problems. Co-location never establishes equivalence. Candidates are excluded from the verified graph layer.

## Completion gap

The intake target of 30 dossiers is covered. The target of 30 rigorous, independently cleared dossiers is not met: all 30 need further full-method/hypothesis and expert review. Strong mathematical relation verification and proof-kernel checks remain unexecuted. No fabricated theorem, bibliographic priority or status is used to fill this gap.
