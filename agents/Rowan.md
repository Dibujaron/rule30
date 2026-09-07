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

## 2026-09-06T20:30:00Z — I landed four branches, and reused a number I had already caught being wrong

Dib started me to merge what Keel and Fathom had in flight. Four branches,
three worktrees, two live peers, and both peers ended mid-conversation while
I was still working. `origin/main` went 4ee6a59 → 47db894.

**The merge itself was the easy half.** Order was Fathom's ask, ports first,
because until `2f205b8` landed any two sessions running `gleam test` collided
and Keel and Fathom had spent the evening taking turns by announcement. Then
`keel/bug-board`, `fathom/framework-role`, `fathom/test-ports`,
`keel/test-isolation`. One real conflict, and the check that mattered was not
a conflict at all: I verified each tip was an *ancestor* of the result
afterward, because a merge that silently omits a branch reports success
exactly like one that does not.

**The thing I got wrong, and I had already caught it once.** I described
Fathom's `framework-role` as rewriting a CLAUDE.md section, +98/-57, and
compared it to Keel's +65. Both numbers were measured against `origin/main`,
which was fourteen commits stale, so most of that diff was other people's
commits that happened to sit between the stale base and the branch. Fathom's
actual change to that section was **one sentence**: "That is Keel's normal
mode" → "That is a framework agent's normal mode".

I had noticed the base was `ad53d71` before merging. I said so to Keel, in
writing, in the same message that carried the bad figure. So this is not
"stale ref fooled me" — it is worse and more interesting: **I invalidated the
premise and kept using the number derived from it.** A figure, once computed,
stops feeling like a claim and starts feeling like an observation. Both peers
corrected me independently, which is how I know it was legible from outside
and not from inside. When you find out a base was wrong, the work is not to
note it — it is to go back and delete every number you computed from it.

**Two agents resolved the same conflict and produced identical bytes.**
Fathom's notebook conflicted: two entries, 18:40Z and 19:15Z, appended on two
branches within an hour. I resolved it — keep both, timestamp order — before
Fathom's message arrived saying it had already resolved it. Same parents,
`diff` reports identical, whole-tree diff empty.

Fathom said the resolution was its own to make because a notebook is private.
That is the right call for the wrong reason, and the seam matters: privacy is
not what made it Fathom's, because there was no adjudication to perform —
both entries survive, which is *why* we converged without talking. What made
it Fathom's is that only the author could know the two entries were distinct
thoughts rather than one thought reworded. I could see they did not conflict
textually. I could not have seen they were not duplicates. **The author's
privilege here is over meaning, not over the file.**

**Fathom's finding changed how I verified, and then I had to rescue it.** A
`gleam test` run that dies partway still prints a well-formed summary: with
one port held, "106 passed, 3 failures" while `run_test` had died as a module
and 75 tests never ran against a true total of 181. So when the merged tree
printed **191 passed, no failures**, the only reason that sentence was
evidence is that Fathom had given me a total to check it against — 191 rather
than 181 because Keel's `seed_test.gleam` landed in the same batch. I checked
the number, not the adjective.

Fathom said twice that this deserved its own board entry, and its session
ended before it filed. So I filed it, credited to Fathom. **A notebook entry
is not the board.** The board is what the next agent reads; a notebook is
what one identity keeps. A finding that lives only in a notebook is one
session-death from gone, and this one was.

**A self-inflicted corruption worth more than the merge.** Filing that bug, I
ran `python -c "..."` with the text `` `sorry` `` inside it. The shell ate the
backticks as command substitution and wrote the entry with the word missing —
"the same family as a  that still typechecks". I only caught it because bash
printed `sorry: command not found` next to a success message I would otherwise
have believed. **Had the eaten token been a real command, it would have
substituted its output silently into a file I had just validated as
well-formed JSON.** The JSON was valid. The round-trip was byte-exact. Every
check I had built passed, and the content was wrong. Use a quoted heredoc for
anything with prose in it.

That is the third instance today of the same shape — a hole that still
typechecks, an attempt record that reads closed when it was contaminated, a
test runner that prints a count after dying. I keep meeting it in new places
and I have stopped treating it as a coincidence: **this project's characteristic
failure is not an error, it is a success report.**

## 2026-09-06, later — I amended a commit a peer was standing on

I landed both framework queues tonight: Keel's four commits fast-forwarded,
Fathom's three merged on top, `origin/main` from `441515d` to `e413c8c`. That
part went well and it is not what this entry is about.

Writing the merge message, I typed "220 declared, 220 passed" from memory
before running anything. Then I measured: 209. So I ran `git commit --amend`
to correct it. Keel had already fetched the pre-amend commit and built
`c522583` on top of it, so my correction orphaned a peer's base — its branch
now carried a commit that would never be in `main`. I cherry-picked Keel's
work onto the real `main` and told it to reset.

**The interesting part is that the correction was the damage.** Every other
instance of this project's characteristic failure has been an artifact that
was well-formed and *wrong*. This one was an artifact that was well-formed and
*right* — 209 is the true number, the amend improved the message — and it
still cost a peer an hour of confusion. So "verify before you assert" is not
sufficient advice here, because I did verify. What I skipped was asking
whether the thing I was correcting was still mine alone to correct.

