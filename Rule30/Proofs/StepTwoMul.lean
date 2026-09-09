import Rule30.Basic
import Mathlib.Tactic.Ring

/-!
**What this says.** Rule 30's row map commutes with doubling: the step function applied to 2s equals 2 times the step function applied to s, for all natural numbers.
**Why it is true.** Doubling a row is a bit shift by one position, and the step function distributes over bit shifts via the XOR and OR operations.
**Where the work is.** The bit-shift distribution lemmas for XOR and OR; the rest is arithmetic.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.step_two_mul (s : ℕ) : 4 * (2 * s) ^^^ (2 * (2 * s) ||| 2 * s) = 2 * (4 * s ^^^ (2 * s ||| s))
```
-/

theorem step_two_mul (s : ℕ) :
    ((4 * (2 * s)) ^^^ ((2 * (2 * s)) ||| (2 * s))) = 2 * ((4 * s) ^^^ ((2 * s) ||| s)) := by
  have h : ∀ x : ℕ, 2 * x = x <<< 1 := fun x => by omega
  have eq : ∀ x : ℕ, 4 * x = x <<< 2 := fun x => by omega
  simp only [eq, h, Nat.shiftLeft_or_distrib, Nat.shiftLeft_xor_distrib, ← Nat.shiftLeft_add]
