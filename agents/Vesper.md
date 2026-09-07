# Vesper

I'm Vesper, and I hold the edges of Rule 30's light cone — the diagonal boundaries past which no cell's value can propagate, and the near-boundary bands where the automaton, for reasons that are actually provable rather than merely observed, settles into strict periodicity. If the center column is where the chaos lives, my region is where it doesn't: I want clean statements of exactly how far in from an edge the pattern is forced to repeat, and clean proofs of why. I think of a theorem here the way I'd think of a type signature in Kotlin — the statement in `Rule30/Statements.lean` is the contract, and my job in `Rule30/Proofs/` is to actually construct a value of that type, no `sorry`s left as unfulfilled promises. I expect a lot of my proofs to be inductions on the distance from the edge, since that's usually where periodicity arguments actually bite. This notebook is where I keep what I've learned about that boundary from session to session, since I won't remember on my own.

## 2026-09-05T22:24:51Z — named for P1

P1 lives at the boundary of the light cone — the line past which a cell's history can no longer reach, and the region just inside it where Rule 30 stops looking chaotic and locks into a provably periodic pattern. That's a dusk line: chaos on one side, order settling in on the other, repeating night after night. "Vesper" names the evening star and the hour it rises in — the fixed point you can set a clock by even while everything else churns. It's a real word-turned-name, not a living person, and not a job title, and it points straight at the geometry I'm here to own: edges, and the periodicity that provably holds along them.

## 2026-09-05T22:46:24Z — evolve_eq_false_of_outside_cone (sonnet, proved)

Two gotchas worth remembering for anyone in P1 touching `|i|` on ℤ:

1. `import Rule30.Basic` alone (which only pulls in `Mathlib.Data.Int.Notation`) is NOT enough to even *parse* `|i|` — the abs notation macro isn't in scope, giving a bare "unexpected token '|'" parse error that looks like nothing to do with abs. `import Mathlib.Algebra.Order.Ring.Int` fixes both the notation and gives the full `LinearOrderedCommRing ℤ` instance (so `abs_of_nonneg`, `abs_of_nonpos`, `le_total`, `omega` on ℤ, etc. all work). Cheaper imports (`Mathlib.Algebra.Order.Group.Unbundled.Abs`, `Mathlib.Data.Int.Order.Basic`) each solve only half the problem (notation xor instances) — don't bother trying to be minimal here, just pull in `Mathlib.Algebra.Order.Ring.Int`.

2. `omega` does NOT understand `abs`/`|·|` directly (unlike `Int.natAbs`, which it does special-case). The working pattern is: case-split on the sign with `le_total 0 i`, rewrite `|i|` to `i` or `-i` via `abs_of_nonneg`/`abs_of_nonpos` (supplied via `by omega : 0 ≤ i - 1` etc. once the sign is fixed), *then* call `omega` on the now-linear goal. `le_or_lt` is not the right name to reach for in this Mathlib snapshot (unknown identifier) — `le_total` is the one that resolves.

Proof shape for anyone doing the sibling edge lemmas (`evolve_left_edge`, `evolve_right_edge`, etc.): induction on `t` (or `generalizing i` where needed), `rw [evolve_succ, rule30_eq]` to expose the three-neighbour xor/or formula, then discharge each neighbour's cone/edge membership with the induction hypothesis. `centerColumn_zero` is already served and importable if useful (shows initialConfig gives true at 0, dual to the false-outside-cone case here).

## 2026-09-06T01:01:42Z — chose a colour

Colour: #2b3a67 — A deep twilight indigo — vesper is the evening prayer at dusk, and dusk is the calm, settled edge of the day the way my periodic bands are the calm, settled edge of the light cone.

## 2026-09-06T01:07:18Z — evolve_left_edge (sonnet, proved)

## evolve_left_edge (sonnet, proved)

Straightforward induction on `t`, mirroring `evolve_eq_false_of_outside_cone`'s shape but simpler since there's no case split on the sign of `i` — the edge is always negative.

- Base case: goal is `evolve 0 (-(↑(0:ℕ):ℤ)) = true`. `simp only [Nat.cast_zero, neg_zero]` turns `-(↑0)` into `0`, then `exact centerColumn_zero` closes it directly — `centerColumn 0` is defeq to `evolve 0 0` (plain `def`, not `abbrev`, but `exact` unfolds it fine at default transparency). No need to `unfold centerColumn` explicitly.
- Successor case: `push_cast` first to turn `-(↑(n+1):ℤ)` into `-(↑n + 1)` so later `have`s' LHS syntactically matches what `rule30_eq` will produce. Then `rw [evolve_succ, rule30_eq]` exposes `xor (evolve n (X-1)) (evolve n X || evolve n (X+1))` with `X = -(↑n+1)`. Two `have`s proved by `ring` rewrite `X-1` to `-(↑n+2)` and `X+1` to `-↑n`. Then: `evolve_eq_false_of_outside_cone` kills the left neighbour (`n < |-(↑n+2)| = n+2`), and `ih : evolve n (-↑n) = true` handles the right neighbour, which alone forces the `||` to `true`; `simp` closes `xor false true = true`.

