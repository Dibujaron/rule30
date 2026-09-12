# Arithmetic dynamics and cycle exclusion, sighted at `centerColumn_other_isEventuallyPeriodic_of_center`

Parallax, fifth sighting, 2026-09-12. Vantage: Baker's theorem on linear forms
in logarithms; Steiner's theorem excluding 1-cycles of the `3x+1` map;
Simons–de Weger on `m`-cycles; and more generally the corner of arithmetic
dynamics whose theorems are about **one explicitly given orbit of one
explicitly given map**, concluding *this orbit is not periodic, and here is
why not*.

**The band, first, because the reporting rule says so: Nothing to
project-internal.** Nothing here survives as a fact about rule 30 that a
mathematician would not already grant; the two sharpest items (§3.2, §3.6)
are a `F_2` linear-algebra computation and a two-line corollary of a theorem
the board already has. What the session produces is a **fence with a
mechanism**: a statement of *which step* of a cycle-exclusion proof fails and
why, with the failure measured rather than asserted, and with the surprise
that the step everyone would expect to be the obstruction (§3.6, the
archimedean size) is not blocked but *already finished*, the prize surviving
it untouched. Beside that: one reframing of the wall in a vocabulary the
project has not used — *this explicitly given real number is irrational* —
which turns out to be forbidden to seed for exactly the reason the residual
gives; one topic for a theorist that is genuinely *sufficient* rather than
equivalent (§5); and one methodological catch about null models for linearity
tests that cost me an hour and would cost the next session the same (§4).

The vantage was taken on the strength of a guess I wrote in my own handoff
yesterday — *no technique of cycle exclusion survives the replacement of `+`
by XOR and `*` by OR* — and I said then that the guess was only worth a
document if the answer named what the nonlinearity costs. It does, and the
answer is one sentence: **the nonlinearity costs the ring.** Rule 30's row
map is polynomial over `F_2`, whose unit group has one element and therefore
no logarithms; the rings that have logarithms are ones in which XOR is not
even additive. Steps 1 and 3 of Steiner's argument cannot be had in the same
ring, and no repair addresses that, because it is not a missing hypothesis.

---

## 1. The problem, seen from outside

Fix the map `T` on the non-negative integers written in binary:
`T(r) = 4r ⊕ (2r ∨ r)`, where `⊕` is bitwise XOR and `∨` bitwise OR. Start at
`r₀ = 1` and iterate. The `t`-th iterate `rₜ` has exactly `2t+1` binary
digits — measured to `t = 3000` with no exception, and forced by the two
closed nodes `evolve_left_edge` and `evolve_right_edge`, which say both edges
of the picture are black. Now read **one digit per step, moving inward one
place each time**: let `c(t)` be digit `t` (counting from the least
significant, at position 0) of `rₜ`. So `c` reads the middle digit of a word
whose length grows by two at each step. The sequence begins
`110111001100010110010011`.

The question, entire: **is `c` eventually periodic?** That is, are there
`p > 0` and `N` with `c(t+p) = c(t)` for every `t ≥ N`? It is believed not.
It is unproved, there is no route in print, and every column of the same
picture other than this one is known — by a theorem already proved here,
Jen's — to be incompatible with this one repeating, which is why the wall as
the board states it (*if the middle column repeats then some other column
does*) is logically the same statement as *the middle column does not
repeat*.

Equivalently, and this is the restatement that matters for this vantage: let

  `α = Σ_{t≥0} c(t) · 2^(−t−1) = 0.110111001100010110010011…₂ = 0.862389783947384…`

(the decimal computed exactly from 200 binary digits in
`explorer/parallax12_alpha.mjs`, because the first draft of this sentence
carried a mental estimate, `0.8713`, that was wrong in the second place)

A real number's binary expansion is eventually periodic exactly when the
number is rational. So the problem is: **prove that one explicitly given real
number is irrational.** More precisely, "c has period `p` from index `N`" is
exactly "`α ∈ ℤ / (2^N (2^p − 1))`", so the problem is to show `α` avoids
every one of that countable family of rationals.

**In the vantage's own terms.** Arithmetic dynamics studies orbits of
explicitly given maps and asks whether a named point is *preperiodic* — falls
onto a cycle. The literature's flagship instance of a negative answer is the
`3x+1` (Collatz) shortcut map `f(n) = n/2` for `n` even and `(3n+1)/2` for
`n` odd, where "there is no cycle of such-and-such a shape" is a *theorem*,
for infinitely many shapes, proved by turning the return condition into an
exponential Diophantine equation and bounding its solutions. Transported to
this map, the question is *not* whether the orbit of `1` under `T` is
preperiodic — §3.1 shows that is free and trivial — but whether a moving
single-digit read of a provably non-preperiodic orbit is eventually periodic.
The distance between those two sentences is the whole of the prize, and
naming it is the first thing this vantage does.

---

## 2. Fields sighted

