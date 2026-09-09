import Rule30.Basic
import Mathlib.Tactic

/-- One step of the packed row, truncated to its low `n` bits. -/
def stepMod (n r : ℕ) : ℕ := ((4 * r) ^^^ ((2 * r) ||| r)) % 2 ^ n

/-- (preperiod, period) of `x` under `stepMod n`, by walking the orbit with a visited table. -/
def orbitShape (n x : ℕ) : ℕ × ℕ := Id.run do
  let mut visited : Array (Option ℕ) := Array.replicate (2 ^ n) none
  let mut cur := x
  let mut i := 0
  let mut fuel := 2 ^ n + 2
  while fuel > 0 do
    match visited[cur]! with
    | some j => return (j, i - j)
    | none =>
      visited := visited.set! cur (some i)
      cur := stepMod n cur
      i := i + 1
      fuel := fuel - 1
  return (0, 0)

/-- For bit width `n`: (n, seed preperiod, seed period, max preperiod over all states,
a state attaining it, max period over all states). -/
def survey (n : ℕ) : ℕ × ℕ × ℕ × ℕ × ℕ × ℕ := Id.run do
  let (sp, spp) := orbitShape n 1
  let mut best := 0
  let mut arg := 0
  let mut bestPer := 0
  for x in [0:2 ^ n] do
    let (a, b) := orbitShape n x
    if a > best then
      best := a
      arg := x
    if b > bestPer then
      bestPer := b
  return (n, sp, spp, best, arg, bestPer)

#eval (List.range 15).map (fun n => survey (n + 1))
