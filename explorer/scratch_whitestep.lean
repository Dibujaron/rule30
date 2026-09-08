import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence

/-!
Scratch, Sextant 2026-09-08: the local dictionary of an eventually-white left
diagonal, from `leftDiagonal_recurrence` alone (attack document on
`leftDiagonal_period_le`, C1). Not a node; checked with `lake env lean`.

(A) A diagonal turns white for good at the first black cell of its inner
    driver once its two drivers read as shifts of each other.
(B) Conversely, past the onset of an eventually-white diagonal its two
    drivers are shifts of each other.
(C) The diagonal two in from an eventually-white one is black for good from
    the first black cell of the diagonal between them.
(D) The diagonal after an eventually-black one is the complement of the
    diagonal two out, shifted by one.
-/

theorem leftDiagonal_white_of_shift (m N j : ℕ) (hNj : N ≤ j)
    (hshift : ∀ i ≥ N, leftDiagonal (m + 1) (i + 1) = leftDiagonal m (i + 2))
    (hblack : leftDiagonal (m + 1) (j + 1) = true) :
    ∀ i ≥ j + 1, leftDiagonal (m + 2) i = false := by
  intro i hi
  induction i, hi using Nat.le_induction with
  | base =>
    rw [leftDiagonal_recurrence m j, ← hshift j hNj, hblack]
    generalize leftDiagonal (m + 2) j = x
    cases x <;> rfl
  | succ i hi ih =>
    rw [leftDiagonal_recurrence m i, ← hshift i (by omega), ih]
    generalize leftDiagonal (m + 1) (i + 1) = b
    cases b <;> rfl

theorem leftDiagonal_shift_of_white (m N : ℕ)
    (hw : ∀ i ≥ N, leftDiagonal (m + 2) i = false) :
    ∀ i ≥ N, leftDiagonal m (i + 2) = leftDiagonal (m + 1) (i + 1) := by
  intro i hi
  have R := leftDiagonal_recurrence m i
  rw [hw (i + 1) (by omega), hw i hi] at R
  revert R
  generalize leftDiagonal m (i + 2) = a
  generalize leftDiagonal (m + 1) (i + 1) = b
  cases a <;> cases b <;> decide

theorem leftDiagonal_black_after_white (m N j : ℕ) (hNj : N ≤ j)
    (hw : ∀ i ≥ N, leftDiagonal (m + 1) i = false)
    (hb : leftDiagonal (m + 2) (j + 1) = true) :
    ∀ i ≥ j + 1, leftDiagonal (m + 3) i = true := by
  intro i hi
  induction i, hi using Nat.le_induction with
  | base =>
    have R := leftDiagonal_recurrence (m + 1) j
    rw [show m + 1 + 2 = m + 3 from by omega, show m + 1 + 1 = m + 2 from by omega] at R
    rw [R, hw (j + 2) (by omega), hb]
    generalize leftDiagonal (m + 3) j = x
    cases x <;> rfl
  | succ i hi ih =>
    have R := leftDiagonal_recurrence (m + 1) i
    rw [show m + 1 + 2 = m + 3 from by omega, show m + 1 + 1 = m + 2 from by omega] at R
    rw [R, hw (i + 2) (by omega), ih]
    generalize leftDiagonal (m + 2) (i + 1) = b
    cases b <;> rfl

theorem leftDiagonal_compl_after_black (m N : ℕ)
    (hb : ∀ i ≥ N, leftDiagonal (m + 3) i = true) :
    ∀ i ≥ N, leftDiagonal (m + 4) (i + 1) = !leftDiagonal (m + 2) (i + 2) := by
  intro i hi
  have R := leftDiagonal_recurrence (m + 2) i
  rw [show m + 2 + 2 = m + 4 from by omega, show m + 2 + 1 = m + 3 from by omega] at R
  rw [R, hb (i + 1) (by omega)]
  generalize leftDiagonal (m + 2) (i + 2) = a
  generalize leftDiagonal (m + 4) i = x
  cases a <;> cases x <;> rfl

#print axioms leftDiagonal_white_of_shift
#print axioms leftDiagonal_shift_of_white
#print axioms leftDiagonal_black_after_white
#print axioms leftDiagonal_compl_after_black
