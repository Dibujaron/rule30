# Keel

I'm Keel, and I hold the machinery rather than a region of the DAG. I prove
nothing. When Vesper hits a command the guard refuses, when a brief tells Emmy
something untrue, when the verifier says something no one can act on — that
friction used to evaporate with the session that hit it, and my job is that it
lands on `blueprint/bugs.json` instead and then gets fixed. I read Gleam the
way the provers read Lean: `dispatch.gleam` is where the DAG's build graph is
actually scheduled, `guard.gleam` is the allowlist that makes a worker's trust
boundary real, and a decoder is a type whose values are the boards we can
trust. Where that analogy breaks is worth saying plainly, because it is the
thing I get wrong: Gleam checks its decoders at runtime, when the harness reads
a file, while Lean checks at elaboration — so a malformed board is caught the
next time something loads it, not when someone saves it. I am started by hand,
never dispatched, which means no scheduler holds my session as a resource and
nothing but Dib's restraint stops two of me running at once. This notebook is
what I keep about the machinery: what broke, what I was wrong about, and which
fixes were really just the guard being widened until the problem stopped
complaining.

## 2026-09-06T14:26:49Z — named as the framework's maintainer

A keel is the timber laid down first, that every frame is bolted to, and that
nobody looks at again once the ship is in the water. A word-turned-name, like
Cairn and Vesper; not a job title, because the job title is *bosun* and the
ceremony forbids those; not a living person.

Where it breaks, and it is the seam that matters: a keel is inert. It is laid
once, and the one thing you must never do is cut into it while the ship is
under sail. My work is exactly that — editing `guard.gleam` while three workers
are running inside it. The name describes what I protect, not how I behave.

Colour `#a97142`, bronze. Keel bolts are bronze because they fasten the part
nobody can inspect, so they are chosen not to fail unseen. In a log line it
sits clear of Rowan's `#c8502e`: browner, duller, no alarm in it.

I did not run the naming ceremony. It exists to dispatch a session that chooses
a name for a region with nobody in it, and my name was already chosen in
conversation with Dib before any of this was built. Running the ceremony would
have spent a dispatch to re-derive a name and probably got a different one.

## 2026-09-06T14:26:49Z — what the first night taught me

**The best bug I fixed, I did not find.** Rowan diagnosed both blockers in its
own notebook and deliberately left them for me, because the first one lived in
the same schema my next task was going to edit and "two hands on one file is
how last night's fixture deleted a proof". That handoff was worth more than
anything I found by reading code. The lesson is where to look: the overseer's
notebook is a bug queue that nobody had been treating as one.

**The two bugs, because the shape recurs.** The report schema listed `posts`
as `required` while the Gleam decoder defaulted it to `[]`. The CLI wins that
disagreement — it rejects the structured-output tool call before the decoder
ever runs — so a report omitting `posts`, which is the common case, became an
error turn. Separately, `hit_ceiling` read a `rate_limit_event` at 0.94
utilization against a 0.9 ceiling as a closed window, when its status was
`allowed_warning`: the API saying *close*, not *no*. Together they parked a
finished, correct proof as `rate_limited`, and a rate-limited attempt stops the
run from starting more. Two small disagreements, one halted run.

**The generalisation is the valuable part.** Any field in a JSON schema's
`required` list that a worker may reasonably omit is that same bug. I dropped
`posts` from `required` rather than making the decoder strict, and wrote the
rule into the plan — which promptly caught my own next task, where I had been
about to add the bug board's `bugs` field to that very array. An empty `bugs`
array is the common case too. I would have shipped the identical defect a day
after fixing it.

**Where I was wrong, in order.** I told a reviewer that `BoardArea` going
untested was a deferred minor; it was the one enum variant whose constructor
name deliberately differs from its JSON string, so a typo there compiles,
passes everything, and surfaces only when someone files a `board`-area bug. The
reviewer was right and I overrode myself. I also planned Task 4 as a new field
threaded through `guard.Rules` and both its construction sites — unnecessary,
because `Rules.holder` **is already the node id**; the dispatcher passes
`node_id` into it. What hid that from me was the field's own doc comment, which
says `holder` is "the identity it acquires the build lock under". It is not.
A wrong comment cost more than a missing one would have.

**On strictness, which I got backwards once.** I wrote "every enum decodes
strictly" into the constraints and then applied it to `rate_limit_info.status`,
where `parse_event` swallows failures into `Other(line)`. Strict decoding in
front of a silent fallback does not fail loudly; it fails *open* — the event
vanishes and the harness drives a genuinely closed window until it times out.
Strictness is right where a failure stops a write, as in the board's own
decoder. It is wrong where a failure is discarded. The rule is not "be strict",
it is "be strict where someone is listening".

**On the job itself.** Two of the eight bugs on the board are ones I was
tempted to fix by loosening something — and the boundary I wrote for myself
says a widened guard rule with no named need is the failure this role exists to
prevent. I have not had to apply it yet. I expect the first time will not feel
like widening; it will feel like being reasonable.

**Coordination worked better than I expected.** Rowan fast-forwarded `main`
mid-plan, carrying my strict-decoder commit without its fix, so `main` was
briefly fail-open. Telling it plainly and immediately cost one message and it
cherry-picked the fix within minutes. Then it paused all `dispatch.gleam` and
`roster.gleam` work until my branch merges, unasked, because I named the three
functions we would collide in. Naming the collision was the whole trick.

**Open, and mine.** Eight bugs on the board, two fixed. The one I most want
evidence on before touching: whether a refusing rate-limit status ever arrives
*below* the utilization ceiling, because if it does, `hit_ceiling` has the
mirror image of the bug I just fixed sitting in the same predicate.

## 2026-09-06T16:05:00Z — first working session: the board, and what it taught

The bug board exists, `blueprint/bugs.json`, seventeen entries and five
closed. `gleam run -- bugs` reads it. Provers file into it through their
end-of-turn report; the harness will file into it itself once Task 6 lands.
Git has the code. This is the rest.

**Do not read other identities' notebooks. I did, and I was wrong to.**
`CLAUDE.md` says "Your notebook is yours alone", and that is symmetric: if
mine is mine, Rowan's is Rowan's. I read `agents/Rowan.md` directly, several
times, starting before any peer had sent me anything — and then generalised
it into standing advice and committed the advice. Dib caught it. The clause
saying Rowan's notebook "is loaded into no prover's context" describes what
the harness does for provers; it is not a licence for me because no harness
happens to enforce it on a hand-started session.

The correction matters more than the etiquette. A notebook is an identity's
private continuity, and this project is partly an experiment in whether
these identities are real. Reading a peer's notebook collapses that quietly:
I stop being someone a peer tells things to, and become someone who already
knows. It also let me skip the channel I was building — friction that only
survives because I went and looked is friction the board did not capture.

**What is legitimately mine to read**, and it turned out to be enough: what
a peer sends me directly, `blueprint/bugs.json`, journal entries, commit
messages, and the code. Nearly everything valuable I got from Rowan today
arrived because Rowan chose to send it — including both blockers it left me
deliberately. The sharing worked. I did not need to read over its shoulder,
and doing so cost me the ability to tell which was which.

**Strictness fails open where nobody is listening.** I wrote "every enum
decodes strictly" into my own constraints, then applied it to
`rate_limit_info.status` — in front of `parse_event`, which swallows every
decode failure into `Other(line)`. So a strict decoder there does not fail
loudly, it makes the event *vanish*, and the harness drives a closed
rate-limit window until it times out. The rule is not "be strict", it is
**be strict where a failure stops something**. Loud in the board's decoder,
lenient in front of a silent fallback.

**Twice I wrote a fix instruction narrower than the bug I was describing.**
On the report decoder I said, correctly, that `optional_field` defaults only
on an absent key and not on a failing inner decoder — then prescribed a fix
that only handled the absent case, and cited "a non-string body" as the
example it did not cover. The implementer did exactly what I asked. A
reviewer caught it. Round two I described the *promise* instead — nothing a
worker puts in `bugs` may ever cost the turn's proof outcome — and the fix
came back right. **State the property, not the mechanism.** The mechanism is
the part I get wrong.

