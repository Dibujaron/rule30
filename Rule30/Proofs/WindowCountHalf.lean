import Rule30.Basic
import Rule30.Proofs.EvolveFromLeftPermutive
import Mathlib.Data.Fintype.BigOperators
import Mathlib.Tactic

/-!
**What this says.** Of all the ways to colour a row of `2t + 1` cells, exactly half grow a black
cell at the centre after `t` steps, and half grow a white one.
**Why it is true.** Flipping only the leftmost cell of the window always flips the centre cell
`t` steps later (`evolveFrom_leftPermutive`), so that flip pairs off the black-growing windows
with the white-growing ones.
**Where the work is.** Nothing deep: the flip is its own inverse, so it is a bijection, and the
rest is counting. The fiddly part is the index arithmetic that says the flipped position is the
one place inside the window where the two rows disagree.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.window_count_half (t : ℕ) : blackWindowCount t = 2 ^ (2 * t)
```
-/

/-- Flip the leftmost cell of a window, leaving every other cell alone. -/
private def flipFirst {t : ℕ} (w : Fin (2 * t + 1) → Bool) : Fin (2 * t + 1) → Bool :=
  fun k => if (k : ℕ) = 0 then !(w k) else w k

private theorem flipFirst_involutive {t : ℕ} (w : Fin (2 * t + 1) → Bool) :
    flipFirst (flipFirst w) = w := by
  funext k
  by_cases h : (k : ℕ) = 0 <;> simp [flipFirst, h]

private theorem flipFirst_injective {t : ℕ} :
    Function.Injective (flipFirst (t := t)) := by
  intro a b h
  have h2 := congrArg flipFirst h
  rwa [flipFirst_involutive, flipFirst_involutive] at h2

/-- Away from the leftmost position the flipped window reads exactly like the original. -/
private theorem ofWindow_flipFirst_eq {t : ℕ} (w : Fin (2 * t + 1) → Bool) (j : ℤ)
    (h : 0 < j + (t : ℤ)) : ofWindow (flipFirst w) j = ofWindow w j := by
  unfold ofWindow flipFirst
  split_ifs with h1 h2
  · exfalso
    have h3 : (j + (t : ℤ)).toNat = 0 := h2
    omega
  · rfl
  · rfl

/-- At the leftmost position the flipped window differs from the original. -/
private theorem ofWindow_flipFirst_ne {t : ℕ} (w : Fin (2 * t + 1) → Bool) (i : ℤ)
    (h : i + (t : ℤ) = 0) : ofWindow (flipFirst w) i ≠ ofWindow w i := by
  unfold ofWindow flipFirst
  split_ifs with h1 h2
  · simp
  · exfalso
    have h3 : ¬ ((i + (t : ℤ)).toNat = 0) := h2
    omega
  · exfalso; omega

/-- The centre cell after `t` steps flips when the leftmost cell of the window flips. -/
private theorem evolveFrom_flipFirst_ne {t : ℕ} (w : Fin (2 * t + 1) → Bool) :
    evolveFrom (ofWindow (flipFirst w)) t 0 ≠ evolveFrom (ofWindow w) t 0 :=
  evolveFrom_leftPermutive t (ofWindow (flipFirst w)) (ofWindow w) 0
    (fun j hj1 _ => ofWindow_flipFirst_eq w j (by omega))
    (ofWindow_flipFirst_ne w (0 - (t : ℤ)) (by ring))

private theorem flipFirst_black_iff {t : ℕ} (w : Fin (2 * t + 1) → Bool) :
    (evolveFrom (ofWindow (flipFirst w)) t 0 = true)
      ↔ ¬ (evolveFrom (ofWindow w) t 0 = true) := by
  have h := evolveFrom_flipFirst_ne w
  revert h
  generalize evolveFrom (ofWindow (flipFirst w)) t 0 = a
  generalize evolveFrom (ofWindow w) t 0 = b
  cases a <;> cases b <;> simp

theorem window_count_half (t : ℕ) : blackWindowCount t = 2 ^ (2 * t) := by
  have himg : (Finset.univ.filter fun w : Fin (2 * t + 1) → Bool =>
        ¬ (evolveFrom (ofWindow w) t 0 = true))
      = (Finset.univ.filter fun w : Fin (2 * t + 1) → Bool =>
        evolveFrom (ofWindow w) t 0 = true).image flipFirst := by
    ext v
    simp only [Finset.mem_filter, Finset.mem_univ, true_and, Finset.mem_image]
    constructor
    · intro hv
      exact ⟨flipFirst v, (flipFirst_black_iff v).mpr hv, flipFirst_involutive v⟩
    · rintro ⟨u, hu, rfl⟩
      exact fun hc => (flipFirst_black_iff u).mp hc hu
  have hsum := Finset.card_filter_add_card_filter_not
    (s := (Finset.univ : Finset (Fin (2 * t + 1) → Bool)))
    (fun w => evolveFrom (ofWindow w) t 0 = true)
  rw [himg, Finset.card_image_of_injective _ flipFirst_injective, Finset.card_univ,
    Fintype.card_pi_const, Fintype.card_bool] at hsum
  have hpow : (2 : ℕ) ^ (2 * t + 1) = 2 ^ (2 * t) * 2 := pow_succ 2 (2 * t)
  unfold blackWindowCount
  omega
