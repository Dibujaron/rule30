import Rule30.Basic
import Rule30.Proofs.ColumnAlternatingOfBlackRun
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal
theorem centerColumn_black_run_lt_start (a L : ℕ) (ha : 1 ≤ a)
    (h : ∀ s ≤ L, centerColumn (a + s) = true) : L < a := by

  by_contra hc
  have hc : a ≤ L := by omega
  have hcol : ∀ s ≤ L, column initialConfig 0 (a + s) = true := h
  have hedge := column_alternating_of_black_run initialConfig a L hcol a hc
  have hsec := column_alternating_of_black_run initialConfig a L hcol (a - 1) (by omega)
  rw [show column initialConfig (-(a : ℤ)) a = evolve a (-(a : ℤ)) from rfl,
    evolve_left_edge a] at hedge
  have h2 : evolve a (-((a - 1 : ℕ) : ℤ)) = true := by
    have hh := evolve_left_second_diagonal (a - 1)
    rwa [show a - 1 + 1 = a from by omega] at hh
  rw [show column initialConfig (-((a - 1 : ℕ) : ℤ)) a = evolve a (-((a - 1 : ℕ) : ℤ)) from rfl,
    h2] at hsec
  simp at hedge hsec
  omega
