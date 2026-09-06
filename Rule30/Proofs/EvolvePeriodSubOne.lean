import Rule30.Basic
import Rule30.Proofs.EvolveSubOneEqXor
import Mathlib.Tactic.Ring

/-!
**What this says.** If two adjacent columns both repeat with period p starting from time N, then the column to their left repeats with the same period and time.
**Why it is true.** Each cell is determined by three cells to its right, one step earlier. The left column's value at time t+p depends only on its three right neighbors at time t+p-1, which repeat via the hypothesis, so it repeats too.
**Where the work is.** Applying the backwards rule to extract the cell-left-shifts at both times, then using h0/h1 to collapse the repeated terms on both sides to the same prehistory.
-/

theorem evolve_period_sub_one (i : ℤ) (p N : ℕ)
    (h0 : ∀ t ≥ N, evolve (t + p) i = evolve t i)
    (h1 : ∀ t ≥ N, evolve (t + p) (i + 1) = evolve t (i + 1)) :
    ∀ t ≥ N, evolve (t + p) (i - 1) = evolve t (i - 1) := by
  intro t ht
  have h_t_plus_1 : t + 1 ≥ N := by omega
  rw [evolve_sub_one_eq_xor (t + p) i]
  rw [evolve_sub_one_eq_xor t i]
  rw [show t + p + 1 = t + 1 + p by ring]
  rw [h0 (t + 1) h_t_plus_1]
  rw [h0 t ht]
  rw [h1 t ht]
