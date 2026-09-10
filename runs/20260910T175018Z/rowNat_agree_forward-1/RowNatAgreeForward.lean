import Rule30.Basic
import Rule30.Proofs.RowNatModEqIterate

/-!
**What this says.** Agreement on low bits of rows never degrades: if rows T and T+p match on
their low n bits, then rows t and t+p do as well for every t ≥ T.
**Why it is true.** Rows are iterates of the step function, so equality at one step implies
equality at all future steps: iteration preserves equality of starting points.
**Where the work is.** Induction on t, with the key that rowNat's recurrence determines future
values uniquely from the current value.
-/

theorem rowNat_agree_forward (n T p t : ℕ) (hTt : T ≤ t)
    (h : rowNat T % 2 ^ n = rowNat (T + p) % 2 ^ n) :
    rowNat t % 2 ^ n = rowNat (t + p) % 2 ^ n := by
  induction t, hTt using Nat.le_induction with
  | base => exact h
  | succ t _ ih =>
    show rowNat (t + 1) % 2 ^ n = rowNat (t + 1 + p) % 2 ^ n
    rw [show t + 1 + p = (t + p) + 1 by omega]
    -- rowStep preserves modular agreement: if x ≡ y (mod 2^n), then rowStep x ≡ rowStep y (mod 2^n)
    have : (rowStep (rowNat t)) % 2 ^ n = (rowStep (rowNat (t + p))) % 2 ^ n := by
      have eq : rowNat t % 2^n = rowNat (t + p) % 2^n := ih
      omega
    exact this
