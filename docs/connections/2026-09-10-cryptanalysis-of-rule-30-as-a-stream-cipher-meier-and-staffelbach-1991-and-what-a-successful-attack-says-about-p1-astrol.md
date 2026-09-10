# Sighting: rule 30 as a stream cipher

**Vantage.** Cryptanalysis of rule 30 as a keystream generator — Meier and
Staffelbach, EUROCRYPT 1991 — and what a *successful* attack says about P1.
Astrolabe's handoff, and the reasoning is theirs: a cryptanalytic attack is an
algorithm that predicts the centre column from partial information, so this is
the only literature in which anyone has systematically tried to *find* the
shortcut whose non-existence the prize asserts.

**Connector.** Dioptra, 2026-09-10. A sighting, not a proof.

**Source status, said plainly at the top.** *Meier and Staffelbach 1991 was not
obtained.* Springer's PDF (`link.springer.com/content/pdf/10.1007/3-540-46416-6_17.pdf`)
answers a 303 redirect to `idp.springer.com/authorize`, which is a login and
therefore out of bounds; four web searches turned up no other copy. **Every
statement attributed to Meier and Staffelbach in this document is secondhand,
through two sources I did fetch**: Spencer 2013 (arXiv 1306.3546, fetched as
readable text through ar5iv, and independently present in `sources/` as a PDF
extraction — the two agree word for word where I compared them), and Wolfram's
own NKS note on rule 30 cryptography. Where I say "Meier–Staffelbach", read
"Spencer's account of Meier–Staffelbach".

---

## 1. The problem, seen from outside

Take a doubly infinite row of bits, all zero except a single one at position
zero. Update the whole row in lock-step, for ever, by the local rule

> `new(i) = old(i-1) XOR (old(i) OR old(i+1))`.

Read off the bit at position zero after each step. That gives one explicit,
computable, infinite binary sequence — you can print a billion of its terms on
a laptop. Nobody has proved that it is not eventually periodic. Everything
measured says it is not. The residual is: **prove that this sequence is not
eventually periodic.**

(The project's wall is stated as an implication — "if the centre column
repeats, some other column repeats" — but the project also holds a proved
theorem saying no two columns can both repeat, and an implication whose
conjunction is impossible is equivalent to the negation of its hypothesis. So
the wall *is* the aperiodicity statement, and I treat it as such throughout.)

**Restated in this vantage's own terms.** The row is the state of a nonlinear
feedback register; the local rule is its feedback function; the bit at position
zero is the keystream. The key is fixed, public, and as degenerate as a key can
be: a single one. The keystream is the sequence Wolfram proposed as a cipher in
1985 and Meier and Staffelbach broke in 1991. The residual, in cipher language,
is: **this keystream has infinite period.** Four equivalent or sufficient forms,
each the natural object of a different corner of the field:

- The keystream's **linear complexity** `L(n)` — the length of the shortest
  LFSR generating its first `n` bits — is unbounded. *Equivalent to P1.*
  (Eventually periodic with preperiod `N` and period `p` gives the annihilator
  `x^N (x^p - 1)`, so `L(n) ≤ N + p` for every `n`.)
- Its **generating function** `∑_{t≥0} c(t) x^t` is irrational over `F_2(x)`;
  equivalently its continued fraction in `F_2((x))` is infinite. *Equivalent
  to P1.*
- Its **Hankel matrices** `H_m = (c(i+j))_{0 ≤ i,j < m}` over `F_2` are
  nonsingular for infinitely many `m`. *Sufficient*: one nonsingular `H_m`
  gives `L(2m) = m`, hence `N + p ≥ m`.
- Its **2-kernel** `{ t ↦ c(2^k t + r) : k ≥ 0, 0 ≤ r < 2^k }` is infinite.
  *Sufficient, and strictly stronger than P1*: eventually periodic gives a
  finite kernel directly, and by Christol's theorem a finite kernel is exactly
  algebraicity of the generating series over `F_2(x)`, which is a much larger
  class than rationality.

The third and fourth are the ones worth staring at, because they are the only
forms in which anybody has ever *proved* the corresponding statement for an
explicit combinatorially-defined sequence.

---

## 2. Fields sighted

