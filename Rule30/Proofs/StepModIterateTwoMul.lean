import Rule30.Basic
import Rule30.Proofs.StepTwoMul

/-!
**What this says.** Doubling a row and then running rule 30's row map t times, truncated to n+1 bits, gives the same answer as running the map t times on the un-doubled row truncated to n bits, then doubling.
**Why it is true.** `step_two_mul` already says one step commutes with doubling one bit wider; doing the same swap inside each of the t steps of the iteration keeps it true the whole way down.
**Where the work is.** Lining up one step of the iteration (`Function.iterate_succ_apply`, both sides) with `step_two_mul` and the mod-doubling identity, then handing the induction hypothesis the resulting half-width state.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.stepMod_iterate_two_mul (n t s : ℕ) :
  (fun r => (4 * r ^^^ (2 * r ||| r)) % 2 ^ (n + 1))^[t] (2 * s) =
    2 * (fun r => (4 * r ^^^ (2 * r ||| r)) % 2 ^ n)^[t] s
```
-/

theorem stepMod_iterate_two_mul (n t s : ℕ) :
    (fun r => ((4 * r) ^^^ ((2 * r) ||| r)) % 2 ^ (n + 1))^[t] (2 * s)
      = 2 * (fun r => ((4 * r) ^^^ ((2 * r) ||| r)) % 2 ^ n)^[t] s := by
  induction t generalizing s with
  | zero => simp
  | succ k ih =>
      have hstep : ((4 * (2 * s)) ^^^ ((2 * (2 * s)) ||| (2 * s))) % 2 ^ (n + 1)
          = 2 * (((4 * s) ^^^ ((2 * s) ||| s)) % 2 ^ n) := by
        rw [step_two_mul, pow_succ, mul_comm (2 ^ n) 2, Nat.mul_mod_mul_left]
      rw [Function.iterate_succ_apply, Function.iterate_succ_apply]
      simp only [hstep]
      exact ih _
