# Sighting — the switch-index sequence over a finite alphabet

**Vantage.** Obstruction 9's residual read as a sequence of integers rather than
bits: symbolic dynamics and combinatorics on words — factor complexity,
Morse–Hedlund, return words, substitutive and automatic sequences, the S-adic
hierarchy.

**Connector.** Groma, 2026-09-10. A sighting, not a proof. Every row below is a
bearing taken from one station, and the entry I care most about getting right
is the seam.

*A convention, because I could not resolve it.* `docs/obstructions.md` numbers
nothing, and the numbers the board uses in prose do not line up with a count of
its headings — "obstruction 6" matches the sixth heading, "obstruction 7" and
"obstruction 9" match the eighth and tenth. So except for **obstruction 9**,
which this brief itself names and which is unambiguous, I cite obstruction
entries by *title* below rather than by number.

**The verdict in one line, and it is the negative the vantage asked for.** The
finite alphabet is real, it is available for the seed as well as for the family,
and it buys **nothing for a proof and one genuinely sharper instrument for a
measurement**: reading integers instead of bits rescales the Morse–Hedlund
count by the mean white-run length and changes nothing else, and every
criterion in combinatorics on words that *concludes* eventual periodicity needs
an upper bound on factor complexity, which no finite computation supplies and
which only a generating mechanism — a substitution, an automaton, an S-adic
directive sequence, a rotation — supplies. Nothing puts the switch indices in
any of those classes: measured, on every bad boundary tried their factor
complexity climbs past every bound those classes impose, and it is still
climbing at the deepest length reached. The sharpest form of the negative is not
mine and is not a measurement: the one mechanism in cellular-automaton theory
that *does* bound a column's complexity from above is a blocking word, and rule
30 has none at any length, because left-permutivity forces its right Lyapunov
exponent to be `1` at every configuration (§3.2, from the held Kůrka notes).
**Band: Project-internal**, closing a route, with one
Project-internal structural identity (§3.1) worth a theorist's hour and one
instrument (§3.5) worth keeping.

---

## 1. The problem, seen from outside

**Without any of this project's vocabulary.** Consider the infinite black-and-
white picture drawn as follows: the top row is white everywhere except one
black cell, and each later row is obtained from the one above by a fixed rule
that colours a cell from the three cells above it (the new cell is the left one
XOR the OR of the middle and right ones). Read down the vertical line through
the original black cell. That gives an infinite sequence of bits. It has been
computed to great depth and every statistic anyone has applied to it says fair
coin. What is
unproved — and is the thing at issue — is that this sequence **never becomes
periodic**: that there is no `p > 0` and no starting row `N` past which the
line simply repeats every `p` rows.

Everything already established may be granted. In particular it is a theorem
here that **no two distinct vertical lines of this picture are both eventually
periodic**. That makes the wall this brief names logically the same statement
as the aperiodicity above; nothing in this document treats it as weaker.

Two further facts, both proved, cut the residual down to a very small object.
Suppose, for contradiction, that the centre line does repeat with period `p`
from row `N` on. Then (i) at every row where the centre line is *black*, the
line one step to the **left** is pinned to the complement of the next centre
cell, so it repeats there for free; and (ii) inside any maximal block of
consecutive rows where the centre line is *white*, the line one step to the
**right** — call it column 1 — is monotone: once it turns black it stays black
for the rest of that block. So column 1 restricted to a white block of length
`L` is the word `0^j 1^{L-j}`, and the block carries **one integer `j` in
`{0, 1, …, L}`**, not a word. The whole unproved remainder is:

> **is the sequence of those integers, one per white block, eventually
> periodic?**

**Restated in the vantage's own terms (symbolic dynamics, combinatorics on
words).** Let `b ∈ {0,1}^ℕ` be eventually periodic with period `p` and not
eventually constant, and let `r ≥ 1` be the number of maximal `0`-runs in one
period of `b`. The `0`-runs of `b` are the *return words* to the letter `1`;
they have bounded length `L_i ≤ p - 1`, and the sequence `(L_i)` is purely
periodic with period `r`. A second sequence `j = (j_i)_{i≥0}` over the finite
alphabet `{0, …, p-1}` is attached, one letter per return word. **The question
is whether `j` is eventually periodic** — equivalently, by Morse–Hedlund,
whether its factor complexity `p_j(n)` is bounded; equivalently, whether
`p_j(n) ≤ n` for a single `n`.

Two translation checks, because this is where a restatement can leak.

*The period is not a side condition.* "`j` eventually periodic with some period
`q`" already gives "`j` eventually periodic with period `lcm(q, r)`", and
`r | lcm(q,r)`, so a shift by `lcm(q,r)` return words is a shift by a *constant*
number of rows. Hence "`j` eventually periodic" and "column 1 repeats in time at
the white rows" are the same statement, with no loss. Equivalently again: the
residual is "**each of the `r` subsequences `(j_{ir+m})_i` is eventually
constant**", i.e. `j` differs from its own shift by `r` in only finitely many
places. Measured, on the one boundary where the good case is visible at
reachable depth: `b = 1010001001` has zero-runs `{1}, {3,4,5}, {7,8}`, so
`r = 3` and `L̄ = 2`; and its switch-index sequence past the onset has factor
complexity exactly `3` at every length to 512 — period exactly `r` — and the
measured mean run length is `2.000` (§3.5, `explorer/groma_defect.mjs`). The
restatement is not just formally right, it is the shape the settled case
actually takes.

*The direction is the whole difficulty, and it is the reverse of the field's.*
Combinatorics on words is overwhelmingly a machine for proving sequences
**aperiodic** — for pushing complexity *up*. Here the residual asks to prove a
sequence **periodic**, i.e. to push complexity *down*. Morse–Hedlund is the only
criterion in *combinatorics on words* that runs that way (there is a second one
next door, in the symbolic dynamics of cellular automata, and §3.2 kills it for
rule 30 by a proved property of the rule), and it needs `p_j(n) ≤ n` for one
`n`, which is an **upper** bound. A finite computation on a prefix produces only
lower bounds on `p_j(n)`. So no amount of measurement, at any depth, can ever
supply the needed half; measurement can only kill the family version, which
obstruction 9 already killed. This is stated here at the top because it is the
single fact that decides the vantage's question.

**One correction to the brief, and it goes the project's way.** The brief says
the finite alphabet "applies to the family `X_b`, NOT to the seed — rule 30's
own centre column has long runs (16 identical cells at `M = 22711`) and nothing
bounds them." That is right about the *unconditional* seed and wrong about the
setting the residual actually lives in. The residual is a conditional whose
hypothesis is "the centre column is `p`-periodic from `N`". Under that
hypothesis a white run beginning at `t ≥ N` of length `≥ p` would make the whole
period white, hence the centre column eventually constant — which
`centerColumn_not_eventually_constant` **forbids, and it is proved**
(`Rule30/Proofs/CenterColumnNotEventuallyConstant.lean`). So under the
hypothesis the seed's own white runs past `N` have length `≤ p - 1` and the
seed's switch indices live in a finite alphabet too. The limitation the brief
names is a limitation on *measurement*, not on the proof setting. (Measured
separately and independently of any hypothesis: the seed's switch indices are
far smaller than its run lengths anyway — see §3.1.)

## 2. Fields sighted

