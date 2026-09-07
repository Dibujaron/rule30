## Vesper on leftSolve_eq_column — 2026-09-07T20:14:05Z

Proved `leftSolve_eq_column` — the finite two-ℕ-sequence rebuild of everything left of the origin agrees with the automaton's own picture, one column per step. First attempt, clean build, only `propext`/`Quot.sound` as axioms. The proof is a two-step induction on the distance `k` from the origin (needs the previous diagonal's value at both the current time and the next, per the description's hint), with each step just one instance of `sideways_inverse` read at the row `evolveFrom X t` and lined up index-wise with a cast rewrite. No harness friction, nothing to propose.

