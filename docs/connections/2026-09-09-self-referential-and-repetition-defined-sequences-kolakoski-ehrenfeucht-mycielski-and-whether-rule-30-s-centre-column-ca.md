# Can rule 30's centre column be re-presented so that its rule mentions repetition?

*A sighting of `centerColumn_other_isEventuallyPeriodic_of_center` from the
vantage of: self-referential and repetition-defined sequences — Kolakoski,
Ehrenfeucht–Mycielski — and whether the centre column has an equivalent
presentation whose defining rule is itself a statement about repetition.*

Meridian, 2026-09-09. First sighting.

**The one-sentence answer.** Yes — three presentations, and one of them is
already being read: rule 30's *local rule* is exactly "rewrite every maximal
repeated block in place" (**proved in the kernel**, and the substitution form
verified cell for cell over 11 million cells), its *initial condition* is two
infinite repetitions with one
defect, and its centre column is generated left to right by the single
constraint "never break the repetition `0^∞` at time zero" (verified, 3,000
terms, forced at every step). So the census's clause — *rule 30's definition
says nothing about repetition* — is **false as stated**, and the transfer
failure is not where it was placed: Kopra's theorem is the proof that reads
rule 30's repetition clause, and it delivers width 2 rather than width 1. The
deficit is one column, not one idea. What I would hand a theorist is section
3.4: a family statement about the rebuilt initial row that implies Prize 1 and
whose hypothesis, unlike the wall's, is satisfiable.

---

## 1. The problem, seen from outside

Two infinite strings of the symbol `0` are laid end to end with a single `1`
between them. Every symbol is replaced at once by a function of itself and its
two neighbours — *(left)* XOR *(itself OR right)* — and this is iterated
forever. Write down the symbol standing at the marked position after each
iteration. That gives one explicit binary sequence

    a = 1 1 0 1 1 1 0 0 1 1 0 0 0 1 0 1 1 0 0 1 0 0 1 1 1 0 1 0 1 1 1 0 0 1 …

which a three-line program prints to depth `n` in time `O(n²)` with no lookup
table. Every statistic anyone has measured on it is a fair coin's.
**Unproved: that `a` is not eventually periodic** — that no `p > 0` and `N`
satisfy `a(n+p) = a(n)` for every `n ≥ N`.

(The board's node is an implication, "if this column repeats then some other
column repeats". Given the board's proved theorem that no two distinct columns
both repeat, hypothesis and conclusion are incompatible, so the implication is
equivalent to the negation of its hypothesis. It is the aperiodicity statement
in implication clothing, and I write about the aperiodicity statement.)

**Restated in this vantage's own terms.** Combinatorics on words knows a small
number of explicitly defined, computable, closed-form-free sequences whose
aperiodicity is a theorem. In the two closest to `a` — the Kolakoski word,
which *is* the sequence of run lengths in its own run-length encoding, and the
Ehrenfeucht–Mycielski sequence, whose next bit complements the bit that
followed the last earlier occurrence of its own longest repeated suffix — the
*definition* is a sentence about repetition, and the aperiodicity proof reads
that sentence rather than the sequence. The question here is therefore not "is
`a` aperiodic" but: **is there an equivalent presentation of `a` — a different
recursion, a fixed-point equation, a substitution, a suffix or run-length
condition, an S-adic or Bratteli–Vershik expansion — whose defining clause
quantifies over repetitions?** Section 3 says yes three times and section 4
says how many candidate presentations died to get there.

## 2. Fields sighted

| Field / theory | The object there that matches something here | The seam, in one line |
|---|---|---|
| Combinatorics on words — self-generating sequences | Kolakoski `K` = its own run-length encoding | rule 30's run rewriting maps row `t` to row `t+1`, not a word to itself: it is a **transition**, not a **fixed point** (3.1) |
| Greedy anti-repetition sequences | Ehrenfeucht–Mycielski: complement the bit after the longest repeated suffix | measured dead: the column obeys the EM rule at rate **0.50066**, a coin's **0.50083** (4.1) |
| Symbolic dynamics of CA — expansivity | Kopra's *number-like* class `N(Σ)`: `x[i] = 0` for all `i < N` | this **is** rule 30's repetition clause, and reading it gives width 2 (3.2) |
| Substitution systems / in-place rewriting | black run `1^k ↦ 1 0^(k-1)`, white run `0^m ↦ 1 0^(m-2) 1` | exact and verified; but the induced map on the run-length word needs re-parsing at the joints, so it is not a monoid morphism (3.1, 4.5) |
| Look-and-say sequences, Conway's cosmological theorem | run-length rewriting that decays into non-interacting "elements" | rule 30's rewriting is **length-preserving**, so nothing ever splits off; Wolfram's periodic regions are corrupted from their ends at speed 1 (4.3) |
| Interfaces between periodic backgrounds (defect dynamics) | the wall `0^∞ ∣ (10)^∞` between two rule 30 fixed points | the wall **has the seed's centre column**, verified to 60,000 (3.5); but it spreads at speed 1 in both directions, so it is not a particle |
| Renormalisation / blocking transformations | a CA that simulates itself on blocks | Wolfram: rule 30 simulates **no** other rule with blocks up to length 8 (4.4) |
| Numeration systems, greedy expansions | the centre column as the greedy solution of a triangular constraint system | the constraint is forced at every index — no digit is ever free, so there is no carry structure to exploit (3.3) |
| Constraint satisfaction / triangular linear-ish systems | "the rebuilt initial row is white at `−k`", one equation per `k` | each equation reads the whole prefix; nothing couples equation `k` to equation `k + p` (3.3 seam) |
| S-adic expansions, Bratteli–Vershik systems | directive sequences of morphisms; ordered Bratteli diagrams | **the search is closed**: unbounded S-adic is vacuous, and BV needs minimality, which implies Prize 1 (4.6) |
| Automatic and morphic sequences, Cobham/Pansiot | finite `k`-kernel, complexity classes up to `Θ(n²)` | Parallax's floor of 130,553 states; and non-membership implies Prize 1, so the route is above the wall in both directions |
| Normal numbers — Champernowne, Stoneham | a definition that mentions **counting**, not repetition | this is the family whose prize order is **reversed**: normality proved first, aperiodicity as a corollary (3.6) |
| Lempel–Ziv complexity / longest previous factor | the match-length statistic the EM rule uses | mean match length **17.888** on the column against **17.887** on a xorshift; no repetition to hold (4.1) |
| Return words and derived sequences | the gap sequence of `1`s in the column | codings agree with the column at 0.4974–0.5031; no self-rescaling (4.2) |
| Rewriting systems / Post systems | rule 30 as a length-preserving rewriting on `{0,1}^ℤ` | confluence and termination are the wrong questions for a length-preserving parallel rewriting; nothing in that theory bites |
| The board's own shield class | infinitely many finite configurations with the seed's column, and one infinite one | the infinite one is the wall of row 6 above; the finite ones give nothing new (3.5) |

