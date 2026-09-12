# The `4^-t` constraint: what does "row `t` is a `t`-step image" actually forbid?

Sextant, theorist, 2026-09-12. My own next topic from
`docs/attacks/2026-09-12-the-row-count-b-t-*`, §6.

**How interesting a mathematician would find this, first, before anything
else.** The session's headline result is a **negative, and it is
project-internal**: the `4^-t` sparsity of the reachable set is real, it is
exactly describable, and it cannot be used for Prize 2, because rows of black
density arbitrarily close to `1` are `t`-step images of finite configurations
at *every* depth `t`. That closes the last route my previous session left open
and it says nothing new about rule 30 to anyone outside this project. Two
things inside it are worth more than that. The exact decision procedure (§3
`C2`) is a **new phrasing of a classical fact** — the Garden-of-Eden theorem
for finite configurations, Amoroso–Cooper 1970, attributed from memory and not
from a held text, see §3 — made constructive and two-bit-sharp for rule 30. And the measured size of the minimal automaton for
the reachable set (§3 `C4`) reproduces, to six digits at four of five points,
the nucleus forced-set sizes that Rowan's self-similar-group computation
produced on 2026-09-08 from a completely different vocabulary; that
cross-confirmation is worth having and is **project-internal** too. Nothing
here is novel about rule 30.

---

## 1. The residual, in one paragraph

Time runs down the picture. A *row* is one horizontal line of it; a *finite
configuration* is a row with only finitely many black cells, and rule 30 turns
each row into the next. Rule 30 is pre-injective (crystal 4), so two different
finite configurations never grow the same row: the map from a finite
configuration of span `m` to the row it becomes after `t` steps, which has span
`m + 2t`, is one-to-one. There are `2^(m-2)` configurations of span `m` with
black cells at both ends and `2^(m+2t-2)` words of span `m + 2t` with black
cells at both ends, so **only a `4^-t` fraction of the words that *could* be
row `t` actually are one** — two bits of information destroyed per step. That
is a genuine, quantitative, provable constraint on a row, and it is the precise
sense in which the row is not free where the centre column is (crystal 40 makes
the centre column an entirely free coordinate, so no statement about it can be
proved from the rule alone). My previous session closed the *local* route to
Prize 2 with a sharp constant `3/5` and left this as the one thing standing.
For the `4^-t` constraint to bear on the prize, it would have to be *usable*:
it would have to forbid some row the local argument allows — in particular it
would have to rule out rows of black density above `1/2`, since the local
method's window is `[0, 3/5]` and row balance is the single point `1/2` inside
it. The residual lives at the row, and — this is the session's one structural
finding — it lives specifically at the row's **left edge**, because the
backward solve that decides reachability sweeps right-to-left deterministically
and makes its only test there.

## 2. Why the known routes fail

Every obstruction that bears on this topic, and the two new dead ends this
session produced.

**From `docs/obstructions.md`.**

- *"The row marginal's local route is sharp at 3/5, and 3/5 is attained"* (my
  own entry, 2026-09-12). The one-block linear programme's exact optimum is
  `3/5`, attained by the genuine rule 30 orbit on the ring `10011`, so every
  `k`-block refinement has the same optimum; and the seed's own row has the
  block statistics of a coin word at every block size to 16. That entry names
  this topic as the only thing it does not cover, and this document is the
  answer: it does not cover it either, for a reason of the same shape.
- *"Prize 2's excess cannot be bounded through the half-line"* (Talus,
  2026-09-10). Its closing sentence — a P2 proposal about the centre column
  that does not name the cone is refuted in advance by crystal 40, and the row
  marginal is where the local law has purchase — is why the row was attacked at
  all. The row's purchase turns out to be exactly `3/5` and no more.
- *"Every re-reading of a centre-column cell is at bit-index speed 1 or 2"*
  (mine, 2026-09-10) and crystal 69. Not about rows, but the same shape of
  answer: a quantity that exists, is real, and is out of reach by a constant
  factor.
- *"The rule 30 edge group is not contracting"* (Rowan, 2026-09-08). This one
  turns out to be the same computation as `C4` below, in another vocabulary,
  and its conclusion is what stops the automaton description from ever being
  uniform in `t`.

**Routes I considered and did not take, because they are closed with witnesses
in my own previous document and the topic forbids them:** a `k`-block
refinement of the `3/5` bound (dead at the ring `10011`); the cone as an escape
from the ring (dead at span `4·10^6`, triangle density `0.599917`); the row
excess (dead against its own null, and in the *less* extreme direction).

**Two new dead ends, appended to `docs/obstructions.md` as one entry.**

