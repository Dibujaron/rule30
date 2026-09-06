import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.EvolveLeftDiagonalIsEventuallyPeriodicStep

/-!
**What this says.** Every diagonal counted in from the left edge eventually
settles into a repeating pattern, however far in from the edge it is.

**Why it is true.** Strong induction on the distance from the edge. The
first two diagonals are constantly black, which is periodic with period 1
from the start; every diagonal after that is built from the two before it
by `evolve_left_diagonal_isEventuallyPeriodic_step`, which already does the
real work of turning "the two inputs repeat" into "so does the output".

**Where the work is.** Nowhere new. The two base cases just cite
`evolve_left_edge` / `evolve_left_second_diagonal` at the two indices the
goal happens to present (`n + 0` and `n + 1 + 0`, `n + 1` and `n + 1 + 1`),
and the inductive case is one application of the step lemma to the two
induction hypotheses two and one short of the target.
-/

theorem evolve_left_diagonals_isEventuallyPeriodic :
    ∀ k : ℕ, IsEventuallyPeriodic (fun j => evolve (j + k) (-(j : ℤ))) := by
  intro k
  induction k using Nat.strong_induction_on with
  | _ k ih =>
    match k, ih with
    | 0, _ =>
      refine ⟨1, by omega, 0, ?_⟩
      intro n _
      simp only []
      have h1 : evolve (n + 1 + 0) (-((n + 1 : ℕ) : ℤ)) = true := by
        rw [show n + 1 + 0 = n + 1 from by omega]
        exact evolve_left_edge (n + 1)
      have h2 : evolve (n + 0) (-(n : ℤ)) = true := by
        rw [show n + 0 = n from by omega]
        exact evolve_left_edge n
      rw [h1, h2]
    | 1, _ =>
      refine ⟨1, by omega, 0, ?_⟩
      intro n _
      simp only []
      have h1 : evolve (n + 1 + 1) (-((n + 1 : ℕ) : ℤ)) = true :=
        evolve_left_second_diagonal (n + 1)
      have h2 : evolve (n + 1) (-(n : ℤ)) = true :=
        evolve_left_second_diagonal n
      rw [h1, h2]
    | m + 2, ih =>
      have h0 := ih m (by omega)
      have h1 := ih (m + 1) (by omega)
      exact evolve_left_diagonal_isEventuallyPeriodic_step m h0 h1
