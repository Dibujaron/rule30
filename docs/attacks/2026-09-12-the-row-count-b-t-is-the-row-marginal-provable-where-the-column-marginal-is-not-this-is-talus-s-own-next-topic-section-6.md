# The row count `b(t)`: is the row marginal provable where the column marginal is not?

Sextant, theorist, 2026-09-12.

**The band first, because the project's rule says so.** **Project-internal,
with one small novel item inside it.** The topic asked for a negative if that
is the honest answer, and it is — but the negative comes with a *sharp
constant*, which is more than "we could not find a route". The row marginal is
**not** provable where the column marginal is not, and the reason is now a
number rather than a shrug:

> Every argument that reads a row through its block statistics and the
> one-step law — Talus's `C3`, his `C4`, my improvement of both, and every
> refinement of any of them at any block size — is an inequality true of
> *every* configuration. Rule 30 has an invariant configuration of density
> exactly **3/5**: the ring `10011`, temporal period 5, every state of its
> cycle of weight 3. And **3/5 is exactly the bound that method proves**. So
> the method is already at its ceiling, the ceiling is not `1/2`, and no
> refinement can move it.

The **novel** item is that pair of facts fitting together: the bound
`2·b(t+1) + 3·b(t) ≤ 6t + 9`, giving triangle density `≤ 3/5` where Talus's
`C3` gives `2/3`, together with the witness that attains it — so
`max { density of a rule-30-invariant measure } = 3/5` exactly. That is a real
if very small statement about rule 30 and I did not find it in `sources/`.
Everything else here is **nothing**: the row excess is a coin's and then some
(20 of 20 null draws are *more* extreme), and a rule 30 row is locally
indistinguishable from a coin word at every block size up to 16.

**P2's last named route closes.** The topic's own sentence for that outcome.

---

## 1. The residual, in one paragraph

Time runs down the picture. Row `t` is the horizontal read: `2t+1` cells from
`-t` to `t`, both edges black, everything outside white. `b(t)` counts its
black cells (OEIS A070952) and row balance is `b(t)/(2t+1) → 1/2`, which
crystal 29 calls purely empirical and says only the cone `b(t) ≤ 2t+1` is
provable. The row is P2's sibling marginal exactly: `centerColumn_run_boundary`
makes the centre black at `t+1` precisely when the origin is a run boundary of
row `t`, and the number of run boundaries in row `t` **is** `b(t+1)`, so P2
counts the rows whose run-boundary set contains the origin while row balance
counts the size of that set. The row looks like the better target because rule
30's law is horizontal: two adjacent black cells forbid a cell of the next row,
which constrains a row and cannot constrain a column. Talus's `C4` turns row
balance into finite combinatorics of a *single* row — with `ρ(t)` the maximal
black runs and `G₂(t)` the interior white gaps of length `≥ 2`,
`b(t+1) = ρ(t) + 2·G₂(t) + 2`, so balance says **a rule 30 row has about one
maximal black run per four cells and about half its interior gaps are long**
(measured: `ρ/(2t+1) = 0.25044` and `G₂/(ρ−1) = 0.50056` at `t = 199,999`).
What would have to be true for that to follow is a two-sided bound on `ρ(t)`
and `G₂(t)`, and the residual is that **neither side is available from the
local law**: the row's block statistics are exactly those of a coin word, and
the inequalities the local law does supply are saturated by a genuine rule 30
orbit of the wrong density.

## 2. Why the known routes fail

**On the board already.**

- **Crystal 29** — "only `b(t) ≥ 3` and the cone `b(t) ≤ 2t+1` are provable,
  and neither is worth a node". `C1` below improves the upper side to `3/5`
  and `C2` proves that is the end of it. The lower side is *not* improved and
  `C3` says why: the all-white configuration is a rule 30 invariant measure of
  density `0`, so no local argument gives any lower bound above the constant.
- **Talus's `C2`** (obstruction 21, "Prize 2's excess cannot be bounded
  through the half-line") — crystal 40 makes the centre column a free
  coordinate, so nothing quantified over `Config` bounds the column's excess.
  The topic instructs, correctly, not to propose a thirteenth lemma of that
  shape. The finding below is that the row has a fence of the *same strength
  but a different shape*: the row is not free — it is `4^{-t}`-sparse among
  words of its span, by pre-injectivity (crystal 4), so `config ↦ row t` is
  injective on finite configurations and only `2^{m-1}` of the `2^{m+2t-1}`
  words of span `m+2t` occur. **The constraint is real, it is two bits a step,
  and it is invisible to every local statistic** (§3 `C5`), which is why
  non-freeness does not convert into provability.
- **Crystal 8**, the forbidden block, is the entire local law's content for
  rows and is what `C3`/`C4`/`C1` all run on.
