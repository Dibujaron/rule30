# Attack: are the right-diagonal minimal periods unbounded?

**Theorist.** Sextant, 2026-09-08.

**Topic.** The recurrence alone cannot decide it: the tower of right diagonals
is determined only up to one free bit per depth, that bit is the centre column
(`R_k 0 = centerColumn k`), and the all-black choice gives a flat tower of
period 2 at every depth, which `rightDiagonal_not_constant` does not exclude.
So any proof must use a property of the actual seed beyond the recurrence.
What is the weakest such property, and is any of it already proved on the
board? Say plainly if the weakest sufficient property is itself equivalent to
a P1 conjecture.

**Verdict in one line.** It is not. The weakest property I could find is the
seed's **cone** — white outside `|x| ≤ t`, black on both edges — every piece of
which is a theorem already on the board, and from it the answer to the topic's
question is *yes, the minimal periods are unbounded*, by an argument short
enough that it is not a route in this document but a checked proof:
`explorer/scratch_rightunbounded_proof.lean` derives both C1 and C2 from four
closed nodes and two new size-S lemmas, accepted by `lake env lean` with axioms
`propext, Classical.choice, Quot.sound`. The property is also sharp: drop the
left half of it and the conclusion is false, witnessed by an actual rule 30
picture whose right-diagonal tower is flat at period 2 forever (C3). The
session's correction to my own C5: that flat tower is not an abstract solution
of the recurrence, it is the picture of `…10101 | 000…`, so the recurrence
*plus the seed's entire right-hand structure* still cannot decide the question
— what decides it is the existence of a leftmost black cell.

Notation. `R_k = rightDiagonal k`, `R_k j = evolve (j + k) j`; `P_k` is the
minimal period of `R_k`; `I = initialConfig`. Throughout,

```
m p  :=  the least d ≥ 1 with evolve p ((p : ℤ) - d) = true
```

— the distance from the right edge of row `p` to the next black cell going
left. It is Rowland's `Δ_I(p)`; see the novelty paragraph of C1.

---

## 1. The residual, in one paragraph

Time runs down the picture and the right diagonals are counted in from the
right edge, diagonal `k` being the cells `(j + k, j)` read downward. They are
the well-behaved half of the picture: every one of them repeats from its very
first cell, with a period that divides `2^k`, and there are no transients
anywhere. The question is whether those periods grow without bound, and it is
not answerable by the recurrence, because the recurrence
`R_k (j+1) = R_k j ^^ (R_{k-1} (j+1) || R_{k-2} (j+2))` integrates a driver and
so fixes each diagonal only up to one constant, `R_k 0`, which is the centre
column at time `k`. Choose those constants all black and every diagonal
alternates forever. So the residual is not a statement about the tower at all:
it is the statement that **the seed's own centre column is not the constant
sequence that flattens the tower**, and more precisely that no `p > 0` is a
period of every diagonal at index `0` — which, written out, says
`evolve (t + p) p = evolve t 0` fails for some `t`. In the picture that
hypothesis reads: *column `p`, started at row `p`, is the centre column started
at row `0`* — the centre column reappearing undelayed along a diagonal, `p`
columns to the right. The residual lives where the diagonals meet the centre
column, which is exactly where the first entry of `docs/obstructions.md` says
diagonal arguments never reach. The way through is to stop asking the
diagonals about the centre column and ask the *whole picture* about itself: a
common period `p` of all the right diagonals is exactly the invariance of the
picture's right half, `x ≥ 0`, under the translation `(t, x) ↦ (t + p, x + p)`;
the sideways solve carries that invariance leftward across the whole picture;
and a picture with a left edge that moves left cannot be invariant under a
translation that moves it right. The proof below does the middle step with one
closed theorem rather than by hand, but that is the shape of it.

## 2. Why the known routes fail

The eight entries of `docs/obstructions.md` are mostly about the left side.
Three bear on this topic, and I add a ninth.

- **The diagonal structure never reaches the centre column** (entry 1). It
  names the right diagonals: `rightDiagonal t 0` is the centre cell at time
  `t`, at the *start* of that diagonal. This is the reason the recurrence is
  helpless here — index 0 is not hidden inside a transient as on the left, it
  is the constant of integration the recurrence never supplies. The route out
  is not to defeat this entry but to accept it: my argument makes no attempt
  to compute anything about the centre column, it only says that a certain
  identity *between* the centre column and column `p` is impossible.
