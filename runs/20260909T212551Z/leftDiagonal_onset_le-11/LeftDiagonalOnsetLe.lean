import Rule30.Basic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Rule30.Proofs.LeftDiagonalRecurrence
import Rule30.Proofs.RowNatReturnSuccIff
import Rule30.Proofs.PeriodicFromMul
import Mathlib.Tactic

/-!
**What this says.** Not a proof of `leftDiagonal_onset_le`; the wall stands. The file
defines the settled boundary of the picture as a walk on the packed rows — it advances
one bit when the cell just inside it is black or the next bit already agrees, and
stands still otherwise — and proves the wall follows if the walk stands still at most
`k` times in its first `2k` steps.
**Why it is true.** The walk never claims more agreement than `rowNat_return_succ_iff`
licenses, so every bit below it is settled; every step either advances or is frozen, so
at most `k` frozen steps means the boundary has passed bit `k` by time `2k`.
**Where the work is.** Nowhere in Lean; the induction is bookkeeping. What is open is why
the walk is frozen on about a quarter of its steps, measured here to 50,000 rows and
proved for none.
-/

/-- The settled boundary walk against the shift `p`. `bdry p t` is a number of low bits
on which rows `t` and `t + p` agree. It starts at `1` (the black left edge) and follows
the exact law of `rowNat_return_succ_iff`: it advances by one when the cell just inside
it is black, or when the next bit already agrees, and stands still otherwise. -/
def bdry (p : ℕ) : ℕ → ℕ
  | 0 => 1
  | t + 1 =>
    if (rowNat t).testBit (bdry p t - 1) = true ∨
        rowNat t % 2 ^ (bdry p t + 1) = rowNat (t + p) % 2 ^ (bdry p t + 1)
    then bdry p t + 1 else bdry p t

/-- The number of frozen steps of the walk before time `t`. -/
def frozen (p : ℕ) : ℕ → ℕ
  | 0 => 0
  | t + 1 => frozen p t + (if bdry p (t + 1) = bdry p t then 1 else 0)

theorem bdry_succ (p t : ℕ) :
    bdry p (t + 1) = if (rowNat t).testBit (bdry p t - 1) = true ∨
        rowNat t % 2 ^ (bdry p t + 1) = rowNat (t + p) % 2 ^ (bdry p t + 1)
      then bdry p t + 1 else bdry p t := rfl

theorem le_bdry_succ (p t : ℕ) : bdry p t ≤ bdry p (t + 1) := by
  rw [bdry_succ]; split_ifs <;> omega

theorem bdry_succ_le (p t : ℕ) : bdry p (t + 1) ≤ bdry p t + 1 := by
  rw [bdry_succ]; split_ifs <;> omega

theorem bdry_mono (p : ℕ) {a b : ℕ} (h : a ≤ b) : bdry p a ≤ bdry p b := by
  induction b, h using Nat.le_induction with
  | base => exact le_rfl
  | succ b _ ih => exact le_trans ih (le_bdry_succ p b)

theorem bdry_pos (p t : ℕ) : 1 ≤ bdry p t := bdry_mono p (Nat.zero_le t)

/-- Every step of the walk either advances or is frozen. -/
theorem bdry_add_frozen (p t : ℕ) : bdry p t + frozen p t = t + 1 := by
  induction t with
  | zero => rfl
  | succ t ih =>
    have h1 := le_bdry_succ p t
    have h2 := bdry_succ_le p t
    simp only [frozen]
    split_ifs with h <;> omega

private theorem rowNat_testBit_zero (t : ℕ) : (rowNat t).testBit 0 = true := by
  have h : leftDiagonal 0 t = true := evolve_left_edge t
  rw [leftDiagonal_eq_rowNat_testBit] at h
  simpa using h

private theorem agree_one (s t : ℕ) : rowNat s % 2 ^ 1 = rowNat t % 2 ^ 1 := by
  apply Nat.eq_of_testBit_eq
  intro i
  rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow]
  rcases i with _ | i
  · have hs := rowNat_testBit_zero s
    have ht := rowNat_testBit_zero t
    simp at hs ht
    simp [hs, ht]
  · simp

private theorem agree_of_agree_le (a b m n : ℕ) (h : m ≤ n) (H : a % 2 ^ n = b % 2 ^ n) :
    a % 2 ^ m = b % 2 ^ m := by
  have hd : 2 ^ m ∣ 2 ^ n := pow_dvd_pow 2 h
  rw [← Nat.mod_mod_of_dvd a hd, H, Nat.mod_mod_of_dvd b hd]

/-- Everything under the walk is settled: rows `t` and `t + p` agree on their low
`bdry p t` bits. -/
theorem agree_bdry (p t : ℕ) :
    rowNat t % 2 ^ bdry p t = rowNat (t + p) % 2 ^ bdry p t := by
  induction t with
  | zero => exact agree_one 0 (0 + p)
  | succ t ih =>
    rw [bdry_succ]
    obtain ⟨n, hn⟩ : ∃ n, bdry p t = n + 1 :=
      ⟨bdry p t - 1, by have := bdry_pos p t; omega⟩
    rw [hn] at ih ⊢
    split_ifs with hC
    · have hC' : (rowNat t).testBit n = true ∨
          rowNat t % 2 ^ (n + 2) = rowNat (t + p) % 2 ^ (n + 2) := by
        rcases hC with h | h
        · left; simpa using h
        · right; exact h
      have := (rowNat_return_succ_iff n t p ih).mpr hC'
      rw [show t + p + 1 = t + 1 + p by omega] at this
      exact this
    · rcases n with _ | m
      · exact agree_one _ _
      · have h1 := agree_of_agree_le _ _ (m + 1) (m + 2) (by omega) ih
        have := (rowNat_return_succ_iff m t p h1).mpr (Or.inr ih)
        rw [show t + p + 1 = t + 1 + p by omega] at this
        exact this

