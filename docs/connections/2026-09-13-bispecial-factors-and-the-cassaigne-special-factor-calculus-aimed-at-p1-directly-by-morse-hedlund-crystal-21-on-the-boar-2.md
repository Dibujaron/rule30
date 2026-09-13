# Sighting — bispecial factors and the Cassaigne special-factor calculus, aimed at P1 directly

**Vantage.** Combinatorics on words run the way the subject runs: prove
`p(n) ≥ n+1` for every `n`, i.e. exhibit a right-special factor of the centre
column at every length, via the Cassaigne calculus
`s(n+1) − s(n) = Σ_{v bispecial, |v| = n} m(v)`.

**Connector.** Groma, 2026-09-13. A sighting, not a proof. Every row is a bearing
taken from one station, and the seam is the entry I care most about getting
right.

**The verdict in one line.** The Cassaigne calculus itself is **dead on this
object for a measurable reason** — every factor of the centre column up to length
10 is bispecial with bilateral order exactly `+1`, so the identity is an exact
tautology `2^n = 2^n` and carries no information (§3.1) — but one of the
mechanisms the vantage asked me to price is **live, and is the strongest thing I
have found**: Kamae and Zamboni's *maximal pattern complexity*, whose threshold
is `2n` over **non-contiguous** windows, gives a ladder whose conjunction is
exactly P1 and whose rungs are **zero-entropy targets at every `n`** — which is
precisely and exactly the board's own criterion for a target the cone can see,
and the board's occurrence ladder fails that criterion from rung 3 (§3.2). The
cone search terminates exhaustively on KZ rung 2 out to cone distance 14 and on
rung 3 out to 12. **Band: Novel, and small** — the object is a ladder, not a
proof; what is new is the pairing of a 2002 theorem with this board's own
2026-09-12 cone criterion, and the pairing is a measurement plus one argument,
not a theorem. The board's compactness obstruction applies to this ladder as it
does to the board's own period ladder, so the *whole* ladder is at family
difficulty; what it buys is the shape of the individual rungs, and **rung 2 turns
out to be Condrey's published theorem with one black cell per period instead of
none** (§3.2, §5).

**The brief offers two pieces of proved structure as feedstock, and both are
refuted here.** `leftDiagonal_period_unbounded` cannot feed an aperiodicity
argument, because rules 90 and 150 have unbounded left-diagonal periods and
eventually constant centre columns — kernel-decided, with a rejected mutant
beside it (§3.3). And `rule30_leftPermutive` supplies the special factors **for
free over the class of all configurations**, `p(n) = 2^n` at every `n`, so it
gives nothing about one orbit; the cone is the only thing that ever breaks that
freeness, and it bites at prefix length exactly the cone distance (§3.7).

**And one correction to the brief, which must be made before its control is
used.** The brief's control — *"the left diagonals at `j ≥ 1` … ARE eventually
periodic, so any mechanism that would prove every diagonal read aperiodic is
wrong"* — is **mis-indexed, and at `j ≥ 1` it is not a control at all**. See §1.

---

## 1. The problem, seen from outside

**Without any of this project's vocabulary.** Draw an infinite black-and-white
picture: the top row is white everywhere except one black cell, and each later
row is got from the one above by colouring each cell from the three cells above
it — the new cell is the left one XOR (the middle one OR the right one). Read
straight down the vertical line through the original black cell. That is an
infinite sequence of bits. Every statistic anyone has applied to it says fair
coin. What is unproved is that it **never becomes periodic**: that there is no
`p > 0` and no row `N` past which the line simply repeats every `p` rows.

Everything already established may be granted; in particular it is a theorem
here that no two distinct verticals are both eventually periodic, which makes the
wall this brief names logically identical to the aperiodicity above. Nothing
below treats it as weaker.

**Restated in the vantage's own terms, which are combinatorics on words.** Let
`c ∈ {0,1}^ℕ`, let `L_n` be its set of factors of length `n` and `p(n) = |L_n|`.
Write `s(n) = p(n+1) − p(n)`. A factor `w` is *right-special* when both `w0` and
`w1` are factors; over a binary alphabet `s(n)` is exactly the number of
right-special factors of length `n`. Morse–Hedlund —

> "a sequence `x` over a finite alphabet is ultimately periodic if and only if,
> for some `n`, the number of different factors of length `n` appearing in `x` is
> less than `n+1`." — <https://arxiv.org/abs/1109.5801>

— says `c` is eventually periodic iff `p(n) ≤ n` for some `n`, so

> **P1 ⟺ `s(n) ≥ 1` for every `n` ⟺ there is a right-special factor of the
> centre column at every length.**

Right-special factors are closed under taking suffixes (a suffix of `w` inherits
both extensions from `w0` and `w1`), so they form a tree under the suffix order,
finitely branching. "Right-special at every length" therefore says the tree is
infinite, and König's lemma turns that into a single infinite object:

> **P1 ⟺ there is a left-infinite word `… u_{-2} u_{-1}` every suffix of which is
> a right-special factor of the centre column.**

Equivalently, and this is the form with the most rule-30 content in it: *for
every `N` there are two times `t ≠ t'` at which the centre column's previous `N`
bits agree and its next bit differs* — **no finite-memory predictor of the centre
column from its own past is ever right forever.** That phrasing makes visible why
P1 sits underneath P3: "no `N`-bit-memory shortcut" is the bounded-memory
special case of "no polynomial-time shortcut", which is why the board's
`periodic_polyTime` gives `P3Core → P1` and not the reverse.

**What the board's measurement buys, in these units, and it is arithmetic rather
than a result.** `p` is non-decreasing, so a single `n₀` with `p(n₀) = 2^{n₀}`
gives `p(n) ≥ 2^{n₀} ≥ n+1` for **every** `n ≤ 2^{n₀} − 1` at one stroke. The
board's census has `p(n) = 2^n` to `n = 14`; measured here over the first
1.2 · 10⁶ rows the largest such `n₀` is **16** (`explorer/groma2_filter.mjs`, `p`
counted over the whole prefix: `p(16) = 65,536` exactly, `p(17) = 131,058` of
`131,072` and so sample-limited), so Morse–Hedlund's inequality is verified for
every `n ≤ 65,535` and first has a chance of failing at `n = 65,536`. That is a
weaker statement than the board's direct
period sweeps and it is the honest translation of the census into the vantage's
own units; it is stated here because a reader of this document will otherwise
ask what `p(n) = 2^n` to `n = 14` is worth against a criterion quantified over
all `n`, and the answer is "every `n` up to `2^{n₀} − 1`, free". **Band: Nothing**
— it is the monotonicity of `p` and no more.

### The brief's control is mis-indexed, and at `j ≥ 1` it is not a control

The brief offers, as the sharp control, that *"the left diagonals at `j ≥ 1` are
the same kind of object read from the same diagram and ARE eventually periodic"*,
and asks where a mechanism fails at `j ≥ 1` but not at `j = 0`. Read
`Basic.lean:88`: `leftDiagonal k j = evolve (j + k) (-(j : ℤ))`, a
two-parameter array `A(k, j)`.

| reading of `A` | what it is | eventually periodic? |
|---|---|---|
| **row**: `k` fixed, `j` varying | left diagonal `k` | **yes**, `leftDiagonal_periodicFrom_pow`, period `2^{d(k)}` |
| **column**: `j` fixed, `k` varying | `A(k, j) = evolve (k+j) (−j)` = column `−j`, time-shifted | **`j = 0`** is the centre column, P1; **`j ≥ 1`** are columns `−1, −2, …` |

