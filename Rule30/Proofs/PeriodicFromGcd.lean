import Rule30.Basic
import Rule30.Proofs.PeriodicFromMul

/-!
**What this says.** A sequence periodic with period `p` from time `N`, and
also periodic with period `q` from the same time, is periodic with period
`gcd p q` from that same time.

**Why it is true.** This is the Euclidean algorithm read as a fact about
repetition: if `p ≤ q` are both periods, so is `q - p` (walk forward by `p`
once from a point already `q - p` steps in, then use that `f(n+q) = f(n)`).
Iterating that subtraction step is exactly how `gcd` is computed.

**Where the work is.** Turning "`q - p` is a period when `p ≤ q`" into
"`q % p` is a period", by subtracting off the multiple `(q / p) * p` of `p`
(itself a period, by `periodicFrom_mul`) instead of a single copy; after that
the recursion follows `Nat.gcd_rec` on the nose.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.periodicFrom_gcd (f : ℕ → Bool) (p q N : ℕ) (hpN : PeriodicFrom f p N) (hqN : PeriodicFrom f q N) :
  PeriodicFrom f (p.gcd q) N
```
-/

private theorem periodicFrom_sub_of_le (f : ℕ → Bool) (p q N : ℕ)
    (hp : PeriodicFrom f p N) (hq : PeriodicFrom f q N) (hle : p ≤ q) :
    PeriodicFrom f (q - p) N := by
  intro n hn
  have hn' : n + (q - p) ≥ N := by omega
  have step := hp (n + (q - p)) hn'
  have heq : n + (q - p) + p = n + q := by omega
  rw [heq] at step
  exact step.symm.trans (hq n hn)

private theorem periodicFrom_gcd_aux (f : ℕ → Bool) (N : ℕ) :
    ∀ p q : ℕ, PeriodicFrom f p N → PeriodicFrom f q N → PeriodicFrom f (Nat.gcd p q) N := by
  intro p
  induction p using Nat.strong_induction_on with
  | _ p ih =>
    intro q hpN hqN
    rcases Nat.eq_zero_or_pos p with hp0 | hp0
    · subst hp0
      simpa [Nat.gcd_zero_left] using hqN
    · rw [Nat.gcd_rec]
      have hmul : PeriodicFrom f (q / p * p) N := periodicFrom_mul f p N hpN (q / p)
      have hle : q / p * p ≤ q := Nat.div_mul_le_self q p
      have hsub := periodicFrom_sub_of_le f (q / p * p) q N hmul hqN hle
      have hdm : p * (q / p) + q % p = q := Nat.div_add_mod q p
      have heq : q - q / p * p = q % p := by
        rw [Nat.mul_comm (q / p) p]
        omega
      rw [heq] at hsub
      exact ih (q % p) (Nat.mod_lt q hp0) p hsub hpN

theorem periodicFrom_gcd (f : ℕ → Bool) (p q N : ℕ)
    (hpN : PeriodicFrom f p N) (hqN : PeriodicFrom f q N) :
    PeriodicFrom f (Nat.gcd p q) N :=
  periodicFrom_gcd_aux f N p q hpN hqN
