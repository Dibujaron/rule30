# Sighting: `centerColumn_other_isEventuallyPeriodic_of_center` from algebraic and expansive subdynamics of `Z^2` actions

**Vantage.** Boyle–Lind directional expansiveness, Kitchens–Schmidt algebraic
`Z^2` actions, Ledrappier-type subshifts; whether the residual is a directional
statement in disguise; the three measured slopes; and whether "the diagonal of a
Toeplitz array" has a name in that field.

**Connector.** Rosetta, 2026-09-08.

**One-line summary.** The residual *is* a directional statement, and the vantage
lets me compute the direction data exactly — the nonexpansive set of rule 30's
space-time subshift is a whole closed arc where the linear rules have three
isolated directions, and the wall sits in its interior. But the same vantage
produces the session's real find, which points the other way: **rule 30's
nearest linear relatives, rules 90 and 150, each have exactly one eventually
periodic column, so the residual is false for them** — and rule 30 differs from
rule 150 by exactly one quadratic monomial. Every proof of this wall must use
that monomial, and no argument from expansiveness, determinism, Newton polygons,
or the sandwich lemma can, because rule 90 has strictly more of all four and
fails.

Scripts written and run for this document, all under `explorer/`:
`rosetta_linear.mjs`, `rosetta_doubling.mjs`, `rosetta_directions.mjs`.

---

## 1. The problem, seen from outside

Take the map on bi-infinite rows of bits sending `b` to `b'` with
`b'(i) = b(i-1) XOR (b(i) OR b(i+1))`, and iterate it from the row that is `1`
at one place and `0` everywhere else. What grows is a triangle of bits, one row
per step, widening by one cell on each side. Write `c(t)` for the bit at the
origin after `t` steps. Known (Jen 1990): no two distinct vertical lines of this
triangle can both be eventually periodic. Known: `c` passes every statistical
test anyone has run, to great depth. Not known: whether `c` is eventually
periodic. The statement in front of me is the implication — **if `c` repeats,
some other vertical line repeats too** — which with Jen's result says `c` never
repeats, the first of Wolfram's prize questions. Nobody has a route.

**Restated in this vantage's own terms.** The set `X` of all bi-infinite
space-time diagrams of that map — all `y` in `{0,1}^(Z^2)` with
`y(t+1,x) = y(t,x-1) XOR (y(t,x) OR y(t,x+1))` for every `(t,x)` — is a
nearest-neighbour shift of finite type on `Z^2`, and the two coordinate shifts
generate a `Z^2` action on it. Boyle–Lind's expansive subdynamics asks, for each
line direction in `R^2`, whether a thickened band around a line in that
direction determines the whole diagram; the set `N(X)` of directions where it
does not is a closed, non-empty invariant of the system. The triangle is one
point `η` of `X` (one of its bi-infinite histories; the map is surjective, so
they exist), and the residual is a question about the *vertical* line direction
at one particular place: `c` is `η` read along the line `x = 0`, and the wall
says that if that read is eventually periodic then the read along some other
vertical line is too. In the linear members of this family — the Ledrappier
three-dot system and its relatives, where the defining relation is a polynomial
over `F_2` and the whole Kitchens–Schmidt apparatus applies — `N(X)` is the
finite set of edge directions of that polynomial's Newton polygon, and the
question can be answered by hand. Rule 30's relation is that of rule 150 plus
one quadratic monomial, `N(X)` swells from three directions to a closed arc, and
the vertical direction is in its interior.

---

## 2. Fields sighted

| Field or theory | The object there | The seam, in one line |
|---|---|---|
| Expansive subdynamics of `Z^2` actions (Boyle–Lind) | The space-time SFT `X`; the nonexpansive set `N(X)`; expansive components | `N(X)` is a whole closed **arc** containing the vertical direction, and every theorem of the theory has content on the *other* side |
| Algebraic `Z^2` actions / Ledrappier subshifts (Kitchens–Schmidt, Kari–Moutot) | `X_f = {c : f·c = 0}` over `F_2`; the three-dot system is the XOR automaton's space-time diagram | Rule 30 = rule 150 `+ (centre AND right)`: one quadratic monomial, and with it goes the group, the module, the dual, and every rigidity theorem |
| Newton polygons and amoebas of Laurent polynomials (Einsiedler–Lind–Miles–Ward) | `N(X_f)` = the edge directions of the Newton polygon of `f` | Verified here for rule 90 (three directions, three edges); rule 30 has no `f`, and its `N(X)` is an arc, not a finite set |
| Directional dynamics of CA (Sablik; Kůrka §9, §11) | `X^-(F)`, `X^+(F)`, `E(F)`, `A(F)`; directional entropy `h_α(F)` | `X^-(F) = (-∞, 1)` by left-permutivity, `X^+(F) = ∅`: the theory hands over exactly the deficiency the free bit already told us about |
| Lyapunov exponents for CA (Shereshevsky, Tisseur, Bressaud–Tisseur) | `λ^+ = 1` **exactly** (a theorem); `λ^-` = the left damage front, measured `0.24` | Shereshevsky's inequality bounds entropy *below* by the exponents, and the wall needs the exponent bounded *above* |
| Deterministic directions in 2D SFTs (Guillon–Kari–Zinoviadis) | "expansive `⟺` both orthogonal half-planes deterministic"; `leftSolve` is one-sided determinism | The vertical direction is deterministic leftward and not rightward; the field names this and proves nothing about it |
| Nivat's conjecture, low-complexity `Z^2` configurations (Cyr–Kra, Kari–Moutot) | The block complexity `P(w,h)` of the picture | Measured `P(2,8) = 2916` against a Nivat threshold of `8`; even the *settled* region is exponential, because the periods are unbounded |
| Entropy rank one (Einsiedler–Lind) | Every CA space-time SFT: `2^(w + 2(h-1))` admissible `w×h` blocks, so zero `Z^2` entropy with positive 1-dimensional entropy | Rule 30's picture is entropy rank one for a trivial reason shared with every CA, so the class does not separate it from anything |
| Milnor directional entropy | `h_α`, convex and continuous on the expansive directions (Boyle–Lind) | The convexity theorem is stated *on* `X^-∪X^+`, and the vertical direction is on the boundary of what that covers |
| Toeplitz arrays and almost 1–1 extensions of `Z^d` odometers (Downarowicz, Cortez) | The right-edge array `(t,d) ↦ e(t)_d`, periodic in `t` at each depth `d` | The period subgroup of a cell is rank one, so infinite index: not a `Z^d` Toeplitz array, and the diagonal read has **no name here** (see 3.5) |
| Morse–Hedlund in one dimension | "`P(n) ≤ n` for some `n` iff eventually periodic" | The residual is about one *line* of a 2D object; every 2D generalisation needs complexity in both directions and we have it in neither |
| Wang tiles, 4-way determinism (Kari, Zinoviadis) | A tile set deterministic in all four corner directions has every non-axis direction expansive | Rule 30 is deterministic in two corner directions out of four, and the two it lacks are the two the wall needs |
| Interface growth / first-passage percolation | The damage front at `0.24t` as a random interface with a local law | No theorem in print bounds a CA damage front below speed 1; `crystals` A3 says the worst case is exactly 1 |
| Textile systems, resolving endomorphisms (Nasu) | Left-resolving = left-permutive here; the "textile" is the space-time diagram | Nasu's structure theorems are for *bi*-resolving or expansive maps; rule 30 is neither |

