import Rule30.Basic
import Rule30.Proofs.RightDiagonalRecurrence
import Mathlib.Tactic

/-!
**What this says.** If two neighbouring right diagonals both repeat every `L` steps and the
driver they feed the next one is black an even number of times per block, that next diagonal
repeats every `L` steps too -- no doubling.
**Why it is true.** Each cell along the diagonal is the previous cell XOR'd with the driver
(`rightDiagonal_recurrence`), so `L` steps XOR in the driver's whole window; an even number of
`true`s in that window cancels out, leaving the cell unchanged one period later.
**Where the work is.** The window of `L` driver values starting at any `n` has the same parity as
the one starting at `0`, because the driver itself repeats with period `L`: sliding the window by
one drops a cell and picks up its repeat of the same value, so the total is unchanged.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_periodicFrom_step_of_even_driver (k L : ℕ) (hL0 : PeriodicFrom (rightDiagonal k) L 0)
  (hL1 : PeriodicFrom (rightDiagonal (k + 1)) L 0)
  (heven :
    Even (∑ j ∈ Finset.range L, if (rightDiagonal (k + 1) (j + 1) || rightDiagonal k (j + 2)) = true then 1 else 0)) :
  PeriodicFrom (rightDiagonal (k + 2)) L 0
```
-/

private lemma xor_eq_true (a b : Bool) : xor a b = true ↔ a ≠ b := by
  cases a <;> cases b <;> simp

/-- The cumulative XOR of `c` over the `n` indices starting at `i`. -/
private def blockXor (c : ℕ → Bool) (i : ℕ) : ℕ → Bool
  | 0 => false
  | n + 1 => xor (blockXor c i n) (c (i + n))

private lemma walk (c x : ℕ → Bool) (hrec : ∀ i, x (i + 1) = xor (x i) (c i)) :
    ∀ i n, x (i + n) = xor (x i) (blockXor c i n) := by
  intro i n
  induction n with
  | zero => simp [blockXor]
  | succ n ih =>
      have hstep : x (i + n + 1) = xor (x (i + n)) (c (i + n)) := hrec (i + n)
      calc x (i + (n + 1)) = x (i + n + 1) := rfl
        _ = xor (x (i + n)) (c (i + n)) := hstep
        _ = xor (xor (x i) (blockXor c i n)) (c (i + n)) := by rw [ih]
        _ = xor (x i) (blockXor c i (n + 1)) := by
              show xor (xor (x i) (blockXor c i n)) (c (i + n))
                  = xor (x i) (xor (blockXor c i n) (c (i + n)))
              cases (x i) <;> cases (blockXor c i n) <;> cases (c (i + n)) <;> rfl

private lemma blockXor_parity (c : ℕ → Bool) (i : ℕ) :
    ∀ n, blockXor c i n = true ↔
      (Finset.range n).sum (fun j => if c (i + j) then 1 else 0) % 2 = 1 := by
  intro n
  induction n with
  | zero => simp [blockXor]
  | succ n ih =>
      rw [Finset.sum_range_succ]
      show xor (blockXor c i n) (c (i + n)) = true ↔ _
      rw [xor_eq_true]
      cases hb : blockXor c i n <;> cases hc : c (i + n) <;> simp_all <;> omega

/-- Sliding a length-`L` window of a period-`L` driver by one leaves its sum unchanged: the
cell dropped off the front reappears, with the same value, at the back. -/
private lemma windowSum_shift (c : ℕ → Bool) (L : ℕ) (hcper : PeriodicFrom c L 0) (n : ℕ) :
    (Finset.range L).sum (fun j => if c (n + 1 + j) then 1 else 0)
      = (Finset.range L).sum (fun j => if c (n + j) then 1 else 0) := by
  have step1 : (Finset.range (L + 1)).sum (fun j => if c (n + j) then 1 else 0)
      = (Finset.range L).sum (fun j => if c (n + j) then 1 else 0)
        + (if c (n + L) then 1 else 0) :=
    Finset.sum_range_succ (fun j => if c (n + j) then 1 else 0) L
  have step2 : (Finset.range (L + 1)).sum (fun j => if c (n + j) then 1 else 0)
      = (Finset.range L).sum (fun j => if c (n + (j + 1)) then 1 else 0)
        + (if c (n + 0) then 1 else 0) :=
    Finset.sum_range_succ' (fun j => if c (n + j) then 1 else 0) L
  have hAeq : (Finset.range L).sum (fun j => if c (n + (j + 1)) then 1 else 0)
      = (Finset.range L).sum (fun j => if c (n + 1 + j) then 1 else 0) := by
    apply Finset.sum_congr rfl
    intro j _
    rw [show n + (j + 1) = n + 1 + j by omega]
  have hfn0 : (if c (n + 0) then 1 else 0) = (if c n then 1 else 0) := by
    rw [show n + 0 = n by omega]
  have hfnL : (if c (n + L) then 1 else 0) = (if c n then 1 else 0) := by
    have hcnL : c (n + L) = c n := hcper n (by omega)
    rw [hcnL]
  rw [hAeq, hfn0] at step2
  rw [hfnL] at step1
  omega

private lemma windowSum_const (c : ℕ → Bool) (L : ℕ) (hcper : PeriodicFrom c L 0) (n : ℕ) :
    (Finset.range L).sum (fun j => if c (n + j) then 1 else 0)
      = (Finset.range L).sum (fun j => if c j then 1 else 0) := by
  induction n with
  | zero => simp
  | succ n ih =>
      calc (Finset.range L).sum (fun j => if c (n + 1 + j) then 1 else 0)
          = (Finset.range L).sum (fun j => if c (n + j) then 1 else 0) :=
            windowSum_shift c L hcper n
        _ = (Finset.range L).sum (fun j => if c j then 1 else 0) := ih

theorem rightDiagonal_periodicFrom_step_of_even_driver (k L : ℕ)
    (hL0 : PeriodicFrom (rightDiagonal k) L 0)
    (hL1 : PeriodicFrom (rightDiagonal (k + 1)) L 0)
    (heven : Even ((Finset.range L).sum
      (fun j => if rightDiagonal (k + 1) (j + 1) || rightDiagonal k (j + 2) then 1 else 0))) :
    PeriodicFrom (rightDiagonal (k + 2)) L 0 := by
  set c : ℕ → Bool := fun j => rightDiagonal (k + 1) (j + 1) || rightDiagonal k (j + 2) with hc_def
  set x : ℕ → Bool := rightDiagonal (k + 2) with hx_def
  have hrec : ∀ i, x (i + 1) = xor (x i) (c i) := fun i => rightDiagonal_recurrence k i
  have hcper : PeriodicFrom c L 0 := by
    intro n hn
    show (rightDiagonal (k + 1) (n + L + 1) || rightDiagonal k (n + L + 2))
        = (rightDiagonal (k + 1) (n + 1) || rightDiagonal k (n + 2))
    have e1 : rightDiagonal (k + 1) (n + 1 + L) = rightDiagonal (k + 1) (n + 1) := hL1 (n + 1) (by omega)
    have e2 : rightDiagonal k (n + 2 + L) = rightDiagonal k (n + 2) := hL0 (n + 2) (by omega)
    rw [show n + L + 1 = n + 1 + L by omega, show n + L + 2 = n + 2 + L by omega, e1, e2]
  have hsumeven : (Finset.range L).sum (fun j => if c j then 1 else 0) % 2 = 0 := by
    rw [Nat.even_iff] at heven
    exact heven
  have hconst := windowSum_const c L hcper
  have hblockfalse : ∀ n, blockXor c n L = false := by
    intro n
    cases hb : blockXor c n L with
    | false => rfl
    | true =>
        have hp := (blockXor_parity c n L).mp hb
        rw [hconst n, hsumeven] at hp
        simp at hp
  intro n _
  have hwalk : x (n + L) = xor (x n) (blockXor c n L) := walk c x hrec n L
  rw [hblockfalse n] at hwalk
  simpa using hwalk
