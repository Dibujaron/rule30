import Rule30.Basic

/-! Talus, 2026-09-10.  MUTANT of `talus6_scratch_mgap.lean`, kept because a
check that has never been seen to fail is not yet a check.

Identical to that file's part (a) except that the range of `k` is
`mgap p + 1` instead of `mgap p`, so it also asks depth `k = mgap p` to
respect the shift.  It must FAIL, at `j = 0`, since that is exactly the
disagreement `rightDiagonal_first_failure` produces.  If this file is
accepted, the real check is vacuous and must not be believed.
-/

def firstBlackLeft (p : Nat) : Nat → Nat → Nat
  | 0, m => m
  | Nat.succ fuel, m =>
      if rowCell p ((p : ℤ) - (m : ℤ)) = true then m else firstBlackLeft p fuel (m + 1)

def mgap (p : Nat) : Nat := firstBlackLeft p (2 * p + 2) 1

set_option maxRecDepth 200000 in
example :
    (List.range 24).all (fun i =>
      let p := i + 1
      (List.range (mgap p + 1)).all (fun k =>
        (List.range 16).all (fun j =>
          rowCell (j + p + k) ((j : ℤ) + (p : ℤ)) == rowCell (j + k) (j : ℤ)))) = true := by
  decide
