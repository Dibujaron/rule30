import Rule30.Basic
import Mathlib.Tactic.NormNum

/-!
The first six cells of row 0, left of the origin, for any configuration whose
centre column begins 0 1 1 0 1 1 0 -- that is, whose centre column agrees with
the period-3 word `011` for seven steps.  They are an explicit function of just
TWO bits of column 1, namely its values at the two WHITE centre times 0 and 3.

This is the whole algebraic content of the left-only reduction at that word:
the cone map's image satisfies exactly three independent affine relations at
every depth measured (to column 45), and all three are corollaries of this.
-/

theorem colStep (X : Config) (i : ℤ) (t : ℕ) :
    column X i (t + 1) = (column X (i - 1) t ^^ (column X i t || column X (i + 1) t)) := by
  simp only [column, evolveFrom, Function.iterate_succ_apply', rule30_eq]

theorem colLeft (X : Config) (i : ℤ) (t : ℕ) :
    column X (i - 1) t = (column X i (t + 1) ^^ (column X i t || column X (i + 1) t)) := by
  have h := colStep X i t
  revert h
  cases column X (i - 1) t <;> cases (column X i t || column X (i + 1) t) <;>
    simp_all

section
variable (X : Config)
variable (h0 : column X 0 0 = false) (h1 : column X 0 1 = true)
  (h2 : column X 0 2 = true) (h3 : column X 0 3 = false)
  (h4 : column X 0 4 = true) (h5 : column X 0 5 = true)
  (h6 : column X 0 6 = false)

include h0 h1 h2 h3 h4 h5 h6

/-- Every cell of row 0 at `x = -1 .. -6` is determined by the two bits
`p = column X 1 0` and `q = column X 1 3`. -/
theorem cone_w011_closed_form :
    column X (-1) 0 = !column X 1 0
  ∧ column X (-2) 0 = !column X 1 0
  ∧ column X (-3) 0 = !column X 1 0
  ∧ column X (-4) 0 = (column X 1 3 ^^ !column X 1 0)
  ∧ column X (-5) 0 = ((column X 1 3 ^^ !column X 1 0) || !column X 1 0)
  ∧ column X (-6) 0 =
      (!column X 1 3 ^^ ((column X 1 3 ^^ !column X 1 0) || !column X 1 0)) := by
  -- column -1, at t = 0 .. 5
  have L1 : ∀ t : ℕ, column X (-1) t
      = (column X 0 (t + 1) ^^ (column X 0 t || column X 1 t)) := by
    intro t; have := colLeft X 0 t; norm_num at this; exact this
  have L2 : ∀ t : ℕ, column X (-2) t
      = (column X (-1) (t + 1) ^^ (column X (-1) t || column X 0 t)) := by
    intro t; have := colLeft X (-1) t; norm_num at this; exact this
  have L3 : ∀ t : ℕ, column X (-3) t
      = (column X (-2) (t + 1) ^^ (column X (-2) t || column X (-1) t)) := by
    intro t; have := colLeft X (-2) t; norm_num at this; exact this
  have L4 : ∀ t : ℕ, column X (-4) t
      = (column X (-3) (t + 1) ^^ (column X (-3) t || column X (-2) t)) := by
    intro t; have := colLeft X (-3) t; norm_num at this; exact this
  have L5 : ∀ t : ℕ, column X (-5) t
      = (column X (-4) (t + 1) ^^ (column X (-4) t || column X (-3) t)) := by
    intro t; have := colLeft X (-4) t; norm_num at this; exact this
  have L6 : ∀ t : ℕ, column X (-6) t
      = (column X (-5) (t + 1) ^^ (column X (-5) t || column X (-4) t)) := by
    intro t; have := colLeft X (-5) t; norm_num at this; exact this
  -- the two free bits
  set p := column X 1 0 with hp
  set q := column X 1 3 with hq
  -- column -1
  have a0 : column X (-1) 0 = !p := by rw [L1 0]; simp [h0, h1, ← hp]
  have a1 : column X (-1) 1 = false := by rw [L1 1]; simp [h1, h2]
  have a2 : column X (-1) 2 = true := by rw [L1 2]; simp [h2, h3]
  have a3 : column X (-1) 3 = !q := by rw [L1 3]; simp [h3, h4, ← hq]
  have a4 : column X (-1) 4 = false := by rw [L1 4]; simp [h4, h5]
  have a5 : column X (-1) 5 = true := by rw [L1 5]; simp [h5, h6]
  -- column -2
  have b0 : column X (-2) 0 = !p := by rw [L2 0, a0, a1, h0]; simp
  have b1 : column X (-2) 1 = false := by rw [L2 1, a1, a2, h1]; simp
  have b2 : column X (-2) 2 = q := by rw [L2 2, a2, a3, h2]; simp
  have b3 : column X (-2) 3 = !q := by rw [L2 3, a3, a4, h3]; simp
  have b4 : column X (-2) 4 = false := by rw [L2 4, a4, a5, h4]; simp
  -- column -3
  have c0 : column X (-3) 0 = !p := by rw [L3 0, b0, b1, a0]; simp
  have c1 : column X (-3) 1 = q := by rw [L3 1, b1, b2, a1]; simp
  have c2 : column X (-3) 2 = q := by rw [L3 2, b2, b3, a2]; simp
  have c3 : column X (-3) 3 = !q := by rw [L3 3, b3, b4, a3]; simp
  -- column -4
  have d0 : column X (-4) 0 = (q ^^ !p) := by
    rw [L4 0, c0, c1, b0]; cases p <;> cases q <;> simp
  have d1 : column X (-4) 1 = false := by rw [L4 1, c1, c2, b1]; cases q <;> simp
  have d2 : column X (-4) 2 = true := by rw [L4 2, c2, c3, b2]; cases q <;> simp
  -- column -5
  have e0 : column X (-5) 0 = ((q ^^ !p) || !p) := by
    rw [L5 0, d0, d1, c0]; cases p <;> cases q <;> simp
  have e1 : column X (-5) 1 = !q := by rw [L5 1, d1, d2, c1]; cases q <;> simp
  -- column -6
  have f0 : column X (-6) 0 = (!q ^^ ((q ^^ !p) || !p)) := by
    rw [L6 0, e0, e1, d0]; cases p <;> cases q <;> simp
  exact ⟨a0, b0, c0, d0, e0, f0⟩

/-- The three affine relations, and they are all of them: the image of the cone
map satisfies no others at any depth measured. -/
theorem cone_w011_relations :
    (column X (-1) 0 = column X (-2) 0)
  ∧ (column X (-2) 0 = column X (-3) 0)
  ∧ (column X (-1) 0 ^^ column X (-4) 0 ^^ column X (-5) 0 ^^ column X (-6) 0) = true := by
  obtain ⟨a, b, c, d, e, f⟩ := cone_w011_closed_form X h0 h1 h2 h3 h4 h5 h6
  refine ⟨by rw [a, b], by rw [b, c], ?_⟩
  rw [a, d, e, f]
  cases column X 1 0 <;> cases column X 1 3 <;> simp

/-- `a = 3`: no configuration whose row 0 is white at every `x < -3` and black at
`x = -3` has a centre column agreeing with `011` for seven steps -- the cell at
`x = -5` is forced black.  This is the rung at `a = 3`, proved. -/
theorem cone_w011_a3 (hb : column X (-3) 0 = true) (hw4 : column X (-4) 0 = false) :
    column X (-5) 0 = true := by
  obtain ⟨a, b, c, d, e, f⟩ := cone_w011_closed_form X h0 h1 h2 h3 h4 h5 h6
  rw [c] at hb
  rw [e]
  rw [d] at hw4
  revert hb hw4
  cases column X 1 0 <;> cases column X 1 3 <;> simp

/-- `a = 4`: same, one column further out. -/
theorem cone_w011_a4 (hb : column X (-4) 0 = true) : column X (-5) 0 = true := by
  obtain ⟨a, b, c, d, e, f⟩ := cone_w011_closed_form X h0 h1 h2 h3 h4 h5 h6
  rw [d] at hb
  rw [e, hb]
  simp

/-- `a = 1`. -/
theorem cone_w011_a1 (hb : column X (-1) 0 = true) : column X (-2) 0 = true := by
  obtain ⟨a, b, _, _, _, _⟩ := cone_w011_closed_form X h0 h1 h2 h3 h4 h5 h6
  rw [b, ← a]; exact hb

/-- `a = 2`. -/
theorem cone_w011_a2 (hb : column X (-2) 0 = true) : column X (-3) 0 = true := by
  obtain ⟨_, b, c, _, _, _⟩ := cone_w011_closed_form X h0 h1 h2 h3 h4 h5 h6
  rw [c, ← b]; exact hb

end

/-!
## The relation space is exactly three-dimensional, and the check can fail

`cone_w011_closed_form` says the row `(cell(-1,0), ..., cell(-6,0))` is
`row p q` for the two free bits.  Below, the kernel enumerates every one of the
64 linear functionals on those six cells and counts how many are constant on
`{row p q}` -- the answer is 8, which is `2^3`, so the relation space has
dimension exactly 3 and no fourth relation exists.  The same enumeration
demonstrates the instrument can fail: `no_fourth_relation` exhibits a
functional that is NOT constant.
-/

def coneRow (p q : Bool) : List Bool :=
  [!p, !p, !p, (q ^^ !p), ((q ^^ !p) || !p), (!q ^^ ((q ^^ !p) || !p))]

def coneDot (a : Nat) (w : List Bool) : Bool :=
  (List.range 6).foldl (fun acc i => acc ^^ (a.testBit i && w.getD i false)) false

def coneIsRel (a : Nat) : Bool :=
  decide (∀ p q p' q' : Bool, coneDot a (coneRow p q) = coneDot a (coneRow p' q'))

/-- Exactly `2^3` functionals are constant on the image, so exactly three
independent affine relations hold on the first six columns -- and no more. -/
theorem cone_w011_relation_space_dim_three :
    ((List.range 64).filter coneIsRel).length = 8 := by decide

/-- The three generators, read off: `W1+W2`, `W2+W3`, `W1+W4+W5+W6`. -/
theorem cone_w011_relation_generators :
    (List.range 64).filter coneIsRel = [0, 3, 5, 6, 57, 58, 60, 63] := by decide

/-- The check can fail: `W4 + W5` is not constant on the image. -/
theorem no_fourth_relation : coneIsRel 24 = false := by decide

/-- And the closed form is not vacuous in the two bits: the four assignments
give four distinct rows. -/
theorem cone_w011_image_has_four_points :
    (([(false, false), (false, true), (true, false), (true, true)].map
      (fun pq => coneRow pq.1 pq.2)).eraseDups).length = 4 := by decide

#print axioms cone_w011_closed_form
#print axioms cone_w011_relations
#print axioms cone_w011_a1
#print axioms cone_w011_a2
#print axioms cone_w011_a3
#print axioms cone_w011_a4
#print axioms cone_w011_relation_space_dim_three
#print axioms cone_w011_relation_generators
#print axioms no_fourth_relation
#print axioms cone_w011_image_has_four_points
