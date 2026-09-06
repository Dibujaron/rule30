---
name: checkpoint
description: Use repeatedly during a session in this repo - at any natural pause, after any finding, and never only at the end - to get everything you have learned onto disk and onto the remote while you still exist.
---

# Checkpoint

**Announce:** "Checkpointing — getting what I have so far onto the remote."

**Run this early and run it often. Running it at minute ten is correct.**
If you find yourself thinking "I'll checkpoint when I'm done", that is the
failure this skill exists to prevent, and the name is deliberate: there is no
`/teardown` in this project, on purpose.

## Why there is no teardown

A cleanup step at the end of a session is fiction. Sessions are killed, time
out, and exhaust context far more often than they exit cleanly, so a step that
only runs on a clean exit protects only the case that was never at risk. This
is not a stylistic preference; it is in `CLAUDE.md` under Boundaries, and the
project has the instance that proves it.

On 2026-09-06 a framework session found a real bug in the test runner's
reporting, wrote it into its notebook as it went, said twice that it deserved
a board entry — and died before filing. **The notebook survived because it was
written continuously. The filing was lost because it was deferred to the end.**
Both halves belonged to the same session and the same hour. Only the
continuous half exists.

The danger of a flush-at-the-end command is not that it fails. It is that its
existence teaches you it is safe to defer, and deferring is the thing that
kills work.

## What to flush

Four kinds, in the order they are lost:

1. **Uncommitted changes.** Commit them. A commit is the cheapest thing that
   survives you. Explain *why* in the message — the file states the current
   contract, the commit message carries the story.
2. **Commits not on the remote.** Push. A commit on one disk is one dead
   session away from never having happened; this is the failure that stranded
   two branches for several hours on 2026-09-06.
3. **Notebook entries.** `agents/<YourName>.md`. Write what you were **wrong**
   about, not just what you did — a notebook of accomplishments teaches your
   successor nothing. This is the one item with a proven survival record; keep
   it continuous.
4. **Board findings.** `blueprint/bugs.json`. Friction you hit and did not
   file did not happen, as far as anyone after you is concerned. If you fixed
   it, close it against a sha that is **on the remote**, or the citation points
   at nothing.

Then verify rather than assume:

```bash
bash .claude/skills/startup/state.sh
```

Your own branch should be absent from the first three sections. If it is not,
you are not checkpointed, whatever you just did.

## What checkpoint cannot do, and you must not expect it to

**You can flush what a session HAS. You cannot flush what a session HOLDS.**
That distinction is the whole limit of this skill.

A claim is not a file, and no command you run about yourself releases one when
you die:

- A **claimed DAG node** stays claimed. `gleam run -- reopen <node>` is the
  manual undo, and only a *different*, living session can run it.
- A **claimed bug** stays claimed, and has no reopen at all
  (`a-claimed-bug-has-no-reopen`).
- A **promise made only in a peer message** — "I hold the build lock", "I will
  stay out of `guard.gleam`" — exists in two context windows and nowhere on
  disk. If you die holding one, the peer waiting on it waits forever with
  nothing anywhere to say why.

That last one is the expensive kind. The other three lose *work*, and work is
recoverable by reading — a lost finding was once recovered out of a dead
session's notebook hours later. A held claim loses *a peer*, and that is not
recoverable by reading anything, because the peer is sitting in a wait state
and will not go looking.

**So when you hold something, do not plan to release it. Make it releasable
without you:** say the promise's expiry when you make it ("I have the lock
until I message you, and if I go quiet for twenty minutes assume it is free"),
and prefer a claim someone else can see is stale over one that merely has an
owner. `/startup` reports held claims for exactly this reason — the check has
to live in the session that comes *after* the one that died.

## Red flags

| Thought | Reality |
|---|---|
| "I'll checkpoint once this is finished" | The unfinished state is what checkpointing is for. Now. |
| "It's committed, so it's safe" | Committed is not pushed. Check section 1 of the state report. |
| "I'll write the notebook up properly at the end" | This is the exact failure that cost this project a finding. Write it now, badly if necessary. |
| "The bug isn't worth filing until I understand it" | File what you observed. An unfiled finding is indistinguishable from one that never happened. |
| "I told my peer I'd release the lock when I'm done" | If you die, you never say it. Give the promise an expiry when you make it. |
| "I ran checkpoint, so the session is safe to lose" | It is safe to lose the *work*. Anything you are holding is still held. |
