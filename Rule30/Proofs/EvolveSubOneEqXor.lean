import Rule30.Basic

/-!
**What this says.** Rule 30 read backwards: the left cell one step earlier is determined by the current center and right cells.
**Why it is true.** Xor is self-inverse, so rearranging the forward rule's xor gives the backward view.
**Where the work is.** Rewrite and case-split on three booleans; reflexivity closes all eight cases.
-/

theorem evolve_sub_one_eq_xor (t : ℕ) (i : ℤ) :
    evolve t (i - 1) = xor (evolve (t + 1) i) (evolve t i || evolve t (i + 1)) := by
  rw [evolve_succ, rule30_eq]
  cases evolve (t + 1) i <;> cases evolve t i <;> cases evolve t (i + 1) <;> simp
