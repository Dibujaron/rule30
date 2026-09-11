# Sighting: the literature clause of crystal 72

*Chorobates, connector, 2026-09-11. Vantage: crystal 72's literature clause —
is there a literature that one of the four proved sufficient conditions for P1
connects to and P1 itself does not?*

**The answer is a qualified negative, and the qualification is one line long.**
Three of the four residuals do reach literatures that P1's own statement does
not. One of the three is refuted by a two-line argument that no theorem in its
literature can ever help. One has already been sighted and its witness search
has already been run and come back empty. The third — `..._of_deep_alternating`
against the Gilbreath–Proth difference-triangle literature — is a real
correspondence, row for row, with a live 2026 paper on the other side, and it
breaks at a seam I can name: that array's parity is Pascal's triangle mod 2 and
rule 30's is not. The fourth residual has no literature by logic rather than by
search: it is *equivalent* to P1, kernel-checked below.

**Recommendation to the captain: close the clause.** Not because nothing was
found, but because what was found has a named seam in every case, and the
seams are all the same seam the board already knows — linearity, or a measure,
or a finite state space, and rule 30's single seed has none of the three.

---

## 1. The problem, seen from outside

Take a doubly infinite row of cells, each black or white, all white except one
black cell. Update every cell at once, for ever, by a fixed local rule: a
cell's new colour is its left neighbour's old colour, exclusive-or'd with (its
own old colour or its right neighbour's old colour). Draw the rows one under
another, time running down, and you get a triangle. Read the single cell
directly under the original black one, at every time: that is one infinite
sequence of bits. Measured to ten million terms it looks exactly like a fair
coin. Nobody can prove it does not eventually repeat, and there is no route in
print.

The vantage is not that question but a question about four *strengthenings* of
it that this project has proved, each of the shape "if `X` then the sequence is
not eventually periodic":

| name | the residual `X`, in plain words |
|---|---|
| `..._of_cohomologous` | some *other* cell-column of the triangle differs from this one by a sequence that does repeat |
| `..._of_white_times` | if the sequence did repeat with period `p`, the column one place to the right would repeat too, at the times the centre is white |
| `..._of_long_black_runs` | the sequence contains runs of consecutive black cells of every length, arbitrarily late |
| `..._of_deep_alternating` | at arbitrarily late times, the cells running leftward from the origin read `black, white, black, white, …` to every depth |

Each implies the open question. None is known to be easier. The question asked
of me is whether any of them lands inside a body of mathematics that the open
question itself does not — a literature with theorems in it, not a vocabulary.

**Restated in the vantage's own terms, which makes it a bibliographic question
rather than a mathematical one:** given four statements all sufficient for a
hard one, is there a subject whose theorems take one of the four as *input*,
where no subject's theorems take the hard one as input?

**One reformulation used throughout, because it is what makes the comparison
sharp.** Let `S` be the closure, under the shift, of the set of tails of the
centre column — the subshift it generates. Then

- **P1** says `S` is **infinite** (a one-sided sequence is eventually periodic
  exactly when it has finitely many distinct tails);
- **`..._of_long_black_runs`** says `S` **contains the all-black point** `1^∞`
  (the word `1^k` is in the language for every `k`, which for this object is
  the same as occurring arbitrarily late — see §4);
- **`..._of_deep_alternating`** says the same thing about the same object read
  sideways: the alternating word `1010…` of every depth occurs in the rows
  immediately left of the origin. The board's `column_black_run_of_alternating`
  and `column_alternating_of_black_run` are the two directions of that
  identification, so these two residuals are **one object**, and I treat them
  as one throughout.

A *cardinality* question about a subshift and a *membership* question about the
same subshift are genuinely different kinds of question, with different
literatures. That is the only structural reason to expect this vantage to find
anything, and it is why the two run-shaped residuals are where I spent the
session.

## 2. Fields sighted

Fourteen. The unlikely entries are rows 1, 6 and 13; row 1 is the one that
turned into a real dictionary.