- *The topic's own falsifiable question has no negative.* "Is there a word that
  occurs in **no** row of **any** finite configuration's picture at depth `t`?"
  — no, and not as a measurement but as a construction: §3 `C1`. Every word of
  every length occurs as a window of row `t` of a finite configuration, for
  every `t`, and the configuration is written down in `O(L + t)` time. So the
  hoped-for "first non-local constraint on a rule 30 row" does not exist in the
  window reading.
- *The `4^-t` constraint imposes no density ceiling, at any depth.* §3 `C5`:
  the same construction applied to the all-black word of length `L` gives, for
  every `t`, a finite configuration whose row `t` has black density at least
  `L / (L + 4t)`. Measured at `t = 40`, `L = 4000`: density `0.971875`. So
  conditioning the row bound on "this row is a `t`-step image" cannot move
  `3/5`, and P2 gets nothing from the sparsity.

## 3. Candidate claims

### C1 — every word is a window of a row at depth `t`, for every `t`

**The claim, in English.** Pick any pattern of black and white cells you like,
of any length. Pick any depth `t`. There is a configuration with finitely many
black cells whose picture, read across at row `t`, contains your pattern
somewhere. So "being a `t`-step image of a finite configuration" forbids
nothing *locally*: the reachable set has full factor complexity at every depth.

**In the project's vocabulary.**

    ∀ (t L : ℕ) (w : Fin L → Bool),
      ∃ c : Config, (∃ M, ∀ i, M < |i| → c i = false) ∧
        ∀ j : Fin L, evolveFrom c t (j : ℤ) = w j

**What it would give.** It is the fence, not a step towards anything. It says
the `4^-t` constraint is invisible to every statistic that reads a bounded
window of a row — which is the same conclusion my previous session's `C5`
reached by *measuring* the seed's row against a coin word, but here as a
theorem about the whole family rather than a measurement of one row. After it,
what remains of the constraint is entirely a statement about whole rows
including both cone edges, which is `C2`.

**Falsification.** `explorer/sextant9_window.mjs`. Two independent tests.
*Constructive*: for every `t ≤ 8` and every word of every length `L ≤ 16`
(`L ≤ 12` for `t ≥ 5`), solve rule 30 leftward `t` times from the word with the
free cells set white, pad the result with white on both sides, evolve `t` steps
forward, and read the window back — **688,110 `(t, word)` pairs, 0 failures**.
*By search, with no construction in it*: enumerate every finite configuration
of span `≤ 18`, evolve `t` steps, and collect every factor of length `n` of the
resulting rows — `64/64` at `n = 6` for `t = 1, 2`; `256/256` at `n = 8` for
`t = 3, 4, 5, 6`. Kernel: `explorer/sextant9_scratch_reach.lean`, theorem
`k1_window`, axioms `[propext]` — an explicit configuration whose row 4 shows
`101011` at positions `0…5`, checked by the kernel against `evolveFrom` itself.

*Distrust the result you like.* Three things could have produced a clean
survival other than the claim being true. The engine could be rule 86, rule
30's mirror — the failure mode that cost me a script two days ago; every file
here opens by checking the seed's rows `1, 111, 11001, 1101111` against the
engine and `1101111` is not a palindrome, so a mirrored engine fails it. The
construction could be self-confirming, testing the solver against itself rather
than against the automaton; the forward evolution is done by the *padded*
engine with no reference to the solve, and the brute-force factor sweep shares
no code with the solver at all. And the padding could be doing the work in a
way that is false for genuinely infinite pictures; it is not, and that is the
content — `evolveFrom_eq_of_agree_on_window` is exactly the statement that
padding outside the light cone cannot matter.

**Novelty.** **New phrasing of a known result.** The half that does the work is
in print twice: Wolfram 1986 §4, lines 447–456, "the surjectivity of the rule
implies that such a predecessor exists for any length `X` sequence ... there
are exactly four predecessors for any sequence", with the leftward solve
spelled out; and Fukś 2013 §2, line 75, "under the surjective elementary rule
every block has exactly four preimages", from Jen's preimage enumeration
(Complex Systems 3, 421–456). Those are statements about *blocks* under the
bi-infinite map. The step from a block to a finite configuration is the light
cone, which is the board's proved `evolveFrom_eq_of_agree_on_window`. Searched
`sources/` for `preimage`, `pre-image`, `predecessor`, `inverse`, `leftward`,
`solve`, `finite configuration`, `finite support`, `Garden`, `reachable`,
`image of`: 95 hits over 7 files, read at Wolfram §4 and §9, Fukś §1–2, and the
rule-22 Garden-of-Eden section. Nothing states the finite-configuration window
form.

**Route.** Real, and short. Cite crystal 3 (four preimages, the leftward solve
— not yet a node, and this is the second document to want it) for the solve,
and `evolveFrom_eq_of_agree_on_window` (proved) for the padding. Size M. The
one step that is actually work is the solve's induction: that the leftward
recursion applied `t` times to a word of length `L` produces a word of length
`L + 2t` whose forward image agrees with the original on the middle `L` cells.
That is `rule30_leftPermutive` (proved) plus bookkeeping.

