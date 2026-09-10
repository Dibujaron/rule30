/**
 * Seeder scratch, 2026-09-10. Reads blueprint/proposals/next.json, checks the
 * shape the decoder demands, and writes the statement bytes VERBATIM into a
 * Lean file so they can be elaborated exactly as they will land.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const raw = readFileSync('blueprint/proposals/next.json', 'utf8');
const doc = JSON.parse(raw);

if (!Array.isArray(doc.proposals)) throw new Error('no proposals array');

const seen = new Set();
for (const p of doc.proposals) {
  for (const k of ['id', 'lean_name', 'statement', 'reason']) {
    if (typeof p[k] !== 'string' || p[k].length === 0) {
      throw new Error(`${p.id}: missing required field ${k}`);
    }
  }
  if (seen.has(p.id)) throw new Error(`duplicate id ${p.id}`);
  seen.add(p.id);
  if (!p.statement.includes(`theorem ${p.lean_name}`)) {
    throw new Error(`${p.id}: statement does not declare ${p.lean_name}`);
  }
  if (!p.statement.trimEnd().endsWith('sorry')) {
    throw new Error(`${p.id}: statement does not end in sorry`);
  }
  if (p.witness && !(p.witness.expression && p.witness.range)) {
    throw new Error(`${p.id}: witness needs expression and range`);
  }
  const extra = Object.keys(p).filter((k) => ![
    'id', 'lean_name', 'statement', 'reason', 'disclaims', 'under', 'route', 'witness',
  ].includes(k));
  if (extra.length) throw new Error(`${p.id}: unexpected fields ${extra}`);
}

const lean = [
  'import Rule30.Basic',
  '',
  '/-! Seeder scratch: the statement bytes of blueprint/proposals/next.json,',
  'extracted verbatim and elaborated. -/',
  '',
  'namespace ProposalCheck',
  '',
  ...doc.proposals.map((p) => p.statement + '\n'),
  'end ProposalCheck',
].join('\n');
writeFileSync('explorer/seeder_p1_proposalcheck.lean', lean);

const witnesses = doc.proposals.filter((p) => p.witness);
const wlean = [
  'import Rule30.Basic',
  '',
  '/-! Seeder scratch: the witness expressions of next.json, verbatim. -/',
  '',
  ...witnesses.map((p) => `-- ${p.id}\n#eval ${p.witness.expression}\n`),
].join('\n');
writeFileSync('explorer/seeder_p1_witnesscheck.lean', wlean);

console.log(`ok: ${doc.proposals.length} proposals, ${witnesses.length} witnesses`);
console.log(`ids: ${[...seen].join(', ')}`);
console.log('wrote explorer/seeder_p1_proposalcheck.lean and seeder_p1_witnesscheck.lean');
