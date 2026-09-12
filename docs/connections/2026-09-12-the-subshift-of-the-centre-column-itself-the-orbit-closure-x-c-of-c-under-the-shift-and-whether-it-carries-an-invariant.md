# Sighting: the subshift of the centre column itself

**Vantage.** The orbit closure `X_c` of the centre column `c` under the shift,
and whether it carries an invariant measure anyone can name.

**Connector.** Ephemeris, 2026-09-12. This is my own second session on this
problem; the first is
`docs/connections/2026-09-12-the-theory-of-automatic-sequences-*.md`, whose §6
named this vantage, and Waywiser reached the same gap from effective randomness
in `docs/connections/2026-09-12-effective-and-algorithmic-randomness-*.md`.

**A sighting is not a proof.** Every row below carries an epoch and a range:
which definition of the object, whose convention in the other field, and where
the correspondence drifts. Most of what is here is expected to die, and §4 is
where the deaths are recorded.

**The short answer, because it is a negative with one positive inside it.**
`X_c` is infinite **if and only if** Prize 1 holds — an equivalence, not an
analogy, and kernel-checked below. So *describing* `(X_c, σ)` is not a route to
the wall; it **is** the wall, and every one of the four census rows that asked
for a description was asking for P1 first. What survives the collapse is one
ladder: the statements *"every word of length `k` occurs in `c` infinitely
often"*, which are individually **not** implied by P1, are not implied *by* the
negation of P1 either, are genuinely open from `k = 2` upward, and whose first
rung the board has **already proved**. That ladder is the deliverable, and in
the best-studied analogue — the decimal digits of `π` — even its first rung is
open. **And it is not off to the side of the wall:** its second rung implies the
open half of Prize 1's own `p = 2` instance — *the centre column is not
eventually alternating* — where the board holds the `p = 1` instance
(`centerColumn_not_eventually_constant`, closed) and nothing else.

---

## 1. The problem, seen from outside

Fix the one-sided binary sequence `c ∈ {0,1}^ℕ` defined by: put a single 1 at
the origin of a bi-infinite row of 0s, update every cell in lock-step by
`new = left XOR (centre OR right)`, and let `c(t)` be the cell at the origin
after `t` updates. The sequence is computable in `O(t²)` bit operations, its
first ten million terms have been computed, and every statistic anyone has
measured on it agrees with a fair coin to within a coin's own scatter. What is
unproved is that `c` is not eventually periodic: that there are no `p > 0` and
`N` with `c(n + p) = c(n)` for all `n ≥ N`. Equivalently — and this is the whole
content of the wall this sighting is aimed at — the implication "if `c` repeats
then some other column of the same picture repeats" is, given a proved theorem
that no two columns both repeat, logically *equivalent* to "`c` does not
repeat". So the residual is: **one explicitly given computable binary sequence,
no structure, no family, and the single question of whether it is eventually
periodic.**

**Restated in the vantage's own terms.** Let `σ` be the shift on `{0,1}^ℕ`, let
`X_c = closure {σ^n c : n ≥ 0}` — a subshift — and let
`Ω_c = ⋂_N closure {σ^n c : n ≥ N}` be its ω-limit set, the part of `X_c` that
cannot see any prefix of `c`. The residual is: **`X_c` is infinite.** That is
not an analogy but an equivalence (§3.1): a one-sided sequence is eventually
periodic exactly when its shift orbit is finite, exactly when its factor
complexity is bounded. Prize 2, in the same terms, is: **every weak-\* limit
point `ν` of the empirical measures `(1/N) Σ_{n<N} δ_{σ^n c}` — each of which is
a shift-invariant measure carried by `Ω_c` — gives the cylinder `[1]` mass
exactly `1/2`**; if `Ω_c` happens to be uniquely ergodic with measure `μ`, Prize
2 is exactly `μ([1]) = 1/2`. So the vantage is the right room: both prizes live
in it, stated about one system. What it is not is a *new* room.

**The inventory, and it is empty.** A description may use the board's two proved
run bounds: a black run beginning at time `a ≥ 1` has length `< a`
(`centerColumn_black_run_lt_start`), and a white run beginning at `a ≥ 1` has
length `< 3a` (`centerColumn_white_run_lt_start`). **Both are vacuous at the
level of the subshift.** A bound whose right-hand side grows with the starting
time forbids no word from `Ω_c` at all, because `Ω_c` is a set of limits and
every word is permitted to occur late: `1^L` merely has to start after time `L`.
Kernel demonstration, `explorer/ephemeris2_scratch_occur.lean`: the centre
column has six consecutive black cells from time `62`, and `6 < 62`, so `1^6`
occurs *while the bound holds with a factor of ten to spare*. Measured, the slack
is far larger than that — the longest black run below `10^5` is `21`, beginning
at `a = 37,260`, where the bound permits `37,259`
(`explorer/ephemeris2_subshift.mjs`). So the honest statement of the inventory
is: **nothing whatever is proved about which words occur in `Ω_c`, except that
both letters do.**

**One correction to the brief, and it is the best thing in this document.** The
inventory I was handed — the two run bounds — is **one node short**, and the
missing node is the only one that is not vacuous here:
`centerColumn_window_not_constant` (closed) says both colours occur in every
window `[a, 4a]`, which *does* survive the passage to the limit and gives
`{0,1} ⊆ L(Ω_c)`. It is not a corollary of the run bounds at the level of the
subshift even though it is proved *from* them at the level of the sequence,
because composing two vacuous bounds produced something non-vacuous: each bound
alone says "the run ends", and together they say "and the other colour starts,
within a bounded multiple of the time". That node is rung 1 of the ladder in
§3.3, it is the only non-empty entry in the inventory, and rung 2 is the one
thing this vantage produced that a theorist can attack without proving a prize.

---

## 2. Fields sighted

