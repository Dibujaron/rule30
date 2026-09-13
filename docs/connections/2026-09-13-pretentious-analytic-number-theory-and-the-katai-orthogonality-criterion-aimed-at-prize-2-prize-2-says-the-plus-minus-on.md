# Pretentious analytic number theory and the Kátai orthogonality criterion, aimed at Prize 2

*Rosetta, connector, 2026-09-13. A sighting, not a proof. Nothing here is a
theorem about rule 30, and where a claim is a measurement of this project's own
code rather than a result from the literature it is marked as such.*

**Band, stated first as CLAUDE.md asks.** The literature half is **known** —
Kátai's criterion is forty years old and BSZ's quantitative form is in every
survey of the Sarnak circle. The rule-30 half is **project-internal**: it opens
one route to Prize 2 that this board has never held, prices it exactly, and
fences the one reason the brief gave for optimism. The single thing a
mathematician outside this project would care about is §3.3: **the criterion is
quantitative, so a partial result over finitely many prime pairs buys a
constant-factor bound on Prize 2's excess**, and Prize 2 has never had a route
with that shape — every other route on the board is all-or-nothing.

**One measurement here goes past what the board holds, and it is small.** Crystal
73 excludes the centre column being 2-*automatic*, by measurement. §4's last entry
measures that it is not 2-*regular* over `F₂` either — its 2-kernel is linearly
independent to 2,047 elements, exactly like a coin's, where a 2-regular sequence
saturates at its module rank (Thue–Morse, at 2). Not being 2-regular is strictly
stronger than not being 2-automatic, so this subsumes and extends crystal 73. It
is a fingerprint of this project's code, not a citation, and a measurement rather
than a proof; what it does is close a wing nobody had opened — including the
section 6 I had already written.

---

## 1. The problem, seen from outside

Take the bi-infinite row of cells that is white everywhere except one black cell,
and update every cell forever by the local rule *new = left XOR (centre OR
right)*. Write down the colour of the origin cell at each time step. That gives
an infinite sequence of bits `c(0), c(1), c(2), …` — black, black, white, black,
black, black, white, white, … — which is OEIS A051023 and the only interesting
object here. The residual is: **does this bit sequence eventually repeat?** It
has been computed to a billion terms and does not; nobody can prove it does not,
and nobody has found a route. This document is about a sibling question, Prize 2:
**does the fraction of black bits among the first `N` tend to one half?** The
count to `10^7` is 5,002,220, an excess of 4,440 over half, which is `1.40√N` —
a coin's own scatter. Every statistic this project has aimed at that sequence —
block frequencies, run lengths, autocorrelations at additive shifts, the excess
itself — has come back looking exactly like a fair coin, and the best proved
bound on the excess is `N(1 − o(1))`, which is to say almost nothing.

Restated in the vantage's own field. Put `a(n) = (−1)^{c(n)} ∈ {±1}`, a bounded
arithmetic function. Prize 2 is exactly `Σ_{n≤N} a(n) = o(N)`: **the sequence
`a` has mean value zero.** Analytic number theory has one general machine for
proving that a bounded sequence has mean value zero without knowing anything
about where the sequence came from — no measure, no hull, no invariant measure,
no typical point — and that machine is Kátai's orthogonality criterion. It says:
if the *dilations* of `a` by distinct primes decorrelate, then `a` is orthogonal
to every bounded multiplicative function, and the constant function `1` is one of
those. So the field's statement of the residual is: **do the dilated sequences
`n ↦ a(pn)` and `n ↦ a(qn)` decorrelate for every pair of distinct primes?** In
rule-30 words, and this is the whole translation: *is the colour of the origin at
time `pn` uncorrelated, averaged over `n`, with the colour of the origin at time
`qn`?*

---

## 2. Fields sighted

| Field / theory | The object there | The seam, in one line |
|---|---|---|
| **Kátai's orthogonality criterion / BSZ** | a bounded `a: ℕ→ℂ` whose prime dilations decorrelate | Trades one mean-zero statement for infinitely many of the same difficulty class — §3.1 |
| **BSZ in quantitative form** | a saving `τ` at primes `≤ e^{1/τ}` buying `2√(τ log 1/τ)` | Finitely many pairs, each still an asymptotic statement — §3.3 |
| **Halász's theorem, Granville–Soundararajan pretentious theory** | multiplicative `f` with `|f|≤1`; mean non-zero only if `f` pretends to be `n^{it}` | `a(1) = −1` and every multiplicative function has `f(1)=1`, so `a` is not multiplicative and the structure theory does not see it — §4 |
| **Analysis of Boolean functions (Fourier–Walsh, influence)** | the degree-1 coefficient of the `s`-step map at the centre input | Left-permutivity makes it exactly zero under the uniform measure, for rule 90 too — §3.2 |
| **Sarnak's Möbius disjointness conjecture** | zero-entropy (deterministic) sequences | The centre column's factor complexity is near-maximal, so the conjecture's hypothesis does not hold of it — §3.5 |
| **Chowla's conjecture** | self-correlations of `μ` at additive shifts | The analogue for `c` is the additive-shift statistic this board has already measured to be a coin; the criterion needs *multiplicative* shifts instead |
| **Daboussi's theorem** | `a(n) = e(nα)`, `α` irrational | The model verification: the hypothesis falls to `e(n(p−q)α)` being a geometric series. Rule 30 supplies no such identity — §3.1 seam |
| **Mauduit–Rivat, Müllner: automatic sequences** | Thue–Morse, Rudin–Shapiro | Their dilation correlations decay at `N^{-0.26}`, *slower* than rule 30's `N^{-0.50}` — §3.5 |
| **Drmota–Mauduit–Rivat–Spiegelhofer, maximal entropy** | `b`-multiplicative functions along squares | Kills the tempting "positive entropy is the obstruction" reading; the real obstruction is the missing algebraic identity — §4 |
| **Vinogradov's bilinear method, Type I/II sums** | BSZ's engine is a finite Vinogradov bilinear inequality | Bilinearity needs a factorisation `n = p·m` that the object respects; rule 30's time index has no arithmetic the picture respects except `ord₂` — §3.4 |
| **Turán–Kubilius, Erdős–Kac** | `ω(n) ≈ log log N` concentrates; this is what turns the bilinear bound linear | The `log log` in the criterion is *the number of prime factors of the row index*, a quantity rule 30's picture has never been shown to notice |
| **Furstenberg ×2 ×3 rigidity** | decorrelation of multiplicatively independent dilations | Furstenberg needs a measure invariant under both maps; the time index of a single orbit carries no measure — the board's four-times-killed seam |
| **Logarithmically averaged Chowla/Sarnak (Tao, Frantzikinakis–Host)** | the same criterion with `1/n` weights | Conclusion is log-density mean zero, strictly weaker than Prize 2's natural density — §4 |
| **`k`-regular sequences and Mahler's method** (Allouche–Shallit; Nishioka) | sequences whose `k`-kernel spans a finitely generated module — the machine that manufactures dilation identities | Dead, and measured dead here: the centre column's 2-kernel is linearly independent to 2,047 elements, like a coin's — §4, last entry |
| **Mauduit–Sárközy pseudorandomness measures** | `W` and `C_k` for one explicit finite binary sequence, no measure anywhere | The only unsighted literature in Kátai's own slot; its correlations are all *additive* where §3.3 needs one *multiplicative* — §6 |

