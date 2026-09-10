import Rule30.Basic

/-! Seeder scratch, 2026-09-10: are the candidate witnesses (a) true and
(b) non-vacuous in a range the kernel can reach? -/

namespace SeederWitness

/-- The seed with one extra black cell at position `d`. -/
def alt (d : ℤ) : Config := fun i => xor (initialConfig i) (decide (i = d))

/-- Times below 8 at which the mask law's hypothesis holds, for a difference
planted at `d`. -/
def hypHits (d : ℤ) : ℕ :=
  ((List.range 8).filter (fun t =>
    column initialConfig 0 t = column (alt d) 0 t ∧
    column initialConfig 0 (t + 1) = column (alt d) 0 (t + 1))).length

/-- ... and of those, how many have a nonzero left-hand side at column `x`. -/
def liveHits (d : ℤ) (x : ℤ) : ℕ :=
  ((List.range 8).filter (fun t =>
    (column initialConfig 0 t = column (alt d) 0 t ∧
     column initialConfig 0 (t + 1) = column (alt d) 0 (t + 1)) ∧
    xor (column initialConfig x t) (column (alt d) x t) = true)).length

#eval (hypHits 1, liveHits 1 (-1), liveHits 1 (-2), liveHits 1 1)
#eval (hypHits 2, liveHits 2 (-1), liveHits 2 (-2), liveHits 2 1)
#eval (hypHits 3, liveHits 3 (-1), liveHits 3 (-2), liveHits 3 1)

-- Witness A: the mask law, over three planted differences and t < 8.
#eval ([1, 2, 3] : List ℤ).all (fun d => (List.range 8).all (fun t =>
  !(decide (column initialConfig 0 t = column (alt d) 0 t) &&
    decide (column initialConfig 0 (t + 1) = column (alt d) 0 (t + 1))) ||
  decide (xor (column initialConfig (-1) t) (column (alt d) (-1) t)
    = ((! column initialConfig 0 t) &&
        xor (column initialConfig 1 t) (column (alt d) 1 t)))))

-- Witness B: the derivative law, same range.
#eval ([1, 2, 3] : List ℤ).all (fun d => (List.range 8).all (fun t =>
  !(decide (column initialConfig 0 t = column (alt d) 0 t) &&
    decide (column initialConfig 0 (t + 1) = column (alt d) 0 (t + 1))) ||
  decide (xor (column initialConfig (-2) t) (column (alt d) (-2) t)
    = xor (xor (column initialConfig (-1) t) (column (alt d) (-1) t))
        (xor (column initialConfig (-1) (t + 1)) (column (alt d) (-1) (t + 1))))))

end SeederWitness
