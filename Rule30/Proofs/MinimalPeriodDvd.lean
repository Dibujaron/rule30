import Rule30.Basic
import Rule30.Proofs.PeriodicFromMul

/-!
**What this says.** The least positive period of a sequence divides every one of its periods.
**Why it is true.** Periods are closed under the division algorithm: if `p = qm + r` with `m`
the least period, `m`-periodicity lets you strip off the `qm` part of `p`, so `r` is itself a
period, and `r < m` forces `r = 0` by minimality.
**Where the work is.** Showing the remainder `r = p % m` is a period at all: `periodicFrom_mul`
gives that `q * m` is a period, and one calc chain trades `p` for `r + q * m` and back.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.minimalPeriod_dvd (f : ℕ → Bool) (p : ℕ) (hp : 0 < p) (h : PeriodicFrom f p 0) : minimalPeriod f ∣ p
```
-/

theorem minimalPeriod_dvd (f : Nat → Bool) (p : Nat) (hp : 0 < p)
    (h : PeriodicFrom f p 0) : minimalPeriod f ∣ p := by
  have hne : {p | 0 < p ∧ PeriodicFrom f p 0}.Nonempty := ⟨p, hp, h⟩
  obtain ⟨hm0, hmP⟩ := Nat.sInf_mem hne
  by_contra hndvd
  have hr_pos : 0 < p % minimalPeriod f := by
    rcases Nat.eq_zero_or_pos (p % minimalPeriod f) with h0 | h0
    · exact absurd (Nat.dvd_of_mod_eq_zero h0) hndvd
    · exact h0
  have hmul : PeriodicFrom f (p / minimalPeriod f * minimalPeriod f) 0 :=
    periodicFrom_mul f (minimalPeriod f) 0 hmP (p / minimalPeriod f)
  have hrP : PeriodicFrom f (p % minimalPeriod f) 0 := by
    intro n _
    have e1 : n + p % minimalPeriod f + p / minimalPeriod f * minimalPeriod f = n + p := by
      have hdm := Nat.div_add_mod p (minimalPeriod f)
      rw [Nat.mul_comm (p / minimalPeriod f) (minimalPeriod f)]
      omega
    calc f (n + p % minimalPeriod f)
        = f (n + p % minimalPeriod f + p / minimalPeriod f * minimalPeriod f) :=
          (hmul (n + p % minimalPeriod f) (by omega)).symm
      _ = f (n + p) := by rw [e1]
      _ = f n := h n (by omega)
  have hle : minimalPeriod f ≤ p % minimalPeriod f :=
    Nat.sInf_le ⟨hr_pos, hrP⟩
  have hlt : p % minimalPeriod f < minimalPeriod f := Nat.mod_lt p hm0
  omega
