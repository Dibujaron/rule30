import Rule30.Basic

/-!
Talus, 2026-09-10. The kernel confirmation of the forced alternation, and of
the run bound's ingredient, at a concrete black run of the centre column.

The claim (C1 of the P2 attack document): if the centre column is black at
every time in `[a, a + L)`, then row `a` reads the checkerboard leftward for
`L` cells,

    rowCell a (-j) = decide (j % 2 = 0)   for j < L,

and the cone (`evolve_left_edge`, `evolve_left_second_diagonal`) puts two
ADJACENT black cells at positions `-a` and `-a + 1` of row `a`, which the
checkerboard forbids -- so `L ≤ a`.

The first black run of length 9 begins at `a = 1053`. The three checks below
are: the run itself (white at 1052, black at 1053..1061, white at 1062); the
alternation left of row 1053 for the run's whole length; and the two adjacent
black cells at the cone edge of that same row, which is what stops it.

`talus7_scratch_mutant.lean` sits beside this file and is the demonstration
that these checks can fail: it asserts the same alternation one cell deeper
than the run reaches, and Lean rejects it. That tenth cell is black where the
checkerboard wants white, so the forcing stops exactly where the run stops --
the claim is sharp, not merely true.
-/

set_option maxRecDepth 100000

-- the centre column is black at 1053 .. 1061 and white on both sides
example : (List.range 11).map (fun m => rowCell (1052 + m) 0)
    = [false, true, true, true, true, true, true, true, true, true, false] := by
  decide +kernel

-- row 1053 alternates leftward for the run's whole length
example : (List.range 9).map (fun j => rowCell 1053 (-(j : ℤ)))
    = [true, false, true, false, true, false, true, false, true] := by
  decide +kernel

-- and the cone edge of that row is two adjacent blacks, which the
-- alternation could never match: this is what bounds the run by its start
example : rowCell 1053 (-1053) = true ∧ rowCell 1053 (-1052) = true := by
  decide +kernel
