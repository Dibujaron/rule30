import Rule30.Basic
import Rule30.Proofs.CenterColumnNotEventuallyConstant

/-!
**What this says.** A periodic centre column cannot have a white run of length p.
**Why it is true.** Periodicity extends any run of p white cells, making all cells eventually white, contradicting that the center must be black infinitely often.
**Where the work is.** Strong induction showing all positions from t onward are white by repeated application of periodicity.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_white_run_le_period (p N : ℕ) (hp : 0 < p) (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t)
  (t : ℕ) (ht : N ≤ t) (hrun : ∀ s < p, centerColumn (t + s) = false) : False
```
-/

theorem centerColumn_white_run_le_period (p N : ℕ) (hp : 0 < p)
    (hc : ∀ t ≥ N, centerColumn (t + p) = centerColumn t)
    (t : ℕ) (ht : N ≤ t) (hrun : ∀ s < p, centerColumn (t + s) = false) :
    False := by
  -- All cells from t are white by periodicity
  have h : ∀ k, centerColumn (t + k) = false := fun k => by
    induction k using Nat.strong_induction_on with
    | _ k ih =>
      by_cases hk : k < p
      · exact hrun k hk
      · push Not at hk
        have : t + k = (t + (k - p)) + p := by omega
        rw [this, hc (t + (k - p)) (by omega)]
        exact ih (k - p) (by omega)
  -- Contradiction: center is black somewhere but eventually white
  have ⟨h_black, _⟩ := centerColumn_not_eventually_constant
  obtain ⟨m, hm, hbm⟩ := h_black t
  have : centerColumn m = false := by
    rw [show m = t + (m - t) from by omega]
    exact h (m - t)
  norm_num [this] at hbm
