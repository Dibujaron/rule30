import Rule30.Basic
import Rule30.Proofs.RightmostDifferenceMovesRight
import Mathlib.Logic.Function.Basic

/-!
**What this says.** If two rows agree everywhere strictly right of the origin
and have the same centre column over time, the two rows are identical.
**Why it is true.** Any difference would have a leftmost witness at some
`-m`; agreement right of `-m` then follows from the right-half hypothesis
(for positive positions) and from `-m` being leftmost (for the negative
positions in between), so `rightmost_difference_moves_right` carries that
difference to the origin at time `m`, contradicting the shared column.
**Where the work is.** Building the `∀ j, -m < j → X j = Y j` hypothesis the
served lemma needs, by splitting on the sign of `j` and using `Nat.find`'s
minimality on the negative side.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.config_eq_of_right_and_column (X Y : Config) (hright : ∀ (k : ℕ), X (↑k + 1) = Y (↑k + 1))
  (hcol : ∀ (t : ℕ), column X 0 t = column Y 0 t) : X = Y
```
-/

theorem config_eq_of_right_and_column (X Y : Config)
    (hright : ∀ k : ℕ, X ((k : ℤ) + 1) = Y ((k : ℤ) + 1))
    (hcol : ∀ t : ℕ, column X 0 t = column Y 0 t) :
    X = Y := by
  classical
  by_contra hXY
  obtain ⟨p, hp⟩ := Function.ne_iff.mp hXY
  have hple : p ≤ 0 := by
    by_contra hp0
    push Not at hp0
    have hk : ((p - 1).toNat : ℤ) = p - 1 := Int.toNat_of_nonneg (by omega)
    have hr := hright (p - 1).toNat
    rw [hk] at hr
    have e : p - 1 + 1 = p := by omega
    rw [e] at hr
    exact hp hr
  have hcast0 : ((-p).toNat : ℤ) = -p := Int.toNat_of_nonneg (by omega)
  have e0 : -(((-p).toNat : ℤ)) = p := by omega
  have hp' : X (-(((-p).toNat : ℤ))) ≠ Y (-(((-p).toNat : ℤ))) := by rw [e0]; exact hp
  have h : ∃ n : ℕ, X (-(n : ℤ)) ≠ Y (-(n : ℤ)) := ⟨(-p).toNat, hp'⟩
  have hm := Nat.find_spec h
  have hagree : ∀ j : ℤ, -((Nat.find h : ℕ) : ℤ) < j → X j = Y j := by
    intro j hj
    by_cases hjpos : 0 < j
    · have hk : ((j - 1).toNat : ℤ) = j - 1 := Int.toNat_of_nonneg (by omega)
      have hr := hright (j - 1).toNat
      rw [hk] at hr
      have e : j - 1 + 1 = j := by omega
      rwa [e] at hr
    · push Not at hjpos
      have hcast : (((-j).toNat : ℕ) : ℤ) = -j := Int.toNat_of_nonneg (by omega)
      have hlt : (-j).toNat < Nat.find h := by omega
      have hne := Nat.find_min h hlt
      rw [not_not] at hne
      have e : -(((-j).toNat : ℤ)) = j := by omega
      rwa [e] at hne
  have hfinal := rightmost_difference_moves_right X Y (-((Nat.find h : ℕ) : ℤ)) (Nat.find h) hagree hm
  have e2 : -((Nat.find h : ℕ) : ℤ) + ((Nat.find h : ℕ) : ℤ) = 0 := by omega
  rw [e2] at hfinal
  have hcolm : evolveFrom X (Nat.find h) 0 = evolveFrom Y (Nat.find h) 0 := hcol (Nat.find h)
  exact hfinal.1 hcolm
