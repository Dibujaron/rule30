## What you are doing
You are proposing the next tier of theorem statements for a Lean 4
formalisation of Rule 30. You PROPOSE; a captain reviews and lands.

Aim at what a proof of a prize conjecture's residual would NEED, not at
what is merely true and provable. The residuals are not abstract: they
are the open nodes in the next section, and a proposal is worth landing
exactly when a proof of one of them would cite it. **A tier of true,
cheap, unconnected lemmas is the failure mode here, and it looks like
progress while it happens.**
Nothing in P2 is open today, so the residual is the prize theorem itself,
`centerColumn_density_tendsto_half` in Rule30/Prize.lean: a proposal is worth landing when a
proof of that theorem would cite it.

The closed table further down is the whole record of what has closed in P2, 4 closed as it
stands. Read it and ask which of them a proof of an open node would
actually cite. If the honest answer is none, that is the problem you are
being asked to fix.

## This tier is for P2
This seeding pass is aimed at one region of the board, P2: the balance conjecture — the fraction of black cells among the first N cells of the centre column tends to exactly 1/2 as N grows.
Only P2 nodes are listed below, open and closed. A proposal outside P2 will not be landed, however true or cheap it is.

## What is open in P2
Every P2 node on the board nobody has closed, 0 open.
A `wall` is a node the scheduler never dispatches: it is not a task, it
is a target, and its description says what a decomposition must imply
and what has been measured. Read those descriptions as the
specification of the tier you are proposing.

(nothing is open)

## What you may write and run
  write   anything under explorer/
  write   your proposal, at c:/Users/dibuj/dev/rule30/blueprint/proposals/next.json
  run     node <one path under explorer/>
  run     lake build [modules], lake env lean <file>

You may NOT write Rule30/Statements.lean or blueprint/dag.json. That is
not a formality to route around: seeding sets direction, and direction
should not change while nobody is watching. Your output is a proposal
and a captain lands it. Nothing else you do is checked by anything.

## The proposal format
The file at c:/Users/dibuj/dev/rule30/blueprint/proposals/next.json
must be exactly this shape, or the decoder refuses it before any check
runs and nothing you wrote is looked at:

{"proposals": [
  {
    "id": "<node id, snake_case, unique on the board>",
    "lean_name": "<the theorem's name, usually the same as id>",
    "statement": "theorem <lean_name> ... := by\n  sorry",
    "reason": "<why a proof of an open node would cite this>",
    "disclaims": "<what this does NOT prove; omit when nothing>",
    "route": {"tactics": "<tactic script>", "imports": ["Rule30.Proofs.EvolveLeftEdge"]},
    "witness": {"expression": "<Bool-valued Lean over the range>", "imports": [], "range": "t < 12"}
  }
]}

Required: `id`, `lean_name`, `statement`, `reason`. Optional, and to be
OMITTED rather than filled with a placeholder: `disclaims` (defaults to
empty), `route` (then `tactics` is required and `imports` optional), and
`witness` (then `expression` and `range` are required and `imports`
optional). One `{"proposals": [...]}` document, any number of entries.

Each proposal carries an id, a lean_name, the statement text, and a
`reason`. The statement text is the declaration EXACTLY as it should
land in Rule30/Statements.lean — `theorem <lean_name> ... := by` with
`sorry` on its own line — because a route is checked against those
bytes and against nothing else, and the captain lands the same bytes.
The reason is REQUIRED and the route is OPTIONAL, and that is
the opposite of what it looks like it should be. Measured on the tier
seeded 2026-09-06: description quality dominated node difficulty as a
cost driver and it was not close. One node was seeded with a route its
captain had confirmed against a DIFFERENT form of the statement; haiku
spent 41 turns and died on it, and sonnet then closed it by implementing
the English reason and ignoring the route entirely.

An unverified route misdirects in a captain's voice to a model with no
standing to doubt it, and forecloses a search a stronger model would win.
A correct reason costs nothing and leaves the search open. **If you
cannot state the reason, you have not finished thinking about the node.**
If you cannot supply a route, you have merely left it open, which is
fine and is recorded as claiming nothing.

## Falsification witnesses, and the wall you will hit
Every proposal may carry a witness: a Bool-valued Lean expression over an
explicit finite range, run with `lake env lean` and `#eval`.

**The range is not free.** `evolve t` is `rule30^[t]` over `Int -> Bool`,
so one cell at depth t costs 3^t neighbour evaluations. Measured against
the real definitions: t=14 is 3.8s, t=16 is 12s, t=18 is 84s, t=20 times
out at 120s. Usable depth is about t < 18 and the wall is sheer — two
steps costs a factor of seven.

`List.all` short-circuits, so a FALSE witness returns almost instantly
and a TRUE one pays the full exponential. A witness that times out is
therefore preferentially a true one, and it is recorded as `unchecked`,
never as a pass. A statement whose claim only becomes interesting past
t=18 cannot carry a naive witness at all — say so rather than inventing
one, because `unchecked` stated plainly is worth more than coverage
pretended.

## What has closed in P2, and what it cost
Cost and model are the transferable part: they say which SHAPES are
cheap, which is what you are choosing between.

  centerColumn_zero  size=S  haiku  $0.07
  centerColumnDensity_nonneg  size=S  haiku  $0.19
  centerColumnDensity_le_one  size=M  sonnet  $0.19
  centerColumnDensity_succ  size=M  sonnet  $0.54

## Why those proofs worked, in the provers' own words
### BoolDrivenEventuallyTwoPeriodic.lean
**What this says.** A one-bit machine that updates by `x(i+1) = xor(a i, b i or x i)`,
whose two drivers `a` and `b` both repeat with period `p` from `N` on, itself repeats
with period `2p`, but only once you are `p` steps past where the drivers settled down.
**Why it is true.** One cycle of `p` drivers is a fixed function of `Bool`, and once the
drivers are periodic that function is the same one cycle after cycle; three copies of it
in a row collapse to one copy, because every self-map of `Bool` does.
**Where the work is.** Building that "one cycle" map by hand as a fold over `p` update
steps, since the update at each step is a different function of the drivers there — then
showing the fold shifts by a whole cycle exactly when the drivers do.

### BoolDrivenPeriodicFromOfReset.lean
**What this says.** When a driver's high bit resets the state, the state inherits the driver's period.
**Why it is true.** At the reset point, the state becomes a deterministic function of the drivers, forgetting its own history; one period later the deterministic result repeats.
**Where the work is.** Showing that `b j = true` forces `x (j+1+p) = x (j+1)` via three recurrence unfoldings and the drivers' periodicity.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.bool_driven_periodicFrom_of_reset (a b x : ℕ → Bool) (p N j : ℕ)
  (hrec : ∀ (i : ℕ), x (i + 1) = (a i ^^ (b i || x i))) (ha : PeriodicFrom a p N) (hb : PeriodicFrom b p N)
  (hNj : N ≤ j) (hbj : b j = true) : PeriodicFrom x p (j + 1)
```

### BoolDrivenPeriodicFromOfReturn.lean
**What this says.** A one-bit machine driven by periodic inputs that has returned to its starting state will repeat with the driver's period from that point.

**Why it is true.** If the driven bit equals itself after one driver period, then rewriting through the recurrence with periodic drivers collapses x(n+p) to x(n) at every step.

**Where the work is.** Straightforward induction on n, using the recurrence equation and the periodicity of a and b.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.bool_driven_periodicFrom_of_return (a b x : ℕ → Bool) (p N M : ℕ)
  (hrec : ∀ (i : ℕ), x (i + 1) = (a i ^^ (b i || x i))) (ha : PeriodicFrom a p N) (hb : PeriodicFrom b p N)
  (hNM : N ≤ M) (hret : x (M + p) = x M) : PeriodicFrom x p M
```

