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
