// A scripted stand-in for `shim/claude_shim.mjs`, so the worker's turn loop
// can be driven offline.
//
// It is launched exactly as the real shim is — `node fake_shim.mjs
// <path-to-claude.exe> [claude args...]` — and ignores every one of those
// arguments. What it says instead comes from a script file:
//
//   HARNESS_FAKE_SCRIPT   path to a JSON array of "turns". Each turn is an
//                         array of stdout lines, emitted after the next
//                         stdin user message. Turns are consumed in order;
//                         once they run out, a further message gets silence
//                         (which is what a turn timeout looks like).
//   HARNESS_FAKE_MARKER   optional path. Written when the harness sends the
//                         `__EOF__` sentinel, so a test can prove the
//                         session was closed rather than orphaned.
//   HARNESS_FAKE_KILLED   optional path. Written when this process is shut
//                         down from outside — our stdin closing (the Erlang
//                         port was closed) or a signal — which is where the
//                         real shim kills claude's process tree. A test that
//                         sees this marker knows the child is gone rather
//                         than orphaned.
//   HARNESS_FAKE_ARGS     optional path. Written at startup with the JSON
//                         array of arguments this process was given, so a
//                         test can see the `--max-turns` the harness chose.
//   HARNESS_FAKE_IGNORE_EOF  when set, `__EOF__` is recorded but not obeyed,
//                         so a test can drive the harness's escalation from
//                         "close politely" to "kill".
//
// Three sentinels may appear inside a turn's lines:
//
//   __EXIT__      exit 0 after flushing what came before it
//   __EXIT__ <n>  exit with status <n>
//   __WRITE__ <path>\t<content>
//                 write <content> to <path> (creating its directory) and
//                 emit nothing — a session writing the one file it is
//                 fenced to, at the moment in the conversation it would
//
// which is how a test scripts a CLI that dies mid-conversation, or a
// theorist that writes its attack document during the session rather than
// before it — where a file already at the path would move the fence.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createInterface } from "node:readline";

const scriptPath = process.env.HARNESS_FAKE_SCRIPT;
const markerPath = process.env.HARNESS_FAKE_MARKER;
const killedPath = process.env.HARNESS_FAKE_KILLED;
const ignoreEof = !!process.env.HARNESS_FAKE_IGNORE_EOF;
const argsPath = process.env.HARNESS_FAKE_ARGS;

// The one thing recorded about the ignored arguments: what they were. A
// test that sets HARNESS_FAKE_ARGS can then prove which ceilings the
// harness actually launched the session under.
if (argsPath) writeFileSync(argsPath, JSON.stringify(process.argv.slice(2)));

if (!scriptPath) {
  process.stderr.write("fake_shim: HARNESS_FAKE_SCRIPT is not set\n");
  process.exit(64);
}

let turns;
try {
  turns = JSON.parse(readFileSync(scriptPath, "utf8"));
} catch (err) {
  process.stderr.write(`fake_shim: cannot read ${scriptPath}: ${err.message}\n`);
  process.exit(65);
}

let next = 0;

function leave(status) {
  // Flush before exiting: the Erlang port must see the lines, then the
  // exit status, in that order.
  process.stdout.write("", () => process.exit(status));
}

// The real shim's shutdown path: stdin gone, or a signal, means kill the
// child and go. There is no child here, so record that it happened.
function shutDown(reason) {
  if (killedPath) writeFileSync(killedPath, reason + "\n");
  leave(0);
}

const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });

lines.on("line", (line) => {
  if (line === "__EOF__") {
    if (markerPath) writeFileSync(markerPath, "__EOF__\n");
    if (!ignoreEof) leave(0);
    return;
  }
  const turn = turns[next++] ?? [];
  for (const out of turn) {
    if (out === "__EXIT__" || out.startsWith("__EXIT__ ")) {
      const status = out === "__EXIT__" ? 0 : Number(out.slice(9).trim());
      leave(Number.isFinite(status) ? status : 0);
      return;
    }
    if (out.startsWith("__WRITE__ ")) {
      const tab = out.indexOf("\t");
      const path = tab < 0 ? out.slice(10) : out.slice(10, tab);
      const content = tab < 0 ? "" : out.slice(tab + 1);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
      continue;
    }
    process.stdout.write(out + "\n");
  }
});

lines.on("close", () => shutDown("close"));

for (const signal of ["SIGTERM", "SIGINT", "SIGBREAK"]) {
  process.on(signal, () => shutDown(signal));
}
