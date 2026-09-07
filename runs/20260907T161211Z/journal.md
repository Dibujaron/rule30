## Cadence on sideways_inverse — 2026-09-07T16:13:11Z

**sideways_inverse proved.** The statement says each cell is recoverable from rule 30's output and its two right neighbors — the backwards view of rule 30 using xor's involution. One line of setup and boolean cases, following the same shape as the served evolve_sub_one_eq_xor, which made the code path immediate and the three-line proof obvious.

## Selvage on evolveFrom_eq_of_agree_on_window — 2026-09-07T16:14:18Z

Proved the cone lemma for arbitrary starting rows, `evolveFrom_eq_of_agree_on_window`, first try — no failed builds, no back-and-forth. The idea: induct on how many rule-30 steps have been taken, and keep a running claim that after `s` steps the two rows still agree on a window shrunk by `s` on each side (from `-t..t` down to `-(t-s)..(t-s)`), since each new cell only reads three cells from the previous, wider window. I sidestepped the absolute-value case-splitting that `evolve_eq_false_of_outside_cone` needed by writing the window bound as a plain `≤`/`≥` pair instead of `|i| ≤ K` — that made the induction step three `omega` calls instead of a sign analysis. Total: one file, one build, done.

## Vesper on rule30_ne_of_left_ne — 2026-09-07T16:14:38Z

Completed rule30_ne_of_left_ne by unfolding the rule definition and case-splitting on Bool values. The proof works by contradiction: if changing only the left cell doesn't change the output, the symmetric case analysis on c(i-1) vs d(i-1) either contradicts the premise (if they match) or contradicts the Bool equation (if they differ). Clean first try after the Bool split strategy.

## Vesper on rule30_leftPermutive — 2026-09-07T16:15:54Z

Closed rule30_leftPermutive with a direct application of the served lemma rule30_ne_of_left_ne. The window hypothesis `∀ j, i - 1 < j → j ≤ i + 1 → c j = d j` provides exactly the agreement facts needed: c i = d i and c (i + 1) = d (i + 1). The proof unfolds the LeftPermutive definition, introduces the four hypotheses, extracts the two agreements via omega, and applies the served lemma. Builds cleanly in S.

## Cadence on rowCell_eq_evolve — 2026-09-07T16:19:52Z

Closed `rowCell_eq_evolve`: the packed-number model of a row agrees with the cell-by-cell definition, everywhere, for every row. This is the node that licenses `decide` to compute rows in the thousands, so it is plumbing rather than mathematics — it says nothing new about rule 30, it just makes facts about rule 30 cheap to check inside Lean.

The idea, in your terms. A row of the picture is at most `2t+1` cells wide, so it fits in the bits of one natural number: cell at position `x` is bit `x + t`. One step of rule 30 is `left XOR (centre OR right)`, and on the packed number "look one cell left" is just "shift up one bit" — so the whole row advances in three bignum operations, `(4*r) ^^^ ((2*r) ||| r)`, which is the same expression the BigInt explorer uses. Lean's kernel has real bignums, so it can run that thousands of times; evaluating the `ℤ → Bool` definition cell by cell dies around row 18.

Where the work actually was: the two ends. The row grows by one cell on each side every step, so the bit indices and the light-cone bounds have to line up exactly, and the two ends fail differently. On the right, a cell outside the cone corresponds to a bit past the top of the number — which is automatically zero, so nothing needs saying. On the left, a cell outside the cone corresponds to bit 0 and below, and bit 0 is the left *edge* of the row, which is black. So the left bound is load-bearing and the right one is redundant. Pulling that asymmetry out into its own small lemma is what turned a sixteen-branch case split into a two-branch one; the estimate on the node was L and it came in at M because of it.

One Lean note, since it is the kind of thing that bites repeatedly. `decide p` is the `Bool` that says whether the proposition `p` holds — the bridge from `Prop` (which has no runtime content) to `Bool` (which a cell can store). If you want to swap `decide p` for `decide q` in a goal, do *not* prove `p = q` and rewrite: `decide` secretly carries a proof that `p` is decidable, and rewriting `p` leaves that proof pointing at the old proposition, so the rewrite is rejected. Use `decide_eq_decide.mpr`, which takes `p ↔ q` and hands back the `Bool` equality directly. It is close to the TypeScript situation where a value and its type guard have to be updated together — except here the compiler catches it, loudly and unhelpfully, instead of at runtime.

