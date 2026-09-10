import Rule30.Basic

/-! Seeder scratch, 2026-09-10: widen the search for a live mask-law case —
twelve noisy backgrounds, the flip at position 1 or 2, `t < 9`. -/

namespace SeederWitness4

def bg (v : ℕ) : Config := fun i => decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3)
def bg' (v : ℕ) (f : ℤ) : Config := fun i => xor (bg v i) (decide (i = f))

#eval (List.range 12).flatMap (fun v =>
  ([1, 2] : List ℤ).flatMap (fun f =>
    (List.range 9).filterMap (fun t =>
      if (column (bg v) 0 t = column (bg' v f) 0 t ∧
          column (bg v) 0 (t + 1) = column (bg' v f) 0 (t + 1)) ∧
         xor (column (bg v) (-1) t) (column (bg' v f) (-1) t) = true
      then some (v, f, t) else none)))

end SeederWitness4