---

## 3. Connections

### 3.1 The nonexpansive set of rule 30's space-time subshift is exactly the closed arc of velocities `v ≥ -1`, and the wall lives in its interior

**The claim.** The whole of Boyle–Lind's basic invariant is computable here by
hand, and I computed it: a band of velocity `v` (cells of space per row of time)
extends its determined region leftward at exactly `|1 - v|` cells per row and
rightward at exactly `max(0, -1 - v)` cells per row. So the expansive directions
of rule 30's space-time SFT are exactly the velocities `v < -1` — bands moving
left *faster than light* — and every other direction, including the vertical one
the wall is about, is nonexpansive. For the linear relatives the same arithmetic
gives three isolated nonexpansive directions, which are the edge directions of
the defining polynomial's Newton polygon.

**The dictionary.**

| This project | Expansive subdynamics of `Z^2` actions | Checked |
|---|---|---|
| The picture, extended to all times | A point `η` of the `Z^2` SFT `X` = all valid space-time diagrams | rule check: 249,999 cells, 0 violations |
| `X` is nonempty and `η` extends backwards | Rule 30 is surjective, being permutive (Schüle–Stoop Prop. 15, held) | cited |
| A thickened line of velocity `v` | The band `{(t,x) : |x - vt| ≤ n}` | — |
| `rule30_eq` read forwards | The deduction `(t,x-1),(t,x),(t,x+1) → (t+1,x)` | — |
| `leftSolve` / `sideways_inverse` | The deduction `(t,x),(t,x+1),(t+1,x) → (t,x-1)`: left-permutivity | — |
| The free bit at every black time | There is **no** third uniform deduction: rule 30 is **not right-closing** | witness below: two rows agreeing on a left half-line, differing at 2,667 of 4,001 places, with identical images |
| So, in Sablik's notation | `X^+(F) = ∅` (Kůrka Theorem 33: `X^+(F) ≠ ∅` iff `F` is right-closing) | — |
| Leftward reach of a band of velocity `v` | grows at `|1 - v|` cells per row | measured `1.02, 1.51, 0.52` at `v = 0, -0.5, 0.5` |
| Rightward reach of a band of velocity `v` | grows at `max(0, -1-v)` cells per row | measured `0.53, 1.03` at `v = -1.5, -2`; **`0` at every `v ≥ -1`** |
| Velocity `+1` (the right light cone) | Determines *nothing at all*: both rates vanish | reach `3/3` from a band of half-width `3`, at every height |
| Velocity `0` (the centre column's own direction) | Determines the left half-plane and not one cell to the right | reach `182/3` at height 360 |
| The horizontal direction (a whole row) | Nonexpansive because rule 30 is not injective | the same witness: `x ≠ y` with `F(x) = F(y)` |
| **`N(X_30)`** | **The closed arc of velocities `[-1, +∞]` together with the horizontal** | closed and non-empty, as Boyle–Lind require |
| **`N(X_90)`** | **Three isolated directions: `v = -1`, `v = +1`, horizontal** | measured: reach stalls only at `v = ∓1` |
| `N(X_90)` again | The three **edge directions of the Newton polygon** of `XY + 1 + X^2` — vertices `(0,0),(2,0),(1,1)` | the three edges give horizontal, `v=+1`, `v=-1` |
| Ledrappier's three-dot `f = 1 + X + Y` | Its three edge directions are horizontal, vertical, `v = -1` | the classical three |
| An expansive direction | The subaction is conjugate to a subshift on the alphabet of band-words | immediate from the definition; that it is an **SFT** is Boyle–Lind, and is the UNVERIFIED citation below |
| The centre column as an observable of that subaction | **Not one.** A vertical line crosses every band of velocity `v < -1` exactly once | this is the seam |

**Seams.** (i) The whole expansive half of the theory is unreachable, because
the only expansive directions are steeper than the left light cone, and a
vertical line meets such a band once: `c(t)` is never a function of an expansive
subaction's state. This is the `Z^2` restatement of Portage's "the observable is
at depth `t`", and it is the same wall in different coordinates. (ii) My reach
rates are computed with the *uniform* deductions, valid for every diagram; a
particular diagram may be determined further by value-dependent steps, and the
measurement says how much further: switching on the rightward rule where the
pivot cell is white extends a vertical band's reach from `3` cells to `6` — **all
the free-bit structure in the picture buys exactly three columns**, because the
chain dies at the first black pivot. (iii) `N(X)` is an invariant of the
subshift, not of the point `η`; the orbit closure of the picture is a much
smaller system and I did not compute its `N`, which is a real gap.

**What it leans on.**

- The definition of an expansive line, fetched at
  <https://ar5iv.labs.arxiv.org/html/0906.0609> (Hochman, *Non-expansive
  directions for `Z^2` actions*): *"Then ℓ is said to be an expansive line if
  there exist r>0 and δ>0 such that, for all x,y∈X, d(T^u x,T^u y)<δ for all
  u∈ℓ^r∩ℤ² ⟹ x=y"*, and *"Expansiveness only depends on the direction of the
  line and not the line itself, so we may speak of expansive and non-expansive
  directions."*
- Boyle–Lind's basic fact, from the same page: *"It was shown that this set is
  closed and, when the phase space is infinite, non-empty; and furthermore if C
  is any closed set of directions of cardinality |C|≥2, then it is the set of
  non-expansive directions for some action."* And in the same words at
  <https://ar5iv.labs.arxiv.org/html/1603.05464> (Zinoviadis), Proposition 9:
  *"𝒩(X) is closed. In addition, 𝒩(X) is empty if and only if X is finite."*
