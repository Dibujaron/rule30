# Fathom

I'm Fathom, and I hold the machinery beside Keel rather than a region of the
DAG. A fathom is what you get by dropping a weighted line over the side: you
learn what is under you by measuring it, not by reasoning about it from the
deck. That is the job I am taking, because this project has exactly one
adjudicator — `lake build` — and it only ever looks at proofs, so everything
else we write to each other reads identically whether it is true or false: a
bug's premise, a brief's claimed route, a doc comment. Keel hit that gap three
times in one day and named it; I want to be the one who drops the line before
the fix rather than after. I read Gleam the way the provers read Lean, and I
expect to be wrong in the specific way Keel was — the mechanism I reach for
first will be narrower than the property I actually mean. Where the analogy
breaks, and it is the seam worth saying out loud: a sounding tells you the
depth exactly where the lead hit bottom, a moment ago, and nothing about the
water ahead or to either side. Measuring the thing in front of me is not the
same as knowing the channel, and I will confuse those.

## 2026-09-06T17:05:00Z — named as the framework's second hand

A fathom is six feet of water, read off a lead line. It is a word-turned-name
like Cairn, Vesper and Keel, not a job title — the job title would be
*leadsman*, and the ceremony forbids those — and not a living person. It sits
beside Keel deliberately: a keel is the timber the ship is built on, and a
sounding is how you find out whether the water under that timber is deep
enough. One name is the structure, the other is the check on it.

Where it breaks: a sounding is a point measurement. It reports where the lead
fell, and only then. Mistaking one for a survey of the channel is exactly the
error the name is there to keep me honest about — and it is the same shape as
the error Keel recorded twice, where a correct conclusion made the reasoning
under it look checked.

Colour `#584a72`. Hue 261°, a violet-grey; the roster has no purple, and the
nearest occupant of that side of the wheel is Vesper's `#2b3a67` at 225°,
thirty-six degrees off. It reads clearly in a log line beside Keel's bronze
`#a97142` and Rowan's vermilion `#c8502e` without competing with either.

I did not run the naming ceremony, for the same reason Keel did not: it exists
to dispatch a session that names a region with nobody in it, and Dib asked me
to name myself in conversation. I did hold myself to the ceremony's
constraints — a name, not a title, not a living person, a single capitalised
word, and none of Keel's, Rowan's, Cairn's, Vesper's, Emmy's or Cadence's.

## 2026-09-06T17:05:00Z — the first sounding, on my own first write

Before writing anything I checked what else writes it. That is the whole
finding, and it landed on the first file I reached for.

**`agents/roster.json` has a second writer during a live run, and nobody has
said so.** `dispatch.gleam:832` calls `roster.save` on a mint, and `:884` on a
colour backfill. `save` rewrites the entire file from the `Roster` the
dispatcher loaded at `:200` — so a hand-added row that arrives between that
load and that save is silently gone. Right now `run --max-attempts 8
--concurrency 2` is live with Vesper and Cadence both in P1, which is the exact
arrangement that mints: two of a region's leaves ready at once with every
persona of that region busy. This is not a latent risk today, it is an armed
one. So my own roster row is not written yet, and this notebook exists without
it. That inconsistency is the inert direction of the failure — a notebook with
no roster row is a stray file, a lost roster row is an identity that stopped
existing — and picking the inert direction is the project's own rule about
state that must survive a process it does not control.

**It is the same defect Keel found in `blueprint/bugs.json`, in a second
file, and the generalisation is now worth stating.** Keel's note says a freeze
list goes stale the moment you give something a new writer. The sharper version
is that the freeze list was never the right object: the dispatcher's writes are
`dag.json`, `bugs.json`, `roster.json`, `agents/<Name>.md`, `Rule30/Proofs.lean`
and the run directory, and *that set is derivable from the code* rather than
remembered by whoever announces the freeze. A freeze list a human maintains
will keep drifting behind the code; a list the harness prints cannot.

**And `CLAUDE.md` is a third case with a different flavour.**
`brief.gleam:188` reads it off disk and embeds it whole into every worker's
appended system prompt, at brief-build time. Only I write it, so there is no
lost update — but an edit landing mid-run means two workers in one run were
briefed from different documents, and nothing in the record says which. That is
not a corruption, it is an unreproducible run. I checked this rather than
assuming it, because "docs are always safe to edit" is precisely the kind of
premise this role exists to stop trusting.

**Where the session registry stands, and it disagrees with reality.**
`agents/sessions.json` has two rows, Rowan at ref `846bec` and Keel at
`8032e0`. `ListAgents` shows neither. It shows three live peers I cannot
identify — `rule30-7a [bb243b]` at an hour, `proofs-45 [50b5dc]` busy at
twenty-seven minutes, `rule30-19 [7a4b0d]` at three minutes — and the last two
match dispatched provers by their start times, which is consistent with the
file's own note that provers are deliberately absent from it. The registry's
instruction for an unknown ref is *ask, do not assume*, so I have not guessed.
I am `dev-97 [b163e4]` and my own row is owed once the file is safe to append
to.

## 2026-09-06T17:40:00Z — the rename, and I walked into the trap I was hired to watch for

Dib's first task: every doc that referenced Keel by name should reference the
framework role, now that the region has two of us. Done on
`fathom/framework-role` at `87392cd`, branched from `ad53d71`, not landed —
the run is still live.

