# Sighting: Hochman–Shmerkin, non-concentration at exponentially separated scales

**Vantage.** The inverse theorem for entropy, exponential separation, and
self-similar measures without a group — aimed at Prize 2.
**Connector.** Rosetta, 2026-09-12. Fifth session; the fourth is
`docs/connections/2026-09-12-normal-numbers-and-explicit-constructions-*.md`,
whose §6 named this vantage.

**Nothing here is a proof.** A connection is a sighting: a direction for a
prover to walk, and it costs the project real hours if it is dressed up as
more. Section 4 is where the deaths are, and four of its fourteen entries are
numbers of my own that were controlled out this session.

**The short answer, because it is a negative with one usable object inside
it.** The vantage's central premise is wrong in the direction that matters,
and I can say so with arithmetic rather than with a search. Hochman's
exponential-separation hypothesis is a statement about how close two distinct
level-`n` objects can come *in a continuum*; rule 30's level-`n` objects live
in `ℤ/2^n`, where distinct objects are at 2-adic distance at least `2^-(n-1)`
**by definition**. So the hypothesis is free, it is attained, and therefore
vacuous (§3.2). The board's period-doubling depths `3, 8, 29, 400, 87867,
2107985255` are not `Δ_n` at all — they are the positions at which the scale
*changes*, they grow doubly exponentially (`log k_n` geometric with ratio
`≈1.8`, measured), and a multiscale argument that wants `Θ(n)` scales below
scale `2^-n` is being offered `Θ(log log K)` of them. Sharpest of all: index
the tower honestly and its level `n` has `O(n)` objects rather than `2^n`, so
its similarity dimension is `0` and **Hochman's own conclusion, applied
faithfully, returns `dim = 0`** — the correct answer, and the statement that a
single orbit is a single orbit. And the one measure this
problem has satisfies Hochman's non-concentration hypothesis with deficit
**exactly zero** — enumerated to `n = 9`, `min = max = 2^n` at every `n`
(§3.3) — while both prizes stay open, because the seed is a point and the
theorem's conclusion is about a measure.

**And the brief's own object answers in the same direction, with a new
measurement.** Pointed at the pair (settled region, transient band) rather
than at the column, the test **passes** — the settled centre column `s(k) =
S_k(0)`, the column `c`, and the damage boundary `c ⊕ s` all have coin-like
block entropy at every scale to `m = 14` over `k ≤ 53000`, indistinguishable
from two CSPRNG draws — and it passes on an object whose determinism is
*proved*: read along a diagonal, the settled region has entropy at most
`log₂ P(k) ≤ 5` bits at **every** scale (§3.6). So non-concentration here is a
property of the *direction of reading*, not of the object, and Hochman's
framework has no direction parameter.

**What survives, and it is one inequality.** Shannon subadditivity plus
concavity turns *any* lower bound on the centre column's empirical block
entropy into a bound on Prize 2's excess, in one line and with almost no loss:
measured at `N = 4·10^6`, a bound at block length `2` would give the true
`|p − 1/2|` to within **3.6%**. That single statistic dominates two board routes
at once — crystal 21's factor-count route (which gives P1 only) and P2's
excess — because entropy bounds both the support and the marginal where a
count bounds only the support. It is band **Nothing** as mathematics and
**project-internal** as a route, and its real value is as a fence: *every
"indistinguishable from a coin at block length `m`" measurement this board has
made is, read as a theorem, strictly stronger than Prize 2.* §5 hands it over
in that form and not as a route.

---

## 1. The problem, seen from outside

Fix the binary sequence `c ∈ {0,1}^ℕ` built like this. Put a single `1` at the
origin of a bi-infinite row of `0`s. Update every cell simultaneously and for
ever by `new = left XOR (centre OR right)`. Let `c(t)` be the cell at the
origin after `t` updates. The sequence is completely explicit, computable in
`O(t²)` bit operations, and its first ten million terms have been computed.

Two things are unproved about it. **(P1)** `c` is not eventually periodic:
there are no `p > 0` and `N` with `c(n+p) = c(n)` for all `n ≥ N`. The node
this document is nominally aimed at — "if `c` repeats then some other column
of the same picture repeats" — is, given a proved theorem that no two columns
of the picture both repeat, *logically equivalent* to P1 and not a reduction
of it. **(P2)**, which is what this vantage is actually aimed at, is that the
proportion of `1`s among `c(0), …, c(N−1)` tends to `1/2`. Equivalently, with
`E(N) = 2·#{t < N : c(t) = 1} − N`, that `E(N) = o(N)`. Measured, `E(N)` is
`1986` at `N = 4·10^6` (measured here) and `4440` at `N = 10^7` (the board's
deepest), i.e. of order `√N`, which is a coin's own scatter. Proved,
the best bound anyone has is `|E(N)| ≤ N − 2 log₅ N`
(`centerColumnCount_ge_of_pow`), which is `N(1 − o(1))` where the prize needs
`o(N)`.

**Restated in the vantage's own terms.** For each block length `m` and each
window length `N`, let `μ_N^{(m)}` be the empirical distribution of the
length-`m` windows `c[t, t+m)` for `t < N − m + 1` — a probability measure on
`{0,1}^m`, which is `2^{-m}`-scale resolution of a measure on `[0,1]`. Then:

- **Prize 2 is non-concentration of `μ_N^{(1)}`**: the one-letter marginal has
  entropy tending to `1` bit, i.e. the measure does not concentrate on one of
  the two cells at scale `1/2`.
- **Prize 1 is non-concentration at unbounded scale**: `c` has eventual period
  `p` exactly when, for large `N`, the tail's `μ_N^{(m)}` is supported on at
  most `p` of the `2^m` cells for every `m`, i.e. `H(μ^{(m)}) ≤ log₂ p`,
  bounded in `m`.

So in Hochman's vocabulary **both prizes are the single statement "the
empirical block measures of `c` do not concentrate"**, read at scale `1` and
at unbounded scale respectively. That is the vantage's framing, and it is the
reason the vantage cannot be a route: Hochman's theorems take non-concentration
as a *hypothesis* and return dimension; here non-concentration *is* the
conclusion, at every scale.

---

## 2. Fields sighted

