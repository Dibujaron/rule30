import Rule30.Basic

/-! Seeder scratch, 2026-09-10: the exact, self-contained witness expressions
that go into `blueprint/proposals/next.json`, run as the harness will run them. -/

-- Witness for `column_neg_one_damage_mask`.
#eval (List.range 12).all (fun v => ([1, 2] : List ℤ).all (fun f =>
  (List.range 9).all (fun t =>
    !(decide (column (fun i => decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3)) 0 t
        = column (fun i => xor (decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3))
            (decide (i = f))) 0 t) &&
      decide (column (fun i => decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3)) 0 (t + 1)
        = column (fun i => xor (decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3))
            (decide (i = f))) 0 (t + 1))) ||
    decide (xor (column (fun i => decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3)) (-1) t)
        (column (fun i => xor (decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3))
            (decide (i = f))) (-1) t)
      = ((! column (fun i => decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3)) 0 t) &&
          xor (column (fun i => decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3)) 1 t)
            (column (fun i => xor (decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3))
              (decide (i = f))) 1 t))))))

-- Witness for `column_neg_two_damage_derivative`.
#eval (List.range 12).all (fun v => ([1, 2] : List ℤ).all (fun f =>
  (List.range 9).all (fun t =>
    !(decide (column (fun i => decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3)) 0 t
        = column (fun i => xor (decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3))
            (decide (i = f))) 0 t) &&
      decide (column (fun i => decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3)) 0 (t + 1)
        = column (fun i => xor (decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3))
            (decide (i = f))) 0 (t + 1))) ||
    decide (xor (column (fun i => decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3)) (-2) t)
        (column (fun i => xor (decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3))
            (decide (i = f))) (-2) t)
      = xor (xor (column (fun i => decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3)) (-1) t)
              (column (fun i => xor (decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3))
                (decide (i = f))) (-1) t))
          (xor (column (fun i => decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3)) (-1) (t + 1))
              (column (fun i => xor (decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3))
                (decide (i = f))) (-1) (t + 1)))))))

-- Witness for `column_damage_zero_of_black_run`.
#eval (List.range 8).all (fun v => ([1, 2] : List ℤ).all (fun f =>
  (List.range 4).all (fun j => (List.range 7).all (fun t =>
    !((List.range (j + 1)).all (fun s =>
        decide (column (fun i => decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3)) 0 (t + s)
          = column (fun i => xor (decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3))
              (decide (i = f))) 0 (t + s))) &&
      (List.range j).all (fun s =>
        column (fun i => decide ((i * i * i + (v : ℤ) * i + 1) % 7 < 3)) 0 (t + s))) ||
    (List.range (j + 1)).all (fun i =>
      decide (column (fun x => decide ((x * x * x + (v : ℤ) * x + 1) % 7 < 3)) (-(i : ℤ)) t
        = column (fun x => xor (decide ((x * x * x + (v : ℤ) * x + 1) % 7 < 3))
            (decide (x = f))) (-(i : ℤ)) t))))))

-- Witness for `centerColumn_eq_evolve_mul_pow`.
#eval ([(0, 1), (0, 2), (0, 3), (1, 1), (1, 2), (1, 3), (2, 1), (2, 2), (3, 1)]
    : List (ℕ × ℕ)).all
  (fun km => decide (evolve (km.2 * 2 ^ km.1 + km.1) ((km.2 * 2 ^ km.1 : ℕ) : ℤ)
    = centerColumn km.1))
