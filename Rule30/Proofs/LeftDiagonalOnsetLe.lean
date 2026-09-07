import Rule30.Basic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.LeftDiagonalRecurrence
import Rule30.Proofs.LeftDiagonalPeriodicFromStepOfBlack
import Rule30.Proofs.BoolXorDrivenPeriodicFrom

/-!
**What this says.** Going one diagonal further in from the left edge, the point where
the pattern starts repeating moves by exactly one cell — unless the diagonal in
between is black somewhere, in which case it moves to that black cell instead.
**Why it is true.** A black cell in the middle diagonal wipes out the new diagonal's
memory of its own past; where the middle diagonal stays white forever, the new one is
just a running total of the diagonal two further out, and a running total of something
that repeats repeats too, from the very same place.
**Where the work is.** The white case. The known step lemma pays a whole period of
delay there; this pays one cell, which is the difference between the growth being
exponential and being linear.
-/

private theorem leftDiagonal_zero_true (j : ℕ) : leftDiagonal 0 j = true := by
  show evolve (j + 0) (-(j : ℤ)) = true
  rw [show j + 0 = j from by omega]
  exact evolve_left_edge j

private theorem leftDiagonal_one_true (j : ℕ) : leftDiagonal 1 j = true :=
  evolve_left_second_diagonal j

/-- The base of the induction the dichotomy below is meant to drive: the two outermost
left diagonals are black everywhere, so they share a period from index `0`. -/
private theorem base_pair :
    PeriodicFrom (leftDiagonal 0) 1 0 ∧ PeriodicFrom (leftDiagonal 1) 1 0 := by
  constructor
  · intro n _
    rw [leftDiagonal_zero_true, leftDiagonal_zero_true]
  · intro n _
    rw [leftDiagonal_one_true, leftDiagonal_one_true]

theorem leftDiagonal_step_onset_dichotomy (m q N : ℕ)
    (h0 : PeriodicFrom (leftDiagonal m) q N)
    (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
    PeriodicFrom (leftDiagonal (m + 2)) (2 * q) (N + 1) ∨
      ∃ j, N ≤ j ∧ leftDiagonal (m + 1) (j + 1) = true ∧
        PeriodicFrom (leftDiagonal (m + 2)) q (j + 1) := by
  by_cases hb : ∃ j, N ≤ j ∧ leftDiagonal (m + 1) (j + 1) = true
  · obtain ⟨j, hj, hbj⟩ := hb
    exact Or.inr ⟨j, hj, hbj,
      leftDiagonal_periodicFrom_step_of_black m q N j hj h0 h1 hbj⟩
  · push_neg at hb
    have hw : ∀ j, N + 1 ≤ j → leftDiagonal (m + 1) j = false := by
      intro j hj
      obtain ⟨i, rfl⟩ : ∃ i, j = i + 1 := ⟨j - 1, by omega⟩
      simpa using hb i (by omega)
    refine Or.inl ?_
    have hrec : ∀ i : ℕ, leftDiagonal (m + 2) (N + 1 + i + 1)
        = xor (leftDiagonal (m + 2) (N + 1 + i)) (leftDiagonal m (N + 1 + i + 2)) := by
      intro i
      have R := leftDiagonal_recurrence m (N + 1 + i)
      rw [hw (N + 1 + i + 1) (by omega), Bool.false_or, Bool.xor_comm] at R
      exact R
    have hc : PeriodicFrom (fun i => leftDiagonal m (N + 1 + i + 2)) q 0 := by
      intro i _
      have hi := h0 (N + 1 + i + 2) (by omega)
      show leftDiagonal m (N + 1 + (i + q) + 2) = leftDiagonal m (N + 1 + i + 2)
      rw [show N + 1 + (i + q) + 2 = N + 1 + i + 2 + q from by omega]
      exact hi
    have hx := bool_xor_driven_periodicFrom (fun i => leftDiagonal m (N + 1 + i + 2))
        (fun i => leftDiagonal (m + 2) (N + 1 + i)) q 0 (fun i => hrec i) hc
    intro n hn
    obtain ⟨i, rfl⟩ : ∃ i, n = N + 1 + i := ⟨n - (N + 1), by omega⟩
    have h2 := hx i (Nat.zero_le _)
    rw [show N + 1 + i + 2 * q = N + 1 + (i + 2 * q) from by omega]
    exact h2
