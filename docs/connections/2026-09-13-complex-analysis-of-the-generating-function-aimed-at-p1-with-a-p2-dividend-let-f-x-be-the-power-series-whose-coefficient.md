# Sighting: `centerColumn_other_isEventuallyPeriodic_of_center` from the complex-analytic vantage

**Vantage.** The generating function `F(x) = Σ_t c(t) x^t` read as a function of a
*complex* variable: Szegő's dichotomy and Pólya–Carlson, natural boundaries,
D-finite and differentially algebraic series, Tauberian theorems for the P2
dividend, and the two-variable space-time series `G(x,y)` whose sections are the
rows, the columns and the diagonals.

**Connector.** Ephemeris, 2026-09-13.

**Band, first.** **Project-internal.** This document closes a route and corrects a
reading the board carries; it says nothing new about rule 30. Its three classical
ingredients are **Known** and old (Szegő 1922, Pólya–Carlson 1921, Hardy–Littlewood
1914). Its measurements are **project-internal** and a fair coin reproduces every
one of them. Nothing here is novel, and the one thing I would have called novel
before grepping the board — that rule 30's Hadamard term is what "breaks Christol"
— is the brief's premise and it is **false**, refuted on this board on 2026-09-09.

**One-line summary.** The complex arm is an *exact translation* of the wall and
not a route to it. Szegő's 1922 theorem makes P1 literally "the unit circle is a
natural boundary of `F`", and because the coefficients lie in a two-element set the
entire analytic tower above rationality collapses onto it: **rational = algebraic
over `ℂ(x)` = D-finite = eventually periodic**, so every restatement available in
this field is P1 wearing a different word, and the first class where the collapse
fails is *differentially algebraic*, where non-membership is strictly stronger than
P1 and the techniques all require a functional equation nobody can supply. The
sharpest thing found is a separation the board should carry: **the same power
series can be algebraic over `F₂(x)` and have the unit circle as a natural boundary
over `ℂ`** — rule 90's column 1, `Σ_{j≥1} x^(2^j − 1)`, is a root of `xT² + T + x`
over `F₂` (0 failures over 100,000 coefficients) and is lacunary with ratio 2, so
the Hadamard gap theorem gives it a natural boundary — and its aperiodicity is
*kernel-proved on this board already* (`explorer/talus9_scratch_rule90.lean`,
re-run here). So the brief's own control — that rules 90 and 150 "must come out on
the algebraic side" — holds in the `F₂` arm for **every** column, and in the `ℂ` arm
fails at the first column where it can: the *centre* columns of both rules are
eventually periodic, so they are rational over `ℂ` as well and the control survives
there by luck, but **column 1** of each is aperiodic, hence transcendental over
`ℂ(x)` with a natural boundary, while staying algebraic over `F₂(x)`. That failure
is not a defect in the argument: it is the proof that the two arms are different
fields and that no theorem crosses between them. The P2 dividend is real
and is also an equivalence: Abel plus Hardy–Littlewood make P2 exactly
`lim_{x→1⁻} (1−x)F(x) = 1/2`.

Scripts written and run for this document, both under `explorer/`:
`ephemeris3_gf.mjs`, `ephemeris3_radial.mjs`.

---

## 1. The problem, seen from outside

Take the map on bi-infinite rows of bits sending `b` to `b'` with
`b'(i) = b(i−1) XOR (b(i) OR b(i+1))`, start from the row that is `1` at one place
and `0` everywhere else, and iterate. That draws a triangle of bits, one row per
step, growing one cell on each side. Write `c(t)` for the bit at the starting place
after `t` steps. It is explicit, computable, and has passed every statistical test
anyone has run: measured here over `2^20 = 1,048,576` steps, black density
`0.500656`. Nobody knows whether `c` is eventually periodic — whether there are
`p > 0` and `N` with `c(t+p) = c(t)` for all `t ≥ N`. The statement in front of me
is "if `c` repeats then some other vertical line of the triangle repeats", which,
given a proved theorem of Jen's that no two lines can both repeat, is logically the
same statement as "`c` never repeats".

**Restated in this vantage's own terms.** Form the complex power series
`F(x) = Σ_{t≥0} c(t) x^t`. Its coefficients lie in `{0,1}`, so its radius of
convergence is at least `1`, and it is exactly `1` because the column is not
eventually white (`centerColumn_not_eventually_constant` is closed on this board).
The question is then, verbatim: **is `F` a rational function, or is the unit circle
a natural boundary for it?** — those being the only two possibilities, by a theorem
of Szegő from 1922. The P2 question becomes a question about one boundary point:
does `(1−x)F(x)` tend to `1/2` as `x` rises to `1` along the reals? And the
two-variable object behind both is
`G(x,y) = Σ_{t≥0} Σ_{i=−t}^{t} a(t,i) x^i y^t`, the space-time diagram as a double
series: its `y`-sections are the rows, its `x`-sections are the columns, `F` is the
section at `x^0`, and each left diagonal is a section along a line of slope `−1` and
is a *rational* function, because those sections are eventually periodic.

---

## 2. Fields sighted

