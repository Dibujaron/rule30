import Rule30.Basic
import Mathlib.Tactic

/-!
**What this says.** A machine with only finitely many states, driven by an
update rule that itself eventually repeats, ends up repeating too.
**Why it is true.** Sample the state once per repeat of the rule; with only
finitely many states, two of those samples must coincide, and from a pair of
equal samples onward both the rule and the state trace the same steps again.
**Where the work is.** Turning "two coincidences of the rule" into one usable
fact costs an explicit lemma, since the arithmetic tactic cannot relate three
separate multiplications on its own without being handed the identity linking
them.
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
      have h1 : t + (m + 1) * p = (t + m * p) + p := by ring
      rw [h1, hstep (t + m * p) (by omega)]
      exact ih t ht
  have core : ∀ a b : ℕ, a < b → s (N + a * p) = s (N + b * p) →
      ∃ q > 0, ∃ M, ∀ t ≥ M, s (t + q) = s t := by
    intro a b hab hfab
    have hmul : a * p + (b - a) * p = b * p := by
      rw [← Nat.add_mul]; congr 1; omega
    have hq : 0 < (b - a) * p := Nat.mul_pos (by omega) hp
    refine ⟨(b - a) * p, hq, N + a * p, ?_⟩
    have hprop : ∀ n, s (N + a * p + n) = s (N + b * p + n) := by
      intro n
      induction n with
      | zero => simpa using hfab
      | succ n ih =>
        have hstepeq : step (N + a * p + n) = step (N + b * p + n) := by
          have hshift : N + b * p + n = (N + a * p + n) + (b - a) * p := by omega
          rw [hshift]
          exact (hstep_mul (b - a) (N + a * p + n) (by omega)).symm
        have e1 := hs (N + a * p + n)
        have e2 := hs (N + b * p + n)
        rw [show N + a * p + n + 1 = N + a * p + (n + 1) from by omega] at e1
        rw [show N + b * p + n + 1 = N + b * p + (n + 1) from by omega] at e2
        rw [e1, e2, hstepeq, ih]
    intro t ht
    obtain ⟨n, hn⟩ : ∃ n, t = N + a * p + n := ⟨t - (N + a * p), by omega⟩
    have heq : t + (b - a) * p = N + b * p + n := by
      rw [hn]; omega
    rw [heq, hn]
    exact (hprop n).symm
  obtain ⟨x, y, hxy, hfxy⟩ := Fintype.exists_ne_map_eq_of_card_lt
    (fun k : Fin (Fintype.card S + 1) => s (N + (k : ℕ) * p)) (by simp)
  rcases lt_or_gt_of_ne (Fin.val_injective.ne hxy) with hlt | hlt
  · exact core (x : ℕ) (y : ℕ) hlt hfxy
  · exact core (y : ℕ) (x : ℕ) hlt hfxy.symm
