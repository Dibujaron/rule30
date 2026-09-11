/-
Chorobates, connector, 2026-09-11.

The vantage asks whether any of the four proved sufficient conditions for P1
has a literature P1 itself does not. For one of the four the question has no
content, and this file is the check.

`centerColumn_not_isEventuallyPeriodic_of_white_times` has hypothesis

    H := ∀ p > 0, ∀ N, (∀ t ≥ N, centerColumn (t + p) = centerColumn t) →
           ∀ t ≥ N, centerColumn t = false → evolve (t + p) 1 = evolve t 1

and concludes `¬ IsEventuallyPeriodic centerColumn`, i.e. P1. So `H → P1` is
the node. This file proves the converse, `P1 → H`, in four lines: under P1 the
implication's antecedent is false, so the implication is vacuous. Hence
`H ↔ P1`: the residual is not a strengthening of P1, or a reduction of it, or
a reformulation with a smaller object — it is P1, and no literature can attach
to it that does not already attach to P1.

The same two lines work for ANY conclusion in place of
`evolve (t + p) 1 = evolve t 1`, which is the general form of the trap: a
sufficient condition whose hypothesis is guarded by the negation of the goal is
equivalent to the goal, whatever it says inside.

Checked with `lake env lean`. It does not import Rule30.Statements; the
hypothesis is restated here verbatim from that file's signature.
-/
import Rule30.Basic

def IsEventuallyPeriodic' (f : ℕ → Bool) : Prop :=
  ∃ p > 0, ∃ N, ∀ n ≥ N, f (n + p) = f n

/-- The hypothesis of `centerColumn_not_isEventuallyPeriodic_of_white_times`,
copied from `Rule30/Statements.lean`. -/
def WhiteTimes : Prop :=
  ∀ p > 0, ∀ N : ℕ, (∀ t ≥ N, centerColumn (t + p) = centerColumn t) →
    ∀ t ≥ N, centerColumn t = false → evolve (t + p) 1 = evolve t 1

/-- **P1 implies the residual, vacuously.** -/
theorem whiteTimes_of_p1 (h : ¬ IsEventuallyPeriodic' centerColumn) : WhiteTimes := by
  intro p hp N hper t _ _
  exact absurd ⟨p, hp, N, hper⟩ h

/-- The same, with the conclusion replaced by an arbitrary predicate: nothing
about column 1 is being used. -/
theorem whiteTimes_of_p1_general (Q : ℕ → Prop)
    (h : ¬ IsEventuallyPeriodic' centerColumn) :
    ∀ p > 0, ∀ N : ℕ, (∀ t ≥ N, centerColumn (t + p) = centerColumn t) →
      ∀ t ≥ N, Q t := by
  intro p hp N hper t _
  exact absurd ⟨p, hp, N, hper⟩ h

/-- And the direction the board already has, stated so the equivalence is
visible in one place: `WhiteTimes` is what the node consumes, P1 is what it
produces, and the theorem above closes the loop. -/
example : (WhiteTimes → ¬ IsEventuallyPeriodic' centerColumn) →
    (WhiteTimes ↔ ¬ IsEventuallyPeriodic' centerColumn) :=
  fun hnode => ⟨hnode, whiteTimes_of_p1⟩

#print axioms whiteTimes_of_p1
#print axioms whiteTimes_of_p1_general
