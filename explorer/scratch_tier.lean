import Rule30.Basic
import Rule30.Proofs.EvolveLeftDiagonalRecurrence

theorem leftDiagonal_recurrence (m i : ℕ) :
    leftDiagonal (m + 2) (i + 1)
      = xor (leftDiagonal m (i + 2))
          (leftDiagonal (m + 1) (i + 1) || leftDiagonal (m + 2) i) := by
  unfold leftDiagonal
  rw [show i + 1 + (m + 2) = i + m + 3 by omega,
      show i + 2 + m = i + m + 2 by omega,
      show i + 1 + (m + 1) = i + m + 2 by omega,
      show i + (m + 2) = i + m + 2 by omega]
  push_cast
  exact evolve_left_diagonal_recurrence m i

theorem bool_driven_periodicFrom_of_return (a b x : ℕ → Bool) (p N M : ℕ)
    (hrec : ∀ i, x (i + 1) = xor (a i) (b i || x i))
    (ha : PeriodicFrom a p N) (hb : PeriodicFrom b p N) (hNM : N ≤ M)
    (hret : x (M + p) = x M) :
    PeriodicFrom x p M := by
  intro n hn
  induction n, hn using Nat.le_induction with
  | base => exact hret
  | succ n hn ih =>
    have hnN : n ≥ N := le_trans hNM hn
    rw [show n + 1 + p = n + p + 1 by omega, hrec (n + p), hrec n, ih,
        ha n hnN, hb n hnN]

theorem bool_driven_periodicFrom_of_reset (a b x : ℕ → Bool) (p N j : ℕ)
    (hrec : ∀ i, x (i + 1) = xor (a i) (b i || x i))
    (ha : PeriodicFrom a p N) (hb : PeriodicFrom b p N) (hNj : N ≤ j)
    (hbj : b j = true) :
    PeriodicFrom x p (j + 1) := by
  have hret : x (j + 1 + p) = x (j + 1) := by
    rw [show j + 1 + p = j + p + 1 by omega, hrec (j + p), hrec j,
        ha j hNj, hb j hNj, hbj]
    simp
  exact bool_driven_periodicFrom_of_return a b x p N (j + 1) hrec ha hb (by omega) hret

theorem leftDiagonal_periodicFrom_step_of_black (m q N j : ℕ) (hNj : N ≤ j)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N)
    (hblack : leftDiagonal (m + 1) (j + 1) = true) :
    PeriodicFrom (leftDiagonal (m + 2)) q (j + 1) := by
  refine bool_driven_periodicFrom_of_reset
    (fun i => leftDiagonal m (i + 2)) (fun i => leftDiagonal (m + 1) (i + 1))
    (leftDiagonal (m + 2)) q N j (fun i => leftDiagonal_recurrence m i) ?_ ?_ hNj hblack
  · intro n hn
    simpa [show n + q + 2 = n + 2 + q by omega] using h0 (n + 2) (by omega)
  · intro n hn
    simpa [show n + q + 1 = n + 1 + q by omega] using h1 (n + 1) (by omega)

theorem leftDiagonal_step_period_dichotomy (m q N : ℕ)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
    (∃ M, PeriodicFrom (leftDiagonal (m + 2)) q M) ∨
      ∀ j ≥ N + 1, leftDiagonal (m + 1) j = false := by
  by_cases h : ∃ j ≥ N, leftDiagonal (m + 1) (j + 1) = true
  · obtain ⟨j, hj, hb⟩ := h
    exact Or.inl ⟨j + 1, leftDiagonal_periodicFrom_step_of_black m q N j hj h0 h1 hb⟩
  · refine Or.inr ?_
    intro j hj
    by_contra hc
    exact h ⟨j - 1, by omega, by rw [show j - 1 + 1 = j by omega]; simpa using hc⟩

#eval ((List.range 5).all fun m => (List.range 5).all fun i =>
  leftDiagonal (m + 2) (i + 1) ==
    xor (leftDiagonal m (i + 2)) (leftDiagonal (m + 1) (i + 1) || leftDiagonal (m + 2) i))
