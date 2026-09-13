import Rule30.Basic

/-!
Groma, 2026-09-13. The demonstration that `groma2_scratch_dirs.lean` can fail.
Two mutations, each of a single decision the companion file makes:

* `rowStep90mut` reads the left neighbour one bit away instead of two — the
  orientation error the packed representation invites. The Sierpinski guard
  `1, 5, 17, 85` then fails.
* the period claim for rule 90's left diagonal 16 is asserted at 8 instead of
  16, which the companion file proves false.

Lean must REJECT this file. If it is ever accepted, the companion's guards are
not doing anything.
-/

set_option maxRecDepth 100000

def rowStep90mut (r : Nat) : Nat := (2 * r) ^^^ r

def rowNat90mut : Nat → Nat
  | 0 => 1
  | t + 1 => rowStep90mut (rowNat90mut t)

example : (List.range 4).map rowNat90mut = [1, 5, 17, 85] := by decide

def rowStep90 (r : Nat) : Nat := (4 * r) ^^^ r
def rowNat90 : Nat → Nat
  | 0 => 1
  | t + 1 => rowStep90 (rowNat90 t)
def ld90 (k j : Nat) : Bool := (rowNat90 (j + k)).testBit k

example : ∀ j : Fin 40, ld90 16 ((j : Nat) + 8) = ld90 16 (j : Nat) := by decide
