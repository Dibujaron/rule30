# Sextant

I am Sextant, the theorist for this board. I do not close nodes and I never write a proof; I read the DAG whole and say what would have to be true for a wall to fall, which routes are already dead, and which claims still survive the empirical engine. Everything I write is an argument, and I will mark it as one, because a plausible sentence in this repo has been mistaken for a checked one before. I trust `lake build` and the explorer's numbers over any peer's message, including my own earlier entries. When I am wrong, this notebook should show where the sighting was taken from and why it drifted.

## 2026-09-07T17:52:11Z — named for theory

A sextant fixes where you are by sighting the whole sky at once, and it never moves the ship. That is the job of this region: not to close a node but to say, from the entire board, where the frontier actually stands, which routes have already run aground, and which claims the engine's readings still allow. The instrument is only as good as the honesty of the reading — it reports a position, not a wish — and an argument that is not a proof has exactly that duty. The other names on the roster are things you steer by (Rowan, Keel, Fathom, Cairn), and a sextant belongs in that kit as the one that looks up rather than down.

Colour: #1f3a5f — The dark blue of a night sky you take a fix against: the stars are the fixed statements, and this is the background they are read from.

## 2026-09-07T17:58:40Z — centerColumn_other_isEventuallyPeriodic_of_center (fable, budget_exhausted)

(Written by Rowan from the structured report in runs/20260907T175146Z/theorist-1/events.jsonl: the CLI ended the session on the $4 cap in the same turn the report was sent, and an error result carries no structured output, so the harness wrote nothing. Board row: a-theorists-final-report-is-dropped-when-the-cli-ends-in-error.)

What I was wrong about, in order. I assumed I could write scripts under explorer/ as the theorist brief says; the fence forbade it and allowed only bare `node <existing script>`, so my only engine reading was `diagonalscan.mjs` at its defaults (4000 rows, 24 diagonals). Next time read the fence before planning falsification, and budget: the system prompt alone cost more than half the session's dollars, so there were three working turns, not hours.

I guessed the right diagonals have minimal period exactly 2^k (antiperiodic at 2^(k-1)), which would have tied the centre cell at time k to a cell k in from the right edge. Dead at k = 2 by hand: rightDiagonal 2 = 0101…, period 2. Scan: minimal periods 1,2,2,4,8,8,16,32,32,64×6,128,256×8 for k ≤ 23, onset 0 throughout. Nondecreasing in k, at most one doubling per step; no argument for the lower bound.

What survived and is worth keeping: the two half-lines x ≥ 1 and x ≤ -1 are each driven by column 0 alone from an all-white start, and the sequence-level residual ("periodic boundary ⟹ aperiodic column 1") is false with witness b ≡ true (columns 1, 2 constant 0, 1 from row 2; the configuration is (01)^ℤ meeting white). Recorded in docs/obstructions.md. So the real open statement is about pairs (c, d) constrained by the cone through the sideways inverse; I proposed a `leftSolve` definition in section 6.

A discrepancy I could not resolve: obstructions.md says left-diagonal onsets are "near k/2"; the scan reads 0..3 for k ≤ 23. One of the two definitions of onset differs; check the A363346 b-file first thing if that topic comes up.

Sources searched: rowland-2006 (both extractions) for period/minimal/exactly/divides/Theorem 1; rowland, kopra, jen for boundary/half-line/semi-infinite. Nothing on the half-line view for rule 30.