| Field / theory | The object there | The seam, in one line |
|---|---|---|
| Combinatorics on words — Morse–Hedlund | factor complexity `p_j(n)` of the switch-index sequence | the one criterion running in the needed direction needs an **upper** bound on `p_j`, and measurement gives only lower bounds |
| Equicontinuity and blocking words (Kůrka, Thm 4) | a blocking word pins a column's future, and gives column subshifts that are zero-entropy SFTs — an **upper** bound on column complexity, the half the residual needs | rule 30 is left-permutive, so its right Lyapunov exponent is `1` at *every* configuration, so it has no equicontinuous point and no blocking word at any length (§3.2) |
| Return words and derived sequences (Durand) | white runs *are* the return words to the letter `1` in `b`; `j_i` is a derived letter | Durand's conclusion class (primitive substitutive) **contains** the periodic sequences, so finiteness of derived sequences cannot separate periodic from aperiodic |
| Quasi-Sturmian words, `p(n) = n + c` (Coven; Cassaigne) | if `p_j(n) - n` were eventually constant, `j` would be a morphic image of a Sturmian word — a rotation coding | measured `p_j(n) - n` grows: `1,1,1,2,…,12,14,17,20,23` at `n ≤ 24` and `p_j(128) ≥ 39,807` for `b = (10)^∞` |
| Morphic sequences and Pansiot's classification (Devyatov's dichotomy) | every morphic sequence has subword complexity `O(n²)` | measured `p_j(n)/n²` climbs `0.09 → 27.9` over `n = 16 … 256` at `b = (10)^∞`, so the switch indices are not morphic — the sharpest exclusion, because it needs no entropy estimate (§3.5) |
| Three-distance theorem / Beatty sequences | defect gaps of a rotation coding take at most 3 values | the only bad boundary with a real quasi-periodic background, `(10)^∞` (best period 5, 7.1 % off), has **34** distinct defect gaps; the other two have no background to test against (§3.5) |
| Linearly recurrent subshifts, S-adic hierarchy (Durand–Host–Skau) | `p(n) ≤ Kn` plus linear recurrence ⟺ primitive proper S-adic | measured `p_j(n)/n` = 1.4, 2.9, 15.5, 74, 311, 2750 at `n` = 16, 32, 64, 96, 128, 192 — not linear, so no directive sequence exists to look for |
| Automatic and `k`-regular sequences (Cobham, Christol) | `j_i` as a `k`-automatic function of the run index `i` | nothing gives the *run index* a base-`k` digit structure; and this field was already sighted 2026-09-09 |
| Substitution dynamical systems | a substitution generating `j` | the switch index is defined by an orbit, not by a rewriting rule; no candidate substitution exists — this is the negative the brief asked for, stated plainly in §3.2 |
| Trace subshifts of cellular automata (Cervelle–Formenti–Guillon) | the column of a space-time diagram, as a subshift | their theorems are about the trace of *all* configurations; the residual is about **one orbit**, and *Counting the right sides consistent with the centre column* shows this board has conflated the two before |
| Rice-type undecidability for traces (Cervelle–Formenti–Guillon) | "eventually periodic" is a property stable by ultimate coincidence | undecidable in general — so no criterion from the literature can be *checked*; §3.4 |
| First-passage percolation / growth fronts | `j_i` **is** the arrival time at column 1 of the left-moving black front, exactly (§3.1) | already sighted from percolation by Rosetta; what is new here is that it is an identity, not an analogy |
| Renewal / regenerative processes, queueing (Lindley) | the gap `g(t)` decrements under white and resets under black: a sawtooth | the reset is not i.i.d.; it reads the row, and one state of the reset is unbounded |
| Low-complexity 2D configurations, Nivat's conjecture (Kari–Szabados; Cyr–Kra) | the space-time picture as a `ℤ²` configuration with rectangle complexity `P(m,n)` | `P(2,n)` of the seed picture is far above `2n` at every `n` (§4), so no Nivat hypothesis is ever satisfied |
| Rauzy graphs and right-special factors | `p_j(n+1) - p_j(n)` counts windows whose next switch index is undetermined | that count *is* the horizon count of *Counting the right sides consistent with the centre column*, so this is a bridge to the left damage front — but the rates do not match (§3.3) |
| Toeplitz sequences and almost 1-1 extensions of odometers | a periodic skeleton with holes, filled in at the next level — the exact shape of "column 0 periodic, column 1 free at the white times" | the holes here are filled by the CA's own dynamics, not by a periodic pattern at a next level, so no odometer factor exists to build on; and the odometer side was already sighted 2026-09-08 |
| Fine–Wilf and periodicity forcing | two periods on a long enough word force their gcd | needs a length bound relating the two periods, which nothing here supplies |
| Rowland 2006 §1: run lengths at the outer edge of the cone | the same statistic one cone-width away, where it is `a(ord₂(t))` and solved | permutivity holds at the edge and not at the origin; §3.6 |
| Reverse mathematics / `Π⁰₂` classification | "this explicit computable sequence is not eventually periodic" | already sighted 2026-09-09; recorded so the next connector does not re-walk it |

## 3. Connections

### 3.1 The switch index is a first-passage time, and the identity is exact

**The claim.** The switch-index sequence is not a new object: it is the
*leftmost-black-gap* process sampled at the starts of white runs, and the
correspondence is an equality, not an analogy —

> `j_i = min(L_i, g(s_i) - 1)`, where `s_i` is the first row of white run `i`,
> `L_i` its length, and `g(t) = min { x ≥ 1 : cell(t, x) = black }`.

**Why it should be true (a bearing, not a proof).** While the centre column is
white, the cell immediately left of the leftmost black in `x ≥ 1` is white, and
rule 30 sends `…001…` to `…01…`: a black cell with white to its left steps one
place left every row. So during a white run the leftmost black walks left at
speed exactly 1 and arrives at column 1 after `g - 1` rows — or the run ends
first, and the switch index is capped at `L`.

**The dictionary.**

| This project | Over there (symbolic dynamics / first-passage) | Seam |
|---|---|---|
| the row of cells | the state of a leftward growth process | the row is infinite; only its leftmost black in `x ≥ 1` is read |
| the picture | the space-time diagram of that process | — |
| the centre column `b` | the *driving* sequence: `0` lets the front advance, `1` resets it | exact; this is the whole coupling |
| maximal white run of `b`, length `L_i` | a return word to the letter `1`; an excursion of length `L_i` | exact |
| the switch index `j_i` | the first-passage time of the front into column 1 during excursion `i`, capped at `L_i` | **exact, 0 failures in 350,000+ runs** |
| the gap `g(t)` | the front position | `g` is only defined where a black exists in `x ≥ 1`; for `X_b` with an all-white right half there is always one after row 1 |
| column 1 on the run | `0^{j} 1^{L-j}` | this is `white_run_monotone`, already kernel-proved |
| the residual | "the first-passage sequence is eventually periodic" | exact |
| left diagonals, their power-of-two periods | *nothing* | the front lives in the transient band; the diagonals do not reach it (*The diagonal structure never reaches the centre column*) |
| the seam between settled region and transient band | *nothing* | wrong side of the picture entirely |
| the black-time law at the origin | the reset event | exact: `centerColumn_succ_of_black` is the reset |
| the damage front | a *different* front — the left edge of `picture XOR settled` | do not confuse them: that one runs at `0.24`, this one at exactly `1` while it runs at all |

**What it leans on.** No outside source: rule 30's own local law, plus my
measurement. `explorer/groma_switch.mjs`, engine cross-checked cell-by-cell
against a naive unpacked simulation with no shared code (0 of 2,700 and 0 of
10,800 mismatches), and the seed's centre column printed as
`110111001100010110010011` as an orientation guard — the mirror rule 86 passes
every symmetric check, so this one is worth doing. That prefix agrees with the
published one:

> "central column given by 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, … (OEIS
> A051023)" — <https://mathworld.wolfram.com/Rule30.html>

