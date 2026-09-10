import Rule30.Basic
import Mathlib.Tactic

/-!
**What this says.** The rows of the picture, kept to their lowest `n` bits, are exactly
the sequence you get by repeatedly applying one fixed bit-twiddle to the number 1.
**Why it is true.** Row `t+1` is a fixed function of row `t`, and that function commutes
with truncating to `n` bits, so truncated rows are the orbit of `1` under the truncated
function.
**Where the work is.** Showing truncation commutes with the twiddle: read off bit `i` of
the output in terms of bits `i`, `i-1`, `i-2` of the input, then check both sides of the
commuting equation read the same bits when `i < n`.

**Checked type** (refreshed by the captain during the 2026-09-09 `stepMod` retrofit,
which changed this statement; the signature below is what `#check` printed against
`Rule30.Statements` after the retrofit built clean, not a harness verification run):
```lean
Statements.rowNat_mod_eq_iterate (n t : ℕ) : rowNat t % 2 ^ n = (stepMod n)^[t] (1 % 2 ^ n)
```
-/

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

theorem rowNat_mod_eq_iterate (n t : ℕ) :
    rowNat t % 2 ^ n = (stepMod n)^[t] (1 % 2 ^ n) := by
  induction t with
  | zero => rfl
  | succ t ih =>
    rw [Function.iterate_succ_apply', ← ih, rowNat_succ_eq, rowStep_mod_two_pow]
    rfl
