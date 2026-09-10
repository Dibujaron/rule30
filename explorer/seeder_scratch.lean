import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence
import Rule30.Proofs.LeftDiagonalPeriodicFromStepOfBlack
import Rule30.Proofs.BoolDrivenPeriodicFromOfReturn
import Rule30.Proofs.RowNatReturnSuccIff
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Rule30.Proofs.RowNatAgreeForward
import Mathlib.Tactic

/-! Seeder scratch: routes for the proposed tier, checked before proposing. -/

-- 1. THE DOUBLE ADVANCE, in diagonal coordinates.
theorem leftDiagonal_periodicFrom_step_two_of_black (m q N j : ℕ) (hNj : N ≤ j)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N)
    (hblack : leftDiagonal (m + 1) (j + 1) = true)
    (hblack2 : leftDiagonal (m + 2) (j + 1) = true) :
    PeriodicFrom (leftDiagonal (m + 2)) q (j + 1) ∧
      PeriodicFrom (leftDiagonal (m + 3)) q (j + 1) := by
  have h2 : PeriodicFrom (leftDiagonal (m + 2)) q (j + 1) :=
    leftDiagonal_periodicFrom_step_of_black m q N j hNj h0 h1 hblack
  refine ⟨h2, ?_⟩
  refine bool_driven_periodicFrom_of_return
      (fun i => leftDiagonal (m + 1) (i + 2)) (fun i => leftDiagonal (m + 2) (i + 1))
      (leftDiagonal (m + 3)) q (j + 1) (j + 1) ?_ ?_ ?_ le_rfl ?_
  · intro i
    exact leftDiagonal_recurrence (m + 1) i
  · intro i hi
    have h := h1 (i + 2) (by omega)
    dsimp only
    rw [show i + q + 2 = i + 2 + q from by omega]
    exact h
  · intro i hi
    have h := h2 (i + 1) (by omega)
    dsimp only
    rw [show i + q + 1 = i + 1 + q from by omega]
    exact h
  · -- the return at index j + 1
    have hb2 : leftDiagonal (m + 2) (j + 1 + q) = true := by
      rw [h2 (j + 1) le_rfl]; exact hblack2
    have e1 := leftDiagonal_recurrence (m + 1) j
    have e2 := leftDiagonal_recurrence (m + 1) (j + q)
    have hd : leftDiagonal (m + 1) (j + q + 2) = leftDiagonal (m + 1) (j + 2) := by
      rw [show j + q + 2 = j + 2 + q from by omega]
      exact h1 (j + 2) (by omega)
    rw [show j + 1 + q = j + q + 1 from by omega, e2, e1, hblack2,
      show j + q + 1 = j + 1 + q from by omega, hb2, hd]
    simp

-- 2. THE DOUBLE ADVANCE, in the packed row.
private theorem rowNat_succ_eq' (t : ℕ) : rowNat (t + 1) = rowStep (rowNat t) := rfl

private theorem testBit_rowStep' (r i : ℕ) :
    (rowStep r).testBit i
      = xor (decide (2 ≤ i) && r.testBit (i - 2))
          ((decide (1 ≤ i) && r.testBit (i - 1)) || r.testBit i) := by
  have h4 : 4 * r = 2 ^ 2 * r := by norm_num
  have h2 : 2 * r = 2 ^ 1 * r := by norm_num
  unfold rowStep
  rw [h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
    Nat.testBit_two_pow_mul]

private theorem mod_two_pow_eq_iff' (a b m : ℕ) :
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

theorem rowNat_return_succ_two (n T p : ℕ)
    (h : rowNat T % 2 ^ (n + 1) = rowNat (T + p) % 2 ^ (n + 1))
    (hb : (rowNat T).testBit n = true)
    (hc : (rowNat T).testBit (n + 1) = true)
    (hd : (rowNat (T + p)).testBit (n + 1) = true) :
    rowNat (T + 1) % 2 ^ (n + 3) = rowNat (T + p + 1) % 2 ^ (n + 3) := by
  have h2 : rowNat (T + 1) % 2 ^ (n + 2) = rowNat (T + p + 1) % 2 ^ (n + 2) :=
    (rowNat_return_succ_iff n T p h).2 (Or.inl hb)
  have hlow := (mod_two_pow_eq_iff' _ _ _).1 h
  have hlow2 := (mod_two_pow_eq_iff' _ _ _).1 h2
  rw [mod_two_pow_eq_iff']
  intro i hi
  by_cases hi' : i < n + 2
  · exact hlow2 i hi'
  · have hi2 : i = n + 2 := by omega
    subst hi2
    rw [rowNat_succ_eq', rowNat_succ_eq', testBit_rowStep', testBit_rowStep',
      show n + 2 - 2 = n from by omega, show n + 2 - 1 = n + 1 from by omega,
      hlow n (by omega), hc, hd]
    simp

-- 3. THE PERIOD WALL'S PACKED-ROW INTERFACE: the same as the landed
-- `leftDiagonal_periodicFrom_of_rowNat_agree` with the onset constraint dropped.
theorem leftDiagonal_periodicFrom_of_rowNat_agree_any (k p T : ℕ)
    (h : rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1)) :
    PeriodicFrom (leftDiagonal k) p T := by
  intro n hn
  rw [leftDiagonal_eq_rowNat_testBit k (n + p), leftDiagonal_eq_rowNat_testBit k n]
  have hmod : rowNat (n + k) % 2 ^ (k + 1) = rowNat (n + k + p) % 2 ^ (k + 1) :=
    rowNat_agree_forward (k + 1) T p (n + k) (by omega) h
  have hlt : k < k + 1 := Nat.lt_succ_self k
  have e1 : (rowNat (n + k) % 2 ^ (k + 1)).testBit k = (rowNat (n + k)).testBit k := by
    rw [Nat.testBit_mod_two_pow]; simp [hlt]
  have e2 : (rowNat (n + k + p) % 2 ^ (k + 1)).testBit k = (rowNat (n + k + p)).testBit k := by
    rw [Nat.testBit_mod_two_pow]; simp [hlt]
  have hbit : (rowNat (n + k)).testBit k = (rowNat (n + k + p)).testBit k := by
    rw [← e1, ← e2, hmod]
  rw [show n + p + k = n + k + p from by omega]
  exact hbit.symm

-- 4. ONE RETURN EQUATION IS A PERIOD, for the truncated row map.
theorem stepMod_preperiod_of_return (n N p x : ℕ)
    (h : (stepMod n)^[N + p] x = (stepMod n)^[N] x) :
    ∀ t ≥ N, (stepMod n)^[t + p] x = (stepMod n)^[t] x := by
  intro t ht
  obtain ⟨d, rfl⟩ := Nat.exists_eq_add_of_le ht
  rw [show N + d + p = d + (N + p) from by omega, show N + d = d + N from by omega,
    Function.iterate_add_apply, Function.iterate_add_apply, h]
