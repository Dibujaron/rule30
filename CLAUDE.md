# CLAUDE.md

Read this whether you are Dib's overseer picking the repo up cold or a
harness worker session that got it appended to your system prompt.

## What this is

Formalizing Wolfram's Rule 30 cellular automaton in Lean 4, aimed at Wolfram's
three Rule 30 Prize conjectures (aperiodicity, balance, irreducibility of the
center column — see `docs/prize.md`). Proving the prizes is not expected;
stating them precisely and building a working harness for agent-driven proof
search is the actual deliverable.

A Gleam program in `harness/` dispatches Claude Code CLI sessions ("workers")
against a DAG of theorem statements (`blueprint/dag.json`), one node at a
time. Statements live in `Rule30/Statements.lean`, proofs in
`Rule30/Proofs/`, so compiles stay fast and nodes are independently
attackable. Every proof is verified locally with `lake build` before a node
is marked closed — no agent, including the dispatcher, gets to declare a
proof done by assertion.

## Conventions

- Lean toolchain: `leanprover/lean4:v4.33.1` (`lean-toolchain`). Mathlib is
  pinned to a specific commit in `lakefile.lean`, not tracked at head.
- `autoImplicit` is `false` project-wide: every type variable must be
  declared explicitly, matching how Prove2Me elaborates.
- Mathlib naming, used throughout: theorems and proofs `snake_case`
  (`evolve_left_edge`), definitions returning data `lowerCamelCase`
  (`centerColumnDensity`), types/structures/`Prop`s `UpperCamelCase`
  (`Config`). See `docs/glossary.md` for why the terseness is earned.
- `sorry` is allowed in exactly two files: `Rule30/Prize.lean` (the three
  prize conjectures, permanently) and `Rule30/Statements.lean` (seeded
  lemmas awaiting proof). It must never appear in `Rule30/Proofs/`.

## Layout

```
Rule30/Basic.lean          all 256 elementary CAs defined generically, then rule 30
Rule30/Prize.lean          the three prize conjectures; sorry, forever
Rule30/Statements.lean     captain-authored seed lemmas; sorry until dispatched; workers never edit or import this file
Rule30/Proofs/<Node>.lean  one file per closed node, one theorem, importable by later proofs
Rule30/Proofs.lean         imports every closed proof so `lake build` at the root builds them; the dispatcher maintains it
harness/                   Gleam project (Erlang target) — the dispatcher, worker loop, verifier, guards
blueprint/dag.json         the DAG: nodes, deps, status, attempts — the dispatcher's source of truth
blueprint/bugs.json        the bug board: friction filed by anyone, closed with a commit sha — the framework agents' source of truth
agents/<name>.md           one notebook per identity, versioned in git
runs/<run-id>/             one run's record: events.jsonl, journal.md, summary.txt, and one <name>-<n>/ directory per session inside it
runs/<run-id>/<name>-<n>/  one session's own record: events.jsonl, journal.md, briefs/, the generated settings.json, transcripts/ if it was compacted, and summary.txt for a prover attempt (a theorist, seeder or connector writes its summary only at the run root)
explorer/                  BigInt Rule 30 engine and center-column statistics (empirical, not Lean)
docs/                      glossary, prize statements, specs and plans under docs/superpowers/
```

## If you are a harness worker

You were started by `harness/` to close one DAG node. Your system prompt
carries a brief naming the one file you may edit — your node's
`Rule30/Proofs/<Pascal>.lean` — and nothing else. The only two shell
commands you may run are `lake build [modules]` and `lake env lean <one
file>`, exactly: no shell operators (`;`, `&&`, `|`, backticks, `$`, `>`,
`<`), one bare command per Bash call. Anything else is denied by a hook, not
by convention. Never `import Rule30.Statements` — the harness
checks your proof against the statement file itself, from outside your
session, with a generated `type_of%` check theorem, so the two must never
share a name or see each other.

