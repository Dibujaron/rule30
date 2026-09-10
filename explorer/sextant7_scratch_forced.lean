import Rule30.Basic
import Mathlib.Tactic

/-!
Sextant, 2026-09-10.  The packed-row vocabulary, question (2) of the topic.

The board has `rowStep_agree_forward`, `rowStep_agree_succ_iff` and
`rowStep_agree_succ_two_iff`.  Between them they say how the AGREEMENT FRONT
between two orbits of `rowStep` moves: it never retreats, it advances one bit
when the control bit is black, and it advances two bits under a condition that
mentions BOTH numbers.  That last hypothesis is why nothing in the set forces a
two-bit advance from one number's bits alone -- which is what an argument about
a moving index needs, since the centre column's index moves at one bit per row.

This file supplies the missing piece and then closes it off:

* `rowStep_agree_succ_two_of_triple` -- the triple `(1, 0, 1)` at bits
  `n, n+1, n+2` of `x` forces a TWO-bit advance.  The only fact about `y` it
  uses is that `y` is the one that differs at the front, i.e. `y.testBit (n+1)`
  is the complement of `x`'s.  This is the packed-row form of crystal 64(b)
  (Alidade's forced retreat at the pattern `1 0 1`), which lives in `Config`
  coordinates on the board and has no raw-map statement.

* `rowStep_forced_advance_at_most_two` -- and the forcing stops there: an
  explicit `x`, `y` meeting every hypothesis above whose successors differ at
  bit `n + 3`.  So `+2` per step is the ceiling of the whole family, against a
  centre column that moves `+1` per step and needs to be OVERTAKEN, not matched.

Also kernel-checked here, because the wedge argument in the attack document
needs it: the packed row of row `t` has bit length exactly `2t + 1`, so the
only bit indices the picture occupies are `0 .. 2t` and the only integer
"speeds" a diagonal read can have are `0` (left diagonals), `1` (columns) and
`2` (right diagonals).
-/

private theorem testBit_rowStep (r i : ℕ) :
    (rowStep r).testBit i
      = xor (decide (2 ≤ i) && r.testBit (i - 2))
          ((decide (1 ≤ i) && r.testBit (i - 1)) || r.testBit i) := by
  have h4 : 4 * r = 2 ^ 2 * r := by norm_num
  have h2 : 2 * r = 2 ^ 1 * r := by norm_num
  unfold rowStep
  rw [h4, h2, Nat.testBit_xor, Nat.testBit_or, Nat.testBit_two_pow_mul,
    Nat.testBit_two_pow_mul]

private theorem mod_two_pow_eq_iff (a b m : ℕ) :
    a % 2 ^ m = b % 2 ^ m ↔ ∀ i < m, a.testBit i = b.testBit i := by
  constructor
  · intro h i hi
    have := congrArg (fun x => x.testBit i) h
    simpa [Nat.testBit_mod_two_pow, hi] using this
  · intro h
    apply Nat.eq_of_testBit_eq
    intro i
    rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow]
    by_cases hi : i < m
    · simp [hi, h i hi]
    · simp [hi]

private theorem rowStep_mod_two_pow (r n : ℕ) :
    rowStep r % 2 ^ n = rowStep (r % 2 ^ n) % 2 ^ n := by
  apply Nat.eq_of_testBit_eq
  intro i
  rw [Nat.testBit_mod_two_pow, Nat.testBit_mod_two_pow, testBit_rowStep, testBit_rowStep]
  by_cases hi : i < n
  · have h1 : i - 1 < n := by omega
    have h2 : i - 2 < n := by omega
    simp [Nat.testBit_mod_two_pow, hi, h1, h2]
  · simp [hi]

/-- **The forced two-bit advance.**  `x` and `y` agree on their low `n+1` bits
and differ at bit `n+1` (the agreement front sits there).  If `x` shows the
triple `1, 0, 1` at bits `n, n+1, n+2` then one step of the row map pushes the
front two bits, to `n+3` -- and the hypotheses are on `x`'s bits alone, apart
from the front itself. -/
theorem rowStep_agree_succ_two_of_triple (n x y : ℕ)
    (h : x % 2 ^ (n + 1) = y % 2 ^ (n + 1))
    (hb : x.testBit n = true)
    (hw : x.testBit (n + 1) = false)
    (hy : y.testBit (n + 1) = true)
    (hr : x.testBit (n + 2) = true) :
    rowStep x % 2 ^ (n + 3) = rowStep y % 2 ^ (n + 3) := by
  have hlow := (mod_two_pow_eq_iff x y (n + 1)).1 h
  have hlow1 := (mod_two_pow_eq_iff (rowStep x) (rowStep y) (n + 1)).1
    (by rw [rowStep_mod_two_pow x (n + 1), h, ← rowStep_mod_two_pow y (n + 1)])
  rw [mod_two_pow_eq_iff]
  intro i hi
  by_cases hi' : i < n + 1
  · exact hlow1 i hi'
  · have hyn : y.testBit n = true := by rw [← hlow n (by omega)]; exact hb
    have hcase : i = n + 1 ∨ i = n + 2 := by omega
    rcases hcase with rfl | rfl
    · -- bit n + 1
      rw [testBit_rowStep, testBit_rowStep, show n + 1 - 1 = n by omega,
        hlow (n + 1 - 2) (by omega), hb, hyn, hw, hy]
      simp
    · -- bit n + 2
      rw [testBit_rowStep, testBit_rowStep, show n + 2 - 1 = n + 1 by omega,
        show n + 2 - 2 = n by omega, hb, hyn, hw, hy, hr]
      simp