### BoolMapIterateThree.lean
**What this says.** Any function from Bool to Bool composed with itself three times is the same as applying it once: f^[3] = f.
**Why it is true.** Bool has only four endomaps — identity, negation, and the two constants — and each is unchanged after three iterations.
**Where the work is.** Nowhere; a function out of Bool is pinned down by its two output values, so splitting on those (and on the input) leaves four fully concrete cases for `simp` to check.

### BoolXorDrivenPeriodicFrom.lean
**What this says.** A one-bit machine that XORs a repeating input into its running state
itself repeats, with twice the input's period, from the very point the input's period starts.
**Why it is true.** XOR-ing in a whole block of `p` inputs is its own inverse, so the change
picked up between times `i` and `i+p` exactly cancels the identical change picked up between
`i+p` and `i+2p`, once those two blocks read the same inputs.
**Where the work is.** Writing "the change over n steps" as an explicit fold over `c`, then
showing that fold is unchanged when shifted by one whole period of `c`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.bool_xor_driven_periodicFrom (c x : ℕ → Bool) (p N : ℕ) (hrec : ∀ (i : ℕ), x (i + 1) = (x i ^^ c i))
  (hc : PeriodicFrom c p N) : PeriodicFrom x (2 * p) N
```

### CenterColumnDensityLeOne.lean
**What this says.** The fraction of the first `N` centre-column cells that
are black never exceeds one.

**Why it is true.** The black cells among the first `N` are some of those
`N` cells, so the count on top is at most the count underneath.

**Where the work is.** `N = 0` has to be split off. In Lean
`x / 0 = 0`, so at zero terms the density is 0 rather
than a ratio, and the main argument -- multiply both sides by `N` -- is only
allowed once `N` is known to be positive.

### CenterColumnDensityNonneg.lean
**What this says.** The fraction of the first `N` centre-column cells that
are black is never negative.

**Why it is true.** It is one count divided by another, and neither can be
below zero.

**Where the work is.** Nowhere. It needs no special case for
`N = 0`: in Lean `x / 0 = 0`, which is not
negative either, so one argument covers every `N`.

### CenterColumnDensitySucc.lean
**What this says.** Widening the window by one term: the black count over
`N + 1` terms is the count over `N` terms, plus one more if the
newest cell is black.

**Why it is true.** Adding one index to a range adds that one cell to the
tally and disturbs nothing already counted.

**Where the work is.** Two places. The counting step has to know the new
index is genuinely new and not already inside the old range. And
`N = 0` has to be handled separately, because in Lean
`x / 0 = 0`, so at zero terms the density is 0 rather
than a ratio. The statement is deliberately multiplied through by `N` rather
than left as a ratio, so the recurrence never has to divide.

### CenterColumnNotEventuallyPeriodicOfAnyOther.lean
**What this says.** If a repeating centre column would force some other
column to repeat too, then the centre column never repeats. This is
conditional: the hypothesis is the open problem, it is believed true, and
this file does not prove it. It does not say the hypothesis is impossible.
**Why it is true.** No two distinct columns of rule 30 are both eventually
periodic (`isEventuallyPeriodic_column_unique`), so a repeating centre
column with a repeating other column cannot happen.
**Where the work is.** Nowhere: one application of that lemma, after
unfolding `centerColumn` to column `0`.

### CenterColumnNotEventuallyPeriodicOfRight.lean
**What this says.** If a repeating centre column would force the column just
right of it to repeat too, then the centre column never repeats. This is the
first prize conjecture under one hypothesis; the hypothesis is the open
problem, and this file does not prove it.
**Why it is true.** Adjacent columns of rule 30 are never both eventually
periodic (`not_isEventuallyPeriodic_adjacent`), so a periodic centre column
with a periodic right neighbour is impossible.
**Where the work is.** Nowhere: one application of that lemma.

### CenterColumnRightNotBothIsEventuallyPeriodic.lean
**What this says.** The centre column and the column just right of it cannot both repeat indefinitely.
**Why it is true.** Periodicity in adjacent columns extends to the far left, contradicting the left edge being always black.
**Where the work is.** None — direct application of the adjacent-column lemma at i = 0.

### CenterColumnZero.lean
**What this says.** Before any step has been taken, the centre cell is
black.

**Why it is true.** `evolve 0` is the rule applied zero times, so it is
the starting row unchanged, and the starting row is a single black cell at
position 0.

**Where the work is.** Nowhere. Once the three definitions are unfolded the
claim is a concrete computation, and `decide` runs it.

### EvolveEqFalseOfOutsideCone.lean
**What this says.** After `t` steps nothing is black further than `t` cells
from the centre. Information moves one cell per step, so that is as far as
it can have got.

**Why it is true.** Induction on `t`. A cell beyond the cone has all three
of its neighbours beyond the previous step's cone, so all three were white,
and rule 30 on three white cells gives white.

**Where the work is.** Almost all of it is the arithmetic of `|i|`. Showing
the three neighbours are still outside means case-splitting on the sign of
`i`, because absolute value behaves differently either side of zero.

### EvolveIsEventuallyPeriodicOfBetween.lean
**What this says.** A column strictly between two eventually periodic columns is eventually periodic.
**Why it is true.** The boundary columns share a common period, so the strip containing the target column is eventually periodic.
**Where the work is.** Reading the strip at index 0 to extract the periodicity of the interior column.

### EvolveLeftDiagonalIsEventuallyPeriodicStep.lean
**What this says.** If two diagonals next to each other, both counted in from
the left edge, eventually settle into a repeating pattern, then the next
diagonal in from them does too.

**Why it is true.** `evolve_left_diagonal_recurrence` says each entry of that
third diagonal is fixed by one entry from each of the settled diagonals and
by its own previous entry -- exactly the one-bit machine
`bool_driven_eventually_two_periodic` already handles.

**Where the work is.** The recurrence and the two periodicity hypotheses each
number the diagonals with a slightly different offset (an extra `+1` or `+2`
tucked inside a cast to `ℤ`), so most of the proof is `omega`/`push_cast`
bookkeeping showing they are all talking about the same three sequences.

### EvolveLeftDiagonalRecurrence.lean
**What this says.** One step of rule 30 rewritten in diagonal coordinates:
an entry on a diagonal is fixed by the two shallower diagonals and by its
own previous entry, and by nothing deeper inside the cone.

**Why it is true.** It is the rule itself. Nothing is proved here that
`rule30_eq` does not already say; only the coordinates are renamed.

**Where the work is.** Nowhere, and that is the point. It costs one rewrite,
and every later diagonal proof cites it instead of re-deriving the
coordinate shift.

### EvolveLeftDiagonalsIsEventuallyPeriodic.lean
**What this says.** Every diagonal counted in from the left edge eventually
settles into a repeating pattern, however far in from the edge it is.

**Why it is true.** Strong induction on the distance from the edge. The
first two diagonals are constantly black, which is periodic with period 1
from the start; every diagonal after that is built from the two before it
by `evolve_left_diagonal_isEventuallyPeriodic_step`, which already does the
real work of turning "the two inputs repeat" into "so does the output".

**Where the work is.** Nowhere new. The two base cases just cite
`evolve_left_edge` / `evolve_left_second_diagonal` at the two indices the
goal happens to present (`n + 0` and `n + 1 + 0`, `n + 1` and `n + 1 + 1`),
and the inductive case is one application of the step lemma to the two
induction hypotheses two and one short of the target.

### EvolveLeftEdge.lean
**What this says.** The leftmost cell that exists at all after `t` steps is
always black.

**Why it is true.** Induction. A step earlier, the new edge's left neighbour
was outside the cone and so white, and its right neighbour was the previous
edge and so black. Rule 30 is
`left XOR (centre OR right)`, and
`false XOR (_ OR true)` is `true` whatever the centre
held -- so the middle cell never matters.

**Where the work is.** Proving the left neighbour really is outside the
cone, which means showing the position `-(n+2)` has absolute value
`n + 2`, and that exceeds `n`.

### EvolveLeftFifthDiagonal.lean
**What this says.** Four steps in from the left edge, always black. It sits
one step past `evolve_left_fourth_diagonal`, which alternates, so the family
does not settle into a pattern that can be extrapolated.

**Why it is true.** `evolve_left_diagonal_recurrence`, which expresses one
step of rule 30 in diagonal coordinates. Its shallower input is the third
diagonal, always white, and its own previous entry is black by induction:
`false XOR (_ OR true)` is `true`, so the middle input
never matters.

**Where the work is.** Nothing conceptual. The length is index arithmetic --
rewriting sums and casting between naturals and integers until the three
positions match what the recurrence expects.

### EvolveLeftFourthDiagonal.lean
**What this says.** Three steps in from the left edge the colour alternates:
black at even `t`, white at odd `t`. The first diagonal that is not a
constant.

**Why it is true.** The recurrence, with two of its three inputs already
known constants -- the second diagonal is always black, the third always
white. That collapses it to
`this entry is the opposite of the previous one`,
and induction carries it from there.

**Where the work is.** The parity bookkeeping at the end. Turning
`the opposite of n being even` into
`n + 1 is even` needs a case split on which `n` actually
is.

### EvolveLeftFourthDiagonalIsEventuallyPeriodic.lean
**What this says.** The alternating diagonal is eventually periodic, in
exactly the sense the first prize question denies of the centre column. It
says nothing about that question: this is the edge of the cone, not the
middle.

**Why it is true.** Period 2, starting from the very first term. The closed
form makes each entry depend only on whether `t` is even, and adding 2 does
not change that.

**Where the work is.** Nowhere. `IsEventuallyPeriodic` is an existential --
it asks for a period and a starting point -- and the proof mostly just hands
it 2 and 0. Naming the witnesses is what proving an existential consists of.

### EvolveLeftSecondDiagonal.lean
**What this says.** The cell one step in from the left edge is always black
too.

**Why it is true.** One unfolding of the rule, with no induction. A step
earlier the cell to its left was outside the cone and white, and its own
position held the left edge and was black:
`false XOR (true OR _)` is `true`.

**Where the work is.** Nowhere. The only fiddle is showing
`|-t - 1| = t + 1` so the cone lemma applies.

### EvolveLeftThirdDiagonal.lean
**What this says.** The cell two steps in from the left edge is always white
-- the first diagonal of the cone that is not black.

**Why it is true.** One unfolding of the rule, with no induction. Its left
neighbour was the edge (black) and its own position held the second diagonal
(black), and `true XOR (true OR _)` is `false`.

**Where the work is.** Nowhere. Rewriting `t + 2` as
`t + 1 + 1` so that a single step is exposed, and one
cast so `-t - 1` and `-(t + 1)` are seen as the same
position.

### EvolvePeriodSub.lean
**What this says.** If two neighbouring columns both repeat with period p from time N, then every column further to the left repeats with that same p and N too.
**Why it is true.** `evolve_period_sub_one` moves the periodic pair one column left; applying it k times, always carrying the current column and its right neighbour together, reaches column i-k.
**Where the work is.** Aligning the induction's `i - (k+1 : ℕ)` with the shape `evolve_period_sub_one` expects, `i - k - 1`, is pure cast arithmetic (`push_cast; ring`) and not the mathematical content.

### EvolvePeriodSubOne.lean
**What this says.** If two adjacent columns both repeat with period p starting from time N, then the column to their left repeats with the same period and time.
**Why it is true.** Each cell is determined by three cells to its right, one step earlier. The left column's value at time t+p depends only on its three right neighbors at time t+p-1, which repeat via the hypothesis, so it repeats too.
**Where the work is.** Applying the backwards rule to extract the cell-left-shifts at both times, then using h0/h1 to collapse the repeated terms on both sides to the same prehistory.

### EvolveRightEdge.lean
**What this says.** The rightmost cell that exists after `t` steps is always
black, as the leftmost one is.

**Why it is true.** Induction. A step earlier both its own position and its
right neighbour were outside the cone and white, and its left neighbour was
the previous right edge and black:
`true XOR (false OR false)` is `true`.

**Where the work is.** Two separate appeals to the cone lemma rather than
one, since positions `n + 1` and `n + 2` each have to be
shown outside. Symmetric to the left edge in position but not in argument --
there the black neighbour arrives from the right, here from the left.

### EvolveRightSecondDiagonal.lean
**What this says.** One step in from the right edge the colour alternates --
where one step in from the *left* edge it was constantly black. This is the
smallest true statement that tells the two sides of rule 30 apart.

**Why it is true.** Induction. Its left neighbour is its own previous entry,
its own position held the right edge (black), and its right neighbour was
outside the cone (white). So
`previous XOR (true OR false)` makes each entry the
opposite of the one before it.

**Where the work is.** The base case is done by hand, naming all three
neighbours at `t = 0` explicitly, and then the parity bookkeeping
that `evolve_left_fourth_diagonal` also needs.

### EvolveSubOneEqXor.lean
**What this says.** Rule 30 read backwards: the left cell one step earlier is determined by the current center and right cells.
**Why it is true.** Xor is self-inverse, so rearranging the forward rule's xor gives the backward view.
**Where the work is.** Rewrite and case-split on three booleans; reflexivity closes all eight cases.

### IsEventuallyPeriodicColumnUnique.lean
**What this says.** If two columns are eventually periodic, they are the same column.
**Why it is true.** Trichotomy on the column indices; each strict inequality contradicts not_isEventuallyPeriodic_pair.
**Where the work is.** Nowhere — the served lemma and ltOrGt exhaust all cases.

### IsEventuallyPeriodicCommonPeriod.lean
**What this says.** Any two eventually periodic 0/1 sequences share a single period: pick `p*q`
where `p` and `q` are their own periods, and both settle into that combined rhythm from whichever
starting point is later.
**Why it is true.** A period of a sequence is still a period after you repeat it: if `f` returns
to itself every `p` steps, it also returns to itself every `k*p` steps, for any `k`. Take `k = q`
for `f` and `k = p` for `g`, and both land on the same combined period `p*q`.
**Where the work is.** That repeated-period fact isn't in the statement, so it needs its own
induction on the multiplier `k` — the rest is picking `max N1 N2` as the shared start and
`mul_comm` to line up `p*q` with `q*p`.

### IsEventuallyPeriodicOfPeriodicStep.lean
**What this says.** A machine with only finitely many states, driven by an
update rule that itself eventually repeats, ends up repeating too.
**Why it is true.** Sample the state once per repeat of the rule; with only
finitely many states, two of those samples must coincide, and from a pair of
equal samples onward both the rule and the state trace the same steps again.
**Where the work is.** Turning "two coincidences of the rule" into one usable
fact costs an explicit lemma, since the arithmetic tactic cannot relate three
separate multiplications on its own without being handed the identity linking
them.

### IsEventuallyPeriodicShift.lean
**What this says.** A shifted reading of an eventually periodic sequence is itself eventually periodic.
**Why it is true.** The same period and starting point work: if `f(n+p) = f(n)` for `n ≥ N`, then `f(n+s+p) = f(n+s)` for the same `N`, since `n ≥ N` implies `n+s ≥ N`.
**Where the work is.** Unfolding the definition and arithmetic: no induction needed.

### LeftDiagonalPeriodicFromPow.lean
**What this says.** The `k`-th diagonal counted in from the left edge repeats
every `2^k` steps, and the repetition is already underway by step `2^k`.

**Why it is true.** Strong induction on `k`. The first two diagonals are
constantly black, so they repeat with any period from the very start.
Each later diagonal is built from the two before it by
`leftDiagonal_periodicFrom_step`, which turns two diagonals repeating with
period `q` into the next one repeating with period `2q`; running that once
per step doubles the period each time, which is exactly `2^k`.

**Where the work is.** The step lemma wants both inputs on the *same*
period, but the induction hands back `2^m` for one and `2^(m+1)` for the
other -- `periodicFrom_mul` stretches the shorter one by a factor of `2` to
match, and the two onsets then get raised to their common maximum before the
step lemma applies.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_periodicFrom_pow (k : ℕ) : ∃ N ≤ 2 ^ k, PeriodicFrom (leftDiagonal k) (2 ^ k) N
```