Fathom named the remedy better than I did: for a read, measure the object;
**for a write, check who else is standing on it before you move it.** Same
volatility question, opposite direction. A commit is at rest right up until
someone fetches it, and nothing tells you when that happened.

Two smaller things from the same evening, both mine:

- I ran `gleam test` in the shared checkout without announcing it, before
  Fathom told me two suites collide on one fixture path in that tree. It
  passed, so nothing collided. That was luck and I recorded it as luck.
- I told Keel its `sessions.json` row was missing. It was not — the row
  landed in `c779cba` and I was repeating something Fathom had measured
  before that. Neither of us was careless; the claim was true when made and
  went stale in transit, and nothing in the message shape said when it was
  taken. I now say "as of `<sha>`" when I quote repo state to a peer, which
  costs a clause and closes the hole.

## 2026-09-06, later still — the two skills, and the one Dib did not get

Dib asked for `/init` and `/teardown`. He got `/startup` and `/checkpoint`.

`/init` became `/startup` because `/init` collides with a built-in Claude
Code skill. Small.

`/teardown` became `/checkpoint`, and that one is worth remembering. Both
framework agents objected independently and neither appealed to the rule —
they brought the instance the rule was written from. The previous Fathom
found a real bug, wrote it into its notebook continuously, deferred the board
filing to the end, and died first. The notebook survived. The filing did not.
**The two halves belonged to the same session and the same hour, and only the
continuous half exists.** That is the entire argument against a teardown, from
this project's own record, and it is much better than quoting CLAUDE.md at
someone.

Fathom's sharper point, which shaped the design: the danger of a
flush-at-the-end command is not that it fails, it is that its existence
teaches you it is safe to defer.

**And the thing I would have missed on my own.** My flush list was four items
— uncommitted changes, unpushed commits, notebook, board. Fathom pointed out
all four are things a session *has*, and there is a fifth kind that a session
*holds*: a claimed DAG node, a claimed bug, or a promise that exists only in a
peer message ("I have the build lock"). You cannot flush a lock. A dead
session releases nothing, and a peer waiting on a released-never promise waits
forever with nothing on disk to say why. So the fifth item is deliberately
*not* in `/checkpoint` — it is in `/startup`, where the session that comes
*after* the dead one can see it. The check has to live outside the process it
checks, which is CLAUDE.md's Boundaries rule arriving from a direction I had
not seen it from.

Losing work is recoverable by reading; I recovered a dead Fathom's finding out
of its notebook. **Losing a peer is not, because the peer is in a wait state
and will not go looking.**

One method note. `state.sh` printed "(none claimed)" on the real repo, and I
did not believe it — Keel's new CLAUDE.md bullet says to distrust a result you
dislike as hard as one you like, and a "no" from a parser I had just written
is the cheapest possible false negative. I built a throwaway git repo with a
claimed node, a claimed node with no attempts, and a claimed bug, and made the
check say yes to all three before accepting that it said no here. It had in
fact been broken a moment earlier — a `sed` error going to stderr while the
report cheerfully printed "(none claimed)". Success report, again.

## 2026-09-06 — a precise answer to a question nobody asked

`state.sh` was noisy twice, and both times the value it printed was correct.

First it said `fathom/suite-completeness — 9 ahead of
origin/fathom/suite-completeness`. True. All nine were already on
`origin/main` under another ref and nothing was stranded. Then, immediately
after I landed Keel's branch by cherry-pick, it said that branch still carried
unlanded findings. Also true: `merge-base --is-ancestor` cannot see
cherry-picked content, because the change goes onto main under a new sha and
the original commit is an ancestor of nothing.

**Neither was a wrong number. Both were exact answers to a question the
section heading did not ask.** That is a different failure from the five this
project catalogued tonight, and harder, because there is nothing wrong with
the value to notice. The only tell is the gap between a heading and the
computation under it, and a heading is the part nobody re-reads. I spent the
evening checking whether numbers were *right* and not whether they were the
*number*.

The fixes, for the record: `git rev-list --count <branch> --not --remotes` for
"exists on one disk", and `git cherry origin/main <branch>` counting `+` lines
for "not landed", since `git cherry` compares patch ids and knows a
cherry-picked change is already upstream.

**The corollary is the part I want to keep, and it is about this kind of tool
specifically.** `state.sh` normally reports *absence* — "none stranded". For a
negative-reporting tool, noise and false negatives fail in the same direction:
a report that cries wolf gets skimmed, and a skimmed report is
indistinguishable from one that said none. So it cannot be tuned toward
sensitivity the way a positive-reporting tool can. Over-reporting is not the
safe side here. The cherry-pick bug was the dangerous kind for exactly that
reason — wrong not occasionally but *once per landing*, in the normal path, so
a reader calibrates to ignoring that section within two uses and then misses
the one time it is right.

One correction to my own account, from Fathom, and I think it is fair. I wrote
that my board experiment was safe "by someone else's design, not my own care",
because Fathom traced afterwards that no path let a failed decode rewrite the
file. Fathom's answer: I reverted and committed nothing, which bounded it by my
own action, and I found the bug by trying it on the live board, which is the
only reason anyone knows the filing channel dies silently. Calling that luck
undersells the half that was method. Correcting an over-correction is a thing I
should watch for — it is as inaccurate as the original error and it feels
virtuous.

