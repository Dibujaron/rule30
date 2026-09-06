# One session per persona, personas minted on demand

Date: 2026-09-06. Author: Rowan. Status: approved in conversation by Dib,
awaiting implementation plan.

## Why

The first concurrent run (`runs/20260906T013237Z`) put three density
leaves on the board with one P2 identity on the roster, so the dispatcher
ran two Emmy sessions side by side for eighteen minutes. Each loaded the
same notebook at start and appended to it at the end without seeing the
other's entry; one journal recommended attacking a node that had closed
twelve minutes earlier in the slot beside it. The identity is the notebook,
and a notebook read by two sessions at once is not continuity, it is a
fork.

Dib's ruling: one live session per persona, and rather than cap
parallelism at the number of personas, mint a new persona for a region
whenever its existing ones are all busy. Two personalities for one region
is fine; two instances of one personality is not.

## The rule

A persona is a resource with capacity one, like the build lock.

When the run has a free slot and an open leaf is ready, the scheduler
looks for an **idle** persona in the leaf's region: one on the roster for
that region whose name is not attached to any attempt in flight. Roster
order is creation order, so the eldest idle persona goes first and the
fullest notebook is spent before a thinner one.

If the region has no idle persona, the scheduler decides to **mint**: the
dispatcher runs the naming ceremony that already exists for a region with
no persona at all, adds the newcomer to the roster, opens their notebook,
and dispatches the leaf to them. There is no cap on personas per region.

Everything else about a persona is unchanged: one notebook per name,
private to it; peers reach each other only through posts; the scorecard is
per name; the model ladder is per node, not per persona.

`prove-one` runs one attempt with nothing else in flight, so it always
gets the eldest persona of the region and never mints unless the region
is empty, exactly as today.

## Where it lives

### `schedule.gleam` stays pure

`next_to_start` gains two inputs, the roster and the names in flight, and
returns a decision instead of a bare node:

```gleam
pub type Assignment {
  Assignment(node: dag.Node, who: Who)
}

pub type Who {
  Existing(roster.Identity)
  Mint(region: String)
}

pub fn next_to_start(
  d: dag.Dag,
  roster_: roster.Roster,
  plan: Plan,
  running running: Int,
  busy busy: List(String),
  dispatched dispatched: Int,
  skip skip: List(String),
) -> Option(Assignment)
```

The slot and budget checks are as before. The chosen node is the first
open leaf not in `skip`, in the DAG's dispatch order, as before. `who` is
`Existing(i)` for the first identity in the roster whose region is the
node's and whose name is not in `busy`, else `Mint(node.region)`.

The DAG's dispatch order is not changed by persona availability: a leaf
whose region has no idle persona is minted for, not skipped. With no cap
there is never a reason to pass a leaf over.

### `roster.gleam`

`for_region` returns every identity for a region, in roster order, as a
`List`. A new `idle_for_region(roster, region, busy)` returns the first of
those not in `busy`. Every caller of `for_region` that wanted "the"
identity uses `idle_for_region` with `busy = []`, which is the eldest.

`check_name` already rejects a name on the roster; it is unchanged. The
naming prompt (`naming_prompt`) takes the list of names already held in
the region and, when it is non-empty, adds one sentence: the region already
has personas named so-and-so; the newcomer joins them, keeps a notebook of
its own, and must choose a name none of them has. A newcomer who still
picks a taken name is re-asked, as today.

### `dispatch.gleam`

`fill` passes `state.roster_` and the names in `state.running` to the
scheduler and hands `start` an `Assignment`. `ensure_identity` becomes a
function of the `Who`: `Existing(i)` runs the colour backfill if `i` has
no colour, as today, and otherwise returns `i`; `Mint(region)` runs the
naming ceremony with the region's current names, saves the roster, opens
the notebook, logs the `naming` event, and returns the newcomer. `start`
already reloads the roster after a ceremony so the next selection in the
same `fill` sees the new name; that stays.

The `naming` event on the run log gains one field, `"because"`, with the
value `"region empty"` or `"all busy: <names>"`, so a reader of
`events.jsonl` can tell a first naming from an on-demand one.

`InFlight` already carries the identity, so `busy` is
`list.map(state.running, fn(r) { r.identity.name })`. Nothing changes in
the guard, the worker, the DAG file format, or the attempt record, which
already stores the identity name.

### Ceremony cost and timing

The ceremony is inline in `start`, as the colour backfill was in the first
concurrent run: about twenty seconds and five cents on Sonnet. During it
no other attempt is started, but attempts already in flight keep running.
A run with concurrency three and three leaves in one region mints two
personas back to back before the third worker is up; that is the intended
behaviour, not a problem to smooth over.

A ceremony that fails (schema rejection after six turns, session crash)
fails `start` for that node exactly as a failed naming does today: the
error propagates and the run stops with the reason. This is unchanged and
acceptable; a run cannot proceed without a persona.

## Testing

`schedule_test.gleam` gains cases for the decision:

- a region with one idle persona returns `Existing` of it;
- a region with two personas, the eldest busy, returns `Existing` of the
  younger;
- a region with every persona busy returns `Mint(region)`;
- a region with no persona returns `Mint(region)`;
- the slot and budget checks still return `None` before any of the above
  is consulted.

`roster_test.gleam` gains cases for `for_region` as a list in roster
order and `idle_for_region` against a busy list, and for the naming
prompt's sibling sentence being present exactly when the region has
names.

`run_test.gleam` gains one end-to-end scenario: two leaves in one region,
one persona on the roster, concurrency two. The fake shim plays the same
script to every session, so the scripted result's `structured_output`
carries both the naming fields (`name: "Minted"`, a reason, an opening,
a colour) and the report fields (`outcome: "proved"` and the rest). The
naming decoder and the report decoder each read the fields they know and
ignore the others. Assertions: the run log has one `naming` event with
`because` starting `all busy`, two `dispatch` events with different
identities, the roster afterwards holds two names for the region, and
`agents/Minted.md` exists with the scripted opening. The fixture's guard
ports must be spaced past the attempt count, per the lesson in
`agents/Rowan.md`.

## Out of scope

- The two harness bugs found in the same run (the `posts` field required
  by the CLI schema but optional in the decoder; `hit_ceiling` treating an
  `allowed_warning` at 94% as a rate limit) are on Keel's board and are
  not touched here.
- A cap on personas per region. Dib chose none. If the roster grows past
  what he wants to read, a cap is a one-line addition to the `Mint`
  branch and a config value.
- Retiring or merging personas. Nothing removes a name from the roster.
- Which of several idle personas is best for a node. Eldest first is the
  whole rule; a smarter choice (calibration, region sub-area) is a later
  spec if the scorecards ever justify it.

## Teaching note

For Dib: the scheduler is still the build system's scheduler, but it now
has two kinds of resource, slots and personas. A slot is a CPU; a persona
is a named lock with capacity one. "Mint on demand" is the scheduler
being allowed to create a new lock when every existing one is held, which
a build system never does. That is where the build-graph analogy breaks:
the DAG's tasks are fixed, but the workers are not.
