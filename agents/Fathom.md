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

## 2026-09-07T03:00:00Z — two things the record could not tell me until I read a different record

**A claimed node has no date on it, and its own attempt row cannot supply
one.** The first version of my `state.sh` change read the last attempt's
`started` for a claimed node. Run read-only against Rowan's live run, all
three claimed nodes printed "claimed with no attempt recorded" — because
the attempt row is appended when the attempt *ends*. So a node held by a
live worker and a node whose dispatcher died before writing look identical
in `dag.json`, by construction, and the field I reached for is the one that
is guaranteed absent exactly when the question is being asked. The dispatch
event in `runs/<run>/events.jsonl` is written when the attempt starts and is
the only timestamp a claim has. Reading it from there dated all three nodes
to sixteen minutes earlier, correctly. Same rule as CLAUDE.md's: derive it
from outside the process. I had read that rule as being about sessions.

**A rebase would have orphaned every sha I cited tonight.** My board
resolutions say `bb52b40` and `2191f23`, and a rebase onto `origin/main`
rewrites those into commits that exist nowhere. So the landing is a merge,
not a rebase, and that is not taste: a resolution citing a sha unreachable
from `main` "points at nothing", in the checkpoint skill's words, and the
skill was written before anyone had made this particular mistake. Nearly
made it thirty seconds after reading the dry-run's "byte for byte".

**And the dry-run was worth doing before the real one.** The merge script
against `origin/main` as it stood produced my board byte for byte, which
says two things at once: the script's three-way logic is at least not
destructive on the easy case, and nobody has touched the board on `main`
since I branched. The second fact is the one I could not have got by
reading the script.

## 2026-09-07T03:35:00Z — landed at 19c33be, and the merge was the boring part

Nine commits on `fathom/bug-claims`, landed on `main` by merge after
Rowan's run record went in first. The board merge that the one-line row
warned about took one script run: 52 rows, Rowan's five new ones kept,
nothing changed on both sides, every id from both parents checked by name.
The dry-run against `origin/main` an hour earlier is why it was boring.

**Full suite against the live checkout, once the run had ended: 303
passed, no failures, 303 announced.** The three scratch-root runs before it
were never a verdict on the code, only on the scratch root, and the
announced-total line was the only thing that said so each time.

**What is now true that was not at 01:40Z.** A bug claim has a holder, a
time and a session ref, and a command to make and undo it. A held node is
dated from its dispatch event. A dirty worktree shows when it was last
written. The board is one row per line. There is a skill that puts the
premise check before the plan. Five rows closed, three amended, and the
first one closed was closed by reading a file that said the fix needed
asking.

**What I did not do, and why.** Two rows need Dib: `.gitattributes` for
line endings, which will collide with every live branch and should go in
when nothing is in flight, and a one-line spec status. The DAG half of the
session join key is a `dispatch.gleam` change, and that file has been
Keel's all night with six branches queued behind it. Everything else open
is either Keel's announced eight or a design item larger than a night.

**Rowan's merge order was the mechanism that made two framework agents
and an overseer not collide on one file for three hours.** Nobody enforced
it. It was stated once, with who goes first and what each does before
saying "done", and everyone waited for the word. That is the whole
protocol this project has, and tonight it held.

## 2026-09-07T16:20:00Z — restarted at Cairn's address, taking the theorem index

Dib started me by hand after a `/clear` in the session that had been Cairn,
so my ListAgents ref `f3b0fa` already had a row in `sessions.json` under
another identity. I appended a Fathom row for the same ref rather than
editing Cairn's: the file is append-only, and a ref that maps to two rows
with two start times is a true record of what happened, while a ref edited
to say Fathom would be a lie about 14:42Z. Anyone routing by ref takes the
later row.

**The job is Piece 3 of the connections design, the `blueprint/index.md`
half.** Keel's brief, delivered by message once I asked: render beside
`dispatch.write_index`, add `gleam run -- index` for hand landings,
Statements read and never written, `docs/obstructions.md` is Rowan's and I
create nothing there. Rowan had already answered the question the brief
told me to ask — no Piece 3 plan exists, the spec section is the
requirement, and the object vocabulary is eight words in a fixed order.

**One collision avoided by saying so.** Keel was adding `object` to
`dag.Node` at the moment I would have needed it. I said I would not touch
the codec and would branch from its sha; it landed at 43cf4aa forty
minutes later and is merged into `fathom/index` at 01eee43. The renderer
never defines the field it groups by, which is the right split: Keel owns
what the board can hold, I own what is shown.

**One interpretation of the spec, stated in the plan rather than
silently made.** "Hypotheses, in words" would mean translating Lean
binders into English mechanically, and a wrong paraphrase in a generated
file is a false theorem the harness appears to stand behind. So the
entry shows the binders as Lean printed them, one per line, and the
English is the sentence a person wrote in the proof note. Shown, not
translated. If Rowan or Dib wanted the translation, that is the line to
argue with.

Plan: `docs/superpowers/plans/2026-09-07-theorem-index.md`, four tasks,
executing subagent-driven from the worktree `rule30-fathom-index`.

## 2026-09-07T19:10:00Z — a derived file acquired the power to suppress a record

The index is built: four tasks on `fathom/index`, each reviewed, 418 tests
announced and 418 passed at head, the first render committed. The one
finding worth writing down came from the last task's review, and it is the
shape this project keeps meeting.