/-- **And the forcing stops at two.**  `x = 11`, `y = 15`, `n = 1`: every
hypothesis of the lemma above holds, the successors agree at bits `n+1` and
`n+2` as it says, and they differ at bit `n+3`.  So no strengthening of the
raw-map agreement lemmas forces a three-bit advance. -/
theorem rowStep_forced_advance_at_most_two :
    (11 : ℕ) % 2 ^ 2 = (15 : ℕ) % 2 ^ 2 ∧
    (11 : ℕ).testBit 1 = true ∧ (11 : ℕ).testBit 2 = false ∧
    (15 : ℕ).testBit 2 = true ∧ (11 : ℕ).testBit 3 = true ∧
    rowStep 11 % 2 ^ 4 = rowStep 15 % 2 ^ 4 ∧
    rowStep 11 % 2 ^ 5 ≠ rowStep 15 % 2 ^ 5 := by
  refine ⟨by decide, by decide, by decide, by decide, by decide, by decide, by decide⟩

/-- **The cone, in the packed-row vocabulary.**  Row `t` occupies bits `0` to
`2t` and no others, checked by the kernel for `t ≤ 120`.  In the picture this is
`evolve_left_edge` (bit `0` set), `evolve_right_edge` (bit `2t` set) and
`evolve_eq_false_of_outside_cone` (nothing above).  It is what makes "a diagonal
read has a speed" a bounded question: the readable bit indices at row `t` are
exactly `0 .. 2t`, so the integer speeds are `0`, `1` and `2`, and they are the
left diagonals, the columns and the right diagonals. -/
theorem rowNat_bitlength_le_120 :
    ∀ t : Fin 121, 2 ^ (2 * (t : ℕ)) ≤ rowNat t ∧ rowNat t < 2 ^ (2 * (t : ℕ) + 1) := by
  decide +kernel

/-- **The autonomous prefix is minimal.**  `rowStep` carries information only
upward through the bits, so the low `n` bits are a closed subsystem -- that is
`stepMod`, and it is why every tool the board has settles a FIXED bit index.
This says there is nothing smaller: for every `n`, two numbers agreeing on their
low `n` bits can have successors that already differ at bit `n`.  Witness
`x = 0`, `y = 2 ^ n`.

Consequence, and the reason it is here: the only subsystems of the orbit closed
under the dynamics are the bit-prefixes, so the unique one containing bit `t` is
"bits `0 .. t`" entire.  A conserved or monotone quantity that constrains the
centre column would have to be a quantity of that whole prefix -- and the
prefix's own preperiod is measured at `4t/3`, past the row where the centre
column reads it. -/
theorem rowStep_prefix_minimal (n : ℕ) :
    ∃ x y : ℕ, x % 2 ^ n = y % 2 ^ n ∧ rowStep x % 2 ^ (n + 1) ≠ rowStep y % 2 ^ (n + 1) := by
  refine ⟨0, 2 ^ n, by simp, ?_⟩
  have h0 : rowStep 0 = 0 := by simp [rowStep]
  have hy : rowStep (2 ^ n) = 2 ^ (n + 2) ^^^ (2 ^ (n + 1) ||| 2 ^ n) := by
    show 4 * 2 ^ n ^^^ (2 * 2 ^ n ||| 2 ^ n) = _
    ring_nf
  rw [h0, hy]
  simp only [Nat.zero_mod, ne_eq]
  intro hcon
  have hbit : ((2 ^ (n + 2) ^^^ (2 ^ (n + 1) ||| 2 ^ n) : ℕ) % 2 ^ (n + 1)).testBit n = true := by
    rw [Nat.testBit_mod_two_pow]
    simp [Nat.testBit_xor, Nat.testBit_or]
  rw [← hcon] at hbit
  simp at hbit

/-- The two moving reads, side by side, at the depths the kernel can reach.
`centerColumn k` is bit `k` of row `k`; `centerColumn_eq_evolve_mul_pow` says it
is also bit `2m·2^k + k` of row `m·2^k + k`.  Both are moving indices; the first
moves at one bit per row and the second at very nearly two. -/
theorem centerColumn_reread_le :
    ∀ k : Fin 5, ∀ m : Fin 4,
      (rowNat ((m : ℕ) * 2 ^ (k : ℕ) + k)).testBit (2 * (m : ℕ) * 2 ^ (k : ℕ) + k)
        = (rowNat k).testBit k := by
  decide +kernel

#print axioms rowStep_agree_succ_two_of_triple
#print axioms rowStep_forced_advance_at_most_two
#print axioms rowNat_bitlength_le_120
#print axioms rowStep_prefix_minimal
#print axioms centerColumn_reread_le
