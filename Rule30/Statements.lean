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
weakest statement that is already unproved. Wolfram's notes (NKS p. 871)
give the depth at which each period first appears: 2 at `k = 3`, 4 at 8, 8
at 29, 16 at 400, 32 at 87,867, and 64 not before 2,107,985,255 — so the
period is about `2 * log₂ k`, and `k + 1` is generous by a factor that grows
without bound. With `leftDiagonal_onset_le` it
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

/-- **One step of the rule in left-diagonal coordinates.** The mirror of
`rightDiagonal_recurrence`, with the diagonal's own previous term inside the
`||` rather than in the `xor` slot. `evolve_left_diagonal_recurrence` says
the same thing in `evolve` coordinates; this is the form every node above
it cites, so the cast bookkeeping is paid once. -/
theorem leftDiagonal_recurrence (m i : ℕ) :
    leftDiagonal (m + 2) (i + 1)
      = xor (leftDiagonal m (i + 2))
          (leftDiagonal (m + 1) (i + 1) || leftDiagonal (m + 2) i) := by
  sorry

/-- **A one-bit OR-machine that is back where it started after one driver
period keeps that period.** `bool_driven_eventually_two_periodic` always
doubles; this says the doubling is not forced, and turns a question about
periods into one Bool equality. -/
theorem bool_driven_periodicFrom_of_return (a b x : ℕ → Bool) (p N M : ℕ)
    (hrec : ∀ i, x (i + 1) = xor (a i) (b i || x i))
    (ha : PeriodicFrom a p N) (hb : PeriodicFrom b p N) (hNM : N ≤ M)
    (hret : x (M + p) = x M) :
    PeriodicFrom x p M := by
  sorry

/-- **A true driver bit resets the machine.** When `b j` is true the update
collapses to `not (a j)` and the machine forgets its history, so the period
is `p` and the onset is the reset point `j + 1`, not one period later. -/
theorem bool_driven_periodicFrom_of_reset (a b x : ℕ → Bool) (p N j : ℕ)
    (hrec : ∀ i, x (i + 1) = xor (a i) (b i || x i))
    (ha : PeriodicFrom a p N) (hb : PeriodicFrom b p N) (hNj : N ≤ j)
    (hbj : b j = true) :
    PeriodicFrom x p (j + 1) := by
  sorry

/-- **A black cell in the upper diagonal stops the doubling.** The sharp
companion to `leftDiagonal_periodicFrom_step`: if diagonal `m + 1` is black
at `j + 1` past the common onset, diagonal `m + 2` keeps period `q` from
`j + 1`. Measured to `m = 428`: such a cell exists in 425 of 429 steps,
always within 8 of the onset, with no violation. -/
theorem leftDiagonal_periodicFrom_step_of_black (m q N j : ℕ) (hNj : N ≤ j)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N)
    (hblack : leftDiagonal (m + 1) (j + 1) = true) :
    PeriodicFrom (leftDiagonal (m + 2)) q (j + 1) := by
  sorry

/-- **Rowland's doubling criterion, in the direction a bound uses.** The
period can only double at a diagonal whose predecessor is eventually white.
Below `k = 430` the eventually-white left diagonals are 2, 7, 28 and 399,
and the doublings are at 3, 8, 29 and 400. What remains of the wall
`leftDiagonal_period_le` after this is "the eventually-white diagonals are
sparse", which nobody has proved. -/
theorem leftDiagonal_step_period_dichotomy (m q N : ℕ)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
    (∃ M, PeriodicFrom (leftDiagonal (m + 2)) q M) ∨
      ∀ j ≥ N + 1, leftDiagonal (m + 1) j = false := by
  sorry

/-! ## Configurations and the row model

The picture grown from an arbitrary row, and the bit-level model of the
single-seed picture. Sourced from `blueprint/crystals.md` items 1–4, A1, A2,
20 and 34, under `docs/superpowers/specs/2026-09-07-connections-design.md`. -/

/-- **Flipping the left neighbour always flips the output.** Rule 30 is
`left XOR (centre OR right)`, so with centre and right held fixed the output
is the left cell up to a constant. Left-permutivity for one step, in the
form crystal A1 gives it. -/
theorem rule30_ne_of_left_ne (c d : Config) (i : ℤ)
    (hl : c (i - 1) ≠ d (i - 1)) (hc : c i = d i) (hr : c (i + 1) = d (i + 1)) :
    rule30 c i ≠ rule30 d i := by
  sorry

/-- **The exact local law of the left front.** Two rows agree at `i - 2` and
`i - 1` and differ at `i`; then the outputs at `i - 1` differ exactly when
the cell at `i - 1` is white. The difference front advances left when the
cell beside it is white and can retreat when it is black, which is the
deterministic content behind the measured left speed near a quarter. -/
theorem rule30_left_local_law (c d : Config) (i : ℤ)
    (h2 : c (i - 2) = d (i - 2)) (h1 : c (i - 1) = d (i - 1)) (h0 : c i ≠ d i) :
    (rule30 c (i - 1) ≠ rule30 d (i - 1)) ↔ c (i - 1) = false := by
  sorry

/-- **The sideways inverse.** Any row is recovered one cell to the left from
its successor and its own cells to the right: `c (i-1) = xor (rule30 c i) (c i || c (i+1))`.
The general-row form of the closed `evolve_sub_one_eq_xor`. -/
theorem sideways_inverse (c : Config) (i : ℤ) :
    c (i - 1) = xor (rule30 c i) (c i || c (i + 1)) := by
  sorry