### C2 — the reachable set is decided by a right-to-left sweep whose only test is two cells at the left edge

**The claim, in English.** A finite configuration has at most one finite
predecessor, and there is a one-pass procedure that finds it or proves there is
none. Read the row from the right; the predecessor's cells are forced one by
one going left, with no choice anywhere, because the only right tail consistent
with white-far-right is the white one. Keep going past the left end of the
row's black cells, and the recursion degenerates to "this cell is the OR of the
two to its right", which is white for ever if the two cells immediately left of
the row's support came out white and **black for ever otherwise**. So
finiteness of the predecessor is exactly two bits, and they sit at the left
edge. Iterating `t` times decides "is this row `t` of a finite configuration?"
in `O(t · n)` time, and the `t` pairs of bits are exactly the `4^-t`.

**In the project's vocabulary.** The uniqueness half is stateable now:

    ∀ (Y X X' : Config),
      (∃ M, ∀ i, M < |i| → Y i = false) →
      (∃ M, ∀ i, M < |i| → X i = false) → (∃ M, ∀ i, M < |i| → X' i = false) →
      rule30 X = Y → rule30 X' = Y → X = X'

which is crystal 4 (pre-injectivity) specialised. The existence half needs a
definition the board does not have: `whiteTailPreimage : Config → Config`, the
leftward solve seeded white at `+∞`, i.e. the `k = 0` case of
`leftSolve`-with-a-white-boundary. With it, the criterion is

    Y is a 1-step image of a finite configuration
      ↔ whiteTailPreimage Y is white at a - 1 and at a, where a = min support Y.

**What it would give.** It is the exact content of the `4^-t`, and it is the
reason the constraint is a *left-edge* statement about a *global* function of
the row. Everything else in this document is downstream of it: `C3` is the
observation that the global function cannot be replaced by a bounded one, `C4`
measures how big the smallest machine computing it is, and `C5` is what it
buys.

**Falsification.** `explorer/sextant9_criterion.mjs`. The criterion is compared
against brute force — enumerate every finite configuration of the right span,
evolve `t` steps, collect the rows — over every word of span `n` with black
ends, for every `t ≤ 6` and every `n` from `2t + 1` to `min(2t + 14, 20)`:
**2,258,262 words decided, 0 disagreements**, no false positives and no false
negatives at any `(t, n)`. The predicted count `2^(n - 2t - 2)` is exact at
every one of those `(t, n)` (the script prints a line when it is not, and
prints none). Finite-preimage uniqueness measured directly: 2,048 images from
configurations of span `≤ 12`, **0 with more than one finite preimage**.
Survival rate per backward step over all words of span 18 and 20:
`0.250000` at each of seven successive steps.

*Distrust the result you like.* The survival rate of exactly `1/4` at every
step looks like a measurement of two fair bits and **is not evidence of
anything** — it is the count `2^(n-2t-2)` restated, forced by injectivity, and
it would read `0.250000` whatever the mechanism. The real content is *which*
two bits, and that is structural rather than statistical. Separately, the first
version of this script had a false-negative rate of exactly `1/2` per step
(27,264 disagreements over the same sweep, all in one direction) because I
required the preimage's support to start at the same index as the image's; it
starts one cell in, since the cone shrinks by one going backwards. The
measurement was true of what it measured and false of what I took it to mean,
which is this project's recorded failure mode; what caught it was that the
survival rate printed `0.000000`, an impossible number for a procedure that is
supposed to be exact.

**Novelty.** **Known, as an existence statement; new phrasing as a procedure.**
The classical context is the Garden-of-Eden theorem for finite configurations:
Amoroso and Cooper 1970, cited as reference [29] of
`martinez-adamatzky-hoffmann-rule22.txt` (line 1298); the paper itself is not
held here. Moore–Myhill gives surjectivity on all configurations ⟺
pre-injectivity, which is crystals 4 and 6; Amoroso–Cooper gives surjectivity
*on finite configurations* ⟺ injectivity on all configurations, and rule 30 is
not injective (crystal 5, `rule30 (const true) = rule30 (const false)`), so
rule 30's finite-configuration map is injective and **not** surjective. That
the constraint exists is therefore classical and should not be reported as a
finding. **I am stating Amoroso–Cooper from memory of the classical result and
not from a held text** — only its title and its place in the rule-22
bibliography are in `sources/` — so a reader should treat the attribution as a
pointer to check rather than as a citation, and note that nothing in this
document rests on it: the sparsity is measured here directly, exhaustively,
against brute force. The nearest thing in print to the *criterion* is Wolfram 1986 §9,
lines 1251–1268: for a ring of size `N`, "a configuration has a unique
predecessor unless it contains a pair of value zero sites separated by a
sequence of `3n + 1` value one sites, or unless `N` is divisible by 3 and all
sites have value one", with the count of zero-or-two-predecessor
configurations growing like `K^N`, `K ≈ 1.696`. That is a **ring** statement
and the branching condition there is **local**; the finite-configuration
statement here is not (`C3`). Searched `sources/` for the terms listed under
`C1` plus `transducer`, `regular language`, `sofic`, `automaton recognis`,
`quiescent`: the white-tail form with its two-bit test appears nowhere.

**Route.** Uniqueness is crystal 4 and could be seeded today. Existence needs
`whiteTailPreimage` defined and two lemmas: that the recursion is forced
(`rule30_leftPermutive`, proved, and `sideways_inverse`, proved), and that left
of the support it degenerates to an OR whose fixed points are the two constants
— which is four Boolean cases. Size M, and the one step that is actually hard
is saying "white far to the right" in a form an induction can consume, since
`Config` carries no support. Worth seeding only alongside `C5`'s disclaimer.

### C3 — reachability is not a condition on a bounded prefix and a bounded suffix, at any width, at any depth

**The claim, in English.** The `4^-t` constraint is *not* the cone edges in
disguise. There are words whose first half matches the first half of a genuine
row at depth `t`, whose second half matches the second half of a different
genuine row at depth `t`, and which are not rows at depth `t` at all. The
smallest is five cells long: **`11101` is row 1 of no finite configuration**,
while `11011` is (of `101`) and `11001` is (of `111`), so `11101` has a legal
prefix `11` and a legal suffix `01` and is still unreachable. So no argument
that looks only at the ends of a row can decide reachability, and the
constraint genuinely couples the whole row.

**In the project's vocabulary.** Stated as the concrete witness, which is what
is checkable:

    ¬ ∃ c : Config, (∃ M, ∀ i, M < |i| → c i = false) ∧
        rule30 c = cfgAt 0 [true, true, true, false, true]

**What it would give.** It converts "the constraint exists" (classical, `C2`)
into "the constraint is global", which is the only form in which it could ever
have been the *first non-local constraint on a rule 30 row* the topic was
asking for. It is that — in the whole-row reading. It is also, by `C1`, not
available in the window reading, which is the reading a density argument would
need. So `C3` and `C1` together are the session's answer: the constraint is
global and therefore real, and global in a way no local statistic can touch.

**Falsification.** `explorer/sextant9_nonlocal.mjs`. For each `t` from 1 to 7,
enumerate the reachable set exactly at span `n = 2t + 10` (256 rows), then for
every half-width `L` from 1 to `⌊n/2⌋` test whether
`{black-ended words : prefix_L ∈ P_L and suffix_L ∈ S_L}` equals the reachable
set: **no `L` works at any `t`**, up to and including `L = ⌊n/2⌋`. The smallest
witness found by an upward search over `t` and `n` is `11101` at `t = 1`,
`n = 5`, and it is verified by hand in this paragraph's margin: with the
preimage's cells at `1, 2, 3` called `a, b, c`, the image on `0…4` is
`a, a∨b, a⊕(b∨c), b⊕c, c`, and `11101` forces `a = 1`, then `b∨c = 0`, then
`c = 1`, a contradiction. The single-cell flip profile says how far in the
coupling reaches: over all reachable rows at depth `t` and span `2t + 12`, the
fraction of single-cell flips that stay reachable, position by position, is

| `t` | flip survival, left end → right end |
|---|---|
| 1 | `0.000 0.000 0.500 0.500 0.500 0.625 0.688 0.719 0.766 0.805 0.832 0.883` |
| 2 | `0.000 ×4, 0.125 0.250 0.219 0.188 0.375 0.348 0.400 0.484 0.498 0.578` |
| 4 | `0.000 ×8, 0.008 0.043 0.020 0.055 0.090 0.070 0.125 0.125 0.145 0.104` |
| 8 | `0.000 ×19, 0.006 0.004 0.006 0.006 0.008 0.010 0.008` |

so at depth 8, **flipping any single cell anywhere in the row destroys
reachability with probability at least `0.99`** — which an edge condition of
any bounded width could not do.

Kernel: `explorer/sextant9_scratch_reach.lean`, theorems `k2_unreachable`,
`k3_prefix_control`, `k3_suffix_control`, axioms `[propext]`. `k2_unreachable`
quantifies over every one of the `2^11` configurations supported in `[-3, 7]`
and checks the image differs from `11101` somewhere in `[-4, 8]`; the reduction
to that window is the cone, argued in the file's header (a black cell at
`p ≥ 8` gives one at `p + 1 ≥ 9` after a step, so the image is not supported in
`[0, 4]`). `explorer/sextant9_scratch_mutant.lean` sits beside it as the
demonstration that the check can fail: the same statement with `11101` replaced
by the reachable `11011`, which Lean **rejects** at the `decide`, at the right
line.

*Distrust the result you like.* The first form of the kernel check compared the
image to `11101` on the five cells `0…4` only, and Lean proved it **false** —
correctly, because a configuration black outside `[0, 4]` can match the word on
a window while not being the configuration. That is the same window/whole-row
confusion this whole document turns on, made by me inside the file that is
about it, and the kernel caught it in one run. The corrected statement compares
configurations.

**Novelty.** **Project-internal; the technique is standard.** Computing the
image language of a cellular automaton as a regular language via the de Bruijn
subset diagram is the textbook method and is used in
`martinez-adamatzky-hoffmann-rule22.txt` §5 (lines 755–800) to list rule 22's
Garden-of-Eden configurations, with the resulting regular expressions in their
Table 5. Rule 30 is surjective, so it has no Garden-of-Eden *words* at all and
that literature has nothing to say about it; the finite-configuration image at
depth `t` is a different object and I found no treatment of it for any rule.
Searched `sources/` for `Garden`, `subset diagram`, `de Bruijn`, `regular
language`, `sofic`, `finite configuration`: hits only in the rule-22 paper and
in Schüle–Stoop's surjectivity discussion, neither about this.

**Route.** No route to the general statement, which is a statement about all
`L` and all `t` and is measured, not proved. The *witness* is a finite check
and is already kernel-verified modulo the cone reduction; seeding it would be
supply, and I would not.

### C4 — the minimal automaton for the reachable set has about `1.73^t` states, and it is the same object as the edge group's section set

**The claim, in English.** For each depth `t` the set of rows at depth `t` is a
regular language: reading the row from right to left, carrying the `t` levels
of the backward solve as state, decides it. The obvious state space is `4^t`.
The *minimal* one, measured to `t = 20`, is much smaller and still exponential:

| `t` | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| minimal states | 3 | 7 | 16 | 35 | 71 | 141 | 272 | 517 | 971 | 1792 |

| `t` | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
|---|---|---|---|---|---|---|---|---|---|---|
| minimal states | 3263 | 5873 | 10483 | 18619 | 32885 | 57741 | 100901 | 175680 | 304714 | 526563 |

with successive ratios falling steadily from `2.33` to `1.728` and an
exponential fit of `1.758^t` over `t = 11…20`. **And these are Rowan's
numbers.** Obstruction 11 ("The rule 30 edge group is not contracting",
2026-09-08) reports forced-set sizes `35, 532, 5873, 57741, 175680` at word
lengths `ℓ = 4, 8, 12, 16, 18`; mine at `t = 4, 8, 12, 16, 18` are
`35, 517, 5873, 57741, 175680`. Four of the five agree exactly, including both
six-digit entries, from code that shares nothing with theirs and a framing with
no group in it.

**What it would give.** Two things. It answers the topic's question — *is there
any computable description of the reachable set at all?* — with **yes, a finite
automaton, for each `t`**, which is a genuinely better answer than "run the
orbit". And it says the description cannot be made uniform: if the state counts
were bounded, one machine would decide "is this a `t`-step image" for all `t`
at once, and obstruction 11's computation says the rule 30 edge group is not
contracting, i.e. exactly that the section sets do not stabilise. So the honest
conversion of the fence is **"nothing short of the full backward orbit can"**,
with a measured price of `≈1.73^t` states for cutting the orbit off at depth
`t`.

**Falsification.** `explorer/sextant9_automaton.mjs` builds the full `4^t` state
space, trims to reachable states, and minimises by partition refinement;
`explorer/sextant9_automaton2.mjs` does the same by lazy breadth-first search
from the start state so that `t` can pass `4^t` being enumerable, and carries
the growth fits. Three cross-checks, all passed. Against the independent
backward-solve decider of `C2`, over **every** word of length `2t + 8` for
every `t ≤ 6` — `1` disagreement in each case, and it is the all-white word,
which is the empty configuration: it *is* a `t`-step image of itself and the
trimming decider rejects it by convention. Against brute-force enumeration of
finite configurations, at `t ≤ 5` and two spans each: the automaton's count of
accepted black-ended words of span `n` equals the enumeration's and equals
`2^(n-2t-2)` in all ten cases. And the state counts themselves against
obstruction 11, above.

*Distrust the result you like.* The agreement with obstruction 11 is the part I
most want to be true and so the part to be hardest on. **It is not complete: at
`ℓ = t = 8` they report 532 and I get 517.** I have not read `nucleus_*.cjs`
and am matching published numbers, so I cannot say which is right or whether
the two quantities differ by a boundary convention that happens to vanish at
the other four points. My own sequence is smooth in its ratios
(`…1.901, 1.878, 1.846…`) where theirs jumps (`1.97` then `1.82` across that
point), which is weak evidence that 517 is the correct value and 532 an
overcount, and weak is all it is. A second caution: the exponential fit
`1.758^t` is over ten points whose ratios are still falling monotonically, so I
cannot distinguish "exponential with base near `1.73`" from "a polynomial of
high degree" — a power-law fit over the same range gives `t^8.51`, which is
absurd as a model but not refuted by the data. What the data does settle is
that the counts are increasing and have passed half a million; whether they are
unbounded is not settled here and follows only from obstruction 11's
non-contraction, which that entry itself calls "settled for practical purposes
and unproved formally".

**One by-product worth recording, because it is crystal 49 in a form a finite
computation can settle.** `explorer/sextant9_fence.mjs` part (c) counts the
distinct length-`L` *prefixes* over all 16,384 rows at depth `t` grown from
every configuration of span 16:

| `t` | `L=4` | `L=8` | `L=12` | `L=16` | `L=24` | `L=32` |
|---|---|---|---|---|---|---|
| 2 | 2 | 23 | 268 | 3402 | – | – |
| 4 | 2 | 10 | 83 | 801 | 16384 | – |
| 8 | 2 | 2 | 18 | 100 | 5270 | 16384 |
| 16 | 2 | 2 | 4 | 8 | 187 | 4472 |
| 32 | 2 | 2 | 4 | 4 | 4 | 32 |

At depth 32, sixteen thousand different configurations produce only **four**
distinct 24-cell left ends. That is crystal 49's "there is only one left side of
rule 30, up to a translation along the edge" measured exhaustively over a whole
span class at each depth, rather than on a sample of 40 configurations, and it
is the reason the automaton's *acceptance* can live at the left edge at all.
The first three cells are `110` for every configuration at every `t ≥ 2`, which
is the board's `evolve_left_edge` / `evolve_left_second_diagonal` /
`evolve_left_third_diagonal` read across a row.

**Novelty.** **Project-internal, and it is a confirmation rather than a
finding.** The construction is the standard subset-diagram technique (see
`C3`); the numbers are obstruction 11's; the contribution is that they were
reached again from a different direction, which is worth more than either
reading alone, and that the `ℓ = 8` entry now has two values and needs
adjudicating.

**Route.** No route. This is a measurement and cannot be a node: the state
counts are outside kernel evaluation and `native_decide` is forbidden.

### C5 — the constraint imposes no density ceiling at any depth, so P2 gets nothing

**The claim, in English.** For every depth `t` and every `ε > 0` there is a
finite configuration whose row `t` is black on more than a `1 − ε` fraction of
its cells. So "row `t` is a `t`-step image of a finite configuration" does not
bound the row's black density away from 1, at any depth, and cannot sharpen
my previous session's `2b(t+1) + 3b(t) ≤ 6t + 9` or move its `3/5`.

**In the project's vocabulary.** `C1` with `w ≡ true`: the configuration it
produces has span `L + 2t`, its row `t` has span `L + 4t`, and `L` of those
cells are black, so the density is at least `L / (L + 4t)`.

**What it would give.** It closes the topic. It is a *consequence* of `C1`, so
it costs nothing extra, and it is what makes the whole `4^-t` story
project-internal rather than a Prize 2 result.

**Falsification.** `explorer/sextant9_maxdensity.mjs` runs the construction and
checks the black run really is there by forward evolution. At `t = 40`,
`L = 4000`: row span 4160, the 4000-cell black run present, **row density
`0.971875`** against the bound `L/(L+4t) = 0.961538`. At `t = 16`, `L = 4000`:
`0.987943`. At `t = 1`, `L = 4000`: `0.999500`. Every one of the 24 `(t, L)`
pairs tried has the black run present. Three supporting measurements.
`explorer/sextant9_fence.mjs` part (a): the ring `10011` planted as a genuine
finite configuration of span 200,001 has middle density `0.600002` at **every**
depth to `t = 60` and whole-row density `0.5999`, so my previous session's `3/5`
witness is a reachable row at every depth, not merely a bi-infinite orbit. Part
(b): the max and min density over *all* reachable rows at fixed `t` and growing
span stay in `[0.115, 1.000]` throughout `t ≤ 4`, and the earlier sweep in
`explorer/sextant9_density.mjs` has max density `0.833` and min `0.238` at
`t = 12`. And `explorer/sextant9_allblack.mjs`: the all-black word of span `n`
is a 1-step image **exactly when `3 | n`**, with preimage `(100)^k`, for every
`n` from 3 to 22 — which is crystal 25's ring Garden-of-Eden result (Wolfram
1986 §9, crediting the Feynmans: the all-black ring state has a predecessor iff
`3 | N`, and then exactly three, the rotations of `(100)^k`) reproduced here
under a *different boundary condition*, and it is the cleanest cross-check in
this document because it was not looked for. At `t = 2` the all-black row is a
2-step image at no span `≤ 24`, which is last session's "`(100)^k` is a dead
end" seen from the other side.

