import Rule30.Basic
import Rule30.Proofs.BoolDrivenPeriodicFromOfReturn

/-!
**What this says.** When a driver's high bit resets the state, the state inherits the driver's period.
**Why it is true.** At the reset point, the state becomes a deterministic function of the drivers, forgetting its own history; one period later the deterministic result repeats.
**Where the work is.** Showing that `b j = true` forces `x (j+1+p) = x (j+1)` via three recurrence unfoldings and the drivers' periodicity.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.bool_driven_periodicFrom_of_reset (a b x : ℕ → Bool) (p N j : ℕ)
  (hrec : ∀ (i : ℕ), x (i + 1) = (a i ^^ (b i || x i))) (ha : PeriodicFrom a p N) (hb : PeriodicFrom b p N)
  (hNj : N ≤ j) (hbj : b j = true) : PeriodicFrom x p (j + 1)
```
-/

theorem bool_driven_periodicFrom_of_reset (a b x : ℕ → Bool) (p N j : ℕ)
    (hrec : ∀ i, x (i + 1) = xor (a i) (b i || x i))
    (ha : PeriodicFrom a p N) (hb : PeriodicFrom b p N) (hNj : N ≤ j)
    (hbj : b j = true) :
    PeriodicFrom x p (j + 1) := by
  have eq : x (j + 1 + p) = x (j + 1) := by
    have h1 : x (j + 1) = xor (a j) true := by rw [hrec j, hbj]; simp
    have h2 : x (j + 1 + p) = xor (a (j + p)) true := by
      have key : j + 1 + p = (j + p) + 1 := by omega
      rw [key, hrec (j + p)]
      have bj_eq : b (j + p) = true := by rw [hb j (by omega), hbj]
      rw [bj_eq]
      simp
    rw [h1, h2]
    congr 1
    exact ha j (by omega)
  exact bool_driven_periodicFrom_of_return a b x p N (j + 1) hrec ha hb (by omega) eq
