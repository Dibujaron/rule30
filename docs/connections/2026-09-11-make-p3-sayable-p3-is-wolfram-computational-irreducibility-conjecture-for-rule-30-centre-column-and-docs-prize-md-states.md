# Sighting: making P3 sayable, from the vantage of uniform complexity theory

*Pantograph, connector, 2026-09-11. Everything below is a sighting, not a
proof. The headline is positive, so it goes first rather than last.*

**Band, before anything else.** The main finding is **project-internal**: it
removes a hazard and opens a route, and says nothing new about rule 30. One row
of it is **known** and I cite it — the reading of P3 I arrive at is Wolfram's
own from 1986, and the sentence is in this repo's `sources/` directory. Nothing
here is novel.

**The finding.** The concrete uniform machine model `docs/prize.md` asks for
already exists in the Mathlib this repo is pinned to, and P3 is one line
against it. `Turing.FinTM2` is a bundled Turing machine carrying `Fintype` on
its stacks, its labels, its internal states and its input alphabet — uniform by
construction. `Turing.TM2OutputsInTime` counts applications of `step`, so cost
is *derived from the operational semantics and cannot be supplied*: trap one is
not merely avoided, it is unreachable, because there is no field to fill in.
And `Computability.encodeNat` is a binary encoding of `ℕ`, sitting twenty lines
above `Computability.unaryEncodeNat` in the same file: trap two is a choice
between two definitions, and the project can make it in the open. The statement

```lean
IsEmpty (Turing.TM2ComputableInPolyTime
           Computability.encodeNat Computability.encodeBool centerColumn)
```

elaborates today — `explorer/pantograph_scratch_p3.lean`, accepted by
`lake env lean` with no errors — and reads: *the centre column is not
computable in time polynomial in the length of the binary numeral for `n`*.
Section 3 argues that this, and not the Ω(n) bound `Prize.lean` states, is the
reading a complexity theorist signs off on; that it is what Wolfram wrote in
1986; and that his 2019 aside that the choice of model "ultimately doesn't
matter" is **true of this reading and false of his own 2019 threshold**.

The negative the brief also asked for, said plainly: **`Turing.TM0` and
`Turing.TM1`, the direction `prize.md` names as plausible, are unusable, and
for a reason `prize.md` has not noticed.** Their state and alphabet types carry
no finiteness constraint at all, so a TM0 machine may have infinitely many
states and a transition table that is an arbitrary function. Such a machine
reads the `log n` input bits into its state and halts, and P3 over TM0 is not
merely unprovable — it is **false**. That is trap one in a third costume:
uniformity, not cost, is the field being silently supplied.

---

## 1. The problem, seen from outside

An infinite row of cells, each on or off, all off but one. Every cell is
rewritten at each tick by the same rule applied to itself and its two
neighbours: *new = left XOR (centre OR right)*. Watch the single cell that
started on, and write a bit at each tick. That gives one completely explicit
infinite bit sequence, `1,1,0,1,1,1,0,0,1,1,0,0,0,1,0,1,1,0,0,1,…`. The
question is whether this sequence is **eventually periodic** — whether there is
any point after which it repeats forever with some fixed period, after any
finite amount of mess. Ten million terms have been computed and no period
found; nothing is proved. The residual this project carries is an implication —
*if this sequence repeats, some other cell's sequence repeats too* — which,
given the already-proved fact that no two cells' sequences can both repeat,
collapses to the bare claim that this one does not.

**The same thing in the vantage's own language.** Let `L₃₀ ⊆ ℕ` be the set of
ticks at which the watched cell is on. Present `n` to a machine as a binary
numeral, so the input has length `N = ⌊log₂ n⌋ + 1`. Then:

- If the sequence is eventually periodic then `L₃₀` is decided by a finite
  automaton reading the digits of `n` — a constant-size machine tracking
  `n mod p` — and so membership is decidable in `O(N)` steps. (Only one way
  round: C2's rule-90 witness is decided by such an automaton and is *not*
  eventually periodic. I wrote this row as an "iff" first and my own witness
  refuted it.)
- So the residual *follows from*: **`L₃₀ ∉ DTIME(poly(N))`**, i.e. the `n`-th
  bit is not computable in time polynomial in `log n`.
- Wolfram's third conjecture, as stated in 2019, asserts far more:
  `L₃₀ ∉ DTIME(O(2^N))` — an *exponential-in-the-input-length* lower bound.

Hence **P3 ⟹ P1**, and the vantage's question — which model makes P3 sayable —
is also the question of what would have to be written down for P1 to fall out
as a corollary. That implication is this document's load-bearing fact: it is
the test that separates an honest formalization of P3 from the two traps,
because *a formalization that does not imply P1 has not said what P3 says.*
Note what it also means for expectations: P3 is at least as hard as P1, and P1
is a wall. Stating P3 is the deliverable; proving it is not.

---

## 2. Fields sighted

