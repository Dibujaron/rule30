import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence

/-!
**What this says.** If diagonal m+2 is entirely white from index N onward, then diagonal m at i+2 equals diagonal m+1 at i+1, for all i ≥ N.
**Why it is true.** The recurrence for leftDiagonal (m+2) xors together three terms; if the result is false everywhere, and the OR term is false (since leftDiagonal (m+2) is white), then the first two terms must be equal.
**Where the work is.** None — it unfolds leftDiagonal_recurrence at the two white indices and case-splits on the Bool equality.
-/

theorem leftDiagonal_shift_of_white (m N : ℕ)
    (hw : ∀ i ≥ N, leftDiagonal (m + 2) i = false) :
    ∀ i ≥ N, leftDiagonal m (i + 2) = leftDiagonal (m + 1) (i + 1) := by
  intro i hi
  have h1 := leftDiagonal_recurrence m i
  have h3 := hw (i + 1) (by omega)
  rw [h3] at h1
  have h2 := hw i hi
  cases hm : leftDiagonal m (i + 2)
  · cases hm1 : leftDiagonal (m + 1) (i + 1)
    · rfl
    · rw [hm, hm1, h2] at h1
      norm_num at h1
  · exfalso
    cases hm1 : leftDiagonal (m + 1) (i + 1) <;> (
      rw [hm, hm1, h2, h3] at h1
      norm_num at h1
    )
