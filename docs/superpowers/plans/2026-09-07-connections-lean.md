# Connections, Lean pieces — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the board a general-configuration vocabulary and a kernel-computable row model, seed the two tiers under them, and record the first obstruction, so that theorist sessions have the right blocks to look at.

**Architecture:** Definitions and bridging lemmas go into `Rule30/Basic.lean`; every theorem with content becomes a `sorry` statement in `Rule30/Statements.lean` and a node in `blueprint/dag.json`, and is proved by a dispatched prover under the existing harness, never by the executor of this plan. The executor's tests are `lake build` of the touched modules, kernel `decide` checks on small cases, and `gleam run -- status` and `gleam run -- seed check` on the board.

**Tech Stack:** Lean 4 `v4.33.1` with Mathlib at the commit pinned in `lakefile.lean`; the Gleam harness under `harness/`; Node for the board scripts.

**Spec:** `docs/superpowers/specs/2026-09-07-connections-design.md`, pieces 1, 2 and the obstructions half of piece 3. Piece 4 and the index renderer are Keel's plan.

## Global Constraints

- `autoImplicit` is `false` project-wide: every type variable is declared.
- Mathlib naming: theorems `snake_case`, data-returning definitions `lowerCamelCase`, types and `Prop`s `UpperCamelCase`.
- `sorry` may appear only in `Rule30/Prize.lean` and `Rule30/Statements.lean`. Never in `Rule30/Basic.lean`, never in `Rule30/Proofs/`.
- Nothing in `Rule30/Basic.lean` is renamed and nothing existing changes its type; every existing proof under `Rule30/Proofs/` must still build after every task.
- Allowed axioms for any proof: `propext`, `Classical.choice`, `Quot.sound`. `native_decide` is forbidden; that is the whole point of the row model.
- Every doc comment in `Rule30/Basic.lean` is written for Dib, who writes TypeScript and is learning Lean: name the Lean thing, then anchor it, and say where the anchor breaks.
- Statements land in `Rule30/Statements.lean` as `theorem <lean_name> ... := by\n  sorry` with `sorry` on its own line; the harness compares bytes.
- `blueprint/dag.json` is one line on disk; every script that writes it serialises with `JSON.stringify(dag) + '\n'`.
- No run may be in flight while `Rule30/Basic.lean` or `Rule30/Statements.lean` is edited: check `tasklist | grep -i gleam` is empty and `ls STOP` fails before every edit.
- Commit messages end with the project trailer:
  `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and
  `Claude-Session: https://claude.ai/code/session_01GPnQpLsEzqhJdDSTmePJ8q`.

---

## File structure

| File | Responsibility | Tasks |
|---|---|---|
| `Rule30/Basic.lean` | definitions and `rfl`-level bridges: `evolveFrom`, `column`, `window`, `ofWindow`, `LeftPermutive`, `blackWindowCount`, `rowNat`, `rowCell`, two bridging lemmas, one small kernel check | 1, 2 |
| `Rule30/Statements.lean` | eight `sorry` statements, one per node, under a new `## Configurations and the row model` heading | 3 |
| `blueprint/dag.json` | eight new nodes with deps, sizes and `object`; `object` on the 51 existing nodes | 3, 5 |
| `docs/obstructions.md` | new; the first entry | 4 |
| `blueprint/crystals.md` | item 20's formula corrected to the orientation that agrees with `evolve` | 2 |
| `runs/<run-id>/` | the dispatch record, committed by the captain after the run | 6 |

---

### Task 1: The vocabulary definitions in `Rule30/Basic.lean`

**Files:**
- Modify: `Rule30/Basic.lean` (append after `evolve_succ`, the last declaration)
- Test: `lake build Rule30.Basic` and `lake build` (whole project)

**Interfaces:**
- Consumes: `Config`, `rule30`, `initialConfig`, `evolve`, `centerColumn` from `Rule30/Basic.lean` as they are.
- Produces, for Task 3's statements: `evolveFrom (c : Config) (t : Nat) : Config`, `column (c : Config) (i : ℤ) (t : Nat) : Bool`, `window (c : Config) (t : Nat) : Fin (2 * t + 1) → Bool`, `ofWindow {t : Nat} (w : Fin (2 * t + 1) → Bool) : Config`, `LeftPermutive (f : Config → Config) (r : Nat) : Prop`, `blackWindowCount (t : Nat) : Nat`, lemmas `evolve_eq_evolveFrom_initial` and `centerColumn_eq_column`.

- [ ] **Step 1: Confirm the checkout is at rest**

Run: `cd C:/Users/dibuj/dev/rule30 && tasklist | grep -i gleam; ls STOP; git status --short`
Expected: no `gleam.exe` line, `ls: cannot access 'STOP'`, and no modified files under `Rule30/`.

- [ ] **Step 2: Write the failing build**

Append to `Rule30/Basic.lean`, after the `evolve_succ` theorem, exactly:

```lean

/-! ## Arbitrary rows

Everything above grows the picture from one black cell. The tools the
literature uses on the columns question — left-permutivity, preimage
counting — are about *any* starting row, so here the same picture is grown
from an arbitrary `c : Config`. `evolve t` is the special case
`evolveFrom initialConfig t`, and the two are equal by definition. -/

/-- The row after `t` steps of rule 30, starting from any row `c`.

The same `f^[t]` iterate as `evolve`, with the starting row a parameter
instead of the fixed `initialConfig`. In TypeScript this is the difference
between `evolve(t)` and `evolveFrom(c, t)` where the first is
`evolveFrom(initialConfig, t)` by definition. -/
def evolveFrom (c : Config) (t : Nat) : Config := rule30^[t] c

/-- Column `i` of the picture grown from `c`: the colour of position `i`
after `t` steps, as a function of `t`. `centerColumn` is `column initialConfig 0`. -/
def column (c : Config) (i : ℤ) (t : Nat) : Bool := evolveFrom c t i

/-- The cells of `c` at positions `-t .. t`, as a function on the finite type
`Fin (2 * t + 1)`: index `k` reads position `k - t`.

The point of a *finite* type is counting. `Fin n → Bool` has `2 ^ n`
inhabitants and Mathlib knows it (`Fintype`), so "all windows of width
`2t + 1`" is `Finset.univ` and can be filtered and counted. A `Config` is
`ℤ → Bool` and has no such thing. -/
def window (c : Config) (t : Nat) : Fin (2 * t + 1) → Bool :=
  fun k => c ((k : ℤ) - (t : ℤ))

/-- A window extended by white cells outside `-t .. t`, back to a full row.
`window (ofWindow w) t = w`, and the picture grown from `ofWindow w` agrees
at the origin for `t` steps with the picture grown from any row whose
window is `w` (that is the cone lemma, `evolveFrom_eq_of_agree_on_window`). -/
def ofWindow {t : Nat} (w : Fin (2 * t + 1) → Bool) : Config :=
  fun i => if h : 0 ≤ i + t ∧ i + t < 2 * t + 1 then w ⟨(i + t).toNat, by omega⟩ else false

/-- `f` is **left-permutive** with radius `r`: two rows that agree at every
position `i - r + 1 .. i + r` and differ at `i - r` are sent to rows that
differ at `i`. Flipping the leftmost cell a step reads always flips its
output, whatever the other cells hold.

This is the property everything about rule 30's columns leans on. For one
step of rule 30 it is `rule30_eq` read as "`xor` with the left neighbour":
`rule30_leftPermutive`. For `t` steps it is `evolveFrom_leftPermutive`, with
radius `t`. -/
def LeftPermutive (f : Config → Config) (r : Nat) : Prop :=
  ∀ (c d : Config) (i : ℤ),
    (∀ j : ℤ, i - r < j → j ≤ i + r → c j = d j) → c (i - r) ≠ d (i - r) → f c i ≠ f d i

/-- How many of the `2 ^ (2t + 1)` windows of width `2t + 1` grow a black
centre cell after `t` steps. `window_count_half` says it is exactly half.

`noncomputable` because Mathlib's `Fintype` instance on functions is built
from a `Finset` of all functions, which the kernel can enumerate but the
compiler will not generate code for; nothing here is meant to run. -/
noncomputable def blackWindowCount (t : Nat) : Nat :=
  (Finset.univ.filter fun w : Fin (2 * t + 1) → Bool =>
    evolveFrom (ofWindow w) t 0 = true).card

/-- The single-seed picture is the general one grown from `initialConfig`. -/
theorem evolve_eq_evolveFrom_initial (t : Nat) :
    evolve t = evolveFrom initialConfig t := rfl

/-- The centre column is column `0` of the single-seed picture. -/
theorem centerColumn_eq_column (t : Nat) :
    centerColumn t = column initialConfig 0 t := rfl
```

and add, next to the two existing imports at the top of the file:

```lean
import Mathlib.Data.Fintype.Card
import Mathlib.Data.Fintype.Pi
import Mathlib.Data.Finset.Card
```

- [ ] **Step 3: Build the module**

Run: `cd C:/Users/dibuj/dev/rule30 && lake build Rule30.Basic 2>&1 | tail -5`
Expected: `Build completed successfully`. If `omega` fails inside `ofWindow`, the hypothesis `h` is not in scope: keep the `if h : ... then ... else` form exactly as written.

- [ ] **Step 4: Build the whole project**

Run: `cd C:/Users/dibuj/dev/rule30 && lake build 2>&1 | tail -3`
Expected: `Build completed successfully` with the same job count as before plus nothing failing under `Rule30/Proofs/`. Every existing proof must still build; if one does not, a name in Task 1 collides with a name in that proof file and must be renamed here, never there.