/-- **The cone lemma for an arbitrary row.** After `t` steps the origin cell
depends only on the starting cells at positions `-t .. t`: two rows that
agree there grow the same origin cell. Induction on `t`; the single-seed
`evolve_eq_false_of_outside_cone` is the case where the second row is all
white, read away from the origin. -/
theorem evolveFrom_eq_of_agree_on_window (c d : Config) (t : ℕ)
    (h : ∀ j : ℤ, -(t : ℤ) ≤ j → j ≤ t → c j = d j) :
    evolveFrom c t 0 = evolveFrom d t 0 := by
  sorry

/-- **One step of rule 30 is left-permutive with radius 1.** The
`LeftPermutive` form of `rule30_ne_of_left_ne`. -/
theorem rule30_leftPermutive : LeftPermutive rule30 1 := by
  sorry

/-- **`t` steps of rule 30 are left-permutive with radius `t`.** Flipping the
cell at `i - t` while holding `i - t + 1 .. i + t` fixed flips the output at
`i` after `t` steps. Induction on `t` over one step; the flipped cell's
influence moves right by exactly one per step and is never cancelled,
because each step is left-permutive. -/
theorem evolveFrom_leftPermutive (t : ℕ) :
    LeftPermutive (fun c => evolveFrom c t) t := by
  sorry

/-- **The rightmost difference moves right at speed exactly one.** If two
rows agree everywhere to the right of `i` and differ at `i`, then after `t`
steps they differ at `i + t` and agree everywhere to its right. Kůrka's
right Lyapunov exponent, in its finite form. Induction on `t`. -/
theorem rightmost_difference_moves_right (c d : Config) (i : ℤ) (t : ℕ)
    (hagree : ∀ j : ℤ, i < j → c j = d j) (hdiff : c i ≠ d i) :
    evolveFrom c t (i + t) ≠ evolveFrom d t (i + t) ∧
      ∀ j : ℤ, i + t < j → evolveFrom c t j = evolveFrom d t j := by
  sorry

/-- **After `t` steps, exactly half of all windows grow a black centre cell.**
Of the `2 ^ (2t + 1)` assignments to positions `-t .. t`, exactly `2 ^ (2t)`
make the origin black at time `t`. Left-permutivity with radius `t` pairs
each window with the one whose leftmost cell is flipped, and the pair has
one black and one white outcome. This is the finite form of "a random row
stays random", and the reason one half is the expected density; it says
nothing about the single-seed row, which is one window in `2 ^ (2t + 1)`. -/
theorem window_count_half (t : ℕ) : blackWindowCount t = 2 ^ (2 * t) := by
  sorry

/-- **The row model agrees with the automaton.** `rowCell t x = evolve t x`
for every `t` and `x`. Induction on `t`; the step case reads the three
neighbouring bits out of `(4 * r) ^^^ ((2 * r) ||| r)` with `Nat.testBit`
lemmas and matches them to `rule30_eq`. After this, any concrete fact about
any row to depth in the thousands is a theorem by `decide`. -/
theorem rowCell_eq_evolve (t : ℕ) (x : ℤ) : rowCell t x = evolve t x := by
  sorry

/-! ## P2 — the count side of balance

The prize's real-valued limit, rewritten over the integer black count, and
the three count lemmas that rewriting needs. Every one holds for any Bool
sequence in the centre column's place. Seeded by the first P2 seeder,
2026-09-07. -/

/-- **The prize's limit, as a statement about an integer.** The density tends
to one half exactly when the excess, twice the black count minus `N`, is
eventually small relative to `N`. Lossless in both directions, so every
later P2 statement can live in `ℕ` and `ℤ` and never divide. True of any
Bool sequence in the centre column's place; it proves nothing about rule 30. -/
theorem centerColumn_density_tendsto_half_iff_excess :
    Filter.Tendsto centerColumnDensity Filter.atTop (nhds (1 / 2 : ℝ)) ↔
      ∀ ε : ℝ, 0 < ε → ∃ N₀ : ℕ, ∀ N ≥ N₀,
        |2 * (((Finset.range N).filter fun n => centerColumn n = true).card : ℝ) - (N : ℝ)|
          ≤ ε * (N : ℝ) := by
  sorry

/-- **The black count over `N + 1` cells is the count over `N`, plus one if
cell `N` is black.** The integer twin of `centerColumnDensity_succ`, whose
proof already contains this step without a name. -/
theorem centerColumnCount_succ (N : ℕ) :
    ((Finset.range (N + 1)).filter fun n => centerColumn n = true).card =
      ((Finset.range N).filter fun n => centerColumn n = true).card
        + (if centerColumn N then 1 else 0) := by
  sorry

/-- **Widening the window from `M` to `N` adds between `0` and `N - M`
black cells.** Induction on `N` from the count recurrence. True of any
Bool sequence. -/
theorem centerColumnCount_sandwich (M N : ℕ) (h : M ≤ N) :
    ((Finset.range M).filter fun n => centerColumn n = true).card ≤
        ((Finset.range N).filter fun n => centerColumn n = true).card ∧
      ((Finset.range N).filter fun n => centerColumn n = true).card ≤
        ((Finset.range M).filter fun n => centerColumn n = true).card + (N - M) := by
  sorry

/-- **The excess cannot move faster than the window.** Between window sizes
`M` and `N` the excess `2 * count - N` changes by at most `N - M`, so a
proof that controls it at a sparse set of sizes controls every size in
between. A bound on the excess's speed, not on the excess; true of any Bool
sequence, and the shape a real P2 argument would need because rule 30's
known structure arrives at powers of two. -/
theorem centerColumn_excess_interpolate (M N : ℕ) (h : M ≤ N) :
    |2 * (((Finset.range N).filter fun n => centerColumn n = true).card : ℤ) - (N : ℤ)| ≤
      |2 * (((Finset.range M).filter fun n => centerColumn n = true).card : ℤ) - (M : ℤ)|
        + ((N : ℤ) - (M : ℤ)) := by
  sorry