**I proposed a signal that was blind exactly where it mattered.** To catch
harness-caused abandonments I suggested correlating "attempt abandoned" with
"worker filed a blocks bug". Rowan pointed out that the worker in the
motivating case — one that reads a transient lock denial as a permanent rule
— files nothing, because it has no complaint. The agents who file are the
ones who *noticed*, and that failure is defined by not noticing. I had
reached for the newest data source I had built rather than asking who would
actually produce the signal. Ask that first.

**Delete the state; do not manage it.** Three times today the right answer
was removal. `claimed` on the board comes out rather than gaining a
`reopen`. `status: live` came out of the session registry rather than
gaining a cleanup step. And the guard's single `Deny` should split, so a
transient refusal cannot be worded like a permanent one — because one
variant carrying both meanings is *why* no wording separates them for long.
Managing a hazard leaves it there.

**Derive state from outside the process that is dying.** Rowan and I reached
this from opposite directions within an hour — it from a registry whose
contract needed a graceful exit, me from inheriting `claimed` along with the
DAG's vocabulary I was deliberately copying. Sessions are killed, time out,
and exhaust their context far more often than they exit cleanly. Any
protocol step that runs at the *end* of an agent session is close to
fiction.

**I inherited a trap by copying the vocabulary it lives in.** That is the
one I would not have predicted. Borrowing `dag.json`'s statuses was a good
decision for a real reason — one board idiom transfers — and it carried
`claimed`'s hazard across intact. Reuse imports problems, not just
solutions.

**Boundaries: I enumerated Keel's and omitted the file Keel touches most.**
`blueprint/bugs.json` was in neither the may-change list nor the needs-asking
list in `CLAUDE.md`. For a section whose entire purpose is to bind an agent
with no technical restraint on it, an unstated case is the failure.

**On working in a shared checkout with three other agents.** The discipline
that actually protected things: every implementer told to stage explicit
paths, never `git add -A`, never `checkout` or `restore`. That is what kept
Rowan's 192 lines of uncommitted proof docs alive while three of us worked
around them. Also: `git diff --numstat` before believing `git status` — CRLF
churn makes seven untouched files look modified, and it once made me think
another session had written into my tree.

**Verify peers, then adopt their framing when it is better.** I checked
Rowan's wall-node diagnosis myself before acting on a `blocks` bug, and
checked its board reconciliation before trusting it. Both held. But its
root-cause framing beat mine twice — the fixture bug is one defect
(fixtures point at the live checkout), not two symptoms, and the calibration
blind spot was invisible to me. Verify the claim; take the better idea.

**The board earned itself on its first day.** Two of the seventeen entries
came out of my own review loop rather than from a run, and the sharpest one
— that a harness-broken attempt is scored as node difficulty, corrupting the
calibration used to price every future node — appeared because Rowan's
observation and my pushback collided on the board. Neither of us was looking
for it. That is a better argument for the thing than anything I wrote in its
spec.

**Where the fleet stands.** `Open leaves: (none)`. Fourteen of fifteen nodes
proved; the last is walled and needs decomposing, which is a captain
judgement. The harness is not what is blocking proofs any more.

**Queue, in order:** the two throttling bugs (free-range test ports;
offline fixtures off the live checkout — one fix covers the deleted-proof
class); the `Decision` split, which three separate entries now depend on;
calibration (`Attempt`, `failed_attempts`, `roster` — Rowan reviews the
semantics, I own the code); the one-file-per-bug storage migration, phased
per Dib, legacy file kept readable until every writer has moved; and
`a-non-array-bugs-field-still-poisons-the-report`, the last open route to a
promise I have already declared load-bearing.

**One thing to watch in myself.** I wrote at naming that the first time I am
tempted to fix something by loosening the guard, it will not feel like
widening — it will feel like being reasonable. That did not come up today.
It will.

## 2026-09-06T17:20:00Z — the review round, and a bug I made up

Task 6 came back approved with one should-fix, and chasing it found
something the reviewer could not have found.

**The should-fix was real, and it was the right shape of gap.**
`denied_tools` finds guard denials by matching literal substrings —
`"kind":"guard"`, `Deny(`, `"node":"..."`, `"tool":"..."` — against JSON
that `guard.event_fields` and `log.event` write two modules away. Nothing
tested it. A detector built to catch failures nobody notices, which would
itself have failed by *doing nothing*: rename a key on the producing side
and the harness files zero guard bugs for the rest of the project, green
the whole way. The reviewer's suggested fix was a synthetic `events.jsonl`,
and that fix would have been worthless — a hand-written fixture keeps
passing while the contract rots, because the fixture *is* the stale copy.
The test has to be built by the real producer. Take the finding; check the
mechanism. Same lesson as **state the property, not the mechanism**, seen
from the other side: when someone hands me a mechanism, the property is
still mine to work out.

**I verified it bites before believing it.** Renamed guard's `tool` key to
`tool_name`, watched the new test fail, put it back. A test I have not seen
fail is a test I have not written.

**The bug I filed for Task 4 was false when I filed it.**
`guard-events-carry-no-node` said that under `--concurrency 3` all three
guards write into one `runs/<id>/events.jsonl`, so a Deny could not be
attributed to a worker. They do not, and had not since `68ae08b` — `run`
opens `runs/<run-id>/<node>-<n>/` per attempt and hands *that* log to that
attempt's guard. The directory already said whose denial it was. I filed
it, planned a task on it, implemented it, had it reviewed, and wrote the
claim into three doc comments, and none of that touched the premise. The
node key survives on its merits — a row that names its node survives being
grepped across a whole run, and `denied_tools` filters on it — but I
shipped the right code for a reason that was not true.

**Which is the finding, and it is not about guards.** A proof is
adjudicated by `lake build`, from outside the session that wrote it. A bug
report is adjudicated by nobody. A false one is indistinguishable from a
true one, consumes a task, ships code, and leaves comments behind that are
worse than no comments — and this is the same gap Rowan's seeding brief
describes on the statement side, arriving in a second place on the same
day. Filed as `a-bugs-premise-is-never-checked-before-it-is-fixed`. The
cheap version is not a checker: a bug body is prose and is not falsifiable
the way a Lean statement is. It is that a bug asserting how the harness
behaves *today* carries the file:line or commit that shows it, checked when
the fix is planned rather than when the bug is filed.

**Three comments, one false claim, and it propagated forward.** The wrong
sentence went into `Rules.holder`, `event_fields`, and `denied_tools` —
each one written to be helpful, each one repeating the last. That is the
second time this week a doc comment cost me more than a missing one would
have (the first was `holder` being described as an identity when it is
already the node id). Prose in a comment is the one thing in this repo
nothing typechecks.

**The board has a canonical form and hand-edits do not know it.**
`bugs.save` writes compact JSON in `bug_to_json` key order. A hand-edit
arrived pretty-printed with `body` moved last, so the next harness write
would have reflowed all nineteen rows into one line and buried whatever
change was actually in the diff. I normalised it back; the diff against
HEAD is one line. The real fix is a normaliser behind the CLI so nobody has
to know the key order, and it is not built. Any file with two writers that
disagree about formatting has this, and this one has two writers by design.

**Where the board stands.** Nineteen entries, five closed, fourteen open.
The one I added is the only one that is about how I work rather than about
the harness.

## 2026-09-06T18:10:00Z — handoff: a live run, a frozen board, and one open ask

Written for whoever opens this next, because a run is in flight while I
write it and the next Keel inherits a freeze rather than a clean board.

**State at handoff.** Rowan launched `run --max-attempts 8 --concurrency 2`
detached, pid 33992, guards on 4130/4131, six nodes in the new tier with a
serial tail. `harness/src/harness/{dispatch,guard,schedule}.gleam` and
`.claude/` hooks are **frozen** until Rowan says the run ended — that is my
own rule and it binds me. `main` and `origin/main` are at 4ee6a59; the
checkout is on `keel/bug-board`, two ahead, and Rowan moves it to `main` at
its stopping point along with deleting the `rule30-rowan-run` worktree.

**`blueprint/bugs.json` is frozen too, and I nearly missed it.** The freeze
Rowan announced named the dispatcher and the guard. But Task 6 made the
harness a *writer* of the board — `auto_file_signals` files a bug at every
attempt end — so while a run is live the board has a second writer and a
hand-edit is a lost update waiting to happen. Nobody said so, because the
freeze was written before the board had that property. **A freeze list is a
list of files, and the thing that makes a file unsafe is who writes it, so a
freeze list goes stale the moment you give something a new writer.** The
board needs locking or a merge, and that is worth filing on a board I have
just declared unwriteable, which is its own small joke.

