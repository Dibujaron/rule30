/-
Talus, 2026-09-12.  The rule-90 witness, half two: the machine, and the litmus.

Three things.  (1) A GENERAL lemma: any `f : ℕ → Bool` decided by a finite
automaton reading the little-endian binary digits of `n` is
`TM2ComputableInPolyTime` against `Computability.encodeNat`, in exactly
`|input| + 1` steps.  (2) Its instance at rule 90's column 1, together with the
closed form and the aperiodicity proof from `talus9_scratch_rule90.lean`, giving
`litmus`: a sequence that is NOT eventually periodic and IS computed by
Mathlib's own machine model in polynomial time -- and `aperiodic_not_hard`, the
same fact in `P3Core`'s own shape.  (3) A check that (1) deserves the word
"general": this morning's `periodic_polyTime`, and `P3Core_implies_P1` with it,
are re-proved as corollaries of (1), so the 150-line machine of
`explorer/talus8_scratch_periodic.lean` is not needed at all.

The rule-90 half of `talus9_scratch_rule90.lean` is repeated here verbatim
rather than imported, because `explorer/` is not a `lean_lib` in `lakefile.lean`
and scratch files cannot import one another.  It is the same text; that file is
the standalone one for the cellular-automaton claim.

Run with `lake env lean explorer/talus9_scratch_witness.lean`.
-/
import Rule30.Prize
import Mathlib.Computability.TuringMachine.Computable
import Mathlib.Tactic

open Computability Turing Turing.TM2 Turing.TM2.Stmt StateTransition

namespace Talus9M

/-! ## 0. Rule 90's column 1 (repeated from `talus9_scratch_rule90.lean`) -/

def rule90 : Config → Config := ElementaryCA.step 90

theorem rule90_eq (c : Config) (i : ℤ) : rule90 c i = xor (c (i - 1)) (c (i + 1)) := by
  show ElementaryCA.step 90 c i = _
  unfold ElementaryCA.step ElementaryCA.neighborhoodIndex
  cases c (i - 1) <;> cases c i <;> cases c (i + 1) <;> rfl

def E (t : ℕ) : Config := rule90^[t] initialConfig

theorem E_zero (x : ℤ) : E 0 x = decide (x = 0) := rfl