| Field / theory | The object there | The seam, in one line |
|---|---|---|
| **Cycle exclusion for `3x+1`** (Steiner 1977, Simons 2005, Simons–de Weger 2005, Hercher 2023) | A hypothetical cycle of a named map; excluded by an exponential Diophantine equation | The thing excluded — *the orbit returns* — is **free** for `T`, whose height grows by exactly 2 digits a step; and it is not the prize. §3.1 |
| **Baker's theorem on linear forms in logarithms** | Effective lower bound on `\|β₀ + Σ βᵢ log αᵢ\|` | Needs a *multiplier*: one fixed algebraic number per branch. Rule 30's multiplier is a point-dependent matrix, `2^n` distinct ones at width `n`. §3.2 |
| **Yu Kunrui's `p`-adic linear forms in logarithms** | The same bound in `ℚ_p`; `ℤ₂^×` is infinite and has a logarithm | Step 3 becomes available exactly where step 1 dies: XOR is not additive over `ℤ₂`. The two steps cannot be had in one ring. §3.2 |
| **Call–Silverman canonical heights** | `ĥ(P) = 0` iff `P` preperiodic — a certificate of non-preperiodicity for one named point | Needs `deg ≥ 2` so that `ĥ(f(P)) = d·ĥ(P)`. `T`'s height law is `h(T r) = h(r) + 2`: exact, additive, degree 1. The telescoping divides by `1`. §3.5 |
| **Skolem–Mahler–Lech, characteristic `p`** (Derksen 2007) | The zero set of a named linear recurrence sequence over `F_p` is described by a finite automaton — an *effective* answer about one sequence | Needs a linear recurrence. At a fixed digit position the orbit *is* one (trivially — it is a left diagonal, eventually periodic). The centre column reads a **moving** position and is not a coordinate of the sequence at all. §3.4 |
| **Skolem–Mahler–Lech, characteristic 0** (Lech 1953) | Zero sets are finite unions of arithmetic progressions | `rowNat` satisfies no `ℤ`-linear recurrence of order `≤ 16`, exact rank over `ℚ`. §3.4 |
| **Diophantine approximation / irrationality of explicit constants** | `\|α − p/q\| > q^(−κ)`: irrationality measures, Liouville exponents | The right restatement of P1 (§1), and the measurement returns a coin: the approximation exponent over denominators `2^N(2^p−1)` is `2.00` for the seed against `1.67, 4.00, 2.25` for three coins. §3.3 |
| **Exponential Diophantine equations / S-unit equations** (Evertse, Győry) | Finitely many solutions of `aX + bY = c` in `S`-units | The return condition is not an equation in units; it is `n` quadratic equations over `F_2` with no monomial structure. §3.2, §4 |
| **Matrix cocycles and Lyapunov exponents** (Oseledets, Furstenberg–Kesten) | Products of varying matrices along an orbit | This is what the multiplier *becomes*, and the theory needs an invariant measure — the exact wall four of my earlier sightings ended at. §3.2, and the joke is on me. |
| **Uniform boundedness of preperiodic points** (Morton–Silverman) | An a-priori **upper** bound on the period of a preperiodic point | The shape step 4 needs, in the direction the board cannot produce; every bound the board has on `p` is a **lower** bound. §3.1, §5 |
| **`T`-functions and 2-adic ergodic theory** (Klimov–Shamir, Anashin) | Triangular maps on `n`-bit words, single-cycle criteria | Already sighted here 2026-09-09 and not re-run; recorded so a reader knows this vantage is adjacent to it and does not duplicate it. |
| **Transcendence of automatic numbers** (Adamczewski–Bugeaud) | An automatic irrational is transcendental | Concludes transcendence *from* irrationality; it is downstream of P1, not a route to it. §4 |
| **Eliahou's congruence conditions on cycle length** | The period of a `3x+1` cycle lies in an explicit numerical semigroup, from the continued fraction of `ln 3 / ln 2` | The one place in the field where the arithmetic of a *single real number* does the work; there is no such number here, because there is no multiplier. §3.2 |
| **Powers of a rational / the fractional part of `(p/q)^n`** (Kopra 2022, this project's one genuine outside dictionary) | `θ_t = log₂(r_t) − 2t`, the orbit's archimedean size | Not a seam but an inversion: `θ` is *purely periodic to every precision*, so the size that is the open problem for powers of a rational is, here, closed. §3.6 |
| **Synchronizing automata / Černý bounds** | Transients of finite functional graphs | The honest home of the truncated statement (`leftDiagonal_onset_le` is a **tail** bound, not a cycle question) — and already sighted here 2026-09-09. §3.1 |

---

## 3. Connections

### 3.1 Cycle exclusion excludes something rule 30 gets for free, and the wall is a *reading*, not a return

**The claim.** Every theorem in the cycle-exclusion literature concludes "this
orbit does not return". For rule 30's row map that conclusion is a two-line
theorem — the orbit is strictly increasing — and the prize is not it; the
prize is about a one-digit-per-step diagonal read of an orbit that provably
never returns, and the entire literature is silent about digit reads. So the
vantage's literal transport is a category error, and the board's own
arithmetic node is about the *wrong half of the picture*.

**The dictionary.**

| Rule 30 / this project | Cycle exclusion for `3x+1` | Status of the row |
|---|---|---|
| The row of cells at time `t`, packed | The integer `n` at step `t` of the trajectory | clean |
| `rowStep r = 4r ⊕ (2r ∨ r)` | The shortcut map `f(n) = n/2` or `(3n+1)/2` | clean as *maps on ℕ*; §3.2 breaks it |
| The picture (all rows) | The forward trajectory | clean |
| "the orbit returns", `rowNat N = rowNat (N+p)` | "`n` is preperiodic": the thing the literature excludes | **FREE HERE.** `bitlen(rowNat t) = 2t+1` exactly (0 failures to `t = 3000`), strictly increasing (0 failures), hence injective, hence no cycle. The transported theorem is a triviality. |
| The centre column `c(t) = evolve t 0` | *nothing* | **SEAM, and it is the wall.** `c(t)` is digit `t` of `rₜ`: a read whose index moves one place per step. The `3x+1` literature contains no theorem about any digit of any trajectory. |
| Left diagonal `k`, i.e. digit `k` of `rₜ` for fixed `k` | A fixed binary digit of the trajectory | clean, and eventually periodic — measured: digit 3 has eventual period 2, digit 7 period 1, digit 12 period 4, over the last 2000 of 4000 rows |
| The power-of-two diagonal periods | — | no analogue; the `3x+1` trajectory's digits have no such structure |
| `leftDiagonal_onset_le_iff_stepMod_return`: the orbit of `1` under `T_n = T mod 2^n` returns at time `2k` with lag `2^k` | "the orbit returns" | **SEAM.** In a finite set *every* orbit returns; there is nothing to exclude. The wall is a bound on the **tail**, which is a synchronization question, not a cycle-exclusion one. |
| The seam between settled region and transient band | — | no analogue |
| The damage front | — | no analogue |
| The black-time law at the origin | — | no analogue |

**What it leans on.**
- Steiner / Simons / Simons–de Weger / Hercher, fetched from
  <https://en.wikipedia.org/wiki/Collatz_conjecture>: Steiner (1977)
  *"proved that there is no 1-cycle other than the trivial (1; 2)"*; Simons
  (2005) *"used Steiner's method to prove that there is no 2-cycle"*;
  Simons & de Weger (2005) *"extended this proof up to 68-cycles; there is no
  k-cycle up to k = 68"*; Hercher (2023) *"proved that there exists no
  k-cycle with k ≤ 91"*. The same page gives the shortcut map verbatim:
  *"f(n) = {n/2 if n ≡ 0 (mod 2), (3n+1)/2 if n ≡ 1 (mod 2)}"*, and
  Eliahou's period form *"p = 301994a + 17087915b + 85137581c"* derived from
  *"the simple continued fraction expansion of ln 3/ln 2."*
- The exponential Diophantine equation a cycle produces, fetched from
  <https://arxiv.org/html/2112.12962v11>: the cycle condition `Fq(mc) = mc`
  yields *"mc = ∑(i=1 to r) 3^(r-i) \* 2^(1(i)-1) / (2^s - 3^r)"*, with the
  denominator condition that *"2^s - 3^r"* must be positive and divide the
  numerator, and the impossibility argument *"1 - 3^r/2^s ≠ 0, as 3^r ≠
  2^s"*. **Caveat, and it is the kind this project insists on:** that paper is
  an unrefereed arXiv preprint at version 11 and the fetch reports it *"contains
  no references to Baker's theorem, Steiner's method, continued fractions, or
  linear forms in logarithms as proof techniques"*. I am using it for the
  *algebraic form of the return equation* only, which is elementary and which
  I re-derived by hand, and **not** for any claim about what is proved. The
  attribution of the method to transcendence theory rests on the Wikipedia
  fetch above and on the Simons–de Weger abstract summary, which is a search
  summary and therefore **UNVERIFIED**: I could not fetch the paper itself
  (eudml.org/doc/278746 and the Groningen/Eindhoven portals were not
  attempted after the arXiv PDF fetches returned undecodable binary; searched
  "Simons de Weger theoretical and computational bounds m-cycles 3x+1").
- Baker's theorem, fetched from
  <https://en.wikipedia.org/wiki/Baker%27s_theorem>: *"If λ₁, …, λₙ ∈ ℒ are
  linearly independent over the rational numbers, then for any algebraic
  numbers β₀, …, βₙ, not all zero, we have |β₀ + β₁λ₁ + ⋯ + βₙλₙ| > H⁻ᶜ"*,
  where `ℒ` is *"the set of logarithms to the base e of nonzero algebraic
  numbers"*.

**The test.** `explorer/parallax12_orbit.mjs`, run. (A1) `bitlen(rowNat t) =
2t+1` and `rowNat (t+1) > rowNat t`, 0 failures each over `t < 3000`. (A2)
the tail and period of the orbit of `1` under `stepMod n`, for 18 widths to
`n = 64`: tail `0,1,2,2,…,91`, period `1,1,1,2,…,8`. (A4) the engine
reproduces `centerColumn(0..23) = 110111001100010110010011`, which is
A051023, so the read is the board's own object.
**To falsify:** exhibit any theorem in the cycle-exclusion literature whose
conclusion is about a digit of a trajectory rather than about the trajectory's
values. I searched and found none; that search is the weak part of this
connection and a theorist should not take my negative as exhaustive.

**And the trap, checked before it was argued.** The brief warns (obstruction
17) that the `T`-map view has three times produced a regularity that was the
doubling staircase in disguise, and told me to measure the break before
arguing the fit. Measured first: the period of the orbit of `1` under
`stepMod n` is exactly `2^(#{doublings ≤ n−1})` with the doublings at
`3, 8, 29, 400` — **0 mismatches over `n = 1..64`**
(`parallax12_orbit.mjs` A3). So the truncated period carries nothing the
diagonal picture did not already have, and that is a fourth instance of
obstruction 17's pattern, found before any argument was built on it. A fifth
turns up in §3.4.

**What it would give.** Nothing towards the residual, and that is the finding:
it *removes* a route rather than opening one. Concretely it prices the board's
own `leftDiagonal_onset_le_iff_stepMod_return`: that node is an honest
translation of a **left-diagonal** wall, and CLAUDE.md's warning is exactly
right — read as an invitation to arithmetic dynamics it pulls a session toward
the tail of a finite map, which is the tractable downhill direction and not
the prize. What would remain after granting everything here is the whole
residual.

---

### 3.2 What the nonlinearity costs, measured: the multiplier becomes a matrix cocycle, and step 1 and step 3 cannot be had in one ring

**The claim.** Steiner's argument has four steps, and exactly one of them dies
— step 1, the existence of a single multiplier — but it dies in a way that
cannot be repaired by changing rings, because the ring in which rule 30's row
map is polynomial (`F_2`) has a one-element unit group and therefore no
logarithms, while the rings with logarithms (`ℤ`, `ℤ₂`, where Baker's and
Yu's theorems live) are ones in which XOR is not even additive. The
nonlinearity does not cost a hypothesis; it costs the *ring*.

**The four steps, and where each stands.**

| Step of Steiner's argument | What it needs | Rule 30 |
|---|---|---|
| **1. Algebra.** Compose the affine branches; the return condition becomes one linear equation whose coefficient is `2^s − 3^r`. | The map is affine on each branch, so `D(f^s)` is one scalar `3^r/2^s` — a monomial in two fixed numbers. | **DIES.** Over `F_2` the map is quadratic and its derivative depends on the point: the number of distinct Jacobians over all `2^n` points is **exactly `2^n`** (measured 64, 1024, 16384, 262144 at `n = 6, 10, 14, 18`, exhaustive), against **exactly 1** for every linear rule at every width. The Jacobian *determines the point*, which is the precise opposite of one fixed multiplier. |
| **2. Archimedean size.** The right side is bounded, so `2^s/3^r` is within an explicit `ε` of 1. | An absolute value in which the total expansion over a return must be 1. | **SOLVED, and therefore empty.** In `ℕ` the height grows by exactly 2 digits a step, so the expansion is never 1 — the free triviality of §3.1. Worse: the orbit's entire archimedean content, `θ_t = log₂(r_t) − 2t`, is **purely periodic to every fixed precision** (§3.6). In the `3x+1` problem the orbit's size is the whole difficulty; here it is completely known and is not the prize. The step done properly as a Diophantine question about `α` returns a coin: §3.3. |
| **3. Transcendence.** Baker (or Yu, `p`-adically) bounds the linear form from below, bounding `s`. | A unit group with infinitely many elements and a logarithm. | **VACUOUS over `F_2`.** `|F_2^×| = 1`. There is no linear form in logarithms to bound because there are no logarithms. Over `ℤ₂` there is one — `ℤ₂^× ≅ {±1} × (1+4ℤ₂)` — and step 1 is gone instead: `T(a+b) = T(a)+T(b)−T(0)` fails **3730 of 4096** times for `a,b < 64`, smallest witness `a=1, b=2` (`T(3) = 11`, `T(1)+T(2)−T(0) = 21`). |
| **4. Finite check.** Enumerate below the bound. | A bound from step 3. | **The project owns this step and does it far better than the `3x+1` literature** — the centre column is carried to `10^7` terms, with 499,949 distinct factors of length 32 in a tail of `10^6` (obstruction 9), so with crystal 21 any eventual period with onset below `10^6` exceeds 499,949 — see the caution in §5 about my reading of those two figures. But step 4 is worthless without step 3, and **every bound the board has on the period runs the wrong way**: factor complexity bounds `p` from *below*. Cycle exclusion needs an upper bound. |

**The dictionary.**

| Rule 30 | Arithmetic dynamics | Seam |
|---|---|---|
| `T(r) = 4r ⊕ (2r ∨ r)`, bit `i` = `r_{i−2} ⊕ r_{i−1} ⊕ r_i ⊕ r_{i−1}r_i` | An affine map on each branch | clean as a *polynomial map over `F_2`*, degree 2; not affine over any ring with logarithms |
| The Jacobian over `F_2`: diagonal `1 ⊕ r_{i−1}`, subdiagonal `1 ⊕ r_i`, sub-subdiagonal `1` | The multiplier `3/2` or `1/2` | **SEAM.** Point-dependent, and injectively so: the entries `1 ⊕ r_i` for `i = 1..n−1` and `1 ⊕ r_{i−1}` for `i = 1..n−1` read off every bit, which is why the distinct count is exactly `2^n`. |
| `D(T^t)` along the seed's orbit | `3^r/2^s`, the cycle's multiplier | **SEAM.** A product of *varying* matrices — a matrix cocycle. Its only general theory is Oseledets/Furstenberg–Kesten, which needs an invariant measure. |
| Rule 90, 150 (`⊕` only) | The affine case | clean: Jacobian constant (exactly 1 distinct at every width), `D(f^t) = J^t`, full rank at every `t ≤ 64`, so one fixed algebraic object — this *is* where the machinery lives |
| Corank of `D(T^t)` | — | measured `1.34 t`; see the caution below |
| The proved `4^(−t)` sparsity: the `t`-step map destroys exactly `2` bits a step (pre-injectivity, obstruction on the reachable rows) | — | **SEAM worth naming.** The true information loss is `2t`; the *derivative* sees only `1.34t` of it, so a third of the collapse is invisible to first order. A comparison of a global count with a pointwise linearization, and reported as that. |

**What it leans on.** Baker as quoted in §3.1. Yu Kunrui's `p`-adic analogue:
the paper exists and was verified bibliographically —
<http://www.numdam.org/item/CM_1990__74_1_15_0/> gives *"Title: 'Linear forms
in p-adic logarithms. II'; Author: Yu, Kunrui; Compositio Mathematica, Volume
74, Number 1 (1990), pages 15-113"* — but the page carries no abstract, so
**the statement of Yu's theorem is UNVERIFIED** (searched "Yu Kunrui p-adic
logarithmic forms lower bound linear forms p-adic logarithms theorem"; a
search summary asserted he *"removed the Kummer condition, thereby
establishing the p-adic analogue of a celebrated theorem of Baker"*, and a
search summary is not a quote). Nothing in this connection's argument depends
on Yu's constants — only on the fact that a `p`-adic transcendence theory
exists, which the existence of four papers with those titles establishes.

**The test.** `explorer/parallax12_jacobian.mjs` and
`explorer/parallax12_multiplier.mjs` and `explorer/parallax12_control.mjs`,
all run.
- **B5, the referee:** the Jacobian's column `j` against brute-force flipping
  bit `j`, over 6 rules × all `2^10` points × all `(i,j)` — **614,400
  comparisons, 0 disagreements.** The instrument is checked before it is used.
- **B6:** distinct Jacobians, exhaustive over `2^n` points:
  rule 30 `64 / 1024 / 16384 / 262144` at `n = 6/10/14/18` (i.e. `2^n`);
  rules 90, 150, 60 **exactly 1** at every width; rule 110 `7/8 · 2^n`;
  rule 86 `2^(n−1)`.
- **B7/B8:** corank of `D(f^t)` at `t = n/4`: rule 30 `1.25, 1.28, 1.31, 1.34`
  per step at `n = 64..256`; rules 90, 150, 86 **exactly 0**; rule 60
  **exactly 1.0000** at every width; rule 110 `0.59–0.61`; rule 45 `1.60`.
- **B9, the control that saved the number from being wrong:** the same rate
  over three backgrounds at four widths. Seed `1.28, 1.34, 1.34, 1.36`;
  i.i.d. coin rows `1.89–1.92`; a fixed random row repeated `1.34–1.60`. The
  coin separates, so the rate is a property of the seed's orbit and not of the
  Jacobian's shape.

**A caution I am putting in the document rather than in a footnote, because it
is the exact shape of obstruction 17 and of my own notebook's standing
warning.** The seed's corank rate is `1.33–1.36` and drifting *upward* in `t`
(`1.0000, 1.2500, 1.2813, 1.3125, 1.3438, 1.3375, 1.3333, 1.3393, 1.3438` at
`t = 8..128`, `n = 512`). `4/3` is already on this board twice — sextant7
corrected crystal 69's settling-front constant to `4/3 = 1/(1 − 1/4)` with
`1/4` Wolfram's regular/irregular boundary speed, and crystal 51's seam speed
is `0.2497`. **I am not claiming the corank rate is `4/3`.** It is within a
hair of it, the sequence is still climbing at the last measured point, and
"distrust a clean ratio" is the first line of my own notebook. What *is*
established is that the rate is real (coin null `1.90`, eight sigma away by
eye rather than by a computed error bar — no error bar was computed, and that
is a gap) and rule-specific (`0` for three rules, `1.0000` for rule 60,
`0.66` for rule 110, `1.60` for rule 45).

**Also, and this corrects a claim I nearly made.** Rank of the Jacobian is
**not** a linearity statistic. Rule 86 — rule 30's mirror, equally nonlinear
— is full rank at every `t ≤ 64` and is a bijection on `n`-bit words
(`|image| = 2^n` at `n = 8, 12, 16`), because in the packed-row orientation it
is triangular with `1`s on the diagonal; and rule 60, which *is* linear,
collapses to rank 0 at `t = 32`. Rank separates "the packed row map is a
bijection" from not. The statistic that separates linear from nonlinear is
**constancy** of the Jacobian (B6), and it separates perfectly.

**What it would give.** It touches the residual not at all, and it is the
answer the brief asked for: the step that dies is step 1, and it dies because
the map's only linear structure is over a field whose unit group has one
element. Anything that would repair it has to produce a multiplier, and B6
says the multiplier determines the point — so producing one is producing the
orbit.

**The loop closing on itself, which I did not expect and which is the most
useful sentence here for whoever takes the next vantage.** I chose this
vantage precisely to escape a wall that four of my sightings hit: *the field
theorem holds for almost every point and the prize is about one named point,
because the field object is a measure.* Arithmetic dynamics has no measures.
And the nonlinearity converts the one-named-point multiplier into a product of
varying matrices along an orbit — whose only theory is Lyapunov exponents,
which needs an invariant measure. **The nonlinearity costs exactly the thing
I came here to avoid.** That is not a coincidence about this vantage; it is a
statement about rule 30, and it is the one thing in this document I would put
in front of a captain.

---

### 3.3 P1 is the irrationality of one explicitly given constant, and the transported archimedean step returns a coin

**The claim.** The residual, with no project vocabulary at all, is: *the real
number `α = 0.110111001100010110010011…₂` is irrational.* That is a statement
in a field with a large literature about named constants, it is exactly
equivalent to the wall, and the Diophantine measurement it invites — how well
`α` is approximated by the rationals `ℤ/(2^N(2^p−1))` — returns a fair coin,
so the archimedean step of a cycle-exclusion argument has no purchase.

**The dictionary.**

| Rule 30 | Diophantine approximation | Seam |
|---|---|---|
| The centre column `c` | The binary digits of `α` | clean, definitionally |
| `IsEventuallyPeriodic c` | `α ∈ ℚ` | clean and exact |
| "period `p` from onset `N`" | `α ∈ ℤ / (2^N (2^p − 1))` | clean and exact |
| P1 | `α ∉ ℚ` | clean — and therefore **forbidden to seed**: see below |
| The board's period scan to `10^7` | A lower bound on `\|α − q\|` for every `q` with a small such denominator | clean, and this is a genuine reframing: the board's scans *are* Liouville-exponent computations |
| Step 2 of Steiner: `\|2^s/3^r − 1\| < ε` | An unusually good rational approximation forced by the hypothesis | **SEAM.** There is no forced approximation. Measured: no Liouville structure at any period to 64. |
| The factor complexity bound (crystal 21) | — | bounds the *denominator* from below, which is the wrong direction again |

**What it leans on.** Nothing outside the project: "a binary expansion is
eventually periodic iff the number is rational" is school arithmetic, and I
deliberately did not dress it in a citation. The one outside result I looked
for and did *not* use is Adamczewski–Bugeaud on transcendence of automatic
numbers, because it concludes transcendence *from* irrationality and so sits
downstream of P1 (see §4).

**The test.** `explorer/parallax12_liouville.mjs`, run, centre column to
`T = 100,000` from a packed `Uint32Array` engine that reproduces A051023's
first 24 terms. For each period `p`, the longest `p`-periodic run anywhere
below `T`, against three splitmix64 coins:

| `p` | rule 30 (run, start) | three coins | `log₂T + p` |
|---|---|---|---|
| 1 | 21 at `N=37260` | 19, 16, 16 | 17.6 |
| 4 | 21 at `N=37260` | 19, 20, 19 | 20.6 |
| 8 | 26 at `N=47222` | 23, 23, 22 | 24.6 |
| 16 | 30 at `N=48039` | 30, 32, 30 | 32.6 |
| 32 | 46 at `N=36808` | 48, 46, 46 | 48.6 |
| 64 | 82 at `N=9255` | 80, 78, 79 | 80.6 |

and the approximation exponent `max_{N,p≤64} (N+D)/(N+p)`: **rule 30 `2.0000`,
coins `1.6667`, `4.0000`, `2.2500`** — two of three coins as extreme or more,
and every rule-30 value attained at `N = 0`, where it is arithmetically empty.
**To falsify:** find any `p` and `N` with `N ≥ 1000` and a `p`-periodic run of
length `≥ 3p + 40`; that would be a genuine Liouville-type gain and would be
the first arithmetic fact about `α`. None exists below `10^5` for `p ≤ 64`.

**What it would give, and the fence that comes with it.** As a *route*,
nothing: the measurement is null. As a *reframing* it is worth a captain's
attention, because it states the wall in a language with an outside literature
and no automaton in it. But it must not be seeded: the residual's own note
forbids proposing a statement "merely EQUIVALENT to this one", and `α ∉ ℚ` is
exactly that. What would be legitimate is a *sufficient* condition phrased in
these terms — and §5 says what the only one from this vantage is.

---

### 3.4 Skolem–Mahler–Lech in characteristic `p` is the right shape and the centre column is not in its language

**The claim.** Derksen's positive-characteristic Skolem–Mahler–Lech theorem is
the closest thing in mathematics to what this project wants — a theorem about
*one named sequence* over `F_2` whose conclusion is an *effectively computable
automaton* describing exactly where the sequence vanishes — and it cannot see
the centre column, for a reason that is structural rather than technical: its
subject is the zero set of a *fixed coordinate*, and every fixed coordinate of
rule 30's orbit is a left diagonal and hence eventually periodic, while the
centre column is a read whose coordinate moves one place per step.

**The dictionary.**

| Rule 30 | Linear recurrence sequences over `F_2` | Seam |
|---|---|---|
| The row at time `t`, as a vector in `F_2^n` | The `t`-th term of a sequence in a finite-dimensional `F_2`-space | clean |
| Rules 90, 150, 60: `row_{t+1} = J · row_t` with `J` fixed | A linear recurrence sequence; order `≤ n` by Cayley–Hamilton | clean, and this is why rule 90's column 1 is 2-automatic — the board's own rule-90 witness (obstruction: aperiodicity does not imply hardness) is Derksen's theorem in disguise |
| Rule 30's row sequence | — | **SEAM.** Not a linear recurrence sequence for any reason of substance; it satisfies one only because the *truncation* is eventually periodic. Measured: least order `L = 4, 8, 12, 17, 24, 29, 34, 39, 58, 72` at `n = 8..48`, against tail+period `4, 9, 12, 17, 24, 29, 34, 42, 58, 72` — equal at seven of ten widths and never above. |
| Column `x` of the picture, `x` fixed | The zero set of the `x`-th coordinate — Derksen's subject | clean, **and vacuous**: bit `k` of `rowNat t` at fixed `k` is left diagonal `k`, eventually periodic (measured: periods 2, 1, 4 at `k = 3, 7, 12` over the last 2000 of 4000 rows), so Derksen's automaton describes an eventually periodic set. |
| The centre column `c(t) = bit_t(rowNat t)` | **nothing** | **SEAM, and it is the wall again.** A moving index is not a coordinate of the sequence. Derksen's theorem has no statement about it. |
| `rowNat t` as integers | A `ℤ`-linear recurrence sequence (classical Lech) | **SEAM.** No `ℤ`-linear recurrence of order `≤ 16`: the Hankel system has full rank `L+1` at every `L ∈ {1,…,16}`, exact over `ℚ`. |

**What it leans on.**
- Derksen, *A Skolem–Mahler–Lech theorem in positive characteristic and finite
  automata*, arXiv:math/0510583, Invent. Math. 168 (2007) 175–224. Abstract
  fetched verbatim from <https://arxiv.org/abs/math/0510583>: *"Lech proved in
  1953 that the set of zeroes of a linear recurrence sequence in a field of
  characteristic 0 is the union of a finite set and finitely many infinite
  arithmetic progressions. This result is known as the Skolem-Mahler-Lech
  theorem. Lech gave a counterexample to a similar statement in positive
  characteristic. We will present some more pathological examples. We will
  state and prove a correct analog of the Skolem-Mahler-Lech theorem in
  positive characteristic. The zeroes of a recurrence sequence in positive
  characteristic can be described using finite automata."*
- The modern effective form, fetched from
  <https://arxiv.org/html/2609.03127> (Skolem–Mahler–Lech in rings of positive
  characteristic), Theorem 1.4: *"Let F be a field of characteristic p>0, and
  γ:ℕ→F be a linear recurrence sequence. Then the zero set Z(γ) is effectively
  p-normal in ℕ."* The same page notes the characteristic-0 result *"is not
  effective, and there is no known algorithm that decides whether the zero set
  is empty"* — so it is specifically the **characteristic-`p`** case that is
  the shape this project wants, which is a point in the connection's favour and
  makes its failure sharper.

