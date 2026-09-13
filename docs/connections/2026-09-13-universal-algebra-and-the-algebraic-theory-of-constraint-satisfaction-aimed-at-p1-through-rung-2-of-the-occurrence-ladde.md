# Universal algebra and the algebraic theory of constraint satisfaction, aimed at P1 through rung 2 of the occurrence ladder

*A sighting by Parallax, 2026-09-13. Vantage: polymorphism clones, Post's
lattice, Schaefer's dichotomy, the Barto–Kozik bounded-width theorem, the
Bulatov–Zhuk dichotomy. The wall of record is
`centerColumn_other_isEventuallyPeriodic_of_center`, which given Jen's theorem
is Prize 1.*

**Band, up front: project-internal.** The computation the brief asked for is
decidable, I ran it exhaustively, and the answer is the one the brief guessed:
**rule 30's local relation admits no weak near-unanimity polymorphism, so the
constraint language it generates has unbounded width and is NP-complete.** That
converts Rowan's empirical "the rung-2 cores hold no bounded-width invariant"
into a theorem — *about the language*. And then the control destroys it as a
separator: **232 of the 256 elementary rules give exactly the same verdict, and
217 of those 232 have a centre column that is eventually periodic**, several of
them constant from row 1. So the algebraic invariant is satisfied by rules for
which P1 fails in the strongest possible way, and it cannot be a step toward
P1. Nothing here is past the literature's frontier: the classification is Post's
lattice applied to one 8-tuple relation, which is a five-minute exercise for
anyone in that field. Two things are new *to this board* and both are
fingerprints computed here rather than citations: the 256-rule clone table, and
the measurement in §3.5 that rule 30's centraliser among cellular automata of
radius ≤ 3 is exactly the shift-and-power monoid plus the constant, with **no
genuinely binary picture-level polymorphism at radius ≤ 1** — where the affine
rules have 49 to 98 of them, so crystal 66's filter does fire at the picture
level. **And then the same control kills that too**: rule 110's centraliser and
binary clone are identical to rule 30's, and rule 110's centre column is provably
black for ever. The document's single finding, reached twice from two directions,
is that **every algebraic invariant of the rule — cellwise or picture-level — is
shared with a rule whose centre column is constant.** §5 turns that into a
reusable control rather than a route.

---

## 1. The problem, seen from outside

Take a line of cells stretching to infinity in both directions, each black or
white, all white but one. At every tick, every cell simultaneously takes a new
colour determined by its own colour and its two neighbours' by one fixed rule:
*new = left XOR (own OR right)*. Watch the one cell that started black and write
down its colour at each tick. That infinite sequence of bits looks, to ten
million terms and to every statistical test anyone has run, exactly like a fair
coin. **It is unproved that it never settles into a repeating pattern.** That is
the question here. It is known (Jen) that no two distinct cells can both have
eventually repeating colour histories, which makes the board's wall — *if the
distinguished cell repeats then some other cell repeats* — logically the same
statement as *the distinguished cell does not repeat*.

**Restated in this vantage's own terms, with no automaton in it.** Fix one
4-ary relation on a two-element set:

> `R = { (l, c, r, o) ∈ {0,1}⁴ : o = l ⊕ (c ∨ r) }`, eight tuples,

together with the two unary relations `{0}` and `{1}`. Build instances of the
constraint satisfaction problem over that language by taking one variable per
point `(t,x)` of a triangular grid and imposing `R` on each quadruple
`(v(t,x−1), v(t,x), v(t,x+1), v(t+1,x))`. Pin the variables outside the cone to
`0`, pin the ones on the distinguished column to a periodic pattern, and ask
whether the instance has a solution. Then, writing `I(w, a, L)` for the instance
with period word `w`, cone distance `a` and depth `L`:

> **Prize 1 says: for every word `w` and every `a`, there is an `L` with
> `I(w, a, L)` unsatisfiable.**

(That `a` may be taken finite rather than quantifying over configurations is the
cone — row `N` of the picture is white left of `−N` — and the passage from
"unsatisfiable at some finite `L`" to "no infinite solution" is compactness, the
argument already on the board in the period-ladder obstruction. The `w ≡ 0` rung
is the board's proved `centerColumn_not_eventually_constant`; the `w = 01` rung is
rung 2 of the occurrence ladder, which is where this brief aims.)

So the residual is a **uniform unsatisfiability statement about a doubly-indexed
family of instances over one fixed finite constraint language.** And the single
question universal algebra asks about a constraint language is: *is every
unsatisfiability over it certified by local consistency?* If it were, the `∃L`
above would come with a finite, local, uniform certificate — which is exactly
the "bounded-width inductive invariant" Rowan searched for in the minimal unsat
cores and did not find.

---

## 2. Fields sighted

