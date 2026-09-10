// Seeder scratch: print DAG node status counts and every node that is not `proved`.
import { readFileSync } from 'node:fs'

const dag = JSON.parse(readFileSync(new URL('../blueprint/dag.json', import.meta.url), 'utf8'))
const nodes = dag.nodes ?? dag
const arr = Array.isArray(nodes) ? nodes : Object.entries(nodes).map(([id, v]) => ({ id, ...v }))

const counts = {}
for (const n of arr) counts[n.status] = (counts[n.status] ?? 0) + 1
console.log('total', arr.length, counts)

console.log('\n--- not proved ---')
for (const n of arr) {
  if (n.status === 'proved') continue
  console.log(
    [n.id, n.status, n.size ?? '?', 'attempts=' + (n.attempts ?? 0), 'under=' + (n.under ?? '-'), 'deps=' + JSON.stringify(n.deps ?? [])].join('  ')
  )
}