| Field / theory | The object there that matches something here | The seam, in one line |
|---|---|---|
| Symbolic dynamics, Morse–Hedlund | orbit closure of a point; factor complexity `p(n)` | `P1 ⟺ X_c infinite` is an equivalence, so every property of `X_c` either holds for a finite cycle (vacuous) or implies P1 |
| Ergodic theory of generic points (Oxtoby, Krylov–Bogolyubov) | `c` as a generic point for an invariant measure on `X_c` | invariance is a property of the measure, genericity a property of the point, and nothing carries from one to the other |
| Measure-theoretic CA theory (Hedlund; Kůrka; Kari–Taati) | uniform Bernoulli measure, invariant under any surjective CA; the trace/column process | the measure describes the ensemble; rule 30's seed is one point of it, and crystal 67 is the fence |
| Normal numbers (Borel; Champernowne; Stoneham; Bailey–Crandall) | "every word occurs with frequency `2^-n`" = `X_c` full shift **and** `c` generic | every proof in that field needs the number built to be normal, or built from `b^n` arithmetic; and normality here is two prizes at once (Waywiser's fence) |
| Analytic number theory: Chowla / Sarnak | the Liouville subshift; the square-free flow and its Mirsky measure | the one field that *does* describe a single explicit sequence's orbit closure — by multiplicativity and congruences, neither of which rule 30 has |
| Diophantine approximation: Mahler's `3/2` problem, Flatto–Lagarias–Pollington | the ω-limit set of `{ξ(p/q)^n}` in `[0,1)`, constrained for **every** `ξ` | the only single-orbit limit-set theorem I could fetch; its mechanism is the arithmetic of the multiplier, and `c` has no multiplier |
| Cellular-automaton trace theory (Kopra 2022, Thms 4.6–4.7) | the ω-limit set of `{frac(F^t x)}` — the rows read rightward from the origin | **a proved description of a limit set of rule 30's own seed exists**, in the *space* direction; the wall is in the *time* direction |
| Toeplitz flows, almost 1–1 extensions of odometers (Jacobs–Keane; Downarowicz) | a sequence built by filling arithmetic progressions with periodic patterns | the settled region *is* such a filling (diagonal periods are powers of two); the centre column sits at index 0 of every diagonal, exactly where the filling has not reached (obstruction 1) |
| `B`-free and Mirsky systems | an explicitly described orbit closure with a named zero-entropy measure | needs the sequence defined by congruences; the column's only congruence structure is the settled region, which it misses |
| Topological dynamics of CA: blocking words, equicontinuity (Kůrka) | the trace subshift of a cellular automaton | crystal 73: rule 30 has no blocking word, so the one mechanism bounding a column subshift's complexity *from above* never applies |
| Rigidity of `×2,×3`-invariant measures (Furstenberg; Rudolph; Host) | a measure invariant under two commuting maps, with positive entropy, is Lebesgue | needs the measure handed over in advance **and** a second commuting action; `X_c` carries only `σ` |
| Kneading theory of unimodal maps (Milnor–Thurston) | the itinerary of one explicitly given orbit — the critical orbit — as a theory's central object | the unlikely entry, and instructive: there the instances come from varying the *map* in a continuous family, and rule 30 has no parameter (crystal 66 kills the 256-rule family) |
| Spectral theory / Müllner–Yassawi eigenvalue criterion | the eigenvalues of the Koopman operator of `(X_c, σ)` | the criterion's input is a substitution; there is none here |
| Effective randomness (Waywiser, 2026-09-12) | Kurtz/Schnorr/finite-state randomness of `c` | deliberately not re-sighted: the only notion a computable point can satisfy is normality, which is P1 **and** P2 |
| Sturmian / linearly recurrent / substitutive word combinatorics | low-complexity subshifts with complete descriptions | excluded by measurement to `10^7` rows (crystal 73) before any theory is reached |

---

## 3. Connections

### 3.1 The dichotomy: `X_c` infinite **is** Prize 1, so this vantage is a restatement region

**The claim, as sweeping as I believe it.** Every statement about `(X_c, σ)` is
exactly one of three things — true of a single periodic orbit and therefore
incapable of touching the wall; at least as strong as Prize 1 and therefore
unavailable; or a statement about finitely many *specific* words, which is the
only shape with content and is §3.3. There is nothing else, so **no description
of `X_c` can be a route to P1, because a description of `X_c` is P1**, and the
four census rows that each asked for "*some* description of the dynamical
system" were each asking for the wall as an input.

**The dictionary.**

| This project | `(X_c, σ)` | Checked |
|---|---|---|
| the centre column `c` | a point of `{0,1}^ℕ` | definition |
| P1: `c` not eventually periodic | `X_c` is infinite | equivalence, kernel-checked |
| P1 fails, period `p`, onset `N` | `X_c` is a finite set: one `p`-cycle plus at most `N` transient points; `Ω_c` is exactly the cycle | elementary |
| factor complexity of `c` | `p(n) = #` words of length `n` in `L(X_c)` | Morse–Hedlund: `p(n) ≤ n` for one `n` ⟹ eventually periodic |
| "`c` has unbounded white runs" | `0^∞ ∈ Ω_c` | equivalence; and the board's closed node makes it **sufficient for P1** |
| "`c` has unbounded black runs" | `1^∞ ∈ Ω_c` | `centerColumn_not_isEventuallyPeriodic_of_long_black_runs`, closed |
| "`c` is uniformly recurrent" | `Ω_c` is minimal | a finite cycle is minimal, so minimality is **compatible with P1 failing** |
| the two proved run bounds | nothing at all | §1; the right-hand side grows with the start time |
| "both letters occur infinitely often" | `{0,1} ⊆ L(Ω_c)` | `centerColumn_window_not_constant`, closed — the one non-empty row |
| Prize 2 | every empirical limit measure gives `[1]` mass `1/2` | §3.2 |
| **Seam 1** | `X_c` versus `Ω_c`: an eventually periodic `c` with a transient has a **non-minimal** `X_c`, so every minimality statement must be about `Ω_c` | died in §4 |
| **Seam 2** | the brief's first question — *is `X_c` minimal, or does it contain the all-white point?* — is not symmetric: "contains `0^∞`" and "`Ω_c` is not minimal" each **imply P1**, while "minimal" is satisfied by the periodic case (and `X_c` — as opposed to `Ω_c` — is non-minimal whenever `c` has any transient at all, §4.4). So the question cannot be settled in the cheap direction | — |
| **Seam 3** | a property that fails for *some* finite cycles and holds for others is the one escape from the dichotomy, and it is exactly "which words occur" | §3.3 |

**What it leans on.** The equivalence is elementary and I proved it rather than
cite it: `explorer/ephemeris2_scratch_orbit.lean`,
`orbit_finite_iff_eventually_periodic`, accepted by `lake env lean`, axioms
`[propext, Classical.choice, Quot.sound]` — the shift orbit of any `f : ℕ → Bool`
has finite range iff `f` is eventually periodic (pigeonhole one way, the
`mod p` classification the other). Beside it,
`p_zero_makes_it_trivial` shows the check can fail: drop `0 < p` and the
right-hand side is true of every sequence. For the complexity form, the project
holds Morse–Hedlund as quoted inside a source:

> "Theorem 4.1 (Morse and Hedlund, [12], Theorem 7.4). If `x ∈ Σ^ℕ` is not
> eventually periodic, then at least `n + 1` distinct words of length `n` occur
> in `x` for each `n ∈ Z+`."
> — `sources/kopra-2022-natural-class.txt`, lines 411–413

and the converse direction is on Wikipedia, fetched:

> "For infinite words u, we have p_u(n) bounded if u is ultimately periodic (a
> finite, possibly empty, sequence followed by a finite cycle). Conversely, if
> p_u(n) ≤ n for some n, then u is ultimately periodic."
> — https://en.wikipedia.org/wiki/Morse%E2%80%93Hedlund_theorem

