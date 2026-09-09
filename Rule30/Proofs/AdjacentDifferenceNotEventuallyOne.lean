import Rule30.Basic
import Rule30.Proofs.NotIsEventuallyPeriodicAdjacent

/-!
**What this says.** No two neighbouring columns of the picture can disagree at every row from some point on.
**Why it is true.** Once a run turns up a row where column i is white, both columns are forced constant forever after, which makes them eventually periodic and contradicts the served fact that adjacent columns can't both be that.
**Where the work is.** Finding that forcing: a white cell in column i and a black one it forces in column i+1 propagate to every later row, by induction on how far forward you look.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.adjacent_difference_not_eventually_one (i : ℤ) : ¬∃ N, ∀ t ≥ N, evolve t i ≠ evolve t (i + 1)
```
-/

theorem adjacent_difference_not_eventually_one (i : ℤ) :
    ¬ ∃ N, ∀ t ≥ N, evolve t i ≠ evolve t (i + 1) := by
  rintro ⟨N, h⟩
  have step : ∀ t : ℕ, evolve (t + 1) (i + 1)
      = xor (evolve t i) (evolve t (i + 1) || evolve t (i + 2)) := by
    intro t
    have hr := rule30_eq (evolve t) (i + 1)
    rw [show i + 1 - 1 = i from by ring, show i + 1 + 1 = i + 2 from by ring] at hr
    rw [evolve_succ]
    exact hr
  have absorb : ∀ t, N ≤ t → evolve t i = false →
      ∀ s, evolve (t + s) i = false ∧ evolve (t + s) (i + 1) = true := by
    intro t htN ht s
    induction s with
    | zero =>
        refine ⟨ht, ?_⟩
        have hne := h t htN
        cases hb : evolve t (i + 1)
        · rw [ht, hb] at hne; exact absurd rfl hne
        · rfl
    | succ n ih =>
        obtain ⟨h0, h1⟩ := ih
        have hb1 : evolve (t + n + 1) (i + 1) = true := by
          rw [step, h0, h1]; simp
        have hne := h (t + n + 1) (by omega)
        refine ⟨?_, by rw [show t + (n + 1) = t + n + 1 from by omega]; exact hb1⟩
        rw [show t + (n + 1) = t + n + 1 from by omega]
        cases ha : evolve (t + n + 1) i
        · rfl
        · rw [ha, hb1] at hne; exact absurd rfl hne
  apply not_isEventuallyPeriodic_adjacent i
  by_cases hcase : ∃ t, N ≤ t ∧ evolve t i = false
  · obtain ⟨t, htN, ht⟩ := hcase
    have hA : ∀ n, t ≤ n → evolve n i = false := by
      intro n hn
      have := (absorb t htN ht (n - t)).1
      rwa [show t + (n - t) = n from by omega] at this
    have hB : ∀ n, t ≤ n → evolve n (i + 1) = true := by
      intro n hn
      have := (absorb t htN ht (n - t)).2
      rwa [show t + (n - t) = n from by omega] at this
    exact ⟨⟨1, one_pos, t, fun n hn => by
             show evolve (n + 1) i = evolve n i
             rw [hA (n + 1) (by omega), hA n hn]⟩,
           ⟨1, one_pos, t, fun n hn => by
             show evolve (n + 1) (i + 1) = evolve n (i + 1)
             rw [hB (n + 1) (by omega), hB n hn]⟩⟩
  · push Not at hcase
    have hA : ∀ n, N ≤ n → evolve n i = true := by
      intro n hn
      cases hv : evolve n i
      · exact absurd hv (hcase n hn)
      · rfl
    have hB : ∀ n, N ≤ n → evolve n (i + 1) = false := by
      intro n hn
      have hne := h n hn
      cases hv : evolve n (i + 1)
      · rfl
      · rw [hA n hn, hv] at hne; exact absurd rfl hne
    exact ⟨⟨1, one_pos, N, fun n hn => by
             show evolve (n + 1) i = evolve n i
             rw [hA (n + 1) (by omega), hA n hn]⟩,
           ⟨1, one_pos, N, fun n hn => by
             show evolve (n + 1) (i + 1) = evolve n (i + 1)
             rw [hB (n + 1) (by omega), hB n hn]⟩⟩
