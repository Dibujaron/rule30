/-
# Seed statements

Captain-authored lemmas for the dispatcher to hand out. Every theorem here is
`sorry` on purpose: this file states, `Rule30/Proofs/` proves. A worker never
imports this file; the harness checks a worker's proof against the statement
here with a `type_of%` check theorem, so the two never share a name.

Regions: `P1` is the geometry of the light cone and its edges, where
periodicity provably holds; `P2` is the density bookkeeping behind the
balance conjecture. P3 gets nothing here on purpose (see `Rule30/Prize.lean`).
-/
import Rule30.Basic
import Rule30.Prize
import Rule30.Strip

namespace Statements

/-! ## P1 — the geometry of the cone -/

/-- **Outside the light cone, nothing happens.** After `t` steps every cell
farther than `t` from the origin is still white, because information moves at
most one cell per step and everything started white except the origin.

Induction on `t`; the step case unfolds `evolve_succ` and `rule30_eq` and
uses that all three neighbours were outside the cone one step earlier. -/
theorem evolve_eq_false_of_outside_cone (t : ℕ) (i : ℤ) (h : (t : ℤ) < |i|) :
    evolve t i = false := by
  sorry

/-- **The left edge is always black.** The leftmost cell that can be
non-white after `t` steps is at `-t`, and it is black at every `t`: its left
neighbour and itself were white a step earlier and its right neighbour was
the previous edge, so `xor false (false || true) = true`. -/
theorem evolve_left_edge (t : ℕ) : evolve t (-(t : ℤ)) = true := by
  sorry

/-- **The right edge is always black.** Symmetric in position but not in
argument: at `t`, the previous edge is the *left* neighbour, so the new cell
is `xor true (false || false) = true`. -/
theorem evolve_right_edge (t : ℕ) : evolve t (t : ℤ) = true := by
  sorry

/-- **The second diagonal from the left is all black.** The cell one to the
right of the left edge, at `-t` after `t+1` steps. Its left neighbour was
outside the cone, its own previous value was the left edge (black), so
`xor false (true || _) = true`. -/
theorem evolve_left_second_diagonal (t : ℕ) : evolve (t + 1) (-(t : ℤ)) = true := by
  sorry

/-- **The third diagonal from the left is all white.** The cell two to the
right of the left edge, at `-t` after `t+2` steps: its left neighbour was the
edge (black) and its own previous value was the second diagonal (black), so
`xor true (true || _) = false`. Together with the previous two lemmas this
is the first honest evidence that periodicity lives at the edges of rule 30
and is only conjectured to fail at the centre. -/
theorem evolve_left_third_diagonal (t : ℕ) : evolve (t + 2) (-(t : ℤ)) = false := by
  sorry

/-! ### The diagonal family, chosen by measurement

Write `d k j` for the cell `j` steps along the `k`-th diagonal in from the
left edge — that is, `evolve (j + k) (-j)`. The four lemmas above are `d 0`,
`d 1` and `d 2`, each written out by hand. `explorer/diagonalscan.mjs`
measures the rest of the family, and says the regularity does not stop: over
16000 generations every left diagonal to `k = 63` is periodic with period 1,
2, 4 or 8, and from `k = 18` that period only begins after a short prefix.
The right-hand diagonals are periodic too, but their periods double away —
256 already at `k = 16`, and unchanged when the prefix is made four times
longer — which is the first quantitative handle on rule 30's asymmetry.

That is finite evidence, and finite evidence about an infinite object can
only ever *choose what to state*. It is the proofs below it that would make
any of it true. -/

/-- **The left diagonals satisfy a closed recurrence.** One step of the rule
rewritten in diagonal coordinates: the cell one further along diagonal
`m + 2` is determined by the diagonal two shallower, the diagonal one
shallower, and its own previous term — and by nothing deeper in the cone.

That triangular dependency is the whole reason the left side can be settled
one `k` at a time, and this lemma is the dictionary every later diagonal
proof should cite instead of re-deriving the coordinate shift. Checked
against the engine at every depth to `k = 11` with no mismatches; the proof
is one unfold of `evolve_succ` and `rule30_eq`. -/
theorem evolve_left_diagonal_recurrence (m i : ℕ) :
    evolve (i + m + 3) (-((i : ℤ) + 1))
      = xor (evolve (i + m + 2) (-((i : ℤ) + 2)))
          (evolve (i + m + 2) (-((i : ℤ) + 1)) || evolve (i + m + 2) (-(i : ℤ))) := by
  sorry

