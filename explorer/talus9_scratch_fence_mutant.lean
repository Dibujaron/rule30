/-
Talus, 2026-09-12.  Mutant beside `talus9_scratch_fence.lean`.

`pushes` collects, at every `push k f q` node, the whole range of `f : σ → Γ k`.
The plausible-looking economy is to collect nothing there -- after all, the
symbol pushed is "just some value of the state".  This file is that economy, and
nothing else is changed.

THIS FILE IS EXPECTED TO FAIL, and to fail in one exact place.  `lake env lean`
exits 1 with

  talus9_scratch_fence_mutant.lean:70:30: error: Application type mismatch: ...
  but is expected to have type
    ⟨k, f v⟩ ∈ pushes (push k f q)

-- the `push` case of `stepAux_ok`, where the head of the updated stack is `f v`
and nothing puts it in `A`.  Everything else in the file is ACCEPTED, including
the second half, which shows the mutated invariant is not merely unproved but
FALSE: `mutant_invariant_false` prints `[propext, Classical.choice, Quot.sound]`.

Run with `lake env lean explorer/talus9_scratch_fence_mutant.lean`.
-/
import Mathlib.Computability.TuringMachine.Computable
import Mathlib.Tactic

open Turing Turing.TM2 Turing.TM2.Stmt

namespace Talus9FMut

variable {K : Type} [DecidableEq K] {Γ : K → Type} {Λ σ : Type}

/-- THE MUTATION: the `push` case contributes nothing. -/
def pushes : Stmt Γ Λ σ → Set ((k : K) × Γ k)
  | push _ _ q => pushes q
  | peek _ _ q => pushes q
  | pop _ _ q => pushes q
  | load _ q => pushes q
  | branch _ q₁ q₂ => pushes q₁ ∪ pushes q₂
  | goto _ => ∅
  | halt => ∅

def StkOk (A : Set ((k : K) × Γ k)) (S : ∀ k, List (Γ k)) : Prop :=
  ∀ k, ∀ x ∈ S k, (⟨k, x⟩ : (k : K) × Γ k) ∈ A

theorem StkOk_push {A : Set ((k : K) × Γ k)} {S : ∀ k, List (Γ k)} (h : StkOk A S)
    {k : K} {x : Γ k} (hx : (⟨k, x⟩ : (k : K) × Γ k) ∈ A) :
    StkOk A (Function.update S k (x :: S k)) := by
  intro k' y hy
  by_cases hk : k' = k
  · subst hk
    rw [Function.update_self] at hy
    rcases List.mem_cons.1 hy with rfl | hy
    · exact hx
    · exact h _ _ hy
  · rw [Function.update_of_ne hk] at hy
    exact h _ _ hy

theorem StkOk_tail {A : Set ((k : K) × Γ k)} {S : ∀ k, List (Γ k)} (h : StkOk A S) (k : K) :
    StkOk A (Function.update S k (S k).tail) := by
  intro k' y hy
  by_cases hk : k' = k
  · subst hk
    rw [Function.update_self] at hy
    exact h _ _ (List.mem_of_mem_tail hy)
  · rw [Function.update_of_ne hk] at hy
    exact h _ _ hy

/-- This is the theorem that must fail, and its `push` case is where. -/
theorem stepAux_ok (A : Set ((k : K) × Γ k)) :
    ∀ (q : Stmt Γ Λ σ), pushes q ⊆ A → ∀ (v : σ) (S : ∀ k, List (Γ k)),
      StkOk A S → StkOk A (stepAux q v S).stk := by
  intro q
  induction q with
  | push k f q ih =>
    intro hsub v S hS
    refine ih (fun z hz => hsub hz) _ _ ?_
    exact StkOk_push hS (hsub (Or.inl ⟨v, rfl⟩))
  | peek k f q ih => intro hsub v S hS; exact ih hsub _ _ hS
  | pop k f q ih => intro hsub v S hS; exact ih hsub _ _ (StkOk_tail hS k)
  | load a q ih => intro hsub v S hS; exact ih hsub _ _ hS
  | branch p q₁ q₂ ih₁ ih₂ =>
    intro hsub v S hS
    have h1 : pushes q₁ ⊆ A := fun z hz => hsub (Or.inl hz)
    have h2 : pushes q₂ ⊆ A := fun z hz => hsub (Or.inr hz)
    show StkOk A (cond (p v) (stepAux q₁ v S) (stepAux q₂ v S)).stk
    cases hp : p v
    · simpa using ih₂ h2 _ _ hS
    · simpa using ih₁ h1 _ _ hS
  | goto l => intro _ v S hS; exact hS
  | halt => intro _ v S hS; exact hS

/-! ## The mutated invariant is not merely unproved: it is false.

A rejected theorem shows only that one proof did not go through.  Everything
below is ACCEPTED, and exhibits a two-stack machine that puts a symbol on its
work stack which the mutated alphabet does not contain.  Comment out
`stepAux_ok` above and this section still compiles. -/

def alphabetMut (tm : FinTM2) : Set ((k : tm.K) × tm.Γ k) :=
  (⋃ l : tm.Λ, pushes (tm.m l)) ∪
    Set.range (fun x : tm.Γ tm.k₀ => (⟨tm.k₀, x⟩ : (k : tm.K) × tm.Γ k))

/-- Two stacks, `false` the input and output, `true` a work stack.  One step
pushes a black symbol onto the work stack and halts. -/
def tmEx : FinTM2 where
  K := Bool
  k₀ := false
  k₁ := false
  Γ _ := Bool
  Λ := Unit
  main := ()
  σ := Unit
  initialState := ()
  m _ := push true (fun _ => true) halt

theorem work_stack_after_one_step :
    (stepAux (tmEx.m ()) () (initList tmEx []).stk).stk true = [true] := rfl

theorem mutant_invariant_false :
    tmEx.step (initList tmEx []) = some (stepAux (tmEx.m ()) () (initList tmEx []).stk) ∧
      ¬ StkOk (alphabetMut tmEx) (stepAux (tmEx.m ()) () (initList tmEx []).stk).stk := by
  refine ⟨rfl, ?_⟩
  intro h
  have hmem : (true : Bool) ∈ (stepAux (tmEx.m ()) () (initList tmEx []).stk).stk true :=
    List.mem_singleton_self true
  rcases h true true hmem with h1 | h2
  · -- the mutated `pushes` of the program is empty
    simp only [Set.mem_iUnion] at h1
    obtain ⟨_, hl⟩ := h1
    exact hl
  · -- and the input alphabet sits on stack `false`, not on stack `true`
    obtain ⟨x, hx⟩ := h2
    have hfst : (false : Bool) = true := congrArg Sigma.fst hx
    exact Bool.false_ne_true hfst

#print axioms mutant_invariant_false

end Talus9FMut
