import Rule30.Basic

/-! Seeder scratch: candidate falsification witnesses, evaluated. -/

-- E: the forward white-time law at column 1, over two configurations.
#eval (List.range 12).all (fun t =>
  column initialConfig 0 t ||
    (column initialConfig 1 (t + 1) == (column initialConfig 1 t || column initialConfig 2 t)))

#eval
  let X : Config := fun i => decide (i = 0) || decide (i = 3)
  (List.range 11).all (fun t =>
    column X 0 t || (column X 1 (t + 1) == (column X 1 t || column X 2 t)))

-- non-vacuity of E's range: some white centre times below 12
#eval (List.range 12).any (fun t => !(column initialConfig 0 t))

-- C: every N < 8 has a white centre cell at or after it, below 12
#eval (List.range 8).all (fun N =>
  (List.range 12).any (fun t => decide (N ≤ t) && !(centerColumn t)))

-- D: every N < 8 has a black centre cell at or after it, below 12
#eval (List.range 8).all (fun N =>
  (List.range 12).any (fun t => decide (N ≤ t) && centerColumn t))

-- a deliberate break: the same as E with column 2 replaced by column 3
#eval (List.range 12).all (fun t =>
  column initialConfig 0 t ||
    (column initialConfig 1 (t + 1) == (column initialConfig 1 t || column initialConfig 3 t)))