- Sablik's theorem in the held text
  `sources/kurka-topological-dynamics-1d-ca.txt`, Theorem 32 (lines 611–614):
  *"(1) If F is left-permutive, then X− (F ) = ( −∞ , −m). (2) If F is
  right-permutive, then X+(F ) = ( −a, ∞ )."* Rule 30 has memory `m = -1`, so
  `X^-(F) = (-∞, 1)`. For the other half, the same file's Theorem 33 (line 620):
  *"(2) F is right-closing iﬀ X+(F ) ⁄= ∅."* — and rule 30 is not right-closing,
  which I verified rather than assumed (below), so `X^+(F) = ∅`. The band
  arithmetic above is that pair of facts made quantitative.
- **UNVERIFIED**, and it is the one citation I would most like: Boyle and Lind,
  *Expansive subdynamics*, Trans. AMS **349** (1997) 55–102, for the theorem
  that the subdynamics along an expansive line of a `Z^2` SFT is itself an SFT.
  The paper is at <https://math.umd.edu/~mboyle/papers/subdynamics.pdf> — I
  fetched that URL and the PDF came back as undecodable binary; I fetched the
  index <https://math.umd.edu/~mboyle/papers/> and confirmed the file is the one
  listed under "Expansive subdynamics". I use the theorem nowhere load-bearing:
  it appears in one dictionary row that the seam then kills.
- The Newton polygon reading is my own arithmetic, not a citation. The theorem
  it resembles is Einsiedler–Lind–Miles–Ward, *Expansive subdynamics for
  algebraic `Z^d` actions*; I found the listing at
  <https://shura.shu.ac.uk/17240/> via search but did not fetch the text, so
  **UNVERIFIED** that their statement is in terms of the Newton polygon rather
  than the amoeba. What is verified is the *instance*: rule 90's three stalling
  directions, measured, are the three edge directions of `XY + 1 + X^2`.

**The test.** `explorer/rosetta_directions.mjs`. Section A0 builds the
right-non-closing witness: two rows that agree on the half-line `x ≤ 0`, both
black at the origin, differing from `x = 1` on, whose rule 30 images agree at
every one of 4,000 positions. They are

```
    x = 1 0 1 0 0 1 0 0 1 0 0 1 …    (that is, 1 0 then (100) repeating)
    y = 1 1 0 0 1 0 0 1 0 0 1 0 …    (that is, 1 1 then (001) repeating)
```

differing at 2,667 of 4,001 positions — so the greedy choice never got stuck, and
rule 30 loses information rightward at a positive rate rather than at finitely
many places. Section A: the determination
closure from a band, run for `v ∈ {-3,-2,-1.5,-1,-0.5,0,0.5,1,2,3}` at two
rectangle heights, reporting how far the determined region reaches on the middle
row. Rightward reach is `3` — the band's own half-width, i.e. nothing — for
every `v ≥ -1`, and grows with the height for every `v < -1`. Section A3 runs the
identical closure for rule 90 with its three uniform deductions and reproduces
the known three-direction answer exactly: reach stalls only at `v = -1`
(rightward) and `v = +1` (leftward). That control is the reason to believe the
rule 30 numbers. To falsify: exhibit a fourth uniform deduction for rule 30, or a
`v ≥ -1` and a band half-width from which the rightward reach is unbounded.

**What it would give.** It does not touch the residual, and its value is in
saying *why* with a number rather than a feeling: every direction in which this
project's tools work — the diagonals, the seam, `leftSolve` — is a direction in
which the picture is determined leftward, and the wall is the one place where
rightward determination is needed and the rate is exactly zero. What remains is
everything.

---

### 3.2 Rule 30 is rule 150 plus one quadratic monomial, and the residual is **false** for rule 150 and for rule 90

**The claim.** Over `F_2`, `a OR b = a + b + ab`, so rule 30's local rule is

```
    l XOR (c OR r)  =  l + c + r + c·r  =  rule 150  +  c·r
```

— rule 150 with one quadratic monomial added, flipping exactly two of the eight
table entries (`150 XOR (2^3 + 2^7) = 30`). Rule 150's space-time diagrams are an
*algebraic* `Z^2` subshift in the sense of the Ledrappier world, annihilated by
`XY + 1 + X + X^2` over `F_2`; rule 90's by `XY + 1 + X^2`; Ledrappier's own
three-dot system is the two-cell XOR automaton, rule 102. In that whole linear
family the columns question is answerable, and **the answer is the opposite of
the one the residual wants**: rule 150's centre column is identically black
while its column 1 is provably not eventually periodic, and rule 90's centre
column is white from time 1 on while no other column near it is eventually
periodic. Each of them has *exactly one* eventually periodic column. So each of
them satisfies Jen's conclusion — no two columns both repeat — and falsifies the
residual. Any proof of this wall must therefore use the monomial `c·r`, and no
argument available to rule 90 or rule 150 can be the proof.

**The dictionary.**

| This project | The linear relatives | Checked |
|---|---|---|
| `rule30_eq`, `l XOR (c OR r)` | `l + c + r + c·r` over `F_2` | `150 XOR 136 = 30`, arithmetic |
| The space-time set of a *linear* rule | The algebraic subshift `X_f = {c : f·c = 0}` | Kari–Moutot's definition, quoted below |
| Ledrappier's three-dot system, `f = 1 + X + Y` | The space-time diagrams of rule 102 | *"exactly the space-time diagrams of the one-dimensional XOR cellular automaton"* |
| rule 150's space-time set | `X_f`, `f = XY + 1 + X + X^2` | by inspection of the rule |
| rule 90's space-time set | `X_f`, `f = XY + 1 + X^2` | by inspection |
| rule 30's space-time set | **Not** an `X_f`: the relation is quadratic in the unknowns | this is the seam |
| `centerColumn` of rule 90 | `binom(t, t/2) mod 2`, black only at `t = 0` — eventually periodic, `p = 1` | closed form checked on 243,000 cells, then `10^7` rows |
| Other columns of rule 90 | `18` to `107` black cells below `10^7`, largest gap `2^22` | so any eventual period exceeds `9·10^4`; `x = 1` is black exactly at `t = 2^(m+1) - 1`, provably aperiodic |
| `centerColumn` of rule 150 | **Identically black.** `cell(2t,0) = cell(t,0)` by Frobenius and `cell(2t±1 ,0)` closes the induction | `10^7` of `10^7` rows black; identities `0` failures on `2·10^6` |
| Column 1 of rule 150 | `a(2t) = 0`, `a(2t+1) = 1 XOR a(t)` — **provably not eventually periodic** | `0` failures on `10^6` pairs; forced density `1/3`, measured `0.333334` |
| Other columns of rule 150 | no period `≤ 4096` over 20,000 consecutive rows, density `≈ 1/3` | `|x| ≤ 64` |
| Rules 60 and 102 | *Every* column eventually periodic (`p = 2^⌈log2(x+1)⌉`) — the residual holds trivially | measured |
| Rule 30 | `0` of `129` columns pass the same test | measured, `T = 60,000` |
| Jen's theorem's conclusion | Holds for rule 90 and rule 150: exactly one repeating column, never two | — |
| **The residual** | **Fails for rule 90 and rule 150** | — |
| The vertical direction for rule 90 | **Expansive** (bipermutive: columns `0,1` determine everything both ways) | section A3 |
| The vertical direction for rule 30 | Nonexpansive (3.1) | section A |

