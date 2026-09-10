/-
Astrolabe, 2026-09-10, scratch. NOT a proof of anything: an elaboration check.

Question: can Mathlib *today* state Rule 30 Prize 3 as a uniform, step-counted
lower bound with `n` in binary, with no opaque predicate anywhere?

Answer this file is testing: yes, via `Turing.TM2ComputableInTime` (whose
`time : ℕ → ℕ` is applied to the *length of the encoded input*) together with
`Computability.encodeNat` (which is binary, little-endian).
-/
import Mathlib.Computability.TuringMachine.Computable
import Mathlib.Computability.Encoding
import Rule30.Basic

open Computability Turing

/-- Sanity: `encodeNat` is binary, so the encoding of `n` has about `log₂ n` bits.
`13 = 0b1101`, little-endian `[true, false, true, true]`, length 4. -/
example : (encodeNat 13).length = 4 := by decide

/-- Sanity: the unary encoding of `13` has length `13`. This one line is the
whole of trap (2): the same English sentence indexes two different statements. -/
example : (unaryEncodeNat 13).length = 13 := by decide

/-- **P3, binary encoding, step-counted, no opaque predicate.**

For every two-stack Turing machine that computes the centre column, with `n`
handed to it in binary, the machine's running time on inputs of length `m` is
at least `2 ^ m / k` for some `k > 0` — that is, at least linear in the *value*
`n`, which is Wolfram's `O(n)`.

Quantifying over `h` quantifies over every halting machine together with a
valid time bound for it; a machine that ran in `o(n)` would supply an `h`
whose `time` violated this, so this is exactly "no machine is that fast". -/
def P3Binary : Prop :=
  ∀ h : TM2ComputableInTime encodeNat encodeBool centerColumn,
    ∃ k > 0, ∃ M, ∀ m ≥ M, 2 ^ m ≤ k * h.time m

/-- **The same sentence with `n` in unary**, to show the trap is real and not a
worry. Here the input length *is* `n`, so "at least linear in the value" reads
`m ≤ k * time m`, and it is true of every machine that so much as scans its
input — indeed true with `k = 1` of any machine whose time bound is the
identity or larger. -/
def P3Unary : Prop :=
  ∀ h : TM2ComputableInTime unaryEncodeNat encodeBool centerColumn,
    ∃ k > 0, ∃ M, ∀ m ≥ M, m ≤ k * h.time m

/-- And the unary version is *not* merely weaker in spirit: transporting the
binary statement's arithmetic to unary would demand `2 ^ m ≤ k * time m` with
`m = n`, i.e. exponential time in the value. So the encoding does not shift the
statement by a constant; it moves it by an exponential in either direction. -/
def P3UnaryTransported : Prop :=
  ∀ h : TM2ComputableInTime unaryEncodeNat encodeBool centerColumn,
    ∃ k > 0, ∃ M, ∀ m ≥ M, 2 ^ m ≤ k * h.time m

/-- The universe seam. `Rule30/Prize.lean` declares `CostModel.Program : Type`,
and Mathlib's machines do not fit: `FinTM2` quantifies over an alphabet family
`Γ : K → Type`, so the bundle lives one universe up. Writing `Type` here is the
error this file was run to find; `Type 1` is the fix, and it is one character. -/
def tm2Programs : Type 1 := TM2ComputableInTime encodeNat encodeBool centerColumn

-- Confirmation that `Type` is genuinely too small: uncommenting the next line
-- gives "failed to solve universe constraint 1 =?= 2".
-- def tm2ProgramsTooSmall : Type := TM2ComputableInTime encodeNat encodeBool centerColumn

#check (TM2ComputableInTime encodeNat encodeBool centerColumn)
#print axioms P3Binary
