---
name: take-bug
description: Use when picking a row off blueprint/bugs.json to work - claims it with a holder, a time and a session ref, and checks the bug's premise against the code at HEAD before any fix is planned.
---

# Take a bug

**Announce:** "Using the take-bug skill to claim `<id>` and check its premise."

A bug body is prose, and nobody adjudicates prose. This project has exactly
one adjudicator, `lake build`, and it only ever looks at proofs. So a bug
report that is false reads exactly like one that is true: it consumes a
task, ships code, and leaves doc comments behind that are worse than none.
That has happened here, more than once, in one evening
(`a-bugs-premise-is-never-checked-before-it-is-fixed`). This skill is the
discipline with a place to record it.

## 1. Claim it, with something a peer can check

```bash
cd harness && gleam run -- bugs claim <id> --as <You> --session <ref>
```

`<ref>` is the six characters `ListAgents` prints on its first line for
this session. A claim with a holder and a time can be seen to be stale; a
claim with a ref can be checked against `ListAgents` without asking anyone.
A hand edit of the file records none of the three and is the one way to
claim a bug that this skill forbids.

Then say so to the live peers, as an announcement: "I am taking `<id>`;
files I expect to touch are X, Y." Nothing in the harness will stop two
framework agents colliding; naming the collision is the whole mechanism.

## 2. Check the premise before planning anything

The body describes the code as it was when the row was filed. Rows outlive
fixes: on 2026-09-07 a row marked NEEDS DIB had been fixed by a commit five
minutes after it was filed and sat open for seven hours because its own
text said the fix needed asking, and nobody asked the file.

So, before a plan:

- **Find the line the body names, at HEAD.** If it names none, find the one
  it should have named. A claim about how the harness behaves today
  carries a `file:line` that shows it, and you check that line now, not at
  filing time and not at close time.
- **Run the reproduction, or the command that would show the premise.**
  Paste the command and what it printed into your notebook entry for this
  bug. The command is the check; the paste is the record. If what settled
  the question was a conversation with a peer rather than a command, the
  question is not settled
  (`peer-review-that-is-agreement-does-not-check-premises`).
- **If the premise is gone, find who removed it.** `git log -S'<the
  sentence or symbol>'` on the file. Close the row against that sha with
  `bugs close <id> fixed --resolution "<sha> (<who>): ..."` and say plainly
  that it was closed on a premise check, not fixed. That is a good outcome
  and a fast one.
- **If the premise is half right, amend the body before fixing.** A fix
  planned against a wrong body is the failure this skill exists for, and
  the amendment is what the next reader needs even if you then die.

Two shapes, and the check above only catches the first. Shape A is a
premise nobody checked. Shape B is a premise somebody *did* check, against
a transcription rather than the original, and that one reads more
authoritative than an unchecked claim while being just as wrong. The
defence against B is not to retype: quote the artifact by `git show
<sha>:<path>` or by file and line, never from memory or from a message
about the file.

## 3. Name the closure test before the fix

Write one sentence in your notebook: "this row closes when `<command>`
shows `<result>`." If you cannot write it, you do not yet know what the
bug is, and a fix you cannot test for is a fix you cannot tell from a
no-op. A row's own body sometimes names it (`offline-fixtures-write-into-
the-live-checkout` closes when `HARNESS_REPO_ROOT` stops being needed);
when it does, that is the test, not your paraphrase of it.

## 4. Fix it where the rules say

A worktree branched from `origin/main`, the base commit named in the first
commit message, the suite run with its announced total checked against
passed plus failures, `/checkpoint` at minute ten. All of that is in
`CLAUDE.md` and is not repeated here.

## 5. Close it against a sha that is on the remote

```bash
cd harness && gleam run -- bugs close <id> fixed --resolution "<sha> (<You>): <what changed and what the closure test showed>"
```

Or `wontfix`, with the reason. A resolution that cites a sha reachable
from no remote ref points at nothing the next reader can open. The claim
fields stay on a closed row on purpose: they are the record of who worked
it.

## Red flags

| Thought | Reality |
|---|---|
| "The body says X, so X is true" | The body says X was true when it was filed. Check the line at HEAD. |
| "A peer confirmed it" | Two agents agreeing is the cheapest thing two agents can produce, and it is indistinguishable from verification from outside. Run the command. |
| "I'll verify the premise once I understand the fix" | The order is the whole point. A plan built on a false premise is a plan for the wrong bug. |
| "I checked it earlier today" | Against what? If it was a retyping, a scratch file, or a message, it was not the artifact. |
| "The row says it needs Dib, so it waits" | The row says the *fix* needs Dib. Whether the fix already landed is a `git log -S` away. |
| "I'll claim it once I've got somewhere" | An unclaimed row two agents are both working is the collision this project cannot detect. Claim first. |
| "I'll close it when I understand it fully" | Close what you verified. Amend the body with what you did not. A row that is half right is more useful than a row that is silent. |
