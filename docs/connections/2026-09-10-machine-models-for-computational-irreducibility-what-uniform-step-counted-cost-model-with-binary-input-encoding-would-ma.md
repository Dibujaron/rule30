# Sighting: `centerColumn_other_isEventuallyPeriodic_of_center` from the machine-model vantage

*Astrolabe, 2026-09-10. Vantage: what uniform, step-counted cost model with
binary input encoding would make Rule 30 Prize 3 a statement anyone can
attack?*

**The one-line answer, before the document.** `Turing.TM2ComputableInTime`
together with `Computability.encodeNat` is that model, it is in the pinned
Mathlib today, and the faithful P3 statement it supports is fifteen lines and
elaborates with no `sorry` and no opaque predicate
(`explorer/astrolabe_scratch_p3.lean`, run with `lake env lean`, clean) — with
one caveat that must travel with it, that the new statement is vacuously true
if no such machine can be exhibited and Mathlib currently exhibits only the
identity (§3.1, "the seam I nearly shipped without"). So the
expected negative — "no available framework can express this" — is **false about
the statement**. It is true, and worse than the brief suspects, **about the
proof**: no technique in print has a ceiling anywhere near the target, and the
one that does (diagonalization) needs an input channel that a fixed initial
condition does not have. And the whole exercise does not touch the node it was
commissioned against, because P3 *implies* P1 rather than the reverse; that
implication is also proved here, in three lines
(`explorer/astrolabe_scratch_bridge.lean`, axioms `[propext]`).

---

## 1. The problem, seen from outside

There is one completely explicit infinite sequence of bits. Write down a
doubly-infinite row of zeros with a single one in it. Repeatedly replace every
entry by *(its left neighbour) XOR (itself OR its right neighbour)*, all
entries at once. Let `b(t)` be the entry at the original position after `t`
rounds. The sequence `b(0), b(1), b(2), …` begins `1, 1, 0, 1, 1, 1, 0, 0, 1,
0, …`, has been computed past `10^10` terms, and passes every statistical test
anyone has run on it. What is unproved is the weakest conceivable structural
statement about it: that it is **not eventually periodic** — that there is no
`p > 0` and no `N` with `b(n + p) = b(n)` for every `n ≥ N`. That is the
residual. (The board's node is an implication whose hypothesis and conclusion
cannot both hold, so it is logically equivalent to that sentence; the
implication clothing is not doing work.)

**Restated in this vantage's own terms.** Fix `m` and let `n` range over the
integers with `m` binary digits. Then `n ↦ b(n)` is a Boolean function of `m`
input bits, and the family over `m` is uniform: one algorithm computes it for
every `m`, namely run the rule for `n` rounds, which costs about `n² = 2^{2m}`
bit operations. Wolfram's third prize question asks for a matching-ish lower
bound: **every** algorithm computing `b(n)` from the binary digits of `n` must
take at least `c · 2^m` steps for some `c > 0`. That is a running-time lower
bound *exponential in the input length*, uniform over algorithms, for one fixed
explicit function family — and it is not an exotic reading, it is what Wolfram
wrote. The residual sits strictly below it: an eventually periodic `b` is read
off a `p`-state finite automaton scanning the digits of `n`, which costs `O(m)`
steps, so the residual is the single lowest rung of the ladder that Wolfram's
question climbs in one step. Everything in this document is an attempt to
measure how far above the ground that ladder starts.

---

## 2. Fields sighted

| Field / theory | The object over there | The seam, in one line |
|---|---|---|
| **Formalized computability (Mathlib, this checkout)** | `Turing.TM2ComputableInTime`, whose `time : ℕ → ℕ` is applied to the *length of the encoded input* | It can **state** a step-counted bound; the only machine ever built in it is the identity, and poly-time composition is an unproved `proof_wanted` |
| **Binary vs unary encoding (Mathlib `Encoding.lean`)** | `Computability.encodeNat` (binary, little-endian) vs `unaryEncodeNat` | The same English sentence becomes two Lean statements an exponential apart; the file picks which |
| **Bounded evaluation of partial recursive functions** | `Nat.Partrec.Code.evaln`'s fuel `k` | `evaln_bound : x ∈ evaln k c n → n < k` makes `k` a bound on the *value*, not the work: a unary clock wearing a fuel costume |
| **Concrete complexity, time hierarchy** | `DTIME(f) ⊊ DTIME(g)` when `f log f = o(g)` | The separating language is built by diagonalization; it is not rule 30 and nothing says rule 30 is like it |
| **Succinct-instance complexity** (Williams, succinct QBF) | Problems whose input is a `log`-sized description of an exponential object — exactly our regime | Rule 30's "description" is the single integer `n`; there is no instance to reduce *into* it |
| **CA prediction complexity** (Neary–Woods, rule 110 P-complete) | `PREDICT`: given a configuration, a time and a cell, what colour? | The configuration is part of the input there and **fixed** here; the hardness lives in the channel rule 30 does not have |
| **Circuit complexity** (Shannon, Lupanov) | Maximum circuit size over all functions of `m` bits is `Θ(2^m/m)` | The target `2^m` **exceeds the maximum**, so the non-uniform version of P3 is not hard, it is false |
| **Uniform-to-non-uniform simulation** (Pippenger–Fischer) | `TIME(t) ⊆ SIZE(t log t)` | Caps *any* circuit-derived time bound at `2^m/m²` — the circuit route is dead by a `log²`, not merely dead |
| **Machine-independence / linear speedup** | `f(n)/c + 2n + 3` on `k > 1` tapes | No constant is ever pinnable, so `∃ k > 0` in `IsAtLeastLinear` is forced and correct; and it means "at least `O(n)`" can only ever mean `Ω` |
| **Computational irreducibility, formalized** (Zwirn–Delahaye) | A robust definition of "cannot compute step `n` without following the path" | They define the predicate and prove it does what it should; they give no way to establish it of a named system |
| **Logical depth** (Bennett) | The slow growth law: deep objects are not quickly made from shallow ones | Depth is *transferred*, never established ab initio; there is no technique for "this object is deep" from nothing |
| **Automatic sequences** (Cobham, Christol) | `c` 2-automatic ⟹ `c(t)` from `t`'s digits in `O(log t)` | The rung immediately above P1 — already measured on this board (Parallax, 2-kernel ≥ 130,553 at depth `2^21`) |
| **Additive cellular automata** (Lucas, Kummer, Frobenius) | Rule 90's cell is a binomial parity; rule 150's is a trinomial one | P3 is **false** for both, by a two-line closed form verified here — so P3 is a claim about the `OR`, not about cellular automata |
| **Proof-assistant complexity theory** (Balbach, Isabelle/AFP) | Multi-tape TMs, `P`, `NP`, poly-time reduction, Cook–Levin | 18 theory files to reach a theorem *far* weaker than any lower bound; the cost of the ground floor is measurable and it is not small |
| **Blum speedup / Borodin gap theorems** | Functions with no best algorithm; time bounds with empty hierarchies | A warning rather than a route: "the complexity of `b`" need not be a well-defined thing at all |