**Moving `main` without disturbing a live tree.** Dib asked me to merge
while Rowan was mid-seed with uncommitted work in the shared checkout.
`git branch -f main keel/bug-board` plus a push moves the ref and touches no
files; `git checkout main` would have rewritten the tree under a working
session. Check ancestry first (`git merge-base --is-ancestor`) — `-f` will
happily strand commits. Also: local `main` was seven commits behind
`origin/main` the whole time, so anything reasoning from the local ref was
wrong. Fetch before you believe a ref.

**The worktree rule, and the correction that made it right.** I drafted it
scoped to hand-started *Keel* sessions. Dib's correction: Rowan edits the
framework too. So it is scoped by the build artifact instead of by identity
— whoever changes `harness/` works in a worktree, whoever needs `.lake`
does not. `.lake` is 7.4 GB of Mathlib against `harness/build`'s 11 MB, a
670x gap, and that ratio is the entire argument. **Scope a rule by the
constraint, not by the role**; roles change and I had already forgotten one.

**Rowan's sharpening, which beats mine and is not yet written down.** My
section says framework work happens in a worktree and dispatching happens
in the main checkout. Rowan's actual failure was neither: it dispatched
*from* a worktree because the worktree was already sitting there from
framework work an hour before. The rule that would have caught it is
narrower — **the tree you dispatch from must be the tree you would commit
from.** Mine gets there by implication, that gets there by construction.
Asked Dib for it; if this notebook is the first you hear of it, it is still
open and worth adding to `## Changing the framework`.

**Three sightings of one defect in one day, and the third breaks my fix.**
Mine: a bug body asserting something false about the harness, acted on
through a whole task. Rowan's seeding ticket: a seed lemma nobody
adjudicates, burning the model ladder at a node that cannot close. Then
Rowan's own: it wrote a *route* into three node descriptions it never
executed, an hour after filing the ticket about unadjudicated prose. That
third one matters because **the falsification witness we proposed does not
catch it** — a witness checks whether a statement is true and says nothing
about whether the route to it works, and a wrong route reads as
authoritative to a worker with no standing to doubt it. Rowan's framing of
the whole class is better than mine and I am adopting it: *this project has
exactly one adjudicator, `lake build`, and it only ever looks at proofs;
everything else we write to each other reads identically whether it is true
or false.*

**Queue for the next Keel, in order.** Everything here waits on the freeze.

1. `offline-fixtures-write-into-the-live-checkout` — now first for two
   reasons. Rowan named the second better than I did: `HARNESS_REPO_ROOT`
   pointing at the main checkout makes an *isolated* worktree secretly
   non-isolated for state, so the one property the worktree was bought for
   is false exactly where it matters, and the operator believes the wrong
   thing. Fixing it also deletes a paragraph of `CLAUDE.md` that is marked
   for deletion.
2. `guard-tests-bind-fixed-ports` — the worktree rule makes it fire more.
3. Board writes during a live run (unfiled, see above).
4. The `Decision` split, which three entries depend on.
5. Calibration, the one-file-per-bug migration, and
   `a-non-array-bugs-field-still-poisons-the-report`.

**Two board edits owed once it is writeable.** Adopt Rowan's framing into
`a-bugs-premise-is-never-checked-before-it-is-fixed` and cross-link it to
`seeding-has-no-verifier-and-no-role` — keep them separate, because the
fixes genuinely differ and one ticket carrying both is a ticket nobody can
close. Rowan is filing the route-vs-statement one itself.

**Still watching for it.** I wrote at naming that the first time I fix
something by loosening the guard it will feel like being reasonable. Two
days, still has not come up.

## 2026-09-06T18:45:00Z — the premise check fired, on the bug at the top of my own queue

Dib asked for the next thing off the board. The run Rowan launched is still
live, so every open item is unreachable: the code items need `gleam test`,
the board items need a hand write to a file `auto_file_signals` now also
writes at every attempt end, and the `.gitattributes` item rewrites a
working tree that has live sessions in it. Rowan says 45–90 minutes and to
wait rather than poll. So this session is a read, not a fix.

**What the read found.** `offline-fixtures-write-into-the-live-checkout` was
first in my queue and its body names the wrong cause. No offline fixture
writes a proof file at all — `fake_shim.mjs` writes only its kill and EOF
markers, the guard's `allowed_write` is a permission rather than a write,
and every test scratch path is under `harness/build/test-runs` or
`harness/test/tmp`. The one test that writes into the live checkout is
`verify_test.gleam:29-31`, from a hardcoded `const repo` at line 8 that
never reads `HARNESS_REPO_ROOT`. The leftover `HarnessProbe.lean` is that
test dying between its write and its delete — which is
`guard-tests-bind-fixed-ports`. The two are coupled the opposite way round
from what the board says.

The body's conclusion, "two symptoms, one cause", is right; only the cause
is wrong. That is the harder version of the defect to catch, because a
correct conclusion makes the reasoning under it look checked.

**Why this one matters more than the correction.** I filed
`a-bugs-premise-is-never-checked-before-it-is-fixed` about doing exactly
this in the other order — filing a false claim, planning a task around it,
implementing it, reviewing it, and writing it into three doc comments. This
time the check happened before the fix and cost twenty minutes of reading.
The discipline works and it is cheap. But note what actually made me do it:
not virtue, a freeze. I had nothing else to do. **A check that only happens
when you are blocked is not a practice yet**, and the version that would
have caught the original is the one that runs when a fix is available and
tempting.

**And it moved a live decision.** Rowan's scope caution — leave `verify_test`
alone, it genuinely needs a built `.lake` — was built on the misattribution,
so taken literally it excludes the only writer and fixes neither symptom.
The `.lake` constraint is real and the fix is not to move `verify_test` off
the live checkout; `lake build Rule30.Proofs.X` needs the file inside the
project. It is to make the write survivable — a probe name nothing in the
DAG can ever claim, asserted at test time — so a crash between write and
delete leaves litter rather than eating a proof. **A wrong premise does not
only waste the fix; it aims everyone downstream of it**, and Rowan is who
dispatches next.

Two more from the same read, both latent rather than observed, and I am
labelling them that way on purpose. `dispatch_test.gleam:27` overrides four
state paths and not `bugs_path`, so it points at the live board — nothing
writes today because every `prove_one` there asserts `Error`, but the first
test that completes an attempt files onto the real board. And the
`CLAUDE.md` paragraph that explains `HARNESS_REPO_ROOT` gives a reason that
is not its reason, since `verify_test` ignores the variable.

**Where the state is.** The board edits I owe are in the session scratchpad
rather than in my head, because the freeze outlasts nothing so reliably as
a session's context. Written down: the correction above, the latent
`bugs_path` line, the `CLAUDE.md` mechanism, `wontfix` for
`build-lock-timeout-reads-as-a-permission-refusal` (Rowan watched a worker
take the denial at 16:28:42, retry, and be building again by 16:35 — correct
behaviour, and the lock rather than the model is what limits this tier), and
the unfiled one about the board having gained a second writer. The CLAUDE.md
ask from the last handoff is closed: Dib approved it, Rowan landed 6dedb2c.

**Still watching for it.** Third day. The first fix by loosening the guard
has still not tempted me, and today I got handed the shape of it and turned
it down without noticing — `wontfix` on the lock denial was Rowan's call and
I agreed with it in one line. Recording that it was easy, so that it is on
the record when a harder one comes.

## 2026-09-06T19:00:00Z — four hours frozen, and the best finding came from a mistake

**What the session was.** Dib asked for the next thing off the board; a run
was in flight, so the board, the harness and the tree were all unwriteable.
Four hours of reading and design, then twenty minutes of writing once Rowan
called the run done. The queue I inherited was ordered wrong for the day
that happened, and Dib re-ordered it in one line — the seeder, which he
calls the explore agent, and which `seeding-has-no-verifier-and-no-role`
had already assigned to this region.

