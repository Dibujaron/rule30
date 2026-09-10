import Rule30.Basic

/-!
Groma, 2026-09-10 — a kernel check of the gap rule of the sighting's §3.1,
against the board's own `rowCell` model rather than against my JavaScript.

`gapAt t` is the least `x ≥ 1` with `rowCell t x = true` (0 if there is none).
The claim is that `gapAt (t+1)` is determined by `(rowCell t 0, gapAt t)` in
four of the five states:

  centre white, g ≥ 2  →  g - 1        (the leftmost black walks one place left)
  centre white, g = 1  →  1            (white_run_monotone)
  centre black, g ≥ 3  →  1            (a black centre plants a black at x = 1)
  centre black, g = 2  →  2
  centre black, g = 1  →  unconstrained (the escape state)

`ok t` is `true` when the prediction holds or the state is the escape one.
-/

def firstBlack : Nat → Nat → Nat
  | _, 0 => 0
  | t, (n + 1) =>
      let x := t + 1 - (n + 1)
      if rowCell t (x : Int) then x else firstBlack t n

/-- least `x` with `1 ≤ x ≤ t` and `rowCell t x = true`, or `0` if none. -/
def gapAt (t : Nat) : Nat := firstBlack t t

def gapPred (c : Bool) (g : Nat) : Option Nat :=
  if c then (if 3 ≤ g then some 1 else if g = 2 then some 2 else none)
  else (if 2 ≤ g then some (g - 1) else some 1)

def ok (t : Nat) : Bool :=
  match gapPred (rowCell t 0) (gapAt t) with
  | none => true
  | some v => v == gapAt (t + 1)

def okWrong (t : Nat) : Bool :=
  match (if rowCell t 0 then gapPred (rowCell t 0) (gapAt t)
         else (if 2 ≤ gapAt t then some (gapAt t) else some 1)) with
  | none => true
  | some v => v == gapAt (t + 1)

-- sanity: the first gaps, read off the board's own row model
#eval (List.range 24).map gapAt
#eval (List.range 24).map (fun t => if rowCell t 0 then 1 else 0)
#eval (List.range 60).all ok
#eval (List.range 60).any (fun t => gapPred (rowCell t 0) (gapAt t) = none)
#eval (List.range 60).all okWrong

set_option maxRecDepth 100000 in
example : (List.range 60).all ok = true := by decide

-- not vacuous: the escape state occurs in the range
set_option maxRecDepth 100000 in
example : (List.range 60).any (fun t => gapPred (rowCell t 0) (gapAt t) == none) = true := by decide

-- and the check has teeth: dropping the decrement fails on the same range
set_option maxRecDepth 100000 in
example : (List.range 60).all okWrong = false := by decide