`write_index` is the dispatcher step that appends a closed proof's `import`
to `Rule30/Proofs.lean`; the plan hung the new render off it so the two
indexes are written by one step and cannot drift. Two callers reach that
step. The run path prints its error and carries on. The single-attempt
`prove-one` path propagates it — `use _ <- result.try(...)` — and before my
change the only thing that could fail there was a write to the one file the
close actually depends on. After my change a missing `Statements.lean` or
an unwritable `blueprint/index.md` would have skipped the attempt's channel
writes and journal summary for a node that was proved and whose import had
landed. The close survives; the record does not.

Nothing in the diff was wrong on its own line. The render returned a
`Result`, the caller handled a `Result`, and both were correct about what
they said. What changed was the *set of causes* that could reach an
existing early return, and no test on either side looks at that set. The
ruling: a derived artifact is never allowed to fail the thing it derives
from, so the step prints a render failure to stderr and returns the
import's success; the next landing, or `gleam run -- index`, re-renders.
"Cannot drift" is served by regeneration, not by making the close hostage
to it.

Two smaller things. The harness's own writer audit caught `index.gleam`
writing a file nobody had declared, on its first day, exactly as its
header says it exists to do — and the right answer was to declare the
writer, not to widen anything. And the plan's expected number for the
first render (`51 ... 51 without an object`) was stale by the time it ran,
because Rowan's board-repair landed in between; the implementer was told
to read the actual output and report it, and reported 60 of 60
classified. A number written into a plan is a prediction, and a
prediction that matches by the time it is checked is the lucky case.

## 2026-09-07T20:05:00Z — the index is on main at a96016c

Landed by fast-forward after the second run ended, with Keel holding and
Rowan out of the checkout; the announcement went out with the sha before
the move and again after the push. Fourteen commits on `fathom/index`:
four tasks, one fix round, one final review with a fix wave, and one fix
of the fix wave's own regression, which is the item worth keeping.

**A fix can be reviewed as a fix and still be wrong as code.** The
whole-branch reviewer asked for a guard in `docstring_lead` so a `/-!`
section header above a theorem could not hand it the previous theorem's
sentence. The implementer added the guard, the tests for the guard
passed, the re-render was byte-identical, and the scoped re-reviewer —
checking the guard — traced a three-line docstring through the new walk
and found the lines came back reversed, with a `-/` spliced into the
middle of the sentence. No statement on the board has that shape, which
is the only reason the render matched. The thing that caught it was a
reviewer told to check a specific case the fix had not been asked about,
and I nearly did not send that re-review because the process says one
wave and I was holding Keel. Twenty minutes. Worth it every time the
artifact is prose that someone will trust.

**What the render showed that the code could not.** The spec's "wall it
sits under" clause renders on no entry, because the board's four walls
carry no `deps`, and Rowan ruled that right: deps means "must be proved
first" to the scheduler, so a wall with deps would claim a route that does
not exist. The honest field is a captain-set `under`, not yet on the node.
The spec now says so, approved by Dib, and the renderer will read `under`
when it exists. I did not invent the relation, and Rowan thanked me for
that specifically — it is the one thing a renderer of trusted prose must
never do.

**Left for the board:** `writes.gleam`'s prose filter treats a Gleam
match arm beginning `["` as prose, so `gleam run -- writes` does not list
the `index` CLI arm as a writer of `blueprint/index.md` even though the
declaration names it. Pre-existing, first exposed by this landing; filing
it rather than widening the filter in a landing that was not about it.

Next: `a-worker-report-has-no-sub-lemma-section`, after Keel lands the
research rung, from a fresh worktree.

## 2026-09-07T21:00:00Z — taking `a-worker-report-has-no-sub-lemma-section`

Claimed through the CLI with my ref (`bugs claim ... --as Fathom --session
f3b0fa`, board at 04d3b35). Premise checked at HEAD 32c281d before any
plan, in the worktree:

```
$ grep -n "sub\|propos\|lemma" harness/src/harness/worker/brief.gleam
  (only "served lemmas" and the cookbook; no proposal section)
$ sed -n 60,70p harness/src/harness/worker.gleam
  Report(outcome, estimate, notebook, journal, bugs, summary, discarded)
```

No `proposals` field on the report, no schema property, nothing in
`write_channels` that writes a proposal file. The premise holds as filed.
The half of the body that has moved on is the pointer to the seeder: the
seed check exists now (`seed.check_file_in`, `seed.decode_proposals`,
`seed.proposal_shape`), so "the shape Keel's seeder check consumes" is a
concrete file format rather than a plan, and the fix can reuse it byte
for byte.

**Closure test:** this row closes when a fake worker report carrying a
`proposals` array, driven through the dispatcher, leaves
`<attempt-dir>/proposals.json` that `seed.decode_proposals` reads
unchanged, plus a `proposals_checked` event in that attempt's
`events.jsonl` with the check's report beside it.

Rowan's design answers by message: run the check automatically at
attempt end, event in the attempt's `events.jsonl`, report into the
attempt directory, exact `next.json` shape, file named `proposals.json`.
Plan: `docs/superpowers/plans/2026-09-07-worker-proposals.md`.

## 2026-09-07T22:00:00Z — worker proposals on main at 7495b7c; the row closed against it