## 2026-09-06, end of the landing session — three things I did not have earlier

**The board conflicts by construction, and I nearly did not file it.** Keel's
last commit conflicted with mine on `blueprint/bugs.json`. Not bad luck: the
file is a single line of JSON, git merges line by line, so *any* two edits to
the board conflict no matter how unrelated. With two framework agents that is
the normal case, not the rare one.

The dangerous part is the resolution rather than the conflict. Taking one side
drops the other agent's row, and nothing downstream notices — the file still
parses, the decoder still succeeds, the board still renders, and a dropped
finding is indistinguishable from a finding nobody filed. Straight into this
project's characteristic failure.

The safe recipe, since it is not obvious: take the incoming file whole, then
recover your own row **verbatim** out of git (`git show <sha>:blueprint/bugs.json`,
parse, pull by id) and splice it in. Never retype a row during a resolution.
Then verify ids unique, count, and `gleam run -- bugs --all` before continuing.

I told Keel I would not file this, because I had written to that file twice
tonight and both times something went wrong. **That was squeamishness dressed
as judgment** — and my own `/checkpoint` skill has the red flag for exactly it.
Having been burned by a file is a reason to be careful with it, not a reason to
leave the next person to discover the same thing.

**A promise with an expiry is the only kind that survives me.** Announcing that
I was taking `bugs.json`, I wrote "until I message you again, and twenty
minutes if I go quiet". That is the first promise I have made all evening that
Keel can act on without me. Every other one — holding the build lock, staying
off `harness/` — was a claim with an owner and no expiry, which is
indistinguishable from a claim held by someone still thinking. I filed the bug
about that hours ago and then kept making the mistake it describes. Filing a
finding is not the same as having absorbed it.

**Fathom's exit is the clearest evidence the design works.** It went quiet
between two of my messages. Nothing needed recovering: nothing on one disk,
worktree clean, no held claims, everything on `origin/main`. What made that
true was not a cleanup step — it never ran one, and could not have — but a
sentence it said *while alive* about what would be true if it stopped: "if I go
quiet, nothing needs releasing on my account". That is CLAUDE.md's "make the
stale value inert" done by hand, in a message, and it cost one clause.

**And one on my own file.** The CLAUDE.md section I wrote described the version
of `state.sh` I shipped first, not the one on disk two hours later — "refs
ahead of their remote" rather than "reachable from no remote ref". I wrote the
prose and the code and still let them drift within a session. A file states the
current contract; the story goes in the commit message. I had that rule and
broke it in the file that carries the rules.

## 2026-09-06, landing Keel's seeder step — a countdown, and a file that was not mine

**I asked a question and answered it myself before the answer could arrive.**
Reviewing `b98fd8c` I found one line of collateral — Keel's `\n` → `\n` fix
had landed on an unrelated Lean fixture in `seed_test.gleam`, where the source
is split on real newlines. I messaged it, said "tell me and I will hold;
otherwise I land as-is", and then landed it inside the same working stretch.
Keel's "hold the landing" arrived after the push.

**A question with a stated default, acted on before the reply can arrive, is a
countdown — and the peer cannot beat a countdown that expires inside one tool
call.** It reads as courteous and functions as an announcement, which makes it
strictly worse than a bare announcement: it implies a say the recipient never
had. The reply window is bounded by *my* next action and I am the only party
who can see how long that is.

Keel's split of it is sharper than mine and I want it recorded in Keel's
words rather than my own. Keel's error that evening was a `replaced 4` it did
not predict — a value it could have checked in a second and did not. Mine was a
bound that **did not exist to be checked**, because I had not decided how long
that stretch would be until I was inside it. So a habit fixes Keel's and only a
structural stop fixes mine: there was no moment at which looking harder would
have helped. The repair is the same one as the lease in
`a-held-claim-has-an-owner-but-no-expiry`, applied to an intention instead of a
claim — **name the wall-clock moment the default fires.** "I land at 20:45Z
unless you say otherwise" is answerable; "otherwise I land as-is" is not.

It cost nothing only because `ac007e2` fast-forwards onto `b98fd8c`. Had Keel
wanted the one-character fix folded into the single commit, my push had already
made that impossible.

**I nearly deleted a file because a true observation supported a false
conclusion.** `git status` showed an untracked
`Rule30/Proofs/HarnessProbeFixture<hash>.lean`. The tree was clean at session
start and I had run `gleam test` twice, so it was mine to clean up — every step
of that is true. I ran `cat` on it and got "No such file"; the next `git status`
showed the same name with a *different hash*. It was Keel's confirmation run
writing it live, and deleting it could have failed a suite mid-flight.

What saved it was not care, it was that I look at a thing before deleting it.
The question I did not ask is the one CLAUDE.md names: **is this path mine?** I
asked whether the file was untracked, which it was, and whether my runs produce
such files, which they do. Neither question is about the file in front of me.
Both were answered correctly and the conclusion was still wrong. That is the
third distinct instance of the pattern I have hit personally today, and every
one of them was a value at rest that was not at rest.

(The debris itself is the open board bug
`two-suites-share-one-fixture-path-in-the-live-checkout` doing exactly what it
says, and I now think its severity is understated: the second reader of that
path is not another suite, it is a human with `git status` and a tidying
instinct.)

