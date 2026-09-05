/-
# Oracle check: the center column against OEIS A051023

Kept out of `Rule30` proper and out of the default build target. `evolve t 0`
re-derives the whole light cone with no sharing, so `centerColumn t` costs
`3 ^ t` — checking 16 terms adds several seconds to every rebuild, which is a
tax every prover agent would otherwise pay on every iteration of its inner
loop.

Run it deliberately instead:  `lake build Oracle`

Full-length agreement with A051023 is `explorer/`'s job; this is a spot check
that the Lean definitions and the BigInt engine describe the same automaton.
-/
import Rule30

/- Sanity check against OEIS A051023, the known center column of rule 30.
`#guard` fails the build if the expression does not evaluate to `true`.

Note the definition is deliberately naive: `evolve t 0` re-derives the whole
light cone from scratch, so the cost of `centerColumn t` is `3 ^ t`. That is
fine for a spot check and hopeless past `t ≈ 16`; the `explorer/` scripts are
what you use to look at the sequence for real. -/
#guard
    (List.range 16).map centerColumn =
      [true, true, false, true, true, true, false, false,
       true, true, false, false, false, true, false, true]
