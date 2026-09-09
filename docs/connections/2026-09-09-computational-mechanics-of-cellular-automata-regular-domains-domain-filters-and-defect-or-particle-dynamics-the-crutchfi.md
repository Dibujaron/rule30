# Sighting: the transient band as a defect gas, and the front as a domain wall

**Vantage.** Computational mechanics of cellular automata — regular domains,
domain filters, and defect/particle dynamics: the Crutchfield and Hanson
programme, applied to the transient band rather than to the settled region.

**Connector.** Alidade, 2026-09-09. Nothing here is a proof. A connection is a
sighting: a direction for a prover to walk, and a dictionary whose rows can be
checked one at a time. Scripts are under `explorer/alidade_*.mjs`; every number
says which script produced it and at what depth.

**On sources.** Rosetta handed this field on as an address, having been unable to
fetch a readable copy (403 from the publisher, a binary PDF from the author's
site, a 404 on the abstract page). **The primary source is now fetched and
quotable.** `WebFetch` on `https://csc.ucdavis.edu/~cmg/papers/ECA54.pdf` returns
the paper and the harness saves the bytes to disk; the summarising model cannot
read a PDF, but `explorer/alidade_pdftext.mjs` inflates the content streams and
recovers the text (15.1% of its long words are common English, against 1.7% for a
PDF that has no text layer). The recovered text is
`explorer/alidade_eca54.txt` and every quote below is from it, with the fetched
URL beside it. Two companions did **not** come out: `TurBases.pdf` fetches but has
no text layer at all (0 characters recovered — it is a scan), and Springer's
abstract pages redirect to an authorisation endpoint. Those stay UNVERIFIED and
say so.

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
transient, a periodic word, whose period is a power of two and grows without
bound as you go inward. Those settled words assemble into a second, idealised
picture — call it the **background** — which is itself an evolution of the same
rule and which the real picture agrees with everywhere left of a moving seam.
Right of the seam is a wedge in which the real picture and the background
disagree; the wedge's right edge runs at exactly one cell per row, and its left
edge — the seam — runs at a measured 0.2497 cells per row and is not known to
run at any rate at all. Almost everything the project has proved is about the
settled part; the centre column lives at the wedge's other edge, in the part that
has not settled. The residual, restated: **bound the speed of the seam.** The
project's onset wall is exactly the statement that the seam never exceeds one
half of a cell per row, and the previous sighting from the growth-process vantage
established that everything the background can prove on its own tops out at
0.50106 — on the wrong side of a half by one part in a thousand.

**Restated in this vantage's own terms.** Computational mechanics reads a
space-time diagram as a *background* plus a *gas of defects*. The background is a
**regular domain**: a set of configurations recognised by a finite automaton,
mapped onto itself by the rule in some finite number of steps, and spatially
homogeneous. A **domain filter** is a finite-state transducer that reads a
configuration left to right and writes a `0` wherever a site is participating in
the domain and a distinct non-zero symbol wherever it is not; what survives the
filter is the defect field. A defect whose width stays bounded and whose
domain–defect–domain pattern is temporally periodic is a **particle**, and
particles have integer-ratio velocities, obey a reaction table, and — in the one
elementary rule where this has been carried through stochastically, rule 18 —
behave as diffusing particles that annihilate on contact, so that their density
decays. The question this vantage was sent to answer: **is the seam the leftmost
particle of such an annihilating system, and can the rate at which the leading
particle dies be bounded below by statistics of the domain alone?** If it can,
the missing 0.09 — the gap between the white density the front sees, 0.5894, and
the 1/2 the wall needs — is a death rate, and death rates are the one thing this
literature computes.

---

## 2. Fields sighted

| Field or theory | The object there that matches something here | The seam, in one line |
|---|---|---|
| Computational mechanics of CAs — regular domains (Crutchfield–Hanson) | the settled background is the candidate domain `Λ` | condition (i) demands a **finite** temporal period `p`; the background's diagonal periods are unbounded, which is a proved theorem of this board |
| Domain filters (finite-state transducers) | `E = picture xor S` is the filtered field, already computed | a CM filter is an FST reading **one row, left to right**; measured, the settled rows and the band's rows have the *same* row language (all 2^20 words occur in both), so no spatial FST can find the seam |
| Particles (the paper's own definition) | the seam is a wall between two domains | a particle needs bounded width **and** temporal periodicity, which forces a rational velocity; the seam's velocity is 0.2497 and its stall pattern is driven by words that provably never repeat |
| Defect gas / annihilating diffusive particles (rule 18: Grassberger; Eloranta–Nummelin) | band cells as particles that meet and annihilate | rule 18's defect density decays to zero; the band's deviation density is measured **constant at 0.4998** — there is no dilute limit, so no gas |
| Reaction–diffusion `A + A → 0` (Bramson–Griffeath, Arratia) | "two transients meeting in a single `\|\|`", 68% of last-transient deaths | the reaction table has *births* as well as deaths and no conservation law; density does not decay |
| Two-phase coexistence, ordered/disordered interface | the seam separates a quasi-crystalline phase from a chaotic one | no free energy, no temperature, no ensemble — one deterministic picture |
| Shock waves, Rankine–Hugoniot conditions | the seam as a shock between phases of different entropy density | measured, both phases have the same row entropy density (1 bit/cell); there is no jump for a shock condition to balance |
| Toom's eroder theory, stability of monotone CAs | the seam's retreat is *erosion* of the deviation set, and Toom computes erosion rates | Toom needs a monotone (attractive) rule; rule 30 is left-permutive and anti-monotone in its left argument |
| Sofic shifts, follower-set complexity (Lind–Marcus) | a regular domain is exactly a transitive sofic subshift | the background's row language is the full shift, so the only sofic domain containing it is the trivial one, whose filter flags nothing |
| Rule 110's glider catalogue (Cook), particle computation | a catalogue of particles is what makes a CA's behaviour describable | rule 30 has no gliders and exactly one wall — the object of study is a population of size one |
| ε-machines, statistical complexity, causal states | the centre column as a process; "eventually periodic" = "a single cycle of causal states" | a single deterministic orbit carries no measure; the finite-state surrogate is factor complexity, which the project already uses (crystal 21) |
| Cellular transducers (this literature's own escape hatch) | the filtered rule 30 band | the source itself says filtered behaviour of an arbitrary CA "often can be described only by a strictly more computationally complex class of spatial processes called cellular transducers" — that class has no theorems we can use |
| Ising / Glauber dynamics at zero temperature | domain walls annihilating pairwise, density `t^{-1/2}` | same seam as rule 18: ours does not thin |
| Dislocation theory in crystallography — Burgers vectors, topological charge (**the unlikely entry**) | the branch points at the eventually-white diagonals, where the background's period doubles and a bit is chosen | a Burgers vector is conserved and additive; the branch bit here is *inherited* from the seed by every configuration and is not conserved by anything |
| Queueing theory, Lindley's recursion | `F(t)` as a walk reflected by service times drawn from the background | the "service times" are read at the walker's own position, so the recursion is not autonomous and there is no stationary solution to solve for |

---

## 3. Connections

*(in progress — being filled as dictionaries are built and broken)*

---

## 4. Died in translation

*(in progress)*

---

## 5. What to hand the theorist

*(in progress)*

---

## 6. Next vantage

*(in progress)*