**The test.** `explorer/parallax12_recur.mjs`,
`explorer/parallax12_debug.mjs`, `explorer/parallax12_recur2.mjs`, all run; C4
and C5 above. Positive control: a planted order-5 recurrence is found at
exactly order 5. Null: splitmix64 and `Math.random()` both give "none `≤ 120`"
at `n = 16, 32, 64`.
**To falsify:** exhibit a `ℤ`- or `F_2`-linear recurrence satisfied by
`rowNat` whose order is smaller than the truncated orbit's tail plus period —
that would put the orbit genuinely inside Derksen's hypothesis and reopen the
route. Or, much better, find any theorem in that literature about a
*diagonal* read of a recurrence sequence in two indices.

**What it would give.** If the row sequence were a linear recurrence sequence
in a way not forced by the truncation, then every *fixed column* would have an
effectively computable automaton — which the board already knows for the
linear rules and which says nothing about the centre column. So even the
successful version of this row buys nothing, and that is worth recording: the
connection fails, and its success would also have failed.

---

### 3.5 The canonical height is exact here, and exactly useless

**The claim.** The one tool in arithmetic dynamics that certifies "this named
point is not preperiodic" is the canonical height, and rule 30's row map
satisfies a height law *better* than anything the field works with — exact,
with no error term — and the tool is still unavailable, because the law is
additive where the construction needs multiplicative. The obstruction is the
degree, and the degree is `1`.

