/-
Talus, 2026-09-08. Kernel certification of the space-time periodic
configurations of rule 30 enumerated in `explorer/talus2_periodic.mjs`.

A configuration that is spatially `n`-periodic is a word `w : List Bool` of
length `n` read leftward from the origin (`w[k]` is the cell at `x = -k`).
One rule 30 step on it is `rstep` below: the cell at `x` reads `x-1, x, x+1`,
which in the `k` coordinate is `k+1, k, k-1`.

Each `example` says: this word is fixed by `L` steps, i.e. the corresponding
configuration of rule 30 on ℤ has temporal period dividing `L`. The words at
`L = 1, 3, 4` are exactly Wolfram 1986 Table 6.2; the rest are the
enumeration's extension of that table, which stops at period 4.

Checked by `lake env lean`, not by an explorer script.
-/

set_option maxRecDepth 100000

def rstep (w : List Bool) : List Bool :=
  let n := w.length
  (List.range n).map (fun k =>
    xor (w.getD ((k + 1) % n) false)
        ((w.getD k false) || (w.getD ((k + n - 1) % n) false)))

def iter : Nat → List Bool → List Bool
  | 0,     w => w
  | (n+1), w => iter n (rstep w)

/-- `w` is fixed by `L` rule 30 steps. -/
def fixedBy (L : Nat) (w : List Bool) : Bool := iter L w == w

-- notation: O = white, I = black
local notation "O" => false
local notation "I" => true

-- L = 1 : Wolfram Table 6.2, period 1
example : fixedBy 1 [O] = true := by decide
example : fixedBy 1 [O, I] = true := by decide

-- L = 3 : Wolfram Table 6.2, period 3, the length-12 element 000011111001
example : fixedBy 3 [O,O,O,O,I,I,I,I,I,O,O,I] = true := by decide

-- and it is fixed by neither 1 nor 2, so its temporal period is exactly 3
example : fixedBy 1 [O,O,O,O,I,I,I,I,I,O,O,I] = false := by decide
example : fixedBy 2 [O,O,O,O,I,I,I,I,I,O,O,I] = false := by decide

-- L = 4 : Wolfram Table 6.2, period 4, all four length-7 elements
example : fixedBy 4 [O,O,O,O,O,O,I] = true := by decide
example : fixedBy 4 [O,O,O,O,I,I,I] = true := by decide
example : fixedBy 4 [O,O,I,O,O,I,I] = true := by decide
example : fixedBy 4 [O,I,I,I,I,I,I] = true := by decide

-- BEYOND TABLE 6.2 -----------------------------------------------------------

-- L = 5 : a spatially 5-periodic configuration of temporal period 5
example : fixedBy 5 [O,O,I,I,I] = true := by decide
-- L = 5 : spatially 15-periodic
example : fixedBy 5 [O,O,O,I,I,I,I,O,O,I,O,I,I,O,I] = true := by decide
-- L = 5 : spatially 25-periodic
example : fixedBy 5 [O,O,O,O,O,I,I,O,I,I,O,I,I,I,I,I,O,O,O,I,O,I,O,O,I] = true := by decide

-- L = 7 : one of the seven spatially 15-periodic configurations
example : fixedBy 7 [O,O,I,I,O,I,O,I,I,I,O,I,I,I,I] = true := by decide

-- L = 8 : spatially 4-periodic, the temporal period Table 6.2 has no row for
example : fixedBy 8 [O,I,I,I] = true := by decide
example : fixedBy 8 [O,O,O,I] = true := by decide

-- L = 10 : spatially 30-periodic
example : fixedBy 10
    [O,O,O,I,O,I,I,O,O,I,O,I,O,I,I,I,I,O,O,O,I,I,I,O,I,O,O,I,I,I] = true := by decide

-- L = 10 : spatially 25-periodic (the L = 5 ring, at twice its period)
example : fixedBy 10 [O,O,O,O,O,I,I,O,I,I,O,I,I,I,I,I,O,O,O,I,O,I,O,O,I] = true := by decide

#print axioms rstep