- **A universal argument over periodic words cannot give the right diagonals'
  minimality** (entry 8, mine, this morning). Any statement quantified over
  pairs of periodic words is false at a measurable rate — `29 %` of pairs at
  `L = 4`, decaying like `2^(-0.37 L)`. That entry closes the route "prove it
  for the abstract tower", which is the route the topic's framing already
  forbids, and C3 below strengthens it: the abstract counterexample is
  realised by a genuine rule 30 picture.
- **A universal bound on the recurrence's hitting times cannot prove the
  period wall** (entry 7). The left-side analogue, and the reason I did not
  look for a counting argument here.
- **Routes I tried or considered and did not pursue.**
  *(i) The backward pair walk*, which is how `leftDiagonal_period_unbounded`
  is proved on the board: it needs the pair map to have in-degree one, and on
  the right `(R_{k-2}, R_{k-1}) ↦ R_k` recovers `R_{k-2}` only where `R_{k-1}`
  is white, so the in-degree is `2^(weight)`. Dead, and recorded last session.
  *(ii) Jen's theorem.* If all diagonals had period `p` then column `p` is the
  centre column delayed, so if the centre column were eventually periodic so
  would column `p` be, contradicting `not_isEventuallyPeriodic_pair`. This
  proves nothing, because nobody knows the centre column is eventually
  periodic — it assumes P1's hypothesis. It is worth writing down only because
  it is the first thing anyone tries and it is exactly the wrong shape: it
  makes the right-diagonal question look like a P1 question when it is not.
  *(iii) Kopra's Lemma 4.3* (`kopra-2022-natural-class.txt`, line 446): if `F`
  is left expansive and `frac(F^t x) = frac(x)` for some `t > 0`, then `x` is
  eventually periodic, where `frac_c(x)` is the configuration read rightward
  from position `c` and `frac = frac_0`. It is the nearest published statement
  of the shape "the right half repeats, therefore something", and it does not
  reach this topic. His hypothesis compares two rows at *one* position over
  *all* offsets; the hypothesis here compares two rows at *all* positions with
  a shift, `frac_p (F^(t+p) x) = frac_0 (F^t x)`, which for `x = I` is a
  statement about every `t` at once. The single instance of his shape that
  ours contains — `frac_p (F^p I) = frac (I)`, the `t = 0` case — holds for the
  seed with no hypothesis at all, both sides being `1000…`, so feeding it to
  his lemma through `σ^(-p) ∘ F^p` concludes that the seed is eventually
  periodic, which is true and empty. His Theorem 4.5 (crystal 37), that
  `frac(F^t x) = frac(x)` for only finitely many `t`, is the same gap from the
  other side.
- **New, appended to `docs/obstructions.md` as "The flat right-diagonal tower
  is a real picture, so no argument from the right half alone can work".**
  Last session's C5 said the recurrence does not determine the tower. The
  sharper fact, measured this session: the flat tower is the picture of the
  configuration `… 1 0 1 0 1 | 0 0 0 …`, which is white at every `x ≥ 1` and
  black at `0` exactly as the seed is. So it is not only the recurrence that
  fails to decide the question — the recurrence *together with the whole of
  the seed's right-hand side, its right edge, and its initial row from the
  origin rightward* fails to decide it. Any proof must reach into the left
  tail. Details and the falsification in C3.

## 3. Candidate claims

### C1. The centre column is never a delayed copy of another column, and the first failure is at Rowland's `Δ`

**The claim.** Fix `p ≥ 1` and let `m = m p` be the distance from the right
edge of row `p` to the next black cell (defined above; it exists, because row
`p` is black at position `-p` by `evolve_left_edge`, so `m ≤ 2p`). Then

> **(a)** `evolve (t + p) p = evolve t 0` for every `t < m`, and
> **(b)** `evolve (m + p) p ≠ evolve m 0`.

Equivalently, in the vocabulary of the board: `rightDiagonal t p = rightDiagonal t 0`
for `t < m`, and `rightDiagonal m p ≠ rightDiagonal m 0`, so

```lean
¬ PeriodicFrom (rightDiagonal m) p 0
```

and in particular no `p > 0` is a period of every right diagonal. A statable
form, with `m` supplied as a hypothesis so that no `Nat.find` is needed:

```lean
theorem rightDiagonal_not_periodic_at_agreement (p m : ℕ) (hm : 0 < m)
    (hwhite : ∀ d : ℕ, 0 < d → d < m → evolve p ((p : ℤ) - (d : ℤ)) = false)
    (hblack : evolve p ((p : ℤ) - (m : ℤ)) = true) :
    (∀ t, t < m → evolve (t + p) (p : ℤ) = evolve t 0)
      ∧ evolve (m + p) (p : ℤ) ≠ evolve m 0
```

