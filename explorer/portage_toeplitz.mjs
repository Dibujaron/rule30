/**
 * Portage (connector, 2026-09-08): the Toeplitz test on the centre column,
 * done with enough confirmations to mean anything.
 *
 *   node explorer/portage_toeplitz.mjs
 *
 * A sequence c is Toeplitz if for every t there is a p > 0 with c(t + np) = c(t)
 * for EVERY n >= 0. Tested to depth T it becomes: is there a p <= PMAX such that
 * all floor((T - t)/p) confirmations agree? The trap, and the reason this script
 * exists: with PMAX = 8192 against T = 60000 each candidate p is confirmed only
 * about seven times, so a coin passes at nearly every t and the test reports
 * "Toeplitz" for a random sequence. Requiring CONF confirmations per candidate
 * makes a false pass cost 2^-CONF, and the script prints the same test on a
 * pseudorandom control so the number can be read.
 */

const T = 200000;
const c = new Uint8Array(T);
{
  let r = 1n;
  for (let t = 0; t < T; t++) { c[t] = Number((r >> BigInt(t)) & 1n); r = (4n * r) ^ ((2n * r) | r); }
}
console.log(`centre column to ${T}: c(0..40) = ${Array.from(c.slice(0, 41)).join('')}`);

// a control with the same density and no structure
const ctl = new Uint8Array(T);
{
  // xorshift32; a linear congruential generator is NOT usable here, because
  // bit k of an LCG modulo 2^32 has period 2^(k+1) and passes this very test.
  let s = 2463534242 >>> 0;
  for (let t = 0; t < T; t++) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; ctl[t] = s & 1; }
}

function toeplitzPass(v, TT, PMAX, CONF, NT) {
  let pass = 0;
  const witnesses = [];
  for (let t = 0; t < NT; t++) {
    let found = 0;
    for (let p = 1; p <= PMAX; p++) {
      const conf = Math.floor((TT - 1 - t) / p);
      if (conf < CONF) continue;
      let ok = true;
      for (let u = t + p; u < TT; u += p) if (v[u] !== v[t]) { ok = false; break; }
      if (ok) { found = p; break; }
    }
    if (found) { pass++; if (witnesses.length < 8) witnesses.push(`t=${t},p=${found}`); }
  }
  return [pass, witnesses];
}

for (const [PMAX, CONF] of [[8192, 1], [1024, 1], [512, 100], [1024, 100], [4096, 40]]) {
  const [a, wa] = toeplitzPass(c, T, PMAX, CONF, 2000);
  const [b] = toeplitzPass(ctl, T, PMAX, CONF, 2000);
  console.log(`p <= ${PMAX}, at least ${CONF} confirmations, t < 2000 of ${T}: centre column ${a}/2000 pass, control ${b}/2000${a ? '  witnesses: ' + wa.join(' ') : ''}`);
}
