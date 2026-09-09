# The rigidity law of the T-map's attractor

Talus, 2026-09-09. Topic: `T_n(r) = (4r XOR (2r OR r)) mod 2^n`, `A(n)` its
attractor (the states lying on cycles), and the exact law
`|A(n)| - |A(n-1)| = maxCycle(n)`, verified with no exceptions over 519 levels.

**Verdict up front.** The law is not a law. It is a restatement of Rowland's
uniqueness conjecture — "there is really only one left side of rule 30" — read at
truncation width `n`, and it **fails first at `n = 53209`**, which is Rowland's own
predicted counterexample column. The increment there is `32` against a `maxCycle`
of `16`, and `48` against `16` at `n = 58288`. The reduction that gets there is one
identity, proved in the kernel, and it is the deliverable.

---

## 1. The residual, in one paragraph

`T` is rule 30's row map: read row `t` of the picture as a binary number, bit `k`
being the cell `k` places in from the black left edge, and `T` takes one row to the
next. `T_n` keeps the lowest `n` bits — the leftmost `n` cells of the cone — and
because bit `i` of `T(r)` reads only bits `i`, `i-1`, `i-2` of `r`, that truncation is
a genuine dynamical system on `2^n` states. `A(n)` is its attractor: the rows that
recur for ever, which in the picture are exactly the *settled* words of the first `n`
left diagonals. The measured law says the attractor grows, level by level, by exactly
the length of the longest cycle in the graph. What would have to be true for it is
this: **the odd part of the attractor must be a single cycle**. That is where the
residual lives — not in the top bit, where the topic's lifting argument points, but at
the *bottom*: the even states are a faithful, one-bit-narrower copy of the whole
system, so the growth from level `n-1` to level `n` is precisely the number of odd
periodic points, and the odd periodic points are precisely the truncated *left sides*
of rule 30 — the pictures with a black left edge. The law holds at width `n` if and
only if there is exactly one of them. In the picture: it is a statement about the
seam-free settled region near the left edge, not about the centre column, and it is
the same statement Rowland made in 2006 and expected to be false.

---

## 2. Why the known routes fail

**The topic's own handle — the top-bit lift — is the wrong end of the word.** `T` is
triangular, so `A(n) ⊆ {a, a + 2^(n-1) : a ∈ A(n-1)}` and each level at most doubles;
the topic asks "which lifts survive". Worked from that end the question is genuinely
hard, because *whether* a lift survives depends on the whole cycle the base point sits
on: writing the top bit's update as `b ↦ a_{n-3} XOR (a_{n-2} OR b)` with `a` running
around a cycle `C` of `A(n-1)`, the composite around `C` is constant if any point of
`C` has bit `n-2` black (one lift survives, no growth) and an involution if bit `n-2` is
identically white (both lifts survive, growth `|C|`). So the increment is
`Σ { |C| : C a cycle of A(n-1) with bit n-2 identically white }`, a sum over an
unenumerated family, and the identification of that sum with `maxCycle(n)` is not
visible from there. The bottom bit gives the same information in one line (C1) and
this document works from there. This is not a dead end so much as a wrong end, and it
is worth recording because the topic recommends it.

**Every route that would prove the law is dead, because the law is false** (C4). Any
argument that "which lifts survive" is controlled by a single cycle is refuted at
`n = 53209` by an explicit second cycle, exhibited below.

From `docs/obstructions.md`, the entries that bear on this topic:

- *"A bounded return period is the doubling staircase, not structure: the constant 16
  expires at k = 87867"* (obstruction 13, mine). It establishes the period staircase
  `P(m) = 1,2,4,8,16,32` stepping at `m = 4, 9, 30, 401, 87868`, and — the part this
  topic needs — that the eventually-white diagonals are `2, 7, 28, 399, 53207, 58286,
  87866` while the *doublings* are at diagonals `3, 8, 29, 400, 87867`. Whites and
  doublings coincide up to `399` and part company at `53207`. That parting is exactly
  where the rigidity law breaks, and the entry already contains the second cycle that
  breaks it (found by flipping bit `w+1` at a complement-type white). This topic and
  that entry are the same object read from two sides.
