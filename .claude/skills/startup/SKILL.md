---
name: startup
description: Use at the start of every hand-started session in this repo, before any other work - registers this session's address in agents/sessions.json so peers can find it by identity, and reports what previous sessions left unflushed.
---

# Startup

**Announce:** "Using the startup skill to register this session and read what the last ones left behind."

Run this before anything else. Startup is the one moment in a session's life
that reliably happens — it is the whole reason this skill exists and its
counterpart at the other end does not. A session is killed, times out, or
exhausts context far more often than it exits cleanly, so a step at the end
is fiction. A step at the beginning is not.

Two jobs, and the second matters more than the first.

## Job 1: Register your address

`agents/roster.json` records which identities *exist*. `agents/sessions.json`
records **which address is whose** — and that is the one a peer needs, because
`ListAgents` prints opaque names like `rule30-aa` and `SendMessage` accepts
nothing else. An unregistered session is reachable but anonymous, and the cost
is real: on 2026-09-06 two framework sessions each spent a round of messages
asking a third who it was.

1. **Call `ListAgents`.** Its first line is your own address:
   `This session is <name> [<ref>]`. That is the only reliable way to learn it
   — you cannot derive it.
2. **Know your identity.** Your opening prompt usually names it ("You're
   Rowan"). If nothing does, **ask Dib rather than picking one.** Inventing a
   name puts a false row in a file peers route messages by.
3. **Look up your `ref`** — not your `session_name` — in
   `agents/sessions.json`. A ref is unique to a session; a name can be recycled
   by a later one, and matching on name is the single way a stale row could
   deliver a real message to the wrong process.
4. **If your ref is absent, append a row** and commit it:

   ```json
   { "identity": "Rowan", "session_name": "rule30-41", "ref": "9a93a2",
     "role": "overseer", "started": "2026-09-06T18:45:00Z" }
   ```

   `role` is `overseer`, `framework`, or `guide`. Dispatched provers are
   deliberately absent — they are short-lived, the scheduler already holds them
   as resources, and a message arriving mid-proof would reach a worker as an
   instruction from outside its brief.
5. **Never delete a row, including your own.** A stale row is inert: nothing
   reads this file to decide who is alive.

## Job 2: Read what the last sessions left

```bash
bash .claude/skills/startup/state.sh
```

Read-only — no fetch, no checkout, no ref moves. Run `git fetch origin --prune`
first if you want the remote columns to be current, but only if no harness run
is in flight.

It prints four things, each of which is a way work goes missing:

| Section | What it means |
|---|---|
| Commits on this disk only | Reachable from no remote ref at all. One dead session away from never having happened. Measured with `--not --remotes` rather than against the branch's own upstream, because a branch can be far ahead of *its* remote while every commit is already on `origin/main` under another ref. |
| Branches not merged into `origin/main` | A finding nobody can cite, because it has no sha in `main`. |
| Worktrees with uncommitted changes | Either someone working right now or someone who died mid-edit — **this cannot tell you which, so ask the session.** |
| Held claims | A `claimed` DAG node or bug whose holder may be dead. **This is the one that loses a peer rather than losing work** — a session waiting on a claim will not go looking. |
| Registered sessions | To diff against `ListAgents` by eye. |

**This is the part a dying session could not have done for itself.** It reports
on state from outside every session, so it needs no cooperation from the one
that is in trouble. That asymmetry is the design: a command a session runs
about itself cannot catch its own sudden death, by construction; one that any
session runs about every other session can.

## Job 3: Cross-reference, then speak

Compare `ListAgents` against the roster the script printed.

- **A live ref with no row is an unknown session.** Message it and ask who it
  is. Do not infer an identity from a session name, and do not assume it is
  idle.
- **A row with no live session is inert.** Leave it.

Then, before you touch anything shared — `harness/`, `.claude/`, the DAG,
another session's branch — **say so to the live peers first.** Nothing in the
harness will stop you colliding: the scheduler does not know hand-started
sessions exist, the guard sees only what a dispatched worker does, and no lock
covers these files. Naming the collision is the whole mechanism; there is no
other one.

Say it as an announcement or as a question, and know which. "I am taking
`bugs.gleam`" is an announcement and needs no reply. "Any objection? Otherwise
I proceed" is neither: it expires at your own next tool call, which only you
can see, so the peer cannot beat it. If you genuinely want an answer, name the
wall-clock moment the default fires — "I land at 20:45Z unless you say
otherwise" — so the peer can measure the deadline it is being held to.

## Red flags

| Thought | Reality |
|---|---|
| "I'll register once I know what I'm doing" | Registration is cheap and the session may not get a later moment. Do it first. |
| "The name in ListAgents tells me who that is" | It tells you an address. Names get recycled; identities do not. Look up the ref. |
| "That row looks stale, I'll tidy it" | Never delete a row. Nothing reads this file for liveness, so a stale row costs nothing and deleting one can cost a message. |
| "The report says a worktree is dirty, so someone crashed" | Or someone is typing in it right now. Ask before acting on it. |
| "No branches are unlanded, so nothing is stranded" | Check the *unpushed* section too. A landed-but-unpushed `main` is the one that bit this project. |
| "Nothing is claimed, so nothing is held" | A promise made only in a peer message — a build lock, an agreed file boundary — is a held claim that appears in no file. If a peer has gone quiet, assume its promises lapsed. |

## After this

Registration is a one-time step; keeping your work alive is not. Use
`/checkpoint` repeatedly for that — early, often, and never only at the end.
There is deliberately no teardown skill in this project, and `/checkpoint`
explains why.
