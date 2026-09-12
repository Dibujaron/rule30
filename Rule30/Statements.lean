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

/-- **The onset wall is a statement about arithmetic.** The `k`-th left diagonal
settles by index `k`, for every `k`, exactly when the low `k + 1` bits of row
`2 * k` and row `2 * k + 2 ^ k` agree — for every `k`.

The left-hand side is about diagonals and periods; the right-hand side is about
two rows of the picture read as binary numbers. `rowNat` packs a row, and
`leftDiagonal_eq_rowNat_testBit` is the bridge. This does not prove the wall: it
says the wall is a return property of the map `n ↦ rowNat n` modulo powers of
two, which is a different object to attack and one an arithmetic argument can
reach.

Proved by Vesper at `leftDiagonal_onset_le` attempt 4
(`runs/20260909T165940Z/leftDiagonal_onset_le-4/`), which abandoned the wall
itself; re-verified by the captain, axioms exactly the three permitted. -/
theorem leftDiagonal_onset_le_iff_rowNat_return :
    (∀ k, ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N) ↔
    ∀ k, rowNat (2 * k) % 2 ^ (k + 1) = rowNat (2 * k + 2 ^ k) % 2 ^ (k + 1) := by
  sorry

/-- **A white run on a diagonal is an agreement run of the two beneath it.**
Given that diagonals `m + 2` and `m + 3` already agree one cell back, they agree
at the next cell exactly when either the driving cell is black and the two
diagonals two deeper agree, or the driving cell is white and the diagonal `m` is
white there.

This is the local mechanism the onset wall turns on: agreement cascades two
diagonals shallower per cell, which is where the factor of two in the
quarter-speed picture comes from. Proved by Vesper at the same attempt; axioms
`[propext, Quot.sound]`, not even needing choice. -/
theorem leftDiagonal_agree_succ_iff (m i : ℕ)
    (h : leftDiagonal (m + 2) (i + 2) = leftDiagonal (m + 3) (i + 1)) :
    leftDiagonal (m + 2) (i + 3) = leftDiagonal (m + 3) (i + 2) ↔
      (leftDiagonal (m + 3) (i + 1) = true ∧
          leftDiagonal m (i + 4) = leftDiagonal (m + 1) (i + 3)) ∨
      (leftDiagonal (m + 3) (i + 1) = false ∧ leftDiagonal m (i + 4) = false) := by
  sorry

/-- **The inductive step for the onset wall's arithmetic form.** Given that rows
`T` and `T + p` already agree on their low `n + 1` bits, their successors agree
on the low `n + 2` bits exactly when either bit `n` of `rowNat T` is set, or the
two rows already agreed on `n + 2` bits.

This is the recursion `leftDiagonal_onset_le_iff_rowNat_return` turns the wall
into: the return property propagates one bit at a time, and the condition for it
to keep propagating is a single bit of the current row. An inductive proof of the
wall goes through here or not at all.

Proved by Cadence at `leftDiagonal_onset_le` attempt 5
(`runs/20260909T171155Z/leftDiagonal_onset_le-5/`), which abandoned the wall
itself; re-verified by the captain, axioms exactly the three permitted. -/
theorem rowNat_return_succ_iff (n T p : ℕ)
    (h : rowNat T % 2 ^ (n + 1) = rowNat (T + p) % 2 ^ (n + 1)) :
    rowNat (T + 1) % 2 ^ (n + 2) = rowNat (T + p + 1) % 2 ^ (n + 2) ↔
      ((rowNat T).testBit n = true ∨
        rowNat T % 2 ^ (n + 2) = rowNat (T + p) % 2 ^ (n + 2)) := by
  sorry

/-- **Rule 30 as a run-boundary rule.** A cell is black at the next step exactly
when it sits at one of three local run boundaries: it is black with a white cell
to its left, or it is white with a black left neighbour and a white right
neighbour, or it is white with a black right neighbour and a white left
neighbour.

This is rule 30 restated so that its condition is about *edges between runs*
rather than about an XOR. It is the same rule — the proof is case analysis on
three Booleans — but the presentation matters: every proof in print that an
explicitly defined computable sequence is not eventually periodic reads a
definition that is already about repetition (Kolakoski is its own run-length
encoding; Ehrenfeucht–Mycielski complements after the longest repeated suffix),
and rule 30's usual definition is not. Kernel-checked by Meridian (connector,
2026-09-09) in `explorer/meridian_scratch_runs.lean`, axioms `[propext]`. -/
theorem rule30_run_boundary (c : Config) (i : ℤ) :
    rule30 c i = true ↔
      (c i = true ∧ c (i - 1) = false) ∨
      (c i = false ∧ c (i - 1) = true ∧ c (i + 1) = false) ∨
      (c i = false ∧ c (i + 1) = true ∧ c (i - 1) = false) := by
  sorry

/-- **The centre column reads a run boundary at the origin.** `centerColumn
(t + 1)` is black exactly when row `t` has one of the three run-boundary
patterns at position `0`.

So the centre column is the trace, at a fixed site, of where the runs of the
picture begin and end — a statement about repetition in the row, which is the
shape every published aperiodicity proof needs and which the XOR presentation
hides. It does not by itself give a proof. Kernel-checked by Meridian in the
same file. -/
theorem centerColumn_run_boundary (t : ℕ) :
    centerColumn (t + 1) = true ↔
      (evolve t 0 = true ∧ evolve t (-1) = false) ∨
      (evolve t 0 = false ∧ evolve t (-1) = true ∧ evolve t 1 = false) ∨
      (evolve t 0 = false ∧ evolve t 1 = true ∧ evolve t (-1) = false) := by
  sorry

/-- **The rows, modulo `2 ^ n`, are the orbit of `1` under one integer
operation.** With `stepMod n r = rowStep r % 2 ^ n` from `Rule30.Basic` — rule
30 applied to a whole row at once, as a single bit-twiddle on a natural number,
truncated to `n` bits — the seed's row `t` reduced mod `2 ^ n` is exactly
`(stepMod n)^[t]` applied to `1`.

This is `rowCell_eq_evolve` and `rowNat` pushed to their conclusion: the picture
below the cone is the forward orbit of `1` under a map from `Fin (2 ^ n)` to
itself. Proved by Cadence at `leftDiagonal_onset_le` attempt 6; axioms
`[propext, Quot.sound]`. -/
theorem rowNat_mod_eq_iterate (n t : ℕ) :
    rowNat t % 2 ^ n = (stepMod n)^[t] (1 % 2 ^ n) := by
  sorry

/-- **The onset wall reduces to a preperiod bound for a finite map.** If for every
`k` and every start `x < 2 ^ (k + 1)` the orbit of `x` under the truncated step
`stepMod (k + 1)` is repeating from step `2 * k` on, then every left diagonal
has settled by its own index.

The hypothesis mentions no cellular automaton: it says a map on the integers mod
`2 ^ (k + 1)` — take `r`, form `4 * r XOR (2 * r OR r)`, truncate — has preperiod
at most `2 * k` from **every** start. That is stronger than needed, since only
the start `1` is used, and it is stated in the strong form because that is what
the survey measures.

Proved by Cadence at `leftDiagonal_onset_le` attempt 6
(`runs/20260909T173028Z/leftDiagonal_onset_le-6/`), which abandoned the wall
itself for the sixth time; re-verified by the captain, axioms exactly the three
permitted. -/
theorem leftDiagonal_onset_le_of_stepMod_preperiod
    (H : ∀ k x : ℕ, x < 2 ^ (k + 1) → ∃ p > 0, ∀ t ≥ 2 * k,
      (stepMod (k + 1))^[t + p] x
        = (stepMod (k + 1))^[t] x) :
    ∀ k, ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N := by
  sorry

/-- **The onset wall, with no cellular automaton in it: an equivalence.** Every
left diagonal has settled by its own index if and only if, for every `k`, the
orbit of `1` under the truncated step `rowStep` modulo
`2 ^ (k + 1)` takes the same value at times `2 * k` and `2 * k + 2 ^ k`.

The right-hand side mentions no diagonal, no configuration, no evolution: it is
a return condition on the forward orbit of a single number under one integer
operation. Rule 30's whole content, for this wall, is that bit-twiddle.

This composes two theorems already on the board and nothing else —
`leftDiagonal_onset_le_iff_rowNat_return` for the equivalence and
`rowNat_mod_eq_iterate` to rewrite each side. It is seeded as a node rather
than asserted because the captain had been repeating the composition from his
own reading, which is not the same as a checked theorem, and a claim of this
size is exactly the kind this project's rules say a reading cannot settle.

Note the contrast with `leftDiagonal_onset_le_of_stepMod_preperiod`, which is
an *implication* from a strictly stronger hypothesis quantified over every
start below `2 ^ (k + 1)`. This is the equivalence, and it needs only the orbit
of `1`. -/
theorem leftDiagonal_onset_le_iff_stepMod_return :
    (∀ k, ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N) ↔
    ∀ k : ℕ,
      (stepMod (k + 1))^[2 * k] (1 % 2 ^ (k + 1))
        = (stepMod (k + 1))^[2 * k + 2 ^ k]
            (1 % 2 ^ (k + 1)) := by
  sorry