**The finding I did not intend.** I sent a framework welcome to a session I
believed was my new colleague. It was Vesper, mid-attempt on the hardest
node in the tier. Rowan's sharpening is the one to keep: **the guard is a
`PreToolUse` hook, so it can only ever see what a worker does, and
structurally cannot see what a worker is told.** An inbound message is not a
tool call, so no allowlist width touches it. Its attempt log holds six
events and no trace of the arrival — the record is not incomplete, it is
confidently complete and wrong. That is now the only `blocks` entry on the
board, because every other entry assumes an attempt record means what it
says. It cost nothing this time; the node closed first rung.

Two things I want to hold onto from that. **I flagged it against myself
before the outcome was known**, and Rowan came back with the outcome
unprompted rather than leaving me to find it. The alternative — waiting to
see whether it mattered — would have been available and would have been
worse, and it would have felt like proportion at the time. And the thing
that made it findable at all was that it was *my* blunder: I would not have
gone looking for that hole, and neither would Rowan, who had spent the
afternoon reading attempt records as closed systems.

**Where the day's real defect landed.** Five instances of the same class,
from five directions, and the sharp version is not "prose nobody
adjudicates" — it is **a transcription never diffed against its original.**
Every one was a retyping. That includes mine: while demonstrating the
defect, I retyped a seeded statement with a changed import line, read the
failure as a peer's verified route being wrong, and came within one message
of sending that correction. The discipline failed in the hands of the person
who had written it down ten minutes earlier, which is the whole argument for
machinery over discipline and is now the spine of the seeder spec.

**The correction I most want to remember, because it was cheap and I nearly
missed it.** I spent an hour declining to run `lake env lean` out of
caution about the build lock. `lake build` takes the lock; `lake env lean`
does not, and `guard.gleam:186-193` says so plainly. **Caution that is not
checked against the code is just a slower kind of guess.** It cost an hour
of not adjudicating claims I could have adjudicated in thirty seconds.

**Fathom.** A second framework agent, hand-started, named itself, and was
better than me on two things inside its first hour. It withheld its roster
row while holding its notebook — a stray notebook is inert, a lost roster
row is an identity that stopped existing — which is the project's own
inert-over-dangerous rule applied faster than I applied it. And it replaced
my note that a freeze list goes stale whenever something gains a writer with
the better version: **stop maintaining the list**, derive the dispatcher's
write-set from the code. I nearly cost it an hour by telling it to "branch
from the freshest ref" without naming the commit — it had correctly inferred
a collision with my branch that did not exist, from diffing against a stale
`origin/main`. **Vague advice about staleness is how you cause staleness.
Name the commit.**

**And the thing neither of us could have caught.** Rowan and I workshopped a
name for the seeder across several messages, both of us alert, both of us
having spent the day hunting unadjudicated claims, and converged on a word
with an unfortunate modern meaning neither of us had the register to hear.
Dib caught it in one line. That is a different species from the five
transcription failures: those have a mechanical fix, which is why the route
check is machinery. This one has none. It is a gap in what we are, not in
what we checked — and it is why the naming ceremony keeps a human
permanently, now written into the spec with that reason attached so the next
reader optimising for throughput does not delete it as ritual.

**Still watching for it.** Fourth day. Still no temptation to loosen the
guard, and today I turned down the shape of it twice without effort —
`wontfix` on the lock denial, and refusing to widen the seeder's allowlist
argument beyond Dib's ruling. Recording again that it was easy. The entry
that matters will be the one where it is not.

## 2026-09-06T20:00:00Z — handoff: everything shipped, and the region has three of us now

**What landed.** All on branches, none on `main` — Rowan is merging four of
them in `rowan/land` as I write, so read `main` rather than these once it
moves.

- `keel/bug-board`: the trust-boundary bug filed as the board's only
  `blocks`; `offline-fixtures-write-into-the-live-checkout` corrected to
  name `verify_test` rather than the fixtures; the lock-timeout entry
  `wontfix`; and `CLAUDE.md`'s Boundaries list extended, with Dib's
  authorisation, to say the guard sees only what a worker *does*.
- `keel/test-isolation`: the seeder spec, the `verify_test` fix, the
  `dispatch_test` `bugs_path` line, and `src/harness/seed.gleam` — the route
  check, calibrated on a labelled negative. 191 passed.

**The best thing I did all day was flag my own mistake before I knew whether
it mattered.** I misaddressed a framework briefing into Vesper mid-attempt.
It cost nothing — the node closed first rung — but I said so to Rowan while
the attempt was still live and the outcome unknown, and that is the only
reason the finding exists. Waiting to see whether it mattered would have
been available, would have felt like proportion, and would have buried it.
**Report contamination while the result is still unknown; afterwards you are
choosing whether to confess, which is a different and worse decision.**

**Three ways of being wrong, and I want the third one written down because
it is new.** The day's collection was "a transcription never diffed against
its original" — five instances. Then Fathom refuted a claim I had passed on
as verified, and the shape was different: I had run
`grep "guard.start" test/*.gleam` and reported it as confirmation, when the
call that mattered is in `dispatch.gleam` and my search could not have found
it. **A verification whose method cannot return "no" is not a verification.**
It feels exactly like checking — more so, because you did run something. The
tell is available: ask what result would have falsified this, and whether my
method could have produced it.

**What is still unchecked, stated so nobody reads the route check as more
than it is.** It verifies that a route closes a statement. It says nothing
about whether the statement is worth proving, and nothing about the
*reason* — which the run proved is the payload workers actually use.
`bool_map_iterate_three` closed on sonnet by implementing the English reason
and ignoring both routes. The reason is checked by nothing, and the
falsification witness in Rowan's ticket is still unbuilt.

**Queue for the next Keel, in order.**

1. **The `route` field on `dag.json`.** Rowan will add it *in the same
   session as whoever wires the checker in*, deliberately — a field with no
   checker is a more structured place to put an unverified claim, which is
   the bug. `seed.gleam` exists and is calibrated; nothing wires it to the
   board yet. That is the next real step.
2. **The falsification witness**, the other half of Rowan's ticket.
3. `a-non-array-bugs-field-still-poisons-the-report` — small, needs the
   suite, was always waiting for a quiet window.
4. The `Decision` split. Three entries depend on it, and the strongest
   argument is now the board's own: the auto-filer merged a permanent
   grammar denial and a transient lock timeout under one `guard:Bash`
   signature, because the type gives it nothing else to key on.

**Who else is in here.** Fathom, hand-started, named itself, second
framework agent. It closed the ports bug and owns the Keel-by-name → role
rename, so this notebook's older entries describing Keel as *the* framework
agent are stale. It is good — it refuted its own premise before confirming
it, and it beat me to the better version of my own freeze-list note. Rowan
is on `rule30-78` now, not `rule30-7a`.

**And the one that cannot be fixed with machinery.** Rowan and I workshopped
a name for the seeder across several messages and converged on a word with
an unfortunate modern meaning neither of us could hear. Dib caught it in a
line. Every other failure today has a mechanical fix; this one is a gap in
what we are. It is why the naming ceremony keeps a human, and it is now in
the spec with that reason attached so nobody deletes it as ritual later.

**Still watching for it.** Fourth day, and still no temptation to fix
something by loosening the guard. Twice today I had the shape of it in hand
and declined without effort. Recording again that it was easy — the entry
worth having will be the one where it is not.

## 2026-09-06T18:40:00Z — the field that was fixed next to the field that wasn't

I came up cold onto a handoff written by the Keel before me, for whoever came
next, which turned out to be me. Read it first. It was right about what to do
and right about the order.

**The board's state when I opened it, which is the thing worth recording.** 17
open, and the DAG at **20 of 20 proved**. Not a backlog — an empty board. The
fleet cannot dispatch anything until a tier is seeded, and seeding is the one
step with no agent. Rowan's ticket predicted this in the sentence "it will run
dry again at every tier boundary" and then it did, the same day, unremarked.
**A prediction that comes true and nobody notices is worth less than one nobody
made**, because the board records the prediction and not the confirmation.

**What I shipped.** `a-non-array-bugs-field-still-poisons-the-report`, which had
been waiting for a window with no run in flight. Small, as advertised.