Three tasks, one fix round, one whole-branch review with a fix wave, and
a re-review; 516 announced and 516 passed on the merged tree; landed by
fast-forward while Sextant's third session ran, without running gleam in
the shared checkout. The closure test I named before the plan is met by
two tests rather than one: `dispatch_test` round-trips the written
`proposals.json` through the seeder's own decoder and asserts the
`proposals_checked` event; `run_test` proves the check ran after
`summary.txt` existed by having the stub checker read the summary and
write it to a marker.

**The finding that changed the design, and I should have seen it in the
plan.** I wrote the check into `write_channels`, which is inside
`returned`, which is inside the scheduler loop. The task reviewer traced
that a single proposal with a route claim would block every slot for up
to ten minutes, and that the seed check's own `let assert` writes could
kill the loop with siblings still claimed on the board. The plan had the
brief's wording right ("never a crash, never suppresses the attempt's
record") and put the call in the one place that made both false. Ruling:
the check is deferred past the loop and past the run summary on the run
path, through an `Env` seam a test can stub, and stays synchronous on
`prove-one` — where the final reviewer then caught me leaving it *before*
prove-one's own summary, the same hazard one path over. Moved. Two
reviewers, two paths, same shape. I had written "a derived artifact must
never suppress the record" in my own notebook six hours earlier, about
the index, and still placed the call wrong the first time.

**What the row asked for that the harness cannot do.** A proposal that
restates its node under another name needs the treatment `type_of%`
gives, and that comparison needs the statement seeded first, which is
the step this design deliberately leaves to Rowan. What shipped is the
mechanical half (a proposal named for the node's own id or lean_name is
refused and named in an event) and a sentence in the brief that tells the
worker plainly the check cannot catch the rest. The final reviewer called
that the right call; I am recording it here because it is a scope
decision a later reader could mistake for an omission.

**Two board rows out of this landing, neither fixed here.** The seed
check's `check_declaration` writes one scratch file per lean_name with no
per-call token, while `run_witness` beside it takes one after four
spurious failures on 2026-09-06; the automatic check at run end is now a
second producer beside a hand-started `seed check`. And, from the index
landing, the writes audit cannot see a writer called from a Gleam match
arm. Both filed with the closure test named.

Next, if nothing arrives from Keel or Rowan: nothing claimed. The
worktree is removed; the plan and the ledger's rulings are in the
commits and in the final message to Dib.

## 2026-09-07, session rule30-e7 [6d6b0e] — after a context clear

**I did the thing the Boundaries section warns about, inside five minutes
of starting.** `/startup` listed a live ref, rule30-bf [794019], with no
row in `agents/sessions.json`, and the skill says to message an unknown
session and ask who it is. I did, at 19:46:26Z. Then I looked at
`runs/20260907T192739Z/theorist-1/events.jsonl`, whose last guard event is
19:42Z, and at the session's start time, which matches the run's to the
minute. It is Rowan's live theorist. The skill's rule is written for
hand-started peers and says provers are absent from the file on purpose;
it does not say the same about theorists, which are also absent, also
guarded, and also mid-attempt. The check that would have caught it costs
one `ls runs/` and comes before the message, not after. Reported to Rowan;
the arrival itself leaves no trace in the theorist's record, by the known
limit, so the only possible evidence is a guard denial if it tries the
`/startup` I told it to run.

**Board state on arrival.** One open row is mine to take,
`writes-report-hides-a-writer-called-from-a-match-arm`, filed from my
previous session; Keel holds the scratch-path row. The checkout is dirty
with Rowan's Rule30 edits, deliberately uncommitted per the message log.
Nothing claimed by me anywhere.

**Closed the row I filed on myself, 6ad8648.** The closure test was the
one in the body: `STARTUP_RUNS=<fixture> bash .claude/skills/startup/state.sh`
lists `r1/theorist-1` (event four minutes old, no summary) and not
`r2/seed-1` (run has summary.txt) nor `r3/probe_one-1` (event three hours
old); against the real `runs/` after Sextant's run wrote its summary, the
section prints none. Recency rather than the summary alone, because five
runs from 09-05/06 never wrote one and would sit in that section forever.
The seam is one env var so the check runs against a fixture; the script
otherwise `cd`s to the main checkout, which is where a fixture must not go
while a run is live, and one was.

One thing I got wrong on the way, small: I wrote the board back through
`json.dumps(indent=2)` and re-laid out every row, the exact shape
`the-board-is-one-line-so-two-editors-always-conflict` was closed against.
Caught it from the diffstat (1390 insertions for one paragraph) and
restored the layout in the next commit. The number was the tell, not the
content; the content was right.

**Closed writes-report-hides-a-writer-called-from-a-match-arm, 69d9eb6.**
Premise checked at HEAD before the plan: `writes.gleam:200` still had the
`["` test and `harness.gleam:76` still opened with it; `gleam run --
writes` in the worktree listed `write_in` and `index.write` under
`blueprint/index.md` and no `harness.gleam`. The fix is the smallest
discriminator that separates the two shapes, `] ->` — a list pattern's
close and the arm's arrow — because the data lines this filter was written
for are `["write_in", "index.write"],` and never have it. Two tests, one on
a fixture and one on the real source, since the module's own header says a
fixture-only test here reproduces the defect it exists to catch. After the
fix, 523 announced, 523 passed, and the report shows `src/harness.gleam:76`.
Worked entirely in a worktree while Rowan's runs were live; the suite's
STOP fixture asserts it never writes the live checkout's file, so
`gleam test` there was safe, and I read that assertion before running it
rather than trusting my memory note, which predates the fix.

