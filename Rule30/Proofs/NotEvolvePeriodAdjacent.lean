import Rule30.Basic
import Rule30.Proofs.EvolvePeriodSub
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveEqFalseOfOutsideCone
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring

/-!
**What this says.** No two side-by-side columns can both repeat, with the
same positive period, from any common starting time.
**Why it is true.** If they did, that shared period would propagate leftward
forever (`evolve_period_sub`), reaching a column so far out that the light
cone hasn't touched it yet by the later of the two times it's compared at --
so it must be white there -- while the left edge of the cone is always
black. The two can't both be true of the same cell.
**Where the work is.** Picking a column far enough left, and a pair of times
a period apart that land outside the cone at the earlier one and on the edge
at the later one; once picked, the contradiction is immediate.
-/

theorem not_evolve_period_adjacent (i : ℤ) (p N : ℕ) (hp : 0 < p)
    (h0 : ∀ t ≥ N, evolve (t + p) i = evolve t i)
    (h1 : ∀ t ≥ N, evolve (t + p) (i + 1) = evolve t (i + 1)) : False := by
  obtain ⟨m, hm⟩ : ∃ m : ℕ, m = N + p + (-i).toNat + 1 := ⟨_, rfl⟩
  obtain ⟨k, hk⟩ : ∃ k : ℕ, k = (i + (m : ℤ)).toNat := ⟨_, rfl⟩
  have hik : i - (k : ℤ) = -(m : ℤ) := by omega
  have hmp : p ≤ m := by omega
  have htN : m - p ≥ N := by omega
  have hperiod := evolve_period_sub i p N h0 h1 k (m - p) htN
  rw [hik] at hperiod
  have heq : (m - p) + p = m := by omega
  rw [heq] at hperiod
  have hleft : evolve m (-(m : ℤ)) = true := evolve_left_edge m
  have hout : evolve (m - p) (-(m : ℤ)) = false := by
    apply evolve_eq_false_of_outside_cone
    rw [abs_neg, Nat.abs_cast]
    exact_mod_cast (by omega : m - p < m)
  rw [hleft, hout] at hperiod
  exact Bool.noConfusion hperiod
