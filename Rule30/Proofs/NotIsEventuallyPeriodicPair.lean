import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.NotIsEventuallyPeriodicAdjacent
import Rule30.Proofs.EvolveIsEventuallyPeriodicOfBetween

/-!
**What this says.** Jen's theorem: no two distinct columns of the automaton, however far apart, are both eventually periodic.
**Why it is true.** If the two columns are adjacent this is already known; otherwise the column just right of the left one sits strictly between them, so it too is eventually periodic, and then it and its left neighbour are the adjacent case.
**Where the work is.** Lining up the strip width so the "column strictly between" lemma's two boundary indices land exactly on the given pair.
-/

theorem not_isEventuallyPeriodic_pair (i j : ℤ) (hij : i < j) :
    ¬ (IsEventuallyPeriodic (fun t => evolve t i) ∧
        IsEventuallyPeriodic (fun t => evolve t j)) := by
  rintro ⟨hi, hj⟩
  apply not_isEventuallyPeriodic_adjacent i
  refine ⟨hi, ?_⟩
  rcases eq_or_lt_of_le (show i + 1 ≤ j by omega) with h | h
  · rw [h]; exact hj
  · have e : i + 1 + (((j - i - 2).toNat : ℕ) : ℤ) + 1 = j := by
      rw [Int.toNat_of_nonneg (by omega : (0:ℤ) ≤ j - i - 2)]; ring
    have ha : IsEventuallyPeriodic fun t => evolve t (i + 1 - 1) := by
      rw [show i + 1 - 1 = i from by ring]; exact hi
    have hc : IsEventuallyPeriodic fun t => evolve t (i + 1 + ((j - i - 2).toNat : ℕ) + 1) := by
      rw [e]; exact hj
    exact evolve_isEventuallyPeriodic_of_between (i + 1) (j - i - 2).toNat ha hc
