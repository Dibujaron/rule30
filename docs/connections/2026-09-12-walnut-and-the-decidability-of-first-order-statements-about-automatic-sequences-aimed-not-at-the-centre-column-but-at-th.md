# Walnut and the decidability of first-order statements about automatic sequences, aimed at the settled region rather than the centre column

*A sighting. Waywiser, 2026-09-12. Vantage: the Büchi–Bruyère decision
procedure for `k`-automatic sequences, as implemented in Walnut, aimed at the
objects the board has already proved are periodic — the left diagonals, their
onsets, their periods, the settled words, and Rowland's `a(n)` — and in
particular at the two walled nodes about them, `leftDiagonal_onset_le` and
`leftDiagonal_period_le`.*

*Not about the centre column. Ephemeris closed that on 2026-09-11 and crystal 73
excluded it by measurement; this document reproduces the measurement once, as a
control for its own instrument, and otherwise leaves it alone.*

**The band, first.** **Project-internal.** Nothing here is a new fact about
rule 30. What it does is close a route with two named theorems instead of a
shrug, price the whole "automatic" family once, and record why the cheapest
result this vantage could have produced would also have been one the project's
own stated goal does not want.

**The answer in one line, because it is a negative and the brief says to say so
plainly.** Both walls are single first-order sentences and Walnut would decide
them outright — *given an automaton for the left-diagonal array*. There is no
such automaton, and the obstruction is not that nobody has looked: the set of
depths at which the left-diagonal period doubles is `3, 8, 29, 400, 87867,
2107985255`, whose base-2 representations have **lengths `2, 4, 5, 9, 17, 31`**,
and a regular language's length set cannot have gaps that grow. The tool's
hypothesis and the wall's subject matter are the same object read from opposite
sides. **The seam, said here rather than buried:** that those gaps go on growing
is measured to six terms and is the board's own recorded heuristic, not a
theorem, and proving it is strictly stronger than the wall — so §3.2 carries a
second argument that needs no growth law at all, and §3.3 disposes of the onset
wall separately. **And the vantage's premise does not survive either:** the
settled region is not a haven away from the centre column, because
`leftDiagonal t 0` *is* the centre column, so any automaton for the array is an
automaton for the column.

---

## 1. The problem, seen from outside

A two-dimensional array of black and white cells is grown downward from a single
black cell on an otherwise white row: the colour of a cell is a fixed function of
the three cells above it (left, above, right), namely *left XOR (above OR
right)*. Read the column directly below the starting cell. It is a specific,
explicitly computable infinite bit sequence, and **the question is whether it is
eventually periodic** — whether from some point on it repeats with a fixed
period. Measured to ten million terms it does not, and nothing in print proves it
does not. What is granted is that no *two* distinct columns can both be
eventually periodic; the residual, once that is granted, is logically equivalent
to the aperiodicity of the one column, so the residual and the prize are the same
statement in different clothes.

**Restated in this vantage's own terms.** A sequence over a finite alphabet is
`k`-automatic when some finite automaton, reading the base-`k` digits of `n`,
outputs the `n`-th term. Büchi's theorem makes the first-order theory of
`⟨ℕ, +, V_k⟩` — addition together with the function returning the largest power
of `k` dividing `n` — decidable, and makes "definable in that structure" and
"`k`-recognizable" the same thing. So every first-order property of a
`k`-automatic sequence, eventual periodicity included, is decided by a
terminating algorithm, and Walnut is that algorithm. In this language the prize
reads: **the centre column is an explicitly given sequence for which no automaton
is known, and the decision procedure is not withheld from us by an interface but
by the absence of its input.**

The objects *around* the column are a different matter, and are this document's
target. The diagonals of the picture are eventually periodic with periods that
are powers of two — exactly the shape the theory is about — and the board's two
walled statements about them are one sentence each:

- `leftDiagonal_onset_le`: for every `k`, the `k`-th left diagonal repeats from
  index `k` at the latest (*some* positive period; the period is not
  constrained).
- `leftDiagonal_period_le`: for every `k`, the `k`-th left diagonal has some
  eventual period `p ≤ k + 1`.

Both are `Π⁰₂` as stated and both are *finite-state-shaped*: quantify a period,
quantify an onset, compare the array to a shift of itself. A reader from
automata theory would say at once that these are decidable given an automaton,
and would then ask for the automaton. The rest of this document is that question
and its answer.

---

## 2. Fields sighted

| Field / theory | The object there | The seam, in one line |
|---|---|---|
| Büchi arithmetic and `k`-recognizable sets | the left-diagonal array `A(k,j)` as a 2-recognizable subset of `ℕ²`; both walls as sentences of `⟨ℕ,+,V_2,A⟩` | the sentences are one line each; the array is not automatic, so there is nothing to run them against — §3.1, §3.2 |
| Walnut (Mousavi, Shallit) | `leftDiagonal_onset_le` and `leftDiagonal_period_le` as `eval` commands | Walnut's input *is* an automaton; handing it `8,000` measured onsets is not a mode it has — §3.1 |
| Cobham's gap theorem | the doubling depths as the positions of a letter | vacuous here, and this is the trap: the doublings are so sparse that the theorem's first branch (prefix count `O(log n)`) holds and the theorem says nothing — §4 |
| Regular languages, length sets, the pumping lemma | base-2 representations of the doubling depths | a regular language's length set has eventually bounded gaps; these lengths are `2, 4, 5, 9, 17, 31` — §3.2 |
| Cobham's growth dichotomy for automatic sets | the counting function of the doubling depths | an automatic set counts like `c·log^r N` or like `N^α`; this one counts like `log log N` — §3.2 |
| Synchronized sequences (Carpi–Maggi; Shallit) | the onset function `k ↦ o(k)` as the graph `{(k, o(k))}` | synchronization forces `o(k) = O(k)`, which is **true** here — the one row that does not break on growth, and the only live route in the document — §3.3 |
| Non-standard numeration systems (Fibonacci, Ostrowski, Bertrand) | a base in which the doubling depths *would* be recognizable | a decision procedure needs addition recognizable in that base, which forces a linear recurrence, which a doubly-exponential base sequence has not — §3.4 |
| Regular model checking (Bouajjani–Jonsson–Nilsson–Touili) | settled words as words, the diagonal recurrence as a length-preserving transducer, the walls as safety properties | this is the field with the right *shape*; its decidable cases want the transitive closure to be a regular relation, which is exactly what §3.2 denies — §3.5 |
| Automatic structures (Khoussainov–Nerode) | the picture as an automatic presentation of a dynamical system | one step of rule 30 **is** a four-state transducer; an orbit of a transducer is not a transducer, and the gap between those two sentences is the whole problem — §3.5 |
| `k`-regular sequences (Allouche–Shallit) | the unbounded quantities `P(k)`, `o(k)`, `a(n)` | `k`-regular tolerates unbounded values but forces polynomial growth; `a_n ≈ 2^{2^{n-1}}` is not polynomially bounded — §4 |
| Honkala's decision procedure for ultimate periodicity | P1 itself, if an automaton for the column existed | it would decide all three prizes at once — which is the correct price of an automaton, and the correct measure of how unlikely one is — §3.1 |
| Presburger arithmetic / semilinear sets | the onset function if it were eventually quasi-linear | dies at the cheapest depth: `o` is not `⌊k/3⌋ + c` — §4 |
| Two-dimensional automatic arrays | rule 30's picture as an array, the way Pascal's triangle mod 2 is | the linear rules' pictures are automatic and rule 30's is not; this is the vantage Ephemeris named at the end of its §6 and could not reach, and §3.2 answers it |
| Subword complexity of automatic sequences | the settled words' factor counts | automatic implies complexity `O(n)`; the settled words are *periodic*, so their complexity is bounded and every complexity criterion is vacuous on precisely the objects this vantage was aimed at |
| Arithmetic hierarchy / reverse mathematics | the walls as `Π⁰₂` statements | decidability of a *theory* is not decidability of a *statement*: there is no decidable theory this board can instantiate that contains either wall |

