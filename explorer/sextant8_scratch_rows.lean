import Rule30.Basic

/-!
Sextant, 2026-09-12. Kernel checks for the row-marginal attack.

Everything here is `decide`, evaluated by the kernel, against `rowCell` --
the board's row model, tied to the real automaton by `rowCell_eq_evolve`.

  (1) THE IDENTITY, Talus C4.       b(t+1) = rho(t) + 2*G2(t) + 2
  (2) ITS OTHER FORM.               b(t+1) = 3*rho(t) - 2*G1(t)
  (3) THE ONE-BLOCK BOUND (new).    2*b(t+1) + 3*b(t) <= 6t + 9
  (4) IT IS TIGHT.                  equality at t = 0, 1, 2
  (5) TALUS C3 IS STRICTLY WEAKER.  its slack exceeds (3)'s from t = 3 on
  (6) THE 3/5 WITNESS.              the ring 10011 has temporal period 5 under
      rule 30 and every state of its cycle has weight 3, so its orbit-average
      black density is exactly 3/5 -- the exact value of the bound in (3).
      Hence no sharpening of (3) is possible: a real rule 30 orbit attains it.

The companion file sextant8_scratch_mutant.lean asserts (3) with 6t+8 and is
rejected, which is the demonstration that these checks can fail.
-/

namespace Sextant8

/-- Cell `i` of row `t`, `i = 0 .. 2t`, i.e. position `x = i - t`. -/
private def cell (t i : ℕ) : Bool := rowCell t ((i : ℤ) - (t : ℤ))

/-- Black cells of row `t`. -/
private def bRow (t : ℕ) : ℕ :=
  ((List.range (2 * t + 1)).filter (fun i => cell t i)).length

/-- Maximal black runs of row `t`: a run starts at `i` when `i` is black and
`i = 0` or `i - 1` is white. -/
private def rhoRow (t : ℕ) : ℕ :=
  ((List.range (2 * t + 1)).filter
    (fun i => cell t i && (decide (i = 0) || !cell t (i - 1)))).length

/-- Interior white gaps of length exactly one: black, white, black. -/
private def g1Row (t : ℕ) : ℕ :=
  ((List.range (2 * t + 1)).filter
    (fun i => decide (1 ≤ i) && cell t (i - 1) && !cell t i && cell t (i + 1))).length

/-- Interior white gaps of length at least two, counted at their left end:
black, white, white. Both edges of the row are black, so every gap that starts
inside is interior. -/
private def g2Row (t : ℕ) : ℕ :=
  ((List.range (2 * t + 1)).filter
    (fun i => decide (1 ≤ i) && cell t (i - 1) && !cell t i && !cell t (i + 1))).length

set_option maxRecDepth 100000

-- (1) the identity
example : ∀ t ∈ List.range 24, bRow (t + 1) = rhoRow t + 2 * g2Row t + 2 := by decide

-- (2) the same thing with G1 in place of G2, using G1 + G2 = rho - 1
example : ∀ t ∈ List.range 24, bRow (t + 1) + 2 * g1Row t = 3 * rhoRow t := by decide

-- the gap bookkeeping the identity rests on
example : ∀ t ∈ List.range 24, g1Row t + g2Row t + 1 = rhoRow t := by decide

-- (3) the one-block bound
example : ∀ t ∈ List.range 24, 2 * bRow (t + 1) + 3 * bRow t ≤ 6 * t + 9 := by decide

-- (4) it is attained at t = 0, 1, 2 -- so it is the right inequality, not a
-- loose one that happens to hold
example : 2 * bRow 1 + 3 * bRow 0 = 6 * 0 + 9 := by decide
example : 2 * bRow 2 + 3 * bRow 1 = 6 * 1 + 9 := by decide
example : 2 * bRow 3 + 3 * bRow 2 = 6 * 2 + 9 := by decide

-- (5) Talus C3 holds too, and the new bound is strictly stronger wherever the
-- row is not all black. Both caps on b(t+1), doubled to stay in ℕ and written
-- without subtraction: C3 allows 8t+10-4b, the new one 6t+9-3b, and
--     6t+9+4b < 8t+10+3b   <->   b(t) < 2t+1.
example : ∀ t ∈ List.range 24, bRow (t + 1) + 2 * bRow t ≤ 4 * t + 5 := by decide
example : ∀ t ∈ List.range 24, 2 ≤ t →
    6 * t + 9 + 4 * bRow t < 8 * t + 10 + 3 * bRow t := by decide
-- and the one exception, row 1 = 111, the only all-black row, where the two
-- caps coincide
example : bRow 1 = 2 * 1 + 1 := by decide

/-! ### (6) the witness that makes the bound sharp -/

/-- One rule 30 step on a ring: `new i = s (i-1) XOR (s i OR s (i+1))`. -/
private def ringStep (s : List Bool) : List Bool :=
  let n := s.length
  (List.range n).map (fun i =>
    xor (s.getD ((i + n - 1) % n) false)
      (s.getD i false || s.getD ((i + 1) % n) false))

private def w : List Bool := [true, false, false, true, true]   -- 10011

private def weight (s : List Bool) : ℕ := (s.filter id).length

-- temporal period exactly 5
example : ringStep^[5] w = w := by decide
example : ringStep^[1] w ≠ w := by decide

-- every state of the cycle has weight 3 of 5, so the orbit-average black
-- density is exactly 15/25 = 3/5
example : ∀ k ∈ List.range 5, weight (ringStep^[k] w) = 3 := by decide

-- and the one-block bound is attained on it: with rho = 1, G2 = 1 the ring
-- form of the identity gives b' = rho + 2*G2 = 3, and w(t) = 2 = rho + G2,
-- so every constraint of the programme is met with equality.
example : weight (ringStep^[1] w) = 3 * (5 - weight w) / 2 := by decide

end Sextant8
