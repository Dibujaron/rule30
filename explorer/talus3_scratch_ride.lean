import Rule30.Basic
import Rule30.Proofs.Rule30LeftLocalLaw

/-!
The atom of candidate C4 of
`docs/attacks/2026-09-09-the-onset-wall-is-now-exactly-critical-...md`.

At the left edge of the transient band the seed's picture and the settled
picture agree strictly left of the front and differ at it.  If the settled
cell one place further left is WHITE, the difference moves one cell left --
the front advances, and the picture is not consulted at all.  So on a
diagonal whose left neighbour's settled word is identically white the front
advances on every row, for ever: it rides that diagonal, and the diagonal is
then transient at every later index, which `leftDiagonal_periodicFrom_pow`
forbids.  Hence the front never sits there.

This file checks the one-step half, which is the part that is a rewrite of
`rule30_left_local_law`; the "for ever" half is an induction and the
contradiction is with a closed node, neither of which is checked here.

Run with `lake env lean explorer/talus3_scratch_ride.lean`.
-/

/-- A front standing on a white settled cell advances one place left. -/
theorem front_advances_on_white (c d : Config) (i : ℤ)
    (h2 : c (i - 2) = d (i - 2)) (h1 : c (i - 1) = d (i - 1)) (h0 : c i ≠ d i)
    (hw : c (i - 1) = false) :
    rule30 c (i - 1) ≠ rule30 d (i - 1) :=
  (rule30_left_local_law c d i h2 h1 h0).mpr hw

/-- And the converse: a front standing on a black settled cell does not. -/
theorem front_stalls_on_black (c d : Config) (i : ℤ)
    (h2 : c (i - 2) = d (i - 2)) (h1 : c (i - 1) = d (i - 1)) (h0 : c i ≠ d i)
    (hb : c (i - 1) = true) :
    rule30 c (i - 1) = rule30 d (i - 1) := by
  by_contra h
  have := (rule30_left_local_law c d i h2 h1 h0).mp h
  rw [hb] at this
  exact Bool.noConfusion this

#print axioms front_advances_on_white
#print axioms front_stalls_on_black