---

## 3. Connections

### 3.1 Mathlib can already state Prize 3 faithfully, and `IsFaithfulCostModel` can be replaced today — at the price of one named lemma

**The claim.** `Rule30/Prize.lean`'s "faithfully formalizing P3 requires
committing to a concrete uniform machine model with binary input encoding and a
step-counted cost … That work has not been done" is out of date with respect to
the Mathlib it is pinned against: the model exists, the binary encoding exists,
the step count exists, and the faithful statement is fifteen lines. The opaque
predicate is not standing where a mathematical gap is; it is standing where a
library lookup is.

**The dictionary.**

| This project's object | Mathlib, pinned commit | Notes / seam |
|---|---|---|
| `CostModel.Program` | `Turing.TM2ComputableInTime ea eb f` — a bundle of a finite two-stack machine, alphabet equivalences, a time function and a proof it meets it | **Universe seam, checked:** the bundle is `Type 1`, because `FinTM2` quantifies over an alphabet family `Γ : K → Type`. `CostModel.Program : Type` is one universe too small. One-character fix |
| `CostModel.output p n` | the structure's `outputsFun` field, which *forces* the machine's output to be `eb (f a)` | The structure bakes correctness in, so `ComputesCenterColumn` is not a separate hypothesis but part of the type. Cleaner, and it is why `∀ h` reads as "every correct machine" |
| `CostModel.cost p n` | `h.time ((encodeNat n).length)` | **Seam, and the real one:** `time` is a function of the input *length*, not of the input. So the statement is "some `n` of each length is slow", not "every `n` is slow" — weaker than `IsAtLeastLinear`, and the honest version of what a worst-case model can say |
| "n in binary" | `Computability.encodeNat : ℕ → List Bool`, little-endian binary | Verified: `(encodeNat 13).length = 4` by `decide` |
| "n in unary" (the trap) | `Computability.unaryEncodeNat` | Verified: `(unaryEncodeNat 13).length = 13` by `decide`. The two encodings sit side by side in one Mathlib file, so the trap is one identifier wide |
| `IsAtLeastLinear` (Ω(n), free constant) | `∃ k > 0, ∃ M, ∀ m ≥ M, 2 ^ m ≤ k * h.time m` | `2 ^ m` because `m` is now the *length*: linear in the value is exponential in the length. This is the whole of trap (3) written out |
| "one step of computation" | `Turing.TM2.step`, one `Stmt` | Mathlib's own docstring: a `Stmt` "generally contains multiple 'fundamental' steps … this execution time is up to multiplication by a constant the amount of fundamental steps" (`TuringMachine/Computable.lean:27–31`, read directly). Harmless for `Ω`, fatal for any constant |
| `IsFaithfulCostModel M` | **deleted** — the model is named, not quantified over | Seam: it is deleted at the price of *choosing*, and the choice is not free (see 3.3's model-dependence row) |

**What it leans on.**

- The pinned Mathlib itself, read at
  `.lake/packages/mathlib/Mathlib/Computability/TuringMachine/Computable.lean`
  (`TM2ComputableInTime` at line 166, `time : ℕ → ℕ`, `outputsFun` bounding by
  `time (ea a).length`), `.../StateTransition.lean` (`EvalsTo` carrying
  `steps : ℕ` at line 255, `EvalsToInTime` adding `steps_le_m` at line 265),
  and `.../Encoding.lean` (`encodeNat` at line 94, `unaryEncodeNat` at line
  145).
- Wolfram fixes the model and the encoding himself, which is the part
  `Rule30/Prize.lean` reads as open. Fetched from
  <https://writings.stephenwolfram.com/2019/10/announcing-the-rule-30-prizes/>:
  > "For definiteness we could say that we always want to do the computation on
  > a Turing machine. And for example we can say that we'll feed the digits of
  > the number *n* in as the initial state of the Turing machine tape, then
  > expect the Turing machine to grind for much less than *n* steps before
  > generating the answer."

  and, hedging it:
  > "We don't need to base things on a Turing machine, of course. We could use
  > any kind of system capable of universal computation, including a cellular
  > automaton, and, for that matter, the whole Wolfram Language."

  So trap (1) ("this file makes no choice at all") is a fact about the file and
  not about the question, and trap (3) ("the input encoding is unfixed") is
  wrong about the source: *the digits of the number n* is binary (or decimal;
  the difference is a constant), and it is Wolfram's own sentence.
- The `∃ k > 0` shape is forced, not stylistic. Linear speedup, fetched from
  <https://en.wikipedia.org/wiki/Linear_speedup_theorem>:
  > "given any real *c* > 0 and any Turing machine using *k* tape(s) solving a
  > problem in time *f*(*n*), there is another such *k*-tape machine that
  > solves the same problem in time at most *f*(*n*)/*c* + 2*n* + 3, where
  > *k* > 1."

  Here `n` is the *input length*, so the additive `2n + 3` is `O(log)` of the
  value and cannot rescue anything; the multiplicative `1/c` says any statement
  naming a constant is false. `Rule30/Prize.lean`'s note that
  `c * n ≤ cost p n` with `c : ℕ` would be "a different (stronger) claim" is
  right, and this theorem is why it is not merely stronger but false.

**The seam I nearly shipped without, and it is the one a captain must read.**
`∀ h : TM2ComputableInTime …` is **vacuously true if that type is empty**, and
Mathlib cannot currently show it is not. The type is inhabited as a matter of
mathematics — `centerColumn` is computable and TM2 is Turing-complete — but
Mathlib's route to that, `TuringMachine/ToPartrec.lean`, carries **no time
bound**; its own docstring says "(We don't prove it here, but in anticipation
of the complexity class P, the simulation is actually polynomial-time as
well.)" So the only inhabitant of `TM2ComputableInTime` anywhere in Mathlib is
the identity machine, and a solver handed `P3Binary` could in principle close
it by proving the type empty — the precise failure mode `Rule30/Prize.lean`
built `IsFaithfulCostModel` to prevent, reappearing one level down. The
difference is real and worth stating both ways: `IsFaithfulCostModel M` is
*permanently* sealed, since it has no equations and never will; `P3Binary`'s
hazard is a missing lemma with a name — `Nonempty (TM2ComputableInTime
encodeNat encodeBool centerColumn)` — which is bounded work and would be the
first non-identity machine in Mathlib's time-bounded layer. **Any restatement
of P3 in these terms must be accompanied by that inhabitance lemma or by an
explicit note that it is open**, or the `opaque` has been traded for a
different hole rather than removed.

**The test — run, not proposed.** `explorer/astrolabe_scratch_p3.lean`,
`lake env lean`, exit 0, no errors, no `sorry`. It contains `P3Binary`,
`P3Unary` and `P3UnaryTransported` — the same English sentence under the two
encodings — plus the two `decide` checks of the encoding lengths, plus
`#check` printing `TM2ComputableInTime encodeNat encodeBool centerColumn :
Type 1`, which is the universe seam. `#print axioms P3Binary` gives
`[propext, Classical.choice, Quot.sound]`.

What would kill this connection: showing that `∀ h : TM2ComputableInTime …` is
*not* a quantification over all fast machines — e.g. that some machine
computing `centerColumn` in `o(n)` steps fails to yield an inhabitant of the
structure. It cannot: every input length has finitely many inputs, so a machine
halting everywhere has a valid `time`, and a fast machine supplies an `h` that
violates the bound. The one genuine narrowing is the length-not-input seam in
the table above; a theorist should decide whether to accept it or to write the
per-input form by hand over `EvalsTo.steps`.

**What it would give.** It converts P3 from vacuous to open, which is what the
vantage asked for, and it removes an `opaque` from the project. It would give
**nothing at all toward P1** — see 3.2, which is the reason this is listed
first and handed on second.

---

### 3.2 P3 implies P1, the bridge costs three lines, and the unary trap severs it — so P3 is strictly harder than the node it was commissioned against

**The claim.** Prize 3 is not a second front on rule 30; it is Prize 1 plus
everything else. Any proof of P3 contains a proof of P1, the containment is
elementary, and the board should treat P3 as downstream of the wall rather than
beside it.

**The dictionary.**

| Object here | Object in complexity | Seam |
|---|---|---|
| `IsEventuallyPeriodic centerColumn` with period `p`, onset `N` | The language `{n : b(n) = 1}` is **regular** in base 2 — a `p`-state DFA reduces `n mod p` while scanning the digits, then a hardwired table of `p` bits answers | None; `n mod p` for fixed `p` is a finite-state computation on the digit string, so the whole program is a DFA of `p` states |
| Its running time | `O(m)` steps, `m = ⌈log₂ n⌉` — **linear in the input length**, i.e. `O(log n)` in the value | The gap to the target `2^m` is exponential, so the bridge is not delicate: it does not care about constants, tape counts, or which of `TM`/`RAM`/`CA` is used |
| Wolfram's target | `2^m ≤ k · time(m)` | The DFA program violates it for every `k` and every large `m` |
| So: P3 for any model containing the DFA | forces `¬ IsEventuallyPeriodic centerColumn` | **Proved**, three lines, axioms `[propext]` |
| **The unary version** | The same DFA still runs in `O(m)` steps — but now `m = n`, and the target is `m ≤ k · time(m)`, which the DFA *satisfies* | **The seam, and it is the interesting one.** With `n` in unary the trap is not only that P3 becomes trivially true: the trivial-truth and the bridge fail *together*. A unary P3 implies nothing about periodicity, so the encoding choice is not cosmetic even for readers who do not care about tightness |
| The converse, P1 ⟹ P3 | Nothing. Thue–Morse is aperiodic and its `n`th bit is the parity of the popcount of `n`, `O(m)` | Aperiodicity is compatible with every sub-linear cost, so no rung of the P3 ladder lies *below* P1 |

**What it leans on.** Nothing external; the content is the DFA, which is
elementary, and Mathlib's two encodings, which are quoted in 3.1. The one
outside anchor is that this is the same phenomenon Parallax already measured
from the automatic-sequence side — `docs/connections/2026-09-09-algebraic-and-automatic-…md`
records "`c` automatic ⟹ `c(t)` computable in `O(log t)` space and `O(log t)`
time from `t`'s binary digits" and "each eventually periodic sequence is
automatic in every base". P1 is the `p`-state case of that; P3 is its negation
at every state count at once.

**The test — run.** `explorer/astrolabe_scratch_bridge.lean`, `lake env lean`,
clean, `#print axioms p1_of_p3_of_lookup` gives `[propext]`. The theorem is

```
theorem p1_of_p3_of_lookup (M : CostModel)
    (hlookup : IsEventuallyPeriodic centerColumn →
      ∃ q : M.Program, M.ComputesCenterColumn q ∧ ¬ M.IsAtLeastLinear q)
    (hP3 : ∀ p : M.Program, M.ComputesCenterColumn p → M.IsAtLeastLinear p) :
    ¬ IsEventuallyPeriodic centerColumn
```

and its whole content is `hlookup`, which is a statement about the *model* and
not about rule 30. That is the honest shape and I have written it so the
emptiness is visible rather than hidden: the bridge is free, and discharging
`hlookup` for Mathlib's TM2 means building a machine, in a library whose only
built machine is the identity.

**What it would give.** It touches the residual only in the negative
direction, and that is worth saying to a captain plainly: **the P3 vantage
cannot produce a sufficient condition for P1**, because everything it produces
is a *consequence* of P1's failure, and the ladder of consequences has P1 at
the bottom. A theorist sent from here to help P1 would be sent uphill.

---

### 3.3 Every unconditional lower-bound technique in print, measured against the target — and the circuit route is dead by `log²`, not merely dead

**The claim.** Prize 3 asks for `2^m` on an `m`-bit input. Line the known
techniques up against that number and every ceiling is exponentially short
except diagonalization's; and the non-uniform version of the question is not
hard but *false*, by an argument that also caps what any circuit-flavoured
method could ever contribute.

**The dictionary.**

| Technique | Best it has ever given for an explicit function on `m` bits | Against the target `2^m` | Seam |
|---|---|---|---|
| Crossing sequences (single-tape TM) | `Θ(m²)` (palindromes) | `2^m` | Exponentially short, and it is the *only* place superlinear time bounds are unconditional |
| General circuit size | `3.011m − o(m)` **UNVERIFIED figure**, see below | max possible is `≈ 2^m/m` | Wikipedia, fetched: "complexity theorists have so far been unable to prove a superlinear lower bound for any explicit function" |
| Branching programs (Nechiporuk) | `Ω(m²/log² m)` **UNVERIFIED** | `2^m` | Exponentially short |
| Counting / Shannon | `Θ(2^m/m)` for *almost all* functions | `2^m` | **Above the ceiling**: even the information-theoretic maximum is a factor `m` *below* the target |
| Uniform-to-circuit simulation | `TIME(t) ⊆ SIZE(t log t)` | — | Turns any circuit lower bound `S` into at most `t = Ω(S/log t)`; with `S ≤ 2^m/m` and `t ≤ 2^{2m}`, that is `t = Ω(2^m/m²)`. **The circuit route cannot reach `2^m` even if it achieved the impossible** |
| Time hierarchy / diagonalization | `2^m`, for a *constructed* language | `2^m` | The only ceiling that reaches. Price: the language must be diagonal, i.e. must encode a universal machine |
| Succinct-instance reduction + diagonalization | superlinear, model-independent, for succinct QBF | — | The right *regime*; see 3.4 for why rule 30 is not in it |
| Logical depth / slow growth | transfers depth along truth-table reductions | — | Never establishes depth; there is no base case |

**The arithmetic that makes trap (4) quantitative.** Any Boolean function of
`m` bits is computed by a multiplexer over its truth table, `O(2^m)` gates —
elementary, no citation needed, and already within a constant of the target. So
even before Lupanov, "P3 for circuits" is at best constant-tight, i.e. in the
one regime where the fetched "unable to prove a superlinear lower bound for any
explicit function" bites hardest. Lupanov's `(1+o(1))·2^m/m` pushes it over
into outright false, and `Rule30/Prize.lean`'s trap (4) is exactly right: with
`m = log₂ n`, `2^m/m = n/log₂ n < c·n`. What the file does not say, and what is
the actual finding here, is that this is not only a warning against choosing
circuits — it is a **cap on any technique that factors through circuit size**,
at `Ω(2^m/m²)`, a `log²` short of the target, forever.

**What it leans on.**

- Shannon, fetched from <https://en.wikipedia.org/wiki/Circuit_complexity>:
  > "Shannon in 1949, who proved that almost all Boolean functions on *n*
  > variables require circuits of size Θ(2*n*/*n*)."

  (the page renders `2^n/n` as `2n/n`; the intended expression is `2^n/n`.)
