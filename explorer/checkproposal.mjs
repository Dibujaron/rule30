// Seeder scratch: parse next.json and re-emit each statement + route as a Lean file
// body, so the bytes can be diffed against the scratch file that was verified.
import { readFileSync, writeFileSync } from "node:fs";
const p = JSON.parse(readFileSync(new URL("../blueprint/proposals/next.json", import.meta.url), "utf8"));
let out = "import Rule30.Basic\nimport Rule30.Prize\n\n";
for (const n of p.proposals) {
  for (const k of ["id", "lean_name", "statement", "reason"]) {
    if (typeof n[k] !== "string" || n[k].length === 0) throw new Error(`${n.id}: missing ${k}`);
  }
  if (!n.statement.startsWith(`theorem ${n.lean_name}`)) throw new Error(`${n.id}: name mismatch`);
  if (!n.statement.endsWith(":= by\n  sorry")) throw new Error(`${n.id}: bad tail`);
  const body = n.route
    ? n.statement.slice(0, -"  sorry".length) +
      n.route.tactics.split("\n").map((l) => "  " + l).join("\n")
    : n.statement;
  out += body + "\n\n";
}
writeFileSync(new URL("./scratch_reemit.lean", import.meta.url), out);
console.log("ok:", p.proposals.map((n) => n.id).join(", "));
