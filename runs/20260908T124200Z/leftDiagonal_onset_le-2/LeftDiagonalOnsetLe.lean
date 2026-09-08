import Rule30.Basic
import Rule30.Proofs.RowCellEqEvolve
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.PeriodicFromMul
import Rule30.Proofs.LeftDiagonalRecurrence
import Rule30.Proofs.LeftDiagonalPeriodicFromStepOfBlack
import Rule30.Proofs.BoolDrivenPeriodicFromOfReturn
import Mathlib.Tactic.Ring

/-! Not a proof of `leftDiagonal_onset_le`; the wall stands. What this file holds,
from Selvage's attempt of 2026-09-08:

* `leftDiagonal_eq_rowNat_testBit`: diagonal `k` at index `j` is bit `k` of the packed
  row `j + k`. So the first `k + 1` diagonals are the low `k + 1` bits of `rowNat`, an
  autonomous finite system, and the wall says the orbit of `1` under that truncated map
  reaches its cycle within `2k` steps.
* `leftDiagonal_onset_le_of_line`: the wall follows if, at every step, the settled
  neighbour on the half-speed line is black or the new diagonal is already settled one
  cell outside the line. That is the induction step with nothing hidden: the residual is
  that one Bool condition per diagonal, true for the seed by measurement and unproved.
* The half-line search below: the same onset question for every boundary column, not
  just the seed's. Over all 4096 boundaries the worst onset for `k ≤ 12` is 5; a beam
  over boundaries to `k = 80` finds the seed's onsets plus 8 (a translated left side)
  and ratio at most 0.65; rows with extra black cells reach ratio 0.61 by `k = 400`. -/

/-- Bridge to the row model: diagonal `k` at index `j` is bit `k` of row `j + k`. -/
theorem leftDiagonal_eq_rowNat_testBit (k j : ℕ) :
    leftDiagonal k j = (rowNat (j + k)).testBit k := by
  unfold leftDiagonal
  rw [← rowCell_eq_evolve]
  unfold rowCell
  rw [if_pos (by constructor <;> omega)]
  congr 1
  omega

/-- The wall, conditional on its own boundary line: if for every `m` the cell of
diagonal `m + 1` at index `m + 2` is black, or diagonal `m + 2` already agrees with
itself one period later at index `m + 1`, then every diagonal has settled by index `k`. -/
theorem leftDiagonal_onset_le_of_line
    (h : ∀ m, leftDiagonal (m + 1) (m + 2) = true ∨
      leftDiagonal (m + 2) (m + 1 + 2 ^ (m + 2)) = leftDiagonal (m + 2) (m + 1))
    (k : ℕ) : ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N := by
  suffices hs : ∀ k, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) (2 ^ k) N by
    obtain ⟨N, hN, hp⟩ := hs k
    exact ⟨2 ^ k, Nat.two_pow_pos k, N, hN, hp⟩
  intro k
  induction k using Nat.strong_induction_on with
  | _ k ih =>
    match k, ih with
    | 0, _ =>
      refine ⟨0, Nat.zero_le _, ?_⟩
      have hconst : ∀ j, leftDiagonal 0 j = true := by
        intro j
        show evolve (j + 0) (-(j : ℤ)) = true
        rw [show j + 0 = j from by omega]
        exact evolve_left_edge j
      intro n _
      rw [hconst (n + 2 ^ 0), hconst n]
    | 1, _ =>
      refine ⟨0, Nat.zero_le _, ?_⟩
      have hconst : ∀ j, leftDiagonal 1 j = true := by
        intro j
        exact evolve_left_second_diagonal j
      intro n _
      rw [hconst (n + 2 ^ 1), hconst n]
    | m + 2, ih =>
      obtain ⟨N0, hN0, h0⟩ := ih m (by omega)
      obtain ⟨N1, hN1, h1⟩ := ih (m + 1) (by omega)
      have hpow1 : 2 ^ (m + 1) = 2 * 2 ^ m := by ring
      have hpow2 : 2 ^ (m + 2) = 2 * 2 ^ (m + 1) := by ring
      -- both drivers with period 2^(m+1) from index m+1
      have h0' : PeriodicFrom (leftDiagonal m) (2 ^ (m + 1)) (m + 1) := by
        intro n hn
        rw [hpow1]
        exact periodicFrom_mul (leftDiagonal m) (2 ^ m) N0 h0 2 n (by omega)
      have h1' : PeriodicFrom (leftDiagonal (m + 1)) (2 ^ (m + 1)) (m + 1) := by
        intro n hn
        exact h1 n (by omega)
      rcases h m with hb | hs
      · -- black on the line: reset, period unchanged, onset m+2
        have hstep := leftDiagonal_periodicFrom_step_of_black m (2 ^ (m + 1)) (m + 1) (m + 1)
          le_rfl h0' h1' hb
        refine ⟨m + 2, le_rfl, ?_⟩
        rw [hpow2]
        exact periodicFrom_mul (leftDiagonal (m + 2)) (2 ^ (m + 1)) (m + 2) hstep 2
      · -- settled one cell outside the line: return, period doubled, onset m+1
        refine ⟨m + 1, by omega, ?_⟩
        refine bool_driven_periodicFrom_of_return
          (fun i => leftDiagonal m (i + 2)) (fun i => leftDiagonal (m + 1) (i + 1))
          (leftDiagonal (m + 2)) (2 ^ (m + 2)) (m + 1) (m + 1) ?_ ?_ ?_ le_rfl hs
        · intro i
          exact leftDiagonal_recurrence m i
        · intro i hi
          have hh := periodicFrom_mul (leftDiagonal m) (2 ^ (m + 1)) (m + 1) h0' 2 (i + 2)
            (by omega)
          dsimp only
          rw [hpow2, show i + 2 * 2 ^ (m + 1) + 2 = i + 2 + 2 * 2 ^ (m + 1) from by omega]
          exact hh
        · intro i hi
          have hh := periodicFrom_mul (leftDiagonal (m + 1)) (2 ^ (m + 1)) (m + 1) h1' 2 (i + 1)
            (by omega)
          dsimp only
          rw [hpow2, show i + 2 * 2 ^ (m + 1) + 1 = i + 1 + 2 * 2 ^ (m + 1) from by omega]
          exact hh

