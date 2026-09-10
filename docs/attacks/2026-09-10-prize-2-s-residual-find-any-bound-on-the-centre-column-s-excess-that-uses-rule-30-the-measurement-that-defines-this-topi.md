# Prize 2's residual: any bound on the centre column's excess that uses rule 30

Talus, theorist, 2026-09-10.

**The band first, because the project's rule says so.** **Project-internal.**
The topic asked for a negative if that is the honest answer, and it is: no bound
on the centre column's excess is reachable without a genuinely new idea, and
the reason is a fence (`C2`) rather than a measurement. Everything measured
here — the excess to `10^7` rows, its sign changes, its extremes, the
run-length distribution, the excess at every sparse set rule 30 supplies, and
the forcing laws' coverage — is **inside a fair coin's own scatter**, and the
three statistics that looked otherwise failed a 40-draw null. One small **known**
result is re-derived (Wolfram 1986 §7) with a consequence not in print (`C1`),
and one elementary row identity and row bound are new-but-small (`C3`, `C4`),
neither about the centre column. Nothing here touches Prize 2.

## 1. The residual, in one paragraph

Time runs down the picture; the centre column is the vertical read at `x = 0`,
one cell per row. Prize 2 says the black cells of that column are half of it in
the limit, and the board has already turned that into a statement with no
division in it: with `count(N)` the black cells among the first `N`, the excess
`E(N) = 2·count(N) − N` must be `o(N)`
(`centerColumn_density_tendsto_half_iff_excess`). What is missing is not a
better reformulation. It is **one true sentence about `E(N)` that is false for
some Bool sequence** — anything that uses the automaton at all. Twelve P2 nodes
are proved and ten are counting identities that hold of any `ℕ → Bool`; the two
that name rule 30 name it trivially. So the residual is not "prove
`E(N) = o(N)`" so much as "say *anything* about `E(N)` that a coin could fail",
and the reason that is hard can be put in one line: **rule 30 is a law along a
row, and the centre column is transverse to every row.** The rule constrains
three horizontally adjacent cells; two adjacent black cells in a row forbid a
cell of the next row, and that is a real constraint with real consequences
(§3, `C3`, `C4`). Two vertically adjacent cells of the centre column forbid
nothing, and cannot, because by crystal 40 the centre column is a **free
coordinate**: for every Bool sequence `b` there is a configuration, white at
every `x ≥ 1` at time `0`, whose centre column is exactly `b`. The residual
therefore lives in the one place that is not free — the left cone, the leftmost
black cell, the same ingredient Jen's and Kopra's theorems need for P1 — and
the only thing the cone gives the centre column is a bound on its **runs**,
which is capped in principle at `|E(N)| ≤ N(1 − 1/(c·log N))` and cannot reach
`o(N)` however sharp it is made.

## 2. Why the known routes fail

**On the board already.**

- *"The centre column as a boundary condition"* (obstruction 2) and *"An
  eventually periodic centre column does not force another periodic column"*
  (obstruction 9, mine) end at the same place: a statement proved for an
  arbitrary `Config` is a statement about every `X_b`, and every Bool sequence
  is some `X_b`'s centre column. Written for P1; it applies verbatim to P2, and
  it is what kills route (2) below.
- *"Unbounded right-diagonal periods do not force an aperiodic centre column"*
  (obstruction 20, mine, this morning) closes the right edge for P1 and says
  the same thing from the other side: the centre column is the free bit of the
  right-diagonal tower, so no statistic of the tower separates the seed from a
  periodic boundary. Its closing line asked for a third death of that shape
  before an obstruction entry could say the family is statistically
  indistinguishable. §3's `C2` and the coverage table below are that third
  death, and the entry is appended to `docs/obstructions.md`.
