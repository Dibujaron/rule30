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

**A captain rule for every statement, seeded or proposed (2026-09-07):**
state it in `ℕ` where it can be stated in `ℕ`. An absolute value over
casts is almost always two `ℕ` inequalities; a count is a natural number
and an excess can be two bounds instead of one `|·|`. On this board the
statements that mix `ℕ`, `ℤ` and `|·|` have cost a ladder rung apiece for
two-line facts (`centerColumnCount_sandwich`, `centerColumn_excess_interpolate`),
and the same facts in `ℕ` close on the first rung. A seeder proposing a
cast-heavy statement should say why the `ℕ` form does not exist.

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

### The damage cone, from Cairn and Dib (2026-09-07)

Flip one cell of a random row; the set where the two pictures disagree is a
cone whose right edge advances exactly 1 per row and whose left edge
advances about 0.24 on average (Cairn measured 0.236 to 0.253 over five
trials of 20,000 rows on 400,000-cell rows; NKS p. 949 gives 0.2428, and
notes it is *similar but not identical* to the 0.252 of the regular-region
boundary). Three statements, in Cairn's words with Rowan's numbering:

- **A1. Left-permutivity as a `Config → Config` fact.**
  `rule30_ne_of_left_ne (c d : Config) (i : ℤ) (hl : c (i - 1) ≠ d (i - 1)) (hc : c i = d i) (hr : c (i + 1) = d (i + 1)) : rule30 c i ≠ rule30 d i`.
  `rule30_eq` twice and a `Bool` case split. Corollary worth its own node:
  if `c, d` differ at `i` and agree everywhere right of it, they differ at
  `i + 1` one step later, so the rightmost disagreement moves right by
  exactly one per row. This is item 2 above in its cleanest form.
- **A2. The exact local law of the left edge.** If `c, d` agree at `i - 2`
  and `i - 1` and differ at `i`, then `rule30 c (i - 1) ≠ rule30 d (i - 1) ↔ c (i - 1) = false`.
  The front advances left exactly when the cell beside it is white, and it
  can retreat, which is why the mean is below a half. Same proof shape.
  This is the deterministic content behind the 0.24 and is not in any of
  the thirty items above.
- **A3. Do not seed a bound on the left speed below 1.** The worst case is
  speed exactly 1, witnessed by `c` all white and `d = initialConfig`: the
  difference pattern is the single-seed picture and `evolve_left_edge`
  already says its edge moves at 1. Any bound below 1 is an average under
  the Bernoulli measure (Shereshevsky 1992), nobody has proved one for rule
  30, and even the statement needs Mathlib probability.

## Tier B — the single-cell pattern (edges, rows, columns)

11. **Rows `2^n` and `2^n - 1` restart the right edge.** Row `2^n - 1` ends in
    at least `n + 1` black cells; row `2^n` ends in a black cell preceded by
    at least `n` white cells. Rowland 2006 Theorem 1 and §3 (mirror
    orientation). *Proved*; induction over `rightDiagonal_periodicFrom_pow`
    plus the per-diagonal fact `rightDiagonal j (2^j - j) = false` for every
    `j ≥ 1` (row `2^n` is `≡ 0 mod 2^j` on every diagonal `j ≤ n`, so it
    reads that cell on each). That second ingredient is Rowland's own
    induction, not a finite check. An earlier draft of this row cited
    `rightDiagonal k 0 = false` instead; that cell is the centre column at
    time `k`, black at `k = 1, 3, 4, 5, 8`, and Cairn caught it on
    2026-09-07 before it was seeded. Conclusion verified `n = 1..9` (Rowan)
    and `n = 1..7` (Cairn, independently).
12. **The rightmost black run of row `t` depends only on `ord₂(t + 1)`**, and
    is strictly increasing in it: runs 1, 3, 4, 6, 7, 9, 15, 16, 24, 25, 27.
    Rowland §1, §3; OEIS A094603 (which lists the formula only as a
    conjecture, though Rowland proves it). *Proved*; weak form (`run (t + 2^k) ≥ k+1 ↔ run t ≥ k+1`)
    is induction, full form is real math (orbit of a permutation of
    `{0,1}^(k+1)`, about a page). The exact values have no formula.
    Mirror measurement (Cairn, 2026-09-07, to `t = 1100`): the white void
    touching the right edge at row `t` is a function of `ord₂(t)` alone,
    `ord₂ = 0..10 ↦ 0, 2, 3, 5, 6, 8, 14, 15, 23, 24, 26`. *Computed*.
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
20. **A `Nat` model of rows.** `rowNat 0 = 1`, `rowNat (t+1) = (4 * rowNat t) ^^^ ((2 * rowNat t) ||| rowNat t)`,
    with `centerColumn t = testBit (rowNat t) t`; OEIS A110240, A269160.
    Provable consequence: `3 * rowNat n < rowNat (n+1) < 5 * rowNat n` for
    `n ≥ 1` (rows `t ≥ 2` begin `110`). *Stated without proof on OEIS*;
    induction, fiddly bit arithmetic. Its value is as a `decide`-friendly
    engine, matching what `explorer/` does with BigInt. The earlier formula
    here was the mirror image (rule 86) and passed every symmetric check;
    caught by a kernel `decide` against `evolve` on 2026-09-07.
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

Read this section as the specification of a P2 tier. P2 has four proved
nodes (`centerColumn_zero`, `centerColumnDensity_nonneg`,
`centerColumnDensity_le_one`, `centerColumnDensity_succ`), every one of
them `Finset.card` bookkeeping that never touches the automaton, and
nothing open. Nothing in print proves anything about the centre column's
density, for rule 30 or for any chaotic rule; what is known is computed.
**One rule of this project closes off the computed facts:** a computed
fact becomes a Lean theorem only through `native_decide`, whose axiom
`Lean.ofReduceBool` is outside the allowlist (`propext`, `Classical.choice`,
`Quot.sound`), and kernel evaluation of `evolve` stops being usable at
depth about 18. So "the first million centre cells are balanced to one per
cent" cannot be a node, however true. Do not propose it. What can be
proposed is below: bridges to P1, balance for random rows, and
reformulations, all provable, none of them the prize.

29. **Row density** (OEIS A070952): purely empirical, `b(t)/t ∈ [0.85, 1.16]`
    for `100 ≤ t < 1100`; no proved asymptotic anywhere. Only `b(t) ≥ 3` for
    `t ≥ 1` and `b(t) ≤ 2t + 1` (the cone) are provable, and neither is
    worth a node.
30. **XOR lemma for random initial conditions.** For an i.i.d. fair initial
    configuration, `P(evolve t 0 = 1) = 1/2` for all `t ≥ 1` under any
    left-permutive rule. Chan-López & Martín-Ruiz, arXiv:2604.00165 (2026),
    Theorem 3. *Proved*, two lines; statable with Mathlib probability. Says
    nothing about the single-cell case. Its finite form is item 34, which
    needs no probability at all.
31. **Bridge to P1: an eventually periodic sequence has a convergent
    density.** If `IsEventuallyPeriodic f` then the running density of `f`
    converges, to (black cells in one period) / (period), a rational. In the
    direction P1 would cite: a centre column whose density does not converge
    is not eventually periodic. *Folklore*; the count over `N` terms of a
    `PeriodicFrom f p N0` sequence is `(N / p) * r` up to a bounded error,
    which is induction, and the limit is then `Filter.Tendsto` over a
    floor-division bound, which is real math in Lean. Two nodes: the count
    bound (S–M, pure `Nat`) and the limit (M, real analysis). The first
    node in P2 that would be cited from P1.