| Field or theory | The object there | The seam, in one line |
|---|---|---|
| **Polymorphism clones / the algebraic CSP** (Jeavons; Bulatov; Barto–Krokhin–Willard) | `Pol(R)`, the operations commuting with `l ⊕ (c ∨ r)` | computed exhaustively: **only the projections**, so the language is as hard and as structureless as a Boolean language can be — and 232 of the 256 rules are the same |
| **Post's lattice of Boolean clones** (Post 1941) | which of the countably many clones `Pol(R)` is | `⊥`, the bottom. The whole 256-rule classification is one line of Post's completeness criterion plus one exception class (§4) |
| **Schaefer's dichotomy** (Schaefer 1978) | `SAT(S)` for a Boolean relation set | rule 30's language is none of the six tractable cases, so `CSP` over it is NP-complete — and so is rule 184's, whose centre column is *constant* |
| **Barto–Kozik bounded width** | bounded width ⟺ omitting the unary and affine types ⟺ weak near-unanimity terms of arity 3 and 4 | **no WNU at any arity**, so no bounded width: for every `k` there is a `k`-consistent unsatisfiable instance. But "there is" ranges over *all* instances, and ours are one thin family |
| **The Bulatov–Zhuk dichotomy** | tractable-or-NP-complete on the same invariant | it is a theorem about worst-case instances; the rung-2 family is a *single* instance per `(w,a,L)`, which no complexity class can speak about |
| **The Geiger / BKKR Galois connection** | `Inv(Pol(Γ))` = the primitive-positive-definable relations | `Pol` trivial ⟹ **every Boolean relation is pp-definable from rule 30's relation with constants**. The language is maximally expressive; the *picture* is not, and that gap is §3.3 |
| **Boolean circuit bases / Post's completeness criterion** | is `{f, 0, 1}` a complete basis? | `f(0,c,r) = c ∨ r` and `f(l,c,0) = l ⊕ c`, so yes, in two substitutions — and that is a *proof* of the clone computation rather than an enumeration |
| **Structural CSP restrictions** (Feder–Vardi; Grohe; treewidth) | restricting the constraint *graph* instead of the language | bounded treewidth would make local consistency decide whatever the language; the causal triangle's treewidth is `Θ(a)`. Both restrictions fail, and hybrid CSP theory has no classification for the intersection |
| **`k`-consistency and Datalog** (Freuder; Feder–Vardi; Atserias–Bulatov–Dalmau) | the derivation rules a local proof may use | this is Rowan's minimal-core measurement in the field's own vocabulary; the two agree, and the algebra says the agreement is forced |
| **Cores and retractions** | the endomorphism monoid of the structure | constant-`0` is an endomorphism (rule 30 is quiescent), so the **bare** language `{R}` has a one-point core and its CSP is trivially satisfiable. The entire question lives in the constants, i.e. in the cone |
| **Centralisers of cellular automata** (Hedlund; Boyle–Lind–Rudolph on `Aut(σ)`) | block maps commuting with `F`; the *geometric* analogue of a polymorphism | computed here to radius 3: exactly `σ^a F^b` and the constant. This is the object the cell-level clone cannot see, and §3.5 is built on it |
| **Predecessor problems for cellular automata** (Sutner) | "does this partially specified space-time diagram extend?" | the one-dimensional predecessor problem is *easy* (de Bruijn automaton), which is the sharpest statement of why NP-completeness of the language says nothing about the grid |
| **Two-dimensional subshifts of finite type** | the picture is a `ℤ²` SFT whose forbidden-pattern set is exactly the complement of `R` on a `2×3` window | the relation *is* the SFT's alphabet-level data, so "clone" and "forbidden patterns" are the same object twice; the board's expansive-subdynamics sighting of 2026-09-08 already works this room |
| **Symmetric Datalog / logspace CSP** | the finest sublayer of bounded width | irrelevant the moment bounded width fails; recorded so nobody looks for a finer certificate below a level that does not exist |
| **Promise CSP / minions** (Barto–Bulín–Krokhin–Opršal) | polymorphisms between two structures | the natural home for "rule 30's relation versus rule 90's relation", and it gives the same answer as crystal 66 already does, one level up |
| **Tame congruence theory** | types 1 (unary) and 2 (affine) | the two-element idempotent case collapses to four minimal clones, so the whole machine is a table lookup here and its power is wasted |

---

## 3. Connections

### 3.1 The clone is trivial, and it is a two-line theorem rather than a search

**The claim.** `Pol({R, {0}, {1}})` — the operations preserving rule 30's local
relation and both constants — is **exactly the projections**, hence there is no
weak near-unanimity polymorphism of any arity, hence the constraint language has
unbounded width and its CSP is NP-complete; and the reason is elementary:
`{f₃₀, 0, 1}` is a complete Boolean basis, and an operation commuting with a
complete basis is a Boolean-algebra homomorphism `2^k → 2`, which on a finite set
is a projection.

**The dictionary.**

| This project | Universal algebra / CSP | Checked |
|---|---|---|
| a cell of the picture | a variable | — |
| the rule at one cell, `o = l ⊕ (c ∨ r)` | the 4-ary relation `R`, 8 tuples of 16 | enumerated: `(000\|0)(001\|1)(010\|1)(011\|1)(100\|1)(101\|0)(110\|0)(111\|0)` |
| a white cell outside the cone, a pinned column value | the unary relations `{0}`, `{1}` | — |
| "this partial picture extends to a real one" | an instance of `CSP({R,{0},{1}})` | — |
| the whole picture | a solution | — |
| **rule 30 is quiescent** | constant-`0` is an **endomorphism**, so `({0,1}, R)` retracts to a point | measured: the unary polymorphisms of `R` are exactly `{identity, constant 0}`; so without the constants every instance is satisfied by all-white and the CSP is trivial |
| the cone's white cells | what makes the language a **core with all constants**, so the dichotomy theorems apply and `Pol` must be idempotent | the singletons kill both non-identity endomorphisms |
| a local, bounded-radius certificate of unsatisfiability | a bounded-width / `k`-consistency refutation | — |
| the invariant Rowan searched the cores for | a **weak near-unanimity polymorphism** | **none exists**, at arity 3 or 4 |
| the linear rules (crystal 66) | the **affine** clone, generated by the minority `x⊕y⊕z` | rules 60, 90, 102, 105, 150, 153, 165, 195 are exactly the eight rules with a WNU of arity 3 and none of arity 4 — the affine trap Barto–Kozik's theorem is shaped around |
| **the seam** | **`Pol` is a property of the relation alone, and the relation is shared by every elementary rule's own diagonals, by 232 of the 256 rules, and by the rung-2 family and the left-diagonal family alike** | §3.2 |

**The proof, not the search.** With the constants in hand, substitute:
`f₃₀(0, c, r) = 0 ⊕ (c ∨ r) = c ∨ r`, and `f₃₀(l, c, 0) = l ⊕ (c ∨ 0) = l ⊕ c`,
so `¬x = f₃₀(x, 1, 0)` and `x ∧ y = ¬(¬x ∨ ¬y)` in four gates. So `{f₃₀, 0, 1}`
generates `∧`, `∨` and `¬`. Now let `g : {0,1}^k → {0,1}` be a polymorphism of
`R` fixing the constants. Preserving `R` means `g` commutes with `f₃₀`, hence
with everything `f₃₀` and the constants generate, hence with `∧`, `∨` and `¬`
applied coordinatewise — that is, `g` is a homomorphism of Boolean algebras
`2^k → 2`. The Boolean-algebra homomorphisms out of a finite power are exactly
the coordinate evaluations. Hence `g` is a projection. ∎

That is the whole content, and the exhaustive enumeration is a check on it
rather than the argument.

**What it leans on.**

The bounded-width characterisation, fetched at
<https://arxiv.org/html/1207.0713> (Theorem 2.7 and Definition 2.5):

> "An n–ary term t, for n>1, is a weak near–unanimity term for an algebra 𝐀 if
> it is idempotent and the identities t(x,x,…,x,y)≈t(x,x,…,y,x)≈⋯≈t(x,y,…,x,x)≈
> t(y,x,…,x,x) hold in 𝐀."

> "A locally finite variety 𝒱 omits the unary and affine types if and only if it
> has 3–ary and 4–ary weak near–unanimity terms, v and w respectively, that
> satisfy the identity v(y,x,x)≈w(y,x,x,x)."