**Seams.** (i) The failure for rule 90 rests on "no *other* column is eventually
periodic", and I tested `|x| ≤ 33` to depth `10^7` and `|x| ≤ 64` to depth
`60,000`; a periodic column at some large `|x|` would undo it. For rule 150 the
evidence is stronger, because the columns there are dense (density `1/3`, small
gaps) so the sparse-column artefact cannot hide a period, and column 1 is
provably aperiodic. (ii) It is a *no-go*, not an obstruction to any named
attempt: it says a class of arguments cannot work, and the class is "anything
true of rule 150". (iii) The direction of the surprise is worth stating plainly:
rule 90 has strictly **more** structure than rule 30 — bipermutive, linear,
algebraic, vertical direction expansive, three isolated nonexpansive directions
— and it is the one where the residual fails. The wall is not a rigidity
statement; whatever makes it true makes it true because rule 30 is *irregular*,
not because it is rigid.

**What it leans on.**

- Kari and Moutot, *Nivat's Conjecture and Pattern Complexity in Algebraic
  Subshifts*, fetched at <https://arxiv.org/abs/1806.07107> (abstract) and
  <https://ar5iv.labs.arxiv.org/html/1806.07107> (text): *"The Ledrappier
  subshift L is the algebraic subshift X_fL over 𝔽2 defined by the annihilator
  fL=1+X+Y."*; *"Elements of the Ledrappier subshift are exactly the space-time
  diagrams of the one-dimensional XOR cellular automaton."*; and the definition
  *"If R is a finite field and if f∈R[X±1,Y±1] is a non-zero polynomial then we
  define the set Xf={c∈R[[X±1,Y±1]]|fc=0} of all configurations that f
  annihilates and call it the algebraic subshift defined by f."* The last is the
  seam in one sentence: `f·c = 0` is linear in `c`, and `c·r` is not.
- The abstract of the same paper for what the linear world gets and rule 30 does
  not: *"We study Nivat's conjecture on algebraic subshifts and prove that in
  some of them every low complexity configuration is periodic."*
- Nothing else outside the project. The two rule 150 identities and the descent
  that makes column 1 aperiodic are elementary and are written out in the script.

**The test.** `explorer/rosetta_linear.mjs`. Section A checks a BigInt engine
for arbitrary elementary rules against a naive per-cell run (16,400 cells per
rule, 0 disagreements). Section B runs rules 30, 60, 90, 102, 150 to
`T = 60,000` and reports, for each column, a tail period **together with** the
last black cell and the largest gap — because my first version of this test
reported "rule 90: 129 of 129 columns periodic", which was true about the window
and false about the columns: a column whose black cells are exponentially sparse
is all white on any tail window. Sections C and D verify closed forms (Kummer for
rule 90, a digit DP for rule 150) against the simulation on 243,000 cells each
and then run to `10^7`. Section E checks the three rule 150 identities. For a
theorist, the claim to falsify:

> Rule 150 from a single black cell has a second eventually periodic column:
> some `x ≠ 0` and `p > 0` with `cell(t + p, x) = cell(t, x)` for all large `t`.

Measured false for `|x| ≤ 64` at every `p ≤ 4096` over 20,000 consecutive rows.

**What it would give.** It is the strongest constraint in this document. It says
the residual is not implied by: surjectivity, left-permutivity, the light cone,
the space-time SFT structure, entropy rank one, the Newton polygon, the sandwich
lemma, or expansiveness of the vertical direction — because rule 90 has all of
them and fails. What remains after it is the whole wall, but with a test every
candidate lemma can be run against in ten minutes: *does it also hold for rule
150?* If it does, it is not a proof.

---

### 3.3 The residual is the missing half of a deterministic direction, and the field names it

**The claim.** In the `Z^2` vocabulary, a direction is expansive exactly when
both half-planes bounded by it are *deterministic*. Rule 30's vertical direction
is deterministic on one side and not on the other, and everything the project
knows about the columns is the deterministic side while everything it needs is
the other. Jen's sandwich lemma and Kopra's width-2 theorem are, in this
language, statements about the deterministic half-plane; the residual is the
first statement that needs the non-deterministic one, and that is exactly why
nothing on the board reaches it.

**The dictionary.**

| This project | Deterministic directions in 2D subshifts | Checked |
|---|---|---|
| `leftSolve`, `sideways_inverse` | The half-plane right of a vertical line is **deterministic**: it determines the left | on the board |
| Jen's sandwich lemma (two columns force the strip) | A determinism statement about the same half-plane | held source |
| Kopra's width-2 theorem | The same half-plane, made into a theorem about column pairs | held source |
| The free bit at every black time | The half-plane *left* of a vertical line is **not** deterministic | obstruction 2, 3 |
| "expansive `⟺` both orthogonal directions deterministic" | So the vertical direction is nonexpansive, with a named one-sided deficiency | quoted below |
| The residual | Needs a conclusion about columns to the **right** of column 0 | — |
| How much the free bits actually buy | Turning on the value-dependent rightward step extends a vertical band's reach from `3` to `6` cells | measured |
| Why so little | The rightward step needs a white pivot, and the chain dies at the first black | measured, `0.334` vs `0.333` of the rectangle |
| A 4-way deterministic tile set | Every non-axis direction expansive | quoted below |
| Rule 30 as a tile set | Deterministic in the SE and NW corner directions only, two of four | by the two deductions of 3.1 |
| Rule 90 as a tile set | Deterministic in three of four (SE, NW, NE), the missing one being the past | section A3 |

