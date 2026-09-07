/-
# Rule 30 — core definitions, Mathlib-free

A port of the real `Rule30/Basic.lean` with the same definitions and no
imports: the three notations Mathlib supplies (`ℕ`, `ℤ`, `f^[n]`) are
defined here instead, byte-for-byte as Mathlib defines them, so the
statements in this project's `Statements.lean` read as the real ones do
and `evolve`/`centerColumn` evaluate to the real Rule 30.

Only what the harness tests reference is here. Nothing under
`harness/src` reads this file; it exists to be built and elaborated
against by `verify_test` and `seed_test`.
-/

/-- `Mathlib.Data.Nat.Notation`, verbatim. -/
notation "ℕ" => Nat

/-- `Mathlib.Data.Int.Notation`, verbatim. -/
notation "ℤ" => Int

universe u

/-- `Mathlib.Logic.Function.Iterate`'s `Nat.iterate`, verbatim: `op` applied
`n` times. -/
def Nat.iterate {α : Sort u} (op : α → α) : ℕ → α → α
  | 0, a => a
  | succ k, a => iterate op k (op a)

@[inherit_doc Nat.iterate]
notation:max f "^[" n "]" => Nat.iterate f n

/-- A configuration: a bi-infinite row of cells indexed by the integers. -/
abbrev Config : Type := ℤ → Bool

namespace ElementaryCA

/-- The neighbourhood packed into the 3-bit index Wolfram numbers rules by. -/
def neighborhoodIndex (left center right : Bool) : Nat :=
  4 * left.toNat + 2 * center.toNat + right.toNat

/-- One step of the elementary cellular automaton with rule number `r`. -/
def step (r : Fin 256) (c : Config) (i : ℤ) : Bool :=
  r.val.testBit (neighborhoodIndex (c (i - 1)) (c i) (c (i + 1)))

end ElementaryCA

/-- Rule 30. -/
def rule30 : Config → Config := ElementaryCA.step 30

/-- A single black cell at the origin on a white background. -/
def initialConfig : Config := fun i => decide (i = 0)

/-- The configuration after `t` steps of rule 30 from `initialConfig`. -/
def evolve (t : Nat) : Config := rule30^[t] initialConfig

/-- The centre column: the origin cell after `t` steps. OEIS A051023. -/
def centerColumn (t : Nat) : Bool := evolve t 0
