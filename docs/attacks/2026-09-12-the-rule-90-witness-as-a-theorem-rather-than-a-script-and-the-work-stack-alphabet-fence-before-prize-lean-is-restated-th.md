# Attack: the rule-90 witness as a theorem, and the work-stack-alphabet fence

*Talus, theorist, 2026-09-12. Topic: my own next topic of this morning — make
the connector's litmus witness (rule 90's column 1) a Lean theorem rather than
a script, and fence the one row of the `FinTM2` model dictionary that was
argued rather than proved.*

**Band, before anything else.** The rule-90 closed form is **Known**, and old:
rule 90 from a single black cell is Pascal's triangle mod 2, and column 1 being
black exactly at `t = 2^j − 1` is Lucas's theorem applied to `C(t, (t+1)/2)`.
Wolfram 1986 has both halves of it informally for the linear rules (the
self-similar single-seed pattern, lines 334–336; "a time polynomial in log(t)",
lines 1172–1174) — though for **rule 60**, his Eq. (2.4), not rule 90. The
`FinTM2` machine is **Nothing**: a three-state automaton reading binary digits.
What is **project-internal**, and is the session's point, is that the two
together make the connector's litmus a *machine-checked* statement inside this
repo rather than a measured one — there is now a kernel-verified aperiodic
sequence with a polynomial-time `FinTM2`, so `P3Core` is not vacuous in the
direction that would make it true for a stupid reason, and any argument for P3
that uses only aperiodicity is refuted in advance. The **fence** is also
project-internal, and it is the one finding here that a mathematician would
call a fact rather than an exercise: Mathlib's `FinTM2` really does *not*
require its work stacks' alphabets to be finite — Mathlib's own TM2-to-TM1
simulator needs exactly the hypothesis `FinTM2` omits — and the reason that is
harmless is not "it obviously is" but a theorem about which symbols are
reachable.

*Status: all six sections current and final. Every claim below is checked; the
file names, the exact commands and the exact output are in each Falsification
paragraph, and each of the three has a mutant beside it that fails.*

## 1. The residual, in one paragraph

