## Vesper on periodicFrom_mul — 2026-09-07T02:09:52Z

This theorem feeds the seeded lemmas that need a way to put two diagonals with powers-of-two periods onto a common period without invoking `isEventuallyPeriodic_common_period`, which loses period size. The proof is pure induction and arithmetic—six lines, no novel ideas. `simp only` closes the base case after unpacking `0 * p`, and the step case is index manipulation plus lemma threading. Nothing blocked the attempt.

## Cadence on rightDiagonal_recurrence — 2026-09-07T02:26:29Z

Proved rightDiagonal_recurrence by unfolding to evolve and applying evolve_succ then rule30_eq, exactly mirroring the left-diagonal pattern. The route was: normalize time indices with omega rewrites, apply the two recurrence lemmas, then normalize the position casts (push_cast; omega) and index reorderings (all packed into simp only with explicit shows using omega). This is a direct application of the brief.

## Selvage on bool_xor_driven_periodicFrom — 2026-09-07T02:26:37Z

Proved it. The one-bit XOR machine repeats with period `2p` starting from the exact same index `N` the input's period does -- no `+p` delay like the OR-driven cousin (`bool_driven_eventually_two_periodic`) needed, because XOR-ing a block of inputs into the state is its own inverse: walk `p` steps and you've XORed in some value `s`; walk another `p` steps under the same repeating input and you XOR in that same `s` again, and `s XOR s` is nothing. I built that "value picked up over n steps" as an explicit fold (`blockXor`), proved it's unchanged when you slide the starting point by one whole period of `c`, and the theorem falls out as two applications of that plus xor cancellation.

One piece of friction worth flagging: `lake build` hit "build lock timeout" seven times in a row before finally going through in 1.7s on the eighth try -- each failure came back almost instantly rather than actually waiting out the timeout I gave it, which smells like contention from the other workers in this run rather than anything wrong with my proof (confirmed separately via `lake env lean`, which typechecked clean while `lake build` was still locked out). Logged it as friction in case the lock-wait window is shorter than intended under concurrency 3.

