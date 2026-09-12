/-
Talus, 2026-09-12.  Rung 3 of the period ladder, three cells of it, checked by
the Lean kernel rather than by a script.

CLASS.  C2(a) = configurations white at every x < -a and black at -a.  A block
of the centre column of length T reads only cells in [-(T-1), T-1] of row 0
(the light cone), so "no configuration in C2(a) has a 3-periodic centre-column
block of length T" is a FINITE statement: the free cells are x in [-a+1, T-1],
so there are 2^(T+a-1) configurations to check.

MODEL.  A row is a Nat, bit i = cell(x = i - OFF).  One step of rule 30 is
  new = (2*r) XOR ( r OR (r >>> 1) )
since bit i of 2*r is cell(x-1), bit i of r is cell(x), bit i of (r >>> 1) is
cell(x+1).  Truncating to W bits puts a white boundary at x = W - OFF, whose
influence travels left at one cell per step and so cannot reach the centre
within the depths used here.  No Mathlib: `run` is the iterate, written out.
-/

def W : Nat := 40
def OFF : Nat := 16

def step30 (r : Nat) : Nat := ((2 * r) ^^^ (r ||| (r >>> 1))) % 2 ^ W

def run : Nat → Nat → Nat
  | 0, r => r
  | (t + 1), r => run t (step30 r)

/-- centre cell at time `t` of the picture grown from row `r0`. -/
def centre (r0 t : Nat) : Bool := (run t r0).testBit OFF

/-- row 0 of the member of C2(a) whose free cells (x = -a+1 upward) are `v`. -/
def rowOf (a v : Nat) : Nat := (1 <<< (OFF - a)) ||| (v <<< (OFF - a + 1))

/-- is the centre column `p`-periodic over its first `T` cells? -/
def hasBlock (a v p T : Nat) : Bool :=
  (List.range (T - p)).all (fun t => centre (rowOf a v) (t + p) == centre (rowOf a v) t)

set_option maxRecDepth 4000000

/-! ### the model is rule 30, on the cone the prize is about -/

-- one step from the single black cell gives the row 111
example : step30 (1 <<< OFF) = (7 <<< (OFF - 1)) := by decide

-- the seed's own centre column starts 1 1 0 1 1 1 0 0 1 1 0, which is crystal
-- 46's settledCenter s(0..10) = 11011100110 (the two agree for k <= 17)
example : (List.range 11).map (fun t => centre (1 <<< OFF) t)
        = [true, true, false, true, true, true, false, false, true, true, false] := by decide

/-! ### the three cells of rung 3: f(3,a) = 8, 10, 9 for a = 1, 2, 3 -/

-- a = 1: no member of C2(1) has a 3-periodic centre block of length 9 ...
theorem rung3_a1_no9 :
    (List.range 512).all (fun v => !hasBlock 1 v 3 9) = true := by decide

-- ... and one of them has a 3-periodic block of length 8, so f(3,1) = 8 exactly.
theorem rung3_a1_yes8 :
    (List.range 512).any (fun v => hasBlock 1 v 3 8) = true := by decide

-- a = 2: f(3,2) = 10
theorem rung3_a2_no11 :
    (List.range 4096).all (fun v => !hasBlock 2 v 3 11) = true := by decide

theorem rung3_a2_yes10 :
    (List.range 4096).any (fun v => hasBlock 2 v 3 10) = true := by decide

-- a = 3: f(3,3) = 9
theorem rung3_a3_no10 :
    (List.range 4096).all (fun v => !hasBlock 3 v 3 10) = true := by decide

theorem rung3_a3_yes9 :
    (List.range 4096).any (fun v => hasBlock 3 v 3 9) = true := by decide

/-! ### the p = 1 row, for comparison: f(1,a) = a + 2 -/

theorem rung1_a3_no6 :
    (List.range 4096).all (fun v => !hasBlock 3 v 1 6) = true := by decide

theorem rung1_a3_yes5 :
    (List.range 4096).any (fun v => hasBlock 3 v 1 5) = true := by decide

/-! ### the check can fail, and here is the proof that it can: the same
statement one cell shorter is FALSE, proved rather than merely left unproven. -/

theorem mutant_a1_8_is_false :
    ¬ ((List.range 512).all (fun v => !hasBlock 1 v 3 8) = true) := by decide

/-! ### the local law C3 proposes as a node, checked at the Bool level rather
than asserted: for rule 30 the RIGHT neighbour matters exactly when the centre
cell is white.  This is the dual of `rule30_left_local_law` (crystals A2). -/

def r30 (l c r : Bool) : Bool := l ^^ (c || r)

theorem right_local_law :
    ∀ l c r r' : Bool, (r30 l c r != r30 l c r') = (c == false && (r != r')) := by decide

#print axioms right_local_law
#print axioms rung3_a1_no9
#print axioms rung3_a2_no11
#print axioms rung3_a3_no10
#print axioms rung1_a3_no6
#print axioms mutant_a1_8_is_false