*Distrust the result you like.* This is a result I *dis*like, so the danger is
the opposite one and I checked it accordingly: the construction's black run
could be an artefact of the free cells being set white, in which case a
different free-bit choice might not work — irrelevant, since the claim is
existential and one witness suffices. It could be that the high density comes
entirely from the pad rather than the run — no: the run is `L` cells of a row of
span `L + 4t`, and the density printed is the *whole row's*, verified cell by
cell. And the low end (`0.000000`) is the degenerate empty configuration and
should not be quoted as evidence of anything.

**Novelty.** Immediate from `C1`, so it inherits `C1`'s status: **new phrasing
of a known result**. No separate search.

**Route.** Follows from `C1` in two lines once `C1` is a node. Not worth
seeding separately.

## 4. What survived

All five survived falsification, and four of them are fences rather than steps.
**`C1` is the one I would seed**, and only as a pair with `C5`'s disclaimer in
its `DOES NOT PROVE` field, because its entire value is negative: it says the
`4^-t` sparsity is invisible to every bounded-window statement about a rule 30
row, which is what a density argument would have to be. It needs crystal 3
(four preimages / the leftward solve) seeded first, and that crystal has now
been wanted by two separate attack documents, which is the strongest case for
it on the board. `C2` is the honest answer to the topic's actual question and
is worth seeding in its uniqueness half (crystal 4 specialised, cheap) if
anyone wants the vocabulary; its existence half needs a definition
(`whiteTailPreimage`) that nothing else uses. `C3` and `C4` are measurements
and cannot be nodes. `C5` is a corollary.

