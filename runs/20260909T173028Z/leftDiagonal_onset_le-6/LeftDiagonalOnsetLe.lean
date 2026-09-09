import Rule30.Basic
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Rule30.Proofs.LeftDiagonalRecurrence
import Mathlib.Tactic

/-!
**What this says.** Not a proof of `leftDiagonal_onset_le`; the wall stands. The file
proves that the wall follows from a statement about the packed-row map alone, started
from ANY number below `2^(k+1)` and not only from the seed's row: every such start is
repeating after `2k` steps (`leftDiagonal_onset_le_of_stepMod_preperiod`).
**Why it is true.** The low bits of a row read as a binary number evolve on their own,
so the seed's diagonals are the orbit of the number 1 under a map on `k+1` bits, and a
bound on that orbit's transient is the wall.
**Where the work is.** Nowhere in Lean. The kernel checks the universal statement for
every start at every width up to 12 and the seed's wall to depth 5000; the survey
function finds no exception to width 18 and no period above 4. Nothing here proves it.
-/

/-- One step of the packed row as a function of the number alone. -/
private def rowStep (r : ℕ) : ℕ := (4 * r) ^^^ ((2 * r) ||| r)

private theorem rowNat_succ_eq (t : ℕ) : rowNat (t + 1) = rowStep (rowNat t) := rfl

private theorem testBit_rowStep (r i : ℕ) :
    (rowStep r).testBit i
      = xor (decide (2 ≤ i) && r.testBit (i - 2))
          ((decide (1 ≤ i) && r.testBit (i - 1)) || r.testBit i) := by
  have h4 : 4 * r = 2 ^ 2 * r := by norm_num
  have h2 : 2 * r = 2 ^ 1 * r := by norm_num
  unfold rowStep
  rw [h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
    Nat.testBit_two_pow_mul]

private theorem rowStep_mod_two_pow (r n : ℕ) :
    rowStep r % 2 ^ n = rowStep (r % 2 ^ n) % 2 ^ n := by
  apply Nat.eq_of_testBit_eq
  intro i
  rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow, testBit_rowStep, testBit_rowStep]
  by_cases hi : i < n
  · have h1 : i - 1 < n := by omega
    have h2 : i - 2 < n := by omega
    simp [Nat.testBit_mod_two_pow, hi, h1, h2]
  · simp [hi]

/-- Autonomy of the low bits: two rows that agree on their low `n` bits still agree
on them one step later. -/
private theorem rowNat_succ_mod_two_pow_congr (s t n : ℕ)
    (h : rowNat s % 2 ^ n = rowNat t % 2 ^ n) :
    rowNat (s + 1) % 2 ^ n = rowNat (t + 1) % 2 ^ n := by
  rw [rowNat_succ_eq, rowNat_succ_eq, rowStep_mod_two_pow, h]
  exact (rowStep_mod_two_pow _ _).symm

/-- Once the low `n` bits return after `p` steps, they repeat with period `p` for ever. -/
private theorem rowNat_mod_two_pow_eq_of_eq (n T p : ℕ)
    (h : rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) :
    ∀ t ≥ T, rowNat t % 2 ^ n = rowNat (t + p) % 2 ^ n := by
  intro t ht
  induction t, ht using Nat.le_induction with
  | base => exact h
  | succ t _ ih =>
    rw [show t + 1 + p = (t + p) + 1 by omega]
    exact rowNat_succ_mod_two_pow_congr t (t + p) n ih

/-- A return of the low `k + 1` bits at time `T` settles every diagonal up to `k` from
the index where that diagonal meets row `T`. -/
private theorem leftDiagonal_periodicFrom_of_rowNat_return (k T p : ℕ)
    (h : rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1))
    (i : ℕ) (hi : i ≤ k) (N : ℕ) (hN : T ≤ N + i) :
    PeriodicFrom (leftDiagonal i) p N := by
  intro n hn
  rw [leftDiagonal_eq_rowNat_testBit, leftDiagonal_eq_rowNat_testBit]
  have hmod := rowNat_mod_two_pow_eq_of_eq (k + 1) T p h (n + i) (by omega)
  have key : ∀ m, (rowNat m).testBit i = (rowNat m % 2 ^ (k + 1)).testBit i := by
    intro m
    rw [Nat.testBit_mod_two_pow]
    simp [show i < k + 1 by omega]
  rw [key (n + p + i), key (n + i), show n + p + i = n + i + p by omega, hmod]

/-! ### The wall as a statement about a map on `k + 1` bits

The seed's rows, read as numbers modulo `2^(k+1)`, are the orbit of `1` under the map
`stepMod (k+1)`. The wall says that orbit is repeating from step `2k` on. The survey
below finds that EVERY start below `2^(k+1)` is repeating from step `2k` on, at every
width to 18, so the wall looks like a property of the map and not of the seed. -/

/-- One step of the packed row, truncated to its low `n` bits. -/
def stepMod (n r : ℕ) : ℕ := ((4 * r) ^^^ ((2 * r) ||| r)) % 2 ^ n

