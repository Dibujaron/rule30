import Rule30.Basic
import Rule30.Proofs.LeftDiagonalPairNeverEventuallyShifted
import Mathlib.Tactic
import Mathlib.Data.Fintype.Pigeonhole
import Mathlib.Data.Fintype.BigOperators

/-!
**What this says.** Fix any power of two. Then one of the first few left diagonals
of the pattern already fails to repeat with that period — and "few" is bounded
explicitly, so the wait for the next failure is never longer than that.
**Why it is true.** Past its onset a diagonal repeating with period `p` is fixed by
the `p` bits it shows in one period, so a diagonal and its neighbour together show
one of only `4 ^ p` bit-patterns; among `4 ^ p + 1` diagonals two must show the
same one, and `leftDiagonal_pair_never_eventually_shifted` forbids that.
**Where the work is.** Counting the patterns: the pigeonhole needs the codomain's
size as a number, so the two `p`-bit words must be turned into `4 ^ p` by hand.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_period_unbounded_le (a : ℕ) :
  ∃ k ≤ 4 ^ 2 ^ a + 1, ∀ (N : ℕ), ¬PeriodicFrom (leftDiagonal k) (2 ^ a) N
```
-/

private theorem periodicFrom_iterate {f : ℕ → Bool} {p N : ℕ} (h : PeriodicFrom f p N) :
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
private theorem periodicFrom_eq_phase {f : ℕ → Bool} {p N : ℕ} (hp : 0 < p)
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
private def phaseWord (N : ℕ → ℕ) (p k : ℕ) (r : Fin p) : Bool :=
  leftDiagonal k (N k * p + (r : ℕ))

theorem leftDiagonal_period_unbounded_le (a : ℕ) :
    ∃ k ≤ 4 ^ 2 ^ a + 1, ∀ N, ¬ PeriodicFrom (leftDiagonal k) (2 ^ a) N := by
  by_contra hcon
  push Not at hcon
  have hp : 0 < 2 ^ a := Nat.two_pow_pos a
  set p := 2 ^ a with hpdef
  set B := 4 ^ p + 1 with hBdef
  -- a total choice of onsets, honest only below the bound
  have hcon' : ∀ k : ℕ, ∃ n, k ≤ B → PeriodicFrom (leftDiagonal k) p n := by
    intro k
    by_cases hk : k ≤ B
    · obtain ⟨n, hn⟩ := hcon k hk
      exact ⟨n, fun _ => hn⟩
    · exact ⟨0, fun h => absurd h hk⟩
  choose N hN using hcon'
  -- every diagonal below the bound is determined, past its onset, by its residue word
  have key : ∀ k, k ≤ B → ∀ j, N k * p ≤ j →
      leftDiagonal k j = leftDiagonal k (N k * p + j % p) :=
    fun k hk => periodicFrom_eq_phase hp (hN k hk)
  have agree : ∀ u v : ℕ, u ≤ B → v ≤ B → phaseWord N p u = phaseWord N p v →
      ∀ j, N u * p ≤ j → N v * p ≤ j → leftDiagonal u j = leftDiagonal v j := by
    intro u v hu hv hw j h1 h2
    rw [key u hu j h1, key v hv j h2]
    have hc := congrFun hw ⟨j % p, Nat.mod_lt _ hp⟩
    simpa [phaseWord] using hc
  have main : ∀ u v : ℕ, u + 1 ≤ B → v + 1 ≤ B → u < v →
      phaseWord N p u = phaseWord N p v →
      phaseWord N p (u + 1) = phaseWord N p (v + 1) → False := by
    intro u v hu hv huv hw0 hw1
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
    · exact hj (agree u v (by omega) (by omega) hw0 j hb1 hb2)
    · exact hj (agree (u + 1) (v + 1) hu hv hw1 j hb3 hb4)
  -- the counting: two words of `p` bits each, so `4 ^ p` pairs, and `4 ^ p + 1` diagonals
  have hfun : Fintype.card (Fin p → Bool) = 2 ^ p := by
    rw [Fintype.card_pi_const, Fintype.card_bool]
  have hcard : Fintype.card ((Fin p → Bool) × (Fin p → Bool))
      < Fintype.card (Fin (4 ^ p + 1)) := by
    rw [Fintype.card_prod, hfun, Fintype.card_fin, ← mul_pow]
    norm_num
  obtain ⟨x, y, hne, heq⟩ :=
    Fintype.exists_ne_map_eq_of_card_lt
      (fun k : Fin (4 ^ p + 1) => (phaseWord N p (k : ℕ), phaseWord N p ((k : ℕ) + 1))) hcard
  have h0 : phaseWord N p (x : ℕ) = phaseWord N p (y : ℕ) := congrArg Prod.fst heq
  have h1 : phaseWord N p ((x : ℕ) + 1) = phaseWord N p ((y : ℕ) + 1) := congrArg Prod.snd heq
  have hxb : (x : ℕ) + 1 ≤ B := by have := x.isLt; omega
  have hyb : (y : ℕ) + 1 ≤ B := by have := y.isLt; omega
  have hxy : (x : ℕ) ≠ (y : ℕ) := fun h => hne (Fin.ext h)
  rcases Nat.lt_or_ge (x : ℕ) (y : ℕ) with h | h
  · exact main _ _ hxb hyb h h0 h1
  · exact main _ _ hyb hxb (by omega) h0.symm h1.symm
