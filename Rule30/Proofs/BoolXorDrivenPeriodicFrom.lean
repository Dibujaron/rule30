import Rule30.Basic

/-!
**What this says.** A one-bit machine that XORs a repeating input into its running state
itself repeats, with twice the input's period, from the very point the input's period starts.
**Why it is true.** XOR-ing in a whole block of `p` inputs is its own inverse, so the change
picked up between times `i` and `i+p` exactly cancels the identical change picked up between
`i+p` and `i+2p`, once those two blocks read the same inputs.
**Where the work is.** Writing "the change over n steps" as an explicit fold over `c`, then
showing that fold is unchanged when shifted by one whole period of `c`.

**Checked type** (written by the harness after `lake build` and the `type_of%` check passed, not by the worker):
```lean
Statements.bool_xor_driven_periodicFrom (c x : ℕ → Bool) (p N : ℕ) (hrec : ∀ (i : ℕ), x (i + 1) = (x i ^^ c i))
  (hc : PeriodicFrom c p N) : PeriodicFrom x (2 * p) N
```
-/

private lemma xor_assoc' (a b c : Bool) : xor (xor a b) c = xor a (xor b c) := by
  cases a <;> cases b <;> cases c <;> rfl

private lemma xor_self' (a : Bool) : xor a a = false := by
  cases a <;> rfl

private lemma xor_false' (a : Bool) : xor a false = a := by
  cases a <;> rfl

/-- The cumulative XOR of `c` over the `n` indices starting at `i`. -/
private def blockXor (c : ℕ → Bool) (i : ℕ) : ℕ → Bool
  | 0 => false
  | n + 1 => xor (blockXor c i n) (c (i + n))

private lemma walk (c x : ℕ → Bool) (hrec : ∀ i, x (i + 1) = xor (x i) (c i)) :
    ∀ i n, x (i + n) = xor (x i) (blockXor c i n) := by
  intro i n
  induction n with
  | zero => exact (xor_false' (x i)).symm
  | succ n ih =>
      have hstep : x (i + n + 1) = xor (x (i + n)) (c (i + n)) := hrec (i + n)
      calc x (i + (n + 1)) = x (i + n + 1) := rfl
        _ = xor (x (i + n)) (c (i + n)) := hstep
        _ = xor (xor (x i) (blockXor c i n)) (c (i + n)) := by rw [ih]
        _ = xor (x i) (xor (blockXor c i n) (c (i + n))) := xor_assoc' _ _ _
        _ = xor (x i) (blockXor c i (n + 1)) := rfl

private lemma blockXor_shift (c : ℕ → Bool) (p N i : ℕ) (hi : i ≥ N)
    (hc : PeriodicFrom c p N) :
    ∀ n, blockXor c (i + p) n = blockXor c i n := by
  intro n
  induction n with
  | zero => rfl
  | succ n ih =>
      show xor (blockXor c (i + p) n) (c (i + p + n)) = xor (blockXor c i n) (c (i + n))
      rw [ih]
      have hcn : c (i + n + p) = c (i + n) := hc (i + n) (by omega)
      rw [show i + p + n = i + n + p from by omega, hcn]

theorem bool_xor_driven_periodicFrom (c x : ℕ → Bool) (p N : ℕ)
    (hrec : ∀ i, x (i + 1) = xor (x i) (c i)) (hc : PeriodicFrom c p N) :
    PeriodicFrom x (2 * p) N := by
  intro n hn
  have h1 : x (n + p) = xor (x n) (blockXor c n p) := walk c x hrec n p
  have h2 : x (n + p + p) = xor (x (n + p)) (blockXor c (n + p) p) := walk c x hrec (n + p) p
  have hshift : blockXor c (n + p) p = blockXor c n p := blockXor_shift c p N n hn hc p
  rw [hshift, h1] at h2
  have heq : n + 2 * p = n + p + p := by omega
  rw [heq, h2, xor_assoc', xor_self', xor_false']
