import Rule30.Basic

/-!
Groma, 2026-09-13. Kernel checks for the directional section of the bispecial
sighting. Three things, all by `decide` against the board's own row model:

1. the centre column prefix my JavaScript engines print;
2. rule 30's left diagonals 3 and 8 have minimal periods 2 and 4, so the rows of
   the left-diagonal array really are eventually periodic where I say they are;
3. the control: rules 90 and 150 have left diagonals of minimal period 16 and 32
   (so their diagonal periods are unbounded too) while their centre columns are
   white / black over the whole checked range. That is the witness that
   "unbounded left-diagonal periods" cannot imply an aperiodic centre column.

Guards against an orientation error: the rule-90 and rule-150 row maps are
checked against hand-computed first rows (`1,5,17,85` and `1,7,21,107`), which
are asymmetric facts about the cone rather than symmetric checks — rule 90 is
its own mirror, so a mirror check is vacuous there.
-/

-- rule 30, from the board's own `rowCell`
def ld30 (k j : Nat) : Bool := rowCell (j + k) (-(j : ℤ))

set_option maxRecDepth 100000

-- 1. the prefix
example : (List.range 24).map (fun t => rowCell t 0)
    = [true, true, false, true, true, true, false, false, true, true, false, false,
       false, true, false, true, true, false, false, true, false, false, true, true] := by
  decide

-- 2. left diagonal 3 has minimal period 2; left diagonal 8 minimal period 4
example : ∀ j : Fin 30, ld30 3 ((j : Nat) + 4) = ld30 3 ((j : Nat) + 2) := by decide
example : ¬ (∀ j : Fin 30, ld30 3 ((j : Nat) + 3) = ld30 3 ((j : Nat) + 2)) := by decide
example : ∀ j : Fin 30, ld30 8 ((j : Nat) + 8) = ld30 8 ((j : Nat) + 4) := by decide
example : ¬ (∀ j : Fin 30, ld30 8 ((j : Nat) + 6) = ld30 8 ((j : Nat) + 4)) := by decide

-- 3. the control. Packed row maps: bit b of row t is the cell at x = b - t.
def rowStep90 (r : Nat) : Nat := (4 * r) ^^^ r
def rowStep150 (r : Nat) : Nat := (4 * r) ^^^ (2 * r) ^^^ r

def rowNat90 : Nat → Nat
  | 0 => 1
  | t + 1 => rowStep90 (rowNat90 t)

def rowNat150 : Nat → Nat
  | 0 => 1
  | t + 1 => rowStep150 (rowNat150 t)

-- orientation guards: the first four rows, computed by hand from the rule
example : (List.range 4).map rowNat90 = [1, 5, 17, 85] := by decide
example : (List.range 4).map rowNat150 = [1, 7, 21, 107] := by decide

def c90 (t : Nat) : Bool := (rowNat90 t).testBit t
def c150 (t : Nat) : Bool := (rowNat150 t).testBit t
def ld90 (k j : Nat) : Bool := (rowNat90 (j + k)).testBit k
def ld150 (k j : Nat) : Bool := (rowNat150 (j + k)).testBit k

-- the centre columns are constant over the whole checked range
example : ∀ t : Fin 80, 1 ≤ (t : Nat) → c90 (t : Nat) = false := by decide
example : ∀ t : Fin 80, c150 (t : Nat) = true := by decide

-- and the left diagonals have unbounded periods: 16 at k = 16, 32 at k = 32
example : ∀ j : Fin 40, ld90 16 ((j : Nat) + 16) = ld90 16 (j : Nat) := by decide
example : ¬ (∀ j : Fin 40, ld90 16 ((j : Nat) + 8) = ld90 16 (j : Nat)) := by decide
example : ∀ j : Fin 40, ld90 32 ((j : Nat) + 32) = ld90 32 (j : Nat) := by decide
example : ¬ (∀ j : Fin 40, ld90 32 ((j : Nat) + 16) = ld90 32 (j : Nat)) := by decide

example : ∀ j : Fin 40, ld150 16 ((j : Nat) + 32) = ld150 16 (j : Nat) := by decide
example : ¬ (∀ j : Fin 40, ld150 16 ((j : Nat) + 16) = ld150 16 (j : Nat)) := by decide