**The dictionary.**

| Rule 30 | Arithmetic dynamics | Seam |
|---|---|---|
| `h(r) = ` number of binary digits of `r` | The Weil height of a point | clean |
| `h(T r) = h(r) + 2`, exactly, no `O(1)` | `h(f(P)) = d·h(P) + O(1)` for `deg f = d` | **SEAM.** Additive, i.e. `d = 1`. Call–Silverman's telescoped sum `ĥ = lim d^(−n) h(f^n(·))` divides by `1^n` and diverges. |
| "the orbit of `1` is not preperiodic" | `ĥ(P) > 0` | the conclusion is free anyway (§3.1), so the tool would be proving a triviality |
| The halving law `T(2s) = 2 T(s)` (board: `step_two_mul`, kernel-proved) | A scaling/functoriality relation | clean, verified again here: 0 failures over 256 arguments. It is genuine multiplicative structure and it relates the orbit of `1` to the orbit of `2^a` — *a different orbit*, the same picture translated — so it produces no self-relation. |
| The centre column | — | **SEAM.** Heights see the point, not a digit of it. |

**What it leans on.** Call–Silverman's canonical height, fetched from
<https://arxiv.org/html/math/0510444v2>: for `φ ∈ K(z)` of degree `d`, the
functional equation *"h^ϕ(ϕ(x)) = d · h^ϕ(x)"*, the requirement that *"The
theory requires deg ϕ ≥ 2"*, and *"All preperiodic points of ϕ clearly have
canonical height zero"* with, over a global field, *"h^ϕ(x) = 0 if and only if
x is preperiodic"*.