/-! ## P1 — the half-lines and the sideways solve: the seam at the origin

Seeded 2026-09-07 from blueprint/crystals.md items 38–40, after Sextant's
second attack on centerColumn_other_isEventuallyPeriodic_of_center. The
definitions are in Rule30/Basic.lean under "The two half-lines and the
sideways solve". Each half of the picture is driven by the centre column
alone; columns 0 and 1 rebuild everything to their left; and the rule at
the origin splits by the centre's colour, deleting column 1 at black times
and prescribing it at white ones. -/

/-- **The left half-line is exact.** Grown from the true left side of any
row with the true centre column as its boundary, it reproduces every cell
left of the origin at every time: a cell at `x ≤ -1` never reads anything
right of position `0`. Induction on `t`, generalising `k`, with `rule30_eq`
at each cell and `evolveFrom_succ` to read one more step; the `k = 0` case
is where the boundary is read. -/
theorem evolveHalfLeft_eq_column (X : Config) (t k : ℕ) :
    evolveHalfLeft (column X 0) (fun k => X (-((k : ℤ) + 1))) t k
      = column X (-((k : ℤ) + 1)) t := by
  sorry

/-- **The right half-line is exact.** The mirror of `evolveHalfLeft_eq_column`
for the cells right of the origin: a cell at `x ≥ 1` never reads anything
left of position `0`. Same induction on `t` generalising `k`, with one
asymmetry a blind mirroring gets wrong: on this side the boundary `c t` is
the *left* argument of the `xor`, not a disjunct inside the `||`, because
position `0` is the left neighbour of position `1`. -/
theorem evolveHalfRight_eq_column (X : Config) (t k : ℕ) :
    evolveHalfRight (column X 0) (fun k => X ((k : ℤ) + 1)) t k
      = column X ((k : ℤ) + 1) t := by
  sorry

/-- **The sideways solve is exact.** Columns `0` and `1` of any row rebuild
every column to their left: `leftSolve` at `k` is column `-k`. Two-step
induction on `k`, generalising `t` (the `k + 2` case uses the hypothesis at
`k + 1` at time `t + 1` as well as at `t`), from `sideways_inverse` at
position `-k`, reading `rule30 (evolveFrom X t)` as `evolveFrom X (t + 1)`
by `evolveFrom_succ`. -/
theorem leftSolve_eq_column (X : Config) (k t : ℕ) :
    leftSolve (column X 0) (column X 1) k t = column X (-(k : ℤ)) t := by
  sorry

/-- **At a black centre cell the next centre cell is the complement of the
cell to its left**, and column `1` plays no part. `sideways_inverse` at
`i = 0` with the centre `true`, so the OR is `true` and the XOR is a
negation. -/
theorem column_succ_of_black (X : Config) (t : ℕ) (h : column X 0 t = true) :
    column X 0 (t + 1) = !(column X (-1) t) := by
  sorry

/-- **At a white centre cell, column `1` is forced** by the centre column
and column `-1`: `sideways_inverse` at `i = 0` with the centre `false`, so
the OR is column `1` alone and the equation can be solved for it. -/
theorem column_one_of_white (X : Config) (t : ℕ) (h : column X 0 t = false) :
    column X 1 t = xor (column X 0 (t + 1)) (column X (-1) t) := by
  sorry

/-- **A row is rigid from the right.** Two rows that agree everywhere right
of the origin and have the same centre column are the same row. If they
differed, `Function.ne_iff` gives a differing position, which is `≤ 0` by
`hright`; take the least `m` with a difference at `-m` (`Nat.find`, since
`Bool` equality is decidable): every position right of `-m` agrees, so
`rightmost_difference_moves_right` carries the difference to the origin in
`m` steps, where the centre columns would differ. -/
theorem config_eq_of_right_and_column (X Y : Config)
    (hright : ∀ k : ℕ, X ((k : ℤ) + 1) = Y ((k : ℤ) + 1))
    (hcol : ∀ t : ℕ, column X 0 t = column Y 0 t) :
    X = Y := by
  sorry

/-- **The seed's own black-time law.** `column_succ_of_black` on the single
seed: whenever the centre cell is black, the next centre cell is the
complement of the cell just left of centre. -/
theorem centerColumn_succ_of_black (t : ℕ) (h : centerColumn t = true) :
    centerColumn (t + 1) = !(evolve t (-1)) := by
  sorry

/-! ## P1 — the left diagonals: the settled region never repeats, so the periods are unbounded

Seeded 2026-09-07 from blueprint/crystals.md items 42–43, out of Sextant's
third attack. Both were kernel-checked in scratch first
(explorer/scratch_leftdiagonal_unbounded.lean); the routes in the
docstrings are those proofs'. They sit beside the two diagonal walls as a
lower bound, under no wall. -/

/-- **No two pairs of adjacent left diagonals ever eventually agree.** Read
along any two adjacent left diagonals, the settled region never coincides
with itself moved `d` diagonals inward. If the pair `(k, k + 1)` agreed
with `(k + d, k + d + 1)` from some index on, the recurrence read backwards
(`leftDiagonal m (i + 2) = xor (leftDiagonal (m + 2) (i + 1)) (leftDiagonal (m + 1) (i + 1) || leftDiagonal (m + 2) i)`,
from `leftDiagonal_recurrence`) would carry the agreement one diagonal
outward at the cost of two indices, down to diagonals `0` and `1`, which
are black (`evolve_left_edge`, `evolve_left_second_diagonal`); so
diagonals `d` and `d + 1` would be eventually black, which by the forward
recurrence makes `d - 1` and then `d - 2` eventually white, and two
adjacent eventually-white diagonals force the next one outward white, all
the way to the edge. State the two descents as predicates on `(m, M)` and
induct on `m`; the case `d = 1` ends at the first white diagonal. -/
theorem leftDiagonal_pair_never_eventually_shifted (k d N : ℕ) (hd : 0 < d) :
    ∃ j ≥ N, leftDiagonal k j ≠ leftDiagonal (k + d) j ∨
      leftDiagonal (k + 1) j ≠ leftDiagonal (k + d + 1) j := by
  sorry

