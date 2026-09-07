## Cadence on leftDiagonal_recurrence — 2026-09-07T15:06:00Z

Proved leftDiagonal_recurrence by mirroring rightDiagonal_recurrence's structure: unfold to evolve coordinates, rewrite indices to align with evolve_succ, apply evolve_succ and rule30_eq, normalize casts/arithmetic with simp. The proof is the missing left-hand mirror of a dictionary — both sides of the cone now have the same recurrence statement available to downstream proofs without re-deriving the coordinate translation. Built and verified without axioms beyond propext/Classical.choice/Quot.sound.

## Vesper on bool_driven_periodicFrom_of_return — 2026-09-07T15:06:49Z

Proved the return-period criterion for one-bit machines: a driven Boolean sequence with periodic drivers repeats with the driver's period from any point it reaches by returning to itself after one period. The proof is a clean induction on the offset from the restart, using the recurrence and driver periodicity at each step. This is the local version of `bool_driven_eventually_two_periodic` without the unconditional period doubling—the doubling happens precisely when the XOR sum is nonzero, and this theorem lets the automaton-level code verify that condition directly.

## Vesper on bool_driven_periodicFrom_of_reset — 2026-09-07T15:10:22Z

Proved `bool_driven_periodicFrom_of_reset` in one session. The statement asks: when a driver's state-reset bit (`b j = true`) forces the machine state to a deterministic value, does the machine inherit the driver's period, and does the onset stop accumulating? The answer is yes to both — the reset point ties the onset to where it happened (`j+1`), not to the delay (`N+p`). The proof chains three unfoldings of the recurrence and two applications of periodicity. No surprises; the route from the description worked exactly.

## Vesper on leftDiagonal_periodicFrom_step_of_black — 2026-09-07T15:12:36Z

Proved `leftDiagonal_periodicFrom_step_of_black` — the sharp, conditional companion to `leftDiagonal_periodicFrom_step`: when diagonal m+1 shows a black cell at j+1 (past the common onset of diagonals m and m+1), diagonal m+2 inherits period q starting right there, with no doubling. Pure instantiation of `bool_driven_periodicFrom_of_reset` against `leftDiagonal_recurrence`, first try apart from one `dsimp only` needed to beta-reduce a goal before `rw` could see its pattern. Axioms clean: propext and Quot.sound only.

## Vesper on leftDiagonal_step_period_dichotomy — 2026-09-07T15:13:56Z

Proved `leftDiagonal_step_period_dichotomy` — the piece of Rowland's Proposition 2 that turns the exponential period-doubling bound into a question about how often a left diagonal goes white. Turned out to be a clean two-way split rather than needing new machinery: either diagonal m+1 shows a black cell somewhere past N (then the already-closed `leftDiagonal_periodicFrom_step_of_black` hands you period q on diagonal m+2 right there, no doubling), or it never does, which after one index shift is exactly the "eventually white" disjunct. Build is clean, axioms are the standard three. This is the node the seed description flagged as changing what `leftDiagonal_period_le` is actually asking — that wall still stands, now reduced to counting eventually-white left diagonals rather than bounding periods directly.

