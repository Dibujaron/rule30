import Rule30.Basic
import Rule30.Proofs.EvolveEqFalseOfOutsideCone
import Rule30.Proofs.LeftDiagonalPeriodicFromPow
import Rule30.Proofs.PeriodicFromMul
import Mathlib.Algebra.Order.Ring.Int
import Mathlib.Tactic.Ring

/-!
**What this says.** The picture grown from the settled row is the settled region of the seed's own picture: every cell of it is a cell of the seed's picture read far down a left diagonal, past every transient.
**Why it is true.** Take the seed's row at time 2^(t+x+1) and slide it so its left edge sits at the origin; it agrees with the settled row on every cell within distance t of x, because each diagonal has repeated with period a power of two by then (leftDiagonal_periodicFrom_pow) and everything left of the edge is white. A cell after t steps depends only on that window, and growing a shifted row just shifts the picture.
**Where the work is.** Choosing the slid row's time as 2^(t+x+1) so the target cell needs no periodicity at all, and the natural-number arithmetic that the other window cells' indices differ by a multiple of their diagonal's period.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.column_settledConfig_eq (t : ℕ) (x : ℤ) (hx : -↑t ≤ x) :
  column settledConfig x t = leftDiagonal (↑t + x).toNat (2 ^ ((↑t + x).toNat + 1) - x).toNat
```
-/

/-- `n < 2 ^ n`, proved here so no Mathlib name has to be guessed. -/
private theorem lt_two_pow (n : ℕ) : n < 2 ^ n := by
  induction n with
  | zero => norm_num
  | succ m ih => rw [Nat.pow_succ]; omega

/-- Two rows that agree within distance `t` of `x` grow the same cell at `x` after `t` steps. -/
private theorem agree_window (t : ℕ) : ∀ (c d : Config) (x : ℤ),
    (∀ y : ℤ, x - t ≤ y → y ≤ x + t → c y = d y) → evolveFrom c t x = evolveFrom d t x := by
  induction t with
  | zero =>
    intro c d x h
    show c x = d x
    exact h x (by omega) (by omega)
  | succ n ih =>
    intro c d x h
    rw [evolveFrom_succ, evolveFrom_succ, rule30_eq, rule30_eq]
    have h1 := ih c d (x - 1) (fun y hy1 hy2 => h y (by omega) (by omega))
    have h2 := ih c d x (fun y hy1 hy2 => h y (by omega) (by omega))
    have h3 := ih c d (x + 1) (fun y hy1 hy2 => h y (by omega) (by omega))
    rw [h1, h2, h3]

/-- Growing the seed's row at time `T`, slid so its left edge is at the origin, gives the seed's
picture slid the same way. -/
private theorem evolveFrom_shifted (T t : ℕ) : ∀ x : ℤ,
    evolveFrom (fun y => evolve T (y - T)) t x = evolve (T + t) (x - T) := by
  induction t with
  | zero => intro x; rfl
  | succ n ih =>
    intro x
    rw [evolveFrom_succ, rule30_eq, ih, ih, ih,
      show T + (n + 1) = T + n + 1 from by omega, evolve_succ, rule30_eq,
      show x - 1 - (T : ℤ) = x - T - 1 from by ring,
      show x + 1 - (T : ℤ) = x - T + 1 from by ring]

theorem column_settledConfig_eq (t : ℕ) (x : ℤ) (hx : -(t : ℤ) ≤ x) :
    column settledConfig x t
      = leftDiagonal (t + x).toNat (2 ^ ((t + x).toNat + 1) - x).toNat := by
  obtain ⟨k, hk⟩ : ∃ k : ℕ, k = (t + x).toNat := ⟨_, rfl⟩
  rw [← hk]
  obtain ⟨T, hT⟩ : ∃ T : ℕ, T = 2 ^ (k + 1) := ⟨_, rfl⟩
  have hTz : (T : ℤ) = 2 ^ (k + 1) := by rw [hT]; norm_num
  rw [← hTz]
  have hk2 : k < 2 ^ k := lt_two_pow k
  have hpow_k : 2 ^ (k + 1) = 2 * 2 ^ k := by ring
  have hkT : k < T := by omega
  have hwin : ∀ y : ℤ, x - t ≤ y → y ≤ x + t → settledConfig y = evolve T (y - T) := by
    intro y hy1 hy2
    by_cases hy0 : 0 ≤ y
    · obtain ⟨m, hm⟩ : ∃ m : ℕ, m = y.toNat := ⟨_, rfl⟩
      have hmy : (m : ℤ) = y := by omega
      have hmk : m ≤ k := by omega
      have hm2 : m < 2 ^ m := lt_two_pow m
      have hpow_m : 2 ^ (m + 1) = 2 * 2 ^ m := by ring
      have hAB : 2 ^ (m + 1) ≤ 2 ^ (k + 1) := Nat.pow_le_pow_right (by norm_num) (by omega)
      have hmT : m ≤ T := by omega
      show (if 0 ≤ y then leftDiagonal y.toNat (2 ^ (y.toNat + 1) - y.toNat) else false)
        = evolve T (y - T)
      rw [if_pos hy0, ← hm]
      obtain ⟨N, hN, hper⟩ := leftDiagonal_periodicFrom_pow m
      have hmul := periodicFrom_mul _ _ _ hper (2 ^ (k - m + 1) - 2)
      have hprod : (2 ^ (k - m + 1) - 2) * 2 ^ m = 2 ^ (k + 1) - 2 ^ (m + 1) := by
        have e1 : 2 ^ (k - m + 1) * 2 ^ m = 2 ^ (k + 1) := by
          rw [← Nat.pow_add, show k - m + 1 + m = k + 1 from by omega]
        have e2 : 2 * 2 ^ m = 2 ^ (m + 1) := by ring
        rw [Nat.sub_mul, e1, e2]
      have hidx : 2 ^ (m + 1) - m + (2 ^ (k - m + 1) - 2) * 2 ^ m = T - m := by
        rw [hprod, hT]; omega
      have hp := hmul (2 ^ (m + 1) - m) (by omega)
      rw [hidx] at hp
      rw [← hp]
      unfold leftDiagonal
      rw [show T - m + m = T from by omega,
        show -(((T - m : ℕ) : ℤ)) = y - T from by omega]
    · show (if 0 ≤ y then leftDiagonal y.toNat (2 ^ (y.toNat + 1) - y.toNat) else false)
        = evolve T (y - T)
      rw [if_neg hy0]
      have habs : (T : ℤ) < |y - T| := by
        rw [abs_of_nonpos (show y - (T : ℤ) ≤ 0 by omega)]; omega
      exact (evolve_eq_false_of_outside_cone T (y - T) habs).symm
  have hA : column settledConfig x t = evolveFrom (fun y => evolve T (y - T)) t x :=
    agree_window t settledConfig (fun y => evolve T (y - T)) x hwin
  rw [hA, evolveFrom_shifted T t x]
  unfold leftDiagonal
  rw [show ((T : ℤ) - x).toNat + k = T + t from by omega,
    show -((((T : ℤ) - x).toNat : ℕ) : ℤ) = x - T from by omega]