- **Crystal 12 / Rowland 2006 §1, §3** kills the one route that would have
  given a lower bound on `ρ(t)`: `ρ(t) ≥ b(t)/R` needs the longest black run
  `R` bounded, and Rowland *proves* the rightmost run of row `t` is a strictly
  increasing function of `ord₂(t+1)`, hence unbounded. Measured: the longest
  black run below `t = 2·10^5` is **43, at `t = 131,071 = 2^17 − 1`** — his
  rows `2^n − 1`, exactly (`explorer/sextant8_rows.mjs`).
- **Crystal 66, the OR-to-XOR filter.** `C1`'s derivation is OR-specific (the
  forbidden adjacent-black pair is false for rules 90 and 150) but its
  *conclusion* survives the swap, exactly as Talus found for `C3` — rules 90,
  110, 150, 60 have sparse pictures and satisfy any density bound. `C1`
  separates rule 30's picture from an all-black one and from nothing else, and
  I say so rather than claiming the filter passed. `C2`, the fence, is not of
  a shape the filter applies to: it is a statement about rule 30's own
  invariant measures.
- **Crystal 67, the ensemble filter,** is the reason `C5` below stops where it
  does, and the reason the block-frequency measurement in §3 `C5` is decisive
  rather than suggestive.
- **Obstruction 20**'s closing line asked for a third death of the shape "no
  statistic computable from the structure separates the seed from the family",
  before an entry could say the family is statistically indistinguishable.
  Talus's coverage table was the third for the column. The block-frequency
  table in `C5` is the first for the **row**, and it is stronger: the seed's
  own row is indistinguishable from a coin *word*, not merely from a family
  member.

**Routes I tried or considered that are not on the board yet.**

- **Push the one-block inequality further with two-block statistics.** The
  natural next move after `C1`, and it is refuted before it is attempted:
  `C2` shows the one-block optimum is already attained by a real orbit, so
  every `k`-block programme has the *same* optimum `3/5`. The hierarchy does
  not fail to close — it closes immediately, at the wrong value.
- **Use the cone to exclude the witness.** The ring is bi-infinite and the
  seed lives in a cone, so perhaps a cone-aware argument beats `3/5`. It does
  not: §3 `C4` plants the ring in a cone and the light cone
  (`evolveFrom_eq_of_agree_on_window`) holds its density for `n/2` rows while
  the row grows by two cells a row. Measured triangle density **0.599917**
  over the first 2,000 rows at span `4·10^6`. So for every `T` and every `ε`
  there is a *finite* configuration whose first `T` rows have triangle density
  above `3/5 − ε`, and a bound proved for all finite configurations cannot be
  below `3/5` either.
- **Bound some moment of the run-length distribution.** Dead the same way it
  was dead for the column, and now measured *within a single row*: the black
  runs of row `200,000` have mean `2.00486` against a coin word's `2.00086`,
  and the per-length counts are the geometric `2^{-L}` to within a coin's
  scatter.
- **Read the excess for an anomaly.** The topic warns against this and is
  right to. §3 `C5`'s null is below.

**New dead end, appended to `docs/obstructions.md`** as the entry *"The row
marginal's local route is sharp at 3/5, and 3/5 is attained"*.

## 3. Candidate claims

### C1. The one-block row bound: `2·b(t+1) + 3·b(t) ≤ 6t + 9`, hence triangle density `≤ 3/5`

**The claim.** In English: count a row's maximal black runs and its interior
white gaps. Every black cell of the next row is either the left end of a run or
one of the two ends of a gap that is at least two wide, and the gaps have to
fit inside the whites. Pushing those three facts as far as they go bounds the
next row's black count by one and a half times this row's white count, and the
first `T` rows of the picture are then at most three fifths black.

In the project's vocabulary, with `ρ(t)` the number of maximal black runs of
row `t`, `G₁(t)` and `G₂(t)` its interior white gaps of length exactly one and
at least two, and `w(t) = 2t+1−b(t)`:

    (identity, Talus C4)   b(t+1) = ρ(t) + 2·G₂(t) + 2
    (its other form)       b(t+1) = 3·ρ(t) − 2·G₁(t)
    (gap bookkeeping)      G₁(t) + G₂(t) = ρ(t) − 1
    (gaps fit)             w(t) ≥ G₁(t) + 2·G₂(t)
    (runs are non-empty)   b(t) ≥ ρ(t)

    THE BOUND             2·b(t+1) + 3·b(t) ≤ 6t + 9
    THE CONSEQUENCE       Σ_{t<T} b(t) ≤ (3/5)·T² + O(T)

*Why.* Substituting the bookkeeping into "gaps fit" gives
`G₂ ≤ w − ρ + 1`, so `b(t+1) = ρ + 2G₂ + 2 ≤ ρ + 2·min(ρ−1, w−ρ+1) + 2`, whose
maximum over `ρ` is at `ρ = (w+2)/2` and equals `(3w+6)/2`. Substituting
`w = 2t+1−b(t)` and clearing the two gives the bound; summing it over `t < T`
gives `5·Σb ≤ 3T² + O(T)` against the triangle's `T²` cells.