**The topic's falsifiable question is answered, and the answer is the one I
expected, for a reason I did not.** I expected a positive — every word occurs —
and predicted it would follow from surjectivity. It follows from surjectivity
*plus the light cone*, and the cone is doing more work than I gave it credit
for: it is what converts a statement about blocks (in print since 1986) into a
statement about finite configurations, and it is also why the `4^-t` constraint
survives at all as a whole-row statement while dissolving as a window
statement. The constraint is real, it is exactly describable by a right-to-left
sweep whose only test is two cells at the left edge, its minimal automaton has
about `1.73^t` states, it is not a cone-edge condition at any width — and it
permits rows of black density `0.97`. **So the `4^-t` constraint is a genuine,
quantitative, computable, global constraint on a rule 30 row that is useless
for Prize 2**, and the row marginal now closes the way crystal 40 closed the
column marginal: not because the row is free — it is not — but because the part
of it that is constrained is the part no density argument can reach.

One thing I am *not* claiming, and it is the temptation this document is
closest to: that the reachable set is useless for everything. It is not useless
for P1, and following the backward sweep's own state to the origin produced the
one thing here that opens rather than closes — §6. What this document rules out
is using reachability to bound a *count over a row*.

## 5. Claims that died

- **"There is a word occurring in no row of any finite configuration's picture
  at depth `t`"** — the topic's own hoped-for negative, and the reason the
  session was commissioned. Dies immediately and constructively: `C1`, 688,110
  `(t, word)` pairs at `t ≤ 8`, plus an independent brute-force factor sweep,
  plus a kernel instance. There is no such word at any depth.