**The test.** `explorer/parallax12_orbit.mjs` A1 (the exact height law, 0
failures to `t = 3000`) and `explorer/parallax12_ring.mjs` E1 (the halving law,
0 failures).
**To falsify:** produce any absolute value on `ℕ` or `ℤ₂` in which `T`
expands by a factor `> 1`, rather than by an additive constant. The
2-adic absolute value gives `|T(x) − T(y)|₂ ≤ |x − y|₂` with strict
contraction wherever `r_{i−1} = 1`, so `T` is 1-Lipschitz and nowhere
expanding 2-adically; the archimedean one gives additive growth. Neither is a
degree.

**What it would give.** Nothing, and the reason is worth a line for the next
connector: the height-based certificate answers "is this point preperiodic",
and rule 30's prize is not a question about a point. **Every tool in this
vantage answers a question about the orbit's values; the prize is a question
about one digit.**

---

### 3.6 The archimedean step is completely solved for rule 30, and that is precisely why it gives nothing

**Band: Known / project-internal.** What follows is a two-line corollary of
`rightDiagonal_periodicFrom_pow`, which is proved on this board and is
Rowland's theorem. Its value is not the fact but the placement: it shows the
step that carries all the difficulty in the `3x+1` problem is, here, finished.

**The claim.** Write `log₂(r_t) = 2t + θ_t` with `θ_t ∈ [0,1)`. This `θ` is the
whole archimedean content of rule 30's orbit — the nearest thing the project
has to Steiner's `|s log 2 − r log 3|`, and the object Kopra's dictionary
between rule 30 and the powers of a rational is about. It is **purely
periodic to every fixed precision, with no transient**, and the period at
precision `k` is exactly the minimal period of right diagonal `k`. So the
size of the orbit is known in closed form for all time, and it is a function
of the top digits while the prize is about the middle one.

