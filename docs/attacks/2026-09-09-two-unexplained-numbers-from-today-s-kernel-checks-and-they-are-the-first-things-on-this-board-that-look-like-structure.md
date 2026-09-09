# Two unexplained numbers from today's kernel checks

Talus, 2026-09-09. Topic: the constants `16` in `leftDiagonal_onset_le_of_le_5000`
and `4` in `stepMod_preperiod_le_of_le_11`, and whether either is structure.

**The short answer, up front, because the rest of the document is the evidence.**
Neither number is structure. `16` is `2^5`, the largest eventual left-diagonal
period at or below depth 5000, and it is a coincidence of the range in the
sharpest possible sense: the least constant that works is a step function of `k`
that steps at exactly NKS p. 871's period-doubling depths `3, 8, 29, 400, 87867`,
so `16` works for every `k ≤ 87866` and **fails at `k = 87867`**, measured
directly at width 87868. `4` is the same number read over a smaller range: at
`k ≤ 11` the least constant is `4` for the orbit of `1` too, and the all-starts
statement is not closing faster than the single orbit, it is closing over
`k ≤ 11` instead of `k ≤ 5000`. Over one range the two constants agree; the
comparison that made them look backwards was between two different ranges.

---

## 1. The residual, in one paragraph

Time runs down the picture and the cone spreads one cell each way per row. Read
the leftmost `k+1` cells of row `t` — the cells at positions `-t` through
`-t + k` — as a binary number, bit `b` being the cell at `x = b - t`. That block
is *autonomous*: bit `b` of row `t+1` reads bits `b`, `b-1`, `b-2` of row `t` and
nothing above `b`, because the cone's left edge advances one cell per row in step
with the reading. So the leftmost `n` cells of the picture, row after row, are
exactly the orbit of the number `1` under one fixed bit-twiddle
`g_n(r) = (4r XOR (2r OR r)) mod 2^n`, and nothing about the rest of the row
enters. This is `rowNat_mod_eq_iterate` on the board. The wall
`leftDiagonal_onset_le` says every left diagonal `k` has entered its repetition
by index `k`; through `leftDiagonal_onset_le_iff_stepMod_return` that is exactly:
*for every `n`, the orbit of `1` under `g_n` has entered its cycle by step
`2(n-1)`.* Writing `pre(n)` for the preperiod of that orbit and `per(n)` for its
eventual period, the residual is the single inequality

> **`pre(n) ≤ 2n - 2` for every `n`.**

Measured, `pre(n)` sits at about `1.34 n` — see §3, C2 — so the wall has roughly
a third of its budget in hand and nobody can prove a bound of any kind. The
residual lives at the left edge of the cone, in the band between the edge and the
seam where the picture has not yet settled; it says nothing about the centre
column, and the centre cell of row `t` is bit `t` of a row that only has `2t+1`
bits, so it is never inside the window this residual is about.

## 2. Why the known routes fail

**Obstruction 6 — "iterating the reset lemmas builds a front that cannot
retreat"** is the route, and it is the one a Lean proof would actually run.
`leftDiagonal_periodicFrom_step_of_black` plus crystal 45's white branch give a
front `R(j)`: diagonal `j` is settled by the first black cell of diagonal `j-1`
past where `j-1` and `j-2` are both settled, or by one further index if `j-1` is
white from there on. Translated into this document's language and measured fresh
(`explorer/talus4_reset.mjs`, width 8000, rows to 16064, every diagonal
`2 … 7999`): the front reaches `R(j)/j = 1.67` at the end of the range with a
worst ratio of **2.049** at `j = 1214`, and the true onsets run at `0.337 j`.
Those two figures bracket obstruction 6's `2.00 k` and `0.336 k`, measured there
over a much longer range (160,000 rows) — the onset ratio matches to three
digits, the front ratio is between my endpoint and my worst window, so this is a
consistency check on obstruction 6 rather than an independent confirmation of its
exact value. The consequence in the residual's own units is new and is the number
to quote: at width 8000 the reset-front induction yields `pre(n) ≤ 2.674 n`
against a budget of `2n - 2`, **over by 33.7 %**, and obstruction 6's `2.00 k`
front at its own depth would put it at `3 n`, over by 50 %. Either way the
obvious induction is not merely loose, it is out of budget, and obstruction 6
says why — the real seam retreats and a monotone front cannot.