---

## 3. Connections

### 3.1 Both walls are one-line queries, and the whole distance between this board and two closed nodes is one automaton

**The claim.** `leftDiagonal_onset_le` and `leftDiagonal_period_le` are single
first-order sentences over the left-diagonal array in Büchi arithmetic base 2;
if anyone exhibits a DFAO computing that array, Walnut decides both in minutes,
with no new mathematics and no Lean, and two of the board's four walls fall to a
tool rather than to a proof.

**The dictionary.**

| Rule 30, as the board has it | In Büchi arithmetic base 2 / Walnut |
|---|---|
| the picture `evolve t x` | a 2-dimensional automatic word, one automaton reading both coordinates' base-2 digits in parallel |
| the left diagonal `leftDiagonal k j = evolve (j+k) (-j)` | `LD[k][j]`, a definable re-indexing — and in the packed row it is literally *bit `k` of `rowNat (j+k)`* (`leftDiagonal_eq_rowNat_testBit`, closed) |
| "diagonal `k` has eventual period `p`" | `En Aj (j>=n) => LD[k][j+p]=LD[k][j]` |
| the onset `o(k)` | the least `n` for which that holds, a definable function of `k` |
| the minimal eventual period `P(k)` | the least such `p`, a definable function of `k` |
| `leftDiagonal_onset_le` | `eval onsetwall "?msd_2 Ak Ep,n (p>=1) & (n<=k) & (Aj (j>=n) => LD[k][j+p]=LD[k][j])":` |
| `leftDiagonal_period_le` | `eval periodwall "?msd_2 Ak Ep,n (p>=1) & (p<=k+1) & (Aj (j>=n) => LD[k][j+p]=LD[k][j])":` |
| "the period is a power of two" | `V_2(p)=p`, a primitive of the structure |
| the settled words `S_k` | the tails of the rows of `LD`, definable |
| Rowland's `a(n)`, the right-diagonal doubling depths | a definable subset of `ℕ`, given an automaton for the right-diagonal array |
| **the centre column** | `LD[t][0]` — `leftDiagonal t 0 = evolve t 0` by definition, which is obstruction 1's opening sentence |
| P1 | "is `LD[t][0]` ultimately periodic", decidable by Honkala given the automaton |
| **seam** | the array. Every row above is a translation; none of them is an automaton, and §3.2 says none exists |
| **seam** | the centre-column row is the one that prices the whole thing: a section of a recognizable relation is recognizable, so *any* automaton for the left-diagonal array is an automaton for the centre column. The vantage's hope was that the settled region is a safe automatic haven away from the column. It is not a haven; the column is its index-zero column |

**What it leans on.**

- Büchi–Bruyère, fetched from
  <https://en.wikipedia.org/wiki/B%C3%BCchi_arithmetic>: *"A subset X ⊆ N^n is
  definable in Büchi arithmetic of base k if and only if it is k-recognisable."*
  and *"Unlike Peano arithmetic, Büchi arithmetic is a decidable theory."*
- Walnut's own manual, fetched from
  <https://ar5iv.labs.arxiv.org/html/1603.06017> (Mousavi, *Automatic Theorem
  Proving in Walnut*): Walnut is *"a software package that implements a
  mechanical decision procedure for deciding certain combinatorial properties of
  some special words referred to as automatic words or automatic sequences"*;
  and on the multi-dimensional case, *"The (n-dimensional) automatic word
  W=(a_{i₁,i₂,…,iₙ}) … for which there exist number systems S_j and an automaton
  with output"*, with *"For an n-dimensional automatic word W, an indexing
  expression is W[e₁][e₂]⋯[eₙ] where the eᵢ are either arithmetic expressions or
  predicates with one free variable."* So the two-variable array is inside the
  tool's stated scope, not an extension of it.
- Honkala's theorem, fetched from
  <https://ar5iv.labs.arxiv.org/html/1102.3698> (Charlier–Rampersad–Shallit,
  *Enumeration and Decidable Properties of Automatic Sequences*): *"Honkala [23]
  showed that, given an automaton, it is decidable if the sequence it generates is
  ultimately periodic."* Note the phrase *given an automaton* — it is the
  hypothesis of this entire document.
- That the letter frequencies of an automatic sequence are rational when they
  exist: **UNVERIFIED.** I searched *"Cobham frequency of a letter in an automatic
  sequence is rational when it exists computable"* and got only a summary —
  *"Frequencies of symbols in automatic sequences, if they exist, are rational"* —
  attributed to Cobham, with no full text fetched. It is used only in the P2
  remark below and nothing else rests on it.

