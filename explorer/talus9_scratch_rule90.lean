/-
Talus, 2026-09-12.  The rule-90 witness, half one: the closed form.

Claim under test: column 1 of rule 90, grown from the same single black cell
rule 30 is grown from, is black at time `t` exactly when `t + 1` is a power of
two with exponent at least 1 -- i.e. at `t = 1, 3, 7, 15, 31, ...` and nowhere
else.  Rule 90 is taken from the board's own generic `ElementaryCA.step`, with
rule number 90, so nothing here re-defines an automaton.

ORIENTATION GUARD.  Rule 90 is `left XOR right` and is MIRROR-SYMMETRIC, so
the project's usual check -- "does the mirror rule pass too?" -- cannot catch a
left/right error here.  Section 0 instead has the kernel evaluate the picture
against the first seven rows printed by `explorer/talus9_rule90.mjs`, which is
an asymmetric fact about the *cone*, not about the rule.

Run with `lake env lean explorer/talus9_scratch_rule90.lean`.
-/
import Rule30.Prize
import Mathlib.Tactic

namespace Talus9

/-! ## 0. Rule 90, and the picture -/

/-- Rule 90, from the same generic `step` the board defines all 256 rules with. -/
def rule90 : Config → Config := ElementaryCA.step 90

/-- Rule 90 in closed form: the new cell is the XOR of its two neighbours.
The exact analogue of `rule30_eq`, and the same eight-case computation. -/
theorem rule90_eq (c : Config) (i : ℤ) : rule90 c i = xor (c (i - 1)) (c (i + 1)) := by
  show ElementaryCA.step 90 c i = _
  unfold ElementaryCA.step ElementaryCA.neighborhoodIndex
  cases c (i - 1) <;> cases c i <;> cases c (i + 1) <;> rfl

/-- The rule-90 picture grown from `initialConfig`, the single black cell at the
origin that all three prize questions are stated against. -/
def E (t : ℕ) : Config := rule90^[t] initialConfig

theorem E_zero (x : ℤ) : E 0 x = decide (x = 0) := rfl