(`https://oeis.org/A051023` itself returned HTTP 403 to the fetcher, so the
A-number is quoted at one remove.) Then,
at `T = 60,000` for eighteen periodic boundaries and `T = 400,000` for the seed:
**`idFail = 0` on all 350,000+ runs, `monoFail = 0` throughout.**

**A companion that came out of the same measurement, and it is the induction
step.** The gap obeys a four-case rule with one hole:

| state at row `t` | `g(t+1)` |
|---|---|
| centre white, `g ≥ 2` | `g - 1` |
| centre white, `g = 1` | `1` |
| centre black, `g ≥ 3` | `1` |
| centre black, `g = 2` | `2` |
| centre black, `g = 1` | *not determined by `(colour, g)`* |

Measured over 200,000 rows each of `X_{(10)^∞}`, `X_{01011}`, `X_{1 0^8}` and the
seed: **0 mispredictions outside the fifth state, in all four**
(`explorer/groma_class.mjs`, test A). The first two rows are exactly what the
identity needs.

**And that table is kernel-checked, against the board's own model rather than
against my JavaScript.** `explorer/groma_scratch_gap.lean` defines `gapAt` from
`rowCell` and checks the four-case rule by `decide` over `t < 60`; accepted by
`lake env lean`, together with two guards — a check that the escape state
actually occurs in that range, so the result is not vacuous, and a mutant rule
with the decrement removed, which the same `decide` rejects. The file also
prints the model's own centre column for `t < 24` as
`1,1,0,1,1,1,0,0,1,1,0,0,0,1,0,1,1,0,0,1,0,0,1,1`, agreeing cell for cell with
the JavaScript engine and with MathWorld's listing. So three independent
implementations — bit-packed JS, naive JS, and Lean's `rowNat` — agree on
everything this section rests on.

**The test.** A theorist should try to falsify
`switch_index_eq_gap : ∀ t, centerColumn t = false → centerColumn (t-1) = true →
(the first white-to-black switch of column 1 in this run) = min(L, g t - 1)`.
It should fall to the same one-step argument as `white_run_monotone` plus an
induction on the run, using `rule30_left_local_law`. If it does not, the
identity is wrong and this section is worthless.

**What it would give.** Two things, both small and both real. First, a **much
sharper alphabet bound**: the alphabet is `{0, …, min(L_max, g_max) }`, and the
gap is tiny where the run length is not — measured on the seed to 400,000 rows,
run lengths reach 19 but switch indices reach only **9**, with a geometric
histogram `0:25255 1:56073 2:14086 3:3520 4:855 5:211 6:51 7:9 8:5 9:1` (ratio
about `1/4`) and new maxima `j = 1,2,3,4,6,7,8,9` first reached at rows
`2, 6, 104, 156, 442, 5808, 101063, 296406`. Read as `j_max ≈ log_4 t` that fits
the last three points (`log_4` of those rows is `6.3, 8.3, 9.1`) and overshoots
the early ones; **it is a reading of eight data points and not a law**, and the
tail ratio of `1/4` is explained in §6 rather than mysterious. Second, it says
what the residual *is about*: not
column 1, but **the position of the leftmost black cell right of the origin at
the moments the centre column goes white**. That is a statement about the near
field of the picture, which is where this board's other routes all say the
answer must live. It touches the residual's core and leaves everything else.

### 3.2 The finite alphabet is a coarse-graining with compression ratio one

**The claim.** Reading the residual over a finite alphabet of integers instead
of over bits is a change of units and nothing more: `p_j(n)` and the bit
complexity `p_w(m)` of column 1 at the white times satisfy
`p_j(n) ≈ p_w(n · L̄) / L̄` with `L̄` the mean white-run length, so every
Morse–Hedlund measurement made in one reading is the same measurement made in
the other, at a shifted length. **And on the boundaries where the residual is
hard, `L̄ = 1` and the two readings are literally the same sequence.**

**The dictionary.**

| This project | Over there | Seam |
|---|---|---|
| column 1 read at the white times | the bit sequence `w` | the object obstruction 9 names |
| the switch-index sequence | the *derived* sequence `j`, one letter per return word | a bijective recoding of `w`, block by block |
| a factor of `j` of length `n` | a factor of `w` of length `n·L̄`, at a run boundary | the alignment is the `1/L̄`: `j` sees only the `L̄`-th positions |
| `p_j(n) ≤ n` for some `n` (Morse–Hedlund on `j`) | `p_w(m)` bounded | equivalent, by the `lcm` step in §1 |
| finite alphabet, size `≤ p` | finite alphabet | real, and it is what makes Morse–Hedlund applicable at all |
| depth in rows | length in letters | one letter per `L̄ + 1` rows: `10^6` rows is `5·10^5` letters for `b = (10)^∞`, `1.1·10^5` for `b = 1 0^8` |

**What it leans on.** Morse–Hedlund, fetched:

> "A celebrated result of Morse and Hedlund, stated in 1938, asserts that a
> sequence `x` over a finite alphabet is ultimately periodic if and only if, for
> some `n`, the number of different factors of length `n` appearing in `x` is
> less than `n+1`."
> — <https://arxiv.org/abs/1109.5801>

and the same in the bounded-complexity form:

> "Hedlund and Morse showed that a word is eventually periodic if and only if
> its factor complexity is bounded."
> — <https://ar5iv.labs.arxiv.org/html/1808.05400>

**A correction to my own claim, and it is the most useful thing in this
section.** I wrote in §1 that Morse–Hedlund is the *only* criterion in the
subject running in the needed direction. That is right about combinatorics on
words and wrong about symbolic dynamics of cellular automata, where there is a
second one and it is the natural one to reach for: **equicontinuity, via
blocking words.** From the held source `sources/kurka-topological-dynamics-1d-ca.txt`:

> "**Definition 3** A word `u ∈ A⁺` with `|u| ≥ s ≥ 0` is `s`-blocking for a CA
> `(A^ℤ, F)`, if there exists an offset `k ∈ [0, |u| − s]` such that
> `∀x, y ∈ [u]₀, ∀n ≥ 0, Fⁿ(x)[k, k+s) = Fⁿ(y)[k, k+s)`." (line 296)
>
> "**Theorem 4** (Kůrka) … The following conditions are equivalent. (1)
> `(A^ℤ, F)` is not sensitive. (2) `(A^ℤ, F)` has an `r`-blocking word. (3)
> `E_F` is residual … (4) `E_F ≠ ∅`." (line 305)

A blocking word is exactly a device that pins a column's future, and the
example rules Kůrka works through show what it buys: for the almost
equicontinuous ECA128, "Each column subshift `Σ_k(F)` is an SFT with zero
entropy" (line 884). That is an *upper* bound on column complexity, which is the
half the residual needs.

