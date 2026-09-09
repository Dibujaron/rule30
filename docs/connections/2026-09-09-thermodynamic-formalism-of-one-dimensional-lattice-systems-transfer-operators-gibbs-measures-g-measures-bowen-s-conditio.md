# Sighting — `centerColumn_other_isEventuallyPeriodic_of_center` from the thermodynamic formalism of one-dimensional lattice systems

*Parallax, 2026-09-09. Vantage: transfer operators, Gibbs measures, g-measures,
Bowen's condition, the pressure function — and, because the vantage forced it,
algorithmic randomness.*

**Headline, so a captain can stop here.** The vantage's two questions both have
answers, and both are negative in a useful way. *Is rule 30's picture a Gibbs
state for a Hölder potential?* **Yes — for the constant potential, and
provably for no other of interaction range ≤ 8.** *Is the seed's column generic
for it?* **That question cannot be answered by any ensemble theorem, and the
obstruction is a theorem rather than a gap.** Along the way the ensemble turns
out to be exactly featureless: the centre column of a uniformly random
configuration is not approximately a fair coin, it is *exactly* a fair coin at
every finite length, with a five-line proof from the board's
`evolveFrom_leftPermutive`. So the whole content of all three prizes is the
genericity of one named point, and this document is mostly about why that
cannot be reached from here — with what it costs, and the one filter a captain
gets in exchange.

---

## 1. The problem, seen from outside

Take the two-letter alphabet `{0,1}` and the map that sends a bi-infinite row of
letters to a new row by the local rule `new(i) = old(i−1) XOR (old(i) OR
old(i+1))`. Start from the row that is `1` at the origin and `0` everywhere
else, apply the map for ever, and read the letter at the origin at each time.
That gives one specific infinite binary sequence, entirely explicit — a short
program prints any prefix. **The question is whether that sequence is eventually
periodic.** Everything measured says no: no repetition at any depth this
project has reached, a factor-complexity certificate excluding every eventual
period below `499,949`, near-maximal factor complexity, every standard
statistical battery passed. Nothing proved says no.

The board carries the residual as an implication — "if the origin's sequence
repeats then some other column's does" — but the board's own theorem that no two
columns can both repeat collapses that implication to its negated hypothesis. So
there is one statement here and no reduction of it.

**In the vantage's own terms.** The map is a surjective endomorphism of the full
2-shift, so it preserves the unique measure of maximal entropy, the `(1/2,1/2)`
Bernoulli measure `μ` — the Gibbs state of the zero potential. Under `μ`, the
sequence read at the origin is almost surely not eventually periodic, almost
surely normal, almost surely incompressible: each of the three prize conjectures
is a trivial theorem about the ensemble. The object the prize asks about is not a
`μ`-typical point; it is one named point, the delta mass at a configuration of
finite support. **So the question in this field's language is: is that one point
generic for `μ`?** The thermodynamic formalism is the one branch of dynamics
whose business is manufacturing individual-orbit statements out of an ensemble.
This document asks whether its bridges reach this point.

---

## 2. Fields sighted

| Field or theory | The object there | The seam, in one line |
|---|---|---|
| Thermodynamic formalism (Ruelle, Bowen, Walters) | The uniform Bernoulli measure as the Gibbs state of the zero potential; the pressure `P(0) = log 2` | Every hypothesis holds in its most degenerate form and every conclusion is "for `μ`-a.e. point" |
| Hedlund's balance theorem, surjective CA | Crystal 3: every word has exactly 4 preimages — the transfer operator with *constant* weights | Bounded distortion holds with constant exactly `1`; perfect regularity is exactly the absence of information |
| Kari–Taati, statistical mechanics of surjective CA | Invariance of a Gibbs simplex ⟺ conservation of its Hamiltonian | Rule 30 conserves nothing non-trivial (measured, range ≤ 8), so the uniform measure is the **only** invariant Gibbs simplex |
| Lattice gas / Ising chain, transfer matrix | The `c·r` firing potential `φ = −1[11]`; `M = [[1,1],[1,e^{−β}]]`; `P(β) = log λ(β)` | One dimension, analytic, no phase transition — the pressure has no singularity to align the wall with |
| Large deviations, susceptibility | `P″(0) = 5/16`, the fluctuation of the firing count | The instrument works and returns "generic": the seed's bulk matches, its *settled* region does not |
| g-measures, chains with complete connections (Doeblin, Keane, Walters, Bramson–Kalikow, Johansson–Öberg) | The width-2 trace as a chain with infinite memory | The variation does not decay — `var_k ≥ 1/2` for every `k ≤ 10`, exactly — so `g` is not even continuous |
| Non-Gibbsianness of factors; RG pathologies (Griffiths–Pearce, van Enter–Fernández–Sokal) | The column as an infinite-to-one factor of a Bernoulli measure | The field's own theorem is that such images are typically non-Gibbsian: it *predicts* the failure rather than repairing it |
| Algorithmic randomness, effective ergodic theory (Schnorr; Gács–Hoyrup–Rojas) | "The seed is generic for `μ`" ⟺ "the seed is a typical point" | Schnorr randomness **is** typicality for computable dynamics, and no computable point is Schnorr random — the bridge is broken at this end, provably |
| `μ`-limit sets of CA (Kůrka–Maass; Boyer–Delacourt–Poupet–Sablik–Theyssier) | The limit of the picture's empirical measures | `Σ⁰₃`-hard languages, `Π⁰₃`-hard properties: no dynamical hypothesis constrains the answer |
| Ergodic optimization, zero-temperature limits (Bousch, Contreras) | The seed's orbit as a ground state selected by a variational principle | Contreras: generic Lipschitz ground states **are** periodic orbits — the field's typical answer is Prize 1's negation |
| Symbolic dynamics of the width-2 trace | A proper subshift, growth ratio `2.3100`, entropy `≈ 1.36` bits/step (measured exactly to depth 13) | A genuinely non-trivial object; but periodic points are dense in it, so no support or measure argument can exclude one |
| Two-dimensional SFTs, space-time subshifts | `Σ_F ⊂ {0,1}^{ℤ²}`, a nearest-neighbour 2D SFT | Its `ℤ²` entropy per unit *area* is `0` — the 2D formalism is degenerate before it starts |
| Conservation laws in CA (Hattori–Takesue, Boccara–Fukś) | Additive invariants of the elementary rules | Rule 30 has none of range ≤ 8; rule 184 has exactly one at every range (the control) |
| Zero-temperature limits of the firing potential | `β → ∞` gives the golden-mean shift (`11` forbidden), pressure `log φ = 0.4812` | Rule 30's own pictures contain `11` at density `1/4`, so the ground state is the opposite of the object |