theorem E_succ (t : ℕ) (x : ℤ) : E (t + 1) x = xor (E t (x - 1)) (E t (x + 1)) := by
  show rule90^[t + 1] initialConfig x = _
  rw [Function.iterate_succ_apply']
  exact rule90_eq _ _

/-- ORIENTATION GUARD: the kernel grows the picture and compares it, cell by cell,
with the seven rows `explorer/talus9_rule90.mjs` printed from an independent
engine.  Asymmetric in a way the rule itself is not. -/
example : (List.range 7).map (fun t => (List.range 13).map (fun x => E t ((x : ℤ) - 6))) =
    [[false, false, false, false, false, false, true,  false, false, false, false, false, false],
     [false, false, false, false, false, true,  false, true,  false, false, false, false, false],
     [false, false, false, false, true,  false, false, false, true,  false, false, false, false],
     [false, false, false, true,  false, true,  false, true,  false, true,  false, false, false],
     [false, false, true,  false, false, false, false, false, false, false, true,  false, false],
     [false, true,  false, true,  false, false, false, false, false, true,  false, true,  false],
     [true,  false, false, false, true,  false, false, false, true,  false, false, false, true]] := by
  decide

/-! ## 1. Three identities -/

theorem xor_middle (a b c : Bool) : xor (xor a b) (xor b c) = xor a c := by
  cases a <;> cases b <;> cases c <;> rfl

/-- Two steps of rule 90 are one step at stride two: the middle cell cancels. -/
theorem E_add_two (t : ℕ) (x : ℤ) : E (t + 2) x = xor (E t (x - 2)) (E t (x + 2)) := by
  have h : E (t + 1 + 1) x = xor (E (t + 1) (x - 1)) (E (t + 1) (x + 1)) := E_succ (t + 1) x
  rw [E_succ t (x - 1), E_succ t (x + 1)] at h
  have e1 : x - 1 - 1 = x - 2 := by ring
  have e2 : x - 1 + 1 = x := by ring
  have e3 : x + 1 - 1 = x := by ring
  have e4 : x + 1 + 1 = x + 2 := by ring
  rw [e1, e2, e3, e4, xor_middle] at h
  exact h

/-- Parity: a cell is white whenever its position and time have opposite parity.
Half the picture is empty, which is why column 1 is white at every even time. -/
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

/-- The scaling law: the picture at even times is the picture at half the time,
stretched by two.  This is rule 90's self-similarity, and it is the whole reason
column 1 has a closed form. -/
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

/-! ## 2. The centre column of rule 90: black once, then white for ever -/

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

/-! ## 3. Column 1 -/

/-- The recursion column 1 satisfies: at an odd time it repeats its own value at
half that time, except at `t = 1`, where the centre column's single black cell
turns it on. -/
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

/-- **The witness.**  Column 1 of rule 90, grown from a single black cell, is
black at time `t` exactly when `t + 1` is a power of two with exponent at least
one: at `t = 1, 3, 7, 15, 31, 63, ...` and nowhere else. -/
theorem E_col1 (t : ℕ) : E t 1 = true ↔ ∃ j, 1 ≤ j ∧ t + 1 = 2 ^ j := by
  induction t using Nat.strong_induction_on with
  | _ t ih =>
    rcases Nat.even_or_odd t with ⟨s, hs⟩ | ⟨s, hs⟩
    · -- even time: the cell is white, and `t + 1` is odd so it is no such power
      have ht : t = 2 * s := by omega
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
      · -- t = 1
        have : E 0 1 = false := by rw [E_zero]; simp
        rw [this]
        simp only [decide_true, Bool.xor_false, true_iff]
        exact ⟨1, by norm_num⟩
      · have hne : (decide (s = 0)) = false := by simp; omega
        rw [hne, Bool.false_xor, ih s (by omega)]
        constructor
        · rintro ⟨j, hj, hje⟩
          exact ⟨j + 1, by omega, by rw [pow_succ]; omega⟩
        · rintro ⟨j, hj, hje⟩
          -- `2 * s + 1 + 1 = 2 ^ j` with `s ≥ 1` forces `j ≥ 2`
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

/-! ## 4. It is not eventually periodic -/

-- `IsEventuallyPeriodic` below is `Rule30/Prize.lean`'s own, imported rather than
-- re-spelled, so the statement here is the statement there.

theorem col1_not_eventually_periodic : ¬ IsEventuallyPeriodic (fun t => E t 1) := by
  rintro ⟨p, hp, N, hN⟩
  -- pick a black time past `N` and past `p`
  obtain ⟨j, hj, hjN⟩ : ∃ j, 1 ≤ j ∧ N + p + 1 ≤ 2 ^ j := by
    refine ⟨N + p + 1, by omega, ?_⟩
    exact Nat.le_of_lt (Nat.lt_two_pow_self)
  set t := 2 ^ j - 1 with ht
  have hblack : E t 1 = true := (E_col1 t).2 ⟨j, hj, by
    have : 1 ≤ 2 ^ j := Nat.one_le_two_pow
    omega⟩
  have htN : t ≥ N := by omega
  have hnext : E (t + p) 1 = true := by
    have := hN t htN
    simpa [hblack] using this
  obtain ⟨i, hi, hie⟩ := (E_col1 (t + p)).1 hnext
  -- so `2 ^ i = 2 ^ j + p > 2 ^ j`, hence `i > j`, hence `p ≥ 2 ^ j > p`
  have h1 : (1 : ℕ) ≤ 2 ^ j := Nat.one_le_two_pow
  have he : 2 ^ i = 2 ^ j + p := by omega
  have hij : j < i := by
    by_contra hc
    have : 2 ^ i ≤ 2 ^ j := Nat.pow_le_pow_right (by norm_num) (by omega)
    omega
  have : 2 ^ j * 2 ≤ 2 ^ i := by
    calc 2 ^ j * 2 = 2 ^ (j + 1) := by rw [pow_succ]
    _ ≤ 2 ^ i := Nat.pow_le_pow_right (by norm_num) (by omega)
  omega

#print axioms E_col1
#print axioms col1_not_eventually_periodic

end Talus9