- *"There is only one left side of rule 30, up to a translation along the edge"*
  (crystal 49) and obstruction 5, *"The left of the picture knows one integer about the
  configuration"*. These record the *computed* uniqueness — 40 configurations, all
  taking the seed's branch — and say plainly that it is a margin and not a law. The
  rigidity law is the same uniqueness, stated about `T_n`'s state space instead of
  about configurations, and in that setting it is not a margin at all: both branches are
  honest periodic points of `T_n`, so the law fails outright while crystal 49 survives.
  The distinction matters and is made precise in C4.
- *"The diagonal structure never reaches the centre column"* (obstruction 1). Whatever
  comes out of this topic is a statement about the settled region near the left edge.
  It does not touch P1, and no claim here is offered as if it did.
- The `native_decide` prohibition (crystals, P2 section) applies: `|A(53209)|` is a
  computed number and can never be a node. What *can* be a node is C1, which is proved,
  and the finite instances C3 closes in the kernel.

**A new dead end, appended to `docs/obstructions.md`** as *"The rigidity law of the
T-map's attractor is Rowland's uniqueness conjecture in disguise, and it is false from
n = 53209"*.

---

## 3. Candidate claims

### C1. The halving identity, and the increment as a count of odd periodic points

**The claim, in English.** `T` commutes with doubling: `T(2s) = 2 T(s)` exactly, as
natural numbers. In the picture, doubling a row slides it one cell further in from the
left edge, and rule 30 does not notice, because the cell outside is white either way.
Consequently the even states of `T_n` are a faithful copy of the whole of `T_{n-1}`,
the attractor splits as `A(n) = 2·A(n-1) ⊔ {odd periodic points of T_n}`, and

> `|A(n)| - |A(n-1)| = #{ odd periodic points of T_n }`.

**In the project's vocabulary.** With `step r = 4 * r ^^^ (2 * r ||| r)` (the map of
`rowNat_mod_eq_iterate`):

```lean
theorem step_two_mul (s : ℕ) : step (2 * s) = 2 * step s
theorem stepMod_two_mul (n s : ℕ) : step (2 * s) % 2 ^ (n + 1) = 2 * (step s % 2 ^ n)
theorem stepMod_iterate_two_mul (n t s : ℕ) :
    (fun r => step r % 2 ^ (n + 1))^[t] (2 * s) = 2 * (fun r => step r % 2 ^ n)^[t] s
```

The attractor itself has no definition on the board; the consequence that does not need
one is the orbit statement, which says the orbit of an even state at width `n+1` is the
orbit of its half at width `n`, doubled — from which "even periodic point at `n+1`
`↔` periodic point at `n`" is immediate.

**What it would give.** It replaces the topic's question entirely. "Which top-bit lifts
survive, and why does their count equal the largest cycle" becomes "how many odd
periodic points are there", and the odd periodic points are a concrete, enumerable
object: the truncated left sides of rule 30. Everything else in this document is a
consequence.

**Falsification.** `explorer/talus5_odd.mjs`, exhaustive over the whole `2^n` state
space by in-degree peeling, `n = 1..22` (4,194,304 states at the top level), plus a
direct exhaustive test of the identity itself: **0 failures over 4,194,302 states**,
`n = 2..22`. The attractor split `A(n) ∩ 2ℤ = 2·A(n-1)` holds at every level with 0
exceptions, and `|A(n)| - |A(n-1)| = #odd` with 0 exceptions. *Survives.*

**Distrust.** Three things could have produced this besides the claim being true.
(i) A wrong engine: the fast 32-bit map was checked against a BigInt implementation of
the same formula (0 mismatches, 24 widths × 400 random states), and the map itself is
the board's own `rowNat` step. (ii) A wrong attractor: the peeling is
in-degree-zero removal, which returns *exactly* the cyclic nodes, and the cycle
decomposition was re-derived independently by walking `img` from each survivor; the
resulting `|A(31)| = 114` and `|A(420)| = 3386` reproduce Rowan's two independently
computed values to the digit, from code sharing nothing with theirs. (iii) Symmetry:
this project has twice been caught by a mirror image passing every symmetric check. The
halving identity is *not* symmetric — it is false for the mirror rule, since it says the
white side is on the left — and it is now proved rather than measured, in the kernel.

**Kernel.** `explorer/talus5_scratch_halving.lean`, accepted by `lake env lean`, axioms
`[propext, Quot.sound]` for all three theorems — no `Classical.choice`. The proof is
three lines: `4·(2s) = 2·(4s)`, then `2·x = x <<< 1` and `Nat.shiftLeft_xor_distrib` /
`Nat.shiftLeft_or_distrib` pull the shift out of the whole expression.