**Seams.** (i) The field's own results here are *realisation* results — which
sets of directions can occur, and how to build SFTs with a prescribed set — not
tools for deciding a question inside a given SFT. (ii) The characterisation
"expansive iff both orthogonal directions deterministic" is a restatement, not a
lever: it converts one unknown into two. (iii) The determinism that rule 30 does
have is *uniform* (it holds in every diagram), and the residual concerns one
diagram; obstruction 5 says all diagrams white far to the left share their left
sides anyway, so uniformity is not costing anything here.

**What it leans on.**

- The characterisation, from the search result summarising Guillon–Zinoviadis:
  *"a direction d is an expansive direction for a two-dimensional subshift if and
  only if both of the directions orthogonal to d are deterministic"* — I did not
  fetch a paper containing that sentence, so **UNVERIFIED**; I searched
  *"deterministic direction" two-dimensional subshift finite type Guillon
  Zinoviadis expansive* and fetched
  <https://ar5iv.labs.arxiv.org/html/1603.05464>, which contains Proposition 9
  (quoted in 3.1) and the 4-way determinism statement below but not this
  sentence.
- 4-way determinism, fetched at the same URL: *"A tile set is called 4-way
  deterministic if it is SW, NW, SE and NE deterministic"*, and for such tile
  sets *"for every direction l that is not the vertical or the horizontal
  one..., l is an expansive direction."*
- The two project-side facts are on the board (`leftSolve_eq_column`,
  `evolveHalfRight_eq_column`) and in `sources/jen-1990-la-ur-90-761.txt` and
  `sources/kopra-2022-natural-class.txt`.

**The test.** `explorer/rosetta_directions.mjs`, section A, the two rows headed
"the same with the value-dependent rightward rule switched on": at `v = 0` the
reach goes from `182/3` to `182/6` and the determined fraction from `0.333` to
`0.334`. To falsify the interesting half: find a picture-dependent deduction
chain that carries determination `k` columns to the right of a vertical band with
`k` unbounded — which is what a proof of the residual would have to build.

**What it would give.** A vocabulary and a target, not a proof. Its concrete use
is negative and sharp: **three columns**. Every free bit in the picture, taken
together with the cone, extends rightward determination by three columns and
stops. A theorist who was hoping the black-time identity would propagate can stop
hoping at that number.

---

### 3.4 The three slopes are two numbers and one artefact

**The claim.** The vantage asks me to relate the seam at `0.25t`, the damage
front at `0.24t`, and the period exponent `2^(0.41k)`. They do not form a triple.
The first two are the same quantity — the left Lyapunov exponent `λ^-` of rule 30
at the seed — seen in two coordinate systems, and the exact conversion is
`α ↦ α/(1+α)` between an onset slope along diagonals and a seam slope in the
picture; the third is not a slope at all, and measured to depth `k = 63` it is
not even a constant: it is a sample mean of a fluctuating doubling density whose
local value over the last sixteen levels is exactly `1/2`.

**The dictionary.**

| This project | Lyapunov exponents and directional entropy | Checked |
|---|---|---|
| Information moves right at speed 1 | `λ^+_F(x) = -m = 1` for **every** `x` — a theorem, from left-permutivity | Kůrka, Definition 9 |
| The left damage front, measured `0.24` | `λ^-_F(η)`, the left Lyapunov exponent at the seed | board (obstructions 3, 4, 5) |
| The only bound the theory gives | `λ^-_F(x) ≤ max{a,0} = 1` | Kůrka, Definition 9 — this is `crystals` A3 |
| The onset slope of the left diagonals, `α ≈ 0.336` | — | board (`resetfront.mjs`) |
| The seam slope, `≈ 0.2497` | `α/(1+α)`: diagonal `k` at index `j = αk` is the cell `(t,x) = ((1+α)k, -αk)` | `0.336/1.336 = 0.2515`, measured `0.2497`; agree to 1% |
| **`leftDiagonal_onset_le`** (`onset ≤ k`) | **`α ≤ 1`, i.e. seam slope `≤ 1/2`, i.e. `λ^- ≤ 1/2`** | exactly obstruction 6's equivalence, derived here from the algebra alone |
| The count of cone-constrained column words, `2^(0.24 t)` | The directional entropy in the vertical direction, `h_0` | obstruction 3 |
| Why that number is `λ^-` and not something else | Only cells within `λ^- t` of the origin can have changed the column by time `t`, so the count is at most `2^(λ^- t)` | the horizon argument of obstruction 3, stated as an inequality |
| Shereshevsky's inequality | `h_μ(F) ≤ h_μ(σ)(λ^+_μ + λ^-_μ)` | quoted below |
| What it gives here | `λ^- ≥ h_μ(F)/h_μ(σ) - 1`: a **lower** bound | the wall needs an upper bound |
| Sablik: `α ∈ X^-(F) ⟹ h_α(F) > 0` | The vertical direction has strictly positive directional entropy, as a theorem | Kůrka, Prop. 58(2), `X^-(30) = (-∞,1) ∋ 0` |
| Obstruction 3's "the count doubles at nearly every step" | The same theorem, stated as a measurement | — |
| The right-diagonal period exponent `0.41` | The doubling density of the tower — a count per *level*, not a speed in the picture | measured to `k = 63` here |
| Its picture-space reading | Column `2^e` reproduces `c` for `2.4e` terms: a band of **logarithmic** width, so as a slope it is `0` | Portage 3.3 |
| Is `0.41` a constant? | **No evidence.** Windows of 16 levels give `0.50, 0.25, 0.44, 0.47`; the last 16 give exactly `8/16` | measured |

**Seams.** (i) `λ^-` is a property of one orbit; Shereshevsky's exponents are
`μ`-almost-everywhere constants for an invariant measure, and the seed is a
single point of measure zero, so the inequality does not literally apply to
`0.24`. That mismatch is the same one that defeats every ergodic argument here.
(ii) The identification of `0.24` (a velocity) with `0.24` (an entropy per unit
time) is a real relation and not a coincidence — the horizon argument bounds the
second by the first — but I only have the inequality `h_0 ≤ λ^- log 2` in one
direction, and the measured near-equality is not explained. (iii) The `1%`
agreement between `α/(1+α)` and the measured seam is arithmetic on two numbers
measured by different scripts on different objects; it is a consistency check,
not a discovery.

**What it leans on.**