| Field / theory | The object over there | The seam, in one line |
|---|---|---|
| **Uniform time complexity (DTIME)** | `L₃₀ = {n : c(n) = 1}` with `n` in binary; P3 = `L₃₀ ∉ DTIME(2^{o(N)})` | Every unconditional superpolynomial lower bound known for an *explicit* language goes through completeness, and a fixed sequence has no instances to reduce into |
| **Mathlib's own `Turing.FinTM2`** | The model itself: `Fintype` on `K`, `Λ`, `σ`, `Γ k₀`; cost = number of `step` applications; time a function of input *length* | One `step` executes a whole `Stmt`, so the count is right only up to a machine-dependent constant — fine for Ω, fatal for any exact-constant claim |
| **Machine-model invariance / extended Church–Turing** | Cross-model simulation costs a *polynomial*, not a constant | So Θ(n) is **not** a model-invariant threshold and "not polylog" is; Wolfram's "it ultimately doesn't matter" is exactly backwards for his own 2019 threshold |
| **Automatic sequences (Cobham, Allouche–Shallit)** | A sequence is `k`-automatic iff a DFA on the base-`k` digits of `n` gives the `n`-th term — the canonical shortcut class, `O(log n)` time | "Not automatic" is strictly weaker than P3 and strictly stronger than P1, and nobody can prove it either |
| **Bennett's logical depth** | A string with a short program, every one of which runs long — the only existing *definition* of "computationally irreducible" | Machine-relative up to an additive constant, and quantified over a significance level; it cannot pin any threshold, and no explicit object is proved deep |
| **Levin's `Kt` complexity** | `Kt(prefix of length n) = O(log n)`: the centre column is `Kt`-**shallow** | `Kt` charges `log(time)`, so it is blind to the entire gap between `polylog n` and `n` — the gap P3 lives in |
| **CA complexity: P-completeness of prediction** | The field's own no-shortcut theorem, proved for rule 110 (Neary–Woods 2006) | Its input is the *initial configuration* plus `t` in **unary**: the literature's own P3 sits inside trap two, necessarily — see C5 |
| **Succinct / compressed problems** | `n` in binary is a succinct description of "run `n` steps"; succinct problems are EXP-complete, and `P ⊊ EXPTIME` is a theorem | Needs the instance to vary; rule 30 fixes the seed, so the only thing still varying is the address |
| **Digit extraction / BBP formulas** | "the `n`-th digit without the first `n−1`" — the exact shape of a shortcut, realised for π | BBP buys **space**, not time: π's `n`-th hex digit still costs `Õ(n)`. P3's 2019 bound is satisfied by π as far as anyone knows |
| **Cryptographic next-bit unpredictability** | Rule 30 was Mathematica's PRNG; "no shortcut" = unpredictability | Needs a seed *distribution*; with the seed fixed a non-uniform adversary hard-codes the answer — the same death as circuit size |
| **Instance complexity** (Orponen–Ko–Schöning–Watanabe) | Per-input hardness, which is what `Prize.lean`'s pointwise `∀ n ≥ N` actually asks for | Defined only up to additive constants against a universal machine — it reintroduces exactly the arbitrariness trap one is about |
| **Circuit complexity / branching programs** | Non-uniform cost | Dead already (`prize.md`): `O(n / log n) < n`. Recorded with *why*: the cheap circuit is a lookup table of all `n` answers, and a table is not an algorithm |
| **Transcendence, digits of explicit reals** | "compute the `n`-th binary digit of `e`, of `ζ(3)`, of `√2`" | The identical wall: **no explicit real has a proved digit-extraction time lower bound either.** This is the company P3 keeps, and the best evidence that it is out of reach rather than merely unproved |
| **Symbolic dynamics: factor complexity** | `p(n)`, the number of length-`n` factors, as a cheap proxy for irreducibility | Linear `p(n)` ≈ automatic; but rule 30's own `p(n)` is unproved — measured 499,949 at length 32, proved nothing. A wall behind a wall |
| **Proof complexity / bounded arithmetic** | "P3 is independent of a weak theory" as an alternative deliverable | Nothing to hang it on; recorded so the next connector does not spend the hour I spent |

---

## 3. Connections

### C1. The model is `Turing.FinTM2`, and it is already in the pinned Mathlib

**The claim.** The concrete uniform machine model with binary input encoding
and step-counted cost that `docs/prize.md` says has not been built is already
built, in the Mathlib this repo is pinned to, and P3 against it is one line
with no new definitions, no `opaque`, and no hole.

**The dictionary.**

