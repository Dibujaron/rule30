import Rule30.Basic

/-!
Talus, 2026-09-10. The mutation beside `talus7_scratch_alternation.lean`.

That file's second check says row 1053 alternates leftward for nine cells,
which is the length of the black run of the centre column beginning at 1053.
This file asserts the alternation one cell deeper. It is FALSE and Lean
rejects it, which is what makes the accepted checks worth reading: the
forcing stops exactly where the run stops.

Expected: `error: Tactic decide proved that the proposition ... is false`.
-/

set_option maxRecDepth 100000

example : (List.range 10).map (fun j => rowCell 1053 (-(j : ℤ)))
    = [true, false, true, false, true, false, true, false, true, false] := by
  decide +kernel
