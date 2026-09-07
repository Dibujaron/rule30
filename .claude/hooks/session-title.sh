#!/bin/sh
# UserPromptSubmit hook: title this session's terminal window after the
# identity that registered it.
#
# Claude Code repaints the terminal title continuously (a spinner plus a
# generated summary), so setting the console title from a shell is overwritten
# within a second. What it does honour is a `sessionTitle` returned by this
# hook, which sits at the top of its title precedence. The identity comes from
# agents/sessions.json: /startup records the Claude session UUID on the row it
# writes (`claude_session`), and this hook looks the current session up by it.
#
# Never blocks a prompt: no row, no python, or a broken file all mean "print
# nothing and exit 0", which leaves the title as Claude Code would have it.
# The hook body reaches python through an environment variable rather than a
# heredoc, because a heredoc would replace the stdin the JSON arrived on.
HOOK_INPUT=$(cat)
export HOOK_INPUT
SESSIONS_FILE="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}/agents/sessions.json"
export SESSIONS_FILE
py=$(command -v python 2>/dev/null || command -v python3 2>/dev/null) || exit 0
"$py" -c '
import json, os
try:
    hook = json.loads(os.environ["HOOK_INPUT"])
    sid = hook.get("session_id", "")
    rows = json.load(open(os.environ["SESSIONS_FILE"], encoding="utf-8"))["sessions"]
    row = next(r for r in rows if r.get("claude_session") == sid)
    # The identity alone: Claude Code also uses this title as the session's
    # ListAgents name, so `SendMessage Keel` reaches Keel. A session name
    # in the title would put spaces and punctuation in every address.
    title = row["identity"]
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "UserPromptSubmit", "sessionTitle": title}}))
except Exception:
    pass
' 2>/dev/null
exit 0
