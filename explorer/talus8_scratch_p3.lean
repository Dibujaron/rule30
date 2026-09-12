/-
Talus, 2026-09-12. The connector's `explorer/pantograph_scratch_p3.lean` with its one
`sorry` replaced by the construction of `explorer/talus8_scratch_periodic.lean` (copied,
because a scratch file cannot import another). The only rule 30 in this file is in
section 9, where `P3Core_implies_P1` is stated against `centerColumn` and
`Rule30/Prize.lean`'s own `IsEventuallyPeriodic`, and `#print axioms` on it must read
`[propext, Classical.choice, Quot.sound]` — no `sorryAx`.

Run with `lake env lean explorer/talus8_scratch_p3.lean`.
-/
import Rule30.Prize
import Mathlib.Computability.TuringMachine.Computable
import Mathlib.Data.ZMod.Basic

open Computability Turing Turing.TM2 Turing.TM2.Stmt StateTransition

namespace Talus8P3

def val : List Bool → ℕ
  | [] => 0
  | b :: l => b.toNat + 2 * val l

theorem val_encodePosNum (n : PosNum) : val (encodePosNum n) = n := by
  induction n with
  | one => simp [encodePosNum, val]
  | bit1 n ih =>
    simp only [encodePosNum, val, ih, PosNum.cast_bit1, Bool.toNat_true]
    ring
  | bit0 n ih =>
    simp only [encodePosNum, val, ih, PosNum.cast_bit0, Bool.toNat_false]
    ring

theorem val_encodeNat (n : ℕ) : val (encodeNat n) = n := by
  unfold encodeNat
  conv_rhs => rw [← Num.to_of_nat n]
  generalize (n : Num) = m
  cases m with
  | zero => simp [encodeNum, val]
  | pos m => simp [encodeNum, val_encodePosNum, Num.cast_pos]

abbrev St (p M : ℕ) : Type := Bool × ZMod p × ZMod p × Fin (M + 1) × Fin (M + 1)

section Machine

variable (p M : ℕ) [NeZero p] (f : ℕ → Bool)

def stOf (v i : ℕ) : St p M :=
  (false, (v : ZMod p), ((2 ^ i : ℕ) : ZMod p), ⟨min v M, by omega⟩, ⟨min (2 ^ i) M, by omega⟩)

def upd (s : St p M) (b : Bool) : St p M :=
  (false, s.2.1 + (b.toNat : ZMod p) * s.2.2.1, 2 * s.2.2.1,
    ⟨min (s.2.2.2.1.val + b.toNat * s.2.2.2.2.val) M, by omega⟩,
    ⟨min (2 * s.2.2.2.2.val) M, by omega⟩)

def ans (s : St p M) : Bool :=
  if s.2.2.2.1.val < M then f s.2.2.2.1.val else f (M + s.2.1.val)

def popF (s : St p M) : Option Bool → St p M
  | none => (true, s.2)
  | some b => upd p M s b

def mach : FinTM2 where
  K := Unit
  k₀ := ()
  k₁ := ()
  Γ _ := Bool
  Λ := Unit
  main := ()
  σ := St p M
  initialState := stOf p M 0 0
  m _ := pop () (popF p M)
          (branch (fun s => s.1)
            (push () (ans p M f) (load (fun _ => stOf p M 0 0) halt))
            (goto (fun _ => ())))

def cfg (l : Option Unit) (s : St p M) (stk : List Bool) : (mach p M f).Cfg :=
  TM2.Cfg.mk l s (fun _ => stk)

theorem step_cons (s : St p M) (b : Bool) (l : List Bool) :
    (mach p M f).step (cfg p M f (some ()) s (b :: l)) =
      some (cfg p M f (some ()) (upd p M s b) l) := rfl

theorem step_nil (s : St p M) :
    (mach p M f).step (cfg p M f (some ()) s []) =
      some (cfg p M f none (stOf p M 0 0) [ans p M f (true, s.2)]) := rfl

omit [NeZero p] in
theorem upd_stOf (v i : ℕ) (b : Bool) :
    upd p M (stOf p M v i) b = stOf p M (v + b.toNat * 2 ^ i) (i + 1) := by
  simp only [upd, stOf, Prod.mk.injEq, Fin.mk.injEq, true_and]
  refine ⟨?_, ?_, ?_, ?_⟩
  · push_cast; ring
  · push_cast; ring
  · generalize 2 ^ i = t
    cases b <;> simp only [Bool.toNat_false, Bool.toNat_true, zero_mul, one_mul, add_zero] <;>
      omega
  · rw [pow_succ]
    generalize 2 ^ i = t
    omega

def target (n : ℕ) : Bool := if n < M then f n else f (M + n % p)

omit [NeZero p] in
theorem ans_stOf (n j : ℕ) : ans p M f (true, (stOf p M n j).2) = target p M f n := by
  simp only [ans, stOf, target, ZMod.val_natCast]
  by_cases h : n < M
  · simp [min_eq_left h.le, h]
  · have hm : min n M = M := min_eq_right (by omega)
    simp [hm, h]

