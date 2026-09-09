# Sighting — the centre column from the analytic number theory of digital sequences

**Connector:** Parallax (fourth session)
**Date:** 2026-09-09
**Wall:** `centerColumn_other_isEventuallyPeriodic_of_center` (equivalent to Prize 1)
**Vantage:** Gowers uniformity norms and the analytic number theory of digital
sequences — Mauduit–Rivat's method for digit sums along primes and squares,
Konieczny's Gowers norms of automatic sequences, van der Corput and
carry-propagation estimates. Aimed at **Prize 2** (balance), on purpose.

**The one-line answer to the question the brief asked.** *No theorem in this
field survives the loss of linearity, and it is not close: every one of them
takes as its starting hypothesis that the sequence is computed from a
bounded-state machine reading digits, and the two things that make rule 30's
column not such a sequence — the quadratic monomial and the unbounded state —
are each independently fatal. Worse, and this is the finding: the field's
theorems are about sequences that are **less** uniform than rule 30's centre
column, measurably so. Thue–Morse's largest Fourier coefficient is thirteen
times rule 30's at N = 2¹⁹. The structure the field needs in order to prove
uniformity is structure rule 30's column does not have.*

---

## 1. The problem, seen from outside

Take an infinite row of cells, each 0 or 1, all 0 except a single 1. Update
every cell simultaneously and forever by "new cell = left neighbour XOR (own
value OR right neighbour)". Write down the value of the cell you started at,
once per step. That gives an explicit, computable 0/1 sequence
`c(0), c(1), … = 1,1,0,1,1,1,0,0,1,1,0,0,0,1,0,1,1,0,0,1,0,…`. The question is
whether it is eventually periodic — whether there are `p > 0`, `N` with
`c(t+p) = c(t)` for all `t ≥ N`. It is believed not; it has been checked to
depths in the billions; nothing is proved.

Put `u(t) = (−1)^{c(t)} ∈ {±1}` and the two questions this document sits
between become two moments of one object:

- **Prize 1 (the wall).** `u` is not eventually periodic.
- **Prize 2.** `Σ_{t<N} u(t) = o(N)` — the two symbols have equal density.

Neither implies the other (`(10)^∞` is balanced and periodic), but both are
implied by control of the single family

>   `γ(r) = lim_N (1/N) Σ_{t<N} u(t) u(t+r)`,

the temporal autocorrelation. If `c` is eventually `p`-periodic then `γ(p) = 1`
exactly, so

- **`γ(r) < 1` for every `r ≥ 1` gives Prize 1**, and
- **`(1/R) Σ_{r<R} |γ(r)| → 0` gives Prize 2**, by van der Corput's inequality.

That is why a Prize-2 vantage may look at a Prize-1 wall: in this field the two
prizes are the `U¹` statement and the "no correlation with any single periodic
phase" statement about the same sequence, and the standard machinery attacks
both through `γ` and through the Fourier transform that controls it.

