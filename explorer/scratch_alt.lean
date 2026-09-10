import Rule30.Basic
import Rule30.Prize
import Rule30.Proofs

namespace ScratchAlt

private theorem alt_succ (j : ℕ) :
    (decide ((j + 1) % 2 = 0)) = !(decide (j % 2 = 0)) := by
  rcases Nat.mod_two_eq_zero_or_one j with h | h <;> simp [Nat.add_mod, h]

theorem rule30_alternating_step (X : Config) (L : ℕ)
    (h : ∀ j < L + 2, X (-(j : ℤ)) = decide (j % 2 = 0)) :
    ∀ j < L + 1, rule30 X (-(j : ℤ)) = decide (j % 2 = 0) := by
  intro j hj
  rw [rule30_eq]
  have hj0 : X (-(j : ℤ)) = decide (j % 2 = 0) := h j (by omega)
  have hjm : X (-(j : ℤ) - 1) = !(decide (j % 2 = 0)) := by
    have hx := h (j + 1) (by omega)
    rw [alt_succ] at hx
    rw [← hx]
    congr 1
    push_cast
    ring
  have hor : (X (-(j : ℤ)) || X (-(j : ℤ) + 1)) = true := by
    cases j with
    | zero => rw [hj0]; simp
    | succ n =>
        have hx := h n (by omega)
        have he : X (-((n : ℕ) + 1 : ℤ) + 1) = decide (n % 2 = 0) := by
          rw [← hx]; congr 1; push_cast; ring
        push_cast at hj0 he ⊢
        rw [hj0, he, alt_succ]
        cases (decide (n % 2 = 0)) <;> simp
  rw [hjm, hor]
  cases (decide (j % 2 = 0)) <;> simp

theorem column_black_run_of_alternating (X : Config) (t L : ℕ)
    (h : ∀ j < L + 1, column X (-(j : ℤ)) t = decide (j % 2 = 0))
    (s : ℕ) (hs : s ≤ L) : column X 0 (t + s) = true := by
  induction s generalizing t L with
  | zero =>
      have := h 0 (by omega)
      simpa using this
  | succ n ih =>
      cases L with
      | zero => omega
      | succ M =>
          have hstep : ∀ j < M + 1, column X (-(j : ℤ)) (t + 1) = decide (j % 2 = 0) := by
            have hs2 := rule30_alternating_step (evolveFrom X t) M (by
              intro j hjj
              have := h j (by omega)
              simpa [column] using this)
            intro j hjj
            have hx := hs2 j hjj
            simpa [column, evolveFrom_succ] using hx
          have := ih (t := t + 1) (L := M) hstep (by omega)
          simpa [Nat.add_assoc, Nat.add_comm, Nat.add_left_comm] using this

