# harness

The dispatcher for this repository's proof effort: a Gleam program on the
Erlang target that reads the DAG of theorem statements in
`blueprint/dag.json`, picks a node, runs one Claude Code CLI session against
it as a named identity, verifies the result with `lake` from outside that
session, and records what happened. Everything an agent says is logged
verbatim under `runs/<run-id>/`.

```sh
gleam run -- status              # every node, then the open leaves in dispatch order
gleam run -- prove-one <node-id> # dispatch one worker at one node
gleam run -- reopen <node-id>    # put a node a crashed run left `claimed` back on the board
gleam test                       # the whole suite; nothing here spends the subscription
```

`prove-one` spends Dib's Claude subscription. The tests do not: the worker's
turn loop is driven offline through `test/fake_shim.mjs`.

The design is `docs/superpowers/specs/2026-09-05-harness-design.md`; the
conventions every worker is held to, and the guard that enforces them, are in
`CLAUDE.md` at the repository root.
