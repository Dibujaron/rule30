import Rule30.Basic
import Rule30.Proofs.LeftDiagonalPairNeverEventuallyShifted
import Mathlib.Tactic
import Mathlib.Data.Fintype.Pigeonhole

/-!
**What this says.** Fix any power of two; some left diagonal of the pattern never
settles into repeating with that period, no matter how long you wait.
**Why it is true.** Past its onset a periodic diagonal is fixed by the finitely
many bits it shows in one period, so among infinitely many diagonals two
*consecutive pairs* must show the same bits — and `leftDiagonal_pair_never_eventually_shifted`
says no two distinct pairs of neighbouring diagonals can agree forever.
**Where the work is.** Lining the phases up: the two diagonals repeat from
different starting points, so each is first rewritten to be read at a multiple of
the period, where the residue of the index alone decides the cell.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.leftDiagonal_period_unbounded (a : ℕ) : ∃ k, ∀ (N : ℕ), ¬PeriodicFrom (leftDiagonal k) (2 ^ a) N
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