`CLAUDE.md`'s line "the centre column is the `j = 0` slice of the left-diagonal
family" is about the **column** reading. The objects that are proved eventually
periodic are the **rows**, indexed by `k`. So the brief's "`j ≥ 1`" names the
columns `−1, −2, −3, …`, and those are **not** eventually periodic and are not
expected to be: by the board's proved Jen's theorem at most one column of the
whole picture is eventually periodic, so a mechanism that proved every `j ≥ 1`
slice aperiodic would be proving something the board believes. **There is no
wrong-side control among the `j`-slices.** The real control is the *rows*, and
the asymmetry it names is not a paradox at all: an array may perfectly well have
every row eventually periodic, with unbounded periods, and a column that is not —
and the board already has the reason, in its first obstruction, *"The diagonal
structure never reaches the centre column"*: index `j = 0` lies in the transient
of every row past the third, and the rows' periodicity is a statement about their
tails.

I restate the control in the form that survives, and it is stronger than the
brief's because it is a **directional** statement about the whole picture rather
than about one family (§3.4): measured over `10⁵` rows, **the only reads of the
rule 30 space-time diagram with bounded factor complexity are the two cone-edge
directions.** Every interior direction sampled, including the centre column, has
`p(n) = 2^n` to the sample limit.

## 2. Fields sighted

| Field / theory | The object there | The seam, in one line |
|---|---|---|
| **Maximal pattern complexity** (Kamae–Zamboni 2002) | `p*(n) = sup` over `n`-element **non-contiguous** windows of the pattern count; aperiodic ⟺ `p*(n) ≥ 2n` for all `n` | the one live row: the rung-failing language is zero-entropy at every `n` (§3.2), which is the board's own criterion for cone-visibility — but the cone gives the *class*, not the *orbit* (§3.2's last seam) |
| Cassaigne's bispecial calculus (Cassaigne 1997) | `ΔC(n+1) − ΔC(n) = Σ_w B(w)` over factors of length `n`, `B` the bilateral order | every factor of the centre column to `n = 10` is bispecial with `B = +1`, so the identity reads `2^n = 2^n` and has no content (§3.1) |
| Morse–Hedlund, factor complexity | `p(n)`, `s(n)`, the suffix tree of right-special factors | the criterion runs the right way for once, but a finite computation gives only lower bounds on `p(n)` at small `n`, and P1 quantifies over all `n` |
| Cyclic complexity (Cassaigne–Fici–Sciortino–Zamboni 2017) | `c(n)` = number of conjugacy classes of length-`n` factors; bounded ⟺ ultimately periodic | conjugacy forgets where in the window a bit sits, and the cone argument is entirely about *where*: the rung-failing language is not factorial in a usable way (§4) |
| Directional / expansive subdynamics (Boyle–Lind) | the set of directions in which the `ℤ²` space-time action is expansive | supplies the control the brief wanted: the degenerate directions are exactly the two cone edges (§3.4); the field itself was sighted 2026-09-08 |
| Rauzy graphs | `G_n`: vertices `L_n`, edges `L_{n+1}`; aperiodic ⟺ `G_n` is never a single cycle | a relabelling of the special-factor count; no independent lower-bound mechanism in it (§4) |
| Return words and derived sequences (Durand) | finitely many derived sequences ⟺ primitive substitutive | the conclusion class *contains* the periodic sequences, so it cannot separate the two sides — already killed in my 2026-09-10 sighting |
| Morphic sequences, Pansiot, Devyatov's dichotomy | subword complexity of a morphic sequence is `O(n log n)` or `Θ(n^{1+1/k})` | rule 30's column has no morphism; and crystal 73 already excludes 2-automatic by measurement |
| Equicontinuity and blocking words (Kůrka) | a blocking word bounds a column subshift's complexity **from above** | dead by left-permutivity: right Lyapunov exponent 1 at every configuration, so no blocking word at any length (my 2026-09-10 §3.2) |
| Pattern-Sturmian classification (Kamae–Rao; recent work) | the sequences with `p*(n) = 2n` are rotations by two intervals, or nearly simple Toeplitz | **not** the enemy: these are the *aperiodic minimisers*, the sequences that clear every rung with nothing to spare, not the sequences that fail one (§4) |
| Two-dimensional low complexity (Nivat; Cyr–Kra; Kari–Szabados) | `P(m,n) ≤ mn` forces periodicity | dead at `n = 1`: `P(2,1) = 4`, the maximum, against a budget of 2 — measured in my 2026-09-10 sighting |
| Finite-memory prediction / P3 | "no right-special factor of length `N`" = "the next bit is a function of the last `N`" | P1 is the bounded-memory special case of P3; the board owns the implication already (`periodic_polyTime`), so this is orientation and not a route |
| The left-diagonal array as a generated tower | `A(k,·)` from `A(k−1,·)`, `A(k−2,·)` and the constant `A(k,0) = centerColumn k` | the centre column is exactly the tower's **free input**, the left twin of the board's recorded right-diagonal obstruction (§3.3) |
| Permutive cellular automata (Hedlund; Kůrka) | `rule30_leftPermutive`, the brief's other offer of proved structure | it supplies the special factors **for free over the class** — `p(n) = 2^n` at every `n` — and therefore nothing for one orbit; the cone is the only thing that breaks the freeness, and it bites at length exactly `a` (§3.7) |
| Jen 1990 / Kopra 2022 | the width-1 and width-2 trace of a configuration white far to the left | the nearest published theorems; Kopra prices the family version of this residual as equally hard for the whole class |

## 3. Connections

### 3.1 The Cassaigne calculus is an exact tautology on this object

**The claim.** The bispecial calculus cannot produce a lower bound for the centre
column, and the reason is not that the bispecial factors are hard to enumerate —
it is that **there are the maximum possible number of them and each contributes
the maximum possible amount**, so the identity the calculus asserts is satisfied
by both sides being `2^n` and it says nothing whatever.

**What the calculus is.** From a paper this project can fetch, stated for an
arbitrary infinite word `u` with `C` its complexity and `ℒ(u)` its language:

> "A factor `w` is right special if `#ℰᵣ(w) ≥ 2`" … "A factor `w` is bispecial if
> `w` is both left special and right special" … the bilateral order is
> "`B(w) = #{awb ∈ ℒ(u) | a,b ∈ 𝒜} − #ℰₗ(w) − #ℰᵣ(w) + 1`" … and
> "`ΔC(n+1) − ΔC(n) = Σ_{w∈ℒₙ(u)} B(w)`"
> — *Sequences with constant number of return words*,
> <https://arxiv.org/html/math/0608603v4>

The original is Julien Cassaigne, *Complexity and special factors*, Bull. Belg.
Math. Soc. Simon Stevin **4** (1997) 67–88 (bibliographic details fetched from
<https://eudml.org/doc/119937>; the paper's own text I could not fetch — the
publisher PDF is not reachable from here, so the *statement* above is quoted from
a paper that restates it and **the attribution to Cassaigne 1997 is UNVERIFIED
at the level of his own words**, searched as `Cassaigne 1997 complexity bispecial
factors "bilateral multiplicity"` and via `iml.univ-mrs.fr`, which refused the
connection).

**The dictionary.**

| This project | Over there (Cassaigne calculus) | Seam |
|---|---|---|
| the centre column `c` | the infinite word `u` | exact; the residual is about one orbit, the calculus is about one word — this is the one place in the whole document where the orbit/class distinction costs nothing |
| a window of `n` consecutive centre cells | a factor of length `n` | exact |
| the board's horizon count (obstruction *Counting the right sides…*) | `s(n)` = the number of right-special factors | identified in my 2026-09-10 sighting §3.3; the rates do not match, so this is structural only |
| P1 | `s(n) ≥ 1` for every `n` | exact, by Morse–Hedlund |
| the picture's cone | *nothing* | the calculus knows only the word, so the one structure rule 30 has is invisible to it |
| a bispecial factor of length `n` | a factor with two left and two right extensions | exact |
| the bilateral order `B(w)` | `−1`, `0` or `+1` on a binary alphabet | exact |
| "few bispecial factors, mostly neutral" — the hypothesis of every worked instance | a morphism or an automaton generating them | **the seam that kills it**: rule 30 supplies neither, and worse, supplies the opposite |

