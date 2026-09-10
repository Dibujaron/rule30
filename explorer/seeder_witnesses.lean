import Rule30.Basic

-- leftDiagonal_onset_le_not_of_black_ladder
#eval (List.range 10).all fun j => leftDiagonal 3 j == decide (j % 2 = 0)

-- leftDiagonal_periodicFrom_of_rowNat_agree
#eval (List.range 7).all fun k => (List.range (2 * k + 1)).all fun T => (List.range 9).all fun p => !(decide (rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1))) || (List.range 12).all fun m => decide ((rowNat (2 * k + m + p)).testBit k = (rowNat (2 * k + m)).testBit k)

-- rowNat_agree_forward
#eval (List.range 30).all fun T => (List.range 6).all fun n => (List.range 6).all fun p => (List.range 10).all fun d => !(decide (rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n)) || decide (rowNat (T + d) % 2 ^ n = rowNat (T + d + p) % 2 ^ n)

-- rowNat_testBit_zero
#eval (List.range 300).all fun t => (rowNat t).testBit 0
