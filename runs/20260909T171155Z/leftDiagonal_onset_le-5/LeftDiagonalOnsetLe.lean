import Rule30.Basic
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Rule30.Proofs.LeftDiagonalOnsetLeIffRowNatReturn
import Rule30.Proofs.LeftDiagonalRecurrence
import Mathlib.Tactic

/-!
**What this says.** Not a proof of `leftDiagonal_onset_le`; the wall stands. The file
holds the wall checked by the kernel at every depth up to 5000, and the exact law of the
settled boundary read along the rows: the boundary between the settled cells and the
transient ones moves one cell inward exactly when the settled cell just inside it is
black, and holds still exactly when that cell is white (`rowNat_return_succ_iff`).
**Why it is true.** A row read as a binary number has an autonomous low end, so once its
low bits return they repeat for ever; and a black cell masks the cell beside it in the
rule, so a mismatch next to a black settled cell is forgotten in one step.
**Where the work is.** Nowhere in Lean. The wall is the claim that the boundary is held
still at most half of the time, and nothing here bounds the white runs that hold it.
-/

/-- One step of the packed row as a function of the number alone. -/
private def rowStep (r : ℕ) : ℕ := (4 * r) ^^^ ((2 * r) ||| r)

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

/-- Two numbers agree modulo `2 ^ m` exactly when their low `m` bits agree. -/
private theorem mod_two_pow_eq_iff (a b m : ℕ) :
    a % 2 ^ m = b % 2 ^ m ↔ ∀ i < m, a.testBit i = b.testBit i := by
  constructor
  · intro h i hi
    have := congrArg (fun x => x.testBit i) h
    simpa [Nat.testBit_mod_two_pow, hi] using this
  · intro h
    apply Nat.eq_of_testBit_eq
    intro i
    rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow]
    by_cases hi : i < m
    · simp [hi, h i hi]
    · simp [hi]

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

set_option maxRecDepth 100000 in
set_option maxHeartbeats 4000000 in
/-- The wall at every depth up to 5000, as one kernel computation: the low `k + 1` bits
of row `2k` return after 16 steps (the common period of every diagonal below depth
87867), which `leftDiagonal_periodicFrom_of_rowNat_return` turns into a settled
diagonal `k` by index `k`. Evidence, not a proof of the wall: the kernel checks 5001
congruences and says nothing about depth 5001. -/
theorem leftDiagonal_onset_le_of_le_5000 (k : ℕ) (hk : k ≤ 5000) :
    ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N := by
  have h : ∀ k ≤ 5000, rowNat (2 * k) % 2 ^ (k + 1) = rowNat (2 * k + 16) % 2 ^ (k + 1) := by
    decide +kernel
  exact ⟨16, by norm_num, k, le_rfl,
    leftDiagonal_periodicFrom_of_rowNat_return k (2 * k) 16 (h k hk) k le_rfl k (by omega)⟩

-- negative control: the kernel check must reject a wrong period (depth 200 has period 8, not 4)
example : ¬ (rowNat 400 % 2 ^ 201 = rowNat 404 % 2 ^ 201) := by decide +kernel

/-! ### The boundary law in the row model

Say the low `n + 1` bits of the packed row have returned at time `T` after `p` steps:
diagonals `0 .. n` are settled where they meet row `T`. Whether one more bit has returned
one step later is decided by a single cell. If bit `n` of row `T` is black, the rule
masks bit `n + 1` and the return extends to `n + 2` bits at `T + 1` whatever bit `n + 1`
was doing; if bit `n` is white, bit `n + 1` at `T + 1` is bit `n - 1` XOR bit `n + 1` on
both rows, so it agrees at `T + 1` exactly when it already agreed at `T`. So the settled
boundary advances one cell per step while the cell inside it is black and stands still
while it is white, and the wall says it stands still at most half the time. -/

/-- The boundary law: with the low `n + 1` bits returned at `T`, the low `n + 2` bits are
returned at `T + 1` exactly when bit `n` of row `T` is black or they were already returned
at `T`. -/
theorem rowNat_return_succ_iff (n T p : ℕ)
    (h : rowNat T % 2 ^ (n + 1) = rowNat (T + p) % 2 ^ (n + 1)) :
    rowNat (T + 1) % 2 ^ (n + 2) = rowNat (T + p + 1) % 2 ^ (n + 2) ↔
      ((rowNat T).testBit n = true ∨
        rowNat T % 2 ^ (n + 2) = rowNat (T + p) % 2 ^ (n + 2)) := by
  have hlow := (mod_two_pow_eq_iff _ _ _).1 h
  have hlow1 := (mod_two_pow_eq_iff _ _ _).1
    (rowNat_succ_mod_two_pow_congr T (T + p) (n + 1) h)
  have hbit : ((rowNat (T + 1)).testBit (n + 1) = (rowNat (T + p + 1)).testBit (n + 1)) ↔
      ((rowNat T).testBit n = true ∨
        (rowNat T).testBit (n + 1) = (rowNat (T + p)).testBit (n + 1)) := by
    have h1 : decide (1 ≤ n + 1) = true := by simp
    rw [rowNat_succ_eq, rowNat_succ_eq, testBit_rowStep, testBit_rowStep,
      show n + 1 - 1 = n by omega, hlow (n + 1 - 2) (by omega), hlow n (by omega), h1,
      Bool.true_and]
    generalize (decide (2 ≤ n + 1) && (rowNat (T + p)).testBit (n + 1 - 2)) = a
    generalize (rowNat (T + p)).testBit n = b
    generalize (rowNat T).testBit (n + 1) = c
    generalize (rowNat (T + p)).testBit (n + 1) = d
    cases a <;> cases b <;> cases c <;> cases d <;> decide
  rw [mod_two_pow_eq_iff, mod_two_pow_eq_iff]
  constructor
  · intro hall
    have hn1 := hall (n + 1) (by omega)
    rw [hbit] at hn1
    rcases hn1 with h1 | h1
    · exact Or.inl h1
    · right
      intro i hi
      by_cases hi' : i < n + 1
      · exact hlow i hi'
      · have : i = n + 1 := by omega
        subst this
        exact h1
  · intro hor i hi
    by_cases hi' : i < n + 1
    · exact hlow1 i hi'
    · have : i = n + 1 := by omega
      subst this
      rw [hbit]
      rcases hor with h1 | h1
      · exact Or.inl h1
      · exact Or.inr (h1 (n + 1) (by omega))

/-- A white cell on a diagonal is followed by another white cell exactly when the two
diagonals beneath it agree (read one and two cells further along). This is what holds
the boundary still: a white run on the diagonal just inside it is an agreement run of
the two diagonals beneath. -/
theorem leftDiagonal_white_succ_iff (m i : ℕ) (hw : leftDiagonal (m + 2) i = false) :
    leftDiagonal (m + 2) (i + 1) = false ↔
      leftDiagonal m (i + 2) = leftDiagonal (m + 1) (i + 1) := by
  rw [leftDiagonal_recurrence, hw]
  cases leftDiagonal m (i + 2) <;> cases leftDiagonal (m + 1) (i + 1) <;> decide
