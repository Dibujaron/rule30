/-
Rowan's review of the seeder proposal of 2026-09-10 (blueprint/proposals/next.json).

The seeder reported all four routes as DOES NOT CLOSE. All four are in fact
true and cheap; the routes below are mine and each was elaborated against the
real definitions before any of it was written up. Nothing here is a proof file
-- it is the captain's working, kept so the claim "verified" points at
something.

The headline finding is that the negative is true in a STRONGER form than the
one proposed: the black-ladder route fails pointwise, not merely uniformly.
-/
import Rule30.Basic
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftFourthDiagonal
import Rule30.Proofs.LeftDiagonalEqRowNatTestBit
import Rule30.Proofs.RowNatModEqIterate

/-- Diagonal 3 is black exactly at even indices. Immediate from the closed
`evolve_left_fourth_diagonal`, since `leftDiagonal 3 j` unfolds to
`evolve (j + 3) (-j)`. -/
theorem d3 (j : Nat) : leftDiagonal 3 j = decide (j % 2 = 0) :=
  evolve_left_fourth_diagonal j

/-- **The proposal as written.** No ladder meeting the closed block's own
hypotheses also satisfies `N k <= k` everywhere. -/
theorem neg_ladder_as_proposed :
    ¬ ∃ N : Nat → Nat, (∀ k, N k < N (k + 1)) ∧ (∀ k, N k ≤ k) ∧
      (∀ k, leftDiagonal (k + 1) (N (k + 1)) = true ∨
        (∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false)) := by
  rintro ⟨N, hmono, hle, hwit⟩
  have hid : ∀ k, N k = k := by
    intro k
    induction k with
    | zero => have := hle 0; omega
    | succ n ih => have h1 := hmono n; have h2 := hle (n + 1); omega
  have h2 := hwit 2
  rw [hid 3, hid 2] at h2
  rcases h2 with hblack | hwhite
  · rw [d3] at hblack; simp at hblack
  · have h4 := hwhite 4 (by omega)
    rw [d3] at h4; simp at h4

/-- **Stronger, and the form worth landing.** No such ladder has `N k <= k` at
even ONE index `k >= 3`. The proposed statement forbids a single ladder that
serves every `k`; this forbids a ladder tailored to one `k`, which is the
obvious next thing a prover would try. -/
theorem neg_ladder_pointwise (N : Nat → Nat)
    (hmono : ∀ k, N k < N (k + 1))
    (hwit : ∀ k, leftDiagonal (k + 1) (N (k + 1)) = true ∨
        (∀ j ≥ N k + 1, leftDiagonal (k + 1) j = false))
    (k : Nat) (hk : 3 ≤ k) : k < N k := by
  by_contra hcon
  simp only [Nat.not_lt] at hcon
  have hstep : ∀ a d, N a + d ≤ N (a + d) := by
    intro a d
    induction d with
    | zero => simp
    | succ n ih =>
      have h := hmono (a + n)
      have e : a + (n + 1) = (a + n) + 1 := by omega
      rw [e]; omega
  have hge : ∀ j, j ≤ N j := by
    intro j; have h := hstep 0 j; simp at h; omega
  have hid : ∀ j, j ≤ k → N j = j := by
    intro j hj
    have h1 := hstep j (k - j)
    have e : j + (k - j) = k := by omega
    rw [e] at h1
    have h2 := hge j
    omega
  have h2 := hwit 2
  rw [hid 3 (by omega), hid 2 (by omega)] at h2
  rcases h2 with hblack | hwhite
  · rw [d3] at hblack; simp at hblack
  · have h4 := hwhite 4 (by omega)
    rw [d3] at h4; simp at h4

/-- Proposal 4, in three lines. -/
theorem rowNat_testBit_zero' (t : Nat) : (rowNat t).testBit 0 = true := by
  have h := leftDiagonal_eq_rowNat_testBit 0 t
  simp only [Nat.add_zero] at h
  rw [← h]
  exact evolve_left_edge t

/-- Proposal 3, from the closed `rowNat_mod_eq_iterate`. The truncated rows are
the orbit of `1` under `stepMod n`, so two orbit points that coincide at `T`
coincide for ever after. -/
theorem rowNat_agree_forward' (n T p t : Nat) (hTt : T ≤ t)
    (h : rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) :
    rowNat t % 2 ^ n = rowNat (t + p) % 2 ^ n := by
  obtain ⟨d, rfl⟩ : ∃ d, t = T + d := ⟨t - T, by omega⟩
  simp only [rowNat_mod_eq_iterate] at h ⊢
  have e : T + d + p = d + (T + p) := by omega
  rw [e, Nat.add_comm T d, Function.iterate_add_apply, Function.iterate_add_apply, h]

/-- Proposal 2, taking proposal 3 as a hypothesis rather than assuming it
proved. Confirms the tier's internal dependency really holds: the interface
follows from autonomy plus the closed bridge, and `hT : T <= 2 * k` is exactly
what makes `j + k >= T` available at every `j >= k`. -/
theorem periodicFrom_of_rowNat_agree'
    (agree_forward : ∀ (n T p t : Nat), T ≤ t →
       rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n →
       rowNat t % 2 ^ n = rowNat (t + p) % 2 ^ n)
    (k p T : Nat) (hT : T ≤ 2 * k)
    (h : rowNat T % 2 ^ (k + 1) = rowNat (T + p) % 2 ^ (k + 1)) :
    PeriodicFrom (leftDiagonal k) p k := by
  have key : ∀ a b : Nat, a % 2 ^ (k + 1) = b % 2 ^ (k + 1) →
      a.testBit k = b.testBit k := by
    intro a b hab
    have ha : (a % 2 ^ (k + 1)).testBit k = a.testBit k := by
      simp [Nat.testBit_mod_two_pow]
    have hb : (b % 2 ^ (k + 1)).testBit k = b.testBit k := by
      simp [Nat.testBit_mod_two_pow]
    rw [← ha, ← hb, hab]
  intro j hj
  have hTt : T ≤ j + k := by omega
  have hfwd := agree_forward (k + 1) T p (j + k) hTt h
  rw [leftDiagonal_eq_rowNat_testBit, leftDiagonal_eq_rowNat_testBit]
  have e : j + p + k = j + k + p := by omega
  rw [e]
  exact key _ _ hfwd.symm

#print axioms neg_ladder_as_proposed
#print axioms neg_ladder_pointwise
#print axioms rowNat_testBit_zero'
#print axioms rowNat_agree_forward'
#print axioms periodicFrom_of_rowNat_agree'