That is the signature the scratch file below actually proves, under the name
`rightDiagonal_first_failure`; note that `0 < p` is not needed for it, only
for the existence of `m`. Restated through `rightDiagonal` it is
`rightDiagonal t p = rightDiagonal t 0` for `t < m` and
`rightDiagonal m p ≠ rightDiagonal m 0`, since `rightDiagonal k j = evolve (j + k) j`.

**What it would give.** C2's unboundedness immediately, and with it the
topic's question answered. It also gives the *exact* first failure, not merely
a failure, which is what makes the corollary quantitative rather than
existential.

**Falsification.** `explorer/sextant_rightunbounded.mjs`, test A. The picture
is grown in coordinates where bit `d` of row `t` is the cell `(t, t - d)`, so
right diagonal `k` is bit `k` read down the rows;
`τ(p) := ` the least `t` with `evolve (t+p) p ≠ evolve t 0`. *Survives, and
survives in its exact form.* For every `p` from `1` to `2^20 = 1,048,576`:
`τ(p)` exists, `τ(p) = m(p)` — at **1,048,576 of 1,048,576 values, with no
exceptions** — and the diagonal `m(p)` that the claim names is indeed the one
that fails (`0` predicted failures that did not happen). The largest `τ` in
that range is `51`, at `p = 2^20`. For the powers of two,
`τ(2^a) = m(2^a) = 3, 4, 6, 7, 9, 15, 16, 24, 25, 27, 29, 34, 36, 37, 39, 41, 43, 48, 49, 51`
for `a = 1..20`.

`explorer/sextant_ru_deep.mjs` repeats it an order of magnitude further, with
a narrower window (128 depths) and no stored diagonals: `p = 1` to
`2^24 = 16,777,216`, **`τ(p) = m(p)` at every one, 0 mismatches, and no `p`
reached the 128-depth cap** — which the run asserts rather than assumes, so a
`τ` that had run away would have been reported and not silently dropped. The
largest `τ` in that range is `60`, at `p = 2^24`. That run also prints
`m(2^a)` for `a = 0..24` against the 41 values of `a(n)` Rowland prints at
line 128 of his paper: **all 25 terms agree**, including the four
(`54, 55, 58, 60`) beyond the reach of the shallower run.

Kernel: `explorer/scratch_rightunbounded.lean`, accepted by `lake env lean`,
axioms `[propext]` alone. It checks (i) that `m` is what it is claimed to be
— row `p` white at `p - d` for `1 ≤ d < m` and black at `p - m` — and (ii) and
(iii), the two halves of the claim, for thirteen values of `p` including every
power of two to `256`, reading rows to `280` through `rowCell`, which
`rowCell_eq_evolve` ties to `evolve`.

*What else could have produced this.* Three things, and each cost me
something. **First**, a coordinate convention wrong on both sides of a
comparison reports zero disagreements, which is how a mirror-image row model
once passed four checks at depth 5000 on this project. Test D rebuilds the
first 400 rows with a per-cell engine driven by the *rule number* 30 through
its lookup table, with no depth coordinates anywhere, and recomputes both
`τ(p)` and `m(p)` from that: `0` cell disagreements, `0` `τ` disagreements.
(It also reported one `m` disagreement, which was a bug in the control, not in
the claim: I had capped its search at `d ≤ p`, and `m(2) = 3 > 2`, because the
second-rightmost black cell of row 2 sits at position `-1`, left of the
origin. The claim does not care where the cell is; the capped search did.)
**Second**, `τ = m` could be an artifact of measuring both with the same
window: it is not, `m` is read off row `p` alone and `τ` is a comparison of
two different rows at a common depth, and the per-cell control computes both
independently. **Third**, and this is the one that matters: `τ = m` at a
million values of `p` is not why I believe the claim — the proof below is, and
it *predicts the equality* rather than being fitted to it, because
`rightmost_difference_moves_right` delivers both halves at once and would have
been contradicted by any `p` with `τ(p) ≠ m(p)`. That is the difference
between this claim and every survivor in my previous documents, all of which
were measurements looking for a mechanism.