## 3. Connections

Six. The first three are the presentations the vantage asked for and all three
are verified. The fourth is what I would spend a theorist's session on, the
fifth is the object it lives on, the sixth answers the brief's ordering
warning.

---

### 3.1 Rule 30 is a rule about repetition, stated exactly

**The claim.** Rule 30's local rule reads nothing about a row except its
maximal repeated blocks, and rewrites each one in place:

> a maximal **black** run of length `k` ↦ `1 0^(k-1)`;
> a maximal **white** run of length `1` ↦ `0`;
> a maximal **white** run of length `m ≥ 2` ↦ `1 0^(m-2) 1`.

Equivalently, in boundary form: **the new cell at `i` is black exactly when `i`
is the left end of a maximal black run, or either end of a maximal white run of
length at least two.** So the census's premise — "rule 30's local rule mentions
three cells and no repetition of anything" — is wrong: the rule is a statement
about runs and nothing else, and the centre column is the indicator that the
**origin sits on a run boundary of the previous row**.

**The dictionary.**

| This project | Run-length / substitution language | Status |
|---|---|---|
| A row of cells | the alternating run-length word `… k_i m_i k_{i+1} m_{i+1} …` | exact, and no information is lost (the word plus one colour bit is the row) |
| One step of rule 30 | the in-place rewriting above, applied to every maximal run at once | **exact**, 17.2 M cells over five row families, 0 mismatches |
| `centerColumn (t+1)` | the indicator that the origin is a run boundary of row `t`, in the asymmetric sense above | exact, 0 mismatches over 4,000 steps |
| A white time of the centre column | the origin is strictly inside a run, or is an isolated white cell | exact |
| A black time of the centre column | the origin begins a black run, or bounds a white run of length ≥ 2 | exact |
| The left edge of the cone | the leftmost run boundary; the leading white run is infinite, so its right end is always marked | this is why the edge moves left at speed 1 |
| The left diagonals with power-of-two periods | the run-length word of the settled region | **no row**: the settled words live along diagonals and the rewriting is along rows; the two coordinates do not commute |
| The seam / the transient band | — | **no row** |
| The damage front | — | **no row**: two rows with the same run-length word up to a point can differ later, because the rewriting reads the *lengths*, and a length is a non-local datum |

**Seams, and they are the point.**
(i) The rewriting is a map from row `t` to row `t+1`, so it is a *transition
rule*, where Kolakoski's clause is a *fixed point*: `RLE(K) = K`. Nothing in
rule 30 says a row equals a rewriting of itself; the two spatially periodic
fixed points of section 3.5 are the only rows that do, and they are trivial.
(ii) The clause is **spatial** and the centre column is **temporal**. A period
of the column is a repetition down the picture; the rewriting constrains
repetitions across it. That is the single reason the Kolakoski template does
not transfer, and it is a sharper reason than "rule 30 mentions no repetition".
(iii) The induced map on the run-length word alone is *not* a morphism of the
free monoid on `ℕ`: the images have to be re-parsed into runs, and the joints
merge (`1 0^(k-1)` followed by `1 0^(m-2) 1` followed by `1 0^(k'-1)` produces
a black run of length 2 or 3 at each joint). So Pansiot's complexity
classification for morphic words does not apply, and 4.5 records that death.

**What it leans on.** Nothing external. The identity is an elementary
rearrangement of the eight-row truth table and is verified rather than cited.
I searched for it in print and did not find it: WebSearch for `rule 30
cellular automaton "run length" runs boundaries of maximal runs
characterization local rule`, and the held sources — `grep -i` for `run of`,
`runs of`, `run length`, `run-length`, `maximal run` across all of `sources/`
returns exactly one hit, Wolfram 1986 line 2094, about gap length
distributions and not about the rule. Treat the identity as folklore-adjacent
and the *centre-column reading* of it as new here.

**The test — and it is past the measurement stage.** The boundary form is
**proved in the kernel**, `explorer/meridian_scratch_runs.lean`, accepted by
`lake env lean`:

```
theorem rule30_run_boundary (c : Config) (i : ℤ) :
    rule30 c i = true ↔
      (c i = true ∧ c (i - 1) = false) ∨
      (c i = false ∧ c (i - 1) = true ∧ c (i + 1) = false) ∨
      (c i = false ∧ c (i + 1) = true ∧ c (i - 1) = false)
```

axioms `[propext]`, together with its corollary at the origin,

```
theorem centerColumn_run_boundary (t : Nat) :
    centerColumn (t + 1) = true ↔
      (evolve t 0 = true ∧ evolve t (-1) = false) ∨
      (evolve t 0 = false ∧ evolve t (-1) = true ∧ evolve t 1 = false) ∨
      (evolve t 0 = false ∧ evolve t 1 = true ∧ evolve t (-1) = false)
```