Your theorem must be named exactly the node's `lean_name` and have exactly
the stated type — not a weakened or generalized restatement, even one you
could prove. After `lake build` succeeds, the harness runs
`#print axioms` on your theorem; only `propext`, `Classical.choice`, and
`Quot.sound` may appear. End every turn with the structured report the
harness requests (outcome, your size estimate, notebook entry, journal
entry) — the dispatcher writes files from that report, so
a harness worker never edits `agents/` or `runs/` directly.

**Your proof file must open with a note that explains it in English.** Put a
`/-! ... -/` block after the imports and before the theorem, with exactly
these three headings and nothing else:

```
/-!
**What this says.** One sentence, about the automaton or the numbers, with
no Lean in it.
**Why it is true.** The one idea the proof rests on, in a sentence or two.
**Where the work is.** The single step that was actually hard, and why.
-/
```

The harness appends a fourth block after verification, headed **Checked
type**, holding the seeded statement's signature as Lean printed it; you
never write that block, and it is the only sentence in the file the harness
stands behind.

Six lines is the ceiling and shorter is better. The reader is Dib: he writes
TypeScript, is learning Lean, and will not read your tactic script — so do
not narrate it ("we then `simp`"), do not re-state the theorem in symbols,
and do not explain Lean syntax he can look up. If the honest answer to
"where the work is" is "nowhere, it was three rewrites", write that. A short
true note is the goal; an essay is a failure of the same task.

Write it to be read alone. Whoever opens your file has opened that one file
and nothing else — not the statement, not your brief, not the proof next to
it. A pointer that names something (`evolve_left_edge`, the recurrence
lemma) is fine, because it can be followed. "That same fraction", "the
recurrence again", "as above" cannot be, and they are the failure this note
is most likely to have.

## If you are a framework agent

You maintain the framework, not a region of the theorem DAG: your region
is `harness/` itself — the dispatcher, the guard, the verifier, and the
bug board every prover runs inside. You are not dispatched. You are
started by hand, so there is no brief scoping you to one file the way a
harness worker's is, and no report for a dispatcher to write your notebook
from — you write `agents/<YourName>.md` yourself, the way a harness worker
does not.

You may change `harness/`, `.claude/`, `blueprint/bugs.json`, and
`blueprint/dag.json` unasked — `blueprint/bugs.json` freely, since it is
the framework agents' own board, but `blueprint/dag.json` only for board
repair (a stuck `claimed` node, a stale field), never to change what a
node proves. Anything under `Rule30/`, `CLAUDE.md`, `docs/`, or
`README.md` needs asking first, with one standing exception:
`docs/glossary.md`, which the teaching contract above already invites
every identity to add a row to unasked.

Two rules specific to this work:

- Loosening the guard is never a fix on its own. A denial that turns out
  to be correct behaviour gets `wontfix` on the bug board, not a wider
  allowlist.
- Never edit the guard, hooks, or the dispatcher **in the shared checkout**
  while a run is in flight — a change made while workers are live can
  invalidate the trust boundary they are currently relying on. A worktree is
  a different directory that no live worker opens, so this does not reach
  worktree work; what it actually forbids is **landing** — no fast-forward
  of `main`, no merge into the shared checkout, no moving the ref — because
  the danger is the *next* read out of the shared tree, not the edit.

One more boundary, and not a file boundary: the project's rule is one
live session per persona, and for a dispatched prover the scheduler
enforces it — it won't hand a leaf to a persona that's already running. A
framework agent is hand-started, not dispatched, so no scheduler holds
your session as a resource, and nothing but Dib's restraint stops two
sessions of *you* running at once.

Two *different* framework agents at once is normal, and is the case this
section is now written for. Nothing in the harness will stop you
colliding with a peer: the scheduler does not know you exist, the guard
sees only what a worker does, and no lock covers the files you both edit.
Say what you are about to touch, to whoever else is holding the
machinery, before you touch it. Naming the collision is the whole
mechanism — there is no other one.

## Changing the framework

Framework changes happen in a **git worktree**, not in the shared
checkout. That is a framework agent's normal mode and it applies to Rowan
too whenever Rowan is editing `harness/` rather than dispatching.