| Field or theory | The object there | The seam, in one line |
|---|---|---|
| Szegő's dichotomy (1922) | A power series whose coefficients take finitely many values | **P1 is this theorem's dichotomy verbatim** — so the translation is exact and therefore circular |
| Pólya–Carlson (1921) | Integer coefficients, radius `1`: rational or natural boundary | The same, with a height condition our coefficients satisfy trivially |
| Fatou / algebraic functions | `F` algebraic over `ℂ(x)` | An algebraic function has finitely many singularities, so over `ℂ` *algebraic collapses to rational* here |
| D-finite (holonomic) series | `F` satisfying a linear ODE with polynomial coefficients | Same collapse, and it is the load-bearing quote: D-finite + integer coefficients + radius ≥ 1 ⟹ rational |
| Differentially algebraic series | `F` satisfying *any* polynomial differential equation | **The first class where the collapse fails**, so `¬D-algebraic` is strictly stronger than P1 |
| Difference/differential Galois theory (Hölder, Adamczewski–Dreyfus–Hardouin) | Hypertranscendence criteria for solutions of difference equations | Every criterion takes an *equation of a fixed shape* as input; rule 30 supplies none of those shapes |
| Mahler functions | `Σ a_i(x) F(x^(2^i)) = 0` | No candidate equation; the board's doubling laws are translations of the picture, not self-maps of the column |
| Hadamard / Fabry gap theorems | Lacunary supports force a natural boundary | Dead on the centre column (density `1/2`); **alive on rule 90's column 1**, the one place in this project where it applies |
| Hadamard's multiplication theorem (1899) | Singularities of `F ⊙ G` lie in the products of singularities | An **upper** bound on the singular set, where a natural boundary needs a lower bound |
| Tauberian theory (Hardy–Littlewood, Karamata) | Radial behaviour of `Σ a_n x^n` at `x = 1` versus the density of `a` | With `a_n ≥ 0` the Abelian and Tauberian directions match, so **P2 is an equivalence, not a reduction** |
| Abel means at roots of unity | `lim (1−r)F(rζ_q^b)` | These are exactly the densities of `c` along arithmetic progressions mod `q` — measurable, and a coin's |
| Fourier analysis of one row | `b(t) = R_t(1)`, `c(t) = (1/2π)∫R_t(e^{iθ})dθ` | **The row count is a point evaluation and the centre cell is a mean over the circle** — which is why one is provable here and the other is not |
| Christol / Furstenberg–Deligne over `F₂` | The same coefficients read in characteristic 2 | A *different field in the technical sense*: `{0,1} ⊂ F₂` and `{0,1} ⊂ ℂ` agree on AND and disagree on XOR |
| Rational double series and their sections | `G(x,y)` with all sections in one variable rational | Rationality of `G` needs a **common** denominator; `leftDiagonal_period_unbounded` is proved here and is exactly the negation |
| Hankel determinants, Kronecker's rationality criterion | `F` rational iff the Hankel determinants vanish from some point on | An infinite family of conditions each satisfiable at every finite depth — the shape of *"Counting the right sides consistent with the centre column"* |
| Pólya–Carlson for dynamical zeta functions (algebraic dynamics) | Zeta functions of `ℤ^d`-actions proved to obey the dichotomy | The one criterion I fetched is conditioned on the coefficients' **heights**, which a `{0,1}` sequence makes vacuous |

---

## 3. Connections

### 3.1 Szegő's theorem *is* the residual, and the whole analytic tower above rationality collapses onto it, so no statement in this field is weaker than P1

**The claim.** In the complex arm there is no rung below P1 and no rung strictly
between P1 and the next prize: for a power series whose coefficients lie in a
two-element set, *rational*, *algebraic over `ℂ(x)`*, *D-finite* and *eventually
periodic coefficients* are one and the same condition, so each of "F is
transcendental", "F is not D-finite" and "the unit circle is a natural boundary of
F" is **logically equivalent to P1**. The first class in the standard hierarchy
where the collapse fails is *differentially algebraic*, and non-membership there is
strictly stronger than P1.

**The dictionary.**

