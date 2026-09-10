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

The closed table further down is the whole record of what has closed in P2, 8 closed as it
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
    "under": "<id of the wall this attacks; omit when none>",
    "route": {"tactics": "<tactic script>", "imports": ["Rule30.Proofs.EvolveLeftEdge"]},
    "witness": {"expression": "<Bool-valued Lean over the range>", "imports": [], "range": "t < 12"}
  }
]}

Required: `id`, `lean_name`, `statement`, `reason`. Optional, and to be
OMITTED rather than filled with a placeholder: `disclaims` (defaults to
empty), `under` (the id of the wall this proposal attacks, when it
attacks one — name it, since the captain lands it as the node's `under`
and the index shows which blocks belong to which wall by nothing else),
`route` (then `tactics` is required and `imports` optional), and
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

**State it in ℕ.** A statement that mixes ℕ and ℤ, or takes an absolute
value, gets a WARNING from the check rather than a refusal — but two of
the three budget exhaustions on 2026-09-07 were provers cycling on casts
over two-line facts, so an absolute value over casts is better proposed
as two ℕ inequalities, and a ℕ statement closes a rung cheaper.

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
  centerColumn_density_tendsto_half_iff_excess  size=M  sonnet  $0.94
  centerColumnCount_succ  size=S  haiku  $0.12
  centerColumnCount_sandwich  size=S  sonnet  $0.39
  centerColumn_excess_interpolate  size=M  opus  $0.89

## Why those proofs worked, in the provers' own words
### AdjacentDifferenceNotEventuallyOne.lean
**What this says.** No two neighbouring columns of the picture can disagree at every row from some point on.
**Why it is true.** Once a run turns up a row where column i is white, both columns are forced constant forever after, which makes them eventually periodic and contradicts the served fact that adjacent columns can't both be that.
**Where the work is.** Finding that forcing: a white cell in column i and a black one it forces in column i+1 propagate to every later row, by induction on how far forward you look.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.adjacent_difference_not_eventually_one (i : ℤ) : ¬∃ N, ∀ t ≥ N, evolve t i ≠ evolve t (i + 1)
```

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

### CenterColumnCountSandwich.lean
**What this says.** Black count is monotone in time and grows by at most one per step.
**Why it is true.** Extending from M to N adds N-M cells; each adds 0 or 1 to the count.
**Where the work is.** Induction on N-M: both bounds follow from accumulating single-step growth.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumnCount_sandwich (M N : ℕ) (h : M ≤ N) :
  {n ∈ Finset.range M | centerColumn n = true}.card ≤ {n ∈ Finset.range N | centerColumn n = true}.card ∧
    {n ∈ Finset.range N | centerColumn n = true}.card ≤ {n ∈ Finset.range M | centerColumn n = true}.card + (N - M)
```

### CenterColumnCountSucc.lean
**What this says.** The count of black cells in the center column up to index N+1
equals the count up to N, plus one if cell N is black.

**Why it is true.** Adding one index to a range adds that one cell to the
tally and disturbs nothing already counted.

**Where the work is.** Finset.range_add_one rewrites the new range as an insert,
Finset.filter_insert handles the insert in the filter, and the two cases
split cleanly: if the new cell is black it contributes 1, else 0.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumnCount_succ (N : ℕ) :
  {n ∈ Finset.range (N + 1) | centerColumn n = true}.card =
    {n ∈ Finset.range N | centerColumn n = true}.card + if centerColumn N = true then 1 else 0
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

### CenterColumnDensityTendstoHalfIffExcess.lean
**What this says.** The prize's density limit and a purely arithmetic statement
about how far the black count sits from half of `N` say exactly the same thing.

**Why it is true.** Multiplying out the division, `centerColumnDensity N - 1/2`
times `2N` equals the excess `2 * count N - N`, so bounding the density's gap
from `1/2` by some `ε` is the same fact as bounding the excess by `ε * N`,
after halving one `ε` or the other to line the two statements up.

**Where the work is.** Mathlib's `Metric.tendsto_atTop` hands back a strict
`<` at each `ε`, while the target wants a non-strict `≤`; each direction of
the `iff` passes the bound through an extra `ε / 2` to absorb that mismatch.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_density_tendsto_half_iff_excess :
  Filter.Tendsto centerColumnDensity Filter.atTop (nhds (1 / 2)) ↔
    ∀ (ε : ℝ), 0 < ε → ∃ N₀, ∀ N ≥ N₀, |2 * ↑{n ∈ Finset.range N | centerColumn n = true}.card - ↑N| ≤ ε * ↑N
```

### CenterColumnEqRowNatTestBit.lean
**What this says.** The centre cell of row t is the t-th bit of the packed row.
**Why it is true.** rowCell computes the t-th bit of rowNat by definition, and centerColumn is rowCell at position 0.
**Where the work is.** Connecting rowCell's cone condition to centerColumn via the universal rowCell_eq_evolve lemma.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_eq_rowNat_testBit (t : ℕ) : centerColumn t = (rowNat t).testBit t
```

### CenterColumnExcessInterpolate.lean
**What this says.** How far the centre column's black count strays from half the window cannot
move faster than the window itself: widening from M to N shifts it by at most N - M.
**Why it is true.** `centerColumnCount_sandwich` says the cells added between M and N contribute
somewhere between none of them and all of them, and either extreme moves the stray by N - M.
**Where the work is.** Nowhere deep: the one manual step is opening the absolute value by hand on
the sign of the stray at M, after which it is integer arithmetic.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_excess_interpolate (M N : ℕ) (h : M ≤ N) :
  |2 * ↑{n ∈ Finset.range N | centerColumn n = true}.card - ↑N| ≤
    |2 * ↑{n ∈ Finset.range M | centerColumn n = true}.card - ↑M| + (↑N - ↑M)
```

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

### CenterColumnNotIsEventuallyPeriodicOfCohomologous.lean
**What this says.** If the XOR of the centre column with any nonzero column is eventually periodic, then the centre column is not eventually periodic.
**Why it is true.** Any cohomologous column would force another column to be periodic via their shared XOR, and Jen's theorem forbids two distinct periodic columns.
**Where the work is.** None — applying the two served lemmas and a contradiction.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_not_isEventuallyPeriodic_of_cohomologous (x : ℤ) (j : ℕ) (hx : x ≠ 0)
  (hd : ∃ p > 0, ∃ N, PeriodicFrom (fun t => centerColumn t ^^ evolve (t + j) x) p N) :
  ¬∃ p > 0, ∃ N, PeriodicFrom centerColumn p N
```

### CenterColumnOtherOfCohomologousColumn.lean
**What this says.** If some column, xored cell-by-cell with the centre column, settles into a
repeating pattern, and the centre column itself does too, then that column repeats on its own.
**Why it is true.** Put both eventually-periodic facts on one shared period; then at each time the
centre column's repeat cancels out of the xor equation, leaving the column itself repeating.
**Where the work is.** The cancellation is the whole idea; the rest is bookkeeping to shift the
time index by `j` so the growing-column and the read-off-the-xor sequence line up.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_other_of_cohomologous_column (x : ℤ) (j : ℕ) (hx : x ≠ 0)
  (hd : ∃ p > 0, ∃ N, PeriodicFrom (fun t => centerColumn t ^^ evolve (t + j) x) p N)
  (hc : ∃ p > 0, ∃ N, PeriodicFrom centerColumn p N) : ∃ p > 0, ∃ N, PeriodicFrom (fun t => evolve t x) p N
```

### CenterColumnRightNotBothIsEventuallyPeriodic.lean
**What this says.** The centre column and the column just right of it cannot both repeat indefinitely.
**Why it is true.** Periodicity in adjacent columns extends to the far left, contradicting the left edge being always black.
**Where the work is.** None — direct application of the adjacent-column lemma at i = 0.

### CenterColumnRunBoundary.lean
**What this says.** The center column becomes black exactly when a run begins or ends at the origin in the previous row.
**Why it is true.** The rule 30 output at the origin is an XOR of the left cell with the OR of center and right; this XOR is true exactly in the three run-boundary patterns.
**Where the work is.** Unfolding the definition and rule30_eq, then verifying the XOR against all eight boolean triples to confirm the three patterns.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_run_boundary (t : ℕ) :
  centerColumn (t + 1) = true ↔
    evolve t 0 = true ∧ evolve t (-1) = false ∨
      evolve t 0 = false ∧ evolve t (-1) = true ∧ evolve t 1 = false ∨
        evolve t 0 = false ∧ evolve t 1 = true ∧ evolve t (-1) = false
```

### CenterColumnSuccOfBlack.lean
**What this says.** When the center cell is black at time t, the center cell at time t+1 equals the negation of the cell at position -1 at time t.
**Why it is true.** This is the special case of column_succ_of_black for the single-seed initial row, obtained by unfolding centerColumn to column initialConfig 0.
**Where the work is.** Applying column_succ_of_black with initialConfig and unfolding the equivalences.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_succ_of_black (t : ℕ) (h : centerColumn t = true) : centerColumn (t + 1) = !evolve t (-1)
```

### CenterColumnZero.lean
**What this says.** Before any step has been taken, the centre cell is
black.

**Why it is true.** `evolve 0` is the rule applied zero times, so it is
the starting row unchanged, and the starting row is a single black cell at
position 0.

**Where the work is.** Nowhere. Once the three definitions are unfolded the
claim is a concrete computation, and `decide` runs it.

### ColumnOneOfWhite.lean
**What this says.** When the centre cell is white at time t, column 1 at time t is pinned exactly to the xor of the next centre cell and column -1 at time t.
**Why it is true.** sideways_inverse at i = 0 reads column -1 as the xor of the next centre cell and (centre or column 1); a white centre drops the "or" to column 1 alone, so it is one xor-cancellation from the goal.
**Where the work is.** Untangling which of the three cells sideways_inverse's xor is solved for from the one it gives; the rest is `rw` and a four-case `cases`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.column_one_of_white (X : Config) (t : ℕ) (h : column X 0 t = false) :
  column X 1 t = (column X 0 (t + 1) ^^ column X (-1) t)
```

### ColumnSettledConfigEq.lean
**What this says.** The picture grown from the settled row is the settled region of the seed's own picture: every cell of it is a cell of the seed's picture read far down a left diagonal, past every transient.
**Why it is true.** Take the seed's row at time 2^(t+x+1) and slide it so its left edge sits at the origin; it agrees with the settled row on every cell within distance t of x, because each diagonal has repeated with period a power of two by then (leftDiagonal_periodicFrom_pow) and everything left of the edge is white. A cell after t steps depends only on that window, and growing a shifted row just shifts the picture.
**Where the work is.** Choosing the slid row's time as 2^(t+x+1) so the target cell needs no periodicity at all, and the natural-number arithmetic that the other window cells' indices differ by a multiple of their diagonal's period.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.column_settledConfig_eq (t : ℕ) (x : ℤ) (hx : -↑t ≤ x) :
  column settledConfig x t = leftDiagonal (↑t + x).toNat (2 ^ ((↑t + x).toNat + 1) - x).toNat
```

### ColumnSuccOfBlack.lean
**What this says.** When the center cell is black at time t, the center cell at time t+1 equals the negation of the left-edge cell at time t.
**Why it is true.** The rule at position 0 reads: new center = left XOR (true OR right). Since true OR right = true, this simplifies to new center = NOT left.
**Where the work is.** Applying sideways_inverse at i=0 and rewriting with the blackness hypothesis.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.column_succ_of_black (X : Config) (t : ℕ) (h : column X 0 t = true) : column X 0 (t + 1) = !column X (-1) t
```

### ConfigEqOfRightAndColumn.lean
**What this says.** If two rows agree everywhere strictly right of the origin
and have the same centre column over time, the two rows are identical.
**Why it is true.** Any difference would have a leftmost witness at some
`-m`; agreement right of `-m` then follows from the right-half hypothesis
(for positive positions) and from `-m` being leftmost (for the negative
positions in between), so `rightmost_difference_moves_right` carries that
difference to the origin at time `m`, contradicting the shared column.
**Where the work is.** Building the `∀ j, -m < j → X j = Y j` hypothesis the
served lemma needs, by splitting on the sign of `j` and using `Nat.find`'s
minimality on the negative side.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.config_eq_of_right_and_column (X Y : Config) (hright : ∀ (k : ℕ), X (↑k + 1) = Y (↑k + 1))
  (hcol : ∀ (t : ℕ), column X 0 t = column Y 0 t) : X = Y
```

### DamageNotAutonomous.lean
**What this says.** Two configurations whose XOR difference is identical everywhere can have different XOR differences one step later — the difference pattern does not evolve autonomously.
**Why it is true.** Construct four explicit configurations: two all-white or single-bit patterns that agree on their pairwise XOR, then use rule30_eq to show their successors' XOR differs at one position.
**Where the work is.** The case split proving the difference is uniform, then norm_num to verify the rule30_eq calculation at one position.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.damage_not_autonomous :
  ∃ X Y X' Y',
    (∀ (i : ℤ), (X i ^^ Y i) = (X' i ^^ Y' i)) ∧ ∃ i, (rule30 X i ^^ rule30 Y i) ≠ (rule30 X' i ^^ rule30 Y' i)
```

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

### EvolveFromEqOfAgreeOnWindow.lean
**What this says.** If two starting rows agree everywhere from `-t` to `t`,
the pictures they grow after `t` steps agree at the centre.

**Why it is true.** Induction on the number of steps taken, with a
strengthened claim: after `s` steps the two pictures still agree on the
shrunken window `-(t-s) .. (t-s)`, because each cell there reads three
cells one step earlier that are still inside the previous window.

**Where the work is.** Stating the shrinking window with plain `≤`/`≥`
instead of absolute value, so the step case is three calls to `omega`
instead of a sign case-split like `evolve_eq_false_of_outside_cone` needs.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.evolveFrom_eq_of_agree_on_window (c d : Config) (t : ℕ) (h : ∀ (j : ℤ), -↑t ≤ j → j ≤ ↑t → c j = d j) :
  evolveFrom c t 0 = evolveFrom d t 0
```

### EvolveFromEvolve.lean
**What this says.** Starting from row p and evolving t more steps gives row t+p overall.
**Why it is true.** Iteration composition: applying rule30 t times to (applying it p times) equals applying it t+p times.
**Where the work is.** Unfolding evolveFrom and using Function.iterate_add_apply to compose the iterations.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.evolveFrom_evolve (p t : ℕ) : evolveFrom (evolve p) t = evolve (t + p)
```

### EvolveFromLeftPermutive.lean
**What this says.** Running rule 30 for `t` steps is left-permutive with radius `t`: flip the cell `t` places to the left of `i` while holding every cell from `i - t + 1` to `i + t` fixed, and the cell at `i` after `t` steps flips too.
**Why it is true.** One step is left-permutive (`rule30_ne_of_left_ne`); after `s` steps the flipped position has walked one cell to the right and the surviving agreement window has shrunk by one cell on each side, so after `t` steps the flip has walked all the way to `i` itself.
**Where the work is.** Carrying that shrinking-window invariant through the induction on `s`, and aligning the cast of `s + 1` against the invariant's own `s` at each step with `push_cast`/`ring`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.evolveFrom_leftPermutive (t : ℕ) : LeftPermutive (fun c => evolveFrom c t) t
```

### EvolveFromTranslate.lean
**What this says.** One step applied to a shifted config equals stepping first then reading shifted: spatial translations commute with the evolution.

**Why it is true.** Induction on steps: the base case is by definition (both sides are the initial config), and each step applies rule30_translate to a row that already satisfies the inductive hypothesis.

**Where the work is.** None—it is rule30_translate's own content, lifted through the evolution by structural induction.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.evolveFrom_translate (c : Config) (s : ℤ) (t : ℕ) (i : ℤ) :
  evolveFrom (fun x => c (x + s)) t i = evolveFrom c t (i + s)
```

### EvolveHalfLeftEqColumn.lean
**What this says.** Feeding the left half-line model its own true boundary — the centre column, and the true row of cells at `x ≤ -1` at time `0` — reproduces exactly the left half of the same picture, at every position and every time.
**Why it is true.** Both sides satisfy the same rule-30 recurrence step for step; matching them is `rule30_eq` unfolded once per step of `t`, with the base case being that a row at time `0` is itself.
**Where the work is.** Lining up `evolveHalfLeft`'s own two-cell-ahead recursion in `k` against the `-1, 0, +1` neighbours `rule30_eq` produces is a handful of `omega`-closed position identities, not a new idea.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.evolveHalfLeft_eq_column (X : Config) (t k : ℕ) :
  evolveHalfLeft (column X 0) (fun k => X (-(↑k + 1))) t k = column X (-(↑k + 1)) t
```

### EvolveHalfRightEqColumn.lean
**What this says.** The right half-line, built only from the centre column and
row 0 of the right side, reproduces the picture's own columns at every
position `k + 1` and every time `t`.
**Why it is true.** Induction on `t`: `evolveFrom_succ` and `rule30_eq` unfold
one real step of the picture at position `k + 2` into the same three
neighbours the half-line's own recursion reads.
**Where the work is.** The `k = 0` branch reads the boundary `column X 0`
directly, where the `k + 1` branch reads three earlier half-line cells; both
land on `rule30_eq`'s three neighbours once the `ℕ`-to-`ℤ` casts line up.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.evolveHalfRight_eq_column (X : Config) (t k : ℕ) :
  evolveHalfRight (column X 0) (fun k => X (↑k + 1)) t k = column X (↑k + 1) t
```

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

### ExistsConfigSameCenterColumn.lean
**What this says.** For every `k` there is a starting row whose last black cell sits at
position `2k` and which nevertheless produces rule 30's own centre column from row 1 on —
so infinitely many different finite starting rows share the seed's centre column, and the
centre column cannot be run backwards to recover what started it.
**Why it is true.** Adding one black cell two places right of an isolated rightmost black
cell changes only the two cells riding the right edge of the picture: the disturbance is
pinned against the edge and never travels left, so it never reaches the origin.
**Where the work is.** Keeping that pinned edge exact. The induction has to carry four
facts at once — agreement everywhere left of the edge, and the precise value of each of the
three cells at and beyond it — because the edge cells feed each other on the next row.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.exists_config_same_centerColumn (k : ℕ) :
  ∃ c, c (2 * ↑k) = true ∧ (∀ (i : ℤ), 2 * ↑k < i → c i = false) ∧ ∀ (t : ℕ), 1 ≤ t → column c 0 t = centerColumn t
```

### FrontSurvival.lean
**What this says.** When two configurations agree left of a difference and disagree at it, their rule 30 evolution is determined by three cells: the disagreement at the current position, the background's next cell, and the pictures' agreement one cell right.

**Why it is true.** Rule 30 is a function of three neighbours, so applying it to two differing configurations gives a formula in the difference pattern.

**Where the work is.** Unfolding rule30_eq on both configurations and simplifying the Boolean algebra with the hypotheses.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.front_survival (c d : Config) (i : ℤ) (hl : c (i - 1) = d (i - 1)) (hc : c i = !d i) :
  (rule30 c i ^^ rule30 d i) = (!d (i + 1) ^^ d i && (c (i + 1) ^^ d (i + 1)))
```

### FrontSurvivalOfAgree.lean
**What this says.** When two configurations agree on either side of a single disagreement, their rule 30 outputs differ by the negation of the right background cell.

**Why it is true.** One step of the rule at position i: the left and right neighbors agree, so the rule output depends only on whether the center is flipped, determining the XOR difference.

**Where the work is.** Case analysis on two Boolean values: the background's right cell, and whether it's true or false in the negated configuration.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.front_survival_of_agree (c d : Config) (i : ℤ) (hl : c (i - 1) = d (i - 1)) (hc : c i = !d i)
  (h1 : c (i + 1) = d (i + 1)) : (rule30 c i ^^ rule30 d i) = !d (i + 1)
```

### FrontSurvivalOfWhite.lean
**What this says.** When the background is white (false) at the damage front, the front simply advances: the disagreement at i propagates to i+1 as the negation of the background's next cell.
**Why it is true.** Applying rule30_eq to both configurations, the white cell at d i makes its local rule trivial, and comparing the two outputs reduces to comparing cells at i-1 where they agree and i+1 where we want the result.
**Where the work is.** Unfolding rule30_eq and cancelling the XOR of complementary cells (c i and d i) in the symmetric part.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.front_survival_of_white (c d : Config) (i : ℤ) (hl : c (i - 1) = d (i - 1)) (hc : c i = !d i)
  (h0 : d i = false) : (rule30 c i ^^ rule30 d i) = !d (i + 1)
```

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

### LeftDiagonalAgreeSuccIff.lean
**What this says.** Given that two neighbouring diagonals already agree one cell back, they agree at the next cell exactly when either the driving cell between them is black and the two diagonals underneath agree, or the driving cell is white and the diagonal two shallower is white there.

**Why it is true.** One step of the rule, read in diagonal coordinates twice (once for each of the two diagonals), turns the agreement into a boolean identity once the shared driving cell is substituted using the one-cell-back hypothesis.

**Where the work is.** Lining up the index arithmetic so both instances of the recurrence land on the same three cells; once that is done the whole claim is eight cases of a decidable boolean fact.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_agree_succ_iff (m i : ℕ) (h : leftDiagonal (m + 2) (i + 2) = leftDiagonal (m + 3) (i + 1)) :
  leftDiagonal (m + 2) (i + 3) = leftDiagonal (m + 3) (i + 2) ↔
    leftDiagonal (m + 3) (i + 1) = true ∧ leftDiagonal m (i + 4) = leftDiagonal (m + 1) (i + 3) ∨
      leftDiagonal (m + 3) (i + 1) = false ∧ leftDiagonal m (i + 4) = false
```

### LeftDiagonalBlackAfterWhite.lean
**What this says.** When a left diagonal is white forever from a certain point, and the next diagonal in is black at one cell, the diagonal beyond that is black from that same cell onward.
**Why it is true.** Each diagonal's value is determined by its two inner diagonals via the recurrence; an inner white diagonal forces the recurrence to simplify.
**Where the work is.** The induction step uses the recurrence at two index positions, one of which must re-normalize with omega.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_black_after_white (m N j : ℕ) (hNj : N ≤ j) (hw : ∀ i ≥ N, leftDiagonal (m + 1) i = false)
  (hb : leftDiagonal (m + 2) (j + 1) = true) (i : ℕ) : i ≥ j + 1 → leftDiagonal (m + 3) i = true
```