| Field / theory | The object there | The seam, in one line |
|---|---|---|
| Stream-cipher cryptanalysis (Meier–Staffelbach 1991) | The centre column is a keystream; the row is the register state; their "solve the left triangle" is the project's `leftSolve` | Their unknown is the key; P1's key is known, so the attack has nothing to recover |
| Key-recovery cost / guessing entropy | Their measured 18.1 bits at ring width `n = 300` | Every cost in that literature is a function of `n`, and the residual has no `n` |
| LFSR theory, Berlekamp–Massey | Linear complexity profile of the centre column | Measured here to depth 60,000: statistically identical to a fair coin on every statistic |
| Function-field Diophantine approximation (Artin, Niederreiter) | `c` ↔ a Laurent series over `F_2`; eventual periodicity ↔ rationality; the LC profile ↔ the degrees of the continued fraction's partial quotients | A bounded-partial-quotient ("badly approximable") series is the provable case, and rule 30's degrees grow like `log n` |
| Hankel determinants of automatic sequences (Allouche–Peyrière–Wen–Wen; Han) | `det H_n ≠ 0` for all `n`, proved for Thue–Morse | Those proofs run on the substitution; rule 30's column has no substitution and a measured 2-kernel of size ≥ 512 |
| Perfect linear complexity profiles (Wang–Massey) | A one-line bit recursion `s_{2i+1} = s_{2i} + s_i` characterising `L(n) = ⌈n/2⌉` exactly | Rule 30 violates it at rate 0.5029 — a coin's rate |
| Automatic sequences, Christol's theorem | Finite 2-kernel ⟺ generating series algebraic over `F_2(x)` | Gives a sufficient condition strictly stronger than P1, so a harder target with better machinery |
| 2-adic complexity, FCSRs (Klapper–Goresky) | `∑ c(t) 2^t ∈ Z_2` rational ⟺ `c` eventually periodic | The project's own 2-adic tower (`stepMod`, the T-map) runs along the *left diagonals*; the centre column is a diagonal of that tower, not a coordinate of it |
| Mahler functions / `k`-regular sequences | A functional equation in `x → x^2` | The proved halving identity `step(2s) = 2·step(s)` is about the row *number*, not the generating variable |
| Algebraic / cube attacks (Courtois–Meier, Dinur–Shamir) | `c(t)` as a Boolean function of the seed bits; its algebraic degree | The seed is one bit; there are no key variables to raise to a degree |
| Correlation attacks (Siegenthaler) | A bias between the keystream and a linear function of the state | That is P2 (balance), not P1 |
| Time–memory–data tradeoffs (Babbage, Golić, Biryukov–Shamir) | Attack cost as a function of state entropy | The state here is infinite; the tradeoff curve has no `x`-axis |
| NLFSR / de Bruijn theory | Rule 30 on a ring is a nonlinear feedback shift register with a known cycle structure | A ring has bounded diagonal periods; the project has *proved* the real thing does not |
| Symbolic dynamics, factor complexity | Number of distinct length-`k` windows of the column | Already the project's own instrument (crystal 21) |
| Coding theory (BCH decoding) | Berlekamp–Massey is literally the syndrome-decoding algorithm | Same object under a different name; buys nothing |
| Statistical distinguishers (NIST STS, Diehard) | Rule 30 is one of 12 elementary rules with near-ideal measured LC | A passed test is the absence of a bound, not the presence of one |

---

## 3. Connections

### 3.1 The attack is `leftSolve`, and its success is a theorem this board already owns

**The claim.** Meier and Staffelbach's algorithm is, line for line, the
project's `leftSolve` driven by `column_one_of_white`; the reason it works is
`evolveHalfLeft_eq_column`; the reason it does not work perfectly is the
project's proved right-edge shield; and **there is nothing left in it that P1
has not already been told.**

**The dictionary.**

| This project | Meier–Staffelbach / Spencer | Row checked how |
|---|---|---|
| `centerColumn`, the centre column | "the temporal sequence" of the central cell `s_c` | definitional |
| `column X 1`, column 1 | "the right-adjacent sequence" | definitional |
| `rule30_leftPermutive` | "the left-toggle property of rule 30" | the board's own proved node; Spencer names it |
| `leftSolve` / `sideways_inverse`: columns 0 and 1 rebuild everything to their left | "solve the left triangle from `t = ⌊n/2⌋` backward up to `t = 0` to complete the seed" | the two recursions are the same expression |
| `evolveHalfRight`: the right half is driven by the centre column and row 0 | "Evaluate the cells `S(t)_{c+1:n-t}` … the computed cells now form a triangle" | definitional |
| The guess of `⌊n/2⌋` seed bits | the attack's only search | — |
| The search tree of that guess, on the single seed under the cone | **obstruction 3's window count** | reproduced exactly, `1, 2, 4, 5, 10, 20, 40, 67, 89, 178, 356, 456, 912, …, 215264` at `T = 0..21`, by an engine sharing no code with `whiteleft.mjs` (`explorer/dioptra_coverage.mjs`) |
| `column_succ_of_black` (black centre pins column −1) | Spencer's "no more than `n − j − 1` coins, `j` the number of 1s in `σ`" | the coin count and the pinned times are the same set |
| `evolveHalfLeft_eq_column` (column −1 is a function of the centre column alone, under the cone) | *the attack's silent premise* | measured: **1** distinct column-(−1) prefix among 22,917,120 consistent windows at depth 28 |
| The right-edge shield (obstruction 10) | "not all right halves of the seed are equiprobable, so far fewer than `n/2` guesses are required" | the shield is a proved, infinite family of seeds with identical centre column |
| **Seam 1** | The attack's unknown is the *seed*. P1's seed is `initialConfig`, a single black cell, and is known. | The attack has zero work to do on the object P1 is about |
| **Seam 2** | Every cost in that literature is a function of the ring width `n`; `2^{n/2}` worst case. | The residual is on `ℤ`; there is no `n`, and the cost is `2^∞` |
| **Seam 3** | The literature's "toggle" / "permutivity" naming is orientation-ambiguous | A 2024 survey writes rule 30's ANF as `x₁ ⊕ x₂ ⊕ x₁x₂ ⊕ x₃` and says it "depends linearly on the rightmost variable x₃" — in that indexing `x₃` is the *left* neighbour. This board has already been burnt by exactly this once (Rowan's correction of the captain's brief). |