| This project | Complex analysis | Checked |
|---|---|---|
| `centerColumn : ℕ → Bool` | The coefficients `c(t) ∈ {0,1}` of `F(x) = Σ c(t)x^t` | — |
| `centerColumn_not_eventually_constant` (closed) | `F` is not a polynomial, so its radius of convergence is **exactly 1** | board node supplies the hypothesis |
| `IsEventuallyPeriodic centerColumn` (P1's negation) | `F` is rational, with poles only at roots of unity | Szegő, quoted |
| **P1** | **the unit circle is a natural boundary of `F`** | Szegő, quoted: there is no third case |
| **P1** | `F` is transcendental over `ℂ(x)` | algebraic ⟹ D-finite (standard) + the D-finite quote |
| **P1** | `F` is not D-finite | quoted |
| The rung above, and the only one not equivalent | `F` is not **differentially algebraic** | strictly stronger: periodic ⟹ rational ⟹ D-algebraic |
| A witness that that rung is strict | `Σ_{n≥0} x^(n²)`: `{0,1}` coefficients, aperiodic, natural boundary, and D-algebraic | **UNVERIFIED** (see below) |
| A witness on the near side | `Σ_{j≥1} x^(2^j − 1)` = rule 90's column 1: `{0,1}`, aperiodic, natural boundary | aperiodicity **kernel-proved** on this board |
| "Continue `F` past the circle, or fail to" | Not finitely certifiable, in either direction | the seam, and it is the same one Parallax names for automaticity |
| Prize 3's reading over `ℂ` | *not* "`F` is not algebraic" — that is P1 | **corrects a line the board carries** (§3.2) |

**Seams.** (i) *The decisive one.* Equivalence is circularity. A theorem of the
form "series of type `X` are rational or have a natural boundary" gives P1 only if
somebody first shows `F` is of type `X`, and for `X` ∈ {algebraic, D-finite} that
is already P1's negation. So the dichotomy theorems price the vantage rather than
advance it. (ii) A natural boundary is a `Π⁰₂`-shaped statement about analytic
continuation and no computation gets near it; the radial data in §3.4 is the only
finite content this field has. (iii) The D-algebraic rung is real but the only
technology for proving non-membership is difference/differential Galois theory,
which takes an equation of a fixed shape as its input (§3.3). (iv) The witness
`Σ x^(n²)` is **UNVERIFIED**: it is D-algebraic because the Jacobi theta constant
`θ₃` satisfies Jacobi's third-order algebraic differential equation, and I could
not fetch a statement of that. I searched *"Jacobi theta function satisfies
algebraic differential equation differentially algebraic"* and *"Rubel
transcendentally transcendental survey theta function"*, and fetched
<https://mathworld.wolfram.com/JacobiThetaFunctions.html> and
<https://en.wikipedia.org/wiki/Theta_function>, neither of which contains the
statement. The rest of the row — `{0,1}` coefficients, aperiodic, natural boundary
by the gap theorem — is immediate. If the row is wrong, the collapse extends one
class further and the vantage is even emptier than I report.

**What it leans on.**

- **Szegő 1922**, fetched at <https://arxiv.org/html/2606.21477>: *"if f(z) = ∑ cₙzⁿ
  where {cₙ} takes only a finite set of values, then the analytic function defined
  on the disk by the power series either has a natural boundary on the entire unit
  disk or else is a rational function with poles only at all the kth roots of unity
  in which case the cₙ are eventually periodic of period k"*. The bibliography
  there gives it as G. Szegő, *Tschebyscheffsche Polynome und nichtfortsetzbare
  Potenzreihen*, Math. Ann. 87:90–111, 1922.
- **Pólya–Carlson and the D-finite collapse**, both fetched at
  <https://arxiv.org/html/2306.02590> (*D-finiteness, Rationality, and Height III*):
  *"if G(x) = ∑g(n)xⁿ is an integer power series in one variable then if h(g(n)) =
  o(log n)...then G(x) is either rational or admits the unit circle as a natural
  boundary"* — our coefficients have height `0`, so the hypothesis is free — and
  *"D-finite power series have only finitely many singularities. On the other
  hand...if G is D-finite with integer coefficients and has radius of convergence at
  least 1, then it is necessarily rational."*
- **Differentially algebraic**, definition fetched at
  <https://arxiv.org/html/2411.19316v1>: *"A function is differentiably algebraic if
  it satisfies a polynomial differential equation, and is differentially
  transcendental if is not differentiably algebraic."*
- That an algebraic power series is D-finite I use as standard and did not fetch.

**The test.** The board's own eleven values guard the engine
(`explorer/ephemeris3_gf.mjs` §A: centre column `11011100110`, matching
`Rule30/Basic.lean`, and a packed-BigInt engine agreeing to `t = 60`). The claim to
falsify, in the project's vocabulary, is the collapse itself:

> There is a function `f`, analytic on the open unit disc, not rational, whose
> Taylor coefficients at `0` all lie in `{0,1}`, and which continues analytically to
> some point of the unit circle.

Szegő says there is none. A theorist who wants to spend this vantage should check
that sentence first, because everything below it follows.

**What it would give.** Nothing towards P1, and saying so is the deliverable. What
it gives the board is a fence: any proposal whose conclusion is "`F` is
transcendental", "`F` is not holonomic", or "the unit circle is a natural boundary
of `F`" is a restatement of Prize 1 and is refuted in advance as an *approach*.

---

### 3.2 The `F₂` arm and the `ℂ` arm are different fields, and this board owns an explicit series on which they disagree

**The claim.** "The generating function of the column is algebraic" is two
different statements, and they sit on opposite sides of the wall. Over `F₂(x)`,
algebraic is *strictly weaker* than rational — it is 2-automaticity, by Christol —
so `¬algebraic` is strictly stronger than P1. Over `ℂ(x)`, algebraic *equals*
rational by §3.1, so `¬algebraic` **is** P1. The two readings are not two views of
one fact: there is an explicit series, already on this board with a Lean proof, that
is algebraic in one and has a natural boundary in the other. Consequently the
brief's control — *"the linear rules 90 and 150, whose double series are algebraic
over the field of two elements by Christol, must come out on the algebraic side"* —
is satisfied in the `F₂` arm for every column, and in the `ℂ` arm **must fail as
soon as it is read at a column that is not eventually periodic**. Read narrowly, at
the two rules' *centre* columns, it survives over `ℂ` — but only because those two
columns happen to be eventually periodic (`1000…` and `1111…`), which is an accident
of which column was chosen and not a property of the arm. Read at column 1 of either
rule it fails outright. Its failure is the finding rather than a bug.

**The dictionary.**

| The object | Over `F₂(x)` | Over `ℂ(x)` | Checked |
|---|---|---|---|
| Rule 90's column 1, `g = Σ_{j≥1} x^(2^j − 1)` | root of `x·T² + T + x`: **algebraic of degree 2** | transcendental, **unit circle a natural boundary** | `0` failures over 100,000 coefficients; gap theorem |
| its black times | `t = 2^j − 1`, `j ≥ 1` | the same | `1,3,7,15,31,63` measured; **kernel-proved** in `talus9_scratch_rule90.lean` |
| its aperiodicity | — | the hypothesis Szegő needs | `col1_not_eventually_periodic`; **I re-ran `lake env lean` on that file today**: it elaborates, axioms `[propext, Classical.choice, Quot.sound]` |
| Rule 150's column 1 | 2-automatic (2-kernel saturates at **4**), so algebraic by Christol | aperiodic ⟹ natural boundary, transcendental | kernel profile `1 3 4 4 4 4 4 4 4 4`; no period `p ≤ 20,000` from onset 2,000 over `10^5` terms |
| Rule 90's *centre* column | `[X⁰](X+X⁻¹)^t = C(t,t/2) mod 2`, black only at `t = 0` | rational: `F = 1` | `0` mismatches / 600, reproducing crystal 66 |
| Rule 150's *centre* column | `[X⁰](X+1+X⁻¹)^t mod 2`, identically black | rational: `F = 1/(1−x)` | `0` mismatches / 600 |
| The bridge between the arms | `{0,1} ⊂ F₂` | `{0,1} ⊂ ℂ` | a bijection of **sets**, not a ring map |
| where the bridge holds | `x·y` = AND in both | `x·y` = AND in both | so Hadamard products transfer |
| where it breaks | `1+1 = 0` | `1+1 = 2` | **XOR does not transfer**, and XOR is the rule |
| "C(x) is not algebraic and worse" (board, Parallax §3.5) | a statement strictly stronger than P1 | **is** P1 | the line must always name its field |
| The brief's control, read at the **centre** columns | satisfied | satisfied — but only because both are eventually periodic | `1000…` and `1111…`, so `F = 1` and `F = 1/(1−x)` |
| The brief's control, read at **column 1** | satisfied | **fails** | the row above this table: algebraic over `F₂`, natural boundary over `ℂ` |

**Seams.** (i) The separation is not subtle or conditional: one series, two
answers, both proved. What it forbids is importing a theorem from either arm into
the other, which is the move a reader of Parallax's document and this one, side by
side, will be most tempted to make. (ii) Rule 90's column 1 gets its natural
boundary twice over — from Szegő and from the gap theorem — and the gap theorem
route is the reason it is a *good* witness rather than a circular one: its boundary
does not go through aperiodicity at all. (iii) Nothing here says anything about
rule 30's own column. It says what the words mean.

**What it leans on.**

- **Hadamard's gap theorem**, fetched at
  <https://en.wikipedia.org/wiki/Hadamard_gap_theorem>: the condition
  *"the n_{k+1}/n_k ≥ λ > 1 for k ≥ 0, or equivalently lim inf_{k→∞} n_{k+1}/n_k >
  1"* and the conclusion *"the unit circle is a natural boundary for the series f"*.
  Here `n_k = 2^k − 1` and the ratio tends to `2`.
- **Szegő**, as in §3.1.
- **Christol's theorem** and **Furstenberg–Deligne** I did **not** re-fetch; they are
  Parallax's fetches of 2026-09-09, with URLs in
  `docs/connections/2026-09-09-algebraic-and-automatic-christol-s-theorem-*.md`
  (Wikipedia's automatic-sequence page and <https://arxiv.org/abs/1205.4090>). I use
  them only to say what that document says.
- The algebraic equation `x g² + g + x = 0` is my own two-line derivation from the
  classical `f² + f + x = 0` for `f = Σ_{j≥0} x^(2^j)`, and it is verified
  coefficientwise rather than taken on trust.

**The test.** `explorer/ephemeris3_gf.mjs` §C and §C2. Over `F₂`, squaring is the
coefficientwise map `g²(x) = g(x²)`, so `[x^n](x g² + g + x)` is
`g_{(n−1)/2}` (for odd `n`) `+ g_n + [n = 1]`; the script checks it for every
`n < 100,000` and reports **0 failures**. The columns are built by an independent
word-parallel engine and cross-checked against a naive per-cell run. For a theorist,
the claim to falsify:

> There is a power series with coefficients in `{0,1}` that is algebraic over
> `ℂ(x)` and whose coefficient sequence is not eventually periodic.

Measured false in the only sense a computation can: no such series exists by §3.1,
and the two candidates this board would reach for — rule 90's and rule 150's
column 1, both algebraic over `F₂(x)` — are aperiodic, so over `ℂ` they are on the
natural-boundary side.

**What it would give.** It touches no part of the residual. It gives a captain one
correction and one fence. The correction: the board's summary of the three prizes
in the algebraic vocabulary (`C(x)` rational / `C(x)` not algebraic) is stated over
`F₂` and is *false* read over `ℂ`, where the second clause is the first one's
negation. The fence: no argument may pass a hypothesis from one arm to the other,
and the witness that forbids it is already in the repository with a kernel proof.

---

### 3.3 Rule 30 supplies exactly one analytic identity — a Hadamard fixed-point equation over `ℤ` — and the one theorem that reads it bounds the singular set from the wrong side

**The claim.** Every Boolean operation on `{0,1}` is a polynomial with integer
coefficients, so rule 30 *is* an identity between complex power series, not merely
an identity mod 2: the space-time series satisfies a fixed-point equation in the
Hadamard (coefficientwise) algebra with integer coefficients, of degree three when
expanded. That equation is the entire analytic input the automaton gives.
Every theorem in print that concludes "natural boundary" from a functional equation
— Mahler, `q`-difference, iterative, linear difference — takes an equation from a
short list of shapes, and this one is on none of those lists; and the single
classical theorem that *does* read Hadamard products, Hadamard's multiplication
theorem, gives an **inclusion in the wrong direction**.

**The dictionary.**

| This project | The Hadamard algebra over `ℤ` | Checked |
|---|---|---|
| Row `t` of the picture | `R_t(x) = Σ_i a(t,i) x^i`, a Laurent polynomial | — |
| `rule30_eq`: `l XOR (c OR r)` | `c OR r = c + r − c·r`; `l XOR m = l + m − 2·l·m`, on `{0,1}` | integer identities |
| One step | `R_{t+1} = x·R_t + M_t − 2·(x·R_t) ⊙ M_t`, `M_t = R_t + x⁻¹R_t − R_t ⊙ (x⁻¹R_t)` | **0 disagreements over 192,300 cells**, coefficients never leave `{0,1}` |
| The whole picture | `G = 1 + y·[ x·G + M − 2·(x·G) ⊙ M ]`, `M = G + x⁻¹G − G ⊙ (x⁻¹G)`, `⊙` coefficientwise in both variables | the same computation, read bivariately |
| The same over `F₂` | `G = 1 + y·[(x + 1 + x⁻¹)G + G ⊙ (x⁻¹G)]` | `0` disagreements; this is Parallax's form |
| The linear rules over `F₂` | the `⊙` term vanishes: `G = 1/(1 + P(X)Y)`, rational | Parallax; reproduced here |
| The linear rules **over `ℂ`** | the `⊙` term does **not** vanish: `l XOR r = l + r − 2lr` | so the `ℂ` arm does not see them as linear at all — §3.2's separation again |
| `Σ` of Hadamard products | Hadamard's theorem: `sing(F ⊙ G) ⊆ { αβ }` | quoted below |
| What a natural boundary needs | `sing ⊇` a dense subset of the circle | **the seam: `⊆` never gives `⊇`** |
| Classes with a proved dichotomy | Mahler, `q`-difference, iterative `y(z) = a(z)y(b(z))`, linear difference | each indexed by *possession of an equation of that shape* |
| Rule 30's equation | Hadamard-nonlinear, two variables, degree 3 | **in none of those classes** |

**Seams.** (i) The direction of Hadamard's inclusion is fatal and not repairable by
sharpening: the theorem is an analytic-continuation statement, so it can only ever
*forbid* singularities, and the fixed point `S ⊆ S·S` is satisfied by the unit
circle and by `{1}` and by `∅` alike. To manufacture a boundary one needs
singularities to **appear**, and nothing in the Hadamard theory makes them appear.
(ii) The equation is a fixed point, not a finite relation: iterating it `t` times
expresses `R_t` by `t` nested Hadamard products, and the classes that are closed
under `⊙` (rational over `ℂ`, algebraic over `F_q`) are closed with a complexity
that multiplies, so closure at each step bounds nothing in the limit. This is the
same non-argument Parallax records for Christol, seen from the analytic side.
(iii) I claim only that this is the identity the *rule* gives; a cleverer analytic
relation involving `F` could exist and nothing here excludes it.

**What it leans on.**

- **Hadamard's multiplication theorem**, fetched at
  <https://arxiv.org/html/2009.14099> (*Monodromies of singularities of the Hadamard
  and eñe product*), Theorem 2.3: *"The singularities of the principal branch of
  F⊙G are of the form γ=αβ where α and β are singularities of F and G
  respectively."*
- **A dichotomy theorem of exactly the shape this vantage wants, and what it needs
  as input**, fetched at <https://arxiv.org/html/2411.19316v1>, Theorem 4: *"either
  there is some N∈ℕ*, such that y(z)^N is rational, or y is differentially
  transcendental over ℂ(z)"* — for solutions of iterative equations
  `y(z) = a(z)y(b(z))`.
- **Hypertranscendence from difference equations**, fetched at
  <https://arxiv.org/abs/1910.01874> (Adamczewski–Dreyfus–Hardouin): *"After Hölder
  proved his classical theorem about the Gamma function, there has been a whole
  bunch of results showing that solutions to linear difference equations tend to be
  hypertranscendental i.e. they cannot be solution to an algebraic differential
  equation)."*

