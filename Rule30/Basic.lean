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
