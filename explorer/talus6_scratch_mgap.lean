import Rule30.Basic

/-! Talus, 2026-09-10.  Kernel check of the shift identity behind C1/C2.

`mgap p` is the distance from the right edge of row `p` to the nearest black
cell strictly left of it -- the `m` of `rightDiagonal_first_failure`.

Checked here, for every `p` in range:
  (a) for every `k < mgap p` and every `j` in a window,
        rightDiagonal k (j + p) = rightDiagonal k j
      (`p` acts as a period of diagonal `k`), and
  (b) rightDiagonal (mgap p) p != rightDiagonal (mgap p) 0
      (the first failure, at exactly that depth).

`rightDiagonal k j = evolve (j+k) j = rowCell (j+k) j` by `rowCell_eq_evolve`,
so the whole check is a `rowCell` computation the kernel can run.
-/

/-- Smallest `m ≥ start` with row `p` black at position `p - m`, searched with
fuel. -/
def firstBlackLeft (p : Nat) : Nat → Nat → Nat
  | 0, m => m
  | Nat.succ fuel, m =>
      if rowCell p ((p : ℤ) - (m : ℤ)) = true then m else firstBlackLeft p fuel (m + 1)

def mgap (p : Nat) : Nat := firstBlackLeft p (2 * p + 2) 1

set_option maxRecDepth 100000 in
/-- The first twenty gaps, matching `explorer/talus6_tower.mjs`'s
`m(p) for p=1..20: 1,3,1,4,1,3,1,6,1,3,1,4,1,3,1,7,1,3,1,4`. -/
example : (List.range 20).map (fun i => mgap (i + 1))
    = [1,3,1,4,1,3,1,6,1,3,1,4,1,3,1,7,1,3,1,4] := by decide

set_option maxRecDepth 200000 in
/-- (a) `p` is a period of every diagonal below `mgap p`, on a window of 16
indices, for `p = 1 .. 24`. -/
example :
    (List.range 24).all (fun i =>
      let p := i + 1
      (List.range (mgap p)).all (fun k =>
        (List.range 16).all (fun j =>
          rowCell (j + p + k) ((j : ℤ) + (p : ℤ)) == rowCell (j + k) (j : ℤ)))) = true := by
  decide

set_option maxRecDepth 100000 in
/-- (b) and it fails at exactly `mgap p`, at index 0, for `p = 1 .. 24`. -/
example :
    (List.range 24).all (fun i =>
      let p := i + 1
      let m := mgap p
      !(rowCell (m + p) (p : ℤ) == rowCell m (0 : ℤ))) = true := by
  decide
