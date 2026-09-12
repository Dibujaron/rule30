# Normal numbers and explicit constructions, aimed at Prize 2

*A sighting, not a proof. Rosetta, 2026-09-12. Vantage handed on by Parallax at
the end of its arithmetic-dynamics sighting.*

Nothing here is a theorem about rule 30. Every claim is either a fetched quote
with its URL, a computation in `explorer/rosetta_*.mjs` run at the depth stated,
or marked **UNVERIFIED** with the search that failed.

---

## 1. The problem, seen from outside

Here is an infinite string of bits. It is produced by a fixed three-cell rule
applied over and over to a line of cells that starts with a single one, and the
string is the record of what the starting cell does at each step. The string has
been computed to ten million bits. Two things are believed about it and neither
is proved: that it never falls into a repeating pattern, and that the two bits
occur equally often in the limit. Read the string as the binary expansion of a
real number. The first belief says that number is irrational. The second says it
is **simply normal in base 2** — every real number is simply normal in base 2
except for a set of measure zero, and this particular one has resisted for forty
years.

The node this sighting is nominally aimed at is the implication *"if the string
repeats then some neighbouring string repeats"*, which the board has shown is
logically equivalent to the first belief. The vantage redirects to the second,
and the redirection is worth stating precisely, because the two are not the same
rung of one ladder:

- **Simple normality in base 2** (all one-bit blocks equifrequent) is exactly
  Prize 2. It does **not** imply aperiodicity: `(10)^∞` is simply normal and
  periodic.
- **Normality in base 2** (all `k`-bit blocks equifrequent, for every `k`) does
  imply aperiodicity, because a sequence of period `p` has at most `p` distinct
  factors of each length and so fails at every `k > log₂ p`. Full normality
  implies both prizes.
- Neither of the two prizes implies the other, and the rung between them —
  normality at some fixed block length `k ≥ 2` — implies neither, since a
  periodic de Bruijn sequence is normal at every length below its own.

So Chorobates's fence reads, sharpened: *normality at block length 1 is Prize 2,
normality at all block lengths is strictly more than Prize 1 and Prize 2
together, and there is no rung of the normality ladder that sits below either
prize.* A normality result about this column would **be** a prize, never an
approach to one. That is why the useful question is not "is the column normal"
but **what do the proofs for the constants that are known to be normal actually
run on, and does rule 30 supply any of it.**

### The vantage's first question, answered before anything else

Parallax could not take this vantage because *"it needs an explicit construction
of the digits and rule 30's digits are defined by a recurrence rather than
built"*, and asked whether that distinction is fatal or merely inconvenient.

**It is neither. It is the wrong axis, and believing it is the right one costs a
session.** Two counterexamples, one on each side:

- The **Stoneham constant** `α_{2,3} = Σ 1/(3ⁿ 2^{3ⁿ})` is not "built" in any
  sense — it is a series, its digits were not chosen for the purpose, and its
  2-normality was *discovered* and then proved. So a constant can be
  recurrence-like and still have a normality proof.
- The **Thue–Morse sequence** is defined by a pure recurrence — `t₀ = 0`,
  `t_{2n} = t_n`, `t_{2n+1} = 1 − t_n` — is aperiodic, and its block-length-1
  balance is *exact*: `Σ_{t<2M} t_t = M` for every `M`, because each pair
  `(2n, 2n+1)` contributes exactly one. That is a Prize-2-shaped statement,
  proved in one line, about a sequence defined exactly the way rule 30's is.
  (Measured here as a control: excess exactly `0` over `2²⁰` terms,
  `explorer/rosetta_symmetry.mjs`.)

The real axis is what the proof runs on, and §3 argues it has exactly three
settings. The distinction Parallax feared is not even inconvenient; it is a
category the literature does not sort by.

---

## 2. Fields sighted