### LeftDiagonalComplAfterBlack.lean
**What this says.** Past an all-black diagonal, the next diagonal is the negation of the diagonal two steps back, shifted one position.
**Why it is true.** The diagonal recurrence, applied at m+2, XORs with a diagonal that is all-true (by hypothesis), and xor with true is negation.
**Where the work is.** Applying the recurrence relation once and simplifying xor with true via Bool.or_true.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_compl_after_black (m N : ℕ) (hb : ∀ i ≥ N, leftDiagonal (m + 3) i = true) (i : ℕ) :
  i ≥ N → leftDiagonal (m + 4) (i + 1) = !leftDiagonal (m + 2) (i + 2)
```

### LeftDiagonalEqRowNatTestBit.lean
**What this says.** Diagonal k at index j is bit k of the packed row at time j + k.
**Why it is true.** A diagonal reads evolve, which unfolds to rowCell, which by definition reads testBit of rowNat.
**Where the work is.** Unfolding definitions and normalizing the index with omega.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_eq_rowNat_testBit (k j : ℕ) : leftDiagonal k j = (rowNat (j + k)).testBit k
```

### LeftDiagonalMulPowEqSettledCenter.lean
**What this says.** The settled word of a diagonal is the same at every multiple of the diagonal's period.
**Why it is true.** Periodicity: after 2^k steps, each diagonal k repeats, so 1 * 2^k and m * 2^k read the same cell.
**Where the work is.** Induction on m starting from 1, threading the periodicity; ring handles index arithmetic.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_mul_pow_eq_settledCenter (k m : ℕ) (hm : 1 ≤ m) : leftDiagonal k (m * 2 ^ k) = settledCenter k
```

### LeftDiagonalNotBothEventuallyWhite.lean
**What this says.** No two neighbouring left diagonals can both be white for ever.
**Why it is true.** The recurrence forces whiteness one diagonal further in each
time, descending until it reaches diagonals 0 and 1, which are always black.
**Where the work is.** Strong induction on the diagonal index, with two uses of the
recurrence per step to push the white tail inward before citing the induction
hypothesis one diagonal shallower.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_not_both_eventually_white (k : ℕ) :
  ¬((∃ N, ∀ j ≥ N, leftDiagonal k j = false) ∧ ∃ M, ∀ j ≥ M, leftDiagonal (k + 1) j = false)
```

### LeftDiagonalOnsetLeIffRowNatReturn.lean
**What this says.** Every left diagonal of the picture settles into its repetition by
its own depth exactly when, for each depth `k`, rows `2k` and `2k + 2^k` of the picture
agree in their lowest `k+1` cells.

**Why it is true.** A row read as a binary number has an autonomous low end: the next
row's cell `b` depends only on cells `b-2, b-1, b` of this row, so agreement of the low
`k+1` cells is preserved for ever once it happens, and `leftDiagonal_eq_rowNat_testBit`
says cell `k` of row `j + k` is exactly the `k`-th diagonal at index `j`.

**Where the work is.** The backward direction is one autonomy induction; the forward one
needs each diagonal's period replaced by the common power of two `2^k` while keeping the
onset the hypothesis gives, which is `periodicFrom_trans_period` below.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_onset_le_iff_rowNat_return :
  (∀ (k : ℕ), ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N) ↔
    ∀ (k : ℕ), rowNat (2 * k) % 2 ^ (k + 1) = rowNat (2 * k + 2 ^ k) % 2 ^ (k + 1)
```

### LeftDiagonalOnsetLeIffStepModReturn.lean
**What this says.** Every left diagonal settles by its own index if and only if, for
every `k`, the orbit of 1 under `r ↦ (4r XOR (2r OR r)) mod 2^(k+1)` takes the same
value at steps `2k` and `2k + 2^k`.

**Why it is true.** `leftDiagonal_onset_le_iff_rowNat_return` already says the wall is a
congruence between rows `2k` and `2k + 2^k`; `rowNat_mod_eq_iterate` says a row mod
`2^n` is exactly that many iterations of the truncated step from `1`. Substituting the
second into the first is the whole content.

**Where the work is.** Nowhere new: two rewrites in each direction, one per side of the
congruence, using `rowNat_mod_eq_iterate` at `n = k + 1`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_onset_le_iff_stepMod_return :
  (∀ (k : ℕ), ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N) ↔
    ∀ (k : ℕ), (stepMod (k + 1))^[2 * k] (1 % 2 ^ (k + 1)) = (stepMod (k + 1))^[2 * k + 2 ^ k] (1 % 2 ^ (k + 1))
```

### LeftDiagonalOnsetLeNotOfBlackLadder.lean
**What this says.** No strictly increasing onset sequence meeting the black-or-white witness ever gets `N k ≤ k` for `k ≥ 3`.

**Why it is true.** Strict growth alone forces `N j ≥ j`; combined with `N k ≤ k` it pins `N j = j` for every `j ≤ k`, in particular `N 2 = 2` and `N 3 = 3`. The witness at index 2 then needs diagonal 3 black at 3 or white from 3 on, but diagonal 3 alternates (`evolve_left_fourth_diagonal`): white at 3, black at 4, so both fail.

**Where the work is.** Getting `N 2 = 2` and `N 3 = 3` for an arbitrary `k ≥ 3`, not just `k = 3`: only consecutive `hmono` steps are given, so it takes a downward induction from the pinned `N k = k`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_onset_le_not_of_black_ladder (N : ℕ → ℕ) (hmono : ∀ (k : ℕ), N k < N (k + 1))
  (hwitness : ∀ (k : ℕ), leftDiagonal (k + 1) (N (k + 1)) = true ∨ ∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false)
  (k : ℕ) (hk : 3 ≤ k) : k < N k
```

### LeftDiagonalOnsetLeOfBlackLadder.lean
**What this says.** Given checkpoints `N 0 < N 1 < ...`, each backed by either a
black cell of the next diagonal in at its checkpoint or a certificate that the
next diagonal is white from the previous checkpoint on, every left diagonal has
settled into its repeating pattern by its own checkpoint.
**Why it is true.** Carry diagonals `m` and `m+1` on one shared period anchored
at `N m`; the witness at step `m` either resets that period at the black cell
(`leftDiagonal_periodicFrom_step_of_black`), or, being white, rules out the only
other branch of `leftDiagonal_step_onset_dichotomy`, which doubles the period
and moves the onset in by one cell.
**Where the work is.** Keeping both diagonals of the pair anchored at the
*smaller* checkpoint `N m`, not `N (m+1)` -- that is what lets the black-cell
witness, sitting one before `N (m+1)`, actually apply.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_onset_le_of_black_ladder (N : ℕ → ℕ) (hmono : ∀ (k : ℕ), N k < N (k + 1))
  (hwitness : ∀ (k : ℕ), leftDiagonal (k + 1) (N (k + 1)) = true ∨ ∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false)
  (k : ℕ) : ∃ p > 0, PeriodicFrom (leftDiagonal k) p (N k)
```

### LeftDiagonalOnsetLeOfLe5000.lean
**What this says.** Every left diagonal up to depth 5000 has settled into its own
repetition by its own index, exactly as the (still open, unbounded) onset wall claims.

**Why it is true.** `leftDiagonal_eq_rowNat_testBit` reads a diagonal off one bit of a
packed row, and a return of the low bits of two rows forces every later row to return
the same way (`iterate_eq_of_eq` below). Row `2k` and row `2k + 16` agree in their low
`k+1` bits for every `k ≤ 5000` — checked by the kernel, not argued — so period `16`
works at every depth in range.

**Where the work is.** The kernel computation itself: `decide +kernel` evaluates the
congruence at all 5001 depths through `rowNat_mod_eq_iterate`'s truncated orbit, which is
the only part of this file that is not bookkeeping.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_onset_le_of_le_5000 (k : ℕ) (hk : k ≤ 5000) :
  ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N
```

### LeftDiagonalOnsetLeOfLine.lean
**What this says.** If at every diagonal either the boundary cell one step in is
black, or the new diagonal already matches itself one period past that boundary,
then every left diagonal has settled into a repeating pattern by its own index.
**Why it is true.** Each Boolean case is exactly the hypothesis of a closed lemma:
a black boundary cell resets the diagonal with its period unchanged
(`leftDiagonal_periodicFrom_step_of_black`), and an early match lets the one-bit
machine's period stay unchanged too (`bool_driven_periodicFrom_of_return`).
**Where the work is.** Lining up the induction's two periods (`2^m`, `2^(m+1)`)
onto one common period `2^(m+1)` via `periodicFrom_mul` before either branch fires.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_onset_le_of_line
  (h :
    ∀ (m : ℕ),
      leftDiagonal (m + 1) (m + 2) = true ∨ leftDiagonal (m + 2) (m + 1 + 2 ^ (m + 2)) = leftDiagonal (m + 2) (m + 1))
  (k : ℕ) : ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N
```

### LeftDiagonalOnsetLeOfStepModPreperiod.lean
**What this says.** If, for every width `k+1`, the orbit of `1` under the row bit-twiddle
truncated to `k+1` bits is repeating by step `2k`, then every left diagonal `k` has settled
into its own repetition by index `k`.
**Why it is true.** `rowNat_mod_eq_iterate` says the truncated rows are exactly that orbit,
and `leftDiagonal_eq_rowNat_testBit` reads diagonal `k` off bit `k` of a row; bit `k` of a
number only depends on the number mod `2^(k+1)`.
**Where the work is.** None of it is diagonal reasoning: it is matching `rowNat (n+p+k)` to
the truncated orbit at `n+k`, taken from the hypothesis at `t = n+k ≥ 2k`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_onset_le_of_stepMod_preperiod
  (H : ∀ (k x : ℕ), x < 2 ^ (k + 1) → ∃ p > 0, ∀ t ≥ 2 * k, (stepMod (k + 1))^[t + p] x = (stepMod (k + 1))^[t] x)
  (k : ℕ) : ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N
```

### LeftDiagonalPairNeverEventuallyShifted.lean
**What this says.** No two left diagonals a fixed gap `d` apart ever settle into
lockstep for good: past any starting index `N`, some later index still shows a
difference, either on the pair itself or its very next cell.

**Why it is true.** If they matched forever from some point on, the shared
`recurrence` term cancels between diagonal `k` and diagonal `k + d`, dragging the
same agreement one diagonal further left, all the way down to diagonals `0`/`1`
(always black, `evolve_left_edge`/`evolve_left_second_diagonal`) and `d - 1`
forced white — but a diagonal that is white forever contradicts diagonal `0`
being black forever too, once the descent reaches it.

**Where the work is.** `xor_cancel`: the recurrence's shared
`leftDiagonal (m+1) (i+1) || leftDiagonal (m+2) i` term cancels by a Bool case
split, leaving `leftDiagonal m (i+2) = leftDiagonal (m+d) (i+2)` — the one step
that walks the agreement from diagonal `m+2` down to diagonal `m`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_pair_never_eventually_shifted (k d N : ℕ) (hd : 0 < d) :
  ∃ j ≥ N, leftDiagonal k j ≠ leftDiagonal (k + d) j ∨ leftDiagonal (k + 1) j ≠ leftDiagonal (k + d + 1) j
```

### LeftDiagonalPeriodLeOfBlackBetween.lean
**What this says.** A period shared by two neighbouring left diagonals carries
inwards, unchanged, across every diagonal that keeps showing black cells for ever.
**Why it is true.** `leftDiagonal_step_period_dichotomy` says one step inwards
either keeps the period or leaves the middle diagonal white for ever; a diagonal
with black cells arbitrarily far out rules the second case out, so the period
survives, and the pair is back in its starting shape one diagonal further in.
**Where the work is.** Nowhere deep — the induction carries a *pair* of diagonals
rather than one, and the two onsets it collects are merged by taking their max.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_period_le_of_black_between (m q N n : ℕ) (h0 : PeriodicFrom (leftDiagonal m) q N)
  (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) (hb : ∀ i < n, ∀ (J : ℕ), ∃ j ≥ J, leftDiagonal (m + 1 + i) j = true) :
  ∃ M, PeriodicFrom (leftDiagonal (m + n)) q M ∧ PeriodicFrom (leftDiagonal (m + n + 1)) q M
```

### LeftDiagonalPeriodLeOfWhiteCount.lean
**What this says.** Carrying a period shared by two neighbouring left diagonals
inwards costs a doubling only at a diagonal that eventually goes white, so after
`n` steps the period is the one you started with doubled once per white diagonal.
**Why it is true.** One step inwards is `leftDiagonal_step_period_dichotomy`: it
either keeps the period or leaves the middle diagonal white for ever, and in the
white case `leftDiagonal_periodicFrom_step` still pays only a factor of two.
**Where the work is.** Nowhere deep; the bookkeeping is that the tally `w` may
jump by more than one, so each step lifts both diagonals onto the larger period
with `periodicFrom_mul` rather than assuming they arrive already matching.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_period_le_of_white_count (m q N n : ℕ) (hq : 0 < q) (w : ℕ → ℕ) (hw0 : w 0 = 0)
  (hmono : ∀ (i : ℕ), w i ≤ w (i + 1))
  (hstep : ∀ i < n, (∀ (J : ℕ), ∃ j ≥ J, leftDiagonal (m + 1 + i) j = true) ∨ w i < w (i + 1))
  (h0 : PeriodicFrom (leftDiagonal m) q N) (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
  ∃ M, PeriodicFrom (leftDiagonal (m + n)) (2 ^ w n * q) M ∧ PeriodicFrom (leftDiagonal (m + n + 1)) (2 ^ w n * q) M
```

### LeftDiagonalPeriodUnbounded.lean
**What this says.** Fix any power of two; some left diagonal of the pattern never
settles into repeating with that period, no matter how long you wait.
**Why it is true.** Past its onset a periodic diagonal is fixed by the finitely
many bits it shows in one period, so among infinitely many diagonals two
*consecutive pairs* must show the same bits — and `leftDiagonal_pair_never_eventually_shifted`
says no two distinct pairs of neighbouring diagonals can agree forever.
**Where the work is.** Lining the phases up: the two diagonals repeat from
different starting points, so each is first rewritten to be read at a multiple of
the period, where the residue of the index alone decides the cell.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_period_unbounded (a : ℕ) : ∃ k, ∀ (N : ℕ), ¬PeriodicFrom (leftDiagonal k) (2 ^ a) N
```

### LeftDiagonalPeriodUnboundedLe.lean
**What this says.** Fix any power of two. Then one of the first few left diagonals
of the pattern already fails to repeat with that period — and "few" is bounded
explicitly, so the wait for the next failure is never longer than that.
**Why it is true.** Past its onset a diagonal repeating with period `p` is fixed by
the `p` bits it shows in one period, so a diagonal and its neighbour together show
one of only `4 ^ p` bit-patterns; among `4 ^ p + 1` diagonals two must show the
same one, and `leftDiagonal_pair_never_eventually_shifted` forbids that.
**Where the work is.** Counting the patterns: the pigeonhole needs the codomain's
size as a number, so the two `p`-bit words must be turned into `4 ^ p` by hand.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_period_unbounded_le (a : ℕ) :
  ∃ k ≤ 4 ^ 2 ^ a + 1, ∀ (N : ℕ), ¬PeriodicFrom (leftDiagonal k) (2 ^ a) N
```

### LeftDiagonalPeriodicFromOfRowNatAgree.lean
**What this says.** If rows `T` and `T+p` of the pattern agree on their low `k+1` bits, for
some `T` at or before `2k`, then left diagonal `k` repeats with period `p` from index `k` on.
**Why it is true.** Diagonal `k` at index `j` is bit `k` of row `j+k`; agreement of the low bits
is never lost going forward (`rowNat_agree_forward`), so it holds at every row `j+k` with `j ≥ k`.
**Where the work is.** Isolating bit `k` from the low-bits agreement, via `Nat.testBit_mod_two_pow`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_periodicFrom_of_rowNat_agree (k p T : ℕ) (hT : T ≤ 2 * k)
  (h : rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1)) : PeriodicFrom (leftDiagonal k) p k
```

### LeftDiagonalPeriodicFromOfRowNatAgreeAny.lean
**What this says.** Rows that agree on their low bits make that diagonal periodic from any time.
**Why it is true.** If rows T and T+p match mod 2^(k+1), diagonal k's bit k matches at times n+k and n+p+k for all n ≥ T.
**Where the work is.** Applying rowNat_agree_forward to extend the bit agreement to arbitrary times past T.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_periodicFrom_of_rowNat_agree_any (k p T : ℕ)
  (h : rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1)) : PeriodicFrom (leftDiagonal k) p T
```

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

### LeftDiagonalPeriodicFromStepTwoOfBlack.lean
**What this says.** A black cell at index j+1, on both diagonal m+1 and diagonal m+2, carries a
shared period q from diagonals m, m+1 two steps inward at once, to diagonals m+2 and m+3, both
starting right there at j+1.
**Why it is true.** The first diagonal is `leftDiagonal_periodicFrom_step_of_black` unchanged.
For the second, the same reset argument applies one step further in: diagonal m+3's driving
diagonal is m+2, and its own periodicity from j+1 (just established) is exactly what the reset
needs, read from index j instead of j+1 since the driver in this step is shifted by one.
**Where the work is.** Recognising that diagonal m+2's freshly-proved period, shifted by one
index, supplies the second application's driver hypothesis — no new idea beyond the one step.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_periodicFrom_step_two_of_black (m q N j : ℕ) (hNj : N ≤ j)
  (h0 : PeriodicFrom (leftDiagonal m) q N) (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N)
  (hblack : leftDiagonal (m + 1) (j + 1) = true) (hblack2 : leftDiagonal (m + 2) (j + 1) = true) :
  PeriodicFrom (leftDiagonal (m + 2)) q (j + 1) ∧ PeriodicFrom (leftDiagonal (m + 3)) q (j + 1)
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

### LeftDiagonalShiftOfWhite.lean
**What this says.** If diagonal m+2 is white from index N onward, then diagonal m read two cells later equals diagonal m+1 read one cell later, from N on.
**Why it is true.** The recurrence at diagonal m+2 xors together three terms; two of the three vanish once both white readings are substituted in, forcing the remaining two to agree.
**Where the work is.** None — one rewrite of `leftDiagonal_recurrence` at the two white cells, then a four-way Bool case split.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_shift_of_white (m N : ℕ) (hw : ∀ i ≥ N, leftDiagonal (m + 2) i = false) (i : ℕ) :
  i ≥ N → leftDiagonal m (i + 2) = leftDiagonal (m + 1) (i + 1)
```

### LeftDiagonalStepOfWhiteParity.lean
**What this says.** Once a left diagonal has gone permanently white, the diagonal
two further in is just the running total, counted black-or-not, of the diagonal
two further out: so travelling one period along it flips it exactly when that
period contains an odd number of black cells.

**Why it is true.** With the white diagonal dropped, the local rule loses its
"or" term and becomes a plain running XOR. Walking a whole period adds up the
same block of cells no matter where you start, because the driving diagonal
already repeats, so that one bit of parity decides everything.

**Where the work is.** Showing the block total is the same from every starting
point past the onset: peel the first cell off the front and the last off the
back, and they are the same cell one period apart, so the two cancel.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_step_of_white_parity (m q N : ℕ) (hq : 0 < q) (h0 : PeriodicFrom (leftDiagonal m) q N)
  (hwhite : ∀ j ≥ N + 1, leftDiagonal (m + 1) j = false) :
  (Even (∑ j ∈ Finset.range q, if leftDiagonal m (N + j + 2) = true then 1 else 0) →
      PeriodicFrom (leftDiagonal (m + 2)) q N) ∧
    (Odd (∑ j ∈ Finset.range q, if leftDiagonal m (N + j + 2) = true then 1 else 0) →
      ∀ n ≥ N, leftDiagonal (m + 2) (n + q) = !leftDiagonal (m + 2) n)
```

### LeftDiagonalStepOnsetDichotomy.lean
**What this says.** Going one diagonal further in from the left edge, the point where
the pattern starts repeating moves by exactly one cell — unless the diagonal in
between is black somewhere, in which case it moves to that black cell instead.
**Why it is true.** A black cell in the middle diagonal wipes out the new diagonal's
memory of its own past; where the middle diagonal stays white forever, the new one is
just a running total of the diagonal two further out, and a running total of something
that repeats repeats too, from the very same place.
**Where the work is.** The white case. The known step lemma pays a whole period of
delay there; this pays one cell, which is the difference between the growth being
exponential and being linear.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_step_onset_dichotomy (m q N : ℕ) (h0 : PeriodicFrom (leftDiagonal m) q N)
  (h1 : PeriodicFrom (leftDiagonal (m + 1)) q N) :
  PeriodicFrom (leftDiagonal (m + 2)) (2 * q) (N + 1) ∨
    ∃ j, N ≤ j ∧ leftDiagonal (m + 1) (j + 1) = true ∧ PeriodicFrom (leftDiagonal (m + 2)) q (j + 1)
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

### LeftDiagonalTransientFrontLaw.lean
**What this says.** A cell on a left diagonal differs from its shifted counterpart exactly when its driver cell on the shallower diagonal is white, given the two neighbors are settled.
**Why it is true.** The recurrence relation xor-ing three terms shows the difference propagates when the driver (the middle term in the or) is white.
**Where the work is.** The xor-or algebra: sixteen Bool cases, each decided by reflexivity.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_transient_front_law (k j M : ℕ) (hT : leftDiagonal (k + 2) j ≠ leftDiagonal (k + 2) (j + M))
  (h1 : leftDiagonal (k + 1) (j + 1) = leftDiagonal (k + 1) (j + 1 + M))
  (h0 : leftDiagonal k (j + 2) = leftDiagonal k (j + 2 + M)) :
  leftDiagonal (k + 2) (j + 1) ≠ leftDiagonal (k + 2) (j + 1 + M) ↔ leftDiagonal (k + 1) (j + 1) = false