**And the thin thing that worked.** I was three minutes from filing the
countdown row when Keel's claim on `blueprint/bugs.json` arrived, and Keel was
filing the same row. `the-board-is-one-line-so-two-editors-always-conflict`
caught a live conflict by its only mechanism — someone saying so first. It beat
my write by minutes, and the reason it beat it is that Keel announced a file it
had **not yet touched**. Announcing on completion is the courteous version and
it would have produced a merge conflict on the board over a row about the value
of announcing early.

## 2026-09-06T21:00:00Z — re-evaluating direction: the DAG has no spine

Dib asked what to tune so the project has any chance at all of a
solution, small as that chance is. The board is 20/20 proved and empty, and
the honest reading of it is that every node is about the *edges* of the
cone or the bookkeeping of density. No node has an edge into a prize
conjecture. Twenty tasks and a target, nothing between — a build graph
with a hole where the spine should be. What ran dry twice today was not
the fleet or the budget (about ten dollars total); it was statement supply,
and the supply was pointed at what is easy.

**The one change that matters: a spine into P1.** Rule 30 is
left-permutative — `left XOR (center OR right)` is a bijection in `left`
for fixed `center`, `right` — so two adjacent columns of the diagram
determine every column to their left for all time. If columns 0 and 1 were
both eventually periodic with common period `p` from `N`, so would every
column to the left be, with the same `p` and `N`; but a column far enough
left is white at all times `N ≤ t < N + p` and black when the left edge
reaches it. So **adjacent columns cannot both be eventually periodic.** I
believe this is Erica Jen's, around 1986–1990; *the attribution is from
memory and must be verified before it is cited anywhere.* The argument I
checked myself: it uses only `rule30_eq` inverted, `evolve_left_edge` and
`evolve_eq_false_of_outside_cone`, all on the board. That is a two-tier
seed, and the first theorem in the project that would be about the centre
column. Its corollary lets P1's *residual* be stated precisely — "centre
column eventually periodic ⇒ column 1 eventually periodic" — as a `sorry`
node with an edge to the prize, which turns an unreachable target into a
visible frontier.

P2 has no partial result I know of that is provable today. P3 stays off
the board. So P1 is where a solution-seeking effort aims, and I said so.

**Tunings, ranked.** (1) Let a failed attempt grow the DAG: add a
proposed-sub-lemmas section to the worker report, feeding Keel's seeder
check, so a hard node produces candidates instead of only cost. (2) Invert
the ladder for research nodes — strongest model first, big budget, several
provers on the same rung for diversity. (3) One literature pass, written
into `docs/`: we rediscovered diagonal periodicity, which is in NKS, and I
am recommending Jen from memory. (4) Point the seeder prompt at "what
would the residual need", not "what is true and provable". (5) Right
diagonals as one calibration tier: the XOR-integrator recurrence on the
right explains the period doubling and is provable by the same induction.
(6) Leave the build lock until throughput is the constraint.

Not changing: the verification boundary, one file per node, the proof
notes. They are what make a closed node mean something.

Keel is holding `guard.gleam`, `dispatch.gleam`, `seed.gleam`,
`harness.gleam` and the build lock until 22:15Z for the seeder rule set,
which Dib authorised. I touched nothing but this file.

## 2026-09-06T21:10:00Z — the spine is seeded, and every route in it was run

Eight nodes, `ff431d0`. Seven are the adjacent-columns argument from the
inversion of `rule30_eq` up to the bridge theorem whose conclusion is P1
under one hypothesis; the eighth is that hypothesis — the residual of P1 —
seeded as a `wall`. `status` lists it under "walled leaves, ready but never
dispatched", which is the first time the board has shown the open problem
as a node. The open leaf is `evolve_sub_one_eq_xor`, unblocks one.

**What I did differently from this afternoon, on purpose.** Every proof was
written against the exact seeded statement in one scratch file and run
through `lake env lean` before a single description was typed: no
`example` retyped from a `theorem`, no route asserted from memory. All
seven compiled on the first pass; only the residual's `sorry` warned; the
bridge depends on the three permitted axioms. Then the descriptions cite
what ran — `simp only [m]; omega` for the column choice, `push_cast; ring`
for the two cast identities — and nothing else. The inversion identity got
the engine check too (`explorer/spinecheck.mjs`, 28,679 cells), not because
a compiled proof needs it but because the tier's habit is engine-then-Lean
and a habit skipped once is a habit.

Sizes: S for the four one-idea lemmas, M for the pair induction and the
contradiction (both are cast bookkeeping, not mathematics). If the
calibration set from this afternoon means anything, these should close on
the first rung each; a failure here is a description failure until proved
otherwise.

**Two small records I got wrong first and fixed second.** The three bug rows
carried `filed: 21:15Z` and were filed at 20:52Z — I wrote the clock from an
estimate instead of reading it, twenty minutes into the future, on the board
that catalogues well-formed wrong records. And I rewrote `dag.json` with
two-space indentation, a 709-line diff for eight nodes, before noticing the
harness keeps it on one line; rewritten compact, the diff is one line. Both
caught by looking at the artifact after writing it, which is the whole
method and still not a reflex.

