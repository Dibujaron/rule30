# Communication complexity of elementary cellular automata, as a subject

*A sighting by Astrolabe, 2026-09-13. Vantage: the communication complexity of
cellular automata as a field — Dürr–Rapaport–Theyssier's classification of the
256 elementary rules, its lineage through Goles–Guillon–Rapaport and
Goles–Meunier–Rapaport–Theyssier, and the lower-bound technology of one-way,
two-way and multiparty communication complexity. Aimed at Prize 3, with the
wall `centerColumn_other_isEventuallyPeriodic_of_center` as the residual of
record.*

**Band first. Project-internal, with four measured rows that are
novel-and-small** (§3.2, §3.3, §3.4, §3.5). The vantage does not reach P3 and
dies at the same seam as the proof-complexity and algebraic-circuit vantages —
**the prize fixes the input, and a communication bound is a statement about a
matrix, while the single seed is one entry of it, at which every protocol costs
zero bits.** The brief asked me to say that early and plainly, so it is the
first sentence of §3.1 as well.

What is new, and what a captain should take, is four measurements, all exact and
exhaustive, all with the linear-rule control firing where the brief said it must:

1. **Dürr–Rapaport–Theyssier's own open question for rule 30 is settled by
   measurement — not by proof, and the distinction is theirs as much as mine.**
   They put rule 30 in the class "Other" and say of that class only that `d_n`
   "seems" polynomial for some rules and exponential for others. For rule 30 it
   is exponential, and the measured reading is base exactly two: the deficit
   `n − log₂ d_n` falls `0.193, 0.199, 0.111, 0.090, 0.060, 0.059` over
   `n = 8…13`, so the **one-way** communication complexity of prediction is
   maximal to within a sixteenth of a bit at `n = 13`. That `d_n/2^n → 1` is a
   reading of six numbers and is not a theorem — nothing at finitely many `n`
   can be. What the range does say flatly is `d_n > 2^{n−1}` at every `n` from
   `4` to `13`, which is already outside DRT's "polynomial" alternative
   throughout the range they themselves computed.
2. **Rule 30 is the maximiser of `d_n` over all 256 elementary rules at `n = 8`
   and `n = 9`** — the two values an exhaustive sweep over all 256 rules could
   reach — tied only with its own symmetry class `{30, 86, 135, 149}`, where at
   `n = 6, 7` it is *fifth*, behind `{106, 120, 169, 225}`. The lead is two
   values old and should be read as such. No rule attains the ceiling `2^n` at
   any `n ≤ 9`.
3. **The two sides are not alike, and the difference is the `OR`.** The left half
   of row 0 transmits `1.036` bits per cell to the origin and the right half
   transmits **`0.5002`**. Among the sixteen left-permutive rules — all of the
   form `l XOR g(c,r)`, sharing their left structure exactly — **all eight with
   an affine `g` give exactly zero**, and of the eight with a non-affine `g`,
   six run at `0.467–0.521`. Crystal 66's `OR → XOR` filter fires at maximum
   sharpness: *whether* the right half can say anything is the non-linearity and
   nothing else. *Why the value is near a half* I proposed a mechanism for — the
   `OR` masking the right neighbour at the black times — and then refuted it
   with its own control, at correlation `−0.0000` over the sixteen. §4 carries
   the refutation; the constant is a number without an explanation.
4. **The *two-way* complexity is not `n`; it is `n/2`, and it is pinned to within
   one bit.** The rank of the communication matrix is capped by the *right*
   side's small class count and attains that cap (`45` against `46` at
   `n = 10`), so `⌈log₂ rank⌉ ≤ D ≤ ⌈log₂ cols⌉ + 1` closes to `D ∈ {6, 7}` at
   `n = 10`. **This corrects my own previous sighting**, which read the same
   rank as "the left half cannot tell the origin what it needs in fewer than
   about `t/2` bits". The rank measures the *right* half, not the left, and the
   left half's true cost is `n − o(1)`, twice as much.

And one negative that is the sharpest thing in the document: the one problem
this field has posed that is **literally about the centre column** —
Goles–Guillon–Rapaport's *traced* complexity — ranks rule 30 as **easy** and the
linear rules as **maximally hard**, at the seed's own target word. §3.5.

---

## 1. The problem, seen from outside

Take a bi-infinite row of bits, all `0` except a single `1` at the origin.
Update every bit at once, forever, by *new bit = (left neighbour) XOR (self OR
right neighbour)*. Write down the origin's bit after each update. That is one
completely explicit infinite bit sequence, computed here to ten million terms.
The question is whether it is eventually periodic — whether there is any point
past which it cycles. Nobody has found a cycle and nobody can rule one out. A
proved theorem (Jen) says at most one position's bit sequence can ever be
eventually periodic, which makes the wall on this board — *if the origin's
sequence repeats then some other position's does* — logically equivalent to
*the origin's sequence never repeats*. So the residual is: **prove that one
explicit sequence is not eventually periodic.**

The vantage aims one rung above that, at Wolfram's third question: can the
`t`-th bit be obtained substantially faster than by running the rule for `t`
steps? An eventually periodic sequence is computable in time polynomial in
`log t`, so an affirmative answer to the third question implies the residual;
nothing short of a full Prize 3 lands here, which is worth saying before any
dictionary is built.

**In communication complexity's own terms.** Two players are each given half of
a finite word. Alice holds the `n` letters to the left of a marked centre, Bob
holds the `n` letters to the right, the centre letter is fixed and known to
both, and together they must name the letter that will stand at the centre after
`n` synchronous local updates. They may talk; the measure is the number of bits
they must exchange in the worst case. The field's question is how that number
grows with `n` as the local update rule varies over the 256 possibilities; the
project's residual is a question about the *single* input pair in which both
halves are entirely blank. Those two sentences are the whole of this document's
tension, and §3.1 is about which of them wins.

---

## 2. Fields sighted