**And it is dead for rule 30, by a proved property of the rule and not by a
measurement.** Kůrka (line 431): "If `x ∈ E_F`, then `λ⁺_F(x) = λ⁻_F(x) = 0`.
… If `F` is left-permutive with `m < 0`, then `λ⁺_F(x) = −m` for every
`x ∈ A^ℤ`." Rule 30 is left-permutive with radius 1 — `rule30_leftPermutive` is
proved on this board, and Rowan's 2026-09-08 correction settled that it is
**left** and not right — so `λ⁺_F(x) = 1` for *every* configuration, hence
`E_F = ∅`, hence by Theorem 4 rule 30 is sensitive and has **no blocking word at
any length**. So the one mechanism in cellular-automaton theory that produces
upper bounds on column complexity is unavailable here for the same reason the
centre column is interesting in the first place. *(Each link in that chain is a
quoted sentence from Kůrka or a closed node on this board; the chaining is mine,
so a theorist should check the two conventions line up — in particular that
Kůrka's memory `m` is `−1` for a radius-1 rule, which is what makes `−m = 1`.)*

**The test, run.** `explorer/groma_complex.mjs`, `explorer/groma_class.mjs`
(test B) and `explorer/groma_nivat.mjs` (test B′). Complexity measured on the
second half of each run. The quantity printed is
`p_j(n) · L̄ / p_w(n·L̄)`, which the claim says should be `1`.

| `b` | `L̄` | `n = 2` | `n = 4` | `n = 8` | `n = 16` | `n = 32` | `n = 64` |
|---|---|---|---|---|---|---|---|
| `(10)^∞` | 1.000 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |
| `01011` | 1.000 | — | — | 1.00 | 1.00 | 1.00 | 1.00 |
| `10010` | 1.500 | — | — | 0.99 | 0.98 | 0.98 | 0.99 |
| `1010001001` | 2.000 | 1.71 | 1.28 | 0.98 | 0.99 | — | — |
| `1 0^8` | 8.000 | 0.92 | 0.89 | 0.90 | 0.96 | — | — |

**The law holds at every length and every boundary tried**, to within 10 % once
`n` is past the alphabet's own scale. The first two rows are the sharp case:
`L̄ = 1`, so `p_j = p_w` letter for letter — the "integer sequence" *is* the bit
sequence, relabelled. And `L̄ = 1` is not an unlucky choice: it is what the two
most-cited bad boundaries on this board have — obstruction 9's `(10)^∞`, and
every one of the five phase traces `01011, 01101, 10101, 10110, 11010` of the
size-5 ring that Talus's classification entry ends on, all of which have maximum
white run exactly 1 (`explorer/groma_switch.mjs`, `Lmax=1` on all six). It is
*not* universal: `b = 1 0^8` is bad too and has `L̄ = 8`. The last row is the
sharp case the other way: at `b = 1 0^8` one
integer letter absorbs eight bits and the ratio is still `0.9`. **The two
effects — a shorter sequence and a larger per-letter complexity — cancel.**

**What it would give if it held.** It holds, and what it gives is a closed
route: it says a session spent measuring `p_j` is a session spent measuring
`p_w` with the axis relabelled. The one thing it does *not* close is §3.5.

### 3.3 Right-special factors are the board's own horizon count

**The claim.** `p_j(n+1) - p_j(n)` counts (with multiplicity) the length-`n`
windows of the switch-index sequence that admit more than one continuation, and
by §3.1 a window of `n` runs admits two continuations exactly when two rows
agreeing on that window's worth of near-field data disagree about the leftmost
black at the next run start. That is the same count the obstruction *Counting
the right sides consistent with the centre column* measured as
"the number of distinct column words realisable by some window white on
`x ≤ -1`", so **the growth of the switch-index complexity is the growth of the
horizon, and nothing bounds a horizon.**

**The dictionary.**

| This project | Over there | Seam |
|---|---|---|
| a window of the picture, width `k` | a cylinder of the subshift | — |
| a cell at distance `k` invisible at the origin for `≈ 4k` rows | the future of a length-`n` factor is undetermined | the constant `4` is a measured front speed, not a theorem |
| right-special factor of `j` of length `n` | a window with two futures | exact by definition |
| `p_j(n+1) - p_j(n)` | number of right-special factors, with multiplicity | exact (binary alphabet); with a larger alphabet it counts extensions minus one |
| the left damage front, speed `0.24` | the rate at which the horizon recedes | **the rates do not match** — see below |

**What it leans on.** That obstruction entry and its measured `2^{0.24 t}`,
and my own complexity numbers. No outside citation; the correspondence is
definitional.

**The test, run, and it half-failed.** The right-special count is directly
readable as the first difference of `p_j`. Measured at `b = (10)^∞`
(`explorer/groma_class.mjs`, test B, `T = 10^6`), for `n = 1 … 60`:

```
1,1,2,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,3,3,4,4,4,4,4,5,5,5,7,7,
8,8,8,8,8,9,10,10,12,12,13,13,13,15,15,16,19,19,23,23,24,25,25,30,31,32,35,35,41,41
```

— a single right-special factor at every length up to `n = 10`, which is the
signature of a nearly-Sturmian word, and then a slow climb. At `b = 01011` the
same differences start `2,3,4,5,8,11,16,22,27,31,39,46,56,70,84,96` and reach
1,130 by `n = 60`. The growth of `p_j` is `0.078`–`0.089` bits per letter at
`b = (10)^∞` (from the deep run: `p_j(64) = 995`, `p_j(96) = 7,090`,
`p_j(128) = 39,807`, over `2.5·10^6` letters, all far below saturation), and the
increments are *still falling* at the deepest length measured, so that figure is
an upper bound on an entropy rate, not an estimate of one. Two rows per letter
and a front speed of `0.24`
would predict about `0.48` bits per letter — **six times too big**. So the
correspondence is structural and not quantitative, and I mark it as a *reading*
rather than a measurement: the objects are the same kind of object, and the
numbers say the horizon is not the only thing throttling the complexity.

**What it would give.** If the rates could be reconciled it would put the
switch-index complexity and the left-front speed in one equation, which is the
quantity `crystals` A3 says cannot be bounded — so it would convert this
residual into the front problem the board already has, rather than into a new
one. That is worth knowing before anyone spends a session hoping the finite
alphabet dodges the front.

### 3.4 Rice's theorem for traces: no criterion from this literature can be *checked*

**The claim.** The vantage asks whether there is "any criterion that could be
checked". There is a theorem saying there is no *general* one: every non-trivial
property of a cellular automaton's trace subshift that is stable by ultimate
coincidence is undecidable, and "every column of this automaton is eventually
periodic" is exactly such a property. So any route through a criterion that
reads the rule number and returns a verdict is a route through an undecidable
predicate, and every proof must be rule-30-specific.

**The dictionary.**

| This project | Over there | Seam |
|---|---|---|
| the centre column | the *trace* of the automaton at one cell | their trace is the set of columns over **all** configurations; ours is one orbit |
| column 1, column `j` | the width-`k` trace | same seam |
| "every column of this automaton is eventually periodic" | a non-trivial property of the trace **subshift**, stable by ultimate coincidence | exact, and undecidable by Theorem 5.10 |
| "*the centre column of the single seed* is eventually periodic" | not a property of the subshift at all | **the seam**: their theorem quantifies over configurations, the residual fixes one |
| the residual (§1, "finitely many changes per residue class") | ultimate coincidence with a periodic sequence | exact as a notion, and it is why this is the right theorem to look at |
| rule 30 | one specific CA | undecidability of a class says nothing about one member — this is the seam that matters |

**What it leans on.** Fetched:

> "The trace subshift of a cellular automaton is the subshift of all possible
> columns that may appear in a space-time diagram." … "The trace subshift of a
> CA `F` is `τ(F) = T_F(A^ℤ)`. It is a factor subshift of `(A^ℤ, F)`, since
> `T_F` is continuous and commutes with `σ`."
> — Cervelle, Formenti, Guillon, *Sofic trace subshift of a cellular
> automaton*, <https://arxiv.org/html/math/0703241>

> "In this paper we study the ultimate trace of CA and partial CA (a CA
> restricted to a particular subshift). The ultimate trace is the trace observed
> after a long time run of the CA. We give sufficient conditions for a set of
> infinite words to be the trace of some CA and prove **the undecidability of
> all properties over traces that are stable by ultimate coincidence**."
> — Cervelle, Formenti, Guillon, *Ultimate traces of cellular automata*,
> <https://arxiv.org/abs/1001.0251> (emphasis mine)

and the definition and the theorem's own hypotheses, so that the seam is
visible rather than assumed:

> "A property `𝒫` over subshifts is *stable by ultimate coincidence* if for any
> subshifts `Σ` and `Γ` which ultimately coincide, we have `Σ ∈ 𝒫 ⟺ Γ ∈ 𝒫`" —
> and Theorem 5.10 requires in addition that the property "holds for some CA
> traces on binary alphabet but not all of them".
> — <https://ar5iv.labs.arxiv.org/html/1001.0251>

So the theorem is about a property of the whole trace **subshift**, not of one
column of one configuration, and it needs non-triviality, which "all columns are
eventually periodic" has (the identity automaton satisfies it; rule 30 does
not).

**The test.** The statement a theorist should try to falsify is the seam, not
the theorem: *"there is a decidable sufficient condition on an elementary CA
rule number and an initial row under which the centre column is provably not
eventually periodic, and rule 30 with the single seed satisfies it."* If that
can be exhibited, the undecidability above is irrelevant here and this section
is wrong. I expect it cannot, and the value of the section is that it says so
before a session is spent looking.

**What it would give.** Nothing toward the residual. It closes a *strategy* —
"read the criteria off the literature and check one" — which is precisely what
the brief asked me to adjudicate, and the answer is that the literature's
criteria are undecidable as a class and unusable as a class.

### 3.5 Every low-complexity structure class is excluded, and the counts that say otherwise are window artifacts

**The claim.** The bad boundaries' switch-index sequences look, at accessible
window lengths, exactly like members of the field's structure classes — linear
complexity, quasi-Sturmian, S-adic — and are none of them: the low counts at
`n ≈ 32` are a measurement of the window, and the crossover length is
`1/(defect density)`. The instrument that survives is the *opposite* one: over
the integer alphabet, a *settled* boundary shows `p_j(n)` flat at a small
constant for hundreds of lengths, which is a far crisper "it has settled"
verdict than any bit-level factor count this board has used.

**The dictionary.**

| This project | Over there | Seam |
|---|---|---|
| a quasi-periodic picture with sparse defects (obstruction 9) | a periodic background punctured at a defect set | exact, and the defect density `ρ` is the only parameter that matters |
| `p_j(n)` at `n ≪ 1/ρ` | linear complexity `≈ cn` | **an artifact**: windows see at most one defect |
| `p_j(n)` at `n ≫ 1/ρ` | growth past every polynomial the structure classes allow | the true regime; whether the entropy is positive in the limit is *not* settled here |
| defect gaps | return times of a rotation to an interval | the three-distance theorem allows at most 3 values |
| "`b` is good" (column 1 eventually periodic) | `p_j(n)` eventually constant | exact — Morse–Hedlund again, in its usable half |
| Talus's `10^6`-row calibration | "a low but growing factor count means *has not settled yet*" | the same statement; `1/ρ` is the number that makes it quantitative |

**What it leans on.** For the structure classes, fetched:

> "there are integers `c` and `N₀` such that `p_u(n) = n+c` for `n ≥ N₀`" …
> "Cassaigne showed that a quasi-Sturmian word is an image of a Sturmian word by
> a non-periodic morphism"
> — <https://ar5iv.labs.arxiv.org/html/1808.05400>

> "**Proposition 1.1.** The subshift `(X,T)` is LR if and only if it is a
> primitive and proper `S`-adic subshift." … a sequence is linearly recurrent
> with constant `K` if it is uniformly recurrent and "for all `u` having an
> occurrence in `x` and all return words `w` to `u` in `x` we have `|w| ≤ K|u|`"
> — Durand, *Corrigendum and addendum to 'Linearly recurrent subshifts have a
> finite number of non-periodic factors'*, <https://arxiv.org/html/0808.0868>

> "We prove that a sequence is primitive substitutive if and only if the set of
> its derived sequences is finite; we defined these sequences here."
> — Durand, *A characterization of substitutive sequences using return words*,
> <https://arxiv.org/abs/0807.3322>

**The test, run.** `explorer/groma_defect.mjs`, `T = 2·10^6` rows, complexity on
the second half. (The `(10)^∞` row is superseded by the deeper run at the end of
this section, which raises `p_j(64)` and `p_j(128)` by 19 % and 51 %; every
entry here is a lower bound.)

| `b` | `p_j(16)` | `p_j(32)` | `p_j(64)` | `p_j(128)` | `p_j/n` at 128 | best background | distinct defect gaps |
|---|---|---|---|---|---|---|---|
| `(10)^∞` | 23 | 92 | 837 | 26,288 | 205 | `q = 5`, 7.1 % off | **34** (a rotation allows 3) |
| `01011` | 429 | 4,268 | 46,322 | 224,524 | 1,754 | `q = 8`, 17.8 % off | 54 — but no real background |
| `1 0^8` | 2,647 | 49,213 | (sat.) | (sat.) | — | `q = 1`, 26.1 % off | 35 — but no real background |
| `1010001001` | 3 | 3 | 3 | 3 | 0.02 | `q = 3`, **0.000 % off** | 0 — it is exactly periodic |

Every class dies on these numbers.

*Not quasi-Sturmian:* `p_j(n) - n` grows — `1,1,1,2,2,2,2,2,2,2,2,3,4,5,6,7,8,9,
10,12,14,17,20,23` for `n = 1…24` at `b = (10)^∞`, and `p_j(128) ≥ 39,807`.

*Not linearly recurrent, so no S-adic directive sequence to look for:*
`p_j(n)/n` runs `1.4, 2.9, 15.5, 74, 311, 2750` at `n = 16, 32, 64, 96, 128, 192`.

*Not morphic, and this is the sharpest exclusion because it needs only
polynomial growth and no entropy estimate.* Devyatov's dichotomy —

> "We study structure of pure morphic and morphic sequences and prove the
> following result: the subword complexity of arbitrary morphic sequence is
> either `Θ(n^(1+1/k))` for some `k ∈ ℕ`, or is `O(n log n)`."
> — <https://arxiv.org/abs/1502.02310>

— caps every morphic sequence at `O(n²)`. Measured at `b = (10)^∞`, `p_j(n)/n²`
runs `0.09, 0.09, 0.24, 0.77, 2.43, 14.3, 27.9` over `n = 16, 32, 64, 96, 128,
192, 256` (the deep run at the end of this section); at `b = 01011` it runs
`1.7, 4.2, 11.3`. **Stated as this board has learned to state such things:
`O(n²)` is asymptotic, so exceeding `n²` at one length refutes nothing, and a
growth trend is not a law — what the numbers give is that the ratio is climbing
steeply, over four octaves of `n`, exactly where a morphic sequence's would have
to flatten.** That was the one deep computation I would have asked for; it is
`explorer/groma_deep.mjs`, it took 21 minutes (the engine is quadratic in the
depth, so `10^8` rows is a day and not an afternoon), and it ran.

*And not a rotation coding — but read this one with the caveat attached.* The
three-distance test needs a quasi-periodic background to measure defects
against, and only `b = (10)^∞` supplied one worth the name: best period `q = 5`
at a **7.1 %** disagreement rate, and there the 35,510 defect positions have
**34 distinct gaps** where a rotation allows three. For `b = 01011` the best fit
was `q = 8` at **17.8 %**, and for `b = 1 0^8` it was `q = 1` at **26.1 %** —
those are not backgrounds, they are the absence of one, so their "54 and 35
distinct gaps" measure nothing and the rows below fail the test vacuously. The
honest version of this bullet is: **the one bad boundary with a genuine
quasi-periodic background fails the rotation signature decisively, and the other
two have no background to test.** I had written all three as evidence before
looking at the fit quality.

