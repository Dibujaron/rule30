// Seeder, 2026-09-10. Rebuild a Lean file from the proposal's own bytes —
// statement with `sorry` replaced by the route's tactics — so the thing that
// gets checked is what the captain will land, not what I typed into a scratch.
import { readFileSync, writeFileSync } from 'node:fs';

const doc = JSON.parse(readFileSync('blueprint/proposals/next.json', 'utf8'));
const imports = new Set(['Rule30.Basic']);
for (const p of doc.proposals) for (const i of p.route?.imports ?? []) imports.add(i);

let out = '/- generated from blueprint/proposals/next.json; do not edit -/\n';
for (const i of imports) out += `import ${i}\n`;
out += '\n';
for (const p of doc.proposals) {
  if (!p.statement.endsWith(':= by\n  sorry')) throw new Error(`${p.id}: bad statement tail`);
  if (!p.statement.startsWith(`theorem ${p.lean_name}`)) throw new Error(`${p.id}: bad head`);
  const body = p.route ? p.route.tactics : '  sorry';
  out += p.statement.replace(/:= by\n  sorry$/, ':= by\n') + body + '\n\n';
}
for (const p of doc.proposals) {
  if (p.witness) out += `#eval ${p.witness.expression}\n`;
}
for (const p of doc.proposals) out += `#print axioms ${p.lean_name}\n`;
writeFileSync('explorer/tessera2_generated.lean', out);
console.log(`wrote explorer/tessera2_generated.lean, ${doc.proposals.length} proposals, ${out.split('\n').length} lines`);
