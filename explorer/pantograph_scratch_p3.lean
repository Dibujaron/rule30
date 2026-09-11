/-
Pantograph, 2026-09-11. Scratch check for the P3-sayability sighting.

Question: is there a concrete uniform machine model, with binary input encoding
and step-counted cost, in *current* Mathlib, against which P3 can be stated?

Claim under test: yes — `Turing.FinTM2` + `Turing.TM2ComputableInPolyTime` +
`Computability.encodeNat` (which is binary). This file only checks that the
statements ELABORATE. It proves nothing about rule 30.
-/
import Rule30.Basic
import Mathlib.Computability.TuringMachine.Computable

open Computability Turing

/-! ## 0. The two encodings sit twenty lines apart in Mathlib -/

-- binary: length is ⌊log₂ n⌋ + 1
example : (encodeNat 1000).length = 10 := by decide
example : (encodeNat 1023).length = 10 := by decide
example : (encodeNat 1024).length = 11 := by decide

-- unary: length is n.  This is trap 2, available as a definition.
-- (`decide` at n = 1000 exhausts the recursion depth, which is the point:
-- the input itself is 1000 symbols long.)
example : (unaryEncodeNat 40).length = 40 := by decide
theorem unary_length (n : ℕ) : (unaryEncodeNat n).length = n :=
  unary_decode_encode_nat n

/-! ## 1. P3, robust core: the centre column is not computable in time
polynomial in the LENGTH of the binary input, i.e. not polylog in `n`. -/

def P3Core : Prop :=
  IsEmpty (TM2ComputableInPolyTime encodeNat encodeBool centerColumn)

/-! ## 2. The same statement against the unary encoding — trap 2, sayable and
worthless: reading the input already costs `n`. -/

def P3Unary : Prop :=
  IsEmpty (TM2ComputableInPolyTime unaryEncodeNat encodeBool centerColumn)

/-! ## 3. Wolfram's own formal shape: no machine whose running time is O(n).
`c.time` is a proved upper bound on the step count, as a function of the input
LENGTH, so `c.time (encodeNat n).length` is that machine's cost at `n`. -/

def P3Wolfram : Prop :=
  ∀ c : TM2ComputableInTime encodeNat encodeBool centerColumn,
    ¬ ∃ K > 0, ∀ n, c.time (encodeNat n).length ≤ K * (n + 1)

/-! ## 4. The literal `Prize.lean` shape, Ω(n), in the same model. -/

def P3Linear : Prop :=
  ∀ c : TM2ComputableInTime encodeNat encodeBool centerColumn,
    ∃ k > 0, ∃ N, ∀ n ≥ N, n ≤ k * c.time (encodeNat n).length

/-! ## 5. Teeth: does the statement imply P1? -/

def IsEventuallyPeriodic (f : ℕ → Bool) : Prop := ∃ p > 0, ∃ N, ∀ n ≥ N, f (n + p) = f n

/-- The one lemma the teeth rest on: an eventually periodic sequence is
computable from the binary digits of `n` by a finite automaton, hence in
polynomial time in the input length. NOT proved here — this is the handoff. -/
theorem periodic_polyTime (f : ℕ → Bool) (h : IsEventuallyPeriodic f) :
    Nonempty (TM2ComputableInPolyTime encodeNat encodeBool f) := by
  sorry

/-- **P3 in this model implies P1.** Two lines, given the lemma above. This is
the check that the statement is not vacuous in the dangerous direction. -/
theorem P3Core_implies_P1 (h : P3Core) : ¬ IsEventuallyPeriodic centerColumn := by
  intro hper
  exact (periodic_polyTime centerColumn hper).elim h.elim

/-! ## 6. Non-vacuity in the other direction: the model can express a shortcut.
`encodeNat` is little-endian (`encodePosNum (bit0 n) = false :: encodePosNum n`),
so the parity of `n` is the FIRST symbol of the input. -/

example : encodeNat 12 = [false, false, true, true] := by decide
example : encodeNat 13 = [true, false, true, true] := by decide

/-- A sequence a FinTM2 reads off in one pop. Stated to show the model does not
make everything expensive. -/
def ShortcutExists : Prop :=
  Nonempty (TM2ComputableInPolyTime encodeNat encodeBool (fun n => decide (n % 2 = 1)))

#print axioms P3Core_implies_P1
