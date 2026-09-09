import Rule30.Basic
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Rule30.Proofs.RowNatModEqIterate
import Mathlib.Tactic

/-!
**What this says.** Every left diagonal up to depth 5000 has settled into its own
repetition by its own index, exactly as the (still open, unbounded) onset wall claims.

**Why it is true.** `leftDiagonal_eq_rowNat_testBit` reads a diagonal off one bit of a
packed row, and a return of the low bits of two rows forces every later row to return
the same way (`iterate_eq_of_eq` below). Row `2k` and row `2k + 16` agree in their low
`k+1` bits for every `k ≤ 5000` — checked by the kernel, not argued — so period `16`
works at every depth in range.

**Where the work is.** The kernel computation itself: `decide +kernel` evaluates the
congruence at all 5001 depths through `rowNat_mod_eq_iterate`'s truncated orbit, which is
the only part of this file that is not bookkeeping.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_onset_le_of_le_5000 (k : ℕ) (hk : k ≤ 5000) :
  ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N
```
-/

private theorem iterate_eq_of_eq {α : Type} (f : α → α) (x : α) (p T : ℕ)
    (h : f^[T] x = f^[T + p] x) : ∀ t ≥ T, f^[t] x = f^[t + p] x := by
  intro t ht
  induction t, ht using Nat.le_induction with
  | base => exact h
  | succ t _ ih =>
    have e : t + 1 + p = (t + p) + 1 := by omega
    rw [e, Function.iterate_succ_apply', Function.iterate_succ_apply', ih]

private theorem rowNat_periodicFrom_of_return (k p : ℕ)
    (h : rowNat (2 * k) % 2 ^ (k + 1) = rowNat (2 * k + p) % 2 ^ (k + 1)) :
    PeriodicFrom (leftDiagonal k) p k := by
  intro n hn
  have e1 := rowNat_mod_eq_iterate (k + 1) (2 * k)
  have e2 := rowNat_mod_eq_iterate (k + 1) (2 * k + p)
  have hgT : (fun r => ((4 * r) ^^^ ((2 * r) ||| r)) % 2 ^ (k + 1))^[2 * k] (1 % 2 ^ (k + 1))
      = (fun r => ((4 * r) ^^^ ((2 * r) ||| r)) % 2 ^ (k + 1))^[2 * k + p] (1 % 2 ^ (k + 1)) := by
    rw [← e1, ← e2]; exact h
  have hall := iterate_eq_of_eq (fun r => ((4 * r) ^^^ ((2 * r) ||| r)) % 2 ^ (k + 1))
    (1 % 2 ^ (k + 1)) p (2 * k) hgT (n + k) (by omega)
  have e3 := rowNat_mod_eq_iterate (k + 1) (n + k)
  have e4 := rowNat_mod_eq_iterate (k + 1) (n + k + p)
  rw [← e3, ← e4] at hall
  have hlt : k < k + 1 := Nat.lt_succ_self k
  have hb1 : (rowNat (n + k) % 2 ^ (k + 1)).testBit k = (rowNat (n + k)).testBit k := by
    rw [Nat.testBit_mod_two_pow]; simp [hlt]
  have hb2 : (rowNat (n + k + p) % 2 ^ (k + 1)).testBit k
      = (rowNat (n + k + p)).testBit k := by
    rw [Nat.testBit_mod_two_pow]; simp [hlt]
  rw [leftDiagonal_eq_rowNat_testBit k (n + p), leftDiagonal_eq_rowNat_testBit k n,
    show n + p + k = n + k + p from by omega, ← hb1, ← hb2, hall]

theorem leftDiagonal_onset_le_of_le_5000 (k : ℕ) (hk : k ≤ 5000) :
    ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N := by
  refine ⟨16, by norm_num, k, le_rfl, rowNat_periodicFrom_of_return k 16 ?_⟩
  have hall : ∀ k' ≤ 5000,
      rowNat (2 * k') % 2 ^ (k' + 1) = rowNat (2 * k' + 16) % 2 ^ (k' + 1) := by
    set_option maxRecDepth 100000 in decide +kernel
  exact hall k hk
