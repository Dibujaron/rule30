import Rule30.Basic

/-!
Kernel checks for the attack document of 2026-09-07 on the transients of the
left diagonals under a periodic boundary. `lake env lean explorer/scratch_doubling.lean`
either accepts this file or does not.

The engine (`explorer/forbit.mjs`) says left diagonal 400 settles at index 98
with period 16 and is not 8-periodic there, and diagonal 29 settles at index 1
with period 8 and is not 4-periodic there. Here the kernel checks the finite
form of both from `rowCell`, which `rowCell_eq_evolve` ties to `evolve`:

1. `leftDiagonal 400 (98 + j + 16) = leftDiagonal 400 (98 + j)` for `j < 128`,
   and `leftDiagonal 400 98 ≠ leftDiagonal 400 106`;
2. `leftDiagonal 29 (1 + j + 8) = leftDiagonal 29 (1 + j)` for `j < 128`,
   and `leftDiagonal 29 1 ≠ leftDiagonal 29 5`.

Neither is a theorem about eventual periods; both are the instances the
document's claim C2 (unbounded periods) predicts at its first two doublings.
-/

set_option maxRecDepth 100000

/-- `leftDiagonal k j` through the row model. -/
def dg (k j : Nat) : Bool := rowCell (j + k) (-(j : Int))

-- 1. diagonal 400: 16-periodic on [98, 242), not 8-periodic at 98
example : (List.range 128).all (fun j => dg 400 (98 + j + 16) == dg 400 (98 + j)) = true := by decide
example : dg 400 98 ≠ dg 400 106 := by decide

-- 2. diagonal 29: 8-periodic on [1, 145), not 4-periodic at 1
example : (List.range 128).all (fun j => dg 29 (1 + j + 8) == dg 29 (1 + j)) = true := by decide
example : dg 29 1 ≠ dg 29 5 := by decide
