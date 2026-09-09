import Mathlib

/-!
Talus, 2026-09-09.  The backbone of the attack on the rigidity law.

`step r = 4r XOR (2r OR r)` is rule 30's row map; `T_n r = step r % 2^n` is it on n bits.
Everything in the attack document rests on one identity: `step` commutes with doubling.
Doubling a row is sliding the picture one cell in from the left edge, so the even states
are a faithful copy of the whole system one bit narrower, and the attractor's growth from
level n-1 to level n is exactly the number of ODD periodic points at level n.
-/

def step (r : ℕ) : ℕ := 4 * r ^^^ (2 * r ||| r)

theorem step_two_mul (s : ℕ) : step (2 * s) = 2 * step s := by
  have h : ∀ x : ℕ, 2 * x = x <<< 1 := fun x => by rw [Nat.shiftLeft_eq]; ring
  show 4 * (2 * s) ^^^ (2 * (2 * s) ||| 2 * s) = 2 * (4 * s ^^^ (2 * s ||| s))
  rw [show 4 * (2 * s) = 2 * (4 * s) from by ring]
  simp only [h, ← Nat.shiftLeft_or_distrib, ← Nat.shiftLeft_xor_distrib]

/-- The truncated map on `n+1` bits, applied to an even state, is the truncated map on
`n` bits applied to half of it, doubled. -/
theorem stepMod_two_mul (n s : ℕ) :
    step (2 * s) % 2 ^ (n + 1) = 2 * (step s % 2 ^ n) := by
  rw [step_two_mul, pow_succ, mul_comm (2 ^ n) 2, Nat.mul_mod_mul_left]

/-- …and so at every time: the orbit of an even state at width `n+1` is the orbit of its
half at width `n`, doubled.  This is what makes `A(n+1) ∩ 2ℕ = 2 · A(n)`. -/
theorem stepMod_iterate_two_mul (n : ℕ) (t : ℕ) (s : ℕ) :
    (fun r => step r % 2 ^ (n + 1))^[t] (2 * s) = 2 * (fun r => step r % 2 ^ n)^[t] s := by
  induction t generalizing s with
  | zero => simp
  | succ k ih =>
      rw [Function.iterate_succ_apply, Function.iterate_succ_apply]
      simp only [stepMod_two_mul]
      exact ih _

#print axioms step_two_mul
#print axioms stepMod_two_mul
#print axioms stepMod_iterate_two_mul

/-! The other half of the reduction, at one width, decided by the kernel: every ODD state
of width 12 lands on the seed's own cycle, whose minimal period is 4.  With the halving
identity above this says `|A(12)| - |A(11)| = 4 = maxCycle(12)` — the rigidity law at
n = 12, from a finite computation the kernel performed rather than one I ran. -/

set_option maxRecDepth 20000 in
example : (fun r => step r % 2 ^ 12)^[60] 1 = (fun r => step r % 2 ^ 12)^[64] 1 := by
  decide +kernel

set_option maxRecDepth 20000 in
example : (fun r => step r % 2 ^ 12)^[60] 1 ≠ (fun r => step r % 2 ^ 12)^[62] 1 := by
  decide +kernel

set_option maxRecDepth 100000 in
example : ∀ x < 2 ^ 12, x % 2 = 1 →
    ∃ j < 4, (fun r => step r % 2 ^ 12)^[60] x = (fun r => step r % 2 ^ 12)^[60 + j] 1 := by
  decide +kernel
