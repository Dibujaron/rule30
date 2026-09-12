import Rule30.Basic
import Mathlib.Tactic.NormNum

/-!
The mutant beside `talus13_scratch_cone.lean`: the same closed form with the
`-5` clause weakened from `(q XOR !p) || !p` to `(q XOR !p)` -- i.e. dropping the
OR that the rule creates.  Lean must REJECT it, at the `-5` line and nowhere
else.  Without this file, "accepted" says nothing.
-/

theorem colStep' (X : Config) (i : ℤ) (t : ℕ) :
    column X i (t + 1) = (column X (i - 1) t ^^ (column X i t || column X (i + 1) t)) := by
  simp only [column, evolveFrom, Function.iterate_succ_apply', rule30_eq]

theorem colLeft' (X : Config) (i : ℤ) (t : ℕ) :
    column X (i - 1) t = (column X i (t + 1) ^^ (column X i t || column X (i + 1) t)) := by
  have h := colStep' X i t
  revert h
  cases column X (i - 1) t <;> cases (column X i t || column X (i + 1) t) <;> simp_all

theorem mutant_cone_w011 (X : Config)
    (h0 : column X 0 0 = false) (h1 : column X 0 1 = true)
    (h2 : column X 0 2 = true) (h3 : column X 0 3 = false)
    (h4 : column X 0 4 = true) (h5 : column X 0 5 = true)
    (h6 : column X 0 6 = false) :
    column X (-5) 0 = (column X 1 3 ^^ !column X 1 0) := by
  have L1 : ∀ t : ℕ, column X (-1) t
      = (column X 0 (t + 1) ^^ (column X 0 t || column X 1 t)) := by
    intro t; have := colLeft' X 0 t; norm_num at this; exact this
  have L2 : ∀ t : ℕ, column X (-2) t
      = (column X (-1) (t + 1) ^^ (column X (-1) t || column X 0 t)) := by
    intro t; have := colLeft' X (-1) t; norm_num at this; exact this
  have L3 : ∀ t : ℕ, column X (-3) t
      = (column X (-2) (t + 1) ^^ (column X (-2) t || column X (-1) t)) := by
    intro t; have := colLeft' X (-2) t; norm_num at this; exact this
  have L4 : ∀ t : ℕ, column X (-4) t
      = (column X (-3) (t + 1) ^^ (column X (-3) t || column X (-2) t)) := by
    intro t; have := colLeft' X (-3) t; norm_num at this; exact this
  have L5 : ∀ t : ℕ, column X (-5) t
      = (column X (-4) (t + 1) ^^ (column X (-4) t || column X (-3) t)) := by
    intro t; have := colLeft' X (-4) t; norm_num at this; exact this
  set p := column X 1 0 with hp
  set q := column X 1 3 with hq
  have a0 : column X (-1) 0 = !p := by rw [L1 0]; simp [h0, h1, ← hp]
  have a1 : column X (-1) 1 = false := by rw [L1 1]; simp [h1, h2]
  have a2 : column X (-1) 2 = true := by rw [L1 2]; simp [h2, h3]
  have a3 : column X (-1) 3 = !q := by rw [L1 3]; simp [h3, h4, ← hq]
  have a4 : column X (-1) 4 = false := by rw [L1 4]; simp [h4, h5]
  have a5 : column X (-1) 5 = true := by rw [L1 5]; simp [h5, h6]
  have b0 : column X (-2) 0 = !p := by rw [L2 0, a0, a1, h0]; simp
  have b1 : column X (-2) 1 = false := by rw [L2 1, a1, a2, h1]; simp
  have b2 : column X (-2) 2 = q := by rw [L2 2, a2, a3, h2]; simp
  have b3 : column X (-2) 3 = !q := by rw [L2 3, a3, a4, h3]; simp
  have b4 : column X (-2) 4 = false := by rw [L2 4, a4, a5, h4]; simp
  have c0 : column X (-3) 0 = !p := by rw [L3 0, b0, b1, a0]; simp
  have c1 : column X (-3) 1 = q := by rw [L3 1, b1, b2, a1]; simp
  have c2 : column X (-3) 2 = q := by rw [L3 2, b2, b3, a2]; simp
  have c3 : column X (-3) 3 = !q := by rw [L3 3, b3, b4, a3]; simp
  have d0 : column X (-4) 0 = (q ^^ !p) := by
    rw [L4 0, c0, c1, b0]; cases p <;> cases q <;> simp
  have d1 : column X (-4) 1 = false := by rw [L4 1, c1, c2, b1]; cases q <;> simp
  -- THE MUTATION: the OR is dropped.  This line must fail.
  rw [L5 0, d0, d1, c0]
  cases p <;> cases q <;> simp
