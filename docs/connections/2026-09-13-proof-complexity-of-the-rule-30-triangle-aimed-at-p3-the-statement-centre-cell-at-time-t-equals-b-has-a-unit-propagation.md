# Proof complexity of the rule 30 triangle, aimed at P3

*A sighting by Astrolabe, 2026-09-13. Vantage: propositional proof complexity —
resolution width and size, polynomial calculus degree, cutting planes,
bounded-depth Frege, Tseitin formulas, proof complexity generators. Aimed at
Prize 3, with the wall `centerColumn_other_isEventuallyPeriodic_of_center` as
the residual of record.*

**Band, up front: project-internal, with one Known row and no Novel row.** The
document's payload is a fence, and the fence is quantitative: I can price the
whole vantage and say which of its five named technologies can and cannot
produce a t-indexed lower bound about rule 30. Nothing here is past the
literature's frontier. What is new to this board is the arithmetic of the
window the brief asked about, and the measurement that the window for *size* is
closed while the window for *width and degree* is open and is at its ceiling.

---

## 1. The problem, seen from outside

Take an infinite row of cells, each black or white, all white except one black
cell. Update every cell simultaneously and forever by one fixed local rule: a
cell's new colour is its left neighbour's colour, exclusive-or'd with (its own
colour or its right neighbour's colour). Watch the one cell that started black
and write down its colour at each step. That gives an infinite sequence of bits
which, measured to ten million terms, is indistinguishable from a fair coin.
Three things about it are unproved and each is worth $10,000. The one this
document is aimed at is the third: **that there is no way to learn the `n`-th
bit substantially faster than by running the rule `n` times.** The other two —
that the sequence never becomes periodic, and that its density of black is
exactly one half — are the residual of record here, because the board's wall is
logically the first of them.

The residual, stated with no vocabulary from this project: *given that no two
distinct positions of this picture can both have eventually periodic colour
histories, show that the distinguished position's own history is not eventually
periodic.* Nobody knows how to do it.

**Restated in this vantage's terms.** Encode the picture as a propositional
formula: one variable per cell of the triangle of cells that can influence the
distinguished cell at time `t`, and one constraint per cell saying that its
colour is the rule applied to the three cells above it. Add the seed and add
the negation of the answer. You now have an unsatisfiable CNF, and the question
a proof complexity theorist would ask is: **how long is its shortest
refutation, in resolution, in polynomial calculus over `F₂`, in cutting planes,
in bounded-depth Frege?** The vantage's own premise, which I check in §3.1, is
that the answer is "as short as it could possibly be" — the formula is refuted
by unit propagation alone, in time linear in its own size — so the standard
currency of the field, polynomial versus superpolynomial in the formula size,
buys nothing here. The interesting question is therefore whether some *other*
`t`-indexed family of formulas about this automaton has an unconditional lower
bound that would mean something about the automaton rather than about
exclusive-or.

---

## 2. Fields sighted

