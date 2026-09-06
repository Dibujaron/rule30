# Learning Lean through TypeScript and Kotlin

Lean's ideas mostly have close relatives in functional programming. If you write
FP in TypeScript or Kotlin — as Dib does — you already hold most of the
concepts and are mainly learning new names, plus one genuinely new idea
(dependent types).

This document anchors Lean vocabulary to things you already know. It is
scaffolding toward reading Lean directly, not a permanent translation layer —
so it always gives the **real Lean term**, and it says **where each analogy
breaks**, because an analogy whose seams you can't see quietly becomes a
misconception.

Living document. When you hit a term that isn't here, add it.

## The bridge

A theorem *statement* is a **type**. A proof is a **value of that type**.

```kotlin
val foo: P = someValue          // Kotlin
```
```lean
theorem foo : P := someProof    -- Lean
```

"Proving a theorem" means "constructing a value that typechecks at the required
type." Most of the rest follows from this. It's called the Curry–Howard
correspondence, and it is exact rather than metaphorical.

## Vocabulary

| Lean | What you already know | Where the analogy breaks |
|---|---|---|
| `sorry` | Kotlin's `TODO()` — a hole that still typechecks | `TODO()` is honest: it throws at runtime. `sorry` never fails; it silently yields an unproved theorem. Strictly more dangerous. |
| `by ...` | A builder DSL block (`buildString { }`, Gradle) | It builds a *proof value*, and it runs at compile time. |
| tactic | One step in that builder | No real equivalent — tactics are metaprograms that can inspect the goal. |
| `rfl` | "both sides are already the same" | Not `==`. It's equality *after computation* (definitional equality), which is subtler than it looks. |
| `decide` | An exhaustive `when` the compiler actually runs | Requires the proposition be *decidable* (an algorithm exists). It evaluates during typechecking, so it can be slow or blow up. |
| `simp` | Normalize with a rewrite rule set | Nondeterministic in practice — the rule set is huge and results can surprise you. |
| Mathlib | The standard library, for math | Far bigger than any stdlib you've used. Searching it (`exact?`, `apply?`, Loogle) is its own skill. |
| `Prop` | The type of propositions | Proof-irrelevant: any two proofs of the same `Prop` are considered equal. No FP analogue. |
| `ℤ → Bool` | `(i: BigInt) => boolean` | None — a CA configuration really is just this function. |
| `Fin n` | A branded/refined int, `0..n-1` | Carries a *proof* of the bound, not just a tag. |
| `∀ n, P n` | A generic function `(n) => Proof<P<n>>` | The return **type depends on the argument's value**. TS and Kotlin can't express that; this is the genuinely new idea. |
| `∃ n, P n` | A pair of `(witness, evidence)` | In `Prop` you generally *cannot* extract the witness as runtime data. It's a pair you can't always destructure. |
| `induction n` | A recursive function on `n`: a base case for `0` and a step case that calls itself on `n - 1` | The recursive call is the induction hypothesis `ih`, and it is a *proof*, not a value that gets computed. Lean checks the shape terminates; nothing ever runs. |
| `theorem` / `lemma` | Same thing | Pure convention: `lemma` signals a smaller helper. |
| currying | `(a) => (b) => c` in TS | Not opt-in — *every* Lean function takes one argument. `f a` with `f : A → B → C` is a value of type `B → C`, so there is no such thing as arity, and no "missing argument" error. You get a type mismatch instead. |
| `elan` | `rustup` / `sdkman` | — |
| `lake` | `cargo` / `gradle` | — |
| `lake build` | `gradle build` | Typechecking *is* the verification. There's no separate test run. |

## Naming conventions

Lean names look cryptic from an industry-code perspective. Two different things
are going on, and only one of them is a licence for terseness.

**Theorem names are a searchable encoding of the statement**, not an
abbreviation for convenience:

```lean
add_comm         -- a + b = b + a
mul_le_mul_left  -- multiplication preserves ≤ on the left
succ_ne_zero     -- n + 1 ≠ 0
```

You can derive the name from the statement and vice versa — closer to a
chemical formula than an identifier. That is what makes ~200k Mathlib lemmas
findable, and it is why the terseness is earned.

**Definitions of concepts use full words.** `Continuous`, `Differentiable`,
`IsCompact`, `MeasureTheory.Measure`. The surviving abbreviations (`deriv`,
`iff`, `comm`, `assoc`) are ones the field already used — not ones an author
coined. Terseness at the call site comes from a **namespace**, the same trick
as a Kotlin `object` or a TS module:

```lean
namespace ElementaryCA
def step (r : Fin 256) ... -- `step` inside, `ElementaryCA.step` outside
end ElementaryCA
```

Case carries information:

| Kind | Case | Example |
|---|---|---|
| Types, structures, `Prop`s | `UpperCamelCase` | `Continuous`, `IsCompact` |
| Definitions returning data | `lowerCamelCase` | `padicValNat` |
| Theorems and proofs | `snake_case` | `add_comm` |

So an ordinary code-review instinct about naming transfers intact. What does
*not* transfer is that theorem names get to be cryptic — and only because they
are systematically cryptic.

## The DAG is a build graph

Read the theorem DAG as a Gradle task graph. This one holds up well:

| DAG term | Build graph |
|---|---|
| node | a task |
| edge | a dependency |
| a node with `sorry` | an unbuilt task |
| **open leaf** | a task whose dependencies are satisfied — *ready to run* |
| the **frontier** | the current set of ready tasks |
| closing a leaf | a task completing, freeing its dependents |
| dispatcher | the scheduler picking ready tasks |

Where it breaks: build tasks are cached by input hash, whereas a proof is
either there or not — and a proof can be *wrong* in ways a build artifact can't
(see below).

## The `sorry` hazard

**A build full of `sorry` passes.** `lake build` succeeding means the statements
are well-formed, not that anything was proved — exactly like a Kotlin project
full of `TODO()` compiling green. Lean emits a warning, but the build is green.

This is why `npm run verify` audits for `sorry` and fails on any that isn't a
whitelisted prize conjecture. Never offer "the build passes" as evidence that a
proof landed; cite the sorry audit instead.