| field / theory | the object there | the seam, in one line |
|---|---|---|
| 1. **Prime-gap difference triangles** — Gilbreath's (Proth's) conjecture, Odlyzko's reduction, Chase–Hunter–Tao 2026 | a single-seed triangular array whose boundary column is conjectured, verified to `3.4 × 10^11` rows, and unproved; a *shield* of a closed sub-alphabet protects the boundary, losing one cell per row | that array's parity is exactly Pascal mod 2 (their Lemma 3.10, via Lucas); rule 30's is not, and its nonlinearity is measured (crystal 71, degree `2t − 1`) |
| 2. **Shift-register sequences** — Golomb's randomness postulates, `m`-sequences | the only explicit deterministic binary sequences for which "runs of every length up to `n` occur" is a *theorem* | the proof counts states of a finite **linear** register; and no run theorem can close a run-shaped residual at all (§3.2) |
| 3. **Trace subshifts of cellular automata** — Cervelle–Formenti–Guillon | the centre column **is** a trace, in that literature's own sense | every property stable under ultimate coincidence is undecidable *as a class*, and P1 and all four residuals are in that class together — the literature does not separate them |
| 4. **Limit sets and Rice-type theorems for CA** — Kari; Guillon–Richard | "does this word appear arbitrarily late" as a limit-set membership question | rule 30 is surjective, so its limit set is the whole shift space and the question is vacuously yes; the residual is about **one orbit**, which the limit-set literature does not see |
| 5. **Combinatorics on words** — Thue, Dejean, repetition threshold, avoidability | run lengths and critical exponents of explicit words | that field's theorems all bound runs from **above** (avoidance); the residual needs a lower bound, and nothing there produces one |
| 6. **Automatic sequences and decision procedures** — Charlier–Rampersad–Shallit, Walnut | "does `1^k` occur for every `k`" is *decidable* for `k`-automatic sequences | so is eventual periodicity, by the same machinery — no separation; and crystal 73 already excluded automaticity by measurement |
| 7. **Normality and disjunctive sequences** — Borel, Champernowne, Copeland–Erdős | sequences in which every word provably occurs | every proof in print builds the digits by concatenation or from algebraic self-similarity; rule 30's column is neither |
| 8. **Extreme-value probability** — the Erdős–Rényi longest-run law | longest run in `N` fair coin flips is `log_2 N` | a law about a measure; the seed is one point of measure zero, the same seam as everywhere else |
| 9. **Computational mechanics** — Crutchfield–Hanson regular domains and defects | the checkerboard as a *domain* of rule 30, with defects between patches | measured here: the longest checkerboard patch at the origin in 20,001 rows is 13 against a fair coin's 14 — it is not a domain, and the machinery has nothing to grip |
| 10. **Aperiodic order / tiling repetitivity** | the appearance and recurrence functions: how long a window must be to contain every patch of a given size | those functions are defined for **minimal** systems; nothing says the seed's picture is minimal, and crystal 73's blocking-word result says rule 30 has no equicontinuous points |
| 11. **Ergodic theory of surjective CA** — Hedlund invariance, Poincaré recurrence | uniform Bernoulli is invariant, so almost every configuration has unbounded runs in its centre column | almost every is not this one; and the seed is exactly the measure-zero point |
| 12. **Cocycles over a dynamical system** — Livšic rigidity, Gottschalk–Hedlund | the coboundary equation `A(x) = C(fx)C(x)^{-1}`; "cohomologous" is literally that literature's word | Livšic reads the obstruction off **periodic orbits** of the base, and this base has none — that is P1 |
| 13. **Ducci sequences / the `n`-number game** | iterated absolute differences on a finite ring, where eventual periodicity of every entry is a theorem | the theorem is finiteness of the state space; the rule 30 picture has no finite state space, and the one route that would give it one is blocked by Jen's theorem (§4) |
| 14. **Reverse mathematics / arithmetic complexity of Π⁰₂ statements** | where each residual sits in the arithmetic hierarchy | it sorts them (§3.4 — one is Σ⁰₂ and three are Π⁰₂) but proves nothing; the census connector already worked this vantage on 2026-09-09 |

## 3. Connections

Five. The first is the live one; the second is a negative claim as sweeping as
I can make it; the fifth is not a connection at all and is here because the
format is the right place for it.

---

### 3.1 The Gilbreath–Proth difference triangle, and Odlyzko's shield

**The claim.** `..._of_deep_alternating` is the rule 30 instance of a question
that has been studied for a hundred and forty years under another name — the
boundary column of a single-seed triangular array, protected by finite windows
of a rule-closed sub-alphabet that lose one cell per row — and the board's
`column_alternating_shrink` is, line for line, Odlyzko's 1993 shielding lemma;
so this residual has a literature, a worked precedent, and a live 2026 paper,
and P1's own statement has none of the three.

**The dictionary.**

| rule 30, this project | Gilbreath's array | notes |
|---|---|---|
| the row of cells at time `t` | row `i` of the array, `a(i, ·)` | both are half-determined by the row above |
| the local rule `new = left XOR (centre OR right)` | `a(i+1,j) = \|a(i,j) − a(i,j+1)\|` | both read two adjacent cells; theirs reads self and **right**, ours self, left and right |
| the single black seed | the sequence of primes as row 0 | *seam*: theirs is an arithmetic input nobody controls, ours is the simplest input there is |
| **the centre column** `centerColumn t` | **the left diagonal** `a(k,1)` | the distinguished boundary column; the object of both conjectures |
| P1: the column never settles into a period | Gilbreath: the column is identically `1` | *seam*: opposite conclusions. Theirs wants regularity, ours wants its absence |
| the alternating block of depth `L` left of the origin | a window of `n` consecutive entries in `{0,2}` | both are finite windows of a **rule-closed** set beside the boundary |
| `column_alternating_shrink`: depth `L+1` at `t` gives depth `L` at `t+1`, still maximal | Odlyzko: a leading `1` with `n` entries of `{0,2}` after it keeps the column at `1` for `n` more rows | **the same lemma**: one cell of shield spent per row, no slack |
| `column_alternating_of_black_run` / `column_black_run_of_alternating` | (no counterpart) | ours is a two-way identification of the shield with a run in the column; theirs has no run to identify with, because their column is conjecturally constant |
| the residual: shields of every depth occur, arbitrarily late | the residual after Odlyzko: shields of unbounded length occur | **the same Π⁰₂ shape**, and it is the point of the connection |
| `centerColumn_black_run_lt_start`: a run beginning at `a` has length `≤ a` | (no counterpart) | ours has a proved *upper* bound on the shield; theirs does not need one |
| crystal 71: the polynomial degree of `evolveFrom c t 0` is `2t − 1` | **Lemma 3.10**: `a(i,j) = Σ_k C(i,k) a(j+k) mod 2` | **the seam that kills it.** Their array's parity is Pascal mod 2 — linear, Lucas-computable. Ours is maximally nonlinear |
| the seed is one configuration | Chase's theorem is for a *Cramér random* row 0 | **the second seam.** The proved half of that literature is a statement about random input; rule 30 has no input to randomise |

