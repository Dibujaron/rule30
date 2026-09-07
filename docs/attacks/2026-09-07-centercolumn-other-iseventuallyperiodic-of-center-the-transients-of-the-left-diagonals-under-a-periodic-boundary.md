# Attack: `centerColumn_other_isEventuallyPeriodic_of_center`, the transients of the left diagonals under a periodic boundary

Sextant, 2026-09-07, third session on this wall. An argument, not a
proof. Every survival below names the script, the depth, and what else
could have produced it. Scripts are under `explorer/` and run with
`node explorer/<file>.mjs`; the kernel check is
`explorer/scratch_doubling.lean`, accepted by
`lake env lean explorer/scratch_doubling.lean` with no output.

## 1. The residual, in one paragraph

Time runs down the picture. The left diagonals are the lines running down
and to the left from the apex, parallel to the left edge; the `k`-th one is
`k` cells in from the edge, and the centre column is its first cell (index
0) on every one of them. Each left diagonal settles into a repeating
pattern from some index on, its onset; the part before the onset is its
transient. Measured, the onset of diagonal `k` is near `0.31k`, so the
settled cells fill the region left of a line at slope about `0.24`, and the
band between that line and the centre column, growing linearly in time, is
made of transients. The wall says: if the centre column ever repeats, some
other column repeats too, and Jen's theorem then makes that impossible. My
second document reduced its content to the black-time test on the
half-line `x ≤ -1` driven by column 0: at every black time `t`,
`c(t+1)` is the complement of column -1 at `t`, and column -1 at `t` is
the index-1 cell of diagonal `t - 1`, inside its transient for every
`t > 18`. So the residual lives in the transient band, on its right edge,
and what would have to be true is that the transients driven by a
periodic boundary cannot pass that test forever. This session asked what
the transients look like under a periodic boundary and whether anything
in the diagonal structure notices that the boundary repeats.

## 2. Why the known routes fail

- **The diagonal structure never reaches the centre column**
  (`docs/obstructions.md`). Still true and now sharper: the settled part
  of the diagonals does not even *depend* on the centre column, up to one
  bit per doubling (new entry, below).
- **The centre column as a boundary condition** and **counting the right
  sides** (`docs/obstructions.md`, my two earlier entries). Unchanged; the
  half-line model used here is the one from the second document, and it
  reproduces the engine's diagonals cell for cell (control in
  `explorer/boundarysettled.mjs`, 0 mismatches over 2,401 diagonals of
  6,000 rows).
- **New dead end, appended to `docs/obstructions.md` as "The settled part
  of the left diagonals does not depend on the centre column".** Every
  statistic of the settled region (settled words, branch points, periods,
  onset growth, deviation rate at the seam) is the same for the true
  column, random boundaries, `(10)^∞`, `c ≡ 1`, and single pulses
  (section 3, C3). A route through the settled region cannot see a
  periodic boundary. Rowland 2006 §6 (lines 910–946 of the extraction)
  states the underlying fact for the eventual periods; this session
  measured it with phase, at the branch points, and on the transient
  widths.
- **The route I proposed last time, the index-1 cell of diagonal `k` as
  an affine function of `c(k)`.** Dead on inspection: `D_k(1) = D_{k-2}(2) xor (D_{k-1}(1) || c(k))`,
  so the coefficient of `c(k)` is `¬L(k)`, column -1 itself, which is the
  unknown; the recurrence closes on the cell it was meant to explain, the
  same way the obstruction entry of 2026-09-07 says it does at index 0.
  Not appended as an entry: it is one line, and the existing entry covers
  it.

## 3. Candidate claims

Notation. `D_k(j) = leftDiagonal k j = evolve (j + k) (-j)`; for the
half-line driven by a boundary `c` from a white start, the same with
`D_k(0) = c(k)`. `S_k : ℤ → Bool` is the periodic function agreeing with
`D_k` from its onset on ("settled word", kept in absolute phase). The
recurrence `leftDiagonal_recurrence`,
`D_{m+2}(i+1) = D_m(i+2) xor (D_{m+1}(i+1) || D_{m+2}(i))`, holds for the
seed and for every half-line, and on settled words it holds for every
`i ∈ ℤ`; read backwards it is
`D_m(i+2) = D_{m+2}(i+1) xor (D_{m+1}(i+1) || D_{m+2}(i))`.

