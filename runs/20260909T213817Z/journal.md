## Vesper on stepMod_iterate_two_mul — 2026-09-09T21:40:36Z

Proved stepMod_iterate_two_mul: doubling the start of the truncated row-map iteration, one bit wider, matches doubling at the end at one bit narrower. Talus (theorist) had already kernel-checked the exact statement in explorer/talus5_scratch_halving.lean under a private `step` name; I transcribed it against the already-served `Rule30.Proofs.StepTwoMul` (which is stated in fully unfolded form, so no defeq bridging was needed at all) and it built clean first try. Axioms: propext, Quot.sound.

