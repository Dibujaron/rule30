import Rule30.Basic
import Rule30.Prize

/-!
**What this says.** A shifted reading of an eventually periodic sequence is itself eventually periodic.
**Why it is true.** The same period and starting point work: if `f(n+p) = f(n)` for `n ≥ N`, then `f(n+s+p) = f(n+s)` for the same `N`, since `n ≥ N` implies `n+s ≥ N`.
**Where the work is.** Unfolding the definition and arithmetic: no induction needed.
-/

theorem isEventuallyPeriodic_shift (f : ℕ → Bool) (s : ℕ)
    (h : IsEventuallyPeriodic f) :
    IsEventuallyPeriodic fun j => f (j + s) := by
  unfold IsEventuallyPeriodic at h ⊢
  obtain ⟨p, hp, N, hN⟩ := h
  exact ⟨p, hp, N, fun n hn => by
    have : n + s ≥ N := by omega
    simp only
    have eq := hN (n + s) this
    show f (n + p + s) = f (n + s)
    rw [show n + p + s = (n + s) + p by omega]
    exact eq⟩