axioms `[propext, Quot.sound]`. Both are three lines. The substitution form is
measured rather than proved: `explorer/meridian_substitution.mjs`, 9.0 M cells
of the seed's picture over 3,000 rows, 1.5 M cells of random rows, plus
`(10)^∞` and `(1^23 0^23)^∞` backgrounds — **0 mismatches** anywhere; and
`explorer/meridian_runs.mjs`, 16.0 M cells of the seed and 1.2 M of three other
families, **0 mismatches**, with the centre-column identity holding at every one
of 4,000 steps.

**What it would give.** By itself, nothing: it is a restatement of the local
rule and is therefore exactly as strong. What it gives is a *correction to the
census*, and the correction relocates the difficulty. The Kolakoski template
fails not because rule 30's definition is silent about repetition but because
its repetition clause runs across the picture while the prize runs down it.
That is a statement a theorist can act on — it says to look for a repetition
clause in the *time* direction, which is what 3.3 supplies.

---

### 3.2 The clause is in the initial condition, and Kopra's proof already reads it

**The claim.** Rule 30's *initial condition* is a repetition clause — the seed
is `0^∞ 1 0^∞`, two infinite repetitions with one defect — and the only proof
in print of aperiodicity for a rule-30-shaped object, Kopra's Theorem 3.5, is
precisely the proof that reads it. So the pattern the census identified in
Kolakoski and Ehrenfeucht–Mycielski (*the proof reads a repetition clause in
the definition*) is **already instantiated for rule 30**; it delivers width 2,
and the entire remaining gap is the step from width 2 to width 1.

**The dictionary.**

| The precedent | Its repetition clause | What the proof extracts | Rule 30's counterpart |
|---|---|---|---|
| Kolakoski `K` | `K` is the run-length encoding of `K` | a period descends under the rescaling; infinite descent | rule 30's rewriting is a transition, not a fixed point (3.1 seam i) |
| Ehrenfeucht–Mycielski `E` | the next bit complements the bit after the longest repeated suffix | the rule manufactures every word ⇒ disjunctive ⇒ aperiodic | nothing in rule 30 manufactures words; measured at 0.50066 (4.1) |
| **Rule 30, in print** | **`x[i] = 0` for every `i < N`** — the configuration is white far to the left | left expansivity carries periodicity of a width-`w` window leftward, faster than the left edge moves | **`Tr[i,i+w−1](x)` is not eventually periodic**, at `w = 2` |
| The board's form of it | `not_isEventuallyPeriodic_pair`, `isEventuallyPeriodic_column_unique` | proved | closed |
| What is left | the same clause read at `w = 1` | — | the sideways solve has a free input at every black time of the column |
| The clause's slack | the seed is white far to the left **and** white far to the right | Kopra uses only the left half | 3.5 shows the right half can be replaced by `(10)^∞` without changing the column |

**Seams.** (i) The clause is one-sided: `N(Σ)` constrains only the left tail,
so any strengthening has to come from the right, and 3.5 shows the right tail
is not determined by the column — the wall configuration and the seed share
the column and differ on the whole right half. (ii) Reading the clause at
`w = 2` is *not* a weakened form of reading it at `w = 1`; the mechanism
genuinely needs two columns, because one column plus the rule leaves a free bit
whenever the column is black. (iii) The strongest honest phrasing of the
correction: the census said rule 30 has no repetition clause; the truth is that
it has one, it is the *initial condition*, and it has been fully spent.

