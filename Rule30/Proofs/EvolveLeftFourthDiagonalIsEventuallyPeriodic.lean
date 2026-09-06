import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.EvolveLeftFourthDiagonal

theorem evolve_left_fourth_diagonal_isEventuallyPeriodic :
    IsEventuallyPeriodic (fun j => evolve (j + 3) (-(j : ℤ))) := by
  use 2
  constructor
  · omega
  use 0
  intro n _
  simp only []
  have h1 : evolve ((n + 2) + 3) (-(↑(n + 2) : ℤ)) = decide ((n + 2) % 2 = 0) := evolve_left_fourth_diagonal (n + 2)
  have h2 : evolve (n + 3) (-(↑n : ℤ)) = decide (n % 2 = 0) := evolve_left_fourth_diagonal n
  rw [h1, h2]
  have : (n + 2) % 2 = n % 2 := by omega
  rw [this]
