"""UserPromptSubmit hook body: return this session's identity as its title.

Reads the hook JSON on stdin, finds the row in agents/sessions.json whose
`claude_session` equals the session id, and prints the JSON Claude Code
reads a session title from. The title is the identity alone, because
Claude Code also uses it as the session's ListAgents name, so
`SendMessage Keel` reaches Keel and no address carries punctuation.

Prints nothing when there is no such row, and never raises: the wrapper
exits 0 regardless, but a clean exit here keeps stderr quiet too. A hook
that fails loudly on every prompt is worse than a window with the wrong
title, which is the whole reason this lives in a .py file rather than
inside a shell string.
"""
import json
import os
import sys


def main() -> None:
    try:
        hook = json.load(sys.stdin)
        sid = hook.get("session_id", "")
        path = os.environ.get("SESSIONS_FILE", "")
        with open(path, encoding="utf-8") as f:
            rows = json.load(f)["sessions"]
        row = next(r for r in rows if r.get("claude_session") == sid)
        out = {
            "hookSpecificOutput": {
                "hookEventName": "UserPromptSubmit",
                "sessionTitle": row["identity"],
            }
        }
        print(json.dumps(out))
    except Exception:
        return


if __name__ == "__main__":
    main()
