import Rule30.Basic

/-!
Talus, 2026-09-09. The kernel confirmation of the staircase step at k = 400.

`leftDiagonal_onset_le_of_le_5000` closes every k ≤ 5000 with the constant 16.
The engine says the constant is not free: it is the largest eventual left-diagonal
period at or below k, so it is 8 for k ≤ 399 and 16 from k = 400 -- NKS p. 871's
fifth period doubling -- and it must become 32 at k = 87867, NKS's sixth.

These four `decide +kernel` checks pin the step at k = 400 in the kernel rather
than in a script:

  * at k = 399, period 8 already works at row 2k = 798;
  * at k = 400, period 8 FAILS at row 2k = 800, so the constant cannot stay 8;
  * at k = 400, period 16 works;
  * at k = 5000, period 8 fails too -- so 16 is the least power of two that
    `leftDiagonal_onset_le_of_le_5000` could have used.

The condition is the one `leftDiagonal_onset_le_iff_rowNat_return` uses: rows `2k`
and `2k + p` agree in their lowest `k+1` bits.
-/

set_option maxRecDepth 100000

-- k = 399: the constant 8 still works
example : rowNat (2 * 399) % 2 ^ 400 = rowNat (2 * 399 + 8) % 2 ^ 400 := by
  decide +kernel

-- k = 400: the constant 8 breaks, exactly at NKS's fifth doubling
example : rowNat (2 * 400) % 2 ^ 401 ≠ rowNat (2 * 400 + 8) % 2 ^ 401 := by
  decide +kernel

-- k = 400: 16 works
example : rowNat (2 * 400) % 2 ^ 401 = rowNat (2 * 400 + 16) % 2 ^ 401 := by
  decide +kernel

-- k = 5000: 8 is not enough there either, so 16 is forced for the whole range
example : rowNat (2 * 5000) % 2 ^ 5001 ≠ rowNat (2 * 5000 + 8) % 2 ^ 5001 := by
  decide +kernel
