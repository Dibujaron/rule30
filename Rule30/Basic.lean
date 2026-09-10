/-
# Rule 30 — core definitions

An *elementary cellular automaton* is about as small as a dynamical system
gets: a bi-infinite row of black/white cells, updated in lock-step by a rule
that looks only at each cell and its two neighbours.

This file defines all 256 of them from a rule number, specialises to rule 30,
and proves the one bridging lemma (`rule30_eq`) that every downstream proof
uses.
-/
import Mathlib.Data.Int.Notation
import Mathlib.Logic.Function.Iterate
import Mathlib.Data.Fintype.Card
import Mathlib.Data.Fintype.Pi
import Mathlib.Data.Finset.Card
import Mathlib.Order.Lattice.Nat

/-- A configuration of the automaton: a bi-infinite row of cells, each black
(`true`) or white (`false`), indexed by the integers.

In TypeScript terms this is exactly `(i: bigint) => boolean`. There is no
array, no bound, and no "edge of the world" — the row really is the function.
-/
abbrev Config : Type := ℤ → Bool

namespace ElementaryCA

/-- The neighbourhood of a cell, packed into the 3-bit number Wolfram numbers
his rules by: `left` is the high bit (4), `center` the middle bit (2), `right`
the low bit (1). So the all-black neighbourhood `111` is index `7`, and the
all-white one `000` is index `0`.

`Bool.toNat` is the obvious `false ↦ 0`, `true ↦ 1`. -/
def neighborhoodIndex (left center right : Bool) : Nat :=
  4 * left.toNat + 2 * center.toNat + right.toNat

/-- One step of the elementary cellular automaton with rule number `r`.

A rule number *is* its own lookup table. Three neighbours give 8 possible
neighbourhoods, and the rule must supply one output bit for each — so a rule is
exactly one byte, and `Fin 256` is that byte. `Fin 256` carries the proof of
its own bound with it, so `step 300` is not a runtime error, it is unwritable.

`Nat.testBit r.val k` reads bit `k` of the rule number, which is the output for
neighbourhood `k`. -/
def step (r : Fin 256) (c : Config) (i : ℤ) : Bool :=
  r.val.testBit (neighborhoodIndex (c (i - 1)) (c i) (c (i + 1)))

end ElementaryCA

/-- Rule 30, the automaton the Wolfram prizes are about.

This is a *partial application*, not a wrapper: `ElementaryCA.step` takes a rule
first, so `ElementaryCA.step 30` is already a value of type `Config → Config`.
(Every Lean function takes exactly one argument, so there is no such thing as
"calling `step` with a missing argument" — currying is not opt-in here.) -/
def rule30 : Config → Config := ElementaryCA.step 30

/-- The initial configuration the prize questions are stated against: a single
black cell at the origin on an infinite white background.

`decide (i = 0)` turns the *proposition* `i = 0` into the `Bool` that says
whether it holds; the two are different things in Lean, and only the `Bool` can
be stored in a cell. -/
def initialConfig : Config := fun i => decide (i = 0)

/-- The configuration after `t` steps of rule 30, starting from
`initialConfig`.

`f^[t]` is `Nat.iterate`: `f` composed with itself `t` times. `rule30^[0]` is
the identity, so `evolve 0 = initialConfig`. -/
def evolve (t : Nat) : Config := rule30^[t] initialConfig

/-- The center column: the colour of the origin cell after `t` steps.

This single sequence of bits is the subject of all three Rule 30 Prize
questions (see `Rule30/Prize.lean`). It is OEIS A051023. -/
def centerColumn (t : Nat) : Bool := evolve t 0

/-- The `k`-th diagonal in from the **left** edge of the cone, read `j` steps
along it: the cell at position `-j` after `j + k` steps. `leftDiagonal 0` is
the left edge itself, `leftDiagonal 1` the cells just inside it, and so on.

In TypeScript terms it is a re-indexing, `(k, j) => evolve(j + k)(-j)`, and
nothing more — no new data, only a coordinate system in which the left side
of the pattern reads as a family of one-dimensional sequences. -/
def leftDiagonal (k j : Nat) : Bool := evolve (j + k) (-(j : ℤ))

