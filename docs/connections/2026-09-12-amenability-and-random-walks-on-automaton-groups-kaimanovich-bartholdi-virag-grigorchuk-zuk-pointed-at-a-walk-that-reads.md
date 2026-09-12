# Sighting: amenability and random walks on automaton groups, pointed at a walk that reads its own labels

**Problem.** `centerColumn_other_isEventuallyPeriodic_of_center` — equivalently,
by the board's own note, Prize 1: the centre column of rule 30 is not
eventually periodic.

**Vantage.** Random walks on self-similar (automaton) groups — Kaimanovich's
Münchhausen trick, Bartholdi–Kaimanovich–Nekrashevych's amenability theorem for
bounded automata, Grigorchuk–Żuk's spectral computations — pointed at the
object Portage's third sighting produced and could not take further: rule 30's
centre column is the root-label sequence of a **self-driving** walk in an
explicit 3-generated self-similar group `G`, the step being chosen by the
walk's own output rather than by an i.i.d. draw.

**Connector.** Parallax, 2026-09-12. Fourth sighting.

**The short version.** The vantage closes, and it closes one level before the
hypotheses. **It is not a walk.** `s_t = E^t|_{δ|_t}` is a function of `t`
alone: for one configuration there is exactly one trajectory, it does not
branch, and the "steps" `u_t` are computed *from* it rather than fed into it.
Every theorem in this field quantifies over a measure on trajectories, and no
measure on `G` charges one sequence — so the question "which theorems survive
the loss of contraction" has an answer (the Münchhausen trick and the
Grigorchuk–Żuk spectral method both survive it, and the latter's hypothesis,
level-transitivity, I verified holds) and the answer does not help, because
every survivor computes an invariant of `G`, which crystal 40's whole family
shares.

Two things came out that a captain can use. **The step sequence is the pair
(column 0, column −1)**, recoded letter-for-letter — 0 failures over 199,999
rows in both directions — so Jen's theorem gives, unconditionally and for free,
that the *step* sequence is not eventually periodic, while Prize 1 is that its
*letter-to-letter projection* `q0,q1 ↦ 0`, `q2 ↦ 1` is not. The gap between
those two is the wall, and `b = (10)^∞` is an explicit configuration where the
projection does destroy aperiodicity, so no general theorem of that shape can
exist. And **the empirical step law is `(0.2492, 0.2504, 0.5004)`** against the
section chain's stationary law `(1/4, 1/4, 1/2)` with a coin control at
`(0.2502, 0.2499, 0.4999)` — the `q2` slot is the centre column's own density,
reproducing the board's `0.500360` exactly from a different engine, so **the
field's first hypothesis about a measure is this project's Prize 2**.

Scripts, all under `explorer/` and all run:
`parallax11_walk.mjs` (the step law; the `u ↔ (column 0, column −1)` identity;
step frequencies with a coin control),
`parallax11_auto.mjs` (autonomy; i.i.d. controls for `|s_t|`; the realisable
step sequences),
`parallax11_speed.mjs` (the ball of `G`, word lengths, level-transitivity, the
`⟨q0⟩`-orbit of `δ`),
`parallax11_counter.mjs` (freeness of the positive monoid; the counterfactual
configurations whose centre column *is* periodic),
`parallax11_free.mjs` (a cheaper freeness test that failed, with its two
negative controls),
`parallax11_inject.mjs` (what the position remembers; freeness at lengths
10–16 by sampling),
`parallax11_reach.mjs` (`R(t)`, the reachable positions, and the transducer-size
band).

---

## 1. The problem, seen from outside

Take the set `X^ω` of infinite binary words and three specific bijections of it
that preserve every prefix length — so, three automorphisms of the infinite
binary rooted tree. Each of them is *finite-state*: what it does below a vertex
depends only on the last two letters of that vertex, so the three of them are
the three states of one machine over the two-letter alphabet. Write `g|_x` for what `g` does
below the vertex `x` (its *section*), and `χ(g) ∈ {0,1}` for whether `g` flips
the first letter (its *root label*). Now run a walk in the group `G` they
generate:

```
s_0 = 1,     s_{t+1} = u_t · (s_t|_0),     u_t ∈ {q0, q1, q2}.
```

If the letters `u_t` were drawn i.i.d. from a fixed law this would be an
ordinary random walk on a self-similar group, and a large machinery — Poisson
boundaries, asymptotic entropy, amenability by the Münchhausen trick, spectra
of Schreier graphs — would be pointed at it. **The letters are not drawn.**
`u_t = q2` exactly when `χ(s_t) = 1`, that is, exactly when the walk's own root
label is non-trivial; and when `χ(s_t) = 0` the walk takes `q0` or `q1`
according to a single bit supplied by the environment it came out of. The
sequence of root labels `χ(s_0), χ(s_1), χ(s_2), …` is measured to `10^7` terms
and is a fair coin by every statistic anyone has tried. **The open statement is
that it is not eventually periodic.**