**Obstruction 4 — "the settled part of the left diagonals does not depend on the
centre column"** and **crystal 49 — "there is only one left side of rule 30"**
bear on §3's C3 and C4 and are discussed there; the short version is that they
describe the *settled words*, and this topic's questions are about which cycle a
picture lands on and how long it takes, which is the transient.

**The two ring/reachable-set entries** (the last two in `docs/obstructions.md`
before mine) are the other live route to the same wall and are disjoint from this
one: they bound the seam's speed from outside, where this document reads the orbit
from inside. The last addendum retracts the "exactly 1/2" reading, so nothing
there is available.

**A route I tried and killed, appended as the last entry of
`docs/obstructions.md`.**
"The verified range gives a *bounded* return period where the wall only asks for
some period, so prove that a fixed period works at every `k`." It is false, with
a witness at `k = 87867`; see C1.

**A route I tried and killed inside this session, not in the file.** "The branch
at an eventually-white diagonal is pinned by the reset lemma, which is why every
configuration has the seed's left side." False at every branch point; see §5.

## 3. Candidate claims

### C1. The constant is the doubling staircase, and it steps at `k = 87867`

**The claim.** For each `k` let `P(k)` be the least `p > 0` with
`rowNat (2k) ≡ rowNat (2k + p) (mod 2^(k+1))` — the least constant that
`leftDiagonal_onset_le_of_le_K` could use at depth `k`. Then `P(k)` is the
largest eventual period among left diagonals `0 … k`; since each such period is a
power of two (`leftDiagonal_periodicFrom_pow` with `minimalPeriod_dvd`), that
largest period is `2^(d(k))` with `d(k)` the number of period doublings at or
below `k`. NKS p. 871 puts the doublings at `3, 8, 29, 400, 87867`, so

```
P(k) = 1  (k ≤ 2),  2  (3 ≤ k ≤ 7),  4  (8 ≤ k ≤ 28),
       8  (29 ≤ k ≤ 399),  16  (400 ≤ k ≤ 87866),  32  (k ≥ 87867).
```

In the project's vocabulary: `P(k)` is the minimal `p` for which
`PeriodicFrom (leftDiagonal k) p k` holds for every diagonal at or below `k`,
which is `Nat.lcm` over `k' ≤ k` of `minimalPeriod (leftDiagonal k')` read past
its onset — and an lcm of powers of two is their maximum.

**What it would give.** It removes the topic's premise. `16` is not a bounded
return period that the wall did not ask for; it is the fifth rung of a staircase
that provably has no top, because `leftDiagonal_period_unbounded` is proved on
this board. A captain gets an exact rule for any future kernel range: the
constant for `k ≤ K` is `2^(d(K))`, so `k ≤ 87866` is the last range that closes
with `16`, and a `..._of_le_100000` would need `32`. What remains after C1 is the
whole wall: knowing the constant tells you nothing about whether the return
happens by row `2k`.

It also reconciles the two periods the topic asks about. The board's equivalence
`leftDiagonal_onset_le_iff_stepMod_return` uses `2^k` where the verified instance
uses `16`, and there is no tension between them: `P(k)` divides `2^k`, since
`P(k) = 2^(d(k))` and `d(k) ≤ k`. So `2^k` is a legal but wildly generous multiple
of the true minimal period, chosen because it is what `leftDiagonal_periodicFrom_pow`
hands over for free; `16` is the true minimal period over the whole tested range;
and the gap between them is the `k - d(k)` doublings that have not happened yet —
which is `leftDiagonal_period_le`, the other wall, in one phrase.