**The test.** One statement, and a theorist can settle it in an hour: *exhibit
any property `P` of subshifts such that `P(X_c)` is provable from what the board
holds, is true, and fails for at least one finite cyclic subshift.* My claim is
that no such `P` exists outside §3.3's ladder. Falsifying it kills this
paragraph and opens the vantage.

**What it would give.** Nothing towards the wall, and that is the result: it
prices four census rows at once (frequency criteria, the morphic-eigenvalue
criterion, Müllner–Yassawi, the orbit-property method) at **at least P1**, and it
tells a captain that a future proposal whose value is "it describes the subshift"
is a proposal to prove the prize. **Band: Nothing** — the theorem mentions no
automaton and is true of every `ℕ → Bool`. That is precisely why it is the first
connection: the vantage's central object is definitionally the wall.

---

### 3.2 The measure side is the only non-vacuous side, and the measure is already named

**The claim.** The invariant measure the vantage asks for exists, is named, and
is `Bernoulli(1/2)`: the uniform measure on configurations pushes forward under
the column map to the fair-coin measure on `{0,1}^ℕ`, *exactly*, with no
approximation. Three consequences, and the third is the one worth a captain's
time. The board's repeatedly-measured "indistinguishable from a coin" is
therefore a **theorem**, not a run of lucky measurements. Prize 2 is exactly the
statement that `c` is a generic point for that named measure, i.e. normality at
block length 1, which is Waywiser's fence. And — the part nobody has said —
**on the language side the conjectural truth is that there are no constraints at
all**, so every method that works by constraining the language of `Ω_c` is
hunting an object that does not exist.

**The dictionary.**

| This project | Measure-theoretic CA | Checked |
|---|---|---|
| a random row, each cell a fair coin | the uniform Bernoulli measure `λ` on `{0,1}^ℤ` | invariant, because rule 30 is surjective |
| the centre column of a `λ`-random configuration | an i.i.d. fair-coin sequence | crystal 67's `centerColumn_trace_uniform`, the finite form: for each word `v` of length `n+1`, exactly `2^n` of the `2^{2n+1}` windows of width `2n+1` produce it |
| left permutivity at radius `t` | the map (cells `0, -1, …, -n`) → (column word) is triangular over `F₂` with unit diagonal | crystal 40, `window_count_half` at one time |
| `window_count_half` | the `n = 0` marginal of the above | closed node |
| the seed | one point of a full-measure set | crystal 67's ensemble fence: reject any argument whose only use of the seed is that it is such a point |
| Prize 2 | `c` is generic for `λ`'s column push-forward at block length 1 | Waywiser's §5 fence: this is normality, which implies P1 too |
| "`Ω_c` = full shift, `c` generic" | `c` is Borel normal | strictly harder than P1 ∧ P2 |
| **Seam 1** | the push-forward says what a *typical* column does and the wall is about *one* column; the two are separated by exactly the genericity of one point, which no measure statement supplies | crystal 67 |
| **Seam 2** | eventually periodic sequences are dense in the support of the push-forward, so no support or positivity argument separates them | crystal 67 |
| **Seam 3** | the push-forward is the *same* for every member of the `X_b` family, which is why obstruction 20's three deaths happened: they were measuring the measure, not the seed | new reading |

**What it leans on.** Invariance of the uniform measure under a surjective CA,
from a source the project holds:

> "Another equivalent condition states that the uniform Bernoulli measure is
> invariant for F. In this form, Theorem 12 has been generalized to CA on mixing
> SFT (see Theorem 2B.1 in Pivato [38])."
> — `sources/kurka-topological-dynamics-1d-ca.txt`, lines 458–461

Rule 30's surjectivity is `sources/schule-stoop-2012-topological-classification.txt`
Prop. 15 and the board's own crystals 3/6. The column statement itself is
crystal 67, Parallax 2026-09-09, kernel-checked there at `n = 1, 2, 3`
(`explorer/parallax3_scratch_trace.lean`); **it has still not been seeded** — it
is in neither `blueprint/dag.json` nor `Rule30/Statements.lean` as of this
session, which is worth saying because crystal 67 recommends it and the
recommendation has been sitting for three days.

**The test, and I ran it.** If the language of `Ω_c` really is unconstrained, the
number of words of length `k` *missing* from a tail of `c` must match a fair
coin's coupon-collector prediction, not merely be large. Measured over the tail
`[1.5·10^5, 3·10^5)` (`explorer/ephemeris2_subshift.mjs`), missing words against
the prediction `2^k e^{-M/2^k}` and against an xorshift32 control of the same
length:

| `k` | 14 | 15 | 16 | 17 | 18 | 20 | 22 |
|---|---|---|---|---|---|---|---|
| seed missing | 0 | 350 | 6,799 | 41,909 | 148,099 | 908,897 | 4,047,022 |
| coin missing | 1 | 334 | 6,611 | 41,843 | 148,164 | 908,942 | 4,047,033 |
| predicted | 1.7 | 337.0 | 6,646 | 41,740 | 147,932 | 908,828 | 4,046,975 |

Every word of length `≤ 14` occurs in a tail of length `1.5·10^5`; from `k = 15`
the deficit tracks the coin to within `3%` and the prediction to within `2%`.
**So there is no evidence of a single forbidden word, at any length the data can
reach.** The falsifier is sharp: a word absent from a long tail but present
earlier would break this connection and would be the first language constraint
anyone has found.

**What it would give.** Not a step towards either prize — it is the reason the
language-side search is closed, and it converts crystal 67 from a filter into an
explanation. **Band: Known** for the measure-theoretic content (uniform Bernoulli
invariance under surjectivity is Hedlund's; the trace being Bernoulli for a
permutive CA is the standard consequence), **project-internal** for the reading
that obstruction 20's three deaths were inevitable.

---

### 3.3 The occurrence ladder: the one non-vacuous, non-circular, sub-prize ladder, and its first rung is already proved

**The claim.** There is a filtration of a P1-sufficient condition into rungs none
of which implies either prize, whose `k`-th rung is *"every word of length `k`
occurs in `c` infinitely often"*; rung 1 is a **closed node on this board**; rung
2 is open and its measured margin is enormous; and in the best-studied analogue
in mathematics — the decimal digits of `π`, `e`, `√2` — even **rung 1 is open**.
This is the only place in the vantage where the board is ahead of the
literature's flagship example, and it is the only statement about `X_c` a
theorist can attack without proving a prize.

**The dictionary.**

