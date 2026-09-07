// Seeder scratch: print the DAG as one row per node.
import { readFileSync } from "node:fs";
const d = JSON.parse(readFileSync(new URL("../blueprint/dag.json", import.meta.url), "utf8"));
const nodes = Array.isArray(d) ? d : d.nodes;
const arr = Array.isArray(nodes) ? nodes : Object.entries(nodes).map(([id, v]) => ({ id, ...v }));
console.log("total", arr.length);
const byRegion = new Map();
for (const n of arr) {
  const r = n.region ?? "(none)";
  if (!byRegion.has(r)) byRegion.set(r, []);
  byRegion.get(r).push(n);
}
for (const [r, ns] of byRegion) {
  console.log(`\n=== ${r} (${ns.length}) ===`);
  for (const n of ns) {
    console.log(
      [n.status, n.id, n.lean_name ?? "", "deps:" + JSON.stringify(n.deps ?? n.dependencies ?? [])].join("  ")
    );
  }
}
console.log("\nkeys of a node:", Object.keys(arr[0]).join(","));
