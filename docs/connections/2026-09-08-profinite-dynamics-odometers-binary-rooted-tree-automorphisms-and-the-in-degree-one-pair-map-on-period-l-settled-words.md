# Sighting: `centerColumn_other_isEventuallyPeriodic_of_center` from profinite dynamics

**Vantage.** Odometers, automorphisms of the binary rooted tree, and the
in-degree-one pair map on period-`L` settled words.

**Connector.** Portage, 2026-09-08.

**One-line summary.** The vantage's own named objects (the odometer, the tree,
the pair map) mostly die, but they die by pointing at the *other* side of the
picture: the right diagonals are exactly periodic with no transient at all,
they are an antiderivative tower in the group ring, and the centre column is
their constant of integration — which puts the wall in a region where every
object is periodic instead of one where every object is a transient.

Scripts written and run for this document, all under `explorer/`:
`portage_odometer.mjs`, `portage_rightdiag.mjs`, `portage_copies.mjs`,
`portage_pairmap.mjs`.

---

## 1. The problem, seen from outside

Take the map on bi-infinite binary rows that sends `b` to `b'` with
`b'(i) = b(i-1) XOR (b(i) OR b(i+1))`, and iterate it from the row that is
`1` at the origin and `0` everywhere else. What grows is a triangle of bits,
one row per step, widening by one cell on each side. Write `c(t)` for the
value at the origin after `t` steps. Two things are known and one is not.
Known: no two distinct vertical lines of the triangle can both be eventually
periodic (Jen 1990). Known: `c` passes every statistical test anyone has run
on it, to great depth. Not known: whether `c` is eventually periodic. The
statement in front of me is the *implication* — **if `c` is eventually
periodic then some other vertical line is eventually periodic too**, that is,
`c` cannot be the triangle's one repeating line. With Jen's result that
implication says `c` is aperiodic, which is the first of Wolfram's three
prize questions. Nobody has a route to it.

Restated in the vantage's own terms. Read row `t` backwards from its
rightmost nonzero cell and call the entry at depth `k` the *level-`k`* entry;
as a function of `t` this is the `k`-th right diagonal `R_k`. Rowland (2006)
proved that `R_k` is periodic with a period dividing `2^k`, from its very
first term and with **no transient**. So the right edge of the triangle is a
tower of finite cyclic quotients: a topological factor of the dyadic
**odometer**, the map `x -> x+1` on the 2-adic integers `Z_2`, and reading
the edge to depth `m` is reading finitely many of the odometer's digits. The
origin cell is that same array read *on its diagonal*: `c(t) = R_t(0)`, the
level-`t` entry read at index `0`, where the period `P_t` controlling that
level has vastly outrun `t` (measured `P_t = 2^(0.41 t)` to `t = 39`). The
residual asks: can the diagonal of this tower factor through a single finite
cyclic quotient `Z/p` all by itself, with no other index of the same tower
doing the same?

---

## 2. Fields sighted