### C1. No two pairs of adjacent left diagonals ever eventually agree

**The claim.** For every `k`, every `d ≥ 1` and every `N` there is a
`j ≥ N` with `leftDiagonal k j ≠ leftDiagonal (k + d) j` or
`leftDiagonal (k + 1) j ≠ leftDiagonal (k + 1 + d) j`. In the vocabulary:
`∀ k d N, 0 < d → ∃ j ≥ N, leftDiagonal k j ≠ leftDiagonal (k + d) j ∨ leftDiagonal (k + 1) j ≠ leftDiagonal (k + d + 1) j`.
In the picture: the settled region, read along any two adjacent
diagonals, never coincides with itself moved `d` diagonals inward, which
is the same as moved `d` steps down in time. It is the diagonal analogue
of `not_evolve_period_adjacent`.

**What it would give.** Not the residual. It is the statement that pins
down what the settled region *is*: C2 falls out of it, and it is the
model for what a proof of the residual would need, an agreement that
propagates outward to the edge, which the residual's hypothesis (agreement
at index 0 only) does not give. A proof of `leftDiagonal_period_le` would
not cite it either (that wall is an upper bound). Honest category: a true
theorem about the settled side of the seam, cited by C2, cited by nothing
under the residual.

**Falsification.** `explorer/settledwords.mjs`: the settled words of
diagonals `0..2400` from 6,000 engine rows, every consecutive pair
`(S_{k-1}, S_k)` distinct (2,400 distinct pairs). `explorer/forbit.mjs`:
the settled words computed from the recurrence alone to `k = 200,000`,
consulting the picture only at the seven branch points, spot-checked
against the engine at `k = 2400, 5000, …, 85000, 53210, 87868` with no
mismatch; 200,000 distinct pairs, no repeat. Single settled words *do*
repeat (160,638 distinct among 200,000), so the claim is false for one
diagonal and true for two, as stated. Kernel: none for the theorem itself
(it is a `∀ N ∃ j` statement); `scratch_doubling.lean` checks the finite
consequences under C2. **Survives.** What else could produce the survival:
the settle step reads a period from a finite tail and once misread a
13-cell constant tail as period 1 (fixed with a 128-cell minimum, and the
recurrence check then went from 41 failures to 0), so a wrong period would
show up as a recurrence failure, and there are none; the orbit to 200,000
is an independent computation that agrees with the engine wherever it was
compared and reproduces every published branch point.

**Novelty.** Not found. Rowland 2006 (both extractions: searched
"unbounded", "infinitely many", "arbitrarily", "Lemma 1", "bijectiv")
has Lemma 1, that a difference persists under a bijectivity condition,
and §6's "only one left side", but nothing about the sequence of settled
words never repeating. Jen 1990 has no diagonal statement (searched
"diagonal": no hit). Kopra 2022 (searched "diagonal": no hit). Wolfram
1986 §6 (lines 671–705) says the left periods "increase very slowly with
N" as an observation. *A New Kind of Science* p. 871 is not held, and the
claim would be settled by it if it were there; crystals 14 quotes it as
computed only. New with that caveat.

**Route.** Suppose `D_k, D_{k+1}` agree with `D_{k+d}, D_{k+d+1}` for
`j ≥ N`. The backward recurrence moves the agreement one diagonal outward
at the cost of two indices, so `D_0, D_1` agree with `D_d, D_{d+1}` for
`j ≥ N + 2k`; by `evolve_left_edge` and `evolve_left_second_diagonal`,
`D_d` and `D_{d+1}` are eventually black. The forward recurrence at
`m = d - 1` then reads `1 = D_{d-1}(i+2) xor (1 || _)`, so `D_{d-1}` is
eventually white; for `d = 1` that contradicts the edge. For `d ≥ 2` the
recurrence at `m = d - 2` reads `1 = D_{d-2}(i+2) xor (0 || 1)`, so
`D_{d-2}` is eventually white too, and two adjacent eventually-white
diagonals force the next one outward white by the backward recurrence,
down to `D_0`, contradicting the edge. Cites `leftDiagonal_recurrence`,
`evolve_left_edge`, `evolve_left_second_diagonal`; the hard step is none,
it is two inductions and a case split; size M.

### C2. The eventual periods of the left diagonals are unbounded

