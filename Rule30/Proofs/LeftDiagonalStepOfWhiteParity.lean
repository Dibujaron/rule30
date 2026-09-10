import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence
import Mathlib.Algebra.BigOperators.Group.Finset.Basic
import Mathlib.Algebra.Group.Nat.Even

/-!
**What this says.** Once a left diagonal has gone permanently white, the diagonal
two further in is just the running total, counted black-or-not, of the diagonal
two further out: so travelling one period along it flips it exactly when that
period contains an odd number of black cells.

**Why it is true.** With the white diagonal dropped, the local rule loses its
"or" term and becomes a plain running XOR. Walking a whole period adds up the
same block of cells no matter where you start, because the driving diagonal
already repeats, so that one bit of parity decides everything.

**Where the work is.** Showing the block total is the same from every starting
point past the onset: peel the first cell off the front and the last off the
back, and they are the same cell one period apart, so the two cancel.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_step_of_white_parity (m q N : ℕ) (hq : 0 < q) (h0 : PeriodicFrom (leftDiagonal m) q N)
  (hwhite : ∀ j ≥ N + 1, leftDiagonal (m + 1) j = false) :
  (Even (∑ j ∈ Finset.range q, if leftDiagonal m (N + j + 2) = true then 1 else 0) →
      PeriodicFrom (leftDiagonal (m + 2)) q N) ∧
    (Odd (∑ j ∈ Finset.range q, if leftDiagonal m (N + j + 2) = true then 1 else 0) →
      ∀ n ≥ N, leftDiagonal (m + 2) (n + q) = !leftDiagonal (m + 2) n)
