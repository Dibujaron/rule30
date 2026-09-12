import Rule30.Basic

/-!
Talus, 2026-09-12.  Kernel checks for rung 2 of the occurrence ladder.

`rung2_le_200` is the claim to falsify, certified by the kernel for every
`a` from 2 to 200: all four words of length two occur in the window
`[a, 4a]` of the centre column.

`rung2_le_20_rowCell` is the same fact stated directly over the board's own
`rowCell`, for the smaller range the direct (unmemoised) evaluation reaches.

`a_one_fails` is the demonstration that the check can fail: the same
statement with `a = 1` allowed is *false*, and the kernel proves it false
rather than merely failing to prove it.

`alt_block_le_3a_le_200` is candidate C1's own finite instance: the centre
column has no alternating block of `3a + 1` cells beginning at time `a`,
for every `a` from 2 to 200.
-/

set_option maxRecDepth 200000

namespace Talus10

/-- `rowNat`'s own defining step, as the kernel sees it. -/
example : ∀ t : Fin 24, rowNat (t + 1) = rowStep (rowNat t) := by decide

/-- The packed row's diagonal bit is the centre column, on the first 24 rows. -/
example : (List.range 24).map (fun t => (rowNat t).testBit t)
    = (List.range 24).map (fun t => rowCell t 0) := by decide

/-- Walk the packed row from time `0`, and once `t ≥ a` record which of the
four words of length two occurs at `(t, t + 1)`, as a 4-bit mask. -/
def scan : Nat → Nat → Nat → Nat → Nat → Nat
  | 0, _, _, _, m => m
  | n + 1, t, r, a, m =>
      let b := r.testBit t
      let r' := rowStep r
      let b' := r'.testBit (t + 1)
      let m' := if a ≤ t then m ||| (1 <<< ((if b then 2 else 0) + (if b' then 1 else 0))) else m
      scan n (t + 1) r' a m'

/-- **The claim to falsify, for `2 ≤ a ≤ 200`.** All four words of length two
occur in `[a, 4a]`. -/
theorem rung2_le_200 :
    ((List.range 201).all fun a => a < 2 || (scan (4 * a) 0 1 a 0 == 15)) = true := by
  decide

/-- The same fact over `rowCell` itself, on the range direct evaluation reaches. -/
theorem rung2_le_20_rowCell :
    ((List.range 21).all fun a =>
      a < 2 ||
      ((List.range 4).all fun w =>
        (List.range (3 * a)).any fun j =>
          (if rowCell (a + j) 0 then 2 else 0) + (if rowCell (a + j + 1) 0 then 1 else 0) == w))
      = true := by
  decide

/-- **The check can fail.** At `a = 1` the window `[1, 4]` misses a word, so the
claim with `a ≥ 1` is false; the kernel proves the failure, it does not merely
decline to prove the claim. -/
theorem a_one_fails : scan 4 0 1 1 0 ≠ 15 := by decide

/-- And the word it misses is `00`: bit `0` of the mask is clear. -/
theorem a_one_misses_double_white : (scan 4 0 1 1 0) % 2 = 0 := by decide

/-- Walk the packed row and return the length, in cells, of the maximal
alternating block of the centre column beginning at time `a`. -/
def altBlock : Nat → Nat → Nat → Bool → Nat → Nat
  | 0, _, _, _, acc => acc
  | n + 1, t, r, prev, acc =>
      let b := r.testBit t
      if b == prev then acc else altBlock n (t + 1) (rowStep r) b (acc + 1)

/-- Candidate C1's finite instance: no alternating block of `3a + 1` cells
begins at time `a`, for `2 ≤ a ≤ 200`.  Equivalent to `rung2_le_200`'s
`00`-or-`11` half, and stated in the run vocabulary. -/
theorem alt_block_le_3a_le_200 :
    ((List.range 201).all fun a =>
      a < 2 ||
      (altBlock (4 * a + 2) (a + 1) (rowStep (Nat.rec 1 (fun _ r => rowStep r) a))
        (((Nat.rec 1 (fun _ r => rowStep r) a : Nat)).testBit a) 1 ≤ 3 * a)) = true := by
  decide

#print axioms rung2_le_200
#print axioms rung2_le_20_rowCell
#print axioms a_one_fails
#print axioms alt_block_le_3a_le_200

end Talus10
