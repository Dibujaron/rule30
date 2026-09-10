## Cadence on centerColumn_not_isEventuallyPeriodic_of_long_black_runs — 2026-09-10T22:31:12Z

Proved centerColumn_not_isEventuallyPeriodic_of_long_black_runs. Band: Nothing — the seed's own docstring says this correctly, and it's right: the implication is true of any Bool sequence, using nothing about rule 30 except the one already-closed fact that the centre column isn't eventually constant. Route: assume a period p from N0, pull a run of length p from the hypothesis at k=p, then strong induction shows every cell from that run's start onward is true (a run at least as long as the period, inside a periodic tail, forces the whole tail constant). That contradicts centerColumn_not_eventually_constant's "white infinitely often" half directly. Cost: one file, one build, no wasted cycles — the only real content was seeing that citing the already-closed constant-column lemma is cheaper than re-deriving why an eventually-constant column is impossible from scratch.

## Vesper on rule30_alternating_step — 2026-09-10T22:32:18Z

Proved rule30_alternating_step -- the alternating block left of the origin shrinks by one cell per step. Straightforward once split into j=0 (the black centre cell makes the OR term true no matter what sits at position 1, which the hypothesis never covers) and j=k+1 (a routine recurrence unfold plus a parity case split). First try, no dead ends -- a prior attempt on this node apparently started and died without writing anything, so there was nothing to retrieve. Band: Nothing, per the node's own disclaimer -- true of any configuration, no new fact about rule 30.

## Vesper on column_black_run_of_alternating — 2026-09-10T22:35:25Z

Proved `column_black_run_of_alternating` — cheap, ~$1.2 total, no dead ends. It's a direct iteration of the sibling node `rule30_alternating_step` (which I'd proved earlier this session): if an alternating block of length L+1 sits at the origin at time t, the block shrinks by one cell per step, so the centre cell itself stays black for the next L steps. The proof threads that shrinking through an induction on the step count, using `Nat.le.dest` to name the "remaining depth" as an explicit witness rather than fighting Nat subtraction. Axioms are clean (propext, Quot.sound only). As the node's own disclaimer says, this is an unconditional consequence with no bearing on rule 30 beyond restating the local rule — it doesn't say whether such alternating blocks actually occur in the picture, which is the open, measured half of the correspondence.

## Selvage on column_alternating_of_black_run — 2026-09-10T22:36:48Z

Band: Project-internal. Proved column_alternating_of_black_run: an L+1-long black run in the centre column starting at time t forces the L+1 cells to its left, read at time t itself, to alternate by parity of distance. It's unconditional (true of any Config, not just the seed's picture) and, per its own DOES NOT PROVE, moves a question rather than answering one — the open part is whether either a long black run or a deep alternating block ever occurs at unbounded size. With its (unseeded) converse this would make "black run length" and "alternating depth" the same measurement read in two directions, but on its own it's plumbing for that future pairing, not a result about rule 30.

Built and typechecked clean on the first attempt, no iteration needed. The proof does strong induction on the depth j: j=1 cites the served column_succ_of_black directly; j≥2 cites sideways_inverse applied to the row at time t, position -(m+1), which is exactly the recursion column_succ_of_black uses once, run one column further — it needs the same fact one column shallower read at time t+1 (obtained by recursing on a run shortened by one) plus two smaller-depth facts at time t itself from earlier in the same induction.

## Vesper on centerColumn_not_isEventuallyPeriodic_of_deep_alternating — 2026-09-10T22:37:33Z

Closed centerColumn_not_isEventuallyPeriodic_of_deep_alternating — pure plumbing between two lemmas I'd already proved earlier this session (column_black_run_of_alternating and centerColumn_not_isEventuallyPeriodic_of_long_black_runs). Built first try, ~$1.10 of budget used. Band: Nothing — it's the same trivial "unbounded runs refute periodicity" fact as its sibling, just read spatially instead of temporally, and it's still conditional on a hypothesis (deep alternating blocks occurring arbitrarily late in the seed's picture) that nobody has established.

## Cadence on column_alternating_shrink — 2026-09-10T22:43:27Z

Proved column_alternating_shrink. Band: nothing/project-internal — it's an unconditional fact about any Bool sequence obeying the rule-30 local update (true of any config X), phrased for the alternating-block bookkeeping this tier's siblings need; it says nothing new about rule 30 itself and bears on no prize conjecture, consistent with its own DOES NOT PROVE note. Two build cycles: first hit `ring`/`norm_num` not being importable from just Rule30.Basic (fixed by switching to `omega`, with `push_cast` first where the cast sits on a compound sum), second built clean.

