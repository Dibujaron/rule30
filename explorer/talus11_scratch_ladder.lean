import Rule30.Basic

/-!
Talus, 2026-09-12.  Kernel confirmation of four cells of the period-ladder table
in `docs/attacks/2026-09-12-which-target-words-the-cone-can-see-*.md`.

`f(p,a)` is the longest period-`p` block of the centre column of a configuration
white at every `x < -a` and black at `-a`.  Only finitely many cells matter: the
centre at time `t` reads row 0 on `[-t, t]`, so a block of `L` cells is decided by
the window `[-L, L-1]` with everything left of `-a` white.  So "no such
configuration has a period-`p` block of `L` cells" is a finite check over
`2^(L+a-1)` windows, and the kernel can do it.

Verified: `f(1,1) = 3`, `f(2,1) = 8`, `f(3,1) = 8`, `f(2,2) = 7`, each as a
matching pair -- no window reaches `f+1`, some window reaches `f` -- so neither
half is vacuous.  `model_agrees_with_board` ties the list model to the board's own
`rowCell` on the seed, which is `window L 0 0`.
-/

namespace Talus11

/-- One rule 30 step on a window, losing one cell at each end. -/
def step : List Bool → List Bool
  | a :: b :: c :: rest => (xor a (b || c)) :: step (b :: c :: rest)
  | _ => []

def evolveN : Nat → List Bool → List Bool
  | 0, r => r
  | n + 1, r => evolveN n (step r)

/-- The window spans positions `-L .. L-1`, so position `0` sits at index `L`;
after `t` steps it spans `-L+t .. L-1-t` and position `0` is at index `L - t`. -/
def centre (L : Nat) (row : List Bool) (t : Nat) : Bool :=
  (evolveN t row).getD (L - t) false

def bitsOf (v : Nat) : Nat → List Bool
  | 0 => []
  | k + 1 => (v % 2 == 1) :: bitsOf (v / 2) k

/-- A window of the class: white left of `-a`, black at `-a`, free from `-a+1`
rightward, laid out over positions `-L .. L-1`.  `window L 0 0` is the seed. -/
def window (L a v : Nat) : List Bool :=
  List.replicate (L - a) false ++ (true :: bitsOf v (L + a - 1))

/-- Does this window's centre column repeat with period `p` across its span? -/
def periodicBlock (L p : Nat) (row : List Bool) : Bool :=
  (List.range (L - p)).all (fun t => centre L row (t + p) == centre L row t)

def noBlock (L a p : Nat) : Bool :=
  (List.range (2 ^ (L + a - 1))).all (fun v => !periodicBlock L p (window L a v))

def someBlock (L a p : Nat) : Bool :=
  (List.range (2 ^ (L + a - 1))).any (fun v => periodicBlock L p (window L a v))

set_option maxRecDepth 100000

/-- The list model is the board's automaton, on the seed. -/
theorem model_agrees_with_board :
    (List.range 18).map (fun t => centre 20 (window 20 0 0) t)
      = (List.range 18).map (fun t => rowCell t 0) := by
  decide

-- f(1,1) = 3 : an all-black column reaches 3 cells and not 4
theorem f_1_1_upper : noBlock 4 1 1 = true := by decide
theorem f_1_1_sharp : someBlock 3 1 1 = true := by decide

-- f(2,1) = 8
theorem f_2_1_upper : noBlock 9 1 2 = true := by decide
theorem f_2_1_sharp : someBlock 8 1 2 = true := by decide

-- f(3,1) = 8
theorem f_3_1_upper : noBlock 9 1 3 = true := by decide
theorem f_3_1_sharp : someBlock 8 1 3 = true := by decide

-- f(2,2) = 7
theorem f_2_2_upper : noBlock 8 2 2 = true := by decide
theorem f_2_2_sharp : someBlock 7 2 2 = true := by decide

#print axioms model_agrees_with_board
#print axioms f_1_1_upper
#print axioms f_2_1_upper
#print axioms f_3_1_upper
#print axioms f_2_2_upper

end Talus11