| Field or theory | The object there | The seam, in one line |
|---|---|---|
| Dürr–Rapaport–Theyssier's CA classification (TCS 2004) | `d_n`, the largest of the four row/column counts of `M_0^n` and `M_1^n` | rule 30 is in the residual class "Other", placed there by brute force to `n ≤ 12` with **no proof of anything**, and the class mixes polynomial with exponential |
| One-way (Alice→Bob) communication complexity | `⌈log₂ d_n⌉`, exactly (Fact 7 of arXiv cs/0111062) | maximal for rule 30 (§3.2), and one-way complexity is *not* a lower bound on two-way, which is the trap §3.3 exists to avoid |
| Two-way deterministic complexity and the log-rank bound | `rank` of the same matrix over ℚ | the rank is capped by the *smaller* of the two class counts, which for rule 30 is the right half's `2^{n/2}`, so log-rank can never prove more than `n/2` here — and `n/2` is the truth (§3.3) |
| Nečiporuk's method for formula size | `Σ_i log₂ s_i` over a partition into blocks; `d_n` is one such term | **the one unconditional technology in the vantage that applies to a fixed explicit family**; its own ceiling is `Θ(n²/log n)`, one log below the simulation (§3.4) |
| Goles–Guillon–Rapaport, traced communication complexity (2011) | `f^z(u,v) = [trace(u·z₀·v) = z]` — the **centre column** is the object | the measure's proved hard cases are the *bipermutive* rules, whose centre columns are trivial; at the seed's own `z` rule 30 is easy and rule 90 maximal (§3.5) |
| Goles–Meunier–Rapaport–Theyssier, communication complexity and intrinsic universality (2009) | `Pred_F`, `Inv_F^u`, `Cycle_F^k` as *necessary conditions* for universality | the theorems are contrapositives — they prove rules **non**-universal. They can exclude rule 30 from a class; they cannot certify hardness |
| Number-on-forehead multiparty complexity, BNS discrepancy | the `t` diagonals of the light cone as `t` parties | dead by arithmetic: every NOF bound decays at least like `2^{-k}` in the number of players, so `k = t` parties is vacuous before the rule is named (§4) |
| Nondeterministic / covering complexity | the number of monochromatic rectangles covering the YES set | the seed's own fibre is 12 rows by 4096 columns at `n = 12` — nearly a rectangle, hence *cheap*, which is the wrong direction (§3.5) |
| Communication-to-time reductions (streaming, branching-program width, VLSI area–time) | the only bridges from bits-exchanged to a cost model P3 could use | each needs the computation to be *forced* through a bottleneck; a machine reading a tape is under no such constraint, which is the seam between this vantage and P3 |
| Kůrka's permutivity and Lyapunov exponents | left-permutivity ⇒ the right Lyapunov exponent is `1` | this is exactly the `1.036` bits per cell measured from the left; the field's classification is a Lyapunov statement in different clothes, and it says nothing about the left-moving direction, which is where rule 30's content is |
| Information theory of the half-line decomposition (the project's own crystal 40) | the centre column *is* the transcript of the natural two-party protocol | a genuine structural identification the algebraic and proof-complexity vantages lacked — and purely structural: a fixed input has zero communication cost (§3.1) |
| Myhill–Nerode / transducer minimisation | `d_n` is the number of Nerode classes of left half-rows under "same effect on the origin at time `n`" | this is obstruction 11/24's reachable-row automaton in a third vocabulary; the counts differ because the equivalence is coarser |
| Circuit complexity of prediction (`P`-completeness of CA prediction) | rule 110's universality | universality is about the *configuration* channel and the prize fixes the configuration — the seam that killed my proof-complexity sighting, and rule 110's `d_n` is *lower* than rule 30's, so the two notions are not even correlated |

---

## 3. Connections

### 3.1 The literature answer, and the seam, stated before anything else

**The claim.** Nothing is proved about rule 30 in this model, by anyone; its
class assignment is a brute-force measurement its authors explicitly decline to
stand behind; and the vantage dies at the same seam as the last two, because
the single seed is the matrix entry at which Alice and Bob each hold the blank
string and no protocol needs to say anything at all.

**The dictionary.**

| This project | Communication complexity of CAs | Measured / fetched |
|---|---|---|
| row 0 of the picture, restricted to the light cone | the input word `b_i^← · c · b_j`, `2n+1` letters | DRT's `M_c^n` |
| the left half of row 0 | Alice's input, `n` cells | — |
| the right half of row 0 | Bob's input, `n` cells | — |
| the centre cell at time `t` | the value `f^n(b_i^←, c, b_j)` the players must agree on | — |
| the cone map `P_t` of my algebraic sighting | the same function, written as a matrix instead of a polynomial | the matrix *is* the truth table of `P_t` reshaped |
| "is rule 30 hard here?" | is `d_n` bounded, linear, or other? | **"Other"**, quoted below |
| how that was decided | brute force | **"We did brute force computations in order to compute dₙ for n∈{1,…,12} and for all ECAs"** |
| how confident the field is | — | **"Most of the time we don't have mathematical evidence for determining whether a rule belongs to one class rather than to another."** |
| **the single seed** | **the entry `(u, v) = (0^n, 0^n)` with centre `1`** | **one entry of a `2^n × 2^n` matrix** |
| **the seam** | **a protocol's cost is a worst case over all inputs; on a fixed input pair the empty protocol is correct, so the seed's communication complexity is `0` bits at every `n`** | not a measurement — a triviality, and it is the whole seam |
| the structural consolation | by crystal 40 the two half-lines are each determined by the centre column alone, so the centre column **is** the transcript of the natural protocol | real, and purely structural: §3.3's protocol shows the transcript can be halved, and halving a transcript is not a time shortcut |

**What it leans on.** All four rows are fetched from the ar5iv rendering of the
paper at <https://ar5iv.labs.arxiv.org/html/cs/0210008>, whose abstract page
<https://arxiv.org/abs/cs/0210008> gives the title, the authors Christoph Dürr,
Ivan Rapaport and Guillaume Theyssier, and the abstract:

> "The model of cellular automata is fascinating because very simple local rules
> can generate complex global behaviors. The relationship between local and
> global function is subject of many studies. We tackle this question by using
> results on communication complexity theory and, as a by-product, we provide
> (yet another) classification of cellular automata."

The definition:

> "M₀ⁿ(i,j) := fⁿ(bᵢ←, 0, bⱼ) where bₖ is the binary representation of the
> integer k on exactly n bits"

> "dₙ as the maximum of the 4 following integers: number of different rows of
> M₀ⁿ, number of different columns of M₀ⁿ, number of different rows of M₁ⁿ,
> number of different columns of M₁ⁿ."

The three classes:

> "Bounded: there is b∈ℕ such that ∀n: dₙ≤b. Linear: there are values a₀∈ℕ and
> a₁∈ℚ such that dₙ=⌊a₁n⌋+a₀, for all n≥n₀ for some fixed value n₀. Other: in
> this class we put rules where none of above applies."

> "Other: in this class we put rules where non of above applies. In some cases
> dₙ seems to be bounded by a polynomial in n, and in some cases dₙ seems to be
> exponential."

And the three lists, transcribed in full and carried into
`explorer/astrolabe4_dn.mjs` as data:

> Bounded: 0, 1, 2, 3, 4, 5, 7, 8, 10, 12, 13, 15, 19, 24, 27, 28, 29, 32, 34,
> 36, 38, 42, 46, 51, 60, 71, 72, 76, 78, 90, 105, 108, 128, 130, 136, 138, 140,
> 150, 154, 156, 160, 170, 172, 200, 204
>
> Linear: 11, 14, 23, 33, 35, 43, 44, 50, 56, 58, 77, 132, 142, 152, 168, 178,
> 184, 232
>
> Other: 6, 9, 18, 22, 25, 26, **30**, 37, 40, 41, 45, 54, 57, 62, 73, 74, 94,
> 104, 106, 110, 122, 126, 134, 146, 164

**The brief's premise, checked.** The brief said the paper "puts rules 60, 90,
105 and 150 in the bounded class, and leaves rule 30 in an unresolved class".
Both halves are right: all four named rules are in the Bounded list above, and
rule 30 is in Other. A web-search summary I was handed early said instead that
rule 30 is "categorized under exponential communication complexity (2^n), along
with Rules 45 and 106" — **that is not in the paper**; the paper has no
exponential class, and the sentence is the search engine's gloss. Recorded
because it is exactly the failure mode the brief's citation rule exists for: the
summary was specific, confident, and wrong about the one fact the session turned
on.

**The test.** `explorer/astrolabe4_dn.mjs` recomputes `d_n` from the definition
above for all 256 rules and checks my classification against those three lists:
**73 of the 88 rules DRT name are placed in the same class**, with all fifteen
disagreements explained by my own crude classifier rather than by the data —
DRT's "linear" allows slope `a₁ ∈ ℚ`, so rules whose `d_n` reads `2,2,3,3,4,4`
(slope `1/2`) fail my constant-first-difference test, and rule 1's `d_n` is
`2,3,2,3,2,3`, bounded but not eventually constant. The decisive validation is
not that count but `explorer/astrolabe4_deep.mjs` block `[V]`, which reproduces
the paper's only published numeric theorem:

> Lemma 10: "For rule 132 we have dₙ=n+1"

Measured: rule 132 gives `d_n = 2,3,4,5,6,7,8,9,10,11` at `n = 1…10`, and rule
23 the same, both an exact match. So the implementation is the paper's
definition and not a cousin of it.

**What it would give.** Nothing toward the residual, and the reason is one line
rather than an argument. What it gives a captain is the price: **a P3 proposal
whose value comes from a communication bound about rule 30 is refuted in advance
by the fixed seed**, in the same way and for the same reason that
`docs/prize.md`'s circuit-size trap refutes a circuit proposal — and this is now
the third vantage in four days to break at that row.

---

### 3.2 `d_n → 2^n`: the one-way complexity is maximal, and rule 30 is the maximiser over all 256 rules

**The claim.** For rule 30 the number of distinct rows of the communication
matrix is `(1 − o(1))·2^n` — Alice must send essentially her entire input and
may compress it by less than a tenth of a bit at `n = 13` — and at `n = 8` and
`n = 9`, the two values I could check over all 256 rules, no elementary rule has
a larger `d_n` than rule 30's.

**The dictionary.**

| This project | Communication complexity | Measured (`astrolabe4_dn.mjs`, `astrolabe4_deep.mjs`, `astrolabe4_seed.mjs`) |
|---|---|---|
| the left half of row 0 | Alice's `n` cells | — |
| two left halves that the origin cannot tell apart at time `n` | two Alice inputs giving the same row of `M_0^n` | — |
| the number of distinguishable left halves | `#rows(M_0^n) = d_n` for rule 30 | `2, 4, 4, 14, 22, 46, 106, 224, 446, 948, 1924, 3930, 7862` at `n = 1…13` |
| "the left half must be sent in full" | `⌈log₂ d_n⌉ = n` | deficit `n − log₂ d_n` = `0.193, 0.199, 0.111, 0.090, 0.060, 0.059` at `n = 8…13`; `d_n/2^n` = `0.875, 0.871, 0.926, 0.939, 0.959, 0.959` |
| the bits-per-cell rate | least-squares slope of `log₂ d_n` against `n`, over `n = 7…13` | **`1.0362`** |
| the linear controls the brief demands | rules 60, 90, 105, 150, 170, 204 | `d_n` constant at `1` or `2` at every `n ≤ 11`, exactly as required |
| rule 30 against the other 255 | rank by `d_n` | **1st at `n = 8` and `n = 9`** (tied only with `86, 135, 149`, its reflection/complement class); 5th at `n = 6, 7` behind `106, 120, 169, 225` |
| the ceiling | is `d_n = 2^n` attained? | **by no rule at `n = 6, 7, 8, 9`** — so a *positive* deficit is a class property of locality and carries no information; what carries information is the deficit **tending to zero** |
| **the seam** | **this is the one-way complexity, `D^{A→B}`, which is not a lower bound on the two-way complexity `D`** | §3.3: the two-way answer is half this |
| **the second seam** | **it is about the cone map with a free row 0** | the seed's Alice-input is `0^n`, one row of `2^n` |

**What it leans on.** The identification of `d_n` with one-way complexity is a
fetched theorem, not folklore I am asserting —
<https://ar5iv.labs.arxiv.org/html/cs/0111062>, Hartmut Klauck, *One-way
communication complexity and the Nečiporuk lower bound on formula size*
(author and title confirmed at <https://arxiv.org/abs/cs/0111062>; my first
draft guessed a different author and the guess was wrong, which is why the
abstract page was fetched), Fact 7:

> "D(f) = ⌈log row(f)⌉"

with the model, Definition 3:

> "Alice sends a binary encoded message to Bob, who then computes the function
> value. The complexity of a protocol is the worst case length of the message
> sent (over all inputs)."

**The test.** Everything above is exhaustive enumeration over all `2^n` inputs
per side, bit-parallel over the free side, with the light cone and an evolving
uniform background so that non-quiescent rules are handled correctly; the
implementation is validated against DRT's Lemma 10 in §3.1. The statement for a
theorist to falsify: ***`n − log₂ d_n` is bounded above by a constant for rule
30, and tends to zero*** — measured falling by a factor of three over `n = 8…13`
and never yet zero. A single `n` at which the deficit *rises* past `0.2` would
kill the reading; note it already rose once, from `0.193` at `n = 8` to `0.199`
at `n = 9`, so the trend is a trend and not a law. The maximality claim is
checked exhaustively at `n = 8` and `n = 9` only; `n = 10` over all 256 rules
was not run and the claim should be read as covering those two values.

**Honesty about novelty.** DRT say in the sentence quoted in §3.1 that they
computed `d_n` for `n ∈ {1,…,12}` for every elementary rule. So they *had* these
numbers; what the text I could read does not contain is the values, the reading
"exponential with base exactly 2 for rule 30", or the identification of the
maximiser. Treat the values as a re-derivation of something computed in 2002 and
not published, and the two readings as new. Neither is a theorem.

**What it would give.** For the cone map, a genuine information-theoretic fence:
no shortcut that works by *summarising the left half of row 0* can use fewer
than `n − o(n)` bits. That is a real statement about rule 30, it separates rule
30 from the linear rules by `n` against `O(1)`, and it says nothing whatever
about the fixed seed, whose left half is blank.

---

### 3.3 The right half runs at half a bit per cell, the split is the non-linearity, and the two-way complexity is therefore `n/2` and not `n`

**The claim.** The two halves of row 0 are not symmetric and the asymmetry is
exactly one factor of two: the left transmits `1.036` bits per cell to the
origin and the right transmits `0.5002`. Because the rank of the communication
matrix cannot exceed the number of distinct *columns*, this caps the log-rank
bound at `n/2` — and the cap is attained, so the two-way deterministic
complexity of rule 30's prediction problem is `n/2` to within one bit, achieved
by the protocol *"Bob announces which of his `2^{n/2}` classes he is in"*. The
trivial `n`-bit protocol — which is what running the automaton does — is a
factor of two from optimal. **Whether the right half can say anything at all is
decided by whether `g` is affine, measured over all sixteen left-permutive
rules; why the value is near a half I proposed a mechanism for and then refuted
it, below.**

**The dictionary.**

| This project | Communication complexity | Measured (`astrolabe4_deep.mjs`, `astrolabe4_gate.mjs`, `astrolabe4_rank.mjs`) |
|---|---|---|
| left-permutivity, `rule30_leftPermutive` | Alice's side loses nothing | left rate `1.0362` bits/cell |
| the `OR` at the origin: when the centre is black the right neighbour drops out of the rule (`column_succ_of_black`, crystal 39) | Bob's side loses half | `#cols(M_0^n)` = `2, 2, 3, 5, 7, 11, 14, 23, 29, 46, 59, 89, 114` at `n = 1…13`; right rate **`0.5002`** over `n = 7…13` |
| obstruction 34's *invisibility lemma* — the left half sees column 1 only at the **white** times of column 0 | the same masking, one column further in: for `g = c OR r` the right argument is visible exactly at the white cells, and white cells are half of them | **REFUTED as the mechanism, by my own control.** The visibility fraction is `0.5004` for rule 30, which matches — and it is `0.4984` for rule 180 (rate `0.0857`), `0.4969` for rule 210 (rate `0.0000`), and `1.0000` for all four bipermutive rules (rate `0.0000`). Pearson correlation of visibility against rate over the sixteen: **`−0.0000`**. The agreement at rule 30 is a coincidence (`explorer/astrolabe4_mask.mjs`) |
| crystal 66's filter, `OR → XOR` | replace `g` in `l XOR g(c,r)` | **the eight affine `g` — `0, 1, c, ¬c, r, ¬r, c⊕r, ¬(c⊕r)`, i.e. rules `240, 15, 60, 195, 90, 165, 150, 105` — give a rate of exactly `0.0000`, their `cols` constant at `1` or `2` forever.** Of the eight non-affine `g`, six give `0.5213 (135), 0.5167 (30), 0.4777 (120), 0.4745 (75), 0.4684 (45), 0.4672 (225)`, and the two exceptions are `c ∧ ¬r` (rule `180`, `0.0857`, `cols` oscillating `1,2,1,2,…`) and `¬c ∧ r` (rule `210`, `0.0000`) |
| the same restricted to a white quiescent background | the eight left-permutive quiescent rules | only **two** transmit anything leftward, and they are `g = c OR r` (rule 30) and `g = c AND r` (rule 120); `g ∈ {0, c, r, c XOR r, c AND ¬r, ¬c AND r}` all give a *constant* column count. Rule 30 has the larger rate |
| the log-rank lower bound on two-way cost | `D(f) ≥ log₂ rank_ℚ M` | `rank` mod a large prime: `3, 5, 7, 11, 14, 23, 29, 45` at `n = 3…10` |
| why the rank cannot be larger | `rank ≤ #distinct columns` | the two agree at every `n ≤ 9` and differ by one at `n = 10` (`45` against `46`) — the matrix is as full rank as its column count permits |
| the matching upper bound | Bob sends his column class: `D ≤ ⌈log₂ cols⌉ + 1` | so `D ∈ {6, 7}` at `n = 10`, against a trivial `10` |
| the linear controls | rules 90, 150 | rank exactly `2` at every `n ≤ 10`, so `D ≤ 2`: constant, as the brief requires |
| **the seam, and it is a correction to my own previous sighting** | **the rank measures the *smaller* side. My algebraic-circuit document read the same rank as "the left half cannot tell the origin what it needs to know in fewer than about `t/2` bits". That attributes the bound to the wrong half** | the left half needs `n − o(1)` (§3.2), twice as much; the `t/2` is the *right* half, and it is an upper bound on the whole problem as well as a lower one |
| **the second seam** | **halving a transcript is not a time shortcut** | Bob still has to *compute* his class, which costs a full simulation. Communication is not time, and this is where the vantage stops touching P3 |

**What it leans on.** The log-rank bound, fetched at
<https://en.wikipedia.org/wiki/Communication_complexity>:

> "the input matrix or communication matrix…where the rows are indexed by x ∈ X
> and columns by y ∈ Y. The entries of the matrix are A_{x,y} = f(x,y)"

> "D(f) is known to be bounded from below by the logarithm of the rank of the
> matrix Mf"

The upper bound `D ≤ ⌈log₂ #cols⌉ + 1` is Fact 7 above, applied with the players
exchanged, plus one bit to return the answer. That `rank ≤ #distinct columns`
is linear algebra and is stated here as reasoning, not as a citation.

**The test.** `explorer/astrolabe4_rank.mjs` builds the matrix with a scalar
simulator sharing no code with the bit-parallel one used for the counts, and the
two agree on the column counts at every `n ≤ 9`; the rank routine is validated
against uniformly random `0/1` matrices, which return `256/256` and `512/512`
over the prime and `255/256`, `510/512` over `F₂`. Ranks are taken modulo
`p = 1000003`, which lower-bounds the rational rank, so the bound is one-sided
in the safe direction. The statement for a theorist: ***`#cols(M_0^n)` for rule
30 is `Θ(2^{n/2})`, so the two-way complexity of rule 30's prediction problem is
`n/2 + O(1)`*** — measured at slope `0.5002` over seven consecutive `n`, with
the sixteen-rule control showing that the rate is zero for every affine `g` and
positive for six of the eight non-affine ones.

**The mechanism I proposed for the constant `1/2` is refuted, by a control I
ran after writing it down.** The story was: for `g = c OR r` the right argument
drops out of the rule whenever the centre is black, the centre is black half the
time, so half of Bob's bits never reach the origin and the rate is `1/2`. That
is obstruction 34's invisibility lemma one column out, it agrees with the
measurement to four decimals, and it is wrong. `explorer/astrolabe4_mask.mjs`
computes, for each of the sixteen left-permutive rules, the fraction of in-cone
updates at which the right argument is visible — `g(c,0) ≠ g(c,1)` — over 4,000
random windows at `n = 12`, and compares it with the rate:

| rule | `g` | visible when | visibility | rate |
|---|---|---|---|---|
| 30 | `c OR r` | `c = 0` | `0.5004` | `0.5167` |
| 180 | `c AND ¬r` | `c = 1` | `0.4984` | **`0.0857`** |
| 210 | `¬c AND r` | `c = 0` | `0.4969` | **`0.0000`** |
| 90, 105, 150, 165 | affine in `r` | always | **`1.0000`** | **`0.0000`** |

Pearson correlation over the sixteen: **`−0.0000`**. The four bipermutive rules
sit at the opposite extreme from the prediction — their right argument is
*always* visible and their rate is *zero* — because for an affine rule the
origin at time `n` is a fixed XOR of the two cone edges, so Bob's half
contributes exactly one bit however visible it is. Masking is not what the rate
measures.

**So what survives is the affine/non-affine split and not the constant.** Eight
affine `g` give exactly zero; six of the eight non-affine give `0.467–0.521`;
`c ∧ ¬r` and `¬c ∧ r` are unexplained exceptions; and *why the six cluster near
a half* I do not know. Crystal 66's filter fires, and it fires on the presence
of non-linearity rather than on any quantity I can name. The `0.5002` is a
measured slope with a working control against affine rules and **no mechanism**,
and a captain should treat it as a number rather than as an explanation.

**What it would give.** The vantage's cleanest result in the project's own
objects: **the two half-lines of rule 30's picture must exchange `Θ(t)` bits to
determine the centre cell at time `t`, with the constant `1/2`, and exchanging
`O(1)` suffices for every linear rule.** That is DRT's Bounded-versus-Other
split turned from a measured class into a rate with a working control — though
not, after the refutation above, into a rate with a mechanism. It touches no
part of the residual.

---

### 3.4 `d_n` is a Nečiporuk term, Nečiporuk is the vantage's one unconditional technology, and rule 30 saturates it — one log factor below the simulation

**The claim.** The brief asks which lower-bound technology here is
unconditional and applies to a fixed explicit family. The answer is Nečiporuk's
method and only Nečiporuk's method, because `d_n` *is* a Nečiporuk term; rule
30's cone map saturates the method's per-block ceiling as `t` grows, where the
linear rules are flat at the floor; and the method's own maximum is
`Θ(n²/log n) = Θ(t²/log t)`, one logarithm below the simulation's `O(t²)` — so
the informative window is again a single log factor wide, exactly as in my
algebraic sighting, reached from an unrelated field.

**The dictionary.**

| This project | Nečiporuk's method | Measured (`explorer/astrolabe4_necip.mjs`) |
|---|---|---|
| the cone map `P_t`: the origin at time `t` over a free row 0 | the Boolean function `f` on `n = 2t+1` variables | — |
| any set of row-0 cells | a block `S_i` of variables | — |
| fixing everything outside that set | an `S_i`-subfunction | — |
| how much the block can say | `s_i`, the number of distinct subfunctions | for `b = 3` at `t = 6`, per position: `8, 42, 82, 94, 116, 124, 110, 78, 34, 20, 8` |
| the left/right asymmetry of §3.3, seen locally | the same counts read from the two ends | left `42, 82, 94, 116` against right `110, 78, 34, 20`: the left is strictly richer at every matched distance |
| the mirror rule 86 | the reflected partition | **exactly the reversed list**, `8, 20, 34, 78, 110, 124, 116, 94, 82, 42, 8` — the session's orientation control, and it fires |
| the bound | `L(f) ≥ (1/4) Σ_i log₂ s_i` | at `t = 8`, `b = 3`: `7.87` for rule 30, against a trivial `n − 1 = 16` |
| the method's own ceiling per block | `log₂ s_i ≤ min(2^b, n−b)` | saturation `log₂ s / 2^b` for `b = 3` runs `0.476, 0.588, 0.719, 0.869, 0.957, 0.996, 1.0000` at `t = 3…9` — **the block saturates completely** |
| the same at `b = 4` | — | `0.188, 0.294, 0.366, 0.458, 0.542, 0.629, 0.709` at `t = 3…9`, rising with no sign of stalling |
| the linear controls | rules 90, 150, 105, 60 | `s_i = 2` at **every** block, every `b`, every `t`: saturation flat at `0.125` (`b=3`) and `0.0625` (`b=4`), the bound `O(n/b)` — below trivial. The control separates by a doubly-exponential margin |
| **the seam** | **the method's maximum is `Θ(n²/log n)`**, quoted below | so the best conceivable output is `Θ(t²/log t)`, below the `O(t²)` simulation — the same one-log window my algebraic sighting found, from a different field |
| **the second seam** | **formula size is not time, and the cone map is not the sequence** | a Nečiporuk bound is a statement about `De Morgan` formulas for a non-uniform family; P3 asks about a uniform machine on a fixed input |
| the honest size at reachable `n` | the method beats the trivial `n−1` only for large `n` | the **exact** ceiling `max_b ⌊n/b⌋·min(2^b, n−b)/4` is `13` at `n = 17` against a trivial `16`; it first crosses at `n = 20` and holds from `n = 24` (`t ≈ 12`) on (`explorer/astrolabe4_ceiling.mjs`). So **nothing measured here is yet a non-trivial bound, and nothing could have been** |

**What it leans on.** Both halves fetched at
<https://ar5iv.labs.arxiv.org/html/cs/0111062>. The theorem, Fact 14:

> "Let f be a Boolean function on n variables. Let S₁,…,Sₖ be a partition of the
> variables and sᵢ the number of Sᵢ-subfunctions on f. Then every deterministic
> Boolean formulae for f has size at least (1/4)∑ᵢ₌₁ᵏ log sᵢ."

and the limit:

> "The largest lower bounds provable with Nečiporuk's method are of the order
> Θ(n²/log n)."

**The test.** The script enumerates every one of the `2^{n−b}` assignments to
the complement of each block and computes the subfunction bit-parallel over all
`2^b` block assignments, so every `s_i` is exact. The statement for a theorist:
***for rule 30's cone map, `log₂ s_i` attains `min(2^b, n−b)` for the central
blocks once `n` is large enough, at every `b`*** — measured true at `b = 3` from
`t = 9`, on track at `b = 4`, and false for every linear rule at every `b` and
`t`. If it holds at `b = Θ(log n)` then Nečiporuk yields an unconditional
`Ω(t²/log t)` De Morgan formula-size lower bound for the cone map, which would
be **the first unconditional complexity lower bound about any rule 30 object in
a standard model**. Its `DOES NOT PROVE` field would have to say: nothing about
any prize.

**One thing that cuts against rule 30 being special here.** Rule 22 beats rule
30 on every Nečiporuk term measured — `s = [266, 1647, 1738, 671]` against rule
30's `[53, 568, 1074, 52]` at `t = 8`, `b = 4`, and a bound of `9.72` against
`7.66` — while having a *lower* `d_n` (`122` against `446` at `n = 9`). The two
measures disagree about which rule is hardest, which is a reason to treat either
ranking as a property of the measure rather than of rule 30.

---

### 3.5 The field's one problem about the centre column ranks rule 30 *below* the linear rules, at the seed's own target word

**The claim.** Goles–Guillon–Rapaport's *traced* communication complexity is
the only problem this field has posed whose object is literally the centre
column, and it disqualifies itself as a measure of irreducibility twice over:
its proved hard case is the bipermutive rules, whose centre columns are trivial;
and measured at the seed's own centre column as the target word, rule 30's
problem costs **four bits** at `n = 12` where rule 90's costs the full `n`.

**The dictionary.**

| This project | Traced communication complexity | Measured (`explorer/astrolabe4_seed.mjs`) |
|---|---|---|
| the centre column, times `0…n` | the trace `T_f(w)`, and the target word `z` | — |
| the single seed | `u = 0^n`, `v = 0^n`, `z₀ = 1` | — |
| **the seed's own centre column** | the target `z = 1101110011000` at `n = 12` | computed from the rule, not typed: its first eleven bits `11011100110` are the board's own recorded prefix (Talus's correction of 2026-09-12, and `Basic.lean`'s `settledCenter` example, which agrees over this range). Computed rather than typed on purpose: the board records two sessions in which this prefix was written from memory and was wrong both times |
| "which configurations have the seed's centre column" — crystal 40's family, obstruction 5's *one left side* | the YES-set of `f^z` | `|YES| = 2^n` **exactly** at every `n = 2…12` |
| that exactness | — | **a class property, not a rule 30 fact**: rules 45, 90 and 150 give `2^n` too. It is left-permutivity — the leftward solve (crystal 9) determines `u` from `(z, v)`, so there is at most one `u` per `v` |
| how many left halves can produce the seed's column at all | the number of distinct non-empty rows of `f^z` | `1, 2, 2, 2, 2, 3, 5, 5, 5, 10, 12` at `n = 2…12` — **12 of 4096** at `n = 12` |
| the cost to Alice | `⌈log₂(#distinct rows)⌉` | `⌈log₂ 13⌉ = **4 bits**` at `n = 12`, against a trivial `12` |
| the linear control | rule 90 and rule 150 at their own seed targets | the YES-set is a **permutation matrix**: `256` distinct non-empty rows at `n = 8`, `1024` at `n = 10`, each a singleton. Alice must send everything: `n` bits |
| that control against the paper's own theorem | Proposition 14 | the permutation matrix has rank `2^n`, so `D = n`, which **is** Proposition 14 for these rules at these `n` — a second validation against the literature |
| rule 45 | left-permutive, not right-permutive, like rule 30 | `5` rows at `n = 8`, `6` at `n = 10`: the same shape as rule 30 |
| **the seam** | **the measure's hard cases are the right-permutive rules, and right-permutivity is exactly what rule 30 lacks** | so rule 30 escapes both of the paper's lower-bound theorems, and it escapes them *for the reason §3.3 measures* |
| **the second seam** | **the direction is wrong**: few rows means the problem is *easy*, and the seed's fibre being almost a rectangle is a statement that the model cannot see rule 30 | — |

**What it leans on.** <https://arxiv.org/abs/1102.3522>, authors Eric Goles,
Pierre Guillon and Ivan Rapaport (*not* the Goles–Meunier–Rapaport–Theyssier
line my brief named, which is arXiv 0912.1777 — both are in the lineage and they
are different papers), abstract:

> "We study cellular automata with respect to a new communication complexity
> problem: each of two players know half of some finite word, and must be able
> to tell whether the state of the central cell will follow a given evolution,
> by communicating as little as possible between each other."

and from <https://arxiv.org/html/1102.3522>, the function,

> "f^z: A^[−n,1] × A^[1,n] → {0,1} (u,v) ↦ {0 if T_f(uz_0v) = z; 1 otherwise}"

Proposition 14,

> "For any bipermutive CA and any word z ∈ A^(n+1), the multi-round CC of f_z is
> equal to n log A."

Proposition 13,

> "If f is an expansive CA with m = 1/t_f→ + 1/t_f← − 1 > 0 and n > 0, then there
> exists some word z ∈ A^(n+1) such that the multi-round CC of f_z is
> lower-bounded by nm log |A|."

and the sentence that closes the route for rule 30,

> "The expansive elementary CA are exactly the four bipermutive ones (90, 150,
> 105, 165)."