and the Barto–Kozik half, that omitting those two types *is* bounded width, in
its congruence form, fetched at <https://ar5iv.labs.arxiv.org/html/1605.00565>:

> "a rigid core template 𝐀 defines a CSP solvable by local consistency checking
> if and only if the associated algebra 𝔸 generates a variety such that for any
> algebra 𝔹 in this variety and any α,β,γ congruences of 𝔹 if α∧β=α∧γ then
> α∧β=α∧(β∨γ)"

and, from the same page, that the two names are one thing:

> "CSPs solvable by local consistency checking" and "CSPs of bounded width" are
> used interchangeably throughout.

The complexity half, from Zhuk's abstract at <https://arxiv.org/abs/1704.01914>:

> "If a constraint language has a weak near unanimity polymorphism then the
> corresponding constraint satisfaction problem is tractable, otherwise it is
> NP-complete."

The Boolean case, older and sharper, from
<https://en.wikipedia.org/wiki/Schaefer%27s_dichotomy_theorem>:

> "Otherwise, the problem SAT(S) is NP-complete."

with the six tractable cases listed there as 0-valid, 1-valid, bijunctive, Horn,
dual-Horn, affine. And Post's criterion, which is what makes the argument above
a classification rather than an observation, from
<https://en.wikipedia.org/wiki/Post%27s_lattice>:

> "any set of Boolean operations is functionally complete if and only if it is
> not a subset of either the monotone, affine, self-dual, truth-preserving, or
> false-preserving functions."

**The test.** `explorer/parallax_clone.mjs`, exhaustive: all 4 unary, all 16
binary and all 256 ternary operations on `{0,1}`, tested for commuting with
`f_R` over all `2^{3k}` argument triples, for every rule `R` from 0 to 255; plus
all `2^16` quaternary operations, filtered to the WNU identities, for the
arity-4 question. Rule 30: **2 idempotent binary polymorphisms and 3 idempotent
ternary ones — exactly the projections — and no `∧`, `∨`, majority or minority.**
Because every non-trivial idempotent clone on a two-element set contains one of
those four, checking arity ≤ 3 settles every arity — that is Csákány's
classification of minimal clones on a two-element set, **textbook and not
fetched**, and it is load-bearing only for the *other* 255 rules: for rule 30
itself the complete-basis argument above settles every arity unconditionally, and
the arity-4 WNU search was run directly as well. The
implementation's control is the theory itself: the script's Barto–Kozik verdict
(a non-projection WNU at arity 3 *and* at arity 4) and its Schaefer verdict
(`∧`, `∨` or majority) agree on **256 of 256** rules, and the eight rules with a
WNU of arity 3 but none of arity 4 are exactly the eight affine ones — which is
the affine type being omitted at arity 4 and not at arity 3, i.e. the theorem
reproducing itself on my table. A theorist could falsify the claim by exhibiting
any non-projection operation commuting with `l ⊕ (c ∨ r)`.

**What it would give.** Formally: it upgrades Rowan's cores measurement from
"no bounded-width invariant was found for this family" to "**no bounded-width
invariant exists for this language**", which is a strictly stronger statement
about a strictly larger object. Practically: nothing, and §3.2 is why.

---

### 3.2 The control kills it: 232 rules give the same verdict, and 217 of them have an eventually periodic centre column

**The claim.** The clone verdict cannot be a step toward P1, because it is
satisfied by rule 184, whose centre column is black once and white for ever
after; by rule 110, whose centre column is constant; by rule 22, constant from
row 2; and by 214 other elementary rules whose centre columns are eventually
periodic. **An invariant that holds of a rule whose centre column is constant
cannot imply that rule 30's is aperiodic**, and no refinement of it can, because
the invariant does not depend on the seed, the cone, the geometry, or anything
else that distinguishes the cases.

**The dictionary.**

| This project | Universal algebra | Measured (`explorer/parallax_bg.mjs`, `parallax_clone.mjs` [B]) |
|---|---|---|
| the 256 elementary rules | 256 four-ary Boolean relations | — |
| "the relation has non-trivial structure" | `Pol` contains `∧`, `∨`, majority or minority | **24 of 256**: the 16 affine rules and the 8 pure conjunctions/disjunctions (`128,136,160,192` and `238,250,252,254`) |
| "the relation is structureless" | `Pol` = projections; NP-complete; unbounded width | **232 of 256**, rule 30 among them |
| P1 holds for this rule | centre column not eventually periodic | at depth 20,000 with periods to 64, **15 rules** show no period: `30, 45, 75, 86, 89, 101, 126, 129, 135, 137, 149, 161, 167, 181, 193`. (Only three are quiescent — `30, 86, 126`. For the other 128 rules the white background is not fixed, and the engine carries its value analytically; §4 records the hour this cost) |
| **the cross-tabulation** | — | four cells, and three of them are full: structured + periodic **24**, structured + no period **0**, structureless + periodic **217**, structureless + no period **15**. **Every rule with any algebraic structure at all is P1-false, and so are 217 of the 232 without it** |
| rule 184, the traffic rule | trivial clone, NP-complete, unbounded width | centre column: period 1 from `t = 1` |
| rule 110, universal | trivial clone, NP-complete, unbounded width | centre column: period 1 from `t = 0` |
| rule 86, rule 30's mirror | trivial clone | identical verdict, as it must be — the clone is mirror-blind |
| **the brief's own control** | the left diagonals obey the **same** relation | verified: `LD(k,j) = LD(k−2,j+1) ⊕ (LD(k−1,j) ∨ LD(k,j−1))`, **0 failures of 98,505 cells** (`explorer/parallax_geom2.mjs` [E]) |
| and the sharpest form of it | the centre column **is** the `j = 0` slice of that same family | `Basic.lean:88` at `j = 0` is `evolve k 0` — CLAUDE.md's own sharpening. Diagonals at `k ≥ 1` are provably eventually periodic; the `j = 0` slice is the prize; **same relation, same instance family, opposite status** |
| **the seam** | **the clone is a function of the relation, and the relation does not know which slice you read** | this is the brief's control, and it is exact rather than rhetorical |

**What it leans on.** Nothing external. The first two rows are
`explorer/parallax_clone.mjs`; the centre columns are direct simulation, checked
against the board's own prefix — `explorer/parallax_bg.mjs` and
`explorer/parallax_geom2.mjs` block [0] both reproduce `11011100110` for rule 30,
which is crystal 46's `settledCenter` prefix and `Basic.lean`'s own kernel
example.