/-- **The damage front's equation of motion.** Two configurations that agree
just left of `i` and differ at `i` — the shape of the leftmost disagreement
between two rule 30 pictures — have successors whose disagreement at `i` is
determined exactly: it is the complement of the background's next cell, XORed
with a correction that fires only where the background is black and the two
pictures already differ one further right.

This is the local law the whole damage-front programme rests on, and it says
the front's survival is decided by three cells. Kernel-proved by Alidade
(connector, 2026-09-09) in `explorer/alidade_scratch_survival.lean` with axioms
`[propext]` — not even `Quot.sound`. -/
theorem front_survival (c d : Config) (i : ℤ)
    (hl : c (i - 1) = d (i - 1)) (hc : c i = ! d i) :
    xor (rule30 c i) (rule30 d i)
      = xor (! d (i + 1)) (d i && xor (c (i + 1)) (d (i + 1))) := by
  sorry

/-- **Where the background is white, the front simply advances.** With the same
front shape and a white background cell, the correction term vanishes and the
disagreement propagates as the complement of the background's next cell. -/
theorem front_survival_of_white (c d : Config) (i : ℤ)
    (hl : c (i - 1) = d (i - 1)) (hc : c i = ! d i) (h0 : d i = false) :
    xor (rule30 c i) (rule30 d i) = ! d (i + 1) := by
  sorry

/-- **A leading block of length one gives the same conclusion, whatever the
background does.** If the two pictures agree again one cell to the right, the
correction term vanishes for a different reason and the front advances
regardless of the background's colour. -/
theorem front_survival_of_agree (c d : Config) (i : ℤ)
    (hl : c (i - 1) = d (i - 1)) (hc : c i = ! d i) (h1 : c (i + 1) = d (i + 1)) :
    xor (rule30 c i) (rule30 d i) = ! d (i + 1) := by
  sorry

/-- **The onset wall holds for every `k` up to 5000, by kernel computation.**
Not an argument: `decide +kernel` evaluates the arithmetic return condition at
every `k ≤ 5000` and the Lean kernel checks the evaluation.

The interesting part is the period it uses. The condition that closes is
`rowNat (2 * k) % 2 ^ (k + 1) = rowNat (2 * k + 16) % 2 ^ (k + 1)` — the same
constant `16` at every `k`, not a period growing with the depth. So over the
verified range the wall holds with a *bounded* return period, which is far
stronger than the wall asks and is the shape a proof would want to exploit.

Proved by Cadence at `leftDiagonal_onset_le` attempt 6; surfaced by the stray
sweep. -/
theorem leftDiagonal_onset_le_of_le_5000 (k : ℕ) (hk : k ≤ 5000) :
    ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N := by
  sorry

/-- **The stepMod preperiod hypothesis holds to width 11, for every start.**
For every `k ≤ 11` and every `x < 2 ^ (k + 1)`, iterating the truncated step
`stepMod (k + 1)` four extra times from step `2 * k` returns to where it was.
Kernel-checked by `decide +kernel` over every start, not sampled.

This is the universal hypothesis of
`leftDiagonal_onset_le_of_stepMod_preperiod` verified exhaustively at small
width, with period `4` rather than the `16` the orbit of `1` needs — the
all-starts statement closes faster than the single orbit does. Proved by
Cadence at `leftDiagonal_onset_le` attempt 6; surfaced by the stray sweep. -/
theorem stepMod_preperiod_le_of_le_11 : ∀ k ≤ 11, ∀ x < 2 ^ (k + 1),
    (stepMod (k + 1))^[2 * k + 4] x
      = (stepMod (k + 1))^[2 * k] x := by
  sorry

/-- **Rule 30's row map commutes with doubling.** With `rowStep` from
`Rule30.Basic` for rule 30 applied to a whole row at once,
`rowStep (2 * s) = 2 * rowStep s` exactly, as natural numbers.

In the picture: doubling a row slides it one cell further in from the black
left edge, and rule 30 does not notice, because the cell outside is white
either way. So the even states of the truncated map are a faithful copy of the
whole map one bit narrower — which is what makes the truncations a coherent
tower rather than a sequence of unrelated finite systems.

Kernel-proved by Talus (theorist, 2026-09-09) in
`explorer/talus5_scratch_halving.lean`; axioms `[propext, Quot.sound]`, no
choice. -/
theorem step_two_mul (s : ℕ) :
    rowStep (2 * s) = 2 * rowStep s := by
  sorry

/-- **Doubling commutes with the whole truncated iteration, one bit wider.**
Iterating the step modulo `2 ^ (n + 1)` from a doubled start is the same as
iterating modulo `2 ^ n` from the start and doubling at the end.

This is `step_two_mul` carried up the orbit, and it is the identity that splits
the truncation tower: the even periodic points at width `n + 1` are exactly
twice the periodic points at width `n`, so everything new at each level is odd.
Kernel-proved by Talus in the same file. -/
theorem stepMod_iterate_two_mul (n t s : ℕ) :
    (stepMod (n + 1))^[t] (2 * s)
      = 2 * (stepMod n)^[t] s := by
  sorry

/-- **The period doubles once per eventually-white diagonal, and by nothing
else.** Carry two neighbouring left diagonals that share a period `q` from `N`
on. Step inward `n` times; each step either leaves the period alone, or passes
a diagonal that is white for ever and at most doubles it. So the period `n`
diagonals in is `q` times two to the power of however many eventually-white
diagonals were passed, counted by any nondecreasing `w`.

This is the reduction half of `leftDiagonal_period_le`, and it is exactly
`leftDiagonal_period_le_of_black_between` with the white diagonals permitted
and paid for instead of forbidden. What it leaves open is the counting half:
that at most `log2 (k+1)` of the first `k` diagonals are eventually white.

Proposed by Seeder (2026-09-09); measured on the packed row model to `k = 400`,
where the pair period rises exactly at the eventually-white diagonals
`2, 7, 28, 399` and equals two to the power of their count, so the bound is
attained and not merely respected. -/
theorem leftDiagonal_period_le_of_white_count (m q N n : ℕ) (hq : 0 < q) (w : ℕ → ℕ)
    (hw0 : w 0 = 0) (hmono : ∀ i, w i ≤ w (i + 1))
    (hstep : ∀ i < n, (∀ J, ∃ j ≥ J, leftDiagonal (m + 1 + i) j = true) ∨ w i < w (i + 1))
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
    ∃ M, PeriodicFrom (leftDiagonal (m + n)) (2 ^ w n * q) M ∧
      PeriodicFrom (leftDiagonal (m + n + 1)) (2 ^ w n * q) M := by
  sorry

/-- **Past a white diagonal, the period doubles exactly when the parity is
odd.** Once diagonal `m + 1` is white for ever, the recurrence loses a term and
diagonal `m + 2` becomes a running XOR of diagonal `m`. One period of that
driver flips it exactly when the period holds an odd number of black cells: even
parity leaves the period at `q`, odd parity makes the diagonal antiperiodic, so
its period is exactly `2q`.

The board has the other half of this criterion already — a doubling *requires*
an eventually-white predecessor. This says what a white predecessor actually
does, which is what turns "at most one doubling per white diagonal" into an
exact count. It is the argument of
`rightDiagonal_antiperiodic_of_odd_driver` read on the other edge.

Rowland (2006), Proposition 2 and Lemma 3, on the left edge. Proposed by Seeder
(2026-09-09); the running-XOR identity was checked on 11,200 instances, a check
that exists because the index alignment `N + j + 2` is the one thing here that
can silently be off by one. -/
theorem leftDiagonal_step_of_white_parity (m q N : ℕ) (hq : 0 < q)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (hwhite : ∀ j ≥ N + 1, leftDiagonal (m + 1) j = false) :
    (Even (∑ j ∈ Finset.range q, if leftDiagonal m (N + j + 2) = true then 1 else 0) →
        PeriodicFrom (leftDiagonal (m + 2)) q N) ∧
      (Odd (∑ j ∈ Finset.range q, if leftDiagonal m (N + j + 2) = true then 1 else 0) →
        ∀ n ≥ N, leftDiagonal (m + 2) (n + q) = !leftDiagonal (m + 2) n) := by
  sorry

/-- **The onset wall, reduced to one sequence of witnesses.** Hand over, for
each diagonal, a strictly increasing index at which the next diagonal is black —
or else a certificate that the next diagonal is white from there on. That is
enough to settle every diagonal `k` by its own `N k`. The black branch resets
the next diagonal with the period unchanged; the white branch costs one index
and doubles the period.

`leftDiagonal_onset_le` then follows from any such ladder with `N k ≤ k`, and
whether one exists is the wall. This is the shape eleven attempts on that wall
kept rebuilding from scratch, stated once as a theorem.

Proposed by Seeder (2026-09-09). Note what it does not give you: the greedy
ladder that always takes the next black cell reaches `N k / k = 2` by `k = 2000`,
where the truth is about `0.34 k`, because greedy cannot retreat and the real
seam does. -/
theorem leftDiagonal_onset_le_of_black_ladder (N : ℕ → ℕ)
    (hmono : ∀ k, N k < N (k + 1))
    (hwitness : ∀ k, leftDiagonal (k + 1) (N (k + 1)) = true ∨
        ∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false)
    (k : ℕ) : ∃ p > 0, PeriodicFrom (leftDiagonal k) p (N k) := by
  sorry