private theorem aux : ∀ j : ℕ, ∀ (X : Config) (t L : ℕ),
    (∀ s ≤ L, column X 0 (t + s) = true) → j ≤ L →
    column X (-(j : ℤ)) t = decide (j % 2 = 0) := by
  intro j
  induction j using Nat.strong_induction_on with
  | _ j ih =>
    match j, ih with
    | 0, _ => intro X t L h _; simpa using h 0 (by omega)
    | (n + 1), ih =>
      intro X t L h hj
      have hn : column X (-(n : ℤ)) t = decide (n % 2 = 0) :=
        ih n (by omega) X t L h (by omega)
      have hor : (column X (-(n : ℤ)) t || column X (-(n : ℤ) + 1) t) = true := by
        cases n with
        | zero => rw [hn]; simp
        | succ m =>
            have hm : column X (-(m : ℤ)) t = decide (m % 2 = 0) :=
              ih m (by omega) X t L h (by omega)
            have he : column X (-((m : ℕ) + 1 : ℤ) + 1) t = decide (m % 2 = 0) := by
              rw [← hm]; congr 1; push_cast; ring
            push_cast at hn he ⊢
            rw [hn, he, alt_succ]
            cases (decide (m % 2 = 0)) <;> simp
      have hnext : column X (-(n : ℤ)) (t + 1) = decide (n % 2 = 0) := by
        cases L with
        | zero => omega
        | succ M =>
            refine ih n (by omega) X (t + 1) M ?_ (by omega)
            intro s hs
            have := h (s + 1) (by omega)
            simpa [Nat.add_assoc, Nat.add_comm, Nat.add_left_comm] using this
      have hstep : column X (-(n : ℤ)) (t + 1)
          = xor (column X (-(n : ℤ) - 1) t)
              (column X (-(n : ℤ)) t || column X (-(n : ℤ) + 1) t) := by
        simp [column, evolveFrom_succ, rule30_eq]
      rw [hnext, hor] at hstep
      have hval : column X (-(n : ℤ) - 1) t = !(decide (n % 2 = 0)) := by
        cases hb : column X (-(n : ℤ) - 1) t <;> rw [hb] at hstep <;>
          simp at hstep <;> simp [hstep]
      have hfin : column X (-((n : ℕ) + 1 : ℤ)) t = !(decide (n % 2 = 0)) := by
        rw [← hval]; congr 1; push_cast; ring
      push_cast
      rw [hfin, alt_succ]

theorem column_alternating_of_black_run (X : Config) (t L : ℕ)
    (h : ∀ s ≤ L, column X 0 (t + s) = true)
    (j : ℕ) (hj : j ≤ L) : column X (-(j : ℤ)) t = decide (j % 2 = 0) :=
  aux j X t L h hj

theorem centerColumn_not_isEventuallyPeriodic_of_long_black_runs
    (h : ∀ k N : ℕ, ∃ t, N ≤ t ∧ ∀ s < k, centerColumn (t + s) = true) :
    ¬ IsEventuallyPeriodic centerColumn := by
  rintro ⟨p, hp, N, hper⟩
  obtain ⟨t, htN, hblack⟩ := h (p + 1) N
  have hall : ∀ s : ℕ, centerColumn (t + s) = true := by
    intro s
    induction s using Nat.strong_induction_on with
    | _ s ih =>
        by_cases hsp : s < p + 1
        · exact hblack s hsp
        · have key : centerColumn (t + (s - p) + p) = centerColumn (t + (s - p)) :=
            hper (t + (s - p)) (by omega)
          have hrw : t + (s - p) + p = t + s := by omega
          rw [hrw] at key
          rw [key]
          exact ih (s - p) (by omega)
  obtain ⟨u, huN, hu⟩ := centerColumn_not_eventually_constant.2 t
  have hcon := hall (u - t)
  rw [show t + (u - t) = u by omega] at hcon
  rw [hu] at hcon
  exact Bool.noConfusion hcon

theorem centerColumn_not_isEventuallyPeriodic_of_deep_alternating
    (h : ∀ k N : ℕ, ∃ t, N ≤ t ∧ ∀ j < k, evolve t (-(j : ℤ)) = decide (j % 2 = 0)) :
    ¬ IsEventuallyPeriodic centerColumn := by
  refine centerColumn_not_isEventuallyPeriodic_of_long_black_runs ?_
  intro k N
  obtain ⟨t, htN, halt⟩ := h (k + 1) N
  refine ⟨t, htN, ?_⟩
  intro s hs
  exact column_black_run_of_alternating initialConfig t k
    (fun j hj => halt j hj) s (by omega)

end ScratchAlt

#print axioms ScratchAlt.rule30_alternating_step
#print axioms ScratchAlt.column_black_run_of_alternating
#print axioms ScratchAlt.column_alternating_of_black_run
#print axioms ScratchAlt.centerColumn_not_isEventuallyPeriodic_of_long_black_runs
#print axioms ScratchAlt.centerColumn_not_isEventuallyPeriodic_of_deep_alternating