32. **The limit in count form.** `Tendsto centerColumnDensity atTop (nhds (1/2))`
    is equivalent to `∀ ε > 0, ∃ N0, ∀ N ≥ N0, |2 * count N - N| ≤ ε * N`
    where `count N` is the black-cell count in `range N`. *Trivial* from
    `Metric.tendsto_atTop` and one division; worth a node because every
    later P2 statement can then be stated over `count` in `ℕ` and never
    divide, the way `centerColumnDensity_succ` already had to be multiplied
    through by `N`.
33. **Count over a window.** `count (N + k) = count N + (black cells in
    [N, N + k))` and `count (N + k) - count N ≤ k`. *Trivial*; induction on
    `k` from `centerColumnDensity_succ`'s card recurrence. Supply for 31.
34. **Balance for random rows, finite form: after `t` steps, exactly half of
    all windows give a black centre cell.** Over the `2^(2t+1)` assignments
    of the cells at positions `-t..t`, exactly `2^(2t)` make `evolve t 0`
    black. *Proved* in effect by left-permutivity: `F^t` is left-permutive
    with left radius `t` (item 24), so flipping the leftmost cell of the
    window flips the output, and the assignments pair off. Needs two
    definitions or lemmas not yet in `Rule30/Basic.lean`: that `evolve t x 0`
    depends only on `x` restricted to `[-t, t]` (the cone lemma for an
    arbitrary configuration, not just the single seed), and a window type
    to count over. Difficulty M–L; the most interesting statement P2 can
    carry, and the reason one half is the expected answer. **Disclaimer to
    land with it:** the single black cell is one window out of `2^(2t+1)`,
    the least random one, and this says nothing about it.
35. **Left-permutivity of the local rule.** For fixed centre and right
    inputs, the two values of the left input give the two different
    outputs; equivalently exactly 4 of the 8 local inputs give black.
    *Trivial* (`decide`); the base of 34 and of crystal 3.
36. **Every word has exactly 4 preimages** (crystal 3, in its P2 role): rule
    30 maps the uniform distribution on words of length `n + 2` onto the
    uniform distribution on words of length `n`. A random row stays random.
    *Proved* (Hedlund 1969; Wolfram 1986 §4); induction on `n`, solving
    leftward by 35. Difficulty M. Shares its induction with 34.

37. **Kopra's right-half recurrence theorems.** For any configuration
    that is white far to the left and not identically white, write `R t`
    for the right half of row `t`, the one-sided sequence `i ↦ evolve t i`
    for `i ≥ 0` (Kopra's `frac`, a sequence, not a real number; the real
    is only his motivating analogy with `frac((p/q)^i)`). Then (a) `R t = R 0`
    for only finitely many `t`, and (b) the sequence `t ↦ R t` has
    infinitely many limit points in the space of one-sided sequences.
    Kopra, arXiv:2202.13809, Theorems 4.5 and 4.7; both rest on Theorem 3.5
    (item 18) plus Lemmas 4.2–4.4 and the Morse–Hedlund theorem. *Proved*;
    real math, above item 18 in cost. Found by Cairn 2026-09-07 checking
    literature coverage; not on the DAG, not previously here.

38. **The two half-lines and the sideways solve (definitions).** Each half
    of the picture is driven by column 0 alone: `evolveHalfLeft (c : ℕ → Bool)
    (w : List Bool) : ℕ → ℕ → Bool` is the cells `x ≤ -1` grown from a
    white start with finite left word `w` and boundary column `c`
    (`evolveHalfRight` symmetric), and `leftSolve (c d : ℕ → Bool) : ℕ → ℕ → Bool`
    is the sideways solve, `leftSolve c d 0 = c`, `leftSolve c d 1 = d`,
    `leftSolve c d (k+2) t = xor (leftSolve c d (k+1) (t+1)) (leftSolve c d (k+1) t || leftSolve c d k t)`.
    Agreement theorems: for any `X : Config`,
    `evolveHalfLeft (column X 0) (left word of X) t k = column X (-(k+1)) t`
    (M, induction on `t` with `evolve_eq_false_of_outside_cone`'s argument
    for the white start) and `leftSolve (column X 0) (column X 1) k t = column X (-k) t`
    (S, induction on `k` from `sideways_inverse`). *Folklore*; definitions
    plus two nodes. Sextant, second attack of 2026-09-07, C1–C2; checked by
    Sextant to 200,000 rows and by Rowan independently to 6,000, and the
    list model against `rowCell` in the kernel. Seed first: 39–41 need it.
39. **The cone constraint splits by the centre's colour.** For any `X` with
    `c = column X 0`, `L = column X (-1)`, `R = column X 1`: at every black
    time `c (t+1) = !L t` (column 1 absent), and at every white time
    `R t = xor (c (t+1)) (L t)`. *Proved*: one rewrite each from
    `sideways_inverse` at `i = 0`; two S nodes. Its content, with 38: the
    black-time half of the residual is a condition on column 0 and the
    left half-line alone, so a proof through the left may discard column 1.
    Sextant C2; Rowan checked on the seed to 6,000 rows, Sextant to
    200,000, kernel to depth 40 (`explorer/scratch_blacktime.lean`).
40. **Column 0 and the right half are free coordinates.**
    `∀ b Y, ∃! X : Config, (∀ k : ℕ, X (k+1) = Y k) ∧ ∀ t, column X 0 t = b t`.
    Finite form: for every `t` and every word `c : Fin (t+1) → Bool`,
    exactly `2^t` of the `2^(2t+1)` windows have that column word to depth
    `t`. *Proved* in print for the count (Wolfram 1986 §4: "an equal number
    of initial configurations"); uniqueness with the right half fixed is
    `rightmost_difference_moves_right`, existence is induction on `k` via
    `leftSolve`. Rowan checked the count exhaustively for `t ≤ 8`, Sextant
    `t ≤ 10`. Consequence worth stating: the seed is rigid from the right
    (a white right half plus column 0 pins everything) and loose from the
    left (many windows white on `x ≤ -1` share its column to any finite
    depth, `explorer/whiteleft.mjs`). Size M with 38; two S after. Sextant C1.
41. **Finite exclusions for number-like configurations.** No configuration
    white on `x ≤ -3` has a column 0 periodic from time 0 with period `≤ 5`
    through row 40:
    `∀ X : Config, (∀ i ≤ -3, X i = false) → ∀ p ≤ 5, 0 < p → ¬ ∀ t ≤ 40, column X 0 (t+p) = column X 0 t`.
    *Computed*, kernel-accepted by `decide` over a list half-line model in
    11 s (`explorer/scratch_blacktime.lean`, part 3); a node once 38's
    agreement theorem ties the model to `column`. The first statement here
    about every configuration white far to the left rather than the seed;
    companion to crystal 19. Supply, not insight. Sextant C4.

Deliberately not listed: Sextant's "left half-line conjecture" (every
eventually periodic, not eventually white boundary fails the black-time
test for every finite left word). It implies the wall and Kopra's width-1
problem for all of `N(2)`; its sweep statistics to period 240 are those
of a fair coin, so it carries no evidence of a mechanism. It is the wall
in another coat, and would sit beside it, not under it.

42. **No two pairs of adjacent left diagonals ever eventually agree.**
    `∀ k d N, 0 < d → ∃ j ≥ N, leftDiagonal k j ≠ leftDiagonal (k + d) j ∨ leftDiagonal (k + 1) j ≠ leftDiagonal (k + d + 1) j`.
    In the picture: the settled region read along two adjacent diagonals
    never coincides with itself moved `d` diagonals inward. *Proved*, in
    the kernel: `explorer/scratch_leftdiagonal_unbounded.lean`, accepted by
    `lake env lean` on 2026-09-07 with axioms `propext, Classical.choice,
    Quot.sound`, written by a review session from Sextant's route. The
    route: agreement of a pair walks outward to diagonals 0 and 1 by the
    backward recurrence, two indices per step; those are black
    (`evolve_left_edge`, `evolve_left_second_diagonal`), so diagonals `d`
    and `d + 1` are eventually black, which forces `d - 1` and `d - 2`
    eventually white, and two white neighbours force the next outward
    white, down to the edge. Cites `leftDiagonal_recurrence`. Size M as a
    node; the friction is index normalisation, not mathematics. Single
    diagonals *do* repeat (item 43's orbit finds 39,362 repeats below
    200,000); only pairs never do. Sextant, third attack of 2026-09-07, C1.