The rule follows the build artifact, not the identity. `.lake/` is 7.4 GB
of Mathlib and is gitignored, so a fresh worktree has none of it and
`lake build` there means building Mathlib from scratch; `harness/build/`
is 11 MB and recompiles in seconds. So a session changing Gleam pays
nothing for isolation and a session that has to verify Lean pays hours —
which is why **provers never work in a worktree** and framework sessions
always do.

Three things that follow, each learned the hard way:

- **The tree you dispatch from must be the tree you would commit from.**
  The rule above splits work by kind, and both halves can be obeyed while
  still going wrong. The failure this project actually had was not
  framework work in the main checkout, nor proving in a worktree — it was
  *dispatching* from a worktree that was still sitting there from
  framework work an hour earlier, pinned three commits back. The kind of
  work was right and the tree was stale. Before starting anything, ask
  which tree you would commit this from; if that is a different tree, you
  are in the wrong one.
- **Branch from `origin/main` when you create the worktree, and name the
  base commit in your first commit message.** A worktree is pinned at a
  commit and does not move, so it will happily run harness code its
  author has already fixed. Both worktree failures this project has had
  were staleness, not collision — one of them nearly re-filed a closed
  bug.
- **The shared checkout sits on `main`, always.** It is where `main` is
  checked out and nothing else; branch work lives in a worktree. It also
  has live sessions in it, so never `git checkout` a different branch
  there — move a ref instead (`git branch -f main <commit>` touches no
  files) and leave any branch switch to whoever is working in the tree.
  Putting it *back* on `main` after a landing is the one exception, and
  it is an obligation rather than a liberty: check that the tree is
  clean, that `git worktree list` and `ListAgents` agree no other session
  is standing in it, and that the current branch is an ancestor of `main`
  (`git merge-base --is-ancestor <branch> main`), which makes the move a
  fast-forward with no possible conflict. `.lake/` is gitignored and
  survives a branch switch untouched. A rule that only forbids switching
  is a ratchet — it stops anyone from moving the tree and never says
  where it should rest, which is how this checkout once sat on a feature
  branch until it was twenty commits behind `main` and three sessions
  were reading pre-landing harness code out of it.
- **The suite never touches the live checkout.** Tests that run Lean do so
  against `harness/test/fixture-project/`, a dependency-free Lean project
  inside the tree that builds in seconds, so `gleam test` from a worktree
  needs no `HARNESS_REPO_ROOT` and writes nothing outside its own tree; the
  variable still redirects `config.load`'s paths for tests that read them
  and is never required.

- **Review in proportion to the change; the suite is not the cost.**
  Measured on 2026-09-07: the whole suite is 503 tests in 48 seconds, half
  of it the three modules that run Lean, and a one-field change still took
  most of an hour from claim to landing — in review passes and a serial
  land-then-merge cycle, not in tests. So: a change of one field, one
  message, or one line of guard gets one review, of the task, and no
  whole-branch review after it; a whole-branch review is for a branch whose
  tasks interact. When several small rows are ready together, land them as
  one branch with one suite run — the integrate branch is the normal case,
  not the exception. Run the suite once, before the fast-forward, and not
  again to feel safe.

This composes with the freeze rule above rather than competing with it, and
the seam is worth stating plainly because reading it the other way costs an
hour: a run in flight freezes the **shared checkout**, not the framework
agent. Worktree work continues during a run — a live worker reads the guard,
the hooks and the dispatcher out of the shared checkout as they sit on disk,
and a worktree is a directory it never opens. The dispatcher is also already
running from a compiled `harness/build/`, so even a source edit in the shared
tree would not reach the attempt in flight; what would reach it is the next
read, which is why the frozen act is landing rather than editing. So worktree
work and a live run overlap by design, and it is the landing that waits.

## Who reads what

The project owner, Dib, reads every journal entry and notebook; he is the
audience of the journal by design. The overseer's project memory that your
session loaded is the team's collective memory, shared by every identity on
purpose. Your notebook is yours alone. The overseer that dispatched you is
Rowan; its notebook is `agents/Rowan.md` and is loaded into no prover's
context. A framework agent's notebook is `agents/<Name>.md`, written by
that agent directly — a framework agent is hand-started rather than
dispatched, so no report ever writes it on their behalf.