**Novelty.** Searched `sources/` for `attractor`, `eventual image`, `cyclic state`,
`periodic point`, `binary number`, `T-function`, `triangular`, `state transition graph`,
`in-degree`. Nothing in the held literature treats the truncated row map as a dynamical
system at all: Wolfram 1986 §7 and Table 6.2 study cycles on *rings*, a different object
(finite and cyclic in space, where this is finite and *bounded* in space with a white
exterior); Jen, Kopra, Kůrka, Boyle–Kitchens, Schüle–Stoop are about periodic points of
the CA on `ℤ`, again a different object. The nearest statement in print is Wolfram 1986
§7's remark that a picture with an all-white left tail is determined by what is inside
it, which is the same shift-invariance in words and not as an identity. I would file the
identity itself as *folklore, new phrasing*; the consequence for the attractor as *new*.

**Route.** `step_two_mul` is proved. `stepMod_two_mul` and `stepMod_iterate_two_mul` are
proved. The attractor statement needs a definition (`IsPeriodicPoint` for the truncated
map) that the board does not have; stated as "`∃ k > 0, T^[k] (2s) = 2s ↔ ∃ k > 0,
T'^[k] s = s`" it needs no new definition and follows from the iterate lemma in a few
lines. Hard step: none.

---

### C2. The exact spectrum: `T_n` has exactly `n+1` cycles, one per level

**The claim, in English.** Every cycle of `T_n` is `2^(n-m)` times an odd cycle of
`T_m`, for exactly one `m ≤ n`. So if `oddLen(m)` denotes the lengths of the odd cycles
at level `m`,

> the cycle spectrum of `T_n` is the multiset `⋃_{m ≤ n} oddLen(m)`, and
> `|A(n)| = Σ_{m=0}^{n} (number of odd periodic points at level m)`.

While there is exactly one odd cycle per level — which is the range `n ≤ 53208` — this
collapses to: **`T_n` has exactly `n+1` cycles, of lengths `P(0), P(1), …, P(n)`, where
`P(m)` is the period of the seed's own settled orbit at width `m`**, and

> `|A(n)| = 1 + Σ_{m=1}^{n} P(m)`.

**In the project's vocabulary.** `P(m)` is `2^(d(m))` with `d(m)` the number of left
diagonals below `m` at which the period doubles; equivalently the least common multiple
of the eventual periods of `leftDiagonal 0 … leftDiagonal (m-1)`, which are powers of
two by `leftDiagonal_periodicFrom_pow` and `minimalPeriod_dvd`. The staircase is NKS
p. 871's: `P` steps at `m = 4, 9, 30, 401, 87868`.