**The test.** `explorer/ephemeris3_gf.mjs` §B evolves three copies of the picture
side by side to `t = 300` — Boolean, integer, and mod 2 — and compares every cell:
**192,300 cells, 0 integer disagreements, 0 `F₂` disagreements, 0 coefficients
outside `{0,1}`**. The falsifiable statement:

> For every `t` and every `i`, with `R_t(x) = Σ_i a(t,i)x^i`,
> `R_{t+1} = x·R_t + M_t − 2·(x·R_t) ⊙ M_t` where
> `M_t = R_t + x⁻¹R_t − R_t ⊙ (x⁻¹R_t)` and `⊙` is the coefficientwise product,
> as an identity of Laurent polynomials **with integer coefficients**.

**What it would give.** If some class containing this equation had a
Pólya–Carlson-type dichotomy, P1 would follow immediately, because §3.1 says the
rational branch is exactly P1's negation and the board's own
`centerColumn_not_eventually_constant` already blocks the degenerate case. That is
the only route in this vantage that is not circular, and it is blocked at its first
step: the equation is in no such class, and I found none whose hypothesis rule 30
can be shown to satisfy.

---

### 3.4 The P2 dividend: Prize 2 is exactly a radial limit, and the reason the row marginal is provable while the column is not is one line in this vocabulary

