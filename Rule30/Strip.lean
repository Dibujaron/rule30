/-
# Strips of columns

A *strip* is a finite block of adjacent columns of the space-time diagram,
read at one time step. The point of the definition is that a strip is a
**finite-state machine driven by its two boundary cells**: the next state of
the strip depends only on its current state and the two cells just outside
it, one on each side. So if both boundary columns eventually repeat, the
strip is a finite machine fed a repeating input, and it must eventually
repeat too — which is the engine of Jen's theorem that no two columns of
rule 30 can both become periodic.

In TypeScript terms `strip i w t` is a fixed-length `boolean[]` of length
`w + 1` snapshotting columns `i .. i + w` at time `t`, and `stripStep` is the
pure reducer that takes one snapshot plus the two out-of-bounds neighbours
and returns the next snapshot. `Fin (w + 1)` is the index type: a natural
number that carries the proof it is below `w + 1`, so an out-of-bounds read
is unwritable rather than a runtime error.
-/
import Rule30.Basic

/-- The strip of `w + 1` columns starting at column `i`, read at time `t`:
index `k` holds the cell at column `i + k`. -/
def strip (i : ℤ) (w : ℕ) (t : ℕ) : Fin (w + 1) → Bool :=
  fun k => evolve t (i + k)

/-- One step of rule 30 on a strip of width `w + 1`, given the cell just left
of the strip (`a`) and the cell just right of it (`c`). Interior cells read
their neighbours from the strip; the two end cells read one neighbour from
the strip and the other from `a` or `c`.

The `if h : ... then ... else ...` form is a dependent `if`: inside the
`else` branch the hypothesis `h` is available, and `by omega` uses it to
prove the shifted index is still in bounds. -/
def stripStep (w : ℕ) (a c : Bool) (s : Fin (w + 1) → Bool) : Fin (w + 1) → Bool :=
  fun k =>
    let left : Bool := if h : k.val = 0 then a else s ⟨k.val - 1, by omega⟩
    let right : Bool := if h : k.val = w then c else s ⟨k.val + 1, by omega⟩
    xor left (s k || right)
