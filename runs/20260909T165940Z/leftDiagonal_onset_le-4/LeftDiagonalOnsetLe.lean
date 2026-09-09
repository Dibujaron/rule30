import Rule30.Basic
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Rule30.Proofs.LeftDiagonalPeriodicFromPow
import Rule30.Proofs.PeriodicFromMul
import Rule30.Proofs.LeftDiagonalRecurrence
import Mathlib.Tactic

/-! Not a proof of `leftDiagonal_onset_le`; the wall stands. What this file holds,
from Cadence's attempt of 2026-09-08:

* `rowNat_succ_mod_two_pow_congr` and `rowNat_mod_two_pow_eq_of_eq`: the low `n` bits
  of the packed row form an autonomous system, so if they ever return they repeat for ever.
* `leftDiagonal_periodicFrom_of_rowNat_return`: a return of the low `k + 1` bits at
  time `T` settles every diagonal up to `k` from the index where it meets row `T`.
* `leftDiagonal_onset_le_iff_rowNat_return`: the wall is EQUIVALENT to one congruence
  per depth, `rowNat (2k) ≡ rowNat (2k + 2^k) (mod 2^(k+1))`, and each instance is a
  kernel computation.
* `leftDiagonal_onset_le_of_le_5000`: the wall at every depth up to 5000, checked by the
  kernel in about ten seconds (the seeder's measurement stopped at 722). The `example`
  after it is a negative control: the same check rejects a wrong period.
* Dead end, checked here: the half-speed line `leftDiagonal (m+1) (m+2)` is white at
  about a third of all `m ≤ 720` (1, 6, 9, 10, 12, 15, 20, ...), not only at the
  eventually-white diagonals, so the residual of `leftDiagonal_onset_le_of_line` is
  really the disjunction and has no cleaner "the line is black" form.

And from Vesper's attempt of 2026-09-09, at the end of the file:

* `leftDiagonal_white_succ_iff` and `leftDiagonal_agree_succ_iff`: what a white run on
  a diagonal is made of. The onset of diagonal `k+1` is the onset of diagonal `k` plus
  one plus the white run diagonal `k` shows at that moment, so the wall is the claim
  that these runs average at most one cell; a run of length `w` is an agreement run of
  the two diagonals beneath, and the agreement cascades two diagonals shallower per
  cell. Vocabulary for an amortised argument, not the argument. -/

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
theorem rowNat_succ_mod_two_pow_congr (s t n : ℕ)
    (h : rowNat s % 2 ^ n = rowNat t % 2 ^ n) :
    rowNat (s + 1) % 2 ^ n = rowNat (t + 1) % 2 ^ n := by
  rw [rowNat_succ_eq, rowNat_succ_eq, rowStep_mod_two_pow, h]
  exact (rowStep_mod_two_pow _ _).symm

/-- Once the low `n` bits return after `p` steps, they repeat with period `p` for ever. -/
theorem rowNat_mod_two_pow_eq_of_eq (n T p : ℕ)
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
theorem leftDiagonal_periodicFrom_of_rowNat_return (k T p : ℕ)
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
theorem leftDiagonal_onset_le_of_rowNat_return
    (h : ∀ k, rowNat (2 * k) % 2 ^ (k + 1) = rowNat (2 * k + 2 ^ k) % 2 ^ (k + 1)) (k : ℕ) :
    ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N :=
  ⟨2 ^ k, Nat.two_pow_pos k, k, le_rfl,
    leftDiagonal_periodicFrom_of_rowNat_return k (2 * k) (2 ^ k) (h k) k le_rfl k (by omega)⟩

/-- A period known from a later onset holds from any earlier onset at which some
positive period is already known. -/
theorem periodicFrom_trans_period (f : ℕ → Bool) (p q N M : ℕ) (hp : 0 < p)
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
theorem rowNat_return_of_leftDiagonal_onset_le
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

/-! ### The white-run mechanism (Vesper, 2026-09-09)

Read the settled region as a wedge at the left edge and its right boundary as a
particle: at each step the particle holds its position when the cell to its lower left
is black and slides one cell left when it is white. The wall says the particle slides
at most half the time. It holds its position exactly while the diagonal under it is
black, so the whole question is the lengths of the WHITE RUNS on a diagonal at the
moment the boundary reaches it; the two lemmas below are what a white run is made of.
Neither moves the wall; they say where it is. -/

/-- A white cell on a diagonal is followed by another white cell exactly when the two
diagonals beneath it agree (read one and two cells further along). -/
theorem leftDiagonal_white_succ_iff (m i : ℕ) (hw : leftDiagonal (m + 2) i = false) :
    leftDiagonal (m + 2) (i + 1) = false ↔
      leftDiagonal m (i + 2) = leftDiagonal (m + 1) (i + 1) := by
  rw [leftDiagonal_recurrence, hw]
  cases leftDiagonal m (i + 2) <;> cases leftDiagonal (m + 1) (i + 1) <;> decide

/-- Agreement of two neighbouring diagonals persists one cell further exactly under a
condition two diagonals shallower: if the agreed value is black, the two diagonals
beneath must agree; if white, the shallower of those must be white. So a white run of
length `w` on one diagonal reaches down `2w` diagonals. -/
theorem leftDiagonal_agree_succ_iff (m i : ℕ)
    (h : leftDiagonal (m + 2) (i + 2) = leftDiagonal (m + 3) (i + 1)) :
    leftDiagonal (m + 2) (i + 3) = leftDiagonal (m + 3) (i + 2) ↔
      (leftDiagonal (m + 3) (i + 1) = true ∧
          leftDiagonal m (i + 4) = leftDiagonal (m + 1) (i + 3)) ∨
      (leftDiagonal (m + 3) (i + 1) = false ∧ leftDiagonal m (i + 4) = false) := by
  have r1 := leftDiagonal_recurrence m (i + 2)
  have r2 := leftDiagonal_recurrence (m + 1) (i + 1)
  rw [show m + 1 + 2 = m + 3 by omega, show i + 1 + 1 = i + 2 by omega] at r2
  rw [show i + 2 + 1 = i + 3 by omega, show i + 2 + 2 = i + 4 by omega] at r1
  rw [r1, r2, ← h]
  generalize leftDiagonal (m + 2) (i + 2) = a at h ⊢
  cases a <;> cases leftDiagonal m (i + 4) <;> cases leftDiagonal (m + 1) (i + 3) <;> decide
