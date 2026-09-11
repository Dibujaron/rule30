// Seeder scratch: rebuild each proposal's route file the way seed.check_source
// does -- imports, the declaration with its trailing `sorry` stripped, then the
// tactics with their common margin set to two spaces -- so the exact bytes the
// seed check will elaborate can be run here first.
import { readFileSync, writeFileSync } from 'node:fs';

const p = JSON.parse(
  readFileSync(new URL('../blueprint/proposals/next.json', import.meta.url), 'utf8'),
);

const indent = (t) => {
  const lines = t.split('\n');
  const margin = Math.min(
    ...lines.filter((l) => l.trim() !== '').map((l) => l.length - l.trimStart().length),
  );
  return lines.map((l) => (l.trim() === '' ? l : '  ' + l.slice(margin))).join('\n');
};

let decls = 'import Rule30.Basic\n\n';

for (const n of p.proposals) {
  for (const k of ['id', 'lean_name', 'statement', 'reason']) {
    if (typeof n[k] !== 'string' || n[k].length === 0) throw new Error(`${n.id}: missing ${k}`);
  }
  if (!n.statement.startsWith(`theorem ${n.lean_name}`)) throw new Error(`${n.id}: name mismatch`);
  if (!n.statement.endsWith(':= by\n  sorry')) throw new Error(`${n.id}: bad tail`);
  decls += n.statement + '\n\n';
  if (!n.route) continue;
  const decl = n.statement.slice(0, -'  sorry'.length);
  const imports = ['Rule30.Basic', ...n.route.imports].map((m) => `import ${m}`).join('\n');
  writeFileSync(
    new URL(`./p2seed_route_${n.id}.lean`, import.meta.url),
    `${imports}\n${decl}\n${indent(n.route.tactics)}\n`,
  );
  console.log(`wrote explorer/p2seed_route_${n.id}.lean`);
}
writeFileSync(new URL('./p2seed_decls.lean', import.meta.url), decls);
console.log('ok:', p.proposals.map((n) => n.id).join(', '));