**The test, run, and it is decisive.** `explorer/groma2_cassaigne.mjs`, block
`[A]`, over rows 100,000–200,000 of the seed, restricted to `n ≤ 10` where the
length-`n+2` factor set is complete on the sample so the extension sets are exact
rather than sample-limited:

| `n` | `p(n)` | `s(n)` | bispecial | neutral `B=0` | strong `B=+1` | weak `B=−1` | `Σ B` | `s(n+1) − s(n)` |
|---|---|---|---|---|---|---|---|---|
| 1 | 2 | 2 | 2 | 0 | 2 | 0 | 2 | 2 |
| 5 | 32 | 32 | 32 | 0 | 32 | 0 | 32 | 32 |
| 10 | 1024 | 1024 | 1024 | 0 | 1024 | 0 | 1024 | 1024 |

(the rows between follow the same pattern exactly). **Every factor is bispecial,
every bilateral order is `+1`, and the identity reads `2^n = 2^n` at every
length.** In print the calculus earns its keep the other way round: the worked
instances have `O(1)` or `O(n)` bispecial factors, most of them neutral, and the
few non-neutral ones are located by a morphism. Here there are `2^n` of them and
not one is neutral. So the calculus has nothing to enumerate over, and the
second difference of `p` is being computed from itself.

**What it would give.** Nothing, and that is the point of running it: the
vantage's headline machinery is refuted on this object by one table, and a
theorist sent at "find the bispecial factors of the centre column" would be sent
at the whole language. **Band: Project-internal**, closing a route.

### 3.2 The Kamae–Zamboni ladder is the weakest ladder whose conjunction is P1, and every rung of it is a zero-entropy target

**The claim, as sweeping as I believe it.** The board's occurrence ladder is
refuted above rung 2 because it asks for too much — it proves the centre column's
orbit closure is the full shift, where P1 needs only aperiodicity. Replace the
contiguous window by an arbitrary `n`-element window and the threshold `2^n` by
`2n`, and you get a ladder that is (i) **exactly equivalent to P1** when
conjoined over all `n`, by a 2002 theorem; (ii) **strictly weaker rung by rung**
than the occurrence ladder, so rung 1 is already a closed node here and rung 2 is
already reachable; and (iii) — the part that matters — **zero-entropy at every
rung**, which is precisely the property the board's own 2026-09-12 obstruction
identifies as the criterion for a target the cone can bound. The occurrence
ladder's targets have entropy `log λ_S ≥ log 1.755 > 0` from length 3 on, and
that is why it dies at rung 3. The KZ ladder's do not.

**What it leans on, fetched.**

> "The *maximal pattern complexity* of `x` is defined by
> `p_x^*(k) := sup_{S∈Σ_k(ℕ)} p_x(S)`."
>
> "**Theorem 1.1** … Let `x ∈ 𝔸^ℕ`. Then the following statements are
> equivalent: (i) `x` is ultimately periodic. (ii) `p_x^*(k)` is uniformly
> bounded in `k`. (iii) `p_x^*(k) < 2k` for some positive integer `k`."
> — <https://arxiv.org/html/2608.21084> (*Abelian maximal pattern complexity of
> two-dimensional words*), which attributes Theorem 1.1 to its reference [7]

and the attribution, from a second fetched page:

> "In 2002, Kamae and Zamboni introduced maximal pattern complexity and
> determined that any aperiodic sequence must have maximal pattern complexity at
> least `2k`." — <https://arxiv.org/abs/2505.05627>

*(I did not reach Kamae and Zamboni's own 2002 paper; both quotes above are from
papers that restate it, fetched and quoted in full. The theorem number `1.1` is
the restating paper's, not theirs. **UNVERIFIED at the level of the original**,
searched as `Kamae Zamboni maximal pattern complexity 2k periodic sequence
theorem`.)*

**The dictionary.**

| This project | Over there (maximal pattern complexity) | Seam |
|---|---|---|
| the centre column `c` | the infinite word `x ∈ 𝔸^ℕ` | exact |
| the board's **occurrence rung `n`**: every word of length `n` occurs in `c[a, m·a]` | the contiguous window `S = {0,…,n−1}` sees all `2^n` patterns | exact; it is the `S` contiguous, threshold `2^n` corner of the KZ definition |
| the **KZ rung `n`**: some `n`-element `S ⊆ ℕ` sees `≥ 2n` patterns in `c[a, m·a]` | `p_x^*(n) ≥ 2n` | exact; and `2n ≤ 2^n` for `n ≥ 1`, so **occurrence rung `n` ⟹ KZ rung `n`**, and not conversely |
| conjunction of all occurrence rungs | the orbit closure of `c` is the full shift `{0,1}^ℤ` | **strictly stronger than P1** — this is why the board's ladder is refuted from rung 3 |
| conjunction of all KZ rungs | `x` is not ultimately periodic | **exactly P1**, by the theorem above |
| rung 1 | both colours occur infinitely often | already `centerColumn_window_not_constant`, proved; `f(1,a) = a+2`, reproduced here |
| the board's cone class `A2(a)` (white at `x < −a`, black at `−a`) | the set of words realisable as a column tail under a bounded left cone | exact: row `N` of the seed lies in `A2(N)` by `evolve_eq_false_of_outside_cone` and `evolve_left_edge` |
| `f(n, a)` = longest rung-failing block over `A2(a)` | the length at which the target's population goes extinct | exact; the board's instrument, aimed at a new target |
| `λ_S`, the growth rate of the target's language | the entropy of the rung-failing subshift | exact, and here it is **1** at every `n` (below) |
| "a periodic centre column" — the enemy under Morse–Hedlund | the words failing rung `n`, characterised in §3.6 | **not** the pattern-Sturmian classification: that describes the *aperiodic minimisers* `p^*(n) = 2n` (rotations by two intervals, nearly simple Toeplitz), which are sequences satisfying every rung with no slack, not sequences failing one. I had this row the wrong way round for an hour |
| the seed's own orbit | the class `A2(a)` | **the seam that matters, and it is the board's recurring one**: the cone bounds a block over a *class*, and obstruction 9's lesson is that class statements and orbit statements come apart. Here they do not, because the class contains the seed's own rows — but only because the quantifier is over `a` as well as `n` |

**Why the rungs are zero-entropy, and this is an argument rather than only a
measurement.** Let `Y_n = { x : p_x^*(n) < 2n }`, the infinite words that fail
rung `n`. `Y_n` is shift-invariant, and it is closed (if `x_k → x` then every
pattern of `x` at a given window is a pattern of `x_k` for large `k`, so `x`
inherits the bound). By the theorem above every member of `Y_n` is ultimately
periodic; a closed shift-invariant set contains the orbit closure of each of its
points, and the orbit closure of an ultimately periodic sequence is its periodic
part, so `Y_n` consists of **periodic** sequences. If their periods were
unbounded, `Y_n` would contain a limit point of periodic sequences of growing
period, which is not periodic — contradiction. So **`Y_n` is a finite union of
finite orbits, and has zero entropy, at every `n`.** Nothing analogous is true of
the occurrence rungs: the set of sequences missing a fixed word of length 3 has
entropy `log 1.755`.

**The test, run, three ways.**

*(a) The language count, exact and cross-checked.* `explorer/groma2_kz2.mjs`
counts `|L_n(m)|`, the binary words of length `m` in which **every** `n`-window
inside the word sees fewer than `2n` patterns — the finite-word version of `Y_n`,
with no span bound. A DFS with incremental pattern masks and a brute-force sweep
over all `2^m` words, sharing no code, agree at **9 of 9** cells tested
(`n = 2,3,4` × `m = 10,14,16`). The counts:

| `n` | `|L_n(m)|` near the top of the range | `λ = c(M)/c(M−1)` | `log₂(c(M)/c(M/2))` |
|---|---|---|---|
| 2 | `m = 30…34`: 1290, 1380, 1472, 1568, 1666 | 1.0625 at `M = 34` | **2.058** |
| 3 | `m = 30…34`: 10554, 11578, 12714, 13888, 15136 | 1.0899 at `M = 34` | **2.903** |
| 4 | `m = 26…30`: 19266, 21668, 24380, 27160, 30350 | 1.1175 at `M = 30` | **3.062** |

The second differences of the `n = 2` row are `2, 4, 2, 4, 2, 4, 2` — a quadratic,
not an exponential. **The growth is polynomial, of measured degree `2.06`, `2.90`
and `3.06`, so `λ = 1` at every rung measured**, which is what the argument above
predicts and what the
board's criterion asks for. Contrast the occurrence targets in the same
instrument: `λ = 1.618` at `n = 2` and the count is still exponential and capped
at `n = 3, 4` (`explorer/groma2_kz.mjs`, block `[A-control]`).

*(b) The cone search, exhaustive.* `explorer/groma2_filter.mjs`, class `A2(a)`,
unbounded window span, survivors grown one row-0 cell at a time by a two-anti-
diagonal incremental evolution that reproduces the seed's own centre column
`1101110011000101100100` cell for cell before any search is run:

| rung | `f(a)`, `a = 1, 2, 3, …` |
|---|---|
| KZ rung 1 = occurrence rung 1 | `3 4 5 6 7 8 9` to `a = 7` — i.e. `a+2`, the board's own `f(1,a)` |
| **KZ rung 2** | `11 12 12 13 14 16 18 23 24 24 23 24 26 28` to `a = 14`; `≥ 30` at `a = 15` (node budget) |
| **KZ rung 3** | `16 15 16 15 17 18 21 24 25 26 30 29` to `a = 12` |

Every entry listed terminated **exhaustively**, with the survivor population
reaching zero rather than a cap (`explorer/groma2_deep.mjs`, depth-first with
undo; `8.7 · 10⁷` nodes at rung 2, `a = 14`). For comparison in the same
instrument, the board's occurrence rung 3 and the disjunctive occurrence rung 2
both run past the cap at `a = 1`, consistent with the board's verdict that they
escape.

*(c) Crystal 66's filter, and it fires the right way.* The mechanism uses the
cone and left-permutivity, so it ought to survive `OR → XOR` if it is not rule
30's. It does not:

| rule | KZ rung 2 | KZ rung 3 |
|---|---|---|
| **30** | `11 12 12 13 14 16 18 23 …` — exhaustive at every `a` reached | `16 15 16 15 17 18 21 24 25 26 30 29` — exhaustive |
| 90 | alive at the depth limit 70, already at `a = 1` | alive at the depth limit 70, at `a = 1` |
| 150 | alive at the depth limit 70, already at `a = 1` | alive at the depth limit 70, at `a = 1` |

So the finiteness is created by the `OR` and not by the cone. (Rule 45, the only
other elementary rule that climbs the board's occurrence ladder, is **not** a
control here and its row has been discarded — see §4.)

*What I have at rung 4 is weaker and is labelled as such.* At **bounded** window
span `D = 6` the search terminates exhaustively for rule 30 at every `a ≤ 7`, at
rungs 2, 3 and 4 alike: `f(4, a) = 16, 15, 16, 19, 20, 20, 23`
(`explorer/groma2_kz.mjs`, block `[B]`). Bounded span is the conservative
direction — failing at unbounded span implies failing at span 6, so
`f(n, ∞, a) ≤ f(n, 6, a)` — and the two measurements, made by different search
strategies in different files, respect it at every cell: at rung 2 the span-6 row
is `11 12 12 13 14 16 19` against the unbounded `11 12 12 13 14 16 18`. But a
bounded-span target is **not** zero-entropy (§4), so this row is a datum and not
an instance of the mechanism.

**What it would give if it held.** A ladder to P1 with a proved bottom rung, a
reachable second rung, and — unlike the occurrence ladder — no entropy
obstruction at any rung. `f(n,a) < ∞` for every `n` and every `a` **implies P1**:
row `N` of the seed is in `A2(N)`, so every tail of the centre column satisfies
KZ rung `n` within `f(n,N)` steps, so `p^*(n) ≥ 2n` for every `n`, so by the
theorem the centre column is not ultimately periodic. What would remain is
everything: a *proof* that `f(n,a)` is finite, at every `n` and every `a`, which
this document does not have and does not claim.

**The board's compactness obstruction applies to this ladder too, and it is the
most important thing in this section after the ladder itself.** The obstruction
*"The period ladder's finiteness question is Kopra's family question"* observes
that the cone class is compact and "the block fails the target" is a closed
condition, so `f(n,a) = ∞` **iff** some configuration in `A2(a)` fails rung `n`
for ever. My ladder is not exempt: `f(n,a) < ∞` at every `n` and `a` is exactly
*"no configuration white far to the left with a leftmost black cell has an
eventually periodic centre column"*, which Kopra prices in print as *"probably
equally difficult for all configurations of `N(Σ₂)`"*
(`sources/kopra-2022-natural-class.txt`). **So the whole ladder is the family
version of P1, at family difficulty, exactly as the board's period ladder is.**

What that does *not* do is flatten the rungs, and this is where the KZ ladder
earns its keep. Rung by rung, the family statement is narrow and has a precedent.
By the same compactness, `f(2,a) < ∞` at every `a` says exactly *no configuration
in the class has a centre column with `p^*(2) < 4`*; and by §3.6 every such
column is eventually periodic with **at most one black cell per period, or at
most one white cell per period**. So the rung is *implied by* — and is a little
weaker than — the Condrey-style claim that no configuration in the class has such
a column. (The gap is the pre-period: a column can be eventually one-black-per-
period and still reach `p^*(2) = 4` on its transient, and then it does not
witness `f = ∞`.) The zero-black case of that claim is
`centerColumn_not_eventually_constant`, and its family version for finite
configurations is a theorem in print — Condrey, arXiv:2609.09431, whose sharp
bound `w+2` is the `f(1,a) = a+2` this document reproduces in the larger class
`A2(a)`. So **rung 2 is "Condrey with one black per period instead of none"**,
which is a bounded and named next step rather than an equivalent of the prize.
Rung `n` for growing `n` walks back up to the prize, as any ladder must.

**And the honest size of it, because the board has been burned here before.**
Finite `f` at `a ≤ 14` is not finite at every `a`: the board's own obstruction
records that the `00`-free target is exhaustively finite at small `a` and has a
threshold at `a* = 5`, above which the population survives. What makes this case
structurally different from that one is `λ`: the `00` target has `λ = φ > 1`, so
a threshold is expected; the KZ targets have `λ = 1`, which is the class the same
obstruction says the cone sees at *every* `a`. That is a prediction, not a proof
— and it is an **extrapolation of the criterion as well**, because the criterion
was calibrated over 26 *word-avoidance* targets, where `λ_S` is the growth rate
of an `S`-free language, and the KZ target is not a word-avoidance target: it is
a factorial language defined by a global pattern count. The mechanism the
criterion names (one free bit per row, cut by the fraction of admissible
continuations) applies unchanged, but nobody has checked it outside that family.
The *direct* evidence for this section is the extinction of the cone searches,
not the criterion. Two ways to break this section, cheapest first: push `f(2,a)` past `a = 15`
(where my node budget ran out, with `f ≥ 30`) and find it running away; or find
the flaw in the `Y_n` argument above, which is the one step here that is mine
rather than quoted. The search cost grows by about a factor 3 per `a`, so
`a = 18` is roughly an hour and `a = 20` is out of reach without a better
representation than a survivor tree.

