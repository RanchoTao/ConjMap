# V0.4 mathematical relation verification

Review date: 2026-10-24. Status: **PARTIAL**.

All **12** V0.2 candidate edges were compared against their exact stored problem and claim variants, surrounding definitions, and available source proof bodies. **9** remain reasonable candidates; **3** require an endpoint, domain, or relation-type correction. **0** relations are promoted to verified. No Lean, solver, MathForge task, or mathematical experiment was run by this review. No human expert approval is claimed.

This is an independent automated desk review by the `Codex / relation_review` reviewer of the existing records. Independent agent review is not independent human certification. The source file hashes and exact excerpts are retained in [relation-reviews.json](../data/v04/relation-reviews.json). Every record has all eight obligation categories: model, parameters, assumptions, quantifiers, topology, rate, constants, and limit exchange. `ANALYZED_NOT_CERTIFIED` records reasoning that still needs a scoped proof or qualified review; it does not mean a proof obligation is formally discharged. Unused analytic categories are explicitly explained rather than silently omitted.

## Source and proof boundary

The source revision is `2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6` of Google DeepMind Formal Conjectures, under Apache-2.0. Source syntax, source authors' theorem tags, proof presence, proof execution, and the truth of a conjecture are separate facts. A declaration ending in `sorry` cannot supply a proof receipt. Even an actual proof body is only inspected source until its exact toolchain and dependencies are checked and its axioms audited.

The inherited V0.2 graph is preserved. Corrections below are append-only recommendations, with the original edge IDs retained for traceability. Neither the 120 original problems nor the candidate endpoints are deleted, and no research result is allowed to write a solved/verified status.

The V0.4 runtime adds a validated review overlay: the three challenged edges are withheld from the active mathematical graph, while all twelve original records remain available in source history and detail views. The graph retains 82 navigation associations and exposes nine active mathematical candidates only when unverified candidates are enabled. English and Chinese detail controls distinguish the three scoped dossier reviews, each evidence dimension, and the challenged relation history. This projection does not change a mathematical problem status or issue a verification receipt.

| Original relation | Variant / direction finding                                                                                                                         | V0.4 disposition    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| relation-v02-01   | Target endpoint is the conditional theorem Beal -> FLT, not the bare FLT proposition.                                                               | CORRECTION_REQUIRED |
| relation-v02-02   | Equivalence is between the full epsilon schemes, not a pointwise equivalence at one fixed epsilon.                                                  | KEEP_CANDIDATE      |
| relation-v02-03   | Quality finite-exception formulation matches radical finite exceptions after log-domain checks, then needs relation 02 to reach constant-bound abc. | KEEP_CANDIDATE      |
| relation-v02-04   | A standard substitution gives the intended implication; the upstream consequence has no assumption parameter linking it to four exponentials.       | KEEP_CANDIDATE      |
| relation-v02-05   | Half-frequency conclusion directly implies the weaker exact rational 38234/100000 frequency bound.                                                  | KEEP_CANDIDATE      |
| relation-v02-06   | Ground cardinality <=12 is a genuine restriction of the universal conjecture.                                                                       | KEEP_CANDIDATE      |
| relation-v02-07   | Family cardinality <=50 is a genuine restriction; the source attributes extension from 46 to combined work.                                         | KEEP_CANDIDATE      |
| relation-v02-08   | Fin 2 is an exact finite-ground specialization with an upstream executable proof body.                                                              | KEEP_CANDIDATE      |
| relation-v02-09   | A singleton in the family supplies nonemptiness and the excluded-family premise; source contains an injection proof.                                | KEEP_CANDIDATE      |
| relation-v02-10   | The child declaration includes characteristic zero; it is not literally a restricted instance of the stored positive-characteristic parent.         | CORRECTION_REQUIRED |
| relation-v02-11   | Use an explicit M5 -> exists M implication; 'generalizes' from an existential weakening obscures the strength direction.                            | CORRECTION_REQUIRED |
| relation-v02-12   | Dirichlet GRH genuinely generalizes RH through q=1 and the trivial primitive character; retain precise zero exclusions.                             | KEEP_CANDIDATE      |

## Corrections requiring explicit versioning

