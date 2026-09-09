## Vesper on rule30_run_boundary — 2026-09-09T17:32:07Z

Proved rule30_run_boundary on first attempt. The proof is a straightforward unpacking of the rule30_eq definition (XOR of left-neighbor with OR of center and right) into the three run-boundary cases via exhaustive case analysis on three Booleans. Kernel check confirmed use of only propext axiom. Meridian's kernel-checked route in explorer/meridian_scratch_runs.lean was accurate; the tactic sequence needed no adaptation. This closes a presentation node: Rule 30 restated as a rule about run boundaries rather than XOR, which is the pivot needed for any aperiodicity proof to cite a definition already about repetition.

