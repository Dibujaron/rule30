import Rule30.Basic

/-!
Kernel checks for the attack document of 2026-09-07 on the centre column of
the settled configuration. `lake env lean explorer/scratch_settledcenter.lean`
either accepts this file or does not.

The settled centre column is `s k = leftDiagonal k (2 ^ k)`: the cell on left
diagonal `k` at index `2 ^ k`, which is at or past the onset and a multiple of
the period that `leftDiagonal_periodicFrom_pow` guarantees. The engine
(`explorer/settledcenter.mjs`) reads `s (0..12) = 1101110011000` and the settled
configuration `Sigma x = leftDiagonal x (2 ^ (x + 1) - x)` as `1100100011100`.
Here the kernel checks, from `rowCell`, which `rowCell_eq_evolve` ties to
`evolve`:

1. the values of `s k` for `k ≤ 10` (row `2 ^ 10 + 10 = 1034` at the deepest);
2. that the index `2 ^ k` can be replaced by `2 * 2 ^ k` (`k ≤ 9`) and
   `3 * 2 ^ k` (`k ≤ 8`) without changing the value, the instances of the
   well-definedness lemma the document proposes;
3. that `s k = centerColumn k` for `k ≤ 10`, the diagonals whose onset is `0`;
4. the values of `Sigma x` for `x ≤ 9`.

None of this is a theorem about `s`; each line is one finite instance.
-/

set_option maxRecDepth 100000

/-- `leftDiagonal k j` through the row model. -/
def dg (k j : Nat) : Bool := rowCell (j + k) (-(j : Int))

-- 1. s k = leftDiagonal k (2 ^ k) for k ≤ 10
example : (List.range 11).map (fun k => dg k (2 ^ k)) =
    [true, true, false, true, true, true, false, false, true, true, false] := by decide

-- 2. the index may be any positive multiple of 2 ^ k
example : (List.range 10).all (fun k => dg k (2 * 2 ^ k) == dg k (2 ^ k)) = true := by decide
example : (List.range 9).all (fun k => dg k (3 * 2 ^ k) == dg k (2 ^ k)) = true := by decide

-- 3. s k = centerColumn k for k ≤ 10 (onset 0)
example : (List.range 11).all (fun k => dg k (2 ^ k) == rowCell k 0) = true := by decide

-- 4. Sigma x = leftDiagonal x (2 ^ (x + 1) - x) for x ≤ 9
example : (List.range 10).map (fun x => dg x (2 ^ (x + 1) - x)) =
    [true, true, false, false, true, false, false, false, true, true] := by decide