The missing definitions are the ones Talus already named — `rowRuns : ℕ → ℕ`
and a `rowGaps₂` — plus nothing else.

**What it would give.** It replaces crystal 29's "only the cone is provable"
with `3/5` where Talus's `C3` gives `2/3`, and it is strictly sharper than `C3`
at every row that is not all black (the two caps on `b(t+1)`, doubled to stay
in `ℕ`, are `8t+10−4b` for `C3` and `6t+9−3b` here, and the second is smaller
exactly when `b(t) < 2t+1`; the sole exception is row 1, `111`, the only
all-black row). Towards P2, **nothing**, and `C2` is the proof that it is the
last thing of its kind.

**Falsification.** `explorer/sextant8_rows.mjs`, rows `0 … 199,999`, packed
rows with all run and gap counts taken word-parallel (`ρ = popcount(r & ~(r<<1))`,
`G₁ = popcount((r<<1) & ~r & (r>>1))`, and `b − ρ = popcount(r & (r<<1))`
asserted every row as an internal consistency check):

| statement | failures | note |
|---|---|---|
| `b(t+1) = ρ + 2G₂ + 2` | **0** | Talus's `C4`, reproduced |
| `b(t+1) = 3ρ − 2G₁` | **0** | |
| `b(t+1) ≤ 3ρ(t)` | **0** | |
| `b(t+1) + 2b(t) ≤ 4t+5` (`C3`) | **0** | min slack `0` at `t = 0` |
| `2b(t+1) + 3b(t) ≤ 6t+9` (**new**) | **0** | min slack `0` at `t = 0` |

Triangle density at `T = 2·10^5`: **`0.500024`**, against this bound's `0.6`
and `C3`'s `0.667`.

**It is also sharp as a statement about arbitrary words**, which is the form a
Lean proof would assert, since the derivation never mentions where the row came
from. `explorer/sextant8_lp.mjs` part 2 checks
`2·b(Fc) + 3·b(c) ≤ 3·(n+2)` over **every** word of span `n` for
`n = 1 … 22` — 1,048,576 words at `n = 22`, 2,097,152 in total — with **0
violations and minimum slack exactly `0` at every single span**. The extremal
word is `(100)^k 1`: all its gaps are exactly two, so every cell of its image
is a run boundary and the image is all black.

**Kernel.** `explorer/sextant8_scratch_rows.lean`, accepted by `lake env lean`:
the identity, both its forms, the gap bookkeeping, `C3`, the new bound, and its
attainment at `t = 0, 1, 2` — all `decide` against `rowCell`, which
`rowCell_eq_evolve` ties to `evolve`. The companion
`explorer/sextant8_scratch_mutant.lean` asserts the bound with `6t+8`, the
identity with `+1`, and the witness ring with period 4; Lean rejects all three
at the right lines, so the checks are not vacuous.

*Distrust the result you like.* Four things could have produced this. **(i) A
trivially true inequality** — it is not, being attained at `t = 0, 1, 2` and at
*every* word span up to 22. **(ii) A pair bound read as a pointwise one** —
Talus made exactly this error with `C3` and recorded it; I state the
consequence only for the *sum*, and the measured maximum single-row density is
`0.70968` at `t = 15`, comfortably above `3/5`, so no pointwise reading is
available. **(iii) An engine artefact** — the row counts at `t = 0..4` are
`1, 3, 3, 6, 4`, which are A070952's, and the packed-row step is the board's
own `rowStep`. **(iv) A phantom failure from an uninitialised predecessor** —
my first run reported exactly one failure of everything at `t = 0`, which is a
dummy row, the same artefact Talus records in his §5; fixed by starting the
predecessor at `t = −2`, after which all five columns are clean.

