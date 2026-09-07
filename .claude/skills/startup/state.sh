#!/usr/bin/env bash
# What the sessions before you left behind, derived from git rather than
# remembered by anyone. Run from any tree in the repo; it reports on all of
# them.
#
# This exists because the failure it reports on is, by construction, one no
# dying session can report on itself. A session that is killed, times out, or
# exhausts context leaves its work exactly where it was and says nothing. The
# only thing that can see it is a *different* session, looking from outside,
# at state the dead one could not have cleaned up even in principle.
#
# Read-only. No fetch, no checkout, no ref moves. Safe to run at any time,
# including while a harness run is in flight.

set -u
cd "$(git rev-parse --show-toplevel)" || exit 1
GIT_COMMON=$(git rev-parse --git-common-dir)
MAIN_ROOT=$(cd "$GIT_COMMON/.." && pwd -P)
cd "$MAIN_ROOT" || exit 1

echo "REPO STATE  $(date -u +%Y-%m-%dT%H:%M:%SZ)  (read-only; remote data is as of your last fetch)"
echo

# "2h 05m ago" from an ISO-8601 `Z` timestamp or a Unix epoch. Age is the one
# property of a held thing that can be read without the holder's cooperation,
# so every held row below carries it: a claim with no age looks busy forever,
# a claim that says "3h ago" looks like what it probably is.
ago() {
  local then now m
  case "$1" in
    *Z) then=$(date -u -d "$1" +%s 2>/dev/null) ;;
    *)  then=$1 ;;
  esac
  if [ -z "${then:-}" ]; then echo "age unknown"; return; fi
  now=$(date -u +%s)
  m=$(( (now - then) / 60 ))
  if [ "$m" -ge 60 ]; then echo "$((m / 60))h $((m % 60))m ago"; else echo "${m}m ago"; fi
}

# --- 1. Work that exists on one disk -----------------------------------------
# The highest-value line in this report. On 2026-09-06 `main` sat eight commits
# ahead of its remote while three sessions cited shas that were on one disk.
echo "== YOURS TO FIX: COMMITS ON THIS DISK ONLY (reachable from no remote ref) =="
found=0
while read -r branch; do
  # `--not --remotes` is the point: a branch can be far "ahead of its own
  # remote branch" while every one of those commits is already on
  # origin/main under a different ref, which is not stranded and must not be
  # reported as such. What matters is a commit no remote ref can reach.
  stranded=$(git rev-list --count "$branch" --not --remotes)
  [ "$stranded" -eq 0 ] && continue
  who=$(git log -1 --format='%an, %cr' "$branch")
  printf '  %-34s %s commit(s) — %s
' "$branch" "$stranded" "$who"
  found=1
done < <(git for-each-ref --format='%(refname:short)' refs/heads)
[ "$found" -eq 0 ] && echo "  (none — every local commit is reachable from some remote ref)"
echo "  This is the section a session can empty by itself, and the only one that"
echo "  means work is at risk. If your branch is here, you are not checkpointed."
echo

# --- 2. Work that never landed -----------------------------------------------
echo "== SOMEONE ELSE'S QUEUE: BRANCHES PUSHED BUT NOT IN origin/main =="
found=0
while read -r branch; do
  [ "$branch" = "main" ] && continue
  # `git cherry` and not `merge-base --is-ancestor`. A commit that was
  # cherry-picked onto main is landed, and its content is safe, but it is not
  # an ancestor of anything — so an ancestry test reports every cherry-picked
  # branch as unlanded forever. `git cherry` compares patch ids: `+` is a
  # commit whose change is genuinely not upstream, `-` is one already applied
  # under a different sha.
  unlanded=$(git cherry origin/main "$branch" 2>/dev/null | grep -c '^+')
  [ "$unlanded" -eq 0 ] && continue
  last=$(git log -1 --format='%cr' "$branch")
  printf '  %-34s %s commit(s) not upstream, last %s
' "$branch" "$unlanded" "$last"
  found=1
done < <(git for-each-ref --format='%(refname:short)' refs/heads)
[ "$found" -eq 0 ] && echo "  (none — every branch's changes are in origin/main)"
echo "  A handoff, not a failure. Only whoever holds main can empty this, so a"
echo "  session running /checkpoint must NOT expect its own branch to be absent"
echo "  here. Pushed-but-unlanded is waiting; on-one-disk is at risk."
echo "  KNOWN LIMIT: a commit landed by a cherry-pick whose CONFLICT had to be"
echo "  resolved keeps a different patch id and stays listed here forever, even"
echo "  though its content is on main. Before chasing a row, compare content —"
echo "  the commit may already be landed under a resolution that changed it."
echo

