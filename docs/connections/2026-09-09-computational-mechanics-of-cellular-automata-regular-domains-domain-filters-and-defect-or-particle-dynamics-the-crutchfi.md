# Sighting: the transient band as a defect gas, and the front as a domain wall

**Vantage.** Computational mechanics of cellular automata — regular domains,
domain filters, and defect/particle dynamics: the Crutchfield and Hanson
programme, applied to the transient band rather than to the settled region.

**Connector.** Alidade, 2026-09-09. Nothing here is a proof. A connection is a
sighting: a direction for a prover to walk, and a dictionary whose rows can be
checked one at a time. Scripts are under `explorer/alidade_*.mjs`; every number
says which script produced it and at what depth.

**The headline, so a captain does not have to read to §3.1 for it.** The vantage
asked whether the front's death rate can be bounded below by the domain's own
statistics. It can. There is an exact three-cell law, a consequence of
`rule30_eq` alone and checked by the Lean kernel, that decides whether the
front's leading cell survives; the settled background decides it on 76.9% of
rows, and one settled triple forces a retreat outright. Feeding that law and the
advance law together into the leftmost trajectory the background permits gives a
speed of **0.4531 cells per row — below the 1/2 the onset wall needs** — where
the advance law alone gives 0.5013, the number the previous sighting called the
exact ceiling of what the background can prove. Four independent backgrounds
give 0.4503 to 0.4534. That is a bound of the kind crystals A3 and the sixth
obstruction say is unavailable, and it is a measurement of a deterministic walk,
not a theorem; §3.1 says exactly what would have to be shown to make it one.

**On sources.** Rosetta handed this field on as an address, having been unable to
fetch a readable copy (403 from the publisher, a binary PDF from the author's
site, a 404 on the abstract page). **The primary source is now fetched and
quotable.** `WebFetch` on `https://csc.ucdavis.edu/~cmg/papers/ECA54.pdf` returns
the paper and the harness saves the bytes to disk; the summarising model cannot
read a PDF, but `explorer/alidade_pdftext.mjs` inflates the content streams and
recovers the text (15.1% of its long words are common English, against 1.7% for a
PDF with no text layer). The recovered text is `explorer/alidade_eca54.txt` and
every quote below is from it, with the fetched URL beside it. The extraction is
lossy on symbols — it renders `Λ` as `A` and `Φ` as `¥` or `~P`, and it has one
typo of its own (`dyanmic`) — so quotes are given as recovered, with the intended
symbols named. Two companions did **not** come out: `TurBases.pdf` fetches but has
no text layer at all (0 characters recovered — it is a scan), and Springer's
abstract pages redirect to an authorisation endpoint. Those stay UNVERIFIED and
say so where they are used.

---

## 1. The problem, seen from outside

An infinite row of cells, each black or white, indexed by the integers, is
updated in lock-step: a cell's new colour is *left* XOR (*centre* OR *right*).
Start from a single black cell in an otherwise white row and stack the rows down
the page. Read one bit per row — the colour of the cell directly beneath the
seed — and ask whether that infinite binary sequence eventually repeats. It does
not, to every depth anyone has computed, and nobody can prove it. (The board
states the question as an implication, "if the centre column repeats then some
other column repeats", but a proved theorem says no two distinct columns can both
repeat, so hypothesis and conclusion are incompatible and the implication is
logically equivalent to "the centre column never repeats". There is no weaker
statement hiding inside it.)

What is granted, and what is not. Far to the left of the seed the picture has
settled: read along any of the down-left diagonals and you find, after a
transient, a periodic word whose period is a power of two and grows without
bound as you go inward. Those settled words assemble into a second, idealised
picture — call it the **background** — which is itself an evolution of the same
rule and which the real picture agrees with everywhere left of a moving seam.
Right of the seam is a wedge in which the real picture and the background
disagree; the wedge's right edge runs at exactly one cell per row, and its left
edge — the seam — runs at a measured 0.243 cells per row over a million rows and
is not known to run at any rate at all. Almost everything the project has proved
is about the settled part; the centre column lives at the wedge's other edge, in
the part that has not settled. The residual, restated: **bound the speed of the
seam.** The project's onset wall is exactly the statement that the seam never
exceeds one half of a cell per row, and the previous sighting from the
growth-process vantage established that everything the background can prove using
the advance rule alone tops out at 0.50106 — on the wrong side of a half by one
part in a thousand.

**Restated in this vantage's own terms.** Computational mechanics reads a
space-time diagram as a *background* plus a *gas of defects*. The background is a
**regular domain**: a set of configurations recognised by a finite automaton,
mapped onto itself by the rule in some finite number of steps, and spatially
homogeneous. A **domain filter** is a finite-state transducer that reads a
configuration left to right and writes a `0` wherever a site participates in the
domain and a distinct non-zero symbol wherever it does not; what survives the
filter is the defect field. A defect whose width stays bounded and whose
domain–defect–domain pattern is temporally periodic is a **particle**; particles
have rational velocities, obey a reaction table, and — in the one elementary rule
where this has been carried through stochastically, rule 18 — behave as diffusing
particles that annihilate on contact, so their density decays. The question this
vantage was sent to answer: **is the seam the leftmost particle of such an
annihilating system, and can the rate at which the leading particle dies be
bounded below by statistics of the domain alone?** If it can, the missing 0.09 —
the gap between the white density the front sees, 0.588, and the 1/2 the wall
needs — is a death rate, and death rates are the one thing this literature
computes.

---

## 2. Fields sighted

