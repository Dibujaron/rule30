import Rule30.Basic

/-!
Sextant, 2026-09-12.  The demonstration that `sextant9_scratch_reach.lean`'s
K2 can fail: the same statement with `11101` replaced by `11011`, which IS a
one-step image of a finite configuration (of `101` at positions `1 … 3`, see
that file's `k3_prefix_control`).  Lean must REJECT this file, at the `decide`
on `mutant_k2`.  If it ever compiles, the K2 check is vacuous and the attack
document's non-edge witness is worthless.
-/

namespace SextantNineMutant

set_option maxRecDepth 40000

def cfgAt (off : ℤ) (l : List Bool) : Config :=
  fun i => if off ≤ i ∧ i < off + (l.length : ℤ) then l.getD (i - off).toNat false else false

def cfgBits (off : ℤ) (w m : Nat) : Config :=
  cfgAt off ((List.range w).map (fun j => m.testBit j))

/-- `11011` at positions `-4 … 8`, i.e. the target of K2 with cell 3 flipped. -/
def targetMutant : List Bool :=
  [false, false, false, false, true, true, false, true, true, false, false, false, false]

theorem mutant_k2 :
    ∀ m : Fin 2048,
      ((List.range 13).any
        (fun k => rule30 (cfgBits (-3) 11 m.val) ((k : ℤ) - 4)
                    != targetMutant.getD k false)) = true := by
  decide

end SextantNineMutant
