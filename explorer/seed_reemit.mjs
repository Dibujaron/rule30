// Re-emit blueprint/proposals/next.json as one Lean file: every statement
// exactly as proposed, with its route spliced in where there is one, and the
// union of the routes' imports at the top. Compiling the result checks the
// proposed bytes rather than the scratch files they were developed in.
import { readFileSync, writeFileSync } from "node:fs";

const p = JSON.parse(readFileSync(new URL("../blueprint/proposals/next.json", import.meta.url), "utf8"));
const imports = new Set(["Rule30.Basic", "Rule30.Prize", "Rule30.Strip"]);
for (const n of p.proposals) for (const i of n.route?.imports ?? []) imports.add(i);

let out = [...imports].map((i) => `import ${i}`).join("\n") + "\n\nnamespace SeedReemit\n\n";
for (const n of p.proposals) {
  for (const k of ["id", "lean_name", "statement", "reason"]) {
    if (typeof n[k] !== "string" || n[k].length === 0) throw new Error(`${n.id}: missing ${k}`);
  }
  if (!n.statement.startsWith(`theorem ${n.lean_name}`)) throw new Error(`${n.id}: name mismatch`);
  if (!n.statement.endsWith(":= by\n  sorry")) throw new Error(`${n.id}: bad tail`);
  out += (n.route ? n.statement.slice(0, -"  sorry".length) + n.route.tactics : n.statement) + "\n\n";
}
out += "end SeedReemit\n";
writeFileSync(new URL("./seed_scratch_reemit.lean", import.meta.url), out);
console.log("ok:", p.proposals.map((n) => n.id).join(", "));
console.log("witnesses:", p.proposals.filter((n) => n.witness).map((n) => n.id).join(", ") || "none");
