# Sighting — `centerColumn_other_isEventuallyPeriodic_of_center` from synchronizing automata, Černý-type bounds, and the transients of finite functional graphs

Connector: Gnomon. 2026-09-09.
Vantage: where TAILS are the object rather than cycles — synchronizing automata
and Černý-type bounds, the depth of a finite functional graph, Boolean networks
and interaction graphs, coalescence times, and the right null model for a
*triangular* map.

Scripts: `explorer/gnomon_null2.mjs` (null models, all 256 rules, the
exponential-tail witness), `gnomon_cascade.mjs` (the cascade bound),
`gnomon_families.mjs` (linear / monotone / acyclic), `gnomon_nonlin.mjs`
(depth against distance-from-affine), `gnomon_seedleaf.mjs` (where the seed sits
in the forest), `gnomon_check.mjs` (the two exact numbers §3.3 and §3.5 quote).
No Lean was needed: nothing here is a statement about the board's definitions
that was not already kernel-checked by Vernier.

---

## 1. The problem, seen from outside

Fix the map on non-negative integers

```
T(r) = (4·r)  XOR  ((2·r)  OR  r)
```

Bit `i` of `T(r)` reads only bits `i`, `i−1`, `i−2` of `r`, so `T` is
*lower-triangular*: for every `n` it descends to a self-map of `ℤ/2ⁿ`. A
self-map of a finite set is a **functional graph** — out-degree one at every
vertex, so it is trees hanging off cycles — and equivalently a **one-letter
deterministic automaton** on `2ⁿ` states. Iterate from `r₀ = 1` and write
`rₜ = Tᵗ(1)`, and let `B(t, k) = bit_k(rₜ)`.

Every **column** of that matrix is eventually periodic: for each fixed `k`, the
sequence `t ↦ bit_k(rₜ)` repeats from some point on, with a power-of-two period.
That is proved. What is unproved is the **diagonal**

```
c(t) = bit_t(rₜ)   =   1101110011000101…
```

— bit 0 of `r₀`, bit 1 of `r₁`, bit 2 of `r₂`, …. Measured to depth `10¹³` it
looks like a fair coin. The residual is exactly: **`c` is not eventually
periodic.** Nothing weaker is at stake.

The geometry of that readout is the whole reason this vantage was chosen, and it
is one measured number. Columns `0 … k−1` are all periodic from time `tail_k`,
and `tail_k / k` lies between `1.21` and `1.40` for every `100 ≤ k ≤ 600`, with
least-squares slope `1.246` (`gnomon_cascade.mjs`, exact preperiods; the board's
own measurements at `k ≈ 10⁵` give `1.34`, inside that range). The readout takes
column `t` at time `t`. So the diagonal runs at slope 1 through a wedge whose
boundary runs at slope `> 1.2`, and `tail_k ≥ k` for every `k` from 19 to 600
(`gnomon_check.mjs`): **the readout is strictly inside the pre-periodic part, by
a constant factor, for ever.** Every theorem about this object that anyone has is
about the part that has settled. The residual is a statement about the part that
has not.

Restated in the vantage's own vocabulary. For each `n`, `T mod 2ⁿ` is a
one-letter DFA on `2ⁿ` states; its functional graph has an attractor (the union
of the cycles) of size `A(n)` and a depth (the height of the tallest tree, i.e.
the least `D` with `T^D(Q) = T^{D+1}(Q)`, i.e. the length of the shortest word
driving every state into the eventual image) of `D(n)`. Measured here,
independently of the one previous measurement of them:
`A(n) = 4n − 18` for `8 ≤ n ≤ 22` and `D(n) ≈ 1.56 n`. The project's companion
wall (`leftDiagonal_onset_le`) is exactly `tail_n(1) ≤ 2n − 2`, a reset-threshold
bound **logarithmic in the number of states**. The residual is one floor above
it: it is not about the *height* of the trees but about the *content* of one
distinguished path through them, read one level higher at each step.

---

## 2. Fields sighted

| Field / theory | The object there | The seam, in one line |
|---|---|---|
| Synchronizing automata, Černý-type bounds | `T mod 2ⁿ` is a one-letter DFA; "a word driving every state into a fixed set" is `T^{D(n)}` | **Every bound in the field is polynomial in `\|Q\|`; here `\|Q\| = 2ⁿ` and the wall needs `O(log \|Q\|)`. The field's whole output is in the wrong currency, by an exponential.** |
| Boolean networks and interaction graphs (Robert, Thomas, Richard) | the row map is a Boolean network on `n` nodes; the wall is its transient length; Robert's theorem bounds it by `n` when the interaction graph is acyclic | rule 30's *local* interaction graph has a positive self-loop at bit `i` exactly when bit `i−1` is white; it is acyclic only at the all-black state |
| Conjunctive/disjunctive (monotone) Boolean networks; Boolean-matrix exponents; Wielandt | transient of an AND/OR network is the index of convergence of a Boolean matrix, `O(n²)` | rule 30's local rule is not monotone: `f(0,0,1)=1 > f(0,1,1)=0`, one line, and it is the whole seam |
| `F₂`-linear cellular automata; Fitting decomposition | rules 90 and 150 as truncated row maps: transient = nilpotency index `≤ n`, for free | `4r ⊕ (2r ∨ r) = (4r ⊕ 2r ⊕ r) ⊕ (2r ∧ r)` — rule 30 is rule 150 plus one quadratic term, and the term is the difficulty |
| Random mapping statistics (Flajolet–Odlyzko) | tail of a random map on `N` points is `Θ(√N)` | **the wrong null.** The object is a random *triangular* map, whose depth is `Θ(n)` — measured here. The "rule 30 is hyper-contracting" reading currently on the board is an artefact of comparing against a random map |
| Random Boolean networks (Kauffman `NK`) | transient length is the field's own primary measured object; `K = 2` polynomial, `K ≥ 3` exponential | those ensembles randomise the *wiring*; rule 30 has a fixed rule on a fixed path, which is neither ensemble, and the polynomial/exponential dichotomy is about connectivity rather than triangularity |
| Coalescing particle systems; coupling from the past (Propp–Wilson) | "time for all starts to couple" is literally `D(n)`; monotone CFTP proves coalescence from two extremal starts | the update is not monotone in any coordinatewise order, so the sandwich never closes; and CFTP's theorems are about *random* update rules, where there is something to average |
| Krohn–Rhodes / cascade (wreath) decompositions | a triangular map is a cascade of `n` two-state flip-flops; the tail is the time for every level to be reset | the reset condition is a function of the *state*, not of the letter, so there is no reset *word*; the general bound degenerates into the project's own reset lemma and no further |
| Basin-of-attraction fields of CA (Wuensche–Lesser) | precisely this object: the transient trees of an elementary CA's state-transition graph, drawn | the field is an atlas. It catalogues, measures and draws transient trees; it proves no bound |
| Max-plus algebra, transience bounds (Wielandt, Nachtigall, Hartmann–Arguelles) | the index of convergence of a matrix power sequence, bounded in `n` | those are `(max,+)`-linear systems; the `OR` is a max but the `XOR` is not a plus in any semiring I could find |
| Nilpotency and limit sets of CA (Kari) | "does the whole space collapse, and how fast" is undecidable in general | undecidability quantifies over rules; rule 30 is one rule and every finite truncation is decidable. What it does explain is why no *general* theorem exists to be borrowed |
| Succinctly represented automata | synchronization of automata given by circuits: PSPACE-hard, shortest reset words exponential in the presentation | the field's own verdict that `O(log \|Q\|)` reset bounds are not generic — which is the honest reason the wall is hard, not a route to it |
| Transformation semigroups: index and period of an element | the tail is the *index* of `T` in the full transformation monoid on `2ⁿ` points | the maximum index over an `N`-set is `N−1` and is attained; wrong currency again, from a third direction |
| Odometers and carry propagation | the explicit witness below: bits `0…n−2` an odometer, top bit held until it returns to zero | it is a perfectly good triangular map with tail exactly `2ⁿ⁻¹`, so **triangularity alone does not bound the tail at all** — the `O(n)` collapse is generic, not forced |

