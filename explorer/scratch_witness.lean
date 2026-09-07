import Rule30.Basic
import Rule30.Prize

#eval (List.range 10).all fun N => (List.range (N + 1)).all fun M =>
  decide (|2 * (((Finset.range N).filter fun n => centerColumn n = true).card : ℤ) - (N : ℤ)| ≤
    |2 * (((Finset.range M).filter fun n => centerColumn n = true).card : ℤ) - (M : ℤ)|
      + ((N : ℤ) - (M : ℤ)))

-- and the ℕ sandwich, same range
#eval (List.range 10).all fun N => (List.range (N + 1)).all fun M =>
  decide (((Finset.range M).filter fun n => centerColumn n = true).card ≤
      ((Finset.range N).filter fun n => centerColumn n = true).card ∧
    ((Finset.range N).filter fun n => centerColumn n = true).card ≤
      ((Finset.range M).filter fun n => centerColumn n = true).card + (N - M))