/-- **No two eventually-white diagonals are adjacent.** If diagonal `k` and
diagonal `k + 1` were both white for ever, so would be the pair one diagonal
further out, and the descent ends at diagonals `0` and `1`, which are black
everywhere.

The first proved fact about the *set* of eventually-white diagonals rather than
about one of its members. It improves the trivial count `k` to `k / 2`, which is
nowhere near the `log2 (k+1)` the period wall needs — but it is what stops
`leftDiagonal_period_le_of_white_count` from being read as permitting a white
diagonal at every index.

Proposed by Seeder (2026-09-09); the eventually-white diagonals below 400 are
`2, 7, 28, 399`. -/
theorem leftDiagonal_not_both_eventually_white (k : ℕ) :
    ¬ ((∃ N, ∀ j ≥ N, leftDiagonal k j = false) ∧
        ∃ M, ∀ j ≥ M, leftDiagonal (k + 1) j = false) := by
  sorry

/-- **A sequence with one period from `N` has all its periods from `N`.** If a
sequence repeats with some positive period `p` from `N` on, then any other
period it has anywhere it has from `N` on too, whatever onset that other period
arrived with.

Pure bookkeeping with no automaton in it, and harvested rather than invented: it
has now been re-proved privately inside three separate pieces of work, because
every argument that walks a ladder of diagonals has to put two periodicity facts
with different onsets and different periods on a common footing, and this is the
lemma that does it.

Proposed by Seeder (2026-09-09). -/
theorem periodicFrom_trans_period (f : ℕ → Bool) (p q N M : ℕ) (hp : 0 < p)
    (hN : PeriodicFrom f p N) (hM : PeriodicFrom f q M) : PeriodicFrom f q N := by
  sorry

/-- **The centre column is one bit of the packed row.** The cell at the centre
of row `t` is bit `t` of the number whose bits are row `t`.

The dictionary edge P1's own object was missing. Six recent nodes are stated in
the packed row model because the kernel can compute row 5000 there in a second,
where reading the automaton directly gives out near row 18 — and the centre
column had no such edge, so no fact about it could be settled by computation at
all. Geometrically it also says the centre column is every diagonal read at
index `0`.

Proposed by Seeder (2026-09-09); checked against OEIS A051023 for `t < 41`.
Supply rather than insight: it is a change of notation, every hard thing about
the centre column survives it unchanged, and no computed prefix is a theorem
about the limit. -/
theorem centerColumn_eq_rowNat_testBit (t : ℕ) : centerColumn t = (rowNat t).testBit t := by
  sorry

/-- **The lowest bit of every row is set.** Read as a binary number, every row
of the pattern is odd.

`leftDiagonal 0` is the left edge of the cone and is black at every index
(`evolve_left_edge`), and `leftDiagonal 0 t` is bit `0` of row `t`
(`leftDiagonal_eq_rowNat_testBit`); this is those two composed and nothing else.

Proposed by Seeder (2026-09-10), and it is the base case of every front
argument in the packed row model: a front starts at height 1 precisely because
any two rows agree on their lowest bit. The walk parked by onset attempts 11
and 12 had to prove it privately twice, under two names, before it could take
its first step.

DOES NOT PROVE: supply, not insight. A change of notation for a fact the board
closed long ago. It bears on no prize conjecture and gives no bound on any
onset or period. -/
theorem rowNat_testBit_zero (t : ℕ) : (rowNat t).testBit 0 = true := by
  sorry

/-- **The low bits of a row are autonomous, so an agreement is never lost.** If
two rows agree modulo `2 ^ n` at one time, every later pair of rows the same
distance apart agrees modulo `2 ^ n` too.

Truncating to the low `n` bits commutes with the step, so the truncated rows
are the orbit of `1` under `stepMod n` (`rowNat_mod_eq_iterate`, closed): two
orbit points that coincide at `T` coincide for ever after.

Proposed by Seeder (2026-09-10). Harvest rather than invention, and that is the
argument for the node: it has been re-proved privately three times in three
sessions under three names — inside `leftDiagonal_onset_le_iff_rowNat_return`,
as `iterate_eq_of_eq` inside `leftDiagonal_onset_le_of_le_5000`, and as part of
`agree_bdry` in the walk parked by onset attempts 11 and 12.

DOES NOT PROVE: pure bookkeeping about a deterministic map on finitely many
states. It says agreement is never *lost*, not that it is ever *gained* —
gaining a bit is `rowNat_return_succ_iff`, already closed, and how often that
succeeds is the wall. -/
theorem rowNat_agree_forward (n T p t : ℕ) (hTt : T ≤ t)
    (h : rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) :
    rowNat t % 2 ^ n = rowNat (t + p) % 2 ^ n := by
  sorry

/-- **The onset wall in one congruence per diagonal.** If rows `T` and `T + p`
agree on their low `k + 1` bits at any one time `T ≤ 2 * k`, then diagonal `k`
has period `p` from index `k`.

Diagonal `k` at index `j` is bit `k` of row `j + k`
(`leftDiagonal_eq_rowNat_testBit`), so "diagonal `k` has settled by index `k`"
asks exactly that rows `T` and `T + p` agree on bit `k` for every `T ≥ 2 * k` —
and agreement at one `T` suffices because the low bits are autonomous
(`rowNat_agree_forward`). The hypothesis `T ≤ 2 * k` is what makes `j + k ≥ T`
available at every `j ≥ k`; it is tight, not incidental.

Proposed by Seeder (2026-09-10). This is the interface every packed-row attempt
on the wall has wanted, and it is strictly freer than either closed reduction:
`leftDiagonal_onset_le_iff_rowNat_return` pins `T = 2 * k` and `p = 2 ^ k`, and
`leftDiagonal_onset_le_of_stepMod_preperiod` demands a preperiod bound for
*every* start `x < 2 ^ (k + 1)` when only the orbit of `1` is the seed's row.
Here `T` and `p` are the prover's to choose.

DOES NOT PROVE: says nothing about whether such a congruence exists at large
`k`, which is the wall itself. The shift `p` must be allowed to vary with `k`
and this statement does — no single `p` serves every `k`, since
`leftDiagonal_period_unbounded` is proved. Not a prize conjecture; the left
edge only. -/
theorem leftDiagonal_periodicFrom_of_rowNat_agree (k p T : ℕ) (hT : T ≤ 2 * k)
    (h : rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1)) :
    PeriodicFrom (leftDiagonal k) p k := by
  sorry

/-- **The black-ladder route cannot reach the onset wall.** Any ladder meeting
`leftDiagonal_onset_le_of_black_ladder`'s own hypotheses overshoots: `N k > k`
at every `k ≥ 3`.

That closed block gives periodicity from the ladder's own `N k`, so reaching
`leftDiagonal_onset_le`'s `∃ N ≤ k` through it needs a ladder with `N k ≤ k`.
Its `hmono` is *strict*, so `N 0 < N 1 < …` already forces `N k ≥ k`, and
`N k ≤ k` at a single index pins `N` to the identity on the whole initial
segment below it. At `k = 2` the witness hypothesis then asks that diagonal 3
be black at index 3 or white from index 3 on, and diagonal 3 is black exactly
at even indices (`evolve_left_fourth_diagonal`), so it is white at 3 and black
at 4 and both branches fail.

Proposed by Seeder (2026-09-10) in the weaker form forbidding one ladder that
serves every `k`; landed by Rowan in this pointwise form, which also forbids a
ladder tailored to a single `k` and so closes the escape a prover would try
next. Both forms were elaborated before landing.

DOES NOT PROVE: does not say `leftDiagonal_onset_le_of_black_ladder` is
useless — only that it cannot yield `∃ N ≤ k` directly, because its
conclusion's onset *is* the ladder's own `N k`. A proof that uses the block and
then improves the onset by other means is untouched, as is the block read with
`hmono` weakened to `≤`. It says nothing about whether the wall is true: the
measured onsets are at most `k / 2` for every `k ≤ 722` and the wall is
believed. It bears on no prize conjecture; this is the left edge of the cone,
where periodicity is already proved. -/
theorem leftDiagonal_onset_le_not_of_black_ladder (N : ℕ → ℕ)
    (hmono : ∀ k, N k < N (k + 1))
    (hwitness : ∀ k, leftDiagonal (k + 1) (N (k + 1)) = true ∨
        ∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false)
    (k : ℕ) (hk : 3 ≤ k) : k < N k := by
  sorry

/-- **Iteration algebra: a return repeats for ever.** If the orbit of `x`
under a map comes back to where it was at time `N` after `p` more steps, then
every later time repeats with the same shift.

Proposed by Seeder (2026-09-10). Pure bookkeeping about an arbitrary
function's orbit: the plumbing every preperiod argument in the packed row
model rebuilds, stated once.

DOES NOT PROVE: it says nothing whatever about rule 30, and it is the only
node in its tier that would be equally true of any map at all. It bears on no
prize conjecture. -/
theorem stepMod_preperiod_of_return (n N p x : ℕ)
    (h : (stepMod n)^[N + p] x = (stepMod n)^[N] x) :
    ∀ t ≥ N, (stepMod n)^[t + p] x = (stepMod n)^[t] x := by
  sorry

/-- **The odd starts carry the whole problem.** A preperiod bound `B` that
holds for every odd start below `2 ^ n` holds for every start below `2 ^ n`.

The even states are a copy of the whole system one bit narrower
(`stepMod_iterate_two_mul`), so a bound proved on the odd half transports to
them. Proposed by Seeder (2026-09-10).