---

## 3. Connections

### 3.1 The null model is a random *triangular* map, and against it rule 30's collapse is not fast — it is slightly slow

**The claim.** The "polynomial collapse where a random map would be exponential"
that this vantage was sent to explain is not a property of rule 30 and carries no
information about it: **a uniformly random triangular map on `n` bits has
functional-graph depth `≈ n` and an attractor of `O(n)` states**, and rule 30's
depth `≈ 1.56 n` and attractor `≈ 3.9 n` sit *above* the null's mean, not below
it. The board's current reading — "`T` is not remotely random, it is
hyper-contracting", "no probabilistic null is available" — is an artefact of
comparing a triangular map against a *random map*, and it should be withdrawn.

**The dictionary.**

| Rule 30 / the board | The null model | Measured (`gnomon_null2.mjs`) |
|---|---|---|
| `T mod 2ⁿ` | a self-map of `2ⁿ` points, out-degree 1 | — |
| Depth of the functional graph `D(n)` | least `t` with `T^t(Q) = T^{t+1}(Q)` | rule 30: `5, 8, 11, 14, 16, 19, 22, 26, 29` at `n = 6,8,10,…,22`; slope `1.564` |
| Attractor size `A(n)` | the cyclic states | rule 30: `4n − 18`, exact for `8 ≤ n ≤ 22` (reproduces Vernier from an independent implementation) |
| Tail of the orbit of 1 | preperiod of one point | rule 30: `2,2,5,8,10,13,16,20,23`; slope `1.471` |
| **Wrong null**: a random map on `2ⁿ` points | tail and cycle both `Θ(2^{n/2})` | at `n = 31` that is `≈ 46,000` against a measured `39` — the factor that produced "hyper-contracting" |
| **Right null (B)**: random T-function, a fresh random radius-3 rule at each level | depth `≈ 0.67 n`, attractor `≈ 12 n` | `n = 20`: mean depth `13.95`, max over 60 draws `25`, mean attractor `240.9` |
| **Right null (C)**: random T-function, bit `i` a uniformly random function of all bits `≤ i` | depth `≈ n`, attractor `≈ 2.5 n` | `n = 20`: mean depth `19.67`, max over 60 draws `29`, mean attractor `49.3`; slope of mean depth `1.145` |
| Rule 30 against null (C) at `n = 20` | depth `26` against mean `19.67`, max `29` | rule 30 is **deeper** than a typical random triangular map — above the mean of 60 draws and below their maximum |
| Rule 30's attractor against null (C) | `62` against mean `49.3` | the same order; "an attractor of 114 out of two billion" is what triangularity alone produces |
| The wall's budget `2n − 2` | never violated by a random T-function | `0` of `60` draws exceed it at `n = 10, 14, 18, 20`, in both nulls |
| **The ECA ensemble (A)**: all 256 elementary rules as triangular maps | depth at `n = 18`: mean `15.05`, median `17` | rule 30's `22` ranks **41st deepest of 256** |
| **Seam 1** | 11 of the 256 elementary rules **exceed** `2(n−1) = 34` at `n = 18`: rules `151, 9, 121, 137, 185, 25, 111, 103, 73, 22, 110`, worst `47` (rule 151, `2.6 n`) | so the wall's budget is *not* a property of triangular maps or even of elementary rules; it is specific to rule 30, and it is not slack |
| **Seam 2** | triangularity does not bound the tail **at all** | explicit witness `(D)`: bits `0…n−2` a binary odometer, bit `n−1` held until the odometer returns to zero. Tail exactly `2ⁿ⁻¹`, verified at `n = 8,12,16,20,24,28` |
| **Seam 3** | the nulls are `O(n)` on *average*; rule 30's wall is a statement about *every* `n` | a null with mean `n` and fluctuations still fails a `2n − 2` bound at some `n` with positive probability — see §3.3, which is where this bites |

