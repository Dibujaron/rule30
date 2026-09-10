import Rule30.Basic
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Rule30.Proofs.LeftDiagonalPeriodicFromPow
import Rule30.Proofs.PeriodicFromMul
import Mathlib.Tactic

/-!
**What this says.** Every left diagonal of the picture settles into its repetition by
its own depth exactly when, for each depth `k`, rows `2k` and `2k + 2^k` of the picture
agree in their lowest `k+1` cells.

**Why it is true.** A row read as a binary number has an autonomous low end: the next
row's cell `b` depends only on cells `b-2, b-1, b` of this row, so agreement of the low
`k+1` cells is preserved for ever once it happens, and `leftDiagonal_eq_rowNat_testBit`
says cell `k` of row `j + k` is exactly the `k`-th diagonal at index `j`.

**Where the work is.** The backward direction is one autonomy induction; the forward one
needs each diagonal's period replaced by the common power of two `2^k` while keeping the
onset the hypothesis gives, which is `periodicFrom_trans_period` below.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_onset_le_iff_rowNat_return :
  (∀ (k : ℕ), ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N) ↔
    ∀ (k : ℕ), rowNat (2 * k) % 2 ^ (k + 1) = rowNat (2 * k + 2 ^ k) % 2 ^ (k + 1)
```
-/

private theorem rowNat_succ_eq (t : ℕ) : rowNat (t + 1) = rowStep (rowNat t) := rfl

private theorem testBit_rowStep (r i : ℕ) :
    (rowStep r).testBit i
      = xor (decide (2 ≤ i) && r.testBit (i - 2))
          ((decide (1 ≤ i) && r.testBit (i - 1)) || r.testBit i) := by
  have h4 : 4 * r = 2 ^ 2 * r := by norm_num
  have h2 : 2 * r = 2 ^ 1 * r := by norm_num
  unfold rowStep
  rw [h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
    Nat.testBit_two_pow_mul]

private theorem rowStep_mod_two_pow (r n : ℕ) :
    rowStep r % 2 ^ n = rowStep (r % 2 ^ n) % 2 ^ n := by
  apply Nat.eq_of_testBit_eq
  intro i
  rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow, testBit_rowStep, testBit_rowStep]
  by_cases hi : i < n
  · have h1 : i - 1 < n := by omega
    have h2 : i - 2 < n := by omega
    simp [Nat.testBit_mod_two_pow, hi, h1, h2]
  · simp [hi]

/-- Autonomy of the low bits: two rows that agree on their low `n` bits still agree
on them one step later. -/
private theorem rowNat_succ_mod_two_pow_congr (s t n : ℕ)
    (h : rowNat s % 2 ^ n = rowNat t % 2 ^ n) :
    rowNat (s + 1) % 2 ^ n = rowNat (t + 1) % 2 ^ n := by
  rw [rowNat_succ_eq, rowNat_succ_eq, rowStep_mod_two_pow, h]
  exact (rowStep_mod_two_pow _ _).symm

/-- Once the low `n` bits return after `p` steps, they repeat with period `p` for ever. -/
private theorem rowNat_mod_two_pow_eq_of_eq (n T p : ℕ)
    (h : rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) :
    ∀ t ≥ T, rowNat t % 2 ^ n = rowNat (t + p) % 2 ^ n := by
  intro t ht
  induction t, ht using Nat.le_induction with
  | base => exact h
  | succ t _ ih =>
    rw [show t + 1 + p = (t + p) + 1 by omega]
    exact rowNat_succ_mod_two_pow_congr t (t + p) n ih

/-- A return of the low `k + 1` bits at time `T` settles every diagonal up to `k` from
the index where that diagonal meets row `T`. -/
private theorem leftDiagonal_periodicFrom_of_rowNat_return (k T p : ℕ)
    (h : rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1))
    (i : ℕ) (hi : i ≤ k) (N : ℕ) (hN : T ≤ N + i) :
    PeriodicFrom (leftDiagonal i) p N := by
  intro n hn
  rw [leftDiagonal_eq_rowNat_testBit, leftDiagonal_eq_rowNat_testBit]
  have hmod := rowNat_mod_two_pow_eq_of_eq (k + 1) T p h (n + i) (by omega)
  have key : ∀ m, (rowNat m).testBit i = (rowNat m % 2 ^ (k + 1)).testBit i := by
    intro m
    rw [Nat.testBit_mod_two_pow]
    simp [show i < k + 1 by omega]
  rw [key (n + p + i), key (n + i), show n + p + i = n + i + p by omega, hmod]

/-- The wall follows from one congruence per depth. -/
private theorem leftDiagonal_onset_le_of_rowNat_return
    (h : ∀ k, rowNat (2 * k) % 2 ^ (k + 1) = rowNat (2 * k + 2 ^ k) % 2 ^ (k + 1)) (k : ℕ) :
    ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N :=
  ⟨2 ^ k, Nat.two_pow_pos k, k, le_rfl,
    leftDiagonal_periodicFrom_of_rowNat_return k (2 * k) (2 ^ k) (h k) k le_rfl k (by omega)⟩

/-- A period known from a later onset holds from any earlier onset at which some
positive period is already known. -/
private theorem periodicFrom_trans_period (f : ℕ → Bool) (p q N M : ℕ) (hp : 0 < p)
    (h1 : PeriodicFrom f p N) (h2 : PeriodicFrom f q M) : PeriodicFrom f q N := by
  intro n hn
  have hM : M ≤ M * p := Nat.le_mul_of_pos_right M hp
  have a := periodicFrom_mul f p N h1 M (n + q) (by omega)
  have b := periodicFrom_mul f p N h1 M n hn
  have c := h2 (n + M * p) (by omega)
  rw [← a, ← b, ← c]
  congr 1
  omega

/-- The congruences follow from the wall, so the reformulation loses nothing. -/
private theorem rowNat_return_of_leftDiagonal_onset_le
    (h : ∀ k, ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N) (k : ℕ) :
    rowNat (2 * k) % 2 ^ (k + 1) = rowNat (2 * k + 2 ^ k) % 2 ^ (k + 1) := by
  apply Nat.eq_of_testBit_eq
  intro i
  rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow]
  by_cases hi : i < k + 1
  · obtain ⟨p, hp, N, hN, hper⟩ := h i
    obtain ⟨M, _, hpow⟩ := leftDiagonal_periodicFrom_pow i
    have hq : PeriodicFrom (leftDiagonal i) (2 ^ i) N :=
      periodicFrom_trans_period _ p (2 ^ i) N M hp hper hpow
    have hk : PeriodicFrom (leftDiagonal i) (2 ^ k) N := by
      have := periodicFrom_mul _ (2 ^ i) N hq (2 ^ (k - i))
      rwa [← pow_add, show k - i + i = k by omega] at this
    have this := hk (2 * k - i) (by omega)
    rw [leftDiagonal_eq_rowNat_testBit, leftDiagonal_eq_rowNat_testBit,
      show 2 * k - i + 2 ^ k + i = 2 * k + 2 ^ k by omega,
      show 2 * k - i + i = 2 * k by omega] at this
    rw [this]
  · simp [hi]

/-- The onset wall, exactly: every diagonal settles by its own index if and only if the
low `k + 1` bits of row `2k` return after `2^k` steps, for every `k`. -/
theorem leftDiagonal_onset_le_iff_rowNat_return :
    (∀ k, ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N) ↔
    ∀ k, rowNat (2 * k) % 2 ^ (k + 1) = rowNat (2 * k + 2 ^ k) % 2 ^ (k + 1) :=
  ⟨rowNat_return_of_leftDiagonal_onset_le, leftDiagonal_onset_le_of_rowNat_return⟩
