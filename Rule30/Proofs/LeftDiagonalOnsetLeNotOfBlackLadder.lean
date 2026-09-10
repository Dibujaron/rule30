import Rule30.Basic
import Rule30.Proofs.EvolveLeftFourthDiagonal

/-!
**What this says.** No strictly increasing onset sequence meeting the black-or-white witness ever gets `N k ≤ k` for `k ≥ 3`.

**Why it is true.** Strict growth alone forces `N j ≥ j`; combined with `N k ≤ k` it pins `N j = j` for every `j ≤ k`, in particular `N 2 = 2` and `N 3 = 3`. The witness at index 2 then needs diagonal 3 black at 3 or white from 3 on, but diagonal 3 alternates (`evolve_left_fourth_diagonal`): white at 3, black at 4, so both fail.

**Where the work is.** Getting `N 2 = 2` and `N 3 = 3` for an arbitrary `k ≥ 3`, not just `k = 3`: only consecutive `hmono` steps are given, so it takes a downward induction from the pinned `N k = k`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_onset_le_not_of_black_ladder (N : ℕ → ℕ) (hmono : ∀ (k : ℕ), N k < N (k + 1))
  (hwitness : ∀ (k : ℕ), leftDiagonal (k + 1) (N (k + 1)) = true ∨ ∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false)
  (k : ℕ) (hk : 3 ≤ k) : k < N k
```
-/

theorem leftDiagonal_onset_le_not_of_black_ladder (N : ℕ → ℕ)
    (hmono : ∀ k, N k < N (k + 1))
    (hwitness : ∀ k, leftDiagonal (k + 1) (N (k + 1)) = true ∨
        ∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false)
    (k : ℕ) (hk : 3 ≤ k) : k < N k := by
  by_contra h
  have h' : N k ≤ k := by omega
  have hNge : ∀ j, j ≤ N j := by
    intro j
    induction j with
    | zero => exact Nat.zero_le _
    | succ n ih => have := hmono n; omega
  have hNkeq : N k = k := le_antisymm h' (hNge k)
  have key : ∀ d, d ≤ k → N (k - d) = k - d := by
    intro d
    induction d with
    | zero => intro _; simpa using hNkeq
    | succ d ih =>
      intro hd
      have ihd := ih (by omega)
      have e : k - (d + 1) + 1 = k - d := by omega
      have hlt : N (k - (d + 1)) < N (k - d) := by
        calc N (k - (d + 1)) < N (k - (d + 1) + 1) := hmono _
          _ = N (k - d) := by rw [e]
      have hge := hNge (k - (d + 1))
      omega
  have hN2 : N 2 = 2 := by
    have h2 := key (k - 2) (by omega)
    have e : k - (k - 2) = 2 := by omega
    rwa [e] at h2
  have hN3 : N 3 = 3 := by
    have h3 := key (k - 3) (by omega)
    have e : k - (k - 3) = 3 := by omega
    rwa [e] at h3
  have hval3 : leftDiagonal 3 3 = false := by
    show evolve (3 + 3) (-(3 : ℤ)) = false
    simpa using evolve_left_fourth_diagonal 3
  have hval4 : leftDiagonal 3 4 = true := by
    show evolve (4 + 3) (-(4 : ℤ)) = true
    simpa using evolve_left_fourth_diagonal 4
  rcases hwitness 2 with hblack | hwhite
  · have hblack3 : leftDiagonal 3 (N 3) = true := hblack
    rw [hN3] at hblack3
    rw [hval3] at hblack3
    exact Bool.noConfusion hblack3
  · have hwhite' : ∀ j ≥ N 2 + 1, leftDiagonal 3 j = false := hwhite
    have h4 := hwhite' 4 (by rw [hN2]; omega)
    rw [hval4] at h4
    exact Bool.noConfusion h4