| Field / theory | The object there that matches something here | The seam, in one line |
|---|---|---|
| Self-similar measures on `ℝ` (Hochman 2014; Shmerkin) | `Δ_n`, the minimal distance between distinct level-`n` maps; `dim μ = min(1, s-dim μ)` | in `ℤ/2^n` distinct objects are `≥ 2^-(n-1)` apart **by definition**, so the hypothesis is free and the theorem's content evaporates (§3.2) |
| Inverse theorems for entropy (Hochman Thm 2.7; Tao's Shannon sumset theory) | `H(μ∗ν) < H(μ) + δ ⟹ structure` | needs **two** factors to convolve; rule 30's `OR` decomposes as linear-plus-quadratic in the *same* variable (crystal 59), so there is no second factor (§3.5) |
| Shannon information theory: subadditivity, concavity, Pinsker | `H(μ^{(m)}) ≤ m·H₂(p̄)` | the one row that transfers — and it transfers P2 *out* of the hypothesis rather than *into* the conclusion (§3.1) |
| Ergodic theory: variational principle; unique measure of maximal entropy | entropy rate `log 2` on the full 2-shift forces Bernoulli(1/2) | needs an invariant measure **and** the seed generic for it; genericity is exactly P2 (Ephemeris §3.2, Waywiser's fence) |
| Measure-theoretic CA theory (Hedlund; Kůrka) | the uniform Bernoulli measure, pushed to the column | the hypothesis holds with deficit **zero** and the conclusion is about the ensemble; the seed is one atom of measure zero (§3.3) |
| **Effective / constructive dimension (Lutz, Mayordomo)** | the *only* dimension theory that assigns a number to a single sequence rather than to a measure | it assigns `c` dimension **0**, because `c` is computable — and it assigns an eventually periodic sequence `0` too, so no dimension-theoretic statement separates them (§3.4) |
| Diophantine approximation: heights, Liouville, Mahler measure | the arithmetic input that makes Hochman's `Δ_n ≥ s^n` *checkable* for algebraic parameters (his Lemma 5.10) | the board's only height-shaped inequality is `leftDiagonal_period_le` (period of diagonal `k` is `≤ k+1`), and it bounds from the side that makes the doubling depths *grow*, not the side that separates objects |
| Bernoulli convolutions (Erdős; Solomyak; Shmerkin; Varjú) | the flagship "one explicit object, no group" success | every result there is `a.e. λ` or `all algebraic λ` in a **parametrised family**; rule 30 has no parameter, and the finite family of 256 rules is refuted by crystal 66's OR→XOR filter |
| Projections of fractal measures (Hochman–Shmerkin, *Local entropy averages*) | the column as a one-dimensional projection of the row | needs a CP-chain / uniformly scaling measure; one deterministic orbit has no scenery flow |
| `×2, ×3` rigidity (Furstenberg; Rudolph; Host) | two commuting actions plus positive entropy force Lebesgue | already dead on this board (Ephemeris §4.7): only `σ` acts, and the dilations `t ↦ 2^e t` carry no identity to depth `2^21` |
| `L^q` dimensions and multifractal analysis (Shmerkin, Varjú) | a smoothed statistic sometimes easier than the marginal | `L^q` dimension of a Dirac mass is `0` for every `q`; the smoothing needs the measure the problem lacks |
| Normal numbers and algorithmic randomness (Borel; Champernowne; Bailey–Crandall; Schnorr–Stimm) | "every digit has frequency `1/2`" = P2; finite-state randomness = Borel normality | my own previous session, Chorobates's fence and Waywiser's: normality at block length 1 **is** P2, so this whole family is super-prize. §3.4 is its dimension-side companion and is not a re-sighting |
| Morse–Hedlund factor complexity | `#` distinct factors of length `m` (crystal 21's route) | counting bounds the *support*, entropy bounds the support **and** the marginal — the strict gain of §3.1 |
| **Statistical estimation of entropy (Basharin; Miller–Madow; Grassberger)** | the `O(2^m / N)` downward bias of an empirical entropy | the unlikely entry and the load-bearing one: without it, "rule 30's block entropy deficit is smaller than a coin's" reads as a finding, and it is a property of the estimator and of the generator (§4.1) |
| Directional entropy of `ℤ²` actions (Milnor; Boyle–Lind) | entropy as a function of the direction of reading | the one field that **has** the parameter Hochman lacks, and §3.6 is why it is needed: the settled region reads at `≤ 5` bits along a diagonal and at `≈ m` bits along `k`, so "non-concentration" is a directional statement. My own 2026-09-08 sighting covers that field — it found Milnor's directional entropy convex and zero exactly where the picture is white, and did not treat this quantity |

---

## 3. Connections

### 3.1 One inequality carries, and it carries Prize 2 *out* of the hypothesis

**The claim, as sweeping as I believe it.** The empirical block entropy of the
centre column is a *single* statistic that dominates two of this board's
routes at once — it bounds Prize 2's excess and it excludes eventual periods,
where the factor-count route (crystal 21) does only the second — and because
the bridge from it to P2 loses almost nothing, **every block statistic this
board has measured is, as a theorem, Prize 2 plus about four percent.** So the
whole entropy hierarchy collapses onto its own bottom rung, which is the
prize, and Hochman's hypothesis is not a thing one could hope to verify here.

**The bridge, in full, because it is four lines and it is the deliverable.**
Write `p_i` for the density of `1`s in `c` over `[i, N−m+1+i)` and
`p̄ = (1/m)Σ_{i<m} p_i`. The `i`-th coordinate marginal of `μ_N^{(m)}` is
exactly the Bernoulli(`p_i`) distribution. Then

```
H(μ_N^{(m)})  ≤  Σ_{i<m} H₂(p_i)          (Shannon subadditivity)
              ≤  m · H₂(p̄)                 (concavity of H₂, Jensen)
```

and `|p̄ − p_0| ≤ m/N`. Writing `ε_m = 1 − H(μ_N^{(m)})/m`, Pinsker gives
`H₂(1/2 + d) ≤ 1 − 2d²/ln 2`, hence

```
|p̄ − 1/2|  ≤  sqrt( ε_m · ln 2 / 2 ),   i.e.   |E(N)| ≤ 2N·sqrt(ε_m·ln2/2) + 2m.
```

Two corollaries, both immediate. *(i)* `H(μ_N^{(m)})/m` is non-increasing in
`m` for a stationary measure, so **the `m = 1` rung is the easiest one** and
every higher rung is strictly harder than P2. *(ii)* If `c` has eventual
period `p` from `N₀`, the tail's `μ^{(m)}` is supported on at most `p` words,
so `H ≤ log₂ p`; hence `liminf_N H(μ_N^{(m)}) > log₂ p` excludes period `p`.
So one lower bound on one entropy does P1-work and P2-work simultaneously.

**The dictionary.**

| This project | Hochman's world | Checked |
|---|---|---|
| the centre column `c` | a point, not a measure | definition |
| `μ_N^{(m)}`, the empirical block measure | `μ` resolved at dyadic scale `2^{-m}` | the standard identification |
| `H(μ_N^{(m)})` | `H(μ, 𝒟_m)`, entropy at scale `2^{-m}` | same object |
| non-concentration at scale `m` | `H(μ, 𝒟_m) ≥ (1−ε)m` | Hochman's `(ε,m)`-uniform, in the empirical form |
| Prize 2 | non-concentration at scale `1` | §1; Chorobates's fence, reached again |
| Prize 1 | non-concentration at **unbounded** scale | corollary (ii) |
| crystal 21's factor count | `#supp μ^{(m)}`, and `H ≤ log₂ #supp` | counting is the weaker half of entropy |
| the **new** content | `H` also bounds the marginal, which `#supp` does not | the bridge above |
| **Seam 1** | the hierarchy is monotone the **wrong way**: `H(m)/m ≤ H(1) = H₂(p)`, so a bound at any `m ≥ 2` is strictly stronger than the one at `m = 1`, which is the prize | measured, table below |
| **Seam 2** | the bridge is nearly lossless, and that is bad news: at `m = 2` it returns `|p−1/2|` to within `3.6%`, so you must prove something strictly harder to get something `3.6%` weaker | measured |
| **Seam 3** | Hochman uses non-concentration as an input; here there is no proved lower bound on `H(μ_N^{(m)})` at any `m ≥ 1`, and a proved one at `m = 1` *is* the prize | the board's P2 tier |

**What it leans on.** Subadditivity, fetched:

> "H ( X , Y ) ≤ H ( X ) + H ( Y )" … "H ( X 1 , … , X n ) ≤ H ( X 1 ) + … +
> H ( X n )" … "This inequality is an equality if and only if X and Y are
> statistically independent."
> — <https://en.wikipedia.org/wiki/Joint_entropy>

Concavity of `H₂`, fetched:

> "d²/dp² H_b(p) = −1/(p(1−p) ln a)"
> — <https://en.wikipedia.org/wiki/Binary_entropy_function>

Pinsker, fetched, in the base-2 form:

> "D(P∥Q) ≥ 1/(2ln2) · V(p,q)²"
> — <https://en.wikipedia.org/wiki/Pinsker%27s_inequality>

with `D(p‖1/2) = 1 − H₂(p)` in bits and `V = 2|p − 1/2|`, giving
`1 − H₂(1/2+d) ≥ 2d²/ln 2`. The script does not use the closed form — it
inverts `H₂` by bisection — so the inequality is a presentation convenience
and not a load-bearing step.

**The test, and I ran it.** `explorer/rosetta13_entropy.mjs`, centre column to
**`N = 4·10^6`** (validated `0/41` against the engine's held A051023 prefix;
`E(N) = 1986 = 0.993√N`, density `0.50024825`), block lengths `m = 1 … 24`,
against **three fair-coin words of the same length drawn from `node:crypto`**:

| `m` | `H_c(m)` (bits) | deficit `m − H_c(m)` | `h_m = ΔH` | words seen | iid-predicted |
|---|---|---|---|---|---|
| 1 | 0.99999982 | 1.778e−7 | 0.9999998 | 2 | 2 |
| 2 | 1.99999962 | 3.820e−7 | 0.9999998 | 4 | 4 |
| 4 | 3.99999660 | 3.398e−6 | 0.9999984 | 16 | 16 |
| 8 | 7.99995479 | 4.521e−5 | 0.9999779 | 256 | 256 |
| 12 | 11.99922472 | 7.753e−4 | 0.9996111 | 4096 | 4096 |
| 16 | 15.98798593 | 1.201e−2 | 0.9940160 | 65536 | 65536 |
| 20 | 19.79708116 | 2.029e−1 | 0.8945582 | 1,025,057 | 1,025,460.4 |
| 24 | 21.70420401 | 2.296e+0 | 0.2065996 | 3,558,563 | 3,558,885.1 |

The support tracks the coupon-collector prediction `2^m(1 − e^{−N/2^m})` to
within `0.04%` at every `m`, the conditional entropy `h_m` is `≥ 0.999` for
every `m ≤ 12`, and the whole table is inside the coins' own scatter: the
coins' deficits at `m = 8, 16, 20, 24` are `3.73/4.33/4.91e−5`,
`1.17/1.18/1.18e−2`, `2.01/2.02/2.02e−1`, `2.30/2.30/2.30e+0`. **At the large
`m` the column sits 1–4% above all three**, which is §4.12 — it has a null
model and it is inside it.

**The control, run separately because the first version of this measurement
produced a false finding (§4.1).** `explorer/rosetta13_control.mjs` repeats the
deficit table with the coin drawn four ways — a hand-rolled 32-bit xorshift
sliced 32 bits per output (`A`), the same generator one bit per output (`B`),
`node:crypto` (`C`), and `Math.random` (`D`) — at `N = 3·10^5`, where the false
finding was produced:

| source | `E(N)/√N` | `m=1` | `m=2` | `m=8` | `m=12` | `m=16` |
|---|---|---|---|---|---|---|
| **centre column** | 1.0808 | 2.81e−6 | 5.84e−6 | 5.83e−4 | 9.83e−3 | 1.67e−1 |
| A xorshift ×32 | 5.7620 | 7.98e−5 | 1.64e−4 | 8.01e−2 | 2.05e−1 | 5.96e−1 |
| A xorshift ×32 (2) | 27.3423 | 1.80e−3 | 5.98e−3 | 1.80e−1 | 3.89e−1 | 8.77e−1 |
| B xorshift top bit | −0.6974 | 1.17e−6 | 8.94e−5 | 4.14e−2 | 8.24e−1 | 4.07e+0 |
| C crypto | 0.9202 | 2.04e−6 | 4.49e−6 | 5.41e−4 | 9.20e−3 | 1.64e−1 |
| C crypto (2) | 0.7449 | 1.33e−6 | 7.74e−6 | 6.12e−4 | 9.98e−3 | 1.67e−1 |
| C crypto (3) | 1.3145 | 4.15e−6 | 9.76e−6 | 6.80e−4 | 9.75e−3 | 1.66e−1 |
| D Math.random | 0.1351 | 4.39e−8 | 9.13e−8 | 5.18e−4 | 9.96e−3 | 1.65e−1 |
| D Math.random (2) | 0.5368 | 6.93e−7 | 2.55e−6 | 5.24e−4 | 9.86e−3 | 1.65e−1 |

**Against two independent good sources the column sits inside the scatter at
every block length** — `1.67e−1` against `1.64`–`1.67e−1` at `m = 16`. Against
the two broken ones it looks a thousand times better, which is what produced
the false finding. The tell that the xorshift rows are the broken ones and not
the interesting ones is in the second column: an `m = 1` deficit **is** an
excess, `1 − H₂(p) ≈ 2d²/ln 2` with `d = E(N)/2N`, and `27.3√N` is not a coin.

**And the null distribution, because three draws do not decide a 4% gap.**
`explorer/rosetta13_null.mjs`, `N = 10^6`, twelve crypto draws, with the
column's `z`-score and the count of draws at least as extreme:

| `m` | 10 | 12 | 14 | 16 | 18 | 20 |
|---|---|---|---|---|---|---|
| column `z` | 0.81 | 0.77 | 1.15 | 0.96 | 0.98 | 1.06 |
| draws ≥ column, of 12 | 2 | 4 | 1 | 1 | 2 | 1 |
| a **second** rule-30 column (`{0,3}`), `z` | 1.39 | 0.21 | 0.24 | 0.13 | −0.04 | 0.11 |

The engine that produces the second column is validated *asymmetrically*
against the shield obstruction, which predicts in both directions: `{0,2}`
must have the seed's centre column exactly (`400 of 400` agree) and `{0,3}`
must not (`201 of 400`). See §4.12–13 for what these two rows killed.

**The bridge evaluated on the column's own numbers**, at `N = 4·10^6`, where
the true `|p − 1/2|` is `2.4825e−4` and the true `|E(N)|` is `1986`:

| `m` | `ε_m` | implied `|p−1/2| ≤` | implied `|E(N)| ≤` | loss factor |
|---|---|---|---|---|
| 1 | 1.778e−7 | 2.4825e−4 | 1,986 | 1.000 (an identity) |
| 2 | 1.910e−7 | 2.5729e−4 | 2,058 | 1.036 |
| 3 | 5.877e−7 | 4.5130e−4 | 3,610 | 1.82 |
| 8 | 5.651e−6 | 1.3994e−3 | 11,200 | 5.6 |
| 16 | 7.509e−4 | 1.6130e−2 | 129,000 | 65 |
| 24 | 9.566e−2 | 1.8004e−1 | 1,440,000 | 725 |

At `m = 1` the bridge is an identity, which is the check that it is
implemented right. At `m = 2` it loses `3.6%`; by `m = 24` it has lost a factor
`725`, and the board's proved bound on the same quantity is
`N − 2 log₅ N = 3,999,981`. So the bridge is sharp exactly where it is most
circular and loose exactly where a proof might be easier — which is Seam 2, in
numbers.

**What it would give.** A statement of the shape

> *for every `m ≥ 1`: if `H(μ_N^{(m)})/m → 1` then
> `centerColumnDensity → 1/2`*

is a **sufficient condition for Prize 2 in a vocabulary the board does not
have**, provable with no rule 30 in it, and not covered by Talus's cap on the
run route (which caps `|E| ≤ N(1 − 1/(c log N))` for any run bound however
sharp — a different route with a different ceiling). What would remain is
everything: nobody has a lower bound on `H(μ_N^{(m)})` for any `m`, and at
`m = 1` such a bound *is* the prize. **Band: Nothing** as mathematics — it is
true of every `ℕ → Bool` and a mathematician would use it without stating it.
**Project-internal** as a fence, and that is why it is in §5.

---

### 3.2 Exponential separation is free in a 2-adic tower, and the board's "scales" are the wrong object

**The claim.** The vantage's central premise — that this board has measured
the scale structure Hochman's theorems eat — is wrong three times over, and
each time by arithmetic rather than by opinion. First, Hochman's `Δ_n` is a
*distance* between distinct level-`n` objects, and in any discretely-indexed
tower it is bounded below by the scale itself, so the hypothesis is satisfied
by every system without exact overlaps and carries no information. Second, the
period-doubling depths are not distances at all — they are the places where
the scale changes — and they are *doubly* exponentially spread, so they supply
`Θ(log log K)` scales below depth `K` where a multiscale argument wants
`Θ(n)`. **And a third time, which is the sharpest of the three:** the natural
rule-30 truncation tower has **exact overlaps at every level** — the orbit of
`stepMod n` is eventually periodic with period `P(n) ≤ 32` for every
`n < 2·10^9`, so distinct rows `t ≠ s` really do give the same level-`n`
object — which puts the tower in the branch of Hochman's dichotomy where his
conclusion *fails*, and in his setting exact overlaps are conjectured to be
the only obstruction to full dimension.

**The dictionary.**

| This project | Hochman §1.2 | Checked |
|---|---|---|
| level-`n` object: `rowNat t mod 2^n`, the first `n` left diagonals of row `t` | `φ_i(0)` for a word `i ∈ Λ^n` | the natural truncation tower; coherent by the proved `step_two_mul` |
| the level-`n` scale | `r^n`, the length of a level-`n` cylinder | `2^{-n}` |
| `Δ_n` | `min{d(i,j) : i,j ∈ Λⁿ, i ≠ j}` | fetched definition, below |
| exact overlaps (`Δ_n = 0`) | `φ_i = φ_j` for `i ≠ j` | **they occur at every level**: two distinct rows are equal mod `2^n` exactly `P(n)` apart past the preperiod, and `P(n) ≤ 32` for `n < 2·10^9`. So the tower is in the dichotomy's *bad* branch, where Hochman concludes nothing |
| **the seam, and it is the whole connection** | `Δ_n ≥ 2^{-(n-1)}` for distinct residues mod `2^n`, **by definition of the 2-adic metric** | the bound is *attained* at every `n ∈ {4,8,16,24,32,48,64}`, with witnesses as early as `t = 2, s = 3` |
| Hochman's Thm 1.1 conclusion | `dim μ = min(1, s-dim μ)` | `μ` is a measure; the seed is a point, `dim = 0` (§3.4) |
| the board's `leftDiagonal_pair_never_eventually_shifted` | "no exact overlaps" for the *pair* tower | proved on this board, and it is the one genuinely matching row |
| the board's `leftDiagonal_period_le` (`period ≤ k+1`, hence `k_n ≥ 2^n − 1`) | a height/Liouville bound, in that it is the one quantitative inequality about where level-`n` structure can sit | the smell matches; the quantity does not — it bounds where the **scales** are, and Hochman needs a bound on how **close two distinct objects** get (§4.6) |
| the period-doubling depths `3, 8, 29, 400, 87867, 2107985255` | **not `Δ_n`**: the positions of scale changes | `log k_n / log k_{n−1}` = `1.89, 1.62, 1.78, 1.90, 1.89` — geometric with ratio `≈1.8`, so `k_n` is doubly exponential |
| "each roughly the square of the last" (the brief) | — | **wrong, and in the safe direction**: `k_n / k_{n−1}²` is `0.889, 0.453, 0.476, 0.549, 0.273`, decreasing; the true law is `log k_n ≈ 1.8 · log k_{n−1}` |
| number of scales below depth `K` | Hochman sums entropy increments over `n` scales | `Θ(log log K)`: **6** below `10^12`, extrapolated **~10** below `10^100` |
| the index set | `Λ^n`, with `|Λ^n| = 2^n` objects matching the `2^n` cells at scale `2^{-n}` | **time**, which is unbounded — so overlaps at level `n` are *forced by pigeonhole* the moment `t` exceeds the number of residues |
| the honest repair: index by the orbit's distinct level-`n` states | `#Λ^n = 2^n`, giving `s-dim = 1` | **measured**: `4, 17, 42, 99, 177, 325, 670, 1314, 2701` at `n = 8 … 2048`, i.e. `1.32 n`, against `2^n`. So `s-dim = lim log(1.32n)/(n log 2) = 0`, and Hochman's conclusion `min(1, s-dim)` reads **`0`** |

**What it leans on.** Fetched from the ar5iv render of Hochman, *On
self-similar sets with overlaps and inverse theorems for entropy*
(arXiv:1212.1873; Annals of Math. 180 (2014)):

> "For n∈ℕ let Δₙ=min{d(i,j):i,j∈Λⁿ,i≠j}" where "d(i,j)={∞ if rᵢ≠rⱼ,
> |φᵢ(0)−φⱼ(0)| if rᵢ=rⱼ}" (Section 1.2)

> **Theorem 1.1**: "If μ is a self-similar measure on ℝ and if dim μ <
> min{1,s-dim μ}, then Δₙ→0 super-exponentially, i.e.
> lim(−1/n log Δₙ)=∞"

> **Theorem 1.5**: "For IFSs on ℝ defined by algebraic parameters, there is a
> dichotomy: Either there are exact overlaps or the attractor X satisfies
> dim X = min{1,s-dim X}" (Proof cites Lemma 5.10 stating algebraic parameters
> yield Δₙ ≥ sⁿ for some constant s>0)

— <https://ar5iv.labs.arxiv.org/html/1212.1873>, and the abstract from
<https://arxiv.org/abs/1212.1873>: *"We show that if the dimension is smaller
than the minimum of 1 and the similarity dimension, then at small scales there
are super-exponentially close cylinders."* **Caveat, stated because my own
notebook says a search summary is not a quote:** these are the sentences the
fetch returned from the HTML render, with theorem numbers attached; I did not
open the PDF, and a theorist citing them in a proposal should re-read §1.2 and
Lemma 5.10 in the published version rather than trust the render's numbering.

**Note what Theorem 1.5 is doing, because it is the methodological transfer
the vantage was really after.** Hochman's hypothesis is checkable for
algebraic parameters because an *arithmetic* fact — two distinct algebraic
numbers of bounded height are not too close — supplies `Δₙ ≥ sⁿ`. That is a
Liouville inequality. The rule-30 analogue would be a lower bound on how far
apart two distinct level-`n` objects of the seed's orbit must be; and in
`ℤ/2^n` that bound is free and useless. **There is no height function to
build, because there is no continuum to be dense in.**

**The test.** Two, both run (`explorer/rosetta13_scales.mjs`). *(a)* The
doubling depths' growth law, reproduced above; a theorist who thinks the
scales are exponentially rather than doubly-exponentially spread should
compute `log k_n / log k_{n−1}` and see `1.8`. *(b)* `Δ_n` attained: for
`n = 4, 8, 16, 24, 32, 48, 64` there are distinct rows `t < s < 20000` with
`rowNat t ≡ rowNat s (mod 2^{n−1})`, witnesses `(2,3), (2,4), (11,15),
(25,29), (33,41), (64,72), (87,95)`. *(c)* Level size: the distinct values of
`rowNat t mod 2^n` over all `t` number `4, 17, 42, 99, 177, 325, 670, 1314,
2701` at `n = 8, 16, 32, 64, 128, 256, 512, 1024, 2048` — every orbit closed,
no cap hit — so the ratio to `n` is `1.28`–`1.55` with no trend. **That `1.32`
is an independent reproduction of the board's own `4/3`** (Sextant's correction
to crystal 69, least-squares slope `1.329` for the preperiod of the low `n`
bits), arrived at as a *count of states* rather than as a settling time, which
is a cross-check nobody had. The statement that would kill this connection:
*exhibit a tower of level-`n` objects for rule 30 that has `2^{Ω(n)}` objects
at level `n` and a metric that is not discrete.* I could not build one, and §4
records the two I tried.

