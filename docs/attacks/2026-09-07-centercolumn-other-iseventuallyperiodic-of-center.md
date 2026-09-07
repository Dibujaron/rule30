# Attack: `centerColumn_other_isEventuallyPeriodic_of_center`

Sextant, 2026-09-07. An argument, not a proof. Every survival below says
what depth it reached and what else could have produced it.

Fence note: this session was permitted to run only existing scripts under
`explorer/` with no arguments, and to write no new file there. So the one
engine reading here is `node explorer/diagonalscan.mjs` (4000 rows, 24
diagonals each side), and the two small claims that needed a fresh
computation were checked by hand to the depth stated, with the script that
would check them further written out in the text. The next theorist on this
topic should run those scripts first.

## 1. The residual, in one paragraph

Picture the rule 30 triangle with time running down. The centre column is
the vertical line through the apex. The wall asks: if that column ever
settles into a repeating pattern, show that some *other* vertical line
repeats too. Nothing else is needed, because Jen's theorem
(`isEventuallyPeriodic_column_unique`, on the board) already says two
distinct repeating columns are impossible, so the two facts together would
say the centre column never repeats, which is the first prize conjecture.
Since a contradiction implies anything, the residual is *exactly* the prize:
it is enough to show that a repeating centre column forces something false.
The residual lives on the seam between the two halves of the picture: the
right half, whose diagonals are all periodic from their first cell, and the
left half, whose diagonals settle from the edge inward and whose settled
part never reaches column zero.

## 2. Why the known routes fail

- **The diagonal structure never reaches the centre column**
  (`docs/obstructions.md`). Both the left and the right diagonal through
  the cell `(t, 0)` start there: the centre cell is index 0 of
  `leftDiagonal t` and of `rightDiagonal t`. Periodicity of a diagonal is
  a statement about indices past its onset; index 0 is never past it for
  the right family in any useful sense (period `2^t` at index 0 says
  nothing) and is inside the transient for the left family. Confirmed
  again by the scan below: right diagonal `k` has minimal period
  `2^m(k)` with `m(k)` growing with `k`, so the period at the centre
  cell's own diagonal is unbounded.
- **Two adjacent columns propagate left** (`evolve_period_sub`,
  `not_evolve_period_adjacent`, Kopra 2022 Thm 3.5). This is why the
  width-2 case closes: a shared period in columns 0 and 1 walks left by
  the sideways inverse and hits the black left edge. With one column the
  sideways inverse has a free input at every time the centre is black
  (see claim C2), so nothing propagates. This is not a new dead end, it is
  the gap the wall names.
- **New dead end, recorded below in `docs/obstructions.md` as "The centre
  column as a boundary condition".** The right half-line `x ≥ 1` and the
  left half-line `x ≤ -1` are each driven by column 0 alone as their only
  boundary, with an all-white start. So one is tempted to prove the
  residual as a statement about a half-line automaton with a periodic
  boundary sequence, forgetting where the sequence came from. That
  statement is false: the constant boundary `c ≡ true` makes columns 1
  and 2 of the right half-line constant from row 2 on. Any proof must use
  that `c` is the centre column of the *single seed*, which is the same
  as using the white cone on the left. Details in C1.

## 3. Candidate claims

### C1. The two half-lines are each driven by the centre column alone

**The claim.** For `x ≥ 1`, the cell `evolve (t+1) x` reads only cells at
positions `x-1, x, x+1 ≥ 0` at time `t`; so the strip of all columns
`x ≥ 1`, started all white, is a deterministic function of the sequence
`centerColumn` alone. Symmetrically for `x ≤ -1`. In the project's
vocabulary this needs a definition that is missing: a half-line evolution
`evolveHalf (b : ℕ → Bool) : ℕ → ℕ → Bool` with
`evolveHalf b 0 x = false`, `evolveHalf b (t+1) 0 = b (t+1)`, and
`evolveHalf b (t+1) (x+1) = xor (evolveHalf b t x) (evolveHalf b t (x+1) || evolveHalf b t (x+2))`,
and then the theorem `evolveHalf centerColumn t x = evolve t x` for all
`t` and `x ≥ 0`. (Proof: induction on `t`, one `rule30_eq` per cell, and
`evolve_eq_false_of_outside_cone` for the all-white start.)

**What it would give.** A reformulation only. It is cited by nothing on
the residual directly; its value is the obstruction it exposes.
For a *general* boundary `b : ℕ → Bool` the analogue of the residual,
"`b` eventually periodic ⟹ column 1 of `evolveHalf b` is not eventually
periodic", is **false**. Witness `b ≡ true`: by hand, the right half-line
rows 0..6 read (columns 1,2,3,…)

```
t=0  0 0 0 0 0 0
t=1  1 0 0 0 0 0
t=2  0 1 0 0 0 0
t=3  0 1 1 0 0 0
t=4  0 1 0 1 0 0
t=5  0 1 0 1 1 0
t=6  0 1 0 1 0 1
```

