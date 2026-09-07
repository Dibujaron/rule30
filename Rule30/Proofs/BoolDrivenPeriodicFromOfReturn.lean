import Rule30.Basic

/-!
**What this says.** A one-bit machine driven by periodic inputs that has returned to its starting state will repeat with the driver's period from that point.

**Why it is true.** If the driven bit equals itself after one driver period, then rewriting through the recurrence with periodic drivers collapses x(n+p) to x(n) at every step.

**Where the work is.** Straightforward induction on n, using the recurrence equation and the periodicity of a and b.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.bool_driven_periodicFrom_of_return (a b x : ℕ → Bool) (p N M : ℕ)
  (hrec : ∀ (i : ℕ), x (i + 1) = (a i ^^ (b i || x i))) (ha : PeriodicFrom a p N) (hb : PeriodicFrom b p N)
  (hNM : N ≤ M) (hret : x (M + p) = x M) : PeriodicFrom x p M
```
-/

theorem bool_driven_periodicFrom_of_return (a b x : ℕ → Bool) (p N M : ℕ)
    (hrec : ∀ i, x (i + 1) = xor (a i) (b i || x i))
    (ha : PeriodicFrom a p N) (hb : PeriodicFrom b p N) (hNM : N ≤ M)
    (hret : x (M + p) = x M) :
    PeriodicFrom x p M := by
  intro n hn
  obtain ⟨k, hk⟩ := Nat.exists_eq_add_of_le hn
  subst hk
  clear hn
  induction k with
  | zero => exact hret
  | succ k ih =>
    rw [show (M + (k + 1)) + p = ((M + k) + p) + 1 from by omega]
    rw [hrec]
    have ha_prev : a ((M + k) + p) = a (M + k) := ha (M + k) (by omega)
    have hb_prev : b ((M + k) + p) = b (M + k) := hb (M + k) (by omega)
    rw [ha_prev, hb_prev, ih]
    rw [← hrec]
    simp only [Nat.add_assoc]
