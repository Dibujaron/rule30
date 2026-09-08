import Rule30.Basic
import Rule30.Proofs.RightDiagonalRecurrence
import Mathlib.Tactic

/-!
**What this says.** If the diagonal-`k` and diagonal-`(k+1)` edges of the cone both repeat with
period `L`, and their combined driver is black an odd number of times across one period, then
diagonal `k+2` flips sign every `L` steps: it has period `2L`, but not the shorter period `L`.

**Why it is true.** One step along diagonal `k+2` is its own previous cell XOR'd with the driver
(`rightDiagonal_recurrence`); XOR-ing in the same driver value one period later cancels, so the
"has it flipped over one period" bit is itself constant in the starting point, and its value at
the start is exactly the driver's parity over one period.

**Where the work is.** Connecting the driver's parity, stated as `Odd` of a `Finset.sum`, to the
boolean cumulative-XOR that the step recurrence actually produces.
-/

private lemma xor_eq_true' (a b : Bool) : xor a b = true ↔ a ≠ b := by
  cases a <;> cases b <;> simp

private lemma xor_cancel' (a b c : Bool) : xor (xor a c) (xor b c) = xor a b := by
  cases a <;> cases b <;> cases c <;> rfl

private lemma eq_not_of_xor' (a b : Bool) (h : xor a b = true) : b = !a := by
  cases a <;> cases b <;> simp_all

private lemma not_self_eq_not' (a : Bool) : a ≠ !a := by
  cases a <;> decide

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
      rw [xor_eq_true']
      cases hb : blockXor c i n <;> cases hc : c (i + n) <;> simp_all <;> omega

theorem rightDiagonal_antiperiodic_of_odd_driver (k L : ℕ)
    (hL0 : PeriodicFrom (rightDiagonal k) L 0)
    (hL1 : PeriodicFrom (rightDiagonal (k + 1)) L 0)
    (hodd : Odd ((Finset.range L).sum
      (fun j => if rightDiagonal (k + 1) (j + 1) || rightDiagonal k (j + 2) then 1 else 0))) :
    (∀ j, rightDiagonal (k + 2) (j + L) = ! rightDiagonal (k + 2) j)
      ∧ PeriodicFrom (rightDiagonal (k + 2)) (2 * L) 0
      ∧ ¬ PeriodicFrom (rightDiagonal (k + 2)) L 0 := by
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
  have hsumodd : (Finset.range L).sum (fun j => if c j then 1 else 0) % 2 = 1 := by
    rw [Nat.odd_iff] at hodd
    exact hodd
  have hblock : blockXor c 0 L = true := (blockXor_parity c 0 L).mpr (by simpa using hsumodd)
  have hL' : x (0 + L) = xor (x 0) (blockXor c 0 L) := walk c x hrec 0 L
  have hy0 : xor (x 0) (x L) = true := by
    have hL'' : x L = xor (x 0) (blockXor c 0 L) := by simpa using hL'
    rw [hL'', hblock]
    generalize x 0 = b
    cases b <;> rfl
  have hy : ∀ j, xor (x j) (x (j + L)) = true := by
    intro j
    induction j with
    | zero => simpa using hy0
    | succ j ih =>
        show xor (x (j + 1)) (x (j + 1 + L)) = true
        have h1 : x (j + 1) = xor (x j) (c j) := hrec j
        have h2 : x (j + 1 + L) = xor (x (j + L)) (c j) := by
          have hstep := hrec (j + L)
          have hcj : c (j + L) = c j := hcper j (by omega)
          rw [hcj] at hstep
          rw [show j + 1 + L = j + L + 1 by omega]
          exact hstep
        rw [h1, h2, xor_cancel']
        exact ih
  refine ⟨?_, ?_, ?_⟩
  · intro j
    exact eq_not_of_xor' (x j) (x (j + L)) (hy j)
  · intro n _
    have e1 : x (n + L + L) = ! x (n + L) := eq_not_of_xor' (x (n + L)) (x (n + L + L)) (hy (n + L))
    have e2 : x (n + L) = ! x n := eq_not_of_xor' (x n) (x (n + L)) (hy n)
    rw [show n + 2 * L = n + L + L by omega, e1, e2, Bool.not_not]
  · intro hP
    have h0 : x (0 + L) = x 0 := hP 0 (by omega)
    have h1 : x (0 + L) = ! x 0 := eq_not_of_xor' (x 0) (x (0 + L)) (hy 0)
    rw [h0] at h1
    exact not_self_eq_not' (x 0) h1
