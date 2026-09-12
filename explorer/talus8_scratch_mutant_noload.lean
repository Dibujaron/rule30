/-
Talus, 2026-09-12. MUTANT of `talus8_scratch_periodic.lean`, kept beside it as the
demonstration that the check can fail.

The one change: the halting branch is `push () ans halt` instead of
`push () ans (load (fun _ => stOf p M 0 0) halt)` — the machine does NOT restore
`initialState` before halting. This is exactly the requirement `haltList` imposes
that the connector expected to cost a day. Expected: `step_nil` is rejected, because
the halting configuration's `var` is `(true, s.2)` and not `stOf p M 0 0`.

Run with `lake env lean explorer/talus8_scratch_mutant_noload.lean`; it must FAIL.
-/
import Mathlib.Computability.TuringMachine.Computable
import Mathlib.Data.ZMod.Basic

open Computability Turing Turing.TM2 Turing.TM2.Stmt StateTransition

namespace Talus8Mutant

abbrev St (p M : ℕ) : Type := Bool × ZMod p × ZMod p × Fin (M + 1) × Fin (M + 1)

section Machine

variable (p M : ℕ) [NeZero p] (f : ℕ → Bool)

def stOf (v i : ℕ) : St p M :=
  (false, (v : ZMod p), ((2 ^ i : ℕ) : ZMod p), ⟨min v M, by omega⟩, ⟨min (2 ^ i) M, by omega⟩)

def upd (s : St p M) (b : Bool) : St p M :=
  (false, s.2.1 + (b.toNat : ZMod p) * s.2.2.1, 2 * s.2.2.1,
    ⟨min (s.2.2.2.1.val + b.toNat * s.2.2.2.2.val) M, by omega⟩,
    ⟨min (2 * s.2.2.2.2.val) M, by omega⟩)

def ans (s : St p M) : Bool :=
  if s.2.2.2.1.val < M then f s.2.2.2.1.val else f (M + s.2.1.val)

def popF (s : St p M) : Option Bool → St p M
  | none => (true, s.2)
  | some b => upd p M s b

/-- MUTANT: no `load` before `halt`. -/
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
            (push () (ans p M f) halt)
            (goto (fun _ => ())))

def cfg (l : Option Unit) (s : St p M) (stk : List Bool) : (mach p M f).Cfg :=
  TM2.Cfg.mk l s (fun _ => stk)

theorem step_cons (s : St p M) (b : Bool) (l : List Bool) :
    (mach p M f).step (cfg p M f (some ()) s (b :: l)) =
      some (cfg p M f (some ()) (upd p M s b) l) := rfl

-- The claim the halting configuration is `haltList`-shaped. Expected to be REJECTED.
theorem step_nil (s : St p M) :
    (mach p M f).step (cfg p M f (some ()) s []) =
      some (cfg p M f none (stOf p M 0 0) [ans p M f (true, s.2)]) := rfl

-- What is actually true of the mutant: the state is left as `(true, s.2)`.
theorem step_nil_true (s : St p M) :
    (mach p M f).step (cfg p M f (some ()) s []) =
      some (cfg p M f none (true, s.2) [ans p M f (true, s.2)]) := rfl

-- And `(true, s.2)` is never the initial state, so no run of the mutant ends in a
-- `haltList` configuration at all: `haltList` pins `var := initialState`, whose first
-- component is `false`.
theorem never_haltList (s : St p M) (out : List Bool) :
    cfg p M f none (true, s.2) out ≠ haltList (mach p M f) out := by
  intro h
  have := congrArg (fun c : (mach p M f).Cfg => c.var.1) h
  exact Bool.noConfusion this

end Machine

end Talus8Mutant
