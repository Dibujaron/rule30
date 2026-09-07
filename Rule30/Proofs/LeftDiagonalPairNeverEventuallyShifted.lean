import Rule30.Basic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.LeftDiagonalRecurrence

/-!
**What this says.** No two left diagonals a fixed gap `d` apart ever settle into
lockstep for good: past any starting index `N`, some later index still shows a
difference, either on the pair itself or its very next cell.

**Why it is true.** If they matched forever from some point on, the shared
`recurrence` term cancels between diagonal `k` and diagonal `k + d`, dragging the
same agreement one diagonal further left, all the way down to diagonals `0`/`1`
(always black, `evolve_left_edge`/`evolve_left_second_diagonal`) and `d - 1`
forced white — but a diagonal that is white forever contradicts diagonal `0`
being black forever too, once the descent reaches it.

**Where the work is.** `xor_cancel`: the recurrence's shared
`leftDiagonal (m+1) (i+1) || leftDiagonal (m+2) i` term cancels by a Bool case
split, leaving `leftDiagonal m (i+2) = leftDiagonal (m+d) (i+2)` — the one step
that walks the agreement from diagonal `m+2` down to diagonal `m`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_pair_never_eventually_shifted (k d N : ℕ) (hd : 0 < d) :
  ∃ j ≥ N, leftDiagonal k j ≠ leftDiagonal (k + d) j ∨ leftDiagonal (k + 1) j ≠ leftDiagonal (k + d + 1) j