- The barrier, same page, fetched:
  > "Despite this fact, complexity theorists have so far been unable to prove a
  > superlinear lower bound for any explicit function."
- Pippenger–Fischer, same page, fetched:
  > "If a certain language, A, belongs to the time-complexity class TIME(t(n))
  > for some function t: ℕ → ℕ, then A has circuit complexity O(t(n) log
  > t(n))."
- Time hierarchy, fetched from
  <https://en.wikipedia.org/wiki/Time_hierarchy_theorem>:
  > "if f , g are time-constructable, and f ( n ) ln ⁡ f ( n ) = o ( g ( n ) ) ,
  > then D T I M E ( f ( n ) ) ⊊ D T I M E ( g ( n ) )"

  and
  > "We do this by constructing a machine which cannot be in **TIME**(_f_(_n_)),
  > by diagonalization."
- **UNVERIFIED**, and marked in the table: the `3.011m` circuit lower bound
  (Find–Golovnev–Hirsch–Kulikov) and Nechiporuk's `Ω(m²/log² m)` for branching
  programs. Searched: `"no superlinear" time lower bound known "explicit"
  problem general model Turing machine RAM state of the art barrier` (a search
  summary named `3.1n − o(n)`, which is a summary and not a fetch);
  `Lupanov Shannon "2^n / n" circuit size every Boolean function n variables
  asymptotically optimal`. **Also UNVERIFIED: Lupanov's universal upper bound
  `(1+o(1))2^m/m` for every function.** Two fetches of
  <https://en.wikipedia.org/wiki/Lupanov_representation> returned HTTP 404, and
  the <https://en.wikipedia.org/wiki/Circuit_complexity> fetch reported that
  the page does not mention Lupanov. Jukna's EATCS bulletin PDF
  (<https://web.vu.lt/mif/s.jukna/boolean/Summary-Bulletin-EATCS.pdf>) was
  fetched but is a PDF the fetcher cannot parse. The argument above is written
  so that it survives on the elementary `O(2^m)` multiplexer bound alone; the
  Lupanov figure only sharpens "constant-tight" to "false".

**The test.** A theorist should try to falsify the cap by exhibiting a
technique whose ceiling reaches `2^m` and which is not diagonalization. In the
project's vocabulary: exhibit **any** explicitly defined sequence
`a : ℕ → Bool`, computable in time polynomial in the value, for which a proof
that computing `a(n)` from `n` in binary takes `Ω(n)` steps exists in print.
My claim is that there is none, and one counterexample kills this connection
outright.

**What it would give.** Nothing toward the residual, and that is the point: it
converts "P3 is hard" from an impression into a table with numbers in it, so
that a captain can price a P3 session against a P1 session without running one.

---

### 3.4 Succinct-instance complexity is the only published framework in the right regime, and rule 30's fixed seed removes its input channel

**The claim.** There is exactly one place in the literature where a *natural*
problem with a logarithmically short input has a proved non-linear time lower
bound in a model-independent way, and it works by making the short input
*describe* an arbitrary instance. Rule 30's short input describes nothing — it
is a clock reading — so the framework has nowhere to attach, and the same
defect explains why rule 110's P-completeness transfers no hardness to rule 30.

**The dictionary.**

| Object here | Succinct-instance complexity | Seam |
|---|---|---|
| The input `n`, `m` bits | The succinct description, `O(t(n))` bits, of a QBF | **The seam, and it is fatal.** The QBF description ranges over all descriptions; `n` ranges over the integers and names a *time*, not an instance |
| The function `n ↦ b(n)` | The language "succinct QBF" | One is a fixed sequence; the other is a language with an instance channel |
| "requires `2^m` steps" | "requires superlinear time on multitape TMs, random-access TMs, tree computers and log-cost RAMs" | The published bound is *superlinear in the description length*; ours is *exponential* in it. Even the successful case is exponentially weaker than P3 |
| The proof method there | reduce alternating time `t(n)` into `O(t(n))`-bit succinct QBFs, then diagonalize | Requires the target to absorb an arbitrary computation. Rule 30 from a single black cell absorbs nothing: there is one instance per `n` |
| Rule 110's P-completeness | `PREDICT(configuration, t, cell)` — the configuration is input | Rule 30's configuration is `initialConfig`, fixed by the prize. Hardness that lives in the configuration channel is unavailable by construction |
| What would restore the channel | `{n : b(n) = 1}` hard for `DTIME(2^{Ω(m)})` under linear-time reductions | That is "the centre column is a universal sequence", strictly stronger than "rule 30 is universal", which is itself open. Rule 110 is universal; rule 30 is not known to be |

**What it leans on.**

- Fetched from <https://eccc.weizmann.ac.il/report/2008/076/> (Ryan Williams,
  TR08-076, 17 June 2008):
  > "We prove a model-independent non-linear time lower bound for a slight
  > generalization of the quantified Boolean formula problem (QBF). In
  > particular, we give a reduction from arbitrary languages in alternating
  > time t(n) to QBFs describable in O(t(n)) bits by a reasonable
  > (polynomially) succinct encoding."

  and
  > "By a simple diagonalization, it follows that the succinct QBF problem
  > requires superlinear time on those models."

  and
  > "the first known instance of a non-linear time lower bound (with no space
  > restriction) for solving a natural linear space problem on a variety of
  > computational models."

  The models are named: "multitape Turing machines, random access Turing
  machines, tree computers, and logarithmic-cost RAMs."
