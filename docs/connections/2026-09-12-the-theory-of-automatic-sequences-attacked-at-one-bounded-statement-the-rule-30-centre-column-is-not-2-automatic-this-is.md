# Sighting: "the centre column is not 2-automatic", from the theory of automatic sequences

*Ephemeris, connector, 2026-09-12. This is a sighting: a table of predicted
positions, not an observation and not a proof. Every row carries its epoch —
which definition, whose convention, and where the correspondence drifts.*

**Band, before anything else.** The headline is a **negative**, and by the
project's own table it is **project-internal**: it closes one route, prices four
others, and says nothing new about rule 30. Two rows are **known** and cited.
Two measurements are, as far as I could establish, not in print and not on this
board — the decimation orbit of the centre column, and the behaviour of a rule
30 picture whose centre column is forced to be an *automatic but aperiodic*
sequence — and both are small.

**The finding, in one paragraph.** There is a survey that is exactly this
brief's question (2): Allouche, Shallit and Yassawi, *How to prove that a
sequence is not automatic* (arXiv:2104.13072), eleven sections, nine methods.
Sorted by what each one needs as input, they fall into four piles. **Six need
structure the centre column has not got** — a morphism, a synchronized growth
function, a multiplicative law, a Dirichlet series with a meromorphic
continuation, a dynamical spectrum, or a *second* already-known non-automatic
sequence sitting inside it. One of those six is closed not by ignorance but by
**Prize 2**: the letter- and block-frequency criteria need an *irrational*
frequency, and P2 asserts `1/2`, exactly the rational value that makes the method
vacuous. **One pile needs sparsity** — the section holding Cobham's gap
dichotomy and Minsky–Papert — and it is refuted before it starts: the dichotomy's
escape branch is "gaps bounded infinitely often", and the centre column has
524,738 adjacent black pairs below `2^21`, so the dichotomy is *satisfied* and
yields nothing. **One needs a superlinear factor complexity bound**, which is
strictly stronger than what P1 needs (Morse–Hedlund needs only `p(n) ≥ n+1`) and
is a wall behind a wall. That leaves exactly **one method whose input is nothing
but the sequence itself** — their Theorem 1, the infinite kernel — and it
converts the question into a statement about **dilations** `n ↦ 2^e n + r`, where
every theorem this board owns is about **translations**.
So the route closes, and it closes with a specific, cheap, seedable residue:
the statement "for all `i < j` there is `n` with `c(2^i n) ≠ c(2^j n)`", which
implies P1 by pigeonhole on the powers of two mod `p` with no automatic-sequence
theory in it at all. That implication is **proved here, in Lean** —
`explorer/ephemeris_scratch_dilations.lean`, accepted by `lake env lean`, axioms
`[propext, Classical.choice, Quot.sound]`, with
`explorer/ephemeris_scratch_mutant.lean` beside it as the demonstration that the
check can fail — and its hypothesis is verified for every pair `i < j ≤ 15` with
witnesses `n ≤ 6`.

**And the trap check the brief demanded, answered plainly.** That residue is
*not* a hypothesis guarded by the negation of its own goal — each instance is a
finite computation with an exhibited witness, and I exhibited 120 of them. But
the implication is **true of any `Bool` sequence** (nothing in the Lean proof
mentions rule 30), so by the project's own banding it is **Nothing**, exactly
like `centerColumn_not_isEventuallyPeriodic_of_long_black_runs`. I say so in
section 5 rather than selling it. Its value is vocabulary, not content: every
node on this board is about `t ↦ t + p`, and this is the first candidate about
`t ↦ 2^e t`.

Scripts written and run for this document, under `explorer/`:
`ephemeris_kernel_orbit.mjs`, `ephemeris_boundary.mjs`; kernel checks
`ephemeris_scratch_dilations.lean` and `ephemeris_scratch_mutant.lean`.

---

## 1. The problem, seen from outside

