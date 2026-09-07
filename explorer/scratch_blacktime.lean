import Rule30.Basic

/-!
Kernel checks for the attack document of 2026-09-07 on the pair of columns 0
and 1 under the cone constraint. Everything here is `decide` over finite
lists; `lake env lean explorer/scratch_blacktime.lean` either accepts it or
does not.

1. The sideways solve of the true columns 0 and 1, read from `rowCell`, is
   white at time 0 for k = 1..40: the cone constraint in its time-0 form.
2. The column-0 / right-half bijection, one instance: for b = (1100)^∞ and a
   white right half, the configuration built by the half-line and the
   sideways solve has column 0 equal to b for 20 steps.
3. The black-time test: for every periodic pattern of period ≤ 5 and every
   left word of length ≤ 2, the identity c(t+1) = ¬(column -1 at t) that a
   configuration white beyond -2 would have to satisfy at every black time
   fails by t = 40. So no configuration white on x ≤ -3 has a column 0 that
   is periodic from time 0 with period ≤ 5, whatever its right half.
-/

set_option maxRecDepth 100000

namespace Scratch

/-- One step of rule 30 on a finite row, white outside. `row.get! i` is cell `i`. -/
def stepList (row : List Bool) : List Bool :=
  (List.range row.length).map fun i =>
    let l := if i = 0 then false else row.getD (i - 1) false
    let c := row.getD i false
    let r := row.getD (i + 1) false
    xor l (c || r)

def evolveList (row : List Bool) : Nat → List Bool
  | 0 => row
  | t + 1 => stepList (evolveList row t)

/-- Column at index `at` for `T` steps. -/
def columnList (row : List Bool) (at_ T : Nat) : List Bool :=
  (List.range T).map fun t => (evolveList row t).getD at_ false

/-- The sideways solve: from columns `c` (index 0) and `d` (index 1), the
column `k` to the left, as a list; `next` shortens by one each step. -/
def leftStep (prev cur : List Bool) : List Bool :=
  (List.range (cur.length - 1)).map fun s =>
    xor (cur.getD (s + 1) false) (cur.getD s false || prev.getD s false)

/-- `L k (0)` for `k = 0..K`: the left cells of row 0 given `c`, `d`. -/
def leftAtZero (c d : List Bool) : Nat → List Bool
  | 0 => [c.getD 0 false]
  | k + 1 =>
      -- recompute the chain (cheap enough for the sizes here)
      let rec go : Nat → List Bool × List Bool
        | 0 => (d, c)
        | j + 1 => let (p, q) := go j; (q, leftStep p q)
      let (_, col) := go (k + 1)
      leftAtZero c d k ++ [col.getD 0 false]

/-- The half-line `x ≥ 1` started from `Y` (cell 1 first), boundary `b`: column 1 for `T` steps. -/
def halfLineRight (b Y : List Bool) (T : Nat) : List Bool :=
  let W := T + Y.length + 2
  let rec run : Nat → List Bool → List Bool → List Bool
    | 0, _, acc => acc.reverse
    | t + 1, row, acc =>
        let cur := b.getD (T - (t + 1)) false :: row
        let row' := (List.range W).map fun x =>
          xor (cur.getD x false) (cur.getD (x + 1) false || cur.getD (x + 2) false)
        run t row' (row.getD 0 false :: acc)
  run T (Y ++ List.replicate (W - Y.length) false) []

/-- The half-line `x ≤ -1` started from `w` (cell -1 first), boundary `c`: column -1 for `T` steps. -/
def halfLineLeft (c w : List Bool) (T : Nat) : List Bool :=
  let W := T + w.length + 2
  let rec run : Nat → List Bool → List Bool → List Bool
    | 0, _, acc => acc.reverse
    | t + 1, row, acc =>
        let cur := c.getD (T - (t + 1)) false :: row   -- cur[k] = cell -k
        let row' := (List.range W).map fun k =>
          xor (cur.getD (k + 2) false) (cur.getD (k + 1) false || cur.getD k false)
        run t row' (row.getD 0 false :: acc)
  run T (w ++ List.replicate (W - w.length) false) []

/-- The black-time test fails somewhere before `T`. -/
def blackTimeFails (c w : List Bool) (T : Nat) : Bool :=
  let L := halfLineLeft c w T
  (List.range T).any fun t =>
    c.getD t false && (c.getD (t + 1) false == L.getD t false)

def periodic (pat : List Bool) (T : Nat) : List Bool :=
  (List.range T).map fun t => pat.getD (t % pat.length) false

def allWords : Nat → List (List Bool)
  | 0 => [[]]
  | n + 1 => (allWords n).flatMap fun w => [false :: w, true :: w]

end Scratch

open Scratch

-- 1. cone at time 0 from the true columns, k = 1..40
example :
    (leftAtZero ((List.range 90).map fun t => rowCell t 0)
                ((List.range 90).map fun t => rowCell t 1) 40).drop 1
      = List.replicate 40 false := by decide

-- 2. the bijection, one instance: b = (1100)^∞, Y white, 20 steps
example :
    let b := periodic [true, true, false, false] 60
    let R := halfLineRight b [] 60
    let left := (leftAtZero b R 40).drop 1        -- cells -1, -2, ..., -40
    let X := left.reverse ++ b.take 1 ++ List.replicate 40 false
    columnList X 40 20 = b.take 20 := by decide

-- 3. black-time test: every pattern with period ≤ 5, every left word ≤ 2, fails by t = 40
example :
    ((List.range 5).flatMap fun p => allWords (p + 1)).all fun pat =>
      pat.any id →
      ((List.range 3).flatMap allWords).all fun w =>
        blackTimeFails (periodic pat 42) w 40 := by decide