*In the project's own terms.* `s_t = E^t|_{δ|_t}` where `E = q0` is rule 30's
right-edge map and `δ = 1000…` is the single seed; `χ(s_t) = centerColumn t`;
`s_t(0^ω)` is the left half of row `t`; and `u_t` is read off the two cells
`(cell(t,1), cell(t,0))` — the origin and the cell just right of it. All of
that is Portage's §3.4, re-derived and re-verified here (0 failures, 61 rows,
and against `E^{t+1}` rebuilt from scratch to `t = 12`).

---

## 2. Fields sighted

| Field / theory | The object there | The seam, in one line |
|---|---|---|
| Random walks on self-similar groups (Kaimanovich, Bartholdi–Virág) | `s_{t+1} = u_t·(s_t\|_0)` with `u_t` i.i.d. | **There is no measure.** The steps are a deterministic function of the walk's own label plus one external bit (§3.1) |
| The Münchhausen trick (Kaimanovich 2005) | A self-similar measure `μ` with `μ^x = (1−α)δ_e + αμ`, giving `h(G,μ) = 0` and amenability | Its first hypothesis is a step *law*; the empirical step law here has `1/2` in one slot and that `1/2` **is Prize 2** (§3.5) |
| Bartholdi–Kaimanovich–Nekrashevych, bounded automata | "the group of bounded automatic automorphisms of a rooted tree is amenable" | `E` has activity `2^n`, the top of the hierarchy; the theorem's hypothesis fails as badly as it can (§3.4) |
| Nekrashevych limit spaces, contraction | The nucleus | Dead before this session: `\|nucleus\| ≥ 526,563` (obstruction 11, Portage) |
| Grigorchuk–Żuk, spectra of Schreier graphs | `Sch(G, St(v), S)` at level `n` | **Survives without contraction**: its hypothesis is spherical transitivity, and `G` is level-transitive (measured, `n ≤ 14`). It computes a spectrum of the *group*, which cannot see one orbit (§3.4) |
| **Free monoids and codes** | `⟨q0,q1,q2⟩⁺` | **Free** — `3^t` distinct products exactly, `t ≤ 8`. It does *not* follow that the walk is its own step word, and I believed for an hour that it did (§4) |
| Kesten's amenability criterion, cogrowth | Spectral radius of the simple random walk on `G` | An invariant of `G`, hence shared by every configuration in crystal 40's family; cannot reach P1 by Portage's fence |
| Lamplighter groups (`Z/2 ≀ Z` from a 2-state automaton) | The standard exponential-activity automaton group | The witness that non-contraction does **not** imply non-amenable — so "not contracting" closes proofs, not conclusions (§3.4) |
| Rotor-router / Eulerian walkers (Propp machines) | A deterministic walk that reads and rewrites its own trail | The only published field about walks reading their own labels; but a rotor walk is *recurrent on a finite graph*, and here the trajectory lives in a free monoid and never returns (§4) |
| Excited / self-interacting random walks (Benjamini–Wilson) | Step law depends on the walk's own history at the current site | Same seam: those are still *random*, and the theorems are about the law; here the only randomness is in the observer's ignorance |
| Skew products and cocycles over a base | Step sequence as base, group element as fibre | Already sighted (2026-09-08, cocycles over an odometer); the base here is the pair (column 0, column −1) and the board already owns its aperiodicity |
| Subshifts and factor maps | Realisable step sequences form a prefix tree of size exactly `2^L` inside `3^L` | The label sequence is the letter-to-letter projection `q0,q1 ↦ 0`, `q2 ↦ 1`; **P1 is "aperiodicity survives this projection"** (§3.2) |
| Automaton semigroups, the dual automaton | Portage's own next vantage | Not entered: the interesting quantity there is the section growth `m(t)`, and obstruction 21 already owns it (§5, item 2) |
| State complexity / Myhill–Nerode | `\|s_t\|`, states of the minimal transducer | Blind: within `0.5%` of `m(t)` for **i.i.d. steps too**, not merely across crystal 40's family — a fifth death of obstruction 20's shape (§4) |
| Random walks with internal degrees of freedom | `(position in G, letter in X)`, the RWIDF of the Münchhausen survey | The right formal home for the object; the induced measure `μ^x` is at a *fixed* letter, which our ray supplies — so this is the one hypothesis that does **not** break |

---

## 3. Connections

### 3.1 There is no walk: the trajectory is unique and determined by `t`, and the "steps" are a read-out rather than an input

**The claim.** The object Portage handed on is not a random walk with a strange
step law; it is a random walk with **no law at all**, because the trajectory
does not branch: `s_t = E^t|_{δ|_t}` is a function of `t` and nothing else, the
steps `u_t` are computed *from* the trajectory rather than fed into it, and
every theorem in this field is a statement about a measure on trajectories of
which there is here exactly one.

**The dictionary.**

