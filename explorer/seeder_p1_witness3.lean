import Rule30.Basic

/-! Seeder scratch, 2026-09-10: the mask and derivative laws are about ANY two
configurations, so try noisy ones, where a planted difference reaches column
`-1` in a few steps instead of the ~4d the seed's white left cone forces. -/

namespace SeederWitness3

/-- Four deterministic "noisy" rows, and the same row with position 2 flipped. -/
def bg (v : ℕ) : Config := fun i => decide ((i * i + (v : ℤ) * i + 1) % 5 < 2)
def bg' (v : ℕ) : Config := fun i => xor (bg v i) (decide (i = 2))

#eval (List.range 4).flatMap (fun v =>
  (List.range 9).filterMap (fun t =>
    if (column (bg v) 0 t = column (bg' v) 0 t ∧
        column (bg v) 0 (t + 1) = column (bg' v) 0 (t + 1)) ∧
       xor (column (bg v) (-1) t) (column (bg' v) (-1) t) = true
    then some (v, t) else none))

#eval (List.range 4).flatMap (fun v =>
  (List.range 9).filterMap (fun t =>
    if (column (bg v) 0 t = column (bg' v) 0 t ∧
        column (bg v) 0 (t + 1) = column (bg' v) 0 (t + 1)) ∧
       xor (column (bg v) (-2) t) (column (bg' v) (-2) t) = true
    then some (v, t) else none))

-- Witness A': the mask law over the noisy backgrounds.
#eval (List.range 4).all (fun v => (List.range 9).all (fun t =>
  !(decide (column (bg v) 0 t = column (bg' v) 0 t) &&
    decide (column (bg v) 0 (t + 1) = column (bg' v) 0 (t + 1))) ||
  decide (xor (column (bg v) (-1) t) (column (bg' v) (-1) t)
    = ((! column (bg v) 0 t) && xor (column (bg v) 1 t) (column (bg' v) 1 t)))))

-- Witness B': the derivative law over the noisy backgrounds.
#eval (List.range 4).all (fun v => (List.range 9).all (fun t =>
  !(decide (column (bg v) 0 t = column (bg' v) 0 t) &&
    decide (column (bg v) 0 (t + 1) = column (bg' v) 0 (t + 1))) ||
  decide (xor (column (bg v) (-2) t) (column (bg' v) (-2) t)
    = xor (xor (column (bg v) (-1) t) (column (bg' v) (-1) t))
        (xor (column (bg v) (-1) (t + 1)) (column (bg' v) (-1) (t + 1))))))

-- Witness C': the run shield over the noisy backgrounds, j <= 3, t < 7.
#eval (List.range 4).all (fun v => (List.range 4).all (fun j =>
  (List.range 7).all (fun t =>
    !((List.range (j + 1)).all (fun s =>
        decide (column (bg v) 0 (t + s) = column (bg' v) 0 (t + s))) &&
      (List.range j).all (fun s => column (bg v) 0 (t + s))) ||
    (List.range (j + 1)).all (fun i =>
      decide (column (bg v) (-(i : ℤ)) t = column (bg' v) (-(i : ℤ)) t)))))

end SeederWitness3