Corollary 18,

> "The CA 18, 26, 146, 154, 218 have a multi-round CC in Ω(n)."

**Rule 30 appears nowhere in that paper.** Two fetches, one of the abstract page
and one of the full HTML with a prompt asking specifically for it, both came
back empty; and the structural reason is in the two propositions — rule 30 is
left-permutive but not right-permutive, hence neither bipermutive nor expansive,
so neither hypothesis is satisfied.

**The test.** Exhaustive over all `4^n` pairs to `n = 12`, with the trace
computed by a scalar simulator. The statement for a theorist: ***the number of
left half-rows of width `n` compatible with the seed's centre column prefix of
length `n+1` is `2^{o(n)}`*** — measured `12` at `n = 12`, growing at about
`2^{0.3n}`. That statement is worth having independently of this vantage,
because it is obstruction 5's "there is really only one left side of rule 30"
counted exactly at finite depth in a class nobody here has used.

**What it would give.** Nothing, and the *nothing* is the point: this is the one
place in the field where the seed has a role at all — it supplies the target
word `z` — and the role makes rule 30 look easy. Together with Proposition 14 it
gives a captain a fence: **a proposal that reads a communication bound as
evidence for computational irreducibility is refuted in advance, because in this
field's own centre-column problem the four rules with the simplest possible
centre columns are the proved hard cases.**