| Rule 30 | Random walks on automaton groups | Checked |
|---|---|---|
| Time `t` | Step count of the walk | — |
| The seed's row `t`, left of the origin | `s_t(0^ω)` for `s_t = E^t\|_{δ\|_t}` | 0 failures over 1,021 cells, `t ≤ 60` (`parallax11_walk.mjs` §E) |
| `centerColumn t` | `χ(s_t)`, the root label at the position | 0 failures over 61 rows |
| `(cell(t,1), cell(t,0))`, origin and the cell to its right | The step `u_t = q0\|_{(a,b)}`: `(0,0) → q0`, `(1,0) → q1`, `(∗,1) → q2` | exhaustive over the automaton: reading `(a,b)` from **all three** states lands in one state, so `u_t` is well defined |
| A configuration white at `x ≥ 1` (crystal 40's `X_b`) | The ray `w ∈ X^ω`; `s_t = E^t\|_{w\|_t}` | Portage §3.4 |
| **The single seed** | The ray `δ = 10^ω`, so `w\|_t = 1 0^{t−1}` — **one vertex per level** | by definition |
| A measure `μ` on `G` giving the step law | **Nothing.** There is one trajectory, and no measure on `G` charges it | — |
| Branching of the walk | Choice of the ray, i.e. choice of the configuration | crystal 40 |
| The step sequence as an *input* | A legitimate object only across the family; for one configuration it is a function of the position's own index | §3.2 |

**Seams.** (i) The field's object does exist here, but one level up: the
*section chain* `g ↦ g|_x` with `x` drawn uniform is a genuine Markov chain on
the automaton's three states, and crystal 40's family is its trajectory space.
The seed is one trajectory in it. (ii) The recursion Portage verified is real
and is not being denied — `s_{t+1} = u_t·(s_t|_0)` holds, 0 failures against
`E^{t+1}` rebuilt from scratch to `t = 12` here. What is denied is that it
carries the information a walk's step sequence carries: `s_t` depends only on
the vertex `δ|_t`, and for the seed there is one vertex per level. (iii) The
"self-driving" is therefore a description of the *read-out*, not of a feedback
loop: `u_t = q2` exactly when the walk's own label is black, but that fact
constrains nothing, because there was never a choice to constrain.

**What it leans on.** Nothing outside; it is Portage's own §3.1 identity
`c(t) = χ(q0^t|_{δ|_t})` read for what it says about branching. The field's
requirement of a measure is in the survey I fetched at
<https://arxiv.org/html/0904.0047>, whose entire apparatus is stated for
`(G,μ)`: *"the asymptotic entropy h(G,μ) vanishes if and only if the tail
σ-algebra of the random walk (G,μ) is trivial"*.

**The test.** `explorer/parallax11_reach.mjs` and `parallax11_inject.mjs`.
Over **all** `3^t` step sequences run with the seed's section pattern, the
reachable positions number `R(t) = 3, 6, 9, 12, 18, 27, 39, 51, 66, 84, 105,
135, 174, 228, 297` at `t = 1..15`, and the seed's own element is one of them
at every `t` (checked in the same run). The first eight values look polynomial
and are not: the late ratios are `1.250, 1.286, 1.289, 1.310, 1.303`, so
`R(t) ≈ 1.30^t` against `3^t` — the position discards a factor `2.3^t` of the
step sequence, keeping about `0.38t` bits of a `1.58t`-bit input. **And all
`R(t)` of them have the same transducer size to within eight states** (`517…522`
at `t = 8`, `32885…32893` at `t = 15`), which is the mechanism behind every
blind statistic in §4. Separately, over crystal 40's `2^T` boundaries the
number of distinct **step sequences** is exactly `2^T` for `T = 1..14`
(exhaustive, `parallax11_auto.mjs` §C) — the step sequence is a faithful
recoding of the configuration, so exactly two of the three letters continue any
realisable prefix, and which two is decided by the label. **To kill this
connection**: exhibit a measure on `G` under which the seed's trajectory is
typical, or a theorem in this field whose hypothesis is about a single orbit
rather than a measure.

**What it would give.** It closes the vantage, and it closes it at the right
place: not at contraction (Portage), and not at any hypothesis one might hope
to weaken, but at the existence of the measure that every theorem in the field
quantifies over. That is a stronger closure than "the hypotheses fail", because
there is nothing to weaken.

---

### 3.2 Prize 1 is "aperiodicity survives a letter-to-letter projection", and the sequence being projected is one the board has already proved aperiodic

**The claim.** The walk's step sequence `u` is the pair `(column 0, column −1)`
recoded letter-for-letter; Jen's theorem, proved on this board, therefore says
**unconditionally** that the step sequence is not eventually periodic; the
label sequence is the letter-to-letter projection `q0, q1 ↦ 0`, `q2 ↦ 1` of the
step sequence; and Prize 1 is exactly the statement that aperiodicity survives
that projection.

**The dictionary.**

| Rule 30 | This vantage | Checked |
|---|---|---|
| `centerColumn t` | `[u_t = q2]` — the label is a letter map of the step | 0 failures over 199,999 |
| `column (−1) t` | `[u_t, u_{t+1}]` under a width-2 sliding block: `c(t)=1 → ¬c(t+1)`, `c(t)=0 → c(t+1) XOR [u_t=q1]` | 0 failures over 199,999 |
| The pair `(column 0, column −1)` | **The step sequence `u`**, both ways | 0 failures over 199,999 in the reverse direction too |
| `not_isEventuallyPeriodic_pair` (Jen, proved) | **The step sequence is not eventually periodic** | two-line consequence of the row above |
| **Prize 1** | The *projected* step sequence is not eventually periodic | the projection is `q0,q1 ↦ 0`, `q2 ↦ 1` |
| `column_succ_of_black` (the black-time law) | `u_t = q2` whenever the label is black; `q2` is the automaton's reset state | `q0\|_1 = q1\|_1 = q2\|_1 = q2` |
| Obstruction 9's reduction ("column 1 read at the white times of the centre column") | The `q0`-vs-`q1` refinement of the step at the white-label times | by construction |
| The left cone | §3.3 | — |
| **A general theorem "aperiodic steps ⟹ aperiodic labels"** | **False.** `b = (10)^∞` gives a walk with label period 2 and an aperiodic step sequence | obstruction 9; corroborated here, 20 distinct step-factors of length 16 in the tail against 2 label-factors |

**Seams.** (i) The projection loses exactly one bit at the white-label times,
and that bit is column 1 — which is the whole content of the wall, so the
reframing does not narrow it. (ii) Jen's theorem applies to the seed and to
configurations white far to the left; the counterexample `b = (10)^∞` is not
one, which is precisely why it is allowed to have a periodic label sequence.
(iii) "Aperiodic" here means "not eventually periodic"; a projection of an
aperiodic sequence is aperiodic for no general reason at all, which is what the
last row says with a witness.

**What it leans on.** The board's `not_isEventuallyPeriodic_pair` and
`sideways_inverse` at the origin; obstruction 9 for the witness
`b = (10)^∞` and its "no eventually periodic column other than column 0",
established there at depth `5·10^5` with 998,977 distinct factors of length
1024. No outside citation is needed and none is claimed.

**The test.** `explorer/parallax11_walk.mjs` §C: three checks at `T = 200,000`
— `u` determines column 0 (0 failures), `u` determines column −1 (0 failures),
`(column 0, column −1)` determines `u` (0 failures). `parallax11_counter.mjs`
§B for the counterfactual. **To kill it**: a `t` where the recoding fails, or a
configuration white far to the left whose step sequence is eventually periodic
(which would contradict Jen).

**What it would give.** It says what a proof coming from this field would have
to look like, and the shape is unpromising: the field would have to prove that
a letter-to-letter projection preserves aperiodicity, and the family supplies a
counterexample to every version of that which does not mention the cone. It
also hands the theorist one cheap, honest positive: *the step sequence of the
self-driving walk is not eventually periodic*, for free, from a closed node.
Band, stated first: **project-internal** — it re-expresses Jen and proves
nothing new about rule 30.

---

### 3.3 The cone is a countable null set, and it is the hypothesis of every theorem on both sides — which makes the two sides disjoint by construction

**The claim.** In this vantage the project's standing hypothesis "white far to
the left" is exactly "the boundary ray is eventually constant"; those rays form
a **countable** subset of `X^ω`, hence a null set for every non-atomic measure;
and every theorem in the random-walk field concludes something for `μ`-almost
every boundary point. So the field's conclusions and the project's hypotheses
are not merely hard to connect — they are supported on disjoint sets, and the
disjointness is explicit on both sides rather than a mood.

**The dictionary.**

| Rule 30 | This vantage | Checked |
|---|---|---|
| Row 0 read leftward from the origin | The boundary ray `w ∈ X^ω`, `w_k = cell(0,−k)` | Portage §3.4 |
| **"White far to the left"** (Jen's and Kopra's hypothesis; the cone) | `w` is eventually constant `0`; equivalently the walk eventually takes every section at the same letter | by definition |
| The single seed | `w = δ = 10^ω`, the simplest such ray | — |
| Crystal 40's family `X_b`, which kills every route | Rays `w` that are **not** eventually constant — e.g. `b ≡ 1` gives row 0 `… 1 0 1 0 1 \| 0 0 0 …` | obstruction 9 |
| The set of coned configurations | A countable subset of `X^ω`; measure zero for the uniform Bernoulli measure and for every non-atomic measure | — |
| `μ`-a.e. boundary point (every theorem of the field) | A set that misses every coned configuration | — |
| The Münchhausen trick's `μ^x` at a **fixed** letter `x` | The one place the field's convention matches the cone: the seed's sections are all at one letter | fetched quote below |
| Prize 2 (the centre column is balanced) | The step law's `q2`-weight is `1/2` | §3.4 |

**Seams.** (i) The match at the `μ^x` row is a match of *convention*, not of
content: the trick's `μ^x` is the induced law of a random walk watched inside
one subtree, and our fixed letter comes from the ray rather than from a choice.
(ii) The countability is of the *coned* set, not of the good set; nothing here
says anything about which coned configurations do what. (iii) This is the same
ensemble-versus-point wall three of my previous sightings ended at; what is new
is only that both sides are explicitly describable here, so it is a fact rather
than an impression.

**What it leans on.** The fixed-letter convention, fetched at
<https://arxiv.org/html/0904.0047>: *"the transition probabilities of the
induced chain on G×{x} are…the usual random walk determined by a certain
probability measure μˣ on G"*, with `x` a fixed letter of the alphabet; and the
entropy criterion on the same page, *"the asymptotic entropy h(G,μ) vanishes if
and only if the tail σ-algebra of the random walk (G,μ) is trivial"*, which is
the shape every conclusion in the field has.

**The test.** There is no computation that can falsify a countability
statement. What is checkable, and was checked, is the claim that the family
whose rays are not eventually constant behaves identically: the configurations
`b ≡ 1`, `b = (10)^∞` and `b = (1000)^∞` give walks whose `|s_t|` matches the
seed's to `0.5%` at every `t ≤ 20` (`parallax11_counter.mjs` §C — the seed
reads `3 7 16 35 71 141 272 517 …` and the three counterfactuals
`3 7 17 35 71 141 274 521 …`, `3 8 17 36 71 141 272 517 …`,
`3 8 16 35 71 141 274 517 …`), while their *label* sequences have periods
`1`, `2` and `4` against the seed's `9,291` distinct factors of length 16.
**To kill it**: any theorem in the field whose conclusion holds at a *named*
boundary point rather than almost everywhere.