DOES NOT PROVE: this removes half the state space and leaves the hard half —
the odd starts are where every measured worst case lives, so it is a
reduction rather than progress on the bound. `B` is a hypothesis and not a
construction: the statement is silent on whether any `B` with the wall's
slope exists. Not a prize conjecture. -/
theorem stepMod_preperiod_of_odd (B : ℕ → ℕ) (hmono : ∀ n, B n ≤ B (n + 1))
    (H : ∀ n x : ℕ, x < 2 ^ n → x % 2 = 1 → ∃ p > 0, ∀ t ≥ B n,
      (stepMod n)^[t + p] x = (stepMod n)^[t] x) :
    ∀ n x : ℕ, x < 2 ^ n → ∃ p > 0, ∀ t ≥ B n,
      (stepMod n)^[t + p] x = (stepMod n)^[t] x := by
  sorry

/-- **Two black bits buy two bits of agreement.** If two rows already agree on
their low `n + 1` bits and bits `n` and `n + 1` are black where it matters,
the next pair of rows agrees on their low `n + 3` bits.

The packed-row twin of `leftDiagonal_periodicFrom_step_two_of_black`, and the
one of that pair that a finite range can check: read through `rowNat` it
reaches far past row 18, where reading `leftDiagonal` through `evolve` costs
`3 ^ (j + k)` and gives out. Sharpens `rowNat_return_succ_iff`, which buys one
bit, to two.

Proposed by Seeder (2026-09-10); witness holds over `T < 200`, `n < 40` at
shift `p = 16`, on the real rows.

DOES NOT PROVE: a sufficient condition, not a characterisation. The front also
advances for reasons this rule does not name, and nothing here says how often
the two black bits occur — which is the wall. -/
theorem rowNat_return_succ_two (n T p : ℕ)
    (h : rowNat T % 2 ^ (n + 1) = rowNat (T + p) % 2 ^ (n + 1))
    (hb : (rowNat T).testBit n = true)
    (hc : (rowNat T).testBit (n + 1) = true)
    (hd : (rowNat (T + p)).testBit (n + 1) = true) :
    rowNat (T + 1) % 2 ^ (n + 3) = rowNat (T + p + 1) % 2 ^ (n + 3) := by
  sorry

/-- **A black cell resets the next two diagonals at once.** Given a shared
period `q` on diagonals `m` and `m + 1`, a black cell at index `j + 1` on both
`m + 1` and `m + 2` carries that period to diagonals `m + 2` and `m + 3` with
onset `j + 1`.

Crystal 62's request, answered: it prices the levels that settle *before*
their driver's loop is cut, which is the gap between the truth (`1.25 n`) and
every reset-style induction (`2 n`). Taking two diagonals per step instead of
one moves a measured ladder from `1.99` to `1.697` against a budget of `2`.

Proposed by Seeder (2026-09-10). Deliberately a one-step rule and **not** a
ladder: a ladder's hypothesis shape is exactly what
`leftDiagonal_onset_le_not_of_black_ladder` killed, and `1.697` is a measured
slope over 5000 levels rather than a proof that the slope stays under `2`.

DOES NOT PROVE: not `leftDiagonal_onset_le`, and not a prize conjecture — the
left edge of the cone, where periodicity is already proved. No witness is
offered and the reason is stated rather than skipped: the hypotheses are
periodicity statements, which no finite range expresses, and reading
`leftDiagonal` through `evolve` costs `3 ^ (j + k)`, so a naive witness cannot
reach index 18 where the first transient lives. `rowNat_return_succ_two`
carries the witness for the same mechanism. -/
theorem leftDiagonal_periodicFrom_step_two_of_black (m q N j : ℕ) (hNj : N ≤ j)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N)
    (hblack : leftDiagonal (m + 1) (j + 1) = true)
    (hblack2 : leftDiagonal (m + 2) (j + 1) = true) :
    PeriodicFrom (leftDiagonal (m + 2)) q (j + 1) ∧
      PeriodicFrom (leftDiagonal (m + 3)) q (j + 1) := by
  sorry

/-- **A congruence at any time gives a period from that time.** Rows `T` and
`T + p` agreeing on their low `k + 1` bits makes diagonal `k` periodic with
period `p` from index `T`.

The companion of `leftDiagonal_periodicFrom_of_rowNat_agree` with the
`T ≤ 2 * k` hypothesis dropped and the onset paid for instead: free `T`,
weaker conclusion. Proposed by Seeder (2026-09-10).

DOES NOT PROVE: a strict weakening in its conclusion — onset `T`, not `k` — in
exchange for dropping a hypothesis, so it is not stronger than the landed
form, and it says nothing about how small `p` can be taken, which is the
period wall. Not a prize conjecture; the left edge only. -/
theorem leftDiagonal_periodicFrom_of_rowNat_agree_any (k p T : ℕ)
    (h : rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1)) :
    PeriodicFrom (leftDiagonal k) p T := by
  sorry

/-- **Agreement on the low bits survives the row map, for ever.** Two numbers
agreeing modulo `2 ^ n` still agree modulo `2 ^ n` after any number of steps of
`rowStep`.

Proposed by Seeder (2026-09-10). The autonomy of the low bits at the level of
the raw map, where `rowNat_agree_forward` says it about the seed's own orbit.
Says nothing about `leftDiagonal` and nothing about `centerColumn`: it is a
fact about `rowStep`, and every packed-row argument for either object uses it.

DOES NOT PROVE: no bound on anything, and no prize conjecture. Agreement is
never *lost*; whether it is ever *gained* is the content, and that is the
wall. -/
theorem rowStep_agree_forward (n t x y : ℕ) (h : x % 2 ^ n = y % 2 ^ n) :
    rowStep^[t] x % 2 ^ n = rowStep^[t] y % 2 ^ n := by
  sorry

/-- **The truncated map and the real map agree.** Iterating `stepMod n` from a
truncated start is the same as iterating `rowStep` and truncating at the end.

Proposed by Seeder (2026-09-10). The bridge between the two packed-row
vocabularies the board already uses, stated once instead of being re-derived
inside each argument. Witness holds over `n < 9`, `t < 14`, `x < 40`, and
dropping the truncation of the start returns false.

DOES NOT PROVE: pure change of notation, no bound, no prize conjecture. -/
theorem stepMod_iterate_eq_rowStep_mod (n t x : ℕ) :
    (stepMod n)^[t] (x % 2 ^ n) = rowStep^[t] x % 2 ^ n := by
  sorry

/-- **One more bit of agreement, exactly when a black bit says so.** Two rows
agreeing on their low `n + 1` bits have successors agreeing on their low
`n + 2` bits precisely when bit `n` is black or they already agreed one bit
wider.

Proposed by Seeder (2026-09-10). The `rowStep`-level form of the closed
`rowNat_return_succ_iff`, freed of the seed. Witness holds over `n < 6`,
`x, y < 130`; reading the control bit at `n + 1` instead of `n` returns false.

DOES NOT PROVE: it says when one level is free, not how often — and how often
is exactly the open part. No prize conjecture. -/
theorem rowStep_agree_succ_iff (n x y : ℕ) (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1)) :
    rowStep x % 2 ^ (n + 2) = rowStep y % 2 ^ (n + 2) ↔
      (x.testBit n = true ∨ x % 2 ^ (n + 2) = y % 2 ^ (n + 2)) := by
  sorry

/-- **Two bits at once, under a black control bit.** With bit `n` black, the
successors agree two bits wider exactly when the `OR` of the next two bits
matches.

Proposed by Seeder (2026-09-10). The two-level law: it prices the levels a
reset-only ladder gets for free, which is crystal 62's request at the level of
the raw map. Witness holds over `n < 6`, `x, y < 130`, with 8,193 of 101,400
pairs satisfying both hypotheses, so it is not vacuous — and the same
expression with the two `OR`s replaced by `XOR`s returns false, which is
crystal 66's filter run as a control.

DOES NOT PROVE: no bound on anything and no prize conjecture. The measured
slopes 2.473 and 1.317 are over 5000 steps at one shift on the seed's own
rows and are not proved to persist; the black-control denominator here is not
crystal 62's cascade denominator and the two should not be compared without
saying so. -/
theorem rowStep_agree_succ_two_iff (n x y : ℕ)
    (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1)) (hb : x.testBit n = true) :
    rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3) ↔
      (x.testBit (n + 1) || x.testBit (n + 2)) = (y.testBit (n + 1) || y.testBit (n + 2)) := by
  sorry

/-- **Two periods give their greatest common divisor.** A sequence periodic
from `N` with periods `p` and `q` is periodic from `N` with period
`gcd p q`.

Proposed by Seeder (2026-09-10). Generic: about `PeriodicFrom` and nothing
else, so it serves the centre column exactly as it serves a diagonal. The
minimal-period machinery every bound on a period eventually wants.

DOES NOT PROVE: no prize conjecture, and no bound on any particular period. -/
theorem periodicFrom_gcd (f : ℕ → Bool) (p q N : ℕ)
    (hpN : PeriodicFrom f p N) (hqN : PeriodicFrom f q N) :
    PeriodicFrom f (Nat.gcd p q) N := by
  sorry

/-- **The period wall is an arithmetic statement about one integer orbit.**
`leftDiagonal_period_le` holds exactly when, for every width `n`, the orbit of
the seed's row returns modulo `2 ^ n` after at most `n` steps.