- Neary and Woods, *P-completeness of cellular automaton rule 110*: **the
  abstract is UNVERIFIED as a quote.** The Springer chapter page redirects to
  an authentication endpoint and the Hamilton PDF
  (<https://dna.hamilton.ie/assets/dw/NearyWoodsBCRI-04-06.pdf>) is a PDF the
  fetcher cannot parse. Searched: `"cellular automata" prediction problem
  P-complete rule 110 Neary Woods "P-complete" simulation time lower bound`.
  The claim I use it for — that the *initial configuration is part of the
  input* of the prediction problem — is definitional to `PREDICT` and would
  survive the citation failing.
- Model-dependence, which is the honest defence of `IsFaithfulCostModel`
  against 3.1: the models above are equivalent up to *polynomial* overhead,
  and `Ω(n)` is not invariant under polynomial overhead. A RAM running in `S`
  steps is simulated by a multitape TM in `poly(S)`, so "no RAM in `o(n)`" is
  strictly stronger than "no TM in `o(n)`". Choosing Mathlib's TM2 therefore
  picks the **weakest** member of Wolfram's own list, which is the safe
  direction for a conjecture and the wrong direction for anyone hoping the
  choice does not matter. This is the part of the file's trap (1) that is
  genuinely right, and 3.1 should not be read as denying it.

**The test.** In the project's vocabulary, the statement a theorist should try
to falsify: *there is a computable `g : ℕ → ℕ` with `g(x) < 2^{O(|x|)}`,
computable in time polynomial in `|x|`, and a language `L ∈ E` with
`x ∈ L ↔ centerColumn (g x) = true`.* A witness would prove P3 (hence P1) and
would be the first hardness result about rule 30 of any kind. I expect no
witness, and I expect no proof of non-existence either; the value of writing it
down is that it is the *only* shape a P3 proof can currently have.

**What it would give.** If the channel could be restored, everything: P3, hence
P1, hence the node. It cannot, on anything in print. Recording the shape is the
deliverable.

---

### 3.5 Prize 3 is false for rule 90 and rule 150, by a two-line closed form — so P3 is a claim about the `OR`, and "nonlinearity" is not an argument

**The claim.** The prize question is not about cellular automata, or about
simple programs, or about pseudorandomness; it is about one Boolean connective.
Two of rule 30's neighbours in the same 256-rule family have `n`th cells
computable from the `m` bits of `n` in `O(m)` and `O(m²)` respectively, with
closed forms short enough to fit in this paragraph — so the analogous P3 for
them is *false*, verified, and the entire content of Wolfram's question is that
replacing `XOR` by `XOR`-with-an-`OR` destroys the shortcut.

**The dictionary.**

| Object here | Rule 90 / rule 150 | Seam |
|---|---|---|
| `evolve t x` from the single seed | Rule 90: `C(t, (t+x)/2) mod 2`, which by Kummer is `1` iff `a AND b = 0` with `a = (t+x)/2`, `b = (t−x)/2` | Verified: **160,801 of 160,801 cells** agree with direct simulation to depth 400 (`explorer/astrolabe_rule90.mjs`) |
| the same | Rule 150: coefficient of `X^{t+x}` in `(1+X+X²)^t` over `F₂`, by binary exponentiation | Verified: **160,801 of 160,801** cells, same script and depth |
| cost of the `n`th cell | Rule 90: one `AND` of two `m`-bit integers — `O(m)` bit operations, i.e. `O(log n)`. Computed here at `t = 2^52` from 52 bits | So P3 is **false** for rule 90 by an explicit algorithm, not by an existence argument |
| cost for rule 30 | run it: `≈ n²` cell updates (`t = 10^6`: `10^12` updates from a 20-bit input) | The conjectured lower bound `n` sits a factor `n` *below* the best known algorithm, so P3 is a weak claim that is nonetheless out of reach |
| the mechanism | additivity over `F₂` gives Frobenius: `(1+X+X²)^{2^k} = 1 + X^{2^k} + X^{2^{k+1}}`, so `t` steps cost `log t` squarings | Rule 30's `l XOR (c OR r)` is not `F₂`-linear, so there is no Frobenius and no repeated squaring |
| **the seam that matters** | "rule 30 is nonlinear, therefore no shortcut" | **A non-argument**, and already recorded on this board from the algebraic side: algebraic power series over `F_q` are closed under Hadamard product, so nonlinearity of the local rule does not survive as a property of the sequence (Parallax, §4 of the algebraic-and-automatic sighting) |
| control | the same `AND`-test applied to rule 30 | **81,063 of 160,801** — fails at `(t,x) = (1,0)`, so the test is not vacuous |

**What it leans on.** The closed forms are classical (Lucas' theorem / Kummer's
theorem for binomial parity; Frobenius over `F₂` for the trinomial case) and
are *verified here against simulation* rather than cited, which is the stronger
form of evidence for a computational claim. No web citation is offered or
needed. Wolfram's own framing of the cost, fetched from the announcement:

> "To find the *n*th cell in the center column, one can always just run rule 30
> for *n* steps, computing the values of all the cells in this diamond... But if
> one does this directly, one's doing *n*² individual cell updates."

**The test — run.** `node explorer/astrolabe_rule90.mjs`, depth 400, output as
tabulated above. It would be killed by finding any cell where a closed form
disagrees with simulation, or by finding that the control passes.

**What it would give.** A calibration the board does not have: the exact class
of elementary rules for which P3 is false, and therefore what a P3 proof must
use about rule 30 and not about, say, rule 150. It touches the residual not at
all. Its value is defensive — it kills the "rule 30 is nonlinear, so no
shortcut" move before someone spends a session on it.

---

## 4. Died in translation

Every one of these was a dictionary I started and could not finish, or finished
and found empty.

- **"Non-uniformity is a trap, so use uniformity and the trap is avoided."**
  My first reading of `Rule30/Prize.lean`'s trap (4). Dies on Pippenger–Fischer:
  the trap is not a fork in the road but a ceiling over the whole road, capping
  anything that factors through circuit size at `Ω(2^m/m²)`. Uniformity does not
  avoid the trap; it merely means the trap does not immediately falsify you.
- **"`Nat.Partrec.Code.evaln` could be repaired into a step count."** Dies on
  reading it: `k` guards `n ≤ k` at *every* constructor, so it bounds the
  magnitude of every intermediate value as well as the recursion depth. It is
  not a clock with a unary bug; it is a bound on the numbers, and there is no
  local repair. `evaln_bound : x ∈ evaln k c n → n < k`
  (`PartrecCode.lean:607`) is the file's own statement of it. `Rule30/Prize.lean`
  is right about this and understates it.
- **"Rule 110's P-completeness transfers to rule 30 by intrinsic universality."**
  Dies at the input channel: `PREDICT` takes the configuration as input and the
  prize fixes it. Every CA hardness result I could find is a statement about a
  *family* of initial conditions; the prize question is about one.
- **"The prediction problem for rule 30 with `t` in binary is EXP-complete by
  the succinct-instances upgrade."** Dies for the same reason one step later:
  the succinct upgrade (a P-complete problem's succinct version is EXP-complete)
  needs the succinct object to be an *instance description*. `n` describes a
  time. There is no theorem here, only a resemblance between two things that are
  both `log`-sized.
- **"Even if it were EXP-complete, that would give P3."** Dies on arithmetic,
  and this is the one I believed longest. EXP-hardness under polynomial
  reductions gives "not in P", i.e. not `poly(m)` = not `polylog(n)`. The target
  is `2^m = n`. The two are an exponential apart, so the completeness route
  needs `E`-hardness under *linear-time* reductions, not EXP-hardness under
  polynomial ones — a much scarcer object, and one I could not find applied to
  any fixed sequence.
- **"Bennett's logical depth is the right formal home for computational
  irreducibility, and the slow growth law is a proof technique."** Half true and
  useless. Depth is the right notion; the slow growth law only *transfers* depth
  along truth-table reductions, so it needs a deep object to start from. The
  known deep object is the halting set. Reducing the halting set to rule 30's
  centre column is the same missing channel as above.
- **"Zwirn–Delahaye's formal definition of computational irreducibility would
  let P3 be stated properly."** Dies on what the paper is: it proves that a
  robust *definition* has the consequence one wants ("no computation of its nth
  state can be faster than the simulation itself", from the fetched abstract).
  It supplies a predicate, not a way to establish the predicate of a named
  automaton — which is exactly the position `IsFaithfulCostModel` is in, one
  level up.
- **"The naive `O(n²)` and the conjectured `Ω(n)` nearly meet, so P3 is almost
  tight."** Dies at the factor: they are `n` apart. P3 permits an `n·polylog(n)`
  algorithm for the `n`th cell and would still be true. So P3 is *not* "there is
  no shortcut"; it is "there is no shortcut below linear", and a genuine
  `O(n log n)` algorithm for rule 30 would leave the prize question untouched
  while making "computational irreducibility" a strange thing to have claimed.
- **"Blum's speedup theorem might make P3 false for a silly reason."** Not dead,
  not pursued, and recorded so nobody assumes it was checked: speedup theorems
  produce functions with no best algorithm, and I did not establish whether
  `centerColumn` could be one. The relevant question — whether the *infimum*
  over algorithms of the exponent is attained — is not addressed anywhere I
  looked.
- **"The opaque predicate can simply be deleted."** Half died, and this was my
  headline for two hours before I stress-tested it. `∀ h : TM2ComputableInTime …`
  is vacuously true on an empty type, Mathlib's only inhabitant of that type is
  the identity machine, and `ToPartrec` reaches partial recursive functions
  *without* a time bound — so a solver could close the replacement by proving
  the type empty, which is the exact hazard `IsFaithfulCostModel` exists to
  block. What survives is that the hazard is now a **named missing lemma**
  rather than a permanent seal, and that is a real improvement rather than a
  wash; but "delete the opaque and you are done" is false and I would have
  shipped it.
- **"`CostModel.Program : Type` will hold Mathlib's machines."** Died in the
  kernel: `failed to solve universe constraint 1 =?= 2`. `FinTM2` quantifies
  over `Γ : K → Type`, so the bundle is `Type 1`. Small, but it is the difference
  between the fix being a rewrite and the fix being one character, and I only
  found it by trying.
- **"The 2-kernel / automaticity rung is mine to measure."** Died on reading
  `docs/connections/2026-09-09-algebraic-and-automatic-…md`: Parallax measured
  it to depth `2^21` (≥ 130,553 kernel elements) and already drew the P3
  consequence. I did not re-measure and the next connector should not either.
- **"`TM2ComputableInTime` gives a per-input cost."** Died on the signature:
  `time (ea a).length`. It is per *length*. So the Mathlib statement is the
  worst-case-per-length weakening of `IsAtLeastLinear`, and any theorist writing
  the per-input form must go under the structure to `EvalsTo.steps`.
- **"Wolfram left the model open, which is why the Lean file had to."** Died on
  the announcement: he names a Turing machine, names the digits of `n` as the
  tape contents, and names "much less than `n` steps" as the thing to rule out.
  What he did leave open is the *hedge* — "any kind of system capable of
  universal computation" — and that hedge is not harmless, because the models it
  covers differ by polynomial overhead while `Ω(n)` does not survive polynomial
  overhead. So the file's trap (1) is right for a reason the file does not give.

---

## 5. What to hand the theorist

**Topic A — replace the opaque predicate, and say out loud that it does not
help P1.** The claim to falsify: *`Rule30/Prize.lean`'s `IsFaithfulCostModel`
can be deleted and `centerColumn_cost_at_least_linear` restated as a
non-vacuous open statement, using `Turing.TM2ComputableInTime` with
`Computability.encodeNat`, in under twenty lines that elaborate today.* The
dictionary row it depends on: `CostModel.cost p n ↦ h.time ((encodeNat n).length)`,
with the length-not-input seam accepted or paid for by dropping to
`EvalsTo.steps`. What settles it: `explorer/astrolabe_scratch_p3.lean` already
elaborates clean under `lake env lean`; the remaining judgement is whether the
per-length weakening is acceptable as *the* formalization of P3, which is a
question for whoever owns `Prize.lean` and not for a solver. The universe of
`CostModel.Program` must go from `Type` to `Type 1`. **The job is not done
without the inhabitance lemma** — `Nonempty (TM2ComputableInTime encodeNat
encodeBool centerColumn)`, i.e. build one TM2 that computes the centre column
with any time bound at all — because without it the new statement is
vacuously closeable and the `opaque` has only changed shape. That lemma is the
real mathematics in Topic A and it is a genuine construction: Mathlib's
time-bounded layer has exactly one machine in it, the identity. **By Topic B
all of this moves the board's P1 frontier by nothing.** A short session for
the statement; the inhabitance lemma is its own node and should be sized as
one.

**Topic B — establish, in Lean, that P3 implies P1, so the board stops treating
them as parallel fronts.** The claim to falsify: *for the model of Topic A,
`P3Binary → ¬ IsEventuallyPeriodic centerColumn`.* The dictionary row it
depends on: "eventually periodic with period `p` ⟹ a `p`-state DFA on the
binary digits of `n` computes `b(n)` in `O(m)` steps". The abstract version is
already proved here (`explorer/astrolabe_scratch_bridge.lean`, axioms
`[propext]`) with the DFA existence as a hypothesis; the concrete version needs
that hypothesis discharged for Mathlib's TM2, which means building a machine in
a library whose only worked example is the identity and whose poly-time
composition lemma is an unproved `proof_wanted`
(`TuringMachine/Computable.lean:284`). **Say plainly what this buys**: it makes
P3 a strictly stronger statement than the wall, with a proof on the board, so
that nobody proposes P3 as an easier way in. That is a real service and it is
the only thing in this document that produces a Lean theorem relating two
prizes.

**And the negative the brief asked for, said plainly.** *No published
lower-bound framework can be written in Lean to attack P3, at any cost, because
none of them proves anything of the required shape about any explicit
sequence.* The statement costs fifteen lines; the proof has no framework in
Lean because it has no framework on paper. The nearest thing in print
(Williams, succinct QBF) is superlinear in the description length where P3 is
exponential in it, and works by giving the short input an instance channel that
a fixed initial condition does not have. Balbach's Isabelle Cook–Levin entry —
18 theory files, multi-tape TMs, `P`, `NP` and polynomial reduction built from
nothing — is the measured cost of the *ground floor* under a theorem that is
not a lower bound at all. So: months of work would buy the vocabulary, and the
vocabulary would then be pointed at a statement nobody knows how to prove
informally. **Do not commission that work for P3's sake.** Commission Topic A
because an `opaque` in a prize file is a hazard, and Topic B because it is a
theorem.

---

## 6. Next vantage

**Send the next connector at the theory of *pseudorandom generators and
next-bit unpredictability*, and specifically at the cryptographic literature on
rule 30 as a stream cipher.** The reason is that it is the one field whose
central object is exactly the shape of P1 and which this board has read only
for its empirics: `sources/spencer-2013-ca-cryptographic-generators.txt` is
held and indexed as "empirical mostly", and Meier–Staffelbach 1991 — the paper
that broke rule 30 as a cipher — is listed as *not held* and cited secondhand.
A cryptanalytic attack on rule 30 is, formally, an algorithm that predicts the
centre column from partial information, and the failure of such attacks is the
only place in the literature where anyone has systematically tried to *find*
the shortcut whose non-existence P3 asserts and whose weakest instance is P1.
Where the vantage I stood on could only measure how far every lower-bound
technique falls short, that one has upper-bound machinery — distinguishers,
linear complexity profiles, correlation attacks — that produces *positive*
statements about structure, and a positive statement about structure is what a
sufficient condition for P1 would have to look like. The specific question to
hand over: Meier and Staffelbach recover rule 30's left half from its right
half at a cost measured in their paper; what exactly do they use, and does the
quantity they exploit have a name in the board's vocabulary (the damage front,
the forbidden block, the sideways solve)?

The vantage I could not reach from where I stood, and which nobody should
mistake for the above: **descriptive set theory and the Borel complexity of the
eventual-periodicity predicate.** `IsEventuallyPeriodic` is `Σ⁰₂` in the
sequence, its negation `Π⁰₂`, and the board's census sighting has looked at the
reverse-mathematics side of that; what I could not get to is whether the *set
of rules* whose centre column is eventually periodic is complete at that level,
because a completeness result would say that no proof of P1 can be uniform in
the rule — which would explain, rather than merely record, why every argument
this board has tried dies at the point where it stops mentioning rule 30
specifically. That is a different question from the census's and I could not
tell from here whether it is a real one.
