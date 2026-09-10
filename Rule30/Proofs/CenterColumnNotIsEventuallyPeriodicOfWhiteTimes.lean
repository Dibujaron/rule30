import Rule30.Basic
import Rule30.Proofs.NotIsEventuallyPeriodicAdjacent
import Rule30.Proofs.CenterColumnSuccOfBlack
import Rule30.Proofs.ColumnOneOfWhite

/-!
**What this says.** If, for every hypothetical repeat period of the centre
column, column 1 would also repeat at every white centre time, then the
centre column never repeats at all.
**Why it is true.** Under that hypothesis, column -1 repeats too: at a black
time `centerColumn_succ_of_black` pins the next centre cell to the negation
of column -1, so the shared centre-column repeat forces column -1 to repeat
there; at a white time `column_one_of_white` reads column 1 as the xor of
the next centre cell and column -1, so the hypothesis forces column -1 to
repeat there as well. Columns -1 and 0 both repeating contradicts
`not_isEventuallyPeriodic_adjacent`.
**Where the work is.** Column -1's black-time case: two applications of
`centerColumn_succ_of_black` turn the shared centre value one step later
into `!evolve _ (-1) = !evolve _ (-1)`, and `Bool.not_inj` strips the `!`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.centerColumn_not_isEventuallyPeriodic_of_white_times
  (h :
    ∀ p > 0,
      ∀ (N : ℕ),
        (∀ t ≥ N, centerColumn (t + p) = centerColumn t) →
          ∀ t ≥ N, centerColumn t = false → evolve (t + p) 1 = evolve t 1) :
  ¬IsEventuallyPeriodic centerColumn
```
-/

theorem centerColumn_not_isEventuallyPeriodic_of_white_times
    (h : ∀ p > 0, ∀ N : ℕ, (∀ t ≥ N, centerColumn (t + p) = centerColumn t) →
        ∀ t ≥ N, centerColumn t = false → evolve (t + p) 1 = evolve t 1) :
    ¬ IsEventuallyPeriodic centerColumn := by
  rintro ⟨p, hp, N, hN⟩
  have h1 := h p hp N hN
  refine not_isEventuallyPeriodic_adjacent (-1) ⟨⟨p, hp, N, ?_⟩, ⟨p, hp, N, ?_⟩⟩
  · intro n hn
    show evolve (n + p) (-1) = evolve n (-1)
    have e : centerColumn (n + p + 1) = centerColumn (n + 1) := by
      rw [show n + p + 1 = n + 1 + p by omega]; exact hN (n + 1) (by omega)
    cases hc : centerColumn n with
    | true =>
        have hcp : centerColumn (n + p) = true := by rw [hN n hn, hc]
        have a := centerColumn_succ_of_black n hc
        have b := centerColumn_succ_of_black (n + p) hcp
        rw [a, b] at e
        exact (Bool.not_inj e)
    | false =>
        have hcp : centerColumn (n + p) = false := by rw [hN n hn, hc]
        have a : evolve n 1 = xor (centerColumn (n + 1)) (evolve n (-1)) :=
          column_one_of_white initialConfig n hc
        have b : evolve (n + p) 1 = xor (centerColumn (n + p + 1)) (evolve (n + p) (-1)) :=
          column_one_of_white initialConfig (n + p) hcp
        rw [e, h1 n hn hc, a] at b
        revert b
        cases centerColumn (n + 1) <;> cases evolve n (-1) <;> cases evolve (n + p) (-1) <;> simp
  · intro n hn
    show evolve (n + p) ((-1 : ℤ) + 1) = evolve n ((-1 : ℤ) + 1)
    rw [show (-1 : ℤ) + 1 = 0 by omega]
    exact hN n hn