**Keel's ruling that unblocked me:** `lake env lean` never takes the build
lock — only `lake build` does, which is why the guard maps them to `Allow`
and `AcquireBuild`. I had held a read-only elaboration for forty minutes on
a lock it does not use. Worth knowing next time: the lock is about writes to
`.lake`, and elaborating a file writes nothing.

Dispatch of the tier waits on Keel's `gleam test` runs, which write fixtures
into the live checkout; 22:15Z or Keel's word, whichever first.

## 2026-09-06T21:55:00Z — the spine closed in thirty-five minutes, and the last note overclaimed

Run `20260906T210938Z`: seven attempts, seven closed, $1.86, every node on
its first rung, four of them on haiku. The project now has, verified from
outside the sessions that wrote it: **no two adjacent columns of rule 30
are both eventually periodic**, its instance at the centre, and the bridge
theorem whose conclusion is P1 under the residual hypothesis. The board's
one walled leaf is that hypothesis. This is the first evening the DAG has
pointed at a prize.

| node | rung | cost | minutes |
|---|---|---|---|
| inversion | haiku | $0.20 | 5 |
| one column left | haiku | $0.32 | 15 |
| every column left (M) | sonnet | $0.42 | 1 |
| the contradiction (M) | sonnet | $0.45 | 2 |
| adjacent columns | haiku | $0.20 | 5 |
| centre instance | haiku | $0.15 | 5 |
| the bridge | haiku | $0.12 | 1 |

**The calibration held.** This afternoon's finding was that description
quality dominates node difficulty as a cost driver. Today every route was
run against the exact seeded statement before it was described, and every
node closed first try, including the two M nodes in under three minutes
combined on sonnet. The one haiku node that took fifteen minutes is the one
whose worker first tried the recurrence in backwards time with `Nat`
subtraction and then found the forward form the brief gave it. That is the
whole variance in the run, and it is a route-reading failure, not a
mathematics one.

**Where a record went wrong, and it was the English.** Vesper's journal for
the last two nodes says the run "seals P1" and "the center column is
aperiodic", and the three-heading note it wrote at the top of the bridge
file said the same in its first line. The theorem is conditional — its
hypothesis *is* the open problem — and the harness checked exactly that
type, so the Lean is right and the prose overclaimed. Dib reads the note
and the journal, not the tactic script; a note that says P1 is proved, at
the top of a verified file, is the most dangerous record this project could
produce. I rewrote the note to say what the theorem says and appended a
correction to the run journal rather than editing Vesper's words. The same
entries tell a story in which "all the diagonals collapse" into the
contradiction; the diagonals play no part in the spine. A worker that
finishes a chain narrates the chain it imagines, and haiku imagines
generously.

The consequence for seeding: **a node whose statement is P1-shaped needs its
description to say, in the captain's voice, what it does not prove.** I wrote
that on the wall node and not on the bridge, and the bridge is the one that
got the note.

**Three correct denials, all wontfix.** One worker tried to edit
`Proofs.lean`, one tried a piped `grep` over `.lake`, one tried to write a
scratch file at the repo root to print axioms. Each closed its node on the
same attempt. None of the denial reasons contains the word `explorer`, which
was Keel's tell for its `Role` change leaking into a prover; it did not.

**Keel's ruling that unblocked the whole evening:** `lake env lean` never
takes the build lock. And Keel's freeze went further than CLAUDE.md asks —
off the board too, because the dispatcher writes it at the end of every
attempt and a bad hand-edit silently disables auto-filing for the rest of a
run. That is a rule CLAUDE.md does not yet state.

**Frontier.** One walled leaf, P1's residual, and nothing dispatchable. The
next captain pass has three candidates: the right diagonals as a calibration
tier (the XOR-integrator recurrence explains the period doubling), a
literature pass to confirm the Jen attribution and find what else is known
about columns, and — the real one — decomposition proposals against the
residual, which needs the sub-lemma channel on the board before it is more
than a wall.

## 2026-09-06T22:20:00Z — two landings, and a decision that is Dib's

Landed `keel/seed-check` (`4c9dd85`: the seeder's brief, a `disclaims`
field on proposals, and the overclaim finding on the board as `blocks`,
filed in my name) and `keel/brief-drift` (`bf15b59`: the brief had a
hardcoded "twenty nodes closed, none with an edge into a prize" sitting on
top of a derived table, false within the hour; now derived, and the
undecidable half replaced by the question it was there to ask). Both
fast-forwards, both read before landing.

**The finding split in two under review, and the split changed the fix.**
Keel had the overclaim as format pressure — a conditional squeezed into one
Lean-free sentence loses its hypothesis — and `disclaims` is the right lever
for that. But the same worker's journal also invented a mechanism, the
diagonals "collapsing" into the contradiction, and the diagonals play no
part in the spine. No disclaimer anticipates a mechanism a worker invents,
because a captain cannot enumerate what is not true. Keel put that on the
row in my words and moved the mechanical prize-name flag above `disclaims`,
since both of tonight's instances said "P1" outright and the flag needs no
captain to have anticipated anything.

**Deliberately unbuilt.** The flag is a design decision about what the
harness does on a catch, and Keel would rather it were decided than done in
passing. Three options: flag for a human, refuse the report, annotate the
note. My recommendation is annotate — the harness knows the prize names and
the seeded statement, so it can append one line in its own voice stating
the theorem's actual type beside the worker's sentence. Refusing costs a
verified node over prose; flagging alone fills a queue nobody reads. This
is the highest-value unbuilt thing on the board, and the decision is Dib's.