- **"The `4^-t` constraint bounds the row's black density"** — my own hope for
  the session. Dies at `t = 40`, `L = 4000`: a finite configuration whose row
  40 has black density `0.971875`. The bound `L/(L+4t) → 1` makes it die at
  every `t` at once.
- **"The constraint is the cone edges in disguise"** — the alternative I
  expected to have to rule out with a long argument. Dies at span **five**:
  `11101` has a legal prefix and a legal suffix and is row 1 of no finite
  configuration. Hand-verified, kernel-verified, with a rejected mutant.
- **"The all-black row is never a `t`-step image"** — a guess made while
  reading the density table, where `max = 1.000000` appeared at `n = 12` and
  `n = 24` and I first read it as a bug. Dies at `n = 3`: `010` maps to `111`.
  The pattern is `3 | n`, which is crystal 25.
- **"The survival rate `1/4` per backward step measures two fair bits."** Not
  false, but empty: it is `2^(n-2t-2)` divided by `2^(n-2t)`, forced by
  injectivity, and would read `0.250000` under any mechanism whatever. I had it
  in the document as evidence for about an hour.
- **My first reachability criterion**, which required the preimage's support to
  begin at the same index as the image's. 27,264 false negatives over the
  sweep, exactly half at every step, because the cone shrinks by one cell going
  backwards. Caught by the survival rate printing `0.000000`, which is
  impossible for an exact procedure — the number was true of what it measured.
