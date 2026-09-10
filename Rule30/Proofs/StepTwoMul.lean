import Rule30.Basic
import Mathlib.Tactic.Ring

/-!
**What this says.** Rule 30's row map commutes with doubling: the step function applied to 2s equals 2 times the step function applied to s, for all natural numbers.
**Why it is true.** Doubling a row is a bit shift by one position, and the step function distributes over bit shifts via the XOR and OR operations.
**Where the work is.** The bit-shift distribution lemmas for XOR and OR; the rest is arithmetic.

**Checked type** (refreshed by the captain during the 2026-09-09 `stepMod` retrofit,
which changed this statement; the signature below is what `#check` printed against
`Rule30.Statements` after the retrofit built clean, not a harness verification run):
```lean
Statements.step_two_mul (s : ℕ) : rowStep (2 * s) = 2 * rowStep s
```
-/

theorem step_two_mul (s : ℕ) :
    rowStep (2 * s) = 2 * rowStep s := by
  unfold rowStep
  have h : ∀ x : ℕ, 2 * x = x <<< 1 := fun x => by omega
  have eq : ∀ x : ℕ, 4 * x = x <<< 2 := fun x => by omega
  simp only [eq, h, Nat.shiftLeft_or_distrib, Nat.shiftLeft_xor_distrib, ← Nat.shiftLeft_add]
