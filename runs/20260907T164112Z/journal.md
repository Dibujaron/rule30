## Emmy on centerColumnCount_succ — 2026-09-07T16:41:59Z

Landed centerColumnCount_succ: the ℕ twin of centerColumnDensity_succ, extracted as a reusable lemma so the count-side half of every density argument has a single citation point instead of repeating the Finset bookkeeping. Build succeeded, no unusual axioms.

## Marrow on centerColumn_density_tendsto_half_iff_excess — 2026-09-07T16:46:16Z

Closed centerColumn_density_tendsto_half_iff_excess. The key move was finding one identity that holds for every N with no case-split baked into its statement: `(density N - 1/2) * (2N) = 2*count N - N`. It only needs a case split (N=0 vs N>0) inside its own one-line proof, and once you have it, both directions of the iff — and the N=0 edge case that would otherwise bite the "reuse N₀ as the witness" instinct in the backward direction — fall out of it directly. Straightforward once that identity was in hand; the rest was matching Mathlib's strict-`<` epsilon form to the statement's non-strict `≤` one, which just costs an extra ε/2 each way.

## Emmy on centerColumnCount_sandwich — 2026-09-07T16:49:56Z

The file already had a complete proof strategy from the previous (budget-exhausted haiku) attempt — split into monotonicity (subset + card_le_card) and bounded growth (an induction using a one-step "count grows by at most 1" lemma). It just had two small bugs: a redundant `omega` after a `rw` that had already closed its goal, and a stray duplicate `calc` block left dangling outside the `by_cases` split (looked like leftover text from an edit that didn't fully clean up). Deleted both and `lake build` passed. No new proof ideas needed — this was cleanup, not invention.

## Emmy on centerColumn_excess_interpolate — 2026-09-07T16:55:57Z

This one was already done when I got here, and the interesting part is why nobody knew.

Attempt 1 on this node was recorded as `budget_exhausted` — the session ran out of money and was cut off. But it had already written a complete proof to disk. My first action was `lake build`, and it succeeded in four seconds, untouched. So the node has been closed since that session died; what was missing was not a proof but a report. The harness writes the DAG from a worker's final structured report, and a worker killed mid-turn never sends one, so the work was invisible.

That is worth naming because it is the same shape as something already in the project's rules: a cleanup step at the end of a session is fiction, because sessions die more often than they exit cleanly. This is the mirror image — a *result* at the end of a session is fiction for the same reason. The proof survived because it was a file; the claim about the proof did not, because it was a message.

The only real work I did was the English note at the top of the file. It was nine lines against a six-line ceiling and it explained the tactic script, which you have said you will not read. So I rewrote it to say the thing itself: how far the centre column's black count strays from half the window can't move faster than the window does. Widen the window by one cell and the stray moves by exactly one, in one direction or the other — that is the whole theorem, and it is true of any sequence of black and white cells whatsoever. It uses nothing about rule 30, which is the honest and slightly deflating point: this is bookkeeping that makes a future proof's life easier, not evidence about the conjecture.

One Lean thing worth having, since it bit the proof in exactly one line. Subtraction on ℕ is truncated — `3 - 5` is `0`, not `-2` — the way a `Math.max(0, a - b)` is baked into the type. The served count lemma states its bound with `N - M` in ℕ, the theorem wants it in ℤ where subtraction is honest, and the two only agree because `M ≤ N` is a hypothesis. The cast needs that hypothesis handed to it explicitly (`Nat.cast_sub h`); it will not find it. In TypeScript the analogous bug is silent and shows up as a wrong number at runtime. Here it is loud and shows up as a cast that simply refuses to go through, which is the better failure mode of the two — though the seam is that Lean's refusal is total, so you can't ship past it even when you know the hypothesis is available.

