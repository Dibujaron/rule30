# The census of aperiodicity proofs in print

*A sighting of `centerColumn_other_isEventuallyPeriodic_of_center` from the
vantage of: every proof in print that a specific, explicitly defined computable
sequence is not eventually periodic — what structure did the proof use?
Reverse mathematics of Π⁰₂ statements about explicit computable sequences, and
combinatorics on words.*

Parallax, 2026-09-09. Fourth sighting.

**The one-sentence answer to the brief's question.** There is a precedent —
the Kolakoski word and the Ehrenfeucht–Mycielski sequence are both explicitly
defined, computable, self-referential, without closed form, and their
aperiodicity is proved — but in both the *defining rule is itself a statement
about repetition*, which is what the proof reads; and every other proof in
print works by placing the sequence inside a structured class, which for rule
30's centre column is unavailable from inside and, from outside, strictly
harder than Prize 1. Exactly one property in the whole census survives contact
with the column: **the partial sums are unbounded and sublinear.** That is
section 3.6 and it is what I would hand a theorist.

---

## 1. The problem, seen from outside

Take the doubly infinite string of `0`s with a single `1` in it. Replace every
symbol at once by *(its left neighbour)* XOR *(itself OR its right neighbour)*,
and iterate. Write down the symbol standing at the original `1`'s position after
each step. That gives an explicit binary sequence

    a = 1 1 0 1 1 1 0 0 1 1 0 0 0 1 0 1 1 0 0 1 0 0 1 1 1 0 1 0 1 1 1 0 0 1 ...

whose `n`-th term any computer prints in time `O(n²)` with a three-line program
and no lookup table. Every statistic anybody has measured on it says fair coin:
density `0.5004` at `2·10⁵` terms, all `2¹⁴` words of length 14 present, longest
run 21, partial sums within `0.94 √N` of zero. **Unproved: that `a` is not
eventually periodic** — that there are no `p > 0` and `N` with `a(n+p) = a(n)`
for every `n ≥ N`. Equivalently, and this is the restatement I will use through-
out: **the real number `α = 0.a(0)a(1)a(2)… ` written in base two is
irrational.**

(The board's node is an implication — "if this column repeats, some other column
repeats" — but given Jen's theorem, which is proved, the hypothesis and the
conclusion cannot both hold, so the implication is *equivalent* to the negation
of its hypothesis. It is Prize 1 in implication clothing, not a piece of it. I
will therefore write about the aperiodicity statement directly and say so
plainly rather than pretending the wrapper adds anything.)

**Restated in this vantage's own terms.** "`a` is not eventually periodic" is a
single Π⁰₂ sentence about one specific computable sequence:

    ∀p > 0  ∀N  ∃n ≥ N :  a(n+p) ≠ a(n).

Not a theorem schema, not a statement about a class — one sentence about one
object, of the same logical shape as "this Turing machine's output is not
eventually constant". The vantage's question is then flatly empirical and has
nothing to do with rule 30: **for which explicitly defined computable sequences
has a sentence of this shape ever been proved, and what did the proof use?**
Section 3.1 is the answer as a table. The short version is that the answer is
"six families, all of which begin by identifying the sequence with a finite
object", and that rule 30's centre column is measurably outside all six.

## 2. Fields sighted

