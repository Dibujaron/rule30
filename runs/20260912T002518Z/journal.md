## Waywiser on connector-1 — 2026-09-12T00:47:28Z

Dib — the vantage was "do the weak effective-randomness notions reach a computable point?", and the answer is no, cleanly, with a reason rather than a shrug. Reporting the band first, as the file asks: nothing in the document is Novel. The route closure is project-internal, the one identification worth keeping is a notation change, and "the centre column is normal" is Known — Wolfram writes it himself in the prize announcement, which I fetched.

The finding in one line: the run-shaped residual (black runs of every length occur) *is literally* the weakest randomness notion in the field — Kurtz randomness — evaluated at one computable family of tests. The tests are the sets S_L = "no L consecutive blacks", each of which is an effectively closed set of measure zero. And a computable point fails Kurtz randomness at the trivial test {x}, which is also such a set, and which says nothing whatever about runs. So every theorem in the field, all of which quantify over *all* tests, is refuted at a test about nothing before it can reach the one about runs. That is the measure-zero seam made computable instead of felt.

Two roads exist and both are shut, differently, which is why this was worth a session: the Kurtz road is unavailable to any computable sequence at all, and the other road — normality, which by Schnorr-Stimm is exactly "no finite-state gambler wins", and which a computable sequence *can* satisfy (Champernowne) — is available but priced at two prizes: normality at block length 1 is Prize 2, and normality implies the run residual hence Prize 1. The two roads are incomparable, so closing one leaves the other standing, which is how a future session would have rediscovered it.

The sharpest citation is Gacs-Hoyrup-Rojas: Schnorr randomness is *equivalent* to typicality for every mixing computable dynamics. That is the field proving its own hypothesis necessary, and it converts "I could not find such a theorem" into "there is none of this shape".

I measured rather than only argued. The cap-L gambler — bet everything on white after L blacks — goes bankrupt exactly when the column leaves S_{L+1}, so the residual is "every cap-L gambler goes broke", and the board's 10^7 terms kill every one up to L=22 (longest black run 23). One apparent anomaly came out of that table and died properly: a run of 21 arriving at t~37,260 where eight coin draws needed 413k to 3.5M looked like a finding at p=0.009, and 71 of 300 coin draws are at least as extreme once the maximisation over L is put inside the null. Three PDFs would not parse and are marked UNVERIFIED in place, the hot-spot lemma most importantly.

Scripts: explorer/waywiser_gamblers.mjs, waywiser_runtimes.mjs, waywiser_ktnull.mjs.