**What it leans on.**

- Spencer 2013, fetched from <https://ar5iv.labs.arxiv.org/html/1306.3546>:
  > "given this temporal sequence, they showed that the left half of the CA's computational history was uniquely determined if the right-adjacent sequence could be guessed due to the left-toggle property of rule 30."

  and the algorithm, quoted there as: "Guess ⌊n/2⌋ bits for the right half of
  the initial state / Compute forward n/2 time steps, forming a right triangle
  of known values / Solve the left triangle backward to recover the complete
  seed."
- Wolfram, NKS note, fetched from
  <https://www.wolframscience.com/nks/notes-10-10--rule-30-cryptography/>:
  > "In 1985 and soon thereafter a number of people (notably Richard and Carl Feynman) tried to cryptanalyze rule 30, but without success."
  > "In 1991 Willi Meier and Othmar Staffelbach described essentially the explicit cryptanalysis approach shown on page 601."
- **UNVERIFIED**: Meier–Staffelbach 1991 itself. Searched Springer (paywalled,
  303 → `idp.springer.com/authorize`), and four web searches; no free copy found.

**The test.** Run the attack's own search tree on the single seed and ask what
it leaves undetermined. `explorer/dioptra_col1.mjs`, exhaustive to depth 28:
among the **22,917,120** configurations white on `x ≤ −1` whose centre column
agrees with the seed's to depth 28, there is exactly **1** distinct column-(−1)
prefix and there are exactly **3** distinct column-1 prefixes, and the three
differ **only at `t = 0` and `t = 1`**. The truncation is exact (`col_j(t)`
reads row 0 on `[j − t, j + t]`, so the recorded prefixes stop where the
enumeration decides them). A theorist can falsify this by exhibiting two
configurations white on `x ≤ −1` with the seed's centre column and different
column 1 from `t = 2`.

**What it would give.** Nothing towards P1, and that is the finding. It
*explains* the 18.1 bits — the keystream nearly determines the state, which is
why the attack is cheap — and it says the explanation is a theorem the board
already has (`evolveHalfLeft_eq_column`) plus one it has already proved is the
obstruction (the shield). What remains after this connection is the whole of
P1.

---

### 3.2 The `0*1*` law is a new forcing identity, and it is the white-time companion of the board's black-time law

**The claim.** The one *positive* structural fact the cryptanalysis of rule 30
turns on — Meier and Staffelbach's observation that the right-adjacent sequence
reads `0*1*` under a run of zeros — is, in this project's vocabulary, a second
law pinning the centre column to column −1, it is not on the board, it is four
lines in Lean, and it raises the fraction of the centre column that is a
function of column −1 alone from **0.5004 to 0.6885**.

**The dictionary.**

| This project | Cryptanalysis | Row checked how |
|---|---|---|
| A maximal run of white centre cells `[s, e]` | "where the temporal sequence is a sequence of 0s" | definitional |
| `column X 1` restricted to `[s, e]` | "the right-adjacent sequence must match `0*1*`" | **kernel-proved**: `white_run_monotone`, `explorer/dioptra_scratch_whiterun.lean`, axioms `[propext, Quot.sound]` |
| The mechanism: at a white centre, `col1(t+1) = col1(t) ‖ col2(t)` | — (the literature states the shape, not the mechanism) | one line from `rule30_eq`; measured 0 failures over 5,251 white centre times across 8 configurations — the seed, six random finite ones and the bi-infinite `(100)^Z` — and a mutant (`‖ → &`) fires 47 times of 95 (`explorer/dioptra_whiterun.mjs`) |
| `column_succ_of_black`: at a black centre, `col0(t+1) = ¬col(−1)(t)` | Spencer's freebie: the coins are needed only at the 0s of `σ` | proved on the board |
| **New**: at a *double-white* centre with `col(−1)(t)` black, `col0(t+2) = ¬col(−1)(t+1)` | the other half of the same coin count | **kernel-proved**: `centre_forced_after_double_white`, same file |
| **New**: a forbidden block in the pair `(column 0, column −1)` read *down time* — three white centre cells forbid column −1 going black then white | — | **kernel-proved**: `white_run_forbidden`; measured 0 violations in 1,188 occasions across 8 configurations, while the other three patterns occur 150 / 123 / 267 times on the seed |
| Obstruction 9's reduction: the wall is "column 1, read at the **white** times of the centre column, is eventually periodic" | the search space of the attack | on the board |
| **The reduction this sharpens it to**: column 1 on a white run of length `L` is `0^a 1^{L−a}`, so the whole residual is **one integer per white run** | the switch position the attack has to guess | measured: 0 shape violations over **50,045** maximal white runs of the seed to 200,000 rows (`explorer/dioptra_switch.mjs`) |
| **Seam** | crystal 8's forbidden block is two adjacent cells of a *row*; this is two adjacent times of a *column pair* | different object, same name — do not conflate them |
| **Seam** | the law constrains column 1 *given* the centre column; it does not constrain the centre column | it cannot by itself force aperiodicity |

**What it leans on.**