theorem E_succ (t : ℕ) (x : ℤ) : E (t + 1) x = xor (E t (x - 1)) (E t (x + 1)) := by
  show rule90^[t + 1] initialConfig x = _
  rw [Function.iterate_succ_apply']
  exact rule90_eq _ _

theorem xor_middle (a b c : Bool) : xor (xor a b) (xor b c) = xor a c := by
  cases a <;> cases b <;> cases c <;> rfl

theorem E_add_two (t : ℕ) (x : ℤ) : E (t + 2) x = xor (E t (x - 2)) (E t (x + 2)) := by
  have h : E (t + 1 + 1) x = xor (E (t + 1) (x - 1)) (E (t + 1) (x + 1)) := E_succ (t + 1) x
  rw [E_succ t (x - 1), E_succ t (x + 1)] at h
  have e1 : x - 1 - 1 = x - 2 := by ring
  have e2 : x - 1 + 1 = x := by ring
  have e3 : x + 1 - 1 = x := by ring
  have e4 : x + 1 + 1 = x + 2 := by ring
  rw [e1, e2, e3, e4, xor_middle] at h
  exact h

theorem E_of_odd (t : ℕ) : ∀ x : ℤ, ¬ (2 ∣ (x + (t : ℤ))) → E t x = false := by
  induction t with
  | zero =>
    intro x hx
    push_cast at hx
    have : x ≠ 0 := by omega
    rw [E_zero]
    simp [this]
  | succ t ih =>
    intro x hx
    push_cast at hx
    rw [E_succ, ih (x - 1) (by push_cast; omega), ih (x + 1) (by push_cast; omega)]
    rfl

theorem E_two_mul (t : ℕ) : ∀ y : ℤ, E (2 * t) (2 * y) = E t y := by
  induction t with
  | zero => intro y; simp [E_zero]
  | succ t ih =>
    intro y
    have hstep : 2 * (t + 1) = 2 * t + 2 := by ring
    rw [hstep, E_add_two, E_succ]
    have e1 : 2 * y - 2 = 2 * (y - 1) := by ring
    have e2 : 2 * y + 2 = 2 * (y + 1) := by ring
    rw [e1, e2, ih, ih]

theorem E_center (t : ℕ) : E t 0 = decide (t = 0) := by
  induction t using Nat.strong_induction_on with
  | _ t ih =>
    rcases Nat.even_or_odd t with ⟨s, hs⟩ | ⟨s, hs⟩
    · rcases Nat.eq_zero_or_pos s with rfl | hs0
      · simp [hs, E_zero]
      · have ht : t = 2 * s := by omega
        subst ht
        have h := E_two_mul s 0
        norm_num at h
        rw [h, ih s (by omega)]
        simp
    · have hpar : ¬ (2 ∣ ((0 : ℤ) + (t : ℤ))) := by subst hs; push_cast; omega
      rw [E_of_odd t 0 hpar]
      simp
      omega

theorem E_col1_odd (s : ℕ) : E (2 * s + 1) 1 = xor (decide (s = 0)) (E s 1) := by
  rw [E_succ]
  norm_num
  have h0 : E (2 * s) 0 = decide (2 * s = 0) := E_center _
  have h2 : E (2 * s) 2 = E s 1 := by
    have h := E_two_mul s 1
    norm_num at h
    exact h
  rw [h0, h2]
  congr 1
  simp

theorem E_col1 (t : ℕ) : E t 1 = true ↔ ∃ j, 1 ≤ j ∧ t + 1 = 2 ^ j := by
  induction t using Nat.strong_induction_on with
  | _ t ih =>
    rcases Nat.even_or_odd t with ⟨s, hs⟩ | ⟨s, hs⟩
    · have ht : t = 2 * s := by omega
      subst ht
      have hpar : ¬ (2 ∣ ((1 : ℤ) + ((2 * s : ℕ) : ℤ))) := by push_cast; omega
      rw [E_of_odd _ 1 hpar]
      simp only [false_iff, Bool.false_eq_true, not_exists]
      rintro j ⟨hj, hje⟩
      have : (2 : ℕ) ∣ 2 ^ j := dvd_pow_self 2 (by omega)
      omega
    · subst hs
      rw [E_col1_odd]
      rcases Nat.eq_zero_or_pos s with rfl | hs0
      · have : E 0 1 = false := by rw [E_zero]; simp
        rw [this]
        simp only [decide_true, Bool.xor_false, true_iff]
        exact ⟨1, by norm_num⟩
      · have hne : (decide (s = 0)) = false := by simp; omega
        rw [hne, Bool.false_xor, ih s (by omega)]
        constructor
        · rintro ⟨j, hj, hje⟩
          exact ⟨j + 1, by omega, by rw [pow_succ]; omega⟩
        · rintro ⟨j, hj, hje⟩
          have hj2 : 2 ≤ j := by
            by_contra hc
            have : j = 1 := by omega
            subst this
            norm_num at hje
            omega
          refine ⟨j - 1, by omega, ?_⟩
          have : 2 ^ j = 2 * 2 ^ (j - 1) := by
            rw [← pow_succ']
            congr 1
            omega
          omega

-- `IsEventuallyPeriodic` below is `Rule30/Prize.lean`'s own, imported rather than
-- re-spelled, so the statement here is the statement there.

theorem col1_not_eventually_periodic : ¬ IsEventuallyPeriodic (fun t => E t 1) := by
  rintro ⟨p, hp, N, hN⟩
  obtain ⟨j, hj, hjN⟩ : ∃ j, 1 ≤ j ∧ N + p + 1 ≤ 2 ^ j :=
    ⟨N + p + 1, by omega, Nat.le_of_lt Nat.lt_two_pow_self⟩
  set t := 2 ^ j - 1 with ht
  have h1 : (1 : ℕ) ≤ 2 ^ j := Nat.one_le_two_pow
  have hblack : E t 1 = true := (E_col1 t).2 ⟨j, hj, by omega⟩
  have htN : t ≥ N := by omega
  have hnext : E (t + p) 1 = true := by
    have := hN t htN
    simpa [hblack] using this
  obtain ⟨i, hi, hie⟩ := (E_col1 (t + p)).1 hnext
  have he : 2 ^ i = 2 ^ j + p := by omega
  have hij : j < i := by
    by_contra hc
    have : 2 ^ i ≤ 2 ^ j := Nat.pow_le_pow_right (by norm_num) (by omega)
    omega
  have : 2 ^ j * 2 ≤ 2 ^ i := by
    calc 2 ^ j * 2 = 2 ^ (j + 1) := by rw [pow_succ]
    _ ≤ 2 ^ i := Nat.pow_le_pow_right (by norm_num) (by omega)
  omega

/-! ## 1. Little-endian digit lists: value, and that `encodeNat` is canonical -/

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

/-- **Canonicity.** The encoding of a positive number ends in a `true`: there are
no leading zeros.  This is what makes "all digits are 1" a property of the number
rather than of the list — `val` is not injective (`[true, false]` and `[true]`
both denote 1). -/
theorem encodePosNum_snoc (n : PosNum) : ∃ l, encodePosNum n = l ++ [true] := by
  induction n with
  | one => exact ⟨[], rfl⟩
  | bit1 n ih => obtain ⟨l, hl⟩ := ih; exact ⟨true :: l, by simp [encodePosNum, hl]⟩
  | bit0 n ih => obtain ⟨l, hl⟩ := ih; exact ⟨false :: l, by simp [encodePosNum, hl]⟩

theorem encodeNat_snoc (n : ℕ) (hn : 1 ≤ n) : ∃ l, encodeNat n = l ++ [true] := by
  unfold encodeNat
  cases h : (n : Num) with
  | zero =>
    exfalso
    have : ((n : Num) : ℕ) = n := Num.to_of_nat n
    rw [h] at this
    simp at this
    omega
  | pos m => simpa [encodeNum] using encodePosNum_snoc m

/-! ## 2. `val` against the length: the two inequalities, and the equality case -/

theorem val_lt (l : List Bool) : val l + 1 ≤ 2 ^ l.length := by
  induction l with
  | nil => simp [val]
  | cons b l ih =>
    simp only [val, List.length_cons, pow_succ]
    cases b <;> simp <;> omega

theorem val_snoc_ge (l : List Bool) : 2 ^ l.length ≤ val (l ++ [true]) := by
  induction l with
  | nil => simp [val]
  | cons b l ih =>
    simp only [List.cons_append, val, List.length_cons, pow_succ]
    omega

theorem val_eq_max_iff (l : List Bool) :
    val l + 1 = 2 ^ l.length ↔ ∀ b ∈ l, b = true := by
  induction l with
  | nil => simp [val]
  | cons b l ih =>
    have hle := val_lt l
    constructor
    · intro h
      simp only [val, List.length_cons, pow_succ] at h
      have hb : b = true := by
        cases b
        · simp at h; omega
        · rfl
      subst hb
      intro c hc
      rcases List.mem_cons.1 hc with rfl | hc
      · rfl
      · exact ih.1 (by simp at h; omega) c hc
    · intro h
      have hb : b = true := h b (by simp)
      have hl : ∀ c ∈ l, c = true := fun c hc => h c (by simp [hc])
      have := ih.2 hl
      subst hb
      simp only [val, List.length_cons, pow_succ, Bool.toNat_true]
      omega

/-- **The bridge.** The digits of `n` are all `1`, and there is at least one, exactly
when `n + 1` is a power of two with exponent at least one. -/
theorem allOnes_iff (n : ℕ) :
    (encodeNat n ≠ [] ∧ ∀ b ∈ encodeNat n, b = true) ↔ ∃ j, 1 ≤ j ∧ n + 1 = 2 ^ j := by
  constructor
  · rintro ⟨hne, hall⟩
    refine ⟨(encodeNat n).length, ?_, ?_⟩
    · rcases List.eq_nil_or_concat (encodeNat n) with h | ⟨_, _, h⟩
      · exact absurd h hne
      · rw [h]; simp
    · have h := (val_eq_max_iff (encodeNat n)).2 hall
      rw [val_encodeNat] at h
      exact h
  · rintro ⟨j, hj, hje⟩
    have hn : 1 ≤ n := by
      have : 2 ≤ 2 ^ j := by
        calc (2 : ℕ) = 2 ^ 1 := (pow_one 2).symm
        _ ≤ 2 ^ j := Nat.pow_le_pow_right (by norm_num) hj
      omega
    obtain ⟨l, hl⟩ := encodeNat_snoc n hn
    have hlen : (encodeNat n).length = l.length + 1 := by rw [hl]; simp
    have hne : encodeNat n ≠ [] := by rw [hl]; simp
    refine ⟨hne, ?_⟩
    -- `2 ^ l.length ≤ n = 2 ^ j - 1 < 2 ^ j`, so `l.length < j`, so `|encodeNat n| ≤ j`
    have hge : 2 ^ l.length ≤ n := by
      have := val_snoc_ge l
      rw [← hl, val_encodeNat] at this
      exact this
    have hlt : 2 ^ l.length < 2 ^ j := by omega
    have h1 : l.length < j := (Nat.pow_lt_pow_iff_right (by norm_num)).1 hlt
    -- and `n + 1 = 2 ^ j ≤ 2 ^ |encodeNat n|`, so `j ≤ |encodeNat n|`
    have hle : 2 ^ j ≤ 2 ^ (encodeNat n).length := by
      have := val_lt (encodeNat n)
      rw [val_encodeNat] at this
      omega
    have h2 : j ≤ (encodeNat n).length := (Nat.pow_le_pow_iff_right (by norm_num)).1 hle
    have hj' : j = (encodeNat n).length := by omega
    refine (val_eq_max_iff _).1 ?_
    rw [val_encodeNat, ← hj']
    exact hje

/-! ## 3. The general lemma: a finite automaton on the digits is a fast `FinTM2` -/

section Machine

variable {S : Type} [Fintype S] (s₀ : S) (δ : S → Bool → S) (out : S → Bool)

/-- The pop handler.  `none` means the input is exhausted; the flag has to be
written into the state, because `pop k f q` hands the popped `Option` to `f` and
never to the continuation `q`. -/
def popF (s : Bool × S) : Option Bool → Bool × S
  | none => (true, s.2)
  | some b => (false, δ s.2 b)

/-- The machine: one stack, so the input stack IS the output stack and there is no
other stack for `haltList` to require empty; one label; one `step` per input digit;
and a `load` restoring `initialState` immediately before `halt`, which is what
`haltList` demands. -/
def mach : FinTM2 where
  K := Unit
  k₀ := ()
  k₁ := ()
  Γ _ := Bool
  Λ := Unit
  main := ()
  σ := Bool × S
  initialState := (false, s₀)
  m _ := pop () (popF δ)
          (branch (fun s => s.1)
            (push () (fun s => out s.2) (load (fun _ => (false, s₀)) halt))
            (goto (fun _ => ())))

/-- A configuration at the machine's own `Cfg` type, so that every `rw` below
matches syntactically rather than only up to defeq. -/
def cfg (l : Option Unit) (s : Bool × S) (stk : List Bool) : (mach s₀ δ out).Cfg :=
  TM2.Cfg.mk l s (fun _ => stk)

theorem step_cons (s : Bool × S) (b : Bool) (l : List Bool) :
    (mach s₀ δ out).step (cfg s₀ δ out (some ()) s (b :: l)) =
      some (cfg s₀ δ out (some ()) (false, δ s.2 b) l) := rfl

theorem step_nil (s : Bool × S) :
    (mach s₀ δ out).step (cfg s₀ δ out (some ()) s []) =
      some (cfg s₀ δ out none (false, s₀) [out s.2]) := rfl

theorem flip_bind_some {α : Type} (g : α → Option α) (a : α) : flip bind g (some a) = g a := rfl

theorem run : ∀ (l : List Bool) (s : S),
    (flip bind (mach s₀ δ out).step)^[l.length + 1]
        (some (cfg s₀ δ out (some ()) (false, s) l)) =
      some (cfg s₀ δ out none (false, s₀) [out (List.foldl δ s l)]) := by
  intro l
  induction l with
  | nil =>
    intro s
    simp only [List.length_nil, zero_add, Function.iterate_one]
    rw [flip_bind_some, step_nil]
    rfl
  | cons b l ih =>
    intro s
    rw [List.length_cons, Function.iterate_succ_apply, flip_bind_some, step_cons, ih]
    rfl

end Machine

/-- **A finite automaton on the little-endian digits gives a fast machine.**
Time `X + 1`: one `step` per digit, plus one to halt. -/
theorem dfa_polyTime {S : Type} [Fintype S] (s₀ : S) (δ : S → Bool → S) (out : S → Bool)
    (f : ℕ → Bool) (hf : ∀ n, out (List.foldl δ s₀ (encodeNat n)) = f n) :
    Nonempty (TM2ComputableInPolyTime encodeNat encodeBool f) := by
  refine ⟨{ tm := mach s₀ δ out
            inputAlphabet := Equiv.refl _
            outputAlphabet := Equiv.refl _
            time := Polynomial.X + 1
            outputsFun := fun n => ?_ }⟩
  refine { steps := (encodeNat n).length + 1, evals_in_steps := ?_, steps_le_m := by simp }
  have hin : List.map (@Equiv.invFun ((mach s₀ δ out).Γ (mach s₀ δ out).k₀) Bool
      (Equiv.refl _)) (encodeNat n) = encodeNat n := List.map_id _
  have hout : List.map (@Equiv.invFun ((mach s₀ δ out).Γ (mach s₀ δ out).k₁) Bool
      (Equiv.refl _)) (encodeBool (f n)) = [f n] := List.map_id _
  rw [hin, hout]
  show (flip bind (mach s₀ δ out).step)^[(encodeNat n).length + 1]
      (some (initList (mach s₀ δ out) (encodeNat n))) =
    some (haltList (mach s₀ δ out) [f n])
  have h1 : initList (mach s₀ δ out) (encodeNat n) =
      cfg s₀ δ out (some ()) (false, s₀) (encodeNat n) := rfl
  have h2 : haltList (mach s₀ δ out) [f n] = cfg s₀ δ out none (false, s₀) [f n] := rfl
  rw [h1, h2, run, hf]

/-! ## 4. The automaton for rule 90's column 1, and the litmus -/

/-- State: `(a digit has been seen, every digit so far is 1)`.  Three of its four
values are reachable; **two states do not suffice**, because the empty digit list
encodes `n = 0`, where "every digit so far is 1" is vacuously true and the answer
must be `false`. -/
def dfaStep (s : Bool × Bool) (b : Bool) : Bool × Bool := (true, s.2 && b)

def dfaOut (s : Bool × Bool) : Bool := s.1 && s.2

theorem fold_out : ∀ (l : List Bool) (sw ok : Bool),
    dfaOut (List.foldl dfaStep (sw, ok) l) =
      ((sw || !l.isEmpty) && (ok && l.all (fun b => b))) := by
  intro l
  induction l with
  | nil => intro sw ok; cases sw <;> cases ok <;> rfl
  | cons b l ih =>
    intro sw ok
    rw [List.foldl_cons]
    show dfaOut (List.foldl dfaStep (true, ok && b) l) = _
    rw [ih]
    cases sw <;> cases ok <;> cases b <;> simp [List.all_cons]

theorem bool_ext {a b : Bool} (h : a = true ↔ b = true) : a = b := by
  cases a <;> cases b <;> simp_all

theorem dfa_computes (n : ℕ) :
    dfaOut (List.foldl dfaStep (false, true) (encodeNat n)) = E n 1 := by
  refine bool_ext ?_
  rw [fold_out, E_col1, ← allOnes_iff]
  simp only [Bool.and_eq_true, Bool.or_eq_true, Bool.not_eq_true', List.all_eq_true,
    Bool.false_eq_true, false_or, true_and]
  constructor
  · rintro ⟨hne, hall⟩
    exact ⟨by simpa [List.isEmpty_iff] using hne, fun b hb => hall b hb⟩
  · rintro ⟨hne, hall⟩
    exact ⟨by simpa [List.isEmpty_iff] using hne, fun b hb => hall b hb⟩

/-- **The witness.**  Column 1 of rule 90, grown from a single black cell, is
computed by a `FinTM2` in `|input| + 1` steps. -/
theorem rule90_col1_polyTime :
    Nonempty (TM2ComputableInPolyTime encodeNat encodeBool (fun t => E t 1)) :=
  dfa_polyTime (false, true) dfaStep dfaOut _ dfa_computes

/-- **The litmus.**  The model admits a fast machine for a sequence that is
genuinely aperiodic — so `IsEmpty (TM2ComputableInPolyTime ...)` is not a
statement everything satisfies, and `P3Core` is not true for a stupid reason. -/
theorem litmus :
    ¬ IsEventuallyPeriodic (fun t => E t 1) ∧
      Nonempty (TM2ComputableInPolyTime encodeNat encodeBool (fun t => E t 1)) :=
  ⟨col1_not_eventually_periodic, rule90_col1_polyTime⟩

/-- **The same fact in `P3Core`'s own shape: aperiodicity does not imply hardness.**
`P3Core g` is `IsEmpty (TM2ComputableInPolyTime encodeNat encodeBool g)`, so this says
there is a `g` which is not eventually periodic and for which `P3Core g` is FALSE.
Hence no proof of P3 can go through P1 alone -- nor through anything shared by every
column of every elementary cellular automaton grown from a single black cell, since
`g` is exactly such a column. -/
theorem aperiodic_not_hard :
    ∃ g : ℕ → Bool, ¬ IsEventuallyPeriodic g ∧
      ¬ IsEmpty (TM2ComputableInPolyTime encodeNat encodeBool g) :=
  ⟨fun t => E t 1, col1_not_eventually_periodic,
    fun h => rule90_col1_polyTime.elim h.elim⟩

/-! ## 5. `dfa_polyTime` really is the general block: this morning's
`periodic_polyTime` factors through it.

This is here because the attack document recommends seeding `dfa_polyTime` before
either witness, and that recommendation is worth nothing unless the earlier
machine is genuinely an instance.  It is: the automaton carries
`(n mod p, 2^i mod p, min(n, M), min(2^i, M))` and nothing else, and the machine
disappears. -/

section Periodic

variable (p M : ℕ) [NeZero p] (f : ℕ → Bool)

/-- The automaton state after reading a prefix of value `v` and length `i`. -/
def pOf (v i : ℕ) : ZMod p × ZMod p × Fin (M + 1) × Fin (M + 1) :=
  ((v : ZMod p), ((2 ^ i : ℕ) : ZMod p), ⟨min v M, by omega⟩, ⟨min (2 ^ i) M, by omega⟩)

def pStep (s : ZMod p × ZMod p × Fin (M + 1) × Fin (M + 1)) (b : Bool) :
    ZMod p × ZMod p × Fin (M + 1) × Fin (M + 1) :=
  (s.1 + (b.toNat : ZMod p) * s.2.1, 2 * s.2.1,
    ⟨min (s.2.2.1.val + b.toNat * s.2.2.2.val) M, by omega⟩,
    ⟨min (2 * s.2.2.2.val) M, by omega⟩)

def pOut (s : ZMod p × ZMod p × Fin (M + 1) × Fin (M + 1)) : Bool :=
  if s.2.2.1.val < M then f s.2.2.1.val else f (M + s.1.val)

def target (n : ℕ) : Bool := if n < M then f n else f (M + n % p)

omit [NeZero p] in
theorem pStep_pOf (v i : ℕ) (b : Bool) :
    pStep p M (pOf p M v i) b = pOf p M (v + b.toNat * 2 ^ i) (i + 1) := by
  simp only [pStep, pOf, Prod.mk.injEq, Fin.mk.injEq, true_and]
  refine ⟨?_, ?_, ?_, ?_⟩
  · push_cast; ring
  · push_cast; ring
  · generalize 2 ^ i = t
    cases b <;> simp only [Bool.toNat_false, Bool.toNat_true, zero_mul, one_mul, add_zero] <;>
      omega
  · rw [pow_succ]
    generalize 2 ^ i = t
    omega

omit [NeZero p] in
theorem pOut_pOf (n j : ℕ) : pOut p M f (pOf p M n j) = target p M f n := by
  simp only [pOut, pOf, target, ZMod.val_natCast]
  by_cases h : n < M
  · simp [min_eq_left h.le, h]
  · have hm : min n M = M := min_eq_right (by omega)
    simp [hm, h]

omit [NeZero p] in
theorem pFold : ∀ (l : List Bool) (v i : ℕ),
    List.foldl (pStep p M) (pOf p M v i) l = pOf p M (v + 2 ^ i * val l) (i + l.length) := by
  intro l
  induction l with
  | nil => intro v i; simp [val]
  | cons b l ih =>
    intro v i
    rw [List.foldl_cons, pStep_pOf, ih]
    have e1 : v + b.toNat * 2 ^ i + 2 ^ (i + 1) * val l = v + 2 ^ i * val (b :: l) := by
      simp only [val, pow_succ]
      cases b <;> simp <;> ring
    have e2 : i + 1 + l.length = i + (b :: l).length := by
      rw [List.length_cons]; omega
    rw [e1, e2]

end Periodic

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
    have h2 : (n - N * p) % p = n % p := by
      conv_rhs => rw [show n = (n - N * p) + N * p by omega]
      rw [Nat.add_mul_mod_self_right]
    have h1 := Nat.div_add_mod (n - N * p) p
    have hn : n = (N * p + n % p) + p * ((n - N * p) / p) := by omega
    have hle : N ≤ N * p + n % p := by
      have := Nat.le_mul_of_pos_right N hp
      omega
    conv_rhs => rw [hn, mul_comm p, key _ _ hle]

/-- **This morning's theorem, re-proved as a corollary of `dfa_polyTime`.**  Same
statement, with `Rule30/Prize.lean`'s own `IsEventuallyPeriodic`; the 150-line
machine of `explorer/talus8_scratch_periodic.lean` is gone. -/
theorem periodic_polyTime (g : ℕ → Bool) (h : IsEventuallyPeriodic g) :
    Nonempty (TM2ComputableInPolyTime encodeNat encodeBool g) := by
  obtain ⟨p, hp, N, hN⟩ := h
  have : NeZero p := ⟨hp.ne'⟩
  refine dfa_polyTime (pOf p (N * p) 0 0) (pStep p (N * p)) (pOut p (N * p) g) g (fun n => ?_)
  rw [pFold, pOut_pOf, val_encodeNat]
  simpa using target_eq p N g hN n

/-- And so does P3's derivation: `P3Core` implies P1, from `dfa_polyTime` alone. -/
theorem P3Core_implies_P1 (h : IsEmpty (TM2ComputableInPolyTime encodeNat encodeBool centerColumn)) :
    ¬ IsEventuallyPeriodic centerColumn := fun hper =>
  (periodic_polyTime centerColumn hper).elim h.elim

#print axioms E_col1
#print axioms dfa_polyTime
#print axioms rule90_col1_polyTime
#print axioms litmus
#print axioms aperiodic_not_hard
#print axioms periodic_polyTime
#print axioms P3Core_implies_P1

/-! ## 5. The kernel runs the machine, rather than arguing about it.
`encodeNat 7 = [true,true,true]`, three digits, four steps, `7 = 2^3 - 1` so black;
`encodeNat 5 = [true,false,true]`, four steps, white; `encodeNat 0 = []`, one step,
white — and one step short of the answer on input 7 the machine has not halted. -/

abbrev M : FinTM2 := mach (false, true) dfaStep dfaOut

example : (flip bind M.step)^[4] (some (initList M (encodeNat 7))) =
    some (haltList M [true]) := rfl

example : (flip bind M.step)^[4] (some (initList M (encodeNat 5))) =
    some (haltList M [false]) := rfl

example : (flip bind M.step)^[1] (some (initList M (encodeNat 0))) =
    some (haltList M [false]) := rfl

example : (flip bind M.step)^[3] (some (initList M (encodeNat 7))) ≠
    some (haltList M [true]) := by
  intro h
  have := congrArg (fun c => c.map (fun c => c.l.isSome)) h
  exact absurd this (by decide)

end Talus9M