**What it would give.** The whole of the topic's numerology, in closed form and with no
fitting. `|A(31)| = 1 + (3·1 + 5·2 + 21·4 + 2·8) = 114` — Vernier's "collapses to 114
states", which Rowan correctly called a point value, is this sum at `n = 31`. `|A(420)|
= 3386`. The `Θ(n P(n))` growth is `Σ P(m)` read off the staircase, and the "increment
doubles at `n = 4, 9, 30, 401`" is the staircase's own steps. Nothing about the graph of
`T` needs to be invoked.

**Falsification.** `explorer/talus5_formula.mjs`: attractor computed exactly by lifting
for `n = 1..520` (the topic's own method, re-implemented), against `P(m)` computed
independently from the real rows as BigInts. Over `n = 1..520`:
`|A(n)| = 1 + Σ P(m)` — **0 failures**; number of cycles `= n+1` — **0 failures**;
cycle spectrum `= {P(0..n)}` as a multiset — **0 failures**; `#odd periodic points =
P(n)` — **0 failures**. Reported values: `|A(22)| = 70`, `|A(31)| = 114`, `|A(35)| =
146`, `|A(100)| = 666`, `|A(420)| = 3386`, `|A(520)| = 4986`. The staircase steps found
by the script from the rows alone: `4:1→2, 9:2→4, 30:4→8, 401:8→16`. *Survives to
n = 520, and dies as a closed form beyond n = 53208 for the reason in C4.*

**Distrust.** The dangerous coincidence here is that I could be comparing a computation
with itself: both sides use the same `step`. They do not use the same *structure* — the
left side peels a functional graph on a lifted candidate set, the right side runs the
true rows and looks for a return — and the two agree on the cycle *spectrum*, not merely
the total, which a shared bug would have to reproduce cycle by cycle at 520 levels. The
external checks are the two numbers `114` and `3386`, produced by Rowan yesterday from
`explorer/collapse_*.cjs` with a different implementation, and the staircase steps
`4, 9, 30, 401`, which are NKS p. 871's published depths. Note what is *not* checked:
`|A(n)|` beyond `n = 520` by any exhaustive means, and the formula is asserted beyond
that only through C1 and C3.

**Novelty.** Same search as C1; nothing in print. The staircase itself is NKS p. 871 and
Rowland 2006 Prop. 2; the closed form for `|A(n)|` is *new*, and is a restatement of C1
plus C3 rather than an independent fact.

**Route.** From C1 by induction on `n`, given that the odd part is one cycle. No
definition of the attractor is needed if it is stated as the two facts "every periodic
point is `2^j` times an odd one" (immediate from C1) and "the odd periodic points at
level `m` form one cycle of length `P(m)`" (which is C3's content and is exactly what
fails at `53209`). Hard step: the second, and it is open in general and false in
particular.

---

### C3. The lift dichotomy: the increment doubles at every white diagonal, the period only at the odd ones

**The claim, in English.** Fix a cycle `C` of odd periodic points at width `n-1`, of
length `L`. Bit `n-2` is either black somewhere on `C` or identically white on it.

- Black somewhere: `C` lifts to a single cycle of length `L` at width `n`. The odd count
  does not grow, and neither does the period.
- Identically white (i.e. **left diagonal `n-2` is eventually white**): both lifts of
  every point of `C` are periodic, so the odd count *doubles*; and the `2L` points form
  **one** cycle of length `2L` when the number of black cells in one period of diagonal
  `n-3` is odd, and **two** cycles of length `L` when it is even.

So: `#odd(n) = 2 · #odd(n-1)` exactly at `n = w + 2` for each eventually-white diagonal
`w`, while `maxCycle(n) = 2 · maxCycle(n-1)` only when that white also has odd parity —
which is Rowland 2006 Proposition 2, his period-doubling criterion, verbatim.
**Therefore the rigidity law holds at width `n` if and only if every eventually-white
left diagonal below `n-1` is of doubling type.**

**In the project's vocabulary.** The parity condition is
`Odd (∑ j ∈ Finset.range L, if leftDiagonal (n-3) j then 1 else 0)` on the settled word,
and the board already has the right-diagonal twin of both halves:
`rightDiagonal_periodicFrom_step_of_even_driver` and
`rightDiagonal_antiperiodic_of_odd_driver`. The white/black dichotomy is
`leftDiagonal_step_period_dichotomy`; the "black resets" half is
`leftDiagonal_periodicFrom_step_of_black` and `bool_driven_periodicFrom_of_reset`; the
white half is `bool_xor_driven_periodicFrom`, the running XOR whose complement is also a
solution.

**What it would give.** It is the *explanation* the topic asks for, and it explains the
doubling positions correctly, which the topic's framing does not: the increment's
doubling positions are the **whites** `w + 2 = 4, 9, 30, 401, 53209, 58288, 87868`, and
`maxCycle`'s are the **doublings** `4, 9, 30, 401, 87868`. They agree up to `401` only
because every white below `53207` happens to be odd-parity. So `n = 401` confirming
Rowland's fourth position is real, but "the increment's steps are NKS p. 871's
positions" is true over the tested range and false as a statement.

**Falsification.** Two independent instruments.
(a) `explorer/talus5_odd.mjs`, exhaustive `n ≤ 22`: exactly one odd cycle at every
level (`#oddCyc = 1`, 0 exceptions), and the odd cycle is the seed's own truncated
orbit and is the longest cycle in the graph (0 exceptions). Every odd periodic point
satisfies `r ≡ 3 (mod 8)` — bits 0 and 1 black, bit 2 white — `0` of `59` failures over
`n = 3..20`, which is the picture's left edge, second diagonal and third diagonal read
back out of the arithmetic.
(b) `explorer/talus5_second.mjs`, bit-packed engine at widths `30`, `401`, `53209`: it
finds the whites of the seed's cycle directly (`[2, 7, 28]`, `[2, 7, 28, 399]`,
`[2, 7, 28, 399, 53207]` — obstruction 4's list, word for word, from code that shares
nothing with the code that produced that list), and at each white flips bit `w+1` and
asks where it lands. At `w = 2, 7, 28, 399`: the flipped state is periodic and **on the
seed's own cycle**, at another phase — the odd-parity case, one cycle of double length.
At `w = 53207`: periodic and **not** on the seed's cycle. *Survives.*