- [ ] **Step 5: Kernel sanity check, then remove it**

Append temporarily to `Rule30/Basic.lean`:

```lean
example : window (ofWindow (fun _ : Fin 5 => true)) 2 = fun _ => true := by
  funext k; fin_cases k <;> rfl
```

Run: `lake build Rule30.Basic`. Expected: success. Then delete those two lines; they are a check of the definitions, not part of the file.

- [ ] **Step 6: Commit**

```bash
git add Rule30/Basic.lean
git commit -m "Rowan: the general-configuration vocabulary in Basic.lean

evolveFrom, column, window, ofWindow, LeftPermutive, blackWindowCount, and
the two rfl bridges from the single-seed picture. Nothing renamed; every
proof under Rule30/Proofs/ builds unchanged. Piece 1 of the connections
design.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GPnQpLsEzqhJdDSTmePJ8q"
git push origin main
```

---

### Task 2: The row model in `Rule30/Basic.lean`

**Files:**
- Modify: `Rule30/Basic.lean` (append after Task 1's block)
- Modify: `blueprint/crystals.md` (item 20, one formula)
- Test: `lake build Rule30.Basic`; a `decide` check to depth 6 kept in the file; a depth-10 check run once and removed

**Interfaces:**
- Consumes: `evolve` from `Rule30/Basic.lean`.
- Produces, for Task 3: `rowNat : Nat → Nat`, `rowCell (t : Nat) (x : ℤ) : Bool`.

- [ ] **Step 1: Write the definitions**

Append to `Rule30/Basic.lean`:

```lean

/-! ## The row model

A row of the single-seed picture has at most `2t + 1` cells, so it fits in
one natural number, and one step of rule 30 is three big-integer operations.
Lean's kernel evaluates `Nat` arithmetic with built-in bignums, so `decide`
can compute row 5000 in a second where evaluating `evolve` cell by cell
gives out near row 18. `rowCell_eq_evolve` (a node on the board) says the
model and the definition agree; after it, a concrete fact about any row to
depth in the thousands is a theorem by `decide`, with no extra axiom. -/

/-- Row `t` of the single-seed picture as one number: the cell at position
`x` is bit `x + t`, so bit `0` is the left edge and bit `2t` the right edge.

The step is `rule30_eq` on all bits at once. `4 * r` shifts the row two bits
up so that bit `b` of it is the *left* neighbour of position `b - t - 1`;
`2 * r` is the centre; `r` itself is the right neighbour; and
`(4 * r) ^^^ ((2 * r) ||| r)` is `left XOR (centre OR right)`. The explorer's
BigInt engine does the same thing with shifts. -/
def rowNat : Nat → Nat
  | 0 => 1
  | t + 1 => let r := rowNat t; (4 * r) ^^^ ((2 * r) ||| r)

/-- The cell at position `x` of row `t`, read from `rowNat`; white outside
the cone `-t .. t`, where the number has no bit for it. -/
def rowCell (t : Nat) (x : ℤ) : Bool :=
  if -(t : ℤ) ≤ x ∧ x ≤ t then (rowNat t).testBit (x + t).toNat else false

/-- The model agrees with `evolve` on every cell of the first seven rows. A
kernel computation, kept in the file as a guard against the orientation
error that is easy to make here (the mirror image is rule 86 and passes
every symmetric check). The general statement is `rowCell_eq_evolve`. -/
example : ∀ t : Fin 7, ∀ x : Fin 13, rowCell t ((x : ℤ) - 6) = evolve t ((x : ℤ) - 6) := by
  decide
```

- [ ] **Step 2: Build**

Run: `cd C:/Users/dibuj/dev/rule30 && lake build Rule30.Basic 2>&1 | tail -3`
Expected: `Build completed successfully`. If the `example` fails with "decide proved the proposition is false", the orientation is wrong: the step must be `(4 * r) ^^^ ((2 * r) ||| r)` and not `r ^^^ ((2 * r) ||| (4 * r))`.

- [ ] **Step 3: Depth-10 check, once, and the depth-5000 unlock, once**

Run this file with `lake env lean` from the repository root (do not add it to the project):

```lean
import Rule30.Basic
example : ∀ t : Fin 11, ∀ x : Fin 21, rowCell t ((x : ℤ) - 10) = evolve t ((x : ℤ) - 10) := by
  decide
set_option maxRecDepth 100000 in
theorem probe : (rowNat 5000).testBit 0 = true ∧ (rowNat 5000).testBit 10000 = true := by
  decide
#print axioms probe
```

Expected: no error, and `'probe' depends on axioms: [propext]`. Time: about 20 s for the file.

- [ ] **Step 4: Correct crystal 20**

In `blueprint/crystals.md`, item 20 reads
`rowNat (t+1) = rowNat t ^^^ ((2 * rowNat t) ||| (4 * rowNat t))`. Replace that formula with
`rowNat (t+1) = (4 * rowNat t) ^^^ ((2 * rowNat t) ||| rowNat t)` and append to the item:
"The earlier formula here was the mirror image (rule 86) and passed every symmetric check; caught by a kernel `decide` against `evolve` on 2026-09-07."

- [ ] **Step 5: Whole-project build and commit**

Run: `lake build 2>&1 | tail -2`. Expected: success.

```bash
git add Rule30/Basic.lean blueprint/crystals.md
git commit -m "Rowan: the row model, rowNat and rowCell, with a kernel check to depth 6

One natural number per row, one step as three Nat operations the kernel
evaluates with bignums. decide reaches depth 5000 in a second under propext
alone. The first draft was the mirror image and passed every symmetric
check; a decide against evolve caught it, and the check stays in the file.
Crystal 20 corrected to match. Piece 2 of the connections design.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GPnQpLsEzqhJdDSTmePJ8q"
git push origin main
```

---

### Task 3: Seed the two tiers — eight statements, eight nodes

**Files:**
- Modify: `Rule30/Statements.lean` (insert before the `harness_probe` doc comment, which starts `/-- A trivially true statement that exists only so the harness`)
- Modify: `blueprint/dag.json` (append eight nodes)
- Test: `lake build Rule30.Statements`; `cd harness && gleam run -- status`

**Interfaces:**
- Consumes: every name from Tasks 1 and 2.
- Produces: the node ids below, which Task 6 dispatches and Keel's index renderer will list.

- [ ] **Step 1: Confirm the checkout is at rest** (as Task 1 Step 1).

- [ ] **Step 2: Insert the statements**

Insert into `Rule30/Statements.lean` immediately before the line beginning `/-- A trivially true statement that exists only so the harness`:

```lean
/-! ## Configurations and the row model

The picture grown from an arbitrary row, and the bit-level model of the
single-seed picture. Sourced from `blueprint/crystals.md` items 1–4, A1, A2,
20 and 34, under `docs/superpowers/specs/2026-09-07-connections-design.md`. -/

/-- **Flipping the left neighbour always flips the output.** Rule 30 is
`left XOR (centre OR right)`, so with centre and right held fixed the output
is the left cell up to a constant. Left-permutivity for one step, in the
form crystal A1 gives it. -/
theorem rule30_ne_of_left_ne (c d : Config) (i : ℤ)
    (hl : c (i - 1) ≠ d (i - 1)) (hc : c i = d i) (hr : c (i + 1) = d (i + 1)) :
    rule30 c i ≠ rule30 d i := by
  sorry

/-- **The exact local law of the left front.** Two rows agree at `i - 2` and
`i - 1` and differ at `i`; then the outputs at `i - 1` differ exactly when
the cell at `i - 1` is white. The difference front advances left when the
cell beside it is white and can retreat when it is black, which is the
deterministic content behind the measured left speed near a quarter. -/
theorem rule30_left_local_law (c d : Config) (i : ℤ)
    (h2 : c (i - 2) = d (i - 2)) (h1 : c (i - 1) = d (i - 1)) (h0 : c i ≠ d i) :
    (rule30 c (i - 1) ≠ rule30 d (i - 1)) ↔ c (i - 1) = false := by
  sorry

/-- **The sideways inverse.** Any row is recovered one cell to the left from
its successor and its own cells to the right: `c (i-1) = xor (rule30 c i) (c i || c (i+1))`.
The general-row form of the closed `evolve_sub_one_eq_xor`. -/
theorem sideways_inverse (c : Config) (i : ℤ) :
    c (i - 1) = xor (rule30 c i) (c i || c (i + 1)) := by
  sorry

/-- **The cone lemma for an arbitrary row.** After `t` steps the origin cell
depends only on the starting cells at positions `-t .. t`: two rows that
agree there grow the same origin cell. Induction on `t`; the single-seed
`evolve_eq_false_of_outside_cone` is the case where the second row is all
white, read away from the origin. -/
theorem evolveFrom_eq_of_agree_on_window (c d : Config) (t : ℕ)
    (h : ∀ j : ℤ, -(t : ℤ) ≤ j → j ≤ t → c j = d j) :
    evolveFrom c t 0 = evolveFrom d t 0 := by
  sorry

/-- **One step of rule 30 is left-permutive with radius 1.** The
`LeftPermutive` form of `rule30_ne_of_left_ne`. -/
theorem rule30_leftPermutive : LeftPermutive rule30 1 := by
  sorry

/-- **`t` steps of rule 30 are left-permutive with radius `t`.** Flipping the
cell at `i - t` while holding `i - t + 1 .. i + t` fixed flips the output at
`i` after `t` steps. Induction on `t` over one step; the flipped cell's
influence moves right by exactly one per step and is never cancelled,
because each step is left-permutive. -/
theorem evolveFrom_leftPermutive (t : ℕ) :
    LeftPermutive (fun c => evolveFrom c t) t := by
  sorry

/-- **The rightmost difference moves right at speed exactly one.** If two
rows agree everywhere to the right of `i` and differ at `i`, then after `t`
steps they differ at `i + t` and agree everywhere to its right. Kůrka's
right Lyapunov exponent, in its finite form. Induction on `t`. -/
theorem rightmost_difference_moves_right (c d : Config) (i : ℤ) (t : ℕ)
    (hagree : ∀ j : ℤ, i < j → c j = d j) (hdiff : c i ≠ d i) :
    evolveFrom c t (i + t) ≠ evolveFrom d t (i + t) ∧
      ∀ j : ℤ, i + t < j → evolveFrom c t j = evolveFrom d t j := by
  sorry

/-- **After `t` steps, exactly half of all windows grow a black centre cell.**
Of the `2 ^ (2t + 1)` assignments to positions `-t .. t`, exactly `2 ^ (2t)`
make the origin black at time `t`. Left-permutivity with radius `t` pairs
each window with the one whose leftmost cell is flipped, and the pair has
one black and one white outcome. This is the finite form of "a random row
stays random", and the reason one half is the expected density; it says
nothing about the single-seed row, which is one window in `2 ^ (2t + 1)`. -/
theorem window_count_half (t : ℕ) : blackWindowCount t = 2 ^ (2 * t) := by
  sorry

/-- **The row model agrees with the automaton.** `rowCell t x = evolve t x`
for every `t` and `x`. Induction on `t`; the step case reads the three
neighbouring bits out of `(4 * r) ^^^ ((2 * r) ||| r)` with `Nat.testBit`
lemmas and matches them to `rule30_eq`. After this, any concrete fact about
any row to depth in the thousands is a theorem by `decide`. -/
theorem rowCell_eq_evolve (t : ℕ) (x : ℤ) : rowCell t x = evolve t x := by
  sorry

```

- [ ] **Step 3: Build the statements module**

Run: `cd C:/Users/dibuj/dev/rule30 && lake build Rule30.Statements 2>&1 | grep -v "declaration uses" | tail -3`
Expected: `Build completed successfully` and exactly nine new `declaration uses 'sorry'` warnings if you count them (`grep -c`).

- [ ] **Step 4: Add the nodes**

Save as a scratch script and run it with `node` from the repository root:

```js
const fs = require('fs');
const dag = JSON.parse(fs.readFileSync('blueprint/dag.json', 'utf8'));
const src = ' Seeded under docs/superpowers/specs/2026-09-07-connections-design.md; definitions in Rule30/Basic.lean under "Arbitrary rows" and "The row model".';
const nodes = [
  ['rule30_ne_of_left_ne', 'S', [], 'configuration',
   'Left-permutivity of one step of rule 30 (crystal A1): flipping the left neighbour with centre and right fixed flips the output. rule30_eq on both rows, then a Bool case split on the three shared cells. DOES NOT PROVE anything about the single-seed picture; it is the base every configuration lemma below rests on.'],
  ['rule30_left_local_law', 'S', ['rule30_ne_of_left_ne'], 'configuration',
   'The exact local law of the left difference front (crystal A2): with agreement at i-2 and i-1 and a difference at i, the outputs at i-1 differ iff the cell at i-1 is white. rule30_eq at position i-1 on both rows: the left neighbours agree, the centres agree, the right cells differ, so the outputs differ iff the OR is decided by the right cell, i.e. iff the centre is white. DOES NOT PROVE any bound on the left speed of a difference; crystal A3 says why none below 1 can be seeded.'],
  ['sideways_inverse', 'S', [], 'configuration',
   'The sideways inverse for an arbitrary row (crystal 1): c (i-1) = xor (rule30 c i) (c i || c (i+1)). rule30_eq and Bool.xor cancellation. The closed evolve_sub_one_eq_xor is this for the single-seed row; a worker may read that proof file for the shape.'],
  ['evolveFrom_eq_of_agree_on_window', 'M', [], 'configuration',
   'The cone lemma for an arbitrary starting row: if c and d agree at positions -t..t then evolveFrom c t 0 = evolveFrom d t 0. Induction on t with a strengthened hypothesis: after s steps the rows agree at positions -(t-s)..(t-s). The step is rule30_eq at each position in the shrunken window, whose three neighbours lie in the previous one. The closed evolve_eq_false_of_outside_cone is the special case d = fun _ => false, read away from the origin, and its proof file shows the |i| bookkeeping this needs. DOES NOT PROVE anything about which cells inside the cone matter; only that cells outside it do not.'],
  ['rule30_leftPermutive', 'S', ['rule30_ne_of_left_ne'], 'configuration',
   'LeftPermutive rule30 1, unfolded: the hypothesis gives agreement at i and i+1 and a difference at i-1, which is rule30_ne_of_left_ne exactly. Unfold LeftPermutive, instantiate, and discharge the two agreement facts from the window hypothesis at j = i and j = i + 1.'],
  ['evolveFrom_leftPermutive', 'M', ['rule30_leftPermutive'], 'configuration',
   'LeftPermutive (fun c => evolveFrom c t) t, by induction on t. Strengthened statement for the step: after s steps the two rows agree at i-t+s+1 .. i+t-s and differ at i-t+s, so the difference moves right by one per step while the agreement window shrinks by one on each side; one step of rule30_leftPermutive at position i-t+s+1 gives the next difference, and rule30_eq at the interior positions gives the next agreement. Crystal 24. DOES NOT PROVE anything about the left edge of the difference region, which moves at an unproved average speed.'],
  ['rightmost_difference_moves_right', 'M', ['rule30_ne_of_left_ne'], 'configuration',
   'If c and d agree at every position right of i and differ at i, then after t steps they differ at i+t and agree at every position right of i+t (crystal 2, Kurka: right Lyapunov exponent exactly 1). Induction on t: agreement to the right is preserved because each cell right of i+t+1 reads three cells that agree, and the difference at i+t+1 is rule30_ne_of_left_ne at that position, whose centre and right neighbours agree by the same fact. DOES NOT PROVE what happens left of i; the left front is the open, measured quantity.'],
  ['window_count_half', 'L', ['evolveFrom_leftPermutive', 'evolveFrom_eq_of_agree_on_window'], 'configuration',
   'blackWindowCount t = 2 ^ (2 * t): of all 2^(2t+1) windows of width 2t+1, exactly half grow a black origin cell after t steps (crystals item 34; the finite form of the XOR lemma, crystal 30). Route: the involution on windows that flips index 0 (position -t) is a bijection on Finset.univ; for each window, evolveFrom_leftPermutive at i = 0 with radius t says the two members of a pair grow different origin cells, since ofWindow w and ofWindow (flip w) agree at -t+1..t and differ at -t. So the filter for black and the filter for white are in bijection and each has half of Fintype.card (Fin (2t+1) -> Bool) = 2^(2t+1). Mathlib: Finset.card_bij or Finset.card_image_of_injective on the flip map, Fintype.card_fun, Fintype.card_bool, Fintype.card_fin, Finset.filter_card_add_filter_neg_card_eq_card. DOES NOT PROVE anything about the single-seed row, which is one window out of 2^(2t+1), the least random one; this is why one half is the expected density and not why it is the actual one.'],
  ['rowCell_eq_evolve', 'L', [], 'row',
   'rowCell t x = evolve t x for every t and x. Induction on t. Base: rowNat 0 = 1, testBit 1 n is decide (n = 0), and initialConfig x is decide (x = 0). Step: evolve_succ then rule30_eq give left XOR (centre OR right) of evolve t at x-1, x, x+1; on the model side, Nat.testBit of (4*r) ^^^ ((2*r) ||| r) at bit b is testBit r (b-2) XOR (testBit r (b-1) OR testBit r b), by Nat.testBit_xor, Nat.testBit_or, and testBit (2*r) (b+1) = testBit r b (Nat.testBit_mul_two_pow or Nat.testBit_two_mul / Nat.testBit_shiftLeft after rewriting 2*r and 4*r as shifts); the cone boundary cases are where rowCell is false by definition and evolve is false by evolve_eq_false_of_outside_cone. The kernel check in Basic.lean already agrees to depth 6, so a mismatch in a proof attempt is an index error, not a definitional one. DOES NOT PROVE any property of the rows; it licenses decide to compute them.'],
];
for (const [id, size, deps, object, description] of nodes) {
  if (dag.nodes.some(n => n.id === id)) throw new Error('already present: ' + id);
  for (const d of deps) if (!dag.nodes.some(n => n.id === d) && !nodes.some(n => n[0] === d)) throw new Error('unknown dep ' + d + ' for ' + id);
  const pascal = id.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  dag.nodes.push({ id, region: 'P1', lean_name: id, description: description + src, deps, status: 'open', size,
    proof_file: 'Rule30/Proofs/' + pascal + '.lean', attempts: [], verified: null, object });
}
fs.writeFileSync('blueprint/dag.json', JSON.stringify(dag) + '\n');
console.log(dag.nodes.length, 'nodes');
```

Expected output: `60 nodes` (51 existing plus 9). Note `window_count_half` is the P2-relevant node but stays in region `P1` so that Emmy is not dispatched to a configuration lemma; the P2 tier proper is seeded separately from the seeder's `--region P2` run.

- [ ] **Step 5: Board check**

Run: `cd harness && gleam run -- status 2>/dev/null | sed -n '/Open leaves/,$p'`
Expected: the open leaves are, in some order, `rule30_ne_of_left_ne`, `sideways_inverse`, `evolveFrom_eq_of_agree_on_window`, `rowCell_eq_evolve`; the others wait on their deps.

- [ ] **Step 6: Commit**

```bash
git add Rule30/Statements.lean blueprint/dag.json
git commit -m "Rowan: seed the configuration tier and the row-model node, nine statements

rule30_ne_of_left_ne, rule30_left_local_law, sideways_inverse,
evolveFrom_eq_of_agree_on_window, rule30_leftPermutive,
evolveFrom_leftPermutive, rightmost_difference_moves_right,
window_count_half (L), rowCell_eq_evolve (L). Sizes S/M/L; deps chained;
each node carries an object field for the index. Pieces 1 and 2 of the
connections design, seeded.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GPnQpLsEzqhJdDSTmePJ8q"
git push origin main
```

---

### Task 4: `docs/obstructions.md`, first entry

**Files:**
- Create: `docs/obstructions.md`

**Interfaces:**
- Produces: the file Keel's brief renderer inlines; the format below is the contract (one `##` per obstruction, four fixed bold labels).

- [ ] **Step 1: Write the file**

```markdown
# Obstructions

Known dead ends, one per entry: the claim someone would naturally try, why
it fails, and what it would take. Read by theorist and seeder sessions
before they propose anything. Maintained by Rowan and by theorists, who
may append an entry but never edit or remove one; a retracted obstruction
gets a new entry saying so and citing the sha that opened the route.

Every entry has the same four parts, so a reader can skim the first two
and stop.

## The diagonal structure never reaches the centre column

**The natural attempt.** Every left diagonal is eventually periodic with a
known period bound (`leftDiagonal_periodicFrom_pow`, and after
`leftDiagonal_step_period_dichotomy` a criterion for when the period grows).
The centre column is made of one cell from each left diagonal, so use the
periodic structure of the diagonals to say something about the centre
column.

**Why it fails.** The centre cell at time `t` is `leftDiagonal t 0`: index
zero of diagonal `t`. A diagonal is periodic only from its onset, and the
onset is at least one for every diagonal past the third, so index zero is
in the transient of every diagonal it belongs to. The same holds for the
right diagonals: `rightDiagonal t 0` is again the centre cell, at the start
of that diagonal. Every diagonal theorem on the board is about the part of
the picture that has settled; P1 is a question about the part that has not.
Time runs down the picture, and the diagonals settle from the outside in,
so the centre column is exactly the seam where nothing has settled yet.

**What it would take.** A statement about the transients: the cells of
diagonal `k` before its onset, as a function of `k`. Nothing on the board
or in the literature says anything about them beyond the onset bound
`2 ^ k` and the measured onset near `k / 2`. A theorem of the shape "the
first cell of every left diagonal is determined by the transients of the
two diagonals above it" is true by `leftDiagonal_recurrence` and says
nothing, because the transients of those two are themselves unknown.

**Recorded** 2026-09-07 by Rowan, from the notebook entry of 2026-09-06
that first stated it.
```

- [ ] **Step 2: Commit**

```bash
git add docs/obstructions.md
git commit -m "Rowan: docs/obstructions.md, the first dead end written where a model will read it

The diagonal structure never reaches the centre column, because the centre
cell at time t is index zero of diagonal t, before its onset. Piece 3 of
the connections design, the hand-written half; Keel inlines it into briefs.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GPnQpLsEzqhJdDSTmePJ8q"
git push origin main
```

---

### Task 5: `object` on every existing node

**Files:**
- Modify: `blueprint/dag.json` (one field added to 51 nodes; no other change)

**Interfaces:**
- Produces: the `object` field values Keel's renderer groups by. The vocabulary is exactly: `configuration`, `row`, `column`, `leftDiagonal`, `rightDiagonal`, `machine`, `bookkeeping`, `prize`.

- [ ] **Step 1: Run the classification**

```js
const fs = require('fs');
const dag = JSON.parse(fs.readFileSync('blueprint/dag.json', 'utf8'));
const objectOf = (id) => {
  if (id.startsWith('bool_') || id.startsWith('periodicFrom_') || id.startsWith('isEventuallyPeriodic_')) return 'machine';
  if (id.startsWith('centerColumnDensity')) return 'bookkeeping';
  if (id.startsWith('centerColumn') || id.includes('_column_') || id.startsWith('not_isEventuallyPeriodic') || id.startsWith('not_evolve_period') || id.startsWith('evolve_period') || id.startsWith('strip_') || id === 'evolve_isEventuallyPeriodic_of_between' || id === 'evolve_sub_one_eq_xor') return 'column';
  if (id.startsWith('leftDiagonal') || id.includes('_left_')) return 'leftDiagonal';
  if (id.startsWith('rightDiagonal') || id.includes('_right_')) return 'rightDiagonal';
  if (id === 'evolve_eq_false_of_outside_cone') return 'row';
  return null;
};
const unclassified = [];
for (const n of dag.nodes) {
  if (n.object) continue;
  const o = objectOf(n.id);
  if (!o) { unclassified.push(n.id); continue; }
  n.object = o;
}
fs.writeFileSync('blueprint/dag.json', JSON.stringify(dag) + '\n');
console.log('unclassified:', unclassified);
const counts = {}; for (const n of dag.nodes) counts[n.object] = (counts[n.object] || 0) + 1; console.log(counts);
```

Expected: `unclassified: []`. If any id prints, add a rule for it above and re-run; do not leave a node without an object. The walls `centerColumn_right_isEventuallyPeriodic_of_center` and `centerColumn_other_isEventuallyPeriodic_of_center` classify as `column`, which is right: they are statements about columns.

- [ ] **Step 2: Harness still decodes the board**

Run: `cd harness && gleam run -- status 2>&1 | tail -3`
Expected: the same open-leaves list as Task 3 Step 5; the decoder ignores unknown fields, and if it does not, this step fails loudly and the field name is negotiated with Keel before anything else.

- [ ] **Step 3: Commit**

```bash
git add blueprint/dag.json
git commit -m "Rowan: board repair, every node carries an object for the index

configuration, row, column, leftDiagonal, rightDiagonal, machine,
bookkeeping. No node's statement, status or deps changed.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GPnQpLsEzqhJdDSTmePJ8q"
git push origin main
```

---

### Task 6: Dispatch the tiers and commit the record

This task is run by Rowan, not by a subagent: it starts a run and holds the freeze.

**Files:**
- Created by the harness: `Rule30/Proofs/<Pascal>.lean` for each closed node, `runs/<run-id>/`, updates to `blueprint/dag.json`, `blueprint/bugs.json`, `agents/*.md`, `Rule30/Proofs.lean`.

- [ ] **Step 1: Announce**

Send Keel "run started" with the sha of Task 5's commit, as in every run this week. The freeze on the shared checkout starts with that message.

- [ ] **Step 2: Start**

Run in the background: `cd harness && gleam run -- run --max-attempts 14 --concurrency 3`
Nine nodes; two are L and go straight to opus. Watch with a monitor on `runs/<run-id>/*/events.jsonl` for `verify`, `crashed`, `rate_limited` and `build_lock_timeout`, and on the `gleam.exe` process for exit.

- [ ] **Step 3: On exit, verify and commit**

Run: `lake build 2>&1 | tail -2`. Expected: success.

```bash
git add Rule30/Proofs.lean Rule30/Proofs/*.lean agents/*.md blueprint/bugs.json blueprint/dag.json runs/<run-id>
git commit -m "Rowan: the configuration tier and the row model, <n> of 9 proved

<one paragraph: which closed, which did not and on what model, cost, and
what rowCell_eq_evolve unlocks if it closed>

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GPnQpLsEzqhJdDSTmePJ8q"
git push origin main
```

Then send Keel "run ended" with the sha. A node that did not close after its ladder is exhausted stays `open` with its attempts recorded; a second run may be started after reading the attempt logs, and the L nodes in particular may need their descriptions sharpened from what the opus attempt reported.

- [ ] **Step 4: Notebook**

Append to `agents/Rowan.md` an entry with the run's outcome and, specifically, what was wrong in this plan: any statement a prover found unprovable as stated, any description that misdirected, and the cost of the two L nodes against their estimate.

---

## Self-review

**Spec coverage.** Piece 1: definitions (Task 1), tier nodes 2–8 (Task 3; node 1 of the spec's list became the `rfl` lemma `evolve_eq_evolveFrom_initial` in Basic.lean, which the spec itself says should be a lemma provers never unfold by hand). Piece 2: `rowNat`, `rowCell`, the kernel check (Task 2), `rowCell_eq_evolve` (Task 3). Piece 3, hand-written half: Task 4; `object` on every node: Task 5 and on new nodes in Task 3. The seeder brief's witness paragraph and the index renderer are Keel's plan and are not here.

**Placeholder scan.** None. Every code step carries its code; the only bracketed text is in Task 6's commit message, which is written after the run from the run's own summary.

**Type consistency.** `evolveFrom (c : Config) (t : Nat) : Config`, used as `evolveFrom c t 0` and `evolveFrom c t (i + t)` in Task 3; `LeftPermutive (f : Config → Config) (r : Nat)`, used as `LeftPermutive rule30 1` and `LeftPermutive (fun c => evolveFrom c t) t`; `blackWindowCount (t : Nat) : Nat` used as `blackWindowCount t`; `rowCell (t : Nat) (x : ℤ) : Bool` used as `rowCell t x`. The `window`/`ofWindow` pair is defined in Task 1 and used by `blackWindowCount` in Task 1 and by the route text of `window_count_half` in Task 3. All nine statements and all eight definitions were typechecked together against the real `Rule30.Basic` on 2026-09-07 in Rowan's scratchpad, including the depth-10 `decide` agreement of `rowCell` with `evolve`.