Proposed by Seeder (2026-09-10). A change of vocabulary that removes the
automaton: the left-hand side is about diagonals, the right-hand side is about
`rowNat` alone.

DOES NOT PROVE: proves neither wall and bounds nothing — both sides stay open.
No witness on purpose, and the reason is stated: the left side quantifies over
all `k` with two unbounded existentials inside, which no finite range
expresses, and `leftDiagonal` is `evolve`, which gives out near `t = 18`. The
arithmetic side alone was checked to `n = 700`, which is evidence about one
side of an iff and is not evidence for the iff. -/
theorem leftDiagonal_period_le_iff_rowNat_period :
    (∀ k : ℕ, ∃ p, 0 < p ∧ p ≤ k + 1 ∧ ∃ N, PeriodicFrom (leftDiagonal k) p N) ↔
      (∀ n : ℕ, 0 < n → ∃ p, 0 < p ∧ p ≤ n ∧
        ∃ T, rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) := by
  sorry

/-- **The black count splits at any cut.** The count over `M + k` cells is the
count over the first `M` plus the count over the `k` that follow.

Proposed by Seeder (2026-09-10). Supply for a localisation argument rather
than a step of one: it is the additivity every "balance at cut points"
argument needs before it can say anything.

DOES NOT PROVE: nothing about rule 30 — true of any `Bool` sequence. -/
theorem centerColumnCount_block (M k : ℕ) :
    ((Finset.range (M + k)).filter fun n => centerColumn n = true).card =
      ((Finset.range M).filter fun n => centerColumn n = true).card
        + ((Finset.range k).filter fun j => centerColumn (M + j) = true).card := by
  sorry

/-- **The black count in the packed row model.** The number of black centre
cells below `N`, counted by running the truncated row map instead of the
automaton.

Proposed by Seeder (2026-09-10); witness holds over `t < 10`. The counting
half of the dictionary `centerColumn_eq_rowNat_testBit` opens, and it is what
makes any count about the centre column computable at all — the automaton
gives out near row 18.

DOES NOT PROVE: a change of vocabulary and nothing more; it says nothing about
the value of the count. Crystal 69 records why the packed-row tools the board
already holds do not carry over on their own: they settle a *fixed* bit index
and this is the moving one, bit `n` at time `n`, which outruns the settling
front measured at about `1.25 n`. -/
theorem centerColumnCount_eq_stepMod_count (N : ℕ) :
    ((Finset.range N).filter fun n => centerColumn n = true).card =
      ((Finset.range N).filter fun n =>
        ((stepMod (n + 1))^[n] (1 % 2 ^ (n + 1))).testBit n = true).card := by
  sorry

/-- **The balance conjecture with the casts taken out.** Prize 2 holds exactly
when, for every `d`, the black count is eventually within `N / d` of `N / 2` —
written as two `ℕ` inequalities instead of an absolute value over casts.

The working form of `centerColumn_density_tendsto_half_iff_excess`, which is
proved and states the same thing with `∀ ε : ℝ` and
`|2 * (card : ℝ) - (N : ℝ)| ≤ ε * (N : ℝ)`. That shape is the one
`docs/prover-cookbook.md` warns about by name: two of the three budget
exhaustions on 2026-09-07 were provers cycling on casts. Here the real numbers
survive only on the prize side of the iff, where they must, because that side
has to match `Rule30.Prize.centerColumn_density_tendsto_half` character for
character.

Proposed by Seeder (2026-09-10).

DOES NOT PROVE: it is a restatement of the prize, not a step towards it, and
it is true of any `Bool` sequence in the centre column's place. No finite
witness is possible — both sides quantify over all large `N`. -/
theorem centerColumn_density_tendsto_half_iff_excess_nat :
    Filter.Tendsto centerColumnDensity Filter.atTop (nhds (1 / 2 : ℝ)) ↔
      ∀ d : ℕ, 0 < d → ∃ N₀ : ℕ, ∀ N ≥ N₀,
        2 * d * ((Finset.range N).filter fun n => centerColumn n = true).card ≤ d * N + N ∧
          d * N ≤ 2 * d * ((Finset.range N).filter fun n => centerColumn n = true).card + N := by
  sorry

/-- **Balance at sparse cut points is enough.** If for every `d` there are
arbitrarily late cuts `M ≤ N` with `N - M` small compared to `N`, at which the
count is balanced, then Prize 2 follows.

The localisation node: it says the balance only has to be checked on a thin
set of `N`, because the tail between a cut and `N` cannot move the density.
Proposed by Seeder (2026-09-10).

DOES NOT PROVE: it does not prove the prize, and the hypothesis is not known
for the centre column; it is true of any `Bool` sequence, and at `M = N` it
degenerates to the excess bound itself, so its whole content is that the cut
may be sparse.

**A neighbouring formulation is measured DEAD and must not be proposed**:
"every block of some fixed length `L` is balanced to `L / d`" is unsatisfiable
for the centre column, because long runs keep appearing — at `L = 16` a block
of 16 identical cells occurs at `M = 22711`, worst block excess `1.0000`
(`explorer/tessera2_blocks.mjs`, `N = 400000`). Sparse cuts survive that;
uniform blocks do not. -/
theorem centerColumn_density_tendsto_half_of_nearby_cuts
    (h : ∀ d : ℕ, 0 < d → ∃ N₀ : ℕ, ∀ N ≥ N₀, ∃ M ≤ N,
      d * (N - M) ≤ N ∧
        2 * d * ((Finset.range M).filter fun n => centerColumn n = true).card
            ≤ d * M + M ∧
          d * M
            ≤ 2 * d * ((Finset.range M).filter fun n => centerColumn n = true).card + M) :
    Filter.Tendsto centerColumnDensity Filter.atTop (nhds (1 / 2 : ℝ)) := by
  sorry

/-- **The centre column is black infinitely often and white infinitely
often.** It never settles to one colour.

Proposed by Seeder (2026-09-10). This is the **period-1 case of Prize 1** and
the only node on the board with prize content of its own.

DOES NOT PROVE: nothing above period 1. No induction on the period is implied
or available — the two halves use completely different arguments and neither
generalises — so it is not a step toward either P1 wall. Witness holds over
`t < 12`, which is a finite shadow only: both colours occurring early is a
necessary consequence, so it catches a flipped quantifier or a swapped
true/false and is not evidence for the infinitary claim. -/
theorem centerColumn_not_eventually_constant :
    (∀ N : ℕ, ∃ t ≥ N, centerColumn t = true) ∧
      (∀ N : ℕ, ∃ t ≥ N, centerColumn t = false) := by
  sorry

/-- **Where a difference can sit, one cell left of the origin.** If two
pictures agree in the centre column at times `t` and `t + 1`, their
disagreement at column `-1` is masked by the centre cell: it can be non-white
only when the centre is white.

Proposed by Seeder (2026-09-10). Machinery a proof by contradiction against a
periodic centre column would use.

DOES NOT PROVE: **not a sufficient condition for the wall.** It is
unconditional and true of every pair of pictures, so it rules nothing out by
itself. It says nothing about the white times, which is where the open part
lives — only that at a white cell the mask is open.

NON-VACUITY CHECKED: the seed itself will not witness this. Its white left
cone means a difference planted at position `d` takes about `4 d` rows to
creep back to column 1, so over `initialConfig` both sides are identically
zero at reachable depths. The witness uses noisy rows instead, and the
left-hand side is genuinely non-zero at four points inside its range. -/
theorem column_neg_one_damage_mask (X Y : Config) (t : ℕ)
    (h0 : column X 0 t = column Y 0 t)
    (h1 : column X 0 (t + 1) = column Y 0 (t + 1)) :
    xor (column X (-1) t) (column Y (-1) t)
      = ((! column X 0 t) && xor (column X 1 t) (column Y 1 t)) := by
  sorry

/-- **One column further left, the disagreement is a discrete derivative.**
The disagreement at column `-2` is the `xor` of the column `-1` disagreement
at `t` and at `t + 1`.

Proposed by Seeder (2026-09-10).

DOES NOT PROVE: **the cascade does not continue, and that is the honest limit
of the statement rather than a gap in it.** The same claim one column further
left — that the disagreement at `-3` is the derivative of the one at `-2` — is
measured FALSE: 418 failures in 35,795 hypothesis hits over random
configuration pairs. The reason is visible in the proof: at column `-2` the
second input to the `||` is still the shared origin column, and at `-3` it is
not. **A prover should not expect an induction here and a seeder should not
propose one.** -/
theorem column_neg_two_damage_derivative (X Y : Config) (t : ℕ)
    (h0 : column X 0 t = column Y 0 t)
    (h1 : column X 0 (t + 1) = column Y 0 (t + 1)) :
    xor (column X (-2) t) (column Y (-2) t)
      = xor (xor (column X (-1) t) (column Y (-1) t))
          (xor (column X (-1) (t + 1)) (column Y (-1) (t + 1))) := by
  sorry

/-- **A black run in the centre column shields everything behind it.** If two
pictures agree in the centre column for `j` steps and the centre is black
throughout, they agree at every position from `0` back to `-j`.

Proposed by Seeder (2026-09-10).