**The test.** Two, and the first is cheap. *(i)* A theorist can check that the
two `eval` lines above are well-formed sentences of the logic — that no
quantifier in either wall ranges over anything but naturals and no predicate
appears but `LD`, `+`, `≤` and `V_2`. If either wall needed a quantifier over
*sets*, or over periods that are not naturals, this whole connection is void.
*(ii)* The falsifying object is an automaton: exhibit a DFAO with `LD[k][j]` equal
to `leftDiagonal k j` for all `k, j`, of any size, and this connection becomes a
route instead of a sighting. §3.2 is the argument that no such object exists.

**What it would give.** Both left-diagonal walls at once, and — the part worth
saying because it prices the whole family — an automaton for the *centre column*
would decide all three prizes: P1 by Honkala (verified above), P2 because the
letter frequencies of an automatic sequence are rational when they exist
(**UNVERIFIED**, above), and P3 in any formalisation at or below the finite-state
level (my own 2026-09-12 fence, from the effective-randomness vantage).
**That is the correct measure of how much an automaton is worth here, and
therefore of how unlikely one is.**

---

### 3.2 The left-diagonal array is not 2-automatic, and the reason is the period wall's own subject matter

**The claim.** No DFAO computes the left-diagonal array, and no DFAO computes the
minimal-period function `P(k)`, because either would make the set of
period-doubling depths a 2-recognizable infinite set — and a 2-recognizable
infinite set has consecutive ratios bounded and a counting function that is
`c·log^r N` or `N^α`, whereas rule 30's doubling depths are `3, 8, 29, 400,
87867, 2107985255`, with ratios `2.67, 3.63, 13.79, 219.67, 2.40·10⁴` and a
counting function of order `log log N`.

**The dictionary.**

| Rule 30 | Automata theory |
|---|---|
| `P(k)`, the minimal eventual period of left diagonal `k` | a definable function `ℕ → ℕ` if the array is automatic |
| `M(k) = max_{j≤k} P(j)`, the published "period at depth `k`" (`1,2,4,8,16,32`) | a definable nondecreasing function |
| `D = { k : M(k) > M(k-1) }`, the doubling depths | a 2-recognizable subset of `ℕ` |
| `D` is infinite | the board's **proved** `leftDiagonal_period_unbounded` — this is the hypothesis that makes the criteria apply, and the board supplies it |
| the `n`-th doubling depth `D_n` (written `D` to keep it clear of Rowland's `a(n)`, which is the **right** diagonals' and behaves entirely differently) | the `n`-th element of a `k`-recognizable set |
| base-2 representations of `D_n` | words of a regular language; their lengths are `2, 4, 5, 9, 17, 31` |
| the measured growth `D_n ≈ 2^{2^{n-1}}` (obstruction 7: the gap after a doubling is `1.000·2^L`) | length gaps `1, 2, 4, 8, 16, …` — the canonical *non*-ultimately-periodic length set |
| `leftDiagonal_period_le` itself, `P(k) ≤ k+1` | **exactly** `D_n ≥ 2^n − 1`, an *upper* bound `count_D(N) ≲ log₂ N` on the counting function |
| **seam** | the wall and automaticity are *compatible*: `count ≍ log N` is the `r=1` branch of the dichotomy. What refutes automaticity is not the wall but the measured *super*-geometric growth, and proving that is strictly stronger than the wall |
| **seam** | the doubling depths past `400` are not this board's measurements: `87867` and `2107985255` are NKS p. 871, reproduced from the recurrence alone (crystal 55, `explorer/orbit32.mjs`). Six terms is six terms |

**The cheap argument first, and why I do not lead with it.** `leftDiagonal t 0 =
evolve t 0` is the centre column by definition — obstruction 1's opening sentence
— and a section of a 2-recognizable relation is 2-recognizable. So an automaton
for the left-diagonal array *is* an automaton for the centre column, and crystal
73's measurement closes the matter in one line. I do not lead with it for two
reasons. It routes through the column, which this vantage was told not to
return; and it inherits crystal 73's epistemic status, so it says nothing the
board did not already have. **The argument below routes nowhere near the column
and is the actual deliverable.** But the cheap argument is worth stating once,
because it answers the vantage's premise directly: the settled region was hoped
to be a safe automatic haven *away* from the column, and it is not a haven — the
column is its index-zero column, on the left exactly as obstruction 20 found it
on the right.

**The lemma, in full, because it is elementary and a reader should not have to
take it on trust.** *If `S ⊆ ℕ` is infinite and 2-recognizable, then
`limsup s_{n+1}/s_n < ∞`.* Let `L` be the language of base-2 representations of
`S` (no leading zeros); it is regular, with pumping length `P`. By the pumping
lemma — fetched verbatim from
<https://en.wikipedia.org/wiki/Pumping_lemma_for_regular_languages>: *"Let L be a
regular language. Then there exists an integer p ≥ 1 depending only on L such
that every string w in L of length at least p can be written as w = xyz
satisfying the following conditions: 1. |y| ≥ 1, 2. |xy| ≤ p, 3. (∀ n ≥ 0)
(xy^n z ∈ L)"* — every word of `L` of length `ℓ ≥ P` gives words of length
`ℓ + m` for some `1 ≤ m ≤ P`. So beyond `P` the set of lengths of `L` has gaps at
most `P`. Now take consecutive `s_n < s_{n+1}` with bit-lengths `ℓ ≤ ℓ'`; no
length strictly between them occurs in `L` (a word of such a length would be an
element of `S` strictly between them), so `ℓ' ≤ ℓ + P`, and
`s_{n+1} < 2^{ℓ'} ≤ 2^{P}·2^{ℓ} ≤ 2^{P+1} s_n`. ∎

**The second criterion, from the literature, which says the same thing about the
counting function.** Fetched from <https://ar5iv.labs.arxiv.org/html/1705.08979>
(Byszewski–Konieczny), Proposition 3.3, attributed to Cobham 1972: for a
non-empty automatic set `E`, either *"There exists an integer r≥0 and a real
number c>0 such that lim_{N→∞} |E∩[N]|/log^r(N)=c"*, or there is `α>0` with
`|E∩[N]|/N^α → ∞`. For `D`: the polynomial branch is out (six elements below
`2^31`), the `r=0` branch says `D` is finite and `leftDiagonal_period_unbounded`
forbids that, and every `r ≥ 1` needs `count ≥ c log N` while the measured growth
gives `count ≈ log₂log₂ N`. **Both criteria fail, independently, at the same
place.**