**The seams, stated plainly.** Three, and the first two are fatal.

1. **Linearity.** Chase–Hunter–Tao's own sentence about their parity formula is
   that it "is useful for excluding long 0-valued blocks, or `{0,d}`-valued
   blocks for even `d`, but does not easily reduce the likelihood of long
   `{0,d}`-valued blocks for occurring for odd `d`". So even inside their
   paper, the parity structure is the tool that works and its failure marks
   the hard case. Rule 30 is the hard case everywhere: `|x − y| ≡ x + y (mod
   2)` makes their array linear mod 2 for free, and `l XOR (c OR r)` has no
   such reduction — the `OR` is the whole difficulty, and crystal 71 prices it.
2. **The randomness is in their input.** The theorem in that literature is for
   a random model of the primes. Rule 30's seed is a single black cell; all of
   its apparent randomness has to be produced by the map. That is the
   measure-zero seam the board meets on every probabilistic route (obstruction
   entries on the greedy-walker speed, the reachable-set DP, and Prize 2's
   excess all end there), and this literature does not cross it either.
3. **Direction.** Gilbreath wants the boundary constant and rule 30 wants the
   boundary irregular; and Gilbreath's residual is "long blocks are *absent*"
   in the CHT reading while ours is "long blocks are *present*". A technique
   for excluding a structure is not a technique for exhibiting one.

**What it leans on.** All fetched.

- Chase, Hunter and Tao, *Gilbreath's conjecture: a Cramér random model and a
  deterministic analysis*, arXiv:2607.08712 (math.CO, submitted 9 July 2026),
  <https://arxiv.org/abs/2607.08712>. Abstract, verbatim: *"Gilbreath's
  conjecture asserts that if one starts with the sequence of primes and takes
  successive absolute differences to create a triangular array, then the left
  diagonal of this array consists entirely of ones after the first row. In this
  paper, we show that the analogue of this conjecture for a Cramér random model
  holds, in which the (normalized) prime gaps are replaced by independent random
  variables with geometric distributions of logarithmic size. We also give some
  preliminary analysis of the associated continuous probabilistic model for this
  problem, as well as a deterministic "inverse theorem" that isolates the
  specific obstructions to Gilbreath's conjecture (assuming a Cramér type bound
  on prime gaps), namely long blocks of zeroes, or very long shallow
  {0,d}-valued blocks for some d ≥ 2."*
- The same paper's HTML, <https://arxiv.org/html/2607.08712v1>. The array's
  definition, verbatim: *"a(i+1,j)=|a(i,j)−a(i,j+1)|"* with *"a(0,j)=aj for
  1≤j≤n"*. Lemma 3.10, verbatim: *"a(i,j)=∑k=0^i (ik)a(j+k) mod 2"*, and around
  it, verbatim: *"One can of course compute the parity of (ik) using Lucas'
  theorem. As it turns out, we will not use Lemma 3.10 directly in our
  arguments; it is useful for excluding long 0-valued blocks, or {0,d}-valued
  blocks for even d, but does not easily reduce the likelihood of long
  {0,d}-valued blocks for occurring for odd d."*
- Odlyzko's shield, from
  <https://en.wikipedia.org/wiki/Gilbreath%27s_conjecture>: the 635th row
  *"started with a 1 and continued with only 0s and 2s for the next n
  numbers"*, and *"This implies that the next n rows begin with a 1."* The
  verification is quoted there as *"d₁ᵏ is equal to 1 for k ≤ n = 3.4 × 10¹¹."*
  **Partly UNVERIFIED:** I could not reach Odlyzko's own paper (*Iterated
  absolute values of differences of consecutive primes*, Math. Comp. 61 (1993)
  373–380); the ADS abstract page returned HTTP 405 and MathWorld's entry says
  only *"In 1993, Odlyzko extended the claim to all primes up to π(10^13)"*
  with no statement of the lemma. The lemma as I use it is the Wikipedia
  wording above, which I did fetch; a captain who wants the original should
  get the Math. Comp. paper.
- **UNVERIFIED, and it is the one thing in this connection I could not
  extract:** the full hypotheses of CHT's Theorem 1.6. A first fetch returned
  *"Let M,L≥1 and let 1≤N′≤N be integers... Then a(N−1,1)∈{0,1}"* with the
  three conditions summarised rather than quoted, and a second fetch of the
  same page declined to reproduce the theorem verbatim on copyright grounds.
  So I cannot say from a quote whether their inverse-theorem step is
  linear-specific; I say it is, from Lemma 3.10's stated role, and that is a
  reading rather than a citation. This is the one thing in this document worth
  a captain's fetch.

**The test.** Run and reported: `explorer/chorobates_shields.mjs` and
`explorer/chorobates_shields2.mjs` (the second fixes two faults in the first;
see §4). The dictionary's load-bearing row is that rule 30's shield is a window
of a rule-closed set, and over there `{0,2}` is one of several closed
sub-alphabets. Rule 30's alphabet is `{0,1}` with no room for a sub-alphabet,
so the analogue is a window of a fixed *word*, and the question is whether the
alternating word is the smallest of a family or the only one. Enumerated
exhaustively: for every `L` from 1 to 10, over all `2^L` words on cells
`0, −1, …, −(L−1)`, and against every one of the completions of the cells the
origin's cone can read, **exactly two words pin the centre column for `L` rows,
and they are the alternating word `1010…` with its deepest cell free**:

```
  L= 1  max pinned rows =  1  by 2 words: 0 1
  L= 2  max pinned rows =  2  by 2 words: 10 11
  L= 5  max pinned rows =  5  by 2 words: 10100 10101
  L=10  max pinned rows = 10  by 2 words: 1010101010 1010101011
```

(cell `0` leftmost; margin 6 free cells each side, 4,000 completions, so the
cap at `L` rows is not binding — a word of depth `L` pins exactly `L` rows and
no word does better). So: **rule 30 has exactly one one-sided shield, and its
length equals its depth with no slack.** The family does not exist, and the
board's `..._of_deep_alternating` is not the small case of anything.

The two-sided analogue — a window around the origin that is a patch of some
genuinely space-time-periodic rule 30 ring, which shields by the cone alone —
was swept over all ring widths `≤ 12` for 20,001 rows, against a fair-coin
null on rows of the same width:

```
seed : longest alternating block 13 (t=6531); longest two-sided ring patch 12 (t=18890, p=4)
coin : longest alternating block 14 (t=16694); longest two-sided ring patch 11 (t=3423, p=12)
```

Both numbers are the coin's. **The two-sided family occurs at the chance rate
and never beats the one-sided shield**, which also disposes of row 9 of §2: the
checkerboard is not a regular domain of rule 30 in any measurable sense.

The falsification a theorist should try, in the project's vocabulary: *exhibit
a word `w` on cells `0, …, −(L−1)`, not the alternating word, and an `L' > 1`,
such that `w` determines `centerColumn t, …, centerColumn (t+L'−1)` for every
configuration whose row at time `t` carries `w`.* The measurement says there is
none for `L ≤ 10`; the two-line reason is that a one-sided shield must keep the
centre black at every step (otherwise `rule30_eq`'s `OR` stops masking the
right neighbour), and `column_succ_of_black` then forces the alternation
outward, so the alternating word is the only fixed point of the requirement.

**What it would give.** If the seam were crossable — if someone produced a
nonlinear analogue of CHT's inverse theorem — it would give the residual an
*obstruction list*: a finite set of structures in the rows whose absence forces
shields to grow. That is strictly more than P1's statement admits, because P1
names no structure at all. What would remain is everything: their inverse
theorem is conditional on a Cramér-type input about primes, so even transferred
it would deliver "the residual holds unless one of these structures occurs",
and rule 30 has no external input to appeal to. My honest reading is that this
connection is worth exactly one thing to the board — the fetch of Theorem 1.6,
to see whether the method is linear-specific — and nothing else.

---

### 3.2 The run-length literature, and why no theorem in it can help

**The claim.** `..._of_long_black_runs` does reach a literature P1 does not —
Golomb's run postulate, `m`-sequences, the Erdős–Rényi longest-run law,
avoidability in combinatorics on words — and **no theorem in any of them can
close it, for a reason that takes two lines and applies to every theorem about
runs that could ever be proved.**

**The dictionary.**

| rule 30 | shift-register / run literature | |
|---|---|---|
| the centre column | a keystream bit sequence | rule 30 was *proposed* as one — Wolfram 1986, and Meier–Staffelbach attacked it as one |
| P1 (the column does not repeat) | the sequence has infinite period | |
| a hypothetical period `p` | the register's period `2^n − 1` | |
| `..._of_long_black_runs`: runs of every length | Golomb's postulate R-2: runs of each length occur in the stated proportions | *the residual's literature* |
| the proof of R-2 for `m`-sequences | every nonzero `n`-window occurs exactly once per period, by linearity of the register | **the seam**: a counting argument over a finite state space, and a *linear* one |
| the board's `centerColumn_black_run_lt_start` (`∀ s ≤ L, black at a+s` gives `L < a`) | (no counterpart; over there runs are bounded by `n ≈ log₂ period`) | ours is an upper bound too, and it grows with `a` |
| `centerColumn_white_run_le_period` (Groma) | runs of a `p`-periodic sequence are `< p` | **the two-line refutation below** |

**The two-line refutation, and it is the actual deliverable of this
connection.** Suppose the centre column has period `p` from `N`. Then every run
after `N` has length at most `p − 1` — that is the board's own
`centerColumn_white_run_le_period`, and its black twin runs identically,
because `centerColumn_not_eventually_constant` gives *both* colours infinitely
often, so a black run filling a whole late period is refuted by the same two
lines that refute a white one. So any theorem of the form *"the centre
column contains a run of length at least `g(p)` in every period"* is consistent
with periodicity for every `g` with `g(p) ≤ p − 1`, and no theorem can have
`g(p) ≥ p`, because that says the sequence is constant on a period. A run
theorem indexed by *time* rather than by the period — *"there is a run of
length at least `h(t)` before time `t`, with `h → ∞`"* — does close it, and is
`..._of_long_black_runs` verbatim. **So the run route is all-or-nothing: every
partial result about runs is either consistent with periodicity or is the
residual itself.** There is no ladder here, and a literature whose theorems are
all partial results about runs cannot supply a rung.

**What it leans on.**