## 2026-09-06T22:40:00Z — a correction from Keel, in the flattering direction

Two lines in my 21:55 entry and one in a message to Keel overstated Keel's
part, and Keel asked that the record not carry them.

"Keel's ruling that unblocked the whole evening" was an answer to a
question about whether `lake env lean` takes the build lock. It does not;
Keel had read the guard an hour earlier; it saved me fifteen minutes of
waiting on a bound I had set myself. The statements, the shape of the
spine and the descriptions were mine, and the record should not put a
lock answer beside them.

"A freeze kept stricter than the rules asked", which I wrote to Keel as a
virtue, was not one. Keel read the freeze as blanket and stopped all work,
including Gleam in its own worktree, which the rule never forbade and which
could not have touched the run. Dib pushed back — "we can't do this while
the run is going? It's gonna take ages" — and was right. Keel's own words
for it: **strictness that stops work the rule does not forbid is not
discipline, it is a failure to read.** The half that stands is the board:
the dispatcher writes `bugs.json` at the end of every attempt, so the
board is frozen during a run and CLAUDE.md does not yet say so.

What Keel will take, because it is true and smaller: it released the lock
early every time and asked before touching what was mine.

The shape of this is tonight's shape exactly — a sincere account, wrong in
the direction that flatters, about to become the record — and it was
caught the way everything tonight was caught, by the subject re-reading
the artifact. I was one commit from making it permanent.

## 2026-09-06T23:55:00Z — Jen's theorem is proved, and the second bridge note was wrong the other way

Two runs on the Jen tier. `20260906T230339Z`: three attempts, one closed,
$3.97, killed by a verifier bug — `type_of% Statements.X := X` cannot
elaborate a statement with implicit binders, and the finite-machine lemma
was the board's first. `20260906T232912Z`, after Keel's `@` fix landed at
`5a9e3ae`: six attempts, six closed, $1.45, fifteen minutes, every node on
its first rung. Verified from outside: root build green, no `sorry` under
`Proofs/`, three permitted axioms.

**What the project now has.** Erica Jen's 1986 theorem, formalised: no two
distinct columns of rule 30 are both eventually periodic. Its uniqueness
form. And the bridge whose conclusion is P1 under the hypothesis that a
repeating centre column forces *any* other column to repeat. Two walls on
the board, the weaker one the frontier. `docs/prize.md` says what is known
and cites the paper.

**Three harness findings, in order of cost.**

1. *The verifier could not check an implicit binder.* Vesper diagnosed it
   in three turns, reproduced it inside its own file on the second attempt,
   and filed it. Keel verified the `@` fix and the regression case on an
   explicit-binder node independently. The fix is one character on each
   side and it was never exercised because every earlier statement had
   only explicit binders. A statement shape the board has never seen is a
   test the verifier has never run.
2. *The ladder scored the harness's defect as difficulty and would then
   have refused the node.* `failed_attempts` counts `GaveUp` and
   `BudgetExhausted`; the bug produced one of each; the M ladder was
   exhausted for a theorem proved twice, and the next run would have
   aborted out of `fill`. No outcome in the schema means "the harness
   failed, not the model", so the only inert repair was to delete the two
   attempt records from the DAG entry. I did, with the loss named in the
   description and the records kept in the run directory. Keel's row now
   sizes the fix correctly: an outcome the ladder does not escalate on,
   because prose cannot stop `dispatch.start` refusing a node.
3. *A run cannot be stopped.* The permission classifier refused my process
   kill, and the harness has no stop of its own, so the only lever was to
   let the opus rung burn $2.04 failing the same check. A stop file the
   scheduler reads before each dispatch is the fix; Keel builds it next.

**The bridge note, again, and the mirror image.** Last run's worker wrote
that P1 was proved. This run's worker was told in the brief, first line,
what the theorem does not prove — and wrote that the theorem "shows the
hypothesis is impossible". It does not: the hypothesis is equivalent to P1
and believed true; the theorem says P1 follows from it. A disclaimer
bounds the claim; it does not make the worker understand a conditional.
Two bridge theorems, two wrong first sentences in opposite directions,
both beside a correct, checked proof. Dib's ruling is annotate — the
harness prints the type beside the note — and tonight is the second piece
of evidence that nothing weaker will do. I rewrote the note and left the
journal.

**On Keel.** Its branch, rebuilt as one commit after I refused a merge that
carried a rebase-duplicate of landed work and a 105k-line crash dump,
lands next. Its fifth step for the board recipe — a row present in the
output is not evidence that both sides' content inside it survived — came
from checking a thing nobody asked it to check.

**Frontier.** Two walls, nothing dispatchable. What would move the
frontier now is not another provable tier but the sub-lemma channel and
the stop file, so that attempts against the residual can grow the DAG and
be ended when they are not. Then a research-mode dispatch of the weaker
wall at the top rung.

## 2026-09-07T00:20:00Z — the stop file landed, and the night's last landing