| Field or theory | The object there | The seam, in one line |
|---|---|---|
| Odometers / adding machines (topological dynamics) | Row `t` read leftward from its rightmost cell; level `k` is a function of `t mod P_k`; the row map is `+1` on `Z_2` | The odometer reaches level `n` only at depth `2.4 n`, and the centre column sits at depth `t` |
| Iwasawa algebra `F_2[[Z_2]] = F_2[[T]]` | A period-`L` word is an element of `F_2[T]/(T^L)`; shift `= 1+T`; complement `=` socle `T^(L-1)`; period doubling `=` division by `T` | The source term is an `OR`, so this is division by `T` with a *non-additive* source; there is no module and so no `mu`, no `lambda` |
| Artin–Schreier theory in characteristic 2 | Solving `w + x·w = u`: solvable iff the trace (here the parity) of `u` vanishes; two solutions differing by a constant | The parity criterion transfers and nothing else does: `Z/L` is not a Galois group here |
| Automorphisms of the rooted binary tree `Aut(T_2)` | The tree of columns admissible to the right of a given column: one free bit at each black time | The branching set is the black times, not the levels of a regular tree, and the pruning is a damage front, not a group |
| Self-similar / state-closed groups (Grigorchuk, Basilica) | Under a period-`p` centre column the shift by `p` maps the continuation tree into itself | Nothing is invertible; pruning kills branches, so there is a semigroup at best and no self-similar group |
| Automatic sequences, the 2-kernel, Cobham | Eventually periodic implies 2-automatic; the level-`k` slices are 2-automatic | The implication runs the wrong way; 2-automatic does not give eventually periodic |
| 2-adic interpolation, Mahler bases | "Does `c` extend continuously to `Z_2`?" | Measured dead: `c(t)` and `c(t + 2^n)` agree at rate `0.50` for every `n <= 15`, exactly as for odd shifts |
| Bratteli–Vershik systems / adic transformations | The tower of period-`L` settled-word spaces with the in-degree-one pair map | The inclusions go the wrong way for an inverse limit, and the natural folding map commutes with the dynamics only `15%` of the time |
| Finite permutation groups, cycle index | The pair map on `4^L` states is injective off `2^(L-1)` states; the gaps between white diagonals are its cycle structure | Cycle type is reachable only to `L = 8`; the seed sits in one unidentifiable cycle |
| Ruler sequence / `ord_2(t+1)` | Rowland's rightmost-run length as a function of `t` | A fact about depth `O(log t)`; the centre column lives at depth `t` |
| Cryptanalysis of the rule 30 generator (Meier–Staffelbach) | The free bit per black time *is* the guess in the known-plaintext attack | Heuristic; its branching rate `2^0.24` is the left damage-front speed, already measured here, not a theorem |
| Profinite groups / solenoids | The closure of the row orbit under the edge-following map is a `Z_2`-group | Only on the edge; the full row orbit closure has positive entropy and is not a group |
| Iwasawa `mu` and `lambda` invariants | The doubling positions `1, 3, 4, 6, 7, 9, 15, 16, 24, ...` on the right, `3, 8, 29, 400, 53208, ...` on the left, as levels where something grows | No module to attach them to; the growth is `2^(0.41 k)` on the right and doubly exponential on the left, neither of them the linear growth an Iwasawa invariant describes |
| Nonautonomous dynamics / skew products over a finite base | "`c` eventually periodic of period `p`" turns the half-line into a single map iterated | That map carries its own support rightward at speed 1, so it has no compact invariant set trapping the true orbit |
| Combinatorics on words: antiperiodicity, Fine–Wilf | The word produced at every doubling, left and right, is antiperiodic (shift by half complements it) | Antiperiodicity is forgotten a few diagonals later (`orbitclass.mjs`), so it is a fact about one step, not an invariant |

---

## 3. Connections

### 3.1 The right half of the picture is an antiderivative tower in `F_2[[T]]`, and the centre column is the constant of integration

**The claim.** Every right diagonal is one division by `T = 1 + shift` in the
group ring `F_2[Z/L] = F_2[T]/(T^L)`, with a non-additive source; the period
doubles exactly when that source is a unit; the constant of integration is
fixed — uniquely, with no transient — by the white cone the diagonal runs out
of; and **the centre column is exactly the sequence of those constants**,
`c(t) = R_t(0)`. So the wall is not a statement about a region that has not
settled, it is a statement about the zeroth coefficient of a tower of
*exactly periodic* words.

**The dictionary.**

| This project | `F_2[[T]]`, `T = 1 + x` where `x` is the shift | Checked |
|---|---|---|
| Right diagonal `k`, `rightDiagonal k j = evolve (j+k) j` | An element `R_k` of `F_2[Z/P_k] = F_2[T]/(T^(P_k))` | — |
| Its period `P_k` | The level of the tower `F_2[T]/(T^L)` it lives in | `1,2,2,4,8,8,16,32,32,64,...` to `k = 39`, `P_39 = 2^16` |
| Shift along the diagonal, `j -> j+1` | Multiplication by `x = 1 + T` | — |
| Complementing a word | Adding the socle generator `J = T^(L-1)` | `J = 1+x+...+x^(L-1) = (1+x)^(L-1)` in char 2 |
| `rightDiagonal_recurrence` (on the board) | `T · R_k = g_k`, with `g_k = R_{k-1} OR x^(-1) R_{k-2}` | `8,994,000` cells, 0 failures |
| The `OR` in the source | **Not** a ring operation; `a OR b = a + b + ab` | this is the seam, below |
| The period stays at `L` | `v_T(g_k) >= 1`: `g_k` is a non-unit, i.e. even weight | 0 failures, `k = 2..39` |
| The period doubles to `2L` | `v_T(g_k) = 0`: `g_k` is a **unit**, i.e. odd weight | 0 failures, `k = 2..39` |
| The word right after a doubling is antiperiodic | `v_T(R_k) = L - 1` exactly, in `F_2[T]/(T^(2L))` | all 16 doublings below `k = 40` |
| Two solutions differing by a complement | `ann(T) = (T^(L-1)) = {0, J}`, the socle | — |
| No transient: `R_k` periodic from `j = 0` | The antiderivative constant is *determined*, not free | 0 exceptions, 40 depths x 4,000,000 terms |
| What determines it | Integrating in from `j << 0`, where the cone is white and `R_k = 0` | identity C, 2999/2999 |
| **The centre column `c(t)`** | **The constant of integration of the `t`-th antiderivative, `R_t(0)`** | by definition of `rightDiagonal` |
| Left diagonal `k` | The *same* equation integrated the other way, `T` acting through the `OR` slot instead | `leftDiagonal_recurrence` (board) |
| The left transient | There the constant is **not** fixed: one free bit at each eventually-white diagonal | Rowland 2006 §6; `forbit.mjs` |
| Left in-degree | one — `(v,w)` has a unique predecessor `u` | exhaustive, `L = 2,4,8` |
| Right in-degree | `2^(weight v)` — the right map loses information backwards, gains none forwards | by inspection of the recurrence |