1. **relation-v02-01:** `claim-v02-01` is the conditional theorem `bealConjecture → FermatLastTheorem`, not the conclusion-only proposition `FermatLastTheorem`. A graph intended to show Beal → FLT should create a new conclusion-only statement node and preserve the conditional proof as its evidence. The old Beal → conditional-theorem edge obscures statement granularity; it is not a proof of Beal.
2. **relation-v02-10:** the parent is positive-characteristic resolution, while the child theorem covers **all perfect fields** of dimension ≤3. The unmodified child is not literally a domain restriction of that parent. Create a positive-characteristic restricted child, retaining prime-`p` and `CharP k p`; otherwise a separate characteristic-zero theorem and case split are required.
3. **relation-v02-11:** replace ambiguous existential “generalizes” wording by a new candidate **`cm-000028` (IsBuchi 5) → `claim-v02-11` (∃M≥1, IsBuchi M)** with type `implies`. The witness is 5. An unspecified existential M supplies no reverse implication to M=5.

ABC relations 02 and 03 additionally require full universal closure over ε>0. Do not display a stronger, pointwise same-ε equivalence.

## Per-relation reasoning and remaining proof obligations

### relation-v02-01: cm-000008 implies claim-v02-01

**CORRECTION_REQUIRED; Candidate Layer; proof kernel NOT_RUN; human review pending.**

Intended: Beal conjecture implies FermatLastTheorem. Current claim-v02-01 denotes that conditional implication itself.

Precise premises:

- A,B,C and x,y,z are natural numbers; bases nonzero and exponents >2.
- Normalize a hypothetical FLT counterexample by the common gcd before applying Beal.

Desk derivation, offered for checking:

1. Given a nonzero equal-exponent FLT counterexample, divide all three bases by their common gcd.
2. The divided bases are positive, still satisfy the equal-exponent equation, and have joint gcd 1.
3. Beal yields joint gcd >1, contradicting normalization.

