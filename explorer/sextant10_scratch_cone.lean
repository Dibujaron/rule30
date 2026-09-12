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
Sextant, 2026-09-12.  Kernel check for the attack document
`docs/attacks/2026-09-12-run-the-right-diagonal-recurrence-backwards-...`.

**The cone condition, inside the right-diagonal tower's own vocabulary.**
`rightDiagonal k j = evolve (j + k) j` is defined down to `j = -k`, where it
reads the initial row at `-k`; the cone says that value is white for `k ≥ 1`.
Right-diagonal periodicity carries `-k` up to `2 ^ k - k`, so the condition is
a statement at a NON-negative index, needing no new definition:

    `rightDiagonal k (2 ^ k - k) = false`  for every `k ≥ 1`,

equivalently: row `2 ^ n` is white at the `n` positions just left of its black
right edge.  That is Rowland 2006 §1 (lines 123–126, in his mirror
orientation) and the second ingredient of crystal 11, which that crystal calls
"Rowland's own induction, not a finite check".

It is neither.  It is three closed nodes and a least-element argument, and
that is what this file proves — `rightDiagonal_periodicFrom_pow`,
`periodicFrom_mul` and `rightDiagonal_first_failure`, the last of which landed
a day after crystal 11 was written.
-/

namespace SextantTen

/-- Every right diagonal `m` with `m ≤ n` has period `2 ^ n` from index 0:
a multiple of its own period `2 ^ m`. -/
theorem rightDiagonal_periodicFrom_pow_le (m n : ℕ) (h : m ≤ n) :
    PeriodicFrom (rightDiagonal m) (2 ^ n) 0 := by
  have h0 := rightDiagonal_periodicFrom_pow m
  have h1 := periodicFrom_mul (rightDiagonal m) (2 ^ m) 0 h0 (2 ^ (n - m))
  rwa [← pow_add, Nat.sub_add_cancel h] at h1

/-- **The cone condition, at any row.** If `p` is a period of every right
diagonal `d ≤ D` at the origin, row `p` is white at every position `p - d`
with `1 ≤ d ≤ D`.

Nothing here is about powers of two: the whole proof is that `p` being a
period of diagonal `d` at the origin contradicts `rightDiagonal_first_failure`
reading a disagreement there. -/
theorem cone_row (p D : ℕ)
    (hper : ∀ d : ℕ, 1 ≤ d → d ≤ D → PeriodicFrom (rightDiagonal d) p 0) :
    ∀ d : ℕ, 1 ≤ d → d ≤ D → evolve p ((p : ℤ) - (d : ℤ)) = false := by
  classical
  by_contra hcon
  push_neg at hcon
  obtain ⟨d0, hd1, hdD, hd⟩ := hcon
  have hd' : evolve p ((p : ℤ) - (d0 : ℤ)) = true := by
    revert hd; cases evolve p ((p : ℤ) - (d0 : ℤ)) <;> simp
  -- the least violating distance
  have hex : ∃ d : ℕ, 1 ≤ d ∧ d ≤ D ∧ evolve p ((p : ℤ) - (d : ℤ)) = true :=
    ⟨d0, hd1, hdD, hd'⟩
  set m := Nat.find hex with hmdef
  obtain ⟨hm1, hmD, hmblack⟩ := Nat.find_spec hex
  have hwhite : ∀ e : ℕ, 0 < e → e < m → evolve p ((p : ℤ) - (e : ℤ)) = false := by
    intro e he0 hem
    have hnot := Nat.find_min hex hem
    by_contra hf
    exact hnot ⟨he0, by omega, by revert hf; cases evolve p ((p : ℤ) - (e : ℤ)) <;> simp⟩
  -- the first failure of period p at the origin is at depth m
  have hff := (rightDiagonal_first_failure p m (by omega) hwhite hmblack).2
  have hper0 := hper m hm1 hmD 0 (Nat.zero_le 0)
  simp only [Nat.zero_add] at hper0
  have hL : rightDiagonal m p = evolve (m + p) (p : ℤ) := by
    unfold rightDiagonal; rw [Nat.add_comm p m]
  have hR : rightDiagonal m 0 = evolve m 0 := by
    unfold rightDiagonal; norm_num
  rw [hL, hR] at hper0
  exact hff hper0

