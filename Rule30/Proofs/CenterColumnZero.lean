import Rule30.Basic

theorem centerColumn_zero : centerColumn 0 = true := by
  unfold centerColumn evolve initialConfig
  decide