**Novelty.** Partly Rowland's, and I have to be careful about which part.
`m(p)` is exactly his `Δ_I(p)`: the number of cells at the right end of row `p`
that agree with the initial condition (`rowland-2006-local-nested-structure.txt`,
lines 355–362 for the definition, 403–411 in rule 86's coordinates). My
measured `m(1..16) = 1,3,1,4,1,3,1,6,1,3,1,4,1,3,1,7` is his printed sequence
at lines 112–115 to the digit, including the `15` at `t = 64`; my
`m(2^a), a = 1..20` is his `a(n)` at lines 128–130, twenty terms, to the digit.
And at line 131 he writes, of that sequence: *"This sequence characterizes the
period lengths of the diagonals on the right side of rule 30."* So the
connection between `Δ_I` and the right-diagonal periods is **his observation**,
stated in the introduction. What is not in the paper is any precise form of it
or any proof: §3, which the sentence points to, discusses `Δ_R` for other
initial rows and never returns to the diagonals; his Lemma 2 gives only that
the period *divides* `2^k`, an upper bound; and the strictly-increasing
statement he does prove (lines 364–366, "an argument similar to that of
Lemma 2") is about `Δ_I(2^n)`, not about periods. So C1 is the half of
Rowland's sentence that yields unboundedness, made precise and given a proof.
I would mark it **"a proof of a published observation"**, not new. Searched:
both Rowland extractions for `Theorem 1`, `Lemma 2`, `period of`, `unbounded`,
`strictly increasing`, `minimal period`, `nonperiodic`; `kopra-2022` for
`Theorem 4.5`, `finitely many`, `limit point`, and Lemmas 4.2–4.4 read in
full; all of `sources/` for `translat`, `self-similar`, `travelling`,
`glider`, `periodic point`.

**Route — and more than a route.** The argument is short enough that I wrote
it out and the kernel took it: `explorer/scratch_rightunbounded_proof.lean`
proves the claim above as `rightDiagonal_first_failure`, in the exact
`hwhite`/`hblack` form printed above, accepted by `lake env lean` with axioms
`propext, Classical.choice, Quot.sound`. It is not a node — a theorist writes
none, and this has not been through a captain or the seed check — but it is no
longer a sketch either. Write `B := fun x => evolve p (x + p)`, the row at
time `p` slid left by `p`.

1. `B` agrees with `I` at every `x > -m`. At `x ≥ 1`: `B x = evolve p (x + p)`
   is white by `evolve_eq_false_of_outside_cone`, and `I x = false`. At
   `x = 0`: `B 0 = evolve p p = true` by `evolve_right_edge`, and
   `I 0 = true`. At `x = -d` with `1 ≤ d < m`: both are white, by `hwhite`.
2. `B` differs from `I` at `-m`: `B (-m) = evolve p (p - m) = true` by
   `hblack`, and `I (-m) = false` since `m > 0`.
3. `rightmost_difference_moves_right` (on the board, proved) with `c = B`,
   `d = I`, `i = -m` gives, at every `t`: the pictures differ at `-m + t`, and
   agree everywhere right of `-m + t`. At `t = m` the difference is at the
   origin, which is (b); at `t < m` the origin is strictly right of `-m + t`,
   which is (a).
4. `evolveFrom B t 0 = evolve (t + p) p`, the only piece not on the board. It
   is three small lemmas, all in the scratch file:
   `rule30_translate` (`rule30` commutes with a spatial translation —
   `rule30_eq` twice and two `ring`s), which lifts to `evolveFrom_translate`
   by induction on `t`; and `evolveFrom_evolve`, that
   `evolveFrom (evolve p) t = evolve (t + p)`, which is
   `Function.iterate_add_apply` on the definition `evolve t = rule30^[t] I`.

Steps 1–3 are the entire mathematical content, and every ingredient is a
closed node. The seed enters at exactly two places: `evolve_eq_false_of_outside_cone`
and `evolve_right_edge` in step 1 (the right half of the cone) and, through
the existence of `m`, `evolve_left_edge` (the left half). That is the answer
to the topic's question, and C3 says it is sharp.

### C2. The right-diagonal minimal periods are unbounded

**The claim.** For every `p > 0` some right diagonal is not `p`-periodic:

```lean
theorem rightDiagonal_period_unbounded (p : ℕ) (hp : 0 < p) :
    ∃ k, ¬ PeriodicFrom (rightDiagonal k) p 0
```

and quantitatively, `P_{m(2^a)} > 2^a` for every `a`. This is the exact
right-side counterpart of the board's proved `leftDiagonal_period_unbounded`,
which the right side has been missing.

**What it would give.** The topic's question, answered affirmatively and
unconditionally. Note the statement above needs no `minimalPeriod` definition
— the board still has none for `ℕ → Bool` — and that is why I would seed it in
this form. The minimal-period reading follows from two elementary facts not
yet on the board: for a sequence periodic from `0`, the periods are closed
under subtraction, so the minimal period divides every period; hence `P_k`
divides `2^k` by `rightDiagonal_periodicFrom_pow`, is a power of two, and
`¬ PeriodicFrom (rightDiagonal m) (2^a) 0` gives `P_m > 2^a` outright.

**Falsification.** `explorer/sextant_rightunbounded.mjs`, test B: the minimal
periods read off the picture for `k ≤ 40` over `2^20` terms per lag, giving
`P_k = 1,2,2,4,8,8,16,32,32,64,64,64,64,64,64,128,256,…` with doubling depths
`1, 3, 4, 6, 7, 9, 15, 16, 24, 25, 27, 29, 34, 36, 37, 39`; then the corollary
`P_{m(2^a)} > 2^a` checked at every `a` for which `P` was measured, `a = 1..15`.
*Survives*: 15 of 15, with no near misses — at each one `P_{m(2^a)}` is exactly
`2^(a+1)`, twice the bound. Last session's independent scans
(`explorer/sextant_rightperiods.mjs` and `explorer/sextant_rightdeep.mjs`, two
implementations, 128 depths, deepest pass `1,073,741,952` rows) put the
doubling depths at `1,3,4,6,7,9,15,16,24,25,27,29,34,36,37,39,41,43,48,49,51,54`,
which is Rowland's printed `a(0..21)` to the digit and agrees with this
session's list on its overlap. Kernel: `period_fifteen` in
`explorer/scratch_rightunbounded.lean` verifies the tightest instance —
`rightDiagonal 15` is `128`-periodic over two full periods and *not*
`64`-periodic — so `P_{m(64)} = 128 > 64` is a kernel fact, axioms `[propext]`.

*What else could have produced this.* The doubling depths and `m(2^a)` are two
measurements of the same list, so their agreement is only as good as their
independence: one is a period test over `2^20` terms of a diagonal, the other
is a read of the leftmost part of one row. They are independent, and a third
source — Rowland's own computation, "obtained directly by computing the
rightmost 121 nonwhite diagonals of rule 30 up to row 240" (line 136) — agrees
with both on 22 terms. What the agreement does *not* establish is the converse
half of Rowland's sentence: C1 gives `P_{a(n)} > 2^n`, a lower bound at the
depths `a(n)`, and says nothing about `P_k` for `k` between them. The observed
equality (the period doubles at `a(n)` and nowhere else) is still open, and I
would not seed it.

A rate is *not* available from C1 alone. Getting `P_k ≥ 2^(ck)` needs an upper
bound on `a(n)`, and Rowland proves only that `a` is strictly increasing, which
gives `a(n) ≥ n + 1` — the wrong direction. Measured, `a(n) ≈ 2.4 n`, matching
the `P_k ≈ 2^(0.41 k)` I measured last session; both are measurements.

**Novelty.** As C1: the fact is Rowland's introductory sentence, the proof is
not in his paper, and nothing in the held sources states the right-diagonal
periods are unbounded. Terms searched as in C1.

**Route — also checked.** `rightDiagonal_period_unbounded` in
`explorer/scratch_rightunbounded_proof.lean`, in exactly the form printed
above, same axioms. The existence of `m` is `exists_agreement_length` there:
`Nat.find` over the black cells of row `p` left of the right edge, with
`d = 2p` as the witness by `evolve_left_edge`, which is where and only where
the left half of the cone is used. Compare the shape of the board's
`leftDiagonal_period_unbounded (a : ℕ) : ∃ k, ∀ N, ¬PeriodicFrom (leftDiagonal k) (2^a) N`:
the right-side statement needs no `∀ N`, because the right diagonals have no
transients, and it is stated for every `p` rather than for powers of two only.
That last is free rather than strong, and a captain should read it that way:
for odd `p` the statement is already true of `rightDiagonal 1`, which
alternates, and all the content sits at `p = 2^a`, where it says `P_{m} > 2^a`.
What the uniform `p` buys is that the proof never has to know `p` is a power
of two — the geometry does not care.

### C3. The property is the cone, and it is sharp: the flat tower is a real picture

**The claim.** Two halves.

*(a) What is used.* The argument of C1 uses only that the seed's picture has a
cone: white outside `|x| ≤ t`, black at the right edge, black at the left
edge. Every piece is a proved node (`evolve_eq_false_of_outside_cone`,
`evolve_right_edge`, `evolve_left_edge`). It is not a P1 conjecture, it is not
near one, and it needs nothing about the centre column. The argument also
generalises, though not verbatim — the two cone facts it uses are stated on
the board for the single seed only, and the general case needs their `Config`
forms, which is the whole of the extra work. Measured, for **any**
configuration `X` white at every `x ≥ 1` with
`X 0 = true` and a leftmost black cell, `τ(p) = Δ_X(p)`, where `Δ_X(p)` is the
first place the row at time `p`, slid left by `p`, disagrees with row `0` —
Rowland's own agreement functional. The single seed is the case where `X` is
white at every `x ≤ -1`, so `Δ_I` is just "the first black cell".

*(b) That it is sharp.* Drop the leftmost black cell and the conclusion is
false. The configuration `… 1 0 1 0 1 | 0 0 0 …` — `X x = [x even]` for
`x ≤ 0`, white for `x ≥ 1` — has the seed's entire right-hand structure and its
right-diagonal tower is `R_0 = 1^∞`, `R_k = (10)^∞` for every `k ≥ 1`: period
`2` at every depth, forever. This is last session's C5 flat tower, and the
correction is that it is not an abstract solution of the recurrence but an
actual rule 30 picture, a travelling wave satisfying
`cell (t + p, x + p) = cell (t, x)` identically for every even `p`.

**What it would give.** The topic's question answered as asked: the weakest
sufficient property is the cone; it is proved; it is not equivalent to a P1
conjecture; and it cannot be weakened to anything that ignores the left tail.
It also upgrades entry 2 of `docs/obstructions.md` in a pleasing way — the
configuration that killed the *sequence-level* residual of P1 there is the same
one that kills the *recurrence-level* right-diagonal statement here.

**Falsification.** Two scripts. `explorer/sextant_ru_general.mjs`: the
right-diagonal minimal periods of five configurations all white on `x ≥ 1`
(single seed; alternating tail; all-black tail; period-3 tail; a block), and
`τ(p)` and `Δ(p)` for each. *Survives.* The alternating tail has `P_k = 2` for
every `k ≥ 1` to depth 24, and for **32 of the 64 values `p ≤ 64` — every even
one — there is no failing `t` in 4,000 rows**, exactly where `Δ(p) = ∞`; the
other four configurations behave like the seed. Test 3 of the same script is
the general claim: 200 random finite configurations, `p = 1..120`, **24,000
pairs, `τ(p) = Δ(p)` at every one, 0 mismatches**.
`explorer/sextant_ru_flat.mjs` pins the witness: `R_0 = 1^∞` over 1,500 terms
(0 failures), `R_k = (10)^∞` for `1 ≤ k ≤ 200` over 1,000 terms each (0
failures), and the travelling-wave identity `cell(t+p, x+p) = cell(t, x)` over
about 250,000 sampled cells for each of `p = 2, 4, 6, 16, 64, 512` (0 failures
at every one), while `p = 1` fails at 2,998 of 2,999 rows, as it does for the
seed.

*What else could have produced this.* The general claim `τ = Δ` is the place I
was wrong today, and the engine caught it: my first version of test 3 defined
`m(p)` as "the first black cell of row `p`" rather than "the first disagreement
with row `0`", which is the same thing only when the configuration is white
left of the origin. It reported `τ ≠ m` at 17,522 of 24,000 pairs. Both the
number and the mismatch were real; the definition was mine and wrong. With the
agreement functional in place the mismatch count is 0. I record this because a
count of 17,522 failures is exactly the kind of true value that gets read as a
dead claim, and the claim was not dead — the definition was. The flat-tower
identification has its own risk: a configuration built to have period-2
diagonals would prove nothing, so the witness is *not* built from the tower,
it is the `(01)^ℤ` fixed point meeting white, chosen from entry 2 of the
obstructions for an unrelated reason, and its tower is read out of its picture
afterwards.

**Novelty.** The generalisation `τ_X = Δ_X` is Rowland's functional in a role
he does not give it — his §3 studies `Δ_R(t)` as a sequence in `t` for various
`R` (lines 413–455) and observes that it "includes several terms from the
sequence `a(n)`", which my five configurations reproduce (all four with a
leftmost black cell have `Δ(1..16)` equal to the seed's). The identification
of the flat tower with `…10101|000` is not in any source; Wolfram 1986's fixed
points (Table 6.2, crystal 22) name `(01)^ℤ` but say nothing about diagonals.
Searched: `sources/` for `travelling`, `traveling`, `glider`, `self-similar`,
`translat`, `periodic point`, `F^p`; `rowland-2006-*` §3 read in full.

**Route.** For (a), the general form of C1: the same four steps, with `hblack`
and `hwhite` restated against `X` instead of against white, and the existence
of `Δ_X` from the leftmost black cell moving left at speed 1. Size M, and it
needs a `Config`-level statement of the cone that the board does not have
(`evolve_eq_false_of_outside_cone` is about the single seed). For (b), no
route is needed: it is a counterexample, and its value is that it forbids a
class of proofs.

### C4. Unboundedness on the right is strictly weaker than P1, in both directions

**The claim.** The topic asks whether the weakest sufficient property is
equivalent to a P1 conjecture. It is not, and the separation runs both ways.
*Downward*: C1's hypotheses are the cone, all three pieces proved, so
unboundedness does not need any aperiodicity input. *Upward*: unboundedness
carries no information back — an eventually periodic centre column does not
flatten the tower, so no amount of period growth on the right is evidence for
P1.

**What it would give.** It closes the topic's question honestly, and it tells a
captain not to file this region under P1. The right-diagonal tower is a
*self-contained* object: the cone determines that it grows, and the exact
depths at which it grows are Rowland's `a(n)`, a sequence with no known formula
but nothing conjectural about its existence.

**Falsification.** The upward half is last session's test C in
`explorer/sextant_rightdriver.mjs`, and it *died as a claim there*, which is
what makes it usable here: the abstract tower run with the *periodic* constant
sequence `c(k) = k mod 2` doubles 22 times, up to `2^22`, exactly as the seed's
does. So a periodic centre column is compatible with an unbounded tower, and
the implication "unbounded tower ⟹ aperiodic centre column" is false. The
downward half is C1's proof, whose hypotheses are three named theorems.

*What else could have produced this.* The upward half rests on an *abstract*
tower — constants chosen freely — and one could object that no real picture has
a periodic centre column, so the witness is not a picture. True, and it does
not matter: the objection would have to be that the implication holds for
*pictures*, which is P1 itself, and the point of the claim is precisely that
nothing short of P1 gets you there.

**Novelty.** Nothing in print connects the right diagonals to P1 in either
direction; Rowland's paper is about nested structure and does not mention
aperiodicity of the centre column, and Kopra's problem 4.8 is about traces.

**Route.** No route: it is a statement about what does and does not imply what,
half of it a corollary of C1 and half a counterexample.

## 4. What survived

All four candidates survived, and the topic's question has an answer: **yes,
the right-diagonal minimal periods are unbounded, and the property that forces
it is the seed's cone, every piece of which is already a theorem on this
board.** The honest answer to the question the topic told me to be plain about
is therefore *no* — the weakest sufficient property is not equivalent to a P1
conjecture, and it is not even close: it is `evolve_left_edge`,
`evolve_right_edge` and `evolve_eq_false_of_outside_cone`, all closed, plus
`rightmost_difference_moves_right`, also closed. I would seed **C1** first, in
the `rightDiagonal_not_periodic_at_agreement` form with `m` supplied as a
hypothesis, because it is the whole content; under it go the two missing
pieces (that `rule30` commutes with a spatial translation, and that
`evolveFrom (evolve p) t = evolve (t + p)`), which are size-S nodes the board
should have anyway and which a P1 attack through the half-lines will want
sooner or later. **C2** goes directly above C1, in the
`∃ k, ¬ PeriodicFrom (rightDiagonal k) p 0` form that needs no
`minimalPeriod`; it is the right-side twin of the proved
`leftDiagonal_period_unbounded`, and it is worth having for the symmetry alone.
**C3(b)** belongs in the crystals as a warning with a witness, replacing last
session's C5, which was the same warning without one. **C4** is the note that
keeps this region out of P1's file.

C1 and C2 are not sketches: `explorer/scratch_rightunbounded_proof.lean`
compiles, and `#print axioms` on both gives
`propext, Classical.choice, Quot.sound` and nothing else. It imports
`Rule30.Basic` and four closed proof files (and, as a scratch file must, never
`Rule30.Statements`), and proves six things: the three small lemmas
`rule30_translate`, `evolveFrom_translate`, `evolveFrom_evolve`, then
`rightDiagonal_first_failure`, `exists_agreement_length` and
`rightDiagonal_period_unbounded`. A captain should read it as a *proposal with
its proof attached*, not as a node — nothing here has been through the seed
check, and a theorist writes no nodes.

Two things I want weighed honestly against the above. First, the *fact* in C1
and C2 is Rowland's sentence at line 131 of his paper; what is new is a proof,
a precise statement, and the observation that the proof needs nothing but the
cone. A node whose novelty is "we proved the sentence in someone's
introduction" is still worth landing, but it should be landed under that
description. Second, the argument is short enough that its shortness is itself
the thing to be suspicious of — a statement Rowland left as an aside and nobody
has written down should not fall to four lines of the board's existing
theorems. Three checks stand against that suspicion, and they fail in
different ways if the argument is wrong: the engine, which says `τ(p) = m(p)`
at every one of `2^20` values *and would have said otherwise* if the geometry
were off by one; the kernel on the statement itself, which does not care
whether my reasoning about it was sound; and the sharpness test, which
produces a real picture where the same argument must fail and identifies which
step does. What remains genuinely open in this region is not C1 or C2 but the
converse of Rowland's sentence, which section 6 is about.

## 5. Claims that died

- **"`evolve (t+p) p = evolve t 0` ⟺ `t < m(p)`."** My first, greedier form of
  C1: not just that the *first* failure is at `m`, but that every `t ≥ m` fails.
  Dies at `p = 1, t = 4`, where `m = 1` and the two are equal again
  (`explorer/sextant_ru_diag.mjs`: 58,724 mismatches of 118,625 `(p, t)` pairs
  with `p ≤ 250`). The columns re-agree constantly after the first failure, as
  two unrelated sequences would. Only the "first failure" form is true, and it
  is the only form the proof delivers — which I should have noticed before
  measuring, since `rightmost_difference_moves_right` says nothing whatever
  about what happens after the difference has passed the origin.
- **"For a general configuration, `τ(p)` is the first black cell of row `p`
  read from the right edge."** Dies at 17,522 of 24,000 `(configuration, p)`
  pairs over 200 random finite configurations
  (`explorer/sextant_ru_general.mjs`, test 3, before the fix); first witness
  `p = 4` on the configuration with left word `00010011111000010010010001`,
  where `τ = 4` and the first black cell is at `6`. The correct object is the
  first *disagreement* with row 0, Rowland's `Δ_X`, which then matches at all
  24,000.
- **"The seed's right-diagonal periods can be got at through the recurrence
  with a little more input from the right half."** Dies on the flat tower's
  realisation: `…10101|000` shares with the seed its initial row at every
  `x ≥ 0`, its right edge, and the recurrence, and its tower is flat forever
  (`explorer/sextant_ru_flat.mjs`). Depth: 200 diagonals, 1,000 terms each,
  plus the travelling-wave identity over ~250,000 cells at six values of `p`.
- **"`m(p) ≤ p`."** A convenience I assumed while writing the coordinate
  control. Dies at `p = 2`, where `m = 3`: the second-rightmost black cell of
  row 2 is at position `-1`. The true bound is `m(p) ≤ 2p`, from
  `evolve_left_edge`, and the argument needs no bound at all.
- **"Jen's theorem gives unboundedness."** Not tested, and it should not be:
  it assumes the centre column is eventually periodic, which is P1's
  hypothesis. Recorded in section 2 so the next theorist does not spend an
  hour on it as I nearly did.

## 6. Next topic

Attack **the converse half of Rowland's sentence: is `a(n)` the *complete*
list of doubling depths?** C1 proves the lower bound — the period of right
diagonal `a(n)` exceeds `2^n` — and the measurements say the period is exactly
`2^(n+1)` there and constant between consecutive `a(n)`, which is the statement
"`P_k = 2^(#{n : a(n) ≤ k})`", i.e. Rowland's "characterizes" read as an
equality. The missing half is an upper bound: *why does the period not double
at any depth other than `a(n)`?* That is exactly the plateau question my last
document left open (its C4 closed every depth following a doubling, leaving
the 19 plateau interiors below `k = 65`), and C1 now supplies what that
document lacked — a reason, rooted in the picture rather than in the
recurrence, for the doublings to sit where they do. The two attacks should be
run together: with `τ(p) = m(p)` in hand, "the period does not double at `k`"
becomes a statement about rows `p` with `m(p) < k`, which is a statement about
Rowland's `Δ`, an object with a proved theory (his Theorem 1 and the
strictly-increasing argument at lines 364–366) rather than an object nothing is
known about. If a captain wants one node instead of a topic: define
`minimalPeriod` for `ℕ → Bool`, which three documents have now had to work
around, and which every statement in this region wants.