/-- **The cone condition.** Row `2 ^ n` is white at every position
`2 ^ n - d` with `1 ≤ d ≤ n`: the instance that uses only the proved period
`2 ^ d` of diagonal `d`. -/
theorem cone_row_pow (n : ℕ) :
    ∀ d : ℕ, 1 ≤ d → d ≤ n → evolve (2 ^ n) (((2 ^ n : ℕ) : ℤ) - (d : ℤ)) = false :=
  cone_row (2 ^ n) n (fun d _ hdn => rightDiagonal_periodicFrom_pow_le d n hdn)

/-- The same statement read along the diagonals: the cone condition in the
tower's own coordinates. -/
theorem cone_rightDiagonal (k : ℕ) (hk : 1 ≤ k) : rightDiagonal k (2 ^ k - k) = false := by
  have h := cone_row_pow k k hk le_rfl
  unfold rightDiagonal
  have hle : k ≤ 2 ^ k := Nat.le_of_lt (Nat.lt_two_pow_self)
  rw [show 2 ^ k - k + k = 2 ^ k by omega]
  rw [show ((2 ^ k - k : ℕ) : ℤ) = ((2 ^ k : ℕ) : ℤ) - (k : ℤ) by push_cast [hle]; omega]
  exact h

/-- **Rowland's `a(n) ≥ n + 1`, without the nested-structure theorem.**
The distance from row `2 ^ n`'s right edge to the next black cell exceeds `n`.
Stated as: no `d` in `[1, n]` has a black cell there — which is
`cone_row_pow` — so any black cell sits at distance at least `n + 1`. -/
theorem a_ge (n d : ℕ) (hd1 : 1 ≤ d)
    (hblack : evolve (2 ^ n) (((2 ^ n : ℕ) : ℤ) - (d : ℤ)) = true) : n + 1 ≤ d := by
  by_contra h
  have := cone_row_pow n d hd1 (by omega)
  rw [this] at hblack
  exact Bool.false_ne_true hblack

/-! ### The other half: row `2 ^ n` IS black at distance `D`

`cone_row_of_period` is a lower bound on the white run at row `2 ^ n`'s right
edge.  The matching upper bound comes from the *doubling*: at the first depth
`D` whose period exceeds `2 ^ n`, the board's own criterion makes right
diagonal `D` antiperiodic at `2 ^ n`, so it disagrees with itself there at
index 0 — and a disagreement at depth `D` forces the black cell to be at
distance at most `D`, because `rightDiagonal_first_failure` says the
disagreements start exactly at the black cell. -/

/-- If right diagonal `D` is antiperiodic at `2 ^ n`, row `2 ^ n` has a black
cell within distance `D` of its right edge. -/
theorem edge_black_within (p D : ℕ) (hp : 0 < p)
    (hanti : ∀ j : ℕ, rightDiagonal D (j + p) = !rightDiagonal D j) :
    ∃ d : ℕ, 1 ≤ d ∧ d ≤ D ∧ evolve p ((p : ℤ) - (d : ℤ)) = true := by
  classical
  by_contra hcon
  push_neg at hcon
  have hw : ∀ d : ℕ, 1 ≤ d → d ≤ D → evolve p ((p : ℤ) - (d : ℤ)) = false := by
    intro d h1 h2
    have := hcon d h1 h2
    revert this; cases evolve p ((p : ℤ) - (d : ℤ)) <;> simp
  -- the left edge of row p is black, at distance 2p
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
  -- no disagreement before the black cell, in particular at depth D
  have hff := (rightDiagonal_first_failure p m (by omega) hwhite hmblack).1 D hDm
  -- but antiperiodicity says diagonal D disagrees with itself at index 0
  have hA := hanti 0
  rw [show (0 : ℕ) + p = p from Nat.zero_add _] at hA
  have hL : rightDiagonal D p = evolve (D + p) (p : ℤ) := by
    unfold rightDiagonal; rw [Nat.add_comm p D]
  have hR : rightDiagonal D 0 = evolve D 0 := by unfold rightDiagonal; norm_num
  rw [hL, hR, hff] at hA
  exact (Bool.not_ne_self _) hA.symm

/-- Antiperiodicity at `L` gives antiperiodicity at every **odd** multiple of
`L`, and plain periodicity at every even one. -/
theorem antiperiodic_odd_mul (f : ℕ → Bool) (L : ℕ) (h : ∀ j, f (j + L) = !f j) :
    ∀ c j : ℕ, f (j + (2 * c + 1) * L) = !f j := by
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