### LeftDiagonalPeriodicFromStep.lean
**What this says.** If two diagonals next to each other, both counted in from
the left edge, repeat with the same period from the same time on, then the
next diagonal in from them repeats too, with twice the period and starting
one period later.

**Why it is true.** `evolve_left_diagonal_recurrence` says each entry of that
third diagonal is fixed by one entry from each of the settled diagonals and
by its own previous entry -- exactly the one-bit machine
`bool_driven_eventually_two_periodic` already handles, and that lemma's
conclusion is this statement's period and onset verbatim, not just an
existential.

**Where the work is.** The recurrence and the two periodicity hypotheses each
number the diagonals with a slightly different offset (an extra `+1` or `+2`
tucked inside a cast to `ℤ`), so most of the proof is `omega`/`push_cast`
bookkeeping showing they are all talking about the same three sequences.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_periodicFrom_step (m q N : ℕ) (hq : 0 < q) (h0 : PeriodicFrom (leftDiagonal m) q N)
  (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) : PeriodicFrom (leftDiagonal (m + 2)) (2 * q) (N + q)
```

### LeftDiagonalPeriodicFromStepOfBlack.lean
**What this says.** If diagonal m+1 shows a black cell at index j+1 (at or past where
diagonals m and m+1 share a period q), then diagonal m+2 also repeats with that same
period q, starting right there at j+1 — no doubling, no delay.
**Why it is true.** In diagonal coordinates the step recurrence reads diagonal m+2 as a
one-bit machine driven by diagonals m and m+1; a black driver bit resets that machine's
state to a function of the drivers alone, so `bool_driven_periodicFrom_of_reset` applies.
**Where the work is.** Matching the recurrence's driver functions to shifted reads of
diagonals m and m+1, so their periodicity at index i+2 / i+1 restates as periodicity of
the drivers at i — pure index bookkeeping, no new idea.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_periodicFrom_step_of_black (m q N j : ℕ) (hNj : N ≤ j) (h0 : PeriodicFrom (leftDiagonal m) q N)
  (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) (hblack : leftDiagonal (m + 1) (j + 1) = true) :
  PeriodicFrom (leftDiagonal (m + 2)) q (j + 1)
```