**The artifact, in numbers, because it is the transferable half.** At
`b = 1 0^8` the *bit* sequence (column 1 at the white times) has first
differences `6,6,7,7,7,7,7,6,6,6,6,6,6,6,6` over `n = 9…24` — flat, `p_w(n) ≈
6n + c`, textbook linear complexity — and then `p_w(32) = 206`, `p_w(40) = 330`,
and the second difference has turned positive. Anyone measuring to `n = 30` and
stopping would report a structure class and be wrong. **The crossover is at the
defect spacing, and the defect spacing is the only thing to measure first.**

**The instrument that survives, and it is the one thing the integer reading
genuinely buys.** `b = 1010001001` is Talus's calibration word — bad at `10^6`
rows with 525 factors of length 32, good at `2.5·10^6` with onset 798,077. Read
as a switch-index sequence on the rows `10^6 … 2·10^6` it gives
**`p_j(n) = 3` for every `n` from 1 to 512, over 300,000 letters, with zero
defects against a period-3 background.** That is not a "low but growing count";
it is Morse–Hedlund's hypothesis visibly satisfied, flat from `n = 1` to
`n = 512`. The same word measured *before* its onset, on the second half of a
400,000-row run, gives `p_j(2) = 12, p_j(4) = 37, p_j(8) = 124, p_j(16) = 447` —
climbing, no flat stretch anywhere (`explorer/groma_nivat.mjs`, test B′). So the
instrument separates the two regimes cleanly on the same boundary, which the
bit-level count did not: Talus correctly refused to read "525 factors of length
32" either way. **Recommendation: any future goodness sweep should report
`p_j(n)` for `n` up to a few hundred on the last half of the run, and call a
boundary good only on a flat stretch spanning at least two octaves of `n`, not
on a factor count at one length over the whole run.**

**What it would give.** Not a proof and no part of the residual: `X_b` is not
the seed, and obstruction 9 and Talus's classification entry already say the
family statement is false and the good set has no known criterion. What it gives
is a cheaper and much less deceivable instrument for the sweeps that this board
has already run twice and mis-read twice.

**The deep run, and it landed.** `b = (10)^∞`, `T = 10^7` rows, `5·10^6`
letters, complexity measured on the last `2.5·10^6`, windows packed 16 bits per
code unit so that `n = 512` is affordable (`explorer/groma_deep.mjs`, 1,270 s):

| `n` | `p_j(n)` | `p_j/n` | `p_j/n²` | fraction of positions distinct |
|---|---|---|---|---|
| 16 | 23 | 1.4 | 0.090 | 0.00 % |
| 32 | 92 | 2.9 | 0.090 | 0.00 % |
| 64 | 995 | 15.5 | 0.243 | 0.04 % |
| 96 | 7,090 | 73.9 | 0.769 | 0.28 % |
| 128 | 39,807 | 311.0 | 2.430 | 1.59 % |
| 192 | 527,980 | 2,749.9 | 14.322 | 21.1 % |
| 256 | 1,828,392 | 7,142.2 | 27.899 | 73.1 % |
| 384 | 2,494,883 | — | — | 99.80 % — **saturated** |
| 512 | 2,499,489 | — | — | 99.98 % — **saturated** |

Every entry is a *lower* bound on the true factor complexity, which is the
direction that matters for excluding `O(n²)`, so the sample-limited rows at
`n = 192, 256` are still usable and only the last two are worthless.
**`p_j(n)/n²` climbs `0.09, 0.09, 0.24, 0.77, 2.43, 14.3, 27.9` over
`n = 16 … 256`** — over four octaves now, not two — where a morphic sequence's
would be bounded. `p_j(n)/n` climbs `1.4, 2.9, 15.5, 74, 311, 2750` over the
same range, so linear recurrence is gone by a wide margin as well.

**And the deep run corrects the shallow one.** At `T = 2·10^6` I measured
`p_j(64) = 837` and `p_j(128) = 26,288`; the true values are at least `995` and
`39,807`. Those earlier numbers were themselves sample-limited and **low by
19 % and 51 %** — a reminder, in this document's own data, that a
distinct-factor count on a finite window is a lower bound and gets larger when
you look longer. Every complexity figure quoted anywhere above should be read
that way.

**Depth, since the brief asks.** For a *bad* verdict, Talus's calibration stands
unchanged and this document does not improve it: `1010001001` was bad-looking at
`10^6` rows and settled at `798,077`, so **no bad verdict below `10^6` rows is
worth anything**, and the right protocol is to require the complexity profile
flat over `n ≤ 512` on the second half of a run of at least `3·10^6` rows before
calling a boundary good, and to require `p_j(n)/n` increasing over two octaves
of `n` before calling one bad. For a measurement bearing on the *seed*, there is
no depth that helps at all, for the reason in §1: the hypothesis is
counterfactual, so there is nothing to measure.

### 3.6 The same statistic at the other edge is a solved theorem, and the reason it is solved says where this one lives

**The claim.** After §3.1 the residual is about `g(t)`, a **gap read off each row
at a fixed distance from the origin**. Rowland 2006 studies exactly that kind of
object — a run length read off each row — at the *outer edge of the cone*, and
there it is completely solved: it is a function of the 2-adic valuation of the
row index alone. So this sighting's object is the origin-side twin of a solved
one, and the property that solves the edge version, permutivity, is exactly the
property the origin does not have.

**The dictionary.**

| This project | Rowland 2006 §1 | Seam |
|---|---|---|
| row `t` of the picture | row `t-1` of rule 86 (the mirror) | the mirror is a relabelling; Rowan's 2026-09-08 correction applies — rule 30 is **left**-permutive, so rule 86 is right-bijective, which is what Rowland's argument uses |
| the maximal black run at the right edge of row `t` | `ℓ(t+1)`, "the length of the maximal leftmost sequence of consecutive black cells in row `t-1` of rule 86" | exact; verified below |
| that run length as a function of `t` | `ℓ(t) = a(ord₂(t))`, `a` strictly increasing | **a theorem**, and it makes the edge statistic completely determined |
| `g(t)`, the gap from the origin to the first black on the right | *nothing* | there is no analogue: the origin sits inside the cone, where the recurrence is not bijective in the direction that would give one |
| the switch-index sequence | *nothing* | it is `g` sampled at the white-run starts |
| the residual | "`g` sampled at the white-run starts is eventually periodic" | the whole open question, one cell in from a solved one |

**What it leans on.** From the held source
`sources/rowland-2006-local-nested-structure.txt`, lines 107–122:

> "Let `ℓ(t)` be the length of the maximal leftmost sequence of consecutive
> black cells in row `t-1` of rule 86. The sequence `ℓ(t)` … begins
> `1, 3, 1, 4, 1, 3, 1, 6, 1, 3, 1, 4, 1, 3, 1, 7,` … and is nonperiodic. It
> follows by right bijectivity that `ℓ(t) = a(ord₂(t))` for some (strictly)
> increasing sequence `a(n)`" — and (line 128) "The values of `a(n)` for
> `0 ≤ n ≤ 40` are `1, 3, 4, 6, 7, 9, 15, 16, 24, 25, 27, 29, 34, …`"

**The test, run, and it is also this document's strongest engine validation.**
`explorer/groma_rowland.mjs` computes both statistics from the seed picture to
400,000 rows. The edge statistic reproduces Rowland's printed values **exactly**
— `1, 3, 1, 4, 1, 3, 1, 6, 1, 3, 1, 4, 1, 3, 1, 7` for `t = 1…16`, and
`a(0…12) = 1, 3, 4, 6, 7, 9, 15, 16, 24, 25, 27, 29, 34`, matching the paper term
for term — and "`ℓ(t)` is a function of `ord₂(t)`" holds with **0 violations over
`t < 400,000`**. (My first run of this control *failed*, because I read `ℓ(t)`
off row `t` instead of row `t-1`; the failure is recorded here because a control
that fails silently is this project's named failure mode, and this one did not
fail silently only because Rowland printed his first sixteen terms.) The origin
statistic then fails every version of the same test: conditioned on `ord₂(t)`,
on `ord₂(t+1)`, on `t mod 8` and on `t mod 64`, `g(t)` takes up to 17 distinct
values per class and the purest class is 49.7 % one value. **`g` is not a
function of any 2-adic statistic of the row index.** Its unconditional law is
geometric to four decimals: `P(g = k) = 0.4999, 0.2495, 0.1254, 0.0630, 0.0314,
0.0156, …` — exactly `2^{-k}`, which is what a fair-coin row gives.