- Shereshevsky's inequality, fetched at
  <https://arxiv.org/html/math/0312136v1> (Tisseur, *Cellular automata and
  Lyapunov exponents*): *"hμ(F)≤hμ(σ)(λμ++λμ−)"*, with the exponents
  characterising *"the speed of propagation of these perturbations with respect
  to a cellular automaton and shift-invariant measure."*
- Kůrka, held at `sources/kurka-topological-dynamics-1d-ca.txt`, Definition 9
  (lines 428–437): *"If F has memory m and anticipation a, then λ − F (x) ≤
  max{a, 0} and λ + F (x) ≤ max{−m, 0} for all x ∈ AZ. ... If F is left-permutive
  with m< 0, then λ + F (x) = −m for every x ∈AZ."*
- Kůrka, same file, Proposition 58 (lines 835–842): *"(1) If α ∈ E(F ), then hα
  (F ) = 0 . (2) If α ∈ X− (F ) ∪ X+(F ), then hα (F )> 0."* and Theorem 59
  (lines 844–845): *"(Boyle and Lind [8]) The function α ↦→ hα (AZ,F ) is convex
  and continuous on X− (F ) ∪ X+(F )."*

**The test.** `explorer/rosetta_doubling.mjs`. The right-diagonal tower is run
from the recurrence alone — `R_k(j) = R_k(j-1) XOR (R_(k-1)(j) OR R_(k-2)(j+1))`
with `R_k(0) = c(k)` — checked against a real triangle (20,000 diagonal cells, 0
disagreements) and then pushed to **`k = 63`, common period `2^26`**, which is 23
levels deeper than the `k = 40` the board's `0.41` comes from. Minimal periods
(as `log2`): `0 1 1 2 3 3 4 5 5 6 6 6 6 6 6 7 8 8 8 8 8 8 8 8 9 10 10 11 11 12 12
12 12 12 13 13 14 15 15 16 16 17 17 18 18 18 18 18 19 20 20 21 21 21 22 23 23 23
24 24 25 25 25 26`. Doublings at `k = 3, 4, 6, 7, 9, 15, 16, 24, 25, 27, 29, 34,
36, 37, 39, 41, 43, 48, 49, 51, 54, 55, 58, 60, 63` (plus the one at `k = 1`).
The first fifteen reproduce Portage's list exactly from an independent
implementation. Cumulative exponent `log2(Q_k)/k`: `0.60, 0.47, 0.40, 0.37,
0.40, 0.40, 0.41` at `k = 5,15,20,35,40,50,63`. Densities on windows of sixteen
levels: `8/16, 4/16, 7/16, 7/15`. To falsify the reading: push to `k = 100` and
see whether the cumulative figure settles at `0.41` or climbs towards `1/2`;
`2^26` was my memory cap, not a barrier.

**What it would give.** Two corrections and one identity. The corrections: the
board should stop treating `2^(0.41k)` as a law — it is a sample mean over a
window whose local density has been as high as `1/2` and as low as `1/4` — and
should stop counting three slopes where there are two. The identity is
`α ↔ α/(1+α)`, which makes `leftDiagonal_onset_le`, the seam bound `1/2`, and
"the left Lyapunov exponent of the seed is at most one half" into literally the
same statement, and hands the wall a name that a field outside this project uses.

---

### 3.5 The picture's block complexity, and why no Nivat-type theorem can reach the wall — including "the diagonal of a Toeplitz array"

**The claim.** The Nivat/Cyr–Kra machinery is the only part of `Z^2` symbolic
dynamics that is about an individual configuration rather than a subshift, which
makes it the natural home for a question about one picture. It cannot reach this
wall, and the measurement says by how far: the picture's complexity exceeds
Nivat's threshold by a factor of `364` already at `(w,h) = (2,8)`, and — the part
worth recording — **even the settled region, which is built entirely out of
periodic words, has exponential block complexity**, because the periods are
unbounded. The same measurement answers the brief's other question: the right-edge
array is periodic in time at every fixed depth, but its period subgroup at a cell
has infinite index in `Z^2`, so it is not a Toeplitz array in this field's sense;
and the diagonal read is a line in a third direction, one in which the array has
no periodicity at all, so it is not an observable of the subaction the
periodicity lives in.

**The dictionary.**

| This project | Nivat's conjecture and low-complexity configurations | Checked |
|---|---|---|
| The picture | A configuration `η ∈ {0,1}^(Z^2)` with its rectangular complexity `P(w,h)` | — |
| Nivat's hypothesis | `P(w,h) ≤ wh` for some `w,h` | — |
| Cyr–Kra's theorem | `P(n,k) ≤ nk/2` for some `n,k` implies `η` is periodic | quoted below |
| The picture's complexity in the transient band | `P(2,8) = 2916`, `P(4,8) = 11663`, `P(1,16) = 65536` (all `2^16` column words occur) | measured, rows 2,000–3,980 |
| The picture's complexity in the settled region | `P(2,8) = 2778`, `P(1,16) = 21005` — smaller, still exponential | measured |
| The picture's complexity on the right | `P(2,8) = 2916` — indistinguishable from the band | measured |
| The complexity of the whole space-time SFT | Exactly `2^(w + 2(h-1))` blocks satisfy the rule internally | arithmetic: `wh - (h-1)(w-2)` free cells |
| So the `Z^2` entropy of `X` | Zero — the entropy is one-dimensional: **entropy rank one** | same arithmetic |
| "`η` doubly periodic" | "every direction is expansive" | quoted below |
| "some column of `η` is eventually periodic" | **No translation.** It is periodicity of a *restriction to one line*, not a period vector | this is the seam |
| The right-edge array `A(t,d) = e(t)_d` | A change of `Z^2` basis of the picture (`(t,x) ↦ (t, t-x)`, determinant `-1`) | — |
| `A` is periodic in `t` at each fixed `d` | The period subgroup at a cell is generated by one vector `(P_d, P_d)`: rank one, infinite index | 3.4's periods |
| A `Z^d` Toeplitz array | Needs a **finite index** period subgroup at every position | Portage's fetched definition |
| So: "the diagonal of a Toeplitz array" | Has **no name in this field**, and the reason is structural, not a gap in my reading | — |

**Seams.** (i) The complexity numbers are lower bounds where the sample is
smaller than the count; I flagged that in the script output and the numbers
quoted above are not at that limit. (ii) Complexity in a "region" is not the
complexity of a configuration — the picture is not homogeneous, and Nivat's
hypothesis is global, so my regional numbers can only rule things out, which is
what they do. (iii) The settled region's complexity being lower than the band's
(`2778` vs `2916` at `(2,8)`; `21005` vs `65536` at `(1,16)`) is the only place
in this document where a statistic distinguishes the settled region from the
rest, and it is a difference of `5%` where obstruction 4 would predict `0`; I did
not chase it and it may be a boundary effect of my region definition.