- Spencer 2013, fetched from <https://ar5iv.labs.arxiv.org/html/1306.3546>:
  > "Meier and Staffelbach note in [28] that where the temporal sequence is a sequence of 0s, the right-adjacent sequence must match 0*1*."
- Everything else is proved in `explorer/dioptra_scratch_whiterun.lean`, which
  `lake env lean` accepts, with `#print axioms` giving `[propext, Quot.sound]`
  on all four theorems. It imports `Rule30.Basic` only.

**The test.** Two, one of each kind.

*Ran.* `explorer/dioptra_coverage.mjs`, 200,000 rows. The identity
`col0(s) = ¬col(−1)(s−1)` holds at **150,154** of 199,998 times (0.7508 — it
holds exactly when `col0(s−1) ‖ col1(s−1)`). The board's black law reaches
**100,071** of them (0.5004). The new double-white law reaches **25,021**
(0.1251) — a set disjoint from the black law's, since its target times have a
white predecessor. Together: **0.6255**, and iterating the monotonicity across
the whole white run rather than one step: **0.6885**.

*To falsify.* In the project's vocabulary: *there exist a configuration `X` and
a time `t` with `column X 0 t = false`, `column X 0 (t+1) = false`,
`column X (-1) t = true` and `column X 0 (t+2) ≠ !(column X (-1) (t+1))`.*
That is `centre_forced_after_double_white`, and it is proved, so the honest
falsification target is the *use*: that the switch-index reformulation of
obstruction 9's residual is vacuous.

**What it would give.** It touches the residual directly. Obstruction 9 says
the wall *is* "column 1 read at the white times of the centre column is
eventually periodic". After this law, that object is not a bit-sequence but a
sequence of small non-negative integers, one per maximal white run — the seed's
first forty are `1 2 0 1 1 1 1 0 1 1 0 1 1 0 1 0 1 1 0 1 1 1 1 2 2 1 1 3 1 0 0
1 2 1 1 1 1 1 0 4`, with histogram `0:12697 1:27956 2:7066 3:1732 4:452 5:109
6:26 7:5 8:2` over 200,000 rows, and every one of its 50,014 length-32 windows
distinct. The information in the residual drops from 99,927 bits to 73,262
(`∑ log₂(L+1)`), a factor 1.36. What would remain is everything: a factor of
1.36 is not an argument, and the switch indices are as complex as the column
was.

---

### 3.3 Linear complexity is the only positive route in print, and rule 30 sits on the wrong side of the one theorem that exists

**The claim.** A proved lower bound on linear complexity growth is a sufficient
condition for P1 and is the shape a positive route must have; such bounds
*exist* for explicit sequences (Thue–Morse, the period-doubling sequence); and
they exist **only** for sequences whose linear complexity profile is *rigid* —
every partial quotient of bounded degree — whereas rule 30's profile is, on
every statistic measurable to depth 60,000, a fair coin's. That is not a
suggestive analogy; the numbers coincide to the digit.

**The dictionary.**

| This project | Linear complexity / continued fractions over `F_2((x))` | Row checked how |
|---|---|---|
| `centerColumn` | the coefficient sequence of `F(x) = ∑ c(t) x^t ∈ F_2[[x]]` | definitional |
| `IsEventuallyPeriodic centerColumn` | `F` is rational over `F_2(x)`; equivalently `L(n)` is bounded | `L(n) ≤ N + p` from the annihilator `x^N(x^p−1)` |
| The eventual period `p` and onset `N` | `N + p ≥ L(n)` for every `n` | `explorer/dioptra_lc.mjs`: `L(20000) = 10000`, so **`N + p ≥ 10000` unconditionally** |
| Crystal 21's distinct-factor certificate | the same job, done better | at depth `n` factor counting gives `≈ n` where Berlekamp–Massey gives `n/2`, in `O(n log n)` against `O(n²)`. **Linear complexity is the worse certificate.** |
| The jumps of `L` | the degrees of the partial quotients of `F`'s continued fraction | `explorer/dioptra_lc.mjs` |
| A *perfect* profile, `L(n) = ⌈n/2⌉` | all partial quotients of degree 1; all Hankel `H_m` nonsingular | period-doubling: **30000/30000** nonsingular at `n = 60000`. *Note on what was measured*: the scripts compute `L(2m) = m` and use the standard Hankel–Kronecker equivalence `det H_m ≠ 0 ⟺ L(2m) = m` as the definition; no determinant is computed directly, so every "nonsingular Hankel" figure below is really a linear-complexity figure wearing that equivalence. |
| Thue–Morse | **all 15,000 partial quotients of degree exactly 2**; `H_m` nonsingular exactly at even `m`; `max |L(n) − n/2| = 1.0` at every depth from 1,000 to 60,000 | `explorer/dioptra_switch.mjs`, `dioptra_lc2.mjs` |
| **Rule 30's centre column** | degrees geometric(1/2): `1:2481 2:1244 3:612 4:310 5:154 6:70 7:45 8:21 9:16 10:8 11:3 12:1 13:1` at `n = 20000`; largest degree **14** at `n = 60000` against `log₂ 60000 = 15.9`; `max|L−n/2| = 7.0`; Hankel density **0.4988** | `explorer/dioptra_lc.mjs`, `dioptra_lc3.mjs` |
| A nonlinear fair coin | largest degree **14**; `max|L−n/2| = 7.0`; Hankel density **0.5030** and **0.4980** on two seeds | same file — *the three statistics agree with rule 30's to the digit* |
| Rule 90's centre column (the linear control) | `L(8192) = 1` | the criterion really does separate |
| Wang–Massey: `s_1 = 1` and `s_{2i+1} = s_{2i} + s_i` | perfect profile | calibrated: period-doubling **0 violations of 29,999**; rule 30 **15,087 of 29,999**, rate **0.5029**; coins 0.4892 and 0.5008 |
| **Seam** | Every proof of unbounded LC for an explicit sequence in print goes through a *substitution*: the Hankel determinants satisfy a finite system of recursions because the sequence is 2-automatic | rule 30's centre column has a 2-kernel of size **≥ 512** (§3.4) and no substitution |
| **Seam** | "Apwenian" is a condition on the `±1` sequence over `Z` (`H_n / 2^{n−1}` odd), not on the `0/1` sequence over `F_2` | Thue–Morse is Apwenian and yet exactly **half** its `F_2` Hankel matrices are singular — the two conditions are not the same condition |