- **Crystal 66, the OR-to-XOR filter — run, not asserted**
  (`explorer/talus7_filter.mjs`, single seed, 2,000 rows, rules 30, 150, 90,
  86, 110, 60). It changed one of my claims and strengthened another:

  | rule | black runs in the centre column | alternation (`C1`) fails | `b(t+1)+2b(t) ≤ 4t+5` (`C3`) fails | triangle density |
  |---|---|---|---|---|
  | **30** | 474 (longest 9) | **0 / 968** | 0 / 1998, tight | 0.5008 |
  | 150 | none — the column is constantly black | vacuous | 0 / 1998, tight | 0.1090 |
  | 90 | none | vacuous | 0 / 1998 | 0.0391 |
  | **86** (rule 30 mirrored) | 474 (longest 9) | **316 / 968** | 0 / 1998, tight | 0.5008 |
  | 110 | none | vacuous | 0 / 1998 | 0.2942 |
  | 60 | none | vacuous | 0 / 1998 | 0.0391 |

  `C1` **passes hard**: it fails for rule 86, rule 30's own mirror, at a third
  of the cells tested. This project has twice been caught by a check that was
  symmetric, and an orientation-sensitive claim is the opposite of that.
  Rule 150's centre column is constantly black so it has no maximal run at
  all and the claim is vacuous there — and the reasoning genuinely does not
  transfer: for `l XOR c XOR r` the sideways inverse gives
  `cell(t,−1) = cell(t,1)` under a black centre, not `cell(t,−1) = 0`.
  `C3` **fails the filter in the way that matters**: its *reasoning* is
  OR-specific (the forbidden adjacent-black pair is simply false for 150 and
  90), but its *conclusion* holds for 150, 90, 110 and 60 as well — and, worse,
  for a fair coin, whose triangle density is `1/2 < 2/3`. So `C3` separates
  rule 30's picture from an all-black one and from nothing else. Recorded in
  its own entry below; I had written the opposite before running this.
- **Crystal 67, the ensemble filter.** Nothing here is measure-theoretic, and
  `centerColumn_trace_uniform` is the counting form of `C2`'s fence: every
  column word of length `n+1` has exactly `2^n` windows, so no count over
  windows distinguishes one column word from another.
- **Crystal 29** says of the row count that "only `b(t) ≥ 3` and `b(t) ≤ 2t+1`
  (the cone) are provable, and neither is worth a node". `C3` improves that —
  weakly, and only against the cone.
- **Crystals A3**, no bound below `1` on a left damage front, is what stops
  `C1`'s run bound being sharpened from `O(a)` toward the true `O(log a)`: the
  alternation a run forces enters the transient band at depth `≈ 0.25a`, and to
  profit from that one would have to know where the band is.

**The three routes the topic named, each closed.**

**(1) A sparse set of cut points that rule 30 supplies.** Dead on the
localisation lemma's own hypothesis, before any measurement.
`centerColumn_density_tendsto_half_of_nearby_cuts` asks that *for every* `d`
there be, past some `N₀`, a cut `M ≤ N` with `d·(N − M) ≤ N` — a cut inside
`[N(1 − 1/d), N]` for every `d` and all large `N`. A set with that property is
not sparse in any useful sense: it must meet **every multiplicative window**,
however narrow. Every rule-30-supplied set on the board is exponentially sparse
and admits `d = 1` and nothing more: worst relative gap `0.99996` for the period
doublings `3, 8, 29, 400, 87867, 2107985255`, `0.99994` for the eventually-white
left diagonals `2, 7, 28, 399, 53207, 58286, 87866, 1420878968`, `0.5` for the
powers of two (`explorer/talus7_analyse.mjs`). Granting admissibility would buy
nothing anyway: at those cuts the excess is the size it is at a general `N`
(`|E|/√N` at most `0.72`, `1.41`, `1.56` on the three sets against `1.41`,
`1.13`, `2.00` for a fair coin on the same sets, to `N = 10^7`). The lemma is a
real theorem and its content is *"you may skip the `N` between cuts"*; it is not
a licence to check a thin set.

**(2) The forcing laws' coverage.** Dead twice, once by proof and once by
measurement, and the proof is the one to keep. `column_succ_of_black` and
`centre_forced_after_double_white` are theorems about an **arbitrary** `Config`.
By crystal 40 every Bool sequence `b` is the centre column of some configuration
white on `x ≥ 1`, so both laws hold with `b` in place of the centre column, for
every `b`. **A consequence of them alone is therefore true of every Bool
sequence and can bound nothing.** Concretely, the law `c(t+1) = ¬L(t)` is not a
constraint on `c` at all: it is `sideways_inverse` at the origin,
`L(t) = c(t+1) XOR (c(t) OR R(t))`, read backwards, so it *defines* column `−1`
from columns `0` and `1` rather than restricting column `0`. Measured on the
seed, "`c(t+1) = ¬L(t)` holds exactly when `c(t) OR col₁(t)`" fails **0 of
199,999** times — the identity confirming itself. And the coverage figure is a
coin's (`explorer/talus7_coverage.mjs`, `T = 200,000`):