**Seams.** (i) The source `g_k` is an `OR`, not a sum, so nothing here is a
`Lambda`-module and the Iwasawa machinery proper — characteristic ideals,
`mu` and `lambda`, the main conjecture — has no object to act on. What
transfers is the *filtration*: `T`-adic valuation, units, socle, division by
`T`. (ii) The levels are `P_k = 2^(0.41 k)` and not `2^k`, so the tower is
much thinner than the odometer's, and reading `R_k` on one period is reading
`2^(0.41 k)` bits. (iii) The left and right recurrences are **not** mirror
images: the diagonal's own previous term sits in the `xor` slot on the right
and inside the `||` on the left, which is precisely why the right has no
transient and the left has an unbounded one.

**What it leans on.**

- Rowland 2006, held at `sources/rowland-2006-local-nested-structure-alt-ocr.txt`,
  line 56: *"the right diagonals are periodic with period le ngths 2 α ."*
  (the OCR has lost the exponent; the claim is a period `2^α`, i.e. dividing
  `2^k`, **not** equal to `2^k`).
- Rowland 2006, same file, lines 236–240, on the odometer reading:
  *"(One can think of thi s in terms of p-adic convergence in the exponent.)
  Again, let l(k) = lcm(1 , 2, . . . , k ). Theorem 1. Let f be a right
  bijective, k-color, range [−d, 0] rule, and let R ∈ [k]Z be a rightful row
  with an inﬁnite rightful history under f . As n → ∞, f l(k)n R → R."*
- The doubling criterion and the antiperiodicity are **already known**, on a
  page I fetched: <https://brunni.de/findings30/> — *"The diagonals on the
  right side of rule 30 started from a single black cell are periodic and
  double their period at irregular intervals."*, the doubling condition
  *"the sum up to p is 1"*, and *"the new basic period to be the sequence
  generated by the second term concatenated with the inverse of itself."*
  So rows 8–10 of the dictionary confirm a published observation rather than
  making one; what is not there is the `F_2[[T]]` reading and the reading of
  the centre column as the constant of integration.
- The period sequence is **OEIS A094605**. **UNVERIFIED by fetch**:
  `https://oeis.org/A094605` and `https://oeis.org/search?q=A094605&fmt=text`
  both returned HTTP 403 to WebFetch. Two WebSearch queries ("OEIS rule 30
  right diagonal period lengths 1, 2, 2, 4, 8, 8, 16, 32, 32, 64" and
  "A094605 OEIS \"Rule 30\" diagonal period definition") returned snippets
  giving the name as *"the period of the n-th diagonal, from the right, of
  Rule 30"* and terms identical to my measurement; the fetched brunni.de page
  cites the same A-number with the same terms.
- Iwasawa algebra, fetched: <https://en.wikipedia.org/wiki/Iwasawa_algebra> —
  *"the Iwasawa algebra Λ(G) is isomorphic to the ring of the formal power
  series Z_p[[T]] in one variable over Z_p. The isomorphism is given by
  identifying 1 + T with a topological generator of G."* And, for `F_p`
  coefficients, Ardakov–Brown, fetched at
  <https://arxiv.org/abs/math/0511345> — Iwasawa algebras are *"completed
  group rings of compact p-adic analytic groups with coefficients the ring Zp
  of p-adic integers or the field Fp of p elements"*.
