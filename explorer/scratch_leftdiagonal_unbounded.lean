import Rule30.Proofs
import Mathlib.Data.Fintype.Pigeonhole

namespace Rule30Scratch

theorem xor_cancel {a b c : Bool} (h : xor a c = xor b c) : a = b := by
  cases a <;> cases b <;> cases c <;> simp_all

theorem leftDiagonal_zero_true (j : ℕ) : leftDiagonal 0 j = true := by
  show evolve (j + 0) (-(j : ℤ)) = true
  rw [show j + 0 = j from by omega]
  exact evolve_left_edge j

theorem leftDiagonal_one_true (j : ℕ) : leftDiagonal 1 j = true :=
  evolve_left_second_diagonal j

/-- The pair `(D m, D (m+1))` agrees with its `d`-shift from `M` on. -/
def AgreePair (d m M : ℕ) : Prop :=
  (∀ j, M ≤ j → leftDiagonal m j = leftDiagonal (m + d) j) ∧
  (∀ j, M ≤ j → leftDiagonal (m + 1) j = leftDiagonal (m + d + 1) j)

theorem agreePair_step (d m M : ℕ) (h : AgreePair d (m + 1) M) :
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

theorem agreePair_descend (d : ℕ) :
    ∀ k M, AgreePair d k M → AgreePair d 0 (M + 2 * k) := by
  intro k
  induction k with
  | zero => intro M h; simpa using h
  | succ n ih =>
    intro M h
    have h1 := ih (M + 2) (agreePair_step d n M h)
    rwa [show M + 2 + 2 * n = M + 2 * (n + 1) by omega] at h1

/-- Both `D m` and `D (m+1)` are white from `M` on. -/
def WhitePair (m M : ℕ) : Prop :=
  (∀ j, M ≤ j → leftDiagonal m j = false) ∧
  (∀ j, M ≤ j → leftDiagonal (m + 1) j = false)

theorem whitePair_step (m M : ℕ) (h : WhitePair (m + 1) M) : WhitePair m (M + 2) := by
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

theorem whitePair_descend :
    ∀ m M, WhitePair m M → WhitePair 0 (M + 2 * m) := by
  intro m
  induction m with
  | zero => intro M h; simpa using h
  | succ n ih =>
    intro M h
    have h1 := ih (M + 2) (whitePair_step n M h)
    rwa [show M + 2 + 2 * n = M + 2 * (n + 1) by omega] at h1

end Rule30Scratch

open Rule30Scratch in
theorem leftDiagonal_pair_never_eventually_shifted (k d N : ℕ) (hd : 0 < d) :
    ∃ j ≥ N, leftDiagonal k j ≠ leftDiagonal (k + d) j ∨
      leftDiagonal (k + 1) j ≠ leftDiagonal (k + d + 1) j := by
  by_contra hcon
  push Not at hcon
  have hstart : AgreePair d k N :=
    ⟨fun j hj => (hcon j hj).1, fun j hj => (hcon j hj).2⟩
  obtain ⟨A0, A1⟩ := agreePair_descend d k N hstart
  set M := N + 2 * k with hM
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

namespace Rule30Scratch

theorem periodicFrom_iterate {f : ℕ → Bool} {p N : ℕ} (h : PeriodicFrom f p N) :
    ∀ (t n : ℕ), N ≤ n → f (n + t * p) = f n := by
  intro t
  induction t with
  | zero => intro n _; simp
  | succ s ih =>
    intro n hn
    have hrw : n + (s + 1) * p = (n + s * p) + p := by ring
    rw [hrw, h (n + s * p) (Nat.le_trans hn (Nat.le_add_right n _)), ih n hn]