**The claim.** Abel's theorem and the Hardy–Littlewood Tauberian theorem for
non-negative coefficients make P2 *exactly* the statement
`lim_{x→1⁻} (1−x)F(x) = 1/2` — an equivalence, not a reduction, because the
coefficients are non-negative and so the Tauberian hypothesis is free. And the
same vocabulary explains, in one sentence, a pattern the board has recorded three
times without a reason: **the row count is a point evaluation of the row's series
and the centre cell is its mean over the circle**, so the automaton's local law —
which constrains adjacent cells, hence low-order Fourier data — bites on the first
and not on the second.

**The dictionary.**

| This project | Boundary behaviour of `F` | Checked |
|---|---|---|
| `b(t)`, the row's black count | `R_t(1)`, a **point evaluation** | the board bounds it: `2b(t+1)+3b(t) ≤ 6t+9` |
| `c(t)`, the centre cell | `(1/2π)∫R_t(e^{iθ})dθ`, the **zero Fourier mode** | the board bounds nothing about it |
| `rule30_run_boundary`, `b(t+1) = ρ(t)+2G₂(t)+2` | a relation among the row's low-lag autocorrelations | the local law reaches bounded lags only |
| **P2** (density `1/2`) | `lim_{x→1⁻}(1−x)F(x) = 1/2` | Abel `⟸`; Hardy–Littlewood `⟹`, quoted |
| measured `(1−x)F(x)` at `x = 1−10⁻⁵` | `0.500913`, truncation bound `2.8·10⁻⁵` | `ephemeris3_radial.mjs` §C, `2^20` terms |
| the coin control at the same `x` | `0.500253` | same |
| an eventually periodic control, density `3/7` | `0.428568` against `3/7 = 0.428571` | same — the instrument resolves a rational density to `10⁻⁵` |
| density of `c` on `t ≡ a (mod q)` | the radial limit `lim_r (1−r)F(rζ_q^b)`, Abel-transformed | checked at `ζ = −1` only to `10⁻³`: the Abel mean falls `−0.039 → −0.0070 → −0.00099` as `eps` falls `10⁻² → 10⁻⁴`, against the predicted limit `0.00006` — consistent, not precise |
| those densities, `q` up to 1024 | max deviation from `1/2` inside a **20-draw coin null** at every `q` | §D, §D2 |
| the one cell outside its null (`q = 3`) | a fluctuation, not a bias | §F: normalised deviation `1.36 → 1.33` from `2^16` to `2^20`, where a bias would have quadrupled |
| Prize 2 as a Lean node | not available: Mathlib has no Tauberian theorem | grep of the pinned Mathlib for `Tauberian`, `Abel.*summ`, `natural boundary` returns only `NumberTheory/AbelSummation.lean` and `NumberTheory/Chebyshev.lean` |

