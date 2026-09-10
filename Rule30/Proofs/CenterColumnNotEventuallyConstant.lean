import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs.NotIsEventuallyPeriodicAdjacent

/-!
**What this says.** The centre column of rule 30 is black infinitely often and
white infinitely often, so it never settles down to a single colour.
**Why it is true.** A centre column stuck on one colour freezes the column
beside it too — stuck on white, the cell to the right can only ever turn black
and stay black; stuck on black, the cell to the left is forced white — and no
two neighbouring columns can both repeat (`not_isEventuallyPeriodic_adjacent`).
**Where the work is.** Finding two separate freezing arguments: the white case
needs the once-black-always-black induction on column 1, the black case reads
the rule at the origin backwards to pin column -1.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_not_eventually_constant :
  (∀ (N : ℕ), ∃ t ≥ N, centerColumn t = true) ∧ ∀ (N : ℕ), ∃ t ≥ N, centerColumn t = false
```
-/

/-- A sequence that is constant from `N` on repeats with period 1 from `N` on. -/
private theorem const_periodic (f : ℕ → Bool) (b : Bool) (N : ℕ)
    (h : ∀ t, N ≤ t → f t = b) : IsEventuallyPeriodic f :=
  ⟨1, by omega, N, fun n hn => by rw [h (n + 1) (by omega), h n hn]⟩

/-- One step of the rule at an arbitrary position, in `evolve` vocabulary. -/
private theorem step_at (t : ℕ) (i : ℤ) :
    evolve (t + 1) i = xor (evolve t (i - 1)) (evolve t i || evolve t (i + 1)) := by
  rw [evolve_succ, rule30_eq]

theorem centerColumn_not_eventually_constant :
    (∀ N : ℕ, ∃ t ≥ N, centerColumn t = true) ∧
      (∀ N : ℕ, ∃ t ≥ N, centerColumn t = false) := by
  constructor
  · -- Black infinitely often.
    intro N
    by_contra hcon
    have hN : ∀ t, N ≤ t → evolve t (0 : ℤ) = false := by
      intro t ht
      cases hct : evolve t (0 : ℤ) with
      | false => rfl
      | true => exact (hcon ⟨t, ht, hct⟩).elim
    have hs : ∀ t : ℕ,
        evolve (t + 1) (1 : ℤ) = xor (evolve t 0) (evolve t 1 || evolve t 2) := by
      intro t
      have h := step_at t 1
      rw [show (1 : ℤ) - 1 = 0 from by omega, show (1 : ℤ) + 1 = 2 from by omega] at h
      exact h
    have hp0 : IsEventuallyPeriodic (fun t => evolve t (0 : ℤ)) :=
      const_periodic _ false N hN
    by_cases hex : ∃ M, N ≤ M ∧ evolve M (1 : ℤ) = true
    · obtain ⟨M, hM, hMt⟩ := hex
      have hforever : ∀ s, M ≤ s → evolve s (1 : ℤ) = true := by
        intro s hs'
        induction s, hs' using Nat.le_induction with
        | base => exact hMt
        | succ n hn ih =>
            have h1 := hs n
            rw [hN n (by omega), ih] at h1
            revert h1
            generalize evolve (n + 1) (1 : ℤ) = A
            generalize evolve n (2 : ℤ) = B
            cases A <;> cases B <;> decide
      have hp1 : IsEventuallyPeriodic (fun t => evolve t ((0 : ℤ) + 1)) := by
        rw [show (0 : ℤ) + 1 = 1 from by omega]
        exact const_periodic _ true M hforever
      exact not_isEventuallyPeriodic_adjacent 0
        ⟨const_periodic _ false M (fun t ht => hN t (by omega)), hp1⟩
    · have h1 : ∀ t, N ≤ t → evolve t (1 : ℤ) = false := by
        intro t ht
        cases hct : evolve t (1 : ℤ) with
        | false => rfl
        | true => exact (hex ⟨t, ht, hct⟩).elim
      have hp1 : IsEventuallyPeriodic (fun t => evolve t ((0 : ℤ) + 1)) := by
        rw [show (0 : ℤ) + 1 = 1 from by omega]
        exact const_periodic _ false N h1
      exact not_isEventuallyPeriodic_adjacent 0 ⟨hp0, hp1⟩
  · -- White infinitely often.
    intro N
    by_contra hcon
    have hN : ∀ t, N ≤ t → evolve t (0 : ℤ) = true := by
      intro t ht
      cases hct : evolve t (0 : ℤ) with
      | true => rfl
      | false => exact (hcon ⟨t, ht, hct⟩).elim
    have hs : ∀ t : ℕ,
        evolve (t + 1) (0 : ℤ) = xor (evolve t (-1)) (evolve t 0 || evolve t 1) := by
      intro t
      have h := step_at t 0
      rw [show (0 : ℤ) - 1 = -1 from by omega, show (0 : ℤ) + 1 = 1 from by omega] at h
      exact h
    have hm1 : ∀ t, N ≤ t → evolve t (-1 : ℤ) = false := by
      intro t ht
      have h1 := hs t
      rw [hN t ht, hN (t + 1) (by omega)] at h1
      revert h1
      generalize evolve t (-1 : ℤ) = A
      generalize evolve t (1 : ℤ) = B
      cases A <;> cases B <;> decide
    have hp0 : IsEventuallyPeriodic (fun t => evolve t ((-1 : ℤ) + 1)) := by
      rw [show (-1 : ℤ) + 1 = 0 from by omega]
      exact const_periodic _ true N hN
    exact not_isEventuallyPeriodic_adjacent (-1)
      ⟨const_periodic _ false N hm1, hp0⟩