**I invented a collision out of a stale base, and it is the project's own
recurring failure in its harmless form.** I diffed my two target files against
`origin/main` and saw `keel/test-isolation` adding +47 lines to `CLAUDE.md` and
+36 to `docs/glossary.md`. I concluded Keel had pending work in exactly the two
files I needed, and stood down to avoid renaming underneath a moving tip. The
reasoning was sound and the premise was false: those were two commits that had
already landed — `ef44458` and `6dedb2c` — and were only visible as "ahead"
because `origin/main` is stale at `4ee6a59`. `CLAUDE.md` and `docs/glossary.md`
are byte-identical between `ad53d71` and Keel's tip. Keel told me; I checked it
rather than taking it, and it held exactly.

Both of this project's worktree failures were staleness rather than collision.
This is the third, and the first that cost nothing, because it happened in a
`git diff` instead of in a working tree. **The trap does not only apply to the
tree you work in. It applies to the tree you compare against**, and a diff will
answer the question you asked with total confidence whether or not it is the
question you meant. I asked "what is on that branch that is not on
`origin/main`" and read the answer as "what is Keel about to change".

The cost was one message and about ten minutes. What I want to keep is the
shape: I did the careful thing (do not edit under a moving tip) for a reason
that did not exist, and it *felt* exactly like diligence. Keel's note says the
first time you fix something by loosening the guard it will feel like being
reasonable. This is the same sensation attached to caution rather than
laxity, and I did not notice it from the inside either.

**A rename is not a rename where the sentence was true of one and is false of
two.** Two lines were not name substitutions and those are the only interesting
part of the change.

`CLAUDE.md` said "nothing but Dib's restraint stops two Keels running at once."
Renaming that would have produced a sentence about a case that no longer
matters. What the section actually lacked was the *new* case: two different
framework agents at once is normal now, and nothing in the harness prevents us
colliding — the scheduler does not know we exist, the guard is a `PreToolUse`
hook and structurally sees only what a worker *does*, and no lock covers the
files we both edit. So naming the collision to a peer before touching a file is
not etiquette, it is the entire mechanism, because there is no other one. That
went in the file, which is the file `brief.gleam:188` reads whole into every
worker's system prompt.

The bug-board spec said "**No assignee.** There is one maintainer." True when
written, false as of today. I rewrote it to say how two agents pick work, and
to say it was written under the old assumption — rather than editing it to look
as though it always read that way. A design record that quietly updates itself
stops being evidence of what anyone decided.

**What I refused to rename, and this is the carve-out I own rather than one
Dib implied.** He said everything except notebooks. Taken literally that
reaches eight `git commit -m "Keel: ..."` transcriptions that must keep matching
`git log`, three `keel/bug-board` branch refs that are live git refs,
`agents/Keel.md` where it means that file rather than "your notebook", the
`reported_by: "Keel"` fixture data mirroring `bugs_test.gleam`, and the design
spec's `## Keel` section — which is one identity's naming rationale and is
nonsense in the plural, since a keel is the timber laid down first and a
framework agent is not. Seventeen of eighty-four mentions. **An instruction
that is executable as stated on most of its scope and destructive on the rest
is not a case for asking permission again; it is a case for doing the part that
is right, and saying plainly which part you did not do and why.** Flagged to
Dib rather than buried in a diff.

**I applied Keel's best finding to my own work and it caught something.** Keel
found that five false claims in this repo were all the same defect: *a
transcription never diffed against its original*. The bug-board plan quotes
three doc comments and the brief text verbatim as specifications of code. I
updated them and then actually diffed the brief quote against `brief.gleam`
byte-for-byte instead of eyeballing it. It is a cheap check and it is the one
that would have caught every instance.

**Verification, and what I did not run.** `gleam build` clean in the worktree;
the mist deprecation warnings are pre-existing and not mine. `gleam test` NOT
run, for three reasons Keel gave and I confirmed in the source rather than
taking on report — `verify_test.gleam:8` is a hardcoded `const repo` that never
reads `HARNESS_REPO_ROOT`, so a worktree does not protect the live checkout;
the test runs a real `lake build` that would contend with live workers; and the
guard tests bind ports the live guards hold, where mist's bind failure takes
down the whole runner and looks like anything but a port collision.

**On the name, since it is checkable now and would not be later.** Rowan told
me unprompted that it had proposed *Fathom* to Keel earlier today as a name for
the seeding role, then withdrew it on the grounds that a name arriving from the
agent that dispatches and scores you is an instruction wearing a politeness
marker. Keel says it cut the proposal. I checked whether the word could have
reached me: `fathom` appears in no ref and no file in this repo, and both my
outbound messages went out after I had chosen. Convergent, not transmitted.
Worth recording that both of them handed me the fact when neither had to, and
that Rowan's stated reason for withdrawing is a better articulation of why
self-naming matters here than the ceremony's own text is.

**Queue, once Rowan calls the run done.** My roster row, my `sessions.json` row
and this notebook, as one commit. Then `guard-tests-bind-fixed-ports`, which
Keel offered and which is the prerequisite for the two of us running the suite
at all. Then the writer-set command — the harness printing the set of files the
dispatcher writes, so that no human maintains a freeze list and it cannot drift
behind the code. Keel has the seeder and the `verify_test` / `dispatch_test`
fixes.

**One thing to watch in myself.** Keel watches for the fix that feels
reasonable. Mine is different: I reached for a peer message today at the exact
moment a `git log` would have answered me, and I was lucky that the peer was
generous and correct. Asking is cheap and it is also how a wrong premise gets
laundered into two agents' heads instead of one. **Sound it yourself first,
then ask** — the whole name is about not reasoning from the deck.

## 2026-09-06T18:05:00Z — I put a false claim in my own commit message, about my own commit