**What it would give.** Nothing directly; it is a bearing, and its value is
negative and orienting. It says the residual is not a *new* kind of question —
the same statistic one cone-width away is a theorem — and that the ingredient
that closes it there is permutivity at an edge, which is the ingredient this
board has repeatedly found the origin does not have (*The diagonal structure
never reaches the centre column*: the centre
column is index zero of every diagonal it belongs to; *Unbounded right-diagonal
periods do not force an aperiodic centre column*: on both
edges the centre column is the quantity the structure does not determine). A
theorist tempted by the `ord₂` shape of Rowland's answer should know the shape
does not survive one cell inward.

## 4. Died in translation

- **Quasi-Sturmian / rotation model for the bad boundaries.** Obstruction 9's
  "48 distinct factors of length 32" made a `p(n) = n + c` reading look live,
  which would have given a rotation model and an irrationality mechanism. Died
  on `p_j(n) - n` growing to 23 by `n = 24` and to 26,160 by `n = 128`, and on
  the three-distance test at `(10)^∞`: 34 distinct defect gaps where a rotation
  allows 3.
- **My own first reading of that three-distance test.** I recorded "34, 54 and
  35 distinct gaps" across three boundaries as three pieces of evidence. Two of
  them are not evidence: the best background fit for `01011` is 17.8 % wrong and
  for `1 0^8` is 26.1 % wrong, so there is no background and the "gaps" are
  gaps between disagreements with an arbitrary period. Only `(10)^∞` (7.1 %)
  supports the test at all. Caught by reading the fit quality I had already
  printed and not looked at — this project's named failure mode, twice in one
  document.
- **Durand's derived-sequence criterion.** "Finitely many derived sequences ⟺
  primitive substitutive" is exactly the shape of the switch-index construction.
  Died on the class boundary: periodic sequences *are* primitive substitutive,
  so the criterion cannot separate the two sides of the residual, in either
  direction.
- **Kac's lemma / induced systems / Kakutani towers.** The white times are an
  induced system and the switch index a function on the tower. Died for want of
  a measure: the residual is about one orbit of one configuration, and every
  theorem in that field is about a generic point of an invariant measure.
- **Nivat's conjecture and low-complexity 2D configurations.** The picture is a
  `ℤ²` object and `P(2,n) ≤ 2n` would force periodicity, contradicting the cone.
  Died at the hypothesis, at the very first `n`: over all positions inside the
  cone of the seed picture to row 1,200, `P(2,n) = 4, 12, 32, 80, 200, 496,
  1208, 2916` for `n = 1…8` against a Nivat budget of `2, 4, 6, 8, 10, 12, 14,
  16` — `P(2,1)` is already the maximum possible `4`
  (`explorer/groma_nivat.mjs`). The deeper seam is that Nivat counts patterns at
  every position of a shift-invariant configuration, and the rule 30 picture has
  a distinguished origin and a cone; its pattern complexity includes the edge
  structure, which has nothing to do with the residual.
- **`k`-automatic switch indices.** Nothing gives the run index `i` a base-`k`
  digit structure — the runs are not indexed by anything arithmetic — and the
  algebraic/automatic vantage was already sighted 2026-09-09. Died before a
  dictionary could be written. The row-index version *was* worth one
  measurement, because Rowland's edge statistic is `a(ord₂(t))`, and it died
  too: `g(t)` conditioned on `ord₂(t)`, `ord₂(t+1)`, `t mod 8`, `t mod 64` takes
  up to 17 values per class (§3.6).
- **Toeplitz sequences and odometer factors.** "A periodic skeleton with holes,
  filled in at a next level" is precisely the shape of "centre column periodic,
  column 1 free at the white times", and Toeplitz sequences are exactly the
  almost 1-1 extensions of odometers, which would have imported a whole
  machinery. Died on the filling rule: a Toeplitz sequence's holes are filled by
  a *periodic* pattern at the next level and here they are filled by the
  automaton, and there is no second level — `white_run_monotone` gives one
  integer per hole and then stops. Recorded also because Portage's 2026-09-08
  profinite sighting already visited odometers, so a captain buying this twice
  would be buying the same thing.
- **A Toeplitz *tower*, from iterating `white_run_monotone` outward.** The
  monotonicity is not special to columns 0 and 1: for any `x`, if cell `(t,x)`
  is white and `(t,x+1)` is black then `(t+1,x+1)` is black, because the rule
  reads `0 XOR (1 OR ·) = 1` — so it holds at every position by shift
  equivariance, and every adjacent column pair carries its own switch-index
  sequence. That looked like a hierarchy. It is not one: §3.1's argument is
  local and uses nothing about the origin, so the switch index at position `x`
  should be just the distance from `x` to the next black on its right, and the
  whole array is then one field — the distance-to-next-black field — sampled at
  different places, not a tower of successively finer structures. (I measured
  the identity only at `x = 0`; the generalisation is a reading of the same
  argument, not a second measurement.)
- **"Is there a theorem that a return-time statistic of a CA orbit is not
  eventually periodic?"** The vantage's direct question. Searched three ways:
  `"return time" OR "return word" sequence cellular automaton orbit "not
  eventually periodic" theorem`; `gap sequence first passage statistic cellular
  automaton space-time diagram aperiodicity proof "eventually periodic" column
  rule 30`; and the trace-subshift literature around Cervelle–Formenti–Guillon.
  **Nothing found. UNVERIFIED as a negative** — an
  absence from three searches is weak evidence — but the shape of the field
  explains it: every such theorem would decide a property that §3.4's Rice
  theorem proves undecidable.
- **My own first framing, that the finite alphabet does not reach the seed.**
  Taken from the brief and wrong: `centerColumn_not_eventually_constant` is
  proved, so under the residual's own hypothesis the seed's white runs are
  bounded by `p - 1`. Died on reading the board rather than on a measurement,
  and I should have read it first.
- **"The gap process is a finite-state machine with one rare escape."** I
  expected `g(t+1)` to be a function of `(centre colour, g(t))` outside the
  single state `(black, g = 1)`, which would have put all of the aperiodic
  content in one event type. The prediction rule is exactly right — 0
  mispredictions outside that state over 200,000 rows each of four pictures —
  but it is useless as a reduction, because the escape is not rare: it fires on
  **30.4 %, 29.5 %, 11.1 % and 25.0 %** of rows for `X_{(10)^∞}`, `X_{01011}`,
  `X_{1 0^8}` and the seed (`explorer/groma_class.mjs`, test A). "All the
  content is in the escapes" then says only "all the content is in the picture".
  What the same table does give is the alphabet: `g` never exceeded `7, 18, 9,
  18` in those four runs.
- **My own complexity figures at `T = 2·10^6`, read as if they were the
  complexity.** They are lower bounds, and the deeper run showed by how much:
  `p_j(64)` went from 837 to 995 and `p_j(128)` from 26,288 to 39,807 when the
  sample grew fivefold — **low by 19 % and 51 %**. Nothing in the document's
  conclusions turns on it, because every use is of the form "this is climbing
  where a structure class needs it flat" and a lower bound is the right side for
  that. But the shape of the error is the one this board keeps making: I had
  named what the numbers were measured *over* in the method line and then quoted
  them in the prose as if they were the object.