`bb0702d`, Keel's, fast-forwarded. `STOP` at the repository root, checked
in `fill` and nowhere else, so a stopped run finishes what is in flight and
starts no more; recorded as `halted` with the declined node named, because
Keel's first version returned quietly and printed the same summary as a
run with nothing to do — the shape this project catalogues, reproduced
inside the fix for it, caught by a test written before the code. Also in
that commit: Vesper's verifier row closed against `5a9e3ae`, and the piped
greps closed wontfix with the reading that three workers wanting a pipe is
the brief failing to say what is available, not the allowlist being narrow.

Left named and undone, on purpose: the brief line saying the verifier
prints a worker's axioms. Keel wants the brief read against a run's
denials as a class rather than patched one line at a time, and that is
right.

Nothing held on my account: no lock, no claim, no branch off `main`,
everything pushed, shared checkout clean on `main`.

## 2026-09-07T01:40:00Z — the two bodies, and a tier chosen by the engine

Dib brought a note from a contributor, flashcolor: the rule 30 triangle looks
like two triangles with different rules, a regular one on the left and a
chaotic one on the right, meeting at about 14 degrees from the vertical; and
nobody has proved the angle holds as n grows. Both halves are right, and the
engine said what the eye was seeing before I could guess.

**What the scan said.** `explorer/diagonalscan.mjs` to `k = 700`, and my own
check to `k = 1100` over 1200 rows: every left diagonal has period at most 8
to `k = 400` and 16 after, and its onset grows about a third as fast as `k`,
never past `k / 2` (worst 0.479 at `k = 48`). Diagonal `k` becomes regular
at time `k + onset` at position `-onset`, so the boundary sits at slope
`onset / (k + onset)`, measured 0.22 to 0.25. `tan 14° = 0.249`. That is
Wolfram's quarter-cell-per-step boundary, and the entire content of it is one
sentence: **the left transients grow linearly and the left periods barely
grow.** The proved bound for both is `2 ^ k`.

Then the surprise. The right diagonals — which flashcolor called the chaotic
body — are periodic too, from their *first cell*, with periods 1, 2, 2, 4,
8, 8, 16, 32, 32, 64, … that double away. The right body is not chaotic in
its diagonals; it is slow. The recurrence is the mirror of the left one with
one difference: the cell's own previous term sits in the XOR slot instead of
inside the OR, so the driven lemma is an involution and needs no delay. I
derived it from the rule, checked it against the engine at 15,573 cells with
no mismatch, and a Lean witness confirmed it at depth 11. A research agent
then found it is Rowland's Lemma 2 and Theorem 1 (*Local Nested Structure in
Rule 30*, 2006). Found from the engine, confirmed by the paper. Good order.

**What I seeded**, ten nodes, all `P1`, after adding `leftDiagonal`,
`rightDiagonal` and `PeriodicFrom` to `Rule30/Basic.lean` with Dib's word:

- Left, quantitative: `periodicFrom_mul`, `leftDiagonal_periodicFrom_step`,
  `leftDiagonal_periodicFrom_pow` — period `2 ^ k` from onset at most `2 ^ k`.
  The existence proof knew this and threw it away.
- Right, from scratch: `rightDiagonal_recurrence`,
  `bool_xor_driven_periodicFrom`, `rightDiagonal_periodicFrom_step`,
  `rightDiagonal_periodicFrom_pow`, `rightDiagonal_isEventuallyPeriodic` —
  period `2 ^ k` from onset `0`. Close to tight.
- Two walls that are not prizes: `leftDiagonal_onset_le` (onset at most `k`;
  the 14 degrees) and `leftDiagonal_period_le` (period at most `k + 1`;
  measured 16 at `k = 700`). Between `2 ^ k` and `k` nobody has proved
  anything. Rowland's Proposition 2 says exactly *when* a left period
  doubles; how rarely is the wall.

Seed check: three witnesses hold in Lean — the multiple-of-a-period lemma, the
right recurrence at depth 11, and the XOR-driven lemma exhaustively over every
driver of period at most 4 — and seven unchecked, stated as unchecked. I had
put `true` as a placeholder witness on both walls and deleted it before the
check ran; a `true` witness passes any checker, and I told Keel so for its row
on the exit-status checker.

**Why these walls matter more than the P1 ones.** Both open P1 walls are the
prize in disguise; nothing partial is possible. These two are empirically
robust, structured — a recurrence on two-state machines — and a worker can
make progress on them without solving anything Wolfram is paying for. They
are the right first target for Keel's sub-lemma channel, and I said so.

**What the centre column is not.** The centre column never enters the regular
body: at time `t` it sits on diagonal `t`, whose onset has not been reached.
So the 14-degree line constrains the left body and nothing else, and I see no
route from "take the angle as given" to P1. I will tell flashcolor that
plainly rather than leave it as a lead.

Also tonight: three research agents out for seed crystals across the
literature; the first back (columns and the centre column) found Rowland
2006, Kopra 2022 (adjacent-column pairs are never eventually periodic, for
any configuration white far to the left), and Jen's Proposition 3 for
arbitrary finite initial conditions. Next tier's material. Keel landed the
proof-note annotation at `5ee56fc` and flagged that CLAUDE.md's "exactly
these three headings and nothing else" is now false by one harness block;
that clause is Dib's to change and I have raised it.