/-- **The edge gap is exactly the first depth whose period is too big.** With
`D` the first depth whose period exceeds `2 ^ n` -- so every shallower depth
has a period `2 ^ e` with `e ≤ n`, and level `D` is antiperiodic at `2 ^ n`,
which is what the board's doubling criterion delivers -- the nearest black
cell to row `2 ^ n`'s right edge sits at distance exactly `D`. -/
theorem edge_gap (p D : ℕ) (hp : 0 < p)
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

/-! ### Discharging the hypotheses: the identity `a(n) = min { d : P_d > 2^n }`

Both hypotheses of `edge_gap` come from the board.  `hlow` is periodicity plus
`periodicFrom_mul`.  `hanti` is the doubling criterion: at the first depth `D`
whose minimal period exceeds `2 ^ n`, the two shallower depths have periods at
most `2 ^ n`, so if the driver had even weight over `2 ^ n` then
`rightDiagonal_periodicFrom_step_of_even_driver` would make `2 ^ n` a period of
level `D` and its minimal period would divide `2 ^ n` — contradiction.  So the
weight is odd and `rightDiagonal_antiperiodic_of_odd_driver` gives
antiperiodicity at exactly `2 ^ n`. -/

/-- The minimal period of a right diagonal is a power of two, at most `2 ^ d`. -/
theorem rd_minimalPeriod_pow (d : ℕ) : ∃ e ≤ d, minimalPeriod (rightDiagonal d) = 2 ^ e := by
  have h := minimalPeriod_dvd (rightDiagonal d) (2 ^ d) (by positivity)
    (rightDiagonal_periodicFrom_pow d)
  exact (Nat.dvd_prime_pow Nat.prime_two).1 h

/-- The minimal period is a period. -/
theorem rd_periodicFrom_minimalPeriod (d : ℕ) :
    PeriodicFrom (rightDiagonal d) (minimalPeriod (rightDiagonal d)) 0 := by
  have hne : {p | 0 < p ∧ PeriodicFrom (rightDiagonal d) p 0}.Nonempty :=
    ⟨2 ^ d, by positivity, rightDiagonal_periodicFrom_pow d⟩
  exact (Nat.sInf_mem hne).2

/-- A minimal period dividing `q` makes `q` itself a period. -/
theorem rd_periodic_of_dvd (d q : ℕ) (h : minimalPeriod (rightDiagonal d) ∣ q) :
    PeriodicFrom (rightDiagonal d) q 0 := by
  obtain ⟨c, hc⟩ := h
  have h1 := periodicFrom_mul (rightDiagonal d) (minimalPeriod (rightDiagonal d)) 0
    (rd_periodicFrom_minimalPeriod d) c
  rwa [show c * minimalPeriod (rightDiagonal d) = q by rw [hc]; ring] at h1

