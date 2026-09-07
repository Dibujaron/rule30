#!/bin/sh
# Log one outbound peer message, on the sender's side, then let it go.
#
# Claude Code runs this as a PreToolUse hook for `SendMessage` (see
# .claude/settings.json), through Git Bash on Windows, with the hook's JSON
# on stdin. It appends one JSON line to the message log and exits 0 with
# nothing on stdout, which Claude Code reads as "no opinion": the send
# proceeds exactly as it would have without the hook.
#
# Why the send side: the guard is a PreToolUse hook too, and it sees only
# what its own worker DOES, never what a worker is TOLD. But a message is a
# tool call on the sender's side, and every sender that can reach a worker
# is a session started in this repo, so this is the one place the message
# is an action that a hook can see.
#
# THIS SCRIPT MUST NEVER BLOCK A SEND. A message that goes out unlogged is
# bad; a peer that cannot talk because a log directory is missing, python
# is not on PATH, or the JSON was odd is worse. So every failure here goes
# to stderr and the exit is still 0. Claude Code blocks a tool call only on
# exit 2, and nothing in this file exits 2.
#
# Where the line goes: $HARNESS_MESSAGE_LOG if set, else
# $CLAUDE_PROJECT_DIR/runs/messages.jsonl (Claude Code sets
# CLAUDE_PROJECT_DIR for hooks), else <this repo>/runs/messages.jsonl,
# found from this script's own location. The directory is created if it is
# missing.
#
# The line:
#   {"ts":"<UTC ISO>","session_id":..,"cwd":..,"to":..,"summary":..,"message":..}
# `session_id` and `cwd` are the sender's; they are the identity we have.

log="${HARNESS_MESSAGE_LOG:-}"
if [ -z "$log" ]; then
  root="${CLAUDE_PROJECT_DIR:-}"
  if [ -z "$root" ]; then
    root=$(cd "$(dirname "$0")/../.." 2>/dev/null && pwd) || root=.
  fi
  log="$root/runs/messages.jsonl"
fi

python=""
for candidate in python python3; do
  if command -v "$candidate" >/dev/null 2>&1; then
    python="$candidate"
    break
  fi
done
if [ -z "$python" ]; then
  echo "log-message.sh: no python on PATH, so this message was NOT logged: $log" >&2
  exit 0
fi

# The program goes in through `-c`, not through stdin: stdin is still the
# hook's JSON, nothing above has read it, and python must inherit it whole.
# (A heredoc would have replaced it.) Every failure inside is caught and
# reported on stderr, and the process exits 0 on every path, including the
# ones python did not anticipate.
code=$(cat <<'PY'
import json, os, sys
from datetime import datetime, timezone

log = sys.argv[1]
try:
    # Bytes, decoded as UTF-8 by hand: Claude Code writes UTF-8, and python
    # on Windows would otherwise read stdin in the console codepage.
    hook = json.loads(sys.stdin.buffer.read().decode("utf-8", errors="replace"))
    tool_input = hook.get("tool_input") or {}
    line = {
        "ts": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "session_id": hook.get("session_id", ""),
        "cwd": hook.get("cwd", ""),
        "to": tool_input.get("to", ""),
        "summary": tool_input.get("summary", ""),
        "message": tool_input.get("message", ""),
    }
    directory = os.path.dirname(log)
    if directory:
        os.makedirs(directory, exist_ok=True)
    with open(log, "a", encoding="utf-8") as f:
        f.write(json.dumps(line, ensure_ascii=False) + "\n")
except Exception as e:
    sys.stderr.write("log-message.sh: this message was NOT logged to %s: %s\n" % (log, e))
sys.exit(0)
PY
)
"$python" -c "$code" "$log" || echo "log-message.sh: python failed, so this message may NOT have been logged: $log" >&2
exit 0