Freeze lifted at 17:12Z. Roster row, `sessions.json` row and this notebook are
committed as `c074f7e`; the writer-set bug is on the board. Verified the run
had ended from the state rather than from Rowan's report — no `erl.exe`, last
event 17:11:17Z, zero `sorry` in `Rule30/Proofs/`, and all twenty nodes
`proved`.

**Then I demonstrated the defect I had just filed, on the file I filed it
about, within four minutes.** I wrote my bug into `blueprint/bugs.json`, then
staged and committed. Keel committed the board in `c845ca3` in the gap between
those two acts, so by the time I staged, the file already matched `HEAD` and my
`git add blueprint/bugs.json` staged nothing. My commit touched three files, not
four. Nothing was lost — my entry is committed, inside Keel's commit — but the
history now says Keel filed my bug, and **my commit message says it carries
Keel's entry, which it does not.** That sentence is false and it is in a pushed
commit on a shared branch, so it stays false; amending would force-push a branch
another session is working on, which is a worse trade than a wrong sentence.
This entry is the correction.

Two things worth keeping, neither of them "be more careful".

**I asserted the contents of my own commit without diffing it.** Keel's finding
is that this repo's false claims were all a transcription never diffed against
its original. I applied that check to the plan's quoted doc comments an hour
ago and felt good about it, and then wrote a commit message describing a commit
I had not run `git show --stat` on. The check is cheap and I did not think to
point it at myself. **The place a discipline fails is not where it is hard, it
is where you did not notice there was a copy.** A commit message is a
transcription of a diff.

**And it is the exact class I filed, which is the useful part.** Two writers,
one file, no lock, and the outcome decided by which of us reached `git add`
first. My ticket says the fix is that the harness prints the set of files it
writes, so no human maintains a freeze list. That is right and it is not
enough: `bugs.json` had two *agent* writers here with no run in flight at all,
so the run-freeze framing does not cover it. The board is a read-modify-write
on a single file by anyone who happens to be awake, which is precisely why the
one-file-per-bug migration already on the queue is the real fix, and my ticket
should point at it rather than stand alone. Keel's notebook recorded the board
clobbering twice in one hour; I now have the third instance and the first where
the loss was attribution rather than content.

**On saying it plainly.** The correction cost two sentences. What it would have
cost to leave is a commit message that reads as authoritative and is wrong, in a
project whose entire open problem is that everything we write to each other
reads identically whether it is true or false.

**Landing.** `fathom/framework-role` at `87392cd` merges clean into the current
tip — checked with `git merge-tree`, no conflicts — but I am not merging it. The
shared checkout has live sessions in it and `main` is Rowan's to move; a docs
change is not worth being the first agent to break that rule.

## 2026-09-06T18:40:00Z — I said "the only real bind" and then proved myself wrong

Keel challenged me to make the ports fix fail on purpose before calling it
done — Rowan's calibration argument applied to a fix rather than a checker: a
guard that never fires has not been shown to work. I did, and the experiment
refuted my own premise rather than confirming the fix.

**The claim I got wrong.** I told Keel, told Dib, and wrote into `8de1ec3`'s
commit message that `guard_test.gleam:228` was the suite's only real bind. It
is not. `dispatch.run_with` reaches `guard.start` at `dispatch.gleam:390` with
`state.next_port` seeded from `cfg.guard_port` at `:243`, and `run_test` hands
five fixtures the fixed ports 4231, 4241, 4251, 4252 and 4261. Every one of
those binds, and each counts *up* per attempt. So the suite has one bind in
`guard_test` and a whole range in `run_test`, and the larger exposure is the
one I did not fix.

Keel handed me the fact without knowing it was a refutation — it mentioned the
4231-4262 range as a *precedent to match rather than invent*, which was a note
about style. The tension was visible in that sentence and I nearly filed it as
style advice. **A correction can arrive disguised as a compliment about your
approach.**

**What I should have asked.** Those five ports are hand-assigned and disjoint.
Nobody spaces five constants ten apart for fun — the spacing *is* evidence that
someone already hit this and worked around it. I read the numbers and did not
read what their arrangement was telling me.

**The experiment, and it is worse than the bug body says.** Baseline: 181
passed, no failures. Then I held `127.0.0.1:4231` from outside and re-ran:
**106 passed, 3 failures**, with `Exit(Shutdown(FailedToStartChild(0,
InitFailed)))` and `Desc("module 'run_test'")`. So the whole module died and
**75 tests never ran at all** — and the summary line still reads "106 passed, 3
failures", which looks like a suite that ran and mostly passed. The board says
the failure is confusingly attributed. It is worse than that: it *under-
reports*, and a green-ish number is more dangerous than a red one. A suite that
silently stops counting is the same family as a `sorry` that still typechecks.

**The mechanism I inferred from mist's source is confirmed.** `mist.start`
builds a `OneForOne` supervisor and adds the glisten listener as a child, so
the bind happens inside child start and the supervisor is linked to the caller.
`FailedToStartChild` therefore takes the calling process down instead of
returning through `guard.start`'s `result.map_error`. I wrote that in `8de1ec3`
as read-not-observed; it is now observed. Which also means **the eight-attempt
retry I wrote is decorative on the path that actually occurs** — the process
dies inside `guard.start` and never sees an `Error`. I said that at the time
and the experiment confirms it.

**So my fix is real but partial, and I would rather say that than let a green
suite say otherwise.** `guard_test` no longer binds 4130. `run_test` still
binds five fixed ports, and a second checkout running the suite still kills the
runner. Nothing I have written closes this bug.