| This project | Normal numbers / digits of a constant | Checked |
|---|---|---|
| `c` | the digit sequence of a specific real | both explicitly given and computable |
| word of length `k` occurs infinitely often in `c` | the `k`-digit block occurs infinitely often in the expansion | `Π⁰₂` in both |
| rung 1: `{0,1} ⊆ L(Ω_c)` | "every digit occurs infinitely often in `π`" | **proved here, open there** |
| rung `k` for all `k`: `Ω_c` = full shift | the expansion is *rich* / *disjunctive* | implies P1 here |
| frequencies as well as occurrence | Borel normality | = P1 ∧ P2 (Waywiser's fence) |
| rung 1's actual form: both letters occur in `[a, 4a]` for every `a ≥ 1` | a quantitative version nobody has for `π` | `centerColumn_window_not_constant`, closed |
| the mechanism behind rung 1 | none available for `π` | the left cone: two adjacent black cells at the cone edge, which the checkerboard forced by a run cannot match |
| **Seam 1** | rung `k` is **not** implied by P1 (the Fibonacci word is aperiodic and contains no `11`) and **not** implied by its negation (a periodic `c` whose period word is `0011` has all four 2-words recurring) — so no rung is circular in either direction | — |
| **Seam 2** | the ladder's *limit* is a sufficient condition for P1, so the rungs get harder without bound and the last one is the prize | — |
| **Seam 3** | occurrence is not frequency: the whole ladder says nothing about P2 | — |

**Two reductions, found while pricing the handoff, and they are what make it
worth a session.**

*(i) Half of rung 2 is already free.* Rung 1 applied twice gives both `01` and
`10` in `[a, 16a]` for every `a ≥ 1`: rung 1 at `a` supplies `u, v ∈ [a, 4a]`
with `c(u) = 0`, `c(v) = 1`, and rung 1 at `4a` supplies `u', v' ∈ [4a, 16a] `
with `c(u') = 0`, `c(v') = 1`; then between `v` and `u'` the column must change
from black to white somewhere, giving `10`, and between `u` and `v'` it must
change from white to black, giving `01`. So the open content of rung 2 is exactly
**two** statements, `00` occurs infinitely often and `11` occurs infinitely
often, and a theorist should not spend an hour on the other two as I nearly did.
(Paper argument, not kernel-checked: four lines plus a discrete
intermediate-value step on the colour change.)

*(ii) The disjunction of those two is an instance of the prize, not a detour.*
"`00` occurs infinitely often **or** `11` does" is precisely *"`c` is not
eventually alternating"*, and eventual period 2 means the tail is `(xy)^∞` —
either constant, which `centerColumn_not_eventually_constant` closes, or
alternating, which nothing on the board touches. **So the open half of Prize 1's
`p = 2` instance is exactly this disjunction**, the board holds only `p = 1`, and
the mechanism that gave `p = 1` — an infinite run contradicts a run bound — does
not extend, because an alternating tail has runs of length one and satisfies both
bounds with room to spare. The per-period ladder whose rungs these are has P1
itself as its limit, not merely a sufficient condition for it.

**What it leans on.** For the `π` side, fetched:

> "It is widely believed that the (computable) numbers √2, π, and e are normal,
> but a proof remains elusive."
> "It has not even been proven that all digits actually occur infinitely many
> times in the decimal expansions of those constants."
> "It has been an elusive goal to prove the normality of numbers that are not
> artificially constructed."
> — https://en.wikipedia.org/wiki/Normal_number

The same page records what *is* proved and how — Champernowne's constant by
concatenating the integers, Copeland–Erdős by concatenating the primes, Bailey
and Crandall (2002) by perturbing Stoneham numbers, Becher–Figueira (2002) for a
computable absolutely normal number. **Every one is a number built to satisfy the
conclusion.** That is the census answer for this field and it is the same seam
that killed P3's fields: the technique needs the object constructed from the
description, and `c` is handed over by an automaton.

On the board's side, rung 1 is `centerColumn_window_not_constant` (closed,
`Rule30/Proofs/CenterColumnWindowNotConstant.lean`), proved by composing the two
run bounds; and "either constant point lies in `Ω_c`" already implies P1 through
the closed `centerColumn_not_isEventuallyPeriodic_of_long_black_runs`, whose
hypothesis *is* `1^∞ ∈ Ω_c`.

**The test, and I ran it.** The rungs have a measurable shape. Taking rung 1's
own window `[a, 4a]` and asking for every word of length `k`
(`explorer/ephemeris2_rung2.mjs`, `N = 4·10^5`, so every `a ≤ 10^5`):

| `k` | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| largest `a` where `[a, 4a]` misses some word of length `k` | none | 1 | 11 | 23 | 35 | 113 |
| least power-of-two window multiplier working for all `a ≥ 2` | 2 | 4 | 8 | 64 | 64 | 256 |

So: **all four words of length 2 occur in `[a, 4a]` for every `a ≥ 2`**, verified
for every `a ≤ 10^5`; the only failure at any `a` is `00` at `a = 1`. The margin
is not marginal — the largest gap between consecutive occurrences of `11` below
`3·10^5` is `55`, against a window `[a,4a]` of length `3a`, and the gaps grow
like a coin's `≈ 4 log₂ t` (12, 23, 55, 55 at `10^2, 10^3, 10^4, 10^5`, against
the control's 28, 30, 46, 52). The kernel holds the finite instances:
`all_words_four_occur` in `explorer/ephemeris2_scratch_occur.lean` proves by
`decide` that all sixteen words of length 4 occur before time 63, with the
mutant `not_all_words_four_occur_early` accepted as proof that the same check
over twenty starts is *false*.

**What it would give.** Rung 2 would be **the first proved statement about which
words occur in `Ω_c` beyond single letters** — the first non-empty entry in the
inventory §1 found empty — it would say whether the cone mechanism behind rung 1
extends from letters to pairs, which is the only way to learn whether the ladder
is climbable at all, and by reduction (ii) it would settle **the open half of the
`p = 2` instance of Prize 1**, where the board currently stops at `p = 1`. What
would remain is everything: the ladder's limit is a sufficient condition for P1,
and `2^k` rungs sit at level `k`. **Band if proved: Novel, and small** — a new
fact about rule 30, not in print, that a mathematician would call a combinatorial
lemma rather than a result; the one thing that raises it above bookkeeping is
that it is an *instance* of the prize rather than a neighbour of it. I say that
plainly because the ladder's *shape* is the interesting part and the shape is
free; the rung is cheap only if the cone cooperates.

---

### 3.4 Kopra's Theorems 4.6 and 4.7: the field *does* describe a limit set of rule 30's own seed — in the space direction

**The claim.** The brief's second question — *is there any published technique
for describing the orbit closure of a single explicitly-given computable
sequence?* — has exactly one answer I could find, and it is in a paper this
project already holds and has never cited past its Theorem 3.5: Kopra proves
that the ω-limit set of rule 30's own seed, read in the *space* direction, is
**infinite**. The technique is a finite counting argument whose input is
aperiodicity of a trace at *some* width — which means limit-set descriptions are
**downstream** of the wall, not upstream, and that is the structural reason every
census row wanted P1 first.

