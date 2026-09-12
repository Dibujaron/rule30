import Rule30.Basic

/-!
Talus, 2026-09-12.  The demonstration that `talus11_scratch_ladder.lean` can
fail.  Same definitions, one claim moved by a single cell: it asserts that no
configuration white at `x < -1` and black at `-1` has a period-2 block of **8**
cells, where the true maximum is exactly 8.  Lean must REJECT `mutant_upper`.
`mutant_true_value` is accepted and proves the mutated statement false rather
than merely unproved.
-/

namespace Talus11Mutant

def step : List Bool → List Bool
  | a :: b :: c :: rest => (xor a (b || c)) :: step (b :: c :: rest)
  | _ => []

def evolveN : Nat → List Bool → List Bool
  | 0, r => r
  | n + 1, r => evolveN n (step r)

def centre (L : Nat) (row : List Bool) (t : Nat) : Bool :=
  (evolveN t row).getD (L - t) false

def bitsOf (v : Nat) : Nat → List Bool
  | 0 => []
  | k + 1 => (v % 2 == 1) :: bitsOf (v / 2) k

def window (L a v : Nat) : List Bool :=
  List.replicate (L - a) false ++ (true :: bitsOf v (L + a - 1))

def periodicBlock (L p : Nat) (row : List Bool) : Bool :=
  (List.range (L - p)).all (fun t => centre L row (t + p) == centre L row t)

def noBlock (L a p : Nat) : Bool :=
  (List.range (2 ^ (L + a - 1))).all (fun v => !periodicBlock L p (window L a v))

set_option maxRecDepth 100000

/-- ACCEPTED, and it proves the mutated claim FALSE: a period-2 block of 8 cells
does exist in the class, so `f(2,1) = 8` and not less. -/
theorem mutant_true_value : noBlock 8 1 2 = false := by decide

/-- REJECTED: this is the mutated claim, one cell short of the truth. -/
theorem mutant_upper : noBlock 8 1 2 = true := by decide

end Talus11Mutant