**What it leans on.**

- Allouche, Peyrière, Wen and Wen, *Hankel determinants of the Thue-Morse
  sequence*, Annales de l'institut Fourier 48 (1998), fetched from
  <http://www.numdam.org/item/AIF_1998__48_1_1_0/>:
  > "Applications are given, namely to combinatorial properties of the Thue-Morse sequence and to the existence of certain Padé approximants of the power series ∑ n≥0 (-1)^{ϵn} x^n."
- Han et al., *Computer assisted proof for Apwenian sequences related to Hankel
  determinants*, fetched from <https://arxiv.org/abs/1601.04370>:
  > "An infinite ±1-sequence is called Apwenian if its Hankel determinant of order n divided by 2^{n-1} is an odd number for every positive integer n."
- Spencer 2013, fetched (ar5iv, as above): rule 30 is among the twelve
  elementary rules whose "linear complexity approaches ℓ/2 (the ideal): 30, 45,
  75, 86, 89, 101, 106, 120, 135, 149, 169, 225".
- **UNVERIFIED**: the Wang–Massey characterisation (`s_1 = 1`,
  `s_{2i+1} ≡ s_{2i} + s_i mod 2`). Taken from a web-search summary of
  Wang and Massey, EUROCRYPT '86; I could not fetch the paper (the open-access
  candidate, Han's `irma.math.unistra.fr/~guoniu/papers/p111plcp.pdf`, fetched
  as unreadable binary). **It is however calibrated rather than trusted**: the
  period-doubling sequence, independently measured here to have a perfect
  profile, satisfies the recursion with 0 violations of 29,999, and every
  sequence measured here *not* to have a perfect profile violates it at rate
  ≈ 0.5. So whatever the paper says, the criterion as used here separates the
  cases correctly on five sequences.

**The test.** Ran, and it is the whole connection: `explorer/dioptra_lc3.mjs`,
depth 60,000, six sequences, three statistics. **Rule 30 = coin on all three.**
The falsifiable statement for a theorist: *there is a function `f(n) → ∞` and a
proof that `L(n) ≥ f(n)` for the centre column.* No such proof exists for any
explicit CA sequence — I searched and found none, and the nearest things in
print are the automatic-sequence Hankel results above, which are about
sequences of a kind rule 30's column is measurably not.

**What it would give.** A proof of `L(n) → ∞` is P1 outright, with no residual.
That is why the route is worth naming even though it is closed here: it is the
only route sighted from this vantage whose *conclusion* is the prize rather
than a step towards it. What is missing is any mechanism, and the measurements
say the missing mechanism is not a small one.

---

### 3.4 Christol's theorem: an infinite 2-kernel is a sufficient condition, and rule 30's kernel is measurably enormous

**The claim.** "The 2-kernel of the centre column is infinite" implies P1, is
purely combinatorial, needs no dynamics, and is the only sufficient condition
sighted here that comes with an established decision-procedure literature —
and rule 30's 2-kernel already has at least 512 elements, growing at the
maximum possible rate.

**The dictionary.**

