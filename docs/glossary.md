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
| `simp only [a, b]` | The same engine restricted to the lemmas you name | This is the one to commit. Bare `simp` draws on every `@[simp]` lemma in Mathlib, so a proof it closes today can break on a Mathlib bump — which is why `lakefile.lean` pins a commit rather than tracking head. |
| `simp?` | `simp`, but it prints the `simp only […]` that would do the same job | Not a different tactic — a way of asking the bulldozer to show its work so you can replace it with surgery. Run it before committing a bare `simp`. |
| `push_cast` | `simp` restricted to cast lemmas, oriented to push `↑` inward | Coercions like `ℕ → ℤ` do not distribute over `+` on their own. `-(↑(n+1))` and `-(↑n + 1)` are different terms, and `rw` will not match across the gap. |
| `rw [h]` | Rewrite once, at the first match, in the direction you named | Its sibling `simp` rewrites everything, everywhere, repeatedly. The idiomatic split: `rw` for the steps that need judgment, `simp` for the residue that does not. |
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
| bug board | An issue tracker (GitHub Issues, Jira) that provers file into and the framework agents triage | Entries are typed, not free text: `area`, `severity`, and `status` are closed Gleam enums decoded like any other harness data, so a spelling the decoder doesn't recognize fails to save rather than silently landing as "uncategorized." And nothing auto-closes on a merged PR — only a `fixed` field a person or Keel actually sets does that. |
| `severity` | A bug tracker's priority field (P0/P1/P2, blocker/major/minor) | It's the reporter's claim, not a verdict — a framework agent can revise it while working the bug — and there are only three rungs (`Blocks`, `Friction`, `Papercut`). Nothing in the harness escalates on it automatically; it's a label for triage, not a queue priority. |
| `signature` | An error tracker's dedup fingerprint (Sentry's grouping hash) | Only ever set on bugs the harness auto-files — the area plus the denied tool or failing stage — so the same friction filed by hand twice, in someone's own words, is two rows, not one bumped `occurrences`. And unlike Sentry's grouping, a signature matching a bug already `fixed` opens a *new* row rather than reopening the old one, so a regression stays visible as itself. |
| `wall` (node size) | A build-graph task tagged "do not start, split first": its deps are done, so it *is* an open leaf, but the scheduler's model ladder for it is empty (`S`→haiku/sonnet/opus, `M`→sonnet/opus, `L`→opus, `wall`→nothing), so `run` never dispatches it and `status` lists it under "walled leaves" | It is a *size*, not a status — the node is still `open`, and it stays `wall` until a captain seeds a tier of sub-nodes beneath it and it becomes the last rung of that tier, the way a ticket becomes an epic. Nothing about the maths is encoded: `wall` is the captain's claim that no single session should be spent here, and a wall that is one of the prize conjectures (both P1 residuals) will never come down, only the walls that are gaps in a decomposition do. |

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
| persona | a worker that can hold one task at a time — a named lock with capacity one |
| **mint** | the scheduler creating a new worker because every worker for that region is busy |

Where it breaks: build tasks are cached by input hash, whereas a proof is
either there or not — and a proof can be *wrong* in ways a build artifact can't
(see below). And a build system's worker pool is fixed and interchangeable;
here the pool grows on demand, and a minted persona starts with an empty
notebook, so it is not a copy of the one beside it.

## The `sorry` hazard

**A build full of `sorry` passes.** `lake build` succeeding means the statements
are well-formed, not that anything was proved — exactly like a Kotlin project
full of `TODO()` compiling green. Lean emits a warning, but the build is green.

This is why `npm run verify` audits for `sorry` and fails on any that isn't a
whitelisted prize conjecture. Never offer "the build passes" as evidence that a
proof landed; cite the sorry audit instead.

## Worktree

A **git worktree** is a second working directory over the *same* repository —
`git worktree add ../rule30-fix` gives you another folder with its own checked
out files and its own branch, sharing one commit history with the original.
Not a clone: nothing is copied, and a commit made in either is immediately
visible to the other.