**And the last row of the table is the whole thing in one line, so it is worth
saying outside the table.** Fix the index set honestly — index the tower by the
orbit's *distinct* level-`n` states rather than by time — and the count is
`O(n)`, so the similarity dimension is `0`, so Hochman's own conclusion
`dim = min(1, s-dim)` reads `dim = 0`. **The theorem applies, gives the right
answer, and the right answer is that a single orbit is a single orbit.** That
is the same `0` §3.4 gets from Kolmogorov complexity, arrived at from inside
the fractal-geometry framework rather than from outside it, which is the
strongest evidence I can offer that the framework is not being
misapplied — it is being applied and it is empty.

**What it would give.** Nothing towards either prize, and that is the result:
it prices the entire Hochman/Shmerkin programme at zero for this problem and
says precisely why — not "we lack a measure" (which is the usual shrug) but
"the hypothesis that makes those theorems hard is a statement about a
continuum, and this object is discrete, with an `O(n)`-sized level `n`".
**Band: Nothing**, and it is a fence.

---

### 3.3 The one measure this problem has satisfies the hypothesis with deficit exactly zero

**The claim.** Hochman's non-concentration hypothesis is not merely
unavailable here — for the natural measure it is **already true, exactly, at
every scale, with no error term**, and both prizes remain open anyway. So the
gap between the vantage and the problem is not a gap in the hypothesis; it is
the entire distance between a measure and one of its points, and no
strengthening of the hypothesis can close it.

