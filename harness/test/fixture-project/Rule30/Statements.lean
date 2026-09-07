/-
# Fixture statements

The declarations the harness's toolchain-dependent tests lift, elaborate
against, and prove. Every theorem is `sorry`, as in the real statement
file, and for the same reason: this file states, a fixture proof proves,
and the verifier's `type_of%` check ties the two together.

Each declaration below is named by a test. Change one only together with
the test that names it.
-/
import Rule30.Basic

namespace Statements

/-- `seed_test.lifts_a_multi_line_declaration_test`: a declaration whose
type wraps onto a second line, so a one-line lift would truncate it. -/
theorem evolve_eq_false_of_outside_cone (t : ℕ) (i : ℤ) (h : (t : ℤ) < (i.natAbs : ℤ)) :
    evolve t i = false := by
  sorry

/-- `seed_test`'s route calibration: `f` is a PARAMETER, not `∀`-bound, so
`by decide` fails on it and `revert f; decide` closes it only with
`Rule30.FintypePi` imported. The text must stay byte-identical to the real
`Rule30/Statements.lean`'s, because the test pins it. -/
theorem bool_map_iterate_three (f : Bool → Bool) : f^[3] = f := by
  sorry

/-- `verify_test`: the statement its fixture proofs prove. -/
theorem harness_probe : True := by
  sorry

end Statements
