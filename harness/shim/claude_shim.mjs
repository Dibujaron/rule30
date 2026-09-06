// Stdio shim between an Erlang port and `claude -p`.
//
// Erlang ports cannot half-close a child's stdin, and `claude -p` in
// stream-json input mode stays alive until its stdin closes. So the port
// talks to this shim instead. Every stdin line is forwarded to claude
// verbatim, except the single line `__EOF__`, which closes claude's stdin.
// claude's stdout is forwarded line-for-line; its stderr is forwarded to our
// stderr; and we exit with claude's exit code.
//
// Shutdown is the other half of the job. `erlang:port_close/1` terminates
// *this* process; it knows nothing about claude, which on Windows would
// survive as an orphan holding its tools and — with the guard's HTTP
// endpoint gone — hooks that now fail closed but were still attached to a
// live session. So whenever our own stdin goes away or we are signalled, we
// close claude's stdin, give it a short grace to exit on its own, and then
// take its whole process tree.
//
// Usage: node claude_shim.mjs <path-to-claude.exe> [claude args...]

import { spawn, spawnSync } from "node:child_process";
import { createInterface } from "node:readline";

const [, , exe, ...args] = process.argv;
if (!exe) {
  process.stderr.write("claude_shim: missing path to claude executable\n");
  process.exit(64);
}

/// How long claude gets to exit on its own after its stdin is closed.
const graceMs = 2000;

const child = spawn(exe, args, {
  stdio: ["pipe", "pipe", "pipe"],
  env: process.env,
  windowsHide: true,
});

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

let ending = false;

function killTree() {
  if (child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === "win32" && child.pid) {
    // `child.kill()` on Windows reaches the launcher only: claude spawns its
    // own children, so the tree is what has to go.
    const r = spawnSync("taskkill", ["/T", "/F", "/PID", String(child.pid)], {
      stdio: "ignore",
      windowsHide: true,
    });
    if (r.error) {
      process.stderr.write(`claude_shim: taskkill unavailable (${r.error.code}); falling back to child.kill()\n`);
    }
  }
  child.kill();
}

// Close claude's stdin, wait `graceMs` for it to leave politely, then kill
// the tree and exit. The timer is deliberately not `unref`ed: this process
// must stay alive long enough to enforce the kill.
function endChild(signal) {
  if (ending) return;
  ending = true;
  if (!child.stdin.destroyed) child.stdin.end();
  setTimeout(() => {
    killTree();
    process.exit(signal ? 128 : (child.exitCode ?? 1));
  }, graceMs);
}

const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
lines.on("line", (line) => {
  if (line === "__EOF__") {
    if (!child.stdin.destroyed) child.stdin.end();
    return;
  }
  child.stdin.write(line + "\n");
});
lines.on("close", () => {
  // Our own stdin went away (the port closed): pass the EOF along, then make
  // sure claude actually goes.
  endChild(null);
});

for (const signal of ["SIGTERM", "SIGINT", "SIGBREAK"]) {
  process.on(signal, () => endChild(signal));
}

child.on("exit", (code, signal) => {
  // Exit explicitly: the readline on our stdin would otherwise keep the
  // event loop alive, and the Erlang port would never see an exit status.
  process.stdout.write("", () => process.exit(code ?? (signal ? 128 : 1)));
});
child.on("error", (err) => {
  process.stderr.write(`claude_shim: failed to start claude: ${err.message}\n`);
  process.exit(127);
});