**The dictionary.**

| Rule 30 | Steiner's step 2 | Seam |
|---|---|---|
| `log₂(r_t) = 2t + θ_t` | `log₂(cycle multiplier) = s − r log₂3` | clean: both are "the accumulated size of the orbit" |
| `θ_t` to `k` bits of precision = the top `k+1` digits of `r_t` | the quality of the approximation `2^s ≈ 3^r` | clean, definitionally |
| The top `k+1` digits of `r_t` = right diagonals `0..k` | — | clean: digit `2t−j` of `r_t` is the cell at position `t−j` at time `t`, which is `rightDiagonal j (t−j)` |
| Right diagonals are periodic **from index 0**, period dividing `2^j` (`rightDiagonal_periodicFrom_pow`) | The multiplier's behaviour is the open problem | **SEAM, and it is a total inversion.** `θ` is purely periodic; in `3x+1` the analogous quantity is where the difficulty is. Here the difficulty has moved entirely off the object the field knows how to handle. |
| `c(t)` = digit `t` of `r_t`, the middle digit | — | **SEAM.** `θ` is the top; `c` is the middle. Agreement between `c(t)` and the leading fractional bit of `θ_t`: `0.5041` over 1480 rows — a coin. |
| The left diagonals (the *low* digits), also eventually periodic | — | So both ends of the word are periodic and the middle is the prize — crystal 69 and obstruction 20 in arithmetic clothing. |

**What it leans on.** `rightDiagonal_periodicFrom_pow`, on this board, which
is Rowland 2006's Theorem 1 for rule 30 (`sources/rowland-2006-local-nested-structure.txt`);
no outside fetch. Baker as quoted in §3.1 for what the step is in the
`3x+1` case.