**The test.** Run. `node explorer/waywiser_onset.mjs` streams `13,000` rows of
the packed row model (bit `k` of `rowNat t` is left diagonal `k`, the board's
closed `leftDiagonal_eq_rowNat_testBit`; cross-checked against the repo's BigInt
engine, **0 mismatches over 200 rows × every cell**) and recovers the steps of
`max_{j≤k} P(j)` at exactly `0, 3, 8, 29, 400` for `k ≤ 8000` — NKS p. 871's list
in the range reachable. `node explorer/waywiser_lengths.mjs` prints the bit
lengths, length gaps and ratios beside four controls: `{2^n}` (recognizable,
ratio exactly 2, length gaps exactly 1), `{2^{n²}}` (the classical
non-recognizable witness, length gaps `1,3,5,7,9`), `{n ≡ 0 mod 3}`
(recognizable, ratio → 1), and Rowland's right-diagonal `a(n)` (ratio → 1, every
length occupied — **this criterion does not refute `a(n)`**, see §4). *What would
kill this connection:* a proof that the doubling gaps have bounded ratio, or a
seventh doubling depth below `2^{40}`, either of which would make the length set
look ultimately periodic after all. The honest statement of the seam is in the
script's own last block: six terms are consistent with an ultimately periodic
length set of period `≥ 14`, and what rules that out is the growth law, which is
measured and not proved.

**A second test, independent of the growth law.** The argument above needs
`D_n ≈ 2^{2^{n-1}}`, which is measured to six terms. This one needs no growth law
at all — the trade is that it is *evidence* where the first is a *criterion*, since
a saturating 2-kernel bounds an automaton's state count from below and never
refutes outright. If the array is 2-automatic then
`u(k) = min(log₂ P(k), 4)` is a definable function with a **finite** range, hence
a 2-automatic *sequence*, and so is the characteristic sequence of
`{k : P(k) = 1}` — the eventually-constant diagonals. Both are measurable to
`k = 8000` and both have finite 2-kernels if the array is automatic. Measured
(same script), with every row printed beside a **shuffle of itself**, same
letters, same multiplicities, no structure, because a nearly-constant or nearly-
all-zero sequence collides with its own decimations for free and a saturating
count means nothing without that control:

| sequence | distinct kernel elements at `e ≤ 0..7` | its own shuffle |
|---|---|---|
| `[P(k) = 1]`, eventually-constant diagonals | `1, 3, 7, 12, 14, 17, 20, 30` | `1, 1, 1, 1, 2, 6, 15, 31` |
| `d(k) = o(k+1) − o(k)` | `1, 3, 7, 15, 31, 63, 127, 255` | `1, 3, 7, 15, 31, 63, 127, 255` |
| Thue–Morse | `1, 2, 2, 2, 2, 2, 2, 2` | `1, 3, 7, 15, 31, 63, 127, 255` |
| period-doubling | `1, 3, 4, 4, 4, 4, 4, 4` | `…, 255` |
| regular paperfolding | `1, 2, 4, 4, 4, 4, 4, 4` | `…, 255` |
| `min(log₂ P(k), 4)` | `1, 3, 7, 15, 31, 55, 88, 129` | `1, 3, 7, 12, 25, 56, 111, 210` |

The three genuine automatic sequences stop at `2`, `4`, `4` while their shuffles
run to `255`, so the instrument has power. `[P(k) = 1]` reaches `30` against its
shuffle's `31` — **indistinguishable from a structureless set of the same
density**. `min(log₂ P(k), 4)` is the one row with power problems and I read it
as nothing: over `400 ≤ k ≤ 8000` it is the constant `4` except at 88 places, so
it is nearly constant, and its sitting *below* its shuffle (`129` against `210`)
measures that the deviations are clustered, not that they are automatic.

**What it would give.** It gives a fence rather than a route: it closes the
Walnut approach to `leftDiagonal_period_le` permanently, and it answers, in the
negative, the two-dimensional-array question Ephemeris left at the end of its §6
("is the *picture* 2-automatic as an array"). What remains untouched is
everything about the transient band, which is where the walls' difficulty
actually lives.

---

### 3.3 The onset wall survives every growth test — and dies on a 2-kernel

**The claim.** `leftDiagonal_onset_le` is the one statement in this vantage whose
automatic hypothesis is not refuted by any growth criterion: the onset function
grows linearly, with a slope `0.3369` that is exactly the board's own seam speed
read along a diagonal, and linear growth with a rational slope is what
synchronization requires. It needs no automaton for the whole
array — only for the graph `{(k, o(k))}` — and Walnut then decides the wall in
one line. It dies anyway, at a different seam: a synchronized `o` forces the
bounded difference sequence `d(k) = o(k+1) − o(k)` to have a **finite** 2-kernel,
and the measured kernel of `d` does not stabilise — it grows exactly as a
structureless shuffle of the same letters does, while three genuine automatic
sequences stop at two, four and four.

**The dictionary.**

| Rule 30 | Synchronized sequences |
|---|---|
| the onset `o(k)` = least `N` such that diagonal `k` is `p`-periodic from `N` for *some* `p` | a function `ℕ → ℕ` |
| `{(k, o(k))}` recognized by a DFA reading both in base 2 | `o` is 2-synchronized |
| `leftDiagonal_onset_le` | `Ak Eo O[k][o] => o<=k` — one Walnut line, decided in seconds |
| measured `o(k)/k = 0.3369` at `k = 8000`, worst `0.4792` over `k ≥ 20` | synchronization forces `o(k) = O(k)`: **satisfied** |
| the slope | the seam speed read along a diagonal. A cell `(t, x)` sits on diagonal `k = t + x` at index `j = −x`, so a seam at `x = −s·t` gives `o/k → s/(1−s)`. The board's seam is `s = 0.252` (obstruction 4), giving `0.337`; measured here, `o(k)/k = 0.3369` at `k = 8000`. Wolfram's predicted `s = 1/4` would give exactly `1/3`. **Either way the limit is rational-looking, which is what a synchronized function with a limit must have — this test passes.** |
| `d(k) = o(k+1) − o(k)`, measured range `[−13, 16]`, 30 distinct values | a sequence over a finite alphabet, definable from `{(k,o(k))}`, hence **2-automatic** if `o` is synchronized |
| **seam** | measured 2-kernel of `d`: `1, 3, 7, 15, 31, 63, 127, 255` at `e ≤ 0..7` — every subsequence distinct, **equal to its own shuffle's counts term for term**, against Thue–Morse `2`, period-doubling `4`, paperfolding `4`, all three of whose shuffles run to `255` |
| **seam** | full saturation cannot *prove* non-automaticity: an automatic sequence with more than `255` kernel elements would look identical. It bounds the state count from below, it does not refute |
| **seam** | the measured `o` minimises over power-of-two periods up to `64` only. Every eventual period is a multiple of the minimal one, which is a power of two, but a non-power-of-two multiple could in principle repeat from an earlier index and was not tested — so the measured `o` is an **upper bound** for the true onset. That is the harmless direction for the wall (`o ≤ k`) and the awkward direction for the kernel test, which is testing a proxy |