- The identification `F_2[Z/2^n] = F_2[T]/(T^(2^n))` needs no citation: in
  characteristic 2, `x^(2^n) - 1 = (x-1)^(2^n)`.

**The test.** `explorer/portage_rightdiag.mjs`, run: 4,000,000 values at each
of 40 depths, cross-checked against a real 300-row triangle (0 disagreements).
Results: minimal periods `1 2 2 4 8 8 16 32 32 64 64 64 64 64 64 128 256 256
256 256 256 256 256 256 512 1024 1024 2048 2048 4096 4096 4096 4096 4096 8192
8192 16384 32768 32768 65536`; every right diagonal periodic from `j = 0` with
no exception; the doubling law "period doubles iff `g_k` has odd weight over
one period" with **0 failures** for `k = 2..39`; antiperiodicity at all 16
doublings. For a theorist, the statement to falsify, in the project's
vocabulary:

> `rightDiagonal_period_doubles_iff_odd_weight`: for `k ≥ 2`, let `L` be the
> least common period of `rightDiagonal (k-1)` and `rightDiagonal (k-2)`.
> Then `PeriodicFrom (rightDiagonal k) L 0` holds if
> `(Finset.range L).sum (fun j => (rightDiagonal (k-1) j || rightDiagonal (k-2) (j+1)).toNat)`
> is even, and the minimal period of `rightDiagonal k` is `2 * L` if it is
> odd.

This is the mirror of the left side's `leftDiagonal_step_period_dichotomy`
and should be markedly easier, because the right recurrence solves by running
XOR with no case split on a black driver.