| Field or theory | The object there | The seam, in one line |
|---|---|---|
| **Resolution** (Robinson; Haken; Ben-Sasson–Wigderson) | the seeded triangle CNF; refuting `cell(t,0) ≠ b` | refuted by unit propagation in `(t+1)²` steps on a formula of `8t²+2t+1` clauses, so the largest conceivable size lower bound is **linear in the formula size** — the size window is empty of anything a proof complexity theorist would call a bound |
| **Resolution width, and the size–width tradeoff** (Ben-Sasson–Wigderson 2001) | `w(F ⊢ 0)`, the widest clause a refutation must hold | the `O(t²)`-size proof caps any width lower bound at `Õ(t)`; `Θ(t)` is attainable and is the ceiling — the one open slot the brief asked for |
| **Polynomial calculus / Nullstellensatz over `F₂`** (Clegg–Edmonds–Impagliazzo; Impagliazzo–Pudlák–Sgall) | the rule as a cubic ideal; refutation degree | the encoding's one extension variable per cell makes the ideal degree-3 *locally*, so the function's own `F₂`-degree `2t−1` is invisible to the refutation |
| **Proof complexity generators** (Krajíček 2004; Alekhnovich–Ben-Sasson–Razborov–Wigderson 2004) | `τ(g)_p`: "`p` is not in the range of `g`", for `g` = row of support `w` ↦ column prefix of length `T` | **this is exactly the brief's second family**, and the framework's resolution bound decays as `2^{-2^Δ}` in the dependency degree `Δ = 2t+1`, so it is vacuous from the third column bit; the hypergraph is a nested chain of boundary expansion exactly `1` |
| **Tseitin formulas and unsatisfiable `F₂`-linear systems** (Tseitin; Urquhart; Ben-Sasson–Wigderson) | the linear rules' coned family, read as a parity system | the control the brief asked for cannot fire: under rules 90 and 150 that system is **consistent** — an alternating column at every `L ≤ 55` from a support-6 row — so there is no unsatisfiable linear system to be Tseitin-hard about |
| **Bounded-depth Frege / `AC⁰` lower bounds** (Ajtai; Pitassi–Beame–Impagliazzo; Håstad) | the triangle as a circuit | the triangle's depth *is* `t`; switching-lemma technology needs depth `O(1)` and the depth is the thing under study |
| **Cutting planes and feasible interpolation** (Chvátal; Pudlák; Krajíček) | the rule as `0/1` inequalities; an interpolant as a circuit | interpolation needs a formula split into two variable-disjoint halves; the triangle has one seed and no split |
| **Proof space and pebbling** (Esteban–Torán; Ben-Sasson–Nordström) | clause space — "how much of the picture a proof must hold at once" | space `Ω(t)` is the formal content of *you must carry a whole row*; but space bounds memory and P3 bounds time, and the two are not exchangeable |
| **Automatizability of proof search** (Atserias–Müller 2019; Alekhnovich–Razborov) | "finding the short proof" as the hard step | worst-case over formula families; here there is one sequence and the proof is found by simulation |
| **Doubly-efficient interactive proofs** (Goldwasser–Kalai–Rothblum) | a verifier for a uniform circuit, costing `poly(depth)` | the verifier's cost is polynomial in the circuit **depth**, and the triangle's depth is `t` — so delegation buys nothing here, and it fails for the same reason P3 is about (§3.5) |
| **Constraint propagation, `k`-consistency in CSP** (Freuder; Atserias–Bulatov–Dalmau) | the width hierarchy of a constraint network | "the seeded triangle is decided by arc consistency" and "resolution width 1 suffices" are the same sentence twice |
| **Certificate and decision-tree complexity** | the number of row-0 cells the answer depends on; the `F₂`-degree | the **degree** separates at every `t` (`2t−1` against `1`); the influence *count* does not (rule 90's is `2^{s₂(t)}`, which reaches `t+1`). And a decision-tree bound is non-uniform, which `docs/prize.md` already prices as dead |
| **Communication complexity and lifting** (Raz–McKenzie; Göös–Pitassi–Watson) | width lower bounds via a composed gadget | lifting needs the formula to be a *composition*; the triangle is one fixed object with nothing to compose against |
| **Bounded arithmetic and independence** | "P3 is unprovable in a weak theory" | closed on this board already: `docs/connections/2026-09-11-make-p3-sayable-*` §4 |
| **Empirical SAT: CDCL and minimal cores** | `explorer/rowan_rung2_cores.py`'s cores | the core is the causal triangle with essentially no redundancy — and the same run shows the solver **finds** that refutation in ≈55 ms at `a = 40`, which is the fact §3.4 is built on |

---

## 3. Connections

### 3.1 The dial: a formula family about rule 30 is either the simulation or the shortcut, and there is nothing in between

**The claim.** For every `t`-indexed formula family `F_t` about rule 30, either
`F_t` has size `Ω(t)` and mentions the triangle — in which case its refutation
is `O(|F_t|)` and no lower bound above the trivial one can exist — or `F_t` has
size `polylog(t)`, in which case writing `F_t` down *is* the shortcut that P3
denies. So the interval the brief asks about is not merely narrow; **for proof
size it is empty, and the emptiness is structural rather than a gap in
technology.**

**The dictionary.**

| This project | Proof complexity | Checked |
|---|---|---|
| the causal triangle of cell `(t,0)` | the variable set `V` of the CNF | `|V| = (t+1)²` exactly (cells `(s,x)`, `s ≤ t`, `|x| ≤ t−s`) |
| the local rule at one cell | 8 clauses, width 4 | `8t² + 2t + 1` clauses in total, counted |
| the seed | `2t+1` unit clauses | — |
| running the automaton forward | **unit propagation** | `(t+1)²` propagations, no decisions, reproduces the picture cell for cell, `t ≤ 128`, rules 30, 90, 150 (`explorer/astrolabe2_up.mjs` [A]) |
| "centre cell at time `t` equals `b`" | a unit clause derived by that propagation | — |
| the refutation of its negation | resolution size `O(t²)`, which is `O(|F|)` | upper bound by the above. **No lower bound above the trivial one is possible**, and that is the content: a proof-complexity size bound is interesting when it is superpolynomial in `|F|`, and here the largest conceivable bound is *linear* in `|F|` |
| "how much of the triangle a proof must hold at once" | resolution **width** | capped at `O(t·√log t)` by the size bound; `Θ(t)` attainable |
| "a shortcut" | a family of size `polylog(t)` | **there is none, and its existence is P3's negation** |
| the light cone | the constraint hypergraph | a nested chain: `D_t ⊆ D_{t+1}` |
| **the seam** | **every lower-bound technology in the field is a function of the formula size, and the formula size is the simulation cost** | this is the row the other four connections break on |

**What it leans on.** Ben-Sasson–Wigderson, quoted from Urquhart's restatement
as his Theorem 5 (attributed there to Ben-Sasson and Wigderson 2001), fetched at
<https://ar5iv.arxiv.org/html/1205.1050>:

> "S_T(Σ) ≥ 2^(w(Σ⊢0)−w(Σ))"  … "S(Σ) = exp(Ω((w(Σ⊢0)−w(Σ))²/|V|))"

Put `|V| = (t+1)²`, `w(Σ) = 4` (the widest initial clause), and
`S(Σ) = O(t²)`, which the unit-propagation measurement establishes. Then
`(w(Σ⊢0) − 4)² = O(t² log t)`, so

> **any width lower bound for the seeded triangle family is at most
> `O(t·√log t)`, and any size lower bound is at most `O(t²)`, which is the
> formula size.**

That is the brief's window, computed. The width slot is open — `Θ(t)` sits
comfortably inside it — and the size slot is closed to within a constant.

**The test.** `explorer/astrolabe2_up.mjs`, block [A]: build the CNF with 8
clauses per cell, run pure unit propagation with no decisions and no learning,
and check that (i) every one of the `(t+1)²` variables is assigned and (ii) the
assignment equals the picture. Result: `true`/`true` at `t = 4, 8, 16, 32, 64,
128` for rules 30, 90 and 150, with `8t²+2t+1` clauses and exactly `(t+1)²`
propagations. A theorist could falsify the claim by exhibiting a formula family
of size `o(t)` whose truth is equivalent to `centerColumn t = b` — which would
be a shortcut, and is the point.

**What it would give.** Nothing towards the residual, and that is the payload:
it prices the vantage. It says a P3-shaped statement cannot be a *proof size*
statement at all, and so tells a captain not to commission a resolution-size
lower bound about rule 30 under any encoding.

---

### 3.2 The brief's second family is literally a proof complexity generator, and the field's own bound is vacuous for it from the third output bit

**The claim.** "No row of support `w` yields column prefix `p`" is exactly the
`τ`-formula of the theory of proof complexity generators, with the rule 30
column map as the generator; the theory is the right home for this vantage's
question; and its resolution lower bound is **vacuous for every cellular
automaton's column map**, rule 30 and rule 90 alike, because the bound decays
doubly exponentially in the number of input cells one output bit reads, and that
number is `2t+1`.

**The dictionary.**

| This project | Proof complexity generators | Checked |
|---|---|---|
| row 0, free on `w` cells, white outside | the generator's input `x ∈ {0,1}^n`, `n = w` | — |
| the centre column's first `T` bits | the output `g(x) ∈ {0,1}^m`, `m = T` | — |
| the generator **stretches**, which the theory requires | `m > n` | **not** from the naive cell count — the free cells `−a … T` outnumber the `T` column bits. The stretch comes from the free-bit deficit: obstruction 34 measures the image of the cone map at exactly `2^⌈K/3⌉` for every `K ≤ 30`, because a black centre hides column 1 from the whole left half, so the effective map is `{0,1}^{K/3} → {0,1}^K`, a 3× stretch |
| "`p` is not the column prefix of any such row" | `τ(g)_p`, the formula asserting `p ∉ Im(g)` | — |
| `f(p, a) < ∞` (obstruction 30's period ladder) | `τ(g)_p` is a **tautology** for that `p` | — |
| the rung-2 finiteness fact | `τ(g)_p` for `p` alternating | — |
| the light cone: bit `t` reads cells `[−t, t]` | the generator's **dependency graph**, with degree `Δ` | `Δ = 2t+1` at output bit `t`, exactly, by the cone |
| Rowan's minimal cores being the causal triangle | the dependency hypergraph does not expand | boundary expansion **exactly 1** for every set of `≥ 2` outputs (`explorer/astrolabe2_expand.mjs`, measured on the naive cell-indexed reading; the effective free-bit reading is nested too, since bit `t`'s free bits are a prefix of bit `t+1`'s) |
| **the seam** | **the bound's exponent is `n²/(m·2^(2^Δ))`, and `2^(2^Δ)` passes `n²/m` at `Δ = 5`, i.e. at output bit `t = 2`** | computed below |

**What it leans on.** Two fetched quotes.

The framework, from Krajíček's abstract, <https://arxiv.org/abs/2208.11642>:

> "Theory of proof complexity generators aims at constructing sets of
> tautologies hard for strong and possibly for all proof systems. We focus at a
> conjecture from K.2004 in foundations of the theory that there is a proof
> complexity generator hard for all proof systems."

The definition and the bound, from the CCC 2022 abstract of *Pseudorandom
Generators, Resolution and Heavy Width*,
<https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.CCC.2022.15>:

> "a pseudorandom generator ℱ:{0, 1}ⁿ → {0, 1}^m [is] hard for a propositional
> proof system P if P cannot efficiently prove the (properly encoded) statement
> b ∉ Im(ℱ) for any string b ∈ {0, 1}^m"

and

> "gave a lower bound of exp[Ω(n²/{m⋅2^{2^Δ}})] on the length of Resolution
> proofs where Δ is the degree of the dependency graph of the generator"

And Razborov's conjecture, for the direction a *positive* result would have to
come from, from <https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.CCC.2022.17>:

> "Razborov conjectured that if A is a suitable matrix and f is a NP∩CoNP
> function hard-on-average for 𝖯/poly, then NW_{f, A} is a hard proof complexity
> generator for Extended Frege."

**The test.** `explorer/astrolabe2_expand.mjs` computes both halves. The
exponent `n²/(m·2^(2^Δ))` at `n = 10⁶`, `m = 10³` runs
`2.5e8, 6.3e7, 3.9e6, 1.5e4, 0.23, 5.4e−11, 2.9e−30` for `Δ = 1…7`: **useful at
`Δ ≤ 4` and vacuous from `Δ = 5`.** The rule 30 column generator has
`Δ = 2t+1`, so `Δ = 3` at `t = 1`, `Δ = 5` at `t = 2`, `Δ = 7` at `t = 3` — and
`2^(2^7) = 2^128`, against which no realistic `n²/m` survives. The expansion
half: for the generator with input cells `x = −12 … 40` and `T = 24` outputs,
the minimum boundary (inputs read by exactly one chosen output) is **1 at every
set size from 2 to 24**, because the dependency sets are nested, so two
consecutive deep outputs differ by the single new cell. A theorist could falsify
this by finding a *non-nested* reading of the generator — a coordinate system in
which distinct output bits read disjoint input cells — which is the one thing
that would revive the route, and the diagonal coordinates do not supply it
(the obstruction *"Unbounded right-diagonal periods do not force an aperiodic
centre column"* says index 0 of the right-diagonal tower is the free coordinate,
and *"The cone condition does live inside the right-diagonal tower"* shows the
cone condition there is one constraint per level on that level's own bit).

**What it would give.** If `τ(g)_p` were hard for Extended Frege, the
conclusion would be far stronger than P3 and in a different currency — it would
be a statement about all polynomial-time provability, not about one sequence's
`n`-th bit. It touches no part of the residual. What the dictionary *does* give
is a fence with a number on it: **the only unconditional resolution bound this
theory has is vacuous for rule 30 from the third column bit**, so the route is
closed quantitatively rather than by taste.

---

### 3.3 The one hardness measure that separates rule 30 from both linear controls is the `F₂`-degree of the cone function, and every standard encoding destroys it

**The claim.** The Boolean function "centre cell at time `t`, as a function of
the `2t+1` free cells of row 0" has `F₂`-degree exactly `2t−1` for rule 30 and
degree exactly `1` for rules 90 and 150; the deficit of 2 from the maximum sits
entirely on the **left**, and is the board's own `evolveFrom_leftPermutive`
read algebraically. This is the sharpest crystal-66-passing separation between
rule 30 and the linear rules that this vantage produces — and polynomial
calculus cannot see it, because the standard encoding's one extension variable
per cell makes the ideal degree 3 whatever the function's degree is.

**The dictionary.**

| This project | Polynomial calculus / algebraic proof complexity | Measured (`explorer/astrolabe2_degree.mjs`, `astrolabe2_anf.mjs`) |
|---|---|---|
| cell `(t,0)` over a free row-0 window | a Boolean function of `n = 2t+1` variables | — |
| its nonlinearity | the **`F₂`-degree** — the quantity PC and Nullstellensatz degree bounds are about | rule 30: `2, 3, 5, 7, 9, 11, 13, 15, 17, 19` at `t = 1…10`, i.e. `2t−1 = n−2` |
| the linear controls | an affine polynomial | rules 90 and 150: degree **`1`** at every `t ≤ 10` |
| rule 45 (the only other rule that climbs the occurrence ladder) | degree `2t−2` | `2, 3, 4, 6, 8, 10, 12, 14, 16, 18` |
| rule 86, rule 30's mirror | identical | degree and monomial count equal rule 30's at every `t ≤ 10` |
| how many row-0 cells matter | influential variables | rule 30: **all `2t+1`**, every `t ≤ 10`; rule 150: `3,3,5,3,9,5,11,3,9,9`; rule 90: `2^{s₂(t)}` (the count of odd binomials), `2` at `t = 8` and `8` at `t = 7`, so **`t+1` at `t = 2^k−1`** — the influence *count* separates only on average, and the degree separates at every `t` |
| the board's "effective cone is smaller than the light cone" | a *different* class | that measurement fixes row 0 white left of the origin, black at `0`, free at `1…t`, and finds influences as small as `7.6e−6`; here all `2t+1` cells are free and symmetric, and none has influence zero. Two classes, no contradiction |
| `rule30_leftPermutive`, iterated | the variable `x = −t` appears **only** in the linear monomial | per-variable maximum monomial size is `1` at `x = −t`, at every `t` from 2 to 10 |
| the OR term on the right | the variable `x = +t` is **not** privileged | per-variable maximum monomial size `2t−1` at `x = +t` |
| **the seam** | **the CNF has one extension variable per cell, so the refutation's degree is `O(1)` and the function's degree `2t−1` never appears in it** | the encoding in §3.1 is degree-3 per constraint |

**What it leans on.** That degree lower bounds are the technology PC has, from
de Rezende–Meir–Nordström–Robere, fetched at
<https://ar5iv.labs.arxiv.org/html/2001.02481>:

> "It has been shown for resolution and polynomial calculus that strong enough
> lower bounds on degree/width imply lower bounds on size [IPS99, BW01]."

with `[IPS99]` given there as "Impagliazzo, Pudlák, and Jiří Sgall. Lower bounds
for the polynomial calculus and the Gröbner basis algorithm. Computational
Complexity, 8(2):127–144, 1999."

**The test.** Exact Möbius transform over all `2^(2t+1)` inputs, `t ≤ 10`, two
scripts, one of which reports the per-variable structure. The controls do the
work: the degree is `1` for rules 90 and 150 and `n−2` for rule 30, so crystal
66's filter fires in the right direction — the measurement sees the `OR` and not
the shape of the cone. The left-edge linearity is falsifiable against a closed
node: if `evolveFrom_leftPermutive` holds with radius `t`, then flipping the cell
at `x = −t` must flip `cell(t,0)` for every setting of the others, which is
exactly "the variable appears only in the linear monomial", which is what the
per-variable table reports. The unexplained entry, and the place to attack: the
**second** variable, `x = −t+1`, is capped at `2t−2` — one below the degree — at
every `t` from 3 to 10, and nothing on this board explains that.

**What it would give.** Not a step towards the residual. Two smaller things. It
is the first statement on this board separating rule 30 from rules 90 and 150
*at the level of the `t`-step map at the origin* rather than at the level of the
rule (crystal 59 is the rule-level version: rule 30 is rule 150 plus `2r AND r`).
And it prices every degree-based route: since the encoding hides the degree, a
PC or Nullstellensatz lower bound about rule 30 would have to be stated for the
**extension-free** formula in the `2t+1` input cells alone, whose size is
`2^Θ(t)` — at which point the family is exponentially large and §3.1's dial
applies.

---

### 3.4 The rung-2 family is hard for the shape every argument on this board has, and easy for the shape a solver uses

**The claim.** The rung-2 alternation family — the `t`-indexed unsatisfiable
family about rule 30 this board has measured furthest — has refutations of
size `2^Θ(a)` in the read-once, left-to-right, carry-a-frontier shape, and
refutations a CDCL solver finds in milliseconds at `a = 40`. **Every attack this
board has mounted on this family is frontier-shaped, and the frontier shape is
exponentially the wrong one.** So the reason nobody has proved rung 2 is not
that short proofs are absent; it is that the short proof is not a sweep.

**The dictionary.**

| This project | Proof complexity | Measured |
|---|---|---|
| the class "white left of `−a`, free from `−a` rightwards" | the free input variables of the CNF, `Θ(a)` of them | — |
| "the centre column alternates for `L` steps" | `L` unit constraints on determined cells | — |
| `f(a)`, the longest satisfiable block | the largest `L` with `F` satisfiable | reproduced obstruction 29's published table exactly, `a = 1…18`, two independent engines (`explorer/astrolabe2_tree.mjs` [A], `astrolabe2_dag2.mjs`) |
| the leftward solve, the reset front, the left-only reduction, the survivor census | an **OBDD in the cone order** — read-once with one fixed global variable order. (Precision: this is *weaker* than general regular resolution, which may reorder per path, so my numbers bound the OBDD shape and not regular resolution) | `log₂` of the max frontier width runs `3.0, 4.0, 6.9, 8.1, 12.1, 12.3, 14.6, 17.2, 19.6` at `a = 2,4,…,18`, a slope of `(19.63−3.00)/16 = 1.039` per unit `a`, i.e. `≈2^{1.04a}` |
| a DFS over the free cells | **tree-like** resolution | `146, 512, 2932, 12822, 102362, 293728` nodes at `a = 2,4,6,8,10,12`, a growth of `(293728/146)^{1/10} = 2.14` per unit `a`, i.e. `≈2.14^a` |
| what cadical does | general (DAG-like) resolution with learning | the whole `f(a)` sweep to `a = 40`, both phases, took **37.3 s** (line 64), and the **deletion-based minimal core at `a = 40`, `L = 50`, took 76.8 s** for a loop over `1354 + 46 = 1400` candidate clauses (line 155; the table's header at line 76 is `a ph L |rule| |alt| x-range t-range maxEdge minEdge maxCol secs`, so the last column is seconds). That is **≈55 ms per UNSAT refutation** at `a = 40` |
| the same instance, frontier-shaped | `≈2^{1.04·40} ≈ 2^{42}` states | my BFS runs out of heap at `a = 20` |
| `n`, the formula's variable count | `Θ(f(a)²) = Θ(a²)` | `f(a) ≈ 1.2a` |
| so the frontier shape costs | `2^Θ(√n)` | — |
| **the seam** | **the exponential is a property of the variable order, not of the family** — general resolution beats it by an exponential, demonstrated by a running solver | — |
| the control (the brief's rules 90 and 150) | **cannot fire: the family is satisfiable there** | rules 90 and 150 give an alternating block at every `L ≤ 55` tested, so there is no refutation to compare |
| and the sharpest form of that, brute-forced over every assignment of `x = −6 … R` | does the longest block grow with the **right** extent `R`? | rule 30: `10, 10, 10` at `R = 6, 10, 14` — **saturated**, the right half cannot help. Rules 90 and 150: `8, 14, 17` and `7, 11, 15` — **growing with `R`**. That is the free-bit surplus, measured without any frontier machinery (`explorer/astrolabe2_check60.mjs`) |
| the control that can fire | rules 120 and 180, the other nonaffine quiescent left-permutive rules | `log₂` width `2.3, 4.6, 6.8, 8.8, 10.6, 12.5, 15.3, 16.6` (rule 120, slope `1.023`) and `2.0, 4.8, 6.9, 8.0, 11.0, 13.0, 14.0, 17.0` (rule 180, slope `1.071`) against rule 30's `1.039` — **the same law, within the spread of the three** |

**What it leans on.** The shape of the theorem that matches the measurement, and
the fact that it is a bound on *regular* resolution rather than general
resolution — Itsykson et al., fetched at
<https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.SAT.2022.6>:

> "for any connected graph G the size of any regular resolution or OBDD(∧,
> reordering) refutation of a Tseitin formula based on G is at least 2^Ω(tw(G))"

The causal triangle's constraint graph is grid-like and has treewidth `Θ(a)`
(**standard, not fetched** — the treewidth of an `m × n` grid is `min(m,n)`), so
`2^Ω(tw)` is `2^Ω(a)`, which is what the frontier width does. **This is an
analogy, not a citation:** the theorem is about Tseitin formulas and the rule 30
family is not one, and I mark it as the shape the measurement fits rather than a
result that applies.

**The test.** Three independent engines agree on `f(a)` — my tree DFS, my
frontier BFS, and Rowan's SAT encoding and brute force — against the published
table at every `a ≤ 18`. The falsifiable statement for a theorist: **the CDCL
refutation size of the rung-2 family grows polynomially in `a` over
`a = 8…40`.** Counting conflicts per call in `rowan_rung2_cores.py` settles it in
one run, and if it is polynomial then rung 2 has a short proof that nobody has
read.

**What it would give.** This is the one connection that touches the residual,
and it touches it as a redirection rather than a route. Rung 2 is the `p = 2`
instance of Prize 1. Rowan's cores entry of 2026-09-12 concluded from the minimal cores that there
is no bounded-width inductive invariant and therefore no proof by induction on
`a` "by this route". The measurement here says something sharper and more
usable: **the cores are the causal triangle because every proof this board knows
how to write is a sweep, and the sweep shape is measured here at `2^{1.04a}`
while the solver's is milliseconds; there is a cheap proof and nobody has looked
at it.** *Measured, not proved* — I have an upper bound on the sweep shape and a
running solver, not a lower bound on anything.

---

### 3.5 Verification is not a shortcut either, and the reason is that the triangle is deep — which is what irreducibility means

**The claim.** The technology that makes a computation checkable faster than it
is runnable — doubly-efficient interactive proofs — buys **nothing** for the
rule 30 triangle, and it fails for exactly the reason P3 is about: its verifier's
cost is polynomial in the circuit's **depth**, and the triangle's depth is `t`.
So the honest complexity-theoretic shape of P3 is not "not computable in
`polylog` time" but "**inherently sequential**" — and that is a statement with a
standard name (`∉ NC`) and no more technology behind it than P3 has.

**The dictionary.**

| This project | Delegation / interactive proofs | Status |
|---|---|---|
| the triangle of cells above `(t,0)` | a log-space-uniform Boolean circuit | uniform by construction; size `S = Θ(t²)` |
| one automaton step | one circuit layer | — |
| `t` steps | circuit **depth** `d = t` | — |
| "read the `t`-th bit off a proof" | the GKR verifier | time `n·poly(d, log n)` with `d = t` — **not sublinear in `t`** |
| a `polylog`-time verifier | would need `d = polylog(t)` | i.e. the triangle would have to collapse to low depth |
| "the automaton is computationally irreducible" | "the triangle is not low-depth" | `∉ NC`, unproved and with no technology |
| rules 90 and 150 | not merely low-depth — **constant** | measured: from the single seed rule 90's centre column is black at `t = 0` and white for ever after, and rule **150's is black at every `t`** (density `1.000000` to `t = 4096`). Their 2-kernels close at 2 and 1 members where rule 30's and rule 45's grow as `2^{k+1}−1` (`explorer/astrolabe2_control.mjs`) |
| **the seam** | **a depth lower bound is a circuit lower bound, and `docs/prize.md` already prices non-uniform routes as dead — but here the object being bounded is depth of a *uniform* family, which is `P` vs `NC`** | — |

**What it leans on.** Goldwasser–Kalai–Rothblum, quoted from the abstract at
<https://weizmann.elsevierpure.com/en/publications/delegating-computation-interactive-proofs-for-muggles/>:

> "The verifier runs in time n · poly(d, log(n)) and space O(log(n)), the
> communication complexity is poly(d, log(n))"

**The test.** Arithmetic on the quote: `d = t`, so the verifier's time is
`poly(t)` and the communication is `poly(t)`, neither of which beats simulating
`t` steps. A theorist could falsify the claim by exhibiting a depth-`o(t)`
uniform circuit family for `centerColumn t` — which is a shortcut, and is again
the point.

**What it would give.** A better statement of P3 than the board currently has,
and nothing else. It is worth recording because it corrects an attractive
misreading: irreducibility does not mean *unverifiable* (§3.1 gives a
quadratic-size certificate) and does not mean *undelegatable in principle*; it
means *not parallelisable*, and the parallel-complexity literature's own
canonical CA result — rule 110's P-completeness — puts the hardness in the
configuration, which the prize fixes. That is the same seam my last session
found from succinct-instance complexity, reached from a third direction.

---

## 4. Died in translation

**My own two, first, because both were numbers I believed.**

- **"The DAG-like refutation width of the rung-2 family is `155096` at `a = 16`
  and the heap dies at `a = 20`."** Mine, from `explorer/astrolabe2_dag.mjs`, and
  it was a count over an unstated denominator: the state carried both frontier
  anti-diagonals to depth **70**, where only depths `0 … f(a)+1 ≈ 1.2a` are ever
  read, so fifty dead depths were splitting behaviourally identical states. The
  tell was not the size of the number but that it **contradicted a measurement
  already on disk** — Rowan's whole SAT sweep to `a = 40` took 37.3 seconds, and
  a refutation a solver finds in milliseconds cannot need `10^5` states. Corrected
  in `astrolabe2_dag2.mjs`. The corrected numbers are still exponential, so the
  conclusion survived; the arithmetic did not, and I would have shipped the
  wrong denominator.
- **"Unit propagation refutes the seeded triangle CNF, `conflict = true`."** Mine,
  and the first run reported `conflict` as `true` at `t = 8, 16, 64, 128` and
  `false` at `t = 4, 32` — which I nearly wrote up as an oddity. The defining
  clause's output literal was `lit(s, x, y === 0)` where it must be `y === 1`, so
  the CNF encoded the **complement** of rule 30, propagated perfectly happily to
  the complement picture, and assigned exactly `(t+1)²` variables either way. The
  propagation count was true and the thing it counted was not rule 30. What caught
  it was adding an agreement check against the picture, not looking harder at the
  count — and the propagation count, which was the number I actually wanted, was
  right in both versions.

**The brief's control premise, checked, and it is true in a way that weakens it.**
The brief says "linear rules 90 and 150 have polylog-computable columns". Measured
from the single seed: rule 90's centre column is black at `t = 0` and **white for
ever after**, and rule 150's is **black at every `t`** — density `1.000000` over
4096 terms, longest white run `0`. Rules 60 and 240 are likewise eventually
constant. So those columns are not polylog-computable, they are *constant*, and
their 2-kernels close at 1 or 2 members where rule 30's and rule 45's grow as
`2^{k+1}−1` to depth 5 — maximal, and consistent with crystal 73's exclusion of a
2-automatic centre column (`explorer/astrolabe2_control.mjs`). **Consequence: for
any statement about the centre column, rules 90 and 150 are a control against a
constant sequence, which is almost no control at all.** The board already knew
half of this — crystal 66 for rule 90 — and it is why the obstruction *"Aperiodicity
does not imply hardness"* had to use
rule 90's *column 1* rather than its centre column to build the aperiodic-but-easy
witness. The control that carries information is the one on the **formula family**,
below.

**The vantage's own control, which cannot fire where the brief expected it to.**
The brief asks that any hardness also holding for rules 90 and 150 be discounted.
For the coned families this board owns, **rules 90 and 150 make the family
satisfiable** — an alternating centre column at every `L ≤ 55` from a support-6
row — so there is no refutation of theirs to compare and the control is vacuous.
The control that does fire is rules **120 and 180**, the other nonaffine
quiescent left-permutive rules, whose frontier widths track rule 30's within
noise. So the honest verdict is the discount the brief wanted, obtained from a
different denominator.

**And a natural guess about that control set, dead.** "The family is unbounded
exactly for the affine rules." False in both directions inside the quiescent
left-permutive eight: rule **240 is affine and bounded** (`f(6) = 8`, brute-forced
over every assignment of `x = −6 … R` for `R = 6, 10, 14`, since `240` is the pure
left shift and `cell(t,0) = row0(−t)` is white past the support), and rule **210
is nonaffine and unbounded** (no bound within `L ≤ 91` at `a = 2`). Obstruction
34's criterion is column-1 *visibility*, not affineness, and it survives; my
restatement of it did not.

- **And my third own error, caught by that check.** `astrolabe2_dag3.mjs`'s affine
  block reported `f(6) = 19` for rule 60, and I had written it into this section as
  an affine-and-bounded case. **It is a width cap misreported as a bound**: that
  block's loop breaks on `r.capped || !r.sat` and then prints the last satisfiable
  `L`, so a state explosion and an unsatisfiable instance print the same number.
  Brute force over every assignment (`explorer/astrolabe2_check60.mjs`) reaches the
  test's own cap of 26 at every right extent, so rule 60's family is **unbounded**.
  The mechanism is worth a line because it is not the free-bit story: rule 60's
  column is the linear functional `Σ_k C(t,k)·row0(−k)` over the `a+1` cells at
  `x ≤ 0`, and `C(t,k) mod 2` for `k ≤ 6` depends only on `t`'s low three bits, so
  the whole infinite system collapses to **eight** distinct equations in seven
  unknowns and is satisfiable at every length. Two different reasons for
  unboundedness among the affine rules, and my one-line guess had neither. The
  frontier recurrence itself is not at fault: it validates against forward
  simulation at `0` of `4000` cells for each of the eight rules
  (`explorer/astrolabe2_valid60.mjs`), which is the check `astrolabe2_dag.mjs` ran
  for only three of them.

**The resemblances that died with their seams.**

- **"The minimal certificate size measures irreducibility."** The idea: count the
  triangle cells a derivation of `cell(t,0)` genuinely needs — rule 30's `OR`
  lets a black centre discharge its right neighbour, which the linear rules
  cannot do — and read the fraction as a hardness measure. Dies against its own
  control at the first run: as a fraction of the backward cone the certificate is
  `0.50` for rule 90, `0.89` for rule 30, `1.00` for rule 150 and `0.50` for rule
  110 (`explorer/astrolabe2_up.mjs` [B], `t` to 1024). **The two rules with
  `polylog` columns bracket rule 30 from both sides**, so the certificate
  constant is uncorrelated with computability, and every rule's certificate is
  `Θ(t²)` regardless. A second defect in the same measurement, recorded because
  the first version shipped a plausible number: "a parent is needed iff flipping
  it changes the output" is **unsound** — at a cell with centre and right both
  black, flipping either alone changes nothing, so the test drops both and the
  certificate no longer witnesses that the `OR` was satisfied. Replaced by a
  minimum sufficient parent set over all 8 subsets. The unsound version gave
  `0.73` where the sound one gives `0.89`. And the sound version is still only an
  upper bound on the true minimum: its tie-break prefers already-marked parents
  and is therefore not mirror-symmetric, which shows up as rule 86 reporting
  `0.77` against rule 30's `0.89` for a picture that is the mirror image. **A
  measurement that disagrees with itself under the mirror is not measuring the
  minimum.**
- **"Delegation gives a `polylog` verifier for the `t`-th bit, so P3 must mean
  something else."** Mine, and it was the connection I most wanted. Dies on the
  fetched statement of the theorem rather than on a measurement: the GKR
  verifier's time is `n·poly(d, log n)` in the circuit **depth** `d`, and the
  triangle's depth is `t`. Survives in inverted form as §3.5, where the failure is
  the finding.
- **"A resolution width lower bound of `Ω(t)` for the seeded family is the formal
  content of *you must carry a whole row*, and is provable."** The window is open
  (§3.1 caps it at `O(t√log t)`, so `Ω(t)` is admissible), and the statement is
  not reachable: width lower bounds in this field come from expansion, and
  §3.2 measures the expansion of this hypergraph at **1**. The route wants the one
  hypothesis the object structurally lacks.
- **Tseitin formulas.** The natural thought is that the linear rules' triangle is
  an unsatisfiable `F₂`-linear system, hence Tseitin-shaped, hence the one place
  the field has exponential lower bounds — so resolution hardness of a CA family
  would be *evidence of linearity*, inverting the vantage's intuition. Dies one
  step earlier than the inversion: the linear rules' coned family is satisfiable,
  so there is no unsatisfiable linear system to be Tseitin about. What survives is
  the *shape* match in §3.4, and it is an analogy carrying a marked warning.
- **Cutting planes and feasible interpolation.** Needs a formula split into two
  variable-disjoint halves whose interpolant is a circuit for a hard function.
  The triangle has one seed, no partition, and nothing to interpolate between.
  Died on inspection; recorded so the next connector does not look for a split.
- **Bounded-depth Frege.** Switching-lemma technology needs the formula's
  semantics to sit in `AC⁰`. The triangle's depth is `t` and is the thing under
  study, so the hypothesis is the negation of the question. Died on inspection.
- **Automatizability.** Atserias–Müller, fetched at
  <https://arxiv.org/abs/1904.02991>: *"We show that the problem of finding a
  Resolution refutation that is at most polynomially longer than a shortest one
  is NP-hard."* This is the one theorem in the area whose statement is about
  *finding* proofs rather than their length, so it is the closest thing to a
  bridge from proof complexity to running time. It runs the wrong way twice: it is
  worst-case over formula families where we have one sequence, and for our family
  the proof is found by simulating, which is exactly the cost P3 is about.
- **Independence / bounded arithmetic.** Already closed on this board by the
  2026-09-11 sighting's §4, and re-checked rather than re-derived: there is
  nothing about rule 30 to seed an independence argument, and independence for a
  `Π⁰₂` statement about an explicit sequence would exceed P3 in difficulty.
- **Lifting theorems (Raz–McKenzie, Göös–Pitassi–Watson).** These produce width
  and communication lower bounds by composing a base search problem with a gadget.
  There is no composition here: the triangle is one fixed object at each `t`, and
  the gadget would have to be supplied by the automaton, which supplies a nested
  chain instead. Died on inspection.
- **"`k`-consistency gives a hierarchy to climb."** The CSP width hierarchy and
  resolution width are the same measure in two vocabularies, and §3.1 puts the
  seeded triangle at width 1 (arc consistency decides it). So the hierarchy's
  bottom rung already closes the object and there is nothing above it to climb.

**Nothing died for lack of depth.** Every death above has a computed witness, a
fetched theorem statement whose arithmetic closes it, or a control that fired.

---

## 5. What to hand the theorist

**One topic, and it is §3.4.** The other four connections are fences and should
be read as such by a captain; this one names a thing to do.

> **Topic. The rung-2 refutation that a solver already has, and which nobody has
> read.** *The claim to falsify:* the CDCL refutation size of the rung-2
> alternation family grows **polynomially** in `a` over `a = 8 … 40`. *The
> dictionary row it depends on:* "the leftward solve, the reset front, the
> left-only reduction and the survivor census are all read-once refutations in the
> cone order" — and that shape is measured at `2^{1.04a}` for rule 30, `2^{1.02a}`
> for rule 120 and `2^{1.07a}` for rule 180, against a solver that refutes the
> `a = 40` instance in **≈55 ms** (1400 deletion-loop refutations in 76.8 s), where
> the frontier shape would want `≈2^{42}` states. *The depth that settles it:* one run of
> `explorer/rowan_rung2_cores.py` with the solver's conflict count printed per
> call, `a = 8 … 40`, both phases. If the conflict count is polynomial, then rung 2
> — the `p = 2` instance of Prize 1 — has a short propositional proof at every `a`
> measured, and the reason no human proof exists is that every human attempt has
> been a sweep. Reading the resolution DAG for a repeating motif across `a` is then
> the route, and the cores entry's "no bounded-width inductive invariant" is
> compatible with it: the invariant is not a band along the cone edge, and the
> solver's proof says what it is instead.

**And one fence worth a seeder's attention rather than a theorist's session.**
The `F₂`-degree statement of §3.3: *the centre cell at time `t`, as a function of
the `2t+1` free cells of row 0, has degree `2t−1` under rule 30 and degree `1`
under rules 90 and 150, with the cell at `x = −t` appearing only linearly.* The
last clause is `evolveFrom_leftPermutive` and is proved; the rest is measured
exactly to `t = 10` and is a `decide` for small `t`. Its value is entirely as a
price list: it is the quantity every degree-based lower bound is about, and the
encoding that makes the triangle stateable hides it.

**What I am not handing over, said plainly, because the brief asked a yes/no
question.** *Is there any `t`-indexed formula family about rule 30 for which an
unconditional lower bound is provable and would mean something for P3?* **No**,
and §3.1 is the reason rather than a survey of failures: proof complexity's
measures are functions of formula size, a formula about rule 30 large enough to
state the question is large enough to refute cheaply, and a formula small enough
for a lower bound to be about `t` rather than about the formula would itself be
the shortcut. The brief's guess that a P3-shaped bound "must live between polylog
and `t²`" is right about the interval and the interval is empty for size; it is
open only for width and degree, where `Θ(t)` is both attainable and unreachable —
attainable because §3.1's cap permits it, unreachable because §3.2 measures the
expansion every technique needs at 1.

---

## 6. Next vantage

**Parameterized complexity and treewidth-based algorithmics, attacked not at the
column but at the rung-2 family's constraint graph.** §3.4's measurement says the
frontier shape costs `2^Θ(a)` and the solver's does not, and the vocabulary that
makes that a theorem rather than a table is exactly treewidth versus branchwidth
versus the *order* a dynamic programme visits the graph in: the whole field
exists to say when a fixed elimination order costs exponentially more than the
best one, and it has technology — `tw` versus `pw`, Bodlaender-type bounds,
lower bounds under ETH — at precisely the resolution my §3.1 arithmetic says is
the only open one. A connector from there should be able to say whether
`f(a) < ∞` is a statement whose natural parameter is the cone distance at all, or
whether the right parameter is something the board has never named. The field I
could not reach from where I stood is **automated theorem proving as an
experimental science** — the literature on *reading* machine-found proofs
(interpolant extraction, invariant synthesis from unsat proofs, IC3/PDR's
inductive invariants for exactly this shape of unbounded-parameter safety
problem). §3.4's handoff is "read the solver's proof", and I have no idea which
of those tools reads it best; someone who works on hardware model checking would,
and rung 2 — a parameterised safety property of a one-dimensional array with a
local update rule — is the canonical instance that field was built for.