/-- **The fourth diagonal from the left alternates.** The first diagonal that
is not constant: black, white, black, white, with no prefix before the
pattern starts. `decide (t % 2 = 0)` is the `Bool` saying whether `t` is
even — the proposition `t % 2 = 0` and the `Bool` that reports it are
different things, and only the `Bool` can be the value of a cell.

This is where the P1 idiom that closed `d 0` to `d 2` — unfold once, discharge
each neighbour with a served lemma — stops being enough on its own: the
recurrence feeds this diagonal its own previous term, so the proof needs an
induction on `t` rather than a single step. -/
theorem evolve_left_fourth_diagonal (t : ℕ) :
    evolve (t + 3) (-(t : ℤ)) = decide (t % 2 = 0) := by
  sorry

/-- **The fifth diagonal from the left is all black.** Constant again, one
step past the alternating one, which is why the family cannot be read off
by extrapolating: the periods measured down the left side run 1, 1, 1, 2, 1,
2, 2, 1, 4, 1, … and do not increase monotonically. -/
theorem evolve_left_fifth_diagonal (t : ℕ) : evolve (t + 4) (-(t : ℤ)) = true := by
  sorry

/-- **The second diagonal from the right alternates**, where the second from
the left was constant black. The two edges of the cone are both black
(`evolve_left_edge`, `evolve_right_edge`), and one cell in they already
disagree. This is the smallest true statement that distinguishes the two
sides of rule 30, and it is the reason the left-hand diagonals stay simple
while the right-hand ones do not. -/
theorem evolve_right_second_diagonal (t : ℕ) :
    evolve (t + 1) (t : ℤ) = decide (t % 2 = 0) := by
  sorry

/-- **The fourth left diagonal is eventually periodic**, in exactly the sense
`Rule30/Prize.lean` means it: `IsEventuallyPeriodic` is the same predicate
that Wolfram's first prize question denies of the centre column.

Nothing here bears on that question — a diagonal at the edge of the cone and
the column down its middle are different sequences, and the whole content of
the conjecture is that the middle one behaves unlike this. What it does is
give the predicate its first inhabited instance in this project, so that
`IsEventuallyPeriodic` is a thing we have used rather than only stated.
Immediate from `evolve_left_fourth_diagonal` with `p = 2` and `N = 0`. -/
theorem evolve_left_fourth_diagonal_isEventuallyPeriodic :
    IsEventuallyPeriodic (fun j => evolve (j + 3) (-(j : ℤ))) := by
  sorry

/-! ### The induction that closes the left side

Read `evolve_left_diagonal_recurrence` in the coordinates it is about — write
`d k j` for `evolve (j + k) (-j)`, the cell `j` steps along the `k`-th
diagonal — and it says

```
d (m+2) (i+1) = d m (i+2) XOR (d (m+1) (i+1) OR d (m+2) i)
```

so diagonal `m+2` is **a one-bit machine driven by the two diagonals below
it**: its next value is a fixed function of its own current value and two
inputs read off shallower diagonals. Writing `a i = d m (i+2)` for one input,
`b i = d (m+1) (i+1)` for the other and `x i = d (m+2) i` for the state,

```
x (i+1) = a i XOR (b i OR x i)
```

Now suppose the two inputs have both settled into repeating with period `p`.
For each `i` the update is one of the four functions from `Bool` to `Bool`,
so the whole cycle of `p` updates composes to one of those four functions,
and *every* function on a two-element set satisfies `f (f (f x)) = f x` —
there is nothing else it could do, since the only self-maps of a two-element
set are the identity, the swap, and the two constants. Applying the cycle
three times therefore does what applying it once does, which says exactly
that `x` repeats with period `2p` once one cycle has gone by.

Periodicity of two neighbouring diagonals thus carries to the next one, and
since the first two are constant, induction settles the whole left side.

The four lemmas below are that argument in order: the fact about two-element
sets, two pieces of bookkeeping about eventual periods, and the driven
sequence itself. Only the last of them contains any difficulty.