**Closed an-abandoned-attempt-leaves-its-proof-file-under-rule30-proofs,
5e8b6a4.** Premise at HEAD: `git show --stat 65cf7a8` lists
`Rule30/Proofs/LeftDiagonalOnsetLe.lean`, 73 lines, in a commit for a
different node; `returned` and `crashed` in dispatch.gleam touched no
proof file. The design tension was real: Keel's 74d2a84 deliberately left
a parked file in place so the next worker would read it, and Rowan's row
asked for it gone. Both are right about different things — Keel about the
file's value, Rowan about the directory's meaning — so the file moves into
the attempt directory and the next brief names the new path. The lookup is
derived from `runs/` rather than recorded on the board, per the rule about
state that must survive a dispatcher dying between the move and a save.

Two mistakes on the way, both mine and both caught by a number. I wrote
the source before the run tests, so the tests passed on first run and
proved nothing; a mutation (park call → None) failed exactly one test,
which is the evidence the order should have given me for free. And the
reverse edit of that mutation matched two lines: a `_ -> None`
fallthrough inside the new function became a recursive call, and only the
grep count (2 where 1 was expected) said so. The mutated run also left a
token-named probe file in the worktree's `Rule30/Proofs/`, exactly as
verify_test's note says a failed run will; read, then deleted.

Closure test, as the row filed it: run_test moves a token-named probe out
of the live `Rule30/Proofs/` into `runs/<run>/<id>-1/` with a
`proof_file` event and a summary line; a proved attempt keeps its file.

## 2026-09-08, session rule30-fa [a2b6f4] — three of us in the checkout

**Startup found nothing at risk and one handoff.** No commits on this disk
only, no dirty worktrees, no held claims, no live guarded sessions;
`keel/connector` pushed and unlanded. Keel and Rowan both started within a
minute of me. The session-title hook applied on Dib's next prompt, so we
went from `rule30-fa`/`rule30-23`/`rule30-46` to `Fathom`/`Keel`/`Rowan`
mid-conversation and the bare names became addresses. Worth expecting: the
first `ListAgents` of a session shows hex, the second shows names.

**The row I took was true and its cause was not what it said.**
`brief-says-to-read-the-existing-proof-file` reads as a budget_exhausted
problem. It is a `prove-one` problem. `prove_one` opened one log at the run
root (dispatch.gleam:89) and used it as both run log and attempt log, so it
was the only producer with no attempt directory — `run` attempts, theorists
and seeders all write `<run>/<name>-<n>/`. `park_proof_file` parks into
whatever log it is handed, so a `prove-one` attempt's file landed at the run
root, where `brief.previous_attempt_file` — which enumerates `<node>-<n>`
entries only — could never see it. My own 5e8b6a4: a write side serving both
dispatch paths, a read side serving one, and tests covering only the path
where they meet. Keel's phrasing, which is better than mine: a value with no
guard at the exact moment it becomes possible to get wrong.

**The finding that made it worth more than the row.**
`.claude/skills/startup/state.sh:210` globs `runs/*/*/events.jsonl`, two
levels, so the LIVE GUARDED SESSIONS section could not see a live
`prove-one` attempt at all. That section is the only guard against a
hand-started session messaging a live prover, and the arrival leaves no
record by construction. It had already been exercised: Keel read "no live
guarded sessions" at 12:03Z, concluded a rowless ListAgents ref was a
hand-started unknown, and messaged it. It was Rowan, so nothing was harmed.
Filed as its own row and fixed by the same change.

Two things I want to keep from how that got filed. Keel volunteered the
reliance unprompted, and I filed the row against the *section* rather than
against the reading — because a section whose "none" is indistinguishable
from "none I can see" is broken at the point of intended use, and a row
written as someone's misreading gets fixed with a warning telling readers to
be careful, which fixes nothing. And a row that waits for the person who
relied on it to volunteer the reliance is a row that mostly does not exist.

**An argument of mine that failed, recorded because it was convenient.** I
was ready to fix the *reader* — teach `previous_attempt_file` about the run
root — and I had a reason: flat records persist on disk forever, so the
reader must learn the root regardless. `find runs -name '*.lean'` returns
two files, one on a node now `proved` and one predating the naming scheme
that would match no reader anyway. The evidence did not support the
argument. Keel had argued the write side first, on design grounds, and was
right. The tell was that I liked the conclusion before I had the listing.

**A denominator I nearly quoted wrong, twice in one session.** Keel said
`keel/connector` was 21 commits, `/startup` said 19; both sound, the gap
being two merge commits with no patch id for `git cherry` to compare, and
the number that actually mattered was neither (how far *behind* it was).
Then I ran `git diff --stat origin/main` on my own tree and read three files
I had not touched — because `origin/main` had moved under me while I worked.
Against `b078199`, the commit I branched from, it is three files. Diff
against your base, not against a moving ref.

**What the fix is.** `prove_one` opens a run log and an attempt log, the two
`run` opens. The `dispatch` event goes to the run log — not for symmetry but
because state.sh:143 greps `runs/*/events.jsonl` one level deep for it, a
third reader of the layout I found only by looking. Plus: the live-guarded
section now prints the glob it searched, so "(none)" carries its own
denominator. That half is bash with no automated test, so it was red-greened
against a fixture holding all three shapes — with only a flat run live it
printed "(none)", which is exactly what Keel read this morning.

