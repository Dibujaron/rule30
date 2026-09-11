## Chorobates on connector-1 — 2026-09-11T02:34:24Z

Dib — Chorobates, first outing. The vantage asked one question with a yes/no shape: is there a literature that one of the four proved sufficient conditions for P1 connects to and P1 itself does not? The answer is a qualified negative and I think it closes the clause.

Band first, per the reporting rule: **project-internal**. It closes a route and stops a sixth session being paid for. Nothing here is new mathematics about rule 30 except one small local measurement.

Fields sighted: fourteen. The ones that mattered were prime-gap difference triangles (Gilbreath's conjecture), shift-register sequences, trace subshifts of cellular automata, and cocycle rigidity.

What survived to section 5, and what died in section 4:

DIED IN SECTION 4 — `..._of_white_times`. It is not a sufficient condition in any useful sense: it is LOGICALLY EQUIVALENT to P1. Its hypothesis is guarded by "if the centre column has period p from N", which is the negation of what it concludes, so P1 implies it for free and it implies P1 by the node. Kernel-checked, axioms [propext]. I also proved the general form — replace the consequent by any predicate at all and the equivalence still holds — which is the shape of the trap, and the board has at least one other node in it (centerColumn_periodic_neg_one_black_times, whose own DOES NOT PROVE field already says so).

DIED IN SECTION 4 — the whole run-length literature, in two lines from board nodes. Under the residual's hypothesis every run is shorter than the period, so any theorem "there is a run of length at least g(p) per period" is consistent with periodicity; and a run theorem indexed by time rather than by the period IS the residual. So the run route is all-or-nothing and no partial result in that field can be a rung. That one stroke removes Golomb, Erdős–Rényi, Dejean and normality from the clause at once.

DIED IN SECTION 4 — the cocycle route, but it was already dead: Portage sighted it on 2026-09-08 and the board's own 38,700-pair search found 0 survivors. I add one structural observation: that residual is the only one of the four at Σ⁰₂ rather than Π⁰₂, i.e. the only one with a finite witness, which is exactly why a search was possible at all.

SURVIVED TO SECTION 5 — one, and it is the unlikely one. `..._of_deep_alternating` is the rule 30 instance of Gilbreath's conjecture: a single-seed triangular array whose boundary column is verified to enormous depth and unproved, where Odlyzko's 1993 reduction protects the column with a finite window of a rule-closed sub-alphabet that loses one cell per row — which is, line for line, the board's own `column_alternating_shrink`. Chase, Hunter and Tao put a paper on the arXiv two months ago with a deterministic inverse theorem for exactly that shape. The dictionary has twelve rows and it breaks at row eleven: their array's parity is Pascal's triangle mod 2 (their Lemma 3.10, via Lucas), and rule 30's is crystal 71's degree 2t−1. Their proved half is for a random seed; ours is one black cell.

I ran two things. `explorer/chorobates_shields2.mjs` asks the dictionary's load-bearing question — over there {0,2} is one of several closed sub-alphabets, so is rule 30's alternating block the smallest of a family? Exhaustively, for every L up to 10, exactly two words of length L pin the centre column for L rows, and both are the alternating word with its deepest cell free. Rule 30 has exactly ONE one-sided shield. The family does not exist, and the generalisation the dictionary invites is closed before anyone tries it. The two-sided version (patches of rule 30's own periodic rings) occurs at the fair-coin rate — 12 on the seed against 11 on a coin over 20,001 rows — which also means the checkerboard is not a regular domain of rule 30.

Two faults in my own first script, both worth your seeing because they are this project's signature failure: it reported a true count over the wrong denominator, and it reported its own measurement cap as a result, with a winner count going 2,2,...,2,4,8,16,32 that looked exactly like structure and was the model running out of cells. Both fixed in the second pass, where I wrote the null I should have written first.

One honest gap: I could not get Theorem 1.6 of the Chase–Hunter–Tao paper verbatim — the fetcher declined on copyright grounds — so my reading that their method is linear-specific rests on their own sentence about Lemma 3.10's role rather than on the theorem itself. That is the one thing in the document worth ten minutes of a captain's time, and it is the only thing that could reopen this.

$9 of the budget.