### LeftDiagonalRecurrence.lean
**What this says.** A cell along the left-diagonal edge of the cone evolves by taking its own previous position, XOR'd with the logical-or of two cells one and two diagonals shallower.

**Why it is true.** The recurrence unfolds Rule 30's step at the left-boundary coordinates, expressing the cone's three-neighbor dependencies in diagonal coordinates.

**Where the work is.** Normalizing the position indices so that evolve_left_diagonal_recurrence applies directly to the three neighbors.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_recurrence (m i : ℕ) :
  leftDiagonal (m + 2) (i + 1) = (leftDiagonal m (i + 2) ^^ (leftDiagonal (m + 1) (i + 1) || leftDiagonal (m + 2) i))
```

### LeftDiagonalStepPeriodDichotomy.lean
**What this says.** If diagonals m and m+1 share a period q from N, then either
diagonal m+2 also settles into period q somewhere, or diagonal m+1 is white at
every index past N — the only two ways the step can go.
**Why it is true.** Case on whether diagonal m+1 ever shows black at or past N:
a black cell resets diagonal m+2 to period q right there
(`leftDiagonal_periodicFrom_step_of_black`); no black cell at all is exactly
the second disjunct, after shifting the index by one.
**Where the work is.** Nowhere new — one `by_cases`, one served lemma, and an
index shift by `omega` in the all-white branch.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_step_period_dichotomy (m q N : ℕ) (h0 : PeriodicFrom (leftDiagonal m) q N)
  (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
  (∃ M, PeriodicFrom (leftDiagonal (m + 2)) q M) ∨ ∀ j ≥ N + 1, leftDiagonal (m + 1) j = false
```

### NotEvolvePeriodAdjacent.lean
**What this says.** No two side-by-side columns can both repeat, with the
same positive period, from any common starting time.
**Why it is true.** If they did, that shared period would propagate leftward
forever (`evolve_period_sub`), reaching a column so far out that the light
cone hasn't touched it yet by the later of the two times it's compared at --
so it must be white there -- while the left edge of the cone is always
black. The two can't both be true of the same cell.
**Where the work is.** Picking a column far enough left, and a pair of times
a period apart that land outside the cone at the earlier one and on the edge
at the later one; once picked, the contradiction is immediate.

### NotIsEventuallyPeriodicAdjacent.lean
**What this says.** No two adjacent columns of the automaton are both eventually periodic.
**Why it is true.** If they shared a period, evolve_period_sub would propagate it left to the boundary, contradicting not_evolve_period_adjacent.
**Where the work is.** Just threading together the two served lemmas.

### NotIsEventuallyPeriodicPair.lean
**What this says.** Jen's theorem: no two distinct columns of the automaton, however far apart, are both eventually periodic.
**Why it is true.** If the two columns are adjacent this is already known; otherwise the column just right of the left one sits strictly between them, so it too is eventually periodic, and then it and its left neighbour are the adjacent case.
**Where the work is.** Lining up the strip width so the "column strictly between" lemma's two boundary indices land exactly on the given pair.

### PeriodicFromMul.lean
**What this says.** A multiple of a period is itself a period, from the same starting time.
**Why it is true.** Induction on the multiplier: the base case is trivial, and each step chains one more period onto the sequence.
**Where the work is.** None—it is pure arithmetic with two lemmas threaded in sequence.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.periodicFrom_mul (f : ℕ → Bool) (p N : ℕ) (h : PeriodicFrom f p N) (m : ℕ) : PeriodicFrom f (m * p) N
```

### RightDiagonalIsEventuallyPeriodic.lean
**What this says.** Every right diagonal repeats with period 2^k starting from the first cell.
**Why it is true.** The quantitative periodicity lemma rightDiagonal_periodicFrom_pow directly yields the existence of a period.
**Where the work is.** None; unfolding IsEventuallyPeriodic and providing the witnesses.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_isEventuallyPeriodic (k : ℕ) : IsEventuallyPeriodic (rightDiagonal k)
```

### RightDiagonalPeriodicFromPow.lean
**What this says.** Every diagonal counted in from the right edge repeats
outright, from its very first cell, with period exactly a power of two.
**Why it is true.** Strong induction on the depth. The edge itself is
constantly black (period 1) and the next diagonal in alternates (period 2);
each diagonal two further in inherits double the period of the one two
diagonals back, via `rightDiagonal_periodicFrom_step`.
**Where the work is.** The step lemma needs its two feeding diagonals on
one shared period, but the induction hands them 2^m and 2^(m+1) — so the
shallower one is stretched to 2^(m+1) with `periodicFrom_mul` before the
step lemma can combine them.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_periodicFrom_pow (k : ℕ) : PeriodicFrom (rightDiagonal k) (2 ^ k) 0
```

### RightDiagonalPeriodicFromStep.lean
**What this says.** If two neighbouring right diagonals of the cone both repeat with the same
period from the same time on, the diagonal just inside them repeats too, with double the period
and no delay in when it starts.
**Why it is true.** rightDiagonal_recurrence writes the new diagonal as its own previous cell
XOR'd with an OR of the two shallower diagonals; that OR repeats with the same period the two
inputs share, so bool_xor_driven_periodicFrom applies directly.
**Where the work is.** Showing the OR term repeats: each side needs the period hypothesis read
one step later than it was given, and lining up `n + q + 1` with `n + 1 + q` (and the `+2`
analogue) is the only arithmetic here.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_periodicFrom_step (m q N : ℕ) (h0 : PeriodicFrom (rightDiagonal m) q N)
  (h1 : PeriodicFrom (rightDiagonal (m + 1)) q N) : PeriodicFrom (rightDiagonal (m + 2)) (2 * q) N
```

