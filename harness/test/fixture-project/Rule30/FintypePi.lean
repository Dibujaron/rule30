/-
# Deciding a `∀` over `Bool → Bool`, Mathlib-free

`seed_test`'s route calibration checks that `revert f; decide` closes
`bool_map_iterate_three` only when an import supplies the `Decidable`
instance for `∀ f : Bool → Bool, …`. In the real project that import is
`Mathlib.Data.Fintype.Pi`; this module plays its part here. It is
deliberately NOT imported by `Rule30.Basic`, so that the calibration's
"correct tactics, missing import" case still fails.
-/
import Rule30.Basic

/-- Two functions on `Bool` agree when they agree at both points. -/
theorem Bool.funext_iff (f g : Bool → Bool) :
    f = g ↔ f false = g false ∧ f true = g true := by
  constructor
  · intro h; subst h; exact ⟨rfl, rfl⟩
  · intro ⟨h0, h1⟩; funext b; cases b <;> assumption

instance : DecidableEq (Bool → Bool) := fun f g =>
  decidable_of_iff _ (Bool.funext_iff f g).symm

/-- There are four functions `Bool → Bool`, so a `∀` over them is four cases. -/
theorem Bool.forall_fun_iff (p : (Bool → Bool) → Prop) :
    (∀ f : Bool → Bool, p f) ↔
      p (fun _ => false) ∧ p (fun _ => true) ∧ p id ∧ p not := by
  constructor
  · intro h; exact ⟨h _, h _, h _, h _⟩
  · intro ⟨h00, h11, hid, hnot⟩ f
    cases hf : f false <;> cases ht : f true
    · have : f = fun _ => false := by funext b; cases b <;> assumption
      exact this ▸ h00
    · have : f = id := by funext b; cases b <;> assumption
      exact this ▸ hid
    · have : f = not := by funext b; cases b <;> assumption
      exact this ▸ hnot
    · have : f = fun _ => true := by funext b; cases b <;> assumption
      exact this ▸ h11

instance {p : (Bool → Bool) → Prop} [DecidablePred p] :
    Decidable (∀ f : Bool → Bool, p f) :=
  decidable_of_iff _ (Bool.forall_fun_iff p).symm
