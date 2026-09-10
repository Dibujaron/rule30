// Rebuild the proposed tier from blueprint/proposals/next.json exactly as a
// captain would land it -- the statement bytes with `sorry` replaced by the
// route's tactic block -- and write it to explorer/seeder_verify.lean for
// `lake env lean`.  Checking the artifact, not my reading of it.
import { readFileSync, writeFileSync } from 'node:fs';

const raw = readFileSync('blueprint/proposals/next.json', 'utf8');
const doc = JSON.parse(raw);
console.log(`parsed ok: ${doc.proposals.length} proposals`);

const imports = new Set(['Rule30.Basic']);
const bodies = [];
for (const p of doc.proposals) {
  for (const k of ['id', 'lean_name', 'statement', 'reason']) {
    if (!p[k]) throw new Error(`${p.id}: missing ${k}`);
  }
  if (!p.statement.includes(`theorem ${p.lean_name} `)) throw new Error(`${p.id}: name mismatch`);
  if (!p.statement.endsWith(':= by\n  sorry')) throw new Error(`${p.id}: statement must end ':= by\\n  sorry'`);
  console.log(`  ${p.id}: under=${p.under ?? '(none)'} route=${p.route ? 'yes' : 'no'} witness=${p.witness ? 'yes' : 'no'}`);
  if (!p.route) continue;
  for (const i of p.route.imports ?? []) imports.add(i);
  bodies.push(p.statement.replace(/  sorry$/, p.route.tactics));
  if (p.witness) bodies.push(`#eval ${p.witness.expression}`);
}
for (const p of doc.proposals) if (p.route) bodies.push(`#print axioms ${p.lean_name}`);
const out = [...imports].map((i) => `import ${i}`).join('\n') + '\n\n' + bodies.join('\n\n') + '\n';
writeFileSync('explorer/seeder_verify.lean', out);
console.log(`wrote explorer/seeder_verify.lean (${out.split('\n').length} lines)`);