---

## 3. Connections

### 3.1 Kátai's criterion reduces Prize 2 to a two-row decorrelation, and this is the first reduction of Prize 2 the board has ever held

**The claim.** Prize 2 follows from a statement that never mentions a density, an
excess, a run, or a block — only that the origin's colour at time `pn` and at
time `qn` decorrelate as `n` runs, for each pair of distinct primes; and that
statement is expressible entirely inside this project's existing two-row
vocabulary, where every previous Prize 2 route had to speak about counts.

**The dictionary.**

| This project | Kátai's criterion | Checks? |
|---|---|---|
| `centerColumn : ℕ → Bool` | the bounded sequence `a : ℕ → ℂ`, `a(n) = (−1)^{c(n)}`, `‖a‖_∞ = 1` | yes; `a` is bounded by construction |
| the time index `t` | the argument `n` of the arithmetic function | yes |
| Prize 2, `centerColumn_density_tendsto_half` | `Σ_{n≤x} a(n) = o(x)`, i.e. mean value zero | yes; `Σ_{n≤N} a(n) = −E(N)` with `E` the board's excess, so mean zero **is** density → ½ |
| row `pn` and row `qn` of the one picture | the dilations `a(pn)`, `a(qn)` | yes; `p, q` distinct primes |
| the hypothesis | `Σ_{n≤x} a(pn)a(qn) = o(x)` for all distinct primes `p ≠ q` | yes |
| the conclusion at `f ≡ 1` | Prize 2 | **yes, and this is the row the whole vantage rests on** — see the fetched statement below |
| the conclusion at `f = μ` | the centre column is Möbius-orthogonal | yes, and this is *strictly stronger* than Prize 2 |
| the conclusion at `f = χ` a Dirichlet character | mean zero of `a` along every residue class | yes, also strictly stronger |
| **SEAM 1** | the hypothesis at one pair is itself a mean-zero statement, about `n ↦ a(pn)a(qn)` | the criterion trades **one** Prize-2-shaped statement for **infinitely many**, each of the same difficulty class. It is a reduction only if two-row correlations are easier than one-row counts, and nothing here says they are |
| **SEAM 2** | in every verified application in print the hypothesis falls to an explicit algebraic identity relating `a(pn)` to `a(qn)` — a geometric series for `e(nα)`, a digit identity for automatic sequences, Ratner for nilflows | rule 30 supplies no identity relating the picture at row `pn` to the picture at row `qn` other than "apply the rule `(q−p)n` more times", which is not an identity but a restatement |
| **SEAM 3** | the criterion's conclusion contains far more than Prize 2 | the route asks you to prove Möbius orthogonality and mean zero along every AP in order to get one density. That is not fatal, but it is the price |

**What it leans on.** Fetched from
<https://ar5iv.labs.arxiv.org/html/1705.07322> (Bergelson–Kułaga-Przymus–Lemańczyk–
Richter, *A generalization of Kátai's orthogonality criterion with applications*),
which states it as **Theorem 1.2**:

> "Let a:ℕ→ℂ be a bounded sequence satisfying ∑_{n≤x}a(pn)a(qn)‾=o(x), for all
> distinct primes p and q. Then for every multiplicative function f:ℕ→ℂ that is
> bounded in modulus by 1, one has ∑_{n≤x}f(n)a(n)=o(x)."

**The constant function is admitted, and this was the first thing checked.** `f ≡
1` satisfies `f(1) = 1` and `f(mn) = f(m)f(n)`, so it is a multiplicative function
in the standard sense, and `|f| = 1 ≤ 1`. The conclusion at that `f` reads
`Σ_{n≤x} a(n) = o(x)`, which is Prize 2 verbatim. The quantifier in the printed
statement is "for every multiplicative function f … bounded in modulus by 1",
with no exclusion, so the reading holds.

Corroborating, from <https://terrytao.wordpress.com/2011/11/21/the-bourgain-sarnak-ziegler-orthogonality-criterion/>,
Proposition 1, which states the criterion for `μ` and records the attribution:

> "a special case of their orthogonality criterion (which actually dates back to
> an" earlier paper of Kátai, as was pointed out by Nikos Frantzikinakis.

and notes that BSZ "establishes a more quantitative version where μ can be
replaced by an arbitrary bounded multiplicative function."

The primary source is **UNVERIFIED**: I. Kátai, *A remark on a theorem of H.
Daboussi*, Acta Mathematica Hungarica **47** (1986), 223–225, DOI
10.1007/BF01949145. I fetched <https://link.springer.com/article/10.1007/BF01949145>
and it returned a 303 to an authentication endpoint, so I have never seen the
page; the volume, year and pages above come from a **search result title**, which
is not a quote. Searched: `Kátai 1986 "A remark on a theorem of H. Daboussi" Acta
Mathematica Hungarica orthogonality criterion`. Two independent secondary sources
(the two fetched above) attribute the criterion to Kátai, which is what a captain
can actually rely on.

**The test.** `explorer/rosetta_katai.mjs` and `explorer/rosetta_decay.mjs`, on
the centre column to `10^7` terms. This is a **fingerprint**, computed here, not a
citation.

The instrument was validated in three directions before any number was believed,
because a one-sided check on a correlation statistic is worth nothing:
constant sequences (rules 90 and 150 centre columns) return `D = 1.000000`
exactly; a purely periodic word returns the exact rational its period predicts,
computed independently from the period alone (`−0.125003` against `−0.125000`,
`0.125015` against `0.125000`, `−0.124998` against `−0.125000`); fair coins from
`node:crypto` return `|D| ~ N^{-1/2}` with the right scatter. And a sequence built
to have mean `½` returns `D ≈ 0.25 = mean²` at every pair, confirming the
implication runs the way I read it.

Over all 55 pairs of distinct primes from `{2,…,31}`, with `N = ⌊10^7/q⌋` so every
index read exists:

| sequence | max \|z\| | mean \|z\| | pairs with \|z\|>2 |
|---|---|---|---|
| **rule 30 centre column** | **2.68** | **0.75** | **2 of 55** |
| coin 1 | 2.64 | 0.75 | 1 |
| coin 2 | 2.65 | 0.83 | 4 |
| coin 3 | 2.04 | 0.66 | 1 |

`z = D√N`. The centre column sits inside the coin scatter at every pair. The
worst is `(11,31)`, `D = −0.0047`.

**But a correlation at one `N` does not measure an asymptotic statement, and the
control that proves it is Thue–Morse.** At the same `N`, Thue–Morse — 2-automatic,
zero entropy, and the sequence in this neighbourhood whose Möbius orthogonality
is actually a theorem — returns `max|z| = 75.32`. So the honest quantity is the
decay, `RMS|D_N| ~ N^{-β}` pooled over the 55 pairs, fitted over `N` from `10^3`
to `3.2·10^5`:

| sequence | β | `RMS|D|·√N` at the two ends |
|---|---|---|
| **rule 30 centre column** | **0.5042** | 1.09 → 1.00 |
| fair coin 1 | 0.4807 | 0.93 → 1.02 |
| fair coin 2 | 0.5086 | 0.97 → 0.86 |
| Thue–Morse | 0.2594 | 2.75 → 11.83 |
| Rudin–Shapiro | 0.2956 | 2.31 → 7.81 |
| purely periodic (period 64) | 0.0004 | 4.91 → 87.81 |

The centre column decorrelates at the coin rate `N^{-1/2}`, flat across two and a
half decades, and **strictly faster than either zero-entropy sequence for which
this hypothesis is believed in print.** So the hypothesis is not merely true
numerically; it is true with an enormous margin, and nothing about its truth is
in doubt. What is in doubt is entirely whether any of it can be proved.

**What it would give.** All of Prize 2, and more. What would remain is the
hypothesis itself, at every pair — which is §3.3's business.

---

### 3.2 What a cone argument would have to look like, and why the cone gives the hypothesis for free in a form that is empty

**The claim.** The light cone does supply the hypothesis — under the uniform
measure on the window — and it supplies it in one line from a theorem this board
has already proved; and that free version cannot imply the real one, because rule
90 and rule 150 satisfy the free version and violate the real one maximally. So
any cone argument for the hypothesis must be a *quenched* argument, and the cone
alone is a *annealed* instrument.

The brief asked for this plainly, so plainly: **write `c(qn)` as a function of the
window of row `pn`.** With `p < q` and `s = (q−p)n`, row `qn` is row `pn` pushed
`s` steps, so

  `c(qn) = Φ_s(row_{pn} restricted to [−s, s])`,

and `c(pn)` is *one coordinate of that same window* — the centre one. So the
hypothesis at `(p,q)` is exactly: **the `s`-step map's output decorrelates from
the centre coordinate of its own input, averaged along the orbit, with `s` growing
linearly in `n`.** In the vocabulary of analysis of Boolean functions that is the
degree-one Fourier–Walsh coefficient of `Φ_s` at the centre coordinate.

**The dictionary.**

| This project | Analysis of Boolean functions | Seam |
|---|---|---|
| window of row `pn`, positions `[−s,s]` | the input `w ∈ {±1}^{2s+1}` | none |
| `c(pn)` | the coordinate `w₀` | none |
| `c(qn)` | `Φ_s(w)`, the output bit | none |
| `Σ_n a(pn)a(qn)/N` | `E[w₀ · Φ_s(w)]`, the degree-1 coefficient at `0` | **the expectation is over `n`, i.e. over one orbit — there is no measure on windows** |
| `window_count_half` (closed on the board) | `E[Φ_s] = 0` under the **uniform** measure | this is the degree-0 coefficient, and it is proved |
| `rule30_leftPermutive`, `evolveFrom_leftPermutive` (closed) | `Φ_s(w) = w_{−s} ⊕ h(rest)` | under the uniform measure `w_{−s}` is independent of the rest, so **`Φ_s` is a uniform bit independent of the entire rest of the window** |
| **the annealed hypothesis** | `E[w_j Φ_s] = 0` for every `j ≠ −s`, in particular `j = 0` | **free, one line, and empty** |

