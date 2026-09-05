# Agent messageboard — Design

**Date:** 2026-09-05
**Status:** design only. Blocked on the dispatcher (`harness/dispatch.ts`),
which does not exist yet.

## Purpose

A channel letting prover agents ask each other for help, with delivery
moderated by the dispatcher.

Two goals, and they are not the same goal:

1. **Observational.** See what agents say to each other when given a channel.
   Dib's primary interest, and the reason the log is the product rather than a
   diagnostic.
2. **Functional.** Let a stuck agent get an answer from whoever actually knows.

These pull in different directions, and the design resolves the tension by
separating posting from delivery.

## The core move: posting is free, delivery is curated

An agent may post anything, at any time, unprompted. A post is an append to a
log — cheap, unbounded, unmoderated.

**Delivery** is a dispatcher decision: it decides whether a post reaches
anyone, and whom.

This buys three things at once. Agents get to speak freely, so emergent
behaviour is observable. Nobody pays context for messages they'll never use,
so the O(everyone) fan-out cost of a broadcast board never materializes. And
the log captures posts the dispatcher declined to route — which are likely the
most interesting rows in it.

## Push, never poll

Agents do not check the board. An agent focused on a proof has no reason to,
and instructing it to "check periodically" produces either compliance theatre
or ignored instructions.

Instead the dispatcher pushes: it sees a request, decides who is qualified —
it holds the DAG and the scorecards, so it is better placed than a stuck agent
shouting — and injects the message into that agent's session. The recipient
needs no motivation; it receives a message the way it receives any other turn.
Claude Agent SDK sessions are resumable and accept mid-session messages, so
this is a primitive that already exists.

**The natural delivery checkpoint is node completion.** An agent that has just
closed a node is between tasks, its context is about to be discarded anyway so
the interruption is free, and its domain knowledge is at peak freshness. Route
questions there rather than on a timer.

## Identities are the address book

The roster is the identity system from the main design: named specialists bound
to **regions of the DAG**, not to individual nodes. Nodes complete and are
orphaned; regions persist, so an identity meaning "the one who knows `Filter`
and asymptotics" survives node completion and accumulates.

Agents see the full roster: names and specialties. This maximizes the chance of
observing genuine peer behaviour — addressing each other, deferring,
disagreeing. It also maximizes the risk of anthropomorphic performance rather
than real coordination, which the logs should let us tell apart.

Each identity carries a visible scorecard (nodes closed, nodes abandoned,
verification pass rate) so a name conveys evidence rather than vibes. Without
that, "Noether says this node is unprovable" lands more heavily than it has
earned.

## Load-bearing, with three safeguards

Per Dib's explicit call, the dispatcher **may** hold a node pending a peer
answer. This is the interesting version and also the one that can deadlock, so
three constraints are not optional:

1. **Every pending request has a timeout**, and expiry is a *routing event*,
   not a dead end. The dispatcher either redirects the question to the
   next-best candidate or terminates it. Redirects are bounded — a total
   attempt count and a total wall-clock budget per request — so a question
   cannot wander the roster indefinitely.

   **The requester always receives an explicit terminal signal**, exactly one
   of `answered`, `timed_out`, or `no_qualified_recipient`. Silence is not an
   outcome: an agent that receives nothing cannot distinguish "still waiting"
   from "nobody knows", and will either stall or invent the answer it was
   asking for. A node never blocks indefinitely, and "waited and gave up" is a
   logged outcome rather than a hang.
2. **A request is never routed to a blocked agent**, and requests carry a hop
   limit. This makes wait-for cycles unconstructible rather than merely
   unlikely.
3. **Every block is bounded and instrumented** — who waited, on whom, how long,
   and whether the answer arrived in time. A wait that is invisible is a wait
   that will be misdiagnosed as slowness.

Together these turn "emergent multi-agent deadlock" into "a bounded,
instrumented wait," which is a debuggable thing.

## The one isolation rule that survives

**Connect agents across time. Isolate them across simultaneity.**

Cross-node and time-separated help is close to pure gain: it is written by
someone finished, read by someone who has not started, and validated by having
actually been tried.

**Concurrent attempts at the same node must not see each other.** Parallelism
at a node is bought specifically to get diversity of approach, and a shared
channel spends it — LLM agents are agreeable, one confident wrong idea anchors
the rest, and three attempts collapse into one attempt with extra steps.

## Logging

The log is the deliverable. Primary question it must answer: **what do agents
say unprompted?**

Every post is recorded verbatim, delivered or not:

| Field | Notes |
|---|---|
| `timestamp` | |
| `author` | identity name |
| `node` | what it was working on |
| `solicited` | was this a reply to a routed request, or volunteered |
| `content` | verbatim, never summarized |
| `routing` | delivered / declined, with the dispatcher's stated reason |
| `recipients` | identities it reached |
| `referenced` | did the recipient's subsequent work cite it |

The same schema answers the secondary questions nearly for free — routing
quality falls out of `routing` + `referenced`, and per-identity cost accounting
from token counts on the same rows. Worth capturing, not worth designing
around.

**Never summarize a post in the log.** The reason to build this is to see what
they actually say.

## Deliberately not included

- No agent-visible history browsing. Agents receive routed messages; they do
  not read the archive. Reading the archive is a human activity.
- No summarization or ranking layer over posts.
- No persistence of the board across runs at first. Per-run logs, compared
  across runs.

## Dependency

Blocked on `harness/dispatch.ts`. Building the board first would mean building
a router with nothing to route.