**Novelty.** Searched `sources/` for `density of`, `fraction of`, `number of
nonzero sites`, `maximal density`, `maximum density`, `upper bound … density`,
`A070952`, `row density`, `two-thirds`: no hit bounds the density of a
single-seed rule 30 picture. Fukś 2013 §4 computes the density of ones from a
*disordered* initial state (an ensemble average, `1/2` by left-permutivity —
the board's `window_count_half`); Wolfram 1986 §4 is the same ensemble
statement. Honest category: **an elementary consequence of a known block
(crystal 8) plus a known identity (`rule30_run_boundary`), not found in print,
and small** — the same category Talus gave `C3`, one notch sharper.

**Route.** `rule30_run_boundary` for the identity, `Finset.card` over the cone
with `evolve_eq_false_of_outside_cone` for the outside, and the gap bookkeeping
`G₁ + G₂ = ρ − 1` which wants the two missing definitions. The one step that is
actually hard is the same one Talus named: `ρ(t) ≤ w(t) + 1` and
`w ≥ G₁ + 2G₂`, which are run/gap bookkeeping the board has no vocabulary for.
Size M. **Seed it only with `C2` attached**, because on its own it invites the
refinement that `C2` refutes.

### C2. `3/5` is exactly the maximum density of a rule-30-invariant measure — so `C1` is sharp and the whole local hierarchy collapses

**The claim.** The bi-infinite configuration `(10011)^ℤ` has temporal period 5
under rule 30 and every configuration in its cycle has black density exactly
`3/5`; and no configuration does better, by `C1`'s own inequality. So

    max { black density of a shift-invariant, rule-30-invariant measure } = 3/5,

attained. Consequently, for **every** `k`, the linear programme over `k`-block
frequencies with the one-step law has optimum exactly `3/5`: `≤ 3/5` because
the one-block programme already proves it, and `≥ 3/5` because the ring's
`k`-block frequencies are feasible for every `k` and its density is `3/5`.

*Why the upper half holds for a measure and not just for a cone row.* Per unit
length, maximal black runs and maximal white gaps alternate, so they have the
same density `r`; write `g₂` for the density of gaps of length `≥ 2`. The
run-boundary law gives `d' = r + 2g₂` (each long gap contributes both its
ends), and the whites must hold the gaps, `1 − d ≥ (r − g₂) + 2g₂ = r + g₂`.
Maximising `r + 2g₂` gives `d' ≤ (3/2)(1 − d)`, and invariance is `d' = d`,
whence `d ≤ 3/5`. The ring meets every constraint with equality: `r = g₂`, and
`1 − d = 2/5 = r + g₂`.

**What it would give.** It is the **fence**, and it is what makes the topic's
question answerable rather than merely unanswered. Any argument whose inputs
are block frequencies of a row and the one-step law — which is every argument
anyone has produced for the row marginal, `C3`, `C4` and `C1` included — proves
a bound that is also true of the ring, hence at least `3/5`. Row balance needs
`1/2`. So the route is not hard, it is **closed, with the gap measured at
`1/10` of a row**.

**Falsification.** Two independent instruments plus a hand check.

- **By hand**, because this is the whole document: `10011 → 01110 → 11001 →
  00111 → 11100 → 10011` under `new(i) = s(i−1) XOR (s(i) OR s(i+1))` on a
  ring of 5, each state of weight 3.
- **Kernel**: `explorer/sextant8_scratch_rows.lean` proves `ringStep^[5] w = w`,
  `ringStep^[1] w ≠ w`, and `weight (ringStep^[k] w) = 3` for every `k < 5`, by
  `decide`. The mutant file asserts period 4 and is rejected.
- **Exhaustive enumeration**: `explorer/sextant8_rings2.mjs` finds every cycle
  of rule 30 on every ring of size `N ≤ 24` — `2^24` states at the top — and
  computes each cycle's exact orbit-average density. The **maximum over all of
  them is `0.600000`**, at `N = 5` and again at its multiples `N = 10, 15, 20`,
  and nothing exceeds it, which is what `C1` predicts.
- **The programme's own optimum**, independently: an exact integer dynamic
  programme maximising the triangle count subject only to
  `b(t+1) ≤ min(3b(t), ⌊(3w(t)+6)/2⌋)` reaches `0.605700` at `T = 400`, i.e.
  `3/5 + O(1/T)` (`explorer/sextant8_lp.mjs` part 3).

*Distrust the result you like.* **This is where the session nearly went wrong,
and the failure is the one the project has recorded most often.** My first ring
enumeration took the left neighbour to be `s >>> 1`, whose bit `i` is `s(i+1)`
— the *right* neighbour. It was running `right XOR (centre OR left)`, which is
**rule 86, rule 30's mirror**. It produced the same headline `3/5`, because
density is invariant under mirroring and `10011` reversed is `11001`, the same
cyclic word — so the number I liked was correct for the wrong reason and every
symmetric check would have passed. What caught it was an *asymmetric* one:
rule 30's known period-3 ring `010011111000` (Wolfram 1986 Table 6.2, and the
witness of two earlier obstruction entries) did not appear in the `N = 12`
output at all. The rewrite carries that cross-check in the file and reproduces
Wolfram's table: at `N = 7` the four printed period-4 elements come back as one
cycle of period 4 and density `13/28`, and at `N = 12` the period-3 ring comes
back with density `18/36 = 1/2` exactly. The same run had a second defect — the
cycle weights were totalled out of a 4096-entry buffer, so the `N = 17` minimum
(period 10,846) was stale garbage. Both are recorded in §5;
`explorer/sextant8_rings.mjs` is stubbed so nobody runs it.