| boundary | `dens(c)` | `dens(col 1)` | `dens(c OR col 1)` | double-white trigger |
|---|---|---|---|---|
| the seed | 0.5004 | 0.5007 | **0.7508** | 0.1251 |
| coin `b`, seed `9e3779b9` | 0.4999 | 0.4994 | **0.7495** | 0.1251 |
| coin `b`, seed `12345` | 0.4995 | 0.5014 | **0.7504** | 0.1263 |
| coin `b`, seed `deadbeef` | 0.5014 | 0.4998 | **0.7523** | 0.1257 |

The `0.5004` is the centre column's own density quoted back, and the `0.7508`
is `1 − ¼` for two density-half sequences that look independent. Nothing was
measured about rule 30. This is no criticism of the node —
`centre_forced_after_double_white` is a fine theorem and its docstring already
says the figure is a measurement over one prefix — but the coverage cannot be
an ingredient of a P2 bound, and neither can any successor of it.

**(3) The run structure.** Dead in two independent ways. Measured, the
run-length distribution **is** the geometric one and no moment is anomalous: at
`N = 10^7`, white runs have mean `1.99878` and `E[L²] = 5.99340`, black runs
`2.00056` and `6.00242`, against the geometric null's `2` and `6`; the
observed/expected ratio at every length `1..12` sits in `[0.94, 1.03]`, which is
a fair coin's own scatter on the same run (`explorer/talus7_analyse.mjs`). The
longest runs below `10^7` are `22` white and `23` black — `log₂ N` behaviour,
and the topic's "block of 16 at `M = 22711`" is that same phenomenon seen
earlier and smaller. And, second, **even a perfect run bound cannot give P2**:
if every run below `N` had length at most `c·log N` there would be at least
`N/(c log N)` runs, so the minority colour would appear at least
`N/(2c log N)` times and `|E(N)| ≤ N(1 − 1/(c log N))`, which is not `o(N)`.
The run route is capped below the target however sharp it is made, so it is not
worth sharpening.

**The excess itself, measured as far as this session could reach.** To
`N = 10^7` (`explorer/talus7_deep.mjs`, 28 minutes): `E(10^7) = 4440`, i.e.
`1.404 √N`; minimum `−257` at `172,711`; maximum `4605` at `9,985,347`; first
negative at `N = 127`; last non-positive at `N = 195,112`, so the excess is
strictly positive over the last 98% of the range, with only 170 sign changes.
Three of those look unlike a coin, so they were nulled against **40 fair-coin
draws of the same length** (`explorer/talus7_null.mjs`):

| statistic | rule 30 | coin median | draws at least as extreme |
|---|---|---|---|
| sign changes | 170 | 1327 | **6 of 40** |
| `min E` | −257 | −2159 | **5 of 40** |
| last `N` with `E ≤ 0` | 195,112 | 9,903,690 | **2 of 40** |

The three are the arcsine law seen from three sides and are strongly dependent,
so jointly this is `p ≈ 0.1`, not a finding. **Reported as a plain negative:
after `10^7` rows, nothing about the centre column's excess is outside a fair
coin's scatter.**

**One route the topic did not name, and it is the only one with content.** The
**row** count. The rule's constraint is horizontal, so it bites on rows: two
adjacent black cells forbid a cell of the next row (crystal 8). The centre
column is one cell of each row, and `centerColumn_run_boundary` says exactly
which: the centre is black at `t+1` precisely when the origin sits at a run
boundary of row `t`, and the number of run boundaries in row `t` is exactly
`b(t+1)`. So P2 and the row balance `b(t)/(2t+1) → 1/2` (A070952, crystal 29)
are the two marginals of one 2-D density, and P2 additionally needs **the origin
to be a typical position**, which is the whole difficulty and is untouched by
anything below.

## 3. Candidate claims

### C1. A run of the centre column is no longer than its own start time

**The claim.** In English: while the centre column stays black, the picture
immediately to its left is forced to be a checkerboard, one further cell for
each further step — and the cone will not allow a checkerboard, because the two
leftmost cells of every row are both black. So a black stretch cannot be longer
than the time at which it starts.

In the project's vocabulary, in two parts.

*The lemma (the forced alternation).* For all `a ≥ 1` and `L ≥ 1`, if
`evolve t 0 = true` for every `t ∈ [a, a + L)`, then

    evolve a (-(j : ℤ)) = decide (j % 2 = 0)   for every j < L.