DOES NOT PROVE: `i ≤ j` is **exact, not an artefact of the proof** — the next
position along genuinely differs, in 17,596 of 311,892 hypothesis hits over
random configuration pairs, and 7 times inside the witness's own range. So
there is no stronger version to reach for. A statement about black runs only;
it says nothing about the times between them, which is precisely the open
part. -/
theorem column_damage_zero_of_black_run (X Y : Config) (t j : ℕ)
    (hagree : ∀ s ≤ j, column X 0 (t + s) = column Y 0 (t + s))
    (hblack : ∀ s < j, column X 0 (t + s) = true)
    (i : ℕ) (hi : i ≤ j) :
    column X (-(i : ℤ)) t = column Y (-(i : ℤ)) t := by
  sorry

/-- **A periodic centre column would keep disagreeing beside itself.** If the
centre column repeated with period `p` from `N`, then arbitrarily late there
would be a white centre cell at which the column one to the left fails to
repeat.

Proposed by Seeder (2026-09-10). One consequence a proof of the wall would
derive.

DOES NOT PROVE: **it is not the wall and does not weaken it.** The hypothesis
is the negation of Prize 1, so nobody can exhibit a `p` and `N` satisfying it
and the statement carries no witness — a finite range would only confirm the
hypothesis is unsatisfiable there, which is not what is claimed. Nothing here
rules the hypothesis out; if it could, it would be the prize. -/
theorem centerColumn_periodic_damage_white (p N : ℕ) (hp : 0 < p)
    (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t) (M : ℕ) :
    ∃ t ≥ M, centerColumn t = false ∧ evolve (t + p) (-1) ≠ evolve t (-1) := by
  sorry

/-- **The centre column reappears away from the origin.** Cell `m * 2 ^ k` of
row `m * 2 ^ k + k` is centre-column cell `k`.

Proposed by Seeder (2026-09-10); the halving law read forwards. The first node
putting the centre column anywhere but at position `0`.

DOES NOT PROVE: infrastructure, not an attack — by itself it proves nothing
about either wall, and it is a short consequence of two closed nodes. It does
not touch crystal 69's ratio: the centre column still outruns the left-hand
settling front and this says nothing about that.

The witness is an explicit list rather than a range because the cost is
`3 ^ (m * 2 ^ k + k)`: `k = 2, m = 3` is row 15 and already 14 million
neighbour evaluations, and `k = 3, m = 2` is row 19 and out of reach. Checked
independently to `k ≤ 6`, `m ≤ 4` with the array engine. -/
theorem centerColumn_eq_evolve_mul_pow (k m : ℕ) :
    evolve (m * 2 ^ k + k) ((m * 2 ^ k : ℕ) : ℤ) = centerColumn k := by
  sorry

/-- **Column 1 grows monotonically across a white centre cell.** If the centre
cell is white at time `t`, then column 1 at `t + 1` is column 1 or column 2 at
`t`.

Proposed by Seeder (2026-09-10). Witness non-vacuity checked: the hypothesis
holds at `t = 2, 6, 7` over the seed in range, and the same expression with
column 3 in place of column 2 evaluates false, so the check can fail.

DOES NOT PROVE: unconditional and true of every configuration, so it rules
nothing out. One unfolding of `rule30_eq` — a mathematician would call it a
definition chase, not a result. It gives monotonicity only *across a white
centre cell*; at a black one column 1 becomes the complement of the same `OR`
and the monotonicity is gone, which is exactly why the period-1 argument it
feeds does not reach period 2. -/
theorem column_one_succ_of_white (X : Config) (t : ℕ) (h : column X 0 t = false) :
    column X 1 (t + 1) = (column X 1 t || column X 2 t) := by
  sorry

/-- **At the black times, the column to the left repeats too.** If the centre
column had period `p` from `N`, then at every late *black* time the cell one
place left of the origin also repeats.

Proposed by Seeder (2026-09-10).

DOES NOT PROVE: it does not prove P1 and does not weaken either wall. Its
hypothesis is the negation of P1, so nobody can exhibit a `p` and `N`
satisfying it, and it carries no witness — a finite range would only confirm
the hypothesis is unsatisfiable there, which is not what is claimed. It says
nothing whatever about the **white** times, which is the entire open part. It
is not a settling or agreement-front statement and does not run into crystal
69: it never reads a fixed bit of the packed row. -/
theorem centerColumn_periodic_neg_one_black_times (p N : ℕ)
    (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t)
    (t : ℕ) (ht : N ≤ t) (hb : centerColumn t = true) :
    evolve (t + p) (-1) = evolve t (-1) := by
  sorry

/-- **A sufficient condition for Prize 1.** If, for every hypothetical period,
column 1 repeats at the *white* times, then the centre column is not
eventually periodic.

Proposed by Seeder (2026-09-10). The first sufficient condition for P1 the
board has produced since the wall annotation was corrected on 2026-09-10 to
invite them: this is the shape an attack is supposed to have, because anything
implying a P1-equivalent wall implies P1.

DOES NOT PROVE: **it is not the wall and it does not weaken it.** What it buys
is a smaller target, not an easier one — nothing here says the residual
(column 1 at the white times) is any more tractable than P1, and the seeder
claimed no evidence that it is. The hypothesis is a conditional whose
antecedent is the negation of P1, so it is unsatisfiable in fact, no `p` and
`N` can be exhibited, and the node carries no witness by design rather than by
omission. **Anyone who proves the hypothesis has proved Prize 1**, which is
the point and also the warning. -/
theorem centerColumn_not_isEventuallyPeriodic_of_white_times
    (h : ∀ p > 0, ∀ N : ℕ, (∀ t ≥ N, centerColumn (t + p) = centerColumn t) →
        ∀ t ≥ N, centerColumn t = false → evolve (t + p) 1 = evolve t 1) :
    ¬ IsEventuallyPeriodic centerColumn := by
  sorry

/-- **At a white centre cell, column 1 is determined by its two neighbours in
time.** When the centre is white at `t`, column 1 at `t` is the `xor` of the
centre at `t + 1` and column `-1` at `t`.

Proposed by Dioptra (connector, 2026-09-10) from the cryptanalytic reading of
rule 30; kernel-proved in `explorer/dioptra_scratch_whiterun.lean` on
`[propext, Quot.sound]` before landing.

DOES NOT PROVE: one unfolding of the local rule under a white centre, true of
every configuration. It rules nothing out by itself. -/
theorem col_one_of_white (X : Config) (t : ℕ) (h : column X 0 t = false) :
    column X 1 t = xor (column X 0 (t + 1)) (column X (-1) t) := by
  sorry

/-- **Inside a white run of the centre column, column 1 never goes back.**
If the centre is white at `t` and column 1 is black there, column 1 is black
at `t + 1` too.

Proposed by Dioptra (connector, 2026-09-10); kernel-proved before landing.
This is the monotonicity that makes the *switch index* well defined: inside
one maximal white run of the centre column, column 1 switches from white to
black at most once, so the run carries a single integer rather than a word.

DOES NOT PROVE: unconditional, and it says nothing about what happens at a
black centre cell, where the monotonicity is gone. -/
theorem white_run_monotone (X : Config) (t : ℕ) (h : column X 0 t = false)
    (h1 : column X 1 t = true) : column X 1 (t + 1) = true := by
  sorry

/-- **Two white centre cells with a black neighbour force the third.** If the
centre is white at `t` and `t + 1` and column `-1` is black at `t`, then the
centre at `t + 2` is the complement of column `-1` at `t + 1`.

Proposed by Dioptra (connector, 2026-09-10); kernel-proved before landing.
**The white-time twin of the board's `column_succ_of_black`**, and the piece
of that tier that is genuinely new: a second identity pinning the centre
column to column `-1`. Measured over 200,000 rows, the black-time law alone
determines `0.5004` of the centre column and this one adds `0.1251` on its
own; iterated together they reach `0.6885`
(`explorer/dioptra_coverage.mjs`, figures reproduced by the captain before
landing).

DOES NOT PROVE: it determines more of the column, not all of it, and `0.6885`
is a measurement over one prefix rather than a theorem about the limit.
Underneath it, the `0*1*` shape it exploits is Meier–Staffelbach (1991) and is
**known**; what was not found in the literature is its statement as a forcing
identity and the coverage figure, and that search was not exhaustive. -/
theorem centre_forced_after_double_white (X : Config) (t : ℕ)
    (h0 : column X 0 t = false) (h1 : column X 0 (t + 1) = false)
    (hm : column X (-1) t = true) :
    column X 0 (t + 2) = !(column X (-1) (t + 1)) := by
  sorry

/-- **Three white centre cells forbid a white neighbour in the middle.** If
the centre is white at `t`, `t + 1` and `t + 2`, and column `-1` is black at
`t`, then column `-1` is black at `t + 1`.

Proposed by Dioptra (connector, 2026-09-10); kernel-proved before landing. The
forbidden-block form of the law above.

DOES NOT PROVE: a constraint on column `-1` during a white run, not a
determination of it, and nothing about the runs' lengths or how often they
occur. -/
theorem white_run_forbidden (X : Config) (t : ℕ)
    (h0 : column X 0 t = false) (h1 : column X 0 (t + 1) = false)
    (h2 : column X 0 (t + 2) = false) (hm : column X (-1) t = true) :
    column X (-1) (t + 1) = true := by
  sorry