/-- A diagonal the walk has passed by time `2k` is settled from index `k`. -/
theorem leftDiagonal_periodicFrom_of_bdry (k p : ℕ) (h : k + 1 ≤ bdry p (2 * k)) :
    PeriodicFrom (leftDiagonal k) p k := by
  intro n hn
  rw [leftDiagonal_eq_rowNat_testBit, leftDiagonal_eq_rowNat_testBit]
  have hmono : bdry p (2 * k) ≤ bdry p (n + k) := bdry_mono p (by omega)
  have hag := agree_of_agree_le _ _ (k + 1) _ (by omega) (agree_bdry p (n + k))
  have key : ∀ m, (rowNat m).testBit k = (rowNat m % 2 ^ (k + 1)).testBit k := by
    intro m
    rw [Nat.testBit_mod_two_pow]
    simp
  rw [key (n + p + k), key (n + k), show n + p + k = n + k + p by omega, hag]

/-- The reduction: if for every `k` some shift's walk has passed bit `k` by time `2k`,
the wall holds. -/
theorem leftDiagonal_onset_le_of_bdry
    (H : ∀ k, ∃ p > 0, k + 1 ≤ bdry p (2 * k)) :
    ∀ k, ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N := by
  intro k
  obtain ⟨p, hp, h⟩ := H k
  exact ⟨p, hp, k, le_rfl, leftDiagonal_periodicFrom_of_bdry k p h⟩

/-- The same reduction read as "the boundary stands still at most half the time": if
for every `k` some shift's walk is frozen at most `k` times in its first `2k` steps,
the wall holds. -/
theorem leftDiagonal_onset_le_of_frozen_le
    (H : ∀ k, ∃ p > 0, frozen p (2 * k) ≤ k) :
    ∀ k, ∃ p > 0, ∃ N ≤ k, PeriodicFrom (leftDiagonal k) p N := by
  intro k
  obtain ⟨p, hp, h⟩ := H k
  have := bdry_add_frozen p (2 * k)
  exact ⟨p, hp, k, le_rfl, leftDiagonal_periodicFrom_of_bdry k p (by omega)⟩

/-- A white cell on a diagonal is followed by another white cell exactly when the two
diagonals beneath it agree (read one and two cells further along). -/
theorem leftDiagonal_white_succ_iff (m i : ℕ) (hw : leftDiagonal (m + 2) i = false) :
    leftDiagonal (m + 2) (i + 1) = false ↔
      leftDiagonal m (i + 2) = leftDiagonal (m + 1) (i + 1) := by
  rw [leftDiagonal_recurrence, hw]
  cases leftDiagonal m (i + 2) <;> cases leftDiagonal (m + 1) (i + 1) <;> decide

/-- Period transfer: a sequence with a positive period `p` from `N` and any period `q`
from `M` has period `q` from `N` already. Private in two closed files; here so its
route is checked before it is proposed. -/
theorem periodicFrom_trans_period (f : ℕ → Bool) (p q N M : ℕ) (hp : 0 < p)
    (hN : PeriodicFrom f p N) (hM : PeriodicFrom f q M) : PeriodicFrom f q N := by
  intro n hn
  have hMp : M ≤ M * p := Nat.le_mul_of_pos_right M hp
  have h1 := periodicFrom_mul f p N hN M (n + q) (by omega)
  have h2 := periodicFrom_mul f p N hN M n hn
  have h3 := hM (n + M * p) (by omega)
  rw [← h1, ← h2, ← h3]
  congr 1
  omega

set_option maxRecDepth 100000 in
set_option maxHeartbeats 4000000 in
/-- The walk against the shift `16` has passed bit `k` by time `2k` for every `k ≤ 100`,
checked by the kernel. Evidence for the hypothesis of the reduction, not a proof of it. -/
theorem bdry_sixteen_le_of_le_100 : ∀ k ≤ 100, k + 1 ≤ bdry 16 (2 * k) := by
  decide +kernel

/-- One pass over the rows: `(bdry p T, frozen p T)` computed without recomputing rows.
Not proved equal to `bdry`; used only to report the walk at depths the kernel will not
reach. -/
def walkFast (p T : ℕ) : ℕ × ℕ := Id.run do
  let mut r := 1
  let mut rp := rowNat p
  let mut d := 1
  let mut f := 0
  for _ in [0:T] do
    let c := r.testBit (d - 1) || (r % 2 ^ (d + 1) == rp % 2 ^ (d + 1))
    if c then d := d + 1 else f := f + 1
    r := (4 * r) ^^^ ((2 * r) ||| r)
    rp := (4 * rp) ^^^ ((2 * rp) ||| rp)
  return (d, f)

#eval (List.range 41).map (fun k => (k, bdry 16 (2 * k), frozen 16 (2 * k)))
#eval String.ofList ((List.range 200).map (fun t => if bdry 16 (t + 1) = bdry 16 t then '0' else '1'))
#eval walkFast 16 200
#eval walkFast 16 2000
#eval walkFast 16 20000
#eval walkFast 16 50000