- **My first kernel form of `k2_unreachable`**, which compared the image to
  `11101` on the five cells of the word rather than to the *configuration* on
  `[-4, 8]`. Lean proved it false in one run, correctly: a configuration black
  outside the window can match inside it. That is the window/whole-row
  confusion this entire document is about, made inside the file that checks it.
- **"The minimal automaton sizes are new."** Dies on reading obstruction 11:
  four of my five checkable values are its published forced-set sizes, to six
  digits. What survives is the cross-confirmation and the discrepancy at
  `ℓ = t = 8` (517 against 532), which is unresolved and which I cannot settle
  without reading `nucleus_*.cjs`.
- **Nothing died for lack of depth.** Every death has a witness computed rather
  than searched for; the construction was tested over 688,110 cases, the
  criterion over 2,258,262 words against exhaustive truth, the automaton to
  `t = 20` and half a million states, the density to `t = 40` and span 4160,
  and the planted ring to `t = 60` at span 200,121.

## 6. Next topic

**Run the right-diagonal recurrence BACKWARDS: the cone condition the flat
tower fails, written inside the tower's own vocabulary.** I followed the
backward sweep's carried state to the origin to see whether it was a new
coordinate on the centre column, and it is not new — it is an old object nobody
has read in this direction, and that is better. At input position `p` the sweep
carries, at level `k`, the cell `(t − k, p − k)`; at `p = 0` those cells are
`(t − k, −k)`, and the line `{(t − k, −k)}` is `time − position = t`, which is
**right diagonal `t` at index `−k`**. So the sweep's state at the origin is the
*negative-index extension of a right diagonal*, and `rightDiagonal k j =
evolve (j + k) j` is perfectly well defined down to `j = −k`, where it reads
the **initial row** at position `−k`.

