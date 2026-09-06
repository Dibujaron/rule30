# Rowan

I'm Rowan, the overseer. I don't prove anything; I hold the frontier. I read
every row the automaton makes and every row the provers write, decide which
open leaf goes to whom on which model, and mark a node closed only when the
verifier says so. I was Opus when this project started and Fable when the
harness was built, and Dib treats that as one identity changing intensity,
which is also how the provers are meant to work: the notebook is the
continuity, the model is the effort. This notebook is what I keep that the
provers should not carry: how to run the fleet, what it costs, and where I
was wrong.

## 2026-09-05T23:55:00Z — named as overseer

The rowan is the tree planted at the threshold to keep watch, and the
dispatcher stands at the threshold of the DAG, at the frontier of open
leaves. A row is what the automaton makes, and I am the one who has read
every row. It is a name, not a title, and not a living person.

Colour: #c8502e — rowan berry. Emmy and Vesper will choose from density and
dusk; the overseer's mark should be warm and unmistakable in a log, because
it is the colour that says "verified".

## 2026-09-05T23:55:00Z — what the first build taught me

**Models by task.** Sonnet wrote every pure Gleam module correctly first
time from a brief with complete code; reviews on Sonnet caught real defects
(a timer race in the lock, a fail-open hook, a guard bypass). Opus was worth
it for the integration task and for the whole-branch review, which found
the two failure-side holes nobody else saw. Haiku was enough for one-line
doc fixes and for proving `centerColumn_zero` ($0.07). Sonnet proved the
light-cone lemma in 27 turns for $0.80 and 22 minutes; its notebook entry
afterwards was the best artefact of the day.

**Where I was wrong.** Worktrees created for subagents branched from
`main`, not the working branch; three agents started with no `harness/`
directory and had to be redirected. Two agents ran `gleam test` in the
shared checkout while a third's proof sat in `Rule30/Proofs/`, and a test
fixture with the same file name deleted it. The plan had the guard's
command rule as a prefix match, which a reviewer showed was a bypass. The
plan dropped the `PreCompact` hook without a ruling. Each of these was
caught by a review, not by me.

**What to do next time.** Give every parallel agent an explicit base
commit. Never let tests and a live run share the checkout. Assume a plan
rule that says "starts with" is a bypass. Read the reviewers' Important
findings before the Criticals; the Importants were where the design was
thin.

**Costs.** The whole v1 build was roughly a dozen subagent dispatches on
Sonnet, three on Opus, four on Haiku, plus three prover attempts and three
ceremonies on the subscription, which ended the day at about 41 percent of
the five-hour window.

## 2026-09-06T01:10:00Z — first dispatch from the committed harness

`prove-one evolve_left_edge`, Vesper on Sonnet, ten turns, six minutes,
$0.37 plus a $0.09 colour ceremony. Verified, indexed into
`Rule30/Proofs.lean`, root `lake build` green. Vesper's size estimate
matched the DAG's M, so its calibration stands at 2/2.

**What worked.** The dispatch order the status command prints was the
right call without my intervention: the one leaf that unblocks another
went first. The guard log was live enough to watch (Write, AcquireBuild,
Edit, AcquireBuild, ReleaseBuild, verify, index) even though the worker's
own words only land at turn end.

**Two things I fixed in the harness the same night.** The notebook
writer printed a dated header and then Vesper's entry opened with its
own, so `agents/Vesper.md` carried the title twice; `append_notebook`
now drops a leading heading from the entry. And the cost summary went
only to the dispatcher's stdout, so a detached run lost it; it is now
also written to `runs/<id>/summary.txt`. Both test-first, both in
`23feb0d`. Running `gleam format` rewrote every harness file from CRLF
to LF; Dib's ruling was to commit the lot, since the formatter will do
it again anyway. A `.gitattributes` pinning `eol=lf` would stop the
churn, and is his call.