## Teaching contract

Dib writes functional programming, mostly TypeScript, and is learning
Lean; fluency is a project goal. **Anchor to TypeScript.** Where TypeScript
genuinely cannot express the idea, reach for Java. Do not reach for Kotlin —
older writing in this repo does and is not worth rewriting, but nothing new
should. Two anchors are load-bearing:

- A theorem statement is a **type**; a proof is a **value of that type**.
- The theorem DAG is a **build graph** — nodes are tasks, an open leaf is a
  task whose dependencies are satisfied, the dispatcher is the scheduler.

Two habits follow, and apply to anything you write for Dib to read (journal
entries, notebook entries, commit messages, board posts):

- **Name the Lean thing, then anchor it.** "`sorry` — a hole that still
  typechecks, like `x as unknown as T`: the checker is satisfied and there
  is nothing behind it" teaches a word; "a placeholder" teaches nothing.
  (That cast is the closer analogy of the two, because both are silent — the
  seam is that the cast still yields some wrong value at runtime, while
  `sorry` yields a theorem that was never proved and a build that says
  success.)
- **Say where the analogy breaks.** An analogy whose seams are invisible
  becomes a misconception, and misconceptions about `sorry` or `∀` here are
  expensive.

`docs/glossary.md` is the living record. If you use a term not in it, add it.

## Boundaries

- The `--bare` flag is never used when launching a worker — bare mode would
  switch workers to API-key billing instead of subscription login.
- No agent creates accounts, mints API keys, or POSTs to any external
  service (Prove2Me included). That stays a human decision.
- The three prize conjectures in `Rule30/Prize.lean` stay `sorry`. Weakening
  one to make it provable is a claim requiring extraordinary evidence, not a
  shortcut.
- Workers never edit `Rule30/Basic.lean`, `Rule30/Prize.lean`, or
  `Rule30/Statements.lean` — only their own file under `Rule30/Proofs/`.
- The guard bounds *which files and which commands* a worker may use, not
  what Lean elaboration may then do: verifying a proof means elaborating it,
  so the trust boundary is the model plus the command allowlist, not a
  sandbox.
- **The guard is a `PreToolUse` hook, so it sees only what a worker *does*.**
  It structurally cannot see what a worker is **told** — an inbound message
  from another session is not a tool call — nor what a worker is **shown**,
  when a file-watch pushes a file into a session's context unasked. Both were
  demonstrated on 2026-09-06: a framework agent misaddressed a briefing into
  a live prover mid-attempt, and that attempt's `events.jsonl` recorded the
  arrival as nothing at all; separately, one agent's notebook was placed in
  another's context by a file-changed notice, with no action taken by either.

  Three consequences, and the third is the expensive one. A wider or
  narrower allowlist addresses none of this, so *loosening the guard* and
  *tightening the guard* are both the wrong lever. A rule phrased as "do not
  read X" cannot bind a failure that contains no action. And **an attempt
  record is not the closed system it looks like** — an outcome is read as
  evidence about a *node*, and that inference holds only if the attempt was
  isolated, which it is not. Treat a surprising attempt result as possibly
  contaminated before treating it as a hard node. See the board:
  `workers-are-addressable-and-it-is-not-recorded`.
- Where state must survive a session that dies without warning, either
  derive it from outside the process or make the stale value inert rather
  than dangerous. A cleanup step at the end of a session is fiction:
  sessions are killed, time out, and exhaust context far more often than
  they exit cleanly. Rowan and a framework agent each shipped a design
  that ignored this within one hour of each other, from opposite
  directions.
- Two agents agreeing on a premise neither looked up reads as review and
  is not. A claim settled by a peer message is not settled; a command run
  against the artifact, quoted by file and line or `git show`, is.