---

## 3. Connections

### 3.1 The ensemble is exactly featureless — and it is provably the only one

**The claim.** Rule 30's picture *is* a Gibbs state for a Hölder potential — the
constant potential, whose Gibbs state is the uniform Bernoulli measure — and it
is a Gibbs state for no other potential of interaction range ≤ 8; moreover the
ensemble's centre column is not approximately but *exactly* a fair coin at every
finite length, so the entire content of all three prize conjectures is the
genericity of one named point, and no refinement of the ensemble can ever help,
because there is nothing there to refine.

**The dictionary.**

| This project | Thermodynamic formalism | Status |
|---|---|---|
| The row of cells, `Config = ℤ → Bool` | The configuration space `{0,1}^ℤ` of a one-dimensional lattice gas | exact |
| Rule 30 as a map on rows | A surjective endomorphism of the full 2-shift, commuting with `σ` | exact (`schule-stoop` Prop. 15) |
| Crystal 3, "every word has exactly 4 preimages" | The transfer operator `L` on the de Bruijn graph with **all weights equal** | exact; this *is* Hedlund's balance theorem |
| `window_count_half` | The `t = n−1` marginal of the trace measure | exact, and a special case of the row below |
| The centre column under a random row | The trace measure; here **exactly Bernoulli(1/2)** at every finite length | proved below, kernel-checked to `n = 3`, enumerated to `n = 12` |
| The `1/4` density of the `c·r` firings | `−P′(0)` for the potential `φ = −1[11]` | exact; see §3.3 |
| Bounded distortion constant | `1` | exact and worthless |
| Pressure `P(0)` | `log 2` = topological entropy of the full shift | exact |
| A conserved additive quantity | A Hamiltonian whose Gibbs simplex is invariant (Kari–Taati Thm 41) | rule 30 has **none** of range ≤ 8 |
| The single seed | A delta mass at one point of a countable, hence `μ`-null, set | exact — and this is the seam |

**Seams.** (i) Every row above that maps cleanly maps to the *degenerate* value
of the concept — weights all equal, distortion constant `1`, potential constant,
`g`-function constant, pressure `log 2`. (ii) The seed's row is a *finite*
configuration; finite configurations form a countable set, so every
almost-everywhere statement in every field is vacuous on the entire class this
project studies, not merely on the seed. (iii) A mixing Gibbs measure charges
every cylinder positively and its periodic points are dense in its support, so
the target set — eventually periodic columns — is **dense** in the support of
every candidate measure. No support argument and no positivity argument can
separate a dense set from its complement.

**The proof that the trace is exactly Bernoulli.** Let `c_t = evolveFrom x t 0`.
The word `(c_0, …, c_{n−1})` depends only on the cells at positions `−(n−1) … n−1`,
so its law under `μ` is the pushforward of the uniform measure on those `2n−1`
cells. Fix the `n−1` cells at positions `1 … n−1` as parameters and let the `n`
cells at positions `0, −1, …, −(n−1)` vary. Then `c_t` reads only positions
`−t … t`, so `c_0, …, c_{t−1}` do not involve `w(−t)`; and by
`evolveFrom_leftPermutive` at radius `t`, flipping `w(−t)` with everything in
`(−t, t]` fixed **flips** `c_t`. So `c_t = w(−t) ⊕ (a function of the earlier
free cells and the parameters)`: the map is triangular over `F₂` with unit
diagonal, hence a bijection `{0,1}^n → {0,1}^n` for each of the `2^{n−1}`
parameter values. Every column word therefore has exactly `2^{n−1}` preimage
windows. □

This is the joint refinement of `window_count_half`, which is the marginal at one
time, and it rests on the same closed node.

**What it leans on.**

- Kůrka, *Topological dynamics of one-dimensional cellular automata*
  (held: `sources/kurka-topological-dynamics-1d-ca.txt`), Theorem 12
  (Hedlund, Moothathu), lines 448–461: surjectivity is equivalent to
  "*For each `u ∈ A⁺`, `|f^{−1}(u)| = |A|^d`*", and "*Another equivalent
  condition states that the uniform Bernoulli measure is invariant for `F`.*"
- Fukś, *Sequences of preimages in elementary cellular automata* (held:
  `sources/fuks-2013-sequences-of-preimages.txt`), lines 74–78: "*For surjective
  rules, this number is always easily computed. As proved in [3], under the
  surjective elementary rule every block has exactly four preimages, so
  `card[f^{−n}(b)] = 4^n` for every block `b`. For non-surjective rules, however,
  sequences of n-step preimage numbers can be highly nontrivial, and no general
  method for obtaining them without direct counting is known.*" **This is the
  seam in the brief's own terms:** the preimage structure the brief hoped would
  supply bounded distortion its constant is trivial *because* rule 30 is
  surjective. Fukś's interesting sequences are all for the non-surjective rules.