**Gotcha for anyone in P1**: `Mathlib.Algebra.Order.Ring.Int` (needed for `abs`/`omega` per [[evolve-eq-false-of-outside-cone]]'s notes) does NOT bring in the `ring` or `linarith` tactics. Got "unknown tactic" + cascading "unsolved goals" errors that looked unrelated to the actual missing import. Fix: explicitly `import Mathlib.Tactic.Ring` and `import Mathlib.Tactic.Linarith` alongside it. Don't assume any single Mathlib import pulls in the tactics you'd expect — the algebra/order imports and the tactic imports are separate axes.

Reused `abs_of_nonpos` + `linarith`/`omega` pattern from the outside-cone proof for the `|-(↑n+2)| = ↑n+2` fact — that pattern (case on sign, rewrite abs, then close linear goal) is the reusable idiom for this whole region.

## 2026-09-06T01:53:41Z — evolve_left_second_diagonal (sonnet, proved)

This one was already fully written by attempt 1 before it hit the 5-hour rate limit; I just re-ran `lake build Rule30.Proofs.EvolveLeftSecondDiagonal` against the untouched file and it built clean on the first try. No changes needed. Worth noting for future P1 work: the harness's Bash guard rejects `cd <dir> && lake build ...` as a shell-operator violation — just run the bare `lake build <module>` command directly; the working directory is already correct.

Proof shape, one level shallower than `evolve_left_edge`'s induction — no induction needed here, just one `rw [evolve_succ, rule30_eq]` at `i = -(t:ℤ)` to expose `xor (evolve t (-(t:ℤ)-1)) (evolve t (-(t:ℤ)) || evolve t (-(t:ℤ)+1))`, then:
- `h1 : evolve t (-(t:ℤ) - 1) = false` via `evolve_eq_false_of_outside_cone`, using `abs_of_nonpos` + `linarith` to show `|-(t:ℤ)-1| = t+1 > t` (same case-on-sign-then-linarith idiom as the other P1 lemmas).
- `h2 : evolve t (-(t:ℤ)) = true` is exactly `evolve_left_edge t`, served — no need to reprove the edge fact.
- `rw [h1, h2]; simp` closes `xor false (true || _) = true` — simp knows `true || x = true` and `xor false true = true` without any hints.

This confirms the reusable P1 idiom is now three-deep: outside-cone (induction), left-edge (induction using outside-cone), second-diagonal (no induction, just one unfold using both served lemmas). The next diagonal out (third diagonal, distance 2 from edge) will likely need an actual induction again since the direct neighbour argument won't fully collapse — worth checking whether it needs a two-step unfold or an induction on t with a stronger IH.

## 2026-09-06T14:49:46Z — evolve_left_third_diagonal (sonnet, proved)

One-step unfold, no induction — same shallow shape as second-diagonal, one level further out.

Key insight: `t + 2` is not syntactically `?n + 1`, so `rw [evolve_succ]` won't match it directly — first rewrite with `have heq : t + 2 = t + 1 + 1 := by omega; rw [heq, ...]`. (Defeq might actually let `show`/`rw` see through numeral `2` vs `1+1` for `Nat`, but I didn't risk it — the explicit `heq` via `omega` is cheap and unambiguous, worth doing by default whenever a served lemma's `+1` shape needs to line up with a `+2` or higher goal.)

After `rw [heq, evolve_succ, rule30_eq]` at `i = -(t:ℤ)`, goal is `xor (evolve (t+1) (-(t:ℤ)-1)) (evolve (t+1) (-(t:ℤ)) || evolve (t+1) (-(t:ℤ)+1)) = false`. The trick: you never need the right-neighbour term at all.
- Left neighbour: `-(t:ℤ) - 1 = -((t+1:ℕ):ℤ)` (via `push_cast; ring`), so it's exactly `evolve_left_edge (t+1)` = `true`.
- Centre: exactly `evolve_left_second_diagonal t` = `true` (that lemma's statement is literally `evolve (t+1) (-(t:ℤ)) = true`, no massaging needed).
- `true || x = true` regardless of the right neighbour, and `xor true true = false` — `simp` closes it after `rw [h1, h2]` with zero hints.

So the pattern for the *next* diagonal out (4th, distance 3) is probably: the two innermost neighbours (left-edge-shifted and second-diagonal-shifted) will likely both resolve via served lemmas, but check whether `true || _` is still enough to collapse the `xor`, or whether the right-neighbour term (now one step further from the edge, possibly not `false` yet) actually needs pinning down. Worth checking `evolve_eq_false_of_outside_cone` doesn't apply that far in yet — distance from edge matters more than distance from origin here.

General reusable fact for P1: whenever a goal's Nat step-count is `t + k` for `k ≥ 2`, do `have heq : t + k = t + (k-1) + 1 := by omega; rw [heq, ...]` before `evolve_succ` — don't rely on defeq matching numerals through `rw`.

## 2026-09-06T15:18:09Z — evolve_left_diagonal_recurrence (haiku, proved)

Simplest possible proof shape: rewrite the Nat sum, then unfold the rule, then let `ring` handle the integer arithmetic inside function arguments.

The one gotcha: `Mathlib.Tactic.Ring` is a separate import from `Mathlib.Algebra.Order.Ring.Int` — the algebra imports don't bring in the tactic, so a bare `ring` or `ring_nf` gave "unknown tactic" until I added it. (Learned this again the hard way on `evolve_left_edge`, but forgot to save it before this proof — important to repeat: the algebra/order and tactic import axes are orthogonal in this version of Mathlib.)

The proof structure should anchor later diagonal lemmas: instead of re-deriving `-(i+1) - 1 = -(i+2)` each time, cite this lemma's arithmetic verification via `show ... from by ring`. This is the coordinate-shift dictionary.

Goal after `rw [show i+m+3 = (i+m+2)+1 from by omega, evolve_succ, rule30_eq]`:
```
(evolve (i + m + 2) (-(↑i + 1) - 1) ^^ (evolve (i + m + 2) (-(↑i + 1)) || evolve (i + m + 2) (-(↑i + 1) + 1))) =
  (evolve (i + m + 2) (-(↑i + 2)) ^^ (evolve (i + m + 2) (-(↑i + 1)) || evolve (i + m + 2) (-↑i)))
```

After `simp only [show -(↑i + 1 : ℤ) - 1 = -(↑i + 2 : ℤ) from by ring, show -(↑i + 1 : ℤ) + 1 = -(↑i : ℤ) from by ring]`, Lean sees both sides are syntactically identical and closes.

## 2026-09-06T15:22:05Z — evolve_left_fourth_diagonal (sonnet, proved)

First genuine induction in P1's diagonal series — the recurrence lemma `evolve_left_diagonal_recurrence` finally earns its keep as the "coordinate-shift dictionary" it was built to be.

**Finding the right (m, i) instantiation is the whole trick.** The recurrence's shape is `evolve (i+m+3) (-(i+1)) = xor (evolve (i+m+2) (-(i+2))) (evolve (i+m+2) (-(i+1)) || evolve (i+m+2) (-i))`. To land on the successor goal `evolve ((n+1)+3) (-(n+1))`, solve `i+1 = n+1` and `i+m+3 = (n+1)+3` simultaneously: i = n, m = 1. Once you plug that in, the three RHS terms are *exactly* the second diagonal (at n+2), third diagonal (at n+1), and fourth diagonal (at n, i.e. the induction hypothesis) — no residual arithmetic needed beyond `omega`-provable Nat reassociations (`n+1+2 = (n+2)+1` etc.) to align each served lemma's own `+1`/`+2` shape with the recurrence's `i+m+2` form, plus one `push_cast; ring` cast lemma per side to convert `-((k:ℕ):ℤ)` into `-((n:ℤ)+k)` form so `rw` can match syntactically. Same idiom as the third-diagonal proof, just three copies of it instead of one.

**Base case (t=0) used `decide` directly** on the raw, un-simplified goal `evolve (0+3) (-(↑(0:ℕ))) = decide (0 % 2 = 0)` — no `simp`/`norm_num` preprocessing needed. `decide` doesn't care about surface syntax (`0+3` vs `3`, `↑0` vs `0`); it just needs a `Decidable` instance for the whole equality (trivial: both sides are `Bool`), then the kernel evaluates everything by computation. Worth remembering as a shortcut for any base case that's a small concrete numeral — building the 7-cell-wide light cone for `evolve 3 0` by hand (nested `xor`/`||` over `initialConfig` at -3..3) is tedious and unnecessary when the numbers are this small; `decide` reduces it in under a second and adds no axioms (verified no `Native.decide` — it's ordinary kernel reduction, safe under the propext/Classical.choice/Quot.sound axiom cap).

**Closing the parity arithmetic**: after the recurrence collapses to `xor true (false || decide (n % 2 = 0)) = decide ((n+1) % 2 = 0)`, don't hand-simplify `xor`/`||` yourself — `rcases Nat.mod_two_eq_zero_or_one n with h | h <;> simp [h, Nat.add_mod]` closes both branches in one shot. `simp` uses `h : n % 2 = 0` (or `= 1`) as a rewrite rule wherever `n % 2` appears (including inside `decide (n % 2 = 0)` and, via `Nat.add_mod`, inside `(n+1) % 2`), then its built-in numeral simprocs finish the arithmetic and the `decide` reduction. `Nat.mod_two_eq_zero_or_one : ∀ n, n % 2 = 0 ∨ n % 2 = 1` resolved fine in this Mathlib snapshot — no import beyond what's already pulled in by `Rule30.Basic` + the diagonal lemma files was needed.

No new import gotchas this round — the combination of imports from `EvolveLeftThirdDiagonal` + `EvolveLeftDiagonalRecurrence` (`Rule30.Basic`, the three diagonal proof files, `Mathlib.Algebra.Order.Ring.Int`, `Mathlib.Tactic.Ring`) was sufficient; `omega` on ℕ and `Nat.mod_two_eq_zero_or_one` both came along for free, confirming [[evolve-left-edge]]'s note that `omega` itself doesn't need a separate import (core Lean), only the ℤ-specific instances/notation do.

This closes the "first non-constant diagonal" node. Next diagonal out (fifth, distance 4) will likely need the recurrence again but should reuse *this* lemma as one of its three RHS terms instead of `ih` directly on the third diagonal — worth checking whether the parity pattern continues or breaks into a longer period once a fourth distinct diagonal value enters the mix.

## 2026-09-06T15:35:17Z — evolve_left_fourth_diagonal_isEventuallyPeriodic (haiku, proved)

`IsEventuallyPeriodic` is the **first inhabited instance** of the aperiodicity predicate that Rule30/Prize defines for the conjecture. It does not touch the center column; it proves the *predicate itself* is satisfiable by a sequence in the project — in this case, the fourth left diagonal, which provably alternates with period 2.

The definition: `∃ p > 0, ∃ N, ∀ n ≥ N, f (n + p) = f n` — three existentials, all of which must be provided.

**Proof shape**: straight instantiation.
- `use 2` for period, then `omega` to discharge `2 > 0`.
- `use 0` for the starting point (the pattern holds from n=0 onward, no prefix needed).
- For each n ≥ 0, show `f(n+2) = f(n)` via:
  - `have h1 : evolve ((n + 2) + 3) (-(↑(n + 2) : ℤ)) = decide ((n + 2) % 2 = 0) := evolve_left_fourth_diagonal (n + 2)`
  - `have h2 : evolve (n + 3) (-(↑n : ℤ)) = decide (n % 2 = 0) := evolve_left_fourth_diagonal n`
  - Rewrite both sides via these lemmas, then `omega` closes `(n + 2) % 2 = n % 2`.

**Reusable fact for P1**: When the goal is two function applications with shifted indices, avoid trying to rewrite the function head directly — instead `have` the closed form at each index, `rw` both sides, then the parity/arithmetic goal becomes independent and lightweight. This is cleaner than exposing the three-cell rule or nested `evolve_succ`/`rule30_eq` unfolding.

Imports: `Rule30.Prize` for `IsEventuallyPeriodic`, `Rule30.Proofs.EvolveLeftFourthDiagonal` for the closed form. Axioms: propext, Classical.choice, Quot.sound (all inherited).

## 2026-09-06T16:57:27Z — bool_map_iterate_three (sonnet, proved)

bool_map_iterate_three: the brief's suggested `by decide` does NOT work directly — `decide` fails with "Expected type must not contain free variables" because `f` is a bound parameter, not a closed term. `revert f; decide` also fails: `failed to synthesize Decidable (∀ (f : Bool → Bool), f^[3] = f)` — no DecidableEq/Fintype-Pi instance for `Bool → Bool` is in scope from `Rule30.Basic`'s imports (just `Mathlib.Data.Int.Notation` + `Mathlib.Logic.Function.Iterate`), and pulling in `Mathlib.Data.Fintype.Pi` felt like overkill for an S-sized node.

What worked instead, using only what `Rule30.Basic` already imports: `funext x`, then `simp only [Function.iterate_succ_apply', Function.iterate_zero_apply]` to unfold `f^[3] x` to `f (f (f x))`, then `rcases hft : f true with _ | _ <;> rcases hff : f false with _ | _ <;> cases x <;> simp_all`. The insight: a function out of `Bool` is fully pinned down by its two output values, so case-splitting on `f true` and `f false` (4 cases) plus the input `x` (2 cases, collapsed by `<;>`) leaves fully concrete goals that `simp_all` closes using `hft`/`hff` as rewrite rules — including through the nested applications, since simp iterates to a fixpoint.

`Function.iterate_succ_apply'` / `Function.iterate_zero_apply` are the named lemmas for unfolding `f^[n+1] x` to `f (f^[n] x)` form (apply-the-fresh-application-outermost, matching how nested nesting reads) — worth remembering for anyone else in the DAG who needs to unfold a small literal `Function.iterate` by hand rather than relying on defeq/`show`.

This node had a stale attempt already sitting in the file (from a prior session that hit `budget_exhausted`) using `simp [Function.funext_iff]; intro x; decide` — `Function.funext_iff` is not a valid identifier in this Mathlib snapshot (got "unknown identifier"), so that attempt was dead on arrival. Good reminder to always re-verify a file's existing content against a real build rather than trusting it was left in a working state.

## 2026-09-06T17:04:53Z — bool_driven_eventually_two_periodic (sonnet, proved)

The captain's route worked exactly as specced, with two private helpers (`stepMap`, `iterMap`) doing the load-bearing work — first time P1 has needed helper defs alongside the theorem, and nothing in the harness objected to a file with more than one declaration.

**`iterMap` as a manual fold, not `Function.iterate`.** Since the update at index `i+k` is a *different* function of `a`/`b` than at `i`, you can't just use `f^[n]` — you need the composition `stepMap(i+n-1) ∘ ... ∘ stepMap(i)`. Built it as a plain structurally-recursive `def ... : ℕ → Bool → Bool | 0 => id | n+1 => stepMap a b (i+n) ∘ iterMap a b i n`. Equation lemmas for a pattern-matched `def` are NOT needed here — every unfold in the proof went through `rfl` (for the `n=0` case) or `show <unfolded form>` (for the `n+1` case) rather than `simp [iterMap]`, since `show` just needs defeq and pattern-match compilation gives you that for free. Cheaper than fighting with equation-lemma names.

**`set` tactic is unavailable from `Rule30.Basic`'s import surface.** Tried `set j := i - p with hj_def` to name a substitution; got "unknown tactic" at that exact line with a cascading "unsolved goals" one line up (the actual parse failure reports on the *next* line, which was confusing at first). `set` lives in a Mathlib tactic file not pulled in transitively. Fix: don't reach for `set` at all — `obtain ⟨j, hij⟩ : ∃ j, i = j + p := ⟨i - p, by omega⟩` does the same job (name a value, get an equation for it) using only core tactics (`obtain`, `omega`), and reads better besides since `hij : i = j + p` is exactly the substitution you want instead of a reversed subtraction equation.

**The `f^[3] x = f(f(f x))` unfold, reused a third time now** (after `bool_map_iterate_three` itself and presumably others): `congrFun (bool_map_iterate_three g) (x j)` turns the function equality `g^[3] = g` into a pointwise one at the exact argument needed, then `simpa [Function.iterate_succ_apply', Function.iterate_zero_apply] using this` unfolds `g^[3] (x j)` to `g (g (g (x j)))` on the fly inside the `simpa`, avoiding a separate `hexpand` lemma. Cleaner than proving the unfold as its own `have` first.

**Shape of the three-fold gluing.** With `j := i - p` (so the goal's `i` is `j + p`), the three applications of `iter_eq` at basepoints `j`, `j+p`, `j+2p` each advancing by `p` give `x(j+p)`, `x(j+2p)`, `x(j+3p)` in terms of nested `iterMap a b j p` applications once `iter_shift` (proved for `i ≥ N` by induction on the step count, bottoming out in `stepMap_shift` which just cites `ha`/`hb` at the right index) collapses every basepoint back to `j`. The chain of `rw [...] at hB/hC` — substituting each `have` into the next — reads like manual equational reasoning; there's probably a slicker way to thread these through `calc`, but the `rw`-at-hypothesis chain was fast to get right and never fought me.

No axiom surprises — only `propext`, `Classical.choice`, `Quot.sound`, all inherited, none introduced.

## 2026-09-06T17:08:57Z — evolve_left_diagonal_isEventuallyPeriodic_step (sonnet, proved)

The captain's route (a i = d m (i+2), b i = d (m+1) (i+1), x i = d (m+2) i, feed into `bool_driven_eventually_two_periodic`) worked exactly as specced, first try, no dead ends.

**Key simplification: don't name `a`/`b`/`x` as separate `have`-bound locals.** A `have f : T := ...` makes `f` opaque to defeq (it behaves like an `intro`, not a `let`), so later unification against `f`'s *body* fails silently in confusing ways. Instead I never introduced names for them at all — I wrote the exact same lambda literal everywhere it was needed (in `ha`'s statement, in `hb`'s statement, inside `hrec`'s statement, and again as the explicit `a b x` arguments to `bool_driven_eventually_two_periodic`). Repetition, but every occurrence stays fully transparent to `exact`/defeq, so `isEventuallyPeriodic_shift (fun j => ...) 2 h0` closes `ha`'s goal directly via beta reduction with no `rw`/`show` massaging needed at all — Lean beta-reduces `(fun j' => body) (i+2)` to the substituted form automatically when checking defeq against the stated `have` type.

**Coordinate alignment is a single `rw [show ... from by omega, show ... from by push_cast; ring, ...]` chain.** With `a i := evolve (i+2+m) (-((i+2:ℕ):ℤ))`, `b i := evolve (i+1+(m+1)) (-((i+1:ℕ):ℤ))`, `x i := evolve (i+(m+2)) (-(i:ℤ))`, the needed recurrence `x(i+1) = xor (a i) (b i || x i)` is *exactly* `evolve_left_diagonal_recurrence m i` after six ground rewrites (three Nat-sum reassociations via `omega`, two cast-of-sum-to-sum-of-casts via `push_cast; ring`, one trivial Nat reassociation). `rw` with a fully concrete (no metavariables) equation rewrites every matching occurrence in the goal at once, so each cast rewrite only needs to be stated once even though it appears twice (once in the LHS's `x(i+1)` term, once in the `b i` term that shares the same `i+1` cast).

Reusable idiom for the rest of P1's induction-step family (if there are more `_step` nodes for other diagonal offsets): write `a`, `b`, `x` as raw lambda literals throughout rather than binding them, and the six-rewrite alignment chain is copy-pasteable with the offsets adjusted.

**Import set that sufficed:** `Rule30.Basic`, the four served-lemma modules named in the brief, `Mathlib.Algebra.Order.Ring.Int`, `Mathlib.Tactic.Ring` — same set `EvolveLeftFourthDiagonal.lean` uses, confirming (again) that `push_cast` rides in on one of those two imports rather than needing its own; no separate `Mathlib.Tactic.PushCast`/`NormCast` import was needed.

No axiom surprises — `lake env lean` on the file gave no errors/warnings, and every lemma cited is already vetted to the standard three axioms.

## 2026-09-06T17:11:17Z — evolve_left_diagonals_isEventuallyPeriodic (sonnet, proved)

Transcription job exactly as the brief promised — the captain had already proved this end to end against a sorry'd step lemma, so there was nothing to discover, only to type correctly. First try, no build failures at all.

**`match k, ih with | 0, _ => ... | 1, _ => ... | m + 2, ih => ...` as a tactic** works cleanly after `induction k using Nat.strong_induction_on with | _ k ih =>`. The goal mentions `k`, and `ih : ∀ m, m < k → motive m`, so matching on `(k, ih)` together (not just `k` alone) lets the `m + 2` branch bind a correctly-specialized-but-still-general `ih : ∀ j, j < m + 2 → ...` to feed `ih m (by omega)` and `ih (m+1) (by omega)`. `Nat.strong_induction_on` (the name the brief specified) resolved fine in this Mathlib snapshot — no import beyond what `EvolveLeftDiagonalIsEventuallyPeriodicStep`'s own transitive imports already pulled in (`Rule30.Basic`, `Rule30.Prize` for `IsEventuallyPeriodic`, the served step/edge/second-diagonal modules).

**The base-case friction was exactly as billed.** For `k = 0`, the goal after `intro n _; simp only []` (beta-reduction only, no rewriting) is `evolve (n + 1 + 0) (-((n+1:ℕ):ℤ)) = evolve (n + 0) (-(n:ℤ))`. `evolve_left_edge` is stated at bare `t`/`t+1`, not `t + 0`/`t + 1 + 0`, so a direct `exact`/`rw` won't match syntactically even though `n + 0` is defeq to `n`. Fix: state a `have` at *exactly* the goal's shape, `rw [show n + 1 + 0 = n + 1 from by omega]` to align the index inside that `have`'s own proof, then cite the served lemma — never try to `simp` the cast first, since normalizing `-((n+1:ℕ):ℤ)` into `-(↑n + 1)` form makes it stop matching the served lemma's own `-((t:ℕ):ℤ)` statement shape.

For `k = 1`, no rewriting was even needed — `evolve_left_second_diagonal (n+1) : evolve ((n+1)+1) (-((n+1:ℕ):ℤ)) = true` matches the goal's `n + 1 + 1` shape exactly as written (associativity of `+` on numerals/variables here is already left-to-right so `(n+1)+1` and `n+1+1` are syntactically identical, unlike the `k=0` case's `n+1+0` vs `n+1` mismatch which needed the explicit `omega` bridge).

Confirms [[evolve-left-fourth-diagonal-isEventuallyPeriodic]]'s idiom (have the closed form at each shifted index, then `rw` both into the goal) generalizes cleanly to the strong-induction base cases too — the pattern is: never fight the index shape with `simp`, just state a `have` matching it precisely and bridge with a small `omega`-proved index equation when the served lemma's own shape doesn't happen to line up syntactically.

This closes the top-level "every left diagonal is eventually periodic" goal for P1's left side. The right side (evolve_right_edge, evolve_right_second_diagonal already served) presumably wants the mirror-image family next, if not already underway by a peer.

## 2026-09-06T21:14:47Z — evolve_sub_one_eq_xor (haiku, proved)



## 2026-09-06T21:29:25Z — evolve_period_sub_one (haiku, proved)

**evolve_sub_one_eq_xor as the workhorse**: The lemma `evolve t (i - 1) = xor (evolve (t + 1) i) (evolve t i || evolve t (i + 1))` directly expresses how each cell on the left is determined by three cells to its right, spanning times t and t+1. This is the key to the proof: rewrite both sides of the periodicity goal with this lemma at different times, then the hypotheses h0/h1 collapse everything to reflexivity.

**Rewrite order matters**: Applying `evolve_sub_one_eq_xor (t + p) i` and then `evolve_sub_one_eq_xor t i` in sequence leaves a goal whose left side has terms at time (t+p+1), (t+p), and right side at (t+1), (t). Then `ring` to rewrite `t + p + 1 = t + 1 + p`, and h0/h1 at t and t+1 collapse all four terms to syntactic identity.

**Arithmetic on Nat subtraction not needed**: Unlike earlier P1 nodes where we had to worry about `t - 1` and whether `t + p - 1 + 1 = t + p`, here we avoid subtraction entirely. evolve_sub_one_eq_xor is stated in forward time (`t` and `t+1`), not in the backwards form we initially tried, so the proof never computes `t - 1` or `t + p - 1` as natural numbers.

## 2026-09-06T21:30:46Z — evolve_period_sub (sonnet, proved)

Went exactly as the brief specced — first-try build, no dead ends. The route: prove a stronger conjunctive statement by induction on k, `key : ∀ k, (col (i-k) periodic) ∧ (col (i-k+1) periodic)`, then project `.1` for the actual goal. Carrying the pair is essential because `evolve_period_sub_one` needs *both* a column and its right neighbour to conclude the column one further left.

Base case `k = 0`: `simpa using ⟨h0, h1⟩` — simp normalizes `i - (↑(0:ℕ))` to `i` and `i - 0 + 1` to `i + 1` (via `Nat.cast_zero`/`sub_zero`/etc.) automatically, no manual cast lemma needed there.

Step case: `evolve_period_sub_one (i - (k:ℤ)) p N ih.1 ih.2` gives periodicity of column `(i-k)-1`, exactly what's needed for the new "first" component after re-expressing `i - ((k+1:ℕ):ℤ)` as `i - (k:ℤ) - 1`. The second (right-neighbour) component of the new pair is just `ih.1` again after the matching rewrite `i - ((k+1:ℕ):ℤ) + 1 = i - (k:ℤ)` — no new lemma needed, just re-threading the previous "current column" into the new "right neighbour" slot.

Both cast identities close with `by push_cast; ring` exactly as the brief promised — `push_cast` turns `((k+1:ℕ):ℤ)` into `(k:ℤ) + 1` and then `ring` handles the rest. `rw [show ... from by push_cast; ring]` (rewriting the goal's LHS index expression to the shape `evolve_period_sub_one`'s output already has) rather than trying to rewrite `hstep`'s statement — cheaper to align the goal to the served term than vice versa.

Confirms the reusable idiom from [[evolve-period-sub-one]] and the diagonal family: when an induction's Nat-indexed goal has a `+1`/`-1` shape mismatch against a served lemma, a targeted `rw [show <bridge equation> from by push_cast; ring]` is the standard fix — cheaper than trying to get `simp` to normalize both sides into agreement, which risks over-normalizing past the point where the served lemma's own statement still matches syntactically.

This closes another node in the periodicity-propagation family that presumably feeds toward comparing whole regions of the light cone for eventual periodicity, mirroring the left-diagonal `IsEventuallyPeriodic` work but for adjacent-column pairs rather than a single diagonal sequence.

## 2026-09-06T21:33:04Z — not_evolve_period_adjacent (sonnet, proved)

First try, no dead ends — the captain's route in the brief was exact and needed zero adjustment. Worth recording as the reusable idiom for this last node's shape (a global-contradiction proof rather than an induction), since it's a different shape from every other P1 node so far.

**The `∃ m, m = ...` / `obtain` idiom beats naming with `let`/`set` here.** Rather than binding `m := N + p + (-i).toNat + 1` and `k := (i + m).toNat` as `let`s (risking the `set`-tactic import trap [[bool-driven-eventually-two-periodic]] hit), I used `obtain ⟨m, hm⟩ : ∃ m : ℕ, m = ... := ⟨_, rfl⟩` twice. This keeps `hm`/`hk` as ordinary equations in context that `omega` can see and use, with no defeq-transparency subtlety at all — cleaner than `let` for this purpose since every later step is pure arithmetic omega can close outright.

**`omega` closes `Int.toNat` reasoning directly, no manual case-split needed.** The load-bearing fact `i - (k:ℤ) = -(m:ℤ)` (with `hk : k = (i + (m:ℤ)).toNat` in context) needs `i + m ≥ 0` to know `(k:ℤ) = i + m` (via `Int.toNat_of_nonneg`), and that nonneg fact itself depends on unfolding `(-i).toNat` inside `hm`. I expected to need `Int.toNat_of_nonneg`/`Int.le_toNat`/case-splits by hand, but `omega` swallowed the whole thing in one call given just `hm` and `hk` in context — confirms omega's Int.toNat special-casing (mentioned in passing in earlier P1 notes but never actually exercised until this node) is real and doesn't need any manual bridging lemma. Same for `hmp : p ≤ m` and `htN : m - p ≥ N` — both closed by bare `omega` from `hm` alone.

**`Nat.abs_cast` is a real lemma name in this Mathlib snapshot** — `|(n:ℤ)| = n` for `n : ℕ`, used after `abs_neg` to turn `|-(m:ℤ)|` into `(m:ℤ)` directly. Chain was `rw [abs_neg, Nat.abs_cast]` exactly as the brief specified, then `exact_mod_cast (by omega : m - p < m)` for the final numeral inequality — no surprises.

**Import set**: `Rule30.Basic`, `Rule30.Proofs.EvolvePeriodSub`, `Rule30.Proofs.EvolveLeftEdge`, `Rule30.Proofs.EvolveEqFalseOfOutsideCone`, `Mathlib.Algebra.Order.Ring.Int`, `Mathlib.Tactic.Ring` — the last two turned out unnecessary in the end (no bare `ring`/abs-sign-splitting was needed once `omega` swallowed everything), but harmless to leave in since they were already pulled in transitively by the served-lemma imports anyway. Next time a similar all-omega proof comes up in P1, worth trying with a narrower import list first since `ring`/`Order.Ring.Int` may not be needed at all when `omega` is doing all the arithmetic.

This appears to close the last currently-open node in the P1 seeded spine (the "no two adjacent columns share a period" node was the final piece connecting the diagonal/periodicity family into a usable contradiction). Worth checking with Rowan/the dispatcher whether a new tier is queued next.

## 2026-09-06T21:38:18Z — not_isEventuallyPeriodic_adjacent (haiku, proved)

The route was exactly as the captain specified in the brief. After unpacking the conjunction of the two eventually-periodic hypotheses with `rintro`, apply `isEventuallyPeriodic_common_period` with the two function literals `fun t => evolve t i` and `fun t => evolve t (i + 1)` as explicit arguments (the lemma needs the actual functions passed in, not just the proofs). The lemma returns a common period `p`, proof `hp : 0 < p`, starting time `N`, and the periodicity conditions `h0` and `h1` for both columns. Thread these directly into `not_evolve_period_adjacent i p N hp h0 h1`, which yields False.

No friction — the proof built first try once the function arguments were passed explicitly to the common-period lemma. The three-heading proof note follows the taught pattern: what it says (boundary fact about the automaton), why it's true (periodicity propagates contradictorily), where the work is (none — just lemma threading).

Uses only the standard three axioms (propext, Classical.choice, Quot.sound), inherited from served lemmas.

## 2026-09-06T21:43:21Z — centerColumn_right_not_both_isEventuallyPeriodic (haiku, proved)

**Direct application of served lemma.** `centerColumn` unfolds to `fun t => evolve t 0` by definition. The served lemma `not_isEventuallyPeriodic_adjacent i` states that columns i and i+1 cannot both be eventually periodic. At i=0, this gives exactly what we need after unfolding centerColumn and letting simpa handle the `0 + 1 = 1` arithmetic. No induction, no proof search — just definitional unfolding and lemma threading.

## 2026-09-06T21:44:24Z — centerColumn_not_eventually_periodic_of_right (haiku, proved)

**Bridge lemmas are transparent:** When a hypothesis has the form "if X then Y", applying it to a proof of X and feeding the result to a contradiction lemma (via a pair or tuple) reads as the direct encoding of "X is impossible" — no intermediate steps or names needed. This pattern appears three times now in the P1 region: here, in `not_isEventuallyPeriodic_adjacent`, and in the driven-sequence node. For anyone building a final contradiction from eventually-periodic neighbors, the shape is always `intro hc; exact not_isEventuallyPeriodic_adjacent i ⟨hc, h hc⟩` where `h` is the propagation rule and `i` is the coordinate pair.

## 2026-09-06T23:23:03Z — isEventuallyPeriodic_of_periodic_step (opus, abandoned)

**THE BIG ONE — the `type_of%` check cannot handle `{α : Type} [C α]` statements, and no worker-side fix exists.** Proof is correct and builds clean; the harness verdict came back FAILED twice, identically:

```
checks/isEventuallyPeriodic_of_periodic_step.lean:3:33: error: typeclass instance problem is stuck
  Fintype ?m.1
checks/...:4:14: error: Unknown constant `harness_check`
```

Column 33 of line 3 is exactly where the statement's name starts (`theorem harness_check : type_of% ` = 33 chars), so the error is on the Statements side, before the proof is consulted. The statement opens `{S : Type} [Fintype S]`; naming it bare in term position inserts `?S` and then asks for `Fintype ?S`, which Lean refuses to attempt while the type argument is a metavariable. `type_of%` gives no expected type, so `?S` is never determined. Second error is just `#print axioms` failing on a declaration line 3 never produced.

**How to prove this kind of thing from inside a worker's cage — the reusable trick.** I could not read the check file usefully or edit it, so I reproduced its *shape* inside my own proof file, aimed at my own theorem, with `Rule30.Statements` neither imported nor involved:

```lean
private theorem diag_bare :
    type_of% isEventuallyPeriodic_of_periodic_step :=
  isEventuallyPeriodic_of_periodic_step

private theorem diag_at :
    type_of% @isEventuallyPeriodic_of_periodic_step :=
  @isEventuallyPeriodic_of_periodic_step
```

`diag_bare` reproduced the error character for character (col 13, exactly where the bare identifier begins after `    type_of% `). `diag_at` produced nothing. Same theorem, same file, opposite outcomes ⇒ cause is the line's shape, not the statement file and not my proof. Then delete both and rebuild. **Generalize: when you suspect the harness rather than yourself, build the harness's construct locally against your own theorem. It converts "I argued" into "I measured", costs one build, and is the difference between a bug report that gets actioned and one that gets doubted.** This is the CLAUDE.md "distrust a result you dislike as hard as one you like" rule with an actual method attached — my first report reasoned to the right answer with no evidence, which was luck.

**Fix filed:** emit `type_of% @Statements.foo := @foo`. `@` suppresses implicit insertion so the full `∀ {S} [inst], ...` comes back with nothing to synthesize. Note it makes the check *stricter* (compares whole quantified types incl. binder structure), so it cannot admit a weakened restatement.

**The road not taken, and do not take it.** A `@[default_instance]` `Fintype` instance would let Lean fill `?S` with an arbitrary type and the check would go green — for a *specialised* statement that is not the one asked for. That is fabricating a pass, forbidden by the exact-type rule, and it would pollute instance resolution for every downstream file. It was available and it would have looked like success. Name it and refuse it.

**Watch for the quieter sibling.** Implicit *value* params under `type_of%` do not get stuck — they instantiate silently and check a type that is not the stated one. That fails *open*, which is worse. Same `@` fix.

---

Proof content, for the record:

**Found the file already complete.** Attempt 1 (sonnet) wrote a full correct proof, then reported `budget_exhausted` before verification. Built first try untouched. Second time in P1 (see [[evolve-left-second-diagonal]]). But [[bool-map-iterate-three]] is the counter-case — an inherited attempt dead on arrival with an unknown identifier. **Build the inherited file before either trusting or distrusting it; the build is the only thing that settles which case you are in.**

**No Rule30 content at all.** Pure finite-state-machine lemma. `import Rule30.Basic` + `import Mathlib.Tactic` is the whole import list, no served lemma cited. P1's served-lemma list can be entirely irrelevant to a node.

**A helper with an ordering hypothesis beats `wlog`.** Brief specced `wlog hlt : (x:ℕ) < y generalizing x y`. Better: prove `have core : ∀ a b : ℕ, a < b → s (N + a*p) = s (N + b*p) → <goal>` once, then `rcases lt_or_gt_of_ne (Fin.val_injective.ne hxy) with hlt | hlt` and close both branches with `core x y hlt hfxy` / `core y x hlt hfxy.symm`. One proof, both orderings, no `wlog` side-goal bookkeeping. `Fin.val_injective.ne` gets `(x:ℕ) ≠ (y:ℕ)` from `x ≠ y` on `Fin n`.

**The omega-atom trap is real; the brief's fix is exact.** `omega` treats `a * p`, `b * p`, `(b - a) * p` as three unrelated atoms — variable×variable is nonlinear. Hoist `have hmul : a * p + (b - a) * p = b * p := by rw [← Nat.add_mul]; congr 1; omega` into context first; then every later index-shuffle closes by bare `omega`. (`rw [← Nat.add_mul]` gives `(a + (b - a)) * p`; `congr 1` reduces to the linear `a + (b - a) = b`.) **General rule: when omega must relate `f x` and `f y` for nonlinear `f`, hand it one hypothesis equating the atoms and it does the surrounding linear arithmetic itself.**

**`positivity` cannot prove `0 < (b - a) * p`** — needs `a < b` plus truncated Nat subtraction. Use `Nat.mul_pos (by omega) hp`.

**Pigeonhole idiom (first in P1):** `Fintype.exists_ne_map_eq_of_card_lt (fun k : Fin (Fintype.card S + 1) => s (N + (k:ℕ) * p)) (by simp)`. Indexing by `Fin (card S + 1)` makes the side condition `card S < card (Fin (card S + 1))`, closed by `simp` via `Fintype.card_fin`. Returns `⟨x, y, hxy, hfxy⟩`.

**Note repair.** The inherited note said the argument chains "cell by cell" — borrowed from the neighbouring diagonal proofs, meaningless in a lemma with no cells and no automaton — and ran nine lines against the six-line ceiling. Rewrote both.

## 2026-09-06T23:35:20Z — isEventuallyPeriodic_of_periodic_step (sonnet, proved)

Second attempt at this exact node — the first (opus, recorded above) was correct but was wrongly failed by a harness bug in the verifier's check theorem, since fixed at commit 5a9e3ae (the `@` fix on both sides of `type_of%`). This attempt reused that route verbatim from the notebook and it built clean, confirming the earlier diagnosis was right.

One direction slip worth flagging for the next person citing `hstep_mul`: its statement is `step (t + m*p) = step t` — the *shifted* time on the left, the *base* time on the right. When you need `step base = step (base + k*p)` (base on the left, as `hprop`'s induction step does after rewriting the goal with `hshift`), you need `.symm` — Lean's type mismatch error names the two sides explicitly when this is flipped, so it's a one-line fix once you see it, but easy to get backwards when writing the proof forward from the recurrence in your head rather than from the goal as stated after `rw`.

Otherwise every piece of the captain's route and the abandoned attempt's notes (the `hmul` atom-hoisting trick for omega, `Nat.mul_pos` in place of `positivity`, the `Fintype.exists_ne_map_eq_of_card_lt` pigeonhole, avoiding `wlog` with an explicit `core` helper plus `lt_or_gt_of_ne (Fin.val_injective.ne hxy)`) worked exactly as documented, first try after the one `.symm` fix. Import list `Rule30.Basic` + `Mathlib.Tactic` was sufficient, no Rule30 automaton content at all.

`lake env lean` on the file gave no output (clean, no warnings) — standard three axioms expected, consistent with every other node in this family.

## 2026-09-06T23:36:19Z — strip_eventuallyPeriodic (haiku, proved)

**Strip-and-schedule pattern.** This node shows the cleanest application yet of `isEventuallyPeriodic_of_periodic_step`: the schedule of update maps is determined entirely by two boundary cells (via `stripStep`), so when those cells are eventually periodic with the same period, the update schedule is too, and the orbit (the strip itself) is eventually periodic with a doubled period. The captain's route was exact and needed no adjustment — `refine ... ?_ ?_`, then two trivial subgoals: `simp only [ha, hc]` for the schedule periodicity and `exact strip_succ` for the step equation. The note's phrasing — "the update rule depends only on the two boundary cells" — is the key insight that makes this whole proof disappear.

No new import gotchas (all served lemmas resolved cleanly) and no new Mathlib patterns beyond what prior nodes in P1 established.

## 2026-09-06T23:41:26Z — evolve_isEventuallyPeriodic_of_between (haiku, proved)

**Lemma threading pattern confirmed.** When a served lemma returns a structure of witnesses (like `isEventuallyPeriodic_common_period` returning period, bound, time, and two periodicity proofs), `obtain` unpacks them cleanly and they feed directly into the next lemma. No special handling needed — the types align as the brief specifies.

**`congrFun` on structural equality.** When a hypothesis `hM : strip i w = strip i w` (or in this case, the functional equality after periodicity) is applied at a specific index via `congrFun hM ⟨0, by omega⟩`, it yields the value at that index. Then `simpa [strip]` unfolds the `strip` definition to reveal the underlying `evolve` term, letting `simp` close the goal by unification.

**The served lemmas were exactly right.** `isEventuallyPeriodic_common_period` takes explicit function arguments (the captain's note applies here too — pass the lambdas, not just the proofs), and `strip_eventuallyPeriodic` immediately produces the result needed. No friction.

## 2026-09-06T23:42:49Z — not_isEventuallyPeriodic_pair (sonnet, proved)

First try, no dead ends — the captain's route in the brief was exact and needed zero adjustment, closing P1's headline node (Jen's theorem: no two distinct columns are both eventually periodic, for any gap, not just adjacent ones).

**Shape**: `rintro ⟨hi, hj⟩`, reduce to the adjacent case via `apply not_isEventuallyPeriodic_adjacent i; refine ⟨hi, ?_⟩`, then `rcases eq_or_lt_of_le (show i + 1 ≤ j by omega) with h | h` splits on whether j is literally i+1 (trivial, `rw [h]; exact hj`) or strictly further (the real case).

**The strict case is pure index bookkeeping, no new proof idea.** `evolve_isEventuallyPeriodic_of_between (i+1) w ha hc` wants `ha` at `evolve t (i+1-1)` and `hc` at `evolve t (i+1+w+1)`, so picking `w = (j-i-2).toNat` makes the right boundary land exactly on `j`. The bridging equation `e : i + 1 + ((j-i-2).toNat : ℤ) + 1 = j` needs `Int.toNat_of_nonneg` (since `j - i - 2 ≥ 0` follows from `hij` and the strict case's `h` via `omega`) then `ring` to close the arithmetic once toNat is unfolded to the underlying int.

**Confirmed gotcha from the brief, worth re-flagging for the next person**: `simpa [e]` does NOT work to discharge `hc` — simp normalizes `Int.toNat` expressions (via a `max` rewrite) before it gets a chance to use `e`, so the rewrite target disappears out from under it. The fix is exactly as specced: state `hc` as its own `have` with the *exact* type `evolve_isEventuallyPeriodic_of_between` wants, then `rw [e]; exact hj` as two separate steps rather than one `simpa`. This is a second instance of the general P1 idiom (from [[evolve-left-diagonals-isEventuallyPeriodic]] and others): when a served lemma's argument shape needs an index bridge, state a `have` at the exact target shape and `rw` into it — don't let `simp`/`simpa` anywhere near a `toNat`/cast expression you still need in its original form.

Import list `Rule30.Basic`, `Rule30.Prize`, `Rule30.Proofs.NotIsEventuallyPeriodicAdjacent`, `Rule30.Proofs.EvolveIsEventuallyPeriodicOfBetween` was exactly sufficient — `eq_or_lt_of_le`, `Int.toNat_of_nonneg`, `omega`, `ring` all resolved with nothing extra needed.

This closes the top-level periodicity-propagation goal for P1: adjacent columns can't both be periodic, and now neither can any pair at any distance. Worth checking with Rowan whether this feeds directly into `centerColumn_not_eventually_periodic_of_right`'s hypothesis or opens a new tier.

## 2026-09-06T23:43:49Z — isEventuallyPeriodic_column_unique (haiku, proved)

**The closing node for P1.** Uniqueness follows from Jen's theorem: if columns i and j are both eventually periodic, they are the same column. `by_contra hne` on the assumption they differ, then `rcases lt_or_gt_of_ne hne` splits trichotomy. Each strict case (i < j or j < i) applies `not_isEventuallyPeriodic_pair` at the correct ordering to obtain False. No novel proof content — the served lemma is the entire proof.

Imports: `Rule30.Basic`, `Rule30.Proofs.NotIsEventuallyPeriodicPair`. Axioms: propext, Classical.choice, Quot.sound (inherited from not_isEventuallyPeriodic_pair).

This closes P1 entirely: the uniqueness of the eventually periodic column is the boundary theorem that connects Jen's original result to the Rule 30 prize conjecture about the center column's aperiodicity.

## 2026-09-06T23:44:51Z — centerColumn_not_eventually_periodic_of_any_other (haiku, proved)

**Conditional proof shape.** This theorem does not stand alone — it assumes a hypothesis (any column repeating forces center to repeat) and derives False from that. The proof note's first sentence must flag this, since a reader opening the file won't have the context that this is not a claim about the center column's aperiodicity in general. The captain's four-line proof works exactly as specified: unfolding centerColumn into evolve t 0, obtaining the witness j from the hypothesis, and applying isEventuallyPeriodic_column_unique with the two periodic columns to get j = 0, contradicting j ≠ 0.

**Imports.** Rule30.Proofs.IsEventuallyPeriodicColumnUnique is the only served lemma needed here — the uniqueness result that two eventually periodic columns must be the same column. Rule30.Basic brings in everything else (centerColumn, evolve, IsEventuallyPeriodic). No tactic imports or Mathlib beyond Basic were needed for this node.

## 2026-09-07T02:09:52Z — periodicFrom_mul (haiku, proved)

**Nat lemmas for arithmetic:** `Nat.zero_mul`, `Nat.add_zero` simplify the base case directly via `simp only`. `Nat.succ_mul` and `Nat.add_assoc` handle the index algebra in the step case. **Bound propagation:** When applying a period hypothesis `h : PeriodicFrom f p N` at an offset index `n + m * p`, you need to prove `n + m * p ≥ N` from `n ≥ N`. A `calc` block chaining `n + m * p ≥ N + m * p ≥ N` via `omega` works cleanly. **Pattern:** The proof chains three sequential identities in the step case: index rewrite via `heq`, period application via `h`, and induction hypothesis via `ih`, threaded through `rw` without intermediate names.

## 2026-09-07T02:44:30Z — leftDiagonal_periodicFrom_step (sonnet, proved)

First try, no dead ends — this is the quantitative sibling of `evolve_left_diagonal_isEventuallyPeriodic_step`, which I already had fully served notes on, so the whole task was translating that proof's `evolve`-level recurrence unfold into `leftDiagonal`-level statements and swapping the existential lemmas (`isEventuallyPeriodic_shift`, `isEventuallyPeriodic_common_period`) for direct hypothesis threading, since here the period `q` and onset `N` are already given concretely rather than needing to be manufactured and unified.

**Key simplification over the existential version**: no `isEventuallyPeriodic_shift`/`isEventuallyPeriodic_common_period` needed at all. Those two lemmas exist specifically to (a) reindex a periodic sequence read at an offset and (b) put two *different* periods onto one common period. Here both diagonals already share the *same* period `q` from the *same* `N` (that's what `h0`/`h1` say), so the "offset" step collapses to a one-line `rw [show i + q + 2 = i + 2 + q from by omega]` bridging into `h0 (i+2) (by omega)` directly — no new period needs constructing.

**`show <fully unfolded evolve form>` to cross the `leftDiagonal` definition boundary in one step.** Rather than `unfold leftDiagonal` or `simp only [leftDiagonal]`, stating the goal's unfolded form directly via `show evolve (i + 1 + (m + 2)) (-((i + 1 : ℕ) : ℤ)) = xor (...)  ...` and letting `show`'s defeq check unfold all four `leftDiagonal` applications at once (LHS and all three RHS terms) worked cleanly — `leftDiagonal` is a plain `def` (`leftDiagonal (k j : Nat) : Bool := evolve (j + k) (-(j : ℤ))`), so defeq unfolding is unconditional, confirming the general P1 idiom (see [[evolve-left-edge]]) that `show`/`exact` unfold plain `def`s at default transparency without needing `unfold` as a separate tactic step.

**Final `exact bool_driven_eventually_two_periodic ... : ...` closes the goal directly against `PeriodicFrom (leftDiagonal (m+2)) (2*q) (N+q)`** with zero massaging — `PeriodicFrom` is also a plain `def` (`∀ n ≥ N, f (n+p) = f n`), and the served lemma's conclusion `∀ i ≥ N+p, x (i+2*p) = x i` (with `x := leftDiagonal (m+2)`, `p := q`) is syntactically that shape already (just written with `i` for the bound variable instead of `n` — bound-variable names don't matter for defeq/unification).

**Self-verification trick used**: temporarily appended `#print axioms leftDiagonal_periodicFrom_step` to the end of the file, ran `lake env lean` to see the axiom list directly (`propext, Quot.sound`, no `Classical.choice` even), then removed the line and rebuilt with `lake build` before reporting. Since a harness worker can't run `#print axioms` as a separate command, editing it into the one file you own, checking, then editing it back out is the only way to see the axiom list yourself rather than waiting on the harness's own check — cheap (one extra edit-build-edit-build cycle) and worth doing whenever the stakes of a wrong axiom surprise are higher than usual.

Import list: `Rule30.Basic`, `Rule30.Proofs.EvolveLeftDiagonalRecurrence`, `Rule30.Proofs.BoolDrivenEventuallyTwoPeriodic`, `Mathlib.Algebra.Order.Ring.Int`, `Mathlib.Tactic.Ring` — no `IsEventuallyPeriodicShift`/`IsEventuallyPeriodicCommonPeriod` needed, unlike the existential sibling, for the reason above.

## 2026-09-07T02:48:34Z — leftDiagonal_periodicFrom_pow (sonnet, proved)

First try, no dead ends, following the captain's route exactly. This is the quantitative form the whole diagonal-periodicity family had been building toward: existence proofs (`evolve_left_diagonals_isEventuallyPeriodic`) and step lemmas (`leftDiagonal_periodicFrom_step`, `periodicFrom_mul`) all needed to be composed, but none of the composition needed a new idea.

**Structure**: same strong-induction skeleton as `evolve_left_diagonals_isEventuallyPeriodic` — `induction k using Nat.strong_induction_on with | _ k ih => match k, ih with | 0, _ => ... | 1, _ => ... | m + 2, ih => ...`. Since `k` here is already the theorem's own bound argument (not something introduced by `intro`), `induction k using ...` works directly on it with no preceding `intro`.

**Base cases (k=0,1)**: both diagonals are constantly `true` (`evolve_left_edge` / `evolve_left_second_diagonal`), so *any* period works — I used `2^0`/`2^1` as the goal demands, proved via `hconst : ∀ j, leftDiagonal k j = true` then `rw [hconst (n + 2^k), hconst n]` collapses to `true = true`, closed automatically by `rw`'s trailing `rfl`. `leftDiagonal 1 j` is defeq to `evolve (j+1) (-(j:ℤ))` (the def unfolds `k` to `1` and `j+k` to `j+1` for free), so `exact evolve_left_second_diagonal j` needs no `show`/rewrite at all — only the `k=0` case needs the `show` + `rw [show j+0=j from by omega]` bridge, since `j+0` doesn't syntactically match the served lemma's bare `t` even though it's defeq.

**Step case (m+2)**: the two induction hypotheses give periods `2^m` (from `N0`) and `2^(m+1)` (from `N1`) — already mismatched, exactly as the brief warned. `periodicFrom_mul (leftDiagonal m) (2^m) N0 h0 2 : PeriodicFrom (leftDiagonal m) (2*2^m) N0`, then `rw [hpow1]` where `hpow1 : 2^(m+1) = 2*2^m := by ring` aligns it to `2^(m+1)`. **`ring` proves `2^(m+1) = 2*2^m` directly** even though the exponent contains a variable `m` — no need to hunt for the exact Mathlib lemma name (`pow_succ` vs `pow_succ'`, which direction) as I first worried; `ring` normalizes `x^(n+1)` symbolically and this was one line, no dead end. Same trick for `hpow2 : 2^(m+2) = 2*2^(m+1)`.

**Onset-raising is genuinely trivial**: `PeriodicFrom f p N` unfolds to `∀ n ≥ N, ...`, so raising `N` to any `N' ≥ N` is just `fun n hn => h n (le_trans hle hn)` — no lemma needed, matches the brief's "straight from the definition" note. Did this inline for both `h0''`/`h1''` at `max N0 N1` via `le_max_left`/`le_max_right` + `le_trans`, avoiding `set` entirely (per [[bool-driven-eventually-two-periodic]]'s note that `set` risks import/transparency friction) — just wrote `max N0 N1` out longhand everywhere. `Nat.max_le.mpr ⟨_, _⟩` gave `max N0 N1 ≤ bound` from the two individual bounds with no friction.

**`omega` handles `max` as an opaque atom fine** once a hypothesis like `hMle : max N0 N1 ≤ 2^(m+1)` is in context — the final goal `max N0 N1 + 2^(m+1) ≤ 2^(m+2)` closed by bare `omega` given `hMle` and `hpow2` (`2^(m+2) = 2*2^(m+1)`) in context, treating `max N0 N1`, `2^(m+1)`, `2^(m+2)` as three linear atoms tied together by those two hypotheses. Confirms the general P1 idiom (first exercised on `not_evolve_period_adjacent`'s `Int.toNat` reasoning): give omega one bridging equation between opaque atoms and it does the rest.

**`positivity` proves `0 < 2^(m+1)` with only `import Mathlib.Tactic.Ring` in the import list** (no separate `Mathlib.Tactic.Positivity` import needed) — same as `CenterColumnDensitySucc.lean`'s unadorned use, so positivity rides in on `Ring` or some other already-present import in this Mathlib snapshot.

Import list: `Rule30.Basic`, `Rule30.Proofs.EvolveLeftEdge`, `Rule30.Proofs.EvolveLeftSecondDiagonal`, `Rule30.Proofs.PeriodicFromMul`, `Rule30.Proofs.LeftDiagonalPeriodicFromStep`, `Mathlib.Tactic.Ring`. Verified via the append-`#print axioms`-then-remove trick: `propext, Classical.choice, Quot.sound`, nothing extra.

## 2026-09-07T15:06:49Z — bool_driven_periodicFrom_of_return (haiku, proved)

**Recast induction on a bounded range.** To prove `∀ n ≥ M, f n` where `n` is a Nat, convert with `Nat.exists_eq_add_of_le` to `∃ k, n = M + k`, then induct on `k` directly. This avoids hunting for a named induction principle and lets standard `induction k with | zero => ... | succ k ih => ...` do the work.

**Periodicity application.** When both drivers `a` and `b` have period `p` from time `N ≤ M ≤ n`, and the recurrence is `x(i+1) = xor(a i, b i || x i)`, unwinding `x(n+p)` through the recurrence to `x(n)` needs:
1. `ha n : a(n+p) = a(n)` by applying the periodicity lemma at index `n`, not `n+p`
2. Induction hypothesis `x(n+p) = x(n)` to substitute in the driver formula
3. Symmetry of the recurrence to close: `xor(...) = x(n+1)` by reading the recurrence backward

**Associativity closure.** After rewrites, goals like `x((M+k)+1) = x(M+(k+1))` close with `simp only [Nat.add_assoc]` rather than `omega`, which cannot handle the associativity of `+` on Nat terms composed through function application.

## 2026-09-07T15:10:22Z — bool_driven_periodicFrom_of_reset (haiku, proved)

**A reset point collapses the state to driver-dependent values only.** When `b j = true`, at the next step the state becomes `x (j+1) = not (a j)`, determined entirely by the drivers. One period later `x (j+1+p) = not (a (j+p))`, which equals `x (j+1)` by periodicity of `a`. The onset `j+1` is tied to where the driver went black, not accumulated through `N + p`, so this node discharges the onset-accumulation concern in `leftDiagonal_onset_le` — the wall that names it as a gap.

**Reusable shape for reset-driven periodicity:** When `b n = true` for some `n`, the machine forgets its history and enters a period determined solely by future driver values. Lifts via `bool_driven_periodicFrom_of_return (a b x p N M hrec ha hb hNM eq)` with `M ≥ N` and `x (M + p) = x M` proven by explicit recurrence unfolding and driver periodicity. The same shape applies to any driven bit machine where a reset point forgets the past.

## 2026-09-07T15:12:36Z — leftDiagonal_periodicFrom_step_of_black (sonnet, proved)

leftDiagonal_periodicFrom_step_of_black: exactly the captain's route, first try modulo one gotcha. Instantiating `bool_driven_periodicFrom_of_reset` with `a := fun i => leftDiagonal m (i+2)`, `b := fun i => leftDiagonal (m+1) (i+1)`, `x := leftDiagonal (m+2)`, the `hrec` goal beta-reduces cleanly to exactly `leftDiagonal_recurrence m i` with no massaging. But the `ha`/`hb` periodicity subgoals come back as `(fun i => ...) (i+q) = (fun i => ...) i` — NOT beta-reduced — so a bare `rw [show i+q+2 = i+2+q from by omega]` fails with "did not find an occurrence of the pattern" even though the pattern is obviously there to a human, because rw can't see under the un-reduced lambda application. Fix: `dsimp only` (no lemmas, just forces beta/eta reduction) immediately before the `rw`. This is a new gotcha for the family beyond the "have at exact goal shape" idiom used elsewhere — when a served lemma is applied with raw lambda arguments (per [[bool-driven-eventually-two-periodic]]'s "write a/b/x as raw lambdas, don't `have`-bind them" idiom), the resulting subgoals may carry un-beta-reduced redexes that block `rw`'s syntactic matching; `dsimp only` clears them without touching anything else. Otherwise the proof is pure translation: `hblack` already has exactly `b j = true`'s shape by defeq (no rewrite needed), and both driver-periodicity proofs are one `h0`/`h1` application plus a `+q+k = +k+q` commute. Axioms verified via the append-`#print axioms`-then-remove trick: `propext, Quot.sound`, no `Classical.choice` at all.

## 2026-09-07T15:13:56Z — leftDiagonal_step_period_dichotomy (sonnet, proved)

Smaller than the S/M estimate suggested — a direct two-line case split on the served lemma, no new bookkeeping beyond one index shift.

**Route**: `by_cases h : ∃ j ≥ N, leftDiagonal (m + 1) (j + 1) = true`.
- Yes branch: `obtain ⟨j, hjN, hblack⟩ := h`, then `leftDiagonal_periodicFrom_step_of_black m q N j hjN h0 h1 hblack` gives `PeriodicFrom (leftDiagonal (m+2)) q (j+1)` directly — exactly the left disjunct's witness at `M = j+1`.
- No branch: need `push_neg` BEFORE `simp only [Bool.not_eq_true]`, not after — `h : ¬∃ j ≥ N, P j` is syntactically `¬∃ j, j ≥ N ∧ P j`, and `Bool.not_eq_true` (`¬(b = true) ↔ b = false`) can't fire until push_neg has distributed the negation down to `∀ j ≥ N, ¬ P j`. Got this backwards on the first pass (wrote `simp` then `push_neg`) — it still built because `simp only` with a non-matching lemma is a no-op rather than a failure, so the mistake was silent until I reread the file. Worth remembering: a `simp only [specific_lemma]` that doesn't apply is *not* an error, so ordering bugs like this don't announce themselves — check the goal state, don't just check the build succeeded.
- Then `intro j hj; have h' := h (j - 1) (by omega); rw [show j - 1 + 1 = j from by omega] at h'; exact h'` — the goal wants `leftDiagonal (m+1) j = false` for `j ≥ N+1`, but `h` (after push_neg+simp) is stated at index `j+1` for `j ≥ N`, so shift by reading `h` at `j-1` (valid since `j ≥ N+1 ≥ 1` makes `j-1` a genuine predecessor with `j-1 ≥ N`) and rewrite `(j-1)+1` back to `j`.

**Self-check trick reused** (per [[leftDiagonal-periodicFrom-step]]'s and others' notes): appended `#print axioms leftDiagonal_step_period_dichotomy` after the proof, ran `lake env lean` directly (not `lake build`, which doesn't print it), saw `propext, Classical.choice, Quot.sound` with nothing extra, then removed the line and rebuilt clean before reporting.

Import list: `Rule30.Basic`, `Rule30.Proofs.LeftDiagonalPeriodicFromStepOfBlack` (which transitively pulls in `LeftDiagonalRecurrence` and `BoolDrivenPeriodicFromOfReset`) — sufficient, no `Mathlib.Tactic.Ring`/`Order.Ring.Int` needed since everything here is Nat `omega` bookkeeping.

Noted but not acted on: `push_neg` is deprecated in this Mathlib snapshot in favour of `push Not` — still works, just a warning, not worth chasing for a proof this small.

## 2026-09-07T16:14:38Z — rule30_ne_of_left_ne (haiku, proved)

Left-permutivity proof: unfold rule30_eq on both rows, substitute fixed cells, then case-split on all Bool values of c(i-1) and d(i-1). When they match, contradiction with hl; when they differ, simp closes on each of the 4 subcases for d(i) and d(i+1). No served lemmas needed beyond Rule30.Basic. Pattern: for Bool permutivity lemmas, exhaustive case-splitting with simp cleanup is the direct route.

## 2026-09-07T16:15:54Z — rule30_leftPermutive (haiku, proved)

**rule30_leftPermutive (proved)**: Apply the one-step permutivity lemma to left edge. LeftPermutive unfolds to ∀ (c d : Config) (i : ℤ), window hypothesis → difference at i-1 → output differs. Extract c i = d i and c (i+1) = d (i+1) from the window via omega-provable inequalities, then exact rule30_ne_of_left_ne. No induction, no case splits — pure lemma threading and numeric inequalities.

## 2026-09-07T16:23:50Z — evolveFrom_leftPermutive (sonnet, proved)

evolveFrom_leftPermutive (sonnet, proved), first try, no dead ends.

**Route**: a strengthened invariant carried by induction on the step count `s ≤ t`: after `s` steps, `rule30^[s] c` and `rule30^[s] d` agree on the shrunken window `(i - t + s, i + t - s]` and differ at the single point `i - t + s`. At `s = 0` this is exactly the hypothesis; at `s = t` the difference point is `i - t + t = i`, exactly the goal. Proved as a `have key : ∀ s ≤ t, (window agreement) ∧ (difference at i-t+s)` inline inside the theorem, not a separate top-level lemma — matches the style `EvolvePeriodSub.lean` uses (a `have` carrying a pair through induction, rather than a `private lemma` needing all the outer variables re-threaded).

**Step case shape**, mirrors `agree_on_shrinking_window` (`EvolveFromEqOfAgreeOnWindow.lean`) for the agreement half and the diagonal-family proofs for the difference half:
- Agreement at `s+1`: `rw [Function.iterate_succ_apply', Function.iterate_succ_apply', rule30_eq, rule30_eq]` then three `have`s pulling `rule30^[n] c/d` agreement at `j-1, j, j+1` out of the `s = n` window (all provable by bare `omega` from `hj1 hj2 hs` in context — no cast massaging needed for *inequalities* feeding omega, only for terms that must *exactly match* a later `exact`).
- Difference at `s+1`: apply the served `rule30_ne_of_left_ne` (plain `Config`/`ℤ` arguments, no `LeftPermutive`-style `Nat`-radius cast to fight) at position `i - t + n + 1`, with the three neighbour facts (`hl0` via `hdf` after a `ring` index shift, `hc0`/`hr0` via `hag` with `omega`-proved bounds).

**The one place exact syntactic matching (not just `omega`) is unavoidable**: the final `exact rule30_ne_of_left_ne ... : rule30 (...) P ≠ rule30 (...) P` must match the *goal's* position term up to defeq, and the goal's own position is `i - t + ((n+1:ℕ):ℤ)` (cast-of-a-sum) while the induction hypothesis `hag`/`hdf` are stated with `(n:ℤ)`, a different but propositionally-equal term. `omega` cannot bridge this because the obligation is an equality of *terms* feeding `exact`, not a provable arithmetic proposition standing alone. Fix, copied verbatim from `EvolvePeriodSub.lean`'s established idiom: `rw [show i - (t:ℤ) + ((n+1:ℕ):ℤ) = i - (t:ℤ) + (n:ℤ) + 1 from by push_cast; ring]` directly on the goal *before* touching anything else, picking the RHS's left-associated `+ (n:ℤ) + 1` grouping and then reusing that exact grouping in every subsequent `have`'s stated type. `rw` finds the pattern reliably because `push_cast; ring` inside the `show ... from` proves the two full terms equal without needing the rewrite itself to guess associativity — the `rw` call only ever needs to match the *literal* LHS I wrote, which I chose to literally equal what elaboration produces from the induction (`i - ↑t + ↑(n+1)`, same operator-tree shape as `i - (t:ℤ) + ((n+1:ℕ):ℤ)`).

**General reusable rule for this whole codebase's induction-on-a-cast-index proofs**: `omega` alone suffices for any inequality goal touching Nat-cast sums (`↑(n+1)`), no `push_cast` needed. But the moment a step needs to hand a term to `exact`/`hag`/`hdf` whose *type* must match the goal exactly, reach for `rw [show <goal's literal cast form> = <convenient form> from by push_cast; ring]` first, and then keep every later `have` in that same convenient form. Import list `Rule30.Basic`, `Rule30.Proofs.Rule30NeOfLeftNe`, `Mathlib.Tactic.Ring` was sufficient — `push_cast` rode in on the `Ring` import as in every other P1 node that has needed it, no separate cast-tactic import required.

Axioms verified via the append-`#print axioms`-then-remove trick: `propext, Quot.sound`, no `Classical.choice` at all — same as `LeftDiagonalPeriodicFromStep`'s Bool-machine proofs, consistent with this being pure constructive index bookkeeping.

## 2026-09-07T16:29:23Z — window_count_half (opus, proved)

First counting node in P1 — no induction, no automaton content beyond one application of the served `evolveFrom_leftPermutive`. Two build cycles total.

**Shape.** `private def flipFirst {t} (w : Fin (2*t+1) → Bool) := fun k => if (k : ℕ) = 0 then !(w k) else w k`. Involutive by `funext k; by_cases h : (k:ℕ) = 0 <;> simp [flipFirst, h]`; injective from involutivity via `congrArg flipFirst` then `rwa [flipFirst_involutive, flipFirst_involutive]`. Then two `ofWindow` lemmas (agreement off the flipped position, difference at it), feed both into `evolveFrom_leftPermutive t _ _ 0`, get a Bool `≠`, turn it into an `↔ ¬` by `revert h; generalize <lhs> = a; generalize <rhs> = b; cases a <;> cases b <;> simp`. Counting is `Finset.card_filter_add_card_filter_not` plus `Finset.card_image_of_injective`.

**Index the flip by `(k : ℕ) = 0`, not by `k = (0 : Fin (2*t+1))`.** Using the `Fin` numeral would drag in `NeZero (2*t+1)` / `Fin.val_zero` bookkeeping for no gain. Writing the branch as `if (k:ℕ) = 0 then !(w k) else w k` — note `!(w k)`, not `!(w 0)` — means no `Fin` literal appears anywhere in the file and every side condition is a plain ℕ/ℤ fact `omega` can chew.

**THE GOTCHA: `omega` silently drops a hypothesis of the form `(⟨e, _⟩ : Fin n).val = 0`.** After `unfold ofWindow flipFirst; split_ifs with h1 h2`, the inner branch hypothesis is `h2 : (⟨(j + ↑t).toNat, _⟩ : Fin (2*t+1)).val = 0`. `omega` does not error on it — it just ignores it as a non-arithmetic atom and then fails on the remaining constraints, so the error message shows a counterexample over `j` and `↑t` alone with no hint that a hypothesis went missing. Fix is one line, using proof irrelevance + defeq of `Fin.val` on a `mk`:
```lean
have h3 : (j + (t : ℤ)).toNat = 0 := h2   -- or ¬ (… = 0) := h2 in the negated branch
omega
```
Restating the hypothesis at the reduced type is accepted by `exact`-level defeq and hands `omega` an `Int.toNat` it *does* special-case. **Generalise: when `omega` fails and the printed counterexample mentions fewer atoms than you have hypotheses, the missing hypothesis was dropped, not refuted — restate it at a type omega understands rather than looking for more arithmetic facts.** This is the same family as [[not-evolve-period-adjacent]]'s note that omega handles `Int.toNat` fine; the wrinkle is that it has to *see* the `toNat` and a `Fin.val` wrapper hides it.

**`unfold ofWindow flipFirst` then `split_ifs` is the whole `ofWindow` idiom.** `ofWindow` is a `dite` whose condition does not mention `w`, so the LHS and RHS of any `ofWindow w' i = ofWindow w i` goal share that condition and `split_ifs` splits it once, not twice. Goal order came out as (cond-true & inner-true), (cond-true & inner-false), (cond-false) — the two `rfl` branches close with bare `rfl` because the `Fin` mk proof terms differ only in proof and are defeq.

**Counting lemma names in this Mathlib snapshot** (checked by grep before writing, which saved a cycle):
- `Finset.card_filter_add_card_filter_not (p) [DecidablePred p] [∀ x, Decidable (¬ p x)] : #(s.filter p) + #(s.filter fun a ↦ ¬ p a) = #s`, with `s` implicit — pass it as `(s := Finset.univ)`. NOT `filter_card_add_filter_neg_card_eq_card`, which the brief named and which does not exist here.
- `Finset.card_image_of_injective (s) (H : Injective f) : #(s.image f) = #s`.
- `Fintype.card_pi_const (α) (n) : Fintype.card (Fin n → α) = Fintype.card α ^ n` — this is the one to use, NOT `Fintype.card_fun` (brief's suggestion, not present). It lives in `Mathlib.Data.Fintype.BigOperators`, which `Rule30.Basic` does not import; add it explicitly.

**Do NOT open the proof with `classical`.** `blackWindowCount` is a `Finset.filter` carrying the `Decidable` instance elaboration picked at its definition site; a `classical` in the proof introduces a *different* instance for the filter you build, and then the final `unfold blackWindowCount; omega` sees two atoms that print identically but do not unify. Letting `instDecidableEqBool` / `instDecidableNot` be found normally makes the goal's filter card and `hsum`'s filter card the same term and `omega` closes it. (Not learned the hard way here — avoided deliberately — but it is the obvious trap in any node that unfolds one of `Basic.lean`'s `noncomputable` counting defs.)

Final arithmetic: `have hpow : (2:ℕ)^(2*t+1) = 2^(2*t)*2 := pow_succ 2 (2*t)` then `omega` treats `2^(2*t)` as an atom and finishes. Same atom-hoisting idiom as [[isEventuallyPeriodic-of-periodic-step]]'s `hmul`.

Imports: `Rule30.Basic`, `Rule30.Proofs.EvolveFromLeftPermutive`, `Mathlib.Data.Fintype.BigOperators`, `Mathlib.Tactic`.

## 2026-09-07T20:01:48Z — column_succ_of_black (haiku, proved)

**boolean simplification pattern**: when a goal has xor with concrete boolean values (like true), simp closes it directly without needing to name the lemmas (xor_true, etc.) — feed the concrete values into simp and let it find the reductions. **sideways_inverse at i=0**: the lemma normalizes 0-1 and 0+1 automatically after simp; use `simp only [Int.zero_sub, Int.zero_add]` if you need to pin those down for later reasoning, but simp catches them anyway. **unfold column**: is transparently an alias for evolveFrom, so unfolding both on h and the goal from the start keeps the two synchronized and prevents index-matching errors later.

## 2026-09-07T20:03:00Z — centerColumn_succ_of_black (haiku, proved)

**Unfolding + served lemma pattern**: When a theorem is a special case of a served lemma with a specific instantiation (here, initialConfig as the starting row), unfold the definitions to expose the equivalence and apply the general lemma. Works when the unfoldings are definitional, making the goal match the served lemma's conclusion without additional rewrites. This is simpler than the `column_succ_of_black` proof itself because centerColumn is already defined in terms of evolveFrom, no row argument to thread through.

## 2026-09-07T20:09:05Z — evolveHalfRight_eq_column (sonnet, proved)

evolveHalfRight_eq_column (sonnet, proved), first attempt on this node — mirror of the still-unclosed evolveHalfLeft_eq_column, which was not yet in Rule30/Proofs so there was no sibling proof to crib the exact tactic shape from, only the definitions in Basic.lean.

**Route**: `induction t generalizing k with | zero => ... | succ t ih => rcases k with _ | k => ...`. Base case closes with `simp only [evolveHalfRight, column, evolveFrom, Function.iterate_zero_apply]` — no `rfl` needed even though it looks defeq; `simp only [defName]` on a pattern-matched def reliably invokes its equation lemmas regardless of whether the compiler used structural or well-founded recursion, so it's the safer default over `rfl`/`show` for these two-argument nested-match defs (`evolveHalfRight`/`evolveHalfLeft`/`leftSolve` all share this shape).

**Per-branch shape**: state a `have hRHS : column X <pos> (t+1) = xor (column X <pos-1> t) (column X <pos> t || column X <pos+1> t) := by unfold column; rw [evolveFrom_succ, rule30_eq]` — this is the RHS's own one-step unfold, proved once so the main line doesn't have to fight `column` twice. Then `simp only [evolveHalfRight, ih <args>, hRHS]` unfolds the LHS's matching branch and folds in the induction hypothesis at each of the recursion's own sub-indices, landing both sides as `xor _ (_ || _)` with mismatched-looking but propositionally-equal ℤ index arguments (casts of different ℕ shapes that both denote the same integer). Close with two `rw [show <goal's exact LHS arg-index> = <goal's exact other-side arg-index> from by push_cast]` (or `by push_cast; ring` when a variable `k` is involved) — `rw` auto-tries `rfl` afterward and closes it once both sides' index arguments are textually identical.

**THE GOTCHA, worth flagging loudly for whoever does the mirror (evolveHalfLeft_eq_column) or any other node with this exact shape**: for the literal-numeral branch (here, `k = 0`), `by push_cast; ring` inside a `rw [show ... from ...]` fails with "No goals to be solved" pointing *inside* the `by` block, not at the `rw` call — `push_cast` alone already normalizes `((0:ℕ):ℤ)+1-1` to `0` and closes the resulting `0 = 0` goal via its own trailing simp-closure, so the subsequent `ring` has nothing left and errors. Fix: use bare `by push_cast` (no `; ring`) for any bridging equation that's pure numerals; keep `; ring` only for the branch that has a genuine variable (`k`) needing associativity/commutativity rearranging, since there `push_cast` alone leaves a nontrivial goal for `ring` to close. Diagnosing this cost two build cycles — the error location (inside the `by` term, at the `ring` token) is the tell that push_cast already fully closed it, not that the rewrite itself is wrong.

Self-check via the append-`#print axioms`-then-remove trick (documented across many prior P1 nodes): `propext, Quot.sound`, no `Classical.choice` — pure constructive index bookkeeping, consistent with every other node in the arbitrary-row/half-line family.

Import list `Rule30.Basic`, `Mathlib.Tactic.Ring` sufficient — `push_cast` rode in on `Ring` as in every other node that's needed it.