| Field / theory | The object there that matches something here | The seam, in one line |
|---|---|---|
| Metric number theory (Borel 1909) | almost every real is simply normal base 2 | says nothing about one point, and the column is one point |
| Explicit concatenations: Champernowne 1933, Besicovitch 1935, Copeland–Erdős 1946, Davenport–Erdős 1952 | the digit string as a concatenation of blocks with known boundaries | rule 30's blocks (diagonals, period regimes) run across the column, never along it — Portage's seam in new vocabulary |
| BBP / digit extraction and the Stoneham class (Bailey–Crandall 2002) | `2^N mod 3^m` ↔ the packed-row map `T_n` on `ℤ/2ⁿ` | over there the orbit is a whole group of density `2/3`; here it is a rho's *tail*, and the cycle's density is `3.1e−120` at `n = 400` — essentially `2^{-n}` (§3.2) |
| Effective constructions: Turing, Becher–Figueira, Becher–Heiber–Slaman 2013 | an algorithm that writes digits so as to defeat a counting test | rule 30 cannot choose a digit; the construction *is* the proof and there is nothing to transfer |
| Substitutions and automatic sequences (Thue–Morse) | exact balance from a length-2 balanced substitution | crystal 73: the column is not 2-automatic; and rule 30's symmetry stabiliser is trivial (§3.3) |
| Sturmian words / codings of irrational rotations | an aperiodic sequence whose letter density is *proved exactly* | the mechanism is an isometry; Kopra's multiplier is expanding, the opposite (§3.5) |
| Finite-state randomness, Schnorr–Stimm; martingales | Prize 2 as "no constant-bet gambler compounds" | Chorobates's fence: this is the prize restated, not a route to it |
| Discrepancy theory; low-discrepancy normal numbers (Korobov, Levin) | the excess `E(N) = 2·count(N) − N` | constructed normals have discrepancy far below `√N`; rule 30's excess is `1.34 √N` at `2²⁰` — it has a random number's signature, not a construction's |
| Combinatorics on words: factor complexity | the column's factor complexity | every *renormalisation* proof needs low complexity; the column's is near-maximal (41,132 distinct 16-blocks in `2¹⁶`, §3.1) |
| Coding theory: balanced and complement-closed codes | the set of reachable rows as a code | not complement-closed — Sextant's attained row density `3/5` forbids it |
| Weyl sums for digital functions (Mauduit–Rivat) | exponential sums over the digit function | already sighted 2026-09-09; needs an additive or multiplicative structure on the index, and the column has none |
| Equidistribution of `(p/q)^i mod 1` (Kopra's own motivation) | the project's one genuine outside connection | the source problem is itself open — Kopra borrows *from* CA, not to them |
| **Unlikely:** Garden-of-Eden / surjunctivity as a "balanced code" | Amoroso–Cooper: finite configurations have forbidden images | the forbidden set is `4^{-t}` sparse and imposes no density ceiling (Sextant, 2026-09-12) |
| **Unlikely:** the arithmetic of the *row* concatenation `0.rowNat(1)rowNat(2)…` | a Champernowne constant built out of rule 30 | the column sits at positions `t² + t`, and a normal number's digits along a polynomial are unconstrained (§3.4) |

---

## 3. Connections

### 3.1 The method space of block-length-1 balance has exactly three settings, and rule 30's column is in none of them

**The claim.** Every sequence in print whose one-bit balance is *proved* obtains
it from one of exactly three mechanisms — a **renormalisation** (a self-similar
recursion with balanced images), a **known block decomposition** (boundaries you
can write down, with per-block statistics you can count), or an **explicit
algebraic orbit** (digit `N` is a function of a small algebraic state whose
equidistribution is a group-theoretic fact) — and the rule 30 centre column
provably lacks the first and measurably lacks the other two; so Prize 2 is not
merely unproved by this literature, it is outside its method space.

**The dictionary.**

| Mechanism | Where it lives | What it needs | Rule 30's centre column | Seam |
|---|---|---|---|---|
| Renormalisation | Thue–Morse; every automatic sequence; Sturmian words | a substitution or rotation coding, hence **sub-exponential factor complexity** | complexity near-maximal: 41,132 distinct 16-blocks in `2¹⁶` terms against a ceiling of 65,521; the board has 499,949 distinct 32-blocks in a `10⁶` tail | crystal 73 (not 2-automatic) plus the complexity measurement; a renormalisation forces low complexity and the column has high |
| Known block decomposition | Champernowne, Besicovitch, Copeland–Erdős, Davenport–Erdős; also Becher–Heiber–Slaman, where the blocks are the algorithm's stages | boundaries computable from the position, and a count inside each block | the picture **has** block structure — the diagonal period regimes, the doubling depths `3, 8, 29, 400, 87867` — with exact per-block counts (§3.3) | every block runs *along* a diagonal; the column is transverse to every one of them. Obstructions 1, 4, 5 are this seam, three times |
| Explicit algebraic orbit | Stoneham `α_{b,c}`, via `ord_{c^m}(b)` | digit `N` a function of a state of size `O(log N)` whose orbit fills a positive fraction of its space | the state at position `N` is the packed row mod `2^{N+1}`, of size `N` bits, and its orbit segment is the **transient** of a rho (§3.2) | the state is exponentially large and the orbit is not a group — which is what Prize 3 asserts, in other words |
| *(no fourth mechanism found)* | — | — | — | — |

**What it leans on.**

- Champernowne, Copeland–Erdős, Besicovitch, Davenport–Erdős, and the open
  status of the "natural" constants, quoted from a fetched secondary source
  (Wikipedia, *Normal number*,
  <https://en.wikipedia.org/wiki/Normal_number>): *"Champernowne's constant
  0.1234567891011121314151617181920212223242526272829..., obtained by
  concatenating the decimal representations of the natural numbers in order, is
  normal in base 10."*; *"the real number represented in base b by the
  concatenation 0.f(1)f(2)f(3)..., where f(n) is the n-th prime expressed in
  base b, is normal in base b."*; *"Besicovitch (1935) proved that the number
  represented by the same expression, with f(n) = n², … is normal in base
  10."*; *"Harold Davenport and Erdős (1952) proved that the number represented
  by the same expression, with f being any non-constant polynomial whose values
  on the positive integers are positive integers, expressed in base 10, is
  normal in base 10."*; *"It is widely believed that the (computable) numbers
  √2, π, and e are normal, but a proof remains elusive."* The 1933, 1935, 1946
  and 1952 originals were **not** fetched — publisher pages and PDFs did not
  decode from this session — so these are secondary and are flagged as such.
- Becher–Heiber–Slaman, fetched from the CONICET repository record,
  <https://ri.conicet.gov.ar/handle/11336/15636>: *"We give an algorithm to
  compute an absolutely normal number so that the first n digits in its binary
  expansion are obtained in time polynomial in n; in fact, just above quadratic.
  The algorithm uses combinatorial tools to control divergence from normality.
  Speed of computation is achieved at the sacrifice of speed of convergence to
  normality."*
- The complexity and excess figures are computed here
  (`explorer/rosetta_controls.mjs`), not cited.

**The test.** Exhibit a fourth mechanism: a sequence whose one-bit balance is
proved, which has near-maximal factor complexity, no computable block
decomposition, and no algebraic digit-extraction identity. That single example
kills this connection. The negative form a theorist can check cheaply: run the
three detectors on any candidate. In `explorer/rosetta_controls.mjs`, over `2¹⁶`
terms, the renormalisation detector (factor complexity) fires only on Sturmian
(`5, 9, 13, 17` at lengths `4, 8, 12, 16` — exactly `n+1`); the pairing detector
fires only on Thue–Morse (flip rate `1.0000` at `m = 1`); and Champernowne base
2, Stoneham `α_{2,3}` and the rule 30 centre column are **indistinguishable on
every statistic measured** (complexities `32981 / 26188 / 41132` at length 16,
best pairing rates `0.5257 / 0.5063 / 0.5084`, excesses
`11.69 / −0.13 / 0.85` in units of `√N`). That last row is the connection's real
content: the two proved constants that look like rule 30 are proved by their
*construction* and by their *multiplier*, not by anything a statistic can see.

**What it would give.** Nothing positive. It is a fence, and it prices the
region: a Prize 2 proposal in the Champernowne or Stoneham style is refuted in
advance unless it first supplies one of the three settings. What remains after
it is the whole of Prize 2, and the honest reading is that this literature tells
us where *not* to spend a theorist's session.

---

### 3.2 Stoneham is a multiplier method, and rule 30's multiplier orbit is a rho's tail of vanishing density

**The claim.** Bailey–Crandall's proof is, stripped of its analysis, the
statement that `2` is a primitive root modulo `3^m`; the packed-row map
`T_n(r) = (4r ⊕ (2r ∨ r)) mod 2ⁿ` is the exact structural analogue of `r ↦ 2r`
on `ℤ/3^m`; and the correspondence breaks at two measurable places — the orbit
is not a group, and the segment the centre column actually reads lies entirely
in the transient, which is the part of a rho no equidistribution theorem
touches. **So Parallax's death ("no multiplier") is the same death one level
down: there is a multiplier, and it is the wrong kind.**

**The dictionary.**

| Stoneham `α_{2,3} = Σ 1/(3ⁿ 2^{3ⁿ})` | Rule 30 | Seam |
|---|---|---|
| the base, `b = 2` | the rule, as the packed-row map `T` | — |
| the state at digit `N`: `2^N mod 3^m`, `m ≈ log₃ N` | the state at position `t`: `rowNat t mod 2^{t+1}` | `O(log N)` bits over there, `N` bits here; a digit-extraction shortcut *is* a small state |
| the state space `ℤ/3^m`, size `≈ N` | `ℤ/2ⁿ`, size `2ⁿ` | linear vs exponential in the position |
| the orbit `{2^j mod 3^m}` is the full unit group, size `φ(3^m) = 2·3^{m-1}` | the orbit of `1` under `T_n` is a rho: preperiod `1.25 n` to `1.42 n` over `n ≤ 2000` (Sextant's asymptotic is `4/3`), cycle `P(n) ∈ {4, 8, 16}` across that whole range | **orbit density `0.666667` at every `m ≤ 12`, against `3.1e−120` at `n = 400` and `2.4e−240` at `n = 800`.** The cycle length is the left-diagonal period, which doubles only at `3, 8, 29, 400, 87867, …`, so the density is `2^{-n}` up to a factor that is 16 at `n = 2000` |
| the orbit is *purely periodic* and the digits read its periodic part | `centerColumn t` = bit `t` of `T^t(1)`, read at step `t < n` | **`pre(n) > n` for every `n ≥ 21` computed: the read is always in the transient** |
| equidistribution from `b` a primitive root of `p²` | nothing: the cycle is not a subgroup and is exponentially sparse | no group, no characters, no Weyl sum |
| the digits from position `c^m` are the digits of a rational with denominator `c^m` | no rational, no eventual period — that is Prize 1 | the analogue of the *conclusion* is what we are trying to prove |

**What it leans on.** Fetched from the ar5iv rendering of *An arithmetical
excursion via Stoneham numbers*, <https://ar5iv.labs.arxiv.org/html/1212.3449>:
the definition *"αb,c:=∑n⩾1 1/(c^n b^(c^n))"*; the result *"αb,c is b-normal for
all coprime integers b,c⩾2"*; and, for the mechanism, the verbatim fragments
*"period(a/p^m) = ord_{p^m} b"*, *"Let p be a prime and b a primitive root of
p²."* and *"Lemma 2.6. A primitive root of p² is a primitive root of p^k for any
integer k ≥ 2."* The phrases "hot spot" and "multiplicative order" do **not**
occur in that document (checked by fetch). Bailey–Misiurewicz, *A strong hot
spot theorem*, PAMS 134 (2006) 2495–2501, is **UNVERIFIED** — found only in a
search summary; the PDFs at `davidhbailey.com` and `arxiv.org/pdf/...` returned
undecodable binary to this session, which is this region's normal failure.
Stoneham's own 1973 paper is likewise **UNVERIFIED**.

**The test.** Two numbers, both computed in `explorer/rosetta_orbit.mjs`:

- Stoneham's side, `m = 1..12`: `ord_{3^m}(2) = φ(3^m) = 2·3^{m-1}` at every
  `m`, orbit density exactly `0.666667`, primitive root `true` at every `m`.
- Rule 30's side, `n ∈ {8, …, 2000}`: preperiod, cycle length, `pre(n)/n`, cycle
  density. `pre(n) > n` holds for `n = 19, 21, 24, 32, 48, 64, 100, 200, 400,
  500, 800, 1200, 2000` and **fails at `n ≤ 18` and at `n = 20`, where
  `pre(20) = 20` exactly**. That small-`n` exception is not noise: it is
  Sextant's own finding that the centre column has a settled re-reading at
  exactly nineteen depths (`k ∈ {0,…,17,19}`) and never again, arrived at here
  from the T-map side by code that shares nothing with `sextant7_reread2.mjs`.

To falsify: exhibit a subgroup or coset structure in `T_n`'s cycle, or show the
centre column's read escapes the transient for some `n > 20`. Either reopens the
route.

**What it would give.** If the cycle were a coset of a subgroup of
`(ℤ/2ⁿ)^*`-like structure, and if the read were periodic, the Bailey–Crandall
argument would transfer essentially verbatim and would give Prize 2 *and* Prize
1. It is not and it is not, and both failures are measured rather than
suspected. What remains is all of both prizes.

---

### 3.3 Rule 30 has the Champernowne pairing — on every diagonal, and on no column

**The claim.** Every exact one-bit balance in the literature is a **pairing**: an
involution of the index set that complements the value (Thue–Morse's
`t ↦ t ⊕ 1`; Champernowne's `w ↦ ¬w` inside the block of all `d`-bit words). Rule
30 has exactly this mechanism and the board already proves it — a word
antiperiodic at half its period is exactly balanced, and
`rightDiagonal_antiperiodic_of_odd_driver` supplies antiperiodicity at every
period doubling. It is available along every right diagonal and at no index of
the centre column, and rule 30 supplies no pairing of the time axis at all,
because **its stabiliser in the elementary-CA symmetry group is trivial.**

**The dictionary.**

| Pairing proof | Its involution | Rule 30 | Seam |
|---|---|---|---|
| Thue–Morse balance | `t ↦ t ⊕ 1`, and `t_{2n} = 1 − t_{2n+1}` | none: over `2²⁰` terms the most extreme `m < 512` gives flip rate `0.497433`, against Thue–Morse's `1.000000` | the column has no dyadic pairing |
| Champernowne base `b`, inside a length block | `w ↦ ¬w` on all `d`-digit words | would need a complementation symmetry of the picture | **the stabiliser of rule 30 in `{id, mirror, complement, both}` is trivial**: orbit `{30, 86, 135, 149}`; 80 of 256 rules have a nontrivial stabiliser, so the test can say yes |
| shift pairing | `t ↦ t + h` with the value complemented | none: most extreme `h ≤ 1024` gives flip rate `0.501709` | — |
| antiperiodicity at a doubling | `j ↦ j + P/2` on a right diagonal | **exactly this, and it is proved** | the involution acts on the diagonal's index `j`, and the centre column is the read at `j = 0` — one orbit point of the involution, which the involution constrains not at all |

**What it leans on.** The board's own `rightDiagonal_antiperiodic_of_odd_driver`
and `rightDiagonal_periodicFrom_pow` (closed nodes), and `centerColumn t =
rightDiagonal t 0` (`Basic.lean:79, 94`). The "antiperiodic implies exactly
balanced" step is two lines of arithmetic and is **not** on the board. Rowland
2006 is the source of the doubling criterion (`sources/rowland-2006-…`,
Proposition 2), so the composite is *Known* rather than novel.

**The test.** `explorer/rosetta_orbit.mjs` and `explorer/rosetta_balance.mjs`,
right diagonals `k ≤ 30`, minimal periods read from the picture over 9,000 rows.
The minimal periods come out
`1, 2, 2, 4, 8, 8, 16, 32, 32, 64, 64, 64, 64, 64, 64, 128, 256, …` — **the
board's own published list at all ten of its entries**, from an engine written
here. Of the 31 diagonals, 13 are antiperiodic and therefore exactly balanced
(`k = 1, 2, 3, 4, 6, 7, 9, 15, 16, 24, 25, 27, 29`); the remaining 18 are
balanced 4 times against a null expectation of 1.31 (see §4 — that excess is
**not** a finding). The seam is measured too, over the shorter run `k ≤ 24`
where 14 diagonals are balanced and 11 are not: the centre column takes the
value 1 at 8 of those 14 and at 6 of those 11, i.e. the word's exact balance
says nothing whatever about its value at index 0.

The falsifiable statement to hand a theorist is the *converse* direction:
**a sequence of involutions `σ_N` of `[0,N)` with
`centerColumn (σ_N t) = ¬ centerColumn t` for all but `o(N)` of `t` would give
Prize 2 outright.** That is the exact shape a Champernowne proof takes here.
What this connection reports is that rule 30 supplies no candidate `σ`: not from
its symmetry group, not from shifts, not from dyadic reflections.

**What it would give.** The pairing route, if it existed, would give Prize 2
whole and would give it *exactly* (excess bounded, not merely `o(N)`), the way
Thue–Morse's does. It does not exist. What it does give, today, is one small
provable statement — exact density `1/2` along a right diagonal at a doubling —
which is the only exact-one-half statement anywhere in the rule 30 picture, and
is handed on in §5.

---

### 3.4 Copeland–Erdős transferred to the concatenation of rule 30's rows, and why it cannot reach the column

**The claim.** The one place where rule 30 genuinely *is* a concatenation is the
row direction: `0.rowNat(1) rowNat(2) rowNat(3) …` is a Champernowne-type
constant built from rule 30, the board can bound its per-block statistics where
it can bound nothing about the column, and a Copeland–Erdős-style normality
theorem for it is a question with a method. **And it is worthless for Prize 2,
for a reason that is a two-line proof rather than a measurement.**

**The dictionary.**

| Copeland–Erdős | Rule 30's row concatenation | Seam |
|---|---|---|
| blocks are the primes in order | blocks are the rows `rowNat t`, of length `2t+1` | — |
| block boundaries known: cumulative digit counts | boundaries at `Σ_{s<t}(2s+1) = t²` — exactly known | this half transfers cleanly |
| hypothesis: the block sequence is dense enough in the counting sense | the rows are one specific sequence of integers, one per length | the hypothesis has no analogue: there is one row per size, not a positive-density set |
| per-block digit statistics known by counting all integers of that length | Sextant 2026-09-12: the row density is pinned into `[0, 3/5]` with `3/5` attained, and row `2·10⁵` is block-indistinguishable from a coin word | the *bound* transfers, the *count* does not — `3/5 ≠ 1/2` and the ceiling is attained by a genuine rule 30 orbit |
| conclusion: the constant is normal | would be a statement about the picture's rows | **the centre column sits at positions `t² + t` of the concatenation, and normality says nothing about a density-zero set of positions** |

**What it leans on.** The last row is my own argument and needs no citation:
changing the digits of a normal number at a set of positions of density zero
preserves normality, because a `k`-block is affected only if it meets a changed
position and the fraction of such blocks is at most `k` times that density. The
positions `{t² + t}` have density zero. **Hence there is a normal number whose
digits along `t² + t` are all `1`.** So even a complete normality theorem for
the row concatenation would leave Prize 2 exactly where it is. Copeland–Erdős's
statement as quoted in §3.1; the row bounds are the board's
(obstruction *"The row marginal's local route is sharp at 3/5"*).

**The test.** It is already dead by the paragraph above, at every depth at once,
so no script is needed and none was run beyond the row statistics the board
holds. To resurrect it a theorist would have to show that rule 30's
concatenation is normal *along* `t² + t` — which is Prize 2 with extra steps.

**What it would give.** Nothing for Prize 2. It is recorded because it is the
move a reader of this literature makes in the first twenty minutes, and because
the row direction is where the board's own quantitative results live, which
makes the move look better than it is.

---

### 3.5 Sturmian words: the one mechanism that proves a density with no construction and no group — and the density it proves is never `1/2`

**The claim.** There is a fourth thing the literature can do that §3.1's three
settings do not cover, and it is worth separating because it changes what one
should ask for: the coding of an irrational rotation has a **proved exact letter
density**, with no construction, no group orbit and no substitution — the
mechanism is that the map is an *isometry* and the three-distance theorem
applies. It cannot give Prize 2, for a reason that is structural rather than
technical: the density it proves is the slope, and a rational slope gives a
periodic word, so **a Sturmian word is never simply normal.** What it does do is
split Prize 2 into two separately unproved halves, and the board has never named
the weaker one.

**The dictionary.**

| Sturmian / rotation | Rule 30 | Seam |
|---|---|---|
| the word codes `x ↦ x + α mod 1` | Kopra's correspondence: configurations white far to the left ↔ non-negative reals, the column ↔ the fractional part | the project's own nearest neighbour, and it is the right shape |
| the map is an isometry; `|multiplier| = 1` | Kopra's automaton multiplies by `p/q > 1`; rule 30 is *rapidly left expansive* | `sources/kopra-2022-natural-class.txt:242–243`: *"A fractional multiplication automaton is left expansive with dimensions (1, 1, 1)"* — expanding, the opposite of an isometry |
| density proved equal to `α`, exactly, with bounded discrepancy | density conjectured `1/2`, excess measured `1.34 √N` at `2²⁰` | a rotation coding has discrepancy `O(log N)`; rule 30's is `√N`-sized, which is a coin's |
| factor complexity `n+1` | complexity near-maximal (§3.1) | the mechanism needs minimal complexity by definition |
| the density **exists** and equals `α ∉ ℚ` | it is not known that the density exists at all | this is the split below |

**What it leans on.** Fetched from <https://en.wikipedia.org/wiki/Sturmian_word>:
*"Then w is Sturmian if σ(n) = n + 1 for all n."* and *"The sequence w is
Sturmian if for some x ∈ [0,1) and some irrational θ ∈ (0,∞), w is the θ-coding
of x."* The statement that the letter frequency equals the slope is **not**
quoted verbatim from that page (the fetch reported it is not stated there in one
sentence); it is classical and is marked **UNVERIFIED** — searched for
Morse–Hedlund and the three-distance theorem, found only secondary summaries.
Kopra quoted from the held source, `sources/kopra-2022-natural-class.txt:26–35`:
*"Distribution of fractional parts (i.e. distribution modulo 1) of sequences of
the form ((p/q)^i)_{i∈N} … is a mysterious topic"*.

**The test.** Measured in `explorer/rosetta_controls.mjs`: the Sturmian control
with slope `1/φ` has complexity exactly `n+1` at lengths `4, 8, 12, 16` and
excess `+60.43 √N` — i.e. its density is `0.618`, not `1/2`, which is the point
rather than a defect. A theorist could kill this connection by exhibiting a
rotation-coded sequence that *is* simply normal; the structure of the mechanism
says there is none.

**What it would give.** Not Prize 2, but a decomposition of it that this board
does not carry: **(i) `lim (count(N)/N)` exists; (ii) it is `1/2`.** The board's
`centerColumn_density_tendsto_half_iff_excess_nat` bundles the two. The rotation
literature is the only one that produces (i) for an individual aperiodic
sequence without producing (ii), which suggests (i) is the separable half — and
nobody here has ever proposed a node for it. That is the one positive thing this
vantage produces, and §5 carries it as a topic with its own warning.

---

## 4. Died in translation

- **"The common property of the proved-normal constants is a `poly(log N)`
  digit-extraction formula, so Prize 2 by these methods needs `¬` Prize 3."**
  My own first formulation, held for about an hour and the reason I took the
  vantage. *Dies on Becher–Heiber–Slaman*, fetched and quoted in §3.1: their
  number's first `n` digits take time *polynomial in n*, i.e. just above
  quadratic — no per-digit shortcut at all, and its absolute normality is
  proved. Copeland–Erdős kills it a second way: extracting digit `N` needs the
  primes near `N`, which is not `poly(log N)` either, and the *proof* does not
  use digit extraction. The cross-prize sentence "Prize 2 in this style requires
  `¬` Prize 3" is therefore **false as stated**, and it is exactly the kind of
  sentence a captain would have believed. What survives is the disjunctive
  taxonomy in §3.1, where BHS sits under "known block decomposition" with the
  algorithm's stages as blocks.
- **"The right diagonals are exactly balanced more often than chance, so there
  is a hidden `1/2` in the picture."** The one thing in this session that looked
  like a finding. Of the 18 right diagonals `k ≤ 30` that are *not* antiperiodic,
  4 are exactly balanced against a null expectation of `1.314` — one-sided
  `p ≈ 0.04`. *It is not a finding, three times over.* The statistic was chosen
  after seeing the table. The two nulls agree, so the running-XOR structure of
  `rightDiagonal_recurrence` does not explain it
  (`explorer/rosetta_balance.mjs`: at `P = 256`, uniform words give `0.0498` and
  running-XOR-of-even-weight-driver gives `0.04924`). And the four witnesses are
  `k = 8, 10, 17, 18`, every one of them within two of an antiperiodic depth
  (`7, 9, 16, 16`) — while `5, 26, 28, 30` are the same distance from
  `4, 25, 27, 29` and are *not* balanced. So it is 4 of 8, at small `k` where
  the null probability is largest (`0.14` at `P = 32` against `0.012` at
  `P = 4096`), and it vanishes for `k ≥ 19`. This is my notebook's own recorded
  failure mode — a constant that holds only where the period is short — caught
  by computing the null instead of admiring the table.
- **"A periodic-boundary or ring analogue of Champernowne's block count."**
  Dies before it starts on crystal 40: every `Bool` sequence is the centre
  column of some configuration white on the right, so any count that does not
  name the left cone is true of every sequence. Talus recorded this for the
  forcing laws; it applies verbatim to a block count.
- **"Crystal 66's `OR → XOR` filter does not bite on Prize 2, since Prize 2 is a
  density statement and the linear rules are 'more random'."** *Dies at the
  first run:* rule 90's centre column has density `0.000015` over `2¹⁶` (black
  once, at `t = 0`) and rule 150's is `1.000000` — both as far from `1/2` as a
  sequence can be. The filter bites on Prize 2 from *both* sides at once, harder
  than on Prize 1, and any Prize 2 argument surviving `OR → XOR` is refuted.
  Computed in `explorer/rosetta_symmetry.mjs`; the board's P2 instance of the
  filter had not been written down.
- **"Normality of the row concatenation would say something about the column."**
  Dies to the density-zero overwrite in §3.4 — a two-line proof, not a
  measurement, and it kills the route at every depth simultaneously.
- **"The Stoneham hot-spot lemma is the mechanism to import."** Dies on
  fetching: the phrases "hot spot" and "b-dense" do not occur in the arXiv
  document I could read, and the Bailey–Misiurewicz PAMS paper would not fetch.
  More to the point, the mechanism *underneath* the hot-spot reformulation is
  the primitive root, which is where §3.2 goes. Marked **UNVERIFIED** rather
  than dropped, because a captain can chase it.
- **"`pre(n) > n` for all `n`, so the centre column's read is always
  transient."** Dies at `n = 20`, where `pre(20) = 20` exactly, and at every
  `n ≤ 18`. The correct statement is `n ≥ 21`, and the exceptions are Sextant's
  nineteen settled re-readings seen from the other side. I wrote the unqualified
  version into the script's own console text before the sweep contradicted it.
- **My hand-typed expectation of the centre column's first 32 bits was wrong,
  and the guard caught it.** `rosetta_controls.mjs` printed a mismatch at bit 27
  against a prefix I typed from memory. My notebook says to distrust the check
  that says *no*, so I wrote a third engine — a literal cell-by-cell evolution
  of `rule30_eq` on an array (`explorer/rosetta_guard.mjs`) — which agrees with
  the packed row on all 200 terms and reproduces `Basic.lean`'s own kernel
  example for `settledCenter 0..10` exactly. The engine was right and the
  expectation was the defect. Recorded because the same slip in the other
  direction would have poisoned every number in this document.
- **A search for a fourth mechanism, run adversarially against §3.1's own
  headline, found none** — and returned, inside its summary, the assertion that
  *"√2 is a normal number in base p ≥ 2, and in particular, √2 is simply normal
  number in base 10."* That directly contradicts the sentence I had already
  fetched from the same encyclopaedia page (*"It is widely believed that the
  (computable) numbers √2, π, and e are normal, but a proof remains elusive"*),
  and the fetch is the one to believe. Recorded because it is this region's
  craft rule demonstrating itself inside one session: **a search summary is not
  a quote, and it will hand you a false theorem at exactly the moment you are
  looking for one.**
- **Fetching, as craft.** Of eight attempts: `arxiv.org/pdf/…` returned
  undecodable binary twice, `davidhbailey.com` and ScienceDirect were not
  attempted after the first two failures, and what worked was
  `ar5iv.labs.arxiv.org/html/<id>` (a full HTML rendering of an arXiv paper,
  quotable line by line), arXiv `/abs/` pages, institutional repository record
  pages (`ri.conicet.gov.ar/handle/…`), and Wikipedia. **`ar5iv` is the one
  that turned a dead PDF into three verbatim quotes**, and it is not in any
  connector notebook I am aware of.

---

## 5. What to hand the theorist

Two topics, the first much smaller than the second and the first is the one I
would actually spend the session on.

**(a) Exact density `1/2` along a right diagonal at a doubling — and the precise
statement of why it stops there.** *Band: Known* (Rowland 2006 Proposition 2
plus two lines of arithmetic), *project-internal* in value. The claim to
falsify: **if right diagonal `k` is antiperiodic at `P_k/2` then it has black
density exactly `1/2` along its own index, and at `k ≤ 30` that is 13 of the 31
diagonals.** The dictionary row it depends on is §3.3's fourth row —
antiperiodicity is the Champernowne involution `j ↦ j + P/2`. The board already
holds `rightDiagonal_antiperiodic_of_odd_driver` and
`rightDiagonal_periodicFrom_pow`, so the node is small. **Its `DOES NOT PROVE`
field is the whole point of seeding it** and must say: *the centre column is the
read at index `0`, and exact balance of a word constrains one index not at all —
measured, the centre column is black at 8 of 14 balanced depths and 6 of 11
unbalanced ones.* Seed it as the only exact-one-half statement the picture
admits, so the next Prize 2 session can see immediately where the mechanism runs
out, rather than rediscovering it.

**(b) Does the centre column's density *exist*?** *Band: would be Novel if
anything came of it; today it is a question, not a result.* Prize 2 as the board
carries it is `lim (count(N)/N) = 1/2`, one statement. §3.5 observes that the
literature's rotation mechanism produces existence-with-a-value for individual
aperiodic sequences and can never produce the value `1/2`, which suggests
existence is the separable half — and no node on this board has ever asked for
it. The statement to try to falsify: **`limsup (count(N)/N) = liminf
(count(N)/N)`, with no claim about the common value.** The honest warning, and
it must travel with the topic: I have no route, the two known
`limsup`/`liminf` bounds are `N(1 − 2 log₅ N / N)` above and nothing below, and
this may well be exactly as hard as Prize 2. The only quantitative bound the
board holds is on the *excess* — my brief reads `centerColumnCount_ge_of_pow` as
`|E(N)| ≤ N − 2 log₅ N`, which I did **not** check at the source, and Talus's
run-route cap `N(1 − 1/(c log N))` is the same shape — and a bound of that shape
constrains neither `limsup` nor `liminf` away from `0` or `1`, so the
decomposition starts from nothing in both halves. The reason to name it anyway
is that CLAUDE.md says the least-built region is the least *tried*, and this is
the one rung of Prize 2 nobody has written down. A theorist should spend an hour
deciding whether it is separable before spending a session on it, and should
report "not separable" as a real answer.

Not handed on: everything in §3.1, §3.2, §3.4 and §4, which are fences. A
captain should read §3.2's two measured numbers — orbit density `0.666667`
against `3.1e−120`, and the read always in the transient — as the reason to stop
paying for arithmetic-dynamics vantages aimed at this column until something
changes, because that is now the second sighting in one day to die on the same
object from two different directions.

---

## 6. Next vantage

**The additive combinatorics of Bernoulli convolutions and self-similar measures
— Erdős, Solomyak, Hochman, Shmerkin — attacked at the question "when does a
deterministic sum with exponentially separated scales have an absolutely
continuous / dimension-one distribution".** The reason is a seam this sighting
kept hitting from the wrong side. Everything in §3 failed because rule 30
supplies no *group* and no *measure*, and the normality literature needs one of
them. Hochman's inverse theorem for entropy is the one modern result that
produces equidistribution-strength conclusions for a **single** explicitly given
self-similar object without a group structure and without assuming a measure —
it gets dimension from a *non-concentration* hypothesis on the scales, which is
a hypothesis one can sometimes verify by computation on an explicit system. The
rule 30 object to point it at is not the column but the pair
(settled region, transient band): the board has measured exponential separation
between the diagonal period regimes (`3, 8, 29, 400, 87867, 2107985255` — each
roughly the square of the last), which is exactly the scale structure those
theorems eat, and nobody here has asked whether the centre column's empirical
block measures satisfy a non-concentration bound at those scales. I could not
reach it from where I stood because it needs the block-frequency measures of the
column at dyadic scales, which is a computation nobody has run and which the
subshift sighting of 2026-09-12 stops just short of.

The one I could not reach at all, and name so the next connector can: **the
Cassaigne–Ferenczi–Zamboni line on words of low but super-linear complexity,
where balance is proved from a complexity bound alone.** Every mechanism in §3.1
needs structure; that literature needs only a *bound*, and rule 30's column has
a measured complexity. If there is a theorem of the form "complexity below
`f(n)` forces the letter densities to exist", then the question becomes *how
large* the column's complexity is rather than what generates it — which is the
first question in this whole region that rule 30's own measurements could
plausibly answer. I did not fetch anything in that area and do not know whether
such a theorem exists; that is the vantage.
