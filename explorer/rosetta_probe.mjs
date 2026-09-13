/**
 * Rosetta, 2026-09-13. Probe: what centre-column data is already on disk, and
 * does it agree with a freshly run engine? Nothing is believed until both.
 */
import { statSync, readFileSync } from 'node:fs';
import { centerPacked } from './talus7_center.mjs';

const files = ['talus7_center10m.bin', 'talus7_center.bin'];
for (const f of files) {
  const url = new URL('./' + f, import.meta.url);
  try {
    const st = statSync(url);
    const buf = readFileSync(url);
    console.log(`${f}: ${st.size} bytes; first 24 = ${Array.from(buf.slice(0, 24)).join('')}`);
  } catch (e) {
    console.log(`${f}: MISSING`);
  }
}