**Seams.** (i) The equivalence is exact, so it buys no weakening — and that is the
third time in this document that the complex arm has turned out to be a
translation. Its value is that it converts P2 into a statement about **one point**
of the boundary, which is the smallest object P2 has ever been reduced to here.
(ii) The Fourier reading is a *reading*, not a theorem: "point evaluation versus
mean" explains why the board's row identities cannot touch the column, but it does
not prove they cannot, and a cleverer identity could control all frequencies.
(iii) The measurements are a coin's at every point, including the progression
densities, so nothing here is evidence for or against P2; they are controls on the
dictionary rows.

**What it leans on.**

- **Hardy–Littlewood**, fetched at
  <https://en.wikipedia.org/wiki/Hardy%E2%80%93Littlewood_Tauberian_theorem>:
  *"Suppose a_n ≥ 0 for all n ∈ ℕ, and we have [Σ a_n x^n ~ 1/(1−x) as x ↑ 1]. Then
  as n → ∞ we have [Σ_{k=0}^n a_k ~ n]."* The bracketed parts are the page's
  displayed formulas, rendered by the fetch as displayed equations rather than
  inline text; the hypothesis `a_n ≥ 0` and the two asymptotics are quoted as they
  appeared.
- Abel's theorem in the other direction is standard and not fetched.

**The test.** `explorer/ephemeris3_radial.mjs`, `2^20 = 1,048,576` rows in 143 s on
a word-parallel cone engine, validated against `Basic.lean`'s eleven values and
against a naive per-cell run (`0` disagreements over 400 rows). Density
`0.500656`, excess `E(N) = 1376 = 1.34·√N`. The falsifiable statement a theorist
can attack:

> `centerColumnDensity → 1/2` **if and only if** `(1−x)·Σ_t centerColumn(t)·x^t →
> 1/2` as `x → 1⁻` along the reals.

and, as the sharper thing the same dictionary offers:

> For every `q` and every `a < q`, the density of `{ t ≡ a (mod q) : centerColumn t }`
> within its progression is `1/2` — equivalently, `(1−r)F(rζ)` tends to `0` at every
> root of unity `ζ ≠ 1`.

**What it would give.** The first statement is a vocabulary item with no Lean home
today. The second is strictly stronger than P2 and is the honest form of the P2
dividend: the complex arm does not give P2 a weaker target, it gives P2 a *family*
of targets indexed by the roots of unity, of which P2 is the one at `ζ = 1`.

---

### 3.5 The brief's two-variable hope is *"The diagonal structure never reaches the centre column"* in generating-function clothing, and the zero-section is provably free

**The claim.** The brief asks whether a family of rational sections with unbounded
periods forces anything about the section at zero. It does not, and the answer is
not merely "no theorem is known": the zero-section of such a family can be *any
sequence at all*, by a one-line construction, so no theorem can exist. This is
the obstruction *"The diagonal structure never reaches the centre column"*, whose
reason is that index `0` sits inside the transient of every diagonal — restated in this
vocabulary, and the generating-function version says slightly more: the only
classical route from rational sections to a rational double series needs a **common
denominator**, and `leftDiagonal_period_unbounded`, proved on this board, is exactly
the statement that there is none.

**The dictionary.**

| This project | Double series and their sections | Checked |
|---|---|---|
| `leftDiagonal k` as a sequence in `j` | a section of `G` along a line of slope `−1` | — |
| `leftDiagonal_periodicFrom_pow` | each such section is **rational**, denominator `1 − z^(2^d)` | periods `1,2,4,8` measured, all powers of two, `k < 44` |
| the measured onsets | numerator degree; onset `0` exactly for `k ∈ {0,…,17, 19}` | reproduces `sextant7_reread2.mjs`'s list independently |
| `centerColumn k = leftDiagonal k 0` | the **constant term** of the `k`-th section's rational function | `Basic.lean:88` at `j = 0` |
| `G` rational in two variables | would need the sections to share one denominator | classical, and not fetched |
| `leftDiagonal_period_unbounded` (**proved here**) | there is no common denominator | the board's own theorem is the negation of the hypothesis |
| "unbounded periods must constrain the section at 0" | **false**: given any target `c`, set `a(k,j) = c(k)` for `j = 0` and `a(k,j) = [j ≡ 1 mod 2^k]` otherwise | verified: zero-section equals the target, minimal periods `2,4,8,…,2048` |
| *"The diagonal structure never reaches the centre column"* | "index zero is in the transient of every diagonal" | the same fact, in the picture's vocabulary |

