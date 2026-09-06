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

# --- 1. Work that exists on one disk -----------------------------------------
# The highest-value line in this report. On 2026-09-06 `main` sat eight commits
# ahead of its remote while three sessions cited shas that were on one disk.
echo "== COMMITS ON THIS DISK ONLY (reachable from no remote ref) =="
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
echo

# --- 2. Work that never landed -----------------------------------------------
echo "== BRANCHES NOT MERGED INTO origin/main (unlanded findings) =="
found=0
while read -r branch; do
  [ "$branch" = "main" ] && continue
  git merge-base --is-ancestor "$branch" origin/main 2>/dev/null && continue
  ahead=$(git rev-list --count origin/main.."$branch" 2>/dev/null || echo '?')
  last=$(git log -1 --format='%cr' "$branch")
  printf '  %-34s %s commit(s), last %s\n' "$branch" "$ahead" "$last"
  found=1
done < <(git for-each-ref --format='%(refname:short)' refs/heads)
[ "$found" -eq 0 ] && echo "  (none — every branch is in origin/main)"
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
  printf '  %-46s %s file(s) on %s\n' "$path" "$dirty" "$branch"
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
    who=$(printf '%s' "$rec" | grep -oE '"identity":"[^"]*"' | tail -1 | sed 's/.*:"//; s/"//')
    if [ -n "$who" ]; then
      printf '  dag node   %-34s last attempt by %s
' "$n" "$who"
    else
      printf '  dag node   %-34s claimed with no attempt recorded
' "$n"
    fi
    found=1
  done < <(sed 's/{"id":/\n{"id":/g' blueprint/dag.json)
fi
if [ -f blueprint/bugs.json ]; then
  while read -r rec; do
    case "$rec" in *'"status": "claimed"'*|*'"status":"claimed"'*) ;; *) continue ;; esac
    b=$(printf '%s' "$rec" | grep -oE '^\{ *"id": *"[^"]*"' | sed 's/.*"id": *"//; s/"//')
    printf '  bug        %s\n' "${b:-<unparsed>}"
    found=1
  done < <(sed 's/{ *"id":/\n{"id":/g' blueprint/bugs.json)
fi
[ "$found" -eq 0 ] && echo "  (none claimed)"
cat <<'NOTE'
  A claim does NOT record a session ref, so nothing here can be checked
  automatically against ListAgents. Ask the named identity whether it is still
  working. If its session is gone: `gleam run -- reopen <node>` for a node; a
  bug has no reopen yet (see `a-claimed-bug-has-no-reopen`).

  A promise made only in a peer message — a held build lock, an agreed file
  boundary — appears NOWHERE in this report and cannot. If a peer has gone
  quiet, assume its promises lapsed rather than that it is still holding them.
NOTE
echo

# --- 5. Who is supposed to be here -------------------------------------------
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
echo "  * a live ref with no row here is an UNKNOWN SESSION — ask who it is"
echo "  * a row here with no live session is inert, not a problem; never delete it"