**What it leans on.**

- Cyr and Kra, fetched at <https://arxiv.org/abs/1208.4090>: *"the Morse-Hedlund
  Theorem states that η is periodic if and only if there exists n∈N such that the
  block complexity function P_η(n) satisfies P_η(n)≤n"*, and the paper's own
  result, *"proving that when P_η(n,k)≤ nk/2 for certain dimensions, the sequence
  must be periodic—establishing a weaker version of Nivat's conjecture"*.
- The bridge to expansiveness, fetched at
  <https://ar5iv.labs.arxiv.org/html/1208.4090>: *"η is doubly periodic if and
  only if every subspace of ℝ^2 is expansive"*, and Theorem 1.4's shape: a
  complexity bound plus *"there is a unique nonexpansive 1-dimensional subspace
  for the ℤ^2-action...Then η is periodic but not doubly periodic."*
- The Toeplitz definition is Portage's fetch of
  <https://arxiv.org/html/1706.05632>, quoted in their section 3.5; I did not
  re-fetch it and I use it only to say the same thing they did, from the other
  side.

**The test.** `explorer/rosetta_directions.mjs`, section B. To falsify: exhibit
`(w,h)` and a region of the picture with `P(w,h) ≤ wh/2`. The measured margin at
`(2,8)` is `2916` against `8`.

**What it would give.** It forecloses, and it closes the brief's open question
with a "no" that has a reason attached. Cyr–Kra Theorem 1.4 is the one theorem in
this vantage whose *hypothesis* is about nonexpansive directions and whose
*conclusion* is periodicity — exactly the implication shape the residual wants —
and it is out of reach by a factor of several hundred at the smallest window
where it could apply.

---

## 4. Died in translation

- **The vertical direction as an expansive direction of the orbit closure.** My
  first hope: if the vertical direction were expansive for the orbit closure of
  the picture (a much smaller system than the full SFT), then a point whose
  vertical band is periodic would be globally periodic and every column would
  repeat. It dies twice. Structurally: expansiveness of the vertical direction
  gives Jen's sandwich lemma, not the residual — it upgrades *all* columns in a
  band being periodic, and we are given *one*. Empirically: rule 90 has the
  vertical direction expansive with constant 1 and the residual fails for it.
  Seam: expansiveness is a statement about a band, and the hypothesis is about a
  line.
- **Kitchens–Schmidt rigidity for the settled region.** The settled region is
  built from words of period `2^k` and looked like a candidate algebraic
  subshift, where the dual-module machinery would apply. It is not: the settled
  configuration is itself a rule 30 evolution (crystal 47), so it satisfies the
  quadratic relation, not a linear one, and there is no group. Seam: the same
  `OR` that kills 3.2 kills this, and obstruction 4 already says the settled
  region carries no information about the boundary anyway.
- **The amoeba / Newton polygon of the defining relation.** For a linear rule the
  nonexpansive directions are the edge directions of the Newton polygon, which I
  verified for rule 90 by an independent method. For rule 30 the "polygon" of
  `l + c + r + c·r` would have to carry a degree-2 vertex, and the object with a
  Newton polygon is a polynomial ideal that does not exist here. Seam: `N(X_30)`
  is an arc, and an arc is not a set of edge directions of any polygon.
- **Milnor directional entropy as the bridge between the slopes.** `h_α` is
  convex and continuous *on the expansive directions* (Boyle–Lind, Theorem 59 in
  the held Kůrka notes). Rule 30's expansive directions are `v < -1`, a region
  outside the light cone where the entropy is `|m+α|·ln|A|` by Proposition 58(5)
  and the picture is white. So the convexity theorem covers exactly the part of
  the direction circle where nothing happens. Seam: the theory's regularity
  results live on the expansive side and the wall lives on the other.