- Kari and Taati, *Statistical Mechanics of Surjective Cellular Automata*,
  <https://arxiv.org/abs/1311.2319>, abstract fetched: "*the simplex of
  shift-invariant Gibbs measures associated to a Hamiltonian is invariant under a
  surjective cellular automaton if and only if the cellular automaton conserves
  the Hamiltonian*", with "*A special case is the invariance of the uniform
  Bernoulli measure under surjective cellular automata, which corresponds to the
  conservation of the trivial Hamiltonian.*" From the article text
  (<https://ar5iv.labs.arxiv.org/html/1311.2319>): **Theorem 41** is that
  correspondence; **Corollary 43** strengthens the converse — if a surjective CA
  maps "*a (not necessarily shift-invariant) Gibbs measure for a Hamiltonian to a
  Gibbs measure for the same Hamiltonian, the Hamiltonian must be conserved*";
  and **Theorem 22** is that "*surjective cellular automata preserve the average
  entropy per site of shift-invariant probability measures*".

**The test.** Three, all run.

1. `node explorer/parallax3_trace.mjs` — exhaustive over all `2^{2n−1}` windows,
   `n = 1 … 12` (8,388,608 windows at `n = 12`): every one of the `2^n` column
   words has **exactly** `2^{n−1}` preimages, min = max at every depth.
2. `node explorer/parallax3_naive.mjs` — an independent, deliberately slow
   referee with explicit positions and wide padding, `n ≤ 9`: same answer. (It
   was written because the *first* version of the fast script truncated the array
   at the origin and lost the left half of the cone; the referee also reproduces
   the board's number-like word counts `3, 4, 6, 8, 10, 12, 15, 19, 24, 31`
   exactly, which is what caught the bug.)
3. `lake env lean explorer/parallax3_scratch_trace.lean` — accepted by the
   kernel: for `n = 1, 2, 3`, every centre-column word of length `n+1` has
   exactly `2^n` preimage windows of width `2n+1`, stated with the board's own
   `ofWindow` and `evolveFrom`.
4. `node explorer/parallax3_conserved.mjs` — the conservation-law computation
   feeding Kari–Taati. For each range `n ≤ 8` the space of additive quantities
   conserved on every ring is computed exactly (rank over a prime field, twice
   with different primes, exhaustive over all rings to `L = 13` plus 4,000 random
   rings at `L = 14, 16, 18, 20, 22`). Trivial conserved quantities (constants
   plus telescoping coboundaries) span exactly `2^{n−1}` dimensions. Result:

   | rule | dim conserved, `n = 1 … 8` | non-trivial laws |
   |---|---|---|
   | **30** | `1, 2, 4, 8, 16, 32, 64, 128` | **0 at every range** |
   | 184 (control) | `2, 3, 5, 9, 17, 33, 65, 129` | 1 at every range — the particle count, the known answer |
   | 204 (control) | `2, 4, 8, 16, 32, 64, 128, 256` | everything, as the identity must |
   | 90, 150 | `1, 2, 4, 8, 16, 32, 64, 128` | 0 |

   A theorist should falsify this at range 9 or 10 before leaning on it.

**What it would give.** It settles the vantage's first question and closes a
family. Because rule 30 conserves no non-trivial additive quantity of range ≤ 8,
Kari–Taati Theorem 41 says no non-trivial shift-invariant Gibbs simplex of that
range is invariant: **there is exactly one ensemble on offer and it is the
featureless one.** So "find a better measure, one that sees rule 30's structure"
is not a hard route, it is an empty one. What remains after granting all of it is
the whole prize.

*Novelty.* That rule 30 has no additive invariant is very likely known — Hattori
and Takesue tabulated additive invariants for the elementary rules, and
Boccara–Fukś give the criterion. **UNVERIFIED** that rule 30 appears in that
table with no invariant: I searched (`Boccara Fuks conservation laws elementary
cellular automata additive conserved quantities rule 30 none`) and reached only
secondary descriptions, and the Fukś paper the project holds
(`fuks-2013-sequences-of-preimages.txt`) is about preimage counts, not
invariants. What I believe is new here is only the *composition*: no invariant
⟹ (Kari–Taati) no invariant Gibbs simplex ⟹ the formalism has one ensemble and
it is trivial.

---

### 3.2 The seed can never be shown generic by an ensemble theorem, and this is a theorem

**The claim.** The strongest ensemble-to-point bridge that exists — the effective
ergodic theorem — has a hypothesis that the seed provably fails, and it fails not
by accident but by *equivalence*: being typical for every computable mixing
dynamics is exactly Schnorr randomness, and no computable point is Schnorr
random. The seed is computable by construction. So the ensemble route is
unavailable in principle, and the unavailability is a citable theorem rather than
a shrug.

**The dictionary.**

| This project | Effective ergodic theory | Status |
|---|---|---|
| "The centre column has the ensemble's statistics" | The point is *typical*: its Birkhoff averages converge to the integrals | exact |
| The ensemble `μ` | A computable probability measure on a computable probability space | exact — `μ` is uniform Bernoulli, as computable as a measure gets |
| Rule 30 / the shift | A computable measure-preserving mixing dynamic | exact |
| "The seed is one point of a full-measure set" | The point must pass the tests the theorem's proof uses | the bridge |
| `initialConfig` | A **computable** point of the space | exact, and fatal |
| The conclusion wanted | "This point is typical" | equivalent to "this point is Schnorr random" |

**Seams.** (i) The equivalence is with *Schnorr* randomness, the weakest of the
standard notions used here; strengthening to Martin-Löf only makes the hypothesis
harder. (ii) Schnorr randomness does not imply normality-style conclusions for
free in the other direction — a computable point *can* be normal (Champernowne),
so this argument does **not** say the seed fails Prize 2; it says the ensemble
cannot be what shows it. That distinction is the whole content and I want it read
carefully. (iii) The theorem quantifies over *computable* dynamics and
observables; an argument using a non-computable object could in principle evade
it, but no such argument exists for anything, and it would not be a thermodynamic
one.

**Why no computable point is Schnorr random**, in one line so it can be checked:
if `x` is computable, let `U_n` be the cylinder of its first `n` bits. The
sequence `(U_n)` is uniformly computable, `μ(U_n) = 2^{−n}` is a computable real,
and `⋂ U_n = {x}`. That is a Schnorr test, and `x` fails it. (The same set is
effectively closed of measure zero, so `x` is not even Kurtz random.)

**What it leans on.** *Randomness on Computable Probability Spaces — A Dynamical
Point of View*, <https://drops.dagstuhl.de/opus/volltexte/2009/1828/>, abstract
fetched (the authorship — Gács, Hoyrup, Rojas — comes from the search listing,
not from the fetched page):
"*a point is Schnorr random if and only if it is typical for every mixing
computable dynamics*", where "*a point is typical for some dynamic, if it follows
the statistical behavior of the system (Birkhoff's pointwise ergodic theorem)*".
The one-line non-randomness of computable points is elementary and given above
rather than cited.

**The test.** This one is a statement rather than a script, and it is the
statement a theorist should try to break:

> There is no theorem of the form "for every `μ`-generic `x`, `P(x)`" — with `μ`
> the uniform Bernoulli measure and `P` any property whose complement is an
> effectively-null set — that has `initialConfig` as an instance. Falsify by
> exhibiting an ergodic-theoretic theorem whose exceptional set is *not*
> effectively null and whose conclusion is about a named computable point.

I could not find one, and the shape of the literature is against it: the
exceptional sets in these theorems are exactly the effectively-null ones, because
that is what their proofs construct.

**What it would give.** It is a negative, and the brief said plainly that a proof
that the ensemble route is unavailable in principle is worth as much as a route.
Here is what it costs, itemised, because the cost is the deliverable: **every**
one of the following becomes unavailable as a *route to the seed*, while
remaining true as a statement about `μ`: Gibbs-measure genericity, `g`-measure
uniqueness, specification-based orbit construction, large-deviation bounds,
equidistribution and normality theorems, Sarnak- and Gowers-type correlation
bounds, and all of their effective versions. What survives is exactly what the
board already lives on: arguments that use the seed's *definition* — the cone,
the left edge at speed 1, the diagonal recurrence, the sideways solve. A proof of
Prize 1, if it exists, reads the program, not the distribution.

And one cheap thing a captain gets in exchange, a filter that costs nothing to
apply:

> **Reject on sight any proposed argument whose only use of the seed is that it
> is a point of a full-measure set.** Not because it is hard, but because the
> conclusion it wants is equivalent to a randomness notion the seed provably
> lacks.

---

### 3.3 The firing potential: the board's `1/4` is a first derivative, and the second derivative can see determinism

**The claim.** The board's measured `1/4` density of the `c·r` firings is exactly
`−P′(0)` for an explicit analytic pressure function of a one-dimensional lattice
gas, and the *second* derivative of that same function is an instrument with real
discriminating power: it separates the seed's own settled region — deterministic,
closed-form, understood — from its chaotic bulk, while the density does not
distinguish them at four decimal places.

**The dictionary.**

| This project | Lattice gas | Value |
|---|---|---|
| Rule 30 = rule 150 `⊕` the monomial `c·r` (Rosetta) | The interaction is the nearest-neighbour term `1[x_0 = x_1 = 1]` | exact |
| A `c·r` firing at a site | The pair `11` occupied; energy `1` | exact |
| The `1/4` firing density, measured at every scale | `−P′(0)`, the expected energy per site | `0.25` exactly |
| The transfer operator of the potential | `M = [[1,1],[1,e^{−β}]]` | exact |
| Pressure | `P(β) = log[(1+e^{−β}+√((1−e^{−β})²+4))/2]` | `P(0) = log 2` |
| Fluctuation of the firing count per row | `P″(0)`, the susceptibility | `5/16 = 0.3125` |
| `β → ∞` | The golden-mean shift, `11` forbidden, `P = log φ = 0.4812` | the ground state |
| The settled region left of the seam | A region of *known* structure — diagonals of period `2^k` | the control the picture supplies itself |
| The transient band and the origin | The region the residual lives in | the target |

**Seams.** (i) One dimension, finite range, so `P` is real-analytic and there is
**no phase transition** — nothing in the pressure has a singularity that could
correspond to the wall, and this kills the "criticality" reading of rule 30
before it starts. (ii) The instrument is a statistic of the *picture*, not of the
column, and the residual is about the column; a picture-level statistic that says
"generic" does not say the column is aperiodic. (iii) A finite-depth measurement
cannot refute an asymptotic statement with a large onset — the board's own
`1010001001`, whose onset was 798,077 rows, is the calibration.

**What it leans on.** The transfer-matrix pressure of the nearest-neighbour
lattice gas is textbook and I derive it rather than cite it; the two derivative
identities are checked numerically in the script against their exact values
(`−P′(0) = 0.2500000000` against `1/4`, `P″(0) = 0.3124989156` against `5/16`).
The reading of rule 30 as rule 150 plus `c·r` is Rosetta's, on this board.

**The test.** `node explorer/parallax3_pressure2.mjs` and
`node explorer/parallax3_control.mjs`, `T = 20,000` rows each.

| source | firing density (`−P′(0) = 0.25`) | row fluctuation (`P″(0) = 0.3125`) | worst block `χ²` z-score, `k ≤ 15` | block samples |
|---|---|---|---|---|
| i.i.d. fair rows (the ensemble itself) | `0.2499939` | `0.312766` | `2.4` | 36.3 M |
| rule 30 from one random row (a `μ`-typical orbit) | `0.2500081` | `0.309835` | `2.8` | 90.3 M |
| **the seed, chaotic bulk `[−0.20t, t]`** | `0.2500217` | `0.315006` | `2.1` | 16.4 M |
| **the seed, settled region `[−t, −0.30t]`** | `0.2498952` | **`0.198332`** | **`6790`** | 9.5 M |

Read the last two rows together. The firing density agrees to four decimal
places in a region we can write down in closed form and in a region we cannot;
**the first derivative of the pressure is blind to determinism.** The
susceptibility is not: `0.198` against `0.3125`, a 37 % deficit, and the block
`χ²` separates the settled region at `k = 3` already (`z = 3.3`) and by
`z = 6790` at `k = 15`, while the bulk stays inside its controls at every `k`.

A control of mine failed first and is worth recording: the "rule 30 from a random
row" run initially read density `0.226` and fluctuation `7.49`. The array had
white cells at its ends, and boundary damage moves **right at speed exactly 1**
(`evolve_right_edge`), so after `T` steps half the array was not rule 30 on `ℤ`
at all. Repaired by measuring only the provably uncontaminated middle of an array
`6T` wide.

**What it would give.** Not the wall. What it gives is a calibrated instrument,
and I have to be careful about what it can be pointed at, because the obvious
aim is wrong. The tempting move — "assume the centre column is eventually
periodic, then by the sandwich lemma a whole strip is eventually periodic, so the
susceptibility there must be deficient, and it is not" — **gains nothing**,
because the sandwich lemma needs *two* eventually periodic columns and Jen's
theorem already excludes that conjunction unconditionally. The honest aim is
narrower: a periodic centre column drives the right half-line, and the board's
obstruction 9 measured what that buys — for `b = (10)^∞`, column 1 of `X_b` has
`48` distinct factors of length 32 where the seed's centre column has `499,949`,
"a locally regular picture punctured by defects". Local regularity of that kind
is exactly what a susceptibility deficit detects, and §3.3's own settled region
is the calibration showing the detector works where the density does not. So the
instrument is real and points at the right half of the picture. Whether it yields
a *better* period-exclusion certificate than the board's factor-complexity counts
at equal cost is not settled here, and I do not claim it does — the two are
plausibly the same information in different coordinates.

---

### 3.4 The g-measure route dies at the variation, exactly and measurably

**The claim.** The width-2 trace of rule 30 — the pair of columns `(0,1)`, which
is precisely the object of Kopra's theorem and Jen's sandwich lemma — is *not* a
`g`-measure for a continuous `g`: its variation does not decay at all, sitting at
the maximum observed value `1/2` at every memory depth up to 10. So the entire
Ruelle–Walters–Bowen apparatus, and the sharp `ℓ²` regularity threshold the field
has established, are out of reach not by a margin but by the whole distance.

**The dictionary.**

| This project | g-measures / chains with complete connections | Status |
|---|---|---|
| The centre column under `μ` | A chain with `g ≡ 1/2` | exact — and *therefore useless* (§3.1) |
| The pair `(column 0, column 1)` under `μ` | The first non-degenerate trace; a stationary process on `{0,1}²` | exact; measured exactly to depth 13 |
| Realisable pair words | A proper subshift: `4, 12, 32, 80, 200, 496, 1208, 2916, 6964, 16476, 38616, 89844, 207544` | growth ratio falling to `2.3100`, entropy `1.3587` bits/step at depth 13 |
| `sideways_inverse`: columns 0 and 1 determine everything to the left | The past determines the "environment" | exact |
| Column 2 and beyond | The **hidden** state the next symbol depends on | the seam |
| `var_k(g)` | Dependence of the next symbol on the past beyond `k` steps | measured `≥ 1/2` for `k ≤ 10` |
| Summable variation | Walters' unique `g`-measure; Bowen's condition; a transfer operator with a spectral gap | unreachable |
| Square-summable variation | The sharp threshold (Johansson–Öberg / Berger–Hoffman–Sidoravicius) | unreachable |

**Seams.** (i) The measurement is of the finite-past conditionals, which are
averages of the infinite-past ones, so the computed spread is a **lower bound**
for the true variation — the logical direction is the right one for a negative.
(ii) `var_k` for `k` close to the table depth is finite-size limited (the groups
become singletons); the honest range is `k ≤ 8`, where each group still holds
about thirty pasts on average, and there `var_k = 1/2` exactly. (iii) The
mechanism is identifiable and is not an artefact: `d_{t+1} = c_t ⊕ (d_t ∨ e_t)`
depends on column 2, which the pair's own past does not determine, and the board's
shield obstruction says infinitely many configurations share a centre column — so
the coding from the ensemble to the trace is infinite-to-one with unbounded
fibres, which is exactly the situation in which factors of Gibbs measures go
non-Gibbsian.

**What it leans on.**

- *Nonuniqueness for specifications in `ℓ^{2+ε}`*,
  <https://arxiv.org/abs/math/0312344>, abstract fetched (**UNVERIFIED**
  authorship: I believe this is Berger, Hoffman and Sidoravicius, but the fetch
  returned only the abstract text and I did not confirm the author line): "*For every
  `p>2`, we construct a regular and continuous specification (`g`-function), which
  has a variation sequence that is in `l^p` and which admits multiple Gibbs
  measures.*" This is what fixes `ℓ²` as the sharp regularity threshold, against
  the Johansson–Öberg uniqueness result it cites.
- Dooley and Rudolph, *Non-uniqueness in `G`-measures*, Ergodic Theory and
  Dynamical Systems, abstract fetched at
  <https://www.cambridge.org/core/journals/ergodic-theory-and-dynamical-systems/article/abs/nonuniqueness-in-measures/FEF26A96A62CE5CBFB2BBBB6DD2D1478>:
  "*Bramson and Kalikow and Quas showed the phenomenon of non-uniqueness for
  `g`-measures in the absence of a `C¹` condition on `g`.*"
- For the non-Gibbsian shape of the phenomenon, the CA-specific instance:
  *Non-Gibbsianness of the invariant measures of non-reversible cellular automata
  with totally asymmetric noise*, <https://arxiv.org/abs/math-ph/0101014>
  (authorship not confirmed by the fetch, which returned only the abstract),
  abstract: "*We present a class of
  random cellular automata with multiple invariant measures which are all
  non-Gibbsian.*" The seam is that theirs are noisy and `d > 1`; the resemblance
  is a family resemblance, not a transplant.

**The test.** `node explorer/parallax3_gvariation.mjs`, exact enumeration of all
`2^{2n}` windows to `n = 13` (67,108,864 windows), giving the trace measure with
no sampling error. Conditional distributions from the depth-13 table (89,844
realisable pasts of length 12):

| `k` (recent pair symbols held fixed) | groups | `var_k` |
|---|---|---|
| 0 | 1 | `0.50000000` |
| 2 | 12 | `0.50000000` |
| 4 | 80 | `0.50000000` |
| 6 | 496 | `0.50000000` |
| 8 | 2,916 | `0.50000000` |
| 10 | 16,476 | `0.50000000` |
| 12 (= full past, singleton groups) | 89,844 | `0.00000000` |

To falsify: push to `n = 15` or `16` with a better algorithm and show `var_8`
falling below `1/2`, or exhibit a pair of realisable pasts agreeing on their last
eight symbols whose next-symbol conditionals differ by less than the table says
they can.

**What it would give.** It closes the specific branch of the vantage the brief
named. Bowen's condition and the `g`-measure machinery cannot be established here
— not "have not been", cannot: the object they would be established for has
non-vanishing variation, measured exactly. It also flags something for whoever
reads Kopra next: the width-2 trace, the strongest published object near Prize 1,
is a genuinely non-trivial subshift of entropy about `1.36` bits per step, with a
measured growth ratio settling towards `2.31`. That number is not on the board and
is cheap to extend.

---

### 3.5 The seed's empirical measure is a `μ`-limit object, and that class is arithmetically as hard as it gets

**The claim.** The question "does the seed's picture have a limiting empirical
measure, and is it the uniform one" is an instance of a problem the field has
already classified, and the classification says no general theorem can answer it:
`μ`-limit sets of cellular automata have `Σ⁰₃`-hard languages and every
non-trivial property of them is `Π⁰₃`-hard. So the missing ingredient the brief
identified — a limiting empirical measure for the transient band — is not missing
from this board by oversight; it is the kind of object that is hard on purpose.

**The dictionary.**

| This project | `μ`-limit set theory | Status |
|---|---|---|
| The picture of the seed, row by row | The orbit of an initial measure under the CA | exact if the initial measure is `δ_seed` |
| The band's empirical statistics as `t → ∞` | The words whose probability does not vanish with time | the definition |
| "The centre column has density `1/2`" | A statement about the `μ`-limit measure's one-cylinder | exact |
| The transient band `E = picture ⊕ S` | The part of the picture with no known limiting statistics | the gap the brief named |
| "No general theorem gives it" | `Σ⁰₃`-hard language, `Π⁰₃`-hard properties | the field's own verdict |

**Seams, and this one is a real miss.** The theory is developed for `μ` with full
support — a random initial configuration — and the seed is a delta mass on a
configuration of finite support. So the hardness theorems do not *apply* to
`δ_seed`; they establish that the *class* of questions is arithmetically
maximal, which is evidence about the difficulty and not a theorem about rule 30.
I state the connection because the shape is right and a captain should know the
field exists, and I mark the gap rather than paper over it. A second seam: the
hardness is about the class of all CA, so it is compatible with rule 30 in
particular being easy.

**What it leans on.** Boyer, Delacourt, Poupet, Sablik and Theyssier, *`μ`-Limit
Sets of Cellular Automata from a Computational Complexity Perspective*,
<https://arxiv.org/abs/1309.6730>, abstract fetched: "*This paper concerns
`μ`-limit sets of cellular automata: sets of configurations made of words whose
probability to appear does not vanish with time, starting from an initial
`μ`-random configuration. … Main results: first, `μ`-limit sets can have a `Σ₃⁰`-hard
language, second, they can contain only `α`-complex configurations, third, any
non-trivial property concerning them is at least `Π₃⁰`-hard.*"

**The test.** Not a script. The statement to attack: *the sequence of empirical
measures `ν_T = (1/T) Σ_{t<T} δ_{σ^{?}(row t)}` of the single-seed picture
converges weakly, and its limit is the uniform Bernoulli measure.* Convergence
itself is unproved and is the ingredient every ensemble route silently assumes.

**What it would give.** Nothing towards the wall, and I say so. What it gives a
captain is a name for the gap and a reason not to send a session to close it by
general theory.

---

### 3.6 Ergodic optimization: the field's typical answer is the negation of Prize 1

**The claim, as sweeping as I believe it.** Any attempt to characterise the
seed's column as the solution of a variational problem — a ground state, a
maximiser, a zero-temperature limit — is not merely unlikely to work; it is
aiming at a class of objects whose *generic member is a periodic orbit*, which is
exactly what Prize 1 denies. Selection principles are therefore the wrong tool
here, and this can be said before any of them is tried.

**The dictionary.**

| This project | Ergodic optimization | Status |
|---|---|---|
| The shift on column space | An expanding transformation | exact |
| A potential built from the picture (e.g. the firing potential) | A Lipschitz or Hölder function `F` | exact |
| "The column is picked out by minimising/maximising something" | The maximizing measure of `F` | hypothetical |
| The generic outcome | **Supported on a single periodic orbit** | Contreras' theorem |
| The seed's column | Conjecturally not periodic at all | the collision |

**Seams.** The seed is not known to be a maximiser of anything, so the theorem
does not apply — it only says where the tool points. And "generic" is in the Baire
sense in the space of potentials; a specific potential can of course have a
non-periodic maximiser. So this connection is a warning, not an obstruction, and
that is the honest reading.

**What it leans on.** Contreras, *Ground states are generically a periodic
orbit*, <https://arxiv.org/abs/1307.0559>, abstract fetched: "*for an expanding
transformation the maximizing measures of a generic Lipschitz function are
supported on a single periodic orbit*". (The journal reference — Inventiones
math. 205 (2016) 383–412 — is from the search listing, not from a fetch.)