**What it leans on.** Only the measurement, which is the point: the previous
reading rested on a citation-free comparison to a random map. The random-map
figure itself is **UNVERIFIED** as to its constant — I could not fetch
Flajolet–Odlyzko, *Random Mapping Statistics*
(<https://link.springer.com/content/pdf/10.1007/3-540-46885-4_34.pdf> returned
an unparsable PDF; <https://link.springer.com/chapter/10.1007/3-540-46885-4_34>
redirects to an authorization endpoint), and I searched "Flajolet Odlyzko Random
mapping statistics expected tail length rho functional graph". The `Θ(√N)` order
is standard and the constant is not load-bearing here, because the whole claim is
that this null is the wrong one.

**The test.** Two, both cheap. First, extend nulls (B) and (C) to `n = 24` with
1,000 draws each and look for a draw with depth `> 2(n−1)`; if the null never
exceeds the budget even in a thousand draws, the wall is a *typicality*
statement and §3.3's criticality argument is wrong. Second, the falsifiable
statement for a theorist, which has no cellular automaton in it:

> the expected depth of a uniformly random 1-Lipschitz map `ℤ/2ⁿ → ℤ/2ⁿ` is
> `Θ(n)`, not `Θ(2^{n/2})`.

**What it would give.** It touches no part of the residual. What it removes is a
false signal: it says that no argument may rest on rule 30's collapse being
unusually fast, because it is not, and it restores the "a coin would do this
too" test that the board thought unavailable here. That test then immediately
does damage — §3.3.

---

### 3.2 Robert's theorem is the Černý-type theorem in the right currency, and rule 30 misses its hypothesis by exactly `n` self-loops

**The claim.** There *is* a theorem bounding the transient of a finite
deterministic system by `log₂` of its state count, with a hypothesis that is
checkable and almost satisfied: **Robert's theorem**, that a Boolean network
whose interaction graph is acyclic is nilpotent of class at most `n`. Rule 30's
row map is a Boolean network on `n` nodes whose interaction graph is a path
`i−2 → i`, `i−1 → i` **plus a self-loop at every `i`**, and the loop at `i` is
present exactly when bit `i−1` is white and cut exactly when it is black. The
project's reset lemma is that cut, in the field's own vocabulary; the onset wall
is the statement that all `n` loops get cut in `2n − 2` steps.

**The dictionary.**