**What it would give.** It does not close the residual. What it changes is
*where the residual lives*. Every obstruction on the board about the centre
column is an obstruction about the **left** diagonals, and all of them turn on
the same fact: index `0` is inside the transient of every left diagonal it
belongs to (`docs/obstructions.md`, "The diagonal structure never reaches the
centre column"). On the right that fact is false. `c(t) = rightDiagonal t 0`
sits inside the *periodic* part of an exactly periodic word — it is not a
transient, it is a constant of integration, and the only thing unknown about
it is which of the two elements of `ann(T)` the cone picks. What remains after
this connection is everything: `P_t` grows exponentially, so knowing `R_t` on
one period is knowing `2^(0.41 t)` bits, and nothing bounds `P_t` from below
except the measurement.

---

### 3.2 The centre column is a parity along the cone's left flank, and three fifths of that parity is settled-region data

**The claim.** Integrating the right recurrence in from outside the cone gives
a closed formula for the centre column as a single parity, and that parity
splits at the seam into a part determined entirely by the settled words — the
profinite orbit that `forbit.mjs` computes, and that is the *same* for every
configuration white far to the left — and a part inside the transient band.
The settled part is about three fifths of the terms.

**The identity, verified 2999 times out of 2999:**

```
c(k)  =  XOR over j <= 0 of  ( cell(j+k-1, j)  OR  cell(j+k-1, j+1) )
```

The terms with `j < -(k-1)/2` are outside the cone and vanish, so this is a
parity over about `k/2` cells lying on right diagonal `k-1`, running from the
left edge of the cone up to the origin.

**The dictionary.**

| This project | Over there (Birkhoff sums / cocycles over an odometer) | Checked |
|---|---|---|
| `c(k)`, the centre cell at time `k` | A **Birkhoff sum** of the function `g_k` along an orbit segment of length `k/2` | 2999/2999 |
| The segment summed | Right diagonal `k-1` from the cone's edge to the origin | — |
| The summand `g_k(j)` | `R_{k-1}(j) OR R_{k-2}(j+1)`, a function of two adjacent levels | — |
| "the centre column is eventually periodic" | "the Birkhoff sums are eventually periodic in `k`" — a **coboundary** condition | — |
| The left edge of the cone | Where the sum starts; it is the boundary condition that makes the sum finite | — |
| The seam at `x = -0.25 t` | The point where the segment leaves the settled region | measured `0.25` (board) |
| The settled part of the sum | About `0.3 k` terms, `60%`, determined by the settled words `S_k` alone | 479.7 terms per `k`, `k` in `[200,3000)` |
| The transient part | About `0.2 k` terms, `40%`, inside the band | 320.3 terms per `k` |
| The settled part as a predictor | Nothing: it agrees with `c(k)` at rate `0.495` | 1385/2800 |
| The universality of the settled part | It is the same sequence for every configuration white far to the left, up to the integer `N` of obstruction 5 | inherited from that obstruction |

**Seams.** (i) The unknown part is `Theta(k)` bits, not `O(1)` — the identity
is exact but the ignorance is linear in `k`, so this is a reformulation, not a
reduction. (ii) The settled parity `A(k)` is itself an unstructured-looking
sequence of density `0.499`; it inherits nothing from the periodicity of the
words it is built from, because the *length* of the segment grows. (iii) The
identity is a telescoping of the rule down one diagonal and nothing deeper —
its value is entirely in what it is telescoped *to*.

**What it leans on.** Nothing outside the project: it is `rule30_eq` applied
`k/2` times along a right diagonal, with the base case that cells outside the
cone are white. Confirmed by computation rather than argued from a source.

**The test.** `explorer/portage_odometer.mjs`, section C: 2999 values of `k`,
0 failures; section D for the split. For a theorist:

> `centerColumn_eq_parity_of_rightDiagonal_flank`: for every `k ≥ 1`,
> `centerColumn k = ((List.range (k+1)).map (fun m => (evolve (k-1-m) (-m) || evolve (k-1-m) (-m+1)).toNat)).sum % 2 = 1`
> (indices clamped, cells outside the cone white).

An induction on `k` along the diagonal; the work is the cone base case.

**What it would give.** It converts the wall from a statement about a cell
into a statement about a **sum**, and sums are the objects the ergodic-theory
and additive-combinatorics toolkits are built for: a coboundary equation, a
van der Corput / Gowers-norm estimate, a Weyl sum. Nothing on the board is
phrased as a sum. What would remain is the `0.2 k` transient terms, which is
the whole difficulty again — but now as a *deviation between two Birkhoff
sums* rather than as an unknown cell.

---

### 3.3 The centre column is copied out along the right side, at exponentially spaced positions

**The claim.** Because `R_k` is periodic from `j = 0` with period `P_k`, the
centre cell at time `k` appears verbatim at position `X` of row `k + X` for
every `X` that `P_k` divides. So the centre column is not confined to the
centre: a growing prefix of it is written into every power-of-two column, and
the centre column is the limit, in the Cantor topology, of the columns
arbitrarily far to the right.

```
c(k) = cell(k + X, X)   whenever P_k divides X
```

**The dictionary.**

| This project | Over there (limits of orbits, closure of a set of points) | Checked |
|---|---|---|
| `c(k)` | `cell(k + X, X)` for every `X` divisible by `P_k` | 16,559 instances, 0 failures |
| Column `2^e`, read from row `2^e` down | A prefix of the centre column, of length `K(e) + 1` | printed in full, `e ≤ 12` |
| `K(e)`, the last `k` with `P_k ≤ 2^e` | `0, 2, 3, 5, 6, 8, 14, 15, 23, 24, 26, 28, 33, 35, 36, 38` for `e = 0..15` | measured |
| Column 4096 | reproduces `c(0..33) = 1101110011000101100100111010111001` | exact |
| "the centre column" | The **limit point** `lim_(e -> inf) shift^(-2^e) (column 2^e)` in `{0,1}^N` | rate `K(e) ~ 2.4 e` |
| "some other column is eventually periodic" | "one of the approximants shares the limit's property" | — |
| Rowland's "the computation begins again locally" | Exactly this: a copy of the start of the picture reappears on the right | Rowland 2006 §1 |

**Seams.** (i) The copy is only a **prefix**, of length `~2.4 log_2 X`, so no
column contains the whole centre column and none inherits its periodicity.
(ii) This is the reason the residual is not a closure argument: *eventual
periodicity is not a closed condition*, so a limit of aperiodic points can be
eventually periodic, and the residual is asking exactly for the implication
that fails in general. Naming that is the connection's main use — it says a
whole family of "take a limit" attacks is dead before it starts.

**What it leans on.** Rowland 2006, held text, line 57–59:
*"Just as in the case of rule 90, this periodicity im plies that a small
region of the initial condition reappears on the right side o f row 2 n, and
from this the computation continues locally as it does from I."* The
quantitative form here (which `X`, how long a prefix) is computed, not cited.

**The test.** `explorer/portage_copies.mjs`: 16,559 instances of the identity
across `k ≤ 35` and `X ≤ 6000`, 0 failures; the reproduced prefixes printed
and compared with the centre column. To falsify: find one `k`, `X` with
`P_k | X` and `cell(k+X, X) ≠ c(k)`.

**What it would give.** By itself, an explanation of *why* the residual is not
approachable by compactness — which is worth a theorist's hour not to spend.
If it gave more, it would be by strengthening "prefix of length `2.4 log X`"
to "prefix of length `X^ε`", which would let a periodic `c` be detected inside
a single far column; the measured exponent growth `P_k = 2^(0.41 k)` is
exactly what forbids that, and it is measured, not proved.

---

### 3.4 The odometer is real, thin, and blind; and the settled-word tower has no profinite limit

**The claim.** The dyadic odometer is genuinely present — reading the picture
along its right edge gives an equicontinuous, zero-entropy system whose
inverse limit is `Z_2`, provided the periods `P_k` are unbounded — but it sees
nothing of the centre column; and the vantage's other named object, the tower
of period-`L` settled words, admits **no** inverse limit carrying its
dynamics, so no compactness argument over that tower exists to be found. (I do
*not* claim the odometer is the maximal equicontinuous factor of anything: I
did not check that, and the edge-following coordinate is not the CA.)

**The dictionary.**

| This project | Profinite dynamics | Checked |
|---|---|---|
| The row map, followed along the right edge | `+1` on `Z_2`: the dyadic odometer | from `rightDiagonal_periodicFrom_pow` (board); Rowland's Thm 1 is the same idea for *rightful* rows in his orientation, not directly this |
| Level `n` of the odometer | The right diagonals with period `≤ 2^n`, i.e. depths `k ≤ K(n)` | `K(n) ~ 2.4 n` |
| "the edge determines `t` 2-adically" | **False at depth `m`**: the rightmost `m+1` cells do not determine `t mod 2^m` | collides at `m = 2` |
| "the edge determines `t` in the limit" | True iff `P_k` is unbounded, measured to `P_39 = 2^16` | — |
| `c` eventually periodic with period a power of 2 | `c` locally constant on `Z_2`, i.e. 2-adically continuous | — |
| Is it? | No: `c(t)` and `c(t + 2^n)` agree at `0.5010, 0.5021, ..., 0.5048` for `n = 0..15` | 40,000 terms |
| Control | Odd and non-dyadic shifts `3,5,7,11,1000,12345` agree at `0.4967–0.5025` | same run |
| The tower `X_n` of pairs of period-`2^n` settled words | `X_n ⊂ X_(n+1)` by pullback: a **direct** system, union not compact | — |
| A profinite limit would need surjections `X_(n+1) -> X_n` | `fold(w)(j) = w(j) + w(j + 2^n)`, i.e. multiplication by `T^(2^n)` | — |
| Does `fold` commute with the pair map? | **No.** `0.350` of pairs at `2^2 -> 2^1`, `0.149` at `2^3 -> 2^2` | exhaustive |
| Does truncation commute? | No. `0.417`, then `0.407` | exhaustive |
| In-degree one, exactly | Image of the backward map is `4^L - 2^(L-1)`; the missing pairs are exactly `(u, 0)` with `u` of odd weight | exhaustive, `L = 2,4,8` |
| The cycle structure at `L = 8` | `1x3 3x4 8x1 14x2 128x2 132x8 266x4 328x1 392x1 480x1 1472x1 2816x1 4064x2`; 16,043 of 65,536 states lie on cycles | exhaustive |

**Seams.** This connection is mostly negative and its seams are its content.
The odometer factor is real but its level grows at `0.41` per depth, so
"the odometer knows the picture to depth `m`" is a statement about `2^(0.41 m)`
periods, and the centre column at time `t` sits at depth `t`. The profinite
limit fails at the `OR`: folding a word is a ring operation, the recurrence is
not, and the commutation rate falls with `n` rather than holding.

**What it leans on.** Kůrka, held at
`sources/kurka-topological-dynamics-1d-ca.txt`, Theorem 5, for what
equicontinuity means for a CA: *"There exists a preperiod q ≥ 0 and a period
p> 0, such that F q+p =F q."* — rule 30 is nothing like this globally, and the
odometer appears only in the edge-following coordinates, which are not the CA
itself. Rowland 2006 for the p-adic remark quoted in 3.1.

**The test.** `explorer/portage_odometer.mjs` sections E and G, and
`explorer/portage_pairmap.mjs`. To falsify the negative: exhibit any
surjection `X_(n+1) -> X_n` commuting with the pair map, for `n = 2` — the
script checks the two natural candidates exhaustively and both fail.

**What it would give.** It forecloses. Three attacks are dead after it: "take
the 2-adic completion of the centre column" (the measurement says the centre
column has no 2-adic regularity whatsoever), "take the inverse limit of the
settled-word systems and use compactness" (there is no such limit), and "the
right edge is an odometer, so the picture is equicontinuous" (only at depth
`0.41 t`).