/-! ## The half-line search

The driven left half-line: a white left half grown under a boundary column `c` with
`c 0 = true`. Diagonal `k` of it depends on `c 0 .. c k` only, and `c (m + 2)` is the
initial state of diagonal `m + 2`'s one-bit machine; it matters only when diagonal
`m + 1` is white at index 1. Kept here so the next attempt can re-run the numbers in
the note above with an `#eval`; nothing below is used by the theorems. -/

/-- D (m+2) from D m and D (m+1), initial state `c`. One shorter than `dm`. -/
def nextDiag (dm dm1 : Array Bool) (c : Bool) : Array Bool := Id.run do
  let mut d : Array Bool := Array.mkEmpty dm.size
  d := d.push c
  for i in [0 : dm.size - 2] do
    let v := xor dm[i+2]! (dm1[i+1]! || d[i]!)
    d := d.push v
  return d

/-- Least N with d (n + p) = d n for all n ≥ N inside the array. -/
def onsetOf (d : Array Bool) (p : Nat) : Nat := Id.run do
  let mut last := 0
  for n in [0 : d.size - p] do
    if d[n]! != d[n+p]! then last := n + 1
  return last

/-- Depth-first over boundaries sharing prefixes: `acc[m]` is the worst onset of
diagonal `m` over every boundary seen, with the boundary (as bits) that made it.
`worstOnsets 12` gave `#[(0,0), (1,1), (1,5), (0,0), (2,9), (2,9), (2,9), (3,9),
(1,129), (4,9), (4,9), (5,9), (4,2049)]`. -/
partial def dfs (k L : Nat) (m pre : Nat) (dm dm1 : Array Bool)
    (acc : Array (Nat × Nat)) : Array (Nat × Nat) :=
  let o := onsetOf dm1 (2 ^ (m + 1))
  let acc := if o > (acc[m+1]!).1 then acc.set! (m + 1) (o, pre) else acc
  if m + 1 ≥ k then acc else
    let acc := dfs k L (m + 1) pre dm1 (nextDiag dm dm1 false) acc
    dfs k L (m + 1) (pre ||| (1 <<< (m + 2))) dm1 (nextDiag dm dm1 true) acc

def worstOnsets (k : Nat) : Array (Nat × Nat) :=
  let L := 2 ^ (k + 1) + k + 4
  let d0 : Array Bool := Array.replicate L true
  let d1f : Array Bool := (Array.replicate (L - 1) true).set! 0 false
  let d1t : Array Bool := Array.replicate (L - 1) true
  let acc : Array (Nat × Nat) := Array.replicate (k + 1) (0, 0)
  let acc := dfs k L 0 1 d0 d1f acc
  dfs k L 0 3 d0 d1t acc

/-- Rows of any initial row supported on `x ≥ 0`, as the row model does: bit `x + t` of
row `t` is the cell at `x`. Diagonal `k` at index `j` is bit `k` of row `j + k`.
`onsetsOf 1 400 900` has worst ratio `23/48`; `onsetsOf 9 400 900` has `29/48`;
`onsetsOf 129 400 900` has `77/290`. -/
def rowsOf (init : Nat) (T : Nat) : Array Nat := Id.run do
  let mut rows : Array Nat := Array.mkEmpty (T + 1)
  let mut r := init
  for _ in [0 : T + 1] do
    rows := rows.push r
    r := (4 * r) ^^^ ((2 * r) ||| r)
  return rows

def diagOfRows (rows : Array Nat) (k L : Nat) : Array Bool :=
  (Array.range L).map fun j => (rows[j + k]!).testBit k

/-- (k, onset, onset with period 32 as a guard) for k < K; valid while periods divide 16. -/
def onsetsOf (init K L : Nat) : Array (Nat × Nat × Nat) :=
  let rows := rowsOf init (K + L + 40)
  (Array.range K).map fun k =>
    let d := diagOfRows rows k (L + 40)
    (k, onsetOf d 16, onsetOf d 32)

def worstRatio (a : Array (Nat × Nat × Nat)) : Nat × Nat := Id.run do
  let mut best := (0, 1)
  for (k, o, _) in a do
    if k > 0 && o * best.2 > best.1 * k then best := (o, k)
  return best
