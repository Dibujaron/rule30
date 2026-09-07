# Seed crystals

Candidate statements for future tiers, gathered from the literature on
2026-09-07 by three research agents Rowan sent out, then deduplicated and
ranked by Rowan. Everything here is a *candidate*: a proved result in a
paper, or a robust computed fact, that could become a node. Nothing here is
on the board until it goes through `blueprint/proposals/next.json` and the
seed check like any other statement.

Conventions: single black cell at the origin; `evolve t x`; left diagonal
`leftDiagonal k j = evolve (j + k) (-j)`; right diagonal
`rightDiagonal k j = evolve (j + k) j`; column `i` is `t ↦ evolve t i`.
Rule 30 is `left XOR (centre OR right)`. **Left-permutive** means flipping
the left neighbour always flips the output; it is the property everything
below leans on.

Status words: *proved* (in the cited source), *computed* (checked
numerically, no proof in print), *folklore* (true and easy, no citation),
*open*. Difficulty is a guess for an automated prover: trivial / induction /
real math / open.

Sources the agents actually read in full: Rowland 2006; Jen's 1990 Los
Alamos report LA-UR-90-761 (OCR); Kopra 2022; Spencer 2013; Fuks 2013;
Kůrka's lecture notes; Schüle & Stoop 2012; Wolfram 1986 *Random sequence
generation*; the NKS notes; the prize essay; OEIS. Paywalled and therefore
secondhand: Jen JSP 1986, Meier–Staffelbach 1991, Cattaneo et al. 1999/2000,
Shereshevsky 1992, Jen CMP 1988.

## Seeded 2026-09-07 (for cross-reference)

The diagonal tier: `leftDiagonal_periodicFrom_pow` (period `2^k`, onset
`≤ 2^k`), `rightDiagonal_periodicFrom_pow` (period `2^k`, onset `0` —
Rowland 2006 Lemma 2 / Theorem 1), the walls `leftDiagonal_onset_le` and
`leftDiagonal_period_le`. See `Rule30/Statements.lean`.

## Tier A — one step from left-permutivity (cheap, reusable)

1. **The sideways inverse.** `evolve t (x-1) = xor (evolve (t+1) x) (evolve t x || evolve t (x+1))`
   for every configuration. *Folklore*; trivial. The project has it as
   `evolve_sub_one_eq_xor` for the single-cell run; the general-configuration
   form over `Config` is the reusable one.
2. **A difference moves right at speed exactly 1.** If `x, y` agree at every
   position `> i` and differ at `i`, then after `t` steps they differ at
   `i + t` and agree beyond it. Kůrka §5 (right Lyapunov exponent is exactly 1
   for every configuration). *Proved*; induction. The *left* speed (≈0.24) is
   empirical and not a target.
3. **Every word has exactly 4 preimages.** For every `n` and every `w : Fin n → Bool`,
   exactly 4 words `v : Fin (n+2) → Bool` map to `w`. Wolfram 1986 §4; NKS
   p. 1087; Hedlund 1969 in general. *Proved*; induction (choose the two
   rightmost cells freely, solve leftward). Verified computationally to
   `n = 8`. **The single most reusable seed here**: items 4, 5, 6, 7 and
   the ring facts all use the same leftward solve.
4. **Pre-injectivity.** Two configurations that differ in finitely many but
   at least one cell have different images. Boyle–Kitchens; Kůrka Prop. 22.
   *Proved*; trivial from item 2.
5. **Not injective.** `rule30 (fun _ => true) = rule30 (fun _ => false) = fun _ => false`.
   *Folklore*; trivial (`decide`-shaped).
6. **Surjective on ℤ.** Every configuration has a preimage. Schüle & Stoop
   Prop. 15. *Proved*; real math (compactness over item 3). Finite-support
   targets first: pick the tail `(0, 0)` and solve leftward; the leftward
   solution of an all-zero tail is all-zero. Then König/ultrafilter for the
   general case.
