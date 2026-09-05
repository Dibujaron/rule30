# Lean → FP glossary

The owner of this project reads functional programming fluently (TypeScript and
Kotlin) and is learning Lean. **Every agent working here must translate Lean
concepts into those terms when reporting to a human.** See `CLAUDE.md`.

This is a living document. When you catch yourself using a Lean term that isn't
here, add it.

## The bridge

A theorem *statement* is a **type**. A proof is a **value of that type**.

```kotlin
val foo: P = someValue          // Kotlin
```
```lean
theorem foo : P := someProof    -- Lean
```

"Proving a theorem" means "constructing a value that typechecks at the required
type." Almost everything else follows from this.

## Terms

| Lean | Nearest FP equivalent | Notes |
|---|---|---|
| `sorry` | Kotlin `TODO()` | Inhabits any type, so the build still passes. A hole. |
| `by ...` | A builder DSL block | Opens *tactic* mode — a program that constructs the proof value. |
| tactic | A step in that builder program | `simp`, `decide`, `rfl`, `induction` … |
| `decide` | Exhaustive `when` that the compiler *runs* | Brute force over a finite domain. |
| `rfl` | "both sides reduce to the same thing" | Proof by computation. |
| `simp` | Rewrite/normalize with a rule set | The workhorse tactic; can be slow and surprising. |
| Mathlib | The math standard library | Huge. The skill is knowing what's already in it. |
| `Prop` | The type of propositions | Distinct from `Type`, which is the type of data. |
| `ℤ → Bool` | `(i: BigInt) => boolean` | A CA configuration is literally a function. |
| `Fin n` | Branded/refined int, `0..n-1` | `Fin 256` = a rule number. |
| `∀ n, P n` | A generic function `(n) => Proof<P<n>>` | Universal quantification is a function type. |
| `∃ n, P n` | A pair `(witness, evidence)` | Like a data class holding the value *and* the proof. |
| `theorem` / `lemma` | No formal difference | Convention only: `lemma` = smaller helper. |
| `elan` | `rustup` / `sdkman` | Toolchain version manager. |
| `lake` | `cargo` / `gradle` | Build tool and package manager. |
| `lake build` | `gradle build` | Typechecks everything. |

## The DAG is a build graph

Read the theorem DAG as a Gradle task graph. This analogy is load-bearing for
the harness and holds up well:

| DAG term | Build-graph equivalent |
|---|---|
| node | a task |
| edge | a dependency |
| a node with `sorry` | an unbuilt task |
| **open leaf** | a task whose dependencies are all satisfied — *ready to run* |
| the **frontier** | the current set of ready tasks |
| closing a leaf | a task completing, freeing its dependents |
| dispatcher | the scheduler picking ready tasks |

## The `sorry` hazard

**A build full of `sorry` passes.** `lake build` succeeding means the statements
are well-formed, not that anything was proved — exactly like a Kotlin project
full of `TODO()` compiling green.

This is why `npm run verify` audits for `sorry` and fails on any that isn't a
whitelisted prize conjecture. Never report "the build passes" as evidence that
a proof landed; report the sorry audit.