---

## 4. Died in translation

- **"The factor-two gap in my previous sighting closes upward to `t`."** My own
  expectation entering the session, and the brief's framing. It closes
  *downward*: the two-way complexity really is `n/2 + O(1)`, because Bob's side
  has only `2^{n/2}` classes and announcing one of them solves the problem. The
  trivial `n`-bit protocol is genuinely sub-optimal by a factor of two, so there
  was never a `t` to reach. Died on the `rank ≈ #cols` measurement, `45` against
  `46` at `n = 10`.
- **"The origin-split rank bounds what the *left* half must send."** My previous
  document's §3.5, in its own words. A matrix's rank is bounded by the number of
  distinct columns as well as rows, and for rule 30 the columns are the scarce
  side; so the rank was measuring Bob. The left half's cost is `n − o(1)`, which
  is the stronger statement and was available from the row count all along.
- **"Rule 30 is in an exponential class in DRT, along with 45 and 106."** A web
  search summary, handed to me in my first minutes and specific enough to be
  believed. The paper has no exponential class; it has Bounded, Linear and
  Other, and rule 30 is in Other with an explicit disclaimer of evidence. Died on
  the first fetch of the paper itself.
- **Number-on-forehead with `t` diagonals as `t` parties.** The brief's own
  suggestion, and the most attractive idea in it: the light cone really does
  decompose into `t` diagonals, each party naturally holding one. Died on
  arithmetic before any rule 30 object was built. Every NOF lower bound known
  decays at least exponentially in the number of players — the best explicit
  bound fetched at <https://arxiv.org/abs/0712.4279> is
  > "We show that disjointness requires randomized communication
  > Omega(n^{1/(k+1)}/2^{2^k})"
  which is below `1` once `k` passes roughly `log log n`, let alone `k = t`. The
  BNS `Ω(n/2^k)` figure is **UNVERIFIED** — I have it only from a WebSearch
  summary, and the two PDFs that would settle it
  (`cs.toronto.edu/~toni/…/notes-nof.pdf` and `csc.kth.se/…/NotesLec13.pdf`)
  returned undecodable binary, which is this session's fourth failed PDF and my
  notebook's standing lesson. The death does not depend on the constant: *every*
  NOF technique in print decays in `k`, and the vantage wanted `k = t`.
