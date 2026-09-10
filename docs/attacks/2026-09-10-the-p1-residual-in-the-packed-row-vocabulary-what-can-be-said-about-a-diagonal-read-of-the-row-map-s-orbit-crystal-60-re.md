# The P1 residual in the packed-row vocabulary: the diagonal read of the row map's orbit

Sextant, seventh attack, 2026-09-10.

**Band, before anything else.** Nothing here is novel mathematics about rule 30.
The one number that changes is a **project-internal** correction: crystal 69's
fence constant is `4/3`, not `1.25`, and the `4/3` is Wolfram 1986's own boundary
speed `1/4` read in the new coordinates (`1/(1 - 1/4)`), so the constant was in
print in 1986 and the board had it wrong by 8 %. Everything else is a negative
answer to one of the topic's three questions, plus four small kernel-proved
lemmas that are vocabulary rather than progress. A mathematician would find the
lemmas routine and the dictionary between the packed row and the damage front
mildly clarifying. No prize conjecture moves.

---

## 1. The residual, in one paragraph

Time runs down the picture. Row `t` of rule 30's single-seed picture is one
number `rowNat t`, whose bit `b` is the cell at position `x = b - t`; the row
occupies bits `0` through `2t` and nothing else, and one step of the automaton is
`r ↦ 4r XOR (2r OR r)`. In these coordinates the picture's three natural readings
are three *speeds* of the bit index against the row index: a **left diagonal**
reads a bit index that does not move (speed `0`), a **column** reads one that
moves one bit per row (speed `1`), and a **right diagonal** reads one that moves
two (speed `2`). Speeds `0` and `2` are the two edges of the light cone and both
are settled — every left diagonal is eventually periodic and every right diagonal
is *exactly* periodic, both proved. Speed `1` is the prize: P1 says the centre
column, bit `t` of row `t`, never repeats, and the residual after everything on
the board is granted is that a repeating centre column would force some other
column to repeat. What would have to be true for the packed row to reach that is
a statement about the **transient** — about bits the settling has not reached.
The row map carries information only upward through the bits, so the low `n` bits
are a closed subsystem, and every tool the board has built settles that subsystem
after a while; the centre column reads bit `t` at row `t`, and the measurement
below says the low `n` bits do not settle until row `4n/3`. The centre column
therefore reads a bit that is still moving, by a constant factor, for ever — and
the residual lives exactly in the wedge of speeds strictly between `3/4` and `2`,
where nothing on the board or in print says anything at all.

---

## 2. Why the known routes fail

**Obstruction 1 (the diagonal structure never reaches the centre column)** is this
topic in the automaton's coordinates: the centre cell at time `t` is
`leftDiagonal t 0`, index zero of a diagonal whose onset is positive, so every
diagonal theorem is about the part of the picture that has settled and P1 is about
the part that has not. Nothing in the packed row changes this; §3.1 measures how
far short it falls.

**Obstruction 6 (the reset front cannot retreat)** and **crystal 51** say the same
thing about the seam: the wall `leftDiagonal_onset_le` is equivalent to
`2F(t) + t ≥ 1` with `F` the leftmost transient cell's position, and any induction
that advances monotonically overshoots because the real front retreats on 26 % of
rows. In packed-row coordinates `F(t) = A(t) - t` with `A(t)` the agreement front
of §3.1, and the 26 % of retreats are exactly the rows where `A` advances by two
or more (§3.1, measured 26.03 % against obstruction 6's 0.26 — an independent
reproduction in a different vocabulary).

**Obstruction 13 (the environment-based speed bound) and 14/15 (the reachable
set)** price the two routes that use the local law against the settled region.
Both are position-coordinate statements and both transfer verbatim: crystal 63's
optimal background-driven walker runs at `0.50106` in position, i.e. `0.49894` in
bit index; crystal 64's reachable set at `0.4531`, i.e. `0.5469`. §3.3 measures
the same object directly from the raw map and gets `0.536`–`0.566`. All of these
clear the onset wall's `0.5` and none of them is within a factor of two of the
centre column's `1`.

