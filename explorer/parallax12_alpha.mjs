// Check the decimal value of alpha = sum c(t) 2^-(t+1), which section 1 of the
// sighting quotes. Written because I put "0.8713" in the document from a mental
// estimate, and a number in a document that was not computed is the project's
// recorded failure mode.
const step = (r) => (4n * r) ^ ((2n * r) | r);
let r = 1n;
const bits = [];
for (let t = 0; t < 200; t++) { bits.push(Number((r >> BigInt(t)) & 1n)); r = step(r); }
console.log(`c(0..23) = ${bits.slice(0, 24).join("")}`);
// exact rational with denominator 2^200, printed to 12 places
let num = 0n;
for (let t = 0; t < 200; t++) if (bits[t]) num += 1n << BigInt(199 - t);
const scaled = (num * 10n ** 15n) >> 200n;
const s = scaled.toString().padStart(16, "0");
console.log(`alpha  = 0.${s.slice(-15)}   (from 200 exact digits)`);
console.log(`rounded to 5 places: 0.${s.slice(-15).slice(0, 5)}`);