Four things measured in `explorer/sextant9_sweepstate.mjs`, seed's picture to
row 400, all with 0 failures. The recurrence `R_k(j+1) = R_k(j) ⊕ (R_{k-1}(j+1)
| R_{k-2}(j+2))` is invertible in `j`, so it runs **backwards**, and it holds at
40,198 cells including every negative index down to `j = −k`. Right diagonal `t`
read backwards from index 0 goes white exactly at index `−(⌊t/2⌋ + 1)` and stays
white — the cone boundary, at `t = 8, 16, 32, 64`. The boundary value is
`rightDiagonal k (−k) = initialConfig (−k)` at every `k ≤ 300`: `1` at `k = 0`
and white at every `k ≥ 1`. And the flat-tower witness `…10101|000` of the
obstruction *"The flat right-diagonal tower is a real picture"* gives boundary
values `1010101010101` instead.

**That is exactly the separating property that obstruction says the right half
does not have.** Its verdict is that no argument from the recurrence, the two
edge diagonals, or the initial row at `x ≥ 0` can decide whether the
right-diagonal periods grow, because all of them are shared with a picture where
the periods do not — and that the property that separates them is the existence
of a leftmost black cell, which lives outside the tower. It does not live
outside the tower. Run each diagonal backwards `k` steps and read the value at
index `−k`: the seed gives `1, 0, 0, 0, …` and the witness gives `1, 0, 1, 0,
1, …`. So the free bits `R_k(0) = centerColumn k`, which crystal 70's
obstruction correctly calls the quantity the tower does not determine, are **not
free once the backward boundary is imposed** — there is one constraint per `k`
on one free bit per `k`, and it is the cone.

The concrete falsifiable question for the next session, and it is cheap at
small depth: **what does "run right diagonal `k` backwards `k` steps and land on
white" say about `centerColumn k`, as an explicit condition?** Each backward run
is `k` applications of an invertible XOR-and-OR recurrence whose drivers are the
two shallower diagonals at their own negative indices, so the condition is a
Boolean function of `centerColumn 0 … centerColumn k` that can be written down
in closed form by symbolic execution for `k` up to a few dozen and whose
algebraic degree, support and sparsity are all measurable. Three ways it can
die, and the next session should test them in this order: the condition may be
*trivially satisfied* (an identity, forced by the recurrence rather than by the
cone), which is the likeliest death and would mean the boundary carries no
information; it may be *equivalent to the forward evolution* cell for cell, in
which case it is the picture restated and buys nothing; or its degree may grow
like `2^k`, in which case it is true, non-trivial, and unusable. A negative on
all three would be worth an obstruction entry, since it would close the last
place the cone and the right-diagonal tower touch. Do **not** send the next
session at the reachable set's density, its factor complexity, its automaton
size, or the window question: all four are closed above, with witnesses.