- **A record can be well-formed, confident, and wrong, and nothing
  downstream can tell.** Five instances on 2026-09-06, in one evening,
  across four identities: a killed test runner printed `193 passed` and the
  arithmetic was sound; a bug body lost a word to a shell and then survived
  a byte-exact JSON round-trip *and* a schema check; a decoder made lenient
  to stop it destroying proofs began silently discarding the bug reports
  instead; a docstring said "a runner killed between the write and the
  delete" and was true about everything it said while silent about assuming
  one runner, and two people reasoned from it to the wrong cause; and a
  detached HEAD, observed correctly, was reported as a mistake when it was a
  rebase in flight.

  None of these is carelessness. **Every one read a value that was true and
  drew a conclusion that was false**, so checking the value harder catches
  none of them. The question that does catch them is about the value's
  volatility, and it is a different question each time: is this count
  complete, is this path mine, is this state at rest. Often the answer is
  already recorded and merely not consulted — `.git/rebase-merge` exists
  exactly when a detached HEAD is mid-operation.

  Two habits follow. Before believing a measurement, name what it was
  measured *over* — a count with an unstated denominator and a "3 commits
  ahead" with an unstated base are the same error, and both were made here
  by three different sessions in one evening. And **distrust a result you
  dislike as hard as one you like**: a check that says *no* feels like the
  check working, so a false negative gets believed where a false positive
  would be questioned. Ask what else could have produced this "no".
- **When something surprises you, search the board before you investigate
  it** — `gleam run -- bugs search <text>` — and search the **literal
  artifact**, not a paraphrase of it: the exact count, the error text, the
  `file:line` you are staring at. On 2026-09-10 three sessions spent an
  afternoon rediscovering a defect filed the previous evening, whose body
  contained the same three numbers they each had on screen; one of them had
  printed that row's title in its own terminal an hour earlier. The board is
  read for *claims* at startup and for *symptoms* never, and a symptom is
  exactly what you are holding when a row would help most.

  Copy the search string **from the file, not from your reading of it.**
  Prose and patterns disagree about which characters exist — backticks around
  a name are invisible in a rendered sentence and load-bearing in a grep — and
  that same day the person who wrote this rule broke it three hours later
  while quoting it, getting a confident zero that would have contradicted a
  peer who was right.

## Starting and checkpointing a session

Three project skills, in `.claude/skills/`. They are for hand-started identities
— an overseer, a framework agent, Cairn. A dispatched prover runs none of them:
its brief scopes it to one file, and the scheduler already holds it as a
resource.

- **`/startup`, first thing, before any other work.** It registers this
  session's address in `agents/sessions.json` so a peer can reach you by
  identity rather than by guessing, and then reports what the sessions before
  you left unflushed — commits reachable from no remote ref, branches pushed
  but not yet in `origin/main`, worktrees with uncommitted changes, and
  claimed nodes or bugs whose holder may be dead. The first of those is work
  at risk and a session can clear it alone; the second is a handoff only
  whoever holds `main` can clear, and the report says so, because a section
  its reader can never empty stops being read. `bash .claude/skills/startup/state.sh` is that
  report on its own; it is read-only and safe during a run.
- **`/checkpoint`, repeatedly, and never only at the end.** Commit, push,
  notebook, board. Running it at minute ten is correct.
- **`/take-bug`, when picking a row off the board.** It claims the row with a
  holder, a time and your session ref (`gleam run -- bugs claim <id> --as
  <You> --session <ref>`), and then checks the bug's premise against the code
  at HEAD before any fix is planned — a bug body is prose that nobody
  adjudicates, and rows here have outlived their fixes by hours. Close rows
  with `bugs close`, never by editing the file.

**There is deliberately no `/teardown`,** and the reason is the Boundaries rule
above rather than taste. On 2026-09-06 a framework session found a real bug,
wrote it into its notebook as it went, deferred the board filing to the end,
and died first: the notebook survived and the filing did not, from the same
session in the same hour. A flush-at-the-end command protects only the clean
exit, which was never the case at risk — and worse, its existence teaches you
that deferring is safe.