### 3.3 On the left edge as on the right, the centre column is the tower's free input — and rules 90 and 150 kill the brief's offer

**The claim.** The brief offers `leftDiagonal_period_unbounded` (proved) as
structure that might feed a complexity lower bound. It cannot, and the reason is
the exact mirror of a reason already on the board: the left-diagonal array is
generated in `k` from two rows and **one free bit per level**, and that free bit
*is* the centre column — so the array's structural theorems are theorems about
the quotient by the very sequence in question. The board records this for the
right diagonals (*"on both edges the centre column is precisely the quantity the
structure does not determine"*); it is not recorded for the left, and it is true
there for the same reason.

**The dictionary.**

| This project | Over there (the array `A(k,j) = leftDiagonal k j`) | Seam |
|---|---|---|
| `leftDiagonal_recurrence` | `A(k,j) = A(k,j−1) ⊕ (A(k−1,j−1) ∨ A(k−2,j−1))` | the board's own recurrence, one row from the two above it |
| `leftDiagonal 0` (the cone edge) | row 0 of the array, constantly black | `evolve_left_edge` |
| `leftDiagonal 1` | row 1 | — |
| `centerColumn k` | `A(k, 0)`, the **integration constant** of row `k` | `Basic.lean:88` at `j = 0`, definitionally |
| the whole left half of the picture | rows 0 and 1 plus the constants | so `(left edge, second diagonal, centre column) ↦` everything left of the origin |
| `leftDiagonal_period_unbounded` | the rows' minimal periods grow without bound | proved — and a statement about the rows' **tails** |
| the residual | a statement about the constants | **the seam**: the constants are the free coordinate; the recurrence determines the array *modulo* them |
| obstruction *"The settled part of the left diagonals does not depend on the centre column"* | the rows' tails are boundary-blind | already measured on this board over twenty boundaries; the periods are a statistic of the tails |

**What it leans on, and it is kernel-proved rather than cited.**
`explorer/groma2_scratch_dirs.lean`, accepted by `lake env lean` with no output
(so every `decide` in it went through), carries the control the brief dismisses:

- rule 30's left diagonals 3 and 8 have minimal periods 2 and 4 (both the period
  and its minimality are decided);
- **rule 90's left diagonal 16 has minimal period exactly 16 and diagonal 32
  exactly 32; rule 150's diagonal 16 has minimal period exactly 32** — so the
  linear rules' left-diagonal periods grow without bound too;
- and **rule 90's centre column is white at every `1 ≤ t < 80`, rule 150's is
  black at every `t < 80`** — eventually constant, the strongest possible failure
  of P1.

Beside it `explorer/groma2_scratch_mutant.lean` is **rejected** by Lean at
exactly the two lines it mutates (the orientation guard `1,5,17,85` and the
period claim at 8 instead of 16), which is the demonstration that the check can
fail.

**The test.** Already run: the two files above. The statement a theorist should
try to falsify is the negative — *"there is an argument from
`leftDiagonal_period_unbounded` to `¬ IsEventuallyPeriodic centerColumn` that
does not also apply to rule 90"*. The kernel file says any argument using only
"the left-diagonal minimal periods are unbounded" applies verbatim to rule 90,
whose centre column is eventually white.

**One tension with the brief, stated plainly.** The brief says *"Linear rules 90
and 150 have constant centre columns and are not controls here."* For the vantage
as a whole that is right. For **this one offer** it is wrong, and crystal 66's
filter is exactly the reason: the filter tests *reasoning*, not conclusions, and
reasoning that mentions only diagonal periods survives `OR → XOR` intact. The
rules are not a control for what the centre column *is*; they are a perfect
control for what "unbounded diagonal periods" can *prove*.

**What it would give.** Nothing toward the residual; it removes the one piece of
proved structure the brief offered as feedstock, and it does so with a kernel
check rather than an argument. **Band: Project-internal.**

### 3.4 The degenerate directions of the diagram are exactly the two cone edges

**The claim.** The brief wanted a control of the form "here is the same object
read differently, and it *is* eventually periodic". There is one, it is not the
`j ≥ 1` slices, and in its correct form it is a statement about **directions**:
read the rule 30 space-time diagram along any straight line, and the reads with
bounded factor complexity are exactly the two edges of the cone. Every interior
direction, the centre column among them, has full complexity to the sample limit.

**The dictionary.**

| This project | Over there (directional / expansive subdynamics) | Seam |
|---|---|---|
| the packed row `rowNat t`, bit `b` = cell at `x = b − t` | a coordinate on the `ℤ²` space-time picture | exact (`Basic.lean`) |
| left diagonal `k` | bit index fixed: the line `x = −t + k`, slope `−1` | eventually periodic, proved |
| right diagonal `k` | bit index `2t − k`: the line `x = t − k`, slope `+1` | purely periodic, proved |
| the centre column | bit index `t`: the line `x = 0`, slope `0` | P1 |
| a ray of slope `s − 1` | bit index `⌊s·t⌋` | the interior directions |
| "eventually periodic read" | a non-expansive direction of the `ℤ²` action | **the seam**: Boyle–Lind expansiveness is about *all* configurations; this is one orbit, so the correspondence is a resemblance and the measurement is the content |
| the settling front at `0.75 t` (obstruction *Every re-reading…*) | the boundary between the settled region and the transient band | a read at speed `s < 3/4` is eventually inside the settled region and is **still** aperiodic, because it hops between diagonals whose periods grow |

**The test, run.** `explorer/groma2_dirs.mjs`, one pass over the packed triangle
to `T = 200,000`, complexity on rows `[10^5, 2·10^5]`, `p(n)` for `n ≤ 24`:

| read | first `n` with `p(n) < 2^n` |
|---|---|
| left edge (`s = 0`) | 1 — constant |
| left diagonals `k = 0…7` | bounded at `n = 1` or `2` |
| ray `x = −0.75t`, `−0.5t`, `−0.25t` | **14** (the sample limit) |
| **centre column** (`x = 0`) | **14** (the sample limit) |
| ray `x = 0.25t`, `0.5t`, `0.75t` | 11, 10, 8 |
| right diagonals `k = 0…7` | bounded at `n ≤ 24` |
| right edge (`s = 2`) | 1 — constant |

and `explorer/groma2_slices.mjs` on the same pass separates the two readings of
the array explicitly: the **columns** `x = −8 … +8` all have `p(20) ≈ 95,300`,
which is `0.998`–`1.002` times the coupon-collector expectation for a uniform
sample of the same size, while the **rows** `k = 0 … 40` all have `p(6) ≤ 8`.

**What it would give.** It restates the brief's control correctly, and it says
what a mechanism has to be sensitive to: not `j` versus `k`, but **slope**. A
lower bound on the centre column's complexity must fail at slope `±1` and hold at
slope `0`, and the rays at slopes `−0.75` through `+0.5` say the boundary is at
the cone edges and nowhere inside. That prices the whole "read it as a diagonal"
family of ideas in one table. **Band: Project-internal.**

### 3.5 Every distinct-factor count this board publishes is quoted without its coupon-collector null

**The claim.** A distinct-factor count on a finite window is a lower bound whose
natural comparison is not `2^n` but the number of distinct values a uniform
sample of the same size would show, `2^n (1 − e^{−M/2^n})`. Without that
denominator a count can look like structure when it is measuring the sample, and
this board has published counts of both kinds side by side without distinguishing
them.

**The dictionary.** This one is a ratio, not a table: measured against the null
(`explorer/groma2_slices.mjs`),