/-- The seed's rows modulo `2^n` are the orbit of `1` under the truncated step. -/
theorem rowNat_mod_eq_iterate (n t : ℕ) :
    rowNat t % 2 ^ n = (stepMod n)^[t] (1 % 2 ^ n) := by
  induction t with
  | zero => rfl
  | succ t ih =>
    rw [Function.iterate_succ_apply', ← ih, rowNat_succ_eq, rowStep_mod_two_pow]
    rfl

/-- The reduction: if every start below `2^(k+1)` is repeating under the truncated
step from step `2k` on, the wall holds. The hypothesis is the universal statement the
survey measures; only its instance at the start `1` is used. -/
theorem leftDiagonal_onset_le_of_stepMod_preperiod
    (H : ∀ k x : ℕ, x < 2 ^ (k + 1) → ∃ p > 0, ∀ t ≥ 2 * k,
      (stepMod (k + 1))^[t + p] x = (stepMod (k + 1))^[t] x) :
    ∀ k, ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N := by
  intro k
  obtain ⟨p, hp, hper⟩ := H k (1 % 2 ^ (k + 1)) (Nat.mod_lt _ (by positivity))
  refine ⟨p, hp, k, le_rfl,
    leftDiagonal_periodicFrom_of_rowNat_return k (2 * k) p ?_ k le_rfl k (by omega)⟩
  rw [rowNat_mod_eq_iterate, rowNat_mod_eq_iterate]
  exact (hper (2 * k) le_rfl).symm

set_option maxRecDepth 100000 in
set_option maxHeartbeats 4000000 in
/-- The universal statement checked by the kernel at every width up to 12, for every
start, with the period 4 that the survey finds is a common period of every state at
these widths. Evidence for the hypothesis of the reduction, not a proof of it. -/
theorem stepMod_preperiod_le_of_le_11 : ∀ k ≤ 11, ∀ x < 2 ^ (k + 1),
    (stepMod (k + 1))^[2 * k + 4] x = (stepMod (k + 1))^[2 * k] x := by
  decide +kernel

-- negative control: at width 10 some start is still moving at step 9 (the survey's
-- largest transient there is 11), so the check rejects a time before the wall's.
example : ¬ (∀ x < 2 ^ 10, (stepMod 10)^[13] x = (stepMod 10)^[9] x) := by
  decide +kernel

set_option maxRecDepth 100000 in
set_option maxHeartbeats 4000000 in
/-- The wall at every depth up to 5000, as one kernel computation: the low `k + 1` bits
of row `2k` return after 16 steps (the common period of every diagonal below depth
87867), which `leftDiagonal_periodicFrom_of_rowNat_return` turns into a settled
diagonal `k` by index `k`. Evidence, not a proof of the wall: the kernel checks 5001
congruences and says nothing about depth 5001. -/
theorem leftDiagonal_onset_le_of_le_5000 (k : ℕ) (hk : k ≤ 5000) :
    ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N := by
  have h : ∀ k ≤ 5000, rowNat (2 * k) % 2 ^ (k + 1) = rowNat (2 * k + 16) % 2 ^ (k + 1) := by
    decide +kernel
  exact ⟨16, by norm_num, k, le_rfl,
    leftDiagonal_periodicFrom_of_rowNat_return k (2 * k) 16 (h k hk) k le_rfl k (by omega)⟩

-- negative control: the kernel check must reject a wrong period (depth 200 has period 8, not 4)
example : ¬ (rowNat 400 % 2 ^ 201 = rowNat 404 % 2 ^ 201) := by decide +kernel

/-- A white cell on a diagonal is followed by another white cell exactly when the two
diagonals beneath it agree (read one and two cells further along). This is what holds
the boundary still: a white run on the diagonal just inside it is an agreement run of
the two diagonals beneath. -/
theorem leftDiagonal_white_succ_iff (m i : ℕ) (hw : leftDiagonal (m + 2) i = false) :
    leftDiagonal (m + 2) (i + 1) = false ↔
      leftDiagonal m (i + 2) = leftDiagonal (m + 1) (i + 1) := by
  rw [leftDiagonal_recurrence, hw]
  cases leftDiagonal m (i + 2) <;> cases leftDiagonal (m + 1) (i + 1) <;> decide

/-- The survey. For bit width `n`: `(n, seed preperiod, seed period, largest preperiod
over all starts, a start attaining it, largest period over all starts, number of starts
whose preperiod exceeds 2n - 2)`, by one linear-time walk of the functional graph of
`stepMod n`. Run with `#eval (List.range 18).map (fun n => surveyAll (n + 1))`; on
2026-09-09 the last field was 0 at every width to 18 and the largest period was 4. -/
def surveyAll (n : ℕ) : ℕ × ℕ × ℕ × ℕ × ℕ × ℕ × ℕ := Id.run do
  let N := 2 ^ n
  let mut pre : Array ℕ := Array.replicate N N
  let mut per : Array ℕ := Array.replicate N 0
  let mut idx : Array ℕ := Array.replicate N N
  for x in [0:N] do
    if pre[x]! == N then
      let mut path : Array ℕ := #[]
      let mut cur := x
      while pre[cur]! == N && idx[cur]! == N do
        idx := idx.set! cur path.size
        path := path.push cur
        cur := stepMod n cur
      if pre[cur]! != N then
        let basePre := pre[cur]!
        let basePer := per[cur]!
        let sz := path.size
        for i in [0:sz] do
          pre := pre.set! path[i]! (basePre + (sz - i))
          per := per.set! path[i]! basePer
      else
        let j := idx[cur]!
        let sz := path.size
        let L := sz - j
        for i in [0:sz] do
          pre := pre.set! path[i]! (if i < j then j - i else 0)
          per := per.set! path[i]! L
      for i in [0:path.size] do
        idx := idx.set! path[i]! N
  let mut maxPre := 0
  let mut arg := 0
  let mut maxPer := 0
  let mut bad := 0
  for x in [0:N] do
    if pre[x]! > maxPre then
      maxPre := pre[x]!
      arg := x
    if per[x]! > maxPer then
      maxPer := per[x]!
    if pre[x]! + 2 > 2 * n then
      bad := bad + 1
  return (n, pre[1]!, per[1]!, maxPre, arg, maxPer, bad)