**The test.** Exhibit any potential, Lipschitz on column space, whose maximizing
measure is supported on the orbit closure of the seed's column. I could not
construct one and expect none exists.

**What it would give.** It touches no part of the residual. It saves a session:
zero-temperature and ground-state framings of rule 30 are pointed the wrong way,
and now there is a fetched theorem saying so.

---

## 4. Died in translation

- **Bounded distortion as a source of a useful constant.** The brief's hope that
  `window_count_half` and the four-preimages structure would "supply bounded
  distortion its constant" is exactly right and exactly empty: the constant is
  `1`. Every word has exactly `4` preimages because rule 30 is *surjective*, and
  the Gibbs constant of a transfer operator with constant weights is `1`. **Seam:
  the property that makes the formalism applicable is the property that makes it
  say nothing, and Fukś's own paper draws the same line — his non-trivial
  preimage sequences are all for the non-surjective rules.**
- **Specification for the de Bruijn / preimage structure.** Also establishable
  and also empty. The de Bruijn graph of a surjective ECA has every transition
  present, so the associated shift is the full shift and has specification in the
  strongest form. **Seam: specification gives you, for any prescribed sequence of
  statistics, *a* point realising them. It never gives you *the* point, and the
  residual names its point.**
- **Thermodynamic formalism applied to the CA map `F` itself rather than to the
  shift.** Rule 30 is left-permutive but not right-permutive, hence not
  positively expansive, so it is not conjugate to a full shift and the Ruelle
  operator has no home. **Seam: the formalism needs expansiveness and rule 30's
  only expansive behaviour is directional — which is a different connector's
  vantage (`2026-09-08-algebraic-and-expansive-subdynamics…`), not this one's.**