**Distrust.** The verdict I want is "the flip lands elsewhere", so the failure mode to
rule out is a flipped state that is really the same cycle read at a different phase and
that my comparison missed. Three things rule it out. The comparison is against all `16`
states of the seed's cycle, not one. The two cycles are related pointwise by
`XOR 2^53208` (checked), so if they were the same cycle the bit-`53208` word would be a
rotation of its own complement — and it is not: over one period the seed reads
`1000001000011000`, weight `5`, and the second reads `0111110111100111`, weight `11`.
A rotation preserves weight, so `5 ≠ 11` settles it with no reference to my
cycle-matching code at all. Conversely the doubling controls at `w = 2, 7, 28, 399`
demonstrate that the same comparison *does* return "same cycle" when it should, so it is
not a detector that always fires.

**Novelty.** The parity dichotomy is Rowland 2006 Proposition 2 and Lemma 3, and I claim
no novelty for it. What is new is the translation: Rowland's criterion governs the
*period*, and here it is shown to govern the *ratio between two different quantities* —
the attractor's growth (which doubles at every white) and the longest cycle (which
doubles only at odd-parity whites). That the two can come apart, and where, is not in
print, though Rowland's §5 identifies the same column for the same reason.

**Route.** The board has every ingredient of the dichotomy for left diagonals already
(`leftDiagonal_step_period_dichotomy`, `bool_xor_driven_periodicFrom`,
`bool_driven_periodicFrom_of_reset`). Stating it about `T_n`'s periodic points needs the
periodic-point vocabulary of C1 and nothing more. Hard step: none for the dichotomy
itself; the *counting* consequence ("so the odd part is one cycle") is the false part.
One finite instance is kernel-closed already: in
`explorer/talus5_scratch_halving.lean`, `decide +kernel` verifies that every odd state
of width 12 lands on the seed's cycle, whose minimal period is exactly 4 — so
`|A(12)| - |A(11)| = 4 = maxCycle(12)` is a kernel fact, not a measurement.

---

### C4. The rigidity law is false, and the first failure is at `n = 53209`

**The claim, in English.** At width `n = 53209` the map `T_n` has **two** disjoint odd
cycles, each of minimal period `16`. So the increment is `32` while `maxCycle(53209)` is
`16`. The law fails, by a factor of exactly `2`. It goes on failing, and not by a fixed
factor: three odd cycles at `n = 58288` (ratio `3`), four at `72577` (ratio `4`), and at
`87868` four cycles of periods `32, 16, 16, 16` against a `maxCycle` of `32` — ratio
`2.5`, not even a power of two. Predicted values: `|A(53208)| = 847,994`,
`|A(53209)| = 848,026` where the law wants `848,010`.

**In the project's vocabulary.** Diagonal `53207` is eventually white (obstruction 4)
and the black-cell count in one period of the settled word of diagonal `53206` is even,
so by Rowland's criterion the period does not double there — it is his complement-type
white, his column `53209` (his column `m` is our diagonal `m-1`; the coincidence between
his column number and this width is a coincidence and not an index slip: our branch bit
is `53208`, the first width holding it is `53209`). Then bit `53208` obeys
`x' = bit(53206) XOR x`, a running XOR, and the complemented solution is also periodic.

**What it would give.** It closes the topic: there is nothing to prove. It also
sharpens crystal 49 and Rowland's surmise in a specific way — the second left side
*exists as a periodic point of the truncated map*, unconditionally and by exact
computation, where Rowland could only say "if in fact they do occur for some initial
conditions" and crystal 49 could only say that 40 configurations declined to realise it.
Those remain different questions: nothing here exhibits a *configuration* whose left
side is the second cycle, and crystal 49 is untouched.