**What it would give.** It converts this project's most repeated sentence into
a statement with two explicit sets on either side, and it tells a captain what
to stop commissioning: a sighting from any measure-theoretic field will return
this same disjointness, because the seed is countable-null by the same property
that makes the project's theorems applicable to it at all.

---

### 3.4 The brief's first question, answered: which theorems survive the loss of contraction, and why survival is orthogonal to reach

**The claim.** Contraction is not the binding constraint. Two of the field's
four main instruments survive its loss outright and one of those has its
hypothesis *verified* here; but every surviving instrument computes an
invariant of `G`, `G` is shared by every configuration in crystal 40's family,
and Portage's fence therefore refuses all of them — so the brief's first
question has an answer and the answer does not help.

**The dictionary.**

| The field's instrument | Its hypothesis | Verdict here |
|---|---|---|
| Nekrashevych limit space, `C*`-algebra, iterated monodromy | Contracting (finite nucleus) | **Dead** — `\|nucleus\| ≥ 526,563` (obstruction 11) |
| Bartholdi–Kaimanovich–Nekrashevych: bounded automata are amenable | *Bounded* activity, strictly stronger than contraction | **Dead, maximally** — every state of `E` is non-trivial, so activity is `2^n` |
| Kaimanovich's Münchhausen trick | A self-similar measure `μ` with `μ^x = (1−α)δ_e + αμ`. **Contraction is not among its hypotheses** | **Survives the loss of contraction, dies on the measure** (§3.1): there is one trajectory and no `μ` |
| Grigorchuk–Żuk spectra of Schreier graphs | Spherical (level-) transitivity of the action | **Survives, and the hypothesis holds**: `G` is level-transitive, orbit `= 2^n` for every `n ≤ 14` (measured) |
| Kesten's criterion, cogrowth | None on the group | **Survives**; computes a number attached to `G` alone |
| The lamplighter `Z/2 ≀ Z` from a 2-state automaton | — | The **control**: an amenable group generated by an unbounded automaton, so non-contraction forbids proofs, not conclusions |
| Every one of the survivors | — | Computes an invariant of `G`; `G` is the same automaton for every `X_b`; **cannot separate the seed from a periodic-centre-column counterfactual** |