/-- Two minimal periods are powers of two, so the smaller divides the larger. -/
theorem rd_minimalPeriod_dvd_of_le (d d' : ℕ)
    (h : minimalPeriod (rightDiagonal d) ≤ minimalPeriod (rightDiagonal d')) :
    minimalPeriod (rightDiagonal d) ∣ minimalPeriod (rightDiagonal d') := by
  obtain ⟨e, _, he⟩ := rd_minimalPeriod_pow d
  obtain ⟨f, _, hf⟩ := rd_minimalPeriod_pow d'
  rw [he, hf] at h ⊢
  exact pow_dvd_pow 2 ((Nat.pow_le_pow_iff_right (by norm_num)).1 h)

/-- **The identity, at any row.** If `D + 2` is the first depth whose minimal
period fails to divide `p`, then the nearest black cell to row `p`'s right
edge sits at distance exactly `D + 2`. Since "the minimal period divides `p`"
depends only on `ord₂ p` — the minimal periods are powers of two — the gap
depends only on `ord₂ p`, which is Rowland's `I(t) = a(ord₂ t)`. -/
theorem edge_gap_eq_aux (p D L : ℕ) (hp : 0 < p) (hLpos : 0 < L)
    (hp0 : PeriodicFrom (rightDiagonal D) L 0)
    (hp1 : PeriodicFrom (rightDiagonal (D + 1)) L 0) (hLp : L ∣ p)
    (hlow : ∀ d < D + 2, minimalPeriod (rightDiagonal d) ∣ p)
    (hhi : ¬ (minimalPeriod (rightDiagonal (D + 2)) ∣ p)) :
    (∀ d : ℕ, 1 ≤ d → d < D + 2 → evolve p ((p : ℤ) - (d : ℤ)) = false)
      ∧ evolve p ((p : ℤ) - ((D + 2 : ℕ) : ℤ)) = true := by
  classical
  -- the driver's weight over one block must be odd
  have hodd : Odd (∑ j ∈ Finset.range L,
      if (rightDiagonal (D + 1) (j + 1) || rightDiagonal D (j + 2)) = true then 1 else 0) := by
    rcases Nat.even_or_odd (∑ j ∈ Finset.range L,
        if (rightDiagonal (D + 1) (j + 1) || rightDiagonal D (j + 2)) = true then 1 else 0)
      with hev | hod
    · exact absurd ((minimalPeriod_dvd (rightDiagonal (D + 2)) L hLpos
          (rightDiagonal_periodicFrom_step_of_even_driver D L hp0 hp1 hev)).trans hLp) hhi
    · exact hod
  obtain ⟨hantiL, -, -⟩ := rightDiagonal_antiperiodic_of_odd_driver D L hp0 hp1 hodd
  -- p is an ODD multiple of L, because 2L is a period of level D+2
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

theorem rd_minimalPeriod_pos (d : ℕ) : 0 < minimalPeriod (rightDiagonal d) := by
  have hne : {q | 0 < q ∧ PeriodicFrom (rightDiagonal d) q 0}.Nonempty :=
    ⟨2 ^ d, by positivity, rightDiagonal_periodicFrom_pow d⟩
  exact (Nat.sInf_mem hne).1

theorem edge_gap_eq (p D : ℕ) (hp : 0 < p)
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

#print axioms edge_gap_eq

/-! ### The same condition read down the backward line

`rightDiagonal k` at negative index `-j` is the cell `(k - j, -j)`, so the
backward run of level `k` walks the line `x = t - k` from the centre-column
cell `(k, 0)` up to the initial row at `(0, -k)`.  Each step of that walk is
one application of the rule, which is the next theorem; telescoping it gives

  `centerColumn k = XOR over s < k of (evolve s (s-k+1) OR evolve s (s-k+2))`,

a statement in `evolve` alone, with no tower and no periodicity in it.  The
`XOR over` needs a fold, which is the one definition the board does not have;
`lineXor` below is that fold, written against `rowCell` so the kernel can
evaluate it. -/

/-- One step up the backward line, which is `rule30_eq` and nothing else. -/
theorem backward_line_step (k s : ℕ) :
    evolve (s + 1) ((s : ℤ) + 1 - (k : ℤ))
      = (evolve s ((s : ℤ) - (k : ℤ))
          ^^ (evolve s ((s : ℤ) - (k : ℤ) + 1) || evolve s ((s : ℤ) - (k : ℤ) + 2))) := by
  have e1 : (s : ℤ) + 1 - (k : ℤ) - 1 = (s : ℤ) - (k : ℤ) := by ring
  have e2 : (s : ℤ) + 1 - (k : ℤ) = (s : ℤ) - (k : ℤ) + 1 := by ring
  have e3 : (s : ℤ) - (k : ℤ) + 1 + 1 = (s : ℤ) - (k : ℤ) + 2 := by ring
  rw [evolve_succ, rule30_eq, e1, e2, e3]

private def term (k s : ℕ) : Bool :=
  rowCell s ((s : ℤ) - (k : ℤ) + 1) || rowCell s ((s : ℤ) - (k : ℤ) + 2)

private def lineXor (k : ℕ) : ℕ → Bool
  | 0 => false
  | n + 1 => (lineXor k n ^^ term k n)

set_option maxRecDepth 1000000 in
/-- The telescoped identity, by kernel computation, for `k = 1 .. 14`. -/
example : ∀ k ∈ List.range' 1 14, lineXor k k = rowCell k 0 := by
  decide

-- Independent engine cross-check: the same cells read out of the packed-row
-- model, which `rowCell_eq_evolve` ties to `evolve`, by kernel computation.
set_option maxRecDepth 1000000 in
example : ∀ n ∈ [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    ∀ d ∈ List.range' 1 n, rowCell (2 ^ n) (((2 ^ n : ℕ) : ℤ) - (d : ℤ)) = false := by
  decide

#print axioms rightDiagonal_periodicFrom_pow_le
#print axioms cone_row
#print axioms cone_row_pow
#print axioms edge_black_within
#print axioms edge_gap
#print axioms backward_line_step
#print axioms cone_rightDiagonal
#print axioms a_ge

end SextantTen

