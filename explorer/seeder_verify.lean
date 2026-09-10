import Rule30.Basic
import Rule30.Proofs.LeftDiagonalRecurrence
import Rule30.Proofs.LeftDiagonalPeriodicFromStepOfBlack
import Rule30.Proofs.BoolDrivenPeriodicFromOfReturn
import Mathlib.Tactic
import Rule30.Proofs.RowNatReturnSuccIff
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Rule30.Proofs.RowNatAgreeForward
import Rule30.Proofs.StepModIterateTwoMul

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
  · have hb2 : leftDiagonal (m + 2) (j + 1 + q) = true := by
      rw [h2 (j + 1) le_rfl]; exact hblack2
    have e1 := leftDiagonal_recurrence (m + 1) j
    have e2 := leftDiagonal_recurrence (m + 1) (j + q)
    have hd : leftDiagonal (m + 1) (j + q + 2) = leftDiagonal (m + 1) (j + 2) := by
      rw [show j + q + 2 = j + 2 + q from by omega]
      exact h1 (j + 2) (by omega)
    rw [show j + 1 + q = j + q + 1 from by omega, e2, e1, hblack2,
      show j + q + 1 = j + 1 + q from by omega, hb2, hd]
    simp

theorem rowNat_return_succ_two (n T p : ℕ)
    (h : rowNat T % 2 ^ (n + 1) = rowNat (T + p) % 2 ^ (n + 1))
    (hb : (rowNat T).testBit n = true)
    (hc : (rowNat T).testBit (n + 1) = true)
    (hd : (rowNat (T + p)).testBit (n + 1) = true) :
    rowNat (T + 1) % 2 ^ (n + 3) = rowNat (T + p + 1) % 2 ^ (n + 3) := by
  have hstep : ∀ t : ℕ, rowNat (t + 1) = rowStep (rowNat t) := fun _ => rfl
  have hbits : ∀ r i : ℕ, (rowStep r).testBit i
      = xor (decide (2 ≤ i) && r.testBit (i - 2))
          ((decide (1 ≤ i) && r.testBit (i - 1)) || r.testBit i) := by
    intro r i
    have h4 : 4 * r = 2 ^ 2 * r := by norm_num
    have h2 : 2 * r = 2 ^ 1 * r := by norm_num
    unfold rowStep
    rw [h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
      Nat.testBit_two_pow_mul]
  have hiff : ∀ a b m : ℕ, a % 2 ^ m = b % 2 ^ m ↔ ∀ i < m, a.testBit i = b.testBit i := by
    intro a b m
    constructor
    · intro hab i hi
      have := congrArg (fun x => x.testBit i) hab
      simpa [Nat.testBit_mod_two_pow, hi] using this
    · intro hab
      apply Nat.eq_of_testBit_eq
      intro i
      rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow]
      by_cases hi : i < m
      · simp [hi, hab i hi]
      · simp [hi]
  have h2 : rowNat (T + 1) % 2 ^ (n + 2) = rowNat (T + p + 1) % 2 ^ (n + 2) :=
    (rowNat_return_succ_iff n T p h).2 (Or.inl hb)
  have hlow := (hiff _ _ _).1 h
  have hlow2 := (hiff _ _ _).1 h2
  rw [hiff]
  intro i hi
  by_cases hi' : i < n + 2
  · exact hlow2 i hi'
  · have hi2 : i = n + 2 := by omega
    subst hi2
    rw [hstep, hstep, hbits, hbits,
      show n + 2 - 2 = n from by omega, show n + 2 - 1 = n + 1 from by omega,
      hlow n (by omega), hc, hd]
    simp

#eval (List.range 200).all (fun T => (List.range 40).all (fun n =>
  !((decide (rowNat T % 2 ^ (n + 1) = rowNat (T + 16) % 2 ^ (n + 1)))
      && (rowNat T).testBit n && (rowNat T).testBit (n + 1)
      && (rowNat (T + 16)).testBit (n + 1))
  || decide (rowNat (T + 1) % 2 ^ (n + 3) = rowNat (T + 16 + 1) % 2 ^ (n + 3))))

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

theorem stepMod_preperiod_of_return (n N p x : ℕ)
    (h : (stepMod n)^[N + p] x = (stepMod n)^[N] x) :
    ∀ t ≥ N, (stepMod n)^[t + p] x = (stepMod n)^[t] x := by
  intro t ht
  obtain ⟨d, rfl⟩ := Nat.exists_eq_add_of_le ht
  have e1 : (stepMod n)^[N + d + p] x = (stepMod n)^[d] ((stepMod n)^[N + p] x) := by
    rw [← Function.iterate_add_apply]; congr 1; omega
  have e2 : (stepMod n)^[N + d] x = (stepMod n)^[d] ((stepMod n)^[N] x) := by
    rw [← Function.iterate_add_apply]; congr 1; omega
  rw [e1, e2, h]

theorem stepMod_preperiod_of_odd (B : ℕ → ℕ) (hmono : ∀ n, B n ≤ B (n + 1))
    (H : ∀ n x : ℕ, x < 2 ^ n → x % 2 = 1 → ∃ p > 0, ∀ t ≥ B n,
      (stepMod n)^[t + p] x = (stepMod n)^[t] x) :
    ∀ n x : ℕ, x < 2 ^ n → ∃ p > 0, ∀ t ≥ B n,
      (stepMod n)^[t + p] x = (stepMod n)^[t] x := by
  have hzero : ∀ n m : ℕ, (stepMod n)^[m] 0 = 0 := by
    intro n m
    induction m with
    | zero => rfl
    | succ m ih => rw [Function.iterate_succ_apply', ih]; simp [stepMod, rowStep]
  intro n
  induction n with
  | zero =>
    intro x hx
    have : x = 0 := by simpa using hx
    subst this
    exact ⟨1, one_pos, fun t _ => by rw [hzero, hzero]⟩
  | succ m ih =>
    intro x hx
    by_cases hodd : x % 2 = 1
    · exact H (m + 1) x hx hodd
    · have hx2 : x = 2 * (x / 2) := by omega
      have hs : x / 2 < 2 ^ m := by
        have hp : 2 ^ (m + 1) = 2 * 2 ^ m := by ring
        omega
      obtain ⟨p, hp, hall⟩ := ih (x / 2) hs
      refine ⟨p, hp, fun t ht => ?_⟩
      have hBm : B m ≤ B (m + 1) := hmono m
      rw [hx2, stepMod_iterate_two_mul, stepMod_iterate_two_mul, hall t (by omega)]

#print axioms leftDiagonal_periodicFrom_step_two_of_black

#print axioms rowNat_return_succ_two

#print axioms leftDiagonal_periodicFrom_of_rowNat_agree_any

#print axioms stepMod_preperiod_of_return

#print axioms stepMod_preperiod_of_odd