**The claim.** For every `a` there is a `k` such that `leftDiagonal k` is
not eventually `2^a`-periodic: `∀ a, ∃ k, ∀ N, ¬ PeriodicFrom (leftDiagonal k) (2 ^ a) N`.
Equivalently, with `leftDiagonal_periodicFrom_pow` and Rowland's Prop. 2,
the period doubles infinitely often and there are infinitely many
eventually-white left diagonals. The same holds for the half-line driven by
any boundary with `c(0) = 1`.

**What it would give.** Nothing under the residual. It turns the doublings
at `3, 8, 29, 400, 87867` (NKS p. 871, crystals 14, "computed") from an
observed list into an infinite one, and it says the regular region of
rule 30 is not doubly periodic on any band: the settled picture `S`
(C4) is aperiodic in time on every pair of adjacent diagonals. A lower
bound to set beside the wall `leftDiagonal_period_le`'s upper bound.

**Falsification.** `explorer/forbit.mjs`: periods `1, 2, 4, 8, 16, 32`
first at `k = 0, 3, 8, 29, 400, 87867`; branch points (eventually-white
diagonal `k - 1`) at `k = 3, 8, 29, 400` (shift-type, doubling),
`53208, 58287` (complement-type, no doubling; Rowland's columns 53209 and
58288 in his indexing, on the branch he says leads to 58288), `87867`
(doubling to 32). To `k = 200,000` no further branch and period 32.
Kernel, `scratch_doubling.lean`: `leftDiagonal 400` through `rowCell`
is 16-periodic on `[98, 242)` and `leftDiagonal 400 98 ≠ leftDiagonal 400 106`;
`leftDiagonal 29` is 8-periodic on `[1, 145)` and
`leftDiagonal 29 1 ≠ leftDiagonal 29 5`. Accepted. **Survives** as a
consequence of C1; the numbers above are its first instances, not its
evidence. What else could produce them: the orbit's branch choices were
read from the engine at a window past `0.55k + 16`, which is past every
measured onset (largest `0.48k`); a window inside a transient would have
matched neither candidate and stopped the run, and it did not.

**Novelty.** As C1. Wolfram 1986 §6 and NKS treat the growth as observed;
Rowland proves the doubling criterion, not that it fires infinitely
often. New with the NKS caveat.

**Route.** From C1 by pigeonhole. If every diagonal were eventually
`2^a`-periodic, the pair of settled words of `(D_k, D_{k+1})` would be a
point of a finite set (`(Fin (2^a) → Bool)²` after aligning the phase),
so two indices `k < k'` would carry the same pair, and then
`D_k, D_{k+1}` agree with `D_{k'}, D_{k'+1}` past the larger onset,
against C1 with `d = k' - k`. Cites C1, `leftDiagonal_periodicFrom_pow`
(to know a period exists), `Finite.exists_ne_map_eq_of_infinite`. Hard
step: the phase alignment of two eventually periodic sequences into one
finite datum; size L for a prover, M for the idea.

### C3. The settled region of every number-like configuration is the seed's up to a shift, chosen by one bit per eventually-white diagonal

**The claim.** For the half-line `x ≤ -1` driven by any boundary `c`
with `c(0) = 1`, the settled word `S_k` is the seed's `S_k` shifted along
the diagonal by some `σ_k` with `S_k^c(j) = S_k^{seed}(j + σ_k)`, the
branch points (indices with `S_{k-1}` white) are the same, and `σ_k`
changes only at a branch point, by `0` or by half the new period when the
period doubles and by a complement when it does not (the first
complement-type branch is at `k = 53208`). Vocabulary needed: the
half-line (crystal 38) and a settled-word definition,
`settledWord k : ℤ → Bool`, the periodic extension of the tail that
`leftDiagonal_periodicFrom_pow` guarantees.

**What it would give.** The obstruction entry: a periodic boundary is
invisible to the settled region. Positively, the decomposition in C4.