**The dictionary.**

| This project | Kopra 2022 | Checked |
|---|---|---|
| a configuration white far to the left | `x ∈ N(Σ)` | the seed qualifies |
| row `t` read from the origin rightward | `frac(F^t(x))`, with `frac_c(x)[i] = x[c+i]` | lines 395–401 |
| the word at positions `[i, j]` of rows `t` | the trace `Tr[i,j](x)` | §2 |
| columns `i` and `i+1` both eventually periodic | `Tr[i,i+1](x)` eventually periodic | width 2 |
| Jen's theorem (board: `not_isEventuallyPeriodic_pair`) | Theorem 3.5 at `w = 2` | rule 30 is left permutive and left spreading, so `h = 0` and `1/h = ∞ > s` |
| **the ω-limit set of the rows** | `{frac(F^t x)}` has **infinitely many limit points** | Theorem 4.7 |
| the board could derive the same from its own node | Theorem 4.6 needs **no expansivity** — at `w = 1` it says finitely many limit points ⟹ *some* width-2 trace is eventually periodic, which Jen forbids | lines 517–543 |
| `Ω_c`, the vantage's object | **not this object**: `Ω_c` is a limit set in the *time* direction | the seam |
| **Seam 1** | the two limit sets are the two projections of one 2-D object — the vertical ω-limit set of the space-time diagram — and an infinite 2-D limit set can have a single point as its vertical projection, which is exactly P1 failing | fatal for a direct transfer |
| **Seam 2** | Theorem 4.6's counting argument runs on *determinism within a window* (radius `r` shrinks the window and `f(i,j)` is monotone); in the time direction there is no determinism, since no window of the column determines the next cell | fatal for an analogue |
| **Seam 3** | at `w = 0` Theorem 4.6 says: finitely many row-limit-points ⟹ *some* single column is eventually periodic. That is the right shape and the wrong direction — we *have* the conclusion's negation for all but one column and want the hypothesis | — |

**What it leans on.** Quoted from the held source,
`sources/kopra-2022-natural-class.txt`:

> "Theorem 4.7. If `F : Σ^Z → Σ^Z` is rapidly left expansive and `x ∈ N(Σ)`,
> then the sequence `{frac(F^t(x))}_{t∈N}` has infinitely many limit points in
> `Σ^N`." (lines 545–546)

> "Theorem 4.6. Let `F : Σ^Z → Σ^Z` be a CA and let `x ∈ Σ^Z` be such that the
> sequence `{frac(F^t(x))}_{t∈N}` has finitely many limit points in `Σ^N`. Then
> for every `w ∈ N` there is an `i ∈ N` such that `Tr[i,i+w](x)` is eventually
> periodic." (lines 517–519)

> "this class of automata contains in particular all the fractional
> multiplication automata (because then `1/h = 1 > log_pq(p/q) = s`) and all left
> permutive left spreading CA (because `1/0 = ∞ > s`) such as Rule 30."
> (lines 307–309)

> "It is a special case of Theorem 2 in [13] that, whenever `ξ > 0` and
> `p > q > 1`, the sequence `(frac(ξ(p/q)^i))_{i∈N}` has infinitely many limit
> points in the interval `[0, 1]`." (lines 509–511)

**The test.** Two, and both are cheap. *(a)* A theorist should check the
derivation I claim: Theorem 4.6 at `w = 1`, which assumes nothing about
expansivity, plus the board's closed `not_isEventuallyPeriodic_pair`, gives
Kopra's Theorem 4.7 for the seed **from the board's own theorem**, so the board
can own a statement about a limit set without importing rapid left expansivity.
*(b)* The claim to falsify is Seam 2: *that Theorem 4.6's counting argument has
no time-direction analogue*. Falsifying it — a version of 4.6 whose conclusion is
about `Ω_c` — would be the first genuine technique for the vantage.

**What it would give.** A proved description of a limit set of rule 30's seed,
which the board does not currently have in any form, and a precise answer to the
vantage's second question. It touches no part of the residual. **Band: Known** —
Kopra 2022 Theorem 4.7 is in print and is about exactly this configuration class;
what is new is only that this board has read past Theorem 3.5.

---

### 3.5 Mahler's `3/2` problem: the board's cheapest node is structurally the state of the art on a famous single-orbit question

**The claim.** Flatto, Lagarias and Pollington's theorem on `{ξ(p/q)^n}` is the
only theorem I could fetch that constrains the ω-limit set of an individual,
explicitly-given orbit with no hypothesis on the starting point — and read
through Kopra's own bridge between that setting and rule 30, **its conclusion is
rung 1 of §3.3**, which this board has proved. So the board is not behind the
literature on this shape of question; it is level with it, and the field's rate
of climb is the honest price of rung 2.

**The dictionary.**

| This project | `{ξ(p/q)^n}` mod 1 | Checked |
|---|---|---|
| a configuration white far to the left | a real `θ > 0` | Kopra's bridge: "multiplication by a fraction `p/q` in base `pq` can be implemented by a cellular automaton" (lines 32–33) |
| row `t` read rightward from the origin | the fractional part `{θα^t}` | Kopra lines 403–407 |
| rule 30's step | multiplication by the multiplier | **seam**: rule 30 is *like* such an automaton only in being rapidly left expansive; there is no `p/q` |
| a cylinder / a word | an interval | the coding |
| `Ω_c` has two points, i.e. both letters occur infinitely often | `limsup − liminf > 0` | rung 1 |
| FLP: `Ω(p/q) > 1/p`, uniformly in `θ` | the ω-limit set is not inside any interval of length `1/p` | the fetched statement |
| Mahler's Z-number: `{θ(3/2)^n} < 1/2` for all `n` | a configuration whose rows stay in half the space for ever | open since 1968; FLP gives `Ω(3/2) > 1/3`, and `> 1/2` would settle it |
| the finer ladder there (intervals of length exactly `1/p`) | partially settled, 2009 | the analogue of rung 2 |
| **Seam 1** | FLP's mechanism is the carry structure of base-`pq` arithmetic; rule 30 has no multiplier, and crystal 66's OR→XOR filter rejects every argument that would survive replacing `OR` by `XOR` — multiplication-like arguments do | fatal for transferring the *proof* |
| **Seam 2** | FLP quantifies over all `θ`, i.e. it *has* the instance family. Rule 30's family is crystal 40's `X_b`, and obstruction 9 shows the family version of the wall is outright **false** — so the instance trick that makes FLP provable is the one this board has already destroyed | fatal, and it is the "one object, no instances" seam arriving for the third time |

