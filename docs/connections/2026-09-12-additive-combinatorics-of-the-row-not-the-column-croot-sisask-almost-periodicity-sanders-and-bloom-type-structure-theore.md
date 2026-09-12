# Additive combinatorics of the row, not the column

*A sighting, not a proof. Rosetta, 2026-09-12. Vantage: Croot–Sisask
almost-periodicity, Sanders/Bloom structure theorems for sets of positive
density in `F_2^n`, Tao's entropy sumset theory — aimed at the row marginal
rather than the column marginal.*

**Headline, in the band vocabulary `CLAUDE.md` asks for, before anything
else.** Nothing here is novel about rule 30. The one result I would hand on is
**project-internal**: an exact theorem saying *where* the Fourier mass of the
set of reachable rows can live — on the bottom `2t+1` coordinates, the left
cone band, and exactly nowhere else — which prices this whole vantage at zero
with a citation instead of an argument, the way crystal 67 does for
measure-flavoured proposals. It is one line from the board's closed
`evolveFrom_leftPermutive` and it is true of every left-permutive rule, so a
mathematician would use it without stating it. Everything else in this
document is a death.

**The fence check the brief demanded in hour one, answered.** The 3/5
obstruction does **not** close the additive question — it is a linear
programme over block frequencies, and the additive structure of a set is not a
block frequency. But the target moves, and the reader should know it before
section 3: **row balance is not Prize 2.** It is the other marginal of the same
2-D density, and P2 additionally needs the origin to be a *typical* position,
"which is the whole difficulty and is untouched by anything below" — Talus,
`docs/attacks/2026-09-10-prize-2-s-residual-…`, lines 187–190. I checked that
reading against `Rule30/Statements.lean:2119`, where Prize 2 is stated about
`centerColumn` and nothing else, and against crystal 29, which carries the row
density as a separate and purely empirical item. So a proof of row balance
would be a real novel fact about rule 30 and **would not be the prize**. The
brief's own framing — "aimed at PRIZE 2 through the ROW marginal" — has that
gap in it, and the gap is not small.

---

## 1. The problem, seen from outside