**Obstructions 16–18 (the T-map's regularities are period regimes in disguise)**
are the standing prior for this vocabulary, and they were right again: the
constant `1.25` this topic hands me turns out to be a small-`n` artefact of
exactly the kind those entries describe (§3.1, §5). Obstruction 18's advice —
*the right prior is that a clean pattern in `T_n` is a period regime in disguise,
and the question to ask first is where it breaks* — is the reason the first thing
I did was measure the constant rather than build on it.

**Obstruction 20 (the right edge is the same position, not a better one)** is what
kills the topic's question (3) before the arithmetic does: the centre column is
the free coordinate of the right-diagonal tower, so a re-reading through
right-diagonal periodicity relocates the same free bit and determines nothing new.
§3.4 adds the quantitative half — the relocation is at bit-index speed `2`, the
far edge of the cone, where the bounded-period settled band is nine bits wide.

**Routes I considered and did not pursue.** Bounding the damage front from below
(needed for "the centre column is never settled") is the mirror of crystals A3 and
is not available for the same reason. Reading the centre column off the
`F₂`-linear part (rule 150 plus the quadratic term, crystals 59 and 66) is refused
by the OR-to-XOR filter before it starts.

**New dead end, appended to `docs/obstructions.md`:** *Every re-reading of a
centre-column cell the board can produce lies at bit-index speed 1 or 2, and the
speed-0 re-readings stop at k = 19.*

---

## 3. Candidate claims

### C1. The fence constant is 4/3, not 1.25, and it is Wolfram's 1/4

**The claim, in English.** Read each row of the picture as a binary number and
ask when its lowest `n` bits stop changing — that is, when the sequence
`t ↦ rowNat t mod 2^n` enters its cycle. Call that row `pre(n)`. Crystal 69 states
it as "about `1.25 n`". It is not: `pre(n)/n` runs at **`1.333`**, its narrowest
value anywhere above `n = 100` is `1.2135`, and the closest approach on each
successive decade *rises* toward `4/3`. Equivalently, the settling front in the
`(row, bit)` plane advances at **`0.75005`** bits per row, which is `1` minus
Wolfram 1986's boundary speed `1/4` (§5 lines 594–610, §6 lines 802–810) and
matches crystal 51's independently measured seam speed `0.2497`.

**In the project's vocabulary.** `pre(n)` is the preperiod of the orbit of `1`
under `stepMod n`, the object of `leftDiagonal_onset_le_iff_stepMod_return` and
crystal 61. Writing `A(t)` for the number of low bits on which `rowNat t` and
`rowNat (t + 32)` agree, `pre(n) = min { t : A(t) ≥ n }`, and `A(t) = t + F(t)`
with `F` crystal 51's front. The three thresholds this vocabulary has to keep
apart:

| what | in `pre` | in `A` | status |
|---|---|---|---|
| proved (`leftDiagonal_periodicFrom_pow`) | `pre(n) ≤ 2^(n-1) + n` | `A(t) ≳ log₂ t` | closed |
| the onset wall | `pre(n) ≤ 2n - 2` | `A(t) ≥ (t+1)/2` | open |
| **the truth** | **`pre(n) ≈ 4n/3`** | **`A(t) ≈ 3t/4`** | measured |
| a settled centre column | `pre(n) ≤ n - 1` | `A(t) ≥ t + 1` | **false** |

**What it would give.** Nothing towards a proof; it corrects a number a seeder
would otherwise design against. Its content is that the fence crystal 69 draws is
*stronger* than the crystal states — the margin is 25 % of the row, not 20 % —
and that the fence's real content is a damage-front speed, so crystal A3 applies
to it and no proof of it is available.

**Falsification.** `explorer/sextant7_deep.mjs`, exact, rows `0..130,976`,
`n ≤ 98,239`, no window-edge truncation, monotonicity of `A` violated 0 times.
`pre(n)/n` = 1.3300 (n=100), 1.2700 (500), 1.2750 (1000), 1.3315 (10⁴), 1.3362
(8·10⁴); least squares over `n ∈ [49119, 98239]` gives slope **1.32929**; net
`A(t)/t = 0.75005` at `t = 130,976`. Closest approach by decade: `1.21348` at
`n = 445`, `1.26680` at `n = 1027`, `1.32515` at `n = 10429` — rising. **Survives.**

*What else could have produced this.* Four things checked. (i) The lag-32 method:
the first lag-32 agreement equals the true preperiod only because the truncated
orbit is a rho, and `explorer/sextant7_forced.mjs` checks it against a brute-force
cycle-finder for every `n ≤ 18`, 0 mismatches; `32` is a multiple of every left
diagonal's period below bit 2,107,985,255 (NKS p. 871), and the run stops at
98,239. (ii) The packed engine: checked bit-for-bit against a BigInt
implementation for rows 0..200 and against a cell-by-cell rule 30 picture for
3,965 cells, 0 mismatches (`sextant7_front.mjs`). (iii) The object: `min (2·F(t) + t)`
comes out **17 at t = 19**, which is crystal 51's number to the digit, from a
different script by a different session — so `A(t) - t` really is crystal 51's
`F`. (iv) The increments of `A` are `0 / 1 / ≥2` at `59.23 / 14.73 / 26.03 %`
against obstruction 6's independently measured `0.59 / 0.15 / 0.26` for the
front's advance / stay / retreat. Two independent reproductions of numbers this
project already held, from a vocabulary that shares no code with them.

**Novelty.** The constant is Wolfram's, found by grepping
`wolfram-1986-random-sequence-generation.txt` for `1/4`, `0.25`, `boundary`,
`transient`: line 603 gives the biased random walk "advancing at average speed
1/4" and lines 802–810 give the regular/irregular boundary moving left at speed
0.25. Searched `rowland-2006` (both extractions) for `transient` and `onset`: no
matches. So this is a **new phrasing of a known constant**, and a correction of a
board entry rather than a result.

**Route.** No route, and the statement is not seedable as it stands: "`pre(n) ≥ n`
for every `n ≥ 19`" is a negative universal about the seed with no more purchase
than the walls have. What *is* seedable out of it is C3 and C5 below.

### C2. `rowStep_agree_succ_two_of_triple` — the forced two-bit advance from one number's bits

**The claim, in English.** Two rows that agree on their low bits, and first differ
at one bit, are pushed apart or together by the row map according to a small local
rule. The board has the one-bit version: agreement grows by one bit exactly when
the control bit below the difference is black. It also has a two-bit version whose
hypothesis mentions *both* rows, which is why nothing on the board forces a
two-bit advance from what one row shows. Here is the missing piece: if the row
shows the pattern **black, white, black** at the three bits `n, n+1, n+2`, and the
front sits at `n+1`, the agreement jumps two bits at once. And the forcing stops
there: an explicit pair shows no rule of this family can force three.

**In the project's vocabulary.**

```
rowStep_agree_succ_two_of_triple (n x y : ℕ)
  (h  : x % 2 ^ (n + 1) = y % 2 ^ (n + 1))
  (hb : x.testBit n = true) (hw : x.testBit (n + 1) = false)
  (hy : y.testBit (n + 1) = true) (hr : x.testBit (n + 2) = true) :
  rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3)
```

with the ceiling witnessed by `x = 11`, `y = 15`, `n = 1`: the hypotheses hold,
the successors agree mod `2^4`, and they differ mod `2^5`.

**What it would give.** Crystal 64 is the one measured route that lands on the
right side of `leftDiagonal_onset_le`, and its ingredient (b) — the forced retreat
at the triple `1 0 1` — lives in `Config` coordinates. This is that ingredient in
the raw-map vocabulary, so a reachable-set argument can be run entirely inside
`rowStep` alongside `rowStep_agree_forward` and `rowStep_agree_succ_iff`, with no
`evolve` and no diagonal. What remains after it is everything: the DP has to be
stated and its mean-cycle bound proved, and obstruction 15 prices that.

**Falsification.** Kernel: `explorer/sextant7_scratch_forced.lean`, accepted by
`lake env lean`, axioms `[propext, Classical.choice, Quot.sound]` for the lemma
and `[propext]` for the witness. Engine: `explorer/sextant7_forced.mjs`, 20,000
rows of the seed's own orbit, **0 soundness violations** — the forced advance
never exceeded the true one at any row. **Survives.**

*What else could have produced this.* A lemma that is true because its hypotheses
are never met would pass both checks. They are met: the triple fires on **13.10 %**
of rows at the true front, and the one-bit branch on 27.38 %. And the kernel check
is a check: `explorer/sextant7_scratch_axioms.lean` runs the same proof with the
triple's right cell flipped from black to white and Lean rejects it, with the goal
left open at bit `n+2` — the exact line the flip breaks.

**Novelty.** New phrasing of crystal 64(b) (Alidade, 2026-09-09), itself the
agreeing half of `rule30_left_local_law` (crystals A2). Searched
`wolfram-1986` for `front`, `boundary`, `random walk` — §5 line 603 has the biased
walk in words with no local rule; `kopra-2022`, `kurka`, `rowland-2006` (both
extractions) for `damage`, `difference`, `perturb`: nothing with a three-cell
pattern. The raw-map form is not in print because the packed row is this
project's own vocabulary.

**Route.** `rowStep_agree_succ_iff`'s own proof file already contains the three
private helpers this needs (`testBit_rowStep`, `mod_two_pow_eq_iff`,
`rowStep_mod_two_pow`); the proof is those plus one case split on two bit indices.
Size S. Nothing is hard.

### C3. The cone in the packed-row vocabulary: `rowNat t` has bit length exactly `2t + 1`

**The claim.** `2 ^ (2 * t) ≤ rowNat t ∧ rowNat t < 2 ^ (2 * t + 1)`.

**What it would give.** It is what makes "a diagonal read has a speed" a bounded
question rather than an open-ended one: the bit indices row `t` occupies are
exactly `0 .. 2t`, so a read along `b = v·t + c` is inside the picture only for
`v ∈ [0, 2]`, the integer speeds are `0`, `1`, `2`, and they are the left
diagonals, the columns and the right diagonals. Every packed-row argument that
wants to say "this read is outside the picture" currently has to go back through
`rowCell` and `evolve_eq_false_of_outside_cone`; this says it in one line about a
`Nat`. After it, nothing — it is vocabulary.

**Falsification.** Kernel, `decide +kernel` for every `t ≤ 120`,
`explorer/sextant7_scratch_forced.lean` (`rowNat_bitlength_le_120`), axioms
`[propext]`. **Survives.**

*What else could have produced this.* A range check proves a range, and this one is
weaker than it looks: **the bit-length statement is symmetric under mirroring**, so
it would hold verbatim for rule 86 — both edges of the cone are black in both
rules, so reversing the row inside `0 .. 2t` changes nothing about its length. I
wrote the opposite in a first draft. The guard against the orientation error that
`Rule30/Basic.lean` records is not this check but the one already in that file
(`rowCell` against `evolve` on all thirteen cells of the first seven rows) and
`rowCell_eq_evolve` above it; what distinguishes the two rules in the packed row is
the *low* bits — `rowNat_testBit_zero` with bit 1 black and bit 2 white, which are
the first three left diagonals and are not the first three right diagonals. So C3
is a true, cheap, symmetric fact, and its value is as a range for bit indices, not
as evidence of anything.

**Novelty.** Crystal 20 carries OEIS A110240's `3·rowNat n < rowNat (n+1) <
5·rowNat n`, which the bit-length statement weakens to `2 < ratio < 8`. Searched
all of `sources/` for `least significant`, `bit length`, `binary`: the only hit is
Wolfram 1986 line 117, about a different map. The exact bit length is not in the
held sources and is routine either way. **Band: nothing.**

**Route.** `rowCell_eq_evolve` at `x = t` and at `x = t + 1`, plus
`Nat.lt_pow_iff_log_lt`-flavoured bookkeeping to get from "bit `2t` set and
nothing above" to the two inequalities. Size S–M; the friction is the `ℕ`/`ℤ`
cast in `rowCell`, not the mathematics.

### C4. There is no second reading, and the two ways there could have been one both close

**The claim, in English.** For a centre-column cell to be re-read where the
settling front has passed, one of two things has to happen. Either the *same* bit
index is readable at a much later row — that needs left diagonal `k` to be
periodic from its very first index, which is onset zero — or the cell reappears
somewhere else, which on this board means right-diagonal periodicity. Both were
tested.

*The speed-0 re-reading exists, and it is finite.* Left diagonal `k` has onset `0`
for **exactly the 19 values `k ∈ {0, …, 17, 19}`** and for no other `k` up to
**200,000**. For those `k`, `centerColumn k = leftDiagonal k (32m)` for every `m`,
a genuine second reading deep in the settled region — and the list stops at 19.

*The speed-2 re-reading is the topic's `centerColumn_eq_evolve_mul_pow`, and it is
worse rather than better.* In bit terms that node says
`centerColumn k = bit_(2m·2^k + k) (rowNat (m·2^k + k))`: bit index `2m·2^k + k`
at row `m·2^k + k`, a ratio that tends to **2** — the far edge of the cone, twice
the centre column's own speed and `2.7×` the settling front's. Concretely, at
`k = 12, m = 3` the read is bit 24,588 of row 12,300, and the low bits of that row
do not settle until row 32,948. Also worth recording because the node's docstring
says otherwise: its content is **not** the halving law but
`rightDiagonal_periodicFrom_pow` — `evolve (m·2^k + k) (m·2^k)` is
`rightDiagonal k (m·2^k)`, which is `rightDiagonal k 0 = centerColumn k` by a
period `2^k` and `periodicFrom_mul`. The halving law `rowStep (2s) = 2·rowStep s`
relates the orbit of `1` to the orbit of `2^a`, which is a *different* orbit — the
same picture translated — so it cannot produce a second reading of the seed's own
orbit at all.

*And the bounded-period settled bands do not reach the centre column from either
side.* At period at most 32 the settled band on the left is bits `0 .. 0.75t`
(C1) and on the right is bits `2t - 8 .. 2t` — nine diagonals, because the right
diagonals' minimal periods are `1,2,2,4,8,8,16,32,32,64,64,64,64,64,64,128,256,…`
so `P_k ≤ 32` exactly for `k ≤ 8`, and that band has **constant width**.
(Obstruction 20 publishes the list; recomputed here from the picture over 19,991
terms per diagonal in `explorer/sextant7_bands.mjs`, agreeing on all ten published
entries, together with the cone `bit 2t set, bits 2t+1..2t+8 clear` over rows
`0..20,000`, 0 violations — the engine half of C3.) The centre
column at bit `t` is strictly inside the gap for every `t ≥ 19` — below the right
band from `t = 9`, and strictly above the left band from `t = 19`, since
`A(t) ≤ t` throughout with equality only at `t = 18` — at distance `0.25 t` from
the left band and `t` from the right.

**What it would give.** It closes the topic's question (3) with a number instead
of an opinion, and it says which finite set the crack occupies. After it, the
speed-`1` read is known to be untouchable by every periodicity the board holds.

**Falsification.** `explorer/sextant7_reread.mjs` (rows `0..60,000`, diagonals
`0..20,000`) and `explorer/sextant7_reread2.mjs` (diagonals `0..200,000`, each
tested from its own index `0`): survivors `{0,…,17,19}` in both, largest 19.
`explorer/sextant7_front.mjs` for the `mul_pow` table. Kernel:
`centerColumn_reread_le` in `sextant7_scratch_forced.lean` checks the `mul_pow`
identity as a bit read for `k < 5, m < 4`, axioms `[propext]`. **Survives.**

*What else could have produced this.* A survivor set that stops at 19 could be an
artefact of how much evidence each `k` gets: the deep run tests `k = 200,000` over
only 168 indices where it tests `k = 20` over 200,168. So I measured the die-off.
The first index at which a diagonal disagrees with itself 32 rows later is
distributed **`50.098 %, 24.894 %, 12.521 %, 6.218 %, 3.115 %, 1.598 %, 0.788 %, …`**
over 199,982 diagonals — successive ratios `0.497, 0.503, 0.497, 0.500, 0.513`, a
fair coin to three digits — with a largest first-disagreement index of **17**
against a coin's expected maximum `log₂ 200000 ≈ 17.6`. So 168 indices of evidence
is `2^-168` worth of doubt, the table has nothing in it a coin does not explain,
and the 19 survivors are the finitely many diagonals whose eventual period is
short enough to begin at index 0 rather than the tail of a distribution.

**Novelty.** The finite survivor set is a sharpening of crystal 46's remark that
`settledCenter` "equals the centre column for `k ≤ 17` and at the coin-flip rate
after" — the correction being that `k = 19` is structural rather than a
coincidence, and that `{0,…,17,19}` is the whole list to 200,000. Searched
`rowland-2006` (both) for `transient`, `onset` — no matches at all; `kopra-2022`,
`jen-1990` for the same — nothing. The onset data in `sources/` is
`oeis-a363346-left-diagonal-transients.txt` and §5 records why it cannot be used
as the control `docs/sources.md` offers it as.

**Route.** No route to a general statement. The 19 survivors are each a `decide`;
"and no others" is a negative universal of the same shape as the walls.

### C5. `rowStep_prefix_minimal` — the autonomous prefix is the smallest one, so question (1) has a structural answer

**The claim, in English.** The row map pushes information only upward through the
bits, so the low `n` bits evolve on their own — that is `stepMod`, and it is why
every tool on the board settles a *fixed* bit index. This says there is nothing
smaller: knowing the low `n` bits of a row never determines bit `n` of the next
row. So the only sub-objects of the orbit that are closed under the dynamics are
the bit-prefixes, and the unique prefix containing bit `t` is bits `0 .. t`
entire, whose own preperiod is `4t/3` by C1 — past the row where the centre column
reads it. **There is therefore no conserved or monotone quantity localised below
the centre column's own read; any such quantity is a quantity of the whole prefix,
and the prefix has not settled.**

**In the project's vocabulary.**

```
rowStep_prefix_minimal (n : ℕ) :
  ∃ x y : ℕ, x % 2 ^ n = y % 2 ^ n ∧ rowStep x % 2 ^ (n + 1) ≠ rowStep y % 2 ^ (n + 1)
```

witnessed by `x = 0`, `y = 2 ^ n`.

**What it would give.** It is the exact converse of `stepMod_iterate_eq_rowStep_mod`
and it is what turns crystal 69 from a measurement into a structure: the ratio
`4/3` is quantitative and might have moved, but "the smallest closed subsystem
containing bit `t` is bits `0..t`" is structural and cannot. A seeder can be told,
with a node number, that a packed-row lemma about anything narrower than the whole
prefix is not going to reach the centre column. After it, the ratio is still a
measurement and still A3.

**Falsification.** Kernel, `explorer/sextant7_scratch_forced.lean`, axioms
`[propext, Classical.choice, Quot.sound]`. Three engine batteries in
`explorer/sextant7_invariants.mjs` looked for a conserved quantity anyway and
found none:

- **Rational-speed reads**, 60,000 rows, periods to 4,096, onsets to half the
  sequence, with at least 8 full cycles of evidence required: `v = 0` periodic
  (period 2 at offset 5, period 16 onset 498 at offset 400), `v = 2` periodic at
  every offset (periods 1, 2, 8, 32, 64 at right diagonals 0, 1, 5, 8, 9, onset 0
  in every case), and **not periodic at `v = 1/4, 1/3, 1/2, 2/3, 3/4, 1, 5/4,
  4/3, 3/2, 7/4`**, each with essentially every window of length 24 in its tail
  distinct (7,473 of 7,500; 29,952 of 30,000 at `v = 1`).
- **Arithmetic residues** `rowNat t mod m` for `m = 3, 5, 7, 9, 11, 13, 17, 31,
  255, 257`, rows 0..4,000: none eventually periodic, and every residue class
  occupied in the tail.
- **Row popcount**: parity not eventually periodic (1,978 distinct length-24
  factors in the tail), and the count itself decreases on 1,982 of 4,000 steps, so
  not monotone.
- **Local laws**: every 2-row × `w`-column block of the picture, `w = 1..7`, over
  4,000 rows, against what the rule alone permits. The two counts are **equal at
  every width** (4/4, 16/16, 32/32, 64/64, 128/128, 256/256, 512/512), so the
  picture realises every locally-legal block and there is no conservation law
  beyond the rule itself. Crystal 8's forbidden block is one consequence of the
  rule's own determination, verified as the packed-row identity
  `(rowStep r >> 2) AND r AND (r >> 1) = 0` over rows 0..3,000 with 0 violations
  — and at the origin it fires on 5,060 of 20,001 rows and constrains **column 1**,
  never column 0 alone.

**Survives.**

*What else could have produced this.* The periodicity tester's first version
accepted vacuously and reported "period 2001, onset 2000" for all ten moduli and
for popcount parity — an onset near the end of the sequence leaves no pair to
compare. That is this project's recorded failure mode and I walked into it; the
fix is an explicit minimum of 8 full cycles of evidence, and with it every
spurious `YES` disappears while the genuine speed-0 and speed-2 ones remain. The
block battery's first version reported "32 of 64 blocks occur, 32 missing" as
though it had found a law; the 32 missing are exactly the blocks the rule forbids
because the bottom-right cell of a 2×3 window is a function of the top three, and
the honest test is the comparison with the rule's own count, which is what the
table above reports.

**Novelty.** The positive half (`stepMod` is a closed subsystem) is on the board.
The minimality is elementary and I found nothing like it in the held sources;
searched all of `sources/` for `triangular`, `T-function`, `autonomous`,
`least significant` — the only relevant hit is Wolfram 1986 line 117, about a
different map. Crystal 60's dictionary (Vernier) says rule 30's row map is a
T-function; triangularity *is* the autonomy of the prefixes, and crystal 59 already
records that triangularity alone bounds nothing. **Band: nothing** on its own;
its value is as a fence a seeder can cite.

---

## 4. What survived

Four of the five. **C2** (`rowStep_agree_succ_two_of_triple` and its `+2` ceiling)
and **C5** (`rowStep_prefix_minimal`) are kernel-proved, vocabulary-neutral, and
seedable at size S; **C3** (the cone as a bit length) is kernel-checked to `t ≤ 120`
and provable from three closed nodes; **C4** is a measurement that closes the
topic's question (3) with a finite list. **C1** survived falsification but is not a
claim the board can seed — it is a correction to crystal 69's constant, and it
should be applied to the crystal rather than proposed as a node.

**Seed C5 first.** It is three lines, it is the only one of the four that answers a
question the topic asked (question (1)) with a *structural* fact rather than a
measurement, and it is the fence that stops the next session repeating this one:
after it, "is there a monotone quantity the centre column can see" has a node
number for an answer. **C2 second**, because it is the raw-map form of the one
measured route that clears the onset wall, and because crystal 64's DP cannot be
stated in the packed-row vocabulary without it. C3 is cheap vocabulary and can ride
along. C4 goes in the obstructions file, not the DAG.

The topic's three questions, answered plainly:

1. **Is there a monotone or conserved quantity a diagonal read can see?** The only
   monotone quantity is the agreement front `A(t)`, already proved monotone by
   `rowStep_agree_forward`, and it is a quantity of a *pair* of orbits. Within one
   orbit the conserved quantities are the cone's own edges — bits 0, 1, 2 constant
   and bits `2t`, `2t-1` determined — which are the first three left diagonals and
   the last two right diagonals, i.e. speeds 0 and 2. Nothing at speed 1. And the
   reason is structural, not statistical: C5.
2. **Do the four vocabulary-neutral lemmas say anything about a moving index?**
   **Yes, and it does not help, and that is the plain negative the topic asked
   for.** They are not restricted to a fixed index — the index they move is the
   agreement front. But what they can *force* is at most `+1` per row from
   `rowStep_agree_succ_iff` and at most `+2` at the `1 0 1` triple (C2), with `+3`
   refuted by an explicit pair; and on the seed's own orbit the forced advance
   averages **0.536 bits per row** at the true front, against a true front of
   **0.7465** and a centre column of **1.000**. Even the family's absolute ceiling
   of `+2` per row would only be reached by a row that is `1 0 1` at every step,
   and `rowStep_agree_succ_iff` holds as an *iff* on the real orbit at all 20,000
   rows tested — so the mechanism is exactly understood and it is short by a
   factor of two. The fixed-index restriction is not essential to the four lemmas;
   the *speed* restriction is.
3. **Does the halving law give a second reading past the front?** No. The halving
   law relates different orbits, not different rows of one, so it gives no second
   reading at all; `centerColumn_eq_evolve_mul_pow` is right-diagonal periodicity
   rather than the halving law, and it relocates the read to bit-index speed `2`,
   which is further from the bounded-period settled region than speed `1` is, not
   nearer. The one place a second reading *does* exist — left diagonal `k` with
   onset `0`, giving a speed-0 re-read deep in the settled region — is a set of
   exactly 19 values of `k`, all below 20, with nothing above 19 up to `k =
   200,000` and a die-off that is an exact coin. **There is a crack, it is finite,
   and it closed at `k = 19`.**

---

## 5. Claims that died

- **"The set of centre-column cells that are settled cells is `{0,…,17}`."** Mine,
  from `sextant7_front.mjs`, believed for two hours. Dies at `k = 19`: I computed
  `pre(k+1) - k` and called it `onset(k)`, but `pre(n)` is the preperiod of the
  whole *prefix* of bits `0..n-1`, so `pre(k+1) - k` is `max_{j ≤ k} (o_j + j) - k`,
  not the per-diagonal onset `o_k`. `pre(20) = 20` gives `1`, while `o_19 = 0` —
  bit 19 alone *is* settled from its first index, and `pre(20)` is 20 because bit
  **18** is not. Caught by the A363346 comparison in §5 below, which put the two
  definitions side by side. The correct list is `{0,…,17,19}` and it is C4. A true
  value with a wrong label, which is exactly what `CLAUDE.md` says this project
  keeps producing.
- **"`pre(n)/n ≈ 1.25`"** (crystal 62, Gnomon, 2026-09-09; the topic's own premise).
  Dies as an asymptotic: the slope is `1.329` over `n ∈ [49119, 98239]` and the
  ratio is `1.336` at `n = 8·10⁴`. It is a real number over a narrow range — the
  octave slopes are `1.156` at `[128,256]`, `1.258` at `[512,1024]` — so a fit
  over crystal 62's own range (`k < 600`) gives about `1.25`, and crystal 62's own
  worked data point, `pre(49) = 71`, is ratio `1.449`. The entry's arithmetic
  correction of the board's `1.34` was right about *which quantity* (preperiod, not
  tail + period) and wrong about its value; `1.34` was the right number for the
  wrong reason and `1.25` the wrong number for the right one.
- **"The picture has forbidden 2-row blocks beyond what the rule forces."** Died on
  the first honest denominator: 32 of 64 blocks at `w = 3` are missing and the rule
  permits exactly 32, because the bottom-right cell of a 2×3 window is a function
  of the top three. Equal at `w = 1..7`.
- **"`rowNat t mod m` or the row popcount parity is eventually periodic."** Died
  once the periodicity tester required evidence: the first version reported
  "period 2001, onset 2000" for all ten moduli and for popcount parity, on a
  sequence of length 4,001, where that combination compares nothing at all.
- **"A363346, as held in `sources/`, is the left-diagonal transient in our sense."**
  `docs/sources.md` offers the b-file as "an independent computation to compare the
  engine against". It is not comparable, and now with a reason rather than a
  shrug: `A363346(3) = 1` while `o_k = 0` for every `k ≤ 17`, and `o_k > 0` for
  every `k ≥ 20` up to 200,000, so **no increasing reindexing `n ↦ k(n)` can send
  3 to a diagonal with onset 1 and then 4..10 to larger diagonals with onset 0**.
  Eleven candidate reindexings tested in `explorer/sextant7_a363346.mjs`
  (`onset(n±1)`, `⌊n/2⌋ + onset(n)`, `onset(2n)`, `onset(3n)`, …): the best fits 85
  of 100 and every other fits 10 or fewer. My own notebook of 2026-09-07 left this
  as "the indexing could not be settled from the numbers alone"; it can now be
  settled negatively.
- **"The packed-row bit length distinguishes rule 30 from its mirror."** Mine,
  written into C3's first draft and taken out an hour later. Both edges of the cone
  are black, so reversing a row inside `0 .. 2t` leaves its length alone and rule 86
  satisfies the statement verbatim. What distinguishes them in the packed row is the
  low bits — black, black, white — which are the first three left diagonals.
- **"The forced-only walker is a lower bound a proof could use."** Not dead but not
  established: the walker reads the bits at *its own* position, where the
  agreement-front lemmas' hypothesis ("the first difference is here") does not
  hold, so the single ray is a heuristic — the sound version is Alidade's
  reachable set. Measured, it never got ahead of the true front (0 of 26,150 rows)
  and ran at `0.56562`, close to crystal 64's `1 - 0.4531 = 0.5469` from a
  different vocabulary; that is a cross-check, not a proof.

---

## 6. Next topic

**The wedge itself: reads at bit-index speed strictly between `3/4` and `2`, which
is where the residual lives and where this board has never put a node.** Everything
proved about the packed row is at speed `0` (the left diagonals and every
agreement, preperiod and onset lemma) or at speed `2` (the right diagonals, exactly
periodic with no transient); this session measured that the two settled bands are
bits `0..0.75t` and `2t-8..2t`, that the boundary between them is Wolfram's `1/4`
front and therefore priced by crystals A3, and that no read at any of ten
intermediate rational speeds is periodic. What is *not* known, and is cheap to
attack, is whether the interior of the wedge has any structure at all: the
right-diagonal side has exact periodicity with period `2^k` at defect `k`, so a
read at speed `2 - ε` sees periods `2^(εt)` — a **doubly exponential** period, and
the natural question is whether the *complexity* of an intermediate read
interpolates between the two edges or jumps. Concretely, seed the wedge's two
boundary statements first (C3, and the observation that the bounded-period right
band has constant width nine), then ask a theorist for the factor complexity of the
read at speed `3/2` against the read at speed `1`: if the centre column's
complexity is not extremal in the wedge, the extremal speed is a new object and it
is the first thing this vocabulary would have produced that the automaton
coordinates do not already say. If it *is* extremal — which I would bet on — then
the wedge is featureless and the packed row should be declared finished as a source
of P1 leverage, which is worth an obstruction entry of its own and would save the
board the next four sessions.
