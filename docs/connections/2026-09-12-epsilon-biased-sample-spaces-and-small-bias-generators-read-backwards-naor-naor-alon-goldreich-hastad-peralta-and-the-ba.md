# Epsilon-biased sample spaces and small-bias generators, read backwards

*A sighting, not a proof. Vernier, 2026-09-12.*
*Problem: `centerColumn_other_isEventuallyPeriodic_of_center` — which, given Jen's
theorem, is Prize 1. Vantage handed over by Rosetta, aimed at Prize 2.*

**The one-line verdict, because the brief asked for it at hour one rather than
hour five.** *The duality does not hold in the form the vantage states it, and it
fails for a reason the field itself names.* The equivalence "ε-balanced code ⟺
dual of an ε-biased set" is a statement about **linear** codes, and rule 30's
reachable set is measurably not linear — its index in its own affine hull is
`4, 16, 32, 64` at `t = 2,3,4,5`. So the vantage's stated move is unavailable.
But the *backwards* reading survives and is the better half: the reachable set is
a **sample space**, and in that reading the field's sufficient condition for
balance has a name, rule 30 fails it, and the failure has a *reason* rather than
a measurement. The name is **resiliency**, the mechanism is **one-sided
permutivity**, and the reason is **Siegenthaler's bound at three variables**.
Section 3.3 is the deliverable; everything else is scaffolding around it.

---

## 1. The problem, seen from outside

A deterministic rule updates an infinite row of bits: each new bit is
`left XOR (centre OR right)` of the three bits above it. Start from a row that is
all `0` except a single `1`, and stack the rows downward into a picture. Read the
one column of bits standing directly under the original `1`. Everything about
this column is measured and nothing is proved: it looks like a fair coin to every
test anyone has run, it has maximal subword complexity to length 14, and the open
statement is that it **never becomes periodic** — there is no `p > 0` and no `N`
with `c(n+p) = c(n)` for all `n ≥ N`. The companion statement, Prize 2, is that
the fraction of `1`s among the first `N` bits tends to `1/2`. Neither is known.
The picture is deterministic and the object is one named bit string, not a random
one.

**Restated in this vantage's own terms.** A *small-bias generator* is a map
`G : {0,1}^s → {0,1}^n` whose output distribution has small **bias**: for every
non-empty set `T` of output positions, the parity of the bits in `T` is nearly
unbiased. Rule 30 is a generator of exactly this shape — seed the row, iterate,
read a coordinate — and it is the generator Wolfram proposed as a cipher. The
prize asks nothing about the distribution. It fixes **one seed**, namely the
single `1`, and asks about the bias of **one output string** along the *time*
axis: writing `c` for the centre column, Prize 2 is

> `| Σ_{t<N} (−1)^{c(t)} | = o(N)`,

which is the bias of the sample space "pick `t` uniformly in `[N]`, output `c(t)`"
at the one non-trivial character of `F_2`. Prize 1 does not follow from that
alone — a period-4 word can have density exactly `1/2` — but it *does* follow
from the same statement at every block length: a sequence of eventual period `p`
has at most `p` distinct blocks of each length, so small bias at every block
length (equivalently, normality) kills periodicity outright. So the ladder this
vantage climbs is: **bias at block length 1 is Prize 2 exactly** (Chorobates),
and **bias at all block lengths implies Prize 1**. That is why a vantage aimed at
Prize 2 is also aimed at the node.

The field's objects are distributions and sets. The prize's object is a point and
a sequence. Every seam below is a version of that.

---

## 2. Fields sighted