**Falsification.** `explorer/talus4_stair.mjs` computes `P(k)` exhaustively for
`k = 0 … 600` and reports the steps at `k = 0, 3, 8, 29, 400` and nowhere else —
NKS's first four doublings, hit exactly. `explorer/talus4_big.mjs` runs the
bit-packed engine at `k = 5000, 87865, 87866, 87867, 87868, 90000`, to row
`2k + 132`, and reports the last row at which the orbit differs from itself `p`
rows earlier:

| `k` | last diff at `p=8` | at `p=16` | at `p=32` | `2k` | least `p` working at `2k` |
|---|---|---|---|---|---|
| 5000 | 10132 | 6661 | 6677 | 10000 | **16** |
| 87865 | 175862 | 117339 | 117355 | 175730 | **16** |
| 87866 | 175864 | 117339 | 117355 | 175732 | **16** |
| 87867 | 175866 | **175866** | 117355 | 175734 | **32** |
| 90000 | 180132 | **180132** | 120117 | 180000 | **32** |

A `p` works at depth `k` exactly when its last-difference row is below `2k`. The
bold entries are runs that were still differing at the last row computed
(`2k + 132`), so `16` does not merely settle late at `k = 87867` — it has not
settled at all by then, while `32` settled 58,000 rows earlier.

So `16` survives to `k = 87866` and **dies at `k = 87867`**, the sixth NKS
doubling, to the integer. **Survives**, as a claim; the constant `16` does not.

*Distrust the result I like.* Three things could have produced this besides the
claim being true. (i) The bit-packed engine could be wrong: it is checked against
a BigInt implementation of the same map at 15 widths × 8 times, `120/120` agree,
before any large run (`talus4_big.mjs` prints the check). (ii) The staircase
positions could be my engine reproducing my own expectation: they are not, they
were computed from the recurrence alone and then compared to NKS, and separately
`explorer/talus4_cycles.mjs` recovers the eventually-white diagonals of the same
orbit as `2, 7, 28, 399, 53207, 58286, 87866` — obstruction 4's list, word for
word, from an engine that shares no code with the script that produced it.
(iii) "last diff never happens in range" is an *absence*, and my own notebook says
absences are the least reliable thing this instrument produces — so the table
reports both a positive (`p = 32` settles at row 117355, well before `2k`) and a
negative for the same `k`, and the two are read off the same run.

**Kernel confirmation.** `explorer/talus4_scratch_staircase.lean`, accepted by
`lake env lean` (exit 0), pins the step at `k = 400` in the kernel rather than in
a script: `rowNat 798 ≡ rowNat 806 (mod 2^400)` (so `8` still works at
`k = 399`); `rowNat 800 ≢ rowNat 808 (mod 2^401)` (so `8` breaks at `k = 400`);
`rowNat 800 ≡ rowNat 816 (mod 2^401)` (so `16` works there); and
`rowNat 10000 ≢ rowNat 10008 (mod 2^5001)` — so `16` is the *least* power of two
`leftDiagonal_onset_le_of_le_5000` could have used. Four `decide +kernel`.

**Novelty.** The periods themselves are in print: Rowland 2006 §5 (lines 830–835)
lists the eventual period lengths and proves the doubling criterion
(Proposition 2, Lemma 3), and NKS p. 871 gives the doubling depths including
`87867`; crystal 14 already holds both. What is not in print, and is the whole
of C1, is the identification of *this theorem's constant* with that staircase —
that the `16` in a kernel range is `2^(number of doublings below the range)` and
therefore has an exact expiry at `k = 87867`. Searched `sources/` for
`transient`, `preperiod`, `truncat`, `binary number`, `A110240`, `packed`,
`left side`, `onset`; the nearest statements are the two named above. Honest
category: **new phrasing of a known result, applied to a board artifact.**