and once `col1 t = 0, col2 t = 1` holds, `col1 (t+1) = 1 xor (0 || 1) = 0`
and `col2 (t+1) = 0 xor (1 || _) = 1`, so columns 1 and 2 are constant from
`t = 2` for ever (this is `(01)^ℤ`, a fixed point, invading white). The
left half-line for the same boundary is constant too: `col(-1) ≡ 0`,
`col(-2) ≡ 1`, alternating outward. So the whole configuration is
`…1010 1 | 000…` evolving with every column eventually constant. It
violates no theorem, because it is not white far to the left, which is
the hypothesis Jen and Kopra need. Witness `b ≡ false` is trivial.

**Falsification.** Hand computation to row 6, closed by the two-line
induction above; a script for a captain to run, to be placed at
`explorer/halfline.mjs`:

```js
// right half-line driven by a boundary sequence b; prints columns 1..8
const N = 200, b = t => 1;           // try t => (t % 3 === 0 ? 1 : 0) etc.
let row = new Uint8Array(N + 3);     // row[x] = cell x, x >= 1; row[0] unused
for (let t = 0; t < N; t++) {
  const cur = row.slice(); cur[0] = b(t);
  for (let x = 1; x <= N + 1; x++) row[x] = cur[x-1] ^ (cur[x] | cur[x+1]);
  console.log(t + 1, Array.from(row.slice(1, 9)).join(''));
}
```

**Novelty.** The half-line-with-boundary view is standard for
boundary-driven automata (nothing in `sources/` uses it for rule 30; I
searched `rowland-2006`, `kopra-2022`, `jen-1990` for "boundary",
"half-line", "half line", "semi-infinite" and found only Kopra's
"configuration white far to the left" hypothesis). New vocabulary, not a
new result.

**Route.** Trivial as stated once `evolveHalf` exists. The hard step is
elsewhere: none.

### C2. At a black centre cell, the cell to its left is the complement of the next centre cell

**The claim.** `evolve t 0 = true → evolve t (-1) = ! (evolve (t+1) 0)`.
Equivalently, in the pair `(centerColumn, column 1)` the sideways inverse
`evolve_sub_one_eq_xor` has a free input at exactly the times the centre
is black, and at those times column `-1` is a function of the centre
column alone.

**What it would give.** If the centre column is eventually periodic with
period `p` from `N`, then column `-1` restricted to the black-centre times
is periodic with the same `p` from `N`. What remains after it is the whole
difficulty: column `-1` at the *white*-centre times equals
`evolve (t+1) 0 xor evolve t 1`, which drags in column 1, and column 1 is
exactly what the wall does not control. A proof of the residual that goes
through column `-1` would cite this and then need a statement about
column 1 at white-centre times; I have none.

**Falsification.** It is an identity: substitute `evolve t 0 = true` into
`evolve_sub_one_eq_xor` at `i = 0` and `true || _ = true`. No engine run
can kill it and none is claimed. Kernel check for a captain: a scratch
`example (t : ℕ) (h : evolve t 0 = true) : evolve t (-1) = !(evolve (t+1) 0) := by
have := evolve_sub_one_eq_xor t 0; simp [h] at this; simpa using this`.

**Novelty.** New phrasing of a known result: it is `evolve_sub_one_eq_xor`
(crystal 1, the sideways inverse) with one input fixed; the "free input
when the centre is black" reading is what NKS p. 1087 and Meier–Staffelbach
call the weakness of two-column inversion. Not new.

**Route.** One rewrite. Cheap enough to seed as an S node if a later
route wants it; not worth seeding on its own.

### C3. The right diagonals' minimal periods are powers of two, nondecreasing in `k`, and rise by at most one doubling per step

**The claim.** Let `m(k)` be such that `2^m(k)` is the minimal period of
`rightDiagonal k` (which exists and divides `2^k` by
`rightDiagonal_periodicFrom_pow`). Then `m(k) ≤ m(k+1) ≤ m(k) + 1`.
In vocabulary: `PeriodicFrom (rightDiagonal k) (2^m) 0` and
`¬ PeriodicFrom (rightDiagonal k) (2^(m-1)) 0` define `m(k)`; the claim
is about that function. A definition `minPeriod` is missing.

**What it would give.** Nothing on the residual: it is a statement about
the settled right half. Listed because it replaces the natural stronger
guess (the period is *exactly* `2^k`, i.e. the diagonal is antiperiodic
at `2^(k-1)`), which died (section 5), and because the scan's numbers are
worth recording for whoever attacks the right family.

