import Rule30.Basic

/-! Seeder scratch, 2026-09-10: find a (d, t) within kernel reach where the
mask law's left-hand side is genuinely nonzero, so the witness is not vacuous. -/

namespace SeederWitness2

def alt (d : ℤ) : Config := fun i => xor (initialConfig i) (decide (i = d))

/-- `(d, t)` pairs with the hypothesis holding and `Δ(-1)` nonzero. -/
#eval (List.range 4).flatMap (fun dd =>
  (List.range 12).filterMap (fun t =>
    let d : ℤ := (dd : ℤ) + 1
    if (column initialConfig 0 t = column (alt d) 0 t ∧
        column initialConfig 0 (t + 1) = column (alt d) 0 (t + 1)) ∧
       xor (column initialConfig (-1) t) (column (alt d) (-1) t) = true
    then some (dd + 1, t) else none))

/-- `(d, t)` pairs with the hypothesis holding and `Δ(-2)` nonzero. -/
#eval (List.range 4).flatMap (fun dd =>
  (List.range 12).filterMap (fun t =>
    let d : ℤ := (dd : ℤ) + 1
    if (column initialConfig 0 t = column (alt d) 0 t ∧
        column initialConfig 0 (t + 1) = column (alt d) 0 (t + 1)) ∧
       xor (column initialConfig (-2) t) (column (alt d) (-2) t) = true
    then some (dd + 1, t) else none))

end SeederWitness2
