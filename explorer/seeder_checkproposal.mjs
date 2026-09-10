// Seeder scratch, 2026-09-10: parse blueprint/proposals/next.json, check its
// shape, and emit one Lean file per proposal built from EXACTLY the statement
// and route bytes in the document — so `lake env lean` checks the proposal
// itself and not my scratch copy of it.
import { readFileSync, writeFileSync } from 'node:fs'

const raw = readFileSync(new URL('../blueprint/proposals/next.json', import.meta.url), 'utf8')
const doc = JSON.parse(raw)

if (!Array.isArray(doc.proposals)) throw new Error('no proposals array')
console.log('parsed ok:', doc.proposals.length, 'proposals')

const required = ['id', 'lean_name', 'statement', 'reason']
for (const p of doc.proposals) {
  for (const f of required) if (!p[f]) throw new Error(`${p.id}: missing ${f}`)
  if (!p.statement.includes(`theorem ${p.lean_name}`)) throw new Error(`${p.id}: statement does not declare ${p.lean_name}`)
  if (!p.statement.endsWith(':= by\n  sorry')) throw new Error(`${p.id}: statement must end ':= by' newline '  sorry'`)
  const extra = Object.keys(p).filter(k => !['id', 'lean_name', 'statement', 'reason', 'disclaims', 'under', 'route', 'witness'].includes(k))
  if (extra.length) throw new Error(`${p.id}: unexpected fields ${extra}`)
  if (p.route && !p.route.tactics) throw new Error(`${p.id}: route without tactics`)
  if (p.witness && !(p.witness.expression && p.witness.range)) throw new Error(`${p.id}: witness needs expression and range`)
  console.log(`  ${p.id}  under=${p.under ?? '-'}  route=${p.route ? 'yes' : 'no'}  witness=${p.witness ? 'yes' : 'no'}`)
}

// emit the route files
for (const p of doc.proposals) {
  if (!p.route) continue
  const imports = ['Rule30.Basic', ...(p.route.imports ?? []), 'Mathlib.Tactic']
  const body = p.statement.replace(/\n  sorry$/, '\n' + p.route.tactics)
  const src = imports.map(i => `import ${i}`).join('\n') + '\n\n' + body + '\n\n#print axioms ' + p.lean_name + '\n'
  writeFileSync(new URL(`./seeder_route_${p.lean_name}.lean`, import.meta.url), src)
  console.log('wrote explorer/seeder_route_' + p.lean_name + '.lean')
}

// emit one file with every witness
const wsrc = 'import Rule30.Basic\n\n' + doc.proposals
  .filter(p => p.witness)
  .map(p => `-- ${p.lean_name}\n#eval ${p.witness.expression}\n`)
  .join('\n')
writeFileSync(new URL('./seeder_witnesses.lean', import.meta.url), wsrc)
console.log('wrote explorer/seeder_witnesses.lean')