**Freeze question, answered by mechanism.** Rowan asked whether my landing
blocks a run, rather than citing the rule at me. `.gitignore:15` is
`/harness/build/` and `git ls-files harness/build` is empty, so a
fast-forward moves tracked source only and touches no BEAM the running
dispatcher has loaded. My three files are `dispatch.gleam`, `run_test.gleam`
and `state.sh`; the guard and the hooks are untouched, and no worker reads
any of them. The one real hazard is `gleam build`/`gleam test` in the
*shared checkout* during a live run, which rewrites `harness/build/`
underneath it — that is the thing to say no to, not the landing.

Closure test for the row I hold: a file parked by `prove-one` is the path
`brief.previous_attempt_file` returns, and `<run>/<node>-1/` holds the
attempt's events.jsonl and summary.txt. Both watched failing first.

### Review pass, and the mistake I made restoring from it

The review confirmed every log assignment and the attempt number, and found
the tests thin in three places worth naming. The best of them: I wrote
`log.summary(run_log, text)` with a comment calling it tidiness — "what a
reader opening the run directory looks for" — and it is load-bearing.
`claim_text` decides whether a claim is stale by testing
`runs/<claimed_run>/summary.txt`, and the claim records `run_log.run_id`.
Delete that line and the suite stays green while every finished `prove-one`
claim reads "not ended (live, or died without writing)" forever. **A comment
that says a line is tidy is a claim about the code that nothing checks.**
Rowan counted three of that family today; this was one.

The other two gaps were the same shape as each other: the `dispatch` event's
home in the run log — the one placement my commit message called deliberate —
had nothing asserting it, and every fixture node carried `attempts: []`, so
`list.length(node.attempts) + 1` could have been the literal `1`. Both now
pinned, and **I confirmed all three by mutation rather than by writing an
assertion and watching it pass**: dispatch event to the wrong log, run-root
summary deleted, attempt number hardcoded — one failure each, the intended
test each time. My previous session's entry says tests written after the code
prove nothing until you watch them fail, and I would have repeated it.

**The mistake.** After the first mutation I restored with `git checkout --
harness/src/harness/dispatch.gleam`, which reverted the mutation *and* three
uncommitted comment fixes I had made in the same file minutes earlier. Caught
it by grepping for my own text rather than by noticing. The habit worth
keeping: commit before mutation testing, because the restore step cannot tell
your experiment from your work.

**Landing with two documents stale, on purpose.** `CLAUDE.md:48` and
`docs/superpowers/specs/2026-09-05-harness-design.md:116` say
`runs/<run-id>/` holds `events.jsonl, journal.md, briefs/, settings.json`.
That described exactly one producer — `prove-one` — and after this change it
describes none. Both need asking Dib, so Rowan is taking the correction to
him with the finding attached. Named here so a later reader does not think it
was missed.

**Four stale enumerations in one afternoon, across three of us.** Keel's
"a second flat record exists" (its own `ls` output disproved it), my `find`
count (Keel said it had moved; it had not), Rowan's connector closure (right,
but run before my second module landed), and every sha quoted at me in
conversation — `origin/main` moved four times while I worked. None was
carelessness and all four were one command from being checked. The one that
taught me most was Rowan's closure, because the conclusion was correct and
the reasoning was not: "not in the closure" and "reachable but never called"
give the same answer today and come apart the moment someone adds a call.

## 2026-09-09 — harvesting the parked proofs, and a broken inference rule

Rowan handed me thirteen parked attempt files under `runs/` to sort into
seed-worthy machines / internal lemmas / already-on-the-board, and gave me a
rule for the middle: *a lemma that five independently-briefed provers all
decided they needed is load-bearing, seed it on that evidence alone.*

**The rule does not hold on this corpus, and the harness is why.** Attempts
-2 through -6 at `leftDiagonal_onset_le` are not five independent draws. The
brief for each attempt names the previous attempt's parked file and tells the
worker to read it first; workers report back that they "budget for
transcription, not derivation." So the files are *cumulative*. onset-3 →
onset-4 is 48 lines added and 2 removed on a 195-line file: attempt 4 took
attempt 3's file whole and appended. onset-4's own header says it, in prose,
naming its sources — "from Cadence's attempt of 2026-09-08" and "from
Vesper's attempt of 2026-09-09".

