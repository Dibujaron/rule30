import Rule30.Basic
import Rule30.Proofs.Rule30NeOfLeftNe
import Mathlib.Tactic.Ring

/-!
**What this says.** Running rule 30 for `t` steps is left-permutive with radius `t`: flip the cell `t` places to the left of `i` while holding every cell from `i - t + 1` to `i + t` fixed, and the cell at `i` after `t` steps flips too.
**Why it is true.** One step is left-permutive (`rule30_ne_of_left_ne`); after `s` steps the flipped position has walked one cell to the right and the surviving agreement window has shrunk by one cell on each side, so after `t` steps the flip has walked all the way to `i` itself.
**Where the work is.** Carrying that shrinking-window invariant through the induction on `s`, and aligning the cast of `s + 1` against the invariant's own `s` at each step with `push_cast`/`ring`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.evolveFrom_leftPermutive (t : ℕ) : LeftPermutive (fun c => evolveFrom c t) t
```
-/

theorem evolveFrom_leftPermutive (t : ℕ) :
    LeftPermutive (fun c => evolveFrom c t) t := by
  intro c d i hagree hdiff
  have key : ∀ s : ℕ, s ≤ t →
      (∀ j : ℤ, i - t + s < j → j ≤ i + t - s → rule30^[s] c j = rule30^[s] d j) ∧
      rule30^[s] c (i - t + s) ≠ rule30^[s] d (i - t + s) := by
    intro s
    induction s with
    | zero =>
      intro _
      simpa [Function.iterate_zero_apply] using ⟨hagree, hdiff⟩
    | succ n ih =>
      intro hs
      obtain ⟨hag, hdf⟩ := ih (by omega)
      refine ⟨?_, ?_⟩
      · intro j hj1 hj2
        rw [Function.iterate_succ_apply', Function.iterate_succ_apply', rule30_eq, rule30_eq]
        have e1 : rule30^[n] c (j - 1) = rule30^[n] d (j - 1) := hag (j - 1) (by omega) (by omega)
        have e2 : rule30^[n] c j = rule30^[n] d j := hag j (by omega) (by omega)
        have e3 : rule30^[n] c (j + 1) = rule30^[n] d (j + 1) := hag (j + 1) (by omega) (by omega)
        rw [e1, e2, e3]
      · rw [show i - (t : ℤ) + ((n + 1 : ℕ) : ℤ) = i - (t : ℤ) + (n : ℤ) + 1 from by push_cast; ring]
        rw [Function.iterate_succ_apply', Function.iterate_succ_apply']
        have hc0 : rule30^[n] c (i - (t : ℤ) + (n : ℤ) + 1) = rule30^[n] d (i - (t : ℤ) + (n : ℤ) + 1) :=
          hag (i - (t : ℤ) + (n : ℤ) + 1) (by omega) (by omega)
        have hr0 : rule30^[n] c (i - (t : ℤ) + (n : ℤ) + 1 + 1) = rule30^[n] d (i - (t : ℤ) + (n : ℤ) + 1 + 1) :=
          hag (i - (t : ℤ) + (n : ℤ) + 1 + 1) (by omega) (by omega)
        have hl0 : rule30^[n] c (i - (t : ℤ) + (n : ℤ) + 1 - 1) ≠ rule30^[n] d (i - (t : ℤ) + (n : ℤ) + 1 - 1) := by
          rw [show i - (t : ℤ) + (n : ℤ) + 1 - 1 = i - (t : ℤ) + (n : ℤ) from by ring]
          exact hdf
        exact rule30_ne_of_left_ne (rule30^[n] c) (rule30^[n] d) (i - (t : ℤ) + (n : ℤ) + 1) hl0 hc0 hr0
  obtain ⟨_, hdiff_t⟩ := key t (le_refl t)
  show rule30^[t] c i ≠ rule30^[t] d i
  rw [show i - (t : ℤ) + (t : ℤ) = i from by ring] at hdiff_t
  exact hdiff_t