| the board's published count | ratio to the coupon-collector null |
|---|---|
| seed centre column, length 32, tail `5·10⁵` — **499,949** | **1.0000** |
| `X_{(10)^∞}` column 1, length 1024, tail `10⁶` — **998,977** | **1.0000** |
| `X_{(10)^∞}` column 1, length 32, tail `10⁶` — **48** | `4.8 · 10⁻⁵` |
| size-5 ring phase trace, length 32, tail `1.6·10⁶` — **3,500** | `2.2 · 10⁻³` |
| Talus's calibration word at `10⁶` rows, length 32 — **525** | `5.3 · 10⁻⁴` |

**What it leans on.** Nothing outside; arithmetic and the board's own numbers.

**The test.** The first two rows are the claim: "499,949 distinct factors of
length 32 in a tail of `5·10⁵`" and "998,977 of length 1024 in a tail of `10⁶`"
are *exactly* what a fair coin gives, to five figures, so they carry no
information beyond "no window repeats", and quoting them as evidence of
complexity is quoting the sample size. The last three rows are the real signals,
three to five orders of magnitude below the null. Anyone who disbelieves this can
recompute the column in one line.

**What it would give.** An instrument correction, not a result: **report factor
counts as ratios to the null.** It is also the cheapest available guard against
the reading error the board's own calibration entry warns about — a count of 525
against a null of `10⁶` is a saturation-free regime where "low but growing" is
the right reading, and a count of 499,949 against a null of 499,940 is a
saturated regime where the count has stopped measuring the sequence.
**Band: Project-internal.**

### 3.6 What KZ rung 2 actually excludes, and it is not the board's period ladder

**The claim.** It would be tidy, and it is false, that the KZ ladder is the
board's period ladder `Σ_p` in new clothes. Rung `n` is **strictly stronger**
than the conjunction of `Σ_1 … Σ_{2n−1}`, and at rung 2 what it excludes has a
one-line description that subsumes a published theorem:

> `p^*_x(2) < 4` ⟺ `x` is periodic with **at most one black cell per period, or
> at most one white cell per period**.

That biconditional is **measured, exhaustively, at every least period `q ≤ 12`,
and not proved** — it is a pattern in a table that happens to be uniform, and a
theorist taking Topic 1 of §5 should re-derive it rather than quote it.

**The dictionary.**

| This project | Over there | Seam |
|---|---|---|
| `Σ_p` rung: "the centre column is not `p`-periodic" | one period per rung | the board's ladder, `f(p,a)` exhaustive at 96 cells (talus11) |
| KZ rung `n` | `p^*(n) ≥ 2n` | excludes every period `< 2n` **and more** |
| `centerColumn_not_eventually_constant` (proved; Condrey) | the `q`-blacks-per-period `= 0` case | KZ rung 2 contains it |
| the board's open rung `Σ_2` (the alternating target) | the `q = 2` case | KZ rung 2 contains it |
| the board's first unowned rung `Σ_3` | the `q = 3` case | KZ rung 2 contains it |
| a tail with one black per period, any period | the `2q` extra words at each `q ≥ 4` | **new**: no rung of the board's ladder covers an unbounded period in one statement |

**The test, run, exhaustively.** `explorer/groma2_rungperiod.mjs`, every
primitive binary word of least period `q ≤ 12`, `p^*(n)` computed over all
windows of span `< nq` (which suffices, since only the lags mod `q` matter):

| `q` | primitive words | fail rung 2 | fail rung 3 |
|---|---|---|---|
| 1, 2, 3 | 2, 2, 6 | all | all |
| 4 | 12 | **8** | all |
| 5 | 30 | **10** | all |
| 6 | 54 | **12** | **36** |
| 8 | 240 | **16** | **80** |
| 12 | 4020 | **24** | **192** |

The rung-2 column is exactly `2q` at every `q ≥ 4`, and the words are the `q`
rotations of `1 0^{q−1}` together with the `q` rotations of `0 1^{q−1}` — hence
the description above. The named witness: `(00001)^∞` is primitive of period 5,
and `p^*(1) = 2`, `p^*(2) = 3 < 4`, `p^*(3) = 4 < 6`. So it fails rung 2 despite
having period `5 ≥ 4`. **The two ladders are different, and neither implies the
other rung for rung.**

**What it would give.** It prices Topic 1 of §5 exactly: a proof of KZ rung 2 for
the seed's centre column would close the board's `Σ_2` and `Σ_3` rungs, re-prove
`centerColumn_not_eventually_constant`, and additionally exclude an infinite
family — "eventually one black per period" — at every period at once, which no
rung of the board's own ladder reaches. **Band: Project-internal**, with the
characterization itself measured rather than proved.

### 3.7 Left-permutivity supplies the special factors for free, over the class, and the cone bites at exactly length `a`

**The claim.** The brief asks whether the lower-bound mechanisms can be fed by
left-permutivity. They can, completely, and that is why it is worthless: over the
class of *all* configurations, `rule30_leftPermutive` makes **every** realised
centre-column prefix right-special, so `p(n) = 2^n` and `s(n) = p(n)` at every
length, for nothing. The residual is about one orbit, and the only thing that
ever breaks the freeness is the **cone** — which bites at prefix length exactly
`a`, the cone distance, and nowhere sooner.

**The derivation, two lines from a closed node.** `evolveFrom_leftPermutive` has
radius `t`: two configurations agreeing on `(-L, L]` and differing at `-L` have
different cells at `(L, 0)`. The centre cell at time `t < L` reads only
`[-t, t] ⊆ (-L, L]`, so flipping the cell at `-L` **fixes** `c[0 … L−1]` and
**flips** `c[L]`. Hence every realised prefix of length `L` has both
continuations. In the class `A2(a)` the cell at `-L` is pinned (white for
`L > a`, black for `L = a`), so the flip is available exactly for `L ≤ a − 1`,
and the first forced continuation can appear at `L = a` and not before.

**The dictionary.**

| This project | Over there | Seam |
|---|---|---|
| `rule30_leftPermutive` / `evolveFrom_leftPermutive` | "the leftmost cell read is a bijection onto the output" | proved on this board |
| the class of all configurations | the trace subshift of the CA | its language is the full shift, and `s(n) = p(n) = 2^n` for free |
| a right-special factor of the **class** | a realised prefix with two continuations | free, at every length, by the flip |
| a right-special factor of the **orbit** | two occurrences within the seed's own column | **the seam, and it is the whole difficulty**: the flip changes the configuration, and the residual fixes one |
| the cone class `A2(a)` | configurations with the flip pinned below `−a` | the only thing that makes any prefix one-way |
| `a`, the cone distance | the length at which freeness first fails | **measured exact**, below |

**The test, run, exhaustive.** `explorer/groma2_perm.mjs`.

*(a)* Over every configuration supported in `[-L, L]`: the realised
centre-column prefixes of length `L` number exactly `2^L` and **all** of them are
right-special, at every `L = 1 … 9`. Left-permutivity gives the full shift.

*(b)* Inside `A2(a)`, the least prefix length carrying a one-way (not
right-special) realised prefix:

| `a` | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| first one-way length | 1 | 2 | 3 | 4 | 5 | 6 |
| one-way prefixes there | 1 | 1 | 1 | 6 | 5 | 4 |
| realised prefixes at `L = a+1` | 3 of 4 | 7 of 8 | 15 of 16 | 26 of 32 | 59 of 64 | 124 of 128 |

**The first one-way prefix is at `L = a` exactly, at every `a` tested**, which is
the derivation's prediction on the nose, and the language is the full shift at
every length below it.

**What it would give.** It prices the whole "feed it with left-permutivity"
family at zero and says precisely where the only available structure enters: not
in the rule, but in the cone, and not before length `a`. It is also the sharp
reason the KZ ladder has to be quantified over `a` — a rung proved with `a` fixed
says nothing, because below length `a` the class is a full shift.
**Band: Project-internal**, and the `L = a` identity is measured, not proved.

## 4. Died in translation