---

## 4. Died in translation

- **`Aut(T_2)` acting on the tree of left sides.** The branch points are the
  eventually-white diagonals and the two branches are shifts or complements,
  so the "tree" of possible left sides is one path with a bit at each of
  `k-1 = 2, 7, 28, 399, ...`. Obstruction 5 already says every configuration's
  left side is the seed's translated by one integer. There is no tree, so
  there is nothing for a tree automorphism group to act on. Seam: the
  branching set has density zero and the branches are conjugate.
- **`Aut(T_2)` acting on the tree of rightward continuations.** Here there
  really is a binary tree — one free bit at each black time of the column, the
  `sideways_inverse` free input — and under a period-`p` centre column it is
  invariant under the shift by `p`, so it looks self-similar. It dies because
  the admissible set is cut out by a *pruning* (the cone constraint), which is
  not invertible and not a group action; the surviving set has growth
  `2^0.24` per step, which obstruction 3 already identified as the left damage
  front and not a group index. Seam: self-similar groups need the sections to
  be automorphisms; here they are partial maps that lose branches.
- **"An eventually periodic centre column must have period a power of two."**
  This is the statement that would let the odometer bite: `p = 2^n` makes `c`
  2-adically continuous, and then it factors through the same `Z_2` the edge
  does. I could find no argument for it and no obstruction to it. The right
  diagonals have power-of-two periods, but `c(t) = R_t(0)` reads one index of
  each and puts no constraint on the period of the read-off. Recorded because
  it is a clean question a theorist could settle in either direction.