**What it leans on.** Held source `sources/kopra-2022-natural-class.txt`,
Definition 2.4: "*We say that a configuration x ∈ Σ^Z, x ≠ 0^Z, is number-like
if there exists an N ∈ Z such that x[i] = 0 for i < N*" (lines 132–134); and
Theorem 3.5: "*If F : Σ^Z → Σ^Z is rapidly left expansive with width w ∈ Z+
and x ∈ N(Σ), then Tr[i,i+w−1](x) is not eventually periodic for any i ∈ Z*"
(lines 316–317). Fetched:
[Kolakoski, Wikipedia](https://en.wikipedia.org/wiki/Kolakoski_sequence) — "*The
Kolakoski sequence…is an infinite sequence of symbols {1,2} that is the
sequence of run lengths in its own run-length encoding*", "*The sequence is not
eventually periodic, that is, its terms do not have a general repeating
pattern*"; [Ehrenfeucht–Mycielski,
Wikipedia](https://en.wikipedia.org/wiki/Ehrenfeucht%E2%80%93Mycielski_sequence)
— "*Each successive digit is formed by finding the longest suffix of the
sequence that also occurs earlier within the sequence, and complementing the
bit following the most recent earlier occurrence of that suffix*", and the
sequence is disjunctive, "*every finite subsequence of bits occurs
contiguously, infinitely often within the sequence*".

**The test.** The claim is a reading, so what is falsifiable is the assertion
that the width-2 result is the *whole* yield of the clause. A theorist kills it
by producing a width-1 consequence of `x ∈ N(Σ)` — in the project's vocabulary,
any statement of the form "for every configuration white far to the left, some
function of column 0 alone is not eventually periodic". 3.3 and 3.4 are my
candidate for what that function is.

**What it would give.** It reframes the wall for a captain: the project is not
missing a mechanism, it is one column short of a mechanism it already owns.
That is worth saying because it argues *against* funding further searches for
new templates and *for* funding the width-2-to-width-1 step.

---

### 3.3 The greedy presentation: the column is generated by "never break the white repetition"

**The claim.** The centre column has a picture-free, left-to-right generating
rule whose only clause is an infinite repetition, and the rule is *forced* at
every index:

> `c(0) = 1`, and for `k ≥ 1`, `c(k)` is the unique bit for which the initial
> row rebuilt from `c` is **white** at position `−k`.

The rebuilding uses only board objects: column 1 is the right half-line
(`evolveHalfRight`) started all white and driven by `c`, and everything left of
the origin is `leftSolve` applied to columns 0 and 1. So the centre column is
defined by *what it must not do* — it must not put a black cell into the
infinite white region at time zero — and that is the shape a repetition-defined
sequence has.

**The dictionary.**

| This project | The greedy / constraint presentation | Status |
|---|---|---|
| `centerColumn` | the sequence generated by the rule above | **exact**: 3,000 terms, first disagreement at none |
| The seed's row 0 | the target word `1 · 0^∞` read leftward from the origin | exact (`initialConfig`) |
| `evolveHalfRight c (fun _ => false)` | the machine that turns `c` into column 1 | exact, board definition |
| `leftSolve c d` | the machine that turns columns 0 and 1 into the rest of row 0 | exact, board definition |
| The constraint at index `k` | `leftSolve c d k 0 = false` | reads `c(0..k)` and nothing beyond |
| "the choice is forced" | `leftSolve c d k 0` depends on `c(k)` affinely | measured: 0 failures in 3,000 indices |
| A candidate period `p` of the column | a periodic word satisfying the first constraints and then failing | the longest all-white prefix a period-`p` word achieves is `≈ p` (3.4 data) |
| Crystal 40 (`b ↦ X_b` is a bijection) | the same map read the other way: row-0 left halves ↔ columns | exact; the column is the image of `0^∞` |

**Seams.** (i) The clause mentions a repetition of the *rebuilt row*, not of the
sequence, so a period of `c` does not feed back into the constraint. This is
the honest reason the EM template still fails after the re-presentation, and it
is a *different* failure from 3.1's: there the clause was in the wrong
direction, here it is about the wrong object. (ii) The rule is causal but not
local: constraint `k` reads the whole prefix `c(0..k)`, so it generates the
column in `O(T²)` — the same cost as running the automaton, which is a hint
that nothing has been gained computationally. (iii) The presentation is not
unique to rule 30: the same construction works for any left-permutive rule, so
it is a property of the class, not of rule 30. That is a genuine weakness and I
record it rather than hiding it.

**What it leans on.** Nothing external; the construction is assembled from
`evolveHalfRight`, `leftSolve` and `initialConfig` as they stand in
`Rule30/Basic.lean`, and their agreement with the picture is the board's
`evolveHalfRight_eq_column` and `leftSolve_eq_column`.

**The test.** `explorer/meridian_greedy.mjs`: generates 3,001 terms by the
constraint alone, with no two-dimensional evolution anywhere in the program;
the constraint is forced at **every** one of the 3,000 indices (both branches
were computed and always differed), the chosen bit satisfies it at every
index, and the result agrees with the true centre column at every term, opening
`11011100110001011001001110101110011101010`, which is A051023. It is falsified
by one index where either branch satisfies the constraint, or by one
disagreement.

**What it would give.** A second definition of the wall that a Lean statement
can be phrased against without the picture, and the object 3.4 is about. On
its own it proves nothing.

---

### 3.4 The density lemma: a family statement that implies Prize 1 and is not vacuous

**The claim.** Run the rebuilding of 3.3 on an arbitrary boundary `b` instead of
on the centre column, and write `rowzero(b)` for the resulting half-row at
positions `−1, −2, −3, …`. Then

> **for every eventually periodic `b` other than the all-white sequence, the
> black cells of `rowzero(b)` have positive upper density.**

This implies Prize 1 immediately, because `rowzero(centerColumn) = 0^∞` has
density zero. Unlike the wall itself it is **not vacuous**: its hypothesis is
satisfiable, so it is a statement with content in a family where things can be
measured — which is exactly what obstruction 9 said was missing ("*a rewriting
of the wall that does not pass through Jen's theorem, so that it still says
something in a family where the hypothesis is satisfiable*").

**The dictionary.**

| This project | The density statement | Status |
|---|---|---|
| `X_b` (crystal 40: white at `x ≥ 1`, centre column `b`) | the configuration `rowzero(b)` is row 0 of | exact |
| The seed | the unique `b` with `b(0) = 1` and `rowzero(b) = 0^∞` | exact — and note `b ≡ 0` also gives `0^∞`, with `b(0) = 0`, which is why the all-white boundary must be excluded by hand |
| Prize 1 | no eventually periodic `b ≠ 0^∞` has `rowzero(b) = 0^∞` | **equivalent** to the wall |
| The density lemma | no eventually periodic `b ≠ 0^∞` has `rowzero(b)` of zero density | **strictly stronger**, and measurable |
| Talus's *good* boundaries | those `b` for which `rowzero(b)` is eventually spatially periodic (crystal 24) | the hard cases: they are the low-density ones |
| Talus's *bad* boundaries | `rowzero(b)` aperiodic | density ≈ 0.5, uninteresting |
| Wolfram 1986 Table 6.2, period 4, element `0000001` | `b = (1101)^∞` gives `rowzero(b) = (0000001)^∞`, density exactly 1/7 | an independent check that the machinery is right |

**The measurement** (`explorer/meridian_target.mjs`, `meridian_target2.mjs`).
Over **all 8,178 purely periodic boundaries of period at most 12**, at depth
300 and again at depth 1,200:

| Statistic | Value |
|---|---|
| mean black density of `rowzero(b)` | **0.4997** |
| minimum density, excluding `b ≡ 0` | **0.1400**, at `b = (1101)^∞` (0.1425 at depth 1,200) |
| number of `b ≠ 0^∞` with density 0 | **0** |
| longest all-white prefix of `rowzero(b)` | 11, at `b = (110111001100)^∞` — which is the centre column's own first 12 terms |
| longest white *run* anywhere | 19, at `b = (00010110011)^∞` |
| positive control, `b = centerColumn` | density 0.0000, all-white prefix 1,500 of 1,500 |

Deeper, at depth **4,000**, on the 120 lowest-density words: minimum density
**0.1427** (`b = (1101)^∞`), minimum *tail* density (second half only, so a long
onset cannot hide in it) **0.1425** (`b = (11010011)^∞`). On 300 random words of
period 13–32 at depth 1,500 the minimum is **0.4620**. And on the words Talus
named as the family's hard cases — `1101011000`, `1001101000`, `1010001001`
(good only at 2.5·10⁶ rows, onset 798,077), `1010000111`, `1111010000` — the
densities are 0.4500 to 0.5178, tail densities 0.4605 to 0.5165. **The onset
risk was checked and did not materialise**: the boundaries whose *periodicity*
verdict needed a million rows have entirely ordinary rebuilt-row densities.

The "longest all-white prefix" row is the one to read: because the constraint
is forced (3.3), a boundary whose rebuilt row is white for `k ≤ K` **agrees
with the centre column on `c(0..K)`**. So the best a period-`p` word can do is
agree with the column for about `p` terms — which is Parallax's `W(p) ≈ 1`
finding arrived at from the opposite direction, and it is why the table's
maxima are attained by prefixes of the column itself.

**Seams, and one of them is a real risk.**
(i) `b ≡ 0` must be excluded by hand; there is no way to phrase the lemma
without it.
(ii) The lemma is *stronger* than the wall, not weaker. I am not offering a
weakening. Its value is that the hypothesis is satisfiable, so a proof attempt
can be tested against 8,178 examples instead of against zero.
(iii) **The risk was Talus's, and it was checked.** The low-density boundaries
are the *good* ones, whose `X_b` has a second eventually periodic column; Talus
measured onsets up to 798,077 rows in that family and recorded that a
periodicity verdict below `10⁶` rows is worth nothing there. So a good boundary
with an enormous onset might hold a long white stretch that a shallow
measurement misreads. Measured directly on Talus's own named words: densities
0.4500–0.5178, tail densities 0.4605–0.5165, including `1010001001`, the word
whose good verdict needed 2.5·10⁶ rows. The risk did not materialise at depth
4,000, which is *not* the same as a proof that the floor is 0.14 — the sweep is
over purely periodic `b` of period ≤ 12 and 300 random words of period ≤ 32,
and the lemma quantifies over all eventually periodic `b`.
(iv) The lemma says nothing about *why* the floor should be positive. The
mechanism I would look for is 3.1's: `rowzero(b)` is built by `leftSolve`,
whose recursion is the same `XOR`/`OR` shape as rule 30's, so a long white run
in `rowzero(b)` is a long white run in a rule-30-like picture, and the run
substitution of 3.1 says long white runs are marked at both ends and eaten from
outside.

**What it leans on.** The board's crystal 40, `evolve_period_sub`, crystal 24
and Talus's obstruction-11 measurements, all internal. Wolfram 1986 for the
Table 6.2 cross-check: "*Configurations periodic under the cellular automaton
mapping (3.1) consist of infinite repetitions of the elements given*", with
period 4 elements `0000001`, `0000111`, `0010011`, `0111111`
(`sources/wolfram-1986-random-sequence-generation.txt`, lines 843–856).

**The test.** Already run, above. For a theorist the statement to try to
falsify, in the project's vocabulary, is

> for every `p > 0`, every `N`, and every `b : ℕ → Bool` that is not eventually
> false and satisfies `PeriodicFrom b p N`, the sequence
> `k ↦ leftSolve b (columnOne b) k 0` is not eventually false,

where `columnOne b t = evolveHalfRight b (fun _ => false) t 0`; and the
strengthened version replaces "not eventually false" by "has positive upper
density". The falsifier is a single eventually periodic `b ≠ 0^∞` whose rebuilt
row is eventually white — which would *be* a counterexample to Prize 1, so a
serious search for one is also the cheapest possible attack on the prize from
this direction.

**What it would give.** Prize 1 outright. What would remain is nothing on this
node; what would be *spent* is a lower bound on the density of a rebuilt row
over a family nobody has classified — Talus's obstruction 11 is the record of
how badly that family resists classification, and this lemma asks for less than
a classification, only a floor.

---

### 3.5 The wall: the column is the interface between two spatially periodic fixed points

**The claim.** The single black cell can be removed from the problem entirely.
The configuration

    E  =  … 0 0 0 ∣ 1 0 1 0 1 0 1 …          (black at every even x ≥ 0)

— the interface between rule 30's two spatially periodic fixed points `0^ℤ`
and `(01)^ℤ` — has **exactly the seed's centre column**, and more: its picture
is the seed's picture at every cell strictly inside the cone, and the `(01)`
background at every cell outside it. So the seed's initial condition, the last
place where the definition is not a statement about repetition, can be replaced
by one that is.

**The dictionary.**

| This project | The wall reading | Status |
|---|---|---|
| `initialConfig` = `0^∞ 1 0^∞` | a defect in the all-white fixed point | Wolfram 1986's own reading |
| `E` = `0^∞ ∣ (10)^∞` (reading rightward from the origin; the same bi-infinite background Wolfram writes `01`) | the interface between the two period-1 elements of Wolfram's Table 6.2 | this sighting |
| `centerColumn` | the interface's trace at the origin | **exact to 60,000 terms**, first disagreement: none |
| The picture of the seed | the picture of `E` on `|x| ≤ t − 1` | **exact**: 9.0 M cells, mismatches only at `x = t`, the right edge, in 1,500 of 3,000 rows |
| The right edge (`rightDiagonal 0 = 1^∞`) | the one cell where the two pictures differ | exact |
| Everything at `x > t` | the untouched `(01)^∞` background | 120,040 cells, 0 mismatches |
| The board's shield class | the chain `{0}, {0,2}, {0,2,4}, …` whose limit is `E` | proved on the board (`chainCfg_center_column`); the limit step is the cone lemma |
| "infinitely many finite configurations share the centre column" | plus exactly one infinite one, in this class | measured: the two shield moves generate the chain, and `{0,3}`, `{0,5}`, `{0,7}` fail at `t = 7, 11, 8` |
| The damage front | the right edge of the difference from the `(01)` background, at `x = t − 2` exactly | measured at `t = 100, 500, 1000, 2000, 3000` |

**Seams.** (i) The interface is not a particle: it spreads at speed 1 in both
directions, so the localised-defect machinery of computational mechanics —
which needs a defect of bounded width — does not apply, and this is a different
object from the settled-region domains Alidade sighted. (ii) `E` has infinite
support, so `config_eq_of_right_and_column` and every finite-configuration
argument on the board is unavailable for it; the shield obstruction already
says the column does not separate finite configurations, and `E` says it does
not separate infinite ones either. (iii) The two pictures being *the same*
means nothing new is computable from `E` — the gain is definitional, not
computational, and I want that said plainly. (iv) There may be other backgrounds:
Wolfram's Table 6.2 gives period-3 and period-4 elements (`000011111001`;
`0000001`, `0000111`, `0010011`, `0111111`), and whether any of those meets
white in a wall with the seed's column is not tested here.

**What it leans on.** Held source `sources/wolfram-1986-random-sequence-generation.txt`:
"*The particular configuration in which all sites have value 0 is invariant
under the cellular automaton rule of Eq. (3.1)*" (lines 858–859); Table 6.2,
period 1, elements `0` and `01`, with "*Configurations periodic under the
cellular automaton mapping (3.1) consist of infinite repetitions of the
elements given*" (lines 837–856); and "*The pattern in Fig. 6.1 can be
considered the effect of a single site "defect" in the periodic pattern
resulting from a configuration with all sites 0*" (lines 902–905). The board's
`shieldGen_same_column` / `chainCfg_center_column` are kernel-proved
(`explorer/sextant_scratch_shield_general.lean`).

**The test.** `explorer/meridian_seam.mjs`: `(01)^ℤ` is a fixed point (0
mismatches over 398 cells); `E`'s centre column agrees with the seed's at every
one of 60,001 terms; the finite chain members agree and the three non-chain
controls do not. `explorer/meridian_seam2.mjs`: the two pictures agree on
9,006,001 cone cells except at `x = t`, and the wall picture equals the `(01)`
background at 120,040 cells outside the cone. It is falsified by one cell.

**What it would give.** It removes "finite support" from the statement of the
problem and replaces it with "a wall between two repetitions", which is what a
Kolakoski-style or Conway-style argument would need as its input. It touches no
part of the residual by itself.

---

### 3.6 The prize ordering is inherited from the repetition clause, and rule 30 is in the other family

**The claim.** The brief asked whether "Prize 1 proved, Prize 2 open, in that
order" is structural. It is not. It is a consequence of the *kind* of clause
the definition supplies. A definition that mentions **repetition** gives
combinatorial leverage — one witness kills one candidate period — and no
leverage at all on averages, so aperiodicity comes first and balance stays
open: that is Kolakoski and Ehrenfeucht–Mycielski. A definition that mentions
**counting** gives the reverse: Champernowne's constant is *defined* by listing
every word, normality was the theorem, and irrationality is its corollary. Rule
30's definition, after 3.1, mentions repetition — but only across the picture,
where the prizes are down it. Down the picture it mentions neither. So rule 30
inherits **neither** ordering, and the project's implicit Prize-1-first
ordering is borrowed from the wrong family.

**The dictionary.**

| Sequence | The clause its definition supplies | Aperiodicity | Balance / density |
|---|---|---|---|
| Kolakoski `K` | repetition (run lengths) | **proved** | open ("*this conjecture remains unproved*") |
| Ehrenfeucht–Mycielski `E` | repetition (longest repeated suffix) | **proved**, via disjunctivity | open; limit points known only to lie in `[1/4, 3/4]` |
| Champernowne `C₁₀` | counting (list every word) | corollary of normality | **proved first**, 1933 |
| Thue–Morse | repetition (overlap-freeness via a morphism) | **proved** | proved, but by the morphism, not by counting |
| Rule 30's centre column | repetition **across** the picture (3.1); nothing down it | open | open |
| Rule 30's one counting clause | surjectivity ⇒ the uniform Bernoulli measure is preserved | — | applies to almost every configuration, and the seed is one point |

**Seams.** (i) The measure-preservation row is exactly where Parallax's session
3 died — a computable point is never typical — so I am *not* claiming rule 30
has a usable counting clause; I am claiming the ordering has no structural
reason to hold, which is a weaker and safer statement. (ii) Thue–Morse is a
counterexample to any simple "repetition clause ⇒ balance is hard" rule, and I
record it as such: its balance follows from the morphism, which is a third kind
of clause neither precedent nor rule 30 has. (iii) "Normality implies
irrationality" is elementary (a rational has an eventually periodic expansion,
which is not normal) and I state it rather than citing it; the Champernowne
page does not draw the implication.