An infinite line of cells, each black or white, all white but one. At every
tick each cell is replaced by *(its left neighbour) XOR (itself OR its right
neighbour)*. Watch the one cell that started black and write down its colour at
each tick: that is one completely explicit infinite bit sequence,
`1,1,0,1,1,1,0,0,1,1,0,0,0,1,0,1,1,0,0,1,…`, computed here to `2,097,152`
terms. The question is whether it is **eventually periodic** — whether after
some finite mess it repeats forever with some fixed period. Nobody knows.
This project has proved that no two distinct cells can both have eventually
periodic colour sequences, and that proved fact collapses the implication it
carries as its frontier ("if the watched cell repeats, some other cell
repeats") into the bare claim that the watched cell does not repeat.

**The same thing in this vantage's own terms.** A sequence `a` over a finite
alphabet is **`k`-automatic** when there is a finite-state machine which, fed
the base-`k` digits of `n`, ends in a state whose label is `a(n)`; equivalently
(Eilenberg) when its **`k`-kernel** `{n ↦ a(k^e n + r) : e ≥ 0, 0 ≤ r < k^e}` is
a finite set of sequences; equivalently (Büchi–Bruyère) when the set
`{n : a(n) = 1}` is first-order definable in `⟨ℕ, +, V_2⟩`, where `V_2(x)` is
the largest power of `2` dividing `x`. Eventually periodic sequences are
automatic in every base. So the ladder is

> **P3** (no machine computes `c(n)` in time polynomial in `log n`)
> ⟹ **`c` is not 2-automatic**
> ⟹ **P1** (`c` is not eventually periodic),

and the bounded statement this session was sent at is the middle rung. What is
being asked is whether an infinite sequence, given only by "run this rule and
look at the origin", can be shown to be beyond the reach of *any* finite-state
machine reading the binary digits of the index. The theory that surrounds this
question is unusually complete in one direction — for a **given** automaton,
every first-order property of the sequence it generates, eventual periodicity
included, is *decidable*, and there is software (Walnut) that decides them. The
session's real question is whether that machinery runs backwards.

---

## 2. Fields sighted

| Field / theory | The object there that matches something here | The seam, in one line |
|---|---|---|
| **Automatic sequences (Cobham, Eilenberg, Allouche–Shallit)** | `c` as a `2`-automatic candidate; the 2-kernel `{n ↦ c(2^e n + r)}` as its state set | The kernel manufactures *instances* out of one object — the one place in the P1–P3 ladder where a quantitative lower bound exists at all |
| **Büchi arithmetic `⟨ℕ,+,V_2⟩` and definability** | "`c` is 2-automatic" = "`{t : c(t)=1}` is first-order definable" | Definability is closed under shift and Boolean combination, so the *sideways solve* transports automaticity leftward exactly as it transports periodicity — C5 |
| **Formal language theory: Myhill–Nerode, pumping** | The state floor: distinct kernel elements are distinguishable states | Gives `≥ N` states for any computed `N`, never `∞`; certificate cost measured here at `≈ F log₂F` rows per `F` states |
| **Arithmetic dynamics: undefinability for Collatz-type maps** (Dhiman–Pandey 2026) | The orbit relation of an explicitly given integer map, proved **not** definable in `⟨ℕ,+,V_q⟩` | The one *live* technique that runs the machinery backwards, and it works by **interpreting a known-hard set inside the object** — rule 30 supplies no interpretation (C4) |
| **Symbolic dynamics: factor complexity** | `p(n)`, the number of length-`n` factors; automatic ⟹ `p(n) = O(n)` | P1 needs only `p(n) ≥ n+1` (Morse–Hedlund); the automatic route needs `p(n)/n → ∞`. A strictly harder input for a strictly weaker conclusion |
| **Analytic number theory of digital sequences** (Dirichlet series, Mauduit–Rivat) | `Σ c(n) n^{-s}` and its meromorphic continuation | Needs a closed form for the coefficients; rule 30 has coefficients and nothing else |
| **Substitution dynamical systems, spectral theory** (Müllner–Yassawi) | The eigenvalues of the subshift generated by `c` | Needs minimality and a computed spectrum; the orbit closure of the centre column is an object nobody has described |
| **Sturmian sequences and irrational rotations** | The home of the *irrational frequency* criterion: frequency irrational ⟹ not automatic | Rule 30's conjectured frequency is `1/2`. **Prize 2 is exactly the statement that kills this route to Prize 1** |
| **Algebraic power series over `F_2` (Christol)** | `C(x) = Σ c(t)x^t`; automatic ⟺ algebraic over `F_2(x)` | Parallax's vantage; the transcendence proof one would need *is* the automaticity proof, so it is circular. Recorded, not re-attempted |
| **Multiplicative number theory** (survey Theorem 3) | Sequences `f(n)` for multiplicative `f` | The centre column is not multiplicative and has no prime-indexed structure; the method has no foothold |
| **2-adic / T-function dynamics (this board's packed row)** | `rowStep r = 4r XOR (2r OR r)`, one step on a whole row | **One step of rule 30 *is* a 2-automatic function** — bitwise ops and doubling are all recognisable. What is not definable is the *diagonal read*, because `t ↦ 2^t` is not definable in `⟨ℕ,+,V_2⟩` (C4's seam) |
| **Circuit lower bounds against weak models (AC⁰, switching lemma)** | The one corner of complexity theory where *explicit* objects are proved outside a class | The technique is a structure theorem plus a progress measure invariant under restriction; the kernel is the restriction, and no invariant of rule 30 survives it. The unlikely row, and it is empty |
| **Self-referential sequences (Kolakoski)** | The nearest comparable object: explicit, simple, conjecturally density `1/2` | Whether it is known non-automatic I could **not** establish — see section 4. If it is open, that is the best available calibration for how hard this rung is |

---

## 3. Connections

### C1. The ladder is strict at both ends, with two explicit witnesses — and the logical shape does not improve

**Band: Nothing** (the implications are elementary; the witnesses are known
objects). It answers the brief's question (1) and I put it first because
everything after it depends on the answer.

**The claim.** `P3 ⟹ ¬(c is 2-automatic) ⟹ P1`, both implications elementary
and both **strict as statements about sequences**, with witnesses I can compute:
rule 90's column 1 is 2-automatic and *not* eventually periodic, and the
characteristic sequence of the perfect squares is *not* 2-automatic and is
computable in time polynomial in `log n`. So the middle rung is a genuine rung.
But for the single object `c` the strictness is unknowable, and — the part that
matters for how a captain should price this — **the arithmetical shape does not
improve**: P1 is `∀p ∀N ∃t`, non-automaticity is `∀A ∃n`, both `Π⁰₂`, both with
`Σ⁰₁` instances that a computation can certify one at a time. Moving up the
ladder buys a different instance family, not a lower quantifier.

**The dictionary.**

| This project | Automatic sequences | Checked / seam |
|---|---|---|
| `centerColumn : ℕ → Bool` | a sequence `a` over `{0,1}` | — |
| `IsEventuallyPeriodic centerColumn` (P1's negation) | `c` ultimately periodic | — |
| P1 | `c` is not ultimately periodic | — |
| The bounded statement | `c` is not 2-automatic | — |
| "eventually periodic ⟹ automatic" | ultimately periodic ⟹ `k`-automatic for **every** `k` | quoted below; also elementary — the kernel of a period-`p`, onset-`N` sequence has at most `N + p` elements at each level and stabilises |
| So `¬automatic ⟹ P1` | contrapositive | **the implication that makes this rung worth anything** |
| Pantograph's `P3Core` (not in time `poly(log n)`) | `c` automatic ⟹ `c(n)` read off in `O(log n)` steps from the digits of `n` | so `P3Core ⟹ ¬automatic`; elementary from the definition quoted below |
| Is the first arrow strict? | **yes, as a class statement**: squares are non-automatic *and* polylog-computable | derived from Cobham's gap theorem, §C2 |
| Is the second strict? | **yes, as a class statement**: rule 90 column 1 is automatic and aperiodic | kernel saturates at **4** (Parallax, reproduced here: it collides at `u_1 = u_2`) |
| Is either strict **for `c`**? | unknown and not decidable by anything here | the "one object" seam, in its mildest form |
| Logical shape of P1 | `∀p ∀N ∃t : c(t+p) ≠ c(t)` — `Π⁰₂` | — |
| Logical shape of `¬automatic` | `∀A ∃n : A(n) ≠ c(n)` — `Π⁰₂` | **no gain**; and for each fixed state bound `N`, "no DFAO with `≤ N` states computes `c`" is *decidable*, exactly as "no period `≤ P` with onset `≤ M`" is decidable for P1 |

**What it leans on.** The definition and the kernel criterion, fetched at
<https://en.wikipedia.org/wiki/Automatic_sequence>: *"The n-th term of an
automatic sequence a(n) is a mapping of the final state reached in a finite
automaton accepting the digits of the number n"*; *"The k-kernel of the sequence
s(n) is the set of subsequences {s(k^e n+r): e≥0 and 0≤r≤k^e−1}"*; and *"if the
k-kernel is finite, then the sequence s(n) is k-automatic, and the converse is
also true. This is due to Eilenberg."* For "eventually periodic ⟹ automatic",
the same page states Cobham's theorem as *"For h and k multiplicatively
independent, a sequence is both h-automatic and k-automatic if and only if it is
ultimately periodic"*, whose easy direction is the one I need.

**The test.** `explorer/ephemeris_kernel_orbit.mjs`, section B, depth `2^21`.
Rule 90 column 1 and rule 150 column 1 both collide at `u_1 = u_2` (their
decimation orbits are finite, as an automatic sequence's must be); Thue–Morse
collides immediately at `u_0 = u_1`; a period-6 sequence collides; a xorshift
control does not. The squares witness is a derivation rather than a computation:
`#{squares < n} ~ √n` is not `O(log n)` and the gaps `2j+1` tend to infinity, so
*both* branches of Cobham's dichotomy fail and the sequence is not `k`-automatic
for any `k`; and `n ↦ "is n a square"` is computable in time polynomial in
`log n` by integer square root. What would kill this connection: an automatic
sequence that is not computable in `poly(log n)` (there is none — the automaton
*is* the algorithm), or a proof that `c` is automatic, which would collapse all
three prizes at once.

**What it would give.** It fixes the price of the whole session's target:
anything proving the middle rung proves P1, so the rung is a **sufficient
condition for the prize** in exactly the shape the board's residual paragraph
says it wants — and it is strictly harder than the prize. What remains is
everything.

---

### C2. The census: nine published methods, and rule 30's centre column is neither sparse nor structured

**Band: known** (the methods are a published survey) **applied to a
project-internal verdict**. This is the brief's question (2) and (3), answered
by sorting the literature rather than by hoping.

**The claim.** Every technique in print for proving that a *specific,
explicitly given* sequence is not automatic needs one of three inputs: a closed
form (a morphism, a Dirichlet series, a spectrum, a multiplicative law, an
exactly computed frequency), a **sparse** support, or an **asymptotic**
complexity bound. The rule 30 centre column has no closed form, is the opposite
of sparse, and its complexity is a wall. The single exception is the kernel
(C3). The census therefore closes the route, and two of the closures are sharp
enough to be worth stating on their own: **the frequency method is killed by
Prize 2**, and **the gap methods are killed by rule 30's own density, not by
ignorance**.

**The dictionary.**

| Survey section / method | What it needs as input | What this board can supply | Verdict |
|---|---|---|---|
| §2, Thm 1 — infinite `q`-kernel | `r_k ∈ [0,q^k)` with all `(a_{q^k n + r_k})_n` distinct | nothing proved; measured to level 15 (C3) | **the only live one**; needs a dilation theorem |
| §2, Thm 3 — multiplicative functions | `f` multiplicative, divisibility at prime powers | `c` is not multiplicative and has no prime structure | dead on arrival |
| §3 — irrational letter frequency | the frequency of a letter, **computed and irrational** | the density is *conjectured* `1/2` — Prize 2 | **dead, and dead by the board's own conjecture**: if P2 holds this method cannot prove P1 |
| §3, Thm 9 — irrational *block* frequency | a block whose frequency is irrational | conjecturally `2^{-|w|}` for every word — all rational | dead, same reason, for every block at once |
| §3, Thm 12 — non-uniform morphism with irrational dominant eigenvalue | `c` a fixed point of a known morphism | `c` is not known to be morphic at all | needs a closed form |
| §4 — `k`-synchronization | a growth function of the sequence that is `k`-synchronized | nothing on the board is synchronized | needs a closed form |
| §4, Ex. 15 — Schlage-Puchta's run lemma | arbitrarily long runs **and** no runs of multiplicative width | see the row below | **redundant**: the first half alone already implies P1 |
| §5, Thm 17 — block complexity | `p(n) ≠ O(n)`, an asymptotic | `p(32) ≥ 499,949` (obstruction 9); `p(32) ≥ 131,037` of `131,041` windows measured here | a wall behind a wall; input strictly stronger than P1's `p(n) ≥ n+1` |
| §6, Thm 19 — Cobham's gap dichotomy | refute **both** "support is `O(log n)`" and "gaps bounded infinitely often" | branch B is *satisfied*: 524,738 adjacent black pairs below `2^21`, 262,192 of them in the top half | **structurally dead**: the theorem is a tool for sparse supports |
| §6, Thm 23 — Minsky–Papert | a letter of **zero frequency** occurring infinitely often | black has density `0.500292` | hypothesis false; nothing to apply |
| §7 — Dirichlet series | meromorphic continuation of `Σ c(n)n^{-s}` | no closed form | needs a closed form |
| §8 — orbit properties | a known non-automatic sequence embedded in the orbit closure | none known | needs a second hard object |
| §10, Thm 33 — dynamical eigenvalues | minimality and the spectrum of the subshift | the orbit closure of `c` is undescribed | needs a closed form |

**The Schlage-Puchta row, in full, because it is the one that looks closest.**
The lemma says an automatic sequence with arbitrarily long runs must have runs
of *multiplicative* width: `a_n = a` on `[x, (1+c)x]` for some fixed `c > 0` and
infinitely many `x`. This board has just closed two nodes of exactly that
shape — `centerColumn_black_run_lt_start` (a black run beginning at `a` has
length `< a`) and `centerColumn_white_run_lt_start` (`< 3a`) — so it already
refutes the conclusion for `c ≥ 1` (black) and `c ≥ 3` (white). To refute it for
*every* `c > 0` the board would need run length `= o(a)`, where measurement says
the truth is `≈ log₂ a`: longest black run **23** at `t = 1,174,512`, longest
white run **19** at `t = 32,198`. **And it would buy nothing**, because the
lemma's other hypothesis, "arbitrarily long runs", is already on this board as
`centerColumn_not_isEventuallyPeriodic_of_long_black_runs`, which yields P1 in
one line with no automatic-sequence theory at all. So the method asks for
strictly more than the board already has a shorter route from. *That is the
trap the brief names, found in the literature rather than on the board.*

**What it leans on.** The survey, fetched at
<https://arxiv.org/abs/2104.13072> and <https://ar5iv.labs.arxiv.org/html/2104.13072>
— J.-P. Allouche, J. Shallit, R. Yassawi, *How to prove that a sequence is not
automatic*, abstract: *"Automatic sequences have many properties that other
sequences (in particular, non-uniformly morphic sequences) do not necessarily
share. In this paper we survey a number of different methods that can be used to
prove that a given sequence is not automatic."* Eleven numbered sections:
*Introduction; Infinite q-kernels; Irrational frequencies; Synchronization;
Block complexity; Gaps and runs; Dirichlet series; Orbit properties; When
non-q-automaticity implies non-automaticity; A "dynamical" approach;
Conclusion.* Quoted statements:

- Theorem 1: *"If there exists a sequence of integers (r_k)_{k≥0} such that
  r_k∈[0,q^k) and the subsequences (a_{q^k n+r_k})_{n≥0} are all distinct, then
  the sequence **a** is not q-automatic."*
- Frequency criterion: *"if the frequency of occurrence of some letter in a
  sequence (a_n)_{n≥0} taking its values in a finite alphabet exists and is
  irrational, the sequence cannot be q-automatic for any q≥2."*
- Theorem 9: *"If a sequence (a_n)_{n≥0} with values in a finite alphabet is
  such that the frequency of some block occurring in this sequence exists and is
  irrational, then the sequence cannot be q-automatic for any q≥2."*
- Theorem 17: *"If the (block-)complexity of a sequence taking its values in a
  finite alphabet is not in 𝒪(n), then the sequence cannot be automatic."*
- Theorem 19 (Cobham): *"Let **x**=(x(n))_{n≥0} be a k-automatic sequence over
  Δ. Let d∈Δ. Define α_j to be the position of the j'th occurrence of d in
  **x**. Then either lim sup_{n→∞} |**x**[0..n−1]|_d / log n < ∞ OR
  lim inf_{j→∞} α_{j+1}−α_j < ∞ (or both)."*
- Example 15, attributed to Schlage-Puchta [ref 84], *A criterion for
  non-automaticity of sequences* (2003): *"if an automatic sequence (a_n)_{n≥0}
  has arbitrarily long runs, then there exists a constant c>0 such that a_n=a
  for n∈[x,(1+c)x] and infinitely many x."*

**One instrument caveat, recorded rather than hidden.** Three separate fetches
of the same source returned the same text for Theorems 1, 9, 17 and 19, but
disagreed once about which statement carries the number 23: two readings gave
Minsky–Papert as *"Let a be a value occurring infinitely often with zero
frequency. Then lim sup α_{j+1}/α_j > 1"*, one gave an orbit-closure statement
instead. The **content** of the Minsky–Papert row is corroborated twice and the
**number** is not; a reader should check the number before citing it. Nothing in
my verdict turns on it, because rule 30's black letter does not have zero
frequency under any reading.

**The test.** `explorer/ephemeris_kernel_orbit.mjs`, section D, depth `2^21`
(engine checked against a naive per-cell run, 0 mismatches over 400 rows, and
against the eleven centre-column values recorded in `Rule30/Basic.lean`).
Branch A of Cobham: `count(2^20) = 524,976`, i.e. `count / log₂N = 26,249` and
climbing — while the **board's only proved rule-30-dependent count bound**,
`centerColumnCount_ge_of_pow`, gives `count(5^n) ≥ n`, i.e. `count(2^20) ≥ 8.6`.
The proved bound is exactly `Θ(log N)`: it sits **on the automatic side of
Cobham's threshold**, and no sharpening of the run-bound tier can move it,
because runs bounded by a *constant multiple* of the start time give one
guaranteed sign change per multiplicative window and hence a logarithm. Branch B:
`liminf` gap `= 1`, decisively. The precise statement a theorist could falsify:
*there are only finitely many `t` with `centerColumn t = centerColumn (t+1) =
true`.* Measured false 524,738 times.

**What it would give.** Nothing towards P1 — it is a closure. What it gives the
board is the price list: **if a proposal's route to non-automaticity goes
through frequencies, gaps, runs, Dirichlet series, morphisms or spectra, it is
refuted in advance**, and the reason is not that rule 30 is hard but that rule
30's centre column is *dense and structureless*, which is the one profile the
whole toolkit has no entry for.

---

### C3. The one method with instances: Theorem 1 turns the question into a statement about dilations, and this board has only translations

**Band: Nothing** for the implication (it is true of any `Bool` sequence);
**project-internal** for the measurement and the vocabulary.

**The claim.** The kernel method is the only one whose input is the sequence
itself, and specialised at `r_k = 0` it says: *if the decimation map
`u ↦ (n ↦ u(2n))` has an infinite forward orbit at the centre column, the centre
column is not 2-automatic, hence P1.* That hypothesis is a statement about
`n ↦ 2^e n`, a **dilation**; every structural theorem this board owns — periods,
onsets, diagonals, cones, damage fronts, the shift-equivariance `step (2s) = 2
step s` — is a statement about **translations**. Rule 30 has no dilation
symmetry, which is precisely why its columns are not automatic and precisely why
nobody can prove it; the linear rules have one, which is why theirs are.

**The dictionary.**

| This project | The kernel method | Checked |
|---|---|---|
| `centerColumn t` | `a(n)` | — |
| the decimation `u_k(n) = c(2^k n)` | the `r_k = 0` slice of the 2-kernel | — |
| `u_{k+1}` = the even-indexed subsequence of `u_k` | the kernel is the forward orbit of the decimation maps | — |
| "the orbit is infinite" | Theorem 1's hypothesis with `r_k = 0` | measured: **all pairs `i < j ≤ 15` distinct, largest witness index `n = 6`, at `(i,j) = (4,10)`** |
| an automatic sequence | must have a **finite** orbit | Thue–Morse collides at `u_0 = u_1`; rule 90 col 1 and rule 150 col 1 at `u_1 = u_2`; a period-6 sequence at `u_1 = u_2`; xorshift does not collide |
| the state floor | all `2^e` progressions `c(2^e n + r)` pairwise distinct ⟹ no LSD-first 2-DFAO with `< 2^e` states | **all distinct for every `e ≤ 14`**, i.e. a floor of `16,384` states from depth `507,904` |
| the certificate cost | separating prefix length grows like `e`: `2,4,4,7,9,13,17,18,17,19,23,23,24,31` at `e = 1..14` | so a floor of `F` states costs about `F·log₂F` rows — **linear depth buys linear floor, never infinity** |
| Parallax's `130,553` at depth `2^21` | the cumulative count over all levels `e ≤ 16`, a larger and equally valid floor | consistent; the level-wise number is the cheaper certificate |
| rule 90's Sierpiński self-similarity | `t(2n) = t(n)` type identities — an exact dilation law | Thue–Morse control: `t(2n) = t(n)` at **1.000000** of `65,536` |
| rule 30's version of that law | `c(2n) = c(n)` at **0.500182** of `1,048,576`; best agreement of `c(2n)` with any `c(n+s)`, `s < 64`, is `0.498834` at `s = 12`, inside a coin's own scatter | **there is no dilation structure to find** |
| what the board has at powers of two | `rightDiagonal_periodicFrom_pow` (period `2^k` *along* a diagonal), `leftDiagonal_periodicFrom_pow`, `centerColumn_eq_evolve_mul_pow`, `step_two_mul` | every one is a **translation** statement whose modulus happens to be a power of two, or a shift-equivariance. None relates `c(n)` to `c(2n)` |
| the seam | the kernel is a *dilation* orbit; the automaton is a *finite-state* reading of digits | a picture with a settling front moving at a constant speed has translation structure by construction and dilation structure by accident, and rule 30 has none by accident |

**What it leans on.** Theorem 1 as quoted in C2, and the kernel criterion as
quoted in C1. The implication `Theorem 1's hypothesis ⟹ P1` needs *neither*:
it is three lines of pigeonhole, and I give it here because it is what makes the
handoff in section 5 cheap. Suppose `c` has period `p > 0` from `N`. The powers
`2^i mod p` are eventually periodic, so there are `i < j` with `2^i ≡ 2^j
(mod p)` and `2^i ≥ N`. Then for every `n ≥ 1` both `2^i n` and `2^j n` are at
least `N` and are congruent mod `p`, so `c(2^i n) = c(2^j n)`; and at `n = 0`
both read `c(0)`. So the two decimations agree identically, and the orbit is
finite. **No automatic-sequence theory is used** — the theory is what tells you
this is the statement to try. That argument is **proved in Lean**,
`explorer/ephemeris_scratch_dilations.lean`, accepted by `lake env lean` with no
`sorry` and axioms `[propext, Classical.choice, Quot.sound]`; the load-bearing
step is that the pigeonhole must be run over the exponents *past the onset*, and
`explorer/ephemeris_scratch_mutant.lean` is the same proof with that one thing
removed, which Lean rejects at exactly that line.

**The test.** `explorer/ephemeris_kernel_orbit.mjs`, sections B, C and E; depth
`2^21`; five controls, all of which behave as the theory requires (three
automatic sequences collide, one periodic sequence collides, one pseudorandom
sequence does not). The statement a theorist should try to falsify, in the
project's own vocabulary and needing no new definitions:

> `∀ i j : ℕ, i < j → ∃ n : ℕ, centerColumn (2 ^ i * n) ≠ centerColumn (2 ^ j * n)`

A single pair `(i,j)` for which no `n` exists would make the centre column's
decimation orbit finite — which would not by itself make it automatic, but would
be the first dilation identity anyone has found in rule 30 and would be worth
more than this document. The cheap falsification is depth: I checked `i<j ≤ 15`
with `n ≤ 400`; a pair that survives to `n = 10^5` at `i,j ≤ 25` would be a real
signal.

**What it would give.** If the statement were *proved*, P1 falls. It touches the
whole residual and leaves nothing — which is the tell that it is at least as hard
as the prize, and it is. What it actually gives today is a vocabulary the board
does not have: every existing node is about `t ↦ t + p`, and this is the first
candidate about `t ↦ 2^e t`.

---

### C4. Running the machinery backwards is a live technique — it is a *reduction*, and rule 30 supplies none; the packed row shows exactly why

**Band: known** (the technique is two 2026 papers) **with a project-internal
verdict and one observation I have not seen made here**.

**The claim.** The brief asks whether the decision procedure, which runs on a
given automaton, can be run backwards against a sequence not known to be
automatic. The answer is **yes, and there is a 2026 instance**: Dhiman and
Pandey prove that the reachability relation of generalized Collatz maps is *not*
first-order definable in Büchi arithmetic. The technique is not asymptotic at
all — it is a **definability reduction**: assume the object is definable, use it
to *define* a set that Cobham's theorem forbids, contradiction. That is the
literature escaping the "one object, no instances" seam by interpretation rather
than by counting. It is available in principle for rule 30 and unavailable in
practice, for a reason the board's own packed-row vocabulary makes exact: **one
step of rule 30 is a 2-automatic function, and the centre column is a diagonal
read of its orbit — and diagonal reads are precisely what Büchi arithmetic
cannot perform.**

**The dictionary.**

| The Collatz result | The rule 30 analogue | Seam |
|---|---|---|
| `T_{q,d}(x)`, piecewise affine, one step | `rowStep r = (4r) XOR ((2r) OR r)`, one step on the packed row | both are definable: doubling is addition, and bitwise `XOR`/`OR` are recognisable by a two-track automaton, hence definable by Büchi–Bruyère |
| the *arbitrary-step* reachability relation `R(x,z)` | `{(t, rowNat t)}`, the orbit of the seed | the object whose definability is in question |
| proved: `R` is **not** definable in `⟨ℕ,+,V_q⟩` | **open, and not even stated here** | — |
| the proof: assume `R` definable, then define `{2^y}` (or `{q^y}`), contradict Cobham | assume the orbit definable, then define **what?** | **this is the missing ingredient, and it is the whole route** |
| what makes their reduction work: multiplication by `q` inside the map, so the orbit *contains* the powers of `q` in another base | rule 30's map is multiplication-free — its only arithmetic is `×2`, `×4`, `XOR`, `OR`, all base-2 automatic by construction | so every power-of-two structure the board owns (`2^k` diagonal periods, the doubling positions, `step_two_mul`) is **automatic in base 2 and can never be the contradiction** |
| their conclusion transfers to a family (all odd `q`, `d`) | rule 30 is one map | the seam Pantograph met in four fields, met again one rung lower |
| `c(t) = ` bit `t` of `rowNat t` (`centerColumn_eq_rowNat_testBit`) | a **diagonal read**: a value used as a position | `t ↦ 2^t` has no definition in `⟨ℕ,+,V_2⟩` — the graph `{(t, 2^t)}` is not recognisable, by pumping on base-2 pairs. **So even if the orbit relation were automatic, nothing would follow about the centre column** |
| the board's crystal 69 / Sextant's front argument: the centre column reads at bit-index speed 1, the settling front at `0.75`, so the read is permanently transient | the same fact in logic: the read mixes a value with a position | two vocabularies, one obstruction — recorded because the coincidence is exact and I did not expect it |

**What it leans on.** Dhiman and Pandey, *Non-Definability of Reachability in
Büchi Arithmetic for a Family of Generalized Collatz Maps*, fetched at
<https://arxiv.org/abs/2602.06066>, abstract verbatim: *"Let q ≥ 3 and d ≥ 1 be
odd integers with q+d a power of 2. We study the generalized Collatz map T_{q,d},
a one-dimensional piecewise-affine map on the positive integers, and its
unparameterized reachability relation R(x,z), which holds when z is an iterate of
x under T_{q,d}. We prove that for every such pair (q,d) the relation R is not
first-order definable in Büchi arithmetic ⟨ℕ, +, V_q⟩. Equivalently, no finite
automaton recognizes the base-q encoding of R. Assuming definability of R, we
construct a first-order formula that defines the set of powers of 2. Cobham's
theorem then rules out this set. The family includes the classical map T_{3,1}."*
The companion, <https://arxiv.org/abs/2601.12772> (*Logical Undefinability of the
Generalized Collatz Transition Relation in Büchi Arithmetic*), uses the same
move via the non-semilinearity of `P_q = {q^y}` and Cobham–Semenov. The
definability/automaton equivalence, fetched at
<https://en.wikipedia.org/wiki/B%C3%BCchi_arithmetic>: *"Büchi arithmetic of base
k is the first-order theory of the natural numbers with addition and the function
V_k(x) which is defined as the largest power of k dividing x"*, and a subset is
expressible in it *"if and only if it is k-recognizable"*; the theory *"is a
decidable theory"*. That `t ↦ 2^t` is not definable I did **not** fetch: it is a
one-line pumping argument on the language of pairs `(bin t, bin 2^t)`, whose
second component's single `1` sits at a position equal to the *value* of the
first. Marked as a derivation, not a citation.

**The test.** None run; this is a structural reading and I say so. The precise
statement a theorist should try to falsify, and it is the one that would open
the route: *there is a first-order formula over `(+, V_2, c)` defining a subset
of `ℕ` that is not 2-automatic* — for instance the squares, the primes, or
`{3^y}`. Any such formula proves `c` is not 2-automatic and hence proves P1. The
cheap way to attack it is to ask for the formula and watch it fail: everything
the board can say about `c` in arithmetic terms is either local (the rule, the
run bounds) or power-of-two-periodic, and both families are automatic.

**What it would give.** If a formula existed, P1 outright, from a decidability
theorem already in the literature — the cheapest route to the prize that anyone
has named. What remains is the formula, and I could not produce a candidate; I
record the technique because it is the only one in the whole census that is not
asymptotic, and because a connector who finds *any* arithmetic structure in the
centre column should come straight here.

---

### C5. The wall's own automatic analogue dies in the family, exactly as obstruction 9's periodic version does

**Band: project-internal.** The measurement of a rule 30 picture with a
Thue–Morse centre column is, as far as I could establish, new to this board;
what it establishes is that an existing obstruction survives a strengthening.

**The claim.** Replace "eventually periodic" by "2-automatic" everywhere in the
wall `centerColumn_other_isEventuallyPeriodic_of_center` and the statement is
*still* false in the family `X_b` — and now for **genuinely aperiodic** automatic
boundaries, not only for the degenerate periodic ones. Strengthening the wall to
the middle rung buys no escape from obstruction 9: the left cone is still the
only ingredient that separates the seed from a witness. The *sandwich* half does
transport, though, and cleanly: two **adjacent** automatic columns force every
column to their left to be automatic, because the board's `leftSolve` is
pointwise and Büchi definability is closed under shifts and Boolean
combinations. What has no automatic analogue is **Jen's theorem**, and the
reason is exact: Jen's proof needs a *common period*, and automaticity supplies
no common anything.

**The dictionary.**

| Obstruction 9's row | The 2-automatic version | Measured (depth `2^18`, `explorer/ephemeris_boundary.mjs`) |
|---|---|---|
| `X_b`: white at every `x ≥ 1` at time 0, centre column `b` (crystal 40) | same object | engine validated: `b = ` the seed's own centre column rebuilds the seed's columns 1, 2, 3 with **0 mismatches in 1,800 cells**, and `leftSolve` rebuilds column −1 with **0 mismatches in 599** |
| `b = (10)^∞` is periodic, hence **2-automatic** | Talus's own witness is already an automatic witness | column 1: kernel `6,420` of `8,191` possible, `p(32) ≥ 94`; column −1: `3,121` |
| `b = 1^∞` (obstruction 2's boundary) | automatic, and columns 1, 2 go constant | kernels `3, 3, 4, 5, 1` for columns 1, 2, 3, 5, −1 — **the analogue HOLDS here**, so the family splits into good and bad exactly as for periodic `b` |
| a genuinely aperiodic automatic `b` — **not previously tried** | Thue–Morse (kernel 2), paperfolding (4), period-doubling (4) | every measured column of every one of the three has a kernel in the **thousands**: Thue–Morse gives columns 1, 2, 3, 5, −1 kernels `6,583 / 8,094 / 8,181 / 8,189 / 4,015` and `p(32) ≥ 6,705` at column 1 |
| the seed itself, same instruments, same depth | — | every column `8,188`–`8,191` of `8,191`, all-distinct to level 12, `p(32) ≥ 131,037` of the `131,041` windows in the sample |
| the sandwich lemma `evolve_isEventuallyPeriodic_of_between` | **partially transports**: columns 0 and 1 both automatic ⟹ column −1 automatic, by `col(-1)(t) = b(t+1) XOR (b(t) OR col₁(t))` and closure of definability under shift and Boolean combination; induct leftward | a derivation from the Büchi–Bruyère quote, not measured |
| the same for a **non-adjacent** pair | **does not transport** | the periodic proof walks inward using a common period; nothing plays that role |
| Jen's theorem (`not_isEventuallyPeriodic_pair`) | **no automatic analogue is available** | its mechanism is: two periodic columns ⟹ a common period on every column to the left (`evolve_period_sub`) ⟹ the row is eventually spatially periodic (crystal 24) ⟹ a finite ring ⟹ contradiction with the left edge at speed 1. Automaticity gives each column a *finite* state count with **no uniform bound**: the product construction multiplies them at every step |
| so the wall's collapse to `¬P` | **the collapse argument does not run for the automatic version** | the periodic wall is *provably* equivalent to P1 because Jen forbids `P ∧ Q`; with no automatic Jen, the automatic wall is not provably equivalent to anything. That is **not** a claim that it is non-vacuous — it is vacuous exactly if `c` is not automatic, which is the open statement itself. What it means is only that the two-line collapse is unavailable, and it is moot anyway: the implication is false in the family |
| column −1 is always the least random of the columns measured | `column_succ_of_black`: at black times of `b`, `col(-1)(t) = ¬b(t+1)`, so half of it is a function of `b` alone | kernels `4,015` (TM) and `3,121` ((10)^∞) against `6,583` and `6,420` for column 1 — visible in the data and explained by a board theorem |

**Seams.** (i) I measured columns `−1, 1, 2, 3, 5`, not all columns, and since
the automatic sandwich does not reduce "some column `j`" to "column ±1", the
measurement does **not** establish that *no* column is automatic — it
establishes that the nearby ones are not, on the same evidence type this board
uses everywhere. (ii) Kernel counts are floors, not proofs; no finite
computation decides automaticity in either direction. (iii) `b = 1^∞` is a
counterexample to my own counterexample, so the good/bad split of obstruction 14
reappears here, unclassified, and I have nothing to add to it.

**What it leans on.** The board's own `evolveHalfRight` and `leftSolve`
semantics from `Rule30/Basic.lean`, reimplemented and validated against the seed;
the Büchi–Bruyère equivalence quoted in C4 for the closure properties; Eilenberg's
kernel criterion quoted in C1 for the instrument.

**The test.** `explorer/ephemeris_boundary.mjs`, whose section A validates the
half-line engine against the seed and validates the kernel instrument against
Thue–Morse (saturates at 2) and the paperfolding sequence (saturates at 4). The
statement to falsify: *for `b` the Thue–Morse sequence, some column of `X_b`
other than column 0 has a finite 2-kernel.* Cheap attack: run the kernel to
depth `2^22` on columns `−20 … 20` and look for one that saturates.

**What it would give.** It closes the strengthened route rather than opening
anything: a proof of the wall's automatic version cannot come from the boundary
alone, so it needs the left cone, which is obstruction 9's conclusion verbatim.
The board should read this as: **the middle rung inherits obstruction 9 whole.**

---

## 4. Died in translation

- **"Cobham's gap theorem is the technique — the primes are not automatic and
  the proof is a gap argument, so do the same to rule 30."** My first hour, and
  the natural first move. Dies on rule 30's *density*: the dichotomy's second
  branch is "gaps bounded infinitely often", which rule 30 satisfies with
  524,738 adjacent black pairs below `2^21`. The gap method is a tool for sparse
  supports — primes, squares, `{2^{n²}}` — and the centre column is the exact
  opposite. **The seam: the method's hypothesis is a property of the primes, not
  of hard sequences.**
- **"So refute branch A instead: show the black count is superlogarithmic."**
  Dies twice. It is unnecessary (branch B already saves the automatic sequence),
  and it is out of reach anyway: the board's only proved count bound is
  `centerColumnCount_ge_of_pow`, `count(5^n) ≥ n`, which is `Θ(log N)` — *on the
  automatic side of Cobham's own threshold*. And no sharpening of the run-bound
  tier escapes that, because a run bound of the form "length `< ca` at start `a`"
  gives one sign change per *multiplicative* window and therefore a logarithm;
  beating it needs an *additive* window, i.e. a run bound `o(a)`, which is a
  statement about the transient band (crystals A3).
- **"Schlage-Puchta's run lemma is the one that fits, because the board has just
  proved two run bounds."** It fits beautifully and buys nothing: its other
  hypothesis is "arbitrarily long runs", which this board already carries as
  `centerColumn_not_isEventuallyPeriodic_of_long_black_runs` and which implies P1
  in one line without any of the theory. I believed this was the session's find
  for about twenty minutes. **The lesson is the brief's own trap in a new
  costume: a technique whose input already implies the goal by a shorter route.**
- **"The irrational-frequency criterion is a real technique with real
  instances (Sturmian sequences), so it is worth pricing."** Priced: it is
  refuted by Prize 2. If the centre column's density is `1/2`, as this project
  conjectures and measures (`0.500292` at `2^21`), then the frequency is rational
  and the method is vacuous — and the same holds for every block, whose
  frequencies are conjecturally `2^{-|w|}`. **P2 and this route to P1 cannot both
  be useful, and that is a fact about the pair, not about our ignorance.**
- **"Non-automaticity has instances where P1 has none, so it is a better
  target."** My intended headline, and it is half false. The kernel does
  manufacture a family out of one object — that part is right and is C3. But P1
  has instances too: for each `(p, N)`, "period `p` from `N` fails" is a finite
  check with an exhibited witness. Both statements are `Π⁰₂` with `Σ⁰₁`
  instances, and both have a decidable bounded approximation ("no DFAO with
  `≤ N` states" / "no period `≤ P`"). **The instance families differ (dilations
  vs translations); the logical shape does not.** I wrote the stronger claim into
  this document's first draft and took it out.
- **"If the centre column is 2-automatic then the packed-row orbit is
  2-automatic, so transfer the Collatz undefinability proof."** Dies on the
  direction of the arrow and then on a second, better seam. One step of rule 30
  *is* automatic (`rowStep` is built from doubling and bitwise operations), which
  looked like the foothold; but `c(t)` is bit `t` of `rowNat t`, a *diagonal*
  read, and the graph of `t ↦ 2^t` is not recognisable, so no Büchi formula
  reaches the centre column from the row orbit at all. The automaticity of the
  step is therefore not a foothold but a warning: **every power-of-two structure
  rule 30 has is automatic in base 2 by construction, so none of it can ever be
  the contradiction the Collatz proof needs.**
- **"The centre column has no dilation structure — measure it and show the
  agreement rate is a coin."** True, and my first script said the best agreement
  of `c(2n)` with any shift `c(n+s)`, `s < 64`, was `0.000000` at `s = 0`. That
  number is not a finding; it is a maximum initialised at `0` compared against a
  target of `0.5`, so the loop could never improve on its own starting value.
  Fixed and rerun: `0.498834` at `s = 12`, inside a coin's own scatter. **This
  project's recorded failure mode, committed and caught inside one hour, and the
  tell was that a "perfect" result arrived without a control.**
- **"Rule 90 is the control for dilation structure."** Two of my three linear
  controls are worthless: rule 90's centre column is `1,0,0,0,…` and its column 1
  has density `0.0002`, so `c(2n) = c(n)` at rates `1.000000` and `0.999756` *for
  free* — a sparse sequence agrees with any decimation of itself almost
  everywhere. The honest control for an exact dilation identity is **Thue–Morse**,
  where `t(2n) = t(n)` at `1.000000` of `65,536` because it is a theorem, not
  because the sequence is empty. Recorded because the two look identical in the
  output.
- **"Walnut can be run against the centre column."** No, and the reason is worth
  writing down for the next reader rather than merely stating. Walnut decides
  first-order statements about a sequence *given by an automaton*; its input
  format is the automaton. There is no mode in which one supplies `2^21` terms.
  The only backwards-running procedures that exist are (i) "no DFAO with `≤ N`
  states", decidable for each `N` by enumeration and cheaply done by the kernel,
  and (ii) the definability reductions of C4. **The decision procedure is not
  withheld from us by an interface; it is a theorem about automata, and we have
  no automaton.**
- **"Cobham's two-base theorem gives a rigidity we can exploit."** Dead the way
  Parallax recorded it: the theorem constrains sequences that *are* automatic in
  two multiplicatively independent bases, and we cannot establish automaticity in
  one. Not re-attempted; I measured nothing here and record it so the next
  connector does not either.
- **"The Kolakoski sequence is the calibration — look up whether *its*
  non-automaticity is proved."** **UNVERIFIED.** I searched *"Kolakoski sequence
  not automatic proof open problem k-automatic"* and reached
  <https://en.wikipedia.org/wiki/Automatic_sequence> and the search index for
  several Kolakoski papers; nothing I fetched states either that it is known
  non-automatic or that the question is open. It matters because Kolakoski is the
  closest comparable object — explicit, trivially defined, conjecturally density
  `1/2`, no closed form — and if *its* non-automaticity is unproved then this
  rung is unreached even in the easiest available instance. A connector with an
  hour should settle it against Allouche–Shallit's book, Chapter 5 or 13.
- **"Instance-free lower bounds do exist: parity is not in AC⁰, and that is one
  explicit object."** The unlikely field, and it stays empty. The switching
  lemma is a structure theorem for the *class* plus a progress measure invariant
  under random restriction; the kernel is the restriction here, and I could not
  name a single property of the centre column that is (a) preserved by
  `n ↦ 2^e n + r` and (b) impossible for a finite automaton. Every candidate I
  wrote down — density, complexity, run length — is one of the census's own
  methods in disguise, and dies where they die. Recorded as a shape, not a route.
- **"Handing this over means formalising automatic sequences in Lean first."**
  My assumption for most of the session, and the reason I nearly did not write
  section 5 at all: the pinned Mathlib has no automatic-sequence API — no file in
  `Mathlib/` has `Automat` in its name, checked — the kernel criterion is
  Eilenberg's theorem, and building that tower is a project rather than a node.
  It is unnecessary. The sufficient condition the method delivers can be stated
  and proved with no automaticity anywhere in it — the automatic-sequence theory
  is what tells you *which* statement to write down, and then it leaves.
  Thirty lines, kernel-checked. **The general lesson for a connector here: a
  dictionary can be worth landing even when the field it comes from cannot be
  imported, provided the row it picks out is sayable on its own.**
- **Nothing died for lack of depth.** The two measurements here are `2^21` and
  `2^18` rows, both deliberately modest: every claim they support is a control
  for an argument, not a search for a phenomenon, and the one quantity that
  *would* reward depth — the state floor — grows only like `depth / log depth`
  and is Parallax's to push, not mine.

---

## 5. What to hand the theorist

**Topic 1: `centerColumn_not_isEventuallyPeriodic_of_dilations`, which is
already written and already kernel-checked, so what is being handed over is a
decision rather than a task.**

> `(∀ i j : ℕ, i < j → ∃ n : ℕ, centerColumn (2 ^ i * n) ≠ centerColumn (2 ^ j * n))`
> `→ ¬ IsEventuallyPeriodic centerColumn`

*The band, first, because the seeder should not be sold anything.* **Nothing**:
the implication is true of every `ℕ → Bool` sequence — nothing in the proof
mentions rule 30 — exactly like
`centerColumn_not_isEventuallyPeriodic_of_long_black_runs`, and a mathematician
would not call it a result. *Its status:* proved, in
`explorer/ephemeris_scratch_dilations.lean`, accepted by `lake env lean`, axioms
`[propext, Classical.choice, Quot.sound]`, about thirty lines: `residue` (the
column is constant on residues mod `p` past the onset) plus
`Finite.exists_ne_map_eq_of_infinite` applied to `k ↦ 2^(N+k) mod p`. So the
decision for a captain and a seeder is **whether the board wants it**, not
whether anyone can do it; and the honest case against is the band. *The case
for:* it is the only statement in this whole vantage whose hypothesis the board
can *check*, it is the exact hypothesis of the one literature method that
survives the census (C2), and it introduces the one vocabulary the board does
not have — every existing node is about `t ↦ t + p`, this is about
`t ↦ 2^e t`. *The claim to falsify, which is the real work:* that the hypothesis
is false — a pair `i < j` whose decimations agree identically. That would be the
first dilation identity anyone has found in rule 30 and is worth more than the
negative this document delivers. *The depth reached:* every pair `i < j ≤ 15`
distinct with largest witness `n = 6`, and all `2^e` progressions pairwise
distinct for every `e ≤ 14` (`explorer/ephemeris_kernel_orbit.mjs`, depth
`2^21`). *Size, if seeded:* `S`. *One warning for whoever lands it:* the proof
turns on running the pigeonhole over exponents **past the onset** `N`, which is
easy to drop and which nothing else in the argument recovers;
`explorer/ephemeris_scratch_mutant.lean` is that exact omission and Lean rejects
it at that line.

**Topic 2, smaller, and it is an adjudication rather than a proof.** Decide
whether the board wants the census's verdict written down as an obstruction, in
this form: *no proposal whose route to P1 runs through the non-automaticity of
the centre column via letter or block frequencies, gaps, runs, Dirichlet series,
morphisms or dynamical spectra can work* — with the two sharp reasons attached,
that the frequency methods are refuted by **Prize 2's own statement** and the gap
methods by rule 30's **density** (`liminf` gap `= 1`, 524,738 witnesses below
`2^21`). *The dictionary row it depends on:* C2's table, every row of which names
its required input. *What settles it:* a captain reading the table; no
computation is outstanding. I raise it because the frequency row is the kind of
incompatibility a seeder would otherwise rediscover, and because the run row
would otherwise look like a natural successor to the P2 tier that closed
yesterday — it is not, it is that tier's hypothesis with an extra condition
bolted on.

*Not handed over:* C4's definability reduction. It is the only non-asymptotic
technique in existence and I could not produce a candidate formula; a theorist
sent at it would spend a session looking for arithmetic structure in a sequence
that every measurement on this board says has none. It is here so that the next
connector who *does* find arithmetic structure knows where to take it.

---

## 6. Next vantage

**The ergodic theory and spectral theory of the subshift generated by the centre
column — specifically, the orbit closure of `c` under the shift, and whether it
carries an invariant measure anyone can name.** Four of the nine methods in the
census (the frequency criteria, the morphic-eigenvalue criterion, the dynamical
approach of Müllner–Yassawi, and the orbit-property method) all ask for the same
missing object: *some* description of the dynamical system `(X_c, σ)` where `X_c`
is the closure of the shifts of the centre column. This board has never described
it. It has described the settled region, the transient band, the damage front and
the diagonal orbit — every one of them a statement about the *picture* — and
never once the subshift of the column itself. That object is where factor
complexity, letter frequency, unique ergodicity and the spectrum all live at
once, so a single description of it would price four census rows simultaneously;
and P2, which asserts a frequency, is literally a statement about an invariant
measure on it. The connector who takes this should be handed the board's own
run bounds (`centerColumn_black_run_lt_start`, `centerColumn_white_run_lt_start`)
as the only proved constraints on which words can appear, and warned that the
seed's column is a single point and a subshift is a closed set, so the first
question — *is `X_c` minimal, or does it contain the all-white point?* — may
already be equivalent to something on the wall.

The vantage I could not reach from where I stood is **the theory of `k`-regular
and `q`-Mahler sequences read at the level of the whole two-dimensional
picture**. Everything in this document, and in Parallax's, treats the centre
column as a one-dimensional sequence and asks whether a one-dimensional automaton
generates it; but rule 30's picture is a two-dimensional object, and there is a
developed theory of two-dimensional `k`-automatic arrays in which the linear
rules' Pascal-triangle pictures are the standard examples. The right question may
not be "is the column automatic" but "is the *picture* 2-automatic as an array",
which is a statement the rule itself might constrain — the rule is a local law on
the array, and a local law is exactly the kind of thing a two-dimensional
automaton can check. I could not test whether a two-dimensional non-automaticity
criterion exists at all; the survey I found is one-dimensional throughout, and
one hour of searching for its two-dimensional counterpart produced nothing I was
willing to cite.