**Route.** None is wanted: C1 is a fact about constants, not a step toward the
wall. If a captain wants it on the board, the seedable half is the cheap
direction — `P(k)` is a period of every diagonal `≤ k`, so the theorem
`leftDiagonal_onset_le_of_le_87866` with constant `16` exists and
`..._of_le_87867` with constant `16` does not.

---

### C2. Both left-diagonal walls are two inequalities about one orbit

**The claim.** Let `g_n(r) = (4r XOR (2r OR r)) mod 2^n`, let `pre(n)` be the
preperiod and `per(n)` the eventual period of the orbit of `1 % 2^n` under `g_n`.
Then

* `leftDiagonal_onset_le`  ⟺  `∀ n ≥ 1, pre(n) ≤ 2n - 2`;
* `leftDiagonal_period_le` ⟺  `∀ n ≥ 1, per(n) ≤ n`.

The first is the board's `leftDiagonal_onset_le_iff_stepMod_return` with `2^k`
replaced by `per(k+1)`, which is legitimate because `per(n)` divides `2^(n-1)`.
The second is new to the board. Its proof is two lines each way: `per(n)` is the
lcm over `k < n` of the minimal eventual periods of `leftDiagonal k`, each a
power of two by `leftDiagonal_periodicFrom_pow` and `minimalPeriod_dvd`, so the
lcm is the maximum; if every diagonal `k` has period `≤ k+1` then that maximum is
`≤ n`, and conversely the period of diagonal `k` divides `per(k+1) ≤ k+1`.

**What it would give.** One arithmetic object carrying both walls, in `ℕ`, with
no `Config`, no diagonal indices and no casts — the form the captain rule of
2026-09-07 asks for. It makes the two walls comparable for the first time: the
onset wall is a statement about how *fast* the orbit settles, the period wall
about how *slowly* its cycle grows, and they are about the same orbit at the same
widths. It also makes both walls one script away from any depth someone is
willing to pay for.

**Falsification.** `explorer/talus4_margin.mjs` sweeps every `n` from 1 to 3000,
computing `pre(n)` and `per(n)` exactly (a ring buffer against periods
`1, 2, 4, 8, 16, 32`, run to `2n + 128`). `per(n)` steps at `n = 1, 4, 9, 30, 401`
with values `1, 2, 4, 8, 16` — the same staircase as C1 in the `n = k+1` frame —
and `per(n) ≤ n` at every `n` in range with enormous room (`16 ≤ 401`). For the
onset half the worst ratio `pre(n)/(2n-2)` over `10 ≤ n ≤ 3000` is **0.8229**, at
`n = 49` (`pre = 79`, budget `96`); the asymptotic ratio is `0.667`.
`explorer/talus4_ring.mjs` extends `pre(n)` to `n = 5001` and
`explorer/talus4_nine.mjs` to `n = 120000`, where `pre = 159949` against a budget
of `239998`. **Survives** to `n = 1.2 × 10^5`.

*Distrust the result I like.* `pre(n)/n` is not constant — it runs `1.49` at
`n = 100`, `1.29` at `n = 401`, `1.34` at `n = 20000` — so the margin is a
measurement with visible drift, not a law, and the worst case sits at *small*
`n`, where the ratio is 0.82 rather than 0.67. The equivalence itself I checked
by consistency rather than by proof: the `per(n)` staircase computed here must
equal the maximum of crystal 14's per-diagonal periods, and it does, at all five
steps. What I have *not* ruled out is that some diagonal's minimal eventual
period fails to be a power of two — that is `minimalPeriod_dvd` applied to an
*eventual* period, and the board's `minimalPeriod` is defined for `PeriodicFrom f p 0`,
so a seeder would have to state the eventual version. I flag it rather than
assume it.