43. **The eventual periods of the left diagonals are unbounded.**
    `∀ a, ∃ k, ∀ N, ¬ PeriodicFrom (leftDiagonal k) (2 ^ a) N`. Equivalently
    the period doubles infinitely often, and there are infinitely many
    eventually-white left diagonals. *Proved*, in the kernel, same file and
    date: from 42 by pigeonhole on the pair of residue words read at an
    onset that is a multiple of `2^a` (`Finite.exists_ne_map_eq_of_infinite`).
    Size L as a node for the phase alignment. **Not found in print**: NKS
    p. 871 lists the doublings at 3, 8, 29, 400, 87867 and "2,107,985,255
    or more" as observations with the upper bound `2^n`; Rowland 2006
    proves the power-of-two periods and the doubling criterion (a white
    stripe next to an odd-parity block), not that it fires forever; Kopra
    and Jen have no diagonal statement. Checked against the held texts by
    Sextant and by a web search on 2026-09-07. The first statement on this
    board that may be new. Elementary once seen; sits beside the walls
    `leftDiagonal_onset_le` and `leftDiagonal_period_le` as a lower bound,
    under nothing. Sextant C2.
44. **The settled configuration.** Let `settledWord k : ℤ → Bool` be the
    periodic extension of the tail of `leftDiagonal k` that
    `leftDiagonal_periodicFrom_pow` guarantees, in absolute phase, and
    `Σ (x) = settledWord x (-x)` for `x ≥ 0`, white for `x < 0`. Claim:
    `evolveFrom Σ` is the settled picture (`settledWord (t + x) (-x)` on
    `x ≥ -t`), and the seed's picture agrees with it on every settled cell,
    so the seed's picture is `evolveFrom Σ xor E` with `E` a damage pattern
    supported on the transient band. *Computed*: 0 mismatches on 2,003,001
    cells to 1,000 steps (`explorer/settledpicture.mjs`). Route: the
    recurrence holds on settled words for every index, and the recurrence
    is the rule in diagonal coordinates. Its centre column `s` is Sextant's
    proposed next topic: nobody has looked at it. Sextant C4, with C3 (the
    settled region of every configuration white far to the left is the
    seed's up to a shift chosen at the branch points, Rowland §6 with
    phase) as the reason a periodic boundary is invisible to it.

45. **The white branch of the left induction costs one index, not one period.**
    `leftDiagonal_step_onset_dichotomy (m q N) : PeriodicFrom (leftDiagonal m) q N → PeriodicFrom (leftDiagonal (m+1)) q N → PeriodicFrom (leftDiagonal (m+2)) (2*q) (N+1) ∨ ∃ j, N ≤ j ∧ leftDiagonal (m+1) (j+1) = true ∧ PeriodicFrom (leftDiagonal (m+2)) q (j+1)`.
    When the middle diagonal is white from `N + 1` on, the new diagonal is a
    running total of the one two further out (`bool_xor_driven_periodicFrom`
    applies verbatim), so its onset moves by one cell and its period at most
    doubles; when the middle diagonal is black somewhere, the onset jumps to
    that cell (`leftDiagonal_periodicFrom_step_of_black`). *Proved*: found by
    Cadence on opus in an abandoned research attempt on `leftDiagonal_onset_le`
    (run 20260907T201514Z), kept as `explorer/scratch_onset_dichotomy.lean`,
    which compiles alone. The seed check's verdict on it as a route to the
    wall is right: iterating it bounds the onset by the sum of the first-black
    gaps, and bounding that sum by `k` is what remains open. Worth a node when
    an onset argument wants it; sits under `leftDiagonal_onset_le`.

46. **The settled centre column, defined on the board.**
    `settledCenter (k : ℕ) : Bool := leftDiagonal k (2 ^ k)`, and
    `∀ k m, 1 ≤ m → leftDiagonal k (m * 2 ^ k) = settledCenter k`: read the
    seed's picture down any column whose distance from the origin is a
    multiple of `2^k` and past the onset, and the `k`-th cell below the
    edge is the same whichever column is read. It is the settled word of
    diagonal `k` at index 0, where the centre column reads the transient
    instead. *Proved* in effect: `leftDiagonal_periodicFrom_pow` gives an
    onset `≤ 2^k` with period `2^k`, and an induction on `m` walks from
    `2^k` to `m · 2^k`. Size S. Checked by Sextant to 240,000 and by Rowan
    independently for `k ≤ 11` on 47,967 cells
    (`explorer/rowan_leftside_check.mjs`); kernel to `k ≤ 10`
    (`explorer/scratch_settledcenter.lean`). `s(0..10) = 11011100110`,
    equal to the centre column for `k ≤ 17` and at the coin-flip rate
    after. Sextant, fourth attack of 2026-09-07, C1. Seed first: 47–49
    need it.
47. **The settled picture is the rule 30 evolution of the settled
    configuration**, stated in diagonal coordinates without a settled-word
    object: `Σ x = leftDiagonal x (2 ^ (x + 1) - x)` for `x ≥ 0`, white for
    `x < 0`, and `column Σ x t = leftDiagonal (t + x) (2 ^ (t + x + 1) - x)`
    for `x ≥ -t`; so `column Σ 0 = settledCenter`. Puts crystal 44's `Σ` on
    the board as a `Config`, to which the half-line tier and Kopra's width-2
    theorem apply. *Computed*: 300,040,001 cells, 0 mismatches to 10,000
    steps (`explorer/settledorbit.mjs`). Route: induction on `t` with
    `rule30_eq`, moving four `leftDiagonal` indices to a common frame by 46's
    periodicity and closing with `leftDiagonal_recurrence`; edge cases from
    the three edge diagonals. Size M–L, cast-heavy: seed it with `j : ℕ`
    diagonal indices, not through `column`. Sextant C2.