Source: [FormalConjectures/Wikipedia/BealConjecture.lean, lines 46–69](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/BealConjecture.lean#L46-L69), SHA-256 `eb7bd938b23049783832bc95c239115960d05e4a5d3f0e4c3d13547af9b6b614`.

Proof evidence: source proof body present; local kernel execution NOT_RUN.

Variant / counterexample risk: The claim node must separate theorem statement (Beal -> FLT) from conclusion (FLT). Source location L46-L47 alone hides the proof L48 onward.

Remaining: verify the exact domain and quantifier bridges in a trusted checker or scoped accepted proof, obtain qualified independent review, then issue a versioned approval receipt. The eight detailed obligation records and exact original endpoint statements are in the JSON ledger.

### relation-v02-02: cm-000001 equivalent claim-v02-02

**KEEP_CANDIDATE; Candidate Layer; proof kernel NOT_RUN; human review pending.**

Constant-bound abc for every epsilon>0 iff finitely many strict exceptions for every epsilon>0.

Precise premises:

- Positive pairwise-coprime natural triple a+b=c; r=rad(abc)>=2.
- epsilon is universally quantified; K_epsilon may depend on epsilon and not on the triple.

Desk derivation, offered for checking:

1. Finite exceptions at epsilon imply a strict constant bound by choosing K larger than 1 and every exceptional ratio c/r^(1+epsilon).
2. For the converse at target epsilon, use the constant-bound assertion at delta=epsilon/2.
3. An epsilon-exception and the delta-bound give r^(epsilon/2)<K_delta; hence r and then c are bounded, giving finitely many natural triples.

Source: [FormalConjectures/Wikipedia/ABC.lean, lines 63–75](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/ABC.lean#L63-L75), SHA-256 `e05d9ee80f0e05233958028176323b94341eececc0defd9449b8ddeb11dbca88`.

Proof evidence: Both declarations end in sorry; only a desk derivation, no accepted proof receipt.

Variant / counterexample risk: Using only the bound at the SAME fixed epsilon gives no finite-exception proof. Stored theorem parameters must be universally closed, and strict '<' requires the extra margin in K.

Remaining: verify the exact domain and quantifier bridges in a trusted checker or scoped accepted proof, obtain qualified independent review, then issue a versioned approval receipt. The eight detailed obligation records and exact original endpoint statements are in the JSON ledger.

### relation-v02-03: cm-000001 equivalent claim-v02-03

**KEEP_CANDIDATE; Candidate Layer; proof kernel NOT_RUN; human review pending.**

Full epsilon constant-bound abc iff full epsilon finite quality exceptions; not an unproved identification by file co-location.

Precise premises:

- Same positive coprime triples a+b=c.
- rad(abc)>=2, so log(rad(abc))>0; c>=2.
- quality is log(c)/log(rad(abc)), epsilon>0.

Desk derivation, offered for checking:

1. For each admissible triple, multiply the quality inequality by the strictly positive denominator log r.
2. Use log(r^(1+epsilon))=(1+epsilon)log r and strict monotonicity to identify the exceptional sets.
3. Apply the full-scheme equivalence described for relation 02; no new constant-uniformity claim.

Source: [FormalConjectures/Wikipedia/ABC.lean, lines 81–84](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/ABC.lean#L81-L84), SHA-256 `e05d9ee80f0e05233958028176323b94341eececc0defd9449b8ddeb11dbca88`.

Proof evidence: Definitions and sorry declarations only; logarithm lemmas and relation 02 proof are missing.

Variant / counterexample risk: Division by a nonpositive/zero logarithm invalidates the inequality manipulation. Current declaration bodies are sorry and do not prove the equivalence.

Remaining: verify the exact domain and quantifier bridges in a trusted checker or scoped accepted proof, obtain qualified independent review, then issue a versioned approval receipt. The eight detailed obligation records and exact original endpoint statements are in the JSON ledger.

### relation-v02-04: cm-000072 implies claim-v02-04

**KEEP_CANDIDATE; Candidate Layer; proof kernel NOT_RUN; human review pending.**

Four-exponentials proposition implies: for every irrational real t, 2^t or 3^t is transcendental over Q.

Precise premises:

- t is real irrational; take x=(1,t) and y=(log 2,log 3) in C.
- Pairs must be Q-linearly independent; real-to-complex transcendence must correspond.

Desk derivation, offered for checking:

1. Irrationality makes (1,t) Q-linearly independent.
2. A rational dependence between log 2 and log 3 would, after clearing denominators and exponentiating, give 2^m*3^n=1; prime factorization forces m=n=0.
3. The four exponentials are 2,3,2^t,3^t. Since 2 and 3 are algebraic, the transcendental one is among the last two.

Source: [FormalConjectures/Wikipedia/Exponentials.lean, lines 48–50](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/Exponentials.lean#L48-L50), SHA-256 `d66a164acaff7b58e97836fa7cb6d02870098f2484bf035907aaf163c98e8e50`.

Proof evidence: Source comment states implication; both declarations use sorry.

Variant / counterexample risk: The source consequence is a separate theorem ending in sorry, not a conditional proof. Complex exponential/real rpow correspondence and algebraic coercion need proof.

Remaining: verify the exact domain and quantifier bridges in a trusted checker or scoped accepted proof, obtain qualified independent review, then issue a versioned approval receipt. The eight detailed obligation records and exact original endpoint statements are in the JSON ledger.

### relation-v02-05: cm-000118 implies claim-v02-05

**KEEP_CANDIDATE; Candidate Layer; proof kernel NOT_RUN; human review pending.**

General union-closed half bound implies the stored Yu-bound statement.

Precise premises:

- Same decidable ground type n, Nonempty n, finite family A != {empty}, union closure.
- Family cardinality is nonnegative and 38234/100000 <= 1/2.

Desk derivation, offered for checking:

1. Use the same witness i furnished by the half bound.
2. Multiply the rational constant inequality by the nonnegative family cardinality.
3. Conclude weaker_bound*|A| <= (1/2)*|A| <= frequency(i).

Source: [FormalConjectures/Wikipedia/UnionClosed.lean, lines 72–77](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/UnionClosed.lean#L72-L77), SHA-256 `2eed6f767e60e2103c3edb55d74416ab58961129cf89edcb0f9861b47698a265`.

Proof evidence: Conditional arithmetic derivation is not kernel-checked; both source theorem bodies are sorry.

Variant / counterexample risk: This proves only a conditional weakening; it neither proves the general half bound nor independently verifies Yu's published sharper-than-older-bounds argument.

Remaining: verify the exact domain and quantifier bridges in a trusted checker or scoped accepted proof, obtain qualified independent review, then issue a versioned approval receipt. The eight detailed obligation records and exact original endpoint statements are in the JSON ledger.

### relation-v02-06: claim-v02-06 special_case_of cm-000118

**KEEP_CANDIDATE; Candidate Layer; proof kernel NOT_RUN; human review pending.**

Special-case arrow restricted -> general is taxonomic; logical implication is general -> restricted.

Precise premises:

- Ground type is Fintype and Nonempty with Fintype.card n <=12.
- Same finite family, exclusion A!={empty}, union closure and half bound.

Desk derivation, offered for checking:

1. Instantiate the universal half-bound assertion for any finite ground type satisfying the extra size bound.
2. The extra cardinality premise is unused by that conditional specialization.

Source: [FormalConjectures/Wikipedia/UnionClosed.lean, lines 85–91](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/UnionClosed.lean#L85-L91), SHA-256 `2eed6f767e60e2103c3edb55d74416ab58961129cf89edcb0f9861b47698a265`.

Proof evidence: Source known-result declaration uses sorry; specialization derivation not kernel-checked.

Variant / counterexample risk: This relation does not verify the published 12-element result. Bound is on the entire ground type, not number of sets; active-universe encoding must not be silently substituted.

Remaining: verify the exact domain and quantifier bridges in a trusted checker or scoped accepted proof, obtain qualified independent review, then issue a versioned approval receipt. The eight detailed obligation records and exact original endpoint statements are in the JSON ledger.

### relation-v02-07: claim-v02-07 special_case_of cm-000118

**KEEP_CANDIDATE; Candidate Layer; proof kernel NOT_RUN; human review pending.**

Special-case arrow restricted -> general; logical implication general -> family-cardinality restriction.

Precise premises:

- Nonempty decidable ground type; A finite, union-closed, A!={empty}.
- The exact extra bound is #A<=50.

Desk derivation, offered for checking:

1. Instantiate the general assertion for each family with #A<=50; the conclusion is identical.
2. Keep the two literature inputs separate when independently auditing why the restricted proposition is true.

Source: [FormalConjectures/Wikipedia/UnionClosed.lean, lines 102–108](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/UnionClosed.lean#L102-L108), SHA-256 `2eed6f767e60e2103c3edb55d74416ab58961129cf89edcb0f9861b47698a265`.

Proof evidence: Source known-result declaration uses sorry; no proof from either cited paper accepted.

Variant / counterexample risk: Do not confuse family cardinality50 with ground cardinality12 or attribute the whole50 bound solely to the 2010 paper; upstream says 46 plus the 12-element result.

Remaining: verify the exact domain and quantifier bridges in a trusted checker or scoped accepted proof, obtain qualified independent review, then issue a versioned approval receipt. The eight detailed obligation records and exact original endpoint statements are in the JSON ledger.

### relation-v02-08: claim-v02-08 special_case_of cm-000118

**KEEP_CANDIDATE; Candidate Layer; proof kernel NOT_RUN; human review pending.**

Special-case arrow Fin2 -> general; logical implication general -> Fin2.

Precise premises:

- A : Finset (Finset (Fin 2)), A!={empty}, union-closed.
- Fin2 supplies DecidableEq and Nonempty.

Desk derivation, offered for checking:

1. Instantiate the general half-frequency proposition at n=Fin2.
2. Source independently proves this finite proposition with decide +revert +kernel; this review inspects text only.

Source: [FormalConjectures/Wikipedia/UnionClosed.lean, lines 115–119](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/UnionClosed.lean#L115-L119), SHA-256 `2eed6f767e60e2103c3edb55d74416ab58961129cf89edcb0f9861b47698a265`.

Proof evidence: Actual source proof decide +revert +kernel exists; local execution NOT_RUN.

Variant / counterexample risk: Source syntax '+kernel' is not evidence this checkout has been executed in the declared toolchain. The finite result cannot certify arbitrary ground sizes.

Remaining: verify the exact domain and quantifier bridges in a trusted checker or scoped accepted proof, obtain qualified independent review, then issue a versioned approval receipt. The eight detailed obligation records and exact original endpoint statements are in the JSON ledger.

### relation-v02-09: claim-v02-09 special_case_of cm-000118

**KEEP_CANDIDATE; Candidate Layer; proof kernel NOT_RUN; human review pending.**

Singleton-containing families are a special case; general conjecture implies this case, while the case alone does not prove general conjecture.

Precise premises:

- Union-closed finite family A and i:n with {i} in A.
- No explicit Nonempty n premise is needed because the parameter i is a witness.
- {i} != empty implies A!={empty}.

Desk derivation, offered for checking:

1. Partition A into B (sets avoiding i) and C (sets containing i).
2. Map X in B to X union {i}; union closure and {i} in A place the image in C.
3. Deleting i proves injection. Thus |B|<=|C| and |A|=|B|+|C|<=2|C|.

Source: [FormalConjectures/Wikipedia/UnionClosed.lean, lines 126–148](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/UnionClosed.lean#L126-L148), SHA-256 `2eed6f767e60e2103c3edb55d74416ab58961129cf89edcb0f9861b47698a265`.

Proof evidence: Actual injection/counting proof L130-L148 exists; kernel execution NOT_RUN.

Variant / counterexample risk: Adding only 'a singleton exists somewhere in the ground set' would be insufficient; it must belong to A. Source proof is present but not rerun.

Remaining: verify the exact domain and quantifier bridges in a trusted checker or scoped accepted proof, obtain qualified independent review, then issue a versioned approval receipt. The eight detailed obligation records and exact original endpoint statements are in the JSON ledger.

### relation-v02-10: claim-v02-10 special_case_of cm-000103

**CORRECTION_REQUIRED; Candidate Layer; proof kernel NOT_RUN; human review pending.**

Parent (positive characteristic, arbitrary dimension) implies only the positive-characteristic restriction of the <=3 declaration.

Precise premises:

- Perfect field; X integral, separated, locally finite type and quasi-compact over k.
- Child has topologicalKrullDim X<=3, but NO CharP k p or prime p premise.
- Add positive-characteristic premises to make a genuine specialization.

Desk derivation, offered for checking:

1. Under an additional prime p and CharP k p, the parent directly supplies HasResolution for each <=3 instance.
2. The unmodified child also covers characteristic zero, which needs Hironaka's theorem or a separate case split and proof; the parent alone supplies no char-zero instance.

Source: [FormalConjectures/Wikipedia/ResolutionOfSingularities.lean, lines 134–139](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/ResolutionOfSingularities.lean#L134-L139), SHA-256 `424fe7fcf689b208a6e96fbaeaa2dde74b70ccae372fbe164d24c85044db7795`.

Proof evidence: Both relevant theorem bodies sorry; literal source domain mismatch requires correction.

Variant / counterexample risk: Silent characteristic-domain expansion. Perfectness cannot be removed: source states an imperfect-field counterexample even in dimension0. Source paper gives regular source; smoothness over perfect k is an additional semantic bridge.

Remaining: verify the exact domain and quantifier bridges in a trusted checker or scoped accepted proof, obtain qualified independent review, then issue a versioned approval receipt. The eight detailed obligation records and exact original endpoint statements are in the JSON ledger.

### relation-v02-11: claim-v02-11 generalizes cm-000028

**CORRECTION_REQUIRED; Candidate Layer; proof kernel NOT_RUN; human review pending.**

cm-000028 (IsBuchi5) implies claim-v02-11 (exists M>=1,IsBuchiM) by witness5. No converse has been established.

Precise premises:

- Integers x,a; IsBuchi M quantifies n in Finset.range M and IsSquare of (x+n)^2+a.
- The existential witness5 is positive.

Desk derivation, offered for checking:

1. Given IsBuchi5, choose M=5 in the existential statement.
2. Discharge 1<=5. The remaining predicate is the supplied IsBuchi5.
3. An unspecified existential M need not equal5 and supplies no reverse proof.

Source: [FormalConjectures/Wikipedia/Buchi.lean, lines 42–56](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Wikipedia/Buchi.lean#L42-L56), SHA-256 `71716cb13181d43db271bdcab062a3844cea3fda157438b452b897d5d865b2ce`.

Proof evidence: Existential introduction desk proof; source statements both sorry; no accepted proof receipt.

Variant / counterexample risk: Never display existential M -> M5 as an implication; 'generalizes' has multiple incompatible meanings here. General square sequences must also have the exact integer-offset representation before use.

Remaining: verify the exact domain and quantifier bridges in a trusted checker or scoped accepted proof, obtain qualified independent review, then issue a versioned approval receipt. The eight detailed obligation records and exact original endpoint statements are in the JSON ledger.

### relation-v02-12: claim-v02-12 generalizes cm-000104

**KEEP_CANDIDATE; Candidate Layer; proof kernel NOT_RUN; human review pending.**

Full Dirichlet GRH implies RH; generalizes arrow GRH -> RH agrees with this implication.

Precise premises:

- q nonzero; primitive Dirichlet character over C; zeros outside the specified integer image of trivialZeros.
- At q=1 use character1, known primitive; identify its L-function with zeta.
- RH excludes s=1, and the source test uses riemannZeta_one_ne_zero.

Desk derivation, offered for checking:

1. Specialize universal GRH at q=1 and the unique character1.
2. The definition of trivialZeros at q=1 yields the negative even integers.
3. Use the source's type-level equivalence test and the nonzero-at1 fact to reconcile the pole exclusion.

Source: [FormalConjectures/Millennium/RiemannHypothesis.lean, lines 83–94](https://github.com/google-deepmind/formal-conjectures/blob/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/FormalConjectures/Millennium/RiemannHypothesis.lean#L83-L94), SHA-256 `db04f2f25a73fb0fc473843227fb3a28bca6ef1808e222e2d365f97120c46f67`.

Proof evidence: Actual source equivalence proof L90-L94 exists; kernel execution NOT_RUN.

Variant / counterexample risk: This concerns Dirichlet L-functions only, not Dedekind zeta ERH or Artin conditional hypotheses. A proved implication does not prove either endpoint conjecture.

Remaining: verify the exact domain and quantifier bridges in a trusted checker or scoped accepted proof, obtain qualified independent review, then issue a versioned approval receipt. The eight detailed obligation records and exact original endpoint statements are in the JSON ledger.

## Literature access and negative evidence

The primary source of the relation audit is the already licensed, pinned source code. Bibliographic checks were bounded:

- The publisher record for Lei Yu's [Dimension-Free Bounds for the Union-Closed Sets Conjecture](https://www.mdpi.com/1099-4300/25/5/767) matches the source's 2023, Entropy 25(5), 767 citation. This confirms a citation target; it is not an independent verification of Yu's argument or a current best-bound survey.
- [Cossart and Piltant, arXiv:1412.0868](https://arxiv.org/abs/1412.0868) was seen at metadata/abstract level. The journal DOI could not be opened by the web tool. The full proof and the regular-to-smooth bridge over a perfect field remain unreviewed here.
- An initially recalled arXiv identifier `2212.00627` was checked and rejected because it is a fluid-dynamics paper. It is recorded as a rejected lead in the access ledger and supplies no mathematical evidence.
- A failed acquisition is an infrastructure observation, not evidence against the mathematical statement. No latest-literature completeness or mathematical novelty claim is made.

## Next checkable units

The source contains actual proof bodies for Beal → FLT (L46–L69), the union-closed Fin 2 case (L115–L119), the singleton case (L126–L148), and the GRH q=1 equivalence (L91–L94). These are useful bounded follow-up units, subject to exact toolchain availability, imported-axiom checks, and MathForge admission. The singleton proof also has a short injection argument above; a finite sample would not verify that universal argument.

No count target is used to relax the Verified Layer gate. The present independently accepted count remains **0**. A later engine receipt for a restricted statement audit must not silently promote any candidate relation or conjecture status.

## Independent scope check for the proposed first real calibration

The proposed task is the already-known Fin 2 frequency statement, not a search for new mathematics. It matches the stored source variant if and only if the engine enumerates all 16 families of the four subsets of `{0,1}`, excludes exactly the singleton family `{empty}`, checks union closure for every pair of member sets, and checks the exact integer inequality `2 * frequency(i) >= family_cardinality` for at least one of the two ground elements. The empty family is allowed by the declaration and satisfies the inequality with either ground element; excluding it would narrow the tested source domain.

The reviewer inspected the relevant local replay prohibition without changing it. Its specific historical target and blocked actions are distinct from a known-result frequency calibration. This is **acceptable for engine admission review**, not an engine authorization or a release of any historical hold. The engine must check all active guards, record exact source/context hashes and the task's known-result purpose, admit at most one bounded offline task, and issue its own receipt. Private history contents are not redistributed here.

Independent set and bitmask representations can expose an implementation disagreement; their agreement alone is not Lean kernel certification. A successful Fin 2 run establishes its explicitly enumerated finite check and the transport/evidence chain only. It does not prove the general conjecture, the all-size singleton injection argument, or promote relation-v02-08 to the Verified Layer. Actual execution results belong in the integration receipt, not in this desk review.

## Reproducibility check

`npx vitest run tests/v04-relations.test.ts` passed all 6 data-integrity and boundary tests during authoring. These tests cover the original twelve IDs, exact endpoint variants, every source byte hash and quoted line span, the eight obligation categories, required corrections, epsilon reparameterization, and empty-family/singleton distinctions. They are engineering checks, not mathematical proof execution.