/-- The tail of an eventually `p`-periodic sequence is determined by the residue
of the index, read off at the multiple-of-`p` onset `N * p`. -/
theorem periodicFrom_eq_phase {f : ℕ → Bool} {p N : ℕ} (hp : 0 < p)
    (h : PeriodicFrom f p N) :
    ∀ j, N * p ≤ j → f j = f (N * p + j % p) := by
  intro j hj
  have hq : N ≤ j / p := (Nat.le_div_iff_mul_le hp).mpr hj
  obtain ⟨s, hs⟩ : ∃ s, j / p = N + s := ⟨j / p - N, by omega⟩
  have hdm := Nat.div_add_mod j p
  rw [hs, Nat.mul_add, Nat.mul_comm p N, Nat.mul_comm p s] at hdm
  have hNp : N ≤ N * p := Nat.le_mul_of_pos_right N hp
  have hkey : j = (N * p + j % p) + s * p := by omega
  conv_lhs => rw [hkey]
  exact periodicFrom_iterate h s (N * p + j % p) (by omega)

/-- The residue word of diagonal `k`, read at the onset `N k * p`. -/
def phaseWord (N : ℕ → ℕ) (p k : ℕ) (r : Fin p) : Bool :=
  leftDiagonal k (N k * p + (r : ℕ))

end Rule30Scratch

open Rule30Scratch in
theorem leftDiagonal_period_unbounded (a : ℕ) :
    ∃ k, ∀ N, ¬ PeriodicFrom (leftDiagonal k) (2 ^ a) N := by
  by_contra hcon
  push Not at hcon
  have hp : 0 < 2 ^ a := Nat.two_pow_pos a
  choose N hN using hcon
  set p := 2 ^ a with hpdef
  -- every diagonal is determined, past its onset, by its residue word
  have key : ∀ k j, N k * p ≤ j →
      leftDiagonal k j = leftDiagonal k (N k * p + j % p) :=
    fun k => periodicFrom_eq_phase hp (hN k)
  have agree : ∀ u v : ℕ, phaseWord N p u = phaseWord N p v →
      ∀ j, N u * p ≤ j → N v * p ≤ j → leftDiagonal u j = leftDiagonal v j := by
    intro u v hw j h1 h2
    rw [key u j h1, key v j h2]
    have hc := congrFun hw ⟨j % p, Nat.mod_lt _ hp⟩
    simpa [phaseWord] using hc
  have main : ∀ u v : ℕ, u < v → phaseWord N p u = phaseWord N p v →
      phaseWord N p (u + 1) = phaseWord N p (v + 1) → False := by
    intro u v huv hw0 hw1
    set M := max (max (N u * p) (N v * p)) (max (N (u + 1) * p) (N (v + 1) * p)) with hMdef
    obtain ⟨j, hjM, hj⟩ :=
      leftDiagonal_pair_never_eventually_shifted u (v - u) M (by omega)
    rw [show u + (v - u) = v by omega] at hj
    have hb1 : N u * p ≤ j := le_trans (le_trans (le_max_left _ _) (le_max_left _ _)) hjM
    have hb2 : N v * p ≤ j := le_trans (le_trans (le_max_right _ _) (le_max_left _ _)) hjM
    have hb3 : N (u + 1) * p ≤ j :=
      le_trans (le_trans (le_max_left _ _) (le_max_right _ _)) hjM
    have hb4 : N (v + 1) * p ≤ j :=
      le_trans (le_trans (le_max_right _ _) (le_max_right _ _)) hjM
    rcases hj with hj | hj
    · exact hj (agree u v hw0 j hb1 hb2)
    · exact hj (agree (u + 1) (v + 1) hw1 j hb3 hb4)
  obtain ⟨u, v, hne, heq⟩ :=
    Finite.exists_ne_map_eq_of_infinite
      (fun k : ℕ => (phaseWord N p k, phaseWord N p (k + 1)))
  have h0 : phaseWord N p u = phaseWord N p v := congrArg Prod.fst heq
  have h1 : phaseWord N p (u + 1) = phaseWord N p (v + 1) := congrArg Prod.snd heq
  rcases Nat.lt_or_ge u v with h | h
  · exact main u v h h0 h1
  · exact main v u (by omega) h0.symm h1.symm

#print axioms leftDiagonal_pair_never_eventually_shifted
#print axioms leftDiagonal_period_unbounded
