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
