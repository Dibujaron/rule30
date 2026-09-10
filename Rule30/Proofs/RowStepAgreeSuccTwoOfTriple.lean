import Rule30.Basic
import Mathlib.Tactic

/-!
**What this says.** Read `x` and `y` as binary numbers agreeing on their low `n + 1`
bits. If `x` shows the pattern black, white, black at bits `n`, `n + 1`, `n + 2` and
`y` is white where `x` is black (bit `n + 1`), then one step of the row map agrees
two bits further out than the two numbers started.
**Why it is true.** A set control bit at `n` pins bit `n + 1` of both rows regardless
of what differs there already, and pins bit `n + 2` too once the pattern black-white
is known at `n`, `n + 1` — this is the same bit-by-bit unfolding `rowStep_agree_succ_two_iff`
uses, specialised to a triple where the needed OR is forced true on both sides.
**Where the work is.** Isolating bit `n + 2` as a Boolean expression in `x`'s own bits
alone (not `y`'s) and reducing it with `hy` in place of a hypothesis about `y`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowStep_agree_succ_two_of_triple (n x y : ℕ) (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1))
  (hb : x.testBit n = true) (hw : x.testBit (n + 1) = false) (hy : y.testBit (n + 1) = true)
  (hr : x.testBit (n + 2) = true) : rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3)
```
-/

private theorem testBit_rowStep (r i : ℕ) :
    (rowStep r).testBit i
      = xor (decide (2 ≤ i) && r.testBit (i - 2))
          ((decide (1 ≤ i) && r.testBit (i - 1)) || r.testBit i) := by
  have h4 : 4 * r = 2 ^ 2 * r := by norm_num
  have h2 : 2 * r = 2 ^ 1 * r := by norm_num
  unfold rowStep
  rw [h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
    Nat.testBit_two_pow_mul]

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

theorem rowStep_agree_succ_two_of_triple (n x y : ℕ)
    (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1))
    (hb : x.testBit n = true)
    (hw : x.testBit (n + 1) = false)
    (hy : y.testBit (n + 1) = true)
    (hr : x.testBit (n + 2) = true) :
    rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3) := by
  have hlow := (mod_two_pow_eq_iff x y (n + 1)).1 h
  have hlow1 := (mod_two_pow_eq_iff (rowStep x) (rowStep y) (n + 1)).1
    (by rw [rowStep_mod_two_pow x (n + 1), h, ← rowStep_mod_two_pow y (n + 1)])
  rw [mod_two_pow_eq_iff]
  intro i hi
  by_cases hi' : i < n + 1
  · exact hlow1 i hi'
  · have hyn : y.testBit n = true := by rw [← hlow n (by omega)]; exact hb
    have hcase : i = n + 1 ∨ i = n + 2 := by omega
    rcases hcase with rfl | rfl
    · rw [testBit_rowStep, testBit_rowStep, show n + 1 - 1 = n by omega,
        hlow (n + 1 - 2) (by omega), hb, hyn, hw, hy]
      simp
    · rw [testBit_rowStep, testBit_rowStep, show n + 2 - 1 = n + 1 by omega,
        show n + 2 - 2 = n by omega, hb, hyn, hw, hy, hr]
      simp