- **"Intrinsic universality via communication complexity says something about
  rule 30."** Goles–Meunier–Rapaport–Theyssier's Corollary 2, fetched at
  <https://ar5iv.labs.arxiv.org/html/0912.1777>:
  > "Let F be an intrinsically universal CA. Then it holds that: (1) there exists
  > u s.t. CC(InvFu)∈Ω(n), (2) CC(PredF)∈Ω(n), (3) there exists k s.t.
  > CC(CycleFk)∈Ω(n)."
  Every clause is a *necessary* condition, so the theorem's contrapositive
  proves rules **non**-universal. It can never certify that a rule is hard, and
  rule 30's `Ω(n)` prediction complexity (§3.3) therefore buys exactly nothing:
  it fails to exclude rule 30, which is not a result.
- **"Rule 110's universality should make its communication complexity the
  largest."** Measured false and worth recording as a calibration of the whole
  measure: rule 110's `d_n` is `2, 4, 6, 9, 16, 26, 42, 67, 105, 165, 253` at
  `n = 1…11`, growing at about `1.55^n` against rule 30's `2^n`, and its rank at
  `n = 10` is `26` against rule 30's `45`. The rule that is *proved* to compute
  anything is markedly easier in this measure than the rule that is not. So `d_n`
  does not track computational power, and a captain should not read rule 30's
  first place in §3.2 as evidence that it does.