7. **Every column word occurs.** For every `t` and `c : Fin t → Bool` there
   is an initial configuration supported in `[-(t-1), 0]` with
   `evolve s 0 = c s` for `s < t`. NKS p. 1087 states it; the proof is
   induction using item 2 (flip cell `-(t-1)` to flip cell `(t-1, 0)` alone).
   *Proved* (argument is the agent's, not a citation); induction.
8. **A forbidden 2×2 block.** `x i = true → x (i+1) = true → rule30 x (i+1) = false`.
   So adjacent columns both black at two consecutive times never happen —
   the concrete witness for "not all `4^t` adjacent-column pairs occur".
   *Trivial*. A good first node for a new persona.
9. **Two adjacent complete columns determine everything to their left**
   (the Meier–Staffelbach weakness). If `x, y` agree on columns `i, i+1` for
   all `s ≤ T` then they agree on column `i - k` for `s ≤ T - k`. NKS
   p. 1087. *Proved*; induction from item 1.
10. **Algebraic normal form and symmetry class.** `f p q r = p XOR q XOR r XOR (q AND r)`;
    mirror is rule 86, complement rule 135, both rule 149; rule 30 is not
    amphichiral. *Trivial* (`decide`). Worth stating against the generic
    256-rule definitions so symmetry-transported theorems come free.

## Tier B — the single-cell pattern (edges, rows, columns)

11. **Rows `2^n` and `2^n - 1` restart the right edge.** Row `2^n - 1` ends in
    at least `n + 1` black cells; row `2^n` ends in a black cell preceded by
    at least `n` white cells. Rowland 2006 Theorem 1 and §3 (mirror
    orientation). *Proved*; induction over `rightDiagonal_periodicFrom_pow`
    plus `rightDiagonal k 0 = false` for `k ≥ 1`. Verified `n = 1..9`.
12. **The rightmost black run of row `t` depends only on `ord₂(t + 1)`**, and
    is strictly increasing in it: runs 1, 3, 4, 6, 7, 9, 15, 16, 24, 25, 27.
    Rowland §1, §3; OEIS A094603 (which lists the formula only as a
    conjecture, though Rowland proves it). *Proved*; weak form (`run (t + 2^k) ≥ k+1 ↔ run t ≥ k+1`)
    is induction, full form is real math (orbit of a permutation of
    `{0,1}^(k+1)`, about a page). The exact values have no formula.
13. **Rowland's period-doubling criterion for the left diagonals.** With
    diagonals `k-2, k-1` periodic from `t0` with periods `2^a, 2^b`,
    `α = max a b`: diagonal `k` has period `2^α` or `2^(α+1)`, and it doubles
    **iff** diagonal `k-1` is eventually white from `t0` and one period of
    diagonal `k-2` holds an odd number of black cells. Rowland 2006 Prop. 2,
    Lemma 3. *Proved*; "if" is induction, "only if" is real math but
    elementary. Directly under the wall `leftDiagonal_period_le`.
14. **Concrete left-diagonal periods and onsets.** Periods from `k = 0`:
    1, 1, 1, 2, 1, 2, 2, 1, 4, 1, 4, 4, …; OEIS A363345 (periods), A363346
    (transients); Brunnbauer 2019 to 410 diagonals. First appearance of each
    period: 2 at 3, 4 at 8, 8 at 29, 16 at 400, 32 at 87,867, 64 not before
    2,107,985,255 (NKS p. 871). *Computed*; any fixed `k` is provable by
    `leftDiagonal_periodicFrom_step` plus a finite check, the way the fourth
    and fifth diagonals were closed. Supply, not insight.
15. **Left-diagonal periodicity for every rule and every left-finite
    configuration.** For any of the 256 rules and any configuration constant
    far to the left, each left diagonal is eventually periodic. Jen JSP 1986
    Theorem 4 via Rowland's citation (the paper itself is paywalled).
    *Proved*; induction, the existing proof parametrised.
16. **Jen's sandwich lemma, for every rule.** If columns `i < j` are both
    eventually periodic then every column between them is. Jen 1990, from
    Jen 1986. *Proved*; induction (a strip between two periodic boundaries is
    a finite machine on a periodic schedule — the project already has
    `strip_eventuallyPeriodic` for rule 30). Seed the safe form: eventually
    periodic, period dividing `lcm(p_i, p_j) * 2^(j-i-1)`; the OCR's tighter
    `lcm` claim could not be confirmed.
17. **Jen's Proposition 3, arbitrary finite initial condition.** For rule 30
    from any finite nonzero configuration, at most one column is eventually
    periodic. Jen 1990. *Proved*; the project has the single-cell case and
    the skeleton; needs "the leftmost black cell moves left at speed 1".
18. **Kopra's width-2 trace theorem.** For any configuration that is white
    far to the left and not identically white (the right side may be
    infinite and arbitrary), no adjacent-column pair `t ↦ (evolve t i, evolve t (i+1))`
    is eventually periodic. Kopra, arXiv:2202.13809, Theorem 3.5. *Proved*;
    real math but short (Kopra Lemma 3.2 with `h = 0`). Strictly stronger
    than item 17. Kopra states the width-1 case as Problem 4.8: that is P1.
19. **Finite exclusions for the centre column.** For every period `p ≤ 64`
    and onset `T₀ ≤ 200` there is `t < 1100` with `centerColumn (t + p) ≠ centerColumn t`.
    *Computed*. In principle `decide` on a compact `Nat` row model (item 20);
    kernel evaluation cost unknown; `native_decide` is forbidden. Try
    `p ≤ 16, T₀ ≤ 50, t < 300` first.
20. **A `Nat` model of rows.** `rowNat 0 = 1`, `rowNat (t+1) = rowNat t ^^^ ((2 * rowNat t) ||| (4 * rowNat t))`,
    with `centerColumn t = testBit (rowNat t) t`; OEIS A110240, A269160.
    Provable consequence: `3 * rowNat n < rowNat (n+1) < 5 * rowNat n` for
    `n ≥ 1` (rows `t ≥ 2` begin `110`). *Stated without proof on OEIS*;
    induction, fiddly bit arithmetic. Its value is as a `decide`-friendly
    engine, matching what `explorer/` does with BigInt.
21. **Morse–Hedlund reformulation.** If the centre column is eventually
    periodic then its number of distinct length-`n` factors is bounded.
    Classical; induction. A lemma, not a target: the contrapositive premise
    (≥ n+1 factors for all n) is open.

## Tier C — periodic points and finite rings

22. **Fixed points on ℤ are exactly `0^ℤ`, `(01)^ℤ`, `(10)^ℤ`.** Wolfram 1986
    Table 6.2. *Proved*; induction over the four 3-blocks `000, 010, 011, 101`
    fixed by the rule (`011` cannot be continued). Ring version: 1 fixed
    point for odd `n`, 3 for even `n` (verified `n ≤ 16`).
23. **No configuration of exact temporal period 2.** `rule30 (rule30 x) = x → rule30 x = x`.
    *Computed* (de Bruijn graph on 4-blocks: only the three fixed points
    survive; verified on rings to `n = 16`); no published statement found,
    say so in the node. Induction plus one `decide` over 32 cases.
24. **`F^p` is left-permutive with left radius `p`**, so a temporally
    `p`-periodic configuration is determined leftward by any `2p` consecutive
    cells. Wolfram 1986 §6. *Proved* core; induction (composition of
    left-permutive rules is left-permutive). Do not seed Wolfram's "finitely
    many, blocks ≤ 2^(2p)" — could not be made precise.
25. **Garden-of-Eden on rings.** On a ring of size `n`, the all-black state
    has a predecessor iff `3 ∣ n`, and then exactly three (`(100)^k` and
    rotations); the all-white state has exactly two (`0^n`, `1^n`). Wolfram
    1986 §9 crediting C. and R. Feynman. *Proved*; induction. Consequence:
    rule 30 on a ring with `3 ∤ n` is not surjective. Do **not** seed the
    fuller Feynman characterisation Wolfram quotes; as transcribed it fails
    at `n = 4`.
26. **Ring predecessor count is the number of fixed points of a 4-element
    monodromy map**, so always in `{0, …, 4}`. *Folklore*, unpublished in
    this form; induction. The honest replacement for item 25's unverified
    characterisation.
27. **Cycle lengths on rings** (`≈ 2^(0.63 n)`): *empirical*, Wolfram says
    explicitly intractable. Only trivial bounds are provable. Not a target.

## Tier D — topological dynamics (heavier in Lean)

28. **Devaney-chaotic, mixing, sensitive, not positively expansive, not
    equicontinuous, dense periodic points.** Cattaneo–Finelli–Margara 2000
    (permutive ⟺ Devaney-chaotic for ECA); Schüle & Stoop 2012 Props. 6, 11,
    15, 16, 18, Cor. 19; Kůrka Prop. 28, Thm 32. *Proved*; real math (product
    topology on `ℤ → Bool`, Tychonoff). Seed only "dense periodic points"
    (via rings: every ring state is eventually periodic, pick a window inside
    a cycle) and the finitary sensitivity corollary in item 2. Note
    sensitivity in the literature comes via transitivity, not item 2, because
    a difference to the *right* of the origin must spread left at the
    unproved speed.

## Density (P2) — what exists

29. **Row density** (OEIS A070952): purely empirical, `b(t)/t ∈ [0.85, 1.16]`
    for `100 ≤ t < 1100`; no proved asymptotic anywhere. Only `b(t) ≥ 3` for
    `t ≥ 1` is trivially provable.
30. **XOR lemma for random initial conditions.** For an i.i.d. fair initial
    configuration, `P(evolve t 0 = 1) = 1/2` for all `t ≥ 1` under any
    left-permutive rule. Chan-López & Martín-Ruiz, arXiv:2604.00165 (2026),
    Theorem 3. *Proved*, two lines; statable with Mathlib probability. Says
    nothing about the single-cell case.

## Not credible or not verified

- arXiv:2207.13237 (Das, "Rule 30: Solving the Chaos") claims an analytical
  solution to P1; not peer reviewed, not on the prize bibliography, not read.
- "BHLM-Bas-Zeta Wolfram Project" (ResearchGate, 2025) claims an
  equidistribution theorem for the centre column; same.
- The rule30prize.org bibliography lists nothing accepted since 2019.
- NKS "period 64 at depth 2,107,985,255 or more": single source.
- Wolfram's definition of the 0.252 boundary is not stated anywhere found.

## Rowan's ranking for the next tier

By value over cost: 3 (four preimages, the leftward solve) → 8 and 5 and 10
(trivial first nodes) → 11 (rows `2^n`) → 13 (Rowland's doubling criterion,
under a wall) → 16 (sandwich lemma for every rule) → 17 and 18 (Jen and
Kopra beyond the single cell) → 22 and 23 (fixed points, no period 2) → 25
and 26 (rings). Item 19 if kernel `decide` copes. Items 6 and 28 when a
prover has the topology set up. Not 27, not anything with "≈" in it.
