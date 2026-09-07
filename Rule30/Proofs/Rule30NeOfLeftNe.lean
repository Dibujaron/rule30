import Rule30.Basic

/-!
**What this says.** Changing only the left neighbour while keeping the centre and right fixed changes the output of one rule 30 step.
**Why it is true.** The rule depends on all three inputs: xor-ing two of them is a function of all three, so fixing two and changing the third changes the output.
**Where the work is.** Unfolding rule 30's definition on both rows and case-splitting on three Bool values.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rule30_ne_of_left_ne (c d : Config) (i : ℤ) (hl : c (i - 1) ≠ d (i - 1)) (hc : c i = d i)
  (hr : c (i + 1) = d (i + 1)) : rule30 c i ≠ rule30 d i
```
-/

theorem rule30_ne_of_left_ne (c d : Config) (i : ℤ)
    (hl : c (i - 1) ≠ d (i - 1)) (hc : c i = d i) (hr : c (i + 1) = d (i + 1)) :
    rule30 c i ≠ rule30 d i := by
  rw [rule30_eq, rule30_eq]
  simp only [hc, hr]
  intro h
  cases hcl : c (i - 1)
  · cases hdl : d (i - 1)
    · exact hl (by rw [hcl, hdl])
    · cases hdi : d i <;> cases hdi1 : d (i + 1) <;> simp [hcl, hdl, hdi, hdi1] at h
  · cases hdl : d (i - 1)
    · cases hdi : d i <;> cases hdi1 : d (i + 1) <;> simp [hcl, hdl, hdi, hdi1] at h
    · exact hl (by rw [hcl, hdl])
