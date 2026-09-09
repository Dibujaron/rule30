/**
 * halfcheck_fit.cjs -- does the p = 32 regime's excess over 1/2 decay with T?
 *
 *   node explorer/halfcheck_fit.cjs
 *
 * Cumulative speeds of the greedy walker on rule 30's own settled background,
 * read off halfcheck_deep.cjs's run over the whole p = 32 regime (diagonals
 * 87869..1420878967). Fits log(speed - 1/2) against log T: a transient would
 * give a slope near -1/2 or -1, a genuine limit above 1/2 gives slope 0.
 */
'use strict';
// (steps T, cumulative speed) -- steps = advances + diagonals ~ 2.0045 * diagonals
const pts = [
  [1e8, 0.5010557], [2e8, 0.5011185], [3e8, 0.5011289], [4e8, 0.5011205],
  [5e8, 0.5011209], [6e8, 0.5011280], [7e8, 0.5011286], [8e8, 0.5011350],
  [9e8, 0.5011384], [10e8, 0.5011375], [11e8, 0.5011355], [12e8, 0.5011310],
  [13e8, 0.5011256], [14e8, 0.5011278], [1420791099, 0.5011284],
].map(([d, s]) => [d * 2.004512, s]);   // diagonals -> steps

let n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
for (const [T, s] of pts) {
  const x = Math.log(T), y = Math.log(s - 0.5);
  n++; sx += x; sy += y; sxx += x * x; sxy += x * y;
}
const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
const inter = (sy - slope * sx) / n;
console.log(`fit  log(speed - 1/2) = ${inter.toFixed(4)} + ${slope.toFixed(5)} * log T   over T in [${(pts[0][0] / 1e8).toFixed(1)}e8 .. ${(pts[pts.length - 1][0] / 1e9).toFixed(2)}e9]`);
console.log(`  alpha (excess ~ c / T^alpha) = ${(-slope).toFixed(5)}`);
console.log(`  a transient would need alpha ~ 0.5 or 1; a genuine limit above 1/2 gives alpha = 0`);
console.log(`  residuals (observed - fitted excess):`);
for (const [T, s] of pts) {
  const f = Math.exp(inter + slope * Math.log(T));
  console.log(`    T = ${(T / 1e9).toFixed(3)}e9  excess ${(s - 0.5).toExponential(4)}  fitted ${f.toExponential(4)}  resid ${((s - 0.5) - f).toExponential(2)}`);
}
// extrapolation of the fitted law
for (const T of [1e12, 1e18]) console.log(`  fitted excess at T = ${T.toExponential(0)}: ${Math.exp(inter + slope * Math.log(T)).toExponential(3)}`);

// flat-model test: chi^2 of the constant model against the block-level sem
const mean = pts.reduce((a, [, s]) => a + s, 0) / pts.length;
console.log(`\nconstant model: mean cumulative speed ${mean.toFixed(7)}, spread ${(Math.max(...pts.map((p) => p[1])) - Math.min(...pts.map((p) => p[1]))).toExponential(2)}`);
console.log(`whole-regime figure: 0.5011284 over 2.848e9 steps; 130-block sem on the 1.3e9-diagonal run was 1.04e-5, so the excess is ${((0.5011284 - 0.5) / 1.04e-5).toFixed(0)} sem above 1/2`);