**Novelty.** The onset half is on the board (`leftDiagonal_onset_le_iff_stepMod_return`,
proved today) and this only replaces `2^k` by the minimal period. The period half
I found nowhere: Rowland 2006 proves the doubling criterion but states nothing
about the packed row; NKS p. 871 is a table; searched `sources/` for `binary
number`, `truncat`, `A110240`, `preperiod`, `period length`, `left side` — the
closest in print is Kopra 2022 Lemma 3.2, which is about the preperiod of a
*column* trace growing by `h` per step leftward (`h = 0` for a left-permutive
rule), a different object with a different index. Honest category: **the onset
half is a restatement of a board node; the period half looks new and is
elementary.**

**Route.** For the period half: `leftDiagonal_periodicFrom_pow` gives the
power-of-two periods, `periodicFrom_mul` and `minimalPeriod_dvd` give
lcm = maximum, `rowNat_mod_eq_iterate` moves it to the orbit. The one step that
is actually hard is nothing — it is bookkeeping, size M — which is exactly why it
is worth seeding: it puts the second wall in the language where the first one
already lives.

---

### C3. The all-starts route costs the same period and a strictly larger preperiod

**The claim.** Three parts.

(a) **Homogeneity.** `g_n(2^m y) = 2^m · (g_{n-m}(y) mod 2^(n-m))` for every
`m ≤ n`. So every start is `2^m` times an odd one at a smaller width, and the odd
starts carry the whole dynamics.

(b) **One cycle.** For every `n ≤ 24` the functional graph of `g_n` has exactly
one cycle meeting the odd numbers, and it is the seed's. Hence
`maxCycle(g_n) = per(n)`: quantifying over all starts buys no larger period, and
`stepMod_preperiod_le_of_le_11`'s constant `4` is the *same* `4` the orbit of `1`
has at those widths.

(c) **Strictly larger preperiod.** Writing `maxTail(n)` for the largest preperiod
over all `2^n` starts, `maxTail(n) > pre(n)` for every `n ≥ 5`. The hypothesis of
`leftDiagonal_onset_le_of_stepMod_preperiod` is exactly `maxTail(n) ≤ 2n - 2`, so
the all-starts route is **strictly stronger** than the single-orbit one — not
weaker, and not cheaper.

**What it would give.** It settles the topic's second and third questions. The
all-starts statement is not closing faster: over a common range the two constants
are equal, and the quantity the all-starts route must bound is the larger one. It
also says what "special about 1" means and does not mean: `1` is not special in
its *tail* (every odd start reaches its cycle) and is special only in its
*transient*, where it is the fastest to settle of everything measured.

**Falsification.** `explorer/talus4_allstarts.mjs` builds the whole functional
graph of `g_n` for `n = 1 … 24` — 16.7 M states at the top — and reports cycle
ids, cycle lengths and preperiods exactly, no sampling. Homogeneity is checked
separately at `151512/151512` instances. `explorer/talus4_maxtail.mjs` computes
`maxTail(n)` exhaustively to `n = 28` (268 M states, one byte each):

| `n` | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 |
|---|---|---|---|---|---|---|---|---|---|---|
| `maxTail` | 26 | 26 | 29 | 29 | 31 | 31 | 33 | 34 | 35 | 36 |
| `pre` | 20 | 20 | 23 | 23 | 25 | 25 | 27 | 28 | 29 | 30 |
| `2n-2` | 36 | 38 | 40 | 42 | 44 | 46 | 48 | 50 | 52 | 54 |

`maxTail(n) ≤ 2n-2` at every `n ≤ 28`, with `maxTail(28)/28 = 1.29` against
`pre(28)/28 = 1.07`. Past exhaustion, `explorer/talus4_branch.mjs` and
`explorer/talus4_cycles.mjs` run **2,072 uniformly random odd starts** at widths
`100, 401, 1000, 4000, 10000, 20000, 40000, 55000, 60000, 90000`: every one of
them settles by `2n`, every one lands on the seed's own cycle, and the largest
preperiod found exceeds the seed's by `0.2 %` at `n = 20000` (26902 against
26850). **Survives.**

