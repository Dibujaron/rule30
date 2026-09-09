import Rule30.Basic
import Rule30.Proofs.Rule30Translate

/-!
**What this says.** One step applied to a shifted config equals stepping first then reading shifted: spatial translations commute with the evolution.

**Why it is true.** Induction on steps: the base case is by definition (both sides are the initial config), and each step applies rule30_translate to a row that already satisfies the inductive hypothesis.

**Where the work is.** None—it is rule30_translate's own content, lifted through the evolution by structural induction.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.evolveFrom_translate (c : Config) (s : ℤ) (t : ℕ) (i : ℤ) :
  evolveFrom (fun x => c (x + s)) t i = evolveFrom c t (i + s)
```
-/

theorem evolveFrom_translate (c : Config) (s : ℤ) (t : ℕ) (i : ℤ) :
    evolveFrom (fun x => c (x + s)) t i = evolveFrom c t (i + s) := by
  induction t generalizing i with
  | zero => rfl
  | succ t ih =>
    simp only [evolveFrom_succ]
    have config_eq : evolveFrom (fun x => c (x + s)) t = fun x => evolveFrom c t (x + s) := by
      funext x
      exact ih x
    rw [config_eq]
    exact rule30_translate (evolveFrom c t) s i
