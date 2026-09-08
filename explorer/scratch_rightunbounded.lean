import Rule30.Basic

/-!
Sextant, 2026-09-08. Kernel checks for the attack document
`docs/attacks/2026-09-08-rightdiagonal-minimal-periods-...`.

Everything here is stated over `rowCell`, which the kernel evaluates with
bignum arithmetic; `rowCell_eq_evolve` (on the board) turns each of these into
a statement about `evolve`, hence about `rightDiagonal k j = evolve (j+k) j`.

`m p` is the distance from the right edge of row `p` to the next black cell:
the least `d ≥ 1` with `rowCell p (p - d) = true`. The claim under test is

  (i)  `rowCell p (p - d) = false` for `1 ≤ d < m`, and `= true` at `d = m`
       — `m` really is that distance;
  (ii) `rowCell (t + p) p = rowCell t 0` for every `t < m`
       — every right diagonal shallower than `m` is `p`-periodic at index 0;
  (iii) `rowCell (m + p) p ≠ rowCell m 0`
       — right diagonal `m` is NOT `p`-periodic, so its minimal period does
       not divide `p`.

(ii) and (iii) together are `tau p = m p`.
-/

set_option maxRecDepth 40000

/-- (i), (ii), (iii) for thirteen values of `p`, including every power of two
to `256`. The deepest row read is `256 + 24 = 280`. -/
theorem tau_eq_m :
    ([(1, 1), (2, 3), (3, 1), (4, 4), (5, 1), (6, 3), (7, 1), (8, 6),
      (16, 7), (32, 9), (64, 15), (128, 16), (256, 24)] : List (Nat × Nat)).all
      (fun pm =>
        let p := pm.1
        let m := pm.2
        -- (i) m is the distance to the second-rightmost black cell of row p
        (List.range' 1 (m - 1)).all (fun d => rowCell p ((p : ℤ) - d) == false)
          && (rowCell p ((p : ℤ) - m) == true)
        -- (ii) diagonals shallower than m are p-periodic at index 0
          && (List.range m).all (fun t => rowCell (t + p) (p : ℤ) == rowCell t 0)
        -- (iii) diagonal m is not
          && (rowCell (m + p) (p : ℤ) != rowCell m 0))
      = true := by
  decide

/-- The corollary at one depth, in full: right diagonal `15` has minimal
period `128`, so `P_{m(64)} = 128 > 64`. Read as `rightDiagonal 15 j`, i.e.
`rowCell (j + 15) j`, over two full periods. -/
theorem period_fifteen :
    ((List.range 128).all (fun j => rowCell (j + 15 + 128) ((j : ℤ) + 128) == rowCell (j + 15) (j : ℤ)))
      && (rowCell (15 + 64) (64 : ℤ) != rowCell 15 0) = true := by
  decide

#print axioms tau_eq_m
#print axioms period_fifteen

/-- The seed's own left edge is what the argument's contradiction uses:
row `p` is black at position `-p`, so the second-rightmost black cell of row
`p` exists and `m p ≤ 2 p`. Checked for `p ≤ 40`. -/
example : (List.range' 1 40).all (fun p => rowCell p (-(p : ℤ)) == true) = true := by
  decide