- **The space-time picture as a two-dimensional Gibbs field.** `Σ_F ⊂ {0,1}^{ℤ²}`
  is a nearest-neighbour SFT, so it looks like an Ising-type model. Its `ℤ²`
  entropy is `0`: an `n × n` admissible pattern is determined by `O(n)` cells, so
  `log N(n)/n² → 0`. **Seam: two-dimensional thermodynamic formalism has nothing
  to work on — the model is deterministic, which is a hard constraint, i.e. a
  potential taking the value `−∞`.**
- **The settled region as a statistical fingerprint.** I expected the settled
  region — periodic diagonals, closed form, zero entropy as a dynamical object —
  to be visibly non-random at first order and hoped its signature could be a
  detector. Its firing density is `0.2498952`, the ensemble's value to four
  places, and its block entropy at length 12 is `0.9987` bits per site. **Seam:
  first-order statistics cannot see determinism, and this is measured on a region
  where determinism is *known*. It took `P″(0)` to see it (§3.3), which is the
  only reason that section exists.**
- **The zero-temperature limit of the firing potential.** `β → ∞` gives the
  golden-mean shift with `11` forbidden and pressure `log φ = 0.4812`. **Seam:
  rule 30's pictures contain `11` at density exactly `1/4`; the ground state of
  the natural potential is the configuration class rule 30 most conspicuously is
  not.**