- Golomb's second randomness postulate (R-2) and the run property of
  `m`-sequences: **UNVERIFIED.** I searched for a fetchable statement and
  failed: the Springer encyclopedia entry *Golomb's Randomness Postulates*
  (<https://link.springer.com/rwe/10.1007/978-3-030-71522-9_351>) redirects to
  an authentication endpoint, <https://www.iitg.ac.in/pinaki/Golomb.pdf> did
  not parse as text, and
  <https://en.wikipedia.org/wiki/Pseudorandom_binary_sequence> does not state
  the run property at all. A search for *"Golomb randomness postulate R-2 run
  property m-sequence maximal length LFSR runs of every length theorem"*
  returned the statement in summary only. The primary source is Golomb, *Shift
  Register Sequences*, Holden-Day 1967 — cited by file and line in a text this
  project holds, `sources/martinez-adamatzky-hoffmann-rule22.txt` line 1284
  (*"[23] S.W. Golomb, Shift Register Sequences, Holden-Day, San Francisco
  (1967)"*). Nothing in §3.2's argument depends on the exact wording of R-2.
- The refutation itself leans only on board nodes:
  `centerColumn_white_run_le_period`, `centerColumn_not_eventually_constant`,
  `centerColumn_black_run_lt_start`.

**The test.** The refutation is the test and it is already run: it is a
two-line derivation from two closed nodes, and a theorist can falsify it by
exhibiting a run theorem whose conclusion is not bounded by the period and is
not itself the residual. I claim there is none.

**What it would give.** Nothing, and that is the point — this is the connection
whose value is entirely negative. It removes the whole run-length literature
from the clause in one stroke, including the entries a future connector would
otherwise sight afresh (Erdős–Rényi, avoidability, Dejean, normality), because
every one of them produces theorems of exactly the refuted shape.

---

### 3.3 Cocycles, the coboundary equation, and Livšic rigidity

**The claim.** `..._of_cohomologous` is the only one of the four that reaches a
literature with a *construction* in it rather than an obstruction — Livšic
theory builds the transfer function `C` from the vanishing of the cocycle on
periodic orbits — and it is also the only one of the four whose residual is
`Σ⁰₂` rather than `Π⁰₂`, so it is the only one a finite search can even
produce a candidate for; the board has run that search and it is empty.

**The dictionary.**

| rule 30 | cocycles over a dynamical system | |
|---|---|---|
| the shift on the space of configurations, or the CA itself | the base map `f : X → X` | |
| the centre column | the fibre coordinate along one orbit | |
| `t ↦ xor (centerColumn t) (evolve (t+j) x)` | the cocycle `A` | the *difference* is the natural object there, where "a column repeats" is not — Portage's phrasing, 2026-09-08 |
| the residual: some such difference is eventually periodic | the cocycle is cohomologous to a periodic one; with `p = 1`, `A` is a coboundary | |
| a witness `(x, j, p, N)` | the transfer function `C` | a **finite** object, which is the whole structural difference from the other three residuals |
| Livšic's hypothesis: trivial periodic data | — | **the seam**: the criterion is read off the *periodic orbits of the base*, and the base here is one orbit with no periodic points, which is P1 |
| Boyle–Kitchens: periodic points are dense for onto CA (held in `sources/`) | the hypothesis Livšic needs | *and it is about the whole system, not about the seed's orbit* — the second seam, and it is the same as row 11 of §2 |
| the board's 38,700-pair search, `p ≤ 16,384`, 200,000 rows, 0 survivors | a search for the transfer function | the search is legitimate precisely because `Σ⁰₂` witnesses are refutable in finite time |

**What it leans on.**

- Kalinin, *Livšic Theorem for matrix cocycles*, arXiv:0808.0350 (Annals of
  Mathematics 173 (2011)), <https://arxiv.org/abs/0808.0350>. Abstract,
  verbatim: *"We prove the Livšic Theorem for arbitrary `$GL(m,\mathbb R)$`
  cocycles. We consider a hyperbolic dynamical system `$f : X \to X$` and a
  Hölder continuous function `$A: X \to GL(m,\mathbb R)$`. We show that if `$A$`
  has trivial periodic data, i.e. `$A(f^{n-1} p) ... A(fp) A(p) = Id$` for each
  periodic point `$p=f^n p$`, then there exists a Hölder continuous function
  `$C: X \to GL(m,\mathbb R)$` satisfying `$A (x) = C(f x) C(x) ^{-1}$` for all
  `$x \in X$`."* The abelian case (Livšic 1972) is the specialisation this
  dictionary uses; its original wording is **UNVERIFIED** — I could not extract
  text from the Annals PDF, which did not parse.
- Boyle and Kitchens, *Periodic points for onto cellular automata*, held at
  `sources/boyle-kitchens-periodic-points-onto-ca.txt` and indexed in
  `docs/sources.md`.
- Surjectivity of rule 30, from the held text
  `sources/schule-stoop-2012-topological-classification.txt` line 644: *"any
  permutive CA is surjective"*, with Proposition 15 listing the surjective
  rules; rule 30 is left-permutive on this board (`rule30_leftPermutive`).

**The test.** Already run by the board and reported in the obstruction *"The
free companion of `centerColumn_other_of_cohomologous_column`"*: 38,700 pairs,
`p ≤ 16,384`, a 200,000-row window, 0 survivors. The falsifiable statement a
theorist could still attack is the *unconditional companion* — "no `(x, j)` has
an eventually periodic difference" — which is the negation of the residual and,
if proved, would kill the sufficient condition outright rather than P1.

**What it would give.** If a Livšic-type criterion transferred, it would turn
the residual from a search into a check: the obstruction would be a *sum over
periodic orbits*, and the board has an enumeration of rule 30's space-time
periodic rings already (`explorer/talus2_periodic.mjs`, reproducing Wolfram's
Table 6.2). What would remain is the seam, and it is the whole problem: the
seed's own orbit contains no periodic point, and crystal 49 says every coned
picture has the seed's settled region up to translation, so a criterion
evaluated over the ring family is a statement about a family the board has
already proved rule 30 is not in (Rowan's third addendum, obstruction 15). I
would not spend a theorist here. Portage sighted this vantage on 2026-09-08 and
the measurement that killed it predates both of us.

---

### 3.4 Trace subshifts and the Rice theorems: why the clause is empty

**The claim.** There is a literature that takes *all five* statements —
P1 and every one of the four residuals — as inputs of the same kind, and its
theorem is that they are undecidable as a class; so the emptiness of crystal
72's literature clause is a fact with a reason behind it, and not an artefact
of nobody having looked.

**The dictionary.**

| rule 30 | trace / limit-set theory of CA | |
|---|---|---|
| the centre column | **the trace** of the CA at one cell | that literature's own word for exactly this object |
| P1 | "the trace is not ultimately periodic" | a property stable by ultimate coincidence |
| `..._of_long_black_runs` | "the trace contains `1^k` for every `k`" | also stable by ultimate coincidence |
| `..._of_deep_alternating` | the same, read on the width-`k` trace | also stable |
| `..._of_white_times` | — | it is P1 (§3.5), so it is stable too |
| Cervelle–Formenti–Guillon: **all** such properties are undecidable | the theorem | **the class does not distinguish the five.** Whatever separates them, it is not in this literature |
| "does the word appear arbitrarily late?" as a limit-set question | Kari's Rice theorem: every nontrivial limit-set property is undecidable | *seam*: rule 30 is surjective, so `Ω = F(X) = X` is the full shift and `1^k ∈ Ω` trivially — the limit set answers yes and says nothing |
| the residual is about the **seed's own** orbit | the `ω`-limit set of one configuration | and that is the object nobody in this literature has a theorem about |

**What it leans on.** Both fetched.

- Cervelle, Formenti and Guillon, *Ultimate Traces of Cellular Automata*,
  arXiv:1001.0251, <https://arxiv.org/abs/1001.0251>. Abstract, verbatim:
  *"A cellular automaton (CA) is a parallel synchronous computing model, which
  consists in a juxtaposition of finite automata (cells) whose state evolves
  according to that of their neighbors. Its trace is the set of infinite words
  representing the sequence of states taken by some particular cell. In this
  paper we study the ultimate trace of CA and partial CA (a CA restricted to a
  particular subshift). The ultimate trace is the trace observed after a long
  time run of the CA. We give sufficient conditions for a set of infinite words
  to be the trace of some CA and prove the undecidability of all properties
  over traces that are stable by ultimate coincidence."*
- Guillon and Richard, *Revisiting the Rice Theorem of Cellular Automata*,
  arXiv:1001.0253, <https://arxiv.org/abs/1001.0253>. Abstract, verbatim:
  *"…In this paper, we prove that all properties of limit sets of cellular
  automata with binary-state cells are undecidable, except surjectivity. This
  is a refinement of the classical "Rice Theorem" that Kari proved on cellular
  automata with arbitrary state sets."*

**The test.** The claim to attack is the classification, not the theorems:
*every one of P1, `..._of_long_black_runs`, `..._of_deep_alternating` and
`..._of_white_times` is invariant under changing finitely many terms of the
centre column.* Direct from each statement's `∀N ∃t ≥ N` or `∀ n ≥ N` guard; a
theorist who finds one that is not has found the separation this vantage was
sent for. `..._of_cohomologous` is the interesting case and it is *also*
stable, since `PeriodicFrom … p N` quantifies over `n ≥ N`.

**What it would give.** It gives the clause a closing sentence rather than a
proof. Undecidability of a class is not undecidability of rule 30, and nothing
here says P1 is unprovable — only that the one body of theory that takes these
five statements as objects of the same type treats them identically, which is
precisely the evidence crystal 72 asked for and got in the negative.

---

### 3.5 `..._of_white_times`: the field it lands in is P1's own

**The claim.** The white-times residual is not a strengthening of P1, or a
reduction of it, or a reformulation with a smaller object: it is **logically
equivalent to P1**, so no literature can attach to it that does not already
attach to P1, and the question this vantage asks has no content for one of its
four cases.

**The dictionary.** Every row is the identity, which is the point.

| `..._of_white_times`'s residual | P1 |
|---|---|
| `∀ p > 0, ∀ N, (centre p-periodic from N) → (column 1 repeats at the white times)` | `¬ ∃ p > 0, ∃ N, centre p-periodic from N` |
| the antecedent | the negation of the goal |
| the consequent | *anything at all* — it is never reached |
| the hypothesis holds | the goal holds |
| **seam** | there is none, and that is the finding |

**What it leans on.** Nothing outside the project. Kernel-checked here:
`explorer/chorobates_scratch_whitetimes.lean`, accepted by `lake env lean`,

```
'whiteTimes_of_p1' depends on axioms: [propext]
'whiteTimes_of_p1_general' depends on axioms: [propext]
```

`whiteTimes_of_p1` proves `¬ IsEventuallyPeriodic centerColumn → WhiteTimes`,
where `WhiteTimes` is the node's hypothesis copied verbatim from
`Rule30/Statements.lean`; with the node itself (`WhiteTimes → P1`) that is
`WhiteTimes ↔ P1`. `whiteTimes_of_p1_general` is the same proof with the
consequent replaced by an arbitrary predicate `Q : ℕ → Prop`, which is the
general form of the trap: **a sufficient condition whose hypothesis is guarded
by the negation of its own goal is equivalent to that goal, whatever the
hypothesis says inside the guard.**

**The test.** It is done. The falsifiable form for a theorist who doubts it:
exhibit `p > 0` and `N` with `∀ t ≥ N, centerColumn (t+p) = centerColumn t`
— which is P1's negation, so nobody will.

**What it would give.** It gives crystal 72 a fifth clause, and this one is
cheap to apply: *before seeding a sufficient condition, check whether its
hypothesis is guarded by the negation of the goal; if it is, the node is the
goal in conditional clothing and buys nothing.* The board has at least one
other node of exactly this shape already —
`centerColumn_periodic_neg_one_black_times`, whose hypothesis is again "the
centre column has period `p` from `N`", and whose own `DOES NOT PROVE` field
says "its hypothesis is the negation of P1, so nobody can exhibit a `p` and `N`
satisfying it". That field is right and the general lemma above says what it
costs.

## 4. Died in translation

Eleven, with the seam that broke each. The first three are mine from this
session and the first is the one a next connector is most likely to repeat.

- **"Rule 30's alternating block is the smallest member of a family of shields,
  as `{0,2}` is one of several closed sub-alphabets in Gilbreath's array."** My
  own, and the reason I wrote the first script. Dies exhaustively: for every
  `L ≤ 10`, exactly two words of length `L` pin the centre column for `L` rows
  and both are the alternating word with its deepest cell free
  (`explorer/chorobates_shields2.mjs`). The seam is `rule30_eq`'s `OR`: a
  one-sided shield must keep the centre black at every step or the right
  neighbour stops being masked, and `column_succ_of_black` then forces the
  alternation outward, so the alternating word is the unique fixed point of the
  requirement. **The family does not exist.**
- **"Two-sided patches of rule 30's space-time periodic rings are a second
  shield family, and longer than the one-sided ones."** Dies against its own
  null: over 20,001 rows, the longest such patch around the origin is 12 on the
  seed and 11 on a fair-coin row of the same width, and the longest alternating
  block is 13 on the seed against the coin's 14. Both are chance numbers, and
  the patch beat the block at 3,469 of 10,120 black rows on the seed against
  3,441 of 10,069 on the coin — the same rate. This also kills §2's row 9: the
  checkerboard is not a regular domain of rule 30.
- **Two faults in my own first script, `explorer/chorobates_shields.mjs`, both
  of the shape this project keeps producing.** It reported *"3,738 rows where
  the two-sided patch beat the alternating block"*, which was mostly the rows
  where the centre is white and the alternating depth is `0` by definition — a
  true count of the wrong denominator. And its forcing test reported *"max
  forced rows = L"* at every `L`, which was the measurement's own cap, with the
  winner count rising `2,2,…,2,4,8,16,32` from `L = 11` because the model had
  run out of left cells rather than because a second family appeared. Both
  fixed in `chorobates_shields2.mjs`, where the margin makes the cap
  non-binding and the null makes the count mean something. **The `4,8,16,32`
  was the more dangerous of the two, because it looked like structure.**
- **"Rule 30's limit set answers the residual."** Dies on surjectivity: rule 30
  is left-permutive, hence surjective, hence `F(X) = X` and the limit set is
  the entire shift space, so `1^k` lies in it for every `k` and the statement is
  vacuously true. The limit set is a property of the CA; the residual is a
  property of one orbit.
- **"Automatic-sequence decision procedures separate the residual from P1."**
  They decide *both* — "does `1^k` occur for every `k`" and "is the sequence
  ultimately periodic" are both decidable for `k`-automatic sequences by the
  same first-order machinery (Charlier–Rampersad–Shallit, arXiv:1102.3698,
  abstract fetched: *"We show that various aspects of k-automatic sequences —
  such as having an unbordered factor of length n — are both decidable and
  effectively enumerable… These include many sequences previously studied in
  the literature, such as the recurrence function, the appearance function, and
  the repetitivity index."*). No separation; and crystal 73 already excluded
  automaticity by measurement, so the machinery does not apply either way.
- **"Repetitivity / appearance functions from aperiodic order give the
  residual."** Dies on minimality: the appearance function is defined for
  minimal (uniformly recurrent) systems, nothing says the seed's picture is
  one, and crystal 73's blocking-word result says rule 30 has no
  equicontinuous configuration, which is the property those arguments start
  from.
- **"Poincaré recurrence plus Hedlund invariance gives unbounded runs."** True
  for almost every configuration under the uniform Bernoulli measure that a
  surjective CA preserves, and the seed is a measure-zero point. The same seam
  as crystals A3, the greedy walker, and Prize 2's excess; I record it only
  because it is the first thing an ergodic theorist reaches for.
- **"The `m`-sequence run theorem transfers under the residual's own
  hypothesis, because a periodic column gives a finite state space."** Dies on
  Jen's theorem. Obstruction 11's route to a finite ring needs *another* column
  to be eventually periodic, and the board's proved `not_isEventuallyPeriodic_pair`
  forbids that under P1's negation. So the seed is exactly the case where the
  ring structure is unavailable, and Golomb's counting argument has no state
  space to count.
- **"Positive entropy of the column's subshift gives unbounded runs."** Dies at
  the golden-mean shift, which has positive entropy and no `11` at all. Entropy
  is a cardinality statement about the language and the residual is a
  membership statement; they do not communicate.
- **"Unbounded runs occur arbitrarily late is strictly stronger than unbounded
  runs occur."** Dies on inspection, and it is worth recording because it makes
  the subshift reformulation in §1 exact: if `1^k` occurred only finitely often
  for some `k` then every occurrence of every longer run lies inside one of
  those finitely many places, so run lengths would be bounded outright. The two
  forms are the same statement.
- **"Gilbreath's array and rule 30 differ because theirs reads one neighbour
  and ours reads two."** Not a seam. Both shields are one-sided, and for the
  same structural reason in different clothing: their entry depends on itself
  and its right neighbour, so information flows left; rule 30's entry depends
  on all three, but the `OR` masks the right neighbour exactly when the centre
  is black, which is exactly when the shield is running. The real seam is
  linearity, not the neighbourhood.

## 5. What to hand the theorist

**The honest answer to the vantage first, because it is the deliverable.**
Three of the four residuals reach literatures P1 does not; none of the three
buys a route; the fourth reaches nothing because it *is* P1. So the literature
clause should be closed. What follows is what I would actually spend a session
on, in order, and the first is not a mathematics topic.

**1. The fence line, and it costs nothing.** Add to crystal 72, as the outcome
of the literature clause: *the clause is closed. `..._of_white_times` is
logically equivalent to P1 (kernel-checked,
`explorer/chorobates_scratch_whitetimes.lean`, axioms `[propext]`), so no
literature can attach to it. `..._of_cohomologous` reaches coboundary
rigidity, which Portage sighted on 2026-09-08 and whose witness search the
board ran to 38,700 pairs with 0 survivors. The two run-shaped residuals —
which are one object — reach the run-length literature, where a two-line
argument shows no theorem can help (every run bound is capped by the period, and
a run bound indexed by time is the residual itself), and the Gilbreath–Proth
difference-triangle literature, where the correspondence is exact row for row
and breaks at linearity.* And add the fifth clause from §3.5: **a sufficient
condition whose hypothesis is guarded by the negation of its own goal is
equivalent to that goal**, with `whiteTimes_of_p1_general` as the general form.

**2. The topic I would spend a theorist's session on, and it is small.** Not a
transfer; a fence. *Claim to falsify:* **the alternating block is the unique
one-sided shield of rule 30's centre column.** Precisely: if `w` is a word on
cells `0, −1, …, −(L−1)` such that for every configuration `X` whose row at
time `t` carries `w`, the values `column X 0 t, …, column X 0 (t + L − 1)` are
determined by `w` alone, then `w` is `1,0,1,0,…` on cells `0 … −(L−2)`.
*The dictionary row it depends on:* the shield row — `column_alternating_shrink`
against Odlyzko's `{0,2}` window. *The depth or statement that settles it:*
exhaustive for `L ≤ 10` with margin 6 and 4,000 completions
(`explorer/chorobates_shields2.mjs`); the general proof is two steps from
`rule30_eq` and `column_succ_of_black` and should be a size-S node. **This is
not a fifth sufficient condition and must not be seeded as one** — it proves
nothing about P1. Its value is that it closes, in advance, the one
generalisation the Gilbreath dictionary invites ("find more shields"), which is
what a future connector reading this document would otherwise try first.

**3. The one fetch worth a captain's time.** Chase–Hunter–Tao's Theorem 1.6, in
full. I could not extract it (§3.1) and my reading that their inverse-theorem
method is linear-specific rests on Lemma 3.10's stated role rather than on the
theorem. If the method is *not* linear-specific, this connection reopens and is
the best thing on the board's P1 shelf; if it is, the clause is closed with a
citation rather than with a reading. That is a ten-minute job for whoever can
open a PDF.

**What I would not spend a session on:** the cocycle route (sighted, searched,
empty), the automatic-sequence route (crystal 73 already closed it), and
anything that ends at "almost every configuration".

## 6. Next vantage

**Effective and algorithmic randomness of individual orbits** — Martin-Löf,
Schnorr and Kurtz randomness, effective Birkhoff theorems, the
Gács–Hoyrup–Rojas line — and I could not reach it from where I stood. Every
probabilistic route this board has tried, including three in this document,
dies at the same place: a theorem holds for almost every configuration and the
seed is one point of measure zero. That field is the only one I know of whose
theorems are *about individual points* and whose hypotheses are computational
rather than measure-theoretic, and it has an immediate, brutal seam — the seed
is computable, so it is not Martin-Löf random, and the strongest theorems do
not apply. What I could not do is find out whether the *weaker* notions reach
it: whether there is any theorem of the form "a computable point whose orbit
satisfies such-and-such an effective condition has unbounded runs in its
trace", and whether the several effective-randomness notions that a computable
sequence *can* satisfy (normality is one, and rule 30's column is measured
normal-looking to `10^7`) imply anything about a specific word occurring. That
is a real question, it is squarely about the run-shaped residual rather than
about P1, and it is the one live thing the run literature's two-line refutation
in §3.2 does *not* touch, because an effective-randomness theorem would be
indexed by time rather than by the period. Send someone who can read
computability theory; I could only see the field's edge from here, and a
levelling trough is no use at all for measuring something on the other side of
a hill.