**Seams.** (i) The construction ignores the diagonal recurrence, so strictly it
refutes "rational sections with unbounded periods constrain the zero-section" and
not "rule 30's diagonals constrain it"; the latter is the obstruction named above,
already closed for a sharper reason. (ii) The period-detector in the script demands
64 periods and at least 200 cells of agreement before it reports a period — without
that guard it reported "period 1, onset 4197" for diagonal 40, which is the
end-of-window artefact the attack document *"The onset wall at exact criticality"*
records ("six equal cells accept `p = 1`, which manufactured 33 spurious
identically-white diagonals"). With the guard, diagonal 40 reads period 8, onset 15,
consistent with the doubling at `k = 29`. (iii) The free construction's periods stop
being measurable at `k = 12` in a 4096-cell window, which is the same artefact seen
from the other side; the values to `k = 11` are exact.

**What it leans on.** Nothing outside the project: the diagonal data is computed
here and the construction is explicit. That a bivariate rational function's sections
share a denominator is standard and **not fetched**.

**The test.** `explorer/ephemeris3_gf.mjs` §D. To falsify the construction: exhibit
a `k` for which the section `j ↦ [j ≡ 1 mod 2^k]` has minimal period other than
`2^k`, or a target the construction fails to hit.

**What it would give.** Nothing. It closes the brief's own two-variable question
with a construction rather than with a failed search, which is the cheaper kind of
"no".

---

## 4. Died in translation

- **"The Hadamard product of shifts is exactly the term that breaks Christol"** —
  the brief's own premise, and the sentence I most wanted to build on. It is
  **false**, and it was refuted on this board four days before I was handed it:
  algebraic power series over `F_q` are *closed* under Hadamard products, because
  the termwise product of two `k`-automatic sequences is `k`-automatic
  (Parallax, `docs/connections/2026-09-09-algebraic-and-automatic-*`, §4). So
  nonlinearity obstructs algebraicity nowhere, and the quadratic monomial is not
  where Christol breaks. What is true is the much weaker statement in §3.3: the
  Hadamard product preserves the class with a complexity that multiplies, so the
  class is closed and the *bound* is not. I grepped the board before starting and
  found this in the first ten minutes; had I not, it would have been my §3.1.
- **Fabry and Hadamard gap theorems.** Dead on the centre column, as the brief
  says: the support has density `1/2` and the gap condition needs
  `lim inf n_{k+1}/n_k > 1`. Recorded because of where it *does* apply — rule 90's
  column 1, whose support is `2^j − 1` — which is what makes that series a
  non-circular witness in §3.2.
- **Mahler functional equations.** No candidate equation exists. The board's
  power-of-two structure is not a Mahler structure: `step (2s) = 2·step s` relates
  the seed's orbit to the orbit of `2^a`, *a different orbit* (the obstruction
  *"Every re-reading of a centre-column cell is at bit-index speed 1 or 2"*), and
  `centerColumn_eq_evolve_mul_pow` relocates the column at bit-index speed 2, at the
  far edge of the cone. Parallax's §4 records the same death from the `F₂` side; I
  record it again only because "Mahler" is the first phrase a reader of §3.1 will
  reach for.
- **Carlson-type theorems on series algebraic over a function field** (the brief's
  fourth item). Vacuous or done: over `ℂ` "algebraic" collapses to "rational"
  (§3.1), so there is no such class to be in; over `F₂` it is Christol and Parallax
  has it.
- **The Dirichlet-series arm.** Already dead, by my own hand: `Σ c(n) n^(−s)` needs
  a closed form for the coefficients, recorded as §7 of
  `docs/connections/2026-09-12-the-theory-of-automatic-sequences-*`. The brief is
  right that the power-series arm does not need a closed form — and §3.1 is why that
  does not help: what the power-series arm gets instead of a closed form is an
  equivalence.
- **"Compute towards the natural boundary."** There is nothing to compute. Analytic
  continuation past a point of the circle is not a finitely certifiable property in
  either direction, exactly as automaticity is not; the radial data in §3.4 is the
  whole finite content, and it is a coin's.
- **Hankel determinants / Kronecker's rationality criterion** as a finite
  certificate. `F` is rational iff its Hankel determinants vanish from some index
  on. Every finite prefix of that condition is satisfiable — the counts in
  *"Counting the right sides consistent with the centre column"*, and Parallax's
  saturation table, say the realisable column words are eventually everything — so no finite
  computation bears on it. Not run.
- **"The diagonals' poles accumulate on the whole circle, so the column's series
  has a natural boundary."** The prettiest sentence I wrote today and it means
  nothing. The diagonals' generating functions have poles at `2^d`-th roots of
  unity with `d` growing, so their poles *are* dense in the circle — but the column
  is not built from them by any analytic operation: `centerColumn k` is the constant
  term of the `k`-th one, and §3.5's construction shows constant terms of such a
  family are arbitrary. Density of poles in a family says nothing about a sequence
  read across the family.
- **"The singularity set multiplies, so it fills the circle."** The mechanism
  version of the same hope, and the one I would have led with. Hadamard's theorem
  gives `sing(F ⊙ G) ⊆ {αβ}`; a natural boundary needs `⊇`. An inclusion that only
  ever removes singularities cannot manufacture one, and the "fixed point" `S ⊆ S·S`
  is satisfied by the empty set.
- **Proving `G(x,y)` transcendental over `F₂(x,y)`.** Tempting because §3.3 makes
  `G` the natural object, and it is orthogonal to P1 **in both directions**:
  `G` algebraic would give the column 2-automatic (Furstenberg–Deligne plus
  Christol, Parallax §3.2), which does not make it periodic; and `G` transcendental
  gives the column nothing at all, since a transcendental `G` is compatible with any
  column whatever. So neither answer to the bivariate question bears on the wall.
- **`P1 ⟺ Σ c(t) 2^(−t) is irrational.`** True, exact, and empty — the same
  collapse as §3.1 seen in base 2. The transcendence machinery that proves specific
  binary expansions irrational (Adamczewski–Bugeaud and the complexity criteria)
  needs automaticity or a subword-complexity bound, and my own session of
  2026-09-12 priced the complexity route: Morse–Hedlund's `p(n) ≥ n+1` is what P1
  needs and every technique in print delivers `p(n)/n → ∞`, which is strictly more.
- **"D-finite would be a weaker target than rational."** False here, and it was my
  working assumption for the first half hour: I expected a ladder
  `rational ⊊ algebraic ⊊ D-finite` in which the higher rungs were cheaper to
  refute. On `{0,1}` coefficients the three coincide, and the ladder only starts
  above D-finite.
- **My own bug, and it produced a board theorem as its output.** The word-parallel
  engine in `ephemeris3_radial.mjs` read bit index `n + t` where position `0` is
  index `n` at every row — so it read position `t`, the cone's **right edge**, which
  is black at every row by `evolve_right_edge`. The "centre column" came back
  identically `1` and the density came back `1.000000`. A wrong read whose output is
  a true theorem about a different object is the most dangerous kind this project
  has, and nothing but the eleven-value guard from `Basic.lean` caught it.