| This project | Automatic sequences | Row checked how |
|---|---|---|
| `centerColumn` | the sequence `c` | definitional |
| `IsEventuallyPeriodic centerColumn` | `c` is 1-automatic; its 2-kernel is finite (elementary, no Christol needed) | preperiod-7 period-5 control saturates at **8** kernel elements |
| The 2-kernel `{ t ↦ c(2^k t + r) }` | the standard 2-kernel | `explorer/dioptra_kernel.mjs` |
| Generating series algebraic over `F_2(x)` | `c` is 2-automatic (Christol) | — |
| Generating series *rational* | `c` eventually periodic | rational ⊂ algebraic, so **infinite kernel ⟹ P1** |
| The board's power-of-two structure (`leftDiagonal_periodicFrom_pow`, `rightDiagonal_periodicFrom_pow`, the doubling positions) | exactly what a 2-automatic sequence looks like — which is why the temptation is real | but those are properties of the *diagonals*, not of the column |
| The proved halving identity `step (2s) = 2 · step s` | a candidate Mahler/Frobenius relation | it acts on the row *number*, i.e. across space, not on `t` |
| **Measured**: rule 30's 2-kernel, distinct members at depth `k` | `1, 2, 4, 8, 16, 32, 64, 128, 256, 512` — every one of the `2^k` subsequences distinct on a prefix of length 128 | `explorer/dioptra_kernel.mjs`, packed-row engine checked against `Rule30/Basic.lean`'s kernel-verified prefix |
| Thue–Morse | `1, 2, 2, 2, …` — kernel size **2** | same file |
| Period-doubling | kernel size **3** | same file |
| A nonlinear coin | `1, 2, 4, …, 512` — identical to rule 30 | same file |
| **Seam** | Infinite kernel is *strictly stronger* than P1, so this is a harder target, not an easier one | rational ⊊ algebraic |
| **Seam** | The decision procedures (Allouche–Shallit's kernel test, Walnut) decide automaticity for sequences *given by an automaton*; they cannot take an arbitrary computable sequence as input | no algorithm applies here |
| **Seam** | A finite computation gives only a *lower* bound on the kernel | which is the useful direction, but never a proof |

**What it leans on.** Christol's theorem (finite 2-kernel ⟺ algebraic over
`F_2(x)`) — **UNVERIFIED**: I did not fetch a statement of it; searched for
"Christol theorem automatic algebraic power series" only obliquely, through the
Apwenian and Hankel searches above. The *implication I actually use* —
eventually periodic ⟹ finite 2-kernel — is elementary and does not need
Christol, and it is calibrated here: the preperiod-7 period-5 control saturates
at 8 kernel elements. Christol is what makes the condition interesting rather
than what makes it true.

**The test.** Ran: `explorer/dioptra_kernel.mjs`. Rule 30's 2-kernel has
**at least 512** distinct members — a rigorous lower bound, since the length-128
prefixes literally differ — against Thue–Morse's 2 and an eventually-periodic
sequence's 8. To falsify: exhibit two pairs `(k, r) ≠ (k', r')` with
`c(2^k t + r) = c(2^{k'} t + r')` for all `t`, at any depth.

**What it would give.** A proof would give P1 and more. In practice its value is
the opposite direction: it is a **new certificate**, cheaper than crystal 21's
factor counting per bit of conclusion at small depth, and it says something the
factor count does not — that the column has no self-similarity under
decimation by powers of two, which is precisely the symmetry the board's
diagonal structure keeps almost-suggesting.

---

### 3.5 The cost tension the brief posits is not there, and the reason is worth stating exactly

**The claim.** An attack that predicts the centre column cheaply is *not* in
tension with P1 or with P3, and the reason is not a matter of constants: the
attack's **input is the sequence P1 is about**. A perfect attack, costing
nothing, would say nothing about whether that sequence repeats — and if it
repeated, the attack would get *easier*.

**The dictionary.**

| This project | Cryptanalysis | Row checked how |
|---|---|---|
| P3: computing `centerColumn t` requires effort growing with `t` | a *shortcut*: a map `t ↦ c(t)` cheaper than iterating | — |
| Meier–Staffelbach's attack | a map `(c(0..n/2)) ↦ (a compatible seed)` | Spencer's algorithm summary, fetched |
| Its cost, `18.1` bits of search at `n = 300` | guessing entropy of the *seed given the keystream* | Spencer, fetched |
| Its cost in cell updates | `2^{18.1}` trials × `Θ(n²)` per trial ≈ `5·10⁸` for `n = 300` | arithmetic on the quoted figures |
| Forward simulation of the same ring for the same output | `n` updates per bit | the attack is not cheaper, and it must read `n/2` bits before it starts |
| What the attack outputs | a seed, from which you still simulate | so it accelerates *nothing* about `t ↦ c(t)` |
| The seed for P1 | `initialConfig`, known, one black cell | conditional entropy **zero**; the attack's whole cost is zero and its whole yield is nothing |
| The attack's non-uniqueness | the shield, proved on the board | measured: 22,917,120 windows, 3 column-1 prefixes (§3.1) |
| **Seam, and it is the point** | The attack is a *key recovery*. P1 is a statement about the keystream with the key fixed. These are different problems that happen to mention the same sequence. | — |
| **Seam** | The 18.1 bits is a *conditional entropy of the state*, not a *count of preimages*: 22.9M windows at depth 28 coexist with 3 column-1 prefixes | the two numbers measure different things and neither bounds the other |

**What it leans on.** Spencer 2013, fetched (ar5iv):
> "For n=300, for instance, a probabilistic algorithm requires 18.1 bits of entropy to recover the seed with a probability of 0.5."

**The test.** No script; the argument is arithmetic on quoted figures and I ran
none, because the claim is about the *shape* of the quantities. A theorist can
kill it by producing any cryptanalytic result whose cost is `o(t)` in the length
of keystream produced — i.e. a genuine shortcut rather than a state recovery.
I found none in the literature reachable from here.

