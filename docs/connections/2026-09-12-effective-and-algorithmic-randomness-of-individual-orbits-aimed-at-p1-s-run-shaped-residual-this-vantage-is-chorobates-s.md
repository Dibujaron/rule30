# Sighting: effective and algorithmic randomness of individual orbits

*Waywiser, connector, 2026-09-12. Vantage: Martin-Löf, Schnorr and Kurtz
randomness, the effective Birkhoff theorems and the Gács–Hoyrup–Rojas line,
aimed at P1's run-shaped residual. This vantage is Chorobates's own §6; the
question it puts is whether the **weaker** notions reach a computable point.*

**Band first, because the ordering is the point. Nothing in this document is
Novel.** The route-closure is **project-internal**: it removes a field from the
P1 shelf and prices the removal. The one identification worth carrying forward
— that the residual `..._of_long_black_runs` *is* Kurtz randomness restricted to
one countable family of tests — is at best **Nothing/Known**: it is a notation
change, elementary to anyone who has read a page of computability theory, and
its value is entirely that it makes the seam computable rather than felt. The
statement "the centre column is normal" is **Known**: Wolfram states it himself
as the guess, in the prize announcement, fetched below.

**The claim I was sent to falsify was that some theorem of the form "a
computable point whose orbit satisfies such-and-such an effective condition has
unbounded runs in its trace" exists. It survives falsification: I found none,
and the field has a theorem saying there cannot be one of the standard kind.**
Gács, Hoyrup and Rojas proved that Schnorr randomness is *equivalent* to
typicality for every mixing computable dynamics — so the randomness hypothesis
in the effective Birkhoff theorems is necessary, not merely sufficient, and no
weakening of it survives. Below that, the weakest standard notion, Kurtz
randomness, is *avoid every Π⁰₁ null class*, and for a computable `x` the
singleton `{x}` is itself a Π⁰₁ null class. So every computable point fails the
whole ladder at once, and it fails at a test that says nothing whatever about
runs.

**And the second half of the vantage's question has a yes that is worth
nothing.** There is exactly one effective-randomness notion a computable
sequence *can* satisfy — finite-state randomness, which by Schnorr–Stimm is
Borel normality, and which Champernowne's computable constant satisfies — and
it does imply that every specific word occurs, by the definition of normal. But
normality at block length 1 **is Prize 2**, and normality implies the run
residual and hence Prize 1. So the field's one applicable hypothesis sits
strictly above the conjunction of two prizes. **It is a fifth sufficient
condition for P1 and I am not returning it as one; §5 returns it as a fence
saying not to seed it.**

**Recommendation to the captain: close the probabilistic shelf, including this
last live route, and record the two roads and why each is shut — they are
shut for different reasons and a future session will otherwise find the second
one again.**

---

## 1. The problem, seen from outside