**The dictionary.**

| This project | Hochman's world | Checked |
|---|---|---|
| a random row, each cell a fair coin | the self-similar measure `μ` | uniform Bernoulli is invariant because rule 30 is surjective (Hedlund; crystals 3/6) |
| the centre column of such a row | the measure at dyadic resolution | crystal 67 |
| the block measure at length `n+1` | `μ` resolved at scale `2^{-(n+1)}` | — |
| its entropy | `H(μ, 𝒟_{n+1})` | **exactly `n+1` bits**: enumerated, `min = max = 2^n` counts, `n ≤ 9` |
| non-concentration with `ε = 0` | the hypothesis in its strongest form | attained, not approached |
| Hochman's conclusion `dim = min(1, s-dim)` | here: the ensemble's column law is Bernoulli(1/2) | true, and it is the *statement* rather than a consequence |
| the seed | one point of a measure-one set | crystal 67's ensemble fence |
| **Seam 1** | the theorem concludes about `μ`; P2 asks whether `c` is a **generic point** for `μ`, and no measure statement supplies genericity | crystal 67, Waywiser's fence |
| **Seam 2** | eventually periodic sequences are dense in the support, so no support or positivity argument separates them | crystal 67 |
| **Seam 3** | the property is **left-permutivity**, not rule 30: rule 90 passes the same enumeration identically | measured |

**What it leans on.** Crystal 67 (`centerColumn_trace_uniform`, Parallax
2026-09-09, kernel-checked there at `n = 1,2,3`; still unseeded as of this
session) says that for each word `v` of length `n+1`, exactly `2^n` of the
`2^{2n+1}` windows of width `2n+1` produce it. The mechanism is left
permutivity: `c(s)` depends on cells `−s … s`, flipping cell `−s` flips
`c(s)`, so for each fixed right half `(x_1,…,x_n)` the map
`(x_0, x_{−1}, …, x_{−n}) ↦ (c(0), …, c(n))` is a triangular bijection. The
project holds the invariance statement in a source:

> "Another equivalent condition states that the uniform Bernoulli measure is
> invariant for F."
> — `sources/kurka-topological-dynamics-1d-ca.txt`, lines 458–461

**The test, and I ran it.** `explorer/rosetta13_scales.mjs` block B enumerates
**every** window of width `2n+1` for `n = 0 … 9` — `524,288` windows at
`n = 9` — and tallies the column word. At every `n`, `min count = max count =
2^n` and all `2^{n+1}` words are hit. **The control that shows the check can
fail:** the same enumeration at `n = 5` for four rules — rule 30 gives
`min 32, max 32, 64/64 words`; rule 90 gives `min 32, max 32, 64/64`; **rule 4
gives `min 0, max 1024, 3/64 words`; rule 110 gives `min 0, max 202, 57/64`.**
So the enumeration is not vacuous, and it also shows the property is
permutivity rather than rule 30 — which is exactly crystal 66's filter firing,
and it is why this connection is a fence and not a finding.

**What it would give.** Nothing towards either prize. Its value is a sharp
statement of the vantage's failure mode: **the hypothesis is saturated and the
conclusion is empty**, so no amount of work on the hypothesis side helps, and
any future proposal whose plan is "verify a non-concentration bound by
computation" is proposing to verify something already known to hold with
deficit zero for the wrong object. **Band: Known** — the trace of a permutive
CA under the uniform measure being Bernoulli is standard; the enumeration is a
reproduction of crystal 67 with a failing control attached.

---

### 3.4 The only dimension a single sequence has is effective dimension, and it is zero

**The claim.** Every conclusion in the Hochman–Shmerkin programme is a
*dimension* statement. Dimension is an attribute of a set or a measure, and
rule 30's centre column is one point. There is exactly one theory that assigns
a dimension to an individual infinite sequence — Lutz–Mayordomo effective
dimension — and it assigns `c` the value **0**, because `c` is computable; it
assigns an eventually periodic sequence `0` as well. So **no dimension-valued
statement whatsoever can separate the two cases**, and this is a fence over
the whole field rather than over one theorem.

**The dictionary.**

| This project | Effective dimension | Checked |
|---|---|---|
| `c`, one explicit sequence | `X ∈ {0,1}^ℕ` | — |
| Hochman's `dim μ` | `dim_H(X) = liminf_n K(X↾n)/n` | fetched |
| "`μ` has full dimension" | `dim_H(X) = 1`, i.e. `X` is incompressible | — |
| `c` is computable in `O(t²)` bit operations | `K(c↾n) ≤ K(n) + O(1) = O(log n)`, so `dim_H(c) = 0` | one line from the fetched characterisation; **my derivation, not a fetched sentence** |
| an eventually periodic sequence | `K(x↾n) = O(log n)` likewise, so `dim = 0` | same line |
| **Seam 1** | the two cases the wall is about have the *same* effective dimension, so the invariant is blind to the question | — |
| **Seam 2** | this is not a defect of effective dimension — it is what "computable" means. The same argument kills effective dimension, `L^q` dimension of the orbit's Dirac mass, box dimension of a single point, and packing dimension, all at once | — |
| **Seam 3** | the escape route in that literature is *resource-bounded* dimension (polynomial-space dimension can be positive for computable sequences) — which is Prize **3**, not Prize 2 | the one place this row points somewhere live |

**What it leans on.** Fetched:

> "The **effective Hausdorff dimension** of a set of natural numbers _X_ is
> lim inf n K ( X | n ) n" … "Every random sequence will have effective
> Hausdorff and packing dimensions equal to 1."
> — <https://en.wikipedia.org/wiki/Effective_dimension>

(The render collapsed the restriction bar `X↾n` to `X|n`; read it as the
length-`n` prefix.) The step from there to `dim_H(c) = 0` is mine and is one
line: a program that prints `c↾n` is "run rule 30 for `n` steps", of size
`O(1)` plus an encoding of `n`.

**The test.** The falsifiable statement, and a theorist can settle it from the
definitions in an hour: *is there any dimension-valued invariant, in any
sense, that is defined for an individual computable sequence and takes
different values on `c` and on an eventually periodic sequence?* My claim is
that every classical one is `0` on both, and that the only known escape is to
bound the resources of the compressor, which is Prize 3's territory.
Falsifying it would reopen the entire fractal-geometry wing.

**What it would give.** A fence over a field, not a step. It says that a
future connector sighting rule 30 from geometric measure theory, multifractal
analysis, or thermodynamic dimension theory should begin by naming which
object carries the dimension, and that if the answer is "the column" the
sighting is over before it starts. **Band: Nothing** as mathematics —
`dim_H(computable) = 0` is an exercise. **Project-internal** as the fence, and
it is the widest fence in this document.

---

### 3.5 The inverse theorem is about a convolution, and rule 30 has one variable

**The claim.** Hochman's Theorem 2.7 — the inverse theorem itself, the engine
of the whole programme — has no statement to make about rule 30, not because
its hypothesis fails but because its *syntax* does: it compares `H(μ∗ν)` with
`H(μ)`, and a convolution needs two independent factors. Rule 30's step does
decompose additively over `F₂`, and the decomposition shows why there are
never two factors.

**The dictionary.**

| This project | Inverse theorem for entropy | Checked |
|---|---|---|
| the row space, `F₂`-vector space under XOR | the group `ℝ` under `+` | a genuine group, so the framework is not blocked here |
| the row map `T(r) = 4r ⊕ (2r ∨ r)` | — | `Basic.lean`'s `rowStep` |
| `a ∨ b = a ⊕ b ⊕ (a ∧ b)`, so `T(r) = (4r ⊕ 2r ⊕ r) ⊕ (2r ∧ r)` | `T = L + Q` with `L` linear, `Q` quadratic | crystal 59: rule 30 = rule 150 + one quadratic term |
| `L(r) = 4r ⊕ 2r ⊕ r` | multiplication by `x²+x+1` over `F₂[[x]]`, injective, so `H(L_*ν) = H(ν)` exactly | elementary |
| the candidate convolution `L(r) ∗ Q(r)` | `μ ∗ ν` | **the seam**: both summands are functions of the *same* `r`, so their joint law is supported on a graph and the "convolution" is a push-forward of one measure |
| the damage `T(r⊕e) ⊕ T(r) = L(e) ⊕ (2r ∧ e) ⊕ (2e ∧ r) ⊕ (2e ∧ e)` | a second candidate: the damage as one factor, the background as the other | the cross terms mix `r` and `e`, which is `rule30_left_local_law` and crystals A3 — the pair is not independent and never becomes so |
| **Seam 1** | there is no second measure to convolve with at any point in the construction | — |
| **Seam 2** | even granting a convolution, Theorem 2.7's conclusion is "`μ` is uniform on most scales **or** `ν` is atomic on most scales" — a dichotomy about *measures*, landing back in §3.3 and §3.4 | — |

**What it leans on.** Fetched, same source as §3.2:

> **Theorem 2.7**: "If Hₙ(μ∗ν) < Hₙ(μ) + δ, then there are disjoint subsets
> I,J⊆{1,…,n} with |I∪J|>(1−ε)n such that [for k∈I] typical μˣ'ⁱ are (ε,m)-uniform
> and [for k∈J] typical νˣ'ⁱ are ε-atomic"
> — <https://ar5iv.labs.arxiv.org/html/1212.1873>

and the abstract's own summary of it, fetched from
<https://arxiv.org/abs/1212.1873>: *"if H(ν∗μ,D_n)/n < H(μ,D_n)/n + δ for
small δ and large n, then, when restricted to random element of a partition
D_i, 0<i<n, either μ is close to uniform or ν is close to atomic."*

**The test.** One statement to falsify, and it is concrete: *exhibit two
measures, constructed from rule 30 alone, whose convolution is a rule-30
object and for which `H(μ∗ν)` is a quantity the board can bound.* The
`L + Q` decomposition says the obvious candidates are a single push-forward
wearing two names. A theorist who finds a genuine pair has re-opened the
inverse theorem for this problem; I could not, and §4.5 records the attempt.

**What it would give.** Nothing, and it is the narrowest and most decisive of
the four fences, because it fails at the level of *what the theorem says*
rather than at the level of whether its hypothesis holds. **Band: Nothing.**

