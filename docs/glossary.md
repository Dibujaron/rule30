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
| half-line (`evolveHalfLeft`, `evolveHalfRight`) | The infinite row is `(x: BigInt) => boolean`; a half-line is the same automaton run over a `boolean[]` indexed from position `-1` leftward (or `1` rightward), whose one missing neighbour, position `0`, is read from a *given* sequence `c: (t: number) => boolean` instead of computed | A cell at `x ≥ 1` reads only `x-1, x, x+1`, all `≥ 0`, so the right half really is a function of its own row 0 plus the centre column, and the left half is the mirror. The seam: the boundary is an input, not a result, so a half-line can be fed a centre column no real row produces — and the natural statement about arbitrary boundaries is false (`docs/obstructions.md`, "The centre column as a boundary condition"). The agreement theorems in `Statements.lean` are what tie each half-line back to a real `Config`. |
| `wall` (node size) | A build-graph task tagged "do not start, split first": its deps are done, so it *is* an open leaf, but the scheduler's model ladder for it is empty (`S`→haiku/sonnet/opus, `M`→sonnet/opus, `L`→opus, `wall`→nothing), so `run` never dispatches it and `status` lists it under "walled leaves" | It is a *size*, not a status — the node is still `open`, and it stays `wall` until a captain seeds a tier of sub-nodes beneath it and it becomes the last rung of that tier, the way a ticket becomes an epic. Nothing about the maths is encoded: `wall` is the captain's claim that no single session should be spent here, and a wall that is one of the prize conjectures (both P1 residuals) will never come down, only the walls that are gaps in a decomposition do. |
| connector (session kind) | A second kind of hand-started agent beside the theorist, like a second `bin` script in the same package sharing the same libraries: `connect` reuses the theorist's slug, date and default problem, the prover's turn loop and the roster's naming ceremony, and differs in its brief (thin: six inputs), its fence (`docs/connections/`, no obstructions file, the web read-only) and its report (`sighted`, `next_vantage`) | It is the one role whose `--allowedTools` differs from the others' — `WebFetch` and `WebSearch` are granted on the command line, not in the guard — so "the guard bounds what a worker may do" has a seam here: the CLI refuses the two tools to every other role before any hook fires, and the guard only ever sees a connector's calls to them. |
| sighting | The connector's one deliverable, a document with six fixed sections; think of a design review written by an outsider to the codebase — same template every time so several can be read side by side | Nothing in it is checked by a machine. `connector.run` reports whether the file exists and how big it is, and that is all; a sighting's claims reach the board only through a captain, a theorist's falsification and the seed check, the way a design review reaches `main` only through someone writing the code. |
| vantage | The optional argument to `connect`: a field to attack the problem from ("ergodic theory and damage spreading"). It names the file (`<date>-<slug(vantage)>.md`) the way a branch name names a worktree | It never changes the problem. The problem is always the P1 frontier wall as the board has it (`theorist.default_topic`), and a captain who wants a different wall names it *inside* the vantage text; with no vantage the file is named for the problem and the connector chooses a field itself. |
| dictionary (in a sighting) | A table mapping this project's objects to another field's, row by row — the row of cells, the picture, the centre column, the left diagonals, the seam, the damage front — ending with the rows where the correspondence breaks. An adapter interface between two libraries, written out method by method, with the methods that have no counterpart listed too | A resemblance is not a dictionary. The brief's rule is that a connection without a table cannot be tested and is not a connection; the seams are the deliverable as much as the matches, because a seam is what a theorist attacks first. |

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

## The check that fails on exactly its own case

A **correlated blind spot** is a check whose failure is triggered by the very
condition it exists to detect. Not a check that is flaky, and not one that is
wrong everywhere — one that is right for every ordinary input and wrong for
the input it was written for.

Four instances, three of them found on 2026-09-10 within a few hours:

| The check | Works for | Blind to |
|---|---|---|
| `verify.statement_of` | any statement whose signature fits one line | the longest signatures — Lean wraps them, putting the name alone on its line |
| `claude.gleam`'s rate-limit decoder | `0.94`, `0.97`, `0.99` | `1`, which JSON writes bare as an integer — and utilization is `1` exactly when the window is full |
| `lake env lean Rule30/Statements.lean` | a file with a broken proof | a file whose theorems escaped the namespace: it compiles, so the check passes on precisely the file it needed to fail on |
| a falsification witness that times out | a false statement, which short-circuits instantly | a true one, which pays the full exponential — so timing out *correlates with the statement being true* |

The TypeScript anchor is the one everyone has written:

```ts
// Works for every list you will type in a test.
const median = (xs: number[]) => xs.sort()[Math.floor(xs.length / 2)];
```

`sort()` without a comparator sorts *lexicographically*, so this is correct
for single digits and wrong the moment a number reaches double figures. The
test you would naturally write — `[3, 1, 2]` — passes.

**Where that anchor breaks, and it is the whole point.** The `median` bug is
merely *likely* to survive testing. These four are *guaranteed* to, because
the triggering input is not rare — it is the case the code was written to
handle. Look at the tests that sat beside the rate-limit decoder: `0.94`,
`0.97`, `0.99`. All fractional, all green, and not one of them could ever have
caught it, because a full window is the only interesting window and a full
window is the one that serialises as an integer. The tests were not
insufficient. They were pointed away from the subject.

So the usual defences do not apply. More tests of the ordinary case add
nothing. Coverage is already total — every line ran. Code review does not help
either, because the code is a faithful implementation of a rule that is right
almost always; three separate people read `starts_with(name <> " ")` and none
of them thought about wrapping.

**What does work is naming the correlation out loud.** Ask what input the
check exists to catch, then ask whether that input is *shaped differently*
from the inputs you tested. A full window is an integer. A long signature
wraps. An escaped theorem still compiles. A true statement never terminates.
In each case the answer was available without running anything.

**The fifth instance is the worst, because the tell was in the agreement.**
Two of us ran the suite in different worktrees on different code. Both got
`325 passed`. An identical number reached independently is the strongest
signal a measurement can give you — it is what reproducibility *looks* like —
and we both read the match as evidence that nothing load-sensitive was going
on, because a load-sensitive fault should have produced two different numbers.

It was evidence for exactly the opposite. One slow test was killed by a
timeout and eunit aborted its whole module, so the run stopped at a fixed
point in a fixed order: 325 every time, regardless of *what* made it slow.
A deterministic abort point manufactures agreement. The number was stable
because the suite was broken in the same place twice, and stability
impersonated a working instrument.

So add a question to the two above: when two measurements agree, ask whether
they agree because the thing is real or because they share a mechanism that
would produce the same answer either way.

Every one of these was caught by someone publishing a premise before the
conclusion that rested on it — "I have not verified that `decode.float`
rejects an int", "I believe the timeout is 5 seconds but have not found where
it is set", "this is inference about your run, not a fact about it". The
catches all landed on sentences their own author had already flagged as
load-bearing and unchecked. The mistakes that survived were the ones stated
flatly. That is the habit, and it is cheaper than any amount of review:
**say which of your premises you have not checked, in the same breath as the
conclusion you are drawing from them.**

### A measurement that includes its own apparatus

Twice in one evening a process query answered confidently about the wrong
subject, and the two failures look identical from the outside while being
opposite underneath.

```powershell
# 1. Invents a value it does not have
$_.CommandLine -match 'rule30-([a-z]+)' ? $Matches[1] : 'SHARED'
# lake.exe's command line is bare — the tree is its working directory, which
# is not in the command line at all. Everything unmatched was labelled SHARED,
# so the table confidently reported a live run in the shared checkout.

# 2. Reports a true observation of the wrong subject
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'rule30-keel' }
# Returns the powershell running the query, because the query string is in
# that process's own command line. Four hits for a thing believed to be zero.
```

The first is a **default masquerading as an observation**. The second is a
**measurement that includes its own apparatus in the sample** — nothing is
invented, every row is real, and the set is wrong. Both produce a well-formed
table, which is why they feel alike and why neither is caught by looking
harder at the rows.

The TypeScript form is the one everyone has hit:

```ts
const files = await grep(pattern);   // finds the script containing pattern
```