- **Chazottes–Ugalde-style criteria for the Gibbsianness of a factor.** These
  give conditions under which the image of a Gibbs measure under a coding stays
  Gibbs. **Seam: they want finite-to-one or bounded-fibre codings, and the board's
  own shield obstruction proves rule 30's column coding has unbounded infinite
  fibres — infinitely many pairwise distinct finite configurations share the
  seed's centre column. The hypothesis fails maximally.**
- **The number-like class as an entropy-deficient class.** I hoped to show that
  the class the seed actually lives in — configurations white on `x ≤ −1` — has a
  column prefix language of *zero* exponential growth, which would say the
  ensemble does not even approximately model the seed's class. Independent
  recount (`explorer/parallax3_naive.mjs`) reproduces the board's numbers exactly
  and extends them: `2, 3, 4, 6, 8, 10, 12, 15, 19, 24, 31, 38, 44, 51, 58, 66,
  76, 86` for lengths `1 … 18`. The fitted exponent is `2.07` over lengths 11–18
  and `2.17` including the board's `153` at length 23. **Seam: `n^{2.1}` and
  `2^{0.24n}` are indistinguishable over this range, which is exactly what the
  board's obstruction already says; I added six data points and no separation.
  Settling it needs an algorithm that does not enumerate `2^n` configurations,
  and I did not find one.**