**What it leans on.** The definition and the growth bound, fetched from
<https://ar5iv.labs.arxiv.org/html/1206.5352> (Shallit, *Subword Complexity and
k-Synchronization*): *"A sequence (f(n))_{n≥0} is k-synchronized if there is a
deterministic finite automaton M accepting the base-k representation of the graph
of f, namely {(n,f(n))_k : n≥0}"*, and *"f(n) = O(n)"* as the growth bound that
follows from reading both representations in parallel. The notion is Carpi and
Maggi's (2001).

**The test.** `node explorer/waywiser_onset.mjs`, already run: `8,000`
diagonals, `13,000` rows, `8` cycles of tail required before a period is
believed, every kernel row printed beside a shuffle of itself. Four automatic
controls, and the centre column as a fifth — it also saturates fully,
reproducing Ephemeris's and crystal 73's verdict from an instrument built for a
different purpose, which is the only reason to include it. *What would kill this
connection:* a DFA for `{(k, o(k))}`, or a proof that `d` is 2-automatic with a
large kernel. *The honest depth:* `k ≤ 8000` and `e ≤ 7`; the subsequences at
`e = 7` are `62` terms each and are compared on `40`.

**What it would give.** This was the live one. It would close
`leftDiagonal_onset_le` — the wall whose own docstring says the measured onset is
below `k/2` for every `k ≤ 722` and that nothing between `2^k` and `k` is proved
by anyone — without proving anything about the transient band at all. **What
would have to be proved first, named as the brief asks:** that `o` is
2-synchronized, i.e. exhibit a DFA for `{(k, o(k))}` *and prove it computes the
onset*, which is a theorem about which cell of the transient band is the last
one — precisely what crystals A3 prices as unavailable. The measurement says the
DFA does not exist; the fence says that even if it did, verifying it is the wall
in another vocabulary.

---

### 3.4 Changing the numeration system does not save it

**The claim.** The obvious escape from §3.2 — "the lengths double *in base 2*;
use a base in which the doubling depths are the digits" — is blocked in general,
because a decision procedure in a numeration system needs the addition relation
to be recognizable in that system, and that forces the base sequence to satisfy a
linear recurrence, which a doubly-exponential sequence does not.

**The dictionary.**

| Rule 30 | Numeration systems |
|---|---|
| the left doubling depths `D_n ≈ 2^{2^{n-1}}` | a candidate base sequence `U_n` |
| "in base `U`, `D` is the set `{10^n}`" | trivially recognizable — this is the escape |
| Walnut's `?msd_fib`, `?msd_trib`, Ostrowski systems | the bases in which Walnut actually decides things |
| what Walnut needs of a base | a regular language of representations **and a recognizable addition relation** — its own manual says every predicate is built from *"the automata for valid representations, addition, equality, and less-than"* |
| **seam** | Shallit's theorem: regularity of the representation language forces `U` to satisfy a linear recurrence. `U_n = 2^{2^{n-1}}` satisfies none, since `U_{n+1} = U_n²` |
| **seam** | and even granting the base, the *array* would have to be automatic in it, which is a stronger demand than `D` being recognizable |

**What it leans on.** **UNVERIFIED.** The reference is real and I fetched it in a
bibliography — Shallit, *Numeration systems, linear recurrences, and regular
sets*, Inform. and Comput. **113**(2), 331–347 (1994), seen verbatim as entry
[16] of <https://ar5iv.labs.arxiv.org/html/2202.04938>. The *statement* I am
leaning on I could not fetch: the Waterloo tech-report PDF
<https://cs.uwaterloo.ca/research/tr/1991/32/ns.pdf> returned undecodable binary,
the Springer chapter <https://link.springer.com/chapter/10.1007/3-540-55719-9_66>
redirected to an authorization endpoint, and my search
*"Shallit Numeration systems linear recurrences and regular sets theorem U
satisfies linear recurrence"* returned only a summary: *"if the set of all
representations in an order-preserving numeration system is regular, then the
sequence u satisfies a linear recurrence"*, subject to technical conditions.
**A captain should treat §3.4 as a lead, not a closed door**, and the technical
conditions are exactly where a counterexample would live.

**The test.** Exhibit a linear recurrence satisfied by `3, 8, 29, 400, 87867,
2107985255, …`, or an addition automaton for a base built on it. Either would
reopen the route. Given six terms, "satisfies a linear recurrence" is not even
falsifiable from the data — which is the honest reason this connection is a
fence and not an argument.

**What it would give.** Nothing new on its own. Its value is that it makes
§3.2's negative base-independent, so that the next connector does not spend a
session on "try Fibonacci".

---

### 3.5 The right shelf for this picture is regular model checking, not automatic sequences — and one step really is a four-state transducer

**The claim.** Rule 30's picture is the orbit of a four-state Mealy machine from
the input `1`, and the walls are safety properties of that orbit. The field whose
objects are exactly "a transducer, a regular set of configurations, is a bad
configuration reachable" is regular model checking, not the theory of automatic
sequences; and its decidable cases are the ones where the transitive closure of
the transducer is again a regular relation, which §3.2 denies for this one.

**The dictionary.**

