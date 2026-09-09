/**
 * Extract readable text from a PDF that WebFetch already downloaded and saved.
 *
 *   node explorer/alidade_pdftext.mjs <path-to-pdf> [outPath]
 *
 * The harness's WebFetch saves binary responses to disk and the summarising
 * model cannot read them; this inflates the FlateDecode content streams and
 * pulls the strings out of the text-showing operators (Tj, TJ, ', ") so the
 * paper can be quoted. No network access: it reads a local file only.
 *
 * Nothing here is a proof. See explorer/README.md.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync, inflateRawSync } from 'node:zlib';

// The guard allows `node <script>` with no arguments, so the two papers this
// session fetched are named here. Edit these to point at another saved fetch.
const JOBS = [
  ['C:/Users/dibuj/.claude/projects/c--Users-dibuj-dev-rule30/c9e528ce-be24-42c7-bbd7-4e64d723dbea/tool-results/webfetch-1788915291701-ga8f9d.pdf', 'explorer/alidade_hanson_encyc.txt'],
  ['C:/Users/dibuj/.claude/projects/c--Users-dibuj-dev-rule30/c9e528ce-be24-42c7-bbd7-4e64d723dbea/tool-results/webfetch-1788915315494-026pt6.pdf', 'explorer/alidade_eca54.txt'],
  ['C:/Users/dibuj/.claude/projects/c--Users-dibuj-dev-rule30/c9e528ce-be24-42c7-bbd7-4e64d723dbea/tool-results/webfetch-1788915555128-u83q8j.pdf', 'explorer/alidade_turbases.txt'],
];

function extract(path, out) {
const buf = readFileSync(path);
console.log(`${path}: ${buf.length} bytes`);

// 1. collect every stream, inflate the ones that inflate.
const streams = [];
let i = 0;
while (true) {
  const s = buf.indexOf('stream', i);
  if (s < 0) break;
  let b = s + 6;
  if (buf[b] === 0x0d) b++;
  if (buf[b] === 0x0a) b++;
  const e = buf.indexOf('endstream', b);
  if (e < 0) break;
  let raw = buf.subarray(b, e);
  let data = null;
  for (const f of [inflateSync, inflateRawSync]) {
    try { data = f(raw); break; } catch { /* not flate, or truncated */ }
  }
  if (data) streams.push(data);
  i = e + 9;
}
console.log(`streams: ${streams.length} inflated`);

// 2. per stream, build a map of font -> ToUnicode-ish differences is overkill;
//    first try the plain bytes of the show operators.
const esc = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' };

function stringsOf(text) {
  // walk the content stream, tracking (...) and <...> literals and the operator
  // that consumes them; emit a space for TD/Td/T* and a newline for ET.
  const pieces = [];
  let j = 0;
  const pending = [];
  const n = text.length;
  while (j < n) {
    const c = text[j];
    if (c === '(') {
      let depth = 1, s = '';
      j++;
      while (j < n && depth > 0) {
        const d = text[j];
        if (d === '\\') {
          const k = text[j + 1];
          if (k >= '0' && k <= '7') {
            let oct = '';
            let m = j + 1;
            while (m < n && oct.length < 3 && text[m] >= '0' && text[m] <= '7') { oct += text[m]; m++; }
            s += String.fromCharCode(parseInt(oct, 8));
            j = m;
          } else { s += esc[k] !== undefined ? esc[k] : k; j += 2; }
        } else if (d === '(') { depth++; s += d; j++; }
        else if (d === ')') { depth--; if (depth > 0) s += d; j++; }
        else { s += d; j++; }
      }
      pending.push(s);
    } else if (c === '<' && text[j + 1] !== '<') {
      let m = text.indexOf('>', j);
      if (m < 0) break;
      const hex = text.slice(j + 1, m).replace(/\s+/g, '');
      let s = '';
      for (let h = 0; h + 1 < hex.length; h += 2) s += String.fromCharCode(parseInt(hex.slice(h, h + 2), 16));
      pending.push(s);
      j = m + 1;
    } else if (/[A-Za-z'"*]/.test(c)) {
      let m = j;
      while (m < n && /[A-Za-z0-9'"*]/.test(text[m])) m++;
      const op = text.slice(j, m);
      if (op === 'Tj' || op === 'TJ' || op === "'" || op === '"') {
        pieces.push(pending.join(''));
        if (op === "'" || op === '"') pieces.push('\n');
        pending.length = 0;
      } else if (op === 'Td' || op === 'TD' || op === 'T*') { pieces.push('\n'); pending.length = 0; }
      else if (op === 'ET') { pieces.push('\n'); pending.length = 0; }
      else pending.length = 0;
      j = m;
    } else j++;
  }
  return pieces.join('');
}

let text = '';
for (const s of streams) {
  const t = s.toString('latin1');
  if (!/(Tj|TJ)\b/.test(t)) continue;
  text += stringsOf(t) + '\n\f\n';
}

// 3. report legibility: fraction of characters that are ASCII letters/space.
const letters = (text.match(/[A-Za-z ]/g) || []).length;
console.log(`text: ${text.length} chars, ${(letters / Math.max(1, text.length) * 100).toFixed(1)}% letters/space`);
const words = text.split(/[^A-Za-z]+/).filter((w) => w.length > 3);
const dict = new Set(['the', 'and', 'that', 'this', 'with', 'from', 'domain', 'domains', 'cellular', 'automata', 'particle', 'particles', 'defect', 'defects', 'regular', 'filter', 'space', 'time']);
const hits = words.filter((w) => dict.has(w.toLowerCase())).length;
console.log(`words > 3 letters: ${words.length}; dictionary hits: ${hits} (${(hits / Math.max(1, words.length) * 100).toFixed(1)}%)`);
// dvips-era PDFs place almost every word with its own Td, so the raw dump is
// one word per line; join it back into lines of ~100 characters, undoing the
// hyphenation that line breaks in the original introduced.
const joined = text
  .replace(/\f/g, '\n\n=== page ===\n\n')
  .split('\n')
  .map((s) => s.trim())
  .join(' ')
  .replace(/([a-z])- ([a-z])/g, '$1$2')
  .replace(/ +/g, ' ')
  .replace(/(.{1,100})(\s|$)/g, '$1\n');
writeFileSync(out, joined);
console.log(`written to ${out}`);
}

for (const [p, o] of JOBS) { try { extract(p, o); } catch (e) { console.log(`${p}: FAILED ${e.message}`); } }
