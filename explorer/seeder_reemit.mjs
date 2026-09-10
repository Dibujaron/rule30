// Seeder scratch: re-emit next.json's statements + routes exactly as the
// harness will assemble them (harness/src/harness/seed.gleam: the common left
// margin of `tactics` is replaced by exactly two spaces), with the route
// imports included, so the proposal's own bytes can be compiled.
import { readFileSync, writeFileSync } from "node:fs";

const p = JSON.parse(
  readFileSync(new URL("../blueprint/proposals/next.json", import.meta.url), "utf8"),
);

const indented = (tactics) => {
  const lines = tactics.split("\n");
  const margins = lines
    .filter((l) => l.trim().length > 0)
    .map((l) => l.length - l.trimStart().length);
  const common = Math.min(...margins);
  return lines
    .map((l) => (l.trim().length === 0 ? l : "  " + l.slice(common)))
    .join("\n");
};

const imports = new Set(["Rule30.Basic", "Rule30.Prize"]);
const bodies = [];
for (const n of p.proposals) {
  for (const k of ["id", "lean_name", "statement", "reason"]) {
    if (typeof n[k] !== "string" || n[k].length === 0) throw new Error(`${n.id}: missing ${k}`);
  }
  if (!n.statement.startsWith(`theorem ${n.lean_name}`)) throw new Error(`${n.id}: name mismatch`);
  if (!n.statement.endsWith(":= by\n  sorry")) throw new Error(`${n.id}: bad tail`);
  if (!n.route) {
    bodies.push(n.statement);
    continue;
  }
  for (const m of n.route.imports ?? []) imports.add(m);
  bodies.push(n.statement.slice(0, -"  sorry".length).trimEnd() + "\n" + indented(n.route.tactics));
}

const axiomChecks = p.proposals.map((n) => `#print axioms ${n.lean_name}`).join("\n");
writeFileSync(
  new URL("./scratch_reemit.lean", import.meta.url),
  [...imports].map((m) => `import ${m}`).join("\n") + "\n\n" + bodies.join("\n\n") + "\n\n" + axiomChecks + "\n",
);
console.log("ok:", p.proposals.map((n) => n.id).join(", "));