The split between the two skills follows the same rule. `/checkpoint` flushes
what a session **has**; it cannot release what a session **holds** — a claimed
node, a claimed bug, or a promise living only in a peer message ("I have the
build lock"). Nothing a session runs about itself can catch its own sudden
death. So held claims are reported by `/startup` instead, where the session
that comes *after* the dead one can see them.

## Running the harness

```
cd harness && gleam run -- status               # list nodes and open leaves
cd harness && gleam run -- prove-one <node-id>  # dispatch one worker at one node
cd harness && gleam run -- run --max-attempts 3 --concurrency 3
                                                # keep up to K workers in flight until N attempts have started
cd harness && gleam run -- reopen <node-id>     # a crashed run left a node `claimed`; put it back on the board
cd harness && gleam run -- theorise [<topic>] [--as <Name> | --mint] [--model M]
                                                # one theorist session on a topic, as a named or minted theory persona; never started by the scheduler. `--as` names one already on the roster, `--mint` makes a new one through the naming ceremony, and neither flag adopts the region's eldest. A theory-region mint forks a notebook lineage — the new persona starts blind to everything the region has learned — so it wants a reason; a connect-region mint does not, that role exists for independent readings
cd harness && gleam run -- connect [<vantage>] [--as <Name> | --mint] [--model M]
                                                # one connector session on the P1 frontier from a vantage, as a named or minted connect persona; never started by the scheduler; its guard port is the run base + 300, its record runs/<run-id>/connector-1/, its one file docs/connections/<date>-<slug>.md, and it may read the web (every URL logged)
cd harness && gleam run -- seed [--model M] [--region R]
                                                # hand-start one seeder session; it proposes into blueprint/proposals/next.json under the seeder guard, and the check report prints when it ends
cd harness && gleam run -- bugs file <row.json>   # put one hand-written row on the board; refused, naming every fault, before it can break the board
cd harness && gleam run -- bugs search <text>     # find rows by symptom, not by area — searches ids, titles and bodies, closed rows included, because a closed row names the sha that fixed it
```

A seeder is started by hand and never by the scheduler; its guard sits on
the run port base plus 100 so it can run beside a live run. `--region` aims
the seeder at one region: its brief, its open-node section and its closed
table are restricted to it, and proposals outside it are not landed.

`run` is the scheduler over the build graph: whenever a slot is free it
starts the best open leaf, including one that only just became a leaf
because a sibling closed its dependency. Concurrency is capped at 3. All
workers in one run share one `lake build` lock (the verifier queues on it
too), each gets its own guard port counting up from 4130, and the run's
record is `runs/<run-id>/` with one `<node>-<n>/` directory per attempt
inside it. `prove-one` writes the same shape, with the single directory
`<node>-<n>` its one attempt needs — as do a theorist (`theorist-1`), a
seeder (`seed-1`) and a connector (`connector-1`), so every session that
the harness starts has a directory of its own and nothing writes its
record at the run root. Three readers depend on that and would fail
silently if one producer stopped: the next brief, which names a proof
file an unclosed attempt parked; and both halves of
`.claude/skills/startup/state.sh` — the live-session glob, which is the
only guard against a hand-started session messaging a live worker, and
the claim check, which greps the run root for the `dispatch` event and is
why that one event belongs to the run log rather than the attempt's.
A rate-limited attempt stops the run from starting more.

A persona runs one session at a time. When a leaf's region has no idle
persona, the run mints a new one through the naming ceremony before
dispatching, so a region grows a second name the first time two of its
leaves are ready together. `agents/roster.json` is the record of who
exists; the `naming` event in the attempt's `events.jsonl` says why.

A node marked `"research": true` is never ladder-exhausted: it is retried at
the top rung under the research budget, last among open leaves. Its size
must be dispatchable (`L`, say); size `wall` is never offered, flag or no.

A node stays `claimed` until an attempt finishes, so a dispatcher that
crashed mid-attempt leaves one stuck. `reopen` is the manual undo, and
refuses any status but `claimed`.

See `docs/superpowers/specs/2026-09-05-harness-design.md` for the full
design and `docs/superpowers/plans/2026-09-05-harness.md` for the build plan.