```

### LeftDiagonalTransientFrontLawPow.lean
**What this says.** The transient cell moves forward iff its driver is false, when all periodicities are the power-of-two shifts proper to those diagonals.
**Why it is true.** Specializes leftDiagonal_transient_front_law to M = 2^(k+2), using the periodicFrom lemmas to extend the given periods.
**Where the work is.** None — one lemma application with hypotheses extended via periodicity.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_transient_front_law_pow (k j : ℕ)
  (hT : leftDiagonal (k + 2) j ≠ leftDiagonal (k + 2) (j + 2 ^ (k + 2)))
  (h1 : leftDiagonal (k + 1) (j + 1) = leftDiagonal (k + 1) (j + 1 + 2 ^ (k + 1)))
  (h0 : leftDiagonal k (j + 2) = leftDiagonal k (j + 2 + 2 ^ k)) :
  leftDiagonal (k + 2) (j + 1) ≠ leftDiagonal (k + 2) (j + 1 + 2 ^ (k + 2)) ↔ leftDiagonal (k + 1) (j + 1) = false
```

### LeftDiagonalTransientMaskLaw.lean
**What this says.** A settled cell on diagonal k+2 at j, under a transient driver on k+1, with the cell below settled, stays settled at j+1 iff its own cell is black.
**Why it is true.** The recurrence at k gives the XOR relationship; when the driver diagonal is transient and this diagonal is settled at j, the difference at j+1 comes solely from whether this diagonal's cell is black.
**Where the work is.** The same case-split on the recurrence values: with this diagonal settled at j and the driver transient, the four Bool values determine the outcome by calculation.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_transient_mask_law (k j M : ℕ) (hc : leftDiagonal (k + 2) j = leftDiagonal (k + 2) (j + M))
  (hT : leftDiagonal (k + 1) (j + 1) ≠ leftDiagonal (k + 1) (j + 1 + M))
  (h0 : leftDiagonal k (j + 2) = leftDiagonal k (j + 2 + M)) :
  leftDiagonal (k + 2) (j + 1) ≠ leftDiagonal (k + 2) (j + 1 + M) ↔ leftDiagonal (k + 2) j = false
```

### LeftDiagonalWhiteOfShift.lean
**What this says.** If diagonal m+1 is the shift of diagonal m from time N on, and diagonal m+1 turns black at time j+1, then diagonal m+2 is white forever from j+1 onward.
**Why it is true.** The recurrence for diagonal m+2 expresses it in terms of diagonals m and m+1; the shift hypothesis makes those two interchangeable at the needed indices, so both the recurrence base case and all steps collapse the diagonal m+2 to white.
**Where the work is.** The induction over the interval [j+1, ∞) using leftDiagonal_recurrence, with case splits on Bool generalization to close each branch via reflexivity.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_white_of_shift (m N j : ℕ) (hNj : N ≤ j)
  (hshift : ∀ i ≥ N, leftDiagonal (m + 1) (i + 1) = leftDiagonal m (i + 2))
  (hblack : leftDiagonal (m + 1) (j + 1) = true) (i : ℕ) : i ≥ j + 1 → leftDiagonal (m + 2) i = false
```

### LeftSolveEqColumn.lean
**What this says.** Rebuilding the picture leftward from columns 0 and 1
alone, one column per step, lands on the same picture the automaton itself
draws.
**Why it is true.** `sideways_inverse`, read at the row `evolveFrom X t` and
at the position the new column sits at, is exactly `leftSolve`'s own
recurrence, with `rule30 (evolveFrom X t)` renamed `evolveFrom X (t + 1)` by
`evolveFrom_succ`.
**Where the work is.** Two-step strong induction on `k`, carrying the goal
under `∀ t` since the `k + 2` case cites the `k + 1` hypothesis at both `t`
and `t + 1`; each case is one `sideways_inverse` instance plus a cast
rewrite lining its index up with the goal's.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftSolve_eq_column (X : Config) (k t : ℕ) : leftSolve (column X 0) (column X 1) k t = column X (-↑k) t
```

### MinimalPeriodDvd.lean
**What this says.** The least positive period of a sequence divides every one of its periods.
**Why it is true.** Periods are closed under the division algorithm: if `p = qm + r` with `m`
the least period, `m`-periodicity lets you strip off the `qm` part of `p`, so `r` is itself a
period, and `r < m` forces `r = 0` by minimality.
**Where the work is.** Showing the remainder `r = p % m` is a period at all: `periodicFrom_mul`
gives that `q * m` is a period, and one calc chain trades `p` for `r + q * m` and back.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.minimalPeriod_dvd (f : ℕ → Bool) (p : ℕ) (hp : 0 < p) (h : PeriodicFrom f p 0) : minimalPeriod f ∣ p
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

### PeriodicFromTransPeriod.lean
**What this says.** If a sequence is periodic with one period from some time, it remains periodic with any other of its periods from an earlier time too.

**Why it is true.** The two periods can be unified: walk forward using one period until reaching the later onset, then the other period applies retroactively.

**Where the work is.** The arithmetic: finding a common distance divisible by the first period that reaches the second onset.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.periodicFrom_trans_period (f : ℕ → Bool) (p q N M : ℕ) (hp : 0 < p) (hN : PeriodicFrom f p N)
  (hM : PeriodicFrom f q M) : PeriodicFrom f q N
```

### RightDiagonalAntiperiodicOfOddDriver.lean
**What this says.** If two neighbouring right diagonals both repeat every `L` steps and the
driver they feed the next one is black an odd number of times per block, that next diagonal
comes back inverted after `L` steps: `2L` is a period of it and `L` is not.
**Why it is true.** Each cell along a right diagonal is the previous cell flipped by the driver
(`rightDiagonal_recurrence`), so `L` steps flip it once per black driver cell.
**Where the work is.** Turning the parity, written as `Odd` of a sum, into a running XOR.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_antiperiodic_of_odd_driver (k L : ℕ) (hL0 : PeriodicFrom (rightDiagonal k) L 0)
  (hL1 : PeriodicFrom (rightDiagonal (k + 1)) L 0)
  (hodd :
    Odd (∑ j ∈ Finset.range L, if (rightDiagonal (k + 1) (j + 1) || rightDiagonal k (j + 2)) = true then 1 else 0)) :
  (∀ (j : ℕ), rightDiagonal (k + 2) (j + L) = !rightDiagonal (k + 2) j) ∧
    PeriodicFrom (rightDiagonal (k + 2)) (2 * L) 0 ∧ ¬PeriodicFrom (rightDiagonal (k + 2)) L 0
```

### RightDiagonalDriverFlipIffWhite.lean
**What this says.** When diagonal k has period q and diagonal k+1 is antiperiodic at that period, the OR of the k+1 driver and k-boundary differs from its q-shifted version exactly where diagonal k is white.

**Why it is true.** Periodicity and antiperiodicity transform the two ORs to (a || b) vs (!a || b) where a and b are the fixed cells; these differ exactly when b is false.

**Where the work is.** Pure Bool algebra: the four cases of a and b with cases and decide.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_driver_flip_iff_white (k q : ℕ) (hq : PeriodicFrom (rightDiagonal k) q 0)
  (hanti : ∀ (j : ℕ), rightDiagonal (k + 1) (j + q) = !rightDiagonal (k + 1) j) (j : ℕ) :
  (rightDiagonal (k + 1) (j + 1) || rightDiagonal k (j + 2)) ≠
      (rightDiagonal (k + 1) (j + q + 1) || rightDiagonal k (j + q + 2)) ↔
    rightDiagonal k (j + 2) = false
```

### RightDiagonalFirstFailure.lean
**What this says.** Slide row `p` left by `p` cells; call `m` the distance
from its right edge to the next black cell. The slid row agrees with the
seed's own row at every earlier time and disagrees for the first time at
time exactly `m` — not just eventually, but at that exact step.
**Why it is true.** The slid row and the seed's row agree everywhere right
of `-m` (white outside the cone, black at the shared right edge, white by
the choice of `m` in between) and differ at `-m`; a difference that starts
there moves right by exactly one cell per step (`rightmost_difference_moves_right`).
**Where the work is.** Showing the slid row agrees with the seed's row on
that whole window is three cases (negative, zero, positive) rewritten
through `evolveFrom_translate` and `evolveFrom_evolve`; the rest is reading
`rightmost_difference_moves_right` off at the right time and place.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_first_failure (p m : ℕ) (hm : 0 < m)
  (hwhite : ∀ (d : ℕ), 0 < d → d < m → evolve p (↑p - ↑d) = false) (hblack : evolve p (↑p - ↑m) = true) :
  (∀ t < m, evolve (t + p) ↑p = evolve t 0) ∧ evolve (m + p) ↑p ≠ evolve m 0
```

### RightDiagonalIsEventuallyPeriodic.lean
**What this says.** Every right diagonal repeats with period 2^k starting from the first cell.
**Why it is true.** The quantitative periodicity lemma rightDiagonal_periodicFrom_pow directly yields the existence of a period.
**Where the work is.** None; unfolding IsEventuallyPeriodic and providing the witnesses.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_isEventuallyPeriodic (k : ℕ) : IsEventuallyPeriodic (rightDiagonal k)
```

### RightDiagonalNotConstant.lean
**What this says.** Every right diagonal past the edge takes both colours somewhere; only the edge itself (`rightDiagonal 0`, always black) is constant.
**Why it is true.** A constant diagonal forces its driver in `rightDiagonal_recurrence` to be white past index 2, and periodicity (`rightDiagonal_periodicFrom_pow`) then makes the diagonal two steps shallower white everywhere -- which strong induction, bottoming out at `evolve_right_edge`, rules out.
**Where the work is.** Turning "white from index 2 on" into "white everywhere" by walking any index forward two periods.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_not_constant (k : ℕ) (hk : 1 ≤ k) :
  (∃ j, rightDiagonal k j = true) ∧ ∃ j, rightDiagonal k j = false
```

### RightDiagonalPeriodUnbounded.lean
**What this says.** No single repeat length works for every diagonal running
down-left from the picture's right edge: whatever length you pick, some
diagonal deep enough in does not repeat at it.

**Why it is true.** Take the row at time `p` and slide it left by `p` cells.
It matches the seed's own first row everywhere to the right of the nearest
black cell, and differs there; a rightmost difference travels right one cell
per step (`rightmost_difference_moves_right`), so it arrives at the centre
after exactly that many steps and the diagonal at that depth is caught out.

**Where the work is.** Finding the nearest black cell at all — the left edge
of row `p` is always black (`evolve_left_edge`), which bounds the search and
makes `Nat.find` legitimate.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_period_unbounded (p : ℕ) (hp : 0 < p) : ∃ k, ¬PeriodicFrom (rightDiagonal k) p 0
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

### RightDiagonalPeriodicFromStepOfEvenDriver.lean
**What this says.** If two neighbouring right diagonals both repeat every `L` steps and the
driver they feed the next one is black an even number of times per block, that next diagonal
repeats every `L` steps too -- no doubling.
**Why it is true.** Each cell along the diagonal is the previous cell XOR'd with the driver
(`rightDiagonal_recurrence`), so `L` steps XOR in the driver's whole window; an even number of
`true`s in that window cancels out, leaving the cell unchanged one period later.
**Where the work is.** The window of `L` driver values starting at any `n` has the same parity as
the one starting at `0`, because the driver itself repeats with period `L`: sliding the window by
one drops a cell and picks up its repeat of the same value, so the total is unchanged.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_periodicFrom_step_of_even_driver (k L : ℕ) (hL0 : PeriodicFrom (rightDiagonal k) L 0)
  (hL1 : PeriodicFrom (rightDiagonal (k + 1)) L 0)
  (heven :
    Even (∑ j ∈ Finset.range L, if (rightDiagonal (k + 1) (j + 1) || rightDiagonal k (j + 2)) = true then 1 else 0)) :
  PeriodicFrom (rightDiagonal (k + 2)) L 0
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

### RightmostDifferenceMovesRight.lean
**What this says.** If two rows agree everywhere right of position `i` and
differ at `i`, then after `t` steps they differ at `i + t` and agree
everywhere right of `i + t`: the point of disagreement moves right at
exactly speed 1.
**Why it is true.** Induction on `t`. The new disagreement at `i + t + 1` is
`rule30_ne_of_left_ne` fed by the old disagreement at `i + t` as its left
neighbour; the centre and right neighbour of that call, and every cell
right of `i + t + 1`, land right of `i + t`, where the induction hypothesis
already gives agreement.
**Where the work is.** Bookkeeping the shift `i + t + 1` against `i + t`
across a `Nat`-to-`ℤ` cast at each step; the automaton content is one call
to the served lemma.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightmost_difference_moves_right (c d : Config) (i : ℤ) (t : ℕ) (hagree : ∀ (j : ℤ), i < j → c j = d j)
  (hdiff : c i ≠ d i) :
  evolveFrom c t (i + ↑t) ≠ evolveFrom d t (i + ↑t) ∧ ∀ (j : ℤ), i + ↑t < j → evolveFrom c t j = evolveFrom d t j
```

### RowCellEqEvolve.lean
**What this says.** Packing a row of the rule 30 picture into the bits of a single
number gives exactly the same colours as growing the picture cell by cell.
**Why it is true.** One step of rule 30 is `left XOR (centre OR right)`, and shifting a
number up a bit or two is exactly what "look one or two cells to the side" means.
**Where the work is.** The two ends, where the row grows by a cell each step: a bit that
runs off the number and a cell that runs out of the cone have to be the same cell.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowCell_eq_evolve (t : ℕ) (x : ℤ) : rowCell t x = evolve t x
```

### RowNatAgreeForward.lean
**What this says.** Agreement between two rows' low `n` bits is never lost: if rows `T`
and `T+p` agree there, then rows `t` and `t+p` agree there for every later `t`.
**Why it is true.** `rowNat_mod_eq_iterate` reads a truncated row as `(stepMod n)^[t]`
applied to a fixed start; iterating one fixed function keeps two equal points equal.
**Where the work is.** Nowhere new: an induction on `t` above `T`, each step applying
`stepMod n` to both sides of the previous step's equality.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowNat_agree_forward (n T p t : ℕ) (hTt : T ≤ t) (h : rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) :
  rowNat t % 2 ^ n = rowNat (t + p) % 2 ^ n
```

### RowNatModEqIterate.lean
**What this says.** The rows of the picture, kept to their lowest `n` bits, are exactly
the sequence you get by repeatedly applying one fixed bit-twiddle to the number 1.
**Why it is true.** Row `t+1` is a fixed function of row `t`, and that function commutes
with truncating to `n` bits, so truncated rows are the orbit of `1` under the truncated
function.
**Where the work is.** Showing truncation commutes with the twiddle: read off bit `i` of
the output in terms of bits `i`, `i-1`, `i-2` of the input, then check both sides of the
commuting equation read the same bits when `i < n`.

**Checked type** (refreshed by the captain during the 2026-09-09 `stepMod` retrofit,
which changed this statement; the signature below is what `#check` printed against
`Rule30.Statements` after the retrofit built clean, not a harness verification run):
```lean
Statements.rowNat_mod_eq_iterate (n t : ℕ) : rowNat t % 2 ^ n = (stepMod n)^[t] (1 % 2 ^ n)
```

### RowNatReturnSuccIff.lean
**What this says.** Say row `T` and row `T + p`, read as binary numbers, already agree on
their low `n + 1` bits. Their successor rows agree on the low `n + 2` bits exactly when
either bit `n` of row `T` is set, or the two rows already agreed that far out.
**Why it is true.** Rule 30 packed into a number masks bit `n + 1` with bit `n`: if bit `n`
is black the new bit `n + 1` is forced regardless of the old one, and if it is white the new
bit is the xor of two bits both rows already agreed on.
**Where the work is.** Bit `n + 1` of the successor is a fixed Boolean expression in four
bits of the two rows; `cases ... <;> decide` over all sixteen settles it once the low bits'
agreement (`h`) is rewritten in.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowNat_return_succ_iff (n T p : ℕ) (h : rowNat T % 2 ^ (n + 1) = rowNat (T + p) % 2 ^ (n + 1)) :
  rowNat (T + 1) % 2 ^ (n + 2) = rowNat (T + p + 1) % 2 ^ (n + 2) ↔
    (rowNat T).testBit n = true ∨ rowNat T % 2 ^ (n + 2) = rowNat (T + p) % 2 ^ (n + 2)
```

### RowNatReturnSuccTwo.lean
**What this says.** Say rows `T` and `T + p`, as binary numbers, agree on their low
`n + 1` bits, with bits `n` and `n + 1` of row `T` black and bit `n + 1` of row `T + p`
black too. Then the very next rows agree two bits further out, on their low `n + 3` bits.
**Why it is true.** Two black bits in a row force the bit two places up in the next row to
be white regardless of anything else, and that happens on both rows, so the extra bit of
agreement is not a coincidence of the data but a forced zero on each side.
**Where the work is.** Showing that forced-zero fact: unfold one step of the row map at
that one bit and let the two black hypotheses collapse the expression on each side.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowNat_return_succ_two (n T p : ℕ) (h : rowNat T % 2 ^ (n + 1) = rowNat (T + p) % 2 ^ (n + 1))
  (hb : (rowNat T).testBit n = true) (hc : (rowNat T).testBit (n + 1) = true)
  (hd : (rowNat (T + p)).testBit (n + 1) = true) : rowNat (T + 1) % 2 ^ (n + 3) = rowNat (T + p + 1) % 2 ^ (n + 3)
```

### RowNatTestBitZero.lean
**What this says.** The lowest bit of every row is set; read as a binary number, every row of the pattern is odd.

**Why it is true.** The left edge is always black, and the left edge is bit 0 of the row by definition.

**Where the work is.** None; it is composition of two closed lemmas.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rowNat_testBit_zero (t : ℕ) : (rowNat t).testBit 0 = true
```

### Rule30LeftLocalLaw.lean
**What this says.** With agreement at i-2 and i-1 but a difference at i, the rule 30 outputs at i-1 differ if and only if the cell at i-1 is white.
**Why it is true.** The OR of c(i-1) and the right cell c i decides whether the third argument to rule30_eq changes when c and d swap at position i. When c(i-1) is true, the OR is always true; when false, it takes the right cell's value.
**Where the work is.** Applying rule30_eq at position i-1 to both rows, and using that c (i-1) || c i differs from c (i-1) || d i exactly when c(i-1) is false (given that c i ≠ d i).

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rule30_left_local_law (c d : Config) (i : ℤ) (h2 : c (i - 2) = d (i - 2)) (h1 : c (i - 1) = d (i - 1))
  (h0 : c i ≠ d i) : rule30 c (i - 1) ≠ rule30 d (i - 1) ↔ c (i - 1) = false
```

### Rule30LeftPermutive.lean
**What this says.** Rule 30 is left-permutive: changing only the left neighbour while keeping the centre and right fixed changes the output.
**Why it is true.** The rule depends on all three inputs in a way that makes the left neighbour distinguishable from the other two.
**Where the work is.** Unfolding the definition of LeftPermutive and applying the one-step lemma rule30_ne_of_left_ne to the window facts.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rule30_leftPermutive : LeftPermutive rule30 1
```

### Rule30NeOfLeftNe.lean
**What this says.** Changing only the left neighbour while keeping the centre and right fixed changes the output of one rule 30 step.
**Why it is true.** The rule depends on all three inputs: xor-ing two of them is a function of all three, so fixing two and changing the third changes the output.
**Where the work is.** Unfolding rule 30's definition on both rows and case-splitting on three Bool values.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rule30_ne_of_left_ne (c d : Config) (i : ℤ) (hl : c (i - 1) ≠ d (i - 1)) (hc : c i = d i)
  (hr : c (i + 1) = d (i + 1)) : rule30 c i ≠ rule30 d i
```

### Rule30RunBoundary.lean
**What this says.** A cell turns black next step exactly when it sits at a run
boundary — one of three local edge patterns in the current row.
**Why it is true.** Rule 30's definition as XOR of left-neighbor with (center OR
right-neighbor) reduces to these three cases by Bool case analysis.
**Where the work is.** Unpacking the XOR equivalence into run-boundary form; the
eight possible inputs make sixteen one-bit checks.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rule30_run_boundary (c : Config) (i : ℤ) :
  rule30 c i = true ↔
    c i = true ∧ c (i - 1) = false ∨
      c i = false ∧ c (i - 1) = true ∧ c (i + 1) = false ∨ c i = false ∧ c (i + 1) = true ∧ c (i - 1) = false
```

### Rule30Translate.lean
**What this says.** One step of Rule 30 commutes with a spatial translation: applying the rule to a shifted configuration and then reading at one position gives the same result as applying the rule first and reading at a shifted position.

**Why it is true.** The rule's definition depends only on three consecutive cell values in order, with no reference to the origin. Shifting the configuration left or right by *s* shifts the inputs to the rule by the same amount, and shifting the output position by *s* compensates.

**Where the work is.** None — unfold `rule30_eq` to expose the three-cell dependence, then two `ring` rewrites align the index arithmetic.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rule30_translate (c : Config) (s i : ℤ) : rule30 (fun x => c (x + s)) i = rule30 c (i + s)
```

### SidewaysInverse.lean
**What this says.** For any configuration, the left cell of any position equals the rule 30 update xor (the two right neighbors' or).
**Why it is true.** `rule30_eq` gives the forward direction; xor is self-inverse, so rearranging it gives the backward view.
**Where the work is.** Rewrite with rule30_eq and case-split on three booleans; reflexivity closes all eight cases.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.sideways_inverse (c : Config) (i : ℤ) : c (i - 1) = (rule30 c i ^^ (c i || c (i + 1)))
```

### StepModIterateTwoMul.lean
**What this says.** Doubling a row and then running rule 30's row map t times, truncated to n+1 bits, gives the same answer as running the map t times on the un-doubled row truncated to n bits, then doubling.
**Why it is true.** `step_two_mul` already says one step commutes with doubling one bit wider; doing the same swap inside each of the t steps of the iteration keeps it true the whole way down.
**Where the work is.** Lining up one step of the iteration (`Function.iterate_succ_apply`, both sides) with `step_two_mul` and the mod-doubling identity, then handing the induction hypothesis the resulting half-width state.

**Checked type** (refreshed by the captain during the 2026-09-09 `stepMod` retrofit,
which changed this statement; the signature below is what `#check` printed against
`Rule30.Statements` after the retrofit built clean, not a harness verification run):
```lean
Statements.stepMod_iterate_two_mul (n t s : ℕ) : (stepMod (n + 1))^[t] (2 * s) = 2 * (stepMod n)^[t] s
```