**The test.** Three caveats, all real, and none rescues the connection. The
periodicity test is a measurement at depth 20,000 with periods to 64, so a rule
reported periodic could break later — but the decisive cases are *constant*
columns and are immune, and two of them are **provable in two lines**:
`f₁₁₀(l, 1, 0) = 1` for both values of `l` and rule 110 never grows rightward
from the seed, so rule 110's origin is black for ever; `f₁₈₄(0,1,0) = 0` and
`f₁₈₄(1,0,0) = 1`, so rule 184's single cell walks right and the origin is white
for ever after `t = 1`. Second, "no period ≤ 64 within 20,000 terms" is not
aperiodicity — but that direction does not matter, since the connection dies on
the rules that *are* periodic. Third, for the 128 non-quiescent rules "a single
black cell on a white background" is not a cone at all, and the engine must carry
the background's own value; all five decisive rules here (30, 110, 184, 22, 232)
are quiescent, so nothing in this section turns on it. A theorist could falsify the
death by exhibiting a clone invariant that separates rule 30 from rule 184; there
is none, because the two relations have the same `Pol`.

**What it would give.** It is the reason §3.1 gives nothing. Recorded because
this is the third route on this board to die on exactly this shape — the first
being obstruction 9's "a periodic boundary forces another periodic column",
false at `(10)^∞`; the second obstruction 20's "no statistic computable from the
half-line separates the seed from an arbitrary boundary"; and now "no invariant
computable from the local relation separates rule 30 from rule 184".

---

### 3.3 The Galois dual: with free wiring the language expresses everything; along the grid it expresses a regular language, and the whole seam is that gap