# --- 3. Work that is not even a commit ---------------------------------------
# A worktree with uncommitted changes is either someone working right now or
# someone who died mid-edit, and this cannot tell you which. Ask the session.
echo "== WORKTREES WITH UNCOMMITTED CHANGES =="
found=0
while read -r path; do
  [ -z "$path" ] && continue
  dirty=$(git -C "$path" status --porcelain -uall 2>/dev/null | wc -l | tr -d ' ')
  [ "$dirty" = "0" ] && continue
  branch=$(git -C "$path" rev-parse --abbrev-ref HEAD 2>/dev/null)
  # When the newest dirty file was last written. "2m ago" is someone typing;
  # "3h ago" with no live session is a death. Neither is proof — a session
  # can sit in a long `lake build` between its last edit and its commit — but
  # age is the one thing about this state that the observer can measure.
  newest=0
  while IFS= read -r line; do
    f=${line:3}
    f=${f##* -> }
    f=${f#\"}
    f=${f%\"}
    t=$(stat -c %Y -- "$path/$f" 2>/dev/null) || continue
    [ "$t" -gt "$newest" ] && newest=$t
  done < <(git -C "$path" status --porcelain -uall 2>/dev/null)
  if [ "$newest" -gt 0 ]; then
    age="last written $(ago "$newest")"
  else
    age="only deletions, nothing on disk to date"
  fi
  printf '  %-46s %s file(s) on %s, %s\n' "$path" "$dirty" "$branch" "$age"
  found=1
done < <(git worktree list --porcelain | awk '/^worktree /{print $2}')
[ "$found" -eq 0 ] && echo "  (none — every worktree is clean)"
echo

# --- 4. Claims held by sessions that may not exist ----------------------------
# The one kind of stranded state that loses a PEER rather than losing work. A
# dead session releases nothing: its claimed DAG node stays claimed, its
# claimed bug stays claimed, and a sibling waiting on either waits forever with
# nothing on disk to say why. Work is recoverable by reading; a peer stuck in a
# wait state is not, because it will not go looking.
echo "== HELD CLAIMS (a dead holder releases nothing) =="
found=0
if [ -f blueprint/dag.json ]; then
  # One node per line first. dag.json is a single line, so an unanchored grep
  # for the holder would happily return the last identity in the whole file.
  while read -r rec; do
    case "$rec" in *'"status":"claimed"'*) ;; *) continue ;; esac
    n=$(printf '%s' "$rec" | grep -oE '^\{"id":"[^"]*"' | sed 's/.*:"//; s/"//')
    # The node's own record cannot date the claim: an attempt row is appended
    # when the attempt ENDS, so a node claimed by a live run has no row for
    # it yet and looks exactly like one whose dispatcher died before writing.
    # The dispatch event in runs/ is written when the attempt starts, and it
    # is the only timestamp a claim has. Latest one for this node wins.
    ev=$(grep -h "\"kind\":\"dispatch\",\"node\":\"$n\"" runs/*/events.jsonl 2>/dev/null | tail -1)
    who=$(printf '%s' "$ev" | grep -oE '"identity":"[^"]*"' | sed 's/.*:"//; s/"//')
    at=$(printf '%s' "$ev" | grep -oE '"ts":"[^"]*"' | sed 's/.*:"//; s/"//')
    if [ -n "$who" ]; then
      printf '  dag node   %-34s dispatched to %s at %s (%s)\n' \
        "$n" "$who" "$at" "$(ago "$at")"
    else
      printf '  dag node   %-34s claimed, and no dispatch event in runs/ names it\n' "$n"
    fi
    found=1
  done < <(sed 's/{"id":/\n{"id":/g' blueprint/dag.json)
fi
if [ -f blueprint/bugs.json ]; then
  while read -r rec; do
    case "$rec" in *'"status": "claimed"'*|*'"status":"claimed"'*) ;; *) continue ;; esac
    b=$(printf '%s' "$rec" | grep -oE '^\{ *"id": *"[^"]*"' | sed 's/.*"id": *"//; s/"//')
    # `bugs claim` stamps both of these; a hand edit of the file stamps
    # neither, and that absence is itself information about how it was
    # claimed.
    who=$(printf '%s' "$rec" | grep -oE '"claimed_by": *"[^"]*"' | sed 's/.*: *"//; s/"//')
    since=$(printf '%s' "$rec" | grep -oE '"claimed_at": *"[^"]*"' | sed 's/.*: *"//; s/"//')
    # Only a `bugs claim --session <ref>` stamps this one. When it is there
    # it is the holder's ListAgents ref, the one thing liveness can be
    # checked against by eye.
    ref=$(printf '%s' "$rec" | grep -oE '"claimed_ref": *"[^"]*"' | sed 's/.*: *"//; s/"//')
    if [ -n "$who" ]; then
      printf '  bug        %-34s claimed by %s since %s (%s)%s\n' \
        "${b:-<unparsed>}" "$who" "${since:-?}" "$(ago "${since:-}")" \
        "${ref:+ [ref $ref]}"
    else
      printf '  bug        %-34s claimed by hand, no holder or time recorded\n' "${b:-<unparsed>}"
    fi
    found=1
  done < <(sed 's/{ *"id":/\n{"id":/g' blueprint/bugs.json)
fi
[ "$found" -eq 0 ] && echo "  (none claimed)"
cat <<'NOTE'
  A bug claim made with `--session` carries the holder's ListAgents ref,
  printed above as `[ref ...]`: compare it against ListAgents by eye. A DAG
  node claim, and a bug claim made without `--session`, still record no ref,
  so nothing about them can be checked automatically — ask the named identity
  whether it is still working. If its session is gone: `gleam run -- reopen
  <node>` for a node, `gleam run -- bugs reopen <id>` for a bug.

  A promise made only in a peer message — a held build lock, an agreed file
  boundary — appears NOWHERE in this report and cannot. If a peer has gone
  quiet, assume its promises lapsed rather than that it is still holding them.
NOTE
echo

# --- 5. Sessions that must not be messaged -----------------------------------
# A dispatched prover, theorist or seeder is absent from agents/sessions.json
# by design, so it shows in ListAgents as a bare name with no row — the exact
# shape Job 3 calls an unknown session and says to message. On 2026-09-07 a
# framework session did, five minutes after starting, into a live theorist;
# the arrival left no record, the guard denied the reply, and a turn was
# lost. The attempt's events.jsonl is the one thing that can tell them
# apart: a guarded session writes an event per tool call and has no
# summary.txt until it ends. Five runs from 2026-09-05/06 never wrote a
# summary at all, so absence of one is not enough on its own; recency is
# the test, and the window is generous because a theorist can think for a
# while between calls.
echo "== LIVE GUARDED SESSIONS (dispatched; absent from sessions.json by design; NEVER message one) =="
found=0
runs_root=${STARTUP_RUNS:-runs}
window_m=30
now=$(date -u +%s)
for ev in "$runs_root"/*/*/events.jsonl; do
  [ -f "$ev" ] || continue
  attempt=${ev%/events.jsonl}
  run=${attempt%/*}
  [ -f "$run/summary.txt" ] && continue
  [ -f "$attempt/summary.txt" ] && continue
  last=$(tail -1 "$ev" | grep -oE '"ts": *"[^"]*"' | head -1 | sed 's/.*: *"//; s/"//')
  [ -n "$last" ] || continue
  then=$(date -u -d "$last" +%s 2>/dev/null) || continue
  m=$(( (now - then) / 60 ))
  [ "$m" -le "$window_m" ] || continue
  printf '  %-40s last event %s (%s), no summary.txt
'     "${attempt#"$runs_root"/}" "$last" "$(ago "$last")"
  found=1
done
[ "$found" -eq 0 ] && echo "  (none — no attempt has written an event in the last ${window_m}m without a summary)"
cat <<'NOTE'
  Each row is a session started by the harness — a prover, a theorist or a
  seeder — that is live or was within the window. It has no row in
  agents/sessions.json and never will. A message to it reaches a worker as
  an instruction from outside its brief, is recorded nowhere in its events,
  and cannot be taken back. Match a rowless ListAgents ref against these by
  start time before treating it as unknown.
NOTE
echo

# --- 6. Who is supposed to be here -------------------------------------------
# Printed so you can diff it against ListAgents by eye. This file cannot know
# who is alive and does not try; ListAgents is the only authority on that.
echo "== REGISTERED SESSIONS (agents/sessions.json — NOT a liveness list) =="
if [ -f agents/sessions.json ]; then
  grep -oE '"(identity|session_name|ref|started)": *"[^"]*"' agents/sessions.json \
    | sed 's/"[a-z_]*": *//; s/"//g' | paste - - - - \
    | awk -F'\t' '{printf "  %-10s %-14s [%s]  since %s\n", $1, $2, $3, $4}'
else
  echo "  agents/sessions.json not found"
fi
echo
echo "Cross-reference these against ListAgents yourself:"
echo "  * a live ref with no row here, started when a LIVE GUARDED SESSION above"
echo "    did, is that session — never message it"
echo "  * any other live ref with no row here is an UNKNOWN SESSION — ask who it is"
echo "  * a row here with no live session is inert, not a problem; never delete it"