**Falsification.** `explorer/boundarysettled.mjs`, 6,000 rows, diagonals
to 2,400, twenty boundaries: the seed (control), the seed with cell -1
black at time 0, the seed with `c(100)` flipped, three xorshift32
sequences, `c ≡ 1`, `1` then white, `(10)^∞`, `(110)^∞`, `(1100)^∞`,
`(10110)^∞`, single pulses of period 7, 31, 155 (with left word `11001`),
random patterns of period 17, 23, 64, 100, 1000. Every settled word is
the seed's up to a shift; the branch points are `3, 8, 29, 400` for every
empty left word (shifted by the word's length otherwise: `2, 7, 28, 399`
and `3, 24, 395`); the shift at period 16 takes values
`0, 1, 2, 3, 4, 6, 8, 9, 11, 12, 13` across the twenty; the largest
period is 16 everywhere; mean onset/`k` on `[1200, 2400]` is
`0.26`–`0.33`; the boundary disagrees with its own settled picture at
the centre at rate `0.483`–`0.516`, and column -1 at black times at
`0.467`–`0.535`. **Survives.** What else could produce it: shift detection
compares words of period at most 16, and a coincidence over 2,400
diagonals is ruled out because consecutive words are tied by the
recurrence, which is shift-equivariant, so the real content is at the
branch points, where the two candidates are shifts of each other exactly
when the parity of `S_{k-2}` is odd (Rowland's Prop. 2); the scan found
no even-parity branch below 2,400, and the orbit finds the first at
53,208.

**Novelty.** New phrasing of Rowland 2006 §6 (lines 910–946), who states
the uniqueness of the eventual period given the two before it and the
first genuine branch at his column 53209; the absolute-phase form (shift,
not cyclic word), that the branch positions are universal, and the
measured invisibility of a periodic boundary are additions, none of them
a result.

**Route.** `leftDiagonal_periodicFrom_step_of_black` is the uniqueness
step (a black driver resets the machine); the two-solution case is
`bool_xor_driven_periodicFrom`. Statable only after the half-line and the
settled word exist; then S per step. Not worth seeding before C4's
definition is wanted.

### C4. The settled picture is a rule 30 evolution, and the transient band is the damage between it and the seed

**The claim.** Define `S(t, x) = S_{t+x}(-x)` on `x ≥ -t` and white
elsewhere, and `Σ(x) = S_x(-x)` for `x ≥ 0`, white for `x < 0`. Then
`S = evolveFrom Σ`, and the seed's picture agrees with `S` at every cell
whose diagonal index is at or past its diagonal's onset. So the seed's
picture is `S xor E` with `E` supported on the transient band, and `E` is
the damage pattern between two evolutions of configurations white on
`x ≤ -1`. At the seam, `c(t) = s(t) xor e(t)` with `s(t) = S_t(0)`, the
centre column of the settled configuration. Vocabulary: needs
`settledWord` (C3) and nothing else; `evolveFrom` is on the board.

**What it would give.** The frame for the topic: the transients under
any boundary, periodic or not, are a damage pattern between the driven
half-line and a picture that is universal up to shifts, and the residual
reads "the boundary column of that damage cannot be `s xor (periodic)`".
It is the first statement of the residual in which the unknown is a
damage pattern, whose right edge moves at speed 1
(`rightmost_difference_moves_right`) and whose left edge is the regular
boundary. What remains is everything: no bound on a left damage front is
available (crystals A3), and nothing is known about `s`.

**Falsification.** `explorer/settledpicture.mjs`: `Σ` on `[0, 2000]`
grown 1,000 steps with the BigInt engine and compared with `S` on the
2,003,001 cells inside the cone of the known part: 0 mismatches
(`Σ(0..39) = 1100100011100111100011110100011111101000`). The seed's
picture against `S` to `t = 2000`: all 1,554,804 settled cells agree,
222,494 of 448,197 transient cells agree (`0.496`). The leftmost
deviation in the row sits at `0.204t`–`0.235t` for `t = 250..2000`.
**Survives.** What else could produce it: the first run showed 494,632
mismatches from `t = 9`, because the row's left padding was 8 bits and
the picture ran off the number; a padding bug, fixed, and the second run
is the one reported. The settled-cell agreement is by construction and
is not evidence; the evidence is the 0 in the first comparison.

**Novelty.** Not in the held sources: Rowland's §6 speaks of eventual
periods, not of the settled picture as an evolution; Wolfram 1986 §6
describes the left side as a finite automaton at depth `N`. Searched
Kůrka for "regular", "boundary", "damage": nothing. Wolfram's 0.252
regular-region boundary (NKS p. 949, not held; crystals, damage-cone
section) is this front; whether NKS defines it as a damage front is not
known here. New phrasing of an object everyone has drawn.

**Route.** `S_k` satisfies the recurrence for all `i ∈ ℤ` (periodic
functions agreeing with a solution on a tail), and the recurrence is the
rule in diagonal coordinates (`evolve_left_diagonal_recurrence`), so
`S` satisfies the rule at every cell with `t + x ≥ 2`; at the edge,
`S_0 ≡ S_1 ≡ 1` and white outside make the rule hold there too. Then
`S = evolveFrom Σ` by induction on `t`. Hard step: none; size M after the
definition. No route from here to the residual.

## 4. What survived

All four survived. C1 and C2 are theorems in waiting with proofs that
cite only what is on the board, checked to diagonal 200,000 and, for the
doublings at 29 and 400, in the kernel; they are new as far as the held
sources go and would be settled by NKS p. 871 if it contains a proof,
which its wording in crystals 14 suggests it does not. C3 is Rowland's
observation with phase. C4 is a definition and a frame. None of them is a
lemma a proof of the residual would cite for its content: C1's proof
shows what the residual lacks, an agreement that propagates to the edge,
and C3 shows that the settled region cannot supply it. If a captain seeds
anything from this document, seed C1 (one M node, no new definitions)
and then C2 (one L node over it); they are the only two, and they sit
beside the two left-diagonal walls, not under this one. The negative
result is the one this topic asked for and it is firm: a periodic
boundary leaves no trace in the settled words, the branch points, the
periods, the onset growth, or the deviation rate at the seam, so the
residual is a statement about the damage band alone.

## 5. Claims that died

- **"The settle step can read a period from a tail of 8 cycles."** Died
  at `k = 659`: a 13-cell constant tail was read as period 1, giving 41
  recurrence failures and phantom branch points at 660, 674, 918, …;
  with a 128-cell minimum tail, 0 failures. Not a fact about the automaton.
- **"The settled words are eventually periodic in `k` between doublings,
  so `s(t) = S_t(0)` is eventually periodic on each stretch."** Died on
  paper before the run: the backward recurrence makes the pair sequence
  injective (C1), and the orbit confirms 200,000 distinct pairs. A
  repeated pair would put a second white diagonal exactly one period
  later, and the run shows the branch points are not spaced that way.
- **"The settled picture grown from `Σ` disagrees with `S` from `t = 9`."**
  Died: padding bug in `settledpicture.mjs`, 8 bits of room for a picture
  that grows left one cell per step. 0 mismatches after the fix.
- **"The index-1 cell of diagonal `k` is affine in `c(k)` with a settled
  coefficient"** (my previous next-topic question). Died on inspection:
  the coefficient is `¬L(k)`, column -1 itself.
- **"A periodic boundary changes the onset growth or the periods of the
  half-line's diagonals."** Died at diagonal 2,400 for every periodic
  boundary tested: same periods, same branch points, onset/`k` in the
  same range as random boundaries and the seed.
- **"Single left diagonals never eventually coincide."** Died at `k = 0, 4`
  (both eventually black) and in the orbit (39,362 repeats of single
  words below 200,000). Only pairs never coincide.
- **"The obstruction entry's rows `1, 11, 011, 0011, 11011` are written
  with cell -1 rightmost."** Died by hand at row 3: cell -1 is white
  there, so the listing is with cell -1 leftmost. Corrected in the new
  entry.

## 6. Next topic

Attack `s`, the centre column of the settled configuration `Σ`
(C4): whether it is eventually periodic, and if not, what its failure
to be periodic has to do with the seed's. Everything in this session
says the boundary's information lives in the damage band, and the
damage band is driven at the seam by `e = c xor s`; `s` is universal up
to the branch bits, computable from the recurrence alone to any depth
(`explorer/forbit.mjs` gives it to 200,000 for the seed's branch), and
nobody has looked at it. Two concrete questions the engine can answer
first: whether `Σ`'s own black-time test against its own left half-line
holds (it must, since `S` is an evolution of a configuration white on
`x ≤ -1`; the check is a test of the definitions), and whether `s` shares
any structure with `c` beyond `t = 17`, where they part (`e(1..17) = 0`).
If `s` is provably not eventually periodic by an argument that does not
go through P1, then P1's residual becomes "`c` and `s` cannot differ by a
periodic sequence", which is a statement about a damage pattern with a
known left front, and that is a different wall from the one we have.
Before that, a captain should seed C1 as a node beside
`leftDiagonal_period_le`, because it is the one theorem here with a
complete route, and C2 after it.