| This project | `Turing.FinTM2` / `TM2ComputableInTime` | Seam |
|---|---|---|
| "a program" | a `FinTM2`: `Fintype K`, `Fintype Λ`, `Fintype σ`, `Fintype (Γ k₀)`, plus `m : Λ → Stmt` | `Γ k` for work stacks is *not* required finite; harmless, because `push k (σ → Γ k)` reads only `σ`, which is finite, so at most `|σ|` symbols per push node and finitely many nodes — the reachable alphabet is finite. Checked by reading `Stmt`, not proved |
| "what it computes" | `TM2Outputs tm (input) (some output)`: `EvalsTo tm.step (initList tm l) (haltList tm l')` | The machine must also *empty the input stack* and *restore `initialState`*, because `haltList` pins both. A real wrinkle for whoever writes one |
| "what it costs" | `EvalsTo.steps`, the `k` with `(flip bind step)^[k] init = halt` | **Derived, not supplied.** There is no `cost` field to instantiate with `0`. Trap one is unreachable |
| "cost is honest" | nothing — no such predicate is needed | This is the whole point: `IsFaithfulCostModel` exists only because cost was data. Make cost a step count and faithfulness evaporates |
| "the input `n`" | `Computability.encodeNat n : List Bool`, on stack `k₀` | Binary, little-endian: `encodeNat 12 = [f,f,t,t]`. Length `⌊log₂ n⌋ + 1`; checked in the scratch file at `n = 1000, 1023, 1024` |
| trap two | `Computability.unaryEncodeNat`, same file, twenty lines down | The trap is a definition the project can name and refuse, not a subtlety |
| "the `n`-th centre cell" | `centerColumn : ℕ → Bool`, `eb = Computability.encodeBool` | none |
| "at least linear / polynomial" | `TM2ComputableInTime.time : ℕ → ℕ` applied to `(ea a).length`, or `TM2ComputableInPolyTime.time : Polynomial ℕ` | `time` is a *supplied upper bound*, proved. So "no machine is fast" is the right quantifier and "this machine is slow" is not directly sayable — see the test |
| "for all large `n`" | worst case over inputs *of a given length* | Mathlib's shape is per-length, which is the standard one, and it is **not** `Prize.lean`'s pointwise `∀ n ≥ N` — see C4 |

**What it leans on.** Mathlib source in this checkout, quoted by file and line.
`FinTM2`'s finiteness fields:
`.lake/packages/mathlib/Mathlib/Computability/TuringMachine/Computable.lean:46–71`.
The cost measure, and Mathlib's own statement of its granularity, same file,
lines 27–31: *"To count the execution time of a Turing machine, we have decided
to count the number of times the `step` function is used. Each step executes a
statement (of type `Stmt`); this is a function, and generally contains multiple
"fundamental" steps (pushing, popping, and so on). However, as functions only
contain a finite number of executions and each one is executed at most once,
this execution time is up to multiplication by a constant the amount of
fundamental steps."* The step count itself:
`Mathlib/Computability/StateTransition.lean:255–268`. The two encodings:
`Mathlib/Computability/Encoding.lean:23` — *"`encodingNatBool` : a binary
encoding of `ℕ` in a simple alphabet"* — and `:25` — *"`unaryEncodingNat` : a
unary encoding of `ℕ`"*.

**The test.** `explorer/pantograph_scratch_p3.lean`, run with
`lake env lean`: clean, one expected `sorry` warning for the handoff lemma of
C4 and nothing else. It elaborates `P3Core` (polynomial in input length),
`P3Unary` (the trap), `P3Wolfram` (the 2019 limsup form), `P3Linear` (the
`Prize.lean` Ω(n) form) and `ShortcutExists`, all against the same model. What
would kill this connection: if one `step` could do unbounded work — it cannot,
since `load`, `branch`, `peek` and `pop` all map into the finite `σ`; or if an
infinite work-stack alphabet could smuggle in information — argued above, not
proved, and it is the row a reviewer should attack first.

One further thing the test showed, which a prover will need: **the step count
of a halting run is unique.** If `(flip bind step)^[s] init = some h` with
`step h = none`, then every `s' > s` gives `none` and every `s' < s` gives a
configuration from which `h` is still reachable, so `s` is determined. Hence
"the cost of machine `m` at input `n`" is well-defined and Wolfram's literal
pointwise form is expressible after one small lemma — which is not in Mathlib.

**What it would give.** P3 sayable, with the `opaque IsFaithfulCostModel` hole
in `Prize.lean` closed rather than documented. What remains: everything about
rule 30. The statement would be open, not vacuous — which is the whole of the
change.

---

### C2. The threshold is polylog, not Θ(n) — and that is Wolfram's own 1986 statement

**The claim.** The only reading of P3 that is invariant under the choice of
machine model is *"the `n`-th bit is not computable in time polynomial in
`log n`"*; the Ω(n) reading that `Prize.lean` formalizes is not
model-invariant; and Wolfram himself stated the polylog reading in 1986, with
rule 90 as the control, in a paper sitting in this project's `sources/`.

**The dictionary.**