| Field / theory | The object there that matches | The seam, in one line |
|---|---|---|
| Combinatorics on words — factor complexity | Morse–Hedlund: aperiodic ⟺ `p(n) ≥ n+1` for all `n` | rule 30 satisfies it with margin `2ⁿ − n − 1`, and the "for all `n`" is the same Π⁰₂ sentence rewritten |
| Combinatorics on words — repetition avoidance | cube-free words: Thue's word, the Kolakoski word | **dead by measurement**: the column contains `0²⁰`, so no power-avoidance bound holds |
| Substitutive / morphic sequences | fixed point of a morphism, complexity `O(n)` or `O(n log n)` | the column's complexity is `2ⁿ` to `n = 14`; morphic is at most `O(n²)` |
| Automatic sequences, Cobham | the `k`-kernel is finite | non-automaticity is *strictly stronger* than Prize 1 (my own session 2; every eventually periodic sequence is automatic) |
| Algebraic power series over `F₂`, Christol | `Σ a(n) tⁿ` algebraic over `F₂(t)` | equivalent to the automatic row by Christol, so equally out of reach |
| Sturmian words, rotations, three-distance | complexity exactly `n+1`, an irrational rotation number | the column is at the *opposite* extreme of the complexity scale from every sequence this machinery handles |
| Diophantine approximation, irrationality proofs | `α = Σ a(n)2^{−n−1}`; Prize 1 ⟺ `α ∉ ℚ` | every irrationality proof in print supplies rational approximations better than truncation; the column supplies none (measured) |
| Mahler's method, transcendence of gap series | a functional equation `f(z²) = R(z, f(z))` | rule 150 and rule 90 have one; rule 30 is rule 150 plus one quadratic monomial, and that monomial is the whole gap |
| Normal numbers, disjunctive sequences | Champernowne; every word occurs ⇒ aperiodic | disjunctivity of the column implies Prize 1 and is therefore strictly harder |
| Self-referential words — Kolakoski | `K` = its own run-length encoding | **closest precedent by definitional shape**: short, self-referential, no closed form, and aperiodicity *is* proved |
| Greedy anti-repetition — Ehrenfeucht–Mycielski | complement the bit after the longest repeated suffix | **closest precedent by status**: aperiodicity proved, *balance still open* — the two prizes in the same relative position |
| Explicit sequences with unproved regularity — Ulam | `U(1,2)`, whose gap sequence is conjectured eventually periodic | the closest precedent for *failure*; and its arithmetical classification is the one I could fetch |
| Discrepancy, bounded-remainder sequences | partial sums of `(−1)^{a(n)}` | eventually periodic ⇒ `D(n) = cn + O(1)`; Rudin–Shapiro's aperiodicity really does follow this way |
| Symbolic dynamics of CA — left expansivity | Kopra Thm 3.5, Jen's theorem | the **only** proof in print of aperiodicity for a rule-30-shaped object, and it needs a window of width 2 |
| Computability — arithmetical hierarchy | a Π⁰₂ sentence about a computable point | the ceiling on the whole census: forcing cannot help, only arithmetic can |
| Proof theory — witness functions for Π⁰₂ | the bound `B(p,N)` a constructive proof supplies | rule 30's `B` is *smaller* than Thue–Morse's by two orders of magnitude; the fast-growing-witness route to independence is unavailable |
| Reverse mathematics proper | subsystems of second-order arithmetic | **largely dies here** and section 4 says why: reverse mathematics grades theorems, and this is one sentence about one object |
| Algorithmic randomness | Schnorr randomness, effective ergodic theorems | my own session 3: a computable point is never random, which is what killed every ensemble route and produced this vantage |

## 3. Connections

Six. The first is the census itself, which is the brief's deliverable; the
other five are the connections the census threw up while it was being built.

---

### 3.1 The census: every aperiodicity proof in print, and what it needed

**The claim.** Every proof in print that a specific, explicitly defined
sequence is not eventually periodic belongs to one of six families, each of
which begins by identifying the sequence with a *finite* object — a morphism, an
automaton, a rotation, a polynomial, an equation the sequence satisfies, or a
counting property no periodic sequence can have. Rule 30's centre column
measurably has none of them, and the one family whose hypothesis it does
satisfy — expansivity — delivers the theorem only for a window of two columns,
which is exactly where the board already stands.

**The dictionary.** One row per proof. "Has it?" is answered by measurement
where a measurement can answer it and by "no route" where it cannot; the
distinction is kept sharp because my own notebook records losing a session to
blurring it.