| Rule 30 | Regular model checking |
|---|---|
| the packed row `rowNat t` | a configuration: a word over `{0,1}` |
| `rowStep r = (4r) XOR ((2r) OR r)` | a transducer, one output bit per input bit plus two flush steps (the row grows by two cells). Read LSB-first, output bit `i` is `r_{i-2} XOR (r_{i-1} OR r_i)`: a Mealy machine whose state is the pair of bits already read, **4 states**, verified below |
| the seed | the initial configuration `1` |
| the picture | the orbit `{rowStep^t 1}` |
| `leftDiagonal_onset_le`, `leftDiagonal_period_le` | safety properties of the orbit |
| the settled-word recurrence `S_{k+2}(i+1) = S_k(i+2) XOR (S_{k+1}(i+1) OR S_{k+2}(i))` (`leftDiagonal_recurrence`, closed) | a second transducer: an XOR-integration along the diagonal, driven by the two outer diagonals — again length-preserving, again finite-state |
| obstruction 7's `hitting.mjs`, `hitting2.mjs`, exhaustive to `L = 128` | model checking the finite system at each fixed period `L`, which is **decidable and has been done** |
| the wall | the same question with `L` quantified — i.e. over a state space of `4^L` with `L` unbounded |
| **seam** | acceleration wants `{(t, r, rowStep^t r)}` recognizable; for fixed `t` it is (composition of regular relations), uniformly in `t` it is not, since setting `r = 1` would give the array of §3.2 |
| **seam** | the transducer is a fact about the *step*; every power-of-two structure rule 30 has is automatic in base 2 by construction (Ephemeris's §4 says the same), so the step's regularity is a warning and not a foothold |

**What it leans on.** The transducer is not a citation, it is a computation:
`node explorer/waywiser_transducer.mjs` builds the four-state machine from its
state table alone and checks it against `rowStep` on **the seed's first 400 rows
(0 mismatches)** and on **2,000 random 200-bit rows (0 mismatches)**. The state
table is printed in the output. For the field itself the citation is
**UNVERIFIED**: I searched *"regular model checking Bouajjani Jonsson Nilsson
Touili transducer transitive closure acceleration CAV 2000"* and the index
returned the paper — *Regular model checking*, CAV 2000, LNCS **1855**, 403–418 —
with the summary that the field is *"a framework for algorithmic verification of
infinite-state systems … by computation of the transitive closure of a transition
relation"* and that the paper *"presents a new technique for computing the
transitive closure of a regular relation characterized by a finite-state
transducer"*. I could not fetch a full text:
<https://link.springer.com/article/10.1007/s10009-011-0216-8> and the survey
chapter both redirect to an authorization endpoint, and
<https://www.semanticscholar.org/paper/A-Survey-of-Regular-Model-Checking-Abdulla-Jonsson/68dbbe331b9fef7a810bc216e65de10e2a25dc82>
returned an empty page. So the *shape* of the field is from a search summary and
should be confirmed before anyone spends a session on it — but the shape is
exactly right, and that is the claim.

**The test.** The falsifier is a construction: a regular representation of the
`t`-step relation uniform in `t`, or an acceleration of the diagonal recurrence
that handles unbounded period. A theorist could also falsify the *classification*
cheaply — if some standard acceleration technique does apply to a length-preserving
XOR-integration transducer, this row is wrong and there is a tool here.

**What it would give.** On the walls, nothing directly. What it gives is a
correction of which shelf the problem is on, and one sharp consequence: **the
finite-`L` decision procedure this field would offer has already been run by this
board, by hand, in `explorer/`, and the board's own obstruction 7 records that it
gives an upper bound where the wall needs a lower one.** The tool is not missing;
its answer is known and is the wrong way round.

---

## 4. Died in translation

- **"Cobham's gap theorem is the criterion — the doublings are sparse, so use
  it."** My first move, and it is vacuous. Fetched verbatim from
  <https://ar5iv.labs.arxiv.org/html/2104.13072>, Theorem 19: *"either lim
  sup_{n→∞}|x[0..n−1]|_d / log n < ∞ or lim inf_{j→∞} α_{j+1}−α_j < ∞ (or both)"*.
  The doubling depths satisfy the **first** branch comfortably (`6` elements below
  `2^31`), so the theorem is silent, and `{2^n}` — which *is* 2-recognizable —
  satisfies it too. **The seam: a gap theorem is a tool for sets that are sparse
  but not too sparse, and these are too sparse.** Ephemeris's document records the
  mirror-image failure, where rule 30's *density* killed the same theorem; the
  theorem has now failed on this board from both ends.
- **"A 2-automatic array would contradict `leftDiagonal_period_le`."** My
  intended headline for an hour. It is false and the falsity is instructive: if
  the array were automatic then `P(k)` would be a synchronized function, hence
  `P(k) = O(k)`, which **is** the wall up to a constant. Automaticity would
  *prove* the wall, not contradict it. The refutation has to come from the
  doubling set's sparsity (§3.2) and not from the wall's inequality at all.
- **"The doubling depths are where `P(k) > P(k−1)`."** Measured, that gives **89**
  positions below `k = 8000` (`3, 5, 8, 10, 24, 29, 31, 46, …`) and not NKS's
  four, because `P` itself **drops** 88 times in the same range: the
  eventually-constant diagonals have minimal period 1 (`k = 4, 7, 9, 28, 30, 399,
  401`) and others fall part-way (`k = 23`, period 4 to 2). The published list is
  the steps of the *running maximum* `max_{j≤k} P(j)`, and with that correction the
  measurement reproduces `3, 8, 29, 400` exactly. A true value with the wrong
  label, caught only because I had NKS's four numbers to compare against — which
  is the argument for always computing something already published.
- **"The onset is the onset of the minimal period."** My first detector, and it
  produced onset differences in `[−2497, 2512]` with 93 distinct values —
  obviously wrong, and wrong in an interesting way: an eventually-*constant*
  diagonal is `1`-periodic only from a late index (onset `1584` at `k = 659`)
  while being `16`-periodic from index `191`. `leftDiagonal_onset_le` says
  `∃ p > 0, ∃ N ≤ k`, so the onset that matters is the **minimum over `p`**, not
  the onset belonging to the smallest `p`. Corrected, the range is `[−13, 16]`
  with 30 values, and the whole of §3.3 depends on that being a finite alphabet.
- **"Synchronization's linear-growth bound will kill the onset."** It does not:
  `o(k)/k = 0.3369` and the bound is satisfied. Worse for the hypothesis I
  wanted, the slope is rational-looking and is the board's own seam speed in
  disguise: a seam at `x = −s·t` gives `o/k → s/(1−s)`, and obstruction 4's
  `s = 0.252` gives `0.337` against my measured `0.3369` — agreement to three
  digits from two instruments that share no code. (Wolfram's `s = 1/4` would give
  exactly `1/3`; I wrote `1/3` into the first draft and the arithmetic does not
  support it at this depth — the two seam figures on the board, `0.2497` and
  `0.252`, straddle `1/4` and the onset measurement picks the second.) **The
  growth tests pass on the onset and I had to find a different seam**, which is
  why §3.3 is a kernel measurement and not a theorem.
- **"The right diagonals are the automatic region — they are exactly periodic
  with no transient."** They are, and it buys nothing: `rightDiagonal k 0 =
  centerColumn k`, so an automaton for the right-diagonal array is an automaton
  for the centre column. This is obstruction 20's "index 0 is the free
  coordinate" restated in the vantage's vocabulary, and it means the tidiest part
  of the picture is the part that contains the prize.
- **"Rowland's `a(n)` can be tested for automaticity."** It survives every
  criterion available — gaps in `[1, 8]` so Cobham's gap theorem is satisfied,
  linear counting density `0.441` so the growth dichotomy is satisfied, length set
  hitting every length so §3.2's lemma is satisfied — and that is **not** evidence
  that it is automatic, because 41 terms is all there is. Rowland's own
  `a(0..40)` (`sources/rowland-2006-local-nested-structure.txt`, lines 128–130:
  *"The values of a(n) for 0 n 40 are 1, 3, 4, 6, 7, 9, 15, 16, 24, …"*) were
  obtained *"by computing the rightmost 121 nonwhite diagonals of rule 30 up to
  row 240"* — line 136, where the OCR has eaten a superscript and the row is
  `2^40`. So each further term costs a doubling of the computation, and **no
  non-automaticity criterion will ever have enough data to bite on `a(n)`.** That
  is a permanent obstacle and not a budget one, and it is the honest answer to
  the vantage's `a(n)` clause.
- **"The eventually-constant diagonals have a small 2-kernel — `30` at `e = 7`
  against a coin's `255` — so *something* here is finite-state."** My best-looking
  number of the session, and it is an artefact of sparsity: `[P(k) = 1]` is `1` at
  exactly `42` of `8,000` places, and almost every decimation of it is all zeros on
  the first `40` terms compared, so the subsequences collide for free. The
  density-matched null — the same sequence **shuffled** — gives `31`. The two are
  the same number. I had the `30` on screen before I built the shuffle, and a
  version of this document existed for ten minutes in which it was evidence.
  Ephemeris recorded the identical trap one day earlier with rule 90 as a dilation
  control; the shape is *a sparse sequence agrees with any decimation of itself
  almost everywhere*, and it will catch the next connector too.
- **"`min(log₂ P(k), 4)` sits below its own shuffle, so the period function has
  structure."** It does sit below (`129` against `210`) and it means nothing about
  automaticity: over `400 ≤ k ≤ 8000` the sequence is the constant `4` except at
  `88` places, so what the comparison detects is that the exceptions are
  *clustered*. The row is in the table because it is the one test in the document
  that needs no growth law, and it is in this section because it has no power at
  the only depth I can reach. Power would need a `k` past `87867`, where the
  alphabet gains a letter.
- **"`k`-regular sequences are the right home for the unbounded quantities."**
  `k`-regular allows unbounded values, which is what `P(k)`, `o(k)` and `a(n)`
  need. It dies on growth: fetched from
  <https://ar5iv.labs.arxiv.org/html/1511.07535>, quoting Allouche–Shallit
  Theorem 2.10, *"given a k-regular sequence f, there is a positive constant c_f
  such that f(n) = O(n^c_f)"*. The left doubling depths `D_n ≈ 2^{2^{n-1}}` are
  not polynomially bounded, so `D` is not `k`-regular in any base either. (`o(k)`,
  `P(k)` and Rowland's `a(n)` *are* polynomially bounded and this test does not
  touch them.)
- **"The onset might be Presburger-definable, which is far weaker than
  automatic and would still decide the wall."** Dies at the cheapest depth: a
  semilinear graph would make `o(k)` eventually `⌊k/q⌋ + c` on residue classes,
  and the measured differences take 30 distinct values from `−13` to `16` with no
  residue structure. Recorded because Presburger is the first thing to try and is
  strictly cheaper than Büchi.
- **"Walnut can be handed the measurements."** No. Ephemeris recorded this for
  the centre column and it is equally true here: *the input format is the
  automaton*. `8,000` onsets is not a mode. I re-derived this and record it so the
  next connector does not: the decision procedure is a theorem about automata, and
  what we have is a table.
- **"Even if we cannot supply an automaton, we could run Walnut on the finite
  system at each `L`."** We could, and obstruction 7 already did it by hand, to
  `L = 128`, exhaustively, and recorded that the answer is an average-gap upper
  bound where the wall wants a lower bound. The tool would reproduce a known
  negative more slowly.
- **The craft note, because it cost me turns and CLAUDE.md says almost no
  connector records it.** Three failure modes, all hit in this session. **Every
  PDF I fetched returned undecodable binary** — `arxiv.org/pdf/2104.13072` and
  `cs.uwaterloo.ca/research/tr/1991/32/ns.pdf`, the tool saying so explicitly.
  **Every `link.springer.com` URL 303-redirects to `idp.springer.com/authorize`**,
  article and chapter alike, so Springer is closed. **OEIS returns HTTP 403 on
  `oeis.org/search`**, with and without `fmt=text`; I could not look up a sequence
  at all. What *does* work is **`ar5iv.labs.arxiv.org/html/<arxiv-id>`**, which
  rendered four different papers cleanly and supplied five of the six verbatim
  quotes in this document, and Wikipedia, which supplied the other. Substituting
  `ar5iv.labs.arxiv.org/html/` for `arxiv.org/pdf/` is the single highest-value
  piece of connector craft I have, it costs one edit, and it is nowhere in the
  brief. Dioptra's notebook is the only one that records the obstacle; this is the
  fix.
- **Nothing died for lack of depth.** The two measurements are `8,000` diagonals
  and `13,000` rows, both deliberately small: every number they produce is a
  control for an argument about the first six doubling depths, and the quantity
  that would reward depth — a seventh doubling depth — sits at `k > 2·10^9` and is
  out of reach of any script a connector can run.

---

## 5. What to hand the theorist

**First, the finding about the vantage itself, because it changes what the rest
is worth.** Both target nodes disclaim prize relevance in their own docstrings —
`leftDiagonal_onset_le`: *"Not a prize conjecture and not bearing on one: the
centre column never enters this region"*; `leftDiagonal_period_le`: *"Not a prize
conjecture."* The vantage's best case was two walls falling to a tool, and the
project's own 2026-09-10 policy (*"A node that does not bear on a prize
conjecture now needs a reason"*, and the measured failure mode of 35 nodes under
these exact two walls) says that outcome would have needed a reason too. **The
cheapest result available to this project was also one it has already decided it
does not want.** I would rather say that plainly than sell the negative as a
saving.

**Topic 1, and it is an adjudication rather than a proof — the fence.** I would
spend a captain's ten minutes, not a theorist's session, on writing this down:

> *No decision procedure for automatic sequences closes `leftDiagonal_onset_le`
> or `leftDiagonal_period_le`. Both are one-line first-order sentences over the
> left-diagonal array and Walnut would decide them given a DFAO for that array —
> but the array is not 2-automatic: its period-doubling depths `3, 8, 29, 400,
> 87867, 2107985255` have base-2 lengths `2, 4, 5, 9, 17, 31`, and an infinite
> 2-recognizable set has eventually bounded length gaps (pumping lemma) and a
> counting function `c·log^r N` or `N^α` (Cobham's growth dichotomy), while this
> one counts like `log log N`. Independently of that growth law: the
> characteristic sequence of the eventually-constant diagonals is a finite-range
> function definable from the array, so it would be 2-automatic outright, and its
> 2-kernel to `k = 8000` is `30` against its own density-matched shuffle's `31` —
> indistinguishable — where three genuine automatic sequences stop at two, four
> and four. The onset function alone would suffice for the first wall and needs
> only to be 2-synchronized — it passes the growth test, `o(k)/k = 0.3369` with a
> rational-looking slope, and fails the same 2-kernel test, `255` against a
> shuffle's `255`. Changing the numeration system
> does not help, because a decision procedure needs recognizable addition and that
> forces a linear recurrence. And the cheap argument holds too: `leftDiagonal t 0`
> **is** the centre column, so any automaton for the array is an automaton for the
> column — the settled region is not a haven away from the column, it is the
> column's own neighbourhood.*

*The dictionary row it depends on:* §3.2's `D` row — that the doubling depths are
definable from the array, so that a criterion about recognizable sets applies to
them. *The depth reached:* `k ≤ 8000` for the doublings computed here, six terms
in total counting NKS's two. *What would overturn it:* an automaton, a seventh
doubling depth below `2^{40}`, or a proof that the doubling gaps have bounded
ratio.

**Topic 2, the only thing here that touches a prize, and it is one line beside
crystal 73.** An automaton for the centre column would decide **all three**
prizes — P1 by Honkala's theorem, P2 because an automatic sequence's letter
frequencies are computable rationals when they exist, P3 at any formalisation at
or below the finite-state level. Crystal 73 currently records that the centre
column is measured non-automatic; what it does not record is *what automaticity
would be worth*, and that number is the right one to keep beside the
measurement, because it is the reason to expect the measurement to be right.
*What settles it:* a captain reading it. The P1 half is **verified** — Honkala's
theorem quoted in §3.1 from Charlier–Rampersad–Shallit — and the P2 half rests on
an **UNVERIFIED** frequency claim, so write the P1 half and hedge the P2 half, or
send someone to check Cobham's frequency theorem first. The other UNVERIFIED load
that carries weight in this document is §3.4's Shallit theorem, and it is
load-bearing for a fence rather than for a claim.

**What I would not spend a session on.** The reformulation of
`leftDiagonal_period_le` this vantage produces — *the wall is exactly `h(p) ≥
2p − 1` for every power of two `p`, where `h(p)` is the first diagonal whose
minimal period exceeds `p`* (verified against the measurements: `h = 3, 8, 29,
400, 87867, 2107985255` against demands `1, 3, 7, 15, 31, 63`). It is correct,
it is the form in which every automata criterion is stated, and obstruction 7
already says the same thing in its own words. It is a restatement of a wall that
does not bear on a prize, and seeding it would be the failure mode CLAUDE.md
names.

---

## 6. Next vantage

**Regular model checking and transducer acceleration — Bouajjani, Jonsson,
Nilsson and Touili's line, and the parametrised-verification literature around
it — aimed at the settled-word recurrence.** §3.5 is the sighting and I could
not follow it: this is a field whose objects are *exactly* ours — a finite-state
transducer, a regular set of configurations, a safety property — and whose whole
business is the step this board keeps failing at, namely
turning "decidable for each fixed `L`" into "decidable uniformly in `L`". The
board has already run the finite-`L` procedure by hand (obstruction 7, exhaustive
to `L = 128`) and knows the answer it gives; what it has never asked is whether
any *acceleration* technique — computing the transitive closure of a transducer
as a regular relation, widening, abstraction refinement on regular languages —
applies to an XOR-integration transducer whose inputs are periodic words of
unbounded period. The connector who takes this should be warned by §3.2 that the
uniform closure cannot be regular in base 2, and should read that as a
constraint on which technique could work rather than as a refutation: regular
model checking's successes are mostly *semi*-algorithms that terminate on
particular systems, and a semi-algorithm that terminates is a proof.

**The one I could not reach from where I stood, and it is a different kind of
gap.** Everything in this document treats the *left* diagonals, where the
periods are powers of two and the doubling depths are doubly exponential. The
*right* diagonals have the same recurrence, no transients, and doubling depths —
Rowland's `a(n)` — that grow **linearly**, with gaps in `[1,8]`, and that pass
every non-automaticity criterion in existence. If any object in this picture is
automatic, it is `a(n)`, and the thing that stops anyone finding out is not a
theorem but forty-one terms and an exponential cost per term. I could not reach
whether there is a *cheaper* way to compute `a(n)` than Rowland's — whether the
doubling criterion (odd weight of the driver over one period) can be run on the
tower's state rather than on the picture, the way `explorer/talus6_deep.mjs`
reaches depth 64. If it can, and `a(n)` reaches `n ≈ 300`, then for the first
time on this board a genuine 2-kernel test would have power, and the answer —
either way — would be the first structural statement anybody has about a
sequence Rowland himself says *"displays no obvious regularity"*.
