/-
Talus, 2026-09-08. Kernel check tying the explorer's half-line engine to the
board's own definition.

Every measurement in this session's attack document was made with a bit-packed
engine in `explorer/talus_*.mjs` that pins position 0 to a chosen boundary
sequence and evolves `x >= 1` from a white start. The board already has that
object as `evolveHalfRight` in `Rule30/Basic.lean`, and `evolveHalfRight_eq_column`
(proved) says it reproduces the real columns of any configuration with that
centre column. The table below is the engine's output for the boundary
`(10)^inf` -- printed by `explorer/talus_witness.mjs`, not typed by hand -- and
the kernel is asked to confirm it against `evolveHalfRight`.

This matters because a mirrored half-line passes every symmetric check; the
project has been caught by exactly that twice.
-/
import Rule30.Basic

set_option maxRecDepth 100000

/-- The boundary `(10)^∞`: black at every even time, white at every odd one. -/
def bAlt : Nat → Bool := fun t => decide (t % 2 = 0)

/-- Rows 0..7, positions 1..5, of the half-line driven by `(10)^∞` from a white
start, exactly as `explorer/talus_witness.mjs` printed them. -/
example :
    (List.range 8).map (fun t => (List.range 5).map (fun k =>
      evolveHalfRight bAlt (fun _ => false) t k))
      = [[false, false, false, false, false],
         [true,  false, false, false, false],
         [true,  true,  false, false, false],
         [false, false, true,  false, false],
         [false, true,  true,  true,  false],
         [false, true,  false, false, true ],
         [true,  true,  true,  true,  true ],
         [false, false, false, false, false]] := by
  decide

/-- Column 1 of that half-line is not periodic with any period `q ≤ 3` from any
onset `N ≤ 2` within the first eight rows -- the smallest finite shadow of the
claim the document makes at depth `5 · 10^5`. -/
example :
    ∀ q ∈ [1, 2, 3], ∀ N ∈ [0, 1, 2],
      ¬ (∀ t ∈ List.range 8, N ≤ t → t + q < 8 →
          evolveHalfRight bAlt (fun _ => false) (t + q) 0
            = evolveHalfRight bAlt (fun _ => false) t 0) := by
  decide