A doubly infinite row of cells, each black or white, all white but one. Update
every cell at once, for ever, by a fixed local rule: a cell's new colour is its
left neighbour's old colour exclusive-or'd with (its own old colour or its right
neighbour's old colour). Time runs down the page; the cells directly under the
one original black cell, read downward, are an infinite sequence of bits. To ten
million terms that sequence is indistinguishable from a fair coin by every
statistic anyone has tried. Nobody can prove it does not eventually repeat.

The particular sub-question this document is aimed at is weaker and more
concrete than "it does not repeat". It is: **does that sequence contain a run of
`L` consecutive black cells, for every `L`?** (Occurring *somewhere* and
occurring *arbitrarily late* are the same statement here, as Chorobates showed:
if length-`L` runs occurred only finitely often then longer runs would lie
inside those finitely many places and run lengths would be bounded outright.)
That statement implies the non-repetition one, and this project has the
implication proved. To ten million terms the longest black run is 23, and
Wolfram reports every block of length up to 22 occurring.

**Restated in the vantage's own terms, with no cellular automaton in it.** Fix
Cantor space `2^ω` with the uniform (Lebesgue) measure. For each `L`, let `S_L`
be the set of sequences containing no `L` consecutive ones. `S_L` is a subshift
of finite type: it is the set of paths through a computable tree, hence an
effectively closed set — a **Π⁰₁ class** — and it has measure zero. A sequence
avoids `S_L` exactly when it contains a run of `L` ones somewhere. So:

> **The residual is the statement that one explicitly given computable point of
> `2^ω` lies outside every member of the computable family of Π⁰₁ null classes
> `S_1, S_2, S_3, …`.**

"Avoid every Π⁰₁ null class" is, verbatim, the definition of **Kurtz
randomness**, the weakest randomness notion in the standard hierarchy. The
residual is that definition cut down to one countable sub-family of tests. That
restatement is the whole of section 3.1, and it is what makes the vantage's
seam computable rather than merely felt: the point is computable, so the
singleton `{x}` is *itself* a Π⁰₁ null class containing it, and the strongest
statement the field can make about it is that it fails the weakest notion — at a
test that is silent about runs.

## 2. Fields sighted

Fifteen. The unlikely entries are rows 9, 12, 13 and 15; row 13 is the one that
turned into the most useful dictionary, and row 5 is the one that turned out to
be the *only* road a computable point can stand on.

| field / theory | the object there | the seam, in one line |
|---|---|---|
| 1. **Martin-Löf randomness** | the centre column as a point of `2^ω` under Lebesgue measure | "Every random sequence is not computable" (fetched); the seed is computable, so this is refuted before it starts |
| 2. **Schnorr and computable randomness** | computable martingales betting on the column | one martingale, `d(w) = 2^{\|w\|}·[w ≺ x]`, is computable, succeeds, and has an explicitly computable rate — so a computable point fails all three notions at once |
| 3. **Kurtz (weak) randomness** — Π⁰₁ null classes | `S_L` = "no black run of length `L`" is exactly such a class | the residual is Kurtz randomness at the family `{S_L}`; but `{x}` is also such a class, so the seed fails the notion at a test about nothing (§3.1) |
| 4. **Effective Birkhoff theorems** — V'yugin, Hoyrup–Rojas, Bienvenu et al., Franklin–Greenberg–Miller–Ng | "the orbit visits the cylinder `[1^k]` with frequency `2^{-k}`" | the hypothesis is randomness *of the point*, and Gács–Hoyrup–Rojas proved it **necessary**: Schnorr random ⟺ typical for every mixing computable dynamics (§3.2) |
| 5. **Finite-state randomness / Schnorr–Stimm** | a finite-state gambler betting on the column | **the one rung a computable point can occupy** — and it is Borel normality, whose block-length-1 case is Prize 2 (§3.3) |
| 6. **Borel normality and finite-state dimension** — Dai–Lathrop–Lutz–Mayordomo | `dim_FS` of the column; `=1` iff normal | same rung as row 5, quantified; a *partial* bound `dim_FS ≥ 1−ε` gives runs of some bounded length and never unbounded ones |
| 7. **Normal-number constructions** — Champernowne, Copeland–Erdős | explicit computable normal sequences, so normality *is* compatible with computability | every proof in print builds the digits by concatenation; rule 30 concatenates nothing (§3.4) |
| 8. **Normality via a dynamical orbit** — Bailey–Crandall, Stoneham constants, the "hot spot" lemma | `α_{b,c}`'s digits are the orbit of `0` under `x ↦ bx mod 1` with explicit shifts, and its normality is *proved* | the map is an algebraic endomorphism of the circle whose orbit has a closed form by modular exponentiation; rule 30's row map is maximally nonlinear (§3.4) |
| 9. **Fractional parts of `(p/q)^n`, Mahler's Z-numbers** — Dubickas, Vijayaraghavan, Kari–Kopra | via Kopra's correspondence the centre column *is* a trace of the `×(3/2)` automaton | the only field with theorems about an individual computable orbit — and in fifty-eight years it has produced two, both weaker than the residual (§3.5) |
| 10. **Algorithmic information / effective dimension** | `C(x↾n)` for the column | provably `≤ log n + O(1)`: effective dimension **0**, the worst value possible. And rate `<1` is compatible with bounded runs anyway (golden-mean shift, rate `0.694`) |
| 11. **Solomonoff induction and universal prediction** | the completeness theorem, which *is* about computable sequences | it says the opposite of what is wanted: a fixed universal predictor makes only finitely much total error on any computable sequence |
| 12. **Von Mises–Wald–Church stochasticity** | computable place-selection rules | the rule "select position `n` iff `x(n) = 1`" is computable from the prefix (its length gives `n`) and selects an all-black subsequence: no computable sequence is Church stochastic |
| 13. **Symbolic dynamics of subshifts of finite type** | `S_L` as an SFT; "avoid every proper SFT" = disjunctive | this is the vocabulary in which the residual, Wolfram's block question and P1 line up as three rungs (§3.1); no theorem of the field puts an explicit point on any rung |
| 14. **Resource-bounded measure and pseudorandomness** — Lutz, Nisan–Wigderson, Blum–Micali–Yao | randomness of a *computable* object against a bounded adversary — the one place such theorems exist | a single fixed sequence is never pseudorandom: a nonuniform distinguisher hard-codes it. The measure-zero seam in complexity clothing (§3.6) |
| 15. **Randomness relative to a non-uniform measure** — Levin, Dirac measures | the seed is trivially ML-random for the computable measure `δ_seed` | randomness is meaningless until the measure is fixed, and fixing it to uniform is exactly the act that puts the seed in the null set |

## 3. Connections

Six. The first is the identification the rest hang on; the second and third are
the two answers to the vantage's two questions; the sixth is the unlikely
entry and is short.

---

### 3.1 The residual is Kurtz randomness at one countable family of tests, and the seed fails Kurtz randomness at a test about nothing

**The claim.** `..._of_long_black_runs` is not merely *analogous* to a
randomness property: it is literally an instance of the weakest randomness
notion in the standard hierarchy, evaluated at a computable family of tests; and
the exact reason the field cannot deliver it is that every theorem in the field
quantifies over *all* tests, while the seed fails at one trivial test — the
singleton `{seed}` — which is present for every computable point and says
nothing about runs. The field has no notion of "random at these tests but not
those", and that missing notion, not the measure-zero seam, is what closes this
vantage.

**The dictionary.**

| rule 30, this project | effective randomness / Π⁰₁ classes |
|---|---|
| the space of configurations `ℤ → Bool` | Cantor space `2^ω` |
| the uniform Bernoulli(1/2) measure, which rule 30 preserves because it is surjective | Lebesgue measure `λ` on `2^ω` |
| rule 30 itself | a computable, `λ`-preserving transformation |
| the single black seed | the point `x ∈ 2^ω` — computable, and that is the whole difficulty |
| the centre column `centerColumn` | the **trace** of `x`: its itinerary under the partition "origin cell white / black" |
| "the black runs are bounded by `L` from some point on" | `x` lies in (a shift of) the SFT `S_L = {y : 1^L` does not occur in `y}` |
| `S_L` as an object | a **Π⁰₁ class** — paths through a computable tree — with `λ(S_L) = 0` |
| **the residual**: black runs of every length occur | **`x` avoids every `S_L`**: a Kurtz test family |
| Wolfram's "will the column contain any given sequence of length `k`?" | `x` avoids every *proper* SFT — i.e. `x` is **disjunctive**. Strictly stronger than the residual |
| **P1** | the trace has at least `n+1` factors of each length (Morse–Hedlund). Strictly weaker than disjunctive |
| the hypothesis "`x` is Kurtz random" | avoid **every** Π⁰₁ null class |
| **seam 1, and it is the whole finding** | for computable `x`, the set of paths through the tree of prefixes of `x` is `{x}`: a Π⁰₁ class of measure zero. So `x` fails Kurtz randomness at a test that mentions no word, no run, and no statistic |
| **seam 2** | Kurtz randomness does not imply normality — "each weakly 1-generic set is Kurtz random, so for instance the law of large numbers can fail badly" (fetched). So the field's two roads to the residual are **incomparable**, and shutting one does not shut the other |
| **seam 3** | Kurtz randomness is not equivalent to anything finitary, so there is no way to ask for it "at the `S_L` only"; every theorem in the literature quantifies over all Π⁰₁ null classes |

**What it leans on.**

- Kurtz randomness, definition, fetched from *Higher Kurtz randomness*,
  <https://arxiv.org/html/1408.2896>: *"A real x is Kurtz random if avoids each
  Π10 null class."* And, from the same page, the weakness: *"This is quite a
  weak notion of randomness: each weakly 1-generic set is Kurtz random, so for
  instance the law of large numbers can fail badly."*
- Wolfram's block question, fetched from
  <https://writings.stephenwolfram.com/2019/10/announcing-the-rule-30-prizes/>:
  *"One can also ask the more basic question of whether all the blocks even ever
  occur—or, in other words, whether if one goes far enough, the center column of
  rule 30 will contain any given sequence of length k."* And: *"For example, at
  least up to k = 22, all 2^k sequences do occur—and here's how many steps it
  takes."*
- That `S_L` is a Π⁰₁ class of measure zero, and that `{x}` is one for computable
  `x`, are **my own two-line derivations from the fetched definition**, not
  citations, and a captain should read them as such. `S_L` is the set of
  infinite paths through the tree of words avoiding `1^L`, which is a computable
  (indeed finite-type) tree; `{x}` is the set of paths through the tree of
  prefixes of `x`, computable because `x` is. Both have measure zero because a
  fair coin produces `1^L` somewhere almost surely, and because a singleton is
  null.
- Morse–Hedlund is held in the project's own sources, quoted in
  `sources/kopra-2022-natural-class.txt` as Kopra's Theorem 4.1: *"If x ∈ Σ^N is
  not eventually periodic, then at least n + 1 distinct words of length n occur
  in x for each n ∈ Z+."*

**The test.** Ran: `explorer/waywiser_gamblers.mjs`, over the 10⁷-term centre
column the board already holds, with the file guarded against the A051023
prefix (41/41) before anything was measured. The `S_L` tests are the "cap-`L`
gambler" — bet the whole capital on white after `L` consecutive blacks — and a
gambler goes bankrupt exactly when the column leaves `S_{L+1}`:

```
   L | rule 30      | 8 coin draws: min .. max      | outcome
  10 |         6541 |          309 ..        14210  | rule30 broke, coins alive 0/8
  15 |        22726 |         6249 ..       228732  | rule30 broke, coins alive 0/8
  20 |        37279 |       413029 ..      3516300  | rule30 broke, coins alive 0/8
  22 |      1174534 |      1147481 ..        ALIVE  | rule30 broke, coins alive 3/8
  23 |        ALIVE |      2598114 ..        ALIVE  | rule30 ALIVE, coins alive 4/8
```

So **every instance of the residual up to `L = 23` is true and checked, and
`L = 24` is not reached at 10⁷ rows** (the cap-`L` gambler dies on the first run
of length `L+1`, so its bankruptcy at `L = 22` is the run of 23); longest black
run 23 beginning at `t = 1,174,512`, longest
white run 22 at `t = 5,241,994`, against eight coin draws whose longest black
runs are `21 22 22 23 25 26 27 28` and a coin's `log₂ 10⁷ = 23.25`. The
instrument is not blind: on a control built to have bounded runs (the column
with every black run truncated at 8) the cap-8 gambler never goes bankrupt and
banks 19,567 doublings, where on the real column it dies at `t = 1061`.

The falsifiable statement a theorist should try, in the project's vocabulary:
*exhibit `L` and `N` such that `centerColumn` has no `L` consecutive black
values after `N`* — the negation of the residual. Each single instance
"`centerColumn` contains a black run of length `L`" is `Σ⁰₁` and therefore
**decidable by computation**, which P1 itself is not; the board can close them
one at a time for ever and never reach P1, and that gap is exactly the point.

**What it would give.** Nothing toward a proof. What it gives is a fence with a
reason in it: it says precisely which theorem shape could ever help — one whose
hypothesis is randomness *at a restricted class of tests* — and it says where
the only such class with a theory attached lives, which is §3.3.

---

### 3.2 The hierarchy is sealed against computable points, and Gács–Hoyrup–Rojas proved the seal is a theorem rather than an oversight

**The claim.** There is no theorem of the form the vantage asks for — "a
computable point whose orbit satisfies such-and-such an effective condition has
unbounded runs in its trace" — and in the effective Birkhoff family there
cannot be one, because the randomness hypothesis has been shown *equivalent* to
the conclusion: weakening it weakens the conclusion by exactly as much. One
two-line construction kills all four standard notions for every computable
point simultaneously, so there is no ladder to climb down.

**The dictionary.**

| rule 30 | the effective-randomness ladder |
|---|---|
| the seed | a computable point `x` |
| "the orbit of the seed visits `[1^k]`" | Birkhoff / Poincaré recurrence at `x` for the cylinder `[1^k]` |
| the classical theorem: almost every configuration has unbounded runs in its centre column | Birkhoff's ergodic theorem, `λ`-a.e. |
| the project's standing complaint: *almost every is not this one* | the measure-zero seam |
| the field's answer to that complaint: theorems about individual points | Martin-Löf → computable → Schnorr → Kurtz randomness, in decreasing strength |
| **the hypothesis each one needs** | `x` random in that sense |
| **seam 1 — one construction, four deaths.** `d(w) = 2^{\|w\|}` if `w` is a prefix of `x`, else `0` | a computable martingale, succeeding on `x`, at the explicitly computable rate `2^n`. Kills ML, computable **and** Schnorr randomness. And `{x}` is a Π⁰₁ null class, which kills Kurtz |
| **seam 2 — the seal.** Gács–Hoyrup–Rojas: *Schnorr random ⟺ typical for every mixing computable dynamics* | the hypothesis is **necessary**. A point that is typical for all such systems *is* Schnorr random, so no weaker hypothesis delivers typicality for all of them |
| effective Birkhoff for ML-randoms and effectively closed sets (Franklin–Greenberg–Miller–Ng; Bienvenu–Day–Hoyrup–Mezhirov–Shen) | strengthenings of the conclusion, never weakenings of the hypothesis |
| Kučera's theorem: a ML-random's tail escapes any effectively open set of measure `< 1` | the one theorem shaped like "a word must occur" — and its hypothesis is the strongest notion of all, and the set "some black run of length `L` occurs in the tail" is effectively **open of measure 1**, so it points the wrong way too |
| P3 (computational irreducibility) | the question of the *cost* of computing the column, which this ladder does not measure at all (§3.6) |

**What it leans on.** All fetched.

- Gács, Hoyrup and Rojas, *Randomness on Computable Probability Spaces — A
  Dynamical Point of View*, arXiv:0902.1939 (Theory of Computing Systems 48
  (2011) 465–485), <https://arxiv.org/abs/0902.1939>. From the abstract,
  verbatim: *"a point is Schnorr random if and only if it is typical for every
  mixing computable dynamics"*.
- *"Every random sequence is not computable"* and *"No random sequence is
  decidable, computably enumerable, or co-computably-enumerable"*, fetched from
  <https://en.wikipedia.org/wiki/Algorithmically_random_sequence>, together
  with the martingale characterisation used above: *"A sequence is Martin-Löf
  random if and only if no constructive martingale succeeds on it."*
- Kurtz randomness as quoted in §3.1, <https://arxiv.org/html/1408.2896>.
- Kučera's theorem, fetched from the abstract of Bienvenu, Day, Hoyrup,
  Mezhirov and Shen, *A constructive version of Birkhoff's ergodic theorem for
  Martin-Löf random points*, <https://arxiv.org/abs/1007.5249>: *"A theorem of
  Kučera states that given a Martin-Löf random infinite binary sequence ω and an
  effectively open set A of measure less than 1, some tail of ω is not in A."*
- Surjectivity of rule 30, hence invariance of the uniform measure, is the
  board's own (`rule30_leftPermutive`, and
  `sources/schule-stoop-2012-topological-classification.txt`).
