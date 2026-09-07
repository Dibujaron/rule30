`log-message.sh` is the `PreToolUse` hook `.claude/settings.json` runs on every `SendMessage`: it appends one JSON line per outbound peer message (UTC time, the sender's `session_id` and `cwd`, `to`, `summary`, `message`) to `runs/messages.jsonl`, or to `$HARNESS_MESSAGE_LOG` when that is set, and never blocks the send.
A session loads project settings when it starts, so a session that was already running when this landed must be restarted to pick the hook up; until then its messages go out unlogged.
A dispatched prover or seeder cannot send at all: its guard denies `SendMessage`, so its record of a refused send is the `not_permitted` row in the attempt's `events.jsonl`, not a line here.

`session-title.sh` runs on every prompt (`UserPromptSubmit`) and returns the
session's identity as its title, looked up by the `claude_session` UUID that
`/startup` records on the row in `agents/sessions.json`. That title is what the
terminal window shows and what ListAgents calls the session, so a registered
session is addressable by identity. Rows without the field get no title.
