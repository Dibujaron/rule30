# Sighting — `centerColumn_other_isEventuallyPeriodic_of_center` from T-functions and 2-adic dynamics

Connector: Vernier. 2026-09-09.
Vantage: T-functions (Klimov–Shamir), 2-adic dynamics of shift-and-boolean maps,
NLFSRs, algebraic normal form.

Scripts: `explorer/vernier_tfunc.mjs`, `vernier_graph.mjs`, `vernier_cycles.mjs`,
`vernier_maxtail.mjs`, `vernier_deep30.mjs`, `vernier_n31.mjs`, `vernier_anf.mjs`,
`vernier_mahler.mjs`.
Kernel checks: `explorer/vernier_scratch_tfunc.lean`, accepted by `lake env lean`.

---

## 1. The problem, seen from outside

Fix the map on non-negative integers

```
T(r) = (4·r)  XOR  ((2·r)  OR  r)
```

— three machine instructions, no arithmetic carry anywhere, only shifts and
bitwise boolean operations. Iterate it from the single seed `r₀ = 1` and write
`rₜ = Tᵗ(1)`:

```
1, 7, 19, 123, 275, 1915, 4627, 32379, 67347, 463739, 1276435, …
```

Because bit `i` of `T(r)` reads only bits `i`, `i−1`, `i−2` of `r`, the map is
*triangular*: it descends to a well-defined self-map of `ℤ/2ⁿ` for every `n`, and
hence to a continuous self-map of the 2-adic integers `ℤ₂`. So there is one orbit
inside `ℤ₂` and an infinite matrix of bits `B(t, k) = bit_k(rₜ)`.

Two things are known about that matrix. Every **column** of it is eventually
periodic: for each fixed `k`, the sequence `t ↦ bit_k(rₜ)` repeats from some
point on, with a period that is an exact power of two, and the powers are
unbounded as `k` grows. What is not known is the **diagonal**:

```
c(t) = bit_t(rₜ)
```

— bit 0 of `r₀`, bit 1 of `r₁`, bit 2 of `r₂`, and so on: `1101110011000101…`.
Measured to depth `10¹³`, it looks like a fair coin. The residual is the single
statement that `c` is **not eventually periodic**: there are no `p > 0` and `N`
with `c(t + p) = c(t)` for all `t ≥ N`. Nothing weaker is at stake and nothing
stronger is being asked. The project's board records that the wall it handed me
(*if the centre column repeats, some other column repeats*) is, given a theorem
already proved there, logically equivalent to exactly this.

Restated in the vantage's own vocabulary. `T` is a **T-function** in Klimov and
Shamir's sense — equivalently a **1-Lipschitz** (compatible) map `ℤ₂ → ℤ₂` —
whose coordinate functions all carry the same algebraic normal form, the
shift-invariant quadratic `x_{i−2} ⊕ x_{i−1} ⊕ x_i ⊕ x_{i−1}x_i`. Every
coordinate of the orbit of `1` is eventually periodic, so the orbit descends into
a cycle of `T mod 2ⁿ` for every `n`; the question is whether the *escaping*
readout — coordinate `t` at time `t`, which always lands strictly inside the
pre-periodic part of coordinate `t` — is eventually periodic. In one line:
**every column of a T-function's orbit matrix is eventually periodic; is the
diagonal?**

A second, sharper entry point became available today and is why this vantage
exists at all. The project's onset wall (`leftDiagonal_onset_le`, *every left
diagonal has settled by its own index*) is now a proved equivalence with no
automaton in it: for every `k`,

```
r_{2k}  ≡  r_{2k + 2^k}   (mod 2^{k+1}).
```

In T-function words, and this is the form I have worked in throughout:

> **the orbit of `1` in the functional graph of `T mod 2ⁿ` has entered its cycle
> by step `2(n−1)`, and that cycle's length divides `2ⁿ⁻¹`.**

A rho-shape statement — tail length and cycle length of one orbit of a
non-invertible triangular map on `n`-bit words. The cycle structure of such maps
is exactly what the T-function literature is about, and the tail structure is
exactly what it is not.

---

## 2. Fields sighted