- **A `3.5σ` bias in the density along `t ≡ a (mod 3)`.** At `2^19` the maximum
  deviation at `q = 3` was `0.00423`, outside all 20 coin draws, and it was still
  outside at `2^20`. Resolved rather than reported: the normalised deviation
  `(d_a − 1/2)·√n_a` (a fair coin gives this quantity standard deviation `1/2`) reads
  `1.36, 1.16, 1.82, 1.77, 1.33` at `N = 2^16 … 2^20`, flat where a real bias would
  have grown four-fold across that range, against a coin's `max|z|` of median `0.62`
  and max `1.27` over 20 draws. **Fluctuation.** Recorded because a table cell
  outside its null, left in a document unresolved, is exactly how this board
  acquires a fact that is not one.
- Nothing died for lack of depth. Every death above has a construction, a
  counterexample, a fetched theorem, or a control that fired.

---

## 5. What to hand the theorist

**Topic 1 — the fence, and it is the one I would spend the session on, because it
is cheap and it forecloses a recurring proposal shape.** The claim to establish (it
is two classical theorems and one closed board node, so "establish" means "write
down, with the citations"):

> Let `F(x) = Σ_t centerColumn(t)·x^t`. Then the following are equivalent:
> `centerColumn` is eventually periodic; `F` is rational; `F` is algebraic over
> `ℂ(x)`; `F` is D-finite; the unit circle is **not** a natural boundary of `F`.

The dictionary row it depends on is Szegő's theorem, quoted verbatim in §3.1, plus
`centerColumn_not_eventually_constant` (closed), which is what makes the radius of
convergence exactly `1` and so supplies the hypothesis. What it would give: every
proposal whose conclusion is "`F` is transcendental", "`F` is not holonomic" or
"the unit circle is a natural boundary" is **Prize 1 restated**, and is refuted in
advance as an approach — the same fence the obstruction *"An eventually periodic
centre column does not force another periodic column"* draws for "column `j`"
variants, in a different vocabulary. It also carries the correction in §3.2, which
a captain should land in whatever form the board keeps: **the phrase "`C(x)` is
algebraic" must always name its field**, because over `F₂` it is strictly weaker
than rational and over `ℂ` it is equal to it, and this board owns a series —
rule 90's column 1, with a Lean proof already in `explorer/` — on which the two
answers differ.

**Topic 2 — the only non-circular route in the vantage, priced so it can be
refused.** The claim to falsify:

> There is a class `X` of power series such that (a) `F ∈ X` can be shown from the
> rule, and (b) every member of `X` is rational or has the unit circle as a natural
> boundary.

By §3.1, any such `X` settles P1. The dictionary row it depends on is §3.3's
integer Hadamard identity — the only analytic relation the automaton supplies,
verified over 192,300 cells. The measurement that settles the topic negatively is a
census rather than a depth: every `X` in print with such a dichotomy is defined by
possession of a functional equation of a fixed shape (Mahler; `q`-difference;
iterative `y(z) = a(z)y(b(z))`, whose theorem I quote in §3.3; linear difference),
and rule 30's equation is bivariate, degree 3, and Hadamard-nonlinear. **My advice
is not to spend a session on it**, and the reason is the seam this connector keeps
meeting in every field: the technology decides a property for the solutions of a
*given* equation, and rule 30 is one object whose equation is in no catalogue.

**What I would not spend a session on, stated so it is not re-proposed.** Anything
aimed at the natural boundary as though it were weaker than P1; anything aimed at
D-finiteness; the Dirichlet arm; gap theorems; and the bivariate algebraicity of
`G`, which §4 shows is orthogonal to the wall in both directions.

---

## 6. Next vantage

**The Hadamard algebra itself: the ring of power series under the coefficientwise
product, van der Poorten's Hadamard quotient theorem, Rumely's proof of it, and the
Skolem–Mahler–Lech circle.** Section 3.3 is the reason. Rule 30's picture is a
fixed point of an equation that is *polynomial in the Hadamard product* with integer
coefficients — degree 3, two variables, one line long — and that is a genuinely
unusual object: the fields this board has visited all treat the coefficientwise
product as an obstruction to be routed around, and there is one field that treats it
as the multiplication. It has real theorems — the Hadamard quotient theorem (if
`a(n)/b(n)` is an integer for all `n` and both are linear recurrences, the quotient
is one too) and Skolem–Mahler–Lech (the zero set of a linear recurrence is a finite
set together with finitely many arithmetic progressions), both stated here from
memory and **UNVERIFIED**: I fetched neither, and the next connector should quote
them before leaning on them — it is exactly about when
coefficientwise operations preserve the classes this document cares about, and
nobody here has looked. The connector who takes it should be handed §3.3's identity
as the object and warned about what killed this session: the theorems there are
*closure* theorems, and closure at each step is what §3.3 already shows is useless —
so the question to put is not "is the class closed" but **"is there any lower bound
on the complexity of a Hadamard fixed point"**, which is the shape of every theorem
this vantage needed and did not find.

**And the one I could not reach from where I stood: the arithmetic that joins the
two arms.** This document's central finding is that the archimedean reading of the
coefficient sequence and the characteristic-2 reading are different fields with a
witness separating them, and I have no idea how to put them in one room. The
literature that does exactly that is the integrality-and-modularity programme around
diagonals of rational functions — the `Ising n-fold integral` papers, Christol's
conjecture, `G`-functions and their `p`-curvatures — where one series is studied at
the archimedean place and at every finite place at once. **UNVERIFIED, and
deliberately so:** I know that literature only from titles that came back in my
searches — *"Ising n-fold integrals as diagonals of rational functions and
integrality of series expansions"*, <https://arxiv.org/pdf/1211.6645>, which I did
not fetch — so I name it as a bearing and not as a result, and the next connector
must establish that it says what I hope before spending a session on it.
Rule 30's column is algebraic-over-`F₂`-or-not
(Parallax's 130,553-state floor says nobody knows) and rational-over-`ℂ`-or-not (the
wall), and those are the same two questions at two places. Whether any theorem
relates them is the question I would most like answered and could not reach.