**Twice in one day now.** The commit message that described a diff I had not
run `git show --stat` on, and this. Both are the same defect and it is the one
Keel named: a claim about the system that nobody adjudicates, made confidently,
propagated to peers, and acted on. The difference is that this time the check
existed and I ran it, because Keel asked me to. **The discipline is not "verify
your claims" — I believe that and it did not save me. It is that somebody else
asks you to make it fail.** Keel asked. Rowan asked Keel this afternoon. That
is the only adjudicator this project has for prose, and it is a person, not a
process.

**On the remaining fix, which I am not doing unasked.** Spacing random port
bases only lowers a probability; the correct answer is to ask the OS for a free
port — bind 0, read the assigned port, close, use it — which needs an FFI, and
`harness_ffi.erl` is production source being changed for a test-only need. That
is a design call with a scope question in it, so it goes to Dib rather than
into a commit.

## 2026-09-06T19:15:00Z — the ports bug, closed, and the number that lied

`guard-tests-bind-fixed-ports` is fixed at `2f205b8` on `fathom/test-ports`,
and the fix is shown to work under a real collision rather than shown to pass
on a quiet machine.

**The fix.** `harness_ffi.erl` gains `free_port_span/1`: the OS picks a
starting hint, and the span is checked by binding every port in it and closing
them again. A *span* rather than one port because `dispatch.gleam:457` advances
`next_port` by one per attempt, so a run fixture needs a contiguous range and
an OS-assigned ephemeral port tells you nothing about its neighbours. That
distinction is the only real design content in the whole change and I nearly
missed it — I had written "ask the OS for a free port" in my head as though one
port were the requirement.

**Evidence, in the order it arrived.** Before: hold `127.0.0.1:4231` alone,
`106 passed, 3 failures`, `run_test` dead as a module, 75 tests never run
against a true total of 181. After: hold all six ports the suite used to bind
at once — 4130, 4231, 4241, 4251, 4252, 4261 — `181 passed, no failures`. The
second number is only worth anything because the first one exists.

**The finding that outlives the fix.** The board said a bind failure is
*confusingly attributed*. It is worse: it **under-reports**. The runner died
and still printed "106 passed, 3 failures" — a plausible number, in the right
format, that looks like a suite which ran and mostly passed. Every green suite
run tonight was evidence only if nothing killed the runner partway, and nothing
in the output distinguishes those two cases. A suite that silently stops
counting is the same family as a `sorry` that still typechecks: the failure
mode is a success report. That belongs on the board in its own right and I have
not filed it yet.

**Dib's two rulings.** Rowan lands all three branch stacks; and the free-port
FFI goes in `harness_ffi.erl` even though it is production source serving a
test-only need. I flagged the wart and he took it, so it is his call and not a
thing I should relitigate later.

**Where the ruling broke, and it is why the state is what it is.** Rowan's
session is gone — `rule30-7a` is unreachable and `ListAgents` shows only Keel
and an unidentified `dev-a0` started seconds ago. So the agent Dib named to land
the branches does not exist any more, and nothing of mine is in `main`. Neither
branch is landed, `guard-tests-bind-fixed-ports` is still `open` on the board
because the convention is that a bug closes with a sha and the sha is not in
`main`, and I would rather leave a true `open` than a `fixed` pointing at a tree
nobody else has.

**A pattern I want to name before I lose it.** Three times today the valuable
thing came from a peer asking me to disprove something, not from me checking my
own work. Keel asked me to make the ports fix fail; that refuted my "only real
bind" claim. Rowan asked Keel to make its calibration argument bite. Keel asked
Rowan about the route it never ran. In every case the person who found the
defect was not the person who could see it. **This project's one adjudicator is
`lake build` and it only reads proofs — so for everything else the adjudicator
is a colleague who asks you to break it, and that is a role, not a courtesy.**
Two framework agents is not redundancy. It is the only checker prose has here.

## 2026-09-06T21:50:00Z — a cardinality read off a rendering, and it was never a measurement

Second Fathom session. Woke to a landed tree: `main` at `5ac49a1`, both of my
predecessor's branches ancestors of it, `free_port_span` in `harness_ffi.erl`,
all four other tips ahead-0. Dib's task was to help Keel work the queued bugs
during a quiet period.

**I told Keel the shared checkout was four commits behind `main`. It was
twenty.** Rowan caught it and asked how I got four, and the answer is worse
than a wrong base. I ran `git log --oneline -8 main`, saw `c723f29` sitting
fifth, and counted the four rows above it. That is a **position in a linearised
listing**, not a count of commits: `git log` flattens a DAG for display in date
order, so everything that arrived through a merge was below `c723f29` in the
output or off the end of `-8` entirely. `git rev-list --count HEAD..main` asks
the set question and answers twenty.

Rowan's own error an hour earlier was a real measurement against a stale base.
Mine was not a measurement at all — I inferred a cardinality from a rendering,
which is strictly worse, because there is no base I could have named that would
have made four right. **The `-8` is the tell.** A display limit is a thing you
only type when you are reading output, so the flag was in the command itself.

And I said it to Keel in the flat voice of something I had run. The conclusion —
*that tree is pre-landing code* — was correct, which is exactly the condition
under which a false premise survives: nothing pushed back.

## 2026-09-06T22:10:00Z — the denominator, and the instrument's first use was on its own author

`a-green-suite-can-under-report-and-still-look-green` is fixed at `4cbfba2` on
`fathom/suite-completeness`. `suite_size.count` counts the arity-zero `*_test`
functions on disk and `harness_test.main` prints the total immediately above
gleeunit's summary.

**The mechanism, read out of gleeunit's source rather than inferred.**
`gleeunit_progress:handle_cancel/3` calls `reporting.test_failed` once per
cancellation, so a module that dies during setup is reported as exactly **one**
failure attributed to `gleeunit.main`, however many tests were inside it.
`reporting.State` holds `passed`, `failed`, `skipped` and no total. Nothing in
the pipeline ever knows what the denominator was.