| # | The sequence, and the proof in print | The structure the proof needed | Does the centre column have it? | Citation |
|---|---|---|---|---|
| 1 | **Thue–Morse** `t(n) = popcount(n) mod 2`; aperiodic because it is overlap-free and every eventually periodic word contains arbitrarily large powers | a **morphism it is the fixed point of** (`0↦01`, `1↦10`), and a repetition-avoidance argument on that morphism | **No.** No morphism is known, and the column contains `0²⁰` (`explorer/parallax4_census.mjs`), so repetition avoidance is dead outright | fetched: [Thue–Morse, Wikipedia](https://en.wikipedia.org/wiki/Thue%E2%80%93Morse_sequence) — "*The sequence contains no cubes*"; "*uniformly recurrent without being either periodic or eventually periodic*" |
| 2 | **Kolakoski** `K` = its own run-length encoding; aperiodicity proved 1966, cube-freeness 1994 | an **equation relating the sequence to a rescaling of itself**, then infinite descent on the period | **No.** The column satisfies no known self-rescaling equation; the nearest candidate, the settled centre column, agrees with it at rate 0.509 (my session 2) | fetched: [Kolakoski, Wikipedia](https://en.wikipedia.org/wiki/Kolakoski_sequence) — "*The sequence is not eventually periodic*"; the attributions (Üçoluk, Amer. Math. Monthly 73 (1966) 681–682; Carpi 1994 for cube-freeness) are from a **WebSearch result listing, not a fetched page** |
| 3 | **Sturmian / Fibonacci word**; aperiodic because complexity is exactly `n+1 > n` | complexity **exactly `n+1`**, equivalently an irrational rotation number | **No, and this one is refuted outright at `n = 2`**: the column has `p(2) = 4 ≠ 3` | fetched: [Complexity function, Wikipedia](https://en.wikipedia.org/wiki/Morse%E2%80%93Hedlund_theorem) — "*A Sturmian word over a binary alphabet is one with complexity function n + 1*" |
| 4 | **Automatic sequences** (paperfolding, Rudin–Shapiro); aperiodicity is *decidable* from the automaton | a **finite `k`-kernel** | **No, and unreachable in both directions** — see 3.2. Every eventually periodic sequence is automatic, so non-automaticity is strictly stronger than Prize 1 (my session 2, floor 130,553 states) | fetched: [Christol refinement, arXiv:1909.02942](https://arxiv.org/abs/1909.02942) |
| 5 | **Algebraic power series over `F_q`**; aperiodicity via Christol + the automaton | a **polynomial equation over `F₂(t)`** satisfied by `Σ a(n)tⁿ` | **No.** Rules 90 and 150 have one; rule 30 is rule 150 plus the single quadratic monomial `c·r`, and that monomial is the whole gap | fetched: arXiv:1909.02942 — "*algebraic over the field of rational functions in `t` if and only if there is a finite-state automaton accepting the base-`p` digits of `n`*" |
| 6 | **Morphic sequences generally**; Pansiot's classification bounds their complexity | complexity in `{Θ(1), Θ(n), Θ(n log log n), Θ(n log n), Θ(n²)}` | **No route.** The column's `p(n) = 2ⁿ` to `n = 14`, but a single `n` never refutes an asymptotic bound with a free constant, so this *cannot* be settled by measurement | Pansiot's five classes: from a **WebSearch result listing, not a fetched page** |
| 7 | **Champernowne's word** `123456789101112…`; aperiodic because it is normal, hence disjunctive, hence `p(n) = 2ⁿ` | the sequence is **defined by listing all words**, so the conclusion is read off the definition | **No.** The rule 30 definition says nothing about which words occur; and disjunctivity of the column *implies* Prize 1, so it is strictly harder | fetched: [Champernowne constant, Wikipedia](https://en.wikipedia.org/wiki/Champernowne_constant) — "*Champernowne proved that C₁₀ is normal in base 10*" |
| 8 | **Ehrenfeucht–Mycielski**; aperiodic because it is disjunctive | the **defining rule complements the bit after the longest repeated suffix** — anti-repetition by fiat | **No.** Rule 30's local rule is `l ⊕ (c ∨ r)`; it mentions no repetition. See 3.5 | fetched: [Ehrenfeucht–Mycielski, Wikipedia](https://en.wikipedia.org/wiki/Ehrenfeucht%E2%80%93Mycielski_sequence) — "*The sequence is disjunctive, meaning that every finite subsequence of bits occurs contiguously, infinitely often*" |
| 9 | **Rudin–Shapiro via partial sums**; aperiodic because `√(3n/5) < s_n < √(6n)`, and an eventually periodic sequence has partial sums either bounded or linear | a **two-sided bound on the partial sums**, from a 2-adic recursion | **This is the one that survives.** Measured `max\|D\| = 0.94√N`. See 3.6 | fetched: [Rudin–Shapiro, Wikipedia](https://en.wikipedia.org/wiki/Rudin%E2%80%93Shapiro_sequence) — "*3/5 n < s n < 6n for n ≥ 1*" (i.e. `√(3n/5) < s_n < √(6n)`), attributed to Brillhart and Morton |
| 10 | **Base-`b` digits of `√2`, `π`, `e`**; aperiodic because the number is irrational | an **identity**: an algebraic equation, a continued fraction, an integral | **No.** `α = Σ a(n)2^{−n−1}` has no known identity of any kind; Prize 1 *is* its irrationality. See 3.4 | elementary (rational ⟺ eventually periodic expansion); no citation needed |
| 11 | **Liouville numbers**; irrational because approximable to `q^{−n}` for every `n` | **exceptionally good rational approximations**, from fast-growing digit gaps | **No, and measured to point the wrong way**: over 200,000 candidate periods the column agrees with its own shift for at most 19 terms. See 3.3, 3.4 | fetched: [Liouville number, Wikipedia](https://en.wikipedia.org/wiki/Liouville_number) — "*Rational numbers cannot satisfy the Liouville condition*" |
| 12 | **Indicator of the primes / of the squares / of the squarefree numbers**; aperiodic because density 0 with infinitely many ones, or by CRT | a **counting or congruence contradiction** with periodicity | **No.** Density 0.5004, longest gap 20. Note this cuts the other way too: Prize 2 (balance) is *compatible* with periodicity — `(01)^∞` is balanced — so proving Prize 2 alone gives nothing here | elementary; no citation needed |
| 13 | **Halting sequences, Chaitin's Ω** | **uncomputability** | **No.** The centre column is computable by a three-line program. This is the family that always works and is never applicable | elementary |
| 14 | **Any orbit of a deterministic map on a finite state space** — the *negative* control | nothing: such a sequence **is always** eventually periodic | Rule 30's column escapes only because the light cone grows without bound. This row says where the aperiodicity must come from | `sources/jen-1990-la-ur-90-761.txt` lines 149–151: "*the discreteness of state values and determinism of the interaction … imply that all initial conditions will be attracted into "limit cycle" behavior; that is, aperiodic behavior cannot occur*" |
| 15 | **Kopra Thm 3.5 / Jen 1990 — the width-2 trace of rule 30 itself**; the *only* proof in print of aperiodicity for a rule-30-shaped object | **left expansivity**: a window of `w` columns determines the window one step to its left, with the preperiod growing at rate `h`; plus a left edge spreading at speed `s < 1/h` | **Yes — at `w = 2` only.** This is on the board as `not_isEventuallyPeriodic_pair`. At `w = 1` the sideways solve has a free input at every white time of the column | `sources/kopra-2022-natural-class.txt`, Thm 3.5: "*If F is rapidly left expansive with width w and x ∈ N(Σ), then Tr[i,i+w−1](x) is not eventually periodic for any i*" |
| 16 | **The Ulam sequence `U(1,2)`** — the *failure* control: explicit, computable, conjectured to have an eventually periodic gap sequence, unproved for sixty years | — | The classification is the useful part: the statement sits at Σ⁰₂ and is *absolute*, so no set-theoretic method can settle it | fetched: [arXiv:2511.13066](https://arxiv.org/abs/2511.13066) — "*the strong rigidity, regularity (eventual periodicity of gaps), and density statements for U(a,b) are all arithmetical and lie at low levels of the arithmetical hierarchy (e.g. Σ⁰₂ or Π⁰₃)*" |

**The seams — that is, the empty rows, which the brief asked for as the
deliverable.**

1. Rows 1–6 all fail for the *same* reason and it is not sixteen separate
   accidents: each begins by exhibiting a finite description of the sequence.
   3.2 turns that into a dichotomy rather than a list.
2. Rows 7, 8 fail for a different reason and it is the more interesting one:
   these proofs read the *defining rule* rather than the sequence. 3.5.
3. Rows 10, 11 are the same reason again in Diophantine dress. 3.4.
4. Row 12 is the family the project's own Prize 2 lives in, and it is worth
   saying loudly that **Prize 2 does not imply Prize 1** — balance is exactly
   what a periodic column would have.
5. Row 15 is the only "yes", and the gap between `w = 2` and `w = 1` is a
   single free bit per white time. Everything the board has recorded about the
   wall is a restatement of that gap.
6. Row 9 is the only property in the census that (i) fails for *every*
   eventually periodic sequence, (ii) is empirically true of the column, and
   (iii) has been proved in print for a comparable explicit sequence. 3.6.

**What it leans on.** The fetched citations in the table, plus the two held
sources. Nothing here rests on an unfetched claim except the two rows marked
"WebSearch result listing, not a fetched page" — Üçoluk/Carpi for Kolakoski,
and Pansiot's five classes — which a captain can chase.

**The test.** `explorer/parallax4_census.mjs` (depth 200,000, six sequences)
and `explorer/parallax4_skeleton.mjs` (depth 2,097,152, lags 1…200,000, seven
sequences). Every "No" in the table that claims a measurement is one of those
two runs; every other "No" says "no route" instead, deliberately. The census
is falsified by exhibiting a seventeenth row: a proof in print that a specific
computable sequence is not eventually periodic, whose structure is not one of
the six. I looked and did not find one; that is the census result and it is
what a captain asked for.

**What it would give.** Nothing directly — it is a map. What it costs to
ignore is a session spent re-deriving a row.

---

### 3.2 The inside/outside dichotomy: no structured class can be used from outside

**The claim.** For *every* class `C` of sequences that contains all eventually
periodic sequences and has an effective aperiodicity test for its members —
automatic, `k`-regular, morphic, substitutive, algebraic over `F₂(t)`,
Toeplitz, linearly recurrent, and every other class rows 1–6 of the census use
— exactly two routes exist and both are closed: *from inside*, you must exhibit
a finite description of the centre column, which nobody has; *from outside*,
"the column is not in `C`" **implies** Prize 1 and so is at least as hard.
There is no third option, and this is a two-line argument, not a heuristic.

**The dictionary.**

| This project | The census's structured classes | Status |
|---|---|---|
| The centre column | a candidate member of `C` | the object |
| `IsEventuallyPeriodic centerColumn` | the sequence lies in the sub-class of eventually periodic members | exact |
| "Prize 1" | `column ∉ {eventually periodic}` | exact |
| A finite description (automaton, morphism, polynomial) | the certificate route "from inside" | **unavailable**: none is known, and if `p(n) = 2ⁿ` for all `n` none exists |
| "The column is not automatic / not morphic / not algebraic" | the refutation route "from outside" | **implies Prize 1**, because eventually periodic ⊂ `C` |
| My session 2's `≥ 130,553` states | one instance of the outside route, at `C` = automatic | exact, and now seen to be an instance of a general fact rather than a special one |

**Seams.** (i) The dichotomy needs `C` to contain the eventually periodic
sequences. The Sturmian class does *not* — Sturmian words are aperiodic by
definition — which is why row 3 of the census dies by a different and much
cheaper mechanism: `p(2) = 4` refutes membership outright. Kopra's class of
width-`w` traces of rapidly left expansive automata also does not contain the
eventually periodic sequences, which is precisely why it is the one row that
works. **So the dichotomy names its own escape hatch: look for classes that
exclude periodicity by definition.** (ii) The "effective aperiodicity test"
clause is doing no work — it is only there to say why one would want membership
in the first place.

**The one-line proof, so it can be checked rather than believed.** Every
eventually periodic sequence is automatic in every base: its `k`-kernel
`{n ↦ a(kⁱn + r)}` consists of sequences that are eventually periodic with
period dividing `p` and preperiod at most `N`, and there are finitely many of
those. The same sequence is morphic (`uv^∞` is the image of a fixed point) and
its generating function is rational hence algebraic. So `¬(column ∈ C)` gives
`¬(column eventually periodic)` for each such `C`.

**What it leans on.** The membership facts above are elementary and given in
full. The classes come from the fetched citations in 3.1 (Christol, Pansiot,
Cobham).

**The test.** A theorist falsifies this by naming a class `C` with a decidable
aperiodicity test, *not* containing all eventually periodic sequences, in which
the centre column can be shown to lie. Kopra's `w = 2` class is a proof that
such classes exist. The precise statement to attack, in the project's
vocabulary: **is there a `w = 1` analogue of `rapidly left expansive` — a
property of the single centre column, closed under nothing, satisfied by
`centerColumn`, and failing for every eventually periodic sequence?**

**What it would give.** It touches the whole residual by explaining why five
of the six census families were never going to work, and it converts my own
session-2 result (non-automaticity is above Prize 1) from a curiosity about one
class into a structural fact about all of them. It leaves the residual exactly
where it was, but it removes five directions from a captain's budget.

---

### 3.3 The witness-function inversion: proofs live where the near-repetition is *large*

**The claim.** The intuition that rule 30 is hard because its column
"disagrees with every period immediately" is exactly backwards. Every sequence
whose aperiodicity has been proved *nearly repeats*, hugely and at a
structured set of lags, and the proof is an induction on the controlled failure
of that near-repetition. Rule 30's column has no near-repetition at all — its
statistics are those of a PRNG to three decimal places — and that absence, not
any largeness, is what leaves a proof nothing to hold.

**The dictionary.** Write `W(p) = min{n ≥ 0 : a(n+p) ≠ a(n)}` (how long the
sequence pretends to have period `p`) and `M(p)` for the longest stretch
*anywhere* in a prefix on which `p` really is a period.

| This project | Proof theory / combinatorics on words | Status |
|---|---|---|
| "Not eventually periodic" | the Π⁰₂ sentence `∀p ∀N ∃n ≥ N : a(n+p) ≠ a(n)` | exact |
| A constructive proof of it | a computable **witness function** `B(p,N)` bounding the search | exact |
| Fast-growing `B` | the standard route to independence (Goodstein, Paris–Harrington) | **unavailable**: rule 30's `B` is `O(log)` |
| `W(p)`, `M(p)` large at structured lags | the near-repetition skeleton every proof in print exploits | the finding |
| Rule 30's skeleton | — | **empty**, and identical to a xorshift's |

**The measurement** (`explorer/parallax4_skeleton.mjs`, 2,097,152 terms, lags
1…200,000; `explorer/parallax4_anywhere.mjs`, 1,048,576 terms, lags 1…1,500):

| Sequence | mean `W` | `#{p : W(p) > 100}` | top lag | `M/p` at the top lag |
|---|---|---|---|---|
| **rule 30 centre column** | **1.000** | **0** | `p = 31176`, `W = 19` | 0.02 |
| xorshift (null control) | 0.998 | 0 | `p = 177856`, `W = 17` | 0.03 |
| Thue–Morse | 6.130 | 1041 | `p = 196608 = 3·2¹⁶`, `W = 131072` | 1.00 |
| Rudin–Shapiro | 3.035 | 412 | `p = 131072 = 2¹⁷`, `W = 65536` | 1.00 |
| regular paperfolding | 2.549 | 388 | `p = 196608`, `W = 32768` | — |
| Fibonacci word | 17.813 | 2631 | `p = 196418` (Fibonacci), `W = 317809` | **2.62** |
| Sturmian, `α = √2 − 1` | 10.612 | 1010 | `p = 195025` (Pell), `W = 470831` | — |

Read the top-lag column: Thue–Morse and Rudin–Shapiro peak at powers of two,
the Fibonacci word peaks at Fibonacci numbers, the `√2 − 1` Sturmian peaks at
Pell numbers — each proof's structure is visible in the data as the set of lags
where the near-repetition lives. Rule 30's top lags are `31176, 17371, 164352,
125998, …`: no pattern, no power of two, no Rowland doubling position, and the
largest is 19 where a coin gives 17.

**Seams.** (i) `W` is prefix-anchored; `M` is the honest all-onsets version and
says the same thing (rule 30 mean `M` 19.35, max 33; xorshift mean 19.36, max
29; Thue–Morse `M/p = 1.00` at `p = 2^k`). (ii) A null result is only worth its
controls, and here the instrument reproduces a known constant: the Fibonacci
word's repetition at `p = 987` has length `M + p = 3569`, exponent **3.615**,
against the word's known critical exponent `2 + φ = 3.618`. That is the reason
to believe the rule 30 zeros. (iii) The inversion is a statement about
*evidence*, not about difficulty: it does not follow that a large skeleton
makes a proof easy, only that every proof in print had one.

**What it leans on.** Nothing external; this is a measurement with controls.
The claim that a Π⁰₂ proof supplies a witness function is standard proof theory
and is stated here rather than cited, because I searched for reverse-math work
on combinatorics on words and found none applicable (section 4).

**The test.** Falsified by finding *any* set of lags at which the centre
column's `W(p)` or `M(p)` rises above the coin's `log₂ N`. I looked at 200,000
lags to depth `2²¹` and found nothing above 19. A theorist could push to `p`
near the diagonal doubling positions (`2,107,985,255` and `1,420,878,968` are
on the board) where a structured lag would most plausibly hide.

**What it would give.** It closes off the "this is hard because Π⁰₂ statements
are hard" reading. If Prize 1 is unprovable in some system, it is *not* because
its witness function grows fast — the witness is bounded by 19 over the whole
measured range. Whatever the obstruction is, it is not a growth-rate
obstruction, and that removes the one standard independence mechanism from
consideration.

---

### 3.4 Prize 1 is an irrationality statement, and the skeleton is its continued fraction

**The claim.** Prize 1 is exactly the irrationality of one explicitly
computable real number `α = Σ a(n)2^{−n−1}`; every irrationality proof in print
works by producing rational approximations better than the trivial truncations;
and the near-repetition skeleton of 3.3 *is* the supply of such approximations,
measured to be empty. So the Diophantine reading is not a metaphor — it is the
same measurement in different units.

**The dictionary.**

| This project | Diophantine approximation | Status |
|---|---|---|
| The centre column `a` | the base-2 digits of `α = 0.a(0)a(1)a(2)…` | exact |
| `IsEventuallyPeriodic a` | `α ∈ ℚ`, with denominator `2^N(2^p − 1)` | exact and elementary |
| Prize 1 | `α` is irrational | exact |
| Candidate period `p`, onset `N` | the rational `r_{p,N}` with that denominator nearest `α` | exact |
| `W(p) = 19` | `\|α − r_{p,0}\| ≈ 2^{−19}`, i.e. `≈ q^{−19/p}` with `q = 2^p − 1` | exact |
| Truncation at `N` | the free approximation, error `≈ 1/q` | the baseline |
| A Liouville-type proof | infinitely many `r` with error `≪ q^{−n}` for every `n` | **absent**: measured exponent `19/31176 ≈ 0.0006`, far *worse* than the free baseline |
| The Fibonacci word / golden ratio | `W/p → φ`, error `q^{−1.618}`: the continued-fraction convergents | the control that shows the row is real |
| Rule 30's `α` | a real that no rational of periodic shape comes near | the finding |

**Seams.** (i) The correspondence "digit period ↔ rational" is exact and
elementary; the correspondence "near-repetition ↔ good approximation" is exact
too, but the *interpretation* — that the skeleton is a continued-fraction-like
object — is a resemblance, supported by the Fibonacci-and-Pell peaks, not a
theorem. I state it as a sighting. (ii) The census's irrationality proofs split
in two — "too well approximable" (Liouville, Apéry-style) and "approximation
controlled by an identity" (Lambert's continued fraction for `tan`, Hermite's
integrals for `e`) — and rule 30 has neither, because both begin from a closed
form. (iii) There is a genuinely positive thing here: it says Prize 1 is not a
near miss. `α` is not merely different from every periodic rational, it is
*far* from each one relative to that rational's own complexity, at every one of
200,000 tested denominators.

**What it leans on.** Fetched: [Liouville number,
Wikipedia](https://en.wikipedia.org/wiki/Liouville_number) — "*a real number x
with the property that, for every positive integer n, there exists a pair of
integers (p,q) with q>1 such that 0<|x−p/q|<1/q^n*", and "*Rational numbers
cannot satisfy the Liouville condition*". The rational ⟺ eventually periodic
equivalence is elementary.

**The test.** A theorist attacks this by asking whether the board's machinery
gives *any* lower bound of the shape `|α − a/(2^N(2^p−1))| > f(p,N)` uniform in
`p`. The measurement says `f` can be taken enormous (`2^{−19}`) at every tested
`p`, so the obstacle is entirely the uniformity, not the size. In the project's
vocabulary: **is there a `p`-uniform lower bound on the first disagreement time
of `centerColumn` with its own shift by `p`?** That is Prize 1 restated so that
the quantifier structure is the visible difficulty.

**What it would give.** It gives a captain a second vocabulary in which the
wall can be stated to an outside reader with no CA background, and it kills the
Liouville family by measurement rather than by assertion.

---

### 3.5 The two self-referential precedents, and the clause they share

**The claim.** The brief asked whether there is a precedent at all — an
explicitly defined computable sequence of low definitional complexity, without
closed form, whose aperiodicity is proved. There are exactly two I could find,
the Kolakoski word and the Ehrenfeucht–Mycielski sequence, and they are much
closer to rule 30 than Thue–Morse is. Both proofs work for the same reason and
it is a reason rule 30 does not have: **their defining rules are themselves
statements about repetition**, so the proof reads the definition rather than
the sequence.

**The dictionary.**

| This project | Kolakoski `K` | Ehrenfeucht–Mycielski `E` |
|---|---|---|
| Definition length | `K` = its own run-length encoding | complement the bit after the most recent earlier occurrence of the longest repeated suffix |
| Closed form | none | none |
| Known morphism / automaton | none | none |
| Aperiodicity | **proved** | **proved**, via disjunctivity |
| Balance / density | **open** (density conjectured 1/2, unproved) | **open** (density known only to lie in `[1/4, 3/4]`) |
| The rule 30 analogue of the definition | `a(t)` is the centre cell of the `t`-th row of `l ⊕ (c ∨ r)` from one black cell | same |
| **The clause the proof uses** | "run-length" — the definition quantifies over *repetitions of a symbol* | "longest repeated suffix" — the definition quantifies over *repeated factors* | 
| Rule 30's corresponding clause | **there is none.** `l ⊕ (c ∨ r)` mentions three cells and no repetition of anything | — |

The status column is the striking one. **Both precedents have Prize 1 proved
and Prize 2 open, in that order** — exactly the project's own situation with
the order of difficulty preserved. That is a genuine data point for a captain:
for self-referentially defined sequences, aperiodicity has repeatedly turned
out to be the *reachable* one and balance the wall, which is the reverse of the
project's implicit ordering.

**Seams.** (i) The Kolakoski proof's mechanism is a descent: a period `p`
forces a period on the run-length encoding, which is the sequence again, of
roughly `p` times the mean run length, and iterating contradicts. Rule 30's
column has no map to itself under which a period would descend. The board's
nearest object, `settledCenter`, is a genuine rule 30 evolution and is related
to the column — but it agrees with the true column at rate 0.509, a coin, so
the relation carries no periodicity. (ii) The EM proof's mechanism is not a
descent but a construction: the rule *manufactures* every finite word, so
disjunctivity is a bookkeeping argument on match lengths. There is no
manufacture in rule 30. (iii) **The honest reading is negative** and I want it
recorded that way: the two closest precedents are close in *shape* — short,
computable, self-referential, unstructured-looking — and both proofs use a
feature of the definition that rule 30's definition does not contain. A census
result, and the one the brief said to state plainly if true.

**What it leans on.** Fetched: [Kolakoski,
Wikipedia](https://en.wikipedia.org/wiki/Kolakoski_sequence) — "*an infinite
sequence of symbols {1,2} that is the sequence of run lengths in its own
run-length encoding*", "*The sequence is not eventually periodic*"; [Ehrenfeucht–Mycielski,
Wikipedia](https://en.wikipedia.org/wiki/Ehrenfeucht%E2%80%93Mycielski_sequence)
— "*each successive digit is formed by finding the longest suffix of the
sequence that also occurs earlier within the sequence, and complementing the bit
following the most recent earlier occurrence of that suffix*", "*The sequence is
disjunctive*"; [arXiv:1710.01325](https://arxiv.org/abs/1710.01325) — "*We study
the binary Ehrenfeucht Mycielski sequence seeking a balance between the number
of occurrences of different binary strings*", with the balance conjecture
recorded as still open. The Kolakoski descent argument's *details* are
**UNVERIFIED** — I could not fetch Üçoluk's 1966 Monthly note or Carpi's 1994
paper (searched: "Kolakoski sequence proof not eventually periodic
aperiodicity", "Kolakoski sequence cube-free Carpi proof aperiodic descent
run-length"; both returned only secondary descriptions, and arXiv:2002.08306
and arXiv:1009.4061 would not render as text).

**The test.** The falsifiable half is the claim that rule 30 has no
repetition-mentioning clause. A theorist kills it by exhibiting one: a
consequence of `rule30_eq` that constrains repeated factors of the centre
column. The board has one candidate object of exactly that type and it should
be looked at with this in mind — the **forbidden block** (`crystals` 8, no two
adjacent cells of a row take a particular pair) and the **shield** result
(`sextant_scratch_shield_general.lean`), both of which are statements about
what patterns *cannot* occur. Whether either descends to the centre column is
the question.

**What it would give.** It answers the brief's precedent question: yes, there
is a precedent, twice; no, neither transfers; and the transfer fails at a
nameable clause rather than at a mood.

---

### 3.6 The one property that survives: unbounded, sublinear partial sums

**The claim.** Of every property in the census that (a) fails for every
eventually periodic sequence and so *implies* aperiodicity, exactly one is
empirically true of the centre column and has an analogue proved in print for a
comparable explicit sequence: **the partial sums are unbounded and `o(n)`.**
Rudin–Shapiro's aperiodicity really does follow this way, from a two-sided `√n`
bound. And for rule 30 the statement factors as **Prize 2 plus a discrepancy
lower bound**.

**The dictionary.** Write `ε(t) = 1 − 2·a(t) ∈ {±1}` and `D(n) = Σ_{t<n} ε(t)`.

| This project | Discrepancy / bounded-remainder sequences | Status |
|---|---|---|
| The centre column | a `±1` sequence | exact |
| `IsEventuallyPeriodic a` with period sum `s` over one period | `D(n) = (s/p)·n + O(1)` | exact and elementary |
| Prize 2 (balance, density 1/2) | `D(n) = o(n)` | exact |
| "`D` is unbounded" | the sequence is not a bounded-remainder sequence | the missing half |
| Prize 2 **and** `D` unbounded | `s = 0` is forced by Prize 2, then `D` bounded — contradiction | **implies Prize 1** |
| Rudin–Shapiro | `√(3n/5) < s_n < √(6n)` (Brillhart–Morton) — both halves proved | the exemplar |
| Thue–Morse | balanced but `D` **bounded** (measured `max\|D\| = 1`) | the seam: aperiodic does *not* imply this |
| Rule 30, measured | `max\|D\| = 419` at `n = 24979` in `2·10⁵` terms, `0.94√N` | consistent, unproved |

**Seams and the honest cost.** (i) "Unbounded and sublinear" is *strictly
stronger* than aperiodicity — Thue–Morse is the counterexample, aperiodic with
`max|D| = 1` — so this is not a weakening of the wall and I am not offering it
as one. It is a *different, stronger* statement that happens to be the only one
in the census with a matching proof in print. (ii) It contains Prize 2, which
this project has never attacked, so handing it over means opening a second
prize. Say that plainly to a captain. (iii) The half that is not Prize 2 —
`D` unbounded — has no handle on the board that I could find; the closest
object is `column_succ_of_black`, which pins column `−1` at black times of the
column and is a statement about runs rather than sums. (iv) The Erdős
discrepancy problem is *not* this and does not help: its sums are along
homogeneous arithmetic progressions, where periodic sequences also have
unbounded discrepancy, so it separates nothing.

**What it leans on.** Fetched: [Rudin–Shapiro,
Wikipedia](https://en.wikipedia.org/wiki/Rudin%E2%80%93Shapiro_sequence) —
"*3/5 n < s n < 6n for n ≥ 1*", attributed to "*Brillhart and Morton*", "*A
Case Study in Mathematical Research: The Golay–Rudin–Shapiro Sequence*", Amer.
Math. Monthly 103 (1996) 854–869. The `D(n) = (s/p)n + O(1)` computation is
elementary and given above.

**The test.** Two, one cheap and one for a theorist.

*Cheap, and already run:* `explorer/parallax4_census.mjs` measures `D` on the
column and on five controls. Rule 30 gives `0.94√N`; Thue–Morse gives 1; the
balanced periodic word `0011` gives 2; Rudin–Shapiro gives `2.29√N`. So the
statistic does separate the periodic-and-balanced case from the column at
depth `2·10⁵`, which is the minimum for the row to be worth anything.

*For a theorist:* the statement to try to falsify, in the project's
vocabulary, is

> `(Prize 2) ∧ (∀ B, ∃ n, |Σ_{t<n} (1 − 2·centerColumn t)| > B)  →  ¬ IsEventuallyPeriodic centerColumn`

which should be provable in Lean from the board's definitions in well under an
afternoon, and is worth proving *because it is the only implication in the
census that reaches the wall from a statement nobody here has ruled out*. The
interesting failure mode is that it turns out to need more than balance.

**What it would give.** It touches the residual whole — it implies Prize 1
outright — at the cost of two open statements instead of one, and it is the
only row in the census with that shape. What would remain is a discrepancy
lower bound for an explicit CA column, for which the only precedent
(Brillhart–Morton) used a 2-adic recursion for the partial sums that rule 30 is
not known to have.

## 4. Died in translation

*(being written)*

## 5. What to hand the theorist

*(being written)*

## 6. Next vantage

*(being written)*