**What it would give.** It closes a route. **A negative, and the brief asked for
it: every attack in this literature exploits finite-width structure — a ring of
`n` cells, a triangle of `n/2` rows, a seed of `n` bits — and its cost is a
function of `n`. The infinite centre column has no `n`, and every one of these
costs is `2^∞` there.** A session spent looking for the shortcut in the
cryptanalytic literature will find the shortcut, and it will be a shortcut to a
different problem.

---

## 4. Died in translation

- **"A cheap attack and P1 are in quantitative tension."** The brief's own
  premise, and mine for the first hour. Died on the direction of the arrow: the
  attack's *input* is the centre column. If the column were eventually periodic
  the attack would be easier, not harder. §3.5.
- **"Meier–Staffelbach's 18.1 bits is an entropy of the centre column."** It is
  the conditional entropy of the *seed given* the centre column. For the single
  seed it is exactly zero, and the quantity has no content on `ℤ`.
- **"Guessing entropy bounds the number of preimages."** Died on my own
  measurement: 22,917,120 consistent windows at depth 28 against 3 distinct
  column-1 prefixes. The search cost and the ambiguity are different numbers and
  neither bounds the other.
- **"The centre column determines column 1, for every configuration white far to
  the left."** I believed this for twenty minutes on the strength of the seed's
  own 22.9M-to-3 count. **False.** `explorer/dioptra_determine.mjs`, exhaustive
  over `2^19` rows supported in `[0, 18]`: the centre column beginning
  `011011100011…` has two members of its group disagreeing at column 1 at
  `t = 17`, and columns 2, 3, 4, 5 disagree at `t = 16, 15, 14, 13` inside the
  *seed's own* group. What is true is the weaker pair: column −1 is always
  determined (that is `evolveHalfLeft_eq_column`, 0 disagreements at `j = −1,
  −2, −3` at every depth checked), and the seed's own column 1 is determined
  from `t = 2` to depth 27. Without the cone, column 1 is not determined at all
  (control: disagreement at `t = 9` of 9).
- **"Thue–Morse is Apwenian, so all its Hankel determinants over `F_2` are
  nonzero."** Died at the first run: exactly **15000 of 30000** are, and the
  nonsingular ones are exactly the even `m`. "Apwenian" is `H_n/2^{n−1}` odd for
  the `±1` sequence over `Z`; it does not transfer bit-for-bit to the `0/1`
  sequence over `F_2`, and I had assumed it did. The rigidity that *does*
  transfer is the partial-quotient degree, which is exactly 2 for all 15,000 of
  them.
- **"Rule 30's near-ideal measured linear complexity is evidence of structure."**
  Spencer's twelve-rule table reads that way. It is evidence of the *absence* of
  structure: an ideal profile is what a coin has, and the coin's numbers here
  are rule 30's numbers.
- **"A linear-complexity certificate would beat the board's factor counting."**
  Died on cost. Berlekamp–Massey is `O(n²)` and yields `N + p ≥ n/2`; the board's
  distinct-factor count is `O(n log n)` and yields `≈ n`. Worse on both axes.
  Worth recording so nobody re-derives it as an improvement.
- **"My `fair coin` row is a fair coin."** It was the low bit of xorshift32,
  which is a linear generator with linear complexity 32 — so the row read
  `max|L − n/2| = 29968` and looked like a wild deviation when it was a tiny
  one. Caught by asking what a coin's number *should* be. Corrected in
  `explorer/dioptra_lc3.mjs` with a multiply-mix generator, and it is the
  corrected row that makes §3.3's coincidence with rule 30 mean anything.
- **"OEIS A051023 begins `110111001011110001001010`."** My first control string,
  written from memory, and **wrong**. The engine disagreed and the engine was
  right: `Rule30/Basic.lean` carries its own kernel-checked `decide` example
  pinning the first eleven centre cells as `11011100110`, which my engine
  reproduces. Recorded because it is the exact failure the brief warns about,
  committed inside a *control* rather than inside a citation.
- **"The cryptanalytic literature's orientation matches ours."** Half-died. A
  2024 survey (arXiv 2405.02875) gives rule 30's ANF as
  `x₁ ⊕ x₂ ⊕ x₁x₂ ⊕ x₃` and says it "depends linearly on the rightmost
  variable x₃" — where `x₃` is the *left* neighbour. Spencer's "left-toggle" is
  right. This board has already lost time to this once.
- **"Correlation attacks and distinguishers bear on P1."** They bear on P2.
  A bias in the keystream is a balance statement; no distinguisher in this
  literature is about periodicity.
- **"The right-diagonal / T-map power-of-two structure makes the centre column a
  candidate automatic sequence."** Died at the 2-kernel: 512 of 512 distinct.
  The powers of two live on the diagonals and in the row *number*; the column is
  the anti-diagonal of that tower, and inherits none of it.
- **"Rule 30 on a ring is the object to study, since that is what the literature
  studies."** Died against the board's own proved `leftDiagonal_period_unbounded`
  — the same death Rowan recorded for the ring-background DP. Every ring has all
  diagonal periods bounded by `lcm(N, T)`.

---

## 5. What to hand the theorist

**First, and the only one I would spend a session on: the white-time forcing
law and the switch-index reformulation of the residual.** (§3.2)