This topic has no wall in the picture; its residual is an obligation about a
machine model, and it comes in two halves. **Half one, the witness.** P3 says
the centre column of rule 30 is *computationally irreducible* — no shortcut.
Pantograph's connection of 2026-09-11 makes that sayable by putting it in
Mathlib's own bundled machine model as `P3Core := IsEmpty
(TM2ComputableInPolyTime encodeNat encodeBool centerColumn)`, and this
morning's session proved the half of non-vacuity that stops `P3Core` being
*provable-and-worthless*: every eventually periodic sequence has a fast
machine, so `P3Core` implies P1. But a model can be vacuous the other way too.
If the model were so weak that *nothing interesting* is fast, `P3Core` would
be true for a stupid reason and would say nothing about rule 30. The litmus
that rules this out needs a sequence that is **genuinely aperiodic** and yet
has a fast machine, and the natural one lives in the same picture: grow rule
90 — the XOR rule, the linear one — from the *same* single black cell rule 30
is grown from, and read the column one cell right of the origin. It is black
at times `1, 3, 7, 15, 31, …` and white everywhere else, so it is aperiodic;
and its `n`-th bit is "every binary digit of `n` is 1", which a three-state
machine decides while reading the digits once. So what must be true is a fact
about *one column of a different automaton's picture* — the column one cell
right of the origin, read down the page — together with a fact about a finite
automaton; neither is about rule 30, and both are entirely finite. **Half two,
the fence.** The model dictionary that licenses reading `P3Core` as
"rule 30 has no shortcut" has one row that was argued rather than proved: that
a `FinTM2` cannot cheat through a work stack whose alphabet is infinite.
Mathlib's `FinTM2` requires `Fintype` on the stack index `K`, the labels `Λ`,
the internal state `σ` and the **input** alphabet `Γ k₀` — and on nothing
else. So `Γ k` for a work stack may be `ℕ`, and both the symbols pushed onto
it and the pop handler that reads them are *arbitrary Lean functions*, which
need not be computable. If that were a real channel, `P3Core` would be false
for a stupid reason exactly as `TM0` made it false, and `docs/prize.md`
records that failure in those terms. What must be true is that the channel is
not real: that the symbols a `FinTM2` ever has on any stack come from a finite
set fixed by the program before the input is read.

## 2. Why the known routes fail

**No entry in `docs/obstructions.md` bears on this topic.** Every one of them
is about rule 30's picture — the transient band, the damage front, the
settled words, the row marginal — and neither half of this topic contains
rule 30 at all. The routes that do bear on it are the connector's recorded
deaths plus my own of this morning, restated in a sentence each, and two new
ones found here.

- **A cost model with a supplied `cost` field** (crystal 71; `docs/prize.md`
  "trap one"): dies because `cost := 0` satisfies any finite list of axioms.
  Cost must be *derived*, which `EvalsToInTime.steps` is.
- **Unary input** ("trap two"): dies because reading the input already costs
  `n`, so everything is slow and the statement is worthless.
  `Computability.encodeNat` is binary and little-endian, which both machines
  in this document depend on: they pop the least significant digit first.
- **`Turing.TM0` / `TM1`** (connector's C3): dies because their state types
  carry no finiteness, so `Λ := ℕ` reads `n` into the state and P3 over them
  is outright false.
- **Reading the litmus's shortcut half off `periodic_polyTime`** (my C3 of
  this morning): dies as *evidence*, not as a theorem. Parity is fast because
  it is periodic, so the two halves of the litmus were closed by the same
  lemma and were not independent. That is exactly why an aperiodic witness was
  needed, and is the whole reason for this session's half one.
- **Proving the rule-90 closed form from binomial coefficients mod 2**
  (Lucas / Kummer): not a dead end mathematically, but a dead end *here*.
  It needs `evolve90 t x = C(t, (t+x)/2) mod 2`, which is the analogue of
  `rowCell_eq_evolve` — a size-L theorem on this board — plus Lucas's theorem,
  plus the `2`-adic valuation of a binomial coefficient. The self-similarity
  route in §3 C1 needs none of that: two steps of rule 90 are one step at
  stride two, and everything follows by two inductions. Recorded so nobody
  reaches for `Nat.choose` first.
- **NEW dead end: the mirror check cannot guard this file.** The project has
  been caught twice by a row model that was rule 30's mirror and passed every
  symmetric test. The instinct here is to run the same guard. It is *worth
  nothing for rule 90*, because rule 90 is `left XOR right` and is
  amphichiral: its mirror is itself. Worse, the closed form is not even
  characteristic of rule 90 — **nine** of the 256 elementary rules have
  exactly this column 1 to `t = 120` (18, 22, 26, 82, 90, 146, 154, 210, 218;
  `explorer/talus9_rule90.mjs` §5), because the neighbourhoods the sparse
  Sierpiński picture actually presents do not separate them. So agreement with
  the closed form is not evidence that the engine has rule 90 right. What does
  guard it is checking the **lookup table** against `left XOR right` at all
  eight neighbourhoods, and having the kernel evaluate the board's own
  `ElementaryCA.step 90` against an asymmetric fact — the first seven rows of
  the cone. Both are in the files. Appended to `docs/obstructions.md`.
- **NEW dead end: "`FinTM2` requires finite stack alphabets, so there is
  nothing to fence."** This is what a reader of the structure's *name* will
  assume, and it is false:
  `Mathlib/Computability/TuringMachine/Computable.lean:46–70` carries
  `[kFin : Fintype K]`, `[ΛFin : Fintype Λ]`, `[σFin : Fintype σ]` and
  `[Γk₀Fin : Fintype (Γ k₀)]` — the **input** stack only. `Γ k` for every other
  `k`, the output stack included, is an arbitrary type. (In our use the output
  alphabet is finite anyway, but only because `outputAlphabet : tm.Γ tm.k₁ ≃
  Bool` forces it, not because the structure asks.) And Mathlib itself does not
  treat this as harmless: the tape alphabet of its **own** TM2-to-TM1 simulator,
  `Γ' K Γ = Bool × ∀ k, Option (Γ k)`, is a `Fintype` only under
  `[∀ k, Fintype (Γ k)]` (`StackTuringMachine.lean:349–358`) — a hypothesis
  `FinTM2` does not carry. So the fence has real content, it cannot be
  discharged by citing the structure's name, and it is not already in the
  library. Appended to `docs/obstructions.md`.

## 3. Candidate claims

### C1. Column 1 of rule 90 is black exactly at `t = 2^j − 1`, `j ≥ 1`

**The claim.** Grow rule 90 from `initialConfig`, the same single black cell
the prize questions use for rule 30. Then the cell one place right of the
origin is black at time `t` if and only if `t + 1` is a power of two with
exponent at least one. In the project's vocabulary the object is
`column initialConfig 1` for `ElementaryCA.step 90` rather than `rule30`; the
board has no name for "the picture of rule `r`", so the file defines
`rule90 := ElementaryCA.step 90` and `E t := rule90^[t] initialConfig` and
states `E t 1 = true ↔ ∃ j, 1 ≤ j ∧ t + 1 = 2 ^ j`. Nothing is missing from
`Rule30/Basic.lean` — `step` already takes the rule number as a `Fin 256`.

