/-
Superseded.  This file was an attempt to re-check the tier's axioms with the
`push_cast` lines removed, on the strength of an "unused tactic" lint warning;
the warning was about a *different* `push_cast` in the same block and removing
them broke three rewrites.  The lint said one tactic did nothing; it did not say
which, and it did not say the others did nothing.

The checks that stand are:
  explorer/scratch_alt.lean        the six statements and proofs, axioms printed
  explorer/scratch_alt_final.lean  the same with each route self-contained
  explorer/scratch_roundtrip.lean  generated FROM blueprint/proposals/next.json
                                   by explorer/altrun_emit.mjs, which is the one
                                   that matters: it compiles the exact bytes the
                                   captain will land.
-/
