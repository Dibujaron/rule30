import Rule30.Basic
import Rule30.Proofs.Rule30NeOfLeftNe

/-!
**What this says.** If two rows agree everywhere right of position `i` and
differ at `i`, then after `t` steps they differ at `i + t` and agree
everywhere right of `i + t`: the point of disagreement moves right at
exactly speed 1.
**Why it is true.** Induction on `t`. The new disagreement at `i + t + 1` is
`rule30_ne_of_left_ne` fed by the old disagreement at `i + t` as its left
neighbour; the centre and right neighbour of that call, and every cell
right of `i + t + 1`, land right of `i + t`, where the induction hypothesis
already gives agreement.
**Where the work is.** Bookkeeping the shift `i + t + 1` against `i + t`
across a `Nat`-to-`ℤ` cast at each step; the automaton content is one call
to the served lemma.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightmost_difference_moves_right (c d : Config) (i : ℤ) (t : ℕ) (hagree : ∀ (j : ℤ), i < j → c j = d j)
  (hdiff : c i ≠ d i) :
  evolveFrom c t (i + ↑t) ≠ evolveFrom d t (i + ↑t) ∧ ∀ (j : ℤ), i + ↑t < j → evolveFrom c t j = evolveFrom d t j
```
-/

theorem rightmost_difference_moves_right (c d : Config) (i : ℤ) (t : ℕ)
    (hagree : ∀ j : ℤ, i < j → c j = d j) (hdiff : c i ≠ d i) :
    evolveFrom c t (i + t) ≠ evolveFrom d t (i + t) ∧
      ∀ j : ℤ, i + t < j → evolveFrom c t j = evolveFrom d t j := by
  induction t with
  | zero =>
    refine ⟨?_, fun j hj => hagree j (by simpa using hj)⟩
    show c (i + ((0 : ℕ) : ℤ)) ≠ d (i + ((0 : ℕ) : ℤ))
    simpa using hdiff
  | succ n ih =>
    obtain ⟨ihd, iha⟩ := ih
    have hstep : ∀ e : Config, evolveFrom e (n + 1) = rule30 (evolveFrom e n) := by
      intro e
      show rule30^[n + 1] e = rule30 (rule30^[n] e)
      rw [Function.iterate_succ_apply']
    refine ⟨?_, ?_⟩
    · rw [hstep, hstep]
      have hl : evolveFrom c n (i + ((n : ℤ) + 1) - 1) ≠ evolveFrom d n (i + ((n : ℤ) + 1) - 1) := by
        have e : i + ((n : ℤ) + 1) - 1 = i + (n : ℤ) := by omega
        rw [e]; exact ihd
      have hc' : evolveFrom c n (i + ((n : ℤ) + 1)) = evolveFrom d n (i + ((n : ℤ) + 1)) :=
        iha (i + ((n : ℤ) + 1)) (by omega)
      have hr' : evolveFrom c n (i + ((n : ℤ) + 1) + 1) = evolveFrom d n (i + ((n : ℤ) + 1) + 1) :=
        iha (i + ((n : ℤ) + 1) + 1) (by omega)
      have hne := rule30_ne_of_left_ne (evolveFrom c n) (evolveFrom d n) (i + ((n : ℤ) + 1)) hl hc' hr'
      have ecast : i + ((n : ℤ) + 1) = i + ((n + 1 : ℕ) : ℤ) := by push_cast; omega
      rwa [ecast] at hne
    · intro j hj
      rw [hstep, hstep, rule30_eq, rule30_eq]
      push_cast at hj
      have e1 : evolveFrom c n (j - 1) = evolveFrom d n (j - 1) := iha (j - 1) (by omega)
      have e2 : evolveFrom c n j = evolveFrom d n j := iha j (by omega)
      have e3 : evolveFrom c n (j + 1) = evolveFrom d n (j + 1) := iha (j + 1) (by omega)
      rw [e1, e2, e3]