- **The Cassaigne calculus, the vantage's headline machinery.** Died at the first
  table (§3.1): every factor of the centre column up to length 10 is bispecial
  with bilateral order `+1`, so `s(n+1) − s(n) = Σ B(w)` reads `2^n = 2^n`. Every
  worked instance in print needs *few* bispecial factors, most of them neutral,
  located by a morphism; rule 30 supplies the opposite extreme.
- **The brief's control, "the left diagonals at `j ≥ 1`".** Died on
  `Basic.lean:88`: the `j`-slices of `leftDiagonal` are the *columns* `−1, −2, …`,
  which by the board's proved Jen's theorem are not expected to be eventually
  periodic, so they are not a wrong-side control at all. The objects that are
  proved eventually periodic are the `k`-indexed rows (§1).
- **`leftDiagonal_period_unbounded` as feedstock for a complexity lower bound**
  — the one piece of proved structure the brief offered. Died in the kernel:
  rules 90 and 150 have left-diagonal minimal periods 16 and 32 at diagonals 16
  and 32 (so unbounded) *and* eventually constant centre columns
  (`explorer/groma2_scratch_dirs.lean`, accepted; mutant rejected). Any argument
  from unbounded diagonal periods applies verbatim to rule 90 (§3.3).
- **The X_b test of "a periodic centre column bounds the left-diagonal periods".**
  This would have given P1 outright, against the proved
  `leftDiagonal_period_unbounded`. Died **on paper, before the script**: the
  diagonal periods are a statistic of the settled words, and the board's
  obstruction *"The settled part of the left diagonals does not depend on the
  centre column"* measures the settled region to be boundary-blind for every
  configuration white far to the left. So no implication from the centre column
  to the periods can be non-vacuous. Recorded as reasoning, not measurement.