/-- The `k`-th diagonal in from the **right** edge, read `j` steps along it:
the cell at position `j` after `j + k` steps. Not the mirror image of
`leftDiagonal`: rule 30 is not left-right symmetric, and the two families
behave differently. -/
def rightDiagonal (k j : Nat) : Bool := evolve (j + k) (j : ℤ)

/-- `f` repeats with period `p` from index `N` on: `f (n + p) = f n` for every
`n ≥ N`. The prefix before `N` is unconstrained.

`IsEventuallyPeriodic f` in `Rule30/Prize.lean` is `∃ p > 0, ∃ N, PeriodicFrom
f p N`, written out; that file keeps the unfolded form so the prize statement
reads on its own. Note `p = 0` makes this trivially true, so a statement that
means "genuinely periodic" must carry `0 < p` alongside it. -/
def PeriodicFrom (f : Nat → Bool) (p N : Nat) : Prop := ∀ n ≥ N, f (n + p) = f n

/-- **The bridging lemma.** Rule 30 in closed form: the new cell is the left
neighbour XOR (centre OR right neighbour).

This is the identity every downstream proof — and the BigInt explorer's
`(x <<< 1) ^^^ (x ||| (x >>> 1))` — actually works with. Going from the lookup
table to this formula is pure case analysis: `cases` on each of the three
Booleans gives 8 goals, and each one is a concrete `Nat.testBit 30 k` that the
kernel simply computes. -/
theorem rule30_eq (c : Config) (i : ℤ) :
    rule30 c i = xor (c (i - 1)) (c i || c (i + 1)) := by
  show ElementaryCA.step 30 c i = _
  unfold ElementaryCA.step ElementaryCA.neighborhoodIndex
  cases c (i - 1) <;> cases c i <;> cases c (i + 1) <;> rfl

