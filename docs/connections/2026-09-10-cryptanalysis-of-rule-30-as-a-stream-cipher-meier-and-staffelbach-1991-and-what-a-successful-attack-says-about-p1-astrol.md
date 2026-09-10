# Sighting: rule 30 as a stream cipher

**Vantage.** Cryptanalysis of rule 30 as a keystream generator — Meier and
Staffelbach, EUROCRYPT 1991 — and what a *successful* attack says about P1.
Astrolabe's handoff, and the reasoning is theirs: a cryptanalytic attack is an
algorithm that predicts the centre column from partial information, so this is
the only literature in which anyone has systematically tried to *find* the
shortcut whose non-existence the prize asserts.

**Connector.** Dioptra, 2026-09-10. A sighting, not a proof.

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
the wall *is* the aperiodicity statement, and I will treat it as such
throughout.)

**Restated in this vantage's own terms.** The row is the state of a nonlinear
feedback register; the local rule is its feedback function; the bit at position
zero is the keystream. The key is fixed, public, and as degenerate as a key can
be: a single one. The keystream is the sequence Wolfram proposed as a cipher in
1985 and Meier and Staffelbach broke in 1991. The residual, in cipher language,
is: **this keystream has infinite period.** Three equivalent forms, each of
which is the natural object of a different corner of the field:

- The keystream's **linear complexity** `L(n)` — the length of the shortest
  LFSR generating its first `n` bits — is unbounded. (Eventually periodic with
  preperiod `N` and period `p` implies `L(n) ≤ N + p` for every `n`.)
- Its **generating function** `∑_{t≥0} c(t) x^t` is irrational over `F_2(x)`,
  i.e. its continued fraction expansion in `F_2((x))` is infinite.
- Its **Hankel matrices** `H_n = (c(i+j))_{0 ≤ i,j < n}` over `F_2` are
  nonsingular for infinitely many `n`. (Any one nonsingular `H_n` gives
  `L(2n) ≥ n`, hence `N + p ≥ n`.)

The third is the one worth staring at, because it is the only form in which
anybody has ever *proved* the corresponding statement for an explicit
combinatorially-defined sequence.

---

## 2. Fields sighted

| Field / theory | The object there | The seam, in one line |
|---|---|---|
| Stream-cipher cryptanalysis (Meier–Staffelbach 1991) | The centre column is a keystream; the row is the register state; their "solve the left triangle" is the project's `leftSolve` | Their unknown is the key; P1's key is known, so the attack has nothing to recover |
| Key-recovery cost / guessing entropy | Their measured 18.1 bits at `n = 300` | Guessing entropy of a preimage *set* is not prediction cost of a *sequence*; the attack is slower than simulating forward |
| LFSR theory, Berlekamp–Massey | Linear complexity profile of the centre column | Measured near-perfect; no lower bound proved for any explicit CA sequence, ever |
| Function-field Diophantine approximation (Artin, Niederreiter) | `c` ↔ a Laurent series over `F_2`; eventual periodicity ↔ rationality; the LC profile ↔ the degrees of the continued fraction's partial quotients | A near-perfect profile is a "badly approximable" condition, and no mechanism forces one |
| Hankel determinants of automatic sequences (Allouche–Peyrière–Wen–Wen; Han) | `det H_n ≠ 0` for all `n`, proved for Thue–Morse | Those proofs run on the substitution; rule 30's column has no substitution and is measured non-automatic |
| 2-adic complexity, FCSRs (Klapper–Goresky) | `∑ c(t) 2^t ∈ Z_2` rational ⟺ `c` eventually periodic | The project's own 2-adic tower (`stepMod`) runs along the *left diagonals*, not along time |
| Mahler functions / `k`-regular sequences | A functional equation in `x → x^2` for the generating function | The project's proved halving identity `step(2s) = 2·step(s)` is about the row *number*, not the generating variable |
| Algebraic / cube attacks (Courtois–Meier, Dinur–Shamir) | `c(t)` as a Boolean function of the seed bits; its algebraic degree | The seed is one bit; there are no key variables to raise to a degree |
| Correlation attacks (Siegenthaler) | A bias between the keystream and a linear function of the state | That is P2 (balance), not P1 |
| Time–memory–data tradeoffs (Babbage, Golić, Biryukov–Shamir) | Attack cost as a function of state entropy | The state here is infinite; the tradeoff curve has no `x`-axis |
| NLFSR / de Bruijn theory | Rule 30 on a ring is a nonlinear feedback shift register with a known cycle structure | A ring has bounded diagonal periods; the project has *proved* the real thing does not |
| Symbolic dynamics, factor complexity | Number of distinct length-`k` windows of the column | Already the project's own instrument (crystal 21); no new information |
| Coding theory (BCH decoding) | Berlekamp–Massey is literally the same algorithm as syndrome decoding | Same object under a different name; buys nothing |
| Statistical distinguishers (NIST STS, Diehard) | The column passes; rule 30 is one of 12 rules with near-ideal measured LC | A passed test is the absence of a bound, not the presence of one |

---

## 3. Connections

*Filled below.*

---

## 4. Died in translation

*Filled below.*

---

## 5. What to hand the theorist

*Filled below.*

---

## 6. Next vantage

*Filled below.*
