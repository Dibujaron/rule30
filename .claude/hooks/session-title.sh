#!/bin/sh
# UserPromptSubmit hook: hand the prompt event to session-title.py, which
# returns this session's identity as its title. Nothing else lives here on
# purpose: a UserPromptSubmit hook that exits 2 BLOCKS the prompt, and a shell
# syntax error exits 2, so this wrapper is kept too small to break and exits 0
# on every path. The Python is in its own file so no quoting can reach it.
root="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
SESSIONS_FILE="$root/agents/sessions.json"
export SESSIONS_FILE
py=$(command -v python 2>/dev/null || command -v python3 2>/dev/null) || exit 0
"$py" "$root/.claude/hooks/session-title.py" 2>/dev/null
exit 0