**The tell in the second case was the number, not the rows.** Four processes,
for something believed to be zero, is a count easier to explain than to
doubt — and the explanation arrives fast because it is alarming. Ask what
your instrument is made of before asking what it found.

**A third mechanism, and it needs no faulty instrument at all.** An hour
later the same query was quoted correctly and was still wrong:

    12:3x  git worktree list  ->  one row, the shared checkout   (true)
    12:38  git worktree add ../rule30-keel-gloss                 (subject changes)
    12:4x  "git worktree list now shows only the shared checkout" (false)

Nothing was invented and nothing sampled itself. A true observation was
quoted after its subject had moved, by the same session that moved it. This
is the same error as calling a worktree "current at 555ce33" when it was
current with respect to a branch and stale with respect to `main` — a fact
whose truth had an expiry that was not written down beside it.

So the fix is different from the two above, and it is not a better query:
**quote a measurement with the moment it was taken, or take it again.** "Now
shows" is the tell — a present-tense verb attached to a past-tense reading.

Related: `an-artifact-that-answers-the-question-exists-and-nothing-points-at-it`
on the board. And on a stale worktree versus a stale branch, which is the same
distinction one level out: a branch ref carries no `harness/build/`, so nothing
can be built from it without a deliberate checkout, while a worktree carries a
compiled harness that runs the moment someone types a command in it. The
dangerous artifact is the one that is already loaded.

### Mark which kind of sentence you are writing

A sentence reporting an **observation** and a sentence proposing a **cause**
travel differently, and they are almost always written in the same tone, in
the same paragraph, by the same person, in the same breath.

    before: 0 lake/lean processes        <- observation
    so the orphaned build exited on its own  <- theory

The first is a fact about one moment. The second is a claim about a
mechanism, and it is the one that gets quoted onward, acted on, and written
into a row. On 2026-09-10 those two left in one paragraph; the theory reached
a third party as a settled fact within minutes, was retracted, was re-asserted
in the opposite direction by someone else, and the honest answer turned out to
be that nobody knew. Three sequential confident accounts, each built on the
previous one's artifact.

Slowing down would not have prevented it — every step was quick because every
step felt like reporting. **Marking would.** Say "observed" and "I think",
and the reader can tell which sentence carries your authority and which
carries your guess. It costs two words and it is the only defence that works
at the speed people actually write at.

The TypeScript instinct is already there and just needs applying to prose:
you would not give `parseResult` and `inferredType` the same name in code.

### A decoder's fallback is a live default, not error handling

Gleam's `decode.failure` takes two arguments, and the first is a **value**:

```gleam
Error(Nil) -> decode.failure(Closed, "Outcome")   // dag.gleam:483
```

That reads as "report a failure". It also supplies `Closed` — meaning
*proved* — as the value to use if the caller tolerates decode errors. So the
question "how strict should this decoder be?" is not abstract: loosening this
one would not make an unknown outcome shrug through, it would make a
**refused attempt read as proved**, closing nodes nobody proved, in a project
whose founding rule is that nothing is proved by assertion.

The TypeScript anchor is the one everybody has written:

```ts
const status = parse(raw) ?? "ok";    // the ?? is the decision, not the parse
```

Nobody thinks of `?? "ok"` as error handling, because it is on the same line
as the thing it defaults. `decode.failure(Closed, "Outcome")` hides the same
decision behind a word that means the opposite. **Read the fallback value
before deciding how strict to be** — it is the behaviour for every case the
author did not think of.

**And note where the safety actually lives.** `outcome_decoder` hands back a
fallback; `dag.decode` is what refuses to use it, by running the decoder
through `json.parse` and mapping any error to `Error`. So the danger is in
one file and the thing that neutralises it is in another, invisible from
where the risk is. Anyone who later calls `outcome_decoder` down a path that
tolerates decode failures reopens the trapdoor without editing the file that
contains it.

Which is this section's own subject again, one level up: the mechanism that
makes it safe is real, correct, and reachable from nothing you would read
while looking at the danger.

Related: `well-formed-and-wrong` in `CLAUDE.md`'s Boundaries, which is this
shape's consequence rather than its cause — a correlated blind spot is one of
the ways a record ends up confident, correctly formatted, and false.
