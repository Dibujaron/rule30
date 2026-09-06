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