---

### 3.6 The brief's own object: the settled region passes the non-concentration test, and it is a zero-entropy object

**The claim.** The vantage said to point non-concentration not at the column
but at the pair (settled region, transient band). I did, and the answer is the
sharpest negative in this document: **all three sequences — the settled centre
column `s`, the real centre column `c`, and the damage boundary `d = c ⊕ s` —
have coin-like block entropy at every scale the data reaches, and the settled
region is an object whose determinism is *proved*.** So the test passes on an
object known to be determined, which means the test cannot distinguish
determinism from randomness, which means no amount of it can be a route. This
is the thermodynamic sighting's "first-order statistics cannot see
determinism", arriving in entropy vocabulary at the one object the brief hoped
would be different.

**The dictionary.**

| This project | Hochman's world | Checked |
|---|---|---|
| `s(k) = S_k(0)`, the settled centre column | one "component measure" of the multiscale decomposition | obstruction 4: "nothing is known about `s`" |
| `S_k`, the settled word of diagonal `k` | a level-`n` cylinder's own measure | `P(k)`-periodic with `P(k)` a power of two (`leftDiagonal_periodicFrom_pow`) |
| entropy of `S_k` read **along the diagonal** | `H(μ, 𝒟_m)` for a component | **`≤ log₂ P(k)` at every `m`**, because a `P`-periodic word has at most `P` distinct factors of any length — `≤ 4` bits for `k ≤ 53000`, `≤ 5` bits for `k < 2107985255` |
| entropy of `s` read **along `k`** | the same component read transversally | measured: coin-like at every `m ≤ 14` |
| `d = c ⊕ s`, the transient band's boundary | the "error" or "deviation" the decomposition is supposed to isolate | measured: coin-like at every `m ≤ 14` |
| **Seam 1** | the settled region has entropy `≤ 5` bits along diagonals and `≈ m` bits along `k`. Non-concentration is therefore a statement about the **direction of reading**, not about the object, and Hochman's framework has no direction parameter | — |
| **Seam 2** | the object that passes the test is the one whose structure is *proved*. So passing the test carries no information about the column, which is the object whose structure is unknown | — |
| **Seam 3** | the whole space-time picture has `ℤ²` entropy **zero** (an `n×n` admissible pattern is determined by `O(n)` cells), so there is no positive-dimensional object anywhere in the picture for a dimension theorem to conclude about | the thermodynamic sighting of 2026-09-09, §4 |

**What it leans on.** `leftDiagonal_periodicFrom_pow` (closed) for the
power-of-two periods; obstruction 4 for `s`'s definition and for the statement
that nothing is known about it; Rowland 2006 §6 for the recurrence that
generates the settled words without the picture. The zero-`ℤ²`-entropy remark
is quoted from this project's own thermodynamic sighting:

> "Its `ℤ²` entropy is `0`: an `n × n` admissible pattern is determined by
> `O(n)` cells, so `log N(n)/n² → 0`."
> — `docs/connections/2026-09-09-thermodynamic-formalism-*.md`, §4

**The test, and I ran it.** `explorer/rosetta13_settled.mjs` builds the settled
words from the recurrence alone to `k = 53000` — stopping before the branch at
`53207`, so the engine is consulted only at the four branch points below
`400` — and reads `s(k) = S_k(0)`. **Three validations, one of them
asymmetric:** the branch points come back as `3 (p→2), 8 (p→4), 29 (p→8),
400 (p→16)`, which is NKS p.871's doubling list; `s` agrees with `c` at rate
`0.5006`, inside obstruction 4's measured `0.48`–`0.52`; and
`s(0..17) = c(0..17) = 110111001100010110` exactly, which they must, because
the onsets are zero for `k ≤ 17` and nowhere else — a check a mirrored or
mis-phased orbit fails. Densities over `k ≤ 53000`: `s` `0.501028`, `c`
`0.501840`, `d` `0.499406`. Entropy deficits `m − H(m)` in bits:

| `m` | settled `s` | column `c` | band `d = c⊕s` | crypto coin | coin 2 |
|---|---|---|---|---|---|
| 1 | 3.051e−6 | 9.764e−6 | 1.019e−6 | 1.696e−5 | 1.100e−5 |
| 2 | 1.104e−5 | 2.146e−5 | 3.277e−5 | 4.195e−5 | 4.190e−5 |
| 4 | 2.547e−4 | 1.301e−4 | 2.166e−4 | 2.098e−4 | 2.255e−4 |
| 8 | 4.560e−3 | 4.021e−3 | 3.754e−3 | 3.140e−3 | 3.179e−3 |
| 12 | 6.056e−2 | 6.337e−2 | 5.314e−2 | 5.599e−2 | 5.280e−2 |
| 14 | 2.476e−1 | 2.557e−1 | 2.359e−1 | 2.415e−1 | 2.300e−1 |

**Every column is every other column, to within the coin's own draw-to-draw
scatter.** The statement that would kill this connection: *exhibit any reading
of the settled region whose empirical block entropy differs measurably from a
coin's at some scale below `log₂ K`.* The diagonal reading does — by a factor
of `m/5` — and it is the reading in which the object is *provably* periodic, so
it is the reading that carries no news.

**What it would give.** Nothing, and it answers the brief's own question with a
number rather than a shrug: pointing non-concentration at the settled region
fails not because the settled region is hard to compute but because it
**passes**, and it passes while being a `≤ 5`-bit object. **Band: Novel, and
tiny** — the block entropy of `s` and of `c ⊕ s` has not been measured before
on this board (obstruction 4 says nothing is known about `s`), so the three
numbers are new; what they say is that `s` is another coin, which is the
board's most-repeated measurement arriving at a new object.

---

## 4. Died in translation

Fourteen. Four of them are measurements of mine that had to be controlled
before they could be reported, and all four were controlled out.

1. **"Rule 30's block entropy deficit is smaller than a coin's."** Mine, and it
   was the first number the session produced: at `N = 3·10^5` the column's
   deficit at `m = 1` was `2.8e−6` against coin draws of `8.0e−5`, `1.8e−3`,
   `3.0e−3` — a factor of ten to a thousand, consistent at every `m`, and it
   would have been the headline. **It is the generator**, and that is measured
   rather than suspected (`explorer/rosetta13_control.mjs`, the table in §3.1):
   against `node:crypto` and against `Math.random`, five draws in all, the
   column sits *inside* the scatter at every block length — `1.67e−1` against
   `1.64`–`1.67e−1` at `m = 16`, `5.83e−4` against `5.18`–`6.80e−4` at `m = 8`.
   The bad coin was a hand-rolled 32-bit xorshift whose output I sliced 32 bits
   at a time; its low-order bits are correlated, which manufactures repeated
   windows. *The tell I nearly ignored:* a deficit of `8.0e−5` at `m = 1`
   corresponds to an excess of `5.7√N`, and the second draw's `1.8e−3` is
   `27.3√N` — **a control more extreme than the thing it controls is broken,
   not informative**, and the `m = 1` deficit is nothing but the excess
   restated, so that column was telling me the generator was broken in the same
   table where I was reading a finding. My notebook records this exact failure
   twice already, once with an LCG whose low bit alternated.
2. **"The doubling depths are each roughly the square of the last, so the
   scales are exponentially separated."** The brief's own sentence, carried
   in as settled. Died at the arithmetic: `k_n / k_{n−1}²` is `0.889, 0.453,
   0.476, 0.549, 0.273` — decreasing, so it is *sub*-squaring — and the real
   law is `log k_n ≈ 1.8 log k_{n−1}`. It matters, because squaring and
   `1.8`-ing both give `Θ(log log K)` scales, which is the *opposite* of the
   `Θ(n)` a multiscale argument wants; the brief read "very fast growth" as
   "the structure those theorems eat" and the two are contradictory.
3. **"The empirical block entropy at the board's scales `29, 400, 87867` is
   the computation this session is for."** The brief's plan, and mine for the
   first hour. Died on the estimator: the empirical entropy of `N` windows
   cannot exceed `log₂ N`, so scale `m` is measurable only when `N ≫ 2^m`.
   Scale `29` needs `N ≫ 5.4·10^8` — fifty times deeper than the board's own
   deepest run — and scale `400` needs `N ≫ 2^400`. **Of the six scales the
   board has, this statistic can evaluate two**, `m = 3` and `m = 8`, and at
   both the column's `H` agrees with the coins' to six decimal places
   (`2.99999824` against `≈2.999999`; `7.99995479` against `7.99996`). The
   computation the brief asked for is not merely unrun; at four of its six
   points it is unrunnable in principle.