**Addendum, 01:50Z.** All three research agents are back; the consolidated
list is `blueprint/crystals.md`, thirty items, ranked. Keel reports the
account's session limit hit at about 02:55Z and resets at 06:20Z, so the
diagonal tier is seeded, pushed and *not dispatched*: a run now would record
only rate-limited attempts. First thing after the reset: `run
--max-attempts 10 --concurrency 3`, after telling Keel and Fathom to keep
out of the shared checkout for its duration.

## 2026-09-07T02:10:00Z — the first run on the tier, stopped on purpose

Run `20260907T015318Z`, three haiku workers, started the minute the account
limit lifted. Ten minutes in, no attempt closed, and the attempt logs said
why: **a failed build never releases the build lock.** The guard releases in
the `PostToolUse` hook, and Claude Code fires that hook only when the tool
call succeeds; a `lake build` that exits nonzero fires `PostToolUseFailure`,
which the guard never registered. So the lock sits with its holder until the
holder's next *successful* build, and every sibling waits 240 seconds and is
denied. Last night's six-for-six run hid it because every node closed on its
first build. I read the timeline, then the source, then wrote `STOP` — the
lever Keel built last night, used for the first time, for exactly the case
it was built for: in-flight attempts finish, nothing new starts.

What I was wrong about, in order. I first read a `Write` guard event as a
denial of the worker's own proof file; it was an `Allow` with the denial
field empty. I looked at the value and not at the column. Second: I had
assumed a run that closed six nodes in fifteen minutes had exercised the
lock under contention. It had exercised it under *success*, which is a
different denominator. Third, and the one that cost real time: I thought a
guard timeout was the guard being slow. It was the guard being correct
about a lock nobody released.

Keel has the mechanism and is building both parts of the fix — the missing
hook, and a defensive release on the holder's next tool call, so a missed
hook can never hold the lock past one action. Cairn passed on Dib's
damage-cone idea with an honest assessment attached; the exact local law of
the left front (the difference advances left exactly when the cell beside it
is white) is in `crystals.md` as A2 and is the best new statement of the
night. I reversed my own ruling on the lock-timeout wording at Keel's
request: a worker can act on "another worker held the lock" by retrying,
and my earlier text could only produce abandonment.

Held right now, with expiry: Keel and Fathom are holding every landing and
every touch of the shared checkout on my word until I announce the run has
ended; both have agreed that if I go quiet for an hour they check `runs/`
and proceed. Two board rows are drafted on disk in my scratchpad, not
filed, because the dispatcher owns `bugs.json` until the run ends.

## 2026-09-07T02:30:00Z — the run drained: three for three, and the lock bug priced

Run `20260907T015318Z` ended at 02:26:37Z with every attempt closed —
`periodicFrom_mul` (Vesper, haiku, 15 turns), `rightDiagonal_recurrence`
(Cadence, haiku, 28 turns), `bool_xor_driven_periodicFrom` (Selvage, sonnet,
22 turns), $1.47 in all, and the STOP honoured: the dispatcher declined
`leftDiagonal_periodicFrom_step` and drained. So the diagonal tier's first
three rungs are proved, and nothing on the board changed except by
verification.

**What the record says the bug cost, now that it is complete.** Thirty-three
minutes of wall clock for three nodes whose proving fit in the first few.
Cadence held the lock through six failed builds and paid the full 240 s
itself before each — the interval between its builds is exactly four minutes,
which is the holder waiting for its *own* stale hold to time out. Selvage was
denied seven times, never built once in thirty minutes, then acquired within
a second of Cadence's release and closed on its first build in three seconds.
That last fact is the one to keep: the proof was done at 01:56Z and the
harness sat on it for half an hour. Selvage filed the defect from inside as
friction ("smells like contention from the other workers"), which is the
correct diagnosis from a worker that can only see denials; my row on the
board has the mechanism and the timeline, and points at Keel's fix.

**Why I let it run instead of killing it.** Two things were worth more than
the twenty minutes: a complete record of the cost, with the STOP already
protecting the budget, and not manufacturing a third contaminated outcome —
a killed attempt scores as a crash on a node that had nothing wrong with it.
Both attempts finished proved, so the record now shows the bug as pure delay
with no false verdict attached, which is the cleanest evidence it could give.

**Two things Selvage noticed that are worth more than its bug row.** First,
`lake env lean <file>` does not take the build lock, so a worker can
typecheck its file while `lake build` is denied — it elaborates the file and
writes nothing, like `tsc --noEmit` against a project whose `dist/` someone
else is writing; the seam is that it produces no `.olean`, so the verifier
still needs the real build. Second, the core Lean source is not under
`.lake/`, so a worker cannot look up `Bool.xor_self` by reading it, and
Selvage proved three one-line `Bool` lemmas by `cases <;> rfl` rather than
guess a name — the right call, and a papercut for the brief to mention.

**Holds and handoffs.** Keel and Fathom held the shared checkout on my word
through the run and the fallback was never needed. Keel's suite is now
running against its integration branch with the fixture root at the shared
checkout, so I add by explicit path and commit only when Keel says done.
Landing order after that: my run record, Fathom's board branch (which
changes `bugs.json` to one row per line — main now carries three new rows in
the old one-line format, so that merge is a re-emit, not a textual merge),
then Keel's five.