### RightDiagonalRecurrence.lean
**What this says.** A cell along the right-diagonal edge of the cone evolves by taking its own previous position, XOR'd with the logical-or of two cells one and two diagonals shallower.

**Why it is true.** The recurrence unfolds Rule 30's step at the right-boundary coordinates, expressing the cone's three-neighbor dependencies in diagonal coordinates.

**Where the work is.** Normalizing the time indices and position casts so that evolve_succ and rule30_eq apply directly to the three neighbors.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_recurrence (m i : ℕ) :
  rightDiagonal (m + 2) (i + 1) =
    (rightDiagonal (m + 2) i ^^ (rightDiagonal (m + 1) (i + 1) || rightDiagonal m (i + 2)))
```

### StripEventuallyPeriodic.lean
**What this says.** A strip of cells is eventually periodic if its boundary cells are.
**Why it is true.** The update rule for the strip depends only on the two boundary cells; when both repeat with period p from time N, their schedule repeats, so the strip repeats.
**Where the work is.** Threading `isEventuallyPeriodic_of_periodic_step` with the two boundary periodicities and `strip_succ`; no proof needed.

### StripSucc.lean
**What this says.** A strip of columns advances by one rule-30 step, driven by
its current snapshot plus the two cells just outside its left and right ends.
**Why it is true.** Every cell of `strip` is `evolve` at some column, so one
step of `strip` is one step of `evolve`, which is `rule30_eq`; the boundary
cells of `stripStep` read those same outside columns by construction.
**Where the work is.** Matching `stripStep`'s dependent-`if` boundary reads
(a `Fin` index shifted by one, cast back to `ℤ`) against the plain integer
shift `i + k ± 1` that `evolve_succ`/`rule30_eq` produce for that same cell.

## Literature seeds (blueprint/crystals.md)
Read this before proposing: it is the literature on Rule 30 gathered
and ranked, and a proposal that ignores it re-derives what a paper
already settled or proposes what one already refuted.

# Seed crystals

Candidate statements for future tiers, gathered from the literature on
2026-09-07 by three research agents Rowan sent out, then deduplicated and
ranked by Rowan. Everything here is a *candidate*: a proved result in a
paper, or a robust computed fact, that could become a node. Nothing here is
on the board until it goes through `blueprint/proposals/next.json` and the
seed check like any other statement.

Conventions: single black cell at the origin; `evolve t x`; left diagonal
`leftDiagonal k j = evolve (j + k) (-j)`; right diagonal
`rightDiagonal k j = evolve (j + k) j`; column `i` is `t ↦ evolve t i`.
Rule 30 is `left XOR (centre OR right)`. **Left-permutive** means flipping
the left neighbour always flips the output; it is the property everything
below leans on.

Status words: *proved* (in the cited source), *computed* (checked
numerically, no proof in print), *folklore* (true and easy, no citation),
*open*. Difficulty is a guess for an automated prover: trivial / induction /
real math / open.

Sources the agents actually read in full: Rowland 2006; Jen's 1990 Los
Alamos report LA-UR-90-761 (OCR); Kopra 2022; Spencer 2013; Fuks 2013;
Kůrka's lecture notes; Schüle & Stoop 2012; Wolfram 1986 *Random sequence
generation*; the NKS notes; the prize essay; OEIS. Paywalled and therefore
secondhand: Jen JSP 1986, Meier–Staffelbach 1991, Cattaneo et al. 1999/2000,
Shereshevsky 1992, Jen CMP 1988.

## Seeded 2026-09-07 (for cross-reference)

The diagonal tier: `leftDiagonal_periodicFrom_pow` (period `2^k`, onset
`≤ 2^k`), `rightDiagonal_periodicFrom_pow` (period `2^k`, onset `0` —
Rowland 2006 Lemma 2 / Theorem 1), the walls `leftDiagonal_onset_le` and
`leftDiagonal_period_le`. See `Rule30/Statements.lean`.

## Tier A — one step from left-permutivity (cheap, reusable)

1. **The sideways inverse.** `evolve t (x-1) = xor (evolve (t+1) x) (evolve t x || evolve t (x+1))`
   for every configuration. *Folklore*; trivial. The project has it as
   `evolve_sub_one_eq_xor` for the single-cell run; the general-configuration
   form over `Config` is the reusable one.
2. **A difference moves right at speed exactly 1.** If `x, y` agree at every
   position `> i` and differ at `i`, then after `t` steps they differ at
   `i + t` and agree beyond it. Kůrka §5 (right Lyapunov exponent is exactly 1
   for every configuration). *Proved*; induction. The *left* speed (≈0.24) is
   empirical and not a target.
3. **Every word has exactly 4 preimages.** For every `n` and every `w : Fin n → Bool`,
   exactly 4 words `v : Fin (n+2) → Bool` map to `w`. Wolfram 1986 §4; NKS
   p. 1087; Hedlund 1969 in general. *Proved*; induction (choose the two
   rightmost cells freely, solve leftward). Verified computationally to
   `n = 8`. **The single most reusable seed here**: items 4, 5, 6, 7 and
   the ring facts all use the same leftward solve.
4. **Pre-injectivity.** Two configurations that differ in finitely many but
   at least one cell have different images. Boyle–Kitchens; Kůrka Prop. 22.
   *Proved*; trivial from item 2.
5. **Not injective.** `rule30 (fun _ => true) = rule30 (fun _ => false) = fun _ => false`.
   *Folklore*; trivial (`decide`-shaped).
6. **Surjective on ℤ.** Every configuration has a preimage. Schüle & Stoop
   Prop. 15. *Proved*; real math (compactness over item 3). Finite-support
   targets first: pick the tail `(0, 0)` and solve leftward; the leftward
   solution of an all-zero tail is all-zero. Then König/ultrafilter for the
   general case.
7. **Every column word occurs.** For every `t` and `c : Fin t → Bool` there
   is an initial configuration supported in `[-(t-1), 0]` with
   `evolve s 0 = c s` for `s < t`. NKS p. 1087 states it; the proof is
   induction using item 2 (flip cell `-(t-1)` to flip cell `(t-1, 0)` alone).
   *Proved* (argument is the agent's, not a citation); induction.
8. **A forbidden 2×2 block.** `x i = true → x (i+1) = true → rule30 x (i+1) = false`.
   So adjacent columns both black at two consecutive times never happen —
   the concrete witness for "not all `4^t` adjacent-column pairs occur".
   *Trivial*. A good first node for a new persona.
9. **Two adjacent complete columns determine everything to their left**
   (the Meier–Staffelbach weakness). If `x, y` agree on columns `i, i+1` for
   all `s ≤ T` then they agree on column `i - k` for `s ≤ T - k`. NKS
   p. 1087. *Proved*; induction from item 1.
10. **Algebraic normal form and symmetry class.** `f p q r = p XOR q XOR r XOR (q AND r)`;
    mirror is rule 86, complement rule 135, both rule 149; rule 30 is not
    amphichiral. *Trivial* (`decide`). Worth stating against the generic
    256-rule definitions so symmetry-transported theorems come free.

### The damage cone, from Cairn and Dib (2026-09-07)

Flip one cell of a random row; the set where the two pictures disagree is a
cone whose right edge advances exactly 1 per row and whose left edge
advances about 0.24 on average (Cairn measured 0.236 to 0.253 over five
trials of 20,000 rows on 400,000-cell rows; NKS p. 949 gives 0.2428, and
notes it is *similar but not identical* to the 0.252 of the regular-region
boundary). Three statements, in Cairn's words with Rowan's numbering:

- **A1. Left-permutivity as a `Config → Config` fact.**
  `rule30_ne_of_left_ne (c d : Config) (i : ℤ) (hl : c (i - 1) ≠ d (i - 1)) (hc : c i = d i) (hr : c (i + 1) = d (i + 1)) : rule30 c i ≠ rule30 d i`.
  `rule30_eq` twice and a `Bool` case split. Corollary worth its own node:
  if `c, d` differ at `i` and agree everywhere right of it, they differ at
  `i + 1` one step later, so the rightmost disagreement moves right by
  exactly one per row. This is item 2 above in its cleanest form.
- **A2. The exact local law of the left edge.** If `c, d` agree at `i - 2`
  and `i - 1` and differ at `i`, then `rule30 c (i - 1) ≠ rule30 d (i - 1) ↔ c (i - 1) = false`.
  The front advances left exactly when the cell beside it is white, and it
  can retreat, which is why the mean is below a half. Same proof shape.
  This is the deterministic content behind the 0.24 and is not in any of
  the thirty items above.
- **A3. Do not seed a bound on the left speed below 1.** The worst case is
  speed exactly 1, witnessed by `c` all white and `d = initialConfig`: the
  difference pattern is the single-seed picture and `evolve_left_edge`
  already says its edge moves at 1. Any bound below 1 is an average under
  the Bernoulli measure (Shereshevsky 1992), nobody has proved one for rule
  30, and even the statement needs Mathlib probability.

## Tier B — the single-cell pattern (edges, rows, columns)

11. **Rows `2^n` and `2^n - 1` restart the right edge.** Row `2^n - 1` ends in
    at least `n + 1` black cells; row `2^n` ends in a black cell preceded by
    at least `n` white cells. Rowland 2006 Theorem 1 and §3 (mirror
    orientation). *Proved*; induction over `rightDiagonal_periodicFrom_pow`
    plus the per-diagonal fact `rightDiagonal j (2^j - j) = false` for every
    `j ≥ 1` (row `2^n` is `≡ 0 mod 2^j` on every diagonal `j ≤ n`, so it
    reads that cell on each). That second ingredient is Rowland's own
    induction, not a finite check. An earlier draft of this row cited
    `rightDiagonal k 0 = false` instead; that cell is the centre column at
    time `k`, black at `k = 1, 3, 4, 5, 8`, and Cairn caught it on
    2026-09-07 before it was seeded. Conclusion verified `n = 1..9` (Rowan)
    and `n = 1..7` (Cairn, independently).
12. **The rightmost black run of row `t` depends only on `ord₂(t + 1)`**, and
    is strictly increasing in it: runs 1, 3, 4, 6, 7, 9, 15, 16, 24, 25, 27.
    Rowland §1, §3; OEIS A094603 (which lists the formula only as a
    conjecture, though Rowland proves it). *Proved*; weak form (`run (t + 2^k) ≥ k+1 ↔ run t ≥ k+1`)
    is induction, full form is real math (orbit of a permutation of
    `{0,1}^(k+1)`, about a page). The exact values have no formula.
    Mirror measurement (Cairn, 2026-09-07, to `t = 1100`): the white void
    touching the right edge at row `t` is a function of `ord₂(t)` alone,
    `ord₂ = 0..10 ↦ 0, 2, 3, 5, 6, 8, 14, 15, 23, 24, 26`. *Computed*.
13. **Rowland's period-doubling criterion for the left diagonals.** With
    diagonals `k-2, k-1` periodic from `t0` with periods `2^a, 2^b`,
    `α = max a b`: diagonal `k` has period `2^α` or `2^(α+1)`, and it doubles
    **iff** diagonal `k-1` is eventually white from `t0` and one period of
    diagonal `k-2` holds an odd number of black cells. Rowland 2006 Prop. 2,
    Lemma 3. *Proved*; "if" is induction, "only if" is real math but
    elementary. Directly under the wall `leftDiagonal_period_le`.
14. **Concrete left-diagonal periods and onsets.** Periods from `k = 0`:
    1, 1, 1, 2, 1, 2, 2, 1, 4, 1, 4, 4, …; OEIS A363345 (periods), A363346
    (transients); Brunnbauer 2019 to 410 diagonals. First appearance of each
    period: 2 at 3, 4 at 8, 8 at 29, 16 at 400, 32 at 87,867, 64 not before
    2,107,985,255 (NKS p. 871). *Computed*; any fixed `k` is provable by
    `leftDiagonal_periodicFrom_step` plus a finite check, the way the fourth
    and fifth diagonals were closed. Supply, not insight.
15. **Left-diagonal periodicity for every rule and every left-finite
    configuration.** For any of the 256 rules and any configuration constant
    far to the left, each left diagonal is eventually periodic. Jen JSP 1986
    Theorem 4 via Rowland's citation (the paper itself is paywalled).
    *Proved*; induction, the existing proof parametrised.
16. **Jen's sandwich lemma, for every rule.** If columns `i < j` are both
    eventually periodic then every column between them is. Jen 1990, from
    Jen 1986. *Proved*; induction (a strip between two periodic boundaries is
    a finite machine on a periodic schedule — the project already has
    `strip_eventuallyPeriodic` for rule 30). Seed the safe form: eventually
    periodic, period dividing `lcm(p_i, p_j) * 2^(j-i-1)`; the OCR's tighter
    `lcm` claim could not be confirmed.
17. **Jen's Proposition 3, arbitrary finite initial condition.** For rule 30
    from any finite nonzero configuration, at most one column is eventually
    periodic. Jen 1990. *Proved*; the project has the single-cell case and
    the skeleton; needs "the leftmost black cell moves left at speed 1".
18. **Kopra's width-2 trace theorem.** For any configuration that is white
    far to the left and not identically white (the right side may be
    infinite and arbitrary), no adjacent-column pair `t ↦ (evolve t i, evolve t (i+1))`
    is eventually periodic. Kopra, arXiv:2202.13809, Theorem 3.5. *Proved*;
    real math but short (Kopra Lemma 3.2 with `h = 0`). Strictly stronger
    than item 17. Kopra states the width-1 case as Problem 4.8: that is P1.
19. **Finite exclusions for the centre column.** For every period `p ≤ 64`
    and onset `T₀ ≤ 200` there is `t < 1100` with `centerColumn (t + p) ≠ centerColumn t`.
    *Computed*. In principle `decide` on a compact `Nat` row model (item 20);
    kernel evaluation cost unknown; `native_decide` is forbidden. Try
    `p ≤ 16, T₀ ≤ 50, t < 300` first.
20. **A `Nat` model of rows.** `rowNat 0 = 1`, `rowNat (t+1) = (4 * rowNat t) ^^^ ((2 * rowNat t) ||| rowNat t)`,
    with `centerColumn t = testBit (rowNat t) t`; OEIS A110240, A269160.
    Provable consequence: `3 * rowNat n < rowNat (n+1) < 5 * rowNat n` for
    `n ≥ 1` (rows `t ≥ 2` begin `110`). *Stated without proof on OEIS*;
    induction, fiddly bit arithmetic. Its value is as a `decide`-friendly
    engine, matching what `explorer/` does with BigInt. The earlier formula
    here was the mirror image (rule 86) and passed every symmetric check;
    caught by a kernel `decide` against `evolve` on 2026-09-07.
21. **Morse–Hedlund reformulation.** If the centre column is eventually
    periodic then its number of distinct length-`n` factors is bounded.
    Classical; induction. A lemma, not a target: the contrapositive premise
    (≥ n+1 factors for all n) is open.

## Tier C — periodic points and finite rings

22. **Fixed points on ℤ are exactly `0^ℤ`, `(01)^ℤ`, `(10)^ℤ`.** Wolfram 1986
    Table 6.2. *Proved*; induction over the four 3-blocks `000, 010, 011, 101`
    fixed by the rule (`011` cannot be continued). Ring version: 1 fixed
    point for odd `n`, 3 for even `n` (verified `n ≤ 16`).
23. **No configuration of exact temporal period 2.** `rule30 (rule30 x) = x → rule30 x = x`.
    *Computed* (de Bruijn graph on 4-blocks: only the three fixed points
    survive; verified on rings to `n = 16`); no published statement found,
    say so in the node. Induction plus one `decide` over 32 cases.
24. **`F^p` is left-permutive with left radius `p`**, so a temporally
    `p`-periodic configuration is determined leftward by any `2p` consecutive
    cells. Wolfram 1986 §6. *Proved* core; induction (composition of
    left-permutive rules is left-permutive). Do not seed Wolfram's "finitely
    many, blocks ≤ 2^(2p)" — could not be made precise.
25. **Garden-of-Eden on rings.** On a ring of size `n`, the all-black state
    has a predecessor iff `3 ∣ n`, and then exactly three (`(100)^k` and
    rotations); the all-white state has exactly two (`0^n`, `1^n`). Wolfram
    1986 §9 crediting C. and R. Feynman. *Proved*; induction. Consequence:
    rule 30 on a ring with `3 ∤ n` is not surjective. Do **not** seed the
    fuller Feynman characterisation Wolfram quotes; as transcribed it fails
    at `n = 4`.
26. **Ring predecessor count is the number of fixed points of a 4-element
    monodromy map**, so always in `{0, …, 4}`. *Folklore*, unpublished in
    this form; induction. The honest replacement for item 25's unverified
    characterisation.
27. **Cycle lengths on rings** (`≈ 2^(0.63 n)`): *empirical*, Wolfram says
    explicitly intractable. Only trivial bounds are provable. Not a target.

## Tier D — topological dynamics (heavier in Lean)

28. **Devaney-chaotic, mixing, sensitive, not positively expansive, not
    equicontinuous, dense periodic points.** Cattaneo–Finelli–Margara 2000
    (permutive ⟺ Devaney-chaotic for ECA); Schüle & Stoop 2012 Props. 6, 11,
    15, 16, 18, Cor. 19; Kůrka Prop. 28, Thm 32. *Proved*; real math (product
    topology on `ℤ → Bool`, Tychonoff). Seed only "dense periodic points"
    (via rings: every ring state is eventually periodic, pick a window inside
    a cycle) and the finitary sensitivity corollary in item 2. Note
    sensitivity in the literature comes via transitivity, not item 2, because
    a difference to the *right* of the origin must spread left at the
    unproved speed.

## Density (P2) — what exists

Read this section as the specification of a P2 tier. P2 has four proved
nodes (`centerColumn_zero`, `centerColumnDensity_nonneg`,
`centerColumnDensity_le_one`, `centerColumnDensity_succ`), every one of
them `Finset.card` bookkeeping that never touches the automaton, and
nothing open. Nothing in print proves anything about the centre column's
density, for rule 30 or for any chaotic rule; what is known is computed.
**One rule of this project closes off the computed facts:** a computed
fact becomes a Lean theorem only through `native_decide`, whose axiom
`Lean.ofReduceBool` is outside the allowlist (`propext`, `Classical.choice`,
`Quot.sound`), and kernel evaluation of `evolve` stops being usable at
depth about 18. So "the first million centre cells are balanced to one per
cent" cannot be a node, however true. Do not propose it. What can be
proposed is below: bridges to P1, balance for random rows, and
reformulations, all provable, none of them the prize.

29. **Row density** (OEIS A070952): purely empirical, `b(t)/t ∈ [0.85, 1.16]`
    for `100 ≤ t < 1100`; no proved asymptotic anywhere. Only `b(t) ≥ 3` for
    `t ≥ 1` and `b(t) ≤ 2t + 1` (the cone) are provable, and neither is
    worth a node.
30. **XOR lemma for random initial conditions.** For an i.i.d. fair initial
    configuration, `P(evolve t 0 = 1) = 1/2` for all `t ≥ 1` under any
    left-permutive rule. Chan-López & Martín-Ruiz, arXiv:2604.00165 (2026),
    Theorem 3. *Proved*, two lines; statable with Mathlib probability. Says
    nothing about the single-cell case. Its finite form is item 34, which
    needs no probability at all.
31. **Bridge to P1: an eventually periodic sequence has a convergent
    density.** If `IsEventuallyPeriodic f` then the running density of `f`
    converges, to (black cells in one period) / (period), a rational. In the
    direction P1 would cite: a centre column whose density does not converge
    is not eventually periodic. *Folklore*; the count over `N` terms of a
    `PeriodicFrom f p N0` sequence is `(N / p) * r` up to a bounded error,
    which is induction, and the limit is then `Filter.Tendsto` over a
    floor-division bound, which is real math in Lean. Two nodes: the count
    bound (S–M, pure `Nat`) and the limit (M, real analysis). The first
    node in P2 that would be cited from P1.
32. **The limit in count form.** `Tendsto centerColumnDensity atTop (nhds (1/2))`
    is equivalent to `∀ ε > 0, ∃ N0, ∀ N ≥ N0, |2 * count N - N| ≤ ε * N`
    where `count N` is the black-cell count in `range N`. *Trivial* from
    `Metric.tendsto_atTop` and one division; worth a node because every
    later P2 statement can then be stated over `count` in `ℕ` and never
    divide, the way `centerColumnDensity_succ` already had to be multiplied
    through by `N`.
33. **Count over a window.** `count (N + k) = count N + (black cells in
    [N, N + k))` and `count (N + k) - count N ≤ k`. *Trivial*; induction on
    `k` from `centerColumnDensity_succ`'s card recurrence. Supply for 31.
34. **Balance for random rows, finite form: after `t` steps, exactly half of
    all windows give a black centre cell.** Over the `2^(2t+1)` assignments
    of the cells at positions `-t..t`, exactly `2^(2t)` make `evolve t 0`
    black. *Proved* in effect by left-permutivity: `F^t` is left-permutive
    with left radius `t` (item 24), so flipping the leftmost cell of the
    window flips the output, and the assignments pair off. Needs two
    definitions or lemmas not yet in `Rule30/Basic.lean`: that `evolve t x 0`
    depends only on `x` restricted to `[-t, t]` (the cone lemma for an
    arbitrary configuration, not just the single seed), and a window type
    to count over. Difficulty M–L; the most interesting statement P2 can
    carry, and the reason one half is the expected answer. **Disclaimer to
    land with it:** the single black cell is one window out of `2^(2t+1)`,
    the least random one, and this says nothing about it.
35. **Left-permutivity of the local rule.** For fixed centre and right
    inputs, the two values of the left input give the two different
    outputs; equivalently exactly 4 of the 8 local inputs give black.
    *Trivial* (`decide`); the base of 34 and of crystal 3.
36. **Every word has exactly 4 preimages** (crystal 3, in its P2 role): rule
    30 maps the uniform distribution on words of length `n + 2` onto the
    uniform distribution on words of length `n`. A random row stays random.
    *Proved* (Hedlund 1969; Wolfram 1986 §4); induction on `n`, solving
    leftward by 35. Difficulty M. Shares its induction with 34.

## Not credible or not verified

- arXiv:2207.13237 (Das, "Rule 30: Solving the Chaos") claims an analytical
  solution to P1; not peer reviewed, not on the prize bibliography, not read.
- "BHLM-Bas-Zeta Wolfram Project" (ResearchGate, 2025) claims an
  equidistribution theorem for the centre column; same.
- The rule30prize.org bibliography lists nothing accepted since 2019.
- NKS "period 64 at depth 2,107,985,255 or more": single source.
- Wolfram's definition of the 0.252 boundary is not stated anywhere found.

## Rowan's ranking for the next tier

By value over cost: 3 (four preimages, the leftward solve) → 8 and 5 and 10
(trivial first nodes) → 11 (rows `2^n`) → 13 (Rowland's doubling criterion,
under a wall) → 16 (sandwich lemma for every rule) → 17 and 18 (Jen and
Kopra beyond the single cell) → 22 and 23 (fixed points, no period 2) → 25
and 26 (rings). Item 19 if kernel `decide` copes. Items 6 and 28 when a
prover has the topology set up. Not 27, not anything with "≈" in it.


## The engine
# explorer

A Rule 30 engine and two statistics scripts. Node 22, ES modules, no
dependencies, no build step.

## These produce empirical evidence only

The three [Rule 30 prize questions](https://writings.stephenwolfram.com/2019/10/announcing-the-rule-30-prizes/)
are open. Nothing in this directory bears on whether they are true.

- **Aperiodicity.** `periodscan.mjs` can only rule out the periods it tests, up
  to the number of terms it has. Finding no period below some bound is not
  evidence of aperiodicity — it is the absence of one particular kind of
  evidence for periodicity. And no amount of computation will change that:
  the configuration is an infinite row growing by two cells per step, so there
  is no finite state space to exhaust, and therefore no *N* past which a null
  result becomes conclusive.
- **Balance.** `centercolumn.mjs` reports a density near 0.5. A statement about
  an asymptotic limit is not testable by any finite prefix. A sequence can sit
  at 0.5 for a billion terms and converge to 0.4.
- **Irreducibility.** Nothing here addresses it at all. It is a claim about
  lower bounds on computation, and running a program fast says nothing about
  what a cleverer program could not do.

What the explorer is actually for: sanity-checking the Lean definitions against
a fast independent implementation, and making the sequence concrete enough to
have intuitions about. Treat every number it prints as a description of a
finite prefix.

## Scripts

| File | What it is |
|---|---|
| `rule30.mjs` | the engine — module, not a CLI |
| `verify.mjs` | self-check; exits non-zero on failure |
| `centercolumn.mjs` | center column + running density of 1s (prize question 2) |
| `periodscan.mjs` | search for eventual periodicity (prize question 1) |
| `spinecheck.mjs` | engine check of the inversion identity behind the adjacent-columns theorem (prize question 1) |

### verify.mjs

```
node explorer/verify.mjs          # or: npm run verify:explorer
```

Ten checks. The two that matter:

- the BigInt engine agrees with a naive per-cell implementation over 600
  generations — not only on the center column but on **every cell of every
  row**;
- the first 41 center terms are the [OEIS A051023](https://oeis.org/A051023)
  prefix.

The naive side is driven by the *rule number*, not by Rule 30's closed form, so
the two implementations share no reasoning. It also checks rule 90 against
binomial coefficients mod 2 and rule 254 against its light cone, which tests the
rule-number decoding on rules that have nothing to do with rule 30.

One more is worth naming: a **positive control for the period scan**. A scanner
that reported "nothing found" regardless of its input would look exactly like a
correct null result on Rule 30, so `scanPeriods` is also run on a period-5
sequence and on one that turns periodic at index 20 — it has to find both, and
its onset bound has to land at or below the true onset.

This is a check of the implementation. It is not evidence about the prize
questions, and the script says so when it passes.

### centercolumn.mjs

```
node explorer/centercolumn.mjs 1000000
npm run explore:center -- 1000000 --checkpoints=20
```

| Option | |
|---|---|
| `N` | generations, default 100000 |
| `--checkpoints=K` | K extra evenly spaced density reports |
| `--no-trim` | keep every cell; slower, identical output |
| `--print=K` | print the first K terms |
| `--out=FILE` | write the column to FILE as one line of digits |
| `--quiet` | final line only |

Density is reported at 1, 2, 5, 10, 20, 50, ... up to *N*. Decade spacing is
deliberate: drift in a density is a question about orders of magnitude, and one
final number would hide it. Measured excess of 1s over 0s at a few sizes:

| N | ones − zeros | density |
|---|---|---|
| 10,000 | +64 | 0.503200 |
| 100,000 | +196 | 0.500980 |
| 1,000,000 | +1,536 | 0.500768 |
| 2,000,000 | +1,418 | 0.500354 |

The excess grows while the density shrinks, which is what a fair coin would also
do — the excess of a random walk grows like √N. That is a remark about what the
numbers look like, not a result.

### periodscan.mjs

```
node explorer/periodscan.mjs 200000
npm run explore:period -- 200000 --max-period=50000
```

| Option | |
|---|---|
| `N` | terms of the center column, default 200000 |
| `--max-period=P` | largest period tested, default floor(N/2) |
| `--top=K` | show the K best candidates, default 10 |
| `--no-trim` | keep every cell; slower, identical output |

For each period *p* it walks backwards from the last term while `s[i] === s[i-p]`
and records where that first fails. That failure is the **last** disagreement at
lag *p*, so it puts a lower bound on how late an eventual period *p* could have
started. Because the walk terminates almost immediately on a sequence that does
not repeat itself, the whole scan is about O(*P*) rather than O(*N·P*) — the
200,000-term scan above makes about 200,000 comparisons in total, and the time
is entirely in generating the sequence.

`p > N/2` is capped away, because a period needs room to repeat at least once
before there is anything to observe. The output states the bound checked and
says explicitly what a null result does not mean.

Candidates are ranked by **repeats** = tail length / *p*. A real period would
show a value far above 1. At *N* = 200,000 the best is 0.33 — the period never
completed even once.

## The engine

The whole step is one line, applied to an entire row at once:

```js
next = (x << 1n) ^ (x | (x >> 1n))
```

A row is a BigInt, bit *i* is cell *i*, and cell indices increase to the right.
The shift directions are the one genuinely confusing part:

- bit *i* of `x << 1n` is bit *i−1* of `x`, and cell *i−1* is cell *i*'s **left**
  neighbour — so `x << 1n` is the left-neighbour plane, already aligned;
- bit *i* of `x >> 1n` is bit *i+1*, the **right** neighbour.

Read it as: shifting *up* moves each cell's contents into a higher index, so what
arrives at index *i* is what used to sit at *i−1*, on the left. The shift
direction is the opposite of the direction the data appears to move when you draw
the row with low indices on the left. This is easy to get backwards; `verify.mjs`
is what catches it if you do.

Two optimizations are in `centerColumn` and documented at the function:

- **Sliding window.** The row keeps only ~512 spare zero bits below the pattern
  and is shifted up when the pattern eats through them, rather than reserving
  *N* bits of headroom up front. Every bitwise operation costs time proportional
  to the whole BigInt, dead zero bits included, so carrying *N* of them for *N*
  steps is most of the run.
- **Light cone (`trim`).** Information moves one cell per step, so a cell more
  than *N−1−g* from the center at generation *g* cannot reach the center before
  the run ends. Past halfway, the row is masked to that shrinking cone.

Together these took 800,000 generations from 58s to 8.3s. `verify.mjs` checks
that trimming changes no term, and `--no-trim` is available on both CLIs.

## Measured performance

Node v22.20.0, Windows 11, one core. Wall clock for `centerColumn`, measured,
not extrapolated:

| N | time |
|---|---|
| 100,000 | 0.14s |
| 200,000 | 0.53s |
| 400,000 | 2.1s |
| 800,000 | 8.3s |
| 1,000,000 | 12.8s |
| 1,400,000 | 75s |
| 2,000,000 | 207s |

Up to about a million generations this tracks the expected quadratic curve
closely: the row is ~2*g* bits wide at generation *g*, so the total bit-work is
inherently O(*N²*) however tight the inner loop is. There is no arrangement of
BigInt operations that avoids that.

Past a million it degrades faster than quadratic — 1M → 1.4M costs 5.9× where
quadratic predicts 2.0×. Raising the young-generation size (`--max-semi-space-size=64`)
did not help, so it is not simply nursery GC; beyond that the cause is
undiagnosed and the numbers above are reported as measured rather than
explained. Peak RSS stayed under 100 MB throughout.

**Practical ceiling: about 1,000,000 generations in ~13s, and 2,000,000 if you
are willing to wait three and a half minutes.** Anything larger has not been
measured here, and the curve above is a reason not to guess.