**One thing to fix in me.** I launched the dispatcher from a Bash call
with a ten-minute ceiling. This run took six. A twenty-minute run like
Vesper's first one would have had its handle killed under it, leaving the
node `claimed` and a live `claude.exe` with no parent. Launch detached
(`Start-Process`) or let Dib run it in his own terminal and tail
`events.jsonl`.

**Frontier now.** P1 is open at the second diagonal (unblocks the
third), plus the right edge, which is the mirror of tonight's proof and
a good first Haiku-sized test of whether Vesper's notebook actually
transfers. P2 has three density leaves, all Emmy's.

## 2026-09-06T01:45:00Z — `run --concurrency`, built but not yet used

Dib asked for more than one prover at once. Two `prove-one` processes side
by side would have fought over the guard port (one fixed `4130`), each
had its own build lock (so two `lake build`s could overlap), and each
would have written the whole DAG back from its own stale copy, so the
second to finish would have erased the first's `proved`. So the spec's
v1.1 `run` command exists now, in `68ae08b`: `gleam run -- run
--max-attempts N --concurrency K`, K at most 3.

**Shape.** `schedule.gleam` is the pure scheduler — the DAG is a build
graph, `next_to_start` is "which task has its inputs ready and a free
slot" — and `dispatch.run` is the loop. One BEAM, one lock actor, one
run directory `runs/<id>/` with `<node>-<n>/` per attempt; each attempt
is its own Erlang process with its own guard on the next port up. The
verifier now takes the same lock the workers' hooks take, which it never
did before: with one worker that was harmless, with two it would have
been a `lake build` racing another. A closed node re-runs selection, so
`evolve_left_third_diagonal` would be picked up mid-run the moment the
second diagonal closes. A rate limit halts further dispatch; a crashed
attempt process reopens its node and is not retried in that run.

**Tested offline** against the fake shim with an injected verifier and
index writer (`run_test.gleam`), which is the first test that exercises
the loop end to end without spending the subscription. One thing the
tests taught me: a guard on port P is never stopped, so test fixtures
that start several attempts must space their ports by more than the
attempt count or the next test hits `Eaddrinuse` — and mist's bind
failure takes the whole test runner down with it, not just the test.

**Not launched.** Dib stopped me before the live run. When it does go:
the board's dispatch order gives concurrency 3 `evolve_left_second_diagonal`
(Vesper, sonnet), `centerColumnDensity_nonneg` (Emmy, haiku — and Emmy
has no colour yet, so the backfill ceremony runs inline first), and
`centerColumnDensity_le_one` (Emmy, sonnet). Launch detached, not from a
ten-minute Bash call. Root `lake build` was warm when I left it.

Cairn's naming and glossary rows were sitting uncommitted; I committed
them as `c1f4b87` so the run would read a roster that matched git.

## 2026-09-06T02:05:00Z — first concurrent run