Two further things that could have produced the survival. **Rings are not the
seed** — true, and that is `C4`'s job, not this one's. **The maximum might be
larger at `N > 24`** — it cannot be: `C1` proves `≤ 3/5` for every
configuration, so the enumeration is a cross-check of `C1` rather than the
source of the bound, and its agreement at 24 sizes is evidence the two
instruments describe the same object.

**Novelty.** The configuration is **known and routine**: Wolfram 1986 Table 6.2
prints the invariant configurations of temporal period up to 4 and stops, and
Talus's enumeration of 2026-09-08 (`explorer/talus2_periodic.mjs`) continued
the table and lists spatial period 5 at temporal period 5 — a continuation
whose novelty Rowan correctly refused at the time. What I did not find anywhere
in `sources/` is any statement about the **density** of these configurations,
let alone a maximum: searched `wolfram-1986` for `invariant`, `extremal`,
`maximis`, `maximiz` (10 hits, all about invariant configurations as objects or
about entropy, none about density), and all of `sources/` for `invariant
measure`, `maximal density`, `maximum density`, `highest density`,
`equidistribut`. Honest category: **novel, and very small** — the fact is one
line given the table, and its only value is the fence it erects. It is also the
third appearance of a Table 6.2 configuration as a *counterexample* on this
board (the period-3 ring killed the reachable-set bound twice); the pattern is
worth noticing.

**Route.** For the mathematical statement: `rule30_run_boundary` plus the
alternation of runs and gaps, in a measure-theoretic setting the board does not
have. **I would not seed it.** Its value is as a fence in `docs/obstructions.md`
and as the sentence attached to `C1`, not as a node.

### C3. The lower side of the fence, and it is worse than the upper

**The claim.** No local-statistics argument gives any lower bound on the row
density above zero. The all-white configuration is rule-30-invariant with
density `0`, so the programme's floor is `0`; and even excluding it, the
best non-trivial witness found is a cycle of density `0.456522`. The only lower
bound the cone supplies is the constant `b(t+1) = ρ(t) + 2G₂(t) + 2 ≥ 3`,
which is crystal 29's known `b(t) ≥ 3` and nothing more.

**What it would give.** Together with `C2`: the local method pins the row
density into `[0, 3/5]`, an interval with `1/2` in its **interior**. Row
balance is a single point. So the method cannot deliver either half of it, and
"the row marginal is provable where the column is not" is false in the only
sense that would have mattered.