/-- **The eventual periods of the left diagonals are unbounded**: for every
`a` some left diagonal is not eventually `2 ^ a`-periodic, so the period
doubling seen at diagonals 3, 8, 29, 400 and 87867 never stops. If every
diagonal were eventually `2 ^ a`-periodic, read each one's tail as a word
`Fin (2 ^ a) → Bool` at an onset that is a multiple of `2 ^ a` (the tail is
then determined by the residue of the index); the pairs of words of
adjacent diagonals live in a finite type, so two indices carry the same
pair (`Finite.exists_ne_map_eq_of_infinite`), and those two pairs of
diagonals agree from the larger onset on, against
`leftDiagonal_pair_never_eventually_shifted`. -/
theorem leftDiagonal_period_unbounded (a : ℕ) :
    ∃ k, ∀ N, ¬ PeriodicFrom (leftDiagonal k) (2 ^ a) N := by
  sorry

/-- **The period doubling happens at a bounded depth**: the first diagonal
that is not eventually `2 ^ a`-periodic is found by depth `4 ^ 2 ^ a + 1`.
This is `leftDiagonal_period_unbounded` with a rate: that says the doublings
never stop, this says how long you may have to wait for the next one. The
first four such depths are 3, 8, 29 and 400, measured here by
`explorer/leftdoubling.mjs`, whose search reaches diagonal 430 and sees no
period above 16 — so 400 rests on thirty diagonals of clearance and the
next depth is not observed at all. NKS p. 871 continues 87867 and
2107985255, the second recomputed from the recurrence alone in
blueprint/crystals.md item 55. So the bound is enormously loose against
what is measured, and it is the only bound of any size in print.

Why: if every diagonal up to depth `K` were eventually `2 ^ a`-periodic,
read each tail as a word `Fin (2 ^ a) → Bool` at an onset that is a multiple
of `2 ^ a`, exactly as in `leftDiagonal_period_unbounded`. A *pair* of such
words for adjacent diagonals ranges over a type of cardinality
`(2 ^ 2 ^ a) ^ 2 = 4 ^ 2 ^ a`, so once `K` exceeds that, two diagonals carry
the same pair and `leftDiagonal_pair_never_eventually_shifted` is
contradicted. The proof is that argument with
`Finite.exists_ne_map_eq_of_infinite` replaced by a counting bound on a
`Fintype`; the phase alignment is unchanged. -/
theorem leftDiagonal_period_unbounded_le (a : ℕ) :
    ∃ k ≤ 4 ^ 2 ^ a + 1, ∀ N, ¬ PeriodicFrom (leftDiagonal k) (2 ^ a) N := by
  sorry

/-- **The white branch of the left induction costs one index, not one period.**
`leftDiagonal_periodicFrom_step` pays a whole period `q` to move the onset
out by one diagonal. This says the true cost is one *cell*: either the middle
diagonal is white from `N + 1` on, and then the new diagonal is a running
total of the one two further out, so its onset is `N + 1` and its period at
most doubles; or the middle diagonal is black somewhere at `j + 1`, and then
the onset jumps to exactly there with the period unchanged.

Found by Cadence in an abandoned research attempt on `leftDiagonal_onset_le`
(run 20260907T201514Z) and kept as `explorer/scratch_onset_dichotomy.lean`,
which compiles alone. It does not close the onset wall and the seed check
was right about why: iterating it bounds the onset by the sum of the
first-black gaps, and bounding that sum by `k` is the open part. -/
theorem leftDiagonal_step_onset_dichotomy (m q N : ℕ)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
    PeriodicFrom (leftDiagonal (m + 2)) (2 * q) (N + 1) ∨
      ∃ j, N ≤ j ∧ leftDiagonal (m + 1) (j + 1) = true ∧
        PeriodicFrom (leftDiagonal (m + 2)) q (j + 1) := by
  sorry

/-! ### The local dictionary of a white diagonal