**Falsification.** `node explorer/diagonalscan.mjs`, default parameters,
4000 rows, right diagonals `k = 0..23`. Minimal periods found:
`1, 2, 2, 4, 8, 8, 16, 32, 32, 64, 64, 64, 64, 64, 64, 128, 256 ×8`,
all with onset 0. **Survives to `k = 23` at 4000 rows.** What else could
produce this: the scan reports the *smallest* period whose tail is at
least six cycles and 24 terms long, so at `k = 23` a period of 256 is
seen for about 15 cycles only; a larger true period that merely shares a
long prefix with a 256-cycle would be misread. The onset-0 column is
proved (`rightDiagonal_periodicFrom_pow`), so only the minimality is at
risk. Not checked beyond `k = 23`; the claim about the 24th diagonal is a
claim about the first 24.

**Novelty.** Rowland 2006 §3 and Theorem 1 give the periods as dividing
`2^k` and the structure of rows `2^n`; his Lemma 3 gives the doubling
criterion (crystal 13) for the *left* family, whose mirror on the right is
"period doubles iff the XOR over one driver period is odd". That the
minimal period is nondecreasing in `k` I did not find stated; searched
`rowland-2006` (both extractions) for "period", "minimal", "exactly",
"divides". Computed, no citation.

**Route.** No route to the residual. For the claim itself:
`rightDiagonal_recurrence` writes diagonal `k+2` as prefix-XOR of a driver
of period `lcm(2^m(k), 2^m(k+1))`, so `m(k+2) ≤ max(m(k), m(k+1)) + 1` is
`bool_xor_driven_periodicFrom`; the lower bound `m(k+1) ≥ m(k)` is the
hard step and I have no argument for it.

## 4. What survived

C1 and C2 survive because they are identities, and C3 survives at 4000
rows to `k = 23`; none of the three is a lemma a proof of the residual
would cite for its content. The deliverable of this attack is negative
and I think real: the residual cannot be proved about the centre column
*as a sequence*, only about the centre column *as the centre of the single
seed*, because the constant sequence `true` is a periodic boundary whose
half-lines have periodic columns on both sides. Every proof must therefore
carry the white cone on the left into the argument, which is what Jen and
Kopra do for width 2 through the sideways inverse, and what fails at width
1 exactly at the black-centre times of C2. If a captain seeds anything,
seed the definition `evolveHalf` and C1's identity, cheaply, so the
obstruction is stated on the board in checkable form; C2 only if a route
asks for it; C3 not at all.

## 5. Claims that died

- **Right diagonal `k` has minimal period exactly `2^k`** (equivalently
  antiperiodic at `2^(k-1)`, which would have given
  `evolve (k + 2^(k-1)) (2^(k-1)) = ! evolve k 0` for every `k ≥ 1`).
  Dies at `k = 2`: `rightDiagonal 2 = 0,1,0,1,…`, period 2. By hand from
  rows 2..5 and confirmed by the scan (period 2 at `k = 2`, 8 at `k = 5`,
  32 at `k = 8`, 64 at `k = 10..14`).
- **"A periodic boundary forces an aperiodic column 1 in the half-line
  automaton"** (the residual freed from the single seed). Dies at row 2
  for the boundary `b ≡ true`: columns 1 and 2 constant `0, 1` from
  `t = 2` on. See C1.
- **Left-diagonal onsets near `k/2`** (a figure in `docs/obstructions.md`,
  not mine). The scan at 4000 rows reads onset `0..3` for every left
  diagonal `k ≤ 23`, far below `k/2`. This is not a counterexample to the
  wall `leftDiagonal_onset_le`, which it supports, but it does not match
  the obstruction's figure; the scan measures onset as the index after
  the last break of the *smallest* period it accepts, so one of the two
  definitions of "onset" differs. Someone should reconcile against the
  A363346 b-file before either number is cited again.

## 6. Next topic

Attack the pair, not the column: the two-column sequence
`t ↦ (evolve t 0, evolve t 1)` under the cone constraint. Section 3 shows
the residual is false for column 0 taken alone as a boundary, so the
statement that is actually open is: *among all pairs `(c, d)` whose
leftward solve by the sideways inverse is white outside the cone and black
on its edge, a periodic `c` forces a periodic `d`*. That needs one
definition first, `leftSolve (c d : ℕ → Bool) : ℕ → ℕ → Bool` with
`leftSolve 0 = c`, `leftSolve 1 = d`,
`leftSolve (k+2) t = xor (leftSolve (k+1) (t+1)) (leftSolve (k+1) t || leftSolve k t)`,
and the theorem `leftSolve centerColumn (column 1) k t = evolve t (-k)`
(induction on `k` from `evolve_sub_one_eq_xor`). With that on the board
the next theorist can ask the concrete question this attack could not
reach for lack of a script: for a periodic `c` of period `p`, how many
prefixes `d(0..T)` are consistent with the cone constraint, and does the
count stay bounded in `T`? If it does, `d` is forced and the wall falls;
if it grows, the growth rate is the first quantitative statement about the
seam anyone would have.