| Threshold | Statement | Invariant under change of model? |
|---|---|---|
| `cost ≥ n/k` (Ω(n)), `Prize.lean`'s `IsAtLeastLinear` | no machine beats linear in the *value* | **No.** A RAM running in `O(n)` becomes polynomially slower on a Turing machine (quadratically, in the usual simulations), so P3-for-TMs and P3-for-RAMs are different conjectures and one can hold while the other fails |
| `¬ O(n)` (Wolfram 2019's own formal shape: `limsup cost/n = ∞`) | no machine even matches direct simulation's linear-in-`n` idealisation | **No**, same reason, and strictly stronger than the row above |
| `∉ DTIME(poly(log n))` (Wolfram 1986) | no machine is polynomial in the *input length* | **Yes.** `poly(log n)` is closed under polynomial composition, so it survives any polynomial-overhead simulation — which is what the extended Church–Turing thesis actually asserts |
| constant factors | — | Meaningless even *within* Turing machines, by linear speedup |

**What it leans on.** Wolfram 1986 §8, held at
`sources/wolfram-1986-random-sequence-generation.txt:1168–1175`: *"In
particular, it could be that the problem of finding the value of a particular
site after t steps (given say a simply-specified initial state, as in Fig. 6.1)
must take a time polynomial in t on any computer. (Direct simulation takes
O(t²) time on a serial-processing computer, and O(1) time with O(t) parallel
processors.) For a linear cellular automaton such as that of Eq. (2.4), this
problem can be solved in a time polynomial in log(t); but for the cellular
automaton of Eq. (3.1) it quite probably cannot."* Eq. (3.1) is rule 30 and
Eq. (2.4) is the linear rule. Against that, Wolfram's 2019 prize page,
<https://writings.stephenwolfram.com/2019/10/announcing-the-rule-30-prizes/>,
fetched: the problem is *"Does computing the nth cell of the center column
require at least O(n) computational effort?"*, formalized there as *"there does
not exist a machine m which for all n gives c[n], and for which the lim sup of
the amount of computational effort spent, divided by n, is finite"*, with the
aside that the choice of model *"ultimately doesn't matter"* by universality,
*"within some basic constraints"*. Linear speedup, from
<https://en.wikipedia.org/wiki/Linear_speedup_theorem>: *"given any real c > 0
and any Turing machine using k tape(s) solving a problem in time f(n), there is
another such k-tape machine that solves the same problem in time at most
f(n)/c + 2n + 3"*.

Two consequences, and the second is the one that matters. First, the 2019
formal shape is *not* Ω(n): `limsup cost/n` finite means `cost = O(n)`, so
ruling it out asserts that every correct machine is **super**linear infinitely
often. `Prize.lean` states Ω(n), which is strictly weaker than the page it
cites. Second, universality gives invariance *up to a polynomial*, so it
licenses exactly the polylog reading and licenses nothing at all about a linear
threshold: **Wolfram's "it ultimately doesn't matter" is true of the 1986
statement and false of the 2019 one.**

**The test.** `explorer/pantograph_shortcut.mjs`, run. Rule 90 grown from one
black cell, to `t = 20,000`: its centre column is `1,0,0,0,…` (0 nonzero
entries after `t = 0`), and its **column 1** is black exactly at
`t = 1, 3, 7, 15, 31, …, 4095` — at `t = 2^j − 1` for `j ≥ 1`, with gaps
`2, 4, 8, …, 2048` that double, hence not eventually periodic. Its `n`-th bit
is *"are all the binary digits of `n` equal to 1"*, computable in one pass of
the input. So: **an elementary cellular automaton, same single-cell seed, with
an aperiodic column whose `n`-th bit costs `O(log n)`.** Any argument for P3
that uses only "an elementary CA grown from one black cell, simulable in `n²`
steps" is refuted in advance by rule 90 column 1, and aperiodicity does not
imply hardness.

**What it would give.** A statement that is faithful *and* stable, so that
"P3 holds" does not silently depend on whether the project picked stacks or
tapes. What remains: the gap between `poly(log n)` and `n`, in which no
technique exists from either side, and which the two readings disagree about.

---

### C3. `TM0`/`TM1`, the direction `prize.md` names, makes P3 false

**The claim.** Mathlib's `Turing.TM0` and `Turing.TM1`, as literally defined,
place no finiteness constraint on their state or alphabet types, so they are
**non-uniform** models; P3 over `TM0` with binary input is not open, it is
false; and the repair is precisely the `Fintype` bundle that `FinTM2` already
carries.

**The dictionary.**

| Intended object | `TM0` as literally defined | Seam |
|---|---|---|
| finitely many internal states | `Λ`, any type, `[Inhabited Λ]` only (`PostTuringMachine.lean:135`) | Take `Λ := ℕ` |
| a finite transition table | `Machine Γ Λ := Λ → Γ → Option (Λ × Stmt Γ)`, an arbitrary Lean function | With `Λ` infinite this is an infinite table, and may be noncomputable |
| a finite alphabet | `Γ`, any type, `[Inhabited Γ]` only | Less important; `Λ` alone does the damage |
| "every correct program costs ≥ n" | **false** | The machine below is correct and costs `O(log n)` |

The machine: `Γ := Bool`, `Λ := ℕ`, and the transition table that, in state
`λ`, reading input bit `b` at tape position `i`, moves right into state
`λ + b·2^i` — accumulating `n` into the state as it reads the `log n` digits —
and, on reading the end of the input in state `n`, writes `centerColumn n` and
halts. Every ingredient is a legal Lean term, `centerColumn` included. Total
cost: `⌊log₂ n⌋ + O(1)` steps. Ω(n) fails.

**What it leans on.** Mathlib's own docstring says it, at
`.lake/packages/mathlib/Mathlib/Computability/TuringMachine/StackTuringMachine.lean:36–38`:
*"All of these variables denote "essentially finite" types, but for technical
reasons it is convenient to allow them to be infinite anyway. When using an
infinite type, we will be interested in proving that only finitely many values
of the type are ever interacted with."* The finiteness is a *hypothesis
Mathlib adds where it needs it* (`Turing.TM0.Supports`, and the `Fintype`
sections at `PostTuringMachine.lean:548, 884`), not a property of the type.
`FinTM2` is Mathlib's own bundling of exactly those hypotheses.

**The test.** I did not build the machine in Lean; the construction above is an
argument, and a prover should either build it or refute it. What would kill the
connection: if `TM0.eval`'s halting convention or `Stmt` somehow forced a
finite `Λ` — it does not, `Stmt Γ` is `move`/`write` and carries no state — or
if the harness's `#print axioms` check would reject such a machine, which it
would not, since nothing here is noncomputable in a way `Classical.choice`
cannot supply.

**What it would give.** It closes the direction `prize.md` points at, and
redirects it two files over. What remains: nothing; this row is a correction,
not a route.

---

### C4. The litmus: an honest P3 must provably imply P1 *and* provably admit a shortcut

**The claim.** A candidate formalization of P3 is honest exactly when, for one
**fixed** model `M₀`: (a) the eventually-periodic-is-cheap lemma is provable in
`M₀`, so that `P3_{M₀} ⟹ P1` is provable; and (b) `M₀` provably admits a
machine that is fast on some genuinely aperiodic sequence. Both traps, both
recorded deaths, and `TM0` all fail this pair, and `FinTM2` passes it.

**The dictionary.**

| Candidate | (a) implies P1? | (b) admits a shortcut? | Verdict |
|---|---|---|---|
| `CostModel` with a `cost` field, no constraint | vacuously — the statement is **false** (`cost := 0`) | vacuously | Dead, and `prize.md` says so |
| …with faithfulness as a `Prop` field | same | same | Dead — the field takes `True` |
| `opaque IsFaithfulCostModel` (today's `Prize.lean`) | **no**: no model can be supplied, so nothing is derivable | **no**, same reason | Vacuous, and honestly labelled as such |
| `Nat.Partrec.Code.evaln` | **no**: `P3` is provable there, so it cannot imply an open statement | **no**: `evaln_bound` forces `n < k`, nothing is fast | Dead, for a sharper reason than "trivially true" |
| circuit size | — the statement is false | yes, by lookup table | Dead: the shortcut is a *table*, which is what "non-uniform" means |
| unary input, any real model | yes, but trivially — the statement is provable | no: reading the input costs `n`, nothing is fast | Dead: (b) is exactly the unary detector |
| `TM0`/`TM1` unbundled | — the statement is false (C3) | yes, and *everything* is fast | Dead |
| **`FinTM2` + `encodeNat`** | **yes**, modulo one lemma (below) | **yes**: rule 90's column 1, in one pass | **Passes** |

Why the pair and not just (a): a *false* P3 implies everything, so (a) alone is
passed by every degenerate model. Why not just (b): a model where nothing is
ever slow passes (b) and says nothing. The two together pin the statement
between the traps, and each is a small Lean obligation rather than a judgement.

**What it leans on.** For (a), the automatic-sequence characterisation, from
<https://en.wikipedia.org/wiki/Automatic_sequence>: *"The n-th term of an
automatic sequence a(n) is a mapping of the final state reached in a finite
automaton accepting the digits of the number n in some fixed base k"*, i.e.
`a(n) = τ(δ(q₀, s(n)))` with `s(n)` the base-`k` numeral. That an eventually
periodic sequence is such an automaton is a derivation, not a citation, and it
is the handoff of section 5: reading `encodeNat n` least-significant-bit first,
carry `(r, w) ∈ ℤ/p × ℤ/p` with `r ← r + b·w`, `w ← 2w`, alongside a counter
capped at the onset `N`; the state space is finite, so this is a legal
`FinTM2`, and it takes one `step` per digit.

**The test.** In `explorer/pantograph_scratch_p3.lean`:

```lean
theorem P3Core_implies_P1 (h : P3Core) : ¬ IsEventuallyPeriodic centerColumn
```

is proved, in two lines, from `periodic_polyTime` — which is stated with
`sorry` and is the one thing missing. `#print axioms` on it gives
`[propext, sorryAx, Classical.choice, Quot.sound]`, i.e. the `sorry` and
nothing else unexpected. For (b): `explorer/pantograph_shortcut.mjs` establishes
the rule-90 witness; in `FinTM2` its machine is "pop every input digit, halt
`true` iff all were `true`", `|input| + O(1)` steps.

**What it would give.** An audit any future P3 statement can be put through in
an afternoon, and — once `periodic_polyTime` is proved — a genuine derivation
of P1 from P3 inside this repo, so the two prize questions stop being
independent islands. What remains: the whole of P3.

---

### C5. The only known route to a proof is hardness for a class, and the fixed seed forecloses it

**The claim.** Every unconditional superpolynomial time lower bound known for
an *explicit* problem is a hierarchy theorem plus a reduction; P3's language
has nothing to reduce into, because the seed is fixed and the only varying
input is the address `n`; and the one mechanism Wolfram names as the reason to
believe P3 — universality — explicitly requires the very thing P3 forbids.

**The dictionary.**

| The field's machinery | Rule 30's P3 | Seam |
|---|---|---|
| `P ⊊ EXPTIME`, by the time hierarchy theorem | `L₃₀ ∈ E`: direct simulation is `O(n²)` = `2^{O(N)}` | The hierarchy gives a language *somewhere* in `E ∖ P`; it does not say which |
| "explicit lower bound" = completeness for a class | would be: `L₃₀` is hard for `E` under poly-time reductions — which would prove `P3Core` **outright** | A reduction must map an arbitrary instance `x` to an index `n(x)` with `c(n(x))` = the answer. That is an *address map into rule 30's picture*, strictly stronger than universality |
| CA prediction is P-complete (rule 110) | the field's own no-shortcut theorem | Its input is the *configuration* plus `t`; and `t` must be **unary**, or the problem is not in `P` at all and "P-complete" is unsayable. The literature's own P3 is trap two, by necessity |
| universality gives hardness | Wolfram 1986: this would follow "if the cellular automaton of Eq. (3.1) could act as an efficient universal computer" | …*"so that with an appropriate initial state, its evolution could mimic any possible computation"*. P3 fixes the initial state to one black cell. The premise of the only argument is excluded by the statement |
| succinct problems are EXP-complete | `n` in binary *is* a succinct "run `n` steps" | Succinctness makes a problem hard when the *described object* varies. Here it is always the same picture |

**What it leans on.** Time hierarchy, from
<https://en.wikipedia.org/wiki/Time_hierarchy_theorem>: *"If f(n) is a
time-constructible function, then there exists a decision problem which cannot
be solved in worst-case deterministic time o(f(n)) but can be solved in
worst-case deterministic time O(f(n) log f(n))"*, with the corollary stated
there as *"P ⊊ EXPTIME"*. Rule 110's P-completeness: the paper is
Neary and Woods, *P-completeness of cellular automaton Rule 110*, ICALP 2006,
confirmed by title in the works-cited of <https://en.wikipedia.org/wiki/Rule_110>,
which also records that *"Neary and Woods (2006) presented a different
construction that replaces 2-tag systems with clockwise Turing machines and has
polynomial overhead."* **UNVERIFIED**: that their prediction problem takes `t`
in unary. I could not fetch the paper — the Hamilton Institute PDF returned
undecoded binary and the Springer chapter redirected to an authentication
endpoint; searched "Neary Woods P-completeness Rule 110 cellular automaton
arXiv". The claim is however forced rather than reported: P-complete includes
membership in `P`, and predicting `t` steps takes time at least `t`, so `t`
must be part of the input in unary or the problem is not in `P` at all. And
Wolfram makes the same move himself for the finite-size question, at
`sources/wolfram-1986-random-sequence-generation.txt:1390–1392`: *"One expects
in fact that the problem of finding say whether two configurations lie on the
same cycle is PSPACE-complete"* — a statement about a problem whose input is a
pair of configurations.

**The test.** The precise statement to hand a theorist to falsify: *"`L₃₀` is
hard for `E` under polynomial-time many-one reductions."* If it held, `P3Core`
follows immediately from `P ⊊ EXPTIME`. Nobody believes it, and the cheap way
to attack it is to ask for the address map explicitly: exhibit any infinite
family of decision problems embedded in the index `n`. I could not kill it in a
session and say so.

**What it would give.** `P3Core`, outright, from a theorem already in the
literature. What remains: the hypothesis, which is almost certainly out of
reach and which nothing in this project's forty obstructions touches.

---

### C6. The company P3 keeps: no explicit sequence is proved deep, and no explicit real has a digit-extraction lower bound

**The claim.** P3 is not merely unproved; its *shape* — an unconditional time
lower bound for the bits of one fixed, explicitly-defined sequence — has no
successful instance anywhere in mathematics, and the fields that have tried
hardest (algorithmic randomness, and the digits of classical constants) have
each produced a definition and no theorem.

**The dictionary.**

| Over there | Here | Seam |
|---|---|---|
| Bennett's logical depth: a string whose near-minimal programs all run long | the centre column's length-`n` prefix: program = "rule 30, `n` steps", runtime `n²` | Depth is relative to a universal machine and to a significance level `s`; it cannot express a threshold, only a comparison |
| Levin's `Kt = |p| + log T(p)` | `Kt(prefix n) = O(log n)`: the centre column is `Kt`-**shallow** | `Kt` charges `log` of the time, so `polylog n` and `n` and `n²` are all the same to it. The measure is blind to the gap P3 is about |
| BBP digit extraction for π | the hoped-for shortcut for `c(n)` | BBP saves *space*, not time: the `n`-th hex digit of π still costs `Õ(n)`. So π satisfies Wolfram's 2019 bound too, as far as anyone knows |
| the digits of `e`, `√2`, `ζ(3)` | `c(n)` | Same wall: nobody has a lower bound for any of them either |

**What it leans on.** Bennett's definition, from
<https://en.wikipedia.org/wiki/Logical_depth>: *"The logical depth of x to the
significance level s is given by min{T(p):(|p|−|p*|<s)∧(U(p)=x)}"*.
**UNVERIFIED**: that no explicit sequence is proved logically deep, and that no
explicit real has a proved digit-extraction time lower bound. The Wikipedia
article's silence on examples is not evidence; I searched for Bennett logical
depth and for BBP-type formulas and found no counterexample, and a complexity
theorist should be asked directly. The `Kt`-shallowness of the centre column is
arithmetic, not a citation: the program is `O(1)` bits plus the `log n` bits of
`n`, and the time is `n²`, so `Kt = O(log n)`.

**The test.** None that I can run; this connection is a prior, not a mechanism,
and it is here to set expectations rather than to be attacked. The thing that
would overturn it is a single citation of an explicit sequence with a proved
superpolynomial per-bit time lower bound, and finding one would change what the
project should do next.

**What it would give.** Nothing directly. It is the reason to spend the
session's effort on *stating* P3 well rather than on attacking it, which is
what the vantage asked for anyway.

---

## 4. Died in translation

- **"Formalize P3 by axiomatizing faithfulness."** My first hour: replace
  `opaque IsFaithfulCostModel` with a list of axioms a cost model must satisfy
  (cost monotone, cost ≥ 1, composition sub-additive…). Died on the same
  witness every time: any finite axiom list is satisfied by a model whose
  programs are pairs (real program, inflated cost), or by one whose cost is the
  *true* cost of a *different* machine. **Cost cannot be constrained; it has to
  be derived.** That is why C1 is a machine model and not a better interface.
- **My own first litmus, "an honest P3 must provably imply P1."** Died in ten
  minutes: a *false* P3 implies P1 too, so the circuit-size model and the
  `cost := 0` model both pass. Repaired by fixing the model and adding the
  shortcut clause (b). Recorded because the one-sided version is the natural
  one to write down and it is worthless.
- **Rule 90 as the control.** `prize.md` names rule 90's Pascal-triangle
  structure as the contrast case, and the obvious control is *its* centre
  column. That column is `1,0,0,0,0,…` — eventually periodic, and so useless as
  a control: it cannot distinguish "cheap because it repeats" from "cheap
  because there is an algebraic shortcut". Died at the first run
  (`pantograph_shortcut.mjs`: 0 nonzero entries after `t = 0`, to `t = 20,000`).
  Repaired to rule 90's **column 1**, which is aperiodic and still `O(log n)`.
  The repair is the better control precisely because it separates P1 from P3.
- **My closed form for that column, off by one.** I wrote "black exactly when
  `t + 1` is a power of two" and the script found one mismatch, at `t = 0`,
  where `1` is a power of two and the cell is outside the cone. The correct
  statement carries `t ≥ 1`. A true formula with a wrong domain, which is this
  project's recorded failure mode; the script caught it and my reading of the
  first twenty terms had not.
- **"`Prize.lean`'s pointwise `∀ n ≥ N, n ≤ k · cost n` is the right shape."**
  It is the *fragile* shape: it is refuted outright by any infinite subsequence
  on which the centre column is cheaply computable — a program may hard-code a
  fast path for such a set and still need `n` steps everywhere else. The
  standard measure is worst case over inputs of a given length, which is what
  `TM2ComputableInTime` gives for free. I hunted the simplest easy subsequences
  and found none: every arithmetic progression with modulus `m ≤ 64` and the
  powers of two, to depth 65,536, and no class is constant on its tail
  (`c(2^k) = 10111011101011011` for `k = 0..16`; worst class imbalance
  `0.5478` over 1,214 terms at `1 mod 54`, which is 3.3 sd, and the maximum of
  2,079 fair-coin classes is expected near 3.4 sd). So the pointwise form is
  not *known* to be false — it is merely a stronger conjecture than anyone
  needs, resting on an extra claim nobody has stated.
- **Instance complexity as the rescue for the pointwise form.** It is the
  field that studies exactly per-input hardness, and it dies on arrival: `ic` is
  defined relative to a universal machine and only up to additive constants, so
  adopting it reintroduces the arbitrariness that trap one is about.
- **Cryptographic next-bit unpredictability.** The most tempting field, since
  rule 30 was shipped as a PRNG and "no shortcut" is what unpredictability
  means. Dies at the definition: unpredictability quantifies over a *seed
  distribution*, and P3 fixes the seed, so the adversary is allowed to hard-code
  `c` and every definition is trivially failed. Exactly the circuit-size death,
  reached from a different direction — which is worth knowing, because it means
  the two are one obstruction and not two.
- **Levin's `Kt` and algorithmic randomness generally.** The centre column is
  `Kt`-shallow (`Kt = O(log n)`), so no randomness-deficiency statement can be
  true of it, and `Kt`'s `log T` term makes it blind to the polylog-to-linear
  gap. Bennett's depth is the right notion and has no threshold in it.
- **Descriptive complexity / finite model theory.** Needs a class of finite
  structures to quantify over; one fixed sequence is not one. Died on
  inspection, in five minutes, and I record it so the next connector does not
  spend more.
- **Proof complexity / independence ("P3 is unprovable in PA").** No handle:
  nothing about rule 30 is known that would seed an independence argument, and
  an independence claim for a `Π⁰₂`-ish statement about an explicit sequence
  would be a bigger result than P3. Not attempted beyond the thought.
- **Factor complexity as a cheap proxy.** `p(n)` linear would make the sequence
  automatic-like and hence cheap; so a *lower* bound on `p(n)` looks like a step
  toward P3. It is a wall behind a wall: rule 30's `p(n)` is unproved, and
  obstruction 9's own measurements (499,949 factors of length 32 in a tail of
  `10^6`) are the same kind of evidence as the period searches.
- **Nothing died for lack of depth.** The two measurements here are shallow on
  purpose — 20,000 rows and 65,536 rows — because both are controls for an
  argument rather than searches for a phenomenon.

---

## 5. What to hand the theorist

**Topic 1, and it is the one I would spend the session on:
`periodic_polyTime`.** Prove, in Lean, with no rule 30 in it anywhere:

> for every `f : ℕ → Bool` that is eventually periodic, there is a
> `Turing.TM2ComputableInPolyTime Computability.encodeNat Computability.encodeBool f`.

*The claim to falsify:* that this is provable at all — a reviewer should first
check whether `haltList`'s requirement that the machine restore
`tm.initialState` and empty every non-output stack makes the construction
harder than it looks, since that is the step I would expect to cost a day.
*The dictionary row it depends on:* C1's "the input `n`" row — that
`Computability.encodeNat` is little-endian, so the machine pops the least
significant bit first and can carry `(n mod p, 2^i mod p)` in a finite state.
*What settles it:* a `FinTM2` with `σ = ZMod p × ZMod p × Fin (N+1)`,
`K = Bool`, one label, one `step` per input digit, and `time = X + c`. Done,
`P3Core_implies_P1` in `explorer/pantograph_scratch_p3.lean` becomes a
`sorry`-free proof that **P3 implies P1 inside this repo**, and `Prize.lean`'s
P3 can be restated against a real model. The same construction, one line
shorter, also gives the rule-90 shortcut witness that makes the statement
provably non-vacuous. Size: I would guess `L`, and I would guess wrong in the
direction of it being larger.

**Topic 2: adjudicate the threshold before anything is restated.**
*The claim to falsify:* that `∉ DTIME(poly(log n))` is the right formalization
of P3 and the Ω(n) form is not. *The dictionary row it depends on:* C2's
invariance column — specifically that a polynomial-overhead simulation
preserves `poly(log n)` and does not preserve `Θ(n)`. *What settles it:* a
complexity theorist's reading of the 1986 sentence against the 2019 one. This
is the "expert review" `prize.md` says P3 needs, and it is now a narrow
question with two quoted sentences rather than an open-ended one. Note the two
are not equivalent and both are sayable in the same model, so the project can
carry both — `P3Core` as the primary and `P3Wolfram` as the stronger variant —
and should not have to choose blind.

*Not handed over:* C5. E-hardness is the only route to a proof I can see, and
it is not a session's work; it is here so that nobody spends a session
rediscovering that completeness is unavailable.

---

## 6. Next vantage

**Descriptive set theory and computable analysis — specifically, the
computable-analysis reading of the centre column as a single real number.** The
whole difficulty of P3 is that the object is *one* sequence, so there are no
instances, no distribution, and no class to be hard for; every field I sighted
that has real lower-bound machinery needed a varying input and died at that
seam, and the three that did not — logical depth, `Kt`, instance complexity —
are precisely the ones defined only up to a machine-dependent constant. The
field that studies single real numbers as computational objects, and that has a
developed theory of how hard an individual point is to produce to precision
`2^{-n}`, is computable analysis; its notions (computable reals, the modulus of
convergence, polynomial-time computable reals in the sense of Ko and Friedman)
are *about* one object, and a polynomial-time-computable real is exactly one
whose `n`-th digit costs `poly(n)` — which is the shape of P3 with the
exponent moved. I could not reach it from where I stood: I spent the session
inside uniform machine models because that is what the vantage named, and by
the time the "one object, no instances" seam had appeared in four fields in a
row I had no hours left to test whether Ko's theory has a lower-bound technique
that survives having only one input. It might not — but it is the only field I
sighted whose *basic objects are single points*, and that is the property every
other field lacked.

A second, cheaper one for whoever wants a bounded question rather than a
vantage: **the theory of automatic sequences**, attacked not for P3 but for the
statement "the rule 30 centre column is not 2-automatic". That is strictly
between P1 and P3, it has a genuine decision procedure behind it (Walnut, and
the decidability of first-order statements about automatic sequences), and the
interesting thing is that the decision procedure runs on a *given* automaton —
so the question of whether the machinery can be run backwards, against a
sequence not known to be automatic, is exactly the same "one object, no
instances" seam in a setting small enough to settle in a session.