| Rule 30 / the board | Boolean networks | Checked |
|---|---|---|
| Bit `i` of the row map | node `i` of a Boolean network `f : {0,1}ⁿ → {0,1}ⁿ` | `bit_i(T r) = bit_{i−2} ⊕ (bit_{i−1} ∨ bit_i)` |
| Left diagonal `k` | the time series of node `k` | definitional; kernel-checked by Vernier |
| **Global** interaction graph | arcs `i−2 → i`, `i−1 → i`, and `i → i` | `gnomon_families.mjs` |
| **Local** interaction graph at state `x` | the loop at `i` is present iff `bit_{i−1}(x) = 0` | exhaustive over the 8 local cases: the self-dependence survives exactly for `centre = 0` |
| Acyclic local interaction graph | only at states whose bits `0…n−2` are all black | immediate from the row above |
| `leftDiagonal_periodicFrom_step_of_black` (the reset lemma) | "the loop at node `k` is cut at this step" | same statement, different vocabulary |
| A white run on diagonal `k−1` | node `k` runs with its loop intact — a memory cell | this is why transients exist at all |
| Onset of diagonal `k` | the time at which node `k`'s loop is first cut after its drivers settle | the cascade of §3.3 |
| Robert's bound `n` | what the wall would get for free if the loops were absent | rule 30's depth is `1.56 n`, so it is over Robert's bound by `56 %` and under the wall's by `22 %` |
| Positive vs negative loop | rule 30's loop is **positive** (`bit_i(t+1) = bit_i(t) ⊕ drive`) at every state where it exists | if it were negative the node would be forced to alternate and there would be **no transient at all** — which is exactly why the *right* diagonals, where the analogous recurrence is a pure XOR accumulator, have no transients |
| **Seam 1** | Robert's hypothesis is about the **global** graph; rule 30's global graph has all `n` loops, so the theorem is simply inapplicable | there is no "mostly acyclic" version in the literature I could reach |
| **Seam 2** | the standard weakening is by **feedback vertex set** — bounds degrade with `\|FVS\|` | rule 30's FVS is all `n` nodes, so every FVS bound reads `2ⁿ` and says nothing |
| **Seam 3** | the loops are cut *by the state*, not by a letter | so there is no reset **word**: this is why the automata half of the vantage cannot see it and the network half can (see §3.4's currency argument) |
| **Seam 4** | Robert's theorem is about reaching a unique **fixed point**; rule 30's attractor is `4n − 18` states with cycles of length up to 16 in this range | so even with acyclicity the conclusion would be the wrong shape and would have to be re-proved for cycles |

**What it leans on.** Fetched, from *Simple dynamics on graphs*, arXiv:1503.04688
(<https://arxiv.org/html/1503.04688>):

> "if the interaction graph of f:A^n→A^n is acyclic then f is a nilpotent
> function of class at most n"

and, for the same theorem stated as a convergence result, arXiv:2309.11363,
*Robert's theorem and graphs on complete lattices*
(<https://arxiv.org/abs/2309.11363>):

> "automata networks with an acyclic interaction graph converge to a unique fixed
> point"

and, for the local/global distinction that makes the dictionary row above the
field's own language rather than mine, Richard, *Positive and negative cycles in
Boolean networks* (<https://ar5iv.labs.arxiv.org/html/2201.08600>):

> "The local interaction graph of f at state x, denoted Gf(x), is then the signed
> directed graph defined as follows: the vertex set is [n]:={1,…,n} and, for all
> i,j∈[n] (not necessarily distinct), there is a positive (resp. negative) arc
> j→i if fij(x) is positive (resp. negative)."

and

> "Finally, the global interaction graph of f, denoted G(f), is the union of all
> the local interaction graphs."

**UNVERIFIED**: that no bound on transient length exists in this literature for
networks whose only cycles are loops. I searched "Boolean network interaction
graph cycles only loops transient length bound positive loop convergence" and
"Robert theorem Boolean network acyclic interaction graph converges unique fixed
point n steps", and found fixed-point counting (the feedback bound, Thomas's
rules, Aracena) but no transient bound under that hypothesis.

**The test.** The statement a theorist should try to falsify, which is Robert's
theorem with the loops accounted for and is exactly what the measurement of §3.3
is about:

> for rule 30's row map, `depth(n) ≤ n + (the number of steps needed to cut every
> loop)`, and the second term is `O(n)`.

Concretely and in the project's own vocabulary: falsify **"between the settling
of diagonal `k−1` and the first black cell of diagonal `k−1` at or after that
time, at most `C` rows pass, for an absolute `C`"**. This is false as stated —
the maximum measured increment is 7 over `k < 600`, and four levels
(`k = 3, 8, 29, 400`) have **no** black cell ever, because their control diagonal
is eventually white. Those four are exactly the project's eventually-white
diagonals `2, 7, 28, 399` shifted by one, recovered here from the cascade alone.

**What it would give.** The onset wall, not the residual. What it gives
immediately, without any proof, is a name and a literature for the reset lemma,
and the knowledge that the only theorem in that literature which is in the right
currency needs acyclicity — so the whole content of the wall is the loop-cutting
time, and §3.3 says what that costs.

---

### 3.3 The wall's budget `2n − 2` is *exactly* the cascade's expected value, because the control bit is a fair coin — so no reset-style induction can ever close it

**The claim.** This is the sharpest thing in the document. Every reset-based
accounting the board has tried on the onset wall prices each level at a waiting
time for a black cell on the diagonal below: obstruction 6's reset front comes
out at `2.00 k`, Talus's version at `2.674 n`, and the Boolean-network cascade of
§3.2 — the cheapest of the three, because it is a per-level bound rather than a
front that must ride — at `1.96 k`. **The reason they cluster there is that a
settled diagonal's black cells have density `1/2`:** the wait for the first head
of a fair coin has mean 1, so a level costs `1 + 1 = 2` and the cascade costs
`2n`. The wall's budget is `2n − 2`. So even the cheapest reset accounting is not
loose by a constant a cleverer argument might recover — it is *critical*, and
over 600 levels it does come out **above** the budget. The wall is true only
because levels settle *before* their loop is cut, which happens at 596 of 599
levels and which no monotone per-level induction can see.

**The dictionary.**

| Quantity | Definition | Measured (`gnomon_cascade.mjs`, exact, `k ≤ 600`) |
|---|---|---|
| `tail_k` | preperiod of the orbit of 1 in `ℤ/2^k` — the wall's real content | `133, 259, 388, 501, 635, 755` at `k = 100,200,300,400,500,599` |
| `tail_k / k` | | `1.33, 1.295, 1.293, 1.2525, 1.270, 1.2604`; slope over `[100,600]` = **`1.246`** |
| `C_k` (the cascade bound) | `C_{k+1} = 1 + min{ t ≥ C_k : bit_{k−1}(r_t) = 1 }` | `186, 379, 582, 783, 975, 1164` |
| `C_k / k` | | `1.86, 1.895, 1.94, 1.9575, 1.95, 1.9432`; slope over `[100,600)` = **`1.9599`** |
| The budget | `2k − 2` | — |
| **`max_k C_k /(2k−2)`** | does the cascade fit inside the budget? | **no: `C_119 = 237` against a budget of `236`.** Exactly one `k` below 600 violates, which is what a critical sum looks like — a single excursion, not a trend |
| `max_k tail_k /(2k−2)` | does the truth fit? | `0.7396` at `k = 49` — comfortably |
| Why the cascade's slope is 2 | black density of the control bit at the arrival time | **`0.4993`** over 4,000 reads, `k ∈ [100,600)` |
| Increment histogram | `C_{k+1} − C_k` | `0:4  1:303  2:145  3:72  4:35  5:28  6:8  7:4` — a geometric with mean `1.945`, exactly a fair coin's `2` minus the four zeros |
| Levels settling **before** their loop is cut | `tail_k < C_k` | **596 of 599** (3 equal, 0 after) |
| The four zeros | levels whose control diagonal is eventually white — pure XOR accumulators, which settle with their driver and no delay | `k = 3, 8, 29, 400`: **the NKS period-doubling positions**, recovered from the cascade with no reference to the picture |
| **Seam 1** | the cascade is an upper bound and a *sum of mean-2 waiting times*; the budget is `2n`. A sum of `n` i.i.d. mean-2 variables exceeds `2n − 2` about half the time | so this shape of argument fails not by a constant but at the first fluctuation, for ever, at some `n` |
| **Seam 2** | the truth `1.25 n` is below `2n` only because of the 596 early settlings, i.e. because a diagonal can settle before its driver | which is obstruction 6's "skipped diagonals", and a monotone per-level induction structurally cannot represent it |
| **Seam 3** | the density `0.4993` is a *measurement* of the settled words, not a theorem; the board's balance conjecture (Prize 2) is about the centre column, not about diagonals | so the argument that the cascade is critical is itself conditional on a balance statement nobody has proved |

**A reconciliation, and it is a correction to a number the board carries.**
`talus4_margin.mjs` reports the wall's margin as "worst `pre(n)/(2n−2) = 0.8229`
at `n = 49`" and `pre(n) ≈ 1.34 n`. That script's `pre` is `lastDiff + 1` where
`lastDiff` is the last `t` with `rₜ ≠ r_{t−p}`, which equals `tail + p`, one full
period more than the preperiod. At `n = 49` the period is `8` and my exact
preperiod is `71`: `71 + 8 = 79`, and `79/96 = 0.8229` — the two agree to four
decimals, and the difference is entirely the definition. The wall as the board
actually states it (`leftDiagonal_onset_le_iff_stepMod_return`: the orbit point
at step `2k` already lies on a cycle) needs the **preperiod**, so the true margin
is `0.7396`, not `0.8229`, and the true growth rate is `1.25 n` at `k ≤ 600`
rather than `1.34 n`. The board's figure is conservative in the safe direction,
so nothing built on it is wrong; but a session trying to close a `26 %` gap
should know it is not an `18 %` gap. (The board's `1.34` is also measured at
`k ≈ 10⁵`, where obstruction 4's onset ratio is `0.33` rather than the `0.25`
that holds at `k ≤ 600`; both effects push the same way.)

**What it leans on.** Only the measurement and elementary probability. No
citation is claimed, and none is needed: the content is that two numbers the
project already has are the same number.

**The test.** For a theorist, falsify:

> `C_k ≤ 2k − 2` for every `k`, where `C_k` is the cascade above.

It is already false: `C_119 = 237 > 236`, the only violation below `k = 600`
(`gnomon_check.mjs`). One violation is enough — an induction that needs the
bound at every level is dead at the first — and the fact that there is exactly
one is the evidence that the failure is a fluctuation about a critical mean
rather than a systematic loss. The constructive half, and the topic I would
actually hand over, is in §5.

**What it would give.** It does not touch the residual. It explains obstruction
6 and Talus's `2.674 n` by a mechanism rather than by a measurement, and it tells
whoever attacks the onset wall next what their argument must contain: a term
accounting for levels that settle before their driver. Any argument without such
a term prices `n` levels at a fair coin's mean-2 wait, lands at `2n`, and the
budget is `2n − 2`.

---

### 3.4 Three families have a transient bound in `log |Q|`; rule 30 is outside all three, and one bit of nonlinearity is a cliff rather than a slope

**The claim.** Bounds of the shape the wall needs — transient `≤ poly(log |Q|)`
— do exist, in exactly three places: `F₂`-linear maps (Fitting: transient ≤ the
nilpotency index ≤ `n`), monotone/conjunctive networks (the index of convergence
of a Boolean matrix, Wielandt), and acyclic networks (Robert, §3.2). Rule 30 is
outside all three, by one identifiable term each. And the exit is a **cliff**:
among the 256 elementary rules, the 16 affine ones have depth `≤ n` with
equality attained, and every rule at Hamming distance `≥ 1` from affine is
unbounded by any function of that distance — the correlation between
nonlinearity and depth over 256 rules is `0.045`.

**The dictionary.**

| Family | The bound | Rule 30's exit | Measured (`gnomon_families.mjs`, `gnomon_nonlin.mjs`) |
|---|---|---|---|
| `F₂`-affine local rule | transient = nilpotency index `≤ n` (Fitting) | `4r ⊕ (2r ∨ r) = (4r ⊕ 2r ⊕ r) ⊕ (2r ∧ r)`: **rule 150 plus one quadratic term** | the 16 affine rules have max depth exactly `n` at `n = 8,12,16,20`: rules `51, 60, 195, 204` attain `8,12,16,20`; the 8 bijective ones (`85, 90, 102, 105, 150, 153, 165, 170`) have depth `0` |
| Monotone (conjunctive/disjunctive) | transient = index of convergence of a Boolean matrix, `O(n²)` by Wielandt | rule 30 is not monotone; the witness is one line: `f(0,0,1) = 1 > f(1,0,1) = 0` — i.e. **left-permutivity is anti-monotonicity** | the 15 monotone non-affine rules also have max depth exactly `n` at every `n` measured |
| Acyclic interaction graph | nilpotent of class `≤ n` (Robert) | `n` self-loops, cut only where the bit below is black (§3.2) | — |
| Rule 30 | — | — | depth `8, 14, 19, 26` at `n = 8,12,16,20`: `1.3 n` and rising to `1.56 n` |
| Nonlinearity `0` (16 rules) | | | max depth at `n = 20` is **`20 = n`** |
| Nonlinearity `1` (128 rules) | | | max depth `52 = 2.6 n` (rule 151) |
| Nonlinearity `2` (112 rules, includes rule 30) | | | max depth `51 = 2.55 n` (rule 9) |
| Correlation | nonlinearity vs depth at `n = 20`, 256 rules | | **`0.045`** — no relationship at all past the cliff |
| **Seam 1** | so "perturbed Fitting" — a bound degrading gracefully in the size of the nonlinear term — **does not exist**, and the measurement says why: the cliff is at the first bit | this kills the most attractive-looking route in the section |
| **Seam 2** | left-permutivity, the board's most-used structural fact, is exactly the property that puts rule 30 outside the monotone family | the two are the same fact with opposite signs, and this is worth knowing before someone tries a monotone argument |
| **Seam 3** | Wielandt's bound is `O(n²)`, not `O(n)`; even if rule 30 were monotone the bound would be `n²` against a budget of `2n` | so the monotone family would not have closed the wall even had the hypothesis held |

**What it leans on.** Robert as quoted in §3.2. **UNVERIFIED**: Wielandt's
bound `(n−1)² + 1` on the index of convergence of a primitive Boolean matrix, and
its application to conjunctive Boolean networks. I searched "conjunctive Boolean
network transient length exponent Wielandt bound dependency digraph monotone" and
reached three sources that would settle it —
`arxiv.org/pdf/0805.0275` (*The Dynamics of Conjunctive and Disjunctive Boolean
Networks*) fetched as unparsable PDF, `www.mdpi.com/2227-7390/8/6/1035` returned
HTTP 403, and `arxiv.org/abs/1405.3458` (*An Overview of Transience Bounds in
Max-Plus Algebra*, abstract fetched: "We survey and discuss upper bounds on the
length of the transient phase of max-plus linear systems and sequences of
max-plus matrix powers") confirms the *existence* of such a survey but does not
state Wielandt's constant on the page I could read. Fitting's lemma I claim as
standard algebra and did not fetch; the measurement above (affine rules,
depth exactly `n`) is the check that matters and it is mine.

**The test.** Falsify, over the 256 elementary rules:

> a rule's truncated row map has depth `≤ n` for every `n` **iff** its local
> function is affine or monotone.

Measured true at `n = 8, 12, 16, 20`: the 31 affine-or-monotone rules all have
depth `≤ n`, and rule 30 is the nearest miss at `1.3 n`. If a non-affine
non-monotone rule with depth `≤ n` at every `n` turns up, there is a fourth
family and it is worth finding.

**What it would give.** Nothing towards the residual. Towards the wall, it says
where *not* to look, with a measurement rather than a shrug, and it names the one
algebraic identity that a proof would have to exploit: rule 30 is rule 150 plus
`2r ∧ r`, and rule 150's truncated map has no transient at all.

---

### 3.5 No bound on tail *length*, from any field, can touch the residual — and the reason is one measured constant

**The claim.** The residual and the onset wall are not two statements about the
same object at different strengths. The wall is about the **height** of the
trees; the residual is about the **content** of one distinguished path through
them, sampled one level higher at each step. And the sampling line never leaves
the trees: the readout takes column `t` at time `t`, and columns `0 … t−1` are
not all periodic until time `tail_t`, which is between `1.21 t` and `1.40 t`
throughout the measured range. So every theorem this vantage can reach — Robert, Fitting, Wielandt,
Černý, the null models — is a statement about where the trees end, and the
residual is a statement about a path that is inside them at every time, for ever,
by a constant factor.

**The dictionary.**

| Rule 30 / the board | Functional-graph vocabulary | Measured |
|---|---|---|
| The centre column `c(t)` | `bit_t(rₜ)`: the readout climbs one level per step | — |
| The seed `r₀ = 1` | a **Garden-of-Eden state**: it has no preimage under `T mod 2ⁿ` for any `n ≥ 2`, so the orbit starts at the top of a tree | verified `n = 4…22` (`gnomon_seedleaf.mjs`); by hand: `bit₀(Tr) = bit₀(r)` and `bit₁(Tr) = bit₀(r) ∨ bit₁(r)`, so `T(r) = 1` needs `bit₀ = 1`, which forces `bit₁(Tr) = 1 ≠ 0` |
| Garden-of-Eden density | `0.4375, 0.6055, 0.7121, 0.7359` at `n = 4, 8, 16, 22` | rising toward `≈ 3/4`, the complement of the 4-to-1 image density |
| The seed's depth in its tree | `tail(1)` | `2, 2, 5, 8, 10, 13, 16, 20, 23` at `n = 6,…,22` — the seed is **not** the deepest leaf |
| The deepest leaf | `r = 9`, at every `n` from 5 to 22 except `n = 11` (where it is `57`) | independent confirmation of Vernier's §3.1 seam 1, from code sharing nothing with his |
| The transient wedge | `{(t,k) : t < tail_k}` | `tail_k/k ∈ [1.2135, 1.3981]` for `100 ≤ k ≤ 600` (min at `k = 445`, max at `k = 108`), least-squares slope `1.246`; the board's measurements at `k ≈ 10⁵` give `1.34`, inside that range |
| The readout line | `t = k`, slope `1` | — |
| **The one constant** | the wedge's slope exceeds `1` | `tail_k ≥ k` for **every** `k` from 19 to 600; the last failure is `k = 18`, where `tail = 16`. So the readout is strictly inside the pre-periodic region at every `k` past 18 |
| What would change if the constant were `< 1` | the readout would eventually read *settled* values, and `centerColumn` would coincide with `settledCenter` — a point of the inverse limit of the attractors, whose orbit closure is a 2-adic odometer | this is the counterfactual that shows the constant is the whole obstruction |
| **Seam 1** | every theorem in every field sighted bounds the wedge boundary from **above**; the residual needs to know what is *inside* | and an upper bound can never push the boundary below slope 1, because the measurement says the boundary *is* above slope 1 — so no strengthening of the wall, however good, reaches the readout line |
| **Seam 2** | the useful direction is a **lower** bound, `tail_k ≥ k`, which is the opposite of what everyone is trying to prove | and it is measured true, so proving it would confirm the obstruction rather than break it |
| **Seam 3** | the residual is about one path among `2ⁿ − A(n)` tree states; no field sighted has a name for a *distinguished path* in a functional graph's forest | Vernier reached the same seam from the T-function side; I confirm it from this side, which is weak evidence that it is real and not a failure of either search |

**What it leans on.** The measurements above and nothing external. The
Garden-of-Eden vocabulary is standard in the CA literature and is the object of
Wuensche and Lesser's atlas; **UNVERIFIED** as to that book's contents — it is
not held in `sources/`, I reached only bookseller and review pages, and I did not
fetch a quotable statement of what it proves. What I can say from the review
pages I did reach is that it is an *atlas*: it computes and draws basins of
attraction and their transient trees for elementary rules, which is precisely
this object, catalogued rather than bounded.

**The test.** For a theorist, and it is cheap to state and hard to prove:

> `tail_n(1) ≥ n` for all `n` — i.e. the orbit of `1` under `T mod 2ⁿ` has not
> reached its cycle by step `n`.

Measured true for every `n` from **19** to 600, and false below that — the last
failure is `n = 18`, where `tail = 16` (`gnomon_check.mjs`). A proof would say that the centre column never reads a
settled value, which pins the residual permanently inside the transient and
closes, with a theorem rather than a measurement, every route that hopes to reach
`centerColumn` through the settled region. A *disproof* — infinitely many `n`
with `tail_n(1) < n` — would be far more valuable: at those `n` the readout is
settled, and the residual becomes a question about `settledCenter` and the
odometer, which is a far more constrained object.

**What it would give.** It is the only connection here that is about the residual
rather than the wall, and what it gives is a boundary rather than a route: it
converts "the tails are where the residual lives" from a remark into a measured
constant with a falsifiable statement attached. What would remain is all of the
residual.

---

## 4. Died in translation

Each of these got a dictionary attempt and broke at a named row.

1. **Černý's conjecture and the whole synchronizing-automata literature, on
   currency.** Fetched, from arXiv:2508.15655 (<https://arxiv.org/html/2508.15655>):
   "The minimum length of reset words for A is called its reset threshold and
   denoted by rt(A)" and "The Černý conjecture asserts that the reset threshold
   of every synchronizing automaton with n states does not exceed (n−1)²"; the
   best general bound is, from arXiv:2407.08135
   (<https://arxiv.org/html/2407.08135>), "c n³ + o(n³), where the coefficient c
   is close to 0.1654". **Every one of these is polynomial in the number of
   states.** Here the number of states is `2ⁿ` and the wall needs `2n − 2`, which
   is `2 log₂|Q| − 2`. A cubic bound in `|Q|` is `2^{3n}`. The field cannot
   express the question, let alone answer it, and this is not a gap in the field
   — it is what the field is for. **This is the vantage's central negative and I
   would put it first.**
2. **`T mod 2ⁿ` as a synchronizing automaton at all.** It is not synchronizing:
   its image stabilises at `4n − 18` states, not one. The correct notion is the
   *index* of `T` as an element of the full transformation monoid, whose maximum
   over an `N`-set is `N − 1`. Same currency problem from a second direction.
3. **One-letter (unary) automata as a special class with better bounds.** A
   unary automaton *is* a functional graph, so "the theory of unary synchronizing
   automata" and "the theory of functional graphs" are the same subject, and the
   reset threshold is the maximum tail length, at most `|Q| − 1` and attained by
   a path. **UNVERIFIED** as a literature claim: a search summary asserted "for
   every unary synchronizing automaton, its reset threshold is strictly less than
   the number of states", but I could not fetch a source saying it — the survey I
   did fetch contains no sentence about unary automata. I searched "unary
   automaton one-letter synchronizing reset threshold functional graph". The
   elementary argument above is mine and is two lines.
4. **Succinctly represented automata as the escape from the currency problem.**
   The right question is whether there are reset bounds polylogarithmic in `|Q|`
   for automata given by circuits. The literature's answer, as far as I could
   reach it, is that synchronization of succinctly represented automata is
   PSPACE-hard with reset words exponential in the presentation —
   **UNVERIFIED**, I did not fetch a source and searched only once. If true it is
   not a route; it is the reason there is no route.
5. **Monotone coupling from the past (Propp–Wilson).** "Time for all starts to
   couple" is literally `D(n)`, and monotone CFTP proves that coalescence of all
   `2ⁿ` starts follows from coalescence of two extremal starts — the exact
   sandwich the all-starts form of the wall would want. It needs the update to be
   monotone for a partial order, and rule 30's local rule is not monotone
   (`f(0,0,1) = 1 > f(1,0,1) = 0`, §3.4). Worse for the analogy: CFTP's theorems
   are about *random* update rules, where coalescence time is bounded via mixing;
   `T` is one deterministic map and there is nothing to average. Died at the
   first hypothesis and again at the second.
6. **Coalescing random walks and interacting particle systems.** The brief asked
   whether "time for all starts to couple" is ever *proved* rather than measured
   there. It is — for coalescing random walks on a torus, via duality — but every
   such theorem is about a stochastic system whose coalescence is driven by
   independent randomness, and the quantity proved is an expectation over that
   randomness. `T` supplies no randomness, and §3.1's finding is precisely that
   the "randomness" one would want to invoke is *typicality over triangular
   maps*, which is a statement about the ensemble and not about rule 30. I could
   not build a row that survived this, and I record it as the brief's third
   question answered in the negative.
7. **Krohn–Rhodes / cascade decomposition.** A triangular map is a cascade of `n`
   two-state flip-flops, and the tail is the time for every level to be reset —
   which is the right shape and the right currency. It dies because the reset at
   level `i` is triggered by the *state* of level `i−1`, not by the input letter,
   so there is no reset word and the general bound degenerates into "sum the
   first-reset times", which is §3.3's cascade and is exactly critical. The
   decomposition is correct and gives nothing beyond what the project already
   had; that is why it is here and not in §3.
8. **"Perturbed Fitting": a transient bound degrading in the size of the
   nonlinear term.** The most attractive idea in the document, and dead by
   measurement: over 256 rules the correlation between distance-from-affine and
   depth is `0.045`, and one bit of nonlinearity already permits `2.6 n`
   (rule 151). The cliff is at the first bit.
9. **Max-plus / tropical transience bounds.** `OR` is `max` and the machinery of
   transience bounds for `(max,+)` systems is exactly about the index of
   convergence. But `XOR` is not `+` in any semiring — it is not even
   monotone — so rule 30's map is not `(max,+)`-linear and not `(max,×)`-linear.
   One operation wide, and it is the same operation that kills the `F₂[[x]]`
   reading from the other side.
10. **Random Boolean networks (Kauffman `NK`).** The one field where transient
    length is the primary measured object. Its dichotomy is about *connectivity*
    (`K = 2` polynomial, `K ≥ 3` exponential) over an ensemble that randomises
    the wiring; rule 30 has `K = 3` on a fixed path with a fixed rule, which is
    in neither ensemble, and §3.1 shows the relevant structural parameter is
    triangularity rather than `K`. **UNVERIFIED** as to the `K = 2` / `K ≥ 3`
    dichotomy, which I did not fetch.
11. **Kari's undecidability of nilpotency as an explanation for the literature's
    silence.** Appealing and not usable: undecidability quantifies over rules,
    and rule 30 is one rule whose every finite truncation is decidable by
    enumeration. It explains why no *general* theorem exists to borrow and says
    nothing about whether a rule-30-specific one does. **UNVERIFIED**: I could
    not fetch a quotable abstract (`semanticscholar.org` returned an empty page)
    and searched "Kari nilpotency problem one-dimensional cellular automata
    undecidable 1992".
12. **"Tails of Lipschitz Triangular Flows" (arXiv:1907.04481).** The one paper
    whose title is literally this vantage's two keywords. Fetched
    (<https://arxiv.org/abs/1907.04481>): "We investigate the ability of popular
    flow based methods to capture tail-properties of a target density…". Its
    "triangular" is the same triangular-dependency structure — each coordinate a
    function of the previous ones — but over the reals and as a transport map,
    and its "tails" are the tails of a probability density. Two words, both false
    friends. Recorded so the next connector does not spend the fetch.
13. **"Somebody has bounded the tails of a random triangular map."** Asked
    plainly, as the brief instructs, and I could not find it. The T-function
    literature answers bijectivity and transitivity (Vernier established this);
    the random-mapping literature answers random maps; the Boolean-network
    literature answers fixed points and acyclic transients. I found no statement
    of the form "the expected depth of a random 1-Lipschitz self-map of `ℤ/2ⁿ`
    is `Θ(n)`", which §3.1 measures. Searched: "random triangular map T-function
    compatible map Z/2^n expected preperiod transient length theorem random
    1-Lipschitz". A negative search result, not a novelty claim: four searches
    and one held corpus.
14. **The one attempt at the residual through the attractor.** If `tail_k < k`
    even at sparse `k`, the readout would be settled there and `centerColumn`
    would agree with `settledCenter` at those times, moving the residual onto the
    inverse limit of the attractors. It fails at every `k` from 19 to 600, by the
    measured slope `1.246`. Kept as §3.5's test rather than deleted, because the failure
    is a number and the number is the obstruction.

---

## 5. What to hand the theorist

**Topic A — the cascade is exactly critical, and here is the term a working
argument must contain (from §3.3).** Falsify:

> `C_k ≤ 2k − 2` for every `k`, where `C_1 = 0` and
> `C_{k+1} = 1 + min{ t ≥ C_k : bit_{k−1}(rowNat t) = 1 }`.

It is **false**: `C_119 = 237 > 236`, and that is the only violation below
`k = 600` (`gnomon_cascade.mjs`, `gnomon_check.mjs`, exact).
The dictionary row it depends on is the local-interaction-graph row of §3.2 —
bit `k`'s self-dependence is present exactly when bit `k−1` is white — which is
the reset lemma the board already has, restated. What makes this worth a session
is not the falsification but the *reason*: the control bit's black density is
`0.4993`, so the cascade's slope is `2` by a law of large numbers and the
budget's slope is `2`. Every reset-style induction on this board — obstruction
6's front at `2.00 k`, Talus's `2.674 n`, this one at `1.96 k` — is the same sum
of mean-2 waiting times, and the wall's budget is that sum's mean. **The
conclusion to hand over is that no argument of this family can work at any
constant, and that the gap between `1.25 n` (truth) and `2 n` (cascade) is
entirely the 596-of-599 levels that settle before their driver's loop is cut.**
The theorist's job is to find a statement that prices those early settlings. In
the project's vocabulary that is obstruction 6's "skipped diagonals settle at
indices below their drivers' onsets", which is measured and unexplained; in the
Boolean-network vocabulary it is "a node whose loop is intact can still be
forced, because its two drivers agree". The second phrasing is new here and is
the one I would put in front of someone.

Ship with it the arithmetic correction of §3.3: the board's `1.34 n` and
`0.8229` are `tail + period`, and the wall needs the preperiod, which is `1.25 n`
and `0.7396`. Verified by reproducing `talus4_margin.mjs`'s own number:
`71 + 8 = 79`, `79/96 = 0.8229`.

**Topic B — retire "rule 30's collapse is anomalously fast" (from §3.1).**
Falsify:

> the depth of the functional graph of a uniformly random 1-Lipschitz map
> `ℤ/2ⁿ → ℤ/2ⁿ` is `Θ(n)`, and rule 30's depth is not below it.

Measured: mean depth `19.67` and max-over-60-draws `29` at `n = 20` for the
random T-function; rule 30's is `26`. The dictionary row it depends on is the
first one — that `T mod 2ⁿ` is a triangular map, which is definitional. This is
a smaller session than A, and I would only spend it because a wrong null is
currently carried on the board as a positive finding ("`T` is not remotely
random, it is hyper-contracting"; "no probabilistic null is available for
anything about `T`'s graph"), and a wrong null in this project's history has
been expensive. The cheap version is one script and an hour.

I would spend the session on **A**. It is the one item here that closes a family
of attempts on a wall the board is actually holding, and it does so with an
explicit counterexample and a mechanism rather than a measurement.

I would spend **no** session on the synchronizing-automata literature. Its
theorems are polynomial in `|Q| = 2ⁿ` and the wall needs `2 log₂|Q|`; that is not
a hard search, it is a category error, and §4.1 is the whole answer to the
brief's first two questions.

---

## 6. Next vantage

**The combinatorics of the settled words as words — specifically, gap statistics
and the covering time of a shifting window.** Everything in this document reduces
the onset wall to one question that is not about automata at all: after diagonal
`k−1` has settled, how long until it shows a black cell? The answer is a waiting
time in a `2^d`-periodic binary word, and the wall is the statement that a sum of
`n` such waiting times stays below `2n − 2`. That is a question for whoever knows
the theory of *gaps in shifted binary words*, *covering systems*, or the
combinatorics on words of low-complexity sequences: the settled words are not
random, they are an orbit of an explicit in-degree-one map on period-`L` words
(Rowland's, and the board's `forbit.mjs`), and the whole content of the wall is a
correlation between where the cascade arrives and where that word's black cells
are. My measurement says that correlation is `0.4993` — indistinguishable from
none — which is why the bound is critical; a field that can prove a *negative*
correlation, however small, closes the wall, and a field that can prove there is
none closes it in the other direction and says the wall is false at some `n`.
Nobody has looked at the settled words as words, with their gap distribution as
the object.

The one I could not reach from where I stood: **the ergodic theory of
first-passage times for a skew product over an odometer.** The settled region is
an odometer (Vernier's §3.6, and the board's crystal 47); the cascade is a
first-hitting time for the set "black" along that odometer's orbit, with the
hitting set changing as the level rises. That is a Kac's-lemma-shaped question —
mean return time to a set of measure `1/2` is `2`, which is precisely the
constant that makes the cascade critical — and a theorist who knows the ergodic
theory of odometers might be able to say whether the *fluctuations* of that
return time around `2` are bounded, which is exactly and only what the wall
needs. I can see that the constant `2` is Kac's lemma and I cannot see whether
the fluctuation statement is a known kind of theorem. Somebody who works on
Birkhoff sums over rotations and odometers would know in an hour whether it is,
and that hour is worth more than any further measurement of this map.

A third, weaker suggestion, offered because it is the only route to the
*residual* rather than the wall that I could see from here: **distinguished paths
in the forest of a functional graph.** The residual is a statement about the
content of one path through the trees of `T mod 2ⁿ`, read at level `t` at time
`t`. Vernier reported no field with a name for that; I reached the same
conclusion from the synchronizing/coalescence side. Two independent searches
finding nothing is not proof of absence, but it is enough that the next connector
should be told the object rather than asked to find the field: the object is a
Garden-of-Eden state, its orbit, and the sequence of *levels at which the orbit
is still unsettled* — and the residual is a property of the diagonal of that.
