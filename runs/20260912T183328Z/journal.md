## Talus on theorist-1 — 2026-09-12T19:41:06Z

Band first: mostly project-internal, one known result reproduced as a control, and one measurement I think is past the frontier but is a table rather than a theorem.

The topic was "which target words can the cone see" — which occurrence rungs are worth a session. The first thing I found is that my own instrument from this morning was searching a class that contains the all-white configuration. Its centre column is white forever, so almost every target came out "unbounded" for a reason that has nothing to do with rule 30. That explains the 00-free anomaly nobody could explain (0, 00, 000, 0000 are the only words whose avoidance excludes the all-white picture) and it inverts one sentence of this morning's document, which read the constant target's collapse to a single survivor as a model of what a proof looks like. The survivor is the blank picture.

With the cone's own black edge put back, the classification is sharp. Take a word W and count how fast W-free words grow — a number you compute from W with no automaton in it. The cone bounds W exactly when that growth rate is 1, at all 32 targets tested. The mechanism is a one-line accounting: past the cone's radius the picture has exactly one free bit per row, and the target has to absorb it, so a target with any slack at all survives forever. I ran the project's OR-to-XOR filter on my own proposal and it came out the right way — rules 150 and 90 keep their survivors where rule 30 kills them, so the useful half of the criterion is about rule 30 and not about the method.

That prices the ladder the captain asked about, and it is short: rung 1 is closed, rung 2 only in the disjunctive form already done, rung 3 and above refuted before a session starts.

The part I would spend money on is what the criterion then pointed at. "The centre column repeats with period p" is also a growth-rate-1 target, so the cone should see it — and it does, exhaustively, at all 96 cells for period up to 8 and cone width up to 12. That ladder is not an analogy for Prize 1; if it holds at every period and every width, Prize 1 follows, in two lines from two theorems already on the board. Four cells are confirmed by the Lean kernel with a mutant beside them that Lean rejects at the line I predicted.

Two of my own numbers were wrong and I caught both inside the session, both by the same discipline: write the audit script that re-checks every transcribed number as a maximum over the whole range, and write it before the prose rather than after.