**What it leans on.** Fetched:
[Kolakoski, Wikipedia](https://en.wikipedia.org/wiki/Kolakoski_sequence) — "*It
seems plausible that the density of 1s in the Kolakoski {1,2}-sequence is 1/2,
but this conjecture remains unproved*";
[Ehrenfeucht–Mycielski,
Wikipedia](https://en.wikipedia.org/wiki/Ehrenfeucht%E2%80%93Mycielski_sequence)
— the density conjecture "*remains unproven*" as of 2009, with every limit
point of the ratio "*between 1/4 and 3/4 inclusive*";
[Champernowne constant,
Wikipedia](https://en.wikipedia.org/wiki/Champernowne_constant) — "*Champernowne
proved that C₁₀ is normal in base 10*" (1933), and separately "*Kurt Mahler
showed that the constant is transcendental*".

**The test.** Falsified by a precedent in the other cell of the table: an
explicitly defined computable sequence whose definition mentions repetition and
whose *balance* was proved before its aperiodicity. I looked and did not find
one; that absence is the claim's only support beyond the three rows above, and
a captain should read it as a two-example pattern, not a law.

**What it would give.** It is advice about which prize to fund, not a step
towards either. Concretely it says Parallax's 3.6 — Prize 2 plus a discrepancy
lower bound implies Prize 1 — is running in the direction the *other* family
supports, and is therefore worth more than its position in that document
suggests.

## 4. Died in translation

Ten. The first two are the vantage's own precedents, tested directly and
killed by measurement with positive controls; the rest died at a nameable seam.

**4.1 The Ehrenfeucht–Mycielski rule itself.** Does the centre column obey EM's
defining rule — is the next bit the complement of the bit that followed the
most recent earlier occurrence of the longest repeated suffix? **No.** Over
524,285 queries at depth `2^19`, agreement **0.50066**; the xorshift control
gives **0.50083**; the EM sequence itself gives **1.00000** (a positive control
that validates the instrument, and its own mean match length is 12.358, shorter
than a coin's, which is what an anti-repetition rule does). Mean match length on
the column **17.888**, max 36; on the xorshift **17.887**, max 31. That is the
longest-previous-factor statistic, so it also kills any Lempel–Ziv or
suffix-automaton reading: the column has no more self-overlap than a PRNG.
`explorer/meridian_repetition.mjs`.

**4.2 The Kolakoski rule itself, and derived sequences.** Is the column its own
run-length encoding under any coding? **No, on alphabet grounds alone**: its
run lengths reach **21** in `2^19` terms (counts 131,020 / 65,617 / 32,837 /
16,304 / 8,104 / 4,179 for lengths 1–6 — geometric, matching the xorshift's
132,211 / 65,610 / 32,901 / 16,101 / 8,044 / 4,045), so the run-length sequence
is not binary and cannot be the sequence. The three natural binary codings of
the run-length word (`len mod 2`, `len ≥ 2`, `len ≥ 3`) agree with the column
at 0.4974–0.5031 over eight lags, against the control's 0.4982–0.5015. The
return-word / derived-sequence version dies with it, since the return words of
`1` are the gaps and the gap sequence is that same run-length word.
`explorer/meridian_repetition.mjs`.

**4.3 Conway's cosmological theorem.** The look-and-say map is run-length
rewriting, rule 30 *is* run-length rewriting (3.1), and Conway's theorem says
every look-and-say sequence decays into atomic elements "*which are finite
subsequences that never again interact*" — so: does rule 30's rewriting decay
into non-interacting elements? **No, and the seam is one word: length.**
Look-and-say is length-*increasing*, which is what lets a block outrun its
neighbours and split off; rule 30's rewriting is length-*preserving* and
in-place, so no block ever separates from the one beside it. The nearest true
statement is Wolfram's, that a region of a periodic background "*can be
corrupted only through end effects*" — but the corruption travels at speed 1,
so no element is stable and there is no periodic table.
Fetched: [Look-and-say sequence,
Wikipedia](https://en.wikipedia.org/wiki/Look-and-say_sequence) — "*Every
sequence eventually splits ("decays") into a sequence of "atomic elements",
which are finite subsequences that never again interact*". Wolfram quote:
`sources/wolfram-1986-random-sequence-generation.txt` lines 866–868.

**4.4 Blocking transformations / self-simulation.** The natural
renormalisation: find a block length `n` and a coding under which rule 30
simulates a rule (ideally itself), then read the centre column off the coarser
automaton. **Closed by Wolfram, computationally, to block length 8**: "*The
cellular automata of Eqs. (3.1) and (3.2) are unique among k = 2, r = 1 rules
in simulating no other rules, at least with blocks of length up to eight*"
(`sources/wolfram-1986-random-sequence-generation.txt`, lines 914–917; Eq. (3.1)
is rule 30). This is the strongest single sentence I found against every
self-similarity route, and it is in a source the project already holds.

**4.5 The run-length word as a morphic sequence.** 3.1 gives a substitution, so
the obvious next move is to read the run-length word of successive rows as a
morphic or `D0L` sequence and apply Pansiot's complexity classification.
**Dies at the joints.** The images `1 0^(k-1)` and `1 0^(m-2) 1` are
concatenated in place, and adjacent images merge — the boundary between a white
run's image and the next black run's image is `1 1` or `1 1 1` — so the
run-length word of the image is not the image of the run-length word under any
map on `ℕ`. The rewriting is a substitution followed by a re-parsing, which is
not a monoid morphism, and the whole morphic apparatus (Pansiot, Cobham) never
gets started. Worse, the run-length word of the seed's row *grows in length*
with `t`, so there is no fixed point to be the sequence.

**4.6 S-adic expansions and Bratteli–Vershik systems.** The brief asked for
these explicitly and said to look for an unbounded or S-adic presentation or to
say plainly that the search is closed. **It is closed, twice over.**
*S-adic:* with no condition on the morphisms the notion is vacuous — for any
sequence `x`, put `σ_n(a) = x(0..n-1)·a` and `σ_n(b) = b`; then
`lim σ_1σ_2⋯σ_n(a) = x`, so every sequence has an S-adic expansion and the
presentation carries no information. The versions that carry information
require a **finite** morphism set (with linear complexity, contradicted by the
column's measured `2^n` to `n = 14` in the same weak asymptotic sense as
morphic) or primitivity and properness, which are membership conditions and so
fall under Parallax's inside/outside dichotomy.
*Bratteli–Vershik:* the representation theorem is for **minimal** Cantor
systems, and a minimal subshift containing an eventually periodic point is a
single periodic orbit — so "the column's orbit closure is minimal and infinite"
*implies* Prize 1, putting BV strictly above the wall exactly as automaticity
is. The vacuity construction above is elementary and given in full; whether it
is stated in the literature is **UNVERIFIED** — I searched WebSearch for
`S-adic representation every sequence is S-adic if no condition on the
morphisms Berthé Delecroix`, fetched
[arXiv:1309.3960](https://arxiv.org/abs/1309.3960) (abstract: "*An S-adic
expansion of an infinite word is a way of writing it as the limit of an
infinite product of substitutions*"), and the PDF at
[arXiv.org/pdf/1309.3960](https://arxiv.org/pdf/1309.3960) would not render as
text.

**4.7 The origin's run coordinate as a hidden structure.** 3.1 says the column
records where the origin sits in its run, so: is *that* sequence — the triple
(colour, offset from the run's left end, run length) at the origin at each time
— structured where the column is not? **No.** Mean run length at the origin
3.034, max 17; the origin is a singleton 997 times, at the left end 1,009, at
the right end 980, interior 1,015 in 4,000 steps — a fair split — and the coded
sequence has 3,984 distinct factors of length 16 in 3,985 windows, i.e. every
window distinct. `explorer/meridian_runs.mjs`.

**4.8 A fixed-point characterisation of the column as a word.** The hope: some
operator `Φ` on binary sequences with `Φ(c) = c`, in the Kolakoski shape. Every
candidate I could build from board objects is a *transition*, not a fixed
point: the run rewriting maps row `t` to row `t+1` (3.1 seam i); the settled
centre column `settledCenter` is the nearest self-referential object and
Parallax already measured it agreeing with the true column at rate 0.509, a
coin; and the greedy rule of 3.3 is a generation, not a fixed point — its
"input" is `0^∞` and its output is `c`, and the two live in different spaces
(one is a row, one is a column). The only genuine fixed points in sight are the
two spatially periodic configurations of 3.5, and they are fixed points of the
automaton, not of an operator on the column.

**4.9 A repetition clause in the time direction.** Given 3.1, the obvious hunt
is for the same identity read down a column instead of across a row: is
`centerColumn (t+1)` an indicator of the origin sitting at a run boundary of
*the column's own past*? **No, and it cannot be**, because the column's next
value is a function of cells the column does not contain — that is exactly the
free bit at every black time. The measurement in 4.7 is the empirical form of
the same statement: the origin's run coordinate carries no more structure than
the column.

**4.10 Reading the wall as a particle.** 3.5's interface looked like a defect
between two backgrounds, which is the setting where computational mechanics has
theorems. **Dies on speed.** The difference from the `(01)` background reaches
`x = t − 2` at every measured `t` (100, 500, 1,000, 2,000, 3,000) and the left
edge runs to `−t`, so the "defect" has width `2t` and is not localised. There
is no particle, no particle interaction, and no domain filter to apply.

## 5. What to hand the theorist

**One topic, and a second only if the first is cheap to state.**

**(1) The density lemma, 3.4.** *The claim to falsify:* for every `b : ℕ → Bool`
that is eventually periodic and not eventually false, the rebuilt initial row
`k ↦ leftSolve b (columnOne b) k 0` — where
`columnOne b t = evolveHalfRight b (fun _ => false) t 0` — is not eventually
false; and, in the strengthened form worth aiming at, has positive upper
density of `true`. *The dictionary row it depends on:* crystal 40, that
`b ↦ X_b` is a bijection onto the configurations white at `x ≥ 1`, so that
`rowzero(b)` is genuinely row 0 of a real picture and not a formal solve.
*The depth or statement that would settle it:* the weak form is equivalent to
Prize 1, so a theorist should attack the **strengthened** form, whose evidence
is 8,178 boundaries of period ≤ 12 with a floor of 0.1400 and a mean of 0.4997,
a floor of 0.1427 (0.1425 in the tail) when the lowest 120 are re-run at depth
4,000, 0.4620 over 300 random words of period 13–32, and ordinary densities
(0.45–0.52) on every word Talus flagged as needing 10⁵–10⁶ rows; and whose one
exception `b ≡ 0` is excluded by hypothesis. The mechanism to try is 3.1's: a
long white run in `rowzero(b)` is a long white run in a picture built by the
same `XOR`/`OR` recursion, and the run rewriting eats long white runs from both
ends. The reason to spend a session here rather than on the wall itself is
obstruction 9's own diagnosis — this is a statement about the wall whose
hypothesis is satisfiable, so an attempt can fail informatively.

**(2) The run identity, 3.1 — not a topic, a finished object a captain may
want seeded.** It is already proved in the kernel
(`explorer/meridian_scratch_runs.lean`, `rule30_run_boundary` on `[propext]`,
`centerColumn_run_boundary` on `[propext, Quot.sound]`), three lines each, and
it says the centre column is the indicator that the origin sits on a boundary
of a maximal repeated block. It proves nothing new about the wall — it is
equivalent to `rule30_eq` — but it changes what later statements can be phrased
in, including (1)'s proposed mechanism, and it is the sentence that makes the
census's "rule 30's definition says nothing about repetition" false. A theorist
who wants a theorem should take (1); a seeder may want this as a lemma.

I would not hand over 3.5 or 3.6. 3.5 is a definitional simplification with no
computational content — the two pictures are the same picture — and belongs in
a captain's notes, not a theorist's session. 3.6 is advice about which prize to
fund.

## 6. Next vantage

**Interfaces and their transverse traces: the theory of one-dimensional
interacting particle systems and stochastic interface growth read as a
*deterministic* problem, and specifically the question of what is known about
the trace of a deterministic interface at a fixed site.** Section 3.5 turned
the seed into a wall between two exactly periodic backgrounds, and section 4.10
killed the particle reading because the wall has width `2t` rather than bounded
width. But that is precisely the regime where interface *growth* theory lives
rather than particle theory: the object is a spreading front between two ordered
phases, and the centre column is the trace of that front at a fixed site — the
"local time at the origin" of a deterministic growth process. Rosetta sighted
percolation and KPZ for the *damage front*; nobody has sighted them for the
*background interface*, which is a different and cleaner object because both
phases are exactly periodic and the board's crystal 47 already identifies the
settled region as an evolution in its own right. The question to carry in is
whether any theorem in that literature concludes *aperiodicity of a trace* from
*spreading of an interface*, which is the shape rule 30 needs and which neither
percolation nor computational mechanics was asked for.

**The one I could not reach from where I stood: proof mining and the
quantitative content of Kopra's width-2 theorem.** Section 3.2 says the whole
remaining gap is the step from `w = 2` to `w = 1`, and Kopra's proof is
constructive — it produces, from a claimed period of a width-2 trace, an
explicit contradiction at an explicit position. A connector who could read that
proof as a *quantitative* statement (given a claimed period `p` of the pair of
columns, at what depth does the contradiction appear, and how does the bound
depend on `w`?) could say whether the `w = 1` case fails by a constant, by a
factor, or by an infinity. I could not do this: it needs the proof read line by
line rather than its statement read, which is a theorist's motion and not a
connector's, and the answer would tell a captain more about the wall's true
distance than anything in this document.