`explorer/diagonalinduction.mjs` checks the rearranged recurrence against the
engine at 95,408 index pairs, brute-forces the driven claim over every driver
window, and confirms the measured onsets obey the bound this argument
predicts — which is where the growing onsets come from: each diagonal needs a
full cycle of its inputs before its own state is forced, so the onset
accumulates about one period per step down the family. -/

/-- **A map from `Bool` to `Bool` is its own cube.** Applying any such
function three times is the same as applying it once, because the only four
candidates are the identity, negation, and the two constants, and each is
unchanged after three applications.

The whole engine of the diagonal induction, and small enough that Lean can
check all four cases by brute force. -/
theorem bool_map_iterate_three (f : Bool → Bool) : f^[3] = f := by
  sorry

/-- **Reading a sequence from further along does not disturb its period.** If
a sequence eventually repeats, so does the sequence that starts `s` places
into it. Needed because the two inputs driving a diagonal are the shallower
diagonals read at a small offset, not read from the beginning. -/
theorem isEventuallyPeriodic_shift (f : ℕ → Bool) (s : ℕ)
    (h : IsEventuallyPeriodic f) :
    IsEventuallyPeriodic fun j => f (j + s) := by
  sorry

/-- **Two eventually periodic sequences share a period.** Given one repeating
with period `p` and another with period `q`, both repeat with period `p * q`,
from the later of their two starting points.

Bookkeeping, but load-bearing: the driven-sequence lemma needs a *single*
period governing both of its inputs, and the two diagonals feeding a third
have no reason to arrive with the same one. -/
theorem isEventuallyPeriodic_common_period (f g : ℕ → Bool)
    (hf : IsEventuallyPeriodic f) (hg : IsEventuallyPeriodic g) :
    ∃ p > 0, ∃ N, (∀ n ≥ N, f (n + p) = f n) ∧ (∀ n ≥ N, g (n + p) = g n) := by
  sorry

/-- **A one-bit machine driven by repeating inputs ends up repeating.** If
`x` steps by `x (i+1) = a i XOR (b i OR x i)`, and both inputs `a` and `b`
repeat with period `p` from `N` on, then `x` repeats with period `2 p` from
`N + p` on.

Both numbers in that conclusion are as small as they can be, and neither is
slack. The period really can need doubling — inputs of period `p` exist for
which `x` has period exactly `2 p` — and the delay really is needed, because
`x` may start on any value at all and needs one full cycle before the inputs
have overwritten it. Checked exhaustively over every driver window up to
`p = 5`, including both of those failures.

This is the one lemma in the tier with work in it. The argument is the
composition of one cycle of updates, which is a function from `Bool` to
`Bool`; `bool_map_iterate_three` then says three cycles do what one cycle
does. Building that composite wants an auxiliary definition, which a proof
file is free to carry — nothing in the harness requires a file to hold only
its theorem. -/
theorem bool_driven_eventually_two_periodic (a b x : ℕ → Bool) (p N : ℕ)
    (hp : 0 < p) (hrec : ∀ i, x (i + 1) = xor (a i) (b i || x i))
    (ha : ∀ i ≥ N, a (i + p) = a i) (hb : ∀ i ≥ N, b (i + p) = b i) :
    ∀ i ≥ N + p, x (i + 2 * p) = x i := by
  sorry

/-- **Periodicity carries one diagonal further in.** If the `m`-th and
`(m+1)`-th left diagonals are both eventually periodic, so is the `(m+2)`-th.

The induction step, and the only place the automaton meets the four lemmas
above: rewrite `evolve_left_diagonal_recurrence` into the driven form, shift
the two shallower diagonals into position, put them on a common period, and
apply the driven-sequence lemma. -/
theorem evolve_left_diagonal_isEventuallyPeriodic_step (m : ℕ)
    (h0 : IsEventuallyPeriodic fun j => evolve (j + m) (-(j : ℤ)))
    (h1 : IsEventuallyPeriodic fun j => evolve (j + (m + 1)) (-(j : ℤ))) :
    IsEventuallyPeriodic fun j => evolve (j + (m + 2)) (-(j : ℤ)) := by
  sorry

/-- **Every left diagonal is eventually periodic.** The target the lemmas
above are steps towards, and the first node in this project that is a goal
rather than a step.