- **The multifractal formalism / level sets of Birkhoff averages.** The natural
  reflex once genericity is the question: the set of non-generic points is null
  but has full Hausdorff dimension, and the formalism computes the dimension of
  each level set. **Seam: it says the exceptional set is *large*, which is the
  wrong direction — it makes membership more plausible, not less, and it still
  says nothing about a named point.**
- **A Markov-order collapse for the width-2 trace.** If `var_k` had vanished at
  some finite `k`, the trace would be a Markov measure of that order and the whole
  question would become finite linear algebra. It does not: `var_k = 1/2` at every
  `k ≤ 10` (§3.4).
- **The susceptibility deficit as a direct attack on the wall.** I wanted this
  one and it does not work. "Assume the centre column is eventually periodic;
  then by the sandwich lemma a strip of columns is eventually periodic; a
  spatially and temporally periodic strip has a deficient susceptibility; measure
  and find none." **Seam: the sandwich lemma needs two eventually periodic
  columns, and Jen's theorem excludes that conjunction unconditionally, so the
  argument refutes only what is already refuted. Any statistical detector aimed at
  the wall has to be driven by the periodicity of the centre column alone,
  through the right half-line, and there the board's factor-complexity
  certificates already occupy the ground.**
- **Rediscovering the `1/4` as evidence of anything.** It is `−P′(0)` and it is
  the same number for the ensemble, for a `μ`-typical orbit, for the seed's bulk
  and for the seed's *deterministic* settled region. Any argument that treats
  "the density is `1/4`" as evidence of randomness is refuted by the fourth of
  those.

