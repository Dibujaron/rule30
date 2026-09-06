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