**The test.** `explorer/parallax12_log.mjs`, run. F2: the least period of the
top `k+1` digits of `r_t`, for `k = 0..14`, is
`1, 2, 2, 4, 8, 8, 16, 32, 32, 64, 64, 64, 64, 64, 64` and equals
`max(P_0..P_k)` at **every** `k`; at `k = 10` the period `64` holds with
**0 failures over 1426 comparisons starting from `t = 10`**, i.e. no transient.
F3: exactly **64** distinct top-13-digit patterns over `t = 12..1499`, where a
coin would give 1488. F1, the cross-check: the right-diagonal minimal periods
recomputed here from the packed rows come out
`1,2,2,4,8,8,16,32,32,64,64,64,64,64,64,128`, which is obstruction 20's
published list word for word — a confirmation from a script that shares no
code with the one that produced it.
**To falsify:** exhibit a precision `k` at which `θ` is not purely periodic.
That would contradict `rightDiagonal_periodicFrom_pow` and would be much
bigger news than this document.

**What it would give.** Nothing, and it is the sharpest single closure in the
document. It does not merely say the archimedean step is unavailable; it says
the step is **already finished** and the prize survives it untouched. Any
future vantage that proposes to control rule 30 by controlling the size of its
orbit is refuted in advance: the size is periodic.

---

## 4. Died in translation

- **The literal brief: "does any cycle-exclusion technique survive XOR and
  OR?"** Answered no, and the shape of the no was not what I expected. I went
  in believing several steps would fail; exactly one does (step 1), and it
  fails irreparably because the ring in which step 1 holds (`F_2`) and the
  rings in which step 3 holds (`ℤ`, `ℤ₂`) are disjoint. *Which* step and
  *why* is §3.2; the guess in my brief was right and its reason was not the
  one I had in mind.
- **"The board's arithmetic node is the way in."**
  `leftDiagonal_onset_le_iff_stepMod_return` really does state a wall as a
  return condition with no automaton in it, and it is the **wrong return**: in
  a finite set every orbit returns, so the node is a *tail* bound, which is
  synchronization and not cycle exclusion. Died at A2, the first measurement.
- **"The truncated period is new structure."** Died at A3 before anything was
  built on it: period = `2^(#doublings ≤ n−1)`, 0 mismatches to `n = 64`.
  Obstruction 17's pattern, fourth instance.
- **"The least linear recurrence order of the row sequence is a rule-30
  statistic."** Died at C5: `L` equals the truncated orbit's tail plus period
  at seven of ten widths and never exceeds it. Obstruction 17's pattern,
  fifth instance, in a vocabulary with no diagonals in it.
- **My coin null, and this is the session's real mistake.** C2's i.i.d.
  control returned least order **33 at every width**, which I read as a solver
  bug and refereed with a slow, obviously-correct implementation that recovers
  the coefficients and verifies them by substitution. The referee **agreed**:
  0 failures in 3632 checks. The data were right and the null was wrong —
  `xorshift32` is an `F_2`-**linear** map on 32 bits, so its output bits
  satisfy a recurrence of order `≤ 32` by Cayley–Hamilton, and `33` is exactly
  that. A generator that passes every statistical test is worthless as a null
  for a *linearity* test. My notebook already records the ancestor of this
  ("my pseudo-random sequences were random", 2026-09-07, an LCG whose low bit
  alternates) and records that I fixed it by switching to xorshift32 — so the
  fix for the old instance is the cause of the new one. Repaired with
  splitmix64 (BigInt multiplication, not `F_2`-linear) and cross-checked
  against `Math.random()`: both give "none `≤ 120`".