*Distrust the result I like.* The 2,072 random starts measure the *typical*
start, not the worst one, and the exhaustive table says the worst start beats the
typical by 20 %: at `n = 28` the worst is `1.29 n` where the seed is `1.07 n`. So
"the all-starts route costs almost nothing" would be a claim my own data
contradicts, and I am not making it — what I claim is the ordering
`pre(n) < maxTail(n) ≤ 2n-2`, verified exhaustively to `n = 28` and by sampling
beyond. Part (b) is an *absence* at `n > 24` (no second cycle found in 2,072
draws) and I do not claim it there — C4 shows a second cycle demonstrably
exists at `n > 53208`, so the honest statement is "exhaustively one cycle to
`n = 24`, and no random start ever left the seed's cycle". A second thing that
could have produced (b): my cycle-identity function could be too coarse and merge
distinct cycles. It cannot be doing so at `n ≤ 24`, where the count comes from
graph structure and not from a hash, and C4 shows the same function separating
two cycles at `n = 55000`.

**Novelty.** The homogeneity is elementary and unstated anywhere I looked; it is
two lines (`4·2^m y = 2^m·4y` and `XOR`/`OR` commute with a shift). "One cycle
from odd starts" is Rowland 2006 §5's conjecture (lines 910–915: "there is really
only one 'left side' of rule 30"), which he calls *likely false*, and crystal 49
on this board, measured over 40 hand-built configurations; the contribution here
is that it is exhaustive at small widths and that 2,072 uniform random rightful
rows never break it. `maxTail(n)` I found tabulated nowhere; OEIS A363346 is the
per-diagonal transient, which is a different sequence (`maxTail(n) = max_{k<n}
(A363346(k) + k)` would be the single-orbit version, and even that is not the
all-starts one). Searched `sources/` for `transient`, `preperiod`, `all initial`,
`arbitrary initial`, `every initial`. Honest category: **(a) new and trivial,
(b) known as a conjecture and sharpened as a measurement, (c) new.**

**Route.** No route to the wall. What C3 says about routes is negative and
useful: an induction on `n` that proves the all-starts statement proves the
single-orbit one, so there is no reason to prefer the weaker target — but there
is also no free lunch, because the number to bound is bigger. The one positive
note is that the all-starts statement has no distinguished point, and `g_{n+1}`
projects onto `g_n`, so it is the form an induction on width would naturally
take; the naive version of that induction is dead (§5).

---

### C4. Rowland's second left side exists, explicitly, and no random row reaches it

**The claim.** Let `w` be an eventually-white left diagonal of the seed. On the
cycle, bit `w+1` obeys `x' = bit(w-1) XOR x` — a running XOR whose complement is
also a solution — so flipping bit `w+1` in a cycle state gives another point of
`g_n` whose flip never heals. Then:

* if the period *doubles* at `w+1` (`w = 399`, `w = 87866`), the flipped point
  lies on **the seed's own cycle**, at a different phase;
* if it does not (`w = 53207`, `w = 58286` — Rowland's complement-type branches),
  the flipped point lies on a **genuinely different cycle** of `g_n`;
* the second cycle at `w = 53207` has its own next eventually-white diagonal at
  bit **72575**, where the seed's is at 58286 — that is Rowland 2006's column
  72577 against his 58288, from an explicit witness;
* and no random odd row ever reached one of them. Denominator, because it is not
  the 2,072 of C3: a second cycle only exists at widths past 53208, so the rows
  that could have found one are the **140** sampled at `n = 55000, 60000, 90000`.
  All 140 landed on the seed's cycle. The other 1,932 were at widths where there
  is nothing else to land on.

**What it would give.** Rowland 2006 §5 (lines 930–946) identifies column 53209
as the first place the left side of rule 30 could branch, gives the two candidate
periods, and hedges: *"providing a counterexample to the conjecture **(if in fact
they do occur for some initial conditions)**"*. C4 closes half of that hedge and
sharpens the other half. The second period *does* occur — as an actual periodic
point of the truncated row map, exhibited, with its own branch structure matching
Rowland's prediction three digits deep. What is still open is whether it occurs
for a *reachable* row, and the measurement says: not in 140 tries at widths where
it could have. That is the exact statement crystal 49 and obstruction 5 want and
did not have, because their evidence was 40 hand-built configurations and no
witness for the road not taken.