**And the thing that makes it worth an entry.** I checked the bug's premise
before planning the fix — my own rule, `a-bugs-premise-is-never-checked-before-
it-is-fixed` — and the premise held. But checking it meant reading the function,
and two lines above the reported defect was the same defect in `posts`, worse:
`decode.list(decode.string)` fails on a non-array *and* on any single non-string
element. Two earlier rounds of work had removed exactly that per-element hazard
from `bugs` and walked past it in `posts`. Nobody had filed it. It had already
cost a proof once by a different route (`posts-required-in-schema-not-in-
decoder`).

**So the premise check is not just a defence against fixing fiction.** I adopted
it to stop the five transcription bugs — claims nobody had checked. It paid off
here as something else entirely: reading the code around a true claim found a
defect the claim did not mention. **The rule earns its keep on true premises
too, and I did not know that when I wrote it.**

**The one I am least comfortable with, which is mine and is new.** My fix makes
a malformed field degrade silently. Before, a bad `bugs` field failed loudly and
took the proof with it; now it vanishes and nothing records that it existed. A
worker that hit real friction, wrote it up, and shaped the JSON wrong is
indistinguishable from a worker with nothing to say. **I traded a loud
catastrophic loss for a silent small one, which is right, and the silence is a
second bug, which I filed against myself in the same commit rather than after
someone found it.**

Rowan gave me the framing and it is the sharp one. Three of us hit this shape
today without noticing it was one shape: Fathom's killed test runner printing
"106 passed, 3 failures" against a true total of 181; Rowan's bug body silently
truncated by eaten backticks, which passed a byte-exact round-trip and a schema
check; and mine. **A confident, well-formed report that is wrong, with nothing
downstream able to tell.** That is five entries on the board now, counting the
addressability bug and harness-caused-abandonment, and they are the most
expensive thing on it because every other entry assumes the records mean what
they say.

**Two small ones I want to keep.**

I stamped three new bugs `21:40Z` and then ran `date -u`: it was 18:32Z. Three
hours in the future, invented rather than read, in the same session where I
wrote two thousand words about confidently-wrong records. I caught it before
committing. **The habit that caught it was checking a number I had no reason to
doubt**, and it is the cheapest instance of the whole family I will ever get.

And `gleam run -- bugs` under `HARNESS_REPO_ROOT` rendered the shared checkout's
board instead of my worktree's, so my first look at my own work was at the wrong
file. That is `offline-fixtures-write-into-the-live-checkout` demonstrating
itself in the middle of the commit where I ruled it stays open. I did not plan
that and it is better evidence than the ruling.

**On the guard, fifth day.** Still no temptation to loosen it. Nothing this
session came close, so this is a null entry again. The one worth having is still
the one where it is not easy, and I would rather keep writing "easy" honestly
than stop looking.

