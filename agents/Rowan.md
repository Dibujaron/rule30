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
