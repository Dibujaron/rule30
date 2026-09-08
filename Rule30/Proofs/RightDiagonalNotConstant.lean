import Rule30.Basic
import Rule30.Proofs.RightDiagonalRecurrence
import Rule30.Proofs.RightDiagonalPeriodicFromPow
import Rule30.Proofs.EvolveRightEdge
import Rule30.Proofs.EvolveRightSecondDiagonal
import Mathlib.Tactic.Ring

/-!
**What this says.** Every right diagonal past the edge takes both colours somewhere; only the edge itself (`rightDiagonal 0`, always black) is constant.
**Why it is true.** A constant diagonal forces its driver in `rightDiagonal_recurrence` to be white past index 2, and periodicity (`rightDiagonal_periodicFrom_pow`) then makes the diagonal two steps shallower white everywhere -- which strong induction, bottoming out at `evolve_right_edge`, rules out.
**Where the work is.** Turning "white from index 2 on" into "white everywhere" by walking any index forward two periods.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_not_constant (k : ℕ) (hk : 1 ≤ k) :
  (∃ j, rightDiagonal k j = true) ∧ ∃ j, rightDiagonal k j = false
```
-/

private lemma right_forces_false (m : ℕ) (c : Bool)
    (hc : ∀ j, rightDiagonal (m + 2) j = c) :
    ∀ j, rightDiagonal m j = false := by
  have hgen : ∀ (c a b : Bool), c = xor c (a || b) → b = false := by
    intro c a b h
    cases c <;> cases a <;> cases b <;> simp_all
  have hbase : ∀ i, rightDiagonal m (i + 2) = false := by
    intro i
    have hrec := rightDiagonal_recurrence m i
    rw [hc (i + 1), hc i] at hrec
    exact hgen c (rightDiagonal (m + 1) (i + 1)) (rightDiagonal m (i + 2)) hrec
  intro j
  have hp := rightDiagonal_periodicFrom_pow m
  have hpow : 0 < 2 ^ m := by positivity
  have h1 : rightDiagonal m (j + 2 ^ m) = rightDiagonal m j := hp j (by omega)
  have h2 : rightDiagonal m (j + 2 ^ m + 2 ^ m) = rightDiagonal m (j + 2 ^ m) :=
    hp (j + 2 ^ m) (by omega)
  have hij : j + 2 ^ m + 2 ^ m = (j + 2 * 2 ^ m - 2) + 2 := by omega
  calc rightDiagonal m j
      = rightDiagonal m (j + 2 ^ m) := h1.symm
    _ = rightDiagonal m (j + 2 ^ m + 2 ^ m) := h2.symm
    _ = false := by rw [hij]; exact hbase (j + 2 * 2 ^ m - 2)

private lemma right_contradiction (m : ℕ)
    (ihm : 1 ≤ m → (∃ j, rightDiagonal m j = true) ∧ (∃ j, rightDiagonal m j = false))
    (c : Bool) (hc : ∀ j, rightDiagonal (m + 2) j = c) : False := by
  have hmfalse := right_forces_false m c hc
  rcases Nat.eq_zero_or_pos m with hm0 | hmpos
  · subst hm0
    have ht : rightDiagonal 0 0 = true := by
      unfold rightDiagonal
      simpa using evolve_right_edge 0
    rw [hmfalse 0] at ht
    exact absurd ht (by decide)
  · obtain ⟨j, hj⟩ := (ihm hmpos).1
    rw [hmfalse j] at hj
    exact absurd hj (by decide)

theorem rightDiagonal_not_constant (k : ℕ) (hk : 1 ≤ k) :
    (∃ j, rightDiagonal k j = true) ∧ (∃ j, rightDiagonal k j = false) := by
  revert hk
  induction k using Nat.strong_induction_on with
  | _ k ih =>
    intro hk
    match k, hk, ih with
    | 0, hk0, _ => exact absurd hk0 (by omega)
    | 1, _, _ =>
        refine ⟨⟨0, ?_⟩, ⟨1, ?_⟩⟩
        · have h := evolve_right_second_diagonal 0
          unfold rightDiagonal
          simpa using h
        · have h := evolve_right_second_diagonal 1
          unfold rightDiagonal
          simpa using h
    | (m + 2), _, ih =>
        have ihm : 1 ≤ m → (∃ j, rightDiagonal m j = true) ∧ (∃ j, rightDiagonal m j = false) :=
          ih m (by omega)
        constructor
        · by_contra h
          push Not at h
          have hc : ∀ j, rightDiagonal (m + 2) j = false := by
            intro j
            cases hb : rightDiagonal (m + 2) j with
            | false => rfl
            | true => exact absurd hb (h j)
          exact right_contradiction m ihm false hc
        · by_contra h
          push Not at h
          have hc : ∀ j, rightDiagonal (m + 2) j = true := by
            intro j
            cases hb : rightDiagonal (m + 2) j with
            | true => rfl
            | false => exact absurd hb (h j)
          exact right_contradiction m ihm true hc