*The bound.* Under the same hypothesis, `L ≤ a`. The same method gives
`L = O(a)` for a maximal **white** run, through `column_one_of_white` and
`white_run_monotone`: on a white run column `−1` equals column `1`, which is
monotone there, so the run splits into a stretch forcing an all-white triangle
and a stretch forcing the checkerboard offset by one, each bounded the same way.

**What it would give.** Nothing that proves P2, and I say that first. It gives
the *only* quantitative bound on `E(N)` anyone has produced that uses rule 30: a
maximal run beginning at `a` ends by `2a`, so run starts at most double, so
there are at least `log₂N − O(1)` maximal runs below `N`, so each colour occurs
at least `(log₂N)/2 − O(1)` times and

    |E(N)| ≤ N − log₂ N + O(1).

That is false for a constant Bool sequence, so it does what the topic literally
asks. It is also worth `23` at `N = 10^7`, so it does nothing else, and by the
cap in §2(3) no sharpening of it ever will. What remains after it is everything.

**Falsification.** `explorer/talus7_runbound.mjs`, `N = 10^6`, full packed rows
so every cell of every row is available.
- The forced alternation: **0 failures in 500,759 cells**, over every maximal
  black run below `10^6`, each tested out to `min(L − 1, a)`.
- The bound the derivation actually gives, `L ≤ a` for `a ≥ 1`: **0 violations
  in 500,570 maximal runs**, both colours, and it is **exactly tight** at
  `a = 3` (the run `111` at times `3, 4, 5`), which is the first non-trivial run
  there is. The only run outside it is the seed's own opening `1,1` at `a = 0`,
  where `L = 2` and the cone edge and the origin are the same cell.
- Looseness: the longest run below `10^6` is `L = 22` at `a = 731,772`, where
  the bound allows `731,773` — loose by a factor `33,262`.
- Depth of the underlying sequence: the run-length distribution and longest
  runs were re-read at `N = 10^7` (`talus7_analyse.mjs`); the longest run there
  is `23`, so nothing near the bound appears at ten times the depth.
- Kernel: `explorer/talus7_scratch_alternation.lean`, accepted by
  `lake env lean`, three `decide +kernel` checks at the first black run of
  length `9` (`a = 1053`) — the run itself, the nine alternating cells of row
  `1053`, and the two adjacent black cells at that row's cone edge, which is
  what stops it.

*Distrust the result you like.* Four things could have produced this besides
the claim. (i) **A symmetric check.** This project has twice been caught by one,
so the filter run in §2 is the answer: rule 86 is rule 30 mirrored, has the same
centre column runs, and fails the alternation at **316 of 968** cells. The claim
is orientation-sensitive. (ii) **A harness reading its own prediction back.**
The left cells are read from the packed row by bit index `t − j`, strictly below
the centre bit `t` that produces the column, so the two are independent reads of
one evolution rather than of each other; and the column matches A051023's
prefix exactly. (iii) **A window silently truncating.** Runs longer than the
64-cell buffer are counted: `0` below `10^6`, since the longest is `22`.
(iv) **Vacuity** — the alternation being common anyway. It is not, and the
mutation file `explorer/talus7_scratch_mutant.lean` is the demonstration:
asserting the alternation one cell *past* the run at `a = 1053` is rejected by
the kernel, so the forcing stops exactly where the run stops.

