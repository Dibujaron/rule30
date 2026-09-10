import Rule30.Basic
import Rule30.Proofs.StepModIterateTwoMul
import Mathlib.Tactic

theorem stepMod_preperiod_of_return (n N p x : ℕ)
    (h : (stepMod n)^[N + p] x = (stepMod n)^[N] x) :
    ∀ t ≥ N, (stepMod n)^[t + p] x = (stepMod n)^[t] x := by
  intro t ht
  obtain ⟨d, rfl⟩ := Nat.exists_eq_add_of_le ht
  have e1 : (stepMod n)^[N + d + p] x = (stepMod n)^[d] ((stepMod n)^[N + p] x) := by
    rw [← Function.iterate_add_apply]; congr 1; omega
  have e2 : (stepMod n)^[N + d] x = (stepMod n)^[d] ((stepMod n)^[N] x) := by
    rw [← Function.iterate_add_apply]; congr 1; omega
  rw [e1, e2, h]

-- 5. The universal preperiod bound reduces to odd starts: even ones are a
-- scaled copy one bit narrower (`stepMod_iterate_two_mul`), and 0 is fixed.
theorem stepMod_preperiod_of_odd (B : ℕ → ℕ) (hmono : ∀ n, B n ≤ B (n + 1))
    (H : ∀ n x : ℕ, x < 2 ^ n → x % 2 = 1 → ∃ p > 0, ∀ t ≥ B n,
      (stepMod n)^[t + p] x = (stepMod n)^[t] x) :
    ∀ n x : ℕ, x < 2 ^ n → ∃ p > 0, ∀ t ≥ B n,
      (stepMod n)^[t + p] x = (stepMod n)^[t] x := by
  have hzero : ∀ n m : ℕ, (stepMod n)^[m] 0 = 0 := by
    intro n m
    induction m with
    | zero => rfl
    | succ m ih => rw [Function.iterate_succ_apply', ih]; simp [stepMod, rowStep]
  intro n
  induction n with
  | zero =>
    intro x hx
    have : x = 0 := by simpa using hx
    subst this
    exact ⟨1, one_pos, fun t _ => by rw [hzero, hzero]⟩
  | succ m ih =>
    intro x hx
    by_cases hodd : x % 2 = 1
    · exact H (m + 1) x hx hodd
    · have hx2 : x = 2 * (x / 2) := by omega
      have hs : x / 2 < 2 ^ m := by
        have hp : 2 ^ (m + 1) = 2 * 2 ^ m := by ring
        omega
      obtain ⟨p, hp, hall⟩ := ih (x / 2) hs
      refine ⟨p, hp, fun t ht => ?_⟩
      have hBm : B m ≤ B (m + 1) := hmono m
      rw [hx2, stepMod_iterate_two_mul, stepMod_iterate_two_mul, hall t (by omega)]