/-- `evolve` unfolded one step, so that `rule30_eq` can be applied to it. -/
theorem evolve_succ (t : Nat) : evolve (t + 1) = rule30 (evolve t) := by
  simp [evolve, Function.iterate_succ_apply']

/-! ## Arbitrary rows

Everything above grows the picture from one black cell. The tools the
literature uses on the columns question — left-permutivity, preimage
counting — are about *any* starting row, so here the same picture is grown
from an arbitrary `c : Config`. `evolve t` is the special case
`evolveFrom initialConfig t`, and the two are equal by definition. -/

/-- The row after `t` steps of rule 30, starting from any row `c`.

The same `f^[t]` iterate as `evolve`, with the starting row a parameter
instead of the fixed `initialConfig`. In TypeScript this is the difference
between `evolve(t)` and `evolveFrom(c, t)` where the first is
`evolveFrom(initialConfig, t)` by definition. -/
def evolveFrom (c : Config) (t : Nat) : Config := rule30^[t] c

/-- Column `i` of the picture grown from `c`: the colour of position `i`
after `t` steps, as a function of `t`. `centerColumn` is `column initialConfig 0`. -/
def column (c : Config) (i : ℤ) (t : Nat) : Bool := evolveFrom c t i

/-- The cells of `c` at positions `-t .. t`, as a function on the finite type
`Fin (2 * t + 1)`: index `k` reads position `k - t`.

The point of a *finite* type is counting. `Fin n → Bool` has `2 ^ n`
inhabitants and Mathlib knows it (`Fintype`), so "all windows of width
`2t + 1`" is `Finset.univ` and can be filtered and counted. A `Config` is
`ℤ → Bool` and has no such thing. -/
def window (c : Config) (t : Nat) : Fin (2 * t + 1) → Bool :=
  fun k => c ((k : ℤ) - (t : ℤ))

/-- A window extended by white cells outside `-t .. t`, back to a full row.
`window (ofWindow w) t = w`, and the picture grown from `ofWindow w` agrees
at the origin for `t` steps with the picture grown from any row whose
window is `w` (that is the cone lemma, `evolveFrom_eq_of_agree_on_window`). -/
def ofWindow {t : Nat} (w : Fin (2 * t + 1) → Bool) : Config :=
  fun i => if h : 0 ≤ i + t ∧ i + t < 2 * t + 1 then w ⟨(i + t).toNat, by omega⟩ else false

/-- `f` is **left-permutive** with radius `r`: two rows that agree at every
position `i - r + 1 .. i + r` and differ at `i - r` are sent to rows that
differ at `i`. Flipping the leftmost cell that a step reads always flips its
output, whatever the other cells hold.

This is the property everything about rule 30's columns leans on. For one
step of rule 30 it is `rule30_eq` read as "`xor` with the left neighbour":
`rule30_leftPermutive`. For `t` steps it is `evolveFrom_leftPermutive`, with
radius `t`. -/
def LeftPermutive (f : Config → Config) (r : Nat) : Prop :=
  ∀ (c d : Config) (i : ℤ),
    (∀ j : ℤ, i - r < j → j ≤ i + r → c j = d j) → c (i - r) ≠ d (i - r) → f c i ≠ f d i

/-- How many of the `2 ^ (2t + 1)` windows of width `2t + 1` grow a black
centre cell after `t` steps. `window_count_half` says it is exactly half. -/
def blackWindowCount (t : Nat) : Nat :=
  (Finset.univ.filter fun w : Fin (2 * t + 1) → Bool =>
    evolveFrom (ofWindow w) t 0 = true).card

/-- The single-seed picture is the general one grown from `initialConfig`. -/
theorem evolve_eq_evolveFrom_initial (t : Nat) :
    evolve t = evolveFrom initialConfig t := rfl

/-- The centre column is column `0` of the single-seed picture. -/
theorem centerColumn_eq_column (t : Nat) :
    centerColumn t = column initialConfig 0 t := rfl

/-- `evolveFrom` unfolded one step, the way `evolve_succ` unfolds `evolve`, so
that `rule30_eq` can be applied to the picture grown from any row. -/
theorem evolveFrom_succ (c : Config) (t : Nat) :
    evolveFrom c (t + 1) = rule30 (evolveFrom c t) := by
  simp [evolveFrom, Function.iterate_succ_apply']

/-! ## The row model

A row of the single-seed picture has at most `2t + 1` cells, so it fits in
one natural number, and one step of rule 30 is three big-integer operations.
Lean's kernel evaluates `Nat` arithmetic with built-in bignums, so `decide`
can compute row 5000 in a second where evaluating `evolve` cell by cell
gives out near row 18. `rowCell_eq_evolve` (a node on the board) says the
model and the definition agree; after it, a concrete fact about any row to
depth in the thousands is a theorem by `decide`, with no extra axiom. -/

/-- **Rule 30's row map, on a whole row at once.** Not to be confused with
`step` above, which is the general elementary-CA step on a `Config`; this is
rule 30 specifically, on a row packed into one `Nat`.

`4 * r` shifts the row two
bits up so that bit `b` of it is the *left* neighbour of position `b - t - 1`;
`2 * r` is the centre; `r` itself is the right neighbour; and the whole
expression is `left XOR (centre OR right)`, which is `rule30_eq` applied to
every bit simultaneously. The explorer's BigInt engine does the same thing
with shifts. -/
def rowStep (r : Nat) : Nat := (4 * r) ^^^ ((2 * r) ||| r)

/-- **The row map truncated to `n` bits.** `rowStep` carries information only
upward through the bits, so cutting to `n` bits before and after the step
gives the same answer as cutting after: `stepMod n` is a genuine map on
`Nat`s below `2 ^ n`, and the truncations form a tower rather than a
sequence of unrelated finite systems.

Reading the picture: bit `k` of the row is the cell `k` places in from the
black left edge, so truncating to `n` bits is looking at the leftmost `n`
diagonals and ignoring everything further in. -/
def stepMod (n r : Nat) : Nat := rowStep r % 2 ^ n

/-- Row `t` of the single-seed picture as one number: the cell at position
`x` is bit `x + t`, so bit `0` is the left edge and bit `2t` the right edge.

The step is `rule30_eq` on all bits at once. `4 * r` shifts the row two bits
up so that bit `b` of it is the *left* neighbour of position `b - t - 1`;
`2 * r` is the centre; `r` itself is the right neighbour; and
`(4 * r) ^^^ ((2 * r) ||| r)` is `left XOR (centre OR right)`. The explorer's
BigInt engine does the same thing with shifts. -/
def rowNat : Nat → Nat
  | 0 => 1
  | t + 1 => let r := rowNat t; (4 * r) ^^^ ((2 * r) ||| r)

/-- The cell at position `x` of row `t`, read from `rowNat`; white outside
the cone `-t .. t`, where the number has no bit for it. -/
def rowCell (t : Nat) (x : ℤ) : Bool :=
  if -(t : ℤ) ≤ x ∧ x ≤ t then (rowNat t).testBit (x + t).toNat else false

/-- The model agrees with `evolve` on every cell of the first seven rows. A
kernel computation, kept in the file as a guard against the orientation
error that is easy to make here (the mirror image is rule 86 and passes
every symmetric check). The general statement is `rowCell_eq_evolve`. -/
example : ∀ t : Fin 7, ∀ x : Fin 13, rowCell t ((x : ℤ) - 6) = evolve t ((x : ℤ) - 6) := by
  decide

/-! ## The two half-lines and the sideways solve

Each half of the picture is driven by the centre column alone. A cell at
position `x ≥ 1` reads only positions `x - 1`, `x`, `x + 1`, all `≥ 0`, so
the right half `x ≥ 1`, given its own row 0 and the centre column as a
boundary, evolves without ever looking left of the origin; the left half is
the mirror. And columns 0 and 1 together determine everything to their
left, one column per step of `sideways_inverse`. The three definitions below
make these views into functions of `ℕ` alone, so they can be stated and
computed without a `Config`; the agreement theorems in `Statements.lean`
tie each back to `column`.

In TypeScript terms, `evolve` is a loop over the whole infinite row, and
`evolveHalfLeft c w` is the same loop over a half-open array whose closed
end reads `c t` instead of a neighbour. The seam is that the boundary is a
*given* sequence here, not something the loop computes — which is exactly
why the half-line can be fed a boundary that no row would produce. -/

/-- The left half-line: `evolveHalfLeft c w t k` is the cell at position
`-(k + 1)` after `t` steps, grown from row 0 `w` (`w k` is the cell at
`-(k + 1)`) with the boundary column `c` standing in for position `0`. -/
def evolveHalfLeft (c w : ℕ → Bool) : ℕ → ℕ → Bool
  | 0, k => w k
  | t + 1, 0 => xor (evolveHalfLeft c w t 1) (evolveHalfLeft c w t 0 || c t)
  | t + 1, k + 1 =>
      xor (evolveHalfLeft c w t (k + 2))
        (evolveHalfLeft c w t (k + 1) || evolveHalfLeft c w t k)

/-- The right half-line: `evolveHalfRight c y t k` is the cell at position
`k + 1` after `t` steps, grown from row 0 `y` (`y k` is the cell at `k + 1`)
with the boundary column `c` standing in for position `0`. -/
def evolveHalfRight (c y : ℕ → Bool) : ℕ → ℕ → Bool
  | 0, k => y k
  | t + 1, 0 => xor (c t) (evolveHalfRight c y t 0 || evolveHalfRight c y t 1)
  | t + 1, k + 1 =>
      xor (evolveHalfRight c y t k)
        (evolveHalfRight c y t (k + 1) || evolveHalfRight c y t (k + 2))

/-- The sideways solve: `leftSolve c d k t` is the cell at position `-k` at
time `t`, rebuilt from column `0` (`c`) and column `1` (`d`) alone by
`sideways_inverse`, one column per step leftward: the cell at `-(k + 1)` is
the cell at `-k` one step later, XOR (the cell at `-k` OR the cell at
`-k + 1`). Column `1` is read only in the first step. -/
def leftSolve (c d : ℕ → Bool) : ℕ → ℕ → Bool
  | 0, t => c t
  | 1, t => xor (c (t + 1)) (c t || d t)
  | k + 2, t =>
      xor (leftSolve c d (k + 1) (t + 1))
        (leftSolve c d (k + 1) t || leftSolve c d k t)

/-- The three models agree with the row model on the single seed for the
first steps. Kernel computations kept in the file as guards against an
orientation error (a mirrored half-line passes every symmetric check); the
general statements are `evolveHalfLeft_eq_column`, `evolveHalfRight_eq_column`
and `leftSolve_eq_column`. -/
example : ∀ t : Fin 8, ∀ k : Fin 8,
    evolveHalfLeft (fun t => rowCell t 0) (fun _ => false) t k
      = rowCell t (-((k : ℤ) + 1)) := by
  decide

example : ∀ t : Fin 8, ∀ k : Fin 8,
    evolveHalfRight (fun t => rowCell t 0) (fun _ => false) t k
      = rowCell t ((k : ℤ) + 1) := by
  decide

example : ∀ k : Fin 7, ∀ t : Fin 7,
    leftSolve (fun t => rowCell t 0) (fun t => rowCell t 1) k t
      = rowCell t (-(k : ℤ)) := by
  decide

/-! ## The settled configuration

Every left diagonal settles into a repeating word from some onset on
(`leftDiagonal_periodicFrom_pow`), and the settled cells form a region on
the left whose boundary, the seam, runs down the picture at about a quarter
of the way in from the centre. Read the picture down a column far to the
left, starting at the left edge: if the column's distance from the origin
is a multiple of `2 ^ k` and past the onsets, the `k`-th cell below the edge
is the same whichever such column is read. That common value is
`settledCenter k`, the centre column the picture would have if its diagonals
had no transients; and the row that grows the settled region without any
transient at all is `settledConfig`. Both are read off the seed's own
picture at indices past every onset: `2 ^ k` on diagonal `k`, and
`2 ^ (x + 1) - x` for the cell at position `x` of the settled row, which is
past the onset of diagonal `x` and congruent to `-x` modulo its period.

In TypeScript terms these are memoised reads of a lazily computed table,
not new automata: nothing here runs rule 30 on anything but the seed. The
seam is that the settled row is infinite to the right, so its own picture
is not a cone and its column at the origin, which `column_settledConfig_eq`
identifies with `settledCenter`, is a new sequence with no transient. -/

/-- The settled centre column: the settled word of diagonal `k` at index `0`,
read from the seed's picture at index `2 ^ k`, which is past the onset and a
multiple of the period. -/
def settledCenter (k : ℕ) : Bool := leftDiagonal k (2 ^ k)

/-- The settled configuration: the row whose rule 30 picture is the settled
region with no transient. Position `x ≥ 0` reads diagonal `x` of the seed at
index `2 ^ (x + 1) - x`, past its onset and congruent to `-x` modulo its
period; positions left of the origin are white. -/
def settledConfig : Config :=
  fun x => if 0 ≤ x then leftDiagonal x.toNat (2 ^ (x.toNat + 1) - x.toNat) else false

/- The first eleven values of the settled centre column, from the row model,
kept as a guard: `11011100110`, equal to the centre column itself for these
`k` (the onsets are zero there) and a coin flip from it afterwards. -/
/-- **The least genuine period of a sequence that is periodic from `0`.**
The infimum of the positive periods. Total: `sInf` of an empty set of naturals
is `0`, so `minimalPeriod f = 0` says exactly "no positive period from `0`",
and every statement that means "the least period is `p`" carries `0 < p`
alongside, the same way `PeriodicFrom` does.

Three documents have now had to work around the absence of this, and every
statement about how the right diagonals' periods grow wants it. It is stated
for periodicity from `0` rather than eventual periodicity on purpose: the right
diagonals have no transients, which is the case it is for, and a least
*eventual* period would need a least onset too and is a different definition.

This is a plain definition and introduces no assumption — every theorem
mentioning it could be restated with the `sInf` written out. -/
noncomputable def minimalPeriod (f : Nat → Bool) : Nat :=
  sInf {p | 0 < p ∧ PeriodicFrom f p 0}

set_option maxRecDepth 100000 in
example : (List.range 11).map (fun k => rowCell (2 ^ k + k) (-(2 ^ k : ℤ)))
    = [true, true, false, true, true, true, false, false, true, true, false] := by
  decide