/-- **The row map is minimally leaky: agreement on `n` bits never forces
agreement on `n + 1`.** For every `n` there are two numbers agreeing modulo
`2 ^ n` whose images under `rowStep` disagree modulo `2 ^ (n + 1)`.

Proposed by Sextant (theorist, 2026-09-10); kernel-proved before landing. The
structural answer to "is there a monotone quantity a diagonal read can see":
there is not. The only monotone quantity in this vocabulary is the agreement
front, and it is a quantity of a *pair* of orbits; within one orbit the
conserved quantities are the cone's own edges, which are speeds `0` and `2`.
**Nothing at speed 1**, which is where the centre column lives.

DOES NOT PROVE: a statement about the raw map, not about rule 30's orbit, and
no bound on anything. Its value is as a fence: after it, "is there a monotone
quantity the centre column can see" has a node number for an answer. -/
theorem rowStep_prefix_minimal (n : ℕ) :
    ∃ x y : ℕ, x % 2 ^ n = y % 2 ^ n ∧
      rowStep x % 2 ^ (n + 1) ≠ rowStep y % 2 ^ (n + 1) := by
  sorry

/-- **Two bits of agreement at a `1 0 1` triple.** With the low `n + 1` bits
agreeing, bit `n` black, bit `n + 1` white in `x` and black in `y`, and bit
`n + 2` black, the images agree on their low `n + 3` bits.

Proposed by Sextant (theorist, 2026-09-10); kernel-proved before landing. The
raw-map form of the one measured route that clears the onset wall; crystal
64's reachable-set argument cannot be stated in the packed-row vocabulary
without it.

DOES NOT PROVE: no bound and no prize conjecture. It is the `+2` case of a
family whose ceiling is `+2`. -/
theorem rowStep_agree_succ_two_of_triple (n x y : ℕ)
    (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1))
    (hb : x.testBit n = true)
    (hw : x.testBit (n + 1) = false)
    (hy : y.testBit (n + 1) = true)
    (hr : x.testBit (n + 2) = true) :
    rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3) := by
  sorry

/-- **The forced advance is at most two bits per row, and here is the witness
that `+3` fails.** The pair `11, 15` satisfies every hypothesis of the `+2`
law, its images agree modulo `2 ^ 4`, and they disagree modulo `2 ^ 5`.

Proposed by Sextant (theorist, 2026-09-10); kernel-proved before landing.

**Why this closes a family rather than one lemma.** The agreement machinery
forces at most `+1` per row in general and `+2` at a `1 0 1` triple, and `+3`
is refuted here by explicit witness. On the seed's own orbit the forced
advance averages `0.536` bits per row against a true front of `0.7465` and a
centre column of `1.000`. So even the family's absolute ceiling, reached only
by a row that is `1 0 1` at every step, does not catch the centre column.
**The packed-row agreement machinery cannot reach P1, with numbers.**

DOES NOT PROVE: it refutes `+3` for this family; it says nothing about
arguments outside it. -/
theorem rowStep_forced_advance_at_most_two :
    (11 : ℕ) % 2 ^ 2 = (15 : ℕ) % 2 ^ 2 ∧
    (11 : ℕ).testBit 1 = true ∧ (11 : ℕ).testBit 2 = false ∧
    (15 : ℕ).testBit 2 = true ∧ (11 : ℕ).testBit 3 = true ∧
    rowStep 11 % 2 ^ 4 = rowStep 15 % 2 ^ 4 ∧
    rowStep 11 % 2 ^ 5 ≠ rowStep 15 % 2 ^ 5 := by
  sorry

/-- **An alternating block left of the origin shrinks by one per step.** If
the cells at `0, -1, …, -(L+1)` alternate black-white starting black, then
after one step the cells at `0, …, -L` do.

Proposed by Seeder (2026-09-10). The engine of the black-run correspondence
below.

DOES NOT PROVE: unconditional and true of every configuration; one unfolding
of the local rule under an alternating hypothesis. -/
theorem rule30_alternating_step (X : Config) (L : ℕ)
    (h : ∀ j < L + 2, X (-(j : ℤ)) = decide (j % 2 = 0)) :
    ∀ j < L + 1, rule30 X (-(j : ℤ)) = decide (j % 2 = 0) := by
  sorry

/-- **A deep alternating block makes a long black run in the centre column.**
If the cells at `0, …, -L` alternate at time `t`, the centre column is black
at `t, t+1, …, t+L`.

Proposed by Seeder (2026-09-10). One half of the correspondence.

DOES NOT PROVE: unconditional. It says a deep alternating block *forces* a
long run, not that either occurs. -/
theorem column_black_run_of_alternating (X : Config) (t L : ℕ)
    (h : ∀ j < L + 1, column X (-(j : ℤ)) t = decide (j % 2 = 0))
    (s : ℕ) (hs : s ≤ L) : column X 0 (t + s) = true := by
  sorry

/-- **A long black run forces a deep alternating block.** If the centre column
is black at `t, …, t+L`, the cells at `0, …, -L` alternate at time `t`.

Proposed by Seeder (2026-09-10). The converse half, and together with the
above it makes **black runs and alternating depth the same measurement** read
in two directions — one along time at the origin, one across space to the
left.

DOES NOT PROVE: unconditional, and it moves a question rather than answering
one. Whether either object occurs at arbitrary size is exactly what is open. -/
theorem column_alternating_of_black_run (X : Config) (t L : ℕ)
    (h : ∀ s ≤ L, column X 0 (t + s) = true)
    (j : ℕ) (hj : j ≤ L) : column X (-(j : ℤ)) t = decide (j % 2 = 0) := by
  sorry

/-- **A maximal alternating block shrinks by exactly one, staying maximal.**
If the block alternates to depth `L` and fails at `L+1`, then at the next step
it alternates to depth `L-1` and fails at `L`.

Proposed by Seeder (2026-09-10). The sharp form: the block does not merely
shrink, it shrinks by one and keeps its edge.

DOES NOT PROVE: unconditional, and nothing about how such blocks arise. -/
theorem column_alternating_shrink (X : Config) (t L : ℕ)
    (h : ∀ j < L + 1, column X (-(j : ℤ)) t = decide (j % 2 = 0))
    (hmax : column X (-((L : ℕ) + 1 : ℤ)) t ≠ decide ((L + 1) % 2 = 0)) :
    (∀ j < L, column X (-(j : ℤ)) (t + 1) = decide (j % 2 = 0))
      ∧ column X (-(L : ℤ)) (t + 1) ≠ decide (L % 2 = 0) := by
  sorry

/-- **Arbitrarily long black runs would prove Prize 1.** If the centre column
contains black runs of every length, arbitrarily late, it is not eventually
periodic.

Proposed by Seeder (2026-09-10); route verified.

DOES NOT PROVE: **the implication is trivial and true of any `Bool`
sequence** — an eventually periodic sequence has runs bounded by its period,
so unbounded runs refute periodicity in one line. A mathematician would not
call this a result. What it buys is a *restatement* of P1 as a question about
run lengths, which is measurable where P1 is not: the longest run seen so far
is 16 identical cells at `M = 22711`. Whether the runs are unbounded is open
and is not known to be easier than P1. -/
theorem centerColumn_not_isEventuallyPeriodic_of_long_black_runs
    (h : ∀ k N : ℕ, ∃ t, N ≤ t ∧ ∀ s < k, centerColumn (t + s) = true) :
    ¬ IsEventuallyPeriodic centerColumn := by
  sorry

/-- **Arbitrarily deep alternating blocks would prove Prize 1.** If, at
arbitrarily late times, the cells left of the origin alternate to every depth,
the centre column is not eventually periodic.

Proposed by Seeder (2026-09-10). The same sufficient condition read across
space instead of along time, via the correspondence above.

DOES NOT PROVE: it inherits the triviality of the implication it composes
with, and it moves P1 to a question about a spatial pattern without any
evidence that the spatial question is easier. Its value is that the
alternating block is a *local, checkable* object where "the centre column is
aperiodic" is not. -/
theorem centerColumn_not_isEventuallyPeriodic_of_deep_alternating
    (h : ∀ k N : ℕ, ∃ t, N ≤ t ∧ ∀ j < k, evolve t (-(j : ℤ)) = decide (j % 2 = 0)) :
    ¬ IsEventuallyPeriodic centerColumn := by
  sorry

/-- **A periodic centre column has short white runs.** If the centre column
has period `p > 0` from `N`, every maximal white run beginning at or after `N`
has length at most `p - 1`.

Proposed by Groma (connector, 2026-09-10). Two lines from
`centerColumn_not_eventually_constant`: a run of length `p` starting late
would force the whole period white, and the column is black infinitely often.

**Why this node exists, and it is a correction rather than an addition.** The
switch-index reformulation was landed and reported — by me — as applying to
the family `X_b` and *not* to the seed, on the grounds that rule 30's own
centre column has long runs and nothing bounds them. That is true
unconditionally and **irrelevant where the residual is actually stated**: the
residual's hypothesis *is* eventual periodicity, and under that hypothesis the
runs are bounded. So the finite alphabet is available on the seed exactly
where it is needed.

DOES NOT PROVE: the hypothesis is the negation of P1, so it is counterfactual
and yields no measurement — nobody can exhibit such a `p`. It bounds the
alphabet of an object nobody can construct. -/
theorem centerColumn_white_run_le_period (p N : ℕ) (hp : 0 < p)
    (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t)
    (t : ℕ) (ht : N ≤ t) (hrun : ∀ s < p, centerColumn (t + s) = false) :
    False := by
  sorry

