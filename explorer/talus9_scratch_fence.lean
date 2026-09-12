/-
Talus, 2026-09-12.  The work-stack-alphabet fence.

THE HAZARD.  Mathlib's `FinTM2` (Computability/TuringMachine/Computable.lean,
lines 46-71) carries `Fintype` on the stack index `K`, the labels `Λ`, the
internal state `σ` and the INPUT alphabet `Γ k₀` -- and on nothing else.  So
`Γ k` for a work stack may be any type at all, `ℕ` included; and the pop handler
`f : σ → Option (Γ k) → σ` is an arbitrary Lean function of the popped symbol,
so it need not be computable.  If that were a real channel, a machine could
carry an oracle and `P3Core` would be FALSE for a stupid reason, exactly as it
is over `Turing.TM0` -- which `docs/prize.md` records in those terms.

THE FENCE.  It is not a real channel.  The symbols a `FinTM2` can ever have on
any stack lie in a FINITE set fixed by the program before the input is read:
`push k f q` pushes `f v` with `f : σ → Γ k` and `σ` finite, the program is a
finite family (`Λ` finite) of finite syntax trees, and `initList` puts symbols
only on `k₀`, whose alphabet is finite by hypothesis.  So a pop handler is only
ever applied to finitely many arguments, all of them determined by the program,
and it is a lookup table however it was written.

WHAT THIS DOES NOT PROVE: that every `FinTM2` is equivalent to one with all
alphabets finite.  That is a simulation (quotient each `Γ k`, carry the machine
across, check the step relation); it is routine and it is not here.

Run with `lake env lean explorer/talus9_scratch_fence.lean`.
-/
import Mathlib.Computability.TuringMachine.Computable
import Mathlib.Tactic

open Turing Turing.TM2 Turing.TM2.Stmt

namespace Talus9F

section Syntax

variable {K : Type} [DecidableEq K] {Γ : K → Type} {Λ σ : Type}

/-- The `(stack, symbol)` pairs a statement can push.  Collected as **dependent
pairs**: gathering them into `∀ k, Set (Γ k)` instead forces a transport at every
`push` node and the induction then fights `Eq.mpr` rather than doing mathematics. -/
def pushes : Stmt Γ Λ σ → Set ((k : K) × Γ k)
  | push k f q => Set.range (fun v => (⟨k, f v⟩ : (k : K) × Γ k)) ∪ pushes q
  | peek _ _ q => pushes q
  | pop _ _ q => pushes q
  | load _ q => pushes q
  | branch _ q₁ q₂ => pushes q₁ ∪ pushes q₂
  | goto _ => ∅
  | halt => ∅

/-- Finitely many, because `σ` is finite and a statement is a finite tree. -/
theorem pushes_finite [Finite σ] (q : Stmt Γ Λ σ) : (pushes q).Finite := by
  induction q with
  | push k f q ih => exact (Set.finite_range _).union ih
  | peek _ _ q ih => exact ih
  | pop _ _ q ih => exact ih
  | load _ q ih => exact ih
  | branch _ q₁ q₂ ih₁ ih₂ => exact ih₁.union ih₂
  | goto _ => exact Set.finite_empty
  | halt => exact Set.finite_empty

/-- Every symbol on every stack lies in `A`. -/
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

/-- **One step keeps the stacks inside `A`**, provided `A` contains everything the
statement can push. -/
theorem stepAux_ok (A : Set ((k : K) × Γ k)) :
    ∀ (q : Stmt Γ Λ σ), pushes q ⊆ A → ∀ (v : σ) (S : ∀ k, List (Γ k)),
      StkOk A S → StkOk A (stepAux q v S).stk := by
  intro q
  induction q with
  | push k f q ih =>
    intro hsub v S hS
    refine ih (fun z hz => hsub (Or.inr hz)) _ _ ?_
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

end Syntax

/-! ## The machine-level statement -/

/-- Every `(stack, symbol)` pair the machine `tm` can ever hold: what its program
can push, together with the input alphabet sitting on the input stack. -/
def alphabet (tm : FinTM2) : Set ((k : tm.K) × tm.Γ k) :=
  (⋃ l : tm.Λ, pushes (tm.m l)) ∪
    Set.range (fun x : tm.Γ tm.k₀ => (⟨tm.k₀, x⟩ : (k : tm.K) × tm.Γ k))

/-- **It is finite**, and it depends on the program alone — not on the input and
not on how long the machine has been running. -/
theorem stackAlphabet_finite (tm : FinTM2) : (alphabet tm).Finite := by
  haveI := tm.ΛFin
  haveI := tm.σFin
  haveI := tm.Γk₀Fin
  exact (Set.finite_iUnion fun l => pushes_finite (tm.m l)).union (Set.finite_range _)