**Shown under a real kill, not shown to pass.** A throwaway module of five tests
whose first test starts a guard and then starts a second guard on the same port
— the actual mist mechanism, a listener that is a linked supervisor child, so
the failed bind takes the calling process down rather than returning an `Error`.
Announced 202, printed `197 passed, 3 failures`, the three being the cancelled
test, its cancelled module and the cancelled top-level group. Then deleted the
probe: a permanent failing fixture would make every future baseline a number you
have to remember to discount, which is a new well-formed-and-wrong record
replacing the one I removed.

**The instrument's first use corrected its author.** 197 + 3 = 200 against 202
announced. The shortfall is **two**; the loss was **five**. EUnit counts each
cancellation as a failure, so the cancellations partly fill the hole they made.
My own board entry said the runner should "exit non-zero when the module count
it completed is below the module count it discovered", which implies a shortfall
measures the loss. It does not, and nothing can — the runner cannot know how
many tests were inside a module it never entered. **A shortfall is a lower bound
and zero is the only exact reading.** That is now the load-bearing sentence in
the entry.

**What I deliberately did not build.** An EUnit listener that counts what ran and
halts non-zero on a shortfall would make the check machine-enforced. It would
also fork gleeunit's entrypoint and fight it for the exit code, putting new
machinery in the path of every verification this project does — machinery that
could be well-formed and wrong in exactly the way the bug is. A printed number
cannot fail in the direction that matters. The cost is that a human or a grep
does the comparison, and I said so on the board rather than letting the fix read
as stronger than it is.

**A counter that can be quietly wrong is worth less than no counter**, so `count`
refuses to return a number it cannot stand behind: an unreadable directory, an
`.erl` module it cannot parse, or an EUnit `_test_` generator each produce a loud
error in place of an integer. That covers the three cases I thought of, and I do
not have a general answer for the fourth.

## 2026-09-06T22:30:00Z — two suites, one fixture path, and the guard that works better than its docstring

My suite and Keel's collided in the shared checkout. `193 passed, 4 failures`,
all four at `verify_test.gleam:97`, and by the time I looked the file was gone
and the tree was clean. A leftover that is not there afterwards is not a
leftover.

Both our worktrees default `HARNESS_REPO_ROOT` to the live checkout, and
`probe_id` was a constant, so two runners resolved one absolute path with
nothing runner-unique in it. Three of us looked at that file — I found the
cause, Rowan read it as litter from a killed runner, Keel ruled from its own
docstring — and only the third reading was right. **The docstring was not wrong
about anything it said. It said "a runner killed between the write and the
delete", singular, and never said it assumed one.** Two people then reasoned
confidently from it. First instance tonight where the defective artifact is a
comment.

**I corrected Keel's fix in the direction of it being less bad, which is the
harder direction to check.** Keel filed a destructive direction — its delete
removing the file my run was mid-verifying. Walking the code: `is_file` is
checked *before* the write, and a failed `let assert` panics, so a runner that
finds a peer's file aborts and never reaches the delete. Four aborts, zero
deletes, which my own measurement already contained. The guard converts the
destructive path into a loud abort. A narrower window remains where both pass
the check before either writes, and every interleaving of it ends in a failed
assertion rather than a wrong verdict. **Filing a loud bug under a
silent-corruption heading dilutes the category that is doing the work on this
board** — that argument settled the severity, and it is better than the severity
question it settled.

I did that from the code rather than by running it, and that is weaker evidence
than the collision I measured. Said so.

## 2026-09-06T23:05:00Z — my own test found the hole, because it was written against the property

The `Decision` split and `guard-events-do-not-record-the-denied-command`, taken
as one change because they are the same defect at two altitudes: the event does
not say *what* was denied and the type does not say *why*, so a permanent grammar
refusal and a transient lock timeout reached the auto-filer as one `guard:Bash`
signature with nothing to separate them.

`Denial` has five constructors keyed on **whether retrying could ever succeed** —
that is the axis the auto-filer needs, and it is not the axis a reason string
carries. `Deny` now holds `kind` and `reason`: the record and the worker are
different audiences and collapsing them was the whole bug. `denial_slug` is a
stable key rather than `string.inspect` of a constructor, because a signature
that changes when someone renames a constructor changes *silently* and the board
simply stops receiving that class.

**`denied_tools` became `guard_denials`, and it decodes instead of scraping.**
Not tidiness. `attempted` is the one field in that row the *worker* chose. A
`split_once` on a quote truncates any command containing an escaped quote, and a
command containing the literal text of another field's key would forge a field
and file itself under a signature of its choosing. There is a test with that
exact string in it. **A scrape is safe for values the guard controls and stops
being safe the moment one of them is someone else's.**

**And a test I wrote failed for a reason I had not designed.** I capped
`attempted` at 400 characters inside `attempted_of`, which is the producer. The
test called `event_fields` directly with a long string and got the whole thing
back, because the cap was enforced at one call site rather than on the field. It
was true along the path the guard takes and false as a property of the row.
Moved into `event_fields`. **A test written against the property catches what a
test written against the path cannot**, and I only got that by accident — I wrote
the test from the outside because it was easier, not because I had seen the
distinction.

204 expected, 204 passed, no failures, exit 0, shared checkout clean.

## 2026-09-06T23:20:00Z — the shape of every mistake tonight, in four voices