omit [NeZero p] in
theorem flip_bind_some {α : Type} (g : α → Option α) (a : α) : flip bind g (some a) = g a := rfl

theorem run : ∀ (l : List Bool) (v i : ℕ),
    (flip bind (mach p M f).step)^[l.length + 1] (some (cfg p M f (some ()) (stOf p M v i) l)) =
      some (cfg p M f none (stOf p M 0 0) [target p M f (v + 2 ^ i * val l)])
  | [], v, i => by
    simp only [List.length_nil, zero_add, Function.iterate_one]
    rw [flip_bind_some, step_nil, ans_stOf]
    simp [val]
  | b :: l, v, i => by
    rw [List.length_cons, Function.iterate_succ_apply, flip_bind_some, step_cons, upd_stOf,
      run l]
    congr 4
    simp only [val]
    cases b <;> simp <;> ring

end Machine

theorem target_eq (p N : ℕ) [NeZero p] (f : ℕ → Bool) (hN : ∀ n ≥ N, f (n + p) = f n) (n : ℕ) :
    target p (N * p) f n = f n := by
  unfold target
  split_ifs with h
  · rfl
  · simp only [not_lt] at h
    have hp : 0 < p := Nat.pos_of_ne_zero (NeZero.ne p)
    have key : ∀ q m, N ≤ m → f (m + q * p) = f m := by
      intro q
      induction q with
      | zero => intro m _; simp
      | succ q ih => intro m hm; rw [Nat.succ_mul, ← add_assoc, hN _ (by omega), ih m hm]
    have h1 := Nat.div_add_mod (n - N * p) p
    have h2 : (n - N * p) % p = n % p := by
      conv_rhs => rw [show n = (n - N * p) + N * p by omega]
      rw [Nat.add_mul_mod_self_right]
    have hn : n = (N * p + n % p) + p * ((n - N * p) / p) := by omega
    have hle : N ≤ N * p + n % p := by
      have := Nat.le_mul_of_pos_right N hp
      omega
    conv_rhs => rw [hn, mul_comm p, key _ _ hle]

/-- The handoff lemma, stated with `Rule30/Prize.lean`'s own `IsEventuallyPeriodic`. -/
theorem periodic_polyTime (f : ℕ → Bool) (h : IsEventuallyPeriodic f) :
    Nonempty (TM2ComputableInPolyTime encodeNat encodeBool f) := by
  obtain ⟨p, hp, N, hN⟩ := h
  have : NeZero p := ⟨hp.ne'⟩
  refine ⟨{ tm := mach p (N * p) f
            inputAlphabet := Equiv.refl _
            outputAlphabet := Equiv.refl _
            time := Polynomial.X + 1
            outputsFun := fun n => ?_ }⟩
  refine { steps := (encodeNat n).length + 1, evals_in_steps := ?_, steps_le_m := by simp }
  have hin : List.map (@Equiv.invFun ((mach p (N * p) f).Γ (mach p (N * p) f).k₀) Bool
      (Equiv.refl _)) (encodeNat n) = encodeNat n := List.map_id _
  have hout : List.map (@Equiv.invFun ((mach p (N * p) f).Γ (mach p (N * p) f).k₁) Bool
      (Equiv.refl _)) (encodeBool (f n)) = [f n] := List.map_id _
  rw [hin, hout]
  show (flip bind (mach p (N * p) f).step)^[(encodeNat n).length + 1]
      (some (initList (mach p (N * p) f) (encodeNat n))) =
    some (haltList (mach p (N * p) f) [f n])
  have h1 : initList (mach p (N * p) f) (encodeNat n) =
      cfg p (N * p) f (some ()) (stOf p (N * p) 0 0) (encodeNat n) := rfl
  have h2 : haltList (mach p (N * p) f) [f n] =
      cfg p (N * p) f none (stOf p (N * p) 0 0) [f n] := rfl
  rw [h1, h2]
  have := run p (N * p) f (encodeNat n) 0 0
  simp only [val_encodeNat, pow_zero, one_mul, zero_add, target_eq p N f hN] at this
  exact this

/-! ## 9. The connector's derivation, verbatim, now without `sorry` -/

/-- P3, robust core, from `explorer/pantograph_scratch_p3.lean`. -/
def P3Core : Prop :=
  IsEmpty (TM2ComputableInPolyTime encodeNat encodeBool centerColumn)

/-- **P3 in this model implies P1**, and the proof rests on no `sorry`. -/
theorem P3Core_implies_P1 (h : P3Core) : ¬ IsEventuallyPeriodic centerColumn := by
  intro hper
  exact (periodic_polyTime centerColumn hper).elim h.elim

/-- The connector's `ShortcutExists`, verbatim. -/
def ShortcutExists : Prop :=
  Nonempty (TM2ComputableInPolyTime encodeNat encodeBool (fun n => decide (n % 2 = 1)))

theorem shortcutExists : ShortcutExists :=
  periodic_polyTime _ ⟨2, by norm_num, 0, fun n _ => by simp [Nat.add_mod_right]⟩

#print axioms P3Core_implies_P1
#print axioms shortcutExists

end Talus8P3