- **"The seed gets a role because the centre column is the protocol
  transcript."** The one hope I had that this vantage might differ from the
  algebraic and proof-complexity ones. The identification is real — crystal 40
  makes each half-line a function of the centre column alone, so the natural
  protocol's transcript *is* the centre column — and it is purely structural. A
  protocol's cost is a worst case over inputs; on one input the empty protocol is
  correct. Died in one line, and it is the same line that killed the other two
  vantages: **the prize fixes the input.**
- **"The traced problem at the seed's own `z` gives the seed a quantitative
  role."** The strongest surviving form of the hope above, and the reason §3.5
  exists. It dies *in the wrong direction*: the seed's YES-set is 12 rows by
  4096 columns at `n = 12`, so the problem is cheap, and a cheap problem is an
  absence of structure rather than a presence of one.
- **"`|YES| = 2^n` for the seed's target is a rule 30 fingerprint."** Mine, for
  about ten minutes, and the exactness at eleven consecutive `n` made it look
  like a law worth chasing. It is left-permutivity: the leftward solve (crystal
  9, Meier–Staffelbach) recovers the left half from the trace and the right half,
  so there is exactly one compatible `u` per `v`. Rules 45, 90 and 150 give
  `2^n` too. Caught by running the control before writing the sentence, which is
  the habit my notebook says I keep failing at and did not fail at here.