- **The right diagonals as an odometer conjugacy.** I expected the rightmost
  `m+1` cells of row `t` to determine `t mod 2^m` — they do not; the periods
  are `A094605`, not `2^k`, and the map collides already at `m = 2`. In
  passing: `docs/sources.md` describes Rowland's result as "period **exactly**
  `2^k` from the start". The board's own `rightDiagonal_periodicFrom_pow` says
  only `PeriodicFrom (rightDiagonal k) (2^k) 0`, which is right, and its
  docstring says "measured periods all divide `2^k`", which is right; the
  index line is the loose one. The minimal periods are far smaller —
  `P_39 = 2^16`, not `2^39`.
- **Cobham's theorem.** Eventually periodic implies `k`-automatic for every
  `k`, and Cobham says a sequence automatic in two multiplicatively
  independent bases is eventually periodic. To use it I need `c` automatic in
  base 3 as well as base 2, and nothing in rule 30 offers a base-3 structure;
  the automaton in sight is base 2 only. Seam: the implication I have goes
  from periodic to automatic, and the residual needs the converse.
- **Iwasawa `mu` and `lambda`.** The algebra is genuinely the right ambient
  ring and the filtration transfers cleanly (3.1), but an invariant needs a
  finitely generated `Lambda`-module, and the `OR` in the source destroys any
  module structure. The doubling positions look like a `lambda`-invariant and
  are not one: `lambda` describes growth linear in the level, and here the
  gaps grow doubly exponentially on the left and irregularly on the right.
- **Bratteli–Vershik / adic transformations.** The settled-word tower has the
  right shape (finite levels, an in-degree-one map) but the wrong arrows: the
  inclusions are injections, and the two candidate surjections fail to commute
  with the dynamics at rates `0.149` and `0.407`. Measured, not argued.
- **Skew products over `Z/p`.** "If `c` has period `p` then the half-line run
  `p` steps is one fixed map `Phi` iterated" is true, and I could not make it
  do anything: `Phi` moves its own support rightward at speed 1, so it has no
  compact invariant set containing the true orbit, and the orbit closure
  argument has nothing to close on. This is the configuration-level version of
  obstruction 2, which kills the sequence-level version.
- **Artin–Schreier.** The equation `w + xw = u` in characteristic 2 has the
  same shape as an Artin–Schreier equation and the same solvability criterion
  (a trace, here a parity), and that is the whole of the transfer. There is no
  field extension, no Galois group, and no `H^1`.