- **Reading the wall off the doubling exponent.** I spent an hour trying to make
  `0.41` a velocity so that it would sit beside `0.24` and `0.25`. It is not one:
  it is a count per level of the tower, its picture-space reading is a
  logarithmically thin band (Portage's 3.3), and the honest slope is `0`. Worse
  for anyone who wanted to use it: measured to `k = 63` it is not a constant.
  Recorded so the next connector does not treat `2^(0.41k)` as a law.
- **Boyle–Lind's "expansive subdynamics is an SFT".** The theorem would give a
  finite-state coordinate system for the whole picture read along `v = -2`, which
  is a genuinely new representation. It dies on arrival for this wall because the
  centre column is a vertical line and crosses such a band once, so `c` is not a
  function of the subaction's state at any time. I could not fetch the paper
  either (see 3.1). Kept in section 5 as the one positive object here.
- **Nivat's conjecture and its `Z^2` descendants.** Measured out of reach by a
  factor of `364` at `(2,8)`, and the hypothesis of the residual does not lower
  the complexity — obstruction 3 already says the count of continuations grows
  like `2^(0.24t)` under a periodic column. Seam: every low-complexity theorem
  wants a bound in both directions, and the picture has positive entropy in one
  and positive complexity growth in the other.
- **Toeplitz arrays in `Z^d` (Downarowicz, Cortez), and the brief's question.**
  The right-edge array `(t,d) ↦ e(t)_d` is a genuine change of `Z^2` basis of the
  picture — `(t,x) ↦ (t, t-x)` has determinant `-1` — so there *is* a `Z^2` action
  here, which is what makes the resemblance tempting. It still dies. Each line
  `d = const` is periodic, with period vector `(P_d, P_d)` in the original
  coordinates, but `P_d` grows with `d`, so no vector is a period of the whole
  array and the period subgroup at any cell is rank one: infinite index, where a
  Toeplitz array needs finite. And the diagonal is a line of a *third* direction,
  in which the array has no periodicity at all, so its read is not an observable
  of any subaction. Portage killed this from the odometer side; it dies the same
  way from the `Z^2` side. **The brief's question — does "the diagonal of a
  Toeplitz array" have a name in this field — has an answer, and the answer is
  no,** with that as the reason rather than a gap in my reading.
- **Shereshevsky's inequality as a bound on the front.** `h_μ(F) ≤ h_μ(σ)(λ^+ +
  λ^-)` is the one clean relation between the entropy and the Lyapunov exponents,
  and it points the wrong way: with `λ^+ = 1` known exactly it gives a *lower*
  bound on `λ^-`, and obstruction 6 needs `λ^- ≤ 1/2`. Every inequality I could
  find in this literature has the exponents on the large side. Seam: the same
  asymmetry as obstructions 6 and 7 — the field supplies upper bounds on periods
  and lower bounds on speeds, and this project needs both reversed.
- **Rule 30 as a 4-way deterministic tile set.** If it were, every non-axis
  direction would be expansive and the theory would apply. It is deterministic in
  two of the four corner directions; the two it lacks are the past (it is not
  injective) and the rightward one (it is not right-closing). Seam: two of four is
  the same "one-sided" fact as everything else in this document.
- **The symmetry heuristic.** Both linear counterexamples put their single
  eventually periodic column on the picture's axis of mirror symmetry, and rule 30
  has no such axis, which is a tempting reason for the residual to be true. It is
  not an argument: rule 60 and rule 102 are not mirror-symmetric either and every
  one of their columns is periodic. Recorded because it looks like a lead for
  about a minute.
- **`N(X)` of the orbit closure.** I computed `N` for the *subshift* of all
  diagrams. The residual is about one point, and the orbit closure of that point
  is a smaller subshift whose `N` I did not compute and which could in principle
  be smaller. That is the one live thread I am leaving behind in this vantage; I
  ran out of a way to sample it that was not just the block complexity of 3.5.

---

## 5. What to hand the theorist

**Topic 1 (the one I would spend the session on). The linear no-go: make it a
standing test that every candidate lemma must pass.** The claim to falsify is the
one in 3.2:

> Rule 150 from a single black cell has a second eventually periodic column —
> some `x ≠ 0` and `p > 0` with `cell(t + p, x) = cell(t, x)` for all large `t`.

It depends on exactly one dictionary row: that rule 30's local rule is rule 150
plus the monomial `c·r`, which is arithmetic (`150 XOR 136 = 30`). The evidence
against it is that rule 150's centre column is *identically black* — provable in
two lines from `P_t = (1+u+u^2)^t` and Frobenius, and measured `10^7/10^7` — while
its column 1 obeys `a(2t) = 0`, `a(2t+1) = 1 XOR a(t)`, from which eventual
periodicity fails by a three-line descent (an odd period forces `a ≡ 1` on a tail,
contradicting `a(2t)=0`; an even period `2p'` makes `p'` a period too). Both
identities are checked with 0 failures on `2·10^6` rows, and the density `1/3`
they force is measured as `0.333334`. The depth that would settle it: none needed
in the negative direction — it is a proof — and `|x| ≤ 64` at `p ≤ 4096` over
20,000 rows in the positive direction. **What to do with it is the point.** It
gives the board a ten-minute falsifier for every proposed route to this wall: run
the same argument on rule 150. Surjectivity, left-permutivity, the light cone,
the space-time SFT, entropy rank one, the sandwich lemma, and expansiveness of the
vertical direction all survive that test and therefore cannot be the proof — and
rule 90, which has *more* structure than rule 30 in every one of those respects,
is the witness. The one thing to check first, because it would kill the topic:
whether some column of rule 150 or rule 90 beyond `|x| = 64` is eventually
periodic. For rule 150 that is implausible — the columns are dense, so the sparse
artefact that fooled my first script cannot hide there — but it is unproved.

**Topic 2. State the seam bound in the language that names it, and see whether the
name is load-bearing.** The claim, from 3.4's dictionary, is that these are the
same statement:

> `leftDiagonal_onset_le` (onset `≤ k` for every diagonal)
> `⟺` the seam never runs faster than half a cell per row
> `⟺` the left Lyapunov exponent of rule 30 at the seed satisfies `λ^- ≤ 1/2`.

The first two are obstruction 6's equivalence; the third is the field's name for
the same quantity, and the conversion between the diagonal parametrisation and
the picture parametrisation is exactly `α ↦ α/(1+α)`, which sends the measured
onset `0.336` to `0.2515` against a measured seam of `0.2497`. It depends on one
dictionary row: that the damage front the obstruction is about *is* `λ^-`. What
a theorist can add: whether anything in the Lyapunov-exponent literature bounds
`λ^-` above for a *specific* configuration rather than almost everywhere. My
reading says no — Shereshevsky's inequality and Bressaud–Tisseur's theorem both
bound the exponents *below* — and if that reading is right the honest outcome is
a new obstruction entry saying so, which is worth having, because three separate
board items (`leftDiagonal_onset_le`, obstruction 3's horizon, `crystals` A3) are
the same unproved bound wearing three names.

---

## 6. Next vantage

**Percolation and first-passage growth of the damage front** — Eden clusters, the
KPZ class, and the local law obstruction 6 already writes down. Everything in this
document funnels into one unproved number, `λ^-`, the speed at which a
disagreement between two rule 30 pictures walks left; it is the seam, it is the
horizon in the counting obstruction, it is `leftDiagonal_onset_le`, and the whole
of expansive subdynamics has nothing to say about it because the theory's bounds
run the other way. Obstruction 6 hands the next connector something unusually
concrete: the front's exact local law (it advances one cell when the settled cell
beside it is white and otherwise stays or retreats), the measured decomposition
`0.59` advance / `0.15` stay / `0.26` retreat averaging `1.30` cells, and the
observation that this is *not* Wolfram's biased random walk although it gives the
same `1/4`. A connector who knows interacting particle systems should be asked
whether a front with that local law, driven by a *deterministic* background whose
white-run statistics are computable from the settled words, admits any speed bound
below `1` — and told plainly that `crystals` A3 says the worst case over arbitrary
pairs is exactly `1`, so the whole question is whether this pair's background
being the settled region buys anything.

The vantage I could not reach from where I stood is **the algebraic geometry of
low-degree relations over `F_2`: Gröbner bases, the ideal generated by the
quadratic rule, and whether the picture's coordinate ring says anything.** Section
3.2 says that everything turns on the single monomial `c·r`, and the natural next
question is what the *ideal* generated by the `T` relations
`y(t+1,x) + y(t,x-1) + y(t,x) + y(t,x+1) + y(t,x)y(t,x+1)` looks like — whether
the residual's hypothesis (`c` periodic) is a linear slice of that variety, and
whether elimination in the right order is the sideways solve. I have the
algebraic statement of the seam and none of the machinery to attack it; that
needs somebody who computes with ideals rather than someone who has just noticed
that one exists.