### StepModPreperiodLeOfLe11.lean
**What this says.** For every width up to 12 bits and every starting number below that
width, four extra steps of the truncated packed-row map from step `2k` land back where
it was — checked for every start, not merely the seed's.
**Why it is true.** It is a finite computation: at each of these small widths the map is
a function on a finite set, so its whole orbit structure can be decided outright.
**Where the work is.** Nowhere in Lean — the kernel decides the statement directly; the
`set_option` lines only raise its recursion and heartbeat limits enough to let it finish.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.stepMod_preperiod_le_of_le_11 (k : ℕ) :
  k ≤ 11 → ∀ x < 2 ^ (k + 1), (stepMod (k + 1))^[2 * k + 4] x = (stepMod (k + 1))^[2 * k] x
```

### StepModPreperiodOfOdd.lean
**What this says.** If a preperiod bound B works for every odd starting row below 2^n, it works for every starting row below 2^n, odd or even.
**Why it is true.** An even row is twice a row one bit narrower, and `stepMod_iterate_two_mul` says the width-(n+1) orbit of a doubled start is just twice the width-n orbit -- so an even start's periodicity comes straight from this same fact one level down, bottoming out at the fixed point 0.
**Where the work is.** None of the steps is hard alone; the care is inducting on n rather than x, so the even case recurses into this theorem one level narrower instead of citing H.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.stepMod_preperiod_of_odd (B : ℕ → ℕ) (hmono : ∀ (n : ℕ), B n ≤ B (n + 1))
  (H : ∀ (n x : ℕ), x < 2 ^ n → x % 2 = 1 → ∃ p > 0, ∀ t ≥ B n, (stepMod n)^[t + p] x = (stepMod n)^[t] x) (n x : ℕ) :
  x < 2 ^ n → ∃ p > 0, ∀ t ≥ B n, (stepMod n)^[t + p] x = (stepMod n)^[t] x
```

### StepModPreperiodOfReturn.lean
**What this says.** If the orbit of x returns to its time-N value after p steps, then it repeats with period p from time N onwards.
**Why it is true.** Iteration is deterministic; if position N repeats after p steps, so does every later position.
**Where the work is.** Induction on the time offset past N.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.stepMod_preperiod_of_return (n N p x : ℕ) (h : (stepMod n)^[N + p] x = (stepMod n)^[N] x) (t : ℕ) :
  t ≥ N → (stepMod n)^[t + p] x = (stepMod n)^[t] x
```

### StepTwoMul.lean
**What this says.** Rule 30's row map commutes with doubling: the step function applied to 2s equals 2 times the step function applied to s, for all natural numbers.
**Why it is true.** Doubling a row is a bit shift by one position, and the step function distributes over bit shifts via the XOR and OR operations.
**Where the work is.** The bit-shift distribution lemmas for XOR and OR; the rest is arithmetic.

**Checked type** (refreshed by the captain during the 2026-09-09 `stepMod` retrofit,
which changed this statement; the signature below is what `#check` printed against
`Rule30.Statements` after the retrofit built clean, not a harness verification run):
```lean
Statements.step_two_mul (s : ℕ) : rowStep (2 * s) = 2 * rowStep s
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

### WindowCountHalf.lean
**What this says.** Of all the ways to colour a row of `2t + 1` cells, exactly half grow a black
cell at the centre after `t` steps, and half grow a white one.
**Why it is true.** Flipping only the leftmost cell of the window always flips the centre cell
`t` steps later (`evolveFrom_leftPermutive`), so that flip pairs off the black-growing windows
with the white-growing ones.
**Where the work is.** Nothing deep: the flip is its own inverse, so it is a bijection, and the
rest is counting. The fiddly part is the index arithmetic that says the flipped position is the
one place inside the window where the two rows disagree.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.window_count_half (t : ℕ) : blackWindowCount t = 2 ^ (2 * t)
```

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

**A captain rule for every statement, seeded or proposed (2026-09-07):**
state it in `ℕ` where it can be stated in `ℕ`. An absolute value over
casts is almost always two `ℕ` inequalities; a count is a natural number
and an excess can be two bounds instead of one `|·|`. On this board the
statements that mix `ℕ`, `ℤ` and `|·|` have cost a ladder rung apiece for
two-line facts (`centerColumnCount_sandwich`, `centerColumn_excess_interpolate`),
and the same facts in `ℕ` close on the first rung. A seeder proposing a
cast-heavy statement should say why the `ℕ` form does not exist.

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

37. **Kopra's right-half recurrence theorems.** For any configuration
    that is white far to the left and not identically white, write `R t`
    for the right half of row `t`, the one-sided sequence `i ↦ evolve t i`
    for `i ≥ 0` (Kopra's `frac`, a sequence, not a real number; the real
    is only his motivating analogy with `frac((p/q)^i)`). Then (a) `R t = R 0`
    for only finitely many `t`, and (b) the sequence `t ↦ R t` has
    infinitely many limit points in the space of one-sided sequences.
    Kopra, arXiv:2202.13809, Theorems 4.5 and 4.7; both rest on Theorem 3.5
    (item 18) plus Lemmas 4.2–4.4 and the Morse–Hedlund theorem. *Proved*;
    real math, above item 18 in cost. Found by Cairn 2026-09-07 checking
    literature coverage; not on the DAG, not previously here.

38. **The two half-lines and the sideways solve (definitions).** Each half
    of the picture is driven by column 0 alone: `evolveHalfLeft (c : ℕ → Bool)
    (w : List Bool) : ℕ → ℕ → Bool` is the cells `x ≤ -1` grown from a
    white start with finite left word `w` and boundary column `c`
    (`evolveHalfRight` symmetric), and `leftSolve (c d : ℕ → Bool) : ℕ → ℕ → Bool`
    is the sideways solve, `leftSolve c d 0 = c`, `leftSolve c d 1 = d`,
    `leftSolve c d (k+2) t = xor (leftSolve c d (k+1) (t+1)) (leftSolve c d (k+1) t || leftSolve c d k t)`.
    Agreement theorems: for any `X : Config`,
    `evolveHalfLeft (column X 0) (left word of X) t k = column X (-(k+1)) t`
    (M, induction on `t` with `evolve_eq_false_of_outside_cone`'s argument
    for the white start) and `leftSolve (column X 0) (column X 1) k t = column X (-k) t`
    (S, induction on `k` from `sideways_inverse`). *Folklore*; definitions
    plus two nodes. Sextant, second attack of 2026-09-07, C1–C2; checked by
    Sextant to 200,000 rows and by Rowan independently to 6,000, and the
    list model against `rowCell` in the kernel. Seed first: 39–41 need it.
39. **The cone constraint splits by the centre's colour.** For any `X` with
    `c = column X 0`, `L = column X (-1)`, `R = column X 1`: at every black
    time `c (t+1) = !L t` (column 1 absent), and at every white time
    `R t = xor (c (t+1)) (L t)`. *Proved*: one rewrite each from
    `sideways_inverse` at `i = 0`; two S nodes. Its content, with 38: the
    black-time half of the residual is a condition on column 0 and the
    left half-line alone, so a proof through the left may discard column 1.
    Sextant C2; Rowan checked on the seed to 6,000 rows, Sextant to
    200,000, kernel to depth 40 (`explorer/scratch_blacktime.lean`).
40. **Column 0 and the right half are free coordinates.**
    `∀ b Y, ∃! X : Config, (∀ k : ℕ, X (k+1) = Y k) ∧ ∀ t, column X 0 t = b t`.
    Finite form: for every `t` and every word `c : Fin (t+1) → Bool`,
    exactly `2^t` of the `2^(2t+1)` windows have that column word to depth
    `t`. *Proved* in print for the count (Wolfram 1986 §4: "an equal number
    of initial configurations"); uniqueness with the right half fixed is
    `rightmost_difference_moves_right`, existence is induction on `k` via
    `leftSolve`. Rowan checked the count exhaustively for `t ≤ 8`, Sextant
    `t ≤ 10`. Consequence worth stating: the seed is rigid from the right
    (a white right half plus column 0 pins everything) and loose from the
    left (many windows white on `x ≤ -1` share its column to any finite
    depth, `explorer/whiteleft.mjs`). Size M with 38; two S after. Sextant C1.
41. **Finite exclusions for number-like configurations.** No configuration
    white on `x ≤ -3` has a column 0 periodic from time 0 with period `≤ 5`
    through row 40:
    `∀ X : Config, (∀ i ≤ -3, X i = false) → ∀ p ≤ 5, 0 < p → ¬ ∀ t ≤ 40, column X 0 (t+p) = column X 0 t`.
    *Computed*, kernel-accepted by `decide` over a list half-line model in
    11 s (`explorer/scratch_blacktime.lean`, part 3); a node once 38's
    agreement theorem ties the model to `column`. The first statement here
    about every configuration white far to the left rather than the seed;
    companion to crystal 19. Supply, not insight. Sextant C4.

Deliberately not listed: Sextant's "left half-line conjecture" (every
eventually periodic, not eventually white boundary fails the black-time
test for every finite left word). It implies the wall and Kopra's width-1
problem for all of `N(2)`; its sweep statistics to period 240 are those
of a fair coin, so it carries no evidence of a mechanism. It is the wall
in another coat, and would sit beside it, not under it.

42. **No two pairs of adjacent left diagonals ever eventually agree.**
    `∀ k d N, 0 < d → ∃ j ≥ N, leftDiagonal k j ≠ leftDiagonal (k + d) j ∨ leftDiagonal (k + 1) j ≠ leftDiagonal (k + d + 1) j`.
    In the picture: the settled region read along two adjacent diagonals
    never coincides with itself moved `d` diagonals inward. *Proved*, in
    the kernel: `explorer/scratch_leftdiagonal_unbounded.lean`, accepted by
    `lake env lean` on 2026-09-07 with axioms `propext, Classical.choice,
    Quot.sound`, written by a review session from Sextant's route. The
    route: agreement of a pair walks outward to diagonals 0 and 1 by the
    backward recurrence, two indices per step; those are black
    (`evolve_left_edge`, `evolve_left_second_diagonal`), so diagonals `d`
    and `d + 1` are eventually black, which forces `d - 1` and `d - 2`
    eventually white, and two white neighbours force the next outward
    white, down to the edge. Cites `leftDiagonal_recurrence`. Size M as a
    node; the friction is index normalisation, not mathematics. Single
    diagonals *do* repeat (item 43's orbit finds 39,362 repeats below
    200,000); only pairs never do. Sextant, third attack of 2026-09-07, C1.
43. **The eventual periods of the left diagonals are unbounded.**
    `∀ a, ∃ k, ∀ N, ¬ PeriodicFrom (leftDiagonal k) (2 ^ a) N`. Equivalently
    the period doubles infinitely often, and there are infinitely many
    eventually-white left diagonals. *Proved*, in the kernel, same file and
    date: from 42 by pigeonhole on the pair of residue words read at an
    onset that is a multiple of `2^a` (`Finite.exists_ne_map_eq_of_infinite`).
    Size L as a node for the phase alignment. **Not found in print**: NKS
    p. 871 lists the doublings at 3, 8, 29, 400, 87867 and "2,107,985,255
    or more" as observations with the upper bound `2^n`; Rowland 2006
    proves the power-of-two periods and the doubling criterion (a white
    stripe next to an odd-parity block), not that it fires forever; Kopra
    and Jen have no diagonal statement. Checked against the held texts by
    Sextant and by a web search on 2026-09-07. The first statement on this
    board that may be new. Elementary once seen; sits beside the walls
    `leftDiagonal_onset_le` and `leftDiagonal_period_le` as a lower bound,
    under nothing. Sextant C2.
44. **The settled configuration.** Let `settledWord k : ℤ → Bool` be the
    periodic extension of the tail of `leftDiagonal k` that
    `leftDiagonal_periodicFrom_pow` guarantees, in absolute phase, and
    `Σ (x) = settledWord x (-x)` for `x ≥ 0`, white for `x < 0`. Claim:
    `evolveFrom Σ` is the settled picture (`settledWord (t + x) (-x)` on
    `x ≥ -t`), and the seed's picture agrees with it on every settled cell,
    so the seed's picture is `evolveFrom Σ xor E` with `E` a damage pattern
    supported on the transient band. *Computed*: 0 mismatches on 2,003,001
    cells to 1,000 steps (`explorer/settledpicture.mjs`). Route: the
    recurrence holds on settled words for every index, and the recurrence
    is the rule in diagonal coordinates. Its centre column `s` is Sextant's
    proposed next topic: nobody has looked at it. Sextant C4, with C3 (the
    settled region of every configuration white far to the left is the
    seed's up to a shift chosen at the branch points, Rowland §6 with
    phase) as the reason a periodic boundary is invisible to it.

45. **The white branch of the left induction costs one index, not one period.**
    `leftDiagonal_step_onset_dichotomy (m q N) : PeriodicFrom (leftDiagonal m) q N → PeriodicFrom (leftDiagonal (m+1)) q N → PeriodicFrom (leftDiagonal (m+2)) (2*q) (N+1) ∨ ∃ j, N ≤ j ∧ leftDiagonal (m+1) (j+1) = true ∧ PeriodicFrom (leftDiagonal (m+2)) q (j+1)`.
    When the middle diagonal is white from `N + 1` on, the new diagonal is a
    running total of the one two further out (`bool_xor_driven_periodicFrom`
    applies verbatim), so its onset moves by one cell and its period at most
    doubles; when the middle diagonal is black somewhere, the onset jumps to
    that cell (`leftDiagonal_periodicFrom_step_of_black`). *Proved*: found by
    Cadence on opus in an abandoned research attempt on `leftDiagonal_onset_le`
    (run 20260907T201514Z), kept as `explorer/scratch_onset_dichotomy.lean`,
    which compiles alone. The seed check's verdict on it as a route to the
    wall is right: iterating it bounds the onset by the sum of the first-black
    gaps, and bounding that sum by `k` is what remains open. Worth a node when
    an onset argument wants it; sits under `leftDiagonal_onset_le`.

46. **The settled centre column, defined on the board.**
    `settledCenter (k : ℕ) : Bool := leftDiagonal k (2 ^ k)`, and
    `∀ k m, 1 ≤ m → leftDiagonal k (m * 2 ^ k) = settledCenter k`: read the
    seed's picture down any column whose distance from the origin is a
    multiple of `2^k` and past the onset, and the `k`-th cell below the
    edge is the same whichever column is read. It is the settled word of
    diagonal `k` at index 0, where the centre column reads the transient
    instead. *Proved* in effect: `leftDiagonal_periodicFrom_pow` gives an
    onset `≤ 2^k` with period `2^k`, and an induction on `m` walks from
    `2^k` to `m · 2^k`. Size S. Checked by Sextant to 240,000 and by Rowan
    independently for `k ≤ 11` on 47,967 cells
    (`explorer/rowan_leftside_check.mjs`); kernel to `k ≤ 10`
    (`explorer/scratch_settledcenter.lean`). `s(0..10) = 11011100110`,
    equal to the centre column for `k ≤ 17` and at the coin-flip rate
    after. Sextant, fourth attack of 2026-09-07, C1. Seed first: 47–49
    need it.
47. **The settled picture is the rule 30 evolution of the settled
    configuration**, stated in diagonal coordinates without a settled-word
    object: `Σ x = leftDiagonal x (2 ^ (x + 1) - x)` for `x ≥ 0`, white for
    `x < 0`, and `column Σ x t = leftDiagonal (t + x) (2 ^ (t + x + 1) - x)`
    for `x ≥ -t`; so `column Σ 0 = settledCenter`. Puts crystal 44's `Σ` on
    the board as a `Config`, to which the half-line tier and Kopra's width-2
    theorem apply. *Computed*: 300,040,001 cells, 0 mismatches to 10,000
    steps (`explorer/settledorbit.mjs`). Route: induction on `t` with
    `rule30_eq`, moving four `leftDiagonal` indices to a common frame by 46's
    periodicity and closing with `leftDiagonal_recurrence`; edge cases from
    the three edge diagonals. Size M–L, cast-heavy: seed it with `j : ℕ`
    diagonal indices, not through `column`. Sextant C2.