**Seams.** (i) "Survives" above means "its stated hypotheses do not mention
contraction", which I checked by reading the hypotheses, not by rederiving the
proofs. (ii) The Schreier row is the one with real content and it is worth
saying what it buys and does not: the Schreier graph of `⟨q0⟩` on the orbit of
`δ|_n` is a **cycle**, of length `1, 2, 2, 4, 8, 8, 16, 32, 32, 64, 64, 64, 64,
64` for `n = 1..14` — which is the board's own list of right-diagonal minimal
periods, reproduced from the group action by code that shares nothing with the
board's diagonal engine. A cycle's spectrum is a cosine and carries nothing;
the interesting Schreier graph is the full `G`-one on `2^n` vertices, and the
centre column does not read it.

**What it leans on.** BKN, abstract fetched at
<https://arxiv.org/abs/0802.2837>: *"We show that the group of bounded
automatic automorphisms of a rooted tree is amenable, which implies amenability
of numerous classes of groups generated by finite automata."* The Münchhausen
trick's hypothesis and conclusion, fetched at
<https://arxiv.org/html/0904.0047>: *"if the measure μˣ is a non-trivial convex
combination μˣ=(1−α)δₑ+αμ, 0<α<1 of the original measure μ and the δ-measure at
the identity of the group (in which case we call the measure μ **self-similar**)"*
and *"Taken into account that 0<α<1, it is only possible if h(G,μ)=0, which
proves amenability of the group G"* — note that contraction appears in neither.
The Schreier-graph construction and its hypothesis, fetched at
<https://arxiv.org/html/math/0412412v2>: *"The vertices are the left cosets
Γ/P. The edge set is S×Γ/P. The edge (s,gP) goes from gP to sgP"*, with the
requirement that *"Γ acts spherically transitively on the Cayley tree"*.
**UNVERIFIED**: whether `G` is amenable. I did not find and did not attempt a
determination; `E` is not reversible, so the Aleshin–Vorobets free-group
machinery does not apply, and BKN does not either, which leaves the question
open as far as I can see. I searched arXiv for the automaton's enumeration
number (Portage's 5002 / orbit minimum 2369) and did not fetch the
classification tables, which is where an answer would be.

**The test.** `explorer/parallax11_speed.mjs` §C for level-transitivity and the
`⟨q0⟩`-orbit lengths; `parallax11_counter.mjs` §C for the counterfactual.
**To kill the verdict**: a theorem in this field whose conclusion is about a
distinguished orbit of the action rather than about the group or about a.e.
orbit.

**What it would give.** It answers the brief and it closes the vantage's
remaining hope in the honest direction: the obstacle is not that `G` is badly
behaved, it is that `G` is the wrong object. Band: **project-internal**.

---

### 3.5 The empirical step law is the section chain's stationary law, and its third entry is Prize 2

**The claim.** The one quantity this vantage would need before any of its
machinery could start — the law of the steps — is measurable, equals the
stationary law of the section chain under fair coins to three decimals, and its
third entry is the density of the centre column: so **the field's first
hypothesis about this object is this project's Prize 2**.

**The dictionary.**

| Rule 30 | This vantage | Measured |
|---|---|---|
| Density of black in the centre column | Frequency of the step `q2` | `0.500360` at `T = 200,000`; the board's own `0.500360` |
| Density of black in column 1 at the white times of column 0 | Frequency of `q1` among `{q0,q1}` | `0.250420` of the whole |
| — | Frequency of `q0` | `0.249220` |
| A fair coin driving the automaton | The section chain `g ↦ g\|_x`, `x` uniform, on `{q0,q1,q2}` | stationary law **exactly** `(1/4, 1/4, 1/2)`, solved by hand and confirmed by a coin control at `(0.250220, 0.249895, 0.499885)` |
| **Prize 2** | The step law's `q2`-weight tends to `1/2` | open |
| A self-similar measure in Kaimanovich's sense | Would have to be a measure on all of `G`, not on the three generators | seam |

**Seams.** (i) A step *law* is not a measure on `G`; the Münchhausen trick
needs the latter, and the generators being section-closed (`q0|_0 = q0`,
`q0|_1 = q2`, `q1|_0 = q0`, `q1|_1 = q2`, `q2|_0 = q1`, `q2|_1 = q2`) is
suggestive and is not the self-similarity condition. (ii) The agreement of the
empirical law with the stationary law is a restatement of "the centre column
and column 1 look like independent coins", which this project has measured
many times; it is evidence of nothing on its own, and the *control* is what
makes the row worth writing — the coin gives the same three numbers.
(iii) Prize 2 is about a limit and the measurement is at `T = 200,000`.

**What it leans on.** Nothing outside for the numbers. The definition of a
self-similar measure is the fetched quote in §3.4.

**The test.** `explorer/parallax11_walk.mjs` §D, `T = 200,000`, with the coin
control in the same run. **To kill it**: a step whose frequency is measurably
away from the stationary law at larger `T` — which, for the `q2` slot, would be
a refutation of Prize 2 and would be reported as such rather than as a note
about a walk.

**What it would give.** A conditional, and it is the only conditional this
vantage produces: **if Prize 2 were proved**, the walk would acquire the one
quantity the machinery starts from, and the question "is `(1/4,1/4,1/2)` the
restriction of a self-similar measure on `G`" would become askable rather than
idle. It would still not reach Prize 1, for §3.1's reason. Band:
**project-internal**, and the honest label for the row is a naming rather than
a result.

---

## 4. Died in translation

- **The vantage itself: "a walk that reads its own labels" as a new kind of
  random walk.** Died at the branching. `s_t = E^t|_{δ|_t}` depends on `t` and
  on nothing else, so for one configuration there is one trajectory; the steps
  are a read-out. Seam: a random walk is a measure on trajectories, and the set
  of trajectories here has one element.
- **"The walk is autonomous, so `s_t` determines the whole future centre
  column."** My own expectation going in, and it is false. Over every vertex of
  level `t` — which is crystal 40's whole family — the section `E^t|_v` fails to
  determine the last output digit from `t = 7` on: `2` of `63` ambiguous at
  `t = 7`, `10` of `231` at `t = 9`, `1,811` of `18,346` at `t = 16`, rising
  from `3.2%` to `9.9%` (`parallax11_auto.mjs` §A). The bit the walk has to
  import is `cell(t,1)` — column 1 — which obstruction 9 says is the entire
  content of the wall. The seam is exact and is the best single sentence in this
  document: **the group element forgets precisely the bit the wall is about.**
- **"The section determines the last letter of its vertex."** This is *true* —
  0 states with both in-letters, `t ≤ 16`, whole transducer and level-`t` slice
  alike — and I measured it first believing it was the autonomy question. It is
  not: for the seed the vertex is `1 0^{t−1}` and its last letter is `0` at
  every `t ≥ 2`, so the fact carries nothing. A true value with a wrong label,
  which is this project's recorded failure mode and my own notebook's.
- **"The positive monoid is free, so the walk is its own step word."**
  Freeness is true — exactly `3^t` distinct products for every `t ≤ 8`
  (exhaustive, minimal transducers), and `400` random positive words at each of
  lengths `10, 12, 14, 16` with `0` collisions — and the inference is false. The
  walk's word is built from *sections* of its steps and `q0|_0 = q1|_0 = q0`,
  so different step sequences share positions: `R(8) = 51` against `3^8 = 6561`.
  I had this as the document's headline for an hour. What caught it was asking
  what the `3^t` had been measured over.
- **"`R(t)` is polynomial."** Its first eight values are `3, 6, 9, 12, 18, 27,
  39, 51`, which reads as `≈ t²/1.3`. It is not: by `t = 15` the ratios are
  `1.250, 1.286, 1.289, 1.310, 1.303` and `R(t) ≈ 1.30^t`. Died by running the
  range out, which is the only thing that ever kills this shape of error.
- **"The image of `0^ω` determines the positive word"** — a cheap route to
  freeness. Dies at `t = 2`: `7` distinct images of `9` words. The two negative
  controls behaved (an automaton with two identical states gives `2` of `3`, the
  trivial one `1` of `3`), which is the only reason I believe the `7`.
- **`|s_t|`, the minimal transducer size, as a separating statistic.** Portage
  killed it across crystal 40's family; it is deader than that. Six i.i.d. step
  sequences — including non-realisable ones — give `3 7 17 35 71 141 272 519
  975 1794 …` against the seed's `3 7 16 35 71 141 272 517 971 1792 …`, never
  differing by more than `0.5%` and agreeing exactly from `t ≈ 13` on
  (`parallax11_auto.mjs` §B). The mechanism is now explicit: all `R(t)`
  reachable positions have transducer size inside a band of width `≤ 8`
  (`517…522` at `t = 8`, `32885…32893` at `t = 15`). This is obstruction 20's
  requested shape dying a fifth time, and the first time the null includes
  sequences no configuration can produce.
- **Word length, escape rate, transience.** `|s_t|_word = t` exactly for
  `t ≤ 8` by breadth-first search in the ball of `G` (spheres `6, 26, 110, 459,
  1912, 7940, 32954, 136493`): the walk is geodesic and escapes at speed `1`,
  the maximum. So do all four i.i.d. controls, at every length. Positive speed,
  non-recurrence and a non-trivial "boundary" are consequences of the positive
  monoid being free and are true of every walk of this shape — so the
  Kaimanovich–Vershik entropy criterion, which is what one would reach for, has
  nothing here to bite on.
- **The Grigorchuk–Żuk spectrum of the Schreier graph along `δ`.** The
  `⟨q0⟩`-orbit of `δ|_n` is a **cycle**, of length `1, 2, 2, 4, 8, 8, 16, 32,
  32, 64, 64, 64, 64, 64` for `n = 1..14` — which is the board's own list of
  right-diagonal minimal periods `P_k` at `k = n−1`, reproduced from the group
  action by code sharing nothing with the diagonal engine, and a cross-check I
  did not go looking for. A cycle's spectrum is a cosine. Died on the geometry
  rather than on a hypothesis.
- **"Aperiodic steps ⟹ aperiodic labels".** The only implication in this
  vantage that would have given P1. Dead at `b = (10)^∞`, obstruction 9's own
  witness: label period `2`, step sequence aperiodic. Corroborated here — in the
  second half of a `20,000`-row run, `2` distinct label factors of length 16
  against `20` step factors and `20` column-`−1` factors, where the seed gives
  `9,291` labels and `9,866` steps. (`20` is low, not `1`: obstruction 9's own
  description of that configuration is quasi-periodic punctured by defects, and
  it is obstruction 9 rather than this count that establishes the aperiodicity.)
- **Rotor-router / Eulerian walkers**, the one published field about a
  deterministic walk that reads its own trail. Dies on the geometry: the theory
  is built where the walk *returns*. Holroyd–Levine–Mészáros–Peres–Propp–Wilson,
  abstract fetched at <https://arxiv.org/abs/0801.3306>: *"We give a rigorous
  and self-contained survey of the abelian sandpile model and rotor-router model
  on **finite** directed graphs, highlighting the connections between them."*
  A free-monoid trajectory never returns and the graph is infinite, so
  recurrence, the abelian property and the sandpile group all have nothing to
  attach to.
- **Excited and self-interacting random walks.** Dies on the same seam as the
  vantage: the self-interaction there perturbs a *law*, and here there is none.
- **Amenability of `G` as a route.** Not pursued, deliberately, and recorded so
  that nobody spends a session on it: it is an invariant of the automaton, and
  the automaton is shared by every configuration in crystal 40's family, so
  Portage's fence refuses it before the difficulty matters. Whether it is known
  is **UNVERIFIED**: I fetched BKN's abstract (bounded automata, which `E` is
  not) and found nothing about unbounded non-reversible three-state automata; a
  determination would be in the classification tables of `arXiv:0803.3555`,
  which Portage recorded as unfetchable and which I did not retry.