**Falsification.** `explorer/talus4_branchcycle.mjs`: at `n = 1000` (`w = 399`)
and `n = 90000` (`w = 87866`) the flipped point settles onto a cycle whose state
set is identical to the seed's — same cycle, and bit `w+1` over one period is the
seed's word complemented, which for a doubled period is the seed's word shifted
by half of it. At `n = 55000` (`w = 53207`) and `n = 60000` (`w = 58286`) the
flipped point settles onto a cycle sharing no state with the seed's — a second
cycle. `explorer/talus4_rowland.mjs`, at `n = 80000`: the seed's eventually-white
bits are `2, 7, 28, 399, 53207, 58286`; the other branch's are
`2, 7, 28, 399, 53207, **72575**`. **Survives.**

*Distrust the result I like.* This one I like a great deal, so: (i) the "different
cycle" verdict is a *positive*, a state-set disjointness computed on 16 explicit
states of 80000 bits each, not an absence; (ii) the two control cases (`399`,
`87866`) come back "same cycle" from the same code, so the test can return both
answers and is not stuck on one; (iii) the prediction `72575` was Rowland's, made
in 2006, not mine, and the engine had no way to know it — it is the strongest
external check this session has, in the same class as the `87867` match in C1;
(iv) the flipped start settles far faster than a random one (preperiod 35739
against 106909 at `n = 80000`), which is what a state already agreeing with a
cycle at every level below `w+1` should do. What (iv) is *not* is an explanation
of the 140-for-140: the natural mechanism — that a reset pins the branch — is
false at every branch point (§5), so I have a suggestive number and no mechanism.
What 0 of 140 does settle is that the branch is not a fair coin for a random row —
that would be `2^-140`. What it leaves wide open is a branch taken with small
probability, which 140 draws cannot see. One caveat I owe: the parity
readings printed
alongside are counted over 16 states, so for a diagonal whose own period is 8 they
double-count; the white lists, which are the finding, do not depend on them.

**Novelty.** Rowland 2006 §5 states the branch structure including the columns
58288 and 72577 and explicitly does not establish that either branch occurs.
Crystal 49 and obstruction 5 record 40 configurations all taking the seed's word
at 53208 and branching next at 58287, "never at Rowland's 72577". The new content
is (i) that the second solution is exhibited as a periodic point and its branch
structure read off — 72577 is not merely never taken, it is where the road not
taken goes; (ii) that the doubling/complement distinction is verified as the
mechanism (Rowland states it in prose at lines 930–933, unverified in this
project); (iii) the sample, 140 uniform random rightful rows at widths past the
branch (2,072 across all widths) against 40 hand-built ones — an arbitrary odd
`x < 2^n` is the leftmost `n` cells of a row that is white further left, so each
draw is a rightful initial row in Rowland's sense. Searched `rowland-2006-*` for
`53209`, `72577`, `58288`,
`left side`; searched the other eleven files for `left side`, `branch`,
`negation`, `two possible`. Honest category: **a computed witness for a
statement in print that its author left conditional.**

**Route.** No route to the onset wall — C4 is about which cycle, not when. It
does bear on the *period* wall: the second branch has its next doubling in a
different place, so any argument about the gaps between doublings that uses only
the recurrence is arguing about a family with at least two members past 53208,
which is obstruction 7's point with a witness attached.

## 4. What survived

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

## 5. Claims that died