48. **The settled centre column is not eventually periodic.**
    `¬ IsEventuallyPeriodic settledCenter`: Kopra's width-1 problem for the
    configuration `Σ`, which has no transients at all and the lowest
    information content in the picture (fixed by the recurrence and about
    `log₂ log₂ K` branch bits to depth `K`). *Computed*: 240,001 terms, every
    lag to 120,000, longest agreeing tail 16 cells; balanced, factor counts
    those of a random sequence. *Open*; no route; the wall in another
    configuration. Sextant C3. **Read to `10^9` terms on 2026-09-08**
    (`explorer/settledcenter_billion.mjs`, 23 s, by a subagent with an
    independent cross-check): balanced (excess `+57,804` at `10^9`, `1.8σ`,
    sign flipping across `10^6..10^9`), every word of every length up to
    24 occurs, no lag below `2^19` agrees on more than 22 of the final
    `2^20` terms (a fair coin's maximum; a planted period 1237 was found),
    autocorrelation at lags `1..32` within `±2.3σ` of one half. No
    structure by any of the four measures at this depth; no eventually-white
    diagonal below `10^9`, consistent with crystal 55.
49. **There is only one left side of rule 30, up to a translation along the
    edge** — a computed finding against a published surmise. For every
    configuration white far to the left with its leftmost black cell at the
    origin that was tried (40 by Sextant to 200,000 rows; three by Rowan
    independently to 20,000, `explorer/rowan_leftside_check.mjs`), there is
    one integer `N` such that the configuration's picture equals the seed's
    translated by `(t, x) ↦ (t + N, x - N)` on everything left of a front at
    about `0.243 t` from the origin, which lies inside the transient band:
    the seam at `0.252 t`, every settled word, every seam position and a
    strip of transients are the seed's. Rowan's numbers: `N = 58, 16, 77`
    for a cell added at 7, a block at 100..199, and a random right half of
    width 3000; with that `N` the first disagreement sits at `0.764`–`0.769 t`
    from the left edge, and with any other `N` of the same residue mod 16
    at `0.751`–`0.754 t`, the seam. Rowland 2006 §5 (lines 913–946 of the
    extraction) conjectures the eventual periods are independent of the row,
    calls the conjecture "likely false", names column 53209 as the expected
    counterexample "if in fact they do occur for some initial conditions",
    and surmises infinitely many left sides. Sextant: all 40 configurations
    take the seed's word at 53208 and branch next at 58287, never at
    Rowland's 72577. **Mechanism and limit**, in Sextant's words and
    Rowan's reading: the damage front from any right-side change moves left
    at about `0.243` and the seam at `0.252`, so the settled region is
    protected by a margin of `0.009 t` that is an average, not a law; below
    row 2,100 the front ran ahead of the seam in five of seven cases, and a
    right half built to push its front 3.5 % faster for 70,000 rows would
    take Rowland's other branch. Crystals A3 says no speed below 1 is
    provable. So Rowland's surmise is not refuted; what is new is that the
    counterexample is never realised by an ordinary configuration, and the
    translation form with its integer `N`. *Computed*; no route to the
    full claim; the finite propagation piece is
    `bool_driven_periodicFrom_of_reset` with two orbits in place of a
    periodic driver, size S. Sextant C4; the fifth obstruction entry.

50. **The two masking laws, in diagonal coordinates.** Call a cell of
    diagonal `k` at index `j` *transient* when `leftDiagonal k j ≠ leftDiagonal k (j + 2^k)`.
    (a) If diagonal `k+2` is transient at `j` and its two drivers are settled
    at `j+1` and `j+2`, then it is transient at `j+1` exactly when the driver
    cell `leftDiagonal (k+1) (j+1)` is white: a transient passes straight down
    a diagonal through a white driver and is stopped by a black one. (b) If
    diagonal `k+2` is settled at `j` and its driver `k+1` is transient at
    `j+1` (the outer driver settled), then `k+2` stays settled at `j+1`
    exactly when its own cell at `j` is black. *Proved* in the kernel:
    `explorer/scratch_masking.lean` (`leftDiagonal_transient_front_law`,
    `leftDiagonal_transient_mask_law`, general shift `M`, axioms `propext,
    Quot.sound`; and the `2^k` form with `Classical.choice`), re-run by
    Rowan on 2026-09-08, exit 0. Each is `leftDiagonal_recurrence` at two
    indices and a sixteen-case `decide`. New phrasing of
    `rule30_left_local_law` (crystals A2) read on the pair (seed, settled
    picture); Wolfram 1986 §5 states (a) in words for the difference
    pattern of two random rows. Two S nodes under `leftDiagonal_onset_le`
    when an onset argument wants them. Sextant, fifth attack, C1.
51. **The seam is a damage front, and the onset wall is a speed bound on
    it.** Define `F t = min { x ∈ [-t, 0] : the cell (t, x) is transient }`
    (exists for `t ≥ 18`; the first transient cell is `(18, 0)`), the
    leftmost difference between the seed's picture and the settled picture
    (crystal 47). Then `leftDiagonal_onset_le` (every diagonal settled by
    index `k`) is equivalent to `∀ t ≥ 18, 2 · F t + t ≥ 1`: the front never
    runs faster than half a cell per row. Both directions are index
    arithmetic once `F` is defined (a `Nat.find` over a decidable bounded
    predicate). *Computed*: `min (2F + t) = 17` at `t = 19`; net speed
    `0.2497` over 160,000 rows; worst window `0.2568` at `t = 38,460`, the
    same event as the worst onset ratio `0.3455` at `k = 28,584`
    (`explorer/maskfront.mjs`). No route: it is a speed bound of the kind
    crystals A3 says is not available, and the sixth obstruction entry says
    why the reset-lemma induction cannot reach it. Size M as a
    reformulation node; worth seeding only to make the wall's honest form
    visible. Sextant C3.
52. **The front's visited diagonals obey the reset lemma with no slack; the
    skipped ones settle before their drivers.** The diagonal the front sits
    on never decreases; the front rides a diagonal at speed 1 along a white
    run of the neighbouring settled word and leaves at its next black cell,
    so the onset of every visited diagonal is the first black of `S_{k-1}`
    past the arrival index. *Computed*: 60,065 visited diagonals below
    110,000, 0 exceptions; 49,917 skipped, of which 47,343 settle strictly
    before their neighbour; the transient that ends a skipped diagonal is two
    transients meeting in one `||` in 68 % of cases and a black settled
    neighbour in 4 %. Provable half: a diagonal that settles before its
    neighbour is never on the front (contrapositive), size M after `F`.
    The answer to the fifth session's topic, and the reason crystal 45's
    reset front bounds the onset by `2k` while the truth is `0.34k`:
    the reset front cannot retreat and the real one does, on 26 % of rows,
    by up to 11 cells. Sextant C2 and C4; the sixth obstruction entry.

53. **The local dictionary of a white diagonal.** Four lemmas, each
    `leftDiagonal_recurrence` at one index: (A) if diagonal `m+1` reads as
    diagonal `m` shifted by one from index `N` on, then from the first black
    cell of `m+1` past `N` the diagonal `m+2` is white for good; (B) past the
    onset of an eventually-white diagonal `m+2`, its two drivers are shifts
    of each other; (C) after a white `m+1`, diagonal `m+3` is black for good
    from the first black cell of `m+2`; (D) after an eventually-black `m+3`,
    `D_{m+4}(i+1) = !D_{m+2}(i+2)`. In orbit terms a white at `m` means the
    pair `(S_{m-2}, S_{m-1})` is `(u, σu)`, and then `S_{m+2} = 1` and
    `S_{m+3} = ¬σ S_{m+1}` are forced. *Proved* in the kernel:
    `explorer/scratch_whitestep.lean`, axioms `propext, Quot.sound`, re-run
    by Rowan 2026-09-08, exit 0. (C) is Rowland 2006 lines 905–908 in words;
    the rest is new phrasing of the recurrence. Four S nodes under
    `leftDiagonal_period_le` as vocabulary; they do not move the wall.
    Sextant, sixth attack, C1.
54. **The gaps between doublings are at most `4^(2^n)`.** On the board:
    for every `a`, some diagonal `k ≤ 4^(2^a) + 1` is not eventually
    `2^a`-periodic, so the `(a+1)`-th doubling happens by diagonal
    `4^(2^a) + 1`. Sharpens crystal 43 (`leftDiagonal_period_unbounded`,
    infinitely many doublings, no rate) to a rate. Why: in the finite system
    of pairs of words of period dividing `L` (`4^L` pairs) the recurrence
    step has in-degree exactly one, so the segments from each white state
    `(0, w)` to the next white are disjoint and their lengths sum to at most
    `4^L`: the average gap is below `2^L` and no gap exceeds `4^L`.
    *Computed*, and essentially tight: the sum is `60,022` of `65,536` at
    `L = 8` and `4,293,693,734` of `4,294,967,296` at `L = 16`, mean
    `1.000 · 2^L` (`explorer/meansum.mjs`); the seed's own gaps
    `5, 21, 371, 52808, 1.42·10^9` sit within a factor 3 of `2^L`. Route for
    the board form: pigeonhole over `4^(2^a) + 2` consecutive diagonals read
    at onsets that are multiples of `2^a`, then
    `leftDiagonal_pair_never_eventually_shifted`; the same phase alignment
    as crystal 43's proof plus a `Fintype.card` bound. Size L, no hard step.
    Not in print (Wolfram 1986 §6 has the strip automaton and "periods
    increase very slowly"; Rowland the criterion). An upper bound; the wall
    needs a lower one. Sextant C2.
55. **The seed's orbit at period 32, computed from the recurrence alone**:
    the next eventually-white diagonal after `87866` is `1,420,878,968`, of
    complement type (period stays `32`); on one of its two continuations
    the next white is `2,107,985,254` with odd parity, so the period doubles
    to `64` at `2,107,985,255`, which is NKS p. 871's figure to the digit,
    reproduced here in 140 s with no picture beyond row 137,000; on the
    other continuation the next whites are `3,340,408,059` and
    `4,989,445,007`, both complement type. The match to nine digits
    identifies the continuation the seed takes and says NKS's "or more"
    was exact. *Computed* (`explorer/orbit32.mjs`; chain of trust in the
    document's C4: slow orbit against the picture at every branch point,
    bit-parallel step against the slow orbit on 112,133 words and against a
    bit-serial solve on 200,000 random pairs). What is not checked: the
    seed's own choice at `1,420,878,968`, inferred from the NKS match, not
    read from the picture, whose settling row is past `1.9 · 10^9`. Not a
    theorem and cannot be one on this board (`native_decide` is forbidden).
    New to the held sources: the eighth eventually-white diagonal and the
    exactness of NKS's sixth doubling. Consequence: `leftDiagonal_period_le`
    holds for every `k < 2^31 - 1` on the strength of the computation.
    Sextant C4. *For later, not now* (Dib, 2026-09-08): the same orbit run
    on past the sixth doubling, at period 64 a word in two machine words,
    would give the seventh doubling, which no source holds, at a cost of
    minutes; a low-value footnote until something needs the number.
56. **The period wall's honest form, and why no universal bound proves it.**
    `leftDiagonal_period_le ⟺ ∀ n, k_n ≥ 2^n - 1` where `k_n` is the
    `n`-th doubling (`3, 8, 29, 400, 87867, 2107985255`); with crystal 54,
    `k_{n+1} - k_n ≤ 4^(2^n)`. The residual is a *lower* bound on the gaps
    between whites in one specific orbit, and it cannot come from a bound
    over all words the orbit could hold: the word `1^(L-5) 00100`, of exact
    period `L`, returns to a white in exactly eight steps for every even
    `L` from `8` to `128` (`explorer/hitting.mjs`, `hitting2.mjs`; fails at
    every odd `L`, as a run-length mechanism does), and the minimum over all
    nonconstant words is `5` at every `L`. The universal cousin of the wall
    (from every antiperiodic word the next odd-parity white is `≥ L` away,
    C3) survives enumeration to `L = 32` exactly as a fair coin would
    (`hitting3.mjs`: the minima over `2, 16, 2048` shift classes are
    `88, 6343, 414989` against a geometric null of `128, 4096, 2·10^6`),
    and the orbit forgets the symmetry of a post-doubling word within seven
    steps (`orbitclass.mjs`). The seventh obstruction entry. Sextant C3, C5.

57. **The onset ladder's constants are the period staircase, and each rung
    has an exact expiry.** The constant `16` that closes
    `leftDiagonal_onset_le_of_le_5000` (via `rowNat (2k) ≡ rowNat (2k+16)
    mod 2^(k+1)`) is not a bound the wall forgot to ask for: it is `2^5`,
    and the `5` is the number of doublings by depth 5000. The least
    constant closing depth `k` is the staircase `1, 2, 4, 8, 16, 32`
    stepping at exactly the `k_n` of crystals 55 and 56 — `3, 8, 29, 400,
    87867, 2107985255`. So `16` works at `k = 87866` and fails at
    `k = 87867`, and `_of_le_87866` is the last theorem that can use it.
    Likewise the `4` in `stepMod_preperiod_le_of_le_11` is the same
    staircase read at `k ≤ 11`. *Computed* (Talus, theorist, 2026-09-09:
    staircase from the recurrence alone for `k = 0..600`, stepping at
    `3, 8, 29, 400` with nothing between; the step at `k = 400` confirmed
    in four `decide +kernel` calls; the fifth step checked directly at
    `k = 87866/87867`). **Cross-confirmed**: the staircase's step positions
    are NKS p. 871's first-appearance depths, already on file here as
    crystal 14 from an independent source, which is the check on this
    entry. **Consequence for a seeder:** the `_of_le_N` ladder is a
    finite resource with a known end, not a strategy. Do not propose a
    rung above `87866`; a rung at `87866` is the last honest one and is
    supply, not insight. The onset wall's honest form is therefore the
    same shape as crystal 56's: a claim about the `k_n`, not about a
    constant.
58. **The halving law: doubling a row is sliding the picture one cell in
    from the edge.** `T(2s) = 2T(s)` for the row map `T(r) = 4r ⊕ (2r ∨ r)`.
    *Proved on the board* (`step_two_mul`, `stepMod_iterate_two_mul`,
    2026-09-09) — the strongest status any entry here carries. Consequence,
    and the reason it was sought: the even states are a perfect copy of the
    whole system one bit narrower, so the growth of the truncated attractor
    from level `n` to `n+1` is exactly the number of **odd** periodic
    points, which are exactly rule 30's truncated left sides with a black
    left edge. The measured law "the attractor grows by the longest cycle
    length, no exception in 519 levels" reduces to a statement about that
    one set. Talus, theorist, 2026-09-09.
59. **The transient wall is in the wrong currency for every finite-automata
    field, and Robert's theorem is the one exception.** Every Černý-type,
    transformation-semigroup and random-mapping bound is polynomial in the
    **number of states**; ours is `2^n` and the wall needs a bound in `n`,
    so a cubic bound reads `2^(3n)` and no search fixes that. The one
    theorem in the right currency is **Robert's**: a Boolean network whose
    interaction graph is acyclic is nilpotent of class at most `n`
    (arXiv:1503.04688; as convergence, arXiv:2309.11363). Rule 30's row map
    is a Boolean network on `n` nodes whose graph is the path `i−2 → i`,
    `i−1 → i` **plus a self-loop at every `i`**, and the loop at `i` is
    present exactly when bit `i−1` is white and cut exactly when it is
    black — the project's reset lemma in the field's own vocabulary. Four
    seams, all real: the hypothesis is about the *global* graph and ours has
    all `n` loops; the standard weakening is by feedback vertex set and ours
    is all `n` nodes, so every FVS bound reads `2^n`; the loops are cut by
    the *state*, not by a letter, so there is no reset **word**; and
    Robert's conclusion is a unique fixed point where our attractor has
    cycles up to 16. Two facts worth keeping separately. **Rule 30 is rule
    150 plus one quadratic term:** `4r ⊕ (2r ∨ r) = (4r ⊕ 2r ⊕ r) ⊕ (2r ∧ r)`,
    and `F₂`-linear CA get transient `≤ n` for free, so that term is the
    entire difficulty. **Triangularity alone bounds nothing:** the odometer
    on bits `0…n−2` with the top bit held until it returns to zero is a
    perfectly good triangular map with tail exactly `2^(n−1)`, so rule 30's
    measured `1.56 n` is not forced by triangularity and the "rule 30 is
    hyper-contracting" reading is an artefact of comparing against a random
    map (`Θ(√N)`) rather than a random *triangular* one (`Θ(n)`). Gnomon,
    connector, 2026-09-09, `docs/connections/2026-09-09-synchronizing-automata-*.md`.
    The identity verified independently by the captain over `r < 10^5`.
60. **The row map is a T-function, and the T-function field's decision
    apparatus returns NO in two bits.** `T(r) = 4r ⊕ (2r ∨ r)` is a
    T-function: bit `i` of the output reads only bits `i, i−1, i−2`, so it
    descends to a map on `n`-bit words for every `n`. Dictionary, kernel
    checked (`explorer/vernier_scratch_tfunc.lean`): the centre column is
    `bit_t` of `T^t(1)`, and left diagonal `k` is `bit_k` of the orbit
    delayed by `k`. So the whole P1 residual restates with no automaton in
    it. The field's own tests then rule the map out of its theory: `T` is
    the identity mod 2 (so never a single cycle) and `T(1) ≡ T(3) mod 4`
    (so never invertible), and Anashin's Theorem 5.2 makes
    measure-preservation equivalent to bijectivity mod 2. *Verified
    independently by the captain*: identity mod 2 over `r < 2000`;
    `T(1) = 7`, `T(3) = 11`, both `≡ 3 mod 4`. Vernier, connector,
    2026-09-09. **Consequence for a seeder:** the dictionary is a real
    reformulation and worth stating; the single-cycle and invertibility
    machinery of that field is closed and must not be proposed.

61. **The onset wall with no automaton in it, and it holds from every
    start.** The strongest packed-row form of `leftDiagonal_onset_le` yet
    stated, and it mentions no cell, no seed and no damage front:

        for every `n >= 1` and every `r < 2^n`,
        `T^(2(n-1))(r) = T^(2(n-1) + 2^(n-1))(r)  (mod 2^n)`,
        where `T(r) = 4r XOR (2r OR r)`.

    This **implies the wall**, through the one definitional row of crystal 60
    (`leftDiagonal k j = bit_k (rowNat (j+k))`), and it asks for something
    stronger than the wall does: the wall needs the orbit of `1`, this needs
    every start. Exhaustive to `n = 31` — all `2^31` starts — worst tail `39`
    against an allowed `60`, worst ratio `1.381` at `n = 19`. **The naive
    induction is already known to fail**: `maxTail(n+1) <= maxTail(n) + 2` is
    FALSE at `n = 18 -> 19` (22 jumps to 26), so any proof must amortize over
    levels rather than pay per level. Obstruction 6 says the same of the
    front; this says it of a max over a finite set, where a retreat costs
    nothing — a genuinely different induction to attempt. Vernier, connector,
    2026-09-09, `docs/connections/2026-09-09-t-functions-2-adic-dynamics-*.md`.
    **Consequence for a seeder:** this is the wall in the vocabulary the board
    landed on 2026-09-10 (`rowNat_agree_forward`,
    `leftDiagonal_periodicFrom_of_rowNat_agree`, `rowNat_testBit_zero`), so it
    is the first statement that can be attacked with those three blocks in
    hand. Its per-level form is refuted; do not propose one.

62. **No reset-style induction closes the onset wall, at any constant, and
    here is the counterexample.** Define `C_1 = 0` and
    `C_(k+1) = 1 + min{ t >= C_k : bit_(k-1)(rowNat t) = 1 }`. Then
    `C_k <= 2k - 2` is **false**: `C_119 = 237 > 236`, the only violation
    below `k = 600`, exact (`gnomon_cascade.mjs`, `gnomon_check.mjs`). The
    falsification is not the point; the **reason** is. The control bit's
    black density is `0.4993`, so the cascade's slope is `2` by a law of
    large numbers, and the wall's own budget has slope `2` — the two are
    exactly critical. Every reset-style induction on this board is the same
    sum of mean-2 waiting times: obstruction 6's front at `2.00 k`, Talus's
    `2.674 n`, this cascade at `1.96 k`. So no argument of that family can
    work at any constant. **What the gap actually is:** the distance between
    the truth (`1.25 n`) and the cascade (`2 n`) is entirely the 596 of 599
    levels that settle *before* their driver's loop is cut. In the board's
    vocabulary that is obstruction 6's "skipped diagonals settle at indices
    below their drivers' onsets", measured and unexplained; in the
    Boolean-network vocabulary it is "a node whose loop is intact can still
    be forced, because its two drivers agree". Ships with an arithmetic
    correction: the board's `1.34 n` and `0.8229` are *tail + period*, and the
    wall needs the *preperiod*, which is `1.25 n` and `0.7396` (verified by
    reproducing `talus4_margin.mjs`: `71 + 8 = 79`, `79/96 = 0.8229`).
    Gnomon, connector, 2026-09-09,
    `docs/connections/2026-09-09-synchronizing-automata-*.md`.
    **Consequence for a seeder:** a proposal that prices the early settlings
    is wanted; a proposal that resets per level is refuted in advance.

63. **The local law and the settled region cannot prove the onset wall, and
    the margin is 0.001 the wrong way.** Let `G` be the never-retreating
    front driven by the settled words alone. Then `G(t) >= F(t)` whenever
    they start together — a two-case induction on `rule30_left_local_law`
    (crystal A2) plus "the cell left of the leftmost deviation is settled",
    checked at 0 violations over 129,000 rows (`rosetta_compare.mjs`). `G` is
    **optimal** among background-driven comparisons, so its speed is the
    exact ceiling of what those two ingredients can prove together — and that
    speed is `0.50106` over `2 x 10^8` rows across diagonals 87,868 to
    `10^8`, every one of twenty `10^7`-blocks in `0.50076-0.50133`, none
    below, `13.4` sigma against the script's own random-background control at
    `0.49999`. The wall needs `<= 0.5`. Stated for the board:
    **`leftDiagonal_onset_le` is not a consequence of
    `rule30_left_local_law` together with the settled region.** A proof must
    reach into the transient band. The honest caveat, which keeps this a
    sighting rather than a theorem: `0.50106` is a window average of a
    deterministic walk and nobody has proved it never falls below `1/2`
    later. Rosetta, connector, 2026-09-09,
    `docs/connections/2026-09-09-percolation-and-first-passage-*.md`.
    **Consequence for a seeder:** do not propose a monotone comparison
    against the settled background; that family is priced and it is short.

64. **The one measured route that lands on the right side of the wall, and
    it is a gap in a reachable set rather than a slow walker.** Three pieces,
    smallest first. (a) *The survival law*, already proved in the kernel on
    `[propext]` (`explorer/alidade_scratch_survival.lean`): for rows `c` and
    `d` agreeing at `i-1` and differing at `i`,
    `xor (rule30 c i) (rule30 d i) = xor (! d (i+1)) (d i && xor (c (i+1)) (d (i+1)))`,
    with the corollaries making the right side `! d (i+1)` when `d i` is
    white or when `c` and `d` agree at `i+1`. A seedable node of size S under
    `leftDiagonal_onset_le`; it generalises crystal 50(b), which is its
    agreeing half in diagonal coordinates. (b) *The forced retreat*: if
    `S(t, F(t)-1)` is black, `S(t, F(t))` white and `S(t, F(t)+1)` black then
    `F(t+1) > F(t)` — immediate from (a) plus A2, and measured on 132,152 of
    999,960 rows with no exception. (c) *The bound*: with `R(t0) = {F(t0)}`
    and `R(t+1)` the image of `R(t)` under `x -> {x-1}` when `S(t,x-1)` is
    white, `{x}` at triple `(1,0,1)`'s complement, `[x+1, inf)` at `(1,0,1)`
    and `[x, inf)` otherwise, `F(t) >= min R(t)` for every `t >= t0`. One-step
    induction from (a) and A2. **`min R(t)` runs at `0.45310`** over `4 x 10^6`
    rows from diagonal 100,000, every `5 x 10^5`-block in
    `[0.45265, 0.45412]`, confirmed by a second implementation carrying no ray
    at all. Compare crystal 63: that route's margin is `0.001` **against** the
    wall, this one's is `0.047` **for** it. The two honest gaps: nothing
    proves the DP stays below `1/2` on every stretch, and the DP escapes onto
    the eventually-white diagonals, so stretches must be chained — which is
    exactly the prerequisite in the next crystal. Alidade, connector,
    2026-09-09, `docs/connections/2026-09-09-computational-mechanics-*.md`.

65. **The prerequisite both front routes need, and it is two lines.** For
    every `t`, the settled word `S_(kappa(t)-1)` is not identically white,
    where `kappa(t) = t + F(t)`. From `leftDiagonal_periodicFrom_pow` and
    crystal A2: if it were, the front would advance for ever, and diagonal
    `kappa(t)` would then disagree with its own settled word at every later
    index. **What it buys:** the retreats at rows 2, 31, 501, 71,116, 77,910
    and 117,324 become *forced* rather than observed, and every
    monotone-comparison route closes globally rather than by measurement.
    Without it, crystal 64's bound covers only the stretch between two
    doublings and nothing tiles all of time. Verified to depth 130,000 rows
    and `kappa = 97,529` (`rosetta_visits.mjs`). Reached independently by
    Rosetta (Topic 2) and Alidade (Topic 2) on 2026-09-09.
    **Consequence for a seeder:** the smallest of the front lemmas, the most
    likely to close, and load-bearing for two separate routes. Seed it first.

66. **The OR-to-XOR filter: reject on sight, cost nothing.** Any proposed
    argument for either prize whose reasoning survives replacing `OR` with
    `XOR` is refuted immediately, because rule 150's centre column is
    constantly black and rule 90's is eventually white, while rule 30's is
    the prize. Rule 30 *is* rule 150 plus one quadratic term
    (`4r XOR (2r OR r) = (4r XOR 2r XOR r) XOR (2r AND r)`, crystal 59), so
    that term is the entire difficulty and any argument blind to it is blind
    to everything. Rule 150's centre column is identically black in two lines
    from `P_t = (1+u+u^2)^t` and Frobenius, measured `10^7/10^7`; its column 1
    obeys `a(2t) = 0`, `a(2t+1) = 1 XOR a(t)`, from which eventual
    periodicity fails by a three-line descent. **This rejects, without
    reading them:** surjectivity, left-permutivity, the light cone, the
    space-time SFT, entropy rank one, the sandwich lemma, expansiveness of
    the vertical direction, the whole Mauduit-Rivat family, the whole
    automatic-sequence family, and every rigidity argument. Rule 90 is the
    witness that carries *more* structure than rule 30 in every one of those
    respects. Rosetta and Parallax, connectors, 2026-09-08 and 2026-09-09.
    **Consequence for a seeder:** run this on your own proposal before
    writing it down. It is a ten-minute test and it has never been wrong.

67. **The ensemble filter, and the theorem that makes it citable.** Reject
    any proposed argument whose only use of the seed is that it is a point of
    a full-measure set. Three independent reasons, each checkable: the
    ensemble is *exactly* featureless and, by Kari-Taati plus the measured
    absence of conservation laws, it is the only ensemble available; the seed
    is computable, and being typical for every computable mixing dynamics is
    *equivalent* to Schnorr randomness, which no computable point has; and
    the eventually periodic sequences are dense in the support of every
    candidate Gibbs measure, so no support or positivity argument separates
    them from their complement. The theorem that converts this from a mood
    into a citation: **`centerColumn_trace_uniform`** — for every `n` and
    every word `v : Fin (n+1) -> Bool`, the number of windows
    `w : Fin (2n+1) -> Bool` whose column word is `v` is exactly `2^n`. Five
    lines: fix the cells at `1..n` as parameters, and the map from the cells
    at `0, -1, ..., -n` to the column word is triangular over `F_2` with unit
    diagonal by `evolveFrom_leftPermutive` at radius `t`. Kernel-checked at
    `n = 1, 2, 3` (`explorer/parallax3_scratch_trace.lean`), enumerated to
    word length 12 in two implementations. It generalises `window_count_half`,
    which is its marginal at one time, and should cost about the same.
    Parallax, connector, 2026-09-09,
    `docs/connections/2026-09-09-thermodynamic-formalism-*.md`.
    **Consequence for a seeder:** `centerColumn_trace_uniform` is worth
    seeding and is explicitly NOT a step towards the wall — its value is that
    every future measure-flavoured proposal can be answered with a node
    number instead of an argument.

68. **The nearest published result to Prize 1 cannot be pushed to it, and the
    missing case is one small statement.** Kopra's left-expansivity theorem is
    the closest thing in print; its dimensions `(h, d, w)` mean "a `w`-wide,
    `(h+d+1)`-tall block of the picture determines the cell to its left".
    Rule 30's spreading speed is exactly `1` (`evolve_left_edge`, closed), so
    Kopra's `s < 1/h` forces `h = 0`, and at `h = 0` left permutivity leaves
    only `w = 2`. The missing case is `w = 1`, and it appears to be true:

        for every `d` and every `X` with `column X 0 0 = false`, there is `Y`
        with `column Y 0 t = column X 0 t` for all `t <= d`, and
        `column Y (-1) 0 != column X (-1) 0`.

    Exhaustive for `d <= 14`; the sharper form — the determined column words
    are *exactly* those with a black anchor — exhaustive for `d <= 11`,
    `h <= 5`. The black half is already the board's `column_succ_of_black`;
    the content is the white half and the construction is the compensating
    configuration. Explicit witnesses at `d = 4`: the windows `011100000` and
    `000001000` over positions `-4..4` share column word `01100` and differ at
    position `-1`. Parallax, connector, 2026-09-09,
    `docs/connections/2026-09-09-gowers-uniformity-norms-*.md`.
    **Consequence for a seeder:** small, almost certainly true,
    provable-looking, and what it buys is a closed door with a sign on it —
    so the next session does not rediscover Kopra and ask why not `w = 1`.

69. **The bridge to the centre column is built, proved, and load-bearing for
    nothing — and the reason is one moved index.** `centerColumn t =
    bit_t (rowNat t)` is closed (`centerColumn_eq_rowNat_testBit`), sits under
    the P1 wall, and on 2026-09-10 had **zero dependents**. Meanwhile 18
    packed-row nodes exist and *every* consumer of them is under a
    left-diagonal wall. Measured, not guessed.

    **Why the machinery does not simply carry over, stated as the obstruction
    it is.** Both objects are bits of the same orbit, and that is exactly what
    makes the difference legible:

        leftDiagonal k j  =  bit_k (rowNat (j + k))     -- bit index FIXED at k
        centerColumn t    =  bit_t (rowNat t)           -- bit index MOVES with t

    A diagonal reads a **fixed** bit of a moving row, so every tool the board
    has built — `rowNat_agree_forward`, `rowStep_agree_forward`,
    `stepMod_preperiod_of_return`, agreement fronts, preperiod bounds — is a
    statement about the low `n` bits being eventually settled, and a fixed bit
    eventually sits inside that settled region. The centre column reads bit `t`
    at time `t`: it **outruns the front**. At time `t` it sits on diagonal `t`,
    whose onset has not been reached, so no bound of the form "the low `n` bits
    settle by time `f(n)`" touches it unless `f(n) < n`, and the measured
    settling is about `1.25 n`.

    So the packed row is the right vocabulary and the left-edge conclusions are
    not the wrong work — they are the same work aimed at the tractable index.
    **What P1 needs from this vocabulary is a statement about a diagonal read
    of the orbit**, and the board has none. That is the sharpest form of the P1
    residual in the language the board has actually built, and it is a better
    target than any restatement of the wall.

    Rowan, captain, 2026-09-10, from the dependency graph rather than from
    reading. **Consequence for a seeder:** a packed-row lemma stated about a
    fixed bit index is left-edge work however it is filed; a packed-row lemma
    that says anything about `bit_t (rowNat t)` — the diagonal read — is P1
    work. Prefer the second. Vocabulary-neutral lemmas about `rowStep`,
    `stepMod` and `PeriodicFrom` serve both and are always worth having.

70. **Move the wall to the right edge, where there are no transients.** The
    left side's index `0` sits *inside* a transient band, which is why every
    left-edge bound is about onsets and why the centre column escapes them all.
    The right side has no transients at all: `centerColumn t = rightDiagonal
    t 0`, and if `rightDiagonal t` is exactly periodic with a computable period
    then the centre column is being read at index `0` of an exactly periodic
    object. Portage's judgement, and it is a claim about position rather than
    about difficulty: *"a strictly better position than every existing
    obstruction, all of which are about the left side where index 0 is inside a
    transient."*

    The concrete request is `rightDiagonal_period_doubles_iff_odd_weight`: the
    minimal period of `rightDiagonal k` is `2L` when `g_k(j) = rightDiagonal
    (k-1) j || rightDiagonal (k-2) (j+1)` has odd weight over one period `L`,
    and `L` otherwise. It survives 4,000,000 terms at 40 depths with 0
    failures, so it is true or false for a reason no computation will find, and
    the proof if it exists is two lines: a running XOR of a period-`L` word
    closes after `L` steps iff the word has even weight, plus the observation
    that `g_k` has period `L`. The board already holds the odd branch
    (`rightDiagonal_antiperiodic_of_odd_driver`) and the even branch
    (`rightDiagonal_periodicFrom_step_of_even_driver`) as claims about *a*
    period; obstruction 7 is about *minimality*, which is what this needs.

    **The one thing to check first, because it would kill the topic:** whether
    the minimal period `P_k` is itself a wall. Nothing here bounds it below and
    `2^(0.41 k)` is a measurement. Portage, connector, 2026-09-08,
    `docs/connections/2026-09-08-profinite-dynamics-odometers-*.md`.
    **Consequence for a seeder:** this is the P1 direction that is not the left
    edge, and the board's right-diagonal region has six proved blocks and
    nothing recent.

71. **The board's first P3 direction, and it does not touch the broken prize
    statement.** `Rule30/Prize.lean`'s P3 is *vacuous rather than open* — its
    own text says so: `IsFaithfulCostModel` is opaque, so nobody can supply a
    model satisfying the hypothesis and nobody can attack it. Do not seed
    against `centerColumn_cost_at_least_linear`.

    What can be seeded is irreducibility as a *mathematical* property, where no
    machine model is needed. The claim:

        for every `t >= 3`, the polynomial normal form of `evolveFrom c t 0`
        in the variables `c(-t), ..., c(t)` over `F_2` has degree exactly
        `2t - 1`, and its unique monomial of that degree is the product of
        `c(x)` for `x` from `-t+2` to `t`.

    Measured at every `t` from 3 to 11 by bit-sliced evaluation plus Möbius
    transform, with rules 60, 90, 102 and 150 as controls returning degree 1.
    One half is already on the board — `rule30_leftPermutive` makes `c(-t)`
    appear linearly and only linearly — and the content is why `c(-t+1)` is
    also absent from the top monomial. Provable by induction on `t`.

    **Priced honestly, in the connector's own words: nothing towards Prize 1.**
    It is a statement about the family and the seed is one point of it. Its
    value is that it would be the board's first quantitative statement about
    *how* nonlinear rule 30 is, in a region that has never had a node. Parallax,
    connector, 2026-09-09,
    `docs/connections/2026-09-09-algebraic-and-automatic-christol-*.md`.
    **Consequence for a seeder:** P3 proposals go here, not at the cost model.
    Making P3 genuinely attackable needs a concrete uniform machine model with
    binary input encoding and step-counted cost, most plausibly on Mathlib's
    `Turing.TM0`/`TM1`; that is unbuilt, it is a captain-and-Dib decision, and
    `Prize.lean` says it needs expert review before anything built on it ships.

## The convergence of 2026-09-09, and the object no node states

Four sessions on 2026-09-09 — Talus twice (theorist), Gnomon and Vernier
(connectors) — reached the same object from four vocabularies, independently:

- Gnomon's levels whose self-loop is **never** cut, because their control
  diagonal is eventually white (`k = 3, 8, 29, 400`);
- Talus's steps of the onset-constant **staircase** (crystal 57);
- the doubling positions `k_n` of crystals 55 and 56;
- NKS p. 871's depths of **first appearance** of each period.

These are one set: the `k` at which left diagonal `k` is eventually white.
It is the residual of `leftDiagonal_onset_le`, of `leftDiagonal_period_le`,
of the attractor-growth law (crystal 58), and of Robert's missing hypothesis
(crystal 59). **No node on the board states it** — the closest are
`leftDiagonal_white_of_shift` and `leftDiagonal_step_period_dichotomy`,
which are local. That absence is the gap this tier exists to fill.

The captain's reading of what that licenses, and what it does not. Naming
the object does not make it tractable — crystal 56 already says the residual
is a *lower* bound on the gaps between whites in one specific orbit, and
that is exactly as open as it was. What it licenses is the conditional
form: Gnomon's own falsifiable test is *"between the settling of diagonal
`k−1` and its first black cell at or after that time, at most `C` rows
pass"*, which is **false as stated** — the measured maximum increment is 7
for `k < 600`, and the four exceptional levels have no black cell ever. So
the honest statement is the same claim with the eventually-white levels as
an explicit hypothesis rather than something a proof has to survive. A
conditional whose hypothesis is the open object is a normal node; the
unconditional version is the wall.

## How to read a check, 2026-09-09 (three instances in one evening)

Not candidate statements — a caution about the tools that produce them, put
here because this is the file a seeder reads before proposing, and every
instance below was a *sound* measurement read as an answer to a question it
was not measuring.

**The pattern.** A check is sound about its own subject and silent about the
thing its reader wants to know. Nothing is wrong with the number; the
denominator is supplied by the reader, and it is supplied wrongly.

- **A repetition count measured inheritance and was read as consensus.**
  Attempts `-2` through `-6` on `leftDiagonal_onset_le` look like five
  independent assaults, and a lemma appearing in three of them looks like
  three provers converging. They are not independent: the brief for each
  attempt **names the previous attempt's parked file** (`dispatch.gleam`,
  the `parked` field) and tells the worker to read it. The files are
  cumulative — `onset-3` to `onset-4` is 48 lines added to a 195-line file.
  The one lemma that scored `3x` was one authorship inherited twice, and the
  three copies were byte-identical *including the tactic script*.
  **The tell: three people who independently need a lemma write three
  different proofs of it. Identical text is evidence of copying.**
  (Fathom, correcting a rule Rowan had written into its brief.)
- **Elaboration measured provability and was read as fitness for purpose.**
  `windowSum_eq_of_periodicFrom` was stated at `PeriodicFrom c L 0`, was
  true, elaborated clean on the first try, and was axiom-clean — and did not
  serve one of the three files it was written for, which has a general onset
  `N`. A weaker statement typechecks perfectly, so no amount of elaboration
  can catch this. **The technique that does: re-prove what each consumer
  actually needs, taking the proposed public statement in as a hypothesis.**
  That converts "I intend not to reach for the private helper" into "I
  cannot". It caught the defect on the first run. (Fathom.)
- **A test count measured the bytes on disk at each moment and was read as
  "the suite".** 325 passed of an announced 607, from a run whose source was
  edited while it ran. The number was accurate; the diagnosis built to
  explain it ("the `Env` injection did not cover `prove-one`") was specific,
  plausible and invented. A clean run gives 607 of 607. (Keel, retracting.)

**And the habit that underwrites all three, which is cheaper than any of
them:** a check you have never seen fail is not yet a check. Exit `0` with no
output is indistinguishable from a command that did not run. Before believing
a success, break the thing on purpose and confirm the failure is real, at the
right line. Fathom did this before reporting nine axiom-clean theorems, and
it costs one edit and one re-run.

This is the same animal as the *well-formed and wrong* rule in `CLAUDE.md`,
one level up: that rule is about a value that is true and a conclusion that is
false, and these three are about the specific mechanism — an unstated
denominator — that keeps producing it here.

**The claim all three of these tempt you into, and it is false.** After the
first instance was caught, the proposed replacement was *duplication across
landed files*, on the premise that it is independent of the brief chain
because "no brief ever hands a worker a landed file". **That premise is
false and was never checked.** Measured against the corpus: **135 briefs
name `Rule30.Proofs.` modules**, with descriptions. The brief for
`rightDiagonal_antiperiodic_of_odd_driver-1` names the helper `blockXor`
eight times on one line; the brief for
`rightDiagonal_periodicFrom_step_of_even_driver-1` names it six times. Both
workers were told the helper's name before writing a line. And `rowStep`,
which three landed files "independently" chose, first appears in a theorist
session on 2026-09-07, is named in the brief for `rowNat_mod_eq_iterate-1`,
and reaches the other two through the cumulative onset chain
(`-3 → -4 → -5 → -6`) — one origin, copied forward, across two personas.

**So: the brief channel is a shared ancestor for everything a worker
writes.** Any measurement over worker output — names, proofs, repetition,
cross-file agreement — is correlated through it *by default*. "These were
independent" is a claim about the harness, and it has to be checked against
`runs/*/*/briefs/`, not assumed. There may be no independent measurement
available over this corpus at all. If so, the honest move is to treat
duplication as **friction worth fixing** and stop trying to license it as
**evidence of importance** — the fix is right either way, and arguably more
urgent if the cause is copying, since the brief channel will keep doing it.

A name-keyed scan has a second, smaller limit worth stating: it sees only
duplication that agreed on a name. `blockXor_shift` in one file and
`windowSum_shift` plus `windowSum_const` in another are one idea written
twice under different names with different proofs, and no such scan can see
it. That one was found by reading.

## Not credible or not verified

- arXiv:2207.13237 (Das, "Rule 30: Solving the Chaos") claims an analytical
  solution to P1; not peer reviewed, not on the prize bibliography, not read.
- "BHLM-Bas-Zeta Wolfram Project" (ResearchGate, 2025) claims an
  equidistribution theorem for the centre column; same.
- The rule30prize.org bibliography lists nothing accepted since 2019.
- NKS "period 64 at depth 2,107,985,255 or more": single source.
- Wolfram's definition of the 0.252 boundary is not stated anywhere found.

## Rowan's ranking, 2026-09-07 (superseded for P1 by the ranking below)

By value over cost: 3 (four preimages, the leftward solve) → 8 and 5 and 10
(trivial first nodes) → 11 (rows `2^n`) → 13 (Rowland's doubling criterion,
under a wall) → 16 (sandwich lemma for every rule) → 17 and 18 (Jen and
Kopra beyond the single cell) → 22 and 23 (fixed points, no period 2) → 25
and 26 (rings). Item 19 if kernel `decide` copes. Items 6 and 28 when a
prover has the topology set up. Not 27, not anything with "≈" in it.

## Rowan's ranking for the next tier, 2026-09-09 (P1)

Board state this ranking answers: 113 of 117 nodes proved, three walls that
must not be dispatched, and **one** dispatchable leaf — `leftDiagonal_onset_le`,
eleven attempts, abandoned tonight with two thirds of its budget unspent
because the prover had no idea left worth the money. The scheduler has
nothing to schedule. So this tier is not "more nodes"; it is the specific
question of whether the object of crystal 57–60 can be given a stateable
shape.

By value over cost:

1. **The eventually-white diagonal, as an object.** `leftDiagonal k` is
   eventually white — a definition and its two or three immediate lemmas.
   Nothing on the board names it and four independent routes end at it. Even
   the trivial consequences are worth having, because every later statement
   in this tier is phrased in it.
2. **Item 13, Rowland's period-doubling criterion.** Ranked under a wall on
   2026-09-07 and never seeded. It is a *published proof*, not a conjecture,
   and it is the theorem that connects item 1 to the doubling positions. If
   one thing from this tier lands, this is the one that should.
3. **Gnomon's conditional** (see the convergence section): the onset bound
   with the eventually-white levels as an explicit hypothesis. The
   unconditional form is the wall; the conditional form is an ordinary node.
   Propose it only with the hypothesis stated — the unconditional version is
   measured false.
4. **The `bdry` boundary walk**, from the parked file of attempt 11 on the
   onset wall (`runs/20260909T212551Z/leftDiagonal_onset_le-11/`). Sixteen
   kernel-clean theorems the build cannot see, and the fourth time an onset
   attempt has rebuilt that walk from scratch. This is harvest, not
   invention: read the file, seed the ones that are a machine rather than an
   internal lemma of one tactic script.
5. **The T-function dictionary** (crystal 60): centre column as `bit_t` of
   `T^t(1)`. A clean restatement of the P1 residual with no automaton in it,
   already kernel checked in `explorer/`.

**Not this tier, and why.** No further `_of_le_N` rung above `87866`
(crystal 57 gives its exact expiry). Nothing from the single-cycle or
invertibility machinery of the T-function field (crystal 60: closed). No
proposal that leans on triangularity to bound a transient (crystal 59: the
odometer witness has tail `2^(n-1)`). And nothing phrased as a bound in the
number of states — that is the currency error crystal 59 exists to record.



## What the connect sessions found (docs/connections/)
What the connect sessions found, each document's own "what to hand
on" section verbatim. The full document is at the path given, and
is several times longer than what is quoted here.

### Sighting: `centerColumn_other_isEventuallyPeriodic_of_center` from algebraic and expansive subdynamics of `Z^2` actions
`docs/connections/2026-09-08-algebraic-and-expansive-subdynamics-of-z-2-actions-boyle-lind-directional-expansiveness-kitchens-schmidt-ledrappier-type.md`

**Topic 1 (the one I would spend the session on). The linear no-go: make it a
standing test that every candidate lemma must pass.** The claim to falsify is the
one in 3.2:

> Rule 150 from a single black cell has a second eventually periodic column —
> some `x ≠ 0` and `p > 0` with `cell(t + p, x) = cell(t, x)` for all large `t`.

It depends on exactly one dictionary row: that rule 30's local rule is rule 150
plus the monomial `c·r`, which is arithmetic (`150 XOR 136 = 30`). The evidence
against it is that rule 150's centre column is *identically black* — provable in
two lines from `P_t = (1+u+u^2)^t` and Frobenius, and measured `10^7/10^7` — while
its column 1 obeys `a(2t) = 0`, `a(2t+1) = 1 XOR a(t)`, from which eventual
periodicity fails by a three-line descent (an odd period forces `a ≡ 1` on a tail,
contradicting `a(2t)=0`; an even period `2p'` makes `p'` a period too). Both
identities are checked with 0 failures on `2·10^6` rows, and the density `1/3`
they force is measured as `0.333334`. The depth that would settle it: none needed
in the negative direction — it is a proof — and `|x| ≤ 64` at `p ≤ 4096` over
20,000 rows in the positive direction. **What to do with it is the point.** It
gives the board a ten-minute falsifier for every proposed route to this wall: run
the same argument on rule 150. Surjectivity, left-permutivity, the light cone,
the space-time SFT, entropy rank one, the sandwich lemma, and expansiveness of the
vertical direction all survive that test and therefore cannot be the proof — and
rule 90, which has *more* structure than rule 30 in every one of those respects,
is the witness. The one thing to check first, because it would kill the topic:
whether some column of rule 150 or rule 90 beyond `|x| = 64` is eventually
periodic. For rule 150 that is implausible — the columns are dense, so the sparse
artefact that fooled my first script cannot hide there — but it is unproved.

**Topic 2. State the seam bound in the language that names it, and see whether the
name is load-bearing.** The claim, from 3.4's dictionary, is that these are the
same statement:

> `leftDiagonal_onset_le` (onset `≤ k` for every diagonal)
> `⟺` the seam never runs faster than half a cell per row
> `⟺` the left Lyapunov exponent of rule 30 at the seed satisfies `λ^- ≤ 1/2`.

The first two are obstruction 6's equivalence; the third is the field's name for
the same quantity, and the conversion between the diagonal parametrisation and
the picture parametrisation is exactly `α ↦ α/(1+α)`, which sends the measured
onset `0.336` to `0.2515` against a measured seam of `0.2497`. It depends on one
dictionary row: that the damage front the obstruction is about *is* `λ^-`. What
a theorist can add: whether anything in the Lyapunov-exponent literature bounds
`λ^-` above for a *specific* configuration rather than almost everywhere. My
reading says no — Shereshevsky's inequality and Bressaud–Tisseur's theorem both
bound the exponents *below* — and if that reading is right the honest outcome is
a new obstruction entry saying so, which is worth having, because three separate
board items (`leftDiagonal_onset_le`, obstruction 3's horizon, `crystals` A3) are
the same unproved bound wearing three names.

---

### Sighting: `centerColumn_other_isEventuallyPeriodic_of_center` from cocycles and coboundaries over an odometer
`docs/connections/2026-09-08-cocycles-and-coboundaries-over-an-odometer-anzai-skew-products-the-coboundary-equation-and-whether-the-transient-part-of.md`

**Topic 1 (the one I would spend the session on). Restate the right-diagonal
doubling criterion about the *common* period, where it is provable, instead of
the *minimal* period, where obstruction 7 says it is not.** The board has
`rightDiagonal_antiperiodic_of_odd_driver` (the odd branch, including
`¬ PeriodicFrom L 0`) and treats the even branch as hard. The even branch is
hard only as a claim about minimality. As a claim about a period it is three
lines: by `rightDiagonal_recurrence`, `R_(k+2)(j + L) = R_(k+2)(j) XOR Σ_(i=1..L)
g(j+i)`, and `g` has period `L` because the two diagonals feeding it do, so
that sum is the same for every `j` and equals the weight parity. Hence

> `rightDiagonal_periodicFrom_step_of_even_driver (k L : ℕ)`
> `(hL0 : PeriodicFrom (rightDiagonal k) L 0)`
> `(hL1 : PeriodicFrom (rightDiagonal (k+1)) L 0)`
> `(heven : Even ((Finset.range L).sum (fun j => if rightDiagonal (k+1) (j+1) || rightDiagonal k (j+2) then 1 else 0)))`
> `: PeriodicFrom (rightDiagonal (k+2)) L 0`

This signature elaborates as written: `explorer/portage_scratch_evendriver.lean`,
`lake env lean`, only the `sorry` warning. It is the exact mirror of the odd lemma, sharpening `rightDiagonal_periodicFrom_step`
from `2 * L` to `L`. With it, the common period `Q_k` of all diagonals to depth
`k` is a power of two that doubles exactly at the odd-weight levels and is
otherwise unchanged, and *that* is the object the tower actually runs on: it is
the orbit period of the right-edge automorphism at level `k` (dictionary row 10
of 3.1, measured to level 15 by two independent implementations that agree
exactly). The depth that would settle it: none — it is a proof, not a
measurement, and the supporting identities fail 0 times on 39 levels. The one
thing to check first, because it would make the topic pointless: whether the
board already wants `Q` and I have missed it; I searched `Rule30/Statements.lean`
and found only the `2 * q` version.

**Topic 2. The coboundary equation as the wall's weakest sufficient
condition.** Put `centerColumn_other_of_cohomologous_column` (3.2) on the
board — it is a few lines — and then ask a theorist to attack, or to record as
an obstruction, the unconditional companion: *is there any `x ≠ 0` and `j` for
which `t ↦ centerColumn t XOR evolve (t + j) x` is eventually periodic?* It
depends on exactly one dictionary row: that a difference of two fibres is the
natural cohomological object, where "a column repeats" is not. The depth that
would settle it in the negative direction is already run — 1,616 pairs, no
period `≤ 4096` surviving from `t = 20,000` to `60,000`, longest partial run 17
steps — so what a theorist can add is either an obstruction (a reason no
difference can be eventually periodic, which would be a real theorem and might
follow from Kopra's width-2 result) or the observation that the free companion
`centerColumn_other_of_rightDiagonal_period_bounded` (3.3) closes the
bounded-period branch and so licenses assuming the periods grow.

---

### Sighting: `centerColumn_other_isEventuallyPeriodic_of_center` from profinite dynamics
`docs/connections/2026-09-08-profinite-dynamics-odometers-binary-rooted-tree-automorphisms-and-the-in-degree-one-pair-map-on-period-l-settled-words.md`

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

### Sighting: `centerColumn_other_isEventuallyPeriodic_of_center` from the algebraic and automatic vantage
`docs/connections/2026-09-09-algebraic-and-automatic-christol-s-theorem-algebraicity-of-generating-functions-over-f-2-k-automatic-and-k-regular-seque.md`

**Topic 1 (the one I would spend the session on). The elimination ideal expires:
turn the measurement into a statement, and close the algebraic route.** The claim
to prove is the pair

> (a) For every `n`, every word in `F_2^(n+1)` is the centre-column prefix
> `c(0..n)` of some configuration that is white outside `[−n, n]`.
> (b) If `X` is white on `x ≤ −m−1` then `rule30 X` is white on `x ≤ −m−2`.

(b) is one line from `evolve_left_edge`. (a) is measured exhaustively for
`n ≤ 10` — `|A(n,m)|` saturates at `2^(n+1)` at exactly `m = n`, tables in
`explorer/parallax_ideal.mjs` §B — and its `m = 0` counts `3, 4, 6, 8, 10, 12,
15, 19, 24, 31` independently reproduce obstruction 3's `numberlikewords.mjs`.
Together they give the corollary that matters: **no nonzero polynomial over `F_2`
in `n+1` variables vanishes on `(c(N), …, c(N+n))` for every configuration white
far to the left, once `N ≥ n`.** The dictionary row it depends on is the single
line "elimination in a Boolean ring is projection of the variety", which is why
the computation is the elimination and no Gröbner basis needs to be computed.
What it would give: an obstruction entry that refutes, in advance, every proposal
phrased as a polynomial identity among consecutive centre-column bits — a class
that includes the two elimination orders the brief asked about, since §3.3 shows
those are `evolve` and `leftSolve` under other names. The depth that would settle
it: `n = 11, 12, 13` at `m = n` needs `2^(2n+1)` configurations, i.e. `2^27` at
`n = 13`, an hour of engine time; the proof of (a) is the real target and looks
like an explicit construction (choose the left cells to force each bit in turn),
which is exactly the shape of `window_count_half`.

**Topic 2. The algebraic degree law, as an ordinary theorem in the Prize 3
direction.** The claim to prove:

> For every `t ≥ 3` the polynomial normal form of `evolveFrom c t 0` in the
> variables `c(−t), …, c(t)` over `F_2` has degree exactly `2t − 1`, and its
> unique monomial of that degree is `∏_{x=−t+2}^{t} c(x)`.

Measured at every `t` from 3 to 11 by bit-sliced evaluation plus Möbius
transform, with rules 60, 90, 102 and 150 as controls returning degree 1
(`explorer/parallax_anf.mjs`). The dictionary row it depends on is that reduction
modulo the ideal in the downward order is forward substitution, which §3.3 proves
via Buchberger's first criterion. One half of the degree defect is already on the
board — `rule30_leftPermutive` makes `c(−t)` appear linearly and only linearly —
and the other half, why `c(−t+1)` is also absent from the top monomial, is the
content. **What it would give, stated so a captain can price it: nothing towards
Prize 1.** It is a statement about the family, the seed is one point of it, and
`3.4`'s seam says the family's degree is silent about that point. It is worth a
session only because it is small, almost certainly true, provable by induction on
`t`, and would be the board's first quantitative statement about *how* nonlinear
rule 30 is — a Prize 3 direction the board has never had a node in.

**What I would not spend a session on**, and the reason belongs here rather than
in section 4: proving the centre column non-automatic. It implies Prize 1 (§3.1),
so it is strictly harder than the wall, and every route in print to such a proof
is an asymptotic statement about density or subword complexity that is stronger
than what Prize 1 needs. The measurement is done and the floor is 130,553 states;
raising it is engine time, not a session.

---

### Sighting: the transient band as a defect gas, and the front as a domain wall
`docs/connections/2026-09-09-computational-mechanics-of-cellular-automata-regular-domains-domain-filters-and-defect-or-particle-dynamics-the-crutchfi.md`

**Topic 1 — the survival law, and the reachable-set bound below 1/2.** This is the
whole document.

*The claim to falsify, in three pieces, smallest first.*
(a) *The law.* For rows `c` (the picture) and `d` (the settled picture) with
`c (i-1) = d (i-1)` and `c i = ! d i`,
`xor (rule30 c i) (rule30 d i) = xor (! d (i+1)) (d i && xor (c (i+1)) (d (i+1)))`.
Already proved in the kernel, `explorer/alidade_scratch_survival.lean`, axioms
`[propext]`, together with the two corollaries that make the right-hand side
`! d (i+1)` when `d i = false` or when `c (i+1) = d (i+1)`. This is a seedable node
of size S sitting under `leftDiagonal_onset_le`, and it generalises crystal 50(b),
which is its `c (i+1) = d (i+1)` half in diagonal coordinates.
(b) *The forced retreat.* If `S(t, F(t)−1)` is black, `S(t, F(t))` white and
`S(t, F(t)+1)` black, then `F(t+1) > F(t)`. Immediate from (a) plus crystals A2.
Measured on 132,152 of 999,960 rows with no exception.
(c) *The bound.* Let `R(t₀) = {F(t₀)}` and let `R(t+1)` be the image of `R(t)`
under `x ↦ {x−1}` when `S(t,x−1)` is white, `{x}` when the triple is `(1,0,0)`,
`[x+1,∞)` when it is `(1,0,1)` and `[x,∞)` otherwise. Then `F(t) ≥ min R(t)` for
every `t ≥ t₀`. That is a one-step induction from (a) and A2 and is the statement
worth a session; the data structure in `explorer/alidade_dp2.mjs` is only the
observation that `R(t)` is always a finite set plus an upward ray.

*The dictionary row it depends on:* "the domain-forced retreat is a decay channel
whose rate the domain computes" — and, more sharply, the row that says the
mechanism is a *gap in the reachable set*, not a slow walker.

*The depth that would settle it.* `min R(t)` runs at 0.45310 over 4·10^6 rows on
the channel-free stretch from diagonal 100,000, with every 5·10^5-block in
`[0.45265, 0.45412]`; the same code gives 0.45149 on pseudo-random bits, 0.45029
on phase-randomised settled words and 0.45292 on the evolution of a random ring.
The real front is never left of `min R(t)` over 300,000 rows with the engine
running alongside, and a second implementation of the reachable set that carries
no ray at all agrees with the first on every one of 200,000 rows
(`explorer/alidade_dpcheck.mjs`, 0.45532 over that shorter stretch). What is *not* settled and is the honest gap: nothing proves the
DP's speed stays below 1/2 on every stretch, and the DP escapes onto the
eventually-white diagonals exactly as Rosetta's `G` does, so the stretches must be
chained through Rosetta's Topic 2. Both gaps are the same shape as the ones the
previous sighting left, with one difference that decides whether this is worth a
session: its margin was 0.001 and against it, this one is 0.047 and for it.

**Topic 2 — the prerequisite, which is already on the previous sighting's list.**
*The front never rides a white channel:* for every `t`, the settled word
`S_{κ(t)−1}` is not identically white. Two lines from `leftDiagonal_periodicFrom_pow`
and A2. It was worth a session before; it is now load-bearing, because without it
Topic 1's bound covers only the stretch between two doublings and there is no
argument that tiles all of time.

**Not handed over.** §3.2's domain hierarchy and §3.3's row-language measurement
are descriptions, not routes: they say why the CM programme cannot be run on rule
30 and why the project's own diagonal construction was the only way in. A captain
who wants an obstruction out of this document should take §3.3 — *no finite-state
transducer reading one row can separate the settled region from the transient
band* — with the count from `explorer/alidade_wordcount.mjs` beside it. And a
correction that belongs in the record rather than in an obstruction: the previous
sighting's claim that 0.50106 is "the exact supremum of what the local law and the
settled background together permit" is not right. It is the supremum of what the
*advance half* of the local law permits. The other half is §3.1 and it is worth
0.047.

---

### Sighting — the centre column from the analytic number theory of digital sequences
`docs/connections/2026-09-09-gowers-uniformity-norms-and-the-analytic-number-theory-of-digital-sequences-mauduit-rivat-s-method-for-sums-of-digital-f.md`

**One topic, and it is bounded.**

> **Rule 30 is not left expansive at width 1, at any depth.** Falsify:
> *for every `d : ℕ` and every `X : Config` with `column X 0 0 = false`, there
> is `Y : Config` with `column Y 0 t = column X 0 t` for all `t ≤ d` and
> `column Y (-1) 0 ≠ column X (-1) 0`.*
>
> **The dictionary row it depends on:** Kopra's left expansivity with
> dimensions `(h, d, w)` ↔ "a `w`-wide, `(h+d+1)`-tall block of the picture
> determines the cell to its left"; rule 30's spreading speed is exactly `1`
> (`evolve_left_edge`), so Kopra's `s < 1/h` forces `h = 0`, and at `h = 0`
> only `w = 2` is available from left permutivity. This statement is the
> missing `w = 1` case.
>
> **What settles it:** exhaustive enumeration says it is true for `d ≤ 14`
> (`explorer/parallax2_expansive.mjs`), with the sharper form — the determined
> column words are *exactly* those with a black anchor, at every depth and
> every height — exhaustive for `d ≤ 11`, `h ≤ 5`
> (`explorer/parallax2_expansive2.mjs`). The black half is already the board's
> `column_succ_of_black`; the content is the white half, and the construction
> to find is the compensating configuration. The witnesses at small `d` are
> explicit and suggestive: at `d = 4`, the windows `011100000` and `000001000`
> (positions `−4..4`) share the column word `01100` and differ at position `−1`.

I would spend a theorist's session on this and on nothing else in this
document. It is small, it is almost certainly true, it is provable-looking, and
what it buys is a *closed door with a sign on it*: the nearest published result
to Prize 1 cannot be pushed to Prize 1, and the reason is a speed that a closed
node already pins at exactly 1. That is worth having written down before the
next connector or theorist spends a session rediscovering Kopra's paper and
asking why not `w = 1`.

**And one thing to hand a captain rather than a theorist**, because it is a
filter, not a lemma: §3.1's exclusion. *Any proposed argument for either prize
whose reasoning survives replacing `OR` with `XOR` is refuted on sight*, because
rule 150's centre column is constantly `1` and rule 90's is eventually `0`. This
costs nothing to apply and it rejects the entire Mauduit–Rivat family, the
entire automatic-sequence family, and every rigidity argument, without reading
them.

---

### Sighting: the left damage front as a growth process in a fixed environment
`docs/connections/2026-09-09-percolation-and-first-passage-growth-of-the-damage-front-eden-clusters-the-kpz-class-interacting-particle-systems-and-wh.md`

**Topic 1 — the comparison walker, and the 0.001 that separates it from the wall.**
The claim to falsify: *`G(t) ≤ F(t)` for all `t ≥ t₀` whenever `G(t₀) = F(t₀)`,
where `G` is the never-retreating front driven by the settled words alone.* It is a
two-case induction on `rule30_left_local_law` (crystals A2) plus "the cell left of
the leftmost deviation is settled", and it is small enough to state in Lean against
`settledConfig`; checked against the engine at 0 violations over 129,000 rows
(`explorer/rosetta_compare.mjs`). The dictionary row it depends on is the one
mapping *stall* to *wait* rather than to *die*. What it settles: `λ₋ ≤ speed(G)`,
and `speed(G)` is a finite computation on the settled words — 0.50106 over 2·10^8
rows across diagonals 87,868 to 10^8, 0.5044 over the shorter stretch. That is the
first bound below 1 on a left damage front in this project, and crystals A3 does
not forbid it, because A3 is about arbitrary pairs and this is about one.

**And the same induction is the reason not to spend another session on any
argument that drops the retreats.** `G` is not one comparison among many: it is
optimal, so 0.50106 is the exact ceiling of what the local law and the background
can prove together, and the wall needs 0.5. The depth that would settle whether the
gap is real rather than a slowly decaying transient: run
`explorer/rosetta_greedy2.mjs` to 10^10 diagonals and see whether the block speeds
stay above 1/2 (they are 0.50076–0.50133 over twenty 10^7-step blocks so far, none
below, and the excess is 13.4σ against the script's own random-background control,
which returns 0.49999).

**Topic 2 — the front never rides a white channel.** The claim to prove:
*for every `t`, the settled word `S_{κ(t)−1}` is not identically white*, where
`κ(t) = t + F(t)`. Two lines, from `leftDiagonal_periodicFrom_pow` and A2: if it
were, the front would advance for ever, and diagonal `κ(t)` would then disagree
with its own settled word at every later index. The dictionary row it depends on is
"eventually-white diagonal = infinite open oriented path". What it gives: the
retreats at rows 2 (which clears the channels at `κ = 3` and `κ = 8` in one jump),
31, 501, 71,116, 77,910 and 117,324 become forced rather than observed, and every
monotone-comparison route is closed globally rather than by measurement. Verified to depth 130,000 rows and `κ = 97,529` in
`explorer/rosetta_visits.mjs`, with the skipping jumps listed. This is the smaller
of the two and the more likely to close.

**If a captain wants an obstruction out of this document, it is the corollary of
Topic 1, and I am not the one who may write it there.** Stated in the project's
vocabulary: *`leftDiagonal_onset_le` is not a consequence of
`rule30_left_local_law` together with the settled region.* Any proof built from
those two ingredients bounds the front by the optimal background-driven trajectory
`G`, whose speed is 0.50106 on the 2·10^8 rows measured — above the 1/2 the wall
needs, with every 10^7-block above it and a random-background control at 0.49999.
The caveat that keeps this a sighting rather than a theorem is that 0.50106 is a
window average of a deterministic walk, and nobody has proved it does not fall
below 1/2 later; the honest form is "on every stretch measured so far". A proof of
the wall must reach into the transient band, and §3.5 says exactly which number in
the band it must reach for.

Not handed over, and deliberately: §3.3's run-length bound, because on its own it
proves 0.969 and its useful form needs a logarithmic bound on the settled periods,
which is a harder open problem than the one it would serve.

---

### Can rule 30's centre column be re-presented so that its rule mentions repetition?
`docs/connections/2026-09-09-self-referential-and-repetition-defined-sequences-kolakoski-ehrenfeucht-mycielski-and-whether-rule-30-s-centre-column-ca.md`

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

### Sighting — `centerColumn_other_isEventuallyPeriodic_of_center` from synchronizing automata, Černý-type bounds, and the transients of finite functional graphs
`docs/connections/2026-09-09-synchronizing-automata-cerny-type-bounds-and-the-transients-of-finite-functional-graphs-where-tails-are-the-object-rathe.md`

**Topic A — the cascade is exactly critical, and here is the term a working
argument must contain (from §3.3).** Falsify:

> `C_k ≤ 2k − 2` for every `k`, where `C_1 = 0` and
> `C_{k+1} = 1 + min{ t ≥ C_k : bit_{k−1}(rowNat t) = 1 }`.

It is **false**: `C_119 = 237 > 236`, and that is the only violation below
`k = 600` (`gnomon_cascade.mjs`, `gnomon_check.mjs`, exact).
The dictionary row it depends on is the local-interaction-graph row of §3.2 —
bit `k`'s self-dependence is present exactly when bit `k−1` is white — which is
the reset lemma the board already has, restated. What makes this worth a session
is not the falsification but the *reason*: the control bit's black density is
`0.4993`, so the cascade's slope is `2` by a law of large numbers and the
budget's slope is `2`. Every reset-style induction on this board — obstruction
6's front at `2.00 k`, Talus's `2.674 n`, this one at `1.96 k` — is the same sum
of mean-2 waiting times, and the wall's budget is that sum's mean. **The
conclusion to hand over is that no argument of this family can work at any
constant, and that the gap between `1.25 n` (truth) and `2 n` (cascade) is
entirely the 596-of-599 levels that settle before their driver's loop is cut.**
The theorist's job is to find a statement that prices those early settlings. In
the project's vocabulary that is obstruction 6's "skipped diagonals settle at
indices below their drivers' onsets", which is measured and unexplained; in the
Boolean-network vocabulary it is "a node whose loop is intact can still be
forced, because its two drivers agree". The second phrasing is new here and is
the one I would put in front of someone.

Ship with it the arithmetic correction of §3.3: the board's `1.34 n` and
`0.8229` are `tail + period`, and the wall needs the preperiod, which is `1.25 n`
and `0.7396`. Verified by reproducing `talus4_margin.mjs`'s own number:
`71 + 8 = 79`, `79/96 = 0.8229`.

**Topic B — retire "rule 30's collapse is anomalously fast" (from §3.1).**
Falsify:

> the depth of the functional graph of a uniformly random 1-Lipschitz map
> `ℤ/2ⁿ → ℤ/2ⁿ` is `Θ(n)`, and rule 30's depth is not below it.

Measured: mean depth `19.67` and max-over-60-draws `29` at `n = 20` for the
random T-function; rule 30's is `26`. The dictionary row it depends on is the
first one — that `T mod 2ⁿ` is a triangular map, which is definitional. This is
a smaller session than A, and I would only spend it because a wrong null is
currently carried on the board as a positive finding ("`T` is not remotely
random, it is hyper-contracting"; "no probabilistic null is available for
anything about `T`'s graph"), and a wrong null in this project's history has
been expensive. The cheap version is one script and an hour.

I would spend the session on **A**. It is the one item here that closes a family
of attempts on a wall the board is actually holding, and it does so with an
explicit counterexample and a mechanism rather than a measurement.

I would spend **no** session on the synchronizing-automata literature. Its
theorems are polynomial in `|Q| = 2ⁿ` and the wall needs `2 log₂|Q|`; that is not
a hard search, it is a category error, and §4.1 is the whole answer to the
brief's first two questions.

---

### Sighting — `centerColumn_other_isEventuallyPeriodic_of_center` from T-functions and 2-adic dynamics
`docs/connections/2026-09-09-t-functions-2-adic-dynamics-and-the-arithmetic-of-maps-on-n-bit-words-klimov-and-shamir-s-theory-of-t-functions-single-c.md`

**Topic A — the all-starts rho-tail bound (from §3.1).** Falsify:

> For every `n ≥ 1` and every `r < 2ⁿ`,
> `T^{2(n−1)}(r) ≡ T^{2(n−1) + 2ⁿ⁻¹}(r) (mod 2ⁿ)`, where
> `T(r) = 4r ⊕ (2r ∨ r)`.

This implies `leftDiagonal_onset_le` and mentions no automaton, no seed, no
damage front. The dictionary row it depends on is the single line
`leftDiagonal k j = bit_k(rowNat (j+k))`, which is definitional and
kernel-checked. Depth reached here: exhaustive to `n = 31` (`2³¹` starts), worst
tail `39` against an allowed `60`, worst ratio `1.381` at `n = 19`. The one thing
already known to fail is the naive induction: `maxTail(n+1) ≤ maxTail(n) + 2` is
**false** at `n = 18 → 19` (22 → 26), so the argument must be amortized over
levels. Obstruction 6 says the same thing about the front; this says it about a
max over a finite set, where a retreat costs nothing, and that is a genuinely
different shape of induction to try.

**Topic B — the doubling positions as first-appearance moduli (from §3.2).**
Falsify:

> `|attractor(n)| − |attractor(n−1)|` equals the maximum cycle length of
> `T mod 2ⁿ`, for every `n ≥ 5`; and the least `n` with a cycle of length `2^d`
> is `a(d)+1` for the doubling sequence `a = 3, 8, 29, 400, 87867, …`, at which
> `n` that cycle is unique.

Exact and exception-free for `5 ≤ n ≤ 31`, with the `n = 30` case predicted
before it was computed and confirmed (`1×4 2×5 4×21 8×1`, attractor 106). The
dictionary row it depends on is "eventual period of left diagonal `k` = cycle
length of the orbit of 1 mod `2^{k+1}`", verified by the least-return-period
table (`1,2,4,8,16` at `k = 0–2, 3–7, 8–28, 29–399, 400–5000`) and kernel-checked
at the `k = 29` transition. What would settle it cheaply: enumerate the attractor
at `n = 40` from the settled-word orbit map rather than the state space, and
check `186`.

I would spend the session on **A**. It is the one statement in this document
that, if proved, closes a wall the board is actually holding, and it is now
stated in a form with no cellular automaton in it and a computable falsifier at
every `n`. **B** is a change of venue and a good one, but it settles a different
wall and its uniqueness half rests on three data points.

I would spend no session on the T-function *criteria* (§3.4): they are vacuous
for `T` and I have kernel-checked why, so that is a saving rather than a lead.

---

### The census of aperiodicity proofs in print
`docs/connections/2026-09-09-the-census-of-aperiodicity-proofs-in-print-reverse-mathematics-of-pi-0-2-statements-about-explicit-computable-sequences.md`

**UNFINISHED — this document's conclusions section was never written. The sections above it in the document may still be worth reading, but nothing here was handed on.**

### Sighting — `centerColumn_other_isEventuallyPeriodic_of_center` from the thermodynamic formalism of one-dimensional lattice systems
`docs/connections/2026-09-09-thermodynamic-formalism-of-one-dimensional-lattice-systems-transfer-operators-gibbs-measures-g-measures-bowen-s-conditio.md`

**Topic 1 — a small, provable theorem that retires a family of routes.**

> **`centerColumn_trace_uniform`.** For every `n`, and every word
> `v : Fin (n+1) → Bool`, the number of windows `w : Fin (2n+1) → Bool` with
> `(fun i : Fin (n+1) => evolveFrom (ofWindow w) i 0) = v` is exactly `2^n`.
>
> **The dictionary row it depends on:** "the ensemble's centre column" ↔ "the
> trace measure of the uniform Bernoulli measure", and the claim is that this
> measure is *exactly* Bernoulli(1/2), not approximately.
>
> **What settles it:** the five-line proof in §3.1 — fix the `n` cells at
> positions `1 … n` as parameters, and the map from the cells at
> `0, −1, …, −n` to the column word is triangular over `F₂` with unit diagonal by
> `evolveFrom_leftPermutive` at radius `t`. Kernel-checked at `n = 1, 2, 3`
> (`explorer/parallax3_scratch_trace.lean`, accepted by `lake env lean`),
> enumerated exhaustively to word length 12 in two independent implementations.
> It generalises `window_count_half`, which is its marginal at one time, and
> should cost about the same.

I want to be explicit about what this is not: it is **not** a step towards the
wall, and no decomposition of it is. Its value is that it converts the
meta-obstruction from a mood into a citable theorem — after it, "the ensemble
knows nothing about rule 30's column" is a proved statement of the project's own,
in the project's own vocabulary, and every future proposal that reaches for a
measure can be answered with a node number instead of an argument.

**Topic 2 — for a captain rather than a theorist, because it is a filter.**

> **The ensemble filter.** Reject any proposed argument whose only use of the
> seed is that it is a point of a full-measure set. Three independent reasons,
> each checkable: (i) the ensemble is *exactly* featureless (§3.1) and, by
> Kari–Taati plus the measured absence of conservation laws, it is the only
> ensemble available; (ii) the seed is computable, and being typical for every
> computable mixing dynamics is *equivalent* to Schnorr randomness, which no
> computable point has (§3.2); (iii) the eventually periodic sequences are dense
> in the support of every candidate Gibbs measure, so no support or positivity
> argument can separate them from their complement (§3.1, seam iii).

If a theorist's session is to be spent on only one thing here, spend it on Topic
1. Topic 2 costs nothing and pays every time.

---

## What the theorists' attacks left standing (docs/attacks/)
Claims that survived a theorist's own attempt to kill them, each
document's own section 4 verbatim. These are the nearest thing on
disk to a vetted proposal; the full attack is at the path given.

### Attack: centerColumn_other_isEventuallyPeriodic_of_center — the centre column of the settled configuration
`docs/attacks/2026-09-07-centercolumn-other-iseventuallyperiodic-of-center-the-centre-column-of-the-settled-configuration.md`

All four candidates survived falsification and the novelty search. I
would seed C1 first, as one S node with the definition
`settledCenter k := leftDiagonal k (2 ^ k)`, because C2 and C3 cannot be
stated without it and its proof is two existing lemmas; then C2 in
diagonal coordinates as the M–L node it is, since it puts `Σ` on the
board as a `Config` and every half-line and Kopra theorem then applies to
it. C3 is a computed fact for the crystals list beside crystal 19, not a
node. C4 is the result of the session: a computed fact that contradicts
Rowland's expectation, with the honest caveat that its mechanism is a
margin between two front speeds; it belongs in the crystals list as
computed, and in `docs/obstructions.md` as the reason the left of the
picture cannot close this wall, which is where I have put it. None of the
four moves the residual, and I say so: the residual lives in the band,
and this session's finding is that the band's left front is the edge of
what the configuration is allowed to influence.

### Attack: `centerColumn_other_isEventuallyPeriodic_of_center`, the pair of columns 0 and 1 under the cone constraint
`docs/attacks/2026-09-07-centercolumn-other-iseventuallyperiodic-of-center-the-pair-of-columns-0-and-1-under-the-cone-constraint.md`

All four candidates survived their tests: C1 and C2 because they are
identities, checked to 200,000 rows and in the kernel to depth 40; C3 as a
conjecture that no periodic boundary of period at most 20 (dense) or 240
(sparse) survives, with the honest reading that its survival statistics
are those of a fair coin and so carry no evidence of a mechanism; C4 as a
kernel computation. None is a lemma a proof of the residual would cite for
its content; C2 is the one it would cite for its shape, because it is the
first exact statement of what the cone constraint does to the pair: it
deletes column 1 at black times and prescribes it at white times, leaving
a condition on column 0 and the left half-line alone. If a captain seeds
anything, seed in this order: the two definitions (`leftSolve`,
`evolveHalfLeft`) with their agreement theorems, then C2's split identity,
then C4 as a `decide` node; C1 as two S nodes after the definitions; C3 not
at all, since it is stronger than the wall and would sit beside it. The
negative result of this session is as real as the positive one: the
counting route my previous document proposed is dead (obstruction entry),
and the reason it is dead, the slow left damage front, is the same reason
the seed is loose from the left and rigid from the right.

### Attack: `centerColumn_other_isEventuallyPeriodic_of_center`, the transients of the left diagonals under a periodic boundary
`docs/attacks/2026-09-07-centercolumn-other-iseventuallyperiodic-of-center-the-transients-of-the-left-diagonals-under-a-periodic-boundary.md`

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

### Attack: `centerColumn_other_isEventuallyPeriodic_of_center`
`docs/attacks/2026-09-07-centercolumn-other-iseventuallyperiodic-of-center.md`

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

### Attack: the masking mechanism in the transient band, why a diagonal settles before its drivers
`docs/attacks/2026-09-08-centercolumn-other-iseventuallyperiodic-of-center-the-masking-mechanism-in-the-transient-band-why-a-diagonal-settles-before-its-drivers.md`

C1, C2 and C3 survived as exact statements, and they are of one kind: the seam of the transient band is a damage front between the seed and the settled row, its motion is `rule30_left_local_law`, the diagonals it visits obey the reset lemma with no slack, and the onset wall is the statement that this front's speed stays below a half. C4's provable half survived and its measured half is the answer to the topic: a diagonal settles before its drivers when the front retreats past it, and the transient that ends it is usually annihilated by another transient, not masked by a settled black cell; the notebook's mechanism is 4 % of the cases. None of this touches the wall this topic is filed under: every statement here is about the band's left edge, and `centerColumn_other_isEventuallyPeriodic_of_center` lives on its right edge, where there is no front. If a captain seeds anything, seed C1 first, two S nodes under `leftDiagonal_onset_le` with nothing but `leftDiagonal_recurrence` and periodicity behind them, then the definition of `F` and C3 as the wall's honest form; C2 is worth a node only if someone intends to attack the speed, and I know no one who can. The sixth obstruction entry is the durable output.

### Classify the good boundaries
`docs/attacks/2026-09-08-classify-the-good-boundaries-your-own-c4-next-topic-and-the-only-place-left-on-this-board-where-a-positive-criterion-can.md`

All four candidates survived falsification and the novelty search. C4 survived
narrowly and only after the one counterexample it produced was overturned by more
depth, so it survives as *data* — 260 rotation classes at `p ≤ 10` with no split,
one class never examined — and not as a claim ready to seed: it has no route at a
black start, and its white-start half is a separate small provable fact that
should be seeded alone.

**I would seed C3 first**, in two pieces: the mathematical statement that the
configurations fixed by `F^L` are exactly the cycles of the leftward window map,
which crystal 24 already almost gives and which `blueprint/crystals.md` currently
tells seeders is impossible to make precise; and, separately, the kernel-checkable
facts that the specific listed words are fixed by `L` ring steps, which
`explorer/talus2_scratch_rings.lean` already establishes with `propext` alone. It
is the only claim here that is exact, complete, independently cross-checked
against print, and cheap. C2 is the more interesting statement and should follow
it, because C3 is what makes C2's conclusion a finite object rather than an
existential. What did **not** survive is the topic's own hope: there is no
criterion. C3 confines a good `b` to a computable set, and at periods 3, 4 and 5
that set contains every word of that minimal period, while the good words number
5 of 8, 14 of 16 and 2 of 32 — so the necessary condition excludes nothing exactly
where it could be checked, and the sufficient direction is false (section 5).
Goodness is decided by
something finer than any invariant of `b` I could find, and the measured onsets say
why it will be hard to find: within a **single rotation class** at `p = 10` the
onsets are nine values at or below 15,195 and one at **798,077**; another class at
the same period spreads 12,156 to 280,976. Three classes that were confidently
good at `T = 3·10^4` were all bad at `T = 4·10^5`, and one word bad at `10^6` was
good at `2.5·10^6`. So the good counts below are not upper bounds and not lower
bounds; they are what a run of that depth said, in both directions.

### Attack: falsify `rightDiagonal_period_doubles_iff_odd_weight`
`docs/attacks/2026-09-08-falsify-rightdiagonal-period-doubles-iff-odd-weight-the-minimal-period-of-right-diagonal-k-is-2l-when-g-k-has-odd-weight.md`

All five candidates survived, and the criterion itself survived a
falsification attempt three orders of magnitude deeper than the topic's
140,000 terms: 0 failures at every depth `k ≤ 65`, where the minimal period
is `2^27` and the deepest lag pass read `1,073,741,952` rows. The claim I
would seed first is **C1**, the doubling half with its minimality, because it
is a complete theorem whose ingredients are all on the board
(`rightDiagonal_recurrence`, `bool_xor_driven_periodicFrom`,
`periodicFrom_mul`), because it is the half of the topic that can be closed
outright, and because **C4** — the session's real find — needs its
antiperiodicity as a hypothesis. C4 should be seeded immediately after it, in
its two pieces: *no right diagonal past the edge is constant* (a small node
worth having on its own; it is the first statement on this board that says a
right diagonal is never degenerate) and *after a doubling the driver keeps the
full period*. Those two together turn a claim that was open at every depth
into one that is open only on the interior of a plateau, and they explain the
one anomaly in the picture, `k = 2`, as the excluded case rather than as
noise. **C2** is the reduction that says what is left; **C3** is the
vocabulary it is most naturally said in; **C5** belongs in the crystals as a
warning, not as a node. The honest summary of the topic: the statement is
true as far as anyone can compute, two thirds of it is now a theorem nobody
has written down, and the remaining third is a new open problem of the same
species as the left-side walls — a lower bound on a period, in an orbit that
nothing distinguishes from a generic one.

### Attack: the period wall through the orbit of the recurrence alone, why the gaps between eventually-white diagonals grow
`docs/attacks/2026-09-08-leftdiagonal-period-le-the-period-wall-through-the-orbit-of-the-recurrence-alone-why-the-gaps-between-eventually-white-diagonals-grow.md`

C1 survived and is in the kernel: four S-sized lemmas that make "eventually white" a relation between consecutive settled words and fix the two diagonals after a white; a captain can seed them under `leftDiagonal_period_le` as vocabulary, knowing they do not move the wall. C2 survived as a counting fact with a provable board form, the upper bound `4^(2^n)` on the gap between doublings, which is the honest answer to the topic's question "why do the gaps grow": the whites are a `2^-L` fraction of a space the orbit walks without repetition, and the measured gaps (`5, 21, 371, 52808, 1.42 · 10^9`) sit within a factor `3` of `2^L` as that predicts. C4 survived as a computation and is the session's finding for Dib. C3, the statement that would actually prove the wall, survived its enumeration to `L = 32` in the way a coin survives it, and I would not seed it. Nothing here gives a lower bound on a gap, and I now think nothing in the recurrence does: the period wall is true for the same reason the onset wall is, a small probability summed over the levels, and a proof would need to control the seed's specific words at the whites. I would seed C1 first, because it costs nothing and any later statement about whites needs it, and C2's board form second if a prover wants an L-sized exercise in pigeonhole; neither is under the wall in the sense of implying it.

### Attack: are the right-diagonal minimal periods unbounded?
`docs/attacks/2026-09-08-rightdiagonal-minimal-periods-are-they-unbounded-given-that-the-recurrence-alone-cannot-decide-it-your-own-c5-is-the-sta.md`

All four candidates survived, and the topic's question has an answer: **yes,
the right-diagonal minimal periods are unbounded, and the property that forces
it is the seed's cone, every piece of which is already a theorem on this
board.** The honest answer to the question the topic told me to be plain about
is therefore *no* — the weakest sufficient property is not equivalent to a P1
conjecture, and it is not even close: it is `evolve_left_edge`,
`evolve_right_edge` and `evolve_eq_false_of_outside_cone`, all closed, plus
`rightmost_difference_moves_right`, also closed. I would seed **C1** first, in
the `rightDiagonal_not_periodic_at_agreement` form with `m` supplied as a
hypothesis, because it is the whole content; under it go the two missing
pieces (that `rule30` commutes with a spatial translation, and that
`evolveFrom (evolve p) t = evolve (t + p)`), which are size-S nodes the board
should have anyway and which a P1 attack through the half-lines will want
sooner or later. **C2** goes directly above C1, in the
`∃ k, ¬ PeriodicFrom (rightDiagonal k) p 0` form that needs no
`minimalPeriod`; it is the right-side twin of the proved
`leftDiagonal_period_unbounded`, and it is worth having for the symmetry alone.
**C3(b)** belongs in the crystals as a warning with a witness, replacing last
session's C5, which was the same warning without one. **C4** is the note that
keeps this region out of P1's file.

C1 and C2 are not sketches: `explorer/scratch_rightunbounded_proof.lean`
compiles, and `#print axioms` on both gives
`propext, Classical.choice, Quot.sound` and nothing else. It imports
`Rule30.Basic` and four closed proof files (and, as a scratch file must, never
`Rule30.Statements`), and proves six things: the three small lemmas
`rule30_translate`, `evolveFrom_translate`, `evolveFrom_evolve`, then
`rightDiagonal_first_failure`, `exists_agreement_length` and
`rightDiagonal_period_unbounded`. A captain should read it as a *proposal with
its proof attached*, not as a node — nothing here has been through the seed
check, and a theorist writes no nodes.

Two things I want weighed honestly against the above. First, the *fact* in C1
and C2 is Rowland's sentence at line 131 of his paper; what is new is a proof,
a precise statement, and the observation that the proof needs nothing but the
cone. A node whose novelty is "we proved the sentence in someone's
introduction" is still worth landing, but it should be landed under that
description. Second, the argument is short enough that its shortness is itself
the thing to be suspicious of — a statement Rowland left as an aside and nobody
has written down should not fall to four lines of the board's existing
theorems. Three checks stand against that suspicion, and they fail in
different ways if the argument is wrong: the engine, which says `τ(p) = m(p)`
at every one of `2^20` values *and would have said otherwise* if the geometry
were off by one; the kernel on the statement itself, which does not care
whether my reasoning about it was sound; and the sharpness test, which
produces a real picture where the same argument must fail and identifies which
step does. What remains genuinely open in this region is not C1 or C2 but the
converse of Rowland's sentence, which section 6 is about.

### The residual itself
`docs/attacks/2026-09-08-the-residual-itself-prove-that-an-eventually-periodic-centre-column-forces-some-other-column-to-be-eventually-periodic-t.md`

C1 died, and its death is the session's result. C0, C2, C3 and C4
survived. **I would seed C2 first**: it is the only one that changes what
a prover is aiming at, it costs an M-sized proof out of two nodes that are
already closed, and after it the frontier wall reads "if the centre column
repeats, the column just left of it repeats" — one named column instead of
an existential over `ℤ`. C3 should follow immediately, because it is what
makes C2 worth having: with the black times pinned by
`column_succ_of_black`, the wall is a statement about column 1 at the
white times of the centre column and about nothing else, and that is the
smallest form of P1 this board has had. C0 I would land as documentation
rather than as mathematics — it costs three lines and it stops the next
session from reading the frontier wall as a reduction and looking for a
smaller one, because there is none. C4 is not a Lean statement and should
stay in this document and in `docs/obstructions.md`. What I would not do
is spend another session on the half-line abstraction in either direction:
with obstruction 2 killing one half and C1 the other, the abstraction is
closed.

### Attack: the free companion of `centerColumn_other_of_cohomologous_column`
`docs/attacks/2026-09-08-turn-a-measured-obstruction-into-a-theorem-portage-connector-established-by-decisive-measurement-not-proof-that-the-tran.md`

All five, and three of them are theorems the kernel has checked rather than
claims: §3.1 (a periodic difference would prove P1, so a proof of the topic's
statement may assume P1), §3.2 (damage is not a dynamical object), §3.3 (the
right-edge shield, in general form), §3.4 (adjacent columns cannot disagree for
ever). §3.5 is a measurement and survives as one. **I would seed §3.3 first.**
It is the only one that changes what anybody attempts next: it removes an
entire class of routes to the `d = 0` case, it is the sharpest thing this
session found, and it is the only result here that is worth writing up outside
this project — a proved, explicit, infinite family of finite configurations
sharing the seed's own centre column, against a printed statement (Wolfram
1986 §5) that says localized changes always spread. Then §3.1, which is three
lines and fixes the frontier's shape; then §3.4; then §3.2, whose value is as
an obstruction rather than as supply. What did **not** survive is the topic's
own hope: no instance of the difference statement beyond §3.4 is proved, and
the honest answer to "is it as hard as the residual" is in §2 — not equivalent,
one-way implication only, and in my judgement harder to attack.

---

### The onset wall at exact criticality
`docs/attacks/2026-09-09-the-onset-wall-is-now-exactly-critical-and-the-question-is-whether-equality-suffices-today-s-computation-constrain-the-b.md`

All four, and together they answer the topic's two questions cleanly and in
opposite directions. **(1) The onset induction does tolerate equality.**
`leftDiagonal_onset_le_of_line` has zero per-step slack, which is exactly what
a per-step bound of `1/2` supplies; an averaged bound costs an additive
constant `2c`, the anchor at `(18, 0)` supplies a budget of 17, and the
admissible-ring class's amplitude is 3, measured exhaustively at `N = 4, 8, 16`
from both a maximally uncertain and a singleton start. "It needs strictness" is
*not* the answer: strictness is not needed anywhere, and a session spent
looking for the step that needs it would find none. **(2) The transfer does not
hold, and it is not as hard as the wall — it is false.** The ring class's
binding hypothesis is a power-of-two *row* period, which the settled region does
not have; the hypothesis it does have is power-of-two *diagonal* periods, and
the same `010011111000` runs at exactly `4/7` under that one. I would seed C4
first, because it is two S nodes of genuine content that hold whatever happens
to the rest, and because it is the only one of the four that adds something to
the board rather than removing something from it. C2 and C3 belong in
`docs/obstructions.md`, where I have put them.

---

### The rigidity law of the T-map's attractor
`docs/attacks/2026-09-09-the-rigidity-law-of-the-t-map-s-attractor-which-is-the-one-thing-about-it-that-survives-a-correct-null-model-let-t-n-r-4.md`

C1 survived falsification, survived the novelty search, and is now proved in the kernel
with clean axioms — it is what I would seed first, as the two `ℕ`-only statements
`step_two_mul` and `stepMod_iterate_two_mul`, size S and S–M, under nothing. It is
small, it is reusable anywhere the packed-row model is used (it is the exact statement
that the picture does not notice being slid one cell in from its left edge), and it is
the only thing here a prover can do anything with. C2 survived to `n = 520` as an exact
identity and reproduces two numbers computed independently by Rowan; it is true in the
range tested and provably ceases to be a closed form at `n = 53209`, so it should be
recorded with that range attached and not as a law. C3 survived as a dichotomy and is
the correct explanation of the measured phenomenon, but its counting consequence is
exactly the thing that fails. C4 is the result: **the topic's law is false, first at
`n = 53209`, and the exactness that "survives a correct null model" is not a property of
`T`'s functional graph at all — it is the statement that rule 30's first four
eventually-white diagonals all happen to have odd parity, which is the last thing
anybody would call structure once it is written down.** The honest summary of the whole
topic is: a random triangular map's attractor sizes are ragged because a random
triangular map has many odd cycles; rule 30's are exact because, so far and only so far,
it has one. The nearer null agrees: 19 of the 256 elementary rules satisfy the same law
over `n = 2..18`, and among the 128 quiescent rules the number satisfying it and the
number with exactly one odd cycle are both 17.

---

### Two unexplained numbers from today's kernel checks
`docs/attacks/2026-09-09-two-unexplained-numbers-from-today-s-kernel-checks-and-they-are-the-first-things-on-this-board-that-look-like-structure.md`

All four candidates survived falsification, and three of them survived the
novelty search as something other than a restatement. C1 is the deliverable for
the topic as posed: it answers the question asked — **`16` is a coincidence of
`k ≤ 5000`, exactly and provably so, and the next constant is `32` from
`k = 87867`** — and it is kernel-confirmed at its critical step. C2 is what I
would seed first, because it is the only one of the four that puts something new
*under a wall*: `leftDiagonal_period_le ⟺ per(n) ≤ n` is elementary, size M, and
it moves the second left-diagonal wall into the same `ℕ`-only arithmetic frame
where the first one now lives, so that a single script measures both and a single
induction could attack both. C4 is the most interesting thing I found and the one
a reader will remember, but it is a witness rather than a lemma: it closes half of
a hedge Rowland left in 2006 and it does not move either wall. C3 is the honest
negative the topic asked for and its value is that it stops a captain preferring
the all-starts route for the wrong reason.

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