- **Sign / cycle index of the pair map.** I computed the cycle structure at
  `L = 2,4,8` hoping the cycle type would be a formula that bounds the seed's
  gap to the next white. It is not: the lengths at `L = 8` are
  `1,3,8,14,128,132,266,328,392,480,1472,2816,4064` with multiplicities, no
  pattern I can see, and `L = 16` is `4^16` states, out of reach. Obstruction
  6 already has the sharp statement (average gap `2^L`, no bound below).
- **Reading the centre column off the settled region.** I re-derived, before
  believing it, that a fixed column *leaves* the settled region rather than
  entering it: column `-X` is settled only while `t < 4X`. So the settled
  words — the profinite object my vantage is built on — cannot supply an
  eventually periodic column at all, for any configuration. That is
  obstruction 1 stated for columns instead of diagonals, and it is the single
  fact that kills most of this vantage.

---

## 5. What to hand the theorist

**Topic 1 (the one I would spend the session on). The right side has no
transients — move the wall there.** The claim to falsify is
`rightDiagonal_period_doubles_iff_odd_weight` as stated in 3.1: the minimal
period of `rightDiagonal k` is `2L` when
`g_k(j) = rightDiagonal (k-1) j || rightDiagonal (k-2) (j+1)` has odd weight
over one period `L`, and `L` otherwise. It rests on dictionary rows 8–10 of
3.1 and on `rightDiagonal_recurrence`, already on the board. Depth that would
settle it: it survives 4,000,000 terms at 40 depths with 0 failures, so it is
either true or false for a reason no computation will find; the proof, if it
exists, is two lines of "a running XOR of a period-`L` word closes after `L`
steps iff the word has even weight" plus the observation that `g_k` has period
`L`. The *point* of asking for it is what comes next: with it, the board can
state `centerColumn t = rightDiagonal t 0` with `rightDiagonal t` known to be
exactly periodic with a computable period, which is a strictly better position
than every existing obstruction, all of which are about the left side where
index 0 is inside a transient. The one thing to check first, because it would
kill the topic: whether the minimal period `P_k` is itself a wall — nothing
here bounds it below, and `2^(0.41 k)` is a measurement.

**Topic 2. The centre column as a Birkhoff sum.** The claim to falsify is
`centerColumn_eq_parity_of_rightDiagonal_flank` as stated in 3.2:
`c(k)` is the parity of `cell(j+k-1, j) OR cell(j+k-1, j+1)` summed over
`j ≤ 0`. It rests on one dictionary row (`c(k)` = a Birkhoff sum over an orbit
segment) and on the cone base case. It is provable — an induction along the
diagonal — and verified 2999/2999. What settles its *worth* rather than its
truth: whether the `0.2k` transient terms can be bounded in any way at all,
since the `0.3k` settled terms are computable from `forbit.mjs` and predict
nothing (`0.495`). Hand it over as the first statement on the board that
expresses the wall as a sum rather than as a cell.

---

## 6. Next vantage

**Cocycles and coboundaries over an odometer** — the ergodic theory of skew
products `Z_2 x_φ {0,1}`, Anzai skew products, and the coboundary equation
`φ = ψ - ψ∘T`. Section 3.2 turns the residual into a statement about Birkhoff
sums along a growing orbit segment, and "when is a sequence of Birkhoff sums
eventually periodic" is a coboundary question that this field has a hundred
years of technique for; nothing on the board is phrased as a sum, and I could
only build the identity, not attack it. A connector coming from there should
be given `explorer/portage_odometer.mjs` section C and asked whether the
transient part of the sum can be treated as a cocycle over the settled part.

The vantage I could not reach from where I stood is **algebraic and expansive
subdynamics of `Z^2` actions** — Boyle–Lind directional expansiveness,
Ledrappier-type `Z^2` subshifts, Kitchens–Schmidt. The picture is a `Z^2`
array in which one diagonal direction is exactly periodic (right), the other
is eventually periodic (left), and the vertical direction is the only one
where nothing is periodic; the theory of expansive directions exists precisely
to say which directions in a space-time diagram carry the information, and
Kůrka's notes (held, §6) reach the doorstep of it with `E(F)` and `A(F)` and
Sablik's convexity, then stop. I did not have the tools to state a dictionary
row there and I did not want to fake one. That vantage would also be the right
one to ask whether the residual is a *directional* statement in disguise: the
`0.25` seam, the `0.24` damage front and the `0.41` period exponent are three
slopes measured in the same picture, and nothing on the board relates them.