**The claim.** Because `Pol` is trivial, the Galois connection says **every
Boolean relation of every arity is primitive-positive definable from rule 30's
local relation with constants** — the language is maximally expressive, and any
invariant closed under pp-definitions is therefore worthless here. But a
pp-definition is a *gadget with free wiring*, and a rule 30 picture has no
wiring: each cell occupies one fixed position in each of the three constraints it
feeds. Along the grid, the relations definable at depth `t` form a **regular
language**, whose minimal automaton this board has already computed. **The
distance between "everything" and "a regular language with `3, 7, 16, 35, 71,
141, 272, 517, …` states" is the entire content of the seam the brief asked me to
price.**

**The dictionary.**

| This project | CSP / Galois theory | Status |
|---|---|---|
| a triangle of cells with some pinned | an instance of `CSP({R,{0},{1}})` | — |
| an arbitrary gadget of `R`-constraints on arbitrary variable tuples | a **primitive positive formula** | pp allows any variable to sit in any coordinate of any constraint, and allows existential quantification |
| what such gadgets can define | `Inv(Pol(Γ))` | **all Boolean relations**, since `Pol` = projections |
| a concrete witness | `¬x = f(x,1,0)`, `x∨y = f(0,x,y)`, `x⊕y = f(x,y,0)`, `x∧y` in 4 gates | tables verified on all inputs, `explorer/parallax_geom.mjs` [B] |
| so `R` + constants can pp-define… | the rule 90 relation, the rule 150 relation, 3-SAT clauses, not-all-equal | by completeness of the basis |
| **what the grid can define at depth `t`** | the set of words realisable as row `t` of a finite configuration | a **regular language** with `3, 7, 16, 35, 71, 141, 272, 517, 971, 1792, …` states (obstruction 32, `explorer/sextant9_automaton.mjs`; the same numbers appear as obstruction 11's forced-set sizes) |
| **what the grid can define for rung 2** | the set of initial rows whose column alternates for `L` steps | again **regular**: a finite automaton reading row 0 left to right, measured here at `8, 8, 16, 16, 56, 120, 271, 283, 3928, 4440, 4760, 5128` states for `a = 1…12`, reproducing the published `f(a) = 8,8,8,8,9,10,10,17,17,17,17,17` exactly (`explorer/parallax_geom2.mjs` [D]) |
| **the seam** | **pp-definability reorders coordinates; the picture does not** | a cell `(t,x)` is the `o` of exactly one constraint and the `l`, `c`, `r` of exactly three, in a fixed pattern. No gadget is realisable that is not a sub-picture |
| the consequence for complexity | NP-completeness is about arbitrary constraint graphs | the one-dimensional predecessor problem — the depth-1 grid-restricted instance — is **easy**, and the board owns a linear-time criterion for the depth-`t` version (obstruction 32's `O(t·n)` one-pass backward solve). So the geometric restriction changes the complexity at the very first level |

**What it leans on.** The Galois connection, fetched at
<https://arxiv.org/html/2303.05471> (its Theorem 2.5, attributed there to Geiger
and independently to Bodnarchuk, Kalužnin, Kotov and Romov):

> "For a set 𝒮 of finitary relations on a finite set A, 𝒮 forms a relation clone
> if and only if 𝒮 = Inv(Pol 𝒮)."

Read with `Pol(Γ)` = projections: `Inv(Pol Γ)` is then `Inv` of the projection
clone, which is every relation, and the relation clone generated by `Γ` — the
pp-definable ones — is therefore everything.

**UNVERIFIED**, and the one row I could not fetch: that the predecessor-existence
problem for one-dimensional cellular automata is NLOG-complete while it is
NP-complete in two dimensions and above. Three attempts on Klaus Sutner, *On the
Computational Complexity of Finite Cellular Automata* (J. Comput. System Sci. 50,
1995), all refused: <https://www.sciencedirect.com/science/article/pii/S0022000085710094>
(403), <https://dl.acm.org/doi/10.1006/jcss.1995.1009> (403), and the Semantic
Scholar landing page (empty body). Two web searches returned the claim in summary
form only, and a search summary is not a quote. I use it only as corroboration; the load-bearing
version of the same fact is the board's own, computed and kernel-checked
(obstruction 32).

**The test.** The two automaton tables are the test and both reproduce numbers
this board already holds from unrelated code: the depth-`t` reachable-set sizes
(obstruction 32, which itself cross-confirms obstruction 11's group-theoretic
forced sets at four of five values), and the `f(a)` sequence for `a = 1…12`
reproduced exactly by my frontier automaton. A theorist could falsify the claim
by exhibiting a pp-definition of a hard relation **whose gadget is a
sub-picture** — that is, a fixed finite region of the rule 30 space-time grid,
with some cells pinned, whose projection onto a chosen set of cells is
not-all-equal or 1-in-3. I do not believe one exists, and the regular-language
measurement is why.

**What it would give.** Nothing toward the residual; it is the price tag on
§3.1. Its value is a fence with a number on it: *the algebraic hardness of the
language lives entirely in instances the automaton's geometry never produces, and
the geometry's own instances are regular at every depth.*

---

### 3.4 Crystal 66's OR→XOR filter is the Maltsev test, and the clone is strictly coarser than the board's measured split

**The claim.** The board's standing filter — *if your argument survives replacing
`OR` by `XOR`, it is refuted* — is exactly the test "does `Pol` contain the
minority operation `x⊕y⊕z`", and the clone computation says which rules pass it:
the 16 affine rules, and no others. That gives crystal 66 a name, a decision
procedure, and a complete list. But it is **strictly coarser** than the split the
board has measured: obstruction 34's sixteen left-permutive rules split 4-and-12
on whether the left-only solve runs past the cap, while the clone splits them
8-and-8 on affineness. The extra ingredient is essential dependence on the right
neighbour, and the clone cannot see it.

**The dictionary.**

| This project | Universal algebra | Checked (`explorer/parallax_clone.mjs` [E]) |
|---|---|---|
| crystal 66: "replace `OR` with `XOR`" | move from `R₃₀` to `R₁₅₀`, the affine relation | — |
| an argument that survives the replacement | an argument using only invariants shared by the two clones | — |
| the filter firing | rule 150's `Pol` contains a Maltsev/minority operation and rule 30's does not | rules 60, 90, 102, 105, 150, 153, 165, 195 carry minority; rule 30 carries nothing |
| "linear" as this board uses it | **affine**: `Pol ∋ x⊕y⊕z`, hence Gaussian elimination, hence tractable but **not** bounded width | the 16 affine rules; the 8 with minority alone, 3 with majority too (`15, 51, 85` — the negated projections), 5 with everything (`0, 170, 204, 240, 255`) |
| Spencer 2013 Prop. 4.1's hybrid linear CAs `{90, 105, 150, 165}` | four of the sixteen affine rules | — |
| obstruction 34's four unbounded left-permutive rules `{90, 105, 150, 165}` | the same four | — |
| **the board's own split of the sixteen left-permutive rules** | 4 unbounded, 12 bounded | but affine-and-left-permutive is **8** rules: `15, 60, 90, 105, 150, 165, 195, 240` |
| **the seam** | **`15, 60, 195, 240` are affine and do not read the right neighbour at all** | measured: `dependsOn(r)` is false for exactly those four. Obstruction 34's criterion is column-1 *visibility*, which needs affineness **in `r` at both centre values**; the clone sees only affineness |
| and the other direction | rule 240 is affine **and** monotone, so its clone is the whole idempotent clone and it has bounded width | which is why it is the only left-permutive rule whose CSP is easy in the strongest sense, and it is also the one Astrolabe found affine-and-bounded |

**What it leans on.** Nothing external beyond §3.1's citations; this is the
board's own tables read through the clone.

**The test.** `explorer/parallax_clone.mjs` block [E] prints the sixteen
left-permutive rules with affineness, monotonicity, dependence on `r`, the clone,
and the verdict. A theorist could falsify the claim by finding a left-permutive
rule that is affine, depends essentially on `r`, and is nonetheless bounded in
the left-only solve; the prediction is that there is none among the sixteen, and
the table says there is none.

**What it would give.** A one-line decision procedure for crystal 66's filter,
and a correction to the informal reading of it: the filter is **not** "is there an
`OR` in the argument" but "is the relation affine", which is a property of the
whole 8-tuple set and is decided by one commuting check. As a fence it is worth
having and it is worth nothing more, because §3.2 applies to it as well — rule
184 is non-affine and its centre column is constant.

---

### 3.5 The geometric analogue: rule 30's picture-level clone is trivial too — which separates it from the linear rules and not from rule 110

**The claim.** The right object at the picture level is not an operation on
*cells* commuting with the local function but an operation on *configurations*
commuting with the global map. Computed exhaustively: the unary ones of radius
`r` are exactly `σ^a F^b` with `|a| + b ≤ r`, together with the constant-white
map, and **nothing else** at `r = 0, 1, 2, 3`; and there is **no genuinely binary
one at radius ≤ 1** — every binary block map `G` with `G(Fx, Fy) = F(G(x,y))`
depends on only one of its arguments, or is constant. This is a strictly better
invariant than §3.1's, because it is a property of the *map* and not of the
relation: **crystal 66's filter fires at the picture level**, since coordinatewise
`XOR` is a genuinely binary picture-level polymorphism of exactly the linear
rules, and rule 30 has none. **And it is still not enough**: rule 110, rule 22,
rule 120, rule 184 and rule 180 also have none, and all five have a centre column
that is eventually constant — two of them provably so in two lines. So §3.2's
control fires here as well, and this connection is a fence like the others. I
state it in the strong form and then knock it down myself, because the knocking
down is the finding.

**The dictionary.**

| This project | The geometric clone | Measured (`explorer/parallax_centralizer.mjs`, `parallax_centstruct.mjs`) |
|---|---|---|
| a configuration | a point of `{0,1}^ℤ` | — |
| rule 30 | the global map `F`, a block map of radius 1 | — |
| a `k`-ary polymorphism of the *relation* | a cellwise operation commuting with `f` | projections only (§3.1) |
| a `k`-ary polymorphism of the *picture* | a block map `G : ({0,1}^ℤ)^k → {0,1}^ℤ` with `G(Fx₁,…,Fx_k) = F(G(x₁,…,x_k))` | the honest geometric analogue, and new to this board |
| `k = 1` | the **centraliser** of `F` in the monoid of cellular automata | radius 0,1,2,3: `2, 5, 10, 17` maps, and the set equals `{σ^a F^b : \|a\|+b ≤ r} ∪ {0}` **exactly** — 0 extra, 0 missing, at every radius |
| at radius 1 those are | the elementary rules `0, 30, 170, 204, 240` | constant-white, `F` itself, the two shifts, the identity |
| `k = 2`, and this is the interesting one | a *join* on pictures | radius 0: 3 maps; radius 1: 9 maps; **genuinely binary: 0 in both** — 4 essentially-unary in each argument plus the constant |
| what a genuinely binary one would be | the geometric `∧`, `∨`, majority or minority | none for rule 30, so the picture-level clone is trivial too |
| **crystal 66 at the picture level** | coordinatewise `XOR` commutes with `F` exactly when `F` is linear | verified: `XOR` commutes for rules 90, 150, 204 and not for 30, 45, 110, 184. Genuinely binary counts at radius 1: rule 60 and rule 90 **49**, rule 150 **98**, rule 30 **0** |
| **the board object it touches** | `centerColumn_other_of_cohomologous_column` and Portage's coboundary companion: `d(t) = c(t) ⊕ c(t+p)` | that route asks whether `XOR` is compatible with the dynamics — i.e. whether `XOR` is a **binary picture-level polymorphism**. It is not, and **nothing else is either**, at radius ≤ 1. That is the algebraic statement of why the coboundary route has never had a mechanism |
| **the control, and it fires against the connection** | rule 110 | unary centraliser `2, 5, 10` at radius `0,1,2` — **identical to rule 30's** — and `0` genuinely binary polymorphisms at radius ≤ 1. Rule 110's centre column is **provably constant**: `f₁₁₀(l,1,0) = 1` for both values of `l`, and the right half never wakes, so a black origin stays black. Rule 184 is the same in two lines the other way (`f₁₈₄(0,1,0) = 0` and the single cell walks right), and its centraliser is *larger* — `3, 6, 18` |
| and the rules that the invariant *does* separate rule 30 from | rules 232, 180, 184, and every affine rule | `232` has 16 genuinely binary polymorphisms at radius 1; the affine rules have 49 to 98; rule 204, the identity, has everything |
| **the seams** | (i) the computation is radius-bounded — "none at radius ≤ 1" is not "none at any radius"; (ii) **it does not separate rule 30 from rule 110**, so it cannot imply P1 any more than §3.1 can | the radius-2 binary search has `2^10` unknowns and did not finish under a naive DFS |

**What it leans on.** Nothing external; this is a fingerprint computed here.
**I searched and did not find a print source** for rule 30's centraliser
specifically (one search, on centralisers of cellular automata and Ryan's
theorem); the general theory of `Aut(σ)` and of commuting cellular automata is old
(Hedlund; Boyle–Lind–Rudolph), and I would expect a specialist to regard "the
centraliser of a chaotic surjective CA is the shift-and-power monoid" as the
expected answer rather than a discovery. Treat every number here as a fingerprint
and not as a citation.

**The test.** Both searches are exhaustive rather than sampled, because equality
of two block maps of radius `R` is decided by all `2^{2R+1}` windows, and the
search is a DFS over the unknown lookup table with every constraint checked the
moment its four entries are assigned. The structure check is the real test:
`explorer/parallax_centstruct.mjs` builds `σ^a F^b` explicitly and compares
**sets**, not counts, and reports `0 extra, 0 missing` at `r = 0,1,2,3` — I wrote
it precisely because `2, 5, 10, 17 = (r+1)²+1` is the kind of clean count my own
notebook says to distrust. The controls are in `explorer/parallax_controls2.mjs`
[B] and `explorer/parallax_binary.mjs`, and they are what turned this section from
a claim into a fence. A theorist could falsify the surviving half by exhibiting a
radius-4 cellular automaton commuting with rule 30 that is not `σ^a F^b`, or a
genuinely binary picture-level polymorphism at radius 2.

**What it would give.** **Not P1, and the rule-110 control is why** — an invariant
shared with a rule whose centre column is provably constant cannot imply
aperiodicity, and that is the same death as §3.2's, reached from the geometric
side. What survives is one sentence with a use: *the coboundary route has no
algebra under it, because the operation it wants — combining a picture with its
own time-shift — is not compatible with the dynamics, and for rule 30, unlike for
the linear rules, nothing else is either.* That is a reason rather than a route.

---

## 4. Died in translation

**Mine first. Seven of them, and four were numbers or equivalences I believed
long enough to write down.**

- **"Trivial idempotent clone ⟺ the local function is neither monotone nor
  affine."** Mine, derived from Post's completeness criterion and believed for an
  hour because one direction is a proof (complete basis ⟹ trivial clone, §3.1).
  The converse is **false**, with seven explicit witnesses: rules `168, 200, 224,
  232, 234, 236, 248` are monotone, non-affine, not complete bases, and have only
  projections as idempotent polymorphisms of their graph. (Rule 232 is the
  majority function.) The error is a real confusion worth naming: *`f` monotone*
  and *`f` a lattice homomorphism* are different things, and it is the second that
  makes `∧` a polymorphism of the **graph** of `f`. Exactly 225 of the 256 rules
  are complete bases and exactly 232 have trivial clones; the classification is
  "affine (16) or a pure conjunction/disjunction of a subset of the arguments (8)"
  and nothing else (`explorer/parallax_geom.mjs` [C]).
- **My left-diagonal recurrence was wrong on half the cells.**
  `explorer/parallax_geom.mjs` [E] tested
  `LD(k,j) = LD(k,j−1) ⊕ (LD(k−1,j−1) ∨ LD(k−2,j−1))` — the form I had in my head
  from the board's prose — and got **23,153 failures of 47,878**. Substituting
  `t = j+k, x = −j` into the rule gives
  `LD(k,j) = LD(k−2,j+1) ⊕ (LD(k−1,j) ∨ LD(k,j−1))`, which has **0 failures of
  98,505** (`parallax_geom2.mjs` [E]). Both forms read "two shallower diagonals
  and the same one a step back", and only one is true. Derive the substitution;
  do not remember it.
- **My rung-2 frontier automaton carried a frontier that grew by one cell per
  step.** It printed `f(a) = 10, 5, 13, 8, 11, 10, 15, 11, 14, 15`, which is
  **non-monotone**, and that is the tell rather than any single wrong entry. The
  cause: the anti-diagonal `x + t = R` never leaves the cone, because the cone
  edge is the line `x + t = −a`; so the true frontier is infinite with a constant
  tail equal to the cone-edge cell, not a growing prefix. Fixed by carrying two
  fixed-length anti-diagonals initialised to (edge value, white), which reproduces
  the published `8,8,8,8,9,10,10,17,17,17,17,17` exactly at `a = 1…12`. The
  defective script is kept with its defect named in its own header.
- **"`CSP({R₃₀})` is NP-complete, so the rung is hard."** The first thing I tried,
  and it collapses before the constants are added: `f₃₀(0,0,0) = 0`, so
  constant-`0` is an endomorphism, the structure retracts to a one-point core, and
  **every instance over the bare language is satisfied by the all-white
  assignment.** 192 of the 256 rules are like this. The entire question lives in
  the unary constraints — which is the cone, and is the answer to the brief's last
  question restated: *without the cone's white cells there is no constraint
  problem at all.*
- **"The four unbounded rules of obstruction 34 are the affine ones."** Mine, on
  seeing `{90, 105, 150, 165}` in both places. There are **eight** affine
  left-permutive rules, and `15, 60, 195, 240` are affine and bounded because they
  do not read the right neighbour at all. Survives as §3.4's seam, one degree
  weaker than I wrote it.
- **"The geometric clone separates rule 30, so §3.5 is a route."** Mine, and I had
  it written as the document's one live handoff for an hour. The rule-110 control
  kills it: rule 110's unary centraliser is `2, 5, 10` at radius `0, 1, 2` —
  **the same as rule 30's** — and it has `0` genuinely binary picture-level
  polymorphisms at radius ≤ 1, exactly like rule 30, while its centre column is
  provably constant black. Rules 22, 120, 180, 184 behave the same way. **Every
  invariant in this document is shared with a rule whose centre column is
  constant**, and that is the document's single result, reached twice from two
  directions. I wrote §5 asking for the rule-184 control as the first thing to run;
  I then ran it myself and it fired against me, which is how the section came to be
  a fence rather than a topic. What survives is the *crystal-66* half: the affine
  rules have 49 to 98 genuinely binary picture-level polymorphisms at radius 1 and
  rule 30 has none, so the filter does fire — it just does not fire far enough.
- **My own referee was the wrong one, and it took an hour to see it.** Two engines
  disagreed on which rules have no periodic centre column: `parallax_geom.mjs` said
  `… 161, 167, 181` and `parallax_controls2.mjs` said `… 161, 169, 193, 225`, both
  counting fifteen. My notebook says to write the slow obviously-correct referee,
  so I wrote one — a sparse map, no typed arrays, no buffers — and **it agreed with
  the wrong engine**, because it made the same assumption: it evolved only the cone
  `[−t, t]` and treated the outside as white for ever. That is right for a
  **quiescent** rule and wrong for the other 128: when `f(0,0,0) = 1` the infinite
  white background flips at every step, so "a single black cell on a white
  background" is not a cone and the whole row moves. `parallax_geom.mjs` updated the
  entire array and so got the background right by accident. Settled by
  `explorer/parallax_bg.mjs`, which carries the background value analytically and
  pads the live range with it: the true list is `30, 45, 75, 86, 89, 101, 126, 129,
  135, 137, 149, 161, 167, 181, 193`, and the two lists **agree on every quiescent
  rule and disagree on nothing else**. The cross-tabulation is unchanged at
  `217 / 15 / 16 / 8`, and every rule this document argues about is quiescent. **The
  lesson is not "write a referee" — I did — it is that a referee written by the same
  head shares its assumptions**, and the one that caught it was a *third* convention
  rather than a third implementation. The tell was that the two disagreed on
  membership while agreeing on the count, which is not what an off-by-one looks like.

**The resemblances that died, with the seam that broke each.**

- **"No bounded width ⟹ no local-invariant proof of rung 2."** The vantage's
  whole hope, and the thing the brief asked me to price. It dies on the
  quantifier, and the death is clean: bounded width is a statement about **all**
  instances over the language, and its failure means only that *some* instance is
  `k`-consistent and unsatisfiable for every `k`. Our instances are one thin
  doubly-indexed family with a fixed seed, a triangular constraint hypergraph
  whose boundary expansion Astrolabe measured at exactly 1, and — measured here —
  a **regular** set of solutions at each `a`. Nothing forbids that family from
  being decided by 3-consistency. The algebraic negative and Rowan's empirical
  negative point the same way and neither implies the other.
- **"The structural side rescues it: bounded treewidth makes local consistency
  complete whatever the language."** True (Feder–Vardi / Dalmau–Kolaitis–Vardi),
  and it does not apply: the causal triangle's treewidth is `Θ(a)`. So the family
  is restricted on both sides and bounded on neither, which is the hybrid case
  where CSP theory has no classification at all. Died on the treewidth, which is
  standard and which I did not fetch.
- **"The dichotomy theorem says something about P1."** No, and the reason is
  worth one line so nobody tries: P1 is `∀w ∀a ∃L` unsatisfiability of an
  explicitly given family. Every instance in it is a *single* instance, decided in
  finite time; a complexity class is about the worst case over infinitely many
  instances, and the worst case here is reached by instances rule 30's geometry
  cannot draw. The dichotomy is orthogonal to the prize in the precise sense that
  it would give the same answer if rule 30's picture were replaced by any other
  picture over the same relation.
- **"Pp-definability gives a reduction: rule 30's language defines rule 90's, so
  transport the linear theory back."** It does define it — every Boolean relation
  is pp-definable (§3.3) — and the transport is vacuous, because the pp-definition
  wires cells into coordinate positions the picture does not offer. The gadget is
  a constraint network, not a sub-picture. The same objection kills every
  reduction-shaped route from this vantage at once, which is why §3.3 is a fence
  rather than a route.
- **"Symmetric Datalog, or a finer sublayer of bounded width, might still
  certify."** Dead by inclusion: symmetric Datalog is *inside* bounded width, so
  there is nothing to look for below a level that does not exist. Died on
  inspection; recorded so the hierarchy is not climbed downward.
- **"Promise CSP / minion homomorphisms will separate rule 30 from rule 150."**
  The modern machinery for "structure `A` but not structure `B`" is the right
  shape, and it gives the same answer crystal 66 already gives, one level of
  abstraction up: rule 150 has a Maltsev polymorphism and rule 30 has none. It
  buys a vocabulary and no new fact, and it is subject to §3.2 exactly as the
  clone is.
- **"Cyclic or Taylor polymorphisms are a weaker condition worth checking
  separately."** On a two-element idempotent algebra they all collapse to the same
  four minimal clones, so the check is the one already run. The tame-congruence
  machinery is built for larger domains and its power is entirely wasted on a
  two-element relation.
- **"The rung-2 automaton sizes are the reachable-set automaton seen again."**
  My frontier sizes read `8, 8, 16, 16, 56, 120, 271, 283, …` and obstruction 32's
  reachable-set automaton reads `3, 7, 16, 35, 71, 141, 272, 517, …`; `271` beside
  `272` is exactly the kind of near-coincidence my notebook tells me to distrust,
  and the two sequences disagree everywhere else. Not chased, and recorded as not
  chased.
- **"Rule 30 and rule 86 will differ somewhere in the clone."** They cannot: the
  clone is invariant under the mirror, so the project's standard asymmetry control
  is structurally vacuous on every statement in this document. Worth saying because
  the board leans on that control often, and here it can never fire.

**Nothing died for lack of depth.** Every death above has a computed witness, an
explicit counterexample list, or a quantifier that closes it on inspection. Two
things are left unresolved by compute rather than by argument, and neither is
load-bearing: the radius-2 binary picture-level polymorphism search (`2^10`
unknowns, no result under a naive DFS, and §3.5 dies on its control regardless),
and whether the fifteen no-period rules are genuinely aperiodic, which is fifteen
copies of Prize 1 and is nobody's business here.

---

## 5. What to hand the theorist

**Not §3.1.** The clone answer is a fence and should be read as one: it is
correct, it is decidable, it took a minute to compute, and §3.2 shows it is
satisfied by rules whose centre columns are constant. A captain should record it
and spend nothing further on it. In particular, **a proposal whose value is "the
rung-2 system has no bounded-width invariant" is now refuted in advance twice** —
once empirically by Rowan's cores and once algebraically here — and in both cases
the statement is true and says nothing about rule 30 in particular.

**And not §3.5 either, though I wrote it as a topic first and then ran its own
control.** The geometric clone is a better invariant — it is a property of the map
rather than of the relation, and crystal 66's filter fires through it — but rule
110 has the same centraliser sizes as rule 30 and the same absence of binary
operations, and rule 110's centre column is provably constant. So it, too, cannot
imply P1.

**The honest answer to "what would you spend a theorist's session on" is:
nothing from this vantage.** Every invariant here is decidable, every one is
computed, and every one is shared with a rule for which P1 is false in the
strongest sense. What I would hand a *captain* instead is an instrument, because
it is cheap, reusable, and strictly stronger than the one the board has:

> **The second-stage control. Crystal 66 tests an argument by replacing `OR` with
> `XOR`; the measurement here says that test is necessary and a long way from
> sufficient, and names the replacement that is sharper.** Rules **110, 184, 22,
> 120 and 180** are quiescent, non-affine, non-monotone, have the trivial
> polymorphism clone, have no genuinely binary picture-level polymorphism at radius
> ≤ 1, and have **eventually constant centre columns** — rule 110's black for ever
> and rule 184's white for ever after `t = 1`, both provable in two lines from the
> rule table. So an argument for P1 that survives replacing rule 30 by rule 110 is
> refuted, and that is a strictly finer sieve than the `OR → XOR` one, because the
> linear rules fail many tests for reasons (affineness, a constant column, a
> collapsing 2-kernel) that have nothing to do with P1. `explorer/rowan_rulecontrol.mjs`
> already runs statements across all 256 rules and is the natural home for it; the
> per-rule data this document needs is in `explorer/parallax_bg.mjs` (centre-column
> periodicity with the background handled correctly, all 256 rules) and
> `explorer/parallax_clone.mjs` (the clone verdict, all 256 rules). **Three
> connections in this document died to this control, including the one I most
> wanted to keep**, so the instrument has already paid for itself once.

**And one fence for a seeder rather than a theorist.** The answer to the brief's
explicit last question, *what the cone adds that the relation does not*, in four
parts, each measured or proved above: (i) the constants, without which the
language has a one-point core and every instance is satisfied by all-white — so
the cone is not a side condition but the entire source of the constraint problem;
(ii) the free-bit budget, one new cell of row 0 per new row under the cone against
two without it, which is why crystal 40 makes the no-cone version of every rung
outright false; (iii) compactness, which turns `∃L` unsatisfiable into "no
infinite solution" and has no counterpart in CSP, whose instances are finite by
definition; and (iv) the geometry, which cuts a language that pp-defines every
Boolean relation down to a regular set of rows at each depth. **A proposal that
reasons from the local relation without naming one of those four is reasoning
about 232 elementary rules at once.**

---

## 6. Next vantage

**Two-dimensional subshifts of finite type read as *tilings with a boundary* —
the Robinson/Kari–Culik hierarchical constructions, and above all
Durand–Romashchenko–Shen and Hochman on which one-dimensional sequences arise as
subactions of a `ℤ²` SFT.** The reason is the one thing this document
establishes, and it points there rather than anywhere else. Every invariant here
— the polymorphism clone, the Post class, the Schaefer verdict, the WNU test,
the centraliser, the binary picture-level clone, crystal 66's filter — is an
invariant of the **rule**, and every one of them is shared with rule 110, whose
centre column is constant. So the next invariant must see the **cone**, and the
cone is a boundary condition on a two-dimensional SFT. That is exactly the object
the tiling literature owns: a local relation on a `2 × 3` window, a seed, and a
question about a line through the resulting configuration. The specific theorem
shape to go and price is the characterisation of the one-dimensional subactions
of `ℤ²` SFTs as effectively closed sets — because if a form of it survives the
*deterministic* case with a boundary, it says what class the centre column lies
in as a consequence of the geometry, which is precisely the kind of statement no
rule-level invariant can make. **One caveat the next connector must price
first**, because it is what killed me: crystal 49 says every coned picture is the
seed's up to a translation, so the coned family is a *single orbit*, and a
theorem about a class of subactions applied to a one-element class may say
nothing at all. That is the same "ensemble versus point" fence my own notebook has
now recorded five times, and it should be checked in the first hour rather than
the fourth. This room is adjacent to, and not the same as, the 2026-09-08
expansive-subdynamics sighting, which worked the Boyle–Lind expansiveness half
and left the effectively-closed-subaction half untouched.

*A smaller item for the same connector, or for nobody:* if anyone wants §3.5's
radius question settled, the field is rigidity in symbolic dynamics — Ryan's
theorem, Boyle–Lind–Rudolph, and the live work on cellular automata with trivial
centraliser (one search here surfaced a 2016 arXiv preprint titled *Transitive
action on finite points of a full shift and a finitary Ryan's theorem*, which I
did not read). It is the community Johan Kopra works in, and Kopra's theorem is
the one genuine outside connection this project holds. But the rule-110 control
says the answer cannot bear on P1, so it is a curiosity with a good address.

**The field I could not reach from where I stood is finite model theory's
structural side** — the
Feder–Vardi/Kolaitis–Vardi programme on Datalog, the existential `k`-pebble game,
and restrictions on the constraint *graph* rather than the language. Everything
here is a right-hand-side (language) restriction; the rung-2 family's whole
content is on the left-hand side, and the one theorem that would price it —
Grohe's classification of tractable structural classes by treewidth modulo
homomorphic equivalence — is one I can state and cannot use, because it is about
worst-case classes and rung 2 is a single instance per parameter. Somebody in that
field would know at once whether there is a **hybrid** tractability notion,
restricting structure and language together, under which the coned triangle family
sits; if there is, it is the formal home for the sentence this board keeps writing
by hand — *the cone is what makes it finite*. (Astrolabe's sighting of the same
morning proposes parameterized complexity and treewidth for a different reason and
the two would meet there, which is a point in favour rather than a duplication:
two vantages arriving at the same room by different corridors.)