- **"Rank of the Jacobian measures nonlinearity."** Died on two controls at
  once: rule 86 (nonlinear, rule 30's mirror) is full rank at every `t` and a
  bijection on `n`-bit words; rule 60 (linear) collapses to rank 0 at
  `t = 32`. Rank measures packed-row bijectivity. *Constancy* of the Jacobian
  is the linearity statistic and it is exact — 1 versus `2^n`.
- **"The corank rate `1.34` is the front constant `4/3`."** Not dead, not
  established, and deliberately not claimed: the sequence is still climbing at
  `t = 128` and the two numbers differ in the third decimal. Recorded as a
  coincidence to check, with the coin null (`1.90`) that makes the quantity
  real, and with no error bar, which is a gap.
- **The Liouville route.** Died at the measurement: no `p`-periodic run
  anywhere below `10^5` exceeds a coin's by more than 2, and two of three coins
  beat the seed on the approximation exponent.
- **Adamczewski–Bugeaud on automatic numbers.** Died on the direction of the
  arrow, which is the mistake my notebook says to check first: "an automatic
  irrational is transcendental" needs irrationality as input. It is downstream
  of P1. (Related and already on the board from my own 2026-09-09 sighting:
  non-automaticity is *strictly stronger* than P1, so nothing routes through
  automaticity.)
- **Morton–Silverman uniform boundedness as a source of an upper bound on the
  period.** Died on the hypothesis rather than on a measurement: those theorems
  bound the number of preperiodic points of a morphism of degree `≥ 2` over a
  number field, and §3.5 says the degree is 1 and §3.1 says the point is not
  preperiodic anyway. It bounds the wrong object.
- **S-unit equations (Evertse, Győry) as the home of the return condition.**
  Died on paper, before a measurement, and is flagged as reasoning: the return
  condition over `F_2` is `n` quadratic equations with no monomial structure
  (§3.2), and an `S`-unit equation needs the unknowns to be units — of a ring
  whose unit group here has one element.
- **"The exact height law is worth something because it is exact."** Died at
  the degree: `h(T r) = h(r) + 2` with no error term is better than the field
  ever gets and is still `d = 1`, where the construction needs `d ≥ 2`.
- **"The archimedean size of the orbit is where the leverage is"** — the last
  thing I tried, on the grounds that it is where all the leverage is in the
  `3x+1` problem. Died in the strongest possible direction: `θ_t` is purely
  periodic to every precision (§3.6), so the step is not blocked but
  *finished*, and the prize survives it. A vantage cannot be rescued by
  solving a step that was never the obstruction.
- **My own right-diagonal recomputation, and it is the third time my notebook
  has recorded this exact shape.** `parallax12_log.mjs`'s first version read
  `bit i of row (i+j)` for right diagonal `j`, which is position `−j` — a
  **left** diagonal. The tell was not a wrong-looking number but a *missing*
  one: every period came back `null` and every maximum `NaN`, printing a row
  of bare commas. The main measurement (F2, the period of the top digits) was
  computed by different code and was unaffected — and had already reproduced
  the board's published list, which is what said the fast path was fine and
  the control was not. Fixed to `bit (2i+j) of row (i+j)`, after which F1
  matches obstruction 20 word for word. **The lesson my notebook keeps
  re-learning: when reading a two-index array along a line, write the index
  identity down before writing the loop.** I also had `θ_t` printing as
  `1.087` on that run — above 1, impossible for a fractional part — because
  `topBits` includes the leading `1`; both defects were in the same function
  and neither was caught by a test.
- **Nothing died for lack of depth.** Every death above has a witness computed
  rather than searched for; the orbit was carried to `t = 3000` exactly, the
  truncations to `n = 64` exhaustively, the Jacobian counts exhaustively over
  `2^18` points, the Jacobian referee over 614,400 comparisons, the recurrence
  orders against a verified referee, and the centre column to `10^5` terms
  against three coins. The one thing I could not settle by computing is
  whether the cycle-exclusion literature contains a theorem about a *digit* of
  a trajectory; I searched and found none, and that negative is a search and
  not a proof.

---

## 5. What to hand the theorist

**One topic, and it is the only legitimate one from this vantage.**

> **Find any upper bound on the period, and the board's own computation
> finishes the argument.** Under the hypothesis that the centre column is
> eventually periodic with period `p` and onset `N`, prove `p ≤ B` for any
> explicit `B` — or `p ≤ B(N)` for any explicit function — with `B` below
> `499,949` and `N` below `10^6`. The board's factor-complexity computation
> then contradicts it, and P1 follows: obstruction 9 records that the seed's
> centre column has **499,949 distinct factors of length 32 in a tail of
> `10^6`**, and crystal 21 turns a factor count into a period bound (an
> eventually periodic sequence has at most `q` distinct factors of each length
> in its periodic part), so any eventual period with onset below `10^6`
> already exceeds 499,949. **A theorist should re-derive that bound rather
> than take it from me**: I am reading two numbers out of an obstruction
> entry whose neighbouring figure, 998,977 distinct factors of length 1024,
> belongs to a *different* sequence (column 1 of the `(10)^∞` witness), and I
> had the two conflated in this document's first draft.

Why this is the right shape and not circular. The residual's own note says
what is wanted is a **sufficient condition**, and that proposing anything
merely *equivalent* to the wall is forbidden. "Hypothesis → `p ≤ B`" is not
equivalent to the wall: it is a consequence of the hypothesis which, combined
with a finished computation, yields the wall. It is precisely steps 3 and 4 of
Steiner's argument, with step 4 already done here to far greater depth than
that literature ever needs. **The direction of the bound is the entire
missing content**: every bound this board has on `p` — factor complexity,
distinct-factor counts, the period scans — bounds `p` from *below*. Cycle
exclusion works because transcendence bounds the cycle length from *above*.

The dictionary row it depends on is §3.2's step-3 row, and a theorist should
attack it there: an upper bound on `p` has to come from some quantity that the
hypothesis pins, and §3.2 says the candidate quantities (the multiplier, the
archimedean size of the return, a linear form in logarithms) are respectively
point-determining, discarded by the truncation, and non-existent. So the
honest brief is: *either find a quantity the periodicity hypothesis bounds
from above, or establish that none exists* — and the second is worth as much
as the first, because it would close this vantage in principle rather than in
practice.

**One thing for the captain rather than for a theorist, and it must not be
seeded.** The residual is exactly *"the real number
`0.110111001100010110010011…₂` is irrational"* (§3.3). That is a restatement
in a vocabulary with an outside literature, no automaton, and no cellular
automaton, and I think it belongs in the project's own description of P1 for
readers from outside. It is *equivalent* to the wall, so the residual's note
forbids seeding it as a statement.

**What I would not spend a session on**, from this vantage: heights (§3.5,
degree 1), Skolem–Mahler–Lech in either characteristic (§3.4, the hypothesis
holds trivially and the conclusion is about fixed coordinates), the Liouville
exponent (§3.3, measured and null), anything phrased as a return condition on
a truncated map (§3.1, every orbit returns and the node is a left-diagonal
tail bound — the trap CLAUDE.md names), and above all **anything that
proposes to control the orbit's size** (§3.6: `θ_t` is purely periodic to
every precision, so that step is finished and the prize survives it).

**And one fence a captain may want, stated as a reading rather than a
measurement.** Across §3.1, §3.4, §3.5 and §3.6 the same seam recurs with
four different fields on the far side: *the field's theorem is about the
orbit's values, or about a fixed coordinate of them, and the prize is about a
read whose coordinate moves one place per step.* That is a stronger and more
transferable fence than any one of the four, and it predicts in advance which
vantages will fail — which is why §6 goes looking for the one literature whose
subject is exactly a moving-index read.

---

## 6. Next vantage

**The two-index problem: diagonal reads of arrays defined by a recurrence in
two variables — `q`-difference equations, Mahler functions and the theory of
`k`-regular *double* sequences.** Everything in this document, and in the four
sightings before it, dies at the same seam in a new costume: the field owns the
array and the prize owns a *diagonal* of it. Derksen owns the zero set of a
fixed coordinate; heights own the point; cycle exclusion owns the trajectory's
values; the transfer operator owns the measure. The centre column is
`rowNat t`'s digit `t` — the **diagonal** of a two-index array `A(t, x)` that
rule 30 defines by a recurrence in both indices — and the one branch of
mathematics whose business is exactly the diagonal of a two-variable array is
the theory of diagonals of power series and Mahler-type functional equations:
Furstenberg's theorem that the diagonal of a rational power series in two
variables over `F_q` is algebraic, Denef–Lipshitz on diagonals of `D`-finite
series, and the `k`-regular double sequences of Allouche–Shallit. A connector
standing there would ask the one question nobody here has asked: **rule 30's
array satisfies an explicit quadratic recurrence in two indices; what does the
diagonal-of-a-two-variable-array machinery require of that recurrence, and how
far is one quadratic monomial from it?** For the linear rules the array's
generating function is rational, Furstenberg applies, the diagonal is
algebraic, and Christol makes it automatic — which is the board's own rule-90
witness for the third time in this document, now as a *theorem of that field*.
The seam is visible in advance and that is why the vantage is worth a session:
Furstenberg needs rationality, and rule 30's `c·r` monomial destroys it, so
the measurement to make is how the diagonal's algebraicity degrades — and my
own 2026-09-09 Christol sighting establishes that algebraic series over `F_q`
are closed under Hadamard product, which means the answer is not the cheap
"nonlinear hence not algebraic" one.

**And the one I could not reach from where I stood.** Everything in this
vantage is about a *single* orbit, and the one literature that bounds a
*single* orbit's digits without a measure and without a multiplier is the
theory of **normal numbers and the Weyl-sum method applied to explicit
constructions** — Davenport–Erdős, Bailey–Crandall's normality of the Stoneham
constants, and the `2`-adic Champernowne-type constructions where balance and
non-periodicity of an explicitly built expansion are *proved*. I could not
reach it because it needs an explicit construction of the digits and rule 30's
digits are defined by the recurrence rather than built; but a connector who
asked "what do the constants whose normality *is* proved have in common, and
which of those properties can rule 30's picture be shown to have" would be
attacking Prize 2 from the only direction where that prize has ever been won
for a named constant. That is not the vantage I would take first, and it is the
one I regret not being able to take.
