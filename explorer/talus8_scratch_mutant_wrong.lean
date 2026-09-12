/-
Talus, 2026-09-12. Second MUTANT of `talus8_scratch_periodic.lean`, kept beside it.

The one change: the answer ignores the `min(n, M)` cap and always returns
`f (M + n mod p)` — i.e. the machine that would be right if `f` were periodic from 0.
The point: "eventually periodic" is not "periodic", and the cap is load-bearing.

This file is ACCEPTED by Lean; what it proves is that the mutant machine gives the
WRONG answer on a genuinely eventually periodic sequence, computed by the kernel:
`f₀ n = decide (n = 0)` has period 1 from `N = 1`, so `M = 1 * 1 = 1`; on input `0`
(`encodeNat 0 = []`, one step) the mutant outputs `[false]` while `f₀ 0 = true`.

Run with `lake env lean explorer/talus8_scratch_mutant_wrong.lean`.
-/
import Mathlib.Computability.TuringMachine.Computable
import Mathlib.Data.ZMod.Basic

open Computability Turing Turing.TM2 Turing.TM2.Stmt StateTransition

namespace Talus8MutantWrong

abbrev St (p M : ℕ) : Type := Bool × ZMod p × ZMod p × Fin (M + 1) × Fin (M + 1)

section Machine

variable (p M : ℕ) [NeZero p] (f : ℕ → Bool)

def stOf (v i : ℕ) : St p M :=
  (false, (v : ZMod p), ((2 ^ i : ℕ) : ZMod p), ⟨min v M, by omega⟩, ⟨min (2 ^ i) M, by omega⟩)

def upd (s : St p M) (b : Bool) : St p M :=
  (false, s.2.1 + (b.toNat : ZMod p) * s.2.2.1, 2 * s.2.2.1,
    ⟨min (s.2.2.2.1.val + b.toNat * s.2.2.2.2.val) M, by omega⟩,
    ⟨min (2 * s.2.2.2.2.val) M, by omega⟩)

/-- MUTANT: no cap, always the periodic branch. -/
def ans (s : St p M) : Bool := f (M + s.2.1.val)

def popF (s : St p M) : Option Bool → St p M
  | none => (true, s.2)
  | some b => upd p M s b

def mach : FinTM2 where
  K := Unit
  k₀ := ()
  k₁ := ()
  Γ _ := Bool
  Λ := Unit
  main := ()
  σ := St p M
  initialState := stOf p M 0 0
  m _ := pop () (popF p M)
          (branch (fun s => s.1)
            (push () (ans p M f) (load (fun _ => stOf p M 0 0) halt))
            (goto (fun _ => ())))

end Machine

/-- Eventually periodic with period 1 from index 1, and NOT periodic from 0. -/
def f₀ (n : ℕ) : Bool := decide (n = 0)

theorem f₀_eventuallyPeriodic : ∃ p > 0, ∃ N, ∀ n ≥ N, f₀ (n + p) = f₀ n :=
  ⟨1, by norm_num, 1, fun n hn => by simp [f₀]; omega⟩

-- The mutant, with `M = N * p = 1`, halts on input `0` with `[false]` on its stack ...
example : (flip bind (mach 1 1 f₀).step)^[1] (some (initList (mach 1 1 f₀) (encodeNat 0))) =
    some (haltList (mach 1 1 f₀) [false]) := rfl

-- ... and `f₀ 0 = true`. So the mutant is a correct `FinTM2` run that computes the wrong
-- function: the `min(n, M)` cap in the real construction is what carries the prefix.
example : f₀ 0 = true := rfl

-- For contrast, on input `3` (past the onset) the mutant is right: `f₀ 3 = false`.
example : (flip bind (mach 1 1 f₀).step)^[3] (some (initList (mach 1 1 f₀) (encodeNat 3))) =
    some (haltList (mach 1 1 f₀) [false]) := rfl

end Talus8MutantWrong