**Novelty.** The determination is **in print and is Wolfram's**: *Random
sequence generation* (1986) §7, lines 1118–1120, "if the position 0 sequence
consists solely of ones, then the whole triangle of sites is completely
determined, entirely independent of the position 1 sequence". What I did not
find there or anywhere else in `sources/` is (a) the identification of that
determined triangle as the checkerboard `(10)^ℤ` and (b) the consequence, that
the cone therefore bounds the run by its start time. Searched `sources/` for
`checkerboard`, `alternating`, `0101`, `(01)^`, `temporal sequence`,
`consecutive`, `run of`, `runs of`, `longest`: Rowland 2006 §1 discusses the
leftmost run of a *row* (his `l(t)`, mirror orientation), Wolfram 1986 §9.B
discusses gap lengths of `n`-blocks in the ensemble, Meier–Staffelbach's `0*1*`
observation (via Astrolabe's connection document) is about the *right*-adjacent
sequence. Honest category: **new phrasing of a known determination, plus a
consequence the source does not draw.**

**Route.** `column_succ_of_black` for `j = 1`; `evolve_sub_one_eq_xor` at
`i = −j`, iterated, for the induction on `j`; `evolve_left_edge` and
`evolve_left_second_diagonal` for the contradiction. The one step that is
actually hard is nothing — the induction step is `0 XOR (0 OR 1) = 1` and
`1 XOR (1 OR 0) = 0` — and the friction is the usual `ℕ`/`ℤ` index
normalisation. The white case needs `white_run_monotone` and one extra case
split and is worth stating separately.

### C2. Nothing quantified over `Config` can bound the excess

**The claim.** Let `S` be any statement of the form "for every configuration `X`
white at every `x ≥ 1` at time `0`, the sequence `t ↦ column X 0 t` satisfies
`P`". Then `P` holds of **every** Bool sequence. In the project's vocabulary
this is crystal 40 read as a fence:
`∀ b, ∃! X, (∀ k, X (k+1) = false) ∧ ∀ t, column X 0 t = b t`. Consequently no
such `S` can bound `E(N)` below `N`, and in particular no successor of
`column_succ_of_black`, `centre_forced_after_double_white`, `sideways_inverse`,
`column_one_of_white`, `white_run_monotone`, `white_run_forbidden`,
`column_neg_one_damage_mask` or `centerColumn_run_boundary` — every one of which
is stated for an arbitrary `Config` — can be an ingredient of a P2 bound unless
it is combined with a hypothesis the family does not satisfy.

**What it would give.** Nothing towards P2, by construction. It is the reason
the region is empty rather than neglected, and it is what a seeder should be
handed before proposing a thirteenth P2 node. What remains after it: the
statements that are **not** quantified over `Config` — `evolve_left_edge`,
`evolve_left_second_diagonal`, `evolve_eq_false_of_outside_cone`,
`centerColumn_not_eventually_constant` and their kin. That is a very short list,
and `C1` uses all of it.

**Falsification.** The claim is an existence statement, so it dies if some Bool
sequence is not realisable as a centre column. `explorer/talus7_coverage.mjs`
builds `X_b` at `T = 200,000` for three coin `b`, two biased `b` and five
periodic `b`, and each reproduces its own `b` as column 0 by construction while
satisfying the forcing identity. The half-line engine is the same shape as the
one checked against the board's `evolveHalfRight` **by the Lean kernel** on
2026-09-08 (`explorer/talus_scratch_halfline.lean`), which closes the
mirror-image failure mode. *What else could produce this:* the fence would be
vacuous if the seed's own centre column were somehow distinguished inside the
family — it is not, and the coverage table in §2 is the measurement, three coin
boundaries reproducing the seed's three figures to three decimals.

**Novelty.** Not new and not mine: crystal 40 is Wolfram 1986 §4 for the count
and `rightmost_difference_moves_right` for the uniqueness, and obstructions 2, 9
and 20 each state a version of it for P1. What is new is only that it is the
**P2** answer as well, and that it explains the twelve-nodes-and-no-content
measurement that named this topic. Filed as a fence, not a claim.

**Route.** None needed. Crystal 40's finite form is `window_count_half`
generalised, and `centerColumn_trace_uniform` (crystal 67) is the counting
version.

### C3. A provable density bound for rows — and it does not separate rule 30 from a coin

**The claim.** Write `b(t)` for the number of black cells in row `t`. Then for
every `t`,

    b(t+1) + 2·b(t) ≤ 4t + 5,

and consequently the black cells of the first `T` rows number at most
`(2/3)T² + T + 1/3` of the `T²` cells in the triangle: the triangle's black
density is at most `2/3 + O(1/T)`, where the cone alone gives `1`.

*Why.* Rule 30 is `l XOR (c OR r)`, so a black cell of row `t+1` at position `i`
requires `¬(cell(t, i−1) ∧ cell(t, i))` — crystal 8's forbidden block. Row `t`
has exactly `b(t) − ρ(t)` adjacent black pairs, with `ρ(t)` its number of
maximal black runs, so `b(t+1) ≤ (2t+3) − (b(t) − ρ(t))`. Runs are separated by
at least one white and both cone edges are black, so
`ρ(t) ≤ (2t+1−b(t)) + 1`. Substituting gives the inequality; summing over
`t < T` gives the density.

**What it would give.** It would replace crystal 29's "only the cone is
provable" with a bound of `2/3`, and it is the sharpest available statement of
*why* the column is harder than the row: **the constraint rule 30 supplies is
between horizontally adjacent cells, so it bounds a row count and says nothing
whatever about a count down a column.** Towards P2, nothing — and **it does not
even do what the topic asked**, because a fair coin's triangle has density `1/2`
and satisfies the bound comfortably. It separates rule 30's picture from an
all-black one and from nothing else. The filter run in §2 makes that concrete:
rules 90, 110, 150 and 60 satisfy it too, for the different reason that their
pictures are sparse. What is rule-30-specific is the **derivation**, not the
statement.

**Falsification.** `explorer/talus7_rows.mjs`, rows `0 … 299,999`, full packed
rows with a popcount per row: **0 violations**, and the inequality is **exactly
tight at `t = 1`** (`b(2) + 2b(1) = 3 + 6 = 9 = 4·1 + 5`), which is better
evidence that it is the right inequality than any number of loose successes.
Measured triangle density `0.50002` at `T = 300,000` against the bound `2/3`.

*Distrust the result you like.* An inequality with `0` violations over `3·10^5`
rows could be (i) **trivially true** — it is not, since it is tight at `t = 1`;
(ii) **misread** — my first statement of it was the *pointwise* bound
`b(t)/(2t+1) ≤ 2/3`, which is **false at `t = 15`** where the density is
`0.70968`, because the inequality bounds a *pair* of consecutive rows and I read
a pair bound as a pointwise one (§5); (iii) **an engine artefact** — the same
engine's centre column matches A051023 and its row counts at `t = 0..4` are
`1, 3, 3, 6, 4`, which are A070952's; (iv) **true of everything** — and here it
partly is, which is the entry's own conclusion above.

**Novelty.** Searched `sources/` for `density of`, `fraction of`, `number of
nonzero sites`, `equal number`, `half`. Fukś 2013 computes densities from
*disordered* configurations (his `c_t`, an ensemble average, exactly `1/2` for
rule 30 by left-permutivity — the board's `window_count_half`); Wolfram 1986 §4
is the same ensemble statement. Neither bounds the single-seed picture. The
forbidden block is Wolfram 1986 / NKS and is crystal 8. Honest category: **an
elementary consequence of a known block, not found in print, and small.**

**Route.** `rule30_run_boundary` or `rule30_eq` for the forbidden pair; the
counting is `Finset.card` over the cone with `evolve_eq_false_of_outside_cone`
for the outside. The hard step is the run/gap bookkeeping, `ρ(t) ≤ whites + 1`,
which wants a definition the board does not have: **the missing definition is
`rowRuns : ℕ → ℕ`, the number of maximal black runs of a row.**

### C4. The exact row identity, which does separate rule 30 from a coin

**The claim.** With `ρ(t)` the number of maximal black runs of row `t` and
`G₂(t)` the number of **interior** white gaps of length at least `2`,

    b(t+1) = ρ(t) + 2·G₂(t) + 2.

*Why.* `rule30_run_boundary` says a cell is black next step exactly at one of
three local patterns: the leftmost cell of a black run (`ρ` of them), the cell
just right of a run followed by two whites, and the cell just left of a run
preceded by two whites. Inside the cone the two outer gaps are infinite, which
is the `+2`; each interior gap of length `≥ 2` is counted once from each side.

**What it would give.** This is the one statement in the document that a fair
coin fails outright — a coin's rows are independent, so no identity ties
`b(t+1)` to row `t`'s run structure. It is `C3`'s exact form, and it turns the
row marginal `b(t)/(2t+1) → 1/2` into a statement about `ρ(t)` and `G₂(t)`,
which are finite combinatorial quantities of a single row rather than limits.
Towards P2, still nothing, for the reason in §1.

**Falsification.** `explorer/talus7_rows.mjs`: **0 failures over rows
`1 … 299,999`**. Hand-checked at the start: row `2` is `11001` with `ρ = 2` and
one interior gap of length `2`, giving `b(3) = 2 + 2 + 2 = 6`, and row `3` is
`1101111` with six blacks. *What else could produce it:* an identity that is
really two definitions agreeing — but the run and gap counts come from a bit
scan of row `t` and `b(t+1)` from a popcount of the **next** row, so the two
sides are different rows through different code paths. The first version of the
check reported one failure, which turned out to be my own comparison firing at
`t = 0` against an uninitialised predecessor (§5).

**Novelty.** Same search as `C3`; not found, and elementary. **New phrasing of
`rule30_run_boundary`, which is already on the board, plus the counting.**

**Route.** Same as `C3` and it needs the same missing `rowRuns` definition,
plus a `rowGaps₂`. Size M, no hard step, and it should be seeded together with
`C3` or not at all.

### C5. Exact balance exists in rule 30 — on the right diagonals, and it does not transfer

**The claim, in the form that dies and the form that survives.** *Dies:* every
right diagonal is exactly balanced (weight exactly half its minimal period).
*Survives:* every right diagonal at a depth where the period doubles is exactly
balanced, and so has excess bounded **uniformly in the window length**:
`|Σ_{j<M} (2·rightDiagonal k j − 1)| ≤ P_k` for every `M`.

**What it would give.** It is the only exact-balance mechanism rule 30 has, and
it is board-provable already — `rightDiagonal_antiperiodic_of_odd_driver` gives
`R(j+L) = ¬R(j)`, so the weight over `2L` is exactly `L`. It gives P2 nothing,
and the reason is the shape of the whole topic: `centerColumn k =
rightDiagonal k 0`, and reading an exactly balanced periodic sequence **at one
index** is not a balanced thing to do. There is also a fence: an *antiperiodic*
centre column would have `E(N) = O(1)` and would also be eventually periodic
with twice that period, contradicting P1. **So the one exact-balance mechanism
rule 30 owns is one that P1 forbids the centre column from having**, and any
future proposal that reaches `E(N) = O(1)` should be suspected on that ground
alone.

**Falsification.** `explorer/talus7_diagbalance.mjs`, diagonals `k = 0..30` read
off the real picture to 40,000 rows, minimal period and weight computed exactly.
The general claim **dies at `k = 5`**: minimal period `8`, weight `3`, so the
excess grows linearly at rate `−1/4`. It dies again at
`k = 11, 12, 13, 14, 19, 20, 21, 22, 23, 26, 28, 30`. The restricted claim
survives at every depth where the period first reaches a new power of two —
`k = 1, 3, 4, 6, 7, 9, 15, 16, 24, 25, 27, 29` — and at some plateau interiors
as well (`2, 8, 10, 17, 18`). *Checks:* `R_0` is black at all 39,969 indices and
`R_1` alternates at all of them (`evolve_right_edge`,
`evolve_right_second_diagonal`), and `rightDiagonal k 0 = centerColumn k` at all
31 depths against A051023.

**Novelty.** The doubling criterion is Rowland 2006 Prop. 2 / Lemma 3 and the
antiperiodicity is on the board; the exact-balance reading is a restatement.
Searched `sources/` for `balance`, `equal number`, `density`: nothing states it.
Category: **restatement of a board theorem, reported because it is the nearest
thing to the topic's request that exists.**

**Route.** `rightDiagonal_antiperiodic_of_odd_driver` plus one summation. No
hard step, and no reason to seed it.

## 4. What survived

`C1`, `C3` and `C4` survived falsification and the novelty search; `C2` is a
fence and survived by construction; `C5` survived only in its restricted form
and is a restatement. **I would seed `C1` first**, and not because it is
important — it is worth `log₂N` and I have said so three times — but because it
is the only statement anyone has produced about the centre column's excess that
a Bool sequence could fail, it is provable from five closed nodes by a two-line
induction, it is orientation-sensitive (rule 86 fails it at a third of the cells
tested, which is the check this project most needs), and its lemma is a
statement about the picture that other arguments may want. `C4` and then `C3`
next, together, and only if the missing `rowRuns` definition is wanted: they are
the row marginal's first content, `C4` is the one claim here a coin fails
outright, and `C3` improves crystal 29 against the cone and against nothing
else. **But the honest answer to the topic's question is the one it asked for in
advance: no bound on the centre column's excess is reachable without a genuinely
new idea, and the reason is `C2` — the centre column is a free coordinate of the
half-line, so every local law rule 30 supplies is true of every Bool sequence;
the only thing that is not free is the left cone, whose sole consequence for the
centre column is a run bound; and the run route is capped at `N(1 − 1/log N)`,
so it cannot reach `o(N)` even if it were made perfect.**

## 5. Claims that died

- **`E(N) ≥ 0` for all `N`** — the centre column is never white-heavy. Dies at
  **`N = 127`**, and the excess reaches `−257` at `N = 172,711`. Worth killing:
  the density `0.500360` at `200,000` quoted in `docs/prize.md` is `E = +144`
  against a walk's `√N ≈ 447`, so positivity looks plausible and is false.
- **The excess's sign behaviour is not a coin's.** At `10^7` the excess changes
  sign only 170 times, never falls below `−257`, and is positive over the last
  98% of the range — three things that look wrong for a walk. Dies against 40
  fair-coin draws: **6, 5 and 2 of 40** draws are at least as extreme, and the
  three statistics are the same arcsine phenomenon three times.
- **The doubling depths, the eventually-white left diagonals, or the powers of
  two as cut points for `centerColumn_density_tendsto_half_of_nearby_cuts`.**
  Dies on the hypothesis: worst relative gaps `0.99996`, `0.99994`, `0.5`, where
  the lemma needs the worst gap to tend to `0`.
- **The `0.6885` coverage measures rule 30.** Dies at the first coin boundary:
  `0.7508` for the seed against `0.7495`, `0.7504`, `0.7523` for coin `b`, and
  the black law's `0.5004` is the centre column's own density restated.
- **Any moment of the run-length distribution is constrained.** Dies at every
  moment measured: mean `1.99878 / 2.00056` and `E[L²]` `5.99340 / 6.00242`
  against the geometric `2` and `6` at `N = 10^7`, with per-length ratios inside
  a coin's own scatter.
- **A fixed-window non-constancy** ("both colours occur in every window of
  length `L`"), which would give `|E(N)| ≤ N(1 − 2/L)`. Dies at the black run of
  length `23` at `10^7`, and would die again at any fixed `L`, since the longest
  run tracks `log₂ N`.
- **Every right diagonal is exactly balanced.** Dies at `k = 5`: minimal period
  `8`, weight `3`.
- **`limsup b(t)/(2t+1) ≤ 2/3` pointwise** — my own first statement of `C3`,
  written into this document and taken out. Dies at `t = 15`, where the row
  density is `0.70968`. The inequality `b(t+1) + 2b(t) ≤ 4t+5` is true and does
  **not** bound a single row below `2/3`; only its sum over `t` does. The tell I
  ignored while writing it: the inequality constrains a *pair* of consecutive
  rows and I read a pair bound as a pointwise one.
- **`C3` passes crystal 66's filter** — also mine, also written in and taken
  out. Its *reasoning* does not survive OR→XOR, but its *conclusion* is
  satisfied by rules 90, 110, 150 and 60, and by a fair coin, whose triangle
  density is `1/2`. Dies at the first filter run, which I should have done
  before writing the sentence rather than after.
- **`L ≤ a + 1` for every maximal run.** One violation, at `a = 0`, the seed's
  own opening `1,1`. Corrected to `a ≥ 1`; the exception is the one row where
  the cone edge and the origin are the same cell.
- **Nothing died for lack of depth.** Every death above has a witness computed
  rather than searched for, the centre column was carried to `10^7` terms, and
  the run claims were tested over every maximal run below `10^6`.

## 6. Next topic

**The row count `b(t)`: is the row marginal provable where the column marginal
is not?** This session's one piece of content is that rule 30's local law
constrains a row and not a column. `C3` bounds the triangle's black density by
`2/3` in two lines and `C4` gives `b(t+1)` exactly from row `t`'s run structure;
**no argument of either shape exists or can exist for the centre column**,
because crystal 40 makes the centre column free while the row is not free at
all. The row density is A070952, crystal 29 calls it "purely empirical" and says
only the cone is provable, and nobody on this board has attacked it — while
`centerColumn_run_boundary` makes it P2's sibling marginal exactly: `count(N)`
is the number of rows whose run-boundary set contains the origin, and the size
of that set in row `t` is `b(t+1)`. Three things make it a better target than a
thirteenth P2 lemma. `C4` converts row balance into a statement about `ρ(t)` and
`G₂(t)`, finite combinatorics of one row rather than a limit. The inequality is
already tight at `t = 1`, so the method has no slack being wasted. And the
question has a clean residual with the same shape as everything else here: since
`b(t+1) = ρ(t) + 2G₂(t) + 2`, row balance is exactly *"a rule 30 row has about
one maximal black run per four cells, and about half its interior gaps are long"*
— a statement about the run structure of a single row, which is a finite object,
where P2 is a statement about a limit along a direction the rule does not
constrain. **One honest caveat, because I nearly wrote the opposite:** the row
excess is not anomalous. `|2b(t) − (2t+1)|` reaches `3061` at `t = 285,762`,
which is `4.05√(2t+1)` — but that is a maximum over `3·10^5` rows, and the
maximum of that many draws is about `4.5` sigma, so the row marginal looks as
much like a coin as the column does. It is worth attacking for its provability,
not for any measured anomaly.