**"`maxTail(n) = pre(n) + 6`, attained at the start `x = 9`."** The exhaustive
table shows the worst start is `x = 9` at every width from 5 to 28 bar `n = 11`
(where it is 57), and that its
preperiod exceeds the seed's by exactly 6 from `n = 19` through `n = 28`; ten
consecutive widths with the same constant is a strong-looking pattern and I
believed it for an hour. It **dies at `n = 200`**, where `pre(9) - pre(1) = -14`,
and stays dead: `-1` at `n = 600`, `-10` at `n = 1000`, `-42` at `n = 4000` and at
every larger width to `n = 120000` (`explorer/talus4_nine.mjs`). Past `n ≈ 150`
the start `9` is *faster* than the seed, not slower. The `+6` was a small-`n`
artifact of the widths where the period is 4 or 8. What would have caught it
sooner: the pattern held only over widths where `per(n) ≤ 8`, and every constant
in this topic has turned out to be indexed by the period staircase.

**"The branch at an eventually-white diagonal is pinned by the reset lemma."**
The conjecture was that an eventually-white diagonal `w` is white only past its
own onset and still has black cells before it, so if one of those blacks sits at
or past the onsets of `w-1` and `w-2` then `leftDiagonal_periodicFrom_step_of_black`
determines diagonal `w+1` outright and no configuration can take the other
branch — which would have explained C4's 140-for-140 in one line.
**False at every branch point**, `explorer/talus4_pinned.mjs`, all seven whites
below 90000:

| `w` | 2 | 7 | 28 | 399 | 53207 | 58286 | 87866 |
|---|---|---|---|---|---|---|---|
| last black of `w` | −1 | −1 | 2 | 101 | 17908 | 19623 | 29457 |
| `max(onset(w-1), onset(w-2))` | 0 | 0 | 3 | 103 | 17910 | 19624 | 29459 |

The last black always falls **short by 1 to 3 indices** — the white diagonals are
precisely the ones that settle *before* their drivers, which is obstruction 6's
"skipped diagonals settle strictly before their neighbour" seen from the other
side. So the branch is genuinely free in the reset-lemma sense, C4's second cycle
is legitimate, and the reason no random row reaches it is not the reset lemma. I
have no mechanism for that, and say so.

**A premise of the topic, not a claim of mine, recorded because the next reader
will have it too.** "The all-starts statement closes with period 4 where the
orbit of 1 alone needs 16, which is backwards." The orbit of `1` does not need 16
at `k ≤ 11`; it needs **4** (`explorer/talus4_orbit.mjs`, exhaustive, `n ≤ 24`).
`16` is the constant the *other* theorem needed to cover `k` up to 5000. Over a
common range the two constants are equal, and by C3(b) they are equal at every
width computed, because the largest cycle in the whole graph is the orbit of 1's.

## 6. Next topic

**Attack `pre(n) ≤ 2n - 2` directly as an induction on `n`, with the all-starts
strengthening, and find out where the induction actually breaks.** Everything in
this document says the wall is now a one-line arithmetic statement about one
integer sequence with a third of its budget spare, and that the only induction
anyone has tried — the reset front of obstruction 6 — overshoots by 33.7 %, a
number I can now quote in the residual's own units. The question nobody has asked
is what the *cheapest* induction is that stays inside `2n - 2`: the reset front
spends the gap to the next black cell at every level, the truth spends `1.337` per
level on average, and the budget is `2`. A per-level accounting that is allowed to
*retreat* — which the reset front structurally cannot — is what the picture does,
and `leftDiagonal_step_onset_dichotomy` (crystal 45) already has the white branch
costing exactly one index. So the concrete target is: **is there an invariant,
carried across levels, under which `onset(k) + k ≤ 2k` is preserved by both
branches of crystal 45's dichotomy?** That is a Lean-shaped question with a
finite answer either way, it needs no new definitions beyond `pre` and `per`, and
a clean "no, here is the step where the white branch loses it" is worth as much as
a yes. Failing that, the second-best topic is C2's period half seeded as a node,
which is cheap and makes the second wall measurable.