**What it leans on.** Fetched:

> "Ω(α) = inf θ > 0 (lim sup n → ∞ {θα^n} − lim inf n → ∞ {θα^n})" and
> "Ω(p/q) > 1/p for rational p/q > 1 in lowest terms."
> — https://en.wikipedia.org/wiki/Mahler%27s_3/2_problem

with the same page recording that a Z-number is a positive real whose
`{x(3/2)^n}` all stay below `1/2`, that Mahler conjectured in 1968 that none
exists, and that `Ω(3/2) > 1/2` would prove it while FLP give `Ω(3/2) > 1/3`. The
search that found the paper itself returned Flatto–Lagarias–Pollington, *On the
range of fractional parts `{ξ(p/q)^n}`*, Acta Arithmetica 70 (1995) 125–147
(`https://eudml.org/doc/206742`); **UNVERIFIED**: I did not fetch the paper, only
the Wikipedia statement of its result and the EUDML listing in search results, so
the page numbers and the exact hypotheses are secondhand.

**The test.** The falsifiable claim is Seam 1 stated positively: *that no
FLP-style argument can give rung 2 for rule 30*, because FLP's interval-gap
argument at finer scales is open even in the `3/2` setting it was designed for.
A theorist who wants to kill this connection should produce the carry-structure
analogue for `4r XOR (2r OR r)` — which is crystal 59's "rule 30 is rule 150 plus
one quadratic term", and the quadratic term is exactly what a carry argument
cannot absorb.

**What it would give.** Calibration, not progress: it says rung 1 is worth what a
thirty-year-old theorem on a famous problem is worth, and that rung 2 is the
place where that literature also stalled. **Band: Known**, and the new content is
only the identification.

---

### 3.6 Chowla and the Liouville subshift: the same statement, in the one field that has moved it, and the price of admission is multiplicativity

**The claim.** `P1 ∧ P2` for rule 30 — more precisely "`Ω_c` is the full shift
and `c` is generic for the fair coin" — is *formally the same statement* as
Chowla's conjecture for the Liouville function, which is the only instance I can
find of this exact shape being an active programme with partial theorems; and
every tool that has moved it (logarithmic averaging, the entropy-decrement
argument, Matomäki–Radziwiłł) consumes multiplicativity at the first step, which
rule 30 does not have in any form this board has been able to find.

**The dictionary.**

| This project | Liouville / Möbius | Checked |
|---|---|---|
| `c : ℕ → {0,1}` | `λ : ℕ → {−1,+1}`, explicitly given, computable | both single sequences with no parameter |
| `X_c`, `Ω_c` | the Liouville subshift, the orbit closure of `λ` | same construction |
| P1 ∧ P2 in the strong form | Chowla: the system "has the Bernoulli property ... isomorphic to the system one gets from all `±1` sequences" | fetched |
| the rungs of §3.3 | "every sign pattern of length `k` occurs" — known for `k ≤ 3`-ish by Tao–Teräväinen, **not** by elementary means | **UNVERIFIED**: I did not fetch a sign-pattern paper |
| the square-free indicator `μ²` | an explicitly-given sequence **whose orbit closure *is* described** | fetched |
| what makes that description possible | a definition by congruences: admissibility, "for every `b ∈ B`, its set of residue classes ... contains less than `b` elements" | fetched |
| the board's nearest congruence structure | the settled region: diagonal `k` periodic with period a power of two | crystal 47, obstruction 4 |
| **Seam 1** | the settled region's periodicity is along *diagonals*, and the centre column sits at index 0 of every diagonal, inside every transient — obstruction 1. So the one congruence structure rule 30 owns is precisely the one the column misses | fatal |
| **Seam 2** | every Chowla advance uses `λ(mn) = λ(m)λ(n)`; the only candidate relation here is dilation, `c(n)` versus `c(2^e n)`, and my previous session found every pair of dilations distinct to depth `2^21` | fatal |
| **Seam 3** | the logarithmically averaged form is a *weakening*: log-density `1/2` does **not** imply P2's natural density. Anyone tempted by the analogy must not seed it as a route to P2 | flagged |

**What it leans on.** Fetched:

> "the dynamical system one obtains from the Liouville sequence has the Bernoulli
> property, which means that it is isomorphic to the system one gets from all
> ± 1 sequences."
> — https://discreteanalysisjournal.com/article/2733-ergodicity-of-the-liouville-system-implies-the-chowla-conjecture

> "∑_{x/ω(x) < n ≤ x} λ(a₁n + b₁)λ(a₂n+b₂)/n = o(log ω(x))" — the logarithmically
> averaged Chowla conjecture, **for two-point correlations only**, overcoming the
> parity barrier.
> — https://arxiv.org/abs/1509.05422

> "the characteristic function of `F_B` and define `X_η = closure{S^r η : r ∈ Z} ⊂
> {0,1}^Z`. The system `(X_η, S)` is the corresponding `B`-free subshift." — and
> of the Mirsky measure, "`η` is generic along a subsequence for `ν_η`", the
> system being "zero entropy ... ergodic and has discrete spectrum".
> — https://arxiv.org/html/2106.14673

**The test.** Seam 2 is the falsifiable one and it is a measurement a theorist can
extend: *that there is no non-trivial relation between `c(n)` and `c(2^e n)`*. My
previous session's `explorer/ephemeris_kernel_orbit.mjs` found every pair `i < j ≤ 15`
of dilations distinct with largest witness `n = 6`, to depth `2^21`. A surviving
relation would be the first multiplicative-flavoured structure in rule 30 and
would open this whole field; its absence closes it.

**What it would give.** Nothing directly. Its value is that it names the missing
ingredient precisely — an approximate functional equation relating `c` at `n` and
at `mn` — and that it identifies the one positive precedent (`B`-free systems) as
resting on a congruence definition the column provably lacks. **Band: Known** for
the number theory, **project-internal** for the identification.

---

## 4. Died in translation

Fourteen. The first four are mine from this session and died within the hour.

1. **"At every black time `t`, the cell at `−2` is white."** My own, from
   misremembering `column_succ_of_black`'s index as `column (-1) (t+1)` rather
   than `column (-1) t`. Died at the measurement: the cell at `−2` is white at
   `25,179` of the `50,046` black times with `c(t+1) = 0` below `2·10^5` — a coin
   (`explorer/ephemeris2_subshift.mjs`, block `D'`). The correct identity,
   `cell(−1, t) = ¬c(t+1)` at black `t`, held `50,046/50,046` and `0/50,025` in
   the complementary check. **The tell I ignored:** I derived the extra
   constraint before checking which time index the board's node carries.
