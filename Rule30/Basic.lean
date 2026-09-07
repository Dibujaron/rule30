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