- **The four-notions-one-construction paragraph is my derivation, not a
  citation.** It is two lines and a theorist should check it rather than take
  it: the martingale is computable because `x` is, it doubles at every step and
  so succeeds at a rate that is itself computable — which is what Schnorr
  randomness, unlike ML-randomness, additionally requires of a successful
  martingale — and the Π⁰₁ singleton disposes of Kurtz.

**The test.** The claim is a non-existence claim and the honest test of it is
the search, which is recorded rather than asserted. I searched, and fetched
where a page parsed, on: Kurtz randomness and Π⁰₁ null classes; the implication
diagram of the four notions; effective Birkhoff and its converses; Schnorr
randomness characterisations; and "theorem computable sequence effective
condition implies unbounded runs / disjunctive / every word occurs". **Three
PDFs relevant to this section would not parse and I could not quote them:**
Downey–Hirschfeldt's *Computability and Randomness* survey
(<https://math.uchicago.edu/~drh/Papers/Papers/comprand.pdf>), Downey–Hirschfeldt
*Key developments in algorithmic randomness* (<https://arxiv.org/pdf/2004.02851>),
and Franklin–Greenberg–Miller–Ng's Birkhoff paper
(<https://personal.ntu.edu.sg/kmng/Files/Papers/birkhoff.pdf>) — all three
returned undecodable binary. So the implication diagram between the four
notions, as I use it, is **UNVERIFIED as a citation**; nothing in §3.2 depends
on it, because the one construction kills all four independently. A theorist
who wants the diagram in print should open Downey–Hirschfeldt's book.

The falsifiable form: *exhibit a published theorem whose hypothesis is
satisfiable by a computable point and whose conclusion is that a specific word
occurs in that point's trace.* I claim the only ones are normality-flavoured,
and normality is §3.3.

**What it would give.** It closes the probabilistic shelf with a reason rather
than with a shrug. The board's standing formula for the seam — "a theorem holds
for almost every configuration and the seed is one point of measure zero" — is
now sharpened: the field that was invented to remove the "almost every" removes
it by adding a hypothesis that is provably equivalent to the conclusion, and
the seed fails that hypothesis for a reason (computability) that is the very
thing that makes it interesting.

---

### 3.3 Schnorr–Stimm: the one rung a computable point can stand on is normality, and normality is Prize 2 at block length 1

**The claim.** The entire effective-randomness ladder collapses, for rule 30, to
exactly one rung — finite-state randomness, which is Borel normality — and on
that rung the residual is a countable fragment (the cap-`L` gamblers of §3.1)
of the full requirement; but normality's block-length-1 case is exactly Prize 2
and normality implies the residual and hence Prize 1, so the only hypothesis in
this field that a computable sequence can even satisfy is strictly stronger than
the conjunction of two of the three prizes.

**The dictionary.**

| rule 30, this project | finite-state randomness |
|---|---|
| the centre column | the sequence `X ∈ {0,1}^ω` being bet on |
| an adversary that can afford to run the automaton | a gambler with `Θ(t)` work per bit and `Θ(t)` space — it ignores its input and computes the column. **Every such gambler wins outright**, which is why the threshold is a resource threshold |
| a constant-memory adversary | a **finite-state gambler**; it wins when `limsup` capital `= +∞` |
| **the cap-`L` gambler**: bet everything on white after `L` blacks | the simplest infinite family of finite-state gamblers. It never loses a bet it does not have to take, and it wins iff black runs are bounded by `L` |
| **the residual** | *every* cap-`L` gambler goes bankrupt |
| **normality** | *no* finite-state gambler wins at all (Schnorr–Stimm) |
| **P2** (density of black tends to `1/2`) | normality at block length **1** |
| `dim_FS(X) = 1` | normality again, quantified (Dai–Lathrop–Lutz–Mayordomo) |
| a partial bound `dim_FS(X) ≥ 1 − ε` | gives black runs longer than some `L(ε)`, because the SFT `S_L` has entropy `< 1` — **but never unbounded runs**, since only `dim_FS = 1` excludes every `S_L` |
| **seam 1** | normality ⟹ residual ⟹ P1, and normality ⟹ P2. The one usable hypothesis implies two prizes, so it is strictly harder than either |
| **seam 2** | the normality → residual implication is *definitional*, not a theorem: "every word appears with the same frequency" contains "every word appears". The field supplies no machinery here, only a word |
| **seam 3** | normality is incomparable with Kurtz randomness (§3.1 seam 2): Champernowne is normal and computable, hence not Kurtz random; a weakly 1-generic point is Kurtz random and not normal. So the two roads are genuinely two, and both are shut |
| a weakening that does decouple the prizes | `α`-normality for a Bernoulli(`q`), `q ≠ 1/2` — still implies the residual, no longer implies P2. **And no theorem in print produces it either**, so it buys a decoupling and nothing else |

**What it leans on.** All fetched.

- Schnorr–Stimm, in the classical deterministic form, quoted from *The Agafonov
  and Schnorr–Stimm theorems for probabilistic automata*, arXiv:2502.12307
  (I did not record the authors from the page),
  <https://arxiv.org/html/2502.12307v1>, which states
  it as its Theorem 2: *"For X∈A^ω, the following are equivalent: (1) X is
  normal. (2) Any automaton 𝒜 betting on X according to model II does not
  win."* Winning is defined there as *"lim sup(n→+∞) Capital(𝒢, X[0..n]) =
  +∞"*. The definition of normal, from the same paper's abstract
  (<https://arxiv.org/abs/2502.12307>): *"For a fixed alphabet A, an infinite
  sequence X is said to be normal if every word w over A appears in X with the
  same frequency as any other word of the same length."*
- Finite-state dimension, fetched from *A Markov-Chain Characterization of
  Finite-State Dimension and a Generalization of Agafonov's Theorem*,
  <https://arxiv.org/html/2510.18736>: *"Normal sequences are precisely those
  sequences having finite-state dimension equal to 1, that is, the maximal
  possible finite-state dimension."*
- Normality is compatible with computability:
  <https://en.wikipedia.org/wiki/Normal_number>, verbatim: *"Champernowne's
  constant 0.1234567891011121314151617181920212223242526272829..., obtained by
  concatenating the decimal representations of the natural numbers in order, is
  normal in base 10."*
- That the centre column's normality is the open guess, not a theorem:
  <https://writings.stephenwolfram.com/2019/10/announcing-the-rule-30-prizes/>,
  verbatim: *"It's a reasonable guess that actually the digits of π (as well as
  the center column of rule 30) are 'normal', in the sense that not only every
  individual digit, but also every block of digits of any given length in the
  limit occur with equal frequency."*

**The test.** Ran, with a null and a calibration:
`explorer/waywiser_gamblers.mjs` and `explorer/waywiser_ktnull.mjs`. The
order-`k` Krichevsky–Trofimov gambler is the universal finite-state gambler of
memory `k`; positive and growing log-capital is a Schnorr–Stimm win, i.e. a
failure of normality at block length `k+1`. Over 10⁷ terms:

```
k=4: rule 30 log2 capital -150.8; 12 coin draws -154.0 .. -146.9, median -150.7; coins at or below rule 30: 6/12
k=8: rule 30 log2 capital -1873.3; 12 coin draws -1869.5 .. -1821.9, median -1851.3; coins at or below rule 30: 0/12
```

and the calibration, which is the part that matters, because a negative reading
is worth exactly what the instrument's range is worth:

```
   k | capped-at-8  | rule 30      | KT model cost ~ (2^k/2)*log2(N)
   8 |      17689.8 |      -1873.3 | 2.98e+3
  10 |      13224.0 |      -6349.3 | 1.19e+4
  12 |      -1757.8 |     -21406.2 | 4.76e+4
```

The capped-at-8 control has bounded black runs and so is maximally non-normal;
the gambler sees it at `k ≤ 10` and **stops seeing it at `k = 12`**, where the
model's own parameter cost swamps the signal. So **the instrument is informative
only to `k ≈ 10`, and any reading above that is a fact about the instrument**.
Within its range, no finite-state gambler wins on the centre column and it sits
where a coin sits. At `k = 8` rule 30 is below all twelve coin draws, by 3.8
bits in 1873 — 0.2 %, in the direction of being *harder* to predict, and the
likeliest cause is the null generator rather than the seed (§4).

The falsification for a theorist: *the centre column is normal* — which nobody
can prove, which is the point; the checkable consequence is that some cap-`L`
gambler survives for ever, i.e. the residual is false.

**What it would give.** It prices the vantage exactly. If the board ever wanted
this route it would have to prove normality, which gives P1 and P2 together;
so the route is not a partial attack on P1 but a total attack on two prizes at
once, and should be recognised as such before anyone spends on it.

---

### 3.4 The construction line: every proof of normality in print builds the digits, and the one that uses a dynamical orbit uses a linear one

**The claim.** Normality of an explicit computable sequence has been *proved*
only three ways — concatenation (Champernowne), concatenation along a set of
positive density (Copeland–Erdős), and, once, from the equidistribution of the
orbit of a point under an explicit algebraic map (Bailey–Crandall's Stoneham
constants, via the "hot spot" lemma) — and rule 30 is in none of the three
shapes, the third failing at exactly the seam Chorobates named for
Gilbreath: linearity.

**The dictionary.**

| rule 30 | the Stoneham / hot-spot proof |
|---|---|
| the centre column | the base-`b` digits of `α_{b,c} = Σ_k 1/(b^{c^k} c^k)` |
| the row map `r ↦ 4r XOR (2r OR r)` as the generator of the sequence | the map `x ↦ b·x mod 1` generating the digit stream |
| the seed, one point | the point `0`, one point — **the same posture: an individual orbit, not an almost-every statement** |
| "the digits are the trace of an orbit" | exactly what the hot-spot lemma is about |
| the conclusion wanted: every word occurs | the conclusion proved: the constant is `b`-normal |
| **seam 1, and it is fatal** | `x ↦ bx mod 1` is an algebraic endomorphism of the circle; the orbit of `0` under it with rational shifts has a closed form via modular exponentiation, and the proof is a counting argument on that form. Rule 30's row map has no closed form and the board has priced its nonlinearity (crystal 71, degree `2t − 1`) |
| **seam 2** | the same authors proved `α_{2,3}` is **not** `6`-normal, so even that method delivers normality only in the base matched to the map's own arithmetic. There is no base matched to rule 30 |
| Champernowne / Copeland–Erdős | digits laid down by concatenating an enumerated family, so every word occurs *because it was written down*. Rule 30 writes nothing down |

**What it leans on.**

- Champernowne, fetched, quoted in §3.3.
- Bailey–Crandall, fetched from <https://en.wikipedia.org/wiki/Stoneham_number>:
  *"For coprime numbers b, c > 1, the Stoneham number αb,c is defined as α b , c
  = ∑ k = 1 ∞ 1 b c k c k"*, and *"In 2002, Bailey & Crandall showed that
  coprimality of b, c > 1 is sufficient for b-normality of αb,c."*
- **UNVERIFIED, and it is the one thing in this connection I could not
  extract:** the statement of the hot-spot lemma itself and its ergodic-theory
  proof, i.e. that the normality is obtained from equidistribution of an orbit
  of `x ↦ bx mod 1`. Bailey and Misiurewicz's *A Strong Hot Spot Theorem* (Proc.
  AMS, 2006) at <https://www.osti.gov/servlets/purl/886604> returned undecodable
  binary, as did <https://www.davidhbailey.com/dhbpapers/nonnormality.pdf>, and
  arXiv:1212.3449's abstract does not mention the method. My search was *"Bailey
  Borwein hot spot lemma normality Stoneham constant proved 2-normal orbit of
  dynamical map 2x mod 1"*; the summary returned named the lemma and attributed
  it to ergodic theory, but a summary is not a quote. The non-`6`-normality of
  `α_{2,3}` is from the same summary and is likewise **UNVERIFIED**. What is
  fetched is that the constants are proved `b`-normal; that the proof runs
  through a dynamical orbit is the part a captain should check if this
  connection is ever revisited, and it is a ten-minute job for whoever can open
  a PDF.

**The test.** The falsifiable statement, in the project's vocabulary: *exhibit a
map `φ` on a group and an injection of rule 30's packed-row orbit `rowNat` into
an orbit of `φ` such that `centerColumn t` is a digit of `φ^t(z)`.* The board
has looked at the nearest thing — the T-function reading of `rowStep`,
obstruction 17 — and its own verdict is that every regularity found there
reduces to the left-diagonal doubling positions, which is the opposite of an
algebraic closed form. I did not re-run it.

**What it would give.** If a nonlinear hot-spot lemma existed it would give
normality, hence P1 and P2. What would remain is everything, because the
existing lemma's whole content is the closed form.

---

### 3.5 Kopra's correspondence puts the residual in the one field that does have theorems about individual computable orbits — and that field's state of the art is two theorems weaker than the residual

**The claim.** The project's one genuine outside connection already lands in the
field this vantage was looking for: by Kopra, the centre column is the trace of
an orbit of a fractional-multiplication automaton, and the distribution of
fractional parts of `(p/q)^n` is the one subject where statements about a
*single, computable* orbit are theorems rather than almost-everywhere
statements. It is therefore the sharpest available measure of what this vantage
can hope for — and the answer is brutal: in that subject, after fifty-eight
years, the two theorems known about an individual orbit are "no value repeats
infinitely often" and "there are infinitely many limit points", both strictly
weaker than the residual, and Mahler's Z-number question — whether some orbit
avoids half the circle for ever — is still open.

**The dictionary.**

| rule 30 | fractional parts of `(p/q)^n`, via Kopra |
|---|---|
| rule 30 as a map on configurations | the CA `Π_{p/q, pq}` implementing multiplication by `p/q` in base `pq` |
| a configuration white far to the left | a non-negative real `ξ` |
| the centre column | the trace `Tr(x)`; the column corresponds to the fractional part |
| left expansivity of rule 30 | the growth of the multiplier `p/q > 1` |
| both are in Kopra's class | *"rapidly left expansive"* — and Kopra says explicitly that the class contains rule 30 |
| P1 | Kopra's Theorem 3.5: the width-`w` trace is not eventually periodic — **already proved, for both** |
| **the residual**: every run occurs | "the orbit's fractional parts are dense / every digit block occurs" — **open for every single `ξ`, in both** |
| what the field *does* prove about one orbit (Kopra 4.5) | `frac(F^t(x)) = frac(x)` for only finitely many `t`: no value recurs infinitely often |
| what the field *does* prove about one orbit (Kopra 4.6, after Vijayaraghavan) | the fractional parts have infinitely many limit points |
| **seam 1** | both are strictly weaker than the residual: infinitely many limit points does not put any *specific* word in the trace |
| **seam 2** | the classical proofs on the real side (Dubickas, Vijayaraghavan) are Diophantine — they use that `p/q` is a rational and that `p, q` are coprime. Rule 30 has no multiplier and no coprimality to spend |
| **seam 3, and it is the honest measure of the vantage** | Mahler asked in 1968 whether some `ξ` keeps `frac((3/2)^n ξ) < 1/2` for ever. It is open. That is a *far* weaker question than the residual — one half-space avoided, versus every word occurring — and the field cannot answer it for a single orbit |

**What it leans on.** The project's own held source,
`sources/kopra-2022-natural-class.txt`, which `docs/sources.md` indexes.
Verbatim, at line 26–35: *"Distribution of fractional parts (i.e. distribution
modulo 1) of sequences of the form ((p/q)^i ξ) … For example, in the case p/q =
3/2, it is not known whether ξ > 0 can be chosen so that fractional parts in the
whole sequence remain less than 1/2 [11]. … multiplication by a fraction p/q in
base pq can be implemented by a cellular automaton [8]"*. At lines 40–43: *"the
results saying that any fractional part repeats in the sequence ((p/q)^i ξ) only
finitely many times [4] and that the fractional parts of this sequence have
infinitely many limit points [13]"*. Theorem 4.5, verbatim: *"If F : Σ^Z → Σ^Z is
rapidly left expansive and x ∈ N(Σ), then frac(F^t(x)) = frac(x) for finitely
many t ∈ N."* And that the class contains rule 30, lines 52–54: *"It is notable
that this class includes Wolfram's Rule 30, a cellular automaton which is
notoriously resistant to proofs of nontrivial results"*.

**The test.** The falsifiable statement, which is bibliographic and cheap:
*there is, for some single explicit `ξ` and some `p/q > 1`, a theorem that the
sequence `frac((p/q)^n ξ)` is dense in `[0,1]`, or that its base-`pq` digit
stream contains every word.* I claim there is none; Kopra's own framing — that
his starting points are "finitely many repeats" and "infinitely many limit
points" — is the evidence, since a denser result would have been the natural
starting point instead.

**What it would give.** Nothing directly, and it is the most useful "nothing" in
the document, because it is a *calibration*. The board has repeatedly hoped that
some outside field has machinery for individual orbits. This is that field, it
is already connected to this project by its own best outside result, and its
individual-orbit theorems stop two rungs below what P1's residual needs. A
future connector who proposes to look for individual-orbit machinery should be
shown this row first.

---

### 3.6 The unlikely entry: derandomization is the one place where computable objects are proved random, and it fails here by nonuniformity — the measure-zero seam in complexity clothing

**The claim.** There is exactly one mature subject in which a *computable*
object is proved to be random-looking — the hardness-versus-randomness line,
Blum–Micali–Yao and Nisan–Wigderson — and it cannot see rule 30's centre column
at all, for a reason that is the exact complexity-theoretic translation of the
seam every probabilistic route on this board has died at: a single fixed
sequence is never pseudorandom, because the distinguisher is allowed to
hard-code it. And that translation locates P3: **P3 is the question of where the
centre column sits on the resource-bounded randomness ladder, and the effective
randomness ladder of §3.2 does not measure that coordinate at all.**

**The dictionary.**

| rule 30 | pseudorandomness |
|---|---|
| the centre column's first `t` bits | a generator's output |
| the automaton that produces them | the generator: `Θ(t)` work per bit, `Θ(t)` space, by the cone |
| the cap-`L` gambler (§3.1) | a constant-size distinguisher |
| the residual | "the column fools every cap-`L` distinguisher" |
| **normality** | "the column fools every constant-space distinguisher" |
| hardness ⟹ pseudorandomness (NW, BMY) | the field's one theorem shape that concludes randomness of a computable object |
| **seam 1** | those theorems need a *family* with a varying seed and average-case hardness. Rule 30 has **one** seed, and a nonuniform distinguisher with the sequence as advice separates it from random trivially. A single sequence is never pseudorandom |
| **seam 2** | P3 is a worst-case irreducibility statement; pseudorandomness needs average-case hardness, and the gap between them is the classical hardness-amplification problem, unsolved in general |
| **what the translation does buy** | the ladder that matters for rule 30 is indexed by *resources*, not by Π⁰₁ classes: every gambler that can afford `Θ(t)` work per bit wins outright by ignoring its input and running the automaton, and the question of whether a cheaper one can is P3 |

**What it leans on.** **UNVERIFIED.** I did not fetch Nisan–Wigderson,
Blum–Micali or Yao; this connection is a translation of textbook content and is
included because the vantage asked me to name the unlikely field and because
the nonuniformity seam is worth having in one sentence. Nothing elsewhere in
the document depends on it. A captain who wants it cited should ask for the
Nisan–Wigderson *Hardness vs Randomness* paper.

**The test.** The statement a theorist could attack: *the centre column fools
some class `C` of distinguishers that provably contains the cap-`L` tests.* I
claim no such statement is available, because "fools the cap-`L` test" for a
fixed `L` is the residual's `L`-th instance verbatim, so any such theorem would
have to prove the residual first.

**What it would give.** A vocabulary in which P1, P2 and P3 are three
coordinates of one object: P2 is normality at block length 1, P1 follows from
normality, and P3 asks how expensive a gambler must be. That is a reading, not a
result, and §5 hands it over as a reading.

## 4. Died in translation

Sixteen. The first four are mine from this session; the first is the one a next
connector is most likely to repeat, because it looked like a finding for an
hour.

- **"Rule 30 produces its long black runs far too early — a run of 21 by
  `t ≈ 37,260` where eight coin draws needed 413,029 to 3,516,300."** Mine, off
  the first table. Dies against a proper null. Scored against the coin's own
  law (the first run of length `L` arrives at an approximately exponential time
  of mean `2^{L+1}`), rule 30's most extreme black-run arrival is `L = 21`,
  early, two-sided `p = 0.00885`; running **the whole procedure**, including the
  maximisation over `L = 4 … 26`, on 300 coin draws puts **71 of 300 at least as
  extreme** (`explorer/waywiser_runtimes.mjs`). White runs: `p = 0.030` at
  `L = 19`, and 164 of 300. The seam is the one the board keeps meeting: a
  minimum over 23 correlated statistics is not a `p`-value, and eight draws
  cannot tell a finding from a maximisation.
- **"The order-12 and order-16 gamblers losing badly on the centre column is
  evidence of normality at block length 12 and 16."** Mine, and false: the
  capped-at-8 control, which has bounded runs and is maximally non-normal, also
  reads `−1757.8` at `k = 12` and `−49,391.6` at `k = 14`. The
  Krichevsky–Trofimov model pays about `(2^k/2)·log₂ N` bits for its own
  parameters and that swamps everything past `k ≈ 10`. A true value with the
  wrong label — the value measures the instrument's range.
- **"Rule 30 sitting below all twelve coin draws at `k = 8` is a finding."**
  3.8 bits out of 1873, 0.2 %, in the direction of being *less* predictable than
  a coin. The likeliest cause is not rule 30: the null is `xorshift32` read 32
  bits per call, which is a linear generator and is itself very slightly
  compressible, which biases the *coins* upward rather than rule 30 downward.
  Reported and not claimed.
- **"Kurtz randomness is weak enough to reach a computable point."** The
  vantage's own hope, and mine for the first half hour, since Kurtz randomness
  is so weak that the law of large numbers can fail under it. Dies in one line:
  `{x}` is a Π⁰₁ class of measure zero for every computable `x`, so no computable
  point is Kurtz random. The weakness of the notion is real and does not help,
  because weakness here means *few* tests are required, not that the trivial
  test is dropped.
- **"Von Mises–Wald–Church stochasticity is a selection-rule notion rather than
  a test-class notion, so it might reach a computable point."** Dies in one
  line: for computable `x`, the place-selection rule "select position `n` iff
  `x(n) = 1`" is computable from the prefix, because the prefix's length is `n`.
  It selects an all-black subsequence. No computable sequence is Church
  stochastic, and the stochasticity branch of the field dies with the
  martingale branch.
- **"Kolmogorov complexity of the prefixes gives runs."** Dies twice, which is
  why it is worth recording. For any computable `x`, `C(x↾n) ≤ log n + O(1)`, so
  the effective Hausdorff dimension of the centre column is **0** — the worst
  possible value, provably, not conjecturally. And even for a sequence with high
  complexity the implication fails: a sequence in the golden-mean shift has no
  `11` at all and complexity rate `log₂ φ = 0.694`, so **no complexity rate
  below 1 forces any run**, and rate 1 is normality again.
- **"Effective Birkhoff with a weakened hypothesis."** Dies at
  Gács–Hoyrup–Rojas: Schnorr randomness is *equivalent* to typicality for every
  mixing computable dynamics, so a weakened hypothesis weakens the conclusion by
  exactly the same amount. This is the one place where the field has proved its
  own hypotheses necessary, and it is what turns "I could not find such a
  theorem" into "there is none of this shape".
- **"Kučera's theorem is shaped like 'a word must occur' and might transfer."**
  Dies twice: its hypothesis is Martin-Löf randomness, the strongest notion of
  all; and the set "a black run of length `L` occurs in the tail" is effectively
  *open* of measure 1, so the theorem, which is about escaping effectively open
  sets of measure `< 1`, points the other way.
- **"Randomness with respect to some other computable measure."** The seed is
  trivially Martin-Löf random for the Dirac measure `δ_seed`, which is
  computable. So the framework says nothing until the measure is fixed, and
  fixing it to uniform is precisely the act that puts the seed in a null set.
  The measure-zero seam is not a defect of the theorems; it is where their
  content lives.
- **"Solomonoff's completeness theorem is a theorem about computable points, so
  it is the theorem shape the vantage wants."** It is a theorem about computable
  points, and it says the opposite: a fixed universal predictor makes only
  finitely much total error on any computable sequence. The field's one
  unconditional statement about the seed is that the seed is *predictable*.
  (Statement as fetched from
  <https://en.wikipedia.org/wiki/Solomonoff%27s_theory_of_inductive_inference>:
  *"The completeness theorem guarantees that the expected cumulative errors made
  by the predictions based on Solomonoff's induction are upper-bounded by the
  Kolmogorov complexity of the (stochastic) data generating process."* The
  precise squared-error form is **UNVERIFIED**; the page does not state it.)
- **"Normality is a cheaper target than P2, because P2 is about frequencies and
  normality is about words."** Backwards. Normality at block length 1 **is** P2.
  Anything that proves normality proves Prize 2 on the way past.
- **"`α`-normality with a biased Bernoulli measure decouples the residual from
  P2 and is therefore a cheaper hypothesis."** Half-true and buys nothing: it
  does decouple them — `α`-normal for Bernoulli(`q`), `q ≠ 1/2`, implies every
  word occurs without implying density `1/2` — but no theorem in print produces
  `α`-normality of an explicitly given sequence either, so the decoupling is a
  bookkeeping observation with no machinery behind it.
- **"Agafonov's theorem — a finite automaton selecting a subsequence of a normal
  sequence selects a normal one — gives the residual from something weaker."**
  Dies on its hypothesis, which is normality. Every theorem at this rung has
  normality on one side of an "if and only if"; the rung is a single point, not
  a ladder.
- **"Disjunctiveness ('every word occurs') has a literature of its own that
  might be weaker than the normality literature."** Dies on inspection of that
  literature: the explicit disjunctive sequences in print are concatenative
  (Champernowne, Copeland–Erdős) or are defined to be disjunctive. Nothing there
  derives disjunctiveness from a dynamical hypothesis.
- **"Positive entropy of the column's subshift, or positive effective dimension,
  gives unbounded runs."** Dies at the golden-mean shift, which has entropy
  `0.694` and no `11`. Recorded again because it is the same death as
  Chorobates's, and because it is the death that recurs in every vocabulary this
  field offers — entropy, dimension, complexity rate — and always at the same
  witness.
- **"The board's measurement that the column looks normal to 10⁷ is evidence
  that a proof of normality is within reach."** It is evidence for the
  statement and none at all for the reachability. Champernowne shows normality
  is consistent with computability; it does not show that any normality proof
  exists for a sequence that is not written down digit by digit, and no such
  proof does exist outside the three shapes of §3.4.

## 5. What to hand the theorist

**The answer to the vantage first, because it is the deliverable, and it is a
negative.** No theorem of the form "a computable point whose orbit satisfies
such-and-such an effective condition has unbounded runs in its trace" exists; I
searched and fetched and found none; and Gács–Hoyrup–Rojas's equivalence shows
that within the effective Birkhoff family there cannot be one, because the
randomness hypothesis there is necessary and no computable point satisfies it.
The weaker notions do not reach the seed either: all four standard notions die
at one two-line construction, and so does Church stochasticity. The one notion a
computable sequence can satisfy is finite-state randomness, which is Borel
normality, and it does imply that every specific word occurs — by definition,
not by a theorem — while implying Prize 2 at block length 1. **The last live
probabilistic route is closed.**

**1. The fence line, and it costs nothing but must be written down.** Add to the
P1 fence, as the outcome of this vantage:

> *The effective-randomness clause is closed. The residual
> `..._of_long_black_runs` is exactly Kurtz randomness evaluated at the
> computable family of Π⁰₁ null classes `S_L = {no black run of length L}`, and
> every computable point fails Kurtz randomness at the trivial class `{x}`, so
> no theorem quantifying over all tests can separate the two failures. The only
> notion in the field a computable sequence can satisfy is finite-state
> randomness, which by Schnorr–Stimm is Borel normality; normality implies the
> residual and hence P1, and normality at block length 1 **is** P2. **So "the
> centre column is normal", and every relative of it — `dim_FS = 1`,
> finite-state incompressibility, `α`-normality — is a correct sufficient
> condition for P1 that must not be seeded, because it is strictly harder than
> the conjunction of two prizes and has no machinery behind it.** Any P1 route
> through "the column is random in sense X" needs X strictly below finite-state,
> and there is nothing below finite-state with theorems in it.*

**This is a fence, not a fifth sufficient condition.** I am naming the
sufficient condition the vantage produces precisely so that it is not seeded;
the fence's content is the "must not", and it is cheap to apply because it is a
one-line test on any future proposal: *does the hypothesis imply the density is
`1/2`? Then it implies P2 and is not a P1 attack.*

**2. The one topic I would spend a theorist's session on, and it is a reading
rather than a transfer.** *Claim to falsify: the three prizes are not
independent, and the dependence is visible in one vocabulary.* Precisely: the
weakest resource-bounded irreducibility statement anyone can state about the
centre column — that it is not compressible by a finite-state compressor,
equivalently `dim_FS = 1`, equivalently normal — **implies both P1 and P2**. The
dictionary row it depends on is §3.3's `dim_FS = 1 ⟺ normal ⟺ no finite-state
gambler wins`, which is fetched and is not in dispute; the work is in deciding
whether the board's own reading of P3 (the 2026-09-11 "make P3 sayable"
sighting) can be positioned relative to it, since a P3 formalised at the
finite-state level would already give two prizes and a P3 formalised at the
polynomial level is refuted outright — the column is computable in `O(t²)` bit
operations, so every polynomial-time gambler wins by simply running the
automaton. **The statement that would settle it** is the location of the board's
intended P3 on that ladder: below finite-state (vacuous), at finite-state
(implies P1 and P2), or above polynomial (false). That is a question about what
the board means, answerable in one session with no new mathematics, and it is
worth answering before another P3 statement is seeded.

**What I would not spend a session on:** anything that begins "the centre column
is random in the sense of …". All four standard senses are refuted for every
computable point by two lines that a theorist can check in ten minutes, and the
fifth sense is two prizes in one.

## 6. Next vantage

**Automatic and morphic sequences read as a *decision procedure* rather than as
a classification — specifically the Walnut/Charlier–Rampersad–Shallit
machinery, aimed not at the centre column but at the objects around it that the
board has already proved are automatic or nearly so.** Crystal 73 excluded
automaticity of the centre column by measurement and Chorobates struck the row
out for that reason, and both were right about the column. But this vantage
showed me what I could not reach from it: every negative in this document is a
negative about *one sequence*, and the board's real assets are the *settled
words*, whose periods are powers of two, whose doubling positions are an
explicit arithmetic sequence, and whose diagonal recurrence is a finite-state
process on pairs of periodic words. That family is exactly the shape Walnut
decides — `k`-automatic, first-order definable with addition — and it is the
one region of this picture where "does this word occur" and "is this eventually
periodic" are *decidable* rather than open. I could not reach it because I spent
the session on the column itself, where the family's decidability does not
apply. The question worth asking from there is not "is the centre column
automatic" — it is not — but **which of the board's proved statements about the
settled region, the diagonal periods and Rowland's `a(n)` are decidable by that
machinery, and whether any of them is currently a wall that a decision procedure
would simply close.** The second thing I could not reach, and it is smaller: the
two PDFs this document had to mark UNVERIFIED — the hot-spot lemma and
Downey–Hirschfeldt's implication diagram — need somebody who can open a PDF,
which a waywiser cannot; a wheel counts turns along the road it was pushed down,
and both of those sit off it.
