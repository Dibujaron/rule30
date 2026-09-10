import Rule30.Basic

/-! Seeder scratch, 2026-09-10: liveness of the run-shield witness — does its
range contain cases where the two pictures genuinely differ just past the
shielded block? If not, the witness passes without exercising anything. -/

namespace SeederLive

def bg (v : ℕ) : Config := fun i => decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3)
def bg' (v : ℕ) (f : ℤ) : Config := fun i => xor (bg v i) (decide (i = f))

/-- The hypothesis, as a `Bool`. -/
def hyp (v : ℕ) (f : ℤ) (j t : ℕ) : Bool :=
  (List.range (j + 1)).all
      (fun s => decide (column (bg v) 0 (t + s) = column (bg' v f) 0 (t + s))) &&
    (List.range j).all (fun s => column (bg v) 0 (t + s))

/-- hypothesis hits, and of those how many have the two pictures differing at
position `-(j+1)` — the first position the shield does not cover. -/
#eval
  (((List.range 8).flatMap (fun v => ([1, 2] : List ℤ).flatMap (fun f =>
    (List.range 4).flatMap (fun j => (List.range 7).filter (fun t =>
      hyp v f j t))))).length,
   ((List.range 8).flatMap (fun v => ([1, 2] : List ℤ).flatMap (fun f =>
    (List.range 4).flatMap (fun j => (List.range 7).filter (fun t =>
      hyp v f j t &&
        decide (column (bg v) (-((j : ℤ) + 1)) t
          ≠ column (bg' v f) (-((j : ℤ) + 1)) t)))))).length)

end SeederLive