2. **"`no 11 past N` ⟹ column `−1` is black at every late black time, which is
   new information."** Mine, and it looked like the start of a route to rung 2.
   Died as a **tautology**: it is the rule at the origin read backwards
   (`c(t+1) = ¬cell(−1,t)` when `c(t)` is black), so it restates the hypothesis
   and adds nothing. The measurement that confirmed the identity is the same one
   that empties it. Recorded because it is the exact shape the brief warns
   about, one level down from a prize.
3. **"The ladder's window multiplier is `2^k`."** Mine, formed on seeing that all
   words of length 1, 2, 3 occur in `[a, 2a]`, `[a, 4a]`, `[a, 8a]` for `a ≥ 2`.
   Died at `k = 4`, where the least power-of-two multiplier is **64**, not 16
   (`explorer/ephemeris2_rung2.mjs`). The honest form is the threshold table in
   §3.3, whose binding constraint is small `a` and not large `a` — since the gaps
   grow logarithmically and the window grows linearly, every fixed `k` is safe for
   all large `a`.
4. **"`X_c` not minimal ⟹ P1."** Mine, on paper, and wrong on the definition: an
   eventually periodic `c` with a non-empty transient has a *non-minimal* orbit
   closure, because the periodic cycle is a proper closed invariant subset. Every
   minimality statement in this vantage must be about `Ω_c`, not `X_c`; with that
   fix, `Ω_c` not minimal does imply P1. Left in because the slip is free to make
   and silent.
5. **"Is `X_c` minimal, or does it contain the all-white point?" as a cheap
   question.** The brief's first question, and it is **wall-strength in one
   direction and unavailable in the other**. `0^∞ ∈ Ω_c` is equivalent to the
   white runs of `c` being unbounded, which is exactly the hypothesis of the
   closed node `centerColumn_not_isEventuallyPeriodic_of_long_black_runs` read in
   the other colour (only the black version is on the board; the white one is the
   same two-line argument, since an eventually periodic sequence has bounded runs
   of both colours) — so it is a *sufficient condition for P1*, strictly stronger
   than the prize, and nobody can check it. The measured answer is that it does:
   longest white run 5, 10, 12, 19 inside `10^2 … 10^5`, tracking `log₂`. The
   other branch, "minimal", is satisfied by a finite cycle and so cannot imply
   anything.
6. **Unique ergodicity as a target.** `Ω_c` uniquely ergodic with `μ([1]) = 1/2`
   *is* P2; `Ω_c` uniquely ergodic alone is true of every periodic orbit. So the
   property is vacuous or super-prize with nothing in between — the dichotomy of
   §3.1 applied to the measure, and Waywiser's fence reached from the other side.
7. **Rigidity of `×2, ×3`-invariant measures (Furstenberg, Rudolph, Host).** The
   ideal tool: positive entropy plus two commuting actions forces Lebesgue. Died
   at the second action — `Ω_c` carries only `σ`, and the candidate second
   structure, the dilations `t ↦ 2^e t`, is not a homeomorphism of `Ω_c` and
   carries no identity (my previous session, depth `2^21`). It also needs the
   measure handed over in advance, which is the genericity gap of §3.2.
8. **Toeplitz flows and odometer extensions.** The picture really is a Toeplitz-
   style filling: diagonal `k` is periodic with period `2^{d(k)}` past its onset,
   so the settled region is built by filling arithmetic progressions with
   periodic patterns, and Toeplitz flows have complete descriptions (minimal,
   uniquely ergodic when regular, almost 1–1 over an odometer). Died at
   obstruction 1: the centre cell at time `t` is index `0` of diagonal `t`, and
   index `0` is inside the transient of every diagonal past the third. The
   filling and the column are disjoint.
9. **Transferring Kopra's infinitude to the column.** Theorem 4.7 gives
   infinitely many limit points of the *rows*. Died at the direction: the rows'
   limit set and `Ω_c` are the two projections of the vertical ω-limit set of the
   2-D space-time diagram, and an infinite 2-D limit set can project to a single
   point vertically — which is exactly the wall's failure case. §3.4, Seam 1.
10. **A time-direction analogue of Kopra's Theorem 4.6.** Its engine is
    monotonicity of "number of words occurring infinitely often on a window"
    under shrinking the window by the radius — a *determinism* property. Died
    because no window of the column determines the column's next cell; that is
    obstruction 2 and the sideways solve needing two columns.
11. **Kneading theory (Milnor–Thurston).** The unlikely entry, and it dies
    informatively: it is the one field whose central object is the itinerary of a
    single explicitly-given orbit, and its instances come from varying the *map*
    through a continuous family with transversality. Rule 30 has no parameter, and
    the finite family — the 256 elementary rules — is refuted by crystal 66's
    OR→XOR filter, under which rules 90 and 150 carry *more* structure and the
    wrong answers.
12. **Any uniform language constraint.** A statement "word `w` never occurs in
    `Ω_c`" is conjecturally **false** (§3.2's coupon-collector table), and its
    negation quantified over all `w` implies P1. A statement "runs are uniformly
    bounded" is implied by P1 *failing*, so it is the wrong sign. So the language
    side offers nothing provable and true except the finitely-many-words
    statements of §3.3 — which is the complete answer to the brief's question
    "what would a description need beyond the run bounds": it would need a
    *uniform* statement, and every uniform statement is either false or the
    prize.
13. **Low-complexity structure (Sturmian, substitutive, linearly recurrent).**
    Dead before theory by measurement, crystal 73 and §3.2's table; recorded so
    the next connector does not re-sight it.
14. **Blocking words and equicontinuity as a complexity bound.** Already dead on
    the board (crystal 73: rule 30 has no `r`-blocking word at any length, so the
    one CA mechanism bounding a column subshift's complexity from above never
    applies). Not mine, and listed because it is the first thing a
    symbolic-dynamics reader reaches for and it is the *upper* bound; §3.1 is why
    the *lower* bound is the prize.

Nothing died for lack of depth. Every death above has a witness computed or a
one-line argument, and the two deepest measurements are `3·10^5` terms of the
column with a fair-coin control and `4·10^5` terms for the ladder thresholds.

---

## 5. What to hand the theorist

**The verdict first, because it is the deliverable and it is a negative.**
Describing `(X_c, σ)` is not a route to the wall: `X_c` infinite **is** Prize 1,
kernel-checked, so the four census rows that asked for a description were asking
for the prize as an input. The board's entire proved inventory of constraints on
the column's words — both run bounds — is **vacuous** at the level of the
subshift, because a bound whose right-hand side grows with the start time forbids
no word from a set of limits. And on the measure side the object the vantage
asked for already exists and is already fenced: the ensemble's column law is
exactly `Bernoulli(1/2)` (crystal 67), so "indistinguishable from a coin" is a
theorem and genericity of the one point is the prize. **The vantage is closed as
a source of descriptions.** One thing came out of it that is not a restatement —
the brief's inventory was one node short, the missing node is
`centerColumn_window_not_constant`, and one rung above it sits the open half of
Prize 1's `p = 2` instance. That is Topic 1.

