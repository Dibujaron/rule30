import Rule30.Basic

/-!
Meridian — rule 30 as a statement about maximal repeated blocks, in the kernel.

`rule30_run_boundary`: the new cell at `i` is black exactly when `i` is the left
end of a maximal black run, or an end of a maximal white run of length at least
two. Nothing but the run structure of the row is read.

`centerColumn_run_boundary`: the same identity at the origin, which says the
centre column is the indicator that the origin sits on a run boundary of the
previous row.
-/

theorem rule30_run_boundary (c : Config) (i : ℤ) :
    rule30 c i = true ↔
      (c i = true ∧ c (i - 1) = false) ∨
      (c i = false ∧ c (i - 1) = true ∧ c (i + 1) = false) ∨
      (c i = false ∧ c (i + 1) = true ∧ c (i - 1) = false) := by
  rw [rule30_eq]
  cases h1 : c (i - 1) <;> cases h2 : c i <;> cases h3 : c (i + 1) <;> simp

theorem centerColumn_run_boundary (t : Nat) :
    centerColumn (t + 1) = true ↔
      (evolve t 0 = true ∧ evolve t (-1) = false) ∨
      (evolve t 0 = false ∧ evolve t (-1) = true ∧ evolve t 1 = false) ∨
      (evolve t 0 = false ∧ evolve t 1 = true ∧ evolve t (-1) = false) := by
  have h := rule30_run_boundary (evolve t) 0
  simpa [centerColumn, evolve_succ] using h

#print axioms rule30_run_boundary
#print axioms centerColumn_run_boundary