- **Nothing died for lack of depth.** Every death above has a witness computed
  rather than searched for. The two things that nearly died for the opposite
  reason are in this list: `R(t)` looking polynomial over its first eight
  values, and the freeness result carrying a conclusion it does not support.

---

## 5. What to hand the theorist

**The honest answer first: I would not spend a theorist's session on either
connection, and the reason is §3.1.** The vantage's object is a single
trajectory, the field's theorems are about measures, and what survives computes
invariants of a group that crystal 40's family shares. A theorist sent here
would spend a session reproving Portage's fence in a new vocabulary. Band for
the whole document, stated first as the project asks: **project-internal** — it
closes a route and says nothing new about rule 30.

Two things are worth an hour each, not a session.

**Item 1 — the recoding, and the one free consequence.** The step sequence of
the self-driving walk is the pair `(column 0, column −1)` under a
letter-to-letter map in one direction and a width-2 sliding block in the other,
and therefore `not_isEventuallyPeriodic_pair` (proved) says the step sequence is
not eventually periodic, with no hypothesis. The claim to falsify is the
recoding itself: `u_t = q2 ⟺ centerColumn t`, and `column (−1) t = c(t+1) XOR
(c(t) OR [u_t = q1])`, measured 0 failures over 199,999 rows in both directions.
The dictionary row it depends on is §3.2's third. **What it must not become:** a
proposal. The statement is Jen in different letters, and a seeder should refuse
it as an equivalent restatement — it belongs in a captain's notes as a reading,
which is why it is here and not phrased as a node.