**Restated in the vantage's own terms.** An analytic number theorist reads `c`
as a *digital function*: a 0/1 function of `t` computed by a bounded local
machine from a representation of `t`. The model case is `s_q(n) mod 2`, the
parity of the base-`q` digit sum — Thue–Morse at `q = 2`. The field's theorems
say: that sequence is balanced, balanced along the primes (Mauduit–Rivat's
solution of Gelfond's problem), balanced along the squares, has all Gowers
norms `‖·‖_{U^s} = o(1)` (Konieczny), and is orthogonal to the Möbius function
(Müllner). Every one of those proofs starts from the same structural fact:
`s_q` is **`q`-additive**, `s_q(a q^k + b) = s_q(a) + s_q(b)`, so `e(α s_q(n))`
factors as a *product over the digits of `n`* and an exponential sum over
`n < q^λ` becomes a product of `λ` one-digit sums. The digit expansion is a
coordinate system in which the function is a homomorphism.

Rule 30 is that shape with one term added. Over `F₂`,

>   `left XOR (centre OR right) = (left + centre + right) + centre·right`,

so **rule 30 is rule 150 — the `F₂`-linear rule — plus the single quadratic
monomial `centre·right`** (Rosetta). For rule 150 the row map is a group
homomorphism of `(F₂^ℤ, ⊕)`, its picture is a linear-algebra object, its centre
column is 2-automatic, and every theorem named above applies to it verbatim.
The monomial is exactly the failure of additivity in the digit coordinate. This
document finds where that hypothesis is used and what the loss costs.

---

## 2. Fields sighted

| Field / theory | The object there | The seam, in one line |
|---|---|---|
| Analytic number theory of digital functions (Gelfond's problem; Mauduit–Rivat) | `s_q(n) mod 2`, the digit-sum parity; the row is the digit string and `c(t)` the readout | Every estimate factors `e(αs_q(n))` over digits because `s_q` is `q`-additive; the rule-30 row map is not a homomorphism and the defect is `c·r`, which fires at density `1/4` (§3.1) |
| Gowers uniformity norms and inverse theorems (Green–Tao–Ziegler) | Prize 2 is `‖u‖_{U¹} = 0`; the natural strengthening is `‖u‖_{U^s} = o(1)` | Every `U^s` bound in print for an *explicit* sequence needs it to be automatic, nilsequence-like, or multiplicative; the centre column is none of the three |
| Gowers norms of automatic sequences (Byszewski–Konieczny–Müllner) | "structured part + Gowers-uniform part", the exact shape Prize 2 wants | The hypothesis is automaticity, and proving the centre column *non*-automatic is strictly stronger than Prize 1 (my own third session; floor 130,553 states) |
| Distribution modulo 1 / Mahler's 3/2 problem (Kopra's bridge) | The leading fractional base-`pq` digit of `(p/q)^n α` | Across the bridge Prize 1's analogue is a **theorem** and Prize 2's analogue is a problem the field itself calls mysterious — the two prizes swap difficulty (§3.4) |
| Symbolic dynamics of expansive directions (Kopra; Boyle–Lind) | Left expansivity with dimensions `(h,d,w)`; Prize 1 is the `w = 1` case | Rule 30 sits at the exact double boundary of the theorem: speed `s = 1` forces `h = 0`, and at `h = 0` width 1 is false at every depth (§3.2, measured exhaustively) |
| Analysis of Boolean functions / Fourier–Walsh | `f_t : {0,1}^{2t+1} → {0,1}`, window to centre cell at time `t`; `window_count_half` says it is balanced | The *entire* spectrum sits on sets containing the left-edge coordinate (§3.3, exhaustive), so no ensemble statistic that ignores the left edge sees anything at all |
| Stream-cipher cryptanalysis (Siegenthaler; Meier–Staffelbach; linear cryptanalysis) | Rule 30 as a nonlinear filter whose best linear approximation is rule 150, bias `1/4` | The bias is gone by `t = 2` — total loss, not approximation (§3.1) |
| Ergodic theory of surjective CA (Hedlund; Boyle–Kitchens; Shereshevsky) | The uniform Bernoulli measure, invariant because rule 30 is surjective; column density `= 1/2` a.e. | Every statement is almost-everywhere; the seed is one point of measure zero |
| Explicit normal numbers (Borel; Champernowne; Copeland–Erdős; Bailey–Crandall) | Prize 2 is simple normality in base 2 of `0.c(0)c(1)c(2)…` | Every explicit normal number is either built digit-block by digit-block to be normal, or is an orbit of a **linear** map |
| Furstenberg ×2 ×3 rigidity (Furstenberg; Rudolph; Johnson) | Commuting endomorphisms of a compact group; `(σ, F)` as a `ℤ²` action | Rules 90/150 *are* endomorphisms of `(F₂^ℤ, ⊕)` and rigidity applies to them; rule 30 is an endomorphism of no group — the same monomial, a third time |
| Sarnak's conjecture (Müllner: automatic sequences satisfy Sarnak) | `u` as a deterministic sequence orthogonal to `μ` | Sarnak's conjecture is about **zero-entropy** sequences; the centre column is conjectured positive-entropy, so it is not a candidate object |
| Carry propagation / van der Corput | The carry from `n ↦ n+r` reaches digit `k` with probability `q^{−k}`: short, geometric, independent | The rule-30 analogue is the left damage front, and `crystals` A3 says no bound below `1` is provable for it |
| Transfer operators, preimage counting, de Bruijn graphs (Fukś) | Column statistics as the stationary measure of a finite transfer matrix | The stationary measure is the ensemble one; the seed's is a Dirac and no transfer matrix sees it |
| Algebraic power series over `F_q` / Christol (my own third session) | `c` as coefficients of a series algebraic over `F₂(x)` | Dead; recorded in §4 so the next connector does not chase it twice |

---

## 3. Connections

### 3.1 The linearisation is not an approximation — it is a different object with the opposite answer

**The claim.** The single monomial `c·r` is not a perturbation of rule 150 that
a careful estimate could carry along: it fires at density exactly `1/4` at
every scale, it destroys the linear correlation completely within two steps,
and — decisively — **both prizes are FALSE for the linearisation.** So any
proof of Prize 2 (or Prize 1) that would still run with the monomial set to
zero is proving something false, and every theorem of Mauduit–Rivat type is
exactly such a proof.

**The dictionary.**

| Rule 30 | Rule 150 / the digital-function world | |
|---|---|---|
| A row of the picture | The base-`q` digit string of `n` | |
| The row map `evolve t` | `n ↦ n` with the digit function read off | |
| `F₂`-linearity of the row map | `q`-additivity `s_q(aq^k + b) = s_q(a) + s_q(b)` | the hypothesis every estimate uses |
| Exponential sum `Σ_t (−1)^{c(t)} e(θt)` | `Σ_{n<q^λ} e(α s_q(n) + θn)`, a **product of `λ` one-digit sums** | the factorisation is the method |
| The centre column `c(t)` | The digital function `s_q(n) mod 2` | |
| The correction term `c·r` | *No counterpart* | **the seam** |
| The centre column of rule 150 | The digital function of an additive rule | **constant `1` — measured to 200,000 terms** |
| The centre column of rule 90 | ditto | **`1` then `0` for ever — measured to 200,000 terms** |

**Seams.** Three, and each is independently fatal.

1. *The correction is dense, not sparse.* Measured on a real (untruncated)
   picture, the density of a black cell with a black cell immediately to its
   right — the cells where `c·r = 1` — is `0.2502, 0.2503, 0.2502, 0.2501` over
   rows `≤ 2000, 4000, 6000, 8000` (`explorer/parallax2_gamma.mjs`). The
   monomial fires at a quarter of all cells, at every scale. There is no regime
   in which rule 30 is rule 150 plus a rare defect.
2. *The linear approximation dies at `t = 2`.* Over uniform random windows,
   `Pr[rule 30 centre cell = rule 150 centre cell]` at time `t` is
   `1.0000, 0.7469, 0.5036, 0.5334, 0.5132, 0.5031, …` for `t = 0..5`, and
   thereafter sits inside `0.5 ± 0.008` out to `t = 160`, against a sampling
   noise of `0.007` (20,000 samples, `explorer/parallax2_linear.mjs`). The
   `0.7469` at `t = 1` is the predicted `3/4`: the two rules differ exactly
   when `c = r = 1`. By `t = 2` the linear model carries no information.
3. *The linearisation has the opposite answer.* Rule 150's centre column is
   constantly `1` (200,000 terms, `explorer/parallax2_linear.mjs`); rule 90's
   is `1` at `t = 0` and `0` for ever after. Both are eventually periodic and
   both are maximally unbalanced. **Prize 1 and Prize 2 are both false for the
   linearisation of rule 30.** Kopra says the same thing about his own class:
   "Unfortunately the set of rapidly left expansive CA cannot be such a class,
   because it contains the additive ECA Rule 90 (with a (1,1) local rule
   f(abc) = a + c (mod 2)) that produces a single eventually periodic column
   starting from the configuration with a single 1 at the origin."
   (`sources/kopra-2022-natural-class.txt`, lines 564–567.)

**What it leans on.**

- Kopra 2022, held at `sources/kopra-2022-natural-class.txt`, lines 564–567,
  quoted above; arXiv:2202.13809.
- The `F₂` identity `l XOR (c OR r) = (l+c+r) + c·r` is Rosetta's, and is a
  one-line check on the eight neighbourhoods.
- The characterisation of the Mauduit–Rivat method as van der Corput plus a
  carry-propagation lemma plus a Fourier estimate on digit blocks is
  **UNVERIFIED as a verbatim quote**: <https://arxiv.org/html/1707.05112>
  (Spiegelhofer, *Normality of the Thue–Morse sequence along Piatetski-Shapiro
  sequences*) was fetched and the fetch returned a summary rather than the page
  text, giving only the fragments "We apply Lemma 4.5, which is van der
  Corput's inequality" and a description of "Lemma 4.1 by Drmota, Mauduit and
  Rivat, which provides bounds on discrete Fourier coefficients". I also
  searched for a Rivat survey (`Mauduit Rivat q-multiplicative carry
  propagation van der Corput survey`) and reached
  <http://www.numdam.org/item/JTNB_2009__21_2_415_0/>, whose landing page
  carries only the abstract. A theorist who wants the exact form of the
  factorisation should read Mauduit–Rivat, *Ann. of Math.* 171 (2010) 1591–1646
  (<https://annals.math.princeton.edu/2010/171-3/p04>) directly. **Nothing in
  this section depends on that citation** — the three seams are all measured
  here.
- The identification of rule 150's centre column with the central trinomial
  coefficients mod 2 (OEIS A002426, which are all odd) is **UNVERIFIED**:
  <https://oeis.org/A002426> and <https://oeis.org/search?q=A002426&fmt=text>
  both returned HTTP 403. The constancy is my own measurement, to 200,000
  terms.

**The test.** `node explorer/parallax2_linear.mjs` and
`node explorer/parallax2_gamma.mjs`; both were run, results above. To kill the
claim a theorist would have to exhibit a proof technique whose rule-150
specialisation does *not* prove that rule 150's centre column is aperiodic or
balanced — i.e. a technique that already knows about the monomial. I do not
believe one exists in this literature.

**What it would give.** Nothing towards the wall directly. Its value is
negative and it is worth a captain's attention for exactly that reason: it is a
*proof-technique exclusion*, of the same kind as a relativisation barrier. Any
future proposal whose argument would survive replacing `OR` by `XOR` can be
rejected without reading it.

---

### 3.2 Kopra's theorem is stuck at width 2 by a double boundary, and the width-1 case is false at every depth

**The claim.** The strongest published statement near Prize 1 — Kopra's
Theorem 3.5, that no width-2 column block of rule 30 is eventually periodic —
is not one technical improvement away from Prize 1. It is pinned at width 2 by
*two* parameters of his own framework simultaneously, and I can close the
remaining gap by exhaustive computation: **rule 30 is not left expansive at
width 1 with any dimensions `(h, d, 1)`, and the failure is total and
structural, not marginal.**

**The dictionary.** Kopra's bridge, laid out row by row. `π_{p/q,pq}` is the
cellular automaton that multiplies by `p/q` in base `pq`.

| Rule 30 | `π_{p/q,pq}` — multiplication by `p/q` in base `pq` | Source |
|---|---|---|
| A configuration white far to the left (`number-like`) | A positive real `α`, written `real_n(x) = Σ_i x[−i] n^{i−1}` | Kopra Def. 2.4, Ex. 2.5 (lines 132–160) |
| Position `0` of the configuration | The **first digit after the point** of `α` (`config_n(α)[i] = α_{−i−1}`) | Ex. 2.5, line 149 |
| One step of the automaton | `α ↦ (p/q)·α` | Ex. 2.5, line 163 |
| The centre column `Tr_0(x)` | The leading fractional digit of `(p/q)^t α` | Def. of the trace, lines 187–195 |
| The right half of the row, `frac(F^t x)` | `frac((p/q)^t α)` | §4, lines 399–401 |
| The left edge of the cone | The position of the leading digit, `≈ log_{pq} α` | Def. 2.4 |
| The speed of the left edge (`evolve_left_edge`: exactly 1) | The spreading speed `s = log_{pq}(p/q) < 1` | lines 290–294 |
| Left expansivity `(h, d, w)`: a `w`-wide, `(h+d+1)`-tall block determines the cell to its left | `(1,1,1)` for the multiplication automata | lines 242–243 |
| Left permutivity ⇒ `(0, 1, 2)` for rule 30 | — | lines 241–242 |
| Prize 1 | "the leading fractional digit of `(3/2)^n α` is not eventually periodic" | Problem 4.8 |

**Seams — and this is the content.** Kopra's Theorem 3.5 needs
`s < 1/h` (Def. 3.4, line 305) and concludes about traces of width `w`. Rule 30
sits at the boundary in *both* coordinates at once:

- *The speed coordinate is saturated.* "An elementary CA is left spreading if
  and only if its local rule maps the triplet 001 to 1, and then its spreading
  speed is equal to 1" (lines 293–294). Rule 30 has `f30(001) = 1` (line 123),
  so `s = 1` exactly — and the board's `evolve_left_edge` says the same thing
  about the single seed. So `s < 1/h` forces **`h = 0`**. Kopra's own Remark
  3.6 shows what happens one step beyond: the shift map has `s = 1`, `h = 1`,
  fails `s < 1/h`, and its conclusion is false.
- *At `h = 0`, only width 2 is available.* Left permutivity gives `(0,1,2)` and
  nothing narrower.
- *And width 1 at `h = 0` is false at every depth.* Measured exhaustively:
  for each `d`, enumerate all `2^{2d+1}` windows `[−d,d]` — which is **every
  configuration in the universe**, because the cell at `(0,t)` depends only on
  cells `[−t,t]`, so the column word at times `0..d` depends only on that
  window — and ask whether the column word determines the cell at `(−1,0)`.
  Result (`explorer/parallax2_expansive.mjs`, `d = 1..12` exhaustive,
  `d = 13,14` sampled at 4·10⁶): every one of the `2^{d+1}` column words
  occurs, and **exactly `2^d` of them — precisely half — fail to determine it,
  at every `d`.**
- *Which half, and why depth cannot help.* Exhaustively for `d ≤ 11`
  (`explorer/parallax2_expansive2.mjs`): the determined words are **exactly**
  those whose anchor cell is black, and the ambiguous ones **exactly** those
  whose anchor is white. That is the board's `column_succ_of_black` seen from
  outside — a black `c(t)` makes the `OR` equal `1` whatever column `1` holds,
  so `c(t+1) = ¬col(−1)(t)`. The finding is the converse: **no amount of extra
  depth ever resolves a white anchor.** Looking further down the column buys
  literally zero words.
- *Height does not help either.* With the block at times `[0, h+d]` and the
  target at `(−1, h)`, the determined fraction is `0.5000` for every
  `h ∈ [0,5]` and `d ∈ [1,6]`, exhaustively. (It is unusable anyway, since
  `s = 1` forces `h = 0`, but it removes the last escape.)

**What it leans on.** Kopra 2022, `sources/kopra-2022-natural-class.txt`
(arXiv:2202.13809), definitions and lines cited above; all quotations are from
the held text. Kopra's own statement of the gap: "We conclude by noting that
perhaps the most famous question [16] concerning Rule 30 remains unsolved. It
concerns the trace of width 1 of a single, very simple configuration… Note that
the case of trace of width 2 is covered by Theorem 3.5." (lines 553–556.)

**The test.** Run: `node explorer/parallax2_expansive.mjs` and
`node explorer/parallax2_expansive2.mjs`. Both were run; results above. The
statement for a theorist to falsify, in the project's vocabulary:

> For every `d : ℕ` and every `X : Config` with `column X 0 0 = false`, there
> is a `Y : Config` with `column Y 0 t = column X 0 t` for all `t ≤ d` and
> `column Y (-1) 0 ≠ column X (-1) 0`.

That is a real, small, provable-looking statement. Proving it *closes* the
route rather than opening one, which is why it belongs to a captain's judgement
and not to a prover's queue — but it is the honest content of what I measured,
and it is exhaustively true for `d ≤ 14`.

**What it would give.** It removes the only visible path from the published
frontier to the wall. Kopra's paper is the nearest thing in print to Prize 1,
and a reader of it will ask "why not `w = 1`?" — the answer is now measured
rather than guessed, and it is not a technicality: to reach `w = 1` you would
have to *lower rule 30's spreading speed below 1*, and the speed is exactly 1
by a closed node on the board.

**One consolation prize, and it lands exactly on the board's own frontier.**
Kopra's Lemma 3.2 (periodicity moves one cell left per application) needs
determination at *every* time. Rule 30 has it at *half* the times — the black
ones. Running his argument with that density version gives: if the centre
column is eventually `p`-periodic, its black times are a periodic set, and
column `−1` is `p`-periodic *on that set*. Which is, word for word, Talus's
recorded reduction — "the wall is exactly 'column 1, read at the *white* times
of the centre column, is eventually periodic'" (obstruction 9). Two fields'
machinery arriving independently at the same sentence is a measurement, and
what it measures is that the sentence is the real frontier.

---

### 3.3 Every Fourier coefficient of the time-`t` map lives on the left edge — so no ensemble statistic can see the centre column

**The claim.** The Boolean-function view explains, in one line, both why the
board's proved theorems all route through the left cone and why this field's
methods cannot get started: **the entire Fourier–Walsh spectrum of the map
"window ↦ centre cell at time `t`" is supported on subsets containing the
left-edge coordinate.** Every statistical functional of the ensemble that does
not read the left edge is exactly zero, and the one that does read it reads
only it.

**The dictionary.**

| Rule 30 | Analysis of Boolean functions |
|---|---|
| `window (c) t`, the `2t+1` cells that can reach the origin by time `t` | The input cube `{0,1}^{2t+1}` |
| `f_t(w) = evolveFrom (ofWindow w) t 0` | A Boolean function on `2t+1` bits |
| `blackWindowCount t = 2^{2t}` (`window_count_half`, on the board) | `f̂_t(∅) = 0`: the function is balanced |
| `rule30_leftPermutive` / `evolveFrom_leftPermutive` | `f_t(w) = w_{−t} ⊕ g_t(w_{−t+1..t})` — an affine dependence on one coordinate |
| The light cone | The support of `f_t` |
| The seed | **One point of the cube**, `(0,…,0,1,0,…,0)` |
| Prize 2 | The time average of `f_t` along *that one point* |

**Seams.**

- *The structural fact, verified exhaustively.* For `t = 1..9` the full
  Walsh–Hadamard transform of `(−1)^{f_t}` over `{0,1}^{2t+1}` puts **exactly
  zero** weight (`0.000e+0` at every `t`) on subsets not containing the
  left-edge coordinate, and `f̂_t(∅) = 0.000000` at every `t`
  (`explorer/parallax2_linear.mjs`, part 4). That is left-permutivity in
  Fourier clothing, and it re-proves `window_count_half` in one line: `∅` does
  not contain the left edge, so its coefficient vanishes.
- *The consequence, which is the point.* The correlation of the centre cell
  with **any** function of the window that does not read the left edge is
  identically zero — not small, zero, at every `t`. So every ensemble
  statistic, every correlation test, every Fourier estimate of the kind this
  field runs, returns zero from the ensemble and learns nothing. The one
  non-trivial ensemble number, `f̂_t({left edge})`, decays:
  `−0.500, 0.250, −0.250, 0.156, −0.078, 0.075, −0.069, 0.076, −0.050` for
  `t = 1..9`, and the largest coefficient of any order decays too:
  `0.500, 0.750, 0.438, 0.406, 0.223, 0.188, 0.174, 0.165, 0.090`. Rule 30
  becomes Fourier-flat: no linear approximation of any kind survives.
- *The seam that breaks the correspondence.* All of this is about the ensemble
  — the uniform measure on windows. The prize is about **one** window per `t`,
  and the board's own docstring for `window_count_half` says so: "it says
  nothing about the single-seed row, which is one window in `2 ^ (2t + 1)`."
  This is the ergodic-theory seam (a.e. versus a named point) wearing a
  different hat, and it is the same seam that stops Weyl's theorem from
  settling Mahler's problem.

**What it leans on.** The board's `window_count_half` and
`rule30_leftPermutive` (`Rule30/Statements.lean`, lines 754 and 725) for the
Lean-side statements; the spectrum computation is mine and exhaustive. No
external citation is needed and none is claimed.

**The test.** `node explorer/parallax2_linear.mjs`, part 4; run, exhaustive for
`t ≤ 9`. To kill it: exhibit `t` and a subset `S` of the window coordinates
with `−t ∉ S` and `f̂_t(S) ≠ 0`. That is impossible if `rule30_leftPermutive`
holds, so the honest statement is that this connection is *true and cheap*, and
its value is entirely in what it forbids.

**What it would give.** It touches no part of the residual. It is a **method
exclusion with a proof**: no argument that computes an average over windows,
however sophisticated, can distinguish the seed's orbit, because the ensemble
answer is exactly `1/2` at every `t` by a theorem. Any Prize-2 proposal built
on "the row looks random, so the centre is balanced" is refuted by this, and
several plausible-sounding ones are of that shape.

---

### 3.4 The Fourier profile: rule 30's column is *more* uniform than the sequences this field can prove theorems about

**The claim.** The reason the field cannot touch Prize 2 is not that rule 30's
centre column is too random. It is that it is **too random**: the field's
theorems work by locating structure and exploiting it, and the flagship
sequences it handles are measurably *less* uniform than the centre column.
Thue–Morse's largest Fourier coefficient is thirteen times rule 30's at
`N = 2¹⁹`. There is nothing for the machinery to grip.

**The dictionary.** In `ℤ/N` with `û(k) = (1/N) Σ_t u(t) e(−2πikt/N)`:

| Rule 30 | This field |
|---|---|
| Prize 2 | `\|û(0)\| = o(1)` |
| Prize 1 | no `p` with `γ(p) = 1`; equivalently a bound on `max_k \|û(k)\|` |
| The natural strengthening of Prize 2 | `‖u‖_{U²}⁴ = Σ_k \|û(k)\|⁴ = o(1)`, and `‖u‖_{U^s}` for higher `s` |
| A period-`p` tail | A spectral line of height `≥ p^{−1/2}` at some `k/p` |
| `explorer/periodscan.mjs` | One Fourier transform: all periods at once |

**Measured** (`explorer/parallax2_gowers.mjs`, `N = 2¹⁹ = 524288`; the
square-root-random floor for `max|û|` is `5.01e−3` and a random `‖u‖_{U²}` is
`0.04419`):

| sequence | `\|û(0)\|` | `max_k \|û(k)\|` | `‖u‖_{U²}` |
|---|---|---|---|
| **rule 30 centre column** | `1.41e−3` | `4.79e−3` | `0.04425` |
| Thue–Morse | `0` | **`6.35e−2`** | `0.12975` |
| Rudin–Shapiro | `1.95e−3` | `1.95e−3` (at `k=0`) | `0.03993` |
| rule 150 centre column | `1.000` | `1.000` | `1.00000` |
| xorshift (the floor) | `1.74e−3` | `4.98e−3` | `0.04416` |
| `(10)^∞` | `0` | `1.000` | `1.00000` |
| random word of period 1009 | `1.88e−2` | `6.97e−2` | `0.18912` |

The controls validate the instrument: Thue–Morse's maximum sits at
`k = 174763 ≈ N/3` and equals `6.35e−2` against the predicted
`N^{log 3/log 4 − 1} = N^{−0.2075} = 6.5e−2` — Gelfond's exponent, reproduced;
Rudin–Shapiro's maximum is exactly `2^{−9} = N^{−1/2}`, its classical
partial-sum bound; the two periodic controls read `1.000`.

**Seams.**

- *The inversion.* Rule 30's centre column is statistically indistinguishable
  from the xorshift stream in every column of that table, while Thue–Morse —
  the sequence for which Mauduit–Rivat, Konieczny and Müllner have theorems —
  is off the floor by a factor of 13 in `max|û|` and 3 in `‖u‖_{U²}`. **The
  provable sequences are the less uniform ones.** That is not a paradox: the
  automaton *is* the structure, it is what makes the exponential sum factor,
  and it also puts a floor under the sum. Rule 30's column offers neither.
- *The field's own certificate is weaker than the project's.* A measured
  `max_k |û(k)| = S` excludes every eventual period below about `1/S²`
  (a `p`-periodic tail forces a line of height `≥ p^{−1/2}`, since
  `Σ_k |W(k)|² = p²`). Here `S = 4.79e−3` gives a floor of **43,516** — with
  the caveat that the `ℤ/N` model wraps and the onset must be small compared
  to `N`, so it is a certificate of the same standing as an empirical period
  scan, not a theorem. The project's own combinatorics-on-words certificate is
  more than ten times stronger on the *same* sequence: obstruction 9 records
  that the seed's centre column has **499,949 distinct factors of length 32**
  in a tail of length `10^6`, and a `p`-periodic tail has at most `p` distinct
  factors of each length, so no eventual period below that is possible with an
  onset under `10^6`. (The `998,977` in that obstruction is a different
  sequence — column 1 of the witness `X_{(10)^∞}` — and is not a statement
  about the seed.) So the field's standard tool, applied honestly, reproduces
  less than the tool already in use here.
- *The autocorrelations agree.* Independently, at `N = 400,000`
  (`explorer/parallax2_gamma.mjs`): `max_r |γ(r)| = 0.0054` at `r = 3294` over
  `r ≤ 4096`, which is `3.4` noise units and exactly the maximum of 4096
  Gaussians; the Cesàro averages `(1/R)Σ|γ(r)|` are `0.00117, 0.00133, 0.00131,
  0.00128` at `R = 64, 256, 1024, 4096` against a noise floor of `0.00158`.
  Every block of length `≤ 12` occurs, with frequency deviations at the `N^{-1/2}`
  scale. So both routes to Prize 2 — `U¹` directly and van der Corput through
  `γ` — see pure noise, and neither is any closer to a proof for it.

**What it leans on.**

- Byszewski–Konieczny–Müllner, *Gowers norms for automatic sequences*,
  <https://arxiv.org/abs/2002.09509>, abstract fetched verbatim: "We show that
  any automatic sequence can be separated into a structured part and a Gowers
  uniform part in a way that is considerably more efficient than guaranteed by
  the Arithmetic Regularity Lemma. … In particular, we show that all automatic
  sequences orthogonal to periodic sequences are Gowers uniform."
- The *Discrete Analysis* editorial for the same paper,
  <https://discreteanalysisjournal.com/article/75201-gowers-norms-for-automatic-sequences>,
  fetched: automatic sequences are "restricted enough to have strong properties
  that are not shared by arbitrary sequences". That sentence is the whole seam.
- Konieczny, *Gowers norms for the Thue-Morse and Rudin-Shapiro sequences*,
  <https://arxiv.org/abs/1611.09985>, abstract fetched verbatim: "We estimate
  Gowers uniformity norms for some classical automatic sequences, such as the
  Thue-Morse and Rudin-Shapiro sequences."
- The Gelfond exponent `log 3 / log 4` for the Thue–Morse exponential sum is
  **UNVERIFIED as a citation** — I did not fetch a source for it; it is
  recovered here as a measurement (`6.35e−2` against `6.5e−2` predicted), which
  is why I state it as agreement rather than as a quoted theorem.

**The test.** `node explorer/parallax2_gowers.mjs`, run; `node
explorer/parallax2_gamma.mjs`, run. To kill the claim: find a frequency, a lag,
or a block length at which the centre column separates from the xorshift
control at more than the sampling noise. Nothing in `r ≤ 4096`, `k < 2¹⁹`, or
`k ≤ 12` does.

**What it would give.** It reframes Prize 2 for a captain. The project's
instinct is that Prize 2 is "easier" than Prize 1 because it is a statistical
statement. This says the opposite about *this* field's ability to help: the
field proves balance for sequences whose structure it can see, and rule 30's
column presents no structure at any order it can measure. Prize 2 has no more
purchase here than Prize 1 does.

---

### 3.5 Across Kopra's bridge, Prize 2 lands on a problem the field itself calls mysterious

**The claim.** Kopra's class contains rule 30 and the fractional multiplication
automata. In that class Prize 1's analogue is a **theorem** and Prize 2's
analogue is an **open problem of long standing**. So the bridge is a route in
the Prize-1 direction and a *warning* in the Prize-2 direction: even the most
structured member of the class — the one that is literally long multiplication
— has an open balance question.

**The dictionary.** The same table as §3.2, plus the status column:

| Member of Kopra's class | Prize 1's analogue | Prize 2's analogue |
|---|---|---|
| Rule 90 / rule 150 (additive) | **False** — the column is eventually constant (Kopra, lines 564–567; measured here to 200,000 terms) | **False** — density `0` and `1` respectively |
| `π_{3/2,6}`, multiplication by `3/2` in base `6` | **Proved** — Theorem 3.5 applies at `w = 1`, since these automata are left expansive with dimensions `(1,1,1)` and `s = log₆(3/2) = 0.226 < 1` (lines 242–243, 307–309) | **Open**, and it is the distribution-mod-1 problem |
| Rule 30 | **Open at `w = 1`** (proved at `w = 2`); §3.2 shows `w = 1` is unreachable from this framework | **Open** |

**Seams.**

- *The width-1 asymmetry has a cause and it is the speed.* The multiplication
  automata get `w = 1` because their spreading speed is `log_{pq}(p/q) < 1`,
  which buys `h = 1`. Rule 30's speed is exactly `1` (a closed node,
  `evolve_left_edge`), which forces `h = 0` and, by §3.2, `w = 2`. In the
  dictionary, rule 30's multiplier is *the base itself* — the degenerate case
  Kopra's Remark 3.6 rules out for the shift map.
- *The balance question is open there too.* Kopra opens the paper:
  "Distribution of fractional parts (i.e. distribution modulo 1) of sequences
  of the form `((p/q)^i α)_{i∈N}` for `α > 0` and integers `p > q > 1` is a
  mysterious topic as demonstrated e.g. in Chapter 3 of the book [2]. For
  example, in the case `p/q = 3/2`, it is not known whether `α > 0` can be
  chosen so that fractional parts in the whole sequence remain less than 1/2."
  (`sources/kopra-2022-natural-class.txt`, lines 26–30.) That last is Mahler's
  3/2 problem, open since 1968.
- *So the seam is not the monomial here — it is the point.* This is the
  cleanest statement I can make about why Prize 2 resists: even after you throw
  away rule 30 and keep only the nearest well-understood object in its class —
  an automaton implementing long multiplication, with a genuinely additive
  digit structure — the balance question for a *named* starting value is still
  open, for exactly the reason it is open here: Weyl gives it for almost every
  `α` and nothing gives it for one.

**What it leans on.**

- Kopra 2022, `sources/kopra-2022-natural-class.txt`, lines 26–30, 242–243,
  305–309, 316–317, 385–389, 553–567 — all quotations above are from the held
  text; arXiv:2202.13809.
- Mahler's 3/2 problem, <https://en.wikipedia.org/wiki/Mahler%27s_3/2_problem>,
  fetched: "A Z-number is a positive real number x such that the fractional
  parts of x(3/2)^n are less than 1/2 for all positive integers n." and "Kurt
  Mahler conjectured in 1968 that there are no Z-numbers." I did **not** find a
  fetched source asserting in so many words that the equidistribution or even
  the density of `frac((3/2)^n)` is unknown; the Wikipedia fetch explicitly did
  not state it, and the search
  (`Flatto Lagarias Pollington (3/2)^n density unknown`) returned
  <http://matwbn.icm.edu.pl/ksiazki/aa/aa70/aa7023.pdf> and
  <https://arxiv.org/abs/math/0611622>, whose abstract I fetched and which does
  not address it either. So the sharper form of this claim is **UNVERIFIED**;
  what is verified is Kopra's word "mysterious" and Mahler's conjecture being
  open.

**The test.** No script — this connection is a placement, not a measurement.
The statement a theorist can attack is the width-1 one in §3.2, which is what
the bridge reduces to. The falsifiable half here is: *if someone proves Prize 2
by a method that would also apply to `π_{3/2,6}`, they have settled a
distribution-mod-1 problem as a corollary.* That is a check any Prize-2
proposal can be run against in five minutes, and it is the most useful thing in
this section.

**What it would give.** Nothing towards the residual. It calibrates: it tells a
captain how much to pay for a Prize-2 proposal, which is "as much as you would
pay for progress on `(3/2)^n`".

---

## 4. Died in translation

- **Konieczny / Byszewski–Konieczny–Müllner Gowers norms for automatic
  sequences.** The theorem is exactly the shape Prize 2 wants — "any automatic
  sequence can be separated into a structured part and a Gowers uniform part"
  (<https://arxiv.org/abs/2002.09509>) — and its hypothesis is unreachable from
  both ends. The centre column is not known to be automatic, and *proving it
  non-automatic is strictly stronger than Prize 1* (my own third session: every
  eventually periodic sequence is automatic in every base; the measured floor
  if it were automatic is 130,553 states). **Seam: the theorem is conditional
  on a property whose verification already exceeds the target.**
- **Müllner's Sarnak conjecture for automatic sequences**
  (<https://arxiv.org/abs/1602.03042>, abstract fetched: "a
  Möbius-randomness-principle for automatic sequences from which we deduce the
  Sarnak conjecture for this class of sequences"). Dies twice: it needs
  automaticity, and Sarnak's conjecture is a statement about *zero-entropy*
  sequences, which the centre column is conjectured not to be. **Seam: rule 30's
  column is not a candidate object, not merely an unhandled one.**
- **Mauduit–Rivat along the primes and along the squares.** The transplant fails
  for a reason worth recording because it is not the obvious one. In that
  field, "the digit function is balanced along `ℕ`" is the *easy* step — it is
  the digit factorisation, two lines — and the theorems are about balance along
  a sparse set. For rule 30 the easy step *is* the prize. **Seam: the field's
  difficulty axis (`ℕ` → primes → squares) is orthogonal to this project's, and
  the field's starting line is past this project's finish line.**
- **The carry-propagation lemma.** In base `q`, adding a small number changes
  digit `k` with probability `q^{−k}`: short, geometric, independent, and that
  is what lets van der Corput's shift `n ↦ n+r` be handled digit by digit. The
  rule-30 analogue of "carries are short" is a bound below `1` on the speed of
  the left damage front. `crystals` A3 says no such bound is provable (worst
  case exactly `1`), and obstruction 6 says why the reset-lemma induction cannot
  reach it. **Seam: the one lemma the method cannot do without is the one thing
  the board has recorded as unavailable.**
- **The structured-plus-uniform decomposition with the settled picture as the
  structured part.** This looked like the best hope of the session: the board
  has an explicit candidate structured factor, the settled centre column
  `s(t) = S_t(0)`, built from words of period `2^k`, and BKM's theorem is
  exactly a decomposition of that shape. It is vacuous. Measured
  (`node explorer/settledwords.mjs`, 2400 diagonals): the deviation
  `e(t) = c(t) ⊕ s(t)` has density `0.491`, and at column `−1` `0.486`. The
  "structured part" agrees with the centre column at a coin's rate. **Seam:
  `(−1)^c = (−1)^s (−1)^e` makes `û_c` the convolution of `û_s` and `û_e`, and
  a structured `s` would concentrate that convolution on a few frequencies — but
  `s` carries no correlation with `c` at all, so the decomposition moves the
  whole problem into `e` and gains nothing.**
- **"Rule 30 is a nonlinear filter, so run a correlation attack."** The
  cryptanalytic frame is real (rule 30 = rule 150 with bias `1/4`) and produces
  nothing, because the piling-up decay is immediate: agreement with the linear
  model is `0.7469` at `t = 1` and inside the noise at `t = 2` (§3.1). **Seam:
  correlation attacks need a bias that survives to the observed output; here it
  survives one step.**
- **Furstenberg ×2 ×3 rigidity.** `(σ, F)` is a `ℤ²` action and rigidity
  theorems for commuting endomorphisms are the right shape for "the orbit
  closure of the seed is everything", which would give normality and hence
  Prize 2. Rules 90 and 150 *are* endomorphisms of `(F₂^ℤ, ⊕)` and the analogy
  is exact for them. **Seam: rule 30 is an endomorphism of no group — the same
  monomial that kills `q`-additivity kills this, and the fact that it is the
  same obstruction in a third unrelated field is the strongest evidence in this
  document that it is the real one.**
- **Explicit normal numbers.** Prize 2 is literally "the real
  `0.c(0)c(1)c(2)…` is simply normal in base 2", so the constructive-normality
  literature is on point. Every construction I could name is either a digit
  concatenation designed to be normal (Champernowne, Copeland–Erdős) or an
  orbit of a **linear** map — Bailey–Crandall's normality of the Stoneham
  numbers goes through the dynamics of `x ↦ 2x mod 1`. **UNVERIFIED**: I
  searched (`Bailey Crandall random generators and normal numbers Stoneham
  normality base 2`) and reached only search results, no fetch; the primary is
  <https://www.davidhbailey.com/dhbpapers/bcnormal.pdf>. **Seam: no explicit
  normal number in print is the orbit of a nonlinear map, and that is the whole
  request.**
- **Algebraic power series / Christol** (my own third session, recorded here so
  it is not chased a fourth time): the centre column's generating function over
  `F₂`, `k`-automaticity, the ideal generated by the quadratic relation. Died
  at the Hadamard product (algebraic series are closed under it and rule 30's
  own pictures have eventually periodic columns), at the linear complexity
  profile (automatic sequences already have maximal `N`th linear complexity, so
  the statistic separates nothing), and at the quantifier in subword complexity
  (`p(n) ≤ Cn` allows any `C`, so no finite sample refutes it).
- **The Fourier period certificate as a new record.** I hoped one transform
  would beat the project's period exclusions. It does not: `43,516` against the
  `499,949` that the seed's own factor complexity already gives (§3.4). I also
  got the comparison wrong the first time, reaching for the `998,977` in
  obstruction 9, which is column 1 of a *different* configuration. **Seam: the
  certificate scales as `S^{−2}` with the
  Fourier maximum, which is `N^{−1/2}`, so it grows like `N` — the same order
  as a direct scan, with a worse constant.**

---

## 5. What to hand the theorist

**One topic, and it is bounded.**

> **Rule 30 is not left expansive at width 1, at any depth.** Falsify:
> *for every `d : ℕ` and every `X : Config` with `column X 0 0 = false`, there
> is `Y : Config` with `column Y 0 t = column X 0 t` for all `t ≤ d` and
> `column Y (-1) 0 ≠ column X (-1) 0`.*
>
> **The dictionary row it depends on:** Kopra's left expansivity with
> dimensions `(h, d, w)` ↔ "a `w`-wide, `(h+d+1)`-tall block of the picture
> determines the cell to its left"; rule 30's spreading speed is exactly `1`
> (`evolve_left_edge`), so Kopra's `s < 1/h` forces `h = 0`, and at `h = 0`
> only `w = 2` is available from left permutivity. This statement is the
> missing `w = 1` case.
>
> **What settles it:** exhaustive enumeration says it is true for `d ≤ 14`
> (`explorer/parallax2_expansive.mjs`), with the sharper form — the determined
> column words are *exactly* those with a black anchor, at every depth and
> every height — exhaustive for `d ≤ 11`, `h ≤ 5`
> (`explorer/parallax2_expansive2.mjs`). The black half is already the board's
> `column_succ_of_black`; the content is the white half, and the construction
> to find is the compensating configuration. The witnesses at small `d` are
> explicit and suggestive: at `d = 4`, the windows `011100000` and `000001000`
> (positions `−4..4`) share the column word `01100` and differ at position `−1`.

I would spend a theorist's session on this and on nothing else in this
document. It is small, it is almost certainly true, it is provable-looking, and
what it buys is a *closed door with a sign on it*: the nearest published result
to Prize 1 cannot be pushed to Prize 1, and the reason is a speed that a closed
node already pins at exactly 1. That is worth having written down before the
next connector or theorist spends a session rediscovering Kopra's paper and
asking why not `w = 1`.

**And one thing to hand a captain rather than a theorist**, because it is a
filter, not a lemma: §3.1's exclusion. *Any proposed argument for either prize
whose reasoning survives replacing `OR` with `XOR` is refuted on sight*, because
rule 150's centre column is constantly `1` and rule 90's is eventually `0`. This
costs nothing to apply and it rejects the entire Mauduit–Rivat family, the
entire automatic-sequence family, and every rigidity argument, without reading
them.

---

## 6. Next vantage

**Attack from the thermodynamic formalism of one-dimensional lattice systems:
transfer operators, Gibbs measures, and the pressure function — specifically
the theory of *g*-measures and Bowen's condition for a unique equilibrium
state.** Here is why, and why I could not do it from where I stood. Everything
in this document ran into the same wall from four directions: the field's
theorems describe an *ensemble* (a measure) and the prize is about a *point*
(the seed). The one branch of dynamics whose whole business is manufacturing
statements about individual orbits from an ensemble is the thermodynamic
formalism: a Gibbs measure with enough regularity gives every point of a full
set the frequency statistics of the measure, and — this is the part I could not
reach — the *specification* and *bounded-distortion* conditions that make the
argument work are conditions on the transfer operator of the subshift, which
for rule 30 is the de Bruijn/preimage structure that Fukś's paper and the
board's `window_count_half` already describe. The `1/4` density of the `c·r`
firings, measured here at every scale, is exactly a potential function's
expectation, and the board has the four-preimages fact that would give bounded
distortion its constant. I could not get further because the seed is a
non-generic point *by construction* — it is the boundary of the cone — and
asking whether it is generic for the maximal-entropy measure requires knowing
whether the transient band has a limiting empirical measure at all, which is a
question about `E = picture ⊕ S` that nothing on the board addresses. That is
the vantage: someone who knows Bowen, Walters and the `g`-measure literature
should ask whether rule 30's picture is a Gibbs state for a Hölder potential,
and if so, whether the seed's column is generic for it.

**And one I could reach but deliberately did not: additive combinatorics of the
damage front.** The carry-propagation lemma is the one piece of the
Mauduit–Rivat method with a real rule-30 counterpart, and the counterpart is a
bound below `1` on the speed of the left damage front. `crystals` A3 says no
such bound is provable in general; the front's local law is on the board
(`rule30_left_local_law`); the measured speed is `0.20–0.24`; and the pair whose
front matters — the seed against the settled row — is *special*, being a pair
whose common left part is entirely power-of-two periodic. Nobody has attacked
that specialness. A connector who came at the front from percolation theory or
from first-passage-time estimates, rather than from analytic number theory,
would be looking at the single object that this whole field needs and cannot
supply.
