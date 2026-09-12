import Rule30.Basic

/-!
Sextant, 2026-09-12.  Kernel check for the attack document
`docs/attacks/2026-09-12-the-4-t-constraint-...`.

Three facts, all by kernel computation against `rule30` / `evolveFrom` itself.

**K1 (C1's construction).**  Every word occurs as a *window* of row `t` of a
finite configuration.  Here the word `101011` at positions `0..5` of row `4`,
from the configuration got by solving rule 30 leftward four times with the free
cells set white and padding with white on both sides.

**K2 (the non-edge witness).**  The word `11101`, read at positions `0..4`, is
row `1` of no finite configuration — checked here over every configuration
supported in `[-3, 7]`, which is every case that can matter: a finite
configuration with a black cell at `p ≥ 8` has one at `p + 1 ≥ 9` after a step
(the rightmost black cell moves right by exactly one, `rightmost_difference_
moves_right` against the all-white configuration), and one at `p ≤ -4` has one
at `p - 1 ≤ -5`, so either way the image is not supported in `[0, 4]`.

**K3 (the two controls).**  `11011` and `11001` *are* rows of finite
configurations, with witnesses.  So `11101` shares its first two cells with a
reachable row and its last two cells with a different reachable row and is
still unreachable: no condition on a bounded prefix and a bounded suffix can
cut out the reachable set.
-/

namespace SextantNine

set_option maxRecDepth 40000

/-- The finite configuration whose cells from `off` on are `l`, white elsewhere. -/
def cfgAt (off : ℤ) (l : List Bool) : Config :=
  fun i => if off ≤ i ∧ i < off + (l.length : ℤ) then l.getD (i - off).toNat false else false

/-- The `w`-cell configuration at offset `off` whose cells are the bits of `m`. -/
def cfgBits (off : ℤ) (w m : Nat) : Config :=
  cfgAt off ((List.range w).map (fun j => m.testBit j))

/-! ### K1 -/

/-- Row 0: the leftward solve of `101011` run four times, at positions `-4 … 9`. -/
def preK1 : Config :=
  cfgAt (-4) [true, false, true, false, true, true,
              false, false, false, false, false, false, false, false]

/-- The window `101011` really is there, at positions `0 … 5` of row `4`. -/
theorem k1_window :
    (List.range 6).map (fun k => evolveFrom preK1 4 (k : ℤ))
      = [true, false, true, false, true, true] := by
  decide

/-! ### K2 -/

/-- The configuration `11101` — black at `0,1,2`, white at `3`, black at `4`,
white everywhere else — read at positions `-4 … 8`, which is the whole of where
the image of a configuration supported in `[-3, 7]` can be black. -/
def targetK2 : List Bool :=
  [false, false, false, false, true, true, true, false, true, false, false, false, false]

/-- No configuration supported in `[-3, 7]` maps to the configuration `11101`:
for every one of the `2 ^ 11` such configurations, some cell of the image in
`[-4, 8]` differs.  Note this compares the image as a *configuration*, not
merely on the five cells of the word — a window match is easy and is not the
question. -/
theorem k2_unreachable :
    ∀ m : Fin 2048,
      ((List.range 13).any
        (fun k => rule30 (cfgBits (-3) 11 m.val) ((k : ℤ) - 4)
                    != targetK2.getD k false)) = true := by
  decide

/-! ### K3 -/

/-- `11011` is row 1 of the configuration with cells `101` at positions `1 … 3`
— so `11101`'s first two cells are a reachable row's first two cells. -/
theorem k3_prefix_control :
    (List.range 5).map (fun k => rule30 (cfgAt 1 [true, false, true]) (k : ℤ))
      = [true, true, false, true, true] := by
  decide

/-- `11001` is row 1 of the configuration with cells `111` at positions `1 … 3`
— so `11101`'s last two cells are a reachable row's last two cells. -/
theorem k3_suffix_control :
    (List.range 5).map (fun k => rule30 (cfgAt 1 [true, true, true]) (k : ℤ))
      = [true, true, false, false, true] := by
  decide

#print axioms k1_window
#print axioms k2_unreachable
#print axioms k3_prefix_control
#print axioms k3_suffix_control

end SextantNine
