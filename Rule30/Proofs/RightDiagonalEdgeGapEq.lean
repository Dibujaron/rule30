import Rule30.Basic
import Rule30.Proofs.RightDiagonalFirstFailure
import Rule30.Proofs.RightDiagonalPeriodicFromPow
import Rule30.Proofs.PeriodicFromMul
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.MinimalPeriodDvd
import Rule30.Proofs.RightDiagonalAntiperiodicOfOddDriver
import Rule30.Proofs.RightDiagonalPeriodicFromStepOfEvenDriver
import Rule30.Proofs.RightDiagonalPeriodicFromStep

/-!
**What this says.** Each row of the picture has a black cell at its far right
and then a stretch of white before the next black one; this says how wide that
white stretch is. Read the diagonals running down-right from the top: each one
repeats with its own period. The white gap in row `p` is exactly the depth of
the first diagonal whose period does not divide `p`.

**Why it is true.** A diagonal whose period divides `p` cannot differ from
itself `p` steps on, and the first such difference is precisely where the
nearest black cell sits (`rightDiagonal_first_failure`). So the shallow
diagonals, whose periods do divide, force white, and the first one that fails
is forced to differ — hence black.

**Where the work is.** Getting the failing diagonal to differ from itself at
all. Failing to divide is a negative statement; turning it into the positive
"this diagonal is the exact opposite of itself `p` steps on" goes through the
parity of its driver over one period, and then through `p` being an odd
multiple of that period.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.rightDiagonal_edge_gap_eq (p D : ℕ) (hp : 0 < p) (hlow : ∀ d < D + 2, minimalPeriod (rightDiagonal d) ∣ p)
  (hhi : ¬minimalPeriod (rightDiagonal (D + 2)) ∣ p) :
  (∀ (d : ℕ), 1 ≤ d → d < D + 2 → evolve p (↑p - ↑d) = false) ∧ evolve p (↑p - ↑(D + 2)) = true