Take the two-letter alphabet `{0,1}` and the map sending a bi-infinite string
`x` to the string `y` with `y_i = x_{i-1} XOR (x_i OR x_{i+1})`. Start from the
string that is `1` at the origin and `0` elsewhere, and iterate. Write the
successive strings as the rows of an array with time running downward. Row `t`
is supported exactly on `[-t, t]` with both endpoints `1`. Two things are
measured about the column through the origin, `c(t) = (row t)(0)`, and neither
is proved: it never becomes eventually periodic (tested past `10^9` terms), and
its density of `1`s tends to `1/2` (measured `0.500360` at `2·10^5`; excess
`+4440` at `10^7` against a random walk's `√N ≈ 3162`). The residual handed to
this session is the first of those — the board's wall is an implication which,
given a proved theorem of Jen's, is *logically equivalent* to "the origin
column is not eventually periodic". The vantage aims at the second.

**Restated in the vantage's own terms.** Fix a depth `t` and a window width
`m`. The map `Φ_t : F_2^m → F_2^{m+2t}` sending an initial segment to the row
it becomes after `t` steps is injective (pre-injectivity; crystal 4), and both
cone edges are black at every step, so span grows by exactly `2` a step. Hence
the image `A_t(m)` is an explicit set of exactly `2^m` points in a group of
`2^{m+2t}` points: **a subset of `F_2^N` of density exactly `4^{-t}`.** It is
not a subgroup — `Φ_t` is a polynomial map, not linear. The question the brief
asks is whether a set of that density in an elementary abelian 2-group is
*forced* (Bogolyubov–Ruzsa, Sanders, Croot–Sisask) or *permitted* (polynomial
Freiman–Ruzsa) to have additive structure, and whether any such structure
constrains the Hamming weight of its members. Row balance is the statement
that one distinguished element of `A_t(1)` — the image of the single generator
— has weight `(1 + o(1))(2t+1)/2`.

## 2. Fields sighted

| Field / theory | The object over there | The seam, in one line |
|---|---|---|
| Structure theorems in `F_2^n` (Sanders' Bogolyubov–Ruzsa) | A set of density `α`; conclusion a subspace of codimension `O(log^4 (2/α))` inside `4A` | With `α = 4^{-t}` the codimension is `O(t^4)`; non-trivial only when the span exceeds `~t^4`, and the prize's row has excess span `1` |
| Croot–Sisask almost-periodicity | Almost-periods of `1_A * 1_B` | Two seams: the count `|S|/(2K)^{9/ε²}` drops below one at the prize's parameters, and XOR of two rows is not an object this project has |
| Polynomial Freiman–Ruzsa / Marton (GGMT 2023) | Small doubling `|A+A| ≤ K|A|`, **no density hypothesis** | The only row of this table that survives the scaling seam; its conclusion needs `K ≤ (4^t/2)^{1/12}` and the measured `K` misses by 6 to 18 orders of magnitude |
| Tao's entropy sumset theory | Ruzsa distance `d_R(X,Y) = H(X'−Y') − ½H(X') − ½H(Y')` | Same conclusion shape (a coset of a subgroup), same weight-blindness; and `H(Y) = m` exactly by injectivity, so the entropy side carries no information the density does not |
| Coding theory: `ε`-balanced codes and `ε`-biased sets | A code all of whose weights lie in `n/2 ± εn` | This *is* "every reachable row is balanced" — and the reachable set provably contains rows of weight fraction `0.94` and `0.15` |
| Gowers uniformity norms, the `U^{k+1}` inverse theorem | Polynomial phases of a fixed degree `k` | Rule 30's row map has ANF degree `2t − 1` — growing, so no fixed level of the hierarchy holds it |
| Cocycles and almost-homomorphisms | `f(x+y) = f(x) + f(y) + B(x,y)`, `B` bilinear | Rule 30 satisfies this **exactly**, with `B(x,y) = (2x ∧ y) XOR (2y ∧ x)`: the one genuine additive identity in the picture, and it is crystal 59 in the row's vocabulary |
| Linear cellular automata (rules 90, 150) | The image is a linear subspace | The perfect positive control: maximal additive structure, and row balance **fails** — rule 90's row weight is `2^{s_2(t)}`, density `→ 0` along `t = 2^k` |
| Boolean function complexity (degree, nonlinearity) | Degree of `Φ_t` in its own dependency window | Degree `2t − 1` against a window of `2t + 1` variables: near-maximal, which is the quantitative form of "nothing local is available" |
| Chevalley–Warning and low-degree varieties | Zero sets of low-degree systems over `F_2` | The reachability conditions have degree growing with `t`; the theorem needs degree below the variable count |
| Ramsey / density Hales–Jewett | Combinatorial lines in `[k]^n` | No product structure: the reachable set is an image of a cube under a map that mixes coordinates triangularly, not a cube |
| Sidon sets, `B_h[g]` sets | Sets with few additive coincidences | The wrong end of the dial, and a Sidon-type conclusion constrains no weight |
| Invariant measures / Bernoulli `(1/2,1/2)` | Uniform measure on `F_2^N`, pushed forward | Injectivity makes the pushforward uniform on `A_t`; this is `4^{-t}` restated, and it is crystal 67's territory, already fenced |
| Percolation / first-passage growth | The damage front | Listed only so the next connector does not re-sight it: my own 2026-09-09 document, and the entry Rowan wrote from it |

## 3. Connections

Five, and four of them are fences. Every measurement below was run in
`explorer/rosetta6_*.mjs`; the orientation of the engine is pinned by an
asymmetric board fact (see the note at the end of this section), because the
two checks I reached for first — the centre column and the row weights — are
both mirror-invariant and prove nothing about orientation.

### 3.1 The reachable set has positive density only where the prize is not

**The claim.** The vantage's own premise is false in the only way that
matters: the reachable set of rows is a set of positive density in `F_2^N`
exactly when the depth is held fixed and the span grows, and rule 30's own row
at depth `t` lives in the fibre of that family where the set is a **single
point** — so the row does not escape the defect the column has, it renames it.
The field owns subsets of a group; the prize owns one element of one of them.

**The dictionary.**

| This project | Additive combinatorics in `F_2^N` | |
|---|---|---|
| A finite configuration of span `m` | A point of `F_2^m` | |
| Row `t` of its picture | Its image under `Φ_t`, a point of `F_2^N`, `N = m + 2t` | |
| The set of all rows at depth `t` | `A_t(m) ⊆ F_2^N`, `\|A\| = 2^m`, density exactly `4^{-t}` | injectivity is crystal 4 |
| "Span grows by two a step" | `N = m + 2t` is forced, not chosen | both cone edges black |
| The seed, `initialConfig` | `m = 1`: the unique point of `A_t(1)` | |
| The seed's row `t` | *That* point | measured `\|A_t(1)\| = 1` at every `t ≤ 5` |
| Density `4^{-t}` at fixed `t`, `m → ∞` | The positive-density regime the theorems are for | |
| Depth `t` with span `2t+1` | Density `2^{1-2t} ≈ 1/\|G\|` — one point | |
| The nested chain `R_1 ⊇ R_2 ⊇ …` | Each `R_{t+1} ⊆ R_t` | a `(t+1)`-step image is a `t`-step image |
| The seed's row `t` inside that chain | In `R_t`, **not** in `R_{t+1}` | the seed has no finite preimage: `0` of `2^20` configs map to it |
| **Seam** | The two limits are orthogonal: the field needs `m → ∞` at `t` fixed; the prize needs `t → ∞` at `m = 1` | |
| **Seam** | At fixed `t`, the set is known to contain rows of black density `0.97` | the `4^{-t}` obstruction |

**What it leans on.** Sanders, *On the Bogolyubov–Ruzsa lemma*, fetched at
`https://ar5iv.labs.arxiv.org/html/1011.0107`, Theorem A.1, verbatim: *"For the
specific setting of `𝔽₂ⁿ` with density `α>0`, there exists a subspace `V⩽G`
with `cod V=O(log^4 2α^−1)` such that `V⊂4A`."* And Croot–Sisask, *A
probabilistic technique for finding almost-periods of convolutions*, fetched at
`https://ar5iv.labs.arxiv.org/html/1003.2978`, Proposition 1.1, verbatim: given
`|B⋅S|⩽K|B|` there is `T ⊆ S` with *"`|T|⩾|S|/(2K)^(9/ϵ²)`"* such that for each
`t ∈ TT⁻¹`, *"`∥1_A∗1_B(xt)−1_A∗1_B(x)∥²₂⩽ϵ²|A||B|²`"*.

**The test, run.** `explorer/rosetta6_pfr.mjs`. Reading Sanders' `O()` as the
constant `1` — the most generous reading available, and one no honest proof
would get — the conclusion is non-trivial only when `log^4(2·4^t) < N`, which
needs excess span `m > 79, 621, 2395, 6553` at `t = 1,2,3,4` and `m > 2.8·10^6`
at `t = 20`. The seed has `m = 1` at every `t`. For Croot–Sisask with
`S = G`, `K = 1/α = 4^t`, the almost-period count `|G|/(2·4^t)^{9/ε²}` exceeds
one only when `N ≳ (2t+1)·9/ε²`, again `m ≫ t`. And the fibre count, computed
exhaustively: the number of reachable words of span exactly `n` is
`1, 1, 2, 16` at `n = 2t+1, 2t+2, 2t+3, 2t+6`, for every `t ≤ 5`. **A
theorist should try to falsify:** that `A_t(1)` is a singleton, equivalently
that `initialConfig` has no finite rule 30 preimage — one line from
`evolve_left_edge`, and if it were false the whole of section 3.1 would need
rewriting.

**What it would give.** Nothing, and it takes something: it closes the vantage
at the top. It touches the residual only by explaining why — the residual asks
about one orbit, and this field's hypotheses are statements about sets whose
size is the thing being hypothesised.

### 3.2 All of the Fourier mass sits in the left cone band, exactly

**The claim.** The entire Fourier spectrum of the set of reachable rows is
supported on characters that touch the bottom `2t+1` coordinates, with *exact*
zeros above that — so any Fourier-analytic or additive argument about rule 30's
rows is, provably and without loss, an argument about the settled left
diagonals, which is the region three of this board's obstructions already say
the prize does not live in. This is Parallax's crystal 67 with the column
replaced by the row, and the same mechanism.

**The dictionary.**

| This project | Fourier analysis on `F_2^N` | |
|---|---|---|
| Cell `x` of row `t` | Coordinate `b = x + t` of `Y = Φ_t(C)` | left cone edge is bit `0` |
| Left diagonal `k` | The **fixed** bit index `k` | |
| Right diagonal `k` | A bit index moving up by `2` a row | |
| The centre column at time `t` | Bit `t` of row `t` | |
| "Cell `b` is the same for every configuration" | `\|Â(e_b)\| = \|A\|`: single-coordinate bias `1` | |
| Left diagonals `0, 1, 4` eventually black; `2, 7` eventually white | Measured bias exactly `1.00` at bits `0,1,2,4,7` | obstruction 4's white list `2, 7, 28, 399`, recovered from a Fourier computation that shares no code with it |
| Left diagonals of period `2` | Bias `0.25` at bits `3,5,6` | |
| The settled band | `supp(Â) ⊆ {γ : min supp γ ≤ 2t}` | **exactly**, measured `0.000000` above |
| Left-permutivity at radius `t` (`evolveFrom_leftPermutive`) | `Y_b` is affine with coefficient `1` in `C_{b−2t}`; that variable is read by no higher coordinate, so the character sum cancels | the proof |
| The exact linear relations on every reachable row | The dual of `A`'s affine hull; codimension `2,3,3,4,5,6` at `t = 1..6`, **independent of `m`** | |
| Rule 30's relations sit in bits `[0..2]` — the first three left diagonals — while **rule 90's span the whole word**, codimension `2t+1` | The nonlinear rule has *less* global linear structure than the linear one, and what it has is local to the left edge | full character sweep, `explorer/rosetta6_caveat2.mjs` |
| **Seam** | The band has width `2t+1`, and the seed's whole row has width `2t+1` | so the theorem is sharp for `m ≫ t` and vacuous for the seed |
| **Seam** | Rule 90 satisfies it too | so it cannot be prize-relevant: crystal 66's filter, failed |
| **Seam** | Rule 86, the mirror, fails it at every threshold (`0.75` at every `s`) | which is what makes the measurement orientation-sensitive rather than vacuous |

**What it leans on.** Nothing external. Internally, `evolveFrom_leftPermutive`
(closed) and crystal 67, `blueprint/crystals.md:849–873`, which states the
column analogue and its proof idea — *"the map from the cells at `0, -1, …,
-n` to the column word is triangular over `F_2` with unit diagonal by
`evolveFrom_leftPermutive` at radius `t`"* — and whose stated purpose is the
same as this one's: *"every future measure-flavoured proposal can be answered
with a node number instead of an argument."*

**The test, run.** `explorer/rosetta6_band.mjs`. For the family of
configurations with bit `0` pinned black and bits `1..m-1` free, the maximum of
`|Â(γ)|/|A|` over every `γ ≠ 0` with `min supp(γ) ≥ s`, computed exhaustively:
at `s = 2t+1` and `s = 2t+2` it is `0.000000` at all five `(m,t)` tried
(`(12,2), (12,3), (12,4), (14,3), (10,4)`), and at `s = 2t` it is
`0.250, 0.250, 0.164, 0.250, 0.266` — so the boundary is sharp and not an
artefact of a threshold chosen after the fact. Rule 90 and rule 150 give
`0.000000` above `2t` and `1.000000` at `2t`; **rule 86 gives `0.750000` at
every `s`**, which is the asymmetric half of the check. The per-bit bias
profile at `m = 14, t = 8` reads
`1 1 1 .25 1 .25 .25 1 .02 .41 .10 .18 .03 .01 .15 .07 .08 0 0 …`, zero from
bit `17 = 2t+1` on. The thresholded enumeration was then replaced by a **full
sweep over every one of the `2^N − 1` characters** at
`(m,t) = (10,2),(10,3),(12,2),(12,3),(8,4)`
(`explorer/rosetta6_caveat.mjs`): the maximum character sum over every `γ` with
least set bit above `2t` is exactly `0` in all five, and no exact relation
reaches above bit `2t`, so the band-restricted relation count is complete for
rule 30 rather than a lower bound. **A theorist should try to falsify:** *for every `t`,
every `m`, and every `γ ≠ 0` whose least set bit exceeds `2t`, the number of
configurations `c` (bit `0` black, bits `1..m-1` free) with `γ·Φ_t(c) = 1` is
exactly `2^{m-2}`.* That is the node shape, and it should cost about what
crystal 67 costs.

**What it would give.** A fence with a number on it, and a sharper version of
the seam my own notebook has now recorded three sessions running ("every object
in this field is a function of a band of bounded width"). It converts that from
a mood into a boundary: the band is bits `0..2t`, and the boundary is exact. It
touches no part of the residual.

### 3.3 Row balance for all reachable rows is exactly "the reachable set is an ε-balanced code", and it is false

**The claim.** The coding-theory translation of the row marginal is exact and
it kills the whole structure-theorem programme in one step, for a reason
orthogonal to density: every structure theorem's *conclusion* is a coset of a
subspace, cosets contain elements of wildly different weights, and balance is a
weight statement. Structure and balance are antagonists, not allies.

**The dictionary.**

| This project | Coding theory | |
|---|---|---|
| The reachable rows at depth `t`, span `N` | A (non-linear) code `A ⊆ F_2^N` of size `2^m` | rate `m/N → 1` at fixed `t` |
| "Every reachable row is balanced" | `A` is an `ε`-balanced code | the exact translation |
| A linear rule's reachable set | A genuine linear code of codimension `2t` | rules 90, 150 |
| "The rows of the seed are balanced" | One codeword has weight `≈ N/2` | not a code property at all |
| `ε`-balanced linear code | Dual of an `ε`-biased set | classical, and it is what a proof would have to exhibit |
| **Seam** | Measured weight fraction over `A`: `[0.150, 0.938]` at `t=2, m=16`; `[0.167, 0.917]` at `t=4, m=16` | so `A` is `ε`-balanced for no `ε < 0.43` |
| **Seam** | A structure theorem's conclusion *contains* a coset of a large subspace, hence codewords of many weights | so a positive conclusion would make things worse |
| **Seam** | Rule 90's reachable set is a linear code — maximal structure — and rule 90's row weight is `2^{s_2(t)}`, so its row density tends to `0` along `t = 2^k` | structure is compatible with total failure of balance |

**What it leans on.** Internally, the `4^{-t}` obstruction's measurement — a
finite configuration whose row `40` has black density `0.971875` — which my
own weight-spread numbers reproduce in miniature at small `t`. Externally,
nothing fetched: the equivalence "`ε`-balanced linear code ⟺ dual of an
`ε`-biased set" is standard and I did not fetch a statement of it, so
**UNVERIFIED** (searched: "epsilon-balanced code dual epsilon-biased set
weight distribution", not fetched from a primary source).

**The test, run.** `explorer/rosetta6_pfr.mjs`, last block: min and max weight
fraction over the whole reachable set at `(t,m) = (2,8), (2,12), (2,16),
(4,8), (4,12), (4,16)`. **A theorist should try to falsify:** nothing — this
one is a translation, and the translation's value is that it converts a
programme into a property the board has already measured to be absent.

**What it would give.** It closes the direction of the whole vantage: a
structure theorem *cannot* imply balance, whatever its density hypothesis,
because its conclusions are translation-invariant and balance is not. That is
the strongest single sentence in this document and it needs no rule 30 input at
all.

### 3.4 The one density-free theorem, and the doubling that is entirely accounted for

**The claim.** Polynomial Freiman–Ruzsa is the only theorem in the vantage
whose hypothesis is a growth condition rather than a density, so it alone
survives section 3.1 — and it dies on a measurement, because the reachable
set's doubling constant is *exactly* the index of the set in its own affine
hull and not one bit smaller. The only additive structure in the set is the
left-diagonal relations of section 3.2; beyond them the set is as spread as a
set can be.

**The dictionary.**

| This project | PFR / entropy sumset | |
|---|---|---|
| `A_t(m)`, the reachable rows | `A ⊆ F_2^N` with `\|A+A\| ≤ K\|A\|` | |
| XOR of two reachable rows | A point of `A+A` | **and nothing in this project** |
| The exact linear relations (3.2) | `A`'s affine hull, codimension `d(t) = 2,3,3,4,5,6` | |
| Measured `\|A+A\|/\|A\|` | `4.00, 15.97, 31.81, 15.99, 4.00, 56.40` | at `(m,t) = (12,2),(12,3),(12,4),(14,3),(16,2),(10,5)` |
| The hull's own difference space | `2^{N-d}/\|A\|` = `4, 16, 32, 16, 4, 64` | |
| **The identity** | `A+A` fills its hull's difference space: `4.00/4`, `15.97/16`, `31.81/32`, `15.99/16`, `4.00/4`, `56.40/64` | so the doubling is the hull and nothing else |
| Uniform config, `Y = Φ_t(C)` | `H(Y) = H(C) = m` exactly | injectivity; the entropy side is the density restated |
| **Seam** | PFR's conclusion is non-trivial only if `2K^{12}\|A\| < \|G\|`, i.e. `K ≤ (4^t/2)^{1/12}` — `1.19` to `1.68` over the range | measured `K` misses by `10^6` to `10^{18}` |
| **Seam** | `+` has no dynamical meaning: rule 30 is not additive, so `A+A` is not a set of rows of anything | |

**What it leans on.** Gowers–Green–Manners–Tao, fetched at
`https://ar5iv.labs.arxiv.org/html/2311.05762`. Conjecture 1.1, verbatim:
*"Suppose that `A⊂𝐅₂ⁿ` is a set with `|A+A|⩽K|A|`. Then `A` is covered by at
most `2Kᶜ` cosets of some subgroup `H⩽𝐅₂ⁿ` of size at most `|A|`."* Theorem
1.2, verbatim: *"[Conjecture 1.1] is true with `C=12`."* The entropic form,
Theorem 1.8, verbatim: *"Let `G=𝐅₂ⁿ`, and suppose that `X₁⁰,X₂⁰` are `G`-valued
random variables. Then there is some subgroup `H⩽G` such that
`d[X₁⁰;Uₕ]+d[X₂⁰;Uₕ]⩽11d[X₁⁰;X₂⁰]`."* And, worth one line for this project in
particular: *"A formalization of Theorem 1.2 in the proof assistant language
Lean4 may be found at https://teorth.github.io/pfr/."* So if any row of this
dictionary had held, the tool would already be in Lean. Tao's Ruzsa distance,
fetched at `https://ar5iv.labs.arxiv.org/html/0906.4387`, is
*"distR(X,Y) = distR(pX,pY) := H(X′−Y′) − ½H(X′) − ½H(Y′)"*, with the triangle
inequality *"distR(X,Z) ≤ distR(X,Y) + distR(Y,Z)"* (Theorem 1.10, eq. 16).

**The test, run.** `explorer/rosetta6_pfr.mjs`, third block: exhaustive sumset
over every pair, six `(m,t)` points, with the PFR threshold printed beside each
and the ratio `2K^{12}|A|/|G|` printed as the margin. **A theorist should try
to falsify:** *`A_t(m) + A_t(m)` is the whole difference space of `A_t(m)`'s
affine hull, for every `t ≥ 2` and every `m` large enough* — the measurements
give `1.00, 0.998, 0.994, 0.999, 1.00, 0.881`, so the honest form is
`(1-o(1))`, and the one point below `0.99` is the smallest set in the table.

**What it would give.** A fence, and a number for it: no Freiman-type structure
exists in the reachable set beyond the affine hull, so nothing in the
Freiman/PFR half of the field can say anything about a rule 30 row that
section 3.2 does not already say.

### 3.5 Rule 30 is an almost-homomorphism with an exact bilinear defect, and the Gowers hierarchy is indexed by a degree that grows

**The claim.** There is exactly one genuine additive identity in this picture,
it is exact, it is two lines, and it is crystal 59 in the row's vocabulary:
the packed row map is rule 150 plus a quadratic term, so it is a homomorphism
of `F_2^N` up to a symmetric bilinear cocycle `B`. That makes quadratic Fourier
analysis the right corner of the field to point here — and the degree of the
depth-`t` map is `2t − 1`, growing, so no fixed level of the Gowers hierarchy
contains it.

**The dictionary.**

| This project | Quadratic Fourier analysis | |
|---|---|---|
| `rowStep(r) = 4r XOR (2r \| r)` | `L(r) XOR Q(r)`, `L` linear (rule 150), `Q(r) = 2r ∧ r` | `a\|b = a⊕b⊕(a∧b)` |
| Crystal 59, "rule 30 = rule 150 + `c·r`" | The same statement, on a whole row at once | |
| Failure of additivity | `rowStep(x) ⊕ rowStep(y) = rowStep(x⊕y) ⊕ B(x,y)`, `B(x,y) = (2x ∧ y) ⊕ (2y ∧ x)` | exact on `262144/262144` pairs; `B ≠ 0` on `95.6%` of them |
| Rule 90 | `B ≡ 0`: exactly additive, `0` failures | the control |
| "Is the row map a Freiman homomorphism?" | Yes up to `B`, and `B` is the whole content | |
| Degree of `Φ_t` in its own window | `2, 3, 5, 7, 9, 11` at `t = 1..6`, identical at `m = 14` and `m = 18` | window is `2t+1` wide, so `2t-1` is near-maximal; at `m = 10` the `t = 6` value reads `10` because the variable count caps it, which is the tell that the window and not the composition sets the degree |
| `U^{k+1}` inverse theorem | Applies to degree-`k` phases for **fixed** `k` | |
| **Seam** | The degree grows, so the hierarchy level needed grows with the depth | |
| **Seam** | `B` is bilinear, so it is the `U^3` object — but only for one step; the composite is degree `2t-1`, not `2` | |

**What it leans on.** No external citation: the identity is elementary algebra
and I verified it rather than cited it. The Gowers `U^{k+1}` inverse theorem's
restriction to fixed degree is standard and I did not fetch a statement,
so **UNVERIFIED** (searched: "inverse theorem Gowers norm U^k polynomial phase
degree F_2^n"; not fetched).

**The test, run.** `explorer/rosetta6_pfr.mjs`, first two blocks: the cocycle
exhaustively over `512 × 512` pairs, and the exact ANF degree of every output
bit by Möbius transform over all `2^m` configurations, `m ∈ {10,14,18}`,
`t ≤ 6`. **A theorist should try to falsify:** *`rowStep x ^^^ rowStep y =
rowStep (x ^^^ y) ^^^ ((2*x) &&& y ^^^ (2*y) &&& x)` for all `x y : ℕ`* — that
is a seedable node in the board's own `rowStep` vocabulary, size S, and its
value is that it makes crystal 66's OR→XOR filter quantitative: the failure of
additivity *is* `B`, so an argument that would survive setting `B = 0` is
refuted by the same one-line check.

### A note on orientation, because the obvious checks are vacuous here

Two of the three anchors I reached for first prove nothing. Rule 30's mirror is
rule 86, and **mirroring the picture fixes the centre column**, so rule 86's
centre column equals rule 30's exactly (verified, `t ≤ 10`, both
`11011100110`); row weights are mirror-invariant too, so A070952's prefix
`1,3,3,6,4` is matched by both. What does pin the orientation is a *left
diagonal*: in the packed row a left diagonal is a fixed bit index and a right
diagonal moves two bits a row, so obstruction 4's eventually-white left
diagonals at `k = 2, 7, 28, 399` say that bit `2` of `rowNat t` must be white
for all large `t`. Measured: rule 30's bit `2` is
`0100000000000000000000000000000000000000` over `t ≤ 40`; rule 86's is
`0101010101…`, alternating forever. That check is asymmetric, and it is the one
every number in this document rests on.

## 4. Died in translation

Mine first, since they are the ones this section exists for.

- **"Density `4^{-t}` in a group of size `2^{2t+1}` is precisely the regime
  where Fourier-analytic and almost-periodicity methods have something to
  say"** — my own sentence, quoted into the brief as its central argument.
  **Dead at the arithmetic.** At `n = 2t+1` the density is `2^{1-2t} ≈ 1/|G|`:
  the set is one point, not a positive-density set, and `log(1/δ)/n → 1` is the
  regime where every structure theorem in the field is vacuous. The density is
  positive only with the depth held fixed and the span growing, which is the
  opposite limit from the prize's. I should have divided the two numbers in the
  first ten minutes; I instead built an engine.
- **"The reachable set at the seed's parameters is small but nonempty, so
  there is something to analyse."** Dead at the fibre count: `|A_t(1)| = 1`,
  and `1, 1, 2, 16` at spans `2t+1, 2t+2, 2t+3, 2t+6` for every `t ≤ 5`. The
  object at the prize's parameters is a singleton, which is the column's defect
  with a different name.
- **"The degree of `Φ_t` is `2^t`."** Mine, asserted in a script comment and in
  my own reasoning for an hour, on the grounds that composing quadratics
  doubles the degree. Dead at the measurement: `2, 3, 5, 7, 9, 11` for
  `t = 1..6`, i.e. `2t − 1`. The composition bound is correct and irrelevant —
  the map reads only `2t+1` variables, so the window caps the degree long
  before the composition does, and I should have seen the cap before running
  anything. The corrected statement is *stronger* against the vantage (the
  degree is near-maximal *for its window*) and weaker as an excuse (linear
  growth, not exponential).
- **"Additive structure in the reachable set would be a route to balance."**
  Dead on the shape of every conclusion in the field: they produce cosets, and
  a coset contains elements of many weights. The measured weight fractions
  `[0.150, 0.938]` are the same fact seen from the object. Structure and
  balance are antagonists.
- **"The large autocorrelation at `h = 2^{N-1}` is real structure"** — my first
  run reported `max_{h≠0} |A ∩ (A+h)|/|A| = 0.396, 0.443, 0.527, 0.787`, one to
  three orders above the random level, and the shift was always a top bit.
  **Dead on the normalisation.** That run took all `2^m` configurations in a
  window, which makes `A` a *nested union over effective span*, and the nesting
  alone produces the correlation: flipping the rightmost cell of a row moves it
  between two spans of the family. Sextant's normalisation — configurations of
  span *exactly* `m` — is the honest one, and the effect is an artefact of
  mine. A number an order of magnitude above its null, produced by the shape of
  the family rather than by the automaton.
- **"The reachable set has no exact linear relations."** Dead at the first
  Fourier run: it has `2, 3, 3, 4, 5, 6` independent ones at `t = 1..6`, and
  they are the settled left diagonals. Worth recording because the relations
  are also the *whole* of the set's additive structure (3.4), so finding them
  and finding the ceiling are the same event.
- **"A search for exact relations inside bits `0..2t` finds all of them, for
  any rule."** Mine, and the justification I gave myself was the band theorem —
  which forbids relations whose *least* set bit is above `2t` and says nothing
  about relations with a low least bit reaching high. For rule 30 the
  restriction happens to be complete (full sweep above). For rule 90 it
  **undercounts `7` as `1`**, because a linear rule's relations span the whole
  word. What caught it was not the number looking wrong — `1` looked perfectly
  plausible — but a *theorem* contradicting it: a linear map's image of a
  family of dimension `m-1` in `F_2^N` is an affine subspace of codimension at
  least `2t+1`, so codimension `1` was impossible before it was improbable.
  That is my notebook's own tell from last session ("the measurement
  contradicted a proof, not that the number looked wrong"), and the undercount
  reaches nothing in this document only because no rule 90 codimension is
  quoted in it.
- **"The codimension sequence `2,3,3,4,5,6` is worth handing over."** Killed by
  this board's own standing prior, not by a measurement: Rowan's entry of
  2026-09-09 says a clean pattern in the truncated row map is a period regime
  in disguise and the question to ask first is where it breaks. Six terms with
  a plateau at `t = 2,3` is exactly the shape that has been wrong three times
  here. Not handed over.
- **"The centre column shows up as a biased middle character."** My reading of
  the first run's `max over MIDDLE band = 0.6875 at bits [6..6]` with
  `m = 8, t = 6`, where bit `6` is precisely where the configuration's origin
  cell sits. Dead on the confound: that run held `N` fixed and varied `m` and
  `t` together, so "middle of the word" and "centre of the cone" and "edge of
  the settled band" were the same index by construction. Separating them
  (`rosetta6_band.mjs`) shows the profile is a *band* phenomenon indexed by
  `2t`, with the centre column inside the band at `t ≤ 2t`, and the apparent
  middle-band signal disappears at `t = 2, 3` where the parameters are not
  degenerate.
- **"Croot–Sisask's conclusion would say something about rule 30."** Dead on a
  dictionary row rather than on a bound, and this is the seam the whole vantage
  turns on: the conclusion is about `1_A * 1_B`, and the XOR of two rule 30
  rows is not an object this project has or can interpret. For rule 90 it is
  (the XOR of two pictures is a picture); for rule 30 it is not. So the group
  operation the vantage celebrates is exactly the operation the automaton does
  not respect — crystal 66's filter applied to a whole field.
- **"Row balance is Prize 2, or a route to it."** The brief's framing. Dead at
  `Rule30/Statements.lean:2119` and Talus's 2026-09-10 sentence: the two are
  the two marginals of one 2-D density, and P2 needs the origin to be typical
  on top. Proving row balance would not approach the prize by this route.
- **"Entropy sumset theory gives a handle the density does not."** Dead at
  injectivity: `H(Φ_t(C)) = H(C) = m` exactly, so every entropy of the image is
  the density restated, and `d_R` inherits the same vacuity as `K`.
- **Chevalley–Warning, density Hales–Jewett, Sidon sets, Bloom's
  three-term-progression bound.** No dictionary attempted past one row each,
  for the reasons in section 2: each needs either a bounded degree, a product
  structure, or a conclusion about progressions, and none of the three is a
  weight statement.
- **Nothing died for lack of depth.** Every death above has a witness computed
  rather than searched for; the sets were enumerated exhaustively, the
  character sums are exact integers, the cocycle was checked on every pair in a
  `512 × 512` box, and the degrees are exact Möbius transforms over the full
  truth table.

## 5. What to hand the theorist

**One, and it is a fence rather than a route.** The band theorem of 3.2, in
the shape crystal 67 was seeded in and for the same stated reason.

> *Claim to falsify.* For every `t`, every `m ≥ 2`, and every `γ ≠ 0` whose
> least set bit exceeds `2t`, exactly half of the configurations with bit `0`
> black and bits `1..m-1` free satisfy `γ · Φ_t(c) = 1` — equivalently, the
> character sum is exactly zero, so the reachable set's whole Fourier spectrum
> is supported on characters touching bits `0..2t`.
>
> *The dictionary row it depends on.* "Left-permutivity at radius `t` makes
> row-`t` bit `b` affine with coefficient `1` in configuration bit `b − 2t`,
> and no higher bit of the row reads that variable." That is
> `evolveFrom_leftPermutive`, closed, and the argument is the triangular-
> with-unit-diagonal argument of crystal 67 read along a row instead of a
> column.
>
> *What would settle it.* Exhaustive character sums at
> `(m,t) = (12,2),(12,3),(12,4),(14,3),(10,4)` give `0.000000` above `2t` and
> `0.164`–`0.266` at `2t`, so the boundary is sharp; rule 86 gives `0.75` at
> every threshold, so the statement is orientation-sensitive. Its value is
> entirely as a citation: it says that any Fourier-analytic, almost-periodicity
> or Freiman-type argument about rule 30's rows reads only the left cone band,
> and three obstructions already say the prize does not live there.

**A distant second, worth a seeder rather than a theorist.** The cocycle of
3.5, `rowStep x ^^^ rowStep y = rowStep (x ^^^ y) ^^^ ((2*x &&& y) ^^^ (2*y
&&& x))`, size S, elementary, exact. Its value is to make crystal 66's
OR→XOR filter quantitative: the failure of additivity *is* `B`, so "does this
argument survive `B = 0`?" becomes a one-line check against a named node.

**Explicitly not handed over:** the codimension sequence (section 4), the
doubling constants (they are the affine hull restated), and anything requiring
a structure theorem, for the reason in 3.3 — the conclusions are
translation-invariant and the target is not.

## 6. Next vantage

**The vantage I would give the next connector is the *transient band* as a
one-dimensional object with a boundary condition, attacked from free-boundary
and obstacle problems — or, if that reads too analytic, from the
theory of quasicrystals and cut-and-project sets.** The reason is the
seam that has now closed four of my five sessions and every field in this
one: every tool I have reached for reads a band of bounded width, and the
exact boundary of that band is now known (bits `0..2t`, section 3.2). The
prize's cell sits at bit `t`, *inside* the band but in its transient half,
and the object that separates "inside the band and settled" from "inside the
band and not" is the seam between the settled region and the transient band —
which this board has measured to five digits (`0.2497`, crystal 51) and can
say nothing else about. A free-boundary reading asks what determines the
position of an interface between a rigid phase and a free one, given the law
on each side; the settled region is the rigid phase, its words are
power-of-two periodic, and the transient band is the free one. Nobody here
has sighted that literature, and the one thing it is *for* is exactly the
quantity every route in this project has ended on.

**And one I could not reach from where I stood: the theory of `ε`-biased sample
spaces and small-bias generators, read backwards.** Section 3.3 shows that a
proof of row balance is a proof that the reachable set is an `ε`-balanced code.
That field builds such codes on purpose, from algebraic constructions, and
knows exactly which properties force balance — and it is the one literature
where "this explicit set has all weights near `n/2`" is a theorem rather than a
measurement. I could not reach it because I had no fetched primary source for
the balanced-code / biased-set duality and marked it UNVERIFIED rather than
lean on it; a session that starts there, with the duality quoted, could say
which of that field's sufficient conditions rule 30's reachable set fails, and
that would be a *reason* for the failure rather than the measurement I have.
