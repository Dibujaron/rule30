import Rule30.Basic
import Mathlib.Data.Set.Finite.Basic
import Mathlib.Data.Set.Finite.Lattice
import Mathlib.Data.Fintype.Pigeonhole
import Mathlib.Order.Interval.Set.Infinite

/-!
Ephemeris, connector, 2026-09-12. Scratch, not a proposal.

**The dichotomy the vantage rests on, with no topology in it.** `X_c` is the
closure of the orbit `{σ^n c}`, so `X_c` is finite exactly when that orbit is
finite, and the theorem below says that happens exactly when the sequence is
eventually periodic. Hence *"`X_c` is infinite" **is** Prize 1*, not a route to
it, and every property of `X_c` that fails for a single periodic orbit is at
least as strong as Prize 1.

Band: **Nothing.** The proof mentions no automaton; it is true of every
`ℕ → Bool`. That is the point — it is why this vantage is a restatement region.
-/

/-- The `n`-th shift of a one-sided sequence. -/
def shiftSeq (f : ℕ → Bool) (n : ℕ) : ℕ → Bool := fun k => f (n + k)

/-- **The orbit of a one-sided sequence under the shift is finite exactly when
the sequence is eventually periodic.** -/
theorem orbit_finite_iff_eventually_periodic (f : ℕ → Bool) :
    (Set.range (shiftSeq f)).Finite ↔ ∃ p, 0 < p ∧ ∃ N, ∀ n ≥ N, f (n + p) = f n := by
  constructor
  · intro hfin
    have : Finite (Set.range (shiftSeq f)) := hfin.to_subtype
    obtain ⟨i, j, hij, hEq⟩ :=
      Finite.exists_ne_map_eq_of_infinite
        (fun n : ℕ => (⟨shiftSeq f n, Set.mem_range_self n⟩ : Set.range (shiftSeq f)))
    have hEq' : shiftSeq f i = shiftSeq f j := by
      simpa using congrArg Subtype.val hEq
    rcases lt_or_gt_of_ne hij with h | h
    · refine ⟨j - i, by omega, i, ?_⟩
      intro n hn
      have hx := congrFun hEq' (n - i)
      simp only [shiftSeq] at hx
      have e1 : i + (n - i) = n := by omega
      have e2 : j + (n - i) = n + (j - i) := by omega
      rw [e1, e2] at hx
      exact hx.symm
    · refine ⟨i - j, by omega, j, ?_⟩
      intro n hn
      have hx := congrFun hEq' (n - j)
      simp only [shiftSeq] at hx
      have e1 : j + (n - j) = n := by omega
      have e2 : i + (n - j) = n + (i - j) := by omega
      rw [e1, e2] at hx
      exact hx
  · rintro ⟨p, hp, N, hper⟩
    have hstep : ∀ n, N ≤ n → shiftSeq f (n + p) = shiftSeq f n := by
      intro n hn
      funext s
      simp only [shiftSeq]
      have e : n + p + s = (n + s) + p := by omega
      rw [e]
      exact hper (n + s) (by omega)
    have per : ∀ m n, N ≤ n → shiftSeq f (n + m * p) = shiftSeq f n := by
      intro m
      induction m with
      | zero => intro n _; simp
      | succ m ih =>
          intro n hn
          rw [Nat.succ_mul]
          have e : n + (m * p + p) = (n + m * p) + p := by omega
          rw [e, hstep (n + m * p) (by omega), ih n hn]
    have key : ∀ n, N ≤ n → shiftSeq f n = shiftSeq f (N + (n - N) % p) := by
      intro n hn
      have hdm := Nat.mod_add_div' (n - N) p
      have h2 := per ((n - N) / p) (N + (n - N) % p) (by omega)
      have e : (N + (n - N) % p) + ((n - N) / p) * p = n := by omega
      rw [e] at h2
      exact h2
    have hsub : Set.range (shiftSeq f) ⊆ shiftSeq f '' (Set.Iio (N + p)) := by
      rintro g ⟨n, rfl⟩
      rcases Nat.lt_or_ge n N with hn | hn
      · exact ⟨n, by simp only [Set.mem_Iio]; omega, rfl⟩
      · refine ⟨N + (n - N) % p, ?_, (key n hn).symm⟩
        have := Nat.mod_lt (n - N) hp
        simp only [Set.mem_Iio]
        omega
    exact Set.Finite.subset ((Set.finite_Iio (N + p)).image _) hsub

/-- **The guard, showing the check can fail.** Drop `0 < p` and the right-hand
side is true of *every* sequence, so the equivalence would assert that every
one-sided sequence has a finite shift-orbit. `0 < p` is the whole content of the
eventual-periodicity side, exactly as in `PeriodicFrom`. -/
theorem p_zero_makes_it_trivial (f : ℕ → Bool) :
    ∃ p, ∃ N, ∀ n ≥ N, f (n + p) = f n :=
  ⟨0, 0, fun _ _ => rfl⟩

#print axioms orbit_finite_iff_eventually_periodic
#print axioms p_zero_makes_it_trivial