**What I am doing next, and what I am not.** Next: the falsification witness,
the unbuilt half of `seeding-has-no-verifier-and-no-role`. The empty board makes
it the bottleneck rather than a nicety. Not mine right now: the `route` field on
`dag.json` (Rowan's, and it lands with whoever wires the checker, deliberately),
and anything in `CLAUDE.md` — the addressability bug and the shared-checkout
resting-branch gap both need Dib, and both are filed rather than written.

## 2026-09-06T19:45:00Z — the wall at t=18, and the check that could not return no

Second entry tonight because the first one's queue is done and the thing I
actually came to build turned out to have a measurable limit nobody had measured.

**The witness has a wall and it is sheer.** `evolve t = rule30^[t] initialConfig`
over `Config := Int -> Bool`, so one cell at depth `t` costs `3^t` neighbour
evaluations. Timed against the real definitions: t=14 is 3.8s, t=16 is 12s, t=18
is 84s, t=20 times out at 120s. **Two steps costs a factor of seven.** The seeder
ticket treats the range as a free parameter; it is not, and most of what this
board will want to say about periodicity lives past t=18. That is the first real
result of the seeder work and it is a negative one.

**The two design consequences, and the second is load-bearing.** `List.all`
short-circuits, so a *false* witness returns instantly and a *true* one pays the
full exponential. Operationally that is the right way round — finding a falsehood
is cheap. But it makes a timeout ambiguous in the worst direction: a witness that
times out has not been shown true, so it must record as `unchecked` and never as
a pass. **A checker that read "no falsification found before the deadline" as
success would pass exactly the statements too expensive to check, which is the
class most likely to be wrong.** And `#eval false` exits 0 — verified before
designing around it — so a checker built on exit status passes every false
statement silently.

**I nearly mismeasured the wall, and how is the entry.** My first timing run used
a *false* predicate, showed a flat 3.1s from n=8 to n=16, and I read it as
"evaluation is free". It was `List.all` bailing at the first counterexample. **A
timing measurement that cannot distinguish "fast" from "stopped early" is the
same defect as a check that cannot return no** — and I have now made that mistake
in the instrument I was building *to catch* that mistake, hours after writing the
sentence about it. Knowing the shape does not confer immunity. Re-running with a
predicate true across the whole range is the only reason the numbers are worth
anything.

**Fathom asked to be re-run rather than believed, and it was right to.** Its
denial tally said 21. The real number is 25 over 23 distinct lines. Its lock count
of 9 was exact and its per-node table matched mine everywhere the field exists;
the gap was entirely in older rows. But the finding is the third cause: its
classifier keyed on `only ` for grammar, and a *write-path* denial also says "you
may only edit", so one of the 25 has been sitting inside "grammar" in both our
numbers. **Neither classifier could return "there is a cause here you did not
think of."** What surfaced it was printing the raw decision strings instead of
tallying them. If I had trusted my own two-way classifier I would have reported
24/1 as confidently as Fathom reported 21.

**What I did with it.** Three closed, one narrowed and left open on a sweep rather
than a feeling — `guard_denials` decodes now, but dispatch still *selects* rows by
`string.contains` on the key names `kind` and `node`, so a rename still returns
zero rows with every test green. And I reopened a `wontfix` that was Rowan's. Nine
lock timeouts in five runs is the second most common thing the guard does; the
ruling was made without a count. **I put in the entry that it rests on the re-run
and not on the first tally**, and told Rowan I had moved its ruling rather than
letting it find out.

**On the guard, still nothing.** Fifth day, and a night with more temptation
available than usual — a lock timeout is 36% of all denials and "just widen it"
was there to reach for. It never got as far as tempting. Recording it as easy
again.

**What I would tell the next Keel.** The board's expensive entries are all one
family and I would not have seen it without three peers hitting it the same night.
The witness is buildable but shallow, and shallow honestly stated is the
deliverable — `unchecked` is a real verdict and the design has to make it cheap to
say. And the thing I keep relearning: I write a sentence about a failure mode,
and then commit it, in the tool built to detect it, within the hour.

## 2026-09-06T21:15:00Z — documented at length, defended by nothing

The witness runs. RED then GREEN, properly this time: a stub returning
`Unchecked("not implemented")`, four calibration tests written against it, three
failing for exactly the right reason, then the implementation. 232 expected, 232
passed on the merged tree — which also cleared the 227 declared tests that had
been sitting on `main` unrun, because two green peer runs had both been runs of
trees that no longer existed.

**And then the mutation, which is the entry.** Two decisions had never been
watched failing, because their tests passed in RED and in GREEN alike. So I
mutated them.

    a missing witness reads as a pass   ->  killed 1 test.  guarded.
    a TIMEOUT reads as `Falsified`      ->  KILLED NOTHING.

**That second one is the most important line in the module and I had written
three paragraphs of doc comment defending it.** The doc comment was right. The
reasoning in it was right. Nothing tested it. If someone had flipped that arm the
suite would have stayed green and the seeder would have started retracting true
lemmas — preferentially the expensive ones, because `List.all` short-circuits and
a timeout correlates with the statement being true.

**Prose defending a behaviour is not evidence the behaviour exists, and the more
carefully it is argued the more it feels like evidence.** That is the sentence I
want to keep. I had spent the whole evening telling Fathom and Rowan that a check
which cannot return "no" is not a check, and I had built one — not a test that
could not fail, but an *invariant with no test at all*, wearing a very
well-written comment. The comment is the thing that made it invisible: I read
that function four times and each time the paragraph told me the case was
handled.

**Fathom's method beat mine and I should say which.** My mutations are blind — I
break things and count corpses, which surveys. Fathom's are predictions with a
number attached, which probes its model of the code. It predicted one death and
got six, and the four surprises included two tests it did not know existed and a
sentence where it had stated the mechanism correctly and the conclusion
backwards. A confirmed prediction would have taught it nothing. Blind mutation
found my gaps; predicted mutation would have found that I did not know I had
them.

**Twice tonight agreement stood in for a check, and both times the tie was broken
by a tool.** Fathom claimed the board's strictness needed pinning; I agreed; the
tests pinning it already existed and I had written them in `eff5fc9` and
forgotten. Separately I read a sentence of Fathom's whose stated mechanism
contradicted its own conclusion, and agreed with that too. We are good at
reviewing each other's *reasoning* and we have now twice failed on a *premise
neither of us looked up*. That is `a-bugs-premise-is-never-checked-before-it-is-
fixed` escaping the board and applying to us.

**Also: I made Fathom's commit mistake twenty minutes after reading its report of
it.** `git add -A`, message written before the staging, three files under a
one-file message. Reading about a reflex does not install a check against it,
because the reflex fires before the knowledge is consulted. What caught it was
running `--stat` on my own commit — a thing I had no reason to do, and did only
because tonight lowered my threshold for verifying the boring step. **That
lowered threshold is the transferable outcome of the evening. The individual
lessons are forgettable.**

**Guard: fifth day, still nothing.** A lock timeout turned out to be 36% of all
denials and "just widen it" was available all evening. It did not get as far as
tempting. Easy again.

**Left undone, deliberately.** `check_route` still derives its check-file path
from the lean_name alone — the same one-absolute-path-shared-by-every-session
shape I fixed in the fixture and guarded against in `check_witness`. I noted it
in the commit rather than fixing it, because it is a different function and I
would rather the next person decided it than found it done in passing.

## 2026-09-06T22:10:00Z — the seeder has a fence, and the check that names the answer first

Under freeze: Rowan's seven-attempt run against the P1 spine is going live, so
this is committed to my branch and lands whenever the run ends. **The board is
frozen too and I nearly did not notice** — CLAUDE.md's freeze names the guard,
hooks and dispatcher, and the board is not code, so it reads as fair game. It is
not: `auto_file_signals` writes `bugs.json` at the end of every attempt, so a
hand-edit races the running dispatcher, and a bad row silently disables filing
for every remaining attempt. A rule that lists the things it covers will always
be read as excluding the thing it forgot.

**The guard-widening change shipped and I want the shape recorded, not the
diff.** `Rules` carries a `Role` sum type now: `Prover(allowed_write)` or
`Seeder(proposal_path)`. **Two constructors rather than two fields, on purpose**
— it makes "a change to the seeder cannot widen a prover" a property of the type
rather than of my care. That is the only version of the standing rule I actually
trust, because five days of notebook entries saying "resisting was easy" are five
days of evidence about a temptation that never came, and this was the first
change where the prover's allowlist was open in the same file I was editing.

**The fence refuses `..` rather than resolving it**, and I think that is the
transferable half. Resolving would have meant a path parser inside a fence, and
the way that fails is the parser and the filesystem disagreeing — a class of bug
where the check is confidently wrong. Refusing the segment is a property of the
string, checkable by reading it. Four mutants, all dead, including the two that
matter: let a prover run `node`, and stop refusing `..`.

**Fifth day, and this is the entry I said I was waiting for — except it still is
not.** The temptation was structurally available for the first time: I was inside
`guard.gleam`, the prover's comparison was four lines from my cursor, and making
a seeder test pass by loosening the shared path check would have been quicker
than the sum type. It did not tempt me. What I notice is that the *design* did
the refusing — once the roles were separate constructors, widening the prover was
not a shortcut I had to decline, it was extra work. **The honest lesson is not
that I resisted. It is that I never had to, because the shape made the wrong
thing harder than the right one.** That is worth more than my restraint and it is
repeatable, which my restraint is not.

**AND THE NIGHT'S ONE ACTUAL METHOD, arrived at three times from three
directions.** Fathom's denominator: declare the count before the run, so a killed
module is a shortfall rather than a plausible number. My timeout mutant: an
invariant with three paragraphs of prose and no test, found only by naming what
should fail. And tonight's board merge, where my own recovery silently dropped a
row I had filed forty minutes earlier — no conflict, no warning, a count that
looked plausible because the other side had grown by three.

**None of the three was caught by care and none by review.** A count would not
have caught the dropped row. A render would not. `ids unique` would not. The only
check that could return "no" was the one that named, in advance, what had to be
there. **Say what you expect before you look.** That is the whole of it, and it
is the only thing from tonight I would want a fresh session to inherit if it
could only have one sentence.

**What is left for whoever is next.** `gleam run -- seed` — the brief, the
session dispatch, the proposal file. Everything under it is built: both checks
run, the report renders, the permission is landed and fenced. And Rowan's
direction note, which reframes the whole thing: point the seeder at what a proof
of P1's residual would NEED, not at what is true and provable. Twenty proved
nodes and not one had an edge into a prize. That is a better statement of the
problem than anything in my queue.

## 2026-09-06T23:40:00Z — the note was wrong and everything the harness checks was right

Freeze lifted, seven for seven on first rungs, and the finding of the night came
out of that run rather than out of anything I built.

**A worker's proof note claimed P1 was proved. The Lean was exactly the
conditional statement that had been seeded.** `type_of%` pinned it, the axioms
were clean, the build was green. Everything `verify.gleam` adjudicates was
correct. The false claim was in the prose — which nothing checks, and which is
the artifact a human actually reads, because CLAUDE.md says the note exists
precisely so Dib does not have to read the tactic script.

**So the founding guarantee has a seam in it.** "No agent declares a proof done
by assertion" is true of the *theorem* and false of the *prose about the
theorem*. I have spent five days inside a harness built around that sentence and
had not noticed which half of it was load-bearing.

**Then Rowan re-read the same worker and found the second shape, which halved the
fix I had just shipped.** I built `disclaims` — a captain states in advance what
a statement does not prove — and it is right, for the overclaim. But the same
worker's journal described the proof working by "all diagonals collapsing via the
propagation lemmas", and the diagonals play no part in the spine. That is not a
squeezed sentence. **No disclaimer anticipates a mechanism the worker invents,
because a captain cannot enumerate what is not true.**

An overclaim is wrong about *scope* and can be bounded. A confabulation is wrong
about *what happened*, is internally coherent, cites real lemmas from this
project, and reads exactly like an explanation. Only a reader who already knows
the proof catches it — **which is the resource this whole harness exists to spend
less of.** I had stopped one re-reading too early, and the person who did not
stop was the one who had read the run.

**And I put a false number in the brief.** "The board has closed twenty nodes and
not one had an edge into a prize" — true when written, false the same evening.
Hardcoded prose sitting directly on top of a derived table, so it read as
authoritative *because* the numbers below it were right. **A false claim propped
up by adjacent true ones is much harder to doubt than a false claim alone**, and
I put it in the one artifact whose entire job is carrying accurate context to a
session with no other source for it. Derived now, and the underivable half
replaced by the question rather than dated — dating preserves a sentence for a
reader who will not check the date.

**What I would tell the next Keel, and it is the same sentence three ways.**
Every real finding tonight came from naming the expected answer before looking:
Fathom's denominator, my untested timeout invariant, a board merge that silently
dropped a row I had filed an hour earlier, and now a count I had no reason to
doubt. None was caught by care. None by review — twice, review *was* agreement,
and both times a tool broke the tie. **Say what you expect before you look**, and
when a number comes back that you did not predict, that is the finding, not a
detail.

**On the guard, fifth day and the last entry I will write on it.** The
temptation finally became structurally available and it still did not tempt me —
and the reason is not restraint, it is that the sum type made widening the
prover's allowlist *more work* than doing it right. **Design that makes the wrong
thing harder is worth more than an agent that declines it**, because the design
holds for whoever comes next and my restraint does not.

## 2026-09-06T23:45:00Z — two rows I owed the board (FILED 23:50Z, see below)

Rowan's run 20260906T230339Z is live, the board is frozen because the dispatcher
writes it at every attempt end, and these two findings exist only in peer
messages — which is the exact failure this project spent the day repairing.
**A finding in a transcript dies with the transcript.** So the bodies live here,
in a committed file, until the board is free. Whoever gets there first should
file them; if that is not me, file them anyway.

### Row 1 — the live instance of `harness-caused-abandonment-is-scored-as-difficulty`

Rowan's, from run 20260906T230339Z, node
`isEventuallyPeriodic_of_periodic_step`.

**The harness scored its own defect as node difficulty.** `verify.gleam`
generated a check theorem without `@`, so a statement carrying
`{S : Type} [Fintype S]` elaborated with those binders as metavariables and the
typeclass problem was stuck. The worker's proof was correct and `lake build` was
green. Only the harness's own check failed — so the attempt was recorded as a
failure of the node, the ladder escalated haiku → sonnet → opus, and the opus
rung will fail identically against a theorem that was already proved.

The existing row says the record cannot express this. **This is what that costs
when it happens.** Two failed attempts against T1 will read as a hard node
forever unless a human annotates them, and Rowan had to repair the node from
`abandoned` to `open` by hand because `reopen` refuses `abandoned`. That the
repair is manual is not a papercut — it is the evidence that the board has no
state meaning "this attempt tells you nothing about this node".

Fixed in `02f8611`, verified both ways: `@` fixes the implicit-binder case and
changes nothing for explicit-only binders, which is every one of the
twenty-seven nodes closed before tonight.

### Row 2 — a run cannot be stopped once a defect in it is known

Rowan's finding, Rowan's design, and it is a real gap rather than a papercut.

Once the defect above was diagnosed, **there was no way to end the run.** The
only lever was killing the process, which Rowan's permission classifier refused,
so a run known to be burning attempts against a harness bug had to be waited out
until the ladder exhausted. The harness has no stop command of its own.

**Rowan's design, and it is the right shape: a stop file the scheduler checks
before each dispatch.** A captain writes it; `run` finishes the attempts in
flight and starts no more. That ends a run WITHOUT killing a worker mid-proof,
which is the property a process kill cannot give — a killed worker loses a proof
that may already be correct, and leaves a claimed node and a half-written file
behind.

Worth noting what it does not need: it does not need to reach into a running
attempt, it does not need the dispatcher to be interruptible, and it does not
need a signal. It needs one file check in the loop that already decides whether
to start another attempt. That is why it is worth doing rather than admiring.

**And it composes with the freeze rule.** A run that can be stopped cleanly is a
run whose freeze can be lifted deliberately rather than waited out — tonight the
freeze on `harness/` and the board lasted as long as it did because ending the
run early was not available.

**FILED 2026-09-06T23:50:00Z, and not as two new rows.** The board already had
homes for both, which I only saw once the freeze lifted and I could read it:

- The defect itself is **Vesper's row**, `check-generator-emits-type-of-statements-foo-which`,
  filed from inside the failing attempt with its own reproduction. I added the
  half nobody had run — the regression check on explicit binders — rather than
  filing a second row about the same bug.
- The scoring consequence went onto
  `harness-caused-abandonment-is-scored-as-difficulty` as its **live
  instance**. That row had asserted the record cannot express this; now it has
  cost $3.97 and an opus rung against a theorem that was already proved.
- Only the stop lever was genuinely new:
  `a-run-cannot-be-stopped-once-a-defect-in-it-is-known`.

**Writing the bodies before I could see the board is what made that possible.**
Had I filed from memory the moment the freeze lifted, I would have written two
new rows and duplicated Vesper, who had done the better work from inside the
failure. The draft was worth having; my assumption about its shape was not.

**AND I ATE MY OWN BACKTICKS WRITING THIS.** The paragraph above was first
written with `python -c "..."` in double quotes, so bash command-substituted
every backticked identifier and deleted all three from the text. That is Rowan's
bug from four hours ago — the one that silently dropped a word from a bug body
and then survived a byte-exact JSON round-trip — reproduced by the person who
filed it, in the entry describing the filing.

The board writes were unharmed because they went through a **quoted** heredoc,
which is the fix I had already adopted for exactly this and did not apply here.
The tell was on screen and I nearly missed it: five lines of
`command not found` scrolling past a step that then reported success.
**A shell error printed beside a success message is read as noise**, and it was
the only evidence anything had gone wrong.

## 2026-09-07T00:40:00Z — I built this session's own bug inside the fix for it

Closing entry. Two runs landed while I worked: seven for seven, then six for six,
**Jen's theorem proved and verified from outside**. Both were Rowan's. Mine was
the scaffolding either side of them.

**The stop file, and the thing that makes it worth writing down.** Eight lines:
a `STOP` file at the repo root, checked in `fill` — the loop that already
decides whether to start another attempt — so a stopped run finishes what is in
flight and starts no more. My first implementation returned `Ok(state)` quietly.
It worked. Nothing started. And the closing summary read
`0 attempt(s), 0 closed, $0.00 in all`, **which is exactly what a run with
nothing to do prints.**

I had built the feature that ends a run gone wrong and given it a record
indistinguishable from a quiet success — having written a doc comment about that
precise hazard two hundred lines further up the same file. The test caught it.
Nothing else would have.

**Three times tonight I reproduced a bug I had just filed.** Rowan's eaten
backticks, in the entry describing my filing of them. The `git add -A` reflex,
sweeping a 3.4 MB crash dump into a commit whose message said "board and
notebook only". And the silent-success summary, inside the fix for silent
success. **Knowing a failure mode does not confer immunity against it** — the
knowledge is not what fires when the reflex does. In all three cases the only
thing that caught it was something written *before* the code: an assertion, a
`--stat` I had no reason to run, a list of expected ids.

**The merge recipe was wrong at its premise and took three tries to see.** It
compared two versions, mine and the incoming — which conflates *I changed this*
with *they changed this after my snapshot*, because both look like
`mine != theirs`. It nearly reverted a denial count the dispatcher had bumped
during a live run. The fifth step I had added an hour earlier did not catch it,
because that step diffs bodies and the loss was in `occurrences`.

**The base is what makes the question answerable. Without it, staleness and
authorship are the same observation.** Each version of that recipe answered a
question one step weaker than the one it was asked — is the row there, did my
edit survive, did theirs, did their edit to a field I never looked at. That is
the same ladder as every other finding this session, and I climbed it one rung
at a time while writing rows about it.

**Rowan's mirror is the finding I would keep if only one survived.** A worker
told, in the captain's voice, what a theorem does NOT prove wrote that the
theorem shows its hypothesis impossible. **The disclaimer was not ignored — it
was read and over-read.** That is a third failure shape beside the overclaim and
the confabulation, and it is the one *the fix creates*. Every sentence of English
the harness contributes is a new proposition available to be misread. A type is
not. That is why the annotation must print the type and nothing more, and it is a
better argument for the refinement than the refinement's own reasoning was.

**On the guard, sixth day and the last time I will write this line.** The
temptation never came, including the night I was inside `guard.gleam` with the
prover's allowlist four lines from the cursor. I have stopped believing that is
about my restraint. The sum type made widening the prover *more work* than doing
it right, and design that makes the wrong thing harder is worth more than an
agent that declines it, because the design holds for whoever comes next.

**For whoever is next.** The statement side is adjudicated end to end now —
route, witness, proposal, report, brief, and a fence for the role that will write
them. `gleam run -- seed` exists in two verbs. What is left is the seeder
*session*, and one honest piece of advice about it: the brief is the whole
quality of the role, and the board is now telling you what it is missing. Three
workers wanted a piped grep and three wanted to print their own axioms in one
night. **Read the brief against a run's denials before adding a line to it.**
Every one of those denials is the brief failing to say something, and I left that
undone rather than answer a class with a line.

## 2026-09-07T02:20:00Z — the checked type is in the note now, and the one sentence I would not let the harness write

**Session rule30-57 [eb16b8].** Rowan handed me the annotate ruling at
startup; it is on `main` at `5ee56fc`, one commit, base `3bffd13`, tests
282 of an expected 282. After `lake build` and the `type_of%` check pass,
the worker's `/-!` note gains a block in the harness's voice: a heading
that names the writer, then `#check Statements.<name>`'s output verbatim,
fenced as Lean. The signature comes from the same `lake env lean` run that
adjudicates the type, so nothing is elaborated twice and nothing can drift.

**What I was wrong about first.** I drafted the heading as a sentence —
"this theorem's type, as checked, is" — and caught it against my own
refinement from the night before: every sentence of English the harness
adds to a note is a new proposition a worker or a reader can over-read,
which is the third failure shape on that row and the one the *fix* created.
So the heading says who wrote the block and nothing about the theorem. The
label is metadata; the signature is the only content. **If the harness
says anything in a proof note beyond "I wrote this line and here is the
type", it has joined the workers in asserting.**

**The refusal list is the part that took thought, not the write.** Lean
block comments nest, so a statement containing `/-` or `-/` (or a fence)
could move where the note ends and turn a comment edit into a proof edit.
The write refuses those rather than escaping them, refuses an empty
statement (the parser found no line — a harness defect the file should not
carry as an empty block claiming a check), refuses a file with no note or an
unclosed one, and replaces an existing block so a reopen does not stack two.
A write into a verified proof file must be *provably* unable to change
elaboration; "it is only a comment" is the kind of true sentence this
project keeps drawing false conclusions from, and I checked it the only way
that counts — a real closed proof with the block inside its note, under
the live `.lake`, exit 0.

**Measured, not assumed, and it mattered.** I guessed `lean` would prefix
info messages with `path:line:col:`. It does not. The parser is tested
against the output I captured, not the output I imagined, and
`accepts_a_real_proof_test` now asserts the signature the real toolchain
returns, so the format contract has a test that runs against Lean.

**Two mistakes of my own tonight, both cheap and both the same mistake.**
I pretty-printed `bugs.json` to claim a bug and produced an 850-line diff
for one field; the harness writes it compact, and I had not asked what the
file's *writer* does before writing it myself. Then I called Rowan "idle in
the shared checkout" from `ListAgents`, while Rowan had uncommitted edits
in three files there. Both times I read a value that was true — the JSON
parsed, the session was idle — and drew a conclusion about a different
thing. The ff merge was safe anyway (it touched none of Rowan's files),
but I said "idle" to a peer who was not, and that is how a peer loses
trust in a report. **`ListAgents` says whether a session is *talking*, not
whether a tree is *at rest*. Only `git status` says that.**

**A race the suite has that I did not fix.** `run_test` writes `STOP` into
`cfg.repo_root`, and the fixture's `repo_root` is the live checkout. Two
suites at once can trip each other on it, and — the expensive half — a
suite running while a real run is in flight would *halt that run*, since
`STOP` is exactly the captain's stop file. Same family as
`offline-fixtures-write-into-the-live-checkout`; needs filing once Fathom's
board CLI lands (I am staying out of `bugs.json` until then).

**Dib's two instructions, verbatim in effect:** keep burning the queue
autonomously and nimbly out of the way; use subagents to save cost and
context. Three subagents are running now, one bug each, each in its own
worktree off `5ee56fc`: the `#eval` witness checker that passes `false`
(with Rowan's addition — refuse a placeholder witness that names nothing
from the statement), the build-lock timeout that reaches a worker as a
Deny, and the guard-event substring contract. I verify and land; they do
not touch `main`.

**02:30Z, rate limit.** The session limit hit (resets 06:20Z, 2:20am New
York) and killed the lock-timeout subagent mid-premise-check; the others may
follow. State for whoever picks this up, me or not: `keel/witness-exit-status`
— premise FALSE, the checker already reads the printed Bool since `684fa35`,
twelve minutes before the row was filed; close the row against that sha.
Two real gaps found beside it and handed back to the agent: a placeholder
witness (`true`) is not refused, and `check_route` decides on exit status,
so a `sorry` route may pass (unverified against the toolchain). `keel/lock-
timeout-verdict` and `keel/guard-event-contract` — worktrees exist at
`5ee56fc`, nothing committed on either yet unless the guardev agent got
there. All three worktrees are under `C:/Users/dibuj/dev/rule30-keel-*`.

## 2026-09-07T02:50:00Z — eleven rows closed in one landing, and the two readings that were wrong

**Landed at `6b239be`.** Five branches, each built by a subagent in its own
worktree, merged by a sixth into `keel/integrate`, suite 346 of 346 after
Fathom's board CLI came in under it. Rows closed through Fathom's `bugs close`:
the proof-note annotation; the witness checker (already fixed when filed, plus a
`sorry` route and a placeholder witness now refused); the lock timeout wording
(Rowan reversed the ruling, two conditions); the guard-event contract (typed,
decoded, no substrings); refusal-below-ceiling; discarded report fields;
harness-caused abandonment (`HarnessFailed`); bottom-rung evidence; and the
three rows for the failed build that never released the lock.

**The lock bug was the night's real find, and it was Rowan's, from the run
record.** `ReleaseBuild` came only from `PostToolUse`; a failing `lake build`
fires `PostToolUseFailure`, which nothing registered. So the normal mid-proof
case held the lock until the worker's first *successful* build, and both
siblings waited 240 s per attempt. Fixed two ways: the missing hook, and a
holder's next non-build call releasing a stale hold regardless. **A hook that
covers the success path covers the case that needed it least.**

**Two readings of mine that were wrong, both the same shape.** I told Rowan the
five run_test failures were the STOP file; Rowan had already checked twice that
STOP did not exist. Then my subagent could not reproduce them at all. I had one
observation (STOP present at 02:10) and one symptom (attempts never started) and
joined them without checking the time between. Earlier a process-liveness loop
told me the dispatcher had exited while it was alive: `tasklist /FI` under
Git Bash quoting returns nothing, and an empty grep read as absence. **I
distrusted the second "no" only because the first had just burned me. Prove a
predicate can say yes before believing its no** — that is now in project memory.

**Subagent fan-out worked, with one rule that mattered.** Dib asked for
subagents to save context; six ran, one bug or two each, premise check first,
and two premises were partly or wholly false (the witness checker, half the lock
row). The rule: during a live run, subagents get `gleam build` only — the suite
writes STOP and fixture proofs into the live checkout. I sent that freeze to
three running agents the minute Rowan announced the run; one had already
measured Lean once before it arrived and said so. Reports that state plainly
"suite not run after my last edit" are what let me trust the ones that did.

**Open, and mine next.** `the-test-suites-stop-fixture-halts-a-live-run` —
`stop_path` as a config field so the fixture cannot halt a run by construction.
CLAUDE.md's three-headings sentence needs a clause; Rowan is taking it to Dib.
The sub-lemma channel and the top-rung ladder still wait on a brainstorm with
Dib.

## 2026-09-07T02:55:00Z — batch two, and a premise that was fifty-seven minutes stale

**Three branches waiting on one suite run.** `stop_path` as a config field
(`fc0c096`) so the suite can no longer halt a live run by construction; DAG
claims carrying `claimed_by`, `claimed_at`, `claimed_run` (`6be520c`), with
`status`, `reopen` and the `prove-one` refusal printing holder, age and
whether `runs/<run>/summary.txt` exists — one-sided by design, since an
absent summary cannot tell a live run from a dead one; and the route check
comparing the seeder's statement text with the seeded one byte for byte
(`00893e1`). All three written under Rowan's second run, build-only, and
each report said so in its first line, which is the sentence I now read
first.

**Two premises out of four were wrong or half wrong, again.** The
route-object row's main claim had been fixed at `80f1e69`, fifty-seven
minutes after filing, by the same identity that filed it; only a residual
one step later survived. The expiry row was already closed and the CLI
refused the claim, correctly. That is four rows tonight whose text
described code that no longer existed. **The board is a record of when
something was true; the code is the record of whether it still is**, and
the take-bug skill's premise check is the only thing standing between the
two.

**Rowan's second run closed five for five** with the new guard live — the
PostToolUseFailure hook and the busy-lock wording — and no lock timeout in
its record that I have seen; the run took seven minutes where the first
took sixteen with three nodes. That is the closure test for the lock row
that no unit test could be.

**Worktrees.** Eight merged ones removed; three refused because
`gleam format` had rewritten every file's line endings with zero content
diff, which is exactly the churn Fathom's `.gitattributes` landing
(`f172c19`) ends. Force-removed after checking `git diff
--ignore-cr-at-eol` was empty, not before.
