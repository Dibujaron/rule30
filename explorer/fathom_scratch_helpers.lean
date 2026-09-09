/-
Fathom, 2026-09-09. Scratch elaboration of the four helper-node statements
drafted for Rowan. Not a proof file: this is the route check. The point is
that the four PUBLIC statements below mention no private definition, so a
future node can carry them while `blockXor` and `rowStep` stay private in
one file instead of being copied into three.
-/
import Rule30.Basic
import Mathlib.Tactic

/- ============ CLUSTER 1: the XOR-driven walk ============ -/

private lemma xor_eq_true' (a b : Bool) : xor a b = true ↔ a ≠ b := by
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
      rw [xor_eq_true']
      cases hb : blockXor c i n <;> cases hc : c (i + n) <;> simp_all <;> omega

/-- **PUBLIC 1.** A one-bit machine driven by XOR is flipped after `n` steps
exactly when its driver was black an odd number of times over that window. -/
theorem boolXorDriven_advance_iff (c x : ℕ → Bool)
    (hrec : ∀ i, x (i + 1) = xor (x i) (c i)) (i n : ℕ) :
    (x (i + n) = !x i) ↔
      (Finset.range n).sum (fun j => if c (i + j) then 1 else 0) % 2 = 1 := by
  rw [← blockXor_parity c i n, walk c x hrec i n]
  cases hb : blockXor c i n <;> cases hxi : x i <;> simp

/-- **PUBLIC 2.** A full-period window of an eventually-periodic driver has
the same content wherever it starts, provided it starts after the onset. -/
theorem windowSum_eq_of_periodicFrom (c : ℕ → Bool) (L N m n : ℕ)
    (hc : PeriodicFrom c L N) (hm : N ≤ m) (hn : N ≤ n) :
    (Finset.range L).sum (fun j => if c (m + j) then 1 else 0)
      = (Finset.range L).sum (fun j => if c (n + j) then 1 else 0) := by
  have step : ∀ k, N ≤ k →
      (Finset.range L).sum (fun j => if c (k + 1 + j) then 1 else 0)
        = (Finset.range L).sum (fun j => if c (k + j) then 1 else 0) := by
    intro k hk
    have step1 : (Finset.range (L + 1)).sum (fun j => if c (k + j) then 1 else 0)
        = (Finset.range L).sum (fun j => if c (k + j) then 1 else 0)
          + (if c (k + L) then 1 else 0) :=
      Finset.sum_range_succ (fun j => if c (k + j) then 1 else 0) L
    have step2 : (Finset.range (L + 1)).sum (fun j => if c (k + j) then 1 else 0)
        = (Finset.range L).sum (fun j => if c (k + (j + 1)) then 1 else 0)
          + (if c (k + 0) then 1 else 0) :=
      Finset.sum_range_succ' (fun j => if c (k + j) then 1 else 0) L
    have hAeq : (Finset.range L).sum (fun j => if c (k + (j + 1)) then 1 else 0)
        = (Finset.range L).sum (fun j => if c (k + 1 + j) then 1 else 0) := by
      apply Finset.sum_congr rfl
      intro j _
      rw [show k + (j + 1) = k + 1 + j by omega]
    have hfn0 : (if c (k + 0) then 1 else 0) = (if c k then 1 else 0) := by
      rw [show k + 0 = k by omega]
    have hfnL : (if c (k + L) then 1 else 0) = (if c k then 1 else 0) := by
      rw [hc k hk]
    rw [hAeq, hfn0] at step2
    rw [hfnL] at step1
    omega
  -- every start >= N gives the same window sum as the start N itself
  have anchor : ∀ d, (Finset.range L).sum (fun j => if c (N + d + j) then 1 else 0)
      = (Finset.range L).sum (fun j => if c (N + j) then 1 else 0) := by
    intro d
    induction d with
    | zero => rfl
    | succ d ih =>
        rw [show N + (d + 1) = (N + d) + 1 by omega, step (N + d) (by omega), ih]
  have hm' := anchor (m - N)
  have hn' := anchor (n - N)
  rw [show N + (m - N) = m by omega] at hm'
  rw [show N + (n - N) = n by omega] at hn'
  rw [hm', hn']

/- ============ CLUSTER 2: the packed-row step ============ -/

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

/-- **PUBLIC 3.** Rule 30 on a packed row, one bit at a time. -/
theorem rowNat_succ_testBit (t i : ℕ) :
    (rowNat (t + 1)).testBit i
      = xor (decide (2 ≤ i) && (rowNat t).testBit (i - 2))
          ((decide (1 ≤ i) && (rowNat t).testBit (i - 1)) || (rowNat t).testBit i) := by
  rw [rowNat_succ_eq, testBit_rowStep]

/-- **PUBLIC 4** (held unlanded pending Dib's `stepMod` call). The low `n`
bits of a packed row are autonomous: one step of them needs nothing above. -/
theorem rowNat_succ_mod_two_pow (t n : ℕ) :
    rowNat (t + 1) % 2 ^ n
      = ((4 * (rowNat t % 2 ^ n)) ^^^ ((2 * (rowNat t % 2 ^ n)) ||| (rowNat t % 2 ^ n)))
          % 2 ^ n := by
  rw [rowNat_succ_eq, rowStep_mod_two_pow]
  rfl

/-- **PUBLIC 5.** Autonomy, iterated: once the low bits return, they keep
returning. -/
theorem rowNat_mod_two_pow_eq_of_eq (n T p : ℕ)
    (h : rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) :
    ∀ t ≥ T, rowNat t % 2 ^ n = rowNat (t + p) % 2 ^ n := by
  intro t ht
  induction t, ht using Nat.le_induction with
  | base => exact h
  | succ t _ ih =>
    rw [show t + 1 + p = (t + p) + 1 by omega]
    rw [rowNat_succ_eq, rowNat_succ_eq, rowStep_mod_two_pow, ih]
    exact (rowStep_mod_two_pow _ _).symm

/- ============ CONSUMER CHECKS ============
Each takes the PUBLIC statements as HYPOTHESES (`ADV`, `WIN`), so it is
structurally incapable of reaching for the private helpers in this file.
If these close, the publics really do serve the three landed copies; mere
elaboration of the publics above would not have shown that. -/

/-- Re-proves `bool_xor_driven_periodicFrom` (BoolXorDrivenPeriodicFrom.lean)
from the two public statements alone. -/
theorem consumer_boolXorDriven
    (ADV : ∀ (c x : ℕ → Bool), (∀ i, x (i + 1) = xor (x i) (c i)) → ∀ i n,
      (x (i + n) = !x i) ↔
        (Finset.range n).sum (fun j => if c (i + j) then 1 else 0) % 2 = 1)
    (WIN : ∀ (c : ℕ → Bool) (L N m n : ℕ), PeriodicFrom c L N → N ≤ m → N ≤ n →
      (Finset.range L).sum (fun j => if c (m + j) then 1 else 0)
        = (Finset.range L).sum (fun j => if c (n + j) then 1 else 0))
    (c x : ℕ → Bool) (p N : ℕ)
    (hrec : ∀ i, x (i + 1) = xor (x i) (c i)) (hc : PeriodicFrom c p N) :
    PeriodicFrom x (2 * p) N := by
  intro n hn
  have hsplit : (Finset.range (2 * p)).sum (fun j => if c (n + j) then 1 else 0)
      = (Finset.range p).sum (fun j => if c (n + j) then 1 else 0)
        + (Finset.range p).sum (fun j => if c (n + p + j) then 1 else 0) := by
    rw [show 2 * p = p + p by omega, Finset.sum_range_add]
    congr 1
    apply Finset.sum_congr rfl
    intro j _
    rw [show n + (p + j) = n + p + j by omega]
  have hhalves := WIN c p N (n + p) n hc (by omega) hn
  have heven : (Finset.range (2 * p)).sum (fun j => if c (n + j) then 1 else 0) % 2 = 0 := by
    rw [hsplit, hhalves]; omega
  have hadv := ADV c x hrec n (2 * p)
  have hnotflip : ¬ (x (n + 2 * p) = !x n) := by
    intro hflip; rw [hadv] at hflip; omega
  cases hx : x n <;> cases hy : x (n + 2 * p) <;> simp_all

/-- The odd-driver consumer (RightDiagonalAntiperiodicOfOddDriver.lean): an
odd window flips the cell. -/
theorem consumer_oddDriver
    (ADV : ∀ (c x : ℕ → Bool), (∀ i, x (i + 1) = xor (x i) (c i)) → ∀ i n,
      (x (i + n) = !x i) ↔
        (Finset.range n).sum (fun j => if c (i + j) then 1 else 0) % 2 = 1)
    (c x : ℕ → Bool) (L j : ℕ) (hrec : ∀ i, x (i + 1) = xor (x i) (c i))
    (hodd : Odd ((Finset.range L).sum (fun k => if c (j + k) then 1 else 0))) :
    x (j + L) = !x j := by
  rw [ADV c x hrec j L, Nat.odd_iff] at *
  exact hodd

/-- The even-driver consumer (RightDiagonalPeriodicFromStepOfEvenDriver.lean):
an even window leaves the cell alone, at every start after the onset. -/
theorem consumer_evenDriver
    (ADV : ∀ (c x : ℕ → Bool), (∀ i, x (i + 1) = xor (x i) (c i)) → ∀ i n,
      (x (i + n) = !x i) ↔
        (Finset.range n).sum (fun j => if c (i + j) then 1 else 0) % 2 = 1)
    (WIN : ∀ (c : ℕ → Bool) (L N m n : ℕ), PeriodicFrom c L N → N ≤ m → N ≤ n →
      (Finset.range L).sum (fun j => if c (m + j) then 1 else 0)
        = (Finset.range L).sum (fun j => if c (n + j) then 1 else 0))
    (c x : ℕ → Bool) (L : ℕ) (hrec : ∀ i, x (i + 1) = xor (x i) (c i))
    (hc : PeriodicFrom c L 0)
    (heven : Even ((Finset.range L).sum (fun j => if c j then 1 else 0))) :
    PeriodicFrom x L 0 := by
  intro n _
  have hwin := WIN c L 0 n 0 hc (by omega) (by omega)
  have h0 : (Finset.range L).sum (fun j => if c (0 + j) then 1 else 0)
      = (Finset.range L).sum (fun j => if c j then 1 else 0) := by
    apply Finset.sum_congr rfl; intro j _; rw [show 0 + j = j by omega]
  rw [h0] at hwin
  rw [Nat.even_iff] at heven
  have hadv := ADV c x hrec n L
  have hnotflip : ¬ (x (n + L) = !x n) := by
    intro hflip; rw [hadv, hwin] at hflip; omega
  cases hx : x n <;> cases hy : x (n + L) <;> simp_all

/-- Does PUBLIC 5 follow from PUBLIC 3 alone? If it does, the `rowStep`
machine lives in ONE proof file and PUBLIC 5's file just imports PUBLIC 3.
If it does not, landing 3 and 5 as separate nodes puts the same private
helpers back into two files -- the thing we are fixing. `BIT` is PUBLIC 3
as a hypothesis, so nothing private here is reachable. -/
theorem consumer_rowNatEqOfEq_from_bit
    (BIT : ∀ t i, (rowNat (t + 1)).testBit i
      = xor (decide (2 ≤ i) && (rowNat t).testBit (i - 2))
          ((decide (1 ≤ i) && (rowNat t).testBit (i - 1)) || (rowNat t).testBit i))
    (n T p : ℕ) (h : rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) :
    ∀ t ≥ T, rowNat t % 2 ^ n = rowNat (t + p) % 2 ^ n := by
  have MTP : ∀ a b m : ℕ, a % 2 ^ m = b % 2 ^ m ↔ ∀ i < m, a.testBit i = b.testBit i := by
    intro a b m
    constructor
    · intro hab i hi
      have := congrArg (fun z => z.testBit i) hab
      simpa [Nat.testBit_mod_two_pow, hi] using this
    · intro hab
      apply Nat.eq_of_testBit_eq
      intro i
      rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow]
      by_cases hi : i < m
      · simp [hi, hab i hi]
      · simp [hi]
  intro t ht
  induction t, ht using Nat.le_induction with
  | base => exact h
  | succ t _ ih =>
      rw [show t + 1 + p = (t + p) + 1 by omega]
      rw [MTP] at ih ⊢
      intro i hi
      rw [BIT, BIT, ih i hi]
      by_cases h1 : 1 ≤ i
      · by_cases h2 : 2 ≤ i
        · rw [ih (i - 1) (by omega), ih (i - 2) (by omega)]
        · simp [h2, ih (i - 1) (by omega)]
      · simp [h1, show ¬ (2 ≤ i) by omega]

#print axioms boolXorDriven_advance_iff
#print axioms windowSum_eq_of_periodicFrom
#print axioms rowNat_succ_testBit
#print axioms rowNat_succ_mod_two_pow
#print axioms rowNat_mod_two_pow_eq_of_eq
#print axioms consumer_boolXorDriven
#print axioms consumer_oddDriver
#print axioms consumer_evenDriver
#print axioms consumer_rowNatEqOfEq_from_bit