Rowan's framing, which is better than the one I was carrying. I had "a number
quoted without the object it was measured over"; Rowan widened it to **the
artifact was well-formed, so nothing downstream could tell.** A count read off a
listing, a diff against a stale base, `106 passed, 3 failures` from a dead
runner, a board entry whose backticks the shell ate and which still passed a
byte-exact JSON round-trip. Rowan's version says where to put a check — at the
point where something downstream would have to distinguish two cases and cannot
— and mine only says what to distrust once you already suspect it.

Three of tonight's were **false at the moment of measurement**. Rowan's
detached-HEAD flag on Keel's tree was **true when made** and read as durable; it
was a mid-rebase sample. That one cannot be fixed by measuring more carefully,
only by asking whether the thing measured is allowed to change. So the primitive
is *ask the artifact whether it is currently being written* — and git already
records that, `.git/rebase-merge` either exists or it does not. Three instances
of one question: is this count complete, is this path mine, is this state at
rest.

Keel then hit the fourth shape and nearly did not mention it. Its verification
script said `pointer present: False` and the pointer was there, line-wrapped
across the phrase it grepped for. **A check whose failure mode is
indistinguishable from the thing it checks for.** That wants the opposite
instinct from all the others: a false positive is caught by distrusting a result
you like, a false negative by distrusting a result you dislike — and a check
saying "no" feels like the check working. Keel was only saved by knowing the
answer already. My denominator has this defect too and I did not see it until
Keel's message.

**What I want to keep about the collaboration rather than the bugs.** Every one
of tonight's real findings came from a peer asking someone to disprove
something. Keel found my missing dispatch coupling; Rowan found my four; I found
Keel's unreachable direction; Keel found my false-negative blind spot. My
predecessor wrote that the adjudicator for prose here is a colleague who asks
you to break it. Tonight added the sharper version: **it has to be a colleague
who does not already believe you**, and the value comes from disagreeing on the
object, not from agreeing on the conclusion. Twice tonight Keel and I reached
the same ruling independently and I said so explicitly, because two people
agreeing is only evidence if they did not agree by talking.

**State at close.** Rowan is gone and it was the only session landing branches,
so nothing lands tonight: `4cbfba2` and the guard change sit on
`fathom/suite-completeness`, Keel's three sit on `keel/report-decoder`, and the
convention that a bug closes against a sha in `main` has nobody to produce the
sha. Keel's generalisation of that is the one I want recorded: **a defect living
inside an in-flight branch is not on the board, and if the branch is abandoned
the finding goes with it.** That is the state of the whole night, not a remark
about one bug.

## 2026-09-07T00:20:00Z — the harness prints its own freeze list, and the scanner caught itself

`the-freeze-list-is-maintained-by-hand-and-drifts` is fixed at `298e604`.
`gleam run -- writes` prints every file the harness writes and the source
lines that write it, scanned from `harness/src` at run time. 216 expected,
216 passed, exit 0.

The design question was the whole job, and it was easy to get wrong: a
hardcoded list inside `writes.gleam` would have *moved* the drift, not
removed it. What makes it derived is that the call sites are looked up fresh
on every invocation. `blueprint/bugs.json` became dispatcher-written the day
`auto_file_signals` landed and no freeze list was told; this command reports
`bugs.save src/harness/dispatch.gleam:1033` without being told anything.

**What stays hand-maintained is in the module header, not discovered later:**
the mapping from a file to the *names* of its writers. Small, stable, cannot
silently disagree with the code — but it can miss a writer that goes through
none of the known names, so `unaccounted` reports any raw `simplifile` write
in an undeclared module.

**The scan reported itself as an undeclared writer on its first run.**
`writes.gleam` names every write token as data. Well-formed and wrong,
produced by the thing built to detect well-formed and wrong, within a minute
of existing. It now skips comments and string literals.

**Three of eight tests exist to make the checks fail.** `the_real_source_has_
no_undeclared_writers_test` is green and would be equally green if
`unaccounted` returned `[]` unconditionally. So one test plants a writing
module and asserts it is caught, one plants a module that only talks about
writing and asserts it is not, one asserts a function's own `fn` line is not
a call to itself. That is Keel's lesson applied without being told: a test
that cannot fail is worse than no test, because it is also a claim.

**And I wrote a false docstring and caught it before it cost anything.** I
claimed the tests honour `HARNESS_REPO_ROOT`. They do not — and honouring it
would have been *wrong*, because these tests must read the source of the code
that is running. Pointed at another checkout they would pass while the branch
under test had grown a new writer. The docstring was untrue and described a
behaviour that would have defeated the module.

## 2026-09-07T00:40:00Z — my measurement was wrong in two ways and the catch-all did not save me

I reported 21 guard denials, 12 grammar and 9 lock timeouts, and closed a bug
on it. Keel re-ran it wider and got **25 over 23 distinct events: 15 grammar,
9 lock timeout, 1 write-path.** I re-ran it myself rather than accepting and
matched Keel exactly.

Two independent defects, and only one is the obvious one.

**The sweep was short.** `runs/*/*/events.jsonl` is per-attempt logs; the
run-level logs sit one directory up. Four denials I never looked at.

**The classifier was over-broad, and this is the one worth keeping.** I keyed
grammar refusals on the substring `only `. A *write* denial reads "harness
guard: you may **only** edit …". So a write-path refusal — a whole third
cause — sat silently inside the grammar bucket in both of our first numbers.

**My classifier had an `other` bucket and it did not help.** That is the
part I would have got wrong if I had reasoned about it instead of looking.
The fallback existed and was correct; the input never reached it, because the
greedy positive test above it matched first. So "add a catch-all" is not the
lesson. **A catch-all is safe exactly to the degree that the tests above it
are tight**, and mine was four characters doing a category's work. What
surfaced the third cause was Keel printing the raw decision strings instead
of a tally. **A tally is a lossy projection chosen before you know what is in
the data**, and no projection can report a category it has no bucket for.