**Item 2 — two new terms for obstruction 21's list, free from this session.**
The minimal-transducer sizes of `E^t`, which obstruction 21 publishes to
`t = 20` (`…, 304714, 526563`), continue `m(21) = 906,525` and
`m(22) = 1,555,372` (`parallax11_auto.mjs` §B, ratios `1.7217`, `1.7157`,
continuing the published fall). Band: **nothing** — it extends a computed list
by two values. It is here because obstruction 21 explicitly says both sides are
cheap at `t = 21` and nobody had run it.

**What I would *not* spend a session on, adding to Portage's fence rather than
repeating it.** Amenability of `G`; its Poisson boundary; its spectral radius;
the Schreier spectrum; the escape rate; the word problem's cost. All of these
are invariants of `G` or of walks on it, and §3.1 and §4 show that every one of
them takes the same value for the seed and for `b = (10)^∞`, whose centre column
has period 2. Any future proposal of the form "measure *X* of the walk and show
it is different when the centre column repeats" is refused in advance by the
measurement in §3.1: at time `t` there are only `≈1.30^t` reachable positions and
their transducer sizes lie in a band of width `≤ 8`.

---

## 6. Next vantage

**Arithmetic dynamics' cycle-exclusion machinery: Baker's theorem on linear
forms in logarithms, Steiner's theorem on 1-cycles of the `3x+1` map, and
Simons–de Weger on `m`-cycles.** Four of my sightings have now ended at the
same wall from four directions — the field's theorems hold for almost every
point and the prize is about one named point — and the reason is always that
the field's object is a measure. That literature is the one I know of whose
theorems are about *one explicitly given orbit of one explicitly given map* and
whose conclusion is exactly "this orbit is not periodic, and here is why not":
it proves that the `3x+1` orbit of a specific integer cannot close up, by
turning "the orbit returns" into an exponential Diophantine equation and
bounding its solutions. This board already has the vocabulary such an argument
would need, and it is not the group's: `leftDiagonal_onset_le_iff_stepMod_return`
puts Prize 1's neighbourhood into the truncated row map `T_n(r) = (4r XOR (2r OR
r)) mod 2^n`, an explicit map on `n`-bit words whose orbit of `1` is the picture
and where "eventually periodic" is literally "the orbit returns". The question
to carry there: **does any technique that excludes cycles of an arithmetic map
survive the replacement of `+` by `XOR` and `×` by `OR`?** My guess is no, and
the guess is worth a document, because the answer names what the nonlinearity
costs — and obstruction 17 warns in advance that the T-map view has three times
produced a regularity that was the doubling staircase in disguise, so the first
thing to measure is where the analogy breaks rather than why it holds.

**The vantage I could not reach from where I stood** is the **classification of
three-state two-letter automaton groups** as an object to *read* rather than to
rederive. Portage located rule 30's edge automaton as number 5002 (symmetry
orbit minimum 2369) and could not fetch the tables; I did not retry, and
everything I have said about `G` — non-abelian, growth ratio `≈ 4.15`,
level-transitive, positive monoid free, not contracting, amenability unknown —
is a fingerprint computed here rather than a citation. Somebody with the paper
in front of them could settle in ten minutes what this session and the last one
could not: which of the ≤ 122 groups `G` is, and whether its amenability is
already in print. That is a lookup and not a session, and it should be done by
whoever next has library access rather than commissioned as a sighting.