**Falsification.** `explorer/sextant8_rings2.mjs`, all cycles at every
`N ≤ 24`. The minimum over non-zero cycles is **`0.456522`** at `N = 23`,
period 138, and Wolfram's own period-4 family at `N = 7` sits at `13/28 =
0.464286`. The all-white fixed point is a cycle at every `N`.

*Distrust the result you like.* This is a claim I did *not* like — it is the
half that kills the topic — so the rule is to distrust it as hard. What could
produce a spurious low minimum: the stale-buffer defect did exactly that in the
first run, reporting `0.374521` at `N = 17` where the true value is `0.492647`.
The corrected run's minimum, `0.456522`, is on a cycle of period 138, well
inside any buffer, and is corroborated by Wolfram's printed `N = 7` family at
`0.464286`, which needs no buffer at all and can be checked by hand.

**Novelty.** Same search as `C2`; nothing in print on densities of these
configurations. Category: **an immediate consequence of an enumeration, and
the enumeration is routine.**

**Route.** None needed, and none wanted.

### C4. The cone does not escape the fence

**The claim.** For every `T` and every `ε > 0` there is a **finite**
configuration whose picture has triangle density above `3/5 − ε` over its first
`T` rows. Hence a bound proved for all finite configurations — the class the
seed actually lives in — cannot be below `3/5` either, and the fence covers
cone-aware arguments and not merely bi-infinite ones.

*Why.* Plant `(10011)^k` as a finite configuration of span `n`. By
`evolveFrom_eq_of_agree_on_window` every cell of row `t` at position
`[t, n−1−t]` agrees with the bi-infinite ring's picture, so the planted region
holds density `3/5` for `n/2` rows while the row grows by only two cells a row.
Take `n ≫ T`.

**Falsification.** `explorer/sextant8_cone.mjs`, `T = 2000` with the span
growing:

| span | triangle density over rows `0…1999` |
|---|---|
| 4,000 | 0.544755 |
| 20,000 | 0.584935 |
| 100,000 | 0.596751 |
| 1,000,000 | 0.599669 |
| **4,000,000** | **0.599917** |

Controls in the same run: the seed itself gives `0.500842` over the same 2,000
rows; the checkerboard `(10)^ℤ`, a fixed point, gives `0.500042`; Wolfram's
`N = 7` period-4 ring gives `0.523167` against its exact `13/28 = 0.4643` (the
gap is the cone's fresh cells, and the row density oscillates between `0.289`
and `0.707` as its period-4 phases go past); and `(100)^k`, the one-step
extremal word of `C1`, **collapses to `0.019017`** — its image is all black and
an all-black row is a dead end, which is exactly why the one-step extremal is
not the long-run one.

*Distrust the result you like.* The trend `0.5448 → 0.5849 → 0.5968 → 0.5997 →
0.5999` is the right shape for `3/5 − O(T/n)` and would be the wrong shape for
an artefact; the residual at span `4·10^6` is `8.3·10^-5` against a predicted
`O(T/n) = 5·10^-4`. Part C of the same script runs one planted ring **past**
its light cone — span 200,000 for 100,000 rows — and the density decays to
`0.5182`, confirming that the escape mechanism is decoherence at speed 1 and
that no *single* configuration holds `3/5` forever. That is the honest limit of
this claim and it is stated here rather than buried: the cone does eventually
destroy the witness, and an argument that exploited that would need to bound
the rate at which high-density patterns decohere — which is a damage-front
statement, and crystals A3 prices those as unavailable.

**Novelty.** The light-cone fact is `evolveFrom_eq_of_agree_on_window`, on the
board. The use is new here. Category: **a routine consequence, reported because
it is the objection a reader will raise against `C2` and it has an answer.**

**Route.** None; it is a measurement plus a closed node, not a statement to
seed.

### C5. What is left, and exactly how far it reaches: the antidiagonal decomposition

**The claim.** Read the row along the diagonals rather than across:

    b(t) = Σ_{k=0}^{t} leftDiagonal k (t−k)
         + Σ_{k=0}^{t} rightDiagonal k (t−k)
         − centerColumn t

Every right diagonal is **exactly** periodic from index 0 with period dividing
`2^k` (`rightDiagonal_periodicFrom_pow`, proved) and every left diagonal is
eventually periodic (proved), so `b(t)` is a sum of `t+1` eventually periodic
sequences read down an antidiagonal, each of whose densities `δ_k` is an
**exact rational computable by a finite calculation** — unlike the centre
column, whose density is the prize. This is the one handle on the row count
that is *not* local, so it is the only thing the fence does not cover. Its
reach: **the outermost `O(log t)` cells of each side, and no more**, because
only the diagonals with `P_k ≤ t` are averaged out by a window of length `t`,
and `P_k` grows like `2^{0.41k}`.

Two things inside it are provable now. At every depth where the period doubles,
`rightDiagonal_antiperiodic_of_odd_driver` gives `R(j+L) = ¬R(j)`, so the
weight over one period is exactly half and **`δ_k = 1/2` exactly** — that is
Talus's `C5` restated as a balance statement, and the doubling depths have
density about `0.41`, so **about 41% of the right diagonals are provably
exactly balanced**. And `centerColumn t = rightDiagonal t 0` makes P2 the
statement that the *last* term of the sum is balanced, read at index 0.

**Falsification.** `explorer/sextant8_diag.mjs`, `T = 2·10^5`, exact minimal
periods and weights for `k ≤ 36` (beyond that `P_k` exceeds the data):

- Edge checks pass: `R_0` black, `R_1` alternating, `L_0`/`L_1` black, `L_2`
  white, over 1,000 indices each.
- `δ_k = 1/2` **exactly** at `k = 1,2,3,4,6,7,8,9,10,15,16,17,18,24,25,27,29,34,36`
  — which reproduces Talus's `C5` list (`1,3,4,6,7,9,15,16,24,25,27,29` at the
  doublings, plus `2,8,10,17,18` at plateau interiors) **exactly**, from an
  independent engine.
- The running excess `Σ_{k≤K}(2δ_k − 1)` starts at 1 and stays in `[0.298,
  1.0]` over `K ≤ 36` — it does **not** grow. The deviations are
  `|2w_k − P_k| ∈ {2, 4, 6, 8, 12, 20, 28, 44, 54, 56, 98}` against
  `√P_k ∈ {8, …, 90}`: a coin's fluctuation, so `|2δ_k − 1| ~ P_k^{-1/2}` and
  the sum converges because `P_k` grows exponentially. Mean `δ_k` over
  `k = 1…36` is `0.490251`.
- The left family behaves the same way with tiny periods (`≤ 8` throughout the
  range) and its running excess stays in `[1.0, 3.5]` over `k ≤ 40`.

**And the measurement that makes the fence's mechanism concrete.**
`explorer/sextant8_blocks.mjs` takes row `200,000` — 400,001 cells — and counts
every `k`-block against a coin word of the same length:

| `k` | dof | chi² rule 30 | chi² coin | distinct blocks (rule 30, coin) |
|---|---|---|---|---|
| 4 | 15 | 14.1 | 18.2 | 16/16, 16/16 |
| 8 | 255 | 179.3 | 229.3 | 256/256, 256/256 |
| 12 | 4,095 | 3,798.7 | 4,230.5 | 4096/4096, 4096/4096 |
| 16 | 65,535 | 65,219.6 | 65,988.3 | 65,387/65,536, 65,397/65,536 |

At every block size rule 30's chi² is **below** the coin's own, every block up
to length 14 occurs, and at 16 it holds 65,387 of 65,536 against the coin's
65,397. The black runs have mean `2.00486` against the coin's `2.00086` and the
geometric `2`, with per-length counts inside the coin's scatter, and the
longest run in the row is 16 against the coin's 17. **There is no local
statistic of a rule 30 row that differs from a coin word's, so there is nothing
for a local argument to be built out of** — which is the same conclusion `C2`
reaches from the other side, by an entirely different route.

*Distrust the result you like.* A chi² below the null's at *every* `k` is
itself slightly suspicious — it could mean the row is smoother than a coin
(consistent with the `−0.4911` lag-1 autocorrelation of the row excess, §5) or
it could mean one draw of the coin was unlucky. One coin draw is one draw; the
honest reading is that the two are indistinguishable at this depth, not that
rule 30 is smoother. The claim `C5` rests on is the weaker and safer one.

**Novelty.** The decomposition is bookkeeping over two board definitions. The
exact-balance-at-doublings half is Talus's `C5` (2026-09-10) restated;
independently reproduced here. The reach statement — `O(log t)` cells — is new
and is the point. Searched `sources/` for the terms in `C1`'s list plus
`diagonal`, `antidiagonal`: nothing. Category: **new phrasing of a board
theorem plus an honest statement of its limit.**

**Route.** No route to row balance, and that is the finding. What could be
seeded is the small true statement "the row's outermost `O(log t)` cells are
balanced to `O(1)`", which needs the `δ_k` at doubling depths and
`periodicFrom_mul`. Size M, worth very little, and I would not seed it either.

## 4. What survived

`C1` survived falsification (0 failures over `2·10^5` rows, 0 violations and
exact tightness over all `2·10^6` words of span `≤ 22`, kernel-checked with a
rejected mutant) and the novelty search, and it is the only thing here I would
seed — as a pair with the `C2` fence written into its `DOES NOT PROVE` field,
never alone. `C2`, `C3` and `C4` survived as fences rather than as claims, and
together they are the session's answer. `C5` survived as a correct statement of
where the one non-local handle stops.

**But the honest answer to the topic's question is the negative it asked for in
advance, and it is sharper than "we could not find a route".** The row marginal
is *not* provable where the column marginal is not. The column's fence is
crystal 40: the centre column is a free coordinate, so every local law is true
of every Bool sequence. The row's fence is different in shape and identical in
strength: the row is **not** free — `config ↦ row t` is injective on finite
configurations, so only a `4^{-t}` fraction of words occur — but that
constraint is two bits of *global* information per step and it leaves every
local statistic looking exactly like a coin's (§3 `C5`), while the inequalities
the local law does supply are saturated by a genuine rule 30 orbit of density
`3/5` (§3 `C2`). **The method's window is `[0, 3/5]` and row balance is the
single point `1/2` in its interior. P2's last named route closes.**

**One correction to the topic, and it matters for anyone who reads the premise
rather than the measurement.** The topic says *"the inequality is already tight
at `t = 1`, so the method has no slack being wasted."* Tight at `t = 1` it is —
and `t = 1` is a three-cell row. Asymptotically the method wastes a constant
fraction of everything it has: at `t = 10^5` Talus's `C3` has slack `100,130`,
which is **25.0% of its own right-hand side**, and my sharper `C1` has slack
`100,124`, **16.7%**. The true triangle density is `0.500024` against `C1`'s
`0.6`. The slack is not an accident to be squeezed out by a better argument;
`C2` says it is exactly the distance from the seed to the worst rule 30 orbit,
and it cannot be squeezed at all. **Tightness at the first non-trivial case is
the same small-case artefact this project keeps finding**, and I would have
believed it if I had not measured the slack as a function of `t`.

## 5. Claims that died

- **"The inequality is tight, so the method has no slack"** — the topic's own
  premise. Dies at scale: 25.0% and 16.7% of the right-hand side wasted at
  `t = 10^5` by `C3` and `C1` respectively, converging to `1/4` and `1/6`.
  Tightness holds only at `t = 0, 1, 2`.
- **"A `k`-block refinement of `C1` can reach `1/2`."** Dies at the ring
  `10011`: the one-block optimum is already attained by a rule 30 orbit, so
  every `k`-block optimum is exactly `3/5`. The hierarchy does not fail to
  close — it closes at level 1, at the wrong value.
- **"The cone excludes the ring witness."** Dies at span `4·10^6`: triangle
  density `0.599917` over the first 2,000 rows of a *finite* configuration.
- **"A bound on the longest black run gives `ρ(t) ≥ b(t)/R`."** Dies at
  `t = 131,071 = 2^17 − 1`, where the longest black run is **43**; and it dies
  in print, since Rowland 2006 proves the rightmost run of row `t` is strictly
  increasing in `ord₂(t+1)`, hence unbounded (crystal 12).
- **"The row excess is worth a second look."** Dies against its own null, and
  in the *opposite* direction from an anomaly. `max |2b(t) − (2t+1)|` is
  `3061` at `t = 285,762` as the topic says, but normalised it is
  `4.1715·√(2t+1)` at its worst (`t = 1987`), against a null of one
  independent binomial per row whose maximum over the same `3·10^5` rows has
  median `4.7436`: **20 of 20 null draws are at least as extreme**
  (`explorer/sextant8_null.mjs`). Rule 30's row excess is not merely coin-like,
  it is *less* extreme than a coin's — which the lag-1 autocorrelation
  `−0.4911` explains, since `2b(t+1) + 3b(t)` is bounded and a high row forces
  a low successor. The negative autocorrelation is real and is the only
  rule-30-specific statistic of the row I found; it does not bound a mean.
- **"The one-step extremal word is the long-run extremal."** Dies at
  `(100)^k`: it saturates `C1` at every span, and its picture collapses to
  triangle density `0.019017` because its image is all black and an all-black
  row is a dead end.
- **My own first ring enumeration.** Two defects, both in the same run, both
  the project's recorded failure modes. (i) The left neighbour was `s >>> 1`,
  whose bit `i` is `s(i+1)` — so it ran **rule 86, rule 30's mirror**, and it
  still produced the right headline, because density is mirror-invariant and
  `10011` reversed is `11001`. Caught only by an *asymmetric* check: rule 30's
  known period-3 ring `010011111000` was missing from the `N = 12` output.
  (ii) Cycle weights were totalled from a 4096-entry buffer, so the `N = 17`
  minimum — period 10,846 — was reported as `0.374521` where the truth is
  `0.492647`. Both fixed in `sextant8_rings2.mjs`, which carries the Table 6.2
  cross-check in the file; the old script is stubbed.
- **My reading of the period-3 ring's density as `19/36`.** Dies on recount:
  its three states have weights `6, 6, 6`, not `7, 6, 6`, so it is exactly
  balanced at `18/36`. I had it wrong in my own head for an hour and it would
  have weakened `C2` by suggesting a second witness above `1/2` that does not
  exist.
- **A phantom failure of every identity at `t = 0`.** The comparison fired
  against an uninitialised predecessor at `t = −1`. Talus's own run has the
  same artefact and records it in his §5; I reproduced it before reading that
  far.
- **Nothing died for lack of depth.** Every death above has a witness computed
  rather than searched for; the row statistics were carried to `2·10^5` rows,
  the excess to `3·10^5`, the word check to every word of span `≤ 22`, and the
  ring enumeration to every cycle of every ring of size `≤ 24`.

## 6. Next topic

**The `4^{-t}` constraint: what does "row `t` is a `t`-step image" actually
forbid?** This session closes the local route with a sharp constant and leaves
exactly one thing standing, which no session has touched. Rule 30 is
pre-injective (crystal 4), so `config ↦ row t` is **injective** on finite
configurations and only `2^{m−1}` of the `2^{m+2t−1}` words of span `m+2t`
occur as row `t` — a `4^{-t}`-sparse set, two bits of information destroyed per
step. That is a genuine, quantitative, *provable* constraint on a row, and it
is the precise sense in which the row is not free where the centre column is.
Yet §3 `C5` measures the seed's own row as locally indistinguishable from a
coin word at every block size to 16, so the whole of that constraint is
invisible to every local statistic — and `C2` shows that is not an accident,
since a local statistic cannot see past an invariant measure. **The question is
therefore: is there any computable description of the reachable set at all?**
Concretely and falsifiably: by surjectivity (crystal 3/6) every word is an
image, so being a 1-step image forbids nothing; is the same true of being a
`t`-step image *of a finite configuration*, for each fixed `t`, in the sense
that every word of the right span occurs in some *window* of such a row? A
negative — an explicit word of some length that occurs in **no** row of **any**
finite configuration's picture at depth `t` — would be the first
non-local constraint on a rule 30 row anyone has produced, and it is cheap to
search exhaustively at small `t` by enumerating preimages leftward from the
white tail. A positive, which I expect, converts this session's fence from
"local arguments cannot do it" into "nothing short of the full orbit can",
which is worth stating plainly because it would close the row marginal the way
crystal 40 closed the column. Either way it is decidable at small depth, which
is more than the row's other questions are. **Do not** send a session at a
`k`-block refinement of `C1`, at the cone as an escape from the ring, or at the
row excess: all three are closed above, with witnesses.
