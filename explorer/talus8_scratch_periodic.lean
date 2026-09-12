/-
Talus, 2026-09-12. Attack on `periodic_polyTime`.

Claim under test: for every eventually periodic `f : ℕ → Bool` there is a
`Turing.TM2ComputableInPolyTime Computability.encodeNat Computability.encodeBool f`.
No rule 30 anywhere in this file.

The machine: one stack (`K = Unit`, so the input stack IS the output stack and there
is no other stack to empty), one label (`Λ = Unit`), internal state
`(done, n mod p so far, 2^i mod p, min(n so far, M), min(2^i, M))` with `M = N * p`.
Each `step` pops one input digit (little-endian, so digit `i` has weight `2^i`) and
either returns to the label or, if the stack was empty, pushes the answer, `load`s
the initial state back, and halts. Time: `|input| + 1` steps, polynomial `X + 1`.

Run with `lake env lean explorer/talus8_scratch_periodic.lean`.
-/
import Mathlib.Computability.TuringMachine.Computable
import Mathlib.Data.ZMod.Basic

open Computability Turing Turing.TM2 Turing.TM2.Stmt StateTransition

namespace Talus8

/-! ## 0. The value of a little-endian digit list, and that `encodeNat` is one -/

/-- The number a little-endian bit list denotes. -/
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

/-! ## 1. The machine -/

/-- Internal state: (input exhausted?, `n mod p` so far, `2^i mod p`,
`min (n so far) M`, `min (2^i) M`). Finite, and `Fintype` by instance search. -/
abbrev St (p M : ℕ) : Type := Bool × ZMod p × ZMod p × Fin (M + 1) × Fin (M + 1)

section Machine

variable (p M : ℕ) [NeZero p] (f : ℕ → Bool)

/-- The state after reading a prefix of value `v` and length `i`. -/
def stOf (v i : ℕ) : St p M :=
  (false, (v : ZMod p), ((2 ^ i : ℕ) : ZMod p), ⟨min v M, by omega⟩, ⟨min (2 ^ i) M, by omega⟩)

/-- Read one more digit. -/
def upd (s : St p M) (b : Bool) : St p M :=
  (false, s.2.1 + (b.toNat : ZMod p) * s.2.2.1, 2 * s.2.2.1,
    ⟨min (s.2.2.2.1.val + b.toNat * s.2.2.2.2.val) M, by omega⟩,
    ⟨min (2 * s.2.2.2.2.val) M, by omega⟩)

/-- What the machine writes: `f n` if `n < M`, else `f (M + n mod p)`. -/
def ans (s : St p M) : Bool :=
  if s.2.2.2.1.val < M then f s.2.2.2.1.val else f (M + s.2.1.val)

/-- The pop handler: `none` marks the input exhausted, `some b` reads a digit. -/
def popF (s : St p M) : Option Bool → St p M
  | none => (true, s.2)
  | some b => upd p M s b

/-- The machine. -/
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

/-- A configuration of the machine, at the machine's own configuration type, so that
every rewrite below matches syntactically. -/
def cfg (l : Option Unit) (s : St p M) (stk : List Bool) : (mach p M f).Cfg :=
  TM2.Cfg.mk l s (fun _ => stk)

/-! ## 2. One step of the machine, both cases -/

theorem step_cons (s : St p M) (b : Bool) (l : List Bool) :
    (mach p M f).step (cfg p M f (some ()) s (b :: l)) =
      some (cfg p M f (some ()) (upd p M s b) l) := rfl

theorem step_nil (s : St p M) :
    (mach p M f).step (cfg p M f (some ()) s []) =
      some (cfg p M f none (stOf p M 0 0) [ans p M f (true, s.2)]) := rfl

/-! ## 3. The state invariant -/

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

/-- The answer the machine gives on the final state, as a function of `n`. -/
def target (n : ℕ) : Bool := if n < M then f n else f (M + n % p)

omit [NeZero p] in
theorem ans_stOf (n j : ℕ) : ans p M f (true, (stOf p M n j).2) = target p M f n := by
  simp only [ans, stOf, target, ZMod.val_natCast]
  by_cases h : n < M
  · simp [min_eq_left h.le, h]
  · have hm : min n M = M := min_eq_right (by omega)
    simp [hm, h]

/-! ## 4. The run: `|l| + 1` steps from the label to the halting configuration -/

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

/-! ## 5. The answer is `f n` when `M = N * p` -/

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

/-! ## 6. The theorem -/

/-- The definition the connector's scratch uses, verbatim, so the statement here is
the statement there (`Rule30/Prize.lean` spells it the same way). -/
def IsEventuallyPeriodic (f : ℕ → Bool) : Prop := ∃ p > 0, ∃ N, ∀ n ≥ N, f (n + p) = f n

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

/-! ## 7. What it buys: the connector's two unproved objects -/

/-- P3 against Mathlib's own model, as in `explorer/pantograph_scratch_p3.lean`,
restated here for an arbitrary `g` so this file stays rule-30-free. -/
theorem polyTime_core_implies_not_periodic (g : ℕ → Bool)
    (h : IsEmpty (TM2ComputableInPolyTime encodeNat encodeBool g)) :
    ¬ IsEventuallyPeriodic g := fun hper =>
  (periodic_polyTime g hper).elim h.elim

/-- Non-vacuity in the other direction: the parity of `n` is eventually periodic
(period 2 from 0), so the model admits a fast machine for it. -/
theorem shortcutExists :
    Nonempty (TM2ComputableInPolyTime encodeNat encodeBool (fun n => decide (n % 2 = 1))) :=
  periodic_polyTime _ ⟨2, by norm_num, 0, fun n _ => by simp [Nat.add_mod_right]⟩

#print axioms periodic_polyTime
#print axioms polyTime_core_implies_not_periodic
#print axioms shortcutExists

/-! ## 8. A concrete run, evaluated by the kernel rather than argued.
`g n = decide (n % 3 = 1)`, period 3 from 0, so `M = 0 * 3 = 0`; use `M = 3` to exercise
the `n ≥ M` branch. `encodeNat 13 = [true, false, true, true]`, four digits, five steps;
`13 % 3 = 1` so the answer is `true`. `encodeNat 5 = [true, false, true]`, four steps,
`5 % 3 = 2`, answer `false`. Both compared against `haltList` itself, state and stack. -/

def g3 (n : ℕ) : Bool := decide (n % 3 = 1)

example : (flip bind (mach 3 3 g3).step)^[5] (some (initList (mach 3 3 g3) (encodeNat 13))) =
    some (haltList (mach 3 3 g3) [true]) := rfl

example : (flip bind (mach 3 3 g3).step)^[4] (some (initList (mach 3 3 g3) (encodeNat 5))) =
    some (haltList (mach 3 3 g3) [false]) := rfl

-- and the check can fail: four steps are not enough for a four-digit input (still at the label)
example : (flip bind (mach 3 3 g3).step)^[4] (some (initList (mach 3 3 g3) (encodeNat 13))) ≠
    some (haltList (mach 3 3 g3) [true]) := by
  intro h
  have := congrArg (fun c => c.map (fun c => c.l.isSome)) h
  exact absurd this (by decide)

end Talus8