Four one-step readings of `leftDiagonal_recurrence`, seeded 2026-09-08 from
blueprint/crystals.md item 53 (Sextant's C1), kernel-checked together in
`explorer/scratch_whitestep.lean`. They say what a white or black diagonal
forces two and three diagonals further out. Vocabulary: they are cited by
onset and period arguments and do not move a wall by themselves. The third
is Rowland 2006's lines 905–908 in words; the rest are new phrasing of the
recurrence. -/

/-- **A black cell under a shifted pair turns the next diagonal white.** If
diagonal `m + 1` is the shift of diagonal `m` from `N` on and is black at
`j + 1`, then diagonal `m + 2` is white from `j + 1` on. -/
theorem leftDiagonal_white_of_shift (m N j : ℕ) (hNj : N ≤ j)
    (hshift : ∀ i ≥ N, leftDiagonal (m + 1) (i + 1) = leftDiagonal m (i + 2))
    (hblack : leftDiagonal (m + 1) (j + 1) = true) :
    ∀ i ≥ j + 1, leftDiagonal (m + 2) i = false := by
  sorry

/-- **The converse: a white diagonal makes the pair before it a shift.** If
diagonal `m + 2` is white from `N` on, then diagonal `m` read two cells later
equals diagonal `m + 1` read one cell later, from `N` on. -/
theorem leftDiagonal_shift_of_white (m N : ℕ)
    (hw : ∀ i ≥ N, leftDiagonal (m + 2) i = false) :
    ∀ i ≥ N, leftDiagonal m (i + 2) = leftDiagonal (m + 1) (i + 1) := by
  sorry

/-- **Black stays black once the diagonal before it has gone white.** With
diagonal `m + 1` white from `N` on and diagonal `m + 2` black at `j + 1`,
diagonal `m + 3` is black from `j + 1` on. Rowland 2006, lines 905–908. -/
theorem leftDiagonal_black_after_white (m N j : ℕ) (hNj : N ≤ j)
    (hw : ∀ i ≥ N, leftDiagonal (m + 1) i = false)
    (hb : leftDiagonal (m + 2) (j + 1) = true) :
    ∀ i ≥ j + 1, leftDiagonal (m + 3) i = true := by
  sorry

/-- **Past an all-black diagonal the next one is a complement.** If diagonal
`m + 3` is black from `N` on then diagonal `m + 4` is the negation of
diagonal `m + 2`, shifted by one. This is where the period doubling comes
from: a complement has twice the period of what it complements. -/
theorem leftDiagonal_compl_after_black (m N : ℕ)
    (hb : ∀ i ≥ N, leftDiagonal (m + 3) i = true) :
    ∀ i ≥ N, leftDiagonal (m + 4) (i + 1) = !leftDiagonal (m + 2) (i + 2) := by
  sorry

/-! ### The two masking laws of the transient band

Seeded 2026-09-08 from blueprint/crystals.md item 50 (Sextant's C1),
kernel-checked in `explorer/scratch_masking.lean`. A cell is *transient*
when it differs from the same diagonal read one shift `M` later; with
`M = 2 ^ k` that difference is what the settled word has already forgotten.
These two say when a transient survives one step and when a settled cell
is protected from one. New phrasing of `rule30_left_local_law` in diagonal
coordinates; Wolfram 1986 §5 states the first in words for the difference
pattern of two random rows. -/

/-- **The front's law.** A transient on diagonal `k + 2` at `j`, with the
two cells to its left settled at the same shift, continues to `j + 1`
exactly when its driver cell on diagonal `k + 1` is white. -/
theorem leftDiagonal_transient_front_law (k j M : ℕ)
    (hT : leftDiagonal (k + 2) j ≠ leftDiagonal (k + 2) (j + M))
    (h1 : leftDiagonal (k + 1) (j + 1) = leftDiagonal (k + 1) (j + 1 + M))
    (h0 : leftDiagonal k (j + 2) = leftDiagonal k (j + 2 + M)) :
    (leftDiagonal (k + 2) (j + 1) ≠ leftDiagonal (k + 2) (j + 1 + M))
      ↔ leftDiagonal (k + 1) (j + 1) = false := by
  sorry

/-- **The masking law.** A settled cell on diagonal `k + 2` at `j`, sitting
under a transient driver, stays settled at `j + 1` exactly when its own
cell is black — so a black cell masks the transient above it. -/
theorem leftDiagonal_transient_mask_law (k j M : ℕ)
    (hc : leftDiagonal (k + 2) j = leftDiagonal (k + 2) (j + M))
    (hT : leftDiagonal (k + 1) (j + 1) ≠ leftDiagonal (k + 1) (j + 1 + M))
    (h0 : leftDiagonal k (j + 2) = leftDiagonal k (j + 2 + M)) :
    (leftDiagonal (k + 2) (j + 1) ≠ leftDiagonal (k + 2) (j + 1 + M))
      ↔ leftDiagonal (k + 2) j = false := by
  sorry

/-- **The front's law at each diagonal's own period.** `leftDiagonal_transient_front_law`
with every shift taken to be that diagonal's own power of two, which is the
form an argument about the settled word actually cites. -/
theorem leftDiagonal_transient_front_law_pow (k j : ℕ)
    (hT : leftDiagonal (k + 2) j ≠ leftDiagonal (k + 2) (j + 2 ^ (k + 2)))
    (h1 : leftDiagonal (k + 1) (j + 1) = leftDiagonal (k + 1) (j + 1 + 2 ^ (k + 1)))
    (h0 : leftDiagonal k (j + 2) = leftDiagonal k (j + 2 + 2 ^ k)) :
    (leftDiagonal (k + 2) (j + 1) ≠ leftDiagonal (k + 2) (j + 1 + 2 ^ (k + 2)))
      ↔ leftDiagonal (k + 1) (j + 1) = false := by
  sorry

/-! ## P1 — the settled configuration: the left side of the picture as a row of its own

Seeded 2026-09-07 from blueprint/crystals.md items 46–47, out of Sextant's
fourth attack. Definitions `settledCenter` and `settledConfig` in
Rule30/Basic.lean under "The settled configuration". -/

/-- **The settled centre column is well defined.** Read the seed's picture
down any column whose distance from the origin is a multiple of `2 ^ k` and
at least `2 ^ k`: the `k`-th cell below the left edge is `settledCenter k`
whichever such column is read. `leftDiagonal_periodicFrom_pow` gives an onset
`N ≤ 2 ^ k` and period `2 ^ k`; induct on `m` from `2 ^ k`, each step one
application of the period at an index `≥ 2 ^ k ≥ N`. -/
theorem leftDiagonal_mul_pow_eq_settledCenter (k m : ℕ) (hm : 1 ≤ m) :
    leftDiagonal k (m * 2 ^ k) = settledCenter k := by
  sorry

/-- **The settled picture is the rule 30 evolution of the settled row.** Grow
`settledConfig` for `t` steps and every cell at position `x ≥ -t` is the
settled word of diagonal `t + x` at index `-x`, read from the seed's picture
at `2 ^ (t + x + 1) - x`, an index past that diagonal's onset and congruent
to `-x` modulo its period. So the settled region, with the words extended
periodically to every index, is itself a rule 30 orbit, and its centre column
is `settledCenter`. Induction on `t`: the cell at `t + 1` is `rule30_eq` on its
three neighbours at `t`, each given by the hypothesis; move the four
`leftDiagonal` indices to one common frame by `leftDiagonal_mul_pow_eq_settledCenter`'s
periodicity (each shift is a multiple of that diagonal's `2 ^ k`), and
`leftDiagonal_recurrence` at that frame is the rule at those three cells. At
`x = -t` and `x = -t - 1` the neighbours are outside the cone and the edge
diagonals (`evolve_left_edge`, `evolve_left_second_diagonal`,
`evolve_left_third_diagonal`) close it. -/
theorem column_settledConfig_eq (t : ℕ) (x : ℤ) (hx : -(t : ℤ) ≤ x) :
    column settledConfig x t
      = leftDiagonal (t + x).toNat (2 ^ ((t + x).toNat + 1) - x).toNat := by
  sorry

/-- A trivially true statement that exists only so the harness's verifier
tests have something to prove without touching a real node's proof file. It
is deliberately absent from `blueprint/dag.json`. -/
theorem harness_probe : True := by
  sorry


/-! ## P1 — the right diagonals: exact periods on the side with no transients

Seeded 2026-09-08 from Sextant's attack on
`rightDiagonal_period_doubles_iff_odd_weight`, out of Portage's first
connector sighting. The right diagonals are periodic from their very first
term (`rightDiagonal_periodicFrom_pow`), so unlike the left family there is
no transient anywhere and index `0` — the centre column — is not buried in
one. These three settle the doubling half of the criterion and the depth
immediately after each doubling; what stays open is the interior of a
plateau. -/

/-- **An odd driver makes the next right diagonal antiperiodic, and pins its
minimal period at `2 * L`.** If the driver `g` has odd weight over one period
`L`, every cell of diagonal `k + 2` is the complement of the cell `L` later,
so `2 * L` is a period and `L` is not. Stated as that pair because the board
has no `minimalPeriod` for `ℕ → Bool`; it pins the minimum anyway, since every
period here is a power of two dividing `2 ^ k`, and the only such power
dividing `2 * L` but not `L` is `2 * L`.

The doubling half of the criterion, and the reason the other half is hard:
this argument never needs to know the driver has no shorter period, and the
non-doubling half does. -/
theorem rightDiagonal_antiperiodic_of_odd_driver (k L : ℕ)
    (hL0 : PeriodicFrom (rightDiagonal k) L 0)
    (hL1 : PeriodicFrom (rightDiagonal (k + 1)) L 0)
    (hodd : Odd ((Finset.range L).sum
      (fun j => if rightDiagonal (k + 1) (j + 1) || rightDiagonal k (j + 2) then 1 else 0))) :
    (∀ j, rightDiagonal (k + 2) (j + L) = ! rightDiagonal (k + 2) j)
      ∧ PeriodicFrom (rightDiagonal (k + 2)) (2 * L) 0
      ∧ ¬ PeriodicFrom (rightDiagonal (k + 2)) L 0 := by
  sorry

/-- **No right diagonal past the edge is constant.** Every `rightDiagonal k`
with `k ≥ 1` takes both colours. `rightDiagonal 0` is the right edge and is
constantly black (`evolve_right_edge`); it is the only one.

The first statement on this board that says a right diagonal is never
degenerate. The proof is a descent: if a diagonal is constant its driver is
identically white, which forces the two diagonals inside it white from an
index, and a sequence periodic from `0` that is white from an index is white
everywhere — so the descent ends at `rightDiagonal 1`, which alternates. -/
theorem rightDiagonal_not_constant (k : ℕ) (hk : 1 ≤ k) :
    (∃ j, rightDiagonal k j = true) ∧ (∃ j, rightDiagonal k j = false) := by
  sorry

/-- **Right after a doubling the driver keeps the full period.** If `q` is a
period of diagonal `k` and diagonal `k + 1` is antiperiodic at `q` — which is
exactly what the previous depth doubling gives — then the driver differs from
its own `q`-shift exactly where diagonal `k` is white.

So the driver has period `q` only if diagonal `k` is constantly black, which
`rightDiagonal_not_constant` forbids for `k ≥ 1`. This is why the one anomaly
in the measured picture sits at `k = 2`: there the diagonal two out is the
black right edge, the excluded case. -/
theorem rightDiagonal_driver_flip_iff_white (k q : ℕ)
    (hq : PeriodicFrom (rightDiagonal k) q 0)
    (hanti : ∀ j, rightDiagonal (k + 1) (j + q) = ! rightDiagonal (k + 1) j) (j : ℕ) :
    ((rightDiagonal (k + 1) (j + 1) || rightDiagonal k (j + 2))
        ≠ (rightDiagonal (k + 1) (j + q + 1) || rightDiagonal k (j + q + 2)))
      ↔ rightDiagonal k (j + 2) = false := by
  sorry

/-- **A shared period carries inwards past every diagonal that stays black.**
If diagonals `m` and `m + 1` share the period `q` from `N` on, and each of the
next `n` diagonals inwards has black cells arbitrarily far out, then some pair
`m + n`, `m + n + 1` still shares `q`. This is the reduction the period wall
needs: it turns a bound on the period of diagonal `k` into a statement about
how many of the first `k` diagonals are eventually white.

Parked by Vesper at `leftDiagonal_period_le` attempt 1
(`runs/20260908T205802Z/leftDiagonal_period_le-1/`), which abandoned that node
and proved this instead. -/
theorem leftDiagonal_period_le_of_black_between (m q N n : ℕ)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N)
    (hb : ∀ i < n, ∀ J : ℕ, ∃ j ≥ J, leftDiagonal (m + 1 + i) j = true) :
    ∃ M, PeriodicFrom (leftDiagonal (m + n)) q M ∧
      PeriodicFrom (leftDiagonal (m + n + 1)) q M := by
  sorry

/-- **Bridge to the row model.** Diagonal `k` at index `j` is bit `k` of the
packed row `j + k`. So the first `k + 1` left diagonals are the low `k + 1` bits
of `rowNat`, an autonomous finite system — which is what lets the onset wall be
stated as a claim about the orbit of `1` under a truncated bit map.

Proved by Selvage at `leftDiagonal_onset_le` attempt 2
(`runs/20260908T124200Z/leftDiagonal_onset_le-2/`), which did not close that
node; seeded here so the bridge is importable. -/
theorem leftDiagonal_eq_rowNat_testBit (k j : ℕ) :
    leftDiagonal k j = (rowNat (j + k)).testBit k := by
  sorry

/-- **The onset wall, conditional on its own boundary line.** If at every step
the settled neighbour on the half-speed line is black, or the new diagonal
already agrees with itself one period later just inside the line, then every
diagonal has settled by index `k`. This is the onset induction with nothing
hidden: what remains is the one Boolean condition per diagonal, true for the
seed by measurement and unproved.

Proved by Selvage at `leftDiagonal_onset_le` attempt 2
(`runs/20260908T124200Z/leftDiagonal_onset_le-2/`), which did not close that
node; seeded here so the reduction is importable. -/
theorem leftDiagonal_onset_le_of_line
    (h : ∀ m, leftDiagonal (m + 1) (m + 2) = true ∨
      leftDiagonal (m + 2) (m + 1 + 2 ^ (m + 2)) = leftDiagonal (m + 2) (m + 1))
    (k : ℕ) : ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N := by
  sorry

/-- **The even-driver mirror: the period stays at `L` rather than doubling.**
`rightDiagonal_periodicFrom_step` gives `2 * q` unconditionally; when the driver
has even weight over one period the doubling does not happen and `L` itself is a
period. By `rightDiagonal_recurrence` the diagonal two out advances by the XOR of
the driver over the window, and the driver has period `L` because both diagonals
feeding it do — so that sum is the same for every `j` and equals the weight
parity.

This is the even branch of the doubling criterion stated about *a* period rather
than the *minimal* one, which is what makes it provable: minimality is the hard
part and is not claimed here. Handed over by Portage (connector, 2026-09-08),
which type-checked the signature in `explorer/portage_scratch_evendriver.lean`. -/
theorem rightDiagonal_periodicFrom_step_of_even_driver (k L : ℕ)
    (hL0 : PeriodicFrom (rightDiagonal k) L 0)
    (hL1 : PeriodicFrom (rightDiagonal (k + 1)) L 0)
    (heven : Even ((Finset.range L).sum
      (fun j => if rightDiagonal (k + 1) (j + 1) || rightDiagonal k (j + 2) then 1 else 0))) :
    PeriodicFrom (rightDiagonal (k + 2)) L 0 := by
  sorry

/-- **A column cohomologous to the centre column inherits its periodicity.**
If the XOR of some column with the centre column is eventually periodic, and the
centre column is eventually periodic, then that column is too. The enabling half
of the coboundary reading: a *difference* of two fibres is the natural object
there, where "a column repeats" is not.

Handed over by Portage (connector, 2026-09-08), which type-checked the signature
in `explorer/portage_scratch_evendriver.lean`. The unconditional companion — is
any such difference eventually periodic at all? — is deliberately not seeded: it
is measured false to `p ≤ 4096` over 1,616 pairs and belongs to a theorist as an
obstruction, not to a prover as a node. -/
theorem centerColumn_other_of_cohomologous_column (x : ℤ) (j : ℕ) (hx : x ≠ 0)
    (hd : ∃ p > 0, ∃ N, PeriodicFrom (fun t => xor (centerColumn t) (evolve (t + j) x)) p N)
    (hc : ∃ p > 0, ∃ N, PeriodicFrom centerColumn p N) :
    ∃ p > 0, ∃ N, PeriodicFrom (fun t => evolve t x) p N := by
  sorry

/-- **The right diagonals' periods are unbounded.** For every `p > 0` some right
diagonal fails to be `p`-periodic. This is the exact right-side counterpart of
the proved `leftDiagonal_period_unbounded`, which the right side has been
missing.

Two differences from the left version, both making this the simpler statement:
no `∀ N`, because the right diagonals have no transients and are periodic from
their first cell; and it is stated for every `p` rather than for powers of two,
which is free rather than strong — for odd `p` it already holds of
`rightDiagonal 1`, and all the content sits at `p = 2 ^ a`.

The proof rests on the cone and nothing stronger. Let `m` be the distance from
the right edge of row `p` to the next black cell; then the row at time `p`, slid
left by `p`, agrees with the seed's row everywhere right of `-m` and differs at
`-m`, so by `rightmost_difference_moves_right` that difference reaches the
origin at time exactly `m`. Hence diagonal `m` is not `p`-periodic.

Route written out and kernel-checked by Sextant (theorist, 2026-09-08) in
`explorer/scratch_rightunbounded_proof.lean`: no `sorry`, and `#print axioms`
gives exactly `[propext, Classical.choice, Quot.sound]`. Re-verified by the
captain at seed time. -/
theorem rightDiagonal_period_unbounded (p : ℕ) (hp : 0 < p) :
    ∃ k, ¬ PeriodicFrom (rightDiagonal k) p 0 := by
  sorry

/-- **Rule 30 commutes with a spatial translation.** One step applied to a
shifted configuration is the step applied first and then read shifted. The
automaton has no preferred origin; the seed does. Recovered from Sextant's
`explorer/scratch_rightunbounded_proof.lean`, where it is proved and unused by
anything on the board. -/
theorem rule30_translate (c : Config) (s i : ℤ) :
    rule30 (fun x => c (x + s)) i = rule30 c (i + s) := by
  sorry

/-- **So does the whole evolution.** `rule30_translate` carried up the
iteration by induction on `t`. -/
theorem evolveFrom_translate (c : Config) (s : ℤ) (t : ℕ) (i : ℤ) :
    evolveFrom (fun x => c (x + s)) t i = evolveFrom c t (i + s) := by
  sorry

/-- **Growing from row `p` is reading the picture `p` rows later.** -/
theorem evolveFrom_evolve (p t : ℕ) : evolveFrom (evolve p) t = evolve (t + p) := by
  sorry

/-- **Exactly where the slid row first disagrees with the seed's.** Let `m` be
the distance from the right edge of row `p` to the next black cell. Then row `p`
slid left by `p` agrees with the seed's row for every earlier time and differs
at time exactly `m` — not merely eventually, but at `m` and not before.

This is the sharp form of what `rightDiagonal_period_unbounded` uses: that
theorem needs only *some* failure, while this says which one. Recovered from
`explorer/scratch_rightunbounded_proof.lean`. -/
theorem rightDiagonal_first_failure (p m : ℕ) (hm : 0 < m)
    (hwhite : ∀ d : ℕ, 0 < d → d < m → evolve p ((p : ℤ) - (d : ℤ)) = false)
    (hblack : evolve p ((p : ℤ) - (m : ℤ)) = true) :
    (∀ t, t < m → evolve (t + p) (p : ℤ) = evolve t 0)
      ∧ evolve (m + p) (p : ℤ) ≠ evolve m 0 := by
  sorry

/-- **The least period divides every period.** The periods of a sequence
periodic from `0` are closed under subtraction, so the least positive one
divides all of them. This is the bridge that makes `minimalPeriod` usable:
with `rightDiagonal_periodicFrom_pow` it gives that each right diagonal's least
period divides `2 ^ k` and so is itself a power of two, which is what turns the
doubling dichotomy into a statement about the minimal period rather than about
some period. -/
theorem minimalPeriod_dvd (f : Nat → Bool) (p : Nat) (hp : 0 < p)
    (h : PeriodicFrom f p 0) : minimalPeriod f ∣ p := by
  sorry

/-- **One cohomologous column would prove Prize 1.** If some column other than
the centre is cohomologous to it — their XOR is eventually periodic — then the
centre column is not eventually periodic. Immediate from
`centerColumn_other_of_cohomologous_column` and Jen's uniqueness: the
hypothesis would make two distinct columns eventually periodic.

This is a genuine sufficient condition, unlike the wall, and it is worth having
precisely because the route is measured dead: 0 survivors over 38,700 pairs.
Recording it says what would have worked. Kernel-checked by Sextant in
`explorer/sextant_scratch_coboundary.lean`. -/
theorem centerColumn_not_isEventuallyPeriodic_of_cohomologous (x : ℤ) (j : ℕ)
    (hx : x ≠ 0)
    (hd : ∃ p > 0, ∃ N, PeriodicFrom (fun t => xor (centerColumn t) (evolve (t + j) x)) p N) :
    ¬ (∃ p > 0, ∃ N, PeriodicFrom centerColumn p N) := by
  sorry

/-- **Damage is not a dynamical object.** The XOR of two configurations does not
determine the XOR of their successors: there are `X, Y, X', Y'` agreeing
everywhere on their difference whose successors' differences disagree
somewhere.

So the difference pattern between two rule 30 pictures is not itself a cellular
automaton, and no argument may treat "the damage" as a system evolving on its
own. Rule 30 is not additive, and this is the sharp form of that. Kernel-checked
by Sextant in `explorer/sextant_scratch_coboundary.lean`. -/
theorem damage_not_autonomous :
    ∃ X Y X' Y' : Config, (∀ i, xor (X i) (Y i) = xor (X' i) (Y' i)) ∧
      ∃ i, xor (rule30 X i) (rule30 Y i) ≠ xor (rule30 X' i) (rule30 Y' i) := by
  sorry

/-- **No two adjacent columns differ for ever.** For every `i` it is false that
`evolve t i ≠ evolve t (i + 1)` from some row on. Unconditional, and a genuine
structural fact about the picture rather than a conditional or a measurement.
Kernel-checked by Sextant in `explorer/sextant_scratch_coboundary.lean`. -/
theorem adjacent_difference_not_eventually_one (i : ℤ) :
    ¬ ∃ N, ∀ t ≥ N, evolve t i ≠ evolve t (i + 1) := by
  sorry

/-- **The centre column does not determine the seed.** For every `k` there is a
configuration whose rightmost black cell sits at `2 * k` and which has rule 30's
own centre column from row 1 on. Distinct `k` give distinct configurations, so
infinitely many finite configurations share the seed's centre column.

Sextant's "right-edge shield": black cells added at `2, 4, …, 2k` cancel their
own influence on column `0`. It bears on Prize 3 rather than Prize 1 — recovering
the initial condition from the centre column is not merely hard, it is
impossible. Kernel-checked as `chainCfg_center_column`, `chainCfg_shape` and
`chainCfg_injective` in `explorer/sextant_scratch_shield_general.lean`; stated
here existentially so it needs no auxiliary definition in `Basic`. -/
theorem exists_config_same_centerColumn (k : ℕ) :
    ∃ c : Config, c (2 * k : ℤ) = true ∧
      (∀ i : ℤ, (2 * k : ℤ) < i → c i = false) ∧
      (∀ t : ℕ, 1 ≤ t → column c 0 t = centerColumn t) := by
  sorry

end Statements