```
-/

/-- The XOR of `a` over the `n` cells starting at `i`. -/
private def blockXor (a : ℕ → Bool) (i : ℕ) : ℕ → Bool
  | 0 => false
  | n + 1 => xor (blockXor a i n) (a (i + n))

private lemma blockXor_succ (a : ℕ → Bool) (i n : ℕ) :
    blockXor a i (n + 1) = xor (blockXor a i n) (a (i + n)) := rfl

/-- Peel the first cell off the front of a block. -/
private lemma blockXor_peel (a : ℕ → Bool) (i : ℕ) : ∀ n,
    blockXor a i (n + 1) = xor (a i) (blockXor a (i + 1) n) := by
  intro n
  induction n with
  | zero => simp [blockXor]
  | succ n ih =>
    rw [blockXor_succ a i (n + 1), ih, blockXor_succ a (i + 1) n,
      show i + (n + 1) = i + 1 + n from by omega]
    generalize a i = A
    generalize blockXor a (i + 1) n = B
    generalize a (i + 1 + n) = C
    cases A <;> cases B <;> cases C <;> rfl

/-- A block of length exactly one period has the same XOR wherever it starts. -/
private lemma blockXor_const (a : ℕ → Bool) (q N : ℕ)
    (hper : ∀ i, N ≤ i → a (i + q) = a i) :
    ∀ i, N ≤ i → blockXor a i q = blockXor a N q := by
  intro i hi
  induction i, hi using Nat.le_induction with
  | base => rfl
  | succ n hn ih =>
    have h1 : blockXor a n (q + 1) = xor (a n) (blockXor a (n + 1) q) :=
      blockXor_peel a n q
    have h2 : blockXor a n (q + 1) = xor (blockXor a n q) (a (n + q)) :=
      blockXor_succ a n q
    rw [hper n hn] at h2
    have h3 : xor (blockXor a n q) (a n) = xor (a n) (blockXor a (n + 1) q) := by
      rw [← h2, h1]
    rw [← ih]
    revert h3
    generalize blockXor a n q = B1
    generalize blockXor a (n + 1) q = B2
    generalize a n = A
    cases A <;> cases B1 <;> cases B2 <;> simp

/-- Walking `n` steps of a XOR-driven bit adds the block XOR of the driver. -/
private lemma blockXor_walk (a x : ℕ → Bool) (N : ℕ)
    (hstep : ∀ i, N ≤ i → x (i + 1) = xor (a i) (x i)) :
    ∀ n i, N ≤ i → x (i + n) = xor (x i) (blockXor a i n) := by
  intro n
  induction n with
  | zero => intro i _; simp [blockXor]
  | succ n ih =>
    intro i hi
    rw [show i + (n + 1) = i + n + 1 from by omega, hstep (i + n) (by omega),
      ih i hi, blockXor_succ]
    generalize a (i + n) = A
    generalize x i = X
    generalize blockXor a i n = B
    cases A <;> cases X <;> cases B <;> rfl

/-- The block XOR is the parity of the number of black cells in the block. -/
private lemma blockXor_parity (a : ℕ → Bool) (i : ℕ) : ∀ n,
    (∑ j ∈ Finset.range n, if a (i + j) = true then 1 else 0) % 2
      = if blockXor a i n = true then 1 else 0 := by
  intro n
  induction n with
  | zero => simp [blockXor]
  | succ n ih =>
    rw [Finset.sum_range_succ, blockXor_succ]
    revert ih
    generalize (∑ j ∈ Finset.range n, if a (i + j) = true then 1 else 0) = S
    generalize blockXor a i n = B
    generalize a (i + n) = A
    cases A <;> cases B <;> simp <;> omega

theorem leftDiagonal_step_of_white_parity (m q N : ℕ) (hq : 0 < q)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (hwhite : ∀ j ≥ N + 1, leftDiagonal (m + 1) j = false) :
    (Even (∑ j ∈ Finset.range q, if leftDiagonal m (N + j + 2) = true then 1 else 0) →
        PeriodicFrom (leftDiagonal (m + 2)) q N) ∧
      (Odd (∑ j ∈ Finset.range q, if leftDiagonal m (N + j + 2) = true then 1 else 0) →
        ∀ n ≥ N, leftDiagonal (m + 2) (n + q) = !leftDiagonal (m + 2) n) := by
  have hstep : ∀ i, N ≤ i →
      leftDiagonal (m + 2) (i + 1)
        = xor (leftDiagonal m (i + 2)) (leftDiagonal (m + 2) i) := by
    intro i hi
    rw [leftDiagonal_recurrence m i, hwhite (i + 1) (by omega)]
    simp
  have hper : ∀ i, N ≤ i → leftDiagonal m (i + q + 2) = leftDiagonal m (i + 2) := by
    intro i hi
    rw [show i + q + 2 = i + 2 + q from by omega]
    exact h0 (i + 2) (by omega)
  have hwalk := blockXor_walk (fun i => leftDiagonal m (i + 2)) (leftDiagonal (m + 2)) N hstep
  have hconst := blockXor_const (fun i => leftDiagonal m (i + 2)) q N hper
  have key : ∀ n, N ≤ n →
      leftDiagonal (m + 2) (n + q)
        = xor (leftDiagonal (m + 2) n)
            (blockXor (fun i => leftDiagonal m (i + 2)) N q) := by
    intro n hn
    rw [hwalk q n hn, hconst n hn]
  have hpar :
      (∑ j ∈ Finset.range q, if leftDiagonal m (N + j + 2) = true then 1 else 0) % 2
        = if blockXor (fun i => leftDiagonal m (i + 2)) N q = true then 1 else 0 :=
    blockXor_parity (fun i => leftDiagonal m (i + 2)) N q
  constructor
  · intro heven n hn
    rw [Nat.even_iff] at heven
    have hB : blockXor (fun i => leftDiagonal m (i + 2)) N q = false := by
      cases hb : blockXor (fun i => leftDiagonal m (i + 2)) N q
      · rfl
      · rw [hb] at hpar
        simp at hpar
        exfalso
        omega
    rw [key n hn, hB]
    simp
  · intro hodd n hn
    rw [Nat.odd_iff] at hodd
    have hB : blockXor (fun i => leftDiagonal m (i + 2)) N q = true := by
      cases hb : blockXor (fun i => leftDiagonal m (i + 2)) N q
      · rw [hb] at hpar
        simp at hpar
        exfalso
        omega
      · rfl
    rw [key n hn, hB]
    simp
