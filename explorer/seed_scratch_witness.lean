import Rule30.Basic

#eval (List.range 10).all (fun n => leftDiagonal 3 (n + 1) == !leftDiagonal 3 n)
#eval (List.range 12).all (fun t => centerColumn t == (rowNat t).testBit t)