```
-/

namespace LeftDiagonalPairNeverEventuallyShiftedAux

private theorem xor_cancel {a b c : Bool} (h : xor a c = xor b c) : a = b := by
  cases a <;> cases b <;> cases c <;> simp_all

private theorem leftDiagonal_zero_true (j : ℕ) : leftDiagonal 0 j = true := by
  show evolve (j + 0) (-(j : ℤ)) = true
  rw [show j + 0 = j from by omega]
  exact evolve_left_edge j

private theorem leftDiagonal_one_true (j : ℕ) : leftDiagonal 1 j = true :=
  evolve_left_second_diagonal j

/-- The pair `(D m, D (m+1))` agrees with its `d`-shift from `M` on. -/
private def AgreePair (d m M : ℕ) : Prop :=
  (∀ j, M ≤ j → leftDiagonal m j = leftDiagonal (m + d) j) ∧
  (∀ j, M ≤ j → leftDiagonal (m + 1) j = leftDiagonal (m + d + 1) j)

private theorem agreePair_step (d m M : ℕ) (h : AgreePair d (m + 1) M) :
    AgreePair d m (M + 2) := by
  obtain ⟨ha, hb⟩ := h
  have ha' : ∀ j, M ≤ j → leftDiagonal (m + 1) j = leftDiagonal (m + d + 1) j := by
    intro j hj
    have h1 := ha j hj
    rwa [show m + 1 + d = m + d + 1 by omega] at h1
  have hb' : ∀ j, M ≤ j → leftDiagonal (m + 2) j = leftDiagonal (m + d + 2) j := by
    intro j hj
    have h1 := hb j hj
    rwa [show m + 1 + 1 = m + 2 by omega, show m + 1 + d + 1 = m + d + 2 by omega] at h1
  refine ⟨?_, fun j hj => ha' j (by omega)⟩
  intro j hj
  obtain ⟨i, rfl⟩ : ∃ i, j = i + 2 := ⟨j - 2, by omega⟩
  have hi : M ≤ i := by omega
  have R1 := leftDiagonal_recurrence m i
  have R2 := leftDiagonal_recurrence (m + d) i
  rw [← hb' (i + 1) (by omega), ← ha' (i + 1) (by omega), ← hb' i hi] at R2
  exact xor_cancel (R1.symm.trans R2)

private theorem agreePair_descend (d : ℕ) :
    ∀ k M, AgreePair d k M → AgreePair d 0 (M + 2 * k) := by
  intro k
  induction k with
  | zero => intro M h; simpa using h
  | succ n ih =>
    intro M h
    have h1 := ih (M + 2) (agreePair_step d n M h)
    rwa [show M + 2 + 2 * n = M + 2 * (n + 1) by omega] at h1

/-- Both `D m` and `D (m+1)` are white from `M` on. -/
private def WhitePair (m M : ℕ) : Prop :=
  (∀ j, M ≤ j → leftDiagonal m j = false) ∧
  (∀ j, M ≤ j → leftDiagonal (m + 1) j = false)

private theorem whitePair_step (m M : ℕ) (h : WhitePair (m + 1) M) : WhitePair m (M + 2) := by
  obtain ⟨ha, hb⟩ := h
  have hb' : ∀ j, M ≤ j → leftDiagonal (m + 2) j = false := by
    intro j hj
    have h1 := hb j hj
    rwa [show m + 1 + 1 = m + 2 by omega] at h1
  refine ⟨?_, fun j hj => ha j (by omega)⟩
  intro j hj
  obtain ⟨i, rfl⟩ : ∃ i, j = i + 2 := ⟨j - 2, by omega⟩
  have R := leftDiagonal_recurrence m i
  rw [hb' (i + 1) (by omega), ha (i + 1) (by omega), hb' i (by omega)] at R
  simpa using R.symm

private theorem whitePair_descend :
    ∀ m M, WhitePair m M → WhitePair 0 (M + 2 * m) := by
  intro m
  induction m with
  | zero => intro M h; simpa using h
  | succ n ih =>
    intro M h
    have h1 := ih (M + 2) (whitePair_step n M h)
    rwa [show M + 2 + 2 * n = M + 2 * (n + 1) by omega] at h1

end LeftDiagonalPairNeverEventuallyShiftedAux

open LeftDiagonalPairNeverEventuallyShiftedAux in
theorem leftDiagonal_pair_never_eventually_shifted (k d N : ℕ) (hd : 0 < d) :
    ∃ j ≥ N, leftDiagonal k j ≠ leftDiagonal (k + d) j ∨
      leftDiagonal (k + 1) j ≠ leftDiagonal (k + d + 1) j := by
  by_contra hcon
  push_neg at hcon
  have hstart : AgreePair d k N :=
    ⟨fun j hj => (hcon j hj).1, fun j hj => (hcon j hj).2⟩
  obtain ⟨A0, A1⟩ := agreePair_descend d k N hstart
  obtain ⟨M, hM⟩ : ∃ M, M = N + 2 * k := ⟨_, rfl⟩
  rw [← hM] at A0 A1
  -- the two diagonals `d` and `d+1` are eventually black
  have hd1 : ∀ j, M ≤ j → leftDiagonal d j = true := by
    intro j hj
    have h1 := A0 j hj
    rw [show (0 : ℕ) + d = d by omega] at h1
    rw [← h1, leftDiagonal_zero_true]
  have hd2 : ∀ j, M ≤ j → leftDiagonal (d + 1) j = true := by
    intro j hj
    have h1 := A1 j hj
    rw [show (0 : ℕ) + d + 1 = d + 1 by omega] at h1
    rw [← h1, leftDiagonal_one_true]
  obtain ⟨e, rfl⟩ : ∃ e, d = e + 1 := ⟨d - 1, by omega⟩
  -- diagonal `e = d - 1` is eventually white
  have he : ∀ j, M + 2 ≤ j → leftDiagonal e j = false := by
    intro j hj
    obtain ⟨i, rfl⟩ : ∃ i, j = i + 2 := ⟨j - 2, by omega⟩
    have R := leftDiagonal_recurrence e i
    rw [show e + 2 = e + 1 + 1 by omega] at R
    rw [hd2 (i + 1) (by omega), hd1 (i + 1) (by omega), hd2 i (by omega)] at R
    simpa using R.symm
  rcases Nat.eq_zero_or_pos e with rfl | hepos
  · -- d = 1: the left edge would be white
    have h2 := he (M + 2) (by omega)
    rw [leftDiagonal_zero_true] at h2
    exact Bool.noConfusion h2
  · obtain ⟨f, rfl⟩ : ∃ f, e = f + 1 := ⟨e - 1, by omega⟩
    -- diagonal `f = d - 2` is eventually white too
    have hf : ∀ j, M + 4 ≤ j → leftDiagonal f j = false := by
      intro j hj
      obtain ⟨i, rfl⟩ : ∃ i, j = i + 2 := ⟨j - 2, by omega⟩
      have R := leftDiagonal_recurrence f i
      rw [show f + 2 = f + 1 + 1 by omega] at R
      rw [hd1 (i + 1) (by omega), he (i + 1) (by omega), hd1 i (by omega)] at R
      simpa using R.symm
    have hw : WhitePair f (M + 4) := ⟨hf, fun j hj => he j (by omega)⟩
    obtain ⟨W0, _⟩ := whitePair_descend f (M + 4) hw
    have h2 := W0 (M + 4 + 2 * f) (by omega)
    rw [leftDiagonal_zero_true] at h2
    exact Bool.noConfusion h2