- **"The seed's switch indices carry less than the centre column, so the
  integer reading compresses."** True and irrelevant: measured, the seed's
  switch-index sequence has `p_j(1) = 10, p_j(2) = 57, p_j(3) = 249` and
  saturates by `n = 24` over 125,143 letters, while the centre column is a full
  shift to `n = 12`. Under the residual's hypothesis the centre column carries
  *nothing*, so any entropy comparison made on the unconditional seed is a
  comparison of the wrong two objects. I made it anyway before noticing.

## 5. What to hand the theorist

**One topic and two fences.** Topic 1 is the session; Topics 2 and 3 are each
an hour of kernel work that either confirms a correction I am making to the
brief and to the literature-search strategy, or catches me in a convention
error. All three are stated so that failure is visible.

**Topic 1 (the one I would spend the session on): prove the first-passage
identity, and restate the residual as a statement about the leftmost black
cell.** The claim to falsify is §3.1's identity —

> for every maximal white run of the centre column, beginning at row `s` with
> length `L`, the first row of that run at which column 1 is black is
> `s + min(L, g(s) - 1)`, where `g(s) = min { x ≥ 1 : evolve s x = true }`.

The dictionary row it depends on is the fourth row of §3.1's table, the one
marked *exact, 0 failures in 350,000+ runs*. It should be a short induction:
`white_run_monotone` gives the shape `0^j 1^{L-j}`, and `rule30_left_local_law`
(crystals A2) gives the speed-1 leftward walk of a black cell with white on its
left. The induction step is the four-case gap table in §3.1, and that table is
already `decide`-checked against `rowCell` over `t < 60` in
`explorer/groma_scratch_gap.lean` (with a non-vacuity guard and a failing
mutant beside it), so the theorist starts from a verified finite instance rather
than from my prose. What settles it is a `lake build`, not a depth. If it goes through, the
residual is restated as **"the leftmost black cell right of the origin, read at
the rows where the centre column turns white, is eventually periodic"** — an
integer-valued statement about the near field with an alphabet bounded by the
maximum gap rather than by the maximum run, which measured on the seed to
400,000 rows is `10` letters against run lengths reaching `19`, and which grows
slowly (§3.1: eight data points consistent with `log_4 t`, stated as a reading).
That is a strictly smaller object than the one obstruction 9 hands
on, and it is the only thing in this document that touches the residual itself.

**Topic 2 (cheap, and it corrects the brief): the conditional finite
alphabet.** The claim to prove is two lines: *if the centre column is
`p`-periodic from `N` and `p > 0`, then every maximal white run beginning at
`t ≥ N` has length at most `p - 1`.* It follows from
`centerColumn_not_eventually_constant`, which is proved. The dictionary row is
the last row of §1. It matters because the whole vantage was framed as "this
applies to the family and not to the seed", and it applies to the seed wherever
the residual is actually stated. What it does *not* give is any measurement: the
hypothesis is counterfactual.

**Topic 3, and it is the cheapest of the three: record the blocking-word
negative.** §3.2 chains two quoted statements of Kůrka's with the board's proved
`rule30_leftPermutive` to get: rule 30 has **no `r`-blocking word at any
length**, hence no equicontinuous configuration, hence the one mechanism in
cellular-automaton theory that bounds a column subshift's complexity from above
never applies to it. That is a two-line derivation a theorist can either confirm
or find a convention error in within the hour, and if it confirms it is a fence
worth having in writing, because "find a blocking word / a partially
equicontinuous direction" is the first thing a symbolic-dynamics reader will
try.

**What I would not spend a session on.** Any search of the combinatorics-on-
words literature for a criterion. §3.2 shows the finite alphabet is a change of
units, §3.4 shows the criteria are undecidable as a class, and §3.5 shows the
switch-index sequences of the bad boundaries outgrow every bound those classes
impose. Those three together close the vantage, and closing it is the main thing
this document is for. §3.6 adds the orienting version of the same negative: the
one place in print where a statistic of this exact shape *is* solved for rule 30
is Rowland's `ℓ(t) = a(ord₂(t))` at the outer edge, and it is solved by
permutivity, which the origin does not have.

## 6. Next vantage

**Attack from the theory of `ℤ²` subshifts of finite type and their
directional/one-sided dynamics — specifically Kari–Moutot's "decidability and
periodicity of low complexity tilings" and the algebraic-geometry line of
Kari–Szabados — but pointed at the *strip*, not at the picture.** Everything in
this document reduced to one question it could not touch: how much can the
complexity of column 1 exceed that of column 0? That is a question about the
width-2 strip of the space-time diagram, and it is exactly the object the
low-complexity-tiling literature is built for; the residual is the statement
that a strip whose left column is periodic has a right column that is periodic
too, which in that language is a **periodic-decomposition** question about a
two-row configuration under an algebraic annihilator. I could not reach it from
where I stood because I spent the session on the *one-dimensional* recoding the
vantage named, and one dimension is where the periodic-forcing theorems are
weakest — there are exactly two, Morse–Hedlund (which needs an upper bound
nothing supplies) and equicontinuity (which §3.2 shows rule 30 fails outright).
In two
dimensions the theorems run the *right* way: they conclude periodicity from low
complexity, which is the direction this residual needs, and Kari–Szabados'
decomposition theorem ("there exist periodic integral configurations `c₁,…,c_m`
such that `c = c₁ + ⋯ + c_m`", <https://arxiv.org/html/1605.05929>) is a
conclusion of exactly the residual's shape. The seam that connector will have to
break through is the one that killed §4's Nivat entry: rule 30's picture has a
cone and an origin and is not shift-invariant, so the hypothesis `P(m,n) ≤ mn`
is never satisfied globally — the work is to find the *local* version, over the
strip and under the periodic-column hypothesis, and to say honestly whether
anything in that literature survives the loss of shift-invariance.

A second, cheaper vantage if the first is judged too speculative: **renewal
shifts and countable-state Markov shifts, applied to `g(t)` directly.** After
§3.1 the residual is about an integer process that descends by one under a white
centre and resets under a black one — the canonical renewal shape — and symbolic
dynamics has a well-developed theory of exactly such shifts (`S`-gap shifts,
renewal shifts, countable-state Markov shifts and their finite presentability).
The question that vantage should ask is whether the induced map on the reset
events is finitely presented, since §3.1's four-case table plus one escape state
is very nearly a countable-state Markov presentation already, and what is
missing is a description of the escape.

**One number I expected to leave open and did not.** I thought the geometric
tail in the seed's switch-index histogram — ratio about `1/4` — was unexplained,
and it is not: the unconditional law of `g` is `P(g = k) = 2^{-k}` to four
decimals (`0.4999, 0.2495, 0.1254, 0.0630, 0.0314, 0.0156, …`,
`explorer/groma_rowland.mjs`), the seed's white-run lengths are geometric with
the same ratio, and `j = min(L, g-1)` of two independent geometric-`½` variables
is geometric-`¼`. Both halves are what a fair-coin row gives, and the heuristic
that predicts them is that rule 30 is permutive hence surjective, hence
preserves the uniform Bernoulli measure — "any permutive CA is surjective"
(`sources/schule-stoop-2012-topological-classification.txt`, before Prop. 15).
It is only a heuristic: the seed is one orbit, not a generic point of that
measure, and this board has an obstruction entry (*Iterating the reset lemmas
builds a front that cannot retreat*) recording that
rule 30's front statistics are *not* the fair-coin ones. I am recording it
because I had written the `1/4` up as a mystery before checking, which is the
failure this project's memory names.
