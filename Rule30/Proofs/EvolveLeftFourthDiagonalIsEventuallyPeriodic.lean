import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.EvolveLeftFourthDiagonal

/-!
**What this says.** The alternating diagonal is eventually periodic, in
exactly the sense the first prize question denies of the centre column. It
says nothing about that question: this is the edge of the cone, not the
middle.

**Why it is true.** Period 2, starting from the very first term. The closed
form makes each entry depend only on whether `t` is even, and adding 2 does
not change that.

**Where the work is.** Nowhere. `IsEventuallyPeriodic` is an existential --
it asks for a period and a starting point -- and the proof mostly just hands
it 2 and 0. Naming the witnesses is what proving an existential consists of.
-/

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