/-- **A black run of the centre column is shorter than the time it starts at.**
If the centre column is black at every time from `a` to `a + L`, with `a ≥ 1`,
then `L < a`.

Proposed by Seeder 2026-09-11 for region P2; route checked before landing.
While the centre column stays black, the cells just left of it are forced to
alternate black-white-black, one cell deeper per further black step
(`column_alternating_of_black_run`). The cone will not allow a deep
checkerboard: at row `a` the two leftmost cells that exist at all, at `-a` and
`-(a-1)`, are both black (`evolve_left_edge`, `evolve_left_second_diagonal`),
while alternation makes consecutive depths opposite. So the forced block
cannot reach depth `a`. `1 ≤ a` is not a technicality — at `a = 0` the cone's
left edge and the origin are the same cell, and the seed's own opening run is
two cells long. Measured: 0 violations over 1,000,344 maximal runs to
`N = 2,000,000`, tight at `a = 3`. Orientation-sensitive: rule 86, rule 30
mirrored, has the same centre-column runs and fails the underlying alternation
at 316 of 968 cells.

DOES NOT PROVE: nothing towards Prize 2. It bounds one run and says nothing
about how often runs occur or about any density. -/
theorem centerColumn_black_run_lt_start (a L : ℕ) (ha : 1 ≤ a)
    (h : ∀ s ≤ L, centerColumn (a + s) = true) : L < a := by
  sorry

/-- **A white run of the centre column is shorter than three times its start
time.** If the centre column is white at every time from `a` to `a + L`, with
`a ≥ 1`, then `L < 3 * a`.

Proposed by Seeder 2026-09-11 for region P2. The white twin of the black-run
bound, splitting on the colour of the column one cell left of the origin,
which is monotone inside a white run (`white_run_forbidden`). Before it turns
black, reading rule 30 backwards (`sideways_inverse`) forces an all-white
triangle that the black left edge stops; after, it forces the checkerboard in
the opposite phase to a black run's, which the cone's two adjacent black cells
stop. The two bounds compose to `L < 3 * a`.

DOES NOT PROVE: not the sharp bound, and nothing here explains the gap.
Measured, a maximal white run beginning at `a` has length at most `a / 2`;
`3` is stated because `3` is what this argument gives. Nothing towards
Prize 2. -/
theorem centerColumn_white_run_lt_start (a L : ℕ) (ha : 1 ≤ a)
    (h : ∀ s ≤ L, centerColumn (a + s) = false) : L < 3 * a := by
  sorry

/-- **The centre column is not constant on any window from `a` to `4 * a`.**
Both colours appear between times `a` and `a + 3 * a`, for every `a ≥ 1`.

Proposed by Seeder 2026-09-11 for region P2. The two run bounds read as one
statement: all black would contradict the black bound at `L = a`, all white
the white bound at `L = 3 * a`. Stated with the same `3 * a` on both sides so
the counting node has one window rather than two. This is the interface — the
form in which rule 30 says something about the centre column that a `Bool`
sequence can fail.

DOES NOT PROVE: nothing towards Prize 2; it is the two run bounds restated.
The window is far too wide — measured, every window `[a, 2a]` already holds
both colours — and the width is the white bound's constant rather than a fact
about the picture. -/
theorem centerColumn_window_not_constant (a : ℕ) (ha : 1 ≤ a) :
    (∃ s ≤ 3 * a, centerColumn (a + s) = true) ∧
      (∃ s ≤ 3 * a, centerColumn (a + s) = false) := by
  sorry

/-- **Below `5 ^ n`, the centre column has at least `n` cells of each colour.**

Proposed by Seeder 2026-09-11 for region P2; the derivation was checked in
Lean with the window statement taken as a hypothesis rather than assumed
available. The windows `[5 ^ k, 5 ^ (k+1))` for `k < n` are disjoint and cover
`[1, 5 ^ n)`, and each contains the window `[5 ^ k, 4 * 5 ^ k]` that
`centerColumn_window_not_constant` says holds both colours — `4 * 5 ^ k <
5 ^ (k+1)` is the whole reason the base is `5` rather than `4`.

This is the first bound on the centre column's excess that uses rule 30 at
all: it gives `|2 * count N - N| ≤ N - 2 * ⌊log₅ N⌋`, in the same inequality
that `centerColumn_density_tendsto_half_iff_excess_nat` states the prize in.

DOES NOT PROVE: nothing towards Prize 2, and the gap is not a matter of
sharpening. `N - 2 log₅ N` is `N(1 - o(1))` where the prize needs `o(N)`, and
Talus's attack of 2026-09-10 caps the whole run route at `N(1 - 1/(c log N))`
for any run bound however sharp — so no successor of these four nodes reaches
it. What it does is put one statement about `centerColumnCount` on the board
that a `Bool` sequence can fail. CAPTAIN'S CORRECTION TO THE PROPOSAL: the
seeder wrote that all twelve closed P2 nodes hold of every `ℕ → Bool`. Ten do.
`centerColumn_zero` and `centerColumnCount_eq_stepMod_count` are rule-30
statements, but neither constrains the density — one fixes a single value, the
other re-encodes the count in the packed-row vocabulary without yielding an
inequality. The refined claim, which is what this tier rests on, is that this
would be the first P2 node giving a rule-30-dependent BOUND on the counts. -/
theorem centerColumnCount_ge_of_pow (n : ℕ) :
    n ≤ ((Finset.range (5 ^ n)).filter fun t => centerColumn t = true).card ∧
      n ≤ ((Finset.range (5 ^ n)).filter fun t => centerColumn t = false).card := by
  sorry

/-- **The cone condition, in the tower's own coordinates.** Row `2 ^ k` is
white at the `k` positions immediately left of its black right edge.

This is Rowland 2006's Theorem 1 specialised to rule 30 — row `2 ^ n`
converges back to the initial row — stated quantitatively at his §1 lines
123-126 in the mirror orientation. Crystal 11 carries it as its unseeded
second ingredient and prices it as "Rowland's own induction, not a finite
check"; **that pricing is wrong**, and correcting it is why this node exists.
Sextant proved it on 2026-09-12 as a least-element argument over three closed
nodes — `rightDiagonal_periodicFrom_pow`, `periodicFrom_mul` and
`rightDiagonal_first_failure`, the last of which landed the day after crystal
11 was written, which is why nobody saw the route. Kernel-checked in
`explorer/sextant10_scratch_cone.lean` (`cone_rightDiagonal`), accepted by
`lake env lean` with axioms inside the allowlist.

DOES NOT PROVE: nothing towards any prize, and the region it lives in was
fenced the same afternoon. Sextant closed the right edge for P1 from the
recurrence side and Portage closed it from the self-similar-group side, both
on 2026-09-12, so no successor of this node reaches Prize 1. It is seeded as a
**route closure**: it retires crystal 11's second ingredient, corrects that
crystal's mispricing of the work, and supplies `rightDiagonal_edge_gap_eq`
below. Band: known as a statement, project-internal as a proof. -/
theorem rightDiagonal_cone (k : ℕ) (hk : 1 ≤ k) :
    rightDiagonal k (2 ^ k - k) = false := by
  sorry

/-- **The white void at a row's right edge is exactly the first depth whose
period fails to divide the row.** If every right diagonal shallower than
`D + 2` has minimal period dividing `p`, and the one at depth `D + 2` does
not, then row `p` is white at every position from one to `D + 1` cells in from
its right edge, and black at `D + 2` cells in.

Every `P_d` is a power of two, so whether `P_d ∣ p` depends only on `ord₂ p`,
and therefore so does the gap: the void at row `p` is the void at
`2 ^ (ord₂ p)`. The restriction to `D + 2` costs nothing — `D = 0` cannot
occur since `P_0 = 1` divides everything, and `D = 1` is the closed
`evolve_right_second_diagonal`, so the identity is covered at every `p`.

Crystal 12 records the white-void values `0 2 3 5 6 8 14 15 23 24 26` as
Cairn's **measurement**. This makes them a theorem. Kernel-checked in
`explorer/sextant10_scratch_cone.lean` (`edge_gap_eq`).

DOES NOT PROVE: nothing towards any prize; same fence as `rightDiagonal_cone`
above. Band: **known-adjacent, with a new proof.** Rowland proves the
black-run sibling (`I(t) = a(ord₂ t)`, §1 lines 117-126, "by right
bijectivity") and asserts the two-way form in his introduction at line 131.
Sextant did not re-read his §3, so **"not proved in print" is unestablished**
— treat this as a new phrasing carrying a proof, not as a new theorem, until
somebody reads that section. -/
theorem rightDiagonal_edge_gap_eq (p D : ℕ) (hp : 0 < p)
    (hlow : ∀ d < D + 2, minimalPeriod (rightDiagonal d) ∣ p)
    (hhi : ¬ (minimalPeriod (rightDiagonal (D + 2)) ∣ p)) :
    (∀ d : ℕ, 1 ≤ d → d < D + 2 → evolve p ((p : ℤ) - (d : ℤ)) = false)
      ∧ evolve p ((p : ℤ) - ((D + 2 : ℕ) : ℤ)) = true := by
  sorry

end Statements
