import Rule30.Basic
import Rule30.Proofs.EvolveLeftFourthDiagonal

/-!
**What this says.** No strictly increasing ladder can meet the onset witness: any N where each diagonal either shows black or becomes white forces N k > k at every k ≥ 3.

**Why it is true.** A ladder with N k ≤ k forces N ℓ = ℓ for all ℓ ≤ k (since they're distinct naturals in strictly increasing order). But then the witness at k-1 becomes unsatisfiable: leftDiagonal k cannot both be false at k and true at k+1, contradicting the alternation in leftDiagonal 3.

**Where the work is.** Strong induction on k. Base case k = 3 uses leftDiagonal 3's parity structure (false at 3, true at 4) to contradict hwitness 2. Step case shows that assuming N k ≤ k forces N 3 = 3, contradicting the base case.
-/

theorem leftDiagonal_onset_le_not_of_black_ladder (N : ℕ → ℕ)
    (hmono : ∀ k, N k < N (k + 1))
    (hwitness : ∀ k, leftDiagonal (k + 1) (N (k + 1)) = true ∨
        ∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false)
    (k : ℕ) (hk : 3 ≤ k) : k < N k := by
  by_contra h
  push Not at h
  -- h : N k ≤ k
  -- Key insight: N 0, N 1, ..., N k are distinct naturals with N 0 < N 1 < ... < N k ≤ k
  -- So they must equal 0, 1, ..., k
  -- Collect all the constraints we need
  have all_ineqs : N 0 < N 1 ∧ N 1 < N 2 ∧ N 2 < N 3 ∧ N 3 < N 4 ∧ N k ≤ k ∧ 3 ≤ k := by
    exact ⟨hmono 0, hmono 1, hmono 2, hmono 3, h, hk⟩
  -- From these, omega can deduce N i = i for i ≤ 4
  have hN0 : N 0 = 0 := by omega
  have hN1 : N 1 = 1 := by omega
  have hN2 : N 2 = 2 := by omega
  have hN3 : N 3 = 3 := by omega
  -- Apply hwitness 2
  rcases hwitness 2 with h_black | h_white
  · -- First branch: leftDiagonal 3 (N 3) = true
    rw [hN3] at h_black
    -- leftDiagonal 3 3 = evolve (3 + 3) (-↑3) = evolve 6 (-3) = false (3 is odd)
    unfold leftDiagonal at h_black
    simp only [Nat.cast_ofNat] at h_black
    norm_num at h_black
    -- Now h_black should be false = true, which is a contradiction
    exact absurd h_black (by decide)
  · -- Second branch: ∀ j ≥ N 2 + 1, leftDiagonal 3 j = false
    rw [hN2] at h_white
    -- So ∀ j ≥ 3, leftDiagonal 3 j = false
    have h4 := h_white 4 (by omega)
    -- leftDiagonal 3 4 = evolve (4 + 3) (-↑4) = evolve 7 (-4) = true (4 is even)
    unfold leftDiagonal at h4
    simp only [Nat.cast_ofNat] at h4
    norm_num at h4
    -- Now h4 should be true = false, which is a contradiction
    exact absurd h4 (by decide)