**Falsification.** This is the claim, so the run is a confirmation, and it was built to
be able to fail.
- `explorer/talus5_second.mjs`, width `53209`, `110,000` steps: seed orbit settles at
  `t = 71,132` with minimal period `16`; whites `[2, 7, 28, 399, 53207]`; the flip at
  `53207` gives a state that is periodic **from `t = 0`** (preperiod `0`) and shares
  `0` of `16` states with the seed's cycle.
- `explorer/talus5_bigcheck.mjs`, the same width, everything re-done in BigInt:
  packed-vs-BigInt at width `53209` for 400 steps, `0` mismatches; `T(state) = next
  state` around **both** 16-cycles, `0` failures of `32`; overlap between the cycles
  `0` of `16`; both cycles entirely odd; bit `53207` identically white on both; the
  second cycle equal to the first XOR `2^53208` pointwise.
- `explorer/talus5_enumerate.mjs` and `talus5_deep.mjs`, the full closure of the branch
  tree at five widths:

  | `n` | odd cycles | minimal periods | increment | `maxCycle(n)` | ratio |
  |---|---|---|---|---|---|
  | 53208 | 1 | 16 | 16 | 16 | 1 — the law's last width |
  | 53209 | 2 | 16, 16 | 32 | 16 | 2 |
  | 58288 | 3 | 16, 16, 16 | 48 | 16 | 3 |
  | 72577 | 4 | 16, 16, 16, 16 | 64 | 16 | 4 |
  | 87868 | 4 | **32**, 16, 16, 16 | 80 | 32 | 2.5 |

  The third cycle at `58288` arises because the seed's branch has `58286` white and the
  `53208` branch does not; the fourth at `72577` because the `53208` branch's own next
  white is at `72575`. Those are Rowland 2006's two predicted follow-on columns `58288`
  and `72577` (his column `m` = our diagonal `m-1`), recovered here from the branch
  closure rather than from his argument, and the whites printed per cycle are
  `[2,7,28,399,53207,58286]` for the seed's branch and `[2,7,28,399,53207,72575]` for
  the other, which is his sentence in numbers. At `87868` the seed's cycle doubles to
  period `32` (NKS p. 871's fifth doubling) and produces no new cycle, because that
  white has odd parity — so even the *ratio* is not a power of two: `80/32 = 2.5`.

**Distrust.** The result I like is "the law is false", so: what else could produce two
apparently distinct cycles? A wrong period (if the true minimal period were `32` I would
be reading half a cycle twice) — ruled out because the settle test with `p = 16`
*succeeded*, which it cannot do if the period is `32`, and because the minimal period is
recomputed by divisor test on both cycles. An engine artefact at large width — ruled out
by the BigInt re-derivation at that exact width and by the independent invariant check
that `T` maps each of the 32 states to the next. A phase confusion — ruled out by the
weight argument in C3. An off-by-one in the white index — ruled out by the whites list
reproducing obstruction 4's independently, and by the doubling controls at `30` and
`401` behaving oppositely. What is **not** ruled out, and I say it plainly: `maxCycle(n)`
at these widths is not computed, it is *argued* — every cycle is `2^j` times an odd
cycle (C1), every level `m ≤ 53208` has exactly one odd cycle of length `P(m) ≤ 16`
(C3 plus the whites list), and both cycles at `53209` have length `16`, so
`maxCycle(53209) = 16`. If some level below held an odd cycle of length `32` the ratio
statement would change, though the failure of the law would not, since the increment
`32` would then need a `32`-cycle at a level with no doubling.

**Novelty.** Rowland 2006 §5 (lines 930–946) names the column and the mechanism and
leaves the realisation conditional. Obstruction 13 (mine, yesterday) exhibits the second
cycle. What is new here is that this is the *first counterexample to the rigidity law*,
and that the law and Rowland's conjecture are the same statement — which nothing in
print or on the board says, because the T-map's attractor is not an object either of
them considers.

**Route.** No route, and none wanted: it is a refutation, and it is computed, so it
cannot be a node (`native_decide` is forbidden). Its content belongs in
`docs/obstructions.md`, where I have put it.

---

## 4. What survived

C1 survived falsification, survived the novelty search, and is now proved in the kernel
with clean axioms — it is what I would seed first, as the two `ℕ`-only statements
`step_two_mul` and `stepMod_iterate_two_mul`, size S and S–M, under nothing. It is
small, it is reusable anywhere the packed-row model is used (it is the exact statement
that the picture does not notice being slid one cell in from its left edge), and it is
the only thing here a prover can do anything with. C2 survived to `n = 520` as an exact
identity and reproduces two numbers computed independently by Rowan; it is true in the
range tested and provably ceases to be a closed form at `n = 53209`, so it should be
recorded with that range attached and not as a law. C3 survived as a dichotomy and is
the correct explanation of the measured phenomenon, but its counting consequence is
exactly the thing that fails. C4 is the result: **the topic's law is false, first at
`n = 53209`, and the exactness that "survives a correct null model" is not a property of
`T`'s functional graph at all — it is the statement that rule 30's first four
eventually-white diagonals all happen to have odd parity, which is the last thing
anybody would call structure once it is written down.** The honest summary of the whole
topic is: a random triangular map's attractor sizes are ragged because a random
triangular map has many odd cycles; rule 30's are exact because, so far and only so far,
it has one.

---

## 5. Claims that died

- **The rigidity law `|A(n)| - |A(n-1)| = maxCycle(n)` itself.** Dies at `n = 53209`,
  where the increment is `32` and `maxCycle` is `16`; witness, the second odd cycle,
  equal to the seed's cycle XOR `2^53208`, verified periodic in BigInt at that width
  (`explorer/talus5_bigcheck.mjs`, `talus5_enumerate.mjs`). It holds at every
  `n ≤ 53208`.
- **"The increment's doubling positions are NKS p. 871's doubling positions"** (the
  topic's reading, and mine for the first hour). They are the *eventually-white
  diagonals* shifted by two, `4, 9, 30, 401, 53209, 58288, 87868`; NKS's doublings give
  `4, 9, 30, 401, 87868`. The lists agree below `53209` and differ there. Dies at the
  same place and for the same reason.
- **"The top-bit lift is the handle."** Not false, but it does not close: the increment
  read from the top is a sum over the cycles of `A(n-1)` whose bit `n-2` is identically
  white, an unenumerated family. Read from the bottom bit it is a single count. I spent
  the first hour on the top and it produced nothing the bottom did not produce in one
  line.
- **"`|A(n)|` is `1 + Σ_{m ≤ n} P(m)` for all `n`"** (C2 as a law rather than a range
  statement). True and exact for `n ≤ 53208`, false from `53209`, where the correct
  form is `Σ_{m ≤ n} #odd(m)` and `#odd` stops equalling `P`.
- Nothing died for lack of depth this session; the one claim that died had its
  counterexample computed rather than searched for.

---

## 6. Next topic

The sharp thing this session leaves is a *dichotomy with one side unexplained*: an
eventually-white left diagonal `w` doubles the period exactly when the settled word of
diagonal `w-1` has odd weight, and rule 30's whites read `odd, odd, odd, odd, even,
even, odd` at `w = 2, 7, 28, 399, 53207, 58286, 87866` — four odds, then two evens, then
an odd. Every quantity this project has found rigid (the rigidity law, crystal 49's
uniqueness, the closed form for `|A(n)|`, the "constant 16" of obstruction 13) is rigid
exactly over the range where that weight has been odd, and each one breaks at the first
even. **So the topic to attack next is the parity of the settled word at a white: is
there any structure in the sequence of parities at the eventually-white diagonals, or is
it the coin that obstruction 7's hitting-time analysis says it is?** It is worth
attacking now for two reasons that were not available before. First, the parity is
computable far past the picture — obstruction 13's branch-cycle machinery reaches bit
`10^5` in seconds and crystal 55's orbit reached `2·10^9` in minutes, so the parity
sequence can be extended to the sixth and seventh whites and read as data rather than
guessed from five terms. Second, the question now has *consequences that are already
written down*: a lower bound on the density of odd-parity whites is exactly what
`leftDiagonal_period_le` (the period wall) needs, since the wall says the `n`-th
doubling is at diagonal `≥ 2^n - 1` and the doublings are precisely the odd-parity
whites — so the period wall and this parity question are the same question, and
obstruction 7 has already established that no *universal* argument over periodic words
can decide it. What has not been tried is the empirical half: the parities of the whites
of the *branch* cycles as well as the seed's, which multiplies the sample by the branch
tree and is the only way to get more than seven data points out of rule 30 at all.