- **Cyclic complexity (Cassaigne–Fici–Sciortino–Zamboni).** *"A word `ω` is
  ultimately periodic if and only if it has bounded cyclic complexity"*
  (<https://arxiv.org/html/1402.5843>, Theorem 1; the abstract at
  <https://arxiv.org/abs/1402.5843> adds *"if `x` is a Sturmian word, then
  `liminf c_x(n) = 2`"*). Died on arithmetic: `c(n) ≤ p(n)`, so proving `c`
  unbounded is *harder* than proving `p` unbounded, and it is the same direction.
  Strictly worse than Morse–Hedlund on both counts, and it forgets where in the
  window a bit sits, which is the only thing the cone argument uses.
- **Rauzy graphs.** "`G_n` is never a single cycle" is Morse–Hedlund relabelled;
  in print the graphs' evolution is driven by Rauzy induction or a morphism, and
  neither exists here. Died before a dictionary could be written.
- **Bounded-span KZ rungs.** My first version fixed the window span at `D` and
  measured the failing language's growth: `λ = 1.618, 1.373, 1.304, 1.245, 1.198,
  1.135` at `D = 1, 3, 4, 5, 6, 8` for `n = 2` (`explorer/groma2_kz.mjs`). Falling,
  and never 1 — so a bounded-span rung is supercritical and the board's own
  threshold phenomenon (`a* = 5` for the `00` target) should apply to it. Only
  the unbounded-span rung, which is the version the KZ theorem is about, is
  zero-entropy. Worth recording because the bounded-span cone searches
  *terminated* at `a ≤ 7` and would have read as a result.
- **"Maximal pattern complexity buys nothing, because `p(n) ≫ 2n` already."** My
  own first reading, from the margin table `p(n) − 2n = 0, 0, 2, 8, 22, 52, …`
  (`explorer/groma2_cassaigne.mjs` block `[A2]`): the KZ threshold is cleared by
  the contiguous window alone from `n = 3`. True, and beside the point — the value
  of KZ is not a bigger quantity to bound below but a **weaker target whose
  failing language has zero entropy**. I nearly wrote the vantage's own question
  off on the strength of a margin.
- **Rule 45 as a control for the crystal-66 filter.** My own error, and the
  dangerous kind: rule 45's lookup table sends `000 → 1`, so it is **not
  quiescent**, the white background is not invariant, there is no cone, and the
  class `A2(a)` is meaningless for it. Its rows came back finite and entirely
  plausible (`f(a) = 9 10 12 16 15 14 22 20` at rung 2), which is exactly why the
  numbers are discarded rather than reported: they are a measurement of my white
  padding. Caught by checking bit 0 of the rule number, not by anything in the
  output.
- **My own popcount table.** The first version of `explorer/groma2_kz.mjs` sized
  the popcount lookup at `2^n` where the pattern masks range over `2^{2^n}`
  subsets, so `popcnt[m]` was `undefined` for every `m ≥ 2^n`, `NaN >= TARGET` is
  `false`, and **nothing was ever pruned**. Every row of the table came back
  identical and capped at `λ = 2.000`. Caught because all eighteen rows were the
  same number, not because any number looked wrong.
- **My own closed form for the Fibonacci control.** I predicted
  `|L| = 2F(m+2) − 2(m+1) + 2` for "the lag-1 pairs do not all occur" and it
  mismatched at every length while `λ` matched `φ` to four decimals. A control
  whose expected value I derived myself is not a control; replaced by a
  brute-force sweep over all `2^m` words sharing no code with the DFS, which
  agrees at **9 of 9** cells.
- **"`p(n) = 2^n` to `n = 17`."** Written into §1 from a run that had not
  finished. The measured value over `1.2 · 10⁶` rows is `n = 16`
  (`p(17) = 131,058` of `131,072`). My own notebook says the falsification
  paragraphs are transcripts and must be written after the run; this is the same
  error one section earlier than usual.
- **"The KZ ladder has no obstruction at any rung."** My own first version of
  §3.2's closing sentence, and it is false as written: the board's compactness
  obstruction (*"The period ladder's finiteness question is Kopra's family
  question"*) applies verbatim, because `A2(a)` is compact and "this block fails
  the rung" is closed. So `f(n,a) < ∞` at every `n, a` is the **family** version
  of P1, priced by Kopra at the same difficulty as the prize. What survives is
  the rung-by-rung reading: rung 2's family statement is narrow and has Condrey's
  theorem as its zero-black case. I found this by re-reading the obstruction file
  for the word *compact* after the document was otherwise written, which is a
  check I should have run against §3.2 before writing its headline.
- **"The pattern-Sturmian classification names the enemy under a failing KZ
  rung."** Mine, written into §3.2's dictionary and taken out. The classification
  (*"recurrent pattern Sturmian sequences are either a coding of an irrational
  circle rotation by two intervals, or an element of a nearly simple Toeplitz
  subshift"*, from the search summary at
  <https://arxiv.org/pdf/2505.05627> — **UNVERIFIED**, I never fetched the
  statement itself) describes the sequences with `p^*(n) = 2n` **exactly**, which
  are *aperiodic* and clear every rung with no slack. A sequence that *fails* a
  rung is periodic. The two are opposite sides of the threshold and I had them as
  the same side. The real characterization of the enemy is §3.6, measured.
- **"The cone search exhibits right-special factors of the seed's column."** It
  does not: the cone bounds a block over a *class*, and a right-special factor
  needs two occurrences inside **one** orbit. I spent time on the direct attack on
  `s(n) ≥ 1` before noticing, and §3.7 is what the time bought — the class's
  right-special factors are free at every length by left-permutivity, so the
  direct attack was always going to produce a tautology. The KZ ladder escapes this because a rung is a
  statement about one block of one sequence — the class enters only as the
  universe over which `f` is bounded, and the class contains the seed's own rows.
- **Nothing died for lack of depth, and three computations were stopped rather
  than finished**, which is a different thing and is recorded so nobody re-runs
  them blind. The `n = 5` language count: `C(30,4) = 27,405` windows per node
  made it unaffordable, and `n = 2, 3, 4` carry the claim. The unbounded-span
  cone search at KZ rung 4: `C(70,3) = 54,834` windows per node, and rungs 2 and
  3 carry the claim, with the bounded-span rung 4 reported separately and
  labelled. And the rung-3 cone search at `a = 13`, which was still running when
  I stopped it — `a ≤ 12` is what this document claims. All three want a better
  representation than a window-indexed mask array before anyone pushes further;
  the windows are the cost, not the search.

## 5. What to hand the theorist

**One topic, and one fence.**

### Topic 1 — the session. Prove KZ rung 2 for the cone class.

**The claim to falsify**, stated so that failure is visible:

> For every `a : ℕ` there is an `L : ℕ` such that for every `X : Config` with
> `X x = false` for every `x < -a` and `X (-a) = true`, there are `d ≥ 1` and
> four times `t₁, t₂, t₃, t₄ < L` at which the pairs
> `(column X 0 tᵢ, column X 0 (tᵢ + d))` take all four values.

**The dictionary row it depends on** is the seventh row of §3.2's table: row `N`
of the seed lies in the class, by `evolve_eq_false_of_outside_cone` and
`evolve_left_edge`. Given that, the statement applied at `a = N` says every tail
of the centre column has `p^*(2) ≥ 4`.

**The quantifier over `a` is load-bearing and must not be dropped.** By §3.7 the
class `A2(a)` has the full shift as its centre-column language at every length
below `a`, because left-permutivity makes every prefix right-special until the
flip runs into the pinned cone. So a version of the statement with `a` fixed
proves nothing about the seed, and a version with `L` bounded independently of
`a` is false.

**What it is, in one sentence a captain can price.** It is **slightly weaker
than Condrey's theorem with one black cell per period instead of none**, over the
cone class rather than over finite configurations. Condrey (arXiv:2609.09431,
held and adjudicated in `docs/sources.md`) proves that a finite configuration
cannot have a constant trace, with the sharp bound `w+2`; this asks the same of
"one black per period, any period", and is implied by it with a little room (the
gap is §3.2's pre-period remark). By the compactness reading in §3.2 it is a
family statement and therefore at family difficulty — but it is a *named* family
statement one step past a published theorem, not an equivalent of the prize.

**What it would close.** By §3.6's exhaustive characterization, `p^*(2) ≥ 4` on
every tail says the centre column is **not** eventually periodic with at most one
black cell per period, and **not** eventually periodic with at most one white
cell per period. That is: it re-proves `centerColumn_not_eventually_constant`,
closes the board's open rung `Σ_2` (the alternating target, obstruction *"The
cone bounds an alternating centre column…"*), closes `Σ_3` — which talus11 names
as *"the first rung nobody has"* — and additionally excludes an infinite family at
**every** period, which no rung of the board's own period ladder reaches.

**The depth that would settle it, and what is already in hand.** Not a depth: a
proof. What the measurement supplies is the target's shape. `f(2, a)` is
**exhaustively finite** — the survivor population reaching zero, not a cap — at

> `a = 1 … 14`: `11, 12, 12, 13, 14, 16, 18, 23, 24, 24, 23, 24, 26, 28`

(`explorer/groma2_deep.mjs`, depth-first with undo, 8.7 · 10⁷ nodes at `a = 14`;
the incremental evolution is validated against the seed's own centre column
before the search runs). That is well past the `a* = 5` threshold at which the
board's `00`-free target escapes, and the growth is roughly `2a`. The
rung-failing language has polynomial growth, hence `λ = 1`, which is the board's
own criterion for a target the cone can bound (§3.2), and here that is an
argument from the Kamae–Zamboni theorem and not only a fit. Crystal 66's filter
fires the right way: the same search on rules 90 and 150 never terminates.

**And it is not vacuous on the seed, with room.** Measured directly on the orbit
rather than on the class (`explorer/groma2_seedrung.mjs`, every start
`N < 20,000`), the least block length in which the seed's own centre column
already satisfies the rung is at most

| rung | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| worst block over 20,000 starts | 15 | 25 | 28 | 29 |

with **0** starts failing within 200 rows at any rung. So the theorem to prove is
true of the seed with a large margin, and the cone bound `f(2,a) ≈ 2a` is
carrying most of its slack in the class rather than in the object.

**And what would break it, cheapest first.** Push `f(2,a)` to `a = 16, 18, 20`
and find it running away; or find the flaw in the claim that `Y_n` is finite
(§3.2), which is the one step of the argument that is mine rather than quoted.

### Topic 2 — the fence, and it is an hour.

Record that **`leftDiagonal_period_unbounded` cannot feed an aperiodicity
argument**: rules 90 and 150 have unbounded left-diagonal minimal periods and
eventually constant centre columns, kernel-decided in
`explorer/groma2_scratch_dirs.lean` with a rejected mutant beside it. This
matters because the brief for this very session offered that theorem as the
structure to build on, and because a seeder reading "proved, unbounded, about the
left diagonals" will reach for it again. The fence is two `decide`s and it is
already written.

### What I would not spend a session on

The Cassaigne calculus (§3.1), cyclic complexity, Rauzy graphs, and any search of
the combinatorics-on-words literature for a criterion. The first is a tautology
on this object, the second is strictly worse than Morse–Hedlund in both
directions, the third is Morse–Hedlund relabelled, and my 2026-09-10 sighting
already priced the fourth.

## 6. Next vantage

**Attack from the theory of *dynamical systems of low maximal pattern
complexity* — specifically the classification of pattern-Sturmian sequences, and
the `ℤ²` maximal pattern complexity of Kamae and Rao — pointed not at the centre
column but at the whole space-time picture.** The reason is that this document
found the one place where a criterion from combinatorics on words runs in a usable
direction, and it ran there because the window was allowed to be non-contiguous,
which is exactly the freedom a two-dimensional diagram offers and a one-dimensional
sequence does not. A `ℤ²` window is a *shape*, and the rule 30 picture has natural
shapes nobody has used as windows — the light cone of a cell, the anti-diagonal
between two doubling depths, the seam of an eventually-white diagonal. The
question that vantage should ask is whether the two-dimensional maximal pattern
complexity of the space-time picture has a threshold with a cone-visible failing
language, the way the one-dimensional one does, and whether the shapes the
picture supplies beat the arbitrary windows a supremum ranges over. I could not
reach it from where I stood because I spent the session on the one-dimensional
ladder and on killing the Cassaigne calculus, and because the two-dimensional
papers I found (<https://arxiv.org/html/2608.21084>, fetched, and
<https://arxiv.org/abs/2508.13420>, fetched — its abstract only) are about
*abelian* and *subshift* versions whose thresholds I did not establish.
The seam that connector will have to break is the one that killed §4's Nivat
entry and will kill this one if it is not handled: the rule 30 picture has an
origin and a cone and is not shift-invariant, so every hypothesis of the form
"complexity below a threshold" is measured against a supremum over positions that
includes the edge structure. The work is to restrict the position set to the
transient band and say honestly what survives.

A second, cheaper vantage if the first is judged too speculative: **the
computational learning theory of prediction with expert advice, read backwards.**
§1 restates P1 as *"no finite-memory predictor of the centre column from its own
past is ever right forever"*, which is a statement about a specific, small,
explicitly given hypothesis class — the `2^{2^N}` Boolean functions of an `N`-bit
window. That literature has lower-bound machinery for exactly such classes
(shattering, mistake bounds, the halving algorithm's guarantee), all of it
constructive and none of it needing a morphism. The question is whether a mistake
bound for the class of `N`-bit-memory predictors, run against the rule 30 column
with the *cone* supplying the adversary, gives anything the cone search above does
not — and the honest guess is that it does not, because a mistake bound is about
worst-case sequences and the residual is about one.