| Field or theory | The object there that matches something here | The seam, in one line |
|---|---|---|
| Computational mechanics of CAs — regular domains (Crutchfield–Hanson) | the settled background is a regular domain of temporal period `2^n` and spatial shift `2^n`, exactly (§3.2) | the definition demands **one finite** period `p`; here `p` doubles at diagonals 3, 8, 29, 400, 87867, 2107985255, so no `p` works for all time |
| Domain filters (finite-state transducers) | `E = picture xor S` is the filtered field, already computed by the project | a CM filter is an FST reading **one row, left to right**; measured, the two phases have the same row language — all 16384 words of length 14 occur in both, over 5.5·10^8 and 1.2·10^8 windows — so no such filter finds the seam (§3.3) |
| Particles (the paper's own definition) | the seam is a wall between two domains, and it is narrow: the deviation density is back to 1/2 three cells behind it | a particle needs bounded width **and** temporal periodicity; the leading block's length distribution has a geometric tail with no cutoff, and the velocity 0.243 belongs to no period |
| Defect gas / annihilating diffusive particles (rule 18) | band cells as particles that meet and annihilate | measured: rule 18's defect density falls as `t^(-0.527)`; rule 30's band deviation density is 0.50005 at every depth from 16 to 96 cells behind the front and does not decay. No dilute limit, so no gas (§3.4) |
| Reaction–diffusion `A + A → 0` (Bramson–Griffeath, Arratia) | "two transients meeting in a single `\|\|`", 68% of last-transient deaths in `explorer/maskfront.mjs` | that table is about the last transient of a *diagonal*, not about the front; at the front the death is domain-decided on 76.9% of rows (§4) |
| Reachable-set dynamic programming / nondeterministic automata | the set of positions the front could occupy under the background's constraints | this is the row that pays: it is what turns the survival law into a number, and it is not a percolation object at all (§3.1) |
| Ergodic optimisation, max-mean-cycle (Karp) | the worst-case speed of the DP over all admissible backgrounds | the DP's *state* graph is finite even though the background's orbit is not, so the max-plus route Rosetta closed is open again on a different graph (§6) |
| Shock waves, Rankine–Hugoniot conditions | the seam as a shock between phases of different entropy density | measured, the two phases' row entropies are 0.99743 and 0.99999 bits per cell; there is no jump for a shock condition to balance |
| Toom's eroder theory, stability of monotone CAs | the seam's retreat is *erosion* of the deviation set, and Toom computes erosion rates | Toom needs a monotone (attractive) rule; rule 30 is left-permutive, so flipping the left input always flips the output |
| Sofic shifts, follower-set complexity (Lind–Marcus) | a regular domain is a transitive sofic subshift | the background's row language is (measurably) the full shift, so the only sofic domain containing it is the trivial one, whose filter flags nothing |
| Rule 110's glider catalogue (Cook), particle computation | a catalogue of particles is what makes a CA's behaviour describable | rule 30 has no gliders and exactly one wall — a population of size one, and annihilation needs two |
| ε-machines, statistical complexity, causal states | the centre column as a process; "eventually periodic" = "a single cycle of causal states" | a single deterministic orbit carries no measure, and CM's two coordinates put a fair coin and a periodic sequence *both* at low complexity — the discriminator is entropy rate, and there is no theorem from a measured entropy rate to aperiodicity (§3.5) |
| Cellular transducers (this literature's own escape hatch) | the filtered rule 30 band | the source itself says filtered behaviour of an arbitrary CA "often can be described only by a strictly more computationally complex class of spatial processes called cellular transducers" — a class with no theorems we can use |
| Dislocation theory in crystallography — Burgers vectors, topological charge (**the unlikely entry**) | the branch points at the eventually-white diagonals, where the background's period doubles and one bit is chosen | a Burgers vector is conserved and additive; the branch bit here is inherited from the seed by every configuration white far to the left and is conserved by nothing |
| Queueing theory, Lindley's recursion | `F(t)` as a walk reflected by service times drawn from the background | the service times are read at the walker's own position, so the recursion is not autonomous and there is no stationary equation to solve |

---

## 3. Connections

Common notation. `S` is the settled picture (crystal 47), `S(t, x) = S_{t+x}(-x)`
where `S_k` is the settled word of left diagonal `k`; `E = picture xor S` is the
transient band; `F(t) = min { x : E(t, x) = 1 }` is its left front;
`κ(t) = t + F(t)` is the diagonal the front sits on. Crystals A2 gives the
advance: **`F(t+1) = F(t) − 1` exactly when `S(t, F(t) − 1)` is white.**

### 3.1 The front's death is half-written in the background, and that half is enough

**The claim.** The front's death obeys an exact three-cell law that follows from
`rule30_eq` alone; the settled background decides it outright on 76.9% of rows,
and one settled triple forces a retreat with no reference to the band at all. The
leftmost trajectory the background permits under that law *together with* the
advance law runs at **0.4531 cells per row**, below the 1/2 that
`leftDiagonal_onset_le` needs, where the advance law alone gives 0.5013 — so the
previous sighting's ceiling was not the ceiling, it was the ceiling of half the
local law, and the "missing 0.09" that it said had no representation in the
settled region has one.

**The law.** At the front, the cell to the left agrees with the background (it is
left of the leftmost deviation) and the cell at the front is its complement.
Writing `Cs = S(t, F)`, `Rs = S(t, F+1)` and `e = E(t, F+1)`, the left cells
cancel in the XOR and

```
E(t+1, F)  =  (C || R) xor (Cs || Rs)  =  ! Rs  xor  (Cs && e).
```

Two cases, and they are the whole content. If `Cs = 0` the picture's cell at `F`
is black, so `C || R = 1` whatever the band does, and `E(t+1, F) = ! Rs`: **the
background decides.** If `Cs = 1` then `Cs || Rs = 1` and `E(t+1, F) = ! R`: the
picture decides — except that when `e = 0` the picture's cell *is* the
background's, and the background decides again. Combining with the advance law,
the settled triple `(S(t,F−1), S(t,F), S(t,F+1))` gives four cases, of which
three are decided outright:

| triple | what the front does | decided by |
|---|---|---|
| `(0, ·, ·)` | advances one cell, exactly | the background (crystals A2) |
| `(1, 0, 0)` | stays, exactly | the background |
| `(1, 0, 1)` | **retreats** — the leading cell dies | the background |
| `(1, 1, ·)` | stays or retreats | the band |

Measured over 999,960 rows (`explorer/alidade_survival.mjs`): the law holds with
**0 failures**, the four rows of the table have observed frequencies 0.58824,
0.07410, 0.13216, 0.20551, and within `(1,1,·)` the split is 0.35/0.65 with no
determinism, as it must be.

**Why that is a speed bound, and why the obvious way to use it fails.** Each row
contributes at most one cell of advance and each forced retreat contributes at
least one cell backwards, so along the front's own path
`−F(T)/T ≤ w − d` with `w` the advance rate and `d` the rate of the triple
`(1,0,1)`: measured `0.58824 − 0.13216 = 0.45608`, and every block of 10^5 rows
lies in `[0.45201, 0.46266]`. But `w` and `d` are trajectory averages, not
background statistics, so that inequality is a rearrangement and not yet a bound.
The naive repair — a walker that advances on white, retreats by one on the
forcing triple and otherwise stays — **does not work**: run from the front's own
position it reaches 0.942 and is to the *left* of the real front on 13 rows,
because the forced-retreat rule is only valid at the true front, and a walker that
has run ahead reads the triple at a position where it means nothing.

**The repair that does work is a reachable set, not a walker.** Track the whole
set `R(t)` of positions an admissible trajectory could occupy. The four cases give
`R(t+1) = ⋃_{x ∈ R(t)} N(x)` with `N(x) = {x−1}` (advance), `{x}` (forced stay),
`[x+1, ∞)` (forced retreat) or `[x, ∞)` (band decides); the two rays make `R` a
finite set of isolated points together with an upward ray, which is cheap to
carry. `min R(t)` is then a genuine background-only lower bound for `F(t)`, and it
beats the greedy walker precisely because the reachable set has **gaps**: a forced
retreat at `min R` costs a cell only when no admissible trajectory one cell to its
right is there to advance into the vacated place. That is the mechanism, and it is
invisible to any single-walker argument.

**The dictionary.**

| Here | Computational mechanics of CAs |
|---|---|
| the settled picture `S` | the regular domain `Λ` (§3.2 makes this exact) |
| the band `E = picture xor S` | the output of the domain filter: the defect field |
| the front `F(t)` | the domain wall between the settled domain and the band |
| crystals A2 (advance on white) | the wall's motion inside the domain |
| the survival law `E(t+1,F) = !Rs xor (Cs && e)` | the wall's *equation of motion*, in the paper's sense — a local rule for the filtered field |
| the triple `(1,0,1)`, rate 0.13216 | a **decay channel with a domain-computable rate**: the defect dies against the domain, not against another defect |
| the triple `(1,1,·)`, rate 0.20551 | the reaction that needs the other particles, i.e. the part the domain cannot see |
| the walker `G` of the previous sighting | a wall that *waits* at a closed site rather than decaying |
| `min R(t)` | the wall's fastest admissible worldline given the domain |
| the wall `leftDiagonal_onset_le` | the wall velocity is at most 1/2 |
| **Seam 1** | the rate `d` is domain-*decided* but trajectory-*measured*: `(1,0,1)` is read at the front's own position, and nothing proves the front meets it at rate 0.132 rather than less. The reachable-set DP removes this for the bound 0.4531 — that number is read along the DP's own path, which is defined by the background alone — but not for the decomposition `w − d` |
| **Seam 2** | the DP escapes onto an infinite white channel at the eventually-white diagonals and then runs at speed 1 for ever. Measured: started at row 1000 it escapes at diagonal 53,208 near row 107,000, exactly as `G` does. The bound is therefore per-stretch, and the stretches have to be chained — which is possible, but only through the previous sighting's Topic 2 |
| **Seam 3** | this is not a percolation object and not a particle: the winning construction is a nondeterministic automaton's reachable set, which the CM literature does not use. What the field supplied was the *question* — bound the death rate from the domain — not the tool |

**What it leans on.**
[Hanson & Crutchfield, *Computational mechanics of cellular automata: an example*,
Physica D 103 (1997) 169–189](https://csc.ucdavis.edu/~cmg/papers/ECA54.pdf),
fetched and text-extracted (`explorer/alidade_eca54.txt`). On what the programme
produces for the filtered field: *"From this filtered behavior, the particle
equations of motion and the interactions between particles can be formulated."*
And, on the case where a deterministic equation is not available: *"in the case of
ECA 18 and in the case of arbitrary filtered CA, this is not true. in the former,
the filtered behavior is described by a stochastic equation of motion for
diffusive annihilating particles [3]. In the latter, the resulting filtered
space-time behavior often can be described only by a strictly more computationally
complex class of spatial processes called cellular transducers"* (extraction as
recovered; `[3]` is Crutchfield & Hanson 1993). The survival law is the
deterministic equation of motion that ECA 54 has and rule 30 was not expected to
have — it exists, but it reads one cell of the *unfiltered* picture in half its
cases, which is exactly the "strictly more complex" outcome the sentence predicts.

From the board, and this is the load-bearing part: `rule30_eq`, `rule30_left_local_law`
(crystals A2), crystal 47 (the settled picture is itself a rule 30 evolution), and
crystal 50(b), which already contains the `e = 0` half of the survival law in
diagonal coordinates. Measured, 31.6% of the domain-forced retreats have `e = 1`
and so lie outside the case 50(b) covers.

**The test.** All run.
`explorer/alidade_scratch_survival.lean`, accepted by `lake env lean`: the law and
both of its domain-only corollaries, `#print axioms` giving `[propext]` for all
three.
`explorer/alidade_survival.mjs`, 10^6 rows: the law holds on 999,960 of 999,960
rows; the triple table above; `w − d = 0.45608` with all ten 10^5-blocks in
`[0.45201, 0.46266]`; the leading cell's fate decided by the background alone on
768,696 of 999,960 rows.
`explorer/alidade_dp.mjs`, 300,000 rows with the real engine alongside: the real
front is **never** left of the DP minimum (0 violations), and before the
white-channel escape the DP reads 0.4569 at row 50,000 and 0.4704 at row 100,000
against `G`'s 0.5045 and 0.5049.
`explorer/alidade_dp2.mjs`, 4·10^6 rows on the channel-free stretch (diagonals
100,000 to 2,287,610, the same stretch the previous sighting used), no engine:
**DP 0.45310, `G` 0.50125**, every 5·10^5-block in `[0.45265, 0.45412]`, and the
scan window never overflowed.
`explorer/alidade_dp3.mjs` and `alidade_dp4.mjs`, the controls, 2·10^6 and 4·10^5
rows through the same code path — but first, the code itself. The only clever
thing in the DP is that it carries `R(t)` as points-plus-ray, so
`explorer/alidade_dpcheck.mjs` runs a second, deliberately stupid implementation
beside it: a plain boolean array over a horizon of 3000 positions, every position
updated cell by cell, no ray and no early exit. Over 200,000 rows the two minima
**agree on every single row**, and the naive one is never lower (which is the
direction a bug in the ray bookkeeping would show). Then the background controls:
pseudo-random bits of density 1/2 give 0.45149,
the real settled words with each diagonal's phase randomised give 0.45029, and the
evolution of a random ring under rule 30 gives 0.45292. So the bound is a property
of the two laws against any half-dense background, not of rule 30's particular
words, and the margin below 1/2 is 0.047 — twenty-five times the phase-alignment
anomaly that made `G` miss.

To falsify: exhibit a row where the settled triple is `(1,0,1)` and the front does
not retreat; or a row where the real front is strictly left of `min R(t)` started
from an earlier agreement; or a channel-free stretch on which the DP's speed
exceeds 1/2.

**What it would give.** `leftDiagonal_onset_le`, which is the sixth obstruction's
subject and the equivalent form of the seam-speed wall (crystal 51:
`onset_le ⟺ ∀ t ≥ 18, 2 F(t) + t ≥ 1`). What would remain, and it is not small:
(i) the DP bound is measured on one stretch, and nothing proves the DP's speed
stays below 1/2 on every stretch — though unlike the 0.001 of the previous
sighting, the margin here is 0.047 and survives three unrelated backgrounds;
(ii) the white channels must be chained, which needs the previous sighting's
Topic 2 (*the front never rides a white channel*, provable from
`leftDiagonal_periodicFrom_pow` and A2) and a restart of the DP at the front's own
position at each of the seven channels below 10^9 — they are sparse enough that
the correction is `O(log log T)` cells; and (iii) the DP itself has to become an
induction in Lean, which means carrying the reachable set as a predicate rather
than a data structure. Crystals A3 is not contradicted: A3 is about arbitrary
pairs of configurations, and this argument reads the background's cells.

### 3.2 The settled region *is* a regular domain — of temporal period `2^n`, and `n` grows

**The claim.** Rule 30's settled region satisfies Crutchfield and Hanson's
definition of a regular domain exactly, on the wedge of diagonals whose period
divides `2^n`, where it is a travelling wave of temporal period `2^n` and spatial
shift `2^n` — the same shape as their rule 54 domain. What rule 30 does not have
is one `n`: the period doubles at diagonals 3, 8, 29, 400, 87867, 2107985255, so
the domain the front lives in changes for ever and the filter's state count grows
like `log t`. The project's period wall and the CM programme's finiteness
requirement are the same wall.

The identity is one line. `S(t, x) = S_{t+x}(-x)`, so
`S(t + P, x − P) = S_{t+x}(P − x) = S(t, x)` whenever the period of diagonal
`t + x` divides `P`.

**The dictionary.**

| Here | Computational mechanics |
|---|---|
| the settled picture on `{ t + x < K_n }` | the regular domain `Λ`, temporal period `2^n` |
| `S(t + 2^n, x − 2^n) = S(t, x)` | *"the same pattern is repeated after two iterations, spatially shifted by two cells"* (their `Λ54`, period 2, shift 2) |
| the doubling diagonals `K_n = 3, 8, 29, 400, 87867, 2107985255` | the boundaries between successive domains in a hierarchy |
| the front's diagonal `κ(t)`, growing at 0.757 per row | the wall's passage from one domain into the next |
| `leftDiagonal_period_unbounded` (proved on this board) | **there is no `p`**, so condition (i) of the definition fails globally |
| the filter's state count | at least `2^n` ≈ `log t`, since a period-`p` word has exactly `p` distinct factors of each length |
| **Seam 1** | the definition's condition (i) says "for some finite period `p`". Rule 30 has a finite `p` at every finite time and no `p` at all — the programme applies to every initial segment of the picture and to none of it |
| **Seam 2** | condition (ii), spatial homogeneity, asks the process graph of each temporal phase to be strongly connected. A single travelling wave's graph is one cycle, which is strongly connected but carries no entropy; the settled rows have entropy 0.997 bits per cell, so the wave and the row language are describing different things (§3.3) |

**What it leans on.** The fetched paper, for the definition, as recovered — `Λ` is
rendered `A` and `Φ` as `¥`/`~P`: *"A regular domain A of a CA ¥ is a process
language representing a set of configurations, with the following two properties:
(i) temporal invariance or periodicity: A is mapped onto itself by the dyanmic,
i.e., ~PA = A for some finite period p; and (ii) spatial homogeneity: the process
graph of each temporal phase of A is strongly connected."* And for the shape of
their own domain: *"The domain configurations are spatio-temporally periodic, with
periodicity 4 in both space and time. Note, however, that the same pattern is
repeated after two iterations, spatially shifted by two cells."*
([ECA54.pdf](https://csc.ucdavis.edu/~cmg/papers/ECA54.pdf)) From the board:
`leftDiagonal_periodicFrom_pow`, `leftDiagonal_period_unbounded`, crystal 14 and
NKS p. 871 for the doubling diagonals.

**The test.** `explorer/alidade_wave.mjs`. The identity is checked at 200,000
sampled cells for each of `P = 2, 4, 8, 16, 32`: **0 disagreements** inside the
wedge `k < K_n` in every case, and 49.9–50.1% disagreement outside it — chance,
as it should be. The first appearance of each period is confirmed from the
recurrence alone: `1@0 2@3 4@8 8@29 16@400 32@87867`. And the prediction the
dictionary makes is checked against an independent measurement: the front should
leave the period-16 domain at diagonal 87,867, around row `87867/0.757 ≈ 116,073`;
the previous sighting measured the front's jump over `κ = 87,867` at row 117,324.
To falsify: find a cell inside a wedge where the identity fails, or a doubling
diagonal not in the list.

**What it would give.** A precise statement of why this project had to compute the
background diagonal by diagonal instead of inferring it: the domain is a
travelling wave whose period is unbounded, so the literature's inference step
(*"the identification of domains begins with inference of FAs from examples of the
CA's behavior i.e., the discovery of patterns in space-time data. In simple cases
this can be done by inspection."*) cannot terminate. It also gives the shape of
the logarithmic period bound the previous sighting wanted for its run-length
argument: `K_n` grows roughly as squares, so the period at time `t` is about
`log t`. What remains: the growth of `K_n` is measured, not proved.

### 3.3 No domain filter can find the seam, because the two phases have the same row language

**The claim.** A Crutchfield–Hanson domain filter is a finite-state transducer
reading one row from left to right, and no such object can locate rule 30's seam,
because a row of the settled region and a row of the band are drawn from the same
language: every word of length 14 occurs in both, and their entropies differ by
0.0026 bits per cell. The project's `E = picture xor S` is a filter, but it is a
*two-dimensional* one that compares rows `2^n` apart, and nothing one-dimensional
replaces it.

**The dictionary.**

| Here | Computational mechanics |
|---|---|
| a row of the settled picture | a configuration in the domain `Λ` |
| a row inside the band | a configuration to be filtered |
| a word absent from `Λ` but present in the band | a **wall**: *"We consider a domain A and a finite string ω = zs such that z ∈ A, s ∉ A, and ω ∉ A. Then s is a wall of domain A"* |
| the transducer's state | how much of the row must be read before a site can be classified (their "synchronization") |
| **Seam** | there are no such words. Over 5.5·10^8 length-14 windows of settled rows, **every** one of the 16384 words occurs, the rarest 8062 times; over 1.2·10^8 windows of band rows, likewise. The best any length-14 test could do is a word that is 1.96× more likely in one phase than the other |

**What it leans on.** The fetched wall definition above; nothing else external.

**The test.** `explorer/alidade_wordcount.mjs`, exhaustive over rows 5000–39999
for the settled phase (whole settled part of each row, 550,767,000 windows) and
rows 20000–39999 for the band (119,760,000 windows): 0 words of length 14 absent
from either; settled `H(14)/14 = 0.99743` bits per cell, band `0.99999`; black
densities 0.49994 and 0.49996; the most over-represented settled word is at
1.964× the band's rate and the most under-represented at 0.246×. To falsify:
exhibit a word absent from the settled phase and present in the band. (I thought I
had 26 of them; §4 records why that was wrong, because the way it was wrong is the
useful part.)

**What it would give.** It closes the whole "build a filter and read off the
particles" family in one measurement, and it explains the previous sighting's
fourth obstruction from a new direction: the settled region carries no trace of
the boundary *and* no trace of itself, to a finite-state reader of one row.

### 3.4 Not a defect gas: rule 18's particles thin, and rule 30's do not

**The claim.** The one elementary rule whose filtered dynamics is a gas of
annihilating particles is rule 18, and its defect density decays like `t^(-1/2)`;
rule 30's band has deviation density 1/2 at every depth and never thins, so there
is no dilute limit, no reaction rate, and no annihilating system for the front to
be the leftmost particle of. The front is a genuinely narrow wall — three cells —
but there is exactly one of it, and annihilation needs two.

**The dictionary.**

| Here | Rule 18's defect gas |
|---|---|
| the settled picture | the domain `(0Σ)*` |
| a cell of `E` | a defect site |
| the block `11` in a rule 18 row | the defect indicator |
| defect density against time | `t^(-0.527)` measured over 10^5 steps on a ring of 65536 |
| the band's deviation density against depth behind the front | 1.0 at the front, 0.4606 at depth 1, 0.5801 at depth 2, and 0.50005 averaged over depths 16 to 96 |
| a pair annihilation | 68% of last-transient deaths in `explorer/maskfront.mjs` are two transients meeting in one `\|\|` |
| **Seam 1** | there is no dilute limit. At density 1/2 the "particles" are touching everywhere, so the mean free path is one cell and the gas has no kinetics |
| **Seam 2** | the paper's particle needs *"the width of the defect never exceeds some fixed maximum"*. The front's leading block has mean length 1.93 and a geometric tail — 0.5378, 0.2388, 0.1113, 0.0511, … out to 12 and beyond — with no cutoff visible over 10^6 rows |
| **Seam 3** | and it needs temporal periodicity, which would force a rational velocity with denominator dividing the domain's period. The measured velocity is 0.243 and the domain's period changes for ever (§3.2) |

**What it leans on.** For rule 18 the fetched sentence — *"the filtered behavior
is described by a stochastic equation of motion for diffusive annihilating
particles"* ([ECA54.pdf](https://csc.ucdavis.edu/~cmg/papers/ECA54.pdf)) — and
then, rather than a citation for the exponent, a measurement. **UNVERIFIED**: the
primary sources for rule 18's kink, Crutchfield & Hanson's *Turbulent pattern
bases for cellular automata* (Physica D 69, 1993) and Eloranta & Nummelin's *The
kink of cellular automaton rule 18 performs a random walk* (J. Stat. Phys. 69,
1992). Searched and fetched: `csc.ucdavis.edu/~cmg/papers/TurBases.pdf` downloads
but contains no text layer at all (0 characters recovered by the same extractor
that got 91,000 from ECA54.pdf — it is a scan);
`link.springer.com/article/10.1007/BF01058766` returns 303 to an
`idp.springer.com/authorize` endpoint. So the `t^(-1/2)` law is asserted here on
the strength of my own measurement of rule 18, not on either paper.

**The test.** `explorer/alidade_rule18.mjs`: rule 18 on a ring of 65536 from a
fixed random row, density of the block `11` sampled at log-spaced times, fitted
exponent **−0.5272** over `t ≥ 1000`. Rule 30's profile is from
`explorer/alidade_survival.mjs` over 10^6 rows. To falsify: find a depth behind
rule 30's front at which the deviation density is measurably below 1/2, or a
filtering of the band under which it decays.

**What it would give.** Nothing positive; it removes the vantage's most attractive
hypothesis. Its value is that the removal is measured rather than argued, and that
the same measurement pins down what *is* true of the front — it is narrow, and its
narrowness is the reason the survival law of §3.1 has only three cells in it.

### 3.5 The residual in the complexity–entropy plane, and why this field has no theorem there

**The claim.** Computational mechanics scores a process by entropy rate `h` and
statistical complexity `C_μ`; "eventually periodic with period `p`" is the corner
`h = 0`, `C_μ = log p`, and the centre column measures `h ≈ 1`, `C_μ ≈ 0`, which
is the *opposite* corner and is also where a fair coin sits. So the field's own
coordinates place the residual as far from periodicity as a sequence can be, and
supply nothing that converts the measurement into the conclusion — because both
coordinates are defined over an ensemble and here there is one orbit.

**The dictionary.**

| Here | Computational mechanics |
|---|---|
| the centre column | a binary process |
| "eventually periodic with period `p`" | `h = 0` and `C_μ = log₂ p`: `p` causal states in one cycle |
| the measured block entropies | `h(14) = 0.99008` bits per symbol over 6·10^5 terms |
| the causal states at horizon 4 and 6 | exactly **one**: every past of length 4 or 6 is followed by all 2^8 futures |
| crystal 21 and Talus's factor counts | the deterministic surrogate for a causal-state count, and the one that actually bounds a period |
| **Seam 1** | `C_μ` cannot separate the two hypotheses: a fair coin and this sequence both give one causal state, and so would the *first half* of a period-10^9 sequence. Only `h` separates, and `h` is not computable from any finite prefix |
| **Seam 2** | the plug-in entropy estimator is biased downward once the block length approaches `log₂` of the sample size. Measured `h(n)` falls to 0.13 by `n = 22` on 6·10^5 terms, and that is the estimator, not the sequence. Any argument of the form "the measured entropy is 1, so it is not periodic" is exactly this error with the sign hidden |

**What it leans on.** Nothing external that I could fetch; the definitions of `h`
and `C_μ` are standard in this literature and the fetched paper uses ε-machine
reconstruction without restating them. **UNVERIFIED** for the formal definitions
of statistical complexity and the ε-machine: searched for Crutchfield & Young and
for Shalizi & Crutchfield, *Computational mechanics: pattern and prediction,
structure and simplicity*; the Springer landing page is the only fetchable form
and it redirects to authorisation.

**The test.** `explorer/alidade_epsilon.mjs`, 6·10^5 terms of the centre column:
all 2^n words present up to `n = 15`, `h(14) = 0.99008`, one causal state at past
lengths 4 and 6 with futures of length 8. Reported with the caveat above: at past
length 8 the script finds 7 follower sets, which is a sample-size artefact of the
same kind and should not be read as structure.

**What it would give.** A clean restatement of the residual for a reader from this
field, and one honest warning: the field's headline diagram would place rule 30's
centre column at (1, 0) with confidence, and that placement is a measurement of a
prefix and proves nothing at all.

---

## 4. Died in translation

- **The vantage's own hypothesis: the front as the leftmost particle of an
  annihilating gas.** Dead at the density. Rule 18's defects thin as `t^(-0.527)`
  (measured); rule 30's band sits at 0.50005 at every depth from 16 to 96 cells
  behind the front and at 0.4987 at depth 3. A gas needs a dilute limit and there
  is none. The *question* the vantage carried — bound the death rate from the
  domain — survived and paid; the *mechanism* did not.
- **The reaction table as a source of the death rate.** The brief pointed at
  `explorer/maskfront.mjs`'s kill types (two transients meeting in a single `||`
  at 68%, a black settled neighbour at 4%) as the analogue of a CM reaction table,
  and I spent an hour expecting the front's deaths to be 96% band-internal. They
  are not. That table is about the death of the last transient *of a diagonal*,
  which is a different event from a retreat of the front; at the front the fate is
  decided by the background alone on 76.9% of rows and 50.1% of retreats are
  domain-forced. Naming what a number was measured over would have saved the hour.
- **The greedy walker using the forced-retreat rule.** The obvious way to turn the
  survival law into a bound: advance on white, retreat by one on the forcing
  triple, otherwise stay. It runs at 0.942 and sits *left* of the real front on 13
  of 300,000 rows, because the forcing triple is only meaningful at the true front.
  The rule has to be carried by a reachable *set*, not a point; that is §3.1 and
  the difference between the two is the whole result.
- **Twenty-six forbidden words that were not forbidden.** A first pass
  (`explorer/alidade_gap.mjs`, 1.6·10^8 sampled cells) found 26 words of length 14
  absent from the settled phase and present ~2900 times each in the band — which
  would have meant a domain filter exists. It is a sampling artefact, and the cause
  is §3.2: in the period-16 regime the settled picture is a travelling wave with
  `S(t+16, x−16) = S(t, x)`, so rows 16 apart are the same row shifted and a sample
  that steps `t` by 4 sees only a quarter of the phases, however many cells it
  touches. An exhaustive count over every row (`explorer/alidade_wordcount.mjs`,
  5.5·10^8 windows) finds all 16384 words, the rarest 8062 times. Recorded at
  length because it is the project's own recurring failure: 1.6·10^8 was a true
  number measured over the wrong thing, and the shortfall was far too large to be
  chance, which made it *more* convincing rather than less.
- **ε-machine reconstruction as the way to find the domain.** The literature's
  inference step reads space-time data and infers a finite automaton. It would
  never find rule 30's domain: the two phases have the same row language (§3.3),
  and the domain's own period is unbounded, so there is no finite automaton to
  infer. The domain here was found by the project along diagonals, which is not a
  direction this literature reads in.
- **The full shift as the domain.** Rule 30 is surjective (`schule-stoop-2012`
  Prop. 15), so `{0,1}^ℤ` satisfies both conditions of the definition trivially and
  *is* a regular domain of rule 30 with period 1. Its filter flags nothing. This is
  not a joke row: it is why "does rule 30 have a regular domain" is the wrong
  question, and "does it have one that excludes the band" is the right one.
- **Particle identification and a glider catalogue.** Rule 54 has a catalogue with
  velocities and a reaction table; rule 110's catalogue carries a universality
  proof. Rule 30's picture contains exactly one wall and no gliders, so there is
  nothing to catalogue. Died on inspection.
- **Cellular transducers.** The literature's own escape hatch for CAs whose
  filtered behaviour is not finite-state. The class is named in the fetched source
  and carries, so far as I could find, no theorems that bound anything. An address,
  not a route.
- **Shock waves and a Rankine–Hugoniot condition for the seam speed.** The
  attraction: a shock's velocity is fixed by the jump in a conserved density across
  it, which would give 0.243 in closed form. There is no conserved density (rule 30
  is not additive), and the obvious candidate — entropy density — does not jump:
  0.99743 bits per cell on the settled side against 0.99999 on the band side.
- **Toom's eroder theory.** The retreats are erosion and Toom's theorem computes
  erosion rates, but every result there needs monotonicity, and rule 30 is
  left-permutive: flipping the left input flips the output, so no configuration
  order is preserved. Died in one line.
- **Dislocations and Burgers vectors.** The eventually-white diagonals, where the
  settled period doubles and one bit is chosen, look exactly like dislocations with
  a topological charge; and the project even knows the chosen bits
  (`explorer/forbit.mjs`). But the charge is not conserved, not additive, and is
  inherited unchanged by every configuration white far to the left, so there is
  nothing for a topological argument to be about.
- **"Every settled word is exactly half black."** The clean form of the density
  hypothesis every bound here leans on, and it is false: of the 2,000,001 settled
  words below diagonal 2·10^6, only 285,288 have exactly half their period black,
  and the weights at period 32 spread from 3 to 32 in a binomial shape around 16
  (`explorer/alidade_density.mjs`). The average is 0.499977 and that is all it is.
  Recorded because I nearly handed it on as a cheap lemma rather than spending the
  one loop it took to kill it.
- **Statistical complexity as a discriminator.** `C_μ` is small for a fair coin and
  small for a short-period sequence; only the entropy rate separates them, and no
  finite prefix determines it. The field's most-used number is blind to exactly the
  distinction the residual is about.

---

## 5. What to hand the theorist

**Topic 1 — the survival law, and the reachable-set bound below 1/2.** This is the
whole document.

*The claim to falsify, in three pieces, smallest first.*
(a) *The law.* For rows `c` (the picture) and `d` (the settled picture) with
`c (i-1) = d (i-1)` and `c i = ! d i`,
`xor (rule30 c i) (rule30 d i) = xor (! d (i+1)) (d i && xor (c (i+1)) (d (i+1)))`.
Already proved in the kernel, `explorer/alidade_scratch_survival.lean`, axioms
`[propext]`, together with the two corollaries that make the right-hand side
`! d (i+1)` when `d i = false` or when `c (i+1) = d (i+1)`. This is a seedable node
of size S sitting under `leftDiagonal_onset_le`, and it generalises crystal 50(b),
which is its `c (i+1) = d (i+1)` half in diagonal coordinates.
(b) *The forced retreat.* If `S(t, F(t)−1)` is black, `S(t, F(t))` white and
`S(t, F(t)+1)` black, then `F(t+1) > F(t)`. Immediate from (a) plus crystals A2.
Measured on 132,152 of 999,960 rows with no exception.
(c) *The bound.* Let `R(t₀) = {F(t₀)}` and let `R(t+1)` be the image of `R(t)`
under `x ↦ {x−1}` when `S(t,x−1)` is white, `{x}` when the triple is `(1,0,0)`,
`[x+1,∞)` when it is `(1,0,1)` and `[x,∞)` otherwise. Then `F(t) ≥ min R(t)` for
every `t ≥ t₀`. That is a one-step induction from (a) and A2 and is the statement
worth a session; the data structure in `explorer/alidade_dp2.mjs` is only the
observation that `R(t)` is always a finite set plus an upward ray.

*The dictionary row it depends on:* "the domain-forced retreat is a decay channel
whose rate the domain computes" — and, more sharply, the row that says the
mechanism is a *gap in the reachable set*, not a slow walker.

*The depth that would settle it.* `min R(t)` runs at 0.45310 over 4·10^6 rows on
the channel-free stretch from diagonal 100,000, with every 5·10^5-block in
`[0.45265, 0.45412]`; the same code gives 0.45149 on pseudo-random bits, 0.45029
on phase-randomised settled words and 0.45292 on the evolution of a random ring.
The real front is never left of `min R(t)` over 300,000 rows with the engine
running alongside, and a second implementation of the reachable set that carries
no ray at all agrees with the first on every one of 200,000 rows
(`explorer/alidade_dpcheck.mjs`, 0.45532 over that shorter stretch). What is *not* settled and is the honest gap: nothing proves the
DP's speed stays below 1/2 on every stretch, and the DP escapes onto the
eventually-white diagonals exactly as Rosetta's `G` does, so the stretches must be
chained through Rosetta's Topic 2. Both gaps are the same shape as the ones the
previous sighting left, with one difference that decides whether this is worth a
session: its margin was 0.001 and against it, this one is 0.047 and for it.

**Topic 2 — the prerequisite, which is already on the previous sighting's list.**
*The front never rides a white channel:* for every `t`, the settled word
`S_{κ(t)−1}` is not identically white. Two lines from `leftDiagonal_periodicFrom_pow`
and A2. It was worth a session before; it is now load-bearing, because without it
Topic 1's bound covers only the stretch between two doublings and there is no
argument that tiles all of time.

**Not handed over.** §3.2's domain hierarchy and §3.3's row-language measurement
are descriptions, not routes: they say why the CM programme cannot be run on rule
30 and why the project's own diagonal construction was the only way in. A captain
who wants an obstruction out of this document should take §3.3 — *no finite-state
transducer reading one row can separate the settled region from the transient
band* — with the count from `explorer/alidade_wordcount.mjs` beside it. And a
correction that belongs in the record rather than in an obstruction: the previous
sighting's claim that 0.50106 is "the exact supremum of what the local law and the
settled background together permit" is not right. It is the supremum of what the
*advance half* of the local law permits. The other half is §3.1 and it is worth
0.047.

---

## 6. Next vantage

**Ergodic optimisation and weighted automata: the maximum mean cycle of the
reachable-set machine.** The previous sighting closed the max-plus route on the
ground that the environment's driving orbit never repeats, so the graph whose
cycle mean would be the speed is a ray rather than a graph. That is true of the
environment — and the machine built in §3.1 has a *different* state, namely the
pattern of the reachable set near its own minimum, which lives in a finite set
whatever the background does. So the speed of `min R` is the mean weight of a path
in a finite weighted automaton driven by the background's bits, and the question
"what is the worst-case speed over all admissible backgrounds?" is a maximum mean
cycle, computable exactly by Karp's algorithm on a graph nobody has drawn. The
answer over *all* backgrounds is 1 (an all-white background lets the wall run
free), so the interesting question is the constrained one, and the constraint that
is actually available is the strongest thing the project knows about the
background: it is itself a rule 30 picture (crystal 47), so it satisfies the
forbidden 2×2 block of crystal 8 and everything else a rule 30 row satisfies. A
connector or theorist from that field should ask: **is the maximum mean cycle of
the reachable-set machine, over backgrounds constrained to be rule 30 pictures,
below 1/2?** If it is, the bound of §3.1 stops being a measurement. My fourth
control is the evidence that this is the right question — the DP gives 0.45292
against the evolution of a random ring, so the property being used is a property of
rule 30 pictures in general and not of the settled words.

**The one I could not reach from where I stood: symbolic dynamics of the settled
words as a measure-preserving system, to get the density.** Every argument in this
document ultimately rests on the settled words having black density 1/2 — I
measure 0.499977 over the periods of all 2,000,001 settled words below diagonal
2·10^6 (`explorer/alidade_density.mjs`) and Rosetta measured 0.5000 over 2·10^6
diagonals, and neither of us proved anything. The clean per-word form is **false**,
and I checked rather than handing it on: only 285,288 of 2,000,001 words have
exactly half their period black, and the weight distribution at period 32 runs
from 3 to 32 with a binomial shape peaking at 16 (268,156 words). So the density
is an average over diagonals and not a law about any one of them, and what a
theorist would need is an equidistribution statement about the orbit of the pair
map — which is the setting of symbolic dynamics and unique ergodicity, and is a
vantage nobody here has taken. Two facts that vantage should be given at the door:
the pair map has in-degree one and its orbit never repeats (the project's C1/C2),
which is exactly the hypothesis under which equidistribution results are usually
*unavailable*; and the weight distribution above is the sharpest measured evidence
that the words behave like coin flips in every respect the arguments here use.