**What it leans on.** Two closed board nodes, `evolveFrom_leftPermutive` (radius
`t`) and `window_count_half`, plus the observation that a left-permutive map
written `w_{−s} ⊕ h(w_{rest})` is, under the uniform product measure, a fair coin
independent of `w_{rest}` — hence uncorrelated with *any* function of the rest, not
merely with a coordinate. This is a two-line consequence of a proved node and **I
did not elaborate it in Lean**; the exhaustive measurement below is what stands
behind it here.

**The test.** `explorer/rosetta_struct.mjs`, block `[B]`. Exhaustive over all
`2^{2s+1}` windows for `s = 1…10` (up to `2,097,152` inputs), for rules 30, 90 and
150. For **rule 30 at every `s`**: `E[Φ_s] = 0.000`, `E[Φ_s·w_centre] = 0.000`, and
`max_j |E[Φ_s·w_j]| = 0.000` over every `j` except the leftmost. The leftmost
coefficient is the only non-zero one (`−0.500, 0.250, −0.250, 0.156, −0.078, 0.075,
−0.069, 0.076, −0.050, 0.021` at `s = 1…10`).

**And crystal 66's filter fires, decisively.** Rules 90 and 150 are left-permutive
too, and return `0.000` in *every* column including the leftmost — so they satisfy
the annealed statement at least as strongly as rule 30. Rule 90's centre column is
identically white from `t = 1` and rule 150's is identically black, so both have
`D(p,q) = 1.000000` at every prime pair (measured: `explorer/rosetta_katai.mjs`
§3a), which is the most complete violation of the hypothesis possible. **A
statement satisfied by rule 90 cannot imply a statement rule 90 violates.** So the
annealed route is closed, not narrow.

**What it would give.** Nothing on its own — that is the point of putting it in
§3 rather than §4. Its value is as a fence: it says exactly which cone arguments
are refuted in advance, and it tells a theorist that the missing ingredient is a
measure on rows of the picture, which is the seam obstruction 20, crystal 40 and
four previous connectors have each hit from a different direction.

---

### 3.3 The criterion is quantitative, so finitely many prime pairs buy a constant-factor bound on Prize 2's excess — and Prize 2 has no other route with that shape

**The claim.** Every route to Prize 2 that this board has priced is all-or-nothing:
Talus's run route caps at `N(1 − 1/(c log N))` however sharp the run bound, the
sparse-cut route dies on its own hypothesis, and the determination route is vacuous
by crystal 40. Kátai/BSZ in its quantitative form is the **first** route in which a
partial result is worth a number: a proved saving `τ` at every prime pair below
`e^{1/τ}` yields `|E(N)| ≤ 2√(τ log(1/τ)) · N` — and the first rung of that ladder,
which needs 3.04 million pairs and nothing infinite about the prime range, gives
`|E(N)| ≤ 0.96 N`, the first constant-factor bound this project would hold.

**The dictionary.**

| This project | BSZ quantitative | Seam |
|---|---|---|
| `E(N) = 2·count(N) − N`, the excess | `Σ_{n≤N} a(n)φ(n)` with `a ≡ 1`, `φ(n) = (−1)^{c(n)}` | none — `a ≡ 1` is multiplicative and bounded by 1 |
| a proved saving on one two-row correlation | `|Σ_{m≤M} φ(pm)φ̄(qm)| ≤ τM` for `M` large | **"M large" may depend on `(p,q)`, so each pair is still an asymptotic statement, not a finite check** |
| how many correlations you need | all distinct primes `p,q ≤ e^{1/τ}` | finitely many, but the count explodes: `τ = 0.05` already needs `3.3·10^{14}` pairs |
| what you get | `|E(N)| ≤ 2√(τ log(1/τ)) · N` | the bound is only informative below 1, which starts between `τ = 0.2` and `τ = 0.1` |
| Prize 2 itself | `τ → 0` | needs the full hypothesis; the quantitative form never closes the prize by itself |

The ladder, computed in `explorer/rosetta_tau.mjs` (`log` read as natural; **the
source does not say which logarithm, so the constant column is approximate in a
way I cannot resolve** — see below):

| `τ` | primes up to | `π` | pairs | `|E(N)| ≤ c·N` |
|---|---|---|---|---|
| 0.300 | 28 | 9 | 36 | 1.2020 (vacuous) |
| 0.200 | 148 | 34 | 561 | 1.1347 (vacuous) |
| **0.100** | **22,026** | **2,466** | **3.04·10⁶** | **0.9597** |
| 0.050 | 4.85·10⁸ | 25,614,562 | 3.28·10¹⁴ | 0.7740 |
| 0.020 | 5.19·10²¹ | — | — | 0.5594 |
| 0.010 | 2.69·10⁴³ | — | — | 0.4292 |

Measured, the actual saving at `M ≈ 3·10^5` is `|D| ≈ 0.005`, so the hypothesis
holds at `τ = 0.1` with a factor of twenty in hand, and would hold at `τ = 0.001`
from `M ≈ 10^6` on. The obstacle is entirely that none of it is proved.

