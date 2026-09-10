// Round-trip check: read blueprint/proposals/next.json, splice each proposal's
// `statement` bytes together with its `route.tactics`, and write one Lean file.
// If that file compiles clean, the routes were checked against the exact bytes
// the captain will land -- which is the failure this project has paid for.
import { readFileSync, writeFileSync } from 'node:fs';

const doc = JSON.parse(readFileSync('blueprint/proposals/next.json', 'utf8'));
const out = [];
out.push('import Rule30.Basic');
out.push('import Rule30.Prize');
out.push('import Rule30.Proofs');
out.push('');
out.push('namespace RoundTrip');
out.push('');
for (const p of doc.proposals) {
  const stmt = p.statement;
  if (!stmt.endsWith(':= by\n  sorry')) {
    console.error(`BAD SHAPE: ${p.id} does not end in ":= by\\n  sorry"`);
    process.exit(1);
  }
  if (!stmt.startsWith(`theorem ${p.lean_name}`)) {
    console.error(`BAD NAME: ${p.id} statement does not open with "theorem ${p.lean_name}"`);
    process.exit(1);
  }
  const head = stmt.slice(0, stmt.length - '\n  sorry'.length);
  if (!p.route) { out.push(head); out.push('  sorry'); out.push(''); continue; }
  out.push(head);
  out.push(p.route.tactics);
  out.push('');
}
out.push('end RoundTrip');
out.push('');
for (const p of doc.proposals) out.push(`#print axioms RoundTrip.${p.lean_name}`);
out.push('');
for (const p of doc.proposals) {
  if (p.witness) out.push(`#eval ${p.witness.expression}`);
}
out.push('');
writeFileSync('explorer/scratch_roundtrip.lean', out.join('\n'));
console.log(`wrote explorer/scratch_roundtrip.lean, ${doc.proposals.length} proposals`);
console.log('ids:', doc.proposals.map((p) => p.id).join(', '));