| Field / theory | The object there | The seam, in one line |
|---|---|---|
| T-functions (Klimov–Shamir) | `T` is a single-word T-function; the wall is its rho-tail | The two criteria the field runs on (bijective, single-cycle) both answer NO in one line and then say nothing — the theory is built for the invertible case |
| 2-adic ergodic theory (Anashin) | `T` is 1-Lipschitz on `ℤ₂`; measure-preservation and ergodicity criteria | Measure-preservation *is* bijectivity mod `2ⁿ` and ergodicity *is* transitivity mod `2ⁿ`; `T` is the identity mod 2 and 4-to-1 in the limit, so every criterion in the field is vacuous here |
| van der Put / Mahler expansions | The normal forms in which those criteria are stated | Same vacuity, and worse: `T`'s Mahler expansion is dense (255 nonzero of 257) and sits at the 1-Lipschitz floor, so there is nothing finite to check even if a criterion existed |
| Nonlinear feedback shift registers | `T` is a quadratic shift-invariant feedback; each coordinate is a XOR accumulator with a load line | NLFSR theory bounds cycles of a *fixed-width* register; here the width grows one bit per step and one specific seed is at issue |
| Functional graphs of random maps (Flajolet–Odlyzko) | Rho-tail and cycle statistics of a random map on `2ⁿ` points | The null predicts tail `≈ 2^{n/2}` and cycle `≈ 2^{n/2}`; measured tail is `1.26 n` and the whole attractor has `114` points at `n = 31` — `T` is not remotely random, it is hyper-contracting |
| Arithmetic dynamics: Collatz as a 2-adic map | Orbit of `1` under an explicit 1-Lipschitz map; the parity-vector conjugacy | The `3x+1` map is 2-adically *bijective*, which is what makes the parity vector a conjugacy; `T` is not, and the analogy dies at that one word |
| Profinite / inverse limits | `ℤ₂ = lim ℤ/2ⁿ` and the tower of functional graphs | The attractors form a surjective inverse system whose limit is where the settled region lives; the residual lives in the *trees* hanging off it, which the inverse-limit language does not name |
| Algebraic normal form / algebraic immunity | `ANF(T)` is one fixed quadratic per coordinate; `ANF` of the `t`-step centre bit | Measured: degree is maximal (`t+1`) at 21 of 23 depths and the monomial density is `0.53` — the ANF of the iterate is indistinguishable from a random Boolean function's |
| Cryptanalysis of T-function stream ciphers (TSC-1/2, Klimov–Shamir generators) | Distinguishers on `x ↦ x + (x² ∨ 5)` and its multiword cousins | Those attacks exploit *bijectivity plus a bias*; `T` has no bijectivity, and the bias question is Prize 2, not Prize 1 |
| de Bruijn graphs / cycle-joining | The cycles of `T mod 2ⁿ` and how they are joined as `n` grows | Cycle-joining builds long cycles from short ones by design; here the motion of interest is a cycle *appearing* at one specific modulus and never before it |
| Binary carry / the odometer | `r ↦ r + 1` is the other famous T-function on `ℤ₂` | The odometer is transitive; `T` is the identity mod 2. The resemblance is the triangular shape alone and dies at the first criterion |
| Automata over `ℤ₂` (Anashin's "automata finiteness") | `T` as a Mealy automaton, the orbit as an automatic sequence | A previous connector took the automatic reading (Christol); what the T-function reading adds is the *tower of finite functional graphs*, which the automatic reading has no name for |
| Formal power series `F₂[[x]]` | XOR is addition, `4r` is multiplication by `x²` | `OR` is not `F₂[[x]]`-algebraic. The seam is one operation wide and it is the entire difficulty |

---

## 3. Connections

### 3.1 The onset wall is a rho-tail bound, and it holds over *every* start with a 37 % margin

**The claim.** `leftDiagonal_onset_le` is not a statement about the seed at all:
it is the statement that the functional graph of `T mod 2ⁿ` has depth at most
`2(n−1)`, quantified over all `2ⁿ` starts — and that stronger statement is true,
measured exhaustively to `n = 31`, with the worst case running at `1.26 n` where
`2(n−1)` is allowed.

**The dictionary.**

| Rule 30 | `T` on `n`-bit words | Checked |
|---|---|---|
| Row `t` of the picture | `rₜ = Tᵗ(1)`, an integer; cell at position `x` is bit `x + t` | `rowNat (t+1) = Tf (rowNat t)`, kernel, `t < 60` |
| The centre column | `c(t) = bit_t(rₜ)` — the *diagonal* of the orbit matrix | `rowCell t 0 = (rowNat t).testBit t`, kernel, `t < 40` |
| Left diagonal `k`, index `j` | `bit_k(r_{j+k})` — coordinate `k` of the orbit, delayed by `k` | 0 mismatches, `k ≤ 30`, `j+k ≤ 400` (`vernier_tfunc.mjs`) |
| The leftmost `n` cells of the cone | `rₜ mod 2ⁿ`; the reduction is well defined because `T` is triangular | kernel, `n = 3` |
| Onset of diagonal `k` | Time at which coordinate `k` of the orbit becomes periodic | — |
| The settled region | The **attractor** of `T mod 2ⁿ`: the union of its cycles | `4n − 18` (to `n = 29`; 114 at `n = 31`) states for `8 ≤ n ≤ 29`; then `106` at `n = 30` and `114` at `n = 31`, because the growth rate is the *current cycle length*, which changes at `n = 30` (§3.2) |
| The transient band | The trees of the functional graph hanging off the attractor | — |
| `leftDiagonal_onset_le` (the wall) | `tail_n(1) ≤ 2(n−1)` for every `n` | measured `tail_n(1) ≈ 1.06 n`, to `n = 31` |
| **The strengthening** | `maxTail(n) ≤ 2(n−1)`, over all `2ⁿ` starts | measured `1.26 n`, exhaustive to `n = 31`, no violation |
| The damage front's speed `< 1/2` | The same bound, read along the front rather than as a max | — |
| **Seam 1** | The worst start is *not* the seed: for `5 ≤ n ≤ 24`, except `n = 11`, the max is attained at the fixed tiny state `r = 9` | `vernier_graph.mjs` |
| **Seam 2** | `maxTail(n+1) − maxTail(n)` is not bounded by 2: it hits **4** at `n = 19` and 3 four times | so no "one index of budget per level" induction exists — the bound must be amortized |
| **Seam 3** | The all-starts version is *not* equivalent to the wall; it implies it | a counterexample to the all-starts version would not refute the wall |

The measurement, in full (`vernier_maxtail.mjs`, `vernier_deep30.mjs`,
`vernier_n31.mjs`; the algorithm is "iterate the whole set and watch it shrink",
so it needs one bitset and no per-state array):

```
 n   maxTail   2(n-1)   |attractor|   4n-18    maxTail/n
10        11       18            22      22        1.100
15        17       28            42      42        1.133
19        26       36            58      58        1.368   <- worst ratio
24        31       46            78      78        1.292
28        36       54            94      94        1.286
30        37       58           106     102        1.233
31        39       60           114     114        1.258
```

**What it leans on.** Nothing outside the project, and that is the point: the
translation is arithmetic. Two fetched anchors for the vocabulary. Anashin,
*Non-Archimedean analysis, T-functions, and cryptography*: "the term 'T-function'
was suggested only in 2002 by A. Klimov and A. Shamir", and these are "mappings
from ℤ₂ᵐ into ℤ₂ⁿ that satisfy Lipschitz condition with a constant 1"
(<https://arxiv.org/html/cs/0612038v1>). MathWorld, *Rule 30*: "Starting with a
single black cell, successive generations are given by interpreting the numbers
1, 7, 25, 111, 401, 1783, 6409, 28479, 102849, ... (OEIS A110240)"
(<https://mathworld.wolfram.com/Rule30.html>) — that is the same object in the
mirror bit order, and it is the one place I could verify that rule 30's rows have
been recorded as integers.

**The test.** Run the shrink-the-image computation at `n = 32, 33, 34` and look
for `maxTail(n) > 2(n−1)`; the margin is a factor 1.6, so a single violation is
far away, but the *increment* is the thing to watch — an increment of 6 or 7 at
one level would say the amortization has no chance. Cheaper and sharper, for a
theorist: falsify

> for every `n` and every `r < 2ⁿ`, `T^{2(n−1)}(r)` lies on a cycle of
> `T mod 2ⁿ` — equivalently, `T^{2(n−1)}(r) ≡ T^{2(n−1) + 2ⁿ⁻¹}(r) (mod 2ⁿ)`.

Note what this removes: no seed, no picture, no front. Ran here to `n = 31`
(`2³¹` starts, exhaustive, 40 s), no violation.

**What it would give.** The onset wall, which is the last thing standing between
the board's diagonal tier and `leftDiagonal_period_le`. It does *not* touch the
residual: the residual is about the diagonal readout, and this is about the
depth of the trees. What would remain is all of it.

---

### 3.2 NKS p. 871's doubling positions are the moduli at which `T` acquires a new cycle length — and the new cycle is unique

**The claim.** The sequence `3, 8, 29, 400, 87867, 2107985255`, which the
literature records as "the depths at which rule 30's left-diagonal period
doubles", is really a statement about one T-function and nothing else:
`a(d) + 1` is the least `n` such that `T mod 2ⁿ` has a cycle of length `2^d`,
and at that `n` the cycle is **unique** and contains the orbit of `1`.
Everywhere else the attractor grows by exactly one new cycle of the current
maximum length per level.

**The dictionary.**

| Rule 30 | `T mod 2ⁿ` | Checked |
|---|---|---|
| Settled word of diagonal `k` | Coordinate `k` read along a cycle of the attractor | — |
| Eventual period of diagonal `k` | Length of the cycle the orbit of `1` sits on, mod `2^{k+1}` | least return period `1,2,4,8,16` at `k = 0–2, 3–7, 8–28, 29–399, 400–5000` (`vernier_tfunc.mjs`) |
| Period doubling at `k` | First appearance of cycle length `2^d`, at `n = k+1` | length 2 at `n = 4`, 4 at `n = 9`, 8 at `n = 30` — all three accessible ones |
| Uniqueness at a doubling | Exactly one cycle of the new length at that `n` | `1×` at `n = 4`, `1×` at `n = 9`, `8x1` at `n = 30` |
| `leftDiagonal_period_unbounded` (proved) | The maximum cycle length of `T mod 2ⁿ` is unbounded in `n` | — |
| `leftDiagonal_period_le` (a wall) | The maximum cycle length mod `2ⁿ` divides `2ⁿ⁻¹` | — |
| "There is really only one left side" (Rowland §6) | The attractor is tiny: `4n − 18` (to `n = 29`; 114 at `n = 31`) states out of `2ⁿ` for `8 ≤ n ≤ 29`, `106` at `n = 30`, `114` at `n = 31` | exhaustive |
| The growth law | `\|attractor(n)\| − \|attractor(n−1)\|` **= the maximum cycle length mod 2ⁿ** | exact, `5 ≤ n ≤ 31`, no exception |
| Cycle spectrum at `n = 31` | `1×4, 2×5, 4×21, 8×2` | `vernier_n31.mjs` |
| Four preimages per configuration (Wolfram §4, Fukś) | Image density of `T mod 2ⁿ`: `0.500, 0.453, …, 0.2552` at `n = 28`, drifting toward `1/4` | measured; the identification with the four-preimages fact is a **resemblance, not a proof** |
| **Seam 1** | The 4 fixed points and 5 two-cycles at every `n` are **truncation artefacts** — e.g. `2ⁿ⁻¹` is fixed because its propagation runs off the top of the word | they do not reduce compatibly down the tower |
| **Seam 2** | Uniqueness is verified at three doublings only, and the fourth (`n = 401`) is out of exhaustive reach — `2⁴⁰¹` states | the law is an extrapolation from three points |
| **Seam 3** | The attractor is an inverse system with surjective bonding maps (checked `n = 9…20`, 0 non-liftable states), so its limit is nonempty — but the limit points are *not* periodic, their coordinate periods grow | the settled configuration is one of them |

The confirmation at `n = 30` is the part I would put weight on. It was a
prediction made from `n ≤ 29` — where the attractor is `1×4, 2×5, 4×21` and the
4-cycle count had grown by exactly one per level for twenty levels — and the
prediction was that at `n = 30`, and not before, an 8-cycle would appear, alone,
and the 4-cycle count would stop. That is what happened: `1×4 2×5 4×21 8×1`,
attractor 106. At `n = 31` the count of 8-cycles went to 2 and the 4-cycles
stayed at 21, attractor 114. `n = 30` is `k = 29`, NKS p. 871's third doubling.

**What it leans on.** The doubling positions as the project holds them:
`blueprint/crystals.md` item 14, "First appearance of each period: 2 at 3, 4 at
8, 8 at 29, 16 at 400, 32 at 87,867, 64 not before 2,107,985,255 (NKS p. 871)";
and item 55, the seed's orbit reproducing `2,107,985,255` from the recurrence
alone. NKS p. 871 itself is not held in `sources/` and I did not fetch it —
**UNVERIFIED** as a primary citation; searched `sources/` for `871` (found only
the project's own quotations) and the web for "NKS p. 871 rule 30 diagonal period
doubling". The mirror-order integer sequence A110240 is verified via MathWorld
above; **UNVERIFIED**: A110240's own comment and formula lines, because
`oeis.org` returned HTTP 403 to two fetches (`/search?q=1,7,19,123,275,1915,…`
and `/A110240`), so I cannot say whether OEIS already records this map in the
`4r XOR (2r OR r)` form.

**The test.** Two, one cheap and one decisive.

*Cheap, and it can be run tomorrow.* The growth law says
`|attractor(n)| = |attractor(n−1)| + maxCycle(n)`. Since `maxCycle(n) = 8` for
`30 ≤ n ≤ 400` and `16` for `401 ≤ n ≤ 87867`, the law predicts
`|attractor(n)| = 114 + 8(n−31)` for `31 ≤ n ≤ 400`. Exhaustive enumeration
stops around `n = 32`, but the attractor can be enumerated *without* the full
state space by running the settled-word orbit map, which the project already has
(`explorer/forbit.mjs`): every cycle of `T mod 2ⁿ` that is not a truncation
artefact is a periodic point of that orbit. Check `|attractor(40)| = 186`.

*Decisive, and it is the statement to hand a theorist.* Falsify:

> for every `d`, the least `n` such that `T mod 2ⁿ` has a cycle of length `2^d`
> is `a(d)+1` where `a` is the doubling sequence, and at that `n` the cycle is
> unique.

Uniqueness at the first appearance is the sharp half; it is what makes the
doubling position *determined* rather than merely observed, and it is what
`leftDiagonal_period_unbounded` — proved on this board by pigeonhole — does not
give.

**What it would give.** Not the residual. It would move `leftDiagonal_period_le`
and Rowland's open converse ("`a(n)` characterizes the period lengths of the
diagonals on the right side" — the *and nowhere else* half) out of cellular
automata and into the cycle structure of an `n`-bit word map, where a field
exists that decides such things for its own maps. That is a change of venue, not
a proof, and I want to be plain that it is worth exactly as much as the venue
turns out to be.

---

### 3.3 Each coordinate of `T` is a XOR accumulator with a load line — the reset lemma is a clock-controlled shift register

**The claim.** The project's reset lemma is not a fact about cellular automata;
it is the statement that a T-function whose coordinate ANF contains the term
`x_{i−1}x_i` degenerates, at every time the control bit `x_{i−1}` is 1, into a
map that forgets `x_i` entirely — so each coordinate is a one-bit accumulator
under a load line driven by the coordinate below it, which is exactly the
"stop-and-go"/clock-controlled construction the shift-register literature is
built around.

**The dictionary.**

| Rule 30 | Shift-register / T-function | Checked |
|---|---|---|
| `ANF` of one step | `bit_i(T(x)) = x_{i−2} ⊕ x_{i−1} ⊕ x_i ⊕ x_{i−1}x_i`, the same quadratic at every `i` | 0 mismatches over 8 cases and 2000 random 20-bit inputs |
| Left-permutivity | The leading `x_{i−2}` term: a difference at bit `i` moves to bit `i+2` in one step | Wikipedia: "if two configurations C and D differ in the state of a single cell at position i, then after a single step the new configurations will differ at cell i + 1" (position `i+1` at time `t+1` is bit `i+2` here) |
| `x_{i−1} = 1` (black cell on the diagonal above) | **Load**: `x_i(t+1) = x_{i−2}(t) ⊕ 1`, independent of `x_i(t)` | the reset lemma `leftDiagonal_periodicFrom_step_of_black` |
| `x_{i−1} = 0` | **Accumulate**: `x_i(t+1) = x_i(t) ⊕ x_{i−2}(t)` | the white branch of crystal 45 |
| Onset of diagonal `k` | Time of the first load after coordinates `< k` have settled | — |
| The damage front riding a white run | The accumulator running unloaded — memory of the initial value survives | obstruction 6's front, which "can only move down and left" |
| **Seam 1** | The control line is the coordinate *below*, and it settles first; so the settling order is bottom-up and the induction wants a *per-level* budget | but seam 2 of §3.1 says the increments hit 4 |
| **Seam 2** | Register width grows one bit per step. Every NLFSR cycle theorem is for fixed width | the object is a *growing* register, and no theorem in that field is stated for one |
| **Seam 3** | The field's tools (adjacency graph, cycle-joining, Golomb's theory) construct long cycles; nothing there bounds a *transient*, because an NLFSR used in cryptography is invertible by construction and has no transients at all | this is the same seam as §3.4, and it is the reason the whole vantage is thinner than it looks |

**What it leans on.** The ANF identity is elementary and checked
(`vernier_cycles.mjs`, and by hand: `a ⊕ (b ∨ c) = a ⊕ b ⊕ c ⊕ bc`). The
permutivity sentence is fetched from <https://en.wikipedia.org/wiki/Rule_30>.
**UNVERIFIED**: that the shift-register literature contains no transient bound
for non-invertible feedback registers — I searched for "nonlinear feedback shift
register transient length non-singular", "T-function transient", and Golomb's
*Shift Register Sequences* is cited in `sources/wolfram-1986` but not held.

**The test.** The load/accumulate reading makes one quantity primary: after
coordinates `< k` have settled, how long until the control line `x_{k−1}` is 1?
That is the "first black cell" gap, and obstruction 6 already measured the front
version of it. The version this reading adds, and which is *not* the front, is:
over all `2ⁿ` starts, is the max over `k` of (settling time of coordinate `k`
minus settling time of coordinate `k−1`) bounded? Measured indirectly through
`maxTail` increments: no — it reaches 4. A theorist should try to falsify

> `maxTail(n+1) ≤ maxTail(n) + 2`

and will succeed at `n = 18 → 19` (26 vs 22 + 2). That death is worth having in
writing, because it is the exact shape of induction the reset lemma invites.

**What it would give.** It re-describes the reset lemma in a vocabulary where
the failure of the naive induction is visible in one line rather than in a
measurement of a front. It gives no bound. I put it here rather than in section 4
because the dictionary is sound and someone will otherwise build it again.

---

### 3.4 The invertibility and single-cycle criteria are vacuous, and I can say so in two kernel-checked lines

**The claim.** The entire decision apparatus of the T-function field —
Klimov–Shamir invertibility, single-cycle/transitivity, Anashin's
measure-preservation and ergodicity criteria, and the van der Put reformulations
of all of them — applies to `T` and returns NO immediately, for reasons visible
in the first two bits, and then has nothing further to say. This is the vantage's
central negative and it should be stated first, not last.

**The dictionary.**

| The field's question | The answer for `T` | Checked |
|---|---|---|
| Is `T` a T-function? | Yes: bit `i` of the output reads bits `i, i−1, i−2` | kernel: `Tf x % 8 = Tf (x % 8) % 8` |
| Is `T` bijective mod `2ⁿ`? | No, already mod 4: `T(1) ≡ T(3) ≡ 3` | kernel |
| Is `T` transitive (single cycle) mod `2ⁿ`? | No, already mod 2: `T` is the **identity** mod 2 | kernel, all `r < 256` |
| Does `T` preserve Haar measure on `ℤ₂`? | No, by Anashin's Theorem 5.2 plus the line above | — |
| Is `T` ergodic on `ℤ₂`? | No, same | — |
| What is the image density mod `2ⁿ`? | `29/64` at `n = 6`; `0.2552` at `n = 28` | kernel at `n = 6`; JS elsewhere — two implementations agreeing |
| What does the field then say? | Nothing. Every published criterion I could reach is an iff for bijectivity or transitivity | — |
| **Seam** | The field studies permutations of `ℤ/2ⁿ` because stream ciphers need them; rule 30 is 4-to-1, which is *why* it is interesting and *why* the field cannot see it | this is the whole vantage's offset |

**What it leans on.** Anashin, *Non-Archimedean analysis, T-functions, and
cryptography*, Theorem 5.2, fetched at <https://arxiv.org/html/cs/0612038v1>:

> "a compatible mapping F:ℤp→ℤp preserves the normalized Haar measure μp on ℤp
> (resp., is ergodic with respect to μp) if and only if it is bijective (resp.,
> transitive) modulo pᵏ for all k=1,2,3,…"

and from the same page, on where the notion came from:

> "the term 'T-function' was suggested only in 2002 by A. Klimov and A. Shamir"

and

> "mappings are well-known mathematical objects dating back to 1960th (however,
> under other names: Compatible mappings in algebra, determined functions in
> automata theory, triangle boolean mappings in the theory of Boolean functions,
> functions that satisfy Lipschitz condition with constant 1 in p-adic
> analysis)"

Anashin–Khrennikov–Yurova, *T-functions revisited: New criteria for
bijectivity/transitivity*, abstract fetched at
<https://arxiv.org/abs/1111.3093>: it "presents new criteria for
bijectivity/transitivity of T-functions", using "van der Put series to represent
1-Lipschitz p-adic functions and to study measure-preservation/ergodicity" —
i.e. the newest machinery in the field is still an iff for the two properties `T`
lacks. **UNVERIFIED**: the exact coordinate-form of Klimov and Shamir's own
invertibility criterion (the "bit `i` must be `x_i ⊕ f(x_0…x_{i−1})`" shape).
`link.springer.com/chapter/10.1007/978-3-540-24654-1_18` redirected to an
authorization endpoint; `arxiv.org/pdf/1111.3093` fetched as unparsed binary;
searched "Klimov Shamir T-functions invertibility single cycle criterion" and
"Cryptographic applications of T-functions invertible if and only if".

**The test.** There is nothing to falsify here; the kernel file
`explorer/vernier_scratch_tfunc.lean` is the check, and it is accepted. What a
theorist can do with it is refuse to spend a session looking for a criterion.

**What it would give.** It closes the vantage's most obvious hope. That is worth
a paragraph of a captain's time and no more.

---

### 3.5 Both normal forms exist, and both are maximally uninformative

**The claim.** The brief asks whether `4r XOR (2r OR r)` has a normal form making
its 2-adic behaviour computable. It has the two the field uses, and both are
dead ends by measurement. The **algebraic normal form** is one fixed quadratic
per coordinate for the map, and for the object that matters — the centre cell as
a Boolean function of the start — has maximal algebraic degree and monomial
density `0.53`, which is what a random Boolean function has. The **Mahler
expansion**, the normal form Anashin's criteria are actually stated in, is
*dense* (255 nonzero coefficients of the first 257) and sits at the extreme edge
of what a 1-Lipschitz map is allowed: `v₂(a_k)` tracks `⌊log₂ k⌋` with slack that
returns to **0** at `k = 1, 3, 5, 6, 10, 12, 20, 24, 40, …`. There is no
sparseness and no structure to exploit in either.

**The dictionary.**

| Rule 30 | Boolean function / ANF | Measured |
|---|---|---|
| One step | `x_{i−2} ⊕ x_{i−1} ⊕ x_i ⊕ x_{i−1}x_i`, degree 2, identical at every coordinate | exact |
| Centre cell at time `t` | `F_t(x_0,…,x_t) = bit_t(Tᵗ(x))` — a Boolean function of `t+1` variables, because `T` is triangular | — |
| Picture reading of `F_t` | Row 0 occupies positions `0…t` and is white at every negative position — the left cone edge is built into the modulus | — |
| Algebraic degree of `F_t` | `t+1` (maximal) for `t = 7…22` except `t = 17`, where it is 17 | `vernier_anf.mjs`, Möbius transform, exhaustive to `t = 22` |
| Monomial count of `F_t` | `0.52–0.54` of `2^{t+1}` for `t ≥ 8` | exhaustive |
| Degree is maximal | ⟺ the number of left-anchored start words giving a black centre at time `t` is **odd** | identity: the top ANF coefficient is the parity of the weight |
| **Seam 1** | 16 of the 17 depths `t = 7…22` have odd weight; a coin gives that with probability `1.3 × 10⁻⁴` | so there is structure in the parity — 23 data points, and I make no claim about it beyond that |
| **Seam 2** | `F_t` is *not* balanced (`22/32` at `t = 4`, `183/512` at `t = 8`) — the board's proved `window_count_half` is about the **full** width-`2t+1` window, a different function | the two must not be confused |
| **Seam 3** | Degree of `F_t` says nothing about the orbit of the *seed*, which is one point | this is the seam that kills the route: ANF is a statement about all inputs, and `1` is one input |
| Mahler coefficients `a_k` of `T` | `a_k = Σⱼ (−1)^{k−j} C(k,j) T(j)`: `0, 7, 0, −10, 40, −108, 228, −408, 688, −1248, 2600, …` | `vernier_mahler.mjs`, exact BigInt, `k ≤ 256` |
| Sparseness | **None**: 255 of the first 257 coefficients are nonzero (only `a₀` and `a₂` vanish) | exhaustive |
| 1-Lipschitz margin | `v₂(a_k) − ⌊log₂ k⌋` = `0,0,1,0,0,1,1,2,0,2,0,2,1,5,1,…`, returning to 0 forever | so `T` is *extremal* among 1-Lipschitz maps, not a special one |
| **Seam 4** | For comparison, Klimov–Shamir's own generator `x + (x² ∨ 5)` has a short Mahler expansion because `x² = 2·C(x,2) + C(x,1)` — which is *why* their criteria compute on it | `T`'s does not, so even a criterion that did not need bijectivity would have nothing finite to check |

**What it leans on.** Only the computation; the Möbius transform and the Mahler
inversion formula are standard and no citation is claimed for them.
**UNVERIFIED**: the precise form of the 1-Lipschitz criterion in Mahler
coefficients (`v_p(a_k) ≥ ⌊log_p k⌋`) — I did not fetch a statement of it, and
searched "Anashin Mahler coefficients 1-Lipschitz criterion". The measurement
does not depend on it: `v₂(a_k)` was computed directly and is reported as such.

**The test.** Already run and already negative on both halves. To push: extend
`vernier_anf.mjs` to `t = 26` (about a minute, `2²⁷` entries) and look for degree
deficiency; extend `vernier_mahler.mjs` to `k = 2000` and look for a run of
zeros. If the ANF degree stayed bounded, or the monomial density decayed, or the
Mahler expansion turned out sparse, there would be an algebraic attack in the
cryptographic sense and it would be genuine news. None of the three happens.

**What it would give.** Nothing, and that is the finding. It answers the brief's
third question — *does `4r XOR (2r OR r)` have a normal form that makes its
2-adic behaviour computable?* — in the negative, in both of the field's normal
forms, with data rather than a shrug.

---

### 3.6 The residual is a *diagonal* of the orbit matrix, and no field sighted here indexes anything by diagonal

**The claim.** Everything the 2-adic and T-function worlds prove is indexed by
coordinate: bijectivity mod `2ⁿ`, transitivity mod `2ⁿ`, ergodicity, the van der
Put coefficients, measure preservation, the ANF of `Φ_i`. The centre column is
the one readout that is not a coordinate — it is coordinate `t` at time `t` —
and the reason it is hard is exactly the reason the field cannot state it: at
time `t` coordinate `t` has settled nowhere near, and the settling time is a
fixed factor `≈ 1.34` beyond the readout.

**The dictionary.**

| Rule 30 | 2-adic dynamics | Measured |
|---|---|---|
| Centre column `c(t)` | `bit_t(Tᵗ(1))` — the diagonal of `B(t,k) = bit_k(rₜ)` | kernel-checked |
| Column `j` of the picture, `j ≥ 1` | Not a coordinate either — position `j` at time `t` is bit `t + j`, another diagonal | — |
| Left diagonals | The **coordinates**; these are where all the theorems are | — |
| Settling time of coordinate `k` | `k + onset(k) ≈ 1.336 k` | project's measured onset `0.336 k` |
| The readout's position | Coordinate `t` at time `t`, i.e. at `≈ 0.75` of its settling time | — |
| The onset wall's meaning here | The readout is never more than a factor 2 ahead of the settling front | — |
| Settled configuration `settledConfig` | A point of the inverse limit of the attractors: every coordinate purely periodic, **but the orbit is not periodic** because the periods are unbounded | *inferred* from the board's crystal 47, not measured here; what I did measure is that the attractor system is surjective (`n = 9…20`, 0 non-liftable), so its limit is nonempty |
| The orbit closure of that point | An inverse limit of finite cyclic orbits of 2-power lengths — a **2-adic odometer** | structural, not measured here |
| `settledCenter` | The diagonal readout of that odometer orbit | — |
| **Seam 1** | The odometer reading applies to the settled point and *not* to the seed: the seed is in a tree, not on the attractor | so an equicontinuity argument reaches `settledCenter`, never `centerColumn` |
| **Seam 2** | A diagonal readout of an odometer is not a Toeplitz sequence here: the period of coordinate `k` is decided by the *size* of `k` (which plateau it is in), not by `k`'s residues, so the standard Toeplitz filling does not apply | this is where I expected a theorem and found none |
| **Seam 3** | The natural fix — pass to the co-moving frame `u_t = ⌊rₜ/2ᵗ⌋`, which makes the readout coordinate 0 — is not autonomous: `u_{t+1}` needs `bit_{t−1}(rₜ)`, one bit from the left half | and that is the project's own "the centre column drives the right half-line", re-derived. The co-moving map is not a T-function |

**What it leans on.** Nothing fetched; this connection is a structural reading
of my own dictionary and of the board's obstructions 1 and 4.

**The test.** The one testable consequence, and I could not close it here: is
`settledCenter` eventually periodic? It is the diagonal readout of a point whose
orbit closure is an odometer, so it is a far more constrained object than
`centerColumn`, and the project already computes it to `10⁹`
(`explorer/settledcenter_billion.mjs`). A theorist should try to falsify

> `settledCenter` is eventually periodic

*or* prove it is not, using the odometer structure. If `settledCenter` can be
proved aperiodic by an equicontinuity/odometer argument that `centerColumn`
cannot receive, the exact obstruction becomes visible for the first time: it
would be the difference between a point on the attractor and a point in a tree,
and that difference is the transient band. If `settledCenter` cannot be proved
aperiodic either, the odometer reading is worthless and should be said to be.

**What it would give.** Not the residual. It would give the residual's *shape*:
the first statement I have seen that separates "what the settled region can
prove about a diagonal readout" from "what the seed needs", in a vocabulary
where both are the same kind of object.

---

## 4. Died in translation

Every one of these got a dictionary attempt and broke at a named row.

1. **Klimov–Shamir single-cycle.** `T` is the identity mod 2, so no power of it
   is transitive on `ℤ/2ⁿ`. Kernel-checked. One line, and it kills the most
   obvious hope of the vantage.
2. **Klimov–Shamir invertibility.** `T(1) ≡ T(3) (mod 4)`. Kernel-checked.
   Everything downstream of invertibility — the whole stream-cipher construction
   line, all the multiword generators — is inapplicable.
3. **Anashin's measure-preservation and ergodicity criteria, and their van der
   Put reformulations.** By Anashin's own Theorem 5.2 (quoted above) these are
   *equivalent* to 1 and 2, so they die at the same two bits. The newest paper in
   the line (Anashin–Khrennikov–Yurova 2011) advertises "new criteria for
   bijectivity/transitivity" — the same two properties.
4. **`T` as an odometer.** The binary odometer `r ↦ r+1` is the archetypal
   T-function and is transitive; `T` fixes bit 0. Died at the first coordinate.
5. **Collatz's 2-adic conjugacy.** The parity-vector map of `3x+1` is a
   homeomorphism of `ℤ₂` conjugating the map to the shift; that is what makes
   Collatz's "diagonal readout" (the parity vector) tractable. It rests on the
   `3x+1` map being 2-adically bijective. `T` is 4-to-1. Died at the same word as
   1 and 2, from a different direction, and this was the resemblance I most
   wanted to be true.
6. **Random functional-graph heuristics.** A random map on `N` points has
   rho-tail of order `√N` (**UNVERIFIED** as to the constant `√(πN/8)`: I did not
   fetch Flajolet–Odlyzko's *Random mapping statistics*, and searched for it).
   Here `N = 2ⁿ`, the measured tail is `1.26 n`, and the attractor has `O(n)`
   points — 114 at `n = 31` — where a random map's cyclic points number `≈ √N`,
   about 46,000. So no probabilistic null is available for anything about `T`'s graph:
   the "it survived, and a coin would too" argument that kills so many routes on
   this board is *not* available here, and neither is its comfort.
7. **Cycle-joining / de Bruijn adjacency-graph theory.** The field's technique is
   to merge short cycles into long ones by flipping feedback on a conjugate pair.
   `T`'s cycles are not something one designs; the question is when one *appears*.
   No theorem points that way.
8. **`F₂[[x]]` and algebraicity.** With `r` as a power series over `F₂`, `XOR` is
   `+` and `4r` is `x²r`, so the map is `x²r + (2r ∨ r)`, and `∨` has no
   expression. One operation wide, and it is the whole difficulty. (The
   automatic-sequence connector reached the same wall from Christol's side; I
   record it because from *here* it looks like a normal-form problem and it is
   not.)
9. **The co-moving frame.** Setting `u_t = ⌊rₜ/2ᵗ⌋` makes the centre column
   coordinate 0 of `u`. But `u_{t+1}` is not a function of `u_t`: it needs
   `bit_{t−1}(rₜ)`. The composite `σ ∘ T` (shift after step) is 2-Lipschitz, not
   1-Lipschitz, so it leaves the T-function category entirely. I spent real time
   on this and it is the cleanest statement of why the vantage cannot reach the
   residual: **the residual is exactly one bit of shift outside the category.**
10. **ANF / algebraic immunity.** Degree of the `t`-step centre function is
    maximal at 21 of 23 depths, monomial density `0.53`. Dead by measurement.
10a. **The Mahler expansion.** This was the one I expected to survive, because
    it is the normal form Anashin's whole apparatus is written in and it does not
    obviously need bijectivity. It is dense — 255 of the first 257 coefficients
    nonzero — and `v₂(a_k)` sits at the 1-Lipschitz floor `⌊log₂ k⌋` infinitely
    often. Klimov–Shamir's own `x + (x² ∨ 5)` has a three-term expansion, which
    is exactly why their machinery computes on it and not on this. Dead by
    measurement, and this is the sharpest answer this document has to the brief's
    normal-form question.
11. **Toeplitz reading of `settledCenter`.** A sequence whose `k`-th term is
    determined by `k` modulo a growing power of two looks Toeplitz. It is not:
    here the modulus is chosen by which *plateau* `k` falls in, i.e. by `k`'s
    size, not by its residues, so the Toeplitz filling never starts.
12. **"The attractors form an inverse system, so take the limit."** They do, and
    the bonding maps are surjective (0 non-liftable states, `n = 9…20`). But
    most of the small cycles are truncation artefacts — the 4 fixed points at
    level `n` are `0`, `2ⁿ⁻¹`, `2ⁿ⁻¹+2ⁿ⁻²`, `2ⁿ⁻²+2ⁿ⁻³`, which are fixed only
    because their propagation runs off the top of the word. Their positions move
    with `n`, so they are not a compatible family: `2ⁿ` at level `n+1` reduces to
    `0`, not to `2ⁿ⁻¹`. The tower is still surjective (0 non-liftable states,
    `n = 9…20`) — each artefact is the reduction of *something* — but not by
    matching artefact to artefact, so the limit is not the clean object the
    picture suggests, and it is certainly not "the settled region" without an
    argument separating artefacts from the rest.
13. **"Somebody has studied this map."** Asked plainly, as the brief instructs:
    I could not find it. The rows-as-integers sequence is in OEIS as **A110240**
    (verified through MathWorld's citation of it, in the mirror bit order), and
    the centre column is **A051023**. I found no paper, in eight web searches,
    treating rule 30's row map as a T-function, as a 1-Lipschitz map on `ℤ₂`, or
    as an `n`-bit word operation with a cycle structure. Wolfram 1986 (held)
    discusses shift registers, but as *linear* FSR analogies for rule 60, and
    §5's "This instability implies that information on localized changes
    eventually propagates throughout the cellular automaton" is the closest it
    comes to the triangular structure. This is a negative search result, not a
    novelty claim: the search cannot be complete, and a captain should read it as
    "not found in eight searches and one held corpus", nothing more.

---

## 5. What to hand the theorist

**Topic A — the all-starts rho-tail bound (from §3.1).** Falsify:

> For every `n ≥ 1` and every `r < 2ⁿ`,
> `T^{2(n−1)}(r) ≡ T^{2(n−1) + 2ⁿ⁻¹}(r) (mod 2ⁿ)`, where
> `T(r) = 4r ⊕ (2r ∨ r)`.

This implies `leftDiagonal_onset_le` and mentions no automaton, no seed, no
damage front. The dictionary row it depends on is the single line
`leftDiagonal k j = bit_k(rowNat (j+k))`, which is definitional and
kernel-checked. Depth reached here: exhaustive to `n = 31` (`2³¹` starts), worst
tail `39` against an allowed `60`, worst ratio `1.381` at `n = 19`. The one thing
already known to fail is the naive induction: `maxTail(n+1) ≤ maxTail(n) + 2` is
**false** at `n = 18 → 19` (22 → 26), so the argument must be amortized over
levels. Obstruction 6 says the same thing about the front; this says it about a
max over a finite set, where a retreat costs nothing, and that is a genuinely
different shape of induction to try.

**Topic B — the doubling positions as first-appearance moduli (from §3.2).**
Falsify:

> `|attractor(n)| − |attractor(n−1)|` equals the maximum cycle length of
> `T mod 2ⁿ`, for every `n ≥ 5`; and the least `n` with a cycle of length `2^d`
> is `a(d)+1` for the doubling sequence `a = 3, 8, 29, 400, 87867, …`, at which
> `n` that cycle is unique.

Exact and exception-free for `5 ≤ n ≤ 31`, with the `n = 30` case predicted
before it was computed and confirmed (`1×4 2×5 4×21 8×1`, attractor 106). The
dictionary row it depends on is "eventual period of left diagonal `k` = cycle
length of the orbit of 1 mod `2^{k+1}`", verified by the least-return-period
table (`1,2,4,8,16` at `k = 0–2, 3–7, 8–28, 29–399, 400–5000`) and kernel-checked
at the `k = 29` transition. What would settle it cheaply: enumerate the attractor
at `n = 40` from the settled-word orbit map rather than the state space, and
check `186`.

I would spend the session on **A**. It is the one statement in this document
that, if proved, closes a wall the board is actually holding, and it is now
stated in a form with no cellular automaton in it and a computable falsifier at
every `n`. **B** is a change of venue and a good one, but it settles a different
wall and its uniqueness half rests on three data points.

I would spend no session on the T-function *criteria* (§3.4): they are vacuous
for `T` and I have kernel-checked why, so that is a saving rather than a lead.

---

## 6. Next vantage

**Non-invertible profinite dynamics and the geometry of the trees**, and if that
name has no field behind it, then **the theory of transients in finite
functional graphs of structured (non-random) maps** — the corner of combinatorics
where rho-lengths are proved rather than estimated. This document's whole finding
is that the T-function world has beautiful theorems about the *cycles* of a
triangular map and, as far as I could reach, none at all about the *tails*, while
the residual and the onset wall both live entirely in the tails. Somebody should
attack from wherever tails are the object: the depth of a functional graph, the
height of the tree above an attractor, the number of iterations to reach the
eventual image. Candidate homes I could see from here but not enter: the theory
of *finitary factors* and coalescence times in interacting particle systems,
where "time for all starts to couple" is exactly `maxTail`; the theory of
*synchronizing automata* and Černý-type bounds, where "a word that drives every
state into a fixed set" is `T^{2(n−1)}` and the quadratic-versus-linear question
is the same one; and the *ergodic theory of cellular automata's transient
behaviour* rather than their limit sets. The synchronizing-automaton reading is
the one I could not reach and most want read: `T mod 2ⁿ` is a one-letter automaton
on `2ⁿ` states whose image collapses to 114 states, at `n = 31`, after `1.26 n` steps,
which is an extraordinarily fast collapse, and the field that measures exactly
that collapse is Černý's, not Klimov's. A connector who knows that literature
should be told that the attractor is `O(n)` and the depth is `O(n)` and asked
whether either is the shadow of a theorem.

The one I could not reach from where I stood, concretely: **the ergodic theory of
the transient, on the trees rather than the attractor.** I wrote this paragraph
first with the Mahler expansion in it, as the thing I had not computed and most
wanted computed; I then computed it (§3.5), it came back dense and extremal, and
the hope died within the hour — which is the right outcome for a
"next vantage" line and the reason I am recording the reversal rather than
quietly deleting it. What is genuinely out of reach from here is any account of
*where in the trees* the seed sits. The attractor of `T mod 2³¹` has 114 states
and the trees hold the other two billion; the residual is a statement about one
path through those trees, read along its diagonal, and no field I sighted has a
name for a distinguished path in a functional graph's forest. The nearest thing
I can see is the theory of *coalescing random walks* and finitary coding, where
"which tree, and how deep" is the object; a connector who knows that literature
should be handed the two numbers — attractor `O(n)`, depth `1.26 n` — and asked whether a
forest that shallow above an attractor that thin has ever been analysed. If the
answer is no, the honest report is that rule 30's row map is a genuinely
unstudied kind of object, and that is worth knowing plainly.
