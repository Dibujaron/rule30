## Emmy on centerColumn_black_run_lt_start — 2026-09-11T02:04:23Z

Proved centerColumn_black_run_lt_start. This one really was as clean as the brief said: the alternating-block lemma, applied at the two innermost depths a-1 and a, forces those two cells to have opposite parity of colour — but the left-edge and second-diagonal lemmas already pin both of them black. Two served facts colliding, `omega` for the parity arithmetic, done. No new ground broken; this is bookkeeping around the cone, same band as the rest of P2 so far.

## Marrow on centerColumn_white_run_lt_start — 2026-09-11T02:08:15Z

**A mathematician would call this project-internal, and the node's own disclaimer already said so.** It is a genuine statement about rule 30 rather than about any sequence of bits — the proof leans on the black left edge of the cone and the black diagonal just inside it — but the constant it proves is loose by about a factor of six against what the picture actually does, and it bears on none of the three prizes.

What it says: if the centre column is white at every step from time `a` onwards for `L` more steps, then `L < 3a`. Long white runs cannot start early.

Why that is true, in the picture. While the centre stays white, the cell one place to its left has a one-way door: it can turn black, but it can never turn back. So across the whole run that cell holds a single colour at a time, and whichever colour it holds, everything further left is then forced — white all the way out if the neighbour is white, an exact black-white checkerboard if it is black. Both of those forced pictures eventually run into the edge of the triangle, whose outermost two cells are always black, and a checkerboard cannot have two black cells side by side. The shorter `a` is, the sooner the collision.

The one thing I would point at as a small pleasure rather than a chore: the brief described this as two arguments — an all-white triangle and a checkerboard — and they are the same argument. Writing the forced cell as `v && (position is odd)`, with `v` standing for the neighbour's unknown colour, makes one induction do both jobs. In TypeScript terms that is the move from two near-identical functions to one generic over a parameter: same body, one bit of input, half the code. The other half of the work was choosing where to split the run in two, and the answer — time `2a - 1` — is precisely why the constant comes out as 3 rather than something worse.

I do not think 3 is the truth. Measured, a white run beginning at `a` runs at most about `a/2`. Nothing in this proof explains that gap, and closing it would need a reason the forced picture collides with the cone much earlier than the crude count says.

## Emmy on centerColumnCount_ge_of_pow — 2026-09-11T02:17:50Z

Proved it. This is the fence node the description already told you it was: it says the centre column has at least n black and n white cells among its first 5^n rows, which is real but very weak (the gap to balance is N(1-o(1)) vs the o(N) the prize needs, and per the node's own note nothing built on this family of results can close that gap anyway). Band: project-internal at best. The proof turned out simpler than the brief's sketch suggested — instead of building n disjoint windows and an injective map all at once, a plain induction on n works: each step calls centerColumn_window_not_constant once to get one black witness and one white witness in the new window, and shows each is a "new" element not counted at the previous power of 5. Lost some turns to a strange omega failure composing `apply Finset.range_subset.mpr` with a later `rw`+`omega` — never got to the bottom of it, just worked around it by proving the subset by hand instead — noted in case it bites someone else.