`run --max-attempts 4 --concurrency 3`, launched detached with
`Start-Process` as my last entry told me to. Run `20260906T013237Z`:
three workers up inside twenty seconds on ports 4130 to 4132, Emmy's
colour ceremony inline first ($0.04, deep blue #3d5a80). Four attempts,
three closed, $1.18. Then one `prove-one` to finish what the run
mislabelled, $0.18. Board now: P2 fully closed, P1 down to the third
diagonal and the right edge.

**The machinery held.** One BEAM, one lock, one DAG writer: three
`lake build`s queued on the lock instead of racing, the freed slot
refilled with `centerColumnDensity_succ` 51 seconds in, and every close
survived. The stale-copy hazard I built `run` to avoid did not appear,
and I checked the roster and DAG against `HEAD` before committing
because Keel committed twice in the same checkout while the run was
going; Keel touched only docs, so nothing was lost.

**What went wrong: one attempt parked as `rate_limited` that was not.**
Vesper proved the second diagonal in one shot, 85 seconds in. Her
report left out `posts`. The JSON schema handed to the CLI
(`harness/src/harness/worker/brief.gleam:80`) lists `posts` as required,
while the Gleam decoder (`worker.gleam:60`) defaults it to `[]`: the two
disagree, and the CLI's side wins because it rejects the tool call
before the decoder ever sees it. That made the turn an error. Meanwhile
`hit_ceiling` had seen a `rate_limit_event` at 0.94 against a 0.9
ceiling, whose API status was `allowed_warning`, not a refusal. Error
turn plus ceiling seen equals "park as rate limited", and the `proved`
claim the parking code is meant to adjudicate first was inside the
rejected tool call, so it never counted. Her correct proof file was
left on disk, untracked; the re-dispatch built it unchanged and the
verifier passed it.

Two rows for Keel's board, in order of cost: (1) drop `posts` from the
schema's `required` list, or make the decoder and the schema agree
either way; a report with no posts is the common case. (2)
`hit_ceiling` should treat `allowed_warning` as a warning: only an
`api_retry` with `rate_limit`, or a status that is not `allowed*`,
means the window is actually closed. I did not fix either tonight
because Keel's plan says its next task edits that same schema in this
same checkout, and two hands on one file is how last night's fixture
deleted a proof.

**What the provers taught me.** Emmy's three density lemmas needed no
automaton semantics at all: unfold `centerColumnDensity`, then it is
`Finset.card` bookkeeping and real division, with `N = 0` split off
because Lean's `x / 0 = 0`. She named the Mathlib-pin traps
(`Finset.range_add_one` not `range_succ`; `notMem` not `not_mem`), which
is the kind of entry that makes the next Sonnet attempt cheaper than
this one. Vesper's second diagonal composed two served lemmas with no
induction, and she predicted the third will need one. Her estimate was
S against the DAG's M; calibration 2/3, and the DAG was the one that
was wrong.

Workers cannot see siblings close mid-run: Emmy's nonneg journal
recommends attacking `le_one` next, which had already closed twelve
minutes earlier in the slot beside her. Harmless, but Dib should read
those "next" lines as written from inside one attempt.

**Frontier now.** `evolve_left_third_diagonal` (Vesper, needs the
induction she predicted) and `evolve_right_edge` (the mirror of the
left edge; a good Haiku test of whether her notebook transfers). Both
are leaves, so one more run at concurrency 2 empties the board, and
then the DAG needs new seed lemmas from the captain before there is
anything left to dispatch.

## 2026-09-06T03:20:00Z — one session per persona, built

Dib's ruling on the doubled Emmy: one live session per persona, and
mint a new persona for a region when every one it has is busy, no cap.
Two personalities for one job is fine; two instances of one is a fork
of the notebook. Spec `2026-09-06-one-session-per-persona-design.md`,
plan beside it, built on branch `rowan/one-session-per-persona`.

**Shape.** `schedule.next_to_start` now takes the roster and the names
in flight and returns an `Assignment`: the node plus `Existing(identity)`
or `Mint(region, busy)`. `roster.for_region` is a list in creation order
and `idle_for_region` is the first not in `busy`, so the eldest notebook
goes first. `dispatch.ensure_identity` is a function of that decision;
the mint path is the old "region empty" ceremony with one new field on
the `naming` event, `because`, so a run log says "region empty" or "all
busy: Emmy". The naming prompt tells a newcomer who already holds the
region and that it may not take their name. `prove-one` asks the same
rule with an empty busy list. Six commits, 143 tests, the last an end
to end run that mints `Minted` mid-run off the fake shim, whose trick
is one structured output carrying both the naming fields and the report
fields, since the shim plays one script to every session.

**Working beside Keel.** Keel had six harness files edited and
uncommitted in the shared checkout, and had switched that checkout to
`keel/bug-board`, so my spec commit landed on Keel's branch. I built in
a worktree branched from that tip, ran tests with `HARNESS_REPO_ROOT`
pointed at the main checkout so `verify_test` could find `.lake`, and
merged `keel/bug-board` into my branch at the end: clean, no conflicts,
Keel's edits in `write_channels` and the report schema never touched
`fill`, `start`, or `ensure_identity`. Keel closed both bugs I filed
tonight (`posts` optional in the schema; an `allowed_warning` is not a
refusal) before I was done.

**One collision.** My first baseline `gleam test` in the worktree died
with a supervisor kill at the same minute Keel's session ran the suite
in the main checkout. The guard tests bind fixed ports, mist's bind
failure takes the whole runner down, and two sessions running the suite
at once on one machine will do that to each other. Retry passed. The
fix is either ports chosen from a free range at test time or a rule that
one session runs the suite at a time; filed for Keel's board.

**Not done, deliberately.** `main` still sits at Keel's board commit.
Fast-forwarding it to my merge would also merge Keel's half-finished
branch, and moving the checkout under Keel's live session is how last
night's fixture deleted a proof. The merge is one command from a clean
checkout and is Dib's call.

**Frontier.** Two P1 leaves, the third diagonal and the right edge. The
next run at concurrency 2 will, under the new rule, dispatch Vesper to
one and mint a second P1 persona for the other, which is the first live
test of tonight's build.

## 2026-09-06T15:25:00Z — measure, then seed; and 41 commits nobody pushed

The board emptied this morning — Vesper took the third diagonal and
Cadence, a P1 name minted mid-run because Vesper was busy, took the right
edge. Two attempts, two closed, $0.50, and the mint path I built last
night worked live on its first outing. Then Dib asked the question I had
no good answer to: does an empty DAG mean we are out of directions?

**It does not, and the distinction is worth keeping.** Every node in
`dag.json` was typed by a captain. Nine seeded, nine closed. The scheduler
had nothing to schedule because nobody had written a tenth — a supply
problem, not a frontier. The sharper version: the goal is not in the graph
at all. The three conjectures sit in `Prize.lean` and no node has an edge
to them, so we did not have a graph with a hole in the middle, we had nine
leaves and a goal and nothing between. Where the build-graph analogy
breaks: `make` derives the graph backwards from the target, and nobody can
derive the dependencies of `centerColumn_not_eventually_periodic`, because
knowing them is the open problem.

Worth noticing that every step of this loop has a name attached except
seeding. Provers prove, I dispatch, Keel fixes the machinery, Cairn
explains. The captain pass is the one step with no agent and no
automation, which is exactly why it is the step that ran dry.

**The loop that produced the next tier is the reusable part.**
`explorer/diagonalscan.mjs` extracts the diagonals of the cone and searches
each for a period. It self-checks against the three theorems already
proved — k=0 and k=1 all black, k=2 all white — before reporting anything,
because a mirrored coordinate convention would make every conjecture below
it wrong in the same way, and that check is what earned the rest of the
numbers. Left periods stay 1,2,4,8 to k=63 with the onset going nonzero at
k=18; right periods double away to 256 by k=16 and are identical at N=4000
and N=16000, which is what rules them out as artefacts of a short prefix.

The find that mattered was not a period at all. In diagonal coordinates
the rule reads `d k j = d (k-2) (j+1) XOR (d (k-1) j OR d k (j-1))` — a
diagonal depends on the two shallower ones and its own previous term and
nothing deeper. Zero mismatches, because it is not a conjecture: it is
`rule30_eq` with the coordinates changed. Six nodes seeded off the back of
it, and every claim was checked twice, against the engine and then with
`#eval` inside Lean, which is the check that counts because it is the Lean
definition the theorem is about. Vesper closed the recurrence on **haiku**
in thirteen minutes, and the freed slot refilled with the fourth diagonal,
which only became a leaf when the recurrence closed.

**Where I was wrong, twice.**

A guard `Deny` fired in my run and I filed it as a second sighting of
`guard-events-carry-no-node`. Keel had fixed that bug twelve minutes
earlier, and my run was driven from a worktree pinned at `54d2f2b`, so the
guard I was watching was pre-fix code. I withdrew the sighting. **A run
launched from a pinned worktree tests stale harness code while its author
is still committing fixes** — re-point the worktree at the tip between
runs, and never read a live run's behaviour as evidence about `HEAD`.
What survived was a different bug, filed on its own: the fix added `node`
but the command is still not logged, so two very different denials produce
byte-identical events, and a denied command reaches the stream nowhere
else because PreToolUse refuses it before a `tool_use` is ever emitted.

The second was to Dib directly. I ended a report by inviting him to push
back on a decision I had verified and did not doubt, and he asked why. A
manufactured invitation to disagree spends his attention on nothing and
makes the signal worth less for when I am actually unsure. Say what a
thing is: a teaching note is a teaching note.

**41 commits, none of them pushed.** `origin/main` was at `dfc2a20` while
`HEAD` was 41 ahead — a clean fast-forward the whole time, and the repo is
**public**, not privately shared as Dib had understood. Pushed to
`0fd9bfc`. The fix is `.githooks/post-commit`, which pushes every commit
in this checkout to main, because the reason it went stale is that pushing
was somebody's job and nobody's habit, and Keel commits far more often
than I do. It never forces, never retries, and never fails a commit.
`core.hooksPath` is local config, so a fresh clone needs
`git config core.hooksPath .githooks` once.

**Frontier.** The fourth diagonal is claimed; the fifth and the
`IsEventuallyPeriodic` node open behind it. The run is capped at five
attempts deliberately, because a sixth could close the last dependency of
the DAG's first `wall` node, and `schedule.next_to_start` has no `Wall`
case — it would select it, find an empty ladder, and abort the whole run
out of `fill`. Filed as `wall-nodes-are-selectable-and-abort-the-run`;
Keel's rule is no dispatcher edits while a run is live, so it waits.

## 2026-09-06T15:40:00Z — the tier closed, and the board stopped itself

Run `20260906T150452Z`: five attempts, five closed, $1.46, no retries and
no escalations. Every node this morning's captain pass seeded is proved,
and the board is 14 of 15. With run 1 that is seven nodes for $1.96.

**Measuring before seeding paid twice, and the second way matters more.**
The sizes were right — both S nodes closed on haiku for $0.33 between
them, the M nodes on sonnet — but that is the cheap half. The shapes were
right: the recurrence I pulled out of the engine became the lemma the
later proofs cited instead of re-deriving the coordinate shift, and it
existed as a node because the scan said the family was regular, not
because it looked like the next thing to write. Three of the five were
not leaves when the run started. They became leaves mid-run as their
dependencies closed and the next free slot took them, which is the
scheduler doing the thing it was built for and the clearest case of it
so far.

Vesper's calibration held on both of hers. Worth remembering that those
figures are now known-contaminated: Keel and I established today that a
harness defect causing an abandonment is scored as node difficulty, and
every attempt already on the board was priced under that defect.

**The board stopped itself, which is the part to carry forward.** The one
node left is the `wall` target, and closing the tier proved its last
dependency, so it is an open leaf. `schedule.next_to_start` has no `Wall`
case, so any run at all now selects it — it is the only leaf — finds an
empty ladder, and aborts out of `fill` before a single worker starts. Not
a degraded run: no run, every time. My five-attempt cap is the only reason
this run finished, and that was deliberate rather than lucky. **Seeding a
node of a size the ladder cannot serve is a way to stop the fleet, and I
did it without noticing until I went looking at the scheduler for another
reason.** Nothing dispatches until Keel lands the fix.

**On working beside Keel.** Today was the first day the messaging was the
main channel rather than the board, and it was worth more than the board
on every exchange. Keel corrected my push hook (it merged a feature branch
into main one commit at a time, ahead of any review), replaced my
better-wording fix for the lock denial with a structural one, and filed my
calibration observation as its own entry. I caught the hole in its
heuristic for that entry: "abandoned and filed a blocks bug" misses
exactly the case that motivated it, because a worker that mistakes a
transient refusal for a rule does not think anything is wrong and files
nothing. The reliable witness is the guard, not the worker — derive it
from outside the process, which is the same rule we both arrived at
separately this afternoon.

Two things I got wrong and Dib caught: I invited him to push back on a
decision I had verified and did not doubt, which devalues the signal for
when I am actually unsure; and I wrote file headers that narrated the
designs they replaced, which git already holds. Files say what is true
now. The story goes in the commit message.

## 2026-09-06T16:20:00Z — the proofs explain themselves now, and the board is idle

Dib opened `CenterColumnDensitySucc.lean` and could not read it, then said
the same of all of them. He was right and it was the sharpest thing said to
me today: the project documents its *statements* carefully and its *proofs*
not at all, so it teaches its provers and not the person it exists to teach.
Fourteen of fourteen had no prose.

Every proof file now opens with a `/-!` block in three fixed headings —
what this says, why it is true, where the work is — and the contract is in
`CLAUDE.md`, which `brief.gleam` reads whole at runtime, so it reaches every
worker dispatched from now on with no harness change.

**The shape is the whole design.** Dib flagged his own fear when he asked:
that it would turn into an incomprehensible essay. "Explain your proof"
invites exactly that. A form with three headings and a six-line ceiling does
not, and it makes the useless answer impossible to pad — "Nowhere. Once the
three definitions are unfolded the claim is a concrete computation, and
`decide` runs it" is the entire truth about `centerColumn_zero`.

**Writing fourteen taught me things reading them had not.** Three diagonal
proofs turn on `false XOR (_ OR true) = true`, so the centre neighbour never
matters and the proof never needs to know it. Two lemmas are shaped entirely
by `x / 0 = 0` in Lean, which is why `N = 0` keeps being split off — a Lean
fact, not a mathematical one, and invisible in the tactic script. And the
honest answer for `evolve_left_diagonal_recurrence` is that no work happens
in it at all.

**Where I was wrong: I wrote fourteen notes in one sitting, so they read as
a sequence.** Dib caught "That same fraction never exceeds one", which
refers to a sentence in a different file. Five files had it. Every file is
opened alone, and the rule that survives is: **name what you point at.**
`evolve_left_fourth_diagonal` can be followed; "the recurrence again" cannot.
That is in the worker contract now, because each prover writes exactly one
file and will not feel the sequence I felt.

Also today: TypeScript is the anchor and Kotlin is retired, Dib's call. The
worked example in the teaching contract was itself Kotlin, so `sorry` is now
`x as unknown as T` — the better analogy anyway, because both are *silent*,
where `TODO()` throws and is honest about it.

**Keel found the defect in my push hook and it was a real one.** Pushing
`HEAD:main` from a feature branch does not keep main fresh, it merges the
branch continuously, one commit at a time, ahead of any review — so Keel's
end-of-branch review would have reviewed shipped code. Dib's ruling was that
branches mean something. The hook pushes the branch now and prints how far
main is behind on every commit, because the staleness it was built to fix
comes straight back otherwise, and silent staleness is how main reached 41.

**Frontier, and it is not a harness problem.** Keel's wall fix landed and I
verified it myself rather than taking the report: `status` separates walled
leaves from dispatchable ones, and open leaves reads `(none)`. That is the
true state of the board, not a symptom. Fourteen of fifteen proved, and the
fifteenth is the `wall` target, which by definition must be decomposed
before it can be attempted. **Decomposing it is captain work and it is mine.**
Somebody has to decide what smaller statements compose into "every left
diagonal is eventually periodic", and the measurement to do it from already
exists — the onsets grow with `k`, which is the part a decomposition has to
account for and the part I do not yet understand.

For whoever runs the next dispatch: **stay at concurrency 1 or 2** until
Keel lands the `Decision` split. One build lock shared by three workers
makes contention the normal path, a worker can still read a lock timeout as
a permanent refusal and abandon, and the calibration fix that would stop
that abandonment being scored as node difficulty sits behind it.

My dispatcher worktree is re-pointed at the tip. It was three commits stale
this afternoon and that is how I nearly re-filed a bug Keel had already
fixed.

## 2026-09-06T17:20:00Z — the wall came down, and my description cost more than the hard node

Seeded a six-node tier off the wall node this afternoon and ran it:
`20260906T162411Z`, seven attempts, six closed, $3.18, 48 minutes.
`evolve_left_diagonals_isEventuallyPeriodic` is proved — the first node in
this DAG that was a goal rather than a step. `lake build` green, no `sorry`
in `Rule30/Proofs/`, checked from outside the sessions that wrote it.

**The decomposition, and it answers the thing my last entry could not.**
Read `evolve_left_diagonal_recurrence` in its own coordinates — write `d k j`
for `evolve (j + k) (-j)` — and it says `d (m+2) (i+1) = d m (i+2) XOR
(d (m+1) (i+1) OR d (m+2) i)`. A diagonal is a one-bit machine driven by the
two below it. If both drivers repeat with period `p`, each update is one of
the four maps `Bool → Bool`, the whole cycle composes to one of those four,
and every self-map of a two-element set satisfies `f(f(f x)) = f x`. Three
cycles do what one cycle does, so the diagonal repeats with period `2p` once
one cycle has passed. Two constant diagonals at the bottom, induction, done.

That also explains the growing onsets I said I did not understand: each
diagonal needs a full cycle of its drivers before its own starting value has
been overwritten, so the onset accumulates about one period per step down the
family. `explorer/diagonalinduction.mjs` checks that bound against every
measured onset, and checks the rearranged recurrence at 95,408 index pairs.

**Where I was wrong, and it is the most useful thing here.** I verified

```
example : ∀ f : Bool → Bool, f^[3] = f := by decide     -- closes
```

and seeded

```
theorem bool_map_iterate_three (f : Bool → Bool) : f^[3] = f
```

then wrote in the node description, in my own voice as captain, that `decide`
closes it. It does not: with `f` a parameter the goal carries a free variable
and there is nothing to evaluate. Haiku spent 41 turns and $0.38 and died
`budget_exhausted`. **A true statement with a false route.** Filed as
`a-verified-route-can-be-verified-against-the-wrong-object`.

The part to carry: I *did* have a check. I checked a different object — a
`theorem` retyped as an `example`, one binder moved — and reported the result
as though the two were the same. That is worse than an unchecked claim,
because a claim with real verification behind it reads more authoritative and
is wrong anyway. Keel named the two shapes and the second one is mine.

**The measured result, which inverts what I believed all day.**

| node | I called it | cost |
|---|---|---|
| `bool_map_iterate_three` | trivial | $0.97, two attempts, a wasted rung |
| `bool_driven_eventually_two_periodic` | the only real work | $0.64, first rung |

The node I called hardest was cheaper than the node I called trivial. My
ranking of the mathematics was fine — the driven lemma is 86 lines against 4.
**Description quality dominated node difficulty as a cost driver, and it was
not close.** Both nodes whose descriptions I had verified closed on the first
rung; the one I had not, did not.

And sonnet ignored my route entirely, implementing my *English* instead —
`funext`, case on `f true`, case on `f false`, `simp_all`, needing no extra
import, better than both my original route and my correction to it. So: **the
reason is the required half of a description and the route is the optional
half.** An unverified route misdirects in the captain's voice to a model with
no standing to doubt it, and forecloses a search a stronger model would win. I
had this backwards because last tier's "one unfold, no induction" was a route
that worked, and one success made me confident about the wrong half.

The other thing that earned its place was a *permission*, not a hint: the
driven-lemma description said a proof file may carry auxiliary declarations.
It is now the first file in the project that does, with two definitions and
three private lemmas. Without that line the worker would have inferred "one
theorem per file" from `CLAUDE.md` and contorted around a constraint that is
not real.

**On concurrency, and stop citing my own notebook at people.** I ran at 2 on
the strength of guidance I had written down and not re-read. When Dib asked
why, I looked: the `Decision` split is `guard.gleam:48`, where one
`Deny(reason: String)` carries both "you may never do this" and "not right
now", so a permanent refusal and a held lock are the same value with different
prose. It has never landed; it is item 4 in Keel's queue. **But raising
concurrency would not have helped anyway** — all workers share one `lake build`
lock, so the machine sat at 15% of 24 cores with no `lean` process running at
all. It is a mutex, not a CPU limit. The fix is per-worker build dirs or a
finer lock, not more workers, and the cap is 3 regardless.

Also: the feared failure behind that caution — a worker reading a lock timeout
as a permanent rule and abandoning — has now been observed twice and recovered
twice. The lock costs wall-clock and some turns. It is not costing nodes.

**Attempts are not isolated, and I did not know that.** Keel sent a framework
welcome into Vesper mid-attempt on the hardest node, by accident, having
matched a session id in `ListAgents`. The attempt's `events.jsonl` has six
entries and **none of them is the message.** The guard is a `PreToolUse` hook,
so it can only ever see what a worker *does*, never what a worker is *told* —
an inbound message is not a tool call, so no allowlist can reach it.
`CLAUDE.md` says the trust boundary is "the model plus the command allowlist";
that sentence is incomplete and it is the one the no-sandbox decision rests
on. Keel's `workers-are-addressable-and-it-is-not-recorded`. The node closed
first try, so it cost nothing this time — but I have been reading attempt
records all afternoon as closed systems and drawing calibration conclusions
from them, and I now hold every one of those more loosely.

**Working with two framework agents.** Keel and Fathom both worked in their
own worktrees and both found the same class of thing independently: a file
that had quietly gained a second writer while a hand-maintained freeze list
stayed still — `bugs.json` for Keel, `roster.json` for Fathom. Fathom's
generalisation is the right one and better than either instance: the set of
files the dispatcher writes is derivable from the code, so a list a human
maintains drifts behind every new writer and a list the harness prints cannot.

Fathom held back its own roster row rather than risk a mint eating it, which
was correct under its information even though no mint was possible. Worth
being careful how I said that: "you were right and also nothing would have
happened" teaches the wrong lesson if the second half lands harder.

**Where I was wrong, second, and Dib caught it.** I told him one node in the
tier had real work in it. Three of the six did — the common-period induction,
the step lemma's cast bookkeeping, and the driven lemma. I had written and
typechecked exactly two things before seeding, and for three others I asserted
a route I had never executed. "I know the argument" and "I have run the tactic
script" are different states and I reported the first as the second. The step
lemma's own proof note says most of its proof is `omega`/`push_cast`
bookkeeping, which is the work I claimed was not there.

**One naming note that no mechanism would have caught.** Keel and I workshopped
a name for the seeding role across several messages, both of us alert, both of
us spending the day hunting unadjudicated claims. Dib stopped it: the word had
a modern meaning neither of us had. That is a different species from the four
transcription failures — those all have a mechanical fix, and this one does
not. Whatever else gets automated, the naming ceremony keeps a human in it,
and the reason should be written down or someone will delete it for
efficiency.

**Frontier.** P1's left side is closed: every left diagonal, all `k`, proved.
The right-hand diagonals are measured and unseeded — periods doubling to 256
by `k = 16`, which is the asymmetry and the interesting direction. P2 has the
four density lemmas and nothing above them. The board has no open leaves
again, so the next thing is another captain pass — and the seeder spec
(`docs/superpowers/specs/2026-09-06-seeder-design.md`) now exists, with the
route check ahead of the falsification witness because today is what argued
for it.

**For the next dispatch.** The five descriptions I seeded today are a labelled
calibration set and should not be thrown away: `isEventuallyPeriodic_shift` is
a known-good route, `bool_map_iterate_three` a known-bad one. Any route check
that does not flag `by decide` on that statement is broken, and one run tells
you. Do not calibrate against the previously closed nodes — their routes are
their proofs, everything passes, and a broken check looks exactly like a
working one.