| Field / theory | The object there that matches something here | The seam, in one line |
|---|---|---|
| ε-biased sample spaces (Naor–Naor, AGHP) | The distribution of row `t` under a uniform configuration | Bias is **exactly 0** off the left cone band and **exactly 1** on its edge; the prize reads the band's midpoint |
| ε-balanced codes (Ta-Shma) | The reachable rows as a code in `F_2^{2t+1+…}` | The duality with small bias needs **linearity**; the set's index in its own affine hull is `4,16,32,64` |
| Resiliency / correlation immunity (Siegenthaler, Xiao–Massey) | Rule 30's local rule as a 3-variable Boolean function | Rule 30 is **0-resilient**: correlation `1/2` with its left input. This is the deliverable |
| Permutive cellular automata as resilient combiners (Leporati–Mariot) | Bipermutivity ⟹ 1-resilient | Rule 30 is permutive on **one** side, and the cone pins that side |
| Stream-cipher cryptanalysis (Meier–Staffelbach 1991) | Rule 30 as a keystream generator, and its break | The break is a statement about *seeds*; the prize fixes one |
| Linear complexity / Berlekamp–Massey (the LFSR branch of Naor–Naor) | The centre column as a keystream | `L(4096) = 2049`, maximal — and **so is Thue–Morse's**, which is provably balanced. Undiscriminating |
| Weil character sums (AGHP's quadratic-character construction) | A single explicit balanced sequence | Needs `c(t) = χ(f(t))` for an algebraic `χ, f`; rule 30 gives a nonlinear **orbit readout** |
| Expander-walk codes (Ta-Shma 2017) | The row as the label sequence of a walk on the reachable-set automaton | The walk is **deterministic and single** for the seed; and the automaton has no bounded description (obstruction 11) |
| Balanced codes with a balancing bit (Knuth) | An explicit construction forcing weight `n/2` | Balance is *enforced by a redundant coordinate*; rule 30 has none, its balance is an accident |
| Low-autocorrelation binary sequences / merit factor | One explicit binary sequence with small correlations | The branch where "a single sequence" is the object — and the only proofs there are for Legendre and m-sequences |
| Almost `k`-wise independence | "All characters of weight ≤ k are unbiased" | Rule 30's row has bias `1` at a **weight-1** character (the cone edge), so `k = 0` |
| Garden-of-Eden / preimage counting (Amoroso–Cooper, Fukś) | The reachable set's `4^{-t}` density | Density `4^{-t}` is *huge* by this field's standards; its objects are exponentially small sets |
| Hardness vs randomness (Nisan–Wigderson) | P2 is P3 restricted to one distinguisher: "count the ones" | The field has **no** "analyse a given generator" branch; every bias theorem is a *construction* theorem |
| Discrepancy theory (Erdős discrepancy, Tao) | Theorems forcing *imbalance* of any ±1 sequence | Points the wrong way: they produce lower bounds on discrepancy, not upper |

---

## 3. Connections

### 3.1 The duality as stated, fetched, and the hypothesis it fails: linearity

**The claim.** The vantage's premise — "a proof of row balance is a proof that
the reachable set is an ε-balanced code, and small-bias theory is where that is a
theorem" — is true as a *translation* and useless as a *route*, because the
translation that carries the field's machinery runs only over linear codes, and
rule 30's reachable set is not one; it is not even close, and the distance is
computable.

**The dictionary.**

| This project | Small-bias / coding theory | |
|---|---|---|
| Configurations supported in `[0,m)` with cell `0` black | The message space `F_2^{m-1}` | `2^{m-1}` messages |
| Row `t` of such a configuration, packed, `N = m+2t` bits | A codeword in `F_2^N` | bit `i` is the cell at position `i − t` |
| The reachable set `A_t(m)` | A **non-linear** binary code of length `N`, size `2^{m-1}`, rate `(m−1)/N` | rate `→ 1` at fixed `t` |
| Pre-injectivity (crystal 4) | The encoder is injective | measured: `2^{m-1}` distinct rows at every `(m,t)` tried |
| "Every reachable row is balanced" | `A` is an ε-balanced code | the exact translation, and it is **false** |
| ε-balanced **linear** code | Dual of an ε-biased set | the only form the machinery has |
| **Seam** | `A` is not affine: `\|hull\|/\|A\| = 4, 16, 32, 64` at `t = 2,3,4,5` | so `A` has no dual to be an ε-biased set |
| **Seam** | Weight fractions over `A` run `[0.1875, 0.9375]` at `(m,t)=(12,2)`, `[0.190, 0.857]` at `(13,4)` | ε-balanced for no `ε < 0.43`, reproducing Rosetta |
| **Seam** | Minimum distance of `A` is **1**, at every `(m,t)` where it was computed | a single right-edge flip; `rightmost_difference_moves_right` |
| **Seam** | Sextant's `4^{-t}` obstruction exhibits a reachable row of density `0.971875` | the failure is not marginal |

**What it leans on.** The equivalence, fetched at
`https://eccc.weizmann.ac.il/report/2017/041/` (Ta-Shma, *Explicit, almost
optimal, epsilon-balanced codes*), abstract, verbatim: *"The question of finding
an epsilon-biased set with close to optimal support size, or, equivalently,
finding an explicit binary code with distance `(1−ε)/2` and rate close to the
Gilbert-Varshamov bound, attracted a lot of attention in recent decades."* The
definitions, fetched at `https://arxiv.org/html/2601.12606` (*Explicit
Almost-Optimal ε-Balanced Codes via Free Expander Walks*), Definition 2.2,
verbatim: *"We will say that a string `x∈{±1}ⁿ` has bias `ε` if
`bias(x) ≔ |E_{i∈[n]} x_i| = ε`."* and, immediately after, verbatim: *"We say
that a **binary linear code** `𝒞⊆{±1}ⁿ` has bias `⩽ε` if for all `x∈𝒞∖{1ⁿ}`,
`bias(x)⩽ε`."* — the word "linear" is in the definition itself, and that is the
hypothesis rule 30 fails. The construction of the duality, fetched at
`https://ar5iv.labs.arxiv.org/html/1205.6218` (Ben-Aroya–Ta-Shma), verbatim:
*"Given an ε-biased set `S`, the truth table of each parity function yields a
string in `𝔽₂^|S|`. Each string is nearly balanced with Hamming weight between
`(1−ε)|S|/2` and `(1+ε)|S|/2`. An ε-biased set `S ∈ 𝔽₂ⁿ` yields a `(|S|,n,d)`
code with distance `d=(1−ε)|S|/2`."* — note the shape: the **set indexes the
coordinates** and the **characters index the codewords**. That is what "read
backwards" has to mean, and 3.2 does it.

**The test, run.** `explorer/vernier2_reach.mjs`, eleven `(m,t)` points from
`(8,2)` to `(12,5)`. Injectivity holds at all eleven; `isAffine` is false at all
eleven; hull index `4,4,4,16,16,16,32,32,64,64,32`; weight spreads as tabled;
`dmin = 1` wherever the `O(|A|²)` pass was affordable. **A theorist should try to
falsify:** *for every `t ≥ 1` there is an `m` and two configurations supported in
`[0,m)` whose rows at time `t` differ in exactly one cell* — measured true at
every point here, and it should follow from the right-edge shield family of the
`centerColumn`-separation obstruction.

**What it would give if it held.** Nothing: it does not hold. What its failure
gives is a fence with a number on it — the reachable set is `2^{2t+1−d(t)}` times
sparser than its own affine hull, with `d(t) = 2,3,3,4,5,6` at `t = 1..6`
(independently recomputed here and agreeing with Rosetta's `d(t)` value for
value), so every theorem in the field that begins "let `C` be a linear code"
misses by a factor that grows with depth.

### 3.2 Read backwards properly: the set is a sample space, its bias is exactly the cone, and the centre column is read at the band's midpoint

**The claim.** Done in the direction the duality actually runs — set indexes
coordinates, characters index codewords — rule 30's reachable set is a **perfect**
(bias exactly zero) sample space on every coordinate outside the left cone band,
a **maximally biased** one on the band, and the centre column is read at the
exact midpoint of the band. The good half is a coordinate-permuted Hadamard code
and is worthless to the field; the bad half is where the prize lives.

**The dictionary.**

| This project | Small-bias sample spaces | |
|---|---|---|
| Uniform configuration, cell `0` black, cells `1..m−1` free | The seed of a generator, `m−1` bits | |
| Row `t` | The generator's `N = m+2t` output bits | |
| `bias(γ) = \|E_c (−1)^{γ·row_t(c)}\|` | The bias of the sample space at character `γ` | |
| Positions `≥ t+1` of the row (bits `2t+1..N−1`) | Coordinates on which the output is **exactly uniform** | measured: the map is a **bijection** at every `(m,t)` tried |
| Every `γ` supported there | bias **exactly `0`** | all `2^{m−1}−1` of them, at all eleven points |
| Positions `−t..t` (bits `0..2t`), the left cone band | Coordinates carrying **all** the bias | `2t+1` of them |
| `γ = e_0` (the left cone edge) | bias **exactly `1`**; the backwards code contains the **all-ones** word | `evolve_left_edge` |
| `γ = e_1`, `γ = e_2` | bias `1` as well | `evolve_left_second_diagonal`; diagonal 2 is the first eventually-white one |
| Bit `k` of row `t` | Left diagonal `k` at index `t−k` | `leftDiagonal k j = evolve (j+k) (−j)` |
| The per-bit bias profile | The **settling profile of the left diagonals** | `1,1,1,.25,1,0,.41,.20,.16,0,0,…` at `t=4` |
| The affine relations of `A` | Exactly: `bit0=1`, `bit1=1`, `bit2=0`, `bit4=1` (`t≥4`), `bit3⊕bit6=0`, `bit5⊕bit6=0` (`t=6`) | i.e. *the settled left diagonals are the seed's* — crystal 49 in Fourier clothes |
| **The centre column**, `centerColumn t = evolve t 0` | **bit `t` of row `t`** — the exact **midpoint** of the biased band `[0,2t]` | never in the unbiased region, at any `t` |
| The backwards code off the band | A coordinate-permuted **Hadamard code**: length `2^{m−1}`, dimension `m−1`, every weight exactly half | perfectly balanced, and rate `log N / N` — useless |
| **Seam** | The field wants an ε-biased set of size **much smaller** than `2^n`; `A` has density `4^{-t}`, a constant at fixed `t` | wrong parameter regime by an exponential |
| **Seam** | At the prize's own parameters (`m = 1`) the set is a **single point**; a point has bias `1` at every character it is not orthogonal to | the regime that killed the previous session |

**What it leans on.** Internally: `rule30_leftPermutive` and
`evolveFrom_leftPermutive` (both closed), which give the bijection: the row cell
at position `p` is a XOR in the configuration cell at `p − t`, so the map from
free cells `1..m−1` to row positions `t+1..m−1+t` is triangular with unit
diagonal, hence a bijection, hence the restricted distribution is exactly
uniform. Externally, the duality quote of 3.1. **This is a proof of Rosetta's
Fourier fence**, which that document marked as measured: the fence "all Fourier
mass sits on bits `0..2t`" is the exact complement of the bijection above, and it
is two lines from a theorem already on this board rather than a computation.

**The test, run.** `explorer/vernier2_reach.mjs`: full Walsh–Hadamard transform
over all `2^N` characters at eleven `(m,t)` points with `N ≤ 22`. At every one,
**every** off-band character has bias exactly `0` (`offBandZero == offBandChars`,
e.g. `2047/2047` at `(12,3)`), and `systematic == true`. The engine was validated
against the board's own kernel-checked prefix: it reproduces
`1,1,0,1,1,1,0,0,1,1,0` for the centre column, which is the `decide`-checked list
at the foot of `Rule30/Basic.lean`. **A theorist should try to falsify:** *for
every `t`, every `m`, and configurations white at every `x < 0`, the restriction
of row `t` to positions `x ≥ t+1` determines the configuration.* That is a
seedable node, size S–M, needing only `evolveFrom_leftPermutive` and an induction
downward from the right edge; and its Fourier corollary is Rosetta's fence.

**What it would give.** It touches no part of the residual and it is worth having
anyway, for the sentence it licenses: **the centre column is read at the one
place in the row where this field's machinery is exactly blind** — the midpoint
of a band of width `2t+1` on which the bias is `1` at the edges, and it is never
read in the region where the bias is provably `0`. That is crystal 69's "the
centre column outruns the settling front" and obstruction 1's "index zero is in
the transient of every diagonal", in a third vocabulary, with an exact boundary.

### 3.3 The named failed condition: rule 30 is 0-resilient, the cone pins its one permutive side, and Siegenthaler says no elementary rule could do better

**This is the deliverable.** The brief asked which of the field's sufficient
conditions for small bias rule 30 fails, and for a *reason* rather than a
measurement. The condition is called **`m`-resiliency**; rule 30 has `m = 0`; the
structural cause is that rule 30 is permutive on exactly one side; the prize's
cone hypothesis pins exactly that side; and **Siegenthaler's bound at three
variables says no nonlinear elementary rule could have done otherwise.** The
board already owns the theorem the field would prove — `window_count_half` — and
it is already known there to be useless, for exactly this reason.

**The claim, in one sentence.** Balance of the centre cell over the configuration
family is *free* and *proved* when the leftmost window cell is averaged over
(`window_count_half`), because left-permutivity makes the centre cell a XOR in
that one cell; the cone hypothesis of Prize 1 and Prize 2 sets that cell to white;
and rule 30, being permutive on no other side, has nothing left — so the bias
reappears and does not decay, sitting `190` to `1800` times above the
random-function null at depth `19`–`24`.

**The dictionary.**

| This project | Boolean-function cryptography | |
|---|---|---|
| `rule30_eq`: `l XOR (c OR r)` | A 3-variable Boolean function, ANF `l ⊕ c ⊕ r ⊕ cr` | balanced; nonlinearity `2`; degree `2` |
| `rule30_leftPermutive` (closed) | Permutive in the leftmost variable: `f = l ⊕ g(c,r)` | measured `true` |
| Rule 30 is **not** right-permutive (obstruction 11's correction) | `f` is constant in `r` whenever `c = 1` | measured `false` |
| Correlation of the output with each input | `1/2` with the **left** input, `0` with centre and right | so **correlation immunity order 0**, **resiliency 0** |
| `window_count_half` (**proved**) | "The depth-`t` window generator is unbiased at the centre coordinate" | exactly half of `2^{2t+1}` windows give a black centre |
| Its proof (`flipFirst`, a fixed-point-free involution) | The standard resiliency argument: pair `x` with `x ⊕ e_i` at a permutive coordinate | the same two lines the field writes |
| The **cone**: white at every `x < 0` | Conditioning the sample space on the permutive coordinate | and conditioning is exactly what destroys resiliency |
| Measured bias of the centre cell under the cone | `1, 1, .25, 1, .25, .25, .797, .023, .656, .164, …` for `t=1..10`; `.322, .145, .210, .101, .493, .038` at `t=19..24` | null `√(2/π)·2^{−t/2}`; ratios `292, 186, 382, 258, 1789, 193` |
| The **bipermutive** rules `90, 105, 150, 165` | 1-resilient (Leporati–Mariot) | cone-conditioned bias **exactly `0.00000`** at every `t ≤ 18` |
| Rule **86**, rule 30's mirror | Right-permutive only | cone-conditioned bias **exactly `0`** at every `t ≤ 12` — the check is **not** mirror-symmetric |
| Rule `45` (left-permutive, nonlinear) | 0-resilient | bias `0.03`–`1.00`, like rule 30 |
| Siegenthaler's bound at `n = 3` | `m`-resilient with degree `d` forces `m + d ≤ n − 1 = 2` | so `m ≥ 1` forces `d ≤ 1`: **affine** |
| Hence | **No nonlinear elementary rule is 1-resilient** | the 4 bipermutive rules are exactly 4 affine rules |
| **Seam** | Right-permutivity is **sufficient** and **not necessary**: `31` rules have bias `0` for all `t ≤ 12`, `16` are right-permutive | `4, 23, 55, 68, 70, 71, 132, 196, 198, 199, 200, 203, 216, 232, 248` do it by an unidentified mechanism |
| **Seam** | This is a statement about the family, and the prize's configuration is **one point** of it — the point `u = 0` | the bias says nothing about the seed's own column |
| **Seam** | Rule 60 is 1-resilient *and* has cone-conditioned bias `1` at every `t` | because its permutive side is the **left** one, the one the cone pins — so "resilient" is the wrong condition, "*permutive on the unpinned side*" is the right one |

**What it leans on.** Fetched at `https://arxiv.org/html/2405.02875v1` (*Insights
Gained after a Decade of Cellular Automata-based Cryptography*), verbatim:
*"the algebraic normal form of rule 30 is `f(x₁,x₂,x₃)=x₁⊕x₂⊕x₁x₂⊕x₃`; thus, it
depends linearly on the rightmost variable `x₃`."* — **their `x₃` is our left
neighbour**; the orientation convention is opposite to this project's, the mirror
is rule 86, and the board's proved `rule30_leftPermutive` fixes ours. Same page,
verbatim: *"Meier and Staffelbach's attack can be carried out efficiently because
rule 30 does not satisfy first-order correlation immunity."* And, the theorem
that makes the failure structural, verbatim: *"Martin [43] showed by an
exhaustive search that no elementary local rules are simultaneously nonlinear and
first-order correlation immune."* And: *"Leporati and Mariot proved that
bipermutive rules are 1-resilient, i.e., balanced and first-order correlation
immune."* (Both of those last two are quoted from a **secondary** source; the
primary papers were not fetched.) The definitions, fetched at
`https://boolean.wiki.uib.no/Correlation_immunity_and_resiliency_of_Boolean_functions`,
verbatim: *"The Boolean function `f` is `m`-th order correlation immune if and
only if `f̂(u) = 0`, for all `u ∈ F₂ⁿ`, s.t. `1 ≤ wH(u) ≤ m`"*, *"Balanced `m`-th
order correlation-immune functions are called `m`-resilient functions"*, and
*"An `n` input 1 output, `m`-resilient Boolean function with algebraic degree `d`
satisfies the inequality: `m + d ≤ n − 1`"*. Confirmed independently at
`https://en.wikipedia.org/wiki/Correlation_immunity`, verbatim: *"The correlation
immunity `m` of a Boolean function of algebraic degree `d` of `n` variables
satisfies `m + d ≤ n`."* and *"If the function is balanced then `m + d ≤ n − 1`."*

**Martin's claim, checked rather than accepted, and it needs one word added.**
Run over all 256 rules (`explorer/vernier2_relations.mjs`): `240` are nonlinear,
`18` are first-order correlation immune, and **eight are both** — `24, 36, 66,
126, 129, 189, 219, 231`. Every one of the eight is **unbalanced** (weights `2`
or `6` out of `8`). So the sentence as fetched is false as literally stated and
true as soon as "balanced" is inserted, i.e. the correct statement is *no
elementary rule is both nonlinear and 1-**resilient***, which is precisely
Siegenthaler's bound at `n = 3` and needs no exhaustive search at all. The four
bipermutive rules `90, 105, 150, 165` all have nonlinearity `0` — **bipermutive
and affine coincide over the elementary rules** — which is the same corollary
from the other side.

**The test, run.** `explorer/vernier2_resilient.mjs` and
`explorer/vernier2_criterion.mjs`. The cone-conditioned family is: cells `< 0`
white, cell `0` black, cells `1..t` free, output the cell at position `0` at time
`t`. Over all `2^t` members, exhaustively, to `t = 18` for nine rules and to
`t = 24` for rule 30; and over all **256** rules to `t = 12`. Right-permutivity
implies bias exactly `0` with **no exception in 256 rules**. Rule 30 is not in the
zero set and rule 86 is, so an orientation error cannot pass the check — which
matters here, because the only fetched source states rule 30's ANF in the
opposite convention. **A theorist should try to falsify, and it is the topic I
would spend the session on:** *if the elementary rule `R` is permutive in its
right variable, then for every `t` the number of configurations supported in
`[0,t]` with cell `0` black whose cell at position `0` at time `t` is black is
exactly `2^{t−1}`* — the mirror of `window_count_half`, provable by the same
`flipFirst` involution applied at the other end of the window, and its content
for this project is entirely the **contrapositive**: rule 30 is not such a rule,
and that is why the cone costs what it costs.

**What it would give.** Not a step toward the residual — it is a fence, and a
sharp one. It converts "a lemma about the centre column that does not mention the
left cone cannot close this" (obstruction 2, recorded as a reading) into a
*mechanism with a name in another field*: the cone is the conditioning that
destroys the generator's only resilient coordinate, and no elementary rule could
have had a second one without being affine. It also explains, rather than merely
records, why `window_count_half` is proved and useless, and why crystal 40 (pin
the **right** half and the centre column becomes completely free) and this
measurement (pin the **left** and the centre cell stays biased) are two halves of
one asymmetry.

### 3.4 The LFSR branch (Naor–Naor's lineage): rule 30 fails it maximally, and the failure is worth nothing

**The claim.** The oldest small-bias construction is a linear feedback shift
register with a random connection polynomial, and its bias bound is a counting
argument over polynomial factorisations that needs the recurrence to be linear.
The field's quantitative measure of "how far is this sequence from LFSR-generated"
is the **linear complexity**. Rule 30's centre column has the maximal value, so
that branch is vacuous — and the reason to record this connection is that the
failure turns out to be **evidence of nothing**, which is the more useful half.

**The dictionary.**

| This project | Stream ciphers / small bias | |
|---|---|---|
| The centre column `c(0..N−1)` | A keystream | |
| The shortest LFSR generating it | Linear complexity `L(N)`, by Berlekamp–Massey | |
| Measured, `N = 4096` | `L = 2049` | maximal; a random sequence gives `≈ N/2` |
| Naor–Naor's construction | Linear recurrence + random irreducible polynomial; bias bounded by the factor count | needs **linearity** and **randomness over the polynomial**; rule 30 has neither |
| **Seam, and it is the point** | **Thue–Morse** gives `L = 2048`; rule 90's column 1 gives `L = 2048` | both are automatic, both are trivially analysable, and Thue–Morse is *provably* balanced |
| **Seam** | `splitmix64` bits give `L = 2048`; a period-37 word gives `L = 37` | so the statistic separates periodic from everything else and nothing else |
| **Seam** | My first control, `xorshift32`, gave `L = 32` — because xorshift is `F_2`-**linear** | a control that measured the control |

**What it leans on.** For the construction lineage and its sizes, fetched at
`https://ar5iv.labs.arxiv.org/html/1205.6218`, verbatim: *"Depending on how `ε`
scales with `n`, the best known constructions yield sets of size `O(n/ε³)`,
`O(n²/ε²)`, and `O((n/ε²)^{5/4})`."* The three sizes are Naor–Naor's, AGHP's
powering construction and AGHP's quadratic-character construction respectively.
**UNVERIFIED:** the specific claim that Naor–Naor's bias bound rests on counting
irreducible factors of the character's polynomial. Searched for the primary — the
AGHP paper at `https://www.tau.ac.il/~nogaa/PDFS/aghp4.pdf` was fetched and
returned undecodable binary (222 KB of PDF), and no HTML version of either
Naor–Naor 1993 or AGHP 1992 was found; I lean on the three sizes above and on the
standard account, and mark the mechanism unfetched.

**The test, run.** `explorer/vernier2_lincomp.mjs`, Berlekamp–Massey over `F_2`
at `N = 4096`, six sequences, two independent nonlinear-PRNG seeds. **A theorist
should try to falsify:** nothing — this connection exists to be killed, and 3.4's
whole value is the Thue–Morse row. Anyone reaching for "the centre column has
maximal linear complexity, therefore it is hard" is reaching for a statistic that
Thue–Morse also has.

**What it would give.** Nothing toward the residual. It fences one branch of the
field and, more usefully, it adds a third instance to this board's growing list of
"maximal-looking complexity statistics that an easy sequence also has", beside
Talus's rule 90 witness (aperiodic and `O(log n)`) and the maximal subword
complexity that crystal 73 already prices at zero.

### 3.5 The parameter regime, and why even the field's *positive* theorems point away

**The claim.** Set aside every failed hypothesis above and grant, for the sake of
argument, that some theorem of this field applied to rule 30's reachable set. It
would still say nothing, because the field's theorems are all of the form "a
*random* element of this set is balanced", the set here is enormous, and the
prize's element is one named point that is measurably *not* typical.

**The dictionary.**

| This project | Small-bias / expander-walk codes | |
|---|---|---|
| Reachable set at depth `t`, density `4^{-t}` in `F_2^N` | An ε-biased set | the field wants support `O(k/ε²)`, i.e. **exponentially small**; `4^{-t}` at fixed `t` is a constant fraction |
| Ta-Shma's construction | Codewords are label sequences of walks on an expander; balance comes from the mixing lemma | the walk is **random**; rule 30's is one deterministic orbit of one start state |
| The reachable-set automaton, `3, 7, 16, 35, 71, …` states | The graph the walk runs on | it has **no bounded description** — obstruction 11's non-contracting nucleus |
| The prize's configuration | One codeword | `m = 1`: the set **degenerates to a point** |
| Exceptional set of unbalanced rows | "Failure probability", which the field discards | it is **non-empty and constructible**: Sextant's row of density `0.971875` at `t = 40`, and the planted `10011` ring at density `0.6` |
| **Seam** | Every bias theorem in print is a theorem *about a construction the author designed*; there is no "given this generator, bound its bias" branch | that is the whole answer to the vantage's question, and it is a statement about the field rather than about rule 30 |

**What it leans on.** Fetched at `https://arxiv.org/html/2601.12606`, verbatim:
*"The classical Gilbert–Varshamov (GV) bound guarantees the existence of a binary
code family with relative distance `⩾1/2−ε` and rate `Ω(ε²)`."* — the regime is
rate `Ω(ε²)`, vanishing; rule 30's reachable code has rate `→ 1`. And, on the
mechanism of the best construction, verbatim: *"Ta-Shma's construction was based
on starting with a good code and amplifying its bias with walks arising from the
`s`-wide-replacement product"* — an amplification of an existing designed code,
not an analysis of a given object.

**The test.** No script; this is a reading of the three dictionaries above and of
the board's own numbers. **A theorist should try to falsify:** nothing here is
falsifiable, which is the honest label for it — it is the field-shaped version of
Portage's and Parallax's "the field owns the array and the prize owns a
diagonal", and it earns its place only because it is the reason the *positive*
half of 3.2 cannot be pushed.

---

## 4. Died in translation

- **The vantage's headline duality, in its stated form.** "A proof of row balance
  is a proof that the reachable set is an ε-balanced code, so small-bias theory
  applies." Died at the fetched definition: the field's definition of an
  ε-balanced code says *"binary **linear** code"* in the definition itself
  (arXiv:2601.12606, Def. 2.2), and the reachable set's index in its own affine
  hull is `4, 16, 32, 64` at `t = 2,3,4,5`. Rosetta marked the duality
  UNVERIFIED and was right to; it is real, and its hypothesis is the one that
  fails.
- **"Right-permutivity is equivalent to cone-conditioned balance."** Mine, stated
  in a script's own header before it was run, and **false in one direction**.
  Over all 256 rules to `t = 12`: `31` rules have bias exactly `0` and only `16`
  are right-permutive. Right-permutivity is **sufficient with no exception**; the
  extra fifteen are `4, 23, 55, 68, 70, 71, 132, 196, 198, 199, 200, 203, 216,
  232, 248`, and I have no mechanism for them. The sufficient half is what 3.3
  uses; the "iff" was an hour's overreach.
- **"Resiliency of the local rule is the right condition."** Died at **rule 60**,
  which is 1-resilient (`ci = 1`, balanced) and whose cone-conditioned bias is
  exactly `1.00000` at every `t ≤ 18` — because rule 60 is permutive on the
  *left*, the side the cone pins. The field's condition is side-blind and the
  prize's hypothesis is not. The right condition is "permutive on the side the
  hypothesis leaves free", which the field has no name for.
- **"Martin showed no elementary rule is simultaneously nonlinear and
  first-order correlation immune."** Fetched verbatim, and **false as literally
  stated**: `24, 36, 66, 126, 129, 189, 219, 231` are all eight of them nonlinear
  and first-order correlation immune. All eight are unbalanced, so the statement
  is true with "balanced" inserted — at which point it is Siegenthaler's bound at
  `n = 3` and needs no search. Recorded because a fetched quote is evidence and
  not a fact.
- **"Maximal linear complexity is evidence the centre column is hard to
  analyse."** Died against Thue–Morse, which has `L(4096) = 2048`, the same
  maximal value, and whose balance is a two-line induction. Rule 90's column 1 —
  Talus's aperiodic-and-`O(log n)` witness — has it too.
- **"`xorshift32` is a coin."** It is `F_2`-linear, so Berlekamp–Massey returned
  `L = 32` and my first linear-complexity table had a null that measured the
  null's own construction. Replaced by `splitmix64`, which gives `2048`. The
  number was true of what it measured.
- **"The reachable set might be an interesting ε-biased set even if not a
  balanced code."** Died on the parameter regime: the field's objects have
  support `O(k/ε²)` — exponentially small — and `A_t(m)` has density `4^{-t}`, a
  *constant* at fixed `t`. A set of constant density being ε-biased is not a
  theorem anyone wants.
- **"Small bias off the cone band might be non-trivial information."** Died on
  proving it: it is exactly left-permutivity, the restriction map is a bijection,
  and the distribution on those coordinates is *exactly uniform* — so the
  statement carries the same information as `evolveFrom_leftPermutive` and not one
  bit more. It is worth seeding as a node and worth nothing as a route.
- **"Prize 2 is the bias of the reachable set at the centre coordinate."** Died
  at `window_count_half`, which is **proved** and says that bias is exactly zero.
  Prize 2 is the bias in the *time* sample space of one fixed member. The two
  differ by the whole of the problem, and the board's own docstring on that node
  already says so: *"it says nothing about the single-seed row, which is one
  window in `2 ^ (2t + 1)`."*
- **"The Weil / quadratic-character branch (AGHP's third construction) could give
  a single balanced sequence."** Not pursued to a dictionary and recorded as
  abandoned on paper: that branch proves balance for `c(t) = χ(f(t))` with `χ` a
  multiplicative character and `f` a polynomial in the **index**, and rule 30
  gives `c(t) = π(T^t(1))` — a coordinate readout of a nonlinear **orbit**.
  Expressing one coordinate as a character costs a sum over all `2^m` characters,
  which is the same obstruction that makes low bits of `x^e mod p` hard. No
  measurement was made and none is offered.
- **"The coordinate carrying the surviving first-order correlation is a fixed
  one."** Mine, written into section 6 as a guess before the script ran. It is
  not fixed: it hops among cells `1..5` (`1,1,1,4,3,2,3,1,1,4,4,1,2,3,2,5,1,3`
  for `t = 5..22`). What is stable is that it is always *inner* — never within
  fourteen cells of the cone's outer end.
- **"Total influence `4.44` at `t = 22` is between the `√t` and `t` nulls."**
  Also mine, also written before checking: the null for a balanced function is
  `t/2 = 11`, so `4.44` is *below* it, not between anything. Corrected in section
  6, and left recorded here because naming a null wrongly is this project's
  standing failure and I did it inside the document that says so.
- **Nothing died for lack of depth.** Every death above has a witness computed
  exhaustively rather than sampled: 256 rules to `t = 12`, the conditioned family
  to `t = 24` (`2^24` configurations), the Walsh transform over all `2^N`
  characters at eleven `(m,t)` points, and Berlekamp–Massey at `N = 4096`.

**One live preprint, flagged rather than used.** `arXiv:2604.00165`,
Chan-López and Martín-Ruiz, *Symmetric Nonlinear Cellular Automata as Algebraic
References for Rule 30*, submitted 2026-03-31, last revised 2026-09-06, fetched
at `https://arxiv.org/abs/2604.00165`. Its abstract ends, verbatim: *"A mechanism
for the apparent randomness of Rule 30's center column is identified through the
left-permutive structure and asymmetric Boolean sensitivity profile."* That is the
same vocabulary as 3.3 and a captain should know it exists before anything from
3.3 is called novel. What I can say: I fetched the **abstract only**, the paper is
unrefereed, its stated object is rule 22 as a symmetric reference and a power-law
fit `ε(m) ≈ m^{1.11}` for a support-cardinality difference, and "a mechanism for
apparent randomness" is not a balance theorem or a resiliency statement. What I
cannot say is whether their §-level content overlaps 3.3, because I did not read
it. Per `docs/sources.md`'s rule for live preprints, it gets no row there until
somebody runs a check against its own claims — the support-cardinality formula
`|S_m| = 2^{popcount(⌊m/2⌋)}·3^{m mod 2}` for rule 22 is exactly enumerable and
would be an hour's work.

---

## 5. What to hand the theorist

**Topic 1, and the one I would spend a session on — the mirror of
`window_count_half`, for the contrapositive.** *Claim to falsify:* for an
elementary rule `R` permutive in its **right** variable, and for every `t`, the
cell at position `0` at time `t` is black for exactly half of the configurations
that are white at every `x < 0`, black at `0`, and free on `1..t`. *The
dictionary row it depends on:* "the cone pins the permutive coordinate" — row 7
and rows 12–14 of 3.3. *The statement that would settle it:* the proof is
`window_count_half`'s own `flipFirst` involution moved to the other end of the
window, so it should cost about what that node cost; and its value is entirely
the contrapositive, since rule 30 is `rule30_leftPermutive` and **not**
right-permutive. It converts the board's standing reading — "a lemma that does
not mention the left cone cannot close this" — into a named mechanism with a
theorem behind it (Siegenthaler at `n = 3`: a 1-resilient elementary rule is
affine), and it comes with an asymmetric control that rule 86 passes and rule 30
fails, so an orientation error cannot survive it. **It does not prove any part of
the residual.** It is a fence, it should be seeded with a `DOES NOT PROVE` field
saying so, and its worth is that it prices a whole quadrant rather than closing a
node.

**Topic 2, cheaper and immediately seedable — Rosetta's Fourier fence, upgraded
from a measurement to a corollary.** *Claim to falsify:* for configurations white
at every `x < 0` with support in `[0,m)`, the restriction of row `t` to positions
`x ≥ t + 1` determines the configuration. *The dictionary row it depends on:* row
4 of 3.2, the bijection. *What would settle it:* a downward induction from the
right edge using `evolveFrom_leftPermutive`, which is closed — the row cell at
position `p` is a XOR in the configuration cell at `p − t`, so the system is
triangular with unit diagonal. Its Fourier corollary is precisely Rosetta's
"all Fourier mass sits on bits `0..2t`", which that document could only measure,
and the exactness I measured (**every** off-band character has bias exactly `0`,
`2047/2047` at `(m,t) = (12,3)` and at all eleven points) is what a proof would
predict rather than what a coincidence would give.

---

## 6. Next vantage

**The theory of Boolean functions and their *restrictions* — decision-tree and
random-restriction complexity, Håstad's switching lemma, the Ajtai–Linial /
Kahn–Kalai–Linial line on influences — read as a theory of what conditioning does
to bias.** This session's one real finding is that the prize's cone hypothesis is
a *restriction* of the row generator's input, that it kills the single coordinate
carrying all the resiliency, and that the bias afterwards does not decay: `0.101`
at `t = 22` and `0.493` at `t = 23`, against a random-function null of `2⋅10^{-4}`.
That is precisely the shape the restriction literature owns — how a Boolean
function's Fourier weight redistributes when some inputs are fixed, which
coordinates carry the influence afterwards, and when a restricted function
simplifies. The measured object is already built and exact: the centre cell as an
explicit Boolean function of `t` variables, whose algebraic degree I measured
running `0.8t` (reaching `18` at `t = 22`) and whose ANF density is `0.01`–`0.16`
— sparse and high-degree at once, which is an unusual combination the field has
names for, and which no session here has looked at. The specific question a
connector should carry is **influences**, and I ran the two-line script rather
than hand it on as a guess (`explorer/vernier2_influence.mjs`, exhaustive over
all `2^t` members for `t = 4..22`). Three things came out, and the third is the
one I would carry:

- The surviving first-order correlation is **never** on an outer cell. The
  largest singleton Walsh coefficient sits at configuration cell `1, 2, 3, 4` or
  `5` at every `t` from `5` to `22` — always within five of the origin, never
  within fourteen of the cone's outer end — and it *hops* among them rather than
  staying put (`1,1,1,4,3,2,3,1,1,4,4,1,2,3,2,5,1,3` for `t = 5..22`).
- The **influence profile** is a random function's on the inside and dead on the
  outside. At `t = 22` the per-cell influences read
  `.505 .449 .543 .494 .475 .455 .420 .337 .258 .197 .131 .104 .037 .025 .002 .002 0 0 0 0 0 0`:
  the first seven cells sit at `≈ 1/2`, which is exactly what a random balanced
  function gives, and the rest decay to zero. Total influence `4.44` against a
  random function's `t/2 = 11` — **below** the null, and below it entirely because
  the outer half contributes nothing rather than because the inner half is
  structured. (My first draft of this bullet called `4.44` "roughly `0.2t`,
  between the `√t` and `t` nulls"; that is wrong twice over — the null for a
  balanced function is `t/2`, and the profile is not a single rate.)
- **The effective cone is strictly smaller than the light cone, and measurably
  so.** At `t = 22` the configuration cells `17…22` have influence *exactly zero*:
  the centre cell at time `22` does not depend on them at all, in any input,
  though the light cone permits it. Effective radius `13` at `t = 15` and `16` at
  `t = 22`, ratios `0.87` and `0.73`, falling. That is the left damage front read
  as a Boolean influence, and it is the *worst case over all inputs* rather than
  an average — which is precisely the quantity crystals A3 prices at zero for
  arbitrary pairs. Whether the worst case over this cone-conditioned family is
  genuinely below `1` is the question, and this is the first instrument that
  measures it as a function rather than as a front.

What I could not reach at all, and which sits outside every vantage tried this
evening: **the merit-factor and low-autocorrelation-binary-sequence literature**,
the one branch of this whole region whose object is a *single explicit sequence*
rather than a set — where the Legendre sequence's balance and correlations are
proved by Weil sums and the general problem is famously open. It is the only place
I found where the field's object has the prize's cardinality, and I ran out of
session before building a dictionary for it.

I could not reach the restriction/influence vantage properly from where I stood
because I spent the session on the *set* and that is a question about the
*function*; the two are the same object read along different axes, and I only saw
the second axis at the end, when the ANF degree table came out near-maximal and I
had nothing in the field of small-bias sets to do with it.
