# Attack: prove `periodic_polyTime`, and nothing else

*Talus, theorist, 2026-09-12. Topic: for every eventually periodic
`f : ℕ → Bool`, exhibit a `Turing.TM2ComputableInPolyTime Computability.encodeNat
Computability.encodeBool f`. No rule 30 appears in the statement.*

**Band, before anything else.** The mathematics is **Nothing**: an eventually
periodic sequence is decided by a finite automaton reading the digits of `n`,
which is folklore (Allouche–Shallit, *Automatic Sequences*, "every ultimately
periodic sequence is `k`-automatic for every `k`"; not held in `sources/`). The
result is **project-internal**: it removes the one `sorry` between `P3Core` and
P1, so P3 stated against Mathlib's own machine model now provably implies P1
inside this repo, with `#print axioms` reading `[propext, Classical.choice,
Quot.sound]`. Nothing here is novel and nothing here is about rule 30.

**The answer to the topic's first question — is it provable at all — is yes,
and the step the connector expected to cost a day costs one `load` and one
design choice.** The theorem is proved in the kernel
(`explorer/talus8_scratch_periodic.lean`), the connector's `P3Core_implies_P1`
is re-proved without `sorry` (`explorer/talus8_scratch_p3.lean`), and two
mutant files beside them show the checks bite where they are supposed to.

## 1. The residual, in one paragraph

Pantograph's connection of 2026-09-11 puts P3 into Mathlib's `Turing.FinTM2`
model as `P3Core := IsEmpty (TM2ComputableInPolyTime encodeNat encodeBool
centerColumn)`, and derives P1 from it in two lines — *given* one lemma: that
every eventually periodic `f : ℕ → Bool` is `TM2ComputableInPolyTime` against
the little-endian binary encoding. That lemma was `sorry`. Until it is proved,
`P3Core` could be an empty shell, because a model in which *nothing* is cheap
would make `P3Core` provable and the P1 derivation vacuous. So the residual of
this topic is not in the picture at all: it is a Lean obligation about
Mathlib's machine model. What has to be true is that a bundled machine —
finitely many stacks, labels, states, input symbols, cost counted as
applications of `step` — can read the binary digits of `n` off its input
stack, decide `f n`, and end in exactly the configuration `haltList` demands:
label `none`, internal state equal to `initialState`, the output symbol alone
on the output stack, and every other stack empty. The brief singled out the
last two requirements as the likely cost. They are where this document
starts.

## 2. Why the known routes fail

No entry in `docs/obstructions.md` bears on this topic: every one of them is
about the picture, and this statement contains no picture. The routes that
*do* bear on it are the connector's recorded deaths, restated here in a
sentence each so a reader of this file alone knows why the model is what it
is.

- **A cost model with a supplied `cost` field** (crystal 71, `docs/prize.md`
  "trap one"): dies because `cost := 0` satisfies any finite list of axioms;
  cost has to be *derived* from an operational semantics, which is what
  `EvalsTo.steps` in `Mathlib/Computability/StateTransition.lean` is.
- **Unary input** ("trap two"): dies because reading the input already costs
  `n`, so every machine is slow and the statement is provable-and-worthless.
  `Computability.unaryEncodeNat` is that trap as a definition; `encodeNat` is
  binary and little-endian (`encodePosNum (bit0 n) = false :: encodePosNum n`,
  `Mathlib/Computability/Encoding.lean:83–86`), which this construction depends
  on: the machine pops the least significant digit first.
- **`Turing.TM0` / `TM1`** (connector's C3): dies because their state types
  carry no finiteness, so a machine with `Λ := ℕ` reads `n` into its state
  and P3 over them is false. `FinTM2` is Mathlib's own bundling of the
  `Fintype` hypotheses, and it is the only model here.
- **Proving the lemma by "eventually periodic sequences are automatic" as a
  citation**: not available as a route, because the automatic-sequence
  characterisation reads digits most-significant-first (`r ← k·r + b`), and
  Mathlib's `encodeNat` is least-significant-first. Reversal of a regular
  language is a subset construction, not a one-line machine. The direct
  least-significant-first automaton is what section 3 builds, and its state
  carries two components the connector's sketch did not name (section 5).
- **Two stacks, `K = Bool`, with the connector's `σ = ZMod p × ZMod p × Fin
  (N+1)`**: not a dead end but a detour. With `K = Bool` the input stack must
  be *emptied* for `haltList` — which the pops do anyway — and `Fin (N+1)`
  alone cannot track "is `n < N`" digit by digit from the low end. Both are
  repaired below; recorded so nobody rebuilds the two-stack version first.

Nothing new was appended to `docs/obstructions.md`: this session found no
dead end about rule 30, and a route that turned out to be open is not an
obstruction.

## 3. Candidate claims

### C1. `periodic_polyTime` is a theorem, with clean axioms

**The claim.** For every `f : ℕ → Bool` with `∃ p > 0, ∃ N, ∀ n ≥ N, f (n + p)
= f n`, `Nonempty (TM2ComputableInPolyTime encodeNat encodeBool f)`. In the
project's vocabulary the hypothesis is `∃ p > 0, ∃ N, PeriodicFrom f p N`,
spelled out exactly as `Rule30/Prize.lean` spells `IsEventuallyPeriodic`; the
conclusion is Mathlib's, and no definition is missing.

**The machine** (`Talus8.mach p M f`, `M := N * p`):

| field | value | why |
|---|---|---|
| `K` | `Unit` | one stack, so the input stack *is* the output stack and there is no other stack for `haltList` to require empty |
| `Γ _` | `Bool` | the input alphabet; `inputAlphabet := outputAlphabet := Equiv.refl _` |
| `Λ` | `Unit` | one label |
| `σ` | `Bool × ZMod p × ZMod p × Fin (M+1) × Fin (M+1)` | (input exhausted?, `n mod p` so far, `2^i mod p`, `min(n so far, M)`, `min(2^i, M)`) — `Fintype` by instance search once `NeZero p` is in scope, which `p > 0` supplies |
| `initialState` | `(false, 0, 1, min 0 M, min 1 M)` | the state after reading the empty prefix |
| `m ()` | `pop () popF (branch done (push () ans (load (fun _ => init) halt)) (goto ()))` | one `step` pops one digit; if the stack was empty, push the answer, **restore the initial state**, halt |

Reading digit `b` at position `i` updates `r ← r + b·w`, `w ← 2w` in `ZMod p`
and `c ← min(c + b·e, M)`, `e ← min(2e, M)` in `Fin (M+1)`. After all digits,
`r = n mod p` and `c = min(n, M)`; the answer is `f c` if `c < M`, else
`f (M + r)`, and `f (M + n mod p) = f n` for `n ≥ M` because `M` is a multiple
of `p` at or past the onset. Time: an input of length `X` takes exactly `X + 1`
steps, so `time := Polynomial.X + 1`. The connector guessed `X + c`; `c = 1`.

**What it would give.** It is the whole topic. With it, `P3Core_implies_P1`
is a `sorry`-free theorem (C2), and `docs/prize.md`'s stated precondition for
restating `Prize.lean`'s P3 against a real model ("until at least the first is
proved") is met. What remains after it is everything about rule 30, plus the
threshold question (the connector's Topic 2), which this session did not
touch.

**Falsification.** The engine here is the Lean kernel, and the claim is a
theorem, so "survives" means accepted with clean axioms.
`lake env lean explorer/talus8_scratch_periodic.lean` (2026-09-12): accepted,
no warnings, and

```
'Talus8.periodic_polyTime' depends on axioms: [propext, Classical.choice, Quot.sound]
```

Beyond the proof, the same file makes the kernel *run* the machine rather than
argue about it: with `g3 n = decide (n % 3 = 1)` and `M = 3`, the iterate of
`flip bind step` from `initList (mach 3 3 g3) (encodeNat 13)` for five steps
is `some (haltList (mach 3 3 g3) [true])` by `rfl` (13 = 1101₂, four digits,
`13 mod 3 = 1`); from `encodeNat 5` for four steps it is `haltList … [false]`;
and — the negative control — four steps on the four-digit input are provably
*not* the halting configuration (the label is still `some ()`).

**Distrust the result you like.** What else could produce an accepted file?
(i) A statement that is not the one intended — checked by using Mathlib's
`TM2ComputableInPolyTime`, `encodeNat`, `encodeBool` verbatim and the Prize
file's own `IsEventuallyPeriodic` in `talus8_scratch_p3.lean`, where the
connector's `P3Core` and `ShortcutExists` are copied word for word. (ii) A
`rfl` that succeeds for a degenerate reason — the no-`load` mutant
(`explorer/talus8_scratch_mutant_noload.lean`) is the same file with one
`load` deleted, and Lean rejects it at exactly the halting-configuration
lemma:

```
talus8_scratch_mutant_noload.lean:64:0: error: Not a definitional equality: the left-hand side
  (mach p M f).step (cfg p M f (some ()) s [])
is not definitionally equal to the right-hand side
  some (cfg p M f none (stOf p M 0 0) [ans p M f (true, s.2)])
```

while the same mutant file *accepts* the truthful version (the state is left
as `(true, s.2)`) and the lemma that no such configuration equals any
`haltList` configuration. So `haltList`'s state-restoration requirement is
real, it is load-bearing, and it is met by one `load`. (iii) A machine that is
"correct" only because the sequence is periodic from zero — the second mutant
(`explorer/talus8_scratch_mutant_wrong.lean`) drops the `min(n, M)` cap and
always answers `f (M + n mod p)`; Lean accepts that file, and what it proves is
that on `f₀ n = decide (n = 0)` (period 1 from index 1) the mutant halts on
input `0` with `[false]` on its stack while `f₀ 0 = true`. The cap is what
carries the prefix, and "eventually periodic" is not "periodic".

**Novelty.** Nothing. Searched `sources/` for `finite automat`, `finite
state`, `regular language`, `polynomial in log`, `DFA`, `automatic sequence`,
`eventually periodic`: the only hit that bears on it is Wolfram 1986 §8
(`wolfram-1986-random-sequence-generation.txt:1173–1175`), "for a linear
cellular automaton … this problem can be solved in a time polynomial in
log(t)", which is the *shortcut* half of the connector's litmus and not this
lemma. The nearest print is Allouche–Shallit's theorem that ultimately
periodic sequences are `k`-automatic, not held here; against Mathlib, the
nearest object is `Turing.idComputableInPolyTime`
(`Mathlib/Computability/TuringMachine/Computable.lean:221`), the only
`TM2ComputableInPolyTime` witness the pinned library constructs, and it is
the identity in one step. This is, as far as the pinned Mathlib goes, the
first `TM2ComputableInPolyTime` witness with a non-trivial run.

**Route.** Not needed; the proof exists. For a prover who has to redo it in a
node file, the two places the time went, neither mathematical: (a) `rw` will
not match `flip bind step (some c)` when `c` is written at type
`TM2.Cfg (fun _ => Bool) Unit σ` while `step` wants `(mach ..).Cfg` — the
types are defeq but not syntactically equal, and `rw` matches at `instances`
transparency. The fix is a helper `cfg : Option Unit → σ → List Bool →
(mach ..).Cfg` so every configuration is *stated* at the machine's own type;
after that `step_cons`, `step_nil`, `initList = cfg …` and `haltList = cfg …`
are all `rfl`. (b) The `outputsFun` goal carries
`@Equiv.invFun (tm.Γ tm.k₀) Bool (Equiv.refl _)`, whose implicit arguments
are not those of `Equiv.refl Bool`; state the `List.map_id` rewrite with the
`@`-explicit form and it matches. Everything else is `push_cast; ring` on
`ZMod p` and `omega` on `min` after `generalize 2 ^ i = t` — `omega` fails on
`min` goals containing `2 ^ i` unless the power is first made an atom.

### C2. `P3Core → ¬ IsEventuallyPeriodic centerColumn`, without `sorry`

**The claim.** The connector's two-line derivation, with C1 in place of its
`sorry`. Stated with `Rule30/Prize.lean`'s `IsEventuallyPeriodic` and
`centerColumn`; this is the only rule 30 in the session, and it is the point
of the session.

**What it would give.** P3, in the `FinTM2` reading, implies P1 inside this
repo. `docs/prize.md:162–171` names this as the half of non-vacuity that
matters and as the precondition for touching `Prize.lean`'s P3 (which this
session did not touch, and which a captain decides).

**Falsification.** `lake env lean explorer/talus8_scratch_p3.lean`:

```
'Talus8P3.P3Core_implies_P1' depends on axioms: [propext, Classical.choice, Quot.sound]
'Talus8P3.shortcutExists' depends on axioms: [propext, Classical.choice, Quot.sound]
```

The connector's file printed `[propext, sorryAx, Classical.choice, Quot.sound]`
for the same theorem. **Distrust:** the implication is trivially true if
`P3Core` is *false* — a fast machine for the centre column would make the
hypothesis unsatisfiable. Nothing here bears on that; it is P3. What the
session does rule out is the *other* degeneracy, `P3Core` true for a stupid
reason (nothing is ever fast), by C3.

**Novelty.** Nothing beyond C1; the derivation is the connector's.

### C3. `ShortcutExists` is a one-line corollary, not a separate construction

**The claim.** The connector's `ShortcutExists := Nonempty
(TM2ComputableInPolyTime encodeNat encodeBool (fun n => decide (n % 2 = 1)))`
follows from C1, because parity is eventually periodic with period 2 from 0.

**What it would give.** The connector's litmus C4(b), "the model provably
admits a fast machine", in its weakest form — closed by the same lemma as
C4(a), so the two halves of the litmus are not independent evidence of
anything. The *interesting* form of (b), a fast machine for an **aperiodic**
sequence (rule 90's column 1, "every digit of `n` is 1"), is a different
machine and is *not* a corollary; it is section 6.

**Falsification.** In both Lean files, accepted, clean axioms (above).

**Novelty.** Nothing.

### C4. The `haltList` requirement is a one-`load` cost, and a design constraint, not an obstacle

**The claim.** `haltList tm s` pins three things — label `none`, `var =
tm.initialState`, and `stk k = if k = k₁ then s else []`. In `FinTM2` a single
`step` executes a whole `Stmt` tree, so `load (fun _ => initialState)`
immediately before `halt` restores the state at zero cost in steps. Emptying
every non-output stack is satisfied by taking `K = Unit` (there is none) and
by the fact that the machine pops every input digit anyway; with the
connector's `K = Bool` it would also hold, at the cost of carrying "the input
stack is now `[]`" through the induction. So the step the connector "would
expect to cost a day" costs one constructor and one type choice.

**What it would give.** Guidance for every future `FinTM2` witness in this
repo: end every halting branch with `load (fun _ => initialState) halt`, use
one stack unless two are needed, and state configurations at the machine's
own `Cfg` type.

**Falsification.** The no-`load` mutant (C1, "distrust"), which fails exactly
and only at the halting-configuration lemma.

**Novelty.** Project-internal; it is a reading of Mathlib's definition
(`Computable.lean:118–123`), not a result.

## 4. What survived

All four. C1 is the deliverable and it is a kernel-checked theorem with the
project's allowed axioms; C2 is the topic's stated goal, `#print axioms`
clean; C3 and C4 are its two immediate consequences. What I would seed first
is C1, as a single node whose statement is exactly `Talus8.periodic_polyTime`
with `IsEventuallyPeriodic` unfolded, sized **M** — about 150 lines of Lean,
none of it hard, and the two friction points above documented so a prover
does not pay for them again. Whether it belongs in `Rule30/Statements.lean`
at all, given that it names no rule 30 object, and whether `Prize.lean`'s P3
is then restated, are captain-and-Dib decisions the brief reserved; this
document only says the precondition `docs/prize.md` set for them is now met.

## 5. Claims that died

Nothing about any automaton died, and no claim died for lack of depth; every
death below is a shape of the construction or of its Lean proof.

- **"`σ = ZMod p × ZMod p × Fin (N+1)`, one label, one step per digit"** (the
  connector's sketch, and my first draft). Two components short. `Fin (N+1)`
  alone cannot track `min(n, N)` least-significant-digit-first, because the
  digit at position `i` adds `2^i`, so the cap needs `min(2^i, M)` beside it;
  and `pop k f q` hands the popped `Option` to `f` and not to the
  continuation `q`, so "was the stack empty" has to be written into `σ` as a
  flag before `branch` can see it. Died at the definition, before any Lean.
- **"`M = N` suffices."** With the cap at `N`, the periodic branch needs
  `f (N + ((n − N) mod p))`, which is a subtraction in `ZMod p` and a second
  modular argument. `M := N * p` makes it `f (M + n mod p)` with
  `Nat.add_mul_mod_self_right` and one induction on the multiplier. Died on
  paper.
- **"`show step c = _` bridges `flip bind step (some c)`."** `show` failed:
  with the configuration a metavariable, `isDefEq` reduces `TM2.step` into a
  stuck `match` and never assigns it. Died at the first run; replaced by the
  `rfl` lemma `flip_bind_some` and `rw`.
- **"Configurations can be stated as `TM2.Cfg.mk … : TM2.Cfg (fun _ => Bool)
  Unit σ`."** `rw` then fails to find `flip bind ?g (some ?a)` because the
  `Option` type argument is `(mach ..).Cfg` on one side and the unfolded type
  on the other, defeq but not at `instances` transparency; the error's
  footnote "not type-correct under the `implicit` transparency level" is the
  tell. Died at the second run; replaced by the `cfg` helper.
- **"`rw [hin]` with `hin` stated at `Equiv.refl Bool`."** The goal's term is
  `@Equiv.invFun (tm.Γ tm.k₀) Bool (Equiv.refl _)`; different implicit
  arguments, no match. Died at the second run.
- **"`if b then w else 0` in the state update, closed by `cases b <;> simp
  <;> omega`."** `simp` rewrote `min` into `if` and `omega` reported a
  counterexample that was not one (it had lost `min (2^i) M`). Replaced by
  `b.toNat * w`, which needs no case split in `ZMod p`, and by `generalize
  2 ^ i = t` before `omega` in `Fin`. Died at the first run.
- **"`decide` closes the negative control on `Option Cfg`."** No `DecidableEq`
  on a configuration whose stacks are functions; mapped through `c.l.isSome`
  to `Option Bool` first. Died at the third run.
- **The wrong-answer mutant as a *rejected* file.** My first plan was to let
  Lean reject the cap-less machine at `target_eq`. A rejected theorem shows
  less than an accepted counterexample, so the mutant file is instead
  accepted and proves, by kernel evaluation, that the machine outputs
  `[false]` where `f₀ 0 = true`. Not a death so much as a better instrument,
  recorded because the first instinct was the weaker one.

## 6. Next topic

The rule-90 witness, as a theorem rather than a script. The connector's
litmus needs the model to admit a fast machine for a **genuinely aperiodic**
sequence, and its witness is rule 90's column 1, black exactly at
`t = 2^j − 1` for `j ≥ 1` — checked in `explorer/pantograph_shortcut.mjs` to
20,000 rows and nowhere in Lean. Rule 90 is already definable on the board
(`Rule30/Basic.lean` defines all 256 rules through `step (r : Fin 256)`), so
the topic is two bounded claims: that column 1 of rule 90 from a single black
cell is `decide (∃ j ≥ 1, t + 1 = 2^j)`, a Pascal-triangle-mod-2 fact with a
short induction, and that a `FinTM2` computes it in `|input| + 1` steps — the
machine is C1's with `σ = Bool × Bool` ("exhausted?", "all digits so far 1")
and needs no `ZMod` at all. With both, C4(b) becomes a statement about an
elementary cellular automaton with the same seed as rule 30, and "P3 is not
implied by P1" is machine-checked in this repo rather than measured. The
threshold question (polylog against Ω(n)) remains the connector's Topic 2 and
wants a complexity theorist, not this; and the one row of the connector's
model dictionary still argued rather than proved — that an infinite
work-stack alphabet cannot smuggle information into a `FinTM2` — is worth a
short Lean fence before `Prize.lean` is restated, since a cheating machine
there would make `P3Core` false for a stupid reason exactly as `TM0` did.