- **"Rule 30 is the maximiser of `d_n` at every `n`."** False at `n = 6` and
  `n = 7`, where rules `106, 120, 169, 225` lead with `60` and `108` against rule
  30's `46` and `106`. Rule 30 takes the lead at `n = 8` and holds it at `n = 9`.
  A claim of "the maximiser" stated without its range would have been wrong at
  the first two values anyone would check.
- **"A deficiency against the ceiling means something."** The warning the brief
  handed me from the reader of my last document, and it applies here in the
  mirror image, so I checked it rather than assuming it did not: **no elementary
  rule attains `d_n = 2^n` at `n = 6, 7, 8` or `9`.** So a positive deficit is a
  class property of locality and is evidence of nothing at all. The only thing
  that can carry information is the deficit's *trend*, which is what §3.2 reports
  and which is why the six values are printed rather than the last one.
- **My classifier, not my data.** My first reproduction of DRT's three lists
  agreed on only 73 of 88 rules and I briefly read that as a disagreement about
  rule 30's neighbourhood. It is not: DRT's "linear" admits slope `a₁ ∈ ℚ`, so
  `d_n = 2,2,3,3,4,4` (rules 14, 43, 142) is linear with slope `1/2` and fails a
  constant-first-difference test, and rule 1's `2,3,2,3,2,3` is bounded without
  being eventually constant. Every one of the fifteen disagreements is of that
  shape. The instrument was validated instead against the paper's Lemma 10,
  which it reproduces exactly for rules 132 and 23 — a published theorem is a
  better control than a published list.
- **"The right half runs at `1/2` bit per cell because the `OR` hides it at the
  black times, and the centre column is black half the time."** Mine, the best
  sentence in my first draft of §3.3, agreeing with the measurement to four
  decimals and joining this vantage to obstruction 34's invisibility lemma. It
  is **refuted by its own control**, `explorer/astrolabe4_mask.mjs`: the
  fraction of in-cone updates at which the right argument is visible is `0.5004`
  for rule 30 (match), `0.4984` for rule 180 whose rate is `0.0857`, `0.4969`
  for rule 210 whose rate is `0.0000`, and **`1.0000` for all four bipermutive
  rules, whose rate is also `0.0000`** — the opposite extreme from the
  prediction. Pearson correlation of visibility against rate over the sixteen
  left-permutive rules: **`−0.0000`**. The reason the bipermutive case inverts
  is clear afterwards and was not before: for an affine rule the origin at time
  `n` is a fixed XOR of the two cone edges, so Bob contributes exactly one bit
  no matter how visible he is; masking is simply not the quantity. **What
  survives is the affine/non-affine split** — all eight affine `g` give exactly
  zero, which is the direction crystal 66's filter needs — and the bare measured
  fact that six of the eight non-affine give about a half, with `c ∧ ¬r` and
  `¬c ∧ r` unexplained exceptions. I nearly shipped the mechanism: it was
  written into the dictionary, the caution paragraph under it said only that the
  mechanism was "proposed", and the control that killed it took fifteen minutes.
  A four-decimal agreement at one rule is one data point, and my notebook
  already carries the lesson in the form *a null whose value does not move
  measures nothing* — this is its twin, **a mechanism that predicts the same
  number for every member of the family explains nothing**.
- **Nečiporuk as a route to something non-trivial at reachable `n`.** Not dead
  in principle — §3.4's saturation is real — but dead as a computation, and the
  way I nearly got the death wrong is the entry. I first wrote the method's
  ceiling as the asymptotic `n²/(4 log₂ n)`, which reads `17.7` at `n = 17` and
  so sits just above the trivial `n − 1 = 16`, making it look as though a
  non-trivial bound were one good measurement away. **The asymptotic form is not
  the ceiling at small `n`.** The exact ceiling is
  `max_b ⌊n/b⌋·min(2^b, n−b)/4`, and it is `13` at `n = 17` — *below* trivial —
  first crossing at `n = 20` and holding only from `n = 24`
  (`explorer/astrolabe4_ceiling.mjs`, every `n` from 9 to 40). So no partition
  of `17` variables can prove anything non-trivial about any function whatever,
  and rule 30's `7.87` was never a candidate. Recorded because I went to
  "correct" the original `n ≈ 24` figure *down* to `n ≈ 15` on the strength of
  the asymptotic formula, and computing the exact quantity is what stopped me
  turning a right statement into a wrong one.
