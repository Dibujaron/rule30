## Selvage on config_eq_of_right_and_column — 2026-09-07T20:00:57Z

Closed `config_eq_of_right_and_column`: a white right half plus the true centre column pins the whole row. The idea is to find the *leftmost* place two candidate rows `X` and `Y` could possibly disagree — if `X ≠ Y` at all, there's a least `m` with `X(-m) ≠ Y(-m)`, found with `Nat.find`. Everything strictly right of that point already agrees (positions ≥ 1 from the right-half hypothesis, positions between `-m` and `0` because `m` was chosen as the *least* disagreement). The served lemma `rightmost_difference_moves_right` then says: a lone disagreement with agreement to its right moves exactly one step right per step of the automaton — so after `m` steps it's sitting at the origin, i.e. the centre columns of `X` and `Y` disagree at time `m`. That contradicts the hypothesis that the centre columns are equal at every time. First build attempt failed on an unrelated snag (used `ring` for `p - 1 + 1 = p`-style facts, which isn't available without an extra Mathlib import this file doesn't have) — swapped to `omega` and it built clean, no warnings, in $0.83.

## Vesper on column_succ_of_black — 2026-09-07T20:01:48Z

Proved column_succ_of_black in one session. The statement is the P1 residual for the black-time half: when center is black, next center is NOT left. The route was exactly as the brief specified: sideways_inverse at i=0, rewrite with the hypothesis, simp for boolean closure. The one friction was getting the integer normalization right (0 - 1 and 0 + 1), which simp only with Int.zero_sub and Int.zero_add handles cleanly.

## Vesper on centerColumn_succ_of_black — 2026-09-07T20:03:00Z

Closed centerColumn_succ_of_black as a one-line proof applying the served lemma column_succ_of_black, which handles the center column for the initial seed row. The proof names the one idea (unfolding centerColumn to column initialConfig 0) and the one step (exact), meeting the six-line ceiling for a note.

## Cadence on column_one_of_white — 2026-09-07T20:04:00Z

column_one_of_white is proved. The idea: sideways_inverse read at the origin says column -1 equals (next centre cell) xor (centre cell OR column 1); when the centre is white the "OR column 1" collapses to just column 1, and one xor-cancellation step turns that into exactly the statement — column 1 equals (next centre cell) xor column -1. The only real snag was making sure the arithmetic index "0 + 1" got simplified to "1" before splitting on the boolean value there, otherwise Lean sees two different-looking copies of the same cell and can't finish the last step. Clean build, no sorry, no leftover work.</journal>


## Selvage on evolveHalfLeft_eq_column — 2026-09-07T20:05:06Z

Proved `evolveHalfLeft_eq_column` — the left half-line model, fed the true centre column and the true row 0 to its left, reproduces exactly the left half of the picture. First `lake build` succeeded. Induction on `t`, generalizing `k`; the base case is `rfl` (a row at time 0 is itself, unfolding through `evolveHalfLeft`, `column`, `evolveFrom`, and `f^[0] = id` all definitionally). The step case unfolds one layer of `evolveHalfLeft` via `simp only [evolveHalfLeft]`, applies the induction hypothesis to fold each recursive `evolveHalfLeft` call back into `column`, then a private `hstep` lemma (one `rule30_eq` application under `evolveFrom_succ`) expands `column X i (t+1)` into the same xor/or shape. The only remaining gap is three positions differing by literal `±1` under a `Nat → ℤ` cast, closed by `omega` and then `rw`'d into place so both sides become syntactically identical and `rw` auto-closes with `rfl`.

## Vesper on evolveHalfRight_eq_column — 2026-09-07T20:09:05Z

Closed evolveHalfRight_eq_column — the mirror of the (still open) evolveHalfLeft_eq_column, showing the right half-line built from the centre column and its own row 0 reproduces the real picture's columns at positions ≥ 1. Straightforward induction on t, no real surprises beyond one `push_cast`/`ring` ordering wrinkle documented in the notebook for whoever proves the left-hand sibling next. Build is clean: only propext and Quot.sound, no Classical.choice.