- *The claim to falsify.* Obstruction 9 reduces the wall to "column 1, read at
  the white times of the centre column, is eventually periodic". The claim is
  that this object is not a bit-sequence but a sequence of one small integer per
  maximal white run of the centre column — the position at which column 1
  switches from white to black inside that run — and that the wall is therefore
  exactly: *the switch-index sequence is eventually periodic.*
- *The dictionary row it depends on.* `white_run_monotone`:
  `column X 0 t = false → column X 1 t = true → column X 1 (t+1) = true`.
  Kernel-proved in `explorer/dioptra_scratch_whiterun.lean`, axioms
  `[propext, Quot.sound]`, four lines, importing `Rule30.Basic` only. Its
  companion `centre_forced_after_double_white` is the white-time twin of the
  board's `column_succ_of_black` and is the piece that is genuinely new: it is a
  second identity pinning the centre column to column −1, and together the two
  reach 0.6885 of the centre column where the black law alone reaches 0.5004
  (measured, 200,000 rows, `explorer/dioptra_coverage.mjs`).
- *What would settle it.* Three seedable statements, in the board's vocabulary,
  all already proved in scratch: `white_run_monotone`,
  `centre_forced_after_double_white`, `white_run_forbidden`. Then the real
  question, which I could not reach: does the switch-index reformulation
  interact with `X_b` (obstruction 9's family) in a way the bit-level statement
  did not? Specifically — for a periodic boundary `b`, the white runs of `b` are
  eventually periodic by hypothesis, so the residual is entirely in the switch
  indices, and those are integers bounded by the run lengths. If the run lengths
  are bounded by `L_max` (true for any periodic `b`), the switch indices live in
  a **finite alphabet** of size `L_max + 1`. That is a genuinely different
  object from an unbounded one, and obstruction 9's analysis did not have it.
- *Band, stated first as CLAUDE.md requires.* The three lemmas: **project-internal
  to known** — the `0*1*` shape is Meier–Staffelbach's, published in 1991, so
  the fact is known; its statement as a forcing identity on the centre column,
  and the 0.5004 → 0.6885 coverage figure, I found nowhere and would call
  **novel and very small**. The reformulation of obstruction 9's residual over a
  finite alphabet is the part worth a session.

**Second, and only if the first is spent: the finite-alphabet consequence for
`X_b`.** (§3.2 + obstruction 9)

- *The claim to falsify.* For an eventually periodic boundary `b` with maximal
  white run `L_max`, `X_b` is "good" (has another eventually periodic column)
  if and only if a sequence over the alphabet `{0, …, L_max}` — one letter per
  white run of `b` — is eventually periodic. Talus's `talus2_splits.mjs` sweep
  found onsets up to 798,077 rows and no statistic of `b` that predicts
  goodness; the switch-index sequence is a statistic of `X_b` rather than of
  `b`, and it has not been looked at.
- *The depth that would settle it.* Talus's own calibration applies: a bad
  verdict below `10^6` rows is worth nothing. Run the switch-index sequence for
  the known-good `b = 1 0^7` and the known-bad `b = (10)^∞` to `2.5 · 10^6` and
  compare their alphabets and their factor complexities.

I would **not** hand over §3.3 or §3.4. Both are honest sufficient conditions
and both are, on the measurements, further from reach than P1 itself. Their
value is in section 4: they say what a positive route would have to look like,
and they say rule 30 does not look like it.

---

## 6. Next vantage

**Transcendence of power series over `F_2(x)`: Mahler's method, Christol's
theorem, and the machinery Adamczewski and Bugeaud built for exactly this
shape of question.** I reached the *statement* of the target from here —
"`∑ c(t) x^t` is transcendental over `F_2(x)`" is a sufficient condition for
P1, and by Christol it is equivalent to the centre column not being 2-automatic
— and I measured that rule 30 is very far from automatic (2-kernel ≥ 512 where
Thue–Morse's is 2). What I could not reach is whether the *transcendence*
machinery has any purchase on a sequence defined by a cellular automaton rather
than by a substitution or a functional equation. That is a real question with a
real literature: Mahler's method proves transcendence from a functional
equation `F(x^2) = R(x) F(x)`, the board *has* a halving identity
(`step (2s) = 2 · step s`, proved, axioms `[propext, Quot.sound]`), and the
seam is that the board's identity acts on the row number and Mahler's acts on
the generating variable. Whether those can be made the same identity — whether
the packed-row model's 2-adic self-similarity can be pushed from space into
time — is exactly the question a connector standing in that field would know
how to answer in an hour and I could not answer in a session.

Two smaller ones I could not reach. **Non-commutative / free-probability
readings of the Hankel matrix**, where the singularity pattern of `H_m` is a
free-cumulant question and the 0.4988 density I measured has a limit theorem
behind it. And **the theory of `p`-adic dynamical systems on `Z_2`**, where the
board's `stepMod` tower is a genuine 1-Lipschitz `T`-function on `Z_2` and the
whole ergodic theory of such maps (Anashin's, in particular) is standing
unused beside a project that has independently rediscovered the tower three
times — Rowan's obstruction "Every regularity the T-map view has produced
reduces to Rowland's doubling positions" is, from that field, a statement about
the measure-preservation of a triangular map, and someone who knows that field
would know at a glance which of the board's T-map regularities are generic and
which are not.
