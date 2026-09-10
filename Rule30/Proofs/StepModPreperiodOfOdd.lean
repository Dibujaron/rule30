import Rule30.Basic
import Rule30.Proofs.StepModIterateTwoMul

/-!
**What this says.** If a preperiod bound B works for every odd starting row below 2^n, it works for every starting row below 2^n, odd or even.
**Why it is true.** An even row is twice a row one bit narrower, and `stepMod_iterate_two_mul` says the width-(n+1) orbit of a doubled start is just twice the width-n orbit -- so an even start's periodicity comes straight from this same fact one level down, bottoming out at the fixed point 0.
**Where the work is.** None of the steps is hard alone; the care is inducting on n rather than x, so the even case recurses into this theorem one level narrower instead of citing H.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.stepMod_preperiod_of_odd (B : ℕ → ℕ) (hmono : ∀ (n : ℕ), B n ≤ B (n + 1))
  (H : ∀ (n x : ℕ), x < 2 ^ n → x % 2 = 1 → ∃ p > 0, ∀ t ≥ B n, (stepMod n)^[t + p] x = (stepMod n)^[t] x) (n x : ℕ) :
  x < 2 ^ n → ∃ p > 0, ∀ t ≥ B n, (stepMod n)^[t + p] x = (stepMod n)^[t] x
```
-/

theorem stepMod_preperiod_of_odd (B : ℕ → ℕ) (hmono : ∀ n, B n ≤ B (n + 1))
    (H : ∀ n x : ℕ, x < 2 ^ n → x % 2 = 1 → ∃ p > 0, ∀ t ≥ B n,
      (stepMod n)^[t + p] x = (stepMod n)^[t] x) :
    ∀ n x : ℕ, x < 2 ^ n → ∃ p > 0, ∀ t ≥ B n,
      (stepMod n)^[t + p] x = (stepMod n)^[t] x := by
  intro n
  induction n with
  | zero =>
      intro x hx
      have hx0 : x = 0 := by omega
      subst hx0
      have hz : stepMod 0 0 = 0 := by decide
      refine ⟨1, one_pos, fun t _ => ?_⟩
      rw [Function.iterate_fixed hz (t + 1), Function.iterate_fixed hz t]
  | succ k ih =>
      intro x hx
      rcases Nat.even_or_odd x with he | ho
      · obtain ⟨s, hs⟩ := he
        have hpow : 2 ^ (k + 1) = 2 * 2 ^ k := by ring
        have hs_lt : s < 2 ^ k := by omega
        have hx2 : x = 2 * s := by omega
        obtain ⟨p, hp, hper⟩ := ih s hs_lt
        refine ⟨p, hp, fun t ht => ?_⟩
        have htk : t ≥ B k := le_trans (hmono k) ht
        have heq := hper t htk
        have e1 := stepMod_iterate_two_mul k (t + p) s
        have e2 := stepMod_iterate_two_mul k t s
        rw [hx2, e1, e2, heq]
      · have hodd : x % 2 = 1 := Nat.odd_iff.mp ho
        exact H (k + 1) x hx hodd
