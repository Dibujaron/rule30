import Rule30.Basic
import Mathlib.Tactic

/-!
**What this says.** A machine with finitely many states, driven by a
schedule of update rules that eventually repeats, settles into a repeating
orbit.
**Why it is true.** Sample the state once per schedule-period: with only
finitely many states two samples must agree, and equal states replaying the
same schedule stay equal forever.
**Where the work is.** Upgrading "the schedule repeats after `p`" to "after
any multiple of `p`", which is what lets the two agreeing samples be
compared step for step across the gap between them.
-/

theorem isEventuallyPeriodic_of_periodic_step {S : Type} [Fintype S]
    (step : ℕ → S → S) (s : ℕ → S) (p N : ℕ) (hp : 0 < p)
    (hstep : ∀ t ≥ N, step (t + p) = step t)
    (hs : ∀ t, s (t + 1) = step t (s t)) :
    ∃ q > 0, ∃ M, ∀ t ≥ M, s (t + q) = s t := by
  have hstep_mul : ∀ m : ℕ, ∀ t ≥ N, step (t + m * p) = step t := by
    intro m
    induction m with
    | zero => intro t _; simp
    | succ m ih =>
      intro t ht
      have h1 : step (t + p + m * p) = step (t + p) := ih (t + p) (by omega)
      have h2 : step (t + p) = step t := hstep t ht
      have heq : t + (m + 1) * p = t + p + m * p := by ring
      rw [heq, h1, h2]
  have core : ∀ a b : ℕ, a < b → s (N + a * p) = s (N + b * p) →
      ∃ q > 0, ∃ M, ∀ t ≥ M, s (t + q) = s t := by
    intro a b hab heq
    have hmul : a * p + (b - a) * p = b * p := by
      rw [← Nat.add_mul]; congr 1; omega
    have hprop : ∀ n, s (N + a * p + n) = s (N + b * p + n) := by
      intro n
      induction n with
      | zero => simpa using heq
      | succ n ih =>
        have hstepeq : step (N + a * p + n) = step (N + b * p + n) := by
          have heqidx : N + b * p + n = N + a * p + n + (b - a) * p := by omega
          rw [heqidx]
          exact (hstep_mul (b - a) (N + a * p + n) (by omega)).symm
        have e1 : s (N + a * p + n + 1) = step (N + a * p + n) (s (N + a * p + n)) := hs _
        have e2 : s (N + b * p + n + 1) = step (N + b * p + n) (s (N + b * p + n)) := hs _
        rw [show N + a * p + (n + 1) = N + a * p + n + 1 from by omega, e1,
            show N + b * p + (n + 1) = N + b * p + n + 1 from by omega, e2,
            hstepeq, ih]
    refine ⟨(b - a) * p, Nat.mul_pos (by omega) hp, N + a * p, ?_⟩
    intro t ht
    obtain ⟨n, hn⟩ : ∃ n, t = N + a * p + n := ⟨t - (N + a * p), by omega⟩
    have heqfin : N + a * p + n + (b - a) * p = N + b * p + n := by omega
    rw [hn, heqfin]
    exact (hprop n).symm
  obtain ⟨x, y, hxy, hfxy⟩ := Fintype.exists_ne_map_eq_of_card_lt
      (fun k : Fin (Fintype.card S + 1) => s (N + (k : ℕ) * p)) (by simp)
  rcases lt_or_gt_of_ne (Fin.val_injective.ne hxy) with hlt | hlt
  · exact core (x : ℕ) (y : ℕ) hlt hfxy
  · exact core (y : ℕ) (x : ℕ) hlt hfxy.symm