48. **The settled centre column is not eventually periodic.**
    `¬ IsEventuallyPeriodic settledCenter`: Kopra's width-1 problem for the
    configuration `Σ`, which has no transients at all and the lowest
    information content in the picture (fixed by the recurrence and about
    `log₂ log₂ K` branch bits to depth `K`). *Computed*: 240,001 terms, every
    lag to 120,000, longest agreeing tail 16 cells; balanced, factor counts
    those of a random sequence. *Open*; no route; the wall in another
    configuration. Sextant C3. **Read to `10^9` terms on 2026-09-08**
    (`explorer/settledcenter_billion.mjs`, 23 s, by a subagent with an
    independent cross-check): balanced (excess `+57,804` at `10^9`, `1.8σ`,
    sign flipping across `10^6..10^9`), every word of every length up to
    24 occurs, no lag below `2^19` agrees on more than 22 of the final
    `2^20` terms (a fair coin's maximum; a planted period 1237 was found),
    autocorrelation at lags `1..32` within `±2.3σ` of one half. No
    structure by any of the four measures at this depth; no eventually-white
    diagonal below `10^9`, consistent with crystal 55.
49. **There is only one left side of rule 30, up to a translation along the
    edge** — a computed finding against a published surmise. For every
    configuration white far to the left with its leftmost black cell at the
    origin that was tried (40 by Sextant to 200,000 rows; three by Rowan
    independently to 20,000, `explorer/rowan_leftside_check.mjs`), there is
    one integer `N` such that the configuration's picture equals the seed's
    translated by `(t, x) ↦ (t + N, x - N)` on everything left of a front at
    about `0.243 t` from the origin, which lies inside the transient band:
    the seam at `0.252 t`, every settled word, every seam position and a
    strip of transients are the seed's. Rowan's numbers: `N = 58, 16, 77`
    for a cell added at 7, a block at 100..199, and a random right half of
    width 3000; with that `N` the first disagreement sits at `0.764`–`0.769 t`
    from the left edge, and with any other `N` of the same residue mod 16
    at `0.751`–`0.754 t`, the seam. Rowland 2006 §5 (lines 913–946 of the
    extraction) conjectures the eventual periods are independent of the row,
    calls the conjecture "likely false", names column 53209 as the expected
    counterexample "if in fact they do occur for some initial conditions",
    and surmises infinitely many left sides. Sextant: all 40 configurations
    take the seed's word at 53208 and branch next at 58287, never at
    Rowland's 72577. **Mechanism and limit**, in Sextant's words and
    Rowan's reading: the damage front from any right-side change moves left
    at about `0.243` and the seam at `0.252`, so the settled region is
    protected by a margin of `0.009 t` that is an average, not a law; below
    row 2,100 the front ran ahead of the seam in five of seven cases, and a
    right half built to push its front 3.5 % faster for 70,000 rows would
    take Rowland's other branch. Crystals A3 says no speed below 1 is
    provable. So Rowland's surmise is not refuted; what is new is that the
    counterexample is never realised by an ordinary configuration, and the
    translation form with its integer `N`. *Computed*; no route to the
    full claim; the finite propagation piece is
    `bool_driven_periodicFrom_of_reset` with two orbits in place of a
    periodic driver, size S. Sextant C4; the fifth obstruction entry.

50. **The two masking laws, in diagonal coordinates.** Call a cell of
    diagonal `k` at index `j` *transient* when `leftDiagonal k j ≠ leftDiagonal k (j + 2^k)`.
    (a) If diagonal `k+2` is transient at `j` and its two drivers are settled
    at `j+1` and `j+2`, then it is transient at `j+1` exactly when the driver
    cell `leftDiagonal (k+1) (j+1)` is white: a transient passes straight down
    a diagonal through a white driver and is stopped by a black one. (b) If
    diagonal `k+2` is settled at `j` and its driver `k+1` is transient at
    `j+1` (the outer driver settled), then `k+2` stays settled at `j+1`
    exactly when its own cell at `j` is black. *Proved* in the kernel:
    `explorer/scratch_masking.lean` (`leftDiagonal_transient_front_law`,
    `leftDiagonal_transient_mask_law`, general shift `M`, axioms `propext,
    Quot.sound`; and the `2^k` form with `Classical.choice`), re-run by
    Rowan on 2026-09-08, exit 0. Each is `leftDiagonal_recurrence` at two
    indices and a sixteen-case `decide`. New phrasing of
    `rule30_left_local_law` (crystals A2) read on the pair (seed, settled
    picture); Wolfram 1986 §5 states (a) in words for the difference
    pattern of two random rows. Two S nodes under `leftDiagonal_onset_le`
    when an onset argument wants them. Sextant, fifth attack, C1.
51. **The seam is a damage front, and the onset wall is a speed bound on
    it.** Define `F t = min { x ∈ [-t, 0] : the cell (t, x) is transient }`
    (exists for `t ≥ 18`; the first transient cell is `(18, 0)`), the
    leftmost difference between the seed's picture and the settled picture
    (crystal 47). Then `leftDiagonal_onset_le` (every diagonal settled by
    index `k`) is equivalent to `∀ t ≥ 18, 2 · F t + t ≥ 1`: the front never
    runs faster than half a cell per row. Both directions are index
    arithmetic once `F` is defined (a `Nat.find` over a decidable bounded
    predicate). *Computed*: `min (2F + t) = 17` at `t = 19`; net speed
    `0.2497` over 160,000 rows; worst window `0.2568` at `t = 38,460`, the
    same event as the worst onset ratio `0.3455` at `k = 28,584`
    (`explorer/maskfront.mjs`). No route: it is a speed bound of the kind
    crystals A3 says is not available, and the sixth obstruction entry says
    why the reset-lemma induction cannot reach it. Size M as a
    reformulation node; worth seeding only to make the wall's honest form
    visible. Sextant C3.
52. **The front's visited diagonals obey the reset lemma with no slack; the
    skipped ones settle before their drivers.** The diagonal the front sits
    on never decreases; the front rides a diagonal at speed 1 along a white
    run of the neighbouring settled word and leaves at its next black cell,
    so the onset of every visited diagonal is the first black of `S_{k-1}`
    past the arrival index. *Computed*: 60,065 visited diagonals below
    110,000, 0 exceptions; 49,917 skipped, of which 47,343 settle strictly
    before their neighbour; the transient that ends a skipped diagonal is two
    transients meeting in one `||` in 68 % of cases and a black settled
    neighbour in 4 %. Provable half: a diagonal that settles before its
    neighbour is never on the front (contrapositive), size M after `F`.
    The answer to the fifth session's topic, and the reason crystal 45's
    reset front bounds the onset by `2k` while the truth is `0.34k`:
    the reset front cannot retreat and the real one does, on 26 % of rows,
    by up to 11 cells. Sextant C2 and C4; the sixth obstruction entry.

53. **The local dictionary of a white diagonal.** Four lemmas, each
    `leftDiagonal_recurrence` at one index: (A) if diagonal `m+1` reads as
    diagonal `m` shifted by one from index `N` on, then from the first black
    cell of `m+1` past `N` the diagonal `m+2` is white for good; (B) past the
    onset of an eventually-white diagonal `m+2`, its two drivers are shifts
    of each other; (C) after a white `m+1`, diagonal `m+3` is black for good
    from the first black cell of `m+2`; (D) after an eventually-black `m+3`,
    `D_{m+4}(i+1) = !D_{m+2}(i+2)`. In orbit terms a white at `m` means the
    pair `(S_{m-2}, S_{m-1})` is `(u, σu)`, and then `S_{m+2} = 1` and
    `S_{m+3} = ¬σ S_{m+1}` are forced. *Proved* in the kernel:
    `explorer/scratch_whitestep.lean`, axioms `propext, Quot.sound`, re-run
    by Rowan 2026-09-08, exit 0. (C) is Rowland 2006 lines 905–908 in words;
    the rest is new phrasing of the recurrence. Four S nodes under
    `leftDiagonal_period_le` as vocabulary; they do not move the wall.
    Sextant, sixth attack, C1.
54. **The gaps between doublings are at most `4^(2^n)`.** On the board:
    for every `a`, some diagonal `k ≤ 4^(2^a) + 1` is not eventually
    `2^a`-periodic, so the `(a+1)`-th doubling happens by diagonal
    `4^(2^a) + 1`. Sharpens crystal 43 (`leftDiagonal_period_unbounded`,
    infinitely many doublings, no rate) to a rate. Why: in the finite system
    of pairs of words of period dividing `L` (`4^L` pairs) the recurrence
    step has in-degree exactly one, so the segments from each white state
    `(0, w)` to the next white are disjoint and their lengths sum to at most
    `4^L`: the average gap is below `2^L` and no gap exceeds `4^L`.
    *Computed*, and essentially tight: the sum is `60,022` of `65,536` at
    `L = 8` and `4,293,693,734` of `4,294,967,296` at `L = 16`, mean
    `1.000 · 2^L` (`explorer/meansum.mjs`); the seed's own gaps
    `5, 21, 371, 52808, 1.42·10^9` sit within a factor 3 of `2^L`. Route for
    the board form: pigeonhole over `4^(2^a) + 2` consecutive diagonals read
    at onsets that are multiples of `2^a`, then
    `leftDiagonal_pair_never_eventually_shifted`; the same phase alignment
    as crystal 43's proof plus a `Fintype.card` bound. Size L, no hard step.
    Not in print (Wolfram 1986 §6 has the strip automaton and "periods
    increase very slowly"; Rowland the criterion). An upper bound; the wall
    needs a lower one. Sextant C2.
55. **The seed's orbit at period 32, computed from the recurrence alone**:
    the next eventually-white diagonal after `87866` is `1,420,878,968`, of
    complement type (period stays `32`); on one of its two continuations
    the next white is `2,107,985,254` with odd parity, so the period doubles
    to `64` at `2,107,985,255`, which is NKS p. 871's figure to the digit,
    reproduced here in 140 s with no picture beyond row 137,000; on the
    other continuation the next whites are `3,340,408,059` and
    `4,989,445,007`, both complement type. The match to nine digits
    identifies the continuation the seed takes and says NKS's "or more"
    was exact. *Computed* (`explorer/orbit32.mjs`; chain of trust in the
    document's C4: slow orbit against the picture at every branch point,
    bit-parallel step against the slow orbit on 112,133 words and against a
    bit-serial solve on 200,000 random pairs). What is not checked: the
    seed's own choice at `1,420,878,968`, inferred from the NKS match, not
    read from the picture, whose settling row is past `1.9 · 10^9`. Not a
    theorem and cannot be one on this board (`native_decide` is forbidden).
    New to the held sources: the eighth eventually-white diagonal and the
    exactness of NKS's sixth doubling. Consequence: `leftDiagonal_period_le`
    holds for every `k < 2^31 - 1` on the strength of the computation.
    Sextant C4. *For later, not now* (Dib, 2026-09-08): the same orbit run
    on past the sixth doubling, at period 64 a word in two machine words,
    would give the seventh doubling, which no source holds, at a cost of
    minutes; a low-value footnote until something needs the number.
56. **The period wall's honest form, and why no universal bound proves it.**
    `leftDiagonal_period_le ⟺ ∀ n, k_n ≥ 2^n - 1` where `k_n` is the
    `n`-th doubling (`3, 8, 29, 400, 87867, 2107985255`); with crystal 54,
    `k_{n+1} - k_n ≤ 4^(2^n)`. The residual is a *lower* bound on the gaps
    between whites in one specific orbit, and it cannot come from a bound
    over all words the orbit could hold: the word `1^(L-5) 00100`, of exact
    period `L`, returns to a white in exactly eight steps for every even
    `L` from `8` to `128` (`explorer/hitting.mjs`, `hitting2.mjs`; fails at
    every odd `L`, as a run-length mechanism does), and the minimum over all
    nonconstant words is `5` at every `L`. The universal cousin of the wall
    (from every antiperiodic word the next odd-parity white is `≥ L` away,
    C3) survives enumeration to `L = 32` exactly as a fair coin would
    (`hitting3.mjs`: the minima over `2, 16, 2048` shift classes are
    `88, 6343, 414989` against a geometric null of `128, 4096, 2·10^6`),
    and the orbit forgets the symmetry of a post-doubling word within seven
    steps (`orbitclass.mjs`). The seventh obstruction entry. Sextant C3, C5.

57. **The onset ladder's constants are the period staircase, and each rung
    has an exact expiry.** The constant `16` that closes
    `leftDiagonal_onset_le_of_le_5000` (via `rowNat (2k) ≡ rowNat (2k+16)
    mod 2^(k+1)`) is not a bound the wall forgot to ask for: it is `2^5`,
    and the `5` is the number of doublings by depth 5000. The least
    constant closing depth `k` is the staircase `1, 2, 4, 8, 16, 32`
    stepping at exactly the `k_n` of crystals 55 and 56 — `3, 8, 29, 400,
    87867, 2107985255`. So `16` works at `k = 87866` and fails at
    `k = 87867`, and `_of_le_87866` is the last theorem that can use it.
    Likewise the `4` in `stepMod_preperiod_le_of_le_11` is the same
    staircase read at `k ≤ 11`. *Computed* (Talus, theorist, 2026-09-09:
    staircase from the recurrence alone for `k = 0..600`, stepping at
    `3, 8, 29, 400` with nothing between; the step at `k = 400` confirmed
    in four `decide +kernel` calls; the fifth step checked directly at
    `k = 87866/87867`). **Cross-confirmed**: the staircase's step positions
    are NKS p. 871's first-appearance depths, already on file here as
    crystal 14 from an independent source, which is the check on this
    entry. **Consequence for a seeder:** the `_of_le_N` ladder is a
    finite resource with a known end, not a strategy. Do not propose a
    rung above `87866`; a rung at `87866` is the last honest one and is
    supply, not insight. The onset wall's honest form is therefore the
    same shape as crystal 56's: a claim about the `k_n`, not about a
    constant.
58. **The halving law: doubling a row is sliding the picture one cell in
    from the edge.** `T(2s) = 2T(s)` for the row map `T(r) = 4r ⊕ (2r ∨ r)`.
    *Proved on the board* (`step_two_mul`, `stepMod_iterate_two_mul`,
    2026-09-09) — the strongest status any entry here carries. Consequence,
    and the reason it was sought: the even states are a perfect copy of the
    whole system one bit narrower, so the growth of the truncated attractor
    from level `n` to `n+1` is exactly the number of **odd** periodic
    points, which are exactly rule 30's truncated left sides with a black
    left edge. The measured law "the attractor grows by the longest cycle
    length, no exception in 519 levels" reduces to a statement about that
    one set. Talus, theorist, 2026-09-09.
59. **The transient wall is in the wrong currency for every finite-automata
    field, and Robert's theorem is the one exception.** Every Černý-type,
    transformation-semigroup and random-mapping bound is polynomial in the
    **number of states**; ours is `2^n` and the wall needs a bound in `n`,
    so a cubic bound reads `2^(3n)` and no search fixes that. The one
    theorem in the right currency is **Robert's**: a Boolean network whose
    interaction graph is acyclic is nilpotent of class at most `n`
    (arXiv:1503.04688; as convergence, arXiv:2309.11363). Rule 30's row map
    is a Boolean network on `n` nodes whose graph is the path `i−2 → i`,
    `i−1 → i` **plus a self-loop at every `i`**, and the loop at `i` is
    present exactly when bit `i−1` is white and cut exactly when it is
    black — the project's reset lemma in the field's own vocabulary. Four
    seams, all real: the hypothesis is about the *global* graph and ours has
    all `n` loops; the standard weakening is by feedback vertex set and ours
    is all `n` nodes, so every FVS bound reads `2^n`; the loops are cut by
    the *state*, not by a letter, so there is no reset **word**; and
    Robert's conclusion is a unique fixed point where our attractor has
    cycles up to 16. Two facts worth keeping separately. **Rule 30 is rule
    150 plus one quadratic term:** `4r ⊕ (2r ∨ r) = (4r ⊕ 2r ⊕ r) ⊕ (2r ∧ r)`,
    and `F₂`-linear CA get transient `≤ n` for free, so that term is the
    entire difficulty. **Triangularity alone bounds nothing:** the odometer
    on bits `0…n−2` with the top bit held until it returns to zero is a
    perfectly good triangular map with tail exactly `2^(n−1)`, so rule 30's
    measured `1.56 n` is not forced by triangularity and the "rule 30 is
    hyper-contracting" reading is an artefact of comparing against a random
    map (`Θ(√N)`) rather than a random *triangular* one (`Θ(n)`). Gnomon,
    connector, 2026-09-09, `docs/connections/2026-09-09-synchronizing-automata-*.md`.
    The identity verified independently by the captain over `r < 10^5`.
60. **The row map is a T-function, and the T-function field's decision
    apparatus returns NO in two bits.** `T(r) = 4r ⊕ (2r ∨ r)` is a
    T-function: bit `i` of the output reads only bits `i, i−1, i−2`, so it
    descends to a map on `n`-bit words for every `n`. Dictionary, kernel
    checked (`explorer/vernier_scratch_tfunc.lean`): the centre column is
    `bit_t` of `T^t(1)`, and left diagonal `k` is `bit_k` of the orbit
    delayed by `k`. So the whole P1 residual restates with no automaton in
    it. The field's own tests then rule the map out of its theory: `T` is
    the identity mod 2 (so never a single cycle) and `T(1) ≡ T(3) mod 4`
    (so never invertible), and Anashin's Theorem 5.2 makes
    measure-preservation equivalent to bijectivity mod 2. *Verified
    independently by the captain*: identity mod 2 over `r < 2000`;
    `T(1) = 7`, `T(3) = 11`, both `≡ 3 mod 4`. Vernier, connector,
    2026-09-09. **Consequence for a seeder:** the dictionary is a real
    reformulation and worth stating; the single-cycle and invertibility
    machinery of that field is closed and must not be proposed.

61. **The onset wall with no automaton in it, and it holds from every
    start.** The strongest packed-row form of `leftDiagonal_onset_le` yet
    stated, and it mentions no cell, no seed and no damage front:

        for every `n >= 1` and every `r < 2^n`,
        `T^(2(n-1))(r) = T^(2(n-1) + 2^(n-1))(r)  (mod 2^n)`,
        where `T(r) = 4r XOR (2r OR r)`.

    This **implies the wall**, through the one definitional row of crystal 60
    (`leftDiagonal k j = bit_k (rowNat (j+k))`), and it asks for something
    stronger than the wall does: the wall needs the orbit of `1`, this needs
    every start. Exhaustive to `n = 31` — all `2^31` starts — worst tail `39`
    against an allowed `60`, worst ratio `1.381` at `n = 19`. **The naive
    induction is already known to fail**: `maxTail(n+1) <= maxTail(n) + 2` is
    FALSE at `n = 18 -> 19` (22 jumps to 26), so any proof must amortize over
    levels rather than pay per level. Obstruction 6 says the same of the
    front; this says it of a max over a finite set, where a retreat costs
    nothing — a genuinely different induction to attempt. Vernier, connector,
    2026-09-09, `docs/connections/2026-09-09-t-functions-2-adic-dynamics-*.md`.
    **Consequence for a seeder:** this is the wall in the vocabulary the board
    landed on 2026-09-10 (`rowNat_agree_forward`,
    `leftDiagonal_periodicFrom_of_rowNat_agree`, `rowNat_testBit_zero`), so it
    is the first statement that can be attacked with those three blocks in
    hand. Its per-level form is refuted; do not propose one.

62. **No reset-style induction closes the onset wall, at any constant, and
    here is the counterexample.** Define `C_1 = 0` and
    `C_(k+1) = 1 + min{ t >= C_k : bit_(k-1)(rowNat t) = 1 }`. Then
    `C_k <= 2k - 2` is **false**: `C_119 = 237 > 236`, the only violation
    below `k = 600`, exact (`gnomon_cascade.mjs`, `gnomon_check.mjs`). The
    falsification is not the point; the **reason** is. The control bit's
    black density is `0.4993`, so the cascade's slope is `2` by a law of
    large numbers, and the wall's own budget has slope `2` — the two are
    exactly critical. Every reset-style induction on this board is the same
    sum of mean-2 waiting times: obstruction 6's front at `2.00 k`, Talus's
    `2.674 n`, this cascade at `1.96 k`. So no argument of that family can
    work at any constant. **What the gap actually is:** the distance between
    the truth (`1.25 n`) and the cascade (`2 n`) is entirely the 596 of 599
    levels that settle *before* their driver's loop is cut. In the board's
    vocabulary that is obstruction 6's "skipped diagonals settle at indices
    below their drivers' onsets", measured and unexplained; in the
    Boolean-network vocabulary it is "a node whose loop is intact can still
    be forced, because its two drivers agree". Ships with an arithmetic
    correction: the board's `1.34 n` and `0.8229` are *tail + period*, and the
    wall needs the *preperiod*, which is `1.25 n` and `0.7396` (verified by
    reproducing `talus4_margin.mjs`: `71 + 8 = 79`, `79/96 = 0.8229`).
    Gnomon, connector, 2026-09-09,
    `docs/connections/2026-09-09-synchronizing-automata-*.md`.
    **Consequence for a seeder:** a proposal that prices the early settlings
    is wanted; a proposal that resets per level is refuted in advance.

63. **The local law and the settled region cannot prove the onset wall, and
    the margin is 0.001 the wrong way.** Let `G` be the never-retreating
    front driven by the settled words alone. Then `G(t) >= F(t)` whenever
    they start together — a two-case induction on `rule30_left_local_law`
    (crystal A2) plus "the cell left of the leftmost deviation is settled",
    checked at 0 violations over 129,000 rows (`rosetta_compare.mjs`). `G` is
    **optimal** among background-driven comparisons, so its speed is the
    exact ceiling of what those two ingredients can prove together — and that
    speed is `0.50106` over `2 x 10^8` rows across diagonals 87,868 to
    `10^8`, every one of twenty `10^7`-blocks in `0.50076-0.50133`, none
    below, `13.4` sigma against the script's own random-background control at
    `0.49999`. The wall needs `<= 0.5`. Stated for the board:
    **`leftDiagonal_onset_le` is not a consequence of
    `rule30_left_local_law` together with the settled region.** A proof must
    reach into the transient band. The honest caveat, which keeps this a
    sighting rather than a theorem: `0.50106` is a window average of a
    deterministic walk and nobody has proved it never falls below `1/2`
    later. Rosetta, connector, 2026-09-09,
    `docs/connections/2026-09-09-percolation-and-first-passage-*.md`.
    **Consequence for a seeder:** do not propose a monotone comparison
    against the settled background; that family is priced and it is short.

64. **The one measured route that lands on the right side of the wall, and
    it is a gap in a reachable set rather than a slow walker.** Three pieces,
    smallest first. (a) *The survival law*, already proved in the kernel on
    `[propext]` (`explorer/alidade_scratch_survival.lean`): for rows `c` and
    `d` agreeing at `i-1` and differing at `i`,
    `xor (rule30 c i) (rule30 d i) = xor (! d (i+1)) (d i && xor (c (i+1)) (d (i+1)))`,
    with the corollaries making the right side `! d (i+1)` when `d i` is
    white or when `c` and `d` agree at `i+1`. A seedable node of size S under
    `leftDiagonal_onset_le`; it generalises crystal 50(b), which is its
    agreeing half in diagonal coordinates. (b) *The forced retreat*: if
    `S(t, F(t)-1)` is black, `S(t, F(t))` white and `S(t, F(t)+1)` black then
    `F(t+1) > F(t)` — immediate from (a) plus A2, and measured on 132,152 of
    999,960 rows with no exception. (c) *The bound*: with `R(t0) = {F(t0)}`
    and `R(t+1)` the image of `R(t)` under `x -> {x-1}` when `S(t,x-1)` is
    white, `{x}` at triple `(1,0,1)`'s complement, `[x+1, inf)` at `(1,0,1)`
    and `[x, inf)` otherwise, `F(t) >= min R(t)` for every `t >= t0`. One-step
    induction from (a) and A2. **`min R(t)` runs at `0.45310`** over `4 x 10^6`
    rows from diagonal 100,000, every `5 x 10^5`-block in
    `[0.45265, 0.45412]`, confirmed by a second implementation carrying no ray
    at all. Compare crystal 63: that route's margin is `0.001` **against** the
    wall, this one's is `0.047` **for** it. The two honest gaps: nothing
    proves the DP stays below `1/2` on every stretch, and the DP escapes onto
    the eventually-white diagonals, so stretches must be chained — which is
    exactly the prerequisite in the next crystal. Alidade, connector,
    2026-09-09, `docs/connections/2026-09-09-computational-mechanics-*.md`.

65. **The prerequisite both front routes need, and it is two lines.** For
    every `t`, the settled word `S_(kappa(t)-1)` is not identically white,
    where `kappa(t) = t + F(t)`. From `leftDiagonal_periodicFrom_pow` and
    crystal A2: if it were, the front would advance for ever, and diagonal
    `kappa(t)` would then disagree with its own settled word at every later
    index. **What it buys:** the retreats at rows 2, 31, 501, 71,116, 77,910
    and 117,324 become *forced* rather than observed, and every
    monotone-comparison route closes globally rather than by measurement.
    Without it, crystal 64's bound covers only the stretch between two
    doublings and nothing tiles all of time. Verified to depth 130,000 rows
    and `kappa = 97,529` (`rosetta_visits.mjs`). Reached independently by
    Rosetta (Topic 2) and Alidade (Topic 2) on 2026-09-09.
    **Consequence for a seeder:** the smallest of the front lemmas, the most
    likely to close, and load-bearing for two separate routes. Seed it first.

66. **The OR-to-XOR filter: reject on sight, cost nothing.** Any proposed
    argument for either prize whose reasoning survives replacing `OR` with
    `XOR` is refuted immediately, because rule 150's centre column is
    constantly black and rule 90's is eventually white, while rule 30's is
    the prize. Rule 30 *is* rule 150 plus one quadratic term
    (`4r XOR (2r OR r) = (4r XOR 2r XOR r) XOR (2r AND r)`, crystal 59), so
    that term is the entire difficulty and any argument blind to it is blind
    to everything. Rule 150's centre column is identically black in two lines
    from `P_t = (1+u+u^2)^t` and Frobenius, measured `10^7/10^7`; its column 1
    obeys `a(2t) = 0`, `a(2t+1) = 1 XOR a(t)`, from which eventual
    periodicity fails by a three-line descent. **This rejects, without
    reading them:** surjectivity, left-permutivity, the light cone, the
    space-time SFT, entropy rank one, the sandwich lemma, expansiveness of
    the vertical direction, the whole Mauduit-Rivat family, the whole
    automatic-sequence family, and every rigidity argument. Rule 90 is the
    witness that carries *more* structure than rule 30 in every one of those
    respects. Rosetta and Parallax, connectors, 2026-09-08 and 2026-09-09.
    **Consequence for a seeder:** run this on your own proposal before
    writing it down. It is a ten-minute test and it has never been wrong.

67. **The ensemble filter, and the theorem that makes it citable.** Reject
    any proposed argument whose only use of the seed is that it is a point of
    a full-measure set. Three independent reasons, each checkable: the
    ensemble is *exactly* featureless and, by Kari-Taati plus the measured
    absence of conservation laws, it is the only ensemble available; the seed
    is computable, and being typical for every computable mixing dynamics is
    *equivalent* to Schnorr randomness, which no computable point has; and
    the eventually periodic sequences are dense in the support of every
    candidate Gibbs measure, so no support or positivity argument separates
    them from their complement. The theorem that converts this from a mood
    into a citation: **`centerColumn_trace_uniform`** — for every `n` and
    every word `v : Fin (n+1) -> Bool`, the number of windows
    `w : Fin (2n+1) -> Bool` whose column word is `v` is exactly `2^n`. Five
    lines: fix the cells at `1..n` as parameters, and the map from the cells
    at `0, -1, ..., -n` to the column word is triangular over `F_2` with unit
    diagonal by `evolveFrom_leftPermutive` at radius `t`. Kernel-checked at
    `n = 1, 2, 3` (`explorer/parallax3_scratch_trace.lean`), enumerated to
    word length 12 in two implementations. It generalises `window_count_half`,
    which is its marginal at one time, and should cost about the same.
    Parallax, connector, 2026-09-09,
    `docs/connections/2026-09-09-thermodynamic-formalism-*.md`.
    **Consequence for a seeder:** `centerColumn_trace_uniform` is worth
    seeding and is explicitly NOT a step towards the wall — its value is that
    every future measure-flavoured proposal can be answered with a node
    number instead of an argument.

68. **The nearest published result to Prize 1 cannot be pushed to it, and the
    missing case is one small statement.** Kopra's left-expansivity theorem is
    the closest thing in print; its dimensions `(h, d, w)` mean "a `w`-wide,
    `(h+d+1)`-tall block of the picture determines the cell to its left".
    Rule 30's spreading speed is exactly `1` (`evolve_left_edge`, closed), so
    Kopra's `s < 1/h` forces `h = 0`, and at `h = 0` left permutivity leaves
    only `w = 2`. The missing case is `w = 1`, and it appears to be true:

        for every `d` and every `X` with `column X 0 0 = false`, there is `Y`
        with `column Y 0 t = column X 0 t` for all `t <= d`, and
        `column Y (-1) 0 != column X (-1) 0`.

    Exhaustive for `d <= 14`; the sharper form — the determined column words
    are *exactly* those with a black anchor — exhaustive for `d <= 11`,
    `h <= 5`. The black half is already the board's `column_succ_of_black`;
    the content is the white half and the construction is the compensating
    configuration. Explicit witnesses at `d = 4`: the windows `011100000` and
    `000001000` over positions `-4..4` share column word `01100` and differ at
    position `-1`. Parallax, connector, 2026-09-09,
    `docs/connections/2026-09-09-gowers-uniformity-norms-*.md`.
    **Consequence for a seeder:** small, almost certainly true,
    provable-looking, and what it buys is a closed door with a sign on it —
    so the next session does not rediscover Kopra and ask why not `w = 1`.

## The convergence of 2026-09-09, and the object no node states

Four sessions on 2026-09-09 — Talus twice (theorist), Gnomon and Vernier
(connectors) — reached the same object from four vocabularies, independently:

- Gnomon's levels whose self-loop is **never** cut, because their control
  diagonal is eventually white (`k = 3, 8, 29, 400`);
- Talus's steps of the onset-constant **staircase** (crystal 57);
- the doubling positions `k_n` of crystals 55 and 56;
- NKS p. 871's depths of **first appearance** of each period.

These are one set: the `k` at which left diagonal `k` is eventually white.
It is the residual of `leftDiagonal_onset_le`, of `leftDiagonal_period_le`,
of the attractor-growth law (crystal 58), and of Robert's missing hypothesis
(crystal 59). **No node on the board states it** — the closest are
`leftDiagonal_white_of_shift` and `leftDiagonal_step_period_dichotomy`,
which are local. That absence is the gap this tier exists to fill.

The captain's reading of what that licenses, and what it does not. Naming
the object does not make it tractable — crystal 56 already says the residual
is a *lower* bound on the gaps between whites in one specific orbit, and
that is exactly as open as it was. What it licenses is the conditional
form: Gnomon's own falsifiable test is *"between the settling of diagonal
`k−1` and its first black cell at or after that time, at most `C` rows
pass"*, which is **false as stated** — the measured maximum increment is 7
for `k < 600`, and the four exceptional levels have no black cell ever. So
the honest statement is the same claim with the eventually-white levels as
an explicit hypothesis rather than something a proof has to survive. A
conditional whose hypothesis is the open object is a normal node; the
unconditional version is the wall.

## How to read a check, 2026-09-09 (three instances in one evening)

Not candidate statements — a caution about the tools that produce them, put
here because this is the file a seeder reads before proposing, and every
instance below was a *sound* measurement read as an answer to a question it
was not measuring.

**The pattern.** A check is sound about its own subject and silent about the
thing its reader wants to know. Nothing is wrong with the number; the
denominator is supplied by the reader, and it is supplied wrongly.

- **A repetition count measured inheritance and was read as consensus.**
  Attempts `-2` through `-6` on `leftDiagonal_onset_le` look like five
  independent assaults, and a lemma appearing in three of them looks like
  three provers converging. They are not independent: the brief for each
  attempt **names the previous attempt's parked file** (`dispatch.gleam`,
  the `parked` field) and tells the worker to read it. The files are
  cumulative — `onset-3` to `onset-4` is 48 lines added to a 195-line file.
  The one lemma that scored `3x` was one authorship inherited twice, and the
  three copies were byte-identical *including the tactic script*.
  **The tell: three people who independently need a lemma write three
  different proofs of it. Identical text is evidence of copying.**
  (Fathom, correcting a rule Rowan had written into its brief.)
- **Elaboration measured provability and was read as fitness for purpose.**
  `windowSum_eq_of_periodicFrom` was stated at `PeriodicFrom c L 0`, was
  true, elaborated clean on the first try, and was axiom-clean — and did not
  serve one of the three files it was written for, which has a general onset
  `N`. A weaker statement typechecks perfectly, so no amount of elaboration
  can catch this. **The technique that does: re-prove what each consumer
  actually needs, taking the proposed public statement in as a hypothesis.**
  That converts "I intend not to reach for the private helper" into "I
  cannot". It caught the defect on the first run. (Fathom.)
- **A test count measured the bytes on disk at each moment and was read as
  "the suite".** 325 passed of an announced 607, from a run whose source was
  edited while it ran. The number was accurate; the diagnosis built to
  explain it ("the `Env` injection did not cover `prove-one`") was specific,
  plausible and invented. A clean run gives 607 of 607. (Keel, retracting.)

**And the habit that underwrites all three, which is cheaper than any of
them:** a check you have never seen fail is not yet a check. Exit `0` with no
output is indistinguishable from a command that did not run. Before believing
a success, break the thing on purpose and confirm the failure is real, at the
right line. Fathom did this before reporting nine axiom-clean theorems, and
it costs one edit and one re-run.

This is the same animal as the *well-formed and wrong* rule in `CLAUDE.md`,
one level up: that rule is about a value that is true and a conclusion that is
false, and these three are about the specific mechanism — an unstated
denominator — that keeps producing it here.

**The claim all three of these tempt you into, and it is false.** After the
first instance was caught, the proposed replacement was *duplication across
landed files*, on the premise that it is independent of the brief chain
because "no brief ever hands a worker a landed file". **That premise is
false and was never checked.** Measured against the corpus: **135 briefs
name `Rule30.Proofs.` modules**, with descriptions. The brief for
`rightDiagonal_antiperiodic_of_odd_driver-1` names the helper `blockXor`
eight times on one line; the brief for
`rightDiagonal_periodicFrom_step_of_even_driver-1` names it six times. Both
workers were told the helper's name before writing a line. And `rowStep`,
which three landed files "independently" chose, first appears in a theorist
session on 2026-09-07, is named in the brief for `rowNat_mod_eq_iterate-1`,
and reaches the other two through the cumulative onset chain
(`-3 → -4 → -5 → -6`) — one origin, copied forward, across two personas.

**So: the brief channel is a shared ancestor for everything a worker
writes.** Any measurement over worker output — names, proofs, repetition,
cross-file agreement — is correlated through it *by default*. "These were
independent" is a claim about the harness, and it has to be checked against
`runs/*/*/briefs/`, not assumed. There may be no independent measurement
available over this corpus at all. If so, the honest move is to treat
duplication as **friction worth fixing** and stop trying to license it as
**evidence of importance** — the fix is right either way, and arguably more
urgent if the cause is copying, since the brief channel will keep doing it.

A name-keyed scan has a second, smaller limit worth stating: it sees only
duplication that agreed on a name. `blockXor_shift` in one file and
`windowSum_shift` plus `windowSum_const` in another are one idea written
twice under different names with different proofs, and no such scan can see
it. That one was found by reading.

## Not credible or not verified

- arXiv:2207.13237 (Das, "Rule 30: Solving the Chaos") claims an analytical
  solution to P1; not peer reviewed, not on the prize bibliography, not read.
- "BHLM-Bas-Zeta Wolfram Project" (ResearchGate, 2025) claims an
  equidistribution theorem for the centre column; same.
- The rule30prize.org bibliography lists nothing accepted since 2019.
- NKS "period 64 at depth 2,107,985,255 or more": single source.
- Wolfram's definition of the 0.252 boundary is not stated anywhere found.

## Rowan's ranking, 2026-09-07 (superseded for P1 by the ranking below)

By value over cost: 3 (four preimages, the leftward solve) → 8 and 5 and 10
(trivial first nodes) → 11 (rows `2^n`) → 13 (Rowland's doubling criterion,
under a wall) → 16 (sandwich lemma for every rule) → 17 and 18 (Jen and
Kopra beyond the single cell) → 22 and 23 (fixed points, no period 2) → 25
and 26 (rings). Item 19 if kernel `decide` copes. Items 6 and 28 when a
prover has the topology set up. Not 27, not anything with "≈" in it.

## Rowan's ranking for the next tier, 2026-09-09 (P1)

Board state this ranking answers: 113 of 117 nodes proved, three walls that
must not be dispatched, and **one** dispatchable leaf — `leftDiagonal_onset_le`,
eleven attempts, abandoned tonight with two thirds of its budget unspent
because the prover had no idea left worth the money. The scheduler has
nothing to schedule. So this tier is not "more nodes"; it is the specific
question of whether the object of crystal 57–60 can be given a stateable
shape.

By value over cost:

1. **The eventually-white diagonal, as an object.** `leftDiagonal k` is
   eventually white — a definition and its two or three immediate lemmas.
   Nothing on the board names it and four independent routes end at it. Even
   the trivial consequences are worth having, because every later statement
   in this tier is phrased in it.
2. **Item 13, Rowland's period-doubling criterion.** Ranked under a wall on
   2026-09-07 and never seeded. It is a *published proof*, not a conjecture,
   and it is the theorem that connects item 1 to the doubling positions. If
   one thing from this tier lands, this is the one that should.
3. **Gnomon's conditional** (see the convergence section): the onset bound
   with the eventually-white levels as an explicit hypothesis. The
   unconditional form is the wall; the conditional form is an ordinary node.
   Propose it only with the hypothesis stated — the unconditional version is
   measured false.
4. **The `bdry` boundary walk**, from the parked file of attempt 11 on the
   onset wall (`runs/20260909T212551Z/leftDiagonal_onset_le-11/`). Sixteen
   kernel-clean theorems the build cannot see, and the fourth time an onset
   attempt has rebuilt that walk from scratch. This is harvest, not
   invention: read the file, seed the ones that are a machine rather than an
   internal lemma of one tactic script.
5. **The T-function dictionary** (crystal 60): centre column as `bit_t` of
   `T^t(1)`. A clean restatement of the P1 residual with no automaton in it,
   already kernel checked in `explorer/`.

**Not this tier, and why.** No further `_of_le_N` rung above `87866`
(crystal 57 gives its exact expiry). Nothing from the single-cycle or
invertibility machinery of the T-function field (crystal 60: closed). No
proposal that leans on triangularity to bound a transient (crystal 59: the
odometer witness has tail `2^(n-1)`). And nothing phrased as a bound in the
number of states — that is the currency error crystal 59 exists to record.

