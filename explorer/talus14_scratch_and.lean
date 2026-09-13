import Rule30.Basic

/-!
Talus, 2026-09-13.  The OR-to-AND filter, in the kernel.

Rule 30 is `l ⊕ (c ∨ r)`; rule 120 is `l ⊕ (c ∧ r)`.  Crystal 74 says the whole
distance between "P1 is trivially settled" and "P1 is open" is OR against AND on
the `(c, r)` pair.  Four things checked here, none of them by measurement:

1.  the two rules differ at exactly the four table rows with `(c, r) ∈ {(0,1), (1,0)}`;
2.  rule 120's picture from `initialConfig` is exactly the ray `x = t` — proved,
    not sampled, so "the centre column is white from `t = 1`" and "the left
    half-plane is empty" are theorems about rule 120 and not observations;
3.  the single table entry `(0,0,1)` is what makes rule 30's left edge black, and
    it is one of those four;
4.  `(0,1,1)`, the *other* entry `evolve_left_edge`'s proof note mentions, is
    SHARED by the two rules — so the left edge is not "an OR fact" loosely, it is
    the entry `(0,0,1)` exactly.
-/

namespace TalusAnd

open ElementaryCA

def rule120 : Config → Config := ElementaryCA.step 120

theorem rule120_eq (c : Config) (i : ℤ) :
    rule120 c i = xor (c (i - 1)) (c i && c (i + 1)) := by
  show ElementaryCA.step 120 c i = _
  unfold ElementaryCA.step ElementaryCA.neighborhoodIndex
  cases c (i - 1) <;> cases c i <;> cases c (i + 1) <;> rfl

/-- 1.  The two rules agree at four neighbourhoods and differ at four, and the
four they differ at are exactly those with `c ≠ r`. -/
theorem or_and_differ_exactly (l c r : Bool) :
    (xor l (c || r) ≠ xor l (c && r)) ↔ (c ≠ r) := by
  cases l <;> cases c <;> cases r <;> decide

/-- 3 and 4.  `(0,0,1)` is a difference; `(0,1,1)` is not. -/
theorem entry_001_differs : (xor false (false || true)) ≠ (xor false (false && true)) := by decide
theorem entry_011_agrees  : (xor false (true  || true)) =  (xor false (true  && true)) := by decide

/-- The cell that *creates* rule 30's left edge reads neighbourhood `(0,0,1)`:
white outside the cone, white where the cone has not reached, black at the edge.
Rule 30 returns black there and rule 120 returns white. -/
theorem left_edge_entry :
    xor false (false || true) = true ∧ xor false (false && true) = false := by decide

def evolve120 (t : ℕ) : Config := rule120^[t] initialConfig

theorem evolve120_zero : evolve120 0 = initialConfig := rfl

theorem evolve120_succ (t : ℕ) : evolve120 (t + 1) = rule120 (evolve120 t) := by
  show rule120^[t + 1] initialConfig = _
  rw [Function.iterate_succ_apply']
  rfl

/-- 2.  Rule 120's picture from a single black cell is exactly the ray `x = t`. -/
theorem evolve120_eq (t : ℕ) : ∀ i : ℤ, evolve120 t i = decide (i = (t : ℤ)) := by
  induction t with
  | zero => intro i; simp [evolve120_zero, initialConfig]
  | succ n ih =>
    intro i
    rw [evolve120_succ, rule120_eq, ih, ih, ih]
    by_cases h1 : i - 1 = (n : ℤ)
    · have e2 : ¬ (i = (n : ℤ)) := by omega
      have e4 : i = ((n + 1 : ℕ) : ℤ) := by push_cast; omega
      simp [h1, e2, e4]
    · have e4 : ¬ (i = ((n + 1 : ℕ) : ℤ)) := by push_cast; omega
      by_cases h2 : i = (n : ℤ)
      · have e3 : ¬ (i + 1 = (n : ℤ)) := by omega
        simp [h1, h2, e3, e4]
      · simp [h1, h2]
        omega

/-- Rule 120's centre column is white at every positive time. -/
theorem evolve120_center (t : ℕ) (ht : 1 ≤ t) : evolve120 t 0 = false := by
  rw [evolve120_eq, decide_eq_false_iff_not]
  omega

/-- Rule 120's left half-plane is empty: nothing black at any negative position,
at any time.  Rule 30's `evolve_left_edge` says the opposite at `x = -t`. -/
theorem evolve120_left_empty (t : ℕ) (i : ℤ) (hi : i < 0) : evolve120 t i = false := by
  rw [evolve120_eq, decide_eq_false_iff_not]
  omega

/-- Rule 120's left EDGE, the exact mirror of the board's `evolve_left_edge`.

The hypothesis `1 ≤ t` is not decoration.  At `t = 0` the left edge cell IS the
seed, so it is black for every rule there is, and the statement without `1 ≤ t`
is false.  I wrote it without, and the kernel caught it. -/
theorem evolve120_left_edge (t : ℕ) (ht : 1 ≤ t) : evolve120 t (-(t : ℤ)) = false := by
  rw [evolve120_eq, decide_eq_false_iff_not]
  omega

#print axioms evolve120_eq
#print axioms evolve120_center
#print axioms evolve120_left_empty
#print axioms evolve120_left_edge
#print axioms or_and_differ_exactly

end TalusAnd
