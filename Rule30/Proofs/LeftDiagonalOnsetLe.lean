import Rule30.Basic

/-! Scratch experiment (to be replaced): the driven left half-line.
Diagonal k of the half-line grown from a white left half and a boundary
column c, with c 0 = true. Question: is the onset of diagonal k at most k
for EVERY boundary c, or only for the seed's? -/

/-- D (m+2) from D m and D (m+1), initial state `c`. One shorter than `dm`. -/
def nextDiag (dm dm1 : Array Bool) (c : Bool) : Array Bool := Id.run do
  let mut d : Array Bool := Array.mkEmpty dm.size
  d := d.push c
  for i in [0 : dm.size - 2] do
    let v := xor dm[i+2]! (dm1[i+1]! || d[i]!)
    d := d.push v
  return d

/-- Diagonal k, length about L - k, for boundary c with c 0 = true. -/
def diagK (c : Nat → Bool) (k L : Nat) : Array Bool :=
  let d0 : Array Bool := Array.replicate L true
  let d1 : Array Bool := (Array.replicate (L - 1) true).set! 0 (c 1)
  let rec go : Nat → Nat → Array Bool → Array Bool → Array Bool
    | 0, _, dm, _ => dm
    | fuel + 1, m, dm, dm1 => go fuel (m + 1) dm1 (nextDiag dm dm1 (c (m + 2)))
  go k 0 d0 d1

/-- Least N with d (n + p) = d n for all n ≥ N inside the array. -/
def onsetOf (d : Array Bool) (p : Nat) : Nat := Id.run do
  let mut last := 0
  for n in [0 : d.size - p] do
    if d[n]! != d[n+p]! then last := n + 1
  return last

/-- Max onset of diagonal k over every boundary c with c 0 = true, and a witness. -/
def maxOnset (k : Nat) : Nat × Nat := Id.run do
  let L := 3 * 2 ^ k + k + 4
  let mut best := 0
  let mut bestm := 0
  for m in [0 : 2 ^ k] do
    let mm := 2 * m + 1
    let d := diagK (fun i => Nat.testBit mm i) k L
    let o := onsetOf d (2 ^ k)
    if o > best then
      best := o
      bestm := mm
  return (best, bestm)

/-- The seed's own centre column, from the row model. -/
def seedC (t : Nat) : Bool := (rowNat t).testBit t

#eval (List.range 9).map fun k => (k, maxOnset k)
#eval (List.range 30).map fun k => (k, onsetOf (diagK seedC k (3 * 2 ^ k + k + 4)) (2 ^ k))
