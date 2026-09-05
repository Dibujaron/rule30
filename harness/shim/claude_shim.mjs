// Stdio shim between an Erlang port and `claude -p`.
//
// Erlang ports cannot half-close a child's stdin, and `claude -p` in
// stream-json input mode stays alive until its stdin closes. So the port
// talks to this shim instead. Every stdin line is forwarded to claude
// verbatim, except the single line `__EOF__`, which closes claude's stdin.
// claude's stdout is forwarded line-for-line; its stderr is forwarded to our
// stderr; and we exit with claude's exit code.
//
// Usage: node claude_shim.mjs <path-to-claude.exe> [claude args...]

import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const [, , exe, ...args] = process.argv;
if (!exe) {
  process.stderr.write("claude_shim: missing path to claude executable\n");
  process.exit(64);
}

const child = spawn(exe, args, {
  stdio: ["pipe", "pipe", "pipe"],
  env: process.env,
  windowsHide: true,
});

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
lines.on("line", (line) => {
  if (line === "__EOF__") {
    child.stdin.end();
    return;
  }
  child.stdin.write(line + "\n");
});
lines.on("close", () => {
  // Our own stdin went away (port closed): pass the EOF along.
  if (!child.stdin.destroyed) child.stdin.end();
});

child.on("exit", (code, signal) => {
  // Exit explicitly: the readline on our stdin would otherwise keep the
  // event loop alive, and the Erlang port would never see an exit status.
  process.stdout.write("", () => process.exit(code ?? (signal ? 128 : 1)));
});
child.on("error", (err) => {
  process.stderr.write(`claude_shim: failed to start claude: ${err.message}\n`);
  process.exit(127);
});