4. **`Δ_n` as a quantity worth measuring.** My plan for the first two hours:
   build the settled-word orbit and measure the minimal Hamming distance
   between distinct level-`n` states, expecting a decaying rate. Died on
   paper, and the death is §3.2: distinct residues mod `2^n` are at 2-adic
   distance `≥ 2^{-(n−1)}` by definition, so `Δ_n` is bounded below by the
   scale for free, and the measurement can only confirm that the trivial bound
   is attained. *What I should have asked in the first ten minutes:* what makes
   Hochman's hypothesis **hard**, rather than what it says. It is hard because
   `ℝ` has no minimum gap.
5. **The settled-word pair orbit as an "IFS without overlaps".** The board's
   proved `leftDiagonal_pair_never_eventually_shifted` is exactly "no exact
   overlaps", and Hochman's Theorem 1.5 turns no-exact-overlaps into full
   dimension for algebraic parameters. Died at the transfer: the dichotomy's
   other branch is a statement about `Δ_n` in a continuum, and there is none;
   and the object whose dimension would be concluded is a measure the orbit
   does not carry. What survives is only the observation that the board owns
   the no-overlaps half already — which is worth knowing, because in Hochman's
   setting no-exact-overlaps is the *hard* half and the conjectural content of
   the whole subject.
6. **`leftDiagonal_period_le` as a Liouville inequality.** It has the right
   *smell*: it says the period of diagonal `k` is at most `k+1`, hence — since
   the period after the `n`-th doubling is `2^n` — that `k_n ≥ 2^n − 1`, a
   quantitative statement about where scale changes can sit. Heights are
   exactly what makes Hochman's hypothesis checkable, so this looked like the
   ingredient. Died on what it bounds: a Liouville inequality bounds how
   **close two distinct objects get**, and this bounds **how far apart the
   scales are** — different quantities, and the first one has already been
   answered for free by the discrete metric (§3.2). The obstruction "A
   universal bound on the recurrence's hitting times cannot prove the period
   wall" says the same thing from inside the board's own vocabulary: it is an
   upper bound where the wall needs a lower one.
7. **The `L + Q` decomposition as a convolution.** §3.5. Died on inspection:
   both summands are functions of `r`. I spent twenty minutes trying to make
   the damage `e` the second factor before noticing that the cross terms
   `(2r ∧ e) ⊕ (2e ∧ r)` are precisely `rule30_left_local_law`, i.e. the
   coupling that crystals A3 says cannot be broken.
8. **`L^q` dimensions and Shmerkin's smoothing.** The one tool in that
   literature that is often easier than the `q = 1` case, and the reason I
   looked at Shmerkin rather than only Hochman. Died at the object: the `L^q`
   dimension of a Dirac mass is `0` for every `q`, and the only non-Dirac
   measure available is §3.3's ensemble, where every `L^q` dimension is
   already `1`. Two values, both known, neither about the seed.
9. **Hochman–Shmerkin "local entropy averages" and the column as a
   projection.** Genuinely the closest fit in the whole programme: the row is
   the high-dimensional object, the column is a one-dimensional projection,
   and their theorem gives full dimension of *every* projection rather than
   almost every one — which is exactly the "one explicit object" strength the
   vantage was hunting. Died at the hypothesis, which is a CP-chain or
   uniformly-scaling structure on the measure; a single deterministic orbit
   has no scenery flow, and building one requires the measure of §3.3, whose
   projections are all already full. **UNVERIFIED:** I did not fetch that
   paper this session; the identification of its hypothesis as a CP-chain /
   uniform-scaling condition is from memory and a theorist should check it
   before relying on this row's wording.
10. **"The settled region will look different from a coin, because we know it
    is determined."** Mine, and the reason I ran §3.6 at all; the brief's hope
    too. Died at the table: `s`, `c` and `c ⊕ s` sit inside two CSPRNG draws'
    scatter at every `m ≤ 14`, and the settled centre column's density is
    `0.501028` against the column's `0.501840`. *What makes this a death rather
    than a null result:* the settled region is a `≤ 5`-bit object along its
    diagonals, provably, so an object with **known** structure passes the test.
    The test is therefore not measuring structure. The thermodynamic sighting
    said this in 2026-09-09 about a different statistic and I reproduced it
    before reading that far; **the general form is that any statistic the
    settled region passes is a statistic that cannot see determinism, and that
    is a cheap filter a future connector should apply before running anything.**
11. **"Non-concentration is a property of the object."** Implicit in the whole
    vantage and in my own §1 restatement for the first three hours. Died on the
    settled region's two readings: `≤ log₂ P(k) ≤ 5` bits along the diagonal,
    `≈ m` bits along `k`, for the *same* object at the *same* scales. Hochman's
    framework has no direction parameter, so it cannot even state which of the
    two it means, and the direction the prize needs — a single vertical line —
    is the one with no theory attached.
12. **"The column's block entropy deficit sits 1–4% above a coin's at every
    `m` from 13 to 21, so there is a scale where it is measurably more
    concentrated."** Mine, from the `N = 4·10^6` table, where the column's
    deficit was above **all three** coin draws at nine consecutive block
    lengths — e.g. `3.050e−3` at `m = 14` against `2.87, 2.92, 2.93e−3`.
    Consistent across nine scales, and it would have been the first block
    statistic separating the centre column from a coin. **Dead against its own
    null.** `explorer/rosetta13_null.mjs`, `N = 10^6`, **twelve** crypto draws:
    the column's `z` is `0.81, 0.77, 1.15, 0.96, 0.98, 1.06` at
    `m = 10, 12, 14, 16, 18, 20`, with `1` to `4` of the `12` draws at least as
    extreme at every `m`. *Three draws could not have told me that, and nine
    scales are not nine tests* — `H(m)` for different `m` are computed from the
    same window multiset and are strongly correlated, so nine consecutive `+1σ`
    is one `+1σ`. And the control that settles it: a **second rule-30 column**,
    from the finite configuration `{0,3}`, gives
    `z = 1.39, 0.21, 0.24, 0.13, −0.04, 0.11` — scattered about zero. So the
    seed's `+1σ` is this draw and not this rule.
13. **My own second-column engine, silently.** The first version of
    `columnOfConfig` tracked the centre's bit index and replenished the low
    padding when *that* fell below 2 — but it is the **left edge** that eats the
    padding, one cell per step, so the picture lost its left edge at `t = 4` and
    the "column" came out near-constant (deficit `9.99983` at `m = 10`, i.e.
    entropy `0.00017` bits). *What caught it was not the absurd number* — I
    might have believed a near-zero-entropy second column for a minute — *but an
    asymmetric validation I had put in the same block*: the shield obstruction
    says `{0,2}` has the seed's centre column **exactly**, and the broken engine
    reported `210 of 400`. Fixed by replicating `rule30.mjs`'s own `pad`
    counter; now `400 of 400`, and `{0,3}`, which the shield says must *not* be
    preserved, gives `201 of 400`. **Two predictions in opposite directions from
    one obstruction is a better engine check than any number's plausibility.**
14. **The vantage's own escape hatch: "a hypothesis one can verify by
    computation on an explicit system".** This is the sentence that made the
    vantage attractive and it is true of Hochman's work — Theorem 1.5's
    `Δₙ ≥ sⁿ` really is established by a finite arithmetic argument. Died
    because the *reason* it is checkable there is a height bound on algebraic
    numbers, and the reason nothing needs checking here is that the metric is
    discrete. **The same property that makes the hypothesis free makes it
    worthless.** That sentence is the honest summary of this document.

**Nothing died for lack of depth.** Every death above has a witness computed
or a one-line argument: the entropy table runs to `4·10^6` terms of the column
with three CSPRNG controls and a twelve-draw null at `10^6`, the generator
comparison to `3·10^5` with eight controls from four sources, the crystal-67
enumeration is
exhaustive over all `524,288` windows at `n = 9` with three failing rule
controls, the settled-word orbit runs to `k = 53000` with the doubling list and
the zero-onset prefix as asymmetric checks, the separation witnesses are
explicit pairs below `t = 100`, and the scale arithmetic is six integers.

---

## 5. What to hand the theorist