---

## 5. What to hand the theorist

**Topic 1 — a small, provable theorem that retires a family of routes.**

> **`centerColumn_trace_uniform`.** For every `n`, and every word
> `v : Fin (n+1) → Bool`, the number of windows `w : Fin (2n+1) → Bool` with
> `(fun i : Fin (n+1) => evolveFrom (ofWindow w) i 0) = v` is exactly `2^n`.
>
> **The dictionary row it depends on:** "the ensemble's centre column" ↔ "the
> trace measure of the uniform Bernoulli measure", and the claim is that this
> measure is *exactly* Bernoulli(1/2), not approximately.
>
> **What settles it:** the five-line proof in §3.1 — fix the `n` cells at
> positions `1 … n` as parameters, and the map from the cells at
> `0, −1, …, −n` to the column word is triangular over `F₂` with unit diagonal by
> `evolveFrom_leftPermutive` at radius `t`. Kernel-checked at `n = 1, 2, 3`
> (`explorer/parallax3_scratch_trace.lean`, accepted by `lake env lean`),
> enumerated exhaustively to word length 12 in two independent implementations.
> It generalises `window_count_half`, which is its marginal at one time, and
> should cost about the same.

I want to be explicit about what this is not: it is **not** a step towards the
wall, and no decomposition of it is. Its value is that it converts the
meta-obstruction from a mood into a citable theorem — after it, "the ensemble
knows nothing about rule 30's column" is a proved statement of the project's own,
in the project's own vocabulary, and every future proposal that reaches for a
measure can be answered with a node number instead of an argument.

**Topic 2 — for a captain rather than a theorist, because it is a filter.**

> **The ensemble filter.** Reject any proposed argument whose only use of the
> seed is that it is a point of a full-measure set. Three independent reasons,
> each checkable: (i) the ensemble is *exactly* featureless (§3.1) and, by
> Kari–Taati plus the measured absence of conservation laws, it is the only
> ensemble available; (ii) the seed is computable, and being typical for every
> computable mixing dynamics is *equivalent* to Schnorr randomness, which no
> computable point has (§3.2); (iii) the eventually periodic sequences are dense
> in the support of every candidate Gibbs measure, so no support or positivity
> argument can separate them from their complement (§3.1, seam iii).

If a theorist's session is to be spent on only one thing here, spend it on Topic
1. Topic 2 costs nothing and pays every time.

---

## 6. Next vantage

**Attack from proof theory and the census of aperiodicity proofs in print:
reverse mathematics of `Π⁰₂` statements about explicit computable sequences,
together with combinatorics on words.** Here is why, and it follows from this
document rather than from taste. §3.2 shows the seed's computability is not one
obstacle among several — it is the *only* remaining handle, because it is exactly
what disqualifies every ensemble argument while leaving the program itself
untouched. So the question a connector should ask next is empirical and
answerable: **every proof in print that a specific, explicitly defined computable
sequence is not eventually periodic — what structure did it use?** Thue–Morse and
the Kolakoski neighbourhood use substitutions and morphic structure; Sturmian
sequences use a rotation; the automatic sequences use a finite automaton (and my
own third session put that route *above* Prize 1, so it is spent); the algebraic
ones use a functional equation. Lay those side by side as a dictionary — one row
per known proof, one column for the structure it needed, one column for whether
rule 30 has it — and the empty rows are the map of what is left. That is
precisely a connector's motion and no theorist will do it.

The specific thing I could not reach from where I stood, and would hand to
whoever takes that vantage: **the transcendence and Diophantine route — Mahler's
method and the Adamczewski–Bugeaud complexity theorems**, which derive
aperiodicity (indeed irrationality and transcendence) of an explicit real from a
*bound on its factor complexity* rather than from an ensemble. That is the one
family I know of whose conclusion is about a single named number and whose
hypothesis is a combinatorial property of that number's own digits — the exact
shape this problem needs, and the exact shape the thermodynamic formalism cannot
supply. Whether rule 30's centre column satisfies any hypothesis of that family
is open, and it is a bounded question: their hypotheses are complexity bounds,
and this board already measures complexity well.