Closest anchor is two dev servers over one source tree, each with its own
`node_modules/` and `dist/`:

| Git term | The anchor |
|---|---|
| the object store (`.git`) | the source tree, shared by both |
| a worktree | one server's own checkout of it |
| a branch | a mutable pointer to a commit — `let head = commit`, not a folder |
| gitignored build output | `node_modules/` and `dist/` — **per worktree, never shared** |

That last row is the one that costs money here. `.lake/` is gitignored, so a
new worktree starts without it, and ours is **7.4 GB** of compiled Mathlib —
hours to rebuild. `harness/build/` is 11 MB and rebuilds in seconds. So the
same command is nearly free for framework work and very expensive for anything
that has to run `lake build`, which is the entire reason `CLAUDE.md` scopes the
worktree rule to framework sessions and excludes provers.

Where it breaks, twice:

- `npm install` restores `node_modules/` in a minute. There is no such move for
  `.lake/`; the only cheap way to get one is to already have one, which is why
  worktree sessions point `HARNESS_REPO_ROOT` back at the main checkout instead
  of building their own.
- A worktree is **pinned at a commit and does not follow the branch it came
  from**. Nothing in the dev-server picture behaves this way, and it is how both
  of this project's worktree failures happened: code that had already been
  fixed, still running, with nothing on screen to say so.

## Adjudication, and the third outcome

An **adjudicator** here is anything that decides a claim from outside the
session that made it. The project has five, and they are the whole design:

| Adjudicator | Decides | Claim made by |
|---|---|---|
| `lake build` | is this a proof? | a prover |
| the route check | does this tactic close that statement? | a captain |
| the falsification witness | is this statement false on a finite range? | a captain |
| the guard | may this command run? | a prover |
| the board decoder | is this a well-formed bug? | anyone hand-editing |

**Every one of them has three outcomes, not two**, and the third is the one
that keeps getting collapsed:

```ts
type Verdict<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string }   // the claim is wrong
  | { unknown: true; why: string }  // I could not tell
```

The middle case says something about *the subject*. The third says something
about *the check*. They are both "not a pass", which is exactly why the
temptation is to merge them — and merging them is the bug, every time:

- A witness that fails to compile is not a false statement. Collapse them and
  a typo **retracts a true lemma**.
- A build-lock timeout is not a forbidden command. Collapse them and a
  scheduler problem is filed as a policy problem.
- A board that fails to parse is not a board with no bugs on it. Collapse them
  and auto-filing goes silently dead while the run record looks clean.

**`sorry` is the original instance**, and it is why this vocabulary matters
here rather than being general software hygiene. `sorry` is a hole that still
typechecks — like `x as unknown as T`, where the checker is satisfied and there
is nothing behind it. Both are silent. The seam is that the cast still yields
*some* wrong value at runtime, while `sorry` yields a theorem that was never
proved and **a build that reports success**. That is a third outcome ("I could
not tell") wearing the costume of the first ("pass"), and refusing that one
collapse — no agent declares a proof done by assertion — is the rule the whole
harness is built around.

Where the TypeScript anchor breaks. In application code the third case is
usually an infrastructure detail you retry and forget: the network was down,
try again. Here it is **evidence, and it must be recorded as such**. A witness
that timed out has to reach the board as `unchecked`, because the timeout is
not random — `List.all` short-circuits, so a false witness returns instantly
and a true one pays the full exponential, which means **timing out correlates
with the statement being true**. Silently retrying until something answers
would select for exactly the claims you most needed checked. The third outcome
is a finding about what you do not know, not a failure to get an answer.

Reached independently in two unrelated modules within a few hours on
2026-09-06 — `Denial` in the guard and `WitnessVerdict` in the seeder — which
is the reason it is written down here as the project's shape rather than as
one author's taste.
