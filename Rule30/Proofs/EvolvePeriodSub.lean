import Rule30.Basic
import Rule30.Proofs.EvolvePeriodSubOne
import Mathlib.Tactic.Ring

/-!
**What this says.** If two neighbouring columns both repeat with period p from time N, then every column further to the left repeats with that same p and N too.
**Why it is true.** `evolve_period_sub_one` moves the periodic pair one column left; applying it k times, always carrying the current column and its right neighbour together, reaches column i-k.
**Where the work is.** Aligning the induction's `i - (k+1 : ℕ)` with the shape `evolve_period_sub_one` expects, `i - k - 1`, is pure cast arithmetic (`push_cast; ring`) and not the mathematical content.
-/

theorem evolve_period_sub (i : ℤ) (p N : ℕ)
    (h0 : ∀ t ≥ N, evolve (t + p) i = evolve t i)
    (h1 : ∀ t ≥ N, evolve (t + p) (i + 1) = evolve t (i + 1)) :
    ∀ k : ℕ, ∀ t ≥ N, evolve (t + p) (i - k) = evolve t (i - k) := by
  have key : ∀ k : ℕ,
      (∀ t ≥ N, evolve (t + p) (i - (k : ℤ)) = evolve t (i - (k : ℤ))) ∧
      (∀ t ≥ N, evolve (t + p) (i - (k : ℤ) + 1) = evolve t (i - (k : ℤ) + 1)) := by
    intro k
    induction k with
    | zero => simpa using ⟨h0, h1⟩
    | succ k ih =>
      have hstep := evolve_period_sub_one (i - (k : ℤ)) p N ih.1 ih.2
      refine ⟨?_, ?_⟩
      · rw [show i - ((k + 1 : ℕ) : ℤ) = i - (k : ℤ) - 1 from by push_cast; ring]
        exact hstep
      · rw [show i - ((k + 1 : ℕ) : ℤ) + 1 = i - (k : ℤ) from by push_cast; ring]
        exact ih.1
  intro k
  exact (key k).1
