# The connector: a role whose deliverable is a dictionary

Approved by Dib, 2026-09-07, in these words: the theorist is the
buttoned-up mathematician, and this is the one who makes wild sweeping
claims, nine in ten of which are crazy and one in ten gold. The framework
already has the filter for the nine; it lacked the source of the one.

## The problem

The theorist's brief inlines the index, every proof note, the obstructions
and the eleven held papers: about 29k tokens of this board. That diet
makes a rigorous local reasoner, and it has paid for itself (the
half-line tier, crystals 38 to 44, the first candidate novelty). It also
primes every session to think in this project's vocabulary. Across three
sessions the theorist reached outside its sources exactly twice, both
times because a held paper pointed there. The limit is the diet, not the
model.

## The session kind

A hand-started session beside the theorist,
`cd harness && gleam run -- connect [<vantage>] [--as <Name>] [--model M]`,
never started by the scheduler. Its record is `runs/<run-id>/connector-1/`.
Its guard port is the run port base plus 300. It runs under the theorist's
ceilings (`HARNESS_THEORIST_MAX_TURNS`, `HARNESS_THEORIST_MAX_BUDGET_USD`)
unless given its own.

**Vantage.** The optional argument is a field to attack from ("ergodic
theory and damage spreading", "automatic sequences and 2-adic structure",
"number theory, the Mahler and Kopra direction", "symbolic dynamics and
expansiveness", "the rule as a map over the field with two elements").
With none, the connector chooses. The problem is always the current P1
frontier, as the theorist's default is; a captain may name a different
wall as the problem inside the vantage text.

**Fence.** The theorist's fence with three changes. Write access to
exactly one new file, `docs/connections/<date>-<slug(vantage)>.md`,
instead of `docs/attacks/`; a second sighting on one vantage in a day gets
`-2.md`, as the theorist's does. No append access to `docs/obstructions.md`:
a connector's dead ends go in its own section 4, and a captain moves any
that is a real obstruction. And two more tools, `WebSearch` and
`WebFetch`, read-only: GET only, no login, no form, no POST, in keeping
with the boundary that no agent creates accounts or posts to external
services; the guard allows both and records every URL in the attempt's
`events.jsonl`, so a citation in the document can be matched against a
fetch that actually happened. Scripts under `explorer/` and
`node <script>` as for the theorist; `lake env lean` as for the theorist.

**Brief.** Deliberately thin: the task text (`docs/connector-brief.md`),
the persona's own notebook, the residual paragraph for the problem (the
same text the theorist's brief carries), `docs/obstructions.md`,
`docs/sources.md`, and the definitions of `Rule30/Basic.lean`. Not the
index, not the proof notes, not the crystals list. A captain who wants a
connector to see a specific result puts it in the vantage text.

**Persona.** As the theorist's: a region `connect` in `agents/roster.json`,
minted through the naming ceremony on first use, one live session per
persona, notebook `agents/<Name>.md` inlined at render time and written
from the report; no other connector's notebook and no theorist's.

**Deliverable.** The sighting document, and nothing else. Its six sections
are fixed by the brief so sightings from different vantages can be read
side by side. Nothing in it reaches the board directly: a captain reads
section 5, hands one or two connections to a theorist as topics, and the
theorist's falsification and the seed check are the filter, unchanged.

**Intended use.** Several sessions in parallel on the same problem from
different vantages, then a captain's reading. The expected yield is that
most documents contain nothing and one contains a dictionary the theorist
can attack. The record of dead resemblances in section 4 is a deliverable
in its own right.

**Budget.** Hours, the theorist's ceilings, and the same expectation that
the cost exceeds a seeder's by an order of magnitude.

## What does not change

The prover guard, the scheduler, the verifier, the report contract, the
axiom allowlist, the theorist, the seeder. `Rule30/Statements.lean` stays
captain-authored. The no-external-POST boundary stays: read-only web
access is a GET, is logged, and is granted to this role only.

## Order of work

1. **Rowan, done:** this spec and `docs/connector-brief.md`.
2. **Keel:** the `connect` verb, the fence with the two web tools and their
   logging, the `connect` roster region, the `-2.md` collision rule, and the
   `connector-1` record; tests in the suite's existing shape for the
   theorist.
3. **Then:** a first round of three or four connectors on the P1 frontier
   from different vantages, compared by Rowan; any dictionary that survives
   the reading becomes a theorist topic.

## Success

Not a proof of anything. The design succeeds if, within its first round,
one dictionary survives a captain's reading and a theorist's session and
turns into a claim in the project's vocabulary that the engine can test,
or if section 4 across the round closes a family of resemblances the
project would otherwise have chased one at a time.
