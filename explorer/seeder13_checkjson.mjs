import { readFileSync } from 'node:fs';
const d = JSON.parse(readFileSync('blueprint/proposals/next.json', 'utf8'));
console.log('proposals:', d.proposals.length);
for (const p of d.proposals) {
  const ok = p.id && p.lean_name && p.statement && p.reason;
  console.log(
    (ok ? 'ok  ' : 'BAD ') + p.id,
    '| name-matches-stmt:', p.statement.startsWith('theorem ' + p.lean_name + ' '),
    '| ends-sorry:', p.statement.endsWith(':= by\n  sorry'),
    '| under:', p.under ? 'yes' : '-',
    '| route:', p.route ? 'yes' : '-',
    '| reason chars:', p.reason.length,
  );
}