This is *not* a prize conjecture and must not be filed as one: it is a claim
about the edge of the cone, where periodicity is provable, not about the
centre column, where the whole content of Wolfram's first question is that it
fails.

Given the step lemma this is short: strong induction on `k`, with the two
base cases handed over by `evolve_left_edge` and
`evolve_left_second_diagonal`, both of which are constant and so repeat with
period 1 from the start. -/
theorem evolve_left_diagonals_isEventuallyPeriodic :
    ∀ k : ℕ, IsEventuallyPeriodic (fun j => evolve (j + k) (-(j : ℤ))) := by
  sorry

/-! ## P2 — density bookkeeping -/

/-- The centre column starts black: the initial configuration has exactly one
black cell, at the origin. -/
theorem centerColumn_zero : centerColumn 0 = true := by
  sorry

/-- The density is never negative: it is a count divided by a natural. -/
theorem centerColumnDensity_nonneg (N : ℕ) : 0 ≤ centerColumnDensity N := by
  sorry

/-- The density never exceeds one: the filtered set is a subset of `range N`,
so its cardinality is at most `N`. (At `N = 0` Lean's `0 / 0 = 0`.) -/
theorem centerColumnDensity_le_one (N : ℕ) : centerColumnDensity N ≤ 1 := by
  sorry

/-- **The density recurrence.** Multiplying out the divisions, the count of
black cells among the first `N + 1` equals the count among the first `N`
plus one if cell `N` is black. `Finset.range_succ` and `Finset.filter_insert`
do the work. -/
theorem centerColumnDensity_succ (N : ℕ) :
    centerColumnDensity (N + 1) * ((N + 1 : ℕ) : ℝ) =
      centerColumnDensity N * (N : ℝ) + (if centerColumn N then 1 else 0) := by
  sorry

/-! ## P1 — the spine: what is known about the centre column

Everything above is about the edges of the cone. This section is the first
in the project that is about the centre. Rule 30 is `left XOR (centre OR
right)`, and for fixed `centre` and `right` that is a bijection in `left`:
given the new cell and its two right-hand inputs, the left input is forced.
Read backwards, two adjacent columns of the space-time diagram determine
every column to their left, for all time. So if two adjacent columns both
repeated with a common period `p` from a common time `N`, every column to
their left would too — with the same `p` and `N`. But a column far enough
left is white at every time in `[N, N + p)`, being outside the cone, and
black when the left edge reaches it. Contradiction: **no two adjacent
columns are both eventually periodic.** Applied at the centre, the centre
column and the column just right of it are not both eventually periodic,
and the first prize conjecture reduces to the implication "if the centre
column repeats, so does its right neighbour".

The captain proved every lemma in this section end to end, in one scratch
file against the exact statements below, before seeding; the bridge lemma
depends on `propext`, `Classical.choice` and `Quot.sound` only. The
inversion identity was also checked against the BigInt engine at 28,679
cells with no mismatch. The adjacent-columns theorem is the core of Erica
Jen's 1986 result that no two columns of rule 30 can both become periodic
("Global properties of cellular automata", J. Stat. Phys. 43, 219–242,
doi:10.1007/BF01010579); the full result is the next section. -/

/-- **Rule 30 read backwards.** The cell one to the left, a step earlier,
is recovered from the new cell and the other two neighbours. This is
`rule30_eq` with the `xor` moved across: `xor` is its own inverse, so
`left = new XOR (centre OR right)`. -/
theorem evolve_sub_one_eq_xor (t : ℕ) (i : ℤ) :
    evolve t (i - 1) = xor (evolve (t + 1) i) (evolve t i || evolve t (i + 1)) := by
  sorry

/-- **A period propagates one column to the left.** If columns `i` and
`i + 1` both repeat with period `p` from time `N`, so does column `i - 1`,
with the same `p` and the same `N`: every value in column `i - 1` is a
fixed function of three values in the two columns to its right, one of them
a step later, and all three repeat from `N` on. -/
theorem evolve_period_sub_one (i : ℤ) (p N : ℕ)
    (h0 : ∀ t ≥ N, evolve (t + p) i = evolve t i)
    (h1 : ∀ t ≥ N, evolve (t + p) (i + 1) = evolve t (i + 1)) :
    ∀ t ≥ N, evolve (t + p) (i - 1) = evolve t (i - 1) := by
  sorry

/-- **A period propagates to every column to the left.** Induction on how
far left, carrying the pair of columns `(i - k, i - k + 1)` together so
that `evolve_period_sub_one` applies at each step. The base case is the two
hypotheses; the step is the previous lemma plus the cast identities
`i - ↑(k + 1) = i - ↑k - 1` and `i - ↑(k + 1) + 1 = i - ↑k`. -/
theorem evolve_period_sub (i : ℤ) (p N : ℕ)
    (h0 : ∀ t ≥ N, evolve (t + p) i = evolve t i)
    (h1 : ∀ t ≥ N, evolve (t + p) (i + 1) = evolve t (i + 1)) :
    ∀ k : ℕ, ∀ t ≥ N, evolve (t + p) (i - k) = evolve t (i - k) := by
  sorry

/-- **No two adjacent columns share a positive period from a common time.**
Pick a column `-m` far enough left that the cone has not reached it by time
`N + p` — `m = N + p + (-i).toNat + 1` works, and `k = (i + m).toNat` puts
`i - k = -m`. By `evolve_period_sub` that column repeats with period `p`
from `N`. At time `m - p ≥ N` it is white (`evolve_eq_false_of_outside_cone`),
so by the period it is white at time `m`; but `evolve_left_edge` says it is
black at time `m`. The hypothesis `0 < p` is what makes `m - p < m`. -/
theorem not_evolve_period_adjacent (i : ℤ) (p N : ℕ) (hp : 0 < p)
    (h0 : ∀ t ≥ N, evolve (t + p) i = evolve t i)
    (h1 : ∀ t ≥ N, evolve (t + p) (i + 1) = evolve t (i + 1)) : False := by
  sorry

/-- **Adjacent columns are not both eventually periodic.** Two eventually
periodic sequences share a period from a common time
(`isEventuallyPeriodic_common_period`), and `not_evolve_period_adjacent`
rules that out. This is the first theorem in the project about the
interior of the cone. -/
theorem not_isEventuallyPeriodic_adjacent (i : ℤ) :
    ¬ (IsEventuallyPeriodic (fun t => evolve t i) ∧
        IsEventuallyPeriodic (fun t => evolve t (i + 1))) := by
  sorry

/-- **The centre column and its right neighbour are not both eventually
periodic.** `not_isEventuallyPeriodic_adjacent` at `i = 0`; `centerColumn`
unfolds to `fun t => evolve t 0` by definition and `0 + 1 = 1` is `simp`. -/
theorem centerColumn_right_not_both_isEventuallyPeriodic :
    ¬ (IsEventuallyPeriodic centerColumn ∧ IsEventuallyPeriodic (fun t => evolve t 1)) := by
  sorry

/-- **The bridge to the first prize.** If a periodic centre column would
force a periodic right neighbour, then the centre column is not eventually
periodic — which is `centerColumn_not_eventually_periodic` in
`Rule30/Prize.lean`, word for word. One line from the previous lemma. -/
theorem centerColumn_not_eventually_periodic_of_right
    (h : IsEventuallyPeriodic centerColumn → IsEventuallyPeriodic (fun t => evolve t 1)) :
    ¬ IsEventuallyPeriodic centerColumn := by
  sorry

/-- **The residual of P1.** Given the bridge, this implication *is* the
first prize conjecture: it says exactly what the known structure of rule 30
leaves open. Nobody knows how to prove it, and it is on the board as a wall
so that the open problem is a visible node rather than an unreachable
target. Do not weaken it, and do not dispatch it as an ordinary leaf. -/
theorem centerColumn_right_isEventuallyPeriodic_of_center
    (h : IsEventuallyPeriodic centerColumn) : IsEventuallyPeriodic (fun t => evolve t 1) := by
  sorry

/-! ## P1 — Jen's theorem: at most one column is ever periodic

Erica Jen, "Global properties of cellular automata", J. Stat. Phys. 43
(1986) 219–242: **no two columns of the rule 30 diagram can both become
periodic.** The section above handles adjacent columns. Any two columns
reduce to that case through the block of columns strictly between them,
which `Rule30/Strip.lean` makes a definition: a strip is a finite-state
machine whose next state depends only on its current state and the two
cells just outside it. A finite machine fed an eventually repeating input
must eventually repeat — read its state once per period and pigeonhole —
so if two columns both repeat, so does every column between them, and in
particular the one next to the left boundary, which is the adjacent case.

For P1 this weakens the residual: the centre column is not eventually
periodic as soon as a repeating centre column would force *any* other
column to repeat, not specifically its right neighbour. The wall node at
the end of this section is that weaker residual; the earlier wall stays,
since it implies this one.

Every lemma here was proved end to end against the exact statements below
before seeding. -/

/-- **A finite machine on a repeating schedule repeats.** `s` steps by a
map `step t` that depends on the time, and the schedule of maps repeats
with period `p` from `N` on. Read the state once per period, at times
`N + k * p`: there are only finitely many states, so two reads agree
(`Fintype.exists_ne_map_eq_of_card_lt`), and from two equal states at
schedule-aligned times the orbits agree forever after. The period found is
a multiple of `p`; the statement asks only for some positive period. -/
theorem isEventuallyPeriodic_of_periodic_step {S : Type} [Fintype S]
    (step : ℕ → S → S) (s : ℕ → S) (p N : ℕ) (hp : 0 < p)
    (hstep : ∀ t ≥ N, step (t + p) = step t)
    (hs : ∀ t, s (t + 1) = step t (s t)) :
    ∃ q > 0, ∃ M, ∀ t ≥ M, s (t + q) = s t := by
  sorry

/-- **A strip advances by one rule-30 step, fed the two cells just outside
it.** This is `rule30_eq` at each index of the strip, with the end indices
reading one neighbour from outside. Casework on whether the index is `0`
or `w`, then integer-cast bookkeeping to match `i + k - 1` and `i + k + 1`
against the strip's own indexing. -/
theorem strip_succ (i : ℤ) (w t : ℕ) :
    strip i w (t + 1) = stripStep w (evolve t (i - 1)) (evolve t (i + w + 1)) (strip i w t) := by
  sorry

/-- **A strip between two repeating columns repeats.** The schedule of maps
is `stripStep w` fed the two boundary cells at time `t`; both repeat from
`N` with period `p`, so the schedule does, and
`isEventuallyPeriodic_of_periodic_step` applies with `strip_succ` as the
step equation. -/
theorem strip_eventuallyPeriodic (i : ℤ) (w p N : ℕ) (hp : 0 < p)
    (ha : ∀ t ≥ N, evolve (t + p) (i - 1) = evolve t (i - 1))
    (hc : ∀ t ≥ N, evolve (t + p) (i + w + 1) = evolve t (i + w + 1)) :
    ∃ q > 0, ∃ M, ∀ t ≥ M, strip i w (t + q) = strip i w t := by
  sorry

/-- **A column strictly between two eventually periodic columns is
eventually periodic.** Put the two boundary columns on a common period
(`isEventuallyPeriodic_common_period`), apply `strip_eventuallyPeriodic`,
and read the strip at index `0`, which is column `i` itself. -/
theorem evolve_isEventuallyPeriodic_of_between (i : ℤ) (w : ℕ)
    (ha : IsEventuallyPeriodic fun t => evolve t (i - 1))
    (hc : IsEventuallyPeriodic fun t => evolve t (i + w + 1)) :
    IsEventuallyPeriodic fun t => evolve t i := by
  sorry

/-- **Jen's theorem.** No two distinct columns are both eventually
periodic. If `j = i + 1` this is `not_isEventuallyPeriodic_adjacent`.
Otherwise the strip of columns `i + 1 .. j - 1` sits strictly between
them, so column `i + 1` is eventually periodic by
`evolve_isEventuallyPeriodic_of_between`, and columns `i`, `i + 1` are
then the adjacent case. The width is `(j - i - 2).toNat`. -/
theorem not_isEventuallyPeriodic_pair (i j : ℤ) (hij : i < j) :
    ¬ (IsEventuallyPeriodic (fun t => evolve t i) ∧
        IsEventuallyPeriodic (fun t => evolve t j)) := by
  sorry

/-- **Jen's theorem as uniqueness:** two eventually periodic columns are the
same column. Trichotomy on `i`, `j` and `not_isEventuallyPeriodic_pair`
in each direction. -/
theorem isEventuallyPeriodic_column_unique (i j : ℤ)
    (hi : IsEventuallyPeriodic fun t => evolve t i)
    (hj : IsEventuallyPeriodic fun t => evolve t j) : i = j := by
  sorry

/-- **The bridge to the first prize, weakened.** If a repeating centre
column would force *any* other column to repeat, the centre column never
repeats: the other column and column `0` would be two distinct eventually
periodic columns. The conclusion is `centerColumn_not_eventually_periodic`
from `Rule30/Prize.lean`, word for word, and this file does not prove the
hypothesis. -/
theorem centerColumn_not_eventually_periodic_of_any_other
    (h : IsEventuallyPeriodic centerColumn →
      ∃ j : ℤ, j ≠ 0 ∧ IsEventuallyPeriodic (fun t => evolve t j)) :
    ¬ IsEventuallyPeriodic centerColumn := by
  sorry

/-- **The residual of P1, weakened.** Given the bridge above, this is the
first prize conjecture: it is what Jen's theorem leaves open. It is weaker
than `centerColumn_right_isEventuallyPeriodic_of_center`, which implies it
by taking `j = 1`. Nobody knows how to prove it; it is on the board as a
wall so the open problem is a visible node. Do not weaken it further, and
do not dispatch it as an ordinary leaf. -/
theorem centerColumn_other_isEventuallyPeriodic_of_center
    (h : IsEventuallyPeriodic centerColumn) :
    ∃ j : ℤ, j ≠ 0 ∧ IsEventuallyPeriodic (fun t => evolve t j) := by
  sorry

/-! ## The two bodies — quantitative periodicity of the diagonals

Seeded 2026-09-07 after a contributor observed that the rule 30 triangle
looks like two triangles with different rules, and an engine scan to
`k = 1100` said what the eye was seeing. `leftDiagonal`, `rightDiagonal` and
`PeriodicFrom` are in `Rule30/Basic.lean`.

Measured, and only measured: every left diagonal repeats with a period of at
most 8 to `k = 400` and 16 to `k = 700`, and its repetition begins by index
`k / 2`; every right diagonal repeats from its very first cell, with periods
`1, 2, 2, 4, 8, 8, 16, 32, 32, 64, …` that double away. The proofs below
establish period `2 ^ k` on both sides, with onset `2 ^ k` on the left and
`0` on the right. On the right that is close to the truth. On the left it is
exponentially loose, and the two walls at the end state the gap. -/

/-- **A multiple of a period is a period**, from the same starting index.
Bookkeeping for the two inductions below, which need diagonals `m` and
`m + 1` on the common period `2 ^ (m + 1)` without losing its size. -/
theorem periodicFrom_mul (f : ℕ → Bool) (p N : ℕ) (h : PeriodicFrom f p N) (m : ℕ) :
    PeriodicFrom f (m * p) N := by
  sorry

/-- **Periodicity carries one left diagonal further in, with the numbers
kept.** The quantitative form of `evolve_left_diagonal_isEventuallyPeriodic_step`:
period `q` on diagonals `m` and `m + 1` from `N` gives period `2 q` on
diagonal `m + 2` from `N + q`. Both the doubling and the delay are inherited
from `bool_driven_eventually_two_periodic`, where both are tight. -/
theorem leftDiagonal_periodicFrom_step (m q N : ℕ) (hq : 0 < q)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
    PeriodicFrom (leftDiagonal (m + 2)) (2 * q) (N + q) := by
  sorry

/-- **Every left diagonal repeats with period `2 ^ k`, from index `2 ^ k` at
the latest.** What `evolve_left_diagonals_isEventuallyPeriodic` knows and
discards. The first quantitative statement about the regular region, and the
bound the wall `leftDiagonal_onset_le` says is exponentially loose. -/
theorem leftDiagonal_periodicFrom_pow (k : ℕ) :
    ∃ N ≤ 2 ^ k, PeriodicFrom (leftDiagonal k) (2 ^ k) N := by
  sorry

/-- **The right diagonals satisfy a closed recurrence.** The mirror of
`evolve_left_diagonal_recurrence`, and the mirror is not symmetric: on the
left a diagonal's own previous term sits inside the `||`, here it sits in the
`xor` slot. That one difference is why the right side needs a different
driven lemma and turns out periodic from the start. -/
theorem rightDiagonal_recurrence (m i : ℕ) :
    rightDiagonal (m + 2) (i + 1)
      = xor (rightDiagonal (m + 2) i)
          (rightDiagonal (m + 1) (i + 1) || rightDiagonal m (i + 2)) := by
  sorry

/-- **A one-bit machine that XORs a repeating input into its state repeats
with twice the period, and with no delay.** XOR-ing a fixed block sum is an
involution, so two input periods return the state exactly. Contrast
`bool_driven_eventually_two_periodic`, where the state can be overwritten and
one full cycle of delay is needed. No `0 < p`: `p = 0` is trivially true. -/
theorem bool_xor_driven_periodicFrom (c x : ℕ → Bool) (p N : ℕ)
    (hrec : ∀ i, x (i + 1) = xor (x i) (c i)) (hc : PeriodicFrom c p N) :
    PeriodicFrom x (2 * p) N := by
  sorry

/-- **Periodicity carries one right diagonal further in**, period doubled,
onset unchanged. The recurrence puts diagonal `m + 2` in the XOR-driven form
with input `rightDiagonal (m + 1) (i + 1) || rightDiagonal m (i + 2)`. -/
theorem rightDiagonal_periodicFrom_step (m q N : ℕ)
    (h0 : PeriodicFrom (rightDiagonal m) q N)
    (h1 : PeriodicFrom (rightDiagonal (m + 1)) q N) :
    PeriodicFrom (rightDiagonal (m + 2)) (2 * q) N := by
  sorry

/-- **Every right diagonal is periodic from its first cell, with period
`2 ^ k`.** Periodic, not eventually periodic. Base cases are the right edge
(constant) and the second right diagonal (alternating); the step is
`rightDiagonal_periodicFrom_step`. The engine's measured periods all divide
`2 ^ k` and all begin at `0`. This is Lemma 2 and Theorem 1 of Rowland,
*Local Nested Structure in Rule 30*, Complex Systems 16 (2006), stated there
for the mirror rule 86; it was found here from the engine before the paper
was, and the two agree. -/
theorem rightDiagonal_periodicFrom_pow (k : ℕ) :
    PeriodicFrom (rightDiagonal k) (2 ^ k) 0 := by
  sorry

/-- **The mirror of `evolve_left_diagonals_isEventuallyPeriodic`**, so both
sides of the cone are on the board in the same words. Immediate from
`rightDiagonal_periodicFrom_pow`. -/
theorem rightDiagonal_isEventuallyPeriodic (k : ℕ) :
    IsEventuallyPeriodic (rightDiagonal k) := by
  sorry

/-- **Wall: the left transients grow at most linearly.** The `k`-th left
diagonal has settled into its repetition by index `k`. This is Wolfram's
"region of regularity grows at about a quarter cell per step" in its weakest
linear form; the measured onset is below `k / 2` for every `k ≤ 722`, and the
proved bound (`leftDiagonal_periodicFrom_pow`) is `2 ^ k`. Nothing between
`2 ^ k` and `k` is proved by anyone. Not a prize conjecture and not bearing on
one: the centre column never enters this region. Never dispatch as an ordinary
leaf; never weaken. -/
theorem leftDiagonal_onset_le (k : ℕ) :
    ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N := by
  sorry

/-- **Wall: the left periods grow at most linearly.** The measured periods
are at most 16 to `k = 700`, so the truth is far below this line; it is the
weakest statement that is already unproved. With `leftDiagonal_onset_le` it
says why the left body looks regular while the right body does not. Not a
prize conjecture. Never dispatch as an ordinary leaf; never weaken.

The one proved thing near it is Rowland's Proposition 2 (*Local Nested
Structure in Rule 30*, 2006): the period of diagonal `k` doubles past the
larger of its two predecessors' exactly when diagonal `k - 1` is eventually
white and one period of diagonal `k - 2` holds an odd number of black
cells. That says *when* doubling happens, not how rarely, and how rarely is
this wall. -/
theorem leftDiagonal_period_le (k : ℕ) :
    ∃ p > 0, p ≤ k + 1 ∧ ∃ N, PeriodicFrom (leftDiagonal k) p N := by
  sorry

/-! ## Harness self-test -/

/-- A trivially true statement that exists only so the harness's verifier
tests have something to prove without touching a real node's proof file. It
is deliberately absent from `blueprint/dag.json`. -/
theorem harness_probe : True := by
  sorry

end Statements
