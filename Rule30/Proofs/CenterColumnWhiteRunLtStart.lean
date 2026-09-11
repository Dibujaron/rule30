import Rule30.Basic
import Rule30.Proofs.EvolveSubOneEqXor
import Rule30.Proofs.EvolveLeftEdge
import Rule30.Proofs.EvolveLeftSecondDiagonal
import Rule30.Proofs.WhiteRunForbidden

/-!
**What this says.** A run of white cells in the centre column that starts at time `a`
cannot be three times as long as `a` itself.

**Why it is true.** While the centre stays white, the cell one place to its left can
only ever turn black, never back. Whichever colour it holds, the cells further left are
then forced all the way out to the edge of the picture: white throughout while the
neighbour is white, and an exact black-white checkerboard once it is black. Both
pictures collide with what the edge of the cone already is — always black on its
outermost two cells — and the collision happens sooner the shorter `a` is.

**Where the work is.** Seeing that the two forced pictures are one induction and not
two: the cells left of the origin are `v && (position is odd)` for a single bit `v`,
the neighbour's colour. Picking the pivot time `2a - 1` to split on is what turns two
bounds into the single constant 3.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_white_run_lt_start (a L : ℕ) (ha : 1 ≤ a) (h : ∀ s ≤ L, centerColumn (a + s) = false) :
  L < 3 * a
```
-/

/-- `white_run_forbidden` on the seed's own picture. -/
private theorem wrf (t : ℕ) (h0 : evolve t 0 = false) (h1 : evolve (t + 1) 0 = false)
    (h2 : evolve (t + 2) 0 = false) (hm : evolve t (-1) = true) :
    evolve (t + 1) (-1) = true :=
  white_run_forbidden initialConfig t h0 h1 h2 hm

/-- With the centre white and its left neighbour constantly `v` over a window, every
cell left of the origin is forced: `v` on the odd positions, white on the even ones. -/
private theorem tri (b M : ℕ) (v : Bool)
    (h0 : ∀ t, b ≤ t → t ≤ b + M → evolve t 0 = false)
    (h1 : ∀ t, b ≤ t → t ≤ b + M → evolve t (-1) = v) :
    ∀ j t, b ≤ t → t + j ≤ b + M → evolve t (-(j : ℤ)) = (v && decide (j % 2 = 1)) := by
  have key : ∀ j : ℕ,
      (∀ t, b ≤ t → t + j ≤ b + M → evolve t (-(j : ℤ)) = (v && decide (j % 2 = 1))) ∧
      (∀ t, b ≤ t → t + (j + 1) ≤ b + M →
        evolve t (-((j + 1 : ℕ) : ℤ)) = (v && decide ((j + 1) % 2 = 1))) := by
    intro j
    induction j with
    | zero =>
      refine ⟨?_, ?_⟩
      · intro t ht ht'
        simpa using h0 t ht (by omega)
      · intro t ht ht'
        simpa using h1 t ht (by omega)
    | succ n ih =>
      refine ⟨ih.2, ?_⟩
      intro t ht ht'
      have e := evolve_sub_one_eq_xor t (-((n + 1 : ℕ) : ℤ))
      rw [show (-((n + 1 : ℕ) : ℤ)) - 1 = -((n + 1 + 1 : ℕ) : ℤ) from by push_cast; ring,
        show (-((n + 1 : ℕ) : ℤ)) + 1 = -((n : ℕ) : ℤ) from by push_cast; ring] at e
      rw [ih.2 (t + 1) (by omega) (by omega), ih.2 t ht (by omega),
        ih.1 t ht (by omega)] at e
      rw [e]
      rcases (by omega : n % 2 = 0 ∨ n % 2 = 1) with hn | hn
      · rw [show (n + 1) % 2 = 1 from by omega, show (n + 1 + 1) % 2 = 0 from by omega]
        cases v <;> simp
      · rw [show (n + 1) % 2 = 0 from by omega, show (n + 1 + 1) % 2 = 1 from by omega, hn]
        cases v <;> simp
  intro j t ht ht'
  exact (key j).1 t ht ht'

theorem centerColumn_white_run_lt_start (a L : ℕ) (ha : 1 ≤ a)
    (h : ∀ s ≤ L, centerColumn (a + s) = false) : L < 3 * a := by
  by_contra hcon
  have hcon : 3 * a ≤ L := by omega
  have hw : ∀ t, a ≤ t → t ≤ a + L → evolve t 0 = false := by
    intro t h1 h2
    have hs := h (t - a) (by omega)
    rw [show a + (t - a) = t from by omega] at hs
    exact hs
  -- the pivot: `T = 2a - 1`
  set T : ℕ := 2 * a - 1 with hTdef
  have hT1 : 1 ≤ T := by omega
  have hTa : a ≤ T := by omega
  by_cases hb : evolve T (-1) = true
  · -- the neighbour is black from `T` on, so the picture left of the origin alternates
    have hup : ∀ d : ℕ, T + d ≤ a + L - 1 → evolve (T + d) (-1) = true := by
      intro d
      induction d with
      | zero => intro _; simpa using hb
      | succ n ih =>
        intro hn
        exact wrf (T + n) (hw _ (by omega) (by omega)) (hw _ (by omega) (by omega))
          (hw _ (by omega) (by omega)) (ih (by omega))
    have halt := tri T (a + L - 1 - T) true
      (fun t h1 h2 => hw t (by omega) (by omega))
      (fun t h1 h2 => by
        have := hup (t - T) (by omega)
        rwa [show T + (t - T) = t from by omega] at this)
    have hedge := halt T T (le_refl T) (by omega)
    rw [evolve_left_edge T] at hedge
    have hsec : evolve T (-((T - 1 : ℕ) : ℤ)) = true := by
      have hh := evolve_left_second_diagonal (T - 1)
      rwa [show T - 1 + 1 = T from by omega] at hh
    rw [halt (T - 1) T (le_refl T) (by omega)] at hsec
    simp at hedge hsec
    omega
  · -- the neighbour is white on all of `[a, T]`, so the picture left of the origin is white
    have hb' : evolve T (-1) = false := by
      cases hx : evolve T (-1) with
      | false => rfl
      | true => exact absurd hx hb
    have hdown : ∀ d t, t + d = T → a ≤ t → evolve t (-1) = false := by
      intro d
      induction d with
      | zero =>
        intro t hd _
        rw [show t = T from by omega]; exact hb'
      | succ n ih =>
        intro t hd hta
        have hnext : evolve (t + 1) (-1) = false := ih (t + 1) (by omega) (by omega)
        cases hx : evolve t (-1) with
        | false => rfl
        | true =>
          have := wrf t (hw _ (by omega) (by omega)) (hw _ (by omega) (by omega))
            (hw _ (by omega) (by omega)) hx
          rw [hnext] at this
          exact absurd this (by simp)
    have hwhite := tri a (a - 1) false
      (fun t h1 h2 => hw t (by omega) (by omega))
      (fun t h1 h2 => hdown (T - t) t (by omega) h1)
    have hzero := hwhite (a - 1) a (le_refl a) (by omega)
    have hsec : evolve a (-((a - 1 : ℕ) : ℤ)) = true := by
      have hh := evolve_left_second_diagonal (a - 1)
      rwa [show a - 1 + 1 = a from by omega] at hh
    rw [hsec] at hzero
    simp at hzero
