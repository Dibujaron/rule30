import Rule30.Basic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Mathlib.Tactic

theorem rowNat_testBit_zero (t : ℕ) : (rowNat t).testBit 0 = true := by
  have h : leftDiagonal 0 t = true := evolve_left_edge t
  rw [leftDiagonal_eq_rowNat_testBit] at h
  simpa using h
