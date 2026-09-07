/** Parse blueprint/proposals/next.json and print its shape. Not a Rule 30 script. */
import { readFileSync } from 'node:fs';

const doc = JSON.parse(readFileSync('blueprint/proposals/next.json', 'utf8'));
for (const p of doc.proposals) {
  console.log(
    `${p.id} | lean_name=${p.lean_name === p.id} | route=${!!p.route} | witness=${!!p.witness} | reason=${p.reason.length}ch`,
  );
  if (!p.statement.startsWith(`theorem ${p.lean_name} `)) console.log('  !! statement does not open with the lean_name');
  if (!p.statement.endsWith(':= by\n  sorry')) console.log('  !! statement does not end with := by / sorry');
}
console.log(`${doc.proposals.length} proposals, JSON parses`);
