// Rebuild a Lean file from the proposal's own bytes: statement text with the
// `sorry` replaced by the route's tactic block. If this elaborates with no
// output, every route is verified against the exact bytes that will land.
import { readFileSync, writeFileSync } from "node:fs";

const doc = JSON.parse(readFileSync("blueprint/proposals/next.json", "utf8"));
const imports = new Set(["Rule30.Basic", "Mathlib.Tactic"]);
for (const p of doc.proposals) for (const i of p.route?.imports ?? []) imports.add(i);

const parts = [...imports].map((i) => `import ${i}`).join("\n") + "\n\n";
let body = "";
let routed = 0;
for (const p of doc.proposals) {
  if (!p.statement.includes(":= by\n  sorry")) throw new Error(`bad statement shape: ${p.id}`);
  if (p.lean_name !== p.id) console.log(`note: id and lean_name differ for ${p.id}`);
  if (!p.statement.includes(`theorem ${p.lean_name}`)) throw new Error(`name mismatch: ${p.id}`);
  if (!p.reason || p.reason.length < 40) throw new Error(`missing reason: ${p.id}`);
  if (!p.route) { console.log(`no route (claims nothing): ${p.id}`); continue; }
  body += p.statement.replace(":= by\n  sorry", ":= by\n" + p.route.tactics) + "\n\n";
  routed++;
}
writeFileSync("explorer/tessera_check.lean", parts + body);
console.log(`${doc.proposals.length} proposals, ${routed} with routes -> explorer/tessera_check.lean`);

// witnesses, rebuilt the same way
let w = parts;
let nw = 0;
for (const p of doc.proposals) {
  if (!p.witness) { console.log(`no witness (claims nothing): ${p.id}`); continue; }
  if (!p.witness.range) throw new Error(`witness without range: ${p.id}`);
  w += `-- ${p.id}\n#eval ${p.witness.expression}\n\n`;
  nw++;
}
writeFileSync("explorer/tessera_checkw.lean", w);
console.log(`${nw} witnesses -> explorer/tessera_checkw.lean`);

// every statement, verbatim, sorry and all: does the seeded text elaborate?
writeFileSync("explorer/tessera_checks.lean",
  parts + doc.proposals.map((p) => p.statement).join("\n\n") + "\n");
console.log(`${doc.proposals.length} statements -> explorer/tessera_checks.lean`);