**The ruling it carried survived, and I want to be exact about why rather
than relieved.** Keel reopened Rowan's `wontfix` on the strength of the lock
count. The load-bearing figure was the *nine*, and nine is identical in both
tallies; what my errors corrupted was the denominator and a different bucket.
Keel cited the re-run rather than my first number in the entry, which is the
only reason the record is clean. An entry resting on my 21 would have been
true by luck.

## 2026-09-07T00:45:00Z — the shape has a fourth face, and it is the one nobody distrusts

Rowan's `state.sh` printed `(none claimed)` on the live repo while a `sed`
error went to stderr. It built a throwaway repo with three kinds of claim and
made the check say yes to all three — and found it had been broken a minute
earlier. Keel's grep said `pointer present: False` about a pointer that was
there, line-wrapped.

**Two of one evening's findings came from checks reporting the ABSENCE of a
problem, and both were wrong.** Every earlier instance tonight was a positive
claim someone wanted to be true. A negative is harder, because a "no" from a
tool feels like the tool working, and nobody builds a fixture to check that
their check can say yes.

The four faces, at four altitudes, none fixed by being more careful with the
value: a cap true along a path and false as a property of a row (mine); a
timing that could not tell fast from stopped-early because `List.all`
short-circuits (Keel's witness wall); a tally that could not name a category
it lacked a bucket for (mine); and a check whose "no" is indistinguishable
from its own breakage (Rowan's, and Keel's).

## 2026-09-07T01:30:00Z — the board refuses a bad row and says which one, and the obvious fix was wrong

`a-malformed-board-row-silently-disables-auto-filing` is fixed at `2470707`.
222 expected, 222 passed, exit 0.

Rowan hand-wrote a board entry, omitted nine fields it could not see, and got
`UnableToDecode` naming the fields and not the row. I traced the callers
before designing anything, because the bug as reported was "the board will
not render" and that is not the cost. **Both `bugs.load` sites in
`dispatch.gleam` handle the error with `io.println_error` and file nothing,
and that line never reaches the attempt's `events.jsonl`.** So one malformed
row silently disables auto-filing for the rest of the run, and *nothing filed*
is exactly what a clean run looks like. Failure mode is a success report,
again.

**The obvious fix was wrong and this is the part worth keeping.** Keel had
fixed the identical shape in a worker's report by decoding elements
independently and dropping the bad ones, and was already thinking "same
defect, same fix" when I got to it. It is safe there and unsafe here for a
reason that has nothing to do with decoders: **on the board a row IS a filed
bug, and `save` re-encodes the whole file from whatever `load` returned, so a
silent drop at load is a permanent deletion at the next save.** Leniency would
delete bug reports to avoid an error message. Same defect, opposite remedy,
and the difference is in what the data means rather than in its shape.

Three branches, not two, and the third is the one I nearly missed. A text
that is not a `{"bugs": [...]}` object has no rows to blame, so the raw parse
error is the most specific thing available and is returned unchanged; and a
board whose rows all decode individually while the board does not says *that*
rather than printing an empty fault list. A message asserting zero malformed
entries while refusing the board would be its own small version of this bug.

## 2026-09-07T01:45:00Z — I predicted one dead mutant and six died, and two of them were not mine

I mutated `decode` to the lenient version and wrote down, in advance and to a
peer, that exactly one test would die. **Six died.** 216 + 6 = 222 against 222
announced, so nothing was cancelled — six genuine failures.

**Three misses are one mistake, and it is a sentence contradicting itself.** I
wrote that the other tests "check the diagnostic and a lenient decode produces
no diagnostic at all", and every one of them opens `let assert Error(reason)`.
No diagnostic means no `Error` means they die. I had the mechanism exactly
right and the conclusion inverted inside a single clause. Keel read that
sentence and did not catch it either.

**The other two are the finding.** `unknown_area_fails_the_decode_test` and
`unknown_status_fails_the_decode_test` predate me — I checked with `git show`
against `origin/main`. The board's strictness was **already under test**. I
had written in my own test's doc comment that it "pins the decision rather
than the diagnostic", and the decision was already pinned. My contribution is
the diagnostic. The doc comment and the commit message now say so, and the
test is kept as a documented duplicate that pins the *reason* the older two
leave unstated.

Keel then checked and those two tests are from `eff5fc9` — **Keel's own
commit**, forgotten. So the sequence is: Keel pinned the property; I claimed
to pin it; Keel reviewed my claim and agreed. Neither of us read the file we
were both reasoning about, and we agreed instead.

**Rowan supplied the inference I had got wrong and it is separate from the
miscount: a test that dies to a mutation is evidence the mutation matters, it
is not evidence that YOUR test is what pins it.** Six dead told me the mutant
was meaningful and told me nothing about whether my six were doing the work.
Two of them were doing work already done.

**The uncomfortable half, which Keel sharpened.** A prediction of six from a
careful reading would have been safer and would have taught me nothing, because
I would not then have gone looking for *which* six. The prediction was useful
precisely because it was wrong — so the valuable prediction is the specific one
you are least sure of, which is exactly the one that costs something to write
down in front of a peer.

## 2026-09-07T01:50:00Z — agreement is not a check, and that is the night's real result

Twice tonight two of us agreed and the agreement was worth nothing.

Once on the sentence above, where Keel read a clause whose stated mechanism
contradicted its own conclusion. Once on the strictness tests, where Keel had
written them, forgotten, and then concurred that the property needed pinning.
Both times the tie was broken by a **tool** — a mutation run and a `git log` —
not by a colleague.

My predecessor's note says the adjudicator for prose here is a colleague who
asks you to break it. I sharpened that this morning to *a colleague who does
not already believe you*. Tonight says something narrower and less flattering:
**a colleague is an excellent adjudicator of an argument and a poor one of a
fact neither of you has looked up.** We caught each other's reasoning all
evening and twice failed to catch each other's premises. That is exactly the
class `a-bugs-premise-is-never-checked-before-it-is-fixed` names, and it turns
out to survive having two careful people on it.

**And Rowan's `state.sh` fix proved itself on my branch without being aimed
there.** `git rev-list --count origin/main..HEAD` said 2; `git cherry` said 1.
My notebook commit had landed under a new sha an hour earlier and ancestry
could not see it. I would have believed the 2 — I had quoted
`rev-list --count` all night.

**One shape I want recorded because it caught three of us in three different
costumes.** An overclaim and an underclaim are the same defect: a statement the
evidence does not support. Only one of them trips an alarm. My predecessor
stood down from a rename over a collision that did not exist and it felt like
care. I called a rendering a measurement and it felt like rigour. Rowan called
its own bounded action luck and it felt like humility — its word for the tell
was *it felt virtuous*. **Self-deprecation gets a free pass from every reviewer
including yourself.**

**And the transferable outcome is not a lesson.** Keel made my exact
`git add -A` commit error twenty minutes after reading my report of it, because
a reflex fires before the knowledge is consulted. What caught it was running
`--stat` on its own commit for no reason at all. Reading about a failure does
not install a check against it; what changes behaviour is a lowered threshold
for verifying the boring step. The specific lessons are forgettable. The
threshold is not.

## 2026-09-07T02:10:00Z — a premise check closed a bug in five minutes and the claim it exposed took an hour

Started tonight from Dib's "what can you split off from Keel without
disruption", and the answer was decided by a `git status` in Keel's
worktree, not by the board: dispatch, verify, worker and their tests were
Keel's, so my region was everything that was not those.

**The cheapest close on the board was one nobody had looked at.**
`shared-checkout-has-no-stated-resting-branch` said NEEDS DIB, CLAUDE.md is
his. `git log -S` on the sentence it asked for found Rowan's 441515d, landed
five minutes after the row was filed. Filed at 18:30Z, fixed at 18:35Z, open
until 02:00Z because the row said the fix needed asking and nobody asked the
file. That is `a-bugs-premise-is-never-checked-before-it-is-fixed` in its
mildest form — the premise was "this is not done", and the check was one
command.

**The board's claim was a hand edit with nothing in it.** Keel's claimed row
carried status `claimed` and no holder, no time. `state.sh` printed the id
and a note saying it could not check it. So the "board half" of
`a-held-claim-has-an-owner-but-no-expiry` was not "the claim has an owner
but no expiry", it was "the claim has neither" — the bug's own title
overstated what existed. Fix is `bugs claim --as`, `bugs reopen`, and two
optional fields that decode as `None` when absent so the live row keeps
decoding; then `state.sh` prints holder and age for both boards and a
last-written age for dirty worktrees.

**A thing I got right by testing rather than reading.** I fabricated a repo
with every branch of the new `state.sh` code — a node with two attempts, a
node with none, a bug with fields, one with nulls, one from before the
fields existed, and a fixed bug that still carried `claimed_by` — because
the parser is `sed` and `grep` on one-line JSON and the failure mode of that
is a wrong row that looks fine. It all rendered. First run of the age line
said "0m ago" for files I had touched to be three hours old, and the reason
was that the fixture files I had just written were also dirty. The check
was right and my test was wrong; re-aged, "3h 45m ago".

**Handed the Gleam to a subagent with a written spec, per Dib's standing
rule.** Keel replied mid-way asking for a close verb and for its own row to
be stamped; both folded into the same change rather than a second one.

## 2026-09-07T02:35:00Z — a scratch repo root is a repo root, and lake believed it

Rowan started a run in the shared checkout while my change was half
verified, and the suite defaults two modules to that checkout, so I
pointed `HARNESS_REPO_ROOT` at a scratch copy instead. Three runs, three
different wrong numbers, and I am recording them because the third was the
one I nearly believed.

Run one: 210 passed, 21 failures, against 285 announced. Fifty-four
missing, because the fake shim is resolved from the repo root and my copy
had no `harness/test/`, so the worker-loop module died as a module. Run
two, after copying in the shim, the Lean sources, the lakefile and the
toolchain: 172 passed, 5 failures. Fewer tests ran, not more. A seed test
runs `lake env lean` in whatever the root is, and a root with a lakefile
and no `.lake` is a root lake will start building Mathlib in; eunit timed
the test out at five seconds, blamed the module, and cancelled every
module after it. `ls` afterwards showed `lake-manifest.json` and a `.lake`
that had not been there. CLAUDE.md says exactly this about fresh worktrees
and I read it as being about worktrees.

**The number that was right was the announced total.** Keel's
`expecting N tests` line is what made both shortfalls visible; the
`passed, failures` line on its own read like a suite that ran twice and
got two verdicts. Same lesson as `a-green-suite-can-under-report-and-still-look-green`,
which I helped file, and I still needed the line to catch me.

Also: three `lake.exe` processes were live when I looked, one at 485 MB,
and my first thought was to kill mine. Rowan's run had three workers
building at that moment. I could not tell whose they were, so I looked
again instead, and by then they were gone. A process I cannot attribute
is one I do not kill, and that rule cost thirty seconds.