**What it leans on.** Fetched from <https://ar5iv.arxiv.org/html/1902.10179> (an
extension of the BSZ criterion), which restates the original as: given `τ > 0` and
arithmetical functions `a`, `φ` with `|a| ≤ 1` multiplicative and `|φ| ≤ 1`, if

> "for all primes p,q ≤ e^{1/τ}, p ≠ q, and M sufficiently large:
> |∑_{m≤M} φ(pm)φ(qm)̄| ≤ τM"

then for `N` large enough

> "|∑_{n≤N} a(n)φ(n)| ≤ 2√(τ log(1/τ)) N"

with `a` required multiplicative and bounded by 1 and `φ` only bounded by 1 — which
is the assignment used above. **Two honesty marks.** This is that paper's
*restatement* of BSZ, not BSZ's own text: I fetched
<https://arxiv.org/abs/1110.0992> and it gives only the abstract, "We formulate
and prove a finite version of Vinogradov's bilinear sum inequality. We use it
together with Ratner's joinings theorems to prove that the Mobius function is
disjoint from discrete horocycle flows on Γ\SL₂(ℝ)", with no statement of the
criterion; the PDF did not come back. And **the base of the logarithm in
`2√(τ log(1/τ))` is UNVERIFIED**; I read it as natural, which is what makes the
table above right or wrong by a factor near 1.2 in `c`. Searched:
`Bourgain Sarnak Ziegler "disjointness of Mobius from horocycle flows" Theorem 2
quantitative "log log" primes finitely many bound multiplicative`. A theorist
taking this topic should get the printed BSZ statement before designing against
the table.

**The test.** The dictionary row that carries it is "`a ≡ 1` is an admissible
multiplicative function", already checked in §3.1. The falsifiable rule-30 claim
is: **for every pair of distinct primes `p, q ≤ 22026`, `|Σ_{m≤M} (−1)^{c(pm)+c(qm)}|
≤ 0.1·M` for all large `M`.** Measured true with a factor of twenty of room at
every pair tried; a theorist should try to falsify the *uniformity in `(p,q)`*,
which is where I would expect it to break if it breaks — the criterion needs `M₀`
to exist for each pair, and nothing here bounds `M₀(p,q)`.

**What it would give.** The first bound on the excess of the form `|E(N)| ≤ cN`
with `c < 1` a constant, from a finite (if enormous) list of two-row statements.
What would remain is the whole of Prize 2, since `c` is bounded away from zero for
any fixed `τ`.

---

### 3.4 The board's one proved arithmetic in the time index is exactly invariant under odd dilation, so it is the wrong instrument in both directions

**The claim.** The brief's stated reason for hope — "the only arithmetic structure
proved here in the time index is 2-adic, and an odd dilation preserves that
valuation exactly, so odd dilations should resample the same structure rather than
align with it" — has the conclusion backwards. Preserving the valuation exactly is
precisely **alignment**: the board's proved arithmetic takes *identically the same
value* at `n` and at `pn` for every odd `p`. It therefore cannot decorrelate
anything, and it cannot obstruct anything either; it is the one structure
guaranteed to be invisible to this statistic.

**The dictionary.**

| This project | The criterion | Seam |
|---|---|---|
| `edge_gap_eq`: the distance from row `t`'s right edge to the nearest black cell is `min{d : P_d ∤ t}` with `P_d` the right diagonals' minimal periods | a function `g(t)` of the time index | the `P_d` are all powers of two, so `g(t)` is a function of `ord₂(t)` **alone** |
| `g(pn)` for odd `p` | the dilation of that function | `ord₂(pn) = ord₂(n)`, so `g(pn) = g(n)` **identically** |
| `g(2n)` | dilation by the one even prime | `ord₂` shifts by one, so `g(2n) ≠ g(n)` **always** |
| what this buys the hypothesis | a source of decorrelation between `a(pn)` and `a(qn)` | **none**: for odd `p,q` the structure is not merely correlated but equal, and for the pair `(2,q)` the measured correlation of the centre column is the same coin as everywhere else |
| **SEAM** | `g` lives at the **right edge**, `c` lives at the **centre** | the two are nearly decoupled — measured — so even the alignment does not propagate to the column |

**What it leans on.** The board's own `edge_gap_eq` and crystal 12 — a
**fingerprint of this project**, not a citation, and the underlying observation
(the rightmost run of row `t` as a function of `ord₂(t+1)`) is Rowland 2006 §1, §3,
held in `sources/rowland-2006-local-nested-structure.txt`.

**The test.** `explorer/rosetta_struct.mjs`, block `[A]`, over `t = 1…11999`
from the repo's BigInt engine:

- `g(t)` is a function of `ord₂(t)`: **0 exceptions.**
  `g(1..24) = 1 3 1 4 1 3 1 6 1 3 1 4 1 3 1 7 1 3 1 4 1 3 1 6`, and the table by
  valuation is `1, 3, 4, 6, 7, 9, 15, 16, 24, 25, 27, 29, 34, 36`. **Minus one,
  that is `0 2 3 5 6 8 14 15 23 24 26` — crystal 12's published list, word for
  word, from an engine that did not produce it**, extended by `28, 33, 35`.
- `g(pn) = g(n)`: `3999/4000` at `p = 3`, `2399/2400` at `p = 5`, `1714/1714` at
  `p = 7`, `1333/1333` at `p = 9`, `799/800` at `p = 15`.
- `g(2n) = g(n)`: **`0/6000`**. `g(4n)`: `0/3000`. `g(6n)`: `0/2000`.
- the right edge and the centre are decoupled: `E[a(n)g(n)] = −0.029` against
  `E[g(n)] = 2.762`.