Alongside it, and needed by the litmus: `¬ IsEventuallyPeriodic (fun t => E t 1)`,
with `Rule30/Prize.lean`'s own `IsEventuallyPeriodic`, imported.

**What it would give.** Half of the litmus: a sequence in the same family of
objects as the centre column (an elementary CA, single black cell, one column
of the picture) that is provably not eventually periodic. With C2 it says the
model admits a fast machine for an aperiodic sequence, so `P3Core` is not true
for a stupid reason.

**A correction to my own next-topic paragraph, which is also the topic's own
framing, and it matters.** I wrote that this would make **"P3 is not implied by
P1" machine-checked**. Read literally that is a claim about rule 30 — that P1
holds and P3 fails — and it is *not* what is proved and is probably false;
nothing here says anything about rule 30's own centre column, and both prizes
are expected to be true. What is proved is the **schematic** statement: there
*exists* a sequence that is aperiodic and fast, so **no proof of P3 can proceed
from aperiodicity alone**, and none can proceed from anything shared by every
column of every elementary CA grown from one black cell. That is a fence on
proofs, not an implication between the prizes, and the difference is exactly
the well-formed-and-wrong shape this project keeps producing. The Lean
statement is written in the schematic form (`aperiodic_not_hard`) so it cannot
be misread. What remains after it is the threshold question — whether
`TM2ComputableInPolyTime` is the right side of the polylog-versus-`Ω(n)` line —
which is the connector's Topic 2 and which this document does not touch.

**Falsification.** Two engines and the kernel.
`node explorer/talus9_rule90.mjs`: a bit-packed row engine
(`r ↦ (4r) XOR r`) to `t = 200000` and an independent cell-by-cell engine
driven by the *lookup table* of rule 90 to `t = 600`, agreeing on columns 0, 1
and 2 at **0 mismatches**; the table itself against `left XOR right` at all 8
neighbourhoods, 0 mismatches; the closed form **0 mismatches to t = 200000**;
the three identities the Lean proof cites — parity (0 violations over the
whole cone to row 600), the stride-two step (0 violations), the scaling law
`E(2t)(2y) = E t y` (0 violations over 91,805 pairs) — and the column-1
recursion `E(2s+1) 1 = decide(s=0) XOR E s 1` at 0 violations to `t = 200000`.
Then the kernel: `lake env lean explorer/talus9_scratch_rule90.lean` is
accepted and prints

```
'Talus9.E_col1' depends on axioms: [propext, Classical.choice, Quot.sound]
'Talus9.col1_not_eventually_periodic' depends on axioms: [propext, Classical.choice, Quot.sound]
```

so this is a theorem, not a measurement, and the depth of the script is
beside the point except as a guard on the statement.

**Distrust the result you like.** What else could produce this?
*(i) The engine has rule 90 mirrored or mis-numbered.* The project's standard
guard is useless here (rule 90 is its own mirror), and — measured — the closed
form is shared by nine of the 256 rules to `t = 120`, so passing it is weak
evidence. What rules it out is the table check at all eight neighbourhoods and
a kernel `decide` comparing the board's own `ElementaryCA.step 90` picture,
cell by cell, against the first seven rows of the cone the script printed —
an *asymmetric* fact (the cone has a left edge and a right edge and the seven
rows are not palindromic in time). *(ii) The Lean statement is not the claim.*
The aperiodicity theorem is stated with `Rule30/Prize.lean`'s **own**
`IsEventuallyPeriodic`, imported rather than re-spelled — the witness file
`import`s `Rule30.Prize`. *(iii) A vacuously-true `iff`,
or a bound in the statement that is doing nothing.* The mutant
`explorer/talus9_scratch_mutant_col1.lean` drops `1 ≤ j` — the reading a
glance at the script's `isPowerOfTwo(t + 1)` suggests — and is **accepted**,
proving the mutated `iff` **false** at `t = 0`, where column 1 is white while
`0 + 1 = 2^0`. An accepted counterexample is a stronger instrument than a
rejected proof, so the exponent bound is load-bearing and demonstrably so.

