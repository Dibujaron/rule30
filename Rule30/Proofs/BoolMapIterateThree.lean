import Rule30.Basic

/-!
**What this says.** Any function from Bool to Bool composed with itself three times is the same as applying it once: f^[3] = f.
**Why it is true.** Bool has only four endomaps — identity, negation, and the two constants — and each is unchanged after three iterations.
**Where the work is.** Nowhere; a function out of Bool is pinned down by its two output values, so splitting on those (and on the input) leaves four fully concrete cases for `simp` to check.
-/

theorem bool_map_iterate_three (f : Bool → Bool) : f^[3] = f := by
  funext x
  simp only [Function.iterate_succ_apply', Function.iterate_zero_apply]
  rcases hft : f true with _ | _ <;> rcases hff : f false with _ | _ <;>
    cases x <;> simp_all
