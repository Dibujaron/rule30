// Sextant, 2026-09-12.  Prints the tail of docs/obstructions.md so that a new
// entry can be appended without disturbing anything above it.  Read-only.
import { readFileSync } from 'node:fs';
const s = readFileSync(new URL('../docs/obstructions.md', import.meta.url), 'utf8');
const lines = s.split('\n');
console.log('total lines:', lines.length, ' total chars:', s.length);
console.log('--- headings after line 1820 ---');
lines.forEach((l, i) => { if (i > 1820 && l.startsWith('## ')) console.log(i + 1, l); });
console.log('--- last 30 lines ---');
console.log(lines.slice(-30).map((l, i) => `${lines.length - 30 + i + 1}| ${l}`).join('\n'));
