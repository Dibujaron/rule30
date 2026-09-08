import Rule30.Basic

/-!
Kernel checks for the attack document of 2026-09-08 on
`rightDiagonal_period_doubles_iff_odd_weight`.
`lake env lean explorer/scratch_rightdoubling.lean` either accepts this file
or does not.

The engine (`explorer/sextant_rightperiods.mjs`) says the right diagonals'
minimal periods run `1 2 2 4 8 8 16 32 32 64 64 ...`, with no transient, and
that the period doubles at depth `k` exactly when the driver
`g k j = rightDiagonal (k-1) (j+1) || rightDiagonal (k-2) (j+2)`
(the driver of `rightDiagonal_recurrence`) has odd weight over one period
`L = max (P (k-1)) (P (k-2))`.

Here the kernel checks, through `rowCell`, which `rowCell_eq_evolve` ties to
`evolve`, one instance of each branch, each including the index `j = 0` that
the left diagonals have no access to:

1. a doubling. `k = 6`, `L = 8`: the driver has odd weight over `[0, 8)`, and
   `rightDiagonal 6` is 16-periodic from `j = 0` while not 8-periodic there.
2. a non-doubling. `k = 10`, `L = 64`: the driver has even weight over
   `[0, 64)`, and `rightDiagonal 10` is 64-periodic from `j = 0` while not
   32-periodic there.

Neither is a theorem about all `k`; each is the instance the document's
claims C1 and C2 predict, checked rather than computed.
-/

set_option maxRecDepth 100000

/-- `rightDiagonal k j` through the row model. -/
def rd (k j : Nat) : Bool := rowCell (j + k) (j : Int)

/-- The driver of `rightDiagonal_recurrence` at depth `k`, index `j`. -/
def gd (k j : Nat) : Bool := rd (k - 1) (j + 1) || rd (k - 2) (j + 2)

/-- The weight of the driver over `[0, L)`, mod 2. -/
def wt (k L : Nat) : Bool := (List.range L).foldl (fun b j => xor b (gd k j)) false

-- 1. depth 6, L = 8: odd weight, period 16, not 8
theorem wt_six : wt 6 8 = true := by decide
theorem per_six : (List.range 128).all (fun j => rd 6 (j + 16) == rd 6 j) = true := by decide
theorem not_half_six : rd 6 0 ≠ rd 6 8 := by decide

-- 2. depth 10, L = 64: even weight, period 64, not 32
theorem wt_ten : wt 10 64 = false := by decide
theorem per_ten : (List.range 256).all (fun j => rd 10 (j + 64) == rd 10 j) = true := by decide
theorem not_half_ten : ¬ ((List.range 64).all (fun j => rd 10 (j + 32) == rd 10 j) = true) := by decide

#print axioms wt_six
#print axioms per_six
#print axioms not_half_six
#print axioms wt_ten
#print axioms per_ten
#print axioms not_half_ten