**The verdict first, because it is a negative and it prices a whole wing of
mathematics.** The Hochman–Shmerkin programme cannot reach either prize, and
the reason is not the usual one. It is not that rule 30 lacks a measure — §3.3
exhibits the measure and shows it satisfies the non-concentration hypothesis
with deficit *exactly zero*, enumerated. It is not that the hypothesis is hard
to verify — §3.2 shows it is free in any 2-adic tower, because distinct
residues mod `2^n` cannot be closer than the scale. It is that **the theorems
conclude about dimension, dimension belongs to measures and sets, and the only
dimension an individual computable sequence has is zero** (§3.4) — which is
the same value an eventually periodic sequence has. The cleanest single
sentence is §3.2's last row: index the rule-30 truncation tower honestly and
level `n` has `1.32n` objects rather than `2^n` (measured, to `n = 2048`), so
its similarity dimension is `0` and Hochman's own theorem, applied faithfully,
**concludes `dim = 0`** — correctly, and emptily. And when the test is
pointed at the object the brief actually named — the pair (settled region,
transient band) — it **passes**, on an object whose determinism is proved
(§3.6), so it is not measuring structure at all. A captain should read
§3.2–§3.4 and §3.6 as four fences of increasing width and not dispatch anything
from them.

**Topic 1 — the block-entropy bridge, as a seedable sufficient condition for
Prize 2 and as a fence over the board's own measurements.**

*Band first, so nobody is sold anything:* **Nothing** as mathematics — it is
Shannon subadditivity and it is true of every `ℕ → Bool`; **project-internal**
as a route and as a fence. *The claim to falsify:* that

> for every `m ≥ 1` and every `N`, `|2·centerColumnCount N − N| ≤
> 2N·sqrt(ε_m·ln2/2) + 2m`, where `ε_m = 1 − H(μ_N^{(m)})/m` and `μ_N^{(m)}` is
> the empirical distribution of the length-`m` windows of the centre column,

so that a lower bound on the block entropy at **any** block length gives P2 a
bound on its excess. *The dictionary row it depends on:* §3.1's, and the two
inequalities are the fetched subadditivity and Pinsker statements. *The depth
that settles the measurement:* `N = 4·10^6`, `m ≤ 24`
(`explorer/rosetta13_entropy.mjs`); the bound is an identity at `m = 1`, loses
`3.6%` at `m = 2`, and loses a factor `725` by `m = 24`.

*Why it is worth a theorist's hour anyway, and it is not the route.* Three
things it does that nothing on the board does. **(a)** It is the first P2
inequality outside the run route, so Talus's cap — `|E| ≤ N(1 − 1/(c log N))`
for any run bound however sharp — does not apply to it, and a captain should
know there are now two ceilings rather than one. **(b)** It unifies:
corollary (ii) of §3.1 says the same statistic excludes eventual periods, so
one bound does P1-work and P2-work at once, where crystal 21's factor count
does P1-work only — entropy bounds the support *and* the marginal, a count
bounds only the support. **(c)** And it is a fence with teeth, which is the
part I would actually spend the hour on: **every "the centre column is
indistinguishable from a coin at block length `m`" measurement this board has
made — and there are many — is, read as a theorem, strictly stronger than
Prize 2, by a factor of `1.036` at `m = 2`.** So the honest reading of the
board's block statistics is that they are all super-prize, and a P2 proposal
that would establish any of them has established the prize. *Two warnings.*
The hierarchy is monotone the **wrong way** (`H(m)/m ≤ H₂(p)`), so no higher
rung is ever easier than the prize; and at `m = 1` the inequality is an
identity, so a proposal that lands only the `m = 1` case has landed a
tautology.

**Topic 2 — an adjudication, not a research session: seed crystal 67.**

§3.3 reproduces crystal 67 exhaustively to `n = 9` (`min = max = 2^n`, all
`2^{n+1}` words hit) with three failing rule controls, and the mechanism is a
triangular bijection from left permutivity. Crystal 67 has recommended its own
node since 2026-09-09, Ephemeris said the same on 2026-09-12, and it is in
neither `blueprint/dag.json` nor `Rule30/Statements.lean`. It is the exact
generalisation of the closed `window_count_half` from one time to a whole
prefix, its proof is `evolveFrom_leftPermutive` plus induction, and §3.3 gives
it a second independent verification and a control. *Band: Known.* *What must
not be inferred:* it says nothing about the seed, and §3.3's Seam 3 shows rule
90 satisfies it identically — so a `DOES NOT PROVE` field must say that it is
a statement about the ensemble and that crystal 66's filter passes it.

**Not handed over, deliberately.** Everything in §3.2, §3.4 and §3.5. They are
fences over fields rather than statements about rule 30, they are band
**Nothing**, and their whole use is to stop a future session spending a day in
fractal geometry. If a captain wants one sentence for the obstruction file it
is this: *a sighting from any dimension-theoretic field should name which
object carries the dimension in its first paragraph, and if the answer is "the
centre column", the answer is zero and the sighting is over.*

**And one cheap filter, from §3.6, which is worth more to the next connector
than either topic.** Before running any statistic on the centre column, run it
on the **settled centre column** `s(k) = S_k(0)` as well
(`explorer/rosetta13_settled.mjs` builds it from the recurrence in under a
second to `k = 53000`, with the doubling list `3, 8, 29, 400` and the
zero-onset prefix as validations). `s` is an object whose determinism is
*proved* — its diagonals are periodic with power-of-two periods — so **any
statistic that `s` passes is a statistic that cannot see determinism.** Block
entropy at every `m ≤ 14` is such a statistic; so is density (`0.501028` for
`s`, `0.501840` for `c`); so, in the thermodynamic sighting's measurement, is
the firing density. This is a `Nothing`-band observation about methodology and
it would have saved this session two hours.

---

## 6. Next vantage

**Additive combinatorics of the row, not the column: Croot–Sisask almost-periodicity, Sanders/Bloom-type structure theorems for sets of positive density in `F₂^n`, and Tao's entropy sumset theory — aimed at Prize 2 through the *row* marginal rather than the column marginal.** The reason is §3.5's seam read positively. This document's fences all come from the column being a single orbit with no group; but the **row** is an element of `F₂^n`, which is a group with a large literature, and the board already knows the row is where the automaton's local law has purchase — Sextant's 2026-09-12 obstruction proves the row-marginal programme closes at exactly `3/5` and identifies the extremal object (the ring `10011`). What nobody has asked is whether the *reachable set* of rows at depth `t` — which Sextant's `4^{-t}` obstruction shows is a regular language with a computable automaton at each `t`, and which is exactly a subset of `F₂^{2t+1}` of density `4^{-t}` — has additive structure: a set of density `4^{-t}` in a group of size `2^{2t+1}` is precisely the regime where Fourier-analytic and almost-periodicity methods have something to say, and the linear part `L` of §3.5 acts on it. That is a *group*, a *density*, and an explicit set, which is all three of the ingredients every field in this document turned out to lack.

**The vantage I could not reach from where I stood: resource-bounded dimension, aimed at Prize 3.** §3.4's Seam 3 is the only row in this document that points somewhere live rather than at a fence. Effective dimension is `0` for every computable sequence, which kills the classical dimension route — but *resource-bounded* dimension (Lutz's polynomial-time and polynomial-space dimension, defined by putting a resource bound on the gale rather than on nothing) is built for exactly this situation, and the point that makes it worth a session is fetched rather than remembered:

> "if one-way functions exist, then there are individual sequences X whose poly-time dimension strictly exceeds K_poly(X), that is cdim_P(X) > K_poly(X)."
> — <https://arxiv.org/abs/2411.02392>, *One-Way Functions and Polynomial Time Dimension*

So in that theory an individual, efficiently-describable sequence **can** carry positive dimension, which is precisely what the classical theory forbids. "The centre column has positive polynomial-time dimension" would be a sharp, quantitative, *dimensional* rendering of Prize 3 — and, unlike the `TM2ComputableInPolyTime` formulation the board is currently using, it arrives with gale/martingale machinery, a base-invariance theory, and a literature relating it to one-way functions. Three cautions before anyone spends the session. The quoted result is **conditional** on one-way functions existing, so the theory's separating power is not unconditional. `cdim_P` is a *constructive* (limit-inferior along one sequence) dimension and I have not checked how it relates to the board's `Ω(n)`-time threshold. And the whole field's objects are complexity classes rather than automata, so the connector's first job is the one this document did in §3.4: name which object carries the dimension. I could not reach it because this session's vantage was aimed at P2 and became a fence by hour two. A connector taking it should fetch Lutz's *Dimension in Complexity Classes* (<https://arxiv.org/abs/cs/0203016>, **UNVERIFIED**: found in a search, not fetched) and Mayordomo's survey, and check against Pantograph's P3 reading before assuming the two formulations agree.