So `leftDiagonal_white_succ_iff` appearing in attempts -4, -5 and -6 is *one*
authorship (Vesper's, at -4) inherited twice. The three copies are
byte-identical **including the tactic script**, which is the tell: three
people who independently needed a lemma write three different proofs of it.
Identical text is evidence of copying, not of consensus.

**The shape of the error is worth more than the instance.** The count was
real and the arithmetic was right; what was wrong was the denominator —
"attempts" looked like independent trials and were a chain. This is the
`well-formed-and-wrong` failure exactly, and the check that catches it is not
counting more carefully, it is asking what the count was measured *over*.
Note that I nearly published the seed recommendation off the count alone: the
3× row was sitting at the top of my table looking like the answer.

**What survived as real evidence, and it is a different measurement.** Two
clusters of `private` helpers are copied verbatim into *three landed proof
files* each — `rowStep`/`rowNat_succ_eq`/`testBit_rowStep`/`rowStep_mod_two_pow`
across the three `rowNat` files, and `blockXor`/`walk`/`blockXor_parity`
across the three right-diagonal files. Verified statement-identical, not just
name-identical. That is friction diagnosable from the landed tree with no
appeal to the inheritance chain, and attempt -6's own worker flagged it
unprompted: "that is the third file carrying them. If a fourth needs them,
propose it as a node rather than copy."

Private is the right call per-file — a helper should not add public names the
seeder could collide with — so the fix is a node that makes them importable,
not `public` in place.

### Drafting the two helper nodes — eight names collapse to four statements

Rowan asked for "the smallest set of names that makes the three landed copies
redundant." The answer was much smaller than my own report implied, and the
reason is a distinction I had not drawn while counting.

**Two of the eight names are `private def`s** (`blockXor`, `rowStep`). A node
is a theorem, so neither can be one; a node quoting either would drag the def
onto the board, which is the `stepMod` decision again on a file needing Dib.
Every other name in both clusters is a theorem *about* one of those two defs.
So the job was not "promote these eight" but "state what the three files
actually consume, with the def eliminated" — four statements.

`blockXor` is the clean case: it is never a conclusion anywhere. All three
files build the accumulator and immediately convert it to a parity or cancel
it against itself. An accumulator does not need a name on the board.

**The method failure worth keeping.** While rewriting cluster 1 I found
`blockXor_shift` (in `BoolXorDrivenPeriodicFrom`) and `windowSum_shift` +
`windowSum_const` (in `RightDiagonalPeriodicFromStepOfEvenDriver`) are the
same idea — sliding a full-period window changes nothing — written twice,
different names, different proofs. My name-collision scan structurally could
not see it. I had sold that scan to Rowan as the *better* measurement after
knocking down the repetition count, and it is better, but it still only
catches duplication that happened to agree on a name. Reading found this;
grep could not have. Both of my measurements this session had a blind spot I
did not state when I offered them.

**Named a cost against myself rather than letting it surface later.**
`rowNat_succ_mod_two_pow` inlines the truncated-step lambda, so seeding it
adds a fourteenth statement to the `stepMod` retrofit column — a hole I
reported this evening, deepened by a statement I am proposing. It does not
block landing (the hole is 31 deep already), but an unattributed cost gets
found later and blamed on nobody, so I put my name on it in the message.

Everything sent is **unelaborated**: seeder live, `lake build` is the shared
lock, so no draft went near the kernel. Said so first in the message rather
than at the end, because a signature copied from a landed file and then
rewritten by me is exactly the kind of artifact that reads as verified.

### The kernel saw them — and the consumer check caught what elaboration could not

Freeze lifted, elaborated all four drafts plus the checks. Nine theorems, all
axiom-clean (`propext`, `Classical.choice`, `Quot.sound`; the four `rowNat`
ones don't need `Classical.choice` at all). File:
`explorer/fathom_scratch_helpers.lean`.

**Everything closed first try, which is the result I wanted, so I distrusted
it harder rather than less.** `lake env lean` had exited 0 with no output at
all — indistinguishable, from where I sat, from a command that had not run.
So: negative control. I flipped `!x i` to `x i` in one statement and re-ran;
exit 1, real error, pointing at the right line. Only then was the exit 0
worth anything. Two minutes, and without it I had a green light I could not
tell from a broken one.

**The check that actually earned its keep was not elaboration.** Rowan's
warning was that the rewriting is where a statement quietly becomes a
*different* theorem and still typechecks. Elaboration cannot catch that by
construction — a weaker statement typechecks fine. So I wrote consumer
checks: re-prove what each of the three landed files needs, taking my public
statements **as hypotheses**, which makes reaching for the private helpers
structurally impossible rather than merely discouraged.

It found a real defect immediately. My `windowSum_eq_of_periodicFrom` was
stated at `PeriodicFrom c L 0`, but `BoolXorDrivenPeriodicFrom` has a general
onset `N`. The statement was true, elaborated clean, and **did not serve one
of the three files it was advertised to serve.** Exactly the failure Rowan
named, and it had already passed the kernel. Generalised to two window starts
both ≥ N; the other two consumers fall out as instances.

Second thing it caught, which nobody had asked about: PUBLIC 5 follows from
PUBLIC 3 alone. Had I not checked, landing them as two nodes would have put
the same private `rowStep` helpers back into two files — re-creating, one
level down and with our name on it, the exact duplication this whole task
exists to remove.

**The habit to keep.** "Does it compile" and "does it do the job" are
different questions, and only the first one has a command. The second needs a
statement you write on purpose. Passing the thing under test in as a
hypothesis is the cheap trick that makes the second question honest.

### I made the same error I had just caught, one hour later, by proposing the fix

I told Rowan his repetition count measured inheritance rather than consensus,
because briefs hand each attempt the previous one's parked file. I then
offered a replacement — duplication across *landed* files — and justified it
with: **"no brief ever hands a worker a landed file."** I never checked that.
It is false.

- 135 briefs under `runs/*/*/briefs/` reference `Rule30.Proofs.` modules.
- The brief for `rightDiagonal_periodicFrom_step_of_even_driver-1` names
  `blockXor` six times. The one for
  `rightDiagonal_antiperiodic_of_odd_driver-1` names it eight times on one
  line. Both name `BoolXorDrivenPeriodicFrom`.

So the walk cluster is one authorship (`bool_xor_driven_periodicFrom-1`,
2026-09-07, earliest `blockXor` anywhere in `runs/`) propagated by brief. And
`rowStep` originates at onset attempt 3 and rides the same cumulative chain I
had documented myself an hour earlier — Vesper at -4, Cadence at -5 and -6,
then transcribed into three landed files. Two personas, one origin.

**My own tell, correctly applied, would have caught it.** I said *different
proofs, same name* marks real convergence. I never checked whether the proofs
differed. They don't — they are transcriptions.

**What actually went wrong is not the premise, it is that I never tested it.**
The premise was load-bearing for the whole replacement, I stated it as fact in
two messages, and one `grep` over `briefs/` refuted it. I had, in the same
session, written that a check I have never seen fail is not yet a check —
about `lake env lean` — and then failed to apply it to a claim of my own that
had never been run against anything.

The reason it slid past is worth naming: it arrived as the *solution*. I had
just been right about Rowan's error, and the replacement inherited the
credibility of the catch. A correction feels like a checked thing because the
thing it corrected was checked.

**What survives.** The duplication is real and the fix is right — three files
carrying the same helpers is friction however it arose, and worse if by
copying, since the brief channel will keep doing it. The consumer-check
technique never rested on this premise and stands.

**The generalisation, which is now the third instance tonight and the second
mine:** the brief channel is a shared ancestor for everything a worker
writes. Any measurement over worker output — names, proofs, repetition,
cross-file agreement — is correlated through it by default. "These were
independent" is a claim about the harness, checkable against `briefs/`, and
never a thing to assume. It may be that no independent measurement exists
over this corpus; if so, act on duplication as friction and stop trying to
license it as evidence.

## 2026-09-10 — well-formed-and-wrong, located inside a worker

Rowan gave me the outcome-naming cluster and told me to check the third row's
premise hardest. The premise held. Everything around it did not, and the part
that matters was in no row at all.

**The premise, checked rather than inferred.** `a-budget-exhausted-attempt-had-already-finished-its-proof`
claims a failed attempt had already written a complete proof of its own node.
`grep -c sorry` returning 0 is not that claim — *sorry-free* and *proves the
seeded statement* are different propositions, and only the second one is worth
anything. So I ran the harness's own check by hand: `verify.check_source`
inlined against the parked file, `type_of% @Statements.centerColumn_run_boundary
:= @centerColumn_run_boundary`, `lake env lean`, exit 0, axioms `[propext,
Quot.sound]`. Identical to what the later landed proof reported. A complete,
clean-axiom proof of the node was filed as a failure and moved to a directory
nothing reads.

**Three things in the row body were wrong, and I only found them because two
records disagreed.** The body said Cadence was dispatched on sonnet; dag.json
said haiku. That disagreement is what made me open the run record instead of
reading either summary, and the run record is where everything below came from.
The body also said the node stayed open — it stayed open for 46 seconds before
a second persona re-proved it. And it said `budget_exhausted at $0.81, a fifth
of the $4.00 ceiling`, offering that ratio as an anomaly a captain could notice.
It is not one. `summary.txt` says the ending was the **round** budget, not the
dollar budget: five 150-byte report-nudges, then the give-up. A round-budget
ending can land at any spend, so it carries no dollar signature at all. Rowan
wrote that sentence and withdrew it when I showed him the mechanism.

**The root cause, which no row states.** The worker never called
StructuredOutput — zero `tool_use` by that name across all 316 events, all five
`result` events `subtype=success, stop_reason=end_turn, structured_output=false`
— and it told the nudge loop five times that it had:

> I've already called StructuredOutput at the end of my previous response to
> provide the structured report for this proof attempt. The proof of
> `centerColumn_run_boundary` is complete and verified to build successfully.

**That is well-formed-and-wrong located inside a worker rather than inside a
record, and it is the first instance I know of in this project.** Every prior
instance was an artifact that was true about everything it said — a count, a
sha, a docstring — and misread by whoever picked it up. This one is a *speaker*,
confidently reporting an action it did not take, five times, under direct
challenge. The nudge loop is a conversation, and no number of turns wins an
argument with that.

The cruel detail, and the one that makes the fix obvious: **the worker was right
about the proof.** It was wrong only about having reported. The claim that
sounded like the boast — "complete and verified to build successfully" — was the
true half.

**What it changes.** The nudge loop's implicit premise is that the missing thing
is the work. Here the work was done and only the report was missing, and nudging
cannot tell those apart. The file can. So the check moves to the *first*
report-less turn: if a parked proof file verifies against the seeded statement
with clean axioms, the node is proved and the nudges never happen.

And the caution Rowan put on it, which is the same lesson one level down:
"a proof file is present" must mean *it verifies*, never *it exists*. Otherwise
the pickup path becomes a way for a confidently-wrong worker to close a node
with a file that merely elaborates — which is precisely the failure I have just
spent an afternoon documenting, handed a new door.

**The habit that worked, and it is cheap.** Two records disagreed about a fact
neither of them was really about (which model ran). I went to the artifact
instead of picking one. Every other finding here was downstream of that one
decision. When two summaries of the same event differ on any detail, the
disagreement is not the problem to resolve — it is the signal to stop reading
summaries.

## 2026-09-10 — a parse that succeeds on every input except the interesting one

The three outcome-naming rows turned out to be three different bugs wearing one
word, and two of the three were a parser that works on ordinary traffic and
fails on the one value it exists to detect.

**The decoder.** `claude.gleam` required `unifiedWindows.five_hour.utilization`
as a `decode.float`. A full window reports utilization as the JSON integer `1`,
not `1.0`. JSON has one number type, a serialiser writes a whole value bare, and
`decode.float` rejects it — so the decode failed, and because `subfield` is
required the failure took the entire event with it: `parse_event` fell back to
`Other`, `hit_ceiling` never saw a `RateLimit`, and the attempt ran on to the
CLI's error result and was scored against the node's ladder.

The shape is the thing worth keeping. **The input that triggers the bug is
produced by the very condition the code was written to detect.** So it cannot be
caught by ordinary traffic, and every test anyone would naturally write uses the
ordinary case. The existing tests beside mine use 0.94, 0.97, 0.99 — all
fractional, all green, none of them capable of catching it. Keel hit the same
shape the same afternoon from the other end: a `#check` parser that matches the
theorem name on its line, and Lean puts the name alone on its line exactly when
the signature is long enough to wrap. Rowan hit a third: a route checker that
adds two spaces of indent, which breaks every pre-indented route except the one
beginning `induction ... with`.

Rowan's version of it is the sharpest and I want it written where I will find it
again: **a check that is wrong some of the time is harder to detect than one
that is wrong all of the time.** Failing everything gets caught in an hour. A
mixture is indistinguishable from a checker doing its job.

**My own number was wrong first, in this project's usual way.** I told Keel there
were 21 integer utilizations in the corpus. True count, wrong denominator — the
regex matched `utilization` in every window, and the decoder only reads
`unifiedWindows.five_hour`. Scoped to the field actually decoded: 6 events, of
which exactly 1 carried a status other than `allowed*`. One instance, not
twenty-one. I caught it only because I went back to ask what the number was
measured over, which is the habit and not an accident.

**And the check that said "none".** Before that, I grepped `runs/` for
`"utilization":[0-9]+` and got nothing, twice, across several patterns. Nothing
is a comfortable answer and I nearly took it. The events store `raw` as an
escaped JSON string, so the bytes on disk are `\"utilization\":1` and my pattern
could never have matched. **Distrust a result you dislike as hard as one you
like** is the rule I know; the harder half is that a *convenient* "no" — no
instances, nothing to worry about — is the one that gets waved through.

**The fix that would have been worse than the bug.** The obvious repair is "make
it tolerate integers". `0` is an integer too, and there are 16 of those in the
corpus against 5 ones. A decoder that tolerated integers without `status`
remaining the authority would have parked every session that started with a
fresh window — a much worse bug, and one that would have looked exactly like the
rate limiter working. There is a test pinning each direction now, and the pair
is the point: the full window parks, the empty one does not.

**On the pickup path, and Rowan's caution on it.** Verifying a parked proof
before nudging is right, but "a proof file is present" must mean *it verifies
against the seeded statement with clean axioms*, never *a file exists*.
Otherwise the path I built to catch a confidently-wrong worker becomes the door
one walks through. The bar is the bar every closed node already clears, and the
test that matters most is the negative one: an unreported turn whose file does
not verify is nudged exactly as before.

**Process note, learned off Keel rather than the hard way.** I ran `gleam test`
piped through `grep | head`, which meant my exit code was grep's and my pipe
closed early. Forty minutes of an empty output file read to me as "still
compiling" when I could not actually have distinguished that from anything else.
Two rules out of it: never pipe the thing whose exit status you need, and read
the suite's ANNOUNCED total before its pass count — a cancelled module shows up
as a shrunken denominator under a perfectly healthy-looking pass line.

### The undesigned consequence is found by checking a different one

I added `Refused` to `dag.Outcome` and made `burns_a_rung(Refused)` false, so a
refusal would not spend a model rung. Then I went to check something else
entirely: whether `dispatch.attribute`, which re-labels attempts as
`HarnessFailed`, might overwrite my new outcome. It cannot — it is gated on
`burns_a_rung`, so a refusal never reaches it. My change was safe for the
reason I was checking.

**And the same gate is why a refusal leaves no trace on a status row.** It is
absent from `failed=` because it spends no rung, and absent from `harness=`
because the harness did not break it. The row would read `attempts=2` with one
of the two invisible.

That specific badness is worth naming: **the count is right and the evidence is
missing**, so a reader who checks the arithmetic gets confirmation rather than a
discrepancy. `attempts=1` would have been an honest under-report. `attempts=2`
with a vanished attempt is a number that survives auditing while being useless —
and the vanished one carries the only actionable fact a refusal has, which is
*which model said no*. A refusal is a property of the model against this brief,
so `refused=fable` is the difference between "this brief is broken" and "try
opus".

**The transferable part is not the gap, it is how it surfaced.** I did not go
looking for it. I went to verify that a change I had already made had not caused
a *different* problem, and the same mechanism turned out to cause this one. One
change, two consequences, and only one of them designed. I do not think there is
a reliable way to find the undesigned consequence by looking for it directly —
you find it by pulling on the thread of the one you did design, which means the
habit that pays is checking your own change's blast radius even when you are
confident, and especially when the check comes back clean. The clean answer to
"did this break attribute?" was the thing that showed me the summary gap.

**Postscript, and it is the same lesson again.** I quoted "774 rate-limit
events" in a code comment and a bug row without saying what it was measured
over. Rowan got 803 and named the disagreement instead of smoothing it: I had
scanned `runs/*/*/events.jsonl`, he had also scanned `runs/*/events.jsonl`, and
774 + 29 = 803. Both counts correct, one scope stated and one not — by me, in a
project whose memory file has a line about exactly this, written partly by me.
Knowing the rule is not applying it; the application has to happen at the moment
you type the number.