```
-/

/-- **The cone condition, at any row.** If `p` is a period of every right
diagonal `d ≤ D` at the origin, row `p` is white at every position `p - d`
with `1 ≤ d ≤ D`. -/
private theorem cone_row (p D : ℕ)
    (hper : ∀ d : ℕ, 1 ≤ d → d ≤ D → PeriodicFrom (rightDiagonal d) p 0) :
    ∀ d : ℕ, 1 ≤ d → d ≤ D → evolve p ((p : ℤ) - (d : ℤ)) = false := by
  classical
  by_contra hcon
  push_neg at hcon
  obtain ⟨d0, hd1, hdD, hd⟩ := hcon
  have hd' : evolve p ((p : ℤ) - (d0 : ℤ)) = true := by
    revert hd; cases evolve p ((p : ℤ) - (d0 : ℤ)) <;> simp
  have hex : ∃ d : ℕ, 1 ≤ d ∧ d ≤ D ∧ evolve p ((p : ℤ) - (d : ℤ)) = true :=
    ⟨d0, hd1, hdD, hd'⟩
  set m := Nat.find hex with hmdef
  obtain ⟨hm1, hmD, hmblack⟩ := Nat.find_spec hex
  have hwhite : ∀ e : ℕ, 0 < e → e < m → evolve p ((p : ℤ) - (e : ℤ)) = false := by
    intro e he0 hem
    have hnot := Nat.find_min hex hem
    by_contra hf
    exact hnot ⟨he0, by omega, by revert hf; cases evolve p ((p : ℤ) - (e : ℤ)) <;> simp⟩
  have hff := (rightDiagonal_first_failure p m (by omega) hwhite hmblack).2
  have hper0 := hper m hm1 hmD 0 (Nat.zero_le 0)
  simp only [Nat.zero_add] at hper0
  have hL : rightDiagonal m p = evolve (m + p) (p : ℤ) := by
    unfold rightDiagonal; rw [Nat.add_comm p m]
  have hR : rightDiagonal m 0 = evolve m 0 := by
    unfold rightDiagonal; norm_num
  rw [hL, hR] at hper0
  exact hff hper0

/-- If right diagonal `D` is antiperiodic at `p`, row `p` has a black cell
within distance `D` of its right edge. -/
private theorem edge_black_within (p D : ℕ) (hp : 0 < p)
    (hanti : ∀ j : ℕ, rightDiagonal D (j + p) = !rightDiagonal D j) :
    ∃ d : ℕ, 1 ≤ d ∧ d ≤ D ∧ evolve p ((p : ℤ) - (d : ℤ)) = true := by
  classical
  by_contra hcon
  push_neg at hcon
  have hw : ∀ d : ℕ, 1 ≤ d → d ≤ D → evolve p ((p : ℤ) - (d : ℤ)) = false := by
    intro d h1 h2
    have := hcon d h1 h2
    revert this; cases evolve p ((p : ℤ) - (d : ℤ)) <;> simp
  have hleft : evolve p ((p : ℤ) - ((2 * p : ℕ) : ℤ)) = true := by
    have h := evolve_left_edge p
    rw [show (p : ℤ) - ((2 * p : ℕ) : ℤ) = -(p : ℤ) by push_cast; ring]
    exact h
  have hex : ∃ d : ℕ, 1 ≤ d ∧ evolve p ((p : ℤ) - (d : ℤ)) = true :=
    ⟨2 * p, by omega, hleft⟩
  set m := Nat.find hex with hmdef
  obtain ⟨hm1, hmblack⟩ := Nat.find_spec hex
  have hwhite : ∀ e : ℕ, 0 < e → e < m → evolve p ((p : ℤ) - (e : ℤ)) = false := by
    intro e he0 hem
    have hnot := Nat.find_min hex hem
    by_contra hf
    exact hnot ⟨he0, by revert hf; cases evolve p ((p : ℤ) - (e : ℤ)) <;> simp⟩
  have hDm : D < m := by
    by_contra h
    have : evolve p ((p : ℤ) - (m : ℤ)) = false := hw m hm1 (by omega)
    rw [this] at hmblack; exact Bool.false_ne_true hmblack
  have hff := (rightDiagonal_first_failure p m (by omega) hwhite hmblack).1 D hDm
  have hA := hanti 0
  rw [show (0 : ℕ) + p = p from Nat.zero_add _] at hA
  have hL : rightDiagonal D p = evolve (D + p) (p : ℤ) := by
    unfold rightDiagonal; rw [Nat.add_comm p D]
  have hR : rightDiagonal D 0 = evolve D 0 := by unfold rightDiagonal; norm_num
  rw [hL, hR, hff] at hA
  exact (Bool.not_ne_self _) hA.symm

/-- Antiperiodicity at `L` gives antiperiodicity at every odd multiple. -/
private theorem antiperiodic_odd_mul (f : ℕ → Bool) (L : ℕ)
    (h : ∀ j, f (j + L) = !f j) : ∀ c j : ℕ, f (j + (2 * c + 1) * L) = !f j := by
  have h2 : ∀ j, f (j + 2 * L) = f j := by
    intro j
    have := h (j + L)
    rw [show j + L + L = j + 2 * L by ring] at this
    rw [this, h j, Bool.not_not]
  intro c
  induction c with
  | zero => intro j; simpa using h j
  | succ c ih =>
    intro j
    have hstep : j + (2 * (c + 1) + 1) * L = (j + (2 * c + 1) * L) + 2 * L := by ring
    rw [hstep, h2, ih j]

/-- With diagonal `D` antiperiodic at `p` and every shallower one periodic,
the nearest black cell to row `p`'s right edge sits at distance exactly `D`. -/
private theorem edge_gap (p D : ℕ) (hp : 0 < p)
    (hlow : ∀ d : ℕ, 1 ≤ d → d < D → PeriodicFrom (rightDiagonal d) p 0)
    (hanti : ∀ j : ℕ, rightDiagonal D (j + p) = !rightDiagonal D j) :
    (∀ d : ℕ, 1 ≤ d → d < D → evolve p ((p : ℤ) - (d : ℤ)) = false)
      ∧ evolve p ((p : ℤ) - (D : ℤ)) = true := by
  have hwhite : ∀ d : ℕ, 1 ≤ d → d < D → evolve p ((p : ℤ) - (d : ℤ)) = false := by
    intro d h1 h2
    exact cone_row p (D - 1) (fun e he1 he2 => hlow e he1 (by omega)) d h1 (by omega)
  refine ⟨hwhite, ?_⟩
  obtain ⟨d, hd1, hdD, hdb⟩ := edge_black_within p D hp hanti
  rcases Nat.lt_or_ge d D with h | h
  · exact absurd hdb (by rw [hwhite d hd1 h]; exact Bool.false_ne_true)
  · have : d = D := by omega
    rwa [this] at hdb

/-- The minimal period of a right diagonal is a power of two, at most `2 ^ d`. -/
private theorem rd_minimalPeriod_pow (d : ℕ) :
    ∃ e ≤ d, minimalPeriod (rightDiagonal d) = 2 ^ e := by
  have h := minimalPeriod_dvd (rightDiagonal d) (2 ^ d) (by positivity)
    (rightDiagonal_periodicFrom_pow d)
  exact (Nat.dvd_prime_pow Nat.prime_two).1 h

/-- The minimal period is a period. -/
private theorem rd_periodicFrom_minimalPeriod (d : ℕ) :
    PeriodicFrom (rightDiagonal d) (minimalPeriod (rightDiagonal d)) 0 := by
  have hne : {p | 0 < p ∧ PeriodicFrom (rightDiagonal d) p 0}.Nonempty :=
    ⟨2 ^ d, by positivity, rightDiagonal_periodicFrom_pow d⟩
  exact (Nat.sInf_mem hne).2

/-- A minimal period dividing `q` makes `q` itself a period. -/
private theorem rd_periodic_of_dvd (d q : ℕ) (h : minimalPeriod (rightDiagonal d) ∣ q) :
    PeriodicFrom (rightDiagonal d) q 0 := by
  obtain ⟨c, hc⟩ := h
  have h1 := periodicFrom_mul (rightDiagonal d) (minimalPeriod (rightDiagonal d)) 0
    (rd_periodicFrom_minimalPeriod d) c
  rwa [show c * minimalPeriod (rightDiagonal d) = q by rw [hc]; ring] at h1

/-- Two minimal periods are powers of two, so the smaller divides the larger. -/
private theorem rd_minimalPeriod_dvd_of_le (d d' : ℕ)
    (h : minimalPeriod (rightDiagonal d) ≤ minimalPeriod (rightDiagonal d')) :
    minimalPeriod (rightDiagonal d) ∣ minimalPeriod (rightDiagonal d') := by
  obtain ⟨e, _, he⟩ := rd_minimalPeriod_pow d
  obtain ⟨f, _, hf⟩ := rd_minimalPeriod_pow d'
  rw [he, hf] at h ⊢
  exact pow_dvd_pow 2 ((Nat.pow_le_pow_iff_right (by norm_num)).1 h)

private theorem rd_minimalPeriod_pos (d : ℕ) : 0 < minimalPeriod (rightDiagonal d) := by
  have hne : {q | 0 < q ∧ PeriodicFrom (rightDiagonal d) q 0}.Nonempty :=
    ⟨2 ^ d, by positivity, rightDiagonal_periodicFrom_pow d⟩
  exact (Nat.sInf_mem hne).1

/-- The identity, with a common period `L` of the two diagonals above the
failing one supplied explicitly. -/
private theorem edge_gap_eq_aux (p D L : ℕ) (hp : 0 < p) (hLpos : 0 < L)
    (hp0 : PeriodicFrom (rightDiagonal D) L 0)
    (hp1 : PeriodicFrom (rightDiagonal (D + 1)) L 0) (hLp : L ∣ p)
    (hlow : ∀ d < D + 2, minimalPeriod (rightDiagonal d) ∣ p)
    (hhi : ¬ (minimalPeriod (rightDiagonal (D + 2)) ∣ p)) :
    (∀ d : ℕ, 1 ≤ d → d < D + 2 → evolve p ((p : ℤ) - (d : ℤ)) = false)
      ∧ evolve p ((p : ℤ) - ((D + 2 : ℕ) : ℤ)) = true := by
  classical
  have hodd : Odd (∑ j ∈ Finset.range L,
      if (rightDiagonal (D + 1) (j + 1) || rightDiagonal D (j + 2)) = true then 1 else 0) := by
    rcases Nat.even_or_odd (∑ j ∈ Finset.range L,
        if (rightDiagonal (D + 1) (j + 1) || rightDiagonal D (j + 2)) = true then 1 else 0)
      with hev | hod
    · exact absurd ((minimalPeriod_dvd (rightDiagonal (D + 2)) L hLpos
          (rightDiagonal_periodicFrom_step_of_even_driver D L hp0 hp1 hev)).trans hLp) hhi
    · exact hod
  obtain ⟨hantiL, -, -⟩ := rightDiagonal_antiperiodic_of_odd_driver D L hp0 hp1 hodd
  obtain ⟨c, hc⟩ := hLp
  have hcodd : c % 2 = 1 := by
    by_contra h
    obtain ⟨c', hc'⟩ : 2 ∣ c := by omega
    have h2L : minimalPeriod (rightDiagonal (D + 2)) ∣ 2 * L :=
      minimalPeriod_dvd (rightDiagonal (D + 2)) (2 * L) (by omega)
        (rightDiagonal_periodicFrom_step D L 0 hp0 hp1)
    exact hhi (h2L.trans ⟨c', by rw [hc, hc']; ring⟩)
  have hanti : ∀ j : ℕ, rightDiagonal (D + 2) (j + p) = !rightDiagonal (D + 2) j := by
    intro j
    obtain ⟨k, hk⟩ : ∃ k, c = 2 * k + 1 := ⟨c / 2, by omega⟩
    rw [show p = (2 * k + 1) * L by rw [hc, hk]; ring]
    exact antiperiodic_odd_mul (rightDiagonal (D + 2)) L hantiL k j
  exact edge_gap p (D + 2) hp (fun d _ hd2 => rd_periodic_of_dvd d p (hlow d hd2)) hanti

theorem rightDiagonal_edge_gap_eq (p D : ℕ) (hp : 0 < p)
    (hlow : ∀ d < D + 2, minimalPeriod (rightDiagonal d) ∣ p)
    (hhi : ¬ (minimalPeriod (rightDiagonal (D + 2)) ∣ p)) :
    (∀ d : ℕ, 1 ≤ d → d < D + 2 → evolve p ((p : ℤ) - (d : ℤ)) = false)
      ∧ evolve p ((p : ℤ) - ((D + 2 : ℕ) : ℤ)) = true := by
  rcases le_total (minimalPeriod (rightDiagonal D)) (minimalPeriod (rightDiagonal (D + 1)))
    with h | h
  · exact edge_gap_eq_aux p D (minimalPeriod (rightDiagonal (D + 1))) hp
      (rd_minimalPeriod_pos _)
      (rd_periodic_of_dvd D _ (rd_minimalPeriod_dvd_of_le D (D + 1) h))
      (rd_periodic_of_dvd (D + 1) _ dvd_rfl) (hlow (D + 1) (by omega)) hlow hhi
  · exact edge_gap_eq_aux p D (minimalPeriod (rightDiagonal D)) hp
      (rd_minimalPeriod_pos _)
      (rd_periodic_of_dvd D _ dvd_rfl)
      (rd_periodic_of_dvd (D + 1) _ (rd_minimalPeriod_dvd_of_le (D + 1) D h))
      (hlow D (by omega)) hlow hhi