theorem initList_ok (tm : FinTM2) (l : List (tm.Γ tm.k₀)) :
    StkOk (alphabet tm) (initList tm l).stk := by
  intro k x hx
  by_cases hk : k = tm.k₀
  · subst hk
    have hstk : (initList tm l).stk tm.k₀ = l := by simp [initList]
    rw [hstk] at hx
    exact Or.inr ⟨x, rfl⟩
  · exfalso
    have hstk : (initList tm l).stk k = [] := by simp [initList, hk]
    rw [hstk] at hx
    exact List.not_mem_nil hx

/-- **THE FENCE.**  Every configuration reachable from `initList tm l`, for every
input `l` and every number of steps, has every stack's contents inside the finite
set `alphabet tm`. -/
theorem reachable_stack_mem (tm : FinTM2) (l : List (tm.Γ tm.k₀)) :
    ∀ (n : ℕ) (c : tm.Cfg),
      (flip bind tm.step)^[n] (some (initList tm l)) = some c → StkOk (alphabet tm) c.stk := by
  have hsub : ∀ lab : tm.Λ, pushes (tm.m lab) ⊆ alphabet tm := by
    intro lab z hz
    exact Or.inl (Set.mem_iUnion.2 ⟨lab, hz⟩)
  -- one step preserves the invariant, whichever branch the program takes
  have step_ok : ∀ c₀ c₁ : tm.Cfg, tm.step c₀ = some c₁ →
      StkOk (alphabet tm) c₀.stk → StkOk (alphabet tm) c₁.stk := by
    rintro ⟨lab, v, S⟩ c₁ hs h₀
    cases lab with
    | none =>
      exfalso
      rw [show tm.step (TM2.Cfg.mk (none : Option tm.Λ) v S) = none from rfl] at hs
      simp at hs
    | some lab =>
      have he : tm.step (TM2.Cfg.mk (some lab) v S) = some (stepAux (tm.m lab) v S) := rfl
      rw [he] at hs
      have : c₁ = stepAux (tm.m lab) v S := (Option.some.inj hs).symm
      subst this
      exact stepAux_ok (alphabet tm) (tm.m lab) (hsub lab) v S h₀
  -- a general statement about any start, then specialised to `initList`
  suffices H : ∀ (n : ℕ) (c₀ : tm.Cfg), StkOk (alphabet tm) c₀.stk →
      ∀ c : tm.Cfg, (flip bind tm.step)^[n] (some c₀) = some c →
        StkOk (alphabet tm) c.stk from
    fun n c hc => H n _ (initList_ok tm l) c hc
  intro n
  induction n with
  | zero =>
    intro c₀ h₀ c hc
    simp only [Function.iterate_zero, id_eq, Option.some.injEq] at hc
    subst hc
    exact h₀
  | succ n ih =>
    intro c₀ h₀ c hc
    rw [Function.iterate_succ_apply,
      show flip bind tm.step (some c₀) = tm.step c₀ from rfl] at hc
    rcases hs : tm.step c₀ with _ | c₁
    · rw [hs, Function.iterate_fixed rfl n] at hc
      exact absurd hc (by simp)
    · rw [hs] at hc
      exact ih c₁ (step_ok c₀ c₁ hs h₀) c hc

/-- **The corollary that names the hazard.**  A pop or peek handler
`f : σ → Option (Γ k) → σ` is an arbitrary Lean function of the popped symbol, so
if an unbounded symbol could reach it the machine would carry an oracle.  It
cannot: everything ever handed to `f` lies in a fixed finite set, so `f` is a
lookup table however it was written. -/
theorem pop_sees_finitely_many (tm : FinTM2) (k : tm.K) :
    ∃ T : Set (Option (tm.Γ k)), T.Finite ∧
      ∀ (l : List (tm.Γ tm.k₀)) (n : ℕ) (c : tm.Cfg),
        (flip bind tm.step)^[n] (some (initList tm l)) = some c → (c.stk k).head? ∈ T := by
  classical
  refine ⟨insert none ((fun x => some x) '' (Sigma.mk k ⁻¹' alphabet tm)), ?_, ?_⟩
  · refine Set.Finite.insert _ (Set.Finite.image _ ?_)
    refine Set.Finite.preimage ?_ (stackAlphabet_finite tm)
    intro a _ b _ hab
    exact eq_of_heq (Sigma.mk.injEq .. ▸ hab).2
  · intro l n c hc
    rcases h : (c.stk k).head? with _ | x
    · exact Set.mem_insert _ _
    · refine Set.mem_insert_of_mem _ ⟨x, ?_, rfl⟩
      exact reachable_stack_mem tm l n c hc k x (List.mem_of_mem_head? h)

#print axioms stackAlphabet_finite
#print axioms reachable_stack_mem
#print axioms pop_sees_finitely_many

end Talus9F
