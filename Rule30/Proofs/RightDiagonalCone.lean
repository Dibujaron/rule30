import Rule30.Basic
import Rule30.Proofs.RightDiagonalFirstFailure
import Rule30.Proofs.RightDiagonalPeriodicFromPow
import Rule30.Proofs.PeriodicFromMul

/-!
**What this says.** Row `2^k` of the picture is white at every one of the `k`
cells immediately to the left of its black right edge.
**Why it is true.** Diagonal `d` (`d ≤ k`) has period `2^k` at the origin, so a
black cell there would force a matching disagreement between diagonal `d` and
itself, which `rightDiagonal_first_failure` rules out at the nearest such cell.
**Where the work is.** Turning "some cell in range is black" into a
contradiction needs the *least* such cell, since `rightDiagonal_first_failure`
only pins down where disagreements start — not any cell past that.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_cone (k : ℕ) (hk : 1 ≤ k) : rightDiagonal k (2 ^ k - k) = false
```
-/

private theorem rightDiagonal_periodicFrom_pow_le (m n : ℕ) (h : m ≤ n) :
    PeriodicFrom (rightDiagonal m) (2 ^ n) 0 := by
  have h0 := rightDiagonal_periodicFrom_pow m
  have h1 := periodicFrom_mul (rightDiagonal m) (2 ^ m) 0 h0 (2 ^ (n - m))
  rwa [← pow_add, Nat.sub_add_cancel h] at h1

private theorem cone_row (p D : ℕ)
    (hper : ∀ d : ℕ, 1 ≤ d → d ≤ D → PeriodicFrom (rightDiagonal d) p 0) :
    ∀ d : ℕ, 1 ≤ d → d ≤ D → evolve p ((p : ℤ) - (d : ℤ)) = false := by
  classical
  by_contra hcon
  push_neg at hcon
  obtain ⟨d0, hd1, hdD, hd⟩ := hcon
  have hd' : evolve p ((p : ℤ) - (d0 : ℤ)) = true := by
    revert hd; cases evolve p ((p : ℤ) - (d0 : ℤ)) <;> simp
  have hex : ∃ d : ℕ, 1 ≤ d ∧ d ≤ D ∧ evolve p ((p : ℤ) - (d : ℤ)) = true :=
    ⟨d0, hd1, hdD, hd'⟩
  set m := Nat.find hex with hmdef
  obtain ⟨hm1, hmD, hmblack⟩ := Nat.find_spec hex
  have hwhite : ∀ e : ℕ, 0 < e → e < m → evolve p ((p : ℤ) - (e : ℤ)) = false := by
    intro e he0 hem
    have hnot := Nat.find_min hex hem
    by_contra hf
    exact hnot ⟨he0, by omega, by revert hf; cases evolve p ((p : ℤ) - (e : ℤ)) <;> simp⟩
  have hff := (rightDiagonal_first_failure p m (by omega) hwhite hmblack).2
  have hper0 := hper m hm1 hmD 0 (Nat.zero_le 0)
  simp only [Nat.zero_add] at hper0
  have hL : rightDiagonal m p = evolve (m + p) (p : ℤ) := by
    unfold rightDiagonal; rw [Nat.add_comm p m]
  have hR : rightDiagonal m 0 = evolve m 0 := by
    unfold rightDiagonal; norm_num
  rw [hL, hR] at hper0
  exact hff hper0

private theorem cone_row_pow (n : ℕ) :
    ∀ d : ℕ, 1 ≤ d → d ≤ n → evolve (2 ^ n) (((2 ^ n : ℕ) : ℤ) - (d : ℤ)) = false :=
  cone_row (2 ^ n) n (fun d _ hdn => rightDiagonal_periodicFrom_pow_le d n hdn)

theorem rightDiagonal_cone (k : ℕ) (hk : 1 ≤ k) :
    rightDiagonal k (2 ^ k - k) = false := by
  have h := cone_row_pow k k hk le_rfl
  unfold rightDiagonal
  have hle : k ≤ 2 ^ k := Nat.le_of_lt (Nat.lt_two_pow_self)
  rw [show 2 ^ k - k + k = 2 ^ k by omega]
  rw [show ((2 ^ k - k : ℕ) : ℤ) = ((2 ^ k : ℕ) : ℤ) - (k : ℤ) by push_cast [hle]; omega]
  exact h