**Novelty.** **Known, and old.** Rule 90 from a single cell is Pascal's
triangle mod 2; the closed form for column 1 is Lucas's theorem applied to
`C(t, (t+1)/2)`. Searched `sources/` for `rule 90`, `Rule 90`, `additive`,
`Pascal`, `binomial`, `Sierpinski`, `self-similar`, `nested`, `linear
cellular` — 78 hits across 8 files, read. Two are the nearest statements in
print, and **both are about a different linear rule, which is worth saying
precisely**: Wolfram 1986's Eq. (2.4) is **rule 60**, not rule 90
(`wolfram-1986-random-sequence-generation.txt:332`, "this is rule number 60 in
the scheme of [17]"), and line 352 says only that there are "several linear
rules similar to that of Eq. (2.4)". So (a) lines 334–336, "patterns generated
with arbitrary initial states can be obtained as appropriate superpositions of
the **self-similar** pattern produced with a single non-zero initial site", is
the informal form of C1's scaling law `E (2t) (2y) = E t y`, stated for rule 60
and covering rule 90 as a sibling; and (b) lines 1172–1174, "For a linear
cellular automaton such as that of Eq. (2.4), this problem can be solved in a
time polynomial in log(t)", is exactly the shortcut half of the litmus —
asserted, for rule 60, with no machine and no proof. Spencer 2013 and
Schüle–Stoop 2012 mention rule 90 by name (as an LFSR analogue and as the
standard positively-expansive example) and state nothing about this column.
Nothing in the held corpus states the closed form, and nothing needs to: the
novelty here is **zero**, and the value is that Wolfram's asserted shortcut is
now a theorem in this repo with clean axioms. The *proof route* is worth one
sentence of its own: the file avoids `Nat.choose` entirely, deriving everything
from "two steps of rule 90 are one step at stride two" — that identity is not
new either, it is rule 90's additivity, but it is a shorter path than Lucas.

**Route.** Proved. For a prover redoing it as a node: `rule90_eq` is
`rule30_eq`'s eight-case `rfl`; `E_add_two` needs the Bool identity
`xor (xor a b) (xor b c) = xor a c`; `E_of_odd` (half the picture is empty) is
one induction closed by `omega` on `2 ∣ x + t` over `ℤ`; `E_two_mul`
(`E (2t) (2y) = E t y`, the self-similarity) is one induction using
`E_add_two`; `E_center` and `E_col1` are strong inductions on `t` splitting on
`Nat.even_or_odd`. The only step that took thought is the backward direction of
the last one: from `2s + 2 = 2^j` with `s ≥ 1` one must first get `j ≥ 2`
before dividing.

### C2. A `FinTM2` computes it in `|input| + 1` steps — via a general automaton lemma

**The claim.** Rather than a second bespoke machine, one lemma that covers
this witness *and* this morning's `periodic_polyTime`: **any sequence decided
by a finite automaton reading `encodeNat`'s digits is `TM2ComputableInPolyTime`
with time `X + 1`.** Precisely, for a `Fintype` state `S`, a start `s₀`, a
transition `δ : S → Bool → S` and an output `out : S → Bool`, if
`out (List.foldl δ s₀ (encodeNat n)) = f n` for every `n`, then
`Nonempty (TM2ComputableInPolyTime encodeNat encodeBool f)`. The witness is
then the instance with `S = Bool × Bool` — `(some digit seen, all digits so
far are 1)` — and `f = fun t => E t 1`.

**What it would give.** The other half of the litmus, and a reusable block:
every future `FinTM2` witness in this repo that reads a number's digits once is
a corollary, so nobody writes a third machine — and, checked rather than
asserted, this morning's `periodic_polyTime` becomes a corollary too, so nobody
keeps the *first* machine either. After it, the model is provably non-vacuous in
both directions — periodic sequences are fast, and at least one aperiodic
sequence is fast — and the only open question about the model is the threshold.

**Falsification.** `lake env lean explorer/talus9_scratch_witness.lean`,
accepted, printing (the file repeats C1's rule-90 half verbatim rather than
importing it, because `explorer/` is not a `lean_lib` in `lakefile.lean` and
scratch files cannot import one another; `talus9_scratch_rule90.lean` remains
the standalone file for C1)

```
'Talus9M.dfa_polyTime' depends on axioms: [propext, Classical.choice, Quot.sound]
'Talus9M.rule90_col1_polyTime' depends on axioms: [propext, Classical.choice, Quot.sound]
'Talus9M.litmus' depends on axioms: [propext, Classical.choice, Quot.sound]
'Talus9M.aperiodic_not_hard' depends on axioms: [propext, Classical.choice, Quot.sound]
'Talus9M.periodic_polyTime' depends on axioms: [propext, Classical.choice, Quot.sound]
'Talus9M.P3Core_implies_P1' depends on axioms: [propext, Classical.choice, Quot.sound]
```

The last two are the check on the word "general", and they were **not** taken on
trust: the same file re-proves *this morning's* `periodic_polyTime` — and with
it `P3Core → ¬ IsEventuallyPeriodic centerColumn` — as a corollary of
`dfa_polyTime`, with the automaton carrying
`(n mod p, 2^i mod p, min(n, M), min(2^i, M))` and the 150-line machine of
`explorer/talus8_scratch_periodic.lean` gone entirely. So `dfa_polyTime` really
does subsume both witnesses, and the whole P3 connection now rests on one
general lemma plus two automata.

where `litmus` is the conjunction the connector actually wants — the sequence
is not eventually periodic **and** the model computes it in polynomial time —
and `aperiodic_not_hard` is the same fact in `P3Core`'s own shape:
`∃ g, ¬ IsEventuallyPeriodic g ∧ ¬ IsEmpty (TM2ComputableInPolyTime encodeNat
encodeBool g)`. The file imports `Rule30.Prize` and uses **its**
`IsEventuallyPeriodic`, not a re-spelling.
Beyond the proof the file makes the kernel *run* the machine: on
`encodeNat 7 = [true,true,true]` it halts in four steps with `[true]`, on
`encodeNat 5 = [true,false,true]` with `[false]`, and on `encodeNat 0 = []`
with `[false]` in one step — `7 = 2^3 − 1` is black, `5` and `0` are not.

**Distrust the result you like.** *(i) The automaton could be answering a
different question than the closed form.* The link is
`decide_digits`: the fold is `true` iff the digit list is non-empty and all
its entries are `true`, and a digit list is that iff the number is `2^j − 1`
with `j ≥ 1`. The second half is where an error would hide, because `val` is
*not* injective on lists (trailing `false`s are leading zeros: `[true,false]`
and `[true]` both denote 1), so "all ones" is a property of the
*representation* and the proof needs `encodeNat` to be canonical. It is, and
the file proves it: `encodePosNum n` always ends in `true`. Measured too —
`explorer/talus9_rule90.mjs` §4 checks canonicity and the fold against the
closed form for every `n ≤ 200000`, 0 mismatches. *(ii) The machine could halt
in the wrong configuration.* `haltList` pins the label, the internal state and
every stack; the proof ends each halting branch with
`load (fun _ => initialState)`, and this morning's no-`load` mutant is the
standing demonstration that Lean rejects the file without it. *(iii) `X + 1`
could be the wrong count.* The kernel runs above pin the exact step count on
three concrete inputs, including the empty one.

**Novelty.** **Nothing.** "A `k`-automatic sequence is computable in time
polynomial in `log n`" is folklore (Allouche–Shallit; not held in `sources/`).
Against Mathlib: `Turing.idComputableInPolyTime` is still the only
`TM2ComputableInPolyTime` witness the pinned library constructs, and it is the
identity in one step; this and this morning's are the second and third, and
the general lemma is the first one that is not a single machine.

**Route.** Proved. The machine is one stack (`K = Unit`, so there is no other
stack for `haltList` to demand empty), one label, `σ = Bool × S` where the
`Bool` is "the input is exhausted" — a flag that must live in `σ` because
`pop k f q` hands the popped `Option` to `f` and never to the continuation
`q`, so `branch` cannot see it otherwise. **A correction to my own next-topic
paragraph, which said `σ = Bool × Bool` ("exhausted, all digits so far one"):
that is one bit short.** Two states cannot distinguish "no digit yet" from "a
zero was seen", and they must be distinguished, because the empty list encodes
`n = 0`, where the answer is white, and "all digits are 1" is vacuously true
of it. The automaton needs three states and the machine's `σ` is three bits,
not two.

### C3. A `FinTM2` only ever handles finitely many stack symbols — the fence

**The claim.** For every `tm : FinTM2` there is a **finite** set
`S : Set (Σ k, tm.Γ k)` of (stack, symbol) pairs, depending on `tm` alone and
not on the input or the running time, such that every configuration reachable
from `initList tm l` — for every input `l` and every number of steps — has all
of its stacks' contents inside `S`. In the project's vocabulary there is
nothing to say: this is about Mathlib's model and no rule 30 object appears.

The reason it is true, and the reason it is the right statement: `push k f q`
pushes `f v` where `f : σ → Γ k` and `σ` is a `Fintype`, so each push node
contributes a finite image; `m : Λ → Stmt` with `Λ` a `Fintype` and each
`Stmt` a finite tree, so there are finitely many push nodes; and `initList`
puts symbols only on `k₀`, whose alphabet is a `Fintype` by hypothesis. So the
set of symbols that can ever be on any stack is finite and is fixed before the
machine starts.

**What it would give.** The row of the model dictionary that
`docs/prize.md` needs before `Rule30/Prize.lean`'s P3 is restated against
`FinTM2`. It closes the hazard in the form that actually bites, which is
**sharper than "an infinite alphabet"**: the pop handler
`f : σ → Option (Γ k) → σ` is an arbitrary Lean function of the popped symbol,
so if `Γ k` were `ℕ` and an unbounded symbol could reach `f`, the machine
would carry a non-computable oracle and `P3Core` would be false for a stupid
reason. The theorem says only finitely many arguments of `f` are ever
supplied, all of them fixed by the program, so `f` is a lookup table however
it was written. What remains after it is the *simulation*: turning "only
finitely many symbols occur" into "there is an equivalent machine with
`Fintype (Γ k)` for every `k`". That is routine and long, and this document
does not do it; see §4 for what that means for the captain.

**Falsification.** The engine here is the kernel.
`lake env lean explorer/talus9_scratch_fence.lean`, accepted, printing

```
'Talus9F.stackAlphabet_finite' depends on axioms: [propext, Classical.choice, Quot.sound]
'Talus9F.reachable_stack_mem' depends on axioms: [propext, Classical.choice, Quot.sound]
'Talus9F.pop_sees_finitely_many' depends on axioms: [propext, Classical.choice, Quot.sound]
```

The third is the corollary that names the hazard: everything a pop or peek
handler is ever applied to lies in `insert none (some '' S k)`, a finite set.

**Distrust the result you like.** The invariant could be preserved vacuously —
if the `push` case were never the one doing the work, the theorem would be
true about a set that does not need the pushes in it, and the fence would be
measuring nothing. So `explorer/talus9_scratch_fence_mutant.lean` deletes
exactly the `push` case's contribution and changes nothing else. It fails, and
it fails twice over, which is the point: Lean **rejects** the mutated
`stepAux_ok` at line 70, its `push` case, with
`... is expected to have type ⟨k, f v⟩ ∈ pushes (push k f q)`; and the second
half of the same file is **accepted** and exhibits a two-stack machine whose
work stack acquires a symbol the mutated alphabet does not contain
(`mutant_invariant_false`, axioms `[propext, Classical.choice, Quot.sound]`).
A rejected proof shows one tactic script failed; an accepted counterexample
shows the mutated statement is false, and this file carries both. Separately,
the set is not weakened to "some set": it is `Set.Finite`, proved, and it is
`⋃ l, pushes (m l)` together with the input alphabet, each finite for a reason
stated on its own.

**Novelty.** **Known, in the sense that it is folklore about stack machines**
— "a pushdown machine's stack alphabet may as well be finite" is not a theorem
anyone writes down. Against `sources/`: nothing there is about machines at
all. Against Mathlib: searched `Mathlib/Computability/` for `Fintype (Γ`,
`stackAlphabet`, `stack alphabet`. Exactly two hits, and **the second one is
the reason this fence has content rather than being a formality.**
`Computable.lean:68` is `FinTM2`'s own `[Γk₀Fin : Fintype (Γ k₀)]`, the input
stack only. `StackTuringMachine.lean:357` is
`instance Γ'.fintype [DecidableEq K] [Fintype K] [∀ k, Fintype (Γ k)] :
Fintype (Γ' K Γ)` — the tape alphabet of **Mathlib's own TM2-to-TM1
simulator**, `Γ' K Γ = Bool × ∀ k, Option (Γ k)`, which is finite *only* under
`∀ k, Fintype (Γ k)`. That is a hypothesis `FinTM2` does not carry. So on
Mathlib's own terms a `FinTM2` with an infinite work-stack alphabet is not
known to correspond to a single-tape machine with a finite alphabet at all,
and the question "does the infinite alphabet matter" is open inside the
library until something like this theorem is proved. There is no such lemma in
the `Computability` directory, and `FinTM2` is used in exactly one place
(`idComputableInPolyTime`), which sets `Γ _ := αΓ` finite by hypothesis and so
never meets the question.

**Route.** Proved. `pushes : Stmt Γ Λ σ → Set (Σ k, Γ k)` by structural
recursion, collecting `Set.range (fun v => ⟨k, f v⟩)` at each `push` node —
the **dependent pair** is what makes this painless, because collecting into
`∀ k, Set (Γ k)` forces a transport `h ▸ …` at every `push` and the induction
then fights `Eq.mpr` instead of doing mathematics. Finiteness is
`Set.finite_range` plus a structural induction. The invariant is one induction
over `Stmt` with the state and the stacks generalised, then one induction on
the number of steps.

## 4. What survived

All three, and all three are kernel-checked theorems with the project's
allowed axioms rather than measurements. **C1 and C2 together close the
connector's litmus**: `Talus9M.litmus` is, in one statement, "this sequence is
not eventually periodic, and Mathlib's model computes it in polynomial time",
and the sequence is one column of an elementary cellular automaton grown from
the same single black cell as rule 30's. So the model is now provably
non-vacuous in *both* directions — periodic sequences are fast (this
morning's `periodic_polyTime`, which makes `P3Core` imply P1) and at least one
aperiodic sequence is fast (here, which stops `P3Core` being true for a stupid
reason).

**The consequence a seeder should carry, and it is the shape of a filter
rather than of a lemma.** The witness is not merely *some* aperiodic sequence;
it is one column of an elementary cellular automaton grown from the *same
single black cell* as rule 30, and it is `O(log n)` — the very bottom of the
complexity range P3 is about. So **any argument for P3 whose only use of the
centre column is that it is aperiodic, or that it is a column of an elementary
CA from one black cell, is refuted in advance** — machine-checked, by
`Talus9M.litmus`. That is crystal 66's OR-to-XOR filter sharpened for the P3
region: crystal 66 kills a P1 argument by noting rule 90's *centre* column is
eventually white, and this kills a P3 argument by noting rule 90's *column 1*
is aperiodic and easy. A P3 proposal must name something the linear rules do
not have, and the nonlinear term `2r AND r` (crystal 59) is the only candidate
on this board.

**What I would seed first is C2's general lemma**, `dfa_polyTime`, not the
witness: it is the block both existing witnesses factor through, and that is
checked rather than hoped — `explorer/talus9_scratch_witness.lean` re-proves
this morning's `periodic_polyTime`, and `P3Core → ¬ IsEventuallyPeriodic
centerColumn` with it, as a corollary of `dfa_polyTime`, deleting the 150-line
machine of `talus8_scratch_periodic.lean`. So seeding it first replaces two
machines with one lemma and two tables, and every later `FinTM2` witness in this
repo that reads a number's digits once is a corollary too. C1 then seeds as a
small pair of rule-90 lemmas, and C3 as a standalone fence with no rule 30 in
it. **Concretely, the node I would propose is `dfa_polyTime` sized M**, with
`periodic_polyTime` and `rule90_col1_polyTime` as two size-S consumers above it.

**One caveat the captain should carry, stated plainly because it is the thing
that gates the prize file.** C3 proves that a `FinTM2` only ever *handles*
finitely many symbols. It does **not** prove the stronger statement that every
`FinTM2` is equivalent to one with all alphabets finite — that needs a
simulation (quotient each `Γ k` by "is it in `S k`", carry the machine across,
check the step relation), which is routine and which I did not write. So the
honest reading is: **the hazard is fenced, the model is not degenerate through
its work stacks, and the remaining gap is a construction nobody expects to
fail rather than an open question.** If the captain wants the stronger form
before restating `Prize.lean`, it is a size-L node, not a topic.

## 5. Claims that died

Nothing about any automaton died, and nothing died for lack of depth; every
death below is a shape of a statement or of its Lean proof, and the first two
are mine from the topic paragraph I wrote this morning.

- **"With both halves, 'P3 is not implied by P1' is machine-checked in this
  repo rather than measured."** My own next-topic sentence, carried into the
  topic verbatim, and it is the most dangerous line in this document because it
  is *nearly* right. Read literally it is a claim about rule 30 — P1 true, P3
  false — which nothing here proves and which is probably false; both prizes are
  expected to hold. What the witness gives is the schematic form: *some*
  sequence is aperiodic and fast, so no proof of P3 can go through aperiodicity
  alone. A fence on proofs, not an implication between prizes. Died on
  inspection while writing C1, and the Lean statement was rewritten as
  `aperiodic_not_hard` (an `∃ g, …`) so that the literal misreading is
  unavailable.
- **"`σ = Bool × Bool`, meaning exhausted and all-digits-so-far-one."** My own
  next-topic sentence. One bit short: the empty digit list encodes `n = 0`,
  where "all digits so far are 1" is vacuously true and the answer must be
  white, so the automaton must also distinguish "no digit yet" from "a zero
  was seen" — three states, and `σ = Bool × (Bool × Bool)`. Died at the
  definition, before any Lean. The same shape as this morning's death, where
  the connector's state was two components short: **a sketch that names a
  machine's state is a claim about its update rule, and the update rule has to
  be derived before the state is believed.**
- **"The mirror check guards the rule-90 file."** Died on inspection: rule 90
  is `left XOR right`, so its mirror is itself, and the project's standard
  guard against an orientation error is vacuous here. Worse than vacuous, in
  fact — the closed form itself is shared by nine of the 256 rules to
  `t = 120` (18, 22, 26, 82, 90, 146, 154, 210, 218), so passing it is weak
  evidence about which rule the engine is running. Replaced by the
  lookup-table check and an asymmetric kernel `decide` on the cone.
- **"Prove the closed form from `Nat.choose` mod 2."** Not false, but a much
  longer route: it needs the analogue of `rowCell_eq_evolve` (a size-L node
  here) plus Lucas's theorem. Abandoned on paper in favour of the stride-two
  identity, which needs neither.
- **"`FinTM2` already requires finite stack alphabets, so the fence is
  trivial."** Died at
  `Mathlib/Computability/TuringMachine/Computable.lean:46–70`: the `Fintype`
  instances are on `K`, `Λ`, `σ` and `Γ k₀` only. The output alphabet is not
  required finite either; it is finite in our use only because
  `outputAlphabet : tm.Γ tm.k₁ ≃ Bool` forces it. Mathlib's own TM2-to-TM1
  simulator needs the missing hypothesis explicitly
  (`StackTuringMachine.lean:357`).
- **"Collect the pushable symbols into `∀ k, Set (Γ k)`."** Died **on paper,
  not at a run** — I rejected it before writing it, so this is reasoning rather
  than a measurement and is flagged as such: every `push k f q` case would need
  a transport `h ▸ Set.range f` against the ambient `k'`, which is the same
  `Eq.mpr` fight `initList`'s own `dite` produces two paragraphs later.
  `Set (Σ k, Γ k)` has no transport and each case is one line. The one place
  the transport could not be avoided — `(initList tm l).stk k₀ = l`, where the
  `dite` cannot reduce because an abstract `tm`'s `DecidableEq` instance is
  opaque — is closed by `simp [initList]` and was the only part of the fence
  that needed a second attempt.
- **"The finite reachable set can be read off the initial configuration
  alone."** It cannot: `initList` puts the input on `k₀` and nothing
  elsewhere, but the program can push onto any stack, so the set has to be
  collected from the program text. Recorded because the first draft of C3's
  statement quantified over `l` in the wrong place, making it a statement
  about one input rather than about the machine.
- **Three Lean frictions, recorded for whoever writes the node.**
  (a) `rw [← val_encodeNat n]` to turn `n` into `val (encodeNat n)` rewrites
  *every* `n`, including the one inside `encodeNat n`, and produces the
  unprovable `... = 2 ^ (encodeNat (val (encodeNat n))).length`; state the
  equation as a `have` and rewrite forwards instead. (b) `Option.noConfusion`
  on `none = some c` fails with a universe metavariable where `simp at h`
  succeeds. (c) `by decide` cannot discharge `¬ tmEx.k₀ = true` — no
  `Decidable` instance is found, because `tmEx.K` does not reduce to `Bool` at
  instance transparency; state the hypothesis at `(false : Bool) = true`, where
  defeq does the reduction during elaboration, and use `Bool.false_ne_true`.
  All three are the same lesson as this morning's: **state a fact in the
  syntactic form the next tactic will see, not the form that reads best.**

## 6. Next topic

**The threshold, and it should not go to a theorist.** Both halves of the
model's non-vacuity are now machine-checked, and every remaining question
about `P3Core` is the one the connector named as its Topic 2 and that I was
told twice not to adjudicate: `TM2ComputableInPolyTime` asks for time
polynomial in the *input length*, which is `log n`, so `P3Core` says the
centre column has no `polylog(n)` algorithm — and `docs/prize.md`'s P3 asks
for `Ω(n)`, i.e. that no algorithm beats *running the automaton*. Those are
different statements and the gap between them contains every sub-linear
algorithm; the witness in this document sits at the very bottom of that gap
(`O(log n)`), which is precisely why it is a good litmus and precisely why it
says nothing about the threshold. That question wants a complexity theorist
and a decision about which statement the prize file should carry, not another
theorist session. **What a theorist should take next is the fence's remaining
half as a topic in its own right, or better, the P2/P1 board**: of the three
prize regions, P3 is now the one with the most recently built ground and the
least left that a theorist can move, while P1's residual is untouched since
2026-09-10 and every route into it closed that day. Concretely, I would send
the next theorist at **crystal 72's third clause** — a sufficient condition
for P1 over a *strictly smaller object* — with Groma's first-passage
reformulation (crystal 73) as the one candidate that has ever satisfied that
clause, and the instruction to find a second or to say plainly that the clause
is unsatisfiable.
