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

/-! ## Harness self-test -/

/-- A trivially true statement that exists only so the harness's verifier
tests have something to prove without touching a real node's proof file. It
is deliberately absent from `blueprint/dag.json`. -/
theorem harness_probe : True := by
  sorry

end Statements