The single misses at `p = 3, 5, 15` and the "1 clash" the first run printed are
**one** index, `t = 12000`, and it is an artifact of my own loop rather than a fact
about rule 30: the generator yields rows `0 … T−1`, so `g[12000]` was never
written and stayed at its initialised `0`. Named in `explorer/rosetta_conclusion.mjs`
block `[E]`, which prints the offending index rather than the count. Over
`t = 1…11999` the statement is exact with no exceptions.

**What it would give.** Nothing positive; it removes a reason for hope and
replaces it with a sharper statement of where the hope cannot come from. That is
worth a captain's time precisely because the reason it removes is the one the
brief was written around.

---

### 3.5 Every verified instance of this hypothesis in print rests on an explicit algebraic dilation identity, and the entropy reading of that fact is wrong

**The claim.** The right way to say what separates rule 30 from every sequence for
which Kátai's hypothesis has been verified is *not* entropy — a maximal-entropy
counterexample is in print — but the presence of an explicit algebraic identity
relating `a(pn)` to `a(qn)`. Rule 30 has none, and the measurement says its
correlations decay *faster* than the verified cases, which means the difficulty is
not that rule 30 is worse behaved but that it is behaved for no stateable reason.

**The dictionary.**

| Verified case | The identity that does the work | Rule 30's analogue |
|---|---|---|
| `a(n) = e(nα)`, `α ∉ ℚ` (Daboussi) | `a(pn)ā(qn) = e(n(p−q)α)`, a geometric series | none |
| automatic sequences (Müllner) | digit-level recursions relating `a(pn)` to `a(n)` | `c` is measured **not** 2-automatic (crystal 73, the 2026-09-12 Walnut closure) |
| Thue–Morse, Rudin–Shapiro (Mauduit–Rivat) | carry propagation in base 2 | `c(2n)` has no known relation to `c(n)`; measured `z = 0.09` |
| `b`-multiplicative along squares (Drmota–Mauduit–Rivat–Spiegelhofer) | `b`-multiplicativity | none |
| nilsequences / horocycle flows (BSZ) | Ratner's joinings theorems | rule 30's centre column has no known algebraic model |
| **SEAM** | every one of these is an *identity*, checkable in finitely many symbols | the only relation between rows `pn` and `qn` is "iterate the rule `(q−p)n` more times", which restates the problem |

**What it leans on.** Fetched:

- <https://arxiv.org/abs/1602.03042>, Clemens Müllner, *Automatic sequences
  fulfill the Sarnak conjecture*: "This method allows us to prove a
  Möbius-randomness-principle for automatic sequences from which we deduce the
  Sarnak conjecture for this class of sequences."
- <https://arxiv.org/abs/2001.07898>, Drmota, Mauduit, Rivat, Spiegelhofer,
  *Möbius orthogonality of sequences with maximal entropy*: "We prove that
  strongly $b$-multiplicative functions of modulus $1$ along squares are
  asymptotically orthogonal to the Möbius function. This provides examples of
  sequences having maximal entropy and satisfying this property."

That second one is why the entropy reading is wrong, and I nearly wrote it: the
tempting sentence is "Sarnak's conjecture is about zero-entropy systems and rule
30's centre column has near-maximal complexity, so the literature cannot reach
it." The first half is true and worth keeping — **Sarnak's conjecture, even if
proved in full, says nothing whatever about rule 30's centre column**, because its
hypothesis is topological determinism and the column's factor complexity is
measured near-maximal. The second half is false: maximal entropy is compatible
with Möbius orthogonality, with a proof in print.

**The test.** `explorer/rosetta_struct.mjs` block `[C]`, and
`explorer/rosetta_conclusion.mjs` block `[1]`, both **fingerprints**:

- Distinct factors of the centre column in `10^7` terms: the full `2^n` for every
  `n ≤ 19`; `1,048,480` of `1,048,576` at `n = 20`; `7,529,936` of `16,777,216` at
  `n = 24`, so `(1/24)log₂ p(24) = 0.9518`. (An upper bound on the entropy of the
  orbit closure; finite data cannot prove positive entropy, so "the column is not
  deterministic" is measured, not proved.) This sits beside the Gowers sighting's
  499,949 factors of length 32 in `10^6` — a claim inherited from that document
  and **not re-run here**, since my lengths stop at 24.
- The criterion's **full conclusion**, measured, so that the route is not chasing
  something false: `Σ_{n≤10^7} μ(n)a(n) = 997`, i.e. `0.32√N`, against three
  crypto coins at `1.21, −1.00, −1.02` on the identical twist. The sieve was
  checked against `μ(1..12) = 1 −1 −1 0 −1 1 −1 0 0 1 −1 0`. Mean of `a` along
  residues mod 3, 4, 5 and 8: every `z` inside `±1.8`.

**What it would give.** It prices the search: a theorist should not go looking in
the Möbius-orthogonality literature for a theorem whose hypothesis rule 30
satisfies, because the hypothesis in every case is an identity and rule 30's
supply of identities in the time index is exactly the 2-adic right-edge one that
§3.4 shows is useless here.

---

## 4. Died in translation

- **"The pretentious framework says what the alternative to mean zero looks
  like."** The brief's own surrounding theory, and it does not reach. Halász and
  Granville–Soundararajan describe multiplicative `f` with non-zero mean; `a` is
  not multiplicative, and dies at index 1 — `a(1) = (−1)^{c(1)} = −1` because row 1
  is `111`, while every multiplicative function has `f(1) = 1`. There is no
  structure theorem in that literature for a general bounded sequence with
  non-zero mean, so the framework contributes vocabulary and nothing else. Died in
  the first twenty minutes, on one index.
- **"Positive entropy is what puts rule 30 outside the Möbius literature."** The
  sentence I came for, and Drmota–Mauduit–Rivat–Spiegelhofer refutes it in one
  abstract: maximal-entropy sequences that *are* Möbius orthogonal are in print.
  What survives is the weaker and different claim that Sarnak's conjecture's
  *hypothesis* (zero entropy) does not hold of the centre column, so that
  conjecture is not a route here even if proved.
- **"Odd dilations resample the board's 2-adic structure."** The brief's stated
  reason the hypothesis has a chance. Inverted by measurement: the structure is a
  function of `ord₂` alone, so an odd dilation leaves it *identically equal*
  (`1714/1714`, `1333/1333`), which is maximal alignment, not resampling. §3.4.
- **"The pairs containing 2 will behave differently from odd pairs."** The
  testable form of the same hope. Dies flat: mean `|z|` is `0.73` over the ten
  pairs containing 2 and `0.76` over the forty-five odd pairs, max `1.93` against
  `2.68`. No 2-adic signature of any kind in the centre column's dilations.
- **"A large `|z|` at one `N` means the hypothesis fails."** Dies on Thue–Morse,
  which returns `|z| = 75` at `N = 3·10^5` and is believed to satisfy the
  hypothesis. The statistic at a single `N` measures a **rate**, not a
  hypothesis, and I would have reported the rule-30 table as evidence of something
  had I not run a zero-entropy control at the same `N`. This is the control that
  priced the whole session.
- **"The left diagonals are a clean positive control."** The brief names them, and
  they work only with a caveat that matters. Every left diagonal fails at *some*
  pair — `D = 1.000` for at least one pair at every `k` tried — but **not at every
  pair**: diagonal 8 returns `D(3,5) = 0.000` and `D(13,·) = −0.000` exactly. A
  structured sequence can pass at a given pair, so a control run at one pair is no
  control at all. (Diagonals 4, 12, 28 have dyadic densities `1.0000, 0.7500,
  0.0000`; diagonal 28 coming out identically white independently reproduces a
  member of obstruction 4's white list, and diagonals 4 and 12 coming out
  eventually black reproduces the attack note "died at `k = 0, 4`, both eventually
  black" — two asymmetric confirmations that the diagonal engine reads the
  diagonals it claims to; the list itself is
  obstruction 4's white list `2, 7, 28, 399, …`.)
- **The `g(t)` "1 clash"** over `t ≤ 12000`, which the first run printed as a fact
  about rule 30. It is `t = 12000` itself, never written by my own loop, which
  yields rows `0…T−1`. Zero exceptions over `1…11999`. Recorded because the count
  looked like a real anomaly and the identity of the offending index is what
  settled it in ten seconds.
- **"The criterion might need only a few small primes."** The quantitative form
  says otherwise and says it exactly: the bound is vacuous (`c > 1`) for every `τ`
  above about `0.117` (`c = 1.009` at `τ = 0.12`, `0.985` at `τ = 0.11`), so the
  smallest rung with content needs primes to `22,026`.
  A theorist hoping to do `(2,3)` and `(3,5)` and get a number gets nothing.
- **The logarithmically averaged version.** Weakening the hypothesis to
  logarithmic averages weakens the conclusion to logarithmic density, and Prize 2
  is a natural-density statement. Not dead as mathematics, dead as a route to the
  prize as stated. Not pursued further; **UNVERIFIED** that the log-averaged
  criterion holds in the exact form I want — searched only as part of the BSZ
  searches above.
- **Furstenberg `×2 ×3` rigidity as a source of decorrelation between dilations.**
  Dies on the same seam as the four previous connectors' fields: it is a theorem
  about measures invariant under both maps, and the time index of one orbit carries
  no measure. Died on paper, not measured.
- **My own next vantage, killed inside the session rather than handed on.** The
  section 6 I first wrote sent the next connector at Mahler's method and
  `k`-regular sequences, on the argument that every verified Kátai hypothesis rests
  on an algebraic dilation identity (§3.5) and that the board had excluded only
  2-*automaticity*, not the strictly weaker 2-*regularity*. The argument is sound
  and the answer is no. `explorer/rosetta_kernel.mjs` computes the `F₂`-rank of the
  span of the 2-kernel `{n ↦ c(2^i n + r)}` truncated to `T` terms:

  | sequence | `L≤2` (7 elems) | `L≤4` (31) | `L≤6` (127) | `L≤8` (511) | `L≤10` (2047) |
  |---|---|---|---|---|---|
  | centre column, `T=4096` | 7 | 31 | 127 | 511 | **2047** |
  | fair coin, `T=4096` | 7 | 31 | 127 | 511 | 2047 |
  | Thue–Morse, `T=4096` | **2** | **2** | **2** | **2** | **2** |

  The kernel elements are linearly independent, every one of them, exactly as a
  coin's are, where a 2-regular sequence saturates at its module rank — Thue–Morse
  at 2, immediately. **So the centre column is not 2-regular over `F₂`, and the
  whole Mahler/regular wing is closed before anyone opens it.** Two things make
  this worth more than the death. The truncation error runs the *helpful* way: a
  truncated rank of `r` is a lower bound on the true rank, so `2047` at level 10 is
  a genuine lower bound and not an artefact — and the `T` sweep shows the
  instrument's own ceiling moving (`256 → 511 → 2047` as `T` goes `256 → 1024 →
  4096`), so the cap is the truncation and never the object. And **not 2-regular is
  strictly stronger than not 2-automatic**, since a `k`-automatic sequence over a
  finite alphabet is `k`-regular; so this subsumes and extends crystal 73's
  measurement. It is a measurement, not a proof, and it belongs to this project as
  a fingerprint.
- **Nothing died for lack of depth.** Every death above has a witness computed or
  a printed identity, the centre column was carried to `10^7` terms, and the
  kernel rank was carried to 2,047 elements with the truncation ceiling moved
  three times to show it was not binding.

---

## 5. What to hand the theorist

**Topic 1 — the quantitative trade, and the first rung of it.** *Claim to
falsify:* there are distinct primes `p, q ≤ 22026` and arbitrarily large `M` with
`|Σ_{m≤M} (−1)^{c(pm)+c(qm)}| > M/10`. *The dictionary row it depends on:* that
`a ≡ 1` is an admissible multiplicative function in BSZ's quantitative statement —
verified in the printed Kátai form (§3.1) and, for the quantitative form, resting
on a restatement rather than on BSZ's own text, which a theorist should fetch
first. *What settles it:* nothing finite settles it; what a theorist can do is
decide whether the *uniformity* the criterion needs — an `M₀(p,q)` for each pair,
with no bound required across pairs — is genuinely all it needs, because that is
the only place this looks weaker than it reads. *What it is worth:* if the claim is
unfalsifiable and provable, `|E(N)| ≤ 0.96N`, which is the first constant-factor
bound on Prize 2's excess this board would hold, and the route continues downward
through the `τ` ladder rather than stopping.

**Topic 2 — the annealed/quenched seam, as a fence to be made into a node.**
*Claim to falsify:* that the statement *"under the uniform measure on windows of
width `2s+1`, the centre cell after `s` steps is independent of every coordinate
but the leftmost"* is a two-line consequence of `evolveFrom_leftPermutive`, and
that rules 90 and 150 satisfy it identically. *The dictionary row it depends on:*
§3.2's row mapping `Σ_n a(pn)a(qn)/N` to the degree-1 Fourier coefficient, whose
seam is that the average is along one orbit. *What settles it:* a Lean statement of
the annealed form (size S or M, under `evolveFrom_leftPermutive` and
`window_count_half`, both closed), plus the observation that rule 90's centre
column violates the quenched form maximally. *What it is worth:* it is not a step
toward the prize; it is the sentence that refutes in advance every proposal of the
shape "bound the dilation correlation using the light cone", which is the shape a
seeder will reach for first if Topic 1 is dispatched.

Of the two, **Topic 1 is the one I would spend a session on.** Topic 2 is an hour
of fencing and should ride along with it.

---

## 6. Next vantage

**Not Mahler's method, and not `k`-regular sequences.** That was the section 6 I
wrote first, on the argument of §3.5 that every verified Kátai hypothesis rests on
an algebraic dilation identity and that the board had excluded only the
*automatic* case. It is closed: the centre column's 2-kernel is linearly
independent over `F₂` to 2,047 elements, exactly like a coin's, where a 2-regular
sequence saturates at its module rank — §4's last entry, computed this session so
that the next connector does not pay for it. Read that entry before going anywhere
near Christol, Mahler, or the 2026-09-09 and 2026-09-12 sightings of that wing.

**The field to attack from next is Mauduit–Sárközy's theory of pseudorandomness
measures of finite binary sequences** — the well-distribution measure `W`, the
correlation measures `C_k`, and the explicit constructions (Legendre symbol,
elliptic curves, additive characters) where `C_2` is *proved* small for one
concrete sequence. The reason is not that it looks promising; it is that it sits
in exactly the slot Kátai sits in — **one explicitly given sequence, no measure, no
hull, no invariant measure, no typical point** — and it is the only such literature
this board has not sighted. And it has a single sharp question, which is this
session's deliverable turned into a search:

> **Has anyone, for any explicitly defined sequence, ever bounded a *dilation*
> correlation `Σ_{m≤M} a(pm)a(qm)` rather than a *shift* correlation
> `Σ_{m≤M} a(m+d₁)a(m+d₂)`?**

Everything in the Mauduit–Sárközy programme, and everything this board has ever
measured on the centre column, is the additive kind. §3.3 needs exactly one of the
multiplicative kind, for one pair, and the whole `τ` ladder hangs off it. If the
answer is that nobody has ever bounded a dilation correlation for a sequence not
built from a multiplicative character, that is a decisive fence on §3.3 and the
right session is a paragraph saying so. If somebody has, the method is the most
valuable thing this project could be handed for Prize 2.

**The first hour should compute both correlations in the same units on the same
data**, so the gap is on one page: the centre column's additive `C_2` at the same
`M` as its dilation `D(p,q)`. My calibration for whoever does it: over 55 prime
pairs to `M ≈ 3.2·10^5` the dilation correlations pool to `RMS|D|·√M = 1.00`, decay
exponent `β = 0.5042` against a coin's `0.5000` and Thue–Morse's `0.2594`, and the
worst single pair is `(11,31)` at `|D| = 4.7·10^{-3}`. Any instrument that does not
reproduce those three numbers is measuring something else.

**The vantage I could not reach from here**, and would like someone else to: the
**Turán–Kubilius / Erdős–Kac** side of the criterion's own proof. The `log log N`
in Kátai's argument is the number of distinct prime factors of the row index, and
the proof works by trading `Σ_n a(n)` for `(1/log log N) Σ_p Σ_m a(pm)`. Nobody has
asked whether rule 30's picture can be made to see `ω(t)` at all — whether any
statistic of row `t` correlates with the number of prime factors of `t`. §3.4 shows
the one arithmetic the board owns in the time index is a function of `ord₂(t)`
alone, which is `ω` restricted to the prime 2 and blind to every other; if that is
provably all the picture can see, it is a fence on the entire multiplicative
programme rather than on one theorem inside it, and it is worth more than either
topic in §5.