**Topic 1 — the occurrence ladder, rung 2. Claim to falsify: *all four words of
length two occur in every window `[a, 4a]`, for every `a ≥ 2`.***

*The band, first, so nobody is sold anything.* **Novel if proved, and small** —
a new fact about rule 30 that a mathematician would call a combinatorial lemma.
*Why it is worth a session anyway, and this is the part that changed while I was
pricing it:* it is the **only** statement about `X_c` that is non-vacuous, is not
a restatement of a prize, and is not refuted by the dichotomy — and it is **an
instance of Prize 1 rather than a neighbour of it**. Two reductions do that work
(§3.3). *(i)* The words `01` and `10` are free: rung 1 applied at `a` and again at
`4a` forces both of them inside `[a, 16a]`, so the open content is exactly "`00`
occurs infinitely often" and "`11` occurs infinitely often". *(ii)* Their
disjunction is precisely *"`c` is not eventually alternating"*, which together
with the closed `centerColumn_not_eventually_constant` is exactly
**`¬ ∃N, ∀ n ≥ N, c(n+2) = c(n)`** — the `p = 2` instance of Prize 1. The board
holds `p = 1` and nothing else, and the mechanism that gave `p = 1` (an infinite
run contradicts a run bound) does **not** extend, since an alternating tail has
runs of length one. So the question is live, small, and on the wall's own
instance ladder whose limit is the prize itself.
*The dictionary row it depends on:* §3.3's, whose calibration is that in the
flagship analogue — the decimal digits of `π` — even rung 1 is open, fetched and
quoted. *The depth that settles the measurement:* verified for every `a ≤ 10^5`
with a single failure at `a = 1` (the word `00`); the largest gap between
occurrences of `11` below `3·10^5` is `55` against a window of length `3a`, and
the gaps grow like a coin's `4 log₂ t`
(`explorer/ephemeris2_rung2.mjs`, `ephemeris2_subshift.mjs`). *What the work
actually is:* deciding whether the cone mechanism behind rung 1 — a long run in
the column forces a checkerboard leftward, which collides with the two adjacent
black cells at the cone edge (`evolve_left_edge`,
`evolve_left_second_diagonal`) — extends from letters to pairs. *Three warnings.*
Rung 2 gives the `p = 2` instance of P1 and **no more**: the per-period ladder has
infinitely many rungs and nothing here says the next one is reachable, so this is
a rung, not a route. The tempting reduction — "`no 11 past N` ⟹ column `−1` is
black at every late black time" — is a **tautology**, the rule at the origin read
backwards, and I spent an hour on it (§4.2). And the conjunction form (*both* `00`
and `11` infinitely often) is strictly stronger than the `p = 2` instance, which
needs only the disjunction, so a theorist who gets one of the two colours has
already earned the instance.

**Topic 2 — a description of a limit set the board can own, from its own node. It
is an adjudication plus one derivation, not a research session.**

Kopra 2022 §4 — in `sources/`, never cited by this project past Theorem 3.5 —
proves that the ω-limit set of rule 30's seed read in the *space* direction is
infinite (Theorem 4.7). Its Theorem 4.6 needs **no expansivity at all**: at
`w = 1` it says that finitely many limit points of `{frac(F^t x)}` force *some*
width-2 trace to be eventually periodic, which the board's closed
`not_isEventuallyPeriodic_pair` forbids outright. So the board can derive "the
sequence of rows, read rightward from the origin, has infinitely many limit
points" from Jen's theorem alone. *Band: Known* — it is Kopra's Theorem 4.7
specialised. *Why hand it over:* it is the only *description of a limit set*
anywhere near this problem, it answers the vantage's second question with a
positive instance rather than a census of absences, and it carries the structural
lesson — the technique's input is aperiodicity at some width, so limit-set
descriptions are downstream of the wall. *What settles it:* a theorist reading
`sources/kopra-2022-natural-class.txt` lines 517–551 and checking the `w = 1`
instantiation against `not_isEventuallyPeriodic_pair`. *What must not be
inferred:* it says nothing about `Ω_c`; §3.4's Seam 1 is why.

**Not handed over, deliberately.** Anything measure-flavoured — crystal 67's
ensemble fence and Waywiser's normality fence already cover it, and crystal 67's
own recommended node `centerColumn_trace_uniform` is still unseeded after three
days, which is a captain's decision and not a theorist's. And the dichotomy of
§3.1 itself: it is kernel-checked, it is band **Nothing**, and its only use is as
a fence — *a proposal whose value is that it describes the subshift is a proposal
to prove Prize 1.*

---

## 6. Next vantage

**The theory of trace subshifts of cellular automata as a field in its own
right — Kůrka's trace and column-subshift chapter, Cervelle–Guillon,
Di Lena–Margara — aimed not at describing `X_c` but at the one question this
session found worth asking: can the trace of a surjective, left-permutive CA
started from a coned configuration lie inside a proper subshift of finite
type?** That is rung 2 of §3.3 restated in the field's own vocabulary: "`c` has
no `11` past `N`" says exactly that the tail of `c` lies in the golden-mean
shift, and rung `k` says the tail avoids no SFT of order `k`. The reason to
attack from there rather than from ergodic theory is that this is the one
question in the vantage whose answer is *not* a prize in disguise, and trace
theory is the only field whose objects are traces rather than orbits — it asks
which subshifts can be traces at all, which is a *family* question with the
instances supplied by the 256 rules and by the `X_b` family, and so it escapes
the "one object, no instances" seam that killed everything else in this
document. I could not reach it because I spent the session on the single-orbit
question the vantage named, and because the decisive fact — that the board's rung
1 is already proved — only appeared in hour four.

**The vantage I could not reach from where I stood: the vertical ω-limit set of
the space-time diagram as a two-dimensional object, and its two projections.**
Everything in this document treats either the column (time direction) or the rows
(space direction), and §3.4 showed they are the two projections of one thing:
the set of limits of the seed's space-time diagram translated downward. Kopra's
proved infinitude is the horizontal projection; the wall is the vertical one. The
field for that object is multidimensional symbolic dynamics and directional
subdynamics — Boyle–Lind expansive subdynamics, directional entropy, Milnor — and
this project has one sighting in that direction (2026-09-08, algebraic and
expansive subdynamics) that did not treat the limit set. The specific question I
could not even formulate properly, let alone test, is whether the *vertical*
projection of an infinite two-dimensional limit set can be forced to be infinite
by a directional expansiveness hypothesis that rule 30 actually satisfies — since
left expansivity at width 2 is exactly what Kopra has and width 1 is exactly what
the prize needs, the gap between them may be a statement about directions rather
than about widths, and nobody here has looked at it that way.