## Cadence on rightmost_difference_moves_right — 2026-09-07T16:22:13Z

Proved `rightmost_difference_moves_right`: if two rows agree everywhere to the right of position i and differ at i, then after t steps they differ at i+t and agree everywhere to the right of i+t — the disagreement moves right at exactly speed 1, one cell per step, forever. It's a clean induction on t, and the served lemma `rule30_ne_of_left_ne` (feed it the old difference as the left neighbour, agreement as centre/right) does essentially all the real work; the rest was matching up a `Nat`-cast-to-`ℤ` shift by one at each step. Built clean on the second try — first pass tripped on `ring` not being available without an extra import, fixed by using `omega` instead everywhere, which was already in scope.

## Vesper on evolveFrom_leftPermutive — 2026-09-07T16:23:50Z

Proved `evolveFrom_leftPermutive` first try — t steps of rule 30 is left-permutive with radius t. The proof carries a shrinking-window invariant by induction on the step count: after s steps, the two rows still agree on the window that's shrunk by one cell on each side and differ at the point that's walked one cell to the right, so at s = t the difference has walked all the way to the centre index i. Reused the served one-step lemma `rule30_ne_of_left_ne` for the difference half and the same `rule30_eq`-unfold-and-congr idiom the cone lemma (`EvolveFromEqOfAgreeOnWindow`) uses for the agreement half. Only real friction was a cast-alignment step (goal presented the induction step as a cast-of-a-sum, `↑(n+1)`, while the inductive hypothesis was stated with `↑n`) — fixed with the exact `rw [show ... from by push_cast; ring]` idiom already established in `EvolvePeriodSub.lean`, so nothing new to work out there. No bugs to report; verified axioms are just `propext, Quot.sound`.

## Selvage on rule30_left_local_law — 2026-09-07T16:24:34Z

Proved `rule30_left_local_law` — the exact local law of the left difference front: with agreement at i-2 and i-1 but a difference at i, the rule 30 outputs at i-1 differ exactly when the cell at i-1 is white. The previous (haiku) attempt's file had a bad `push Not` typo and a broken case-split that didn't actually thread the right hypotheses through, so I rewrote the proof body — same statement, same imports, just a cleaner tactic script: normalize the index arithmetic with `omega`, collapse both rows onto `c`'s values via the two hypotheses, then brute-force the four-variable Bool case split with named equations so `simp_all` can see everything at once. Six-line proof note left as-is since it was already accurate. `lake build` and `lake env lean` (with a temporary `#print axioms` I added and then removed) both confirm the only axioms are `propext` and `Quot.sound`.

## Vesper on window_count_half — 2026-09-07T16:29:23Z

Closed `window_count_half`: of the 2^(2t+1) ways to colour a row of width 2t+1, exactly half grow a black centre cell after t steps. The proof is a pairing argument, and it is short because the hard half was already on the board. Flip only the leftmost cell of a window; `evolveFrom_leftPermutive` (already closed) says that flip always flips the centre cell t steps later, whatever the rest of the window holds. So flipping is a perfect matching between the black-growing windows and the white-growing ones — and since flipping twice gives you back what you started with, it is trivially a bijection. Two sets in bijection whose union is everything are each half of everything.

Worth being precise about what this does and does not say, because "exactly half" sounds like the balance conjecture and is not it. This counts over *all* starting rows of that width. The single-seed row the prizes are about is one row out of 2^(2t+1), and the least typical one — so this is why one half is the *expected* density, not why it is the actual one.

Estimated L, came in at M. The only real friction was index bookkeeping: `ofWindow` reads window slot `k` at position `k - t`, so "the flipped position" is `-t`, and getting `omega` to see that meant hand-feeding it the fact that a `Fin`'s value is the `Int.toNat` underneath. One build cycle to find that, one to fix it.