- **PDF fetching, for the fourth time in this region.** `arxiv.org/pdf/cs/0210008`,
  `dim.uchile.cl/~rapaport/tutorial03.pdf` (HTTP 403),
  `cs.toronto.edu/~toni/…/notes-nof.pdf` and the KTH lecture notes all failed —
  403s and undecodable binary, the norm this brief warned about. **Every arXiv
  paper this document leans on came back in full through an HTML rendering**:
  `ar5iv.labs.arxiv.org/html/<id>` for the three pre-2010 papers
  (`cs/0210008` from 2002, `cs/0111062`, `0912.1777`), which have no native
  arXiv HTML at all, and `arxiv.org/html/<id>` for the 2011 one (`1102.3522`),
  which does. That is the craft note for the next connector and it belongs in
  the brief rather than in a notebook: **for anything on arXiv, try `ar5iv`
  first and the PDF never** — an eighteen-year-old LaTeX source renders fine,
  and I spent the session's first fetch on a PDF that could never have worked.
- **Nothing died for lack of depth.** Every death above has a witness computed
  exhaustively — all `2^n` inputs per side for the row and column counts, all
  `4^n` pairs for the traced fibre, all `2^{n−b}` complement assignments for the
  Nečiporuk terms, exact modular rank for the log-rank bound — rather than a
  search that ran out.

---

## 5. What to hand the theorist

**The honest headline: do not spend a theorist's session on this vantage aimed
at the residual.** §3.1 closes it in one line that no theorem in the field can
move, and §3.5 adds that the field's own centre-column measure ranks rule 30
below the rules whose centre columns are trivial. A captain who wants one thing
from this document should take the fence in §3.1 and the calibration in §3.5,
not a topic.

If a session is spent here, one topic, and it is not aimed at a prize.

**Topic A — the number of left half-rows compatible with the seed's centre
column, which is obstruction 5 counted exactly.** *Claim to falsify:* the number
of distinct left half-rows of width `n` that can produce rule 30's centre column
at times `0…n`, over all right half-rows, is `2^{o(n)}` — measured
`1, 2, 2, 2, 2, 3, 5, 5, 5, 10, 12` at `n = 2…12`, against `2^n` for rules 90
and 150. *The dictionary row it depends on:* the YES-set of
Goles–Guillon–Rapaport's `f^z` at `z =` the seed's own trace, whose total size is
`2^n` by the leftward solve (crystal 9) and whose row count is therefore the
whole content. *What would settle it:* extending the exhaustive sweep past
`n = 12` costs one script and a few hours of CPU; a *proof* that the row count is
sub-exponential would be obstruction 5's "there is really only one left side"
made finite and unconditional, which nothing on this board currently has —
obstruction 5 is a measurement over 40 configurations and crystal 49 is a basin,
not a bound. **What it does not give, and the `DOES NOT PROVE` field must say
so: nothing about any prize.** It is a fence and a re-parameterisation.

**And two refusals a seeder should be handed.**

A proposal whose value comes from a communication-complexity bound about rule 30
is refuted in advance by the fixed seed: Alice and Bob each hold the blank
string, and the empty protocol is correct on that input at every `n`.

A proposal that reads any communication measure as evidence for computational
irreducibility is refuted in advance by three measurements in this document:
bipermutive rules are the *proved* hard case of the traced measure (Proposition
14) and have trivial centre columns; rule 110, which is intrinsically universal,
has a `d_n` smaller than rule 30's at every `n ≤ 11`; and rule 22, whose column
is not known to be anything in particular, beats rule 30 on every Nečiporuk term
measured.

---

## 6. Next vantage

**The reachable-set / transducer side of the picture, attacked as automata
theory rather than as complexity.** Three separate vantages have now
independently produced the same integer sequence about rule 30 from three
vocabularies that share no code and, until recently, no readers: obstruction 11's
self-similar-group forced-set sizes `35, 532, 5873, 57741, 175680`, obstruction
24's minimal automaton of the reachable rows `3, 7, 16, 35, 71, 141, 272, 517,
971, 1792, 3263, 5873, …`, and this document's Myhill–Nerode count `d_n` of left
half-rows under "same effect on the origin". The first two agree at four of five
values and disagree at one (`517` against `532`), a discrepancy obstruction 24
records as unresolved and which nobody has read the code to settle; the third is
a *coarser* equivalence than either, so a quotient map from those automata onto
this one is the natural guess — a guess, not a derivation, and a cheaply
checkable one nobody has checked. A session that built all three
automata in one place, with one engine, and either exhibited the quotient maps or
found where they fail, would either unify three obstructions into one object or
find the arithmetic error that has been sitting across two of them for a week.
That is not a prize route and I would not dress it as one; it is the cheapest
remaining chance on this board to turn three measurements into one theorem.

**The field I could not reach from here, and would have gone to next with more
time: the communication complexity of *search* and *relation* problems, and
Karchmer–Wigderson games.** Every measure in this document is about a Boolean
*function* and therefore about a matrix, and every one of them died at the fixed
seed because a matrix has entries. Karchmer–Wigderson games are about a
*relation* — given `x` with `f(x)=1` and `y` with `f(y)=0`, find a coordinate
where they differ — and their communication complexity is *exactly* circuit
depth, with no loss, which is the one bridge in this field that is an equality
rather than an inequality. Both halves fetched: the game, at
<https://arxiv.org/html/2609.00633>,

> "Alice is given a string x∈A, Bob is given a string y∈B, and they must output
> an index i∈ℕ such that xi≠yi."

and the equality, at <https://ar5iv.labs.arxiv.org/html/2002.07444>,

> "they showed that for each Boolean function f one can define a communication
> game which communication complexity _exactly_ equals the depth of f in the
> standard De Morgan basis."

That second source states the classical theorem in narrative form rather than as
a numbered theorem, so a captain commissioning a session here should get
Karchmer–Wigderson's own paper in front of the theorist; the equality is not in
doubt but its exact hypotheses (fan-in two, De Morgan basis) are the whole
content and I have them only from a secondary source. The rule 30 relation would
be: given two row-0 windows
producing different centre cells at time `t`, find a cell where they differ —
which is the *damage front*, the board's most heavily measured object
(`rule30_left_local_law`, crystals A2/A3, the `0.24` front speed). Nobody here
has asked what the KW game of the cone map costs, the board already holds the
combinatorics its protocol would have to search, and depth is the one complexity
measure that a communication bound pins exactly. I do not expect it to reach the
fixed seed either — it is still a function family — but it is the only entry in
§2 whose bridge to a standard cost model has no slack in it, and it is one script
away from a first number.
